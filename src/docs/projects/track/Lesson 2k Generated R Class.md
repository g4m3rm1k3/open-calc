# Lesson 2k: The Generated `R` Class

**What you will build:** No new code to compile — this reads a real,
verified generated artifact directly.

**What you need to know first:** Lesson 2j's Android resources, Lesson
0b's nested class, Lesson 0i's class-level state.

**Terms introduced in this lesson:**

- **Generated `R` class** — a class Android's build tools generate
  automatically, giving every resource a compile-time-checked integer
  constant instead of an error-prone raw string or file-path lookup.

---

## Concept Unit: The Generated `R` Class

### The Problem

Lesson 2j's `welcome_message` resource needs some way for Java code to
actually refer to it. Referring to it by a raw string
(`loadString("welcome_message")`) or a raw file path reintroduces
exactly the problem resources were meant to solve: a typo in that
string would only be discovered at runtime, if ever, on whatever
specific code path happens to execute it.

### Introduce the Concept in Isolation

This is not a throwaway lab — it's a real, verified generated artifact,
built automatically from Lesson 2j's own `strings.xml`:

```java
public final class R {
    public static final class string {
        public static final int app_name = 0x7f0f001c;
        public static final int welcome_message = 0x7f0f001d;
    }
}
```

This is the `generated R class` — **first appearance**: a class
Android's build tools generate automatically, giving every resource a
compile-time-checked integer constant instead of an error-prone raw
string or file-path lookup. It is never hand-written — the build tools
regenerate it every time a resource file changes, keeping it
permanently in sync with the actual contents of `res/`. Java code
writes `R.string.welcome_message`, resolved by the compiler to one
specific generated integer constant, checked at compile time exactly
like any other field access.

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — the generated `R` class is
a real, verified project artifact.

### Mechanical Walkthrough

1. `public final class R { public static final class string { ... } }`
   — **(a) first appearance** of the generated class's real shape: a
   nested `string` class (Lesson 0b's nested classes, reused, **(b)**),
   holding one `static final int` constant (Lesson 0i's class-level
   state, reused, **(b)**) per string resource, each an
   automatically-assigned integer.
2. `R.string.welcome_message` — the symbolic reference Java code
   actually writes, resolved by the compiler to one specific generated
   integer constant.

### CS Lens

The generated `R` class turns "does this resource exist, spelled
correctly" from a runtime question (a typo'd file path simply fails to
find anything, discovered only when that code actually runs) into a
compile-time one (a typo'd `R.string.welcom_message` fails to compile
at all, since no such constant was ever generated). This is a real,
load-bearing example of the same static-checking value Lesson 0u's
generics already established, applied here to resource references
instead of container element types.

Also recognized in: any build system that generates typed bindings
from a non-code asset (a GraphQL schema generating typed query
functions, a database schema generating typed row classes) — the
general shape of "generate compile-time-checked code from a separate,
non-code description."

### SE Lens

The alternative — referring to resources by raw string or file path
directly in Java code — was not chosen because a typo in that string
would only be discovered at runtime, if ever. The generated `R` class
converts this entire category of mistake into a compile error, the
same tradeoff already justified for `List<String>` in Lesson 0v: real
compile-time safety, in exchange for a build step neither file could
have provided by itself.

---

## Connect the Pieces

Lesson 2j's `strings.xml` holds real UI content, separate from code.
This lesson's generated `R` class is what makes that content safely,
symbolically referenceable from Java code, the same compile-time-
checked payoff generics already delivered for collections.

## What Breaks Without This

Referring to a resource by a raw string that doesn't match any real
resource name produces a runtime failure, discovered only when that
exact code path executes — contrasted directly against
`R.string.welcom_message` (misspelled), which produces a real compiler
error instead, since no such generated constant exists at all.

## Exercises

1. Write out, by hand, what the generated `R` class entry for a new
   `goodbye_message` string resource would look like, following this
   lesson's real example.
2. Explain, in your own words, why the `R` class is never hand-written
   or hand-edited.
3. Explain, in your own words, why `R.string.welcome_message` is
   checked at compile time while a raw string lookup would not be.

## Definition of Done

- [ ] You read the real generated `R` class shape and can explain what
      each nested level represents.
- [ ] You completed Exercise 1.
- [ ] You can state, without looking back at this lesson, why a typo in
      `R.string.welcome_message` fails to compile.
