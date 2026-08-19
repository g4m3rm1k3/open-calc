# Wrapping an Action as an Object: OnClickListener and Runnable

**What problem this solves.** Code that triggers an action — a button
being tapped — is often written and owned by a completely different
part of a program than the code that knows how to actually perform that
action, and the trigger may need to fire an arbitrary, unknown number of
times, at moments that can't be known in advance. Wiring the trigger
directly to a hard-coded call to one specific action would mean the
triggering code has to know, by name, exactly what to do — coupling two
things that would ideally stay independent. The abstract fix: wrap "the
action to perform" itself as an object, with a single method that
performs it, and hand that object to the trigger. The trigger only ever
needs to call one generic method on it, never knowing or caring what's
actually inside.

**Classic pattern family.** This is the Gang-of-Four **Command**
pattern: encapsulating a request or action as a standalone object, so it
can be passed around, stored, and invoked later without whoever invokes
it needing to know anything about its concrete implementation.

**Where you'll meet it in Android.** `android.view.View.OnClickListener`,
passed to `View.setOnClickListener(...)`, and `java.lang.Runnable`,
passed to `View.postDelayed(...)`.

**Terms used in this pattern.**

- **Interface** — a contract naming a method with no implementation of
  its own. It exists here so the trigger (a `Button`, a delay scheduler)
  can accept and later call *any* action object at all, as long as it
  satisfies this one shared contract, without needing a separate
  accepted type for every possible action anyone might ever want to
  perform.
- **Anonymous class** — a class declared and instantiated in a single
  expression, with no separate name of its own, implementing an
  interface inline exactly once, at the exact point it's needed. It
  exists so a one-off implementation, used in exactly one place, doesn't
  require a separate, named class declaration just to hold a few lines
  of logic.

**Objects and methods used.**

- **`View.OnClickListener`**
  *What it is:* a functional interface — one abstract method.
  *Implementation:* `public interface OnClickListener { void onClick(View v); }`.
  *Its use:* the contract a tap-handling Command object must implement
  — the single method a `View`'s own internal tap-detection code
  eventually calls.
- **`View.setOnClickListener(OnClickListener)`**
  *What it is:* an instance method on `View`.
  *Implementation:* `public void setOnClickListener(@Nullable
  OnClickListener l)`.
  *Its use:* stores the given Command object on the view, to be invoked
  later, at some unknown future moment the view itself decides.
- **`Runnable`**
  *What it is:* a functional interface from the core Java standard
  library, not Android-specific.
  *Implementation:* `public interface Runnable { void run(); }`.
  *Its use:* the same underlying idea as `OnClickListener`, usable
  anywhere an action needs to be handed off to run later — not only in
  response to a tap.
- **`View.postDelayed(Runnable, long)`**
  *What it is:* an instance method on `View`.
  *Implementation:* `public boolean postDelayed(Runnable action, long
  delayMillis)`.
  *Its use:* stores the given Command object together with a delay, and
  schedules it to run once that delay has genuinely elapsed, on the
  same thread the view belongs to.

---

## The Shape

Three roles, filled differently by the two examples below:

- **The invoker** — `Button`'s own internal tap-detection code, or the
  delay-scheduling mechanism behind `postDelayed`. Knows only that it
  holds *some* object implementing a one-method interface, and calls
  that one method when the right moment arrives.
- **The Command object** — the anonymous `OnClickListener`, the
  anonymous `Runnable`. Holds whatever real logic and captured data
  (`contactRepository`, `currentContact`, `deleteButton`) it needs to
  actually perform the action, fixed at the moment it was created.
- **The receiver** — `contactRepository`, `deleteButton` — the real
  object that ends up doing the actual work once the Command's single
  method runs.

The relationship: both `setOnClickListener` and `postDelayed` see only
the interface type — neither one has any idea what's really inside the
object it was handed, or what that object is actually going to do once
called. The gap between "Command object created and handed over" and
"Command object's method actually called" can be anywhere from
immediate to never (the button is never tapped) to a fixed delay
(`postDelayed`) — the invoker doesn't control or know this timing; it
only guarantees that whenever the right moment comes, it will call the
one method it knows about.

```
  code that builds the Command
        |
        |  new View.OnClickListener() { onClick(View v) { ... } }
        v
  deleteButton.setOnClickListener(command)  <- invoker only sees the interface
        |
        |   (unknown future moment: user taps)
        v
  command.onClick(v)  -> runs the real, captured logic
```

---

## Mechanical Walkthrough

```java
Button deleteButton = findViewById(R.id.delete_button);

deleteButton.setOnClickListener(new View.OnClickListener() {
    @Override
    public void onClick(View v) {
        contactRepository.delete(currentContact);
    }
});
```

The same underlying pattern, used for a timed action rather than a tap:

```java
deleteButton.postDelayed(new Runnable() {
    @Override
    public void run() {
        deleteButton.setEnabled(true);
    }
}, 1000);
```

- **`Button deleteButton = findViewById(R.id.delete_button);`** —
  obtains the real `Button` object; not itself part of this pattern's
  shape, shown only so the calls below have something to be made on.
- **`deleteButton.setOnClickListener(new View.OnClickListener() { ... });`**
  — constructs an anonymous class implementing `OnClickListener` and
  immediately hands it to the button. Nothing inside `onClick`'s body
  runs at this point — this line only *registers* the Command; it does
  not invoke it.
- **`@Override public void onClick(View v)`** — fulfills the interface's
  one required method; `v` is the specific `View` that was actually
  tapped, handed in by the framework at the moment of the real tap, not
  known at the time this code was written.
- **`contactRepository.delete(currentContact);`** — the real action,
  deferred entirely until `onClick` is actually called; both
  `contactRepository` and `currentContact` are read from the enclosing
  scope at the moment this anonymous class was created, and have to
  still be valid whenever this eventually runs, even if that's much
  later.
- **`deleteButton.postDelayed(new Runnable() { ... }, 1000);`** — the
  same underlying idea (wrap an action as an object, hand it to
  something else to invoke later) applied to a timer instead of a tap;
  `1000` is the delay in milliseconds before the framework will call
  `run()` on its own.
- **`@Override public void run()`** — fulfills `Runnable`'s one
  required method; unlike `onClick`, it takes no parameters at all,
  since there's no originating tap event to describe here.
- **`deleteButton.setEnabled(true);`** — the deferred action itself,
  running automatically once the scheduled delay has passed, with no
  user action required to trigger it.

---

## Collaboration — how it actually runs

1. `deleteButton.setOnClickListener(...)` runs once, at setup time,
   handing the button a Command object — nothing about `delete(...)`
   runs yet.
2. Time passes — anywhere from immediately to never, entirely dependent
   on user behavior that neither this code nor the button's own code
   controls.
3. If and when the user actually taps this specific button, the
   button's own internal tap-detection machinery calls `onClick(v)` on
   whichever object was stored in step 1.
4. Only at that moment does `contactRepository.delete(currentContact)`
   actually run.
5. Separately, `deleteButton.postDelayed(...)` schedules its own
   `Runnable` to run automatically, once, after 1000 milliseconds have
   genuinely elapsed — unlike the click listener, this one doesn't
   depend on any user action at all, only on time passing.

---

## Why It's Shaped This Way

The design principle is **decoupling when something should happen from
what should happen**, so the same generic triggering mechanism — a
button, a delay scheduler — can be reused for literally any action,
with the action's own code needing no knowledge of buttons or timers at
all.

The alternative not chosen: giving `View` a fixed, hard-coded method
like `deleteContactOnTap()` that it calls directly. The real cost: a
`Button` class would need a different hard-coded method for literally
every possible thing any app might ever want to happen on a tap, which
is unworkable at the scale of every button in every Android app ever
written.

The cost this pattern itself carries: an extra layer of indirection — an
interface, an implementing object — even for the simplest one-line
action, and, the real, sharp edge of it: anything the Command object's
body references is captured and kept alive for as long as the Command
object itself might still be called, which is a real, common source of
memory leaks when a Command outlives the screen it was created on.

---

## Recognizing It Elsewhere

Also recognized in: a text editor's undo stack, where every user action
is stored as an object that can be invoked — and, for undo, reversed —
later, in order; a job queue in a task-scheduling system, where each
queued job is an action object waiting for a worker to run it; a remote
control's buttons, each configured to invoke a stored command object
rather than being hard-wired to one specific device function; an event
bus publishing a message that any number of independent handler objects
may act on later.

---

## Where This Actually Breaks

The most common real mistake: an anonymous `OnClickListener` or
`Runnable` created inside an `Activity` or `Fragment` implicitly holds a
hidden reference back to that enclosing object — a non-static inner or
anonymous class always holds a reference to the outer instance that
created it, whether or not its own body ever actually uses that
reference. If this Command outlives the screen — a `postDelayed`
`Runnable` scheduled with a long delay, still pending after the user has
already left the screen — the screen's own `Activity` object can't be
garbage collected until the delayed `Runnable` finally runs or is
explicitly cancelled. This is a real, common Android memory leak that
shows no symptom at all until memory profiling reveals `Activity`
instances that should have been destroyed but are still alive.
