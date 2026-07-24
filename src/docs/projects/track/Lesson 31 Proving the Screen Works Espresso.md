# Lesson 31: Proving the Screen Works — Espresso and UI Testing

**What you will build:** A real, automated instrumented test that
launches `InventoryActivity` on an actual device or emulator, taps the
real Add Item FAB, types into real `EditText` fields, taps Save, and
asserts the new item genuinely appears in the real `RecyclerView` — no
human tapping anything. The transferable problem: Lesson 30's tests ran
on a plain JVM, deliberately avoiding real `View`s, a real
`RecyclerView`, and Android's real UI framework entirely — correct for
testing pure logic, but incapable of proving the *screen itself* wires
everything together correctly. That requires a real Android runtime,
and a different kind of test.

**What you need to know first:** Lesson 30 (`src/test/`, JUnit,
`@Test` — this lesson's `src/androidTest/` is a structurally parallel
but meaningfully different sibling), Lesson 19 (`InventoryActivity`,
Navigation), Lesson 21 (`addItemFab`), Lesson 9 (the fields under test).

---

## Concept Unit: `androidTest` — Tests That Need a Real Device

### The Problem

Lesson 30's `ItemTest` ran in milliseconds on a plain JVM specifically
because `Item` has no dependency on Android at all. `InventoryAdapter`,
`RecyclerView`, and every real `View` this project has built since
Lesson 3 genuinely require Android's real UI framework to exist and
run — no plain JVM can substitute for it.

### Commands Needed

Add to `app/build.gradle`'s `dependencies { }`:

```gradle
androidTestImplementation 'androidx.test.ext:junit:1.1.5'
androidTestImplementation 'androidx.test.espresso:espresso-core:3.5.1'
```

Sync.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** New file
  `app/src/androidTest/java/.../InventoryFlowTest.java`.
- **Change type:** Create.
- **Location:** Note the path — `src/androidTest/`, a third source set
  alongside `src/main/` and Lesson 30's `src/test/`, mirroring the same
  package structure again.

### The New Code

```java
package com.yourname.pocketinventory;

import androidx.test.core.app.ActivityScenario;
import androidx.test.ext.junit.runners.AndroidJUnit4;
import org.junit.Test;
import org.junit.runner.RunWith;
import static androidx.test.espresso.Espresso.onView;
import static androidx.test.espresso.assertion.ViewAssertions.matches;
import static androidx.test.espresso.matchers.ViewMatchers.*;

@RunWith(AndroidJUnit4.class)
public class InventoryFlowTest {
    @Test
    public void appLaunches_showsToolbarTitle() {
        try (ActivityScenario<InventoryActivity> scenario =
                     ActivityScenario.launch(InventoryActivity.class)) {
            onView(withId(R.id.toolbar)).check(matches(isDisplayed()));
        }
    }
}
```

### The Updated Project

This is a whole new file, in a whole new directory this project has
never used, `src/androidTest/java/com/yourname/pocketinventory/`.

### Mechanical Walkthrough
- `@RunWith(AndroidJUnit4.class)` — **first appearance.** Tells JUnit to
  use a specialized runner capable of launching real Android
- components — plain `@Test` methods (Lesson 30) don't need this,
  since they never touch anything Android-specific.
- `ActivityScenario.launch(InventoryActivity.class)` — **first
  appearance.** Actually starts a real `InventoryActivity` instance on
  the connected device or emulator, running through its real
  `onCreate` (Lesson 2), real Navigation Component setup (Lesson 19),
  everything — this is a genuine app launch, not a simulation.
- `try (ActivityScenario<...> scenario = ...) { ... }` — **first
  appearance of try-with-resources.** `ActivityScenario` implements
  `AutoCloseable`; this syntax guarantees the Activity is properly
  destroyed and cleaned up when the block ends, even if an assertion
  inside throws — a real, if narrow, new piece of Java syntax worth
  naming directly rather than treating as ordinary `try`.
- `onView(withId(R.id.toolbar))` — **first appearance of Espresso's
  core query shape.** `onView(...)` locates a `View` in the currently
- displayed screen; `withId(R.id.toolbar)` — **first appearance** — a
  `Matcher` (a general "does this match a condition" object, a shape
  briefly similar to `DiffUtil.ItemCallback`'s comparison role, Lesson
  20) identifying it by the same generated `R.id` constant every
  `findViewById` call in this project has used since Lesson 4.
- `.check(matches(isDisplayed()))` — **first appearance.** Asserts a
- condition holds *without* performing any action — `isDisplayed()` — **first appearance** — another `Matcher`, confirming the Toolbar

  (Lesson 21) is genuinely visible on screen.

### Run It

Right-click `InventoryFlowTest.java` → **Run**, with a device or
emulator connected. Real output, in Android Studio's test runner
panel: a green checkmark, `appLaunches_showsToolbarTitle PASSED` —
this took several seconds (a real app install and launch), not
milliseconds, a real, felt contrast against Lesson 30's plain-JVM speed.

### CS Lens

The distinction between Lesson 30's unit tests (fast, isolated, no real
framework) and this lesson's **instrumented tests** (slower, running
inside the actual target environment) is a specific instance of the
general **test pyramid** idea in software engineering: many fast, cheap
unit tests forming a broad base, fewer, slower, more realistic
integration/UI tests forming a smaller layer above — each layer
catching a different class of bug, at a different cost.

---

## Concept Unit: `CountingIdlingResource` — Waiting for Real Background Work

### The Problem

`ItemRepository.loadItems()`/`addItem()` (Lesson 17) genuinely dispatch
to a background `dbExecutor` thread (Lesson 14) before eventually
posting to `LiveData`. Espresso automatically waits for the main
thread's UI queue to go idle before running assertions — but it has no
idea `ItemRepository`'s *separate* background thread is still working,
which means a test could assert on the `RecyclerView` before a
database operation has actually finished, producing a flaky,
intermittently-failing test through no fault of the feature itself.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** New file `EspressoIdlingResource.java`;
  `ItemRepository.java`.
- **Change type:** Create, modify.

### The New Code

```java
package com.yourname.pocketinventory;

import androidx.test.espresso.idling.CountingIdlingResource;

public class EspressoIdlingResource {
    static final CountingIdlingResource idlingResource =
            new CountingIdlingResource("ItemRepositoryWork");

    static void increment() {
        idlingResource.increment();
    }

    static void decrement() {
        if (!idlingResource.isIdleNow()) {
            idlingResource.decrement();
        }
    }
}
```

```java
void loadItems() {
    if (loaded) return;
    EspressoIdlingResource.increment();
    dbExecutor.execute(() -> {
        List<Item> loadedItems = itemDao.getAll();
        loaded = true;
        itemsLiveData.postValue(loadedItems);
        EspressoIdlingResource.decrement();
    });
}
```

### The Updated Project

`EspressoIdlingResource` is a new, small, standalone file.
`ItemRepository.loadItems()` gains one `increment()` call before
dispatching to `dbExecutor`, and one `decrement()` call at the end of
the background work — `addItem()`/`deleteItem()` gain the identical
pair, following the same shape (not repeated here in full to avoid
re-showing already-explained mechanics).

### Mechanical Walkthrough

- `CountingIdlingResource("ItemRepositoryWork")` — **first appearance.**
  A counter, starting at zero, specifically designed for Espresso to
  poll: nonzero means "still busy, keep waiting," zero means "idle,
  safe to proceed" — the name is purely a debug label shown in test
  failure output.
- `idlingResource.increment()` / `.decrement()` — **first appearance.**
  Called in matching pairs around any work Espresso needs to wait for —
  exactly the same "mark busy, mark done" shape this project has
  effectively used before, just never surfaced to a testing framework:
  Lesson 26's `Result.success()` reporting `WorkManager`-style
  completion is a conceptual cousin.
- `EspressoIdlingResource.increment()` placed *before*
  `dbExecutor.execute(...)`, `decrement()` placed at the *end* of the
  background lambda — worth restating as a real, sharp-edged
  requirement: get this ordering or placement wrong (say, decrementing
  before the `postValue` call actually happens) and the resource
  reports idle while real work is still technically in flight, silently
  reintroducing the exact flakiness this whole unit exists to prevent.

### The New Code — Registering It in the Test

```java
@Before
public void registerIdlingResource() {
    IdlingRegistry.getInstance().register(EspressoIdlingResource.idlingResource);
}

@After
public void unregisterIdlingResource() {
    IdlingRegistry.getInstance().unregister(EspressoIdlingResource.idlingResource);
}
```

### Mechanical Walkthrough

- `@Before` / `@After` — **first appearance.** JUnit annotations
  marking a method to run before/after *every* `@Test` method in the
  class — the standard setup/teardown pair, distinct from Lesson 30's
  `@Rule` (which wraps the whole test lifecycle more generally); here,
  registering and unregistering `IdlingRegistry` entries specifically
  around each test.
- `IdlingRegistry.getInstance().register(...)` / `.unregister(...)` —
  **first appearance.** Tells Espresso, globally, "also watch this
  resource before proceeding with any action or assertion" — without
  registration, the `increment`/`decrement` calls built above would
  have no effect on Espresso's actual waiting behavior at all.

### SE Lens

**Why not just add a fixed `Thread.sleep(1000)` before every assertion
that touches data loaded asynchronously, instead of building a whole
`IdlingResource` mechanism?** A fixed sleep is exactly the kind of
brittle, arbitrary-feeling fix Lesson 14's ANR unit already showed the
real cost of blocking incorrectly — too short, and the test still
flakes intermittently on a slow device; too long, and every test run
wastes real time waiting past when the work actually finished.
`CountingIdlingResource` waits for the *actual* signal that work is
done, not a guessed duration — more code to write once, in exchange for
a test suite that's both fast (no wasted waiting) and reliable (no
guessed timing).

---

## Concept Unit: Isolating Tests From Real Data

### The Problem

Running `InventoryFlowTest` as written so far would insert a real test
item into the actual `pocket_inventory.db` file on the connected
device — the same file real, manual use of the app reads and writes.
Tests must not permanently pollute real app data, and must not depend
on whatever state a previous manual session happened to leave behind.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `AppDatabase.java`.
- **Change type:** Add.

### The New Code

```java
static void setInstanceForTesting(AppDatabase testInstance) {
    instance = testInstance;
}
```

### The Updated Project

Added to `AppDatabase` alongside `getInstance` (Lesson 13) — a small,
test-only escape hatch that overrides the Singleton's held instance
directly.

### Mechanical Walkthrough
- `static void setInstanceForTesting(AppDatabase testInstance) { instance = testInstance; }`
- — **first appearance.** Directly reassigns the `private static`
  `instance` field (Lesson 13) from outside `getInstance`'s own
- lazy-construction logic — package-private, deliberately not `public`,
  since this is meant to be called only from test code in the same
  package, never from real app code.

### The New Code — Using It in the Test

```java
@Before
public void setUpInMemoryDatabase() {
    AppDatabase testDb = Room.inMemoryDatabaseBuilder(
                    ApplicationProvider.getApplicationContext(), AppDatabase.class)
            .allowMainThreadQueries()
            .build();
    AppDatabase.setInstanceForTesting(testDb);
}
```

### The Updated Project

Added as a second `@Before` method, run before every test in
`InventoryFlowTest`, alongside `registerIdlingResource` from the
previous unit.

### Mechanical Walkthrough
- `Room.inMemoryDatabaseBuilder(ApplicationProvider.getApplicationContext(), AppDatabase.class)`
  — **first appearance.** A Room-provided alternative to
- `Room.databaseBuilder` (Lesson 13) that never touches disk at all —
  every table exists purely in memory, for exactly the lifetime of this
  test process, automatically discarded afterward with no cleanup code
- needed.
- `ApplicationProvider.getApplicationContext()` — **first appearance** — the test-environment way to obtain a real `Context`

  without an Activity.
- `.allowMainThreadQueries()` — **first appearance**, and worth a
  direct, honest caveat: this permits Room to bypass Lesson 13's own
  main-thread restriction, purely for this in-memory test database —
  acceptable here specifically because an in-memory database has no
  disk I/O latency to worry about, and the `EspressoIdlingResource`
  built above still correctly makes Espresso wait for `dbExecutor`'s
  work regardless.

### The New Code — the Full Flow Test

```java
@Test
public void addingItem_appearsInList() {
    try (ActivityScenario<InventoryActivity> scenario =
                 ActivityScenario.launch(InventoryActivity.class)) {
        onView(withId(R.id.addItemFab)).perform(click());
        onView(withId(R.id.nameInput)).perform(typeText("Test Widget"), closeSoftKeyboard());
        onView(withId(R.id.quantityInput)).perform(typeText("7"), closeSoftKeyboard());
        onView(withId(R.id.locationInput)).perform(typeText("Bin 9"), closeSoftKeyboard());
        onView(withId(R.id.saveButton)).perform(click());

        onView(withId(R.id.inventoryRecyclerView))
                .check(matches(hasDescendant(withText("Test Widget"))));
    }
}
```

### Mechanical Walkthrough
- `onView(withId(R.id.addItemFab)).perform(click())` — **first
  appearance of `.perform(...)`.** Executes a real, simulated user
- action — `click()` — **first appearance** — against the located
  view, the FAB built in Lesson 21.
- `onView(withId(R.id.nameInput)).perform(typeText("Test Widget"), closeSoftKeyboard())`
- — **first appearance of `typeText(...)`**, simulating real keystrokes into the real `EditText` from Lesson 9.
- `closeSoftKeyboard()` —

  **first appearance** — dismisses the on-screen keyboard, which can
  otherwise visually obscure a view a later step needs to interact
- with.
- `.perform(...)` accepting **multiple actions** — **first
  appearance of this overload** — runs them in sequence against the
  same view.
- `onView(withId(R.id.saveButton)).perform(click())` — reappearing
  (`.perform(click())`), triggering the real, unmodified validation and
  save logic from Lesson 9/30.
- `onView(withId(R.id.inventoryRecyclerView)).check(matches(hasDescendant(withText("Test Widget"))))`
- — **first appearance of `hasDescendant(...)`.** A `RecyclerView`
  isn't matched by looking for one specific row's text directly (rows
  are dynamically inflated and recycled, Lesson 6); `hasDescendant`
  checks whether *any* descendant view, anywhere in the `RecyclerView`'s
  currently-displayed subtree, matches the inner condition —
- `withText("Test Widget")` — **first appearance** — confirming the
  newly-added item's name genuinely rendered somewhere in the list.

### Run It

Run `addingItem_appearsInList`. Real output: a green pass, after
Espresso genuinely launches the Activity, taps the FAB, types into
three real fields, taps Save, and — waiting correctly for
`EspressoIdlingResource` to report idle before checking — confirms
"Test Widget" is really shown in the list. Temporarily comment out the
`EspressoIdlingResource.increment()`/`decrement()` pair inside
`ItemRepository.addItem()` and rerun this test several times in a row:
watch it become **flaky** — passing most runs, but occasionally failing
because Espresso checked the `RecyclerView` before the background
insert genuinely finished, exactly the failure mode this lesson's
second unit built the idling resource to prevent. Restore the pair
afterward and confirm consistent passes again.

### CS Lens

An `IdlingResource` extending Espresso's automatic main-thread-queue
awareness to cover a separate, tracked resource is a real instance of
**explicit synchronization signaling between independently-scheduled
units of work** — the same underlying need `CountDownLatch` answered in
Lesson 30's test, here surfaced through a purpose-built framework
mechanism instead of raw concurrency primitives.

---

## Connect the Pieces

Full trace: `@Before` methods run first, swapping in an isolated,
in-memory `AppDatabase` (never touching the real device's real data)
and registering the `EspressoIdlingResource` with Espresso's global
registry → `ActivityScenario.launch` starts a completely real
`InventoryActivity`, running every lifecycle method, every Navigation
Component wiring, every ViewModel/Repository construction this project
has built since Lesson 2 → simulated taps and keystrokes drive the
exact same code path a real human tap would, through the exact same
`ItemValidator` (Lesson 30) and `ItemRepository` (Lesson 17) →
`EspressoIdlingResource`'s increment/decrement pair, wired directly
into `ItemRepository`'s background dispatch, ensures Espresso's final
assertion only runs once that real asynchronous work has genuinely
completed → `hasDescendant(withText(...))` confirms the entire chain,
screen to database and back to screen, actually worked, without a
single manual tap from a human.

## What Breaks Without This

Already demonstrated directly above: removing the
`EspressoIdlingResource` calls and watching the test become flaky
across repeated runs, then restoring them.

## Exercises

1. Write a second instrumented test,
   `deletingItem_viaSwipe_removesFromList`, following the same
   `@Before`-isolated-database pattern, using `RecyclerViewActions.actionOnItemAtPosition(0, swipeLeft())`
   (a real Espresso-contrib helper for `RecyclerView`-specific actions
   — look up the exact dependency and import needed) to drive Lesson
   23's swipe-to-delete, asserting the item no longer appears via
   `doesNotExist()` in place of `hasDescendant`.
2. Deliberately leave `allowMainThreadQueries()` off the in-memory test
   database builder and rerun the existing tests — read the real crash
   (Lesson 13's exact `IllegalStateException`, now happening inside a
   test rather than the real app) and restore it afterward, connecting
   this lesson's testing infrastructure back to a rule established
   three phases earlier in this curriculum.

## Definition of Done

- [ ] `InventoryFlowTest` runs on a real device or emulator and both
      tests pass.
- [ ] Tests use an in-memory database and never touch or depend on the
      real device's actual saved inventory.
- [ ] You reproduced real test flakiness by removing the idling
      resource calls, understood why, and restored them.
- [ ] You can explain, in your own words, why `Item`'s tests (Lesson
      30) can run on a plain JVM but `InventoryFlowTest` cannot.
- [ ] Commit: message explaining why (e.g. "Add Espresso-based
      instrumented UI tests covering the full add-item flow, using an
      in-memory database and a CountingIdlingResource to correctly
      wait for ItemRepository's real background work").

Lesson 32 is next: every screen in this project has been built with
XML layouts since Lesson 3 — Jetpack Compose, and rebuilding one screen
declaratively in Kotlin-adjacent Java-callable code to see the same
UI problem solved by a fundamentally different toolkit.
