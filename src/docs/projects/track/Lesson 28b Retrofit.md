# Lesson 28b: Retrofit

**What you will build:** No new code to compile — this reads real,
verified library code directly.

**What you need to know first:** Lesson 28a's JSON, Lesson 0q's
interface.

**Terms introduced in this lesson:**

- **Retrofit** — declaring a remote API as an annotated Java interface;
  a library generates a real, working implementation at runtime via
  reflection, converting between HTTP calls and typed Java objects
  automatically.

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
like Lesson 0q's own interfaces — a contract, no implementation body at
all — but no class anywhere `implements CatalogApi` by hand.
`retrofit.create(CatalogApi.class)` produces a real, working object at
runtime that fulfills this contract, generated automatically, translating
`getItem(42)` into an actual HTTP request and the raw JSON (Lesson 28a)
response back into a real `Item` object.

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — this is real, verified
library code.

### Mechanical Walkthrough

1. `interface CatalogApi { ... }` — **(b) reappearing** interface shape
   from Lesson 0q, this time describing a remote API's shape rather than
   a local capability.
2. `@GET("/items/{id}")` — **(a) first appearance** of a Retrofit
   annotation: declares this method corresponds to an HTTP `GET` request
   to the given URL path, with `{id}` as a placeholder filled in per
   call.
3. `Call<Item> getItem(@Path("id") int itemId)` — **(a) first
   appearance** of this specific shape: `Call<Item>` (Lesson 0u's
   generics, reused) represents the eventual result, an `Item`; `@Path
   ("id")` connects the `itemId` parameter to the `{id}` placeholder in
   the URL above it.
4. `retrofit.create(CatalogApi.class)` — **(a) first appearance**:
   `CatalogApi.class` names the interface itself, and
   `retrofit.create(...)` generates a real, working implementation of
   it — no hand-written class implementing `CatalogApi` exists anywhere
   in this application's own source code.

### CS Lens

Retrofit is programming-to-an-interface (Lesson 0r) taken to its logical
extreme: application code calls `api.getItem(42)` exactly as it would
call a method on any hand-written class, with the entire HTTP request,
JSON parsing (Lesson 28a), and response-to-object conversion happening
invisibly, generated at runtime from nothing but the interface's own
declared shape and annotations.

Also recognized in: any RPC (remote procedure call) framework that lets
a network call be written and read like an ordinary local method call,
any code-generation tool that produces a real, working implementation
from a declared contract rather than hand-written code.

### SE Lens

The alternative — manually opening an HTTP connection, building the
request, parsing the JSON response field by field, for every single
endpoint — was not chosen because it's exactly the kind of repeated,
error-prone boilerplate this course has already shown doesn't scale.
Retrofit lets an entire API surface be declared once, as a plain
interface, with the actual networking and parsing work generated
automatically and correctly every time.

---

## Connect the Pieces

`CatalogApi`, declared as a plain interface with Retrofit's own
annotations, is what turns raw JSON (Lesson 28a) into a real, typed
`Item` object automatically, with `retrofit.create(...)` generating a
working implementation from nothing but the interface's own declared
contract. The next lesson names the general mechanism behind that
generated implementation.

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
   getAllItems();`, combining `List<Item>` with this lesson's own
   Retrofit shape.
2. Read the real `JsonSyntaxException` message in "What Breaks Without
   This" and identify exactly what mismatch it's describing.
3. Explain, in your own words, why no class anywhere in application code
   implements `CatalogApi` by hand.

## Definition of Done

- [ ] You read `CatalogApi`'s real interface and can explain what
      `retrofit.create(CatalogApi.class)` actually produces.
- [ ] You completed Exercise 1.
- [ ] You can state, without looking back at this lesson, why no class
      anywhere in application code implements `CatalogApi` by hand.
