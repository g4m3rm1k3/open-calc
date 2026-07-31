# Lesson 17: Getting to a Second Screen

**What you will build:** A second, currently-empty screen, reachable from
the login screen, using the option this series builds forward with —
plus a real look at two genuine alternatives Android offers for the same
problem, so the choice is informed rather than arbitrary. The
transferable problem: "show a different screen" is one of the most
common things any app does, and Android gives you three structurally
different ways to do it, each with a real cost the others don't have.

**What you need to know first:** Milestone 3 (Lessons 12–16) — a fully
wired login screen.

**Terms introduced in this lesson:**
- **`Intent`** — an object describing a request for the OS to do
  something, most commonly here: "start this other `Activity`."
- **`startActivity`** — the `Activity` method that hands an `Intent` to
  the OS and requests the transition it describes.
- **Fragment (recognition, real alternative)** — a reusable, self-
  contained piece of UI and behavior that lives *inside* an Activity's
  window rather than replacing the whole screen.
- **Back stack** — the OS-maintained history of Activities a user has
  navigated through, used to decide what the device's back gesture/button
  returns to.
- **`android:exported`** — a Manifest attribute on an `<activity>` entry
  declaring whether components *outside this app* are allowed to start
  it directly; flagged in an earlier lesson, explained here for the
  first time.

---

## Concept Unit: Three Real Ways to Show a Second Screen

### The Problem

The grid screen this milestone needs is structurally a completely
different piece of UI from the login screen — different layout, different
widgets, different purpose. Android doesn't force one single way to get
from one to the other.

### Option A — a Second `Activity`, Started with an `Intent`

Each screen is its own `Activity` subclass (the same kind of class
`MainActivity` already is), with its own layout file, its own lifecycle,
declared separately in the Manifest. Navigating means asking the OS to
start a different Activity:

```java
Intent intent = new Intent(this, InventoryActivity.class);
startActivity(intent);
```

The OS constructs a new `InventoryActivity` object and calls its
`onCreate` — the exact same Inversion-of-Control mechanism from Lesson 07,
just triggered by your own `startActivity` call instead of the user
tapping the home screen icon. The previous Activity (`MainActivity`) isn't
destroyed immediately — it's paused and pushed onto the **back stack**,
the OS-maintained history that decides what the device's back
gesture returns to.

### Option B — a Fragment Inside One Activity

A `Fragment` is a reusable piece of UI and behavior that lives *inside*
an Activity's window, swapped in and out of a container view, rather than
replacing the whole screen:

```java
getSupportFragmentManager()
    .beginTransaction()
    .replace(R.id.fragmentContainer, new InventoryFragment())
    .addToBackStack(null)
    .commit();
```

This keeps everything inside a single Activity (a single `onCreate`,
a single Manifest entry), with the "screen" swap handled entirely by the
`FragmentManager` — a class managing which Fragment currently occupies a
given container view. Fragments have their own lifecycle, layered on top
of (and driven by) their host Activity's lifecycle — a real added layer
of complexity this option carries that Option A doesn't.

### Option C — One Activity, Swapping the Whole Layout

The simplest option: stay on the exact same, single `Activity`, and just
call `setContentView` a second time with a different layout resource:

```java
setContentView(R.layout.activity_inventory);
```

No new class, no Fragment, no back stack entry at all — the device's
back button would simply exit the app entirely rather than returning to
the login screen, since as far as the OS is concerned nothing ever
navigated anywhere.

### The Tradeoff

Option C is the simplest to write, and the worst fit here: with no back
stack entry, a user has no way to return to the login screen using the
device's normal back gesture, and `MainActivity`'s own fields
(`usernameField`, etc.) and the new screen's fields would have to
coexist awkwardly on one class. Option B is the most powerful — the real
tool of choice in larger production apps, which often use nothing *but*
Fragments for exactly this reason — at the cost of a second lifecycle
layered on top of the Activity lifecycle, genuinely more to reason about
than this project's scope calls for. **This project uses Option A**, a
second real `Activity` with a real Manifest entry, since it gives correct
back-stack behavior for free, keeps each screen's fields and logic
cleanly separated onto its own class, and needs no concept beyond ones
already covered.

### Project Change

- **Reference Source:** No reference counterpart for the new Activity
  class itself (it's an application class you're authoring). `Intent`'s
  constructor and `startActivity`'s signature are real `Context`/`Activity`
  API, well-established and unchanged across Android's history:
  `public Intent(Context packageContext, Class<?> cls)` and `public void
  startActivity(Intent intent)`.
- **Files affected:** New file
  `app/src/main/java/com/yourname/yourapp/InventoryActivity.java`; new
  file `app/src/main/res/layout/activity_inventory.xml`;
  `AndroidManifest.xml` (add a second `<activity>` entry);
  `MainActivity.java` (wire a way to reach the new screen).
- **Change type:** Create two new files; add to two existing files.
- **Dependencies:** None new.

### The New Code

`InventoryActivity.java` — a brand-new file:

```java
package com.yourname.yourapp;

public class InventoryActivity extends AppCompatActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_inventory);
    }
}
```

`activity_inventory.xml` — a brand-new file, deliberately minimal for now:

```xml
<?xml version="1.0" encoding="utf-8"?>
<LinearLayout
    xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical"
    android:padding="24dp">

</LinearLayout>
```

In `AndroidManifest.xml`, a second `<activity>` entry, added after the
existing `MainActivity` entry:

```xml
<activity
    android:name=".InventoryActivity"
    android:exported="false" />
```

In `MainActivity.java`, inside the existing `loginButton` click listener,
after the `Toast` line from Lesson 16:

```java
Intent intent = new Intent(this, InventoryActivity.class);
startActivity(intent);
```

### The Updated Project

`MainActivity`'s login listener, in full:

```java
loginButton.setOnClickListener((view) -> {
    String username = usernameField.getText().toString();
    String password = passwordField.getText().toString();
    Toast.makeText(this, "Logging in: " + username, Toast.LENGTH_SHORT).show();

    Intent intent = new Intent(this, InventoryActivity.class);  // ← new
    startActivity(intent);                                      // ← new
});
```

Tapping "Log In" now shows the `Toast`, then genuinely navigates to
`InventoryActivity`'s blank screen.

### Mechanical Walkthrough

- `class InventoryActivity extends AppCompatActivity` — reappearing
  (Lesson 06's inheritance), same relationship as `MainActivity`.
  `onCreate`/`super.onCreate`/`setContentView` all reappear identically —
  every Activity you write from here on follows this exact same shape.
- `new Intent(this, InventoryActivity.class)` — **first appearance.**
  `Intent`'s real two-argument constructor here: the first argument is a
  `Context` (`this`, same reasoning as Lesson 16's `Toast` call); the
  second is a `Class` object — `InventoryActivity.class` is a literal
  expression referring to the `Class` object representing the
  `InventoryActivity` type itself (every class has exactly one such
  object, generated by the JVM, used here purely to tell the `Intent`
  which Activity type to target). This specific constructor form is
  called an **explicit Intent**: naming the exact target class, as
  opposed to an implicit Intent (naming only an *action*, and letting the
  OS pick any app willing to handle it — out of scope for a same-app
  navigation like this one).
- `startActivity(intent)` — **first appearance.** Inherited from
  `Activity` (through `AppCompatActivity`, same inheritance chain as
  `onCreate` and `findViewById`), this method hands the `Intent` to the
  OS and requests the transition it describes. Control returns to
  `MainActivity` immediately after this call *returns* — the actual
  screen transition and `InventoryActivity`'s construction happen
  asynchronously, on the OS's own schedule, the same Inversion-of-Control
  idea from Lesson 07 applied to screen transitions instead of app
  startup.
- `android:exported="false"` — **first appearance.** Unlike
  `MainActivity`'s `exported="true"` (Lesson 07), `InventoryActivity`
  doesn't need to be reachable by anything outside this app — no other
  app has any legitimate reason to launch it directly — so it's marked
  not exported, the more restrictive and generally correct default for
  an internal-only screen.

### CS Lens

An `Intent` describing a request, handed off for the OS to fulfill on its
own schedule, is the same **Inversion of Control** idea from Lesson 07
(and Lesson 16's `setOnClickListener`) appearing a third time — this
time expressed as a data object (a *description* of a request) rather
than a callback interface, a different shape for the same underlying
principle: your code states intent, the framework decides timing and
mechanism.

Also recognized in: any message-queue or job-scheduling system where a
caller submits a description of work rather than performing it directly,
and the general **command pattern** — packaging a request as an object
that can be handed off, queued, or logged, rather than invoking the
action immediately and directly.

### SE Lens

**Why does starting an Activity require constructing an `Intent` object
at all, instead of a direct method call like
`startActivity(InventoryActivity.class)`?** An `Intent` can carry more
than just "which class" — extra data for the target screen to read
(covered when this project actually needs to pass data between screens),
and, in the implicit-Intent case not used here, no specific class at all,
only a description of an action for the OS to match against any
willing app. Modeling navigation as a describable, extensible request
object rather than a single fixed method signature is what lets the exact
same mechanism scale from "start this one specific screen" to "let the
user pick any installed camera app" without a different API for each
case.

---

## Connect the Pieces

One trace: tapping "Log In" (Milestone 3) now also builds an `Intent`
naming `InventoryActivity`, hands it to `startActivity`, and the OS —
not `MainActivity`'s own code — constructs `InventoryActivity` and calls
its `onCreate`, exactly the way it once constructed `MainActivity` itself
back in Lesson 07. `InventoryActivity` is pushed onto the back stack, so
the device's back gesture returns to the still-paused `MainActivity`.

## What Breaks Without This

Remove the `<activity android:name=".InventoryActivity" ... />` entry
from the Manifest entirely, leaving the Java class in place, and tap
"Log In." Real result: the app crashes with
`android.content.ActivityNotFoundException`, naming
`InventoryActivity` directly in its message — the same manifest-
registration requirement Lesson 07 already proved for `MainActivity`,
now failing for a *second* Activity that was never declared. Restore the
Manifest entry before moving on.

## Exercises

1. Add `android:label="Inventory"` to `InventoryActivity`'s Manifest
   entry and confirm (via the running app, or Android Studio's Manifest
   merger view) what this attribute controls — a label shown in places
   like the recent-apps switcher, distinct from `MainActivity`'s own.
2. Press the device's back button while on the blank `InventoryActivity`
   screen and confirm you return to the login screen with its typed
   values still present — direct proof that `MainActivity` was paused,
   not destroyed, when `startActivity` ran.

## Definition of Done

- [ ] You can state which of the three navigation options this project
      uses and one concrete reason each of the other two wasn't chosen.
- [ ] You triggered the real `ActivityNotFoundException` yourself from a
      missing Manifest entry, and restored it.
- [ ] Tapping "Log In" genuinely navigates to a second, blank screen, and
      the device back button returns to the login screen correctly.
- [ ] Commit: `git commit -m "Add InventoryActivity and navigate to it
      from the login button via an explicit Intent"` — explaining the
      navigation choice, not just the new file.

Next: choosing how that blank screen actually displays a grid of data —
a real comparison between three genuinely different Android widgets.
