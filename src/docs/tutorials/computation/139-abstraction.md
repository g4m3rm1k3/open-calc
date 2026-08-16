# Lesson 139: Abstraction

**What you will build**: By the end of this lesson you'll build a second, completely different implementation of Lesson 86's stack — vector-based instead of list-based, with its raw internal data stored in the *opposite* order — and prove, with real code, that no sequence of `push`/`pop`/`peek` calls can ever tell the two apart. That proof is what this lesson names precisely: **abstraction**, preserving relevant structure while discarding irrelevant detail, opening Section VII's whole run of mathematical structures with the one idea every one of them turns out to be an instance of.

**What you need to know first**: Lesson 86's list-based stack (`stack-push`/`stack-pop`/`stack-peek`, built on Lesson 24's `cons`/`rest`/`first`); Lesson 84's vectors and `assoc`/`get`/`count`; Lesson 96's `pop`; Lesson 106's abstraction barrier and Lesson 90's abstract data type, both reused directly here as concrete instances of this lesson's more general idea.

**Terms introduced in this lesson**:

- **abstraction** — preserving the relevant structure of something while discarding irrelevant detail. *Why it matters*: this lesson's own general name for a pattern this curriculum has already used concretely, more than once, without ever naming the general idea itself — Lesson 106's abstraction barrier and Lesson 90's abstract data type are both specific *instances* of this one general concept, not separate ideas.
- **observational equivalence** — two implementations are observationally equivalent, with respect to a given set of operations, when no sequence of those operations can ever tell them apart. *Why it matters*: turns "these two things are basically the same" from a vague impression into a precise, checkable claim — exactly what this lesson's own code proves, rather than asserts, about its two stacks.

**Objects and methods used**: None new. This lesson reuses `cons`/`rest`/`first` (Lesson 24), `assoc`/`get`/`count` (Lesson 84, Lesson 94), and `pop` (Lesson 96), each already covered.

---

## Concept Unit: Two Representations, One Behavior

### The Problem

Lesson 86 built a stack on Lesson 24's linked list: `stack-push` conses a new value onto the front, `stack-pop` drops the front with `rest`, `stack-peek` reads it with `first`. Could a stack with the *identical* `push`/`pop`/`peek` behavior be built on Lesson 84's vector instead — a completely different foundation — and would any code that only ever calls those three operations be able to tell the difference at all?

### Introduce the concept in isolation

```clojure
(defn vstack-push [vstack value] (assoc vstack (count vstack) value))
(defn vstack-pop [vstack] (pop vstack))
(defn vstack-peek [vstack] (get vstack (- (count vstack) 1)))
```

```
user=> (def s (stack-push (stack-push (stack-push '() 10) 20) 30))
user=> (def v (vstack-push (vstack-push (vstack-push [] 10) 20) 30))
user=> s
(30 20 10)
user=> v
[10 20 30]
user=> (stack-peek s)
30
user=> (vstack-peek v)
30
```

The raw values are not just differently shaped — they store the identical three pushes in *opposite* order: `s` keeps the most recent push at the front (`cons` always adds there), `v` keeps it at the end (`assoc` at `(count vstack)` always appends there). Despite that, `stack-peek` and `vstack-peek` agree: both report `30`, the value pushed last. Popping continues the agreement:

```
user=> (def s2 (stack-pop s))
user=> (def v2 (vstack-pop v))
user=> s2
(20 10)
user=> v2
[10 20]
user=> (stack-peek s2)
20
user=> (vstack-peek v2)
20
```

Every `push`/`pop`/`peek` result matches, call for call, even though the two raw structures never look alike at any point.

### Discard the throwaway example

Not applicable — `vstack-push`, `vstack-pop`, and `vstack-peek` are real, reusable, and verified this session against Lesson 86's own stack, value for value.

### Project Change

- **Reference Source**: No reference counterpart — a from-scratch second implementation of Lesson 86's own ADT, built specifically to compare against it.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn vstack-peek [vstack] (get vstack (- (count vstack) 1)))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(assoc vstack (count vstack) value)`**, in `vstack-push` — reappearing `assoc`-as-append (Lesson 94): places `value` one past the current last index, growing the vector by one.
- **`(pop vstack)`** — reappearing (Lesson 96): removes the *last* element of a vector specifically — the vector's own mirror of `stack-pop`'s `rest`, which removes the *first* element of a list.
- **`(get vstack (- (count vstack) 1))`**, in `vstack-peek` — reappearing nested arithmetic-then-`get` (used since Lesson 91): reads the last index directly, the vector's own mirror of `stack-peek`'s `first`.
- **`(cons value stack)`** (Lesson 86's `stack-push`, reappearing) and **`(assoc vstack (count vstack) value)`** — a hard concept worth restating side by side: both are "add one value to this stack," but one grows at the front of its structure and the other at the end, precisely because a list and a vector don't offer the same cheap end to grow from (Lesson 83's own cost profiles).

### CS Lens

Two implementations agreeing on every `push`/`pop`/`peek` result, despite disagreeing completely on raw internal shape, is **observational equivalence**, just named: no sequence of the *allowed* operations can tell `s` and `v` apart, even though directly printing them can.

### SE Lens

Nothing about `vstack-push`/`vstack-pop`/`vstack-peek` required looking at Lesson 86's own internals to build — only its three function *names* and what each one is supposed to return. That's the real payoff: a second, independently-built implementation can be swapped in anywhere the first one was used, and nothing calling only `push`/`pop`/`peek` would ever need to change.

---

## Concept Unit: Naming It — Abstraction, and Where It Leaks

### The Problem

"These two stacks behave the same" was just proven for `push`/`pop`/`peek`. Is that true for *any* operation at all, or only for the specific ones the stack ADT actually promises?

### Introduce the concept in isolation

```
user=> (get s 0)
nil
user=> (get v 0)
10
```

`get` is not part of the stack's own promised interface — `push`, `pop`, and `peek` are. The moment it's used directly on the raw structures anyway, the two stop agreeing entirely: `(get v 0)` reads the vector's first slot, `10`, exactly as `get` always has since Lesson 84; `(get s 0)` runs `get` against a plain list, which doesn't support positional lookup the same way, and silently returns `nil` instead — not an error, just a quietly wrong answer for anyone who assumed both stacks accept `get` identically.

This is called **abstraction**: preserving the relevant structure (here, `push`/`pop`/`peek` behavior) while discarding irrelevant detail (here, which raw structure is actually underneath) — Lesson 106's own **abstraction barrier** is the concrete mechanism that enforces this, by only exposing named functions and never raw access; Lesson 90's **abstract data type** is the name for "a type defined by its operations, not its representation," which is exactly what `s` and `v` both are here. This lesson's own two terms give the *general* concept both of those specific mechanisms were already quietly instances of.

Abstraction is not a claim that representation is *truly* irrelevant in some absolute sense — `(get s 0)` just proved it very much still exists underneath. It is a *deliberate, enforced restriction*: agree in advance on a specific set of operations (the interface), and only ever interact through those. Respect that restriction, and representation genuinely doesn't matter, provably, the way this lesson's first unit showed. Break it — reach past the interface, the way `(get s 0)` just did — and the two stop being interchangeable immediately.

### Discard the throwaway example

Not applicable — real, verified output showing exactly where the abstraction stops holding.

### Project Change

- **Reference Source**: No reference counterpart — a direct demonstration using this lesson's own two stacks.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

Not applicable — this unit's code is a diagnostic comparison (`get` on both raw structures), not a new reusable function.

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(get s 0)`** — first appearance of `get` applied to something other than a vector: Clojure's `get` accepts many collection types, but a plain list built by `cons` isn't indexed the way a vector is, so it falls through to `get`'s own documented "not found" behavior, `nil`, rather than an error.
- **`(get v 0)`** — reappearing `get` (Lesson 84), used exactly as originally taught, confirming the vector side behaves ordinarily; the contrast between this line and the previous one is the entire point of this unit.

### CS Lens

Abstraction, named generally here, is the single idea Section VII's whole run of lessons is about to explore in different mathematical settings — a monoid (Lesson 141) will turn out to be an abstraction over "combine two things," a group (Lesson 143) an abstraction over "reversible combination," and so on. Also recognized in: an interface in any typed language (Java's `List`, promising operations without promising `ArrayList` or `LinkedList` underneath); Big-O notation itself (Lesson 51), discarding constant factors and lower-order terms as irrelevant detail while preserving growth rate as the relevant structure; a car's steering wheel, which abstracts over an engine's actual mechanism entirely.

### SE Lens

The real, ongoing cost of this restriction is that it has to be actively maintained — Lesson 106's abstraction barrier isn't free, it's a discipline: every future stack-using function has to be written against `push`/`pop`/`peek` only, on purpose, or the very first accidental `get`-on-a-raw-stack silently reintroduces a dependency on one specific representation, exactly the way this unit's own `(get s 0)` did. The alternative — never abstracting at all, writing every caller against one fixed representation directly — costs nothing to maintain and is strictly more fragile: swapping `s`'s list for `v`'s vector later would require rewriting every caller, not just the two functions that actually changed.

### Connection to the previous unit

The previous unit proved the two stacks agree on everything the interface promises; this unit shows precisely where that agreement was never guaranteed to extend — the boundary of the interface itself, not a limitation of this particular pair of implementations.

---

## Connect the Pieces

Both stacks, built from the identical three pushes, agreeing everywhere the interface promises and nowhere else:

```clojure
(println "List-based peek:" (stack-peek s) "Vector-based peek:" (vstack-peek v))
(println "List-based raw:" s "Vector-based raw:" v)
(println "get on list-based raw:" (get s 0) "get on vector-based raw:" (get v 0))
```

```
List-based peek: 30 Vector-based peek: 30
List-based raw: (30 20 10) Vector-based raw: [10 20 30]
get on list-based raw: nil get on vector-based raw: 10
```

Same interface, same answers; different representation, different everything else the moment that interface is bypassed.

## What Breaks Without This

Suppose a much larger program used Lesson 86's list-based stack directly everywhere — not through `push`/`pop`/`peek`, but by calling `first`/`rest`/`cons` on stack values inline, all over the codebase, because "it's just a list anyway." Switching to the vector-based version later — for real reasons, like Lesson 83's own cost profiles favoring one representation for a specific workload — would require finding and rewriting every single one of those inline call sites, with no reliable way to know they'd all been found. Restricting every caller to `push`/`pop`/`peek` from the start means that swap touches exactly two functions: `stack-push`/`stack-pop`/`stack-peek` themselves, replaced by `vstack-push`/`vstack-pop`/`vstack-peek` — nothing else in the whole program even needs to know a swap happened.

## Exercises

1. **Trace.** By hand, using `cons`'s and `assoc`-as-append's own definitions, explain why `s`'s raw value ends up in the opposite order from `v`'s after the identical three pushes.
2. **Predict.** Before checking, predict `(vstack-pop (vstack-pop (vstack-pop v)))` — three pops from a three-element vstack. Then verify what `pop` does when nothing is left.
3. **Verify.** Confirm `stack-peek` and `vstack-peek` still agree after a longer, mixed sequence of your own choosing — at least two pushes, a pop, then another push.
4. **Break it, on purpose, differently.** Find a *second* operation, besides `get`, that behaves differently on `s`'s raw list versus `v`'s raw vector, and explain why.
5. **Generalize.** Describe, without coding it, a third stack implementation — built on neither a list nor a vector — that would still be observationally equivalent to both of these, as long as it correctly implements `push`/`pop`/`peek`.
6. **Reconstruct.** Close this lesson. From memory, explain the difference between "these two things happen to behave the same" and "these two things are provably observationally equivalent," using this lesson's own `get` example as the reason the distinction matters.

## Definition of Done

- [ ] You can build a second, representation-different implementation of an already-existing ADT and explain why its interface, not its internals, is what has to match.
- [ ] You can state this lesson's own definition of abstraction and name Lesson 106's abstraction barrier and Lesson 90's abstract data type as concrete instances of it.
- [ ] You can explain why `(get s 0)` returning `nil` is a real example of an abstraction "leaking," not a bug in this lesson's code.
- [ ] You completed Exercise 3 and confirmed both stacks agree on a longer sequence of your own operations.
- [ ] You completed Exercise 4 and found a second operation that distinguishes the two raw representations.
- [ ] Commit your Exercise 3 and Exercise 4 work to your notes repository, with a commit message stating what you confirmed and found — for example, `"Confirm stack-peek/vstack-peek agree on a 5-operation sequence; find get and count behave differently on raw list vs. vector"` — not just `"lesson 139 exercise"`.

---

**Next lesson:** Lesson 140, *Algebraic Structures*, generalizes this lesson's own idea one level further — not just "two representations, one interface," but a precise vocabulary (operations, closure, identity, inverses, associativity) for describing exactly *what* an interface like this lesson's `push`/`pop`/`peek` is allowed to promise in the first place.
