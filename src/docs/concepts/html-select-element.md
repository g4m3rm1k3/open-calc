# Concept: The HTML `<select>` Element

**What you'll understand by the end:** how to offer a user a choice
from a fixed, real set of options — rather than free text — and how
React controls which one is currently chosen.

**Prerequisites:** `html-input-element.md`.

## Setup

Any modern browser. No install needed.

## The Problem

A free-text `<input>` (`html-input-element.md`) lets a user type
anything, including values that were never real options at all. Some
data only has a small, fixed, real set of valid values — a plane can
only be one of three real orientations, a resource has one of five
real statuses — and a text box invites typos and invalid entries a
constrained choice never could.

## The Isolated Example

```html
<select id="size-picker">
  <option value="s">Small</option>
  <option value="m">Medium</option>
  <option value="l">Large</option>
</select>
<button id="read-button">Read Selection</button>
<script>
  document.getElementById("read-button").addEventListener("click", () => {
    console.log("chosen:", document.getElementById("size-picker").value);
  });
</script>
```

**Real output (after choosing "Medium", clicking the button):**
```
chosen: m
```

**What this proves:** `.value` reads back the chosen `<option>`'s own
`value` attribute (`"m"`), not its visible text (`"Medium"`) — the two
are deliberately separate: one is what a program reads, the other is
what a person sees.

## Mechanical Walkthrough

- `<select>` — the dropdown container; only ever holds `<option>`
  children (and optional `<optgroup>` groupings, not shown here).
- `<option value="m">Medium</option>` — one real, fixed choice: `value`
  is the machine-readable identity, the text between the tags is what's
  actually displayed in the dropdown.
- `.value`, read the same way as an `<input>`'s (`html-input-element.
  md`) — returns whichever `<option>`'s `value` is currently selected.
- Setting `.value` from JavaScript (or, in React, controlling it via a
  `value` prop) selects the matching `<option>` programmatically — the
  same controlled-element idea already established for a checkbox
  (`checked`) and a text input (`value`), just a third HTML element
  using the identical React mechanism.

## CS Lens

This is a real, everyday instance of **restricting an input's domain to
a known-valid set** — the same underlying idea as an `enum` type in a
typed language, a database column with a `CHECK` constraint limiting it
to specific values, or a state machine that only permits transitions to
a fixed, named set of states. A `<select>` is that same idea, expressed
at the UI layer.

Also recognized in: a typed language's `enum`, a database `ENUM`/`CHECK`
column, a REST API parameter documented as accepting only specific
literal strings, radio button groups (the same fixed-choice idea, a
different visual widget).

## SE Lens

The real tradeoff against a free-text `<input>`: a `<select>` can never
represent a value outside its own known set, which is exactly the
point — but that means adding a genuinely new valid option later
requires a real code change (a new `<option>`), where a text field
would have silently already accepted it (correctly or not). Choosing
`<select>` over `<input>` is a bet that the valid set is closed and
known ahead of time — wrong for freeform data, right for exactly the
cases this concept exists to handle.

## Connection

Builds on `html-input-element.md` (the same `.value` read/controlled-
element idea, given a second real element type) and
`html-id-attribute.md`/`dom-get-element-by-id.md`. In React
specifically, controlling a `<select>`'s `value` prop is the same
mechanism already used to control a checkbox's `checked` prop — one
underlying idea, applied to a third element.

## Try It Yourself

1. Add a fourth `<option>` with no visible text between its tags but a
   real `value` — confirm it still appears in the dropdown (as a blank
   row) and is still selectable and readable via `.value`.
2. Set one `<option>`'s attribute to `selected` directly in the HTML
   (`<option value="m" selected>`) and reload without clicking anything
   — confirm `.value` already reports `"m"` before any interaction, the
   same "attribute sets the starting point" idea `html-input-element.
   md` names for a text input's own `value` attribute.
3. Try setting `.value` to a string that doesn't match any `<option>`'s
   own `value` — observe what the dropdown visually shows (in most
   browsers, nothing becomes selected, or it silently falls back) —
   proof a `<select>` can't actually be forced outside its real,
   declared set of choices.
