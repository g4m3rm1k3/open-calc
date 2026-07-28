# Lesson 18: Breaking the Screen Apart — Fragments and the FragmentManager

**What you will build:** The inventory list's entire UI — the
`RecyclerView`, the Add-item form, the Settings button, swipe-to-delete —
moves out of `InventoryActivity` and into a new, embeddable
`InventoryListFragment`. `InventoryActivity` itself shrinks down to a
thin container whose only job is hosting it. The transferable problem:
every screen in this project so far has been a whole Activity, each
needing its own Manifest entry and reachable only through a full-screen
`Intent` (Lesson 4). That's a real limit — a piece of UI built this way
can never be embedded *inside* another screen, shown alongside
something else, or reused in more than one place, because it can only
ever exist as an entire, standalone Activity. `Fragment` is Android's
answer: a reusable, embeddable chunk of UI with its own lifecycle,
hosted *inside* an Activity's view tree instead of replacing the whole
screen.

**What you need to know first:** Lesson 5 (the Activity lifecycle — a
Fragment has a related but genuinely distinct one). Lesson 15/16/17
(`InventoryViewModel`, `InventoryRepository`, `LiveData` — all reused
completely unchanged by the Fragment built here; this lesson moves
*view* code, not data code). Lesson 6 (`RecyclerView`,
`InventoryAdapter` — relocated, not rewritten). Lesson 9 (the Add-item
form and its validation — relocated too). Lesson 11 (`ItemTouchHelper`
swipe-to-delete — relocated too).

**Terms introduced in this lesson:**
- **`Fragment`** — a reusable, embeddable piece of UI with its own
  lifecycle, hosted inside an Activity's view tree rather than
  occupying an entire screen on its own.
- **`onCreateView(inflater, container, savedInstanceState)`** — the
  Fragment method responsible for building and returning the `View` it
  wants shown; the Fragment counterpart to an Activity calling
  `setContentView(...)` as a side effect.
- **`onViewCreated(view, savedInstanceState)`** — called immediately
  after `onCreateView` returns, guaranteed the returned `View` now
  genuinely exists — the correct place to find child views and wire
  listeners, as opposed to building the view itself.
- **`requireContext()` / `requireActivity()`** — a Fragment is not
  itself a `Context` or an `Activity` the way an Activity implicitly is
  both; these retrieve the hosting Activity (as a `Context`, or as the
  `Activity` itself), throwing immediately if called before the
  Fragment is actually attached to one.
- **`FragmentManager`** — the object, obtained from an Activity via
  `getSupportFragmentManager()`, responsible for adding, replacing, and
  removing Fragments hosted inside it.
- **`FragmentTransaction`** — a batched, staged set of Fragment changes
  (add, replace, remove), built with `.beginTransaction()` and only
  taking effect once `.commit()` is called.
- **Fragment lifecycle vs. View lifecycle** — a `Fragment` object and
  the `View` it returns from `onCreateView` have two genuinely separate
  lifecycles; a Fragment can remain alive with its view destroyed and
  later rebuilt, which is why `LiveData` observation inside a Fragment
  uses `getViewLifecycleOwner()`, not the Fragment itself.
- **`getViewLifecycleOwner()`** — returns a `LifecycleOwner` tracking
  specifically the current View's lifecycle, not the Fragment object's
  own, longer lifecycle.
- **`FrameLayout`** — the simplest layout container Android provides:
  no arrangement logic of any kind, appropriate for a container whose
  only job is being replaceable, not arranging multiple children.
- **`@LayoutRes`** — an annotation asserting an `int` parameter must
  specifically be a layout resource ID, not just any `int`; checked by
  Android Studio's static analysis, not the compiler.
- **`@MainThread`** — an annotation asserting a method must only ever
  be called from the main thread; checked by Android Studio's static
  analysis, not enforced automatically by the framework at runtime the
  way `CalledFromWrongThreadException` is for view mutation.

---

## Concept Unit: `Fragment` — a Screen's Worth of UI, Embeddable Instead of Standalone

### The Problem

See the core mechanism — a `Fragment` hosted inside an existing
Activity's layout, occupying only part of the screen — before touching
the real, business-logic-heavy inventory screen.

### The Contract You're Extending

`extends Fragment` means fitting into a shape Android itself already
declared — worth reading that real shape first, rather than inferring
it from how a subclass happens to use it. From
`androidx.fragment.app.Fragment` itself, not this project's code
(verified against the real class source this session):

```java
public class Fragment implements LifecycleOwner, ViewModelStoreOwner {
    // Six more interfaces genuinely exist on the real class
    // (ComponentCallbacks, OnCreateContextMenuListener,
    // HasDefaultViewModelProviderFactory, SavedStateRegistryOwner,
    // ActivityResultCaller, ContextAware) — omitted here, disclosed
    // rather than silently dropped, because none of the six is used by
    // anything in this lesson.

    public Fragment() {
        initLifecycle();
    }

    public Fragment(@LayoutRes int contentLayoutId) {
        this();
        mContentLayoutId = contentLayoutId;
    }

    @MainThread
    @Nullable
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container,
                              @Nullable Bundle savedInstanceState) {
        if (mContentLayoutId != 0) {
            return inflater.inflate(mContentLayoutId, container, false);
        }
        return null;
    }

    @MainThread
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) { }
}
```

Reading this the same way this course reads every other block of code —
every element, not just the overall shape:

- `implements LifecycleOwner, ViewModelStoreOwner` — the real class
  implements eight interfaces total; the other six are named and
  disclosed, not shown, in the comment above, since nothing in this
  lesson uses them. These two specifically are worth keeping visible:
  `LifecycleOwner` is the same interface `AppCompatActivity` itself
  implements (Lesson 15) — this is the real, checkable reason a
  `Fragment` can be passed anywhere a `LifecycleOwner` is expected, the
  same as an Activity, and why `getViewLifecycleOwner()` (below) exists
  at all: `Fragment` has *two* lifecycle-owning things, itself and its
  view. `ViewModelStoreOwner` — also already implemented by
  `AppCompatActivity` (Lesson 15) — is the real, checkable reason
  `new ViewModelProvider(this)`, inside a Fragment, would have compiled
  and run: the Fragment *itself* satisfies `ViewModelStoreOwner` just as
  much as its hosting Activity does. This project's own code, next,
  deliberately reaches past that option for `requireActivity()` instead
  — the SE Lens below explains why, now that both real options are
  visible here rather than only asserted in prose.
- `public Fragment() { initLifecycle(); }` — `initLifecycle()` is a
  `private` method, not part of the public contract at all, quoted only
  so its *existence* isn't a mystery. Its real body (verified this
  session): it builds the private internal objects that make
  `LifecycleOwner` and a couple of the six omitted interfaces actually
  work — a `LifecycleRegistry`, a `SavedStateRegistryController`, two
  internal listener registrations. None of those types are this
  lesson's subject, and the method's own real Javadoc states plainly
  *"Applications should generally not implement a constructor. Prefer
  `onAttach(Context)` instead"* — the framework itself is telling you
  this constructor, and everything inside it, isn't meant to be read or
  reasoned about by application code, which is exactly why this lesson
  doesn't attempt to explain `initLifecycle()`'s own internals any
  further than naming what category of thing it does.
- `public Fragment(@LayoutRes int contentLayoutId) { this(); mContentLayoutId = contentLayoutId; }`
  — a second, real constructor, not a hypothetical: `this()` —
  reappearing, the exact constructor-chaining shape `Item`'s own second
  constructor used (Lesson 13) — calls the no-arg constructor above
  first, then stores the given layout ID into a field the base class
  itself declares, `mContentLayoutId`, read by `onCreateView`'s own
  default body immediately below. `@LayoutRes` — **first appearance.**
  An annotation (same category as `@NonNull`, Lesson 6) asserting this
  `int` parameter must specifically be a layout resource ID — the same
  kind of value `R.layout.activity_main` (Lesson 2e) generates — not
  just any `int`; checked by Android Studio's static analysis, not the
  compiler itself. This project's own `InventoryListFragment`, built
  next, uses the plain no-arg constructor and overrides `onCreateView`
  explicitly instead of calling `super(R.layout.fragment_inventory_list)`
  here — consistent with this course favoring explicit code over
  implicit shortcuts since Lesson 1, not because this constructor
  wouldn't also work.
- `@MainThread` — **first appearance.** An annotation asserting a
  method must only ever be called from the main thread (Lesson 14's own
  vocabulary) — checked by Android Studio's static analysis, the same
  enforcement category as `@NonNull`, not a runtime guarantee the
  framework enforces for you the way `CalledFromWrongThreadException`
  (Lesson 14) does for view mutation.
- `onCreateView`'s body — `if (mContentLayoutId != 0)` reads the exact
  field the `@LayoutRes` constructor above stores into: if a subclass
  used that constructor, this default implementation inflates the given
  layout automatically and returns it; otherwise it `return`s `null` —
  which is why `Fragment` isn't `abstract` despite having real work to
  do: a `Fragment` built with the plain no-arg constructor and no
  override genuinely compiles, runs, and shows nothing, rather than
  failing to compile the way leaving an `abstract` method unfilled
  would.
- `onViewCreated`'s body — completely empty (`{ }`). Overriding it is
  optional, the same "provides a body, doesn't require overriding"
  shape `ViewModel.onCleared()` (Lesson 15) already established — not
  the fully `abstract`, must-override shape `RecyclerView.Adapter`'s
  three methods used (Lesson 6).

Two real facts this makes checkable instead of assumed, stated plainly:
`Fragment` is **not** `abstract` — unlike every other framework base
class this project has extended (`RecyclerView.Adapter`,
`RecyclerView.ViewHolder`, `SQLiteOpenHelper`, `ViewModel` all were) —
and it implements `ViewModelStoreOwner` itself, the exact fact this
unit's own SE Lens depends on.

### Introduce the Concept in Isolation

`Fragment`, like `ViewModel` and `LiveData` before it, needs a real
Android runtime to mean anything at all — there is no plain
`javac`/`java` way to isolate it. The proof runs directly inside the
project instead, temporarily, the same way Lesson 15 and 16 both
proved their own Android-only mechanisms.

Temporarily add a container to `activity_inventory.xml`, above the
existing `RecyclerView`:

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

Temporarily add this to `InventoryActivity.onCreate`, right after
`setContentView`:

```java
getSupportFragmentManager()
        .beginTransaction()
        .replace(R.id.scratchContainer, new ScratchFragment())
        .commit();
```

Run the app. **"Hello from a Fragment"** appears at the top of the
inventory screen, laid out inside `scratchContainer`, with the real
`RecyclerView`-backed list still visible beneath it — reproduce this
yourself, on your own emulator. This is the one thing an Activity can
never do: `InventoryActivity` is still one single Activity the whole
time, but part of its screen is now occupied by a second, independently
defined piece of UI.

### Discard the Throwaway Example

Delete `ScratchFragment.java`, the temporary transaction block from
`onCreate`, and the `scratchContainer` `FrameLayout` from
`activity_inventory.xml` — none of it appears in the project again. The
real `InventoryListFragment`, built next, replaces the Activity's
*entire* content, not a small corner of it.

### Mechanical Walkthrough

- `extends Fragment` — **first appearance.** Same "must extend the
  framework's class" pattern `AppCompatActivity` (Lesson 2) already
  established, a different base class carrying a related but distinct
  lifecycle, per the Contract block above.
- `onCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState)`
  — **first appearance.** The Fragment counterpart to `Activity.onCreate`
  plus `setContentView` combined: instead of calling `setContentView(...)`
  as a side effect the way every Activity in this project has,
  a Fragment **returns** the `View` it wants shown, directly, as this
  method's own result. `container` is the `ViewGroup` this Fragment's
  view will eventually live inside (here, `scratchContainer`) — handed
  in so a real implementation can correctly size and lay out what it
  returns, the same reason `LayoutInflater.inflate`'s own `parent`
  argument mattered back in Lesson 6.
- `new TextView(requireContext())` — **first appearance of
  `requireContext()`.** A Fragment does not have its own `Context` the
  way an Activity *is* one (recall Lesson 8's `InventoryActivity.this`
  used directly as a `Context` argument) — `requireContext()` retrieves
  the *hosting* Activity's `Context` instead, throwing an
  `IllegalStateException` immediately if called before this Fragment is
  actually attached to an Activity, which is safer than silently
  returning `null` and crashing somewhere unrelated later.
- `getSupportFragmentManager()` — **first appearance.** Every
  `AppCompatActivity` provides one — the object responsible for adding,
  replacing, and removing the Fragments hosted inside that specific
  Activity.
- `.beginTransaction()` — **first appearance.** Fragment changes are
  batched into an explicit **transaction** object — several additions,
  removals, or replacements can be staged together as one atomic unit
  before being finalized, rather than each change taking effect the
  instant it's requested.
- `.replace(R.id.scratchContainer, new ScratchFragment())` — **first
  appearance.** Names the container view (the same `@+id/`-declared-view
  addressing scheme every layout in this project has used since Lesson
  3) and the Fragment instance to place inside it — `replace`
  specifically removes whatever Fragment currently occupies that
  container first, if any, then adds the new one.
- `.commit()` — **first appearance.** Finalizes and actually executes
  the staged transaction — nothing in the three lines above it takes
  effect on screen until this runs, the same "stage changes, then
  commit them together" shape `SharedPreferences.Editor` (Lesson 10)
  already used.

### CS Lens

A Fragment hosted inside a container view, managed by a
`FragmentManager`, is a form of **UI composition** — building a screen
out of independently-defined, swappable pieces rather than one
monolithic definition. Also recognized in: web component/widget systems
embedding a reusable component inside a page, a windowing system's
panes and panels within one application window, and the general
software idea of composing small, focused units instead of growing one
large one indefinitely — directly connected to this project's own
`Adapter` (Lesson 6), which already separated "what data" from "how
arranged" for list rows; this is the same instinct applied to whole
chunks of screen instead.

### SE Lens

**Why route this through a `FragmentManager`/transaction ceremony
instead of just constructing a `View` and calling `container.addView(it)`
directly, the way the throwaway `addView()` loop back in Lesson 6a
did?** Because a plain `addView` call has no memory of *what* was added
or *why* — `FragmentManager` specifically tracks which Fragment
currently occupies which container, which is what makes `.replace(...)`
possible at all (swap out whatever's there first, safely, without the
caller needing to track and remove the old view by hand) and, more
importantly, is what lets `FragmentManager` automatically save and
restore which Fragments existed across a configuration change (Lesson
5's rotation) — a plain `View` built and added by hand has no such
memory and would simply vanish on rotation, exactly the way the
`addView()` loop's rows never survived anything.

---

## Concept Unit: Migrating the Real Inventory Screen Into a Fragment

### The Problem

Time to apply this for real: `InventoryActivity`'s entire current
content — the `RecyclerView`, the Add-item form and its validation, the
Settings button, and swipe-to-delete — moves into a genuine
`InventoryListFragment`.

### Project Change

- **Reference Source:** No reference counterpart — `track/`'s own
  Lesson 18 does this same migration, but against its own architecture
  (a separate `AddItemActivity` reached through the Activity Result
  API, and an Adapter with a `setItems(...)` full-replace method); this
  course never built either of those (Lesson 9's Add form lives inline
  on the same screen; this project's `Adapter` uses the granular
  `addItem`/`removeItem`/`notifyItemInserted`/`notifyItemRemoved` shape
  from Lessons 9 and 11 instead), so this lesson moves *this* project's
  actual code, unchanged in behavior, not `track/`'s.
- **Files affected:** Rename `activity_inventory.xml`'s current
  contents into a new file, `fragment_inventory_list.xml`; replace
  `activity_inventory.xml` with a bare container; new file
  `InventoryListFragment.java`; `InventoryActivity.java` (shrinks
  drastically).
- **Change type:** Create, replace, modify.
- **Dependencies:** `InventoryViewModel` (Lesson 15/17),
  `InventoryAdapter` (Lesson 6/9/11), `ItemTouchHelper` (Lesson 11),
  `SettingsActivity` (Lesson 10), `ItemDetailActivity` (Lesson 8) — all
  unchanged; this lesson converts one screen's *hosting*, not the whole
  app.

### The New Code — the Fragment's Layout

Copy `activity_inventory.xml`'s current contents (the `addItemForm`
`LinearLayout` with its three `EditText` fields, `addItemButton`, and
`settingsButton`, plus the `RecyclerView` — everything as it stood at
the end of Lesson 17) verbatim into a new file,
`fragment_inventory_list.xml` — no changes to the XML itself, only the
filename.

Replace `activity_inventory.xml`'s entire contents with:

```xml
<FrameLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:id="@+id/fragmentContainer"
    android:layout_width="match_parent"
    android:layout_height="match_parent" />
```

### The Updated Project

`activity_inventory.xml` is now a single, empty `FrameLayout` — a bare
container with no content of its own, existing purely to have a real
`View` in the hierarchy for a Fragment's UI to be placed inside, the
same role `scratchContainer` played in the throwaway lab, just filling
the whole screen instead of a strip at the top.

### Mechanical Walkthrough

- `<FrameLayout ...>` as a layout's own root element — **reappearing**
  (seen briefly as `scratchContainer`'s type in this lesson's own lab).
  The simplest container Android provides — no arrangement logic at all
  (contrast `ConstraintLayout`'s relationship-solving, Lesson 3, or
  `LinearLayout`'s stacking, Lesson 6a/9) — appropriate here since this
  container's only job is being *replaceable*, not arranging multiple
  children of its own.

### The New Code — the Fragment Itself

Create `InventoryListFragment.java`:

```java
package com.yourname.pocketinventory;

import android.content.Intent;
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
import androidx.lifecycle.ViewModelProvider;
import androidx.recyclerview.widget.ItemTouchHelper;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

public class InventoryListFragment extends Fragment {
    private InventoryViewModel viewModel;
    private InventoryAdapter adapter;

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
        adapter = new InventoryAdapter(viewModel.getItems().getValue(), item -> {
            Intent intent = new Intent(requireContext(), ItemDetailActivity.class);
            intent.putExtra("EXTRA_ITEM", item);
            startActivity(intent);
        });
        recyclerView.setAdapter(adapter);

        viewModel.getItems().observe(getViewLifecycleOwner(), itemList -> adapter.notifyDataSetChanged());
        viewModel.loadItemsIfNeeded();

        ItemTouchHelper itemTouchHelper = new ItemTouchHelper(new ItemTouchHelper.SimpleCallback(
                0, ItemTouchHelper.LEFT | ItemTouchHelper.RIGHT) {
            @Override
            public boolean onMove(@NonNull RecyclerView recyclerView,
                                   @NonNull RecyclerView.ViewHolder viewHolder,
                                   @NonNull RecyclerView.ViewHolder target) {
                return false;
            }

            @Override
            public void onSwiped(@NonNull RecyclerView.ViewHolder viewHolder, int direction) {
                int position = viewHolder.getAdapterPosition();
                Item removedItem = adapter.getItemAt(position);
                adapter.removeItem(position);
                viewModel.deleteItem(removedItem);
            }
        });
        itemTouchHelper.attachToRecyclerView(recyclerView);

        EditText nameInput = view.findViewById(R.id.nameInput);
        EditText quantityInput = view.findViewById(R.id.quantityInput);
        EditText locationInput = view.findViewById(R.id.locationInput);
        Button addItemButton = view.findViewById(R.id.addItemButton);

        addItemButton.setOnClickListener(v -> {
            String name = nameInput.getText().toString().trim();
            String quantityText = quantityInput.getText().toString().trim();
            String location = locationInput.getText().toString().trim();

            if (name.isEmpty() || location.isEmpty()) {
                return;
            }

            int quantity;
            try {
                quantity = Integer.parseInt(quantityText);
            } catch (NumberFormatException e) {
                return;
            }

            Item newItem = new Item(name, quantity, location);
            adapter.addItem(newItem);
            viewModel.addItem(newItem);

            nameInput.setText("");
            quantityInput.setText("");
            locationInput.setText("");
        });

        Button settingsButton = view.findViewById(R.id.settingsButton);
        settingsButton.setOnClickListener(v ->
                startActivity(new Intent(requireContext(), SettingsActivity.class)));
    }

    @Override
    public void onResume() {
        super.onResume();
        SharedPreferences prefs =
                requireContext().getSharedPreferences("pocket_inventory_prefs", android.content.Context.MODE_PRIVATE);
        int threshold = prefs.getInt("low_stock_threshold", 5);
        adapter.setLowStockThreshold(threshold);
    }
}
```

### The Updated Project

This is the whole new file. Every field, the `RecyclerView` setup, the
`observe` call, `ItemTouchHelper`, both button listeners, and the
`onResume` threshold logic are **reappearing** — moved verbatim from
`InventoryActivity` as it stood at the end of Lesson 17. The class as a
whole now does everything `InventoryActivity` used to do, hosted as a
Fragment instead of an Activity.

### Mechanical Walkthrough

- `onCreateView` returning `inflater.inflate(R.layout.fragment_inventory_list, container, false)`
  — reappearing (`LayoutInflater.inflate`, Lesson 6's `onCreateViewHolder`),
  same three-argument shape and same `false` meaning ("don't attach yet"),
  applied here to inflate an entire screen's worth of layout instead of
  one row.
- `onViewCreated(View view, Bundle savedInstanceState)` — **first
  appearance, and worth explaining why it's a separate method from
  `onCreateView`.** `onCreateView`'s only job is producing and returning
  the `View`; `onViewCreated` runs immediately after, guaranteed the
  view genuinely exists now and is safe to call `findViewById` on —
  splitting "build the view" from "the view now exists, wire it up"
  into two methods, where an Activity's single `onCreate` does both at
  once.
- `view.findViewById(...)` — reappearing (Lesson 4), new detail: called
  on the Fragment's own `view` parameter, not implicitly on `this` the
  way an Activity calls it — a Fragment isn't itself a `View`, so every
  lookup goes through the view it was just handed.
- `new ViewModelProvider(requireActivity())` — reappearing (Lesson 15),
  **deliberately** `requireActivity()` rather than `this` (the Fragment
  itself also satisfies `ViewModelStoreOwner` and could be passed
  instead) — explained fully in this unit's SE Lens below.
- `requireContext()` — reappearing (this lesson's own lab), now used for
  every `new Intent(...)` call and `getSharedPreferences(...)` that
  previously used `InventoryActivity.this` (or an implicit `this`) as
  the `Context` argument.
- `getViewLifecycleOwner()` — **first appearance, and a genuinely sharp
  edge worth naming directly.** A `Fragment` object and its *View* have
  two separate lifecycles — a Fragment can, in a more complex setup than
  this project's single-Fragment screen, remain alive (kept on a back
  stack) while its View is destroyed and later recreated. Passing `this`
  (the Fragment) to `.observe(...)` instead would tie the observation to
  the *longer-lived* Fragment object rather than the View actually on
  screen right now — in a setup where that gap exists,
  `notifyDataSetChanged()` could run against an `adapter` whose
  `RecyclerView` no longer exists, crashing or silently doing nothing.
  `getViewLifecycleOwner()` specifically tracks the *View's* lifecycle,
  which is what `LiveData` observation inside a Fragment should always
  be tied to.
- `ItemTouchHelper`, its `SimpleCallback`, `onMove`/`onSwiped` — all
  **reappearing**, verbatim from Lesson 11, unchanged in every detail
  except which method (`onViewCreated` instead of `onCreate`) they now
  live inside and which `Context` (`requireContext()` instead of an
  implicit `this`) they read `RecyclerView`/`Item`-related values
  through.
- The three `EditText` lookups, `addItemButton`'s validation and
  `try`/`catch` around `Integer.parseInt` — all **reappearing**,
  verbatim from Lesson 9, unchanged in every detail except `view.findViewById`
  replacing a bare `findViewById`.
- `onResume()` override — reappearing (Lesson 5's lifecycle pattern,
  Lesson 10's real use of it), applied here to Fragment's own,
  related-but-distinct lifecycle method of the same name — a Fragment
  genuinely has its own `onResume`, called by the same underlying
  logic that calls its hosting Activity's `onResume`, just one step
  later in the chain.

### The New Code — the Activity, Reduced to a Host

Replace `InventoryActivity.java`'s entire contents:

```java
package com.yourname.pocketinventory;

import android.os.Bundle;
import androidx.appcompat.app.AppCompatActivity;

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
used to live here (`adapter`, `viewModel`, the `ItemTouchHelper` block,
the `EditText`/button wiring, `onResume`) is gone, moved into
`InventoryListFragment`. `onCreate`'s only remaining job is inflating
the bare container layout and, on first creation only, placing the
Fragment inside it.

### Mechanical Walkthrough

- `if (savedInstanceState == null)` — **first appearance of this
  specific guard, in this exact context**, though the underlying check
  is reappearing (Lesson 5's own rescue-check shape, inverted: there,
  `!= null` meant "recreating, restore something"; here, `== null` means
  "genuinely first launch, do the one-time setup"). Necessary because
  `FragmentManager` **automatically restores** any Fragment it was
  managing across a configuration change (Lesson 5's rotation) entirely
  on its own — if this transaction ran unconditionally on every
  `onCreate`, rotating the device would add a *second*
  `InventoryListFragment` on top of the one `FragmentManager` already
  silently restored, duplicating the whole screen.
- `getSupportFragmentManager().beginTransaction().replace(...).commit()`
  — reappearing, verbatim from this lesson's own throwaway lab, now
  targeting the real `R.id.fragmentContainer` and a real, fully-built
  `InventoryListFragment`.

### Run It

Run the app. Visually and functionally, reproduce this yourself on your
own emulator: nothing has changed at all from Lesson 17 — the same
list, the same Add-item form, the same swipe-to-delete, the same
navigation to `ItemDetailActivity`/`SettingsActivity`. Rotate the
emulator: confirm the list still shows without reloading from the
database (Lesson 15's fix, still intact, since `InventoryViewModel`
itself was never touched) — and specifically confirm you do **not** see
a duplicated screen, proving the `savedInstanceState == null` guard is
doing its job.

### CS Lens

Splitting "build the view" (`onCreateView`) from "the view now exists,
wire it up" (`onViewCreated`) is the same **two-phase
construction/initialization** idea already seen in narrower form with
`RecyclerView.Adapter`'s own `onCreateViewHolder`/`onBindViewHolder`
split (Lesson 6) — separating "produce the object" from "the object is
ready, now populate it," which in both cases exists because the moment
a thing is fully safe to configure isn't always the same moment it was
constructed.

### SE Lens

**Why scope the `ViewModel` to `requireActivity()` instead of the
Fragment itself (`this`)?** Scoping to the Fragment would mean a
*different* `InventoryViewModel` instance per Fragment instance — no
visible difference today, since this Activity hosts exactly one
Fragment, but it actively closes off a real future option: if this
project ever added a second Fragment to the same Activity that also
needed the item list (a detail pane shown side-by-side on a
tablet-sized screen, say), scoping to `requireActivity()` means both
Fragments would share the *same* `InventoryViewModel` instance and its
already-loaded data automatically; scoping to the Fragment would mean
each one loads and holds its own independent copy. Scoping to the
Activity costs nothing today and is exactly the kind of currently-free
seam this project's own `InventoryRepository` (Lesson 17) already
established for a different, similarly forward-looking reason.

---

## Connect the Pieces

Full trace: `InventoryActivity.onCreate` inflates a bare `FrameLayout`
container, then — only on genuine first creation, guarded against
duplicating what `FragmentManager` already restores automatically
across rotation — commits a transaction placing a new
`InventoryListFragment` inside it. The Fragment's `onCreateView`
inflates the *exact* layout `activity_inventory.xml` used to define
directly, now renamed `fragment_inventory_list.xml`. `onViewCreated`
runs immediately after, scoping an `InventoryViewModel` to the
*hosting Activity* (not the Fragment) via `requireActivity()`, wiring
the same `RecyclerView`/Adapter/`LiveData` observation chain from
Lesson 16 — using `getViewLifecycleOwner()` specifically to avoid the
Fragment-vs-View lifecycle mismatch this lesson named directly — then
wiring `ItemTouchHelper` (Lesson 11) and the Add-item form (Lesson 9)
exactly as before. Every one of those pieces works identically to how
it worked on the Activity, because Fragments support the same APIs,
just reached through `requireContext()`/`requireActivity()` instead of
an implicit `this`.

## What Breaks Without This

Remove the `if (savedInstanceState == null)` guard entirely, leaving
the transaction to run unconditionally on every `onCreate`. Run the
app, then rotate the emulator: you'll see the inventory screen's
content duplicated — two full copies of the list and form stacked or
overlapping, since a *second* `InventoryListFragment` was added on top
of the one `FragmentManager` had already silently restored on its own.
Restore the guard afterward.

## Exercises

1. Add a temporary `Log.d` inside both `InventoryListFragment.onCreateView`
   and `onViewCreated`, and a matching one inside
   `InventoryActivity.onCreate`. Rotate the emulator and read the order
   they fire in Logcat — confirm the Activity's `onCreate` still runs
   (it's still destroyed and recreated, Lesson 5's rule, unchanged)
   while the Fragment's `onCreateView`/`onViewCreated` fire too, this
   time through `FragmentManager`'s own automatic restoration rather
   than your explicit `.commit()` call.
2. Temporarily change `getViewLifecycleOwner()` to plain `this` in the
   `observe(...)` call inside `onViewCreated`. Nothing will visibly
   break in this project's simple, single-Fragment setup — write down,
   in your own words, exactly what would have to be different about
   this project (a Fragment placed on a back stack, its view destroyed
   while the Fragment object itself survives) for that substitution to
   actually cause a crash or a stale update. Restore it afterward.

## Definition of Done

- [ ] You ran the `ScratchFragment` lab yourself and saw a Fragment's
      UI occupy part of a screen alongside existing content.
- [ ] `InventoryListFragment` exists and contains everything
      `InventoryActivity` used to; `InventoryActivity` is reduced to a
      thin host.
- [ ] The app's visible behavior is completely unchanged from Lesson
      17 — list, Add form, swipe-to-delete, Settings, item detail — all
      verified by actually running it, not just reading the diff.
- [ ] You removed the `savedInstanceState == null` guard on purpose,
      saw the real duplicated-screen bug on rotation, and restored it.
- [ ] You can explain, in your own words, the difference between
      `onCreateView` and `onViewCreated`, and between a Fragment's own
      lifecycle and what `getViewLifecycleOwner()` specifically tracks.
- [ ] Commit: message explaining why (e.g. "Extract the inventory
      list screen into InventoryListFragment hosted by a thin
      InventoryActivity, so this screen's UI can eventually be embedded
      or reused rather than only ever existing as a whole Activity").

Lesson 19 is next: `MainActivity`, `InventoryActivity`,
`ItemDetailActivity`, and `SettingsActivity` are still four separate
Activities stitched together with manual `Intent` calls — the
Navigation Component, a single Activity hosting every screen as a
Fragment, wired through one declarative graph instead of scattered
`startActivity` calls.
