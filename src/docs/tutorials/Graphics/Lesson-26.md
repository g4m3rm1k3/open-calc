# Lesson 26: Orientation Tests

**What you will build:** `signed_area`, giving a formal name to the exact
quantity Lesson 20 already computed without naming it, and `orientation`,
a numeric twin of Lesson 19's `classify_turn` that returns `1`, `-1`, or
`0` instead of a string. The transferable problem: `classify_turn`'s
string answers are perfect for branching on — an `if`/`elif`/`else`
reads them naturally — but a string can't be multiplied, summed, or
compared numerically, and this lesson's own closing use, testing whether
two points fall on the same side of a line, needs exactly that.

**What you need to know first:** Lesson 8's `cross_product` and its
anticommutativity proof, Lesson 19's `classify_turn` and its own
left/right/straight reasoning, and Lesson 20's own unnamed signed-area
computation.

**Assumed background (outside this curriculum):** unchanged from Lessons
1–25.

**Terms introduced in this lesson:**

- **Signed area** — twice the actual area of the triangle formed by three
  points, with a sign that encodes their orientation: positive for
  counter-clockwise, negative for clockwise, zero for collinear. Why:
  Lesson 20 already computed this exact value (`cross_product(...) / 2`)
  to check a pocket wasn't degenerate, without ever naming what the
  number itself represents beyond "the area" — this lesson names both
  what it measures and why its sign matters just as much as its
  magnitude.

**Objects and methods used:**

None. `signed_area` and `orientation` are hand-authored project code,
built from Lesson 2 and 8's own reused functions.

---

## Concept Unit: Signed Area — Naming What classify_turn's Sign Actually Measures

### The Problem

Lesson 20 computed `cross_product(...) / 2` to check a pocket had real,
non-degenerate area, and called the result "the area" without ever
explaining why it can come out negative, or what that negative sign
actually communicates. Name the quantity properly before building
anything new with it.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch addition,
  continuing the pattern of Lessons 1–25.
- **Files affected:** `geometry_lesson_26.py` — created, as a new file
  for this lesson.
- **Change type:** add (new file).
- **Location:** not applicable — a brand-new file has nothing to locate a
  position within.
- **Dependencies:** a Python 3 interpreter. Nothing else.

### The New Code

```python
def subtract_points(a, b):
    return (a[0] - b[0], a[1] - b[1])


def cross_product(a, b):
    return a[0] * b[1] - a[1] * b[0]


def signed_area(a, b, c):
    return cross_product(subtract_points(b, a), subtract_points(c, a)) / 2


print(signed_area((0, 0), (4, 0), (0, 3)))
print(signed_area((0, 0), (0, 3), (4, 0)))
```

### The Updated Project

Skipped deliberately: the code above is the entire new file, with nothing
surrounding it yet — the same situation every lesson's first unit has
been in so far.

*A note on method:* `subtract_points` and `cross_product` are Lesson 2
and 8's own functions, retyped unchanged; `signed_area` is Lesson 20's
own computation, given a name and its own function for the first time.
No new Python construct appears here, so no isolated throwaway lab is
needed.

### Mechanical Walkthrough

Every syntactic element in the New Code block above, in order:

- `def subtract_points(a, b): ...`, `def cross_product(a, b): ...` —
  Lesson 2 and 8's own functions, retyped unchanged. No re-explanation
  owed, per the Repetition Rule.
- `def signed_area(a, b, c): return cross_product(subtract_points(b, a),
  subtract_points(c, a)) / 2` — Lesson 20's own computation, now given
  its own name. `cross_product` of the two edge vectors out of `a`
  computes exactly twice the triangle's actual area — dividing by `2`
  recovers the real area, with whatever sign the cross product itself
  carried.
- `print(signed_area((0, 0), (4, 0), (0, 3)))` — the same right triangle
  Lesson 20 used, points listed counter-clockwise. Prints `6.0`.
- `print(signed_area((0, 0), (0, 3), (4, 0)))` — the identical three
  points, with the last two swapped — now listed *clockwise*. Prints
  `-6.0`: the exact same magnitude, `6.0`, but negated.

**Why the sign flips.** Swapping `b` and `c` swaps the two vectors handed
to `cross_product`, and Lesson 8 already proved `cross_product(u, v) =
-cross_product(v, u)` for any two vectors at all. The triangle these
three points form hasn't changed size — its real area is still `6.0` —
but listing its corners in the opposite order reverses which way a
walk around them turns, and `signed_area`'s sign is tracking that turn
direction, not just the enclosed space.

### CS Lens

Encoding both a magnitude and a direction-like property in a single
signed number, rather than tracking them as two separate values, is a
common and efficient representational choice.

```
Also recognized in: physics simulations (a signed velocity or signed
torque encodes both "how much" and "which way" in one number, the same
way signed area encodes both "how big" and "which winding order"),
accounting and finance (a signed balance — positive for credit, negative
for debit — is the same one-number-two-facts idea applied to money), and
computer graphics culling (a triangle's signed area, computed after
projecting it to screen space, is exactly how many real-time renderers
decide whether a triangle faces the camera or faces away, without a
separate direction flag)
```

### SE Lens

The design principle is **naming a quantity by what it actually measures,
not just by the operation that produces it**. The alternative not chosen:
leave the computation as an inline expression wherever it's needed, the
way Lesson 20 did, rather than giving it its own named function.

That alternative avoided one extra function definition. The real cost it
pays: Lesson 20's own reader had to recognize "oh, `cross_product(...) /
2` is computing an area" from the surrounding context every time it
appeared, with nothing in the code itself saying so. A named
`signed_area` function makes every future call site self-documenting —
`signed_area(a, b, c)` states its own purpose, the way `cross_product`
itself never had to explain what a bare `a[0]*b[1] - a[1]*b[0]` was doing
inline.

### Commands Needed

`python geometry_lesson_26.py` — same interpreter and command as every
prior lesson.

### Run It

```
6.0
-6.0
```

Verified by actually running the file above.

### Connection

`signed_area`'s magnitude and sign are both now understood. The next
unit builds a predicate that reads only the sign, as a number instead of
a string.

---

## Concept Unit: A Numeric Orientation Predicate

### The Problem

Lesson 19's `classify_turn` returns `"left"`, `"right"`, or `"straight"`
— ideal for branching on, but a string can't be multiplied, summed, or
compared the way a plain number can. Build the same three-way answer as
a number instead, so it can be used arithmetically.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch addition.
- **Files affected:** `geometry_lesson_26.py` — modified.
- **Change type:** add.
- **Location:** appended below the `print(signed_area((0, 0), (0, 3), (4,
  0)))` line added in Concept Unit 1.
- **Dependencies:** Concept Unit 1's `subtract_points`, `cross_product`.

### The New Code

```python
def orientation(a, b, c):
    turn_value = cross_product(subtract_points(b, a), subtract_points(c, a))

    if turn_value > 0:
        return 1
    elif turn_value < 0:
        return -1
    else:
        return 0


print(orientation((0, 0), (4, 0), (0, 3)))
print(orientation((0, 0), (0, 3), (4, 0)))
print(orientation((0, 0), (4, 0), (2, 0)))
```

### The Updated Project

```python
def subtract_points(a, b):
    return (a[0] - b[0], a[1] - b[1])


def cross_product(a, b):
    return a[0] * b[1] - a[1] * b[0]


def signed_area(a, b, c):
    return cross_product(subtract_points(b, a), subtract_points(c, a)) / 2


print(signed_area((0, 0), (4, 0), (0, 3)))
print(signed_area((0, 0), (0, 3), (4, 0)))


def orientation(a, b, c):                                                # ← new
    turn_value = cross_product(subtract_points(b, a), subtract_points(c, a))  # ← new
                                                                           # ← new
    if turn_value > 0:                                                   # ← new
        return 1                                                         # ← new
    elif turn_value < 0:                                                 # ← new
        return -1                                                        # ← new
    else:                                                                # ← new
        return 0                                                         # ← new


print(orientation((0, 0), (4, 0), (0, 3)))                               # ← new
print(orientation((0, 0), (0, 3), (4, 0)))                               # ← new
print(orientation((0, 0), (4, 0), (2, 0)))                               # ← new
```

The file now has both a signed magnitude (`signed_area`) and a plain
numeric sign (`orientation`) for the identical underlying `cross_product`
computation.

*A note on method:* `orientation`'s own `if`/`elif`/`else` structure is
identical to Lesson 19's `classify_turn`, already given full treatment
there — no new Python construct appears here.

### Mechanical Walkthrough

Every syntactic element in the New Code block above, in order:

- `def orientation(a, b, c): ...` — first appearance: the same overall
  shape as Lesson 19's `classify_turn`.
- `turn_value = cross_product(subtract_points(b, a), subtract_points(c,
  a))` — already-basic reuse, identical to `classify_turn`'s own first
  line.
- `if turn_value > 0: return 1`, `elif turn_value < 0: return -1`, `else:
  return 0` — a **hard concept reappearing**: `if`/`elif`/`else` itself,
  already given full treatment in Lesson 19, no re-explanation owed. The
  genuinely new choice is what each branch *returns* — `1`, `-1`, and `0`
  instead of `classify_turn`'s `"left"`, `"right"`, and `"straight"` —
  the identical three-way classification, expressed as plain integers.
- `print(orientation((0, 0), (4, 0), (0, 3)))` — the same
  counter-clockwise triangle from Concept Unit 1. Prints `1`.
- `print(orientation((0, 0), (0, 3), (4, 0)))` — the same points,
  clockwise order. Prints `-1`.
- `print(orientation((0, 0), (4, 0), (2, 0)))` — `(2, 0)` sits exactly on
  the segment between the first two points: collinear. Prints `0`.

**Confirming the two predicates agree.** `orientation`'s three outputs —
`1`, `-1`, `0` — correspond exactly to `classify_turn`'s `"left"`,
`"right"`, `"straight"`, on the identical inputs, because both functions
compute the identical `turn_value` and sort it into the identical three
cases. Neither predicate is more "correct" than the other; they're the
same underlying test, shaped for two different uses.

### CS Lens

Representing the same three-way classification two different ways — a
readable label for branching, a plain number for arithmetic — depending
on what the caller actually needs to *do* with the result, is a real,
recurring design choice.

```
Also recognized in: comparison functions across many languages (Python's
own sorting machinery, and languages like C and Java, define "compare
two things" as a function returning a negative number, zero, or a
positive number — this exact `-1`/`0`/`1` shape — specifically so sort
algorithms can use the result arithmetically, not just branch on it),
enum-to-integer conversions (many APIs offer both a readable named
constant and its underlying numeric value for the same status code, for
the same two audiences), and signal processing (a comparator circuit's
output is sometimes read as a boolean "which way" and sometimes as a
signed value fed directly into further arithmetic, depending on what the
rest of the circuit needs)
```

### SE Lens

The design principle is **choosing a result's shape based on what callers
will do with it**, rather than picking one representation and forcing
every use case through it. The alternative not chosen: delete
`classify_turn` now that `orientation` exists, since they answer the
identical question.

That alternative would leave exactly one predicate to maintain instead of
two. The real cost it pays: every future lesson that wants to *branch* on
a turn direction — the common case, matching most of this curriculum's
own usage since Lesson 19 — would have to compare `orientation`'s numeric
result against `1`, `-1`, and `0` by hand instead of reading a
self-explaining string, and every future lesson that wants to *compute*
with a turn direction — this lesson's own closing use — would have no
numeric form to reach for at all if only `classify_turn` remained.
Keeping both, built from the identical underlying `cross_product` call,
costs one small extra function and guarantees they can never quietly
disagree.

### Commands Needed

`python geometry_lesson_26.py` — same command as Concept Unit 1. Nothing
new here.

### Run It

```
6.0
-6.0
1
-1
0
```

Verified by actually running the updated file above.

### Connection

`orientation` reproduces `classify_turn`'s own answers as plain numbers.
Connect the Pieces, below, puts that numeric form to work in a way a
string never could.

---

## Connect the Pieces

One concrete line and three points, traced through both of this lesson's
predicates:

1. `a = (0, 0)`, `b = (4, 0)` define a reference line; `c = (0, 3)` sits
   above it.
2. `signed_area(a, b, c)` comes out to `6.0`; `orientation(a, b, c)`
   comes out to `1` — the same underlying `cross_product`, read two ways.
3. `orientation(a, b, (1, 1))`, a second point above the same line, also
   comes out to `1` — the identical sign as `c`.
4. `orientation(a, b, (1, -1))`, a point below the line, comes out to
   `-1` — the opposite sign.
5. Multiplying `orientation(a, b, c)` by each of these: `1 * 1 = 1`
   (positive — same side as `c`), `1 * -1 = -1` (negative — opposite side
   from `c`). This multiplication is exactly what a string-based
   `classify_turn` result could never do directly.

## What Breaks Without This

`orientation`'s whole reason for existing, beyond `classify_turn`, is
that its result can be used arithmetically. Prove a real, useful case:
testing whether two points fall on the same side of a line by
multiplying their orientation signs, reusing this lesson's own reference
line:

```python
def subtract_points(a, b):
    return (a[0] - b[0], a[1] - b[1])


def cross_product(a, b):
    return a[0] * b[1] - a[1] * b[0]


def orientation(a, b, c):
    turn_value = cross_product(subtract_points(b, a), subtract_points(c, a))

    if turn_value > 0:
        return 1
    elif turn_value < 0:
        return -1
    else:
        return 0


line_a = (0, 0)
line_b = (4, 0)

reference_point = (0, 3)
above_point = (1, 1)
below_point = (1, -1)

reference_side = orientation(line_a, line_b, reference_point)
above_side = orientation(line_a, line_b, above_point)
below_side = orientation(line_a, line_b, below_point)

print(reference_side * above_side)
print(reference_side * below_side)
```

```
1
-1
```

Verified by actually running this. `reference_side * above_side` comes
out positive: both points are on the *same* side of `line_a`–`line_b`.
`reference_side * below_side` comes out negative: `below_point` is on the
*opposite* side. Try to write this exact same-side test using
`classify_turn`'s string results instead, and there's no equivalent
operation — `"left" * "left"` is not valid Python at all, and would need
its own `if`/`elif`/`else` translation step just to ask a question
`orientation`'s numeric form answers with one multiplication. This isn't
a hypothetical convenience: a real point-in-triangle test, which Lesson
35 builds toward, is exactly three of these same-side checks run
together — one per edge of the triangle — and every one of them depends
on `orientation`'s result being a number that can be multiplied and
compared, not a label that can only be branched on.

## Exercises

1. Using `orientation`, test whether `(2, 0)` — a point exactly on
   `line_a`–`line_b` — gives a same-side or opposite-side result when
   multiplied against `reference_side`. Explain what a same-side test
   built this way actually reports for a point exactly on the line,
   rather than clearly on either side.
2. Build a third line, from `(0, 0)` to `(0, 4)` (a vertical line this
   time), and run the same same-side multiplication test from this
   lesson's closing section against two new points, one on each side.
   Confirm the technique works identically for a line in a different
   direction.
3. Using both `orientation` and `classify_turn` on the same three points,
   confirm for at least three different point triples that
   `orientation`'s `1`/`-1`/`0` and `classify_turn`'s
   `"left"`/`"right"`/`"straight"` always agree, and explain, in your own
   words, why they're guaranteed to, rather than merely happening to.

## Definition of Done

- [ ] `geometry_lesson_26.py` exists and runs with no errors via `python
      geometry_lesson_26.py`.
- [ ] Running it prints `6.0`, `-6.0`, `1`, `-1`, `0`, `1`, then `-1` —
      matching this lesson's verified output exactly.
- [ ] You can explain, without looking at the file, what `signed_area`'s
      sign communicates that its magnitude alone does not.
- [ ] You can explain why `orientation` returns a number while
      `classify_turn` returns a string, and name one real thing the
      numeric form can do that the string form cannot, using this
      lesson's own same-side multiplication example.
- [ ] Commit your work with a message explaining *why* it exists, not just
      what changed — for example:
      `git commit -m "Name signed area and add a numeric orientation predicate for arithmetic use"`,
      not `git commit -m "add orientation function"`.

Next: Lesson 27 — Collinearity, which returns to Lesson 18's own
`is_point_on_line` and this lesson's `orientation` at greater depth,
addressing collinearity for more than three points at once.
