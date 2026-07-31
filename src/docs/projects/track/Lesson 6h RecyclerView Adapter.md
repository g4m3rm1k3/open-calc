# Lesson 6h: `RecyclerView.Adapter`

**What you will build:** No new code to compile — this reads real
Android code directly.

**What you need to know first:** Lesson 6f's `ViewHolder`, Lesson 6c's
view recycling, Lesson 6d's layout inflation, Lesson 0u's generics.

**Terms introduced in this lesson:**

- **`RecyclerView.Adapter`** — an object bridging a data list to a
  bounded number of reusable row views — responsible for creating
  holders, binding data into them, and reporting the total item count.

---

## Concept Unit: `RecyclerView.Adapter`

### The Problem

Nothing yet connects real data to the recycled row views built up
through the last several lessons — some collaborator is needed that
creates `ViewHolder`s, binds real data into them, and reports how many
total items exist.

### Introduce the Concept in Isolation

This is not a throwaway lab — it's real Android code, verified against
the actual framework source:

```java
class ItemAdapter extends RecyclerView.Adapter<ItemAdapter.ItemViewHolder> {
    private List<String> items;

    @Override
    public ItemViewHolder onCreateViewHolder(ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext())
            .inflate(R.layout.item_row, parent, false);
        return new ItemViewHolder(view);
    }

    @Override
    public void onBindViewHolder(ItemViewHolder holder, int position) {
        holder.nameLabel.setText(items.get(position));
    }

    @Override
    public int getItemCount() {
        return items.size();
    }

    static class ItemViewHolder extends RecyclerView.ViewHolder {
        TextView nameLabel;

        ItemViewHolder(View itemView) {
            super(itemView);
            nameLabel = itemView.findViewById(R.id.nameLabel);
        }
    }
}
```

This is `RecyclerView.Adapter` — **first appearance**: an object
bridging a data list to a bounded number of reusable row views —
responsible for creating holders, binding data into them, and
reporting the total item count. `onCreateViewHolder` runs layout
inflation and constructs a new `ItemViewHolder` — only when the
recycled pool (Lesson 6c's own view-recycling concept) doesn't already
have a spare one available. `onBindViewHolder` refills an existing,
recycled holder's cached views with new data, every time a row scrolls
into view — the actual moment recycling happens.

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — this is real, verified
Android code.

### Mechanical Walkthrough

1. `class ItemAdapter extends RecyclerView.Adapter<ItemAdapter
   .ItemViewHolder>` — **(b) reappearing** generics (Lesson 0u) and
   inheritance, the generic type parameter naming exactly which
   `ViewHolder` subtype this Adapter produces.
2. `onCreateViewHolder(...)` — **(b) reappearing** layout inflation
   from Lesson 6d, called only when a genuinely new holder is needed,
   not on every scroll frame.
3. `onBindViewHolder(...)` — **(a) first appearance** of the actual
   recycling moment: called far more often than `onCreateViewHolder`,
   refilling an already-existing holder's cached views with whichever
   data item now belongs in this row position.
4. `getItemCount()` — **(a) first appearance**: reports the total
   number of data items, letting the RecyclerView know how far
   scrolling can go.

### CS Lens

`RecyclerView.Adapter` combines several earlier lessons' own concepts:
`onCreateViewHolder` triggers lazy construction and layout inflation
only as needed; the resulting `ViewHolder` caches its `findViewById`
lookups once; `onBindViewHolder` is where recycling's actual reuse
happens, refilling cached views with new data on every scroll.

Also recognized in: any "virtualized list" implementation across
other UI frameworks (web frameworks rendering only visible rows of a
large list, recycling DOM nodes the same way) — the identical
performance problem, solved the identical way, outside Android
entirely.

### SE Lens

Splitting `onCreateViewHolder` (rare, expensive) from
`onBindViewHolder` (frequent, cheap) is a deliberate design that
concentrates the truly expensive work (inflation, `findViewById`) into
the rare case, keeping the frequent case — refilling already-cached
views — as cheap as possible.

---

## Connect the Pieces

Every earlier lesson in this arc converges here: lazy construction
(Lesson 6a), caching (Lesson 6b), a bounded reused pool (Lesson 6c),
inflation (Lesson 6d), and `ViewHolder` itself (Lesson 6f) all combine
inside `RecyclerView.Adapter`. The next lesson
(`RecyclerView.LayoutManager`) shows the separate, swappable
collaborator handling everything `Adapter` deliberately does not:
spatial arrangement.

## What Breaks Without This

Calling `findViewById` fresh inside `onBindViewHolder`, instead of
relying on `ViewHolder`'s own cached fields, would repeat real,
measurable tree-search work on every single scroll frame — exactly
the overhead splitting `onCreateViewHolder` from `onBindViewHolder`
was designed to avoid.

## Exercises

1. Explain, in your own words, why `onBindViewHolder` is called far
   more often than `onCreateViewHolder` during real scrolling.
2. Add a second field to `items` (imagine a `List<Item>` instead of
   `List<String>`) and update `onBindViewHolder` to bind a second
   piece of data.
3. Explain, in your own words, what `getItemCount()` is used for by
   the `RecyclerView` itself.

## Definition of Done

- [ ] You read the real `RecyclerView.Adapter` example and can explain
      what each of its three overridden methods is responsible for.
- [ ] You completed Exercise 1.
- [ ] You can state, without looking back at this lesson, why
      `findViewById` is called inside `ItemViewHolder`'s constructor
      rather than inside `onBindViewHolder`.
