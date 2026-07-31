# Lesson 21c: Single Source of Truth

**What you will build:** A small, fully runnable, plain Java lab.

**What you need to know first:** Lesson 21b's projection over a dataset.

**Terms introduced in this lesson:**

- **Single source of truth** — one place declares a piece of information
  and everything else reflects it, rather than each consumer maintaining
  and manually syncing its own copy.

---

## Concept Unit: Single Source of Truth

### The Problem

The same piece of information, duplicated across multiple places, risks
those copies drifting apart the moment only one of them is updated. Some
discipline is needed about which single place is authoritative, with
every other consumer reflecting it rather than maintaining an
independent copy.

### Introduce the Concept in Isolation

```
mkdir lesson-21c
cd lesson-21c
```

Create `Main.java`:

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
   class-level state from Lesson 0i, here specifically the one and only
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
This is the same underlying discipline behind Lesson 7c's own `Item`
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

`Configuration.appName`, read by both `TitleBar` and `AboutScreen`,
established a single source of truth — one declaration, every consumer
reflecting it. The next lesson shows a real Android widget built on
exactly this same discipline, reading a navigation graph's own declared
data instead of per-screen hardcoded titles.

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

1. Add a second configuration value, `Configuration.appVersion`, read by
   both `TitleBar` and `AboutScreen`, following the same single-source
   discipline as `appName`.
2. Explain, in your own words, why the "What Breaks Without This" example
   produces no compiler error or crash, only a silent inconsistency.
3. Name one real value in an app you use daily that should have exactly
   one source of truth (a username, a total count, a setting).

## Definition of Done

- [ ] You ran the `TitleBar`/`AboutScreen` example and saw the real
      output.
- [ ] You completed Exercise 1.
- [ ] You can state, without looking back at this lesson, why a single
      source of truth prevents drift "by construction," not merely by
      discipline.
