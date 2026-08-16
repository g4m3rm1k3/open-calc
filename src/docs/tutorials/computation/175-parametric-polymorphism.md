# Lesson 175: Parametric Polymorphism

**What you will build**: By the end of this lesson you'll take Lesson 174's own "unconstrained" result for the identity function's parameter and show it isn't a gap in inference at all — it's the *correct* type for a function that genuinely works on anything: the identical identity closure applied to a real number returns `42`, and applied to a completely different kind of value, a function itself, returns that unchanged too.

**What you need to know first**: Lesson 174's `infer-type` and its own "unconstrained" case; Lesson 165's closures.

**Terms introduced in this lesson**:

- **parametric polymorphism** — a function's ability to work correctly for *any* type at all, because its own logic never actually depends on which type it's given. *Why it matters*: names precisely what Lesson 174's "unconstrained" result actually meant — not "type unknown," but "type doesn't matter," a real, positive property, not a failure to determine one.
- **type variable** — a placeholder, standing for "whatever type this happens to be," used in place of a single fixed type like `"number"`. *Why it matters*: the real, precise way to write down a polymorphic function's type — `T \to T` for identity, not a specific concrete type on either side.

**Objects and methods used**: None new. This lesson reuses `eval-env`/`call-closure` (Lesson 165), each already covered.

---

## Concept Unit: The Identity Function Works on Anything

### The Problem

Lesson 174 inferred `"unconstrained"` for a parameter only ever returned bare, never used inside an `"add"`. Was that a limitation of the inference — something it simply couldn't determine — or a real, correct fact about that function?

### Introduce the concept in isolation

```
user=> (def identity-closure (eval-env ["fn" "y" ["var" "y"]] []))
user=> (call-closure identity-closure 42)
42
user=> (def some-fn (eval-env ["fn" "z" ["var" "z"]] []))
user=> (call-closure identity-closure some-fn)
[z [var z] []]
```

The *identical* closure, `identity-closure`, is called twice: once with a real number, `42`, returning it unchanged; once with a completely different kind of value — another closure entirely — also returned unchanged. Nothing about `identity-closure`'s own definition, `["fn" "y" ["var" "y"]]`, ever inspects or depends on what `y` actually is — it just hands it straight back. `"unconstrained"` was never a failure to figure out identity's type — it was the correct, honest answer, because *no* single concrete type could ever be right for every call.

### Discard the throwaway example

Not applicable — real, verified output showing the identical closure working correctly on two genuinely different kinds of argument.

### Project Change

- **Reference Source**: Lesson 165's own `eval-env`/`call-closure`, reused entirely unchanged — this lesson's own point required no new interpreter code at all.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

Not applicable — this unit applies Lesson 165's own existing `call-closure` to a new argument type, rather than introducing new code.

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(call-closure identity-closure 42)`** — reappearing `call-closure` (Lesson 165), applied here specifically to prove the identical function handles a number correctly.
- **`(call-closure identity-closure some-fn)`** — the identical call, a genuinely different argument type (a closure, not a number) — succeeding for exactly the same reason the first call did: the function's own body never inspects its argument's type at all.

### CS Lens

This is **parametric polymorphism**: `identity-closure`'s real type isn't `"number" \to "number"` or `"function" \to "function"` — it's `T \to T`, for *any* type `T` at all, using a **type variable** in place of one fixed concrete type. Lesson 25's own `map`, and Lesson 153's `map-tree`, are both genuinely polymorphic the identical way — neither one's own logic depends on what type of value it's transforming.

### SE Lens

A function correctly inferred as polymorphic can be reused across every type a program ever introduces, written once — the exact reuse payoff Lesson 139's abstraction already named, here specifically because the function's own type, `T \to T`, makes no promise at all about what `T` has to be.

---

## Concept Unit: Making Inference Report a Real Type Variable

### The Problem

Lesson 174's `infer-type` reported `"unconstrained"` for a parameter never used inside an `"add"` — an honest, but vague, answer. Can inference be extended to report the *actual* polymorphic type, `T`, instead of merely admitting it found no constraint?

### Introduce the concept in isolation

```clojure
(defn infer-type-tv [name body]
  (if (uses-as-number? name body) "number" ["type-var" name]))
```

```
user=> (infer-type-tv "y" ["var" "y"])
["type-var" "y"]
user=> (infer-type-tv "y" ["add" ["var" "y"] 1])
"number"
```

`infer-type-tv` still checks the identical constraint Lesson 174's `uses-as-number?` already established — but where the old version fell back to the vague string `"unconstrained"`, this version returns `["type-var" "y"]`: a real, structured type, naming *which* variable's own type is still open, rather than only admitting one wasn't found. `y` used inside an `"add"` still correctly infers `"number"` — the constrained case is unchanged; only the unconstrained case now carries real information instead of a shrug.

### Discard the throwaway example

Not applicable — `infer-type-tv` is real, reusable, and verified against both the constrained and unconstrained case from Lesson 174's own examples.

### Project Change

- **Reference Source**: Lesson 174's own `infer-type`/`uses-as-number?`, reused directly — only the unconstrained branch's own return value changes.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn infer-type-tv [name body]
  (if (uses-as-number? name body) "number" ["type-var" name]))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(uses-as-number? name body)`** — reappearing (Lesson 174): the identical constraint check, unchanged.
- **`["type-var" name]`** — first appearance of this specific idea: a real, structured **type variable** value, naming the specific unconstrained parameter, in place of a bare string admitting inference found nothing.

### CS Lens

This is the real, concrete difference between Lesson 174's honest "I couldn't determine a type" and this unit's own "I determined the type is genuinely generic" — the same underlying fact, `T \to T`, but now represented as data a type checker could actually use (compare two type variables, substitute a concrete type into one later) rather than a string with no further structure.

### SE Lens

A real type checker needs exactly this: not just knowing a parameter is unconstrained, but having a real, nameable placeholder for it, so that *two* uses of the same polymorphic function, with two different concrete argument types, can each substitute their own real type into the identical `T` without the two calls interfering with each other.

### Connection to the previous unit

The previous unit proved identity works correctly on any real value; this unit gives that fact a real, structured type inference can actually report, closing the gap Lesson 174 honestly left open rather than only describing how it might be closed.

---

## Connect the Pieces

The same closure, two genuinely different argument types, both correct:

```clojure
(println "Identity on a number:" (call-closure identity-closure 42))
(println "Identity on a function value, type shown:" (call-closure identity-closure some-fn))
```

```
Identity on a number: 42
Identity on a function value, type shown: [z [var z] []]
```

Neither call required a different version of `identity-closure` — one function, one real definition, correct for both, exactly what `T \to T` promises and a fixed concrete type never could.

## What Breaks Without This

Suppose a language required every function to be given one single, fixed concrete type, with no type variables allowed at all. The identity function would need a separate, hand-written copy for every type it might ever be applied to — one identity for numbers, another identical-looking one for functions, another for anything else a program introduces later — real, duplicated code differing only in a type annotation, with no way to express "this works the same way regardless of type" as a single, real fact about the function. Parametric polymorphism is precisely what makes writing `identity` (or `map`, or `map-tree`) exactly once, correctly, for every type at once, possible at all.

## Exercises

1. **Trace.** By hand, using `identity-closure`'s own definition, explain why its body never needs to know or check what type `y` actually is.
2. **Predict.** Before checking, predict whether `add-one-closure` (Lesson 174's own non-polymorphic example) could correctly be applied to a closure the way `identity-closure` was. Then verify what actually happens, and explain why it differs from identity's own result.
3. **Verify.** Confirm `(call-closure identity-closure identity-closure)` — identity applied to *itself* — returns the identical closure value unchanged.
4. **Break it, on purpose.** Describe a function that *looks* like it should be polymorphic (say, one that returns its argument's own parameter name if it's a closure, but not otherwise) and explain why it genuinely isn't — what real constraint on its argument's type does it introduce that identity never does?
5. **Generalize.** Describe, without coding it, `infer-type`'s own type-variable case — what would need to change so that a parameter only ever passed through, never used inside an `"add"`, gets reported as genuinely polymorphic rather than merely `"unconstrained"`.
6. **Reconstruct.** Close this lesson. From memory, explain why `"unconstrained"` (Lesson 174) and "polymorphic" (this lesson) are the same real fact, described two different ways.

## Definition of Done

- [ ] You can explain why the identity function works correctly for any type, using its own definition as proof.
- [ ] You can distinguish a genuinely polymorphic function from one that merely hasn't had its type constraints found yet.
- [ ] You can explain what a type variable represents, and why `T \to T` is identity's real type.
- [ ] You completed Exercise 3 and confirmed identity applied to itself returns itself unchanged.
- [ ] You completed Exercise 4 and described a real function that looks polymorphic but genuinely isn't.
- [ ] Commit your Exercise 3 and Exercise 4 work to your notes repository, with a commit message stating what you confirmed and found — for example, `"Confirm identity applied to itself returns itself; describe a closure-only function and the real constraint that makes it non-polymorphic"` — not just `"lesson 175 exercise"`.

---

**Next lesson:** Lesson 176, *Subtyping*, returns to Lesson 155's own subtyping idea with a real, structural question: when should one type be usable wherever another is expected, and how does that relationship differ between structural and nominal type systems.
