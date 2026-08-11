# Lesson 13: Dependency Injection — Manual First, Then `Hilt`

**What you will build:** `InventoryViewModel`, moved back to a plain
`ViewModel` with a real, constructor-injected `ItemRepository` —
restoring Lesson 06's own original, testable design — paired with a
real, hand-written `ViewModelProvider.Factory` that safely builds that
`Repository` using `Application`, closing Lesson 10's own real
`Context`-safety fix at the same time. Then: `Hilt`, the real,
professional framework that generates the identical real `Factory`
code automatically, from a handful of annotations. The transferable
problem: Lesson 10's own real fix — a `ViewModel` building its own
`Repository` internally — genuinely solved two real problems
(`ViewModelProvider` construction, `Context` safety), but reopened one
Lesson 06 already named directly: a `ViewModel` that builds its own
collaborator can no longer be handed a fake one for testing.

**What you need to know first:** Lesson 06 (`Repository`, the real,
stated testing rationale for constructor injection). Lesson 10
(`AndroidViewModel`, the real `ViewModelProvider` construction problem
it fixed).

**Terms introduced in this lesson:**
- **`ViewModelProvider.Factory`** — a real, provided interface;
  implementing it tells `ViewModelProvider` exactly how to construct a
  `ViewModel` it doesn't already know how to build automatically.
- **`Hilt`** — a real, official Android dependency injection library,
  generating real factory code — the same real shape this lesson
  writes by hand first — from annotations instead.
- **`@Module` / `@Provides`** — a real `Hilt`/`Dagger` annotation pair
  telling `Hilt` how to build a real object that can't be constructed
  with a bare `@Inject` constructor alone — `AppDatabase`, needing a
  real `Room.databaseBuilder(...)` call, is exactly this case.

**Objects and methods used:**

**`ViewModelProvider.Factory`**
- *What it is:* the real interface `ViewModelProvider` itself already
  relies on internally, even for the default, automatic cases this
  series has used since Lesson 03.
- *Implementation:* `public <T extends ViewModel> T create(Class<T>
  modelClass)`, real declared shape confirmed this session against
  real, current Android usage — a real, standard `isAssignableFrom`
  check identifies which real `ViewModel` is being requested.
- *Its use:* implemented once, by `InventoryViewModelFactory` below,
  supplying the exact real construction logic `ViewModelProvider`'s own
  default factory can't infer on its own.

---

## Concept Unit: The Real Tension Lesson 10 Reopened

### The Problem

Lesson 06's own real, stated reason for `ItemRepository` being handed
to `InventoryViewModel`'s constructor, rather than built inside it: "a
real, working replacement `ItemRepository`... can be handed to
`InventoryViewModel` in a test with zero changes to
`InventoryViewModel` itself." Lesson 10's own real fix —
`InventoryViewModel` building its own `ItemRepository` internally,
inside an `AndroidViewModel` constructor — makes that exact real
substitution impossible again: nothing outside `InventoryViewModel`
can hand it a different, fake `Repository` anymore, since it never
receives one at all.

### Mechanical Walkthrough

- Lesson 06's own real shape — `public InventoryViewModel(ItemRepository
  repository)` — a real parameter, real substitution possible: a test
  can construct `new InventoryViewModel(fakeRepository)` directly.
- Lesson 10's own real shape — `public InventoryViewModel(Application
  application) { ...; this.repository = new ItemRepository(application); }`
  — no real parameter for `ItemRepository` at all; the real object is
  built *inside* the constructor, unreachable from outside it.
- Neither shape is wrong on its own — each real lesson fixed a real,
  different problem; this unit's own real point is that fixing one
  reopened the other.

### CS Lens

This is a real, genuine tension between two real, legitimate goals:
`ViewModelProvider` needs to know how to *construct* a `ViewModel`
automatically, and a `ViewModel` needs to *receive* its real
collaborators from outside, not build them itself, to stay genuinely
testable. Neither goal is wrong; satisfying both at once is exactly
what a real `Factory` exists to do.

### SE Lens

**Could this project just accept Lesson 10's own tradeoff — `Context`
safety and correct construction, at the real cost of testability —
rather than adding a third real mechanism?** For a small, real project,
possibly; this series' own Lesson 14 has a real, concrete need
(testing `ViewModel`/`Repository` logic with no emulator) that
specifically requires the substitution Lesson 06 originally designed
for. Fixing this now, honestly, rather than silently living with the
tradeoff, is what makes Lesson 14's own real testing work possible at
all.

---

## Concept Unit: A Real, Hand-Written `Factory`

### The Problem

`ViewModelProvider` needs a real, explicit recipe: given a request for
`InventoryViewModel`, build a real `ItemRepository` (safely, using
`Application`, per Lesson 10) and pass it to `InventoryViewModel`'s own
constructor.

### Project Change

- **Reference Source:** `ViewModelProvider.Factory`'s real interface
  shape, already quoted above.
- **Files affected:** `InventoryViewModel.java` (back to a plain
  `ViewModel`, constructor-injected); new file
  `inventory/InventoryViewModelFactory.java`;
  `InventoryActivity.java`.
- **Change type:** Revert one constructor; add one new class; change
  one `ViewModelProvider` call.
- **Dependencies:** None new.

### The New Code

`InventoryViewModel.java`, reverted:

```java
public class InventoryViewModel extends ViewModel {
    private final ItemRepository repository;

    public InventoryViewModel(ItemRepository repository) {
        this.repository = repository;
    }
    // getAllItems()/addItem(...) unchanged
}
```

`InventoryViewModelFactory.java`:

```java
package com.yourname.inventoryapp.inventory;

import android.app.Application;
import androidx.annotation.NonNull;
import androidx.lifecycle.ViewModel;
import androidx.lifecycle.ViewModelProvider;

public class InventoryViewModelFactory implements ViewModelProvider.Factory {
    private final Application application;

    public InventoryViewModelFactory(Application application) {
        this.application = application;
    }

    @NonNull
    @Override
    @SuppressWarnings("unchecked")
    public <T extends ViewModel> T create(@NonNull Class<T> modelClass) {
        if (modelClass.isAssignableFrom(InventoryViewModel.class)) {
            return (T) new InventoryViewModel(new ItemRepository(application));
        }
        throw new IllegalArgumentException("Unknown ViewModel class: " + modelClass);
    }
}
```

`InventoryActivity.java`, the real change:

```java
InventoryViewModel viewModel = new ViewModelProvider(this,
    new InventoryViewModelFactory(getApplication())).get(InventoryViewModel.class);
```

### Mechanical Walkthrough

- `InventoryViewModel(ItemRepository repository)` — reverted, real
  constructor injection restored — identical to Lesson 06's own
  original design.
- `class InventoryViewModelFactory implements ViewModelProvider.Factory`
  — **first appearance.** A real, separate class whose entire job is
  real construction logic — nothing about `InventoryViewModel` itself
  needs to know how it gets built.
- `public <T extends ViewModel> T create(@NonNull Class<T> modelClass)`
  — fulfilling the real, quoted contract; `modelClass.isAssignableFrom(InventoryViewModel.class)`
  — the real, standard check confirming which real `ViewModel` is being
  requested, since one `Factory` can, in principle, build more than
  one.
- `new ItemRepository(application)` — the identical real, safe
  construction Lesson 10 already established — now happening inside
  the `Factory`, not inside the `ViewModel` itself.
- `throw new IllegalArgumentException(...)` — real, defensive coverage
  for a real `ViewModel` class this `Factory` was never told how to
  build — a real, correct failure mode, not a silent, wrong guess.
- `new ViewModelProvider(this, new InventoryViewModelFactory(getApplication()))`
  — **first appearance of `ViewModelProvider`'s real, two-argument
  constructor.** The second argument — a real `Factory` — is what
  `ViewModelProvider` actually uses to construct
  `InventoryViewModel`, instead of its own, more limited default.

### CS Lens

A `Factory` object, handed to `ViewModelProvider` from outside, is the
same **Inversion of Control** idea this entire repository's curricula
have traced repeatedly (`android-ui-foundations` Lesson 07 and
onward) — `ViewModelProvider` itself doesn't need to know *how* to
build every possible `ViewModel`; it only needs to know *who* to ask.

### SE Lens

**Why does `InventoryViewModelFactory` take `Application` in its own
constructor, rather than reaching for a static, global instance the
way `AppDatabase.getInstance(...)` does?** `InventoryActivity` already
has a genuinely safe `Application` reference available —
`getApplication()`, inherited from `Activity` — and handing it
explicitly into the `Factory` at the exact point it's constructed keeps
every real dependency this `Factory` needs visible in one place, at one
call site, rather than reached for silently from inside. This is the
same real, deliberate explicitness constructor injection has favored
throughout this lesson, applied one level higher, to the `Factory`
itself.

---

## Concept Unit: `Hilt` — the Real, Professional Automation

### The Problem

`InventoryViewModelFactory` is real, correct, and genuinely
repetitive — every future `ViewModel` this project ever adds needs an
almost-identical real `Factory` class, hand-written, every time.

### The Real Alternative, Shown for Real

```java
// Application class, real Gradle plugin required — see below
@HiltAndroidApp
public class InventoryApplication extends Application { }

// AppDatabase's own real dependencies, provided once
@Module
@InstallIn(SingletonComponent.class)
public class DatabaseModule {
    @Provides
    @Singleton
    public AppDatabase provideAppDatabase(Application application) {
        return Room.databaseBuilder(application, AppDatabase.class, "app-database").build();
    }

    @Provides
    public ItemDao provideItemDao(AppDatabase database) {
        return database.itemDao();
    }
}

// ItemRepository, now real-Hilt-constructible
public class ItemRepository {
    private final ItemDao itemDao;

    @Inject
    public ItemRepository(ItemDao itemDao) {
        this.itemDao = itemDao;
    }
    // getAllItems()/insert(...) unchanged
}

// InventoryViewModel, real-Hilt-constructible, no hand-written Factory anywhere
@HiltViewModel
public class InventoryViewModel extends ViewModel {
    private final ItemRepository repository;

    @Inject
    public InventoryViewModel(ItemRepository repository) {
        this.repository = repository;
    }
    // unchanged
}

// InventoryActivity
@AndroidEntryPoint
public class InventoryActivity extends AppCompatActivity {
    // the exact same real call as Lesson 03 originally used —
    // no Factory passed in at all
    InventoryViewModel viewModel = new ViewModelProvider(this).get(InventoryViewModel.class);
}
```

### The Tradeoff

`Hilt` requires a real Gradle plugin
(`id("com.google.dagger.hilt.android")`) and a real annotation
processor, confirmed this session against Hilt's own current official
documentation — a real, one-time setup cost this lesson's own manual
`Factory` never needed. In exchange, every future `ViewModel` or
`Repository` this project adds needs only `@Inject` on its own real
constructor — no hand-written `Factory` class, ever, for any of them.

**This lesson shows both, deliberately, rather than choosing one**:
the manual `Factory` proves the real mechanism `Hilt` itself is
automating — real code you can read, in full, in one file — before
trusting a framework to generate the equivalent automatically, the
same "manual first, generated second" order this entire series has
followed since Lesson 07's own `ViewBinding`.

### Mechanical Walkthrough

- `@HiltAndroidApp` on a real `Application` subclass — **first
  appearance.** Generates `Hilt`'s own real, top-level dependency
  container, attached to the app's own process lifetime — the real
  starting point every other `Hilt` annotation ultimately depends on.
- `@Module` / `@InstallIn(SingletonComponent.class)` / `@Provides` —
  **first appearance.** The real, declarative replacement for this
  lesson's own hand-written `AppDatabase.getInstance(...)` singleton
  logic (Lesson 04) — `@Provides` methods tell `Hilt` exactly how to
  build something it can't construct with a bare `@Inject` constructor
  alone (`AppDatabase` needs `Room.databaseBuilder(...)`, not a plain
  `new`).
- `@Inject` on `ItemRepository`'s own constructor — the real,
  annotation-only equivalent of this lesson's own hand-written
  `InventoryViewModelFactory`, telling `Hilt` this class can be built
  automatically once its own real dependency (`ItemDao`, itself
  `@Provides`-supplied) is available.
- `@HiltViewModel` plus `@Inject` on `InventoryViewModel`'s own
  constructor — the real, direct replacement for this lesson's own
  hand-written `Factory` class entirely — no `create(Class<T>)` method,
  no `isAssignableFrom` check, anywhere.
- `@AndroidEntryPoint` on `InventoryActivity` — **first appearance.**
  Marks this `Activity` as one `Hilt` itself can inject into — the real
  prerequisite that makes the plain, one-argument
  `new ViewModelProvider(this).get(InventoryViewModel.class)` call
  work correctly again, with `Hilt` supplying the real `Factory`
  automatically, behind the scenes.

### CS Lens

`Hilt`'s own real annotations — `@Inject`, `@Provides`, `@Module` —
are a real, declarative description of a dependency graph: *what* each
class needs, and *how* to build each real thing that isn't
constructible on its own (`AppDatabase`, needing a real `Application`)
— the identical **declare the shape, generate the code** pattern Room's
own `@Entity`/`@Dao` annotations already used (Lesson 04), applied here
to object construction instead of database access.

### SE Lens

**Given `Hilt` does the identical real job this lesson's own manual
`Factory` already does correctly, is the manual version now
pointless?** No — real, direct value in having built it by hand once:
understanding precisely what `Hilt` is generating, and why, is what
turns a `Hilt`-related build error, later, from an opaque framework
failure into a real, traceable problem in a real, understood mechanism
— the same real payoff this entire series has claimed for every
"manual first" lesson since it began.

---

## Connect the Pieces

One trace: `InventoryViewModel` returns to real constructor injection,
exactly as Lesson 06 originally designed it. A real, hand-written
`InventoryViewModelFactory` — implementing the real
`ViewModelProvider.Factory` interface every `ViewModel` construction in
this series has secretly relied on since Lesson 03 — supplies
`ViewModelProvider` with the exact real recipe it needs: build a real,
safe `ItemRepository` using `Application` (Lesson 10's own fix, still
honored), then hand it to `InventoryViewModel`'s own constructor.
`Hilt`, shown last, generates the identical real shape from a handful
of annotations — the same real mechanism, automated, once its own real
cost (Gradle setup, annotation processing) is worth paying.

## What Breaks Without This

Skip registering `InventoryViewModel` inside a real `Factory`'s own
`create` method — call `ViewModelProvider(this,
new InventoryViewModelFactory(getApplication())).get(SomeOtherViewModel.class)`
instead, a real class this `Factory` was never told how to build. Real,
documented result: the real, thrown `IllegalArgumentException` this
lesson's own code deliberately included, naming the exact unknown class
— a real, correct failure, not a silent, wrong guess at what to
construct.

## Exercises

1. Write a fake `ItemRepository` — same real public method signatures
   as the real one, returning fixed, hardcoded `LiveData` instead of
   reading from Room — and confirm `InventoryViewModel`'s own
   constructor accepts it directly, with zero changes to
   `InventoryViewModel` itself. This is Lesson 14's own real starting
   point.
2. Add a second, real `ViewModel` this project doesn't have yet (a
   `ReportsViewModel`, say) to the same `InventoryViewModelFactory`,
   confirming one real `Factory` can correctly build more than one real
   `ViewModel` class.
3. Explain, in your own words, what real, concrete problem `@Inject`
   on a constructor solves that a plain, unannotated constructor
   doesn't — tying your answer back to this lesson's own real,
   hand-written `Factory`'s own `create` method doing exactly that job
   by hand.

## Definition of Done

- [ ] `InventoryViewModel` accepts a real, constructor-injected
      `ItemRepository` again, and `InventoryViewModelFactory` supplies
      it safely through `ViewModelProvider`.
- [ ] You triggered the real `IllegalArgumentException` from requesting
      an unregistered `ViewModel` class through the real `Factory`.
- [ ] You can explain, precisely, what real problem `Hilt` automates
      that this lesson's own manual `Factory` already solved by hand.
- [ ] Commit: `git commit -m "Restore constructor-injected Repository
      via a real ViewModelProvider.Factory"` — explaining the real
      testability this restores, not just that a class moved.

Next, and last: testing `InventoryViewModel` and `ItemRepository`, with
a real, fake `Repository` this lesson's own real constructor injection
just made possible — no emulator, no device, required at all.
