# Lesson 20: Secure Code Review

## What you will build

Nothing new — and that's the point. This lesson hands you a complete, unfamiliar,
95-line HTTP server you've never seen, containing four real vulnerabilities drawn from
four different earlier lessons, mixed together the way real code actually mixes them,
with no hints about which lines are wrong. You'll review it using a checklist built from
this entire course, find every bug, exploit each one against the running server to
confirm it's real rather than theoretical, then patch and reverify all four. The
transferable problem: every lesson so far taught you one vulnerability in isolation, with
the lesson's own title telling you what to look for. Real code review never comes with
that hint.

## What you need to know first

This lesson assumes and directly reuses Lessons 3, 4, 6, and 10 in full — Authentication
vs. Authorization, SQL Injection, XSS, and Password Storage — without re-teaching any of
them. If any of the four findings below don't make immediate sense, that's a signal to
revisit the specific earlier lesson named next to it, not a gap in this one.

---

## Concept Unit: The Review Checklist

### The Problem

Every earlier lesson in this course handed you one isolated concept and told you its name
in the title. A real, unfamiliar file offers no such courtesy — nothing announces "this
line is a SQL injection." Reviewing code for security requires a structured way to look
for known failure *shapes*, systematically, rather than reading top to bottom and hoping
something looks wrong.

### Skip: Concept Already Lab'd

Every individual item below has already been fully taught, with a runnable lab, in an
earlier lesson. This unit does not introduce new code or a new construct — it assembles
an artifact: a checklist. Unlike every other lab in this course, **this artifact is not
discarded** — it's the one exception to the Concept Isolation Rule's usual "throw it away
once understood" instruction, because a review checklist's entire value is being kept and
reused on every future piece of code you read, in this course or outside it.

### The Checklist

```
TRUST BOUNDARIES (Lesson 1)
[ ] Does any untrusted input reach an interpreter (SQL, shell, HTML) via string
    concatenation instead of a parameterized/escaped API?

AUTHENTICATION vs AUTHORIZATION (Lesson 3, deepened in Lesson 16)
[ ] Does every endpoint that reads or modifies a specific resource check that the
    session's owner is actually entitled to THAT resource -- not just that a
    session exists at all?

INJECTION (Lessons 4-6)
[ ] SQL: are queries built with placeholders, or with f-strings/concatenation?
[ ] Shell: if a command is run, is it an argument list, or a concatenated string?
[ ] HTML: is user-supplied content inserted with an escaping API, or raw?

PASSWORD STORAGE (Lesson 10)
[ ] Are passwords compared directly (plaintext or a fast hash), or with bcrypt/
    Argon2/PBKDF2 and constant-time comparison?

SESSIONS AND CSRF (Lessons 14-15)
[ ] Do session cookies carry HttpOnly, Secure, and SameSite?
[ ] Do state-changing requests require a CSRF token, not just a valid cookie?

SECRETS (Lesson 19)
[ ] Are any credentials or keys hardcoded in the source rather than externally
    managed?
```

### CS Lens

A checklist like this is a **static analysis heuristic**, applied by a human reader
instead of a tool — the same underlying idea as an automated security linter, just without
the automation. Both work by pattern-matching known-dangerous *shapes* in code rather than
executing it, which is why this lesson's process — read, suspect, then actually run the
exploit — matters: a checklist finds candidates, not confirmed bugs.

### SE Lens

The alternative to a checklist is relying entirely on a reviewer's memory and instinct,
which does not scale across a team or survive a reviewer's bad day — this is precisely why
real organizations codify checklists like this one into linters, pre-commit hooks, and
formal review templates rather than trusting individual vigilance alone. The cost this
checklist doesn't eliminate: a checklist only catches what's *on* it — a vulnerability
class this course hasn't covered yet would sail through unnoticed, which is a genuine,
permanent limitation of checklist-based review, not a flaw specific to this one.

---

## Concept Unit: The Target — An Unfamiliar Ticket System

### The Problem

The checklist above is only useful against real code. This unit's job is simply to show
you that code — a small internal support-ticket system, complete, and never explained line
by line before you read it.

### Where This Lives

**File:** `ticket_system.py` (new file). **Dependencies:** Python's standard library only.

### The New Code

```python
import http.server
import sqlite3
import secrets
from urllib.parse import urlparse, parse_qs

SECRET_ADMIN_PASSWORD = "letmein123"

connection = sqlite3.connect(":memory:", check_same_thread=False)
cursor = connection.cursor()
cursor.execute("CREATE TABLE users (username TEXT, password TEXT)")
cursor.execute("CREATE TABLE tickets (id INTEGER PRIMARY KEY, owner TEXT, subject TEXT, body TEXT)")
cursor.execute("INSERT INTO users VALUES ('ada', 'hunter2')")
cursor.execute("INSERT INTO users VALUES ('grace', 'compiler1')")
cursor.execute("INSERT INTO tickets (owner, subject, body) VALUES ('ada', 'printer broken', 'the office printer is out of toner')")
cursor.execute("INSERT INTO tickets (owner, subject, body) VALUES ('grace', 'salary question', 'need to discuss my compensation privately')")
connection.commit()

sessions = {}

def get_session_user(handler):
    cookie_header = handler.headers.get("Cookie", "")
    for piece in cookie_header.split(";"):
        piece = piece.strip()
        if piece.startswith("session="):
            token = piece.split("=", 1)[1]
            return sessions.get(token)
    return None

class Handler(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        parsed = urlparse(self.path)
        query = parse_qs(parsed.query)

        if parsed.path == "/login":
            username = query.get("username", [""])[0]
            password = query.get("password", [""])[0]
            row = cursor.execute(
                "SELECT password FROM users WHERE username = ?", (username,)
            ).fetchone()
            if row is not None and row[0] == password:
                token = secrets.token_hex(16)
                sessions[token] = username
                self.send_response(200)
                self.send_header("Set-Cookie", f"session={token}")
                self.end_headers()
                self.wfile.write(b"logged in")
            else:
                self.send_response(401)
                self.end_headers()
                self.wfile.write(b"invalid credentials")
            return

        if parsed.path == "/search":
            search_term = query.get("q", [""])[0]
            sql = f"SELECT id, subject FROM tickets WHERE subject LIKE '%{search_term}%'"
            rows = cursor.execute(sql).fetchall()
            self.send_response(200)
            self.end_headers()
            for row in rows:
                self.wfile.write(f"#{row[0]}: {row[1]}\n".encode())
            return

        if parsed.path.startswith("/ticket/"):
            ticket_id = parsed.path.split("/")[2]
            user = get_session_user(self)
            if not user:
                self.send_response(401)
                self.end_headers()
                self.wfile.write(b"not logged in")
                return
            row = cursor.execute(
                "SELECT owner, subject, body FROM tickets WHERE id = ?", (ticket_id,)
            ).fetchone()
            if row is None:
                self.send_response(404)
                self.end_headers()
                return
            owner, subject, body = row
            html = f"<html><body><h1>{subject}</h1><p>{body}</p></body></html>"
            self.send_response(200)
            self.send_header("Content-Type", "text/html")
            self.end_headers()
            self.wfile.write(html.encode())
            return

        self.send_response(404)
        self.end_headers()

if __name__ == "__main__":
    http.server.HTTPServer(("127.0.0.1", 8500), Handler).serve_forever()
```

### The Updated Project

This *is* the whole file — there is nothing to compose it into. Before reading further,
apply the previous unit's checklist against it yourself. The next unit walks through what
a review finds, in the order the checklist above is organized, but the exercise only
teaches something if you look first.

### Where the Review Begins

Notice what a checklist-driven read looks like in practice, rather than a line-by-line
walkthrough: scan for every place user input reaches a query (`/search`'s `sql =
f"...{search_term}..."` — flag it, Lesson 4's shape, before reading anything else on that
line closely); scan for every endpoint that takes an identifier from the URL or a session
(`/ticket/<id>`'s `ticket_id` — flag it, Lesson 16's shape); scan for how passwords are
compared (`row[0] == password` — flag it, Lesson 10's shape); scan for anywhere a string is
built and sent as HTML (`html = f"...{subject}...{body}..."` — flag it, Lesson 6's shape).
Four flags, from one pass, before a single exploit has been attempted — this is what the
checklist buys you: candidates, fast, in the order they're organized rather than the order
they appear in the file.

---

## Concept Unit: The Findings, Confirmed by Exploiting Them

### The Problem

A flagged line is a suspicion, not a confirmed bug — the checklist's own SE Lens already
named this limitation. This unit runs `ticket_system.py` for real and attempts each
flagged line as an actual exploit, the same standard every earlier lesson in this course
held itself to.

### Finding 1 — SQL Injection in `/search` (Lesson 4)

```python
sql = f"SELECT id, subject FROM tickets WHERE subject LIKE '%{search_term}%'"
```

Exploit:

```python
import urllib.parse
payload = urllib.parse.quote("' UNION SELECT username, password FROM users --")
# GET /search?q=<payload>
```

Run it against the live server:

```
#1: printer broken
#2: salary question
#ada: hunter2
#grace: compiler1
```

The `UNION SELECT` payload — Lesson 4's exact technique — appends the entire `users`
table's contents to the search results, in plaintext, through an endpoint whose only
intended job was searching ticket subjects.

### Finding 2 — Broken Access Control in `/ticket/<id>` (Lessons 3 & 16)

```python
row = cursor.execute(
    "SELECT owner, subject, body FROM tickets WHERE id = ?", (ticket_id,)
).fetchone()
# ... no comparison between `owner` and the logged-in `user` anywhere below this
```

Exploit: log in as `ada`, then request `/ticket/2` — a ticket owned by `grace`:

```
Login as ada: b'logged in'
Ada reads ticket #2 (belongs to grace):
b'<html><body><h1>salary question</h1><p>need to discuss my compensation privately</p></body></html>'
```

Ada's own, genuinely valid session retrieves a ticket she doesn't own and whose subject
line — "need to discuss my compensation privately" — makes plain this was never meant to
be visible to her. This is Lesson 16's `read_backup` bug, unchanged in shape, in a
different application.

### Finding 3 — Plaintext Password Comparison (Lesson 10)

```python
cursor.execute("CREATE TABLE users (username TEXT, password TEXT)")
...
if row is not None and row[0] == password:
```

No exploit is needed beyond what Finding 1 already produced: the SQL injection's leaked
output — `#ada: hunter2`, `#grace: compiler1` — is *directly usable* as a real login
credential, because the column literally named `password` stores the value typed at
signup, unmodified. Compare this to Lesson 10's `bcrypt.hashpw`: had this table stored a
bcrypt hash instead, Finding 1's leak would have produced an unusable-without-immense-effort
hash rather than an instantly reusable password. **This finding compounds Finding 1** —
neither bug alone is as severe as the two together, which is a realistic property of code
review that a single-bug lesson can't teach: vulnerabilities interact.

### Finding 4 — XSS in `/ticket/<id>`'s Rendering (Lesson 6)

```python
html = f"<html><body><h1>{subject}</h1><p>{body}</p></body></html>"
```

Exploit: a ticket whose `subject` contains Lesson 6's exact payload —

```python
subject = '<img src="x" onerror="document.title=\'HACKED\'">'
```

renders as:

```html
<html><body><h1><img src="x" onerror="document.title='HACKED'"></h1><p>normal body text</p></body></html>
```

`subject`, wherever it originally came from (a ticket submission form, not shown in this
excerpt, but implied by the schema), is inserted directly into HTML output with an
f-string — the exact `innerHTML`-shaped mistake from Lesson 6, here on the server side
rather than via `innerHTML`, producing HTML that will execute as script the moment any
user's browser renders this ticket.

### CS Lens

```
Also recognized in: any real-world security audit report, which is structured
almost exactly like this unit -- a numbered finding, the vulnerable code excerpt,
a proof-of-concept exploit, and a severity assessment (Finding 3's "compounds
Finding 1" is a severity note a real audit would make explicit) -- and CVE
write-ups, which follow the identical shape for publicly disclosed
vulnerabilities.
```

### SE Lens

The alternative to finding these four bugs via manual review is automated static analysis
tooling, which would flag Findings 1 and 4 (both recognizable string-pattern
anti-patterns) with high reliability, but would likely miss Finding 2 entirely — a missing
ownership check has no syntactic signature a pattern-matching tool can reliably recognize,
since the *absence* of a check, not the presence of a dangerous pattern, is the bug. This
is a genuine, standing argument for human code review remaining necessary even in
organizations with mature automated scanning: the checklist's "authorization" section
requires a reviewer to reason about what *should* be there and notice it isn't, which is a
fundamentally different, harder-to-automate skill than pattern matching.

---

## Concept Unit: The Fixed Version, Reverified

### The Problem

Finding bugs and confirming they're exploitable is only half of a code review's value —
the other half is verifying that a proposed fix actually closes what was found, rather
than trusting that it looks right.

### Where This Lives

**File:** `ticket_system_fixed.py` (new file, based on `ticket_system.py`). **Change
type:** four targeted fixes, one per finding, each reusing the exact technique its
originating lesson already taught — no new technique is introduced in this unit.

### The New Code

```python
sql = "SELECT id, subject FROM tickets WHERE subject LIKE ?"
rows = cursor.execute(sql, (f"%{search_term}%",)).fetchall()
```

```python
if owner != user:
    self.send_response(403)
    self.end_headers()
    self.wfile.write(b"forbidden: not your ticket")
    return
```

```python
cursor.execute("CREATE TABLE users (username TEXT, password_hash TEXT)")
...
if row is not None and bcrypt.checkpw(password.encode(), row[0].encode()):
```

```python
safe_subject = html.escape(subject)
safe_body = html.escape(body)
page = f"<html><body><h1>{safe_subject}</h1><p>{safe_body}</p></body></html>"
```

### The Updated Project

The `/search` and `/ticket/<id>` branches, in full, with all four fixes in place:

```python
        if parsed.path == "/search":
            search_term = query.get("q", [""])[0]
            sql = "SELECT id, subject FROM tickets WHERE subject LIKE ?"       # ← fixed
            rows = cursor.execute(sql, (f"%{search_term}%",)).fetchall()        # ← fixed
            self.send_response(200)
            self.end_headers()
            for row in rows:
                self.wfile.write(f"#{row[0]}: {row[1]}\n".encode())
            return

        if parsed.path.startswith("/ticket/"):
            ticket_id = parsed.path.split("/")[2]
            user = get_session_user(self)
            if not user:
                self.send_response(401)
                self.end_headers()
                self.wfile.write(b"not logged in")
                return
            row = cursor.execute(
                "SELECT owner, subject, body FROM tickets WHERE id = ?", (ticket_id,)
            ).fetchone()
            if row is None:
                self.send_response(404)
                self.end_headers()
                return
            owner, subject, body = row
            if owner != user:                                                   # ← fixed
                self.send_response(403)                                          # ← fixed
                self.end_headers()                                               # ← fixed
                self.wfile.write(b"forbidden: not your ticket")                  # ← fixed
                return                                                            # ← fixed
            safe_subject = html.escape(subject)                                   # ← fixed
            safe_body = html.escape(body)                                         # ← fixed
            page = f"<html><body><h1>{safe_subject}</h1><p>{safe_body}</p></body></html>"  # ← fixed
            self.send_response(200)
            self.send_header("Content-Type", "text/html")
            self.end_headers()
            self.wfile.write(page.encode())
            return
```

`/search` now passes `search_term` as a bound parameter (Finding 1's fix, Lesson 4's
technique, unchanged); `/ticket/<id>` now checks `owner != user` before returning any data
(Finding 2's fix, Lesson 16's technique, unchanged) and escapes both `subject` and `body`
before building the HTML response (Finding 4's fix, Lesson 6's technique, unchanged). The
`/login` branch (not repeated here — unchanged in structure from the vulnerable version)
now compares against a `bcrypt`-hashed column instead of plaintext (Finding 3's fix,
Lesson 10's technique, unchanged).

### Run It

Rerunning the exact exploits from the previous unit against `ticket_system_fixed.py`:

```
Login as ada: b'logged in'

[IDOR attempt] Ada requests ticket #2 -- status: 403 body: b'forbidden: not your ticket'

[SQLi attempt] search payload result: b''
```

Finding 2's exploit, unchanged, now receives a `403` instead of Grace's ticket content.
Finding 1's exploit, unchanged, now returns nothing — the `UNION SELECT` payload is
treated as a literal search string with no matching subjects, because it was never parsed
as SQL grammar in the first place. Finding 3 is implicitly closed by the same test: even
if Finding 1 had leaked anything, the `users` table now stores `password_hash`, not
`password` — nothing usable would come back. Finding 4 can be reverified the same way as
in the previous unit: a ticket with the injected `<img onerror=...>` subject now renders
with `&lt;img src=&quot;x&quot; ...&gt;` in place of a live element, exactly as Lesson 6's
`textContent` fix demonstrated for the browser-side equivalent.

This unit closes the loop the entire lesson opened: every finding from the previous unit,
confirmed exploitable against the vulnerable server, is now confirmed *closed* against the
fixed one, using the same exploit code in both runs — the review's value is demonstrated,
not asserted.

---

## Connect the Pieces

The four findings in this lesson are not four new things learned — they're Lessons 4, 6,
10, and 16, reapplied without being told in advance which line each one lived on. The
checklist from this lesson's first unit is what made that possible: a systematic pass
across categories this course has already built, rather than a hopeful read-through. The
compounding relationship between Finding 1 and Finding 3 — an injection bug turning a
weak-hashing bug into an instantly reusable credential leak — is the one genuinely new
lesson here: **individual vulnerabilities in real systems don't stay isolated the way
single-topic lessons present them; a reviewer's job includes noticing when two findings
make each other worse.**

## What Breaks Without This

Revert only the `/search` fix — leave the ownership check, password hashing, and HTML
escaping in place — and rerun Finding 1's exploit. It succeeds again, exactly as in the
vulnerable version, and because the ownership check no longer applies to `/search` (it
never did — `/search` has no session check at all), this single reverted fix alone is
sufficient to leak the `users` table's contents, hashed or not. This demonstrates that a
review's fixes are not independent, optional line items — each finding was real and each
fix was necessary; reverting even one reopens a real hole regardless of how well the
other three were closed.

## Exercises

1. `/search` still has no authentication check at all — anyone, logged in or not, can
   search tickets. Using this lesson's checklist, decide whether that's a fifth finding, a
   deliberate design choice, or genuinely ambiguous without more context about the
   system's intended audience — and justify your answer.
2. Add a fifth, deliberately planted vulnerability to `ticket_system.py` — reusing any
   technique from Lessons 1 through 19 you haven't seen appear in this lesson yet — and
   confirm a fresh read using this lesson's checklist would have flagged it.
3. Write the finding for `SECRET_ADMIN_PASSWORD = "letmein123"`, visible in the file's
   first ten lines and never used anywhere in the rest of the code shown. Name which
   checklist category it falls under and what real risk an unused-but-present hardcoded
   secret like this still poses.

## Definition of Done

- [ ] You reviewed `ticket_system.py` against the checklist yourself, before reading the
      Findings unit, and can say which of the four you personally flagged
- [ ] You ran all four exploits against the live vulnerable server and reproduced the
      outputs shown, including the password leak inside the SQL injection result
- [ ] You ran the same exploits against the fixed server and confirmed all four are
      closed
- [ ] You can explain, in your own words, how Finding 1 and Finding 3 compound each other
- [ ] You completed Exercise 3 and can name `SECRET_ADMIN_PASSWORD`'s checklist category
- [ ] `git add .` and `git commit -m "Lesson 20: secure code review -- four findings in
      an unfamiliar file, confirmed and fixed"` in your `security-labs/` folder

**Next:** Lesson 21 — Logging and Detection, the course's final lesson, where the
question shifts from "how do I prevent this" to "if prevention fails, how do I find out it
happened at all" — closing with the audit-log thread this lesson's own review process
depended on informally throughout.
