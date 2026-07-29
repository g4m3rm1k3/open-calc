# Lesson 20: Finishing the Nav Graph — Item Arguments and One Activity Total

**What you will build:** `ItemDetailActivity` and `SettingsActivity`
both become nav graph destinations, the same conversion Lesson 19 gave
`MainActivity`/`InventoryActivity`. Tapping a row now passes the tapped
`Item` as a nav graph **argument** instead of an `Intent` extra — the
same `Parcelable Item` Lesson 8 built, carried by a `Bundle` either
way, just handed to `NavController` instead of `startActivity`.
Finishing Settings now calls `popBackStack()` instead of `finish()`,
since a Fragment destination has no Activity to finish. By the end of
this lesson, `MainActivity` is the **only** Activity left in this
entire project — every screen Pocket Inventory has is a Fragment
destination in one graph, hosted by one `NavHostFragment`.

**What you need to know first:** Lesson 19 (`NavHostFragment`,
`NavController`, nav graph actions, `MainActivity`/`InventoryActivity`
already converted). Lesson 8 (`Item implements Parcelable`, `Intent`
extras — this lesson's argument-passing is the same `Parcelable`
object, a different transport). Lesson 10 (`SettingsActivity`,
`SharedPreferences`, the `finish()` call this lesson replaces).

**Terms introduced in this lesson:**
- **Nav graph argument** — a value attached to a specific destination,
  passed via the same `Bundle` mechanism `Fragment` arguments (Lesson
  18's `onCreateView`'s own `savedInstanceState` parameter shape) and
  `Intent` extras (Lesson 4/8) both already use.
- **`requireArguments()`** — returns a Fragment's argument `Bundle`,
  throwing immediately if none was ever set, the same
  fail-loudly-instead-of-silently-crashing-later shape as
  `requireContext()`/`requireActivity()` (Lesson 18).
- **`NavController.popBackStack()`** — programmatically performs the
  same move the system Back button would: returns to the previous
  destination on the graph's own back stack.
- **Safe Args** (mentioned, not adopted) — an optional Gradle plugin
  generating type-checked argument-passing classes automatically; this
  project continues writing `Bundle` code explicitly instead, the same
  choice already made about `Room`/`DiffUtil`-style generated
  conveniences.

---

## Concept Unit: Converting `ItemDetailActivity`, Passing `Item` as a Nav Graph Argument

### The Problem

`InventoryListFragment`'s row-tap callback still builds an `Intent` and
calls `startActivity(new Intent(requireContext(), ItemDetailActivity.class))`
— the one remaining `startActivity` call in this project reaching a
screen that could just as easily be a nav graph destination, exactly
like `InventoryActivity` was in Lesson 19.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** new file `fragment_item_detail.xml` (copied from
  `activity_item_detail.xml`), new file `ItemDetailFragment.java`,
  `nav_graph.xml` (add a destination and an action),
  `InventoryListFragment.java` (the row-tap callback), delete
  `ItemDetailActivity.java`, its Manifest entry, and the now-orphaned
  `activity_item_detail.xml`.
- **Change type:** Create, modify, remove.
- **Dependencies:** `Item implements Parcelable` (Lesson 8).

### The New Code — the Destination and Its Argument

Add to `nav_graph.xml`, inside `inventoryListFragment`'s own element:

```xml
<action
    android:id="@+id/action_inventoryListFragment_to_itemDetailFragment"
    app:destination="@id/itemDetailFragment" />
```

And as a new top-level destination:

```xml
<fragment
    android:id="@+id/itemDetailFragment"
    android:name="com.yourname.pocketinventory.ItemDetailFragment"
    android:label="Item Detail" />
```

### The New Code — `ItemDetailFragment`

Copy `activity_item_detail.xml`'s contents verbatim into
`fragment_item_detail.xml`. Create `ItemDetailFragment.java`:

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

public class ItemDetailFragment extends Fragment {
    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container,
                              @Nullable Bundle savedInstanceState) {
        return inflater.inflate(R.layout.fragment_item_detail, container, false);
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        Item item = requireArguments().getParcelable("EXTRA_ITEM");

        TextView nameText = view.findViewById(R.id.detailNameText);
        TextView infoText = view.findViewById(R.id.detailInfoText);
        nameText.setText(item.getName());
        infoText.setText("Quantity: " + item.getQuantity() + "\nLocation: " + item.getLocation());
    }
}
```

### The Updated Project

This is the whole new file. Compare against Lesson 8's original
`ItemDetailActivity`: `onCreate` splitting into `onCreateView`/
`onViewCreated` is Lesson 18's own conversion shape; every other line —
reading the `Item`, setting both `TextView`s — is **reappearing**,
identical logic, only relocated.

### Mechanical Walkthrough

- `requireArguments().getParcelable("EXTRA_ITEM")` — **first appearance
  of `requireArguments()`.** A Fragment's arguments arrive as a
  `Bundle`, set once (below) before this Fragment is ever shown;
  `requireArguments()` returns it, throwing an `IllegalStateException`
  immediately if none was ever attached — the same "fail loudly, right
  here" shape `requireContext()` (Lesson 18) already established, rather
  than returning `null` and crashing somewhere unrelated inside
  `onViewCreated`'s own body instead. `.getParcelable("EXTRA_ITEM")` —
  reappearing (Lesson 8's own `Intent.getParcelableExtra`, same idea, a
  `Bundle`'s own method instead of an `Intent`'s), reading the exact
  `Item` object the previous unit's caller attaches, next.

### The New Code — Navigating With an Argument

In `InventoryListFragment`, replace the row-tap callback:

```java
adapter = new InventoryAdapter(viewModel.getItems().getValue(), item -> {
    Bundle args = new Bundle();
    args.putParcelable("EXTRA_ITEM", item);
    Navigation.findNavController(requireView())
            .navigate(R.id.action_inventoryListFragment_to_itemDetailFragment, args);
});
```

(Needs `import androidx.navigation.Navigation;` at the top, alongside
the existing imports.)

### The Updated Project

```java
adapter = new InventoryAdapter(viewModel.getItems().getValue(), item -> {
    Bundle args = new Bundle();                                                       // ← changed (was building an Intent)
    args.putParcelable("EXTRA_ITEM", item);                                           // ← changed (was intent.putExtra)
    Navigation.findNavController(requireView())                                       // ← changed (was startActivity(intent))
            .navigate(R.id.action_inventoryListFragment_to_itemDetailFragment, args);
});
```

### Mechanical Walkthrough

- `Bundle args = new Bundle(); args.putParcelable("EXTRA_ITEM", item);`
  — reappearing (`Bundle`, Lesson 5; `Parcelable`/`putParcelable`,
  Lesson 8's own `Intent.putExtra` sibling method) — the exact same
  container type Lesson 5 used to rescue `tapCount` across rotation,
  here carrying a whole `Item` across a *navigation*, not a
  configuration change; the same `Bundle` class does both jobs.
- `requireView()` — **first appearance.** Returns this Fragment's own
  root `View`, throwing immediately if called before one exists — the
  same `require`-family shape as `requireContext()`/`requireArguments()`
  above, needed here specifically because this lambda has no `View`
  parameter of its own to call `Navigation.findNavController(v)` on the
  way Lesson 19's button listeners could.
- `.navigate(R.id.action_inventoryListFragment_to_itemDetailFragment, args)`
  — reappearing (`navigate`, Lesson 19), new detail: the two-argument
  overload attaches `args` as the destination Fragment's own arguments
  `Bundle` — exactly what `requireArguments()` reads back, above.

### Removing `ItemDetailActivity`

Delete `ItemDetailActivity.java`, its `<activity
android:name=".ItemDetailActivity" ... />` Manifest entry, and the now
orphaned `activity_item_detail.xml` (its contents already live in
`fragment_item_detail.xml`; leaving the old file around unused would be
a dead file nothing explains).

### CS Lens

Passing `Item` through a nav graph argument instead of an `Intent`
extra is the same underlying mechanism — a `Bundle` — wearing a
different name depending on *which* framework object is doing the
carrying. Recognizing "this is the same container, just handed to a
different API" is the general skill of seeing past a framework's own
vocabulary to the actual data structure underneath it.

### SE Lens

**Why not use Safe Args, a real Gradle plugin that generates a
type-checked class for each destination's arguments automatically,
instead of the plain `Bundle`/`getParcelable` shape used here?** Safe
Args exists specifically to remove the one real risk this lesson's own
code still carries: `"EXTRA_ITEM"` is a bare string, typed identically
in two separate files, with nothing checking the two spellings agree
until the app actually runs and `getParcelable` silently returns
`null`. Safe Args would catch a typo here at compile time. This project
continues favoring the explicit, hand-written version instead — the
same choice already made about `Room` and `DiffUtil` — because seeing
the actual `Bundle` mechanism directly is this course's whole point;
Safe Args is a real, legitimate tool worth knowing exists for a project
where typing the same string twice, correctly, every time, stops being
an acceptable cost.

---

## Concept Unit: Converting `SettingsActivity`, Going Back Without `finish()`

### The Problem

`InventoryListFragment`'s Settings button still calls
`startActivity(new Intent(requireContext(), SettingsActivity.class))`,
and `SettingsActivity` itself calls `finish()` once a new threshold is
saved. Neither call makes sense once `SettingsActivity` is a Fragment
destination instead of an Activity — Fragments have no `finish()` of
their own to call.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** new file `fragment_settings.xml` (copied from
  `activity_settings.xml`), new file `SettingsFragment.java`,
  `nav_graph.xml` (add a destination and an action),
  `InventoryListFragment.java` (the Settings button listener), delete
  `SettingsActivity.java`, its Manifest entry, and the now-orphaned
  `activity_settings.xml`.
- **Change type:** Create, modify, remove.
- **Dependencies:** `SharedPreferences` (Lesson 10).

### The New Code — the Destination

Add to `nav_graph.xml`, inside `inventoryListFragment`'s own element:

```xml
<action
    android:id="@+id/action_inventoryListFragment_to_settingsFragment"
    app:destination="@id/settingsFragment" />
```

And as a new top-level destination:

```xml
<fragment
    android:id="@+id/settingsFragment"
    android:name="com.yourname.pocketinventory.SettingsFragment"
    android:label="Settings" />
```

### The New Code — `SettingsFragment`

Copy `activity_settings.xml`'s contents verbatim into
`fragment_settings.xml`. Create `SettingsFragment.java`:

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
import androidx.navigation.Navigation;

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

        SharedPreferences prefs =
                requireContext().getSharedPreferences("pocket_inventory_prefs", android.content.Context.MODE_PRIVATE);
        EditText thresholdInput = view.findViewById(R.id.thresholdInput);
        Button saveSettingsButton = view.findViewById(R.id.saveSettingsButton);

        int currentThreshold = prefs.getInt("low_stock_threshold", 5);
        thresholdInput.setText(String.valueOf(currentThreshold));

        saveSettingsButton.setOnClickListener(v -> {
            String text = thresholdInput.getText().toString().trim();
            try {
                int threshold = Integer.parseInt(text);
                SharedPreferences.Editor editor = prefs.edit();
                editor.putInt("low_stock_threshold", threshold);
                editor.apply();
                Navigation.findNavController(v).popBackStack();
            } catch (NumberFormatException e) {
                thresholdInput.setError("Enter a whole number");
            }
        });
    }
}
```

### The Updated Project

This is the whole new file. Every line except the final line inside
`saveSettingsButton`'s listener is **reappearing**, moved verbatim from
Lesson 10's `SettingsActivity` — `getSharedPreferences`, the
`try`/`catch` around `Integer.parseInt`, `Editor.putInt`/`apply()`, and
`setError` are all unchanged.

### Mechanical Walkthrough

- `requireContext().getSharedPreferences(...)` — reappearing (Lesson
  10), now through `requireContext()` (Lesson 18) instead of an
  implicit `this`.
- `Navigation.findNavController(v).popBackStack();` — **first
  appearance of `popBackStack()`.** Replaces `finish()` — where
  `finish()` told the OS "this Activity is done, remove it," a Fragment
  destination has no such concept of its own; `popBackStack()` instead
  tells the *graph's* own back stack "remove the current destination,
  return to whatever's beneath it" — mechanically the same *result*
  (return to the previous screen) reached through the graph's own
  bookkeeping instead of the OS's Activity stack.
- `thresholdInput.setError("Enter a whole number")` — reappearing
  (Lesson 10), unchanged.

### Removing `SettingsActivity`

Delete `SettingsActivity.java`, its Manifest entry, and the now
orphaned `activity_settings.xml`.

### The New Code — the Settings Button

In `InventoryListFragment`, replace the Settings button's listener:

```java
settingsButton.setOnClickListener(v ->
        Navigation.findNavController(v).navigate(R.id.action_inventoryListFragment_to_settingsFragment));
```

### Mechanical Walkthrough

- `Navigation.findNavController(v).navigate(...)` — reappearing
  (Lesson 19), replacing `startActivity(new Intent(...))` — `v` is
  available directly here, this listener's own parameter, unlike the
  row-tap callback earlier in this lesson that needed `requireView()`
  instead.

### CS Lens

`popBackStack()` versus `finish()` is the same distinction Lesson 5's
own back stack (a stack of Activities, managed by the OS) versus this
lesson's nav graph back stack (a stack of destinations, managed by
`NavController`) already drew — two different objects maintaining
structurally the same LIFO shape, each exposing its own "undo the most
recent entry" operation under a different name.

### SE Lens

**Why does `SettingsFragment` need to know to call `popBackStack()` at
all, instead of the Navigation Component just handling "go back after
saving" automatically?** Because "save, then go back" is this specific
screen's own business logic, not something Navigation Component could
guess — a different destination might want to save and stay, or save
and navigate somewhere else entirely rather than back. The framework
correctly leaves *when* to navigate as an explicit decision your own
code makes; it only handles *how* the back stack itself is tracked and
manipulated once you decide to.

---

## Connect the Pieces

Full trace, closing out both this lesson and Lesson 19's own arc:
tapping a row in `InventoryListFragment` now builds a `Bundle`, packs
the tapped `Item` into it under `"EXTRA_ITEM"`, and calls
`Navigation.findNavController(requireView()).navigate(...)` with that
`Bundle` as an argument — `ItemDetailFragment` reads it back through
`requireArguments().getParcelable(...)`. Tapping Settings navigates the
same way; saving a new threshold calls `popBackStack()` instead of a
now-nonexistent `finish()`. `ItemDetailActivity.java` and
`SettingsActivity.java` are both deleted, along with their Manifest
entries and their now-orphaned layout files. `MainActivity` is the only
`<activity>` remaining in `AndroidManifest.xml` — every screen this
project has, from the very first "Hello World" of Lesson 1 through
today, is now a Fragment destination inside one nav graph, hosted by
one `NavHostFragment`, reached through one consistent API
(`Navigation.findNavController(...).navigate(...)`) instead of four
Activities each wired up its own way.

## What Breaks Without This

In `ItemDetailFragment`, temporarily change
`requireArguments().getParcelable("EXTRA_ITEM")`'s key to a misspelled
`"EXTRA_ITEMS"` (plural), while leaving `InventoryListFragment`'s own
`args.putParcelable("EXTRA_ITEM", item)` unchanged. Tap any row and run
it. Read the real crash — a `NullPointerException` the moment `item.getName()`
runs against a `null` `item`, since `getParcelable` silently returns
`null` for a key that was never actually set under that exact spelling
— the concrete, reproducible version of the SE Lens's own warning about
what Safe Args would have caught instead at compile time. Restore the
correct key afterward.

## Exercises

1. Search this project for the literal strings `ItemDetailActivity` and
   `SettingsActivity`. Confirm the only remaining mentions are in old
   lesson files, never in real project code.
2. Open `AndroidManifest.xml` and count the `<activity>` entries.
   Confirm there is exactly one, `MainActivity` — the concrete,
   checkable proof this project is now a genuine single-Activity app.

## Definition of Done

- [ ] `ItemDetailFragment` and `SettingsFragment` both exist and are
      reached as nav graph destinations from `InventoryListFragment`.
- [ ] Tapping a row still shows the correct item's name, quantity, and
      location; saving a new low-stock threshold in Settings still
      works and correctly returns to the inventory list.
- [ ] `ItemDetailActivity.java`, `SettingsActivity.java`, both their
      Manifest entries, and both now-orphaned `activity_*.xml` layout
      files are deleted.
- [ ] `AndroidManifest.xml` contains exactly one `<activity>` entry.
- [ ] You broke the argument key on purpose, saw the real
      `NullPointerException`, and restored it.
- [ ] Commit: message explaining why (e.g. "Convert ItemDetailActivity
      and SettingsActivity into nav graph destinations, passing Item as
      a Bundle argument instead of an Intent extra, completing the move
      to a single-Activity app").

Lesson 21 is next: with every screen now visited through one growing
nav graph, and the item list itself now loading and updating through
`LiveData`, `RecyclerView.notifyDataSetChanged()` still redraws every
visible row from scratch on every change — `DiffUtil`, and updating
only the rows that actually changed.
