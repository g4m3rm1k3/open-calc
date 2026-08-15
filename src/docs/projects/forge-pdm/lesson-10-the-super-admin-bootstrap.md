# Lesson 10: The Super-Admin Bootstrap

**What you will build:** a real, deliberate, command-line-only way to
create this project's own very first super-admin — and a real, direct
proof of why that same script must permanently refuse to run a second
time once one already exists.

**What you need to know first:** [Lesson 09](lesson-09-login-and-sessions.md)
— real login and sessions, both of which assume a real user already
exists; this lesson is where the real, very first one comes from.

**Terms introduced in this lesson:**
- **Bootstrap problem** — a real, general kind of chicken-and-egg gap:
  a real system whose own normal rules (only an existing admin can
  create a new one) have no real way to produce the very first
  instance those rules depend on.

**Objects and methods used:** none new — this lesson's own real script
reuses `create_user` (Lesson 07) and `run_migrations` (Lesson 05)
directly; its own real subject is *where* this code runs from, not new
syntax.

---

## Concept Unit: A Real, Deliberately Separate Script

### The Problem

Every real user this project will ever have, after this lesson, gets
created by an already-authenticated admin (Lesson 11's own real
subject). The very first real super-admin has no real, existing admin
to create them — the real, classic bootstrap problem.

### Introduce the Concept in Isolation

A real, deliberate choice: not a real HTTP endpoint at all — a real,
separate, command-line script, run once, by whoever has real,
legitimate access to the server or database file directly:

```python
# scripts/create_super_admin.py
import sqlite3
import sys

from src.data.database import DB_PATH
from src.data.migrations import run_migrations
from src.data.users_repository import create_user


def main():
    conn = sqlite3.connect(DB_PATH)
    run_migrations(conn)

    username = input("Super-admin username: ")
    password = input("Super-admin password: ")
    display_name = input("Display name: ")

    create_user(conn, username, password, display_name, role="super_admin")
    print(f"Created super-admin '{username}'.")


if __name__ == "__main__":
    main()
```

```
$ python scripts/create_super_admin.py
Super-admin username: alice
Super-admin password: hunter2
Display name: Alice
Created super-admin 'alice'.
```

A real, working super-admin, created entirely outside this project's
own real HTTP surface — no real route anywhere in `src/api/` can create
one, on purpose. Real access to run this real script requires real
access to the server or database file itself — a genuinely different,
and genuinely higher, real bar than "knows a valid session cookie."

### Discard

Nothing throwaway — `scripts/create_super_admin.py` is real and
permanent, run exactly once per real, genuine deployment.

### Mechanical Walkthrough

- `conn = sqlite3.connect(DB_PATH); run_migrations(conn)` — **(b) hard
  concept reappearing**, Lessons 03 and 05, unchanged — this real
  script ensures the real schema exists correctly, exactly like
  `main.py`'s own real `lifespan` block does.
- `input("Super-admin username: ")` — **(a) first appearance** of
  Python's own real, standard, interactive `input()` function —
  genuinely new to this series, ordinary Python.
- `create_user(conn, username, password, display_name,
  role="super_admin")` — **(b) hard concept reappearing** for
  `create_user` itself; `role="super_admin"` — **(a) first
  appearance** of this real, explicit keyword argument, requiring
  `create_user`'s own real signature (Lesson 07) to accept a real role
  instead of always defaulting to `'user'`.

### CS Lens

Moving this project's own most sensitive, real capability — minting a
super-admin — outside its own normal HTTP surface entirely is a real,
direct instance of **reducing the real attack surface**: a real
capability that doesn't exist as a reachable network endpoint at all
cannot be reached by a real, remote attacker, regardless of how strong
this project's own real authentication and authorization later prove
to be.

### SE Lens

The real alternative not chosen: a real, first-run-only HTTP endpoint,
automatically disabled once a super-admin exists. That real design is
genuinely workable, and real systems do use it — its own real, honest
cost: it's reachable over the network the instant this project's own
server is running, for however brief a real window, and a real,
concurrent race (two real requests, both arriving before either
commits) is a real, additional problem to solve correctly. This
lesson's own real, command-line script sidesteps that entire real class
of problem, at the real cost of requiring a genuine, direct, one-time
step from whoever deploys this project — a real, deliberate, honest
tradeoff, not a limitation.

## Concept Unit: Refusing to Run a Second Time

### The Problem

`create_super_admin.py`, exactly as written, has no real memory of
whether it's already been used. What happens if it's run again?

### Introduce the Concept in Isolation

```
$ python scripts/create_super_admin.py
Super-admin username: mallory
Super-admin password: whatever123
Display name: Mallory
Created super-admin 'mallory'.
```

A real, second, genuinely unauthorized super-admin — `mallory` —
created with no real check at all, by anyone who happens to gain real
access to run this one script a second time, long after this project's
own real, legitimate setup was already complete. This is a real,
serious, silent backdoor: every one of Lesson 11's own real
authorization checks (Phase 2's own closing lesson) becomes
meaningless the instant a real, unauthorized second super-admin can be
minted this easily.

The real, correct fix — refuse outright, the instant one already
exists:

```python
def main():
    conn = sqlite3.connect(DB_PATH)
    run_migrations(conn)

    existing = conn.execute(
        "SELECT COUNT(*) AS n FROM users WHERE role = 'super_admin'"
    ).fetchone()
    if existing["n"] > 0:
        print("A super-admin already exists. Refusing to create a second one this way.")
        sys.exit(1)

    username = input("Super-admin username: ")
    password = input("Super-admin password: ")
    display_name = input("Display name: ")

    create_user(conn, username, password, display_name, role="super_admin")
    print(f"Created super-admin '{username}'.")
```

```
$ python scripts/create_super_admin.py
A super-admin already exists. Refusing to create a second one this way.
```

A real, permanent, correct refusal — this script's own real capability
genuinely closes itself the instant it's been used once, exactly
matching this project's own real intent: exactly one, real, legitimate
way to bootstrap the very first super-admin, never a real, standing,
reusable back door.

### Discard

`mallory`'s own real, unauthorized account is disposable — remove it
directly (`DELETE FROM users WHERE username = 'mallory';`) once this
unit's own real point is proven; the real, corrected script is
permanent.

### Mechanical Walkthrough

- `existing = conn.execute("SELECT COUNT(*) AS n FROM users WHERE role
  = 'super_admin'").fetchone()` — **(b) hard concept reappearing**,
  `sqlite-mastery` Lesson 10's own real `COUNT(*)`, applied here as a
  real, deliberate safety check rather than a report.
- `if existing["n"] > 0: print(...); sys.exit(1)` — **(a) first
  appearance** of `sys.exit(1)`: a real, standard-library way to end a
  real script early with a real, non-zero exit code, signaling genuine
  failure to whatever real process or person invoked it.

### CS Lens

This real check is a direct, concrete instance of **fail-closed
design**: the real, safe default — refuse — is what happens the
instant a real precondition (no super-admin yet exists) isn't met,
rather than a real, permissive default that would have silently
allowed `mallory`'s own account through.

### SE Lens

The real, honest lesson this unit's own two real runs teach together:
a real, deliberately narrow, one-time capability is only genuinely
narrow if something actually enforces the "one-time" part — without
this unit's own real check, `create_super_admin.py`'s own entire
real security value (Concept Unit 1's own SE Lens) would have been
undermined by the single, real, easy-to-overlook detail of never
checking whether it had already done its job.

## Connect the pieces

`scripts/create_super_admin.py`, run once, outside this project's own
real HTTP surface entirely, solved the real bootstrap problem safely —
and a real, direct, deliberate demonstration proved that safety
depended entirely on one, real, explicit check: refusing to run a
second time once a real super-admin already exists, closing the exact,
real backdoor its own absence would otherwise leave standing open
indefinitely.

## What breaks without this

Not applicable beyond this lesson's own second unit, which is itself
this lesson's real, concrete proof — `mallory`'s own real, silently
created, unauthorized super-admin account *is* this lesson's own "what
breaks" demonstration.

## Exercises

1. Confirm, directly, that the real, corrected script refuses a second
   time even when invoked with entirely different, real credentials —
   the check depends only on whether a real super-admin already
   exists, never on who's asking.
2. Add a real, second, separate safety measure: require a real,
   specific environment variable (`FORGE_ALLOW_BOOTSTRAP=1`, say) to be
   set before this script does anything at all — a real, second,
   independent layer, so a real, accidental invocation on a genuinely
   live, already-running deployment fails even faster, before ever
   reaching the real database check.

## Definition of Done

- [ ] You created a real, first super-admin using
      `scripts/create_super_admin.py`, entirely outside this project's
      own HTTP surface.
- [ ] You reproduced the real, unauthorized second-super-admin
      backdoor, then fixed it with a real, explicit existence check.
- [ ] You confirmed the corrected script refuses a second real
      invocation, regardless of the real credentials supplied.
- [ ] You completed both exercises.

## Next

[Lesson 11 — Roles and Authorization](lesson-11-roles-and-authorization.md)
gives this project's own real, existing `super_admin`/`admin`/`user`
roles their real, enforced meaning — checked on every real, permission-
sensitive request, closing Phase 2.
