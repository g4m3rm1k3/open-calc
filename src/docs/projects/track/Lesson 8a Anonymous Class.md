# Lesson 8a: Anonymous Class

**What you will build:** A small, fully runnable, plain Java lab.

**What you need to know first:** Lesson 0q's interfaces and contracts.

**Terms introduced in this lesson:**

- **Anonymous class** — an unnamed class defined and instantiated in a
  single expression, implementing an interface or extending a class
  inline — used when a lambda can't apply.

---

## Concept Unit: Anonymous Class

### The Problem

Lesson 0q already established that a functional interface (exactly one
abstract method) can be implemented concisely with a lambda. An
interface with *two* abstract methods, though, has no single method a
lambda could target — a lambda's own shorthand syntax genuinely cannot
supply an implementation for more than one method at once.

### Introduce the Concept in Isolation

```
mkdir lesson-8a
cd lesson-8a
```

Create `Main.java`:

```java
public class Main {
    interface Converter {
        String toText(int value);
        int fromText(String text);
    }

    public static void main(String[] args) {
        Converter converter = new Converter() {
            @Override
            public String toText(int value) {
                return "#" + value;
            }

            @Override
            public int fromText(String text) {
                return Integer.parseInt(text.replace("#", ""));
            }
        };

        System.out.println(converter.toText(42));
        System.out.println(converter.fromText("#42"));
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
#42
42
```

`Converter` declares two abstract methods, `toText` and `fromText` —
no lambda could target either one alone, since a lambda's shorthand
only ever supplies exactly one method. This is an `anonymous class` —
**first appearance**: an unnamed class defined and instantiated in a
single expression, implementing an interface or extending a class
inline — used when a lambda can't apply. `new Converter() { ... }`
defines a whole, unnamed class implementing both of `Converter`'s
methods, and instantiates it, all in one expression — no separate,
named class file was ever written.

### Discard the Throwaway Example

This version is deleted now. It will not appear again.

### Mechanical Walkthrough

1. `interface Converter { String toText(int value); int
   fromText(String text); }` — **(b) reappearing** interface contract
   from Lesson 0q, now with two abstract methods rather than one,
   ruling out a lambda.
2. `new Converter() { @Override public String toText(...) { ... }
   @Override public int fromText(...) { ... } };` — **(a) first
   appearance**: the anonymous class itself — no name, defined and
   instantiated in this one expression, implementing both required
   methods.
3. `converter.toText(42)` / `converter.fromText("#42")` — both
   methods called normally, through the `Converter` interface
   reference, proving the anonymous class genuinely satisfies the
   full two-method contract.

### CS Lens

An anonymous class is still a real class, compiled to its own
`.class` file (named mechanically, like `Main$1.class`) — the
"anonymous" part is purely about *source-level* naming; the compiler
still needs, and generates, a real name internally. This is the same
underlying mechanism a lambda itself compiles down to in modern Java —
a lambda is closer to sugar over this same anonymous-class shape than
a genuinely different mechanism.

Also recognized in: anonymous inner classes in any JVM language
supporting them, anonymous functions/closures in JavaScript (a
related but not identical idea — JavaScript's are typically
single-function, not multi-method).

### SE Lens

The alternative — writing a separate, fully-named class implementing
`Converter`, in its own file, purely to use it once, right here — was
not chosen because it adds a permanent, separately-named class to the
codebase for a single, local use; an anonymous class keeps the
implementation exactly where it's used, with no separate file needed
for something never reused elsewhere.

---

## Connect the Pieces

`Converter`'s anonymous class demonstrated implementing a
multi-method interface inline, without a separately-named class file.
The next lesson (Serialization) uses this exact same shape for real,
inside a required Android contract.

## What Breaks Without This

Attempting to supply `Converter`'s two-method interface with a lambda
fails to compile at all — a lambda can only ever target a functional
interface, and `Converter` isn't one.

## Exercises

1. Explain, in your own words, why `new Converter() { ... }` compiles
   but `Converter converter = value -> "#" + value;` does not.
2. Add a third method to `Converter` and update the anonymous class to
   implement it.
3. Explain, in your own words, why an anonymous class is still
   compiled to a real, named `.class` file, despite having no name in
   the source code.

## Definition of Done

- [ ] You ran the `Converter` anonymous-class example and can explain
      why a lambda couldn't replace it.
- [ ] You completed Exercise 2.
- [ ] You can state, without looking back at this lesson, why an
      anonymous class is used instead of a separately-named class
      here.
