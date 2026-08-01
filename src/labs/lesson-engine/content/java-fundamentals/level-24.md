---
series: java-fundamentals
level: 24
title: Nested & Anonymous Classes
lang: java
---

# Nested & Anonymous Classes

Level 23's `Counter implements Runnable` was already a class declared *inside* `Main` — without stopping to explain what that actually changes. Java allows a class declaration inside another class in several distinct shapes, each with genuinely different rules about what it can access — plus one more shape, the **anonymous class**, for when a class is needed exactly once and naming it would add nothing.

## A Static Nested Class

```java
public class Main {
    static class Node {
        int value;
        Node next;
        Node(int value) { this.value = value; }
    }

    public static void main(String[] args) {
        Node head = new Node(1);
        head.next = new Node(2);
        System.out.println(head.value + " -> " + head.next.value);
    }
}
```

```text
1 -> 2
```

`static class Node { ... }` — a **static nested class**: declared inside `Main` purely for organization (a `Node` only ever makes sense in the context of something using it, like a linked list `Main` is building here), but otherwise behaves exactly like Level 7's top-level `Rectangle` — `new Node(1)` works the same way `new Rectangle()` did, with no special connection to any particular `Main` object.

This is the shape Level 7's `Stack` challenge and Level 24's own upcoming challenge both use for exactly this reason: a small, tightly-coupled helper type that belongs conceptually inside its one real user, without needing a whole separate top-level file.

## A Non-Static Inner Class

```java
public class Main {
    class Inner {
        void show() {
            System.out.println("Inner sees outerField: " + outerField);
        }
    }

    int outerField = 42;

    public static void main(String[] args) {
        Main outer = new Main();
        Main.Inner inner = outer.new Inner();
        inner.show();
    }
}
```

```text
Inner sees outerField: 42
```

`class Inner { ... }` — no `static` this time: an **inner class**. The real, structural difference from `Node` above: every `Inner` object is tied to one specific `Main` object, and can reach that object's own instance fields directly — `show()` reads `outerField` without ever being handed a `Main` reference explicitly.

`outer.new Inner()` — the real, visible proof of that tie: creating an `Inner` requires an actual `Main` instance to create it *through* (`outer.new Inner()`, not a plain `new Inner()`), because every `Inner` object secretly carries a hidden reference back to the specific `Main` it belongs to.

**SE lens:** A non-static inner class is the right tool specifically when a helper type's entire purpose is manipulating one enclosing object's own state, tightly enough that passing that object in as an explicit constructor argument everywhere would be pure repetition. It's used sparingly in modern Java — a static nested class (needing no outer reference) or a completely separate top-level class is the more common, simpler default; reach for a true inner class only when that implicit outer-object tie is genuinely the point.

## An Anonymous Class

```java
interface Greeter {
    String greet(String name);
}

public class Main {
    public static void main(String[] args) {
        Greeter g = new Greeter() {
            @Override
            public String greet(String name) {
                return "Hello, " + name + "!";
            }
        };
        System.out.println(g.greet("World"));
    }
}
```

```text
Hello, World!
```

`new Greeter() { @Override public String greet(String name) { ... } }` — an **anonymous class**: declares and instantiates a class implementing `Greeter` in one single expression, with no name of its own at all. `g` holds a real object, with a real, compiler-generated class behind it — just one that was never given an identifier the way `Node` or `Inner` were.

**CS lens:** This is genuinely the same problem Level 14's lambdas solve — "a small, one-off piece of behavior, used exactly once" — and for a *pure* functional interface (exactly one abstract method, like `Greeter` here), a lambda (`Greeter g = name -> "Hello, " + name + "!";`) is strictly shorter and does the identical thing. Anonymous classes predate lambdas in Java's own history (added in Java 1.1, over a decade before Java 8's lambdas) and remain the *only* option the moment more than one method needs implementing, or real instance state needs to be held across calls — situations no single lambda expression can express.

**SE lens:** Seeing an anonymous class in real, modern Java code today is a genuine signal worth reading: either the interface it implements has more than one abstract method (ruling out a lambda entirely), or the code predates Java 8, or the author specifically needed the extra state or methods an anonymous class allows and a lambda doesn't. Recognizing this pattern in existing codebases — GUI event listeners are the classic historical example — matters even though writing new anonymous classes for simple, single-method cases has mostly given way to lambdas since.

## Challenge: linked_list_stack

Write a `LinkedListStack` class implementing a stack using a linked list internally:
- A `static class Node` nested inside it, with an `int value` field, a `Node next` field, and a constructor taking both
- A private `Node top` field
- `void push(int value)` — creates a new `Node` pointing at the current `top`, and makes it the new `top`
- `int pop()` — removes and returns the top node's value, moving `top` to `top.next`
- `boolean isEmpty()` — returns whether `top` is `null`

```challenge
class LinkedListStack {
    // TODO
}
```

```test
LinkedListStack s = new LinkedListStack();
assert s.isEmpty()
s.push(1);
s.push(2);
s.push(3);
assert s.pop() == 3
assert s.pop() == 2
assert !s.isEmpty()
assert s.pop() == 1
assert s.isEmpty()
```
