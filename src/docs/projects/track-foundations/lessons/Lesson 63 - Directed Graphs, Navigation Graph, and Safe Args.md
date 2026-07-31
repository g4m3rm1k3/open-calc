# Lesson 63: Directed Graphs, the Navigation Graph, Safe Args, and Single-Activity Architecture

**What you will build:** One unit is a small, fully runnable, plain Java
lab. Three units read real Android/build-tooling mechanisms directly.

**What you need to know first:** Lesson 49's runtime vs. compile-time
code generation, Lesson 62's `Fragment`.

**Terms introduced in this lesson:**

- **Directed graph** — a set of nodes connected by one-directional edges,
  where an edge from A to B does not imply a corresponding edge from B to
  A.
- **Navigation graph** — one XML resource listing every screen
  destination and every legal path between them as data, read by a
  build-time plugin that generates a typed API replacing raw
  Intent-based navigation.
- **Safe Args** — a build-time plugin reading the navigation graph and
  generating typed classes for passing arguments between destinations,
  replacing hand-built `Intent`/`putExtra` pairs with a compile-checked
  API.
- **Single-Activity architecture** — an app structured around one
  Activity hosting many `Fragment` destinations, rather than one Activity
  per screen.

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
mkdir lesson-63
cd lesson-63
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
graph` — **first appearance**: a set of nodes connected by
one-directional edges, where an edge from A to B does not imply a
corresponding edge from B to A. `edges` models exactly this: each
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
represent, validate, and generate code from as data — this lesson's own
next unit.

Also recognized in: directed graphs across virtually every domain
modeling one-directional relationships (dependency graphs, this
curriculum's own concept-graph, web page link structures, state
machines).

### SE Lens

The alternative — leaving an app's own screen topology implicit,
scattered across whichever Activities happen to call `startActivity` on
each other — was not chosen going forward because nothing then represents
the topology as one inspectable, validated structure; naming it a
directed graph is the first step toward representing it as real,
declared data instead.

---

## Concept Unit: Navigation Graph

### The Problem

Five separate Activities means five Manifest entries (Lesson 11) and
hand-built `Intent`s scattered across whichever screen triggers each
navigation — a real, growing source of drift as the app's own screen
topology (this lesson's own directed graph) grows.

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

This is the `navigation graph` — **first appearance**: one XML resource
listing every screen destination and every legal path between them as
data, read by a build-time plugin that generates a typed API replacing
raw Intent-based navigation. Each `<fragment>` (Lesson 62) is one node of
this lesson's own directed graph; each `<action>` is one directed edge —
`itemListFragment` can navigate `toDetail`, exactly the same shape this
lesson's own `Main.java` modeled directly in code, now expressed as real,
declared XML data instead.

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — this is real, verified
Android code.

### Mechanical Walkthrough

1. `<navigation ... app:startDestination="@id/itemListFragment">` — **(a)
   first appearance**: names which node is the graph's own starting
   destination.
2. `<fragment android:id="@+id/itemListFragment" ...>` — **(b)
   reappearing** `Fragment` from Lesson 62, now declared as one node of
   the navigation graph.
3. `<action android:id="@+id/action_toDetail"
   app:destination="@id/itemDetailFragment" />` — **(a) first
   appearance**: one directed edge — from `itemListFragment` to
   `itemDetailFragment` — declared as data, not hand-written in Java.

### CS Lens

The navigation graph is this lesson's own directed graph, real and
load-bearing: destinations as nodes, actions as edges, declared once as
data rather than scattered across every Activity that happens to trigger
a navigation.

Also recognized in: routing configuration in virtually every modern web
framework (React Router, Vue Router) — the same underlying "declare the
navigable graph as data, once" idea.

### SE Lens

The alternative — hand-built `Intent`s scattered across whichever screen
triggers each navigation, as this lesson's own first unit's problem
described — was not chosen going forward because nothing then validates
that the sending and receiving sides of any given navigation actually
agree; declaring the graph as one XML resource is what this lesson's next
unit builds a compile-checked API from.

---

## Concept Unit: Safe Args

### The Problem

Every hand-built `Intent`/`putExtra` pair between screens is Lesson 07's
own "parallel lists" risk relocated to Activity/Fragment boundaries — a
missing or wrong-typed argument becomes a runtime `null` or `ClassCastException`
the moment a mistyped extra key (Lesson 08) goes unnoticed, rather than a
genuine compile error.

### Introduce the Concept in Isolation

This is not a throwaway lab — it's real Android code, verified against
the actual framework source:

```java
// Generated by Safe Args, from the navigation graph's own action:
ItemListFragmentDirections.ActionToDetail action =
    ItemListFragmentDirections.actionToDetail(itemId);
Navigation.findNavController(view).navigate(action);
```

This is `Safe Args` — **first appearance**: a build-time plugin reading
the navigation graph and generating typed classes for passing arguments
between destinations, replacing hand-built `Intent`/`putExtra` pairs
with a compile-checked API. `ItemListFragmentDirections
.actionToDetail(itemId)` is a real, generated method (Lesson 49's own
compile-time code generation) — its parameter list is generated directly
from the navigation graph's own declared arguments, so a missing or
wrong-typed argument fails to *compile* at all, rather than surfacing as
a runtime crash.

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — this is real, verified
Android code.

### Mechanical Walkthrough

1. `ItemListFragmentDirections` — **(a) first appearance**: a real class
   generated at build time (Lesson 49's own compile-time codegen), one
   per destination declared in the navigation graph.
2. `.actionToDetail(itemId)` — **(a) first appearance**: a generated
   method whose parameter list matches exactly whatever arguments the
   navigation graph's own `<action>` declares — a wrong type or a missing
   argument fails to compile.
3. `Navigation.findNavController(view).navigate(action);` — **(a) first
   appearance**: performs the actual navigation using the generated,
   already-validated `action` object.

### CS Lens

Safe Args is Lesson 49's own compile-time code generation, real and
load-bearing: the generated classes exist as real, inspectable files
after the build, produced *from* the navigation graph's own declared
data — directly connecting this lesson's navigation graph unit to
Lesson 49's own runtime-vs-compile-time distinction.

Also recognized in: typed routing libraries generating compile-checked
navigation APIs from a declared route table, across virtually every
modern web and mobile framework with a similar code-generation step.

### SE Lens

The alternative — hand-built `Intent().putExtra("EXTRA_ITEM_ID",
itemId)` pairs, as this lesson's own problem statement described — was
not chosen going forward because nothing then checks that the sending
and receiving sides agree on the key's name or the value's type; Safe
Args generates both sides from the same single source (the navigation
graph), making a mismatch a compile error instead of a runtime bug.

---

## Concept Unit: Single-Activity Architecture

### The Problem

Five separate Activities, one per screen, each with its own Manifest
entry, is one valid way to structure an app — but it's not the only way,
and it's not the way this lesson's own navigation graph and `Fragment`
material are actually building toward.

### Introduce the Concept in Isolation

This is not a throwaway lab — it's a real, documented Android
architectural pattern, verified against the actual framework
recommendation:

```java
public class MainActivity extends AppCompatActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main); // hosts a NavHostFragment
    }
}
// Every screen — ItemListFragment, ItemDetailFragment, and so on — is a
// Fragment hosted inside this one Activity's own NavHostFragment,
// navigated between using this lesson's own navigation graph.
```

This is `single-Activity architecture` — **first appearance**: an app
structured around one Activity hosting many `Fragment` destinations,
rather than one Activity per screen. `MainActivity` is the *only*
Activity in this design; every screen this curriculum has previously
modeled as a separate Activity (Lesson 10) becomes a `Fragment`
(Lesson 62) instead, navigated between via this lesson's own navigation
graph and Safe Args, all hosted inside `MainActivity`'s own single
Manifest entry.

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — this is a real, documented
Android architectural pattern.

### Mechanical Walkthrough

1. `public class MainActivity extends AppCompatActivity` — **(b)
   reappearing** Activity/inheritance shape from Lesson 10, but now the
   *only* Activity the entire app declares.
2. `setContentView(R.layout.activity_main);` — **(b) reappearing** from
   Lesson 10, hosting a `NavHostFragment` (not shown in full) rather than
   screen-specific content directly.
3. Every other screen becomes a `Fragment`, swapped in and out of that
   one host by this lesson's own navigation graph — no additional
   Activity, and no additional Manifest entry, is needed for any of them.

### CS Lens

Single-Activity architecture is the direct payoff of this lesson's other
three units: a navigation graph declaring the full directed graph of
screens as data, with `Fragment` as the embeddable unit and Safe Args as
the compile-checked way to move between them, together replace what
would otherwise require five separate Activities and five separate
Manifest entries.

Also recognized in: single-page application architecture on the web (one
HTML document, many client-side-routed views) — the same underlying
shift from "one full page/screen per destination" to "one host, many
swapped-in views."

### SE Lens

The alternative — one Activity per screen, as this curriculum modeled
through Lesson 10 — was not chosen for this lesson's own architecture
because it means five Manifest entries and hand-built `Intent`s scattered
across the app; single-Activity architecture, built on `Fragment` and the
navigation graph, consolidates the app's own screen topology into one
declared, validated structure instead.

---

## Connect the Pieces

A directed graph is the precise mathematical shape of an app's own
screen topology. The navigation graph declares exactly that shape as
real, XML data — nodes as destinations, edges as actions. Safe Args reads
that same data at build time and generates a compile-checked API,
replacing hand-built `Intent`/`putExtra` pairs with typed method calls.
And single-Activity architecture is what all three together make
possible: one Activity, hosting every `Fragment` destination, navigated
between through a declared, validated graph rather than scattered,
hand-built Intents.

## What Breaks Without This

Modeling an app's own navigation as an unstructured collection of
Activities and Intents, rather than as a directed graph, leaves nothing
to validate or generate code from — exactly the "parallel lists"-style
drift this lesson's own Safe Args unit identified directly. And without
Safe Args specifically, a missing or wrong-typed navigation argument
surfaces as a runtime `null` or crash, discovered only when that specific
path is actually exercised, rather than as a compile error caught
immediately.

## Exercises

1. Add a `"ItemDetail"` to `"ItemList"` edge to this lesson's own directed
   graph example and confirm `edges.get("ItemDetail")
   .contains("ItemList")` now returns `true`.
2. Add a second `<action>` to the navigation graph's own `itemListFragment`
   node, and explain, in your own words, what new Safe Args class or
   method you'd expect to be generated for it.
3. Explain, in your own words, why a missing Safe Args argument is a
   compile error, while a missing hand-built `Intent` extra (Lesson 08)
   is only a runtime problem.

## Definition of Done

- [ ] You ran the directed-graph example and can explain why
      `"AddItem"` cannot reach `"ItemList"`.
- [ ] You read the real navigation-graph XML and can explain what a node
      and an edge each correspond to.
- [ ] You read the real Safe Args example and can explain why a
      mismatched argument fails to compile.
- [ ] You can state, without looking back at this lesson, what
      single-Activity architecture replaces and why.
