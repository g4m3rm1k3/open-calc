# Lesson 23: Three Ways a Port Can Answer
### (Port Scanner)

**What you will build.** `scan_range(host, start_port, end_port)` — a
real port scanner: for every port in a range, attempt a TCP connection
and report whether it's open. The working feature is small — it's just
Lesson 18's `connect()`, tried repeatedly. The transferable problem
underneath: a port doesn't just answer "open" or "closed" — there's a
real third case, a **filtered** port that never answers at all, and
that third case is exactly why a careless scanner can take orders of
magnitude longer than it should, or hang altogether.

**Pipeline so far:** unchanged — `Program → Socket → Network → Socket
→ Program` — this lesson reuses `connect()` from Lesson 18 directly,
just interpreting its *outcome* rather than proceeding to exchange
data.

**What you need to know first.** From Lesson 18: creating a socket,
`connect()`. From Lesson 21: `socket.timeout`, `settimeout()`. New in
this lesson: `connect_ex()`.

**An honesty note on how the filtered-port case was tested.** This
sandbox's network rules reject outbound connections to arbitrary
external addresses immediately, rather than letting them hang — so a
genuinely unresponsive "filtered" port couldn't be demonstrated against
a real external host. Since this environment runs as root, a real
local firewall rule (`iptables`, installed fresh for this lesson) was
used instead, to genuinely drop packets to one local port and produce
a real, non-simulated hang.

---

## Concept Unit: `connect_ex()`

### The Problem

Lesson 18's `connect()` either succeeds silently or raises an exception
— fine for a program expecting one specific outcome, but a scanner
needs to try *many* ports and keep going regardless of what happens
each time, without wrapping every single attempt in `try`/`except`.

### Introduce the Concept in Isolation

```python
import socket

# a real, currently-listening port (Lesson 19's echo server)
s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
result = s.connect_ex(("127.0.0.1", 65433))
print("port 65433 (open):", result)
s.close()

# a real port with nothing listening
s2 = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
result2 = s2.connect_ex(("127.0.0.1", 65499))
print("port 65499 (closed):", result2)
s2.close()
```

Run it, against a real running echo server and a genuinely empty port:

```
port 65433 (open): 0
port 65499 (closed): 111
```

This proves `connect_ex()` — unlike plain `connect()` — returns an
**error code** instead of raising an exception: `0` means success
(the connection genuinely succeeded), and any nonzero value (`111` here
— the real `ECONNREFUSED` code) means it failed, with no `try`/`except`
required at all. This throwaway example is discarded; the real project
wraps this into a reusable function.

### Discard the Throwaway Example

Discarded.

### Project Change

- **Files affected:** `port_scanner.py` (new file)
- **Change type:** create
- **Location:** top of the file — nothing exists yet
- **Dependencies:** `socket` module

### The New Code

```python
import socket

def scan_port(host, port, timeout=1):
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.settimeout(timeout)
    result = s.connect_ex((host, port))
    s.close()
    return result == 0
```

### The Updated Project

This is the entire file so far:

```python
import socket

def scan_port(host, port, timeout=1):        # ← new
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)  # ← new
    s.settimeout(timeout)                                     # ← new
    result = s.connect_ex((host, port))                          # ← new
    s.close()                                                       # ← new
    return result == 0                                                # ← new
```

`scan_port()` now checks a single port and returns a plain `True`/
`False` — genuinely open, or not — with `timeout` (default 1 second,
per Lesson 21's `settimeout()`, reminder) bounding how long any single
check can take.

### Mechanical Walkthrough
- `import socket` — reminder.
- `def scan_port(host, port, timeout=1):` —
default argument, reminder. `s = socket.socket(socket.AF_INET,
- socket.SOCK_STREAM)` — Lesson 18, reminder — deliberately `SOCK_STREAM`
(TCP), since "is this TCP port open" is exactly what a `connect()`
- attempt answers.
- `s.settimeout(timeout)` — Lesson 21, reminder.
- `result = s.connect_ex((host, port))` — the concept from this unit's lab, reused for real.
- `s.close()` — closing the socket directly rather than

via `with`, since this function returns a plain boolean, not something
that needs the connection to stay open afterward. `return result == 0`
- — translating the raw error code into the simple `True`/`False` the
rest of the scanner actually wants to work with.

### CS Lens

Returning an error *code* rather than raising an exception is itself a
real, recognizable pattern — many lower-level system APIs (this
curriculum's own Lesson 22 touched raw protocol-level work; C's system
calls broadly work this way) report success/failure as a return value,
with the caller responsible for checking it, rather than using
exceptions at all. Python's own standard library mostly prefers
exceptions (as `connect()` itself does) — `connect_ex()` exists
specifically as the deliberate exception to that convention, for
exactly this kind of "try many things, keep going regardless" use case.

### SE Lens

A one-second default `timeout` is a real, deliberate tradeoff: too
short, and a genuinely slow-but-real service might be wrongly reported
as unreachable; too long, and — as this lesson's closing section proves
directly — a single filtered port can dominate an entire scan's runtime.
There's no universally correct value; real scanning tools typically
make this configurable for exactly this reason.

### Commands Needed

None.

### Run It

Not runnable for a full scan yet — `scan_port()` checks one port; the
next unit checks a whole range.

### Connection

We can check any single port cleanly. The next unit loops this over a
real range and reports what's actually open.

---

## Concept Unit: Scanning a Range

### The Problem

A useful scanner checks many ports, not just one, and reports which
ones are genuinely open — reusing `scan_port()` in a loop is the whole
idea; nothing new conceptually, but worth seeing assembled and run for
real.

### Project Change

- **Files affected:** `port_scanner.py`
- **Change type:** add — a new function
- **Location:** after `scan_port()`
- **Dependencies:** `scan_port`

### The New Code

```python
def scan_range(host, start_port, end_port, timeout=1):
    open_ports = []
    for port in range(start_port, end_port + 1):
        if scan_port(host, port, timeout):
            print(f"port {port}: OPEN")
            open_ports.append(port)
    return open_ports
```

### The Updated Project

```python
import socket

def scan_port(host, port, timeout=1):
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.settimeout(timeout)
    result = s.connect_ex((host, port))
    s.close()
    return result == 0


def scan_range(host, start_port, end_port, timeout=1):     # ← new
    open_ports = []                                            # ← new
    for port in range(start_port, end_port + 1):                  # ← new
        if scan_port(host, port, timeout):                            # ← new
            print(f"port {port}: OPEN")                                  # ← new
            open_ports.append(port)                                        # ← new
    return open_ports                                                        # ← new
```

`port_scanner.py` is now complete: a real, working range scanner.

### Mechanical Walkthrough
- `open_ports = []` — basic.
- `for port in range(start_port, end_port + 1):` — `range()` (Lesson 5, reminder), `+ 1` because `range()`'s stop

value is exclusive and a real scan range should include its own end
- port.
- `if scan_port(host, port, timeout):` — calling this lesson's first unit's function directly.
- `open_ports.append(port)` — basic list

building.

### CS Lens

Not new — skipped per the Stopping Rule; this is direct reuse of
already-covered concepts.

### SE Lens

Scanning ports strictly in order, one at a time, is the simplest
correct approach — and, as the closing section proves, also the
slowest possible one whenever a filtered port is involved. A real
scanner (`nmap`, for instance) checks many ports *concurrently*
(Track 11's threading/async lessons cover exactly the tools that would
make this possible) specifically to avoid one slow port blocking every
port after it — a real, deliberate optimization this lesson's version
doesn't include, left honestly as a limitation rather than solved here.

### Commands Needed

`python3 port_scanner.py` — runs it.

### Run It — Real Output

Against a real range including one genuinely open port (Lesson 19's
echo server, actually running on port 65433) and several genuinely
closed ones:

```python
scan_range("127.0.0.1", 65430, 65435)
```

```
$ python3 port_scanner.py
port 65433: OPEN
```

Real output — the scanner correctly found the one real open port among
six checked, and reported nothing for the five genuinely closed ones.

### Connection

The scanner works correctly. The closing section is where its real
cost becomes visible — not through a code change, but through timing a
port that never answers at all.

---

## Closing

### Connect the Pieces

Trace one scanned port end to end: `scan_range()`'s loop reached port
`65433`. `scan_port()` created a fresh socket, set its timeout, and
called `connect_ex()` — the OS attempted a real TCP handshake, the real
echo server (Lesson 19) accepted it, and `connect_ex()` returned `0`
almost instantly. `result == 0` was `True`; the port was recorded as
open and printed. Every closed port in the range followed the identical
path but received a real, immediate `ECONNREFUSED` instead — also
fast, just a different real outcome.

### What Breaks Without This

A **filtered** port — one where packets are genuinely dropped rather
than actively refused — is a real, different third case neither
"open" nor "closed" covers. Using a real local firewall rule
(`iptables -A INPUT -p tcp --dport 65460 -j DROP`) to actually drop
packets to one specific port, then timing three real, different
outcomes side by side:

```python
for port in [65433, 65499, 65460]:  # open, closed, genuinely filtered
    start = time.time()
    is_open = scan_port("127.0.0.1", port, timeout=2)
    elapsed = time.time() - start
    print(f"port {port}: open={is_open}, took {elapsed:.2f}s")
```

Real output:

```
port 65433: open=True, took 0.00s
port 65499: open=False, took 0.00s
port 65460: open=False, took 2.00s
```

Real, direct proof: the open and closed ports both resolved
essentially instantly — but the single genuinely filtered port
consumed the **entire** timeout window, every time, because there was
never any response to wait for at all — only the timeout itself ever
ends that wait. Scanning even a modest range where a handful of ports
are filtered, at this lesson's default of a 1-second timeout each,
means real minutes added to a scan that would otherwise finish in a
fraction of a second — and with no `settimeout()` at all (confirmed
separately: a fresh socket's default timeout is `None`, meaning
"block forever"), a single filtered port could hang the *entire* scan
indefinitely, never reaching any port after it.

### Exercises

1. Time a full scan of a wider range (say, 100 ports) with `timeout=2`
   versus `timeout=0.2` — confirm the real total time difference, and
   think about what a real scan of thousands of ports would cost at
   each setting.
2. Add a third possible result to `scan_port()` — distinguishing a
   genuine `ECONNREFUSED` (`errno 111`) from a timeout, by catching
   `socket.timeout` separately and reporting `"filtered"` instead of
   just `False`.
3. If you have access to a machine outside this sandbox, try scanning
   a real external host's common ports (with permission — port
   scanning systems you don't own or have authorization for is a real
   ethical and often legal line) and observe genuine filtered-port
   behavior against real network infrastructure, not a local firewall
   rule.

### Definition of Done

- [ ] `port_scanner.py` runs and correctly identifies a real open port
      you set up yourself (an echo server or similar) among a range of
      closed ones
- [ ] You measured a real, genuinely filtered port's scan time
      directly and confirmed it consumed the full timeout, unlike the
      open/closed cases
- [ ] You can explain, without looking back, why `connect_ex()` was
      chosen over plain `connect()` for this specific task
- [ ] Commit:

```
git add port_scanner.py
git commit -m "Add a TCP port scanner: prove a port has three real outcomes, not two, and that an unanswered (filtered) port costs the full timeout, not nothing"
```
