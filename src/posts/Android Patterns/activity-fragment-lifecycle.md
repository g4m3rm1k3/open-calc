# The Component Lifecycle Contract: Activity Callbacks

**What problem this solves.** An app's screen isn't a single block of
code the developer runs start-to-finish the way a `main()` function is
— the operating system itself decides when a screen becomes visible,
loses focus, is hidden, or is destroyed entirely, often for reasons
completely outside the app's own control: the user pressing Home, a
phone call interrupting, the system reclaiming memory from an app
sitting in the background. Code written as "runs once, top to bottom,
done" has nowhere to hook into any of that. The abstract fix: the
framework defines a fixed set of named moments in a screen's life and
calls a specific method on the screen's own class at each one, so the
screen's code can react to being shown, hidden, or torn down without
ever polling or guessing.

**Classic pattern family.** This resembles the Gang-of-Four **Template
Method** pattern — a fixed sequence owned by the framework, with the
subclass filling in what happens at each step — but the resemblance is
loose enough that stopping at the label isn't useful here. Template
Method usually names one method calling a fixed sequence of steps
synchronously, in one call. Here, the "steps" are separate methods,
called at separate, sometimes far-apart moments, triggered by real-world
system events the app has no way to trigger itself. What actually
matters for understanding this contract is its own specific state
machine — treat it as Android's own thing, not a case closed by naming
the GoF pattern and moving on.

**Where you'll meet it in Android.** `android.app.Activity` (and,
identically in shape, `androidx.fragment.app.Fragment`) — every screen
in an Android app is built by overriding some subset of `onCreate`,
`onStart`, `onResume`, `onPause`, `onStop`, `onRestart`, `onDestroy`.

**Terms used in this pattern.**

- **Callback method** — a method the app's own code never calls
  directly; the framework itself decides when to call it. It exists
  because the app doesn't control the schedule these moments happen on
  — only the system does.
- **`protected` access modifier** — restricts a method so it can be
  called from the declaring class, subclasses, and other code in the
  same package, but not by arbitrary unrelated code. It exists here
  specifically so nothing outside the framework's own machinery can
  call, say, `onCreate()` directly on an `Activity` object — the system
  already calls it exactly once, at the moment it decides is correct;
  letting arbitrary code call it too would let a screen be
  double-initialized, which the contract depends on never happening.
- **`@Override`** — an annotation stating this method intentionally
  replaces one declared in the superclass being extended. It exists so
  a typo in a lifecycle method's name becomes a compile error (no
  matching parent method found) instead of silently creating a new,
  unrelated method the system never calls — a real, easy mistake to
  make with a name like `onResume` versus a mistyped `onResumed`.
- **`super` method call** — a call, from inside an overridden method,
  to the version of that same method the superclass itself defines. It
  exists so the base `Activity` class can run its own essential setup
  or teardown at the same named moment, in addition to whatever this
  specific screen's subclass wants to do — omitting it (where the base
  class implementation does real work) leaves that base work undone.

**Objects and methods used.**

- **`onCreate(Bundle savedInstanceState)`**
  *What it is:* a `protected` instance method on `Activity`, returning
  `void`.
  *Implementation:* `protected void onCreate(@Nullable Bundle savedInstanceState)`.
  *Its use:* called exactly once per Activity instance, before any
  other lifecycle method — the one place one-time setup (like choosing
  the screen's layout) belongs.
- **`Bundle`**
  *What it is:* a key-value container class.
  *Implementation:* `public final class Bundle`, passed by the system
  into `onCreate` as either `null` or a real, previously-saved instance.
  *Its use:* here, only its null-ness matters — `null` means this exact
  Activity object is being created for the first time; non-null means
  the system destroyed a previous instance of this same screen and is
  now recreating it, handing back whatever that previous instance chose
  to save before being destroyed.
- **`onStart()`**
  *What it is:* a `protected` instance method on `Activity`, returning
  `void`.
  *Implementation:* `protected void onStart()`.
  *Its use:* called every time this screen is about to become visible,
  whether that's right after `onCreate` (first launch) or after
  `onRestart` (returning from the background) — unlike `onCreate`, this
  can run many times over one Activity object's life.
- **`onResume()`**
  *What it is:* a `protected` instance method on `Activity`, returning
  `void`.
  *Implementation:* `protected void onResume()`.
  *Its use:* called right after `onStart` once the screen is not just
  visible but actually in the foreground and interactive — the one
  moment the user can genuinely touch and use it.
- **`onPause()`**
  *What it is:* a `protected` instance method on `Activity`, returning
  `void`.
  *Implementation:* `protected void onPause()`.
  *Its use:* called the moment this screen starts losing focus — still
  at least partially visible, but no longer the one receiving input —
  the framework's cue that whatever's happening here should wrap up
  quickly, since it may be followed immediately by `onStop`.
- **`onStop()`**
  *What it is:* a `protected` instance method on `Activity`, returning
  `void`.
  *Implementation:* `protected void onStop()`.
  *Its use:* called once this screen is no longer visible at all —
  entirely covered or backgrounded, though the Activity object itself
  may still exist in memory, not yet destroyed.
- **`onRestart()`**
  *What it is:* a `protected` instance method on `Activity`, returning
  `void`.
  *Implementation:* `protected void onRestart()`.
  *Its use:* called only when a *stopped* (not destroyed) Activity is
  about to become visible again — always immediately followed by
  `onStart`, never called on a screen's very first appearance.
- **`onDestroy()`**
  *What it is:* a `protected` instance method on `Activity`, returning
  `void`.
  *Implementation:* `protected void onDestroy()`.
  *Its use:* called when this Activity object is being permanently torn
  down — the last callback it will ever receive, if it runs at all (the
  system can also simply kill the whole app process without calling
  this, discussed below).

---

## The Shape

Two participants, in a relationship neither one controls symmetrically:

- **The app's own `Activity` subclass** — supplies what happens *at*
  each named moment, by overriding some subset of the seven methods
  above. It never decides *when* any of them run.
- **The Android system process** — the actual conductor. Watches
  real-world events (user taps, Home presses, incoming calls, memory
  pressure) and, based on them, moves this screen through a fixed set
  of named states, calling the one matching callback method each time
  it makes a transition.

The relationship: from inside any single callback, the app's code has
no way to find out what's going to happen next, or when — it only ever
learns about a transition after the system has already decided it and
is now telling the app about it, by calling the corresponding method.
Being "in charge" inside `onResume()` is an illusion of the moment;
real control over the schedule belongs entirely to the system's state
machine, and these seven methods are the only window the app gets into
it.

```
 onCreate() -> onStart() -> onResume()   [fully visible, interactive]
                                |
                          onPause()      [losing focus, still visible]
                                |
                          onStop()       [no longer visible]
                               / \
                onRestart()->onStart()   onDestroy()
                 -> onResume()            [gone for good]
                 [coming back]
```

---

## Mechanical Walkthrough

```java
public class ContactDetailActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_contact_detail);
    }

    @Override
    protected void onStart() {
        super.onStart();
    }

    @Override
    protected void onResume() {
        super.onResume();
    }

    @Override
    protected void onPause() {
        super.onPause();
    }

    @Override
    protected void onStop() {
        super.onStop();
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
    }
}
```

- **`class ContactDetailActivity extends AppCompatActivity`** — the
  app's own subclass. `AppCompatActivity` itself extends `Activity`
  (through its own chain), which is where all seven callback methods
  are actually declared and given their base behavior.
- **`@Override protected void onCreate(Bundle savedInstanceState)`** —
  the app opts into the contract by matching this exact name and
  parameter list; the `protected` modifier is preserved from the
  version being overridden, since Java doesn't allow narrowing
  visibility on an override.
- **`super.onCreate(savedInstanceState)`** — must run, and specifically
  must run as the very first statement, because `AppCompatActivity`'s
  own `onCreate` performs setup (window and theme configuration, among
  other things) that later calls in this same method — including
  `setContentView` on the next line — depend on already being done.
- **`setContentView(R.layout.activity_contact_detail)`** — this
  screen's own one-time setup work, placed in `onCreate` specifically
  because it only ever needs to happen once per Activity object, never
  again on every later `onStart`/`onResume`.
- **`@Override protected void onStart() { super.onStart(); }`** — an
  empty override, shown to make the contract's full shape visible; a
  real app would put resource-acquisition code here for anything that
  should restart every time this screen becomes visible again, not just
  on first creation.
- **`@Override protected void onResume() { super.onResume(); }`** — the
  same shape, for work that should happen only once this screen is
  truly interactive, not merely visible.
- **`@Override protected void onPause() { super.onPause(); }`** — the
  same shape, for work that must wrap up the instant focus is lost,
  quickly, since `onStop` may follow immediately.
- **`@Override protected void onStop() { super.onStop(); }`** — the
  same shape, for releasing anything that shouldn't keep running while
  this screen is entirely invisible.
- **`@Override protected void onDestroy() { super.onDestroy(); }`** —
  the same shape, for final cleanup, with the caveat (Collaboration,
  below) that this one specific method isn't guaranteed to run at all.

---

## Collaboration — how it actually runs

1. **User taps the app icon.** The system creates the Activity and
   calls `onCreate()` → `onStart()` → `onResume()`, in that order, all
   before the user can interact with anything — this is the only path
   where all three run back-to-back with nothing in between.
2. **User presses Home.** The system calls `onPause()`, then `onStop()`
   — the Activity object is *not* destroyed, just no longer visible,
   sitting in memory exactly as it was.
3. **User returns via the recent-apps switcher.** The system calls
   `onRestart()` → `onStart()` → `onResume()` — `onCreate()` is *not*
   called again, because this is the same still-alive Activity object
   from step 2, not a new one. This is the one legitimate way to
   distinguish "was only backgrounded" from "was actually recreated."
4. **The device rotates.** By default, the system destroys the current
   Activity object entirely and creates a brand-new one to replace it:
   `onPause()` → `onStop()` → `onDestroy()`, then immediately
   `onCreate()` again on the new object — this time with a non-null
   `Bundle`, followed by `onStart()` → `onResume()`. This is the
   concrete situation `savedInstanceState != null` actually detects.
5. **The app is backgrounded and the system needs the memory.** The
   system may simply kill the whole process outright, without calling
   `onDestroy()` at all — it only guaranteed to call `onPause()` and
   `onStop()` first, while the app could still respond. When the user
   later returns, an entirely new process starts and calls `onCreate()`
   fresh, with whatever `Bundle` had been saved before the kill, if any
   — from the app's own code's point of view, this looks identical to
   step 4, even though no `onDestroy()` ever ran in between.

---

## Why It's Shaped This Way

The design principle is **inversion of control over timing**: the
framework owns the schedule, the app only supplies logic for named
moments in it — rather than the app owning a persistent main loop and
polling the system for its own current state.

The alternative not chosen: giving each app its own long-running
top-level loop it fully controls, the way a desktop program's `main()`
or a game engine's own frame loop typically works, with the app
polling system state itself to notice when it should pause or stop. The
real cost: a phone runs dozens of installed apps sharing one battery
and a small amount of memory; a model where every app assumes it alone
controls a persistent loop doesn't scale to that, and polling for "am I
still visible?" wastes cycles the callback-driven model avoids
entirely by only calling code exactly when something has actually
changed.

The cost this pattern carries: timing is genuinely unpredictable from
the app's own point of view — code can't assume `onPause` and `onStop`
will always be far apart, or that `onDestroy` will run at all, which
forces anything time-sensitive (saving data, releasing a resource) to
happen as early and as fast as the contract allows, in `onPause`/`onStop`,
rather than being safely deferred to `onDestroy`.

---

## Recognizing It Elsewhere

Also recognized in: a game engine calling fixed lifecycle hooks
(`OnEnable`/`OnDisable`/`OnDestroy` in Unity) on objects it — not the
object itself — decides to create or remove; a web browser tab firing
`visibilitychange` and `pagehide` events the page can listen for but
never trigger itself; an operating system sending `SIGSTOP`/`SIGCONT`
to a process; a TCP connection's own state machine (`LISTEN` →
`ESTABLISHED` → `CLOSE_WAIT`), where the stack decides every transition
and the application only ever reacts to whichever state it's currently
in.

---

## Where This Actually Breaks

The most common real mistake: starting some ongoing resource — a
location listener, a camera preview, a sensor subscription — in
`onCreate()` (which runs once) instead of `onStart()` or `onResume()`
(which rerun every time the screen becomes visible again), while
stopping that same resource in `onDestroy()` instead of `onStop()` or
`onPause()`. The visible symptom: the resource keeps running and
draining battery or hogging hardware for as long as the app process
stays alive in the background, because `onDestroy()` may run much
later than expected — or, per step 5 above, may never run at all if the
process is simply killed — while `onStop()`/`onPause()` would have
reliably fired the moment the screen actually left the foreground.
