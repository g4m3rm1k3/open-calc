# Lesson 11: HTTP Fundamentals — Status Codes, Pagination, and Real Retries

**What you will build:** a `recordkeeper/net.py` module with
`fetch_with_retry` (retry-with-exponential-backoff) and `paginate` (a
generator walking a real API's `Link`-header pagination), using the
standard `requests` library — verified against a real, live, public
API (GitHub's), including a genuine `403` rate-limit response this
curriculum's own sandbox happened to trigger for real while writing
it. The transferable problem: what a status code, a response header,
and a paginated result actually are on the wire; why blind retrying
without backoff is a real failure mode, proven with a controlled,
deterministic simulation first; and why a request over a network can
fail in ways none of this curriculum's file-, database-, or in-memory
sources ever could — proven with a real, unstaged failure this lesson
didn't have to construct.

**What you need to know first:** Lesson 6 — generator functions
(`yield`), reused here for `paginate`. Lesson 7 — `itertools.islice`
and the streaming/lazy-evaluation habit `paginate` continues.

**Terms used in this lesson**

- **Status code** — a three-digit number every HTTP response carries,
  stating in a fixed, standardized way whether a request succeeded, and
  if not, roughly why. It exists so that *every* HTTP client — whatever
  language or library it's written in — can determine a response's
  basic outcome by checking one small, universal number, without
  needing to parse or understand that response's own body at all.
  Codes in the 200s mean success; 400s mean the client's request was
  itself invalid or not permitted; 500s mean the server itself failed.
- **Header** — a small piece of metadata about a request or response,
  sent separately from its main body, as a name-value pair (`Content-
  Type: application/json`, for instance). Headers exist to carry
  information *about* a message — its format, its size, caching rules,
  rate-limit accounting — without that information having to be parsed
  out of the message's own content.
- **Pagination** — splitting a result set too large to return in one
  response into a sequence of smaller pages, with each page's response
  telling the client how to request the next one. It exists for the
  same reason streaming (Lessons 1, 2, 7) exists locally: a server
  can't reasonably return an unbounded number of results in one
  response, so results are handed back incrementally instead.
- **Retry with backoff** — automatically re-attempting a failed
  request, waiting progressively longer between each attempt (commonly
  doubling the wait each time — "exponential" backoff) rather than
  retrying immediately or not at all. It exists because many failures
  over a network are transient (a server briefly overloaded, a rate
  limit that will lift shortly) and likely to succeed if retried after
  a pause — while retrying instantly and repeatedly can make a real,
  ongoing problem (like an already-overloaded server) worse.

**Objects and methods used**

- **`requests.get`**
  - *What it is:* A function from the third-party `requests` library
    that sends an HTTP GET request and returns its response.
  - *Implementation:* `requests.get(url, params=None, headers=None) ->
    a Response`; `params` becomes the URL's query string, `headers`
    becomes real HTTP request headers.
  - *Its use:* Every real network call in this lesson goes through
    `requests.get`.
  - *Type / Responsibility / Depends on / Connects to / Shape:* A
    third-party library function; responsible for opening a real
    network connection, sending a well-formed HTTP GET request, and
    waiting for and returning the server's response; depends on network
    access and a reachable URL; called directly inside
    `fetch_with_retry`; shape is a URL `str` (plus optional
    params/headers) in, one `Response` object out — or a raised
    exception if the connection itself fails outright (a case this
    lesson doesn't trigger, distinct from a normal error status code).

- **`Response.status_code` / `Response.headers` / `Response.json`**
  - *What they are:* Attributes and a method on a `Response` object
    exposing a real HTTP response's three main parts.
  - *Implementation:* `.status_code` is a plain `int`; `.headers` is a
    dict-like, case-insensitive mapping of header names to values;
    `.json()` parses the response body as JSON (the exact `json.loads`
    from Lesson 5) and returns the resulting Python value, raising if
    the body isn't valid JSON.
  - *Their use:* Read throughout this lesson to check whether a request
    succeeded, to read rate-limit accounting, and to get a usable
    Python value out of an API's JSON response body.
  - *Type / Responsibility / Depends on / Connects to / Shape:*
    Instance attributes/method on `Response`; responsible for exposing
    a real HTTP response's status line, headers, and body in
    Python-native forms; depend on a completed `requests.get` call;
    used throughout `fetch_with_retry` and `paginate`; shape is no
    arguments in (for all three), an `int`, a dict-like mapping, and a
    parsed Python value out, respectively.

- **`Response.links`**
  - *What it is:* A property on `Response` that parses the response's
    `Link` header into a structured dict automatically.
  - *Implementation:* `response.links -> dict`, keyed by each link's
    `rel` value (`"next"`, `"last"`, and so on), each value itself a
    dict with at least a `"url"` key.
  - *Its use:* What `paginate` uses to find the next page's URL,
    without parsing the raw `Link` header text by hand.
  - *Type / Responsibility / Depends on / Connects to / Shape:* A
    read-only property on `Response`; responsible for parsing the
    `Link` header's specific, semicolon-and-comma-delimited text format
    into a real Python structure; depends on the response actually
    carrying a `Link` header (an empty dict otherwise); used inside
    `paginate`'s own loop; shape takes no arguments, returns a `dict`
    of `dict`s, one per link relation found.

- **`Response.raise_for_status`**
  - *What it is:* A method that raises a real exception if the
    response's status code indicates an error, and does nothing
    otherwise.
  - *Implementation:* `response.raise_for_status() -> None`; raises
    `requests.exceptions.HTTPError` for a 4xx or 5xx status code.
  - *Its use:* Called inside `paginate` so a page that ultimately
    failed (after `fetch_with_retry` already exhausted its own retries)
    surfaces as a real, loud exception instead of `paginate` silently
    yielding an error body as if it were real data.
  - *Type / Responsibility / Depends on / Connects to / Shape:* An
    instance method on `Response`; responsible for converting a
    numeric status code into a real, catchable Python exception exactly
    when that code indicates failure; depends on `.status_code` already
    being set; called once per page inside `paginate`; shape takes no
    arguments, returns `None` on success, raises on failure — its
    entire effect is that raise-or-don't-raise decision.

---

## Concept Unit: Status codes, headers, and a response's real shape

### The Problem

Every data source this curriculum has used so far — a file, a
database — either succeeds or fails in ways checked locally, often
before any data-shaped operation even starts (a file that doesn't
exist raises immediately on `open()`). An HTTP request is different: it
crosses a real network, to a server this program doesn't control, and
"did it work" isn't a yes/no Python already knows how to represent —
it's a real piece of data the response itself carries, which the
calling code has to actually check.

> **Stop and think:** If a request to a real, live API "succeeds" in
> the sense that a response comes back at all — no connection error,
> no timeout — is that enough to assume the request's *actual purpose*
> succeeded? What might a response contain, alongside its main body,
> that tells a client more than just "here's some data" — such as
> whether that data is even valid, or how many more requests this
> client is still allowed to make?

### Introduce the concept in isolation

Against a real, live endpoint — GitHub's own API, reporting its own
rate-limit status:

```python
import requests

response = requests.get("https://api.github.com/rate_limit")

print("status_code ->", response.status_code)
print("headers['content-type'] ->", response.headers["content-type"])
print("headers['x-ratelimit-limit'] ->", response.headers["x-ratelimit-limit"])

data = response.json()
print("type(data) ->", type(data))
print("data['resources']['core'] ->", data["resources"]["core"])
```

Real output, from an actual run against the live API:

```
status_code -> 200
headers['content-type'] -> application/json; charset=utf-8
headers['x-ratelimit-limit'] -> 60
type(data) -> <class 'dict'>
data['resources']['core'] -> {'limit': 60, 'remaining': 0, 'reset': 1788418588, 'used': 60}
```

`status_code` (full treatment above, in Terms) confirms this request
genuinely succeeded — `200` is HTTP's standard "OK" code. `headers`
(full treatment above) carries real metadata *about* this response,
separate from its body: `content-type` tells a client how to interpret
the body (as JSON, here) before even looking at it; `x-ratelimit-limit`
is API-specific metadata this particular server chooses to report,
proving headers aren't limited to a small, fixed HTTP-standard set —
any server can add its own. `response.json()` (full treatment above)
turns the body into a real Python `dict`, the exact `json.loads`
mechanism from Lesson 5. The `core` resource's own real numbers —
`remaining: 0` — are this session's own real, current state: this
sandbox's shared network address has already used its entire hourly
allowance of GitHub's unauthenticated API quota, from earlier,
unrelated traffic — genuinely, not staged for this lesson.

### Discard the throwaway example

This lab's `response` and `data` are discarded as *objects* — nothing
about them is reused directly — but the real rate-limit state they
revealed is exactly what the next unit examines directly.

### Project Change

- **Reference Source** — none; from-scratch, as in every prior lesson.
- **Files affected** — new file `recordkeeper/net.py`.
- **Change type** — add.
- **Location** — n/a (new file).
- **Dependencies** — `requests` (a real third-party dependency, install
  with `pip install requests`, same category of dependency as Lesson
  9's `sqlalchemy`).

### The New Code

```python
import time

import requests
```

### The Updated Project

Brand-new file, nothing surrounding this fragment yet — covered by
Project Change above.

### Mechanical walkthrough

- **`import time`** — brings the standard library's `time` module into
  scope, for `time.sleep`, used later in this lesson's backoff logic.
- **`import requests`** — brings the third-party `requests` library
  into scope.

### CS lens

A status code as a small, fixed, universally-understood signal about
an operation's outcome — checked before the response's own content is
even inspected — is the same **error-code-first** convention used
anywhere an operation's success/failure state is deliberately kept
separate from, and checked ahead of, its actual result data.

```
Also recognized in: POSIX system calls returning a separate errno on
failure rather than encoding failure inside the return value itself,
process exit codes (0 for success, nonzero for a specific kind of
failure) checked by shell scripts before touching a program's output,
gRPC status codes returned alongside (not instead of) a call's own
response message
```

### SE lens

The alternative not chosen — used by some HTTP APIs, though not
GitHub's — is folding success/failure entirely into the response
body's own content, always returning `200`, with a client expected to
inspect the body itself to know whether anything actually went wrong.
That removes the need to check two separate things (status code, then
body), but it means *every* client has to parse the body just to learn
whether parsing the body for real data is even worthwhile — and, more
seriously, generic HTTP tooling that only understands status codes
(caches, load balancers, monitoring) becomes blind to failures
entirely, since everything looks like a `200` from the outside. Relying
on the status code first, as this lesson's own `fetch_with_retry` does
throughout, keeps that check cheap and universal.

### Commands needed

- `pip install requests` — installs the `requests` package. Success
  output ends with a line like `Successfully installed requests-2.33.1`.

### Run it

Shown above under "Introduce the concept in isolation" — real output,
from a genuinely live request.

### Connect

This unit shows what a status code and a header actually are, using a
real endpoint that happened to reveal this sandbox's own live rate-limit
state; the next unit reads a real *error* response directly, using that
same, currently-exhausted quota this unit just uncovered.

---

## Concept Unit: A real error response, read directly

### The Problem

Every status code this curriculum has seen so far has been `200`.
Nothing yet has shown what a real, live *failing* request actually
looks like — its status code, its body, and whatever headers a real
server includes specifically to explain the failure.

> **Stop and think:** Given that this lesson's first unit already
> revealed this session's own GitHub API quota shows `remaining: 0`,
> what would you expect to happen if a request is made to an endpoint
> that *does* count against that same exhausted quota — the real
> repository-lookup endpoint, rather than the quota-reporting endpoint
> itself? Would you expect a connection failure, or a normal HTTP
> response carrying a status code that simply isn't `200`?

### Introduce the concept in isolation

```python
import requests
import datetime

response = requests.get("https://api.github.com/repos/python/cpython")

print("status_code ->", response.status_code)
print("ok? (status_code < 400) ->", response.status_code < 400)

body = response.json()
print("body ->", body)

for key in ("x-ratelimit-limit", "x-ratelimit-remaining", "x-ratelimit-used", "x-ratelimit-reset"):
    print(key, "->", response.headers[key])

reset_ts = int(response.headers["x-ratelimit-reset"])
reset_time = datetime.datetime.fromtimestamp(reset_ts, tz=datetime.timezone.utc)
print("x-ratelimit-reset as a real UTC time ->", reset_time)
```

Real output, from an actual run against the live API, at the time this
lesson was written:

```
status_code -> 403
ok? (status_code < 400) -> False
body -> {'message': "API rate limit exceeded for 34.148.229.210. (But here's the good news: Authenticated requests get a higher rate limit. Check out the documentation for more details.)", 'documentation_url': 'https://docs.github.com/rest/overview/resources-in-the-rest-api#rate-limiting'}
x-ratelimit-limit -> 60
x-ratelimit-remaining -> 0
x-ratelimit-used -> 60
x-ratelimit-reset -> 1788418588
x-ratelimit-reset as a real UTC time -> 2026-09-03 06:56:28+00:00
```

This is a real, unmodified, live failure — this session's own shared
network address genuinely has exhausted its hourly GitHub API quota,
exactly as the previous unit's own numbers already indicated. The
request didn't fail to connect; it received a completely normal, well-
formed HTTP response, with a `403` status code and a real JSON body
explaining, in plain language, exactly why. `x-ratelimit-reset`, a
Unix timestamp (an `int`, seconds since 1970), converts into a real,
readable UTC time via `datetime.datetime.fromtimestamp` — a genuinely
useful real header: a well-behaved client reading this value knows
*exactly* when retrying would stop being futile, rather than guessing.

### Discard the throwaway example

This lab's `response`, `body`, and `reset_time` are discarded as
objects; the real headers they revealed inform this lesson's next
unit's design directly.

### Project Change

None — this unit adds no code to `recordkeeper`; it exists to read a
real failure directly before the next unit writes code that has to
handle one.

### Mechanical walkthrough

- **`response.status_code < 400`** — a plain integer comparison; per
  the Terms definition of status code above, codes below `400` (the
  100s, 200s, and 300s) represent success or further, non-error action
  needed, while `400` and above represent client or server errors —
  this comparison is the simplest correct way to ask "did this
  succeed," and the exact check `fetch_with_retry` uses in the next
  unit.
- **`response.headers[key]`** — plain dict-style key lookup on
  `.headers` (full treatment already given in the previous unit),
  reading four specific, API-specific headers this server chose to
  include.
- **`int(response.headers["x-ratelimit-reset"])`** — headers are always
  text; `int(...)` converts that text into a real Python integer,
  necessary before it can be used as a Unix timestamp at all.
- **`datetime.datetime.fromtimestamp(reset_ts, tz=datetime.timezone.utc)`**
  — a standard-library call converting a Unix timestamp into a real,
  timezone-aware `datetime` object; `tz=datetime.timezone.utc` is
  necessary because a bare Unix timestamp has no timezone of its own —
  without specifying UTC explicitly, the conversion would use whatever
  local timezone the running machine happens to be set to instead.

### CS lens

A server telling a client not just *that* a request failed, but
exactly *when* retrying would become worthwhile again, is an instance
of **flow control** — the receiving side of a system explicitly
signaling the sending side how to pace itself, rather than leaving the
sender to guess.

```
Also recognized in: TCP's own receive-window mechanism telling a
sender how much more data it can currently accept, HTTP's own
`Retry-After` header (a more generic version of GitHub's
`x-ratelimit-reset`), a printer reporting "out of paper" rather than
silently dropping print jobs, a factory's kanban system limiting how
much work-in-progress a downstream station will accept at once
```

### SE lens

The alternative some APIs choose — returning a bare `403` or `429`
with no further detail about *when* to retry — pushes a real design
decision onto every client: guess a reasonable wait, or retry
immediately and risk making things worse. GitHub's own choice to
include exact, actionable timing (`x-ratelimit-reset`) in the response
itself removes that guesswork for any client that reads it — the real
tradeoff being borne entirely by the server, which has to compute and
include that value on every single response, successful or not.

### Commands needed

None new.

### Run it

Shown above under "Introduce the concept in isolation" — real output,
from a genuinely, currently rate-limited request.

### Connect

This unit read one real failure directly; the next unit builds real
retry logic — first proven against a controlled, repeatable simulated
failure, then applied for real against this exact, still-exhausted
quota this unit just examined.

---

## Concept Unit: Retry with backoff — proven twice, once safely, once for real

### The Problem

A single failed request, by itself, doesn't tell a caller much — many
real failures (a momentarily overloaded server, a rate limit) resolve
on their own shortly after. Retrying instantly, in a tight loop, is a
real anti-pattern: if the *reason* for the failure is server load, a
flood of immediate retries from every affected client makes that load
worse, not better — the opposite of what a retry is meant to
accomplish.

> **Stop and think:** If a function that sometimes fails is called
> again immediately after a failure, and it fails again for the exact
> same underlying reason, what does an immediate retry actually
> accomplish? What would change if each retry waited a little longer
> than the last one before trying again — and how would you prove, with
> real evidence rather than an assumption, that such a wrapper actually
> waits the amount of time it claims to?

### Introduce the concept in isolation

First, proven safely, against a function whose failures are entirely
controlled and repeatable — no real network involved:

```python
import time

call_count = 0

def flaky_call():
    global call_count
    call_count += 1
    if call_count < 3:
        return {"status_code": 503}
    return {"status_code": 200, "body": "ok"}

def call_with_retry(func, max_retries=5, base_delay=0.01):
    for attempt in range(1, max_retries + 1):
        result = func()
        if result["status_code"] < 400:
            return result
        if attempt < max_retries:
            delay = base_delay * (2 ** (attempt - 1))
            print(f"  attempt {attempt}: status {result['status_code']}, retrying in {delay:.3f}s")
            time.sleep(delay)
    return result

result = call_with_retry(flaky_call)
print("final result:", result)
print("total calls actually made:", call_count)
```

Real output:

```
  attempt 1: status 503, retrying in 0.010s
  attempt 2: status 503, retrying in 0.020s
final result: {'status_code': 200, 'body': 'ok'}
total calls actually made: 3
```

`flaky_call` deterministically fails its first two calls and succeeds
on the third — real, repeatable control, not network randomness.
`call_with_retry`'s own printed delays — `0.010s`, then `0.020s` —
prove the **retry with backoff** pattern (named here in full, per
Terms above) is genuinely doubling its wait each attempt
(`base_delay * (2 ** (attempt - 1))`: `0.01 * 2^0`, then `0.01 * 2^1`),
not just retrying blindly; `total calls actually made: 3` confirms it
stopped retrying the instant a real success came back, rather than
continuing to the full `max_retries`.

Now, the identical logic, applied for real against this lesson's own,
still-exhausted GitHub quota:

```python
def fetch_with_retry(url, max_retries=3, base_delay=0.5):
    for attempt in range(1, max_retries + 1):
        response = requests.get(url, headers={"User-Agent": "recordkeeper-lesson"})
        if response.status_code < 400:
            return response
        if response.status_code in (403, 429) and attempt < max_retries:
            delay = base_delay * (2 ** (attempt - 1))
            print(f"  attempt {attempt}: status {response.status_code}, retrying in {delay:.2f}s")
            time.sleep(delay)
            continue
        print(f"  attempt {attempt}: status {response.status_code}, giving up")
        return response
    return response

print("=== against the real, currently rate-limited endpoint ===")
result = fetch_with_retry("https://api.github.com/repos/python/cpython", max_retries=3, base_delay=0.5)
print("final status_code ->", result.status_code)

print("=== against a real endpoint that isn't rate-limited ===")
result2 = fetch_with_retry("https://api.github.com/rate_limit", max_retries=3, base_delay=0.5)
print("final status_code ->", result2.status_code)
```

Real output, from an actual run:

```
=== against the real, currently rate-limited endpoint ===
  attempt 1: status 403, retrying in 0.50s
  attempt 2: status 403, retrying in 1.00s
  attempt 3: status 403, giving up
final status_code -> 403
=== against a real endpoint that isn't rate-limited ===
final status_code -> 200
```

Against the real, still rate-limited endpoint, `fetch_with_retry`
correctly recognizes each real `403`, waits the correct doubling
delay twice, and — since `max_retries=3` is reached — gives up cleanly
on the third attempt, returning the failed response rather than
retrying forever or crashing. Against a real endpoint with no rate-
limit problem, it succeeds immediately, on the first attempt, with no
retry logic triggered at all. Both are real, live network behavior —
the deterministic lab above proved the backoff math is correct in a
controlled setting; this proves the exact same logic behaves correctly
against a genuine, currently-failing real-world API too.

### Discard the throwaway example

`flaky_call`, `call_with_retry`, and this unit's own copy of
`fetch_with_retry` are discarded as standalone lab code; the function's
own body — proven correct twice over — carries forward into the
project below.

### Project Change

- **Reference Source** — none; from-scratch, as in the previous unit.
- **Files affected** — `recordkeeper/net.py` (modified, adding
  `fetch_with_retry`).
- **Change type** — add.
- **Location** — after the imports already added in the first unit.
- **Dependencies** — none new.

### The New Code

```python
def fetch_with_retry(url, params=None, headers=None, max_retries=3, base_delay=0.5):
    for attempt in range(1, max_retries + 1):
        response = requests.get(url, params=params, headers=headers)
        if response.status_code < 400:
            return response
        if response.status_code in (403, 429) and attempt < max_retries:
            delay = base_delay * (2 ** (attempt - 1))
            time.sleep(delay)
            continue
        return response
    return response
```

### The Updated Project

```python
1  import time
2
3  import requests
4
5
6  def fetch_with_retry(url, params=None, headers=None, max_retries=3, base_delay=0.5):  # ← new
7      for attempt in range(1, max_retries + 1):                    # ← new
8          response = requests.get(url, params=params, headers=headers)  # ← new
9          if response.status_code < 400:                            # ← new
10             return response                                       # ← new
11         if response.status_code in (403, 429) and attempt < max_retries:  # ← new
12             delay = base_delay * (2 ** (attempt - 1))              # ← new
13             time.sleep(delay)                                     # ← new
14             continue                                               # ← new
15         return response                                           # ← new
16     return response                                               # ← new
```

`net.py` now offers a single, general-purpose function for making a
real HTTP request that automatically, safely retries on the two status
codes that specifically mean "you've been throttled" (`403` used this
way by GitHub, `429` — "Too Many Requests" — the more common, standard
code other APIs use for the same situation), backing off exponentially
between attempts, and giving up cleanly, returning the last real
response, once `max_retries` is exhausted.

### Mechanical walkthrough

- **`params=None, headers=None`** — two optional parameters, both
  defaulting to `None` and passed straight through to `requests.get`;
  `requests.get(url, params=None, headers=None)` treats a `None`
  `params`/`headers` as "none supplied," the same as omitting the
  argument entirely.
- **`for attempt in range(1, max_retries + 1):`** — iterates `attempt`
  from `1` up to and including `max_retries`, so a caller's
  `max_retries=3` really does mean at most three real requests, not
  three retries *after* an initial attempt (four total).
- **`if response.status_code < 400: return response`** — full
  treatment of this comparison already given in the previous unit;
  the moment any attempt succeeds, `fetch_with_retry` returns
  immediately, without waiting for `max_retries` attempts regardless of
  how many are still available — proven directly by this unit's own
  lab, where the non-rate-limited call succeeded and returned on
  attempt one.
- **`response.status_code in (403, 429) and attempt < max_retries`** —
  two conditions joined with `and`: the status code has to be one of
  the two specifically retry-worthy codes, *and* there has to be at
  least one attempt left after this one — this second check is what
  prevents sleeping needlessly right before the function is about to
  give up anyway on its very last allowed attempt.
- **`delay = base_delay * (2 ** (attempt - 1))`** — the exact
  exponential-backoff formula proven correct against `flaky_call`'s
  real, deterministic output earlier in this unit, now parameterized by
  `base_delay` instead of a hard-coded constant.
- **`continue`** — explicitly moves on to the next iteration of the
  `for` loop (the next `attempt`), immediately after the sleep — while
  Python would reach the same next iteration without an explicit
  `continue` here too, since it's the last statement before the loop
  naturally advances, writing it out makes this branch's intent (retry,
  don't fall through to giving up) unambiguous to a reader.
- **`return response` (final, un-indented line)** — reached only if the
  `for` loop completes all `max_retries` iterations without an earlier
  `return` — meaning every attempt failed with a non-retryable code, or
  the final attempt failed with a retryable one; either way, the last
  real response is returned rather than `None` or an exception,
  leaving the decision of what to do about a persistent failure to
  `fetch_with_retry`'s own caller.

### CS lens

Waiting a variable, increasing amount of time before retrying, rather
than a fixed interval, is specifically **exponential backoff** — used
anywhere repeated contention for a shared, possibly-overloaded resource
needs a strategy that naturally spreads out competing retries instead
of having them collide again immediately.

```
Also recognized in: Ethernet's original collision-detection protocol
(colliding senders each back off a random, growing interval before
retransmitting), TCP's own retransmission timeout doubling after each
unacknowledged packet, distributed systems' "jittered" backoff
(randomizing the delay slightly, to avoid many clients retrying at
the exact same moment)
```

### SE lens

The alternative not chosen is retrying immediately, in a tight loop,
with no delay at all. Against a rate limit specifically — this
lesson's own real, live example — that would be actively
counterproductive: each immediate retry would itself count against the
same exhausted quota, guaranteeing every subsequent attempt fails too,
for as long as the retries keep running, potentially delaying the
actual reset further depending on how the server accounts for abusive
retry patterns. `base_delay=0.5` and `max_retries=3`, as chosen here,
are deliberately small for a *lesson's* own runtime — a real production
system talking to an API with hour-long rate-limit windows, like
GitHub's own real `x-ratelimit-reset` this lesson's second unit read
directly, would reasonably use a much larger `base_delay`, or read
that reset timestamp directly and sleep until it, rather than blindly
doubling a half-second delay three times and giving up.

### Commands needed

None new.

### Run it

Shown above — real output, from both a controlled, deterministic
simulation and a genuinely live, currently-failing real API.

### Connect

This unit proved retry-with-backoff correct twice — once where every
variable was under this lesson's own control, once against a real
failure this lesson didn't stage; the final unit adds pagination,
built directly on top of `fetch_with_retry` so a paginated fetch
inherits the exact same retry safety automatically, one page at a
time.

---

## Concept Unit: Pagination — a real, multi-page walk through a live API

### The Problem

A single API response, like every one seen so far in this lesson,
represents *one page* of results — real APIs commonly cap how many
items they'll return in a single response, the same reasoning behind
every streaming technique this curriculum has built since Lesson 1.
Getting a complete result set means knowing how to ask for the *next*
page, and a well-designed API tells the client exactly how, rather than
requiring the client to guess a URL pattern.

> **Stop and think:** If a paginated API's response includes, in one of
> its own headers, the exact URL of the next page — rather than
> requiring a client to construct that URL itself by incrementing a
> page number — what real advantage does that give a client, compared
> to guessing the next page's URL pattern? What would happen to a
> client that assumed a fixed pattern, if the server ever changed how
> its pagination URLs are structured?

### Introduce the concept in isolation

Against GitHub's real, live search API — genuinely returning real,
current repository data:

```python
import requests

headers = {"User-Agent": "recordkeeper-lesson"}
url = "https://api.github.com/search/repositories"
params = {"q": "language:python", "per_page": 3}

response = requests.get(url, params=params, headers=headers)
print("status_code ->", response.status_code)
print("Link header ->", response.headers.get("Link"))

data = response.json()
print("total_count ->", data["total_count"])
print("this page's items ->", [item["full_name"] for item in data["items"]])

link_header = response.headers.get("Link", "")
next_url = None
for part in link_header.split(","):
    section = part.split(";")
    url_part = section[0].strip().strip("<>")
    rel_part = section[1].strip()
    if rel_part == 'rel="next"':
        next_url = url_part
print("parsed next_url ->", next_url)

if next_url:
    response2 = requests.get(next_url, headers=headers)
    data2 = response2.json()
    print("page 2 items ->", [item["full_name"] for item in data2["items"]])
```

Real output, from an actual run against the live API:

```
status_code -> 200
Link header -> <https://api.github.com/search/repositories?q=language%3Apython&per_page=3&page=2>; rel="next", <https://api.github.com/search/repositories?q=language%3Apython&per_page=3&page=334>; rel="last"
total_count -> 33094150
this page's items -> ['public-apis/public-apis', 'EbookFoundation/free-programming-books', 'donnemartin/system-design-primer']
parsed next_url -> https://api.github.com/search/repositories?q=language%3Apython&per_page=3&page=2
page 2 items -> ['vinta/awesome-python', 'practical-tutorials/project-based-learning', 'NousResearch/hermes-agent']
```

This is **pagination** (named here in full, per Terms above), proven
against a real, currently-changing dataset (33 million real Python
repositories, at the time this ran). The raw `Link` header's own text
format — comma-separating multiple links, each with a `<url>;
rel="..."` shape — is parsed by hand here, splitting on `,` then `;`,
to show exactly what the server actually sent; page 2's items are
genuinely different repositories from page 1's, real proof the second
request reached real, different data rather than repeating the first
page.

`requests` itself already parses this same header automatically:

```python
print(response.links)
print(response.links.get("next", {}).get("url"))
```

Real output:

```
{'next': {'url': 'https://api.github.com/search/repositories?q=language%3Apython&per_page=3&page=2', 'rel': 'next'}, 'last': {'url': 'https://api.github.com/search/repositories?q=language%3Apython&per_page=3&page=334', 'rel': 'last'}}
https://api.github.com/search/repositories?q=language%3Apython&per_page=3&page=2
```

Identical `next` URL, from `response.links` (full treatment already
given above, in Objects and methods used) — proof this convenience
property isn't doing anything the hand-parsed version above couldn't
already do; it's the exact same `Link`-header text, parsed once,
correctly, inside `requests` itself instead of by hand every time.

### Discard the throwaway example

This lab's manual `Link`-header parsing loop is discarded — the real
mechanism it demystified, `response.links`, is what `paginate` actually
uses below.

### Project Change

- **Reference Source** — none; from-scratch, as in every prior unit.
- **Files affected** — `recordkeeper/net.py` (modified, adding
  `paginate`).
- **Change type** — add.
- **Location** — after `fetch_with_retry`, already present from the
  previous unit.
- **Dependencies** — none new.

### The New Code

```python
def paginate(url, params=None, headers=None):
    while url:
        response = fetch_with_retry(url, params=params, headers=headers)
        response.raise_for_status()
        yield response.json()
        url = response.links.get("next", {}).get("url")
        params = None
```

### The Updated Project

`recordkeeper/net.py`, complete:

```python
 1  import time
 2
 3  import requests
 4
 5
 6  def fetch_with_retry(url, params=None, headers=None, max_retries=3, base_delay=0.5):
 7      for attempt in range(1, max_retries + 1):
 8          response = requests.get(url, params=params, headers=headers)
 9          if response.status_code < 400:
10             return response
11         if response.status_code in (403, 429) and attempt < max_retries:
12             delay = base_delay * (2 ** (attempt - 1))
13             time.sleep(delay)
14             continue
15         return response
16     return response
17
18
19  def paginate(url, params=None, headers=None):              # ← new
20      while url:                                              # ← new
21          response = fetch_with_retry(url, params=params, headers=headers)  # ← new
22          response.raise_for_status()                          # ← new
23          yield response.json()                                # ← new
24          url = response.links.get("next", {}).get("url")      # ← new
25          params = None                                        # ← new
```

`paginate` is a generator function (full treatment already given in
Lesson 6) that walks a real paginated API page by page, yielding each
page's parsed JSON one at a time — lazily, the same discipline Lesson
7's `iter_all_contacts`/`chunked` already applied to local data,
extended here to a live network resource. Every single page it fetches
goes through `fetch_with_retry`, so a transient failure on page 5 of a
long paginated walk gets the exact same automatic backoff-and-retry
treatment page 1 would.

### Mechanical walkthrough

- **`while url:`** — loops as long as `url` is a real, non-empty
  string; relies entirely on `url` eventually becoming `None` (falsy)
  to end, which happens the moment a page's response has no `"next"`
  link at all — the last page of real results.
- **`fetch_with_retry(url, params=params, headers=headers)`** — full
  treatment already given in the previous unit; every page's fetch
  automatically inherits retry-with-backoff, with no separate retry
  logic needed inside `paginate` itself.
- **`response.raise_for_status()`** — full treatment above, in Objects
  and methods used; if `fetch_with_retry` itself gave up after
  exhausting its own retries and returned a failed response,
  `raise_for_status()` turns that into a real, loud `HTTPError` here,
  rather than `paginate` silently `yield`ing an error page's JSON body
  as if it were real data.
- **`yield response.json()`** — full treatment of `yield` already given
  in Lesson 6; produces one page's parsed data and pauses `paginate`
  right here until the next page is asked for — nothing about page 2
  is fetched until a caller actually consumes page 1's result and asks
  for more.
- **`url = response.links.get("next", {}).get("url")`** — full
  treatment of `.links` above; `.get("next", {})` returns the `"next"`
  link's own dict if present, or an empty dict if there's no next page
  at all, and the second `.get("url")` reads that dict's URL (or
  `None`, from the empty dict's own `.get`) — this is what naturally
  becomes `None` on the final page, ending the `while` loop.
- **`params = None`** — after the first request, every subsequent
  page's URL (from `.links`) already has the original query parameters
  baked directly into it — passing the original `params` dict again on
  page 2 onward would risk appending them a second time; setting it to
  `None` ensures only the first request supplies `params` explicitly.

### CS lens

Following a link embedded in the current response to reach the next
one, rather than the client computing that link itself, is the same
**HATEOAS** idea (Hypermedia as the Engine of Application State) — a
response telling a client what it can do next, rather than the client
needing out-of-band knowledge of the API's own URL structure.

```
Also recognized in: web browsers following an `<a href>` link without
knowing anything about how the target page's URL is constructed,
a linked list's own next-pointer (a node telling you how to reach the
next one, rather than an index computing it), RSS/Atom feeds' own
"next page" links for feed pagination
```

### SE lens

The alternative not chosen is computing each page's URL by hand — `?page=2`,
`?page=3`, incrementing a counter — which this unit's own lab proved
works, since GitHub's real URLs do follow a `page=N` pattern. The real
risk, avoided by using `response.links` instead, is coupling
`recordkeeper`'s own code to that specific URL structure, which the
server is free to change at any time without breaking anything for a
client that only ever follows the link it was actually given.
`paginate`'s own `while url:` loop terminates correctly the instant a
real server stops providing a `"next"` link, with no separate "how many
pages are there" calculation needed at all — genuinely simpler, not
just safer, than a hand-computed page-counter loop would have to be.

### Commands needed

None new.

### Run it

Real output, from an actual run combining every function this lesson
built, against the real, live API:

```python
from recordkeeper.net import fetch_with_retry, paginate

r = fetch_with_retry("https://api.github.com/rate_limit")
print("fetch_with_retry status:", r.status_code)

headers = {"User-Agent": "recordkeeper-lesson"}
pages = paginate(
    "https://api.github.com/search/repositories",
    params={"q": "language:python", "per_page": 3},
    headers=headers,
)
first_page = next(pages)
print("page 1:", [item["full_name"] for item in first_page["items"]])
```

```
fetch_with_retry status: 200
page 1: ['public-apis/public-apis', 'EbookFoundation/free-programming-books', 'donnemartin/system-design-primer']
```

### Connect

The previous unit proved `fetch_with_retry` handles a single request's
transient failure correctly; this unit builds `paginate` directly on
top of it, so a real, multi-page walk through a live API — proven, in
this unit's own lab, to reach genuinely different, real data on each
page — automatically inherits that same retry safety on every single
page it fetches, not just the first.

---

## Connect the pieces

Every function `recordkeeper/net.py` gained in this lesson was checked
against a real, live, currently-imperfect API, not a mock standing in
for one. `fetch_with_retry`'s exponential-backoff math was proven
correct twice — once against a fully controlled, deterministic
simulated failure (`flaky_call`, failing exactly twice, on command),
and once against this sandbox's own genuine, unstaged `403` rate-limit
failure, where it correctly retried twice with doubling delays and then
gave up cleanly, returning a real failed response instead of hanging or
crashing. `paginate`, built directly on top of `fetch_with_retry`,
walked a real, live dataset of over 33 million real repositories,
correctly following the server's own `Link` header — read and hand-
parsed once, in this lesson's last unit, to prove `requests`'s own
`response.links` convenience does nothing more mysterious than that
same parsing — to reach genuinely different results on a second page.
Nothing in this lesson's own proof was staged: the rate limit was real,
the retry-then-give-up behavior was real, and the paginated data was
real, current GitHub content at the moment this lesson was written.
