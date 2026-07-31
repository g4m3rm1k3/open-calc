# Lesson 0u: Generics — One Implementation, Many Types

**What you will build:** A disposable lab. Today's case study: writing
one class that works correctly with many different types, still fully
checked by the compiler.

**What you need to know first:** Lesson 0a's `class`, Lesson 0q's
`interface`.

**Terms introduced in this lesson:**

- **Generics (type parameters)** — a type parameter that lets one
  implementation work correctly with many types while still being
  checked at compile time.

---

## Concept Unit: Generics — One Implementation, Many Types

### The Problem

A container that holds exactly one `Dog` is easy to write — a field of
type `Dog`. A container that holds exactly one `Cat` needs the same
code, retyped, with `Dog` replaced by `Cat` everywhere. Writing that
same container once per type it might ever hold doesn't scale, and
worse: a `Box` written specifically for `Dog` gives up any way for the
compiler to catch a mistake if some other type is put in accidentally,
unless it's rewritten by hand for every type it needs to hold safely.

### Introduce the Concept in Isolation

```
mkdir lesson-0u
cd lesson-0u
```

Create `Main.java`:

```java
class Box<T> {
    private T contents;

    void put(T item) {
        contents = item;
    }

    T get() {
        return contents;
    }
}

public class Main {
    public static void main(String[] args) {
        Box<String> stringBox = new Box<String>();
        stringBox.put("Rex");
        System.out.println(stringBox.get());

        Box<Integer> intBox = new Box<Integer>();
        intBox.put(3);
        System.out.println(intBox.get());
    }
}
```

Compile and run it:

```
javac Main.java
java Main
```

The terminal prints:

```
Rex
3
```

`class Box<T> { ... }` is `generics` — **first appearance**: a type
parameter that lets one implementation work correctly with many types
while still being checked at compile time. `T` is a placeholder — a
**type parameter** — standing in for whatever real type is chosen when
`Box` is actually used. `Box<String>` and `Box<Integer>` are the *same*
class, `Box`, used with two different types substituted for `T`, with
the compiler checking each usage against its own chosen type.

### Discard the Throwaway Example

This version is deleted now. It will not appear again.

### Mechanical Walkthrough

1. `class Box<T> { ... }` — **(a) first appearance.** `<T>` declares a
   type parameter named `T` (a conventional single-letter name for
   "the type this class works with," not a required one).
2. `private T contents;` — a field declared with the type parameter
   itself as its type: whatever real type `T` becomes, `contents`
   holds exactly that type.
3. `void put(T item)` and `T get()` — a method taking `T` as a
   parameter, and a method returning `T`. Genuinely basic method syntax
   — the new fact is only that `T` is used as an ordinary type here,
   exactly like `String` or `int` would be.
4. `Box<String> stringBox = new Box<String>();` — **(a) first
   appearance** of choosing a real type for `T`: everywhere `Box`'s own
   code says `T`, this specific `stringBox` behaves as though it said
   `String`. `put` only accepts a `String`; `get` returns a `String`.
5. `Box<Integer> intBox = new Box<Integer>();` — the same class, `Box`,
   used again with `Integer` (Java's object wrapper for `int`, needed
   here since a type parameter cannot be a primitive type directly)
   chosen for `T` instead. No new code was written for this — `Box`'s
   single declaration serves both cases.

### CS Lens

Generics let a type parameter stand in for a real type, checked at
compile time rather than left to run and possibly fail. This is
fundamentally different from Java's collections before generics
existed (and from Python's containers today): a `Box` without generics
would need to hold `Object` (Java's universal base type) and require an
explicit cast every time something is taken back out, with no
compile-time guarantee the cast is even correct. `Box<T>` gives that
guarantee for free.

Also recognized in: generics in C# (`Box<T>`, essentially identical
mechanism to Java's), templates in C++ (a related but more powerful
mechanism, resolved at compile time via code generation per type rather
than Java's type-erasure approach), type hints on Python's `list[str]`
(documentation only, never enforced by the interpreter — a real,
consequential contrast worth naming).

### SE Lens

The alternative — writing `StringBox`, `IntBox`, `DogBox`, one
hand-typed class per type ever needed — was not chosen because it
multiplies the same logic across every type, and any bug fix or
behavior change to `Box` would need to be repeated identically in
every copy. Generics let `Box` be written exactly once, correct for
every type that will ever be substituted for `T`, present and future.

---

## Connect the Pieces

`class Box<T>` proved a type parameter lets one implementation work
correctly with many types, checked at compile time. The next lesson
(`List`/`ArrayList`) shows this exact mechanism used for real, in
Java's own standard library.

## What Breaks Without This

Try `stringBox.put(3);` (an `int`, not a `String`) against
`Box<String> stringBox`. Compile it yourself to see the real compiler
error — the type parameter locks `put` to only accept `String`, caught
before the program ever runs.

## Exercises

1. Change `Box<T>` to `Box<Dog>` using Lesson 0a's `Dog` class,
   confirming a user-defined class works as a type parameter exactly
   like `String` or `Integer` did.
2. Add a second method, `boolean isEmpty()`, returning whether
   `contents` is `null`.
3. Try `stringBox.put(3);` yourself, read the real compiler error, then
   remove the line.

## Definition of Done

- [ ] You ran the `Box<T>` example with two different types and saw
      both real outputs.
- [ ] You completed Exercise 3 and saw the real compiler error.
- [ ] You can state, without looking back at this lesson, what `T`
      stands for in `Box<T>`.
