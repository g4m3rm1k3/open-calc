# Lesson 5.3: What Opened Last Closes First

**What you will build:** No new feature ships from this lesson either — like this slice's own first two lessons, this is a real, executed investigation, introducing this slice's next piece of vocabulary rather than changing production code. This slice's own opening lesson already proved, with real, executed evidence, that this project's current design can only hold one pending operator in mind at a time. This lesson answers the question that proof leaves open: if a real expression evaluator needs to hold onto *more* than one pending thing at once, in what *order* should it get them back? That question has a real, well-known answer — a **Stack** — and by the end of this lesson it's been proven twice: once with a small, familiar throwaway example, and once directly against this project's own real, upcoming need.

**What you need to know first:** `MutableList` and its real `add` method, established since this project's own throwaway tokenizer lab. Classes, properties, constructors, and methods, including `private` properties, established since this project's own early work on `Calculator`. This slice's own real, executed proof that `CalculatorState` cannot hold two pending operators at once, and this slice's own real target expression, `3 + 5 × (2 − 8)`, which this project's own later work will need to evaluate correctly.

## Terms used in this lesson

- **Stack** — a collection that only allows adding or removing an element from *one* specific end, called the top, and never anywhere else. This word exists because some real problems need less flexibility than a general list on purpose — a structure that physically cannot be touched anywhere but its own top end is a structure whose *order* of use can never be gotten wrong by accident, which a general list, allowing insertion or removal anywhere, doesn't guarantee.
- **LIFO (Last-In, First-Out)** — the ordering rule a Stack always follows: whichever element was added most recently is always the very next one removed. This word exists to name that specific ordering rule precisely, the same way "first come, first served" names a *different* rule for a different real structure (a queue).
- **Push** — the operation that adds a new element onto the top of a Stack. This word exists as the Stack-specific name for "add," used instead of a generic word specifically because it always means "add here, at the top, and nowhere else."
- **Pop** — the operation that removes and returns the element currently on top of a Stack. This word exists as the Stack-specific name for "remove," carrying the same one-end-only guarantee `push` does, and returning the removed element rather than discarding it, since the caller usually needs to know what was just taken off.
- **Peek** — the operation that returns the element currently on top of a Stack *without* removing it. This word exists because "what's on top right now" and "take the top thing off" are two genuinely different questions — a Stack that only offered `pop` would force a caller to remove an element just to look at it, with no way to put it back.

## Objects and methods used

**Everything else in the file, not this lesson's subject but still explained.** None of this lesson's own subject — Stack, LIFO, push, pop, peek — is itself a real external class or method; each one is taught here as new, hand-written code (a real class this lesson writes and explains directly, covered in each unit's own Mechanical Walkthrough, not listed again here). Every entry below is supporting cast: real standard-library methods that hand-written class depends on internally. Ordered by first appearance.

- **`mutableListOf<T>()` / `MutableList<T>`**
  - *What it is:* A standard-library factory function producing a new, empty, growable list, and the mutable list type it returns — already established from this slice's own opening lesson.
  - *Implementation:* `fun <T> mutableListOf(): MutableList<T>`, part of the Kotlin standard library.
  - *Its use:* This lesson's own hand-written `Stack` class needs real, growable storage underneath its own `push`/`pop`/`peek` methods — a `MutableList` is exactly that, doing the actual work of holding elements while `Stack` itself only exposes the three operations a real stack should have.
  - *Type:* A top-level generic function, returning the standard-library `MutableList<T>` interface.
  - *Responsibility:* Holding an ordered, growable sequence of elements, addressable at any position — deliberately more flexible than the `Stack` class built on top of it.
  - *Depends on:* Nothing to construct an empty one.
  - *Connects to:* Constructed once per `Stack` instance, as a `private` property; every one of `Stack`'s own real methods reads from or writes to this exact list, and nothing outside `Stack` ever touches it directly.
  - *Shape:* A standard-library data structure — the real, private implementation detail underneath a public interface deliberately narrower than what it's built from.
- **`MutableList.add(element)`**
  - *What it is:* An instance method on `MutableList` that appends one new element to the end of the list — already established from this slice's own opening lesson.
  - *Implementation:* `fun add(element: E): Boolean`, part of the Kotlin standard library.
  - *Its use:* `Stack`'s own `push` method calls this once, appending the new element to the *end* of the underlying list — which is deliberately treated as the stack's own "top," not its front.
  - *Type:* An instance method on `MutableList<E>`.
  - *Responsibility:* Growing the list by exactly one element, at the end.
  - *Depends on:* The list instance, and the element being added.
  - *Connects to:* Called once inside `push`; its return value (whether the add succeeded) is discarded, since a plain `MutableList` always succeeds.
  - *Shape:* A standard-library mutation method — the real mechanism `push` is built on.
- **`MutableList.removeAt(index)`**
  - *What it is:* An instance method on `MutableList` that removes and returns the element at a specific position.
  - *Implementation:* `fun removeAt(index: Int): T`, part of the Kotlin standard library — removes the element at `index`, shifts every later element one position earlier to close the gap, and returns the element that was removed.
  - *Its use:* `Stack`'s own `pop` method calls this with `items.size - 1` — the index of the *last* element — removing and returning whatever is currently sitting at the end of the underlying list, which `Stack` treats as its own top.
  - *Type:* An instance method on `MutableList<T>`.
  - *Responsibility:* Removing exactly one element, by position, and handing it back to the caller.
  - *Depends on:* The list instance, and a valid index within its current bounds.
  - *Connects to:* Called once inside `pop`, always with `items.size - 1` as its argument, never any other index — the one deliberate constraint that keeps `Stack`'s own use of it genuinely LIFO.
  - *Shape:* A standard-library mutation method — the real mechanism `pop` is built on, and the specific reason `pop` always removes the *most recently added* element: `items.size - 1` is always wherever `add` most recently placed something.
- **`List.size`**
  - *What it is:* A read-only property giving the number of elements a collection currently holds — already established from this project's own real code.
  - *Implementation:* `val size: Int`, part of the Kotlin standard library's `Collection` interface.
  - *Its use:* Both `pop` and `peek` need to know exactly where the "top" position is, which shifts every time an element is pushed or popped — `items.size - 1` computes it fresh, every single call.
  - *Type:* A read-only property, not a method.
  - *Responsibility:* Reporting how many elements the collection currently holds.
  - *Depends on:* The collection instance it's read from.
  - *Connects to:* Read inside both `pop` and `peek`, each time computing the current top position from scratch rather than tracking it separately.
  - *Shape:* A standard-library read-only property, reappearing here as the real basis for "where is the top" in a hand-written `Stack`.
- **`List` indexing (`get`, called through `[]`)**
  - *What it is:* The real method backing Kotlin's `[]` syntax on a `List` — already established from this project's own real code and this slice's own opening lesson.
  - *Implementation:* `operator fun <T> List<T>.get(index: Int): T`, part of the Kotlin standard library.
  - *Its use:* `Stack`'s own `peek` method reads `items[items.size - 1]` — looking at the element in the last position without removing it, the one real difference between `peek` and `pop`.
  - *Type:* An `operator fun`.
  - *Responsibility:* Returning the element at a given position, without altering the list.
  - *Depends on:* The list instance and a valid index.
  - *Connects to:* Called once inside `peek`, on the same `items.size - 1` position `pop` computes — the two methods look at exactly the same place; only `pop` actually removes what it finds there.
  - *Shape:* A standard-library operator overload — the real mechanism `peek` is built on.
- **`Collection.isEmpty()`**
  - *What it is:* A method answering whether a collection currently holds zero elements.
  - *Implementation:* `fun <T> Collection<T>.isEmpty(): Boolean`, part of the Kotlin standard library — equivalent to `size == 0`, worth contrasting directly with `String.isNotEmpty()`, already established from this slice's own opening lesson: that one answers the opposite question, about a `String`'s length, not a collection's element count.
  - *Its use:* This lesson's second unit needs to know, before calling `pop`, whether there's actually anything left to pop — calling `pop` on an already-empty `Stack` would try to remove an element at index `-1`, a real, invalid position.
  - *Type:* An extension function on `Collection<T>`.
  - *Responsibility:* Answering one question about a collection's current size, with no side effects.
  - *Depends on:* The collection it's called on.
  - *Connects to:* Called both inside `Stack`'s own `isEmpty` method (which just forwards to it) and, indirectly, by any caller of `Stack.isEmpty()` checking before a `pop`.
  - *Shape:* A standard-library predicate — the real safety check underneath this lesson's second unit's own real, guarded use of `pop`.
- **`listOf(vararg elements)`**
  - *What it is:* A standard-library factory function producing a new, read-only list — already established from this slice's own opening lesson.
  - *Implementation:* `fun <T> listOf(vararg elements: T): List<T>`, part of the Kotlin standard library.
  - *Its use:* This lesson's second unit needs a fixed set of test expressions to check — `listOf(...)` names all four, once, up front.
  - *Type:* A top-level generic function.
  - *Responsibility:* Holding a fixed, ordered, read-only sequence of elements.
  - *Depends on:* The elements passed to it.
  - *Connects to:* Constructed once near the top of the second unit's own lab; iterated by the `for` loop immediately below it.
  - *Shape:* A standard-library data structure, reused here for a fourth distinct purpose across this slice's own three lessons so far.

## Concept Unit: The Stack — LIFO, Push, Pop, Peek

### The Problem

This slice's own opening lesson already proved, with a real, executed probe against this project's own unmodified `nextState`, that `CalculatorState` can hold exactly one pending operator at a time — pressing a second operator before `"="` silently overwrites the first, because there is nowhere else in `CalculatorState`'s own three fields for a second one to go. Correctly respecting operator precedence, and correctly handling parentheses, both genuinely need to hold onto *more than one* pending thing at once. But holding onto several things at once immediately raises a new question: when it's time to use them, in what *order* should they come back out?

> Think about a real web browser's back button: if you visit `"home"`, then `"products"`, then `"product-detail"`, and click back once, which page do you land on? Click back again — which page now? Is that the same order you *visited* the pages in, or the reverse? What tool you already know — a `MutableList`, established since this project's own throwaway tokenizer lab — could hold an ordered sequence of visited pages, and what two operations would "visiting a new page" and "clicking back" need to correspond to?

### Introduce the Concept in Isolation

The following throwaway code is not part of this project and never will be — a small, hand-written class, and a browser-history simulation built on it:

```kotlin
class Stack {
    private val items = mutableListOf<String>()

    fun push(item: String) {
        items.add(item)
    }

    fun pop(): String {
        return items.removeAt(items.size - 1)
    }

    fun peek(): String {
        return items[items.size - 1]
    }
}

fun main() {
    val history = Stack()
    history.push("home")
    history.push("products")
    history.push("product-detail")
    println("current page: ${history.peek()}")
    println("going back...")
    history.pop()
    println("current page: ${history.peek()}")
    println("going back...")
    history.pop()
    println("current page: ${history.peek()}")
}
```

Compiled and run for real, this produced:

```
current page: product-detail
going back...
current page: products
going back...
current page: home
```

Three pages were pushed on, in order — `"home"`, then `"products"`, then `"product-detail"` — and `peek` correctly reports `"product-detail"` as current, the *last* one pushed. Popping once removes it and reveals `"products"` underneath; popping again removes that and reveals `"home"` — the exact reverse of the order the pages were visited in. This ordering rule — whatever was added most recently is always the first thing to come back out — is called **LIFO (Last-In, First-Out)**, and a collection built specifically to guarantee it, allowing changes only at one end, is called a **Stack**. `push` and `pop` are that Stack's own two core operations — adding and removing, always at the same end — and `peek` is a third: looking at what's currently on top without disturbing it at all.

### Discard the Throwaway Example

This `Stack` class and its browser-history demonstration are deleted now and will not appear in this project again. This project's own real `CalculatorState` is completely unmodified — this unit's own job was proving the LIFO mechanism itself works, and is genuinely useful, using a small, familiar example, before the next unit connects it to this project's own real, upcoming need.

### Mechanical Walkthrough

Every distinct syntactic element in the code above, in order:

- `class Stack` — a class declaration, already established from this project's own early work — a new type with its own real state and behavior.
- `private val items = mutableListOf<String>()` — a `private` property, already established, holding a real `MutableList<String>` (documented above); `private` means nothing outside `Stack`'s own body can read or write `items` directly — the entire reason `push`/`pop`/`peek`, not raw list access, are the only way anything outside this class can interact with the data at all.
- `fun push(item: String) { items.add(item) }` — a method, already established, taking one `String` parameter and calling the real `MutableList.add` method (documented above) to place it at the end of `items`.
- `fun pop(): String { return items.removeAt(items.size - 1) }` — a method returning `String`, calling the real `MutableList.removeAt` method (documented above) with `items.size - 1` — `List.size` (documented above) read fresh, minus `1` (already established) to convert a count into the last valid index — removing and returning whatever sits there.
- `fun peek(): String { return items[items.size - 1] }` — a method returning `String`, using the real `List` indexing operator (documented above) on that same `items.size - 1` position `pop` computes, but reading instead of removing.
- `fun main()`, `val history = Stack()` — already established: constructing a new `Stack` instance with no arguments, since `Stack`'s own implicit constructor (already established from this project's own early classes) takes none.
- `history.push("home")`, `history.push("products")`, `history.push("product-detail")` — three real calls to the method just declared, each appending one more string literal (already established) onto the end of `items`.
- `println("current page: ${history.peek()}")` — a string template, already established, embedding a real method call, `history.peek()`, directly inside the interpolated expression.
- `println("going back...")`, `history.pop()` — already established; `pop`'s own real return value is discarded here, since only its *side effect* (removing the top page) matters at this point in the demonstration.
- The remaining `println`/`pop` pairs repeat this same shape once more.

### CS Lens

LIFO is one of the two most fundamental orderings in all of computing — the other being FIFO, first-in-first-out, a real, different structure (a queue) this curriculum's own later lessons will build.

```
Also recognized in: undo/redo history in almost every real editor, a
program's own real call stack tracking which function to return to
next, the back button in every real web browser, a physical stack of
plates — the structure's own namesake, since you can only ever take
the top one off
```

### SE Lens

The alternative not chosen here: skip the `Stack` class entirely, and let calling code manipulate a plain `MutableList` directly — `list.add(item)` to push, `list.removeAt(list.size - 1)` to pop. The real tradeoff: a raw list is more flexible, since it also allows inserting or removing at any *other* position too — but that flexibility is exactly what makes it possible to accidentally break LIFO order by calling `list.add(0, item)` or `list.removeAt(0)` instead, with nothing stopping it. Wrapping the same underlying `MutableList` in a class exposing only `push`/`pop`/`peek` makes violating LIFO order a real compile error rather than a possible mistake — the exact same "narrow the interface to only what's actually correct to call" discipline this project's own `Operation` interface already demonstrated for arithmetic.

### Commands Needed

`kotlinc lab1_browser_history.kt -include-runtime -d lab1.jar` compiles this file into a real, standalone, executable `.jar`; `java -jar lab1.jar` runs it. **Real, worth-knowing finding**: this lesson's second unit also declares its own `class Stack`, in a separate file — compiling both files together in one pass, the way this slice's own prior two lessons batched every file at once, produced a real compile error (`redeclaration: class Stack`), since `kotlinc` treats every file passed to it in the same invocation as one shared compilation unit, with no automatic per-file separation. Per the Verification Rule's own stated exception — "only split a batch when two pieces would interfere with each other... colliding names" — this is exactly that case: each lab in this lesson is compiled in its own separate `kotlinc` invocation, producing its own separate `.jar`, rather than one shared batch.

### Run It

Real command run: `kotlinc lab1_browser_history.kt -include-runtime -d lab1.jar`, then `java -jar lab1.jar`. Real, executed output:

```
current page: product-detail
going back...
current page: products
going back...
current page: home
```

### Connect the Pieces

A Stack proved, with a familiar example, that LIFO order is real and buildable — the next unit asks whether that same order has anything to do with the real parentheses this project's own upcoming expression evaluator will actually have to handle.

## Concept Unit: Why Parsers Need Stacks

### The Problem

This slice's own real target expression is `3 + 5 × (2 − 8)` — real parentheses that a real tokenizer, later in this slice's own work, will need to handle correctly. Before any evaluation can even begin, something has to be able to tell whether an expression's parentheses are actually valid at all — every opening one eventually matched by a real closing one, and never a closing one with nothing open left to match.

> If an expression has one opening parenthesis, then a *second* opening parenthesis, then a single closing one, which of the two open parentheses does that close belong to — the first one seen, or the most recent one? If a closing parenthesis shows up while nothing is currently open at all, what does that say about the expression? After walking all the way through an expression, if something is still "open" that a close was never found for, is the expression valid?

### Introduce the Concept in Isolation

The following throwaway code is not part of this project and never will be — a second, separate hand-written `Stack`, this time holding `Char` instead of `String`, and a real function using it to check whether an expression's parentheses are correctly balanced:

```kotlin
class Stack {
    private val items = mutableListOf<Char>()

    fun push(item: Char) {
        items.add(item)
    }

    fun pop(): Char {
        return items.removeAt(items.size - 1)
    }

    fun isEmpty(): Boolean {
        return items.isEmpty()
    }
}

fun parenthesesAreBalanced(expression: String): Boolean {
    val openParens = Stack()
    for (char in expression) {
        if (char == '(') {
            openParens.push(char)
        } else if (char == ')') {
            if (openParens.isEmpty()) {
                return false
            }
            openParens.pop()
        }
    }
    return openParens.isEmpty()
}

fun main() {
    val expressions = listOf(
        "3 + 5 * (2 - 8)",
        "((1 + 2)",
        "1 + 2)",
        "(1 + (2 * 3)) - (4 / 2)"
    )
    for (expression in expressions) {
        println("\"$expression\" -> ${parenthesesAreBalanced(expression)}")
    }
}
```

Compiled and run for real, this produced:

```
"3 + 5 * (2 - 8)" -> true
"((1 + 2)" -> false
"1 + 2)" -> false
"(1 + (2 * 3)) - (4 / 2)" -> true
```

The first result is the real one that matters most: this project's own actual, real target expression, `3 + 5 × (2 − 8)`, checked correctly as balanced. The second, `"((1 + 2)"`, has two real opening parentheses but only one closing one — after the whole expression is walked, the Stack still has one `'('` sitting on it, so `openParens.isEmpty()` is `false` at the end, correctly reporting an unbalanced expression. The third, `"1 + 2)"`, hits a closing parenthesis while the Stack is already empty — nothing was ever open to match it — caught immediately by the `openParens.isEmpty()` check *before* `pop` would have tried to remove from nothing. The fourth, `"(1 + (2 * 3)) - (4 / 2)"`, has real nested and sequential parentheses, and balances correctly: LIFO order is exactly what makes the *inner* `(2 * 3)` close before the *outer* one it's nested inside, matching how the expression actually reads.

### Discard the Throwaway Example

This second `Stack` class and `parenthesesAreBalanced` function are deleted now and will not appear in this project again. This project doesn't have a real tokenizer yet to plug this check into — building one, for real, against this project's own actual expression input, is this slice's own later work; this unit's own job was proving, concretely, that a Stack's own LIFO order is the exact right tool for the job before that later work begins.

### Mechanical Walkthrough

Every distinct syntactic element in the code above, in order (`Stack`'s own declaration repeats the identical shape already fully enumerated in this lesson's first unit, adjusted from `String` to `Char` and adding one new method, `isEmpty`, so only what's new here gets a fresh enumeration):

- `class Stack`, `private val items = mutableListOf<Char>()`, `fun push(item: Char) { items.add(item) }`, `fun pop(): Char { return items.removeAt(items.size - 1) }` — the identical real mechanism as this lesson's first unit, holding `Char` instead of `String`.
- `fun isEmpty(): Boolean { return items.isEmpty() }` — a new method on this unit's own `Stack`, calling the real standard-library `Collection.isEmpty()` method (documented above) on the underlying list and returning its result directly.
- `fun parenthesesAreBalanced(expression: String): Boolean` — a function declaration, already established, taking a `String` and returning `Boolean`.
- `val openParens = Stack()` — constructing a fresh, empty `Stack`, already established.
- `for (char in expression)` — a `for` loop iterating a `String`'s own individual `Char`s, already established from this slice's own opening lesson.
- `if (char == '(')` — an equality check, already established, comparing `char` against a `Char` literal — single quotes, rather than the double quotes a `String` literal uses, marking it as exactly one character rather than a sequence of them.
- `openParens.push(char)` — calling the method just declared, adding the opening parenthesis onto the top of the stack.
- `else if (char == ')')` — an `else if`, already established, checking for a closing parenthesis instead.
- `if (openParens.isEmpty()) { return false }` — the guard this unit's own `isEmpty` method exists for: checking, before calling `pop`, whether there's anything currently open to match this closing parenthesis against; an early `return`, already established, reporting the expression invalid the instant an unmatched close is found.
- `openParens.pop()` — reached only when something genuinely was open; removing it, since this one real closing parenthesis has now matched it. Its own return value is discarded here — only the *removal* matters, not which specific character was on top (it can only ever be `'('`, since that's the only thing this function ever pushes).
- `return openParens.isEmpty()` (after the loop) — the function's own final answer: the expression is balanced only if, after every character has been walked, nothing is left open on the stack at all.
- `fun main()`, `val expressions = listOf(...)`, `for (expression in expressions)`, `println("\"$expression\" -> ${parenthesesAreBalanced(expression)}")` — already established; the string template embeds both a literal escaped quote (`\"`, already-established escape-character syntax) around the expression itself and a real function call inside its own interpolated expression.

### CS Lens

Matching nested, ordered structure — parentheses, brackets, tags, calls — is one of the single most common real reasons a Stack shows up in real software, precisely because LIFO order is what "properly nested" actually means, mechanically.

```
Also recognized in: every real compiler or code editor checking matched
braces, brackets, and parentheses, XML and HTML parsers checking that
every opening tag has a matching closing tag in the right place, a
real program's own function-call stack unwinding in the exact reverse
order the calls were made
```

### SE Lens

The alternative not chosen here: just count every opening parenthesis and every closing one, and check whether the two totals are equal. The real tradeoff: counting alone is cheaper to write, but it would wrongly accept a genuinely invalid expression like `")("` — one opening character, one closing character, equal counts, and yet the close appears *before* the open, which is never valid. A Stack doesn't just count how many parentheses exist; it tracks the actual *order* they appear in, catching exactly the kind of failure a bare count can't — the same real reason this project's own upcoming tokenizer will need a Stack specifically, not just a running total.

### Commands Needed

`kotlinc lab2_balanced_parens.kt -include-runtime -d lab2.jar`, compiled as its own separate pass for the real reason already explained in this lesson's first unit's own Commands Needed section (a colliding `class Stack` name), then run via `java -jar lab2.jar`.

### Run It

Real command run: `kotlinc lab2_balanced_parens.kt -include-runtime -d lab2.jar`, then `java -jar lab2.jar`. Real, executed output:

```
"3 + 5 * (2 - 8)" -> true
"((1 + 2)" -> false
"1 + 2)" -> false
"(1 + (2 * 3)) - (4 / 2)" -> true
```

### Connect the Pieces

A Stack's own real LIFO order — proven with a familiar browser-history example in this lesson's first unit — turned out to be exactly the mechanism a real, working parenthesis check needs, confirmed against this project's own real, upcoming target expression: the same ordering principle, applied to a genuinely different, genuinely relevant problem.

## Connect the Pieces

Follow the same real mechanism through both of this lesson's units. A hand-written `Stack`, holding nothing but a `private MutableList` and three narrow methods — `push`, `pop`, `peek` — proved LIFO order for real: three pages pushed in order, `"home"`, `"products"`, `"product-detail"`, came back out in the exact reverse order on two real, executed `pop` calls, matching a real browser's own back button exactly. The second unit put the identical mechanism — the same three-method shape, `Char` in place of `String`, one guard added — against a real, concrete problem this project actually has: whether an expression's parentheses are genuinely balanced. Run for real against four real inputs, it correctly balanced this project's own actual target expression, `3 + 5 × (2 − 8)`; correctly rejected two different, genuinely invalid inputs, one missing a close, one with a close and nothing open to match it; and correctly balanced a real, nested, sequential expression precisely because LIFO order made the *inner* parenthesis close before the *outer* one it sat inside — the exact real property a plain running count could never have caught. Nothing in this project's own permanent code changed — that was never this lesson's job. What exists now is a real, proven answer to the question this slice's own opening lesson left open: multiple pending things, held in the right order, are exactly what a Stack is for, ready the moment this slice's own coming work needs to hold more than `CalculatorState`'s own single slot ever could.
