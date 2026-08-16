# Lesson 2: Programming vs Software Engineering

**What you will build.** One tiny, unambiguous-sounding function —
`is_username_available` — taken exactly as far as "programming" asks
anyone to take it: write it, check it against an example, watch it pass.
Then, without changing a single line of that finished, correct code,
you'll hold it up against a second question, and a third, and a fourth,
and discover that "the code is correct" answered almost none of them. The
transferable problem: programming and software engineering are not the
same activity done at different skill levels — they're answering two
different questions, and a program can fully satisfy the first one while
the second one hasn't even been asked yet.

**What you need to know first.** Lesson 1 — specifically the distinction
between a **program** (graded once, against a fixed question) and a
**software system** (has to go on being correct as things change). This
lesson doesn't re-derive that distinction; it uses it as a starting point
and gives it sharper edges by asking, precisely, *what kind of question*
each side is actually answering.

**Terms introduced in this lesson**

- **the programming question** — "does this code produce the right output
  for the cases I've checked?" A question with a real, checkable answer,
  and one that can be fully closed: once checked, it's answered, done.
- **the engineering question** — "should this exist, built this way, given
  everything else that has to keep being true?" A question that is never
  fully closed the way the programming question is — it can be answered
  well or poorly *for now*, and it stays open, revisited again every time
  something around the code changes. This lesson exists to make the gap
  between these two questions concrete, because it's easy to finish
  answering the first one and mistake that for having answered the second.

**Objects and methods used.** None new. This lesson's code uses `in` /
`not in` membership testing against a `set`, and a function definition —
both already-assumed Python syntax under the convention Lesson 1
established (basic, prior-knowledge syntax isn't lab'd in this
curriculum).

---

## Concept Unit: Answering the Programming Question

### The Problem

Someone asks for a function: given a username someone wants to register,
and the set of usernames already taken, say whether it's available. That's
a small, precise-sounding task. Write it.

### The Code, Run for Real

```python
def is_username_available(username, existing_usernames):
    return username not in existing_usernames
```

Check it against the obvious cases — a name that's free, and one that
isn't:

```python
existing = {"alice", "bob", "carol"}
print(is_username_available("dave", existing))
print(is_username_available("alice", existing))
```

Running it:

```text
$ python usernames.py
True
False
```

`"dave"` isn't in the taken set, so it's available — `True`. `"alice"` is
in the taken set, so it isn't — `False`. Both match exactly what was
asked. By the programming question's own standard — does this code
produce the right output for the cases checked — this function is
finished. There is nothing left to fix.

### Mechanical Walkthrough

- `def is_username_available(username, existing_usernames):` — a function
  definition with two parameters. Already-assumed syntax.
- `username not in existing_usernames` — membership testing against a
  `set` using `not in`. Already-assumed syntax; this is ordinary
  Foundations-level Python, not a new engineering idea.

### CS Lens

Same shape as Lesson 1's very first version of `cart_total`: one function,
checked against a small number of concrete inputs, each compared to a
hand-computed expected answer. This is what "correct" means for a program
— a claim about a finite number of checked points.

### SE Lens

Stopping here is not a mistake, exactly — it's *incomplete* in a way that
doesn't show up yet. Nothing about this function is broken. The next two
units don't find a bug in it. They find a set of real, still-open
questions that "the code passed its checks" gave no information about at
all.

---

## Concept Unit: The Programming Question, Answered — The Engineering Question, Not Even Asked

### The Problem

Nothing about `is_username_available` changes in this unit. The same,
already-correct function gets called with one more input: a name that's
almost, but not quite, one that's already taken.

### Run the Same Code Against a New Input

```python
print(is_username_available("Alice", existing))
```

The same `existing` set from the previous unit is still `{"alice", "bob",
"carol"}` — nothing about it or the function changed. Here's what comes
back:

```text
$ python usernames.py
True
```

`"Alice"`, capital A, comes back `True` — available — while `"alice"`,
lowercase, is sitting right there in `existing_usernames`. Nothing about
this is a bug in the sense Lesson 1 used that word: the function does
exactly what its own code says, on every input, including this one. `"Alice"
not in {"alice", "bob", "carol"}` really is `True` in Python — two
different strings, correctly judged not equal. The programming question —
does the code do what its own logic says — is still fully answered, still
`True` down the line, still nothing to fix by that standard.

### The Concept

And yet: is this the right behavior for a real signup form? Almost
certainly not — most systems would want `"Alice"` and `"alice"` to
collide, so one account can't be used to impersonate the other, or to
quietly register a confusingly similar handle. But notice exactly what
kind of gap that is. It is not a gap between "what the code does" and
"what the code was told to do" — those still match perfectly. It's a gap
between "what the code was told to do" and "what should actually happen,"
and *nobody decided that yet* — not the person who wrote the function, not
the code itself. **The engineering question** — should this exist, built
this way — was never asked in the first place. The programming question
closed cleanly specifically because it never had to touch that gap at all.

### CS Lens

This is the same shape as a formally verified program that's proven
correct *against its own specification* and still wrong in practice — the
proof only ever checks the code against the spec it was given; if the spec
itself doesn't match what was actually needed, no amount of correctness
against that spec catches it. Correctness is always relative to a stated
question — it says nothing about whether that was the right question.

### SE Lens

The real alternative missing here isn't "write smarter code" — a cleverer
`is_username_available` couldn't have resolved this on its own, because
case-sensitivity isn't a coding decision, it's a decision about what the
system is supposed to mean by "the same username." Deciding that requires
asking someone, or deciding deliberately — an activity that happens
*before* code, and that pure programming, by definition, has no step for.
This curriculum devotes an entire domain to exactly that activity, under
its own name, later on.

---

## Concept Unit: The List of Questions That Are Still Open

### The Problem

Case sensitivity turned out to be one open question hiding behind a
"finished" function. It is nowhere near the only one. This unit doesn't
write more code — it takes the exact same three-line function and asks
what else about it is still undecided, still unverified, or still
unknown, despite it being, by the programming question's standard,
completely correct.

### The Concept

Each of these is a real, legitimate question about `is_username_available`
that passing its test cases gives zero information about:

- **Where does `existing_usernames` actually come from, and what happens
  when it holds ten million names instead of three?** `not in` on a
  `set` is fast, but *is a `set` even how the real system stores taken
  usernames*, and does whatever answer that turns into still behave the
  same way at real scale? A programming-only view has no reason to ask
  this — the three-name test case doesn't distinguish a good answer from
  a bad one.
- **What happens if two people try to register the same username at
  literally the same moment?** Calling this function twice, back to back,
  each time correctly reporting "available," doesn't prevent both callers
  from acting on that answer before either registration is actually
  recorded. Nothing in three lines of pure logic can even see this
  problem — it only exists once the function is running as part of a
  real system with real timing.
- **Who else calls this function, and what happens to them if its
  parameters ever change?** Right now, that's unknown — nothing about the
  function itself records or limits who's allowed to depend on it.
- **How would anyone find out if this function stopped behaving
  correctly, the next time someone edits it?** By manually retyping
  `"alice"` and `"dave"` again, the way this lesson just did? That doesn't
  scale past one person, remembering, for as long as they keep
  remembering.
- **Was "case-sensitive, exact match" even the actual request**, or a
  guess at what "check if a username is taken" was assumed to mean?

None of these are bugs. None of them show up as a wrong answer to any test
already run. Each one is a real, still-open question that "the code is
correct" left completely untouched — about *scale*, about *timing*, about
*who depends on this*, about *how anyone would know if it broke later*,
about *whether the requirement was even understood correctly*. That list —
not any single item on it — is the actual shape of the difference this
lesson is teaching: **software engineering** is not a harder version of
answering the programming question. It's the discipline of noticing that
list exists at all, and deciding, deliberately, which of those questions
need answering now, which can wait, and which this particular system can
safely never answer because they genuinely don't apply. This curriculum's
remaining seventeen domains are, almost without exception, one of those
questions taken out and given the depth it deserves.

### CS Lens

Widening the frame from "does this one function return the right value"
to "what does this function's *existence*, as part of a larger running
system, actually require" is the same widening every serious verification
or design discipline eventually makes — from testing a unit in isolation
to reasoning about a whole system's behavior under real, concurrent,
long-running conditions. The function didn't get more complicated. The
frame around it did.

### SE Lens

There's a real, tempting alternative to sitting with a list like this:
answer every question on it, right now, before writing another line —
handle concurrency, plan for ten million users, get sign-off on the exact
matching rule, build in observability, all before this function ships.
That isn't obviously better; it's slower to build, for a feature that
might not need most of that yet, and answering questions nobody has asked
you yet is its own real cost. The discipline this curriculum teaches isn't
"always answer every open question immediately" — it's knowing the list
exists, being able to name what's actually on it for a given piece of
code, and making that choice — answer it now, defer it deliberately, or
rule it out — on purpose, rather than by simply never noticing the
question was there.

---

## Connect the Pieces

One function, `is_username_available`, never rewritten in this lesson:

1. **The programming question, answered** — `"dave"` → `True`, `"alice"`
   → `False`, checked, correct, done by that standard.
2. **The engineering question, revealed as unasked** — the exact same,
   still-correct function returns `True` for `"Alice"` while `"alice"` sits
   in the taken set — a real, undecided question about what "the same
   username" even means, invisible to the programming question entirely.
3. **The list** — scale, timing, dependents, verifiability, and whether
   the original request was even understood correctly: five more open
   questions, none of them bugs, none of them visible to "does the code
   pass its checks."

## What Breaks Without This

Treat the programming question as the whole job — ship
`is_username_available` exactly as it stands, the moment its test cases
pass, with none of the list above ever asked. Nothing crashes. No
traceback appears, the way one did in Lesson 1. Instead: two users
register confusingly similar handles under `"alice"` and `"Alice"` weeks
apart, a support ticket comes in asking why, and the person reading that
ticket has to reconstruct, after the fact, a decision ("should usernames
be case-insensitive?") that was never actually made — only defaulted into,
silently, by a three-line function nobody thought was making a decision at
all. This is the same *silent*, no-traceback failure shape Lesson 1's
closing section demonstrated, at a different point in the process — not
a wrong line inside working code, but a real question that was never
opened.

## Exercises

1. Pick any one item from "The List of Questions That Are Still Open" and
   write, in a few sentences, what you'd actually need to find out or
   decide to close it for `is_username_available` — who you'd ask, or
   what you'd measure. No code required.
2. Change `is_username_available` so that `"Alice"` and `"alice"` are
   correctly treated as the same username (hint: compare a normalized
   form of both strings, not the raw arguments). Run it against both
   spellings and confirm the collision is now caught.
3. Now ask the engineering question about *your own fix* from Exercise 2:
   name one new thing about usernames that is still undecided even after
   case-insensitivity is handled (there is at least one real answer
   involving Unicode look-alike characters or leading/trailing spaces).

## Definition of Done

- [ ] You can state, without notes, the difference between the
      programming question and the engineering question, in your own
      words.
- [ ] You've completed Exercise 2 and confirmed, by actually running it,
      that `"Alice"` now collides with `"alice"`.
- [ ] You can name at least two items from this lesson's "List of
      Questions" from memory, not by rereading them.
- [ ] Commit your updated `usernames.py`. Commit message should explain
      *why* the change was made — for example: `Lesson 2 — usernames now
      compared case-insensitively; closes one open engineering question
      from the original version.`
