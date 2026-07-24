# Lesson 32: How Many Times Are You Allowed to Ask?

## What you will build

Lesson 31's reverse proxy, extended so it refuses to forward a client's
request once that client has made too many requests too quickly —
answering with `429 Too Many Requests` instead of reaching the backend at
all. The transferable problem this lesson is actually about: deciding
"is this allowed right now?" when the answer depends on *history* (what
has this same client already done recently), not just on the current
request in isolation — and doing that decision cheaply, per-request,
without keeping an ever-growing log of everything that ever happened.

## What you need to know first

- **Lesson 31** — the reverse proxy this lesson extends directly:
  `handle_client`, `choose_backend`, `parse_request_line_and_headers`,
  `relay`. Today's code is a delta against that file, not a rewrite.
- **Lesson 20 / Lesson 30** — a dictionary shared across client threads
  needs a `threading.Lock` around any read-modify-write on it. Reused
  here unchanged.
- **Lesson 18** — `client_address` is the `(host, port)` tuple `accept()`
  already returns; today's rate limiter keys off `client_address[0]`,
  exactly as Lesson 31's `X-Forwarded-For` header did.

---

## The Problem, in prose, no code yet

Lesson 31's proxy forwards every request it receives, as fast as it can
receive them. That's fine for the two-request test in that lesson, but a
real backend has finite capacity — and a single client, whether through a
bug, a retry loop gone wrong, or a deliberate attack, can send requests
far faster than any backend can handle. The reverse proxy is exactly the
right place to stop that, because every request already passes through
it before reaching a backend at all — Lesson 31's own "what's next"
section named this directly.

The interesting part isn't the refusal itself; it's *deciding when to
refuse*. "Allow at most 3 requests" is meaningless without also asking
"per what — ever? per second? per minute?" and "what happens to that
allowance over time — does it come back?" Today's lesson answers those
questions with a specific, real algorithm: the token bucket.

---

## Concept Unit: Measuring Elapsed Time Correctly

### The Problem

Any rate limiter needs to know how much time has passed since the last
request — but `time.time()`, if it ever appeared in this curriculum so
far, returns the wall-clock time (what a clock on the wall would read),
and wall clocks can jump: a system clock sync (NTP), a manual clock
change, or daylight saving adjustments can all make `time.time()` report
a value *smaller* than a previous reading. A rate limiter computing
`elapsed = now - last_time` with a clock that can go backwards could
compute a negative elapsed time, which makes no physical sense and would
corrupt every calculation built on top of it.

### Introduce the concept in isolation

```python
import time

start_monotonic = time.monotonic()
start_wall_clock = time.time()

print("monotonic start:", start_monotonic)
print("wall clock start:", start_wall_clock)

time.sleep(0.2)

elapsed_monotonic = time.monotonic() - start_monotonic
elapsed_wall_clock = time.time() - start_wall_clock

print("elapsed via monotonic:", elapsed_monotonic)
print("elapsed via wall clock:", elapsed_wall_clock)
```

Run it:

```
monotonic start: 107.801700365
wall clock start: 1784888116.6452959
elapsed via monotonic: 0.20262558499999272
elapsed via wall clock: 0.20262885093688965
```

What this proves: `time.monotonic()`'s return value (**first
appearance**) is not a real-world timestamp at all — `107.8` means
nothing on its own, unlike `time.time()`'s `1784888116.6`, which is
seconds since January 1, 1970. `time.monotonic()`'s value is only
meaningful as a *difference* between two readings taken on the same
running program, which is exactly the use this lesson has for it: not
"what time is it," but "how much time has elapsed." Both calls happened
to agree closely here (`0.2026` seconds either way), because nothing
adjusted the system clock during this brief sleep — but only
`time.monotonic()` is *guaranteed* never to go backwards, by the
operating system's own contract, regardless of what happens to the wall
clock while the program runs.

This lab is deleted now; it never appears in the project. The choice —
`time.monotonic()`, not `time.time()` — is what survives.

### CS Lens

This is the distinction between a **timestamp** (an absolute point
anchored to a shared reference — the Unix epoch) and a **monotonic
clock** (a value that only ever increases, with no meaningful absolute
anchor at all) — two different abstractions that happen to share units
(seconds) but answer different questions.

Also recognized in: `System.nanoTime()` in Java, `performance.now()` in
browser JavaScript, database systems using logical clocks (Lamport
timestamps) instead of wall time to order events across machines whose
clocks can't be perfectly synchronized.

### SE Lens

The alternative — using `time.time()` throughout — would work correctly
essentially all the time, which is precisely what makes it a dangerous
choice: a bug caused by a backward clock jump would be rare, intermittent,
and nearly impossible to reproduce on demand, the worst kind of bug to
debug in a live system. Paying the tiny cost of learning a second,
purpose-specific time function up front removes an entire category of bug
before it can exist, rather than relying on it simply not happening to
occur during testing.

---

## Concept Unit: The Token Bucket

### The Problem

"Allow 3 requests" needs a concrete rule for what happens next. A rule
like "3 requests per minute, reset every 60 seconds" is simple but has an
awkward edge: a client that used up its 3 requests in the first second of
a minute is completely blocked for the remaining 59 seconds, then
suddenly gets a fresh burst of 3 all at once the instant the minute rolls
over — bursty and unfair to whichever client's timing happens to line up
badly. A token bucket instead lets allowance trickle back continuously,
proportional to elapsed time, rather than resetting in one lump.

### Introduce the concept in isolation

```python
import time

class Bucket:
    def __init__(self, capacity, refill_rate_per_second):
        self.capacity = capacity
        self.refill_rate_per_second = refill_rate_per_second
        self.tokens = capacity
        self.last_refill_time = time.monotonic()

    def try_consume(self):
        now = time.monotonic()
        elapsed_seconds = now - self.last_refill_time
        self.tokens = min(self.capacity, self.tokens + elapsed_seconds * self.refill_rate_per_second)
        self.last_refill_time = now

        if self.tokens >= 1:
            self.tokens -= 1
            return True
        return False

bucket = Bucket(capacity=3, refill_rate_per_second=1)

for attempt_number in range(1, 6):
    allowed = bucket.try_consume()
    print(f"attempt {attempt_number}: allowed={allowed}, tokens left={bucket.tokens:.2f}")

print("waiting 1 second for refill...")
time.sleep(1)
allowed = bucket.try_consume()
print(f"attempt 6 (after wait): allowed={allowed}, tokens left={bucket.tokens:.2f}")
```

Run it:

```
attempt 1: allowed=True, tokens left=2.00
attempt 2: allowed=True, tokens left=1.00
attempt 3: allowed=True, tokens left=0.00
attempt 4: allowed=False, tokens left=0.00
attempt 5: allowed=False, tokens left=0.00
waiting 1 second for refill...
attempt 6 (after wait): allowed=True, tokens left=0.00
```

### Execution Trace

```
attempt 1: tokens 3.00 → elapsed≈0 → refill+0.00 → 3.00 → consume 1 → 2.00, allowed
attempt 2: tokens 2.00 → elapsed≈0 → refill+0.00 → 2.00 → consume 1 → 1.00, allowed
attempt 3: tokens 1.00 → elapsed≈0 → refill+0.00 → 1.00 → consume 1 → 0.00, allowed
attempt 4: tokens 0.00 → elapsed≈0 → refill+0.00 → 0.00 → below 1, denied
attempt 5: tokens 0.00 → elapsed≈0 → refill+0.00 → 0.00 → below 1, denied
[sleep 1.0 second]
attempt 6: tokens 0.00 → elapsed≈1.0 → refill+1.0×1=1.0 → 1.00 → consume 1 → 0.00, allowed
```

What the output proves: three requests succeed immediately (the bucket
started full, at `capacity=3`), the fourth and fifth are denied
immediately (no time passed between attempts 3, 4, and 5, so no tokens
had refilled), and after genuinely waiting 1 real second, exactly one
more request is allowed — because `refill_rate_per_second=1` means
exactly 1 token regrows per second, matching the 1-second wait precisely.

This lab is deleted now; it never appears in the project under the name
`Bucket`. Its logic survives, applied next to the real proxy under a more
specific name.

### CS Lens

This is the **token bucket algorithm** by name — a standard rate-limiting
and traffic-shaping technique. `tokens` is bounded state that represents
accumulated "permission," `try_consume` is the only operation allowed to
spend it, and refilling is computed lazily (only when `try_consume` is
called) rather than by a background timer constantly ticking — an
important detail: the bucket doesn't need a thread or a loop running at
all times to "know" how full it is; it just computes elapsed time
whenever someone asks.

Also recognized in: network router traffic shaping (this exact algorithm,
by this exact name, in networking hardware), AWS API Gateway and most
cloud provider API throttling, the Linux kernel's own traffic control
(`tc`) subsystem, elevator and traffic-light timing systems that need to
smooth bursty demand rather than serve it all at once.

### SE Lens

The alternative — a **fixed window counter** (count requests, reset the
count to zero every N seconds on a clock boundary) — is simpler to
implement and reason about, but has exactly the edge case named above: a
client can burst up to double its limit by timing requests around a
window boundary (near-max requests just before reset, then near-max again
just after). A token bucket costs a little more per-request arithmetic
(the refill calculation) in exchange for smoothing that edge case away
entirely — no window boundaries exist for a client to exploit, since
allowance flows continuously rather than resetting all at once.

---

## Concept Unit: One Bucket Per Client

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `reverse_proxy.py` from Lesson 31 (this lesson's
  copy is named `rate_limited_proxy.py` to keep both lessons' files
  independently runnable, but every function below Lesson 31's own code
  is unchanged).
- **Change type:** add.
- **Location:** above `choose_backend`, alongside the existing
  `ROUTING_TABLE` constant.
- **Dependencies:** `threading.Lock`, already imported in Lesson 31.

The lab's `Bucket` used a domain-irrelevant name on purpose, per the
Concept Isolation Rule — but this is one of the cases that rule names
explicitly as an exception: the entire point of that lab was the exact
type this project needs. The production version below is the same class,
renamed `TokenBucket` for clarity now that it's staying, with one bucket
created per distinct client IP address rather than the single shared
bucket the lab used.

### The New Code

```python
RATE_LIMIT_CAPACITY = 3
RATE_LIMIT_REFILL_PER_SECOND = 1


class TokenBucket:
    def __init__(self, capacity, refill_rate_per_second):
        self.capacity = capacity
        self.refill_rate_per_second = refill_rate_per_second
        self.tokens = capacity
        self.last_refill_time = time.monotonic()

    def try_consume(self):
        now = time.monotonic()
        elapsed_seconds = now - self.last_refill_time
        self.tokens = min(
            self.capacity, self.tokens + elapsed_seconds * self.refill_rate_per_second
        )
        self.last_refill_time = now

        if self.tokens >= 1:
            self.tokens -= 1
            return True
        return False


client_buckets = {}
client_buckets_lock = threading.Lock()


def is_request_allowed(client_ip):
    with client_buckets_lock:
        if client_ip not in client_buckets:
            client_buckets[client_ip] = TokenBucket(
                RATE_LIMIT_CAPACITY, RATE_LIMIT_REFILL_PER_SECOND
            )
        bucket = client_buckets[client_ip]
        return bucket.try_consume()
```

### The Updated Project

New top-level definitions with nothing surrounding them yet — Project
Change above already states exactly where they land relative to Lesson
31's existing `ROUTING_TABLE`.

### Mechanical Walkthrough

- `RATE_LIMIT_CAPACITY` / `RATE_LIMIT_REFILL_PER_SECOND` — plain module
  constants, reused syntax, named in capitals per the convention this
  curriculum has used for constants since early lessons.
- `class TokenBucket:` and its body — identical logic to the lab's
  `Bucket`, so no new walkthrough owed per the Repetition Rule; only the
  name changed.
- `client_buckets = {}` — an ordinary `dict`, this time mapping a client
  IP address (`str`) to that client's own `TokenBucket` instance — the
  key structural decision this unit adds: Lesson 31's `ROUTING_TABLE` was
  one fixed dictionary built once; `client_buckets` starts empty and
  *grows* as new clients are seen.
- `client_buckets_lock = threading.Lock()` — a **hard concept
  reappearing**: the exact same shared-mutable-state protection Lesson
  20 used for `connected_clients` and Lesson 30 used for
  `connected_clients` again — necessary here because two different
  client threads could both check `if client_ip not in client_buckets`
  at nearly the same instant for a brand-new IP and both decide to create
  a bucket, silently overwriting one client's freshly-consumed token
  count with a second, fresh bucket.
- `if client_ip not in client_buckets: client_buckets[client_ip] = ...` —
  **lazy initialization**, a pattern with no prior name in this
  curriculum: rather than pre-creating a bucket for every possible client
  up front (impossible — there's no way to know every IP that might ever
  connect), a bucket is created the first time, and only the first time,
  a given client is actually seen.
- `return bucket.try_consume()` — delegates the actual decision to the
  method already proven correct in isolation above.

### CS Lens

This is a **per-key rate limiter** built from a **registry** (a
dictionary mapping an identity to that identity's own piece of state) —
combined with the lazy-initialization pattern named above.

Also recognized in: per-user database connection pools, per-session
shopping carts in an e-commerce backend, per-device push-notification
throttling.

### SE Lens

A single shared `TokenBucket` for every client (what the lab used) would
mean one aggressive client exhausts the allowance for every other client
too — clearly wrong for a real API. Keying by IP fixes that, at a
real, honestly-named cost: `client_buckets` never shrinks in this
implementation. A client that connects once and never returns leaves its
`TokenBucket` in memory forever. A production rate limiter needs an
eviction strategy (an expiry timestamp, an LRU cache like the one
previewed in this curriculum's Track 10) to bound memory use — named here
as real debt, not solved by this lesson, since solving it needs a concept
(LRU eviction) this curriculum hasn't taught yet.

---

## Concept Unit: Answering With 429

### Project Change

- **Reference Source:** No reference counterpart — the `429 Too Many
  Requests` status code and `Retry-After` header are both defined in RFC
  6585 and RFC 7231 respectively.
- **Files affected:** `rate_limited_proxy.py`.
- **Change type:** add.
- **Location:** below `is_request_allowed`.

### The New Code

```python
def build_rate_limit_response():
    body = "Too Many Requests"
    return (
        "HTTP/1.1 429 Too Many Requests\r\n"
        f"Content-Length: {len(body)}\r\n"
        "Retry-After: 1\r\n"
        "Connection: close\r\n"
        "\r\n"
        f"{body}"
    ).encode("utf-8")
```

### Mechanical Walkthrough

- `"HTTP/1.1 429 Too Many Requests\r\n"` — **first appearance of this
  status code.** `429` is the HTTP status class `4xx` (client error,
  already familiar from earlier lessons' `404`s) specifically meaning
  "you, the client, have sent too many requests in a given time" — as
  opposed to `403 Forbidden` (you're not allowed to access this at all,
  regardless of timing) or `401 Unauthorized` (you haven't proven who you
  are), both different problems this status code is not for.
- `"Retry-After: 1\r\n"` — **first appearance.** A header telling the
  client, in seconds, roughly how long to wait before trying again — `1`
  here because `RATE_LIMIT_REFILL_PER_SECOND = 1` means one token
  reliably exists again after about one second. A well-behaved client
  reads this header instead of guessing when to retry.
- The rest — `Content-Length`, `Connection: close`, string formatting,
  `.encode()` — all **hard concepts reappearing**, unchanged from Lesson
  31's `build_forwarded_request` and every response-building lesson
  before it.

### CS Lens

This is the proxy communicating a **backpressure signal** — telling an
upstream caller "slow down," rather than either silently dropping the
request or accepting it and failing internally. Making the failure
explicit and machine-readable (a specific status code and a header
telling the client exactly how long to wait) is what lets a well-written
client recover automatically instead of a person having to notice and
intervene.

Also recognized in: TCP's own flow control (a receiver telling a sender
to slow down at the transport layer), Unix pipe backpressure (a slow
reader stalls a fast writer's `write()` calls automatically), Kafka
consumer lag signaling.

### SE Lens

Returning a specific status code plus a specific header is a form of
**API contract**: any client, in any language, that knows the general
shape of HTTP already knows what `429` and `Retry-After` mean, without
this project needing to publish separate documentation for its own custom
error format. The alternative — silently closing the connection with no
response at all when a client is rate-limited — is technically simpler
but leaves the client with no way to distinguish "you're going too fast"
from "the server crashed," which is a much worse failure mode to debug on
the client's side.

---

## Concept Unit: Draining Before You Close

### The Problem

The obvious place to add the rate-limit check felt like the very top of
`handle_client`, before even reading the client's request — reject fast,
do no unnecessary work. That was tried first while building this lesson,
and it broke in a way worth showing directly rather than skipping past.

### The New Code (the version that was tried first, and why it failed)

```python
def handle_client(client_socket, client_address):
    if not is_request_allowed(client_address[0]):
        client_socket.sendall(build_rate_limit_response())
        client_socket.close()
        return
    request_bytes = client_socket.recv(4096)
    # ...
```

### Run it

Six requests sent back-to-back against this version:

```
request 1: HTTP/1.1 200 OK
request 2: HTTP/1.1 200 OK
request 3: HTTP/1.1 200 OK
Traceback (most recent call last):
  File "test_client.py", line 16, in <module>
    chunk = client_socket.recv(4096)
ConnectionResetError: [Errno 104] Connection reset by peer
```

The fourth request — the first one that should have been denied — never
even got to print its `429`. The client's own `recv()` call blew up
instead.

### What actually happened

The test client always sends its full request text and *then* calls
`recv()` to read the reply — it never waits for permission before
sending. So by the time this version of `handle_client` checks
`is_request_allowed` and decides to reject, the client's request bytes
are already sitting in the operating system's receive buffer for
`client_socket`, completely unread, because this code path never calls
`client_socket.recv()` at all before closing. Closing a socket on Linux
while unread bytes remain in its receive buffer makes the operating
system send a **TCP RST** (reset) instead of a normal graceful close —
and a RST tells the other side "this connection is being torn down
abnormally; discard anything you thought you were about to receive,"
which is why the client's `recv()` raised an exception instead of
returning the `429` response that was, technically, already sent.

### The fix

```python
def handle_client(client_socket, client_address):
    request_bytes = client_socket.recv(4096)
    request_text = request_bytes.decode("utf-8")
    method, path, http_version, headers = parse_request_line_and_headers(request_text)

    if not is_request_allowed(client_address[0]):
        client_socket.sendall(build_rate_limit_response())
        client_socket.close()
        return

    backend_host, backend_port = choose_backend(path)
    forwarded_request = build_forwarded_request(
        method, path, http_version, headers, backend_host, backend_port, client_address
    )

    backend_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    backend_socket.connect((backend_host, backend_port))
    backend_socket.sendall(forwarded_request.encode("utf-8"))

    relay(backend_socket, client_socket)
    client_socket.close()
    backend_socket.close()
```

Reading the full request first — even one about to be rejected — drains
the receive buffer, so the socket has nothing left unread when it closes,
and the close proceeds as a normal, graceful shutdown instead of a reset.

### CS Lens

This is a **half-open connection teardown hazard** — a case where the two
directions of a full-duplex TCP connection (the read side and the write
side) don't shut down independently the way they might seem to. It's the
same underlying fact `relay()`'s `shutdown(SHUT_WR)` in Lesson 31 was
already carefully working around, seen here from the opposite angle: that
code was careful about *when* to stop writing; this bug was about closing
*before finishing reading*.

Also recognized in: any "connection reset" bug report in real production
systems where a server logs a request as successfully handled while the
client simultaneously reports failure — this exact mismatch, TCP RST
racing a successful response, is one of the most common root causes.

### SE Lens

The fix cost nothing in complexity — it's a reordering of two existing
steps, not new code — which is exactly why this kind of bug is dangerous
in real systems: the broken version and the fixed version look almost
identical on the page, and the broken version passes every test that
doesn't specifically send more requests than the rate limit allows. This
is a concrete argument, not an abstract principle, for why "what breaks
without this" matters as a habit: the failure here was found by actually
running the six-request test this lesson describes, not by reasoning
about the code in the abstract.

---

## Connect the pieces

One rejected request, traced through everything built today: a client
that has already made 3 requests this second sends a 4th.

1. `main()`'s `accept()` (Lesson 31, unchanged) hands the connection to
   `handle_client` on its own thread.
2. `client_socket.recv(4096)` reads the request; it's parsed exactly as
   Lesson 31 already did, so the request's own content is fully known
   before any rate-limit decision is made.
3. `is_request_allowed(client_address[0])` looks up this client's
   `TokenBucket` in `client_buckets` (already created by the client's
   first request), calls `try_consume()`, finds `tokens < 1`, and returns
   `False`.
4. `build_rate_limit_response()` builds a `429` with `Retry-After: 1`;
   `client_socket.sendall(...)` sends it, and the request never reaches
   `choose_backend` or any backend at all — the entire point of putting
   this check in the proxy rather than in each backend individually.

## What breaks without this

Already shown directly above, with the real traceback this lesson's own
first attempt produced: checking the rate limit *before* draining the
client's request bytes causes a TCP RST on close, which surfaces to the
client as `ConnectionResetError` instead of a clean `429` response.

## Definition of done

- [ ] `rate_limited_proxy.py` runs and prints `Rate-limited reverse proxy
      listening on localhost:8080`.
- [ ] Sending 3 requests immediately from the same client succeeds with
      `200 OK` each time.
- [ ] A 4th immediate request from the same client returns `429 Too Many
      Requests` with a `Retry-After` header, not a connection error.
- [ ] Waiting roughly 1 second and retrying succeeds again with `200 OK`,
      proving tokens actually refill rather than staying blocked forever.
- [ ] You can explain, without looking back at this lesson, why the rate
      limit check happens after reading the request instead of before.
- [ ] Commit with a message explaining why, not just what:

  ```
  git add rate_limited_proxy.py
  git commit -m "Add per-client token-bucket rate limiting to the reverse proxy — rejects with 429+Retry-After before a backend is ever touched, and reads the full request before rejecting to avoid a TCP RST on close"
  ```

## What's next

`client_buckets` grows forever and is keyed by raw IP address, which
breaks down the moment multiple real users sit behind one shared IP (a
company NAT, a school network) — they'd all share one bucket. Track 10's
LRU cache lesson is the natural fix for the unbounded growth; a fairer
per-user (rather than per-IP) key would need real authentication, which
Track 5's session/JWT lesson builds.
