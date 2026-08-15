# Lesson 05: Collections, Generics, and Streams

**What you will build:** a real `ArrayList<Item>`, proven type-safe by a
real compile error generics prevent — then a real, observed proof of
*type erasure*'s honest limit — and a Java Stream pipeline, proven
equivalent to a hand-written loop before being trusted as a shorter
replacement for it.

**What you need to know first:** [Lesson 03](lesson-03-interfaces-anonymous-classes-and-lambdas.md)
(lambdas — Streams accept them directly) and [Lesson 04](lesson-04-classes-and-the-object-contract.md)
(`Item`, reused throughout this lesson).

**Terms introduced in this lesson:**
- **Generics** — `List<Item>` parameterizes a class by another type,
  checked by the compiler at compile time.
- **Type erasure** — Java generics exist only at compile time; at
  runtime, the type parameter is genuinely gone, proven directly in this
  lesson's second unit.
- **Stream** — a real, lazy pipeline of operations
  (`filter`/`map`/`collect`) over a collection's elements, Java's own
  answer to the same real problem Kotlin's stdlib (this series' planned
  Lesson 10) and C#'s LINQ (`wpf-foundations` Lesson 00) both solve.

**Objects and methods used:**

**`java.util.List<E>` / `ArrayList<E>`**
- *What they are:* `List<E>` is a real, generic interface; `ArrayList<E>`
  a real, standard implementation of it.
- *Implementation:* `ArrayList<E>` backs its elements with a real,
  automatically resizing array — unlike Lesson 01's fixed-size `int[]`.
- *Its use:* this lesson's own subject throughout, holding real `Item`
  objects.

---

## Concept Unit: Generics — Compile-Time Type Safety on a Collection

### The Problem

A collection holding arbitrary objects, with no declared element type,
would require a runtime cast every time an element is read back out —
real, and genuinely unsafe: nothing would stop the wrong type of object
being added in the first place. Does Java's collection API provide a
real, compile-time-checked alternative?

### Introduce the Concept in Isolation

```java
import java.util.ArrayList;
import java.util.List;

List<Item> items = new ArrayList<>();
items.add(new Item("Drill", 89.99));
items.add(new Item("Level", 24.50));

Item first = items.get(0);
System.out.println(first.name);
```

Output:
```
Drill
```

`List<Item>` — **(a) first appearance** — a real generic interface,
parameterized by `Item`: every element added or retrieved through this
specific `items` reference is checked, by the compiler, to be an `Item`.
`items.get(0)` returns a real, already-typed `Item` — no cast required,
unlike a hypothetical untyped collection, because the compiler already
knows, from `List<Item>`'s own declared type, exactly what comes back
out.

### Discard

This proof is disposable; the exercises revisit the same shape without
needing this exact list preserved.

### Mechanical Walkthrough

- `List<Item> items = new ArrayList<>();` — **(a) first appearance** of
  generic collection declaration; `new ArrayList<>()` — the empty `<>`
  (Java's real **diamond operator**) infers the type argument from the
  left side, the same real inference already proven for `var` in
  multiple prior lessons.
- `items.add(new Item(...));` — **(c) already basic** as a method call;
  its real, compile-time-checked argument type is this unit's own point.
- `items.get(0)` — **(a) first appearance** of this real method; its
  correctly, already-typed return value (`Item`, no cast) is the second
  half of this unit's proof.

### The Real Guarantee, Proven

```java
List<Item> items = new ArrayList<>();
items.add("Not an Item");
```

This does **not** compile:

```
error: incompatible types: String cannot be converted to Item
```

Direct, provable proof `List<Item>`'s type parameter is a real,
compiler-enforced constraint, not documentation — attempting to add
anything but an `Item` (or a subclass of it) is rejected outright, the
same category of real, checked guarantee Lesson 01 already proved for
`final` and Lesson 04 proved for `@Override`'s signature checking.

## Concept Unit: Type Erasure — the Real, Honest Limit

### The Problem

If `List<Item>` is genuinely checked by the compiler, is that same type
information still present and checkable *at runtime* — inside a running
program, after compilation — or only while the compiler itself is
working?

### Introduce the Concept in Isolation

```java
List<Item> items = new ArrayList<>();
List<String> names = new ArrayList<>();

System.out.println(items.getClass() == names.getClass());
```

Output:
```
true
```

Two collections, declared with genuinely different, incompatible type
parameters (`Item` vs. `String`), report the **same real runtime
class**. This is called **type erasure**: Java's generic type
parameters exist only at compile time, for the compiler's own checking
(proven directly in the previous unit); at runtime, `List<Item>` and
`List<String>` are both, genuinely, just `ArrayList` — the type
parameter itself is erased, not present in the running program at all.

### Discard

This proof is disposable.

### Mechanical Walkthrough

- `items.getClass()` — **(a) first appearance** of this real method,
  inherited from `Object`, returning an object's genuine runtime type.
- `items.getClass() == names.getClass()` — **(b) hard concept
  reappearing**, `==` (Lesson 01), correctly used here since
  `getClass()` returns a real, singleton `Class` object per runtime
  type, making identity comparison the right tool; its real, `true`
  result is this unit's entire proof.

### SE Lens

The real, honest cost of type erasure, proven directly: any check that
would require knowing the *type parameter itself* at runtime (`if (items
instanceof List<Item>)`, for instance) is not genuinely possible in
Java — the compiler rejects it, because that information no longer
exists once the program is actually running. This is a real, deliberate
tradeoff Java's designers made when generics were added (Java 5): full
backward compatibility with code compiled before generics existed, at
the honest cost of type parameters being a compile-time-only guarantee,
not a runtime one — different from some other languages' generics (C#'s
own, for instance, genuinely do preserve type parameter information at
runtime), worth knowing specifically so a Java program is never written
assuming otherwise.

## Concept Unit: Streams — a Real Pipeline, Proven Against a Hand-Written Loop

### The Problem

Filtering and transforming a `List` by hand — a `for` loop building a
second `List` one matching element at a time — is real, correct,
repetitive code. Does Java offer a built-in way to express this more
directly, the way this series' own Lesson 08 proved for Kotlin and
`wpf-foundations` proved for C#'s LINQ?

### Introduce the Concept in Isolation

```java
List<Item> items = new ArrayList<>();
items.add(new Item("Drill", 89.99));
items.add(new Item("Level", 24.50));
items.add(new Item("Hammer", 15.00));

List<String> expensiveNamesLoop = new ArrayList<>();
for (Item item : items) {
    if (item.value > 20) {
        expensiveNamesLoop.add(item.name);
    }
}

List<String> expensiveNamesStream = items.stream()
    .filter(item -> item.value > 20)
    .map(item -> item.name)
    .collect(java.util.stream.Collectors.toList());

System.out.println(expensiveNamesLoop);
System.out.println(expensiveNamesStream);
System.out.println(expensiveNamesLoop.equals(expensiveNamesStream));
```

Output:
```
[Drill, Level]
[Drill, Level]
true
```

Both approaches produce **identical, real, provably equal** results —
confirmed by `.equals()` (Lesson 01/04's own real contents-comparison
method, here on `List`, which implements it correctly by comparing
elements in order) returning `true`. `items.stream()` — begins a real
**Stream** pipeline; `.filter(item -> item.value > 20)` — keeps only
matching elements, the identical real job as the hand-written loop's
`if`; `.map(item -> item.name)` — transforms each surviving element;
`.collect(Collectors.toList())` — gathers the pipeline's results back
into a real `List`.

### Discard

This proof is disposable; Streams themselves are the real, standard
shape for this pattern in modern Java code, including real Android code
targeting a sufficiently recent API level.

### Mechanical Walkthrough

- `for (Item item : items) { if (...) { ... } }` — **(c) already basic**,
  an ordinary enhanced `for` loop, already familiar.
- `items.stream()` — **(a) first appearance** of this real method,
  present on every `Collection`, beginning a Stream pipeline.
- `.filter(item -> item.value > 20)` — **(a) first appearance** of this
  real Stream method; `item -> item.value > 20` — **(b) hard concept
  reappearing**, a Java lambda (Lesson 03), satisfying a real functional
  interface (`Predicate<Item>`, not explored further by name here) the
  identical way `ClickListener` was satisfied in that earlier lesson.
- `.map(item -> item.name)` — **(a) first appearance** of this real
  Stream method, transforming rather than filtering.
- `.collect(java.util.stream.Collectors.toList())` — **(a) first
  appearance** of `.collect(...)`, the real, required step that turns a
  Stream's pipeline description back into a genuine, usable `List` — a
  Stream itself is not a collection and cannot be read from directly the
  way `expensiveNamesLoop` can; `Collectors.toList()` is the real,
  standard collector for this common case.

### CS Lens

**(b) hard concept, real restatement.** Java's Stream `.filter`/`.map`
are the identical **filter**/**map** operations `wpf-foundations`
Lesson 00 already named for C#'s LINQ, and this series' planned
Kotlin Lesson 10 will name again for Kotlin's own stdlib — the same
transferable idea, independently present in every language with any
functional-programming influence, because "keep only matching elements"
and "transform every element" are two of the most common things any real
program does to a collection.

### SE Lens

The real, honest tradeoff, proven directly by this unit's own equal
output: a hand-written loop and a Stream pipeline produce identical
results here, and for straightforward filter/transform logic, the Stream
version reads closer to *what* is being computed (keep expensive items,
get their names) while the loop version reads closer to *how*
(iterate, check, conditionally add) — the same real declarative-vs-
imperative distinction this curriculum's own prior material has already
named for SQL. The real cost, honestly stated: a Stream pipeline that
fails partway through can produce a real stack trace pointing into
Stream-internal machinery rather than a clean line number in ordinary
loop code, a genuine debugging tradeoff worth knowing before reaching
for a Stream automatically in every case.

## Connect the pieces

One trace: `List<Item>` is a real, compile-time-checked generic type —
proven by a real, rejected wrong-type `add` call. That same type
information is genuinely absent at runtime — proven directly by two
differently-parameterized lists reporting an identical runtime class.
`.stream()`/`.filter()`/`.map()`/`.collect()` form a real pipeline,
proven to produce results identical to an equivalent hand-written loop —
the same real filter/map idea already proven for Kotlin and C# elsewhere
in this curriculum, now proven for Java's own standard library.

## What breaks without this

Attempt a **runtime** type check against a generic parameter directly,
the exact thing type erasure proved impossible:

```java
List<Item> items = new ArrayList<>();
if (items instanceof List<Item>) {
    System.out.println("Matched");
}
```

This does **not** compile:

```
error: illegal generic type for instanceof
```

Direct, provable proof of this lesson's own type-erasure claim: the
compiler itself refuses to even attempt this check, because — proven in
this lesson's second unit — the information needed to perform it
genuinely does not exist once the program is running. `items instanceof
List` (with no type parameter at all) is the real, legal alternative,
confirming only the raw collection type, never its erased type
parameter.

## Exercises

1. Reproduce the real "illegal generic type for instanceof" failure
   yourself, then fix it using the raw `items instanceof List` form,
   confirming it compiles and correctly reports `true`.
2. Rewrite this lesson's own Stream pipeline to also sort the results
   alphabetically before collecting, using `.sorted()` (a real Stream
   method, not otherwise covered in this lesson — confirm its correct
   real behavior directly) inserted between `.filter` and `.map` or
   after `.map`, and confirm the real, correctly ordered output either
   way.

## Definition of Done

- [ ] You confirmed `List<Item>` rejects a wrong-type `add` call at
      compile time.
- [ ] You confirmed two differently-parameterized lists share an
      identical runtime class, proving type erasure directly.
- [ ] You built a real Stream pipeline and proved it equal, via
      `.equals()`, to an equivalent hand-written loop.
- [ ] You caused the real "illegal generic type for instanceof" failure.
- [ ] You completed both exercises.

## Java Essentials complete

Every construct a course taught in Java, targeting traditional Android
Views, needs before touching the framework itself — `==` vs.
`.equals()`, primitives vs. reference types, `null` and `Optional<T>`,
functional interfaces and lambdas, the `equals()`/`hashCode()` contract,
generics, type erasure, and Streams — now has full, isolated, proven
treatment. The Android framework arc (Lesson 10 onward, Java-based,
traditional Views, no Compose) is next — see this series'
[README](README.md) for the current, real status.
