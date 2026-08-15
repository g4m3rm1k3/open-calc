# Lesson 10: Sets as Computational Collections

**What you will build**: By the end of this lesson you'll be working with this series' first real collection type — sets — checking membership, combining sets three different ways, and testing whether one set is entirely contained in another. You'll also see, precisely, what a Cartesian product is, even though building one in code is left for Section II, once this series has the tools (nested iteration) it actually needs.

**What you need to know first**: Lesson 9's *domain* (an explicit, small group of values a quantified claim ranges over) — a set is the same idea, made into a real, checkable Clojure value instead of just an informally written-out list.

**Terms introduced in this lesson**:

- **set** — a collection of values with no duplicates and no meaningful order. *Why it matters*: this is the first real collection type in this series — Lesson 9's informal "domain" (`{10, -5, 30}`, written out by hand) becomes an actual value you can bind, pass to functions, and compute with.
- **membership** — the question of whether a specific value belongs to a set. *Why it matters*: every other set operation this lesson covers (union, intersection, difference, subset) is ultimately defined in terms of this one, most basic question.
- **namespace** — a named collection of functions and bindings, kept separate from Clojure's core so unrelated tools don't collide by name. *Why it matters*: this lesson's set operations (`union`, `intersection`, and so on) aren't automatically available the way `+` or `if` are — they live in a separate namespace, `clojure.set`, and `require` (Concept Unit 2) is what makes a namespace's contents reachable.
- **Cartesian product** — the set of all ordered pairs formed by taking one element from a first set and one from a second. *Why it matters*: this is the mathematical foundation behind Lesson 123's graphs (an edge is a pair of vertices) and, much later, relational databases' joins — introduced here precisely, even though constructing one in code waits for Section II's nested iteration.

**Objects and methods used**:

- **`contains?`**
  - *What it is:* a function in Clojure's core library that tests set membership.
  - *Implementation:* `(contains? a-set value)` returns `true` if `value` is a member of `a-set`, `false` otherwise — verified this session: `(contains? #{1 2 3} 2)` → `true`, `(contains? #{1 2 3} 5)` → `false`.
  - *Its use:* Concept Unit 1, this lesson's first set operation.
- **`require`**
  - *What it is:* a Clojure special form that loads a namespace, making its functions available.
  - *Implementation:* `(require '[clojure.set :as set])` loads the `clojure.set` namespace and binds it to the short alias `set`, so its functions can be called as `set/union`, `set/intersection`, and so on, instead of the full name `clojure.set/union`.
  - *Its use:* Concept Unit 2, before any of this lesson's union, intersection, difference, or subset operations can be called.
- **`clojure.set/union`**
  - *What it is:* a function, in the `clojure.set` namespace, that combines two sets into one containing every element from either.
  - *Implementation:* `(set/union a b)` — verified this session: `(set/union #{1 2 3} #{3 4 5})` → `#{1 2 3 4 5}` (printed order not guaranteed — Concept Unit 1 covers why).
  - *Its use:* Concept Unit 2.
- **`clojure.set/intersection`**
  - *What it is:* a function, in the `clojure.set` namespace, that produces the set of elements common to two sets.
  - *Implementation:* `(set/intersection a b)` — verified this session: `(set/intersection #{1 2 3} #{3 4 5})` → `#{3}`.
  - *Its use:* Concept Unit 2.
- **`clojure.set/difference`**
  - *What it is:* a function, in the `clojure.set` namespace, that produces the elements of the first set that are not also in the second.
  - *Implementation:* `(set/difference a b)` — verified this session: `(set/difference #{1 2 3} #{3 4 5})` → `#{1 2}`; verified *not* symmetric: `(set/difference #{3 4 5} #{1 2 3})` → `#{4 5}`, a different result from swapping the arguments.
  - *Its use:* Concept Unit 2.
- **`clojure.set/subset?`**
  - *What it is:* a function, in the `clojure.set` namespace, that tests whether every element of one set also belongs to another.
  - *Implementation:* `(set/subset? a b)` returns `true` if every element of `a` is in `b` — verified this session: `(set/subset? #{1 2} #{1 2 3})` → `true`, `(set/subset? #{1 2 9} #{1 2 3})` → `false`.
  - *Its use:* Concept Unit 3.

---

## Concept Unit: Sets and Membership

### The Problem

Lesson 9 wrote domains like `{10, -5, 30}` in plain prose, checked by writing one `and`/`or` clause per member by hand. That works, but the "domain" itself was never a real value — nothing could be bound to a name, passed to a function, or reused the way Lesson 3's bindings could. Is there a real Clojure value for "a group of distinct things," the way there's already a value for a number or a boolean?

### Introduce the concept in isolation

```
user=> #{1 2 3}
#{1 3 2}
```

`#{1 2 3}` is a **set** literal — notice the printed result, `#{1 3 2}`, is in a *different order* than it was written. This is the first real, verified proof of something worth stating precisely: a set has no meaningful order. Two sets with the same members are the same set, regardless of what order those members were listed in.

Check membership — whether a specific value belongs to a set:

```
user=> (contains? #{1 2 3} 2)
true
user=> (contains? #{1 2 3} 5)
false
```

Now try to write a set with a repeated element:

```
user=> #{1 2 2 3}
----- Error --------------------------------------------------------------------
Type:     clojure.lang.ExceptionInfo
Message:  Set literal contains duplicate key: 2
```

A real, verified error — Clojure refuses to even *parse* a set literal with a duplicate, rather than silently discarding the repeat. This proves "no duplicates" is not a loosely-enforced suggestion; it's checked immediately, the moment the set is written, the same way Lesson 4's arity was checked before a function body ever ran.

### Discard the throwaway example

REPL-only, same as prior lessons' early examples.

### Project Change

- **Reference Source**: No reference counterpart.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(contains? #{1 2 3} 2)
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`#{` … `}`** — first appearance: Clojure's syntax for a set literal. Distinct from the parentheses covered in Lesson 2 (which mean "call this operator on these operands") — `#{...}` means "here is a collection of distinct values," with no operator being applied to anything.
- **`1 2 3`** — reappearing numeric literals (Lesson 2), here playing a new role: members of a set rather than operands to a function call.
- **`contains?`** — first appearance as a called function (covered fully in Objects and methods used, above): tests membership.

### CS Lens

A collection with no duplicates and no order is the exact mathematical object underlying a database's `DISTINCT` query result, a tag system (a photo either has the tag "vacation" or it doesn't — no meaning to "how many times," no meaning to "which order the tags were added"), and Lesson 89's *hash tables*, which this series will show are frequently how a set is actually implemented under the hood — membership checking in roughly constant time, regardless of the set's size.

### SE Lens

Choosing a set instead of, say, a list (Lesson 24, not yet covered) is a real design decision, not a stylistic one: a set makes "does this contain duplicates" and "is order significant" both *impossible to ask*, because the data structure itself rules them out — Lesson 106 (*Representation Invariants*) formalizes this idea directly: choosing a representation that makes an invalid state unrepresentable is stronger than merely promising, in a comment, not to create one.

---

## Concept Unit: Combining Sets — Union, Intersection, and Difference

### The Problem

Suppose one set names every account holder with a checking account, and a second names every holder with a savings account. "Everyone with either account," "everyone with both," and "everyone with checking but not savings" are three different, genuinely useful questions — none of them answerable by `contains?` alone, which only ever asks about one specific value at a time.

### Introduce the concept in isolation

Combining sets lives in a separate **namespace** from Clojure's core — `clojure.set` — and has to be loaded before its functions are reachable:

```clojure
(require '[clojure.set :as set])
(def checking-holders #{"alice" "bob" "carol"})
(def savings-holders #{"bob" "carol" "dave"})

(println "union:" (set/union checking-holders savings-holders))
(println "intersection:" (set/intersection checking-holders savings-holders))
(println "difference (checking - savings):" (set/difference checking-holders savings-holders))
(println "difference (savings - checking):" (set/difference savings-holders checking-holders))
```

Run it:

```
union: #{dave bob alice carol}
intersection: #{bob carol}
difference (checking - savings): #{alice}
difference (savings - checking): #{dave}
```

Three genuinely different results from the same two sets: **union** (everyone in either), **intersection** (everyone in both), and **difference** (everyone in the first but not the second). The last two lines prove difference is *not symmetric* — `checking-holders` minus `savings-holders` gives `alice` (in checking, not savings); the same two sets in the opposite order give `dave` (in savings, not checking) — a completely different answer, from swapping which set comes first.

### Discard the throwaway example

REPL-only for this specific example — though `checking-holders` and `savings-holders` are worth remembering for the exercises below.

### Project Change

- **Reference Source**: No reference counterpart.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(require '[clojure.set :as set])
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`require`** — first appearance (covered fully in Objects and methods used, above): loads `clojure.set` and binds it to the short alias `set`.
- **`'[clojure.set :as set]`** — the argument to `require`: names the namespace to load (`clojure.set`) and the alias to call it by (`set`). The leading `'` prevents this from being evaluated as ordinary code (a full explanation of `'` is out of scope for this lesson — for now, treat `(require '[...])` as a fixed pattern to type exactly this way).
- **`set/union`, `set/intersection`, `set/difference`** — first appearance of the `namespace/function-name` pattern: each names a function that lives inside the `set` namespace, distinguishing it from any same-named function that might exist elsewhere (there's no core `union` function to confuse this with, but the pattern matters once more namespaces are in play).

### CS Lens

Union, intersection, and difference are the same three operations behind a spreadsheet's `VLOOKUP`-adjacent set logic, a search engine combining results ("pages matching *either* keyword" is a union; "matching *both*" is an intersection), and a relational database's `JOIN`, `INTERSECT`, and `EXCEPT` clauses, named almost identically. Lesson 148 (*Graphs as Relations*) and Lesson 221 (*Databases*) both build directly on this exact vocabulary.

### SE Lens

Loading `clojure.set` as a separate namespace, rather than having `union`/`intersection`/`difference` available everywhere by default, keeps Clojure's core small and avoids every namespace needing to guess which names might collide with someone else's — the same tradeoff Lesson 275 (*Modularity*) examines at a much larger scale: a boundary around related functionality, entered deliberately (`require`), rather than one enormous shared pool of names.

### Connection to the previous unit

The previous unit established `contains?` as the single most basic set question; this unit builds three new sets *out of* existing ones — each still, ultimately, defined by which values are members, just computed from two sets instead of asked about one.

---

## Concept Unit: Subsets

### The Problem

"Every checking-account holder also has a savings account" is a different kind of claim than union, intersection, or difference answer directly — it's not asking for a *new set*, it's asking a yes/no question about whether one set is entirely contained within another.

### Introduce the concept in isolation

```
user=> (require '[clojure.set :as set])
user=> (set/subset? #{1 2} #{1 2 3})
true
user=> (set/subset? #{1 2 9} #{1 2 3})
false
```

`#{1 2}` is fully contained in `#{1 2 3}` — every one of its members is also a member of the larger set — so `subset?` reports `true`. `#{1 2 9}` isn't, because `9` isn't in `#{1 2 3}` — one missing member is enough to make the whole claim `false`, the exact same "one counterexample settles it" shape Lesson 9's universal quantification already established.

### Discard the throwaway example

REPL-only.

### Project Change

- **Reference Source**: No reference counterpart.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka; `clojure.set`, already required.

### The New Code — type it yourself

```clojure
(set/subset? #{1 2} #{1 2 3})
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`set/subset?`** — first appearance (covered fully in Objects and methods used, above): tests whether every member of its first argument is also a member of its second.

### CS Lens

"Is every element of this set also in that one" is literally Lesson 9's universal quantifier ("for all x in the first set, x is a member of the second"), restated as a single named operation instead of a written-out chain of `and`s — proof that a set's operations aren't a new, separate idea from this series' logic lessons, but a direct application of them to a real collection type. Also recognized in: a permissions system checking "does this user's role include every permission this action requires" (a subset check, in disguise), and a shopping list app confirming "everything on my list is already in my cart."

### SE Lens

Having `subset?` as a single, named, correctly-implemented operation removes the temptation to hand-write the equivalent chain of membership checks every time the question comes up — the same reuse benefit Lesson 4 established for `square`, now for a logical claim about two whole collections instead of one arithmetic rule.

### Connection to the previous unit

The previous unit built new sets from old ones; this unit asks a yes/no question comparing two sets directly, without constructing anything new — closer in spirit to `contains?` (Concept Unit 1) than to union or intersection, just checking many members at once instead of one.

---

## Concept Unit: Cartesian Products

### The Problem

Suppose a small bank offers two account types, `{"checking", "savings"}`, and two currencies, `{"USD", "EUR"}`. "Every possible combination of account type and currency" is a real, useful thing to enumerate — four specific pairs — but it isn't a union, intersection, difference, or subset of anything. What operation produces "every combination of one element from each set"?

### Introduce the concept in isolation

By hand, list every combination of one element from `{"checking", "savings"}` and one from `{"USD", "EUR"}`:

```
("checking", "USD")
("checking", "EUR")
("savings", "USD")
("savings", "EUR")
```

Four pairs, from two sets of size two — every element of the first set paired with every element of the second, systematically, none skipped and none repeated. This is the **Cartesian product**: the set of every ordered pair `(a, b)` where `a` comes from the first set and `b` from the second.

Producing this in real code needs a way to say "for each element of the first set, and for each element of the second, produce a pair" — which needs iteration over a collection whose size isn't fixed in advance, exactly the tool Section II's lists and recursion (starting Lesson 19) build. For now, this stays a hand-enumerated concept, the same way Lesson 9 checked quantified claims by hand before Section II could automate them.

### Generalizing

The size of a Cartesian product follows directly from counting: two sets of size two produce four pairs; a set of size three and a set of size four would produce twelve. This connects forward to Lesson 60 (*Addition and Multiplication Rules*), which derives exactly this counting fact formally, and to Lesson 235 (*Matrix Multiplication*), where indexing "every row against every column" is this same combinatorial shape again.

### Formal Definition, Walked Through

> The **Cartesian product** of two sets *A* and *B*, written *A × B*, is the set of all ordered pairs *(a, b)* where *a* is a member of *A* and *b* is a member of *B*.

- *"ordered pairs"* — `(a, b)` and `(b, a)` are different pairs (unless `a` equals `b`), even though `{a, b}` and `{b, a}` would be the identical *set*. This is the one place in this lesson where order suddenly matters again, despite Concept Unit 1 establishing that sets themselves have none — the *pairs* are ordered, even though the *set of all such pairs* is not.
- *"a is a member of A and b is a member of B"* — every combination, with nothing excluded and nothing repeated; the by-hand enumeration above is exactly this definition, carried out completely for two small sets.

### CS Lens

The Cartesian product is the mathematical shape behind a spreadsheet's two-dimensional grid (every row index paired with every column index), a graph's complete set of possible directed edges between two groups of vertices (Lesson 123), and a database join with no matching condition at all — literally called a "Cartesian join," producing every combination of rows from two tables, named after exactly this operation.

### SE Lens

Recognizing "every combination of these two things" as a Cartesian product, specifically, rather than reaching for ad-hoc nested logic each time, is what makes Lesson 59's counting principle ("how many combinations are there") and Section VI's algorithm-design vocabulary applicable immediately once real iteration exists — the concept doesn't have to be rediscovered later; only the mechanism for constructing it does.

### Connection to the previous unit

The previous three units all combined or compared sets that already existed, in ways that stay entirely within "is this a member" (Concept Unit 1's core question); a Cartesian product is the first operation in this lesson that builds something new *out of* two sets' members, rather than just filtering or comparing them.

---

## Connect the Pieces

One file, exercising membership, union, intersection, difference, and subset together (Cartesian product stays a hand-worked concept, per Concept Unit 4, until Section II):

```clojure
(require '[clojure.set :as set])

(def checking-holders #{"alice" "bob" "carol"})
(def savings-holders #{"bob" "carol" "dave"})
(def both-accounts (set/intersection checking-holders savings-holders))

(println "Has both account types:" both-accounts)
(println "Alice has both:" (contains? both-accounts "alice"))
(println "Bob has both:" (contains? both-accounts "bob"))
(println "Everyone with checking only:" (set/difference checking-holders savings-holders))
(println "Every checking holder is a bank customer:"
         (set/subset? checking-holders (set/union checking-holders savings-holders)))
```

Run it:

```
Has both account types: #{bob carol}
Alice has both: false
Bob has both: true
Everyone with checking only: #{alice}
Every checking holder is a bank customer: true
```

`intersection` (Concept Unit 2) builds `both-accounts`; `contains?` (Concept Unit 1) checks specific membership in that new set; `difference` (Concept Unit 2) finds the checking-only holders; and `subset?` (Concept Unit 3) confirms a claim that's true by construction — every checking holder is, trivially, part of the union of checking and savings holders — a small proof that these operations compose correctly with each other, not just in isolation.

## What Breaks Without This

Suppose `difference`'s argument order were assumed not to matter — a natural mistake, since `union` and `intersection` genuinely *don't* care about argument order (swapping them gives the same set back, unlike `difference`):

```
user=> (require '[clojure.set :as set])
user=> (= (set/union #{1 2 3} #{3 4 5}) (set/union #{3 4 5} #{1 2 3}))
true
user=> (= (set/difference #{1 2 3} #{3 4 5}) (set/difference #{3 4 5} #{1 2 3}))
false
```

`union`'s order genuinely doesn't matter (both orders are `=`-equal, Lesson 6); `difference`'s does — the two are not `=`-equal, confirming Concept Unit 2's claim with Lesson 6's own equality check rather than just prose. Code that computes "everyone with checking but not savings" and accidentally writes `(set/difference savings-holders checking-holders)` instead of the reverse wouldn't error — it would silently answer a different, specific-sounding, wrong question: "everyone with savings but not checking."

## Exercises

1. **Trace.** By hand, compute `(set/union #{"a" "b"} #{"b" "c"})`, `(set/intersection #{"a" "b"} #{"b" "c"})`, and both directions of `(set/difference ...)` for the same two sets, before running any of them.
2. **Predict.** Predict whether `(set/subset? #{} #{"a" "b" "c"})` (the empty set, `#{}`, as the first argument) is `true` or `false`, using this lesson's definition of subset. Run it and check.
3. **Membership.** Using `checking-holders` and `savings-holders` from this lesson, write and check a claim using Lesson 9's vocabulary: "there exists an account holder who has checking but not savings."
4. **Break it, on purpose.** Compute `(set/difference savings-holders checking-holders)` and `(set/difference checking-holders savings-holders)`, and explain, in one sentence each, what real-world question each one actually answers.
5. **Generalize.** By hand, list the full Cartesian product of `{"checking", "savings", "money-market"}` and `{"USD", "EUR"}`. How many pairs are there, and does that match what Lesson 60 (forward reference) would predict from simply multiplying the two sets' sizes?
6. **Reconstruct.** Close this lesson. From memory, explain why `set/union`'s printed result can appear in a different order each time you run it, and why that's not a bug.

## Definition of Done

- [ ] You can create a set, check membership, and explain why `#{1 2 2}` is a parse error rather than a silently-deduplicated set.
- [ ] You can compute union, intersection, and both directions of difference for two sets, and explain why only difference depends on argument order.
- [ ] You completed Exercise 3, restating a subset-adjacent claim using Lesson 9's quantifier vocabulary.
- [ ] You can define a Cartesian product precisely, by hand, for two small sets, even without code to construct one yet.
- [ ] Commit your Exercise 5 Cartesian product (written out by hand, as a comment or a plain list in a notes file) to your notes repository, with a commit message stating how many pairs you expected before counting them — for example, `"List account-type x currency Cartesian product — predicted 3x2=6 pairs before enumerating"` — not just `"lesson 10 exercise"`.

---

**Next lesson:** Lesson 11, *Relations*, is where a Cartesian product stops being just "every possible pair" and becomes the starting point for something far more useful: a *specific*, meaningful subset of those pairs — the mathematical object behind databases, graphs, and dependencies alike.
