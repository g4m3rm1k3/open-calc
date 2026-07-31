# Lesson 19c: Navigation Graph

**What you will build:** No new code to compile — this reads real
Android code directly.

**What you need to know first:** Lesson 19b's Single-Activity
Architecture, Lesson 19a's directed graph.

**Terms introduced in this lesson:**

- **Navigation Graph** — one XML resource listing every screen
  destination and every legal path between them as data, read by a
  build-time plugin that generates a typed API replacing raw
  Intent-based navigation.

---

## Concept Unit: Navigation Graph

### The Problem

Single-Activity architecture (Lesson 19b) collapses every screen into
Fragments hosted by one Activity — but nothing yet declares, in one
place, exactly which Fragment can navigate to which other, or the
arguments each navigation carries; without that, the app's own directed
graph (Lesson 19a) of screens stays implicit, scattered across whichever
code triggers each navigation.

### Introduce the Concept in Isolation

This is not a throwaway lab — it's real Android code, verified against
the actual framework source:

```xml
<navigation xmlns:android="http://schemas.android.com/apk/res/android"
    app:startDestination="@id/itemListFragment">

    <fragment
        android:id="@+id/itemListFragment"
        android:name="com.example.inventory.InventoryListFragment">
        <action
            android:id="@+id/action_toDetail"
            app:destination="@id/itemDetailFragment" />
    </fragment>

    <fragment
        android:id="@+id/itemDetailFragment"
        android:name="com.example.inventory.ItemDetailFragment" />
</navigation>
```

This is the `Navigation Graph` — **first appearance**: one XML resource
listing every screen destination and every legal path between them as
data, read by a build-time plugin that generates a typed API replacing
raw Intent-based navigation. Each `<fragment>` (Lesson 18b) is one node
of Lesson 19a's own directed graph; each `<action>` is one directed edge
— `itemListFragment` can navigate `toDetail`, exactly the same shape
Lesson 19a's own `Main.java` modeled directly in code, now expressed as
real, declared XML data instead.

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — this is real, verified
Android code.

### Mechanical Walkthrough

1. `<navigation ... app:startDestination="@id/itemListFragment">` — **(a)
   first appearance**: names which node is the graph's own starting
   destination.
2. `<fragment android:id="@+id/itemListFragment" ...>` — **(b)
   reappearing** `Fragment` from Lesson 18b, now declared as one node of
   the navigation graph.
3. `<action android:id="@+id/action_toDetail"
   app:destination="@id/itemDetailFragment" />` — **(a) first
   appearance**: one directed edge — from `itemListFragment` to
   `itemDetailFragment` — declared as data, not hand-written in Java.

### CS Lens

The navigation graph is Lesson 19a's own directed graph, real and
load-bearing: destinations as nodes, actions as edges, declared once as
data rather than scattered across every Activity or Fragment that
happens to trigger a navigation.

Also recognized in: routing configuration in virtually every modern web
framework (React Router, Vue Router) — the same underlying "declare the
navigable graph as data, once" idea.

### SE Lens

The alternative — hand-built `Intent`s scattered across whichever screen
triggers each navigation — was not chosen going forward because nothing
then validates that the sending and receiving sides of any given
navigation actually agree; declaring the graph as one XML resource is
what the next lesson builds a compile-checked API from.

---

## Connect the Pieces

The navigation graph declares an app's own screen topology as real,
inspectable XML data — nodes as destinations, edges as actions. The next
lesson shows the compile-checked API generated directly from it.

## What Breaks Without This

Hand-built `Intent`s scattered across whichever screen triggers each
navigation leave nothing that validates that the sending and receiving
sides of a given navigation actually agree with each other.

## Exercises

1. Add a second `<action>` to `itemDetailFragment`, pointing back to
   `itemListFragment`, and explain what edge this adds to the underlying
   directed graph.
2. Explain, in your own words, why `app:startDestination` is required
   on the `<navigation>` element itself.
3. Explain, in your own words, why declaring the navigation graph as XML
   data, rather than in Java code, makes it easier to validate.

## Definition of Done

- [ ] You read the real navigation-graph XML and can explain what a node
      and an edge each correspond to.
- [ ] You completed Exercise 1.
- [ ] You can state, without looking back at this lesson, why the
      navigation graph is described as "Lesson 19a's directed graph,
      real and load-bearing."
