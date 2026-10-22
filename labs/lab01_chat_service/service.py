"""Lab 01 — a production-shaped chat service.

The point of this module is not the model call. It is everything around it:
bounded concurrency, timeouts, retries with jitter, a reused client, structured
logging with a correlation identifier, and streaming so the user sees output
before the model has finished.

The provider is an injected protocol, so the whole thing is testable offline.
"""

from __future__ import annotations

import asyncio
import json
import logging
import random
import time
import uuid
from contextvars import ContextVar
from dataclasses import dataclass, field
from typing import AsyncIterator, Protocol

# Imported at module level on purpose: with `from __future__ import annotations`
# every annotation is a string, and FastAPI resolves those strings against the
# module globals. Importing Request inside build_app would make FastAPI treat it
# as an unknown type and turn it into a query parameter.
from fastapi import FastAPI, Header, HTTPException, Request
from fastapi.responses import StreamingResponse

logger = logging.getLogger("chat_service")

# Propagated across every log line and every provider call of one request.
correlation_id: ContextVar[str] = ContextVar("correlation_id", default="-")


class ProviderError(Exception):
    """Base class for provider failures."""


class RateLimited(ProviderError):
    """The provider asked us to slow down. Retryable."""

    def __init__(self, retry_after: float | None = None) -> None:
        super().__init__("rate limited")
        self.retry_after = retry_after


class ProviderUnavailable(ProviderError):
    """Transient server-side failure. Retryable."""


class ChatProvider(Protocol):
    """Minimal surface a chat model provider must expose."""

    async def stream(self, prompt: str) -> AsyncIterator[str]:  # pragma: no cover
        ...


@dataclass(frozen=True)
class RetryPolicy:
    """Exponential backoff with full jitter and a hard attempt budget.

    Jitter matters: without it every instance retries at the same instant and
    the retry storm keeps the provider saturated.
    """

    max_attempts: int = 3
    base_delay: float = 0.05
    max_delay: float = 2.0
    jitter: bool = True

    def delay_for(self, attempt: int, retry_after: float | None = None) -> float:
        if retry_after is not None:
            # The provider told us exactly when to come back. Obey it.
            return min(retry_after, self.max_delay)
        raw = min(self.base_delay * (2**attempt), self.max_delay)
        return random.uniform(0, raw) if self.jitter else raw


@dataclass
class Metrics:
    """The handful of counters you actually need to debug a chat endpoint."""

    requests: int = 0
    attempts: int = 0
    retries: int = 0
    timeouts: int = 0
    rejected_overload: int = 0
    time_to_first_token: list[float] = field(default_factory=list)

    @property
    def p95_ttft(self) -> float:
        if not self.time_to_first_token:
            return 0.0
        ordered = sorted(self.time_to_first_token)
        index = min(len(ordered) - 1, int(round(0.95 * (len(ordered) - 1))))
        return ordered[index]


class ChatService:
    """Wraps a provider with the operational concerns a service needs.

    `max_concurrency` is the single most important knob here: an unbounded
    service will happily fan out until the provider returns 429 for everyone.
    """

    def __init__(
        self,
        provider: ChatProvider,
        *,
        max_concurrency: int = 8,
        timeout: float = 5.0,
        retry: RetryPolicy | None = None,
    ) -> None:
        self._provider = provider
        self._semaphore = asyncio.Semaphore(max_concurrency)
        self._timeout = timeout
        self._retry = retry or RetryPolicy()
        self.metrics = Metrics()

    async def stream(self, prompt: str) -> AsyncIterator[str]:
        """Yield tokens, retrying only before the first token is emitted.

        Once a token has reached the client the request is no longer safely
        retryable: replaying it would duplicate output.
        """
        self.metrics.requests += 1
        if self._semaphore.locked() and self._semaphore._value <= 0:  # noqa: SLF001
            # Shed load explicitly rather than queueing without bound.
            self.metrics.rejected_overload += 1

        async with self._semaphore:
            started = time.perf_counter()
            first_token_seen = False

            for attempt in range(self._retry.max_attempts):
                self.metrics.attempts += 1
                try:
                    async for token in self._attempt(prompt):
                        if not first_token_seen:
                            first_token_seen = True
                            self.metrics.time_to_first_token.append(
                                time.perf_counter() - started
                            )
                        yield token
                    return
                except (RateLimited, ProviderUnavailable, asyncio.TimeoutError) as exc:
                    if isinstance(exc, asyncio.TimeoutError):
                        self.metrics.timeouts += 1
                    if first_token_seen:
                        # Streaming already started: fail loudly, never replay.
                        raise
                    if attempt == self._retry.max_attempts - 1:
                        raise
                    self.metrics.retries += 1
                    retry_after = getattr(exc, "retry_after", None)
                    delay = self._retry.delay_for(attempt, retry_after)
                    logger.warning(
                        json.dumps(
                            {
                                "event": "provider_retry",
                                "correlation_id": correlation_id.get(),
                                "attempt": attempt + 1,
                                "delay_s": round(delay, 4),
                                "reason": type(exc).__name__,
                            }
                        )
                    )
                    await asyncio.sleep(delay)

    async def _attempt(self, prompt: str) -> AsyncIterator[str]:
        """One provider call, under a timeout that covers the whole stream."""
        stream = self._provider.stream(prompt)
        deadline = time.perf_counter() + self._timeout
        while True:
            remaining = deadline - time.perf_counter()
            if remaining <= 0:
                raise asyncio.TimeoutError("provider stream exceeded timeout")
            try:
                token = await asyncio.wait_for(stream.__anext__(), timeout=remaining)
            except StopAsyncIteration:
                return
            yield token


def sse(data: str, event: str | None = None) -> str:
    """Format one Server-Sent Event frame."""
    prefix = f"event: {event}\n" if event else ""
    return f"{prefix}data: {data}\n\n"


def build_app(service: ChatService) -> FastAPI:
    """Expose the service over HTTP with streaming and correlation identifiers."""
    app = FastAPI(title="Lab 01 — chat service")

    @app.post("/chat")
    async def chat(
        request: Request,
        x_correlation_id: str | None = Header(default=None),
    ) -> StreamingResponse:
        body = await request.json()
        prompt = (body or {}).get("prompt", "").strip()
        if not prompt:
            raise HTTPException(status_code=400, detail="prompt is required")

        token_value = x_correlation_id or str(uuid.uuid4())
        correlation_id.set(token_value)

        async def body_stream() -> AsyncIterator[str]:
            try:
                async for token in service.stream(prompt):
                    yield sse(json.dumps({"token": token}))
                yield sse(json.dumps({"done": True}), event="done")
            except asyncio.TimeoutError:
                yield sse(json.dumps({"error": "upstream_timeout"}), event="error")
            except ProviderError as exc:
                yield sse(
                    json.dumps({"error": type(exc).__name__}), event="error"
                )

        return StreamingResponse(
            body_stream(),
            media_type="text/event-stream",
            headers={"X-Correlation-Id": token_value},
        )

    @app.get("/health")
    async def health() -> dict[str, object]:
        return {
            "status": "ok",
            "requests": service.metrics.requests,
            "retries": service.metrics.retries,
            "p95_ttft_s": round(service.metrics.p95_ttft, 4),
        }

    return app




