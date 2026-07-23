# Lesson 23: Undo Is a Feature — Swipe to Delete and Snackbar

**What you will build:** Swiping any row on the inventory list deletes
it immediately, with a `Snackbar` offering one tap to undo — a second,
different answer to the same "how do we let users delete safely"
question Lesson 22 already solved one way. The transferable problem:
Lesson 22's SE Lens named a real alternative to blocking confirmation —
act immediately, offer undo — without building it. A list row swipe is
exactly the context where that alternative fits better: the gesture
itself is deliberate and specific to one row, immediate feedback feels
right, and a brief undo window costs far less friction than a dialog on
every single swipe.

**What you need to know first:** Lesson 22 (`viewModel.deleteItem`,
`InventoryViewModel.addItem` — both reused here), Lesson 20
(`InventoryAdapter`/`ListAdapter`, `DiffUtil` animations — swiping
interacts directly with `RecyclerView`'s row views), Lesson 6
(`RecyclerView`, `LayoutManager`).

---

## Concept Unit: `ItemTouchHelper` — Detecting a Swipe Gesture

### The Problem

Nothing in this project currently reacts to a horizontal drag across a
row — `RecyclerView` handles vertical scrolling (Lesson 6's
`LinearLayoutManager`) but has no built-in swipe-to-delete behavior of
its own; that requires a separate, purpose-built helper.

### Introduce the Concept in Isolation

`ItemTouchHelper` fundamentally needs a real `RecyclerView` with real
rows to detect a real swipe against — there's no meaningfully smaller
version of the mechanism to isolate. Build the smallest possible
version of one, temporarily, rather than skipping the isolation step
entirely.

Temporarily add a second `RecyclerView` to `fragment_inventory_list.xml`
(anywhere reachable — below the existing one is fine) and wire it in
`onViewCreated`:

```java
RecyclerView scratchList = view.findViewById(R.id.scratchRecyclerView);
List<String> scratchItems = new ArrayList<>(Arrays.asList("A", "B", "C"));
RecyclerView.Adapter<RecyclerView.ViewHolder> scratchAdapter =
        new RecyclerView.Adapter<RecyclerView.ViewHolder>() {
    @NonNull
    @Override
    public RecyclerView.ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        TextView textView = new TextView(parent.getContext());
        textView.setPadding(32, 32, 32, 32);
        return new RecyclerView.ViewHolder(textView) {};
    }

    @Override
    public void onBindViewHolder(@NonNull RecyclerView.ViewHolder holder, int position) {
        ((TextView) holder.itemView).setText(scratchItems.get(position));
    }

    @Override
    public int getItemCount() {
        return scratchItems.size();
    }
};
scratchList.setLayoutManager(new LinearLayoutManager(requireContext()));
scratchList.setAdapter(scratchAdapter);

ItemTouchHelper touchHelper = new ItemTouchHelper(new ItemTouchHelper.SimpleCallback(
        0, ItemTouchHelper.LEFT | ItemTouchHelper.RIGHT) {
    @Override
    public boolean onMove(@NonNull RecyclerView rv, @NonNull RecyclerView.ViewHolder vh,
                           @NonNull RecyclerView.ViewHolder target) {
        return false;
    }

    @Override
    public void onSwiped(@NonNull RecyclerView.ViewHolder viewHolder, int direction) {
        int position = viewHolder.getAdapterPosition();
        android.util.Log.d("SwipeDemo", "Swiped away: " + scratchItems.get(position));
        scratchItems.remove(position);
        scratchAdapter.notifyItemRemoved(position);
    }
});
touchHelper.attachToRecyclerView(scratchList);
```

Run the app, swipe any of the three scratch rows left or right. Logcat
confirms which item was swiped, and the row animates out via
`notifyItemRemoved` (Lesson 10's method, triggered by a gesture instead
of a button tap this time). This proves the mechanism: a real swipe
gesture, correctly distinguished from a vertical scroll, drove a real
data removal.

### Discard the Throwaway Example

Delete the scratch `RecyclerView` from the layout and every line of
this block from `onViewCreated` — the real inventory list, wired next,
uses the identical `ItemTouchHelper` shape against `InventoryAdapter`
and `InventoryListFragment`'s already-real data.

### Mechanical Walkthrough

- `new ItemTouchHelper(new ItemTouchHelper.SimpleCallback(0, ItemTouchHelper.LEFT | ItemTouchHelper.RIGHT) { ... })`
  — **first appearance.** `SimpleCallback`'s constructor takes two
  flag sets: drag directions (`0` here — this project doesn't support
  reordering rows by dragging) and swipe directions
  (`LEFT | ItemTouchHelper.RIGHT`, combined with the bitwise OR
  operator `|` — **first appearance** — meaning "either direction
  counts").
- `onMove(...)` — **first appearance.** Required by the abstract class
  even when unused; governs drag-to-reorder specifically, `return false`
  meaning "don't support this."
- `onSwiped(RecyclerView.ViewHolder viewHolder, int direction)` —
  **first appearance.** Called once the swipe gesture completes past
  its threshold — `direction` reports which way (`ItemTouchHelper.LEFT`
  or `.RIGHT`), unused in this project since both trigger the same
  delete behavior.
- `viewHolder.getAdapterPosition()` — reappearing, Lesson 8.
- `touchHelper.attachToRecyclerView(scratchList)` — **first appearance.**
  Registers the gesture detector against a specific `RecyclerView` —
  nothing above this line actually listens for touches until this call.

### CS Lens

Gesture recognition — distinguishing a horizontal swipe from a vertical
scroll or a simple tap from the same raw stream of touch coordinates —
is an instance of **event stream classification**: raw, low-level
input events (finger-down, finger-move, finger-up, with coordinates and
timing) get interpreted into a small set of meaningful, named gestures
by a layer sitting between the raw hardware signal and your application
code. Also recognized in: any gesture-recognition library (pinch-to-
zoom, long-press detection), speech-to-text systems interpreting raw
audio samples into words, and network protocol parsers turning a raw
byte stream into structured messages.

---

## Concept Unit: Wiring Swipe-to-Delete Into the Real List

### The Problem

Apply the exact same mechanism to `InventoryAdapter`'s real rows,
routing the actual deletion through the same `ItemRepository`/
`ItemDao` chain Lesson 22 built.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `InventoryListFragment.java`.
- **Change type:** Add, inside `onViewCreated`, after the `RecyclerView`
  and Adapter are already set up (Lesson 20).
- **Dependencies:** `viewModel.deleteItem` (Lesson 22),
  `adapter.getCurrentList()` (a method `ListAdapter`, Lesson 20's base
  class, already provides).

### The New Code

```java
ItemTouchHelper touchHelper = new ItemTouchHelper(new ItemTouchHelper.SimpleCallback(
        0, ItemTouchHelper.LEFT | ItemTouchHelper.RIGHT) {
    @Override
    public boolean onMove(@NonNull RecyclerView rv, @NonNull RecyclerView.ViewHolder vh,
                           @NonNull RecyclerView.ViewHolder target) {
        return false;
    }

    @Override
    public void onSwiped(@NonNull RecyclerView.ViewHolder viewHolder, int direction) {
        int position = viewHolder.getAdapterPosition();
        Item swipedItem = adapter.getCurrentList().get(position);
        viewModel.deleteItem(swipedItem);
        showUndoSnackbar(swipedItem);
    }
});
touchHelper.attachToRecyclerView(recyclerView);
```

### The Updated Project

Added directly below `recyclerView.setAdapter(adapter);` in
`InventoryListFragment.onViewCreated`, before the `LiveData` observer
registration and `viewModel.loadItems()` call from Lesson 16/20 —
everything from that point on is unchanged.

### Mechanical Walkthrough

- `adapter.getCurrentList()` — **first appearance.** A method
  `ListAdapter` (Lesson 20) provides for free — returns whatever list
  it's currently displaying, exactly the list `submitList` last set,
  needed here since `InventoryAdapter` no longer keeps a directly
  Fragment-accessible `items` field of its own (Lesson 20 removed it).
- `viewModel.deleteItem(swipedItem)` — reappearing, Lesson 22, called
  directly from the swipe callback rather than from behind a
  confirmation dialog — the deliberate difference this lesson's opening
  named.
- `showUndoSnackbar(swipedItem)` — calls a new method, built next.

### CS Lens

Notice this project now has **two different entry points to the exact
same `viewModel.deleteItem` method** — one gated behind Lesson 22's
`AlertDialog`, one triggered directly by a swipe — each choosing a
different safety strategy for the *same* underlying operation. This is
a small, real demonstration of **separating a capability from the
policy governing when it's invoked**: `deleteItem` itself has no
opinion about confirmation at all; every safety decision lives entirely
in the caller.

---

## Concept Unit: `Snackbar` — Immediate Feedback With an Escape Hatch

### The Problem

A row vanishing with zero feedback, even briefly, would feel abrupt
and offer no recovery path — the whole point of choosing "act
immediately" over Lesson 22's blocking dialog was trading upfront
friction for an easy way to reverse a mistake, and that reversal path
doesn't exist yet.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `InventoryListFragment.java`.
- **Change type:** Add — a new private method.
- **Dependencies:** `viewModel.addItem` (Lesson 15/16, already exists).

### The New Code

```java
private void showUndoSnackbar(Item deletedItem) {
    Snackbar.make(requireView(), "Deleted " + deletedItem.getName(), Snackbar.LENGTH_LONG)
            .setAction("Undo", v -> {
                Item restored = new Item(deletedItem.getName(), deletedItem.getQuantity(), deletedItem.getLocation());
                viewModel.addItem(restored);
            })
            .show();
}
```

### The Updated Project

A new private method on `InventoryListFragment`, called only from the
`onSwiped` callback built in the previous unit.

### Mechanical Walkthrough

- `Snackbar.make(requireView(), "Deleted " + deletedItem.getName(), Snackbar.LENGTH_LONG)`
  — **first appearance.** `Snackbar` is a brief, auto-dismissing bar
  anchored to the bottom of the screen — visually similar to `Toast`
  (Lesson 9) but, critically, **interactive**: it can hold a real
  clickable action, which `Toast` cannot. `requireView()` — reappearing,
  Lesson 22 — anchors it to this Fragment's current view.
  `Snackbar.LENGTH_LONG` — **first appearance**, a duration constant
  parallel to `Toast.LENGTH_SHORT` (Lesson 9).
- `.setAction("Undo", v -> { ... })` — **first appearance.** Adds a
  tappable button-like text action directly inside the Snackbar —
  reappearing lambda syntax, `v` unused (the tapped `View`, same unused-
  parameter pattern as every click listener since Lesson 4).
- `new Item(deletedItem.getName(), deletedItem.getQuantity(), deletedItem.getLocation())`
  — reappearing (the `@Ignore`-annotated three-argument constructor,
  Lesson 13), a **deliberate, new object**, not the original —
  discussed directly in the SE Lens below.
- `viewModel.addItem(restored)` — reappearing, Lesson 15/16/17 — the
  exact same insertion path a brand-new item takes.
- `.show()` — reappearing, this lesson's first unit and Lesson 22.

### Run It

Run the app, swipe a row: it disappears immediately (`DiffUtil`
animating the removal, Lesson 20), and a `Snackbar` appears reading
"Deleted [name]" with an Undo action. Tap Undo within a few seconds:
the item reappears in the list — animated back in, again via `DiffUtil`,
this time as a fresh insertion. Let the Snackbar time out without
tapping Undo: the deletion stands, permanently, exactly like Lesson
22's confirmed-dialog path.

### CS Lens

**This is a hard concept — compensating action instead of prevention —
and it recurs constantly:** rather than blocking an operation before it
happens (Lesson 22's dialog), let it happen and provide a reliable way
to reverse its *effect*. Also recognized in: database transaction
rollback (the write happened, then gets undone), version control revert
commits (undoing a change by recording a new, opposite change rather
than erasing history), email "Undo Send" features (the message is
briefly held, or in some implementations genuinely sent and then
recalled), and general "optimistic UI" patterns in web apps that apply
a change locally immediately and reconcile with the server afterward.

### SE Lens

**Why does "Undo" here create a brand-new `Item` via `addItem` instead
of somehow restoring the exact original row, `id` included?** This is
a real, honest limitation worth stating plainly rather than glossing
over: because `deleteItem` already committed the removal to the real
database (unlike a "pending delete" design that would delay the actual
`DELETE` until the Snackbar's window expires), the original row and its
auto-generated `id` (Lesson 13) are genuinely gone — `Undo` can only
recreate an item with the *same field values*, which Room will assign a
**new** `id` to. For this project, where `id` is purely an internal
detail never shown to the user, that's an acceptable, working tradeoff.
A stricter implementation — delaying the real deletion until the
Snackbar expires, using `Handler.postDelayed` or a coroutine delay, so
"Undo" could cancel the pending delete entirely rather than reconstruct
the row — is the more sophisticated, correct-for-a-shipping-app
version, deliberately left as an exercise rather than built here, so
this lesson's core concept (immediate action, compensating undo) isn't
buried under scheduling machinery it doesn't strictly need to
demonstrate.

---

## Connect the Pieces

Full trace: the user swipes a row → `ItemTouchHelper`'s `onSwiped`
fires, reading the swiped `Item` via `adapter.getCurrentList()`
(Lesson 20's `ListAdapter`) → `viewModel.deleteItem` runs the identical
Repository/DAO chain Lesson 22 built, this time with no confirming
dialog in front of it → `RecyclerView` animates the row's removal via
`DiffUtil`, the exact same visual mechanism a dialog-confirmed delete
would trigger → `showUndoSnackbar` displays the deleted item's name
with a tappable Undo action → tapping it calls `viewModel.addItem` with
a freshly-constructed `Item` carrying the same displayed data, flowing
through the identical insertion path Lesson 9's Add Item form always
has, landing back in the list with a new row-insertion animation.

## What Breaks Without This

Temporarily remove `.setAction("Undo", v -> { ... })` entirely from the
`Snackbar` chain (leave `.show()`). Swipe a row: the deletion still
works, the message still briefly appears, but there is now no way to
recover the deleted item short of manually re-adding it through the
Add Item form — a real, if less catastrophic, version of Lesson 22's
"no way back" failure, this time for a gesture far easier to trigger by
accident than a menu-then-dialog sequence. Restore the Undo action
afterward.

## Exercises

1. Confirm the low-stock highlight (Lesson 11/20) and swipe-to-delete
   compose correctly: swipe away a red (low-stock) row, tap Undo, and
   confirm the restored row is still shown in red — proving
   `onBindViewHolder`'s threshold check runs correctly regardless of
   whether a row arrived via initial load, a form-added insert, or an
   undo-triggered re-insert.
2. As a real extension (not required, but worth attempting): replace
   the immediate-delete version with the "pending delete" alternative
   named in this lesson's SE Lens, using `Handler(Looper.getMainLooper()).postDelayed(...)`
   to actually call `viewModel.deleteItem` only after the Snackbar's
   duration elapses without an Undo tap, canceling that delayed call
   entirely if Undo is tapped in time. This preserves the original
   `id` correctly, at the cost of real scheduling complexity — decide
   for yourself, having built both, which tradeoff you'd actually ship.

## Definition of Done

- [ ] Swiping a row deletes it immediately with a `DiffUtil`-animated
      removal and shows an Undo `Snackbar`.
- [ ] Tapping Undo restores the item to the list before the Snackbar
      times out; letting it time out makes the deletion permanent.
- [ ] You ran the throwaway `ItemTouchHelper` lab against a scratch
      list before wiring the real one.
- [ ] You can explain, in your own words, why this project now has two
      different UI paths to the same `deleteItem` method, and when
      each is the more appropriate choice.
- [ ] You removed the Undo action on purpose, saw the real reduced-
      safety result, and restored it.
- [ ] Commit: message explaining why (e.g. "Add swipe-to-delete with
      Snackbar undo as a lower-friction alternative to Lesson 22's
      confirmation dialog, appropriate for a deliberate per-row
      gesture rather than a menu action").

Lesson 24 is next: every feature so far has stayed entirely inside this
app's own sandbox — the runtime permission model, and what changes the
moment this project wants to touch something the OS actively protects,
starting with the camera in Lesson 25.
