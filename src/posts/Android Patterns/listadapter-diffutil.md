# Updating Only What Changed: ListAdapter and DiffUtil

**What problem this solves.** When a list's underlying data changes —
items added, removed, reordered, or modified — naively telling the UI
"just redraw everything from scratch" wastes work: every visible row
gets rebound even if only one item anywhere actually changed, and any
useful in-progress UI state (a running animation, exact scroll
position) gets discarded along with it. What's actually needed is a
precise description of exactly what changed between the old data and
the new data — which items were added, removed, moved, or altered — so
the UI can update, and animate, only what's genuinely different.

**Classic pattern family.** Not a single clean Gang-of-Four fit —
closest to **Strategy**: the actual comparison logic (how an old item
and a new item are judged "the same" or "changed") is itself a
pluggable, swappable object supplied by the app, while a real, specific
algorithm underneath — a variant of the classic diffing algorithm used
by tools like `diff` and `git` — does the actual comparison work. Worth
treating as Android's own applied combination, not a single classic
pattern name.

**Where you'll meet it in Android.**
`androidx.recyclerview.widget.ListAdapter<T, VH>` (extends
`RecyclerView.Adapter<VH>`), `androidx.recyclerview.widget.DiffUtil.ItemCallback<T>`,
and `ListAdapter.submitList(List<T>)`.

**Terms used in this pattern.**

- **Generic type with two parameters** — `ListAdapter<T, VH>` fills in
  two independent placeholders: `T` for the kind of data item, `VH` for
  the kind of `ViewHolder`. It exists so `ListAdapter`'s own methods —
  like reading the current item at a position — can return the real
  item type directly, instead of a generic `Object`.
- **`super(...)` with an argument** — a call, as a subclass
  constructor's first statement, to the parent class's own constructor,
  here explicitly supplying required configuration the parent needs.
  It exists because `ListAdapter` provides no no-argument constructor
  at all — a subclass is required to supply a comparison strategy
  immediately, or the code doesn't compile.

**Objects and methods used.**

- **`DiffUtil.ItemCallback<T>`**
  *What it is:* an abstract class defining the contract for comparing
  two items of the same type.
  *Implementation:* `public abstract static class ItemCallback<T>`,
  declaring the abstract methods below.
  *Its use:* the pluggable comparison strategy `DiffUtil`'s own
  algorithm calls, supplied by the app, since only the app knows what
  "the same contact" and "a changed contact" actually mean for its own
  data.
- **`areItemsTheSame(T oldItem, T newItem)`**
  *What it is:* an abstract method on `ItemCallback`, returning
  `boolean`.
  *Implementation:* `public abstract boolean areItemsTheSame(@NonNull T
  oldItem, @NonNull T newItem)`.
  *Its use:* answers "are these two objects the same underlying
  real-world entity," independent of whether any of its fields have
  changed — typically an identity or ID comparison, not a full field
  comparison.
- **`areContentsTheSame(T oldItem, T newItem)`**
  *What it is:* an abstract method on `ItemCallback`, returning
  `boolean`.
  *Implementation:* `public abstract boolean areContentsTheSame(@NonNull
  T oldItem, @NonNull T newItem)`.
  *Its use:* only ever called for a pair already confirmed to be the
  same item by `areItemsTheSame` — answers whether its visible content
  has actually changed, which determines whether this specific row
  needs to be rebound at all.
- **`ListAdapter<T, VH extends RecyclerView.ViewHolder>`**
  *What it is:* an abstract class extending `RecyclerView.Adapter<VH>`.
  *Implementation:* `public abstract class ListAdapter<T, VH extends
  RecyclerView.ViewHolder> extends RecyclerView.Adapter<VH>`, with a
  constructor requiring a `DiffUtil.ItemCallback<T>` and a method
  `getItem(int position)` returning `T`.
  *Its use:* an alternative base class to plain `RecyclerView.Adapter`
  that manages the actual list of items internally, using the supplied
  comparison strategy to compute exactly what changed whenever a new
  list is submitted.
- **`ListAdapter.getItem(int position)`**
  *What it is:* an instance method on `ListAdapter`, returning `T`.
  *Implementation:* `public T getItem(int position)`.
  *Its use:* reads the current item at a given position from the list
  `ListAdapter` itself now internally holds — the subclass no longer
  needs its own separate field to store the data.
- **`ListAdapter.submitList(List<T> list)`**
  *What it is:* an instance method on `ListAdapter`, returning `void`.
  *Implementation:* `public void submitList(@Nullable List<T> list)`.
  *Its use:* the single entry point for handing the adapter a new
  version of the data — internally triggers the diff computation
  against whatever list was previously held, then dispatches only the
  specific, precise change notifications the result implies.

---

## The Shape

Four participants:

- **`ContactDiffCallback`** — the app-supplied comparison strategy.
- **`ContactAdapter extends ListAdapter<Contact, ContactViewHolder>`**
  — the star, replacing a plain `RecyclerView.Adapter`.
- **`ListAdapter`'s own internal machinery** (not subclassed further) —
  does the real diff computation and dispatch, invisible to the app.
- **`RecyclerView` itself** — receives the same fine-grained
  insert/remove/move/change notifications it would have received if the
  app had called them by hand, except now computed automatically.

The relationship: the app never calls `notifyDataSetChanged()` or any
of its more precise siblings directly anymore — the entire
responsibility for figuring out exactly what changed, and issuing the
exact right sequence of fine-grained notifications, moves entirely
inside `ListAdapter`, driven only by the comparison strategy the app
supplies. The app's only remaining job is calling `submitList(...)`
with the new full list, and answering the two yes/no questions the
callback poses about any two items it's asked to compare.

```
   app code
        |
        |  adapter.submitList(newList)
        v
   ListAdapter  (internal machinery)
        |
        |  compares held list vs newList using:
        v
   ContactDiffCallback.areItemsTheSame(...) / .areContentsTheSame(...)
        |
        |  computes the precise diff, then dispatches exactly the
        |  right notifyItemInserted/Removed/Moved/Changed calls
        v
   RecyclerView  (animates only what actually changed)
```

---

## Mechanical Walkthrough

```java
public class ContactDiffCallback extends DiffUtil.ItemCallback<Contact> {

    @Override
    public boolean areItemsTheSame(@NonNull Contact oldItem, @NonNull Contact newItem) {
        return oldItem.getId() == newItem.getId();
    }

    @Override
    public boolean areContentsTheSame(@NonNull Contact oldItem, @NonNull Contact newItem) {
        return oldItem.equals(newItem);
    }
}
```

- **`class ContactDiffCallback extends DiffUtil.ItemCallback<Contact>`**
  — fixes the generic type to `Contact`, letting both methods below
  accept and compare real `Contact` objects directly.
- **`oldItem.getId() == newItem.getId()`** — the identity check: two
  `Contact` objects are "the same item" if they share a stable ID,
  regardless of whether any other field differs between them.
- **`oldItem.equals(newItem)`** — the content check, relying on
  `Contact`'s own `equals` (an ordinary method every Java object has,
  commonly overridden to mean "these represent the same data") to
  decide whether anything visible has actually changed — called only
  for pairs `areItemsTheSame` already confirmed are the same item.

This callback is handed to a `ListAdapter` subclass through its
required constructor call:

```java
public class ContactAdapter extends ListAdapter<Contact, ContactViewHolder> {

    public ContactAdapter() {
        super(new ContactDiffCallback());
    }

    @NonNull
    @Override
    public ContactViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View row = LayoutInflater.from(parent.getContext())
                .inflate(R.layout.row_contact, parent, false);
        return new ContactViewHolder(row);
    }

    @Override
    public void onBindViewHolder(@NonNull ContactViewHolder holder, int position) {
        Contact contact = getItem(position);
        holder.nameLabel.setText(contact.getName());
    }
}
```

- **`class ContactAdapter extends ListAdapter<Contact, ContactViewHolder>`**
  — fixes both generic parameters: `Contact` for the item type,
  `ContactViewHolder` for the row-holder type.
- **`super(new ContactDiffCallback());`** — the mandatory first
  statement, handing the parent class the comparison strategy it
  requires; from this point on, this adapter's diffing behavior is
  entirely determined by what `ContactDiffCallback` decides.
- **`onCreateViewHolder(...)`** — identical in role to the plain
  `RecyclerView.Adapter` version: builds a new row only when nothing
  reusable exists, unaffected by anything `ListAdapter` adds.
- **`Contact contact = getItem(position);`** — the one real difference
  from a plain `Adapter`'s `onBindViewHolder`: the data is read through
  `ListAdapter`'s own `getItem`, not a field this subclass manages
  itself.
- **`holder.nameLabel.setText(contact.getName());`** — writes the
  current item's data into the row, exactly as in a plain `Adapter`.

Submitting new data, from wherever the app's data actually changes:

```java
adapter.submitList(newContactList);
```

- **`adapter.submitList(newContactList);`** — the single call that
  replaces every hand-written `notifyItemInserted`/`Removed`/`Changed`
  call an app using a plain `RecyclerView.Adapter` would otherwise have
  to write and keep correct by hand.

---

## Collaboration — how it actually runs

1. The app constructs `ContactAdapter`; its constructor immediately
   calls `super(new ContactDiffCallback())` — from this point on,
   `ListAdapter`'s internal machinery holds an empty list and a
   reference to this comparison strategy.
2. The app calls `adapter.submitList(newContactList)` whenever it has
   an updated version of the data — this call does not block; the
   actual diff computation runs on a background thread pool
   `ListAdapter` manages internally, with results delivered back on the
   main thread.
3. Internally, `ListAdapter` compares its currently held list against
   `newContactList`, calling `areItemsTheSame(...)` to line up which
   old items correspond to which new ones, then `areContentsTheSame(...)`
   only for pairs already confirmed to be the same item.
4. Based on that comparison, `ListAdapter` computes the precise,
   minimal sequence of insert/remove/move/change operations that would
   turn the old list into the new one, and calls the corresponding
   fine-grained notify methods on itself automatically — the app never
   calls any of them by hand.
5. `onBindViewHolder(holder, position)` is called by `RecyclerView`
   only for positions the diff determined actually need rebinding,
   reading the current item via `getItem(position)`.

---

## Why It's Shaped This Way

The design principle is **computing and applying the minimal, precise
set of changes** instead of assuming the whole list changed, so
`RecyclerView` can animate exactly what's different and skip rebinding
rows that didn't actually change.

The alternative not chosen: calling `notifyDataSetChanged()` whenever
anything about the list changes, telling `RecyclerView` to assume
everything is different and rebuild all visible rows. The real cost: no
precise animations are possible — `RecyclerView` has no idea what
specifically changed, so it can't animate one specific row's removal or
move, only redraw everything in place — and every visible row gets
rebound even if only one item anywhere in the list actually changed.

The cost this pattern itself carries: the diff computation is real
work, scaling with how large the old and new lists are and how
different they turn out to be — for a list that changes completely,
wholesale, on every update, the diffing overhead may cost more than it
saves. And `areItemsTheSame`/`areContentsTheSame` have to be written
correctly, a genuinely common source of subtle bugs, or the whole
comparison produces wrong, misleading animations.

---

## Recognizing It Elsewhere

Also recognized in: `git`'s own diff algorithm, comparing two versions
of a text file and reporting only the specific lines that changed
rather than treating the whole file as replaced; React's virtual-DOM
reconciliation, comparing a new rendered tree against the previous one
and applying only the minimal real DOM changes needed; a spreadsheet's
"track changes" feature, highlighting exactly which cells differ
between two versions rather than marking the entire sheet as modified;
`rsync`'s file-transfer algorithm, sending only the parts of a file
that actually changed rather than the whole file every time.

---

## Where This Actually Breaks

The most common real mistake: implementing `areItemsTheSame` using full
object equality, or even reference equality, instead of comparing a
stable identity field like an ID. Since `areItemsTheSame` is meant to
answer "is this conceptually the same real-world item," using
full-content comparison here means any item whose content changed gets
reported as a completely different item rather than the same item with
different contents — `DiffUtil` then reports one remove plus one
insert instead of one change, producing a visibly wrong animation (the
row appears to vanish and a new one appears in its place, rather than
the row's own content simply updating) even though the underlying data
change was perfectly ordinary.
