# Lesson 6k: Template/Instance Separation

**What you will build:** A small, fully runnable, plain Java lab.

**What you need to know first:** Lesson 6j's build dependency
management.

**Terms introduced in this lesson:**

- **Template/instance separation** — one small structural description
  gets instantiated many times against different data, rather than each
  occurrence being separately authored.

---

## Concept Unit: Template/Instance Separation

### The Problem

A screen showing a list of a hundred inventory items should not
require a hundred separately hand-authored layout files, one per row —
every row needs the identical visual structure (an icon, a name, a
quantity), differing only in which specific data fills it.

### Introduce the Concept in Isolation

```
mkdir lesson-6k
cd lesson-6k
```

Create `Main.java`:

```java
public class Main {
    static String renderRow(String template, String name, int quantity) {
        return template.replace("{name}", name).replace("{quantity}", String.valueOf(quantity));
    }

    public static void main(String[] args) {
        String rowTemplate = "Item: {name}, Qty: {quantity}";
        System.out.println(renderRow(rowTemplate, "Wrench", 12));
        System.out.println(renderRow(rowTemplate, "Bolt", 340));
        System.out.println(renderRow(rowTemplate, "Hammer", 5));
    }
}
```

Compile and run it:

```
javac Main.java
java Main
```

Here is the real output:

```
Item: Wrench, Qty: 12
Item: Bolt, Qty: 340
Item: Hammer, Qty: 5
```

One `rowTemplate` string was written exactly once, then rendered
three separate times against three separate sets of data. This is
`template/instance separation` — **first appearance**: one small
structural description gets instantiated many times against different
data, rather than each occurrence being separately authored.
`rowTemplate` is the template — authored once; each call to
`renderRow` produces one instance of it, filled with that call's own
specific data.

### Discard the Throwaway Example

This version is deleted now. It will not appear again.

### Mechanical Walkthrough

1. `String rowTemplate = "Item: {name}, Qty: {quantity}";` — **(a)
   first appearance**: the template itself, written exactly once,
   containing placeholders rather than real data.
2. `renderRow(rowTemplate, "Wrench", 12)` — the template is
   instantiated against this call's own specific data, producing one
   real, filled-in row string.
3. Two further calls to `renderRow`, same template, different data —
   proof the same template produces a different, independent instance
   each time, without being rewritten.

### CS Lens

Template/instance separation is the same underlying shape as a class
(Lesson 0a) versus an object built from it (Lesson 0c) — one authored
structure, instantiated repeatedly against different data — applied
here to a layout description rather than to executable code.
Recognizing "this is one template, rendered many times" is the
transferable skill, regardless of whether the template is a class, a
row layout, or a string format.

Also recognized in: HTML templating engines rendering the same markup
structure against many different data records, database query
templates (a single parameterized query executed against different
parameter values), any UI framework's own list/row rendering
mechanism.

### SE Lens

The alternative — hand-authoring a separate, fully-written row for
every single inventory item — was not chosen because it doesn't
scale: a hundred items would require a hundred hand-written,
nearly-identical layout files, and a single visual change (say, making
the quantity text bold) would require editing all hundred instead of
the one shared template.

---

## Connect the Pieces

`renderRow` demonstrated the general shape Gap 6's entire RecyclerView
subsystem relies on: one small row template, authored once,
instantiated repeatedly against each inventory item's own data — never
one hand-authored layout file per row. This closes the entire
RecyclerView arc, from Lesson 6a's eager/lazy distinction through this
lesson's own general templating shape.

## What Breaks Without This

Authoring a separate hand-written row layout per inventory item,
instead of one template instantiated repeatedly, means every visual
change must be manually repeated across every single row file, with
nothing keeping them in sync.

## Exercises

1. Add a fourth call to `renderRow` in `main`, rendering a new item,
   and confirm the same template produces a correct, independent
   result.
2. Explain, in your own words, why one shared row template scales to
   a hundred inventory items better than a hundred hand-authored row
   layouts.
3. Connect this lesson's own template/instance shape directly to
   `RecyclerView`'s own single row layout XML file (Lesson 6d), reused
   for every row.

## Definition of Done

- [ ] You ran the `renderRow` example and saw the same template
      correctly produce three different, independent results.
- [ ] You completed Exercise 1.
- [ ] You can state, without looking back at this lesson, why a
      shared template scales better than one hand-authored instance
      per row.
