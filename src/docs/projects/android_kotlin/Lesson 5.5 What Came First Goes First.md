# Lesson 5.5: What Came First Goes First

**What you will build:** No new feature ships from this lesson either — like this slice's own Stack lesson, this is a real, executed investigation, introducing this slice's next piece of vocabulary rather than changing production code. This slice's own coming work needs to hold onto multiple pending operators at once, in an order where the most recently seen one resolves first — a Stack, already proven. But that same coming work also needs to hold onto a *sequence of results*, in the exact opposite order: whatever was produced first needs to come back out first, too. This lesson proves, with a familiar throwaway example and then directly against this project's own real numbers, that a Stack's own real LIFO guarantee is the *wrong* one for that second job — and names the real structure that isn't.

**What you need to know first:** Stack, LIFO, push, pop, and peek, already established from this slice's own prior lesson — including the real, hand-written `class Stack` that lesson built and proved. This project's own real, permanent `tokenize` function and its own real, executed proof that `"3+5×(2−8)"` splits into `[3, +, 5, ×, (, 2, −, 8, )]`. `MutableList`, already established throughout this slice.

## Terms used in this lesson

- **Queue** — a collection that only allows adding an element at one end and removing one from the *other* end, never the same end for both. This word exists for the same reason `Stack` does — restricting *where* a collection can be touched is what makes its own ordering guarantee impossible to violate by accident — but a Queue restricts it differently than a Stack does, producing the opposite guarantee.
- **FIFO (First-In, First-Out)** — the ordering rule a Queue always follows: whichever element was added *least* recently — the first one still waiting — is always the next one removed. This word exists to name that rule precisely, the exact opposite of the LIFO rule a Stack already guarantees.
- **Enqueue** — the operation that adds a new element to a Queue, always at the end reserved for adding. This word exists as the Queue-specific name for "add," mirroring `push`'s own role for a Stack, but naming a different collection's own version of that same idea.
- **Dequeue** — the operation that removes and returns the element currently at the front of a Queue — whichever element has been waiting longest. This word exists as the Queue-specific name for "remove," mirroring `pop`'s own role for a Stack.
- **Processing sequences** — the general idea of handling an ordered series of pending work items one at a time, over time, rather than computing a single value all at once. This word exists because a Queue's own real value only shows up once there's an actual *sequence* of things waiting to be handled — a single pending item doesn't need an ordering guarantee at all, since there's nothing yet to order it against.

## Objects and methods used

**Everything else in the file, not this lesson's subject but still explained.** None of this lesson's own subject — Queue, FIFO, enqueue, dequeue — is itself a real external class or method; each one is taught here as new, hand-written code, covered in each unit's own Mechanical Walkthrough. Every entry below is supporting cast: real standard-library methods that hand-written code depends on internally, each already established earlier in this slice.

- **`mutableListOf<T>()` / `MutableList<T>`**
  - *What it is:* A standard-library factory function producing a new, empty, growable list, and the mutable list type it returns, already established from this slice's own opening lesson.
  - *Implementation:* `fun <T> mutableListOf(): MutableList<T>`, part of the Kotlin standard library.
  - *Its use:* This lesson's own hand-written `Queue` class needs real, growable storage underneath its own `enqueue`/`dequeue` methods, exactly the same real role it already played inside this slice's own `Stack` class.
  - *Type:* A top-level generic function, returning the standard-library `MutableList<T>` interface.
  - *Responsibility:* Holding an ordered, growable sequence of elements, addressable at any position.
  - *Depends on:* Nothing to construct an empty one.
  - *Connects to:* Constructed once per `Queue` instance, as a `private` property; every one of `Queue`'s own real methods reads from or writes to this exact list.
  - *Shape:* A standard-library data structure — the real, private implementation detail underneath a public interface narrower than what it's built from, the same real design this slice's own `Stack` already used.
- **`MutableList.add(element)`**
  - *What it is:* An instance method on `MutableList` that appends one new element to the end of the list, already established from this slice's own opening lesson.
  - *Implementation:* `fun add(element: E): Boolean`, part of the Kotlin standard library.
  - *Its use:* `Queue`'s own `enqueue` method calls this once, appending the new element to the end of the underlying list — the "back" of the queue.
  - *Type:* An instance method on `MutableList<E>`.
  - *Responsibility:* Growing the list by exactly one element, at the end.
  - *Depends on:* The list instance and the element being added.
  - *Connects to:* Called once inside `enqueue`.
  - *Shape:* A standard-library mutation method — the real mechanism `enqueue` is built on, identical to how `Stack`'s own `push` already used it.
- **`MutableList.removeAt(index)`**
  - *What it is:* An instance method on `MutableList` that removes and returns the element at a specific position, already established from this slice's own Stack lesson.
  - *Implementation:* `fun removeAt(index: Int): T`, part of the Kotlin standard library — removes the element at `index`, shifts every later element one position earlier, and returns what was removed.
  - *Its use:* `Queue`'s own `dequeue` method calls this with `0` — the *front* of the underlying list — the exact opposite index `Stack`'s own `pop` used (`items.size - 1`, the *back*), and the one real difference that gives `Queue` its opposite ordering guarantee.
  - *Type:* An instance method on `MutableList<T>`.
  - *Responsibility:* Removing exactly one element, by position, and handing it back to the caller.
  - *Depends on:* The list instance and a valid index within its current bounds.
  - *Connects to:* Called once inside `dequeue`, always with `0`, never any other index.
  - *Shape:* A standard-library mutation method — the same real method `Stack`'s own `pop` already used, called here against a different position, which is the entire real reason `Queue` and `Stack` behave oppositely despite sharing this identical underlying method.
- **`Collection.isEmpty()`**
  - *What it is:* A method answering whether a collection currently holds zero elements, already established from this slice's own Stack lesson.
  - *Implementation:* `fun <T> Collection<T>.isEmpty(): Boolean`, part of the Kotlin standard library.
  - *Its use:* This lesson's second unit needs to know when a `Queue` (or a `Stack`) has been fully drained, to stop a `while` loop from trying to remove from an empty one.
  - *Type:* An extension function on `Collection<T>`.
  - *Responsibility:* Answering one question about a collection's current size, with no side effects.
  - *Depends on:* The collection it's called on.
  - *Connects to:* Called as the condition of a `while` loop in this lesson's second unit, for both a `Queue` and a `Stack`.
  - *Shape:* A standard-library predicate, reappearing here unchanged.
- **`while` loop**
  - *What it is:* A control structure repeating its body for as long as a condition stays `true`, checked fresh before every repetition, already established from this slice's own Big-O lesson.
  - *Implementation:* `while (condition) { body }`.
  - *Its use:* This lesson's second unit needs to drain a `Queue` and a `Stack` completely, one element at a time, without knowing in advance how many elements either one holds — the same real shape a binary search's own halving loop already needed.
  - *Type:* A control-flow keyword.
  - *Responsibility:* Deciding, fresh, before every repetition, whether to run the body again.
  - *Depends on:* A `Boolean` condition, re-evaluated every time control reaches the top of the loop.
  - *Connects to:* Wraps a real `dequeue`/`pop` call each time through, appending the result to a running list; exits once `isEmpty()` turns `true`.
  - *Shape:* A fundamental control structure, reappearing here unchanged.
- **`listOf(vararg elements)`**
  - *What it is:* A standard-library factory function producing a new, read-only list, already established from this slice's own opening lesson.
  - *Implementation:* `fun <T> listOf(vararg elements: T): List<T>`, part of the Kotlin standard library.
  - *Its use:* This lesson's second unit needs a fixed, ordered sequence of real numbers — the four digit tokens `tokenize` already proved, for real, that this project's own target expression contains — to feed into both a `Queue` and a `Stack`.
  - *Type:* A top-level generic function.
  - *Responsibility:* Holding a fixed, ordered, read-only sequence of elements.
  - *Depends on:* The elements passed to it.
  - *Connects to:* Constructed once near the top of this lesson's second unit's own lab; iterated by the `for` loops that feed both structures.
  - *Shape:* A standard-library data structure, reused here for a fifth distinct purpose across this slice's own lessons so far.

## Concept Unit: The Queue — FIFO, Enqueue, Dequeue

### The Problem

This slice's own Stack lesson proved LIFO order works, and proved it's the right tool for a real problem — matching nested parentheses. But not every real system that holds multiple pending things wants the *most recently added* one handled first. A print queue is the classic case: if three documents are sent to a printer, one after another, which one should the printer actually print first?

> If you send `"resume.pdf"`, then `"photo.jpg"`, then `"report.docx"` to a printer, in that order, which one would you expect to come out first? Is that the *same* order you submitted them in, or the reverse — and how does that compare to what this slice's own Stack would do with the same three items? What two operations would "submitting a new print job" and "the printer taking its next job" need to correspond to, the same way a Stack's own `push`/`pop` pair already did for a browser's back button?

### Introduce the Concept in Isolation

The following throwaway code is not part of this project and never will be — a small, hand-written class, and a print-queue simulation built on it:

```kotlin
class Queue {
    private val items = mutableListOf<String>()

    fun enqueue(item: String) {
        items.add(item)
    }

    fun dequeue(): String {
        return items.removeAt(0)
    }
}

fun main() {
    val printQueue = Queue()
    printQueue.enqueue("resume.pdf")
    printQueue.enqueue("photo.jpg")
    printQueue.enqueue("report.docx")
    println("now printing: ${printQueue.dequeue()}")
    println("now printing: ${printQueue.dequeue()}")
    println("now printing: ${printQueue.dequeue()}")
}
```

Compiled and run for real, this produced:

```
now printing: resume.pdf
now printing: photo.jpg
now printing: report.docx
```

Three jobs were enqueued, in order — `"resume.pdf"`, then `"photo.jpg"`, then `"report.docx"` — and they come back out in that exact same order, one real `dequeue` at a time. This is the opposite of what this slice's own `Stack` proved: there, the *last* thing pushed came back *first*; here, the *first* thing enqueued comes back first too. This ordering rule — whatever was added *least* recently is always the first thing removed — is called **FIFO (First-In, First-Out)**, and a collection built to guarantee it is called a **Queue**. `enqueue` and `dequeue` are its two core operations, adding at one end and removing from the other, never the same end for both.

### Discard the Throwaway Example

This `Queue` class and its print-queue demonstration are deleted now and will not appear in this project again. This project's own real `CalculatorState`/`nextState` are completely unmodified — this unit's own job was proving the FIFO mechanism itself works, using a familiar example, before the next unit connects it to this project's own real, upcoming need.

### Mechanical Walkthrough

Every distinct syntactic element in the code above, in order:

- `class Queue` — a class declaration, already established, the same real shape this slice's own `Stack` class already used.
- `private val items = mutableListOf<String>()` — a `private` property, already established, holding a real `MutableList<String>`, documented above.
- `fun enqueue(item: String) { items.add(item) }` — a method, already established, calling the real `MutableList.add` method (documented above) to place a new item at the end of `items`.
- `fun dequeue(): String { return items.removeAt(0) }` — a method returning `String`, calling the real `MutableList.removeAt` method (documented above) with the literal index `0` — the *front* of the list — removing and returning whichever element has been waiting there longest.
- `fun main()`, `val printQueue = Queue()` — already established: constructing a new `Queue` instance with no arguments.
- `printQueue.enqueue("resume.pdf")`, `printQueue.enqueue("photo.jpg")`, `printQueue.enqueue("report.docx")` — three real calls to the method just declared, each appending one more string literal onto the end of `items`, already established.
- `println("now printing: ${printQueue.dequeue()}")` — a string template, already established, embedding a real method call directly inside the interpolated expression; repeated twice more, draining the queue completely.

### CS Lens

FIFO is the other of computing's two most fundamental orderings — LIFO's own exact opposite, already named when this slice's own Stack was first proven.

```
Also recognized in: a real print spooler managing multiple real
documents, a real message queue in server software, a customer
service phone system ("your call will be answered in the order it
was received"), a CPU's own real task-scheduling queue, a real
breadth-first search's own frontier of nodes still waiting to be
visited
```

### SE Lens

The alternative not chosen here: reuse this slice's own already-built `Stack` class for this same job, since it already exists and popping instead of dequeuing would need only a different method name. The real tradeoff: a `Stack` would hand the printer `"report.docx"` — the *last* job submitted — first, not `"resume.pdf"`, the first one actually sent. That isn't a minor stylistic difference; it's simply the wrong real behavior for this real job. `Queue` has to be its own real, separate structure precisely because "add here, remove from the other end" is a genuinely different guarantee than "add here, remove from the same end" — not a renamed version of the same one.

### Commands Needed

`kotlinc lab1_print_queue.kt -include-runtime -d lab1.jar`, then `java -jar lab1.jar`, the same real commands already established throughout this slice.

### Run It

Real command run: `kotlinc lab1_print_queue.kt -include-runtime -d lab1.jar`, then `java -jar lab1.jar`. Real, executed output:

```
now printing: resume.pdf
now printing: photo.jpg
now printing: report.docx
```

### Connect the Pieces

A Queue proved, with a familiar example, that FIFO is real and buildable, and that it's genuinely the opposite of the LIFO this slice's own Stack already guaranteed — the next unit asks whether that opposite ordering has anything to do with this project's own real, upcoming work.

## Concept Unit: Why Parsers Need Queues Too

### The Problem

This project's own real, permanent `tokenize` function already proved, for real, that `"3+5×(2−8)"` splits into `[3, +, 5, ×, (, 2, −, 8, )]`. This slice's own coming work will read those tokens left to right, and every number it reads needs to end up in a real output — in the *same order* it was actually read in. Does that requirement — "whatever came out first when reading needs to come out first later too" — sound like a job for the Stack this slice already built, or something else?

> Reading `"3+5×(2−8)"` left to right, in what order do the actual digits `3`, `5`, `2`, `8` appear? If those four numbers were pushed onto this slice's own real `Stack`, in that same order, and then popped back off one at a time, what order would they come back out in — the same order, or reversed? If a later stage of this project's own coming work needs to process these numbers in the *same* order the original expression actually wrote them, which of the two structures this slice now has — Stack or Queue — actually preserves that?

### Introduce the Concept in Isolation

The following throwaway code is not part of this project and never will be — a `Queue` and a `Stack`, each holding the exact same four real numbers, in the exact same order, read back out both ways:

```kotlin
class Queue {
    private val items = mutableListOf<Int>()

    fun enqueue(item: Int) {
        items.add(item)
    }

    fun dequeue(): Int {
        return items.removeAt(0)
    }

    fun isEmpty(): Boolean {
        return items.isEmpty()
    }
}

class Stack {
    private val items = mutableListOf<Int>()

    fun push(item: Int) {
        items.add(item)
    }

    fun pop(): Int {
        return items.removeAt(items.size - 1)
    }

    fun isEmpty(): Boolean {
        return items.isEmpty()
    }
}

fun main() {
    val numbersInReadingOrder = listOf(3, 5, 2, 8)

    val queue = Queue()
    for (number in numbersInReadingOrder) {
        queue.enqueue(number)
    }
    val queueOrder = mutableListOf<Int>()
    while (!queue.isEmpty()) {
        queueOrder.add(queue.dequeue())
    }
    println("queue read back: $queueOrder")

    val stack = Stack()
    for (number in numbersInReadingOrder) {
        stack.push(number)
    }
    val stackOrder = mutableListOf<Int>()
    while (!stack.isEmpty()) {
        stackOrder.add(stack.pop())
    }
    println("stack read back: $stackOrder")
}
```

`numbersInReadingOrder` — `[3, 5, 2, 8]` — is exactly the four digit tokens `tokenize("3+5×(2−8)")` already proved, for real, exist inside this project's own real target expression, in the exact order they actually appear when reading it left to right. Compiled and run for real, this produced:

```
queue read back: [3, 5, 2, 8]
stack read back: [8, 2, 5, 3]
```

The real, decisive result: the same four numbers, added in the exact same order to both structures, come back out identically from the `Queue` — `[3, 5, 2, 8]`, matching the expression's own real reading order exactly — and completely reversed from the `Stack` — `[8, 2, 5, 3]`. This is real, concrete proof that a Queue, not a Stack, is the structure this project's own coming work needs anywhere it must preserve "the order things were actually read in" — the Stack this slice already built is exactly right for tracking *pending operators*, and exactly wrong for this different job.

### Discard the Throwaway Example

This second `Queue` class, the fresh `Stack` class built alongside it, and their comparison are deleted now and will not appear in this project again. This project doesn't have a real Shunting-Yard algorithm yet to plug either structure into — building one, for real, is this slice's own next work; this unit's own job was proving, concretely, which of the two real structures this slice already has is the right one for which real part of that coming job.

### Mechanical Walkthrough

Every distinct syntactic element in the code above, in order (`Queue`'s own declaration repeats the identical shape already fully enumerated in this lesson's first unit, adjusted from `String` to `Int` and adding one new method, `isEmpty`, already established from this slice's own Stack lesson; `Stack`'s own declaration is the identical shape already fully enumerated there too — only what's new to *this* unit's own code gets a fresh enumeration):

- `class Queue`, `class Stack` — the identical real mechanisms already established, holding `Int` instead of `String`/`Char`.
- `val numbersInReadingOrder = listOf(3, 5, 2, 8)` — the real standard-library `listOf` function, documented above, holding this project's own real digit tokens in their real reading order.
- `val queue = Queue()`, `for (number in numbersInReadingOrder) { queue.enqueue(number) }` — already established, constructing a `Queue` and enqueuing all four real numbers in order.
- `val queueOrder = mutableListOf<Int>()` — a fresh, empty `MutableList<Int>` to collect the real order things actually come back out in.
- `while (!queue.isEmpty())` — the real `while` loop documented above, its condition using `!` (already established logical negation) on the real `isEmpty()` method also documented above — continuing for as long as the queue still holds something.
- `queueOrder.add(queue.dequeue())` — the real `MutableList.add` method, already established, appending the result of a real `dequeue()` call onto the tracking list, one real removal at a time.
- `println("queue read back: $queueOrder")` — a string template, already established, interpolating the completed list directly.
- The remaining six lines repeat this identical shape for `Stack`, using `push`/`pop` in place of `enqueue`/`dequeue`.

### CS Lens

The specific contrast this unit just proved — the same data, same order in, opposite order out, depending only on which end of a two-ended structure gets used — is the exact mechanism behind why real algorithms choose deliberately between a Stack and a Queue, never arbitrarily.

```
Also recognized in: a real Shunting-Yard algorithm's own real output
queue — the exact structure this project's own coming work will
build — a real breadth-first tree or graph traversal (processing
level by level, in the order nodes are first discovered, never
depth-first), a real print spooler processing jobs in the order they
were submitted, any real pipeline where "the order work arrives" must
equal "the order work gets handled"
```

### SE Lens

The alternative not chosen here: skip building a real `Queue` at all, and feed this project's own coming Shunting-Yard output through the `Stack` it already has, since reusing an existing type would mean one fewer new structure for this project to carry. The real tradeoff: this unit's own real, executed proof already shows exactly what would go wrong — the same four real numbers from this project's own actual target expression, read back through a `Stack`, come out as `[8, 2, 5, 3]` instead of `[3, 5, 2, 8]` — a genuinely different, genuinely wrong sequence, which a later evaluation stage would then compute against the wrong numbers in the wrong order. Reusing the wrong ordering guarantee to avoid one small new type would trade a real correctness bug for an illusory savings.

### Commands Needed

`kotlinc lab2_queue_vs_stack_order.kt -include-runtime -d lab2.jar`, compiled as its own separate pass, matching this slice's own already-established practice for a lab declaring a colliding class name (`Queue`) against another file in the same lesson, then run via `java -jar lab2.jar`.

### Run It

Real command run: `kotlinc lab2_queue_vs_stack_order.kt -include-runtime -d lab2.jar`, then `java -jar lab2.jar`. Real, executed output:

```
queue read back: [3, 5, 2, 8]
stack read back: [8, 2, 5, 3]
```

### Connect the Pieces

The same real four numbers from this project's own real target expression came back out correctly through a Queue and scrambled through a Stack — real, concrete proof that this slice now has both of the real structures its own coming evaluator will need, each proven correct for a genuinely different real job.

## Connect the Pieces

Follow the same real numbers through both of this lesson's units. A hand-written `Queue`, built from nothing but a `private MutableList` and two narrow methods, `enqueue` and `dequeue`, proved FIFO order for real first: three print jobs, submitted in order, came back out in that exact same order, the precise opposite of what this slice's own Stack already proved for a browser's back button. The second unit then took the identical mechanism and put it directly against this project's own real numbers — the four digit tokens, `[3, 5, 2, 8]`, that this project's own real, permanent `tokenize` function already proved exist inside `"3+5×(2−8)"`, in that exact reading order. Fed through a fresh `Queue`, they came back out unchanged, `[3, 5, 2, 8]`; fed through a fresh `Stack`, built the identical way this slice's own real one already was, they came back out reversed, `[8, 2, 5, 3]` — the same real data, the same order added, two genuinely different real results, decided entirely by which end of which structure got used. Nothing in this project's own permanent code changed — that was never this lesson's job. What exists now is a real, proven answer to a question this slice's own coming work will need settled before it can be built at all: tracking a pending operator needs a Stack; preserving the order results were actually produced in needs a Queue — and this project now has real, executed proof of both, ready for whatever assembles them into a real evaluator next.
