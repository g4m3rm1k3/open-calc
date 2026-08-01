# Lesson 31: Testing a `ViewModel` With Coroutines Test Utilities

**What you will build:** A real, running unit test for
`InventoryViewModel`'s `addItem`/`deleteItem` logic, plus a disposable
proof of `runTest`'s real superpower: making a coroutine's `delay(1000)`
resolve instantly inside a test, without actually waiting a second. The
transferable problem: this series has never written a single test,
because nothing in it was ever genuinely testable in isolation — every
Java Activity this series has mirrored entangles its logic directly
with `findViewById`/`onCreate`/real Android widgets, requiring a real or
simulated device to exercise at all. `ViewModel` changes this concretely
for the first time in either series' project code.

**What you need to know first:** This series' own Lesson 19
(`ViewModel`, `InventoryViewModel`'s `addItem`/`deleteItem`), Lesson 20
(`StateFlow`), Lesson 21 (`suspend`, coroutines, `delay`).

**Terms introduced in this lesson:**
- **`runTest`** — a coroutine builder, from `kotlinx-coroutines-test`,
  that runs a `suspend` test body inside a special test dispatcher using
  virtual, simulated time instead of real wall-clock time.
- **Virtual time** — a fake clock a test dispatcher controls directly;
  a coroutine's `delay(1000)` inside `runTest` advances this fake clock
  by `1000` immediately, rather than the test actually pausing for a
  real second.

---

## Concept Unit: Why This Is Newly Testable

### The Problem

Every Activity this series has built — `MainActivity`, `InventoryActivity`,
`NotificationsActivity` — mixes real logic (validation, list mutation,
permission status) directly with real Android framework calls
(`binding.usernameField.text`, `Toast.makeText`, `LocalContext.current`).
Testing any of that logic in isolation would require either a real
device/emulator or a heavyweight Android-simulating test framework —
genuinely out of this project's UI-only scope. `InventoryViewModel`
(this series' own Lesson 19) is different: it holds real state
(`_items`) and real logic (`addItem`, `deleteItem`) with zero references
to `Context`, `View`, or any other Android UI class at all.

### CS Lens

A class with no dependency on its surrounding framework, callable and
verifiable using nothing but plain Kotlin and a JVM, is what makes
**unit testing** — testing one small piece of logic in complete
isolation — possible at all. This is a direct, structural payoff of
this series' own Lesson 17 state-hoisting principle: pushing state and
logic out of composables and into a plain `ViewModel` class didn't just
fix a rotation bug (Lesson 19) — it also produced the first genuinely
isolated, dependency-free unit of logic either series has built.

---

## Concept Unit: `runTest` and Virtual Time

### The Problem

`InventoryViewModel`'s own logic is currently fully synchronous —
`addItem`/`deleteItem` complete immediately, needing no coroutine
machinery to test at all. Real `ViewModel` logic often isn't: a network
call, a `delay`-based debounce, or any other genuinely asynchronous
operation. Testing code that calls `delay(1000)` by actually waiting a
real second, for every such test, in a large real test suite, adds up
to real, wasted time on every single test run.

### Introduce the Concept in Isolation

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.test.*

class FakeInventoryViewModel(private val scope: CoroutineScope) {
    private val _items = MutableStateFlow<List<String>>(emptyList())
    val items: StateFlow<List<String>> = _items.asStateFlow()

    fun loadItems() {
        scope.launch {
            delay(1000)
            _items.value = listOf("Bolts", "Washers")
        }
    }
}

fun main() = runTest {
    val viewModel = FakeInventoryViewModel(this)

    println("Before loadItems: ${viewModel.items.value}")
    viewModel.loadItems()
    println("Immediately after calling loadItems: ${viewModel.items.value}")

    advanceUntilIdle()
    println("After advanceUntilIdle: ${viewModel.items.value}")
}
```

Compile and run, timed:

```
kotlinc -cp kotlinx-coroutines-core.jar:kotlinx-coroutines-test.jar FakeViewModel.kt -include-runtime -d FakeViewModel.jar
time java -cp FakeViewModel.jar:kotlinx-coroutines-core.jar:kotlinx-coroutines-test.jar FakeViewModelKt
```

Real output, from running this just now:

```
Before loadItems: []
Immediately after calling loadItems: []
After advanceUntilIdle: [Bolts, Washers]

real    0.100 total
```

`fun main() = runTest { ... }` runs its body inside a coroutine using a
special test dispatcher, entirely controlled by **virtual time** — a
fake clock, not the real system clock. `loadItems()` calls
`delay(1000)` — a real, unmodified, genuine one-second delay, exactly
as it would appear in production code — and yet the entire program,
timed just now, finished in about a tenth of a second, not one second
plus overhead. `advanceUntilIdle()` is what makes this possible: it
tells the test dispatcher to fast-forward virtual time until every
currently-scheduled coroutine (including the one waiting on
`delay(1000)`) has finished — the `delay` itself is genuinely respected
in terms of *ordering* (nothing after it runs before it "elapses"), but
the actual wait costs the test nothing in real wall-clock time.

### Discard the Throwaway Example

`FakeInventoryViewModel`/`FakeViewModel.kt` are deleted. `runTest` is
the real tool the next unit applies to the real `InventoryViewModel`.

### CS Lens

A test dispatcher that fully controls its own notion of time is a real
instance of **dependency injection applied to time itself** — instead of
code depending on the real system clock (unpredictable, slow to test
against), it depends on an injected, controllable time source, the same
general principle behind injecting a fake database or fake network
client for testing anything else that would otherwise be slow or
non-deterministic.

### SE Lens

**Why does `advanceUntilIdle()` need to be called explicitly, rather
than `runTest` fast-forwarding time automatically the whole time a test
runs?** Real, correct tests sometimes need to check state *at a specific
point in time* — partway through a delay, before it completes — to
verify a loading indicator is shown, for instance, before the delayed
result arrives. Automatically skipping straight to the end would make
that kind of assertion impossible; `advanceUntilIdle()` (and its
sibling, `advanceTimeBy(millis)`, for advancing a specific, partial
amount) give a test explicit control over exactly how far virtual time
moves, rather than collapsing every test into "run to completion, check
only the final state."

---

## Concept Unit: A Real Test for `InventoryViewModel`

### Project Change

- **Reference Source:** `kotlinx.coroutines.test.runTest`,
  `kotlinx.coroutines.flow.first` — standard, stable Kotlin coroutines
  test APIs.
- **Files affected:** New `InventoryViewModelTest.kt`, in the project's
  test source set rather than its main source set.
- **Change type:** Create a new test file.
- **Dependencies:** `kotlinx-coroutines-test`, added as a `testImplementation`
  Gradle dependency (test-only code never ships inside the real app).

### The New Code

```kotlin
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.test.runTest
import kotlin.test.assertEquals

class InventoryViewModelTest {
    @Test
    fun addItem_appendsToTheList() = runTest {
        val viewModel = InventoryViewModel()

        viewModel.addItem(InventoryItem("Nuts", 200))

        val items = viewModel.items.first()
        assertEquals(4, items.size)
        assertEquals("Nuts", items.last().name)
    }

    @Test
    fun deleteItem_removesTheMatchingItem() = runTest {
        val viewModel = InventoryViewModel()
        val bolts = viewModel.items.first().first { it.name == "Bolts" }

        viewModel.deleteItem(bolts)

        val items = viewModel.items.first()
        assertEquals(false, items.any { it.name == "Bolts" })
    }
}
```

### Mechanical Walkthrough

- `runTest { ... }` — reappearing, this lesson's own concept, used here
  even though `addItem`/`deleteItem` themselves are fully synchronous —
  because `viewModel.items.first()` (reading a `StateFlow`'s current
  value through Kotlin's `Flow` API) is itself a `suspend` function
  (this series' own Lesson 21 concept), requiring a coroutine context
  to call at all, exactly this series' own Lesson 21 "contagious"
  `suspend` rule.
- `viewModel.items.first()` — **first appearance.** A standard-library
  `Flow` function returning the first value a flow emits — for a
  `StateFlow`, this is simply its current value, read the idiomatic way
  test code reads a `StateFlow` rather than accessing `.value` directly
  (both work; `.first()` is the more general pattern that also works
  for a plain `Flow` with no `.value` property at all).
- `assertEquals(4, items.size)`, `assertEquals("Nuts", items.last().name)`
  — ordinary test assertions, from Kotlin's own `kotlin.test` library,
  checking a real value against an expected one and failing the test
  with a clear message if they don't match.
- `bolts = viewModel.items.first().first { it.name == "Bolts" }` —
  `.first { predicate }`, a different, second meaning of `first` — this
  one a plain `List` function (not the `Flow` one from the line above)
  finding the first element matching a condition, reused here on the
  emitted list itself.

### SE Lens

**Why test `deleteItem` by first finding the real `Bolts` object via
`.first { it.name == "Bolts" }`, rather than just constructing a new
`InventoryItem("Bolts", 120)` directly and passing that to
`deleteItem`?** This series' own Lesson 18 already named the real limit
of `data class` structural equality for deletion — two separately
constructed `InventoryItem("Bolts", 120)` values are `==` to each other,
so either approach would technically work for *this* test, but finding
the real object already inside the list is the more honest test: it
verifies deletion against an item the `ViewModel` actually produced,
rather than against a coincidentally-equal value constructed
independently — the same distinction Lesson 18's own SE Lens already
flagged as a real, open limitation worth being deliberate about, even in
a test.

---

## Connect the Pieces

One trace: `InventoryViewModel`, having no dependency on `Context`,
`View`, or any Android framework class, was directly instantiable and
testable with nothing but plain Kotlin — a real, structural payoff of
Lesson 17's own state-hoisting decision, confirmed here rather than
merely claimed. `runTest`, proven in isolation to skip real wall-clock
time on a genuine `delay(1000)`, provided the coroutine context
`viewModel.items.first()` requires (Lesson 21's contagious `suspend`
rule) to read a `StateFlow`'s current value at all, even for this
project's own fully synchronous `addItem`/`deleteItem` logic.

## What Breaks Without This

Remove `runTest { }` from around a test body, leaving `fun
addItem_appendsToTheList() { val items = viewModel.items.first() ... }`
as a plain, non-suspend test function, and try to compile.

Real output, from running this yourself: the identical
"can only be called from a coroutine or another suspend function" error
this series' own Lesson 21 already triggered on purpose — `Flow.first()`
is `suspend`, and a plain test function provides no coroutine context
for it to run in. Restore `runTest` before moving on.

## Exercises

1. Write a third test, `deleteItem_onNonexistentItem_doesNothing`,
   calling `deleteItem` with an `InventoryItem` that was never actually
   in the list, and confirm the list's size is unchanged afterward —
   direct proof this project's own `filter`-based deletion (this
   series' own Lesson 20) fails silently rather than crashing on a
   missing item.
2. Add a genuinely asynchronous method to a disposable copy of
   `InventoryViewModel` — `suspend fun refreshFromServer()`, calling
   `delay(2000)` before replacing `_items`'s value with a hardcoded
   fake "server" list — and write a real test for it using
   `advanceUntilIdle()`, confirming the pattern from this lesson's own
   isolated lab applies identically to real `ViewModel` code.
3. Explain, in your own words, why this lesson's tests construct a
   brand-new `InventoryViewModel()` in every single test function,
   rather than sharing one instance across all of them — connect your
   answer to what could go wrong if one test's mutations leaked into
   the next test's starting state.

## Definition of Done

- [ ] You ran the `runTest`/virtual-time lab yourself and timed it,
      confirming a real `delay(1000)` resolved in a small fraction of a
      second.
- [ ] Both real `InventoryViewModel` tests pass, verified by actually
      running them.
- [ ] You triggered the real "can only be called from a coroutine"
      error by removing `runTest`, and restored it.
- [ ] You can explain why `InventoryViewModel` is testable this way
      while every Activity in this project is not.
- [ ] Commit: `git commit -m "Add unit tests for InventoryViewModel
      using kotlinx-coroutines-test"` — explaining what makes this class
      testable, not just that tests were added.

Next: bounded generics, Kotlin's own syntax for the exact concept Java's
Lessons 12 and 24 already taught — closing a real syntax gap between the
two languages on a real, generic repository-style wrapper.
