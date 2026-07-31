# Chapter 1 Glossary

**Capstone:** Lesson 1B, "Where Your Code Actually Lives."

Every term below was found by reading the capstone's own text and
asking what it uses without explaining. Grouped by which lesson in this
chapter actually teaches it — not alphabetical, so the grouping itself
shows the dependency order.

## Covered in 1A — The Shape of a Java Program

- **`class`** — the required container every line of Java code must
  live inside; nothing can run at a file's top level the way it can in
  Python or JavaScript.
- **Access modifier / `public`** — a keyword controlling which other
  code is allowed to see and use a class or method; `public` means
  "anything, anywhere, can see this."
- **`main` method / entry point** — the one exact method shape,
  `public static void main(String[] args)`, the JVM looks for inside a
  named class to begin running a program.
- **`static`** — means a method belongs to the class itself rather than
  to an object made from the class; this is what lets the JVM call
  `main` before any object exists.
- **Return type / `void`** — the type of value a method declares it
  hands back; `void` means "returns nothing," checked by the compiler.
- **Parameter list / array (`String[]`)** — an array is a fixed-size,
  ordered list of values; `String[] args` is an array of `String`
  values passed in from the command line.
- **`System.out.println` / method call syntax** — Java's built-in print
  statement, and the general `.methodName(...)` shape for calling a
  method that belongs to an object.
- **Statement / semicolon** — Java requires a semicolon at the end of
  every statement, where Python uses line breaks and JavaScript makes
  it optional.
- **Compiler (`javac`) / bytecode / JVM (`java`)** — Java's two
  separate steps, translate-then-run, replacing the one step Python and
  JavaScript hide from you.

## Covered in 1B — Where Your Code Actually Lives (the capstone itself)

- **Package declaration** — a compiler-checked claim, at the top of a
  `.java` file, that the file lives at the end of a matching folder
  path.
- **`-d` compiler flag** — tells `javac` to place compiled output into
  a proper package-based folder structure, instead of next to the
  source file.
- **Fully-qualified name** — a class's full identity from the
  compiler's point of view, package path included
  (`com.example.pocketinventory.Greeter`, not just `Greeter`).
- **Android Studio project wizard** — creates the folder structure that
  matches a package name automatically, the same thing the `-d` flag
  proved by hand, plus supporting configuration this chapter's own
  later lessons explain.

## Deferred — not covered in this chapter

Nothing. Once 1A closes the "basic Java syntax" gap, 1B's own scope was
already correct for a from-scratch reader — no node in this chapter's
tree needed to be pushed to a later one.

**Lessons in this chapter, in reading order:**
1. `Chapter 1a The Shape of a Java Program.md` — written
2. `Chapter 1b Where Your Code Actually Lives.md` — written
