# Generics

Writing (and using) one class or method that works correctly across
many types, with the compiler checking every use. If you're coming from
Python or JavaScript, this is one of the least familiar parts of Java —
neither language has a real compile-time equivalent. Every example on
this page was compiled and run for real.

---

## The Problem Generics Solve

```java
class ObjectBox {
    private Object value;
    void set(Object value) { this.value = value; }
    Object get() { return value; }
}

ObjectBox box = new ObjectBox();
box.set("hello");
Integer number = (Integer) box.get();   // compiles fine...
```

Real output — compiles, then crashes:

```text
Exception in thread "main" java.lang.ClassCastException: class java.lang.String cannot be cast to class java.lang.Integer
```

`Object` can hold anything, so the compiler has no way to catch the
`String`/`Integer` mismatch — it only surfaces at runtime, as a crash.

---

## A Generic Class

```java
class Box<T> {
    private T value;
    void set(T value) { this.value = value; }
    T get() { return value; }
}
```

```java
Box<String> box = new Box<>();
box.set("hello");
box.get();   // "hello" — no cast needed
```

Real output: `hello`

`<T>` after the class name declares a **type parameter** — a
placeholder filled in with a real type at the point `Box` is actually
used. `Box<String>` locks *this specific instance* to `String` only;
attempting `box.set(42)` on a `Box<String>` fails to **compile**,
catching the exact mistake `ObjectBox` let through silently:

```text
error: incompatible types: int cannot be converted to String
```

`<>` (the **diamond operator**, right-hand side) means "infer the type
from the left-hand side" instead of repeating `<String>` twice.

Multiple type parameters are just as legal:

```java
class Pair<K, V> {
    K key;
    V value;

    Pair(K key, V value) {
        this.key = key;
        this.value = value;
    }
}
```

```java
Pair<String, Integer> pair = new Pair<>("age", 30);
```

Real output: `age=30`

---

## What Does `T` Actually Mean?

**`T` is not a keyword, and it is not magic.** It's an ordinary
identifier, chosen by convention — you could name it anything:

```java
class Box<Elephant> {
    private Elephant value;
    void set(Elephant value) { this.value = value; }
    Elephant get() { return value; }
}
```

```java
Box<String> box = new Box<>();
box.set("hello");
box.get();

Box<Integer> numberBox = new Box<>();
numberBox.set(42);
numberBox.get();
```

Real output — this compiles and runs *exactly* like `Box<T>` does:

```text
hello
42
```

Naming the type parameter `Elephant` has nothing to do with an actual
`Elephant` class — it's a placeholder name for "whatever type this
specific `Box` is instantiated with," same as `T`. The convention
(`T` for Type, `E` for Element, `K`/`V` for Key/Value, `R` for Result,
`N` for Number) exists purely so other developers recognize a type
parameter at a glance — it carries zero meaning to the compiler.

**The real question isn't "what is `T`" — it's "what is `Box`/whatever
generic class allowed to *do* with `T`, and why."** That depends
entirely on whether `T` is bounded, which comes down to one fact you
can prove directly: every type parameter, even a completely
"unconstrained" one, is secretly bounded by `Object` already.

```java
class Runner<T> {
    void execute(T thing) {
        thing.run();   // does EVERY possible T have a .run() method?
    }
}
```

Real output — fails to compile:

```text
error: cannot find symbol
        thing.run();
             ^
  symbol:   method run()
  location: variable thing of type T
  where T is a type-variable:
    T extends Object declared in class Runner
```

Read that error's last line carefully: `T extends Object declared in
class Runner` — the compiler is telling you, explicitly, that an
"unconstrained" `T` was never actually unconstrained; it's implicitly
`T extends Object`, because every single class in Java, without
exception, is an `Object`. That's exactly why this compiles fine even
with no bound at all:

```java
class Box2<T> {
    T value;
    Box2(T value) { this.value = value; }

    String describe() {
        return "Box2 contains: " + value.toString() + " (hashCode=" + value.hashCode() + ")";
    }
}
```

Real output: `Box2 contains: hello (hashCode=99162322)`

`.toString()` and `.hashCode()` (see
[02-classes-and-objects.md](02-classes-and-objects.md)) work on *any*
`T` with zero bound written, because those are `Object`'s own methods,
and `T`'s real, implicit bound is already `Object`. `.run()` fails
because `Runnable`'s `.run()` method is not one `Object` provides — you
have to say so yourself, explicitly, with `<T extends Runnable>`:

```java
class Runner<T extends Runnable> {
    void execute(T thing) {
        thing.run();   // fine now — every T is guaranteed to have .run()
    }
}

class Task implements Runnable {
    public void run() {
        System.out.println("Task actually running");
    }
}
```

```java
Runner<Task> runner = new Runner<>();
runner.execute(new Task());
```

Real output:

```text
Runner is about to call .run()
Task actually running
```

**This reframes the whole topic into two genuinely different reasons a
class ends up generic:**

1. **Type-safety only — the class never inspects or calls anything
   specific to `T`.** `Box<T>`, `List<T>`, `Pair<K, V>` above: the class
   only ever stores and returns `T`, so an implicit `Object` bound is
   plenty. The entire point is preventing you from mixing up what goes
   in and comes out (`List<String>` rejecting an `Integer`), not
   requiring `T` to do anything in particular.
2. **A required contract — the class needs to actually call a method
   on `T` that not every possible type has.** `Runner<T extends
   Runnable>` above: the bound exists purely so the compiler can
   guarantee `.run()` genuinely exists on whatever `T` turns out to be,
   for every possible caller, checked once, at compile time, instead of
   crashing at runtime for whichever caller happens to pass the wrong
   thing.

### Tying It Back to `RecyclerView.Adapter`

Android's real, actual declaration (not simplified) is:

```java
public abstract static class Adapter<VH extends RecyclerView.ViewHolder> {
    public abstract VH onCreateViewHolder(ViewGroup parent, int viewType);
    public abstract void onBindViewHolder(VH holder, int position);
    // ...
}
```

This is squarely reason #2, not reason #1: `RecyclerView` itself needs
to call real `ViewHolder` methods on whatever `VH` your specific
subclass provides (it manages a pool of them, checks their state,
etc.) — an unconstrained `Adapter<T>` would leave `RecyclerView` in
exactly `Runner<T>`'s position above, unable to call anything on `T`
except what bare `Object` provides. `<VH extends RecyclerView.ViewHolder>`
is the compiler-enforced guarantee that whatever concrete `ViewHolder`
subclass you write (`InventoryViewHolder`, see this curriculum's
Android track Lesson 6) really does have everything `RecyclerView`
itself needs to call on it.

That explains the *bound*. It doesn't yet explain why *your own*
`InventoryAdapter` has to write `<InventoryAdapter.InventoryViewHolder>`
specifically, instead of leaving it as plain `RecyclerView.ViewHolder`.
See the concrete payoff directly, with the same shape as `Adapter`
stripped down to just the part that matters — one abstract method that
*creates* something, one regular method that *uses* what was created:

```java
class Widget {
    void widgetOnlyMethod() {
        System.out.println("Widget method called");
    }
}

class Gadget extends Widget {
    void gadgetOnlySpecialMethod() {
        System.out.println("Gadget-specific method called");
    }
}

abstract class FactoryNoGenerics {
    abstract Widget create();   // NOT generic — always returns the base type

    void process(Widget item) {
        item.widgetOnlyMethod();
        ((Gadget) item).gadgetOnlySpecialMethod();   // manual cast required
    }
}

class GadgetFactoryNoGenerics extends FactoryNoGenerics {
    Widget create() {
        return new Gadget();
    }
}
```

Real output:

```text
Widget method called
Gadget-specific method called
```

It works, but only with a manual cast, `(Gadget) item` — because
`FactoryNoGenerics.create()` is declared to return the *base* type
`Widget`, the compiler genuinely doesn't know, at the call site, that
it's actually holding a `Gadget`. Now the generic version — this is
`Adapter<VH>`'s actual shape:

```java
abstract class Factory<T extends Widget> {
    abstract T create();   // returns T — whatever concrete type YOU specify

    void process(T item) {
        item.widgetOnlyMethod();
    }
}

class GadgetFactory extends Factory<Gadget> {
    Gadget create() {
        return new Gadget();
    }
}
```

```java
GadgetFactory factory = new GadgetFactory();
Gadget g = factory.create();          // a real Gadget — no cast anywhere
g.gadgetOnlySpecialMethod();           // directly callable
```

Real output:

```text
Gadget-specific method called
Widget method called
```

No cast, anywhere. This is the exact, concrete mechanism —
`RecyclerView.Adapter<InventoryAdapter.InventoryViewHolder>` is
`Factory<Gadget>` here, with `InventoryViewHolder` standing in for
`Gadget`: because `InventoryAdapter` supplies `InventoryViewHolder` as
the type argument, `onCreateViewHolder` can be declared to *return*
`InventoryViewHolder` directly (matching `abstract T create()`), and
`onBindViewHolder(InventoryViewHolder holder, int position)` *receives*
a real `InventoryViewHolder` directly — which is the entire reason
`holder.itemNameText.setText(name)` (Lesson 6) can be written with no
cast at all. Without the type argument — if `Adapter` only ever worked
with plain `RecyclerView.ViewHolder` — every single `onBindViewHolder`
in every Android app ever written would need to open with
`InventoryViewHolder holder2 = (InventoryViewHolder) holder;` before
touching anything holder-specific. The type argument you supply is
what the compiler uses to eliminate that cast, everywhere, for you,
automatically — not an arbitrary label, a real, load-bearing part of
the method's actual signature.

---

## Bounded Type Parameters — `<T extends X>`

Sometimes a generic class needs to actually *call a method* on its type
parameter — which requires telling the compiler `T` is at least some
specific type, not literally anything:

```java
class NumberBox<T extends Number> {
    T value;
    NumberBox(T value) { this.value = value; }

    double doubled() {
        return value.doubleValue() * 2;   // .doubleValue() only exists on Number
    }
}
```

```java
NumberBox<Integer> intBox = new NumberBox<>(5);
NumberBox<Double> doubleBox = new NumberBox<>(2.5);
```

Real output:

```text
intBox doubled=10.0
doubleBox doubled=5.0
```

`<T extends Number>` restricts `T` to `Number` or any of its subtypes
(`Integer`, `Double`, `Long`, ...) — enough for the compiler to know
`.doubleValue()` will always exist, no matter which specific numeric
type is actually used. (`extends` here means "is-a" / "is a subtype
of," even for interfaces — the same keyword as class inheritance,
reused for this bound.)

```java
NumberBox<String> box = new NumberBox<>("not a number");
```

Real output — fails to compile:

```text
error: type argument String is not within bounds of type-variable T
  where T is a type-variable:
    T extends Number declared in class NumberBox2
```

---

## Generic Methods

A single *method* can have its own type parameter, independent of any
class-level one:

```java
static <T extends Comparable<T>> T max(T[] items) {
    T best = items[0];
    for (T item : items) {
        if (item.compareTo(best) > 0) {
            best = item;
        }
    }
    return best;
}
```

```java
max(new Integer[]{3, 1, 4, 1, 5});             // 5
max(new String[]{"banana", "apple", "cherry"}); // "cherry"
```

Real output:

```text
max=5
max=cherry
```

One method, written once, correctly finding the maximum of an
`Integer[]` *or* a `String[]` — `<T extends Comparable<T>>` requires
only that whatever `T` ends up being, it knows how to compare itself to
another instance of itself (`.compareTo`), which both `Integer` and
`String` already provide.

---

## Wildcards — `? extends X`

```java
static double sumOfList(List<? extends Number> list) {
    double sum = 0;
    for (Number n : list) {
        sum += n.doubleValue();
    }
    return sum;
}
```

```java
sumOfList(Arrays.asList(1, 2, 3));       // List<Integer>
sumOfList(Arrays.asList(1.5, 2.5));      // List<Double>
```

Real output:

```text
sum of ints=6.0
sum of doubles=4.0
```

`List<? extends Number>` means "a list of *some* specific type that is
`Number` or a subtype of it — I don't need to know or care exactly
which one." This is different from a bounded type parameter
(`<T extends Number>`, above): a wildcard is for a *method parameter*
that accepts several different, unrelated `List<SomeNumberSubtype>`
types without the method itself needing its own type parameter at all.
