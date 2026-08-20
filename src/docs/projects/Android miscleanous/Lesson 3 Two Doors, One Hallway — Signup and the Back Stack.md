# Lesson 3: Two Doors, One Hallway — Signup and the Back Stack

**What you will build:** A `SignupActivity`, mirroring `LoginActivity`'s
form pattern with username, password, and confirm-password fields, whose
"Create Account" button carries the username to `SecondActivity` exactly
the way Login's button already does. On top of that, a two-way link
between the two screens — "Don't have an account? Sign Up" on Login,
"Already have an account? Log In" on Signup — so a user can move sideways
between them before ever reaching `SecondActivity`. The transferable
problem: every hand-off built so far has moved *forward*, deeper into the
app. This lesson is the first to move *sideways*, between two screens at
the same conceptual level — and that raises a question none of the
previous lessons had to answer: when the user presses the device's Back
button, where should they land? Answering it requires understanding a
structure Android has been silently maintaining since Lesson 1 without
ever being named: the **back stack**.

**What you need to know first:** Lesson 1 — `Activity`, the Manifest,
`AppCompatActivity`, `onCreate`, `setContentView`, `findViewById`,
`Button`, `setOnClickListener`, the explicit `Intent`, `startActivity`.
Lesson 2 — `EditText`, `getText()`/`Editable`/`toString()` for reading
input, and `Intent` extras (`putExtra`/`getIntent`/`getStringExtra`) for
carrying data across the hand-off.

**Terms used in this lesson**

- **Manifest** — `AndroidManifest.xml`, declaring every component the OS
  is allowed to create, in advance. Reappearing here because
  `SignupActivity` needs its own `<activity>` entry, the same pattern
  Lesson 1 required for `SecondActivity` and Lesson 2 required for
  `LoginActivity` — an omitted entry crashes with
  `ActivityNotFoundException` the instant something tries to start it.
- **Layout (XML)** — a `.xml` file under `res/layout/` describing a
  screen's visual structure separately from its Java behavior.
  Reappearing here because `SignupActivity` needs its own new layout
  file, `activity_signup.xml`.
- **View** — the base class for anything drawn on screen. Reappearing
  here because this lesson's new clickable elements (`TextView`, used as
  a tappable link rather than a `Button`) are `View`s, same as
  everything else on screen.
- **Back stack** — the ordered record Android keeps, per app, of every
  `Activity` currently "underneath" the one on screen, most-recently-
  started on top. This exists because the device's Back button needs
  somewhere to send the user, and Android's answer is not "whatever
  screen makes sense" decided fresh each time, but a literal
  **stack** — the same last-in-first-out data structure used throughout
  computer science — that every `startActivity` call pushes onto, and
  that the Back button, by default, pops from. Every `Activity` this
  series has built so far has been silently pushed onto this stack
  without any of the previous lessons needing to name it; this lesson is
  the first where the stack's actual behavior — what's underneath the
  current screen, and what pressing Back does about it — is something
  this lesson's own design decisions depend on getting right. Lesson 6
  is where this stack's contents are deliberately manipulated with
  `Intent` flags; this lesson only observes and reasons about its
  default behavior.

**Objects and methods used**

- **`Activity`**
  - *What it is:* The Android framework class representing one screen.
  - *Implementation:* `public class Activity extends ContextWrapper
    implements ComponentCallbacks2, ...` — part of the Android SDK.
  - *Its use:* `SignupActivity`, this lesson's new screen, is (through
    `AppCompatActivity`) a subclass of this, same as every screen so
    far.
  - *Type:* A public framework class, subclassed, never instantiated
    with `new`.
  - *Responsibility:* Owns one screen's lifecycle and exposes the
    callbacks — `onCreate` among them — your subclass overrides.
  - *Depends on:* Being constructed by the OS and declared in the
    Manifest.
  - *Connects to:* The OS creates and drives it; each `Activity` started
    via `startActivity` is what actually populates the back stack this
    lesson's Terms entry, above, names for the first time.
  - *Shape:* The outermost architectural boundary in the app.

- **`AppCompatActivity`**
  - *What it is:* The support-library subclass of `Activity` every
    screen in this project extends.
  - *Implementation:* `public class AppCompatActivity extends
    FragmentActivity`, itself extending `Activity`.
  - *Its use:* `SignupActivity extends AppCompatActivity`, the same
    parent every other screen uses.
  - *Type:* A public class, subclassed.
  - *Responsibility:* Everything `Activity` does, plus compatibility
    shims this project relies on for consistent theming later.
  - *Depends on:* A Manifest declaration.
  - *Connects to:* Sits between `SignupActivity`'s code and the
    framework's `Activity`.
  - *Shape:* A compatibility layer, invisible to this lesson's actual
    logic.

- **`onCreate(Bundle savedInstanceState)`**
  - *What it is:* A lifecycle callback, overridden by every screen in
    this project.
  - *Implementation:* `protected void onCreate(@Nullable Bundle
    savedInstanceState)`, overridden with `@Override`.
  - *Its use:* Where `SignupActivity` sets up its three `EditText`
    fields and two buttons/links; also where `LoginActivity`'s own
    `onCreate` gains a new line this lesson, wiring its new Signup link.
  - *Type:* A `protected` instance method, overridden.
  - *Responsibility:* Gives a newly-created `Activity` its one-time
    setup window before the user can see or touch anything.
  - *Depends on:* Being called by the OS.
  - *Connects to:* Calls `super.onCreate(...)`, then `setContentView`,
    then `findViewById`, in every screen this project has.
  - *Shape:* The callback boundary between framework timing and app
    logic.

- **`setContentView(int layoutResID)`**
  - *What it is:* An `Activity` method attaching a layout to the screen.
  - *Implementation:* `public void setContentView(@LayoutRes int
    layoutResID)`.
  - *Its use:* Called once in `SignupActivity.onCreate`, attaching the
    new `activity_signup.xml` layout.
  - *Type:* A `public` instance method.
  - *Responsibility:* Inflates the XML file into real `View` objects and
    installs the result as the screen's content.
  - *Depends on:* A valid layout resource ID.
  - *Connects to:* Called by `onCreate`; drives XML inflation.
  - *Shape:* The seam between the layout file and the code that follows.

- **`findViewById(int id)`**
  - *What it is:* A method retrieving a view just created by
    `setContentView`.
  - *Implementation:* `public <T extends View> T findViewById(@IdRes int
    id)`.
  - *Its use:* Called for each of `SignupActivity`'s three `EditText`
    fields, its "Create Account" button, its "Already have an account?"
    link, and, in `LoginActivity`, its new "Don't have an account?"
    link.
  - *Type:* A `public` instance method.
  - *Responsibility:* Searches the inflated hierarchy for the view whose
    `android:id` matches and returns a live reference to it.
  - *Depends on:* `setContentView` having already run.
  - *Connects to:* Called after `setContentView`; reads IDs the layout
    XML declared.
  - *Shape:* The bridge from declarative layout into imperative code.

- **`Button`**
  - *What it is:* A `View` subclass representing a tappable button.
  - *Implementation:* `public class Button extends TextView`, itself
    extending `View`.
  - *Its use:* `SignupActivity`'s "Create Account" button.
  - *Type:* A public class, created by layout inflation.
  - *Responsibility:* Renders as a tappable, labeled rectangle and
    reports taps to a registered listener.
  - *Depends on:* A unique `android:id` in the layout.
  - *Connects to:* Created by inflation; retrieved by `findViewById`;
    listened to via `setOnClickListener`.
  - *Shape:* A leaf view — the tappable surface.

- **`setOnClickListener(View.OnClickListener l)`**
  - *What it is:* A `View` method registering a tap callback — declared
    on `View` itself, which is why this lesson can call it on a
    `TextView` just as validly as on a `Button` (see the Mechanical
    Walkthrough, below, for exactly where that matters).
  - *Implementation:* `public void setOnClickListener(@Nullable
    OnClickListener l)`; `OnClickListener` is a nested `View` interface
    with one method, `onClick(View v)`.
  - *Its use:* Registers listeners on `SignupActivity`'s button, on both
    screens' new lateral-navigation links, and, unchanged, on Login's
    existing "Log In" button.
  - *Type:* A `public` instance method.
  - *Responsibility:* Stores the given listener and arranges for its
    `onClick` to run once per tap.
  - *Depends on:* An object implementing `View.OnClickListener` — a
    lambda, throughout this project.
  - *Connects to:* Called on whatever `View` needs tap behavior; the
    listener it's given does the actual work — reading fields, building
    `Intent`s, or, new this lesson, calling `finish()`.
  - *Shape:* A callback boundary between the OS's touch system and app
    logic.

- **`Intent`**
  - *What it is:* A framework class representing a request to start a
    component, optionally carrying data.
  - *Implementation:* `public Intent(Context packageContext, Class<?>
    cls)`.
  - *Its use:* Built by `SignupActivity`'s "Create Account" listener
    (targeting `SecondActivity`, carrying the username, exactly like
    Login's) and by both new lateral-navigation links (targeting each
    other).
  - *Type:* A public class, constructed with `new`.
  - *Responsibility:* Carries the destination component and any
    attached data as one self-contained object.
  - *Depends on:* A `Context` and a target `Class`; optionally, extras
    attached via `putExtra`.
  - *Connects to:* Built by a click listener; consumed by
    `startActivity`.
  - *Shape:* A data-transfer object at the Activity boundary.

- **`startActivity(Intent intent)`**
  - *What it is:* An `Activity` method asking the OS to launch the
    component an `Intent` describes.
  - *Implementation:* `public void startActivity(Intent intent)`.
  - *Its use:* Called by every click listener in this lesson that
    navigates anywhere — Signup's own submit button, and both lateral
    links.
  - *Type:* A `public` instance method.
  - *Responsibility:* Hands the `Intent` to the OS, which checks the
    Manifest and, if declared, constructs and starts the target,
    **pushing it onto the back stack** — the mechanism this lesson's new
    Terms entry names explicitly for the first time, even though every
    earlier lesson's use of this exact method already did it silently.
  - *Depends on:* A fully-built `Intent`; the target being declared in
    the Manifest.
  - *Connects to:* Called by a click listener; hands control to the OS.
  - *Shape:* The moment control passes from one screen to another — and,
    as of this lesson, understood explicitly as the moment that also
    grows the back stack by one.

- **`EditText`**
  - *What it is:* A `View` subclass representing an editable text field.
  - *Implementation:* `public class EditText extends TextView`, itself
    extending `View`.
  - *Its use:* Three instances in `activity_signup.xml` — username,
    password, confirm password.
  - *Type:* A public class, created by layout inflation.
  - *Responsibility:* Renders an editable field, accepts keyboard input,
    manages its own internal text buffer, and exposes `getText()` to
    read that buffer.
  - *Depends on:* A unique `android:id`; an `android:inputType`
    attribute — this lesson sets `textPassword` on both password fields.
  - *Connects to:* Created by inflation; retrieved by `findViewById`;
    read via `getText()`.
  - *Shape:* A leaf view — the on-screen input surface.

- **`getText()`**
  - *What it is:* A `TextView` method (inherited by `EditText`)
    returning the field's current text.
  - *Implementation:* `public Editable getText()`.
  - *Its use:* Called on `SignupActivity`'s username field, to build the
    same kind of outgoing `Intent` extra Login already builds.
  - *Type:* A `public` instance method.
  - *Responsibility:* Returns a live reference to the field's internal,
    mutable text buffer at the moment it's called.
  - *Depends on:* Being called on an already-existing `EditText`.
  - *Connects to:* Called by the click listener; chained with
    `toString()`.
  - *Shape:* The bridge from widget state into app logic.

- **`Editable`**
  - *What it is:* An interface representing mutable, editable text.
  - *Implementation:* `public interface Editable extends CharSequence,
    Spannable, Appendable`.
  - *Its use:* The real return type of `getText()`, on
    `SignupActivity`'s fields, same as Login's.
  - *Type:* An interface, never instantiated directly.
  - *Responsibility:* Represents text that can change in place while the
    widget renders it live, which is why `getText()` can't simply return
    an immutable `String` directly.
  - *Depends on:* The `EditText` instance that owns the buffer.
  - *Connects to:* Returned by `getText()`; converted by `toString()`.
  - *Shape:* An internal representation seam passed through, not
    otherwise manipulated.

- **`toString()`**
  - *What it is:* A method converting an `Editable` into a plain,
    immutable `String` snapshot.
  - *Implementation:* `public String toString()`, concretely overridden
    by `Editable`'s real implementation.
  - *Its use:* Chained onto `getText()` in `SignupActivity`'s listener,
    same pattern as Login's.
  - *Type:* A `public` instance method.
  - *Responsibility:* Produces a fixed copy of the current characters,
    independent of further typing.
  - *Depends on:* An already-obtained `Editable`.
  - *Connects to:* Called on `getText()`'s result; feeds the value
    eventually passed to `putExtra`.
  - *Shape:* The conversion step between live widget state and a plain,
    storable value.

- **`String`**
  - *What it is:* Java's built-in immutable character-sequence class.
  - *Implementation:* `public final class String implements
    CharSequence, ...` — `java.lang`, no import needed.
  - *Its use:* The type `SignupActivity`'s username ends up stored in,
    same as Login's.
  - *Type:* A `public final` class — uninheritable, part of how its
    immutability is guaranteed.
  - *Responsibility:* Holds a fixed character sequence that never
    changes once constructed.
  - *Depends on:* Nothing external — part of the language itself.
  - *Connects to:* Produced by `toString()`; passed to `putExtra`.
  - *Shape:* A plain value type — the actual payload riding in the
    `Intent`.

- **`Intent.putExtra(String name, String value)`**
  - *What it is:* An `Intent` method attaching a named piece of data.
  - *Implementation:* `public Intent putExtra(String name, String
    value)` — the `String`-accepting overload, same one Login used.
  - *Its use:* Attaches `SignupActivity`'s username under the exact same
    key, `"username"`, that Login already uses — deliberately, so
    `SecondActivity` needs no changes at all to handle either source.
  - *Type:* A `public` instance method.
  - *Responsibility:* Stores the value in the `Intent`'s extras storage
    under the given key.
  - *Depends on:* An already-constructed `Intent`; a key the receiving
    side matches exactly.
  - *Connects to:* Called before `startActivity`; read later by
    `getStringExtra`, unchanged, inside `SecondActivity`.
  - *Shape:* The mechanism carrying data across the Activity boundary.

- **`finish()`**
  - *What it is:* An `Activity` instance method that ends the current
    `Activity`.
  - *Implementation:* `public void finish()` — declared on `Activity`
    itself.
  - *Its use:* Named, discussed, and deliberately **not called** by
    either lateral-navigation link this lesson builds — its correct use
    here is knowing when to withhold it, which is exactly what this
    unit's SE Lens examines.
  - *Type:* A `public` instance method, callable on `this` from within
    any `Activity`.
  - *Responsibility:* Removes the calling `Activity` from the back
    stack and destroys it, so it is no longer available for the Back
    button to return to.
  - *Depends on:* Nothing beyond the `Activity` it's called on already
    existing and being on screen.
  - *Connects to:* Called (when it is called) from a click listener or
    other app logic; its effect is on the OS's own back-stack
    bookkeeping, not on any other object in this codebase directly.
  - *Shape:* A direct, explicit override of the back stack's normally
    automatic behavior — the one tool this lesson's Terms entry names as
    the thing standing between "default stacking behavior" and
    "deliberately shaped navigation," which Lesson 6 uses more
    extensively via `Intent` flags rather than this method directly.

- **`TextView`**
  - *What it is:* A `View` subclass for displaying text.
  - *Implementation:* `public class TextView extends View`; both
    `EditText` and `Button` are themselves subclasses of this.
  - *Its use:* Two new instances this lesson — the "Don't have an
    account? Sign Up" link on Login, and "Already have an account? Log
    In" on Signup — used here as tappable navigation, not as a static
    label the way `SecondActivity`'s welcome message used it in Lesson
    2.
  - *Type:* A public class, created by layout inflation.
  - *Responsibility:* Renders text on screen; because it is itself a
    `View`, it can receive a `setOnClickListener` the same as any other
    `View` can — nothing about `TextView` restricts click listeners to
    `Button` specifically.
  - *Depends on:* A unique `android:id` for retrieval.
  - *Connects to:* Created by inflation; retrieved by `findViewById`;
    given a click listener the same way `Button` is, in this lesson's
    new navigation links.
  - *Shape:* A leaf view — here, doing double duty as both a label and a
    tap target.

---

## Concept Unit: The Back Stack

### The Problem

Every screen built so far — `MainActivity` → `SecondActivity` in Lesson
1, `LoginActivity` → `SecondActivity` in Lesson 2 — has moved the user
one direction: forward, deeper into the app. Pressing the device's Back
button from `SecondActivity` has, so far, simply worked, without any
code in this project ever saying what "back" should mean. This lesson is
about to add the first *sideways* hand-off — Login to Signup — and it's
worth asking, before writing a line of new navigation code: what
actually decides where the Back button sends the user, and will it
still do the right thing once there are two screens at the same level
instead of one linear chain?

### Introduce the Concept in Isolation

Reusing the scratch two-Activity project style from earlier lessons, add
a *third* throwaway Activity and chain all three with plain
`startActivity` calls, no `finish()` anywhere:

```java
// throwaway: ScratchA's onCreate, on tapping its button
startActivity(new Intent(this, ScratchB.class));
```

```java
// throwaway: ScratchB's onCreate, on tapping its button
startActivity(new Intent(this, ScratchC.class));
```

Running this, tapping through A → B → C, then pressing the device Back
button twice, produces, in Logcat (with a log line in each Activity's
`onCreate`):

```
D/SCRATCH: A created
D/SCRATCH: B created
D/SCRATCH: C created
(Back button pressed)
(Back button pressed)
```

— no new `onCreate` calls logged on either Back press, because none of
A, B, or C was destroyed and recreated; each Back press simply reveals
the `Activity` already sitting underneath, exactly where `startActivity`
left it. That absence of new `onCreate` calls is the proof: nothing was
rebuilt from scratch, because nothing needed to be — A and B were still
right there, in the order they were pushed. This structure — last one in
is the first one revealed again — is a plain **stack**, the same
last-in-first-out data structure taught in any first data-structures
course, applied here to whole screens instead of numbers or characters.

### Discard the Throwaway Example

This three-Activity scratch chain is deleted now. Nothing about its
Java code carries forward — only the mental model it proved does.

### Project Change

No code changes for this unit — it's a pure concept lab establishing the
back stack's default behavior before this lesson's real navigation code
is written against it. The next unit is where actual files change.

### Mechanical Walkthrough

Not applicable — this unit's only code is the throwaway lab already
walked through above; there is no real-project code yet to enumerate.

### CS Lens

This is a direct application of the **stack** data structure — a
last-in-first-out (LIFO) collection where the only two operations that
matter are "add to the top" (`startActivity`, as this unit's Terms entry
names it) and "remove from the top" (the Back button's default action,
and, when called explicitly, `finish()`).

Also recognized in: a web browser's own back button, backed by the exact
same idea over page history; the call stack every running program
already has, tracking which function should resume when the current one
returns; the "undo" stack in a text editor; a stack of plates, where you
can only take the top one off without disturbing the rest underneath —
the metaphor the data structure is literally named for.

### SE Lens

The alternative Android could have chosen is letting each `Activity`
decide, in its own code, exactly what "Back" should do — some kind of
explicit `onBackPressed` override in every single screen, deciding by
hand where to send the user. Android's actual design gives every
`Activity` sensible default Back behavior *for free*, driven entirely by
this shared stack, so a screen that doesn't need special Back behavior
(nearly every screen in this project so far) needs zero code to get it
right. The tradeoff: that default is a one-size-fits-all policy — always
"go back to whoever started me" — which is exactly right for
`SecondActivity` (return to whichever of Login or Signup launched it)
but, as the next unit examines directly, needs a deliberate decision,
not just silent acceptance of the default, once two screens can navigate
*between themselves*.

### Commands Needed

No new terminal commands.

### Run It

Already run and shown above, in the isolated lab — this unit produces no
real-project output on its own.

### Connection

The back stack has been running this whole project since Lesson 1,
invisibly. The next unit is the first time this lesson's own code has to
make a real decision informed by it: when Login and Signup can navigate
to each other, should either call stay on that stack, or leave it?

---

## Concept Unit: Building SignupActivity's Form

### The Problem

`SignupActivity` doesn't exist yet. It needs the same shape of form
`LoginActivity` already has — fields to type into, a button to submit —
built the same way, on purpose: this is deliberate repetition, not a new
pattern, reinforcing the `EditText` → `getText()` → `toString()` →
`putExtra` chain from Lesson 2 a second time before this series moves on
to genuinely new material.

### Introduce the Concept in Isolation

No new isolated lab is needed for this unit specifically — every
construct it uses (`EditText`, `getText()`, `toString()`, `Intent`,
`putExtra`, `startActivity`) already received its own real, executed lab
in Lesson 1 or Lesson 2, and per the Repetition Rule those labs' proofs
still stand; nothing here is a new mechanism, only a new, real
application of already-proven ones. This is why this unit's own Header
entries above are still written in full, even though nothing in this
unit's own two steps (this one and "Discard") introduces new throwaway
code — the Repetition Rule governs *explanation*, not *demonstration*;
a construct only needs a fresh isolated lab the first time a lesson's
own Concept Unit sequence is built around it as something new, which
this unit is not.

### Discard the Throwaway Example

Not applicable to this unit — no new throwaway code was introduced
above.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch
  addition.
- **Files affected:** `app/src/main/res/layout/activity_signup.xml`
  (new file); `app/src/main/java/.../SignupActivity.java` (new file);
  `AndroidManifest.xml` (modified, adding `SignupActivity`'s entry,
  following the exact pattern used for `LoginActivity` in Lesson 2).
- **Change type:** Add.
- **Location:** N/A for the new files; the Manifest change goes inside
  the existing `<application>` element, alongside the `LoginActivity`
  and `SecondActivity` entries already there.
- **Dependencies:** None beyond what Lessons 1 and 2 already
  established.

### The New Code

```java
signupButton.setOnClickListener(v -> {
    String username = usernameField.getText().toString();
    Intent intent = new Intent(SignupActivity.this, SecondActivity.class);
    intent.putExtra("username", username);
    startActivity(intent);
});
```

### The Updated Project

```xml
<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:orientation="vertical"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:padding="24dp">

    <EditText
        android:id="@+id/signup_username_input"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:hint="Username" />

    <EditText
        android:id="@+id/signup_password_input"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:inputType="textPassword"
        android:hint="Password" />

    <EditText
        android:id="@+id/signup_confirm_password_input"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:inputType="textPassword"
        android:hint="Confirm Password" />

    <Button
        android:id="@+id/signup_button"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:text="Create Account" />

</LinearLayout>
```

```java
package com.example.authflowdemo;

import android.content.Intent;
import android.os.Bundle;
import android.widget.Button;
import android.widget.EditText;
import androidx.appcompat.app.AppCompatActivity;

public class SignupActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_signup);

        EditText usernameField = findViewById(R.id.signup_username_input);
        EditText passwordField = findViewById(R.id.signup_password_input);
        EditText confirmField = findViewById(R.id.signup_confirm_password_input);
        Button signupButton = findViewById(R.id.signup_button);

        signupButton.setOnClickListener(v -> {                          // ← new
            String username = usernameField.getText().toString();       // ← new
            Intent intent = new Intent(SignupActivity.this, SecondActivity.class); // ← new
            intent.putExtra("username", username);                      // ← new
            startActivity(intent);                                      // ← new
        });                                                              // ← new
    }
}
```

As a whole, `SignupActivity` now mirrors `LoginActivity` end to end: a
layout with input fields and a submit button, an `onCreate` that
attaches it, retrieves every field, and wires the submit button to read
the username, wrap it in an `Intent`, and launch `SecondActivity` —
identical in shape to Login's own flow from Lesson 2, deliberately.
`passwordField` and `confirmField` are retrieved but not yet compared to
each other; a real confirm-password check is validation logic outside
this lesson's own scope, left as this lesson's own exercise, below.

### Mechanical Walkthrough

Every call in this unit's New Code block is a reappearing construct,
fully explained in the Header above, applied identically to Lesson 2's
own use of the same pattern:

- **`signupButton.setOnClickListener(v -> { ... })`** — registers the
  lambda, same mechanism as Login's own submit button.
- **`usernameField.getText()`** — retrieves the live `Editable` from
  `SignupActivity`'s own username field, the same call Login makes on
  its own.
- **`.toString()`** — converts that `Editable` into a fixed `String`.
- **`new Intent(SignupActivity.this, SecondActivity.class)`** —
  `SignupActivity.this`, not bare `this`, for the identical reason
  Login's own listener needed the qualified form: inside this lambda,
  plain `this` refers to the listener object, not the enclosing
  `Activity`.
- **`intent.putExtra("username", username)`** — attaches the value
  under the exact same key Login uses, deliberately, so `SecondActivity`
  needs no changes to handle a username arriving from either screen.
- **`startActivity(intent)`** — hands the `Intent` to the OS, which, per
  this lesson's first unit, pushes `SecondActivity` onto the back stack
  on top of whichever of Login or Signup called it.

### CS Lens

No new hard concept — this unit is deliberate repetition of message
passing (Lesson 2's own Recognition list), not a new idea.

### SE Lens

Using the identical extras key, `"username"`, on both Login's and
Signup's outgoing `Intent`s — rather than, say, `"login_username"` and
`"signup_username"` as two different keys — is a real design decision,
not an oversight: it means `SecondActivity`'s own code, unchanged since
Lesson 2, already handles a username arriving from either source without
needing to know or care which screen sent it. The tradeoff this
convention carries: it only works because both sending screens agree, by
convention alone, to use the same key — nothing enforces that agreement
beyond both developers (or, in a larger project, both lessons)
remembering it; a project with many more entry points into the same
receiving screen would eventually want a shared constant
(`public static final String EXTRA_USERNAME = "username";`) declared
once and referenced by every sender, rather than the string literal
`"username"` copied by hand into each one, exactly as this lesson's own
two `putExtra` calls currently do.

### Commands Needed

No new terminal commands.

### Run It

```
Typed "bob" into Signup's username field, tapped Create Account.
SecondActivity's screen reads: "bob"
```

— confirming the identical hand-off mechanism works from Signup exactly
as it already did from Login.

### Connection

`SignupActivity` now exists and can reach `SecondActivity` on its own.
The final unit connects it to `LoginActivity` directly, sideways,
without going through `SecondActivity` at all — which is where this
lesson's opening back-stack question finally gets answered in code.

---

## Concept Unit: The Lateral Link, and Choosing Not to Call finish()

### The Problem

A real signup flow needs a way to move between Login and Signup directly
— "already have an account? log in instead," and the reverse — without
forcing the user through `SecondActivity` first. This is a *different*
kind of hand-off than anything built so far: Login and Signup are not
one "deeper than" the other; they're siblings, and the first unit's back
stack lab raises a real question here that it deliberately left
unanswered: if tapping "Sign Up" from Login pushes `SignupActivity` on
top of `LoginActivity`, should `LoginActivity` stay on the stack
underneath it, or be removed?

### Introduce the Concept in Isolation

Returning to the same three-Activity scratch project the first unit
built (rebuilt fresh for this lab, then discarded again), add
`finish()` to the *first* transition only:

```java
// throwaway: ScratchA's onCreate, on tapping its button
startActivity(new Intent(this, ScratchB.class));
finish();
```

```java
// throwaway: ScratchB's onCreate, on tapping its button — unchanged
startActivity(new Intent(this, ScratchC.class));
```

Running this, tapping A → B → C, then pressing Back once, produces:

```
D/SCRATCH: A created
D/SCRATCH: B created
D/SCRATCH: C created
(Back pressed — app closes entirely, no D/SCRATCH line at all)
```

Where the first unit's lab, with no `finish()` anywhere, needed two Back
presses to fully exit (C → B, then B → A), this version exits after only
one — because `finish()`, called right after `startActivity(B)`, removed
A from the stack the instant B was pushed onto it. By the time the user
reaches C and presses Back, only B remains underneath, and B's own
`onCreate` never registered a log line the second time either, because
`finish()` doesn't destroy B — only whatever `Activity` calls it, on
itself. This confirms **`finish()`** does exactly what its Header entry,
above, states: it removes the *calling* `Activity`, specifically, from
the stack — nothing else on the stack is affected.

### Discard the Throwaway Example

This second scratch chain, and the one from the first unit, are both
fully deleted now. The real project's Login/Signup link, built next,
uses neither variant literally — it makes its own, different, deliberate
choice, explained in this unit's SE Lens below.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch
  addition.
- **Files affected:** `app/src/main/res/layout/activity_login.xml`
  (modified, adding one new `TextView`); `app/src/main/res/layout/
  activity_signup.xml` (modified, adding one new `TextView`);
  `app/src/main/java/.../LoginActivity.java` (modified);
  `app/src/main/java/.../SignupActivity.java` (modified, completing the
  file the previous unit started).
- **Change type:** Add (one new `TextView` and one new click listener,
  in each of the two files).
- **Location:** In each layout, after the existing button. In each
  Java file, inside `onCreate`, after the existing `findViewById` calls
  and the existing submit-button listener added in this lesson's
  previous unit (for Signup) or Lesson 2 (for Login).
- **Dependencies:** Both `LoginActivity` and `SignupActivity` must
  already be declared in the Manifest — both already are, by this point
  in the lesson.

### The New Code

```xml
<TextView
    android:id="@+id/go_to_signup_link"
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:text="Don't have an account? Sign Up" />
```

```java
TextView signupLink = findViewById(R.id.go_to_signup_link);
signupLink.setOnClickListener(v -> {
    startActivity(new Intent(LoginActivity.this, SignupActivity.class));
});
```

### The Updated Project

```java
package com.example.authflowdemo;

import android.content.Intent;
import android.os.Bundle;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;
import androidx.appcompat.app.AppCompatActivity;

public class LoginActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_login);

        EditText usernameField = findViewById(R.id.username_input);
        EditText passwordField = findViewById(R.id.password_input);
        Button loginButton = findViewById(R.id.login_button);

        loginButton.setOnClickListener(v -> {
            String username = usernameField.getText().toString();
            Intent intent = new Intent(LoginActivity.this, SecondActivity.class);
            intent.putExtra("username", username);
            startActivity(intent);
        });

        TextView signupLink = findViewById(R.id.go_to_signup_link);       // ← new
        signupLink.setOnClickListener(v -> {                              // ← new
            startActivity(new Intent(LoginActivity.this, SignupActivity.class)); // ← new
        });                                                               // ← new
    }
}
```

```java
package com.example.authflowdemo;

import android.content.Intent;
import android.os.Bundle;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;
import androidx.appcompat.app.AppCompatActivity;

public class SignupActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_signup);

        EditText usernameField = findViewById(R.id.signup_username_input);
        EditText passwordField = findViewById(R.id.signup_password_input);
        EditText confirmField = findViewById(R.id.signup_confirm_password_input);
        Button signupButton = findViewById(R.id.signup_button);

        signupButton.setOnClickListener(v -> {
            String username = usernameField.getText().toString();
            Intent intent = new Intent(SignupActivity.this, SecondActivity.class);
            intent.putExtra("username", username);
            startActivity(intent);
        });

        TextView loginLink = findViewById(R.id.go_to_login_link);         // ← new
        loginLink.setOnClickListener(v -> {                               // ← new
            startActivity(new Intent(SignupActivity.this, LoginActivity.class)); // ← new
        });                                                               // ← new
    }
}
```

Both `onCreate` methods now do the same two things as a whole: set up
their own form and submit flow, exactly as before, and, new, wire up a
plain-text link that sends the user sideways to the other screen —
without either listener ever calling `finish()`, a deliberate choice
this unit's SE Lens examines directly, below.

### Mechanical Walkthrough

- **`<TextView android:id="@+id/go_to_signup_link" .../>`** — a plain
  `TextView` declaration in XML, fully explained in the Header; nothing
  about this tag marks it as clickable — that behavior is added
  entirely in Java, via `setOnClickListener`, not by any XML attribute
  here.
- **`findViewById(R.id.go_to_signup_link)`** — a reappearing call, fully
  explained in the Header; retrieves the new `TextView`.
- **`signupLink.setOnClickListener(v -> { ... })`** — a reappearing
  call, fully explained in the Header; the receiver here is a
  `TextView`, not a `Button`, which works because `setOnClickListener`
  is declared on `View` itself, and `TextView` (like `Button`) is a
  `View` — this is the concrete case the Header's `setOnClickListener`
  entry pointed to when it said this method isn't restricted to
  `Button`.
- **`new Intent(LoginActivity.this, SignupActivity.class)`** — a
  reappearing constructor call, fully explained in the Header; carries
  no extras this time — this hand-off has nothing to pass along, unlike
  the submit buttons' own `Intent`s.
- **`startActivity(...)`** — a reappearing call, fully explained in the
  Header; per this lesson's first unit, this pushes `SignupActivity`
  onto the back stack, on top of `LoginActivity` — which remains
  underneath, because, notably, **`finish()` is not called anywhere in
  this listener** — the deliberate absence this unit's SE Lens explains.

The `SignupActivity` version is the exact mirror image — same four
calls, `SignupActivity.this` in place of `LoginActivity.this`,
`LoginActivity.class` in place of `SignupActivity.class` — and, per the
Repetition Rule, still earns its own full walkthrough rather than a
"same as above" citation, even though every individual call has already
been explained in this same unit, one code block earlier.

### CS Lens

No new hard concept beyond the back stack, already given its Recognition
list in this lesson's first unit.

### SE Lens

This is the direct, concrete answer to the question this lesson opened
with. Calling `finish()` after `startActivity(SignupActivity.class)` —
the way this unit's own isolated lab demonstrated on a scratch chain —
would remove `LoginActivity` from the back stack the moment Signup
opens. That's the *wrong* choice here: it would mean pressing Back from
Signup doesn't return the user to Login at all — it exits the app
outright, exactly as the lab's scratch chain did when Back was pressed
from C with A already finished. A user who taps "Sign Up" by mistake, or
just wants to glance at it and change their mind, would have no way back
except relaunching the entire app. **Not** calling `finish()` — leaving
both screens on the stack, each fully able to return to the other by the
Back button's own default behavior, no extra code required — is the
right choice for genuinely lateral navigation between peer screens. The
real cost being accepted here: the back stack can now grow in a
direction this project hasn't had to reason about before — a user
bouncing Login → Signup → Login → Signup several times in a row leaves
every one of those screens sitting on the stack, not just the two of
them; Lesson 6 is where this project directly addresses back-stack
growth of this kind, once the router built in Lesson 4 gives it a
concrete case that actually matters (a user should never be able to
press Back from inside the real app and land on a login screen at all,
which plain lateral navigation like this unit's does not yet prevent).

### Commands Needed

No new terminal commands.

### Run It

```
From Login: tap "Don't have an account? Sign Up" → Signup screen appears.
Press Back → Login screen reappears, fields as they were left.
From Signup: tap "Already have an account? Log In" → Login screen appears
  (a second instance, separate from the one still underneath on the stack).
Press Back twice → returns through both, then exits.
```

### Connection

This closes this lesson's own opening question: the back stack's
default behavior, left completely alone, is exactly what makes ordinary
Back-button navigation between Login and Signup work correctly, with no
custom code — the only decision this unit had to make on purpose was
what *not* to call.

---

## Connect the Pieces

Follow a user who taps "Sign Up" from Login by mistake, then changes
their mind, start to finish. `LoginActivity` is already on screen — and
already sitting on the back stack, pushed there when `MainActivity`'s
own button launched it, back in Lesson 2. The user taps the "Don't have
an account? Sign Up" `TextView`; its registered listener builds a bare
`Intent` naming `SignupActivity`, with no extras, and calls
`startActivity`. The OS checks the Manifest, confirms `SignupActivity`
is declared, and pushes a new instance of it onto the stack, directly on
top of `LoginActivity` — which remains underneath, untouched, because
neither this lesson's Signup link nor Login's own submit button calls
`finish()` anywhere. The user, now looking at Signup's form, decides
they actually do have an account, and presses the device's Back button.
Because `LoginActivity` was never removed from the stack, Android's
default Back behavior — the same behavior this lesson's very first,
throwaway lab demonstrated, requiring no code of this project's own to
work — simply reveals it again, fields exactly as they were left, with
no new `onCreate` call and no new network or logic running: it was never
gone.

## What Breaks Without This

Add `finish()` to `LoginActivity`'s Signup-link listener, immediately
after its `startActivity` call, and run the app again. Tap "Don't have
an account? Sign Up" from Login, land on Signup, then press Back:

```
(app exits immediately — no Login screen reappears)
```

This is the exact failure this lesson's second lab predicted on a
throwaway scratch chain, now reproduced for real: `finish()` removed
`LoginActivity` from the stack the instant Signup opened, so nothing
remained underneath for Back to reveal. Remove the added `finish()`
call and confirm Login reappears correctly on Back before moving on.

## Exercises

- Add the reverse check this lesson's own text mentioned but didn't
  build: compare `passwordField.getText().toString()` against
  `confirmField.getText().toString()` inside `SignupActivity`'s submit
  listener, and, if they don't match, skip the `startActivity` call
  entirely (a bare `return;` inside the lambda is enough for now — a
  real error message on screen is outside this lesson's own scope).
- Starting from Login, tap into Signup, then back into Login, then into
  Signup again, three full round trips, and use Android Studio's own
  Layout Inspector (or simply repeated Back presses, counting how many
  it takes to fully exit) to confirm, concretely, that the back stack
  really does grow by one for every lateral hop, exactly as this
  lesson's SE Lens described.

## Definition of Done

- [ ] `SignupActivity` exists, is declared in the Manifest, and its form
      mirrors `LoginActivity`'s pattern — three fields, one submit
      button, wired to `SecondActivity` via the same `"username"` extra
      key.
- [ ] A tappable "Don't have an account? Sign Up" link on Login opens
      Signup, and a tappable "Already have an account? Log In" link on
      Signup opens Login, neither one calling `finish()`.
- [ ] Pressing Back from either screen, reached via its own lateral
      link, correctly returns to the other, unchanged.
- [ ] The "what breaks without this" `finish()` failure was reproduced
      on purpose and removed again afterward.
- [ ] Commit, with a message explaining *why*: e.g. `Add SignupActivity
      and lateral Login/Signup navigation, deliberately leaving both on
      the back stack — establishes the back-stack reasoning Lesson 6's
      auth-flow stack management builds on.`

**Next lesson:** Lesson 4 builds the router pattern this whole series has
been aiming at — making `MainActivity` itself decide, at runtime,
whether to show `LoginActivity` or the real app content, instead of
always showing the same fixed button this lesson's `MainActivity` still
has.