# Lesson 6e: `Adapter` — Bridging a List of Data to a Finite Number of Rows

**What you will build:** The real `InventoryAdapter` class, and the
inventory screen finally showing a real, scrolling list of five items
through `RecyclerView` — the payoff of the whole 6a–6e sequence.

**What you need to know first:** Lesson 6a (row layout, screen layout,
the `RecyclerView` widget), Lesson 6b (`static` nested classes), Lesson
6c (the `InventoryViewHolder` fragment — this lesson is where it
finally becomes a real, saved file), Lesson 6d (generics, `List<String>`).

**Terms introduced in this lesson:**
- **`final` (on a field)** — restricts a field's reference to being
  assigned exactly once, never reassigned afterward.
- **`@NonNull`** — an annotation asserting a parameter or return value
  must never be `null`; checked by Android Studio's static analysis,
  not by the compiler itself.
- **`onCreateViewHolder`** — the Adapter method `RecyclerView` calls
  only when it needs to build a brand-new row holder, not once per data
  item.
- **`LayoutInflater`** — the class responsible for turning an XML
  layout resource into real `View` objects at runtime.
- **`onBindViewHolder`** — the Adapter method `RecyclerView` calls
  every time a holder, new or recycled, needs to display a different
  data item.
- **`List.get(index)`** — standard-library method; index-based lookup
  into a `List`.
- **`getItemCount()`** — the Adapter method `RecyclerView` calls to
  learn the total number of rows to display.
- **`ArrayList`** — a concrete, resizable implementation of the `List`
  interface.
- **`LinearLayoutManager`** — a `RecyclerView` `LayoutManager`
  implementation that arranges rows in a single scrolling list.

---

## Concept Unit: `Adapter` — Bridging a List of Data to a Finite Number of Rows

### The Problem

You now have a row layout and a way to cache a row's view references.
Nothing yet connects your actual data (a list of item
names) to those rows, and nothing tells `RecyclerView` how many rows
exist or how to arrange them (vertically, horizontally, in a grid). Two
separate jobs, handled by two separate collaborators: the `Adapter`
(data → views) and the `LayoutManager` (arrangement).

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** New file `InventoryAdapter.java` (contains the
  previewed `ViewHolder` fragment as a nested class); `InventoryActivity.java`
  (wire it up).
- **Change type:** Create, then add.
- **Dependencies:** The `ViewHolder` shape already previewed, and
  generics.

### The New Code

Create `app/src/main/java/.../InventoryAdapter.java`:

```java
package com.yourname.pocketinventory;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import java.util.List;

public class InventoryAdapter extends RecyclerView.Adapter<InventoryAdapter.InventoryViewHolder> {
    private final List<String> itemNames;

    InventoryAdapter(List<String> itemNames) {
        this.itemNames = itemNames;
    }

    @NonNull
    @Override
    public InventoryViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View itemView = LayoutInflater.from(parent.getContext())
                .inflate(R.layout.list_item_inventory, parent, false);
        return new InventoryViewHolder(itemView);
    }

    @Override
    public void onBindViewHolder(@NonNull InventoryViewHolder holder, int position) {
        String name = itemNames.get(position);
        holder.itemNameText.setText(name);
    }

    @Override
    public int getItemCount() {
        return itemNames.size();
    }

    static class InventoryViewHolder extends RecyclerView.ViewHolder {
        TextView itemNameText;

        InventoryViewHolder(View itemView) {
            super(itemView);
            itemNameText = itemView.findViewById(R.id.itemNameText);
        }
    }
}
```

### The Updated Project

This is the whole new file — the `InventoryViewHolder` fragment
now sits inside it as a nested class, exactly as promised, and the
outer `InventoryAdapter` class supplies the three methods
`RecyclerView.Adapter` requires plus a constructor and the data it
wraps.

### Mechanical Walkthrough

- `class InventoryAdapter extends RecyclerView.Adapter<InventoryAdapter.InventoryViewHolder>`
  — split into two ideas: extending `RecyclerView.Adapter` is the
  required base class contract (same "must extend the framework's
  class" idea as `AppCompatActivity`, different base
  class); the `<...>` part is **reappearing** — `RecyclerView.Adapter<VH>`
  is a generic class much
  like `Box<T>` was, and this line fills in its type parameter with
  `InventoryViewHolder`, telling the compiler *which* ViewHolder
  subtype this specific adapter works with, so that methods like
  `onCreateViewHolder` below can be declared to return
  `InventoryViewHolder` specifically rather than a plain
  `RecyclerView.ViewHolder` the caller would have to cast.
- `private final List<String> itemNames;` — **first appearance of
  `final` on a field.** `final` means this field's reference can be
  assigned exactly once (in the constructor) and never reassigned
  afterward — appropriate here because the Adapter is handed one list
  object to display and isn't meant to swap it out for a different list
  later. `List<String>` is **reappearing** — the same generics
  mechanism, applied to the standard library's `List` interface: this specific
  list is locked to holding `String`s only, compiler-enforced.
- `InventoryAdapter(List<String> itemNames) { this.itemNames = itemNames; }`
  — **reappearing** (constructor), new detail worth
  a clause: `this.itemNames` disambiguates the field from the parameter
  of the same name — `this.` explicitly means "the field on this
  object," not the parameter that's shadowing it.
- `@NonNull` — **first appearance.** An annotation (same category as
  `@Override`, different purpose): a documentation-and-
  tooling hint that this parameter or return value must never be
  `null`, checked by Android Studio's static analysis, not by the
  compiler itself.
- `onCreateViewHolder(@NonNull ViewGroup parent, int viewType)` —
  **first appearance.** Called by `RecyclerView` only when it actually
  needs a *new* holder object — not once per data item, but only enough
  times to fill the screen plus a small buffer, which is the literal
  mechanism behind the "reuse, don't rebuild" promise the wasteful
  `addView()` loop motivated. `viewType` isn't used yet (relevant when a list
  has multiple different row layouts — not this project, yet).
- `LayoutInflater.from(parent.getContext())` — **first appearance.**
  `LayoutInflater` is the class responsible for turning an XML layout
  resource into real View objects — the same process `setContentView`
  triggers for you automatically for a whole screen; here you're
  calling it yourself for a single row layout instead. This is the
  actual mechanism behind "inflate," a word this curriculum has used
  loosely since `findViewById` first appeared — that's the concept;
  `LayoutInflater`, here, is the real class that does it.
- `.inflate(R.layout.list_item_inventory, parent, false)` — **first
  appearance.** Three arguments: which layout resource to inflate, the
  `parent` ViewGroup it will eventually live inside (needed so the
  inflated view gets correctly-typed layout parameters), and `false`
  meaning "don't attach it to `parent` yet" — `RecyclerView` itself
  handles attaching the returned view at the right time; passing `true`
  here is a common real bug that duplicates the view in the tree.
- `return new InventoryViewHolder(itemView);` — reappearing
  (constructor call, `new`, already basic since `new Intent(...)`
  earlier).
- `onBindViewHolder(@NonNull InventoryViewHolder holder, int position)`
  — **first appearance.** Called far more often than `onCreateViewHolder`
  — every time a holder (new *or* recycled) needs to display a
  *different* data item, including every time a recycled row scrolls
  back into view with new content. `position` is the index into your
  data list this call is responsible for.
- `itemNames.get(position)` — **first appearance of `List.get`** —
  standard-library method, index-based lookup, conceptually the same as
  array indexing.
- `holder.itemNameText.setText(name)` — reappearing (`setText`),
  reading the cached field directly (package-private access,
  already covered) instead of calling `findViewById` again —
  this line is the actual payoff of the whole ViewHolder unit.
- `getItemCount()` — **first appearance.** `RecyclerView` calls this to
  know how many total rows exist — it has no other way to know your
  data's size.
- `itemNames.size()` — reappearing pattern (already-basic method call),
  `List.size()`.

### Project Change — Wiring It to the Screen

- **Reference Source:** No reference counterpart.
- **Files affected:** `InventoryActivity.java`.
- **Change type:** Add.
- **Location:** Inside `onCreate`, after `setContentView`.

### The New Code

```java
List<String> itemNames = new ArrayList<>();
itemNames.add("Hex Bolts, M6");
itemNames.add("Shop Rags");
itemNames.add("Cutting Oil");
itemNames.add("Digital Calipers");
itemNames.add("Safety Glasses");

RecyclerView recyclerView = findViewById(R.id.inventoryRecyclerView);
recyclerView.setLayoutManager(new LinearLayoutManager(this));
recyclerView.setAdapter(new InventoryAdapter(itemNames));
```

(Add the matching imports: `java.util.ArrayList`, `java.util.List`,
`androidx.recyclerview.widget.RecyclerView`,
`androidx.recyclerview.widget.LinearLayoutManager` — Alt+Enter on each
red underline, same as before.)

### The Updated Project

```java
public class InventoryActivity extends AppCompatActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_inventory);

        List<String> itemNames = new ArrayList<>();               // ← new
        itemNames.add("Hex Bolts, M6");                            // ← new
        itemNames.add("Shop Rags");                                // ← new
        itemNames.add("Cutting Oil");                               // ← new
        itemNames.add("Digital Calipers");                          // ← new
        itemNames.add("Safety Glasses");                            // ← new

        RecyclerView recyclerView = findViewById(R.id.inventoryRecyclerView); // ← new
        recyclerView.setLayoutManager(new LinearLayoutManager(this));         // ← new
        recyclerView.setAdapter(new InventoryAdapter(itemNames));             // ← new
    }
}
```

`onCreate` now builds a small in-memory data set, then hands the
`RecyclerView` two collaborators it requires before it will render
anything: a `LayoutManager` (arrangement logic) and an `Adapter`
(data-to-view binding logic, built in this lesson).

### Mechanical Walkthrough

- `new ArrayList<>()` — **first appearance.** A concrete, resizable
  `List` implementation — the `<>` (diamond operator) means
  "infer the type parameter from the left-hand side" (`List<String>`),
  so you don't have to repeat `<String>` on both sides.
- `.add(...)` — reappearing pattern (already-basic method call).
- `new LinearLayoutManager(this)` — **first appearance.** The
  arrangement collaborator: specifically, "lay rows out in a single
  vertical (by default) scrolling list" — a `RecyclerView` refuses to
  display anything at all without one, since arrangement logic isn't
  built into `RecyclerView` itself, deliberately (grids, horizontal
  lists, and staggered lists are other `LayoutManager` implementations
  you could swap in later without touching the Adapter).
- `recyclerView.setAdapter(new InventoryAdapter(itemNames))` —
  reappearing pattern (constructor call) supplying this lesson's new
  class.

### Run It

Run the app, tap "Open Inventory." You should see five scrollable rows
with the item names, each rendered through `list_item_inventory.xml`,
each one's text set by `onBindViewHolder`, not hardcoded per row.

### CS Lens

`Adapter` + `LayoutManager` splitting "what data goes where" from "how
things are arranged spatially" is the **Strategy pattern** — the
arrangement algorithm is a swappable, independent object rather than
logic baked into `RecyclerView` itself. Also recognized in: a sorting
function accepting a comparator strategy, dependency-injected payment
processors behind one interface, and pluggable rendering backends in
graphics libraries.

### SE Lens

**Why does the framework demand three separate override methods
(`onCreateViewHolder`, `onBindViewHolder`, `getItemCount`) instead of
one method that just returns "the view for row N"?** The alternative —
one combined method — is closer to what the wasteful loop from earlier
did: construct-and-populate together, every time. Splitting "construct
a holder" from "populate a holder with data" is what makes recycling
possible at all: `RecyclerView` can call `onCreateViewHolder` rarely
(only enough for the visible window) and `onBindViewHolder` constantly
(cheap: just setting text on already-built views), instead of paying
full construction cost on every single row update. The cost of this
design is exactly what you just wrote: three methods and a separate
`ViewHolder` class instead of one — more ceremony for a small list,
real savings at scale, which is the entire justification the earlier
`addView()` scaling problem set up.

---

## Connect the Pieces

Full trace through the whole 6a–6e sequence: `InventoryActivity.onCreate`
builds a `List<String>` of five names → hands it to a new
`InventoryAdapter` → assigns a `LinearLayoutManager` and that Adapter to
the `RecyclerView` from `activity_inventory.xml` (6a) → `RecyclerView`
calls `getItemCount()`, gets `5`, and calls `onCreateViewHolder` just
enough times to fill the screen (inflating `list_item_inventory.xml`
each time, wrapping the result in an `InventoryViewHolder` — 6c's
fragment, finally saved for real — that caches its `TextView`) → for
each visible position, `onBindViewHolder` reads
`itemNames.get(position)` and writes it into the *already-found*
`itemNameText` field — the exact `findViewById`-per-scroll-frame cost
6c's ViewHolder unit avoided, using `static` from 6b and `List<String>`
from 6d to make it all type-safe.

## What Breaks Without This

In `InventoryAdapter`, temporarily make `getItemCount()` return `0`
instead of `itemNames.size()`. Run the app: the screen is blank, no
crash, no error — `RecyclerView` faithfully asked "how many rows?",
got `0`, and drew nothing, which is exactly why trusting `getItemCount()`
to be correct matters. Restore it afterward.

## Exercises

1. Change `list_item_inventory.xml`'s `TextView` to also show the
   row's numeric position (e.g. `"1. Hex Bolts, M6"`), using `position`
   inside `onBindViewHolder` — you'll need to build the string with
   `(position + 1) + ". " + name`.
2. Add a sixth item to the `itemNames` list in `InventoryActivity` and
   confirm it appears without touching `InventoryAdapter` at all —
   convince yourself the Adapter genuinely doesn't know or care how
   many items exist ahead of time, only what `getItemCount()` reports
   right now.

## Definition of Done

- [ ] The inventory screen shows a real scrolling list of five items
      through `RecyclerView`, not hardcoded views.
- [ ] You can name what `onCreateViewHolder` and `onBindViewHolder` are
      each individually responsible for, and why splitting them enables
      recycling.
- [ ] You broke `getItemCount()` on purpose, saw the blank result, and
      restored it.
- [ ] Commit: message explaining why (e.g. "Replace placeholder
      InventoryActivity with a real RecyclerView-backed item list,
      since a manual addView loop doesn't scale past a handful of
      items").

This closes the Lesson 6 sequence (6a–6e). Lesson 7 is next: the item
names are still just raw `String`s — giving inventory items their own
real type, and why a bag of parallel lists (names, quantities,
locations) would be worse.
