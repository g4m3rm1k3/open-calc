# Lesson 9e: `Toast`

**What you will build:** No new code to compile — this reads real
Android code directly.

**What you need to know first:** Lesson 3a's view tree, Lesson 4h's
`Context`.

**Terms introduced in this lesson:**

- **`Toast`** — a small, auto-dismissing message overlay shown briefly
  to the user, independent of the view tree it floats above.

---

## Concept Unit: `Toast`

### The Problem

A form submission succeeding needs some visible confirmation — but adding
a dedicated, permanent UI element (a `TextView` that says "Saved!") just
for this one, brief confirmation would clutter the screen with an element
that's only ever relevant for a moment.

### Introduce the Concept in Isolation

This is not a throwaway lab — it's real Android code, verified against
the actual framework source:

```java
Toast.makeText(this, "Item saved.", Toast.LENGTH_SHORT).show();
```

This is `Toast` — **first appearance**: a small, auto-dismissing message
overlay shown briefly to the user, independent of the view tree it
floats above. `Toast.makeText(...)` creates the message; `.show()`
displays it; it disappears on its own, after `Toast.LENGTH_SHORT`'s
duration, with no code needed to dismiss it and nothing added
permanently to the screen's own view tree (Lesson 3a).

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — this is real, verified
Android code.

### Mechanical Walkthrough

1. `Toast.makeText(this, "Item saved.", Toast.LENGTH_SHORT)` — **(a)
   first appearance**: constructs the message, taking a `Context`
   (Lesson 4h) because a `Toast` must attach its overlay to the app's
   own window system rather than to any one specific screen — the
   message text, and a duration constant, round out what it needs to
   display and when to disappear.
2. `.show();` — **(a) first appearance**: displays the message overlay
   immediately; it dismisses itself automatically once its duration
   elapses, with no further code required.

### CS Lens

A `Toast` is deliberately outside the normal view tree — it floats above
whatever screen is currently showing, rather than being one more child
view added to and later removed from a layout. Recognizing "this is a
transient overlay, not a permanent view-tree member" is the transferable
distinction.

Also recognized in: transient "snackbar" or toast-style notifications
across virtually every mainstream UI framework and OS, brief
auto-dismissing confirmation messages generally.

### SE Lens

The alternative — adding a permanent `TextView` to the layout, shown and
hidden manually to confirm a save — was not chosen because it requires
manually managing visibility and a dismiss timer for something `Toast`
already handles automatically; `Toast` is simpler specifically because
confirmation messages are inherently transient, not a permanent part of
the screen.

---

## Connect the Pieces

Lesson 9a's `EditText` accepted the user's typed input. Lessons 9b
through 9d established the real guarantee behind it — a UI hint alone
isn't enough, an actual check at the boundary is, and stopping at the
first problem keeps that check simple. `Toast` closes the loop,
confirming a successful save without a dedicated, permanent UI element
cluttering the screen.

## What Breaks Without This

Using a permanent `TextView` instead of `Toast` for a transient
confirmation message leaves stale "Saved!" text on screen long after
it's no longer relevant, unless manually hidden.

## Exercises

1. Explain, in your own words, why `Toast` doesn't need to be manually
   removed from the screen the way a `TextView` would.
2. Explain, in your own words, why `Toast.makeText` needs a `Context`
   argument at all.
3. Name one situation where a permanent, always-visible `TextView`
   would actually be the better choice over a `Toast`.

## Definition of Done

- [ ] You read the real `Toast` example and can explain why it needs no
      manual dismissal.
- [ ] You completed Exercise 1.
- [ ] You can state, without looking back at this lesson, why `Toast`
      is described as independent of the view tree.
