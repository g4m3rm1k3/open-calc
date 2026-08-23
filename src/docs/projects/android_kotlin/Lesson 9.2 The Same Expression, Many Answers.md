# Lesson 9.2: The Same Expression, Many Answers

**What you will build.** This project's own real expression pipeline —
`tokenize` → `toPostfix` → `buildTree` → `evaluate`, built across Stage 5
and reused ever since — gets two real, permanent extensions: it can now
recognize a **variable**, `x`, as a real operand instead of silently
dropping it, and it can now evaluate a parsed expression at any real,
chosen `x`, as a real `Double` instead of only ever producing one fixed
`Int` answer. On top of that, a new, permanent `sample` function calls
that evaluation repeatedly across a real range, producing a real list of
Cartesian points — turning one static, single-answer calculator
expression into the raw material an actual graph will eventually be
drawn from. The transferable problem underneath it: extending a pipeline
that was built to compute one fixed answer, once, into one that
recomputes the *same* answer-shape many times over a changing input —
without throwing away or duplicating everything that pipeline already
does correctly for the fixed case.

**What you need to know first.** Stage 5's own real, established
pipeline this lesson extends, not replaces: `tokenize` (text into
tokens), `toPostfix` (the Shunting-Yard algorithm, tokens into postfix
order), `buildTree` (postfix into a real `Node` tree), and `evaluate`
(walking that tree to one `Int` answer) — all real, permanent files in
this project already. Lesson 9.1's own `Point` (an `(x, y)` pair on the
Cartesian plane) is rebuilt here for real, this time as permanent
project code. Lesson 0.9's lambda expressions and `list.map { ... }`.
Lesson 6.4's `Double`.

## The pipeline, so far

This project's own expression pipeline, established across Stage 5, now
gains one more real stage:

```
Text → Tokenizer → Shunting-Yard → AST → Evaluator → Sampling
```

This lesson touches three of the four existing stages (Shunting-Yard,
AST, and the Evaluator each gain a real extension) and adds the fifth,
brand-new stage, Sampling. One concrete value, carried through every
stage this project has now built, all the way from raw text to a real
set of graphable points:

```
Text:         "x×x"
Tokenizer:    [x, ×, x]
Shunting-Yard: [x, x, ×]
AST:          Node("×", Node("x"), Node("x"))
Evaluator:    evaluateAt(tree, 2.0) -> 4.0
Sampling:     [(-2.0,4.0), (-1.0,1.0), (0.0,0.0), (1.0,1.0), (2.0,4.0)]
```

## Terms used in this lesson

- **Variable** (in an expression) — a token standing for a value that
  isn't fixed at parse time, but supplied later, once per evaluation.
  It exists because graphing needs "the same shape of computation, run
  once per `x`," and a variable is what lets one parsed expression be
  reused for many different inputs instead of re-tokenizing and
  re-parsing the text for every single point.
- **Operand** (reappearing) — a token representing a value the
  expression computes with — a number, or, as of this lesson, a
  variable — as opposed to an operator, which combines two operands
  into a new value. It exists because a parser has to treat these two
  kinds of tokens completely differently: an operand becomes a leaf in
  the resulting tree, an operator becomes an internal node combining two
  other results.
- **Sampling** — computing a function's real output at a finite,
  evenly-spaced set of input values, standing in for the function's own
  true, continuous behavior. It exists because a real function has
  infinitely many possible inputs; nothing can compute or draw all of
  them, so a finite, representative set has to stand in for the whole
  curve.
- **Range** (`xMin` to `xMax`) — the closed interval, from a real
  minimum value to a real maximum value, across which a function gets
  sampled. It exists because "graph this function" is meaningless
  without also saying over what portion of the x-axis to graph it —
  `y = x²` looks completely different sampled from `-2` to `2` than from
  `0` to `1000`.
- **Step size** — the fixed real distance between one sampled `x` and
  the next. It exists because evenly-spaced samples need a single,
  shared, real number describing how far apart they are, computed once
  from the range and the total sample count rather than guessed at each
  point.
- **Recursion** (reappearing) — a function that calls itself on a
  smaller piece of its own input, with a real, guaranteed stopping
  condition (a base case) that returns a plain answer instead of
  recursing again. It exists because a tree — like this project's own
  `Node` — is built from smaller trees, so a function that knows how to
  handle "one node, whose children are already-answered smaller trees"
  can answer an entire tree, of any size, without ever needing to know
  its overall depth or shape in advance.
- **`data class`** (reappearing) — a class modifier telling the compiler
  to generate real `equals`, `hashCode`, `toString`, and `copy`
  implementations directly from the properties listed in its primary
  constructor. It exists so a class that's purely a holder for values —
  this lesson's `Point` holds nothing but an `x` and a `y` — never
  requires hand-writing that repetitive, mechanical code by hand.
- **`val`** (reappearing) — a keyword declaring a read-only reference:
  once assigned, it can never be reassigned. It exists so a value that
  should never change after it's first set can say so directly in the
  code, turning an accidental later reassignment into a compile error.
- **`fun`** (reappearing) — the keyword introducing a function
  declaration: a named, reusable block of code that can take inputs
  (parameters) and produce an output (a return value). It exists so a
  calculation used more than once can be written exactly once and
  called by name, instead of copied everywhere it's needed.
- **`Double`** (reappearing) — a 64-bit floating-point numeric type
  capable of representing fractional values. It exists here because a
  real, sampled `y` value — the square of a fractional `x`, for
  instance — is not always a whole number.
- **`Int`** (reappearing) — a whole-number numeric type with no
  fractional part. It exists here because a sample *count* — "how many
  points to compute" — is always a whole number; there's no such thing
  as sampling a function `4.5` times.
- **`Boolean`** (reappearing) — a type with exactly two possible values,
  `true` and `false`. It exists here because `isOperand`'s entire job is
  answering a real yes-or-no question about a token, and `Boolean` is
  the type built specifically to hold nothing but that answer.
- **`||`** (reappearing) — the logical OR operator: an expression
  `a || b` evaluates to `true` if *either* `a` or `b` (or both) is
  `true`, and only evaluates `b` at all if `a` is already `false` (a
  real short-circuit, not a wasted check). It exists here because a
  token counts as an operand for *either* of two independent reasons —
  being a real number, or being the literal variable `x` — and `||` is
  the operator built to express "either of these conditions is enough."
- **String template** (reappearing) — the `"...${expression}..."` syntax
  that substitutes a real, computed value directly into a string at the
  position of the `${ }`. It exists so a value never has to be manually
  converted to text and concatenated by hand.
- **`when` expression** (reappearing) — a multi-branch conditional that
  evaluates exactly one of several branches based on matching its
  subject against each branch's own condition, in order, top to bottom.
  It exists so a choice between several distinct, named cases — here,
  which of four real arithmetic operators a node's own value names — can
  be written as one direct, readable dispatch instead of a chain of
  separate `if`/`else if` checks.
- **`throw`** (reappearing) — the keyword that raises a real exception,
  immediately halting normal execution and handing control to whatever
  caller, if any, is prepared to catch that specific exception type. It
  exists so a function that's handed genuinely invalid input it cannot
  produce a sensible answer for can say so immediately and loudly,
  instead of returning a made-up value that would silently propagate a
  real error as if it were legitimate data.
- **Arithmetic operators** `+`, `-`, `*`, `/` (reappearing) — the
  built-in operators for addition, subtraction, multiplication, and
  division. They exist here as the literal computational machinery
  behind `evaluateAt`'s own real `Double` arithmetic — the same four
  operations this project's `Operation`/`Operator` system already
  performs on `Int`s, now performed directly on `Double`s instead.

## Objects and methods used

This lesson's own subject — extending this project's real parser to
recognize a variable, evaluating an expression at a real, chosen point,
and sampling a function across a range — is built from this project's
own new functions, not from an external class or method, so it has no
entry of its own here. Every real class or method this lesson's new
code actually calls is supporting cast, listed below under one trailing
heading.

### Everything else in the file, not this lesson's subject but still explained

- **`String.toIntOrNull()`**
  - *What it is:* A Kotlin standard-library method that attempts to
    parse a `String` as a whole number, without throwing an exception if
    it can't.
  - *Implementation:* `kotlin.text.String.toIntOrNull(): Int?` — a
    member extension function on `String`, returning the parsed `Int`
    on success or the real value `null` on any failure (empty string,
    non-numeric characters, a value too large for `Int`), rather than
    throwing.
  - *Its use:* `isOperand` calls this first, to check whether a token is
    a real, parseable number — the first of the two real ways a token
    can qualify as an operand.
  - *Type:* an instance (member) method on `String`.
  - *Responsibility:* attempting a `String`-to-`Int` conversion and
    reporting success or failure through its return type itself
    (`Int?`), rather than through a thrown exception.
  - *Depends on:* only the `String` value it's called on.
  - *Connects to:* called first inside `isOperand`'s own `||`
    expression; its `!= null` check (comparing its result against the
    literal `null`) is what actually turns its `Int?` result into a
    plain `Boolean`.
  - *Shape:* a small, safe parsing boundary — one of this project's
    standing tools, since Stage 5, for asking "is this text really a
    number?" without a `try`/`catch` block at every call site.
- **`String.toDouble()`**
  - *What it is:* A Kotlin standard-library method that parses a
    `String` as a floating-point number.
  - *Implementation:* `kotlin.text.String.toDouble(): Double` — a member
    extension function on `String`, returning the parsed `Double` value
    directly, or throwing `NumberFormatException` if the string isn't a
    valid number.
  - *Its use:* `evaluateAt`'s own base case calls this to convert a leaf
    node's real numeric text (like `"3"`) into the real `Double` value
    the rest of the function's own `Double` arithmetic needs — unlike
    `evaluate`'s existing `.toInt()` call, which this lesson's new
    function does not use or replace.
  - *Type:* an instance (member) method on `String`.
  - *Responsibility:* converting exactly one `String` into exactly one
    `Double`, throwing a real, specific exception if the string cannot
    represent one at all.
  - *Depends on:* only the `String` value it's called on.
  - *Connects to:* called inside `evaluateAt`'s own base case, on
    `node.value`, whenever that leaf node's value isn't literally the
    string `"x"`.
  - *Shape:* the `Double`-typed counterpart to `toIntOrNull()`, above —
    this one, notably, throws on failure rather than returning `null`,
    a real, deliberate difference worth naming: a leaf node's value has
    already passed through `isOperand`'s own check by the time it
    reaches `buildTree`, so by the time `evaluateAt` calls `toDouble()`
    on it, that value is already known to be a real number or the
    literal variable name — never anything `toDouble()` could actually
    fail on.
- **`IllegalArgumentException`**
  - *What it is:* A standard Kotlin/JVM exception class representing a
    method having been passed an argument it cannot do anything sensible
    with.
  - *Implementation:* `kotlin.IllegalArgumentException(message: String)`
    — a real, constructible exception class, part of Kotlin's own
    standard exception hierarchy (itself extending `RuntimeException`),
    taking a real, descriptive message string.
  - *Its use:* `evaluateAt`'s own `when` expression throws one in its
    final `else` branch — reached only if a node's own operator symbol
    is somehow none of the four this project's `when` expression
    actually names, a case that should never occur with this project's
    own real `toPostfix`/`buildTree` output, but one the function still
    has to account for to satisfy Kotlin's own requirement that a `when`
    used as an expression (its result assigned or returned) covers every
    possible case.
  - *Type:* a concrete, constructible exception class.
  - *Responsibility:* representing, as a real, catchable object, the
    specific failure "this argument was never valid input for this
    operation" — distinct from `ArithmeticException`, this project's own
    already-established exception for a *valid* argument that fails
    during computation (division by zero).
  - *Depends on:* a `message` string describing what went wrong,
    supplied at the point it's constructed and thrown.
  - *Connects to:* constructed and thrown by `evaluateAt`'s own `else`
    branch; nothing in this project currently catches it, since it
    represents a case this project's own real pipeline should never
    actually produce.
  - *Shape:* a defensive boundary at the very edge of `evaluateAt`'s own
    `when` expression — proof, to both the compiler and a future reader,
    that every real case has been considered, even the one this
    project's own real data should never trigger.
- **`Int.until(to: Int): IntRange`**
  - *What it is:* A Kotlin standard-library infix function that builds a
    half-open range of whole numbers, from a starting value up to — but
    not including — a given end value.
  - *Implementation:* `kotlin.ranges.until(to: Int): IntRange`, called
    with infix syntax as `a until b` — equivalent to `a..(b - 1)`, and
    returning an `IntRange` representable as `a, a+1, a+2, ..., b-1`.
  - *Its use:* `sample` calls `0 until sampleCount` to produce exactly
    `sampleCount` real index values — `0` through `sampleCount - 1` —
    one per point this function needs to compute, with no off-by-one
    counting error to get wrong by hand.
  - *Type:* an infix, member extension function on `Int`.
  - *Responsibility:* producing a real, iterable sequence of whole
    numbers spanning exactly the given count, starting from `0` (or
    whatever value it's called on) and stopping one short of the given
    upper bound.
  - *Depends on:* the `Int` it's called on (the real start) and the
    `Int` passed to it (the real, excluded end).
  - *Connects to:* called directly on the literal `0` inside `sample`;
    its own `IntRange` result is what `.map`, immediately after it,
    actually iterates over.
  - *Shape:* a small, public factory at the exact seam between "a whole
    number telling us how many things we want" and "a real, iterable
    sequence of that many index positions" — the same seam Stage 5's own
    loops crossed by hand before this project had `until` available to
    name it directly.
- **`Iterable<T>.map`**
  - *What it is:* A Kotlin standard-library extension function that
    produces a new list by applying a transformation to every element of
    an existing iterable.
  - *Implementation:* `inline fun <T, R> Iterable<T>.map(transform: (T)
    -> R): List<R>` — walks the receiver once, calls `transform` on each
    element, and collects the results, in order, into a new `List<R>`;
    the source is never modified.
  - *Its use:* `sample` calls this on the `IntRange` `until` just built,
    turning each real index `i` into one real `Point`, by way of the
    lambda passed to it.
  - *Type:* a generic, `inline` extension function — callable as if it
    were a method on any `Iterable<T>`, including the `IntRange` this
    lesson calls it on.
  - *Responsibility:* producing exactly one output element for every
    input element, in the same order, with no filtering and no change to
    how many elements exist.
  - *Depends on:* a receiver to iterate (here, the `IntRange` from
    `until`) and a `transform` lambda describing how to convert one
    index into one `Point`.
  - *Connects to:* called on `until`'s own `IntRange` result; the lambda
    passed to it computes each real `x` and calls `f(x)` to get each
    real `y`; its own return value, a `List<Point>`, is exactly what
    `sample` itself returns.
  - *Shape:* a public, general-purpose transformation step — the same
    shape used throughout this curriculum any time "the same operation,
    applied to every element" is needed.
- **`println`**
  - *What it is:* A Kotlin standard-library function that writes text to
    standard output, followed by a newline.
  - *Implementation:* `kotlin.io.println(message: Any?): Unit`. It
    converts its argument to a string (calling `toString()` on it if it
    isn't already a `String`) and writes that string plus a line
    separator to `System.out`.
  - *Its use:* this lesson's own throwaway labs use `println` to make an
    otherwise invisible computed value visible as real, comparable text.
  - *Type:* a top-level (package-level) function, not a method on any
    class.
  - *Responsibility:* converting whatever value it's given into text and
    delivering that text to the process's standard output stream.
  - *Depends on:* the JVM's `System.out` stream (always available in a
    normal `java` invocation) and, for a non-`String` argument, that
    argument having some `toString()` implementation.
  - *Connects to:* called directly by this lesson's own lab `main`
    functions; internally forwards to `System.out.println`.
  - *Shape:* a public entry point at the very edge of the program — the
    last real step before a computed value leaves the running process
    and becomes something a person actually reads.

---

## Concept Unit: An Operand the Parser Doesn't Recognize

### The Problem

This project's own real, unmodified expression pipeline — `tokenize`,
`toPostfix`, and `buildTree`, all real, permanent code since Stage 5 —
was built and tested against expressions made entirely of numbers and
the four operator symbols `+`, `−`, `×`, `÷`. Graphing needs this same
pipeline to accept one more kind of token: `x`, standing for whatever
real value gets plugged in when the expression is actually evaluated.
Nothing in this project has ever asked what that pipeline does when it
meets a token that is neither a number nor one of its four known
operators.

Before reading on: `tokenize` already treats any character that isn't a
digit as its own separate token — given that, would you expect
`tokenize("x×x")` to already produce three separate tokens, or fewer?
`toPostfix`'s own `when` block has one branch for numbers and one
branch for each known operator symbol, with no final `else` branch —
what happens, in Kotlin, to a value that matches none of a `when`
block's branches when there is no `else`? If `toPostfix`'s own output
ends up shorter than the real expression it was given — missing an
operand a later step still expects to find — what would you expect
`buildTree` to do when it tries to remove that missing operand from its
own, now-too-short stack?

Run for real, against this project's own current, completely unmodified
`tokenize`, `toPostfix`, and `buildTree`:

```
tokens = [x, ×, x]
postfix = [×]
Exception in thread "main" java.lang.IndexOutOfBoundsException: Index -1 out of bounds for length 0
	at java.base/jdk.internal.util.Preconditions.outOfBounds(Preconditions.java:100)
	[... further real JDK-internal frames omitted, saved in full in verification/9.2/break1_output.txt ...]
	at com.example.calculator.ASTKt.buildTree(AST.kt:11)
	at com.example.calculator.Break1_variable_gapKt.main(break1_variable_gap.kt:8)
```

`tokenize` gets the easy part right already — `x`, `×`, and `x` really
do come out as three separate real tokens, exactly as predicted.
`toPostfix`'s own `when` block, though, has no branch that matches a
bare `"x"` — not a number, not `"+"`/`"−"`/`"×"`/`"÷"`, not `"("` or
`")"` — and a Kotlin `when` used as a plain statement (not assigned to
anything) silently does nothing at all when no branch matches. Both real
`"x"` tokens vanish, silently, leaving a real, genuinely broken
`postfix` list holding only the operator, `[×]`, with no operands at
all. `buildTree` then reads that single token, sees it isn't a number,
assumes it must be an operator needing two children, and tries to
remove the second of those two children from a real, empty stack — a
real, genuine crash, `IndexOutOfBoundsException`, not a hypothetical
one.

### Introduce the Concept in Isolation

The following throwaway lab defines a real, standalone check for
exactly what this project's pipeline is currently missing:

```kotlin
fun isOperand(token: String): Boolean = token.toIntOrNull() != null || token == "x"

fun main() {
    println("isOperand(\"7\") = ${isOperand("7")}")
    println("isOperand(\"x\") = ${isOperand("x")}")
    println("isOperand(\"×\") = ${isOperand("×")}")
}
```

Compiled and run for real:

```
isOperand("7") = true
isOperand("x") = true
isOperand("×") = false
```

This output proves the fix this project's pipeline actually needs: a
single, explicit, real question — "is this token an operand?" — that
answers `true` for both of the real cases that count as one (a real
number, or the literal variable `x`) and `false` for anything else,
replacing the narrower "is this a number?" check that both `toPostfix`
and `buildTree` were separately, silently relying on before. This is
called **operand classification** — deciding, before doing anything else
with a token, which of a parser's own recognized categories it actually
belongs to.

### Discard the Throwaway Example

The `isOperand` function shown above, and the `main` function
demonstrating it, are both deleted from this throwaway form. The idea
survives; a real, permanent version of `isOperand` — shown next — takes
its place directly inside this project's own pipeline.

### Project Change

- **Reference Source:** No reference counterpart — this is a from-scratch
  addition, motivated entirely by this project's own real bug, proven
  above, not ported from any external source.
- **Files affected:**
  `app/src/main/java/com/example/calculator/ShuntingYard.kt` (adds
  `isOperand`, modifies `toPostfix`) and
  `app/src/main/java/com/example/calculator/AST.kt` (modifies
  `buildTree`).
- **Change type:** add (the new `isOperand` function) and replace (the
  one-line operand check inside both `toPostfix` and `buildTree`).
- **Location:** `isOperand` is added to `ShuntingYard.kt`, directly
  after the existing `precedence` map and before `toPostfix` itself.
  `toPostfix`'s own first `when` branch, and `buildTree`'s own `if`
  condition, both change from a direct `token.toIntOrNull() != null`
  check to a call to this new, shared `isOperand`.
- **Dependencies:** none beyond what both files already have; `isOperand`
  calls nothing this project doesn't already use elsewhere.

### The New Code

```kotlin
fun isOperand(token: String): Boolean = token.toIntOrNull() != null || token == "x"
```

### The Updated Project

`ShuntingYard.kt`, with `isOperand` added and `toPostfix`'s own operand
check now calling it:

```kotlin
 1  val precedence = mapOf(
 2      "+" to 1,
 3      "−" to 1,
 4      "×" to 2,
 5      "÷" to 2
 6  )
 7
 8  fun isOperand(token: String): Boolean = token.toIntOrNull() != null || token == "x"  // ← new
 9
10  fun toPostfix(tokens: List<String>): List<String> {
11      val output = mutableListOf<String>()
12      val operatorStack = Stack()
13
14      for (token in tokens) {
15          when {
16              isOperand(token) -> output.add(token)  // ← changed
17              token in precedence -> {
18                  while (
19                      !operatorStack.isEmpty() &&
20                      operatorStack.peek() != "(" &&
21                      precedence.getValue(operatorStack.peek()) >= precedence.getValue(token)
22                  ) {
23                      output.add(operatorStack.pop())
24                  }
25                  operatorStack.push(token)
26              }
27              token == "(" -> operatorStack.push(token)
28              token == ")" -> {
29                  while (operatorStack.peek() != "(") {
30                      output.add(operatorStack.pop())
31                  }
32                  operatorStack.pop()
33              }
34          }
35      }
36      while (!operatorStack.isEmpty()) {
37          output.add(operatorStack.pop())
38      }
39      return output
40  }
```

`toPostfix` now recognizes `x` as a real operand: line 16 calls the new
`isOperand` instead of checking `toIntOrNull()` directly, so a token
that's neither a number nor `x` still correctly falls through to the
operator/paren branches below it, exactly as before — nothing about the
function's own control flow changed, only what counts as its first
case.

`AST.kt`'s `buildTree`, with the same real change applied to its own
operand check:

```kotlin
1  fun buildTree(postfix: List<String>): Node {
2      val stack = mutableListOf<Node>()
3      for (token in postfix) {
4          if (isOperand(token)) {  // ← changed
5              stack.add(Node(token))
6          } else {
7              val right = stack.removeAt(stack.size - 1)
8              val left = stack.removeAt(stack.size - 1)
9              stack.add(Node(token, left, right))
10         }
11     }
12     return stack.removeAt(stack.size - 1)
13 }
```

`buildTree` now makes the identical real decision `toPostfix` makes,
using the identical real function: line 4 calls `isOperand`, so a real
`"x"` token now correctly becomes a leaf `Node` (line 5) instead of
falling into the operator branch and trying to pop two children that
were never pushed.

### Mechanical Walkthrough

Every distinct syntactic element in `isOperand`'s own declaration, in
the order it appears:

- `fun isOperand(token: String): Boolean = token.toIntOrNull() != null
  || token == "x"` — an expression-body function: **`fun`** introduces
  the declaration; `isOperand` is its name; `(token: String)` declares
  one parameter; **`Boolean`** is its declared return type; everything
  after the `=` is the single expression it evaluates and returns.
- `token.toIntOrNull()` — calls the standard-library
  **`String.toIntOrNull()`** (full treatment above) on `token`,
  attempting to parse it as a whole number.
- `!= null` — compares that result against the literal `null`; since
  `toIntOrNull()` returns `Int?`, this comparison is what actually
  produces a plain **`Boolean`**: `true` if parsing succeeded (the
  result is some real `Int`, not `null`), `false` if it failed.
- `||` — the **logical OR** operator (full treatment in Terms, above):
  if the left side (the number check) is already `true`, `||` returns
  `true` immediately without even evaluating the right side; only a
  `false` left side causes the right side to be checked at all.
- `token == "x"` — compares `token` against the literal string `"x"`
  for structural equality, `true` exactly when the token is precisely
  that one-character variable name.

Every distinct syntactic element changed inside `toPostfix` and
`buildTree`:

- `isOperand(token) -> output.add(token)` (`toPostfix`, line 16) —
  calls the new `isOperand` on the current loop's `token`; when it
  returns `true`, the token is added directly to `output`, the same
  action the old `token.toIntOrNull() != null` check already triggered
  for a real number — the only real change is which tokens now qualify.
- `if (isOperand(token))` (`buildTree`, line 4) — the same call, this
  time deciding whether the current token becomes a leaf `Node` (line
  5, `stack.add(Node(token))`, a `Node` with no `left`/`right` children)
  or is treated as an operator popping two already-built child nodes off
  the stack (lines 7–9).

### CS Lens

This is **operand classification** — a specific case of the more
general CS idea of **lexical categorization**: deciding, for each token
a text is broken into, which of a fixed set of grammatical roles it
plays, before anything downstream tries to use it.

```
Also recognized in: a real compiler's lexer distinguishing
keywords from identifiers, a JSON parser distinguishing a value
token from structural punctuation, a CSV parser distinguishing a
field's own text from its separating comma, a regex engine
matching a character against a named character class
```

Every one of these systems fails the same way this project's own
pipeline just did if a token slips through uncategorized: something
downstream, built to handle only the categories it was told about,
either silently ignores real data or crashes trying to process a token
that was never really a member of the category it got assumed to be.

### SE Lens

The design choice worth naming here is one shared `isOperand` function,
called identically from two different files, instead of leaving each
file with its own separate, inline check — which is exactly what this
project already had, and precisely how this real bug happened in the
first place: `toPostfix` and `buildTree` each independently checked
`token.toIntOrNull() != null`, two separate copies of the same idea,
both simultaneously missing the exact same case. The alternative not
chosen — fixing each file's own inline check separately, without
factoring out a shared function — would have solved today's real bug
just as completely, but would have left the exact same duplication in
place, ready to go quietly out of sync again the next time this
project's idea of "operand" needs to grow (a second variable, a named
constant). One shared, named function means any future change to what
counts as an operand happens in exactly one place, guaranteed to stay
consistent everywhere it's used. The honest cost: a reader now has to
follow one extra function call to see the real check, instead of
reading it inline — worth it here specifically because that inline
duplication is what let this project's real bug exist unnoticed at all.

### Commands Needed

```
kotlinc lab1_isOperand.kt lab2_evaluateAt.kt lab3_sample.kt -include-runtime -d labs92.jar
java -cp labs92.jar Lab1_isOperandKt
```

The same batched compilation and run pattern this curriculum has used
since Stage 0: `kotlinc` compiles all three of this lesson's lab files
together in one pass (safe here since none of the three declares a name
that collides with either of the others); `-include-runtime` bundles the
Kotlin standard library into the output so it runs on plain `java`;
`java -cp labs92.jar Lab1_isOperandKt` runs this specific file's own
compiler-generated entry-point class.

```
./gradlew :app:testDebugUnitTest
```

`./gradlew` runs this project's own Gradle wrapper — the exact pinned
Gradle version this project's own `gradle/wrapper` directory specifies,
regardless of whatever Gradle version happens to be installed
system-wide. `:app:testDebugUnitTest` names the specific task that
compiles and runs every real JVM unit test in the `app` module's debug
build variant — the same task this project has run after every real
production code change since Stage 1.

### Run It

```
$ java -cp labs92.jar Lab1_isOperandKt
isOperand("7") = true
isOperand("x") = true
isOperand("×") = false
```

Real, saved in `verification/9.2/lab1_isOperand.kt` and
`verification/9.2/lab1_output.txt`.

Against the real, now-fixed project:

```
$ ./gradlew :app:testDebugUnitTest --rerun-tasks --console=plain
BUILD SUCCESSFUL in 11s
32 actionable tasks: 32 executed
$ find app/build/test-results/testDebugUnitTest -name "*.xml" | xargs grep -h "tests=" | \
  grep -oE 'tests="[0-9]+" skipped="[0-9]+" failures="[0-9]+"' | \
  awk -F'"' '{t+=$2; s+=$4; f+=$6} END {print "total tests:", t, "skipped:", s, "failures:", f}'
total tests: 84 skipped: 0 failures: 0
```

Two new real, permanent tests confirm this fix directly:
`isOperandRecognizesBothNumbersAndTheVariableXAsOperands` (in
`ShuntingYardTest.kt`, asserting `isOperand` returns `true` for `"7"`
and `"x"` and `false` for `"×"`) and
`convertingAnExpressionContainingTheVariableXKeepsBothOccurrencesInThePostfixResult`
(asserting `toPostfix(tokenize("x×x"))` now really equals
`["x", "x", "×"]` instead of the broken `["×"]` shown in this unit's own
Problem section). A third,
`buildingATreeFromAnExpressionContainingTheVariableXTreatsBothOccurrencesAsRealLeaves`
(in `ASTTest.kt`), confirms `buildTree` now produces the correct real
tree shape, `Node("×", Node("x"), Node("x"))`, instead of crashing. Real,
saved in `verification/9.2/step1_full_suite.txt`, alongside real
snapshots of both changed files
(`verification/9.2/step2_ShuntingYard.kt`,
`verification/9.2/step2_AST.kt`) and both updated test files.

### Connect the Pieces

This project's own real pipeline can now correctly carry a token it
previously lost silently — `x` moves cleanly through `toPostfix` and
`buildTree` exactly as any real number always did. Nothing yet reads
that `x` as anything other than a name sitting in a tree; the next unit
is what actually turns it into a real number.

---

## Concept Unit: Evaluating at a Chosen x

### The Problem

This project's tree now correctly holds a real `x` where a number used
to be the only option — but `evaluate`, this project's own existing
function for walking that tree to a real answer, has no idea what to do
with it. `evaluate`'s own base case calls `node.value.toInt()` directly;
called on the literal string `"x"`, that would throw a real
`NumberFormatException` — `"x"` is not a number, and never will be,
until something outside the tree itself says what real value it should
stand for on this particular evaluation. Nothing built so far lets a
caller say that.

Before reading on: if the same expression tree needs to be evaluated
many times, once for each of several different `x` values, should the
value of `x` live inside the tree itself, or be supplied separately,
each time the tree gets evaluated? `evaluate`'s own existing recursive
structure walks down to two answered children before combining them
with an operator — what real value could a leaf node holding the literal
text `"x"` return, if not a number parsed directly from its own text?
Given this project already has one function, `evaluate`, that returns a
fixed `Int`, would changing its own return type to `Double` change what
it computes for every expression this project has ever evaluated before
today, or only for ones containing `x`?

### Introduce the Concept in Isolation

The following throwaway lab defines a small, standalone tree type and a
function that walks it recursively, substituting a real, given `x` at
every leaf whose value is the variable, and computing every other leaf
as an ordinary real number:

```kotlin
data class LabNode(val value: String, val left: LabNode? = null, val right: LabNode? = null)

fun evaluateLabNode(node: LabNode, x: Double): Double {
    val left = node.left
    val right = node.right
    if (left == null || right == null) {
        return if (node.value == "x") x else node.value.toDouble()
    }
    val leftValue = evaluateLabNode(left, x)
    val rightValue = evaluateLabNode(right, x)
    return when (node.value) {
        "+" -> leftValue + rightValue
        "−" -> leftValue - rightValue
        "×" -> leftValue * rightValue
        "÷" -> leftValue / rightValue
        else -> throw IllegalArgumentException("Unknown operator: ${node.value}")
    }
}

fun main() {
    val tree = LabNode("×", LabNode("x"), LabNode("x"))
    println("x × x at x=2.0 -> ${evaluateLabNode(tree, 2.0)}")
    println("x × x at x=3.0 -> ${evaluateLabNode(tree, 3.0)}")
    println("x × x at x=-2.0 -> ${evaluateLabNode(tree, -2.0)}")
}
```

Compiled and run for real:

```
x × x at x=2.0 -> 4.0
x × x at x=3.0 -> 9.0
x × x at x=-2.0 -> 4.0
```

This output proves the real idea graphing needs: the exact same tree,
`x × x`, built once, produces three genuinely different real answers —
`4.0`, `9.0`, `4.0` — because `x` is supplied fresh, as a real function
parameter, on each separate call, rather than being baked into the tree
itself. The last two calls also prove something easy to miss: `x=3.0`
and `x=-2.0` produce different answers (`9.0` vs. `4.0`) even though
both are real, valid inputs — this function has no special handling for
negative numbers, it simply multiplies whatever real `Double` it's
given by itself, exactly as `×` always has. This is called **recursion
with a parameter carried through every call** — the tree-walking shape
`evaluate` already uses, extended so every recursive call passes the
same `x` along unchanged, available the moment any leaf actually needs
it.

**Execution trace**, for `evaluateLabNode(tree, 2.0)` where `tree` is
`LabNode("×", LabNode("x"), LabNode("x"))`:

1. `evaluateLabNode(tree, 2.0)` — `tree.left` and `tree.right` are both
   real, non-null `LabNode`s (`LabNode("x")` each), so this call does
   *not* return yet; it must first compute `leftValue` and `rightValue`
   by recursing.
2. `evaluateLabNode(LabNode("x"), 2.0)` (computing `leftValue`) — this
   node's own `left` and `right` are both `null`, so this call *is* a
   base case; since `node.value == "x"` is `true`, it returns `x`
   itself, `2.0`, immediately, with no further recursion.
3. `evaluateLabNode(LabNode("x"), 2.0)` (computing `rightValue`) — the
   identical real call as step 2, on the tree's other, separate `x`
   leaf; also returns `2.0`, for the identical reason.
4. Back in the original call from step 1, `leftValue` is now `2.0` and
   `rightValue` is now `2.0`; `node.value` is `"×"`, so the `when`
   expression's third branch runs, computing `leftValue * rightValue`,
   `2.0 * 2.0`, and returning `4.0` — the final, real result.

### Discard the Throwaway Example

`LabNode`, `evaluateLabNode`, and the `main` function above are all
deleted from this throwaway form. A real, permanent version — operating
on this project's own real `Node` type, not a throwaway lookalike — is
added to this project's own `Evaluator.kt` next.

### Project Change

- **Reference Source:** No reference counterpart — this is a from-scratch
  addition, extending this project's own existing `evaluate` function
  (already real, permanent code in this exact file) with a second,
  parallel function rather than modifying `evaluate` itself.
- **Files affected:**
  `app/src/main/java/com/example/calculator/Evaluator.kt`.
- **Change type:** add.
- **Location:** directly after the existing `evaluate` function, in the
  same file.
- **Dependencies:** this project's own real `Node` type (`AST.kt`,
  unchanged by this unit) — no new dependency.

### The New Code

```kotlin
fun evaluateAt(node: Node, x: Double): Double {
    val left = node.left
    val right = node.right
    if (left == null || right == null) {
        return if (node.value == "x") x else node.value.toDouble()
    }
    val leftValue = evaluateAt(left, x)
    val rightValue = evaluateAt(right, x)
    return when (node.value) {
        "+" -> leftValue + rightValue
        "−" -> leftValue - rightValue
        "×" -> leftValue * rightValue
        "÷" -> leftValue / rightValue
        else -> throw IllegalArgumentException("Unknown operator: ${node.value}")
    }
}
```

### The Updated Project

`Evaluator.kt`, with `evaluate` unchanged above it and `evaluateAt`
added directly after:

```kotlin
 1  fun evaluate(node: Node): Int {
 2      val left = node.left
 3      val right = node.right
 4      if (left == null || right == null) {
 5          return node.value.toInt()
 6      }
 7      val operator = operatorSymbols.getValue(node.value)
 8      return operator.operation.apply(evaluate(left), evaluate(right))
 9  }
10
11  fun evaluateAt(node: Node, x: Double): Double {  // ← new
12      val left = node.left
13      val right = node.right
14      if (left == null || right == null) {
15          return if (node.value == "x") x else node.value.toDouble()
16      }
17      val leftValue = evaluateAt(left, x)
18      val rightValue = evaluateAt(right, x)
19      return when (node.value) {
20          "+" -> leftValue + rightValue
21          "−" -> leftValue - rightValue
22          "×" -> leftValue * rightValue
23          "÷" -> leftValue / rightValue
24          else -> throw IllegalArgumentException("Unknown operator: ${node.value}")
25      }
26  }
```

`evaluate` (lines 1–9) is completely untouched — every expression this
project has ever evaluated before this lesson still goes through the
exact same `Int`-only path it always has, still backed by this
project's own real `Operation`/`Operator` system. `evaluateAt` (lines
11–26) is a genuinely separate function, not a modification: it walks
the identical real `Node` structure `evaluate` already walks, but
returns `Double` instead of `Int`, accepts a real `x` parameter neither
`evaluate` nor `Node` itself has ever needed before, and dispatches its
own four arithmetic operators directly (lines 20–23) rather than going
through `Operator`'s own `Int`-only `Operation` objects, since those are
permanently typed to `(Int, Int) -> Int` and cannot produce a `Double`
result no matter what's passed to them.

### Mechanical Walkthrough

Every distinct syntactic element in `evaluateAt`'s own declaration, in
the order it appears, beyond what `evaluate`'s own already-established
shape already explains identically (the `val left =` / `val right =`
extraction and the `left == null || right == null` base-case check,
both structurally the same as `evaluate`'s own):

- `fun evaluateAt(node: Node, x: Double): Double` — declares a function
  taking this project's own real `Node` and a real `x`, returning a real
  `Double` — the first function in this project to combine "this
  project's own real AST" with "a real, caller-supplied numeric input"
  in one signature.
- `return if (node.value == "x") x else node.value.toDouble()` — the
  base case, reached only once `left`/`right` are confirmed `null`
  (this is a leaf). `if`/`else` used here as an **expression** (its
  overall result is what gets returned, not a side effect of running
  it): when `node.value` is exactly the string `"x"`, the leaf's real
  answer is simply `x`, the parameter this whole call was given: no
  parsing needed, because a variable leaf carries no number of its own
  to parse. Otherwise, `node.value.toDouble()` (full treatment above)
  parses the leaf's own real numeric text into a real `Double`.
- `val leftValue = evaluateAt(left, x)` and `val rightValue =
  evaluateAt(right, x)` — **recursion** (full treatment in Terms,
  above): each call passes the *same* `x` this call itself received,
  unchanged, down into its own two children — the mechanism that makes
  one real `x`, chosen once by whoever calls `evaluateAt` at the top,
  available identically at every leaf that needs it, no matter how deep
  in the tree that leaf sits.
- `return when (node.value) { ... }` — a **`when` expression** (full
  treatment in Terms, above), used here as the function's own return
  value: it matches `node.value` — an internal node's own operator
  symbol, since the base case above already handled every leaf — against
  each of the four real, known operator strings.
- `"+" -> leftValue + rightValue`, `"−" -> leftValue - rightValue`,
  `"×" -> leftValue * rightValue`, `"÷" -> leftValue / rightValue` —
  four real branches, each using one of the **arithmetic operators**
  (full treatment in Terms, above) directly on the two real `Double`
  values this call's own two recursive calls just produced — genuinely
  new code, not a call into this project's existing `Operation`
  interface, since that interface's own `apply` is permanently typed to
  `(Int, Int) -> Int` and has no `Double`-producing counterpart.
- `else -> throw IllegalArgumentException("Unknown operator:
  ${node.value}")` — the **`throw`** keyword (full treatment in Terms,
  above) raises a real **`IllegalArgumentException`** (full treatment
  above) if `node.value` matches none of the four named operators — a
  case this project's own real, current pipeline should never actually
  produce, required only because Kotlin demands every `when` used as an
  expression account for every possible input, not just the ones a
  given program happens to produce today.

### CS Lens

This is **recursion with a parameter carried through every call** — a
specific application of the general CS idea of a **catamorphism**, or
more plainly, "folding" a recursive structure down to one answer by
combining each node's own children's already-computed answers, the same
general shape `evaluate` itself already used, now generalized to also
thread one extra, externally-chosen value through every step.

```
Also recognized in: a compiler's own constant-folding pass,
computing an expression's value at compile time; a spreadsheet
recalculating every cell's own formula whenever one input cell
changes; a game engine's animation system evaluating one curve
at a different point in time on every rendered frame
```

Every one of these systems reuses the exact same real structure —
whether that's an AST, a dependency graph, or a curve — across many
different evaluations, changing only the one input that varies between
runs, exactly as `evaluateAt` reuses this project's own real `Node` tree
across every different `x` a future graph will sample.

### SE Lens

The design choice worth naming here is a genuinely separate function,
`evaluateAt`, rather than modifying `evaluate` itself to accept an
optional `x` parameter and return a `Double` in every case. The
alternative — one function doing both jobs — was rejected because
`evaluate`'s own real callers (this project's live calculator screen,
through `CalculatorViewModel`) need a real `Int` result and have never
supplied, and should never need to supply, any `x` at all; forcing every
existing caller to pass a meaningless `x` argument, or to unwrap a
`Double` back into an `Int` it never asked for, would be a real,
needless burden on code this lesson's own feature has nothing to do
with. The real cost of two separate functions instead of one: real,
duplicated structure — the `val left =`/`val right =` extraction and the
leaf-vs-internal-node check appear, nearly identically, in both
`evaluate` and `evaluateAt`. Left duplicated deliberately here, since
the two functions' own base cases and dispatch logic are genuinely
different in kind (`Int` via `Operator`'s own `Operation` objects versus
`Double` via direct arithmetic), not just in the type they happen to
return — collapsing them into one, generic-over-both function would
trade a small amount of duplication for a much harder function to read
correctly, for a project whose own real, current need is exactly two
concrete cases, not an arbitrary number of them.

### Commands Needed

```
java -cp labs92.jar Lab2_evaluateAtKt
```

The same batched `kotlinc` compilation already covered in this lesson's
first unit produced this file's compiled class as well; only the `java`
invocation differs, running `Lab2_evaluateAtKt` — the real,
compiler-generated class name for `lab2_evaluateAt.kt`'s own top-level
code.

### Run It

```
$ java -cp labs92.jar Lab2_evaluateAtKt
x × x at x=2.0 -> 4.0
x × x at x=3.0 -> 9.0
x × x at x=-2.0 -> 4.0
```

Real, saved in `verification/9.2/lab2_evaluateAt.kt` and
`verification/9.2/lab2_output.txt`.

Against the real, now-extended project, a new, permanent test,
`evaluateAtSubstitutesTheGivenXAndProducesTheCorrectRealAnswer` (in
`EvaluatorTest.kt`), builds this project's own real tree from the real
text `"x×x"` — `buildTree(toPostfix(tokenize("x×x")))`, the exact same
real pipeline this project has used since Stage 5 — and asserts
`evaluateAt` produces `4.0`, `9.0`, and `4.0` at `x = 2.0`, `3.0`, and
`-2.0` respectively, the identical real answers this unit's own isolated
lab already proved, now confirmed against this project's own real,
integrated pipeline instead of a throwaway stand-in. Real, saved in
`verification/9.2/step1_full_suite.txt` (`84` real tests, `0` failures)
and `verification/9.2/step3_Evaluator.kt`/`step3_EvaluatorTest.kt`.

### Connect the Pieces

This project can now do something it has never been able to do before
today: ask the *same* parsed expression for its real answer more than
once, at genuinely different real inputs, without re-tokenizing or
re-parsing a single character of text. The previous unit made sure `x`
survives parsing at all; this unit is what actually gives `x` a real,
computed meaning. What's still missing is repetition — asking that same
question many times, across a real range, automatically.

---

## Concept Unit: Sampling Across a Range

### The Problem

`evaluateAt` can answer "what is `x × x` when `x` is exactly `2.0`?" —
one real question, one real answer. A graph needs many such answers,
spanning a real range, spaced closely enough together that connecting
them will look like a real curve rather than a handful of disconnected
dots. Nothing built so far repeats that single question automatically;
today, producing five real points would mean calling `evaluateAt` five
separate times, by hand, computing each `x` by hand too.

Before reading on: if you wanted five evenly-spaced `x` values between
`-2.0` and `2.0` inclusive, what real distance would need to separate
each one from the next? Given `evaluateAt` already takes a `Node` and a
real `x` and returns a real `y`, what is the smallest possible way to
describe "the function to sample" as a parameter, without hard-coding
any particular expression's own tree into the sampling code itself? If
the number of points wanted were `1` instead of `5`, should the distance
between points still be computed the same way, or does that case need
separate handling?

### Introduce the Concept in Isolation

The following throwaway lab defines a real, standalone `Point` and a
`sample` function computing several of them across a given range, given
any real function from one `Double` to another:

```kotlin
data class Point(val x: Double, val y: Double)

fun sample(f: (Double) -> Double, xMin: Double, xMax: Double, sampleCount: Int): List<Point> {
    val step = (xMax - xMin) / (sampleCount - 1)
    return (0 until sampleCount).map { i ->
        val x = xMin + i * step
        Point(x, f(x))
    }
}

fun main() {
    val points = sample({ x -> x * x }, -2.0, 2.0, 5)
    for (point in points) {
        println("(${point.x}, ${point.y})")
    }
}
```

Compiled and run for real:

```
(-2.0, 4.0)
(-1.0, 1.0)
(0.0, 0.0)
(1.0, 1.0)
(2.0, 4.0)
```

This output proves `sample` really does turn one real function — here,
a lambda computing `x * x` directly, standing in for whatever function
the caller actually wants sampled — into several evenly-spaced real
points, computed automatically from nothing but a range and a count: no
point's own `x` was typed by hand, and the five real points produced are
exactly the same five points this project has already hand-typed once
before, computed automatically this time instead. `sample` never once
refers to `x * x` by name inside its
own body — it received that specific computation only as its `f`
parameter, meaning the exact same function would sample `x + 1`, or any
other real `(Double) -> Double`, with no change to `sample` itself. This
is called a **higher-order function** — a function that takes another
function as a real parameter (or returns one), treating "what to
compute" as a value just as ordinary as any number or string.

### Discard the Throwaway Example

`Point`, `sample`, and the `main` function above are all deleted from
this throwaway form. Real, permanent versions of both `Point` and
`sample` — identical to the throwaway forms shown, since neither needed
any project-specific knowledge to do its real job — are added to this
project's own new file next.

### Project Change

- **Reference Source:** No reference counterpart — this is a from-scratch
  addition; `Point` reuses the same shape this project has already
  proved, in an earlier discarded throwaway lab, this time built to
  stay as real, permanent project code.
- **Files affected:**
  `app/src/main/java/com/example/calculator/Graphing.kt` (new file).
- **Change type:** add.
- **Location:** a brand-new file — nothing to locate a position within.
- **Dependencies:** none; both `Point` and `sample` depend only on
  standard Kotlin, not on this project's own `Node`/`evaluateAt`
  directly.

### The New Code

```kotlin
data class Point(val x: Double, val y: Double)

fun sample(f: (Double) -> Double, xMin: Double, xMax: Double, sampleCount: Int): List<Point> {
    val step = (xMax - xMin) / (sampleCount - 1)
    return (0 until sampleCount).map { i ->
        val x = xMin + i * step
        Point(x, f(x))
    }
}
```

### Mechanical Walkthrough

Every distinct syntactic element in the code above, in the order it
appears:

- `data class Point(val x: Double, val y: Double)` — the same real
  shape this project's own earlier, discarded throwaway `Point` already
  proved, this time permanent: a **`data class`** (full treatment in
  Terms, above) holding two **`val`**-declared, read-only **`Double`**
  properties.
- `fun sample(f: (Double) -> Double, xMin: Double, xMax: Double,
  sampleCount: Int): List<Point>` — declares a function with four real
  parameters. `f: (Double) -> Double` declares a parameter whose own
  type is itself a function type — "a function accepting one `Double`
  and returning one `Double`" — which is what makes `sample` a real
  **higher-order function** (full treatment above): `f` isn't a number
  or a string, it's an entire computation, passed in like any other
  value. `xMin`/`xMax` are real `Double` bounds; `sampleCount` is a real
  **`Int`** (full treatment in Terms, above), since a count of points is
  always a whole number. The declared return type, `List<Point>`, is a
  real, ordinary `List` holding this project's own new `Point` type.
- `val step = (xMax - xMin) / (sampleCount - 1)` — computes the real
  **step size** (full treatment in Terms, above) once, before any point
  is computed: `xMax - xMin` uses the `-` **arithmetic operator** (full
  treatment in Terms, above) to find the real total width of the range;
  dividing that by `sampleCount - 1` (not `sampleCount`) is deliberate —
  five points spanning a range have exactly four real gaps between them,
  not five, the same off-by-one reasoning that makes `-2.0` to `2.0`
  across `5` points step by `1.0`, not `0.8`.
- `(0 until sampleCount)` — calls the standard-library **`Int.until`**
  (full treatment above) to build a real `IntRange` of exactly
  `sampleCount` index values, `0` through `sampleCount - 1`.
- `.map { i -> ... }` — calls the standard-library **`Iterable<T>.map`**
  (full treatment above) on that range, with a **lambda expression**
  (full treatment in Terms, above) computing one real `Point` per index
  `i`.
- `val x = xMin + i * step` — inside the lambda, computes this specific
  point's real `x`: `i * step` uses `*` to scale the fixed step size by
  how many steps away from the start this particular index is, and
  adding `xMin` to that product uses `+` to shift that distance to start
  counting from the real range's own lower bound, not from zero.
- `Point(x, f(x))` — constructs one real `Point` from the `x` just
  computed and the result of calling `f` — whatever function was
  actually passed in — on that same `x`, producing this point's real
  `y` without `sample` itself ever needing to know what that
  computation actually does.

### CS Lens

This is a real, working example of a **higher-order function** — a
function that takes another function as a genuine, ordinary parameter,
the same computational idea already used, informally, every time this
project has passed a lambda to `map` or `filter`, now named directly
because `sample`'s own function parameter, `f`, is the entire reason
`sample` can work with *any* real, single-input, single-output
computation, not just one hard-coded formula.

```
Also recognized in: a UI framework's own onClick callback
parameter, a sorting function accepting a custom comparator, a
web server's own route handler registration, this project's
own Operation interface deciding what one button press actually
computes
```

Each of these hands a real piece of *behavior*, not just a value, to
code that doesn't know or care what that behavior actually does — the
same separation `sample` uses to stay completely ignorant of whatever
real mathematical expression a caller eventually asks it to graph.

### SE Lens

The design choice worth naming here is `sample` accepting a generic
`(Double) -> Double` rather than accepting this project's own real
`Node` directly and calling `evaluateAt` internally. The alternative —
`fun sample(node: Node, xMin: Double, xMax: Double, sampleCount: Int):
List<Point>`, calling `evaluateAt(node, x)` inside its own body — would
read more directly at an eventual real call site, with one fewer lambda
to write. It was deliberately not chosen: `sample`, as written, has no
idea this project's calculator, its `Node` type, or `evaluateAt` even
exist, and can be tested, understood, and trusted completely on its own
terms — exactly the same **separation of concerns** this project's own
architecture already established between its domain layer and
everything around it, applied here one layer deeper, between "sampling"
and "evaluating a specific kind of expression." The real cost: wiring
`sample` to this project's own real expression pipeline needs one extra
small step at the call site — `sample({ x -> evaluateAt(tree, x) },
xMin, xMax, sampleCount)` — building that lambda by hand rather than
getting it for free. Worth it here specifically because `sample` itself
now has zero real reason to ever change just because this project's own
expression format changes.

### Commands Needed

```
java -cp labs92.jar Lab3_sampleKt
```

The same batched `kotlinc` compilation already covered in this lesson's
first unit produced this file's compiled class as well; only the `java`
invocation differs, running `Lab3_sampleKt` — the real,
compiler-generated class name for `lab3_sample.kt`'s own top-level code.

### Run It

```
$ java -cp labs92.jar Lab3_sampleKt
(-2.0, 4.0)
(-1.0, 1.0)
(0.0, 0.0)
(1.0, 1.0)
(2.0, 4.0)
```

Real, saved in `verification/9.2/lab3_sample.kt` and
`verification/9.2/lab3_output.txt`.

Against the real, now-complete project, a new, permanent test file,
`GraphingTest.kt`, holds two real tests:
`samplingAParabolaProducesTheCorrectRealPointsAcrossTheGivenRange`
(asserting `sample({ x -> x * x }, -2.0, 2.0, 5)` produces exactly the
five real `Point`s shown above) and, proving the full, real, end-to-end
pipeline this whole lesson built,
`samplingThisProjectsOwnRealParsedExpressionProducesTheSameRealPoints`
— building this project's own real tree from the real text `"x×x"` via
`buildTree(toPostfix(tokenize("x×x")))`, then calling `sample({ x ->
evaluateAt(tree, x) }, -2.0, 2.0, 5)` — asserting the identical five real
points come out the other end, this time produced entirely by this
project's own real, integrated pipeline, text in, points out, with
nothing hand-computed anywhere along the way. Real, saved in
`verification/9.2/step1_full_suite.txt` (`84` real tests, `0` failures),
`verification/9.2/step4_Graphing.kt`, and
`verification/9.2/step4_GraphingTest.kt`. `./gradlew :app:assembleDebug`
was also run for real this session, producing a real, installable
`app-debug.apk`, confirming this lesson's own new file compiles cleanly
as part of the complete real app, not only under its own test task.

### Connect the Pieces

Follow the real text `"x×x"` through everything this lesson built, start
to finish. The first unit made sure `x` survives this project's own
tokenizer, Shunting-Yard conversion, and tree-building step, instead of
silently vanishing and crashing `buildTree`. The second unit gave that
surviving `x` a real, computed meaning: `evaluateAt` walks the resulting
tree and produces one real `Double` answer for whatever real `x` it's
given. This unit's own `sample` calls that same `evaluateAt`, wrapped in
one small lambda, five separate times, at five real, evenly-spaced `x`
values computed automatically from a range and a count — producing the
exact same five real points, `(-2.0, 4.0)` through `(2.0, 4.0)`, Lesson
9.1 could only ever produce by typing each one in by hand.

---

## Closing

**Connect the pieces.** This project's own real expression pipeline —
text in, one real answer out, unchanged since Stage 5 — now also runs
text in, *many* real answers out, without duplicating a single one of
its own existing stages. `"x×x"` tokenizes, converts to postfix, and
builds into a real tree exactly the way any other expression always
has, now that `isOperand` gives both `toPostfix` and `buildTree` one
consistent, shared, correct idea of what counts as an operand.
`evaluateAt` walks that same real tree structure `evaluate` has always
walked, substituting a real, chosen `x` at every leaf that needs one,
producing a real `Double` instead of the fixed `Int` this project's
existing calculator screen still relies on, completely unmodified.
`sample` calls that evaluation automatically, five times over in this
lesson's own running example, at five real x-values computed once from
a real range and a real count — turning `"x×x"`, five real numbers, and
nothing else, into `[(-2.0, 4.0), (-1.0, 1.0), (0.0, 0.0), (1.0, 1.0),
(2.0, 4.0)]`: this project's own real, computed shape of a parabola,
produced end to end by its own real code for the first time.

Nothing drawn on a real screen yet exists — every one of these `Point`s
is still just data, sitting in a `List`, with no pixel, no `Canvas`, and
no visible shape anywhere. That gap is deliberate: this lesson's own job
was making sure the *numbers* going into a graph are real and correct;
turning them into something visible is real, separate work of its own.

Next: Lesson 9.3 — Canvas, which finally draws something real from
this lesson's own output: Lesson 9.1's coordinate transform, made real
and permanent at last, converting every one of this lesson's own sampled
`Point`s into a real screen coordinate, and Android's own real `Canvas`
API turning those screen coordinates into an actual, visible curve.
