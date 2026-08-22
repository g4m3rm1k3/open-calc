# Lesson 5.8: The Deepest Call Returns First

**What you will build:** No new feature ships from this lesson either — like this slice's own purely foundational lessons, this is a real, executed investigation. This slice's own Trees lesson walked this project's own real expression tree using an explicit stack the programmer had to build and manage by hand — and deliberately left one thing undone: "general, reusable tree-processing is this slice's own next lesson's job." This lesson is that job. It introduces **recursion** — a function that calls itself — proves, with a real, live look at the actual JVM call stack, that this isn't a trick but a real, inspectable mechanism, and then builds a real, general, recursive function that reads this project's own expression tree in post-order — reproducing, for a *third* independent time, the exact same real answer this slice's Shunting-Yard algorithm and this slice's own hand-read tree traversal already agreed on.

**What you need to know first:** This slice's own real expression tree, `Node`, and its own real, hand-read post-order result, `["3", "5", "2", "8", "−", "×", "+"]`, matching this project's own real `toPostfix` function's already-tested result exactly. Functions, classes, nullable types, and `for` loops, all already established.

## Terms used in this lesson

- **Recursion** — a function calling itself, directly or indirectly, as part of computing its own result. This word exists because some real problems are naturally defined in terms of smaller versions of themselves — a directory containing subdirectories, each of which can contain more subdirectories — and a function that calls itself is the direct, natural way to express "solve this by solving a smaller version of the exact same problem."
- **Base case** — the specific condition under which a recursive function stops calling itself and returns a real answer directly, with no further recursive call. This word exists because a recursive function with no base case at all would call itself forever — the base case is what makes recursion a real, terminating computation rather than an infinite one.
- **Recursive case** — the condition under which a recursive function *does* call itself, computing part of its own answer from the result of that smaller, recursive call. This word exists to name the other half of every recursive function — every real recursive function needs both a base case and at least one recursive case, or it either never recurses at all or never stops.
- **Call stack** — the real, actual record the running program keeps of every function call currently in progress, in the exact order those calls happened, so each one can correctly resume exactly where it left off once whatever it called returns. This word exists because "stack" here isn't a metaphor — it's a real, literal LIFO stack, the same structure and the same ordering guarantee this slice's own Stack lesson already proved, just one this project didn't build itself; every real running program already has one, automatically, the moment any function calls any other.

## Objects and methods used

**Everything else in the file, not this lesson's subject but still explained.** None of this lesson's own subject — recursion, base case, recursive case, call stack — is itself a real external class or method; each one is taught here as new, throwaway code, covered in each unit's own Mechanical Walkthrough. Every entry below is supporting cast: real standard-library and JVM methods that throwaway code depends on.

- **`emptyList<T>()`**
  - *What it is:* A standard-library function returning a real, shared, immutable empty list.
  - *Implementation:* `fun <T> emptyList(): List<T>`, part of the Kotlin standard library.
  - *Its use:* This lesson's own `Directory` class uses it as the default value for a directory with no subdirectories, so a leaf directory can be constructed with just a name and nothing else.
  - *Type:* A top-level generic function.
  - *Responsibility:* Providing a real, valid, always-empty `List` without the caller needing to construct one each time.
  - *Depends on:* Nothing.
  - *Connects to:* Used as `Directory`'s own constructor default; every leaf `Directory` in this lesson's own tree shares this exact real instance.
  - *Shape:* A standard-library utility, this lesson's own first use of it.
- **`List.isEmpty()`**
  - *What it is:* A method answering whether a collection holds zero elements, already established from this slice's own Stack and Queue lessons.
  - *Implementation:* `fun <T> Collection<T>.isEmpty(): Boolean`, part of the Kotlin standard library.
  - *Its use:* `countDirectories`'s own base-case check: a directory with an empty `subdirectories` list has nothing left to recurse into.
  - *Type:* An extension function on `Collection<T>`.
  - *Responsibility:* Answering one question about a collection's current size.
  - *Depends on:* The collection it's called on.
  - *Connects to:* Read once, as the very first check inside `countDirectories`.
  - *Shape:* A standard-library predicate, reappearing here unchanged.
- **`MutableList.add(element)` / `MutableList.addAll(elements)`**
  - *What it is:* Instance methods appending either one element or every element of another collection onto a `MutableList`. `add` is already established from this slice's own opening lesson; `addAll` is new.
  - *Implementation:* `fun add(element: E): Boolean`; `fun addAll(elements: Collection<E>): Boolean` — both part of the Kotlin standard library, `addAll` appending every element of its own argument, in order, onto the end of the receiver.
  - *Its use:* This lesson's second unit's own `postOrder` function calls `addAll` to append an entire recursive sub-result — itself a real `List<String>` — onto the running result in one call, rather than looping over it manually.
  - *Type:* Instance methods on `MutableList<E>`.
  - *Responsibility:* Growing the list by one element, or by every element of another collection, preserving that collection's own order.
  - *Depends on:* The list instance, and either one element or one collection of elements.
  - *Connects to:* `addAll` is called twice inside `postOrder`, once for each real recursive call's own returned list.
  - *Shape:* Standard-library mutation methods, `addAll` genuinely new here, extending already-established `add`.
- **`Thread.currentThread()` / `Thread.stackTrace`**
  - *What it is:* `Thread.currentThread()` is a real, static JVM method returning the actual `Thread` object executing the current code; `.stackTrace` is a real property on that `Thread`, returning a real, live snapshot of every function call currently in progress on it, from the most recent back to the very start.
  - *Implementation:* `public static Thread currentThread()`, a real `native` static method on `java.lang.Thread`; `stackTrace: Array<StackTraceElement>`, a real Kotlin-visible property backed by `Thread.getStackTrace()`, each element naming one real, currently-active method call.
  - *Its use:* This lesson's own `printWithDepth` function reads `Thread.currentThread().stackTrace.size` once per call, turning the abstract idea of "how deep is the current recursion" into a real, live, measured number, read directly from the actual running JVM rather than tracked by hand.
  - *Type:* A `static` method and a real instance property, both on `java.lang.Thread`.
  - *Responsibility:* Reporting, truthfully and immediately, exactly which real function calls are currently in progress on the calling thread, in their real, actual order.
  - *Depends on:* Nothing beyond the thread it's read from.
  - *Connects to:* Read once per real call to `printWithDepth`, including every recursive one; its own `Array.size` (below) is what actually gets printed.
  - *Shape:* A real, live JVM introspection mechanism — proof, read directly from the running program itself, that the call stack this unit's own Terms describe is a real, physical thing, not just a name for an abstract idea.
- **`Array.size`**
  - *What it is:* A read-only property giving the number of elements a real Kotlin/Java array holds.
  - *Implementation:* `val size: Int`, a real property on `Array<T>` — a genuinely different real type from `List<T>`, though sharing this same property name.
  - *Its use:* Reads how many real stack frames `stackTrace` currently holds — the actual, measured depth of the call stack at that exact moment.
  - *Type:* A read-only property on `Array<T>`.
  - *Responsibility:* Reporting an array's own element count.
  - *Depends on:* The array it's read from.
  - *Connects to:* Read directly off `Thread.currentThread().stackTrace`'s own real return value.
  - *Shape:* A real, standard property — this lesson's own first use of a real `Array`, distinct from every `List`/`MutableList` this project has used so far.
- **`&&` and nullable equality (`== null`, `!= null`)**
  - *What it is:* Logical AND and null comparison, both already established throughout this project's own real `nextState` and this slice's own Trees lesson.
  - *Implementation:* `&&` short-circuits; equality comparison against the literal `null`.
  - *Its use:* This lesson's second unit's own `postOrder` function checks `node.left == null && node.right == null` to recognize a leaf — a real, permanent-shaped check already proven, in spirit, by this slice's own Trees lesson.
  - *Type:* Operator functions and an equality comparison.
  - *Responsibility:* Combining conditions; distinguishing a real, present child from an absent one.
  - *Depends on:* The `Boolean`/nullable values involved.
  - *Connects to:* Guards `postOrder`'s own base case, and, separately, each of its two real recursive calls.
  - *Shape:* Already-established Kotlin syntax, reappearing here unchanged.

## Concept Unit: Recursion — Base Case, Recursive Case, Call Stack

### The Problem

This slice's own Trees lesson walked this project's own real expression tree using an explicit stack — a real `MutableList`, with real `push`/`pop` calls the programmer had to write and get right. A real file system's own directory structure has the exact same shape a tree does — a directory can contain other directories, each of which can contain still more — but nothing about that structure has a fixed, known depth ahead of time. Is there a way to process a structure like that without writing an explicit stack by hand every single time?

> If a directory can contain other directories, which can themselves contain more directories, at any depth, could visiting every one of them be written with some fixed number of nested `for` loops — one loop per level? Why or why not? If a function's own real job is "handle this one directory, then handle each of its subdirectories the exact same way," what would it actually mean, concretely, for that function to just call itself once per subdirectory? If a function keeps calling itself, what has to be true *somewhere* inside it for that to actually stop, rather than running forever?

### Introduce the Concept in Isolation

The following throwaway file is not part of this project and never will be — a small directory structure, a recursive function counting every directory in it, and a second recursive function proving, with a real, live measurement, that a real call stack actually grows and shrinks exactly the way this unit's own Terms describe:

```kotlin
class Directory(val name: String, val subdirectories: List<Directory> = emptyList())

fun countDirectories(directory: Directory): Int {
    if (directory.subdirectories.isEmpty()) {
        return 1
    }
    var total = 1
    for (subdirectory in directory.subdirectories) {
        total += countDirectories(subdirectory)
    }
    return total
}

fun printWithDepth(directory: Directory) {
    val depth = Thread.currentThread().stackTrace.size
    println("$depth: entering ${directory.name}")
    for (subdirectory in directory.subdirectories) {
        printWithDepth(subdirectory)
    }
    println("$depth: leaving ${directory.name}")
}

fun main() {
    val photos = Directory("photos")
    val documents = Directory("documents")
    val root = Directory("root", listOf(photos, documents))
    println(countDirectories(root))

    val level3 = Directory("level3")
    val level2 = Directory("level2", listOf(level3))
    val level1 = Directory("level1", listOf(level2))
    printWithDepth(level1)
}
```

Compiled and run for real, this produced:

```
3
4: entering level1
5: entering level2
6: entering level3
6: leaving level3
5: leaving level2
4: leaving level1
```

Tracing `countDirectories(root)` — `root` has two subdirectories, `photos` and `documents`, neither of which has any subdirectories of its own:

1. `countDirectories(root)` runs — `root.subdirectories` is `[photos, documents]`, not empty, so the **recursive case** applies: `total` starts at `1` (counting `root` itself).
2. The `for` loop's first iteration calls `countDirectories(photos)` — `photos.subdirectories` is empty, so the **base case** applies immediately: it returns `1` with no further recursion. Back in `root`'s own call, `total` becomes `1 + 1 = 2`.
3. The loop's second iteration calls `countDirectories(documents)` — the identical base case applies, returning `1`. `total` becomes `2 + 1 = 3`.
4. The loop ends; `root`'s own call returns `3` — matching the real, executed output exactly.

Tracing `printWithDepth(level1)` — a real chain three directories deep — shows something the values-only trace above can't: not just *what* happened, but *when*, relative to the real recursive calls:

1. `printWithDepth(level1)` runs first — real, measured depth `4`, printed as `"4: entering level1"`.
2. Its own `for` loop calls `printWithDepth(level2)` — one real call frame deeper, so the real, measured depth is now `5`: `"5: entering level2"`.
3. That call's own loop calls `printWithDepth(level3)` — deeper still, depth `6`: `"6: entering level3"`.
4. `level3` has no subdirectories, so its own `for` loop runs zero times — nothing left to call — and `level3`'s own call finishes, printing `"6: leaving level3"` at the exact same real depth it entered at.
5. Control returns to `level2`'s own call, exactly where it left off, after its own recursive call to `level3` — its `for` loop has nothing left to iterate, so it finishes too, printing `"5: leaving level2"`.
6. Control returns to `level1`'s own call the same way, finishing with `"4: leaving level1"`.

The real, measured depth climbs by exactly `1` on every real recursive call — `4`, `5`, `6` — and then unwinds back down in the *exact reverse order* the calls happened — `6`, `5`, `4` — the deepest call, `level3`, is the first one to actually finish and return. This is the **call stack**, made real and visible: not an abstract idea, but a literal, live, measured structure the JVM already keeps, growing by one real frame per call and shrinking by one real frame per return, in genuine LIFO order — the identical real guarantee this slice's own Stack lesson already proved, just automatic here instead of built by hand.

### Discard the Throwaway Example

This `Directory` class and both of its recursive functions are deleted now and will not appear in this project again. This project's own real code is completely unmodified — this unit's own job was proving recursion itself works, and that the call stack it depends on is a real, inspectable mechanism, before the next unit applies it to this project's own real expression tree.

### Mechanical Walkthrough

Every distinct syntactic element in the code above, in order:

- `class Directory(val name: String, val subdirectories: List<Directory> = emptyList())` — a class declaration, already established, with a `String` and a `List<Directory>` defaulting to the real, standard-library `emptyList()` documented above; `Directory` referencing `Directory` inside its own declaration makes this a real recursive data structure, the identical shape this slice's own `Node` already proved.
- `fun countDirectories(directory: Directory): Int` — a function declaration, already established.
- `if (directory.subdirectories.isEmpty())` — the real, standard-library `isEmpty()` method documented above, checking the **base case**: no subdirectories left to recurse into.
- `return 1` — the base case's own real answer: a directory with nothing inside it still counts as one directory, itself.
- `var total = 1` — a `var`, already established, starting the count at `1` to include the current directory before adding anything from its own subdirectories.
- `for (subdirectory in directory.subdirectories)` — a `for` loop, already established, iterating every direct subdirectory.
- `total += countDirectories(subdirectory)` — the **recursive case**: `countDirectories` calling itself, on a genuinely smaller input (one level down), and adding that smaller call's own real result onto the running total; the compound-assignment operator, already established.
- `return total` — already established.
- `fun printWithDepth(directory: Directory)` — a function declaration, already established, with no return value.
- `val depth = Thread.currentThread().stackTrace.size` — the real JVM method, property, and `Array.size` property all documented above, measuring the actual, current call-stack depth at this exact moment.
- `println("$depth: entering ${directory.name}")` — a string template, already established, printed *before* any recursive call — proof this line runs on the way *in*.
- `for (subdirectory in directory.subdirectories) { printWithDepth(subdirectory) }` — the same real recursive-case shape as `countDirectories`, calling `printWithDepth` itself once per subdirectory; for a directory with no subdirectories, this loop simply runs zero times, which is this function's own real base case — no separate `if` needed, since an empty loop already does nothing.
- `println("$depth: leaving ${directory.name}")` — the same string template shape, printed *after* every recursive call this directory's own loop made has fully finished — proof this line runs on the way back *out*.

### CS Lens

Recursion is one of the single most transferable ideas in all of computing — any problem naturally defined in terms of smaller versions of itself tends to have a natural recursive solution.

```
Also recognized in: a real file system's own directory walker (this
unit's own real-world basis), a real compiler's own recursive-descent
parser, the classic Fibonacci sequence and factorial examples nearly
every language tutorial uses, a fractal's own self-similar structure,
a Russian nesting doll
```

### SE Lens

The alternative not chosen here: keep using this slice's own already-proven, explicit, iterative stack — the real approach this project's own Trees lesson already used successfully — instead of recursion. The real tradeoff: the iterative version needs its own explicit stack and explicit push/pop calls the programmer has to write and get right; the recursive version needs none of that — the real call stack, just measured directly above, does the identical real bookkeeping automatically, for free, every time a function calls another. The real cost: the call stack has a real, finite size, unlike a heap-allocated `MutableList`; a recursion genuinely deep enough — far deeper than anything this project's own small expression trees will ever need — can exhaust it, producing a real `StackOverflowError`, a failure mode the explicit, heap-based stack from this slice's own Trees lesson doesn't share.

### Commands Needed

`kotlinc lab1_recursion_directory.kt -include-runtime -d lab1.jar`, then `java -jar lab1.jar`, the same real commands already established throughout this slice.

### Run It

Real command run: `kotlinc lab1_recursion_directory.kt -include-runtime -d lab1.jar`, then `java -jar lab1.jar`. Real, executed output:

```
3
4: entering level1
5: entering level2
6: entering level3
6: leaving level3
5: leaving level2
4: leaving level1
```

### Connect the Pieces

Recursion, and the real call stack underneath it, are now proven to actually work — the next unit applies both directly to the one real tree this slice has been building toward all along.

## Concept Unit: A General Way to Read This Project's Own Tree

### The Problem

This slice's own Trees lesson built this project's own real expression tree and read it in post-order — but only by hand, for one specific, known tree, since general, reusable tree-processing was explicitly left for this lesson. Recursion, just proven, is exactly that general mechanism. Does a real, general, recursive post-order function, applied to this project's own real tree, actually reproduce the same real answer this slice has now independently reached twice — once via Shunting-Yard, once by hand?

> A leaf node, like the number `"3"`, has no children at all — what should its own post-order sequence be: just itself, or something more? A node *with* two children visits its left subtree, then its right subtree, then itself, last — if a recursive call on the left child is already trusted to correctly compute *that* subtree's own entire post-order sequence, what real work is actually left to finish the whole node's own sequence? Does this feel like a genuinely different algorithm than this slice's own hand-read post-order, or the identical idea, just letting the function repeat itself instead of a person repeating the same steps by hand?

### Introduce the Concept in Isolation

The following throwaway file is not part of this project and never will be — the identical real tree this slice's own Trees lesson already built, this time read by a real, general, recursive function instead of by hand:

```kotlin
class Node(val value: String, val left: Node? = null, val right: Node? = null)

fun postOrder(node: Node): List<String> {
    if (node.left == null && node.right == null) {
        return listOf(node.value)
    }
    val result = mutableListOf<String>()
    if (node.left != null) {
        result.addAll(postOrder(node.left))
    }
    if (node.right != null) {
        result.addAll(postOrder(node.right))
    }
    result.add(node.value)
    return result
}

fun main() {
    val two = Node("2")
    val eight = Node("8")
    val minus = Node("−", two, eight)
    val five = Node("5")
    val times = Node("×", five, minus)
    val three = Node("3")
    val plus = Node("+", three, times)

    println(postOrder(plus))
}
```

Compiled and run for real, this produced:

```
[3, 5, 2, 8, −, ×, +]
```

This is not merely similar to, but exactly, character for character, both this project's own real `toPostfix` function's already-tested result for the same expression, and this slice's own Trees lesson's own hand-read post-order sequence for the identical tree. Three genuinely different real methods — a stack-based token reordering, a tree read by hand in a fixed order, and now a real, general, recursive function that would work on *any* binary expression tree, not just this one — all converge on the identical real answer.

### Discard the Throwaway Example

This `Node` class and `postOrder` function are deleted now and will not appear in this project again. This project doesn't have a real, permanent `Node` yet — building one, for real, is explicitly this slice's own very next lesson's job (a real Abstract Syntax Tree). This unit's own job was proving that a real, general, recursive traversal actually produces the correct, already-twice-confirmed answer, before that real structure gets built.

### Mechanical Walkthrough

Every distinct syntactic element in the code above, in order (`Node`'s own declaration is the identical real shape already fully enumerated in this slice's own Trees lesson, so this walkthrough focuses on `postOrder` itself):

- `fun postOrder(node: Node): List<String>` — a function declaration, already established, taking one `Node` and returning the real, ordered list of values in post-order.
- `if (node.left == null && node.right == null)` — the real null comparisons and `&&` documented above, checking the **base case**: a node with no children at all is a leaf.
- `return listOf(node.value)` — the base case's own real answer, already established: a leaf's own post-order sequence is just itself, wrapped in a single-element list.
- `val result = mutableListOf<String>()` — a real, empty `MutableList<String>`, already established, accumulating this node's own full post-order sequence.
- `if (node.left != null) { result.addAll(postOrder(node.left)) }` — the **recursive case**, part one: if a left child exists, `postOrder` calls itself on it, and the real standard-library `addAll` method documented above appends that smaller call's own entire real result — trusted, without re-deriving it, to already be correct.
- `if (node.right != null) { result.addAll(postOrder(node.right)) }` — the identical recursive case, part two, for the right child.
- `result.add(node.value)` — the real `MutableList.add` method, already established, appending this node's own value last — only after both of its own operands' sequences are already in place, the exact real property that makes post-order the correct order for evaluation: an operator only ever gets placed after both of its operands.
- `return result` — already established.
- `fun main()`, the seven `val` declarations building `plus`'s own tree, `println(postOrder(plus))` — already established, identical in shape to this slice's own Trees lesson.

### CS Lens

Recursive functions operating directly on recursively-defined data — a function whose own shape mirrors the data's own shape — is one of the most natural, common pairings in real software.

```
Also recognized in: every real compiler's own AST-walking code (the
exact real work this project's own coming lesson will need), JSON and
XML parsers recursively descending into nested objects and elements,
a file system's own recursive size calculator, any real algorithm
operating on a tree or other recursively-defined structure
```

### SE Lens

The alternative not chosen here: treat this slice's own already-working `toPostfix` function as sufficient, and skip building a second, tree-based way to reach the same real answer. The real tradeoff: `toPostfix` already solves this project's real, current need — nothing about it is broken, and this lesson's own `postOrder` doesn't replace it. But `toPostfix` only ever produces a flat postfix list; the real value a recursive, tree-based approach adds is direct access to the expression's own structure — which operator owns which operands, how deeply something is nested — at every single step, which this project's own very next real lesson will need directly. This lesson's own real, executed, three-way agreement is what makes trusting that upcoming work reasonable, rather than merely convenient.

### Commands Needed

`kotlinc lab2_recursive_postorder.kt -include-runtime -d lab2.jar`, then `java -jar lab2.jar`; both this unit's file and this lesson's first unit's file were compiled together in one real, batched `kotlinc` pass, since `Directory` and `Node` share no colliding names, per the Verification Rule's own batching guidance.

### Run It

Real command run: `java -cp lesson5_8.jar Lab2_recursive_postorderKt`. Real, executed output:

```
[3, 5, 2, 8, −, ×, +]
```

### Connect the Pieces

A real, general, recursive function, applied to this project's own real expression tree, independently reproduced the exact same answer this slice has now proven three separate ways — real, mutual confirmation that Shunting-Yard, hand-read tree traversal, and general recursion all describe the identical underlying truth about this expression.

## Connect the Pieces

Follow this project's own real target expression through the one new idea this lesson introduces. A real directory structure first proved recursion works at all: `countDirectories` correctly counted three real directories using nothing but a base case (an empty directory returns `1`) and a recursive case (add up every subdirectory's own count) — and a second real function, `printWithDepth`, measured the actual JVM call stack directly, showing it grow by exactly one real frame per recursive call, `4`, `5`, `6`, and unwind in the exact reverse order, `6`, `5`, `4` — the deepest call always the first to return, real LIFO order, automatic. The second unit then pointed the identical real mechanism at this project's own real expression tree: a general, recursive `postOrder` function, trusting each recursive call to already have correctly solved its own smaller piece, produced `[3, 5, 2, 8, −, ×, +]` — not approximately, but exactly the same real sequence this project's own `toPostfix` function computed via Shunting-Yard, and exactly the same sequence this slice's own Trees lesson read off this identical tree by hand. Three independent real methods, one identical real answer. Nothing about this project's own permanent code changed — no `Node`, no `Directory`, and no recursive function exist in the real project yet. What exists now is real, executed proof that a general, recursive approach to this project's own expression tree is trustworthy, ready for this slice's own very next lesson to finally make that tree — and a real way to read it — permanent.
