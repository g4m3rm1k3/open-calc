# Lesson 10e: Incremental Update Notification

**What you will build:** A small, fully runnable, plain Java lab.

**What you need to know first:** Lesson 10c's asynchronous callback
result.

**Terms introduced in this lesson:**

- **Incremental update notification** — communicating precisely what
  changed (e.g. one inserted row) to an observer, rather than telling it
  to assume everything changed and recompute from scratch.

---

## Concept Unit: Incremental Update Notification

### The Problem

Reporting "something changed" to an interested observer, with no further
detail, forces that observer to assume everything might have changed and
recompute or redraw from scratch — wasteful when, in reality, only one
small piece actually changed.

### Introduce the Concept in Isolation

```
mkdir lesson-10e
cd lesson-10e
```

Create `Main.java`:

```java
interface ListObserver {
    void onItemInserted(int position, String value);
}

class ObservableList {
    private java.util.List<String> items = new java.util.ArrayList<>();
    private ListObserver observer;

    void setObserver(ListObserver observer) {
        this.observer = observer;
    }

    void add(String value) {
        items.add(value);
        observer.onItemInserted(items.size() - 1, value);
    }
}

public class Main {
    public static void main(String[] args) {
        ObservableList list = new ObservableList();
        list.setObserver((position, value) -> {
            System.out.println("Only position " + position + " changed: " + value);
        });

        list.add("first");
        list.add("second");
    }
}
```

Compile and run it. Here is the real output:

```
Only position 0 changed: first
Only position 1 changed: second
```

`onItemInserted(int position, String value)` tells the observer
*precisely* what changed — one specific position, one specific value —
rather than a bare "the list changed" with no detail. This is
`incremental update notification` — **first appearance**: communicating
precisely what changed (e.g. one inserted row) to an observer, rather
than telling it to assume everything changed and recompute from scratch.
A real UI observing this list could redraw exactly the one new row,
rather than redrawing the entire list on every single addition.

### Discard the Throwaway Example

This version is deleted now. It will not appear in the project again.

### Mechanical Walkthrough

1. `interface ListObserver { void onItemInserted(int position, String
   value); }` — **(b) reappearing** observer-style callback interface
   from Lesson 2b, carrying specific change data as parameters rather
   than firing with no detail at all.
2. `items.add(value); observer.onItemInserted(items.size() - 1,
   value);` — **(a) first appearance** of this exact precision: the
   notification fires with the *exact* position the new item landed at
   (`items.size() - 1`, the last index after adding), not a generic
   "something was added somewhere" signal.
3. `list.setObserver((position, value) -> { ... });` — **(b) reappearing**
   lambda-as-callback shape, registered once, invoked with precise
   per-change data on every subsequent `add`.

### CS Lens

Incremental notification trades a small amount of extra information at
notification time (which position, which value) for a dramatically
cheaper response: an observer that knows precisely what changed can
update precisely that piece, rather than treating every change as "redo
everything" — the exact idea `RecyclerView.Adapter` (Lesson 6h) relies
on to redraw only the one row that actually changed.

Also recognized in: fine-grained reactive UI frameworks generally
(updating exactly the DOM node that changed rather than re-rendering an
entire page), database change-data-capture systems (reporting exactly
which row changed, not "the table changed"), version control diffs
(reporting exactly which lines changed, not "the file changed").

### SE Lens

The alternative — a bare `onListChanged()` callback with no detail at
all — was not chosen because it forces every observer to assume the
worst and recompute or redraw everything on every single change, even
when only one small piece actually changed. The cost of incremental
notification is real: the notifying code must track and report precisely
what changed, slightly more bookkeeping than firing one generic signal —
a cost repaid many times over by every observer's own cheaper response.

---

## Connect the Pieces

Lessons 10a and 10b delivered Android's own Activity result, Lesson 10c
named the general asynchronous-callback shape behind it, and Lesson 10d
showed where a delivered value has to live to survive past its
originating method call. `ObservableList.onItemInserted` closes this
group of lessons out with the same registered-callback mechanism
carrying precise, incremental information, rather than a bare signal —
components reacting correctly to events they can't predict the timing or
exact content of in advance.

## What Breaks Without This

A bare "the list changed" signal, with no position or value attached,
forces every observer to redraw the entire list on every single
addition — exactly the wasteful full-refresh Lesson 6h's own
`RecyclerView.Adapter` exists to avoid.

## Exercises

1. Add a second callback, `onItemRemoved(int position)`, and a matching
   `remove` method, following the same incremental-notification shape
   as `add`.
2. Explain, in your own words, why `items.size() - 1` is the correct
   position to report after calling `items.add(value)`.
3. Explain, in your own words, why the extra bookkeeping incremental
   notification requires is worth the cost for a UI observing a large
   list.

## Definition of Done

- [ ] You ran the incremental-notification example and saw the real,
      precise per-position output.
- [ ] You completed Exercise 1.
- [ ] You can state, without looking back at this lesson, why a bare
      "something changed" signal forces a wasteful full redraw.
