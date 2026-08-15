# Lesson 11: Roles and Authorization

**What you will build:** a real, reusable, enforced authorization
dependency — `require_role` — giving `super_admin`/`admin`/`user` real,
checked meaning for the first time, and a real, working `POST
/api/admins` endpoint only a genuine super-admin can ever reach.

**What you need to know first:** [Lesson 09](lesson-09-login-and-sessions.md)
— `get_current_user`, this lesson's own real starting point: it already
proves *who* is asking; this lesson answers whether they're allowed to.
[Lesson 07](lesson-07-what-authentication-actually-means.md) — its own
real, named distinction between authentication and authorization,
finally given real, enforced code.

**Terms introduced in this lesson:** none new — `role` and
`authorization` both already have full, named treatment from Lesson 07;
this lesson enforces them for the first time.

**Objects and methods used:** none new — this lesson combines
already-explained `Depends` and `HTTPException` into one real,
reusable, parameterized dependency.

---

## Concept Unit: A Real, Reusable Role Check

### The Problem

`get_current_user` (Lesson 09) proves *who* is asking. Nothing yet asks
whether that real, verified identity is actually allowed to do what
it's attempting — the exact, real gap Lesson 07 named directly and
deferred.

### Introduce the Concept in Isolation

```python
# src/domain/auth.py (extended)
ROLE_HIERARCHY = {"user": 0, "admin": 1, "super_admin": 2}


def has_role_at_least(user_role: str, required_role: str) -> bool:
    return ROLE_HIERARCHY.get(user_role, -1) >= ROLE_HIERARCHY.get(required_role, 0)
```

```
$ python -c "
from src.domain.auth import has_role_at_least
print(has_role_at_least('admin', 'user'))
print(has_role_at_least('user', 'admin'))
print(has_role_at_least('super_admin', 'admin'))
"
True
False
True
```

A real, pure, framework-agnostic function — Lesson 02's own real rule,
upheld again — correctly proving `admin` satisfies a real `user`-level
requirement, `user` does not satisfy an `admin`-level one, and
`super_admin` satisfies both.

A real, reusable, *parameterized* dependency, wired directly to it:

```python
# src/api/auth.py (extended)
from src.domain.auth import has_role_at_least


def require_role(required_role: str):
    def dependency(current_user=Depends(get_current_user)):
        if not has_role_at_least(current_user["role"], required_role):
            raise HTTPException(status_code=403, detail="insufficient permissions")
        return current_user
    return dependency
```

```python
@router.post("/api/admins")
def create_admin(
    username: str,
    password: str,
    display_name: str,
    db=Depends(get_db),
    current_user=Depends(require_role("super_admin")),
):
    user_id = create_user(db, username, password, display_name, role="admin")
    return {"id": user_id, "username": username, "role": "admin"}
```

```
$ curl -i --cookie "session_token=<alice, a real super_admin>" \
    -X POST "http://127.0.0.1:8000/api/admins?username=bob&password=x&display_name=Bob"
HTTP/1.1 200 OK

{"id":2,"username":"bob","role":"admin"}
```

```
$ curl -i --cookie "session_token=<bob, a real user>" \
    -X POST "http://127.0.0.1:8000/api/admins?username=eve&password=x&display_name=Eve"
HTTP/1.1 403 Forbidden

{"detail":"insufficient permissions"}
```

A real, genuine `403` — Alice, a real `super_admin`, succeeds; Bob, a
real, ordinary `user`, is correctly refused the identical, real
operation.

### Discard

Nothing throwaway — `has_role_at_least`, `require_role`, and `POST
/api/admins` are all real and permanent.

### Mechanical Walkthrough

- `ROLE_HIERARCHY = {"user": 0, "admin": 1, "super_admin": 2}` — **(a)
  first appearance** of this project's own real, ordered role scale,
  expressed as real, plain integers specifically so "at least this
  role" can be a real, ordinary numeric comparison.
- `def require_role(required_role: str): def dependency(current_user=
  Depends(get_current_user)): ...; return dependency` — **(a) first
  appearance** of a real **dependency factory**: a real, ordinary
  Python function that *returns* a real, `Depends`-compatible function,
  parameterized by `required_role` — genuinely new, beyond
  `sqlite-mastery`'s own simpler, unparameterized `Depends(get_db)`
  shape.
- `current_user=Depends(require_role("super_admin"))` — **(b) hard
  concept reappearing** for `Depends` itself; `require_role
  ("super_admin")`, called with a real argument *before* being handed
  to `Depends` — **(a) first appearance** of actually using the real
  factory this unit just built.

### CS Lens

`require_role`'s own real, factory shape is a direct, concrete instance
of a **higher-order function**: a real function that takes a real
argument (`required_role`) and returns a new, real function, itself
built specifically around that argument — the identical underlying
idea `sqlite-mastery` Lesson 15's own trigger-based automatic behavior
touched conceptually, here expressed as ordinary, real Python instead
of SQL.

### SE Lens

The real, deliberate reason this project reaches for one, parameterized
`require_role` function rather than writing `require_admin`,
`require_super_admin`, and any real, future role-specific dependency
separately: every one of those would be real, near-identical code,
differing only in one real string — exactly the kind of real, scattered
duplication this project's own README already names as the failure mode
being explicitly avoided.

## Connect the pieces

`has_role_at_least`, a real, pure, framework-agnostic function, gave
this project's own three real roles genuine, ordered meaning for the
first time. `require_role`, a real dependency factory built directly on
top of it, gave every real, future permission-sensitive route — `POST
/api/admins` first, and every one after it — one, single, reusable, real
way to enforce that meaning, proven directly: Alice succeeds, Bob is
correctly refused.

## What breaks without this

Reproduce a real, easy, genuinely dangerous mistake — protect `POST
/api/admins` with `get_current_user` alone, forgetting `require_role`
entirely:

```python
@router.post("/api/admins")
def create_admin_unsafe(
    username: str, password: str, display_name: str,
    db=Depends(get_db), current_user=Depends(get_current_user),
):
    user_id = create_user(db, username, password, display_name, role="admin")
    return {"id": user_id, "username": username, "role": "admin"}
```

```
$ curl -i --cookie "session_token=<bob, a real, ordinary user>" \
    -X POST "http://127.0.0.1:8000/api/admins-unsafe?username=eve&password=x&display_name=Eve"
HTTP/1.1 200 OK

{"id":3,"username":"eve","role":"admin"}
```

A real, genuine authorization bypass — Bob, an ordinary real `user`,
successfully created a real, new admin account, because
`get_current_user` alone only ever answers *authentication*
("who is this, genuinely") and says nothing at all about
*authorization* ("are they allowed to do this specific, real thing") —
the exact, real distinction Lesson 07 named directly, now proven to
have a real, concrete, exploitable cost the instant it's forgotten on
even one real route.

## Exercises

1. Reproduce this lesson's own real authorization bypass yourself,
   then remove the disposable `create_admin_unsafe` route entirely —
   it was never real, permanent project code.
2. Add a real `GET /api/users` endpoint, protected with
   `require_role("admin")` (not `"super_admin"`) — confirm a real
   `admin` account succeeds and a real, ordinary `user` account still
   receives a real `403`.

## Definition of Done — Phase 2 Complete

- [ ] You built `has_role_at_least` and confirmed its real, correct
      behavior across all three roles.
- [ ] You built `require_role` and a real, protected `POST
      /api/admins` endpoint, confirmed against both a real
      `super_admin` and a real `user` account.
- [ ] You reproduced the real authorization bypass from omitting
      `require_role` and understand precisely why authentication alone
      never implies authorization.
- [ ] You completed both exercises.

## Phase 2 complete

Five lessons, and Forge now has real, working identity, start to
finish: authentication and authorization named and distinguished
(Lesson 07), a real, dangerous plaintext mistake proven and closed with
real, salted `bcrypt` hashing (Lesson 08), a real, working login and
`HttpOnly` session (Lesson 09), a real, safe way to bootstrap the very
first super-admin outside this project's own HTTP surface entirely
(Lesson 10), and a real, enforced, reusable role hierarchy closing the
exact, real gap authentication alone always leaves open (Lesson 11).
[Phase 3](lesson-12-reproducing-the-real-bug-on-purpose.md) turns to
this project's own real, central problem directly — reproducing, on
purpose, the exact bug that brought this whole project into existence.
