# Lesson 6d: Generics — One Class, Many Types, Checked at Compile Time

**What you will build:** Nothing added to Pocket Inventory yet — two
throwaway labs, run outside the Android project. The transferable
problem: the `Adapter` you're about to build (Lesson 6e) needs to store
a list of data (for now, item names) and hand that same list to
`RecyclerView`. A `List` that could hold *anything* — any type, mixed
together — sounds flexible, but it pushes a real problem to the moment
you actually read an item back out: you'd have to guess, and cast, and
hope you guessed right.

**What you need to know first:** Lesson 2a (class, object, fields,
`this`), Lesson 2d (casting appears here for the first time as a
concept, in one line — flagged, not deeply explained, since the whole
point of this lesson is showing why you usually don't want to need it).

---

## Concept Unit: Generics — One Class, Many Types, Checked at Compile Time

### The Problem

The `Adapter` you're about to build needs to store a list of data (for
now, item names) and hand that same list to `RecyclerView`. A `List`
that could hold *anything* — any type, mixed together — sounds
flexible, but it pushes a real problem to the moment you actually read
an item back out: you'd have to guess, and cast, and hope you guessed
right.

### Introduce the Concept in Isolation

See the actual failure first, with a deliberately "flexible" box that
holds anything at all. Create a folder for this lesson's labs (plain
folder, no `package` line — Lesson 2a's convention). Inside it, create
`ObjectBox.java`:

```java
class ObjectBox {
    private Object value;

    void set(Object value) {
        this.value = value;
    }

    Object get() {
        return value;
    }
}
```

`Object` — **first appearance.** Every class in Java, including every
one you've written, is automatically a kind of `Object` — it's the
one type broad enough to hold a reference to *any* object at all,
`String`, `Integer`, `LightSwitch`, anything. `set`/`get` here accept
and return that broadest possible type, which is exactly what makes
this class "flexible" and also exactly what's about to go wrong.

In the same folder, create `GenericsDemoBad.java`:

```java
public class GenericsDemoBad {
    public static void main(String[] args) {
        ObjectBox box = new ObjectBox();
        box.set("hello");

        Integer number = (Integer) box.get();
        System.out.println(number);
    }
}
```

`(Integer) box.get()` — **first appearance of a cast in running code**
(Lesson 2d mentioned casting exists; this is it, used for real). `box.get()`
returns a plain `Object`, but this line claims, explicitly, "trust me,
what's actually in there is an `Integer`" — a cast doesn't convert
anything; it's a claim to the compiler, checked at runtime, that may
turn out to be false.

Compile and run this yourself:

```
javac ObjectBox.java GenericsDemoBad.java
java GenericsDemoBad
```

Real output — this compiles fine, then crashes:

```
Exception in thread "main" java.lang.ClassCastException: class java.lang.String cannot be cast to class java.lang.Integer (java.lang.String and java.lang.Integer are in module java.base of loader 'bootstrap')
	at GenericsDemoBad.main(GenericsDemoBad.java:6)
```

What this proves: `ObjectBox` compiled without complaint even though
`box` was set to a `String` and read back as an `Integer` — `Object`
can hold anything, so the compiler has no way to catch the mismatch.
The bug only surfaces at runtime, as a crash, and only because this
particular test happened to exercise the wrong combination — a genuine
type mistake that the compiler had every opportunity to catch and
didn't, because `Object` throws away that information.

Now the fix — the same class, made **generic**. In the same folder,
create `Box.java`:

```java
class Box<T> {
    private T value;

    void set(T value) {
        this.value = value;
    }

    T get() {
        return value;
    }
}
```

Create `GenericsDemoGood.java`:

```java
public class GenericsDemoGood {
    public static void main(String[] args) {
        Box<String> box = new Box<>();
        box.set("hello");

        String value = box.get();
        System.out.println(value);
    }
}
```

Compile and run:

```
javac Box.java GenericsDemoGood.java
java GenericsDemoGood
```

Real output — verified this session:

```
hello
```

Now prove the compiler actually catches the mismatch this time, rather
than crashing later. Create `GenericsDemoReject.java`:

```java
public class GenericsDemoReject {
    public static void main(String[] args) {
        Box<String> box = new Box<>();
        box.set(42);
    }
}
```

```
javac GenericsDemoReject.java
```

Real compiler output, this session — this genuinely fails to compile:

```
GenericsDemoReject.java:4: error: incompatible types: int cannot be converted to String
        box.set(42);
                ^
1 error
```

What this proves: `Box<T>` is one class definition that works
correctly for `Box<String>`, `Box<Integer>`, or any other type — `T` is
a placeholder, filled in with a real type wherever `Box` is actually
used — and the compiler enforces, for each specific instance, that only
the matching type ever goes in or comes out. The exact same class of
mistake `ObjectBox` let through silently, `Box<T>` rejects immediately,
at compile time, with a clear error pointing at the exact line.

### Discard the Throwaway Example

Delete `ObjectBox.java`, `GenericsDemoBad.java`, `Box.java`,
`GenericsDemoGood.java`, and `GenericsDemoReject.java` — the real
project uses `List<String>`, part of the standard library, built on
this exact same mechanism.

### Mechanical Walkthrough

- `class Box<T>` — **first appearance of a type parameter.** The `<T>`
  after the class name declares it: `T` is a stand-in name (by
  convention a single capital letter), filled in with a real, concrete
  type — `String`, `Integer`, anything — at the point `Box` is
  actually used.
- `Box<String> box = new Box<>();` — **first appearance of using a
  generic type.** `<String>` on the left fills in what `T` means for
  *this specific* `box` variable; `<>` on the right (the **diamond
  operator**) means "infer the type from the left-hand side" rather
  than repeating `<String>` twice.
- `private T value;` / `void set(T value)` / `T get()` — every place
  `Box` mentions "the type it holds," it uses `T` instead of a fixed
  type — the compiler substitutes the real type in for every specific
  instance.

### CS Lens

This is **generic programming** — writing one class or method that
works correctly across many types, with the compiler checking each
specific use for you, rather than either duplicating the class per
type (`StringBox`, `IntegerBox`, ...) or using a common supertype like
`Object` and losing all compile-time checking. `List<String>` — which
the real `Adapter`, next, is built around — is the standard library's
own `Box`-like generic class, already written for you. Also recognized
in: TypeScript's and C#'s own `<T>` generics (near-identical syntax and
purpose), Python's `list[str]` type hints (checked by external tools
like mypy rather than the language itself), and C++ templates (a more
powerful but more complex relative of the same idea).

### SE Lens

**`ObjectBox` already worked for every type with no `<T>` at all — why
pay for the extra syntax `Box<T>` requires?** `ObjectBox` only *looked*
like it worked for every type; what it actually did was defer every
type mismatch to runtime, silently, until some specific combination of
values happened to exercise the bug — exactly what `GenericsDemoBad`'s
crash demonstrated, on a mismatch that existed the moment the code was
written, just not caught until it ran. The alternative to generics
isn't "no cost at all," it's one of two real costs: `ObjectBox`'s
runtime-crash risk, or hand-writing a separate `StringBox`,
`IntegerBox`, `LightSwitchBox` class per type, which trades the crash
risk for genuine code duplication — the same bug fix now has to be
copied into every duplicate class by hand. `Box<T>`'s extra angle-bracket
syntax is the one-time cost of getting neither: one real class
definition, and the exact mismatch `ObjectBox` let through caught at
compile time instead, at the line that actually caused it.

### Connection

`List<String>` in the `Adapter` you're about to build (Lesson 6e) is
exactly this mechanism, already provided by the standard library — a
real `List` holding real `String`s, with the compiler rejecting any
attempt to insert or retrieve the wrong type, the same guarantee
`Box<T>` just demonstrated. `RecyclerView.Adapter<VH>` itself, which
`InventoryAdapter` will extend, is also generic — its own `<VH>` type
parameter is filled in with `InventoryViewHolder` from Lesson 6c,
using this exact mechanism a second time in the same lesson.

---

## Connect the Pieces

One trace through both labs: `ObjectBox` let a `String` masquerade as
anything, including an `Integer`, and the mistake wasn't caught until
the exact line that tried to use it — a runtime crash, potentially far
from the actual bug (imagine `set` and `get` being called from
different files, days apart, in a real project). `Box<T>` closes that
same gap at compile time, before the program ever runs, by making the
type promise explicit and checked. Everywhere `List<String>` appears
in the rest of this project, it's this exact guarantee at work.

## What Breaks Without This

In the `Box<T>` lab (before deleting it), change `Box<String> box = new
Box<>();` to `Box box = new Box();` — dropping the type parameter
entirely (Java allows this for backward compatibility with code written
before generics existed, called a "raw type"). Now `box.set(42)`
compiles without complaint, and `String value = box.get();` also
compiles — but crashes at runtime with the same `ClassCastException`
shape as `ObjectBox` did. This is what "generics are a compile-time-only
guarantee, easy to accidentally opt out of" actually looks like in
practice. Restore the `<String>`/`<>` before deleting the lab.

## Exercises

1. Modify `Box<T>` to also print a message from inside `set`, showing
   what type of value was just stored — you'll need `value.getClass()`,
   a method every object has (since every class is ultimately an
   `Object`), which returns an object describing the value's real
   runtime type. Try it with `Box<String>` and predict what prints.
2. Declare a `Box<Box<String>>` — a box holding another box, which
   itself holds a `String` — and confirm it compiles and works.
   Convince yourself type parameters can nest.

## Definition of Done

- [ ] You ran the `ObjectBox`/`GenericsDemoBad` lab yourself and saw
      the real `ClassCastException` crash, not just read about it.
- [ ] You ran the `Box<T>` lab and saw both the successful case and the
      real compile-time rejection.
- [ ] You can explain, in your own words, why `Box<T>` is strictly
      better than `ObjectBox` for this use case.
- [ ] No git commit for this lesson — nothing here becomes part of
      Pocket Inventory; everything was deleted per the instructions
      above.

Lesson 6e is next: the real `InventoryAdapter` — `InventoryViewHolder`
from 6c, nested inside it exactly as promised, using generics from this
lesson to connect it all to `RecyclerView`.
