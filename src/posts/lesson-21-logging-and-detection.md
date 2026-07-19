# Lesson 21: Logging and Detection

## What you will build

A log file that leaks a password just by doing its job correctly, a second log file an
attacker forges a fake entry into using nothing but a newline character, and a small
detector that scans real log data to catch a brute-force attempt and a SQL injection
attempt automatically, using nothing more than the patterns this entire course has already
taught you to recognize by eye. The transferable problem, and the course's closing one:
every lesson before this assumed prevention — stop the bug before it's exploited. This
lesson is about the case prevention doesn't cover: what tells you an attack happened at
all, after the fact, when nothing crashed and nothing looked wrong at the time.

## What you need to know first

Lesson 2 (CIA Triad) — the brute-force detector in this lesson's final unit is a real,
working version of that lesson's `Doorbell` example, this time watched from the outside
rather than exploited from within. Lesson 4 (SQL Injection) and Lesson 20 (Secure Code
Review) — the SQL injection detector recognizes the exact `UNION SELECT` payload shape
both of those lessons used. Lesson 6's Recognition list named "log injection" as a pattern
to expect; this lesson is where that promise is paid off in full.

---

## Concept Unit: What Logging Actually Protects You From, and What It Can Betray

### The Problem

A log's entire purpose is recording what happened, accurately, for later review — which
means anything written into a log is, by definition, something someone intends to read
later. This unit asks what happens when what gets written includes something that should
never be read by anyone at all.

### Introduce the Concept in Isolation

```python
def log_request(method, path, remote_addr):
    with open("access.log", "a") as f:
        f.write(f"{method} {path} from {remote_addr}\n")

log_request("GET", "/login?username=ada&password=hunter2", "203.0.113.7")
log_request("GET", "/ticket/1", "203.0.113.7")

with open("access.log") as f:
    print(f.read())
```

Run it:

```
GET /login?username=ada&password=hunter2 from 203.0.113.7
GET /ticket/1 from 203.0.113.7
```

This output proves that `log_request`, written with no malicious intent and doing exactly
what a request logger is supposed to do — record the method, path, and source of every
request — has written Ada's real, working password into a plaintext file on disk, `open(
..., "a")`'s append mode meaning this file grows forever, every subsequent request adding
another line without ever removing an earlier one. This is Lesson 19's entire lesson,
reappearing in a place that lesson didn't explicitly cover: a log file is exactly as
capable of leaking a secret as a hardcoded config value or a committed git history, and is
frequently granted far looser read permissions, precisely because logs feel like
operational data rather than sensitive data.

### Discard

`naive_logging.py` and `access.log` are deleted now. They never appear again in this
lesson — they existed only to prove that logging, done carelessly, creates a new secrets
exposure rather than only solving the detection problem this lesson is otherwise about.

### Where This Lives

This lesson's remaining units build three further standalone scripts —
`log_injection.py`, `log_injection_fixed.py`, and `detector.py` — none dependent on this
unit's files.

### CS Lens

```
Also recognized in: PCI-DSS and similar compliance standards, which explicitly
prohibit logging full credit card numbers or passwords for exactly this reason,
and "sensitive data exposure" as its own named category in security audit
findings, distinct from the injection and access-control categories Lesson 20
already covered -- logs are commonly the single largest source of this category
in real audits, precisely because logging code is rarely reviewed with the same
scrutiny as authentication or query code.
```

### SE Lens

The alternative not shown here, and worth naming directly: a real logging setup
distinguishes fields that are safe to log from fields that are not, at the point the log
call is made — logging `username` but never `password`, or hashing/truncating an
identifier before it's written. That distinction has to be made deliberately, field by
field, because nothing about `f"{method} {path} ..."` — a completely ordinary string
format operation — carries any signal that `path` might contain a password. The cost of
skipping this deliberate review is exactly what this unit just demonstrated: a leak that
looks, at the code level, identical to a perfectly correct logging statement.

---

## Concept Unit: Log Injection — Forging a Fake Event

### The Problem

A log file is also, itself, something an attacker's input can reach — every previous
Concept Unit in this course asked what happens when untrusted input meets an interpreter
with its own grammar (SQL, a shell, HTML). A log file has a grammar too, even if it's
informal: one line per event. This unit asks what an attacker can do by controlling where
one line ends and the next begins.

### Introduce the Concept in Isolation

```python
def log_login_attempt(username, outcome):
    with open("auth.log", "a") as f:
        f.write(f"login attempt: username={username} outcome={outcome}\n")

log_login_attempt("ada", "failed")

malicious_username = "eve\nlogin attempt: username=admin outcome=success"
log_login_attempt(malicious_username, "failed")

with open("auth.log") as f:
    print(f.read())
```

Run it:

```
login attempt: username=ada outcome=failed
login attempt: username=eve
login attempt: username=admin outcome=success outcome=failed
```

This output proves the injection: `malicious_username` contained a literal newline
character (`\n`), and `f.write` wrote that newline exactly as given — the log file now
contains **three** lines from **two** calls to `log_login_attempt`, and the third line —
`login attempt: username=admin outcome=success` — is a complete, well-formed, entirely
fabricated log entry that no real login attempt ever produced. A tool scanning this file
line by line for `outcome=success` cannot distinguish this forged line from a genuine one;
nothing in the file marks it as injected.

### Discard

`log_injection.py` is deleted now. It never appears again in this lesson.

### Where This Lives

**File:** `log_injection_fixed.py` (new file, based on the throwaway example above).

### The New Code

```python
def log_login_attempt(username, outcome):
    safe_username = username.replace("\n", "\\n").replace("\r", "\\r")
    with open("auth_fixed.log", "a") as f:
        f.write(f"login attempt: username={safe_username} outcome={outcome}\n")
```

### The Updated Project

```python
def log_login_attempt(username, outcome):
    safe_username = username.replace("\n", "\\n").replace("\r", "\\r")  # ← new
    with open("auth_fixed.log", "a") as f:
        f.write(f"login attempt: username={safe_username} outcome={outcome}\n")

log_login_attempt("ada", "failed")
malicious_username = "eve\nlogin attempt: username=admin outcome=success"
log_login_attempt(malicious_username, "failed")
```

`log_login_attempt`'s overall shape is unchanged — write one line per call — but
`username` is now sanitized before it ever reaches the write.

### Mechanical Walkthrough

- `username.replace("\n", "\\n")` — **(a) first appearance in this lesson, reapplying an
  already-basic method**: replaces every literal newline character in `username` with the
  two-character, visible escape sequence `\n` (backslash, then the letter `n`) — the
  string now contains text that *describes* a newline rather than an actual line break.
- `.replace("\r", "\\r")` — **(c) already basic**, same method, applied to the carriage
  return character, the second line-ending character relevant on some systems and log
  tools.

### CS Lens

This is Lesson 4, 5, and 6's exact fix philosophy, reapplied to a new grammar: a log
file's implicit rule, "one event per newline-terminated line," is exactly as much a
grammar as SQL's or a shell's, and untrusted data reaching it unescaped is exactly as
dangerous. **Output encoding** — Lesson 6's term for this fix — applies here precisely:
encode the data so the character that has special meaning to the log format (`\n`, ending
a record) can no longer be produced by attacker-controlled input, without losing any
information (the escaped `\n` is still fully visible in the log, just no longer live).

```
Also recognized in: CSV injection (a spreadsheet cell beginning with `=` being
interpreted as a formula by the spreadsheet application that opens the exported
file), CRLF injection into HTTP response headers (forging additional headers by
injecting `\r\n` into a value that gets echoed into a raw header), and any
structured text format -- YAML, INI files, even shell scripts generated from
templates -- where a delimiter character reaching untrusted data unescaped
reproduces this exact vulnerability shape.
```

### SE Lens

The alternative this fix doesn't take, and a stronger one for systems that need to
support real automated log analysis, is **structured logging**: writing each log entry as
a JSON object rather than a hand-formatted string, where a logging library handles
correct escaping of every field automatically and a downstream parser reads well-defined
fields rather than pattern-matching raw text. The two-line `.replace()` fix shown here
is cheap and fixes this specific attack, but a real production system logging at any
meaningful scale should reach for structured logging from the start rather than manually
escaping every interpolated field by hand, for the same "one missed call site is enough"
reason Lesson 20's SE Lens gave for `strcpy`.

### Commands Needed

No new tools — verifying the fix only needs comparing record counts, shown next.

### Run It

```
$ wc -l auth.log auth_fixed.log
  3 auth.log
  2 auth_fixed.log
$ grep "^login attempt: username=admin" auth_fixed.log
(no output -- no standalone admin record exists)
```

The vulnerable log genuinely contains three distinct lines from two calls — the forgery
succeeded structurally. The fixed log contains exactly two lines, matching the two real
calls made, and no line begins with a forged, standalone `username=admin` record — the
entire malicious payload is now confined, visibly, inside the one line it actually
belongs to, correctly attributed to the `eve` attempt that produced it.

This unit's fix connects directly to the previous unit's failure: both are cases of
untrusted data reaching a file-write operation with no separation between "this is
content" and "this is structure" — the first unit leaked a secret by writing too much
faithfully; this unit forged an event by writing a control character too faithfully.

---

## Concept Unit: Detecting an Attack From Logs Alone

### The Problem

Every prevention technique this course has taught can fail — a zero-day, a
misconfiguration, a lesson's fix applied to one endpoint but forgotten on another, exactly
as Lesson 20's "what breaks without this" demonstrated. When prevention fails, a log —
assuming Concept Units one and two's lessons were followed — is often the only remaining
signal that anything happened at all. This unit asks whether that signal can be found
automatically, rather than requiring a human to read every line.

### Skip: Concept Already Lab'd

The two patterns this detector looks for — many failed logins from one source (Lesson 2's
`Doorbell`) and a `UNION SELECT`-shaped request (Lesson 4 and Lesson 20's Finding 1) — are
both fully taught already. This unit's new material is the detection *mechanism* itself:
scanning structured records for those already-known shapes automatically.

### Where This Lives

**File:** `detector.py` (new file). **Dependencies:** Python's standard library
`collections.defaultdict`.

### The New Code

```python
from collections import defaultdict

def detect_brute_force(entries):
    failures_by_ip = defaultdict(int)
    alerts = []
    for entry in entries:
        if entry["path"] == "/login" and entry["outcome"] == "failed":
            failures_by_ip[entry["ip"]] += 1
            if failures_by_ip[entry["ip"]] == FAILED_LOGIN_THRESHOLD:
                alerts.append(f"ALERT: {entry['ip']} has {FAILED_LOGIN_THRESHOLD}+ failed logins (possible brute force)")
    return alerts
```

### The Updated Project

```python
from collections import defaultdict

log_entries = [
    {"time": "10:00:01", "ip": "203.0.113.7", "path": "/login", "outcome": "failed"},
    {"time": "10:00:02", "ip": "203.0.113.7", "path": "/login", "outcome": "failed"},
    {"time": "10:00:03", "ip": "203.0.113.7", "path": "/login", "outcome": "failed"},
    {"time": "10:00:04", "ip": "203.0.113.7", "path": "/login", "outcome": "failed"},
    {"time": "10:00:05", "ip": "203.0.113.7", "path": "/login", "outcome": "failed"},
    {"time": "10:00:06", "ip": "203.0.113.7", "path": "/login", "outcome": "failed"},
    {"time": "10:01:00", "ip": "198.51.100.4", "path": "/search?q=printer", "outcome": "ok"},
    {"time": "10:01:05", "ip": "198.51.100.4", "path": "/search?q=' UNION SELECT username, password FROM users --", "outcome": "ok"},
    {"time": "10:02:00", "ip": "198.51.100.9", "path": "/ticket/1", "outcome": "ok"},
]

FAILED_LOGIN_THRESHOLD = 5

def detect_brute_force(entries):                              # ← new
    failures_by_ip = defaultdict(int)                            # ← new
    alerts = []                                                    # ← new
    for entry in entries:                                          # ← new
        if entry["path"] == "/login" and entry["outcome"] == "failed":  # ← new
            failures_by_ip[entry["ip"]] += 1                            # ← new
            if failures_by_ip[entry["ip"]] == FAILED_LOGIN_THRESHOLD:    # ← new
                alerts.append(f"ALERT: {entry['ip']} has {FAILED_LOGIN_THRESHOLD}+ failed logins (possible brute force)")  # ← new
    return alerts                                                          # ← new

SQLI_MARKERS = ["UNION SELECT", "--", "' OR '"]

def detect_sql_injection(entries):
    alerts = []
    for entry in entries:
        for marker in SQLI_MARKERS:
            if marker in entry["path"]:
                alerts.append(f"ALERT: {entry['ip']} sent a SQLi-shaped request: {entry['path']}")
                break
    return alerts

for alert in detect_brute_force(log_entries):
    print(alert)
for alert in detect_sql_injection(log_entries):
    print(alert)
```

`log_entries` is a sample of structured log records — the payoff of Concept Unit two's
"structured logging" SE Lens made concrete: each entry is a dictionary with named fields,
not a hand-parsed string, which is exactly what lets `detect_brute_force` and
`detect_sql_injection` read `entry["ip"]` and `entry["path"]` directly rather than needing
to parse free text first.

### Mechanical Walkthrough

- `defaultdict(int)` — **(a) first appearance**: a dictionary variant where accessing a
  key that doesn't exist yet doesn't raise `KeyError` — instead, it's automatically
  created with a default value, here `0` (the result of calling `int()` with no
  arguments), letting `failures_by_ip[entry["ip"]] += 1` work correctly even the very
  first time a given IP address is seen.
- `entry["path"] == "/login" and entry["outcome"] == "failed"` — **(c) already basic**:
  dictionary field access and boolean combination, familiar from every earlier lesson's
  data-handling code.
- `if failures_by_ip[entry["ip"]] == FAILED_LOGIN_THRESHOLD` — **(a) first appearance of
  the actual detection logic**: this check fires exactly once per IP — the moment its
  count *reaches* the threshold, not every time it's checked afterward — which is what
  keeps a sustained attack from generating a duplicate alert for every single subsequent
  failed attempt from the same source.
- `SQLI_MARKERS` and the nested `for marker in SQLI_MARKERS: if marker in entry["path"]`
  — **(b) hard concept reappearing**: this is Lesson 20's checklist, operationalized —
  the exact substrings (`UNION SELECT`, `--`, `' OR '`) that Lessons 4 and 20 taught by
  hand are now searched for automatically, across every logged request.

**Execution trace**, since `detect_brute_force` carries state across iterations:

```
entry 1 (203.0.113.7, failed): failures_by_ip['203.0.113.7'] 0 → 1
entry 2 (203.0.113.7, failed): failures_by_ip['203.0.113.7'] 1 → 2
entry 3 (203.0.113.7, failed): failures_by_ip['203.0.113.7'] 2 → 3
entry 4 (203.0.113.7, failed): failures_by_ip['203.0.113.7'] 3 → 4
entry 5 (203.0.113.7, failed): failures_by_ip['203.0.113.7'] 4 → 5  → ALERT fires here
entry 6 (203.0.113.7, failed): failures_by_ip['203.0.113.7'] 5 → 6  → no new alert
                                  (count no longer EQUALS the threshold, only exceeds it)
```

### CS Lens

`detect_brute_force` is a small, hand-built version of a **rule-based intrusion detection
system**: a fixed threshold, applied to a running count, triggering an alert on crossing.
`detect_sql_injection` is a small, hand-built version of a **signature-based detector**:
known-bad substrings, checked against every record. Both are genuinely how a large share
of real detection tooling works at its core, before layers of tuning, machine learning, or
correlation across multiple signals are added on top.

```
Also recognized in: fail2ban (a widely deployed real tool that does almost
exactly what detect_brute_force does -- watches logs, counts failures per
source, and temporarily blocks sources that cross a threshold), Web Application
Firewalls (WAFs), which apply signature lists similar to SQLI_MARKERS to live
traffic rather than after-the-fact logs, and SIEM (Security Information and
Event Management) platforms, which are, at industrial scale, this exact pattern:
structured log ingestion, rule-based and statistical detection, and alerting.
```

### SE Lens

The alternative not built here, and the primary limitation worth naming honestly: a fixed
threshold (`FAILED_LOGIN_THRESHOLD = 5`) trades directly between **false negatives** (an
attacker who fails 4 times, succeeds on the 5th genuine guess, and is never flagged
because the count never reached 5) and **false positives** (a real user who simply
mistypes their password 5 times in a row gets flagged identically to an attacker). Lowering
the threshold catches more real attacks and also flags more innocent mistakes; raising it
does the reverse. A production detection system tunes this tradeoff deliberately, often
per-context (a threshold appropriate for a public login page is too aggressive for an
internal admin tool with naturally clumsier, less frequent logins) — there is no
universally correct number, only an explicit, considered choice of which failure mode
(missing real attacks, or crying wolf on real users) the system would rather make more
often.

### Run It

```
ALERT: 203.0.113.7 has 5+ failed logins (possible brute force)
ALERT: 198.51.100.4 sent a SQLi-shaped request: /search?q=' UNION SELECT username, password FROM users --
```

Both attacks embedded in `log_entries` — a brute-force attempt spread across six log
lines, and a single SQL injection attempt disguised as an ordinary search — were
identified automatically, with no human reading required, using nothing but the patterns
this course already taught by hand across Lessons 2, 4, and 20.

This unit is the payoff the entire lesson was building toward: Concept Units one and two
made sure the log data itself could be trusted (no leaked secrets, no forged records);
this unit shows what becomes possible once it can be — automated detection of exactly the
attack classes this course spent twenty lessons teaching you to prevent.

---

## Connect the Pieces

Trace this lesson's three units end to end, then trace the whole course through it. A
request carrying a real password reaches a naive logger and is written to disk in
plaintext — Concept Unit one, and Lesson 19's exact failure mode, reappearing in a new
location. A different request, engineered with an embedded newline, forges an entire fake
log entry — Concept Unit two, and Lessons 4 through 6's injection pattern, reappearing
against a log file's implicit grammar instead of SQL, a shell, or HTML. A batch of real
log records, structured correctly per Concept Unit two's fix, is fed to a detector that
recognizes Lesson 2's brute-force shape and Lesson 4's injection shape automatically —
Concept Unit three, closing the loop: the same patterns you were taught to build, exploit,
and fix by hand throughout this entire course are exactly what a real detection system
watches for, at scale, without a human reading every line.

## What Breaks Without This

Remove the `if failures_by_ip[entry["ip"]] == FAILED_LOGIN_THRESHOLD` check's equality
comparison and replace it with `>= FAILED_LOGIN_THRESHOLD`, then rerun `detect_brute_force`
against a longer log with ten consecutive failures from the same IP. Instead of one alert,
six are produced — one for every entry from the fifth failure onward — flooding whatever
system consumes these alerts with duplicates for a single ongoing attack. This is a small,
concrete instance of **alert fatigue**, a real and serious problem in production security
operations: a detector that technically catches everything but drowns each real signal in
noise is often less useful than one with a carefully chosen, narrower trigger condition.

## Exercises

1. Add a second attacker IP to `log_entries`, spread across fewer than
   `FAILED_LOGIN_THRESHOLD` failed logins, and confirm `detect_brute_force` correctly does
   *not* alert on it — verifying the detector's boundary, not just its positive case.
2. Add `"AND 1=1"` to `SQLI_MARKERS` and add a log entry using that payload shape; confirm
   `detect_sql_injection` catches it. Then discuss, in your own words, why a marker list
   like this one can never be complete — connecting your answer to Lesson 20's SE Lens
   about the same limitation in checklist-based review.
3. Using this lesson's structured `log_entries` format, write a third detector,
   `detect_idor_probing`, that flags a single session requesting more than three distinct
   `/ticket/<id>` values in under a minute — reasoning from Lesson 16's vulnerability
   about what a real exploitation attempt against it would look like in log data, even
   without knowing in advance which specific ticket IDs exist.

## Definition of Done

- [ ] You reproduced the naive logger leaking a password into `access.log`
- [ ] You reproduced the forged log entry in `auth.log` and confirmed the fix in
      `auth_fixed.log` produces the correct line count with no standalone forged record
- [ ] You ran `detector.py` and reproduced both alerts
- [ ] You completed Exercise 1 and confirmed the detector does not false-positive on a
      sub-threshold sequence
- [ ] You can explain, in one sentence, the tradeoff between a lower and a higher
      `FAILED_LOGIN_THRESHOLD`
- [ ] `git add .` and `git commit -m "Lesson 21: logging and detection -- secrets in
      logs, log injection, and automated attack detection"` in your `security-labs/`
      folder

---

## Closing the Course

Twenty-one lessons ago, this course opened with a single question: *where did this data
come from, and did the code that used it know that?* Every lesson since has been a
variation on that one question, applied to a new interpreter, a new layer of a system, or
a new consequence of getting the answer wrong. SQL injection, command injection, and XSS
were the same missing checkpoint against three different parsers. Broken access control
was authentication and authorization, conflated, at three different layers — a bare
function, an HTTP endpoint, and a setuid binary. Password storage, secrets management, and
this lesson's log injection were all versions of the same question about what a system is
willing to write down and trust later. Even buffer overflows — the course's detour into
memory that isn't managed for you — were Lesson 1's trust boundary, one layer further down
than any web framework will ever show you.

You now have a checklist, a `security-labs/` repository full of working, exploitable, and
fixed code you wrote and ran yourself, and — more durably than either — a single question
that will keep finding vulnerabilities in systems this course never specifically covered,
because it was never really about the twenty-one topics. It was about training you to ask,
on sight, of any code handling any input: *where did this come from, and does the code
using it know that?*

That question doesn't expire when the course does.
