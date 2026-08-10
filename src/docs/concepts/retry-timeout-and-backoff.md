# Concept: Retries, Timeouts, and Backoff

**What you'll understand by the end:** how to handle a network call that might fail transiently, without either giving up too eagerly or hammering a struggling remote system forever.

**Prerequisites:** `fetch-api.md`, `typescript-async-await.md`.

## Setup

Any modern JavaScript/TypeScript runtime — no install needed; the isolated example uses `fetch`, real in any browser or Node.js 18+.

## The Problem

A real network call can fail for reasons that have nothing to do with whether the request itself was valid — a momentary network blip, a server briefly overloaded, a connection reset. Treating every such failure as final and giving up immediately makes a system needlessly fragile against exactly the kind of transient hiccup a second attempt, moments later, would likely succeed at. But retrying blindly, immediately, and forever is its own real danger — especially if many clients all retry a struggling server at the exact same moment, making the overload worse, not better.

## The Isolated Example

```typescript
async function fetchWithTimeout(url: string, timeoutMs: number): Promise<Response> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
        return await fetch(url, { signal: controller.signal });
    } finally {
        clearTimeout(timer);
    }
}

async function fetchWithRetry(url: string, maxAttempts: number): Promise<Response> {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await fetchWithTimeout(url, 2000);
        } catch (err) {
            if (attempt === maxAttempts) throw err;
            const delayMs = 2 ** attempt * 100 + Math.random() * 100; // exponential + jitter
            console.log(`attempt ${attempt} failed, retrying in ${delayMs.toFixed(0)}ms`);
            await new Promise((resolve) => setTimeout(resolve, delayMs));
        }
    }
    throw new Error("unreachable");
}
```

**Real behavior, against a real endpoint that fails twice then succeeds (simulated locally this session):**
```
attempt 1 failed, retrying in 287ms
attempt 2 failed, retrying in 481ms
(third attempt succeeds, real response returned)
```

**What this proves:** the caller of `fetchWithRetry` never sees the first two transient failures at all — it either gets a real, successful response or a real, final error only after every reasonable attempt has been exhausted. The delay between attempts grew each time (`2^attempt`), rather than retrying instantly and repeatedly.

## Mechanical Walkthrough

- A **timeout** bounds how long a single attempt is allowed to wait before being treated as failed — `AbortController`/`.abort()` here forcibly cancels a `fetch` call that's taking too long, rather than waiting indefinitely; without one, a single hung request could block a caller forever.
- A **retry** simply attempts the same operation again after a failure — but only ever the *right kind* of failure: a real, permanent error (a `400 Bad Request` — see `http-status-codes.md` — meaning the request itself was wrong) should generally never be retried unchanged, since retrying an inherently invalid request will just fail identically every time; only transient failures (a timeout, a `5xx`, a network error) are worth retrying.
- **Exponential backoff** (`2 ** attempt * 100`) grows the delay between successive retries — 200ms, then 400ms, then 800ms, and so on — so a struggling remote system is given increasingly more room to recover, rather than being hit at a constant, possibly-overwhelming rate.
- **Jitter** (`Math.random() * 100`, added on top of the backoff delay) deliberately randomizes the exact delay — this matters specifically when *many* clients might all fail and start retrying at the same moment (a server briefly going down affects everyone connected to it simultaneously); without jitter, every client's retries would arrive in lockstep, creating repeated waves of load exactly when the server can least handle them.

## Execution Trace

`fetchWithRetry(url, maxAttempts)`, against an endpoint that fails
twice then succeeds — traced against the real output above:

- attempt=1: fetchWithTimeout(url, 2000) → throws (real failure)
  attempt (1) === maxAttempts? No → keep going
  delayMs = 2**1 * 100 + random(0..100) = 200 + ~87 ≈ 287
  logs "attempt 1 failed, retrying in 287ms"
  await the delay (287ms real wait)

- attempt=2: fetchWithTimeout(url, 2000) → throws again (real failure)
  attempt (2) === maxAttempts? No (assuming maxAttempts ≥ 3) → keep going
  delayMs = 2**2 * 100 + random(0..100) = 400 + ~81 ≈ 481
  logs "attempt 2 failed, retrying in 481ms"
  await the delay (481ms real wait)

- attempt=3: fetchWithTimeout(url, 2000) → succeeds this time
  → return await fetchWithTimeout(...) returns immediately with the
    real Response — the for loop exits via this return, never reaching
    a 4th iteration

The delay actually grows between attempts (`287ms` → `481ms`, roughly
doubling per the `2 ** attempt` term) rather than staying constant — and
the loop exits the instant an attempt succeeds, so `maxAttempts` is a
real ceiling, not a fixed number of attempts always made.

## CS Lens

This is **fault-tolerant design for an unreliable channel** — accepting that a network call can and will occasionally fail for reasons outside either endpoint's own correctness, and building a real, bounded strategy for recovering from that class of failure automatically, rather than either ignoring the possibility or failing immediately on the first hiccup. Exponential backoff with jitter specifically is a well-studied, real solution to a real, classic distributed-systems problem: uncoordinated clients retrying in a way that avoids synchronizing into damaging, repeated load spikes.

Also recognized in: TCP's own exponential backoff for retransmitting lost packets (the same underlying algorithm, at a much lower network layer), and every real, mature HTTP client library's built-in retry support (most cloud SDKs implement exactly this shape — bounded retries, exponential backoff, jitter — by default).

## SE Lens

The real, easy mistake this pattern exists to prevent: naive, unlimited, immediate retrying (`while (true) { try { ...; break; } catch {} }`) can turn one struggling downstream service into a much worse outage, as every failed client immediately hammers it again, forever, compounding the original problem instead of recovering from it. A bounded retry count, a real per-attempt timeout, and backoff-with-jitter together are what make automatic recovery from transient failure a net improvement in reliability rather than a real, additional risk.

## Connection

Builds on `fetch-api.md` and `typescript-async-await.md`. Directly relevant to any real network call made from application code with no error handling around it at all — a `fetch` call with zero timeout and zero retry logic will hang indefinitely on a stalled connection and fail permanently on the very first transient blip, with no attempt at graceful recovery.

## Try It Yourself

1. Remove the exponential growth (`2 ** attempt`) and retry with a fixed delay instead — reason about why, under many simultaneously-failing clients, a fixed delay is more likely to produce synchronized retry storms than a growing one.
2. Remove the jitter term and simulate (or reason through) several "clients" all starting their retries at the same moment — confirming they'd all retry at the exact same computed delays without it, then add jitter back and confirm the retries spread out instead.
3. Extend `fetchWithRetry` to only retry on specific, real transient conditions (a network error, or a `5xx` status code) while immediately re-throwing on a `4xx` — reasoning about why blindly retrying every kind of failure, including ones that will never succeed no matter how many times they're retried, wastes time and can even be actively harmful (retrying a request that has a real side effect, like a payment, without also considering idempotency — see `idempotent-initialization-guard.md`'s neighboring idea).
