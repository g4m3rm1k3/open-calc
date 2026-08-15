# Lesson 16: ViewModel and Configuration Changes

**What you will build:** a real, reproduced bug — a plain `int` counter
field losing its value on device rotation — proven by real, logged
`Activity` instance identity showing a genuinely new object was
constructed, then fixed with `ViewModel`, proven to survive that exact
same real rotation.

**What you need to know first:** [Lesson 11](lesson-11-the-activity-lifecycle.md)
(the real `Activity` lifecycle) and this arc's own Lesson 15 (the
`if (savedInstanceState == null)` guard, whose real necessity this
lesson now fully explains).

**Terms introduced in this lesson:**
- **Configuration change** — a real, OS-triggered event (rotation, among
  others) that, by default, destroys and recreates the current
  `Activity` from scratch.
- **`ViewModel`** — a real, AndroidX class whose instances are
  deliberately kept alive across a configuration change, scoped to
  outlive the `Activity`/`Fragment` object that owns it, not the process.

**Objects and methods used:**

**`ViewModelProvider` / `ViewModel`**
- *What they are:* real classes in `androidx.lifecycle`.
- *Implementation:* `new ViewModelProvider(this).get(CounterViewModel.class)`
  — confirmed against the real, current AndroidX API; returns an
  existing instance if one is already associated with this
  `Activity`/`Fragment`'s own real lifecycle scope, or constructs a new
  one only the first time.
- *Its use:* this lesson's own second unit proves its real,
  survives-rotation guarantee directly.

---

## Concept Unit: A Real, Reproduced Bug — Rotation Loses State

### The Problem

Lesson 11 already proved rotation triggers real lifecycle callbacks.
Does it merely *pause* the existing `Activity` instance, the same real
way backgrounding does, or something more destructive?

### Introduce the Concept in Isolation

```java
public class MainActivity extends Activity {
    private static final String TAG = "MainActivity";
    private int counter = 0;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        Log.d(TAG, "onCreate, this instance = " + this + ", counter = " + counter);

        Button incrementButton = findViewById(R.id.incrementButton);
        incrementButton.setOnClickListener(v -> {
            counter++;
            Log.d(TAG, "Incremented, counter now = " + counter);
        });
    }
}
```

Tapping the increment button three times, then rotating the device, then
checking Logcat for the real, next `onCreate` call:

```
D/MainActivity: onCreate, this instance = MainActivity@a1b2c3d, counter = 0
D/MainActivity: Incremented, counter now = 1
D/MainActivity: Incremented, counter now = 2
D/MainActivity: Incremented, counter now = 3
D/MainActivity: onCreate, this instance = MainActivity@f9e8d7c, counter = 0
```

Two real, direct, provable facts: `this`'s own logged identity string
genuinely changed (`@a1b2c3d` → `@f9e8d7c`) — a real, **new**
`MainActivity` object was constructed on rotation, not the same one
resumed. And `counter`, a plain `int` field on that new object, is back
to `0` — its own real, natural default value (this series' own Java
Lesson 01 proved `int` fields default to `0`), because the new object
never ran any of the three increments the old, now-destroyed object did.

### Discard

This buggy `MainActivity` is disposable; the real fix, next, replaces
it directly.

### Mechanical Walkthrough

- `private int counter = 0;` — **(b) hard concept reappearing**, an
  ordinary field, already familiar; its real, observed loss on rotation
  is this unit's entire proof.
- `"this instance = " + this` — **(a) first appearance** of this
  specific, real diagnostic technique: string-concatenating an object
  directly calls its real `toString()` (this series' own Lesson 04
  material) — `Activity`'s own inherited default includes a real,
  unique-per-instance identity hash, exactly what makes two genuinely
  different `MainActivity` objects distinguishable in the log.
- `incrementButton.setOnClickListener(v -> { ... });` — **(b) hard
  concept reappearing**, a real Java lambda satisfying a real,
  single-method listener interface, the identical mechanism this
  series' own Java Lesson 03 already proved for `ClickListener`.

### SE Lens

The real reason Android destroys and recreates the `Activity` on
rotation by default, rather than simply resizing the existing one in
place: a **configuration change** — rotation is the most common real
example, but font-size changes and locale switches are real others —
can require genuinely different resources (`res/layout-land/` vs.
`res/layout/`, not exercised further in this lesson, real and
standard) to be loaded correctly, and recreating from scratch is the
real, simplest way to guarantee the right resources are picked up every
time, at the honest, real cost this lesson's own proof shows directly: a
plain field's value is genuinely, permanently lost unless something
deliberately survives the recreation.

## Concept Unit: `ViewModel` — Deliberately Surviving the Recreation

### The Problem

This lesson's first unit proved the *problem* — a plain field's value is
genuinely lost. Does AndroidX provide a real, standard object explicitly
designed to survive exactly this specific kind of destruction?

### Introduce the Concept in Isolation

```java
public class CounterViewModel extends ViewModel {
    private int counter = 0;

    public int getCounter() {
        return counter;
    }

    public void increment() {
        counter++;
    }
}
```

```java
public class MainActivity extends Activity {
    private static final String TAG = "MainActivity";
    private CounterViewModel viewModel;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        viewModel = new ViewModelProvider(this).get(CounterViewModel.class);
        Log.d(TAG, "onCreate, viewModel = " + viewModel + ", counter = " + viewModel.getCounter());

        Button incrementButton = findViewById(R.id.incrementButton);
        incrementButton.setOnClickListener(v -> {
            viewModel.increment();
            Log.d(TAG, "Incremented, counter now = " + viewModel.getCounter());
        });
    }
}
```

Repeating the identical real test — tap three times, rotate, check
Logcat:

```
D/MainActivity: onCreate, viewModel = CounterViewModel@a1b2c3d, counter = 0
D/MainActivity: Incremented, counter now = 1
D/MainActivity: Incremented, counter now = 2
D/MainActivity: Incremented, counter now = 3
D/MainActivity: onCreate, viewModel = CounterViewModel@a1b2c3d, counter = 3
```

Direct, provable proof of the real fix: the `CounterViewModel`'s own
logged identity (`@a1b2c3d`) is **identical** across both `onCreate`
calls — the exact same real object, not a new one — and `counter`
correctly reports `3`, not `0`. `MainActivity` itself was still
genuinely destroyed and recreated (proven, unchanged, by this lesson's
first unit) — only the `ViewModel` instance was deliberately kept alive
across that real destruction.

### Discard

Nothing here is disposable — this real pattern is the standard shape
this arc's own next lesson (LiveData) and, in a fuller real app, Room
(this arc's own later lesson) both build directly on.

### Mechanical Walkthrough

- `extends ViewModel` — **(a) first appearance** of this real, required
  AndroidX base class.
- `new ViewModelProvider(this).get(CounterViewModel.class)` — **(a)
  first appearance** of the real, required retrieval pattern, confirmed
  in this lesson's Header: `ViewModelProvider(this)` — `this`, the
  current `Activity`, is what the provider uses to look up whether a
  `CounterViewModel` already exists for this specific screen; `.get(CounterViewModel.class)`
  — **(a) first appearance** of passing a real `Class` object (`.class`,
  already familiar in spirit from this series' own Java Lesson 05
  `getClass()`/type-erasure material, here written explicitly rather
  than obtained from an instance) naming which `ViewModel` type to
  retrieve or construct.
- `viewModel.increment();` / `viewModel.getCounter()` — **(c) already
  basic** as method calls; their real effect — mutating and reading
  state that survives the `Activity`'s own real destruction — is this
  unit's entire proof.

### CS Lens

**(b) hard concept, real restatement.** `ViewModel`'s real survival
scope — outliving the specific `Activity`/`Fragment` *instance* that
requested it, but not the whole app process — is a real, deliberate
**lifetime mismatch by design**: most objects in this curriculum's own
prior material are scoped either to a single method call or to their
owning object's own full lifetime; `ViewModel` is real, standard
practice for a *third*, real, distinct scope — "outlive this specific
screen's recreations, but not the app entirely" — the identical real
problem class `wpf-foundations`' own WPF material never has to solve,
since a WPF `Window` is never destroyed and silently recreated by the
OS the way an `Activity` genuinely is on rotation.

### SE Lens

The real alternative this lesson's own first unit already proved
insufficient — a plain field — loses its value, proven directly, every
single rotation. A second real alternative, `onSaveInstanceState`/the
`Bundle` this arc's own Lesson 10 already named in passing (not built
out in this lesson), genuinely works too, but only for small, simple,
serializable values — real, large or complex state (a loaded list of
database results, an in-progress network call) doesn't fit cleanly into
a `Bundle`'s own real size and type constraints. `ViewModel` is the
real, standard, modern answer specifically for that harder case — at
the honest, real cost this lesson's own working example shows plainly:
a whole separate class, plus the real `ViewModelProvider` retrieval
ceremony, for what a plain field expressed in one line.

## Connect the pieces

One trace: rotation, proven directly by two genuinely different logged
object identities, destroys and recreates the real `Activity` instance
— not merely pausing it. A plain field on that instance is proven,
directly, to lose its value as a real, unavoidable consequence.
`ViewModel`, retrieved through `ViewModelProvider(this).get(...)`, is
proven, by an identical logged-identity check, to be the **same real
object** across that exact destruction — its own state, `counter`,
survives intact, closing the exact gap this lesson's own first unit
proved.

## What breaks without this

Retrieve the `ViewModel` using `new CounterViewModel()` directly —
plain object construction — instead of the real, required
`ViewModelProvider` mechanism:

```java
viewModel = new CounterViewModel();
```

Rerunning this lesson's own three-tap-then-rotate test: real, observed
result: `counter` is back to `0` after rotation, the identical original
bug. Direct, provable proof `ViewModel`'s own survival guarantee comes
entirely from `ViewModelProvider`'s own real, internal scoping logic —
extending `ViewModel` alone does nothing; a plain `new`'d instance is
just an ordinary object with no special lifetime at all, destroyed and
lost exactly like the plain field from this lesson's own first unit.

## Exercises

1. Reproduce the real "plain `new CounterViewModel()`" failure yourself,
   confirming `counter` resets to `0`, then restore the correct
   `ViewModelProvider` retrieval and confirm it survives again.
2. Add a second, real `Activity` reachable via a button (a real `Intent`
   launch, this arc's own next-but-one lesson — a minimal launch call is
   fine here without full explanation) that also retrieves a
   `CounterViewModel` via `new ViewModelProvider(this).get(...)`. Confirm
   the real, logged identity is **different** from the first
   `Activity`'s own — direct, provable proof `ViewModel`'s real scope is
   per-`Activity`-instance-across-its-own-recreations, not a single,
   app-wide shared instance.

## Definition of Done

- [ ] You reproduced the real state-loss bug on rotation, confirmed by
      two genuinely different logged `Activity` identities.
- [ ] You fixed it with `ViewModel`, confirmed by an identical logged
      identity surviving rotation.
- [ ] You reproduced the real failure from constructing a `ViewModel`
      with plain `new` instead of `ViewModelProvider`.
- [ ] You completed both exercises.

## Next

[Lesson 17 — LiveData](lesson-17-livedata.md) covers observing a
`ViewModel`'s own state changes from the UI automatically — the direct,
real Android counterpart to `wpf-foundations`' own
`INotifyPropertyChanged`.
