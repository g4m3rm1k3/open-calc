# Lesson 1.5: `getItemCount`

## What you will build

Nothing new yet — this is a full, real read of the fifth and final piece
of `InventoryAdapter`: the one method that tells `RecyclerView` how much
data actually exists. The transferable problem: every other method
covered so far (Lessons 1.2–1.4) receives a `position` and simply trusts
it's valid — something, somewhere, has to be the one place that actually
defines what "valid" means.

## What you need to know first

**Lessons 1.1–1.4** — `InventoryAdapter`'s field, constructor, and the
three methods already covered; this lesson's own method is the last of
`RecyclerView.Adapter`'s three required overrides, alongside Lesson 1.2's
and Lesson 1.3's.

## Terms used in this lesson

- **`@Override`** (reappearing, Lesson 1.2) — an annotation telling the
  compiler this method is meant to replace one the parent class already
  declared, using the exact same signature; the compiler rejects the
  file outright if the signature doesn't actually match.

## Objects and methods used

**`RecyclerView.Adapter<VH>.getItemCount()`**
- *What it is:* the third and final abstract method
  `RecyclerView.Adapter` requires every real subclass to supply.  It is
  this lesson's own subject.
- *Implementation:* `public abstract int getItemCount()` — no
  parameters, returning a plain `int`.
- *Its use:* `InventoryAdapter` supplies the real body below — the only
  place in the whole file that reports how many logical items exist in
  total.

**`java.util.List<E>.size()`**
- *What it is:* an ordinary instance method on the same `List<InventoryItem>`
  interface Lesson 1.3 already gave partial treatment to (there, `.get(int)`
  and `.remove(int)`).
- *Implementation:* `public int size()` — returns the real, current
  count of elements the list holds at the exact moment it's called; not
  a cached value computed once, a live count re-derived from the list's
  own actual contents every time.
- *Its use:* the entire body of `getItemCount()`, below — nothing else
  is needed.

---

## Concept Unit: `getItemCount`

### The Problem

Every method covered so far — `onCreateViewHolder`'s `viewType`,
`onBindViewHolder`'s `position`, `showEditQuantityDialog`'s `position` —
receives some value from `RecyclerView` and simply trusts it. Nothing
shown so far is the place that actually *defines* the valid range those
values are drawn from, or tells `RecyclerView` how far a user is allowed
to scroll in the first place.

### Project Change

- **Reference Source:** No external reference file in this repo — this
  is your own Android Studio project's real `InventoryAdapter.java`,
  already built in `android-ui-foundations`. Shown in full below exactly
  as it already stands; nothing in this unit changes it.
- **Files affected:** `InventoryAdapter.java` (already exists).
- **Change type:** N/A — reading existing code.
- **Location:** the method `getItemCount`, the third required override,
  declared directly inside `InventoryAdapter`.
- **Dependencies:** none new.

### The New Code

```java
@Override
public int getItemCount() {
    return items.size();
}
```

### The Updated Project

`InventoryAdapter.java`, complete — every piece from Lessons 1.1 through
1.5 shown together, with this unit's own addition marked:

```java
class InventoryAdapter extends RecyclerView.Adapter<InventoryAdapter.InventoryViewHolder> {

    private final List<InventoryItem> items;

    InventoryAdapter(List<InventoryItem> items) {
        this.items = items;
    }

    @NonNull
    @Override
    public InventoryViewHolder onCreateViewHolder(ViewGroup parent, int viewType) {
        View rowView = LayoutInflater.from(parent.getContext())
                .inflate(R.layout.item_inventory, parent, false);
        return new InventoryViewHolder(rowView);
    }

    @Override
    public void onBindViewHolder(@NonNull InventoryViewHolder holder, int position) {
        InventoryItem item = items.get(position);
        holder.nameText.setText(item.getName());
        holder.quantityText.setText(String.valueOf(item.getQuantity()));
        holder.deleteButton.setOnClickListener((view) -> {
            int currentPosition = holder.getBindingAdapterPosition();
            if (currentPosition != RecyclerView.NO_POSITION) {
                items.remove(currentPosition);
                notifyItemRemoved(currentPosition);
            }
        });
        holder.itemView.setOnClickListener((view) -> {
            int currentPosition = holder.getBindingAdapterPosition();
            if (currentPosition != RecyclerView.NO_POSITION) {
                showEditQuantityDialog(view.getContext(), currentPosition);
            }
        });
    }

    private void showEditQuantityDialog(Context context, int position) {
        InventoryItem item = items.get(position);
        EditText quantityInput = new EditText(context);
        quantityInput.setInputType(InputType.TYPE_CLASS_NUMBER);
        quantityInput.setText(String.valueOf(item.getQuantity()));

        new AlertDialog.Builder(context)
            .setTitle("Update Quantity")
            .setView(quantityInput)
            .setPositiveButton("Save", (dialog, which) -> {
                int newQuantity = Integer.parseInt(quantityInput.getText().toString());
                item.setQuantity(newQuantity);
                notifyItemChanged(position);
            })
            .setNegativeButton("Cancel", null)
            .show();
    }

    @Override                          // ← new
    public int getItemCount() {        // ← new
        return items.size();           // ← new
    }                                  // ← new

    static class InventoryViewHolder extends RecyclerView.ViewHolder {
        final Button deleteButton;
        final TextView nameText;
        final TextView quantityText;

        InventoryViewHolder(View rowView) {
            super(rowView);
            nameText = rowView.findViewById(R.id.itemNameText);
            quantityText = rowView.findViewById(R.id.itemQuantityText);
            deleteButton = rowView.findViewById(R.id.deleteButton);
        }
    }
}
```

`InventoryAdapter` now satisfies all three of `RecyclerView.Adapter`'s
required overrides — this is the completed contract: create a slot, fill
a slot, report how many logical items exist.

### Introduce the Concept in Isolation

The claim that `.size()` reports a live, current count — not a value
fixed once and forgotten — is provable directly.
`code/android-persistence-lab/ItemCountDemo.java`:

```java
import java.util.ArrayList;
import java.util.List;

public class ItemCountDemo {

    public static void main(String[] args) {
        List<String> items = new ArrayList<>();
        System.out.println("items.size() on an empty list = " + items.size());

        items.add("Bolts");
        items.add("Washers");
        items.add("Nuts");
        System.out.println("after 3 adds, items.size()    = " + items.size());

        items.remove(0);
        System.out.println("after 1 removal, items.size() = " + items.size());

        int count = items.size();
        System.out.println();
        System.out.println("valid position range for this list: 0 <= position < " + count);
        for (int position = 0; position < count; position++) {
            System.out.println("  position " + position + " -> " + items.get(position));
        }
    }
}
```

Real, actually-run output, this session:

```
items.size() on an empty list = 0
after 3 adds, items.size()    = 3
after 1 removal, items.size() = 2

valid position range for this list: 0 <= position < 2
  position 0 -> Washers
  position 1 -> Nuts
```

`.size()` reported `0`, then `3`, then `2` — three different real
answers from three calls on the *same* `List` object, each one reflecting
whatever the list actually held at that exact moment. Nothing was cached
or computed once; each call re-derived the answer from the list's real,
current contents.

### Discard the Throwaway Example

`ItemCountDemo.java` exists only to prove that `.size()` is live, not
cached, in isolation. It is not part of the Android project — the real
mechanism it proves carries forward into `getItemCount()`, next.

### Mechanical Walkthrough

- `@Override` — reappearing (Terms, above); confirms this signature
  really matches the third abstract method `RecyclerView.Adapter`
  declares.
- `public int getItemCount()` — the required override signature
  (Objects and methods, above); unlike the other two required overrides,
  this one takes no parameters at all and is a single expression with no
  branching.
- `return items.size();` — an **instance method call**, `.size()`
  (Objects and methods, above), on `items` (the same real
  `List<InventoryItem>` field Lessons 1.3–1.4 already called `.get`,
  `.remove`, and now this on) — proven, in isolation above, to report a
  live count rather than a value fixed once.

### CS Lens

Together, `onCreateViewHolder`, `onBindViewHolder`, and `getItemCount`
fulfill a simple, complete contract: create a slot, fill a slot, report
how many logical items exist. This is the last third of it — the piece
that lets `RecyclerView`'s own internals stay entirely ignorant of what
an `InventoryItem` even is; they only ever see "some count of things,"
"a slot," and "fill this slot with item N."

### SE Lens

Why does this method exist at all, rather than `RecyclerView` simply
calling `onBindViewHolder` with an ever-increasing `position` until
something throws an exception? Because that would make "how long is this
list" an error-driven discovery instead of a direct question with a
direct answer — every scrollbar-sizing calculation, every check for
"has the user reached the end," would have to be reverse-engineered from
a crash instead of read directly. The real cost of `getItemCount`
existing at all is one extra required method every adapter author must
implement correctly — cheap compared to the alternative.

### Commands Needed

```bash
cd code/android-persistence-lab
javac ItemCountDemo.java
java ItemCountDemo
```

- `javac ItemCountDemo.java` — the standard Java compiler; produces
  `ItemCountDemo.class` in the same directory. Success is silent.
- `java ItemCountDemo` — the standard Java launcher; runs the named
  class's `public static void main(String[])`.

### Run It — Real Output

Already shown in full above, under "Introduce the Concept in Isolation"
— the actual, unedited output of the two commands just listed, run this
session.

### Connecting Sentence

Every `position` value Lessons 1.2–1.4 received from `RecyclerView` is
guaranteed to satisfy `0 <= position < getItemCount()` — this method is
what makes that guarantee possible to give at all, and it's the last
piece needed for `InventoryAdapter` to be a complete, working adapter.

---

## Connect the Pieces

One trace, tying every lesson in this series together: the inventory
holds three items, so `getItemCount()` returns `3`. `RecyclerView` calls
`onCreateViewHolder` (Lesson 1.2) to build however many row-slots fit on
screen, then `onBindViewHolder` (Lesson 1.3) to fill each with real data,
using `.get(position)` against the same `items` field this method's own
`.size()` call reads. The user deletes one row: `items.remove(...)`
(Lesson 1.3) shrinks the real list, and the very next time anything asks
`getItemCount()`, it reports `2` — not because anything told it to, but
because `.size()` re-derives the answer from the list's own current,
real contents every single time.

## What Breaks Without This

`RecyclerView.Adapter<VH>` is an abstract class; `getItemCount` is one of
its three required abstract methods (alongside Lessons 1.2 and 1.3's).
Deleting it from a real project does not produce a subtly wrong app — it
produces a compile error, since `InventoryAdapter` would no longer
satisfy the contract it claims, via `extends`, to fulfill. There is no
softer failure mode to demonstrate here; the compiler itself is the
proof.

## Exercises

1. In a scratch copy of `ItemCountDemo.java`, call `.size()` a fourth
   time after adding two more items, and confirm the printed count
   reflects the new total — no code changes anywhere else needed.
2. Without looking back at Lessons 1.1–1.4, write out, in your own words,
   what real value `getItemCount()` would need to return for a list that
   currently holds zero items, and what you'd expect `RecyclerView` to
   show on screen in that case.

## Definition of Done

- [ ] You ran `ItemCountDemo.java` and can explain, from the real
      output, why the same `.size()` call reported three different
      numbers across the same program run.
- [ ] You can state, in one sentence, the full three-part contract
      `RecyclerView.Adapter` requires (create a slot, fill a slot,
      report a count) and name which lesson covered each part.
- [ ] `git commit` with a message explaining *why* you now fully
      understand `InventoryAdapter` — e.g. "Understand InventoryAdapter
      end to end: ViewHolder caching, position-safe click listeners,
      the Builder-pattern edit dialog, and a live item count," not "read
      InventoryAdapter.java."

This closes the five-lesson read of `InventoryAdapter` this prerequisites
series exists to give. `android-persistence-lab`'s own numbered lessons
pick up from here, making each of these pieces real: a real database
behind `items`, a real write behind `showEditQuantityDialog`'s save
button, and so on.
