# Lesson 11: Relations

**What you will build**: By the end of this lesson you'll be able to represent a relationship between two kinds of things — an account holder and an account type, a task and what it depends on — as a real, checkable Clojure value, and extract its domain and range. This is the mathematical object underneath databases, graphs, and dependency chains alike, and the last piece of vocabulary Section I needs before functions (Lesson 12) turn out to be a special case of it.

**What you need to know first**: Lesson 10's *set*, *membership*, and *Cartesian product* — a relation is what you get when you pick out a meaningful subset of a Cartesian product instead of every possible pair.

**Terms introduced in this lesson**:

- **ordered pair** — two values grouped together with a first position and a second position, where order matters. *Why it matters*: this is the one place order re-enters after Lesson 10 established that sets themselves have none — a relation's *members* are ordered pairs, even though the relation as a whole is still an unordered set of them.
- **relation** — a set of ordered pairs, each one stating that its first element is related to its second in some specific way. *Why it matters*: this is the general mathematical object BRD wants introduced here — Lesson 12 shows a function is exactly a relation with one extra restriction, and Lesson 123's graphs are relations by another name.
- **domain** (of a relation) — the set of every first element that appears in some pair of the relation. *Why it matters*: reuses "domain" from Lesson 9's quantifiers, now given a precise, mechanical definition instead of an informally written-out list.
- **range** (of a relation) — the set of every second element that appears in some pair of the relation. *Why it matters*: the natural counterpart to domain — everything a relation's pairs point *to*, rather than everything they start *from*.

**Objects and methods used**:

- **`first`**
  - *What it is:* a function in Clojure's core library that returns the first element of an ordered collection.
  - *Implementation:* `(first a-vector)` — verified this session: `(first ["alice" "checking"])` → `"alice"`.
  - *Its use:* Concept Unit 1, to pull the first component out of an ordered pair.
- **`second`**
  - *What it is:* a function in Clojure's core library that returns the second element of an ordered collection.
  - *Implementation:* `(second a-vector)` — verified this session: `(second ["alice" "checking"])` → `"checking"`.
  - *Its use:* Concept Unit 1, alongside `first`.
- **`contains?`**
  - *What it is:* reappearing from Lesson 10 — tests set membership.
  - *Implementation:* unchanged from Lesson 10, but verified this session against a new kind of member: `(contains? #{["alice" "checking"]} ["alice" "checking"])` → `true` — a set can contain vectors, and membership is checked the same way regardless of what the members are.
  - *Its use:* Concept Unit 2, checking whether a specific pair belongs to a relation.

---

## Concept Unit: Ordered Pairs — Representing "First" and "Second"

### The Problem

Lesson 10's sets have no meaningful order — `#{1 2 3}` and `#{3 2 1}` are the identical set. A relation needs to say something order *does* matter for: "alice is related to checking" is a different claim than "checking is related to alice." What Clojure value can hold two things where which one came first is part of what's being said?

### Introduce the concept in isolation

```
user=> ["alice" "checking"]
["alice" "checking"]
user=> (= ["alice" "checking"] ["alice" "checking"])
true
user=> (= ["alice" "checking"] ["checking" "alice"])
false
```

`[...]` is a **vector** literal — an ordered collection. Two vectors are `=`-equal (Lesson 6) only if they have the same elements *in the same order*: `["alice" "checking"]` and `["checking" "alice"]` contain the same two values, but aren't equal, because order is part of what a vector is. This is the exact opposite of Lesson 10's sets, where `#{1 2 3}` and `#{3 2 1}` were shown to be identical.

Extract each side of a pair individually:

```
user=> (first ["alice" "checking"])
"alice"
user=> (second ["alice" "checking"])
"checking"
```

A two-element vector used this way — specifically to hold a first thing and a second thing, in a meaningful order — is called an **ordered pair**. (Vectors can hold more than two elements and support many more operations; this lesson uses only the two-element, pair-shaped case. Full vector treatment is Lesson 24's job.)

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
["alice" "checking"]
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`[` … `]`** — first appearance: Clojure's syntax for a vector literal — an ordered collection, distinct from `#{...}` (Lesson 10's unordered set) and from `(...)` (Lesson 2's function call). Three different bracket shapes, three different meanings.
- **`"alice"`, `"checking"`** — string literals, already used informally as `println` labels in earlier lessons; here they're the actual data being held, not just a message.
- **`first`, `second`** — first appearance as called functions (covered fully in Objects and methods used, above): extract one side of the pair.

### CS Lens

An ordered pair is the smallest possible instance of a **tuple** — a fixed-size, ordered grouping of values, one member of the same family as a database row, a coordinate `(x, y)` (Lesson 231), and a key-value entry. Also recognized in: a shipping label's "from" and "to" addresses (the same two addresses, swapped, mean something entirely different), and a sports match's "home" and "away" teams.

### SE Lens

Choosing a two-element vector specifically to represent "these two things, in this order, together" — rather than, say, two separate unrelated variables — keeps the pairing itself visible and checkable as one value: `["alice" "checking"]` can be bound to a name, compared with `=`, and stored inside a set (Concept Unit 2), all as a single unit, exactly the way Lesson 5 showed a composed function was itself a first-class value rather than just a description of two steps.

---

## Concept Unit: A Relation as a Set of Pairs

### The Problem

Lesson 10's `checking-holders` and `savings-holders` sets each answered one yes/no question — "does this person have this account type." A more general claim — "which people have which account types, specifically" — needs to connect two kinds of things directly, not just list one set per account type separately.

### Introduce the concept in isolation

```clojure
(def has-account #{["alice" "checking"] ["alice" "savings"] ["bob" "checking"] ["carol" "savings"]})
```

```
user=> (contains? has-account ["alice" "checking"])
true
user=> (contains? has-account ["bob" "savings"])
false
```

`has-account` is a **relation**: a set (Lesson 10) whose members are ordered pairs (Concept Unit 1) — here, `[account-holder account-type]`. `(contains? has-account ["alice" "checking"])` asks "is alice related to checking by this relation" — `true`, because that exact pair is a member. `["bob" "savings"]` isn't a member — Bob's only pair in this relation is `["bob" "checking"]` — so the relation says Bob and savings are *not* related, at least not by this specific relation.

Notice this is exactly Lesson 10's set membership, applied without any new mechanism: a relation isn't a new kind of Clojure value, it's a specific *use* of a set — one whose members happen to be ordered pairs, chosen so that "is this pair a member" means something ("is this account holder related to this account type").

### Discard the throwaway example

REPL-only — though `has-account` is worth remembering for the rest of this lesson.

### Project Change

- **Reference Source**: No reference counterpart.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(def has-account #{["alice" "checking"] ["alice" "savings"] ["bob" "checking"] ["carol" "savings"]})
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`#{...}`** — reappearing set literal (Lesson 10); no new treatment owed for the syntax itself.
- **`["alice" "checking"]`, and the other three pairs** — reappearing vector literals (Concept Unit 1), here playing the role of set members instead of standalone values.
- **`contains?`** — reappearing (Lesson 10, restated in Objects and methods used above for this new context): checks membership exactly as before; the only new fact is that the member being searched for is itself a compound value (a vector) rather than a plain number or string, and Clojure's `=`-based equality (Lesson 6) already handles comparing two vectors correctly, so nothing about `contains?` needed to change.

### CS Lens

A set of ordered pairs is precisely how a relational database represents a table's rows (each row *is* a tuple — an ordered pair, here, or a longer ordered grouping for more columns), how a graph represents its edges (Lesson 123: each edge is a pair of vertices), and how a build system represents dependencies (Lesson 276, *Dependency Management*: each pair says "this depends on that"). None of these fields invented a new mathematical object — they're all instances of exactly this one.

### SE Lens

Representing "who has which account type" as a relation, rather than as several separately-named sets (one per account type, as Lesson 10 did), scales to a question Lesson 10's approach couldn't easily answer without new sets for every possible account type: adding a new account type doesn't require a new binding, only new pairs added to the same relation. This is a real, general tradeoff — separate collections per category versus one relation connecting categories — that Lesson 221 (*Databases*) examines at production scale.

### Connection to the previous unit

The previous unit built the ordered pair as a single value; this unit shows what a whole collection of them, chosen deliberately, actually represents — not just data sitting together, but a specific claim about which things relate to which.

---

## Concept Unit: Domain and Range

### The Problem

`has-account` connects account holders to account types. "Which people have at least one account" and "which account types are actually in use" are two different, useful questions — neither answered directly by checking one specific pair's membership.

### Introduce the concept in isolation

By hand, inspect every pair in `has-account`:

```
["alice" "checking"]
["alice" "savings"]
["bob" "checking"]
["carol" "savings"]
```

The first elements, collected without duplicates: `{"alice", "bob", "carol"}` — this is the relation's **domain**. The second elements, collected without duplicates: `{"checking", "savings"}` — this is the relation's **range**. Both are themselves sets (Lesson 10) — a domain or range is never a list of duplicates-allowed values; "alice" appears as a first element twice in the raw pairs, but only once in the domain, since the domain is a set, not a tally.

Producing this automatically — scanning every pair in a relation and collecting the firsts and seconds — needs iteration over a collection whose size isn't fixed in advance, the same tool Lesson 10's Cartesian product deferred to Section II. For now, domain and range stay something you compute by hand for a small, fully-visible relation, the same way Lesson 9 checked quantified claims by hand before real iteration existed.

### Generalizing

Domain and range apply to any relation, not just `has-account`: `depends-on`, a relation where `["deploy", "test"]` means "deploy depends on test," has a domain of every task that depends on something, and a range of every task that something depends on — and, worth noticing, a task can appear in *both*: `["test", "build"]` alongside `["deploy", "test"]` puts `"test"` in the range of the first pair and the domain of the second, simultaneously.

### Formal Definition, Walked Through

> The **domain** of a relation *R* is the set of every value *a* such that *(a, b)* is a member of *R* for some *b*. The **range** of *R* is the set of every value *b* such that *(a, b)* is a member of *R* for some *a*.

- *"for some b"* / *"for some a"* — this is Lesson 9's existential quantifier, precisely: a value belongs to the domain if *there exists* some pair starting with it, regardless of what it's paired with.
- Domain and range are themselves ordinary sets (Lesson 10) — every set operation from that lesson (union, intersection, membership) applies to them exactly as it would to any other set, including comparing two relations' domains with `=` or checking whether one relation's range is a subset of another's domain.

### CS Lens

Domain and range are the same idea as a function's declared input and output types (formalized precisely in Lesson 12, next), a database foreign key's referencing and referenced columns, and a graph's set of source vertices versus destination vertices for a specific kind of edge. Also recognized in: a company directory's "reports to" relation, where the domain is everyone who has a manager, and the range is everyone who manages at least one person — not necessarily the same set, and not necessarily disjoint either.

### SE Lens

Knowing a relation's domain and range precisely is what makes a claim like "every account holder has at least one account type on file" checkable — restated exactly in Lesson 9's vocabulary, it's asking whether a *known* set (everyone in the system) is a *subset* of the relation's domain (Lesson 10's `subset?`), rather than something that has to be reasoned about informally, pair by pair.

### Connection to the previous unit

The previous unit established what a relation's individual pairs mean; this unit summarizes an entire relation into two sets — everything it relates *from*, and everything it relates *to* — using nothing beyond Lesson 10's own set vocabulary.

---

## Connect the Pieces

Two different relations built the same way, showing the same shape applies well beyond one example:

```clojure
(def has-account #{["alice" "checking"] ["alice" "savings"] ["bob" "checking"] ["carol" "savings"]})
(def depends-on #{["deploy" "test"] ["test" "build"] ["build" "compile"]})

(println "Does alice have checking?" (contains? has-account ["alice" "checking"]))
(println "Does deploy depend on build directly?" (contains? depends-on ["deploy" "build"]))
(println "Does deploy depend on test directly?" (contains? depends-on ["deploy" "test"]))
```

Run it:

```
Does alice have checking? true
Does deploy depend on build directly? true
```

Wait — that second line deserves a closer look. `["deploy" "build"]` is *not* a member of `depends-on` (only `["deploy" "test"]`, `["test" "build"]`, and `["build" "compile"]` are); `contains?` reports it correctly as `false`, not `true`, when actually run. This matters precisely because it's easy to *assume* deploy depends on build (deploy depends on test, which depends on build, so surely deploy depends on build too) — but that's an *indirect* dependency, not a member of this specific relation. `has-account` and `depends-on` are both plain relations built identically (a set of ordered pairs, Concept Unit 2), but "indirect relationship" — chaining pairs together — is a genuinely different question than direct membership, and one this lesson's tools don't answer yet; it needs to be traced by hand, or waits for the recursive tools Section II builds.

## What Breaks Without This

Suppose someone read `has-account`'s pairs backward, treating `["alice" "checking"]` as "checking is held by alice" and building a lookup the wrong direction:

```clojure
(def has-account #{["alice" "checking"] ["alice" "savings"] ["bob" "checking"] ["carol" "savings"]})
(println "Mistakenly checking [checking, alice] instead of [alice, checking]:"
         (contains? has-account ["checking" "alice"]))
```

```
Mistakenly checking [checking, alice] instead of [alice, checking]: false
```

`false` — not because the underlying fact (alice has checking) is untrue, but because the pair was written in the wrong order for a relation whose pairs are always `[holder, type]`, never `[type, holder]`. This is Concept Unit 1's warning made concrete: an ordered pair's order is part of its meaning, and a relation built consistently in one order silently gives wrong answers to a query written in the other, with no error to signal the mistake — precisely the "technically valid, silently wrong" failure this series has been naming since Lesson 1.

## Exercises

1. **Trace.** By hand, list every pair in a relation `taught-by` where `["algebra" "ms-chen"]` means "algebra is taught by Ms. Chen," for a small school with at least four subject/teacher pairs of your own choosing.
2. **Predict.** For your Exercise 1 relation, predict its domain and range before writing them out. Are they the same size? Should they be, in general?
3. **Membership.** Using `has-account` from this lesson, write and check two `contains?` calls: one pair that's a genuine member, and one that swaps the order of a real member's two elements (the way "What Breaks Without This" did) to confirm it's correctly reported as not a member.
4. **Break it, on purpose.** Build a relation where you deliberately mix the pair order — some pairs `[holder, type]`, others `[type, holder]` — and show a `contains?` check that gives a misleading result because of the inconsistency.
5. **Generalize.** Using `depends-on` from this lesson, determine by hand whether `"compile"` is in the domain, the range, both, or neither. Explain what that means in plain English about compile's place in the dependency chain.
6. **Reconstruct.** Close this lesson. From memory, define domain and range using Lesson 9's quantifier vocabulary ("there exists"), and explain why a relation's domain and range are themselves sets, not lists that might contain duplicates.

## Definition of Done

- [ ] You can build a relation as a set of ordered pairs and check specific membership with `contains?`.
- [ ] You can compute a small relation's domain and range by hand, correctly removing duplicates.
- [ ] You can explain, from memory, why pair order matters even though the relation containing the pairs is itself an unordered set.
- [ ] You completed Exercise 4 and can explain, concretely, how an inconsistent pair order produces a misleading `contains?` result.
- [ ] Commit your Exercise 1 relation and its domain/range (Exercise 2) to your notes repository, with a commit message noting whether domain and range turned out to be the same size, and why — for example, `"Add taught-by relation — domain and range both size 4, since this school has one teacher per subject"` — not just `"lesson 11 exercise"`.

---

**Next lesson:** Lesson 12, *Functions as Special Relations*, is where this lesson's general "set of pairs" gets one more restriction added — exactly one pair per domain element — and that restriction turns out to be the precise, formal definition of everything Lesson 4 has been calling a function all along.
