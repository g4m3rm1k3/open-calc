# Lesson 30: Proving It Without Running It — JUnit, Mockito, and Testable Architecture

**What you will build:** A real, automated test suite — `ItemTest`,
`ItemValidatorTest`, and `ItemRepositoryTest` — running on a plain JVM
in seconds, with no emulator, no Android device, and no manual tapping
through screens. The transferable problem: every single feature built
across this entire project, from Lesson 1 through Lesson 29, has been
verified exactly one way — build the app, run it, tap through it,
watch Logcat. That works, but it doesn't scale: nothing stops a change
in Lesson 25 from silently breaking Lesson 7's `equals()` logic unless
someone manually retests it, and manual retesting of an entire app
before every change is not something any real project can sustain.
Automated tests are executable, permanent proof that specific behavior
still holds — and, as this lesson shows directly, *writing* them
exposes design decisions that were never actually forced to be
testable before now.

**What you need to know first:** Lesson 7 (`Item.equals()`/`hashCode()`),
Lesson 9 (the validation logic currently living inline inside
`AddItemFragment`'s click listener), Lesson 17 (`ItemRepository`'s
constructor, currently hardwired to `AppDatabase.getInstance`).

---

## Concept Unit: JUnit — a Test Is Just a Method the Runner Calls For You

### The Problem

Confirming `Item.equals()` behaves correctly (Lesson 7) has, until now,
meant temporarily adding a `Log.d` call somewhere reachable, running
the app, and reading Logcat — real verification, but manual, and thrown
away the moment you delete the log line.

### Commands Needed

Add to `app/build.gradle`'s `dependencies { }` — note the
`testImplementation` configuration, distinct from every `implementation`
line used so far:

```gradle
testImplementation 'junit:junit:4.13.2'
```

Sync.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** New file
  `app/src/test/java/.../ItemTest.java`.
- **Change type:** Create.
- **Location:** Note the path — `src/test/`, not `src/main/`, a
  separate source set this project has never had a file in before.

### The New Code

```java
package com.yourname.pocketinventory;

import org.junit.Test;
import static org.junit.Assert.*;

public class ItemTest {
    @Test
    public void equals_returnsTrueForSameFieldValues() {
        Item a = new Item("Shop Rags", 12, "Bin 4");
        Item b = new Item("Shop Rags", 12, "Bin 4");

        assertEquals(a, b);
    }

    @Test
    public void equals_returnsFalseForDifferentQuantity() {
        Item a = new Item("Shop Rags", 12, "Bin 4");
        Item b = new Item("Shop Rags", 5, "Bin 4");

        assertNotEquals(a, b);
    }
}
```

### The Updated Project

This is a whole new file, in a whole new directory this project has
never used — `src/test/java/com/yourname/pocketinventory/`, mirroring
`src/main/java/com/yourname/pocketinventory/`'s package structure
exactly, but compiled and run entirely separately.

### Mechanical Walkthrough

- `testImplementation 'junit:junit:4.13.2'` — **first appearance of a
  `testImplementation` dependency**, distinct from every
  `implementation` line since Lesson 6 — code and libraries declared
  this way are available only when compiling and running tests, never
  bundled into the actual shipped app.
- `src/test/java/...` — **first appearance of the test source set.**
  Gradle treats this directory as an entirely separate compilation unit
  from `src/main/`, run on your development machine's plain JVM — no
  Android device, no emulator, seconds instead of the minutes an
  emulator boot and app install take.
- `@Test` — **first appearance.** Marks a method as a test case JUnit's
  test runner should execute — without it, a method named
  `equals_returnsTrueForSameFieldValues` would just be an ordinary,
  unused method.
- `public void equals_returnsTrueForSameFieldValues()` — **first
  appearance of this naming convention** — descriptive, sentence-like
  test method names (`subject_condition_expectedResult`, a widely-used
  convention, not a language rule) exist specifically so a failing
  test's *name alone*, in a test report, tells you what broke without
  opening the file.
- `import static org.junit.Assert.*;` — **first appearance of a static
  import.** Makes `Assert`'s methods (`assertEquals`, `assertNotEquals`,
  used below) callable without the `Assert.` prefix — a real, if minor,
  new piece of Java syntax worth naming directly.
- `assertEquals(a, b)` — **first appearance.** Fails the test loudly,
  with a clear message, if `a.equals(b)` is `false` — this is the exact
  method whose correctness Lesson 7 built and this test now
  permanently, automatically verifies.
- `assertNotEquals(a, b)` — **first appearance**, the inverse check.

### Commands Needed — Running It

In Android Studio, right-click `ItemTest.java` → **Run 'ItemTest'** (or
from a terminal: `./gradlew test`). Real output:

```
ItemTest > equals_returnsTrueForSameFieldValues PASSED
ItemTest > equals_returnsFalseForDifferentQuantity PASSED

BUILD SUCCESSFUL
```

Temporarily break `Item.equals()` — delete the `quantity == that.quantity`
clause entirely (leaving name and location comparison only) — and rerun
the same tests without touching `ItemTest.java` at all:

```
ItemTest > equals_returnsFalseForDifferentQuantity FAILED
    org.junit.ComparisonFailure: expected: not equal but was equal
```

This is the entire, concrete point of automated testing made visible:
a real logic error, caught in under a second, with no emulator, no
manual tap-through, and a message naming exactly which behavior broke.
Restore the deleted clause afterward and rerun to confirm both tests
pass again.

### CS Lens

An automated test suite is **executable specification** — a permanent,
runnable statement of "this is what correct behavior means here,"
checked mechanically on demand instead of relying on a human's memory
of how a feature is supposed to work. Also recognized in: this
curriculum's own `LESSON SCHEMA.md`, whose "What Breaks Without This"
step is a manual, human-run version of exactly this idea; type systems
generally (a type is a machine-checked, always-current specification of
what values a function accepts); and any CI pipeline that blocks a
merge on a failing test, treating the suite as a gate, not a suggestion.

---

## Concept Unit: Extracting a Pure Function to Make It Testable at All

### The Problem

Lesson 9's quantity/name validation logic lives entirely inside
`AddItemFragment`'s `saveButton` click listener — inseparable from a
real `EditText`, a real Fragment, a real Android runtime. Try to write
a JUnit test for "a blank name is rejected" as it currently exists, and
there's no method to call at all — the logic isn't a *function*, it's a
side effect buried inside a lambda.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** New file `ItemValidator.java`;
  `AddItemFragment.java` (delegates to it).
- **Change type:** Create, refactor.

### The New Code — the Extracted Logic

```java
package com.yourname.pocketinventory;

public class ItemValidator {
    static String validateName(String name) {
        if (name.trim().isEmpty()) return "Name is required";
        return null;
    }

    static Integer parseQuantity(String quantityText) {
        try {
            int quantity = Integer.parseInt(quantityText.trim());
            return quantity >= 0 ? quantity : null;
        } catch (NumberFormatException e) {
            return null;
        }
    }

    static String validateLocation(String location) {
        if (location.trim().isEmpty()) return "Location is required";
        return null;
    }
}
```

### The Updated Project

A new file — every rule here is **reappearing** logic, moved verbatim
out of Lesson 9's click listener, restructured as three small **pure
functions**: each one takes plain `String` input and returns a plain
result (`null` meaning "valid," a message meaning "invalid"; `null`
also meaning "invalid" for `parseQuantity`'s different return type),
with no `EditText`, no `Context`, no Android class involved at all.

### Mechanical Walkthrough

- `static String validateName(String name)` — reappearing logic
  (Lesson 9's `name.isEmpty()` check), `static` (Lesson 13's
  `AppDatabase.getInstance` already used `static`, first use on a
  business-logic method rather than a Singleton accessor) meaning it's
  called on the class itself, needing no `ItemValidator` instance at
  all — appropriate for a function with no state to hold between calls.
- Returning `null` for "valid," a `String` message for "invalid" —
  **first appearance of this specific convention** — a deliberately
  simple result shape avoiding a new custom result type for three tiny
  methods; worth naming as a real, debatable design choice, not a rule.
- `parseQuantity(String quantityText)` returning `Integer` (the boxed
  wrapper class, not primitive `int`) — **first appearance of using a
  boxed type specifically to represent "no valid value" via `null`** —
  a primitive `int` cannot be `null`, which is exactly why the boxed
  `Integer` is used here instead, the same reasoning Java's own
  standard library relies on throughout.
- `Integer.parseInt(quantityText.trim())` inside `try`/`catch` —
  reappearing verbatim, Lesson 9.

### Project Change — `AddItemFragment` Delegates

- **Reference Source:** No reference counterpart.
- **Files affected:** `AddItemFragment.java`.
- **Change type:** Modify.

### The New Code

```java
String nameError = ItemValidator.validateName(name);
if (nameError != null) {
    nameInput.setError(nameError);
    return;
}

Integer quantity = ItemValidator.parseQuantity(quantityText);
if (quantity == null) {
    quantityInput.setError("Enter a valid, non-negative whole number");
    return;
}

String locationError = ItemValidator.validateLocation(location);
if (locationError != null) {
    locationInput.setError(locationError);
    return;
}
```

### The Updated Project

`AddItemFragment`'s click listener shrinks from Lesson 9's inline
`if`/`try`/`catch` chain to three short calls against `ItemValidator`,
each still branching on failure exactly as before — the *behavior* is
unchanged; only *where the logic lives* moved.

### Mechanical Walkthrough

- `ItemValidator.validateName(name)` / `.parseQuantity(quantityText)` /
  `.validateLocation(location)` — calling the new pure functions,
  reappearing `if (... != null) { ...setError...; return; }` shape,
  Lesson 9.

### The New Code — Testing the Extracted Logic

```java
package com.yourname.pocketinventory;

import org.junit.Test;
import static org.junit.Assert.*;

public class ItemValidatorTest {
    @Test
    public void validateName_rejectsBlank() {
        assertNotNull(ItemValidator.validateName("   "));
    }

    @Test
    public void validateName_acceptsRealName() {
        assertNull(ItemValidator.validateName("Shop Rags"));
    }

    @Test
    public void parseQuantity_rejectsNonNumeric() {
        assertNull(ItemValidator.parseQuantity("abc"));
    }

    @Test
    public void parseQuantity_rejectsNegative() {
        assertNull(ItemValidator.parseQuantity("-3"));
    }

    @Test
    public void parseQuantity_acceptsValidNumber() {
        assertEquals(Integer.valueOf(12), ItemValidator.parseQuantity("12"));
    }
}
```

### Run It

Run this test class the same way as `ItemTest`. All five pass, in
under a second, with zero emulator involvement — real, permanent
coverage of the exact validation rules Lesson 9 built, now checkable on
every future change without ever opening the app.

### CS Lens

A function whose output depends only on its inputs, with no side
effects (no `EditText`, no logging, no database) is a **pure function**
— provably the easiest category of code to test, since a test is
nothing more than "call it, check the return value," with no setup or
teardown of any surrounding state required.

### SE Lens

**Why does this refactor matter beyond just "now it has tests" — isn't
the app's actual behavior completely unchanged?** This is the real,
often-underrated payoff of designing for testability: the *act* of
trying to write a test for the original inline version is what revealed
it wasn't separable from Android at all — the refactor wasn't optional
cleanup, it was the only way to make the logic checkable without an
emulator. This is a direct, concrete instance of a much broader
principle: code that's hard to test is very often *also* code that's
doing too many things at once (here, "validate" and "update this
specific `EditText`" were tangled together); the friction of writing a
test is frequently the earliest, cheapest signal a design is worth
splitting, well before that entanglement causes a harder problem later.

---

## Concept Unit: Mockito — Testing `ItemRepository` Without a Real Database

### The Problem

`ItemRepository`'s logic (Lesson 17) — the `loaded` guard, filtering,
`postValue` shape — is real behavior worth testing directly, but its
constructor calls `AppDatabase.getInstance(application).itemDao()`
internally, requiring a real `Application` and a real Room database to
even construct one — exactly the kind of Android-dependent
construction the previous unit's refactor specifically avoided for
`ItemValidator`.

### Commands Needed

Add to `app/build.gradle`'s `dependencies { }`:

```gradle
testImplementation 'org.mockito:mockito-core:5.8.0'
testImplementation 'androidx.arch.core:core-testing:2.2.0'
```

Sync.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `ItemRepository.java`; new file
  `app/src/test/java/.../ItemRepositoryTest.java`.
- **Change type:** Modify (add a second constructor), create.

### The New Code — Making the Dependency Injectable

```java
private final ItemDao itemDao;

ItemRepository(Application application) {
    this(AppDatabase.getInstance(application).itemDao());
}

ItemRepository(ItemDao itemDao) {
    this.itemDao = itemDao;
}
```

### The Updated Project

```java
public class ItemRepository {
    private final ItemDao itemDao;                                                  // ← unchanged
    private final ExecutorService dbExecutor = Executors.newSingleThreadExecutor();
    private final MutableLiveData<List<Item>> itemsLiveData = new MutableLiveData<>(new ArrayList<>());
    private boolean loaded = false;

    ItemRepository(Application application) {                                        // ← changed
        this(AppDatabase.getInstance(application).itemDao());                        // ← new
    }                                                                                  // ← new

    ItemRepository(ItemDao itemDao) {                                                // ← new
        this.itemDao = itemDao;                                                       // ← new
    }                                                                                  // ← new

    // getItems(), loadItems(), addItem(), deleteItem() all unchanged
}
```

Real app code (`InventoryViewModel`) keeps calling
`new ItemRepository(application)` exactly as before, with no change to
any caller — the second, package-private constructor exists purely to
give tests a way in that bypasses `AppDatabase` entirely.

### Mechanical Walkthrough

- `ItemRepository(Application application) { this(AppDatabase.getInstance(application).itemDao()); }`
  — reappearing (`this(...)` constructor chaining, Lesson 13's `Item`
  convenience constructor), now used to make the real-usage path
  delegate to a more fundamental, more directly testable one.
- `ItemRepository(ItemDao itemDao) { this.itemDao = itemDao; }` — **first
  appearance of accepting a dependency as a constructor parameter
  instead of constructing it internally** — this specific, small change
  is what **dependency injection** means in practice: the class no
  longer decides *how* to obtain its `ItemDao`; something external
  hands it one, whether that's real Room-backed code in production or,
  as built next, a fake stand-in in a test.

### The New Code — the Test, Using a Mock

```java
package com.yourname.pocketinventory;

import androidx.arch.core.executor.testing.InstantTaskExecutorRule;
import org.junit.Rule;
import org.junit.Test;
import java.util.Arrays;
import java.util.List;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import static org.junit.Assert.*;
import static org.mockito.Mockito.*;

public class ItemRepositoryTest {
    @Rule
    public InstantTaskExecutorRule instantTaskExecutorRule = new InstantTaskExecutorRule();

    @Test
    public void loadItems_publishesItemsFromDao() throws InterruptedException {
        ItemDao fakeDao = mock(ItemDao.class);
        List<Item> fakeItems = Arrays.asList(
                new Item(1, "Shop Rags", 12, "Bin 4"),
                new Item(2, "Cutting Oil", 3, "Bin 2"));
        when(fakeDao.getAll()).thenReturn(fakeItems);

        ItemRepository repository = new ItemRepository(fakeDao);

        CountDownLatch latch = new CountDownLatch(1);
        repository.getItems().observeForever(items -> {
            if (!items.isEmpty()) latch.countDown();
        });

        repository.loadItems();

        assertTrue(latch.await(2, TimeUnit.SECONDS));
        assertEquals(2, repository.getItems().getValue().size());
        verify(fakeDao, times(1)).getAll();
    }
}
```

### The Updated Project

A whole new test file — this is the first test in the project that
exercises real asynchronous, `LiveData`-publishing behavior, rather
than a plain synchronous function call.

### Mechanical Walkthrough

- `@Rule public InstantTaskExecutorRule instantTaskExecutorRule = ...`
  — **first appearance of a JUnit `@Rule`.** A `Rule` wraps every test
  method in this class with extra setup/teardown behavior —
  `InstantTaskExecutorRule` specifically forces `LiveData`'s internal
  main-thread dispatching (normally requiring a real Android main
  thread, which a plain JVM test has none of) to run synchronously,
  immediately, on the test's own thread instead.
- `mock(ItemDao.class)` — **first appearance of Mockito.** Creates a
  fake object implementing the `ItemDao` *interface* (Lesson 13) with
  no real behavior at all — every method returns a default empty
  value unless explicitly told otherwise, which is exactly what
  `when(...)` does next.
- `when(fakeDao.getAll()).thenReturn(fakeItems)` — **first appearance.**
  Configures the mock: "when `getAll()` is called on this fake, return
  this specific list" — no real Room, no real SQLite, no real disk
  access anywhere in this test.
- `new ItemRepository(fakeDao)` — reappearing (the new constructor,
  this lesson), the entire point of that refactor realized: the mock
  slots directly into the exact seam the real `Application`-based
  constructor would otherwise require.
- `new CountDownLatch(1)` — **first appearance.** A standard-library
  synchronization tool: a counter starting at `1`, and `.await(...)`
  (below) blocks the calling thread until it reaches `0` — needed here
  because `ItemRepository.loadItems()` still genuinely dispatches to
  `dbExecutor`, a real background thread (Lesson 14), even inside this
  test; the test thread must have a real way to wait for that
  asynchronous work to actually finish before making assertions.
- `repository.getItems().observeForever(items -> { if (!items.isEmpty()) latch.countDown(); })`
  — **first appearance of `observeForever`** — reappearing concept from
  Lesson 16's exercise (a `LiveData` observation with no
  `LifecycleOwner`, appropriate here since a JUnit test has no
  Android lifecycle at all to tie observation to) — the callback counts
  the latch down the moment real data arrives.
- `repository.loadItems()` — reappearing (Lesson 17), triggering the
  real method under test.
- `latch.await(2, TimeUnit.SECONDS)` — **first appearance.** Blocks up
  to two seconds for the countdown to reach zero, returning `true` if
  it did in time — `assertTrue(...)` around it fails the test outright
  if the asynchronous update never arrived at all, rather than the test
  silently passing on stale, pre-load data.
- `repository.getItems().getValue().size()` — reappearing
  (`LiveData.getValue()`, Lesson 16/21), confirming the actual
  published content.
- `verify(fakeDao, times(1)).getAll()` — **first appearance of Mockito
  verification.** Confirms `getAll()` was called on the mock exactly
  once — not just that the *result* looked right, but that
  `ItemRepository`'s `loaded` guard (Lesson 15) genuinely didn't
  trigger a redundant call within this single `loadItems()` invocation.

### Run It

Run `ItemRepositoryTest`. Real output:

```
ItemRepositoryTest > loadItems_publishesItemsFromDao PASSED
```

Temporarily change `verify(fakeDao, times(1))` to `times(2)` (a
deliberately wrong expectation) and rerun — a real, informative
Mockito failure naming the actual versus expected invocation count,
confirming the verification genuinely checks something real rather
than trivially passing. Restore `times(1)` afterward.

### CS Lens

Substituting a fake, controlled implementation of a dependency in place
of the real one is **test double substitution** — the general category
`mock(ItemDao.class)` belongs to (a *mock*, specifically, is a test
double that also records how it was called, enabling `verify(...)`).
Also recognized in: stubbed HTTP responses in place of a real server
during API client tests, in-memory fake databases substituted for a
real one, and flight simulators substituting realistic-but-controlled
sensor input for an actual aircraft during pilot training.

### SE Lens

**Why does `ItemRepository` need a second constructor at all — why not
just have Mockito mock `AppDatabase.getInstance(...)`'s static method
directly, leaving the original single constructor untouched?** Mocking
a `static` method is possible with additional Mockito tooling
(`mockito-inline`, not introduced here) but is widely considered a
last resort: it works around bad testability rather than fixing it, and
static mocking tends to be fragile and harder to reason about than a
constructor genuinely accepting its dependency. The constructor-
injection version costs exactly one small, backward-compatible addition
and produces a class that's honestly, structurally easier to test —
the same tradeoff this lesson's `ItemValidator` extraction already
made, now applied one layer up the architecture Lesson 17 built.

---

## Connect the Pieces

Full trace: `ItemTest` runs real assertions against `Item.equals()`
(Lesson 7) with zero Android involvement, on a plain JVM, in
milliseconds → `ItemValidator`, extracted from `AddItemFragment`'s
Lesson 9 logic specifically because the original inline version
couldn't be tested at all, is now covered by five fast, precise tests
→ `ItemRepository` gained a second, dependency-injecting constructor
(this lesson's real, permanent addition, not a workaround), letting
`ItemRepositoryTest` substitute a Mockito-mocked `ItemDao` for Room
entirely, using `InstantTaskExecutorRule` and a `CountDownLatch` to
correctly handle the same asynchronous `LiveData`-publishing behavior
Lesson 16 built for real production use — proving `loadItems()`'s
actual logic (call the DAO once, publish the result) without a
database, an emulator, or a single tap on a real screen.

## What Breaks Without This

Already demonstrated twice, on purpose, within this lesson: breaking
`Item.equals()` and watching `ItemTest` catch it immediately, and
inflating `ItemRepositoryTest`'s expected call count and watching
Mockito's verification fail with a precise, real message. Both were
restored immediately after observing them.

## Exercises

1. Write `ItemRepositoryTest_addItem_insertsAndPublishes`, following
   the same `mock`/`when`/`CountDownLatch`/`verify` shape, confirming
   `addItem` calls `itemDao.insert(...)` exactly once and that the
   published list afterward contains the new item.
2. Extract one more piece of inline logic — the low-stock comparison
   currently embedded directly inside `InventoryAdapter.onBindViewHolder`
   (`item.getQuantity() <= lowStockThreshold`) — into a small static
   method on a new or existing utility class, and write a JUnit test
   for it directly, with no `RecyclerView` or `ViewHolder` involved at
   all.

## Definition of Done

- [ ] `ItemTest`, `ItemValidatorTest`, and `ItemRepositoryTest` all
      exist and pass when run.
- [ ] `AddItemFragment` delegates its validation to `ItemValidator`
      instead of inline logic, with identical user-facing behavior to
      Lesson 9.
- [ ] `ItemRepository` has a real, permanent second constructor
      accepting an `ItemDao` directly, used only by tests.
- [ ] You broke `Item.equals()` and a Mockito verification count on
      purpose, saw both real, specific failures, and restored both.
- [ ] Commit: message explaining why (e.g. "Add JUnit/Mockito test
      coverage for Item, extracted ItemValidator, and ItemRepository,
      introducing constructor-based dependency injection where
      testability required it").

Lesson 31 is next: unit tests never touch a real screen at all —
Espresso, and writing an automated test that taps a real button,
navigates a real Fragment, and asserts on a real, rendered view.
