# Lesson 5.1: One Slot, Two Operators

**What you will build:** No new feature ships from this lesson — this is a purely diagnostic lesson, the same shape this project's own architecture lessons already used to prove a real risk before fixing it. What actually gets built is proof: a real, executed demonstration that this calculator's entire design, exactly as it stands right now, cannot correctly evaluate an expression containing more than one operator — not "gets the answer slightly wrong," but structurally unable to hold more than one pending operation in mind at once. Alongside that proof, this lesson hands the rest of this slice — a real expression parser this project is about to spend several lessons building — its starting vocabulary: **tokens**, **grammar**, **operator precedence**, and **associativity**. Each of those words names one real, specific piece of the machinery a correct expression evaluator needs, and each one gets its own real, isolated, executed proof here, before any of them get used to build anything.

**What you need to know first:** This calculator's own current state-management design — a single, immutable `CalculatorState` holding one `Display`, one nullable `firstOperand: Int?`, and one nullable `pendingOperator: Operator?`, plus a pure function `nextState` that reads a button label and produces the next `CalculatorState` — the real, motivated refactor this project already built. Collections (`List`, `MutableList`, `Map`, iteration with `for`), used throughout this project's own keypad and its `operatorSymbols` map. Nullable types, and the established pattern of checking two nullable values together before using either one before it, used throughout `nextState`'s own `"="` branch. Data classes and sealed classes, both load-bearing for `CalculatorState` and `Display`.

## Terms used in this lesson

- **Token** — a single, meaningful, indivisible piece of a larger input, produced by splitting that input up according to some rule. A raw string like `"12+7"` is, to a computer, nothing but a sequence of individual characters — nothing about it says `'1'` and `'2'` belong together as one number while `'+'` stands alone. Turning that raw character sequence into a `List` of meaningful pieces — `["12", "+", "7"]` — is what makes it possible to reason about the input as a *structure* instead of an undifferentiated string. This word exists because "the smallest unit worth reasoning about" is not the same thing as "the smallest unit the computer stores": a `Char` is what the computer stores; a token is what a reader, human or program, actually thinks in.
- **Tokenization** — the specific act of producing a list of tokens from raw input. Named separately from "token" itself because it names a process — a function, a stage, something that runs — not a piece of data, the same way "sorting" is a distinct word from "a sorted list."
- **Grammar** — a set of rules describing which sequences of tokens are actually valid, and how they combine into larger structures. A token list is not automatically meaningful just because tokenizing it succeeded: `["+", "12", "+"]` is a perfectly well-formed list of three tokens and a completely invalid expression. A grammar is what tells the difference. This word exists because "did the input split into pieces correctly" and "do those pieces form something meaningful together" are two separate questions, answered by two separate mechanisms — a grammar is specifically the second one.
- **Operator precedence** — a ranking, assigned to each operator, saying how tightly it binds compared to the others; higher-precedence operators are evaluated before lower-precedence ones, regardless of the order they appear in the raw input. This word exists because reading order and evaluation order are not the same thing the moment an expression mixes operators of different strength — `3 + 5 × 2` reads left to right as "three, then plus, then five, then times, then two," but evaluates as "five times two, first."
- **Associativity** — the rule for grouping operators that share the *same* precedence, since precedence alone cannot say which one goes first between two operators tied for rank. Left-associative means the leftmost operator of a tied pair groups first — `8 − 3 − 2` groups as `(8 − 3) − 2`. Right-associative means the rightmost one groups first instead. This word exists because precedence answers "which operator is stronger," and a separate question remains even after that is settled: "when two operators are equally strong, which side wins."
- **Compound assignment (`+=`)** — a shorthand operator that reassigns a variable to the result of applying another operator (here, `+`) between its current value and a right-hand operand, in one step: `number += char` means exactly `number = number + char`, written once instead of twice. This word exists purely for brevity at the call site; it changes nothing about what actually happens, only how many characters it takes to say it.
- **Parenthesized expression** — a sub-expression wrapped in `(` and `)`, forcing it to be evaluated as one complete unit before anything outside the parentheses touches it, overriding whatever precedence or associativity would otherwise apply. This word exists because precedence and associativity are *default* rules; parentheses are how a person — or a later stage of a real parser — overrides those defaults explicitly, which is exactly how this project's own eventual target expression, `3 + 5 × (2 − 8)`, will force the subtraction to run first even though `+` and `×` would otherwise decide the grouping between them.
- **`try`/`catch` as an expression** — a control structure that attempts to run some code and produces a value either way: the value the `try` block's last line evaluates to if nothing goes wrong, or the value the matching `catch` block's last line evaluates to if the named exception type is thrown partway through. This project's own `nextState` already depends on this: `try { Display.Value(operator.operation.apply(first, current.display.textOrZero().toInt()).toString()) } catch (invalidOperation: ArithmeticException) { Display.Error }` is itself the whole right-hand side of a `val` assignment, not a separate statement bolted on afterward — the exception-handling logic and the value being produced are the same expression.

## Objects and methods used

**Everything else in the file, not this lesson's subject but still explained.** None of this lesson's own subject — tokens, grammar, precedence, associativity — is itself a real external class or method; each one is a concept, and lives in Terms, above. Every entry below is supporting cast: real standard-library members the throwaway labs call, and this project's own real, already-existing objects used to ground the Problem sections in real, current behavior. Ordered by first appearance across this lesson's four Concept Units.

- **`Char.isDigit()`**
  - *What it is:* An instance method on Kotlin's `Char` type, answering whether a single character represents a decimal digit.
  - *Implementation:* `fun Char.isDigit(): Boolean`, part of the Kotlin standard library (`kotlin.text`), returning `true` for exactly the characters `'0'`–`'9'`.
  - *Its use:* The tokenizer lab in this lesson's first Concept Unit calls it once per character, to decide whether that character belongs to a multi-character number token or starts something else entirely — the same real method this project's own `nextState` already calls, as `label[0].isDigit()`, to tell a digit button press apart from every other kind.
  - *Type:* An extension function on `Char`, callable as an instance method (`char.isDigit()`).
  - *Responsibility:* Answering exactly one question — is this one character a decimal digit — with no side effects and no knowledge of any character before or after it.
  - *Depends on:* The single `Char` it's called on; nothing else.
  - *Connects to:* Called by this lesson's `tokenize` function once per loop iteration; its `Boolean` result decides which branch of that loop's own `if`/`else` runs next.
  - *Shape:* A tiny, pure predicate — a public standard-library API surface, not project-specific code.
- **`mutableListOf<String>()` / `MutableList<String>`**
  - *What it is:* A standard-library factory function producing a new, empty, growable list, and the mutable list type it returns.
  - *Implementation:* `fun <T> mutableListOf(): MutableList<T>`, returning a real `MutableList<T>` — a `List` that additionally supports adding and removing elements after creation, unlike the read-only `List` this project's own `keypadRows` already uses.
  - *Its use:* The tokenizer lab needs somewhere to accumulate tokens one at a time, in order, as it walks the input string — a `MutableList<String>` is exactly a growable, ordered container for that.
  - *Type:* `mutableListOf` is a top-level generic function; `MutableList<T>` is a standard-library interface.
  - *Responsibility:* Holding an ordered sequence of elements that can grow (and shrink) after the collection already exists, unlike an immutable `List`.
  - *Depends on:* Nothing to construct an empty one; each element added afterward via a separate call.
  - *Connects to:* Created once at the top of `tokenize`; every subsequent `tokens.add(...)` call writes into this same instance; `tokenize`'s own `return tokens` hands it back to whoever called the function.
  - *Shape:* A standard-library data structure — the internal working storage of the tokenizer lab, never exposed as anything but its final, returned value.
- **`MutableList.add(element)`**
  - *What it is:* An instance method on `MutableList` that appends one new element to the end of the list.
  - *Implementation:* `fun add(element: E): Boolean`, part of the Kotlin standard library, mutating the list in place and returning whether the add succeeded (always `true` for a plain `MutableList`).
  - *Its use:* Called every time the tokenizer lab has finished recognizing one complete token — either a flushed run of digits or a single non-digit character — appending it to the running `tokens` list.
  - *Type:* An instance method on the `MutableList<E>` interface.
  - *Responsibility:* Growing the list by exactly one element, at the end, leaving every existing element's position unchanged.
  - *Depends on:* The `MutableList` instance it's called on, and the one element being added.
  - *Connects to:* Called from inside `tokenize`'s own `for` loop, three separate times across the loop body and the code that runs after it ends; each call's return value is discarded here, since this lab never needs to check whether the add "succeeded."
  - *Shape:* A standard-library mutation method — an internal implementation detail of the tokenizer lab, not something its caller (`main`) ever calls directly.
- **`String.isNotEmpty()`**
  - *What it is:* An instance method on `String` answering whether the string contains at least one character.
  - *Implementation:* `fun CharSequence.isNotEmpty(): Boolean`, part of the Kotlin standard library, equivalent to `length > 0`.
  - *Its use:* The tokenizer lab checks this before flushing its `number` accumulator into the token list — an empty accumulator means no digits have been collected since the last flush, so there is nothing real to add.
  - *Type:* An extension function on `CharSequence` (and so, by inheritance, on `String`).
  - *Responsibility:* Answering one question about the string's own length, nothing more.
  - *Depends on:* The `String` (or other `CharSequence`) it's called on.
  - *Connects to:* Called twice inside `tokenize` — once inside the loop's `else` branch, once after the loop ends — each time guarding a `tokens.add(number)` call so an empty accumulator never becomes a phantom empty-string token.
  - *Shape:* A small, pure standard-library predicate, used purely as a guard condition.
- **`Char.toString()`**
  - *What it is:* An instance method converting a single `Char` into a one-character `String`.
  - *Implementation:* `fun Any?.toString(): String`, the universal Kotlin method every type inherits (ultimately from `kotlin.Any`), specialized for `Char` to produce exactly the one-character string containing that character.
  - *Its use:* The tokenizer lab needs every element of its `List<String>` to actually be a `String`, but the loop is iterating over `input`'s individual `Char`s — calling `.toString()` on a non-digit character converts it into the one-character `String` token the list's own type requires.
  - *Type:* An instance method, inherited by every Kotlin type from the root `Any` class.
  - *Responsibility:* Producing a `String` representation of whatever value it's called on; for `Char` specifically, that representation is always exactly one character long.
  - *Depends on:* The single value (here, a `Char`) it's called on.
  - *Connects to:* Called once per non-digit character inside `tokenize`'s `else` branch, and its result is passed directly into `tokens.add(...)`.
  - *Shape:* A universal standard-library method — public API surface every value in the language exposes.
- **`String.plus` (called through `+=`)**
  - *What it is:* The real operator method backing Kotlin's `+` operator between a `String` and another value.
  - *Implementation:* `operator fun String.plus(other: Any?): String`, part of the Kotlin standard library — accepting `Any?` (not just another `String`), and internally calling `.toString()` on `other` before concatenating.
  - *Its use:* `number += char` compiles to `number = number.plus(char)` — this single overload is why appending a `Char` directly onto a `String` with `+=` is legal at all, even though `char` is not itself a `String`.
  - *Type:* An `operator fun` — a specially-marked instance method whose name lets the compiler translate `+`/`+=` syntax into a direct call.
  - *Responsibility:* Building a brand-new `String` combining the receiver's characters with the `Any?` argument's own string representation; it never mutates the original string, since `String` in Kotlin is always immutable.
  - *Depends on:* The `String` it's called on, and one `Any?` value to append.
  - *Connects to:* Invoked implicitly by the compiler every time `number += char` runs inside `tokenize`'s digit-accumulation branch; its return value becomes `number`'s new value.
  - *Shape:* A standard-library operator overload — the mechanism, not the syntax, behind a compound-assignment expression this lesson's own code writes directly.
- **`setOf(vararg elements)` / `Set<String>`**
  - *What it is:* A standard-library factory function producing a new, read-only set, and the set type it returns.
  - *Implementation:* `fun <T> setOf(vararg elements: T): Set<T>`, returning a real `Set<T>` — an unordered collection guaranteeing each distinct element appears at most once, unlike `List`, which allows duplicates and has a defined order.
  - *Its use:* The grammar lab needs to check whether one token is "any recognized operator symbol" — a `Set<String>` is exactly a collection whose only real job is answering "is this element present," with no need for the ordering or duplicate-counting a `List` would provide.
  - *Type:* `setOf` is a top-level generic function; `Set<T>` is a standard-library interface.
  - *Responsibility:* Holding a collection of distinct elements, with membership-testing as its primary, defining operation — deliberately not promising any particular iteration order.
  - *Depends on:* The elements passed to `setOf` at construction; nothing afterward, since the result is read-only.
  - *Connects to:* Constructed once at the top of `isValidSimpleExpression`; queried by the `in` operator (below) once per call to that function.
  - *Shape:* A standard-library data structure — this lesson's first genuinely new collection type, distinct from the `List`/`MutableList`/`Map` this project has used since its own Stage 0.
- **`Set.contains` (called through `in`)**
  - *What it is:* The real method backing Kotlin's `in` operator when the right-hand side is a `Set`.
  - *Implementation:* `operator fun <T> Set<T>.contains(element: T): Boolean`, part of the Kotlin standard library — answering whether `element` is a member of the set.
  - *Its use:* `tokens[1] in operators` compiles to `operators.contains(tokens[1])`, checking whether the token sitting in the middle position is one of the four recognized operator symbols.
  - *Type:* An `operator fun` — the same naming convention that lets `in` work directly as readable syntax instead of a named method call.
  - *Responsibility:* Answering one membership question, with no side effects.
  - *Depends on:* The `Set` it's called on, and the one element being checked.
  - *Connects to:* Called once inside `isValidSimpleExpression`'s own `return` expression; its `Boolean` result is combined with two other checks via `&&`. This project's own `nextState` already relies on the identical `operator fun contains` mechanism, just on a `Map` instead of a `Set` — `label in operatorSymbols` — proving `in` is one shared operator working the same way across more than one real collection type.
  - *Shape:* A standard-library operator overload, demystifying what `in` actually does underneath its own readable syntax.
- **`List.size`**
  - *What it is:* A read-only property on `List` (and its supertype `Collection`) giving the number of elements it holds.
  - *Implementation:* `val size: Int`, part of the Kotlin standard library's `Collection` interface — every real collection type computes or stores this.
  - *Its use:* The grammar lab's very first real check is `tokens.size != 3` — rejecting any token list that isn't exactly the length this lab's own deliberately narrow grammar rule requires, before even looking at what any individual token contains.
  - *Type:* A read-only (`val`) property, not a method — no parentheses at the call site.
  - *Responsibility:* Reporting exactly how many elements the collection currently holds, and nothing about what those elements are.
  - *Depends on:* The collection instance it's read from.
  - *Connects to:* Read once inside `isValidSimpleExpression`, guarding an early `return false` before the function's own indexed lookups (`tokens[0]`, `tokens[1]`, `tokens[2]`) run — reading `size` first is exactly what makes those later indexed reads safe.
  - *Shape:* A standard-library read-only property — public API surface on every real collection.
- **`String.toIntOrNull()`**
  - *What it is:* An instance method attempting to parse a `String` as an `Int`, returning `null` on failure instead of throwing.
  - *Implementation:* `fun String.toIntOrNull(): Int?`, part of the Kotlin standard library — internally attempting the same parse `String.toInt()` performs, but catching its own internal failure and returning `null` rather than letting an exception escape.
  - *Its use:* The grammar lab needs to check whether a token *could* be a real operand without crashing on tokens that plainly aren't — `"+".toIntOrNull()` needs to fail gracefully so the check can continue, not abort the whole function.
  - *Type:* An extension function on `String`, returning the nullable type `Int?`.
  - *Responsibility:* Attempting a numeric parse and reporting success or failure through its own return type, rather than through an exception a caller would have to catch.
  - *Depends on:* The `String` it's called on.
  - *Connects to:* Called twice inside `isValidSimpleExpression`, each result compared against `null` directly inside the function's own `&&`-chained `return` expression — never assigned to an intermediate variable, since only the null-or-not distinction matters here, not the parsed value itself.
  - *Shape:* A standard-library method — worth contrasting directly with `String.toInt()` (below), this project's own already-established, throwing counterpart.
- **`String.toInt()`**
  - *What it is:* An instance method parsing a `String` as an `Int`, throwing an exception if the string isn't a valid integer.
  - *Implementation:* `fun String.toInt(): Int`, part of the Kotlin standard library — returning a non-nullable `Int` on success, and throwing a real `NumberFormatException` on failure, with no built-in way to recover short of catching that exception.
  - *Its use:* This project's own real `nextState` calls it three separate times — once in the operator-symbol branch, once in the `"="` branch's `try` block — every time a button-press sequence needs the display's current text turned into a real number to compute with.
  - *Type:* An extension function on `String`, returning non-nullable `Int`.
  - *Responsibility:* Producing a real numeric value from a string that is trusted, by the caller, to already look like one — placing the burden of "is this actually a number" on whoever calls it, rather than handling that question itself.
  - *Depends on:* The `String` it's called on.
  - *Connects to:* Called by this project's own `nextState`, always on the result of `Display.textOrZero()` (below) — never on raw, unchecked user input — which is exactly why it's safe here despite throwing: `textOrZero()` already guarantees a numeric-looking string in every real case `nextState` reaches it from.
  - *Shape:* A standard-library method, already load-bearing throughout this project's real, shipped code — shown here specifically to contrast with `toIntOrNull()`, its non-throwing counterpart this lesson's grammar lab reaches for instead, precisely because the grammar lab's own job is deciding whether a token *is* a number, not assuming it already is one.
- **`mapOf(vararg pairs)` / `Map<String, Int>`**
  - *What it is:* A standard-library factory function producing a new, read-only map from key to value, and the map type it returns.
  - *Implementation:* `fun <K, V> mapOf(vararg pairs: Pair<K, V>): Map<K, V>`, part of the Kotlin standard library — this project's own `operatorSymbols` (below) is itself already built the same way, as a real `Map<String, Operator>`.
  - *Its use:* The precedence lab needs to associate each operator symbol with its own numeric rank — a `Map<String, Int>` is exactly a lookup table from one to the other, with no need for any ordering beyond "given this key, what value goes with it."
  - *Type:* `mapOf` is a top-level generic function; `Map<K, V>` is a standard-library interface.
  - *Responsibility:* Holding a set of key-to-value associations and answering lookups by key, with no defined relationship between the value type and how it's stored.
  - *Depends on:* The key-value pairs passed to `mapOf` at construction.
  - *Connects to:* Constructed once, at the top of the precedence lab, from four real `Pair<String, Int>` values built by the `to` infix function (below); queried afterward by the `[]` indexing operator (below).
  - *Shape:* A standard-library data structure — the exact same real type this project's own `operatorSymbols` already uses, applied here to a different value type (`Int` ranks instead of `Operator` constants).
- **`to` (infix function building a `Pair`)**
  - *What it is:* An infix function that packages two values together into one real `Pair` object.
  - *Implementation:* `infix fun <A, B> A.to(that: B): Pair<A, B>`, part of the Kotlin standard library — `"+" to 1` is exactly `"+".to(1)`, just written without the dot and parentheses, because `to` is declared `infix`.
  - *Its use:* `mapOf` accepts a variable number of `Pair` arguments; writing `"+" to 1` is how each key-value association actually gets built before `mapOf` assembles them all into one `Map`.
  - *Type:* An infix extension function.
  - *Responsibility:* Bundling exactly two values, of possibly different types, into one real, immutable `Pair` — nothing about ranking, ordering, or meaning; that interpretation is entirely up to whatever consumes the resulting `Pair` (here, `mapOf`).
  - *Depends on:* The two values being paired.
  - *Connects to:* Called four times inside the precedence lab's own `mapOf(...)` call — once per operator symbol — and once, already, inside this project's own real `operatorSymbols` construction.
  - *Shape:* A standard-library infix function — syntax sugar over `Pair`'s own two-argument constructor, made readable at a map-literal's own call site.
- **`Map` indexing (`get`, called through `[]`)**
  - *What it is:* The real method backing Kotlin's `[]` syntax when used on a `Map`.
  - *Implementation:* `operator fun <K, V> Map<K, V>.get(key: K): V?` — note the return type is nullable, even though the map's own declared value type isn't; looking up a key that doesn't exist returns `null` rather than throwing.
  - *Its use:* `precedence["+"]` looks up the numeric rank stored under the key `"+"`; because the return type is `V?`, the precedence lab has to check the result for `null` before comparing two ranks with `>` — this project's own `operatorSymbols[label]` already relies on the identical mechanism.
  - *Type:* An `operator fun`, the same naming convention behind `Set.contains` (above) — what looks like array-style indexing syntax is really a named method call underneath.
  - *Responsibility:* Answering "what value, if any, is stored under this key" — the "if any" is not optional; the method's own declared return type is what forces every caller to handle a missing key, rather than letting one crash the program.
  - *Depends on:* The `Map` instance and the key being looked up.
  - *Connects to:* Called twice inside the precedence lab's `main`, and the two nullable results feed directly into the same already-established double-null-check smart-cast pattern this project's own `nextState` already uses for its own two nullable fields.
  - *Shape:* A standard-library operator overload — reappearing here on a `Map<String, Int>` after this project's own real code already used it on a `Map<String, Operator>`.
- **`Int` comparison (`>`, calling `Int.compareTo`)**
  - *What it is:* The real method backing Kotlin's `>` operator between two `Int` values.
  - *Implementation:* `operator fun Int.compareTo(other: Int): Int`, part of the Kotlin standard library, returning a negative number, zero, or a positive number depending on the relative order of the two values; `a > b` compiles to `a.compareTo(b) > 0`.
  - *Its use:* The precedence lab compares two operators' numeric ranks directly — `timesPrecedence > plusPrecedence` — to decide, mechanically, which one binds tighter.
  - *Type:* An `operator fun` on `Int`.
  - *Responsibility:* Producing a three-way ordering result between two numbers; `>` itself is just one way of reading that result.
  - *Depends on:* The two `Int` values being compared.
  - *Connects to:* Called once, at the very end of the precedence lab's `main`, on the two values already retrieved from the precedence `Map` and already null-checked.
  - *Shape:* A standard-library operator overload on a primitive type — the single mechanical step precedence-checking actually reduces to, once the data (the precedence table) already exists.
- **`CalculatorState`**
  - *What it is:* This project's own real, immutable state type, holding everything the calculator's UI needs to render at any moment.
  - *Implementation:* `data class CalculatorState(val display: Display = Display.Value("0"), val firstOperand: Int? = null, val pendingOperator: Operator? = null)` — three properties, exactly one `Display`, one nullable `Int`, one nullable `Operator`.
  - *Its use:* This lesson's Problem section reproduces a real, executed sequence of button presses against this exact type, unmodified, to prove — not assert — that it structurally cannot represent "an operator is still waiting" at the same moment "a different operator has just arrived."
  - *Type:* A `data class` — a real, generated-equality, generated-`copy()`-bearing class.
  - *Responsibility:* Holding the complete, current snapshot of everything the calculator's UI and logic need to know right now — nothing more, nothing persisted, nothing about how it got here.
  - *Depends on:* Nothing to construct (every property has a default); each new instance is produced from an old one via `copy(...)`, never mutated in place.
  - *Connects to:* Read and rewritten by `nextState` (below) on every single button press; read by `CalculatorScreen` (unchanged by this lesson) to decide what to render.
  - *Shape:* This project's own real, central data model — the exact seam this lesson's Problem section exposes as too narrow for a multi-operator expression.
- **`Display`**
  - *What it is:* This project's own real sealed class distinguishing an ordinary numeric display value from an error state.
  - *Implementation:* `sealed class Display { data class Value(val text: String) : Display(); object Error : Display() }` — `Value` wraps a real `String`; `Error` is a singleton with no data at all.
  - *Its use:* `nextState`'s own logic reads and writes `Display` throughout; this lesson's Problem section prints `state.display.textOrZero()` (below) at the end of its temporary probe to read the final numeric result back out as plain text.
  - *Type:* A `sealed class`, with exactly two real subtypes.
  - *Responsibility:* Representing everything the display can legitimately show — a real value, or an error — in a way the compiler itself can check for completeness, since a sealed class's own subtypes are a closed, fully known set.
  - *Depends on:* Nothing to construct `Display.Value("0")`; `Display.Error` is a singleton `object`, constructed once, ever.
  - *Connects to:* Held by `CalculatorState.display`; read and pattern-matched inside `nextState` and inside `Display.textOrZero()` (below).
  - *Shape:* This project's own real, permanent domain type — not touched or extended by this lesson, only read.
- **`nextState`**
  - *What it is:* This project's own real, pure, top-level function computing the calculator's next state from its current state and one button label.
  - *Implementation:* `fun nextState(current: CalculatorState, label: String): CalculatorState` — a `when` with four branches: digit, `"C"`, a recognized operator symbol, and `"="`.
  - *Its use:* This lesson's Problem section calls this exact, real, unmodified function six times in a row — once per button press in `"3", "+", "5", "×", "2", "="` — to produce real, observable proof of the architectural gap this whole lesson exists to name.
  - *Type:* A top-level, pure function — no class, no mutable state of its own, no side effects.
  - *Responsibility:* Deciding, given exactly one prior state and one new button label, what the calculator's entire next state should be — the single place in this project where "what does pressing this button actually mean" is decided.
  - *Depends on:* A `CalculatorState` to start from, a `String` label naming which button was pressed, and `operatorSymbols` (below) to recognize operator labels.
  - *Connects to:* Called by `CalculatorViewModel.onButtonClick` in the real, shipped app on every real button press; called directly, with no `CalculatorViewModel` or Android machinery involved at all, by this lesson's own temporary probe — proof, by itself, that `nextState` needs nothing beyond plain Kotlin to run.
  - *Shape:* This project's own real, central business-logic function — exactly the seam whose own single `firstOperand`/`pendingOperator` pair this lesson's Problem section shows cannot hold two operators at once.
- **`Operator` / `Operation`**
  - *What it is:* This project's own real enum of arithmetic operators, each one carrying its own real `Operation` implementation.
  - *Implementation:* `nextState`'s `"="` branch calls two related members across two related types in a chain — `operator.operation`, then `.apply(...)` on the result — so their real, declared shape, quoted verbatim from this project's own `Calculator.kt`, is:

    ```kotlin
    fun interface Operation {
        fun apply(current: Int, amount: Int): Int
    }

    enum class Operator(val operation: Operation) {
        PLUS(Addition()),
        MINUS(Subtraction()),
        TIMES(Multiplication()),
        DIVIDE(Division()),
        MODULO(Modulo())
    }
    ```

    Five constants, each holding a distinct, private implementation of `Operation` (`Addition`, `Subtraction`, `Multiplication`, `Division`, `Modulo` — each a separate, one-method class elsewhere in the same file, not shown here since `nextState` never calls any of them by name, only polymorphically through `operation.apply`).
  - *Its use:* `nextState`'s own `"="` branch calls `operator.operation.apply(first, ...)` to actually perform whichever arithmetic the pending operator names; this lesson's Problem section relies on `Operator.TIMES` being the value left in `pendingOperator` by the time `"="` is pressed, to explain exactly which arithmetic actually ran.
  - *Type:* `Operation` is a `fun interface` (a single-abstract-method interface eligible for lambda syntax); `Operator` is an `enum class`.
  - *Responsibility:* `Operation` defines the one-method contract every arithmetic operation must satisfy; `Operator` gives each of this project's five real operations a name, a keypad symbol (via `operatorSymbols`, below), and a way to be stored as one field's value.
  - *Depends on:* `Operation` depends on nothing; `Operator` depends on one real `Operation` implementation per constant, supplied when each constant is declared.
  - *Connects to:* `operator.operation.apply(...)` is called from `nextState`'s `"="` branch; `Operator` values are stored in `CalculatorState.pendingOperator` and looked up from `operatorSymbols`.
  - *Shape:* This project's own real, permanent domain types — read only, not modified, by this lesson.
- **`operatorSymbols`**
  - *What it is:* This project's own real, top-level lookup table from keypad symbol to `Operator` constant.
  - *Implementation:* `val operatorSymbols = mapOf("+" to Operator.PLUS, "−" to Operator.MINUS, "×" to Operator.TIMES, "÷" to Operator.DIVIDE)` — a real `Map<String, Operator>` with exactly four entries.
  - *Its use:* `nextState`'s operator-symbol branch checks `label in operatorSymbols` and reads `operatorSymbols[label]` to translate a raw keypad label into a real `Operator` value; this lesson's Problem section relies on both of those real lookups running unmodified.
  - *Type:* A top-level, immutable `val` holding a real `Map`.
  - *Responsibility:* Being the single place this project decides which raw keypad symbols count as operators at all, and which real `Operator` each one means.
  - *Depends on:* Nothing at runtime — built once, from a fixed literal set of four pairs, when the app starts.
  - *Connects to:* Read by `nextState`, twice, every time an operator button is pressed.
  - *Shape:* This project's own real, permanent configuration data — the same real object already fulfilling the "`Map`'s key-lookup operator" promise this project made to itself back when it was first built.
- **`Display.textOrZero()`**
  - *What it is:* This project's own real, private extension function converting any `Display` into a plain `String`, treating an error state as the text `"0"`.
  - *Implementation:* `private fun Display.textOrZero(): String = when (this) { is Display.Value -> text; Display.Error -> "0" }`.
  - *Its use:* Every numeric read this lesson's Problem section needs — reading the display before typing a digit, reading it before applying an operator, reading the final answer at the end of the probe — goes through this exact real function.
  - *Type:* A `private` extension function on `Display`.
  - *Responsibility:* Producing a numeric-safe `String` from any `Display`, specifically so calling code never has to pattern-match `Display` itself just to get a usable string out of it.
  - *Depends on:* The `Display` it's called on.
  - *Connects to:* Called by `nextState`, several times, and by this lesson's own temporary probe's final `println`.
  - *Shape:* This project's own real, permanent, private helper — an internal implementation detail of `Calculator.kt`, never called from outside that file in the real, shipped app.
- **`copy()`**
  - *What it is:* The real, compiler-generated method every `data class` receives automatically, producing a new instance with some properties changed and the rest copied unchanged.
  - *Implementation:* For `CalculatorState`, the compiler generates `fun copy(display: Display = this.display, firstOperand: Int? = this.firstOperand, pendingOperator: Operator? = this.pendingOperator): CalculatorState`.
  - *Its use:* Every branch of `nextState` produces its result by calling `current.copy(...)`, naming only the properties that branch actually changes — the operator-symbol branch, the exact one this lesson's Problem section turns on, calls `current.copy(firstOperand = ..., pendingOperator = ..., display = ...)`, silently leaving whatever `firstOperand`/`pendingOperator` were already there behind, unread.
  - *Type:* A compiler-generated instance method, present on every `data class` automatically.
  - *Responsibility:* Producing a new, independent instance that shares every unspecified property's value with the original, without mutating the original at all.
  - *Depends on:* The instance it's called on, and zero or more named arguments for whichever properties should differ in the copy.
  - *Connects to:* Called four times inside `nextState`, once per branch; every call's result is what `nextState` itself returns.
  - *Shape:* A standard, compiler-generated method — and the exact mechanism, in this lesson's Problem section, by which the old `pendingOperator`/`firstOperand` get discarded rather than read: `copy` was never told to preserve them conditionally, only to overwrite them unconditionally.
- **`ArithmeticException`**
  - *What it is:* A real, standard exception type representing an illegal arithmetic operation, most commonly integer division by zero.
  - *Implementation:* `kotlin.ArithmeticException`, a subclass of `RuntimeException` — thrown automatically by the JVM itself when an `Int` division or modulo operation's divisor is `0`.
  - *Its use:* `nextState`'s own `"="` branch already catches this exact exception, converting a real division-by-zero crash into a safe `Display.Error` instead — untouched by this lesson, but present in the real code this lesson's Problem section quotes in full.
  - *Type:* A concrete exception class.
  - *Responsibility:* Signaling, at the moment it happens, that an arithmetic operation cannot produce a real result — nothing about how the caller should respond.
  - *Depends on:* Nothing to be thrown; the JVM raises it automatically inside `Division.apply`/`Modulo.apply` when their `amount` argument is `0`.
  - *Connects to:* Thrown, potentially, by `Operator.operation.apply(...)` inside `nextState`'s `"="` branch; caught by the `catch (invalidOperation: ArithmeticException)` block immediately surrounding that same call.
  - *Shape:* A standard JVM/Kotlin exception type — already fully load-bearing in this project's own real, shipped error handling, shown here only because it appears inside the real `nextState` body this lesson quotes.

## Concept Unit: Tokens

### The Problem

This project's own `CalculatorState` is about to face a real feature this slice exists to build: evaluating a whole expression, typed or built up as a sequence of symbols, correctly — something with the shape of `3 + 5 × (2 − 8)`. Right now, this calculator only ever reacts to one button label at a time, inside `nextState`, and then moves on — it has never once needed to look at "everything typed so far" as a single, structured thing. Before any of the rest of this slice can even begin — before deciding which operator binds tighter, before knowing whether an expression is well-formed at all — there has to be a way to take a raw sequence of button presses (or a raw typed string) and turn it into a list of meaningful pieces to reason about, together, as a whole.

> Given the raw string `"12+7"`, what are the actual meaningful *pieces* inside it — is `"12"` one piece, or two separate characters that happen to sit next to each other? What tool you already know — from this project's own `keypadRows`, or from this lesson's own "What you need to know first" — could hold an ordered sequence of pieces once you've identified them? If you walked through `"12+7"` one character at a time with a `for` loop, what problem would you hit turning the two characters `'1'` and `'2'` into the single number `12`, rather than two separate one-digit pieces?

### Introduce the Concept in Isolation

The following throwaway function is not part of this project and never will be — it exists only to prove, concretely, what "breaking a raw string into meaningful pieces" actually requires:

```kotlin
fun tokenize(input: String): List<String> {
    val tokens = mutableListOf<String>()
    var number = ""
    for (char in input) {
        if (char.isDigit()) {
            number += char
        } else {
            if (number.isNotEmpty()) {
                tokens.add(number)
                number = ""
            }
            tokens.add(char.toString())
        }
    }
    if (number.isNotEmpty()) {
        tokens.add(number)
    }
    return tokens
}

fun main() {
    println(tokenize("12+7"))
}
```

Compiled and run for real, this produced:

```
[12, +, 7]
```

Walking through exactly what produced that real output, one character at a time:

1. `char = '1'` — `isDigit()` is `true`, so `number` (currently `""`) becomes `"1"` via `number += char`.
2. `char = '2'` — `isDigit()` is `true` again, so `number` becomes `"12"`.
3. `char = '+'` — `isDigit()` is `false`, so the `else` branch runs: `number` (`"12"`) is not empty, so it's flushed into `tokens` as one complete token and reset to `""`; then `'+'` itself is added as its own, separate token.
4. `char = '7'` — `isDigit()` is `true`, so `number` becomes `"7"`.
5. After the loop ends — `number` (`"7"`) is still not empty, so the final `if` outside the loop flushes it into `tokens` as one last token.

The real result, `["12", "+", "7"]`, proves the point directly: `"12"` survived as one indivisible piece, not two separate `'1'` and `'2'` characters — the accumulator (`number`) is exactly what makes that possible, holding onto a run of digit characters until something *not* a digit signals that the run is over. This is called **tokenization**, and each resulting piece — `"12"`, `"+"`, `"7"` — is a **token**.

### Discard the Throwaway Example

This `tokenize` function is deleted now and will not appear in this project again. This project's own real tokenizer — the one this slice's expression parser will actually depend on — is a later lesson's own job, built against this project's own real symbol set (including `×`, `÷`, `−`, and eventually `(`/`)`), not this throwaway `+`-only stand-in.

### Mechanical Walkthrough

Every distinct syntactic element in the code above, in order:

- `fun tokenize(input: String): List<String>` — a function declaration, already fully established in this curriculum: a name, one parameter (`input`, typed `String`), and a declared return type (`List<String>`). Declaring the return type as `List<String>`, not `MutableList<String>`, is a deliberate choice worth naming here: callers of `tokenize` are promised a read-only view of the result, even though the function builds it internally as a growable, mutable list — the mutability is this function's own private implementation detail, not part of its public contract.
- `val tokens = mutableListOf<String>()` — a `val` binding (already established: the reference `tokens` itself can never be reassigned to point at a different list) holding a real, empty `MutableList<String>`, created by the standard-library `mutableListOf` function, above.
- `var number = ""` — a `var` binding (already established: unlike `val`, this reference *can* be reassigned), initialized to the empty string, serving as the running accumulator for whatever run of digit characters is currently being collected.
- `for (char in input)` — a `for` loop, already established, but iterating over something new here: a `String` directly. `String` implements `CharSequence`, which is itself iterable, meaning each pass through this loop binds `char` to one real `Char` — the individual character type, distinct from a one-character `String` — drawn from `input` in order, left to right.
- `if (char.isDigit())` — an `if` check, already established, calling the real standard-library method `Char.isDigit()` documented above.
- `number += char` — the compound assignment operator documented in Terms, above, compiling to a call on the real `String.plus(Any?)` method also documented above; this is where a `Char` gets appended onto the end of the running `String` accumulator.
- `else` — the matching `else` branch, already established, running whenever the current character is *not* a digit.
- `if (number.isNotEmpty())` — a nested `if`, calling the real standard-library method `String.isNotEmpty()` documented above, guarding against flushing an empty accumulator as a phantom token.
- `tokens.add(number)` — the real standard-library method `MutableList.add(element)`, documented above, appending the just-completed number token.
- `number = ""` — resetting the accumulator back to empty, ready to collect the next run of digits, if any.
- `tokens.add(char.toString())` — another real call to `MutableList.add`, this time appending the non-digit character itself, converted to a one-character `String` via the real standard-library `Char.toString()` method documented above — necessary because `tokens` is declared to hold `String`, not `Char`.
- `if (number.isNotEmpty()) { tokens.add(number) }`, outside the loop — the same guarded-flush pattern as inside the loop's `else` branch, run one final time after the loop ends, to catch a run of digits that reaches the very end of `input` with nothing after it to trigger a flush from inside the loop.
- `return tokens` — the `return` keyword, already established, handing the now-complete `MutableList<String>` back to the caller — implicitly upcast to the declared `List<String>` return type, since every `MutableList` already satisfies the read-only `List` interface.
- `fun main()` and `println(tokenize("12+7"))` — already fully established: a nested function call, `tokenize("12+7")`, whose result is passed directly into `println`.

### CS Lens

Tokenization is one of the most universally reused ideas in computing — recognizing meaningful units inside a raw stream is the first, unavoidable step before anything can reason about structure at all.

```
Also recognized in: every real compiler's or interpreter's lexer (turning
source code into something a parser can use), regular-expression engines
scanning raw text, natural-language processing splitting a sentence into
words, a command-line shell splitting a typed command into its separate
arguments, a CSV reader splitting each line on commas
```

### SE Lens

The alternative not chosen here: skip a separate tokenizing step entirely, and try to interpret the raw input directly, one character at a time, deciding what it *means* in the same pass that reads it. The real tradeoff: a single combined pass avoids ever allocating an intermediate `List<String>`, but it permanently welds "recognize the shape of the input" to "decide what it means" into the very same code — the identical coupling problem this project already proved, for real, once before: a piece of code doing two genuinely different jobs at once is harder to test in isolation and harder to extend, because a change to either job risks breaking the other. A real grammar (the next Concept Unit) needs to ask "is this a valid sequence" purely by looking at a token list — that's only possible if tokenizing has already finished, separately, before grammar-checking ever starts.

### Commands Needed

`kotlinc` is the Kotlin compiler, run from a terminal; `lab1_tokenize.kt` names the source file to compile; `-include-runtime` bundles the Kotlin standard library directly into the output file, so the result can run with nothing but a plain JVM installed; `-d lesson5_1.jar` names the output file, a real, executable `.jar` archive. `java -cp lesson5_1.jar Lab1_tokenizeKt` then runs it: `java` is the Java Virtual Machine's own launcher; `-cp lesson5_1.jar` puts that jar on the classpath the JVM searches for classes; `Lab1_tokenizeKt` is the real, compiler-generated class name holding `lab1_tokenize.kt`'s own top-level `main` function — Kotlin generates one such class per file, named after the file itself with a `Kt` suffix, specifically so a plain JVM (which has no concept of a "top-level function" of its own) has a real class to load and call `main` on.

### Run It

Real command run: `kotlinc lab1_tokenize.kt lab2_grammar.kt lab3_precedence.kt lab4_associativity.kt step1_precedence_gap.kt -include-runtime -d lesson5_1.jar`, then `java -cp lesson5_1.jar Lab1_tokenizeKt`. Real, executed output:

```
[12, +, 7]
```

### Connect the Pieces

This real, executed output proves tokens exist as a real, buildable thing — the very next unit asks a harder question of that same token list: not just "was it split correctly," but "does it mean anything at all."

## Concept Unit: Grammar

### The Problem

`tokenize("12+7")` really did produce `["12", "+", "7"]` — but `tokenize` itself has no opinion about whether the result is actually a valid expression. Nothing stops the exact same function from tokenizing `"++12"` into `["+", "+", "12"]`, three perfectly well-formed tokens describing something that means nothing at all as arithmetic. Producing tokens and deciding whether they form something meaningful are two different jobs.

> Look at the token list `["+", "12", "+"]` — does this look like a valid expression to you, in plain English, and why not? Given only "operand, operator, operand" as a starting shape for the simplest possible expression, would `["12", "+", "7"]` pass that shape? Would `["12", "+", "7", "×"]`? Why or why not, using only that same three-piece shape?

### Introduce the Concept in Isolation

The following throwaway function is not part of this project and never will be — it exists only to prove that "valid sequence of tokens" is a real, checkable question, answerable by real code:

```kotlin
fun isValidSimpleExpression(tokens: List<String>): Boolean {
    val operators = setOf("+", "-", "×", "÷")
    if (tokens.size != 3) return false
    return tokens[0].toIntOrNull() != null &&
        tokens[1] in operators &&
        tokens[2].toIntOrNull() != null
}

fun main() {
    println(isValidSimpleExpression(listOf("12", "+", "7")))
    println(isValidSimpleExpression(listOf("+", "12", "+")))
    println(isValidSimpleExpression(listOf("12", "+", "7", "×")))
}
```

Compiled and run for real, this produced:

```
true
false
false
```

The first call, `listOf("12", "+", "7")`, is exactly three tokens, shaped operand/operator/operand — `true`. The second, `listOf("+", "12", "+")`, is also exactly three tokens, but shaped operator/operand/operator — the first `toIntOrNull()` check fails immediately, so the whole `&&` chain short-circuits to `false` without even evaluating the rest. The third, `listOf("12", "+", "7", "×")`, has four tokens, not three — the very first check, `tokens.size != 3`, already returns `false` before any indexed lookup even runs. This tiny, hard-coded rule — "exactly three tokens, shaped operand/operator/operand" — is called a **grammar**: a real, checkable rule for which token sequences are actually valid.

### Discard the Throwaway Example

This `isValidSimpleExpression` function is deleted now and will not appear in this project again. It is deliberately too rigid to be this project's own real grammar — a real expression like `3 + 5 × 2` is seven tokens long, and one with parentheses is longer still; a grammar capable of handling expressions of any real length is usually written recursively, describing "an expression" partly in terms of smaller expressions nested inside it. Building that real, recursive grammar is genuinely more than this lesson's own job — it belongs to this slice's later work on tokenizing and evaluating the real expression this project's Scientific mode will need.

### Mechanical Walkthrough

Every distinct syntactic element in the code above, in order:

- `fun isValidSimpleExpression(tokens: List<String>): Boolean` — a function declaration, already established, taking one `List<String>` parameter and returning `Boolean`.
- `val operators = setOf("+", "-", "×", "÷")` — a `val` binding holding a real `Set<String>`, built by the standard-library `setOf` function documented above, containing this lab's four recognized operator symbols.
- `if (tokens.size != 3) return false` — an `if` with a single-statement body and no braces (already-established Kotlin syntax: braces are optional for a single-statement `if` body), reading the real standard-library `List.size` property documented above, and comparing it against the literal `3` with `!=`, already-established from this project's own extensive use of null-comparison. An early `return` from inside an `if`, already established, exits the function immediately without evaluating anything below it.
- `return tokens[0].toIntOrNull() != null && tokens[1] in operators && tokens[2].toIntOrNull() != null` — one `return` statement whose value is a chain of three checks joined by `&&`, already established (this project's own `nextState` already checks two nullable values this same way). Each piece:
  - `tokens[0]` — indexed access on a `List`, already established from this project's own `keypadRows` and `label[0]` usage, retrieving the element at position `0`.
  - `.toIntOrNull()` — the real standard-library method documented above, attempting to parse that element as an `Int` and returning `null` on failure instead of throwing.
  - `!= null` — a null comparison, already established, true exactly when the parse succeeded.
  - `&&` — logical AND, already established: the whole expression only continues evaluating its next operand if everything so far was `true`, and stops immediately (short-circuits) the moment anything is `false`.
  - `tokens[1] in operators` — the real `in` operator, documented above as `Set.contains`, checking whether the middle token is one of the four recognized operator symbols.
  - `tokens[2].toIntOrNull() != null` — the same parse-and-null-check pattern as the first operand, applied to the third token.
- `fun main()`, `println(...)`, three separate calls to `isValidSimpleExpression` with three different `listOf(...)` arguments — already fully established.

### CS Lens

A grammar is the same idea underlying how any structured language — formal or natural — distinguishes meaningful sequences from meaningless ones.

```
Also recognized in: every real programming language's own formal syntax
specification, natural language's own grammatical rules for a valid
sentence, regular expressions (a regex is itself a tiny grammar for
strings), JSON and XML parsers rejecting malformed documents, network
protocol parsers rejecting malformed packets
```

### SE Lens

The alternative not chosen here: skip validating the grammar entirely, and just try to evaluate whatever tokens show up, catching whatever exception happens to result. The real tradeoff: catching a failure only after it happens — a crash, or worse, a wrong answer computed from nonsense input with no error at all — versus rejecting invalid input up front, with a specific, statable reason, before any evaluation logic even runs. This project already made exactly this choice once before, for a different kind of failure: catching a real `ArithmeticException` and showing `Display.Error` instead of crashing. Grammar-checking applies the same "fail with a clear, stated cause" principle one stage earlier — before arithmetic ever starts, not after it goes wrong.

### Commands Needed

The same real `kotlinc`/`java` commands already explained in this lesson's first Concept Unit, above, run here against a different file: `kotlinc` compiles `lab2_grammar.kt` (bundled, in this lesson's own single real compilation, together with every other file this lesson uses); `java -cp lesson5_1.jar Lab2_grammarKt` runs its `main` function, the same way `Lab1_tokenizeKt` was run above, using the same compiler-generated `<FileName>Kt` class-naming pattern.

### Run It

Real command run: `java -cp lesson5_1.jar Lab2_grammarKt`. Real, executed output:

```
true
false
false
```

### Connect the Pieces

A grammar answers "is this sequence of tokens even valid" — but nothing about *how* to group a valid one correctly once operators of different strength are mixed together; that question is next.

## Concept Unit: Operator Precedence

### The Problem

This project's own real `nextState` has never had to evaluate more than one operator in a single button-press sequence — every real button-press flow this project has ever shipped presses one operator, then `"="`, before pressing another. What actually happens if a second operator arrives before `"="` is pressed?

> By hand, what answer would you write down for `3 + 5 × 2`, and why does the multiplication happen first rather than the addition? Look at `CalculatorState`'s own three fields, above — exactly one `Display`, one nullable `firstOperand`, one nullable `pendingOperator`. If a `"+"` press has already set `firstOperand` and `pendingOperator`, and then a second operator, `"×"`, arrives before `"="` is pressed, what does `nextState`'s own operator-symbol branch actually do with the values already sitting in those two fields?

Here is that exact branch, quoted from this project's own real, current, unmodified `nextState`:

```kotlin
fun nextState(current: CalculatorState, label: String): CalculatorState {
    return when {
        label[0].isDigit() -> {
            val currentText = current.display.textOrZero()
            val newText = if (currentText == "0") label else currentText + label
            current.copy(display = Display.Value(newText))
        }
        label == "C" -> current.copy(display = Display.Value("0"))
        label in operatorSymbols -> current.copy(
            firstOperand = current.display.textOrZero().toInt(),
            pendingOperator = operatorSymbols[label],
            display = Display.Value("0")
        )
        label == "=" -> {
            val operator = current.pendingOperator
            val first = current.firstOperand
            val newDisplay = if (operator != null && first != null) {
                try {
                    Display.Value(operator.operation.apply(first, current.display.textOrZero().toInt()).toString())
                } catch (invalidOperation: ArithmeticException) {
                    Display.Error
                }
            } else {
                current.display
            }
            current.copy(display = newDisplay, pendingOperator = null, firstOperand = null)
        }
        else -> current
    }
}
```

To find out for real, a verbatim copy of this exact file was compiled standalone, with one temporary addition — a `main` function driving the real, unmodified `nextState` through the exact button sequence `3, +, 5, ×, 2, =`, never touching the real project's own files:

```kotlin
fun main() {
    var state = CalculatorState()
    val presses = listOf("3", "+", "5", "×", "2", "=")
    for (label in presses) {
        state = nextState(state, label)
    }
    println(state.display.textOrZero())
}
```

Compiled and run for real, this produced:

```
10
```

Neither the naive left-to-right answer (`3 + 5 = 8`, then `8 × 2 = 16`) nor the mathematically correct, precedence-respecting answer (`5 × 2 = 10`, then `3 + 10 = 13`) — the real output is `10`, meaning the `"+"` and its `3` never factored into the answer at all. Tracing exactly why, one button press at a time:

1. `label = "3"` — digit branch: `textOrZero()` reads `"0"` from the initial state, and since that's exactly `"0"`, `newText` becomes just `"3"` rather than appending onto the placeholder zero; `state.display` becomes `Value("3")`, with `firstOperand`/`pendingOperator` still both `null`.
2. `label = "+"` — `"+"` is a real key in `operatorSymbols`, so the operator branch runs: `firstOperand` is set to `3` (the display's current numeric value) and `pendingOperator` is set to `PLUS`; the display resets to `Value("0")`.
3. `label = "5"` — digit branch again: the display is `"0"`, so it becomes `"5"` outright.
4. `label = "×"` — the operator branch runs a second time, and this is the exact moment the bug happens: `firstOperand` is reassigned to `5`, silently overwriting the `3` from step 2, and `pendingOperator` is reassigned to `TIMES`, silently overwriting `PLUS`. Nothing in this branch checks whether a pending operator already existed before overwriting it — `copy(firstOperand = ..., pendingOperator = ...)` unconditionally replaces both. The `"+"` and its `3` are not applied, not queued, not remembered anywhere; they are simply gone.
5. `label = "2"` — digit branch: display becomes `"2"`.
6. `label = "="` — `pendingOperator` is `TIMES` and `firstOperand` is `5` (never `PLUS`/`3` — those values no longer exist anywhere in this state), so the real arithmetic performed is `5 × 2`, producing `10`.

This is the concrete, structural gap: `CalculatorState` has exactly one slot for a pending operator and exactly one slot for a first operand. Respecting precedence — letting `+` wait while `×` runs first — requires holding *more than one* pending operator in mind at once, ordered by which one binds tighter. There is no version of `nextState`'s current three-field shape that can do that; the fix is not a bug fix inside this design, it's a different design.

### Introduce the Concept in Isolation

The following throwaway code is not part of this project and never will be — it isolates the actual mechanism a correct evaluator needs, away from this project's own real state machine entirely:

```kotlin
val precedence = mapOf(
    "+" to 1,
    "-" to 1,
    "×" to 2,
    "÷" to 2
)

fun main() {
    val plusPrecedence = precedence["+"]
    val timesPrecedence = precedence["×"]
    if (plusPrecedence != null && timesPrecedence != null) {
        println(timesPrecedence > plusPrecedence)
    }
}
```

Compiled and run for real, this produced:

```
true
```

`×` and `÷` are both ranked `2`; `+` and `-` are both ranked `1` — higher number, tighter binding. `timesPrecedence > plusPrecedence` is real, ordinary `Int` comparison, and it comes back `true`: `×` binds tighter than `+`. This proves the real point: **operator precedence** is not some deep, magical property of an operator — it is just data, an ordinary `Map<String, Int>`, and deciding which operator runs first reduces to one ordinary numeric comparison, once that data exists.

### Discard the Throwaway Example

Both throwaway pieces from this unit are discarded now: the temporary `main` added to a standalone copy of `Calculator.kt`'s real content, used only to reproduce the real bug above, was never part of the actual project and is deleted; the `precedence` map and its own `main`, used to isolate the ranking idea itself, are likewise deleted. This project's own real `Calculator.kt` is completely unmodified by this lesson — the real fix, a genuinely different architecture capable of holding more than one pending operator, is this slice's own later work, not this lesson's.

### Mechanical Walkthrough

Every distinct syntactic element in the precedence lab's own code, in order (`nextState`'s own tokens were already fully enumerated across this project's earlier work and are not re-derived here beyond what the trace above already explained line by line):

- `val precedence = mapOf("+" to 1, "-" to 1, "×" to 2, "÷" to 2)` — a `val` binding holding a real `Map<String, Int>`, built with the standard-library `mapOf` function and the `to` infix function, both documented above; four real key-value pairs, each key a real operator symbol, each value its numeric precedence rank.
- `fun main()` — already established.
- `val plusPrecedence = precedence["+"]` — `Map` indexing via `[]`, documented above as the real `operator fun get`, returning the nullable `Int?` stored under the key `"+"`.
- `val timesPrecedence = precedence["×"]` — the identical operation, looking up `"×"` instead.
- `if (plusPrecedence != null && timesPrecedence != null)` — the already-established two-value null-check pattern, smart-casting both `plusPrecedence` and `timesPrecedence` from `Int?` to plain `Int` inside the block that follows.
- `println(timesPrecedence > plusPrecedence)` — the real `Int.compareTo`-backed `>` operator, documented above, comparing the two now-smart-cast `Int` values.

### CS Lens

Operator precedence is the exact mechanism behind reading `3 + 5 × 2` correctly — and it recurs everywhere structured expressions with more than one kind of operator exist.

```
Also recognized in: every real programming language's own operator
precedence table (Kotlin, Java, Python, and C each publish one), regular
expression engines (`*` binds tighter than concatenation, which binds
tighter than `|`), real compilers' own parser generators, and ordinary
arithmetic notation itself — PEMDAS/BODMAS, the same rule taught in
grade-school math, existing for exactly the same reason: without an
agreed ranking, `3 + 5 × 2` is genuinely ambiguous
```

### SE Lens

The alternative not chosen here: patch `nextState` to apply the pending operation immediately whenever a second operator arrives, the same "chaining" behavior a real four-function calculator uses — rather than building a genuinely different, precedence-aware architecture. The real tradeoff: chaining would fix this exact symptom (the silently-discarded `"+"` and `3`) but would still compute strictly left to right, with no concept of precedence at all — `3 + 5 × 2` would become `(3 + 5) × 2 = 16`, still wrong by the standard convention this project's own eventual expression feature needs. Patching the symptom would hide the deeper limitation rather than remove it. The real fix has to be a structurally different design — something capable of holding more than one pending operator, ordered by precedence — which is exactly what this slice's coming lessons on stacks and shunting-yard build; deliberately left unbuilt here, since a real Concept Isolation Rule lab, proving the mechanism in isolation, is this lesson's own job, not a production patch.

### Commands Needed

The same real `kotlinc`/`java` commands already explained above, run twice more here: once compiling and running `step1_precedence_gap.kt` (the real bug-reproduction probe, its own generated class named `com.example.calculator.Step1_precedence_gapKt` — the extra package prefix present because, unlike the other files in this lesson, this one carries a real `package com.example.calculator` declaration, matching the real project file it's a verbatim copy of), and once running `lab3_precedence.kt` (generated class `Lab3_precedenceKt`, no package prefix, matching the other throwaway labs).

### Run It

Real commands run: `java -cp lesson5_1.jar com.example.calculator.Step1_precedence_gapKt`, producing:

```
10
```

and `java -cp lesson5_1.jar Lab3_precedenceKt`, producing:

```
true
```

### Connect the Pieces

Precedence settles which of two *different-strength* operators runs first — but `CalculatorState`'s own real operators include two, `−` and `÷`, that can appear more than once at the *same* strength, and precedence alone has nothing to say about that case.

## Concept Unit: Associativity

### The Problem

This project's own five real operators — `+`, `−`, `×`, `÷`, and `%` — include two, `−` and `÷`, that could appear more than once in the same expression at the same precedence rank. Precedence resolved `3 + 5 × 2` by ranking `×` above `+` — but what settles `8 − 3 − 2`, where both operators are literally the same symbol, tied for rank?

> By hand, what do you compute `8 − 3 − 2` as — left to right, or right to left? Try both groupings and see whether they actually give the same answer. Now try `2 ÷ 4 ÷ 2` the same way — does grouping matter there too? Given that precedence can't distinguish between two operators of the exact same rank, what additional rule would a correct evaluator need?

### Introduce the Concept in Isolation

The following throwaway code is not part of this project and never will be — it exists only to prove, with real, computed numbers, that the two groupings genuinely disagree:

```kotlin
fun main() {
    val leftGrouped = (8 - 3) - 2
    val rightGrouped = 8 - (3 - 2)
    println("left: $leftGrouped, right: $rightGrouped")
}
```

Compiled and run for real, this produced:

```
left: 3, right: 7
```

`(8 − 3) − 2` computes `5 − 2 = 3`; `8 − (3 − 2)` computes `8 − 1 = 7`. These are two genuinely different, both individually-correct-looking numbers from the exact same three values and the exact same operator, differing only in which pairing runs first — proof that grouping order isn't a pedantic technicality, it changes the real answer. The rule that settles which grouping is the *actual* correct one is called **associativity**: subtraction (and division) are, by standard mathematical convention, **left-associative** — the leftmost operator of a tied pair groups first, matching how a person reads left to right and matching the real answer, `3`, that `(8 − 3) − 2` produces.

### Discard the Throwaway Example

This throwaway `main` is deleted now and will not appear in this project again. This project's own real `−` and `÷` already behave correctly today, precisely because this project has never yet allowed two operators to be pending at once — the moment this slice's coming lessons build something that can, that something will need to apply left-associativity explicitly, by rule, rather than by accident.

### Mechanical Walkthrough

Every distinct syntactic element in the code above, in order:

- `fun main()` — already established.
- `val leftGrouped = (8 - 3) - 2` — a parenthesized expression, documented in Terms above, forcing `8 - 3` to be computed as one complete unit — producing `5` — before the outer `- 2` runs against that result, producing `3`. The `-` operator itself, already established from this project's own `Subtraction` class.
- `val rightGrouped = 8 - (3 - 2)` — the identical three values and the identical operator, but with the parentheses moved: `3 - 2` is forced to compute first, producing `1`, before the outer `8 -` runs against that result, producing `7`.
- `println("left: $leftGrouped, right: $rightGrouped")` — a string template, already established, interpolating both computed values directly into one output string.

### CS Lens

Associativity is precedence's own necessary companion — a rule for resolving ties, without which "which operator is stronger" leaves genuine ambiguity unresolved the moment two operators tie.

```
Also recognized in: every real programming language's own grammar spec,
published alongside its precedence table (Kotlin's own `=` assignment is
right-associative — `a = b = c` means `a = (b = c)`), exponentiation in
standard mathematical notation (conventionally right-associative:
`2^3^2` means `2^(3^2)` = 512, not `(2^3)^2` = 64), real compilers' own
operator-precedence parsers, and classic natural-language
sentence-attachment ambiguities
```

### SE Lens

The alternative not chosen here: leave associativity unstated, and just process same-precedence operators in whatever order a future data structure happens to produce them. The real tradeoff: this project already has two left-associative operators, `−` and `÷`, where getting the grouping order wrong produces a genuinely different, wrong numeric answer — proven for real above, `3` versus `7`, from the identical three values and the identical operator. Leaving the rule implicit trusts every future piece of code touching same-precedence operators to happen to get the order right by coincidence; naming the rule explicitly now, before this slice's evaluator exists at all, makes correctness something the rest of this slice can build against on purpose, not something it has to hope holds.

### Commands Needed

The same real `kotlinc`/`java` commands already explained above, run once more here against `lab4_associativity.kt`, generated class `Lab4_associativityKt`.

### Run It

Real command run: `java -cp lesson5_1.jar Lab4_associativityKt`. Real, executed output:

```
left: 3, right: 7
```

### Connect the Pieces

Associativity closes the last real gap precedence alone left open — between the two of them, every operator in an expression now has a fully determined place in the evaluation order, which is exactly the vocabulary the rest of this slice needs to actually build something that computes one.

## Connect the Pieces

Follow one concrete value through everything this lesson actually proved. The raw expression this project's own real Scientific mode will eventually need to evaluate correctly looks something like `3 + 5 × 2`. **Tokens** proved, for real, that turning that raw input into `["3", "+", "5", "×", "2"]` is itself a real, buildable process — `tokenize("12+7")` really did produce `["12", "+", "7"]`, with each multi-character number surviving as one indivisible piece. **Grammar** proved that having a token list isn't the same as having a valid expression — `isValidSimpleExpression` really did accept `["12", "+", "7"]` and really did reject both `["+", "12", "+"]` and a four-token list, using nothing but a real, checkable rule. **Operator precedence** is where the stakes became concrete: this project's own real, unmodified `nextState`, driven through the real button sequence `3, +, 5, ×, 2, =`, really did produce `10` — not `13`, the mathematically correct answer, and not even `16`, the naive left-to-right answer — because `CalculatorState`'s single `pendingOperator` slot really did get silently overwritten the moment a second operator arrived, proven by tracing every one of those six real button presses one at a time. The isolated `precedence` map then proved, separately, that ranking `×` above `+` and comparing two `Int`s is all "precedence" actually is, mechanically. **Associativity** closed the one gap precedence alone can't answer — `(8 − 3) − 2` and `8 − (3 − 2)` really do compute to two different real numbers, `3` and `7`, from the exact same three values, proving that even settling *which* operator is stronger still leaves *which side of a tie wins* as its own, separate, real question. Together, these four real, executed proofs are what "correctly evaluate `3 + 5 × 2`" actually requires underneath — and none of them yet exist as permanent code in this project. That is deliberate: this lesson's own job was proving the gap and naming the tools, for real: nothing more. Building the real tokenizer, the real stack-based algorithm that applies precedence and associativity together, and the real evaluator that turns a token list into a number is this slice's own next work, starting from here.
