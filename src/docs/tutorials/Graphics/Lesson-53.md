# Lesson 53: Quaternion Composition

**What you will build:** no new function — this lesson's real subject is
proof that Lesson 52's `quaternion_multiply` already *is* rotation
composition, the same way Lesson 48 discovered that `multiply_matrices`
already composed rotation matrices without needing any new machinery of
its own. The transferable problem: Lesson 52 built `quaternion_multiply`
to make the sandwich product (`q * p * conjugate(q)`) work at all, but
never checked whether multiplying two *rotation* quaternions together
produces a third quaternion that correctly represents "apply this
rotation, then that one." This lesson checks that directly, then goes
one step further than Lesson 48 did: with three rotations composed
together instead of two, does it matter how the two required
multiplications are grouped? Lesson 48 never had to ask, because it
only ever composed exactly two matrices at a time.

**What you need to know first:** Lesson 52's `quaternion_multiply`,
`rotate_by_quaternion`, and `quaternion_norm`. Lesson 48's own
right-argument-applies-first convention for `multiply_matrices` and its
own proof that different-axis rotations don't commute — this lesson
checks whether both facts still hold for quaternions, rather than
assuming a different representation is exempt.

**Assumed background (outside this curriculum):** unchanged from Lessons
1–52.

**Terms introduced in this lesson:**

- **associative operation** — an operation where, given three or more
  values combined in a fixed order, it doesn't matter which adjacent
  pair gets combined first: `(a ⊕ b) ⊕ c` equals `a ⊕ (b ⊕ c)`. It
  exists as a term here because it's a genuinely different property
  from **commutative** (Lesson 48's own term, meaning the *order* of the
  values doesn't matter) — this lesson's own closing proves directly
  that quaternion composition has one of these properties but not the
  other, which would be easy to blur together without separate names.
  Ordinary subtraction is a case where *neither* holds
  (`(10 - 5) - 2 ≠ 10 - (5 - 2)`, and `10 - 5 ≠ 5 - 10`), which is why
  this property can't just be assumed for free.

**Objects and methods used:**

None new.

---

## Concept Unit: `quaternion_multiply` Already Is Composition

### The Problem

Lesson 48 found that `multiply_matrices`, built for entirely general
matrices, already composed two rotation matrices correctly with no
changes needed. `quaternion_multiply` was built in Lesson 52 for one
specific purpose — making the sandwich product work — and has never
been checked against the same question: does multiplying two rotation
quaternions together produce a third quaternion that, applied once,
matches applying the two original rotations one after another?

### Project Change

- **Reference Source:** No reference counterpart — this unit verifies
  existing project code (`quaternion_multiply`, Lesson 52) against a new
  use (rotation composition) rather than adding new project code, the
  same pattern Lesson 48's own third Concept Unit already used for
  `multiply_matrices`.
- **Files affected:** none — verification only.
- **Change type:** N/A.
- **Location:** N/A.
- **Dependencies:** `quaternion_multiply`, `rotate_by_quaternion`
  (Lesson 52).

### The New Code

```python
p = (2, -1, 7)
q1 = quaternion_from_axis_angle((0, 0, 1), 40)
q2 = quaternion_from_axis_angle((1, 0, 0), 40)

nested = rotate_by_quaternion(rotate_by_quaternion(p, q2), q1)
composed = quaternion_multiply(q1, q2)
via_composed = rotate_by_quaternion(p, composed)
print("nested (apply q2 first, then q1) =", nested)
print("quaternion_multiply(q1, q2), applied once =", via_composed)
```

### Real Output

Running the prints above:

```
nested (apply q2 first, then q1) = (4.916724140909804, -2.748076005003115, 4.719523492146308)
quaternion_multiply(q1, q2), applied once = (4.916724140909805, -2.7480760050031146, 4.719523492146307)
```

Matching, down to floating-point noise. The same
right-argument-applies-first convention Lesson 48 already found for
`multiply_matrices(A, B)` (which applies `B` first) holds here too:
`quaternion_multiply(q1, q2)` applies `q2` first, and `q1` second — `q2`
is the *second*, rightmost argument, but the *first* rotation to run.
Confirm the reverse order actually differs, rather than assuming it
does by analogy with matrices alone:

```python
composed_reversed = quaternion_multiply(q2, q1)
via_reversed = rotate_by_quaternion(p, composed_reversed)
print("quaternion_multiply(q2, q1), applied once =", via_reversed)
```

Real output:

```
quaternion_multiply(q2, q1), applied once = (2.1748764959244955, -4.101529603627032, 5.6962590476598125)
```

A genuinely different point — not floating-point noise, every component
changed — confirming quaternion composition, like matrix composition
before it, is order-sensitive between different axes. One more property
worth checking before trusting `composed` as a real rotation at all:
its own length.

```python
print("quaternion_norm(composed) =", quaternion_norm(composed))
```

Real output:

```
quaternion_norm(composed) = 1.0
```

Exactly `1` — `composed` is itself a genuine unit quaternion, not just a
4-tuple that happens to rotate correctly. This matters because of
Lesson 52's own closing: a non-unit quaternion silently *scales* a point
instead of rotating it. Composing two already-valid unit quaternions via
`quaternion_multiply` never produces that failure mode — the result is
always unit length too, whatever two unit quaternions went in.

### Connecting Sentence

Two quaternions compose correctly into one reusable quaternion, the same
way two matrices did in Lesson 48 — the next question, one Lesson 48
never had to face with only two matrices at a time, is what happens once
a third rotation joins the chain.

---

## Concept Unit: Associativity — Grouping Doesn't Matter, Even Though Order Does

### The Problem

Lesson 49's own `euler_to_matrix` chained two `multiply_matrices` calls
— `multiply_matrices(rz, multiply_matrices(ry, rx))` — grouped one
specific way, with no explanation given at the time for why that
particular grouping was safe to pick arbitrarily. Composing three
quaternions raises the identical question directly: does
`quaternion_multiply(quaternion_multiply(q1, q2), q3)` give the same
result as `quaternion_multiply(q1, quaternion_multiply(q2, q3))` — same
three quaternions, same left-to-right order, different grouping?

### Project Change

- **Reference Source:** No reference counterpart — this unit verifies a
  mathematical property of already-existing code rather than adding new
  project code.
- **Files affected:** none — verification only.
- **Change type:** N/A.
- **Location:** N/A.
- **Dependencies:** `quaternion_multiply` (Lesson 52).

### The New Code

```python
q3 = quaternion_from_axis_angle((0, 1, 0), 25)
left = quaternion_multiply(quaternion_multiply(q1, q2), q3)
right = quaternion_multiply(q1, quaternion_multiply(q2, q3))
print("(q1 * q2) * q3 =", left)
print("q1 * (q2 * q3) =", right)
```

### Real Output

Running the two prints above:

```
(q1 * q2) * q3 = (0.8367724439017011, 0.244213137339192, 0.30532592674633285, 0.3833378394239425)
q1 * (q2 * q3) = (0.8367724439017011, 0.244213137339192, 0.30532592674633285, 0.3833378394239425)
```

Identical, to every digit shown. This is called an **associative
operation**: the *order* of the three quaternions left to right —
`q1`, then `q2`, then `q3` — stays fixed in both lines; only which
adjacent pair gets multiplied *first* changes, and it doesn't affect the
final result. This is exactly what quietly made Lesson 49's own
`multiply_matrices(rz, multiply_matrices(ry, rx))` safe to write with
that specific grouping and no other — matrix multiplication is
associative too, a fact Lesson 49 relied on without ever naming it. This
lesson names it now, for quaternions, with the property actually run and
confirmed rather than assumed by analogy.

### CS Lens

Associativity is a hard concept worth recognizing beyond this one check:

```
Also recognized in: string concatenation ("a" + "b") + "c" equals
"a" + ("b" + "c"), function composition in any language, this
curriculum's own polygon-triangulation area cross-check (Lesson 42,
where summing triangle areas in any order gave the same total),
matrix multiplication generally — the exact property Lesson 49's own
chained multiply_matrices calls depended on without stating it
```

### Connecting Sentence

Grouping three composed rotations is now known to be safe in any order —
the next check is whether the same freedom extends to which rotation
comes *first*, the property this lesson's own Concept Unit 1 already
found the answer to on two different axes, worth confirming once more
on the *same* axis specifically.

---

## Extending the Check: Same-Axis Composition Still Just Adds Angles

**A note on method:** no new concept here — Lesson 48 already
established that same-axis rotations commute while different-axis
rotations don't; this section confirms that same finding holds in
quaternion form specifically, rather than assuming a different
representation changes the underlying geometry. No isolation lab is
owed, per the Repetition Rule.

### Project Change

- **Reference Source:** No reference counterpart — verification only.
- **Files affected:** none.
- **Change type:** N/A.
- **Location:** N/A.
- **Dependencies:** `quaternion_multiply`, `quaternion_from_axis_angle`
  (Lesson 52).

### The New Code

```python
qa = quaternion_from_axis_angle((0, 0, 1), 15)
qb = quaternion_from_axis_angle((0, 0, 1), 50)
composed_same_axis = quaternion_multiply(qb, qa)
direct_65 = quaternion_from_axis_angle((0, 0, 1), 65)
print("compose(15 then 50, same axis) =", composed_same_axis)
print("direct 65 degrees               =", direct_65)
```

### Real Output

Running the two prints above:

```
compose(15 then 50, same axis) = (0.8433914458128857, 0.0, 0.0, 0.5372996083468238)
direct 65 degrees               = (0.8433914458128857, 0.0, 0.0, 0.5372996083468238)
```

Composing a `15°` rotation about `z` with a `50°` rotation about the
*same* axis produces the exact quaternion a direct `65°` rotation would
— angles genuinely add, on a shared axis, matching Lesson 48's own
same-axis result and Lesson 50's own diagnosis of exactly why that
addition breaks down once two *different* axes are involved instead.

### Connecting Sentence

Composition behaves identically to Lesson 48's matrices on every
property checked so far — associative, order-sensitive between
different axes, angle-additive on a shared one. The closing below shows
what happens if `quaternion_multiply`'s own specific formula gets
replaced with a more obvious-looking, but wrong, shortcut.

---

## Closing

### Connect the Pieces

Trace one concrete point through a three-rotation chain, confirming
associativity in a form that actually matters — not just that the two
`left`/`right` quaternions from Concept Unit 2 match each other, but
that both of them, applied to a real point, land in the same place:

```python
p2 = (5, 0, 0)
via_left = rotate_by_quaternion(p2, left)
via_right = rotate_by_quaternion(p2, right)
print("point rotated by (q1*q2)*q3 =", via_left)
print("point rotated by q1*(q2*q3) =", via_right)
```

Real output:

```
point rotated by (q1*q2)*q3 = (-0.14828920144229243, 4.717062363313415, 1.9450434952512297)
point rotated by q1*(q2*q3) = (-0.1482892014422928, 4.717062363313413, 1.94504349525123)
```

Matching, down to floating-point noise — three separate rotations,
composed in one fixed order but grouped two different ways, land the
same real point in the same real place. This is associativity's actual
payoff: a caller chaining several `quaternion_multiply` calls together
never has to think about parenthesization, only about the left-to-right
order the rotations should apply in.

### What Breaks Without This

`quaternion_multiply`'s own Hamilton product (Lesson 52) is a specific,
non-obvious formula — a reader seeing two 4-tuples that need combining
might reasonably reach for the more familiar-looking operation instead:
plain component-wise addition, the way two ordinary vectors combine.
Try it, then check whether it produces the same composed rotation as
`quaternion_multiply(q1, q2)` did in this lesson's own opening unit:

```python
def quaternion_add_WRONG(q1, q2):
    return (q1[0] + q2[0], q1[1] + q2[1], q1[2] + q2[2], q1[3] + q2[3])

def quaternion_normalize(q):
    n = quaternion_norm(q)
    return (q[0] / n, q[1] / n, q[2] / n, q[3] / n)

added = quaternion_add_WRONG(q1, q2)
print("q1 + q2 (raw) =", added, " norm =", quaternion_norm(added))
added_normalized = quaternion_normalize(added)
via_added = rotate_by_quaternion(p, added_normalized)
via_correct = rotate_by_quaternion(p, quaternion_multiply(q1, q2))
print("rotate via normalized (q1 + q2):", via_added)
print("rotate via quaternion_multiply(q1, q2):", via_correct)
```

Real output:

```
q1 + q2 (raw) = (1.8793852415718169, 0.3420201433256687, 0.0, 0.3420201433256687)  norm = 1.9406299088489227
rotate via normalized (q1 + q2): (2.651971329829741, -2.582553013678033, 6.348028670170259)
rotate via quaternion_multiply(q1, q2): (4.916724140909805, -2.7480760050031146, 4.719523492146307)
```

Not close. Adding two quaternions and renormalizing the result to unit
length produces *something* — a plausible-looking unit quaternion that
`rotate_by_quaternion` happily accepts and applies without error — but
it is not the composition of the two original rotations. This is a
real, verified, silently wrong result: nothing about
`quaternion_add_WRONG`'s own output signals that it computed the wrong
thing, and the renormalization step even papers over Lesson 52's own
"non-unit quaternion" warning sign, since the result genuinely does come
out unit length — just not a rotation that means what a caller would
expect. This is exactly why Lesson 52 built the specific, non-obvious
Hamilton product formula instead of something that merely *looks*
like a reasonable way to combine two 4-tuples: composition of rotations
is not a vector-space operation, and treating a quaternion like an
ordinary vector at the one moment that matters most — combining two
rotations — is the specific mistake this lesson's own closing exists to
rule out.

### Exercises

- Confirm associativity holds for a different triple of axes and angles
  than this lesson's own `q1`/`q2`/`q3` — pick your own three axis/angle
  pairs and check both groupings match.
- Confirm that composing a rotation with its own conjugate-built inverse
  (`quaternion_multiply(q, quaternion_conjugate(q))`, from Lesson 52)
  behaves as the *identity* rotation when applied to a point — the point
  should come back completely unchanged.
- Using `quaternion_add_WRONG` from this lesson's own closing, find a
  case (if one exists) where it happens to agree with
  `quaternion_multiply` despite being the wrong operation in general —
  and explain, from what each quaternion's components represent, why
  that specific case is special.

### Definition of Done

- [ ] `quaternion_multiply` was confirmed to correctly compose two
      rotations, matching nested `rotate_by_quaternion` calls, with the
      right-argument-applies-first order stated explicitly and verified
      both ways (matching order and reversed).
- [ ] Associativity was run and confirmed for three real quaternions,
      both as a bare quaternion comparison and as an applied-to-a-point
      comparison — not assumed from the matrix case alone.
- [ ] Same-axis angle-addition was re-confirmed in quaternion form,
      connecting back to Lesson 48's own original finding.
- [ ] The quaternion-addition failure was actually run and its distorted
      result compared against the correct composition, not just
      described.
- [ ] Commit with a message stating *why*: quaternion composition is now
      proven safe to chain in any grouping, still order-sensitive
      between different axes exactly like matrix composition — and the
      commit message should name Lesson 54 (Quaternion Interpolation) as
      the next open question, since composition alone doesn't yet cover
      smoothly blending *between* two rotations.
