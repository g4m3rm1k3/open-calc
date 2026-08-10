# Lesson 2b: Session-Scoped State — One `State` per Visitor, Not per Server

**What you will build:** A per-browser session, backed by a small
signed cookie, mapping each visitor to their own private `State`
object in a server-side dictionary — fixing the exact bug Lesson 2a's
SE Lens flagged and left unfixed on purpose: one global `state`, shared
by every single visitor to the server.

**What you need to know first:** Lesson 2a — `State`, `Page(state)`,
and the `/increment` route mutating a module-level `state` object. This
lesson replaces *how that state is found*, not what `State` or `Page`
do with it.

**Pipeline:** Still

```
Python Component → render() → HTML string → Flask response → Browser
```

Nothing about the pipeline's shape changes — what changes is *which*
`state` object flows into `Page` on each request. One concrete
scenario, two separate visitors, carried through every stage:

| Stage | Visitor A, after 2 increments | Visitor B, after 1 increment |
|---|---|---|
| Component | `Page(state)` where `state` is *A's own* `State`, `count == 2` | `Page(state)` where `state` is *B's own* `State`, `count == 1` |
| render() | `'...Count: 2...'` | `'...Count: 1...'` |
| Flask response | 200 OK, "Count: 2" | 200 OK, "Count: 1" |
| Browser | A sees 2 | B sees 1 — never affected by A |

---

## Concept Unit: Flask's `session` — a Per-Browser Cookie Store

### The Problem

Right now, `state` is exactly one Python object, created once when the
server starts. Every visitor's browser hits the same running process
and reads the same object — there is no concept of "this browser" vs
"that browser" anywhere in the code yet.

### Introduce the Concept in Isolation

A tiny standalone Flask app:

```python
from flask import Flask, session

demo = Flask(__name__)
demo.secret_key = "just-for-this-demo"

@demo.route("/set")
def set_value():
    session["visited"] = True
    return "set"

@demo.route("/check")
def check_value():
    return str(session.get("visited", False))
```

Run it, then two separate `curl` clients — one that keeps its cookies
between requests, one that doesn't:

```
$ curl -c cookiesA.txt -b cookiesA.txt http://127.0.0.1:5010/set
set
$ curl -c cookiesA.txt -b cookiesA.txt http://127.0.0.1:5010/check
True
$ curl http://127.0.0.1:5010/check
False
```

The first client set `session["visited"] = True`, and its *own*
follow-up request sees it — but a second client, hitting the exact
same running server with no cookie at all, sees `False`. `session`
behaves like a dict, but it's a different dict per browser, tracked
automatically via a signed cookie Flask sets and reads for you. This
is called a **session**. `demo.secret_key` is what lets Flask
cryptographically sign that cookie, so a client can't forge or tamper
with its own session data.

### Discard

`u1_l2b.py` (the tiny demo app) is deleted — its only job was proving
`session` is genuinely per-browser, not per-server.

---

## Concept Unit: Generating a Unique ID with `uuid`

### The Problem

We don't want to stuff the entire `State` object into the cookie
itself — cookies are small, sent on every request, and putting real
application data in them is wasteful and exposes it to the browser.
Instead, we want the cookie to hold just a small, unique label, and
keep the real `State` object safely on the server.

### Introduce the Concept in Isolation

```python
import uuid

print(uuid.uuid4())
print(uuid.uuid4())
```

Run:

```
16155f9b-960e-4c87-97d7-17813107b6ea
cbc85dd4-81de-411f-8ea6-7c60aa5e2ee4
```

Two calls, two completely different long strings — `uuid.uuid4()`
generates a randomized identifier so large that two calls colliding by
accident is not a realistic concern. This is called a **UUID** —
universally unique identifier.

### Discard

`u2_l2b.py` is deleted.

---

## Concept Unit: A Server-Side Dictionary as a Session Store — Get-or-Create

### The Problem

We now have a way to identify "this browser" (`session`) and a way to
generate a small unique label for it (`uuid`). We need one more piece:
a place, on the server, to keep each visitor's own `State`, looked up
by that label — created the first time we see a given visitor, reused
every time after.

### Introduce the Concept in Isolation

```python
store = {}

def get_or_create(key):
    if key not in store:
        store[key] = []
    return store[key]

list_a = get_or_create("a")
list_a.append("first visit")

list_a_again = get_or_create("a")
print(list_a_again)
print(list_a is list_a_again)
```

Run:

```
['first visit']
True
```

The second call to `get_or_create("a")` didn't create a fresh empty
list — it found `"a"` already in `store` and returned the *exact same*
list object as before, `is`-identical, with the earlier mutation still
present. This check-then-create-only-if-missing pattern is called
**get-or-create**.

### Discard

`u3_l2b.py` is deleted. This is the last throwaway lab — the real
project code below combines all three of this lesson's proven pieces:
a per-browser `session`, a `uuid` as its label, and get-or-create
against a server-side dict.

### Project Change

- **Reference Source:** No reference counterpart — from scratch.
- **Files affected:** `app.py` (modify)
- **Change type:** add (`import uuid`, `session` import, `app.secret_key`,
  `sessions` dict, `get_state()`), replace (`state = State()` and both
  routes' bodies)
- **Location:** `import uuid` and the `session` import go at the top,
  alongside the existing `flask` import; `app.secret_key` goes right
  after `app = Flask(__name__)`; `sessions = {}` and `get_state()`
  replace the old `state = State()` line; both routes are updated in
  place.
- **Dependencies:** Lesson 2a's `State` and `Page(state)`, unchanged.

### The New Code — type it yourself

```python
sessions = {}


def get_state():
    if "session_id" not in session:
        session["session_id"] = str(uuid.uuid4())
    session_id = session["session_id"]
    if session_id not in sessions:
        sessions[session_id] = State()
    return sessions[session_id]
```

### The Updated Project

```python
import uuid

from flask import Flask, session

app = Flask(__name__)
app.secret_key = "dev-secret-change-this-in-production"    # ← new

class Element:
    def __init__(self, tag, text="", children=None, **attrs):
        self.tag = tag
        self.text = text
        self.children = children if children is not None else []
        self.attrs = attrs

    def render(self):
        attrs_html = ""
        for key, value in self.attrs.items():
            clean_key = key.rstrip("_")
            attrs_html += f' {clean_key}="{value}"'
        children_html = ""
        for child in self.children:
            children_html += child.render()
        return f"<{self.tag}{attrs_html}>{self.text}{children_html}</{self.tag}>"

def Heading(text):
    return Element("h1", text)

def Paragraph(text, **attrs):
    return Element("p", text, **attrs)

class State:
    def __init__(self):
        self.count = 0

def Page(state):
    heading = Heading("Hello from Flask")
    paragraph = Paragraph("This paragraph is a child element.", id="intro")
    counter = Element("p", f"Count: {state.count}")
    return Element("div", children=[heading, paragraph, counter], class_="container")

sessions = {}                                                # ← new

def get_state():                                              # ← new
    if "session_id" not in session:                             # ← new
        session["session_id"] = str(uuid.uuid4())                # ← new
    session_id = session["session_id"]                            # ← new
    if session_id not in sessions:                                # ← new
        sessions[session_id] = State()                              # ← new
    return sessions[session_id]                                     # ← new

@app.route("/")
def index():
    state = get_state()          # ← changed
    return Page(state).render()

@app.route("/increment")
def increment():
    state = get_state()          # ← changed
    state.count += 1
    return Page(state).render()

if __name__ == "__main__":
    app.run(debug=True)
```

`app.py` no longer has one global `state` — instead, every route calls
`get_state()`, which finds (or creates, on first visit) the one
`State` object belonging specifically to whoever's browser sent this
request.

### Mechanical Walkthrough

- `app.secret_key = "..."` — **(a) first appearance.** Required for
  Flask's `session` to sign its cookies — without a secret key, Flask
  refuses to use `session` at all. (A hardcoded string is fine for
  local development; a real deployment would load this from an
  environment variable instead — flagged, not fixed, here.)
- `sessions = {}` — **(b) hard concept reappearing** as a plain dict,
  now purposed as the server-side store the get-or-create lab just
  proved.
- `if "session_id" not in session:` — **(b) hard concept reappearing.**
  `session` behaves like a dict, proven above — checking membership
  with `in` is ordinary dict/container syntax, already known.
- `session["session_id"] = str(uuid.uuid4())` — **(b) hard concept
  reappearing** for `uuid.uuid4()`, just proven. `str(...)` converts
  the UUID object to a plain string before storing it — cookies can
  only hold text, not arbitrary Python objects.
- `session_id = session["session_id"]` — **(c) already basic** dict
  lookup.
- `if session_id not in sessions: sessions[session_id] = State()` —
  **(b) hard concept reappearing.** The exact get-or-create pattern
  proven above — create a new `State` only the first time this
  particular `session_id` is seen.
- `return sessions[session_id]` — **(c) already basic** dict lookup.

### CS Lens

Mapping a small opaque token (here, a UUID in a cookie) to a larger
piece of server-side state, so the client never has to carry the real
data itself, is the same idea behind **session tokens** broadly —
recognized in: web login sessions generally (a session cookie
identifying "you," not your password), API access tokens, and even
hotel key cards, which identify a guest to the front-desk system
without the card itself containing the guest's actual reservation
data.

### SE Lens

The alternative not chosen: store the actual `State` data (the count
itself) directly inside the signed cookie, with no server-side
dictionary at all. The tradeoff: that would remove the need for a
server-side `sessions` dict entirely — no memory used on the server
per visitor — but it means every piece of state has to round-trip
through the cookie on every single request, cookies have real size
limits, and anything in a cookie (even signed) is visible to the
browser, which matters once state holds anything sensitive. Keeping a
UUID in the cookie and the real data server-side costs one extra
lookup per request, but keeps state private and unbounded in size.

One real cost being carried forward, on purpose, unfixed: `sessions`
is a plain in-memory Python dict — it grows forever as new visitors
arrive, and it's wiped completely if the server process restarts. A
real deployment would need to expire old sessions and probably use a
proper external store (Redis, a database) instead — out of scope for
this project's current stage, but worth knowing this isn't
production-grade as written.

### Run It

Two independent simulated visitors, confirmed with real cookie jars:

```
=== Client A: increment twice ===
...Count: 1...
...Count: 2...
=== Client B: increment once (separate cookie jar) ===
...Count: 1...
=== Client A visits / again: still 2, unaffected by B ===
...Count: 2...
=== Client B visits / again: still 1 ===
...Count: 1...
```

Confirmed by actually running the server with two separate cookie
jars — each visitor's count is fully independent of the other's.

### Connect

Every route in this project can now safely assume "the state I'm
reading belongs to whoever sent this specific request" — a foundation
the next stage (WebSockets) will need just as much, since it will also
have to know which live connection belongs to which visitor.

---

## Closing

### Connect the Pieces

Trace Visitor A's second `GET /increment`: their browser sends its
cookie → `get_state()` finds `"session_id"` already in `session` (set
on their very first request) → looks that id up in `sessions`, finds
their existing `State` object (not a new one — get-or-create) →
`state.count += 1` mutates *that* object → `Page(state).render()`
reflects it. Visitor B's request, arriving with a completely different
cookie, goes through the exact same `get_state()` code but resolves to
a *different* `State` object the entire time — same function, same
logic, different data, because the two visitors are identified
separately from the start.

### What Breaks Without This

Reproducing Lesson 2a's original single global `state`, on purpose,
with two separate real visitors:

```python
state = State()  # one object, shared by every visitor

@app.route("/increment")
def increment():
    state.count += 1
    return f"Count: {state.count}"
```

Real output:

```
=== Client A hits /increment ===
Count: 1
=== Client B (a totally separate visitor, first ever request) hits /increment ===
Count: 2
```

Client B never interacted with this server before this single
request — and yet sees `Count: 2`, not `Count: 1`, because they're
reading and mutating the exact same object Client A already
incremented. This is the precise bug Lesson 2a's SE Lens named as a
known, unfixed cost — now actually fixed by session-scoping.

### Exercises

- Open the actual app in two different real browsers (or one normal
  window and one private/incognito window, which gets its own cookie
  jar) and confirm each keeps its own independent count.
- Add a way to inspect how many distinct sessions currently exist —
  a `/debug` route returning `len(sessions)` — and watch it grow as
  you visit from different cookie jars.

### Definition of Done

- [ ] `app.secret_key` is set, and `session` is imported from `flask`.
- [ ] `get_state()` assigns a UUID to new sessions and reuses existing
      ones, backed by the `sessions` dict.
- [ ] Both routes call `get_state()` instead of reading a module-level
      `state` directly.
- [ ] Two separate cookie jars were used to confirm real, independent
      per-visitor counts, with actual output shown.
- [ ] The original shared-global-state bug was reproduced on purpose,
      with real output showing one visitor's action affecting another's
      count, confirming what this lesson actually fixed.
- [ ] Committed with a message explaining *why*: something like
      `"Scope State per browser session instead of one global object,
      so visitors no longer share and overwrite each other's data"` —
      not `"add sessions"`.
