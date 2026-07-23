# Lesson 22: Asking Before Acting — Dialogs and Destructive Confirmation

**What you will build:** A real "Delete" action on `ItemDetailFragment`
— the first way to remove an item from this project's inventory at
all — gated behind an `AlertDialog` confirmation, so a single accidental
tap can never permanently destroy data. The transferable problem:
every action built so far in this project (add, edit-via-quantity in
Lesson 13's exercise) is either harmless to redo or additive. Deletion
is the first genuinely **destructive, hard-to-reverse** action this app
performs, and it deserves different treatment than a normal button tap
— not because the code is harder to write, but because the cost of a
mistake is categorically different.

**What you need to know first:** Lesson 13 (`ItemDao`, adding a
`@Delete` method the same shape as `@Insert`), Lesson 17
(`ItemRepository`'s delegation pattern), Lesson 19 (navigating back
after an action via the `NavController`), Lesson 21 (the options menu).

---

## Concept Unit: Wiring Delete Through Every Existing Layer

### The Problem

Before any confirmation UI can matter, the app needs an actual way to
delete a row — following the exact same three-layer path Lesson 13's
`insert` and Lesson 17's Repository refactor already established for
every other operation.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `ItemDao.java`, `ItemRepository.java`,
  `InventoryViewModel.java`.
- **Change type:** Add — one method per layer, each a one-line
  delegation to the layer below, following Lesson 17's established
  pattern exactly.

### The New Code

```java
@Delete
void delete(Item item);
```

```java
void deleteItem(Item item) {
    dbExecutor.execute(() -> {
        itemDao.delete(item);
        List<Item> current = new ArrayList<>(itemsLiveData.getValue());
        current.removeIf(i -> i.getId() == item.getId());
        itemsLiveData.postValue(current);
    });
}
```

```java
void deleteItem(Item item) {
    repository.deleteItem(item);
}
```

### The Updated Project

The first block adds to `ItemDao` (alongside `@Insert`/`@Update`,
Lesson 13); the second to `ItemRepository` (alongside `loadItems`/
`addItem`, Lesson 17); the third to `InventoryViewModel`, its one-line
delegation matching every other method there exactly. No existing
method in any of the three files changes at all.

### Mechanical Walkthrough

- `@Delete void delete(Item item);` — reappearing (Room-generated
  method, Lesson 13), same primary-key-based row matching `@Update`
  already relied on.
- `dbExecutor.execute(...)` — reappearing, Lesson 14/17.
- `itemDao.delete(item)` — reappearing (DAO method call).
- `current.removeIf(i -> i.getId() == item.getId())` — **first
  appearance of `List.removeIf`.** Takes a `Predicate` (another
  single-abstract-method interface, same family as `Runnable`/
  `OnItemClickListener`) and removes every element it returns `true`
  for — here, matching by `id` (Lesson 20's identity check, reused for
  a third purpose) rather than full-field `equals()`, since the exact
  object reference passed in might not be the same instance currently
  held in `itemsLiveData`'s list.
- `itemsLiveData.postValue(current)` — reappearing, Lesson 16.
- `InventoryViewModel.deleteItem` — reappearing delegation shape,
  Lesson 17.

### Run It

This unit produces no visible change yet — nothing calls `deleteItem`
anywhere. Confirm it compiles cleanly; the next unit gives it a real
caller.

---

## Concept Unit: `AlertDialog.Builder` — a Modal Confirmation

### The Problem

The naive next step — wire a "Delete" menu item directly to
`viewModel.deleteItem(item)` — would make data loss exactly one
mis-tap away, with zero chance to reconsider or recover from a slipped
finger.

### Introduce the Concept in Isolation

```java
new android.app.AlertDialog.Builder(requireContext())
        .setTitle("Test Dialog")
        .setMessage("This is a scratch confirmation dialog.")
        .setPositiveButton("Yes", (dialog, which) ->
                android.util.Log.d("DialogDemo", "User tapped Yes"))
        .setNegativeButton("No", (dialog, which) ->
                android.util.Log.d("DialogDemo", "User tapped No"))
        .show();
```

Temporarily call this from anywhere reachable — for instance, a
one-off tap on `ItemDetailFragment`'s existing title `TextView` (add a
click listener to it purely for this test). Run it, tap the title, and
confirm a real modal dialog appears with two buttons; tap each in turn
across separate runs and confirm the matching Logcat line prints. The
rest of the screen is unreachable while the dialog is showing —
concrete proof it's genuinely **modal**: the app is blocked from
further input until the user makes an explicit choice.

### Discard the Throwaway Example

Remove the temporary click listener and this block — the real Delete
confirmation, built next, follows the identical shape with real
consequences wired to the positive button.

### Mechanical Walkthrough

- `new android.app.AlertDialog.Builder(requireContext())` — **first
  appearance.** The **Builder pattern** (worth naming explicitly here,
  though the *shape* already appeared unnamed with `Room.databaseBuilder`
  in Lesson 13): a chain of configuration calls, each returning the
  same builder object, ending in a call that produces the real result.
- `.setTitle(...)` / `.setMessage(...)` — **first appearance.** Set the
  dialog's heading and body text.
- `.setPositiveButton("Yes", (dialog, which) -> { ... })` — **first
  appearance.** The conventional "confirm/proceed" button — its lambda
  receives the `DialogInterface` itself and an integer `which`
  (identifying *which* button, relevant when a dialog has more than
  the two shown here — not used in this project).
- `.setNegativeButton("No", (dialog, which) -> { ... })` — **first
  appearance.** The conventional "cancel" button.
- `.show()` — **first appearance.** Actually displays the built dialog
  — nothing appears until this final call, the same "stage, then
  commit" shape as `SharedPreferences.Editor` (Lesson 11) and Fragment
  transactions (Lesson 18).

### CS Lens

A modal dialog blocking interaction with the rest of the screen until
resolved is a **synchronous confirmation gate** inserted before an
irreversible operation — structurally similar to a database transaction
requiring an explicit `COMMIT` before changes take permanent effect
(mentioned conceptually in Lesson 12), or a command-line tool's `Are
you sure? [y/N]` prompt before `rm -rf`-style destructive commands.

### SE Lens

**Why require an explicit, blocking confirmation instead of performing
the delete immediately and offering an "Undo" afterward** (a real,
valid alternative pattern, built for real in Lesson 23)? Both
approaches protect against accidental data loss, but they trade off
differently: a blocking confirmation costs the user one extra tap on
*every* delete, even the ones they're certain about, in exchange for
never performing the destructive action at all until explicitly told
to. An undo-after-the-fact approach costs nothing extra on the happy
path but requires the system to actually keep the deleted data
recoverable for some window of time, and requires the user to notice
and act on the undo affordance before it disappears. This lesson
deliberately builds the blocking version first, as the simpler, more
conservative default; Lesson 23 builds the alternative for a specific,
different context where its tradeoffs make more sense.

---

## Concept Unit: Wiring the Real Confirmation

### The Problem

Time to attach this to the real Delete action on `ItemDetailFragment`.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `menu_item_detail.xml` (new), `ItemDetailFragment.java`.
- **Change type:** Create, add.
- **Dependencies:** `InventoryViewModel.deleteItem`, this lesson's
  first unit.

### The New Code — the Menu

```xml
<menu xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto">

    <item
        android:id="@+id/menu_delete"
        android:title="Delete"
        app:showAsAction="always" />

</menu>
```

### The New Code — the Confirmation and Delete

```java
requireActivity().addMenuProvider(new MenuProvider() {
    @Override
    public void onCreateMenu(@NonNull Menu menu, @NonNull MenuInflater menuInflater) {
        menuInflater.inflate(R.menu.menu_item_detail, menu);
    }

    @Override
    public boolean onMenuItemSelected(@NonNull MenuItem menuItem) {
        if (menuItem.getItemId() == R.id.menu_delete) {
            confirmDelete();
            return true;
        }
        return false;
    }
}, getViewLifecycleOwner());
```

```java
private void confirmDelete() {
    new AlertDialog.Builder(requireContext())
            .setTitle("Delete " + item.getName() + "?")
            .setMessage("This cannot be undone.")
            .setPositiveButton("Delete", (dialog, which) -> {
                viewModel.deleteItem(item);
                Navigation.findNavController(requireView()).navigateUp();
            })
            .setNegativeButton("Cancel", null)
            .show();
}
```

### The Updated Project

`ItemDetailFragment.onViewCreated` gains the `MenuProvider` registration
(the same shape Lesson 21 already established for
`InventoryListFragment`, reused rather than re-explained); `confirmDelete`
is a new private method the class gains, called only from the menu
handler.

### Mechanical Walkthrough

- `menuInflater.inflate(R.menu.menu_item_detail, menu)` — reappearing,
  Lesson 21.
- `"Delete " + item.getName() + "?"` — reappearing (string
  concatenation), reading the Fragment's already-retrieved `item`
  field (Lesson 19's `ItemDetailFragmentArgs`) to make the confirmation
  message specific rather than generic — a real, small UX detail: a
  dialog reading "Delete Cutting Oil?" is more trustworthy than a
  generic "Delete this item?" precisely because it proves the app knows
  which item is about to be affected.
- `viewModel.deleteItem(item)` — reappearing, this lesson's first unit
  — called **only** from inside the positive button's lambda, never
  from the menu handler directly, which is the entire structural point
  of this lesson.
- `Navigation.findNavController(requireView()).navigateUp()` —
  reappearing (Lesson 19/21), new detail: `requireView()` — **first
  appearance** — a Fragment convenience method returning its current
  view non-null (throwing if called when none exists) — used here
  instead of the `view` parameter `onViewCreated` provided, since this
  method runs later, outside that parameter's scope.
- `.setNegativeButton("Cancel", null)` — **first appearance of `null`
  as a listener argument.** A dialog button doesn't require a
  listener at all — passing `null` here means "show a Cancel button
  that simply dismisses the dialog and does nothing else," which is
  exactly the correct, safe behavior for declining a destructive
  action.

### Run It

Run the app, open any item's detail screen, tap the new Delete menu
icon. Confirm the dialog shows the specific item's real name. Tap
Cancel: nothing happens, the dialog closes, the item is untouched. Open
Delete again, tap Delete: the item is removed, `navigateUp()` returns
to the list, and — thanks to Lesson 20's `DiffUtil` — the row animates
out rather than the list silently redrawing.

### CS Lens

Requiring the destructive call (`viewModel.deleteItem`) to be
syntactically reachable **only** from inside the confirmation's
positive-button lambda — never directly from the menu handler — is a
lightweight, code-structure-level version of the general **principle of
least astonishment / no dangerous action without explicit intent**:
reading `onMenuItemSelected`'s body, there's no path from "tap the menu
item" to "data is gone" that doesn't pass through the dialog, which
makes the safety property visible directly in the code's shape, not
just in the running behavior.

---

## Connect the Pieces

Full trace: `ItemDao` gains a `@Delete` method (Lesson 13's generated-
code mechanism, a fourth operation alongside insert/update/query) →
`ItemRepository.deleteItem` runs it on `dbExecutor`, then removes the
matching `Item` (by `id`, Lesson 20's identity concept) from its
in-memory copy and posts the result through `LiveData` (Lesson 16) →
`InventoryViewModel.deleteItem` delegates, unchanged in shape from
every other method on that class (Lesson 17) → `ItemDetailFragment`'s
menu (Lesson 21's `MenuProvider` pattern) routes a tap to `confirmDelete`,
which shows a real, modal `AlertDialog` naming the specific item →
only the positive button's callback — never the menu handler directly
— calls `viewModel.deleteItem(item)` and navigates back up through the
nav graph (Lesson 19) → the list screen's `RecyclerView`, still
observing the same `LiveData` chain, animates the row's removal via
`DiffUtil` (Lesson 20), with no code in `InventoryListFragment` aware
that a deletion — as opposed to any other kind of list change — is what
just happened.

## What Breaks Without This

Temporarily move `viewModel.deleteItem(item)` out of the positive
button's lambda and call it directly inside `onMenuItemSelected`,
*before* `confirmDelete()` is even called. Run the app, tap the Delete
menu icon once: the item is gone immediately, the dialog still shows
afterward (now confirming an already-completed, unstoppable action)
— a real, concrete demonstration of exactly the "one mis-tap, no way
back" failure this lesson exists to prevent. Restore the correct
placement afterward.

## Exercises

1. Add a second confirmation dialog to `SettingsFragment`: warn before
   saving a threshold of `0` specifically ("A threshold of 0 disables
   low-stock warnings — continue?"), using the same
   `AlertDialog.Builder` shape, positive button proceeding with the
   existing save logic, negative button doing nothing.
2. Investigate (documentation, not required to build) `AlertDialog.Builder`'s
   `setCancelable(false)` and `setOnDismissListener(...)`. Write, in
   your own words, a real scenario where forcing the user to make an
   explicit choice — disabling the "tap outside to dismiss" default —
   would be the right call for this project, and one where it would be
   an unnecessarily heavy-handed restriction.

## Definition of Done

- [ ] Deleting an item requires an explicit confirmation naming the
      specific item, and Cancel truly does nothing.
- [ ] `ItemDao`, `ItemRepository`, and `InventoryViewModel` each gained
      exactly one `delete`-related method, following the existing
      three-layer pattern.
- [ ] You ran the throwaway `AlertDialog` lab and confirmed the dialog
      is genuinely modal.
- [ ] You moved the delete call outside the confirmation on purpose,
      saw the real unguarded deletion, and restored the safe version.
- [ ] Commit: message explaining why (e.g. "Add item deletion gated
      behind an AlertDialog confirmation, since this is the first
      destructive, hard-to-reverse action in the app").

Lesson 23 is next: a full blocking confirmation dialog is the right
call for deleting from the detail screen, but a swipe gesture on a list
row deserves different treatment — `Snackbar`, undo, and why "delete
immediately, offer to reverse it" is sometimes the better tradeoff this
lesson's own SE Lens named but didn't build.
