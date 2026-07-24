# Lesson 17: Not Revealing Who Has an Account

## What you will build

A real `/signup` route and a `/login` rewritten to check a real user
against the database from Lesson 16, replacing Lesson 8's single shared
`ADMIN_PASSWORD` entirely. The feature is "anyone can create an
account"; the actual subject is a second, differently-shaped instance of
the exact timing vulnerability Lesson 8 already taught — this time
leaking not a password, but *whether a given username exists at all* —
found and fixed with the same real, measured discipline.

## What you need to know first

`Lesson 15 - Password Hashing.md` — `hash_password`, `verify_password`.
`Lesson 16 - A Real User Store.md` — `init_db`, `create_user`, `get_user`.
`Lesson 8 - Authentication.md` — the original timing attack, and
specifically `require_auth`/`valid_tokens`, both reused here unchanged.

**This lesson was built under the same explicit-review discipline as
Lessons 8 and 15.** It replaces this project's entire login mechanism.
Every number below is measured, not assumed.

---

## Concept Unit: replacing a shared secret with real accounts

### The Problem

`ADMIN_PASSWORD` was one password, read from one environment variable,
correct for exactly one shared admin secret — genuinely reasonable for
that narrow case, named honestly as such in Lesson 8's own SE Lens, and
completely wrong for real, individual accounts. This isn't a feature
being added alongside the old one; it's a replacement, and the old
mechanism needs to actually go, not sit unused.

### Project Change

- **Files affected** — `backend/main.py`, existing file.
- **Change type** — remove, replace, add. `ADMIN_PASSWORD` and the now-
  unused `import os` are deleted entirely; `LoginRequest` gains a
  `username` field; two new imports (`auth`, `db`) and two new module-
  level values (`DUMMY_SALT`, `DUMMY_HASH`) are added; `init_db()` runs
  once, at startup.
- **Dependencies** — `hash_password`/`verify_password` (Lesson 15),
  `create_user`/`get_user` (Lesson 16).

### The New Code — type this

```python
from auth import hash_password, verify_password
from db import init_db, create_user, get_user
```

And a `SignupRequest` model, alongside the existing `LoginRequest`,
which itself gains a field:

```python
class SignupRequest(BaseModel):
    username: str
    password: str


class LoginRequest(BaseModel):
    username: str
    password: str
```

Plus one line that actually runs at import time, not just a definition:

```python
init_db()
```

And two module-level values this lesson's later units explain in full:

```python
DUMMY_SALT = secrets.token_bytes(16)
DUMMY_HASH = secrets.token_bytes(32)
```

### The Updated Project — where this lives

Now see the whole top of the file, `ADMIN_PASSWORD` and `import os`
gone entirely:

```python
import ast
import secrets                                        # ← unchanged
import subprocess
from pathlib import Path

from fastapi import Depends, FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from auth import hash_password, verify_password       # ← new
from db import init_db, create_user, get_user         # ← new
from gcode.lexer import tokenize_program
from gcode.parser import parse_program
from gcode.analyzer import analyze_program

app = FastAPI()
init_db()                                              # ← new


class FileEdit(BaseModel):
    content: str


class SignupRequest(BaseModel):                        # ← new
    username: str                                       # ← new
    password: str                                        # ← new


class LoginRequest(BaseModel):
    username: str                                        # ← new
    password: str


CONTENT_DIR = (Path(__file__).parent / "content").resolve()
valid_tokens = set()
DUMMY_SALT = secrets.token_bytes(16)                    # ← new
DUMMY_HASH = secrets.token_bytes(32)                    # ← new
```

`import os` is gone — nothing else in this file ever used it.
`ADMIN_PASSWORD = os.environ.get(...)` is gone with it. `valid_tokens =
set()` and `require_auth`, below this, are completely untouched — this
lesson replaces *how* a token gets issued, not what a token proves once
issued.

### Mechanical Walkthrough
`from auth import hash_password, verify_password` and `from db import
init_db, create_user, get_user` both reuse the cross-module import
- pattern from Lesson 11 — `main.py` now depends on two more of this
project's own modules, the same way `gcode.parser` depends on
`gcode.lexer`. `SignupRequest` and the now-two-field `LoginRequest` both
- reuse the plain `BaseModel` shape from Lesson 3's `FileEdit` — two
required string fields each. `init_db()`, called directly at the top
level rather than inside any function, runs exactly once, the moment
this file is imported — before any route can possibly be hit, ensuring
the `users` table already exists by the time the first request arrives.
`secrets.token_bytes(16)`/`secrets.token_bytes(32)` reuse the exact
- random-byte generation `hash_password` itself already uses — this
lesson's next unit explains what these two specific values are for.

---

## Concept Unit: the signup route

### The Problem

Something has to accept a new username and password, refuse a username
that's already taken, and store the account safely.

### Project Change

- **Files affected** — `backend/main.py`, existing file.
- **Change type** — add, a new `@app.post("/signup")` route, replacing
  the old `@app.post("/login")` route's position.
- **Dependencies** — `SignupRequest`, `hash_password`, `create_user`.

### The New Code — type this

```python
@app.post("/signup")
def signup(credentials: SignupRequest):
    if get_user(credentials.username) is not None:
        raise HTTPException(status_code=400, detail="Username already taken")

    salt, password_hash = hash_password(credentials.password)
    create_user(credentials.username, salt, password_hash)
    return {"username": credentials.username}
```

### The Updated Project — where this lives

This is a complete, freestanding new route, replacing the old
`@app.post("/login")` at this exact position in the file — the next
unit rebuilds `/login` immediately after it, in the same spot Lesson 8
originally put it.

### Mechanical Walkthrough
`get_user(credentials.username) is not None` reuses Lesson 16's own
- `None`-means-not-found convention directly — a real username collision,
caught here, before ever reaching `create_user`, which would otherwise
raise a raw `sqlite3.IntegrityError` instead of a clean, readable `400`.
`hash_password(credentials.password)` reuses Lesson 15's function
exactly, unpacking the returned tuple into `salt, password_hash`, the
same unpacking-assignment shape from Lesson 7. `create_user(...)` reuses
Lesson 16's function directly, storing all three real values. `return
{"username": credentials.username}` deliberately does *not* also log the
new user in automatically — signup and login stay two separate, explicit
steps, the same way this project has kept saving and diagnosing as two
separate actions since Lesson 9, rather than quietly combining them.

### Run It

```
POST /signup {"username":"alice","password":"correct horse battery staple"} → 200 {"username":"alice"}
POST /signup {"username":"alice","password":"a different password"}        → 400 {"detail":"Username already taken"}
```

Both confirmed directly against the real running server — a second
signup attempt with the same username is rejected before it ever
overwrites the first account.

---

## Concept Unit: login against a real user

### The Problem

`/login` needs to look up a specific user by the submitted username, and
check the submitted password against *that* user's own stored salt and
hash — not one shared secret anymore.

### Project Change

- **Files affected** — `backend/main.py`, existing file.
- **Change type** — replace, the entire `/login` route body.
- **Location** — the same position Lesson 8's `/login` already occupied.
- **Dependencies** — `get_user`, `verify_password`.

### The New Code — type this

```python
@app.post("/login")
def login(credentials: LoginRequest):
    user = get_user(credentials.username)

    if user is None:
        verify_password(credentials.password, DUMMY_SALT, DUMMY_HASH)
        raise HTTPException(status_code=401, detail="Invalid username or password")

    user_id, username, salt, password_hash = user
    if not verify_password(credentials.password, salt, password_hash):
        raise HTTPException(status_code=401, detail="Invalid username or password")

    token = secrets.token_urlsafe(32)
    valid_tokens.add(token)
    return {"token": token}
```

### The Updated Project — where this lives

Sitting directly after `signup`, in the exact position Lesson 8's
version of `/login` used to occupy:

```python
@app.post("/signup")
def signup(credentials: SignupRequest):
    if get_user(credentials.username) is not None:
        raise HTTPException(status_code=400, detail="Username already taken")

    salt, password_hash = hash_password(credentials.password)
    create_user(credentials.username, salt, password_hash)
    return {"username": credentials.username}


@app.post("/login")                                                        # ← changed: entirely new body
def login(credentials: LoginRequest):                                      # ← changed
    user = get_user(credentials.username)                                  # ← changed

    if user is None:                                                       # ← changed
        verify_password(credentials.password, DUMMY_SALT, DUMMY_HASH)      # ← changed
        raise HTTPException(status_code=401, detail="Invalid username or password")  # ← changed

    user_id, username, salt, password_hash = user                         # ← changed
    if not verify_password(credentials.password, salt, password_hash):    # ← changed
        raise HTTPException(status_code=401, detail="Invalid username or password")  # ← changed

    token = secrets.token_urlsafe(32)
    valid_tokens.add(token)
    return {"token": token}
```

`token = secrets.token_urlsafe(32)` and `valid_tokens.add(token)`, at the
bottom, are the only two lines carried over unchanged from Lesson 8 — a
token still means exactly what it meant before: "this specific bearer
has already proven who they are." What changed is everything *before*
those two lines — proving it now means checking a real, individual
account instead of one shared secret.

### Mechanical Walkthrough
`user = get_user(credentials.username)` reuses Lesson 16's lookup
directly. `if user is None:` handles the case where no such username
- exists at all — `verify_password(credentials.password, DUMMY_SALT,
DUMMY_HASH)` runs anyway, its result thrown away entirely, purely to
spend the same real time a genuine check would — the next unit explains
exactly why. `raise HTTPException(status_code=401, detail="Invalid
username or password")` reuses the generic-401 shape from Lesson 8,
worded deliberately vague. `user_id, username, salt, password_hash =
- user` unpacks the real stored row — `user_id` and `username` aren't used
again in this function, kept as named, readable positions in the tuple
rather than an unexplained `_, _, salt, password_hash`. `verify_password(credentials.password,
salt, password_hash)` reuses Lesson 15's function against this specific
- user's own real stored values — the entire reason a per-user `salt` was
stored at all back in Lesson 16, put to use for the first time. The
final three lines reuse Lesson 8 exactly, unchanged.

### CS Lens — the same generic error message defends against enumeration

Returning `"Invalid username or password"` for *both* failure cases —
never `"No such user"` versus `"Wrong password"` — is deliberate: a
distinct message per case would let anyone testing usernames learn,
one attempt at a time, exactly which ones have real accounts, entirely
independent of ever guessing a password. This is **enumeration**, and
worth naming as its own real category: distinguishable outcomes leaking
information about what data exists, even when the data's actual contents
stay fully protected. The message alone isn't the whole story, though —
the next unit measures a second, subtler channel the message hides
nothing about.

---

## Concept Unit: the same timing, not just the same message

### The Problem

A message can be made identical on purpose. *Time* is harder to
disguise by accident: `get_user` on a real, existing username still has
to run `verify_password` — a deliberately slow, ~0.2-second PBKDF2 call,
by design since Lesson 15 — while a `user is None` branch, without the
dummy call added above, would return almost instantly. Measured
directly, without that dummy call in place:

```python
# real username, wrong password:
user = get_user("alice")
_, _, salt, password_hash = user
verify_password("wrong guess", salt, password_hash)

# nonexistent username, no dummy call:
user = get_user("this_username_does_not_exist_at_all")
# nothing else runs
```

Actual output, each timed with `time.perf_counter()`:

```
real username, wrong password: 0.1896s
nonexistent username:          0.0005s
```

### What This Proves

A roughly 380-times difference, measured on this exact machine, running
this exact code — an attacker who can measure response time doesn't even
need a distinguishable error message; a login attempt that returns in
under a millisecond, versus one that takes a fifth of a second, already
answers "does this username exist" with near-total confidence, purely
from *how long the server took to say no*. This is Lesson 8's timing
attack again — the same underlying mechanism, comparison work that
finishes early leaking information through its own speed — but leaking
the *existence of an account* this time, not a password's contents.

### The Fix

```python
if user is None:
    verify_password(credentials.password, DUMMY_SALT, DUMMY_HASH)
    raise HTTPException(status_code=401, detail="Invalid username or password")
```

This is already in place in the real code above — `DUMMY_SALT` and
`DUMMY_HASH`, generated once at startup, exist for exactly this: giving
the `user is None` branch something to run `verify_password` against,
paying the identical real cost a genuine check would, even though the
result is thrown away immediately afterward.

### Run It

The same measurement, this time with the dummy call in place:

```python
import secrets
DUMMY_SALT = secrets.token_bytes(16)
DUMMY_HASH = secrets.token_bytes(32)

# real username, wrong password:
user = get_user("alice")
_, _, salt, password_hash = user
verify_password("wrong guess", salt, password_hash)

# nonexistent username, now WITH the dummy call:
user = get_user("this_username_does_not_exist_at_all")
if user is None:
    verify_password("wrong guess", DUMMY_SALT, DUMMY_HASH)
```

Actual output:

```
real username, wrong password: 0.1876s
nonexistent username (fixed):  0.1882s
```

Confirmed directly: the 380-times gap collapses to well under a
percent — both branches now pay the same real, deliberate PBKDF2 cost,
regardless of which one actually ran.

### SE Lens — a cost that has to be paid honestly, not hidden

The fix here isn't clever misdirection — it's genuinely doing the same
expensive work either way, on purpose, rather than trying to fake a
delay with something like `time.sleep()`. A `sleep()`-based fix would be
a real, worse alternative: easy to get subtly wrong (sleeping for the
*wrong* duration relative to the real computation, especially if
`PBKDF2_ITERATIONS` ever changes later), and it fakes safety without
actually spending comparable, real computational cost — the same
distinction Lesson 5 drew between a sandboxed process and one merely
assumed safe.

---

## Connect the pieces

Signing up as `alice` and then logging in: `signup` checks `get_user`
first, finds nothing, hashes the password with a fresh random salt via
`hash_password`, and stores all three fields with `create_user` — a real
row, now surviving a server restart, exactly as Lesson 16 proved. `login`
looks that same username up again, finds the real stored `salt` and
`password_hash`, and calls `verify_password` against them — the same
function, the same PBKDF2 cost, whether the username exists or not,
because the `user is None` branch pays that identical cost against
`DUMMY_SALT`/`DUMMY_HASH` instead of skipping the work entirely. A
successful login still issues a token into `valid_tokens` exactly as
Lesson 8 always has — everything downstream of that token, every gated
route this project has built since Lesson 8, needs no changes at all,
because a token still means exactly what it always meant.

## What breaks without this

Already demonstrated concretely above, not hypothetically: without the
dummy `verify_password` call, a real username and a nonexistent one
differ by roughly 380 times in response time — `0.1896s` versus
`0.0005s`, measured directly — trivially enough to distinguish over a
real network, no averaging or repeated sampling required the way Lesson
8's original microsecond-scale timing attack did. With the fix, both
paths measure within a percent of each other.

## Exercises

1. Sign up two different accounts through the real running app, log in
   to each one, and confirm each issues its own real token.
2. Reproduce this lesson's timing measurement yourself — time a login
   against a username you created, and a username you know doesn't
   exist — with the fix in place, and confirm the two times land close
   together.
3. Temporarily remove the `verify_password(credentials.password,
   DUMMY_SALT, DUMMY_HASH)` line from the `user is None` branch, re-time
   the same two requests, and read the real gap reappear — then restore
   the fix.

## Definition of done

- [ ] You've signed up and logged in as a real user through the actual
      running app
- [ ] You've confirmed a duplicate signup is rejected
- [ ] You've measured, yourself, the timing gap this lesson's fix closes
- [ ] You can explain why the fix calls `verify_password` against dummy
      values instead of using `time.sleep()`
- [ ] You can explain why `ADMIN_PASSWORD` was deleted rather than kept
      around unused
- [ ] `git commit` this lesson's code with a message explaining why
