# Lesson 36: Email Is Just Another Text Protocol

## What you will build

A daily report generator that formats a plain-text summary and emails it
— first by having a raw-socket conversation with a real mail server, the
same way Lesson 24 hand-built an HTTP request before ever using
`requests`, and then again using Python's built-in `smtplib`, the
library every real Python program actually uses for this. The
transferable problem this lesson is actually about: email delivery looks
like a single action ("send an email") from the outside, but underneath
is one more text-based, line-oriented protocol — this curriculum's
fourth, after the chat protocol, HTTP, and WebSocket — and by now the
shape should feel familiar rather than mysterious.

## What you need to know first

- **Lesson 24** — a raw socket conversation, line by line, is how HTTP
  got built by hand before `requests` was ever introduced. Today repeats
  that exact approach for a different protocol.
- **Lesson 35** — `pip`, virtual environments, and why this environment's
  Python refuses global installs. Reused directly: today's local test
  server is installed the same way.
- **Lesson 18** — `socket`, `connect()`, `send()`/`recv()`. Today's raw
  SMTP lab uses nothing beyond what those lessons already established.

---

## The Problem, in prose, no code yet

A scheduled task — Lesson 33's or Lesson 34's — that runs unattended is
only useful if someone eventually finds out what it did. A log file
works if someone remembers to go look at it; an email report arrives on
its own. Sending one from Python looks, from the outside, like it should
need some large, opaque "email library" — but underneath, sending an
email is exactly the same shape of thing as everything else this
curriculum has built on top of raw sockets: connect, exchange lines of
text following an agreed format, done.

This lesson never sends anything to a real inbox — for the same reason
Lesson 30 and Lesson 31 never talked to a real browser or a real
production backend: nothing about learning the protocol requires a real
external mail server, and using one deliberately here would mean
generating real, unwanted test email. Instead, this lesson runs a real
mail server on `localhost` — one that receives real, complete SMTP
conversations and prints exactly what it got, but never actually
delivers anywhere.

---

## Concept Unit: A Local Mail Server to Practice Against

### The Problem

Testing an SMTP client against a real external mail provider means
dealing with real authentication, real spam filtering, and real sent
email — all unwanted for a lesson whose only goal is understanding the
protocol. A local, disposable mail server that behaves like a real one
but just prints what it receives solves this the same way the local
backends in Lesson 31 stood in for real services.

### Commands needed

Reusing Lesson 35's exact virtual-environment pattern:

```
$ python3 -m venv .venv
$ .venv/bin/pip install --quiet aiosmtpd
$ .venv/bin/python3 -m aiosmtpd -n -l localhost:1025
```

`aiosmtpd` (**first appearance**) is a real, RFC 5321-compliant SMTP
server implementation, run here as a command-line program via Python's
`-m` flag (a hard concept reappearing from Lesson 35's `python3 -m
venv`). `-n` skips an attempt to drop root privileges that only matters
when binding to a real mail server's standard port (25) as the `root`
user — irrelevant here, since this lesson binds to the unprivileged port
`1025` instead. `-l localhost:1025` sets the address and port to listen
on. Left otherwise unconfigured, `aiosmtpd` defaults to its `Debugging`
handler: instead of actually delivering mail anywhere, it prints every
message it receives to its own console — exactly the visibility this
lesson needs.

### CS Lens

This is a **test double** for an external service — the same role
Lesson 31's `test_backend.py` played for a real web backend, and Lesson
30's raw-socket test clients played for a real browser: something that
speaks the real protocol correctly enough to prove the client side works,
without any of the real service's side effects.

Also recognized in: mocked payment gateways in e-commerce testing,
`localstack` for testing AWS integrations without touching real AWS,
Lesson 34's own choice not to run `schtasks` for real inside this
Linux-only sandbox.

### SE Lens

Building this lesson against a real inbox would make every run of this
lesson's own code produce a real side effect — an actual email sent to
an actual mailbox — which would make the lesson itself un-repeatable
without consequence. Testing against a local double instead means this
lesson's code can be run, broken on purpose, and fixed again, as many
times as needed, with zero real-world effect each time — the same reason
Lesson 20 through 32 never once made a real request to a real website.

---

## Concept Unit: The SMTP Conversation, By Hand

### The Problem

Before trusting `smtplib` to send an email correctly, it's worth seeing
exactly what "sending an email" actually consists of on the wire — the
same reasoning Lesson 24 used before ever importing `requests`.

### The New Code

```python
import socket

smtp_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
smtp_socket.connect(("localhost", 1025))

def read_response():
    return smtp_socket.recv(4096).decode("utf-8")

def send_command(command_text):
    smtp_socket.sendall((command_text + "\r\n").encode("utf-8"))

print("server greeting:", read_response().strip())

send_command("HELO learning-curriculum")
print("after HELO:", read_response().strip())

send_command("MAIL FROM:<scheduler@example.com>")
print("after MAIL FROM:", read_response().strip())

send_command("RCPT TO:<student@example.com>")
print("after RCPT TO:", read_response().strip())

send_command("DATA")
print("after DATA:", read_response().strip())

send_command("Subject: raw socket test\r\n\r\nThis message was typed by hand, one SMTP command at a time.\r\n.")
print("after message body + '.':", read_response().strip())

send_command("QUIT")
print("after QUIT:", read_response().strip())

smtp_socket.close()
```

### Mechanical Walkthrough

- `socket`, `connect()`, `recv()`/`sendall()` — all reused unchanged
  from Lesson 18 onward.
- The server sends a **greeting** the instant the connection opens,
  unprompted — **first appearance of a server speaking first.** Every
  protocol before this in the curriculum (HTTP, the chat protocol,
  WebSocket after its handshake) waited for the client to speak first;
  SMTP's very first line comes from the server, announcing itself before
  the client sends anything at all.
- `HELO learning-curriculum` — **first appearance.** The client
  introduces itself, conventionally with its own hostname (any
  identifying string is accepted here). This is SMTP's equivalent of
  Lesson 30's WebSocket handshake: a required first exchange before any
  real work happens.
- `MAIL FROM:<...>` / `RCPT TO:<...>` — **first appearance.** These
  declare the **envelope** sender and recipient — the addressing
  information the mail *transport* actually uses to route the message,
  which is worth naming as distinct from the `From:`/`To:` headers that
  will appear *inside* the message body next: a real mail system's
  envelope and its visible headers don't have to match, which is exactly
  the mechanism behind "on behalf of" mail and, less innocently, most
  email spoofing.
- `DATA` — **first appearance.** Announces that the message content
  itself is about to follow. The server's `354` response
  (`End data with <CR><LF>.<CR><LF>`) is telling the client, in advance,
  exactly how it will know the message is finished.
- The message text ending in `\r\n.` — **first appearance of this
  specific termination convention.** Unlike HTTP, which knows a message
  is complete via a `Content-Length` header (Lesson 25) or a connection
  close, SMTP's `DATA` block ends when the server sees a line containing
  only a single period. This is why a real message body containing a
  line that's *only* a period on its own needs special escaping in a
  real implementation — a detail `smtplib` handles automatically in the
  next unit, invisible at this level only because this lab's test
  message doesn't happen to contain one.
- `QUIT` — closes the conversation cleanly, with a final server
  acknowledgment before the socket itself is closed.

### Run it

Against the real local server from the previous unit:

```
server greeting: 220 localhost Python SMTP 1.4.6
after HELO: 250 localhost
after MAIL FROM: 250 OK
after RCPT TO: 250 OK
after DATA: 354 End data with <CR><LF>.<CR><LF>
after message body + '.': 250 OK
after QUIT: 221 Bye
```

And, on the server's own side, printed by its `Debugging` handler:

```
---------- MESSAGE FOLLOWS ----------
Subject: raw socket test
X-Peer: ('127.0.0.1', 36242)

This message was typed by hand, one SMTP command at a time.
------------ END MESSAGE ------------
```

Every `250 OK` (and `220`, `354`, `221`) is an SMTP status code — a
**hard concept reappearing** in spirit from HTTP's own status codes
(Lesson 24–31), a different numbering scheme but the identical idea:
`2xx` means success, and the specific number narrows down exactly what
succeeded.

---

## Concept Unit: `smtplib` — The Real Tool

### Project Change

- **Reference Source:** No reference counterpart — `smtplib` is Python's
  own standard library module; there is no separate third-party
  implementation this lesson is porting from.
- **Files affected:** new file, `send_report.py`.
- **Change type:** add.
- **Dependencies:** `smtplib` and `email.message`, both standard
  library — no virtual environment needed for this half, only the
  server being tested against.

### The New Code

```python
import smtplib
from email.message import EmailMessage
from datetime import date


def send_report_email(smtp_host, smtp_port, sender_address, recipient_address, report_text):
    message = EmailMessage()
    message["Subject"] = f"Daily Report — {date.today().isoformat()}"
    message["From"] = sender_address
    message["To"] = recipient_address
    message.set_content(report_text)

    with smtplib.SMTP(smtp_host, smtp_port) as smtp_connection:
        smtp_connection.send_message(message)
```

### The Updated Project

A new, freestanding function with nothing surrounding it yet.

### Mechanical Walkthrough

- `from email.message import EmailMessage` — **import as module
  contract**: `email.message` is the standard library module responsible
  for representing a single email as a structured object — headers plus
  body — separately from `smtplib`, which is only responsible for the
  network conversation that *delivers* one. `EmailMessage` (**first
  appearance**) is the specific class that models one message.
- `message["Subject"] = ...` — **first appearance of this
  dictionary-like header assignment.** `EmailMessage` supports item
  assignment (`message[key] = value`) to set headers, even though it
  isn't literally a `dict` — this is the same pattern this curriculum's
  networking lessons built by hand (a `headers` dictionary joined into
  raw text), except here the object handles the correct raw formatting
  internally instead of the program building header text itself.
- `date.today().isoformat()` — **first appearance of the `datetime`
  module's `date` type** in this curriculum. `date.today()` returns
  today's date as a `date` object (no time component, unlike Lesson 32's
  `time.monotonic()`, which measures elapsed time rather than a calendar
  date at all); `.isoformat()` formats it as `"2026-07-25"` — the ISO
  8601 standard date format, chosen deliberately for being unambiguous
  across locales (unlike `07/25/2026`, which reads as month/day in the
  US and day/month in much of the rest of the world).
- `message.set_content(report_text)` — **first appearance.** Sets the
  message body, and — unlike the raw socket lab above, which sent body
  text as-is — handles escaping edge cases like a body line that's only
  a period, and sets the correct supporting headers (seen in the output
  below) automatically.
- `with smtplib.SMTP(smtp_host, smtp_port) as smtp_connection:` — a
  **hard concept reappearing**: `with` as a context manager, established
  since early file-handling lessons. `smtplib.SMTP` (**first
  appearance**) opens the connection and performs the `HELO` step
  automatically on construction; exiting the `with` block automatically
  sends `QUIT` and closes the socket — the entire raw-socket lab above,
  collapsed into two lines.
- `smtp_connection.send_message(message)` — **first appearance.** Takes
  the whole `EmailMessage` object, correctly performs `MAIL FROM`,
  `RCPT TO`, and `DATA` using the addresses already stored in the
  message's own `From`/`To` headers, and sends the fully-formatted
  message body.

### Run it

```python
with smtplib.SMTP("localhost", 1025) as smtp_connection:
    smtp_connection.send_message(message)
```

What the debugging server actually received:

```
---------- MESSAGE FOLLOWS ----------
Subject: Daily Report =?utf-8?b?4oCU?= 2026-07-25
From: scheduler@example.com
To: student@example.com
Content-Type: text/plain; charset="utf-8"
Content-Transfer-Encoding: 8bit
MIME-Version: 1.0
X-Peer: ('127.0.0.1', 40056)

Daily Report — 2026-07-25

Completed (2):
  - Built the reverse proxy
  - Wrote the rate limiter

Pending (2):
  - Write the scheduler lesson
  - Review the queue lesson
------------ END MESSAGE ------------
```

The `Subject` header arrived as `Daily Report =?utf-8?b?4oCU?= 2026-07-25`
— not the plain `—` (em dash) character the Python code actually wrote.
This is **MIME encoded-word syntax**, applied automatically: email
headers are restricted to plain ASCII by the original SMTP standard, so
`EmailMessage` detected the non-ASCII `—` character in the subject and
transparently re-encoded it as `=?utf-8?b?...?=` — UTF-8 bytes, Base64
(`b`) encoded, wrapped in a format any RFC-compliant mail client knows to
decode back to `—` for display. The *body*, by contrast, kept the real
`—` character as-is, because the body's own `Content-Type` header
(`charset="utf-8"`) declares its encoding directly rather than needing
each individual character escaped. Nothing about this was written by
hand — it's `EmailMessage` correctly handling a real-world edge case the
raw-socket lab's plain-ASCII test message never exercised.

### CS Lens

`smtplib.SMTP` plus `EmailMessage` together are a working instance of
**layered protocol abstraction**: `EmailMessage` handles *message*
concerns (headers, encoding, body structure) with zero knowledge of
sockets at all, and `smtplib.SMTP` handles *transport* concerns (the
actual `HELO`/`MAIL FROM`/`DATA` conversation) with zero knowledge of
what a "Subject" even means — each layer solving exactly one problem, the
same separation Lesson 31's `relay()` (transport, blind to content) and
`build_forwarded_request()` (content, blind to sockets) already
demonstrated in the reverse proxy.

### SE Lens

Everything the raw-socket lab did by hand — line termination, the
`DATA`-block terminator, correctly formatted envelope commands — is
exactly the kind of protocol-compliance work `smtplib` exists to remove
from application code. The email encoding issue surfaced above is the
concrete argument for why: a hand-rolled version would need to have
specifically anticipated non-ASCII subject lines to handle them
correctly, and it's very easy to not think of that until a real user
types an em dash, an emoji, or a name with an accent into a subject line
and the message silently breaks somewhere between sender and recipient.

---

## Concept Unit: Generating the Report Itself

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `send_report.py`.
- **Change type:** add.
- **Location:** above `send_report_email`.

### The New Code

```python
def generate_daily_report(tasks_completed, tasks_pending):
    lines = [
        f"Daily Report — {date.today().isoformat()}",
        "",
        f"Completed ({len(tasks_completed)}):",
    ]
    for task in tasks_completed:
        lines.append(f"  - {task}")
    lines.append("")
    lines.append(f"Pending ({len(tasks_pending)}):")
    for task in tasks_pending:
        lines.append(f"  - {task}")
    return "\n".join(lines)
```

### Mechanical Walkthrough

Every individual piece here — list building, f-strings, `len()`,
`.append()`, `"\n".join()` — is a **hard concept reappearing**, used
identically to how Lesson 31 assembled header text and Lesson 25/29
assembled response bodies. What's new is only the *shape* of the output:
a small, fixed report template (a title, a completed section, a pending
section) filled in from two plain Python lists, kept entirely separate
from `send_report_email`, which has no idea what a "task" is at all — it
only knows how to email whatever text string it's handed.

### Run it

```python
report_text = generate_daily_report(
    tasks_completed=["Built the reverse proxy", "Wrote the rate limiter"],
    tasks_pending=["Write the scheduler lesson", "Review the queue lesson"],
)
print(report_text)
```

```
Daily Report — 2026-07-25

Completed (2):
  - Built the reverse proxy
  - Wrote the rate limiter

Pending (2):
  - Write the scheduler lesson
  - Review the queue lesson
```

### CS Lens and SE Lens

Both already covered: this unit is a direct application of the pure
function / effectful shell separation from Lesson 35 (`clean_filename`
versus `batch_rename`) and the composition pattern from Lesson 32
(`Queue` wrapping `LinkedList`) — `generate_daily_report` is the pure,
easily-testable half; `send_report_email` is the effectful half that
actually touches the network. No new lens content beyond naming the
reuse, per the Repetition Rule.

---

## Connect the pieces

One report, traced end to end: `generate_daily_report` builds a plain
string from two lists, with no knowledge that it will ever be emailed.
`send_report_email` receives that string, wraps it in an `EmailMessage`
with a `Subject` line containing today's real date (computed fresh via
`date.today()`, not hard-coded), and hands the whole object to
`smtplib.SMTP`, which performs the exact same `HELO`/`MAIL FROM`/`RCPT
TO`/`DATA`/`QUIT` conversation the raw-socket lab typed out by hand
earlier in this lesson — just automatically, and correctly handling an
edge case (the non-ASCII em dash) the hand-written version never had to
face.

## What breaks without this

Running `send_report.py` with no SMTP server listening on `localhost:1025`
at all:

```
ConnectionRefusedError: [Errno 111] Connection refused
```

raised from deep inside `smtplib`'s own `connect()` call — the operating
system refusing a TCP connection to a port nothing is listening on,
exactly the same underlying error this curriculum's networking lessons
have seen before, just reached this time through a standard library
module instead of a raw `socket.connect()` call. This is the honest,
practical reminder behind this lesson's own setup: a real deployment of
this script needs a real SMTP server's address and port (and, for most
real providers, authentication this lesson didn't cover) — pointed at
nothing, it fails loudly and immediately rather than silently losing the
report.

## Definition of done

- [ ] The raw-socket SMTP lab completes a full conversation against the
      local `aiosmtpd` debugging server and the server's own console
      shows the exact message sent.
- [ ] `send_report.py` generates a report and the debugging server
      receives it with a correctly MIME-encoded `Subject` header.
- [ ] You can explain, without looking back at this lesson, why the
      `Subject` header shows `=?utf-8?b?...?=` while the message body
      shows the real `—` character unencoded.
- [ ] Running `send_report.py` with the debug server stopped produces a
      clear `ConnectionRefusedError`, not a silent failure.
- [ ] Commit with a message explaining why, not just what:

  ```
  git add send_report.py
  git commit -m "Add daily report generator and SMTP sender — smtplib collapses the HELO/MAIL FROM/RCPT TO/DATA conversation this lesson first did by hand into two lines, and correctly handles non-ASCII subjects the raw version never had to"
  ```

## What's next

`send_report_email` currently trusts `smtp_host`/`smtp_port` to be
correct and does no authentication at all — real mail providers require
both TLS and a login before accepting mail from an unfamiliar client,
neither covered here. Combined with Lesson 34's `cron`, this script is
now genuinely schedulable — a crontab line pointing at it would produce a
real daily report with no process needing to stay alive between runs,
exactly the property Lesson 34 built that guarantee for.
