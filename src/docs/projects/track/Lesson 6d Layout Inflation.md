# Lesson 6d: Layout Inflation

**What you will build:** No new code to compile — this reads real
Android code directly.

**What you need to know first:** Lesson 2g's XML, Lesson 3a's view
tree, Lesson 2k's generated `R` class.

**Terms introduced in this lesson:**

- **Layout inflation** — the process of turning an XML layout resource
  into real, constructed View objects at runtime.

---

## Concept Unit: Layout Inflation

### The Problem

A row's visual structure, declared as XML (Lesson 2g), exists only as
data until something turns it into real, constructed View objects —
`setContentView` does this automatically for a whole screen, but a
recycled row needs the identical process triggered by hand, one row
layout at a time.

### Introduce the Concept in Isolation

This is not a throwaway lab — it's real Android code, verified against
the actual framework source:

```java
View rowView = LayoutInflater.from(context).inflate(R.layout.item_row, parent, false);
```

This is `layout inflation` — **first appearance**: the process of
turning an XML layout resource into real, constructed View objects at
runtime. `R.layout.item_row` (Lesson 2k's own generated `R` class)
names the XML file describing one row's structure; `inflate(...)`
performs the actual construction, producing a real, usable `View` tree
(Lesson 3a) from that XML data.

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — this is real, verified
Android code.

### Mechanical Walkthrough

1. `LayoutInflater.from(context)` — **(a) first appearance**: obtains
   the real inflater object tied to this app's own environment
   (`Context`, Lesson 4h).
2. `inflate(R.layout.item_row, parent, false)` — **(a) first
   appearance**: reads the named layout resource and constructs real
   `View` objects from it, attaching them (or not, per the final
   `boolean`) to `parent`.

### CS Lens

Layout inflation is the same view-tree-from-XML idea `setContentView`
already performs for an entire screen, triggered manually here for one
row at a time — necessary because a `RecyclerView`'s rows are
constructed on demand, not all at once when the screen itself first
loads.

Also recognized in: templating engines generally (turning a template
plus data into real, rendered output), any "parse structure once,
instantiate many times" system.

### SE Lens

Layout inflation exists as a separate, explicit step (rather than
automatic, the way `setContentView` feels) specifically because a
`RecyclerView`'s rows are constructed lazily, on demand — the
inflation step must be triggered at the exact moment a new row is
actually needed, not once for the whole screen upfront.

---

## Connect the Pieces

Lesson 2g's XML and Lesson 3a's view tree established structure as
data. This lesson showed the real, on-demand mechanism turning that
data into real, constructed View objects, one row at a time.

## What Breaks Without This

Attempting to use a row's views before inflation has ever run — no
`View` objects exist yet, since inflation is what constructs them from
the XML data in the first place — there is nothing to `findViewById`
into until this step has actually happened.

## Exercises

1. Explain, in your own words, why layout inflation must happen
   before `findViewById` (Lesson 4j) can locate anything inside a row.
2. Explain, in your own words, why `RecyclerView` triggers inflation
   manually, per row, rather than once for the whole screen.
3. Compare layout inflation directly to `setContentView` — name one
   similarity and one difference.

## Definition of Done

- [ ] You read the real `LayoutInflater`/`inflate(...)` example and
      can explain what it constructs.
- [ ] You completed Exercise 1.
- [ ] You can state, without looking back at this lesson, why
      inflation is a separate, explicit step for `RecyclerView` rows.
