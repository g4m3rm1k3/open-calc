# Lesson 2: The CIA Triad and Threat Modeling

Today we study **what "secure" actually means** — because until you can name the specific
property an attack breaks, "make it secure" is not an engineering task, it's a wish. Our
case study is three five-line scripts, each broken in a different way, and one worked
threat model for a system you already understand: a login form.

## What you will learn

You'll be able to take any system and ask three separate, answerable questions instead of
one vague one — is data being read that shouldn't be, changed that shouldn't be, or
withheld from someone who should have it? — and you'll walk through a real threat-modeling
exercise that turns "this could be attacked" into a prioritized list of what to fix first.

## What you need to know first

Lesson 1 (Trust Boundaries): the idea that data crossing from outside your program into
it needs a checkpoint. Today builds directly on that — a trust boundary is *where* an
attack enters; the CIA triad is *what kind of damage* it does once it's in.

---

## The problem

"Is this secure?" is not a yes/no question, because "secure" isn't one property — it's
three, and a system can have any combination of them:

- **Confidentiality** — only the right people can *read* the data.
- **Integrity** — only the right people can *change* the data, and changes are detectable.
- **Availability** — the right people can *use* the system when they need to.

These three are called the **CIA triad**. Every attack you'll ever study breaks at least
one of them. Naming which one is the first step to fixing it, because the fixes are
different: confidentiality is defended with access control and encryption, integrity with
validation and checksums, availability with rate limiting and redundancy. "Just add
security" gives you nothing to build. "This breaks confidentiality" tells you exactly
which toolbox to open.

## The lab: breaking each property on purpose

**Disposable hosts.** Three unrelated tiny programs, one per property. None of them will
appear again after this lesson.

### Confidentiality — `Notebook`

```python
class Notebook:
    def __init__(self, secret_note):
        self.secret_note = secret_note

my_notebook = Notebook("meet Ada at 3pm, bring the contract")

def debug_log(any_object):
    print(vars(any_object))

debug_log(my_notebook)
```

**New construct: `vars()`.** `vars(some_object)` is a built-in function that returns a
dictionary of every attribute stored on `some_object` — in this case, everything set with
`self.attribute = value` inside `__init__`. It's commonly reached for during debugging
because it shows you "everything this object is holding" in one call.

Run it:

```
{'secret_note': 'meet Ada at 3pm, bring the contract'}
```

**Walkthrough.** `debug_log` was written to be generically useful — "print whatever this
object is holding," which is a genuinely handy debugging tool. It takes any object and
dumps every attribute. Called on `my_notebook`, it dumps `secret_note` along with
everything else, because `debug_log` has no concept of "this particular attribute is
sensitive." Nothing marked `secret_note` as different from any other field.

**CS lens.** `vars()` performs **reflection** — code that inspects a program's own
structure at runtime rather than needing to know its shape in advance. Reflection is
powerful precisely because it doesn't discriminate: it shows you *everything*, which is
exactly why it's dangerous next to sensitive data.

**Security lens.** This is a **confidentiality** failure: `secret_note` was readable by
something that had no business reading it — not an attacker exploiting a bug, but a
completely ordinary debug helper doing exactly what it was written to do. This is the most
common way real confidentiality breaches happen: not a hacker cracking a system, but a
logging statement, an error message, or a debug endpoint that shows more than it should.
The fix isn't "don't use `vars()`" — it's "mark which fields are sensitive so tools that
touch the whole object know to skip or mask them," which is what dedicated logging
libraries and serialization frameworks let you configure.

### Integrity — `Piggybank`

```python
piggybank = {"owner": "Ada", "balance": 40}

def deposit(account, amount):
    if amount <= 0:
        raise ValueError("deposit amount must be positive")
    account["balance"] += amount

deposit(piggybank, 10)
print(piggybank)

piggybank["balance"] = 999999
print(piggybank)
```

Run it:

```
{'owner': 'Ada', 'balance': 50}
{'owner': 'Ada', 'balance': 999999}
```

**Walkthrough.** `deposit` is a checkpoint, the same shape as `sanitize_name` from Lesson
1 — it's the *only* sanctioned way to change `balance`, and it enforces one rule: the
amount must be positive. Calling `deposit(piggybank, 10)` goes through that checkpoint and
works correctly. The line right after it, `piggybank["balance"] = 999999`, doesn't call
`deposit` at all — it reaches directly into the dictionary and overwrites the value,
completely bypassing the one rule that existed.

**CS lens.** `piggybank` is a plain `dict` with **no encapsulation** — nothing stops any
code anywhere in the program from reaching in and changing any key directly. Encapsulation
is the practice of hiding internal state behind functions (like `deposit`) that are the
*only* sanctioned way to touch it, so every change is forced through whatever rules those
functions enforce.

**SE lens.** The bug isn't in `deposit` — `deposit` is correct. The bug is that `deposit`
was optional. A design that wants to actually guarantee integrity has to make the
checkpoint *mandatory*, not just *available* — for example, by making `balance` a private
attribute that can only be reached through methods on a class, so `account["balance"] = x`
isn't valid syntax in the first place, rather than merely a bad practice someone could
avoid.

**Security lens.** This is an **integrity** failure: the data changed in a way the
system's own rules explicitly forbid (`amount <= 0` raises an error — but there was
another path that enforced *no* rule at all), and nothing detected or logged that it
happened. Note the distinction from confidentiality: nobody *read* anything they
shouldn't have here. The number was always visible. What broke is trust in the number
being correct.

### Availability — `Doorbell`

```python
import time

failed_attempts = 0

def check_password(guess, real_password="hunter2"):
    global failed_attempts
    if guess == real_password:
        return True
    failed_attempts += 1
    return False

start_time = time.time()
guess_number = 0
while check_password(f"guess{guess_number}") is False and guess_number < 5:
    guess_number += 1

elapsed_seconds = time.time() - start_time
print(f"Tried {failed_attempts} guesses in {elapsed_seconds:.4f} seconds")
```

**New construct: `time.time()` and an f-string.** `time.time()` returns the current time
as a number of seconds since a fixed reference point (January 1, 1970) — subtracting two
calls to it gives you elapsed time. `f"guess{guess_number}"` is an **f-string**
(formatted string literal): the `f` before the quotes means anything inside `{}` is
evaluated as an expression and inserted into the string, so if `guess_number` is `3`, the
result is the string `"guess3"`.

**Execution trace**, since this is a loop:

```
guess_number 0: check_password("guess0") → False, failed_attempts 0→1, loop continues
guess_number 1: check_password("guess1") → False, failed_attempts 1→2, loop continues
guess_number 2: check_password("guess2") → False, failed_attempts 2→3, loop continues
guess_number 3: check_password("guess3") → False, failed_attempts 3→4, loop continues
guess_number 4: check_password("guess4") → False, failed_attempts 4→5, guess_number becomes 5
loop condition `guess_number < 5` is now False → loop exits
```

Run it:

```
Tried 5 guesses in 0.0001 seconds
```

**Walkthrough.** `check_password` has no limit on how many times it can be called, no
delay between attempts, and no lockout after repeated failures. The loop above stopped at
5 guesses only because *I* told it to — nothing in `check_password` itself would have
stopped it at 5, 5,000, or 5 million. At real computer speed, an unthrottled password
checker like this can be tried against thousands of guesses per second.

**CS lens.** This is a **brute-force search** over the space of possible passwords — trying
candidates one at a time until one matches, with no pruning or shortcut. Its cost is
bounded only by how large the search space is and how fast each attempt can be tried.

**Security lens.** This example straddles two properties at once, which is worth noticing:
run at scale, it's primarily a **confidentiality** attack (the goal is to obtain
`real_password`) — but the *mechanism* that makes it feasible is an **availability** gap:
the system placed no limit on how much of its own capacity an unauthenticated caller could
consume. The standard defenses are rate limiting (allow only N attempts per minute),
exponential backoff (each failure increases the required wait before the next attempt),
and account lockout — all of which are, structurally, availability controls: they
deliberately make the system *less* available to a caller who's behaving like an attacker,
in order to protect it. This is why the CIA triad's three properties aren't independent —
real systems constantly trade one against another.

---

## Threat modeling: turning "this could be attacked" into a priority list

The three labs above show you *how* each property breaks. **Threat modeling** is the
practice of asking, *before* you build something, which of your specific assets are at
risk from which specific threats — so you spend your limited time defending the things
that matter most, instead of guessing.

A minimal threat model has four columns: **asset** (what's worth protecting), **threat**
(what could go wrong), **CIA property** (which one it breaks — often more than one),
and **mitigation** (what you'd actually build to prevent or limit it). Here's one for a
login form on a personal blog:

| Asset | Threat | CIA property | Mitigation |
|---|---|---|---|
| User passwords | Stored in plain text; database leak exposes them directly | Confidentiality | Hash passwords (Lesson 10) so a leaked database doesn't reveal usable passwords |
| Login endpoint | Attacker tries millions of password guesses | Confidentiality (via Availability) | Rate limiting and account lockout after N failed attempts |
| Blog post content | Attacker submits a comment that edits another user's published post | Integrity | Access control checks: verify the requester owns the resource before allowing changes (Lesson 16) |
| The whole site | Attacker floods the server with requests until it can't respond to real users | Availability | Request rate limits, a reverse proxy, infrastructure-level DDoS protection |
| Session tokens | Attacker steals a logged-in user's session cookie and impersonates them | Confidentiality → Integrity | `HttpOnly` and `Secure` cookie flags, short session lifetimes (Lesson 14) |

**Walkthrough of the process, not just the table.** You don't start by imagining attacks —
you start by listing **assets**: the things in your system worth protecting (data,
credentials, availability of the service itself, other users' trust in it). For each
asset, ask "what's the worst realistic thing someone could do to it?" — that's the threat.
Classify which CIA property it breaks — this is what tells you which category of fix
applies. Only then do you pick a mitigation, and notice: the mitigation column is exactly
the topic list of the rest of this course. Threat modeling isn't a separate skill from
everything else you're learning — it's the process that tells you *which* lesson is
relevant to *your* system.

**SE lens.** This table is a form of **risk-based prioritization**: not every threat gets
equal engineering time. A system with limited resources should fix "passwords stored in
plain text" before "an extremely sophisticated timing attack that requires physical lab
access," because the first is cheap to exploit and catastrophic, and the second is
expensive to exploit and narrow. Threat modeling makes that comparison explicit instead of
leaving it to instinct.

---

## Connect the pieces

Lesson 1 gave you the *entry point* question: where does untrusted data cross into my
program? Today gave you the *damage* question: if an attacker gets past that boundary,
which property — confidentiality, integrity, or availability — actually breaks? Every
lesson from here forward will name both: where the boundary is crossed, and which CIA
property the resulting attack violates. SQL injection (Lesson 4), for instance, is a
Lesson-1-shaped trust boundary failure that most often breaks confidentiality (reading
data you shouldn't) but can just as easily break integrity (modifying data) depending on
what the attacker does with it.

## What breaks without this

Without naming the property, "fix the security bug" has no acceptance criteria. Imagine a
bug report that just says "the login page is insecure." An engineer could add rate
limiting, add HTTPS, hash the passwords, or add two-factor authentication — all reasonable,
all addressing *different* properties, and there's no way from that report to know which
one actually matters, or whether the real problem (say, integrity — a way to edit other
users' posts) got fixed at all. "This breaks integrity: an authenticated user can edit
another user's post by changing a post ID in the request" is a bug report an engineer can
actually act on and verify as fixed.

## Recognition

```
Today: The CIA Triad (confidentiality, integrity, availability) and Threat Modeling

Also recognized in: file permission systems (read/write/execute maps directly onto
confidentiality/integrity/availability), the OWASP Top 10's entire structure, every
compliance framework (SOC 2, ISO 27001, HIPAA) organizes its controls around these
same three properties, database transaction isolation levels (integrity under
concurrent access), CDNs and load balancers (availability as an engineering
discipline in its own right), and every incident postmortem you'll ever read,
which almost always opens by stating which property was compromised.
```

## Definition of done

- [ ] You ran all three labs (`Notebook`, `Piggybank`, `Doorbell`) and reproduced the
      outputs shown
- [ ] You can state, in one sentence each, what confidentiality, integrity, and
      availability mean — without using the word "secure" in the definition
- [ ] You can explain why the `Doorbell` example touches two CIA properties at once, and
      name both
- [ ] Pick one system you actually use or are building (a personal project, an app on
      your phone, anything) and write a four-row threat model for it, following the
      asset / threat / CIA property / mitigation format above
- [ ] `git add .` and `git commit -m "Lesson 2: CIA triad and a worked threat model"` in
      your `security-labs/` folder

**Next:** Lesson 3 — Authentication vs. Authorization, where we separate two questions
that get conflated constantly: *who are you*, and *what are you allowed to do* — and look
at exactly why mixing them up is how "logged-in users can view other users' private data"
bugs happen.
