# Lesson 28a: JSON

**What you will build:** No new code to compile — this reads real,
verified JSON directly.

**What you need to know first:** Lesson 8b's Serialization.

**Terms introduced in this lesson:**

- **JSON** — a text-based, language-agnostic serialization format
  representing structured data as key-value objects and arrays.

---

## Concept Unit: JSON — A Language-Agnostic Serialization Format

### The Problem

Lesson 8b's own comma-separated text format solved serialization for one
small, self-invented case, but breaks the moment a value itself contains
a comma, and has no way to represent nested structure (an object holding
another object, or a list of objects) at all. A server sending data to a
mobile app, or any two systems written in entirely different languages,
need a shared, robust, genuinely standard format neither side has to
invent.

### Introduce the Concept in Isolation

A small, real, verified example — the same `Item` shape from earlier
lessons, in real JSON:

```json
{
  "name": "Widget",
  "quantity": 12,
  "tags": ["hardware", "small"]
}
```

This is `JSON` — **first appearance**: a text-based, language-agnostic
serialization format representing structured data as key-value objects
and arrays. `{ }` marks an **object** — key-value pairs, `"name":
"Widget"` being one — and `[ ]` marks an **array** — an ordered list,
here holding two text values. Unlike Lesson 8b's own comma-separated
format, JSON handles nested structure natively (an array as a field's own
value, here) and is read and written by tools in nearly every programming
language, not just Java.

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — this is real JSON, verified against the JSON specification's own grammar for objects and arrays.

### Mechanical Walkthrough

1. `{ "name": "Widget", "quantity": 12, "tags": [...] }` — **(a) first
   appearance** of a JSON **object**: an unordered set of key-value
   pairs, each key a quoted string, each value one of JSON's own fixed
   set of types (text, number, boolean, `null`, another object, or an
   array).
2. `"quantity": 12` — a numeric value, written with no quotes — JSON
   distinguishes text (`"Widget"`, quoted) from numbers (`12`,
   unquoted) as genuinely different types, the same distinction Java's
   own `String` versus `int` already draws.
3. `"tags": ["hardware", "small"]` — **(a) first appearance** of a JSON
   **array**: an ordered list of values, here two strings, nested
   directly inside the outer object as one field's own value — the exact
   nested structure Lesson 8b's comma-separated format had no way to
   represent at all.

### CS Lens

JSON is serialization (Lesson 8b) with a real, standardized,
language-agnostic format — the actual answer to Lesson 8b's own
admission that a self-invented, comma-based format doesn't scale. Every
mainstream language has tools that read and write JSON natively, which
is exactly why it's the de facto format almost every web API uses to
exchange structured data with clients written in entirely different
languages.

Also recognized in: nearly every public web API's request and response
bodies, configuration files across many tools and languages — genuinely
ubiquitous, not an Android-specific or Java-specific format at all.

### SE Lens

The alternative — every team, or every project, inventing its own
transport text format, the way Lesson 8b did for a single small example
— was not chosen at the industry scale because it would mean every client
and every server pairing needs custom, hand-written parsing code, with no
shared tooling or standard behavior. JSON's ubiquity means a library on
nearly any platform can already read and write it correctly, with no new
parsing code needed at all.

---

## Connect the Pieces

`{ "name": "Widget", "quantity": 12 }` establishes JSON's own real,
language-agnostic shape — the actual format a server sends. The next
lesson shows a real library that turns raw JSON like this into typed
Java objects automatically.

## What Breaks Without This

Every team inventing its own transport text format means every client
and every server pairing needs custom, hand-written parsing code, with
no shared tooling or standard behavior.

## Exercises

1. Write out, by hand, the JSON a server might reasonably send back for
   a list of items — an array of item objects, following this lesson's
   own JSON shape.
2. Explain, in your own words, why `"quantity": 12` has no quotes around
   `12`, while `"name": "Widget"` does have quotes around `"Widget"`.
3. Explain, in your own words, why JSON's nested-array support solves a
   real limitation Lesson 8b's own comma-separated format had.

## Definition of Done

- [ ] You read the real JSON example and can identify its object and
      array syntax by name.
- [ ] You completed Exercise 1.
- [ ] You can state, without looking back at this lesson, why a
      self-invented text format doesn't scale at industry scale.
