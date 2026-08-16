# Lesson 176: Subtyping

**What you will build**: By the end of this lesson you'll compare two ways of deciding whether one type can be used wherever another is expected — by *structure* (which fields it has) or by *declared name* — and show that `point3d` (`\{x, y, z\}`) qualifies as a structural subtype of `point2d` (`\{x, y\}`) purely because it has every field `point2d` needs and more, while two identically-shaped types with different declared names, `"Point2D"` and `"Vector2D"`, are ruled incompatible under a nominal check despite sharing the exact same fields.

**What you need to know first**: Lesson 155's subtyping-as-subset; Lesson 146's partial order, revisited here as the real relationship subtyping still is.

**Terms introduced in this lesson**:

- **structural typing** — two types are compatible if their actual shapes are compatible, regardless of what either is named. *Why it matters*: `point3d`'s own fields being a superset of `point2d`'s is a real, checkable fact about their structure — nothing about either type's own name is involved at all.
- **nominal typing** — two types are compatible only if one was explicitly declared as a subtype of the other by name, regardless of whether their actual shapes happen to match. *Why it matters*: the real alternative to structural typing — two types can be shape-identical and still incompatible, if neither declared a relationship to the other.

**Objects and methods used**: None new. This lesson reuses `clojure.set/subset?` (Lesson 10, Lesson 146) and `=` (Lesson 6), each already covered.

---

## Concept Unit: Structural Subtyping — Compatible by Shape

### The Problem

`point3d`, with fields `\{x, y, z\}`, and `point2d`, with fields `\{x, y\}`, look related — every field `point2d` needs, `point3d` also has. Is there a precise, checkable sense in which `point3d` can be used *wherever* `point2d` is expected?

### Introduce the concept in isolation

```
user=> (def point2d #{"x" "y"})
user=> (def point3d #{"x" "y" "z"})
user=> (clojure.set/subset? point2d point3d)
true
```

Every field `point2d` requires (`"x"`, `"y"`) is present in `point3d` — checked directly with `subset?` (Lesson 10, reused exactly as Lesson 155 already reused it for subtyping). Anything expecting a `point2d`-shaped value — reading `.x` and `.y`, nothing more — works correctly given a `point3d` instead, since every field it could possibly read is guaranteed present. This is **structural typing**: `point3d` is a subtype of `point2d` because of its actual shape, with neither type's name ever entering the check at all.

### Discard the throwaway example

Not applicable — real, verified `subset?` result, the identical check Lesson 155 already established for subtyping generally.

### Project Change

- **Reference Source**: Lesson 155's own subtyping-as-subset model, applied here to record-shaped types specifically.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

Not applicable — this unit applies Lesson 10's existing `subset?` to a new interpretation (record field sets) rather than introducing new code.

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(clojure.set/subset? point2d point3d)`** — reappearing `subset?` (Lesson 10, Lesson 146, Lesson 155): checked here specifically against two field-sets, confirming `point3d`'s fields are a proper superset of `point2d`'s.

### CS Lens

More fields, not fewer, is what makes a structural subtype — the same "smaller set of requirements, satisfied by a value with at least that much" direction Lesson 146's own partial order already established for `\subseteq` generally, here applied specifically to "what fields does this shape guarantee."

### SE Lens

Structural typing lets a type defined in one part of a program be used successfully with code from a completely different part that never knew the first type existed — as long as the shape matches, no explicit declaration of a relationship is required at all, a real, practical flexibility nominal typing (this lesson's next unit) deliberately gives up.

---

## Concept Unit: Nominal Typing — Compatible Only by Declaration

### The Problem

Two types can share the identical shape by coincidence, with no real conceptual relationship — a `Point2D` and a `Vector2D`, say, both just `\{x, y\}` underneath. Should they be treated as interchangeable, purely because they happen to match structurally?

### Introduce the concept in isolation

```
user=> (def named-point2d ["Point2D" #{"x" "y"}])
user=> (def named-vector2d ["Vector2D" #{"x" "y"}])
user=> (= (get named-point2d 0) (get named-vector2d 0))
false
user=> (= (get named-point2d 1) (get named-vector2d 1))
true
```

`named-point2d` and `named-vector2d` share the *identical* field set, `\{x, y\}` — confirmed directly. Their declared names, `"Point2D"` and `"Vector2D"`, differ — also confirmed directly. Under **nominal typing**, that name difference is what matters: a `Point2D` and a `Vector2D` are *not* interchangeable, regardless of sharing every field, because neither was ever declared a subtype of the other. Structurally, per this lesson's first unit, they'd be perfectly compatible; nominally, they aren't — the same two types, two different real answers, depending entirely on which rule is being applied.

### Discard the throwaway example

Not applicable — real, verified comparison showing identical structure and differing declared names.

### Project Change

- **Reference Source**: No reference counterpart — a from-scratch contrast against this lesson's own first unit.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

Not applicable — this unit compares two already-built values rather than introducing new code.

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(= (get named-point2d 0) (get named-vector2d 0))`** — reappearing `get`/`=` (Lesson 84, Lesson 6): compares declared names directly — the check nominal typing actually cares about.
- **`(= (get named-point2d 1) (get named-vector2d 1))`** — the same comparison, applied to the field sets instead — confirming the structural match nominal typing deliberately ignores.

### CS Lens

Real languages make this choice deliberately and differently: Go and TypeScript's structural typing let `point3d` satisfy `point2d`'s interface automatically; Java and C#'s nominal typing require an explicit `extends`/`implements` declaration even between two identically-shaped classes — the identical underlying question, two real, opposed answers.

### SE Lens

Nominal typing's real cost — requiring explicit declarations even for genuinely compatible shapes — buys a real safety benefit structural typing gives up: two accidentally-identical shapes representing genuinely different concepts (`Point2D` and `Vector2D` might use `x`/`y` to mean completely different things) can't be silently substituted for each other just because a field-set comparison happened to match.

### Connection to the previous unit

The previous unit showed two types compatible purely by shape; this unit shows the identical shapes ruled incompatible the moment declared names are what's actually being compared — the same underlying types, two structurally different answers to "are these the same."

---

## Connect the Pieces

The identical field shape, checked two different ways:

```clojure
(println "Structural: point3d subtype of point2d?" (set/subset? point2d point3d))
(println "Nominal: Point2D and Vector2D compatible (same name)?" (= (get named-point2d 0) (get named-vector2d 0)))
```

```
Structural: point3d subtype of point2d? true
Nominal: Point2D and Vector2D compatible (same name)? false
```

Two entirely different questions — "does the shape satisfy it" versus "was this relationship declared" — both real, both used by real languages, neither one universally correct.

## What Breaks Without This

Suppose a codebase mixed both assumptions without ever deciding which one its own type system actually used — some code assuming any shape-compatible value would work (structural), other code assuming only explicitly-declared relationships would (nominal). A value passed where it structurally fits, but was never nominally declared compatible, would work under one assumption and fail under the other — not a bug in either piece of code alone, but a real inconsistency in what "compatible" was ever agreed to mean across the whole codebase. Choosing one model deliberately, and applying it consistently, is what this lesson's own two contrasting checks exist to make an explicit decision about, rather than an unstated assumption.

## Exercises

1. **Trace.** By hand, confirm `point2d` is *not* a structural subtype of `point3d` (the reverse direction), using `subset?`'s own definition.
2. **Predict.** Before checking, predict whether a third shape, `\{x, y, z, w\}` (four fields), is a structural subtype of `point3d`. Then verify.
3. **Verify.** Confirm two *nominally* declared-compatible types (both named `"Point2D"`, say) with genuinely different field sets would still be treated as compatible under a name-only nominal check, even though their structures differ — a real gap nominal typing alone doesn't close.
4. **Break it, on purpose.** Describe a real scenario where structural typing's flexibility causes a genuine bug — two accidentally shape-matching types being silently substituted when they shouldn't have been.
5. **Generalize.** Describe, without coding it, how a real nominal type system would need to track *declared* subtype relationships explicitly (not just names), so that a genuinely intended subtype (`Point3D extends Point2D`) is still recognized as compatible.
6. **Reconstruct.** Close this lesson. From memory, explain why `point3d`/`point2d` and `Point2D`/`Vector2D` give different real answers under structural versus nominal typing, using this lesson's own two checks, not a general statement about the two systems.

## Definition of Done

- [ ] You can check structural subtyping using field-set `subset?` and explain what it guarantees.
- [ ] You can check nominal compatibility by declared name and explain how it differs from a structural check.
- [ ] You can describe a real scenario where each system's own tradeoff — flexibility versus safety — actually matters.
- [ ] You completed Exercise 3 and found a real gap a name-only nominal check leaves open.
- [ ] You completed Exercise 4 and described a genuine bug structural typing's flexibility could cause.
- [ ] Commit your Exercise 3 and Exercise 4 work to your notes repository, with a commit message stating what you found — for example, `"Show name-only nominal check accepts two same-named but differently-shaped Point2D types; describe a structural-typing substitution bug between accidentally shape-matching types"` — not just `"lesson 176 exercise"`.

---

**Next lesson:** Lesson 177, *Algebraic Data Types*, returns to Section VII's own sum and product types with real language-design machinery behind them — building expressive, precisely-typed representations using this section's interpreter, not just counting their possible values the way Lesson 150 did.
