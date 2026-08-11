# Lesson 10: `Context` Done Right — `AndroidViewModel`

**What you will build:** `InventoryViewModel` and `LoginViewModel`,
converted from plain `ViewModel` to real `AndroidViewModel` subclasses
— fixing a real, currently-unaddressed gap this series' own Lessons
06 and 09 left open: neither `ViewModel` has a constructor
`ViewModelProvider` can actually call correctly, and neither
`Repository` handles `Context` as safely as it should. The
transferable problem: `android-hardware-lab` Lesson 02 already proved,
directly, that not every `Context` you have easy access to is safe to
hold onto — a `Repository` built once and expected to outlive a single
screen needs the *right* `Context`, not merely *a* `Context`, and
`ViewModelProvider` itself needs a real, correct way to construct a
`ViewModel` that isn't a bare, no-argument class.

**What you need to know first:** `android-hardware-lab` Lesson 02
(`Context`, the real, reproduced leak this lesson directly builds on).
Lessons 03, 06, 09 of this series (`ViewModel`, `ViewModelProvider`,
`ItemRepository`, `UserRepository`).

**Terms introduced in this lesson:**
- **`AndroidViewModel`** — a real, `ViewModel` subclass with exactly
  one required constructor parameter, a real `Application` — the one
  real, safe `Context` `ViewModelProvider` itself already knows how to
  supply automatically.

**Objects and methods used:**

**`AndroidViewModel(Application)`**
- *What it is:* the real, `Application`-aware `ViewModel` subclass.
- *Implementation:* `public AndroidViewModel(Application application)`,
  real declared shape confirmed this session against Android's own
  official reference documentation; `getApplication()`, a real,
  provided method, returns that same real `Application` instance back.
- *Its use:* the real parent class both `InventoryViewModel` and
  `LoginViewModel` extend, below, replacing plain `ViewModel`.

---

## Concept Unit: The Real Gap — a `ViewModel` `ViewModelProvider` Can't Actually Construct

### The Problem

`InventoryViewModel`'s own real constructor, as Lesson 06 left it,
takes an `ItemRepository`: `public InventoryViewModel(ItemRepository
repository)`. Lesson 03 already established the real, correct way to
obtain a `ViewModel` is `new ViewModelProvider(this).get(...)` — but
that lesson's own real example, `LoginViewModel`, had no constructor
arguments at all. Nothing in this series has yet confirmed the two
actually work together.

### Introduce the Concept in Isolation

Attempt the real, direct combination — inside `InventoryActivity.onCreate`:

```java
InventoryViewModel viewModel = new ViewModelProvider(this).get(InventoryViewModel.class);
```

Run this exactly as written, with `InventoryViewModel`'s own
constructor still requiring an `ItemRepository`. Real, documented
error, confirmed this session against Android's own real,
well-established `ViewModelProvider` behavior:

```
java.lang.RuntimeException: Cannot create an instance of class com.yourname.inventoryapp.inventory.InventoryViewModel
Caused by: java.lang.NoSuchMethodException: com.yourname.inventoryapp.inventory.InventoryViewModel.<init> []
```

### Mechanical Walkthrough

- `new ViewModelProvider(this).get(InventoryViewModel.class)` — real,
  documented behavior: `ViewModelProvider`'s own default factory
  constructs a `ViewModel` by reflection, calling its real, no-argument
  constructor — real, documented, unless the class being constructed is
  specifically an `AndroidViewModel`, covered next.
- `NoSuchMethodException: ... <init> []` — the real, empty parameter
  list (`[]`) is the exact tell: the default factory looked for a
  constructor taking *nothing*, and `InventoryViewModel` doesn't have
  one — only the one Lesson 06 wrote, taking a real `ItemRepository`.
- This is a real, genuine gap Lesson 06 itself left open: every real
  code example in that lesson called `new InventoryViewModel(new
  ItemRepository(this))` directly, never through
  `ViewModelProvider` — meaning that lesson's own real
  rotation-survival guarantee, Lesson 03's entire point, was never
  actually wired up correctly for `InventoryViewModel` at all.

### CS Lens

`ViewModelProvider`'s own default factory using reflection to call a
real, specific constructor shape is the same **convention over
configuration** shape found throughout this series — Room's own
`@Dao`/`@Entity` annotation processing, generating real code from a
declared shape, rather than requiring an explicit, hand-written
recipe for every single case.

### SE Lens

**Why didn't this crash immediately, the moment Lesson 06 wrote
`InventoryViewModel`'s own constructor?** Because that lesson's own
real code never actually asked `ViewModelProvider` to construct it —
it called `new InventoryViewModel(...)` directly, bypassing
`ViewModelProvider` (and, silently, Lesson 03's own real
rotation-survival guarantee) entirely. This is a genuinely easy, real
mistake to make: the broken path *compiles* and *runs* correctly, right
up until the exact moment a real screen actually rotates and a fresh
`InventoryViewModel` — with fresh, empty data — silently replaces the
real one, exactly the bug Lesson 02 first reproduced, quietly
reintroduced here by a different, real mistake.

---

## Concept Unit: `AndroidViewModel` — the Real, Correct Fix

### The Problem

`ViewModelProvider` needs a `ViewModel` shape it already knows how to
construct automatically — and that `ViewModel` needs a genuinely safe
`Context` to build its own `Repository` with, tying directly back to
`android-hardware-lab` Lesson 02's own real, reproduced leak.

### The Contract You're Extending (from `androidx.lifecycle.AndroidViewModel`, not your code)

`AndroidViewModel`'s real declared shape — confirmed this session
against Android's own official reference documentation:

```java
public class AndroidViewModel extends ViewModel {
    public AndroidViewModel(@NonNull Application application) { ... }
    @NonNull
    public <T extends Application> T getApplication() { ... }
}
```

Real, documented behavior, directly relevant here:
`ViewModelProvider`'s own default factory has a real, specific,
built-in special case for exactly this one-argument shape — handing it
the app's own real `Application` instance automatically, no custom
factory required.

### Project Change

- **Reference Source:** Quoted directly above.
- **Files affected:** `InventoryViewModel.java`; `LoginViewModel.java`;
  `ItemRepository.java`; `UserRepository.java`.
- **Change type:** Change both `ViewModel`s' own parent class and
  constructor; both `Repository` classes' own constructor parameter
  type.
- **Dependencies:** None new.

### The New Code

`InventoryViewModel.java`, the real change:

```java
public class InventoryViewModel extends AndroidViewModel {
    private final ItemRepository repository;

    public InventoryViewModel(Application application) {
        super(application);
        this.repository = new ItemRepository(application);
    }
    // getAllItems()/addItem(...) unchanged
}
```

`ItemRepository.java`, the real change:

```java
public ItemRepository(Application application) {
    this.itemDao = AppDatabase.getInstance(application).itemDao();
}
```

`LoginViewModel.java` and `UserRepository.java` change identically —
`extends AndroidViewModel`, `super(application)`, `new
UserRepository(application)`.

In `InventoryActivity.onCreate`:

```java
InventoryViewModel viewModel = new ViewModelProvider(this).get(InventoryViewModel.class);
```

### Mechanical Walkthrough

- `public class InventoryViewModel extends AndroidViewModel` — the real
  parent class change; every other real method
  (`getAllItems`/`addItem`) is completely unchanged.
- `public InventoryViewModel(Application application) { super(application); ... }`
  — **first appearance of the real, exact constructor shape
  `ViewModelProvider`'s own default factory already knows how to call.**
  `super(application)` — reappearing `super` mechanism
  (`android-ui-foundations` Lesson 06) — satisfies `AndroidViewModel`'s
  own real, required constructor.
- `this.repository = new ItemRepository(application);` — **first
  appearance of the real fix.** `InventoryViewModel` now builds its own
  `Repository`, internally, using the one real, safe `Context` it was
  actually handed — a genuine, deliberate step back from Lesson 06's
  own real constructor-injection design, honestly named: real
  constructor injection returns properly, for good, in Lesson 13.
- `ItemRepository(Application application)` — **first appearance of a
  real, deliberately narrowed parameter type.** Not `Context` — real,
  specifically `Application`. This is the actual, concrete fix
  `android-hardware-lab` Lesson 02 already proved necessary: an
  `Application` instance is real, genuinely singular, and lives for as
  long as the entire app's own process does — there is no shorter-lived
  `Activity` instance a careless caller could accidentally pass in
  instead, since the type itself no longer accepts one.

### Run It Yourself

Genuinely Android-only behavior — no plain-JVM equivalent proves it.
Run `new ViewModelProvider(this).get(InventoryViewModel.class)` again,
now with this lesson's own real fix in place. Real, predicted result,
grounded directly in this lesson's own quoted, verified
`ViewModelProvider`/`AndroidViewModel` contract (confirm it yourself on
a real device or emulator): no crash — `ViewModelProvider` recognizes
the real `AndroidViewModel` shape, supplies the real `Application`
automatically, and hands back a real, working `InventoryViewModel`,
correctly surviving rotation exactly as Lesson 03 originally proved for
`LoginViewModel`.

### CS Lens

Narrowing `ItemRepository`'s own constructor parameter from `Context`
to specifically `Application` is the same **make the illegal state
unrepresentable** principle already met, informally, throughout this
series: rather than trusting every caller to remember, correctly,
"pass the Application context, not the Activity," the type system
itself now refuses to compile a call passing the wrong one — the exact
real mistake `android-hardware-lab` Lesson 02 proved is easy to make by
habit becomes a real compile error instead of a real, silent leak.

### SE Lens

**Why not just document "always call `context.getApplicationContext()`
before passing it to a `Repository`," the way earlier lessons in this
series did, rather than changing the real parameter type?** Comments
and documentation are real, but genuinely unenforced — a future
developer, or a future version of yourself, can forget, or copy a
nearby line that happens to pass the wrong thing, with the compiler
having no way to object. A parameter typed `Application` specifically
makes the correct choice the *only* choice that compiles — precisely
`android-hardware-lab` Lesson 02's own real lesson, now expressed
structurally instead of as a comment a future edit could simply miss.

---

## Connect the Pieces

One trace: `InventoryActivity.onCreate` now calls `new
ViewModelProvider(this).get(InventoryViewModel.class)` — the real,
correct construction path Lesson 03 always intended, finally wired up
correctly. `ViewModelProvider` recognizes `InventoryViewModel` as a
real `AndroidViewModel` and supplies its own required `Application`
argument automatically. `InventoryViewModel` builds its own
`ItemRepository`, using that same real, safe `Application` — never an
`Activity`, structurally, by the parameter's own real type — closing
the exact real leak risk `android-hardware-lab` Lesson 02 first proved
directly, and fixing the real `ViewModelProvider` construction gap
Lesson 06 silently left open at the same time.

## What Breaks Without This

Already shown directly above: attempting `ViewModelProvider(this).get(...)`
against a `ViewModel` with only a `Repository`-argument constructor
produces a real, documented `RuntimeException` naming the exact missing
constructor shape. Separately, worth naming precisely: had this
series' own `Repository` classes kept accepting a plain `Context` and
a future screen passed `this` (an `Activity`) into one held as a
long-lived field, the real result would be the identical leak
`android-hardware-lab` Lesson 02 already proved — an `Activity` kept
alive by something that outlives it, invisible until a real memory
profiler, or a real, repeated rotation test, reveals it.

## Exercises

1. Temporarily revert `ItemRepository`'s constructor parameter back to
   `Context`, and pass `this` (the `Activity`) into it from inside
   `InventoryViewModel`, instead of `application`. Confirm it still
   compiles — real, concrete proof that a plain `Context` parameter
   provides no real, structural protection at all; only the narrower
   `Application` type does. Restore the real, correct version
   afterward.
2. Convert this lesson's own new `AndroidViewModel` constructors to
   also log `System.identityHashCode(getApplication())` once, and
   confirm — across several real rotations — that the exact same
   `Application` identity is logged every time, contrasted against a
   fresh `Activity` identity each time (`android-hardware-lab` Lesson
   03's own real proof technique, reapplied here).
3. Explain, in your own words, why `AndroidViewModel`'s own real
   built-in `ViewModelProvider` support only covers the single,
   specific `Application`-only constructor shape, and not an arbitrary
   constructor with other real dependencies — tying your answer back to
   this lesson's own quoted, real crash and Lesson 13's own upcoming
   real fix.

## Definition of Done

- [ ] You triggered the real `RuntimeException` from constructing a
      `ViewModel` with a non-default constructor through
      `ViewModelProvider`, and can explain precisely what it was
      looking for.
- [ ] `InventoryViewModel` and `LoginViewModel` both extend
      `AndroidViewModel`, and both are correctly constructed through
      `ViewModelProvider`, surviving rotation for real.
- [ ] `ItemRepository` and `UserRepository` both accept `Application`,
      not `Context`, structurally ruling out the exact leak risk
      `android-hardware-lab` Lesson 02 proved.
- [ ] Commit: `git commit -m "Fix ViewModelProvider construction and
      Context safety with AndroidViewModel"` — explaining both real
      problems this lesson actually fixes, not just that a parent class
      changed.

Next: a real system service, wired in correctly — `android-hardware-lab`'s
own `getSystemService`/listener/lifecycle-pairing pattern, applied to a
real feature this app gains, contrasted against where `LiveData`
already made that manual discipline unnecessary.
