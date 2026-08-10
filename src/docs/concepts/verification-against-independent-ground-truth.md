# Concept: Verifying a Guess Against Something That Didn't Make It

**What you'll understand by the end:** why a test your own code writes
and reads back can confirm your code is *internally consistent*, but
can never by itself confirm that your understanding of some external,
undocumented reality is *actually correct* — and what kind of test can.

**Prerequisites:** `automated-testing-unit-test-basics.md`.

## Setup

No install needed — this is a testing/verification idea, illustrated
here with a plain, dependency-free example.

## The Problem

When reverse-engineering an undocumented real system (a file format, an
API, a database schema someone else designed), it's easy to write code
that reads a value, transforms it, writes it back, and reads it again —
and see the round trip succeed. That only proves your *read* function
and your *write* function agree with each other. If both were built on
the same wrong assumption about what a field actually means, they will
always agree, and the test will always pass, while being confidently
wrong about the real world the whole time. Confirming the assumption
itself requires checking against a system that doesn't share it — one
that was never told what you *think* the data means, and will only
behave correctly if your understanding of the *real* meaning is right.

## The Isolated Example

```python
# Two candidate interpretations of an unfamiliar field in some
# undocumented file format: is `value` a radius, or a diameter?
def render_as_radius(value):
    return f"circle with radius {value}"

def render_as_diameter(value):
    return f"circle with radius {value / 2}"

# A "test" that only checks internal consistency -- it will pass no
# matter which interpretation is correct, because both the writer and
# the reader below share the exact same (possibly wrong) assumption.
def write_field(value):
    return value  # imagine this writes `value` to the unfamiliar format

def read_field(raw):
    return raw  # imagine this reads it back

assert read_field(write_field(5)) == 5  # passes either way -- proves nothing
```

**What this proves nothing about:** whether `5` really means "radius 5"
or "diameter 5" in the *real* format this is reverse-engineering — the
round trip above would pass identically under either belief, since
nothing here ever checks against the actual, real system the format
belongs to.

**The real test — checking against an independent authority:**

```
1. Take a real file from the actual, original software.
2. Change only the field in question, in a way that would look very
   different depending on which interpretation is correct (e.g. scale
   it by 1.5x -- a "radius" and a "diameter" interpretation would both
   change the rendered size, but by a distinguishably different amount
   relative to the rest of the shape, or in a case designed to make the
   difference unmistakable).
3. Open the modified file in the *original, real* software -- the one
   authority that was never told your interpretation, and can only
   render it correctly if your change actually means what you think it
   means.
4. Observe: does it look the way your interpretation predicts?
```

**What this proves:** if the original software renders the change
exactly as your interpretation predicted, that interpretation is
confirmed by a system with no stake in your own code being right — the
strongest kind of confirmation available for an undocumented format,
short of the format's own real specification.

## Mechanical Walkthrough

- A self-consistency test (read-your-own-write) can only ever detect
  that your *read* and *write* logic *disagree with each other* — it
  has no way to detect that they *agree on the wrong thing*.
- An independent-authority test introduces a system that shares none of
  your code, none of your assumptions, and was built by people who
  actually knew the real, intended meaning — its behavior is real
  external signal, not a reflection of your own beliefs.
- The change made before the ground-truth check should be chosen to
  make competing interpretations visibly diverge — a change too subtle
  to distinguish "correct" from "plausible but wrong" doesn't actually
  test anything.

## CS Lens

This is the same principle behind **oracle-based testing** — comparing
a system under test against an independent, trusted implementation
(an "oracle") that computes the expected answer by a completely
different, already-trusted path. A self-consistency check has no
oracle at all; it's only checking a system against itself.

Also recognized in: differential testing (running two independent
implementations of the same spec against the same input and comparing
outputs); comparing a reverse-engineered network protocol's behavior
against the real client/server it was reverse-engineered from; checking
a from-scratch reimplementation of a file format by opening its output
in the original, authoritative application.

## SE Lens

The real, easy-to-miss risk this addresses: a whole feature can pass
every internal test — its own unit tests, its own round-trip checks,
its own end-to-end request/response verification — while being built on
a confidently wrong interpretation of what some external, undocumented
data actually means, because nothing internal to the system was ever
capable of catching that specific class of error. The fix costs real
effort (finding or arranging access to the independent authority, and
designing a change stark enough to be unambiguous) but is the only way
to convert "our code agrees with itself" into "our code's model of
reality is actually correct."

## Connection

Builds on `automated-testing-unit-test-basics.md` (this is a different
*kind* of test than a unit test, aimed at a different kind of risk —
wrong assumptions about external reality, not internal logic bugs).

## Try It Yourself

1. Name one place in a project you've worked on (or this one) where a
   file format, API response shape, or database schema was reverse-
   engineered from real data rather than read from an official spec —
   was it ever checked against an independent authority, or only
   against itself?
2. Design a ground-truth test for a *different* ambiguous field (pick
   any real, undocumented value you're unsure how to interpret) —
   describe what change you'd make, and what result would confirm vs.
   refute your current best guess.
3. Consider a case where no independent authority is available at all
   (the original software doesn't exist anymore, or you have no access
   to it) — what's the next-best form of verification, and how much
   less confidence should that leave you with compared to a real
   ground-truth check?
