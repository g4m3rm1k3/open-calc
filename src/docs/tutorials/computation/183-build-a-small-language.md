# Lesson 183: Build a Small Language

**What you will build**: This lesson works differently from every other one in this section, the same way Lessons 108, 138, and 158 did. A real design challenge — add `"let"` (local binding) to this section's own toy language, as sugar for a function immediately called with a value — worked with nothing but this section's own already-built pieces, before this lesson shows you anything further. Then a companion implementation containing exactly one deliberately planted mistake, for you to find yourself before it's revealed.

**What you need to know first**: Everything built in this section (Lessons 159–182) is fair game — this lesson scaffolds as little as possible on purpose. Concretely, this lesson's own challenge leans hardest on Lesson 164's `eval-env`, Lesson 165's `"fn"`/`"call"` closures, and Lesson 166's eager evaluation.

---

## The Challenge

Real languages let you write `let x = 5 in x + 1` — bind a name to a value, then use it in an expression. This section's own toy language has no `"let"` node at all — but it doesn't need one as a genuinely new evaluation rule. A `"let"` is exactly a function, immediately called: `let x = 5 in (x + 1)` means exactly the same thing as `(\lambda x.\, x+1)(5)$ — define a one-parameter function taking `x`, then call it right away with `5`.

Design a function, `desugar-let`, translating `["let" name value-expr body-expr]` into the equivalent `["call" ["fn" name body-expr] value-expr]` — using nothing but AST shapes `eval-env` (Lesson 164, Lesson 165) already understands, adding zero new evaluation rules at all.

**Before reading any further, stop and design this yourself.** You have everything you need: Lesson 165 already built closures and calls; this challenge asks only how those two existing pieces combine to express something that looks, on the surface, like a genuinely new language feature.

---

## A Companion Implementation

Here is one real attempt. Read it as if it were handed to you by a collaborator, before checking whether it's actually correct.

```clojure
(defn desugar-let [ast]
  ["call" ["fn" (get ast 1) (get ast 2)] (get ast 3)])
```

The idea: `ast` is `["let" name value-expr body-expr]` — position `1` is the name, position `2` the value, position `3` the body. Build a `"fn"` from the name and desugar into a `"call"`, evaluated entirely by `eval-env`'s own already-existing `"fn"`/`"call"` rules, with no new evaluation logic required at all.

---

## Find the Mistake

Before reading the next section, test this yourself:

```clojure
(def let-ast ["let" "x" 5 ["add" ["var" "x"] 1]])
```

`let-ast` means "bind `x` to `5`, then compute `x + 1`" — by hand, that should evaluate to `6`. Run `(eval-env (desugar-let let-ast) [])` yourself, and compare against that hand-computed `6`, before continuing.

---

## Revealed: What's Wrong

```
user=> (desugar-let let-ast)
["call" ["fn" "x" 5] ["add" ["var" "x"] 1]]
user=> (eval-env (desugar-let let-ast) [])
Execution error (NullPointerException) at user/eval-env.
```

Not `6` — a crash. `desugar-let`'s own body reads `(get ast 2)` where the *body* expression belongs, and `(get ast 3)` where the *value* expression belongs — positions `2` and `3` swapped. The desugared program built is `["call" ["fn" "x" 5] ["add" ["var" "x"] 1]]`: a function that takes `x` and always returns the literal `5`, called with the argument `["add" ["var" "x"] 1]` — which was supposed to be the *body*, evaluated *after* `x` is bound, but is now being evaluated as the *argument*, in the *outer* environment, before any binding exists at all. Lesson 166's own eager evaluation evaluates that argument immediately: `(lookup [] "x")` finds nothing, returning `nil` (Lesson 154's own documented behavior), and `(+ nil 1)` crashes — not because anything about `eval-env`, `eval-call`, or `lookup` is wrong, but because `desugar-let` built the *wrong program* in the first place, swapping which AST position meant "the value" and which meant "the body."

The fix:

```clojure
(defn desugar-let [ast]
  ["call" ["fn" (get ast 1) (get ast 3)] (get ast 2)])
```

```
user=> (eval-env (desugar-let let-ast) [])
6
```

This is exactly the single-wrong-position mistake Lesson 108's `minmax-max` and Lesson 138's `via-waypoint-cost` both made in their own domains — nothing conceptually wrong with the *idea* of desugaring `let` into `fn`/`call`, only a mismatched index between which AST slot means what.

---

## Why This Matters

Every real piece of Section VIII — grammars, parsers, ASTs, an interpreter, environments, closures, evaluation strategies, mutable state, continuations, exceptions, type systems — was built and verified independently, one lesson at a time, always on its own small, isolated example. This lesson's real point is that they combine: `"let"`, a feature that looks like it needs a whole new evaluation rule, needed nothing but a correct *translation* into pieces this section had already built and already trusted. The bug wasn't in any of those already-verified pieces — `eval-env`, `eval-call`, `lookup` all behaved exactly as documented. It was in the one new piece connecting them, exactly where a design combining several already-correct parts is most likely to go wrong, and exactly why testing the *combination* against a real, hand-computed expected answer — not just trusting that each piece alone was already checked — is this section's own closing lesson.

## Exercises

1. **Verify.** Confirm, by hand-tracing `eval-call`/`call-closure`'s own definitions, that the corrected `desugar-let` really does bind `x` to `5` before evaluating `["add" ["var" "x"] 1]`.
2. **Generalize.** Extend `desugar-let` to handle nested lets — `let x = 5 in let y = 10 in x + y` — and confirm it evaluates to `15`.
3. **Break it, on purpose, differently.** Introduce a *different* single mistake into the corrected `desugar-let` — one that breaks only when the value expression itself references an outer variable — and describe exactly what symptom would reveal it.
4. **Reflect.** Before this lesson revealed the bug, did testing against a real, hand-computed expected value (`6`) catch it for you, or would you have trusted `desugar-let`'s own plausible-looking definition without that check?

## Definition of Done

- [ ] You designed a candidate `desugar-let` before reading the companion implementation.
- [ ] You tested the companion implementation against a hand-computed expected value and found the mistake yourself, or confirmed exactly why you didn't.
- [ ] You completed Exercise 2 and confirmed nested lets evaluate correctly.
- [ ] You completed Exercise 3 and correctly predicted the symptom of your own planted mistake.
- [ ] Commit your Exercise 2 and Exercise 3 work to your notes repository, with a commit message stating what you built and found — for example, `"Extend desugar-let to nested lets, confirm result 15; plant and predict symptom of a second value/body-position bug"` — not just `"lesson 183 exercise"`.

---

**Next lesson:** Lesson 184 opens Section IX, *Computer Architecture and Representation* — moving from this section's question, "what does a program mean," to a new one: what a computer actually *is*, physically and logically, underneath every program this curriculum has run so far.
