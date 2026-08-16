# Lesson 1: What Software Engineering Is

**What you will build.** A single small function, `cart_total`, that adds up
the prices in a shopping cart — and then you will watch it stop being simple.
You will hand it a real new requirement (a discount code), watch a
plausible-looking fix quietly break something that used to work, fix that
too, and then step back and ask what, exactly, changed about the *kind of
thing* `cart_total` is between the first version and the last. The
transferable problem underneath the toy example is the actual subject of
this lesson: telling apart a **program** — something graded once, against a
fixed question — from a **software system** — something that has to go on
being correct as the questions themselves change. Everything else in this
curriculum is downstream of being able to tell those two things apart on
sight.

**What you need to know first.** Nothing from this curriculum — this is
its first lesson. This curriculum does assume you can already read and
write ordinary code in some mainstream language, at the level the
Computational Foundations curriculum teaches: functions, parameters,
conditionals, basic built-in types. That is a deliberate boundary, not an
oversight — the Software Engineering BRD states directly that
programming-language fundamentals belong to Foundations, and this
curriculum's job is to teach how those fundamentals get used in the
engineering of real systems, not to re-teach the fundamentals themselves.

Code examples in this curriculum are written in Python, chosen for one
reason: it gets out of the way. Software engineering ideas are meant to be
language-neutral — the same idea about regressions or contracts or
coupling is true whether the code is Python, Java, or C# — and Python's
syntax stays quiet enough that the engineering idea stays the visible part.
Because of the boundary above, this curriculum will **not** open a
throwaway lab for ordinary Python syntax the way a programming-fundamentals
course would (a plain `if`, a function definition, a built-in like `sum()`).
A lab still opens, every time, for anything that is a genuinely new
*engineering* idea — a pattern, a principle, a way of reasoning about code
— even when the Python wrapped around it is trivial.

No pipeline diagram yet — this curriculum has not established one.

**Terms introduced in this lesson**

- **program** — code judged by whether it produces the right output for a
  fixed, known input, checked once. The word matters here because it names
  the *narrower* of the two things this lesson is telling apart — most
  people's first mental model of "does the code work" stops here, which is
  fine for a homework problem and dangerously incomplete for anything that
  will be used more than once.
- **software system** — a program plus everything that has to keep being
  true around it over time: the people and other code that depend on it,
  the assumptions it was written under, and the changes still to come. The
  word exists because "does it work" stops being a single yes/no question
  once a piece of code has a *future* — it becomes "does it still work,
  after that."
- **software engineering** — the discipline of keeping a software system
  correct as it changes, rather than making one version of it correct one
  time. It is defined here in contrast to *programming* on purpose — this
  curriculum needs the two words to mean visibly different things from its
  very first page, because the rest of the curriculum is organized around
  that difference.
- **regression** — previously-correct behavior that breaks as a side
  effect of a later, unrelated-seeming change. The word exists because
  "the new thing I added doesn't work" and "something old that used to
  work just silently stopped" are different failures with different
  causes, and only one of them announces itself.

**Objects and methods used.** None. Every construct this lesson's code
uses — a function definition, a default parameter value, an `if`
conditional, the built-in `sum()`, a `dict` literal and lookup — is
ordinary, already-assumed Python syntax under the boundary stated above,
not a new object or method this curriculum is introducing. The first
lesson that introduces a genuinely new library, framework, or tool will
give it full treatment in this section.

---

## Concept Unit: A Program Graded Once

### The Problem

Say someone hands you this task: "write something that adds up the prices
in a cart." There's a real question buried in that sentence — how would
you, or anyone, ever know whether what you wrote is *right*? For a task
this small, the honest answer is almost embarrassingly simple: pick a cart,
work out the total by hand, run the code on that same cart, and compare.
If the numbers match, you're done. That simplicity is worth sitting with
for a second, because it is exactly the thing that stops being true later
in this lesson.

### The Code, Run for Real

```python
def cart_total(prices):
    return sum(prices)

print(cart_total([12.50, 4.00, 7.25]))
```

Running it:

```text
$ python cart_total.py
23.75
```

$12.50 + \$4.00 + \$7.25 = \$23.75$, by hand, matches the printed output
exactly. That match is the entire proof this version of `cart_total` needs.
There is one input, one expected answer, one comparison — this is what it
means to grade a **program**: a fixed question with a checkable answer,
verified once.

### This Example Won't Persist

This exact three-line file is not the start of a project this curriculum
carries forward — it exists only to make the next two Concept Units
concrete, and it gets rewritten from here on, in place, as the lesson
continues. Nothing about it is meant to survive past this lesson except the
idea it demonstrated.

### Mechanical Walkthrough

Enumerating what the code above actually does, in order:

- `def cart_total(prices):` — a function definition taking one parameter.
  Already-assumed syntax (per the boundary stated in the header) — no
  restatement owed.
- `sum(prices)` — a built-in call that adds every element of an iterable
  together. Already-assumed syntax — no restatement owed. It is the whole
  body of the function on purpose: the task really is that small, for now.
- `return` — sends that total back to the caller. Already-assumed syntax.
- `print(cart_total([12.50, 4.00, 7.25]))` — calls the function with a
  literal list of three prices, then prints whatever it returns.
  Already-assumed syntax.

Nothing here is a new engineering idea yet — the code is deliberately
trivial. The idea worth noticing lives one level up, in what "grading" this
code even meant.

### CS Lens

This is the same shape as grading a pure mathematical function: given this
input, is the output correct? It's also the same shape as a single unit
test, or a single row of a homework answer key — a fixed input, a fixed
expected output, one comparison.

### SE Lens

It would be possible to stop here and call this "software engineering" —
write the function, check it against one example, ship it. That is, in
fact, roughly what a course that only teaches programming stops at: learn
the language, write programs, check that each one produces the right
answer. The alternative this curriculum is built around — reasoning about
what happens to `cart_total` *after* this point — costs more up front to
even talk about, and pays for itself the moment the task changes. The next
two units are that moment.

---

## Concept Unit: The Same Function, After a Requirement Changes

### The Problem

A week later, a real request arrives: carts need to support a discount
code, `"SAVE10"`, that takes 10% off the total. Nothing about the original
request — a cart still needs a total — has stopped being true. The new
request sits *on top of* the old one rather than replacing it, and that's
the part worth paying attention to: whatever change gets made now has to
keep last week's already-correct behavior correct, while also making a
brand new case correct.

### Project Change

- **Reference Source** — none; this curriculum has no reference
  implementation to port from at this point. This is a from-scratch
  illustrative example, built to demonstrate the idea directly.
- **Files affected** — the same scratch file from the previous unit,
  `cart_total.py`, modified in place.
- **Change type** — modify: `cart_total` gains a second, optional
  parameter and a new branch.
- **Location** — inside `cart_total`, replacing the single-line body shown
  in the previous unit.
- **Dependencies** — none beyond what the previous unit already used.

### The New Code

Two separate pieces land in the same function: a new default parameter,
and a new branch that uses it.

```python
discount_code=None
```

That default value is what makes the parameter optional. Next to it, the
branch that actually reads it:

```python
if discount_code == "SAVE10":
    total = total * 0.9
```

### The Updated Project

Both pieces land inside the function shown in the previous Concept Unit:

```python
def cart_total(prices, discount_code=None):   # ← new: discount_code=None
    total = sum(prices)
    if discount_code == "SAVE10":              # ← new
        total = total * 0.9                    # ← new
    return total

print(cart_total([12.50, 4.00, 7.25]))
print(cart_total([12.50, 4.00, 7.25], "SAVE10"))
```

Running it:

```text
$ python cart_total.py
23.75
21.375
```

`cart_total` now does two things instead of one: called the old way, with
just a list of prices, it still returns exactly what it returned before
($23.75); called with `"SAVE10"` as a second argument, it returns the
discounted total ($23.75 \times 0.9 = \$21.375$). Both lines of that output
had to be checked — not just the new one.

### Mechanical Walkthrough

- `discount_code=None` in the parameter list — a **default parameter
  value**: a parameter that takes on a stated value when a caller doesn't
  supply one. First appearance of this exact construct in this curriculum
  — full treatment. Its whole reason for existing is visible in the output
  above: it's what lets `cart_total([12.50, 4.00, 7.25])`, written exactly
  as it was before this change, keep compiling and keep returning the same
  answer. Without it, every existing call to `cart_total` would need a
  second argument added just to keep running, whether or not that call
  site cares about discounts at all.
- `if discount_code == "SAVE10":` — an `if` conditional testing equality
  against a string literal. Already-assumed syntax — no restatement owed.
- `total = total * 0.9` — reassigns `total` to 90% of itself. Already-
  assumed syntax.
- `cart_total([12.50, 4.00, 7.25], "SAVE10")` — a call passing a second,
  positional argument for the first time. Already-assumed syntax (the call
  mechanics aren't new — only the parameter they're feeding into is).

### CS Lens

Adding an optional parameter with a default is a way of *widening a
function's domain without narrowing its old one* — every input the
function used to accept is still accepted, and produces the same output it
always did, while a new category of input becomes possible alongside it.
The general shape — extend what something accepts without disturbing what
it already accepted — recurs constantly outside functions too: a file
format that adds a new optional field old readers can ignore, an HTTP API
that adds a new optional query parameter, a database column added with a
default value so existing rows don't break.

### SE Lens

There was a real alternative here that this code did not take: change
`cart_total`'s signature to *require* a discount code —
`cart_total(prices, discount_code)`, no default — and make every caller
pass something, even if it's just an explicit "no discount" value. That
version is arguably more honest, since it doesn't let a caller forget
discounts exist. It was rejected here for a concrete cost: it breaks every
existing call site immediately, on the day this change ships, for the sake
of a case (no discount) that used to need no special handling at all. The
optional-parameter version chosen instead is not free either — it does not
delete the old, simple, one-line version of `cart_total`; it keeps that
behavior alive *inside* a slightly more complicated function that now has
to correctly handle two cases forever instead of one. That is a real,
ongoing cost, paid in exchange for not breaking anything that already
worked. This tradeoff — do we change what already exists, or add
something new alongside it without disturbing the old — is one this
curriculum will come back to at far larger scale than a single function
parameter.

---

## Concept Unit: When a Fix Breaks What Already Worked

### The Problem

A second discount code is on the way, so imagine a developer decides to
get ahead of it and refactor the `if` chain into a lookup table before it
grows into a long chain of `elif`s — a reasonable-looking cleanup, done
with good intentions, nowhere near the part of the code that "no discount
code" logic seemingly lives in.

### The New Code

```python
def cart_total(prices, discount_code=None):
    discounts = {"SAVE10": 0.9}
    total = sum(prices)
    total = total * discounts[discount_code]
    return total
```

### Run It — Watch It Fail

Call it both the new way and the old way, in the same run:

```python
print(cart_total([12.50, 4.00, 7.25], "SAVE10"))
print(cart_total([12.50, 4.00, 7.25]))
```

The second call is the exact same call that has worked without incident
since the first Concept Unit of this lesson. Here is what actually happens
when it runs:

```text
$ python cart_total.py
21.375
Traceback (most recent call last):
  File "cart_total.py", line 8, in <module>
    print(cart_total([12.50, 4.00, 7.25]))
  File "cart_total.py", line 4, in cart_total
    total = total * discounts[discount_code]
                    ~~~~~~~~~^^^^^^^^^^^^^^^
KeyError: None
```

The first line succeeds — the SAVE10 case the developer was actively
thinking about still works, $21.375$, correct. The second line — the
plain, no-discount call that has worked without incident since the very
first Concept Unit of this lesson — crashes outright. Nobody touched the
no-discount *case* on purpose. It broke anyway, as a side effect of a
change aimed entirely at a different case. That is what a **regression**
is: not a new feature arriving broken, but an old, already-verified
behavior breaking as collateral damage from a change that wasn't about it
at all.

### Mechanical Walkthrough

- `discounts = {"SAVE10": 0.9}` — a `dict` literal with one entry.
  Already-assumed syntax.
- `discounts[discount_code]` — a `dict` lookup using `discount_code`'s
  current value as the key. Already-assumed syntax mechanically — but
  worth tracing precisely, because the mechanics are exactly what produced
  the crash: when `cart_total` is called with no second argument,
  `discount_code` holds its default, `None`. `discounts[None]` then asks
  the dictionary for a key that was never added to it. Python's dict
  indexing raises `KeyError` the instant a requested key isn't present —
  it does not return some placeholder value and continue.
- The traceback itself — Python's report of an unhandled error, printed
  from the innermost failing line (`discounts[discount_code]`) outward to
  the call that triggered it. First appearance of reading a real traceback
  in this curriculum: read it bottom-to-top for *what* failed
  (`KeyError: None` — no entry for key `None`) and top-to-bottom for
  *where* — which call led to which call led to the actual failing line.

### The Fix

One line changes — the raising lookup becomes a defaulting one:

```python
def cart_total(prices, discount_code=None):
    discounts = {"SAVE10": 0.9}
    total = sum(prices)
    total = total * discounts.get(discount_code, 1.0)   # ← changed
    return total

print(cart_total([12.50, 4.00, 7.25], "SAVE10"))
print(cart_total([12.50, 4.00, 7.25]))
```

Running the exact same two calls that crashed a moment ago:

```text
$ python cart_total.py
21.375
23.75
```

Both call shapes are correct again: `21.375` for the discounted cart,
`23.75` for the plain one — the exact original answer from the very first
version of this function, still exactly reproducible three rewrites later.

- `discounts.get(discount_code, 1.0)` — `dict.get`, a lookup that returns
  a stated fallback (here, `1.0` — "multiply by nothing") instead of
  raising when the key is missing, rather than `discounts[discount_code]`,
  which raises. Both are ordinary dict methods and already-assumed
  mechanically — the engineering point isn't the method, it's that the
  fix required *noticing* the missing-key case existed at all, which the
  crash forced into the open. A version of this bug that didn't crash —
  one that silently computed a wrong number instead — would not have
  announced itself nearly as clearly; the closing exercise at the end of
  this lesson builds exactly that version on purpose.

### CS Lens

Regressions of this shape — a change scoped to one case silently
invalidating an assumption a different, untouched case depended on — are
recognized under many names outside this one function: a version-control
regression a team finds by bisecting through commits to find which one
broke a working build; a spreadsheet formula edit that silently changes
the value of a cell three sheets away that referenced it; a physical
retrofit that strengthens one part of a bridge while quietly changing the
load an unrelated support member now has to carry; a scientific paper's
revised dataset invalidating a conclusion in a completely different paper
that cited the old numbers. The common thread in all of them: correctness
was never really a property of the one part that changed — it was a
property of the whole system of things depending on each other, and only
one part of that system got checked.

### SE Lens

The realistic alternative to what happened here isn't "write more careful
code" — the developer in this example wasn't careless; they refactored a
short `if` chain into a lookup table, a change that reads as strictly
cleaner, and still broke something. "Be more careful" doesn't scale as a
strategy precisely because this bug was invisible to careful reading — the
line that broke (`discounts[discount_code]`) is nowhere near, and doesn't
mention, the no-discount case it broke. The real fix this curriculum is
built around isn't a sharper eye; it's *mechanically re-checking the old,
already-correct cases every time something changes* — automatically,
without relying on any one person to remember they exist. An entire later
part of this curriculum is dedicated to exactly that: building automated
checks that catch a regression like this one the moment it's introduced,
not whenever someone happens to run the old case by hand again.

---

## Concept Unit: From Program to System

### The Problem

Step back from the code itself for a second. Across the last three units,
the *task* — "compute a cart's total, allow a discount" — barely changed.
What changed is everything *around* the task: `cart_total` now has more
than one caller shape to keep correct, more than one version of "already
correct" to preserve, and a demonstrated way for a change aimed at one part
of it to break a different part. None of that was true of the three-line
function this lesson opened with. This unit names what actually happened.

### The Concept

Look at what is now true of `cart_total` that was not true of its very
first version:

- It has more than one caller shape to satisfy at once — `cart_total(cart)`
  and `cart_total(cart, "SAVE10")` both have to keep returning the right
  answer, simultaneously, forever, not just whichever one someone happens
  to test.
- It carries an assumption nothing in its code states out loud — that
  `discount_code`, when given, is always exactly `"SAVE10"` or left as
  `None`. Nothing stops a caller from passing `"save10"` lowercase, or
  `"SAVE20"` before it exists, and getting the plain no-discount price
  back with no warning at all.
- It has a demonstrated history of breaking in a place nobody was looking,
  as a side effect of a change made somewhere else in the same function.
- Checking whether it's "correct" is no longer one comparison. It's a
  standing question that has to be re-asked, honestly, every time the
  function changes again — which, being a real function doing a real job,
  it will.

None of that was a property of the code itself changing — it's a property
of the code now having a *future*. A **program**, as this lesson defined
it, is graded once, against a fixed question. What `cart_total` has become
by the end of this lesson is a small piece of a **software system**: code
plus everything that has to keep being true about it over time — its
callers, the assumptions it depends on, the behaviors it has already
promised, and the changes still coming. **Software engineering**, as this
curriculum uses the term from here forward, is the discipline of keeping
that second thing correct — not writing a version that's right once, but
keeping something right *as it changes*. That is a genuinely different job
from programming, not a harder version of the same job, and this
curriculum is organized entirely around that difference: specifying
systems, designing them, testing them, deploying them, watching them fail,
and changing them again without repeating this lesson's own regression
every time.

### CS Lens

A program checked against one input is a claim about a single point. A
system is a claim about every point in a much larger space at once — every
combination of inputs it might receive, over every version of the code it
will ever be. Verifying a single point is arithmetic; verifying that a
whole space of possibilities stays correct as the space itself keeps
growing is the harder, recurring problem this entire curriculum exists to
teach.

### SE Lens

There's a common, narrower definition of "software engineering" worth
naming and rejecting explicitly here, because it's the one most people
arrive with: software engineering as *programming plus tools* — Git,
automated tests, a ticket tracker, an Agile process. Those tools are real
and this curriculum uses them extensively. But the tools didn't do
anything in this lesson — no version control, no test suite, no ticket
existed anywhere in the last three units, and `cart_total` still had a
real regression and a real fix. The tools exist to make the *underlying
discipline* — noticing that old cases have to keep working, noticing that
a change has a blast radius bigger than the line that changed — cheaper
and more reliable to practice at scale. Learning the tools without the
discipline they support produces someone who can operate Git correctly
around a codebase that still regresses exactly like this one did.

---

## Connect the Pieces

One value, `[12.50, 4.00, 7.25]`, traveled through every version of
`cart_total` built in this lesson:

1. **A program graded once** — `cart_total([12.50, 4.00, 7.25])` → `23.75`,
   checked by hand once, done.
2. **A requirement changes** — the same call still returns `23.75`;
   `cart_total([12.50, 4.00, 7.25], "SAVE10")` newly returns `21.375`. Both
   had to be re-verified, not just the new one.
3. **A regression** — a refactor aimed only at the `"SAVE10"` case made
   the *first* call (`23.75`) crash with `KeyError: None`, from a line
   that never mentions the no-discount case at all.
4. **The fix** — `discounts.get(discount_code, 1.0)` restores both
   answers, `21.375` and `23.75`, at once.
5. **The reframe** — the same cart, the same three prices, is now a live
   demonstration of a *software system*: more than one caller shape to
   keep correct simultaneously, an unstated assumption about what
   `discount_code` can be, and a proven history of breaking somewhere the
   change didn't look like it touched.

## What Breaks Without This

Everything so far crashed loudly — `KeyError: None` is impossible to miss.
Delete the discount check entirely and watch what happens instead:

```python
def cart_total(prices, discount_code=None):
    total = sum(prices)
    return total

print(cart_total([12.50, 4.00, 7.25], "SAVE10"))
```

This asks for a 10%-off code, explicitly, as the second argument. Here is
the real output:

```text
$ python cart_total.py
23.75
```

No traceback. No error. `discount_code` is accepted, silently ignored, and
the function returns `23.75` — the full price — for a call that explicitly
asked for a 10%-off code. This is worse than the crash from the earlier
unit, not better: a crash stops execution and points at a line; this
returns a plausible-looking, confidently wrong number and continues as if
nothing happened. This is exactly the case the SE Lens above alluded to —
"correctness must be made observable" is a principle this curriculum
returns to repeatedly, and a bug that produces no error at all is the
sharpest version of why that principle has to be engineered in, not
assumed. Restore the `if discount_code == "SAVE10":` block before moving
on — this broken version does not belong in your working file.

## Exercises

1. Add a second discount code, `"SAVE20"` (20% off), to the working
   (`.get`-based) version of `cart_total`. Confirm, by actually running
   it, that all three call shapes — no code, `"SAVE10"`, `"SAVE20"` —
   still return correct totals.
2. Deliberately reintroduce the `discounts[discount_code]` version from
   the regression unit, confirm you can reproduce the exact `KeyError:
   None` traceback shown in this lesson, then fix it again yourself
   without looking back at the fix — from the traceback alone, working
   out why `None` is the key that's missing.
3. In your own words, one or two sentences, write down one thing that is
   true of the final version of `cart_total` that was not true of the
   very first version in this lesson — something about it being a system
   now rather than a program. There's no code to run for this one; the
   point is being able to say it, not compute it.

## Definition of Done

- [ ] You have a working `cart_total.py` supporting no discount code,
      `"SAVE10"`, and (from Exercise 1) `"SAVE20"`, using `.get(...)` with
      a fallback rather than plain `[...]` indexing.
- [ ] You have personally reproduced the `KeyError: None` traceback at
      least once, and can explain — out loud, to yourself — exactly which
      line failed and why `None` was the key involved.
- [ ] You have personally reproduced the *silent* wrong-answer version
      (discount accepted but ignored) and can say why it's more dangerous
      than the crash, not just different from it.
- [ ] You can state, without looking at this lesson, the difference
      between a program and a software system in your own words.
- [ ] Commit your working `cart_total.py`. Commit message should explain
      *why* this file exists as a learning artifact, not what the code
      does — for example: `Lesson 1 — cart_total as a running example of
      program vs. system; regression reproduced and fixed by hand.`
