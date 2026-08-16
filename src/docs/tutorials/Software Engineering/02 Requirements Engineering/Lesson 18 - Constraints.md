# Lesson 18: Constraints

**What you will build.** An account-creation function, built the
simplest possible way — storing exactly what the user typed — and shown
to be functionally correct, easy to verify, and completely unacceptable,
for a reason that has nothing to do with correctness or speed at all.
Then a second version that respects the real rule this domain was
missing, without giving up the ability to actually do its job. The
transferable problem: some requirements aren't about what a system does
or how well it does it — they're boundaries on the solution space itself,
handed down from outside the problem, non-negotiable regardless of how
well an alternative might otherwise perform.

**What you need to know first.** Lesson 16's functional requirements and
Lesson 17's non-functional requirements — this lesson introduces a third,
genuinely different category, and the account-creation example is built
specifically to show it can't be described correctly as either of the
other two.

**Terms introduced in this lesson**

- **constraint** — a restriction on the space of acceptable solutions,
  imposed from outside the immediate problem — legally, contractually,
  organizationally, or by an existing system a new one has to coexist
  with — that a solution must respect regardless of whether respecting it
  is the most convenient engineering choice on its own merits. A
  constraint differs from a functional requirement (it doesn't describe a
  behavior to produce) and from a non-functional requirement (it isn't a
  quality measured on a spectrum, like speed or capacity) — it's
  typically binary: a solution either respects it or it doesn't, with no
  partial credit and, usually, no room to negotiate.

**Objects and methods used.**

- **`hashlib.sha256(...).hexdigest()`** —
  *What it is:* a standard-library function producing a fixed-length,
  one-way digest of a piece of data.
  *Implementation:* `hashlib.sha256(data)` takes `bytes` (not `str`
  directly — hence `.encode()` first) and returns a hash object;
  `.hexdigest()` renders that hash as a readable hexadecimal string. The
  same input always produces the same output, and there's no built-in way
  to recover the original input from the output.
  *Its use:* this lesson's compliant account-creation function stores
  this digest instead of the password itself, checking a later login
  attempt by hashing it the same way and comparing digests, never by
  recovering or comparing raw passwords.

No pipeline diagram change — this lesson continues working in the
*Requirements* stage Lesson 12 named.

---

## Concept Unit: A Rule That Isn't About Behavior or Speed

### The Problem

Build the simplest possible version of account creation: given a username
and a password, store them.

### The Code, Run for Real

```python
def create_account(username, password):
    return {"username": username, "password": password}
```

Run it:

```python
account = create_account("alice", "hunter22")
print(account)
```

Running it:

```text
$ python accounts.py
{'username': 'alice', 'password': 'hunter22'}
```

By every standard this domain has built so far, this is fine. As a
functional requirement — given a username and password, produce a stored
record containing both — it's satisfied exactly. As a non-functional
requirement, it's about as fast as storing two values could possibly be;
there's no performance complaint to make. And yet no real system should
ship this, for a reason that has nothing to do with either of those two
categories at all: a real, external rule — call it a security policy, a
compliance requirement, an organizational mandate — says a system must
never store a user's password in a form anyone could simply read back.
That rule isn't a behavior this function fails to produce, and it isn't a
quality this function fails to deliver quickly enough. It's a **constraint**:
a boundary on the solution space itself, and `create_account`, exactly as
written, sits outside it.

### CS Lens

This is the identical shape as Lesson 5's `float`-versus-integer-cents
representation choice, one level up: a choice that looks completely
reasonable examined only against the immediate task (store what the user
typed) turns out to violate a real, binding fact about the world the
system actually has to operate inside — there, the real behavior of
binary floating point; here, a real external policy about what's
acceptable to store at all.

### SE Lens

The realistic alternative to naming this as its own category — treating
it as "just another non-functional requirement" — loses something real:
a non-functional requirement like Lesson 17's 1-millisecond budget is
often negotiable, adjustable, a target reached through engineering
tradeoffs. "Never store a raw password" is not adjustable the same way;
no amount of clever engineering makes storing it in plain text
acceptable, and no measurement of "how compliant" the naive version is
would make sense the way "how fast" did. Constraints get their own
category because they behave differently from the other two, not because
this curriculum needed a third box to fill.

---

## Concept Unit: Respecting the Boundary Without Giving Up the Job

### The Problem

The constraint says the raw password can't be stored. The system still
has to be able to confirm, later, that someone logging in typed the
correct one. Can both be true at once?

### The New Code

```python
import hashlib

def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

def create_account(username, password):
    return {"username": username, "password_hash": hash_password(password)}

def check_password(account, attempted_password):
    return account["password_hash"] == hash_password(attempted_password)
```

Run it against both a correct and an incorrect login attempt:

```python
account = create_account("alice", "hunter22")
print(account)
print(check_password(account, "hunter22"))
print(check_password(account, "wrongpassword"))
```

Running it:

```text
$ python accounts.py
{'username': 'alice', 'password_hash': '20d2fe5e369db54ec7090639a9dc30ec4d608604936239d39e2de07fda09eb0b'}
True
False
```

The stored record no longer contains anything resembling `"hunter22"` —
only a fixed-length digest, `hexdigest()`'s own hexadecimal output, given
full treatment in this lesson's header. The correct password still
authenticates (`True`); the wrong one is correctly rejected (`False`).
Nothing about the actual job — confirm a login attempt matches what the
account was created with — was given up. What changed is *how* that job
gets done.

### Mechanical Walkthrough

- `password.encode()` — already-assumed string method, converting `str`
  to `bytes`, required because `hashlib.sha256` operates on bytes, not
  text directly.
- `hashlib.sha256(...).hexdigest()` — given full treatment above; the
  same password always produces the same digest, which is exactly what
  makes comparing digests a valid way to check a password without ever
  storing or comparing the password itself.
- `account["password_hash"] == hash_password(attempted_password)` —
  already-assumed dict access and equality; the entire verification
  mechanism is this one comparison, between two digests, never between
  two raw passwords.

### The Concept

Notice precisely what moved and what didn't: the functional requirement
underneath this feature — confirm a login attempt matches the account it
claims to belong to — is satisfied by both versions, verified by real,
correct `True`/`False` results either way. The constraint didn't remove
that requirement or make it impossible to satisfy. It removed exactly one
specific *means* of satisfying it — storing the password directly — and
forced a different means, hashing, that still gets the real job done.
That's what respecting a constraint actually looks like: not giving up on
the requirement underneath it, but ruling out the most obvious way of
meeting it and finding another one that still works.

### CS Lens

This is a real, concrete instance of a one-way function — computable in
one direction (password → digest) with no efficient way back (digest →
password) — a property this exact lesson's constraint depends on entirely:
if `hash_password` could be reversed, storing its output would carry
almost the same risk as storing the password directly. Worth stating
honestly rather than glossed over: `sha256` alone, exactly as used here,
is a simplified illustration of the idea, not a production-grade recipe
for storing real passwords — real systems add a random per-account
"salt" and use hash functions deliberately built to be slow, specifically
to resist large-scale guessing attacks, a body of technique that belongs
to security and cryptography as their own discipline, not to this
curriculum.

### SE Lens

The realistic alternative — ignoring the constraint because the naive
version "works" and is simpler — isn't a hypothetical carelessness; it's
a real, historically common mistake, and systems that made it have paid
for it in real, publicized data breaches. The cost of respecting the
constraint here was genuinely small: one new function, one changed field
name, one changed comparison. That's not always true of every constraint
this curriculum will introduce — some cost far more to satisfy — but it's
worth noticing that a real, binding constraint doesn't necessarily mean a
large redesign; sometimes it means finding the one different function
call that changes everything.

---

## Connect the Pieces

One feature, one boundary from outside the problem, respected without
losing the job it had to do:

1. **A rule that isn't functional or non-functional** — never store a
   raw password; not a behavior to produce, not a quality to optimize,
   a boundary to respect.
2. **The naive version, functionally correct and unacceptable** —
   `create_account` stores exactly what was typed, verified to work,
   verified to violate the constraint just as clearly.
3. **The compliant version, equally functional** — `hash_password` and
   `check_password` satisfy the identical underlying requirement —
   confirm a correct login — without ever storing or comparing a raw
   password, proven with a correct `True` and a correct `False`.

## What Breaks Without This

Ship the naive `create_account`, reasoning that it passes every
functional check anyone thought to write and responds instantly. Every
test passes. Nothing about running the system reveals the problem — right
up until the moment the underlying data is exposed, by a bug elsewhere, a
misconfigured backup, or a real breach, and every stored password is
sitting there in plain text, immediately usable by whoever now has it —
not because any functional or non-functional requirement was violated,
but because a real, external constraint was never checked at all.

## Exercises

1. Add a length constraint of your own — accounts must be created with
   `hash_password` only, never by constructing the stored dict directly
   with a raw `"password"` key. Write a short comment or docstring on
   `create_account` stating this constraint explicitly, the way a real
   codebase would flag a rule that isn't obvious from the code's
   behavior alone.
2. Name one real constraint, distinct from password storage, that you
   believe a real banking app or healthcare app operates under — something
   that isn't a behavior or a performance target, but a boundary imposed
   from outside the immediate problem (legal, regulatory, or otherwise).
3. Revisit Lesson 14's `export_contacts_csv`. Is the `restricted` check
   built there a constraint, in this lesson's precise sense, or something
   else? Justify your answer using this lesson's own definition.

## Definition of Done

- [ ] You can define "constraint" in your own words, and explain how it
      differs from both a functional and a non-functional requirement.
- [ ] You've run both versions of `create_account` yourself and confirmed
      the compliant version still correctly authenticates a real login.
- [ ] You've completed all three exercises.
- [ ] Commit the compliant `create_account`, `hash_password`, and
      `check_password`. Commit message should explain *why*: for example,
      `Lesson 18 — passwords hashed instead of stored raw, respecting a
      real constraint the original functional requirement never
      mentioned.`
