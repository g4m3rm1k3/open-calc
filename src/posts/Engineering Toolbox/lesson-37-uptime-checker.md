# Lesson 37: Down, Refused, and Slow Are Three Different Failures

## What you will build

A website uptime checker that tells the difference between three
genuinely different ways a site can be unreachable — refusing the
connection outright, accepting it and then never responding, and
responding with an error status — plus a monitor that only raises an
alert when the site's status actually *changes*, not on every single
failed check. The transferable problem this lesson is actually about:
"is it up?" sounds like a yes/no question, but a program checking it
needs to handle several distinct failure shapes correctly, and a naive
alerting loop that fires on every check rather than every *change* turns
one real outage into hundreds of duplicate alerts.

## What you need to know first

- **Lesson 24** — the raw HTTP request/response format this lesson's
  `check_website` reuses directly: build the request text by hand, send
  it, parse the status line out of the response.
- **Lesson 33** — `time.monotonic()` for measuring elapsed duration, and
  the general shape of a repeating check loop, both reused (though not
  re-implemented) here.
- **Lesson 36** — this lesson's natural next step is emailing an alert
  the moment a site goes down, using exactly the `send_report_email`
  built there; not re-built in this lesson, only referenced.

---

## The Problem, in prose, no code yet

"Check if the website is up" sounds like it needs one boolean. In
practice, three quite different things can happen when a check fails,
and treating them as the same "down" hides real, useful information:
the server's process might not be running at all (the operating system
immediately refuses the connection); the server might be running but
completely stuck — accepting the connection, then never sending anything
back at all; or the server might respond promptly with an error status
code, meaning it's very much alive but reporting a real problem. A
monitor that can't tell these apart can't tell an operator anything more
useful than "something, somewhere, is wrong" — and a monitor that alerts
on every single failed check, rather than only when the status actually
changes, trains whoever's receiving those alerts to ignore them.

---

## Concept Unit: A Socket That Might Never Answer

### The Problem

Every socket call this curriculum has used so far — `recv()`, `connect()`
— blocks indefinitely by default: if the other side never responds, the
call simply never returns. For most of this curriculum that's been fine,
because the other side has always been code built in the same lesson,
known to behave. A website being *checked* might genuinely never
respond — that's exactly the failure being tested for — and a checker
that can hang forever waiting for a reply is not a working checker at
all.

### Introduce the concept in isolation

```python
import socket
import threading
import time

def run_silent_server(port):
    server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    server_socket.bind(("localhost", port))
    server_socket.listen()
    connection, _ = server_socket.accept()
    time.sleep(10)  # accepts, then never sends anything back

threading.Thread(target=run_silent_server, args=(9700,), daemon=True).start()
time.sleep(0.3)

client_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
client_socket.settimeout(1.0)
client_socket.connect(("localhost", 9700))

start_time = time.monotonic()
try:
    client_socket.recv(4096)
except socket.timeout:
    elapsed = time.monotonic() - start_time
    print(f"recv() timed out after {elapsed:.2f} seconds, as configured")
```

Run it:

```
recv() timed out after 1.00 seconds, as configured
```

What this proves: `client_socket.settimeout(1.0)` (**first appearance**)
tells this specific socket object that *any* blocking operation on it —
`connect()`, `recv()`, `send()` — should give up and raise `socket.timeout`
(**first appearance**) after 1 second of waiting, rather than blocking
forever. The server in this lab deliberately never sends a reply (a real
`sleep(10)`, far longer than the 1-second timeout), and the measured
elapsed time — `1.00` seconds, not `10` — proves the timeout actually
fired and interrupted the wait, rather than the call simply happening to
return quickly on its own.

This lab is deleted now; it never appears in the project. What survives
is the technique: set a timeout before connecting, and be ready to catch
`socket.timeout` specifically.

### CS Lens

This is **bounded blocking** — trading away the guarantee of eventually
getting a real answer for the guarantee of eventually getting *some*
answer, even if that answer is "I gave up waiting." Any program that
must remain responsive while depending on an untrusted external system
needs this trade.

Also recognized in: HTTP client libraries' own default or configurable
timeouts, database connection pools that abandon a query after a fixed
duration, circuit breakers in distributed systems that stop calling a
consistently slow dependency entirely for a while.

### SE Lens

Python could have made every socket operation time out by default. It
doesn't, because a default timeout would be wrong for the many cases
where "wait as long as it takes" is the actually correct behavior — a
large file transfer, a long-lived chat connection like Lesson 20's. Making
the timeout opt-in, per socket, means each piece of code states its own
correct tolerance explicitly, rather than inheriting a one-size-fits-all
guess.

---

## Concept Unit: Three Different Failures, Told Apart

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** new file, `uptime_checker.py`.
- **Change type:** add.
- **Dependencies:** `socket`, `time` — standard library only.

### The New Code

```python
class CheckResult:
    def __init__(self, is_up, detail, response_time_seconds=None):
        self.is_up = is_up
        self.detail = detail
        self.response_time_seconds = response_time_seconds

    def __repr__(self):
        if self.response_time_seconds is not None:
            return f"CheckResult(is_up={self.is_up}, detail={self.detail!r}, response_time={self.response_time_seconds:.3f}s)"
        return f"CheckResult(is_up={self.is_up}, detail={self.detail!r})"


def check_website(host, port, path="/", timeout_seconds=2.0):
    start_time = time.monotonic()
    try:
        check_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        check_socket.settimeout(timeout_seconds)
        check_socket.connect((host, port))

        request = f"GET {path} HTTP/1.1\r\nHost: {host}\r\nConnection: close\r\n\r\n"
        check_socket.sendall(request.encode("utf-8"))

        response_bytes = check_socket.recv(4096)
        check_socket.close()

        response_text = response_bytes.decode("utf-8")
        status_line = response_text.split("\r\n")[0]
        status_code = int(status_line.split(" ")[1])

        response_time_seconds = time.monotonic() - start_time

        if 200 <= status_code < 300:
            return CheckResult(True, f"status {status_code}", response_time_seconds)
        return CheckResult(False, f"status {status_code}", response_time_seconds)

    except socket.timeout:
        return CheckResult(False, f"timed out after {timeout_seconds}s")
    except ConnectionRefusedError:
        return CheckResult(False, "connection refused")
```

### The Updated Project

Two new, freestanding definitions with nothing surrounding them yet.

### Mechanical Walkthrough

- `class CheckResult:` and `__init__` — reused class-definition syntax;
  a small **data class** (a class whose entire job is holding related
  values together, not appearing under that name before this curriculum
  but a shape already used informally, e.g. Lesson 30's frame tuples).
- `__repr__` — a **hard concept reappearing** from Lesson 68's
  `DynamicArray.__repr__`: controls how an instance prints, used
  throughout this lesson's test output.
- `check_socket.settimeout(timeout_seconds)` then `.connect(...)` — the
  previous unit's lab technique, applied for the first time to `connect()`
  itself, not just `recv()`: a timeout on a socket applies to *any*
  blocking call on it, including the initial connection attempt, which
  matters because a server on an unreachable network (as opposed to one
  actively refusing) can hang at the `connect()` stage just as easily as
  at `recv()`.
- Building and sending the request — a **hard concept reappearing**,
  identical to Lesson 24's raw HTTP client and Lesson 31's
  `parse_request_line_and_headers` counterpart.
- `status_line.split(" ")[1]` — reused string splitting and indexing;
  extracts just the numeric status code (`"200"`) from a status line like
  `"HTTP/1.1 200 OK"`, then `int(...)` converts it to a real number for
  the range comparison that follows.
- `time.monotonic() - start_time` — a **hard concept reappearing** from
  Lesson 32/33: elapsed-time measurement, used here to record how long a
  *successful* check took, which is itself useful monitoring data (a site
  can be "up" but dangerously slow).
- `if 200 <= status_code < 300:` — reused chained comparison; the `2xx`
  range Lesson 24 onward has already established as "success."
- `except socket.timeout:` — catches specifically the timeout case from
  the previous unit, distinct from every other possible failure.
- `except ConnectionRefusedError:` — a **hard concept reappearing** from
  Lesson 32's own "what breaks" section: the operating system's own
  immediate refusal when nothing is listening on the target port at all
  — a fundamentally different situation from a timeout, and given its own
  distinct message here rather than being lumped in with it.

### Run it

Against three real, distinct conditions — a healthy local test server, a
local server that accepts connections but never responds, and a port
with nothing listening on it at all:

```python
print("healthy site:", check_website("localhost", 9000))
print("hanging site:", check_website("localhost", 9001, timeout_seconds=1.0))
print("nothing listening:", check_website("localhost", 9999))
```

```
healthy site: CheckResult(is_up=True, detail='status 200', response_time=0.001s)
hanging site: CheckResult(is_up=False, detail='timed out after 1.0s')
nothing listening: CheckResult(is_up=False, detail='connection refused')
```

All three failure-relevant fields are correct and distinct: the healthy
site reports `is_up=True` with a real, tiny response time; the hanging
site correctly reports a timeout, not a refusal, after (approximately)
the configured 1-second limit; the empty port correctly and immediately
reports a refusal, not a multi-second timeout — proving `connect()`
itself fails fast when nothing is listening at all, rather than waiting
out the full timeout unnecessarily.

### CS Lens

This is **error discrimination** — catching the general category
(anything could go wrong) as several specific, individually meaningful
cases rather than one catch-all. A bare `except:` around the whole
function would technically "work" (nothing would crash) but would throw
away exactly the information — *which* kind of failure — that makes the
result useful to whoever reads it later.

Also recognized in: HTTP status codes themselves (`404` versus `500`
versus `503` are different failures a client can react to differently),
database driver exceptions (a unique-constraint violation versus a lost
connection require completely different recovery code), any real
production monitoring dashboard that distinguishes "timeout" from
"5xx error" from "connection refused" as separate, individually-tracked
metrics.

### SE Lens

`check_website` deliberately returns a `CheckResult` object rather than
raising an exception for the failure cases, even though exceptions were
used internally to detect them. That's a deliberate boundary: exceptions
are the right tool *inside* this function, where "timeout" and
"refused" really are exceptional, unusual conditions relative to normal
control flow — but to the *caller*, a failed check is an entirely
expected, ordinary outcome of monitoring something that might be down,
not something exceptional at all. Converting from "exception" to "normal
return value" at exactly this boundary keeps the calling code (the next
unit) simple, ordinary `if` logic, rather than a `try`/`except` wrapped
around every single check.

---

## Concept Unit: Alerting Only When Something Actually Changes

### The Problem

A monitor that emails an alert every time a check fails, if a site is
down for an hour and checked every minute, sends sixty near-identical
emails for what is, from a human's perspective, a single event: the site
going down. The useful signal isn't "is it down right now" repeated
endlessly — it's "did it just *become* down," and separately, "did it
just become up again."

### Introduce the concept in isolation

```python
from uptime_checker import CheckResult

def alerts_from_results(results, previously_up=True):
    alerts_sent = []
    currently_up = previously_up
    for check_number, result in enumerate(results, start=1):
        print(f"check {check_number}: {result}")
        if result.is_up != currently_up:
            if result.is_up:
                alerts_sent.append(f"RECOVERED ({result.detail})")
            else:
                alerts_sent.append(f"DOWN ({result.detail})")
            currently_up = result.is_up
    return alerts_sent

simulated_sequence = [
    CheckResult(True, "status 200", 0.010),
    CheckResult(True, "status 200", 0.011),
    CheckResult(False, "connection refused"),
    CheckResult(False, "connection refused"),
    CheckResult(False, "timed out after 2.0s"),
    CheckResult(True, "status 200", 0.012),
]

alerts = alerts_from_results(simulated_sequence)
print()
print("=== alerts that would have been emailed ===")
for alert in alerts:
    print(alert)
```

Run it:

```
check 1: CheckResult(is_up=True, detail='status 200', response_time=0.010s)
check 2: CheckResult(is_up=True, detail='status 200', response_time=0.011s)
check 3: CheckResult(is_up=False, detail='connection refused')
check 4: CheckResult(is_up=False, detail='connection refused')
check 5: CheckResult(is_up=False, detail='timed out after 2.0s')
check 6: CheckResult(is_up=True, detail='status 200', response_time=0.012s)

=== alerts that would have been emailed ===
DOWN (connection refused)
RECOVERED (status 200)
```

What this proves: six checks, three of them reporting "down" (two by
refusal, one by timeout — a real site outage plausibly looks exactly
like this, the specific failure mode sometimes changing mid-outage), and
yet exactly **two** alerts were generated, not three or six — one at the
moment the state first flipped from up to down, and one at the moment it
flipped back. Checks 3, 4, and 5 all report `is_up=False`, but only check
3 triggers an alert, because `currently_up` was already `False` by the
time checks 4 and 5 ran.

This lab is deleted now — its exact shape survives directly into
`monitor.py` next, since the concept and the eventual project code are
identical here; the "lab" and the implementation are the same function
for a case this small, per the same reasoning Track 10's `Stack` and
`Queue` units used directly under their real names.

### CS Lens

This is **edge detection** — reacting to the *transition* between two
states rather than to the state itself, sampled repeatedly. The name
comes directly from digital electronics: a circuit that reacts to a
signal changing from low to high (a "rising edge") rather than to the
signal simply *being* high, which might be true for a long, uninteresting
stretch of time.

Also recognized in: keyboard event handling (`keydown` fires once when a
key is pressed, not repeatedly while held — the "held" case is a
separate signal entirely), version control diffs (showing only *changed*
lines, not the entire file every time), real production monitoring and
alerting systems (PagerDuty, Nagios, and similar tools all implement
exactly this pattern, usually calling it "state change" or
"flap detection").

### SE Lens

Storing `currently_up` as state that persists *across* calls (in
`monitor_website`, this would live for the lifetime of one monitoring
run) is a deliberate, necessary use of mutable state in an otherwise
mostly-stateless lesson — comparing a check only against fixed rules
(Lesson 31's routing table, Lesson 32's rate limit) never needed memory
of *previous* checks the way detecting a transition inherently does. The
tradeoff worth naming: this state lives only in one running process's
memory, so a monitor that gets restarted mid-outage will treat the very
next check as a "fresh" state with no memory of the prior outage,
potentially re-alerting or missing a genuine recovery notification — a
real limitation a production monitoring system solves by persisting this
state externally, out of scope for this lesson.

---

## Connect the pieces

One outage, followed through both units: a site that was healthy stops
responding. `check_website` correctly reports this as either `"timed out
after 2.0s"` or `"connection refused"`, depending on exactly how the
server failed — both are real, distinct outcomes this lesson proved
`check_website` tells apart correctly. That `CheckResult` flows into the
transition-tracking logic, which compares it against `currently_up`
(still `True` from the last successful check) and, finding a mismatch,
generates exactly one `"DOWN"` alert — not one per subsequent failed
check, no matter how long the outage lasts, until a later check finally
reports `is_up=True` again and triggers exactly one `"RECOVERED"` alert
in turn.

## What breaks without this

Remove the `if result.is_up != currently_up:` guard entirely and alert on
every failed check instead, rerunning the same six-result sequence from
above:

```
DOWN (connection refused)
DOWN (connection refused)
DOWN (timed out after 2.0s)
RECOVERED (status 200)
```

Three near-duplicate "DOWN" alerts for what was, from a human operator's
perspective, a single ongoing outage — and in a real deployment checking
every minute rather than six times in a row, a multi-hour outage would
produce not three but dozens of identical emails. Restoring the
state-comparison guard collapses this back to exactly one alert per real
transition.

## Definition of done

- [ ] `check_website` against a real healthy local server returns
      `is_up=True` with a real, small `response_time_seconds`.
- [ ] `check_website` against a server that accepts but never responds
      returns `is_up=False` with a timeout detail, after approximately
      the configured `timeout_seconds` — not immediately, and not never.
- [ ] `check_website` against a port with nothing listening returns
      `is_up=False` with a `"connection refused"` detail, quickly, not
      after waiting out the full timeout.
- [ ] A sequence of results with 3 consecutive "down" results produces
      exactly one `"DOWN"` alert, not three.
- [ ] You can explain, without looking back at this lesson, why
      `check_website` returns a `CheckResult` for failures instead of
      raising an exception all the way out to the caller.
- [ ] Commit with a message explaining why, not just what:

  ```
  git add uptime_checker.py monitor.py
  git commit -m "Add uptime checker distinguishing timeout/refused/error-status, plus edge-detection alerting so a sustained outage produces one alert, not one per check"
  ```

## What's next

`monitor_website` currently only prints what it would have alerted;
wiring its `"DOWN"`/`"RECOVERED"` strings into Lesson 36's
`send_report_email`, and running the whole thing under Lesson 33's
drift-corrected loop (or Lesson 34's `cron`, for the same
survives-a-restart reasoning that lesson made), completes the loop this
lesson's own "what you will build" opened with — each piece already
independently verified in its own lesson, assembled here rather than
re-proven from scratch.
