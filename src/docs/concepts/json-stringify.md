# Concept: `JSON.stringify`

**What you'll understand by the end:** how to convert a JavaScript value into JSON text, and how its formatting arguments trade compactness for human readability.

**Prerequisites:** `serialization-deserialization.md` (the general concept; this entry is JavaScript's specific API and its extra formatting arguments — related, not a duplicate).

## Setup

Any JavaScript runtime — a browser console or Node.js. No install needed.

## The Problem

A JavaScript object needs to become text before it can be displayed as readable output, sent over a network, or saved — and sometimes that text needs to be compact (for transmission) and sometimes it needs to be readable (for a human looking at it).

## The Isolated Example

```javascript
const data = { status: "idle", position: { x: 0, y: 0 } };

console.log(JSON.stringify(data));
console.log(JSON.stringify(data, null, 2));
```

**Real output:**
```
{"status":"idle","position":{"x":0,"y":0}}
{
  "status": "idle",
  "position": {
    "x": 0,
    "y": 0
  }
}
```

**What this proves:** the same object produces two different strings depending only on the third argument — `2` inserts two spaces of indentation per nesting level and real newlines, purely for a human reading the output. The underlying data is identical either way; a program parsing either string back with `JSON.parse` gets the same object back.

## Mechanical Walkthrough

- `JSON.stringify(value)` — the one-argument form, producing the most compact valid JSON text.
- `JSON.stringify(value, replacer, space)` — the full form. `replacer` (here `null`, meaning "include everything, unfiltered") can instead be a function that filters or transforms each key-value pair as it's serialized, or an array of key names to include exclusively.
- `space` (here `2`) is either a number (spaces of indentation) or a string (used literally as the indent, e.g. `"\t"` for tabs) — purely a formatting choice with no effect on the data represented.

## CS Lens

This is the JavaScript-side half of **serialization** (see `serialization-deserialization.md`) — converting an in-memory value into a portable text representation, here with an explicit pretty-printing option baked into the API itself.

Also recognized in: Python's `json.dumps(value, indent=2)` (the same compact-vs-readable tradeoff, same shape, different language), and every "pretty-print" feature in every JSON tool or viewer — the underlying need (human-readable formatting layered on top of a compact wire format) recurs everywhere JSON is both transmitted and inspected by people.

## SE Lens

Using the compact, one-argument form is the right default for data meant to travel over a network or be stored — smaller payload, and no human is meant to read it directly. The indented form earns its place specifically when the output is meant for a person to read on screen (a debug log, a page displaying raw data) — using it for network transmission would waste bandwidth on whitespace with zero benefit to the receiving program, which doesn't care about formatting at all.

## Connection

Builds on `serialization-deserialization.md`. The reverse operation is `JSON.parse`, the JavaScript-side counterpart to `response.json()` in `fetch-api.md`.

## Try It Yourself

1. Call `JSON.stringify` on an object containing a value JSON can't represent — a function, or `undefined`. Observe what happens to that key in the output (hint: it's silently dropped, not an error) — a real, easy-to-miss behavior worth knowing about deliberately.
2. Call `JSON.stringify` on an object containing a circular reference (`const obj = {}; obj.self = obj;`). Read the real `TypeError` this produces, and reason about why a circular structure can't be represented as JSON text at all.
3. Use the `replacer` argument as a function (not `null`) that returns `undefined` for any key named `"position"`, and confirm that entire nested object is omitted from the output — a real, working example of selective serialization.
