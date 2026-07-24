# Lesson 19: One Graph Instead of Many Intents — the Navigation Component

**What you will build:** `InventoryActivity` becomes the app's only
Activity — `ItemDetailActivity`, `AddItemActivity`, and
`SettingsActivity` are converted into Fragments, and every
`startActivity`/`Intent` navigation between them is replaced with a
single declarative **navigation graph**. The transferable problem: this
project now has five Activities, each with its own Manifest entry, each
navigated to with a hand-built `Intent` scattered across whatever
screen happens to trigger it. Every new screen means another Manifest
entry and another place `Intent`-construction logic could drift or
duplicate. The Navigation Component's answer: describe every screen and
every path between them in one XML resource, and let a generated,
type-checked API replace raw `Intent`/`putExtra`/`getParcelableExtra`
strings entirely.

**What you need to know first:** Lesson 18 (`InventoryListFragment`,
`FragmentManager`, `requireContext()`), Lesson 8 (`Intent` extras,
`Parcelable` — both replaced here by a safer mechanism), Lesson 4
(why Activities can't `new` each other — this lesson removes most of
this project's Activities, but the underlying reason Fragments still
need a host hasn't gone away).

---

## Concept Unit: Single-Activity Architecture — Why Collapse to One

### The Problem

Lesson 18 proved a Fragment can live inside any Activity's container.
Nothing stops *every* screen in this app from being a Fragment hosted
by the *same* single Activity — and there's a real, concrete reason to
do exactly that: right now, navigating from the inventory list to item
detail (Lesson 8) means building an `Intent`, tagging a `Parcelable`
extra by a string key, and reading it back by that same string key on
the other side, with nothing checking the two sides agree. Every one of
those hand-matched strings is a Lesson 7-style "parallel lists" risk,
just relocated to Activity boundaries instead of parallel lists.

### The Concept, in Prose

A **navigation graph** is one XML resource listing every destination
(each one, in this project, a Fragment) and every legal path between
them, as data — the same "describe structure declaratively, let a tool
generate the mechanical code" idea as `R.java` (Lesson 2) and Room's
annotation processing (Lesson 13), applied to screen-to-screen
navigation this time. A build-time plugin reads that graph and
generates a typed "directions" class per screen, replacing raw
`Intent`/`putExtra` calls with checked method calls the compiler
verifies.

---

## Concept Unit: Converting the Remaining Screens Into Fragments

### The Problem

Before any navigation graph can route between destinations, every
destination needs to actually be a Fragment, the way
`InventoryListFragment` already is.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** New files `ItemDetailFragment.java`,
  `AddItemFragment.java`, `SettingsFragment.java`; layout files renamed
  from `activity_*.xml` to `fragment_*.xml`; `ItemDetailActivity.java`,
  `AddItemActivity.java`, `SettingsActivity.java`, and their Manifest
  entries are all **deleted**.
- **Change type:** Create, rename, delete.
- **Dependencies:** the `onCreateView`/`onViewCreated` pattern from
  Lesson 18.

### The New Code

Each conversion follows the exact shape Lesson 18 already established
for `InventoryListFragment`. `SettingsFragment.java`, shown in full as
the smallest example (the other two follow identically — a layout
inflated in `onCreateView`, view logic moved into `onViewCreated`,
`requireContext()` replacing `this`):

```java
package com.yourname.pocketinventory;

import android.content.SharedPreferences;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.EditText;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;

public class SettingsFragment extends Fragment {
    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container,
                              @Nullable Bundle savedInstanceState) {
        return inflater.inflate(R.layout.fragment_settings, container, false);
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        SharedPreferences prefs = requireContext().getSharedPreferences("pocket_inventory_prefs",
                android.content.Context.MODE_PRIVATE);
        EditText thresholdInput = view.findViewById(R.id.thresholdInput);
        Button saveSettingsButton = view.findViewById(R.id.saveSettingsButton);

        int currentThreshold = prefs.getInt("low_stock_threshold", 5);
        thresholdInput.setText(String.valueOf(currentThreshold));

        saveSettingsButton.setOnClickListener(v -> {
            String text = thresholdInput.getText().toString().trim();
            try {
                int threshold = Integer.parseInt(text);
                prefs.edit().putInt("low_stock_threshold", threshold).apply();
                requireActivity().getOnBackPressedDispatcher().onBackPressed();
            } catch (NumberFormatException e) {
                thresholdInput.setError("Enter a whole number");
            }
        });
    }
}
```

### The Updated Project

This is the whole new file — every line is **reappearing** from
`SettingsActivity` (Lesson 11) except the very last statement inside
`saveSettingsButton`'s listener, called out next, and the two structural
methods (`onCreateView`/`onViewCreated`) already explained fully in
Lesson 18.

### Mechanical Walkthrough
- `requireActivity().getOnBackPressedDispatcher().onBackPressed()` —
  **first appearance.** A Fragment has no `finish()` of its own (Lesson
- 9/10's `finish()` was always an Activity method) — this is the
  Fragment-appropriate equivalent of "close this screen and return to
  whatever came before," and it's exactly what the Navigation
  Component wires up automatically once this Fragment is registered as
  a graph destination — a manual stand-in used here only because the
  graph doesn't exist yet at this exact point in the lesson; the next
  Concept Unit replaces it with the real, generated navigation call.

Delete `ItemDetailActivity.java`, `AddItemActivity.java`, and
`SettingsActivity.java` entirely, along with their three `<activity>`
- entries in `AndroidManifest.xml` — `ItemDetailFragment` and
`AddItemFragment` follow the identical conversion pattern (not repeated
here in full to avoid re-showing already-explained mechanics; every
line of their Lesson 9/8 logic carries over verbatim into
`onViewCreated`).

### SE Lens

**Why collapse to one Activity instead of leaving five and just
converting their internals?** A single-Activity app means exactly one
Manifest launcher entry, exactly one place the Activity lifecycle
(Lesson 5) is ever actually torn down and rebuilt — every *screen*
transition becomes a Fragment swap inside one stable Activity instead
of a full Activity destroy/recreate cycle, which is both cheaper and
removes an entire category of "did I remember the Manifest entry"
mistakes (Lesson 4's `ActivityNotFoundException` risk) for anything
that's purely internal navigation. The real cost: this project can no
longer let another app deep-link directly to, say, the Add Item screen
via a Manifest-declared `<intent-filter>` on that specific screen
(Lesson 8's `android:exported` concept) without additional Navigation
Component-specific configuration — a genuine tradeoff, not a pure
improvement, appropriate here because Pocket Inventory has no such
external-linking requirement.

---

## Concept Unit: The Navigation Graph — Declaring Every Screen and Path

### Commands Needed

Add to `app/build.gradle`'s `dependencies { }`:

```gradle
implementation 'androidx.navigation:navigation-fragment:2.7.7'
implementation 'androidx.navigation:navigation-ui:2.7.7'
```

Sync.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** New file
  `app/src/main/res/navigation/nav_graph.xml`; `activity_inventory.xml`
  (the container from Lesson 18, modified); `InventoryActivity.java`
  (simplified further).
- **Change type:** Create, modify.

### The New Code — the Graph

```xml
<navigation xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    android:id="@+id/nav_graph"
    app:startDestination="@id/inventoryListFragment">

    <fragment
        android:id="@+id/inventoryListFragment"
        android:name="com.yourname.pocketinventory.InventoryListFragment"
        android:label="Pocket Inventory">
        <action
            android:id="@+id/action_list_to_detail"
            app:destination="@id/itemDetailFragment" />
        <action
            android:id="@+id/action_list_to_addItem"
            app:destination="@id/addItemFragment" />
        <action
            android:id="@+id/action_list_to_settings"
            app:destination="@id/settingsFragment" />
    </fragment>

    <fragment
        android:id="@+id/itemDetailFragment"
        android:name="com.yourname.pocketinventory.ItemDetailFragment"
        android:label="Item Detail">
        <argument
            android:name="item"
            app:argType="com.yourname.pocketinventory.Item" />
    </fragment>

    <fragment
        android:id="@+id/addItemFragment"
        android:name="com.yourname.pocketinventory.AddItemFragment"
        android:label="Add Item" />

    <fragment
        android:id="@+id/settingsFragment"
        android:name="com.yourname.pocketinventory.SettingsFragment"
        android:label="Settings" />

</navigation>
```

### The Updated Project

This is a whole new file, a new resource type (`res/navigation/`,
alongside the `res/layout/` this project has used since Lesson 3) —
nothing to show it landing inside.

### Mechanical Walkthrough
- `<navigation ... app:startDestination="@id/inventoryListFragment">`
  — **first appearance.** The root element, naming which destination
- the graph opens on — the exact role `MainActivity`'s Manifest
  `<intent-filter>` MAIN/LAUNCHER combination (Lesson 2) played for the
  whole app, now scoped to this one graph.
- `<fragment android:id="..." android:name="..." android:label="...">`
  — **first appearance.** Each one declares a real Fragment class
- (`android:name`, a fully-qualified class name — the same idea as the
  Manifest's `.MainActivity` shorthand from Lesson 2, spelled out in
  full here) as a graph node; `android:label` is a human-readable name
  the Navigation Component can surface in a toolbar title, used
  starting Lesson 21.
- `<action android:id="..." app:destination="@id/itemDetailFragment" />`
  — **first appearance.** Declares a *legal path* from the enclosing
  Fragment to another — this is the actual replacement for a hand-built
  `Intent` targeting a specific Activity class: the graph, not scattered
  Java code, is now the single source of truth for which navigations
  are even possible.
- `<argument android:name="item" app:argType="com.yourname.pocketinventory.Item" />`
- — **first appearance.** Declares that reaching `itemDetailFragment` *requires* a value named `item`, of a specific type — this is the

  direct, compiler-checked replacement for Lesson 8's loosely-matched
  `"EXTRA_ITEM"` string key: the graph itself now enforces that
  anything navigating to this destination supplies the right data, of
  the right type, checked at build time by the plugin introduced next.

### Commands Needed — the Safe Args Plugin

Add to the **project-level** `build.gradle` (the file, not
`app/build.gradle`), inside the `plugins { }` block:

```gradle
id 'androidx.navigation.safeargs' version '2.7.7' apply false
```

And to `app/build.gradle`'s own `plugins { }` block:

```gradle
id 'androidx.navigation.safeargs'
```

Sync. This plugin reads `nav_graph.xml` at build time and generates a
typed "directions" class per Fragment — the mechanism that turns the
`<argument>` declaration above into real, checked Java, built next.

### The New Code — Wiring the Host

Replace `activity_inventory.xml`'s bare `FrameLayout` from Lesson 18:

```xml
<androidx.fragment.app.FragmentContainerView
    xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    android:id="@+id/navHostFragment"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:name="androidx.navigation.fragment.NavHostFragment"
    app:defaultNavHost="true"
    app:navGraph="@navigation/nav_graph" />
```

### The Updated Project

`InventoryActivity.java` shrinks to almost nothing:

```java
public class InventoryActivity extends AppCompatActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_inventory);
    }
}
```

The manual `if (savedInstanceState == null) { ...FragmentManager
transaction... }` block from Lesson 18 is gone entirely — replaced by
`NavHostFragment`, which reads `nav_graph.xml` itself and handles
placing the start destination (and restoring the correct one across
rotation) automatically.

### Mechanical Walkthrough

- `<androidx.fragment.app.FragmentContainerView ...>` — **first
  appearance.** A specialized container, purpose-built for hosting
  Fragments (as opposed to the plain `FrameLayout` from Lesson 18,
  which worked but wasn't Fragment-aware).
- `android:name="androidx.navigation.fragment.NavHostFragment"` —
  **first appearance of a `<fragment>`-hosting layout tag naming a
  Fragment class directly in XML** — this specific value is a
  framework-provided Fragment whose entire job is reading a nav graph
  and managing which destination Fragment is currently shown.
- `app:navGraph="@navigation/nav_graph"` — **first appearance**, a
  resource reference (same `@type/name` syntax as `@layout/activity_main`
  since Lesson 2) pointing at the graph built above.
- `app:defaultNavHost="true"` — **first appearance.** Tells the system
  this `NavHostFragment` should intercept the device Back button
  (Lesson 5's back stack, now managed by the nav graph's own internal
  back stack instead of the OS Activity stack) — this is what makes
  `requireActivity().getOnBackPressedDispatcher().onBackPressed()` from
  earlier this lesson correctly return to the previous *destination*
  in the graph, not the previous Activity (there mostly isn't one
  anymore).

### The New Code — Navigating Through the Graph

In `InventoryListFragment.onViewCreated`, replace every
`Intent`/`startActivity` call:

```java
adapter = new InventoryAdapter(new ArrayList<>(), item -> {
    InventoryListFragmentDirections.ActionListToDetail action =
            InventoryListFragmentDirections.actionListToDetail(item);
    androidx.navigation.Navigation.findNavController(view).navigate(action);
});
```

```java
settingsButton.setOnClickListener(v ->
        androidx.navigation.Navigation.findNavController(view)
                .navigate(R.id.action_list_to_settings));

addButton.setOnClickListener(v ->
        androidx.navigation.Navigation.findNavController(view)
                .navigate(R.id.action_list_to_addItem));
```

And `ItemDetailFragment` reads its argument instead of an `Intent`
extra:

```java
Item item = ItemDetailFragmentArgs.fromBundle(getArguments()).getItem();
```

### The Updated Project

`InventoryListFragment.onViewCreated`'s relevant section now reads:

```java
adapter = new InventoryAdapter(new ArrayList<>(), item -> {                          // ← changed
    InventoryListFragmentDirections.ActionListToDetail action =                       // ← changed
            InventoryListFragmentDirections.actionListToDetail(item);                 // ← changed
    androidx.navigation.Navigation.findNavController(view).navigate(action);          // ← changed
});
recyclerView.setAdapter(adapter);

viewModel.getItems().observe(getViewLifecycleOwner(), updatedItems -> adapter.setItems(updatedItems));
viewModel.loadItems();

Button settingsButton = view.findViewById(R.id.settingsButton);
settingsButton.setOnClickListener(v ->                                                // ← changed
        androidx.navigation.Navigation.findNavController(view)                        // ← changed
                .navigate(R.id.action_list_to_settings));                             // ← changed

Button addButton = view.findViewById(R.id.addItemButton);
addButton.setOnClickListener(v ->                                                     // ← changed
        androidx.navigation.Navigation.findNavController(view)                        // ← changed
                .navigate(R.id.action_list_to_addItem));                              // ← changed
```

### Mechanical Walkthrough
- `InventoryListFragmentDirections` — **first appearance.** A class you
- never write — generated by the Safe Args plugin from `nav_graph.xml`,
  one per Fragment that declares outgoing `<action>`s, named
  `<FragmentClassName>Directions` by convention. Same code-generation
  shape as `R.java` (Lesson 2) and Room's generated DAO implementations
  (Lesson 13).
- `.actionListToDetail(item)` — **first appearance.** A generated
  **static method**, one per `<action>` in the graph, named by
  converting the action's `android:id` (`action_list_to_detail`) to
  camelCase — its parameter list is generated directly from the
  destination's declared `<argument>` tags, meaning a missing or
  wrong-typed argument here is a **compile error**, not a runtime
  `null` the way a mistyped `"EXTRA_ITEM"` string (Lesson 8) would
  have been.
- `Navigation.findNavController(view)` — **first appearance.** Locates
  the `NavController` managing whichever `NavHostFragment` contains
- this Fragment's `view` — the object that actually performs
  navigation, reading the graph and executing the requested action.
- `.navigate(action)` — **first appearance.** Executes the generated
- `NavDirections` object — replacing `startActivity(intent)` for a
  navigation carrying data, and `.navigate(R.id.action_list_to_settings)`
  — a resource-ID overload — for one that doesn't.
- `ItemDetailFragmentArgs.fromBundle(getArguments())` — **first
  appearance.** The receiving-side generated class (`<FragmentClassName>Args`),
  reading back exactly the arguments the graph declared this
- destination requires.
- `getArguments()` — **first appearance** —
  returns the `Bundle` (Lesson 5/8's same underlying container) the
  Navigation Component populated on your behalf from the `actionListToDetail(item)`
  call.
- `.getItem()` — **first appearance.** A generated, typed getter — no
  string key, no cast, no `null` check needed for a missing key, since
  the graph's `<argument>` declaration guarantees, at compile time,
  that any Fragment reaching this destination arrived with a real
  `Item`.

### Run It

Run the app. Every navigation — list to detail, list to Add Item, list
to Settings, and Back from any of them — works exactly as before, now
routed entirely through `nav_graph.xml` and generated, checked Java
instead of hand-built `Intent`s. Try deliberately breaking a build:
temporarily delete the `<argument>` line from `itemDetailFragment` in
the graph and try to compile — `InventoryListFragmentDirections.actionListToDetail(item)`
now fails to compile (the generated method's signature changed to take
no arguments), a real, immediate, compile-time catch of exactly the
kind of drift Lesson 8's string-keyed extras could never have caught.
Restore the `<argument>` line afterward.

### CS Lens

A navigation graph is a literal **directed graph** — nodes
(destinations) and edges (actions) — the same data structure shape
taught in any algorithms course, here used to model an app's screen
topology instead of a network or a map. Also recognized in: website
sitemaps, state machines (a screen *is* a state; an action *is* a
transition), and finite automata diagrams in compiler theory.

### SE Lens

**Why generate a whole `Directions`/`Args` class pair per destination
instead of just calling `NavController.navigate()` with a raw `Bundle`
of extras, closer to how `Intent` extras worked?** A raw-`Bundle`
version would still carry Lesson 8's exact original risk forward
unchanged — mismatched keys, wrong types, caught only at runtime.
Generating typed classes from the graph moves that entire class of
mistake to compile time, at the cost of an extra build step (the Safe
Args plugin) and generated code you'll never directly read the source
of — the same tradeoff already made, and already justified, for `R.java`
in Lesson 2 and Room in Lesson 13, applied here to navigation.

---

## Connect the Pieces

Full trace: `InventoryActivity` inflates one `FragmentContainerView`
hosting a `NavHostFragment`, which reads `nav_graph.xml` and places
`InventoryListFragment` — the declared `startDestination` — without any
manual `FragmentManager` transaction anywhere in Activity code anymore
→ tapping a row calls the Safe-Args-generated
`InventoryListFragmentDirections.actionListToDetail(item)`, producing a
`NavDirections` object carrying the tapped `Item`, type-checked against
the graph's `<argument>` declaration at compile time → `NavController.navigate(action)`
swaps the hosted Fragment to `ItemDetailFragment`, popping the graph's
own internal back stack (not the OS Activity stack, since only one
Activity exists now) on the system Back button → `ItemDetailFragmentArgs.fromBundle(getArguments()).getItem()`
retrieves the same `Item`, with no string key anywhere in either
direction.

## What Breaks Without This

Already demonstrated above: deleting the `<argument>` declaration and
watching the generated `Directions` method's signature change,
breaking the build immediately at the call site — restored afterward.

## Exercises

1. Add a fourth destination and action: a `LowStockFragment` (reuse
   `InventoryListFragment`'s layout and Adapter-building logic, just
   filtering `viewModel.getItems()`'s value down to items at or below
   the stored threshold before calling `adapter.setItems(...)`), reached
   via a new button and a new `<action>` from `inventoryListFragment`.
2. Open `AndroidManifest.xml` and confirm only one `<activity>` entry
   remains. Count how many separate `Intent`-construction call sites
   existed across this project as of Lesson 18, versus how many exist
   now — a concrete measure of what this lesson actually removed.

## Definition of Done

- [ ] Every screen is a Fragment; `InventoryActivity` is the only
      Activity remaining in the Manifest.
- [ ] `nav_graph.xml` declares every destination and every legal
      action between them.
- [ ] Every navigation in the app goes through generated `Directions`/
      `Args` classes — no raw `Intent`/`putExtra`/`getParcelableExtra`
      calls remain between screens within this app.
- [ ] You broke a graph argument on purpose, saw the real compile
      error, and restored it.
- [ ] Commit: message explaining why (e.g. "Collapse to a single
      Activity hosting every screen as a Fragment via the Navigation
      Component, replacing hand-built Intents with a compile-time-
      checked navigation graph").

Lesson 20 is next: adding, removing, and reordering items still calls
either `notifyDataSetChanged()` (redraw everything) or
`notifyItemInserted()` (one specific case) — `DiffUtil`, and correctly
animating *any* shape of list change, including edits and reorders
Lesson 16 never had to handle.
