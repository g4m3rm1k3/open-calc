# Lesson 09: Login and Sessions

**What you will build:** a real, working `POST /api/login` endpoint,
verifying a real password with Lesson 08's own `verify_password`, and a
real, server-side session — a real, random token, stored in SQLite and
set as a real, `HttpOnly` browser cookie — so a verified identity stays
recognized across more than one request without re-sending a real
password every time.

**What you need to know first:** [Lesson 08](lesson-08-password-hashing.md)
— `verify_password`, called directly by this lesson's own real login
endpoint.

**Terms introduced in this lesson:**
- **Session** — a real, server-recorded fact: this specific, real token
  corresponds to this specific, real, already-authenticated user —
  checked on every later request, so a real password never needs to be
  resent.
- **`HttpOnly` cookie** — a real, standard browser cookie attribute
  telling the browser itself to withhold that cookie's own value from
  any real, client-side JavaScript — readable only by the browser's own
  real network layer, sent automatically with matching real requests.

**Objects and methods used:**

**`secrets.token_urlsafe()`**
- *What it is:* a real, standard-library Python function, part of the
  `secrets` module — deliberately separate from Python's own general-
  purpose `random` module.
- *Implementation:* `secrets.token_urlsafe(32)` returns a real,
  cryptographically strong, random, URL-safe string — genuinely
  unpredictable, unlike `random`'s own real, faster, but
  **not** cryptographically secure output.
- *Its use:* this project's own real, unguessable session tokens.

**`Response.set_cookie()`**
- *What it is:* a real, built-in method on FastAPI's `Response` object.
- *Implementation:* `response.set_cookie(key, value, httponly=True,
  samesite="lax")` — sends a real `Set-Cookie` HTTP header, instructing
  the browser to store this value and resend it automatically on every
  later real request to this same real origin.
- *Its use:* handing a real, freshly-created session token to the
  browser, safely.

---

## Concept Unit: A Real Login Endpoint

### The Problem

`verify_password` (Lesson 08) is real and correct, but nothing yet
calls it from a real request, and nothing yet gives a verified user any
real way to prove, on their *next* request, that they already logged in
once.

### Introduce the Concept in Isolation

```python
# src/data/sessions_repository.py
import secrets


def create_session(conn, user_id: int) -> str:
    token = secrets.token_urlsafe(32)
    conn.execute("INSERT INTO sessions (token, user_id) VALUES (?, ?)", (token, user_id))
    conn.commit()
    return token
```

```python
# src/api/auth.py
from fastapi import APIRouter, Depends, HTTPException, Response

from src.data.database import get_db
from src.data.sessions_repository import create_session
from src.data.users_repository import get_user_by_username
from src.domain.auth import verify_password

router = APIRouter()


@router.post("/api/login")
def login(username: str, password: str, response: Response, db=Depends(get_db)):
    user = get_user_by_username(db, username)
    if user is None or not verify_password(password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="invalid username or password")
    token = create_session(db, user["id"])
    response.set_cookie(key="session_token", value=token, httponly=True, samesite="lax")
    return {"username": user["username"], "display_name": user["display_name"]}
```

```
$ curl -i -X POST "http://127.0.0.1:8000/api/login?username=alice&password=hunter2"
HTTP/1.1 200 OK
set-cookie: session_token=kR9x...; HttpOnly; SameSite=lax

{"username":"alice","display_name":"Alice"}
```

```
$ curl -i -X POST "http://127.0.0.1:8000/api/login?username=alice&password=wrong"
HTTP/1.1 401 Unauthorized

{"detail":"invalid username or password"}
```

```
$ curl -i -X POST "http://127.0.0.1:8000/api/login?username=nobody&password=anything"
HTTP/1.1 401 Unauthorized

{"detail":"invalid username or password"}
```

The identical real error, and the identical real status code, whether
the real username genuinely doesn't exist or the real password was
simply wrong — a real, deliberate choice: `user is None or not
verify_password(...)`, checked together, never lets a real attacker
distinguish "that username doesn't exist" from "that username exists,
wrong password," which would otherwise hand them a real, working way to
enumerate genuine, valid usernames one guess at a time.

### Discard

Nothing throwaway — `create_session`, `login`, and their own real,
combined error handling are all permanent.

### Mechanical Walkthrough

- `secrets.token_urlsafe(32)` — **(a) first appearance**, full
  treatment above.
- `if user is None or not verify_password(password, user["password_hash"]):`
  — **(b) hard concept reappearing** for `verify_password` (Lesson
  08); the real, deliberate `or` combining two genuinely different
  real failure causes into one real, identical response — **(a) first
  appearance** of this specific, real security pattern.
- `response.set_cookie(key="session_token", value=token, httponly=True,
  samesite="lax")` — **(a) first appearance**, full treatment above;
  `samesite="lax"` — a real, standard cookie attribute limiting when a
  browser sends this cookie on cross-site requests, a real, further
  layer this lesson names but does not deep-dive.

### CS Lens

A session token is a real, direct instance of a **bearer credential**:
whoever genuinely possesses the real, correct token is treated as the
real, authenticated user it belongs to, for as long as it remains
valid — the identical underlying idea behind an API key, an OAuth
access token, or a real, physical hotel key card, none of which
re-verify the original, real password each time they're used.

### SE Lens

The real, deliberate choice to combine "user not found" and "wrong
password" into one, identical real response is a direct, concrete
application of **not leaking information through error
differentiation** — a real, common, genuinely serious mistake: an API
that helpfully returns a different real error for "no such user" would
hand a real attacker a free, fast way to build a real list of valid
usernames before ever attempting a single real password.

## Concept Unit: Recognizing a Session on Later Requests

### The Problem

A real cookie, sent back from login, is useless until some real,
later request actually reads it and confirms it's still valid.

### Introduce the Concept in Isolation

```python
# src/api/auth.py (extended)
from fastapi import Request

from src.data.sessions_repository import get_user_id_for_token
from src.data.users_repository import get_user_by_id


def get_current_user(request: Request, db=Depends(get_db)):
    token = request.cookies.get("session_token")
    if token is None:
        raise HTTPException(status_code=401, detail="not authenticated")
    user_id = get_user_id_for_token(db, token)
    if user_id is None:
        raise HTTPException(status_code=401, detail="not authenticated")
    return get_user_by_id(db, user_id)


@router.get("/api/me")
def me(current_user=Depends(get_current_user)):
    return {"username": current_user["username"], "display_name": current_user["display_name"]}
```

```
$ curl -i --cookie "session_token=kR9x..." http://127.0.0.1:8000/api/me
HTTP/1.1 200 OK

{"username":"alice","display_name":"Alice"}
$ curl -i http://127.0.0.1:8000/api/me
HTTP/1.1 401 Unauthorized

{"detail":"not authenticated"}
```

`get_current_user` is this project's own real, first, reusable
authentication dependency — every real, future route that needs to know
*who* is asking (Lesson 11's own authorization checks, Phase 4's own
checkout logic) reuses it directly, the identical real `Depends` shape
this project has used since Lesson 03.

Now, the real, concrete reason `httponly=True` matters — proven, not
merely asserted:

```
$ curl -s -X POST "http://127.0.0.1:8000/api/login?username=alice&password=hunter2" \
    -c cookies.txt > /dev/null
```

Opening this project's own real page in a browser and running, in its
own real developer console:

```js
document.cookie
```

```
""
```

A real, empty string — `document.cookie` genuinely cannot see
`session_token` at all, because `HttpOnly` withholds it from
JavaScript specifically. A real, malicious script, injected through
some real, different, hypothetical vulnerability elsewhere in this
project, could still make real requests using the browser's own cookie
jar — but could never *read* and exfiltrate the real token value
directly, the concrete, real difference `httponly=True` makes.

### Discard

Nothing throwaway — `get_current_user` is real, permanent, and reused
directly starting Lesson 11.

### Mechanical Walkthrough

- `token = request.cookies.get("session_token")` — **(a) first
  appearance** of FastAPI's own real `Request.cookies`, a real,
  dict-like mapping of every real cookie the incoming request carried.
- `get_user_id_for_token(db, token)` / `get_user_by_id(db, user_id)` —
  **(b) hard concept reappearing**, ordinary repository functions,
  following this project's own already-established Lesson 03 pattern.
- `document.cookie` — **(a) first appearance** of this real, standard
  browser JavaScript property — shown here specifically to prove what
  it *cannot* see, not to use it for anything real.

### CS Lens

`HttpOnly` is a real, direct instance of the **principle of least
privilege**, applied to a browser's own JavaScript runtime specifically:
client-side script is given exactly the real access it needs (none, for
a real session token it never legitimately needs to read directly) and
no more, closing off a real, entire class of attack before it can even
be attempted.

### SE Lens

The real, honest, remaining gap this lesson leaves open: real sessions,
as built here, never expire. A real, production-appropriate version
would add a real `expires_at` column and reject a real, stale token —
a real, legitimate, deliberate exercise below, not solved silently
here.

## Connect the pieces

`POST /api/login`, calling Lesson 08's own real `verify_password`
directly, issues a real, unguessable session token via `secrets.
token_urlsafe`, stored server-side and handed to the browser as a real,
`HttpOnly` cookie — proven, directly, to be invisible to real,
client-side JavaScript. `get_current_user`, this project's own first
real, reusable authentication dependency, then reads that same real
cookie back on any later request, giving every future protected route a
correct, real, single way to ask "who is this."

## What breaks without this

Set the cookie without `httponly=True`, reproducing the real risk this
lesson's own second unit already proved closed:

```python
response.set_cookie(key="session_token", value=token, samesite="lax")
```

```js
document.cookie
```

```
"session_token=kR9x..."
```

The real, live token, now genuinely readable from ordinary JavaScript —
direct, provable proof that `httponly=True` was never optional
styling: without it, any real script running on this page — including
one injected through an entirely unrelated, real, future vulnerability
— could read and exfiltrate a real, live session token directly.

## Exercises

1. Add a real `expires_at` column to `sessions` (a real migration,
   Lesson 05's own pattern), set it a real, fixed duration ahead of
   `created_at`, and update `get_user_id_for_token` to reject an
   expired real token.
2. Add a real `POST /api/logout` endpoint, deleting the real session row
   matching the current real cookie and clearing it from the browser
   with `response.delete_cookie("session_token")`.

## Definition of Done

- [ ] You logged in with a real, correct password and received a real,
      working session cookie.
- [ ] You confirmed the identical, generic `401` for both a
      nonexistent username and a wrong password.
- [ ] You built `get_current_user` and confirmed `GET /api/me` works
      only with a real, valid session.
- [ ] You reproduced the real cookie-exposure risk from omitting
      `httponly=True` and confirmed it directly in a browser console.
- [ ] You completed both exercises.

## Next

[Lesson 10 — The Super-Admin Bootstrap](lesson-10-the-super-admin-bootstrap.md)
solves a real, genuine chicken-and-egg problem this lesson's own login
flow quietly assumes away: how does the very first real user — with no
one yet able to create an account for them — ever get one at all?
