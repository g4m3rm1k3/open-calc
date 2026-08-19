# Lifecycle-Aware Observing: LiveData and Observer

**What problem this solves.** One piece of code often needs to know
whenever another piece of code's data changes, without polling it over
and over "just in case." The classic fix is to let interested parties
register themselves as listeners and get called back automatically the
moment a change happens. That classic fix has its own classic bug,
though: if a listener is still registered when the thing that was
listening no longer exists — a screen the user has already left — the
callback still fires into dead or stale code, at best wasting work, at
worst crashing the app or updating a view that isn't there anymore.

**Classic pattern family.** This is the **Observer** pattern: one
object (the *subject*, holding the data) keeps a list of other objects
(the *observers*) and calls each of them back whenever its own state
changes, without the subject needing to know anything about what each
observer actually does with that notification. Android's version adds a
twist the classic pattern doesn't have on its own: automatic
unsubscription tied to the observer's own screen lifecycle, which is
what actually solves the stale-callback problem above rather than just
naming it.

**Where you'll meet it in Android.** `androidx.lifecycle.LiveData<T>`,
`androidx.lifecycle.MutableLiveData<T>`, and the `Observer<T>`
interface, from Android's Jetpack lifecycle library — most often held
inside a `ViewModel` and observed from an `Activity` or `Fragment`.

**Terms used in this pattern.**

- **Generic type parameter** — the `<T>` on `LiveData<T>` and
  `Observer<T>`, a placeholder for whatever type of value is actually
  being observed (a `String`, a `List<Contact>`, anything). It exists so
  the same `LiveData` and `Observer` classes work for any kind of data
  without being rewritten per type, while still giving callers real,
  checked types instead of a generic `Object`.
- **Lambda expression** — a short, unnamed block of code
  (`value -> { ... }`) supplied where an interface with exactly one
  method is expected, standing in for a full anonymous class
  implementing that interface. It exists so registering a one-method
  callback like `Observer<T>` doesn't require writing out a whole named
  or anonymous class just to hold a few lines of logic.
- **`LifecycleOwner`** — an interface implemented by classes (`Activity`,
  `Fragment`) whose object has a well-defined lifetime with named
  states (created, started, resumed, destroyed, and so on). It exists so
  library code like `LiveData` can ask *any* screen, generically, "what
  state are you in right now, and tell me when that changes" without
  needing to know whether it's talking to an `Activity` or a `Fragment`
  specifically.

**Objects and methods used.**

- **`LiveData<T>`**
  *What it is:* an abstract, observable holder of a single value of
  type `T`.
  *Implementation:* exposes `public T getValue()` to read the current
  value and `public void observe(@NonNull LifecycleOwner owner,
  @NonNull Observer<? super T> observer)` to register a callback; it has
  no public way to *set* the value — that's deliberately reserved for
  the subclass below.
  *Its use:* this is the read-only face handed out to anything that
  should be able to react to a value changing, but never change it
  directly.
- **`MutableLiveData<T>`**
  *What it is:* a subclass of `LiveData<T>` that adds the ability to
  actually change the held value.
  *Implementation:* adds `public void setValue(T value)` (must be called
  from the main thread) and `public void postValue(T value)` (safe to
  call from a background thread; schedules the update onto the main
  thread instead of applying it immediately).
  *Its use:* this is what the data's actual owner (typically a
  `ViewModel`) holds internally and writes to; it's usually exposed to
  everyone else only as the plain `LiveData<T>` base type, hiding the
  ability to write.
- **`Observer<T>`**
  *What it is:* a functional interface — one with exactly a single
  abstract method — meant to be implemented by whatever wants to react
  to a change.
  *Implementation:* `public interface Observer<T> { void onChanged(T value); }`.
  *Its use:* the contract `LiveData` calls back into; a lambda is
  usually supplied directly where one of these is expected, rather than
  a separate named class.
- **`observe(LifecycleOwner owner, Observer<? super T> observer)`**
  *What it is:* an instance method on `LiveData<T>`, returning `void`.
  *Implementation:* `public void observe(@NonNull LifecycleOwner owner, @NonNull Observer<? super T> observer)`.
  *Its use:* registers the callback *and* ties its active lifetime to
  the given `owner`'s own lifecycle state — this single call is what
  produces the automatic unsubscription this pattern exists for.

---

## The Shape

Three participants:

- **`MutableLiveData<T>`** — the subject. Holds the one real value and
  the list of everyone currently observing it; only its owner ever
  calls `setValue`/`postValue` on it directly.
- **`LiveData<T>`** — the same object, exposed to everyone *else* only
  through this narrower, read-only-looking base type; it can be
  observed but not written to through this reference.
- **`Observer<T>` (usually a lambda) registered together with a
  `LifecycleOwner`** — the reactor. Doesn't hold a reference to the
  `LiveData` at all after registering; `LiveData` holds a reference to
  *it*, wrapped together with the `LifecycleOwner` it was registered
  with.

The relationship: an owner (commonly a `ViewModel`, which itself has no
lifecycle tied to any one screen and can outlive screen rotations) holds
the `MutableLiveData` and is the only thing with permission to change
it. A screen (`Activity`/`Fragment`, both `LifecycleOwner`s) calls
`observe`, handing over both a callback *and* itself as the lifecycle to
track. From that point, `LiveData` is watching two independent things
at once — its own value, and the screen's lifecycle state — and only
fires the callback when both line up: a real change has happened, *and*
the screen is currently in a state where it makes sense to react (at
least started). When the screen is destroyed, `LiveData` notices via
that same lifecycle tracking and drops the registration itself, with no
call required from the screen's own teardown code.

```
   ViewModel
     owns -> MutableLiveData<T>  (can setValue/postValue)
                    |
                    |  exposed as
                    v
              LiveData<T>  (read-only face)
                    |
                    |  .observe(owner, observer)
                    v
     Activity/Fragment (a LifecycleOwner) --- registers --> Observer<T>

   LiveData watches the LifecycleOwner's state on its own;
   destroyed owner -> registration removed automatically.
```

---

## Mechanical Walkthrough

```java
public class ContactViewModel extends ViewModel {
    private final MutableLiveData<String> selectedName = new MutableLiveData<>();

    public LiveData<String> getSelectedName() {
        return selectedName;
    }

    public void selectContact(String name) {
        selectedName.setValue(name);
    }
}
```

```java
ContactViewModel viewModel = new ViewModelProvider(this).get(ContactViewModel.class);

viewModel.getSelectedName().observe(this, name -> {
    nameLabel.setText(name);
});
```

- **`private final MutableLiveData<String> selectedName = new MutableLiveData<>();`**
  — creates the actual subject, fixed to hold `String` values via the
  generic parameter. `private` and `final` together mean nothing outside
  this class can ever reassign it or reach the mutable methods directly
  — the only way out is through the method below.
- **`public LiveData<String> getSelectedName()`** — deliberately
  declares its return type as the narrower `LiveData<String>`, not
  `MutableLiveData<String>`, even though the real object handed back
  *is* a `MutableLiveData`. This is what actually enforces "callers can
  observe but not write" — Java's static typing hides `setValue` from
  anything holding only the declared `LiveData<String>` reference, even
  though the object underneath still has that method.
- **`public void selectContact(String name)`** — the only method in the
  whole class permitted to write, because it's the only place with a
  reference typed as the mutable subclass.
- **`selectedName.setValue(name)`** — overwrites the held value and, as
  a direct consequence of this one call, triggers `onChanged` on every
  currently-active observer — nothing else in this class calls
  observers directly; that dispatch is entirely `LiveData`'s own
  internal behavior, not code written here.
- **`new ViewModelProvider(this).get(ContactViewModel.class)`** —
  obtains the `ViewModel` instance tied to this screen (not itself part
  of the Observer pattern's own shape, shown only because it's how the
  screen gets a reference to the subject in the first place).
- **`viewModel.getSelectedName()`** — calls the narrowing method above,
  receiving the read-only `LiveData<String>` face rather than the
  mutable object.
- **`.observe(this, name -> { ... })`** — the actual registration call.
  `this` here is the `Activity` or `Fragment` itself, passed as the
  `LifecycleOwner` — the same object is both the screen making the call
  and the lifecycle `LiveData` will track. `name -> { nameLabel.setText(name); }`
  is a lambda implementing `Observer<String>`'s single method,
  `onChanged`, supplied inline instead of as a separate named class.
- **`nameLabel.setText(name)`** — the reaction itself, running only when
  `LiveData` decides to call it: after a real value change, and only
  while this screen is at least in the started lifecycle state.

---

## Collaboration — how it actually runs

1. `viewModel.getSelectedName().observe(this, name -> { ... })` runs
   once, typically in `onCreate`/`onViewCreated` — this registers the
   callback but does not call it yet.
2. If the `LiveData` already held a value at registration time *and*
   this screen is already at least started, `LiveData` calls
   `onChanged` immediately with that existing value — a new observer
   doesn't have to wait for the *next* change to see current data.
3. Later, from anywhere holding the mutable reference, `selectContact(name)`
   calls `setValue`. `LiveData` walks its list of registered observers
   and calls `onChanged` on each one currently considered active.
4. If the screen is not currently at least started (for example, it's
   in the back stack, paused behind another screen) when step 3 happens,
   `LiveData` does not call this observer now — it remembers that a
   newer value is pending and delivers it the moment the screen becomes
   started again, rather than delivering it while nothing is on screen
   to receive it usefully.
5. When this screen is destroyed (the user navigates away for good, or
   the `Activity`/`Fragment` is torn down), `LiveData` is notified of
   that lifecycle transition on its own — nothing in this screen's
   teardown code calls anything on `LiveData` — and removes this
   observer from its list. Any `setValue` call after this point simply
   never reaches this particular observer again, because it's gone.

Step 5 is the entire reason this pattern exists rather than a plain,
manually-managed listener list: the removal is guaranteed to happen
exactly when the screen's own lifecycle says it should, with no
opportunity for the screen's code to forget to call an "unregister"
method on its way out.

---

## Why It's Shaped This Way

The design principle is that **subscription lifetime should be tied to
something the framework already tracks precisely**, instead of trusted
to be managed correctly by hand in every single screen that ever
observes anything.

The alternative not chosen: a plain listener list with manual
`addListener`/`removeListener` calls, the observer pattern in its
textbook form — simpler to implement, since there's no lifecycle
tracking involved at all. The real cost: every single screen that ever
observes anything has to remember to call `removeListener` at exactly
the right teardown moment, on every single code path that can end the
screen — and missing even one path is a memory leak (the dead screen
stays reachable through the list) or a crash (the callback runs and
touches a view that's already gone).

The cost this pattern itself carries: a `LiveData` observer can only
usefully be tied to a `LifecycleOwner` — reaching for it somewhere with
no natural lifecycle to tie it to means either supplying an artificial
one or reaching for a different tool instead. It also delivers only the
*current* value on each call, not a stream of every intermediate value
that happened while a screen was stopped — the right tool if only "what
does it look like right now" matters, the wrong one if every individual
change in between genuinely needs to be seen.

---

## Recognizing It Elsewhere

Also recognized in: a spreadsheet cell that recalculates and every
formula referencing it updates automatically; a stock ticker pushing
price updates to every subscribed display; a DOM `EventTarget` calling
every registered `addEventListener` callback when an event fires; a
publish/subscribe message queue delivering a message to every currently
subscribed consumer.

---

## Where This Actually Breaks

The most common real mistake: calling `setValue` from a background
thread. `setValue` is documented to require the main thread; calling it
from anywhere else throws an exception at runtime (`postValue` exists
specifically as the safe alternative for this case, scheduling the
update onto the main thread instead of applying it immediately). This
tends to surface only intermittently in testing — a change triggered by
a quick user tap runs on the main thread already and works fine, while
the same code path triggered by a slow network callback or a background
computation runs off the main thread and crashes — making it look like
an unrelated, hard-to-reproduce bug rather than the simple threading
mistake it actually is.
