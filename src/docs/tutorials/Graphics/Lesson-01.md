# Lesson 1: What Is a Geometric Problem?

**What you will build:** A tiny two-object scene — two robot positions sitting
on a single number line — and a reusable `distance` function that turns "how
far apart are they?" into an actual computed number. The transferable problem
underneath it is bigger than robots: every geometric question this curriculum
will ever ask, from "does this cutting tool crash into the part?" to "is this
pixel inside this triangle?", reduces to the same small handful of moves —
represent something as data, name the relationship you actually care about,
and turn that relationship into a computation you can run on any input, not
just the one example sitting in front of you.

**What you need to know first:** Nothing — this is Lesson 1, the first lesson
in this curriculum.

**Assumed background (outside this curriculum):** general Python fluency
sufficient to have already written and run short scripts — specifically,
core data types (`int`, `float`, `str`, `bool`, and basic collections like
tuples and lists), loops (`for`/`while`), and function definitions (`def`,
parameters, `return`), plus the baseline familiarity with `print()` that
comes before any of those three topics in essentially every introductory
Python exercise. Nothing beyond that is assumed. In particular, `if`/`else`
conditionals are **not** assumed here — this lesson's code doesn't need them,
and the first lesson that does need them owes them full first-appearance
treatment, not a shortcut past them.

**Terms introduced in this lesson:**

- **Geometric object** — a piece of data that stands in for "a thing" that
  exists in space (a position, a shape, a boundary). Why: before you can
  compute anything about a shape, you first have to decide what numbers
  represent it, and "geometric object" is the name for that decided-upon
  stand-in.
- **Geometric relationship** — a connection between two or more geometric
  objects, considered together rather than each alone (how far apart two
  points are, whether one shape touches another). Why: most of the
  interesting questions in graphics, CAD, and simulation aren't about one
  object in isolation — they're about how two or more objects relate.
- **Geometric measurement** — a relationship turned into an actual number.
  Why: "they're far apart" isn't something a program can act on, but
  "they're 6 units apart" is — measurement is the step that makes a
  relationship computable.
- **Geometric query** — a measurement (or several) turned into an answer to a
  specific question, often yes/no ("are these two shapes touching?") or a
  choice ("which of these three points is closest?"). Why: a program rarely
  wants a raw number for its own sake — it wants that number used to decide
  something.
- **Geometric constraint** — a rule that a geometric object or relationship
  must keep satisfying, now and after future changes ("these two edges must
  stay parallel," "the tool must stay at least 2mm from the fixture"). Why:
  constraints are what turn passive geometry into something a system can
  guarantee, not merely describe.
- **Geometric transformation** — an operation that produces a new geometric
  object from an existing one by changing its position, size, or
  orientation. Why: almost nothing in this curriculum's geometry stays fixed
  forever — parts move, cameras rotate, tools travel, and "transformation"
  is the name for the computation that produces the new state.
- **Absolute value** — the non-negative magnitude of a number: how far it is
  from zero, with the direction (sign) thrown away. Why: a distance
  shouldn't depend on which of the two objects you happened to subtract from
  which, and absolute value is exactly the operation that erases that
  dependency.

**Objects and methods used:**

This lesson's own subject — the geometric-problem taxonomy above, and the
`distance` function it motivates — has no external class or method of its
own to list here: `distance` is authored fresh in this lesson, not an
external dependency, so it doesn't belong in this section. One thing below
is supporting cast, not this lesson's subject, but still earns full
treatment.

**"Everything else in the file, not this lesson's subject but still
explained."**

- **`abs()`**
  - *What it is:* One of Python's built-in functions — a small set of
    functions (`print`, `len`, `abs`, and others) available in every Python
    program with no `import` needed, because they live in Python's
    `builtins` module, which every program loads automatically.
  - *Implementation:* Signature `abs(x)`. For a plain number it returns a
    value of the same type it was given (an `int` argument returns an
    `int`, a `float` argument returns a `float`) holding that number's
    non-negative magnitude — `abs(-7)` and `abs(7)` both return `7`. It is
    implemented in C as part of CPython, not written in Python itself; its
    documented contract lives in Python's official standard-library
    reference under "Built-in Functions," and a reader who wants to see the
    actual C implementation, rather than take this description on faith,
    can find it in the CPython source repository.
  - *Its use:* This lesson wraps a subtraction in `abs()` specifically
    because subtraction alone depends on argument order (`3 - 9` is `-6`,
    but `9 - 3` is `6`) while a *distance* must not — `abs()` is the one
    call that makes the two agree.

---

## Concept Unit: A Geometric Problem Has a Common Shape

### The Problem

Every domain this curriculum eventually touches — CAD, CAM, games,
simulation, rendering — keeps asking variations of the same handful of
questions: is this near that? does this fit inside that? what happens if I
move this? A brand-new reader meeting all of them at once, spread across
different tools and different vocabularies, has no way to notice they're the
same handful of questions. Before writing a single geometric algorithm, this
lesson names the shape that every one of those questions has in common, so
that a genuinely new-looking problem forty lessons from now can still be
recognized as an old friend.

*A note on method:* this particular unit teaches a domain taxonomy — six
vocabulary words for classifying geometric problems — not a new Python
language construct. The Concept Isolation Rule's throwaway-code isolation
step (below) applies to language constructs; there isn't one here to
isolate. The first actual construct this lesson introduces, `abs()`, gets
its own isolated lab in Concept Unit 2.

### A Concrete Case, Before Any Code

Picture two robots confined to a single track, marked out in whole-number
positions:

```
Track:  0    1    2    3    4    5    6    7    8    9   10
                        A                            B
```

Every term above maps onto this one tiny scene:

- **Object:** robot A's position (3) and robot B's position (9) — each
  nothing more than a number. Formalizing what a geometric object actually
  is — and why a single number is enough on a 1D track but won't be enough
  once robots can move in a plane — is Lesson 2, Points, Vectors, and
  Directions.
- **Relationship:** "how far apart are A and B" — a connection between the
  two objects, not a fact about either one alone.
- **Measurement:** turning that relationship into a number — 6. This
  lesson builds exactly this one, for the simplest possible case (one
  dimension, one operation). Lesson 9, Norms and Distance, generalizes it
  to any number of dimensions once vectors exist to generalize it with.
- **Query:** a question built out of a measurement — "is A within 5 units
  of B?" This lesson names the idea but doesn't build one; Lesson 19,
  Geometric Predicates, is where questions like this get built and answered.
- **Constraint:** a rule the scene must keep obeying — "A and B may never
  get closer than 2 units." Full treatment is much later, once there's a
  real system to enforce rules against: Lesson 279, Geometric Constraints.
- **Transformation:** an action that produces a new position from an old one
  — "move A forward by 4 units" turns position 3 into position 7. Lesson 12,
  Coordinate Transformations, and Lesson 13, Affine Transformations, build
  this properly.

This lesson's actual code covers exactly two of these six words —
**object** and **measurement** — because those are the two a reader can
build something real with immediately, using only variables, a function, and
one built-in call. The other four are named now, anchored in one concrete
scene, so that when their real lessons arrive the words won't be new — only
the machinery behind them will be.

### Project Change

- **Reference Source:** No reference counterpart — this is a from-scratch
  addition. This is the first lesson in the curriculum; there is no prior
  project state and no reference implementation this conceptual opening
  corresponds to.
- **Files affected:** `geometry_lesson_01.py` — created.
- **Change type:** add (new file).
- **Location:** not applicable — a brand-new file has nothing to locate a
  position within.
- **Dependencies:** a Python 3 interpreter. Nothing else.

### The New Code

Type this into a new file named `geometry_lesson_01.py`:

```python
robot_a = 3
robot_b = 9

print(robot_a, robot_b)
```

### The Updated Project

Skipped deliberately: step 5's code above is the entire new file, with
nothing surrounding it yet, which is exactly the case this step exists to be
skipped for.

### Mechanical Walkthrough

Every syntactic element in the block above, in order:

- `robot_a = 3` — a variable assignment, giving the name `robot_a` to the
  value `3`. Genuinely basic, already-established syntax per this lesson's
  assumed background — no restatement owed.
- `robot_b = 9` — the same construct, reused immediately. Same category,
  same reasoning.
- `print(robot_a, robot_b)` — a call to the built-in `print()` function with
  two comma-separated arguments. Calling `print()` at all is part of this
  lesson's assumed background, so the call itself is basic and reusable
  without restatement — but it's worth one clause noting the specific
  behavior this lesson relies on: `print()` joins comma-separated arguments
  with a single space when it writes them out, which is why the output
  below shows `3 9` rather than `39` or two separate lines.

### CS Lens

Sorting a problem into "which of these objects, which relationship between
them, which measurement, which query, which constraint, which
transformation" is itself a **domain-modeling taxonomy** — a fixed,
small vocabulary used to describe an unbounded number of specific
situations without inventing new terms for each one.

```
Also recognized in: relational databases (entities as objects, foreign
keys and CHECK clauses as constraints, joins as relationships, SELECT
statements literally called queries), physics engines (bodies as objects,
forces as relationships, collision limits as constraints), spreadsheet
models (cells as objects, formulas as relationships, data-validation
rules as constraints), and version control (commits as objects, a merge
conflict as an unresolved relationship between two histories)
```

### SE Lens

The design principle at work is establishing a **shared vocabulary before
the algorithms that use it** — naming the six recurring roles a piece of
geometry can play, before any lesson needs all six at once. The alternative
not chosen: teach each geometric algorithm (distance here, containment
there, intersection somewhere else) as its own self-contained recipe, with
its own local terms, and let the reader notice the pattern themselves,
eventually, if they ever do.

That alternative is not free of upside — it defers abstraction until the
reader has enough concrete cases to justify it, which is generally sound
teaching practice, and is exactly why this lesson pays for its own
vocabulary immediately with one small, fully concrete scene (the two
robots) rather than defining the six terms in the abstract and hoping they
stick. The real cost being paid here, honestly: four of the six words
(relationship, query, constraint, transformation) are named well before the
reader has built anything with them, which risks feeling unmotivated until
their real lessons arrive. The payoff this curriculum is betting on: a
genuinely new-looking problem dozens of lessons from now — gouge detection
in a CAM toolpath, say — becomes recognizable on sight as "a query, built
from a measurement, checked against a constraint," instead of landing as an
unrelated new trick to memorize.

### Commands Needed

This is the first command this curriculum needs, so here it is in full.
From a terminal, in the same folder as the file:

```
python geometry_lesson_01.py
```

- `python` — the program that reads a `.py` file and runs it, executing its
  instructions one at a time, top to bottom, in the order they're written.
- `geometry_lesson_01.py` — the one argument: the path to the file to run.
  Because the terminal's current folder already contains it, the plain
  filename is enough — no folder path is needed.
- Success looks like: the program's output appears, and the terminal returns
  to a normal prompt with no error text. If instead you see something like
  `python: command not found` (or, on Windows, `'python' is not recognized as
  an internal or external command`), Python isn't on your system's PATH yet
  — fixing that is covered by Python's own installation instructions and is
  outside the scope of this lesson.

### Run It

```
3 9
```

Verified by actually running the file above.

### Connection

Two geometric objects now exist in the program, as plain numbers, and this
lesson's six-word vocabulary exists for talking about whatever comes next.
What doesn't exist yet is any way to turn "the relationship between them"
into an actual computed measurement — that's the whole of Concept Unit 2.

---

## Concept Unit: Turning a Relationship into a Measurement — Writing a `distance` Function

### The Problem

Looking at the printed line `3 9`, a person can eyeball that the two robots
are "6 apart." A program can't eyeball anything — it can only run the exact
steps it's given, on whatever two numbers it's handed, not just the two
sitting in this file today. The relationship named a moment ago — "how far
apart are these two objects" — has to become a piece of code that computes
an answer for *any* two positions, not a comment describing this one pair.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch addition,
  same as Concept Unit 1.
- **Files affected:** `geometry_lesson_01.py` — modified.
- **Change type:** add.
- **Location:** appended below the `print(robot_a, robot_b)` line added in
  Concept Unit 1.
- **Dependencies:** none beyond what Concept Unit 1 already established.
  `abs()` needs no `import` — it's always available.

### The New Code

Add this below the existing two lines:

```python
def distance(a, b):
    return abs(a - b)


print(distance(robot_a, robot_b))
print(distance(robot_b, robot_a))
```

### The Updated Project

```python
robot_a = 3
robot_b = 9

print(robot_a, robot_b)


def distance(a, b):                    # ← new
    return abs(a - b)                  # ← new


print(distance(robot_a, robot_b))      # ← new
print(distance(robot_b, robot_a))      # ← new
```

The file as a whole now does two things: it still defines and prints the two
robot positions from Concept Unit 1, and it now also defines a reusable way
to measure the separation between *any* two positions, then immediately uses
that measurement twice — once in each argument order — to prove the answer
doesn't depend on which robot gets named first.

### Isolating `abs()`

This is exactly what `abs(a - b)` in the code above is doing, isolated. In a
separate, throwaway file — not `geometry_lesson_01.py` — type and run:

```python
print(abs(-7))
print(abs(7))
```

```
7
7
```

Verified by actually running this file. What this proves: it doesn't matter
that `-7` sits on the negative side of zero while `7` sits on the positive
side — `abs()` maps both to the same non-negative number, `7`. This is
called **absolute value**: the magnitude of a number with its direction
thrown away.

This two-line file is discarded now — it will not appear in the project
again. Its only job was to isolate exactly what `abs()` does, on its own,
before trusting it inside `distance()` above.

### Mechanical Walkthrough

Every syntactic element in this unit's new code, in order:

- `def distance(a, b):` — a function definition with two parameters. `def`,
  the function-name/parameter syntax, and parameters themselves are
  genuinely basic, already-established syntax per this lesson's assumed
  background — no restatement owed.
- `return abs(a - b)` — a `return` statement, itself basic and assumed, but
  its expression has two parts worth separating:
  - `a - b` — ordinary subtraction, also basic — except for one fact worth
    stating plainly: this expression's *sign* depends on argument order.
    When `distance(robot_a, robot_b)` runs, `a` is `3` and `b` is `9`, so
    `a - b` is `3 - 9`, which is `-6`. When the arguments are swapped, `a -
    b` becomes `9 - 3`, which is `6`. Left alone, this function would report
    two different "distances" for the same pair of robots depending only on
    which one you asked about first — which is exactly the bug the next
    element fixes.
  - `abs(a - b)` — first appearance, now grounded by the isolated lab just
    above: this wraps whatever `a - b` produced, negative or positive, and
    returns its non-negative magnitude, which is why the two calls below
    agree with each other despite computing opposite-signed subtractions
    internally.
- `print(distance(robot_a, robot_b))` — a call to `distance` nested inside a
  call to `print`; both the nesting and `print` itself are basic, assumed
  syntax. The specific argument order — `robot_a` first — is the "as
  written" case, worth noting only because the next line deliberately
  reverses it.
- `print(distance(robot_b, robot_a))` — the same call with arguments
  reversed. Not new syntax; its entire purpose is empirical: proving, by
  actually running both orders, that `abs()` really does make the order
  stop mattering, rather than just asserting it.

### CS Lens

Wrapping "the relationship between two things" in a named function —
`distance(a, b)` instead of writing `abs(a - b)` again at every place a
distance is needed — is **function abstraction**: giving a computation a
name and a fixed input/output contract, so callers reason about *what* it
computes, not *how*.

```
Also recognized in: spreadsheet formulas (=ABS(A1-B1) named once, then
referenced everywhere instead of retyped), SQL scalar functions and
computed columns, mathematical notation itself (defining f(x, y) once and
then writing f(3, 9) instead of the formula every time), and combinational
logic blocks in digital circuit design (a fixed box with defined inputs
and outputs, reused wherever that exact computation is needed)
```

### SE Lens

The design principle is **naming a relationship instead of inlining it**.
The alternative not chosen: skip the function entirely and write
`abs(robot_a - robot_b)` directly at the one place it's needed right now.

For exactly one use, in one file, that alternative would cost nothing — a
function is arguably overkill for a single call site. The real tradeoff only
shows up looking forward: this exact relationship, "how far apart are two
things," is asked again and again for the rest of this curriculum, in
different shapes — Lesson 9 generalizes it to vectors, ray-triangle
intersection later reuses a version of it, and CAM's gouge detection reduces
to a distance question wearing different words. Giving it one name now means
every later lesson can call `distance(...)` and trust it means the same
guaranteed thing, instead of re-deriving — and potentially re-breaking, by
forgetting the `abs()` — the same three characters of logic by hand each
time it's needed. The honest cost of naming it: a reader now has to look up
what `distance` does instead of seeing the whole computation at the call
site — worth paying here because the relationship recurs constantly; not
worth paying for a calculation that only ever happens once.

### Commands Needed

Same command as Concept Unit 1 — `python geometry_lesson_01.py`. Nothing new
here: this re-runs the same file after adding to it, not a new tool.

### Run It

```
3 9
6
6
```

Verified by actually running the updated file above.

### Connection

Concept Unit 1 gave two geometric objects names; this unit gave their
relationship a name too, and proved — by actually running both argument
orders, not just asserting it — that the measurement it produces doesn't
depend on which object gets asked about first. Everything this curriculum
builds from here is a variation on this same three-step shape: represent,
name the relationship, compute the measurement.

---

## Connect the Pieces

One concrete value, traced through everything this lesson built, start to
finish:

1. `robot_a = 3` and `robot_b = 9` — two geometric objects (Concept Unit 1's
   vocabulary made concrete) now exist as plain numbers in the program.
2. `distance(robot_a, robot_b)` is called — inside `distance`, the parameter
   `a` is bound to `3` and `b` is bound to `9`.
3. `a - b` evaluates to `3 - 9`, which is `-6` — negative, because the first
   argument happened to be the smaller number.
4. `abs(-6)` evaluates to `6` — the sign is discarded, only the magnitude
   survives.
5. `distance` returns `6`; the enclosing `print(...)` writes `6` to the
   terminal — this lesson's first real geometric *measurement*.
6. `distance(robot_b, robot_a)` runs the same function with the arguments
   swapped — `a` is now `9`, `b` is now `3` — so `a - b` evaluates to `9 -
   3`, which is `6`, positive this time. `abs(6)` is still `6`.
7. Both calls print `6`. The relationship "how far apart are robot A and
   robot B" produced the same measurement regardless of which robot the
   function was asked about first — which is the entire property `abs()`
   was added to guarantee.

## What Breaks Without This

Remove `abs()` and run the same two calls:

```python
def distance(a, b):
    return a - b


print(distance(robot_a, robot_b))
print(distance(robot_b, robot_a))
```

```
-6
6
```

Verified by actually running this broken version. This isn't a crash — it's
worse: the program runs cleanly and produces two *different* answers for the
exact same pair of robots, depending only on which one was named first in
the function call. A "distance" that disagrees with itself depending on
argument order isn't measuring separation at all; it's just reporting
whichever subtraction happened to be typed. Restore the `abs()` call before
continuing.

## Exercises

1. Add a third robot, `robot_c = -4`. By hand, on paper, compute what
   `distance(robot_a, robot_c)` and `distance(robot_b, robot_c)` should be —
   then add the calls to the file and check your program against your own
   arithmetic.
2. Predict, before running it, what `distance(5, 5)` returns — the distance
   between a robot and itself. Add the call and verify.
3. Predict, before running it, what `distance(-3, -9)` returns — both
   positions already negative, unlike anything tried above. Add the call and
   verify that `abs()` still produces the right, order-independent answer
   even when neither input started out positive.

## Definition of Done

- [ ] `geometry_lesson_01.py` exists and runs with no errors via
      `python geometry_lesson_01.py`.
- [ ] Running it prints `3 9`, then `6`, then `6` — matching this lesson's
      verified output exactly.
- [ ] You can explain, without looking at the file, why `distance(a, b)`
      needs `abs()`, and what the program would still do (wrongly, not by
      crashing) if `abs()` were removed.
- [ ] You can name, from memory, the six words this lesson introduced for
      classifying a geometric problem — object, relationship, measurement,
      query, constraint, transformation — and say which one this lesson
      actually wrote code for.
- [ ] Commit your work with a message explaining *why* it exists, not just
      what changed — for example:
      `git commit -m "Add distance as the first geometric measurement: a relationship needs a name before it can be reused"`,
      not `git commit -m "add distance function"`.

Next: Lesson 2 — Points, Vectors, and Directions, where a single number
stops being enough to describe a position, and "location" and "displacement"
become two different kinds of geometric object.
