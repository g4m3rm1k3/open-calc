# Lesson 160: Grammars

**What you will build**: By the end of this lesson you'll write a precise, formal grammar for a tiny sum-of-numbers language — `1`, or `1 + 2`, or `1 + 2 + 3`, arbitrarily many terms — and a real recognizer function that checks whether a given sequence of tokens is syntactically valid under that grammar, catching real invalid sequences (two numbers with no `+` between them, a trailing `+` with nothing after it) the way Lesson 159's own syntax/semantics split promised was possible: checking syntax alone, with no question of meaning involved at all.

**What you need to know first**: Lesson 159's syntax/semantics distinction; Lesson 19's recursive definitions, applied here to defining a language itself recursively.

**Terms introduced in this lesson**:

- **grammar** — a precise, finite set of rules defining exactly which sequences of symbols count as valid syntax. *Why it matters*: replaces "looks about right" with a checkable, exact specification — the same shift Lesson 110 made for algorithms, now made for syntax itself.
- **terminal** — a symbol that appears literally in valid syntax and is never further expanded — here, `num` and `plus`. *Why it matters*: the actual, concrete building blocks a real piece of syntax is made of, as opposed to a placeholder standing in for a whole sub-pattern.
- **non-terminal** — a placeholder standing for a pattern of terminals (and possibly other non-terminals), expanded by a production rule. *Why it matters*: `expr`, this lesson's own non-terminal, never appears literally in real syntax — it's a name for "whatever a valid expression actually expands into."
- **production rule** — a rule stating how a non-terminal may be expanded into a sequence of terminals and non-terminals. *Why it matters*: the actual mechanism a grammar uses to define its language — Lesson 19's own recursive definition, applied to strings of symbols instead of numbers or lists.

**Objects and methods used**: None new. This lesson reuses `get`/`count` (Lesson 84, Lesson 94) and `not=`/`=` (Lesson 136, Lesson 6), each already covered.

---

## Concept Unit: Defining a Tiny Language With Production Rules

### The Problem

"A number, optionally followed by `+` and another expression, repeated" describes a real language informally. Can that description be made exact — precise enough that "is this specific sequence valid" has one unambiguous answer?

### Introduce the concept in isolation

A tiny grammar, written with one production rule:

```
expr ::= num
       | num plus expr
```

`expr` is a **non-terminal** — it never appears in real syntax itself, only as a placeholder this rule expands. `num` and `plus` are **terminals** — the real, literal symbols valid syntax is actually built from (standing in here for an actual number token and an actual `+` token, before Lesson 161's real lexer produces them). The **production rule** itself has two alternatives, separated by `|`: an `expr` is either a single `num`, or a `num` followed by `plus` followed by *another* `expr` — Lesson 19's own recursive definition, applied to a sequence of symbols: the second alternative defines `expr` partly in terms of itself, exactly the way a recursive list definition defines a list partly in terms of a smaller list.

### Discard the throwaway example

Not applicable — this rule is the real, complete grammar this lesson's next unit checks real token sequences against.

### CS Lens

This is called **BNF** (Backus-Naur Form) style, the standard notation real language specifications use for exactly this purpose — every production rule this section writes from here forward uses the identical `::=`/`|` shape.

### SE Lens

A grammar written down precisely, rather than left as an informal description, is what makes "is this valid syntax" a question with one checkable answer instead of a matter of a parser author's own judgment call, made fresh each time a new edge case shows up.

---

## Concept Unit: A Recognizer — Checking Membership in the Language

### The Problem

The grammar defines which token sequences are valid, on paper. Can that definition be turned into a real function that checks a specific sequence, and correctly rejects one that violates it?

### Introduce the concept in isolation

```clojure
(defn valid-expr? [tokens i]
  (if (>= i (count tokens))
    false
    (if (not= (get tokens i) "num")
      false
      (if (= (+ i 1) (count tokens))
        true
        (if (not= (get tokens (+ i 1)) "plus")
          false
          (valid-expr? tokens (+ i 2)))))))
```

```
user=> (valid-expr? ["num" "plus" "num" "plus" "num"] 0)
true
user=> (valid-expr? ["num" "num"] 0)
false
user=> (valid-expr? ["num" "plus"] 0)
false
```

`valid-expr?` mirrors the grammar's own two alternatives directly: position `i` must hold `"num"` (both alternatives require this); if nothing follows, the first alternative matched — valid, done. If something follows, it must be `"plus"`, and everything after *that* must itself be a valid `expr` — the second alternative, checked by recursing exactly two positions ahead. `["num" "num"]` — two numbers with nothing between them — correctly fails: after the first `"num"`, position `1` isn't `"plus"`. `["num" "plus"]` — a trailing `+` with nothing after it — correctly fails too: the recursive call on an empty remainder hits the base case's own `(>= i (count tokens))`, which returns `false`, not `true`.

### Discard the throwaway example

Not applicable — `valid-expr?` is real, reusable, and verified against multiple valid and invalid sequences.

### Project Change

- **Reference Source**: This unit's grammar, this lesson's own first unit, translated directly into code — each production alternative becomes one `if` branch.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn valid-expr? [tokens i]
  (if (>= i (count tokens))
    false
    (if (not= (get tokens i) "num")
      false
      (if (= (+ i 1) (count tokens))
        true
        (if (not= (get tokens (+ i 1)) "plus")
          false
          (valid-expr? tokens (+ i 2)))))))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(>= i (count tokens))`** — first appearance of this specific base case: reaching past the end of `tokens` with no complete match found means the sequence is invalid — importantly `false`, not a crash, even though nothing is left to check.
- **`(not= (get tokens i) "num")`** — reappearing `get`/`not=` (Lesson 84, Lesson 136): the current position must literally be the terminal `"num"`, both grammar alternatives' own shared requirement.
- **`(= (+ i 1) (count tokens))`** — first appearance of this specific check: nothing remains after the current `"num"`, matching the grammar's first alternative exactly.
- **`(not= (get tokens (+ i 1)) "plus")`** — checks the grammar's second alternative's own middle terminal.
- **`(valid-expr? tokens (+ i 2))`** — first appearance of this specific recursive shape: matching the grammar's own self-reference, `expr`'s second alternative containing another `expr`, by recursing two positions past `num plus`.

### CS Lens

`valid-expr?` is a **recognizer**: a function answering only "valid or not," with no further structure produced — genuinely less than Lesson 161's coming parser, which will need to produce a real structure (an AST, Lesson 162) representing *how* a valid sequence matched, not just *whether* it did.

### SE Lens

Writing the recognizer as a direct, mechanical translation of the grammar's own alternatives — one `if` branch per production alternative — means a grammar change (a new alternative, a new terminal) has an obvious, corresponding code change, rather than requiring the recognizer's own logic to be re-derived from scratch each time the language itself changes.

### Connection to the previous unit

The previous unit defined the language on paper; this unit proves that definition is real and checkable, by running it against sequences it should accept and sequences it should correctly reject.

---

## Connect the Pieces

The grammar and its recognizer, checked against both a valid and an invalid sequence:

```clojure
(println "Valid: [num plus num plus num]" (valid-expr? ["num" "plus" "num" "plus" "num"] 0))
(println "Invalid: [num num]" (valid-expr? ["num" "num"] 0))
(println "Invalid: [num plus]" (valid-expr? ["num" "plus"] 0))
```

```
Valid: [num plus num plus num] true
Invalid: [num num] false
Invalid: [num plus] false
```

Every one of these three results follows directly and mechanically from the grammar's own two alternatives — nothing about `valid-expr?` had to guess at what "valid" means, the way an informal description would have left room to.

## What Breaks Without This

Suppose a language's own syntax were only ever described informally — "an expression is some numbers added together" — with no precise grammar behind it. Two different implementers building a recognizer from that description could reasonably disagree about whether `["num" "plus" "plus" "num"]` (two consecutive `plus` tokens) should be rejected, since the informal description never actually addressed it. A precise grammar removes that ambiguity by construction: `valid-expr?` rejects it correctly, because the second `"plus"`, appearing where a `"num"` was required, fails the very first check in the recursive call — not because someone remembered to handle that specific case, but because the grammar's own structure makes it impossible to accept.

## Exercises

1. **Trace.** By hand, trace `(valid-expr? ["num" "plus" "num"] 0)` through every recursive call, confirming it reaches `true`.
2. **Predict.** Before checking, predict whether `(valid-expr? ["num" "plus" "num" "num"] 0)` — a valid two-number expression followed by a stray extra `"num"` — is accepted or rejected. Then verify, and explain using the grammar's own rule.
3. **Verify.** Confirm `(valid-expr? ["plus"] 0)` and `(valid-expr? ["num" "plus" "plus" "num"] 0)` are both correctly rejected, and identify exactly which `if` branch catches each one.
4. **Break it, on purpose.** Modify the grammar to allow a *leading* `plus` (`expr ::= num | plus num | num plus expr`), and update `valid-expr?` to match — confirm `["plus" "num"]` is now accepted.
5. **Generalize.** Describe, without coding it, the production rule for a grammar allowing *subtraction* as well as addition — `num`, `num plus expr`, or `num minus expr`.
6. **Reconstruct.** Close this lesson. From memory, explain why `valid-expr?`'s own recursive structure mirrors the grammar's second alternative specifically, not the first.

## Definition of Done

- [ ] You can write a small grammar using terminals, non-terminals, and production rules in BNF-style notation.
- [ ] You can translate a grammar's production rules directly into a recognizer function, one branch per alternative.
- [ ] You can explain why a recognizer answers only "valid or not," unlike a parser, which must also be built to record structure.
- [ ] You completed Exercise 3 and identified exactly which branch rejects each of two different invalid sequences.
- [ ] You completed Exercise 4 and extended the grammar and recognizer to accept a leading `plus`.
- [ ] Commit your Exercise 3 and Exercise 4 work to your notes repository, with a commit message stating what you confirmed and built — for example, `"Confirm [plus] and [num plus plus num] both rejected, identify their distinct failing branches; extend grammar/recognizer to accept a leading plus"` — not just `"lesson 160 exercise"`.

---

**Next lesson:** Lesson 161, *Parsing*, takes this lesson's own recognizer one step further — not just "valid or not," but producing a real structure recording *how* a valid sequence matched the grammar, the first real step toward an interpreter that can act on what it reads.
