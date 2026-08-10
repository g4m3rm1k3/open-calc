# Concept: The HTML `<textarea>` Element

**What you'll understand by the end:** how a multi-line text box differs from a single-line `<input>`, including how its starting content is written in the markup.

**Prerequisites:** `html-input-element.md`.

## Setup

Any modern browser. No install needed.

## The Problem

A single-line `<input>` can't hold or display multiple lines of text — some real content (a paragraph, a multi-line program, any free-form text with real line breaks) needs a box that can.

## The Isolated Example

```html
<textarea id="notes" rows="4" cols="30">line one
line two
line three</textarea>
<script>
  console.log(document.getElementById("notes").value);
</script>
```

**Real output (browser console):**
```
line one
line two
line three
```

**What this proves:** the textarea's starting content — including the real newlines between "line one," "line two," and "line three" — came from the text written *between* its opening and closing tags, not from a `value="..."` attribute the way `<input>` works. Reading `.value` afterward returns that multi-line text exactly, newlines included.

## Mechanical Walkthrough

- `<textarea rows="4" cols="30">...</textarea>` — unlike `<input>` (a self-closing tag), `<textarea>` has a real closing tag, and its initial content is whatever plain text sits between the two tags.
- `rows="4"` and `cols="30"` size the box in rows and columns of text, rather than pixels — a rough, character-based sizing rather than exact.
- `.value`, read the same way as `<input>`'s (see `html-input-element.md`), returns the box's *current* full text — including every line break — as a single string, not a list of lines; splitting it into separate lines (e.g. on `"\n"`) is something calling code does afterward if needed.

## CS Lens

This is the same **mutable UI widget with observable state** idea as `html-input-element.md`, generalized from a single line of text to arbitrary multi-line text — the underlying "current value, readable on demand" property doesn't change; only what shape of data it can hold does.

Also recognized in: every GUI toolkit's multi-line text-entry widget (a desktop text editor's document view, in its simplest form, is an enormously more capable version of the exact same underlying idea).

## SE Lens

Putting the starting content directly between the tags — rather than an attribute, as `<input>` uses — matters specifically because HTML attributes are single-line by convention and awkward for multi-line content (embedding real newlines inside an attribute value is possible but unusual and easy to get wrong). Content-between-tags handles multi-line text naturally, which is exactly why `<textarea>`'s starting content is written this way while `<input>`'s is not — a real, deliberate difference between the two elements' designs, not an arbitrary inconsistency.

## Connection

Builds on `html-input-element.md`. Commonly paired with `dom-add-event-listener.md` and `fetch-post-with-body.md` — reading a full, multi-line program or document out of a textarea and sending it to a server is a very common combination.

## Try It Yourself

1. Set `.value` from JavaScript to a new multi-line string (using `"\n"` between lines) and confirm the visible textarea updates to show the new content across multiple real lines.
2. Split `.value` on `"\n"` (`.value.split("\n")`) and log the resulting array's length — confirm it matches the actual number of lines currently in the box, including ones the user just typed, not just the original starting content.
3. Compare `<textarea>` against a plain `<input type="text">` containing the same multi-line text (try to type a newline into an `<input>` — most browsers won't let you). Confirm this is a real, structural difference in what each element can hold, not just a styling difference.
