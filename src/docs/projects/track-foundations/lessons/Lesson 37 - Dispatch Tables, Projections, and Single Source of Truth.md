# Lesson 37: Dispatch Tables, Projections, and Single Source of Truth

**What you will build:** Three disposable Java labs, same pattern as
earlier lessons in this series.

**What you need to know first:** Nothing beyond the Learner Baseline.

**Terms introduced in this lesson:**

- **Command dispatch table** — a fixed set of named actions, matched by
  an identifier and routed to their handler.
- **Projection over a dataset** — filtering or transforming a full
  in-memory collection down to a computed subset for display, without
  touching or mutating the underlying data source.
- **Single source of truth** — one place declares a piece of information
  and everything else reflects it, rather than each consumer maintaining
  and manually syncing its own copy.

---

## Concept Unit: Command Dispatch Table

### The Problem

Routing a request to the correct handler, based on some identifier,
appears constantly, in genuinely unrelated contexts — a menu system, a
message broker, a command-line tool's own subcommands. Recognizing this
as one recurring shape, rather than a new problem each time, is worth
naming explicitly.

### Introduce the Concept in Isolation

```
mkdir lesson-37
cd lesson-37
```

Create `Main.java`:

```java
public class Main {
    static void handleCommand(String command) {
        if (command.equals("SAVE")) {
            System.out.println("Saving...");
        } else if (command.equals("DELETE")) {
            System.out.println("Deleting...");
        } else if (command.equals("REFRESH")) {
            System.out.println("Refreshing...");
        } else {
            System.out.println("Unknown command: " + command);
        }
    }

    public static void main(String[] args) {
        handleCommand("SAVE");
        handleCommand("DELETE");
        handleCommand("EXPORT");
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
Saving...
Deleting...
Unknown command: EXPORT
```

`handleCommand` is a `command dispatch table` — **first appearance**: a
fixed set of named actions, matched by an identifier and routed to their
handler. Each `if`/`else if` branch matches one specific, named command
and routes to its own distinct handling — a shape that recurs in genuinely
unrelated systems, not specific to any one of them.

### Discard the Throwaway Example

This version is deleted now. It will not appear in the project again.

### Mechanical Walkthrough

1. `if (command.equals("SAVE")) { ... } else if (command
   .equals("DELETE")) { ... } else if (...) { ... } else { ... }` —
   genuinely basic conditional syntax, sorted **(c)** — the pattern
   worth naming is the overall shape, not any one individual branch.
2. `handleCommand("EXPORT")` — a command matching none of the known
   branches, falling through to the final `else` — proof the dispatch
   table has a defined behavior even for an unrecognized command, rather
   than silently doing nothing or crashing.

### CS Lens

A dispatch table maps a finite set of named identifiers to their own
distinct behavior — the same underlying shape whether written as
`if`/`else if` chains (as here), a `switch` statement, or a real
`Map<String, Runnable>` structure. Recognizing this shape on sight, in
whatever code it appears, is the actual point — a menu system's
`getItemId()` comparisons and this lesson's own `handleCommand` are the
same idea, encountered in two completely unrelated contexts.

Also recognized in: a command-line tool's own subcommand routing, an
HTTP router matching a URL path to its handler, a game's own input
handler matching a key press to an action, a state machine's own
transition table.

### SE Lens

The alternative — one large method handling every command's full logic
inline, with no clear per-command boundary at all — was not chosen
because a dispatch table's per-command branches (or map entries) keep
each command's own logic cleanly separated and independently
extendable — adding `"EXPORT"` support means adding one new branch (or
map entry), not restructuring the entire method.

---

## Concept Unit: Projection Over a Dataset

### The Problem

Showing a filtered or computed *view* of a full dataset — search results,
a sorted subset — should not require changing the underlying data itself;
the full dataset needs to remain intact and available, with the filtered
view computed fresh, on demand, from it.

### Introduce the Concept in Isolation

Replace `Main.java`'s contents:

```java
import java.util.ArrayList;
import java.util.List;

public class Main {
    static List<String> filterByPrefix(List<String> fullList, String prefix) {
        List<String> result = new ArrayList<>();
        for (String item : fullList) {
            if (item.startsWith(prefix)) {
                result.add(item);
            }
        }
        return result;
    }

    public static void main(String[] args) {
        List<String> allItems = new ArrayList<>();
        allItems.add("Widget");
        allItems.add("Wrench");
        allItems.add("Bolt");

        List<String> filtered = filterByPrefix(allItems, "W");

        System.out.println("Full list: " + allItems);
        System.out.println("Filtered: " + filtered);
    }
}
```

Compile and run it. Here is the real output:

```
Full list: [Widget, Wrench, Bolt]
Filtered: [Widget, Wrench]
```

#### Execution Trace

`filterByPrefix` loops over `fullList` once, deciding per element
whether it belongs in the new result:

1. `item = "Widget"` — `item.startsWith("W")` is `true`, because
   `"Widget"` genuinely begins with the character `"W"`, so
   `result.add(item)` runs, and `result` becomes `[Widget]`.
2. `item = "Wrench"` — `startsWith("W")` is `true` again, for the same
   reason, so `result` grows to `[Widget, Wrench]`.
3. `item = "Bolt"` — `startsWith("W")` is `false`, because `"Bolt"`
   begins with `"B"`, not `"W"`, so `result.add(item)` never runs on
   this iteration, and `result` stays `[Widget, Wrench]`, unchanged.

`fullList` itself is never written to at any point in this loop — only
read from — which is exactly what keeps the original data intact after
filtering.

`allItems`, the underlying data, is unchanged after filtering — `filtered`
is a genuinely separate, new `List`, computed from it. This is a
`projection over a dataset` — **first appearance**: filtering or
transforming a full in-memory collection down to a computed subset for
display, without touching or mutating the underlying data source.
`allItems` still holds all three items; `filtered` is a display-only view
computed on demand.

### Discard the Throwaway Example

This version is deleted now. It will not appear in the project again.

### Mechanical Walkthrough

1. `List<String> filterByPrefix(List<String> fullList, String prefix) {
   ... }` — **(b) reappearing** generics and `List` from Lesson 07,
   applied to a filtering operation.
2. `List<String> result = new ArrayList<>(); for (String item :
   fullList) { if (item.startsWith(prefix)) { result.add(item); } }` —
   **(a) first appearance** of this exact shape: builds a brand-new list,
   never modifying `fullList` at all — each element is only ever read
   from `fullList`, never removed from it.
3. `List<String> filtered = filterByPrefix(allItems, "W");` — `allItems`
   is passed in, read, but not mutated; `filtered` is the new, separate
   result.

### CS Lens

A projection computes a *derived view* — logically dependent on the
source data, but not the same storage, and not persisted back into it.
This is the identical underlying idea behind Lesson 21's own
`ReadableCounter`-style exposure, applied here to a whole collection
rather than one field: the original stays intact and authoritative; the
view is disposable and recomputed as needed.

Also recognized in: SQL `SELECT` queries with a `WHERE` clause (computing
a filtered view without modifying the underlying table), spreadsheet
filters (hiding rows without deleting the underlying data), search
results in virtually any application (a computed subset of a larger,
unchanged dataset).

### SE Lens

The alternative — actually removing non-matching items from `allItems`
itself to "filter" it — was not chosen because it would destroy data the
rest of the program might still need; a projection lets the same
underlying dataset serve many different, simultaneous views (a search
result here, a full list elsewhere) without any of them interfering with
each other or with the source.

---

## Concept Unit: Single Source of Truth

### The Problem

The same piece of information, duplicated across multiple places, risks
those copies drifting apart the moment only one of them is updated. Some
discipline is needed about which single place is authoritative, with
every other consumer reflecting it rather than maintaining an
independent copy.

### Introduce the Concept in Isolation

Replace `Main.java`'s contents:

```java
class Configuration {
    static String appName = "Pocket Inventory";
}

class TitleBar {
    void display() {
        System.out.println("Title: " + Configuration.appName);
    }
}

class AboutScreen {
    void display() {
        System.out.println("About: " + Configuration.appName);
    }
}

public class Main {
    public static void main(String[] args) {
        new TitleBar().display();
        new AboutScreen().display();
    }
}
```

Compile and run it. Here is the real output:

```
Title: Pocket Inventory
About: Pocket Inventory
```

Both `TitleBar` and `AboutScreen` read `Configuration.appName` — neither
holds its own separate copy of the app's name. This is a `single source
of truth` — **first appearance**: one place declares a piece of
information and everything else reflects it, rather than each consumer
maintaining and manually syncing its own copy. Changing
`Configuration.appName` once would be reflected correctly everywhere,
with no risk of one screen showing a stale, unsynced copy.

### Discard the Throwaway Example

This version is deleted now. It will not appear in the project again.

### Mechanical Walkthrough

1. `static String appName = "Pocket Inventory";` — **(b) reappearing**
   class-level state from Lesson 03, here specifically the one and only
   declaration of this particular piece of information.
2. `TitleBar` and `AboutScreen`, both reading `Configuration.appName`
   directly rather than each declaring their own `appName` field — **(a)
   first appearance** of this exact discipline: every consumer reflects
   the one shared declaration, never maintaining an independent copy
   that could drift.

### CS Lens

A single source of truth eliminates an entire category of bug by
construction: two independently-maintained copies of the same
information cannot drift apart if only one copy ever genuinely exists.
This is the same underlying discipline behind Lesson 07's own `Item`
class replacing three parallel, driftable lists with one bundled object
— applied here to configuration data rather than a data model.

Also recognized in: database normalization (storing each fact exactly
once, referenced rather than duplicated), a navigation system's own
destination declarations driving every screen's title and back behavior
consistently, environment variables read by every part of a system
rather than each part hardcoding its own copy.

### SE Lens

The alternative — `TitleBar` and `AboutScreen` each hardcoding their own
copy of `"Pocket Inventory"` — was not chosen because a future rename
would require finding and updating every single hardcoded copy, with a
real, easy-to-miss risk of leaving one stale. A single declaration,
referenced everywhere, means one edit is correct everywhere,
automatically.

---

## Connect the Pieces

`handleCommand`'s dispatch table routed a fixed set of named commands to
their own handlers — a shape recognizable across many unrelated systems.
`filterByPrefix` computed a projection — a derived, filtered view — from
`allItems`, without ever mutating the original list. `Configuration
.appName`, read by both `TitleBar` and `AboutScreen`, established a
single source of truth — one declaration, every consumer reflecting it.
Three genuinely different problems, each solved by recognizing and
applying a general, recurring shape rather than solving each one from
scratch.

## What Breaks Without This

Two independently-maintained copies of the same configuration value,
without a single source of truth:

```java
class TitleBar {
    static String appName = "Pocket Inventory";
}

class AboutScreen {
    static String appName = "Pocket Inventry"; // typo, drifted independently
}
```

produces a real, observable inconsistency: `TitleBar` and `AboutScreen`
now show genuinely different text for what should be the exact same
value, with no error or crash at all — just two silently diverged copies,
exactly the failure mode a single source of truth prevents by
construction.

## Exercises

1. Add a fourth command, `"EXPORT"`, to this lesson's own dispatch
   table, giving it real handling instead of falling through to the
   "Unknown command" branch.
2. Add a second projection function, `sortAlphabetically(List<String>
   fullList)`, returning a new, sorted list without mutating the
   original.
3. Add a second configuration value, `Configuration.appVersion`, read by
   both `TitleBar` and `AboutScreen`, following the same single-source
   discipline as `appName`.

## Definition of Done

- [ ] You ran all three of this lesson's examples and saw their real
      output.
- [ ] You completed Exercise 2 and confirmed the original list was
      unmutated after producing a sorted projection.
- [ ] You can state, without looking back at this lesson, why
      `filterByPrefix` returns a new `List` instead of modifying
      `fullList` directly.
