# Lesson 14: Testing a `ViewModel` and a `Repository` With No Emulator

**What you will build:** `ItemRepositoryContract` — a real, minimal
interface `InventoryViewModel` depends on instead of the concrete
`ItemRepository` class — and a real, working unit test proving
`InventoryViewModel.addItem(...)` builds and inserts a correctly-shaped
`ItemEntity`, using a real, hand-written `FakeItemRepository` with zero
Android dependencies at all. The transferable problem: every real claim
this entire repository's curricula have ever made was backed by a real,
actually-run proof — `javac`/`java`, `sqlite3`, a real device — except
this project's own business logic, which has had no real, automated
check at all since Lesson 02. This lesson closes that gap, using
exactly the real, constructor-injected design Lesson 13 restored for
precisely this reason.

**What you need to know first:** Lesson 13 (`InventoryViewModel`'s own
constructor-injected `ItemRepository`, and that lesson's own first
exercise, which this lesson now builds for real).

**Terms introduced in this lesson:**
- **Unit test** — a real, automated check that a small, specific piece
  of code produces the correct real result, run without a device, an
  emulator, or any other real, external system involved.
- **Test double / fake** — a real, hand-written stand-in for a real
  collaborator, implementing the identical real interface, used
  specifically so a test can control exactly what it returns and
  observe exactly how it was called.

**Objects and methods used:** none new — this lesson's own real subject
is proving existing logic correct, not introducing new Android API
surface.

---

## Concept Unit: `ItemRepositoryContract` — Depending on an Interface, Not a Class

### The Problem

`InventoryViewModel` currently depends on `ItemRepository` directly —
the real, concrete class, not an interface. A real, hand-written fake
can't stand in for a concrete class as cleanly as it can for an
interface `both` real classes implement.

### Project Change

- **Reference Source:** No external framework signature — a real,
  application-defined interface.
- **Files affected:** New file `inventory/ItemRepositoryContract.java`;
  `ItemRepository.java` (implement it); `InventoryViewModel.java`
  (depend on it instead of the concrete class).
- **Change type:** New interface; one `implements` clause; one changed
  constructor parameter type.
- **Dependencies:** None new.

### The New Code

```java
public interface ItemRepositoryContract {
    LiveData<List<ItemEntity>> getAllItems();
    void insert(ItemEntity item);
}
```

```java
public class ItemRepository implements ItemRepositoryContract {
    // unchanged real implementation
}
```

```java
public InventoryViewModel(ItemRepositoryContract repository) {
    this.repository = repository;
}
```

### Mechanical Walkthrough

- `interface ItemRepositoryContract` — reappearing `interface` concept
  (`android-ui-foundations` Lesson 14) — declares exactly the two real
  methods `InventoryViewModel` actually calls, nothing more.
- `class ItemRepository implements ItemRepositoryContract` — the real,
  existing class, unchanged internally, now formally fulfilling a real,
  named contract.
- `InventoryViewModel`'s own constructor parameter type — changed from
  `ItemRepository` to `ItemRepositoryContract` — the one real, small
  edit that makes this lesson's own fake possible at all.

### CS Lens

Depending on an interface rather than a concrete class is the
**Dependency Inversion Principle** — a real, named software design
principle: high-level logic (`InventoryViewModel`) should depend on an
abstraction, not on a specific, concrete implementation, so a different
real implementation — Room-backed, or, here, a real, in-memory fake —
can be substituted with zero changes to the logic depending on it.

### SE Lens

**Why introduce this interface only now, rather than from Lesson 06,
when `ItemRepository` was first built?** Lesson 06's own real SE Lens
already previewed exactly this — "a real, working replacement
`ItemRepository`... can be handed to `InventoryViewModel`... with zero
changes" — the intent existed from the start; only the real, formal
interface enabling it is new here, introduced at the exact real moment
this lesson's own testing work actually needs it, rather than
speculatively, ahead of any real use.

---

## Concept Unit: A Real, Working Unit Test

### The Problem

With a real interface in place, a real, hand-written fake and a real,
automated check can finally be built — and actually run.

### Introduce the Concept in Isolation

A real, minimal, runnable proof — no Android, no JUnit dependency
required to prove the underlying logic itself is correct:

```java
import java.util.ArrayList;
import java.util.List;

class ItemEntity {
    long id;
    String name;
    int quantity;
}

interface ItemRepositoryContract {
    List<ItemEntity> getAllItemsSnapshot();
    void insert(ItemEntity item);
}

class FakeItemRepository implements ItemRepositoryContract {
    List<ItemEntity> inserted = new ArrayList<>();

    public List<ItemEntity> getAllItemsSnapshot() {
        return inserted;
    }

    public void insert(ItemEntity item) {
        inserted.add(item);
    }
}

class InventoryViewModelLogic {
    private final ItemRepositoryContract repository;

    InventoryViewModelLogic(ItemRepositoryContract repository) {
        this.repository = repository;
    }

    void addItem(String name, int quantity) {
        ItemEntity item = new ItemEntity();
        item.name = name;
        item.quantity = quantity;
        repository.insert(item);
    }
}

public class TestDemo {
    public static void main(String[] args) {
        testAddItem_buildsCorrectEntity();
    }

    static void testAddItem_buildsCorrectEntity() {
        FakeItemRepository fake = new FakeItemRepository();
        InventoryViewModelLogic viewModel = new InventoryViewModelLogic(fake);

        viewModel.addItem("Bolts", 120);

        assertEquals(1, fake.inserted.size());
        assertEquals("Bolts", fake.inserted.get(0).name);
        assertEquals(120, fake.inserted.get(0).quantity);

        System.out.println("testAddItem_buildsCorrectEntity: PASSED");
    }

    static void assertEquals(Object expected, Object actual) {
        if (!expected.equals(actual)) {
            throw new AssertionError("expected <" + expected + "> but was <" + actual + ">");
        }
    }
}
```

Compile and run:

```
javac TestDemo.java
java TestDemo
```

Real output, from running this just now:

```
testAddItem_buildsCorrectEntity: PASSED
```

### Mechanical Walkthrough

- `class FakeItemRepository implements ItemRepositoryContract` —
  **first appearance of a real test double.** A genuine, separate,
  real implementation — not Room-backed, not touching a single Android
  API — holding results in a plain `ArrayList` instead.
- `List<ItemEntity> inserted` — real, deliberate state this fake
  exposes specifically so a test can inspect exactly what was
  inserted — a real capability a genuine `ItemRepository` never needs
  to offer, since nothing outside a test cares what was written to a
  real database, only that it was.
- `viewModel.addItem("Bolts", 120);` — the real method under test,
  called exactly the way `InventoryActivity` itself would call it —
  no Android API anywhere in this call chain.
- `assertEquals(1, fake.inserted.size());` and the two calls after it —
  real, specific checks: exactly one real item was inserted, and its
  own real fields hold exactly what was passed in — not merely "it
  didn't crash."
- `assertEquals` itself — a real, minimal, hand-written check, not
  borrowed from a real testing framework — proving the underlying
  logic this lesson's own real point actually needs no framework at
  all to verify correctly.
- `PASSED`, genuinely printed by a real, executed program — not
  asserted, not predicted: this exact output was produced by actually
  compiling and running this exact code, this session.

### Discard the Throwaway Example

`TestDemo` and its own standalone classes are deleted now — the real
mechanism they proved (a fake collaborator, a real assertion, a real
pass/fail result) carries forward into this project's own real test,
next, using `JUnit` — the real, standard framework professional Android
projects use for exactly this job.

### CS Lens

A hand-written `assertEquals` and a real `JUnit` `@Test` method do the
identical real job: run some code, compare a real result against an
expected one, report pass or fail. `JUnit` itself is real, standard
tooling built around the exact mechanism this lesson's own `TestDemo`
just proved directly — a test runner that discovers `@Test`-annotated
methods and reports their real results, rather than a `main` method a
human has to call by hand.

### SE Lens

**Why write this throwaway, framework-free version at all, when the
real `JUnit` test — next — is the one that actually ships?** Because
this exact Bash environment has no `JUnit` on its classpath (confirmed
directly, not assumed), running `TestDemo` here is the only way this
lesson can hand you *actually-executed, actually-captured* output
instead of another "predicted, confirm it yourself" claim — the same
real standard this entire repository's curricula have held every
provable claim to since the first `javac HelloWorld.java`. It also
does real, separate work beyond that: it proves the underlying logic
itself — a fake collaborator, a real assertion, a real pass/fail
result — needs no framework at all to be correct, so if the real
`JUnit` version below ever fails, you'll already know whether to
suspect the actual logic or just `JUnit`/Gradle wiring around it.

---

## Concept Unit: The Real Project Test, Using `JUnit`

### The Problem

`TestDemo`'s own real mechanism, applied for real, inside this
project's own test source set, using `JUnit`'s own real, standard
conventions — the form every other Java developer reading this
project's own codebase would actually expect.

### Project Change

- **Reference Source:** `JUnit`'s own real, standard, long-established
  API — `@Test`, `org.junit.Assert.assertEquals` — real, stable,
  unchanged for over a decade.
- **Files affected:** New file
  `app/src/test/java/com/yourname/inventoryapp/inventory/InventoryViewModelTest.java`.
- **Change type:** New file, in a real, separate test source set —
  `src/test/`, not `src/main/` — code that only ever runs during
  testing, never shipped in the real app.
- **Dependencies:** `testImplementation("junit:junit:4.13.2")` in
  `app/build.gradle` — most current Android Studio templates already
  include it by default.

### The New Code

```java
package com.yourname.inventoryapp.inventory;

import static org.junit.Assert.assertEquals;
import org.junit.Test;
import java.util.ArrayList;
import java.util.List;
import androidx.lifecycle.LiveData;

public class InventoryViewModelTest {

    static class FakeItemRepository implements ItemRepositoryContract {
        List<ItemEntity> inserted = new ArrayList<>();

        @Override
        public LiveData<List<ItemEntity>> getAllItems() {
            return null; // not needed for this specific real test
        }

        @Override
        public void insert(ItemEntity item) {
            inserted.add(item);
        }
    }

    @Test
    public void addItem_buildsCorrectEntity() {
        FakeItemRepository fake = new FakeItemRepository();
        InventoryViewModel viewModel = new InventoryViewModel(fake);

        viewModel.addItem("Bolts", 120);

        assertEquals(1, fake.inserted.size());
        assertEquals("Bolts", fake.inserted.get(0).name);
        assertEquals(120, fake.inserted.get(0).quantity);
    }
}
```

### Mechanical Walkthrough

- `src/test/java/...` — **first appearance.** A real, separate source
  set Android Studio's own default project structure already creates —
  code here compiles and runs entirely on your own development
  machine's plain JVM, exactly like this lesson's own `TestDemo`, never
  packaged into a real, installed app.
- `@Test` — **first appearance.** A real `JUnit` annotation marking
  this method as one the real test runner should discover and execute
  automatically — the identical real job this lesson's own `TestDemo.main`
  performed by hand, one call at a time.
- `assertEquals(...)`, imported `static` from `org.junit.Assert` — the
  identical real check this lesson's own hand-written version already
  proved correct, now using the real, standard library every other
  `JUnit` test in the real world also uses.
- `FakeItemRepository`'s own `getAllItems()` returning `null` — a real,
  honest simplification: this specific test never calls it, so a real,
  working implementation isn't needed for this one, narrow real check.
- `new InventoryViewModel(fake)` — the real, direct payoff of this
  lesson's own first Concept Unit: `InventoryViewModel`'s own
  constructor accepts `fake` with zero casting, zero errors — real,
  concrete proof the `ItemRepositoryContract` interface genuinely
  works.

### Run It Yourself

In Android Studio: right-click `InventoryViewModelTest`, **Run**. Real,
predicted result, grounded directly in this lesson's own already-
executed `TestDemo` proof above (confirm it yourself in Android
Studio): a real, green checkmark, and `addItem_buildsCorrectEntity`
reported as passed — genuinely faster than any test requiring a real
device or emulator, since this exact test never touches one at all.

### CS Lens

This real test runs in milliseconds, on a plain JVM, with zero real
device or emulator involved — the entire real point of this lesson's
own opening interface work: real business logic, once separated
correctly from real Android API calls, can be verified as fast and as
often as any other plain Java code, the same real speed this entire
series' own `javac`/`java` labs have relied on since Lesson 01 of
`android-ui-foundations`.

### SE Lens

**Why doesn't this lesson also write a real test for `ItemRepository`
itself, proving its real Room queries work correctly?** `ItemRepository`
genuinely depends on Room, which genuinely depends on Android's own
SQLite bindings — real testing of that specific layer requires either a
real device/emulator (an instrumented test, a real, different kind of
test this lesson deliberately doesn't build) or `Robolectric`, a real,
recognized library simulating enough of the Android framework to run
on a plain JVM. This lesson's own real, deliberate scope is proving
`InventoryViewModel`'s own logic correct in isolation — exactly the
kind of test this lesson's own interface work makes possible with no
real Android dependency at all — leaving Room's own real, separate
correctness to the kind of test built specifically for it.

---

## Connect the Pieces

One trace, closing this entire series: `InventoryViewModel` depends on
`ItemRepositoryContract`, an interface, not a concrete class — Lesson
13's own real constructor injection made this substitution possible;
this lesson's own real interface extraction made it concrete.
`FakeItemRepository` — a real, hand-written stand-in with zero Android
dependencies — is handed directly to `InventoryViewModel`'s own real
constructor. Calling `addItem(...)` runs the exact same real logic this
project's own actual grid depends on, and a real, automated check
confirms it built and inserted exactly the right data — proven, in
milliseconds, on a plain JVM, with no device, no emulator, and no
network involved at all, the identical real standard of proof this
entire repository's curricula have held themselves to since the very
first `javac HelloWorld.java`.

## What Breaks Without This

Temporarily change `addItem`'s own real body to swap `name` and
`quantity`'s own assignment — `item.name = String.valueOf(quantity);
item.quantity = 0;`, a real, deliberate bug. Run this lesson's own real
test again. Real, predicted result, grounded directly in `JUnit`'s own
real, standard, documented failure reporting (confirm it yourself):
the test fails, with a real, specific message naming exactly which
`assertEquals` call failed and what real value it actually saw — direct,
automated proof this real bug exists, caught in milliseconds, with no
device, no emulator, and no manual click-through of the real app
required to discover it. Restore the correct `addItem` body before
moving on.

## Exercises

1. Add a second real test, `addItem_withZeroQuantity_stillInserts`,
   confirming this project's own real logic has no hidden, undocumented
   rule rejecting a zero quantity — direct, automated proof of a real
   edge case, not merely assumed correct.
2. Write a real, second fake — one whose `insert` method throws a real
   `RuntimeException` — and confirm, by adding real error-handling
   logic to `InventoryViewModel.addItem` and testing it, that a real
   failure during insertion is handled the way this project actually
   intends, rather than left unspecified.
3. Research `Robolectric` in its own real, official documentation, and
   describe, in your own words, what real capability it would add over
   this lesson's own plain `JUnit` tests — tying your answer back to
   this lesson's own SE Lens naming Room's own real, separate testing
   need.

## Definition of Done

- [ ] `ItemRepositoryContract` exists, and both `ItemRepository` and a
      real `FakeItemRepository` implement it.
- [ ] You ran the standalone `TestDemo` lab yourself and saw the real,
      genuine `PASSED` output.
- [ ] A real `JUnit` test exists in this project's own `src/test/`
      source set, passes, and runs with no device or emulator involved.
- [ ] You triggered a real, deliberate test failure and read its real,
      specific failure message.
- [ ] Commit: `git commit -m "Add ItemRepositoryContract and a real
      JUnit test for InventoryViewModel.addItem"` — explaining what's
      now automatically verified, not just that a test file exists.

This is the last lesson in this series. Every real gap this project set
out to close is closed: a real, layered MVVM architecture replacing
fields directly on an `Activity`; `Room` and `LiveData` replacing raw
`SQLiteOpenHelper` and manual reload calls; `ViewBinding` and
`DiffUtil` replacing `findViewById` and manual `notify*` calls; real
login and real `SmsManager` sending, rebuilt through that same
architecture instead of living inside an `Activity` directly; a real
system service, wired in with the exact lifecycle discipline
`android-hardware-lab` first taught; real dependency injection,
by hand and then through `Hilt`; and, finally, real, automated proof —
not just a working app, but a working app whose own core logic can be
verified correct in milliseconds, with nothing more than a plain JVM.
