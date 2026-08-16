# Lesson 143: Groups

**What you will build**: By the end of this lesson you'll recognize that Lesson 140's own `mod4-add` — closed, associative, an identity, and every element invertible — already satisfied a fourth structure this curriculum hadn't named yet: a **group**. Then you'll show that a square's four rotations, composed one after another, form the *identical* group in disguise, and that reversibility — the one property a monoid deliberately dropped — is exactly what makes "undo" a meaningful operation at all.

**What you need to know first**: Lesson 140's closure, associativity, identity, and inverse, and its own `mod4-add` example; Lesson 141's monoid, for direct contrast.

**Terms introduced in this lesson**:

- **group** — a monoid (Lesson 141) in which every element also has an inverse. *Why it matters*: the exact property Lesson 141 deliberately excluded to make room for operations like `concat` — adding it back names a strictly narrower, more powerful structure: one where every operation can always be undone.
- **symmetry** — an action on an object that leaves it looking unchanged in its overall shape, even though its specific orientation moved. *Why it matters*: rotating a square `90°` doesn't change *that* it's a square — this lesson's own concrete example of a group that isn't built from numbers at all.

**Objects and methods used**: None new. This lesson reuses `mod` (Lesson 54) and `=` (Lesson 6), each already covered.

---

## Concept Unit: `mod4-add` Was Already a Group

### The Problem

Lesson 140 checked all four properties — closure, associativity, identity, and inverses — against `mod4-add`, and all four held. Lesson 141 then named the *three*-property version, deliberately dropping inverses. Is there a name for what `mod4-add` actually had the whole time, all four properties together?

### Introduce the concept in isolation

```
user=> (mod (+ 1 3) 4)
0
user=> (mod (+ 2 2) 4)
0
```

Lesson 140 already confirmed, exhaustively, that every element of `\{0, 1, 2, 3\}` has an inverse under `mod4-add`: `1` and `3` combine to `0` (the identity); `2` is its own inverse; `0` is its own inverse. Combined with closure, associativity, and the identity element `0`, all four already verified, `(\{0,1,2,3\}, \text{mod4-add})$ satisfies every property a **group** requires: a monoid where every single element also has an inverse.

### Discard the throwaway example

Not applicable — this unit names a structure Lesson 140's own real, already-verified code already demonstrated in full.

### CS Lens

A group is a hard concept worth naming several unrelated recurrences for: ordinary integers under addition (inverse of `a` is `-a`); non-zero rational numbers under multiplication (inverse of `a` is `1/a`); Lesson 6's own `identical?`-testable values under Lesson 78's `shuffle`, informally — every shuffle can, in principle, be undone by some other shuffle, though this curriculum never built that inverse explicitly.

### SE Lens

Naming exactly *which* properties a structure has — not "it's basically like a group" but a real, checked list — is what lets later code trust specific guarantees. An algorithm that needs to undo a step (Lesson 33's backtracking, informally) can only rely on that being possible if the operation it's undoing genuinely comes from a group; Lesson 141's monoid gave no such promise, on purpose.

---

## Concept Unit: The Same Group, as Rotations

### The Problem

Is `mod4-add` the *only* group with exactly four elements shaped this way, or is it one instance of something more general — the way Lesson 141 showed `concat` and `+` share a single monoid shape despite looking nothing alike?

### Introduce the concept in isolation

```clojure
(defn rotation-compose [a b] (mod4-add a b))
```

```
user=> (rotation-compose 1 2)
3
```

Represent a square's four possible rotations as `0`, `1`, `2`, `3` — `0°`, `90°`, `180°`, `270°`. Composing two rotations — rotate by the first amount, then by the second — should give the total rotation. Rotating `90°` then `180°` gives `270°` total: `(rotation-compose 1 2)` is `3`, matching the physical result exactly. `rotation-compose` isn't a new operation at all — it's `mod4-add`, renamed, because rotating a square by two amounts in sequence combines exactly the way clock-arithmetic addition does: past `270°` wraps back around to `0°`, the identical wraparound `mod` already provided.

### Discard the throwaway example

Not applicable — `rotation-compose` is real, reusable, and its result was checked against the physically correct total rotation.

### Project Change

- **Reference Source**: No reference counterpart — a from-scratch reinterpretation of Lesson 140's own `mod4-add`, applied to a genuinely different concrete domain.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn rotation-compose [a b] (mod4-add a b))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(mod4-add a b)`**, wrapped as `rotation-compose` — reappearing `mod4-add` (Lesson 140), given a new name and a new interpretation (rotation amounts, not clock-arithmetic numbers) with the function body completely unchanged — the same underlying group, wearing a different concrete meaning.

### CS Lens

Two groups that behave identically under their own operation, differing only in which real-world thing each element is labeled as meaning, are the group-theory version of Lesson 139's observational equivalence: `\{0,1,2,3\}$ under `mod4-add` and "the four rotations of a square" under composition are *the same group*, provably, since `rotation-compose` is literally `mod4-add` with nothing changed but the name.

### SE Lens

Recognizing "this new-looking problem is actually a group I already understand" is worth real effort for the same reason Lesson 135 found matching was secretly flow: any proof or algorithm already built for `mod4-add` — this lesson's own inverse-finding, for instance — transfers immediately to rotations, with zero new work, purely because the underlying structure was identical the whole time.

### Connection to the previous unit

The previous unit confirmed one specific group; this unit shows that identical group recurring in a domain — physical rotation — that has nothing to do with numbers on the surface.

---

## Concept Unit: Inverses Mean Reversibility

### The Problem

Lesson 141's monoid deliberately allowed operations with no way to undo them. What does having a *real* inverse actually buy, concretely, beyond passing a formal checklist?

### Introduce the concept in isolation

```
user=> (rotation-compose 1 3)
0
user=> (rotation-compose 2 2)
0
user=> (rotation-compose 3 1)
0
```

Rotate `90°`, then rotate `270°` — the total is `0°`, back to the identity, exactly where the square started, visually indistinguishable from never having rotated at all. `180°` undoes itself the same way (`2` combined with `2` gives `0`); `270°` undoes back with `90°`. Every rotation has a real, checkable "undo" — precisely what an inverse *is*: not a vague opposite, but the specific element that composes with the original to reach the identity, checked directly rather than assumed.

### Discard the throwaway example

Not applicable — every inverse pair shown was checked to actually reach the identity, not merely asserted to look like an opposite.

### Project Change

- **Reference Source**: No reference counterpart — direct verification of this lesson's own rotation group's inverses.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

Not applicable — this unit verifies existing inverses rather than building a new function.

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(rotation-compose 1 3)`, `(rotation-compose 2 2)`, `(rotation-compose 3 1)`** — reappearing `rotation-compose` (this lesson's second unit), each call pairing one rotation with the specific other rotation that reaches the identity `0` — three separate, direct checks of Lesson 140's own inverse property, this time on a physical rather than numeric group.

### CS Lens

Reversibility is exactly what a group buys that a mere monoid doesn't: Lesson 33's backtracking search, informally, depends on being able to undo a choice that led nowhere — a real inverse operation is what makes "undo" a precise, guaranteed-to-work idea rather than a hopeful one.

### SE Lens

A system built on operations *without* real inverses — `concat`, Lesson 141's own example — can still be useful, but "undo" for it has to be handled separately, usually by remembering the previous state directly rather than computing an inverse (exactly what a text editor's undo history does: it stores snapshots, because insertion-into-a-list has no clean algebraic inverse the way rotation does). Choosing a group specifically, when reversibility genuinely matters, avoids that extra bookkeeping entirely.

### Connection to the previous unit

The previous unit showed the rotation group is literally `mod4-add` renamed; this unit shows exactly what that shared structure guarantees in practice — every action has a real, checkable way back.

---

## Connect the Pieces

The identical group, verified as numbers and as rotations, with reversibility checked both ways:

```clojure
(println "As numbers, 1 and 3 are inverses:" (= (mod4-add 1 3) 0))
(println "As rotations, 90deg and 270deg are inverses:" (= (rotation-compose 1 3) 0))
(println "Same underlying function:" (= mod4-add rotation-compose))
```

```
As numbers, 1 and 3 are inverses: true
As rotations, 90deg and 270deg are inverses: true
Same underlying function: true
```

`mod4-add` and `rotation-compose` were never two different groups that happened to agree — the third line confirms they're the *identical* function, checked directly rather than only argued from behavior.

## What Breaks Without This

Suppose a program needed to reverse a sequence of applied rotations — undo the last few moves of an animation, say — and modeled rotation as *addition without ever confirming a group*, using an operation that turned out not to have real inverses for every value (imagine rotations restricted to `\{0°, 90°\}$ only, with no representation of `180°` or `270°` at all — closed under addition only sometimes, and `90°` would have no partner reaching back to `0°$ within that restricted set). Any code assuming "just add the negative rotation" would either compute a nonsensical value outside the allowed set or silently produce the wrong orientation. Confirming the full group — all four properties, not just closure — before relying on "undo" being possible at all is the difference between a guarantee and a hopeful assumption.

## Exercises

1. **Trace.** By hand, using `mod4-add`'s own definition, confirm every one of `\{0, 1, 2, 3\}`'s four elements has exactly one inverse within the set, listing all four pairs.
2. **Predict.** Before checking, predict whether `\{0, 1, 2\}` under `mod4-add` (using the same function, but only three of its four values) is still a group. Check closure first — does `mod4-add` ever produce `3` from two elements of `\{0, 1, 2\}`?
3. **Verify.** Confirm `rotation-compose` is associative on at least one real triple of rotations, the same check Lesson 140 first introduced.
4. **Break it, on purpose.** Describe a small set and operation that is a monoid (closed, associative, identity) but is *not* a group, different from Lesson 141's own `concat` example.
5. **Generalize.** Describe, without coding it, the group formed by a square's *reflections* combined with its rotations — `8` symmetries total, not `4`. Would composing two reflections give a rotation or another reflection?
6. **Reconstruct.** Close this lesson. From memory, explain why `rotation-compose` and `mod4-add` are provably the same group, not just two groups that happen to behave alike.

## Definition of Done

- [ ] You can define a group as a monoid with inverses and explain how that differs from Lesson 141's monoid.
- [ ] You can explain why `mod4-add` and rotating a square by multiples of `90°` are the same group.
- [ ] You can explain why reversibility (a real inverse) is what a group buys that a monoid doesn't guarantee.
- [ ] You completed Exercise 2 and determined whether `\{0, 1, 2\}` under `mod4-add` is a genuine group.
- [ ] You completed Exercise 4 and described a real monoid that is not a group.
- [ ] Commit your Exercise 2 and Exercise 4 work to your notes repository, with a commit message stating what you found — for example, `"Confirm {0,1,2} under mod4-add fails closure (1+2=3, not in the set); describe string concatenation as a non-group monoid"` — not just `"lesson 143 exercise"`.

---

**Next lesson:** Lesson 144, *Rings and Fields*, combines this lesson's own group with Lesson 142's semiring — two operations again, but this time requiring the *first* one to be a full group, not just a monoid — the exact structure behind ordinary integer and rational arithmetic, named precisely for the first time.
