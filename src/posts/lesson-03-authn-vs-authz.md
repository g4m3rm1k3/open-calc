# Lesson 3: Authentication vs. Authorization

Today we study two questions that sound similar and are not: **who are you**, and
**what are you allowed to do**. Our case study is a private diary app with two members —
and one four-line bug that lets either of them read the other's diary, caused entirely by
answering the second question with the answer to the first.

## What you will learn

You'll be able to look at any access-control check in any codebase and identify which of
the two questions it's actually answering — and, more importantly, spot the very common
bug where a system answers "who are you" and silently treats that as if it had answered
"what are you allowed to do." This single confusion is behind one of the most common
vulnerability classes in real software.

## What you need to know first

Lesson 1 (Trust Boundaries): a session token, which appears for the first time today, is
just another piece of data that crosses a trust boundary — it arrives from outside your
program on every request, and has to be checked, not assumed. Lesson 2 (CIA Triad): the
bug in this lesson is a confidentiality failure — the mechanism, not the property, is new
today.

---

## The problem

**Authentication** answers *"who are you?"* — proving that a user is who they claim to
be, usually by checking a password, a fingerprint, or a security key against something
only the real user could produce.

**Authorization** answers *"what are you allowed to do?"* — given that you are who you
say you are, does the system's policy permit *this specific action on this specific
resource*?

These are genuinely separate steps, and treating them as one is the single most common
way access-control systems break. A system can authenticate someone correctly — verify,
with total confidence, that this really is Ada — and still have a devastating bug if it
then assumes "Ada is logged in" is the same fact as "Ada is allowed to see this." It is
not. Every logged-in user is authenticated. Not every logged-in user is authorized for
every resource.

## The lab: a clubhouse where everyone shares a front door

**Disposable host.** `Clubhouse` — a members list, a login function, and a diary-reading
function. Two members, Ada and Grace, each with a private diary.

### Step 1 — authentication: proving identity

```python
members = {
    "ada": {"password": "hunter2", "diary": "Ada's private thoughts"},
    "grace": {"password": "compiler1", "diary": "Grace's private thoughts"},
}

logged_in_sessions = {}

def log_in(username, password):
    if username in members and members[username]["password"] == password:
        session_token = f"token-{username}-{len(logged_in_sessions)}"
        logged_in_sessions[session_token] = username
        return session_token
    return None

ada_token = log_in("ada", "hunter2")
print(ada_token)
```

**New construct: a dictionary of dictionaries, and `in` for membership.** `members` is a
`dict` where each value is itself a `dict` — `members["ada"]` gives you
`{"password": "hunter2", "diary": "Ada's private thoughts"}`, and
`members["ada"]["password"]` reaches one level deeper to get `"hunter2"`. The `in` keyword
here (`username in members`) checks whether `username` exists as a *key* in the
dictionary — it returns `True` or `False` without raising an error, which is why it's
checked before `members[username]` is accessed: looking up a key that doesn't exist would
otherwise crash the program.

Run it:

```
token-ada-0
```

**Walkthrough.** `log_in` checks two things: does `username` exist in `members`, and does
the stored password match the one supplied. If both are true, it manufactures a
**session token** — a random-looking string that stands in for "this specific person, for
this specific period of time" — stores the mapping from that token to the username in
`logged_in_sessions`, and returns the token. From this point on, whoever holds
`ada_token` can present it instead of typing a password again; the token *is* the proof of
"I already authenticated as Ada" for the rest of this session.

**CS lens.** `logged_in_sessions` is functioning as a **lookup table** mapping an opaque
identifier (the token) to a fact (the username it belongs to). This is the same data
structure idea as a symbol table or a hash map used anywhere else — a fast way to answer
"what does this key correspond to?" without re-deriving it. (A real system's session
tokens are cryptographically random and expire — Lesson 14 covers that properly. Here,
the predictable `token-ada-0` format is only to make the trace readable; never generate
real tokens this way.)

**SE lens.** `log_in`'s entire job is authentication, and nothing more. It doesn't decide
what Ada is allowed to do — it doesn't even know a diary exists. That's a deliberate,
narrow responsibility, and it's the correct one. Watch what happens when the *next*
function quietly takes on a responsibility it was never designed for.

### Step 2 — the bug: authorization borrowed from authentication

```python
def read_diary(session_token, requested_username):
    if session_token not in logged_in_sessions:
        return "Access denied: not logged in"
    return members[requested_username]["diary"]

print(read_diary(ada_token, "ada"))
print(read_diary(ada_token, "grace"))
```

Run it:

```
Ada's private thoughts
Grace's private thoughts
```

**Walkthrough.** The first call works as intended: Ada's token is valid, and she reads her
own diary. The second call is the bug: Ada's token is *still* valid — she's still
logged in — so `read_diary` lets the request through and hands back Grace's diary
entirely. `read_diary` asked exactly one question: "is this a real, currently-logged-in
session?" It never asked the second, separate question: "does the person behind this
token have any right to read *this particular* diary?"

**CS lens.** This is a **missing authorization check** disguised as a working
authentication check. The code isn't wrong about who `ada_token` belongs to — it correctly
knows it's Ada. The bug is that "we correctly identified you" and "you may proceed" got
merged into a single `if`, when they're two separate questions that happen to often both
be true for benign requests, which is exactly what makes this bug easy to miss in testing:
if you only ever test a user requesting *their own* data, this code looks completely
correct.

**SE lens.** `read_diary` silently absorbed a responsibility — deciding *who may access
which diary* — that was never assigned to it and that it has no data to answer correctly.
It has `requested_username`, but nothing that says "and the token holder must match, or
have some other permission, in order to proceed." This is the authorization equivalent of
`sanitize_name` being skipped in Lesson 1: a checkpoint that should exist, doesn't.

**Security lens.** This exact bug — an authenticated user accessing another user's data by
changing an identifier in the request — has a name you'll formally meet in Lesson 16:
**Broken Access Control**, and its most common specific form is called **IDOR** (Insecure
Direct Object Reference): the system trusted `requested_username` from the caller instead
of checking whether the caller was actually entitled to that object. It has consistently
ranked among the most common serious vulnerabilities found in real web applications, for
exactly the reason above — it's invisible in the "happy path" test case.

### Step 3 — the fix: authorization asks its own question

```python
def read_diary(session_token, requested_username):
    if session_token not in logged_in_sessions:
        return "Access denied: not logged in"

    requesting_username = logged_in_sessions[session_token]
    if requesting_username != requested_username:
        return "Access denied: you are not authorized to read this diary"

    return members[requested_username]["diary"]

print(read_diary(ada_token, "ada"))
print(read_diary(ada_token, "grace"))
```

Run it:

```
Ada's private thoughts
Access denied: you are not authorized to read this diary
```

**Walkthrough.** The function now does two distinct checks in sequence, and — this is the
point of the whole lesson — they are visibly two different questions, checking two
different things, against two different pieces of data. The first check
(`session_token not in logged_in_sessions`) is pure authentication: is this a real
session, full stop, regardless of whose. The second check
(`requesting_username != requested_username`) is pure authorization: given who this
session belongs to, are they allowed to touch the specific resource named in the request.
Ada's own diary passes both checks. Grace's diary passes the first (Ada is definitely
logged in) and fails the second (Ada is not Grace).

**CS lens.** This is the general shape of an **access control decision**: `(identity,
resource, action) → allow or deny`. Here the "action" is implicitly "read" and the
"resource" is a diary — but the shape doesn't change as systems grow more complex. A file
system's permission check, a database row-level security policy, and a cloud provider's
IAM check are all evaluating the exact same three-part question, just with far more
elaborate rules for what counts as "allow."

**Security lens.** The specific rule enforced here — "you may only read your own diary" —
is a simple form of authorization called **ownership-based access control**: the resource
itself records who owns it, and the check is "does the requester's identity match the
resource's recorded owner?" Real systems often need something richer — Ada might want to
grant Grace read access to one specific diary entry without giving up ownership, which
needs a permissions list rather than a single owner field — but every richer scheme is
still built on the same separation you just wrote: authenticate first, then authorize
separately, using the resource's own rules, not the fact that the request was well-formed
and came from *someone*.

---

## Connect the pieces

Lesson 1 taught you to ask where untrusted data enters. Lesson 2 taught you to ask which
property an attack breaks. Today's addition sits between them: when untrusted data enters
in the form of "please give me resource X," there are *two* separate checkpoints it must
pass — proving who's asking, and then, separately, deciding whether that specific who is
allowed to have that specific X. `requested_username` in Step 2 is a Lesson-1-shaped piece
of untrusted input (nothing stopped Ada from putting `"grace"` in that field), and letting
it through unchecked is a Lesson-2-shaped confidentiality failure. Lesson 16 (Broken Access
Control) will return to this exact bug with a real HTTP request and a URL like
`/diary/grace`, and the fix will be recognizably the same two-question shape you just
wrote by hand.

## What breaks without this

Take Step 2's version and imagine one more member joins the system, plus a moderator role
that's supposed to see all diaries for support purposes:

```python
members["admin"] = {"password": "letmein", "diary": "system notes"}
```

With Step 2's code, there is no way to grant the admin broader access *without also*
granting every other member that same broad access — because the only check that exists
is "are you logged in at all," which every member equally satisfies. The bug doesn't just
under-protect regular users; it makes it structurally impossible to correctly express "some
users have more access than others" at all, because that's an authorization concept and
the code never implemented an authorization layer to extend.

## Recognition

```
Today: Authentication vs. Authorization

Also recognized in: OAuth (an entire protocol for delegating authentication to a
third party like Google or GitHub, explicitly separate from what the app then
authorizes you to do), JWTs (a token proves identity — the "claims" — but the
server still must separately decide what those claims permit), Unix file
permissions (login proves who you are; the file's own permission bits decide what
you can do to it), RBAC and ABAC systems (formal frameworks for the authorization
half specifically), a hotel key card (authenticates you as a guest) versus which
floors that card actually opens (authorization), and API keys with scopes (the key
proves which application is calling; the scope decides what that application may
do).
```

## Definition of done

- [ ] You ran all three steps and reproduced the outputs shown, including the bug in
      Step 2 actually leaking Grace's diary
- [ ] You can state, in one sentence each, the difference between authentication and
      authorization, without using the word "login" in either definition
- [ ] You can point to the exact line in Step 2 that's missing, and the exact line in
      Step 3 that fixes it
- [ ] You can explain why the bug in Step 2 would likely pass a test suite that only
      tests users accessing their own data
- [ ] `git add .` and `git commit -m "Lesson 3: authentication vs authorization, and the
      missing-authorization-check bug"` in your `security-labs/` folder

**Next:** Lesson 4 — SQL Injection, the first lesson of Module B, where the trust-boundary
gap from Lesson 1 meets a real interpreter (a database engine) instead of `print`, and you
build and then fix the single most consequential vulnerability class in the history of web
applications.
