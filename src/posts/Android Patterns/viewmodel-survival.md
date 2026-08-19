# State That Outlives One Screen Instance: ViewModel Survival

**What problem this solves.** Some state genuinely belongs to a
screen's ongoing session with the user — the results of a search, an
in-progress form, the current state of a media player — not to any one
specific, short-lived `Activity` object built to display it, which the
system may destroy and recreate at any moment (a rotation, a language
change) for reasons that have nothing to do with the user's actual task
being finished. If that state lived only as plain fields on the
`Activity` itself, every such recreation would silently throw it away,
forcing it to be rebuilt or re-fetched from scratch — wasteful at best,
visibly broken at worst, a half-typed form simply gone. The abstract
fix: give this kind of state its own object with its own, different
lifetime — one tied to the user's actual ongoing task, not to any one
specific `Activity` instance — and have the framework itself hand back
the exact same instance to whichever `Activity` object currently
represents that same ongoing task, across as many destroy/recreate
cycles as happen along the way.

**Classic pattern family.** Not a clean Gang-of-Four fit — this is
Android's own specific mechanism for separating "state that outlives a
single object's own construction" from Java's ordinary rule that an
object's fields die when the object itself is destroyed. Closest in
spirit to a cache with its own independent lifetime, but the exact
mechanism — tied specifically to `Activity`/`Fragment` recreation — is
Android's own.

**Where you'll meet it in Android.** `androidx.lifecycle.ViewModel`
(the base class) and `androidx.lifecycle.ViewModelProvider`, used as
`new ViewModelProvider(this).get(SomeViewModel.class)`.

**Terms used in this pattern.**

- **`protected` access modifier** — restricts a method so it can be
  called from the declaring class, subclasses, and same-package code,
  but not arbitrary outside code. It matters specifically here so only
  the framework's own internal machinery, never arbitrary app code, can
  call `onCleared` — calling it manually would falsely signal to this
  `ViewModel` that it's being permanently discarded when it might not
  be.

**Objects and methods used.**

- **`ViewModel`**
  *What it is:* an abstract base class.
  *Implementation:* `public abstract class ViewModel`, declaring one
  method meant to be overridden, `protected void onCleared()`, called
  by the framework exactly once, when this instance is genuinely about
  to be discarded for good.
  *Its use:* the base type for any object meant to hold state with a
  longer lifetime than any single `Activity`/`Fragment` instance
  representing the same ongoing screen.
- **`ViewModelProvider`**
  *What it is:* a class responsible for creating, or handing back an
  already-created, `ViewModel` instance.
  *Implementation:* `public class ViewModelProvider`, constructed with
  a `ViewModelStoreOwner` (an `Activity` or `Fragment` satisfies this),
  exposing `public <T extends ViewModel> T get(Class<T> modelClass)`.
  *Its use:* the mechanism deciding, each time it's asked, whether a
  genuinely new instance needs to be constructed or whether an existing
  one, already tied to this same ongoing screen, should be handed back
  instead.
- **`ViewModelProvider.get(Class<T> modelClass)`**
  *What it is:* an instance method on `ViewModelProvider`, returning
  `T`.
  *Implementation:* `public <T extends ViewModel> T get(@NonNull
  Class<T> modelClass)`.
  *Its use:* the actual call site — the class token names which
  `ViewModel` type is being requested, letting the method both locate
  or build the right instance and return it already correctly typed.
- **`onCleared()`**
  *What it is:* a `protected` instance method on `ViewModel`, returning
  `void`, meant to be overridden.
  *Implementation:* `protected void onCleared()`.
  *Its use:* the one guaranteed notification a `ViewModel` ever
  receives that it's genuinely, permanently done — the correct and only
  place to release anything this `ViewModel` itself is holding that
  needs explicit cleanup.

---

## The Shape

Four participants:

- **`ContactListViewModel`** — the app's own subclass, holding state
  that should outlive any one `Activity` instance.
- **`ViewModelProvider`** — the framework mechanism deciding whether to
  construct a new instance or return an existing one.
- **An internal store**, kept alive by the system independently of any
  one `Activity` instance, associated with the ongoing task rather than
  any specific short-lived object representing it.
- **The calling `Activity`**, whichever specific instance currently
  exists, asking for "the `ViewModel` for this ongoing screen" without
  needing to know or care whether one already exists.

The relationship: the calling `Activity` never constructs a `ViewModel`
with `new` directly — it always goes through `ViewModelProvider`, which
is what allows the exact same identical object to be handed back across
a destroy/recreate cycle instead of a fresh one being built. From the
`ViewModel`'s own point of view, it has no idea an `Activity` was ever
destroyed and recreated at all — across that whole event, its own
fields simply never changed, because the object itself was never
actually destroyed, only the shorter-lived `Activity` object that
happened to be asking for it.

```
   Activity instance #1 (before rotation)
        |
        |  new ViewModelProvider(this).get(ContactListViewModel.class)
        v
   ViewModelProvider  -- checks internal store, none exists yet --
        |
        |  constructs a new ContactListViewModel
        v
   ContactListViewModel  (lives on, independent of Activity #1)

   ... rotation: Activity #1 destroyed, Activity #2 created ...

   Activity instance #2 (after rotation)
        |
        |  new ViewModelProvider(this).get(ContactListViewModel.class)
        v
   ViewModelProvider  -- checks internal store, ALREADY EXISTS --
        |
        |  hands back the SAME instance from before
        v
   the exact same ContactListViewModel object, untouched by the rotation
```

---

## Mechanical Walkthrough

```java
public class ContactListViewModel extends ViewModel {
    private final MutableLiveData<String> searchQuery = new MutableLiveData<>();

    public LiveData<String> getSearchQuery() {
        return searchQuery;
    }

    public void setSearchQuery(String query) {
        searchQuery.setValue(query);
    }

    @Override
    protected void onCleared() {
        // release anything held here before this instance is gone for good
    }
}
```

- **`class ContactListViewModel extends ViewModel`** — opts this class
  into the framework's own construction and retrieval mechanism; a
  plain class with no `extends ViewModel` at all would just be an
  ordinary object with the same short lifetime as whatever created it.
- **`private final MutableLiveData<String> searchQuery = new MutableLiveData<>();`**
  — the actual state this pattern exists to preserve; an ordinary
  field, exactly as it would be on any other class, whose real
  significance here is *where* it lives — inside an object the
  framework itself keeps alive across `Activity` recreation.
- **`getSearchQuery()` / `setSearchQuery(String query)`** — ordinary
  accessor methods, unrelated to the survival mechanism itself; shown
  only to make the class realistic and complete.
- **`@Override protected void onCleared()`** — opts into the one
  cleanup notification this class will ever receive; left with only a
  comment here since this particular `ViewModel` happens to hold
  nothing needing explicit release, but the method still has to be
  shown to demonstrate where such cleanup would go.

Obtaining the instance, from inside an `Activity`:

```java
ContactListViewModel viewModel = new ViewModelProvider(this).get(ContactListViewModel.class);
```

- **`new ViewModelProvider(this)`** — constructs the provider itself,
  `this` (the `Activity`) supplying the identity of the ongoing task
  its internal store should be associated with.
- **`.get(ContactListViewModel.class)`** — the actual retrieval call;
  the class token tells `ViewModelProvider` which type is being asked
  for, and it either returns an existing matching instance from its
  internal store or constructs and stores a new one before returning
  it — this one line hides that entire decision from the caller.

---

## Collaboration — how it actually runs

1. The first time any `Activity` instance representing this ongoing
   screen calls `new ViewModelProvider(this).get(ContactListViewModel.class)`,
   the internal store associated with this ongoing task has nothing
   yet, so a genuinely new `ContactListViewModel` is constructed and
   stored.
2. If the device rotates, the current `Activity` instance is destroyed
   — but the internal store the `ViewModel` lives in is not tied to
   that `Activity` object's own lifetime; it survives the rotation
   independently.
3. A brand-new `Activity` instance is created to replace the destroyed
   one, and its own `onCreate` calls
   `new ViewModelProvider(this).get(ContactListViewModel.class)` again,
   exactly as before.
4. This time, `ViewModelProvider`'s internal store already has an
   instance associated with this same ongoing task, so it hands back
   that exact same object rather than constructing a new one —
   `searchQuery`'s current value, and anything else this `ViewModel`
   holds, is untouched by everything that just happened.
5. Only when the user actually leaves this task for good — not merely
   rotating the device, but finishing the screen entirely — does the
   system finally call `onCleared()` on this `ViewModel`, exactly once,
   signaling it's genuinely done and should release anything it's
   holding.

---

## Why It's Shaped This Way

The design principle is **giving state a lifetime tied to the user's
actual ongoing task**, independent of the specific, comparatively
short-lived object the system happens to be using to display it at any
one moment.

The alternative not chosen: storing this same state as plain fields
directly on the `Activity` itself, relying on the Bundle-saving
mechanism to carry it through a recreation. The real cost of that
alternative: a `Bundle` is deliberately limited to small amounts of
simple, serializable data — genuinely unsuitable for something like an
in-progress network response, a large in-memory list, or a listener
registration. A `ViewModel`, by contrast, is the same live object
continuing to exist, not a serialized snapshot at all, so it can hold
anything an ordinary Java field could hold, with no serialization step
involved anywhere.

The cost this pattern itself carries: a `ViewModel` obtained through
`ViewModelProvider` must never hold a direct reference to the
`Activity` or `Fragment` that asked for it — doing so would defeat the
entire purpose, keeping the short-lived object alive far past when it
should be destroyed. This is a real, easy mistake for anyone used to
freely passing `this` or a `Context` around in ordinary Java code.

---

## Recognizing It Elsewhere

Also recognized in: a web server's session object, outliving any single
HTTP request while still being tied to a specific, ongoing user session
rather than the server's whole lifetime; a video game's persistent
save-state object, surviving a scene or level reload that destroys and
rebuilds every on-screen object in that level; a database connection
pool's checked-out connection, handed back identically to the same
logical caller across what might otherwise look like separate
individual requests.

---

## Where This Actually Breaks

The most common real mistake: storing a reference to the `Activity` or
`Context` itself as a field inside a `ViewModel` — to show a `Toast`,
say, or start another `Activity`. Because the `ViewModel` deliberately
outlives any single `Activity` instance, but that stored reference does
not update itself when the `Activity` is destroyed and recreated, this
either crashes later — calling a method on an `Activity` that's already
been destroyed — or, worse, silently leaks that destroyed `Activity` in
memory for as long as the `ViewModel` itself survives. The same
category of leak the lifecycle contract and Command patterns warn about
elsewhere, reappearing here in a `ViewModel`-flavored form.
