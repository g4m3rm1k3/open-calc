# Lesson 156: Programs as Functions

**What you will build**: By the end of this lesson you'll treat a program's real behavior — not its source code, its actual input-to-output behavior — as a mathematical function in exactly Lesson 12's sense, and use that lens to answer two precise questions about code this curriculum already built: is Lesson 145's `canonical` injective (checkable, and it isn't), and is Lesson 78's `shuffle` a function at all in this stricter sense (checkable, and it isn't either). This is **denotational thinking**: what a program *means* is the function it computes, independent of how it computes it.

**What you need to know first**: Lesson 12's injective/surjective/bijective; Lesson 155's types-as-sets; Lesson 6's substitution; Lesson 78's `shuffle`, revisited here as a real counterexample; Lesson 139's observational equivalence, revisited as a direct instance of this lesson's own idea.

**Terms introduced in this lesson**:

- **denotation** — the actual mathematical function a program computes: a mapping from its input set (Lesson 155) to its output set, independent of the code used to compute it. *Why it matters*: two genuinely different implementations can have the identical denotation — Lesson 139's two stacks already proved this concretely, before this lesson had a name for it.
- **referential transparency** — a function has this property when calling it with the same input always produces the same output, with no dependence on anything outside its own arguments. *Why it matters*: the exact property Lesson 6's substitution rule has quietly assumed since it was first stated — substituting an equal expression only works if calling the function again would give the identical result.

**Objects and methods used**: None new. This lesson reuses `mod` (Lesson 54), `=`/`not=` (Lesson 6, Lesson 136), and `shuffle` (Lesson 78), each already covered.

---

## Concept Unit: Two Implementations, One Denotation — Already Proven

### The Problem

Lesson 139 proved `stack-push`/`stack-pop`/`stack-peek` and `vstack-push`/`vstack-pop`/`vstack-peek` always agree, despite completely different internals. Is there a name for what, precisely, the two implementations share?

### Introduce the concept in isolation

Lesson 139's own real, verified result: `(stack-peek s)` and `(vstack-peek v)` agreed on every call, for both implementations, across every sequence of pushes and pops tested. Neither implementation's *code* is the same — one conses onto a list, one appends to a vector — but both compute the *identical function*: given a sequence of pushes and pops, both always produce the identical `peek` result. That shared function — the actual input-to-output mapping, not either implementation's own code — is each one's **denotation**.

### Discard the throwaway example

Not applicable — this unit names a property Lesson 139's own real code already proved, rather than introducing new code.

### CS Lens

"Same denotation, different implementation" is exactly what Lesson 139 called observational equivalence — this lesson's own vocabulary is the general, formal name mathematicians and language designers use for that identical idea: a program's meaning is its denotation, not its source.

### SE Lens

Denotational thinking is what makes refactoring meaningful at all: replacing one implementation with another is only safe because both are understood to share a denotation — the same guarantee Lesson 139's own SE Lens already argued for, now given the vocabulary a broader body of language theory uses for it.

---

## Concept Unit: Is `canonical` Injective?

### The Problem

Lesson 12 defined injective precisely: a function where no two different inputs ever produce the same output. Does Lesson 145's `canonical` — mapping every integer to its remainder mod `4` — have that property?

### Introduce the concept in isolation

```
user=> (canonical 1)
1
user=> (canonical 5)
1
user=> (and (not= 1 5) (= (canonical 1) (canonical 5)))
true
```

`1` and `5` are different inputs (`not= 1 5` is `true`), yet `canonical` maps both to the identical output, `1` — confirmed directly, not assumed from `canonical`'s own general shape. `canonical` is **not injective**: real, distinct inputs collide.

### Discard the throwaway example

Not applicable — real values, a real collision, checked directly rather than inferred.

### Project Change

- **Reference Source**: Lesson 145's own `canonical`, reused directly, unchanged.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

Not applicable — this unit checks an existing function's existing behavior against Lesson 12's own definition, rather than building new code.

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(and (not= 1 5) (= (canonical 1) (canonical 5)))`** — reappearing `and`/`not=`/`=` (Lesson 7, Lesson 136, Lesson 6): the precise, direct check for Lesson 12's own injective definition failing — two different inputs, one shared output.

### CS Lens

`canonical`'s *lack* of injectivity is exactly what makes it useful: Lesson 145's whole point was collapsing infinitely many equivalent integers down to one canonical representative — a genuinely injective function could never do that, since collapsing distinct inputs together is precisely what injectivity forbids.

### SE Lens

Confirming non-injectivity isn't a criticism of `canonical` — it's the correct, checked classification for a function deliberately designed that way; the real risk would be *assuming* a function is injective (say, when building a lookup table keyed by its output) when it demonstrably isn't, silently overwriting distinct entries that collided.

### Connection to the previous unit

The previous unit named what two implementations share when they compute the same function; this unit classifies one specific function's own real behavior, using Lesson 12's vocabulary directly rather than describing it informally.

---

## Concept Unit: `shuffle` Isn't a Function at All, in This Strict Sense

### The Problem

Lesson 78 already warned that `shuffle`'s output "is not a pure function of its input alone." Does that mean `shuffle` fails this lesson's own denotational model entirely — and can that be checked directly?

### Introduce the concept in isolation

Lesson 78's own real, documented fact: calling `shuffle` twice on the identical list can — and usually does — produce different results. A genuine mathematical function, in Lesson 12's own sense, must map each input to exactly *one* output, always; `shuffle` maps one input to potentially many different outputs across different calls. `shuffle` is **not referentially transparent**, and, strictly, it isn't a function *of its argument alone* at all — its real behavior depends on something beyond what's visible in its own call, which this curriculum has never needed to name explicitly until now.

### Discard the throwaway example

Not applicable — this unit applies Lesson 12's own strict definition to a fact Lesson 78 already established and verified.

### CS Lens

Contrast directly with `mod4-add`: called twice with the identical arguments, it always returns the identical result — genuinely referentially transparent, the property every other function this curriculum has built (except `shuffle`, and Lesson 81's related randomized functions) has always quietly had.

### SE Lens

This is exactly why Lesson 6's substitution rule — replace an expression with an equal one, anywhere, without changing the result — could never safely apply to a `shuffle` call: substituting `(shuffle xs)` for another call to `(shuffle xs)` is *not* safe, since the two calls aren't guaranteed to produce the same value, unlike every referentially transparent function this rule has been silently relied on for since Lesson 6 itself.

### Connection to the previous unit

The previous unit classified a real function's injectivity; this unit shows a real, already-built piece of code that fails to be a function *at all* in this lesson's strict sense — the boundary of the entire model this lesson has been building.

---

## Connect the Pieces

Denotation, injectivity, and referential transparency, checked against three real, already-built pieces of code:

```clojure
(println "canonical: 1 and 5 collide?" (= (canonical 1) (canonical 5)))
(println "mod4-add: same call twice, same result?" (= (mod4-add 1 2) (mod4-add 1 2)))
```

```
canonical: 1 and 5 collide? true
mod4-add: same call twice, same result? true
```

Every function this curriculum has built since Lesson 2, except a handful of deliberately randomized ones (Lesson 78 onward), shares `mod4-add`'s own property — the quiet, foundational assumption denotational thinking finally makes explicit.

## What Breaks Without This

Suppose a memoization cache (Lesson 38) were applied to `shuffle` the same way it was correctly applied to referentially transparent functions earlier in this curriculum — storing the *first* call's result and reusing it for every later call with the identical argument. That would be a genuine bug, not an optimization: `shuffle`'s entire purpose is producing a different result each time, and caching its output would silently defeat that purpose, freezing what should be random into something fixed. Memoization is only ever safe for a referentially transparent function — exactly the property this lesson's own model makes precise and checkable, rather than something to assume holds for any function that merely looks pure.

## Exercises

1. **Trace.** By hand, using `canonical`'s own definition, find a *third* input, besides `1` and `5`, that collides with them under `canonical`.
2. **Predict.** Before checking, predict whether Lesson 145's `my-abs` is injective. Then verify by finding (or failing to find) a real colliding pair.
3. **Verify.** Confirm `mod4-add` gives the identical result on three separate calls with the same two arguments, not just the two this lesson checked.
4. **Break it, on purpose.** Call Lesson 81's `rand-int` twice with the identical argument, and confirm — the same way this lesson checked `shuffle` — that it isn't referentially transparent either.
5. **Generalize.** Describe, without coding it, why `mod4-add`'s own *identity* element (Lesson 140) doesn't depend on this lesson's injectivity or referential-transparency questions at all — they're independent properties of the same function.
6. **Reconstruct.** Close this lesson. From memory, explain why memoizing `shuffle` would be a real bug, using this lesson's own referential-transparency definition, not just "because it's random."

## Definition of Done

- [ ] You can explain what a program's denotation is and why two different implementations can share one.
- [ ] You can check whether a real function is injective by finding, or failing to find, a colliding pair.
- [ ] You can explain referential transparency and identify a real function in this curriculum that lacks it.
- [ ] You completed Exercise 2 and determined whether `my-abs` is injective, with a real colliding pair or a real argument for why none exists.
- [ ] You completed Exercise 4 and confirmed `rand-int` is not referentially transparent.
- [ ] Commit your Exercise 2 and Exercise 4 work to your notes repository, with a commit message stating what you found — for example, `"Confirm my-abs is not injective (5 and -5 collide); confirm rand-int is not referentially transparent across repeated calls"` — not just `"lesson 156 exercise"`.

---

**Next lesson:** Lesson 157, *Programs as Proofs*, connects this lesson's own precise function model to logic directly — introducing the Curry-Howard correspondence, where a type is a proposition and a value of that type is a proof of it, conceptually, without requiring a formal proof assistant.
