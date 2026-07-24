# Lesson 21: Options Beyond the Screen — Menus, Toolbar, and Search

**What you will build:** A real `Toolbar` with an automatic title and
Back button, an overflow menu holding Settings, a `FloatingActionButton`
for adding items, and a live-filtering `SearchView` — replacing the
crowded two-button row Lesson 11 already flagged as temporary. The
transferable problem: every action in this app so far has needed its
own permanently-visible button, competing for the same strip of screen
space. Android's menu system exists specifically for actions that
don't need to be permanently on-screen — reachable through a
consistent, standardized place instead.

**What you need to know first:** Lesson 19 (`NavHostFragment`,
`nav_graph.xml`'s `android:label`s, `NavController`), Lesson 18
(`InventoryListFragment`, `onViewCreated`), Lesson 20 (`ListAdapter`,
`submitList`).

---

## Concept Unit: `Toolbar` — a Real, Navigation-Aware App Bar

### The Problem

Every screen so far has shown Android's plain default title bar, with
no Back button of its own (the system Back button/gesture works, but
there's no on-screen affordance) and nowhere to place menu actions.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `res/values/themes.xml` (wizard-generated, edited
  here), `activity_inventory.xml`, `InventoryActivity.java`.
- **Change type:** Configure, add.
- **Dependencies:** none new — Material Components is already a
  transitive dependency of the wizard-generated project's theme.

### The New Code

In `res/values/themes.xml`, change the parent theme to a `NoActionBar`
variant (the wizard's default theme already draws its *own* plain title
bar, which would otherwise appear twice):

```xml
<style name="Theme.PocketInventory" parent="Theme.MaterialComponents.DayNight.NoActionBar">
```

Add a `Toolbar` above the `FragmentContainerView` in
`activity_inventory.xml`:

```xml
<com.google.android.material.appbar.MaterialToolbar
    android:id="@+id/toolbar"
    android:layout_width="match_parent"
    android:layout_height="?attr/actionBarSize"
    app:layout_constraintTop_toTopOf="parent" />
```

### The Updated Project

`activity_inventory.xml`'s root changes from a bare
`FragmentContainerView` (Lesson 19) to a `ConstraintLayout` holding
both the `Toolbar` and the `FragmentContainerView`, the latter now
constrained below it instead of filling the whole screen:

```xml
<androidx.constraintlayout.widget.ConstraintLayout
    xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    android:layout_width="match_parent"
    android:layout_height="match_parent">

    <com.google.android.material.appbar.MaterialToolbar
        android:id="@+id/toolbar"
        android:layout_width="match_parent"
        android:layout_height="?attr/actionBarSize"
        app:layout_constraintTop_toTopOf="parent" />

    <androidx.fragment.app.FragmentContainerView
        android:id="@+id/navHostFragment"
        android:layout_width="match_parent"
        android:layout_height="0dp"
        android:name="androidx.navigation.fragment.NavHostFragment"
        app:defaultNavHost="true"
        app:navGraph="@navigation/nav_graph"
        app:layout_constraintTop_toBottomOf="@id/toolbar"
        app:layout_constraintBottom_toBottomOf="parent" />

</androidx.constraintlayout.widget.ConstraintLayout>
```

`InventoryActivity.java` wires the Toolbar to both the system action
bar slot and the nav graph:

```java
public class InventoryActivity extends AppCompatActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_inventory);

        MaterialToolbar toolbar = findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);

        NavHostFragment navHostFragment = (NavHostFragment)
                getSupportFragmentManager().findFragmentById(R.id.navHostFragment);
        NavController navController = navHostFragment.getNavController();
        NavigationUI.setupActionBarWithNavController(this, navController);
    }

    @Override
    public boolean onSupportNavigateUp() {
        NavHostFragment navHostFragment = (NavHostFragment)
                getSupportFragmentManager().findFragmentById(R.id.navHostFragment);
        return navHostFragment.getNavController().navigateUp() || super.onSupportNavigateUp();
    }
}
```

### Mechanical Walkthrough
- `parent="Theme.MaterialComponents.DayNight.NoActionBar"` — **first
- appearance.** `DayNight` — first appearance, worth a clause: this
  theme family automatically switches between light and dark variants
  based on the system setting, a detail Lesson 33 covers fully.
  `NoActionBar` disables the framework's own automatic title bar,
- required whenever you supply your own `Toolbar` — supplying both
  without this would produce two stacked title bars, a real, common
  mistake worth flagging.
- `<com.google.android.material.appbar.MaterialToolbar ...>` — **first
  appearance.** Same full-class-path tag pattern as `ConstraintLayout`/
- `RecyclerView` (Lesson 3/6) — a Material Design app bar widget.
- `?attr/actionBarSize` — **first appearance of theme attribute
  resolution.** The `?attr/` prefix (distinct from `@id/`/`@layout/`'s
  `@` prefix, both introduced Lesson 2/3) means "resolve this value
  from the currently active theme" rather than a hardcoded number — the
  standard app-bar height, consistent with whatever theme (including a
  future custom one, Lesson 33) is applied.
- `findViewById(R.id.toolbar)` — reappearing, Lesson 4.
- `setSupportActionBar(toolbar)` — **first appearance.** Registers this
- specific `Toolbar` as the Activity's action bar — the object
  `onCreateOptionsMenu`-style menu handling (next unit) and navigation
  title updates both target.
- `getSupportFragmentManager().findFragmentById(R.id.navHostFragment)`
- — **first appearance of `findFragmentById`.** Retrieves the
  `NavHostFragment` instance the layout XML already created (Lesson
  19's `android:name="androidx.navigation.fragment.NavHostFragment"`),
- cast — reappearing (`(NavHostFragment)`, Lesson 8) — to access its
  navigation-specific methods.
- `.getNavController()` — reappearing (Lesson 19's underlying concept),
  first direct retrieval from Java rather than via
  `Navigation.findNavController(view)`.
- `NavigationUI.setupActionBarWithNavController(this, navController)` —
  **first appearance.** A library-provided helper wiring the Toolbar's
  title to the current destination's `android:label` (Lesson 19's nav
  graph) and its Back/Up button to the nav graph's own back stack,
  automatically — no manual title-setting code needed anywhere in this
  project.
- `onSupportNavigateUp()` — **first appearance.** Called when the
  Toolbar's Up button is tapped — delegating to
  `navController.navigateUp()` (reappearing shape from Lesson 19's Back
  handling) makes the on-screen button and the system Back button
  behave identically.

### CS Lens

Wiring the Toolbar's title/back-button state to whatever the current
navigation destination happens to be, rather than each screen setting
its own title manually, is another instance of **single source of
truth** (already seen in Lesson 7's `Item` fix for parallel lists, and
Lesson 17's Repository for data access) — here, the nav graph is the
one place screen titles are declared, and the Toolbar just reflects it.

---

## Concept Unit: The Options Menu — Actions That Don't Need Their Own Button

### The Problem

`InventoryListFragment`'s Settings navigation currently lives on a
crowded button row (Lesson 11). Time to move it into the Toolbar's
overflow menu — the standard place for a secondary, infrequent action.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** New file `res/menu/menu_inventory_list.xml`;
  `InventoryListFragment.java`; `fragment_inventory_list.xml` (remove
  the two buttons this lesson replaces).
- **Change type:** Create, modify.

### The New Code — the Menu Resource

```xml
<menu xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto">

    <item
        android:id="@+id/menu_settings"
        android:title="Settings"
        app:showAsAction="never" />

</menu>
```

### The Updated Project

This is a new file, a new resource type (`res/menu/`, alongside
`res/layout/` and `res/navigation/`) — nothing to show it landing
inside yet.

### Mechanical Walkthrough

- `<menu ...>` — **first appearance.** Root element for a menu
  resource — same declarative-XML-as-data idea as every other
  resource type in this project (layouts since Lesson 3, the nav graph
  in Lesson 19).
- `<item android:id="..." android:title="..." app:showAsAction="never" />`
  — **first appearance.** One selectable menu entry;
  `app:showAsAction="never"` means always show it inside the overflow
  ("⋮") menu rather than as a permanent icon in the Toolbar itself —
  appropriate for Settings, an infrequent action, in contrast to Search
  (next unit), shown differently.

### The New Code — Handling Selection

```java
requireActivity().addMenuProvider(new MenuProvider() {
    @Override
    public void onCreateMenu(@NonNull Menu menu, @NonNull MenuInflater menuInflater) {
        menuInflater.inflate(R.menu.menu_inventory_list, menu);
    }

    @Override
    public boolean onMenuItemSelected(@NonNull MenuItem menuItem) {
        if (menuItem.getItemId() == R.id.menu_settings) {
            Navigation.findNavController(requireView()).navigate(R.id.action_list_to_settings);
            return true;
        }
        return false;
    }
}, getViewLifecycleOwner());
```

### The Updated Project

Added inside `InventoryListFragment.onViewCreated`, alongside the
existing `RecyclerView`/`LiveData` wiring from Lesson 20 — the
`settingsButton`-related lines from Lesson 11/19 are deleted entirely,
this block replacing them:

```java
@Override
public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
    super.onViewCreated(view, savedInstanceState);

    viewModel = new ViewModelProvider(requireActivity()).get(InventoryViewModel.class);

    RecyclerView recyclerView = view.findViewById(R.id.inventoryRecyclerView);
    recyclerView.setLayoutManager(new LinearLayoutManager(requireContext()));
    adapter = new InventoryAdapter(item -> {
        InventoryListFragmentDirections.ActionListToDetail action =
                InventoryListFragmentDirections.actionListToDetail(item);
        Navigation.findNavController(view).navigate(action);
    });
    recyclerView.setAdapter(adapter);

    viewModel.getItems().observe(getViewLifecycleOwner(), updatedItems -> adapter.submitList(updatedItems));
    viewModel.loadItems();

    requireActivity().addMenuProvider(new MenuProvider() {                            // ← new
        @Override                                                                      // ← new
        public void onCreateMenu(@NonNull Menu menu, @NonNull MenuInflater menuInflater) { // ← new
            menuInflater.inflate(R.menu.menu_inventory_list, menu);                    // ← new
        }                                                                               // ← new

        @Override                                                                       // ← new
        public boolean onMenuItemSelected(@NonNull MenuItem menuItem) {                // ← new
            if (menuItem.getItemId() == R.id.menu_settings) {                          // ← new
                Navigation.findNavController(requireView()).navigate(R.id.action_list_to_settings); // ← new
                return true;                                                            // ← new
            }                                                                           // ← new
            return false;                                                              // ← new
        }                                                                               // ← new
    }, getViewLifecycleOwner());                                                        // ← new
}
```

### Mechanical Walkthrough
- `requireActivity().addMenuProvider(new MenuProvider() { ... }, getViewLifecycleOwner())`
- — **first appearance.** `MenuProvider` is another single-purpose
  interface (this project's now-familiar shape — Lesson 8's
  `OnItemClickListener`, Lesson 13's `ItemDao`) with two required
  methods, registered against the Activity but scoped to *this
  Fragment's view lifecycle* (Lesson 18's `getViewLifecycleOwner()`,
  reused for exactly the reason that lesson explained: the menu
  contribution should stop existing the moment this Fragment's view is
  gone, not linger).
- `onCreateMenu(Menu menu, MenuInflater menuInflater)` — **first
  appearance.** Called once, when the menu needs building.
- `menuInflater.inflate(...)` — reappearing pattern (`LayoutInflater.inflate`,
  Lesson 6, same idea for a different resource type) — turns the XML
  menu resource into real, in-memory `MenuItem` objects.
- `onMenuItemSelected(MenuItem menuItem)` — **first appearance.**
  Called when the user taps any menu entry (from *any* Fragment's
  contributed menu — this project only has one, but the method's
  contract is general).
- `menuItem.getItemId() == R.id.menu_settings` — reappearing pattern
  (comparing a generated resource ID, same shape as Lesson 6's
  `R.id.itemNameText` usage, here for dispatch rather than lookup).
- `return true;` / `return false;` — **first appearance of this exact
  contract.** `true` means "I handled this selection, stop looking
  further"; `false` means "not mine, let something else (or the
  default system handling) respond" — the same "handled vs. not"
  boolean-return dispatch shape.

### CS Lens

A `Menu`/`MenuItem` inflated from XML and dispatched through
`getItemId()` comparisons is a **command dispatch table**, the same
family of idea as `RequestDemo`'s `if ("OPEN_SCREEN".equals(action))`
back in Lesson 4 — a fixed set of named actions, matched and routed to
their handler.

---

## Concept Unit: `FloatingActionButton` — the One Action That Stays On-Screen

### The Problem

Settings moved into the overflow menu, appropriately, since it's
infrequent. Adding an item is this screen's *primary* action — it
deserves to stay visibly, permanently reachable, not buried in a menu.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `fragment_inventory_list.xml`,
  `InventoryListFragment.java`.
- **Change type:** Replace the `addItemButton` `Button` (Lesson 9) with
  a `FloatingActionButton`.

### The New Code

```xml
<com.google.android.material.floatingactionbutton.FloatingActionButton
    android:id="@+id/addItemFab"
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:layout_margin="16dp"
    android:src="@android:drawable/ic_input_add"
    app:layout_constraintBottom_toBottomOf="parent"
    app:layout_constraintEnd_toEndOf="parent" />
```

### The Updated Project

`fragment_inventory_list.xml`'s `RecyclerView` now fills the whole
Fragment (both `settingsButton` and `addItemButton` are removed
entirely), with the `FloatingActionButton` floating in the bottom-right
corner, overlapping the list rather than reserving its own row — the
conventional Material Design placement for a screen's primary action.

### Mechanical Walkthrough
- `<com.google.android.material.floatingactionbutton.FloatingActionButton>`
  — **first appearance.** A circular, elevated button — visually
  distinct from a plain `Button` (Lesson 3), conventionally reserved
  for one clear primary action per screen.
- `android:src="@android:drawable/ic_input_add"` — reappearing pattern
  (`android:src`, briefly mentioned as an exercise in Lesson 3;
- `@android:drawable/...` — a system-provided resource reference,
  same `@type/name` syntax, `android:` prefix meaning "from the
  platform's own resources, not this app's").

```java
FloatingActionButton addFab = view.findViewById(R.id.addItemFab);
addFab.setOnClickListener(v ->
        Navigation.findNavController(view).navigate(R.id.action_list_to_addItem));
```

Reappearing pattern, from earlier this lesson and Lesson 19 — no new
concepts, deliberately, replacing the old `addItemButton`'s identical
listener with the same navigation call on the new widget.

---

## Concept Unit: `SearchView` — Filtering the List Live

### The Problem

Finding one item in a long inventory by scrolling is real friction a
growing list makes worse over time — search belongs on-screen or one
tap away, not buried.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `menu_inventory_list.xml`,
  `InventoryListFragment.java`.
- **Change type:** Add.

### The New Code

Add a second item to `menu_inventory_list.xml`, above the Settings
entry:

```xml
<item
    android:id="@+id/menu_search"
    android:title="Search"
    app:showAsAction="always|collapseActionView"
    app:actionViewClass="androidx.appcompat.widget.SearchView" />
```

### The Updated Project

```xml
<menu xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto">

    <item
        android:id="@+id/menu_search"
        android:title="Search"
        app:showAsAction="always|collapseActionView"
        app:actionViewClass="androidx.appcompat.widget.SearchView" />

    <item
        android:id="@+id/menu_settings"
        android:title="Settings"
        app:showAsAction="never" />

</menu>
```

### Mechanical Walkthrough
- `app:showAsAction="always|collapseActionView"` — **first appearance.**
  `always` (contrasted with Settings' `never`) keeps this item visible
  as an icon directly in the Toolbar, not the overflow menu — the
  correct treatment for a frequently-used action. `collapseActionView`
  — **first appearance** — means it starts as a small icon and expands
  into its full input widget only when tapped, collapsing back
  afterward, rather than permanently occupying Toolbar space.
- `app:actionViewClass="androidx.appcompat.widget.SearchView"` —
  **first appearance.** Names a real widget class to inflate *as* this
- menu item's expanded form — `SearchView` specifically provides a text
  field with built-in search-appropriate styling and behavior.

### The New Code — Reacting to Query Text

```java
requireActivity().addMenuProvider(new MenuProvider() {
    @Override
    public void onCreateMenu(@NonNull Menu menu, @NonNull MenuInflater menuInflater) {
        menuInflater.inflate(R.menu.menu_inventory_list, menu);
        MenuItem searchItem = menu.findItem(R.id.menu_search);
        SearchView searchView = (SearchView) searchItem.getActionView();
        searchView.setOnQueryTextListener(new SearchView.OnQueryTextListener() {
            @Override
            public boolean onQueryTextSubmit(String query) {
                return false;
            }

            @Override
            public boolean onQueryTextChange(String newText) {
                applyFilter(newText);
                return true;
            }
        });
    }

    @Override
    public boolean onMenuItemSelected(@NonNull MenuItem menuItem) {
        if (menuItem.getItemId() == R.id.menu_settings) {
            Navigation.findNavController(requireView()).navigate(R.id.action_list_to_settings);
            return true;
        }
        return false;
    }
}, getViewLifecycleOwner());
```

And, as a new private method on `InventoryListFragment`:

```java
private void applyFilter(String query) {
    List<Item> all = viewModel.getItems().getValue();
    if (all == null) return;
    if (query.isEmpty()) {
        adapter.submitList(all);
        return;
    }
    List<Item> filtered = new ArrayList<>();
    for (Item item : all) {
        if (item.getName().toLowerCase().contains(query.toLowerCase())) {
            filtered.add(item);
        }
    }
    adapter.submitList(filtered);
}
```

### The Updated Project

`onCreateMenu` now also locates the search item's expanded view and
registers a text-change listener; `applyFilter` is a new private
method the Fragment gains, reading the `ViewModel`'s current value
directly (rather than through the observer) and computing a filtered
subset for display — deliberately **not** mutating the `ViewModel`'s
actual data, since a search filter is a purely UI-local, temporary
view of the same underlying list.

### Mechanical Walkthrough
- `menu.findItem(R.id.menu_search)` — **first appearance.** Retrieves a
  specific inflated `MenuItem` by its ID, same generated-ID lookup
  pattern as `R.id.menu_settings` used for dispatch above.
- `searchItem.getActionView()` — **first appearance.** Returns the
  actual `SearchView` instance the `app:actionViewClass` attribute
  caused to be inflated, cast (reappearing, Lesson 8) to `SearchView`.
- `SearchView.OnQueryTextListener` — **first appearance**, structurally
  identical to every other single-or-few-method listener interface
  this project has implemented since Lesson 8, just framework-defined
  rather than hand-written this time, with two methods.
- `onQueryTextSubmit(String query)` — **first appearance.** Called when
  the user explicitly submits (presses Enter/search icon) — this
  project returns `false` (not handled specially), relying entirely on
  live filtering instead.
- `onQueryTextChange(String newText)` — **first appearance.** Called on
- every keystroke — `return true` tells `SearchView` "I've handled
  updating the UI myself," suppressing its own default suggestion
  behavior.
- `viewModel.getItems().getValue()` — reappearing (`LiveData.getValue()`,
  Lesson 16), first use from *outside* the `ViewModel`/`Repository`
  layer — a deliberate, narrow exception to Lesson 17's layering
  discipline: reading the *current* value synchronously for a
  UI-local, non-persisted filtering operation is a reasonable, common
  real-world use of `getValue()`, distinct from using it to *drive*
  business logic (which should stay inside the Repository).
- `item.getName().toLowerCase().contains(query.toLowerCase())` —
- **first appearance of `String.toLowerCase()`/`.contains()`** —
  case-insensitive substring matching, standard-library string methods.
- `adapter.submitList(filtered)` — reappearing (Lesson 20), now fed a
- computed subset instead of the full list — `DiffUtil` handles this
  exactly the same way regardless of *why* the list changed shape,
  animating the filtered-out rows away and back in correctly.

### Run It

Run the app. Tap the search icon in the Toolbar, type part of an item
name: the list filters live, animating rows out via Lesson 20's
`DiffUtil` machinery exactly as an insert or delete would. Clear the
search: the full list animates back. Tap the overflow menu, confirm
Settings still navigates correctly. Tap the FAB, confirm Add Item still
works.

### CS Lens

Filtering a full in-memory collection down to matches on every
keystroke, without touching the underlying data source, is a small
instance of a **projection/view over a data set** — the same idea as a
SQL `WHERE` clause, a spreadsheet's AutoFilter, or a UI framework's
computed/derived state — the underlying truth (here, `ViewModel`'s
`itemsLiveData`) stays intact; only what's *displayed* changes.

### SE Lens

**Why filter client-side, in the Fragment, instead of adding a
`searchItems(String query)` method to `ItemRepository`/`ItemDao`
running a real SQL `WHERE name LIKE ...` query?** For this project's
realistic inventory size (dozens to low hundreds of rows, already fully
loaded into memory via Lesson 13/15), filtering an in-memory list on
every keystroke is fast enough to feel instant, and avoids hitting the
database (and Lesson 14's threading machinery) on every single
character typed. The real cost: this approach doesn't scale to a truly
large inventory a database-side query would handle better — a genuine,
size-dependent tradeoff, not a universal right answer, flagged here
honestly rather than presented as the only correct approach.

---

## Connect the Pieces

Full trace: `InventoryActivity` wires a `Toolbar` to both the system
action bar slot and the nav graph's `NavController`, so every
destination's title (Lesson 19's `android:label`s) and Back behavior
now come from one source → `InventoryListFragment` contributes a menu
(Search, always visible and expandable; Settings, tucked in overflow)
scoped to its own view lifecycle → typing in the expanded `SearchView`
reads the `ViewModel`'s current `LiveData` value directly, computes a
filtered subset, and hands it to `adapter.submitList(...)`, letting
Lesson 20's `DiffUtil` animate the visible change correctly regardless
of whether the underlying cause was a real data change or a client-side
filter → the FAB, in the corner instead of a full-width button row,
remains the one action that never needs a menu tap to reach.

## What Breaks Without This

Temporarily remove `NoActionBar` from the theme's parent (revert to
the wizard's original `Theme.MaterialComponents.DayNight.`). Run the
app: two title bars stack visibly — the framework's automatic one and
your `Toolbar` — a real, visually obvious demonstration of why that
theme flag is required the moment you supply your own app bar. Restore
`NoActionBar` afterward.

## Exercises

1. Add a `LinearLayoutCompat.HORIZONTAL`-oriented row of two sort
   buttons ("Name," "Qty") above the `RecyclerView`, each calling
   `Collections.sort(currentList, Comparator.comparing(Item::getName))`
   (or `Comparator.comparingInt(Item::getQuantity)`) on a copy of the
   current filtered/unfiltered list before `submitList`-ing it — your
   first use of `Comparator` and a **method reference**
   (`Item::getName`, a shorthand alternative to a full lambda for
   "call this existing method") in this project.
2. Confirm the search filter and the low-stock red highlight (Lesson
   11/20) work correctly together — search for a low-stock item's name
   and confirm it's still shown in red, proving the two features,
   built in entirely separate lessons, compose correctly without
   interfering.

## Definition of Done

- [ ] The app shows a real `Toolbar` with a title that updates per
      screen and a working Back/Up button.
- [ ] Settings is reachable through the overflow menu; Add Item is a
      `FloatingActionButton`; neither is a full-width bottom button
      anymore.
- [ ] Typing in the search field filters the list live, with correct
      `DiffUtil` animations, and clearing it restores the full list.
- [ ] You reproduced the double-title-bar bug on purpose and understood
      why `NoActionBar` fixes it.
- [ ] Commit: message explaining why (e.g. "Replace the ad hoc button
      row with a real Toolbar, overflow menu, FAB, and live search,
      moving infrequent actions out of permanent screen space").

Lesson 22 is next: deleting an item (not yet possible anywhere in this
app) needs a confirmation step first — `AlertDialog`, and why a
destructive action should never be one accidental tap away.
