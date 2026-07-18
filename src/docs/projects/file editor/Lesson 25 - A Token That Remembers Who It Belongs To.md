# Lesson 25: A Token That Remembers Who It Belongs To

## What you will build

`valid_tokens` stops being a plain membership check and starts carrying
an identity: every token now remembers exactly which username it was
issued to, and `require_auth` hands that username back to whichever
route asked for it. Nothing user-visible changes yet — no new button,
no new screen. This lesson is entirely about a backend capability the
next lesson depends on: a route that can finally answer "who, exactly,
is making this request?" instead of only "is this a valid someone?" —
the direct prerequisite for locking a file to one specific user.

## What you need to know first

`Lesson 8 - Authentication.md` — `valid_tokens = set()`,
`valid_tokens.add(token)`, `token not in valid_tokens`, and
`dependencies=[Depends(require_auth)]` gating five routes.
`Lesson 6 - Multi-Language Execution.md` — `RUNNERS`, a dictionary built
once with `{}` and read with `.get()`.

---

## Concept Unit: membership isn't identity

### The Problem

`token not in valid_tokens` (Lesson 8) answers exactly one question:
has this token ever been issued? It cannot answer "issued to whom" —
a Python `set` stores which items are present, nothing else. The next
lesson needs a route to know, concretely, which logged-in user is
holding the token attached to this exact request — a question a set
has no way to answer, no matter how it's queried.

### Concept Lab

```python
membership = {"bear", "wolf"}
print("bear" in membership)
print("otter" in membership)

ownership = {}
ownership["bear"] = "north den"
ownership["wolf"] = "south den"
print(ownership["bear"])
print("bear" in ownership)
```

Run it — actual output, this exact run:

```
True
False
north den
True
```

### What This Proves

`membership` is a `set` (Lesson 8's exact type) — `in` tells you
presence, and that's the entire interface; there is no way to ask a set
"and what's attached to `"bear"`?" because nothing is attached, ever.
`ownership` is a `dict`, a type this project has already used for fixed,
built-once lookups (`RUNNERS` in Lesson 6, built whole with `{}` and read
with `.get()`) — but `ownership["bear"] = "north den"` is new: assigning
into a dict one key at a time, growing it as the program runs, rather
than writing the whole thing out as a literal up front. `ownership["bear"]`
retrieves the value stored under that key, and `in` still works on a
dict exactly as it does on a set — it checks the keys. A dict answers
both questions a set can only answer one of: "is this here," and "here,
attached to what."

### Discard

`membership` and `ownership` are both deleted now — neither name appears
in the project. The real code below reuses the same `[key] = value`
assignment and `[key]` lookup, on `valid_tokens` itself.

---

## Concept Unit: the token now carries a name

### Project Change

- **Files affected** — `backend/main.py`, existing file.
- **Change type** — replace, three separate lines across two existing
  functions.
- **Location** — the `valid_tokens = set()` declaration (added in
  Lesson 8, directly below `CONTENT_DIR`); `valid_tokens.add(token)`
  inside `login` (Lesson 19); `token not in valid_tokens` inside
  `require_auth` (Lesson 8).
- **Dependencies** — none new; this is a change to an existing type, not
  an addition of one.

### The New Code — type this

The declaration changes from an empty set to an empty dict:

```python
valid_tokens = {}
```

`login` then assigns into it using this lesson's lab mechanic — the
*token* as the key, since the token is the hard-to-guess side that
actually proves identity, and the *username* as the value attached to
it:

```python
valid_tokens[token] = credentials.username
```

### The Updated Project — where this lives

`login`, in full, with the one changed line marked:

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
    valid_tokens[token] = credentials.username     # ← changed: was valid_tokens.add(token)
    return {"token": token}
```

`login` now stores the token as a *key* and the username as its
*value*, instead of adding the token as a bare member — everything
above and below that one line, the password verification, the dummy
timing-attack call from Lesson 17, the response shape, is unchanged.

### Mechanical Walkthrough

`valid_tokens = {}` — an empty dict literal, the same `{}` syntax
`RUNNERS` used in Lesson 6, but starting empty and growing one entry per
login rather than being written out whole. `valid_tokens[token] =
credentials.username` — first appearance of dict assignment in this
project: `token` is the key, `credentials.username` is the value being
attached to it: reusing the exact `ownership["bear"] = "north den"`
mechanic from this lesson's own lab, now for real.

### CS Lens — a map, not a set

A `set` models *membership*: is X in this collection? A `dict` models a
*mapping*: for every key present, what value does it point to? Both are
hash-table-backed, both answer `in` in roughly constant time regardless
of how many entries exist — the difference is purely what's stored
alongside each key. Swapping `set` for `dict` here didn't cost anything
in lookup speed; it added a payload to something that used to be a bare
yes/no.

Also recognized in: a phonebook (name → number, not just "is this name
listed"), a filesystem directory (filename → inode, not just "does this
name exist"), an HTTP session store (session ID → user record), a
compiler's symbol table (identifier → type and location).

### SE Lens — the smallest change that unlocks the next feature

The alternative would have been a second, separate dict —
`token_owners = {}` — kept in sync alongside the existing
`valid_tokens` set. That doubles the bookkeeping: two collections that
must never drift out of agreement, and a real bug waiting for whichever
future edit updates one and forgets the other. Replacing the set with a
dict removes that risk entirely — there is only ever one collection, and
membership (`token in valid_tokens`) still works exactly as before,
because `in` checks keys on a dict the same way it checks members on a
set.

### Run It

Not independently runnable yet — `login` now stores a username that
nothing reads back out. This unit connects to the next one, in the same
lesson, where `require_auth` is the first thing to actually retrieve it.

---

## Concept Unit: a dependency that hands back what it found

### The Problem

`require_auth` (Lesson 8) already looks up the token in `valid_tokens`
to confirm it's valid — and, as of this lesson's previous unit, that
lookup sits right next to the username the token belongs to. But every
route using `require_auth` so far writes `dependencies=[Depends(require_auth)]`
— Lesson 8's exact form — which runs `require_auth` and discards
whatever it returns. There is currently no way for a route to receive
the username `require_auth` already found.

### Concept Lab

```python
from fastapi import Depends, FastAPI

app = FastAPI()

def get_greeting() -> str:
    return "hello"

@app.get("/discarded", dependencies=[Depends(get_greeting)])
def discarded():
    return {"message": "the dependency ran, but its return value is gone"}

@app.get("/captured")
def captured(greeting: str = Depends(get_greeting)):
    return {"message": greeting}
```

Run against a live server — actual output, this exact run:

```
GET /discarded → {"message":"the dependency ran, but its return value is gone"}
GET /captured  → {"message":"hello"}
```

### What This Proves

Both routes call `Depends(get_greeting)` — same dependency function,
same `Depends(...)` call. The only difference is *where* it's written.
`dependencies=[Depends(get_greeting)]`, Lesson 8's form, runs
`get_greeting` and throws its return value away — `discarded`'s own
hardcoded message proves this, since `get_greeting`'s real return,
`"hello"`, never reaches it. `greeting: str = Depends(get_greeting)`
places the same call as a parameter's *default value* instead — FastAPI
still runs `get_greeting` first, but now assigns whatever it returns to
`greeting`, which the route body can use directly. Identical dependency,
identical timing (still runs before the route body, still short-circuits
the route entirely if it raises), two different outcomes for its return
value, chosen entirely by where `Depends(...)` is written.

### Discard

`get_greeting`, `discarded`, and `captured` are deleted now — none of
the three names appear in the project. The real code below applies the
second form, `param: str = Depends(require_auth)`, to `require_auth`
itself.

---

## Concept Unit: routes that now know who's asking

### Project Change

- **Files affected** — `backend/main.py`, existing file.
- **Change type** — replace, `require_auth`'s signature and body gain
  one line each; `write_file`'s signature changes from the gating form
  to the capturing form.
- **Location** — `require_auth`, defined directly below `valid_tokens`
  (Lesson 8); `write_file`, the `PUT /file` route (Lesson 3, gated in
  Lesson 8).
- **Dependencies** — this lesson's previous unit (`valid_tokens` now a
  dict); the capturing `Depends(...)` form just lab'd above.

### The New Code — type this

`require_auth` gains one line at its end, returning the lookup this
lesson's first unit made possible:

```python
return valid_tokens[token]
```

`write_file` then switches from discarding that return value to
capturing it, using this lesson's lab mechanic:

```python
def write_file(path: str, edit: FileEdit, current_user: str = Depends(require_auth)):
```

### The Updated Project — where this lives

`require_auth`, in full, with the new line marked:

```python
def require_auth(authorization: str = Header(None)) -> str:
    if authorization is None or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")

    token = authorization.removeprefix("Bearer ")
    if token not in valid_tokens:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    return valid_tokens[token]                                        # ← new
```

`write_file`'s decorator and signature, with the change marked:

```diff
- @app.put("/file", dependencies=[Depends(require_auth)])
- def write_file(path: str, edit: FileEdit):
+ @app.put("/file")
+ def write_file(path: str, edit: FileEdit, current_user: str = Depends(require_auth)):
```

The body of `write_file` — the traversal check, the file read, the git
commit — is unchanged in this lesson; it starts using `current_user` in
the next lesson. `require_auth` now returns the username it already
looked up, instead of implicitly returning `None`; `write_file` moved
`Depends(require_auth)` off the decorator and onto a new parameter,
`current_user`, which now receives that username on every call.

### Mechanical Walkthrough

`return valid_tokens[token]` — a first appearance of returning a dict
lookup directly: `token` is already known valid at this point (the line
above just confirmed `token in valid_tokens`), so `valid_tokens[token]`
retrieves the username stored there in `login`, and `return` sends it
back to whatever called `require_auth`. `-> str` in the function
signature (changed from `-> None`) is Lesson 1's return-type annotation,
reapplied — it now honestly states what the function hands back.
`current_user: str = Depends(require_auth)` is this lesson's lab
mechanic, applied for real: FastAPI runs `require_auth` before
`write_file`'s body, same as the old `dependencies=[...]` form, but now
assigns its return value — the username — to `current_user`.

### SE Lens — every gated route pays the same setup cost

Eight routes across this project use `dependencies=[Depends(require_auth)]`
today — `/files`, `/file` (GET), `/history`, `/run`, `/tokens`,
`/parse`, `/analyze`, `/diff`, `/diff-current`. Only `write_file`
switches to the capturing form in this lesson, because it's the only
one that currently needs the username. Every other route keeps the
gating-only form unchanged — switching all nine to capture a value
nothing uses would be pure noise, the same "don't build for hypothetical
future need" discipline already applied throughout this project. The
next lesson's `/checkout` and `/checkin` routes will need the username
too, and will use the same capturing form for the same concrete reason.

### Run It

Confirmed against a real running server this session, with two
independent users:

```
POST /checkout?path=src/main.py   (token belongs to alice)
→ 200 {"path":"src/main.py","checked_out_by":"alice"}
```

`checked_out_by` in that response is `current_user` — the exact value
`Depends(require_auth)` produced from alice's token, proving the whole
chain: `login` stored `valid_tokens[alice_token] = "alice"`, `require_auth`
returned `valid_tokens[alice_token]`, and the route received it as
`current_user`. (`/checkout` itself is next lesson's code — shown here
only as proof this lesson's identity chain actually works end to end.)

---

## Connect the pieces

A user logs in: `login` generates a token and now stores it as
`valid_tokens[token] = username`, a mapping instead of a bare member.
On every subsequent request, `require_auth` checks `token not in
valid_tokens` exactly as it always has, then returns
`valid_tokens[token]` — the username attached to that specific token.
Any route that writes `current_user: str = Depends(require_auth)`
instead of the old `dependencies=[Depends(require_auth)]` receives that
username directly, with no extra lookup of its own. `write_file` is the
first route converted this lesson; nothing about *what* it does with
`current_user` yet — that's the next lesson, where a lock is checked
against exactly this value.

## What breaks without this

Confirmed by tracing the code directly: with `valid_tokens` still a
`set`, `valid_tokens[token]` would raise `TypeError: 'set' object is not
subscriptable` — sets have no `[key]` lookup at all, since they were
never built to associate a value with a member. This is exactly why the
previous unit's change (`set()` to `{}`) had to land before this one:
`require_auth` returning a username is meaningless without something to
return it *from*.

## Exercises

1. In a scratch Python shell, create a `set`, then try `my_set["a"]` and
   read the real `TypeError` — confirm it matches this lesson's claim.
2. Log in as two different users through the real running app (or via
   `curl`), and print `valid_tokens` from a debugger or an added
   `print()` statement — confirm each token maps to the correct,
   distinct username.
3. Explain, without looking back at this lesson, why `login` used to
   call `.add(token)` and now uses `[token] = credentials.username` —
   what capability that change buys, concretely.
4. Convert one more already-gated route (pick any of the eight still
   using `dependencies=[Depends(require_auth)]`) to the capturing form,
   and print `current_user` inside it — confirm it receives the correct
   username, then revert the change (this project only needs the
   capturing form on the routes that use it for real).

## Definition of done

- [ ] You've seen the real `TypeError` from indexing a `set`
- [ ] You've confirmed, live, that two different logins produce two
      different usernames stored against two different tokens
- [ ] You can explain the difference between `dependencies=[Depends(fn)]`
      and `param: T = Depends(fn)` — what each does with the return value
- [ ] You can explain why only `write_file` was converted to the
      capturing form in this lesson, and not all nine gated routes
- [ ] `git commit` this lesson's code with a message explaining why
