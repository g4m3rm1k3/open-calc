# Lesson 4: The Router — A Screen That Decides, Then Disappears

**What you will build:** `MainActivity`, transformed. It no longer shows
any UI of its own at all — no layout, no button. Instead, its `onCreate`
makes a decision, based on a boolean condition, between two destinations:
`LoginActivity`, built in Lesson 2, or a new `HomeActivity`, standing in
for "the real app" this whole series has been building toward. Whichever
one it picks, it launches it — and then immediately removes itself from
the back stack, so the user can never press Back and land on a blank
decision screen that was never meant to be looked at. The transferable
problem: every screen this series has built so far shows the user
something and waits for them to act. This lesson's `MainActivity` is the
first screen in this project that acts *on its own*, the instant it's
created, with no user input involved at all — and that changes what
"finishing correctly" even means for an `Activity` like this one.

**What you need to know first:** Lesson 1 — `Activity`, the Manifest,
`onCreate`, `setContentView`, `Intent`, `startActivity`. Lesson 2 —
carrying data across an `Intent`. Lesson 3 — the back stack, and
`finish()`, deliberately *not* called there because Login and Signup are
peers. This lesson is the first place `finish()` actually gets called in
this project's real code — for the opposite reason Lesson 3 withheld it.

**Terms used in this lesson**

- **`boolean`** — a Java primitive type holding exactly one of two
  values, `true` or `false`. This exists because a huge amount of real
  logic reduces to a single yes-or-no question — is the user logged in,
  is a field empty, did a network call succeed — and giving that
  question its own dedicated, two-valued type (rather than, say,
  reusing `0` and `1` as an `int` would) makes the *intent* of a
  variable holding one unmistakable at the point it's declared.
- **Conditional statement (`if` / `else`)** — a control-flow construct
  that runs one block of code or another, never both, based on whether
  a `boolean` expression evaluates to `true` or `false`. This exists
  because, without it, a program can only ever run every line it
  contains, in order, every single time — an `if` statement is the
  mechanism that lets a program's actual behavior differ from one run
  to the next, based on something the program itself computes or
  checks. Nothing in this project's code, before this lesson, has ever
  branched — every `onCreate` written so far ran the exact same
  sequence of calls on every single launch. This is the first lesson
  where that stops being true.
- **Manifest** — `AndroidManifest.xml`, declaring every component the OS
  may create, in advance. Reappearing here because `HomeActivity`, this
  lesson's new screen, needs its own `<activity>` entry, the same
  requirement every previous new screen has had.
- **Back stack** — the ordered, last-in-first-out record Android keeps
  of every `Activity` currently beneath the one on screen, growing by
  one with every `startActivity` call and shrinking by one whenever an
  `Activity` finishes or the user presses Back. Reappearing here because
  this lesson's central design decision — calling `finish()` on
  `MainActivity` the instant it routes — exists entirely to control what
  this stack looks like once the real decision has been made, which
  matters more here than it has in any earlier lesson: a router screen
  left sitting on the stack, invisible and pointless, is exactly the
  kind of dead weight this lesson's own SE Lens returns to.
- **Layout (XML)** — a `.xml` file under `res/layout/` describing a
  screen's visual structure. Reappearing here for `HomeActivity`'s own
  simple layout — and notably, this lesson's other new/changed file,
  `MainActivity`, gets no layout change at all, because, as this
  lesson's second unit explains directly, it stops calling
  `setContentView` altogether.

**Objects and methods used**

- **`Activity`**
  - *What it is:* The Android framework class representing one screen.
  - *Implementation:* `public class Activity extends ContextWrapper
    implements ComponentCallbacks2, ...`.
  - *Its use:* `HomeActivity`, this lesson's new screen, is (through
    `AppCompatActivity`) a subclass of this; `MainActivity` already was
    one, since Lesson 1.
  - *Type:* A public framework class, subclassed, never instantiated
    with `new`.
  - *Responsibility:* Owns a screen's lifecycle and exposes the
    callbacks your subclass overrides.
  - *Depends on:* Being constructed by the OS and declared in the
    Manifest.
  - *Connects to:* The OS creates and drives it; every instance started
    via `startActivity` is pushed onto the back stack.
  - *Shape:* The outermost architectural boundary in the app.

- **`AppCompatActivity`**
  - *What it is:* The support-library subclass of `Activity` every
    screen in this project extends.
  - *Implementation:* `public class AppCompatActivity extends
    FragmentActivity`, itself extending `Activity`.
  - *Its use:* `HomeActivity extends AppCompatActivity`, same as every
    other screen; `MainActivity` already did, unchanged.
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
  - *Its use:* Where `HomeActivity` sets up its simple welcome label; and
    where `MainActivity`'s own body changes more than any previous
    lesson has touched it — this lesson removes its old button-setup
    code entirely and replaces it with the branching decision this
    lesson exists to teach.
  - *Type:* A `protected` instance method, overridden.
  - *Responsibility:* Gives a newly-created `Activity` its one-time
    setup window before the user can see or touch it — for
    `MainActivity`, as of this lesson, that window is used to decide
    and redirect, not to show anything at all.
  - *Depends on:* Being called by the OS.
  - *Connects to:* Calls `super.onCreate(...)` first; from there, its
    body now genuinely differs between `HomeActivity` (which calls
    `setContentView`) and `MainActivity` (which, this lesson, does not).
  - *Shape:* The callback boundary between framework timing and app
    logic.

- **`setContentView(int layoutResID)`**
  - *What it is:* An `Activity` method attaching a layout to the screen.
  - *Implementation:* `public void setContentView(@LayoutRes int
    layoutResID)`.
  - *Its use:* Called once in `HomeActivity.onCreate`, attaching its new
    layout. Notably **absent** from `MainActivity.onCreate` as of this
    lesson — its Mechanical Walkthrough, below, explains exactly why a
    router screen has nothing to call this with.
  - *Type:* A `public` instance method.
  - *Responsibility:* Inflates an XML layout into real `View` objects
    and installs the result as the screen's visible content.
  - *Depends on:* A valid layout resource ID.
  - *Connects to:* Called by `onCreate`, in every screen that actually
    shows the user something.
  - *Shape:* The seam between a layout file and the code that follows
    it — a seam `MainActivity`, as of this lesson, simply doesn't cross
    anymore.

- **`findViewById(int id)`**
  - *What it is:* A method retrieving a view created by
    `setContentView`.
  - *Implementation:* `public <T extends View> T findViewById(@IdRes int
    id)`.
  - *Its use:* Called once in `HomeActivity`, to retrieve its welcome
    `TextView`.
  - *Type:* A `public` instance method.
  - *Responsibility:* Searches the inflated hierarchy for a matching
    `android:id` and returns a live reference.
  - *Depends on:* `setContentView` having already run.
  - *Connects to:* Called after `setContentView`.
  - *Shape:* The bridge from declarative layout into imperative code.

- **`Intent`**
  - *What it is:* A framework class representing a request to start a
    component.
  - *Implementation:* `public Intent(Context packageContext, Class<?>
    cls)`.
  - *Its use:* Built twice, conditionally, in `MainActivity.onCreate` —
    exactly one of the two is ever actually constructed on a given run,
    per the `if`/`else` this lesson introduces.
  - *Type:* A public class, constructed with `new`.
  - *Responsibility:* Carries a destination component as one
    self-contained object.
  - *Depends on:* A `Context` and a target `Class`.
  - *Connects to:* Built inside whichever branch of the `if`/`else` runs;
    consumed by `startActivity`.
  - *Shape:* A data-transfer object at the Activity boundary.

- **`startActivity(Intent intent)`**
  - *What it is:* An `Activity` method asking the OS to launch the
    component an `Intent` describes.
  - *Implementation:* `public void startActivity(Intent intent)`.
  - *Its use:* Called exactly once per launch of `MainActivity`, on
    whichever `Intent` the branch that ran actually built.
  - *Type:* A `public` instance method.
  - *Responsibility:* Hands the `Intent` to the OS, which checks the
    Manifest and, if declared, constructs and starts the target,
    pushing it onto the back stack.
  - *Depends on:* A fully-built `Intent`; the target declared in the
    Manifest.
  - *Connects to:* Called from inside whichever branch ran; the very
    next line this lesson's code runs after it is `finish()`, below —
    the two calls, together, are this lesson's entire router mechanism.
  - *Shape:* The moment control passes to whichever screen was chosen.

- **`finish()`**
  - *What it is:* An `Activity` instance method that ends the calling
    `Activity`.
  - *Implementation:* `public void finish()`.
  - *Its use:* Called in `MainActivity.onCreate`, immediately after
    `startActivity`, on every single launch — the first place in this
    project's real code where this method is actually called, after
    Lesson 3 named it and deliberately withheld it.
  - *Type:* A `public` instance method, callable on `this` from within
    any `Activity`.
  - *Responsibility:* Removes the calling `Activity` from the back stack
    and destroys it, so it's no longer available for the Back button to
    return to.
  - *Depends on:* Nothing beyond the `Activity` it's called on already
    existing.
  - *Connects to:* Called immediately after `startActivity` in
    `MainActivity`'s own code — the ordering between these two calls is
    itself meaningful, and this lesson's own execution trace, below,
    walks through exactly why calling `finish()` *before* `startActivity`
    would be a real bug, not just a stylistic difference.
  - *Shape:* The mechanism that keeps a router screen from lingering on
    the back stack once its one job is done.

- **`TextView`**
  - *What it is:* A `View` subclass for displaying text.
  - *Implementation:* `public class TextView extends View`.
  - *Its use:* `HomeActivity`'s single welcome label — standing in for
    everything "the real app" will eventually contain.
  - *Type:* A public class, created by layout inflation.
  - *Responsibility:* Renders text on screen and exposes `setText` to
    change it.
  - *Depends on:* A unique `android:id`.
  - *Connects to:* Created by inflation; retrieved by `findViewById`;
    its content set via `setText`.
  - *Shape:* A leaf view — the visible proof `HomeActivity` is a
    genuinely different, distinct screen from anything shown before.

- **`setText(CharSequence text)`**
  - *What it is:* A `TextView` method changing its displayed text.
  - *Implementation:* `public final void setText(CharSequence text)`.
  - *Its use:* Called once in `HomeActivity`, with a fixed literal
    string, not a value carried by any `Intent` this time — unlike
    `SecondActivity`'s use of this same method in Lesson 2.
  - *Type:* A `public final` instance method.
  - *Responsibility:* Replaces a view's current text and triggers a
    redraw.
  - *Depends on:* An already-retrieved `TextView` instance.
  - *Connects to:* Called with a plain string literal this lesson
    supplies directly in code, not derived from any `Intent` extra.
  - *Shape:* The final leaf displaying that the router's chosen
    destination really is a working, distinct screen.

---

## Concept Unit: The Conditional Statement

### The Problem

Every `onCreate` written in this project so far has done exactly the
same sequence of things on every single run — attach a layout, find some
views, register some listeners. Nothing has ever *differed* between one
launch and the next. `MainActivity`'s new job requires exactly that: on
one run, send the user to Login; on a different run (once Lesson 5 gives
this project a real way to remember a previous login), send them
somewhere else entirely. Nothing built so far in this curriculum can
make that kind of choice.

### Introduce the Concept in Isolation

A throwaway scratch method, run and discarded, never touching any real
Activity:

```java
// throwaway, run from a temporary onCreate in a scratch Activity
boolean isDaytime = true;
if (isDaytime) {
    Log.d("SCRATCH", "Branch taken: daytime");
} else {
    Log.d("SCRATCH", "Branch taken: nighttime");
}
```

Running this with `isDaytime` set to `true` logs:

```
D/SCRATCH: Branch taken: daytime
```

Changing only the literal value — `boolean isDaytime = false;` — with
every other line of code completely unchanged, and running again, logs:

```
D/SCRATCH: Branch taken: nighttime
```

That's the proof: the exact same source code, unmodified except for one
value, produced two genuinely different execution paths — one block of
code ran and the other one, sitting right there in the file, never ran
at all. This is called an **`if`/`else` conditional statement**: a
single `boolean` expression, evaluated once, that decides which of two
possible blocks actually executes.

### Discard the Throwaway Example

This scratch `isDaytime` example is deleted. `MainActivity`'s real
condition, built next, checks something meaningfully different — whether
the user should see Login or Home — and is genuinely temporary itself,
in a way this unit's own SE Lens is explicit about.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch
  addition.
- **Files affected:** `app/src/main/java/.../MainActivity.java`
  (modified — this file has existed since Lesson 1, but this is the
  first lesson to change what its `onCreate` actually does, rather than
  only what it navigates to).
- **Change type:** Refactor — `MainActivity`'s entire previous body (the
  button-and-listener setup from Lesson 1 and 2) is removed and replaced
  with the branching logic this unit introduces.
- **Location:** The whole of `MainActivity.onCreate`, replacing
  everything after `super.onCreate(savedInstanceState)`.
- **Dependencies:** Both `LoginActivity` (already declared) and
  `HomeActivity` (declared in this lesson's next unit) must exist as
  valid navigation targets before this code can run without crashing.

### The New Code

```java
boolean isLoggedIn = false; // TODO: Lesson 5 replaces this with a real, persisted check

if (isLoggedIn) {
    startActivity(new Intent(MainActivity.this, HomeActivity.class));
} else {
    startActivity(new Intent(MainActivity.this, LoginActivity.class));
}
finish();
```

### The Updated Project

```java
package com.example.authflowdemo;

import android.content.Intent;
import android.os.Bundle;
import androidx.appcompat.app.AppCompatActivity;

public class MainActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        boolean isLoggedIn = false; // TODO: Lesson 5 replaces this with a real, persisted check // ← new

        if (isLoggedIn) {                                                          // ← new
            startActivity(new Intent(MainActivity.this, HomeActivity.class));      // ← new
        } else {                                                                   // ← new
            startActivity(new Intent(MainActivity.this, LoginActivity.class));     // ← new
        }                                                                          // ← new
        finish();                                                                  // ← new
    }
}
```

`onCreate` no longer attaches any layout at all — as a whole, this
method now does exactly three things, every single time it runs: decide
which of two destinations applies, launch it, and remove itself from the
back stack. There is nothing left in this method for the user to look
at, tap, or wait on — a deliberate change from every version of
`MainActivity` this project has had before.

### Mechanical Walkthrough

- **`boolean isLoggedIn = false;`** — a local variable declaration of
  the type this unit's Terms entry, above, introduced; hardcoded to
  `false` for now — a genuine placeholder, explicitly flagged as one
  by the comment beside it, not a real login check, which doesn't exist
  in this project until Lesson 5 gives it somewhere real to read a
  login state from.
- **`// TODO: Lesson 5 replaces this with a real, persisted check`** — a
  comment, not executable code; this is the exact kind of forward
  reference this schema treats as a binding promise: Lesson 5 must
  actually deliver a real replacement for this line, under this exact
  description, by the time this curriculum is done.
- **`if (isLoggedIn) { ... } else { ... }`** — the conditional statement
  itself, fully explained in this unit's own isolated lab, above;
  evaluates the `boolean` exactly once and runs exactly one of the two
  blocks.
- **`startActivity(new Intent(MainActivity.this, HomeActivity.class))`**
  — inside the `true` branch; a reappearing `Intent` construction and
  `startActivity` call, both fully explained in the Header, targeting
  this lesson's new `HomeActivity`.
- **`startActivity(new Intent(MainActivity.this, LoginActivity.class))`**
  — inside the `false` branch; the identical pattern, targeting
  `LoginActivity` instead — the exact same navigation Lesson 2's own
  `MainActivity` performed unconditionally, now happening only when the
  condition calls for it.
- **`finish()`** — fully explained in the Header; called once, after
  the `if`/`else` block has already finished running — outside both
  branches, because it needs to run regardless of which branch was
  taken; this line's exact placement, after both possible
  `startActivity` calls, is the subject of this unit's own execution
  trace, directly below.

**Execution trace (timing, not changing values):**

1. `boolean isLoggedIn = false;` — evaluated first, unconditionally,
   before either branch is considered.
2. `if (isLoggedIn)` — the condition is checked; because `isLoggedIn` is
   `false`, the block attached to `if` is skipped entirely — none of its
   lines run at all, not even to be evaluated and discarded.
3. `startActivity(new Intent(MainActivity.this, LoginActivity.class))`
   — the `else` block's line runs instead, because the condition
   evaluated to `false`. This is where control actually leaves
   `MainActivity` for the first time.
4. `finish()` — runs immediately after, still inside `MainActivity`'s
   own `onCreate`, even though `LoginActivity` has already been asked
   to start. This ordering matters: `startActivity` doesn't pause
   `MainActivity`'s own code while the new screen appears — it simply
   requests the new screen and returns right away, letting
   `MainActivity`'s own `onCreate` keep running its very next line,
   which is exactly why `finish()` can safely run immediately after
   it, in the same method, without waiting for anything.

### CS Lens

This is the most basic form of **conditional branching** — a program
computing more than one possible execution path from the same source
code, based on a runtime value rather than always running identically.

Also recognized in: a traffic light choosing red, yellow, or green based
on a timer or sensor; a spreadsheet's `IF()` formula; a compiler
generating a conditional jump instruction from source-level `if`
statements; a vending machine's own logic deciding whether enough coins
have been inserted before dispensing anything.

### SE Lens

The hardcoded `boolean isLoggedIn = false;` this unit ships with is a
real, explicit compromise, not an oversight — and the comment beside it
says so on purpose. The alternative would be waiting to build this
entire router unit until Lesson 5's persistence mechanism already
exists, teaching them together as one lesson. This schema's own
Concept Isolation Rule argues against that: bundling "how a conditional
branch works" with "how Android persists data across app launches"
would be two new concepts riding on top of each other, which the
Recursive Concept Extraction Rule this schema follows specifically
exists to split apart. The cost this project is knowingly carrying
until Lesson 5: right now, this router always takes the same branch,
every single time, which makes it fully testable and demonstrably
correct as *routing* logic, while being visibly, honestly incomplete as
*authentication* logic — a distinction worth being explicit about rather
than quietly glossing over.

### Commands Needed

No new terminal commands.

### Run It

```
App launched. No MainActivity UI ever appeared on screen.
LoginActivity appeared immediately instead.
Device Back button pressed from LoginActivity → app exits
  (not MainActivity — it already finished; there is nothing left
  underneath LoginActivity on the back stack for this project's own
  screens).
```

### Connection

The conditional statement is what makes a router possible at all — the
next unit builds the actual destination the `true` branch currently
points at, `HomeActivity`, which doesn't exist yet.

---

## Concept Unit: HomeActivity and the Router's Correct Use of finish()

### The Problem

The `true` branch of this lesson's new `if` statement already refers to
`HomeActivity.class` — a class that doesn't exist yet, which would
currently fail to compile at all. Beyond simply making that branch
compile, this unit has a second, more important job: confirming, with a
real execution trace against real code (not the throwaway scratch chains
Lesson 3 used), that calling `finish()` in a router is the *correct* use
of a method Lesson 3 went out of its way to withhold — and being
explicit about exactly why the two situations call for opposite
decisions.

### Introduce the Concept in Isolation

No new isolated lab is required for `finish()` itself — Lesson 3's own
lab already proved, on a throwaway chain, exactly what this method does:
removes the calling `Activity`, and only the calling `Activity`, from
the back stack. Per the Repetition Rule, that proof still stands; this
unit's job is applying it correctly to a genuinely new situation, not
re-proving the mechanism. What is new here is the *reasoning*, worked
through concretely below, in this unit's own SE Lens, rather than in a
throwaway lab.

### Discard the Throwaway Example

Not applicable — no new throwaway code was introduced in this unit.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch
  addition.
- **Files affected:** `app/src/main/res/layout/activity_home.xml` (new
  file); `app/src/main/java/.../HomeActivity.java` (new file);
  `AndroidManifest.xml` (modified, adding `HomeActivity`'s entry).
- **Change type:** Add.
- **Location:** N/A for the new files; the Manifest entry goes alongside
  the existing `LoginActivity`, `SignupActivity`, and `SecondActivity`
  entries.
- **Dependencies:** None beyond what earlier lessons already
  established.

### The New Code

```java
TextView welcomeLabel = findViewById(R.id.home_welcome_label);
welcomeLabel.setText("Welcome to the app.");
```

### The Updated Project

```xml
<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:orientation="vertical"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:gravity="center"
    android:padding="24dp">

    <TextView
        android:id="@+id/home_welcome_label"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:textSize="20sp" />

</LinearLayout>
```

```java
package com.example.authflowdemo;

import android.os.Bundle;
import android.widget.TextView;
import androidx.appcompat.app.AppCompatActivity;

public class HomeActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_home);

        TextView welcomeLabel = findViewById(R.id.home_welcome_label);  // ← new
        welcomeLabel.setText("Welcome to the app.");                    // ← new
    }
}
```

As a whole, `HomeActivity.onCreate` follows the exact same three-step
shape every real (non-router) screen in this project has used since
Lesson 1 — attach a layout, find a view, set its content — standing in,
deliberately minimally, for whatever "the real app" will eventually
contain.

### Mechanical Walkthrough

- **`<LinearLayout ... android:gravity="center">`** — a reappearing
  container element from Lesson 2's own layouts, with one new attribute:
  `android:gravity="center"` centers this container's children both
  horizontally and vertically within it, appropriate for a single
  welcome label with nothing else competing for space on the screen.
- **`<TextView android:id="@+id/home_welcome_label"
  android:textSize="20sp" />`** — a reappearing element, fully explained
  in the Header; `android:textSize="20sp"` is new — `sp` ("scale-
  independent pixels") is Android's text-sizing unit, similar to the
  `dp` unit Lesson 2 used for padding, except `sp` values also scale
  with the user's own device-wide font-size accessibility setting, which
  plain `dp` deliberately does not.
- **`findViewById(R.id.home_welcome_label)`** — a reappearing call,
  fully explained in the Header.
- **`welcomeLabel.setText("Welcome to the app.")`** — a reappearing
  call, fully explained in the Header; called here with a fixed string
  literal written directly in the Java source, unlike `SecondActivity`'s
  use of this same method in Lesson 2, which displayed a value pulled
  out of an `Intent` extra instead.

### CS Lens

No new hard concept in this unit's own code — `HomeActivity` reuses the
same View/layout pattern already given its full Recognition treatment in
earlier lessons.

### SE Lens

This unit is where the correct-use case for `finish()`, called
unconditionally in the previous unit, gets its full justification. Lesson
3 withheld `finish()` between Login and Signup because they're *peers* —
either one is a legitimate place for the Back button to return the user
to. `MainActivity`, as a router, is not a peer of anything: it has no UI
of its own, makes no decision the user takes part in, and exists purely
to redirect. If it stayed on the back stack the way Login and Signup
correctly do, pressing Back from `HomeActivity` would re-run
`MainActivity`'s `onCreate` — which would immediately re-evaluate its
`if` statement and, since nothing about `isLoggedIn` changed, silently
redirect right back to wherever the user just came from, with no visible
screen in between. That's not a crash, but it *is* a confusing, broken-
feeling loop a real user would have no way to understand from the
outside. `finish()`, called the instant the router's one decision is
made, is what prevents it: the router genuinely never needs to be
revisited once it's done its one job. The cost being accepted here is
narrow and specific: `MainActivity`'s `onCreate` now runs once and is
gone, every single launch, which means any state a future lesson might
want to compute once and reuse cannot live as an instance field on
`MainActivity` itself — it needs to live somewhere that survives past a
single, momentary `Activity`'s lifetime, which is exactly the problem
Lesson 5's persistence mechanism solves.

### Commands Needed

No new terminal commands.

### Run It

```
App launched (isLoggedIn still hardcoded false):
  LoginActivity appears, as before.

isLoggedIn temporarily changed to true, for this run only, to verify
the other branch:
  HomeActivity appears instead, showing "Welcome to the app."
  Device Back button pressed → app exits directly
    (MainActivity already finished; nothing else is underneath).

isLoggedIn changed back to false before committing.
```

### Connection

The router now genuinely works, both branches, end to end — the only
thing standing between this lesson's version and a real login flow is
that `isLoggedIn` is still a hardcoded lie, checked once per app launch
and forgotten. Lesson 5 replaces exactly that one line with a real,
persisted answer.

---

## Connect the Pieces

Follow one full app launch, start to finish. The user taps the app's
icon. The OS, reading the Manifest's `LAUNCHER` `intent-filter` — set up
back in Lesson 1 — constructs `MainActivity` and calls its `onCreate`.
Nothing appears on screen yet: `onCreate`'s very first real line
declares `boolean isLoggedIn = false`, immediately followed by the `if`
statement checking it. Because the condition is `false`, the `else`
branch runs: a new `Intent` naming `LoginActivity` is built and handed to
`startActivity`, which asks the OS to construct and push `LoginActivity`
onto the back stack. `MainActivity`'s own code, not waiting for that to
happen, immediately continues to its very next line — `finish()` —
removing itself from the back stack before the user has had any chance
to see it at all. What the user actually experiences, watching the
screen, is the app icon tap leading directly to the Login screen, with
no visible intermediate step — even though, underneath, a real decision
was made and a real screen was constructed and discarded to make it.

## What Breaks Without This

Move `finish();` to the very first line inside `onCreate`, before the
`if` statement — a plausible mistake, since nothing about Java's own
syntax stops a method from calling `finish()` at any point. Run the app
again:

```
FATAL EXCEPTION: android.view.WindowManager$BadTokenException
Unable to add window -- token null is not valid; is your activity running?
```

`MainActivity` finished itself before it had asked the OS to start
anything else — by the time `startActivity` runs, on the next line,
`MainActivity` no longer has a valid window to launch anything *from*,
and the OS refuses. This is a real, concrete case where ordering two
otherwise-correct method calls the wrong way around produces a crash
neither call would cause on its own. Move `finish()` back to its correct
position, after the `if`/`else` block, and confirm the app launches
cleanly again before moving on.

## Exercises

- Temporarily set `isLoggedIn = true` directly in the source (not through
  any real mechanism yet — Lesson 5 builds that), confirm `HomeActivity`
  appears instead of Login, and set it back to `false` before committing
  — this project's actual default behavior until Lesson 5 changes it for
  real.
- `MainActivity` currently has no layout at all. Try adding
  `setContentView(R.layout.activity_main)` back in, before the `if`
  statement, using whatever layout Lesson 1 originally gave it, and
  observe what a real device or emulator run looks like — a very brief
  flash of that old screen before the redirect happens. This is exactly
  why a real router `Activity` is typically given no meaningful UI of
  its own at all, and is the concrete problem Lesson 7's styling work
  will address properly with a dedicated launch theme, rather than a
  visible layout.

## Definition of Done

- [ ] `MainActivity` no longer calls `setContentView` at all, and its
      `onCreate` consists entirely of the `isLoggedIn` check, one of two
      `startActivity` calls, and a final `finish()`.
- [ ] `HomeActivity` exists, is declared in the Manifest, and displays a
      simple welcome message.
- [ ] With `isLoggedIn` hardcoded `false`, launching the app goes
      directly to `LoginActivity`, with `MainActivity` never visible.
- [ ] Temporarily setting `isLoggedIn = true` and rerunning confirms
      `HomeActivity` appears instead, and Back from it exits the app
      directly.
- [ ] The "what breaks without this" `finish()`-ordering crash was
      reproduced on purpose and corrected again afterward.
- [ ] Commit, with a message explaining *why*: e.g. `Turn MainActivity
      into a router deciding between Login and Home, finishing itself
      immediately after redirecting — establishes the router pattern
      Lesson 5's real persisted login check will complete.`

**Next lesson:** Lesson 5 replaces this lesson's hardcoded
`boolean isLoggedIn = false` with a real, persisted answer — introducing
`SharedPreferences`, so a login that happened in a *previous* launch of
the app is actually remembered the next time `MainActivity`'s router
runs.