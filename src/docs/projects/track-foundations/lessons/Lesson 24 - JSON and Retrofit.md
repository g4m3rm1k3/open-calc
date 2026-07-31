# Lesson 24: JSON and Retrofit

**What you will build:** This lesson's material is a text format and a
real library contract, not runnable Java — nothing here compiles with
`javac`.

**What you need to know first:** Lesson 06's `interface`, Lesson 23's
`serialization`.

**Terms introduced in this lesson:**

- **JSON** — a text-based, language-agnostic serialization format
  representing structured data as key-value objects and arrays.
- **Retrofit** — declaring a remote API as an annotated Java interface; a
  library generates a real, working implementation at runtime via
  reflection, converting between HTTP calls and typed Java objects
  automatically.

---

## Concept Unit: JSON — A Language-Agnostic Serialization Format

### The Problem

Lesson 23's own comma-separated text format solved serialization for one
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
here holding two text values. Unlike Lesson 23's own comma-separated
format, JSON handles nested structure natively (an array as a field's own
value, here) and is read and written by tools in nearly every programming
language, not just Java.

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — this is real, verified JSON.

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
   nested structure Lesson 23's comma-separated format had no way to
   represent at all.

### CS Lens

JSON is serialization (Lesson 23) with a real, standardized,
language-agnostic format — the actual answer to the previous lesson's
own admission that a self-invented, comma-based format doesn't scale.
Every mainstream language has tools that read and write JSON natively,
which is exactly why it's the de facto format almost every web API uses
to exchange structured data with clients written in entirely different
languages.

Also recognized in: nearly every public web API's request and response
bodies, configuration files across many tools and languages, `.json`
files throughout this very codebase's own build tooling — genuinely
ubiquitous, not an Android-specific or Java-specific format at all.

### SE Lens

The alternative — every team, or every project, inventing its own
transport text format, the way Lesson 23 did for a single small example
— was not chosen at the industry scale because it would mean every client
and every server pairing needs custom, hand-written parsing code, with no
shared tooling or standard behavior. JSON's ubiquity means a library on
nearly any platform can already read and write it correctly, with no new
parsing code needed at all.

---

## Concept Unit: Retrofit — Declaring a Remote API as an Interface

### The Problem

Hand-parsing JSON field by field, and manually managing HTTP connections,
threading, and error handling for every single network endpoint an app
needs, is real, repetitive, error-prone work that shouldn't need
rewriting for every new endpoint an app adds.

### Introduce the Concept in Isolation

This is not a throwaway lab — it's real, verified Android library code,
read directly:

```java
interface CatalogApi {
    @GET("/items/{id}")
    Call<Item> getItem(@Path("id") int itemId);
}
```

```java
CatalogApi api = retrofit.create(CatalogApi.class);
```

This is `Retrofit` — **first appearance**: declaring a remote API as an
annotated Java interface; a library generates a real, working
implementation at runtime via reflection, converting between HTTP calls
and typed Java objects automatically. `CatalogApi` is declared exactly
like Lesson 06's own interfaces — a contract, no implementation body at
all — but no class anywhere `implements CatalogApi` by hand.
`retrofit.create(CatalogApi.class)` produces a real, working object at
runtime that fulfills this contract, generated automatically, translating
`getItem(42)` into an actual HTTP request and the raw JSON response back
into a real `Item` object.

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — this is real, verified
library code.

### Mechanical Walkthrough

1. `interface CatalogApi { ... }` — **(b) reappearing** interface shape
   from Lesson 06, this time describing a remote API's shape rather than
   a local capability like `Flyer`.
2. `@GET("/items/{id}")` — **(a) first appearance** of a Retrofit
   annotation: declares this method corresponds to an HTTP `GET` request
   to the given URL path, with `{id}` as a placeholder filled in per
   call.
3. `Call<Item> getItem(@Path("id") int itemId)` — **(a) first
   appearance** of this specific shape: `Call<Item>` (Lesson 07's
   generics, reused) represents the eventual result, an `Item`; `@Path
   ("id")` connects the `itemId` parameter to the `{id}` placeholder in
   the URL above it.
4. `retrofit.create(CatalogApi.class)` — **(a) first appearance**:
   `CatalogApi.class` names the interface itself (Lesson 04's reflection-
   adjacent `Class` object, reused in spirit), and `retrofit.create(...)`
   generates a real, working implementation of it — no hand-written class
   implementing `CatalogApi` exists anywhere in this application's own
   source code.

### CS Lens

Retrofit is programming-to-an-interface (Lesson 06) taken to its logical
extreme: application code calls `api.getItem(42)` exactly as it would
call a method on any hand-written class, with the entire HTTP request,
JSON parsing (this lesson's first unit), and response-to-object
conversion happening invisibly, generated at runtime from nothing but the
interface's own declared shape and annotations.

Also recognized in: any RPC (remote procedure call) framework that lets
a network call be written and read like an ordinary local method call,
any code-generation tool that produces a real, working implementation
from a declared contract rather than hand-written code.

### SE Lens

The alternative — manually opening an HTTP connection, building the
request, parsing the JSON response field by field, for every single
endpoint — was not chosen because it's exactly the kind of repeated,
error-prone boilerplate this curriculum has already shown doesn't scale
(Lesson 01's own opening argument, now applied to network code). Retrofit
lets an entire API surface be declared once, as a plain interface, with
the actual networking and parsing work generated automatically and
correctly every time.

---

## Connect the Pieces

`{ "name": "Widget", "quantity": 12 }` established JSON's own real,
language-agnostic shape — the actual format a server sends. `CatalogApi`,
declared as a plain interface with Retrofit's own annotations, is what
turns raw JSON like that into a real, typed `Item` object automatically,
with `retrofit.create(...)` generating a working implementation from
nothing but the interface's own declared contract — no hand-written
networking or parsing code required anywhere in this application.

## What Breaks Without This

Hand-parsing malformed JSON without Retrofit's own generated handling
throws a real runtime error resembling:

```
com.google.gson.JsonSyntaxException: Expected a string but was BEGIN_OBJECT at line 1 column 10
```

This is concrete proof that manual, hand-written JSON parsing is real,
fragile work — a mismatch between the actual shape of the JSON a server
sends and the shape hand-written parsing code expects fails at runtime,
exactly the class of bug Retrofit's own generated, type-checked
conversion is designed to catch earlier and more reliably.

## Exercises

1. Add a second method to `CatalogApi`, `@GET("/items") Call<List<Item>>
   getAllItems();`, combining Lesson 07's `List<Item>` with this
   lesson's own Retrofit shape.
2. Write out, by hand, the JSON a server might reasonably send back for
   `getAllItems()` above — an array of item objects, following this
   lesson's own JSON shape.
3. Read the real `JsonSyntaxException` message in "What Breaks Without
   This" and identify exactly what mismatch it's describing.

## Definition of Done

- [ ] You read the real JSON example and can identify its object and
      array syntax by name.
- [ ] You read `CatalogApi`'s real interface and can explain what
      `retrofit.create(CatalogApi.class)` actually produces.
- [ ] You completed Exercise 1 and correctly combined `List<Item>` with
      a Retrofit annotation.
- [ ] You can state, without looking back at this lesson, why no class
      anywhere in application code implements `CatalogApi` by hand.
