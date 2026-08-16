# Lesson 5: Change as the Central Engineering Problem

**What you will build.** A single representation decision — how a price is
stored in code — made two different times: once before anything depends
on it, and once after real data and real other code already do. You'll
watch the exact same underlying mistake (using `float` for money) cost
almost nothing to fix the first time and a great deal to fix the second,
using nothing but Python's own real floating-point arithmetic as proof.
The transferable problem: change isn't an occasional disruption to an
otherwise-finished system — it's the condition software exists under
permanently, and *when* a given piece of code meets its first real change
determines how expensive that change turns out to be, often far more than
what the change itself actually is.

**What you need to know first.** Lesson 1's software system (code plus
everything that has to keep being true about it over time) and Lesson 4's
essential versus accidental complexity — this lesson's central example
turns on a representation choice, which is exactly the kind of decision
Lesson 4 showed can quietly manufacture accidental complexity later.

**Terms introduced in this lesson**

- **change**, as this curriculum uses it from here on — any event that
  requires a software system's code, data, or behavior to be different
  from what it already is: a new requirement, a shifted assumption, a
  dependency updating, a scale the system wasn't built for, a person who
  understood a piece of it leaving. The word is given this specific,
  broad definition here because the rest of this curriculum treats
  "change" as a single unifying category, not five unrelated concerns.
- **cost-of-change curve** — the real, widely observed pattern that fixing
  the same underlying problem costs dramatically more the later it's
  caught in a system's life: cheapest before anything is built around the
  wrong decision, more expensive once code depends on it, more expensive
  still once real data has accumulated under it, and most expensive of
  all once it's shipped and other systems or people are relying on the
  wrong behavior staying exactly as wrong as it currently is.

**Objects and methods used.** None new — this lesson's code uses only
already-assumed arithmetic, `for` loops, and `round()`, all covered by the
existing-syntax convention from Lesson 1.

No pipeline diagram yet — this curriculum has not established one.

---

## Concept Unit: Change Is the Normal Condition, Not the Exception

### The Problem

It's tempting to picture building software as: design it, build it,
ship it, done — with "change" as something that happens to a system only
occasionally, as an interruption. Is that an accurate picture of any real
system?

### The Concept

Look at where change actually comes from, and how often each source shows
up in any system that's used by real people for more than a few weeks:

- **Requirements change.** What the system is supposed to do shifts —
  a new discount code, the way `cart_total` gained one in Lesson 1, or a
  case-sensitivity rule nobody had decided yet, the way Lesson 2's
  `is_username_available` hadn't.
- **The environment changes.** A language runtime, an operating system, a
  browser, or a third-party service the code depends on gets updated,
  deprecated, or shut down entirely, with or without anyone asking for it.
- **Scale changes.** The three-username `existing_usernames` set from
  Lesson 2 behaves nothing like a real signup system's actual set, once
  there are ten million real accounts in it instead of three.
- **The team changes.** People who understood why a piece of code works
  the way it does leave; people who didn't write it have to change it
  anyway.
- **Technology changes.** A tool, library, or platform the system is built
  on eventually gets replaced, sometimes by choice, sometimes because it's
  no longer supported at all.

None of these are edge cases. Across the lifetime of any system used by
real people, at least one of them is close to guaranteed to happen, and
most systems that survive any length of time experience all five, more
than once. That's the real reason this curriculum's central question,
stated in its very first pages, is about keeping a system correct *as it
changes* rather than about producing one version that's correct once —
change isn't the exception a finished system occasionally suffers. It's
the condition the system exists under for its entire working life.

### CS Lens

This reframes "correctness" itself: not a single, checkable property of
one version of the code (Lesson 1's program), but a property that has to
be re-established, over and over, against a target that keeps moving.

### SE Lens

Believing change is exceptional leads to a real, common mistake: treating
every one of these five sources as a surprise each time it shows up,
rather than as an expected, planned-for category. The rest of this
curriculum is largely organized around the opposite stance — assume
change is coming, from one of these five directions, and build in a way
that keeps its cost down when it arrives. The next two units make that
cost concrete.

---

## Concept Unit: The Same Mistake, Priced at Two Different Times

### The Problem

A small decision, easy to make without thinking twice: represent a price
in code as an ordinary `float` — `19.99`, `0.10`, whatever the number is.
Make that decision once, before anything depends on it yet.

### The Code, Run for Real

```python
price = 0.10
total = 0.0
for _ in range(300):
    total += price
```

Three hundred dimes should sum to exactly thirty dollars. Check it:

```python
print(total)
print(total == 30.0)
```

Running it:

```text
$ python prices.py
30.000000000000156
False
```

Not `30.0`. `30.000000000000156` — and the direct equality check comes
back `False`. Nothing in this code is buggy in the sense Lesson 1 used
that word; `float` genuinely cannot represent `0.10` exactly in binary,
the same way `1/3` can't be written exactly in decimal, and adding that
tiny imprecision to itself three hundred times makes the error large
enough to see.

### Mechanical Walkthrough

- `price = 0.10` — a `float` literal. Already-assumed syntax; the
  imprecision is a property of how `float` stores the value, not of this
  line.
- `total += price` inside a loop running 300 times — repeated addition,
  already-assumed syntax. Each individual addition's error is far too
  small to notice; the loop is what makes it visible, by adding it to
  itself enough times to accumulate past the point of being invisible.
- `total == 30.0` — direct equality between two `float` values. This is
  the line that actually fails, and it fails for a real, structural
  reason: `total` is not the mathematical number thirty, it's whatever
  binary value three hundred repeated approximate additions actually
  produced, and `==` demands exact agreement.

### The Fix, Priced Before Anything Depends on It

Nothing has shipped yet. Nothing has been stored. The fix is a
one-line representation change — count cents as whole integers instead of
dollars as fractions:

```python
price_cents = 10
total_cents = 0
for _ in range(300):
    total_cents += price_cents
print(total_cents)
print(total_cents == 3000)
```

Running it:

```text
$ python prices_cents.py
3000
True
```

Exactly `3000` cents, and the equality check is `True` — integers have no
equivalent representation error, so summing whole cents never drifts. At
this stage — before any other code calls `price`, before any customer
record stores a dollar amount, before any report has ever been generated
from this number — making this switch costs exactly what it looks like:
rewrite one variable's meaning, done.

### The Same Fix, Priced After Reality Has Moved

Now picture the realistic version of how this actually goes wrong: the
`float` version ships. Months pass. A production database has accumulated
several million stored order totals, all computed and saved as `float`
dollars, some of them already off by fractions of a cent the exact way
`30.000000000000156` was. A dozen other services now read those stored
totals directly. Finance has already closed out quarterly reports built
from those numbers. Fixing the representation now doesn't mean rewriting
one variable — it means migrating millions of existing rows to a new
format, coordinating that migration with every other service reading the
old one, deciding what to do about reports that already went out built on
slightly-wrong numbers, and doing all of it without taking the order
system down. The underlying mistake — `float` for money — never changed
between these two moments. What changed is everything now built on top of
it, and that's the entire cost difference.

### CS Lens

This is the same shape as `cart_total`'s regression in Lesson 1, stretched
across a much longer timescale: a decision that looked locally correct
(the code ran, produced plausible numbers) hides a real problem that only
becomes expensive once enough has been built around it to make undoing it
hard.

### SE Lens

The realistic alternative here isn't "always use integer cents for every
number, everywhere, just in case" — plenty of numeric values genuinely
don't carry this risk, and defending against every hypothetical cost
regardless of likelihood is its own real cost, the same tension Lesson
2's closing unit already raised. The actual skill this lesson is pointing
at is narrower: recognizing which decisions are the *expensive-later*
kind — ones other code and data will accumulate on top of — early enough
to give them real attention, rather than treating every decision as
equally cheap to revisit "later."

---

## Concept Unit: The Cost-of-Change Curve

### The Problem

Name what the previous unit actually demonstrated, precisely: the same
underlying fix, at two different points in the same system's life, cost
wildly different amounts. Is that specific to floating-point money, or is
it a general pattern?

### The Concept

It's general, and well enough documented across real software projects
that it has a name: the **cost-of-change curve** — empirical studies of
real projects (most famously Barry Boehm's) have repeatedly found that
fixing the same underlying problem costs roughly an order of magnitude
more at each later stage: cheapest while it's still just a decision on
paper, more expensive once code is written around it, more expensive
again once it's been tested and other code depends on the tested behavior,
and most expensive of all once it's live in production with real data and
real users depending on the current, wrong behavior not changing out from
under them. The money-as-float example traced exactly two points on that
curve — "before anything depends on it" and "after millions of rows and a
dozen services do" — but the same curve applies to a wrong architectural
boundary, a misunderstood requirement, or an insecure default, not just a
data-representation choice.

### CS Lens

The same shape — a mistake's cost multiplying the longer it survives
undetected — is recognized far outside software: a typo caught by an
editor before a book is printed costs a correction in a file; caught after
a million copies are printed, it costs a reprint or a permanent errata
page. A structural flaw caught in an engineer's blueprints costs a
redrawn line; caught after the building is standing, it costs
demolition or a retrofit. A defect in a product design caught before
manufacturing begins costs a design change; caught after a million units
have already shipped, it costs a recall. In every case, the flaw itself
doesn't get worse over time — what grows is everything that had to be
built, trusted, or shipped on top of it before it was caught.

### SE Lens

This is the real justification, stated plainly, for a lot of what can
otherwise look like overhead: writing a specification before code, having
someone else review a design, building automated tests, catching a
problem in a code review instead of after deployment. None of those
activities make the underlying mistake less likely to be made in the
first place — people still make mistakes at every stage. What they change
is *where on this curve* a given mistake gets caught, and the curve is
steep enough that catching something one stage earlier routinely pays for
the entire cost of the activity that caught it. This curriculum spends
real time, across many later domains, on exactly that: specification,
review, and testing, not as bureaucracy, but as the practical tools this
curve gives a real reason to use.

---

## Connect the Pieces

One decision, "store a price as `float`," followed through this lesson:

1. **Change is expected, not exceptional** — five real, ordinary sources
   of change (requirements, environment, scale, team, technology) show up
   in essentially every system that lasts.
2. **The same mistake, priced twice** — `float` money drifts to
   `30.000000000000156` either way; fixed before anything depends on it,
   the cost is one line; fixed after millions of rows and a dozen services
   depend on it, the cost is a coordinated migration.
3. **The general pattern** — the cost-of-change curve names why those two
   costs were so different, and why catching a mistake one stage earlier,
   in general, tends to be dramatically cheaper than catching it one stage
   later.

## What Breaks Without This

Treat every decision as equally cheap to fix "whenever," and let the
`float` version of the pricing code ship without a second thought, on the
reasoning that `total == 30.0` returning `False` in one test doesn't look
urgent. Nothing crashes at ship time — the numbers are close enough to
right that nobody notices for months, which is exactly the danger: by the
time a customer support ticket points out an order total that's a cent off
from what it should be, the fix is no longer a one-line change, it's a
data migration across every system that ever read that stored value. The
mistake didn't get harder to fix because it got worse. It got harder to
fix because time passed and things accumulated on top of it while nobody
was looking — which is the cost-of-change curve, experienced instead of
just described.

## Exercises

1. Run `0.1 + 0.2 == 0.3` directly in Python and observe the result.
   Explain, in your own words, why it matches this lesson's
   `total == 30.0` failure — same underlying cause, smaller example.
2. Pick one of the five sources of change listed in this lesson's first
   unit (requirements, environment, scale, team, technology) and describe
   a real or plausible change from that category that could hit
   `is_username_available` from Lesson 2. Say what in the code would need
   to change in response.
3. Think of a decision in any project you've worked on — school, personal,
   or otherwise — that turned out to be far more expensive to change later
   than it would have been at the start. Name what made it expensive
   later specifically: what had accumulated on top of it by the time it
   was fixed.

## Definition of Done

- [ ] You've run the `float` pricing example yourself and seen
      `30.000000000000156` and `False` for real.
- [ ] You've run the integer-cents version and confirmed `3000` and `True`.
- [ ] You can state the cost-of-change curve in one or two sentences,
      without rereading this lesson.
- [ ] You've completed all three exercises.
- [ ] Commit both versions of the pricing code. Commit message should
      explain *why* both are kept side by side: for example, `Lesson 5 —
      float vs. integer-cents pricing, kept together to show the same fix
      costing differently depending on when it's made.`
