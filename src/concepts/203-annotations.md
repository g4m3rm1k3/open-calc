---
concept: 203-annotations
name: Annotations (Java)
---

## Definition

An annotation is metadata attached to code (`@Override`, `@Deprecated`,
`@Test`) that doesn't directly change a program's runtime logic itself,
but provides information the COMPILER, tooling, or a framework can read
and act on — via source-level checks, compile-time processing, or runtime
reflection.

## Problem

Some information about code (this method is meant to override a parent's
method, this method is a unit test the test runner should execute, this
field should be automatically injected by a framework) doesn't fit
naturally into the code's own executable logic — it's information ABOUT
the code, for tools and frameworks to consume. Annotations provide a
standard, structured way to attach that metadata directly onto
declarations, without inventing ad hoc comments or naming conventions for
tools to parse.

## Execution

`@Override` tells the COMPILER "this method is intended to override a
superclass method" — if it DOESN'T actually override anything (a typo in
the method name, wrong parameter types), the compiler reports an ERROR
instead of silently creating an unrelated new method
↓
`@Deprecated` tells both the compiler and IDE tooling "this method
shouldn't be used anymore" — calling it produces a compiler WARNING,
without preventing compilation entirely
↓
A framework-defined annotation like `@Test` is scanned for via reflection
at runtime by a TEST RUNNER, to know WHICH methods to actually execute
as tests — the annotation itself does nothing on its own; it's
meaningless without the framework that reads it
↓
Annotations can carry their own DATA too, letting them configure how the
reading tool/framework should behave

## Computer Science

Annotations are pure metadata — they have zero effect on a program's
actual execution unless something (the compiler, a build tool, or
runtime reflection) explicitly reads and acts on them; `@Override` is
checked at COMPILE time, while framework annotations like `@Test` are
typically read at RUNTIME via reflection, but in both cases the
annotation itself is just a marker, not executable code.

Tags: Metadata, Compile-time processing, Runtime reflection, Framework configuration

## Software Engineering

Frameworks like Spring and JUnit rely heavily on annotations to reduce
boilerplate configuration — instead of writing verbose external
configuration files describing which classes are "controllers" or which
methods are "tests," annotations let that information live directly next
to the relevant code, discovered automatically via reflection.

Tags: Framework configuration, Reduced boilerplate, Spring/JUnit conventions

## Common Mistakes

- Assuming an annotation itself DOES something at runtime — an annotation on its own is inert metadata; something else (a compiler check, a framework's reflection-based scanner) has to actually be present and looking for that specific annotation for it to have any effect.
- Omitting `@Override` when actually intending to override a method — without it, a typo in the method signature silently creates an unrelated new method instead of overriding the intended one, and the compiler has no way to warn about the mistake without the annotation present.

## Exercises

- Explain specifically what error the compiler reports if `@Override` is placed on a method that doesn't actually match any superclass method's signature.
- Look up how a testing framework like JUnit actually finds and runs methods annotated `@Test` — what runtime mechanism does it use to discover them?

## java

```java
public class Main {
    static class Animal {
        public String speak() { return "..."; }
    }

    static class Dog extends Animal {
        @Override
        public String speak() {   // correctly overrides Animal's speak()
            return "Woof!";
        }
    }

    @Deprecated
    static void oldMethod() {
        System.out.println("this still runs, but is marked deprecated");
    }

    public static void main(String[] args) {
        Animal a = new Dog();
        System.out.println(a.speak());   // Woof! -- Dog's overridden version runs, via dynamic dispatch

        oldMethod();   // still works -- @Deprecated only produces a compiler WARNING, not an error
    }
}
```
Walkthrough: `@Override` on `Dog.speak()` tells the compiler this method
is intended to override `Animal.speak()` — since the signature genuinely
matches, this compiles cleanly and `a.speak()` correctly dispatches to
`Dog`'s version at runtime. `@Deprecated` on `oldMethod` doesn't prevent
it from being called at all (it still runs normally) — it only signals to
the compiler and any IDE that calling it should produce a warning,
demonstrating that annotations are metadata for tooling, not
runtime-blocking mechanisms.
