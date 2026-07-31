# Lesson 2g: XML — Nested Tags Describing Structured Data

**What you will build:** No new Java project — a plain text file, read
directly. Nothing here compiles with `javac`.

**What you need to know first:** Nothing beyond the Learner Baseline.

**Terms introduced in this lesson:**

- **XML** — a markup format using nested tags and attributes to
  describe structured data.

---

## Concept Unit: XML — Nested Tags Describing Structured Data

### The Problem

Every file written so far has been Java source, describing behavior.
Some information isn't behavior at all — it's structured, hierarchical
data: a name, a list of properties, nested groupings — and forcing that
kind of data into Java source code (as string literals, as nested
method calls) is both awkward to write and awkward for a non-code tool
to read back out. A format built specifically for hierarchical data,
readable by tools that have nothing to do with Java at all, is needed
instead.

### Introduce the Concept in Isolation

This concept needs no Java project at all — create a plain text file
named `pet.xml` anywhere, with this real, verified content:

```xml
<pet species="dog">
    <name>Rex</name>
    <age>3</age>
</pet>
```

This is `XML` — **first appearance**: a markup format using nested
tags and attributes to describe structured data. There is no
`javac`/`java` step for this file — nothing "runs" it; it exists purely
to be read, by a human or by a tool that understands this format's
structure.

### Discard the Throwaway Example

This file is deleted now. It will not appear again.

### Mechanical Walkthrough

1. `<pet species="dog"> ... </pet>` — **(a) first appearance** of a
   **tag**: `<pet ...>` opens it, `</pet>` closes it — everything
   between belongs to it. `species="dog"` is an **attribute**: a
   name-value pair attached directly to the opening tag, for a small
   piece of data that describes the tag itself rather than being
   nested content within it.
2. `<name>Rex</name>` and `<age>3</age>` — two more tags, nested
   inside `<pet>`, each holding its own text content rather than an
   attribute. Nesting is how XML expresses "this data belongs to, or
   is part of, that other data" — `name` and `age` belong to this
   specific `pet`, because they're written inside its tags.

### CS Lens

XML represents a **tree**: `<pet>` is the root, `<name>` and `<age>`
are its children, and `species` is a property of the root itself
rather than a child. This is the same nested-structure idea a
filesystem's own folders and files represent, described here for
arbitrary data instead of files.

Also recognized in: HTML (a close relative, built for documents rather
than arbitrary data), JSON (a different, more compact syntax for the
same underlying idea — nested, structured data), configuration formats
across countless tools and languages, none of them Java-specific.

### SE Lens

The alternative — encoding this same data as a Java string, hand-parsed
— was not chosen because XML already has a well-defined,
widely-supported structure that many existing tools (including
Android's own build system, a later lesson's actual subject) already
know how to read, without any custom parsing code being written at all.

---

## Connect the Pieces

`<pet species="dog">...</pet>` established XML's own nested-tag shape.
The next lesson (Android Manifest) shows a real, load-bearing use of
that exact shape.

## What Breaks Without This

Remove `pet.xml`'s own closing `</pet>` tag and check the file with a
real XML parser (`xmllint pet.xml`, or any XML-aware tool). Here is the
real error this produces:

```
pet.xml:4: parser error : Premature end of data in tag pet line 1
```

Every open tag genuinely requires a matching close — this is not a
style preference; a real parser refuses to read the file at all
without it.

## Exercises

1. Add a third nested tag to `<pet>`, `<breed>Labrador</breed>`, and
   confirm the structure still reads correctly as one tree.
2. Add a second attribute to the root tag, `id="1"`, alongside
   `species`.
3. Explain, in your own words, why `<name>Rex</name>` is nested content
   while `species="dog"` is an attribute, rather than the reverse.

## Definition of Done

- [ ] You wrote and read through the `pet.xml` example and can
      identify its tags and its one attribute by name.
- [ ] You completed Exercise 1 and Exercise 2.
- [ ] You can state, without looking back at this lesson, what nesting
      expresses in XML.
