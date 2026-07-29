# Lesson 19: The Navigation Component — One Graph Instead of Scattered Intents

**What you will build:** `MainActivity`'s content — the title, the tap
counter, the "Open Inventory" button — moves into a new
`HomeFragment`. `MainActivity` itself shrinks to a thin host, the same
way `InventoryActivity` did in Lesson 18, except this time it hosts its
Fragment through the **Navigation Component**: a single, declarative
**nav graph** describing every screen and every path between them,
instead of scattered `startActivity` calls each Activity had to know
about individually. `InventoryActivity` — now unnecessary, since
`InventoryListFragment` can be a destination in the same graph
`HomeFragment` lives in — is deleted entirely, Manifest entry and all.
The transferable problem: four Activities, each with its own Manifest
entry, wired together by `Intent` calls scattered across four different
files, means there is no single place to see this app's entire screen
flow — you'd have to read every file to reconstruct it. A nav graph is
that single place, made real and enforced by the framework, not just a
diagram someone drew once and let go stale.

**What you need to know first:** Lesson 18 (`Fragment`,
`FragmentManager`, `FragmentTransaction`, the `savedInstanceState == null`
guard against duplicate Fragments on rotation — this lesson replaces
that manual guard with something that handles it automatically).
Lesson 5 (`MainActivity`'s `tapCount`/`onSaveInstanceState`, carried
into `HomeFragment` unchanged). Lesson 4 (`Intent`, `startActivity` —
what this lesson partially replaces). `ItemDetailActivity` and
`SettingsActivity` are **not** touched this lesson — they remain full
Activities, reached the same way `InventoryListFragment` already
reaches them (Lesson 8/10); Lesson 20 finishes converting those two.

**Terms introduced in this lesson:**
- **Navigation Component** — a Jetpack library providing one
  declarative graph describing every screen (as a Fragment destination)
  and every path between them, replacing manually-written
  `Intent`/`FragmentTransaction` calls scattered across many files.
- **Nav graph** — an XML file, one `<navigation>` root containing
  `<fragment>` destinations and `<action>` connections between them —
  the single, authoritative description of this app's screen flow.
- **`app:startDestination`** — the nav graph attribute naming which
  destination is shown first when the graph is first entered.
- **`<action>`** — a named, directed connection between two
  destinations in a nav graph; navigating "by action" rather than by
  destination directly is what lets the graph, not scattered code,
  define which screens can reach which.
- **`FragmentContainerView`** — the current, recommended container view
  for hosting a `NavHostFragment`, replacing the older, plain
  `<fragment>` XML tag.
- **`NavHostFragment`** — a special `Fragment`, declared once in an
  Activity's layout, that reads a nav graph and displays whichever
  destination is currently active inside itself.
- **`NavController`** — the object, obtained via
  `Navigation.findNavController(view)`, used to actually navigate
  between destinations and that automatically manages the back stack of
  destinations visited.
- **Automatic back-stack management** — `NavController` tracks which
  destinations have been visited and in what order on its own, so the
  system Back button and a graph-aware "up" action both work correctly
  with no hand-written guard against duplication, unlike Lesson 18's
  manual `savedInstanceState == null` check.

---

## Concept Unit: `NavHostFragment` and the Nav Graph — the Mechanism, Proven Small

### The Problem

Four Activities exist in this project right now — `MainActivity`,
`InventoryActivity`, `ItemDetailActivity`, `SettingsActivity` — each
with its own Manifest entry (Lesson 2b), each reached by an explicit
`Intent` written into whichever file happens to navigate to it (Lesson
4). Nothing in this project states, in one place, "these are all the
screens, and these are the paths between them" — that fact only exists
implicitly, scattered across four files' worth of `startActivity` calls.
Lesson 18 also had to hand-write a guard,
`if (savedInstanceState == null)`, specifically to stop
`FragmentManager` from duplicating a Fragment it had already restored
on its own across a rotation — prove there's a mechanism that removes
the need for that guard entirely, before touching the real app.

### Commands Needed

Add two lines inside `app/build.gradle`'s existing
`dependencies { }` block:

```gradle
implementation 'androidx.navigation:navigation-fragment:2.9.8'
implementation 'androidx.navigation:navigation-ui:2.9.8'
```

Click **Sync Now**.

### Introduce the Concept in Isolation

Prove the mechanism with two throwaway Fragments and a scratch graph,
temporarily hosted inside the real `MainActivity`, the same way Lesson
18's own `ScratchFragment` lab worked.

Create `app/src/main/res/navigation/scratch_nav_graph.xml` (Android
Studio will offer to create the `navigation` resource folder for you):

```xml
<?xml version="1.0" encoding="utf-8"?>
<navigation xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    android:id="@+id/scratch_nav_graph"
    app:startDestination="@id/scratchOne">

    <fragment
        android:id="@+id/scratchOne"
        android:name="com.yourname.pocketinventory.ScratchOneFragment"
        android:label="Scratch One">
        <action
            android:id="@+id/action_scratchOne_to_scratchTwo"
            app:destination="@id/scratchTwo" />
    </fragment>

    <fragment
        android:id="@+id/scratchTwo"
        android:name="com.yourname.pocketinventory.ScratchTwoFragment"
        android:label="Scratch Two" />

</navigation>
```

Create `ScratchOneFragment.java`:

```java
package com.yourname.pocketinventory;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.navigation.Navigation;

public class ScratchOneFragment extends Fragment {
    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container,
                              @Nullable Bundle savedInstanceState) {
        Button button = new Button(requireContext());
        button.setText("Go to Scratch Two");
        button.setOnClickListener(v ->
                Navigation.findNavController(v).navigate(R.id.action_scratchOne_to_scratchTwo));
        return button;
    }
}
```

Create `ScratchTwoFragment.java`:

```java
package com.yourname.pocketinventory;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;

public class ScratchTwoFragment extends Fragment {
    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container,
                              @Nullable Bundle savedInstanceState) {
        TextView text = new TextView(requireContext());
        text.setText("This is Scratch Two");
        text.setPadding(32, 32, 32, 32);
        return text;
    }
}
```

Temporarily replace `activity_main.xml`'s entire contents with:

```xml
<androidx.fragment.app.FragmentContainerView
    xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    android:id="@+id/scratchNavHost"
    android:name="androidx.navigation.fragment.NavHostFragment"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    app:navGraph="@navigation/scratch_nav_graph"
    app:defaultNavHost="true" />
```

Temporarily replace `MainActivity.java`'s entire contents (the real
version is rebuilt properly in the next unit):

```java
package com.yourname.pocketinventory;

import android.os.Bundle;
import androidx.appcompat.app.AppCompatActivity;

public class MainActivity extends AppCompatActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
    }
}
```

### Run It Yourself

Run the app. **"Scratch One"**'s button appears, tap it — **"This is
Scratch Two"** appears, no `Intent`, no `FragmentTransaction` written by
hand anywhere. Now press the system Back button: you land back on
Scratch One, correctly, with no guard against duplication anywhere in
this code at all. Rotate the emulator while on Scratch Two: it stays on
Scratch Two, correctly, still with no `savedInstanceState == null`
check anywhere — reproduce this yourself, on your own emulator, since
this is the entire mechanism the rest of this lesson depends on.

### Discard the Throwaway Example

Delete `ScratchOneFragment.java`, `ScratchTwoFragment.java`, and
`scratch_nav_graph.xml`. `activity_main.xml` and `MainActivity.java` are
both about to be rebuilt for real in the next unit, using this exact
mechanism.

### Mechanical Walkthrough

- `<navigation ... app:startDestination="@id/scratchOne">` — **first
  appearance of a nav graph.** The root element; `app:startDestination`
  names which destination is shown the moment this graph is first
  entered — the exact same job Lesson 2b's Manifest `<intent-filter>`
  did for the whole app, now scoped to one graph's own starting point.
- `<fragment android:id="@+id/scratchOne" android:name="..." android:label="...">`
  — **first appearance of a destination.** Declares a `Fragment` class
  as a graph node, addressable by `android:id` from anywhere else in
  this graph — the same `@+id/`-style addressing every layout in this
  project has used since Lesson 3, now naming a screen instead of a
  view.
- `<action android:id="@+id/action_scratchOne_to_scratchTwo" app:destination="@id/scratchTwo" />`
  — **first appearance of an action.** A named, directed path from the
  destination it's nested inside (`scratchOne`) to another
  (`scratchTwo`) — this is the concrete mechanism that makes "which
  screens can reach which" a fact stated once, in this file, rather
  than implied by wherever a `startActivity` call happens to live.
- `<androidx.fragment.app.FragmentContainerView ... android:name="androidx.navigation.fragment.NavHostFragment" app:navGraph="..." app:defaultNavHost="true" />`
  — **first appearance.** A `FragmentContainerView` — the current,
  recommended container for this specific job, replacing an older,
  plainer `<fragment>` tag that had a real, documented rotation bug
  (losing track of its own `NavController` under some conditions)
  `FragmentContainerView` was built specifically to fix. `android:name`
  says which Fragment class to actually instantiate inside this
  container — here, the framework's own `NavHostFragment`, not a class
  this project wrote. `app:navGraph` points at the graph to load;
  `app:defaultNavHost="true"` is what lets this specific host intercept
  the system Back button automatically, rather than the Activity's
  default behavior (finishing entirely) taking over instead.
- `Navigation.findNavController(v).navigate(R.id.action_scratchOne_to_scratchTwo)`
  — **first appearance of `NavController`.** `Navigation.findNavController(View)`
  is a `static` method walking up from any `View` to find the
  `NavController` managing whichever `NavHostFragment` contains it;
  `.navigate(...)`, given an action's own id, moves to that action's
  destination and records the move, which is exactly what makes
  pressing Back afterward correctly return to `scratchOne` with zero
  code written for that specific case.

### CS Lens

A nav graph is a **finite state machine, made data instead of code** —
destinations are states, actions are the transitions between them, and
`NavController` is the runtime that walks the graph, one state at a
time, keeping a history (the back stack) of states visited. Also
recognized in: a website's own sitemap/routing table describing every
page and the links between them in one place, a board game's rulebook
stating which spaces connect to which, and any state-machine library
in software that separates "what states exist and how they connect"
(declared data) from "the code that runs in each state" (behavior).

### SE Lens

**Why route navigation through a declarative graph instead of just
calling `FragmentManager` directly, the way Lesson 18 did?** Lesson
18's own direct `FragmentManager` calls worked, for exactly one
Fragment, in exactly one Activity — but every additional screen would
mean hand-writing its own duplication guard, its own transaction code,
and its own record of "which Fragment was I on before this one," with
nothing checking that the resulting web of manual transitions is even
consistent. A nav graph makes the *set of valid transitions* an
explicit, checkable fact (Android Studio can render this graph
visually, and will flag a `navigate()` call referencing an action that
doesn't exist in the graph as a build error) instead of an emergent
property of however many `FragmentTransaction` calls happen to exist
across the codebase. The cost: a new XML format and a new object
(`NavController`) to learn, for a benefit that only clearly pays off
once an app has more than one or two screens — which this project, by
the end of this lesson pair, genuinely does.

---

## Concept Unit: Migrating `MainActivity` Into `HomeFragment`

### The Problem

Apply the proven mechanism to the real app: `MainActivity`'s actual
content becomes a Fragment, hosted through a real nav graph that also
includes `InventoryListFragment` (Lesson 18) as a destination —
removing `InventoryActivity` as a separate Activity entirely, since a
Fragment already built to be embeddable no longer needs its own
dedicated Activity just to be shown.

### Project Change

- **Reference Source:** No reference counterpart — `track/`'s own
  Lesson 19 introduces the Navigation Component against its own,
  differently-shaped screens (a separate `AddItemActivity`, `Room`);
  this course wires the identical mechanism into its own real
  `MainActivity`/`InventoryListFragment`.
- **Files affected:** new file `fragment_home.xml` (copied from
  `activity_main.xml`'s current content), `activity_main.xml` (replaced
  with a bare `FragmentContainerView`), new file `HomeFragment.java`,
  `MainActivity.java` (shrinks drastically), new file `nav_graph.xml`,
  `AndroidManifest.xml` (remove `InventoryActivity`'s entry), delete
  `InventoryActivity.java` entirely.
- **Change type:** Create, replace, modify, remove.
- **Dependencies:** `InventoryListFragment` (Lesson 18), `Navigation`
  (this lesson's previous unit).

### The New Code — the Real Nav Graph

Create `app/src/main/res/navigation/nav_graph.xml`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<navigation xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    android:id="@+id/nav_graph"
    app:startDestination="@id/homeFragment">

    <fragment
        android:id="@+id/homeFragment"
        android:name="com.yourname.pocketinventory.HomeFragment"
        android:label="Pocket Inventory">
        <action
            android:id="@+id/action_homeFragment_to_inventoryListFragment"
            app:destination="@id/inventoryListFragment" />
    </fragment>

    <fragment
        android:id="@+id/inventoryListFragment"
        android:name="com.yourname.pocketinventory.InventoryListFragment"
        android:label="Inventory" />

</navigation>
```

### The New Code — `HomeFragment`

Copy `activity_main.xml`'s current contents verbatim into a new file,
`fragment_home.xml` — no changes to the XML itself, only the filename,
same as Lesson 18's own `fragment_inventory_list.xml`.

Create `HomeFragment.java`, carrying `MainActivity`'s real logic over
from Lesson 5 (the pure `Log.d`-only lifecycle overrides — `onStart`,
`onResume`, `onPause`, `onStop`, `onDestroy` — are dropped here on
purpose: they carried no real behavior, only demonstrated a concept
Lesson 5 already fully proved, and are not this lesson's subject;
`tapCount` and `onSaveInstanceState`, which carry real state, are kept):

```java
package com.yourname.pocketinventory;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.navigation.Navigation;

public class HomeFragment extends Fragment {
    private int tapCount = 0;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container,
                              @Nullable Bundle savedInstanceState) {
        return inflater.inflate(R.layout.fragment_home, container, false);
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        TextView titleText = view.findViewById(R.id.titleText);
        TextView tapCountText = view.findViewById(R.id.tapCountText);
        Button openButton = view.findViewById(R.id.openInventoryButton);

        titleText.setOnClickListener(v -> {
            tapCount++;
            tapCountText.setText("Taps: " + tapCount);
        });

        openButton.setOnClickListener(v ->
                Navigation.findNavController(v).navigate(R.id.action_homeFragment_to_inventoryListFragment));

        if (savedInstanceState != null) {
            tapCount = savedInstanceState.getInt("tapCount", 0);
            tapCountText.setText("Taps: " + tapCount);
        }
    }

    @Override
    public void onSaveInstanceState(@NonNull Bundle outState) {
        super.onSaveInstanceState(outState);
        outState.putInt("tapCount", tapCount);
    }
}
```

### The Updated Project

This is the whole new file. Compare against Lesson 5's original
`MainActivity`: the field (`tapCount`), the click-to-increment listener,
the `savedInstanceState != null` rescue check, and the
`onSaveInstanceState` override are all **reappearing**, moved verbatim
— only `setContentView(...)` splitting into `onCreateView`/
`onViewCreated` (Lesson 18's own split) and `openButton`'s listener
body (`Navigation.findNavController(v).navigate(...)` instead of
`startActivity(new Intent(...))`) are genuinely different.

### Mechanical Walkthrough

- `private int tapCount = 0;` / the rescue check / `onSaveInstanceState`
  — all reappearing (Lesson 5), unchanged in mechanism, now living on a
  `Fragment` instead of an `Activity` — `Fragment` provides its own
  `onSaveInstanceState(Bundle outState)`, called at the same point in
  this Fragment's own lifecycle that `Activity.onSaveInstanceState` was
  called at, for the exact same reason: a configuration change can
  destroy and rebuild this Fragment (and its View) the same way it
  always destroyed and rebuilt `MainActivity` itself.
- `openButton.setOnClickListener(v -> Navigation.findNavController(v).navigate(R.id.action_homeFragment_to_inventoryListFragment));`
  — reappearing (this lesson's own lab), replacing
  `startActivity(new Intent(this, InventoryActivity.class))` — the
  destination is now named by the graph's own action id, not by a Java
  class passed directly to an `Intent` constructor.

### The New Code — `MainActivity`, Reduced to a Host

Replace `activity_main.xml`'s entire contents:

```xml
<androidx.fragment.app.FragmentContainerView
    xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    android:id="@+id/navHostFragment"
    android:name="androidx.navigation.fragment.NavHostFragment"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    app:navGraph="@navigation/nav_graph"
    app:defaultNavHost="true" />
```

Replace `MainActivity.java`'s entire contents:

```java
package com.yourname.pocketinventory;

import android.os.Bundle;
import androidx.appcompat.app.AppCompatActivity;

public class MainActivity extends AppCompatActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
    }
}
```

### The Updated Project

`MainActivity` no longer has a single field, click listener, or
lifecycle override of its own — its entire job, now, is inflating a
layout that is nothing but a `NavHostFragment` container. Unlike Lesson
18's `InventoryActivity`, there is no manual Fragment transaction here
at all, anywhere — `app:navGraph="@navigation/nav_graph"` is enough for
`NavHostFragment` to load `HomeFragment` (the graph's own
`app:startDestination`) automatically the first time this Activity is
created, and to correctly avoid recreating it redundantly on every
rotation afterward, with no `savedInstanceState == null` guard needed
anywhere in this file.

### Mechanical Walkthrough

- `<androidx.fragment.app.FragmentContainerView ...>` as
  `activity_main.xml`'s entire content — reappearing (this lesson's
  own lab), now pointed at the real `nav_graph.xml` instead of the
  scratch one.
- `MainActivity`'s `onCreate`, containing only `super.onCreate(...)`
  and `setContentView(...)` — reappearing (Lesson 1), with nothing else
  in the method at all — worth noticing directly: this is the smallest
  `onCreate` this entire project has ever had, and it stays this small
  because `NavHostFragment` itself, declared in XML, handles what a
  manual `FragmentTransaction` (Lesson 18) previously required real
  Java code for.

### Removing `InventoryActivity`

Delete `InventoryActivity.java` entirely, and remove its `<activity
android:name=".InventoryActivity" ... />` entry from
`AndroidManifest.xml` (Lesson 2b/4's own Manifest declarations — this
is the first time this project has ever *removed* one). Nothing else
in the project references `InventoryActivity` by name anymore:
`InventoryListFragment` (Lesson 18) is now reached as a nav graph
destination directly from `HomeFragment`, needing no Activity of its
own to be shown inside.

### CS Lens

Deleting `InventoryActivity` once `InventoryListFragment` becomes a
direct graph destination is the same underlying idea Lesson 18's own
SE Lens already named — a `Fragment` genuinely is reusable and
embeddable — carried one step further: an Activity that existed only
to host exactly one Fragment, and did nothing else of its own, was
never structurally necessary once a nav graph can host that same
Fragment directly. Recognizing and removing now-unnecessary
indirection, once the thing it was working around no longer applies,
is itself a real, general engineering habit, not specific to Android.

### SE Lens

**Why is it safe to delete `InventoryActivity` entirely, rather than
keeping it around "just in case something still needs it"?** Because
this project can *check*, not just assume: search the codebase for the
literal string `InventoryActivity` (an exercise below asks you to do
exactly this) and confirm zero remaining references before deleting
anything — the same discipline as Lesson 17's own exercise confirming
`InventoryViewModel` no longer imported `android.database` after that
lesson's refactor. Deleting code that still has real callers is a real
risk; deleting code confirmed to have none is cleanup, not danger.

---

## Connect the Pieces

Full trace: tapping the app icon launches `MainActivity`, whose entire
`onCreate` now does nothing but inflate a `FragmentContainerView`
pointed at `nav_graph.xml` — the graph's own `app:startDestination`
loads `HomeFragment` automatically, no Java transaction code required.
Tapping the title increments `tapCount`, rescued across rotation by
`onSaveInstanceState` exactly as it was in Lesson 5, now on a Fragment
instead of an Activity. Tapping "Open Inventory" calls
`Navigation.findNavController(v).navigate(...)` with the graph's own
action id, moving to `InventoryListFragment` — the exact same class
Lesson 18 built, completely unaware it's now reached through a nav
graph instead of a Fragment transaction written directly into an
Activity. Pressing the system Back button from there returns to
`HomeFragment` correctly, automatically, because `NavHostFragment`'s
own back stack — the same LIFO shape Lesson 5 first named for
Activities — tracked that move without a single line of code in this
project asking it to.

## What Breaks Without This

In `nav_graph.xml`, temporarily rename
`action_homeFragment_to_inventoryListFragment`'s `android:id` to
anything else (e.g. `action_wrong_id`), without updating
`HomeFragment.java`'s own `R.id.action_homeFragment_to_inventoryListFragment`
reference. Try to build. Read the real compiler error — a generated `R`
class (Lesson 2e) with no matching constant means this fails at
*compile* time, not silently at runtime the way a mistyped `Intent`
target class name might have. Restore the original action id
afterward.

## Exercises

1. Search this project for the literal string `InventoryActivity`.
   Confirm the only remaining mentions are in old lesson files, never in
   real project code — concrete proof this lesson's removal was
   complete, not partial.
2. In `HomeFragment`, temporarily remove the
   `if (savedInstanceState != null)` rescue block entirely. Tap the
   title a few times, rotate, and confirm the counter resets to 0 —
   the exact same failure Lesson 5 first demonstrated, proving this
   Fragment's own `onSaveInstanceState` mechanism is genuinely doing the
   same job its Activity ancestor did, not something new that happens
   to look similar. Restore the block afterward.

## Definition of Done

- [ ] You ran the `ScratchOneFragment`/`ScratchTwoFragment` lab and saw
      navigation and automatic Back-button handling work with no
      hand-written duplication guard.
- [ ] `HomeFragment` exists, carries `tapCount` and its rescue logic
      forward from Lesson 5, and is reached automatically as
      `nav_graph.xml`'s own start destination.
- [ ] `InventoryActivity.java` and its Manifest entry are both deleted;
      `InventoryListFragment` is reached as a nav graph destination
      instead.
- [ ] The app's visible behavior (tap counter, rotation survival,
      reaching the inventory list, everything inside it) is unchanged
      from Lesson 18, verified by actually running it.
- [ ] Commit: message explaining why (e.g. "Introduce the Navigation
      Component, converting MainActivity into a HomeFragment hosted by
      a nav graph, and removing InventoryActivity now that
      InventoryListFragment can be reached as a graph destination
      directly").

Lesson 20 is next: `ItemDetailActivity` and `SettingsActivity` are still
full Activities, reached by plain `Intent`s from inside
`InventoryListFragment` — converting both into graph destinations too,
and passing the tapped `Item` as a nav graph argument instead of an
`Intent` extra, finishing the move to a single Activity hosting every
screen this app has.
