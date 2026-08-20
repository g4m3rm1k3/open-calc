# Lesson 6: Closing the Door Behind You

**What you will build:** A fix for a real, currently-existing gap:
right now, pressing Back from `HomeActivity` lands the user on
`LoginActivity` — a screen they already got past. Worse, if the user
bounced between Login and Signup a few times first (Lesson 3's own
lateral navigation, working exactly as designed), several instances of
both screens are sitting on the back stack underneath `HomeActivity`,
and a single, ordinary `finish()` call — the tool Lesson 4 already used
correctly for the router — cannot remove all of them at once. This
lesson introduces `Intent` flags, which operate on the back stack as a
whole rather than one `Activity` at a time, and applies them to both
`LoginActivity`'s and `SignupActivity`'s submit listeners so that a
successful login or signup genuinely closes the door on every
pre-authentication screen behind it, no matter how many of them
happen to be stacked up. The transferable problem: `finish()`,
introduced in Lesson 3 and used correctly in Lesson 4, is a *scalpel* —
it removes exactly the one `Activity` that calls it, and nothing else.
Some situations, like this one, need something closer to a clean slate.

**What you need to know first:** Lesson 1 — `Activity`, `Intent`,
`startActivity`. Lesson 3 — the back stack, deliberately *not* calling
`finish()` between Login and Signup, and the fact that this leaves both
screens genuinely stacked, each real bounce adding one more entry.
Lesson 4 — `finish()`, called correctly by the router, immediately after
redirecting. Lesson 5 — the real, persisted login flow this lesson
completes.

**Terms used in this lesson**

- **Back stack** — the ordered, last-in-first-out record of every
  `Activity` currently beneath the one on screen. Reappearing here
  because this entire lesson is about a real, concrete gap in how this
  project has managed it so far — Login and Signup instances
  accumulating underneath Home with no way, until this lesson, to clear
  them all at once.
- **Task** — the formal Android name for what this series has been
  calling the back stack. Every `Activity` belongs to exactly one task,
  and a task's own back stack is precisely the ordered list of
  Activities this series has already been reasoning about since Lesson
  3 — "back stack" and "task's back stack" name the same structure; this
  lesson introduces the formal term specifically because the `Intent`
  flags it teaches are named directly after it — `FLAG_ACTIVITY_NEW_TASK`
  and `FLAG_ACTIVITY_CLEAR_TASK`, below — and those names make little
  sense without first knowing what a "task" actually refers to.

**Objects and methods used**

- **`Activity`**
  - *What it is:* The Android framework class representing one screen.
  - *Implementation:* `public class Activity extends ContextWrapper
    implements ComponentCallbacks2, ...`.
  - *Its use:* `LoginActivity` and `SignupActivity`, both modified this
    lesson, are, through `AppCompatActivity`, subclasses of this,
    unchanged since Lesson 1.
  - *Type:* A public framework class, subclassed, never instantiated
    with `new`.
  - *Responsibility:* Owns a screen's lifecycle and exposes the
    callbacks your subclass overrides.
  - *Depends on:* Being constructed by the OS and declared in the
    Manifest.
  - *Connects to:* The OS creates and drives it; every instance started
    via `startActivity` occupies a position in its task's back stack —
    the exact structure this lesson's new flags reach in and reshape.
  - *Shape:* The outermost architectural boundary in the app.

- **`AppCompatActivity`**
  - *What it is:* The support-library subclass of `Activity` every
    screen in this project extends.
  - *Implementation:* `public class AppCompatActivity extends
    FragmentActivity`, itself extending `Activity`.
  - *Its use:* Unchanged this lesson.
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
  - *Its use:* Unchanged this lesson — still where each screen's setup
    runs; this lesson's own change is entirely inside the click
    listeners `onCreate` registers, not `onCreate` itself.
  - *Type:* A `protected` instance method, overridden.
  - *Responsibility:* Gives a newly-created `Activity` its one-time
    setup window.
  - *Depends on:* Being called by the OS.
  - *Connects to:* Calls `super.onCreate(...)` first, same as always.
  - *Shape:* The callback boundary between framework timing and app
    logic.

- **`findViewById(int id)`**
  - *What it is:* A method retrieving a view created by
    `setContentView`.
  - *Implementation:* `public <T extends View> T findViewById(@IdRes int
    id)`.
  - *Its use:* Unchanged — still retrieves both screens' existing fields
    and buttons.
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
  - *Its use:* Unchanged — `LoginActivity`'s "Log In" button and
    `SignupActivity`'s "Create Account" button, whose listeners this
    lesson modifies.
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
  - *Its use:* Already registered on both buttons; this lesson changes
    what each listener's body does, not the registration itself.
  - *Type:* A `public` instance method.
  - *Responsibility:* Stores the given listener and arranges for its
    `onClick` to run once per tap.
  - *Depends on:* An object implementing `View.OnClickListener`.
  - *Connects to:* Called on each `Button`; the listener's body is what
    this lesson's new code lives inside.
  - *Shape:* A callback boundary between the OS's touch system and app
    logic.

- **`EditText`**
  - *What it is:* A `View` subclass representing an editable text field.
  - *Implementation:* `public class EditText extends TextView`, itself
    extending `View`.
  - *Its use:* Unchanged — both screens' existing username fields.
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
  - *Its use:* Unchanged — still reads each screen's username field.
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
  - *Its use:* Unchanged — converts each screen's username field.
  - *Type:* A `public` instance method.
  - *Responsibility:* Produces a fixed copy of the current characters.
  - *Depends on:* An already-obtained `Editable`.
  - *Connects to:* Called on `getText()`'s result.
  - *Shape:* The conversion step between widget state and a plain value.

- **`String`**
  - *What it is:* Java's built-in immutable character-sequence class.
  - *Implementation:* `public final class String implements
    CharSequence, ...`.
  - *Its use:* Unchanged — the type the username is stored in, and the
    type of every key this lesson's `SharedPreferences` and `Intent`
    calls use.
  - *Type:* A `public final` class.
  - *Responsibility:* Holds a fixed character sequence.
  - *Depends on:* Nothing external.
  - *Connects to:* Produced by `toString()`; used throughout.
  - *Shape:* A plain value type.

- **`Intent`**
  - *What it is:* A framework class representing a request to start a
    component, optionally carrying data and, as of this lesson,
    optionally carrying flags controlling how it affects the back
    stack.
  - *Implementation:* `public Intent(Context packageContext, Class<?>
    cls)`.
  - *Its use:* Built by both listeners, unchanged in construction; now
    additionally configured with `setFlags`, below, before being handed
    to `startActivity`.
  - *Type:* A public class, constructed with `new`.
  - *Responsibility:* Carries a destination component, any attached
    data, and, as of this lesson, any flags describing how the OS
    should treat the back stack when launching it.
  - *Depends on:* A `Context` and a target `Class`; optionally, extras
    and flags.
  - *Connects to:* Built by a click listener; configured via `putExtra`
    and `setFlags`; consumed by `startActivity`.
  - *Shape:* A data-transfer object at the Activity boundary — as of
    this lesson, one that can also carry instructions about the task
    structure itself, not just about the single hand-off it represents.

- **`Intent.putExtra(String name, String value)`**
  - *What it is:* An `Intent` method attaching a named piece of data.
  - *Implementation:* `public Intent putExtra(String name, String
    value)`.
  - *Its use:* Unchanged — still attaches the username to the `Intent`
    launching `HomeActivity`.
  - *Type:* A `public` instance method.
  - *Responsibility:* Stores the value in the `Intent`'s extras storage
    under the given key.
  - *Depends on:* An already-constructed `Intent`; a matching key on the
    receiving side.
  - *Connects to:* Called before `startActivity`; read by
    `getStringExtra` inside `HomeActivity`.
  - *Shape:* The mechanism carrying data across the Activity boundary.

- **`Intent.setFlags(int flags)`**
  - *What it is:* An `Intent` method attaching one or more flags
    controlling how the OS should treat the task and back stack when
    this `Intent` is used to start an `Activity`.
  - *Implementation:* `public Intent setFlags(int flags)` — declared on
    `Intent`; accepts an `int`, because Android flags are, at the
    implementation level, individual bits combined with the bitwise-OR
    operator `|`, allowing more than one to apply at once. This lesson
    passes `Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK`
    — two fixed integer constants declared on `Intent`, combined into
    one value.
    `FLAG_ACTIVITY_CLEAR_TASK` instructs the OS to clear any existing
    task associated with this `Activity` before starting it fresh — every
    `Activity` currently on that task's back stack is removed.
    `FLAG_ACTIVITY_NEW_TASK` instructs the OS to start this `Activity` as
    the root of a task, and — this is why the Android documentation
    requires the two flags be used together — `CLEAR_TASK` has no
    defined, reliable effect unless `NEW_TASK` is also present, since
    clearing "the task" presumes a task boundary that `NEW_TASK` is what
    actually establishes here.
  - *Its use:* Set on the `Intent` launching `HomeActivity`, in both
    `LoginActivity`'s and `SignupActivity`'s submit listeners, replacing
    every previous `Activity` on the back stack — however many
    accumulated from Lesson 3's lateral bouncing — with `HomeActivity`
    alone.
  - *Type:* A `public` instance method, returning the same `Intent` it
    was called on, allowing it to be chained with the constructor call
    that builds the `Intent` in the first place.
  - *Responsibility:* Attaches instructions, as raw bits, describing how
    the OS's own task-management system should behave when this
    specific `Intent` is handed to `startActivity` — distinct from
    `putExtra`, which attaches ordinary application data the *receiving*
    `Activity` reads; these flags are read by the OS itself, before
    `HomeActivity`'s own code ever runs at all.
  - *Depends on:* Being called on an already-constructed `Intent`,
    before that `Intent` is passed to `startActivity`.
  - *Connects to:* Called on the `Intent`; read by the OS's own
    component-launch machinery when `startActivity` hands the `Intent`
    over — not by any code this project itself has written.
  - *Shape:* A control channel between app code and the OS's own
    task-management system — a different kind of seam than `putExtra`'s
    plain data channel, even though both are attached to the same
    `Intent` object.

- **`startActivity(Intent intent)`**
  - *What it is:* An `Activity` method asking the OS to launch the
    component an `Intent` describes.
  - *Implementation:* `public void startActivity(Intent intent)`.
  - *Its use:* Unchanged in how it's called — still one line, still the
    final step of each listener — but its effect is now shaped by the
    flags this lesson's new `setFlags` call attaches beforehand.
  - *Type:* A `public` instance method.
  - *Responsibility:* Hands the `Intent` to the OS, which checks the
    Manifest, and, as of this lesson, also inspects any flags attached
    to decide how to treat the existing task before constructing and
    starting the target.
  - *Depends on:* A fully-built `Intent`; the target declared in the
    Manifest.
  - *Connects to:* Called from a click listener, after `putExtra` and,
    new this lesson, `setFlags`, have both already configured the
    `Intent` it's given.
  - *Shape:* The moment control passes to another screen — and, as of
    this lesson, potentially the moment an entire task's back stack is
    rebuilt from scratch around that hand-off.

- **`SharedPreferences`**
  - *What it is:* An Android framework interface representing a small,
    persistent, private store of key-value pairs.
  - *Implementation:* `public interface SharedPreferences` — obtained
    via `getSharedPreferences`, below, never constructed with `new`.
  - *Its use:* Unchanged — `LoginActivity`'s listener still writes
    `"is_logged_in" → true`, exactly as Lesson 5 built it, immediately
    before this lesson's new flag-setting code.
  - *Type:* A public interface.
  - *Responsibility:* Persists key-value pairs to the device's own
    storage, surviving process death.
  - *Depends on:* Being obtained through `getSharedPreferences`.
  - *Connects to:* Obtained via `getSharedPreferences`; written through
    an `Editor`.
  - *Shape:* A persistence boundary, unrelated to and unaffected by this
    lesson's own back-stack changes — worth noting explicitly, since
    both mechanisms appear in the same listener this lesson modifies,
    but solve genuinely different problems.

- **`Context.getSharedPreferences(String name, int mode)`**
  - *What it is:* A method, inherited from `Context`, opening a named
    `SharedPreferences` store.
  - *Implementation:* `public abstract SharedPreferences
    getSharedPreferences(String name, int mode)`.
  - *Its use:* Unchanged — still called with `"auth_prefs"` and
    `Context.MODE_PRIVATE`, exactly as Lesson 5 established.
  - *Type:* A `public` instance method (inherited).
  - *Responsibility:* Locates or creates the named on-disk file and
    returns a live `SharedPreferences` object.
  - *Depends on:* A `Context`, a filename, a mode constant.
  - *Connects to:* Called by `LoginActivity`; its return value is
    written through via `edit()`.
  - *Shape:* The entry point into the persistence boundary.

- **`SharedPreferences.edit()`**
  - *What it is:* A method obtaining an object for writing to a
    `SharedPreferences` store.
  - *Implementation:* `SharedPreferences.Editor edit()`.
  - *Its use:* Unchanged.
  - *Type:* An instance method on `SharedPreferences`.
  - *Responsibility:* Hands back an `Editor` for staging changes.
  - *Depends on:* An already-obtained `SharedPreferences` instance.
  - *Connects to:* Its return value has `putBoolean` and `apply` called
    on it.
  - *Shape:* The write-access seam of the persistence boundary.

- **`SharedPreferences.Editor.putBoolean(String key, boolean value)`**
  - *What it is:* A method staging a boolean value to be written.
  - *Implementation:* `Editor putBoolean(String key, boolean value)`.
  - *Its use:* Unchanged — stages `true` under `"is_logged_in"`.
  - *Type:* An instance method on `SharedPreferences.Editor`.
  - *Responsibility:* Records, in memory, a pending change.
  - *Depends on:* An `Editor` obtained via `edit()`.
  - *Connects to:* Its staged change is committed by `apply()`.
  - *Shape:* One write, staged but not yet durable.

- **`SharedPreferences.Editor.apply()`**
  - *What it is:* A method saving every staged change to disk.
  - *Implementation:* `void apply()`.
  - *Its use:* Unchanged — commits the `"is_logged_in"` change.
  - *Type:* An instance method on `SharedPreferences.Editor`.
  - *Responsibility:* Writes every staged change to the on-disk file.
  - *Depends on:* At least one prior `put`-family call.
  - *Connects to:* Called after `putBoolean`.
  - *Shape:* The final, durable-commit step of the persistence write.

- **`finish()`**
  - *What it is:* An `Activity` instance method that ends the calling
    `Activity`, removing it — and only it — from the back stack.
  - *Implementation:* `public void finish()`.
  - *Its use:* Not called anywhere in this lesson's own new code — a
    deliberate absence this unit's SE Lens addresses directly: this
    lesson's problem is exactly the kind `finish()` alone cannot solve,
    which is why it reaches for `setFlags` instead.
  - *Type:* A `public` instance method.
  - *Responsibility:* Removes the calling `Activity`, specifically, from
    the back stack.
  - *Depends on:* Nothing beyond the `Activity` it's called on already
    existing.
  - *Connects to:* Used correctly, elsewhere in this project, by
    `MainActivity`'s router (Lesson 4) — contrasted directly in this
    lesson's own SE Lens with the broader, task-level tool
    `FLAG_ACTIVITY_CLEAR_TASK` provides.
  - *Shape:* A scalpel — precise, single-`Activity` removal — deliberately
    contrasted in this lesson with a broader tool operating on an entire
    task at once.

---

## Concept Unit: The Real Problem — Instances Left Behind

### The Problem

Lesson 3 built lateral navigation between Login and Signup specifically
*without* calling `finish()`, correctly, because either screen is a
legitimate place for Back to return the user to — while the user is
still deciding between them. But that same design choice means every
lateral bounce leaves a real `Activity` instance sitting on the back
stack. A user who taps Signup, then Login, then Signup again, before
finally submitting, has three extra screens stacked up underneath
whatever they eventually log in from — and Lesson 4's own use of
`finish()`, correct as it is for the router's own single `Activity`,
offers no way to remove more than one `Activity` at a time.

### Introduce the Concept in Isolation

Extend the scratch two-Activity chain from earlier lessons into a
three-screen version — A, B, and a final destination C — deliberately
bouncing between A and B first, throwaway code, deleted after this
section:

```java
// throwaway: ScratchA's button
startActivity(new Intent(this, ScratchB.class));
```

```java
// throwaway: ScratchB's button — bounces back to A, no finish() anywhere,
// deliberately mirroring Lesson 3's own lateral-navigation choice
startActivity(new Intent(this, ScratchA.class));
```

```java
// throwaway: ScratchA's second button — the "submit" action, moving on to C
startActivity(new Intent(this, ScratchC.class));
finish(); // only removes THIS instance of ScratchA
```

Running this: tap A → B, tap B → A (a second instance of A), tap A → B
(a second instance of B), tap B → A (a third instance of A), then from
this third A, tap through to C. Pressing Back from C, repeatedly:

```
(Back 1) → ScratchA instance #2 reappears
(Back 2) → ScratchB instance #2 reappears
(Back 3) → ScratchA instance #1 reappears
(Back 4) → ScratchB instance #1 reappears
(Back 5) → app finally exits
```

Five Back presses, through four leftover screens the user has already
moved past, before the app actually exits — even with `finish()` called
correctly on the one `Activity` that actually launched C. That's the
proof: `finish()` genuinely only removes the single `Activity` it's
called on; every other instance still sitting on the stack from earlier
bouncing is completely unaffected by it.

### Discard the Throwaway Example

This extended scratch chain is deleted. The next unit introduces the
actual tool for clearing all of it at once.

### Project Change

No code changes for this unit — it's a pure problem-demonstration lab,
establishing the gap the next unit's real code closes.

### Mechanical Walkthrough

Not applicable — no real-project code in this unit.

### CS Lens

This is the concrete cost of a **stack** (this lesson's own reappearing
Terms entry) accumulating entries faster than anything removes them —
every lateral bounce is a genuine push, with nothing popping a
corresponding number of entries back off, so the stack's depth grows
with user behavior in a way this project's own code, until now, has had
no mechanism to bound.

Also recognized in: a web app's browser history growing unbounded
through a multi-step wizard the user backtracks through repeatedly;
undo history in an editor, if nothing ever caps how far back it can go;
a recursive function whose base case is never reached, growing the call
stack without bound (a stack overflow, in the most literal sense the
term was originally coined for).

### SE Lens

Not applicable as a distinct entry for this problem-only unit — the
tradeoff analysis belongs to the next unit's real fix, where an actual
design decision is made and can be weighed against its real alternative.

### Commands Needed

No new terminal commands.

### Run It

Already shown above, in the isolated lab.

### Connection

This unit establishes, concretely, why `finish()` alone — Lesson 4's
own correct tool for a different problem — cannot fix this one. The next
unit introduces `Intent` flags, which operate on the whole task at once
rather than one `Activity` at a time.

---

## Concept Unit: Clearing the Task with Intent Flags

### The Problem

The previous unit proved `finish()` only ever removes the one
`Activity` that calls it. What's needed instead is a way to tell the OS
"discard everything on this back stack, and start this one `Activity`
as if it were the very first screen the task ever had" — a instruction
aimed at the whole stack, not any single `Activity` on it.

### Introduce the Concept in Isolation

Rebuild the same bouncing A/B/C scratch chain from the previous unit's
lab, changing only the very last step — the transition from A to C —
to add `setFlags`:

```java
// throwaway: ScratchA's second button, this version only
Intent intent = new Intent(this, ScratchC.class);
intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
startActivity(intent);
```

Repeating the identical bouncing sequence as before — A → B → A → B → A,
three A's and two B's built up on the stack — then submitting from the
final A to C, and pressing Back from C:

```
(Back 1) → app exits immediately
```

One Back press, not five. Every leftover A and B instance — however many
real bounces had genuinely stacked them up — is simply gone, as if the
task had started fresh with only C in it. That's the proof: these two
flags, combined, don't remove `Activity` instances one at a time the way
`finish()` does — they discard the entire existing task and begin a new
one, with the `Intent`'s own target as its sole root.

### Discard the Throwaway Example

This scratch chain, and the one from the previous unit, are both deleted
now. The real project's `LoginActivity` and `SignupActivity`, modified
next, use the identical two flags.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch
  addition.
- **Files affected:** `app/src/main/java/.../LoginActivity.java`
  (modified); `app/src/main/java/.../SignupActivity.java` (modified).
- **Change type:** Modify — one new line added to each screen's submit
  listener, in the exact same position in both files.
- **Location:** Inside each listener, on the `Intent` already targeting
  `HomeActivity` (established in `LoginActivity` in Lesson 5; applied
  the same way to `SignupActivity` as that lesson's own exercise),
  after its `putExtra` call and before `startActivity`.
- **Dependencies:** Both listeners must already be building an `Intent`
  targeting `HomeActivity`, per Lesson 5.

### The New Code

```java
intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
```

### The Updated Project

```java
loginButton.setOnClickListener(v -> {
    String username = usernameField.getText().toString();

    SharedPreferences prefs = getSharedPreferences("auth_prefs", Context.MODE_PRIVATE);
    prefs.edit().putBoolean("is_logged_in", true).apply();

    Intent intent = new Intent(LoginActivity.this, HomeActivity.class);
    intent.putExtra("username", username);
    intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK); // ← new
    startActivity(intent);
});
```

```java
signupButton.setOnClickListener(v -> {
    String username = usernameField.getText().toString();

    SharedPreferences prefs = getSharedPreferences("auth_prefs", Context.MODE_PRIVATE);
    prefs.edit().putBoolean("is_logged_in", true).apply();

    Intent intent = new Intent(SignupActivity.this, HomeActivity.class);
    intent.putExtra("username", username);
    intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK); // ← new
    startActivity(intent);
});
```

Both listeners now do the same four things, in the same order: read the
username, persist the login flag, build and configure the `Intent` — now
including this lesson's new flags — and launch it. As a whole, each
listener's final `startActivity` call now does more than hand off
control to `HomeActivity`; it also discards, in one instruction, every
`LoginActivity` and `SignupActivity` instance the user may have
accumulated through any amount of Lesson 3's own lateral bouncing.

### Mechanical Walkthrough

- **`intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK |
  Intent.FLAG_ACTIVITY_CLEAR_TASK)`** — the new call this unit centers
  on, fully explained in the Header; the `|` between the two constants
  is Java's bitwise-OR operator, combining two separate flag bits into
  one `int` value carrying both instructions at once — this is a
  first appearance of `|` used this way in this curriculum, worth
  naming explicitly even though it's a single-character operator: it is
  not the same as `||` (logical OR, used to combine `boolean`
  expressions in an `if` condition), and mixing the two up would either
  fail to compile or silently do the wrong thing, depending on the exact
  context.
- **`Intent.FLAG_ACTIVITY_NEW_TASK`** — fully explained in the Header's
  `setFlags` entry; instructs the OS to treat `HomeActivity` as the root
  of a task.
- **`Intent.FLAG_ACTIVITY_CLEAR_TASK`** — fully explained in the
  Header's `setFlags` entry; instructs the OS to discard the existing
  task's entire back stack before applying `NEW_TASK`'s own effect.

Every other line in both updated listeners — `getText()`, `toString()`,
`getSharedPreferences`, `edit()`, `putBoolean`, `apply()`, the `Intent`
constructor, `putExtra`, `startActivity` — is a reappearing construct,
each fully explained in the Header above, unchanged in its own behavior
by this lesson; only the new `setFlags` line is genuinely new code in
either file.

### CS Lens

This is a form of **state reset** — deliberately discarding an entire
accumulated history and beginning again from a known, fixed starting
point, rather than incrementally undoing individual accumulated steps
one at a time.

Also recognized in: a state machine's transition to a terminal
"authenticated" state deliberately having no transition back to any
prior state, regardless of how many states were visited to get there; a
web app calling `history.replaceState` or issuing a redirect that
replaces the current history entry rather than pushing a new one on top,
specifically to prevent a "back" action from returning to a
pre-authentication page; a database transaction rollback discarding
every uncommitted change at once rather than reversing them individually
in order; a factory reset, wiping accumulated device state back to a
single known baseline rather than manually undoing each change a device
accumulated.

### SE Lens

The alternative to this lesson's approach would be tracking every
`LoginActivity`/`SignupActivity` instance created by lateral bouncing —
some kind of list, updated on every navigation, of "screens to
`finish()` once login succeeds" — and calling `finish()` on each one
individually from the submit listener. That's real, working code someone
could write, and it would solve this lesson's exact problem without
`Intent` flags at all. It's also considerably more bookkeeping, prone to
being forgotten on some future navigation path this project adds later,
and inherently more fragile than a single instruction handed to the OS
itself, which already tracks every entry on the task's back stack
accurately by construction. The real cost `FLAG_ACTIVITY_CLEAR_TASK`
carries in exchange for that simplicity: it is genuinely total — it
clears the *entire* task, not just the auth screens specifically. In
this project, that's exactly the right scope, because `MainActivity`
already `finish()`es itself immediately (Lesson 4), meaning Login and
Signup are always the entirety of whatever's on the stack before a
successful auth — there's nothing else there to accidentally lose. A
different app, where meaningful pre-login screens might legitimately
need to survive a login (a deep link that led to a login prompt midway
through some other flow, say), would need a narrower tool than this one,
and accepting `CLEAR_TASK`'s totality without checking whether it fits
the app's actual navigation shape would be a real, easy-to-miss mistake
in that different context.

### Commands Needed

No new terminal commands.

### Run It

```
From LoginActivity: tap Sign Up, tap Log In (back to Login), tap Sign Up
  again — three extra screens now stacked underneath.
From this final SignupActivity, type a username, tap Create Account.
HomeActivity appears, showing the username, exactly as before.
Press Back once:
  App exits immediately — no Login or Signup screen reappears at all,
  regardless of how many lateral bounces preceded this submission.
```

### Connection

This closes the gap this entire lesson opened with: no matter how many
`LoginActivity` or `SignupActivity` instances Lesson 3's own,
correctly-built lateral navigation accumulates, a successful login or
signup now genuinely leaves none of them reachable by Back — the
scalpel Lesson 4 used correctly for the router has been supplemented,
here, with a broader tool suited to a broader problem.

---

## Connect the Pieces

Follow a user who hesitates before finally logging in, start to finish.
From `LoginActivity`, they tap "Sign Up," reconsider, tap "Already have
an account? Log In," reconsider again, and tap "Sign Up" once more —
three real lateral hand-offs, none of them calling `finish()`, per
Lesson 3's own deliberate choice, so the back stack underneath this
final `SignupActivity` now holds, in order, the original `LoginActivity`,
a `SignupActivity`, and a second `LoginActivity` — three real, live
Activities, none of them visible, all of them still fully present. The
user types a username into this final Signup screen and taps "Create
Account." Inside that listener: the username is read, exactly as
Lesson 2 built; `"is_logged_in" → true` is written and applied to
`SharedPreferences`, exactly as Lesson 5 built; a new `Intent` is
constructed targeting `HomeActivity`, carrying the username, exactly as
before — and then, new this lesson, `setFlags` attaches
`FLAG_ACTIVITY_NEW_TASK | FLAG_ACTIVITY_CLEAR_TASK` to it before
`startActivity` hands it to the OS. The OS reads those flags before
constructing anything: it discards the entire existing task — all three
buried Activities, along with the `SignupActivity` currently on
screen — and starts fresh, with `HomeActivity` as the sole entry on a
brand-new back stack. The user sees `HomeActivity` appear, showing their
username, exactly as any earlier lesson's version would have looked —
but underneath it, for the first time in this project's history, there
is genuinely nothing left to press Back into.

## What Breaks Without This

Remove just `Intent.FLAG_ACTIVITY_CLEAR_TASK` from the combined flags
this unit added — leaving only
`intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);` — and repeat the same
bouncing sequence as above before finally submitting. Depending on the
device or emulator's own task-handling behavior, this can produce
inconsistent, hard-to-predict results — sometimes appearing to work,
sometimes leaving stale Activities behind after all — because
`NEW_TASK` alone, without `CLEAR_TASK`, does not carry a defined
guarantee about the existing task's prior contents the way the two flags
combined do; this is precisely why the official documentation requires
using them together for this purpose, and precisely the kind of
"technically compiles, unreliable at runtime" mistake that's easy to
introduce by only half-remembering which flag does which part of the
job. Restore both flags together and confirm the single-Back-press exit
is consistent across several repeated bouncing sequences before moving
on.

## Exercises

- Add a third username-losing scenario to test: log in successfully,
  reach `HomeActivity`, then use the device's own Recent Apps / app
  switcher (not the in-app Back button) to bring the app back to the
  foreground, and confirm `HomeActivity` is still what's shown — this
  exercises the difference between the Back button's stack-popping
  behavior, which this lesson's flags directly affect, and simply
  resuming an already-running task, which they do not.
- Read the official Android documentation for `Intent.FLAG_ACTIVITY_
  CLEAR_TOP` — a different, related flag this lesson did not use — and
  write, in your own words, one concrete Login/Signup/Home scenario
  where `CLEAR_TOP` alone would behave differently from this lesson's
  `NEW_TASK | CLEAR_TASK` combination.

## Definition of Done

- [ ] Both `LoginActivity`'s and `SignupActivity`'s submit listeners set
      `Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK`
      on the `Intent` launching `HomeActivity`, before calling
      `startActivity`.
- [ ] A login or signup reached after any number of lateral bounces
      between the two screens results in exactly one Back press from
      `HomeActivity` exiting the app — never revealing a stale Login or
      Signup screen.
- [ ] The "what breaks without this" partial-flags failure was
      reproduced (or its inconsistency observed) and the correct,
      combined flags restored afterward.
- [ ] Commit, with a message explaining *why*: e.g. `Clear the back
      stack with Intent flags on successful login/signup — closes the
      gap where Back could return to a pre-authentication screen after
      any amount of Login/Signup lateral bouncing.`

**Next lesson:** Lesson 7 gives this entire auth flow a consistent visual
identity — a shared theme applied across Login, Signup, and Home,
instead of each screen's default, unstyled system appearance — including
addressing the brief blank-screen flash this series' own Lesson 4
exercise already surfaced for `MainActivity`'s router.