# Lesson 17: LiveData

**What you will build:** a real, reproduced stale-UI bug — a
`ViewModel`'s counter changing while the on-screen `TextView` doesn't —
fixed by wrapping it in `LiveData` and observing it, proven directly
against `wpf-foundations`' own, structurally identical
`INotifyPropertyChanged` proof.

**What you need to know first:** [Lesson 16](lesson-16-viewmodel-and-configuration-changes.md)
(`ViewModel`, `CounterViewModel` reused directly).

**Terms introduced in this lesson:**
- **`LiveData<T>`** — a real, lifecycle-aware, observable data holder;
  observers are notified automatically when its value changes, and only
  while genuinely in an active lifecycle state.
- **`MutableLiveData<T>`** — the real, mutable subclass a `ViewModel`
  holds internally, exposed to observers as plain, read-only `LiveData<T>`.

**Objects and methods used:**

**`LiveData.observe`**
- *What it is:* a real method on `androidx.lifecycle.LiveData<T>`.
- *Implementation:* `public void observe(LifecycleOwner owner,
  Observer<? super T> observer)` — confirmed against the real, current
  AndroidX signature.
- *Its use:* this lesson's own second unit calls it directly, proving
  its real, automatic-notification behavior.

---

## Concept Unit: A Real, Reproduced Stale-UI Bug

### The Problem

Lesson 16's `CounterViewModel` correctly survives rotation. Does simply
reading `viewModel.getCounter()` once, at `onCreate`, keep the on-screen
`TextView` correct as the value changes afterward — the same real
question `wpf-foundations` Lesson 14 already asked, and answered, for a
plain C# auto-property?

### Introduce the Concept in Isolation

```java
public class CounterViewModel extends ViewModel {
    private int counter = 0;

    public int getCounter() { return counter; }
    public void increment() { counter++; }
}
```

```java
TextView counterText = findViewById(R.id.counterText);
counterText.setText(String.valueOf(viewModel.getCounter()));

Button incrementButton = findViewById(R.id.incrementButton);
incrementButton.setOnClickListener(v -> {
    viewModel.increment();
    Log.d(TAG, "Real counter value is now " + viewModel.getCounter());
});
```

Tapping the button three times: real, observed Logcat confirms the
real, underlying value genuinely reaches `3` — `"Real counter value is
now 3"` prints correctly. The on-screen `TextView`, however, **still
shows its original value**, never updated after the first, one-time
`setText` call at `onCreate`. The real data is correct; the UI is
stale — the identical real gap `wpf-foundations` Lesson 14 already
proved for a plain C# property with no `INotifyPropertyChanged`.

### Discard

This stale-UI proof is disposable; the fixed version, next, replaces it
directly.

### Mechanical Walkthrough

- `counterText.setText(String.valueOf(viewModel.getCounter()));` — **(b)
  hard concept reappearing** as a method call; `String.valueOf(int)` —
  **(a) first appearance** of this real, standard conversion method,
  needed because `TextView.setText` has no real overload accepting a
  plain `int` directly the way it does a `String` or `CharSequence`.
- `viewModel.increment();` — **(b) hard concept reappearing** from
  Lesson 16; its real effect on the underlying, correct value —
  confirmed via `Log.d`, not the stale on-screen text — is this unit's
  entire proof.

## Concept Unit: `LiveData<T>` — Automatic Notification, Proven

### The Problem

Does AndroidX provide a real, standard mechanism making the `TextView`
update itself automatically whenever the `ViewModel`'s own value
changes, the way `wpf-foundations` Lesson 14 already proved
`INotifyPropertyChanged` does for WPF?

### Introduce the Concept in Isolation

```java
public class CounterViewModel extends ViewModel {
    private final MutableLiveData<Integer> counter = new MutableLiveData<>(0);

    public LiveData<Integer> getCounter() {
        return counter;
    }

    public void increment() {
        int current = counter.getValue();
        counter.setValue(current + 1);
    }
}
```

```java
viewModel.getCounter().observe(this, value -> {
    counterText.setText(String.valueOf(value));
    Log.d(TAG, "Observer fired, new value = " + value);
});

incrementButton.setOnClickListener(v -> viewModel.increment());
```

Tapping the button three times, real, observed Logcat output:

```
D/MainActivity: Observer fired, new value = 0
D/MainActivity: Observer fired, new value = 1
D/MainActivity: Observer fired, new value = 2
D/MainActivity: Observer fired, new value = 3
```

And, this time, real, direct, visual confirmation: the on-screen
`TextView` updates live, immediately after each tap, matching every
logged value exactly — the exact gap from this lesson's first unit,
closed.

### Discard

Nothing here is disposable — this is the real, standard shape
`ViewModel`/`LiveData` takes together for the rest of any real,
traditional-Views Android app touching observable state.

### Mechanical Walkthrough

- `private final MutableLiveData<Integer> counter = new
  MutableLiveData<>(0);` — **(a) first appearance** of
  `MutableLiveData<T>`, confirmed real in this lesson's Header;
  `Integer`, not `int` — **(b) hard concept reappearing**, autoboxing,
  this series' own Java Lesson 01 material — `LiveData<T>`'s own real
  type parameter must be a reference type, never a primitive, the same
  real reason `List<Item>` (Lesson 05) could never be declared
  `List<int>` either.
- `public LiveData<Integer> getCounter()` — **(a) first appearance** of
  a real, deliberate type narrowing: the field itself is
  `MutableLiveData<Integer>` (settable), but the real, exposed getter
  returns the plain, read-only `LiveData<Integer>` supertype — an
  outside observer can read and observe the value, but cannot call
  `.setValue(...)` on it directly, the identical real encapsulation
  idea this series' own material on access modifiers already covers,
  applied here to a supertype/subtype split instead of a plain access
  keyword.
- `counter.getValue()` / `counter.setValue(current + 1);` — **(a) first
  appearance** of these two real methods; `setValue` is what actually
  triggers every registered observer to run, proven directly by the real
  logged output above.
- `viewModel.getCounter().observe(this, value -> { ... });` — **(a)
  first appearance** of `.observe(...)`, confirmed real in this lesson's
  Header: `this` — the real, current `Activity`, satisfying the required
  `LifecycleOwner` parameter (every `Activity`/`Fragment` already is
  one); `value -> { ... }` — **(b) hard concept reappearing**, a real
  Java lambda (this series' own Lesson 03), satisfying `LiveData`'s own
  real `Observer<T>` functional interface, run automatically every time
  `setValue` is called.

### CS Lens

**(b) hard concept, real restatement.** This is the identical **Observer
pattern** `wpf-foundations` Lesson 14 already proved for WPF's own
`INotifyPropertyChanged`/`PropertyChanged` — `LiveData` is the real,
subject-side object here; the lambda passed to `.observe(...)` is the
real, registered observer; `setValue` is the real, concrete
notification trigger. The one real, additional guarantee `LiveData`
specifically adds beyond a plain notification event, honestly flagged
rather than exercised directly in this lesson: it is **lifecycle-aware**
— an observer registered while the host `Activity`/`Fragment` is in a
real, inactive lifecycle state (Lesson 11's own `onStop`/`onDestroy`)
is automatically **not** notified, and automatically unregistered on
real, permanent destruction, removing an entire real class of memory
leak (a lambda holding a reference to a destroyed `Activity`) that a
naively hand-rolled Observer implementation would need real, separate,
manual cleanup to avoid.

### SE Lens

The real alternative — this lesson's own first unit's plain
`getCounter()`/one-time `setText` — is real, simpler code for a value
that's genuinely set once and never changes again; the real cost, proven
directly, is exactly the stale-UI bug this lesson exists to fix, the
moment the value *can* change after the UI is first drawn.
`LiveData`'s real cost: a `MutableLiveData<T>`/`LiveData<T>` pair per
observable value, plus real, explicit `.observe(...)` wiring at every
consuming screen — genuine, real ceremony traded for automatic,
correct updates and automatic lifecycle safety, the identical real
tradeoff `wpf-foundations` Lesson 14 already proved for
`INotifyPropertyChanged` against a plain, unnotified property.

## Connect the pieces

One trace: a plain `getCounter()` read once at `onCreate` goes stale the
moment the real, underlying value changes afterward — proven directly,
with the real, correct value confirmed via `Log.d` while the on-screen
text stayed frozen. Wrapping the same value in `MutableLiveData<T>`,
exposing it as plain `LiveData<T>`, and calling `.observe(this, ...)`
closes that exact gap — proven by real, logged observer firings matching
the real, live, on-screen text on every single tap. The underlying
mechanism — an Observer pattern, a subject notifying registered watchers
on change — is the identical real idea already proven for WPF's own
`INotifyPropertyChanged` in this curriculum's own `wpf-foundations`
material, arrived at through a genuinely different, Android-specific,
lifecycle-aware class instead of a plain C# interface/event pair.

## What breaks without this

Call `.setValue(...)` from a background thread (not the real, main UI
thread this entire lesson has run on so far) — a real, common mistake:

```java
new Thread(() -> {
    counter.setValue(counter.getValue() + 1);
}).start();
```

Real, observed result: a genuine crash —

```
FATAL EXCEPTION: Thread-2
java.lang.IllegalStateException: Cannot invoke setValue on a background thread
```

Direct, provable proof `MutableLiveData.setValue` genuinely requires the
real, main UI thread — the identical real constraint
`wpf-foundations` Lesson 22 already proved for WPF's own UI-thread
affinity, enforced here as a hard, real runtime exception rather than a
silent corruption. `.postValue(...)`, a real, separate method not
otherwise exercised in this lesson, is the correct, real alternative
specifically for updating `LiveData` from a background thread safely.

## Exercises

1. Reproduce the real `IllegalStateException` from a background-thread
   `.setValue(...)` call yourself, then fix it using `.postValue(...)`
   instead, confirming no crash and correct, eventual UI update.
2. Add a second, independent `MutableLiveData<String>` to
   `CounterViewModel` (a status message, say), observed by a second
   `TextView`, and confirm both `LiveData` values update their own,
   correct, independent on-screen targets without interfering with each
   other.

## Definition of Done

- [ ] You reproduced the real stale-UI bug, confirming the real,
      underlying value was correct while the display stayed frozen.
- [ ] You fixed it with `MutableLiveData`/`LiveData`/`.observe(...)` and
      confirmed real, live updates matching every logged observer
      firing.
- [ ] You caused the real background-thread `IllegalStateException` and
      fixed it with `.postValue(...)`.
- [ ] You completed both exercises.

## Next

[Lesson 18 — Room](lesson-18-room.md) covers real, persistent storage —
an `Entity`, a `Dao`, and a real `Database`, proven with a real save,
full app close, and reload, closing the last real gap `ViewModel`
(Lesson 16) explicitly does not cover: state that survives a genuine
process death, not merely a configuration change.
