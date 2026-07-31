# Lesson 27b: `BroadcastReceiver`

**What you will build:** No new code to compile — this reads a real
component contract, verified against the actual Android framework
source.

**What you need to know first:** Lesson 27a's Static vs. Dynamic
Registration, Lesson 2h's Android Manifest.

**Terms introduced in this lesson:**

- **`BroadcastReceiver`** — the fourth major Android app component,
  reacting to system-wide or cross-app announcements via a short-lived
  `onReceive` callback with no lifecycle of its own — heavy work must be
  handed off elsewhere.

---

## Concept Unit: `BroadcastReceiver` — Reacting to System-Wide Announcements

### The Problem

Every event this course's Android material has reacted to so far
originated inside the app itself — a button tap, a screen opening. Some
events genuinely come from outside any one app entirely: the device
finishing its boot sequence, another app announcing something happened.
No Activity or Application, as built so far, has any way to be notified
of an announcement it didn't itself trigger.

### Introduce the Concept in Isolation

This is not a throwaway lab — it's a real component contract, verified against the actual Android framework source. `BroadcastReceiver`'s real,
complete declared contract (it has exactly one method):

```java
public abstract class BroadcastReceiver {
    public abstract void onReceive(Context context, Intent intent);
}
```

A concrete subclass, as an application developer would write it:

```java
public class BootReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        System.out.println("Device finished booting.");
    }
}
```

This is a `BroadcastReceiver` — **first appearance**: the fourth major
Android app component, reacting to system-wide or cross-app
announcements via a short-lived `onReceive` callback with no lifecycle
of its own — heavy work must be handed off elsewhere. `BootReceiver`,
registered either statically or dynamically (Lesson 27a), is the real
component Lesson 27a's own example was already using. Unlike
`Activity`'s six-step lifecycle from Lesson 2f, `onReceive` is the
*entire* lifecycle: it runs briefly, once, per announcement, and the
object is discarded immediately afterward — there is no
`onCreate`/`onDestroy` pair to hold longer-running state across.

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — this is a real, verified
framework contract.

### Mechanical Walkthrough

1. `public abstract class BroadcastReceiver { public abstract void
   onReceive(Context context, Intent intent); }` — **(b) reappearing**
   abstract class and abstract method shape from Lesson 13c, this time
   with exactly one required method rather than several.
2. `Context context` — **(b) reappearing** parameter type from Lesson
   4h, here identifying which app environment received the broadcast.
3. `Intent intent` — **(b) reappearing** `Intent` from Lesson 4f: a data
   object describing what actually happened — which specific
   announcement this is, and any data attached to it.
4. `class BootReceiver extends BroadcastReceiver { @Override public void
   onReceive(...) { ... } }` — **(b) reappearing** inheritance,
   overriding, and `@Override` from Lessons 0l and 0m, applied to this
   fourth component kind.

### CS Lens

`BroadcastReceiver` is inversion of control (Lesson 2a) at its most
minimal: one method, called once, by the OS, at a moment entirely outside
the application's own control — no multi-step template method sequence,
because a broadcast is a single, discrete event, not an ongoing screen
with multiple phases. `Activity`, `ContentProvider` (Lesson 25b),
`Service` (Lesson 26c), and `BroadcastReceiver` are Android's four
component kinds — each solving a genuinely different shape of problem.

Also recognized in: a pub/sub system's own subscriber callback (called
once per published message), a webhook handler (called once per external
event), any "fire and forget" event-notification shape where the
receiver has no ongoing lifecycle of its own between events.

### SE Lens

The alternative — giving `BroadcastReceiver` a fuller lifecycle, matching
`Activity`'s — was not chosen because a broadcast receiver's entire job
is reacting briefly to one specific announcement; the Android OS may
create and immediately discard the receiver object for each individual
broadcast, and heavy, long-running work inside `onReceive` risks being
killed mid-execution once the OS decides the receiver's brief window is
over — which is exactly why this pattern requires handing real work off
elsewhere rather than doing it directly inside `onReceive`.

---

## Connect the Pieces

`BootReceiver extends BroadcastReceiver`, overriding `onReceive`,
completes the fourth Android component kind: a brief, single-callback
reaction to an outside announcement, with no lifecycle of its own.
Lesson 27a's own static and dynamic registration are the two ways to
actually connect one to real events.

## What Breaks Without This

Nothing in the app can react to an announcement it didn't itself
trigger — a device finishing boot, another app's own broadcast — without
a component built specifically to receive it.

## Exercises

1. Read `BroadcastReceiver`'s real, one-method contract again and
   explain why it has no equivalent to `Activity`'s
   `onPause`/`onResume` pair.
2. Explain, in your own words, why heavy work should never run directly
   inside `onReceive`.
3. Name all four of Android's component kinds covered across this
   course, and one distinguishing trait of each.

## Definition of Done

- [ ] You read `BroadcastReceiver`'s real one-method contract and can
      explain why it has no fuller lifecycle.
- [ ] You completed Exercise 3.
- [ ] You can state, without looking back at this lesson, why heavy work
      inside `onReceive` risks being killed mid-execution.
