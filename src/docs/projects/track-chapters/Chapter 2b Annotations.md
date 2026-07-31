# Chapter 2, Lesson B: Annotations — Metadata a Tool Reads, Not Code That Runs

**What you will build:** Nothing app-related yet — a tiny custom
annotation, entirely outside Android, proving what an annotation
fundamentally is before you meet the one you'll actually use
constantly. The transferable problem: the capstone of this chapter has
`@Override` sitting directly above a method, and the `@` syntax has
never appeared in this course before. It looks like it might be part of
the method itself — is it? What actually happens when this code runs,
because of that one line?

**What you need to know first:** Chapter 2A (class, object, `new`,
instance method).

**Terms introduced in this lesson:**
- **Annotation** — `@`-prefixed metadata attached to a code
  declaration, not executable code itself; inert by default, only
  meaningful if some separate tool specifically looks for it.
- **`@interface`** — the keyword pair that declares a brand-new
  annotation type, as opposed to plain `interface`, which declares
  method signatures to implement (not covered in this course yet).

---

## Concept Unit: Annotations Are Metadata a Tool Reads, Not Code That Runs

### The Problem

`@Override` sits directly above a method in real Android code you're
about to see. Nothing in this course has explained the `@` syntax at
all yet. What actually *is* an annotation, mechanically — and does
writing one, by itself, do anything at all?

### Introduce the Concept in Isolation

Prove it with the smallest possible custom annotation, entirely outside
Android — no framework needed to show what an annotation fundamentally
is. Create a folder for this lab. Inside it, create `Reminder.java`:

```java
@interface Reminder {
    String value();
}
```

`@interface` — not plain `interface` — is the keyword pair that
declares a brand-new **annotation type**. `value()` declares one piece
of text this annotation can carry, supplied in parentheses wherever the
annotation is actually used.

In the same folder, create `Task.java`:

```java
class Task {
    @Reminder("double check totals before shipping")
    void calculateTotal() {
        System.out.println("Calculating total...");
    }

    void logStart() {
        System.out.println("Starting...");
    }
}
```

`@Reminder("...")`, sitting directly above `calculateTotal()` with no
semicolon of its own, is not a statement — it's metadata attached to
the declaration immediately below it.

Create `AnnotationDemo.java`:

```java
public class AnnotationDemo {
    public static void main(String[] args) {
        Task t = new Task();
        t.logStart();
        t.calculateTotal();
    }
}
```

Compile and run:

```
javac Reminder.java Task.java AnnotationDemo.java
java AnnotationDemo
```

Real output, this session:

```
Starting...
Calculating total...
```

What this proves: the program's behavior is completely unaffected by
`@Reminder("...")` being there at all. `calculateTotal()` runs exactly
the way `logStart()` does — same call, same output — despite one having
an annotation and the other not. An annotation, on its own, does
nothing. It's a label a *separate tool* could read later (a build
step, a documentation generator, the compiler itself in special cases)
— but nothing here is reading it, so nothing here reacts to it.

### Discard the Throwaway Example

Delete `Reminder.java`, `Task.java`, and `AnnotationDemo.java` — they
never appear again. Hold onto the proof: annotations are inert by
default.

### Mechanical Walkthrough

- `@interface Reminder { String value(); }` — **first appearance.**
  Declares a brand-new annotation type named `Reminder`, carrying one
  piece of text.
- `@Reminder("double check totals before shipping")` — **first
  appearance of using an annotation.** Attached to the declaration
  immediately below it — here, a method — with no effect on that
  method's own behavior.

### CS Lens

This is **metadata separated from behavior** — information *about*
code, stored alongside it, that requires a separate, deliberate reader
to do anything with. Also recognized in: HTML/XML attributes read by a
browser but otherwise inert, database column constraints like `NOT
NULL` (metadata the engine checks, not a statement that runs), and
docstring-based type hints in Python (`# type: int`) that most Python
runtimes simply ignore unless a separate tool like `mypy` reads them.

### SE Lens

**If annotations do nothing by themselves, why does Java bother with
special syntax for them instead of just using a comment?** A comment is
invisible to every tool except a human reader; an annotation is
structured, checkable data a *program* can read — a build tool can ask
"which methods have `@Reminder` attached, and what does each one say?"
reliably, the same way you'd query a database column, which is
impossible to do reliably against free-text comments. The cost is
special syntax to learn for something that, by itself, does nothing at
all — its entire value shows up only once some tool actually reads it,
which is exactly the case the next lesson's `@Override` turns out to
be: one of a small handful of annotations `javac` itself has real,
hardcoded logic for, rather than something inert waiting for an
optional tool.

---

## Connect the Pieces

One trace through this lesson: `@Reminder("...")` sat above a method
and changed nothing about how that method ran — proof that, by
default, an annotation is a label, not an instruction. The capstone of
this chapter uses a different annotation, `@Override`, sitting in the
exact same syntactic position — but unlike `Reminder`, nothing reads
it optionally: `javac` itself checks it, every time, which the next
lesson proves directly, now that a real parent-child relationship
exists to check it against.

## What Breaks Without This

There's nothing to break in this lesson specifically — the entire point
was proving that *nothing* breaks, and nothing changes, when an
annotation is present versus absent. Confirm this yourself: delete the
`@Reminder(...)` line entirely from `Task.java` (before you delete the
whole file per the instructions above) and rerun `AnnotationDemo`. The
output is identical either way.

## Exercises

1. Add a second annotation use, `@Reminder("this one too")`, above
   `logStart()` as well. Run the program again and confirm the output
   is still completely unchanged.

## Definition of Done

- [ ] You ran the `Reminder`/`Task`/`AnnotationDemo` lab yourself and
      confirmed the annotation had zero effect on the real output.
- [ ] You can explain, in your own words, why an annotation is not the
      same thing as a comment, even though neither one runs.

Next: Chapter 2, Lesson C — a real parent-child class relationship,
and the one annotation, `@Override`, that `javac` itself actually
checks.
