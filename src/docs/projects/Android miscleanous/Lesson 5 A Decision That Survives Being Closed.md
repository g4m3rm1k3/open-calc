# Lesson 5: A Decision That Survives Being Closed

**What you will build:** A real, working replacement for the hardcoded
`boolean isLoggedIn = false;` Lesson 4 left in `MainActivity`, flagged
with a `TODO` naming this exact lesson. `LoginActivity`'s "Log In" button
now writes a persisted `true` value, using `SharedPreferences`, before
navigating directly to `HomeActivity` — no longer through
`SecondActivity`, which this lesson's Connect the Pieces section
addresses directly. `MainActivity`'s router reads that same persisted
value instead of a hardcoded literal, so relaunching the app after a
previous successful login skips Login entirely. The transferable
problem: every value this project has used so far — a `String` read from
an `EditText`, a `boolean` local variable, an `Intent` extra — has lived
only as long as the specific object or method call that created it. The
instant an `Activity` is destroyed (the user swipes the app away, the
OS reclaims memory, the device restarts), every instance field and local
variable it held is gone completely — there is no version of Java's own
tools, alone, that survives that. This lesson is about the mechanism
Android provides specifically to survive it.

**What you need to know first:** Lesson 1 — `Activity`, the Manifest,
`Intent`, `startActivity`. Lesson 2 — `EditText`, reading input, `Intent`
extras. Lesson 3 — the back stack, `finish()`. Lesson 4 — the router
pattern in `MainActivity`, specifically the hardcoded
`boolean isLoggedIn = false;` this lesson exists to replace, and the
`if`/`else` conditional statement reading it.

**Terms used in this lesson**

- **`boolean`** — a Java primitive holding `true` or `false`.
  Reappearing here because this lesson's whole point is changing
  *where* the `boolean` `MainActivity`'s router reads actually comes
  from — no longer a hardcoded literal, but a value retrieved from
  persisted storage, still ultimately just `true` or `false` once read.
- **Conditional statement (`if`/`else`)** — a control-flow construct
  running one of two blocks based on a `boolean`. Reappearing here
  because `MainActivity`'s own `if`/`else`, built in Lesson 4, is left
  completely unchanged by this lesson — only the expression it checks
  changes, which is itself worth noting explicitly: this lesson never
  touches the branching logic at all, only what feeds it.
- **Manifest** — `AndroidManifest.xml`, declaring every component the OS
  may create. Reappearing here only in that no new `<activity>` entry is
  needed this lesson — no new screen is added — worth stating plainly
  rather than silently skipping the term altogether, since a reader
  scanning for "did this lesson touch the Manifest?" deserves a direct
  answer either way.
- **Process death** — the Android OS terminating an app's entire running
  process, discarding every object it held in memory — every `Activity`
  instance, every field, every local variable — without any code of the
  app's own choosing when it happens. This can happen because the user
  force-stops the app, swipes it away, the device restarts, or simply
  because the OS needs the memory back for something else and the app
  isn't currently on screen. This exists as a real, unavoidable fact of
  how a phone operating system manages many apps competing for limited
  memory — and it's the concrete reason a plain Java field, however
  carefully written, can never be a real solution to "remember whether
  this user logged in": every such field is gone, unconditionally, the
  moment process death happens, with nothing in ordinary Java code able
  to prevent or detect it in advance.

**Objects and methods used**

- **`Activity`**
  - *What it is:* The Android framework class representing one screen.
  - *Implementation:* `public class Activity extends ContextWrapper
    implements ComponentCallbacks2, ...`.
  - *Its use:* `LoginActivity` and `MainActivity`, both modified this
    lesson, are (through `AppCompatActivity`) subclasses of this,
    unchanged since Lesson 1.
  - *Type:* A public framework class, subclassed, never instantiated
    with `new`.
  - *Responsibility:* Owns a screen's lifecycle and exposes the
    callbacks your subclass overrides.
  - *Depends on:* Being constructed by the OS and declared in the
    Manifest.
  - *Connects to:* The OS creates and drives it; as of this lesson, it
    is also — through inheriting from `Context`, below — the object this
    lesson's code calls `getSharedPreferences` on.
  - *Shape:* The outermost architectural boundary in the app.

- **`AppCompatActivity`**
  - *What it is:* The support-library subclass of `Activity` every
    screen in this project extends.
  - *Implementation:* `public class AppCompatActivity extends
    FragmentActivity`, itself extending `Activity`.
  - *Its use:* Unchanged this lesson — `LoginActivity` and
    `MainActivity` both already extend this.
  - *Type:* A public class, subclassed.
  - *Responsibility:* Everything `Activity` does, plus compatibility
    shims.
  - *Depends on:* A Manifest declaration.
  - *Connects to:* Sits between app code and the framework's `Activity`.
  - *Shape:* A compatibility layer, invisible to app logic.

- **`onCreate(Bundle savedInstanceState)`**
  - *What it is:* A lifecycle callback, overridden by every screen.
  - *Implementation:* `protected void onCreate(@Nullable Bundle
    savedInstanceState)`, overridden with `@Override`.
  - *Its use:* Where `MainActivity`'s router logic runs, now reading
    real persisted state instead of a hardcoded literal.
  - *Type:* A `protected` instance method, overridden.
  - *Responsibility:* Gives a newly-created `Activity` its one-time
    setup window.
  - *Depends on:* Being called by the OS.
  - *Connects to:* Calls `super.onCreate(...)` first, same as always.
  - *Shape:* The callback boundary between framework timing and app
    logic.

- **`setContentView(int layoutResID)`**
  - *What it is:* An `Activity` method attaching a layout to the screen.
  - *Implementation:* `public void setContentView(@LayoutRes int
    layoutResID)`.
  - *Its use:* Unchanged this lesson in `LoginActivity`; still absent
    from `MainActivity`, exactly as Lesson 4 left it.
  - *Type:* A `public` instance method.
  - *Responsibility:* Inflates an XML layout into real `View` objects.
  - *Depends on:* A valid layout resource ID.
  - *Connects to:* Called by `onCreate`, in screens that show UI.
  - *Shape:* The seam between a layout file and the code that follows
    it.

- **`findViewById(int id)`**
  - *What it is:* A method retrieving a view created by
    `setContentView`.
  - *Implementation:* `public <T extends View> T findViewById(@IdRes int
    id)`.
  - *Its use:* Unchanged this lesson — still retrieves `LoginActivity`'s
    existing fields and button.
  - *Type:* A `public` instance method.
  - *Responsibility:* Searches the inflated hierarchy for a matching
    `android:id` and returns a live reference.
  - *Depends on:* `setContentView` having already run.
  - *Connects to:* Called after `setContentView`.
  - *Shape:* The bridge from declarative layout into imperative code.

- **`Button`**
  - *What it is:* A `View` subclass representing a tappable button.
  - *Implementation:* `public class Button extends TextView`, itself
    extending `View`.
  - *Its use:* `LoginActivity`'s existing "Log In" button — its
    listener's own body is what this lesson changes, not the button
    itself.
  - *Type:* A public class, created by layout inflation.
  - *Responsibility:* Renders as a tappable, labeled rectangle and
    reports taps to a registered listener.
  - *Depends on:* A unique `android:id` in the layout.
  - *Connects to:* Created by inflation; retrieved by `findViewById`;
    listened to via `setOnClickListener`.
  - *Shape:* A leaf view — the tappable surface.

- **`setOnClickListener(View.OnClickListener l)`**
  - *What it is:* A `View` method registering a tap callback.
  - *Implementation:* `public void setOnClickListener(@Nullable
    OnClickListener l)`; `OnClickListener` is a nested `View` interface
    with one method, `onClick(View v)`.
  - *Its use:* Already registered on Login's button since Lesson 2; this
    lesson changes what its lambda body does, adding the persistence
    call before the existing navigation.
  - *Type:* A `public` instance method.
  - *Responsibility:* Stores the given listener and arranges for its
    `onClick` to run once per tap.
  - *Depends on:* An object implementing `View.OnClickListener`.
  - *Connects to:* Called on the `Button`; the listener now does more
    work than it did in Lesson 2, per this lesson's own New Code.
  - *Shape:* A callback boundary between the OS's touch system and app
    logic.

- **`Intent`**
  - *What it is:* A framework class representing a request to start a
    component, optionally carrying data.
  - *Implementation:* `public Intent(Context packageContext, Class<?>
    cls)`.
  - *Its use:* Built by Login's listener, now targeting `HomeActivity`
    instead of `SecondActivity` — the one change to this lesson's
    `Intent` usage worth naming directly.
  - *Type:* A public class, constructed with `new`.
  - *Responsibility:* Carries a destination component and any attached
    data as one self-contained object.
  - *Depends on:* A `Context` and a target `Class`; optionally, extras.
  - *Connects to:* Built by a click listener; consumed by
    `startActivity`.
  - *Shape:* A data-transfer object at the Activity boundary.

- **`startActivity(Intent intent)`**
  - *What it is:* An `Activity` method asking the OS to launch the
    component an `Intent` describes.
  - *Implementation:* `public void startActivity(Intent intent)`.
  - *Its use:* Called by Login's listener, targeting `HomeActivity`; and
    unchanged in `MainActivity`'s own `if`/`else`.
  - *Type:* A `public` instance method.
  - *Responsibility:* Hands the `Intent` to the OS, which checks the
    Manifest and, if declared, constructs and starts the target.
  - *Depends on:* A fully-built `Intent`; the target declared in the
    Manifest.
  - *Connects to:* Called from a click listener or, in `MainActivity`,
    from inside the `if`/`else`.
  - *Shape:* The moment control passes to another screen.

- **`EditText`**
  - *What it is:* A `View` subclass representing an editable text field.
  - *Implementation:* `public class EditText extends TextView`, itself
    extending `View`.
  - *Its use:* Unchanged — `LoginActivity`'s existing username field.
  - *Type:* A public class, created by layout inflation.
  - *Responsibility:* Renders an editable field and exposes `getText()`
    to read its buffer.
  - *Depends on:* A unique `android:id`.
  - *Connects to:* Retrieved by `findViewById`; read via `getText()`.
  - *Shape:* A leaf view — the on-screen input surface.

- **`getText()`**
  - *What it is:* A `TextView` method (inherited by `EditText`)
    returning the field's current text.
  - *Implementation:* `public Editable getText()`.
  - *Its use:* Unchanged — still reads the username, which this lesson
    now also carries forward to `HomeActivity` instead of only
    `SecondActivity`.
  - *Type:* A `public` instance method.
  - *Responsibility:* Returns a live reference to the field's internal
    text buffer.
  - *Depends on:* Being called on an already-existing `EditText`.
  - *Connects to:* Called by the listener; chained with `toString()`.
  - *Shape:* The bridge from widget state into app logic.

- **`Editable`**
  - *What it is:* An interface representing mutable, editable text.
  - *Implementation:* `public interface Editable extends CharSequence,
    Spannable, Appendable`.
  - *Its use:* Unchanged — the real return type of `getText()`.
  - *Type:* An interface, never instantiated directly.
  - *Responsibility:* Represents text that changes in place while the
    widget renders it live.
  - *Depends on:* The `EditText` instance that owns the buffer.
  - *Connects to:* Returned by `getText()`; converted by `toString()`.
  - *Shape:* An internal representation seam, passed through only.

- **`toString()`**
  - *What it is:* A method converting an `Editable` into a plain,
    immutable `String` snapshot.
  - *Implementation:* `public String toString()`.
  - *Its use:* Unchanged — converts the username field's contents.
  - *Type:* A `public` instance method.
  - *Responsibility:* Produces a fixed copy of the current characters.
  - *Depends on:* An already-obtained `Editable`.
  - *Connects to:* Called on `getText()`'s result.
  - *Shape:* The conversion step between widget state and a plain value.

- **`String`**
  - *What it is:* Java's built-in immutable character-sequence class.
  - *Implementation:* `public final class String implements
    CharSequence, ...`.
  - *Its use:* The type the username is stored in, and, new this
    lesson, the type of the string keys (`"is_logged_in"`, `"username"`)
    used to store and retrieve values in `SharedPreferences`, below.
  - *Type:* A `public final` class.
  - *Responsibility:* Holds a fixed character sequence.
  - *Depends on:* Nothing external.
  - *Connects to:* Produced by `toString()`; used as keys and values
    throughout this lesson's persistence code.
  - *Shape:* A plain value type.

- **`Intent.putExtra(String name, String value)`**
  - *What it is:* An `Intent` method attaching a named piece of data.
  - *Implementation:* `public Intent putExtra(String name, String
    value)`.
  - *Its use:* Attaches the username to the `Intent` now targeting
    `HomeActivity`, the same mechanism previously used for
    `SecondActivity` in Lessons 2 and 3.
  - *Type:* A `public` instance method.
  - *Responsibility:* Stores the value in the `Intent`'s extras storage
    under the given key.
  - *Depends on:* An already-constructed `Intent`; a matching key on the
    receiving side.
  - *Connects to:* Called before `startActivity`; read by
    `getStringExtra` inside `HomeActivity`, modified this lesson to
    receive it.
  - *Shape:* The mechanism carrying data across the Activity boundary.

- **`SharedPreferences`**
  - *What it is:* An Android framework interface representing a small,
    persistent, private store of key-value pairs, saved to the device's
    own storage rather than kept only in memory.
  - *Implementation:* `public interface SharedPreferences` — from
    `android.content`; your code never implements this interface itself
    or constructs one with `new` — it's obtained by calling
    `getSharedPreferences`, below, which hands back a real object the
    framework itself constructs.
  - *Its use:* The mechanism this entire lesson exists to introduce —
    where `LoginActivity` writes `"is_logged_in" → true` after a
    successful login, and where `MainActivity`'s router, in this
    lesson's final unit, reads that same value back.
  - *Type:* A public interface; the object your code actually holds is
    some real class implementing it, supplied by the framework.
  - *Responsibility:* Persists a set of key-value pairs to the device's
    storage, associated with this app specifically, surviving not just
    the destruction of one `Activity` but full process death, and even
    a device restart — the file it's backed by lives in the app's own
    private storage area on disk, not in memory at all.
  - *Depends on:* Being obtained through `getSharedPreferences`, which
    itself depends on a `Context` (every `Activity` is one) and a
    filename to store the data under.
  - *Connects to:* Obtained via `getSharedPreferences`; written to
    through an `Editor`, obtained via `edit()`, below; read directly via
    methods like `getBoolean`, below, without needing an `Editor` at
    all.
  - *Shape:* A persistence boundary — the seam between values that live
    only as long as the objects holding them, and values that outlive
    the entire running process.

- **`Context.getSharedPreferences(String name, int mode)`**
  - *What it is:* A method, inherited by every `Activity` from
    `Context`, that opens (creating it if it doesn't exist yet) a named
    `SharedPreferences` store.
  - *Implementation:* `public abstract SharedPreferences
    getSharedPreferences(String name, int mode)` — declared on
    `android.content.Context`, which `Activity` extends (through
    `ContextWrapper`); this lesson's code calls it with the literal file
    name `"auth_prefs"` and the constant `Context.MODE_PRIVATE`, a fixed
    integer value meaning "only this app itself may read or write this
    file" — the only mode value Android has actually allowed since a
    security-hardening change several versions ago; other historical
    values still compile but are ignored or rejected at runtime.
  - *Its use:* Called at the start of both this lesson's new code
    blocks — once in `LoginActivity`, to write; once in `MainActivity`,
    to read — using the identical filename both times, so both ends are
    reading and writing the exact same underlying store.
  - *Type:* A `public` instance method (inherited, not overridden, by
    this project's own classes).
  - *Responsibility:* Locates (or creates, on first use) the named
    on-disk file backing this preferences store, and returns a live
    `SharedPreferences` object your code can read from or, through an
    `Editor`, write to.
  - *Depends on:* A `Context` to call it on (any `Activity` qualifies);
    a filename, and a mode constant.
  - *Connects to:* Called by `LoginActivity` and `MainActivity` alike;
    its return value is either read directly (`getBoolean`) or written
    through (`edit()`).
  - *Shape:* The entry point into the persistence boundary
    `SharedPreferences` itself represents.

- **`SharedPreferences.edit()`**
  - *What it is:* A method obtaining an object specifically for making
    changes to a `SharedPreferences` store.
  - *Implementation:* `SharedPreferences.Editor edit()` — declared on
    `SharedPreferences`; returns a nested interface,
    `SharedPreferences.Editor`.
  - *Its use:* Called once in `LoginActivity`'s listener, to begin
    writing the login state.
  - *Type:* An instance method, part of the `SharedPreferences`
    interface.
  - *Responsibility:* Hands back a separate `Editor` object specifically
    for staging changes — this store cannot be written to directly; all
    writes go through this dedicated object.
  - *Depends on:* An already-obtained `SharedPreferences` instance.
  - *Connects to:* Called on `SharedPreferences`; its return value has
    `putBoolean` and `apply` called on it, below.
  - *Shape:* The write-access seam of the persistence boundary, kept
    deliberately separate from the read-access methods
    `SharedPreferences` exposes directly.

- **`SharedPreferences.Editor.putBoolean(String key, boolean value)`**
  - *What it is:* A method staging a boolean value to be written under a
    given key.
  - *Implementation:* `Editor putBoolean(String key, boolean value)` —
    one of several typed `put` methods (`putString`, `putInt`, and
    others exist for their respective types); returns the same `Editor`
    it was called on, allowing chained calls.
  - *Its use:* Stages the value `true` under the key `"is_logged_in"`,
    inside `LoginActivity`'s listener.
  - *Type:* An instance method on `SharedPreferences.Editor`.
  - *Responsibility:* Records, in memory, that this key should be set
    to this value — the change is not yet actually saved to disk until
    `apply()`, below, is called.
  - *Depends on:* An `Editor` obtained via `edit()`.
  - *Connects to:* Called on the `Editor`; its staged change is what
    `apply()` actually commits.
  - *Shape:* One write, staged but not yet durable.

- **`SharedPreferences.Editor.apply()`**
  - *What it is:* A method that saves every change staged on an `Editor`
    to disk.
  - *Implementation:* `void apply()` — declared on
    `SharedPreferences.Editor`; a sibling method, `commit()`, does
    essentially the same job but returns a `boolean` indicating success
    and writes synchronously (blocking the calling code until the write
    finishes), where `apply()` writes in the background and returns
    immediately, with no result to check.
  - *Its use:* Called once, at the end of the chain of `put` calls in
    `LoginActivity`'s listener, actually committing the staged
    `"is_logged_in" → true` change to disk.
  - *Type:* An instance method on `SharedPreferences.Editor`, returning
    `void`.
  - *Responsibility:* Takes every change staged since `edit()` was
    called and writes it to the on-disk file, making it genuinely
    durable — readable by a future `getSharedPreferences` call even
    after this exact `Editor`, this `Activity`, and this entire process
    are long gone.
  - *Depends on:* One or more `put`-family calls already having staged
    something to write; without at least one, `apply()` has nothing new
    to save.
  - *Connects to:* Called after `putBoolean`; its effect is what
    `getBoolean`, below, in `MainActivity`, is later able to read back.
  - *Shape:* The final, durable-commit step of the write side of the
    persistence boundary — this is the exact line after which the value
    genuinely survives process death.

- **`SharedPreferences.getBoolean(String key, boolean defaultValue)`**
  - *What it is:* A method reading a previously stored boolean value
    directly off a `SharedPreferences` object, with no `Editor`
    involved.
  - *Implementation:* `boolean getBoolean(String key, boolean
    defaultValue)` — declared on `SharedPreferences` itself, not
    `Editor`; the second parameter is returned as-is if the given key
    was never set — there is no `null` case for a primitive `boolean`
    the way `Intent.getStringExtra` could return `null` in Lesson 2.
  - *Its use:* Called in `MainActivity`'s router, in this lesson's final
    unit, reading the value `LoginActivity` wrote — with `false` as the
    default, correctly matching what a brand-new install (one that has
    never called `putBoolean` at all) should behave as: not logged in.
  - *Type:* An instance method on `SharedPreferences`.
  - *Responsibility:* Looks up the given key in the store and returns
    its value, or the given default if that key was never written.
  - *Depends on:* An already-obtained `SharedPreferences` instance
    (read access requires no `Editor` at all, unlike writing).
  - *Connects to:* Called directly on `getSharedPreferences`'s return
    value; its result replaces the hardcoded literal Lesson 4 left in
    `MainActivity`'s `if` statement.
  - *Shape:* The read-access seam of the persistence boundary — the
    exact counterpart to `putBoolean`/`apply()` on the write side, and
    the line that finally fulfills Lesson 4's own `TODO` comment.

---

## Concept Unit: SharedPreferences and Surviving Process Death

### The Problem

Lesson 4's `MainActivity` reads a `boolean` that's hardcoded directly in
its own source code — it is, by construction, identical on every single
launch, which is exactly why it was flagged as a placeholder. A real
answer needs to come from *somewhere that remembers* what happened on a
previous run — specifically, whether `LoginActivity`'s button was ever
successfully tapped before. A plain Java field on `MainActivity` itself
cannot do this: that field is created fresh, from scratch, every single
time `MainActivity`'s `onCreate` runs, with no memory whatsoever of any
earlier run — because every earlier run's entire object, `MainActivity`
instance and all, was already destroyed and gone.

### Introduce the Concept in Isolation

A throwaway scratch Activity, with one button that writes a value, and a
log line at the very top of `onCreate` that reads it back:

```java
// throwaway, at the very top of ScratchActivity.onCreate
SharedPreferences prefs = getSharedPreferences("scratch_prefs", Context.MODE_PRIVATE);
boolean tapped = prefs.getBoolean("was_tapped", false);
Log.d("SCRATCH", "Read at launch: " + tapped);
```

```java
// throwaway, the scratch button's click listener
prefs.edit().putBoolean("was_tapped", true).apply();
```

First launch, before ever tapping the button:

```
D/SCRATCH: Read at launch: false
```

Tap the button, then — critically, not just pressing Back, but actually
force-stopping the app from the device's own Settings screen (or running
`adb shell am force-stop com.example.scratch` from a terminal), which
genuinely ends the whole process, discarding every object in memory —
and relaunch it fresh:

```
D/SCRATCH: Read at launch: true
```

That `true`, read by a brand-new `ScratchActivity` object, in a
brand-new process, with no possible reference to anything the previous,
now-fully-destroyed process held in memory, is the proof this lab exists
to establish: this value did not survive because some Java object
remembered it — every Java object from the previous run is completely
gone. It survived because it was written to a real file on the device's
own storage, entirely outside the lifetime of any `Activity`, or even
the app's own running process.

### Discard the Throwaway Example

This scratch project is deleted. The real project's version, built next,
uses the same four core calls — `getSharedPreferences`, `edit()`,
`putBoolean`/`apply()`, `getBoolean` — against real keys this project
actually depends on.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch
  addition.
- **Files affected:** `app/src/main/java/.../LoginActivity.java`
  (modified — its click listener, unchanged since Lesson 2, gains new
  lines and one changed target class).
- **Change type:** Modify.
- **Location:** Inside `LoginActivity`'s existing click listener, before
  the existing `Intent` construction and `startActivity` call.
- **Dependencies:** None beyond what earlier lessons already
  established — `SharedPreferences` requires no separate library or
  permission; it's part of the Android framework itself.

### The New Code

```java
SharedPreferences prefs = getSharedPreferences("auth_prefs", Context.MODE_PRIVATE);
prefs.edit().putBoolean("is_logged_in", true).apply();
```

### The Updated Project

```java
loginButton.setOnClickListener(v -> {
    String username = usernameField.getText().toString();

    SharedPreferences prefs = getSharedPreferences("auth_prefs", Context.MODE_PRIVATE); // ← new
    prefs.edit().putBoolean("is_logged_in", true).apply();                              // ← new

    Intent intent = new Intent(LoginActivity.this, HomeActivity.class); // ← changed target
    intent.putExtra("username", username);
    startActivity(intent);
});
```

As a whole, this listener now does three things in sequence where it
used to do two: read the typed username, exactly as before; **persist
the fact that login succeeded**, new this lesson; and launch the next
screen, still carrying the username along, but now aimed at
`HomeActivity` — the real destination this whole series has been
building toward — rather than the teaching placeholder,
`SecondActivity`, it targeted through Lesson 3.

### Mechanical Walkthrough

- **`getSharedPreferences("auth_prefs", Context.MODE_PRIVATE)`** — the
  new call this unit centers on, fully explained in the Header;
  `"auth_prefs"` is a literal file name chosen for this project — any
  string would work, but it must be the exact same string `MainActivity`
  uses in this lesson's next unit, for the same reason `Intent` extra
  keys had to match exactly in Lesson 2. `Context.MODE_PRIVATE` is a
  fixed integer constant declared on `Context`, meaning this file is
  accessible only to this app itself — no other app on the device can
  read or write it.
- **`prefs.edit()`** — fully explained in the Header; obtains the
  `Editor` object writes must go through.
- **`.putBoolean("is_logged_in", true)`** — fully explained in the
  Header; stages the value `true` under the key `"is_logged_in"` — a
  second string that, like `"auth_prefs"` just above it, must match
  exactly wherever it's read back.
- **`.apply()`** — fully explained in the Header; chained directly onto
  the same `Editor` `putBoolean` returned, committing the staged change
  to disk.
- **`new Intent(LoginActivity.this, HomeActivity.class)`** — a
  reappearing constructor call, fully explained in the Header;
  `HomeActivity.class` replaces `SecondActivity.class` here — the one
  change to this line since Lesson 3, worth calling out explicitly since
  it's easy to miss inside an otherwise-familiar line.
- **`intent.putExtra("username", username)`** — a reappearing call,
  fully explained in the Header; unchanged in mechanism, now attached to
  an `Intent` targeting a different class than it did in earlier
  lessons.
- **`startActivity(intent)`** — a reappearing call, fully explained in
  the Header; launches `HomeActivity`, pushing it onto the back stack.

### CS Lens

This is an instance of **durable storage** — a mechanism explicitly
designed to outlive the specific running process that wrote it, in
contrast to ordinary in-memory state, which is destroyed the instant its
owning process ends.

Also recognized in: a database committing a transaction to disk rather
than only holding it in a connection's memory; a text editor's
auto-save; a video game's save file, surviving a console being fully
powered off; a web browser's own cookie storage, persisting a logged-in
session across the browser being closed and reopened — functionally the
same problem this lesson's entire `SharedPreferences` mechanism solves,
on a different platform.

### SE Lens

`SharedPreferences` is deliberately a *simple* persistence mechanism —
flat key-value pairs, no queries, no relationships between entries — not
a full database. The alternative Android also offers, and this project
does not use, is a real embedded SQL database (Room, built on SQLite),
suited to structured, related, queryable data — many users, many orders,
foreign keys between them. For a single flag like "is this user
currently logged in," a full database would be considerable, unjustified
ceremony. The real cost `SharedPreferences` carries in exchange for that
simplicity: it has no concept of relationships or types beyond its fixed
set of primitives and `String` — storing anything more structured than
this lesson's single boolean (a whole user profile, say) would mean
either cramming it into several separate keys by hand, or accepting real
limitations this project would eventually outgrow, which is exactly why
larger Android projects reach for Room once their persisted data grows
past a small handful of flags like this one.

### Commands Needed

- `adb shell am force-stop <package name>` — the Android Debug Bridge
  command used in this unit's own isolated lab to genuinely end a
  running app's process (not just leave it via Back or Home), the only
  way to honestly test that a value survives *process death*
  specifically, rather than merely surviving a single `Activity` being
  replaced by another one within the same still-running process. The
  device's own Settings → Apps → (app name) → Force Stop does the exact
  same thing without a terminal, for anyone not using `adb` directly.

### Run It

```
Fresh install. Typed "alice", tapped Log In.
HomeActivity appeared, showing "alice" (this lesson's next unit wires
  the display; for now, confirm via a temporary Logcat line inside
  LoginActivity, immediately after apply():)
D/AUTHFLOW: is_logged_in written and applied.

App force-stopped from Settings, then relaunched — MainActivity's router
still hardcoded false at this point in the lesson, so LoginActivity
still appears again; the written value exists on disk, but nothing
reads it back yet. That's the next unit's job.
```

### Connection

The value is now genuinely, durably written — proven by this unit's own
lab to survive real process death, not just an `Activity` being
replaced. Nothing reads it back yet outside a temporary debug log line.
The next unit is where `MainActivity`'s router finally does.

---

## Concept Unit: The Router Reads Real State

### The Problem

Lesson 4 left `MainActivity` with `boolean isLoggedIn = false;` and a
comment naming this exact lesson as the place that value would become
real. The previous unit proved the value genuinely exists, durably, on
disk. This unit is where those two facts finally meet: replacing the
literal with a real read.

### Introduce the Concept in Isolation

No new isolated lab is required — the previous unit's own lab already
proved `getSharedPreferences`/`getBoolean`'s read side works correctly,
including its default-value behavior on a key that was never set (the
very first run, before any tap, correctly logged `false`). Per the
Repetition Rule, that proof stands; this unit applies it to the real
`MainActivity`, completing a promise made two lessons ago rather than
introducing a new mechanism.

### Discard the Throwaway Example

Not applicable — no new throwaway code in this unit.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch
  addition.
- **Files affected:** `app/src/main/java/.../MainActivity.java`
  (modified).
- **Change type:** Modify — replacing exactly one line, the hardcoded
  literal Lesson 4 flagged, and removing its `TODO` comment along with
  it.
- **Location:** The first line of `MainActivity.onCreate`, immediately
  after `super.onCreate(savedInstanceState)`, replacing
  `boolean isLoggedIn = false; // TODO: Lesson 5 replaces this...`
  exactly.
- **Dependencies:** `LoginActivity` must already be writing to the exact
  same `"auth_prefs"` file and `"is_logged_in"` key this unit reads,
  per the previous unit.

### The New Code

```java
SharedPreferences prefs = getSharedPreferences("auth_prefs", Context.MODE_PRIVATE);
boolean isLoggedIn = prefs.getBoolean("is_logged_in", false);
```

### The Updated Project

```java
package com.example.authflowdemo;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import androidx.appcompat.app.AppCompatActivity;

public class MainActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        SharedPreferences prefs = getSharedPreferences("auth_prefs", Context.MODE_PRIVATE); // ← new
        boolean isLoggedIn = prefs.getBoolean("is_logged_in", false);                       // ← new

        if (isLoggedIn) {
            startActivity(new Intent(MainActivity.this, HomeActivity.class));
        } else {
            startActivity(new Intent(MainActivity.this, LoginActivity.class));
        }
        finish();
    }
}
```

As a whole, `MainActivity.onCreate` is unchanged in shape from Lesson
4 — decide, launch, finish, still exactly three steps — but the first
of those three steps is, for the first time, a genuine question asked of
durable storage, rather than a fixed answer baked into the source code
itself. The `if`/`else` and the `finish()` below it are, deliberately,
not touched by this lesson at all.

### Mechanical Walkthrough

- **`getSharedPreferences("auth_prefs", Context.MODE_PRIVATE)`** — a
  reappearing call, fully explained in the Header and this lesson's
  first unit; using the identical filename `LoginActivity` writes to,
  which is what makes this a read of the *same* store, not a
  coincidentally similarly-named different one.
- **`prefs.getBoolean("is_logged_in", false)`** — the new call this
  unit centers on, fully explained in the Header; the key,
  `"is_logged_in"`, matches `LoginActivity`'s `putBoolean` call exactly;
  the default, `false`, is what a fresh install — one where
  `LoginActivity`'s button has never been tapped at all — correctly
  falls back to, sending such a user to Login, exactly as it should.
- **`if (isLoggedIn) { ... } else { ... }`** — a reappearing conditional
  statement, fully explained in Lesson 4; entirely unchanged by this
  lesson — only the value it now inspects has changed, not the
  branching logic itself.
- **`finish()`** — a reappearing call, fully explained in Lesson 3 and
  applied to this exact router role in Lesson 4; unchanged this lesson.

### CS Lens

No new hard concept in this unit specifically — durable storage was
already given its full Recognition treatment in the previous unit; this
unit is that same mechanism's read side, applied to the real router.

### SE Lens

This unit is a clean, minimal example of a design goal worth naming
directly: **isolating change**. Because `MainActivity`'s `if`/`else` was
written, back in Lesson 4, against a plain `boolean` — with no code
anywhere else caring *how* that `boolean`'s value was obtained — swapping
its source from a hardcoded literal to a real, persisted lookup required
touching exactly one line, and nothing else in this file, or in
`HomeActivity`, or in `LoginActivity`'s own `if`/`else`-free code, needed
any change at all to accommodate it. The alternative — writing the
`if`/`else` originally against `getSharedPreferences(...).getBoolean(...)`
directly inline, with no intermediate `boolean` variable — would have
worked identically in Lesson 4, and would have made this lesson's own
change exactly as small. The real, if modest, cost being accepted by
keeping the intermediate `isLoggedIn` variable at all: two extra lines
of ceremony, for a benefit — a name that documents what the value
*means*, separate from where it *came from* — this project judges worth
it given how central this one flag now is to the entire app's routing
decision.

### Commands Needed

No new terminal commands beyond `adb shell am force-stop`, already
covered in the previous unit, reused here to verify this unit's own
behavior.

### Run It

```
Fresh install (or after clearing the app's storage from Settings):
  App launches → LoginActivity appears (is_logged_in defaults to false).

Typed "alice", tapped Log In:
  HomeActivity appears, showing "alice".

App force-stopped from Settings, then relaunched:
  HomeActivity appears immediately — LoginActivity never shown at all —
  because MainActivity's router now reads a genuinely persisted `true`.
```

### Connection

This closes the loop this entire lesson set out to build, and directly
fulfills the specific promise Lesson 4 made in its own `TODO` comment:
a login that happened in a previous, now fully-ended process is
correctly remembered the next time the app launches, with the router's
own branching logic completely unaware of, and unchanged by, exactly how
that answer was obtained.

---

## Connect the Pieces

Follow one value, `is_logged_in`, from write to read, across two
completely separate app launches. On the first launch, `MainActivity`'s
router calls `getSharedPreferences("auth_prefs", ...)`, finds no
`"is_logged_in"` key has ever been written, and `getBoolean` correctly
falls back to its default, `false`, sending the user to `LoginActivity`.
The user types a username and taps "Log In." Inside that tap's listener,
`getSharedPreferences` opens the exact same `"auth_prefs"` store, `edit()`
obtains an `Editor`, `putBoolean("is_logged_in", true)` stages the
change, and `apply()` commits it to a real file on the device's own
storage — durable now, independent of any object in memory.
`HomeActivity` opens next, carrying the username along exactly as
`SecondActivity` once did. The user closes the app entirely — force-
stopped, its whole process ended, every object from this session
genuinely gone. Later, the user taps the app icon again: a brand-new
`MainActivity` object is constructed, in a brand-new process, with
absolutely no memory of anything from before — except that its very
first real line, `getBoolean("is_logged_in", false)`, reads the same
on-disk file the previous session's `LoginActivity` wrote to, finds
`true`, and the router sends the user straight to `HomeActivity`,
skipping Login entirely — a decision made possible by nothing surviving
in memory at all, only a value written, on purpose, to outlive it.

## What Breaks Without This

Change `MainActivity`'s key back to a typo — `getBoolean("isLoggedIn",
false)`, without the underscore, while leaving `LoginActivity`'s own
`putBoolean("is_logged_in", true)` untouched. Log in successfully, force-
stop the app, and relaunch:

```
LoginActivity appears again — as if the login never happened at all,
even though "auth_prefs" genuinely still contains "is_logged_in" → true
on disk.
```

No crash, no error — `getBoolean` simply falls back to its default,
`false`, for a key that was never actually written under this
particular (mistyped) name. This is the identical class of silent
failure Lesson 2's own mismatched `Intent` extra key produced, now shown
in this lesson's own persistence code: nothing in Java or Android checks
that these string keys agree across files; only running the app and
observing the wrong behavior reveals it. Restore the matching key and
confirm a successful login is correctly remembered across a force-stop
before moving on.

## Exercises

- Apply this exact same `SharedPreferences` write — `putBoolean(
  "is_logged_in", true)` — to `SignupActivity`'s own submit listener,
  built in Lesson 3, so a new account creation is remembered by the
  router exactly as a login is. This is deliberate repetition, applying
  this lesson's mechanism to a second, already-familiar screen.
- `SecondActivity`, built in Lesson 2 and still present in the project,
  is no longer reached by either `LoginActivity` or `SignupActivity` as
  of this lesson. Confirm this for yourself by searching the project for
  every remaining reference to `SecondActivity.class` — there should be
  none left in either file — and consider, without deleting anything
  yet, what (if anything) a real project would do with a screen that's
  become unreachable this way.

## Definition of Done

- [ ] `LoginActivity`'s submit listener writes `"is_logged_in" → true`
      to a `SharedPreferences` store named `"auth_prefs"`, using
      `MODE_PRIVATE`, before navigating to `HomeActivity`.
- [ ] `MainActivity`'s router reads that same key from that same store,
      with `false` as its default, replacing the hardcoded literal and
      `TODO` comment Lesson 4 left behind.
- [ ] A fresh install (or cleared app storage) correctly routes to
      Login; a successful login followed by a genuine force-stop and
      relaunch correctly routes straight to Home instead.
- [ ] The "what breaks without this" mismatched-key failure was
      reproduced on purpose and the correct key restored afterward.
- [ ] Commit, with a message explaining *why*: e.g. `Persist the login
      state with SharedPreferences and read it in MainActivity's router
      — fulfills the TODO left in Lesson 4, making the router's decision
      survive process death instead of resetting on every launch.`

**Next lesson:** Lesson 6 addresses a real gap this lesson's own flow
still has: with `LoginActivity` still sitting on the back stack
underneath the `HomeActivity` it just launched, pressing Back from
`HomeActivity` right now lands the user right back on the Login screen
they already got past — exactly the kind of back-stack problem Lesson 3
flagged as out of scope for lateral navigation, and the one this whole
series has been building toward being able to solve correctly.