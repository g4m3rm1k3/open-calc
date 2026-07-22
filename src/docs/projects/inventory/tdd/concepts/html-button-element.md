# Concept: The HTML `<button>` Element

**What you'll understand by the end:** what a `<button>` element does on its own (very little) versus what it enables once JavaScript is attached to it.

**Prerequisites:** `html-id-attribute.md`.

## Setup

Any modern browser. No install needed.

## The Problem

A page needs a clickable element to trigger an action — something visually and semantically distinct from a plain block of text or a link, specifically meant to be pressed.

## The Isolated Example

```html
<button id="plain-button">Click me</button>
<script>
  console.log("page loaded — nothing has happened yet, no listener attached");
</script>
```

**Real output, clicking the button with no listener attached:** nothing at all — no console output, no visible page change.

Now with a listener attached:
```html
<button id="wired-button">Click me</button>
<script>
  document.getElementById("wired-button").addEventListener("click", () => {
    console.log("now something happens");
  });
</script>
```

**Real output, clicking the second button:**
```
now something happens
```

**What this proves:** a bare `<button>` with no JavaScript attached does nothing when clicked, beyond a purely visual "pressed" state the browser renders automatically — it has no default behavior of its own, unlike (for example) a link, which navigates on its own with zero JavaScript. All of a button's real behavior comes entirely from code explicitly attached to it.

## Mechanical Walkthrough

- `<button id="wired-button">Click me</button>` — the text between the opening and closing tags (`Click me`) is what's visibly displayed on the button.
- On its own, inside no `<form>`, a `<button>` has no default action — clicking it is a pure, inert user gesture until something (an event listener) gives it meaning.
- Inside a `<form>` element (not used here), a `<button>` defaults to submitting that form — a different, real default behavior not exercised in this isolated example, worth knowing about since it can surprise anyone who adds a `<button>` inside a `<form>` expecting it to behave like this file's bare example.

## CS Lens

A bare `<button>` is essentially an **inert event source** — an object capable of producing events (clicks) that, by itself, does nothing with them. Meaning only exists once something is listening (see `dom-add-event-listener.md`).

Also recognized in: any UI toolkit's plain button widget — universally, the widget itself only fires a signal; deciding what that signal *means* is always the application's responsibility, layered on top.

## SE Lens

Keeping a button's visual/structural role (a clickable, semantically-labeled element) separate from its behavioral role (what happens on click, attached via JavaScript) mirrors the same separation-of-concerns idea seen elsewhere in this project (see `template-rendering-separation-of-concerns.md`) — structure and behavior are two different concerns, wired together rather than fused into one.

## Connection

Builds on `html-id-attribute.md`. Almost always paired with `dom-add-event-listener.md` — a button with no listener attached is rarely useful on its own.

## Try It Yourself

1. Put a `<button>` inside a real `<form>` with no `type` attribute specified, and observe the page navigate/reload when clicked — the default "submit" behavior mentioned above, seen for real.
2. Add `type="button"` explicitly to a button inside a `<form>` and confirm it no longer triggers that default submit behavior — a real, common fix for exactly this surprise.
3. Style the button differently while it's being interacted with, using the `:hover` and `:active` CSS pseudo-classes, and observe the visual states a browser already tracks for you with zero JavaScript involved.
