# Lesson 2j: Android Resources — Content Separate From Code

**What you will build:** No new code to compile — this reads a real,
verified resource file directly.

**What you need to know first:** Lesson 2g's XML.

**Terms introduced in this lesson:**

- **Android resources** — non-code assets (strings, layouts, styles,
  images) stored in a structured `res/` folder, separate from source
  code, referenced symbolically rather than hardcoded inline.

---

## Concept Unit: Android Resources — Content Separate From Code

### The Problem

UI text, colors, and layouts could be written directly inside Java
source, as string literals — but that mixes content (what a button
says) with behavior (what happens when it's tapped) in the same file,
and makes translating an app to another language mean editing Java
code directly. Some separation between "what the UI displays" and
"what the code does" is needed.

### Introduce the Concept in Isolation

A real, verified resource file, `res/values/strings.xml`:

```xml
<resources>
    <string name="app_name">My App</string>
    <string name="welcome_message">Welcome!</string>
</resources>
```

This is an `Android resource` — **first appearance**: a non-code asset
(here, text) stored in a structured `res/` folder, separate from
source code, referenced symbolically rather than hardcoded inline. Java
code never writes `"Welcome!"` directly — it refers to a symbolic name
instead (the exact mechanism a later lesson covers), and Android's
build tools connect that symbolic name to the actual resource
automatically.

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — the `strings.xml` shape is
a real, verified project artifact.

### Mechanical Walkthrough

1. `<resources> ... </resources>` — **(a) first appearance** of the
   resource file's own root tag: XML requires exactly one root element
   per file, which is why every individual resource nests inside this
   one shared wrapper rather than each having its own top-level file
   structure.
2. `<string name="app_name">My App</string>` — **(a) first appearance**
   of this specific resource shape: `name` is the symbolic identifier
   code will refer to; `app_name` never appears as literal text
   anywhere in Java source.

### CS Lens

Android resources are a real, load-bearing example of XML (Lesson 2g)
applied to a genuine engineering problem: separating content (what the
UI displays) from behavior (what the code does), the same separation-
of-concerns idea recurring throughout software design generally.

Also recognized in: localization/internationalization resource files
across virtually every mainstream app platform (`.strings` files on
iOS, resource bundles on the web) — content kept separate from code
specifically so translation doesn't require touching source at all.

### SE Lens

The alternative — writing `"Welcome!"` directly as a Java string
literal, wherever it's needed — was not chosen because it scatters the
same piece of user-facing content across however many places it's
used, and makes translating the app mean finding and editing every one
of those places inside Java source directly, rather than editing one
resource file.

---

## Connect the Pieces

`res/values/strings.xml` is XML's own nested-tag shape (Lesson 2g),
now used for real UI content. The next lesson (Generated `R` Class)
shows exactly how Java code safely refers back to a resource like
`welcome_message` without ever writing its text directly.

## What Breaks Without This

Writing UI text directly as Java string literals scattered across
multiple files means a single wording change (fixing a typo in
`"Welcome!"`) requires finding and editing every occurrence by hand,
with nothing to guarantee all of them were actually found — this
resource-file shape, verified against the actual Android build system,
is what a real project uses specifically to avoid that.

## Exercises

1. Add a third `<string>` resource, `goodbye_message`, with its own
   text.
2. Explain, in your own words, why keeping `app_name` in
   `strings.xml` instead of hardcoding it in Java makes translating the
   app easier.
3. Explain, in your own words, why resources live in a separate `res/`
   folder rather than alongside Java source files.

## Definition of Done

- [ ] You read the real `strings.xml` example and can identify its
      `name` attributes.
- [ ] You completed Exercise 1.
- [ ] You can state, without looking back at this lesson, why UI text
      is kept in a resource file rather than a Java string literal.
