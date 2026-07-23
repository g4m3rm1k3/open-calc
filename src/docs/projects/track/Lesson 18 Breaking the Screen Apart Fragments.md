# Lesson 18: Breaking the Screen Apart — Fragments and the FragmentManager

**What you will build:** The inventory list's entire UI moves out of
`InventoryActivity` and into a new, embeddable `InventoryListFragment`
— `InventoryActivity` itself shrinks to a thin container that hosts it.
The transferable problem: every screen in this project has been a
whole Activity, each requiring its own Manifest entry and reached only
through a full-screen `Intent` navigation (Lesson 4). That's a real
limit: a piece of UI can't be embedded *inside* another screen, shown
alongside something else, or reused in more than one place, if it can
only ever exist as an entire, standalone Activity. `Fragment` is
Android's answer — a reusable, embeddable chunk of UI with its own
lifecycle, hosted *inside* an Activity's view tree instead of replacing
it — and this lesson is also directly preparing the ground for Lesson
19's Navigation Component, which specifically orchestrates Fragments,
not Activities.

**What you need to know first:** Lesson 5 (Activity lifecycle — a
Fragment has a related but distinct one), Lesson 15/16/17
(`InventoryViewModel`, `ItemRepository`, `LiveData` — all reused
unchanged by the Fragment built here), Lesson 6 (`RecyclerView`,
`InventoryAdapter` — relocated, not rewritten).

---

## Concept Unit: `Fragment` — a Screen's Worth of UI, Embeddable Instead of Standalone

### The Problem

See the core mechanism — a `Fragment` hosted inside an existing
Activity's layout — before touching the real, business-logic-heavy
inventory screen.

### Introduce the Concept in Isolation

Temporarily add a container to `activity_inventory.xml`:

```xml
<FrameLayout
    android:id="@+id/scratchContainer"
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    app:layout_constraintTop_toTopOf="parent" />
```

Create a throwaway file, `ScratchFragment.java`:

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

public class ScratchFragment extends Fragment {
    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container,
                              @Nullable Bundle savedInstanceState) {
        TextView text = new TextView(requireContext());
        text.setText("Hello from a Fragment");
        text.setPadding(32, 32, 32, 32);
        return text;
    }
}
```

Temporarily add to `InventoryActivity.onCreate`, after `setContentView`:

```java
getSupportFragmentManager()
        .beginTransaction()
        .replace(R.id.scratchContainer, new ScratchFragment())
        .commit();
```

Run it. "Hello from a Fragment" appears at the top of the inventory
screen, laid out inside `scratchContainer` — real proof a `Fragment`'s
UI can occupy a *portion* of a screen rather than the whole thing, the
one thing an Activity can never do.

### Discard the Throwaway Example

Delete `ScratchFragment.java`, the temporary transaction block, and the
`scratchContainer` `FrameLayout` from `activity_inventory.xml` — none
of it appears in the project again; the real `InventoryListFragment`,
built next, replaces the *entire* screen's content, not a small corner
of it.

### Mechanical Walkthrough

- `extends Fragment` — **first appearance.** Same "must extend the
  framework's class" pattern as `AppCompatActivity` (Lesson 2), a
  different base class carrying a related but distinct lifecycle.
- `onCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState)`
  — **first appearance.** The Fragment counterpart to `Activity.onCreate`
  plus `setContentView` combined into one step: instead of calling
  `setContentView(...)` as a side effect (Lesson 2), a Fragment
  **returns** the `View` it wants shown, directly, as this method's
  result.
- `@Nullable` / `@NonNull` — reappearing (Lesson 6), applied to method
  parameters and a return type this time rather than just parameters.
- `new TextView(requireContext())` — **first appearance of
  `requireContext()`.** A Fragment doesn't have its own `Context` the
  way an Activity *is* one (Lesson 8's `InventoryActivity.this` as
  `Context` argument) — `requireContext()` retrieves the hosting
  Activity's `Context`, throwing immediately if called before the
  Fragment is actually attached to one (safer than a silent `null`).
- `getSupportFragmentManager()` — **first appearance.** Every
  `AppCompatActivity` provides one — the object responsible for adding,
  replacing, and removing Fragments within that Activity.
- `.beginTransaction()` — **first appearance.** Fragment changes are
  batched into an explicit **transaction** object — you can add,
  remove, or replace several Fragments as one atomic unit before
  finalizing it, rather than each change taking effect immediately and
  independently.
- `.replace(R.id.scratchContainer, new ScratchFragment())` — **first
  appearance.** Names the container view (matching Lesson 3's
  `@+id/`-declared views) and the Fragment instance to place inside it
  — `replace` specifically removes whatever Fragment currently occupies
  that container first, if any, then adds the new one.
- `.commit()` — **first appearance.** Finalizes and actually executes
  the transaction — nothing in the previous three lines takes effect on
  screen until this is called, the same "stage changes, then commit
  them together" shape as `SharedPreferences.Editor` from Lesson 11.

### CS Lens

A Fragment hosted inside a container view, managed by a
`FragmentManager`, is a form of **UI composition** — building a screen
out of independently-defined, swappable pieces rather than one
monolithic definition. Also recognized in: web component/widget
systems (embedding a reusable component inside a page), a windowing
system's panes/panels within one application window, and the general
software idea of composing small, focused units rather than growing one
large one indefinitely — directly connected to Lesson 6's Adapter
pattern, which already separated "what data" from "how arranged"; this
is the same instinct applied to whole chunks of screen instead of list
rows.

---

## Concept Unit: Migrating the Real Inventory Screen Into a Fragment

### The Problem

Time to apply this for real: `InventoryActivity`'s entire current
content — the `RecyclerView`, both buttons, the `ViewModel`
observation, the Activity Result launcher — moves into a genuine
`InventoryListFragment`.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** Rename `activity_inventory.xml`'s current
  contents into a new file `fragment_inventory_list.xml`; replace
  `activity_inventory.xml` with a bare container; new file
  `InventoryListFragment.java`; `InventoryActivity.java` (shrinks
  drastically).
- **Change type:** Create, replace, modify.
- **Dependencies:** `InventoryViewModel`, `ItemRepository` (Lesson
  15/17), `InventoryAdapter` (Lesson 6/16), `AddItemActivity`,
  `SettingsActivity`, `ItemDetailActivity` (unchanged, still real
  Activities — this lesson converts one screen, not the whole app).

### The New Code — the Fragment's Layout

Copy `activity_inventory.xml`'s current contents (the `RecyclerView`
plus `settingsButton`/`addItemButton`, from Lesson 11) verbatim into a
new file, `fragment_inventory_list.xml` — no changes to the XML itself,
only the filename.

Replace `activity_inventory.xml` with:

```xml
<FrameLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:id="@+id/fragmentContainer"
    android:layout_width="match_parent"
    android:layout_height="match_parent" />
```

### The Updated Project

`activity_inventory.xml` is now a single, empty `FrameLayout` — a bare
container with no content of its own, existing purely to have a real
`View` in the hierarchy for a Fragment's UI to be placed inside.

### Mechanical Walkthrough

- `<FrameLayout ...>` — **first appearance as a root element on its
  own** (briefly seen as `scratchContainer`'s type in the throwaway
  lab). The simplest container Android provides — no arrangement logic
  at all (contrast `ConstraintLayout`'s relationship-solving, Lesson 3,
  or `LinearLayout`'s stacking, Lesson 7) — appropriate here since its
  only job is being *replaceable*, not arranging multiple children.

### The New Code — the Fragment Itself

```java
package com.yourname.pocketinventory;

import android.content.Intent;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.lifecycle.ViewModelProvider;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import java.util.ArrayList;

public class InventoryListFragment extends Fragment {
    private InventoryViewModel viewModel;
    private InventoryAdapter adapter;

    private final ActivityResultLauncher<Intent> addItemLauncher =
            registerForActivityResult(new ActivityResultContracts.StartActivityForResult(), result -> {
        if (result.getResultCode() == android.app.Activity.RESULT_OK && result.getData() != null) {
            Item newItem = result.getData().getParcelableExtra("EXTRA_NEW_ITEM");
            if (newItem != null) {
                viewModel.addItem(newItem);
            }
        }
    });

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container,
                              @Nullable Bundle savedInstanceState) {
        return inflater.inflate(R.layout.fragment_inventory_list, container, false);
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        viewModel = new ViewModelProvider(requireActivity()).get(InventoryViewModel.class);

        RecyclerView recyclerView = view.findViewById(R.id.inventoryRecyclerView);
        recyclerView.setLayoutManager(new LinearLayoutManager(requireContext()));
        adapter = new InventoryAdapter(new ArrayList<>(), item -> {
            Intent intent = new Intent(requireContext(), ItemDetailActivity.class);
            intent.putExtra("EXTRA_ITEM", item);
            startActivity(intent);
        });
        recyclerView.setAdapter(adapter);

        viewModel.getItems().observe(getViewLifecycleOwner(), updatedItems -> adapter.setItems(updatedItems));
        viewModel.loadItems();

        Button settingsButton = view.findViewById(R.id.settingsButton);
        settingsButton.setOnClickListener(v ->
                startActivity(new Intent(requireContext(), SettingsActivity.class)));

        Button addButton = view.findViewById(R.id.addItemButton);
        addButton.setOnClickListener(v ->
                addItemLauncher.launch(new Intent(requireContext(), AddItemActivity.class)));
    }

    @Override
    public void onResume() {
        super.onResume();
        android.content.SharedPreferences prefs =
                requireContext().getSharedPreferences("pocket_inventory_prefs", android.content.Context.MODE_PRIVATE);
        int threshold = prefs.getInt("low_stock_threshold", 5);
        adapter.setLowStockThreshold(threshold);
    }
}
```

### The Updated Project

This is the whole new file. Every field, the launcher, the
`RecyclerView` setup, the `observe` call, the two button listeners, and
the `onResume` threshold logic are **reappearing**, moved verbatim from
`InventoryActivity` as it stood at the end of Lesson 17 — the class as
a whole now does everything `InventoryActivity` used to do, hosted as a
Fragment instead of an Activity.

### Mechanical Walkthrough

- `registerForActivityResult(...)` field — reappearing (Lesson 10),
  worth one clause: `Fragment` supports this exact same API, field-
  declared the same way, for the same "must register before the host
  is fully ready" timing reason as Lesson 10 explained for Activities.
- `onCreateView` returning `inflater.inflate(R.layout.fragment_inventory_list, container, false)`
  — reappearing (`LayoutInflater.inflate`, Lesson 6's `onCreateViewHolder`),
  same three-argument shape, same `false` meaning ("don't attach yet —
  the Fragment system handles that"), applied here to inflate an entire
  screen's layout instead of one row.
- `onViewCreated(View view, Bundle savedInstanceState)` — **first
  appearance, and worth explaining why it's separate from
  `onCreateView`.** `onCreateView`'s *only* job is producing and
  returning the `View`; `onViewCreated` is called immediately after,
  guaranteed the view now actually exists and is safe to call
  `findViewById` on — splitting "build the view" from "now wire it up"
  into two methods, where an Activity's `onCreate` does both in one.
- `view.findViewById(...)` — reappearing (Lesson 4), new detail: called
  on the Fragment's own `view` parameter, not directly on `this` the
  way an Activity calls it implicitly — a Fragment isn't itself a
  `View` or a `Context`, so lookups go through the view it was handed.
- `new ViewModelProvider(requireActivity())` — reappearing (Lesson 15),
  **deliberately** `requireActivity()` rather than `this` (the Fragment
  itself, which also implements `ViewModelStoreOwner` and could be
  passed instead): scoping the `ViewModelProvider` to the *Activity*
  means this `InventoryViewModel` instance would be shared with any
  *other* Fragment also hosted by the same Activity that asks for the
  same type — a deliberate choice explained fully in this unit's SE
  Lens, not the only valid option.
- `requireContext()` — reappearing (the throwaway lab, this lesson),
  now used for every `new Intent(...)` call and `getSharedPreferences(...)`
  that previously used `InventoryActivity.this` as the `Context`
  argument.
- `getViewLifecycleOwner()` — **first appearance, and a genuinely sharp
  edge worth naming directly.** A `Fragment` object and its *View* have
  **two separate lifecycles** — a Fragment can remain alive (e.g. kept
  on a back stack, not covered by this lesson's simple single-Fragment
  setup but relevant to Lesson 19's navigation) while its View is
  destroyed and later recreated. Passing `this` (the Fragment) to
  `.observe(...)` here would be a real, easy-to-miss bug source in a
  more complex Fragment setup: `getViewLifecycleOwner()` specifically
  tracks the *View's* lifecycle, which is what LiveData observation
  should actually be tied to — an update delivered after the view is
  gone but the Fragment object survives would crash or silently target
  a stale view.
- `onResume()` override — reappearing (Lesson 5/11's lifecycle
  pattern), applied to Fragment's own, related-but-distinct lifecycle
  method of the same name.

### The New Code — the Activity, Reduced to a Host

```java
public class InventoryActivity extends AppCompatActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_inventory);

        if (savedInstanceState == null) {
            getSupportFragmentManager()
                    .beginTransaction()
                    .replace(R.id.fragmentContainer, new InventoryListFragment())
                    .commit();
        }
    }
}
```

### The Updated Project

This is the entire class now — every field, method, and import that
used to live here (`viewModel`, `adapter`, `addItemLauncher`,
`onResume`) is gone, moved into `InventoryListFragment`. `onCreate`'s
only remaining job is inflating the bare container layout and, on
first creation only, placing the Fragment inside it.

### Mechanical Walkthrough

- `if (savedInstanceState == null)` — **first appearance of this
  specific guard, in this exact context**, though the underlying check
  is reappearing (Lesson 5's rescue-check shape, inverted). Necessary
  because `FragmentManager` **automatically restores** any Fragment it
  was managing across a configuration change (Lesson 5's rotation) on
  its own — if this transaction ran unconditionally on every
  `onCreate`, rotating the device would add a *second*
  `InventoryListFragment` on top of the one the `FragmentManager`
  already restored, duplicating the whole screen. Checking
  `savedInstanceState == null` means "only do this the very first time
  this Activity is ever created, not on a recreation" — directly
  reusing Lesson 5's fact that `savedInstanceState` is non-null
  specifically on a restored recreation.
- `getSupportFragmentManager().beginTransaction().replace(...).commit()`
  — reappearing, verbatim from the throwaway lab, now targeting
  `R.id.fragmentContainer` and a real, fully-built `InventoryListFragment`.

### Run It

Run the app. Visually and functionally, nothing has changed at all —
the same list, the same buttons, the same navigation to
`ItemDetailActivity`/`AddItemActivity`/`SettingsActivity`. Rotate the
emulator: confirm the list still shows without reloading from the
database (Lesson 15's fix, still intact) — and specifically confirm
you do **not** see a duplicated screen, proving the
`savedInstanceState == null` guard is doing its job.

### CS Lens

Splitting "build the view" (`onCreateView`) from "the view now exists,
wire it up" (`onViewCreated`) is the same **two-phase
construction/initialization** idea seen in narrower form with
`RecyclerView.Adapter`'s `onCreateViewHolder`/`onBindViewHolder` split
(Lesson 6) — separating "produce the object" from "the object is ready,
now populate it," which in both cases exists because the *moment* a
thing is fully safe to configure isn't always the same moment it's
constructed.

### SE Lens

**Why scope the `ViewModel` to `requireActivity()` instead of the
Fragment itself (`this`)?** Scoping to the Fragment would mean a
*different* `InventoryViewModel` instance per Fragment instance — fine
today, since only one Fragment exists in this Activity, but it would
actively work against Lesson 19's Navigation Component, where multiple
Fragments hosted by the *same* Activity (a list Fragment and, in a
tablet-sized two-pane layout, a detail Fragment shown side by side)
would each want to observe the *same* underlying inventory data rather
than maintain independent copies. Scoping to the Activity costs
nothing today and is exactly the seam a shared, multi-Fragment screen
would need later — the same kind of forward-looking, currently-free
seam Lesson 17's Repository already established for a different reason.

---

## Connect the Pieces

Full trace: `InventoryActivity.onCreate` inflates a bare `FrameLayout`
container, then — only on first creation, guarded against duplicating
what `FragmentManager` already restores automatically across rotation
— commits a transaction placing a new `InventoryListFragment` inside
it → the Fragment's `onCreateView` inflates the *exact* layout
(`fragment_inventory_list.xml`) `activity_inventory.xml` used to be →
`onViewCreated` runs immediately after, scoping an `InventoryViewModel`
to the *hosting Activity* (not the Fragment) via `requireActivity()`,
wiring the same `RecyclerView`/Adapter/`LiveData` observation chain
from Lesson 16, using `getViewLifecycleOwner()` specifically to avoid
the Fragment-vs-View lifecycle mismatch this lesson flagged directly →
every button and the Activity Result launcher work exactly as they did
when they lived on the Activity, because Fragments support the same
APIs, just reached through `requireContext()`/`requireActivity()`
instead of an implicit `this`.

## What Breaks Without This

Remove the `if (savedInstanceState == null)` guard entirely, leaving
the transaction to run unconditionally. Run the app, then rotate the
emulator: you'll see the inventory list's buttons and content
duplicated — two full copies of the screen's content stacked (or
overlapping, depending on the container's layout), since a *second*
`InventoryListFragment` was added on top of the one `FragmentManager`
already silently restored on its own. Restore the guard afterward.

## Exercises

1. Add a temporary `Log.d` inside both `InventoryListFragment.onCreateView`
   and `onViewCreated`, and a matching one inside
   `InventoryActivity.onCreate`. Rotate the emulator and read the
   order they fire in Logcat — confirm the Activity's `onCreate` still
   runs (it's still destroyed and recreated, Lesson 5's rule, unchanged)
   while the Fragment's `onCreateView`/`onViewCreated` fire too, this
   time via `FragmentManager`'s own automatic restoration rather than
   your explicit `.commit()` call.
2. Try changing `getViewLifecycleOwner()` to plain `this` in the
   `observe(...)` call and read up (documentation, not required to
   reproduce a crash here, since this project's simple single-Fragment
   setup won't actually trigger the failure) on exactly what real bug
   this specific substitution is known to cause in apps with Fragments
   that get placed on a back stack — write down, in your own words,
   why this project's current structure happens not to expose it yet.

## Definition of Done

- [ ] `InventoryListFragment` exists and contains everything
      `InventoryActivity` used to; `InventoryActivity` is reduced to a
      thin host.
- [ ] The app's visible behavior is completely unchanged from Lesson
      17, verified by actually running it.
- [ ] You removed the `savedInstanceState == null` guard on purpose,
      saw the real duplicated-screen bug on rotation, and restored it.
- [ ] You can explain, in your own words, the difference between
      `onCreateView` and `onViewCreated`, and between a Fragment's own
      lifecycle and `getViewLifecycleOwner()`.
- [ ] Commit: message explaining why (e.g. "Extract the inventory list
      screen into InventoryListFragment hosted by a thin InventoryActivity,
      preparing for Lesson 19's Navigation Component, which orchestrates
      Fragments rather than Activities").

Lesson 19 is next: `MainActivity`, `InventoryActivity`,
`ItemDetailActivity`, `AddItemActivity`, and `SettingsActivity` are
still five separate Activities stitched together with manual `Intent`
calls — the Navigation Component, a single Activity hosting every
screen as a Fragment, wired through one declarative graph instead of
scattered `startActivity` calls.
