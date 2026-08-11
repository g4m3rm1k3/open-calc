# Lesson 37: Logged In Is Not the Same as Allowed
### (Phase 7 — Authorization and Structured Logging, Python)

**What you will build.** A real role-based authorization system,
starting from a genuine, working demonstration of the exact
vulnerability it fixes — an ordinary user successfully performing an
admin-only action because nothing ever checked whether they were
*allowed* to, only that they were logged in. Then a structured JSON
logger, proven to answer a real query — "how many login failures
happened" — reliably, where free-text log lines silently miss a
differently-worded but equivalent event. The transferable problem this
lesson is actually about: two questions that sound similar — "who is
this?" and "is this allowed?" — are answered by completely different
checks, and conflating them is one of the most common real
vulnerabilities in production software.

**What you need to know first.** Lesson 36 — `SessionTokens.verify`
proves *identity*. This lesson is entirely about the separate question
that follows it.

---

## Concept Unit: The Gap Between Authentication and Authorization

### The Problem

Lesson 36 built a system that proves *who* someone is. Nothing about
that system says anything about what that specific person is *allowed*
to do — and it's a real, common mistake to write code that checks "is
this a real, logged-in user" and treats that as if it also answered "is
this user allowed to do this specific thing."

### Project Change

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — created `authz_gap.py` (throwaway, this unit
  only).
- **Change type** — add.
- **Location** — new file, new project directory.
- **Dependencies** — none beyond `python3`.

### The New Code

```python
class User:
    def __init__(self, username, roles):
        self.username = username
        self.roles = roles


def delete_user_account(current_user, target_username):
    print(f"{current_user.username} deleted account '{target_username}'")
```

### The Updated Project

Brand-new throwaway file, shown whole above.

### Introduce the concept in isolation

```python
alice = User("alice", roles=["admin"])
bob = User("bob", roles=["member"])

delete_user_account(alice, "someone")
delete_user_account(bob, "someone")
```

Real output:

```
--- alice (admin) deletes an account ---
alice deleted account 'someone'
--- bob (ordinary member) deletes an account ---
bob deleted account 'someone'
```

`bob` — an ordinary member, with no admin role at all — successfully
deleted an account. Nothing crashed, nothing warned, nothing even
checked `bob.roles`. `delete_user_account` only required its caller to
*be* a real `User` object — the exact thing Lesson 36's
`SessionTokens.verify` would confirm — and mistakenly treated that as
sufficient permission to perform a genuinely dangerous, admin-only
action. This is a real, common vulnerability category, formally named
**broken access control**, and it consistently ranks among the most
frequently found real vulnerabilities in professional security audits
of production software — not a rare or contrived mistake.

### Discard the throwaway example

`authz_gap.py` is deleted — it only existed to prove this gap is real
and silent, isolated from a real fix.

### Mechanical walkthrough

- `def delete_user_account(current_user, target_username):` — **(c)
  already basic**, a plain function — the vulnerability isn't in any
  single line's syntax, it's in what's *missing*: no check anywhere
  against `current_user.roles` before performing the action.

### CS lens

This is the real, precise distinction between **authentication**
("who are you, proven") and **authorization** ("what are you allowed
to do, given who you are") — two genuinely separate questions, answered
by two genuinely separate mechanisms, that this unit's own bug conflated
into one. Also recognized in: nearly every real data breach involving
an ordinary user account somehow performing an administrator-only
action, a hotel key card that opens the front door (authenticates you
as a guest) but shouldn't open every room in the building
(authorization, checked separately, per room).

### SE lens

The alternative to a real, systematic authorization check — trusting
that "this function is only ever called from an admin panel" — is
exactly the kind of assumption that holds right up until it doesn't: a
new code path, a future refactor, an API endpoint added later without
the original author's full context, any of these can reach
`delete_user_account` from somewhere the original assumption never
anticipated. A real system needs the check to live *inside* the
sensitive operation itself, not in the discipline of every possible
caller remembering to check first.

### Commands needed

`python3 <file>.py`, the same pattern as every Python lesson in this
curriculum.

### Run it

Shown above.

### Connecting sentence

An authenticated user was able to perform an action they should never
have been allowed to — the next unit builds a real, systematic fix that
lives inside the action itself.

---

## Concept Unit: Role-Based Authorization

### The Problem

`delete_user_account` needs to check, itself, whether its caller is
actually permitted to delete accounts — and that check needs to apply
uniformly, to every caller, from anywhere in the system, without relying
on each call site remembering to check first.

### Project Change

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — created `authorization.py`.
- **Change type** — add.
- **Location** — new file.
- **Dependencies** — `enum`, `functools` — both standard library.

### The New Code

```python
from enum import Enum
from functools import wraps


class Permission(Enum):
    VIEW_ACCOUNT = "view_account"
    DELETE_ACCOUNT = "delete_account"
    EDIT_BILLING = "edit_billing"


ROLE_PERMISSIONS = {
    "member": {Permission.VIEW_ACCOUNT},
    "billing_manager": {Permission.VIEW_ACCOUNT, Permission.EDIT_BILLING},
    "admin": {Permission.VIEW_ACCOUNT, Permission.DELETE_ACCOUNT, Permission.EDIT_BILLING},
}


class NotAuthorizedError(Exception):
    pass


class User:
    def __init__(self, username, roles):
        self.username = username
        self.roles = roles

    def has_permission(self, permission: Permission) -> bool:
        return any(permission in ROLE_PERMISSIONS.get(role, set()) for role in self.roles)


def require_permission(permission: Permission):
    def decorator(func):
        @wraps(func)
        def wrapper(current_user, *args, **kwargs):
            if not current_user.has_permission(permission):
                raise NotAuthorizedError(
                    f"User '{current_user.username}' (roles: {current_user.roles}) "
                    f"lacks permission '{permission.value}'"
                )
            return func(current_user, *args, **kwargs)
        return wrapper
    return decorator


@require_permission(Permission.DELETE_ACCOUNT)
def delete_user_account(current_user, target_username):
    print(f"{current_user.username} deleted account '{target_username}'")
```

### The Updated Project

Brand-new file, shown whole above — the same `delete_user_account`
function from the previous unit, now protected by a `@require_permission`
decorator instead of being callable by anyone.

### Mechanical walkthrough

- `class Permission(Enum):` — **(b) hard concept reappearing**: Java's
  own `enum` concept (Project 7, Lesson 18), Python's version — a real,
  fixed, checkable set of named permissions, not arbitrary strings a
  caller could misspell.
- `ROLE_PERMISSIONS = { "member": {...}, ... }` — **(b) hard concept
  reappearing**: a dict mapping role names to the *set* of permissions
  that role grants — the actual policy, defined once, in one place,
  rather than scattered across every function that happens to check
  something.
- `def has_permission(self, permission: Permission) -> bool: return any(permission in ROLE_PERMISSIONS.get(role, set()) for role in self.roles)`
  — **(a) first appearance,** as applied: checks *every* role a user
  holds (a user can genuinely have more than one) and confirms the
  requested permission is granted by *at least one* of them — `.get(role,
  set())` safely handles a role name with no matching entry rather than
  raising a `KeyError`.
- `def require_permission(permission: Permission): def decorator(func): @wraps(func) def wrapper(current_user, *args, **kwargs): if not current_user.has_permission(permission): raise NotAuthorizedError(...) return func(current_user, *args, **kwargs) return wrapper return decorator`
  — **(a) first appearance** of a **parameterized decorator**: unlike a
  plain `@decorator`, `@require_permission(Permission.DELETE_ACCOUNT)`
  takes an argument — the specific permission required — meaning
  `require_permission` itself has to return the actual decorator
  function, one level of nesting deeper than a simple decorator would
  need.
- `@wraps(func)` — **(a) first appearance.** Without this, `wrapper`
  would silently replace `delete_user_account`'s own name and
  docstring with its own — `@wraps` preserves the original function's
  identity for anything that inspects it later (debuggers, documentation
  tools), a small but real correctness detail easy to skip and easy to
  regret.
- `@require_permission(Permission.DELETE_ACCOUNT)` directly above
  `def delete_user_account(...)` — **(a) first appearance,**
  conceptually: the permission check now lives structurally *at* the
  function definition itself — anyone reading `delete_user_account`'s
  own source sees, immediately, exactly what permission is required,
  rather than needing to trust that every caller remembered to check.

### CS lens

This is **Role-Based Access Control (RBAC)**: permissions are grouped
into named roles, and users are granted roles rather than individual
permissions directly — a real, standard pattern for managing
authorization at scale. Also recognized in: nearly every real
enterprise system's own permission model (file system permissions,
cloud platform IAM roles, database user grants), Python's own decorator
mechanism used for a security concern rather than the logging or timing
concerns decorators are often introduced with.

### SE lens

Proven directly — the identical two users, the identical action,
correctly separated now:

```python
alice = User("alice", roles=["admin"])
bob = User("bob", roles=["member"])

delete_user_account(alice, "someone")

try:
    delete_user_account(bob, "someone")
except NotAuthorizedError as e:
    print("Denied:", e)
```

Real output:

```
--- alice (admin) deletes an account ---
alice deleted account 'someone'
--- bob (ordinary member) attempts to delete an account ---
Denied: User 'bob' (roles: ['member']) lacks permission 'delete_account'
```

`bob` is now correctly blocked, with a precise, actionable error naming
exactly which permission was missing and what roles he actually holds
— the same standard of diagnostic precision this curriculum has held to
since Project 10's own dependency and version resolution. The real
cost: every sensitive function now needs its own `@require_permission`
decorator, a real, deliberate discipline — but one enforced at the
single place the action itself is defined, not scattered across every
possible caller.

### Commands needed

Same pattern.

### Run it

Shown above.

### Connecting sentence

Authorization is now a real, systematic check living inside the
sensitive action itself — the final unit turns to a different, equally
practical concern: making sure events like this — an authorized
deletion, a denied attempt — are recorded in a form a real system can
actually search and act on later.

---

## Concept Unit: Structured Logging

### The Problem

A `print()` statement is a fine way to see what's happening while
writing code — this entire curriculum has used it constantly. It's a
poor way to record what happened in a running production system,
because free-text log lines are fragile to search reliably, proven
directly below.

### Project Change

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — created `log_search_lab.py` (throwaway, this
  unit only).
- **Change type** — add.
- **Location** — new file.
- **Dependencies** — none new.

### The New Code

```python
unstructured_logs = [
    "User alice logged in successfully",
    "User bob failed to log in: wrong password",
    "User alice deleted account 'someone'",
    "User carol logged in successfully",
    "Payment of $49.99 failed for user dave",
]

count = 0
for line in unstructured_logs:
    if "failed to log in" in line:
        count += 1
```

### The Updated Project

Brand-new throwaway file, shown whole above.

### Introduce the concept in isolation

Real output:

```
Login failures found by string matching: 1
```

That's correct — one login failure exists, and the string search found
it. Now, a second, equally real login failure, worded slightly
differently by whoever happened to write that particular log line:

```python
unstructured_logs.append("Login attempt for eve failed")
```

Real output:

```
After adding a differently-worded failure, count is still: 1 (missed it!)
```

The second failure — genuinely the same *kind* of event — was silently
missed, because the search relied on one specific, exact phrase
(`"failed to log in"`) appearing in the text, and this new line
happened to be phrased differently. In a real system with dozens of
engineers writing log lines over years, this kind of silent drift in
wording is not a hypothetical risk — it's close to guaranteed.

### Discard the throwaway example

`log_search_lab.py` is deleted — it only existed to prove free-text
search is fragile against wording drift, isolated from a real fix.

### Project Change (the fix)

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — created `structured_logger.py`.
- **Change type** — add.
- **Location** — new file.
- **Dependencies** — `json`, `time` — both standard library.

### The New Code

```python
class StructuredLogger:
    def __init__(self, service_name):
        self.service_name = service_name
        self.entries = []

    def log(self, level, event, **context):
        entry = {
            "timestamp": time.time(),
            "service": self.service_name,
            "level": level,
            "event": event,
            **context,
        }
        line = json.dumps(entry)
        self.entries.append(line)
        print(line)
        return entry
```

### The Updated Project

Brand-new file, shown whole above — every log call produces one JSON
object with a fixed, consistent set of core fields
(`timestamp`/`service`/`level`/`event`), plus whatever extra context
(`user`, `reason`, `target`) is relevant to that specific event.

### Mechanical walkthrough

- `def log(self, level, event, **context):` — **(a) first appearance,**
  as applied here: `**context` collects any additional keyword
  arguments into a dict — `logger.log("warning", "login_failure",
  user="bob", reason="wrong_password")` puts `user` and `reason` both
  into `context`, letting each event carry whatever fields are actually
  relevant to it without `log`'s own signature needing to anticipate
  every possible one in advance.
- `entry = { "timestamp": time.time(), ..., **context, }` — **(a) first
  appearance,** as applied: `**context` here *unpacks* the dict back
  out, merging its keys directly into `entry` alongside the fixed core
  fields — the same `**` syntax, used for the opposite direction.
- `json.dumps(entry)` — **(b) hard concept reappearing**: `json.dumps`
  from Project 1, Lesson 2, here serializing a structured log entry
  instead of a note.

### CS lens

This is **structured logging**: every log entry is real, parseable
data — not a sentence meant only for a human to read — with a
consistent, known schema a program can query reliably. Also recognized
in: real production logging systems (structured JSON logs consumed by
tools like Elasticsearch, Splunk, Datadog — this is the standard,
expected shape of logs in any serious production system today), a
web server's own access log format (already semi-structured — fixed
fields in a fixed order, for exactly this reason), a database's own
query log.

### SE lens

Proven directly, the exact same question this unit's Problem section
couldn't answer reliably:

```python
logger.log("info", "login_success", user="alice")
logger.log("warning", "login_failure", user="bob", reason="wrong_password")
logger.log("info", "account_deleted", user="alice", target="someone")
logger.log("info", "login_success", user="carol")
logger.log("warning", "login_failure", user="eve", reason="account_locked")

failures = [json.loads(line) for line in logger.entries if json.loads(line)["event"] == "login_failure"]
```

Real output:

```
--- querying: every login_failure event, regardless of reason wording ---
  user=bob reason=wrong_password
  user=eve reason=account_locked
Total login failures found: 2
```

**Both** failures found correctly — `bob`'s and `eve`'s — even though
their `reason` fields are completely different text
(`"wrong_password"` versus `"account_locked"`), because the query
filters on the structured `event` field, `"login_failure"`, which every
failure event sets identically, by contract, regardless of how its
*other* fields happen to read. The wording-drift problem from this
unit's own Problem section is structurally impossible here — there's
no free text being pattern-matched at all, only exact, known field
values.

### Commands needed

Same pattern.

### Run it

Shown above.

### Connecting sentence

Every event this system produces — an authorized deletion, a denied
attempt, a login failure — can now be logged in a form that's reliably
searchable by what actually happened, not by hoping every log line
happens to use the same words.

---

## Closing

**Connect the pieces.** One denied action, through the whole lesson:
`bob`, authenticated by Lesson 36's own `SessionTokens.verify`, attempts
`delete_user_account` — `require_permission`'s wrapper checks
`bob.has_permission(Permission.DELETE_ACCOUNT)`, finds it `False` (his
only role, `"member"`, grants no such permission), and raises
`NotAuthorizedError` with a precise reason — exactly the check this
lesson's first unit proved was completely missing. In a real system,
that denial would itself become a structured log entry —
`logger.log("warning", "authorization_denied", user="bob", permission="delete_account")`
— reliably findable later by anyone searching for denied authorization
attempts, using this lesson's own `event`-field query, not a hopeful
guess at exact wording.

**What breaks without this.** Already shown, twice, precisely: `bob`
successfully deleting an account with zero permission checking, and a
real login failure silently missed by free-text search — deliberately
not restaged, since both were real, run, and observed exactly where
they mattered.

**Exercises.**
1. Add a `Permission.MANAGE_ROLES` permission and a `billing_manager`
   role missing it, and write a test confirming a `billing_manager`
   cannot grant themselves the `admin` role — a real, common privilege-
   escalation risk if permission changes aren't themselves protected by
   permission checks.
2. Extend `StructuredLogger` with a `query(**filters)` method
   supporting multiple simultaneous field filters (e.g.,
   `query(event="login_failure", user="bob")`), and confirm it
   correctly narrows results.
3. Log every call to `require_permission`'s wrapper — both successes
   and denials — as structured events, then write a query answering "how
   many authorization denials happened for each distinct permission,"
   entirely from the structured log data.

**Definition of done.**
- [ ] You've reproduced the real authorization gap — an unauthorized
      user successfully performing a restricted action — and confirmed
      `require_permission` closes it with a precise denial.
- [ ] `has_permission` correctly reflects `ROLE_PERMISSIONS` for users
      with one or more roles, confirmed against real output for both an
      allowed and a denied case.
- [ ] `StructuredLogger` correctly answers a real query by event type,
      confirmed to find events with differently-worded context fields
      that free-text search proved it would miss.
- [ ] Commit with a message explaining why — e.g. `"Add role-based
      authorization via a require_permission decorator, fixing a real
      broken-access-control gap, and replace free-text logging with
      structured JSON events reliably queryable by field"` — not `"add
      authorization and logging"`.

**Next lesson** stays in Phase 7: caching at a scale where more than
one server process needs to share the same cached data — revisiting
Project 5, Lesson 13's own LRU cache for a world where "the cache"
isn't one process's memory anymore — and a first look at what actually
changes, honestly, once a system stops being one process.
