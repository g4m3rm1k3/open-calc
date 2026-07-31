# Lesson 19a: Directed Graph

**What you will build:** A small, fully runnable, plain Java lab.

**What you need to know first:** Nothing beyond the Learner Baseline.

**Terms introduced in this lesson:**

- **Directed graph** — a data structure of nodes and directed edges
  between them — the same shape used to model state machines, sitemaps,
  and finite automata.

---

## Concept Unit: Directed Graph

### The Problem

An app's own screens and the legal navigations between them (this screen
can go to that one; that one cannot necessarily go back the same way)
has a real, specific mathematical shape — modeling it correctly requires
naming that shape precisely, rather than treating it as an unstructured
list of Activities and Intents.

### Introduce the Concept in Isolation

```
mkdir lesson-19a
cd lesson-19a
```

Create `Main.java`:

```java
import java.util.List;
import java.util.Map;

public class Main {
    public static void main(String[] args) {
        Map<String, List<String>> edges = Map.of(
            "ItemList", List.of("ItemDetail", "AddItem"),
            "ItemDetail", List.of("EditItem"),
            "AddItem", List.of(),
            "EditItem", List.of("ItemDetail")
        );

        System.out.println("Can ItemList reach AddItem? " + edges.get("ItemList").contains("AddItem"));
        System.out.println("Can AddItem reach ItemList? " + edges.get("AddItem").contains("ItemList"));
    }
}
```

Compile and run it:

```
javac Main.java
java Main
```

Here is the real output:

```
Can ItemList reach AddItem? true
Can AddItem reach ItemList? false
```

An edge from `"ItemList"` to `"AddItem"` exists, but no edge back from
`"AddItem"` to `"ItemList"` exists in this same map. This is a `directed
graph` — **first appearance**: a data structure of nodes and directed
edges between them — the same shape used to model state machines,
sitemaps, and finite automata. `edges` models exactly this: each
screen's own outgoing navigations, with no assumption that a path back
exists just because a path forward does.

### Discard the Throwaway Example

This version is deleted now. It will not appear in the project again.

### Mechanical Walkthrough

1. `Map<String, List<String>> edges` — **(a) first appearance**: each key
   is a node (a screen); each value is the list of nodes it has a
   directed edge *to*.
2. `edges.get("ItemList").contains("AddItem")` — **(a) first
   appearance**: checks for a direct, one-directional edge from
   `"ItemList"` to `"AddItem"` — present, so `true`.
3. `edges.get("AddItem").contains("ItemList")` — checks the *reverse*
   edge — `"AddItem"`'s own outgoing list is empty, so `false`; the graph
   is genuinely directed, not automatically symmetric.

### CS Lens

A directed graph is the exact, precise mathematical structure an app's
own screen topology has: destinations as nodes, legal navigations as
one-directional edges. Naming it this way, rather than as an ad hoc
collection of Activities and Intents, is what makes it possible to
represent, validate, and generate code from as data — the subject of a
later lesson in this group.

Also recognized in: directed graphs across virtually every domain
modeling one-directional relationships (dependency graphs, state
machines, web page link structures).

### SE Lens

The alternative — leaving an app's own screen topology implicit,
scattered across whichever Activities happen to call `startActivity` on
each other — was not chosen going forward because nothing then represents
the topology as one inspectable, validated structure; naming it a
directed graph is the first step toward representing it as real,
declared data instead.

---

## Connect the Pieces

`edges` models an app's own screen topology as a precise directed graph
— nodes for screens, one-directional edges for legal navigations. The
next lesson shows a different architectural shift this shape makes
possible.

## What Breaks Without This

Leaving an app's own screen topology implicit, scattered across whichever
Activities happen to call `startActivity` on each other, leaves nothing
to represent, validate, or generate code from as one inspectable
structure.

## Exercises

1. Add a `"ItemDetail"` to `"ItemList"` edge to this lesson's own example
   and confirm `edges.get("ItemDetail").contains("ItemList")` now returns
   `true`.
2. Explain, in your own words, why a directed graph is a more precise
   model for screen navigation than an undirected one.
3. Draw, on paper, the directed graph `edges` represents, with an arrow
   for each one-directional edge.

## Definition of Done

- [ ] You ran the directed-graph example and can explain why
      `"AddItem"` cannot reach `"ItemList"`.
- [ ] You completed Exercise 1.
- [ ] You can state, without looking back at this lesson, what makes a
      graph "directed" rather than merely a graph.
