---
series: kotlin-fundamentals
level: 21
title: Kotlin — Putting It Together
lang: kotlin
---

# Kotlin — Putting It Together

Twenty-one levels ago, this series opened with `fun main() { println("Hello, Kotlin!") }` — the smallest possible removal of Java's ceremony. Since then: `val`/`var` and null safety (Levels 0, 3), data classes and collections (Levels 5, 6), lambdas and collection operations (Levels 7, 8), `when` and sealed classes (Levels 9, 13), extension functions and scope functions (Levels 10, 17), inheritance, objects, generics, and exceptions (Levels 11, 12, 15, 16). This closing lesson combines several of them into one small, real system: a task tracker with priorities, states, and a query layer — built the same way `java-architecture`'s capstone combined Strategy, State, Observer, and Repository into one order-processing core.

## The Complete System

```kotlin
// SEALED CLASS (Level 13) — a closed, exhaustively-checkable set of states.
sealed class TaskStatus {
    object Pending : TaskStatus()
    object InProgress : TaskStatus()
    data class Done(val completedBy: String) : TaskStatus()
}

// ENUM CLASS (Level 14) — a closed set of priorities, each carrying real data.
enum class Priority(val weight: Int) {
    LOW(1), MEDIUM(2), HIGH(3)
}

// DATA CLASS (Level 5) — equals/hashCode/toString/copy, all generated.
data class Task(
    val id: Int,
    val title: String,
    val priority: Priority,
    val status: TaskStatus = TaskStatus.Pending
)

// CUSTOM EXCEPTION (Level 16).
class TaskNotFoundException(id: Int) : Exception("No task with id $id")

class TaskTracker {
    private val tasks = mutableMapOf<Int, Task>()   // Level 6 — MutableMap
    private var nextId = 1

    fun addTask(title: String, priority: Priority): Task {
        val task = Task(nextId, title, priority)
        tasks[nextId] = task
        nextId++
        return task
    }

    fun startTask(id: Int) {
        val task = tasks[id] ?: throw TaskNotFoundException(id)   // Level 3 — elvis operator
        tasks[id] = task.copy(status = TaskStatus.InProgress)      // Level 5 — copy()
    }

    fun completeTask(id: Int, completedBy: String) {
        val task = tasks[id] ?: throw TaskNotFoundException(id)
        tasks[id] = task.copy(status = TaskStatus.Done(completedBy))
    }

    // COLLECTION OPERATIONS (Level 8) — filter + sortedByDescending, chained.
    fun pendingByPriority(): List<Task> {
        return tasks.values
            .filter { it.status is TaskStatus.Pending }
            .sortedByDescending { it.priority.weight }
    }
}

// EXTENSION FUNCTION (Level 10) — a readable one-line summary, defined outside Task itself.
fun Task.summary(): String {
    // WHEN EXPRESSION (Level 9) over a sealed class — no else needed.
    val statusText = when (status) {
        is TaskStatus.Pending -> "pending"
        is TaskStatus.InProgress -> "in progress"
        is TaskStatus.Done -> "done by ${status.completedBy}"
    }
    return "[$priority] $title ($statusText)"
}

fun main() {
    val tracker = TaskTracker()

    tracker.addTask("Write report", Priority.MEDIUM)
    tracker.addTask("Fix critical bug", Priority.HIGH)
    tracker.addTask("Update docs", Priority.LOW)

    tracker.startTask(1)
    tracker.completeTask(1, "Alice")

    for (task in tracker.pendingByPriority()) {
        println(task.summary())
    }

    try {
        tracker.startTask(99)
    } catch (e: TaskNotFoundException) {
        println("Error: ${e.message}")
    }
}
```

```text
[HIGH] Fix critical bug (pending)
[LOW] Update docs (pending)
Error: No task with id 99
```

## Tracing One Call Through Every Feature

```text
tracker.startTask(1) flows through:

  1. NULL SAFETY (Level 3): tasks[id] ?: throw TaskNotFoundException(id)
     -> tasks[1] returns Task?, elvis throws if it were null (it isn't here)

  2. DATA CLASS copy() (Level 5): task.copy(status = TaskStatus.InProgress)
     -> builds a NEW Task, changing only status, leaving id/title/priority untouched

  3. SEALED CLASS (Level 13): TaskStatus.InProgress is a real, closed subtype
     -> no other TaskStatus can exist beyond Pending/InProgress/Done

  4. COLLECTION OPERATIONS (Level 8), inside pendingByPriority():
     -> .filter { it.status is TaskStatus.Pending } keeps only pending tasks
     -> .sortedByDescending { it.priority.weight } orders HIGH before LOW

  5. EXTENSION FUNCTION + WHEN (Levels 10, 9), inside task.summary():
     -> when (status) branches exhaustively over the sealed TaskStatus,
        no else needed — the compiler already proved these three cases are all of them

ALL OF IT sits on ENUM CLASS Priority (Level 14) for closed, data-carrying
priorities, and a CUSTOM EXCEPTION (Level 16) for a specific, catchable
failure — the same discipline java-architecture's capstone applied to
Strategy, State, Observer, and Repository, now in Kotlin's own idioms.
```

**CS lens:** Every pattern here is doing exactly one job, independently of the others — `sealed class` closes the state space, `data class` gives structural equality and cheap updates, `enum class` closes the priority space, collection operations express "select and order" without a hand-written loop, and the extension function keeps display logic separate from `Task`'s own core definition. None of these five ideas depend on each other's internals; each could be swapped or extended without touching the rest — the same **orthogonality** `java-architecture`'s own capstone named explicitly.

**SE lens:** Compare `completeTask`'s three lines to what the equivalent Java code (from `java-architecture`, adapted) would need: a `null` check written out by hand, a full object reconstruction instead of `copy()`, and a `switch` statement requiring a `default` case that can never actually prove it's exhaustive. Every Kotlin feature in this file exists because it removes one specific piece of ceremony Java requires — not as abstract language trivia, but because each one, individually, closes a real gap this series demonstrated with a real, broken example first.

## Course Complete

Twenty-two levels, starting from `println("Hello, Kotlin!")` and ending with a real, sealed-state, exception-throwing, collection-querying task tracker — every one of them verified by real, live-run Kotlin code, exactly like this final one. Every idea in between — null safety, data classes, sealed classes, extension functions, coroutines' language-level foundation — is a real, standard part of professional Kotlin, not a simplified stand-in for it. If you've also completed `java-fundamentals` and `java-architecture`, you now have both halves of the JVM's two dominant languages, and — more usefully — a working sense of exactly which of Kotlin's features are solving problems you've already felt firsthand in Java.

## Challenge: library_catalog

Combine several ideas from this series into one small system.

Write:
- `sealed class BookStatus` with `object Available`, `data class CheckedOut(val borrower: String)`
- `data class Book(val isbn: String, val title: String, val status: BookStatus = BookStatus.Available)`
- `class BookNotFoundException(isbn: String) : Exception("No book with ISBN $isbn")`
- `class Library` with a private `MutableMap<String, Book>`, `fun addBook(isbn: String, title: String)`, `fun checkOut(isbn: String, borrower: String)` (throws `BookNotFoundException` if not found, throws `IllegalStateException` if already checked out, otherwise updates status via `copy()`), and `fun availableBooks(): List<Book>` (filtered by status, using `filter`)

```challenge
sealed class BookStatus

data class Book(val isbn: String, val title: String, val status: BookStatus = BookStatus.Available)

class BookNotFoundException(isbn: String) : Exception("No book with ISBN $isbn")

class Library {
    private val books = mutableMapOf<String, Book>()

    fun addBook(isbn: String, title: String) {
    }

    fun checkOut(isbn: String, borrower: String) {
    }

    fun availableBooks(): List<Book> {
        return emptyList()
    }
}
```

```test
val library = Library()
library.addBook("111", "Kotlin in Action")
library.addBook("222", "Effective Java")

assert library.availableBooks().size == 2

library.checkOut("111", "Alice")
assert library.availableBooks().size == 1
assert library.availableBooks()[0].isbn == "222"

var threwOnDoubleCheckout = false
try {
    library.checkOut("111", "Bob")
} catch (e: IllegalStateException) {
    threwOnDoubleCheckout = true
}
assert threwOnDoubleCheckout

var threwOnMissing = false
try {
    library.checkOut("999", "Carol")
} catch (e: BookNotFoundException) {
    threwOnMissing = true
}
assert threwOnMissing
```
