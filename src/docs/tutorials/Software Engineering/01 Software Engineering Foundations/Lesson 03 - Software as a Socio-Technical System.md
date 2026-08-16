# Lesson 3: Software as a Socio-Technical System

**What you will build.** Not code, this time — a single realistic incident,
traced end to end, to find exactly where a "technical" fix stops being
purely technical. You'll take the case-sensitivity fix Lesson 2 left as an
exercise and place it inside an organization: the function that needs
fixing is owned by a different team than the one who found the bug. Then
you'll look at where a real module boundary sits and ask why it sits
*there* rather than somewhere else equally reasonable on technical grounds
alone. The transferable problem: a piece of software's correctness and
structure are not decided by its code in isolation — they're shaped by,
and shape, the people and organization around it, and treating the two as
separate is where a lot of real failures actually come from.

**What you need to know first.** Lesson 2 — specifically its closing list
of open questions, one of which was "who else calls this function, and how
is that decided?" This lesson takes that one question and gives it its own
name and its own weight, rather than leaving it as a single bullet.

**Terms introduced in this lesson**

- **socio-technical system** — a system whose correct operation depends on
  both its technical parts (code, infrastructure) and its social parts
  (the people who build, own, operate, and use it) working together — not
  as two separate systems sitting next to each other, but as one system,
  where a failure in either half is a failure of the whole thing. The term
  exists because "is the code correct" and "is the system working" are
  different questions the moment real people are involved, and a
  curriculum that only ever discusses the first one will systematically
  miss failures that come from the second.
- **Conway's Law** — a real, widely-observed pattern: the modules,
  services, and interfaces a software system ends up with tend to mirror
  the communication structure of the organization that built it, not some
  purely technical optimum. Named (after Melvin Conway) because it's
  specific and recurring enough to be worth recognizing on sight, not
  just a vague sense that "org charts affect code somehow."

**Objects and methods used.** None new — this lesson's one short code
sketch uses only already-assumed function-definition and type-annotation
syntax, shown to illustrate a boundary's *shape*, not to be run.

No pipeline diagram yet — this curriculum has not established one.

---

## Concept Unit: A Correct Fix, Delivered to the Wrong Place

### The Problem

Lesson 2 left `is_username_available`'s case-sensitivity gap as an
exercise: compare a normalized form of both usernames instead of the raw
strings. Say that fix gets written — correctly, exactly as intended — and
now imagine one more fact that wasn't part of Lesson 2 at all: this
function doesn't live in some standalone script anymore. It lives inside
`accounts.py`, a file three other services import from, maintained by a
team called Accounts. The engineer who found the bug and wrote the fix is
on a different team, Growth, and has direct write access to the whole
repository — nothing technical is stopping them from opening `accounts.py`
and committing the one-line change themselves, right now.

### The Concept

Purely as code, there is nothing wrong with that one-line diff — it is the
exact same fix Lesson 2's exercise asked for, and it is correct by every
standard Lesson 2 used. And yet committing it directly, without looping in
Accounts, is a real engineering mistake, for reasons that have nothing to
do with whether the diff is right:

- Accounts may know about callers of `is_username_available` that Growth
  has never heard of — internal tools, batch jobs, other services — any of
  which might be quietly relying on the exact case-sensitive behavior
  being "fixed." Growth has no way to know this list exists.
- Even if the fix is harmless, Accounts is the team who gets paged if
  something in `accounts.py` breaks at 2 a.m. — and now a change they
  didn't review, in a file they own, from a team that doesn't carry that
  pager, is live in it.
- The next time Accounts reads their own file's history, there's a commit
  from an unfamiliar author changing behavior they didn't decide on —
  which is exactly the kind of thing that erodes whether two teams trust
  each other's parts of the codebase at all.

None of that shows up by reading the diff. All of it is real. The
function's *correctness* is a purely technical fact; whether *committing it
this way* was the right move is not — it depends entirely on who owns
`accounts.py`, who's on call for it, and what channel exists (a pull
request, a message to Accounts, a shared review) for a change to cross
that ownership line safely. That ownership line isn't written down
anywhere in the code. It's a fact about the organization, sitting on top
of the file, and it changed what "the right thing to do" meant without
changing a single character of the fix itself.

### CS Lens

This is the same shape as a race condition, one level up: two independent
actors (Growth, making the fix; Accounts, running whatever depends on that
file) can each be behaving correctly in isolation and still produce a bad
outcome, because the thing that was actually missing was coordination
between them — not a defect in either one alone.

### SE Lens

The real alternative here isn't "never touch code you don't own" — that
would make cross-team fixes impossible and just shift the cost onto
whichever team happens to be blocked waiting. The alternative this lesson
is pointing at is a deliberate, visible channel for crossing an ownership
line — a pull request Accounts reviews before it merges, at minimum —
which costs real time up front (waiting for review, explaining the
change) in exchange for the thing a silent direct commit can't give
Accounts: a chance to say "wait, three internal tools depend on that"
*before* it ships, not after something breaks.

---

## Concept Unit: Conway's Law

### The Problem

Zoom out from one fix to the shape of the codebase itself. `accounts.py`
and whatever file Growth's own service lives in are separate files, with a
real interface between them — not one large, shared file. Was that split
chosen for a technical reason?

### The Concept

Picture the actual interface between the two:

```python
# accounts.py — owned by the Accounts team
def get_account_status(username: str) -> AccountStatus:
    ...
```

And the one file on the other side of it that actually calls in:

```python
# growth_signup.py — owned by the Growth team
from accounts import get_account_status

def handle_signup_attempt(username: str) -> SignupResult:
    status = get_account_status(username)
    ...
```

Nothing about usernames or account status technically *requires* two
separate files with a narrow function call between them — a single merged
module, with direct access to whatever internal state `accounts.py`
keeps, would work too, and might even be simpler in places. The boundary
exists exactly where it does — narrow, formal, crossed only through
`get_account_status` — because that's where the *team* boundary already
was. Accounts owns the account data and the rules around it; Growth owns
signup flow and calls into Accounts the same deliberate way any external
caller would, rather than reaching into Accounts' internals directly.

This is **Conway's Law**: software structure tends to mirror the
communication structure of the organization that built it. It isn't a
suggestion or a best practice — it's an observed regularity, and it shows
up whether or not anyone designing the system intended it. Two teams that
barely talk to each other tend to produce two barely-coupled modules with
a thin, formal interface between them, exactly like the one above,
independent of whether that split was the best possible technical
decomposition of the problem. A single team owning both would just as
plausibly have merged the two files, for no worse technical reason.

### CS Lens

This same pattern is recognized well beyond one codebase: a large compiler
historically split into a frontend and backend maintained by different
groups tends to keep that exact split in its architecture for decades
after the original organizational reason is gone; a company's
customer-facing app and its internal billing system, owned by separate
departments, typically talk over a formal API rather than sharing a
database, even when a shared database would be technically simpler;
open-source projects with loosely coordinated, geographically scattered
contributors reliably produce more modular, more independently-releasable
components than the same functionality built by one tightly co-located
team. Different domains, same underlying regularity: communication
structure leaves a visible fingerprint on technical structure.

### SE Lens

The alternative to acknowledging Conway's Law isn't "ignore the org chart
and design the ideal technical architecture" — that architecture, even if
correctly designed on paper, tends to drift back toward matching however
the teams actually communicate, because every real change to the system
still has to go through whichever team owns whichever part, regardless of
what a diagram says the "right" boundary is. The real, harder alternative
— sometimes called the Inverse Conway Maneuver, and out of scope for this
lesson's depth — is deliberately reshaping team boundaries *first*, so
that the communication structure you actually want mirrored into the
software already exists. That's an organizational decision, not a coding
one, which is itself the whole point: at this scale, the two are the same
decision viewed from different sides.

---

## Concept Unit: The System Includes Whoever Has to Operate It

### The Problem

Ownership at write-time — who reviews a change — is only one social fact
layered on `accounts.py`. There's a second one, further downstream:
someone has to keep it running after it ships.

### The Concept

Suppose the case-sensitivity fix ships cleanly, reviewed by Accounts,
correct by every measure this lesson and Lesson 2 have used. Now suppose
it has a genuine, rare edge case — say, a username made entirely of
characters that behave unexpectedly under normalization — and it starts
throwing errors in production at 3 a.m., rarely enough that it hasn't shown
up in any test yet. Whoever is on call gets paged. If that person has
never heard of this function, doesn't know Accounts owns it, and has no
record of what changed recently, being technically correct at 2 p.m. the
day it shipped did nothing to help them at 3 a.m. The system, at that
moment, isn't just `accounts.py` — it's `accounts.py` *plus* whether the
on-call engineer has enough context to act, which depends entirely on
things no compiler checks: was the change documented, did anyone
communicate it, does the on-call rotation even include someone from
Accounts. A technically flawless fix, shipped into an organization with no
answer to those questions, is still an incomplete piece of engineering —
not because the code is wrong, but because the *system*, socio-technical
system, was never actually made ready to carry it.

### CS Lens

This is the same widening Lesson 2's closing unit made — from "is this
function correct" to "what does this function's existence, inside a real
running system, actually require" — applied specifically to the humans
who keep that system alive after it ships, rather than the ones who wrote
it.

### SE Lens

It would be possible to demand every engineer personally know every part
of a large system before being allowed to touch any of it — that doesn't
scale past a small team, and it's not actually how the largest, most
reliable systems in the world are kept running. The realistic alternative,
which later parts of this curriculum build out in full, is making the
*system itself* — not any one person's memory — carry that context:
recorded ownership, discoverable history, and the operational practices
that let an on-call engineer who's never seen this exact function still
act correctly at 3 a.m. That machinery doesn't exist yet in anything this
curriculum has built so far — noticing that it's missing is this lesson's
job; building it is later work.

---

## Connect the Pieces

One fix, `is_username_available`'s case-sensitivity correction from Lesson
2, carried through three lenses in this lesson:

1. **Ownership at write time** — the same correct diff is a good or bad
   engineering move depending entirely on who owns `accounts.py` and
   whether that ownership line gets crossed visibly or silently.
2. **Structure at rest** — the narrow interface between `accounts.py` and
   `growth_signup.py` exists where it does because that's where the team
   boundary already was, per Conway's Law, not because it's the only
   defensible technical seam.
3. **Readiness at operation time** — the same fix, shipped flawlessly, is
   still an incomplete piece of engineering if nobody who has to keep it
   running at 3 a.m. has the context to do so.

All three are the same underlying fact stated three different ways: the
system is the code *and* the people, together, and a failure in the
social half is exactly as real a system failure as a bug in the code.

## What Breaks Without This

Treat `accounts.py` as pure code with no owner, and commit the
case-sensitivity fix directly, unreviewed, the moment it's written — no
traceback, no test failure, nothing a computer would ever flag. Weeks
later, one of the internal tools Accounts knew about and Growth didn't
starts silently rejecting valid usernames it used to accept, because it
was quietly relying on the exact case-sensitive behavior that just
changed. Nobody on Growth knows that tool exists. Nobody on Accounts knew
the change had shipped. The failure isn't in `is_username_available` — it
is correct, exactly as designed. The failure is in the space between two
teams that this lesson's first unit described, and no amount of rereading
the diff would ever have shown it, because the diff was never where the
problem was.

## Exercises

1. Think of one real piece of software you use regularly (an app, a
   website, a tool) that is visibly built by more than one team — the
   seams are often visible as different visual styles, different login
   systems bolted together, or a feature that clearly "doesn't talk" to
   another part of the same product. Write two or three sentences on what
   organizational boundary you think produced that seam.
2. For the `accounts.py` / `growth_signup.py` example, write down one
   additional piece of information — beyond a pull request review — that
   would help a future on-call engineer act correctly on this code at 3
   a.m. (Two real, different answers: an ownership record naming
   Accounts, and a change log entry describing what shipped and when.)

## Definition of Done

- [ ] You can explain, without notes, why the same one-line diff can be a
      good engineering decision or a bad one depending only on how it's
      delivered, not on whether it's correct.
- [ ] You can state Conway's Law in one sentence, from memory, and name
      one real system (yours, or one you use) where you can see its
      effect.
- [ ] You've completed both exercises above.
- [ ] No commit for this lesson — it added no code of its own. If you're
      tracking this curriculum's progress in a repository, note in a
      journal file or README that Lesson 3 is complete, with a sentence on
      which exercise answer felt most true to something you've actually
      seen.
