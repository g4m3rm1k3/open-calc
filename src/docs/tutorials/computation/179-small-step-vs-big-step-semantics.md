# Lesson 179: Small-Step vs Big-Step Semantics

**What you will build**: By the end of this lesson you'll write a **small-step** derivation for `add(add(1,2), 3)` — one individual reduction at a time, `add(add(1,2), 3) \to add(3, 3) \to 6` — and compare it directly against Lesson 178's own **big-step** style, which jumps straight to `6` in one conclusion. Both reach the identical final value; only what's visible along the way differs.

**What you need to know first**: Lesson 178's big-step operational semantics and its own transition-rule notation.

**Terms introduced in this lesson**:

- **small-step semantics** — a specification describing execution as a sequence of *individual* reductions, each one rewriting a program one step closer to a final value. *Why it matters*: makes every intermediate state of a computation a real, nameable thing — Lesson 178's big-step rules never had to name `add(3, 3)` as a real intermediate step; small-step semantics does, on purpose.
- **reduction** — one single small-step transition, rewriting one part of an expression into a simpler equivalent. *Why it matters*: the actual unit small-step semantics is built from — a big-step derivation's entire multi-line proof corresponds to one single "reduces to" arrow's worth of work, viewed at a coarser grain.

**Objects and methods used**: None new. This lesson contrasts two formal notations rather than introducing new code.

---

## Concept Unit: One Reduction at a Time

### The Problem

Lesson 178's big-step rules proved `add(add(1,2), 3)` transitions to `6` in one conclusion, built from nested preconditions. Can the identical computation be described as a real *sequence* of individual rewrites instead, each one a genuine, nameable intermediate state?

### Introduce the concept in isolation

```
add(add(1, 2), 3)
    \to  add(3, 3)          (reduction: add(1,2) reduces to 3)
    \to  6                  (reduction: add(3,3) reduces to 6)
```

Two **reductions**, not one big-step conclusion: first, the *inner* `add(1, 2)` rewrites to `3`, producing the genuinely new intermediate expression `add(3, 3)` — a real state the big-step derivation (Lesson 178) never had to write down as its own line. Second, that reduces to `6`. Each arrow is one small, individual step; the whole sequence, followed to the end, reaches the identical final value Lesson 178's own big-step rule reached in one conclusion.

### Discard the throwaway example

Not applicable — this derivation describes real, already-verified behavior (Lesson 178's own Exercise 2/3), in a different notation.

### CS Lens

This is called **small-step semantics** — each arrow, `\to`, is one **reduction**: the smallest possible unit of "the program got closer to its final value." Also recognized in: how a calculator's own display updates one operation at a time; how a spreadsheet recalculates one cell's formula before moving to the next dependent cell; how a real CPU executes one instruction, leaving a fully inspectable state, before the next.

### SE Lens

Small-step semantics makes every intermediate state real and inspectable — exactly what a debugger needs: stepping through a program one small-step reduction at a time is precisely what "step into" or "step over" in a real debugger corresponds to, a capability big-step semantics, jumping straight from an expression to its final value, has no natural way to express at all.

---

## Concept Unit: The Same Answer, Two Different Views

### The Problem

Big-step and small-step both describe the identical language. Is one simply "more detailed" than the other, or do they genuinely make different things easy or hard to express?

### Introduce the concept in isolation

Big-step (Lesson 178): `\langle add(add(1,2), 3), [] \rangle \to 6` — one conclusion, no intermediate state named at all, built from nested preconditions that are themselves proved the same way.

Small-step (this lesson): `add(add(1,2), 3) \to add(3, 3) \to 6` — two real, separate states, each one a genuine, inspectable expression.

Both are correct, complete specifications of the identical behavior. Big-step is simpler to write for a language that always runs straight through to a value — exactly `eval-env`'s own style, Lesson 164 onward. Small-step is what's actually needed the moment "not running straight through" matters — Lesson 166's evaluation strategies, deciding whether a specific *step* has happened yet or not, or Lesson 169's continuations, needing to name "the rest of the computation" as a real, separate thing at some specific point mid-execution — both genuinely need individual steps to be nameable, which only small-step semantics naturally provides.

### Discard the throwaway example

Not applicable — this unit compares two already-written derivations rather than introducing new code.

### CS Lens

Big-step semantics answers "what does this program compute" in one shot; small-step semantics answers "what does this program do right now, at this exact point" — genuinely different questions, both real and both necessary depending on what's actually being reasoned about.

### SE Lens

A real compiler's own optimization passes operate small-step-style, deliberately: rewriting one piece of a program at a time (constant folding, dead-code elimination), each pass a real, individually-verifiable reduction, rather than reasoning about "what does the whole program eventually compute" all at once, the way big-step semantics does.

### Connection to the previous unit

The previous unit wrote a real small-step derivation; this unit names precisely what small-step semantics is good for that big-step isn't, and vice versa — neither one dominates the other.

---

## Connect the Pieces

The identical computation, both styles, agreeing on the final value:

```
Big-step:   <add(add(1,2), 3), []> -> 6           (one conclusion)
Small-step: add(add(1,2), 3) -> add(3,3) -> 6      (two reductions)
```

Same program, same final answer, two genuinely different amounts of visible intermediate structure — neither derivation is wrong; they're answering different questions about the identical execution.

## What Breaks Without This

Suppose Lesson 166's evaluation-strategy comparison (eager forcing a divide-by-zero argument immediately; lazy deferring it) had to be described using only big-step rules. Big-step's own style jumps straight from an expression to its final value (or, for a crashing program, to no value at all) — there's no natural place in a single-conclusion rule to say "the argument hasn't been evaluated *yet*, but will be, later, if referenced." Small-step semantics, by contrast, can state precisely: after *this* reduction, the argument remains an unevaluated thunk; only a *later* reduction, triggered by an actual reference, forces it — exactly the distinction Lesson 166's own real crash-versus-success demonstration depended on, expressible only because individual steps are real, nameable things under small-step semantics.

## Exercises

1. **Trace.** By hand, write the small-step derivation for `add(2, add(3, 4))` — note carefully which `add` reduces first, and why.
2. **Predict.** Before checking, predict how many individual reductions `add(add(add(1,1),1),1)` needs to reach its final value. Then verify by writing out every step.
3. **Verify.** Confirm both this lesson's own small-step derivation and Lesson 178's big-step rule agree on `add(add(1,2), 3)`'s final value, `6`.
4. **Break it, on purpose.** Write an *incorrect* small-step reduction for `add(add(1,2), 3)` that reduces the *outer* `add` before the inner one has a value, and explain precisely why it can't proceed correctly from there.
5. **Generalize.** Describe, without coding it, what a small-step reduction rule for `"var"` lookup would look like — does a variable reference reduce in one step, or does it need more than one?
6. **Reconstruct.** Close this lesson. From memory, explain why Lesson 166's eager-versus-lazy distinction is naturally expressible in small-step semantics but awkward in big-step.

## Definition of Done

- [ ] You can write a small-step derivation as a real sequence of individual reductions.
- [ ] You can explain the real difference between what big-step and small-step semantics each make easy to express.
- [ ] You can connect small-step semantics to a debugger's own "step" behavior.
- [ ] You completed Exercise 2 and correctly counted the reductions needed for a triple-nested `add`.
- [ ] You completed Exercise 4 and explained precisely why reducing the outer `add` first fails.
- [ ] Commit your Exercise 2 and Exercise 4 work to your notes repository, with a commit message stating what you found — for example, `"Confirm add(add(add(1,1),1),1) needs 3 reductions; explain why reducing the outer add first leaves an unresolved inner add with no defined value yet"` — not just `"lesson 179 exercise"`.

---

**Next lesson:** Lesson 180, *Program Equivalence*, uses this lesson's own small-step machinery to ask a precise question — when are two syntactically different programs guaranteed to compute the same thing — connecting directly back to Lesson 156's denotation.
