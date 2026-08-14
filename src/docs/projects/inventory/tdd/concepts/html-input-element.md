# Concept: The HTML `<input>` Element

**What you'll understand by the end:** how to create a text box a user can type into, give it starting content, and read what's currently in it from JavaScript.

**Prerequisites:** `html-id-attribute.md`.

## Setup

Any modern browser. No install needed.

## The Problem

A page that only displays data can't collect anything from the person using it. Some element needs to let a user type text that JavaScript can then read and act on.

## The Isolated Example

```html
<input id="name-box" type="text" value="default text" />
<button id="read-button">Read Value</button>
<script>
  document.getElementById("read-button").addEventListener("click", () => {
    const current = document.getElementById("name-box").value;
    console.log("current value:", current);
  });
</script>
```

**Real output (browser console, after typing "hello" and clicking the button):**
```
current value: hello
```

**What this proves:** `.value` reflects whatever the user has actually typed *right now*, not the original `value="default text"` attribute — the attribute only set the box's starting content; reading `.value` afterward always gets the live, current text.

## Mechanical Walkthrough

- `<input id="name-box" type="text" value="default text" />` — a self-closing tag (no separate closing `</input>`) creating one text box.
- `type="text"` makes it a free-text box — other values (`type="number"`, `type="checkbox"`, `type="password"`, etc.) change both its behavior and how the browser renders it, not covered here.
- `value="default text"` sets the box's *initial* contents, shown before the user types anything — a one-time starting value, not a live binding to whatever the user later types.
- `.value`, read in JavaScript via a real element reference (`document.getElementById("name-box").value`), always returns the box's *current* text — this is the live property, distinct from the static attribute that only set the starting point.

## CS Lens

This is a **mutable UI widget with observable state** — the element's `.value` property changes as a direct result of user interaction (typing), entirely outside any JavaScript code explicitly setting it, and can be read at any later point to observe the current state.

Also recognized in: every GUI toolkit's text-entry widget (a desktop app's text field, a mobile app's text input) — all expose the same "current contents, readable on demand" shape, regardless of the specific API used to reach it.

## SE Lens

Relying on `value="..."` alone (reading the attribute rather than the `.value` property) would only ever see the *original* starting text, never what the user actually typed — a real, common beginner mistake, since the attribute and the live property share a name but represent different points in time. Reading `.value` at the moment it's needed (a button click, a form submission) is what actually captures user input.

## Connection

Builds on `html-id-attribute.md` and `dom-get-element-by-id.md`. Commonly paired with `dom-add-event-listener.md` — reading `.value` usually happens inside a handler triggered by some user action, not immediately when the page loads.

## Try It Yourself

1. Add a second `<input type="number">` and read its `.value` the same way. Confirm it comes back as a *string* even though it's numerically constrained by the browser (e.g. `"42"`, not `42`) — a real, easy-to-miss detail worth converting explicitly (`Number(...)`) before doing arithmetic with it.
2. Add an event listener for the `"input"` event (not `"click"`) directly on the text box itself, logging `.value` on every keystroke. Compare how often it fires versus a button-click-triggered read.
3. Set `.value` *from* JavaScript (`document.getElementById("name-box").value = "changed by code"`) and confirm the visible text box on the page updates immediately — the property is both readable and writable, not read-only.
