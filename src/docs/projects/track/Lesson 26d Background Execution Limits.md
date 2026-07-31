# Lesson 26d: Background Execution Limits

**What you will build:** No new code to compile — this reads a real,
documented Android restriction directly.

**What you need to know first:** Lesson 26c's `Service`.

**Terms introduced in this lesson:**

- **Background Execution Limits** — OS-imposed restrictions on what an
  app with no visible UI can do unprompted, increasingly strict since
  Android 8, specifically to protect battery life — including batching
  and delaying background work during extended idle periods.

---

## Concept Unit: Background Execution Limits

### The Problem

A plain started `Service`, once running, is not free to run forever: the
OS can, and does, stop it within moments of the app leaving the
foreground, on modern Android versions — nothing about a plain `Service`
by itself schedules periodic, reliable work that survives this.

### Introduce the Concept in Isolation

This is not a throwaway lab — it's a real, documented Android
restriction, verified against the actual platform behavior:

```java
// Starting a background Service while the app is not in the foreground,
// on a modern Android version, is itself restricted or disallowed —
// this call alone offers no guarantee it will keep running:
startService(new Intent(this, SyncService.class));
```

This is `background execution limits` — **first appearance**:
OS-imposed restrictions on what an app with no visible UI can do
unprompted, increasingly strict since Android 8, specifically to protect
battery life — including batching and delaying background work during
extended idle periods. `startService(...)` alone offers no guarantee
`SyncService` will keep running once the app leaves the foreground — the
OS itself can, and routinely does, stop it, regardless of anything
`SyncService`'s own code does.

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — this is a real, documented
Android restriction.

### Mechanical Walkthrough

1. `startService(new Intent(this, SyncService.class));` — **(a) first
   appearance**: starts the `Service`, but on a modern Android version,
   this alone carries no guarantee of continued execution once the app
   leaves the foreground.
2. The OS itself, independent of anything `SyncService`'s own code does,
   can stop this `Service` — the restriction is enforced at the platform
   level, not something a developer can simply code around by writing
   `Service` logic more carefully.

### CS Lens

Background execution limits are a real, deliberate platform-level policy
tradeoff: unrestricted background execution across every installed app
would drain battery and degrade system responsiveness broadly, so the
platform itself restricts it, even at the cost of individual apps needing
a more complex mechanism (the next lesson) to get reliable background
work done at all.

Also recognized in: background execution restrictions across virtually
every modern mobile OS (iOS's own background task time limits) — the
same underlying tradeoff between individual app capability and
system-wide battery/performance health.

### SE Lens

The alternative — relying on a plain, manually-managed `Service` for
work that must reliably recur or survive reboots — was not chosen
because the OS itself can stop it at any time; correctly handling
"survive being stopped, retry on failure, adapt to whichever Android
version this device runs" by hand, repeatedly, for every app that needs
reliable background work, is real, substantial, error-prone work the
next lesson exists specifically to avoid repeating.

---

## Connect the Pieces

`startService(...)` alone offers no guarantee `SyncService` keeps
running — background execution limits are the real, platform-enforced
reason why. The next lesson shows the real, load-bearing answer.

## What Breaks Without This

Unrestricted background execution across every installed app would
drain battery and degrade system responsiveness broadly — this is the
real cost the platform restricts against.

## Exercises

1. Explain, in your own words, why `startService(...)` alone offers no
   guarantee of continued execution on a modern Android version.
2. Explain, in your own words, why background execution limits tightened
   specifically starting with Android 8, rather than existing since
   Android's very first version.
3. Name one real app feature (besides syncing data) that would need
   reliable background work despite these limits.

## Definition of Done

- [ ] You can state, without looking back at this lesson, why a plain
      `Service` cannot guarantee reliable, recurring background work on
      its own.
- [ ] You completed Exercise 1.
- [ ] You can explain the platform-level tradeoff background execution
      limits represent.
