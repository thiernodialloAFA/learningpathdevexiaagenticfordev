"""Tests are the specification for lab 01.

Delete service.py, re-implement it, and make these pass.
"""

from __future__ import annotations

import asyncio
from typing import AsyncIterator

import pytest

from lab01_chat_service.service import (
    ChatService,
    ProviderUnavailable,
    RateLimited,
    RetryPolicy,
    build_app,
    sse,
)


class FakeProvider:
    """A provider you fully control: no network, no key, no flakiness."""

    def __init__(
        self,
        tokens: list[str] | None = None,
        *,
        fail_times: int = 0,
        error: Exception | None = None,
        delay_per_token: float = 0.0,
    ) -> None:
        self.tokens = tokens or ["Hello", " ", "world"]
        self.fail_times = fail_times
        self.error = error or ProviderUnavailable()
        self.delay_per_token = delay_per_token
        self.calls = 0
        self.concurrent = 0
        self.max_concurrent = 0

    async def stream(self, prompt: str) -> AsyncIterator[str]:
        self.calls += 1
        self.concurrent += 1
        self.max_concurrent = max(self.max_concurrent, self.concurrent)
        try:
            if self.fail_times > 0:
                self.fail_times -= 1
                raise self.error
            for token in self.tokens:
                if self.delay_per_token:
                    await asyncio.sleep(self.delay_per_token)
                yield token
        finally:
            self.concurrent -= 1


async def collect(service: ChatService, prompt: str = "hi") -> list[str]:
    return [token async for token in service.stream(prompt)]


async def test_streams_tokens_in_order():
    service = ChatService(FakeProvider(["a", "b", "c"]))
    assert await collect(service) == ["a", "b", "c"]


async def test_records_time_to_first_token():
    service = ChatService(FakeProvider(["a", "b"], delay_per_token=0.01))
    await collect(service)
    assert len(service.metrics.time_to_first_token) == 1
    assert service.metrics.p95_ttft > 0


async def test_retries_transient_failures_then_succeeds():
    provider = FakeProvider(["ok"], fail_times=2)
    service = ChatService(provider, retry=RetryPolicy(max_attempts=3, base_delay=0.001))
    assert await collect(service) == ["ok"]
    assert provider.calls == 3
    assert service.metrics.retries == 2


async def test_gives_up_after_the_attempt_budget():
    provider = FakeProvider(fail_times=99)
    service = ChatService(provider, retry=RetryPolicy(max_attempts=3, base_delay=0.001))
    with pytest.raises(ProviderUnavailable):
        await collect(service)
    assert provider.calls == 3


async def test_honours_retry_after_over_computed_backoff():
    policy = RetryPolicy(base_delay=10.0, max_delay=30.0)
    assert policy.delay_for(attempt=5, retry_after=0.25) == 0.25


async def test_backoff_is_jittered_and_bounded():
    policy = RetryPolicy(base_delay=0.1, max_delay=1.0)
    delays = {policy.delay_for(attempt=3) for _ in range(50)}
    assert len(delays) > 1, "a retry storm needs jitter, not a constant delay"
    assert all(0 <= d <= 1.0 for d in delays)


async def test_rate_limit_is_retried_like_any_transient_error():
    provider = FakeProvider(["ok"], fail_times=1, error=RateLimited(retry_after=0.001))
    service = ChatService(provider, retry=RetryPolicy(max_attempts=2, base_delay=0.001))
    assert await collect(service) == ["ok"]


async def test_timeout_applies_to_the_whole_stream():
    provider = FakeProvider(["a"] * 50, delay_per_token=0.02)
    service = ChatService(
        provider, timeout=0.05, retry=RetryPolicy(max_attempts=1, base_delay=0.001)
    )
    with pytest.raises(asyncio.TimeoutError):
        await collect(service)
    assert service.metrics.timeouts == 1


async def test_never_replays_a_stream_that_already_emitted_tokens():
    """Retrying after the first token would duplicate output for the user."""

    class HalfFailing:
        calls = 0

        async def stream(self, prompt: str):
            HalfFailing.calls += 1
            yield "partial"
            raise ProviderUnavailable()

    service = ChatService(HalfFailing(), retry=RetryPolicy(max_attempts=3, base_delay=0.001))
    received = []
    with pytest.raises(ProviderUnavailable):
        async for token in service.stream("hi"):
            received.append(token)
    assert received == ["partial"]
    assert HalfFailing.calls == 1


async def test_concurrency_is_bounded_by_the_semaphore():
    provider = FakeProvider(["a"], delay_per_token=0.02)
    service = ChatService(provider, max_concurrency=3)
    await asyncio.gather(*(collect(service) for _ in range(12)))
    assert provider.max_concurrent <= 3


def test_sse_frames_are_well_formed():
    assert sse('{"token":"a"}') == 'data: {"token":"a"}\n\n'
    assert sse("{}", event="done") == "event: done\ndata: {}\n\n"


def test_http_endpoint_streams_and_echoes_correlation_id():
    from fastapi.testclient import TestClient

    service = ChatService(FakeProvider(["Bon", "jour"]))
    client = TestClient(build_app(service))

    response = client.post(
        "/chat", json={"prompt": "salut"}, headers={"X-Correlation-Id": "abc-123"}
    )
    assert response.status_code == 200
    assert response.headers["x-correlation-id"] == "abc-123"
    assert '"token": "Bon"' in response.text
    assert "event: done" in response.text


def test_http_endpoint_rejects_an_empty_prompt():
    from fastapi.testclient import TestClient

    client = TestClient(build_app(ChatService(FakeProvider())))
    assert client.post("/chat", json={"prompt": "   "}).status_code == 400


def test_http_endpoint_reports_upstream_timeout_as_an_sse_error():
    from fastapi.testclient import TestClient

    provider = FakeProvider(["a"] * 50, delay_per_token=0.02)
    service = ChatService(
        provider, timeout=0.05, retry=RetryPolicy(max_attempts=1, base_delay=0.001)
    )
    client = TestClient(build_app(service))
    response = client.post("/chat", json={"prompt": "hi"})
    assert "upstream_timeout" in response.text

