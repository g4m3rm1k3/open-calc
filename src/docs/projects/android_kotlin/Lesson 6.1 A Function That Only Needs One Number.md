# Lesson 6.1: A Function That Only Needs One Number

**What you will build:** No new feature ships from this lesson — this is a real, executed investigation, opening a new stage the same way this project's own earlier foundational lessons have: proving a concept works, generically, before it becomes real, permanent code. This project's own real `Operation` interface has represented every one of this project's operators since its very first Android lesson — but its own real shape requires exactly two operands. This slice's own real target features — `sin`, `cos`, `sqrt`, `log` — each take exactly one. This lesson proves, concretely, that this project's existing function-abstraction pattern doesn't already cover that shape, and that the same real dispatch-table idea this project has relied on since Stage 1 still works once a genuinely different kind of function object is what's being dispatched.

**What you need to know first:** This project's own real `Operation` interface, `Operator` enum, and `operatorSymbols` map — this project's own original, real dispatch table, unchanged since this project's very first working calculator. `fun interface` and SAM conversion, and this project's own already-recorded reasoning for choosing named classes over lambdas for its own real operations.

## Terms used in this lesson

- **Function object** — a real object whose entire purpose is to be called like a function, typically through one real, defining method. This word exists because some languages (this one included) let a real class stand in anywhere a callable behavior is needed — this project's own real `Addition`, `Subtraction`, and every other `Operation` implementation are already real, working function objects, even though nothing in this project has named them that explicitly until now.
- **Dispatch table** — a real, general pattern: a lookup structure, typically a `Map`, connecting a name or key to the real behavior it should trigger, so choosing which behavior to run becomes a lookup instead of a hard-coded chain of branches. This word exists to name the exact real pattern this project's own `operatorSymbols` has already been since this project's very first working calculator — a real, general term for something this project built once, concretely, before it had a name.

## Objects and methods used

**Everything else in the file, not this lesson's subject but still explained.** None of this lesson's own subject — function objects, dispatch tables — is itself a real external class or method; both are concepts, and live in Terms, above. Every entry below is supporting cast: this project's own real, existing constructs, grounding this unit's own real Problem, and the already-established Kotlin mechanisms this unit's own throwaway lab depends on.

- **`Operation` / `Operator` / `operatorSymbols`**
  - *What it is:* This project's own real, permanent, original domain logic — a function-object interface, an enum naming each real implementation, and a real dispatch table connecting keypad symbol to `Operator` — unchanged since this project's very first working Android calculator.
  - *Implementation:* `fun interface Operation { fun apply(current: Int, amount: Int): Int }`; `enum class Operator(val operation: Operation) { PLUS(Addition()), MINUS(Subtraction()), TIMES(Multiplication()), DIVIDE(Division()), MODULO(Modulo()) }`; `val operatorSymbols = mapOf("+" to Operator.PLUS, "−" to Operator.MINUS, "×" to Operator.TIMES, "÷" to Operator.DIVIDE)`.
  - *Its use:* This unit's own real Problem is grounded directly in `Operation`'s own real, declared signature — `fun apply(current: Int, amount: Int): Int` — asking whether a real scientific function like `sqrt`, needing only one real number, could actually implement it.
  - *Type:* A `fun interface`, an `enum class`, and a top-level `Map`.
  - *Responsibility:* `Operation` defines the one-method contract every one of this project's real binary arithmetic operations must satisfy; `Operator` names each real implementation; `operatorSymbols` connects a real keypad symbol to the `Operator` it means.
  - *Depends on:* `Operation` depends on nothing; `Operator` depends on one real `Operation` per constant; `operatorSymbols` depends on nothing at runtime.
  - *Connects to:* Read, not modified, by this lesson — referenced only to ground this unit's own real comparison.
  - *Shape:* This project's own real, permanent, original domain logic — this project's very first real dispatch table, now recognized, by name, as exactly that.
- **`fun interface` (SAM conversion)**
  - *What it is:* A real Kotlin interface with exactly one abstract method, eligible for lambda-based construction, already established from this project's own real `Operation`.
  - *Implementation:* `fun interface Name { fun method(...): ReturnType }` — the compiler allows a real instance to be built either from a named class implementing it, or directly from a lambda matching its own single method's signature.
  - *Its use:* This unit's own throwaway lab defines a new, real `fun interface`, `UnaryFunction`, for functions needing exactly one real operand, the identical real mechanism `Operation` already uses for two.
  - *Type:* A Kotlin interface modifier.
  - *Responsibility:* Marking an interface as SAM-convertible.
  - *Depends on:* An interface with exactly one abstract method.
  - *Connects to:* `UnaryFunction`'s own real declaration, below.
  - *Shape:* Already-established Kotlin syntax, reappearing here for a genuinely new, real interface.
- **`override fun` / `class ... : Interface`**
  - *What it is:* Already-established syntax for a real class implementing a real interface's own method, from this project's own earliest real work.
  - *Implementation:* `class Name : InterfaceName { override fun method(...): ReturnType { ... } }`.
  - *Its use:* This unit's own throwaway lab's two real function objects, `Square` and `Negate`, each implement `UnaryFunction` this exact way.
  - *Type:* Already-established class and inheritance syntax.
  - *Responsibility:* Providing a real, concrete implementation of an interface's own contract.
  - *Depends on:* The interface being implemented.
  - *Connects to:* `Square`/`Negate`'s own real declarations, below.
  - *Shape:* Already-established Kotlin syntax, reappearing here unchanged.
- **`mapOf(vararg pairs)`**
  - *What it is:* A standard-library factory function producing a real, read-only map, already established from this project's own real `operatorSymbols`.
  - *Implementation:* `fun <K, V> mapOf(vararg pairs: Pair<K, V>): Map<K, V>`, part of the Kotlin standard library.
  - *Its use:* Builds this unit's own throwaway real dispatch table, `functions`, connecting a real function name directly to a real `UnaryFunction` instance — the value type this time a real function object, not a plain `Int` the way this slice's own earlier precedence table was.
  - *Type:* A top-level generic function.
  - *Responsibility:* Holding a fixed set of key-to-value associations.
  - *Depends on:* The key-value pairs passed to it.
  - *Connects to:* Constructed once, at the top of the throwaway lab.
  - *Shape:* A standard-library data structure, reappearing here holding a genuinely new kind of value.
- **`Map.getValue(key)`**
  - *What it is:* A method retrieving the value stored under a given key, throwing a real exception if the key isn't present, already established from this project's own real AST and evaluation work.
  - *Implementation:* `fun <K, V> Map<K, V>.getValue(key: K): V`, part of the Kotlin standard library.
  - *Its use:* Looks a real function object up by its own real name in this unit's own `functions` map.
  - *Type:* An extension function on `Map<K, V>`.
  - *Responsibility:* Retrieving a value the caller already knows must be present.
  - *Depends on:* The `Map` instance and the key being looked up.
  - *Connects to:* Called twice in this unit's own throwaway `main`.
  - *Shape:* A standard-library method, reappearing here unchanged.

## Concept Unit: A New Shape of Function Object

### The Problem

This project's own real `Operation` interface has represented every one of this project's real operators since its very first Android lesson — but its own real, declared signature, `fun apply(current: Int, amount: Int): Int`, requires exactly two real operands. This slice's own real target features — `sin`, `cos`, `sqrt`, `log` — each take exactly one real number, not two. Does this project's existing real function-abstraction pattern already cover that shape, or does representing a genuinely different kind of operation need a genuinely different real interface?

> Look at this project's own real `Operation` interface's own signature, above — could a real implementation of it represent something like "square a number," which only ever needs one real input? Why, or why not, based on what the interface's own method actually requires? This project's own real `operatorSymbols` already proves that looking a real behavior up *by name*, instead of hard-coding a branch for each one, works well — would that same real pattern still work for a completely different *shape* of function, or does something about the map's own value type need to change too? If you needed a new, real interface specifically for one-argument operations, what would its own single required method's real signature actually need to look like, compared to `Operation`'s own two-argument one?

### Introduce the Concept in Isolation

The following throwaway file is not part of this project and never will be — a new, real function-object interface for one-argument operations, two real implementations, and a real dispatch table connecting names to them, the identical real shape `Operation`/`Operator`/`operatorSymbols` already proved for two-argument ones:

```kotlin
fun interface UnaryFunction {
    fun apply(value: Int): Int
}

class Square : UnaryFunction {
    override fun apply(value: Int): Int {
        return value * value
    }
}

class Negate : UnaryFunction {
    override fun apply(value: Int): Int {
        return -value
    }
}

val functions = mapOf(
    "square" to Square(),
    "negate" to Negate()
)

fun main() {
    val square = functions.getValue("square")
    println(square.apply(5))

    val negate = functions.getValue("negate")
    println(negate.apply(5))
}
```

Compiled and run for real, this produced:

```
25
-5
```

`functions.getValue("square")` returns the real `Square` instance stored under that name — a real **function object**: nothing about it looks like a function syntactically, but calling `.apply(5)` on it runs real code and returns a real answer, `25`, the same way calling any of this project's own real `Operation` implementations already does. `functions.getValue("negate")` returns the real `Negate` instance the identical way, producing `-5`. The `functions` map itself is a real **dispatch table** — exactly the same real pattern `operatorSymbols` already is, now proven to work for a genuinely different shape of function: one real operand in, instead of two.

### Discard the Throwaway Example

This `UnaryFunction` interface, both real implementations, and the `functions` map are deleted now and will not appear in this project again. This project's own real `Operation`/`Operator`/`operatorSymbols` are completely unmodified — this unit's own job was proving the pattern generalizes to a new shape of function, before any real scientific function — needing real floating-point precision and real domain-error handling, both this slice's own later work — gets built for real.

### Mechanical Walkthrough

Every distinct syntactic element in the code above, in order:

- `fun interface UnaryFunction { fun apply(value: Int): Int }` — a new `fun interface`, already established as a mechanism from this project's own real `Operation`, declaring exactly one real abstract method, `apply`, taking a single `Int` — the one real, structural difference from `Operation`'s own two-parameter signature.
- `class Square : UnaryFunction { override fun apply(value: Int): Int { return value * value } }` — a real class, already-established syntax, implementing `UnaryFunction`'s own one method by multiplying its single real input by itself.
- `class Negate : UnaryFunction { override fun apply(value: Int): Int { return -value } }` — the identical real shape, implementing negation instead.
- `val functions = mapOf("square" to Square(), "negate" to Negate())` — the real, standard-library `mapOf` function, documented above, building a real `Map<String, UnaryFunction>` — a real dispatch table whose values are real function objects, rather than the `Int`s or `Operator`s this slice's own earlier dispatch tables held.
- `fun main()`, `val square = functions.getValue("square")` — the real `Map.getValue` method, documented above, retrieving the real `Square` instance stored under that name.
- `println(square.apply(5))` — calling `apply` on the real function object just retrieved, already-established method-call syntax, producing the real result `25`.
- `val negate = functions.getValue("negate")`, `println(negate.apply(5))` — the identical real shape, retrieving and calling `Negate` instead, producing `-5`.

### CS Lens

A dispatch table connecting names to function objects is one of the most widely reused real patterns in software — anywhere a program needs to choose real behavior at runtime, based on data rather than a hard-coded branch.

```
Also recognized in: a real compiler's own opcode dispatch table, a real
GUI framework's own event-handler registry, a real web server's own
URL-to-handler routing table, any real plugin system selecting
behavior by name at runtime, a video game's own real command pattern
mapping player input to real actions
```

### SE Lens

The alternative not chosen here: a single function taking a name and an `Int`, branching internally with `if`/`when` — `if (name == "square") value * value else if (name == "negate") -value else ...` — instead of a real dispatch table of real function objects. The real tradeoff: this project already made, and already recorded, the identical real choice once before, for its own binary operators — a branching chain means every new operation touches the same shared function, growing it forever, while a real dispatch table means adding a new one touches nothing existing at all, just one new class and one new map entry. This project's own domain logic also already reasoned, specifically, that permanent, named classes — not anonymous lambdas — would remain worth the extra real code the moment more operations eventually arrived, needing real names other code could refer to directly. This slice is exactly that arrival: `Square` and `Negate` are real, named classes here for the identical real reason `Addition` and `Subtraction` already are.

### Commands Needed

`kotlinc lab1_unary_function_dispatch.kt -include-runtime -d lab1.jar` compiles this file into a real, standalone, executable `.jar`, exactly as established throughout this project's own prior work; `java -jar lab1.jar` runs it.

### Run It

Real command run: `kotlinc lab1_unary_function_dispatch.kt -include-runtime -d lab1.jar`, then `java -jar lab1.jar`. Real, executed output:

```
25
-5
```

### Connect the Pieces

This project's own real dispatch-table pattern, already proven once for two-operand operations, is now proven a second time for one-operand ones — the real, structural foundation this slice's own coming real scientific functions will be built on, once real floating-point precision and real domain-error handling are ready to join it.

## Connect the Pieces

Follow one real question through this lesson's own single real finding. This project's own real `Operation` interface has represented every one of this project's real operators since its very first Android lesson — but its own real signature genuinely cannot represent a function needing only one operand, confirmed by trying to imagine implementing it with just `value * value` and finding nowhere for a second parameter to even belong. A new, real, throwaway `UnaryFunction` interface, proven in isolation, closed that gap: `Square` and `Negate`, two real function objects, retrieved from a real dispatch table by name and called directly, produced the correct real answers, `25` and `-5`, using the exact same real pattern `operatorSymbols` already proved for two-operand operations. Both real, named classes, not lambdas — directly fulfilling this project's own earlier, already-recorded reasoning that permanent names would matter the moment more operations eventually arrived. Nothing about this project's own permanent code changed — `Operation`, `Operator`, and `operatorSymbols` remain exactly as they were. What exists now is real, structural proof that this project's own established function-abstraction pattern generalizes cleanly to the real shape Stage 6's own scientific functions will actually need, ready for whichever of those functions this slice builds first, for real.
