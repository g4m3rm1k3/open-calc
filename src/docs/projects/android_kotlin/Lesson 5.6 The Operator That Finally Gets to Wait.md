# Lesson 5.6: The Operator That Finally Gets to Wait

**What you will build:** This slice's own opening lesson proved, with a real, executed probe, that this project's current design cannot correctly evaluate `3 + 5 × 2` — it produces `10`, not the correct `13`, because `nextState` has nowhere to make the `+` *wait* while `×` runs first. Every lesson since has built one real piece of the fix in isolation: a real Stack, a real tokenizer, a real Queue proving order must be preserved. This lesson assembles all three into one real, named, permanent algorithm — the **Shunting-Yard algorithm** — that finally gives an operator somewhere to wait. By the end, this project can turn `"3+5×(2−8)"` into `["3", "5", "2", "8", "−", "×", "+"]`, a real, reordered sequence that, unlike the original, never needs precedence rules applied again to evaluate correctly.

**What you need to know first:** Stack, LIFO, push, pop, and peek, including the real, hand-written `class Stack` this slice already proved in isolation. This project's own real, permanent `tokenize` function. Operator precedence and associativity, including this project's own real, computed proof that `(8 − 3) − 2` and `8 − (3 − 2)` produce different real answers. Queue and FIFO, and this slice's own real, contrasted proof of which structure preserves reading order and which one reverses it.

## Terms used in this lesson

- **Infix notation** — the ordinary way of writing an expression, with each operator sitting *between* its two operands: `3 + 5`. This word exists because it's not the only way to write the same arithmetic, and naming it specifically is what makes it possible to talk about *converting* it into something else.
- **Postfix notation (Reverse Polish Notation, RPN)** — a way of writing the same expression with each operator placed *after* both of its operands instead of between them: `3 5 +`. This word exists because postfix notation has a real, practical property infix doesn't: it can be evaluated correctly with nothing but a Stack and a single left-to-right pass, with no precedence rules and no parentheses needed at all — every operator in a postfix expression already knows exactly which two values it applies to, from position alone.
- **Shunting-Yard algorithm** — a specific, well-known, real algorithm, invented by Edsger Dijkstra, that converts an infix expression into its equivalent postfix form using exactly one Stack (for operators still waiting to be placed) and one output sequence (for tokens already in their final order). This word exists to name that specific, real procedure — not "an algorithm that does conversion," but this one, exact, well-known sequence of steps, so it can be recognized the same way anywhere else it appears.

## Objects and methods used

- **`class Stack`**
  - *What it is:* This project's own real, permanent, hand-written Stack, holding tokens still waiting for their turn.
  - *Implementation:* `class Stack { private val items = mutableListOf<String>(); fun push(item: String) { items.add(item) }; fun pop(): String { return items.removeAt(items.size - 1) }; fun peek(): String { return items[items.size - 1] }; fun isEmpty(): Boolean { return items.isEmpty() } }` — the identical real shape this slice already proved in isolation, now real and permanent for the first time, living in its own new file, `Stack.kt`.
  - *Its use:* `toPostfix` needs somewhere to hold operators that have been read but can't be placed in the output yet, because a higher-precedence operator might still need to run first — exactly the "somewhere to wait" this slice's own opening lesson proved `CalculatorState` never had.
  - *Type:* A class with four real public methods.
  - *Responsibility:* Holding operators in LIFO order — whichever one arrived most recently is the first one reconsidered — and nothing about arithmetic, precedence, or tokens' own meaning.
  - *Depends on:* Nothing to construct; each real method depends only on the instance it's called on.
  - *Connects to:* Constructed once per `toPostfix` call; `push`/`pop`/`peek`/`isEmpty` are all four called from inside that same function, and from nowhere else in this project yet.
  - *Shape:* This project's own real, permanent, general-purpose data structure — reusable for any future job that needs LIFO order, not specific to expression parsing itself.
- **`precedence`**
  - *What it is:* A new, real, permanent, top-level lookup table giving each of this project's real operator symbols its own numeric precedence rank.
  - *Implementation:* `val precedence = mapOf("+" to 1, "−" to 1, "×" to 2, "÷" to 2)` — a real `Map<String, Int>`, deliberately keyed directly by symbol rather than by `Operator`, since `toPostfix` never needs an actual `Operator` value, only a rank to compare.
  - *Its use:* `toPostfix` reads this every time it needs to decide whether an operator already on the stack should be placed into the output before a new one is pushed.
  - *Type:* A top-level, immutable `val` holding a real `Map`.
  - *Responsibility:* Being the one real place this project's own expression parser decides which operators bind tighter than which others.
  - *Depends on:* Nothing at runtime — built once, from a fixed literal set of four pairs.
  - *Connects to:* Read twice inside `toPostfix`'s own `while` loop condition, both times via `getValue` (below).
  - *Shape:* A real, permanent, parsing-specific configuration table — deliberately kept separate from this project's own existing `operatorSymbols`, even though both are keyed by the same four real symbols, since precedence is a concern only this project's expression parser has; `nextState` and Basic mode have never needed it and still don't.
- **`toPostfix(tokens: List<String>): List<String>`**
  - *What it is:* This project's own real, permanent implementation of the Shunting-Yard algorithm, turning a token list in infix order into the equivalent postfix order.
  - *Implementation:* `fun toPostfix(tokens: List<String>): List<String>`, a top-level, pure function — no side effects beyond building and returning its own result — living in a new file, `ShuntingYard.kt`.
  - *Its use:* Given this project's own real `tokenize` function's output, this is the real, next stage that reorders those tokens so a later, still-to-be-built evaluation stage can compute the correct answer with nothing but a single left-to-right pass.
  - *Type:* A top-level, pure function.
  - *Responsibility:* Producing the correct postfix ordering for any valid sequence of number, operator, and parenthesis tokens — and nothing about whether the input tokens themselves form a valid expression at all, which remains a deliberately separate concern, per this slice's own opening lesson.
  - *Depends on:* A `List<String>` of tokens; the real `precedence` table, above; a real `Stack` instance it constructs internally.
  - *Connects to:* Called directly by this lesson's own new, real tests, using this project's own real `tokenize` function to produce its own input; not yet called by any other real project code — the same honest, no-caller-yet shape `tokenize` itself had for one lesson, and `Operation`/`Calculator` had for this project's own first ten real lessons.
  - *Shape:* This project's own real, permanent, second stage of its coming expression evaluator — reading real tokens in, producing real, reordered tokens out.

**Everything else in the file, not this lesson's subject but still explained.**

- **`mutableListOf<T>()` / `MutableList<T>`, `MutableList.add(element)`, `MutableList.removeAt(index)`, `List` indexing (`[]`)**
  - *What it is:* The real standard-library collection type and methods already established across this slice's own Stack and Queue lessons, underneath `Stack`'s own four real methods.
  - *Implementation:* `fun <T> mutableListOf(): MutableList<T>`; `fun add(element: E): Boolean`; `fun removeAt(index: Int): T`; `operator fun <T> List<T>.get(index: Int): T` — all part of the Kotlin standard library.
  - *Its use:* `Stack`'s own `push`/`pop`/`peek` are each built directly on one of these, in the identical shape this slice's own Stack lesson already proved.
  - *Type:* A factory function, an interface, and three instance/operator methods.
  - *Responsibility:* Growable, ordered, indexable storage — the real, private mechanism underneath `Stack`'s own narrower public interface.
  - *Depends on:* The list instance and, where relevant, an index or element.
  - *Connects to:* Called from inside `Stack`'s own four real methods, exactly as already established.
  - *Shape:* Standard-library data structure and methods, reappearing here unchanged.
- **`Collection.isEmpty()`**
  - *What it is:* A method answering whether a collection holds zero elements, already established from this slice's own Stack and Queue lessons.
  - *Implementation:* `fun <T> Collection<T>.isEmpty(): Boolean`, part of the Kotlin standard library.
  - *Its use:* `Stack`'s own `isEmpty` method forwards to it directly; `toPostfix` calls `Stack.isEmpty()` to know when the operator stack has nothing left to check or drain.
  - *Type:* An extension function on `Collection<T>`.
  - *Responsibility:* Answering one question about a collection's current size.
  - *Depends on:* The collection it's called on.
  - *Connects to:* Called inside `Stack.isEmpty()`, and, through it, inside `toPostfix`'s own two `while` loop conditions.
  - *Shape:* A standard-library predicate, reappearing here unchanged.
- **`String.toIntOrNull()`**
  - *What it is:* A method attempting to parse a `String` as an `Int`, returning `null` on failure, already established from this slice's own opening lesson.
  - *Implementation:* `fun String.toIntOrNull(): Int?`, part of the Kotlin standard library.
  - *Its use:* `toPostfix`'s very first check, on every token, is whether it parses as a real number — deciding, without needing any separate token-type information, whether this token belongs straight in the output.
  - *Type:* An extension function on `String`.
  - *Responsibility:* Attempting a numeric parse and reporting success or failure through its own return type.
  - *Depends on:* The `String` it's called on.
  - *Connects to:* Called once per token, first, inside `toPostfix`'s own `when` expression; its result compared against `null`.
  - *Shape:* A standard-library method, reappearing here unchanged.
- **`Map.getValue(key)`**
  - *What it is:* A method retrieving the value stored under a given key, throwing a real `NoSuchElementException` if the key isn't present, instead of returning `null` the way `[]`/`get` does.
  - *Implementation:* `fun <K, V> Map<K, V>.getValue(key: K): V`, part of the Kotlin standard library — non-nullable return type, since a missing key is treated as a real error rather than an expected case.
  - *Its use:* By the time `toPostfix` looks a token up in `precedence`, the surrounding `while` condition has already confirmed, via `token in precedence`, that the key genuinely exists — `getValue` lets that already-established certainty be reflected directly in the code's own return type, with no null-handling needed for a case that's already been ruled out.
  - *Type:* An extension function on `Map<K, V>`.
  - *Responsibility:* Retrieving a value the caller already knows must be present, failing loudly if that assumption turns out to be wrong rather than silently returning `null`.
  - *Depends on:* The `Map` instance and the key being looked up.
  - *Connects to:* Called twice inside `toPostfix`'s own operator-handling branch, once for the operator already on top of the stack and once for the incoming token.
  - *Shape:* A standard-library method — this lesson's own first real use of it, deliberately chosen over the already-established `[]`/null-check pattern specifically because the key's presence is already logically guaranteed at the point it's called.
- **`mapOf(vararg pairs)` / `Map<K, V>`**
  - *What it is:* A standard-library factory function producing a real, read-only map, already established from this project's own real `operatorSymbols`.
  - *Implementation:* `fun <K, V> mapOf(vararg pairs: Pair<K, V>): Map<K, V>`, part of the Kotlin standard library.
  - *Its use:* Builds the real `precedence` table, above.
  - *Type:* A top-level generic function.
  - *Responsibility:* Holding a fixed set of key-to-value associations.
  - *Depends on:* The key-value pairs passed to it.
  - *Connects to:* Constructed once, at the top of `ShuntingYard.kt`.
  - *Shape:* A standard-library data structure, reappearing here unchanged.
- **`when` (multi-branch expression)**
  - *What it is:* Kotlin's own multi-branch conditional, used here as an expression whose branches are boolean conditions rather than a single value being matched, already established throughout this project's own real `nextState`.
  - *Implementation:* `when { condition1 -> ...; condition2 -> ...; ... }`.
  - *Its use:* `toPostfix` uses it to decide, for each token, which of four real cases applies: a number, a recognized operator, an open parenthesis, or a close parenthesis.
  - *Type:* A control-flow expression.
  - *Responsibility:* Choosing exactly one branch to run based on which condition, checked top to bottom, is the first to be `true`.
  - *Depends on:* Each branch's own boolean condition.
  - *Connects to:* Wraps `toPostfix`'s own four real cases, evaluated once per token in the main `for` loop.
  - *Shape:* Already-established Kotlin control flow, reappearing here in this project's own newest real function.
- **`while` loop**
  - *What it is:* A control structure repeating its body for as long as a condition stays `true`, already established from this slice's own Big-O and Queue lessons.
  - *Implementation:* `while (condition) { body }`.
  - *Its use:* `toPostfix` uses three real `while` loops: one popping lower-or-equal-precedence operators before pushing a new one, one popping everything above a matching `"("`, and one draining the stack completely once every token has been read.
  - *Type:* A control-flow keyword.
  - *Responsibility:* Deciding, fresh, before every repetition, whether to run the body again.
  - *Depends on:* A `Boolean` condition, re-evaluated every time control reaches the top of the loop.
  - *Connects to:* Each of the three real loops wraps a `pop`/`push` pair moving tokens from the stack into the output, or a new token onto the stack.
  - *Shape:* A fundamental control structure, reappearing here three times in the same function.
- **Logical `&&` and `!` (negation)**
  - *What it is:* Boolean AND and negation, already established throughout this project's own real `nextState`.
  - *Implementation:* `operator fun Boolean.not(): Boolean`; `&&` short-circuits, never evaluating its right side if the left side is already `false`.
  - *Its use:* `toPostfix`'s first `while` loop's own condition combines three separate checks with `&&` — the stack isn't empty, the top isn't `"("`, and the top's precedence is high enough — each one only checked if the ones before it already passed; `!operatorStack.isEmpty()` negates the real `isEmpty()` check documented above.
  - *Type:* Operator functions on `Boolean`.
  - *Responsibility:* Combining or inverting boolean conditions.
  - *Depends on:* The `Boolean` values involved.
  - *Connects to:* Used inside two of `toPostfix`'s own three `while` conditions.
  - *Shape:* Already-established operators, reappearing here unchanged.
- **`tokenize`**
  - *What it is:* This project's own real, permanent tokenizer function, already established from this slice's own prior lesson.
  - *Implementation:* `fun tokenize(expression: String): List<String>`, unchanged since it was written.
  - *Its use:* This lesson's own new tests call it directly, with no import needed — `ShuntingYardTest.kt` shares the same real package, `com.example.calculator`, that `Tokenizer.kt` already declares — to produce real token lists for `toPostfix` to convert.
  - *Type:* A top-level, pure function.
  - *Responsibility:* Splitting a raw expression string into an ordered list of tokens.
  - *Depends on:* The raw `String` expression it's called with.
  - *Connects to:* Called once at the top of each of this lesson's own three new tests; its real output is handed directly to `toPostfix`.
  - *Shape:* This project's own real, permanent function, now genuinely composed with another real function for the first time — the first real evidence this slice's separately-built pieces actually fit together.
- **`org.junit.Assert.assertEquals`**
  - *What it is:* A real, static JUnit method comparing an expected value against an actual one, already established from this project's own real test files.
  - *Implementation:* One of twelve real, overloaded static methods on `org.junit.Assert`.
  - *Its use:* Each of this lesson's own three new tests calls it once, comparing a real, expected postfix token list against whatever `toPostfix` actually returned.
  - *Type:* A `static` method.
  - *Responsibility:* Comparing two values for equality and halting the test with a real, informative failure message if they differ.
  - *Depends on:* Two values, expected and actual.
  - *Connects to:* Called once per test in `ShuntingYardTest.kt`.
  - *Shape:* A standard, external JUnit API, reappearing here unchanged.
- **`@Test`**
  - *What it is:* An annotation marking a function as a real, executable test case, already established from this project's own real test files.
  - *Implementation:* A JUnit annotation, discovered and run automatically by a real test runner.
  - *Its use:* Marks each of this lesson's own three new test functions.
  - *Type:* An annotation.
  - *Responsibility:* Making a function recognizable as a test by real tooling.
  - *Depends on:* Nothing.
  - *Connects to:* Applied to each of `ShuntingYardTest.kt`'s own three real functions.
  - *Shape:* Already-established JUnit vocabulary, reappearing here unchanged.
- **`package` declaration**
  - *What it is:* A statement naming which package a file belongs to, already established from every real file this project has.
  - *Implementation:* `package com.example.calculator`, at the top of both new files.
  - *Its use:* Puts `Stack.kt` and `ShuntingYard.kt` in the same real package as `Tokenizer.kt`, `Calculator.kt`, and every other real file in this project — the concrete reason `toPostfix` can call `Stack()` and `ShuntingYardTest.kt` can call `tokenize(...)`, with no import needed for any of it.
  - *Type:* A file-level declaration.
  - *Responsibility:* Establishing which other declarations a file can reach without an explicit import.
  - *Depends on:* Nothing.
  - *Connects to:* Shared identically across every real file in this project's own source tree.
  - *Shape:* Already-established Kotlin vocabulary, reappearing here unchanged.

## Concept Unit: The Shunting-Yard Algorithm

### The Problem

This slice now has every individual piece this gap needs: a real Stack (5.3), a real tokenizer (5.4), a real Queue proving which order must be preserved (5.5), and, from this slice's own opening lesson, real, executed proof that `nextState` cannot correctly evaluate `3 + 5 × 2` — it produces `10`, not `13`, because nothing in `CalculatorState` lets the `+` wait while `×` runs first. None of these pieces, alone, closes that gap.

> Given tokens `["3", "+", "5", "×", "2"]`, and knowing `×` should bind tighter than `+`, what actually needs to happen to the `+` while `×` is being processed — used immediately, or held onto? If an operator needs to be held onto temporarily, which of this slice's own two structures, Stack or Queue, is actually built for that? Once every token has finally been placed in its correct order, where should that finished result live, ready to be read back out in order by whatever evaluates it later — the same structure that held the waiting operators, or something else?

### Introduce the Concept in Isolation

The following throwaway file is not part of this project and never will be — a generic, standalone implementation of the Shunting-Yard algorithm, run against a short, deliberately escalating sequence of inputs, each one adding exactly one new thing to handle:

```kotlin
fun toPostfix(tokens: List<String>, precedence: Map<String, Int>): List<String> {
    val output = mutableListOf<String>()
    val operatorStack = mutableListOf<String>()

    for (token in tokens) {
        when {
            token.toIntOrNull() != null -> output.add(token)
            token in precedence -> {
                while (
                    operatorStack.isNotEmpty() &&
                    operatorStack.last() != "(" &&
                    precedence.getValue(operatorStack.last()) >= precedence.getValue(token)
                ) {
                    output.add(operatorStack.removeAt(operatorStack.size - 1))
                }
                operatorStack.add(token)
            }
            token == "(" -> operatorStack.add(token)
            token == ")" -> {
                while (operatorStack.last() != "(") {
                    output.add(operatorStack.removeAt(operatorStack.size - 1))
                }
                operatorStack.removeAt(operatorStack.size - 1)
            }
        }
    }
    while (operatorStack.isNotEmpty()) {
        output.add(operatorStack.removeAt(operatorStack.size - 1))
    }
    return output
}

fun main() {
    val precedence = mapOf("+" to 1, "-" to 1, "*" to 2, "/" to 2)

    println(toPostfix(listOf("3", "+", "5"), precedence))
    println(toPostfix(listOf("3", "+", "5", "*", "2"), precedence))
    println(toPostfix(listOf("3", "+", "5", "*", "(", "2", "-", "8", ")"), precedence))
}
```

Compiled and run for real, this produced:

```
[3, 5, +]
[3, 5, 2, *, +]
[3, 5, 2, 8, -, *, +]
```

The first case, no precedence conflict at all, confirms the simplest possible shape works: both operands go straight to output, the one operator gets pushed, then flushed at the end. The second case is where the real mechanism this unit exists to prove first fires — tracing it exactly:

1. `token = "3"` — `"3".toIntOrNull()` succeeds, so the first branch matches: `output.add("3")`. `output = ["3"]`, `operatorStack = []`.
2. `token = "+"` — not a number; `"+"` is a key in `precedence`, so the operator branch runs. Its own `while` condition checks `operatorStack.isNotEmpty()` first — the stack is empty, so the whole condition is `false` immediately, and the loop body never runs. `operatorStack.add("+")`. `operatorStack = ["+"]`.
3. `token = "5"` — a number: `output.add("5")`. `output = ["3", "5"]`.
4. `token = "*"` — an operator. Now the `while` condition matters: `operatorStack.isNotEmpty()` is `true`; `operatorStack.last() != "("` is `true` (`"+"` isn't `"("`); `precedence.getValue("+")` is `1`, `precedence.getValue("*")` is `2` — is `1 >= 2`? No. The whole condition is `false`, so the loop still doesn't run: `"+"` stays exactly where it is, still waiting, precisely because `*` binds tighter and needs to go first. `operatorStack.add("*")`. `operatorStack = ["+", "*"]`.
5. `token = "2"` — a number: `output.add("2")`. `output = ["3", "5", "2"]`.
6. All tokens read. The final `while (operatorStack.isNotEmpty())` loop now drains what's left: first pops `"*"` (the most recently pushed — real LIFO order, exactly as this slice's own Stack lesson proved), `output.add("*")` → `output = ["3", "5", "2", "*"]`; then pops `"+"`, `output.add("+")` → `output = ["3", "5", "2", "*", "+"]`. The stack is now empty, so the loop stops.

Final: `["3", "5", "2", "*", "+"]` — matching the real, executed output exactly, and, for the first time in this slice, showing concretely *where* the `+` actually waited: sitting on the stack through steps 3 through 5, never touched, until the higher-precedence `*` had already been placed. The third case adds parentheses: `"("` gets pushed with no precedence check at all (it never matches `token in precedence`, since parentheses carry no precedence of their own — they get their own dedicated branch instead); `")"` pops and outputs everything above the matching `"("` — here, just `"-"` — then discards the `"("` itself with one final `removeAt` that adds nothing to the output, since parentheses exist only to control grouping and never appear in a postfix result at all.

### Discard the Throwaway Example

This throwaway `toPostfix` and its generic precedence table are deleted now. What follows is the real mechanism just proven, applied to this project's own real operators, tokens, and Stack.

### Project Change

- **Reference Source** — No reference counterpart. This is a from-scratch addition, implementing a specific, well-known, published algorithm (Dijkstra's Shunting-Yard) rather than porting existing code — the algorithm's own real shape was proven correct moments ago, in this same lesson's own isolated lab.
- **Files affected** — Three new files: `app/src/main/java/com/example/calculator/Stack.kt` (this slice's own real Stack, now made permanent for the first time), `app/src/main/java/com/example/calculator/ShuntingYard.kt` (the real `precedence` table and `toPostfix` function), and `app/src/test/java/com/example/calculator/ShuntingYardTest.kt`.
- **Change type** — Add.
- **Location** — All three are brand-new files. `Stack.kt` sits alongside `Tokenizer.kt`, not inside `Calculator.kt`: it's a general-purpose data structure, not calculator-specific domain logic, the same real Cohesion reasoning that already justified `Tokenizer.kt`'s own separate file. `ShuntingYard.kt` sits alongside both: converting a whole token list is a distinct responsibility from either tokenizing a raw string or reacting to one button press.
- **Dependencies** — None beyond what this project already has; `Stack.kt` needs nothing new, and `ShuntingYard.kt` needs only `Stack` (same file tree) and the Kotlin standard library.

### The New Code

```kotlin
val precedence = mapOf(
    "+" to 1,
    "−" to 1,
    "×" to 2,
    "÷" to 2
)

fun toPostfix(tokens: List<String>): List<String> {
    val output = mutableListOf<String>()
    val operatorStack = Stack()

    for (token in tokens) {
        when {
            token.toIntOrNull() != null -> output.add(token)
            token in precedence -> {
                while (
                    !operatorStack.isEmpty() &&
                    operatorStack.peek() != "(" &&
                    precedence.getValue(operatorStack.peek()) >= precedence.getValue(token)
                ) {
                    output.add(operatorStack.pop())
                }
                operatorStack.push(token)
            }
            token == "(" -> operatorStack.push(token)
            token == ")" -> {
                while (operatorStack.peek() != "(") {
                    output.add(operatorStack.pop())
                }
                operatorStack.pop()
            }
        }
    }
    while (!operatorStack.isEmpty()) {
        output.add(operatorStack.pop())
    }
    return output
}
```

This is the whole of `ShuntingYard.kt`'s own real content — nothing surrounding it to show, since this is a brand-new file. `Stack.kt` is likewise a brand-new file, holding the identical real class already shown in full in this lesson's own Header, under "Objects and methods used" — not repeated here, per this project's own established convention for a construct whose real, complete shape was already shown once, in full, earlier in the same lesson.

### Mechanical Walkthrough

Every distinct syntactic element in `toPostfix`'s own code, in order (the isolated lab's identical shape was already fully enumerated, step by step, in this unit's own execution trace above; this walkthrough focuses on what differs in the real, permanent version):

- `val precedence = mapOf(...)` — already established from the Header's own entry, above.
- `fun toPostfix(tokens: List<String>): List<String>` — a function declaration, already established.
- `val output = mutableListOf<String>()` — a real, empty `MutableList<String>`, already established, serving the same role the isolated lab's own `output` did.
- `val operatorStack = Stack()` — constructing a real, permanent `Stack` instance, documented in the Header, in place of the isolated lab's own plain `mutableListOf<String>()` — the one real, structural difference between the throwaway version and this real one.
- `for (token in tokens)` — already established.
- `token.toIntOrNull() != null -> output.add(token)` — already established, identical to the isolated lab.
- `token in precedence ->` — the real `in` operator, already established, checking `precedence`'s own key set directly, rather than a separately-passed parameter the way the isolated lab's version did.
- `while (!operatorStack.isEmpty() && operatorStack.peek() != "(" && precedence.getValue(operatorStack.peek()) >= precedence.getValue(token))` — the identical real condition already traced in full, above, now reading through `Stack`'s own real `isEmpty()`/`peek()` methods instead of raw list operations.
- `output.add(operatorStack.pop())` — the real `Stack.pop()` method, documented in the Header, in place of the isolated lab's own `removeAt(operatorStack.size - 1)` — the same real operation, now expressed through a narrower, purpose-built interface.
- `operatorStack.push(token)` — the real `Stack.push()` method, in place of the isolated lab's own `add(token)`.
- `token == "(" -> operatorStack.push(token)` — already established.
- `token == ")" -> { while (operatorStack.peek() != "(") { output.add(operatorStack.pop()) }; operatorStack.pop() }` — the identical real logic already explained above: pop and output everything above the matching `"("`, then pop once more, discarding the `"("` itself without adding it to `output`.
- `while (!operatorStack.isEmpty()) { output.add(operatorStack.pop()) }` — already established, draining whatever real operators remain once every token has been read.
- `return output` — already established.

### CS Lens

The Shunting-Yard algorithm is one of the most widely reused real algorithms in computing, precisely because postfix notation's own real property — evaluable in one pass with just a Stack — makes it the standard target for almost every real expression parser.

```
Also recognized in: real calculator apps (many genuinely implement
this exact algorithm), real spreadsheet formula engines, real compiler
and interpreter front-ends parsing arithmetic expressions, RPN
calculators (a real, historical class of calculator, including real
HP models, that made users type postfix directly), any real
expression-evaluation library in any real language's standard tooling
```

### SE Lens

The alternative not chosen here: evaluate the infix expression directly, on the fly, without ever converting it to postfix first — checking precedence and recursively evaluating sub-expressions as the input is scanned. The real tradeoff: a direct-evaluation approach can work, but it tightly couples "figure out the correct order" with "compute the actual arithmetic" into one pass, the same coupling problem this project already proved for real once before; converting to postfix *first*, as its own separate, real, tested stage, means the ordering problem gets solved completely and verifiably — as these three real, executed tests already do — before any evaluation logic has to exist at all. The real cost: an extra, real intermediate data structure (the postfix token list itself) that a direct-evaluation approach wouldn't need to materialize — a small, real memory tradeoff in exchange for a stage that can be tested, and trusted, entirely on its own.

### Commands Needed

`kotlinc lab1_shunting_yard.kt -include-runtime -d lab1.jar`, then `java -jar lab1.jar`, for the isolated lab, exactly as established throughout this slice. For the real project: `./gradlew :app:testDebugUnitTest --tests "com.example.calculator.ShuntingYardTest"` runs only this lesson's own new tests; `./gradlew :app:testDebugUnitTest :app:assembleDebug` runs this project's own complete real suite and produces a real, installable `.apk`.

### Run It

Real, permanent test file, `ShuntingYardTest.kt`:

```kotlin
package com.example.calculator

import org.junit.Assert.assertEquals
import org.junit.Test

class ShuntingYardTest {
    @Test
    fun convertingTheProjectsOwnTargetExpressionToPostfixMatchesTheHandTracedResult() {
        // Arrange
        val tokens = tokenize("3+5×(2−8)")

        // Act
        val postfix = toPostfix(tokens)

        // Assert
        assertEquals(listOf("3", "5", "2", "8", "−", "×", "+"), postfix)
    }

    @Test
    fun precedenceCorrectlyReordersMultiplicationBeforeAddition() {
        // Arrange
        val tokens = tokenize("3+5×2")

        // Act
        val postfix = toPostfix(tokens)

        // Assert
        assertEquals(listOf("3", "5", "2", "×", "+"), postfix)
    }

    @Test
    fun samePrecedenceOperatorsGroupLeftAssociatively() {
        // Arrange
        val tokens = tokenize("8−3−2")

        // Act
        val postfix = toPostfix(tokens)

        // Assert
        assertEquals(listOf("8", "3", "−", "2", "−"), postfix)
    }
}
```

Real command run: `./gradlew :app:testDebugUnitTest --tests "com.example.calculator.ShuntingYardTest" --rerun-tasks`, producing:

```
BUILD SUCCESSFUL in 3s
27 actionable tasks: 27 executed
```

All three of this lesson's own new tests passed for real. The second one closes this slice's own opening gap directly: postfix `3 5 2 × +`, by hand, evaluates as `5 × 2 = 10`, then `3 + 10 = 13` — the exact correct answer `nextState` could never produce for real, proven back in this slice's own first lesson. The third proves associativity is genuinely being respected, not just precedence: `8 3 − 2 −` evaluates as `8 − 3 = 5`, then `5 − 2 = 3`, matching `(8 − 3) − 2`'s own real, computed answer from this slice's own earlier work — had the `>=` comparison in `toPostfix`'s own `while` condition been a plain `>` instead, this exact test would have failed, silently producing the wrong grouping for two operators tied on precedence. A full, real run of this project's own complete suite, `./gradlew :app:testDebugUnitTest :app:assembleDebug --rerun-tasks`, produced:

```
com.example.calculator.HapticsTest > pressingKeypadButtonTriggersHapticFeedback FAILED
    androidx.test.espresso.AppNotIdleException at HapticsTest.kt:35

com.example.calculator.ThemeTest > calculatorThemeProvidesRealCustomPrimaryColor FAILED
    androidx.test.espresso.AppNotIdleException at ThemeTest.kt:29

32 tests completed, 2 failed
```

Thirty-two real tests now exist in this project — the prior twenty-nine plus this lesson's own three new ones — and none of this lesson's own tests are among the two real failures: both are the same already-documented, pre-existing, intermittent flake first found during this project's own earlier architecture work, unrelated to anything this lesson touched. A separate, real, immediately-following run, forced fresh via `--rerun-tasks`, produced a fully clean result instead:

```
BUILD SUCCESSFUL in 8s
43 actionable tasks: 43 executed
```

confirming this project's own complete real suite, all thirty-two tests, genuinely does pass together, and that a real, installable `.apk` still builds successfully with `Stack.kt` and `ShuntingYard.kt` now part of this project's own real source.

### Connect the Pieces

The Shunting-Yard algorithm is now real, permanent, and tested — the first time this slice's separately-proven pieces have actually been assembled into something that does real, useful work together, closing the exact gap this slice opened with.

## Connect the Pieces

Follow this project's own real target expression through every piece this lesson finally assembled. `"3+5×(2−8)"` was already proven, by this project's own real `tokenize`, to split into nine real tokens. This lesson's own real `toPostfix`, built from this slice's own real Stack and this slice's own already-proven precedence and associativity rules, converts that exact token list into `["3", "5", "2", "8", "−", "×", "+"]`, confirmed by a real, executed test — and confirmed, step by step, in this unit's own isolated lab, exactly *why*: the `+` sat on the operator stack, untouched, while `×` was read, pushed, and eventually placed ahead of it, because `precedence.getValue("×")` genuinely was greater than `precedence.getValue("+")` at the one real moment that comparison mattered. A second real test proved this closes this slice's own opening gap directly — the simpler case, `3+5×2`, converts to `3 5 2 × +`, which evaluates by hand to the correct `13`, not the `10` this project's own real, unmodified `nextState` has produced since this slice began. A third real test proved associativity specifically, not just precedence: `8−3−2` converts to `8 3 − 2 −`, matching `(8 − 3) − 2`'s own real, already-computed answer, `3` — proof that the `>=` comparison, not a plain `>`, is what makes two tied operators group correctly. Nothing about `CalculatorState`, `nextState`, or this project's existing real, shipped Basic-mode behavior changed — `toPostfix`, like `tokenize` before it, exists as new, additive, fully tested capability with no caller yet. What this slice's own remaining work inherits from here is a real, working answer to "in what order should this expression's operations actually happen" — ready for whatever builds a real tree, and then a real evaluator, on top of it next.
