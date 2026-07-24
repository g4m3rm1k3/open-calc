# Java Reference — Beginner to Full Syntax

A browsable Java reference, not a course: no lessons, no exercises, no
order to follow. Hit a piece of Java syntax that doesn't make sense
while reading anything — [`track/`](../projects/track/)'s Android
lessons, or anywhere else — come here, find the topic, read the
example, see the real output, move on.

**Every code block on every page was actually compiled and run with
`javac`/`java` this session** — the output shown is real, not
predicted. If you ever see behavior that doesn't match what's written
here, trust your own terminal; something in your environment differs
and is worth tracking down.

## Topics

1. [Syntax Basics](01-syntax-basics.md) — variables, primitive types,
   operators, `if`/`switch`, loops, arrays, `String` basics, casting,
   `var`
2. [Classes and Objects](02-classes-and-objects.md) — fields,
   constructors, `this`, methods, overloading, `toString`, `equals`/
   `hashCode`, `instanceof` and casting
3. [Access Modifiers and Encapsulation](03-access-modifiers-and-encapsulation.md)
   — `public`/`protected`/package-private/`private`, side by side, plus
   why private fields + methods matter
4. [Inheritance and Polymorphism](04-inheritance-and-polymorphism.md) —
   `extends`, `super`, overriding, `abstract` classes, `final` classes,
   dynamic dispatch
5. [Interfaces and Lambdas](05-interfaces-and-lambdas.md) — `interface`,
   `implements`, `default` methods, functional interfaces, lambda
   expressions, method references
6. [Generics](06-generics.md) — generic classes, bounded type
   parameters, generic methods, wildcards
7. [Collections and Streams](07-collections-and-streams.md) — `List`,
   `Set`, `Map`, `Iterator`, the `Collections` utility class, the
   Stream API
8. [Exceptions](08-exceptions.md) — `try`/`catch`/`finally`,
   multi-catch, checked vs. unchecked, custom exceptions,
   try-with-resources
9. [`static`, `final`, and Nested Classes](09-static-final-and-nested-classes.md)
   — every meaning of `static` unified, every meaning of `final`, inner
   vs. static nested classes, anonymous and local classes
10. [Enums and Records](10-enums-and-records.md) — `enum` (with fields,
    with per-constant behavior), `record` and its compact constructor
11. [Wrapper Classes and Formatting](11-strings-and-wrapper-classes.md)
    — autoboxing/unboxing, the `Integer` caching gotcha, parsing,
    `String.format`, text blocks
12. [Packages, Annotations, and Concurrency](12-packages-annotations-and-concurrency.md)
    — `package`/`import`, `@Deprecated`/`@SuppressWarnings`, `Thread`/
    `Runnable`, race conditions and `synchronized`

## How to Use This

Not sequential — nothing here assumes you've read an earlier page
first, though later pages do cross-link to earlier ones where a concept
genuinely builds on another (e.g. generics come up again inside
Collections and Streams). Search this folder's files for a keyword, or
just scan the topic list above for whichever one sounds closest to
whatever's confusing you.
