---
series: java-fundamentals
level: 5
title: Primitives vs Objects
lang: java
---

# Primitives vs Objects

Every type used so far falls into one of two genuinely different categories: **primitives** (`int`, `double`, `boolean`, `char`) and **objects** (`String`, arrays, and every class this course writes from Level 7 onward). They behave differently the instant they're copied, passed to a method, or assigned to a second variable — a distinction that causes real, confusing bugs when assumed rather than understood.

## Primitives Are Copied on Assignment

```java
public class Main {
    static void modify(int n) {
        n = 999;
    }

    public static void main(String[] args) {
        int x = 5;
        modify(x);
        System.out.println(x);

        int a = 10;
        int b = a;
        b = 20;
        System.out.println(a);
        System.out.println(b);
    }
}
```

```text
5
10
20
```

`modify(x)` — `x` is `5`. Inside `modify`, the parameter `n` starts as a **copy** of `5`; setting `n = 999` only changes that local copy. `x` back in `main` prints `5`, completely unaffected — proof the method never had any way to reach the real `x` at all.

`int b = a;` — copies `a`'s value (`10`) into a brand-new, independent variable `b`. `b = 20;` changes only `b`; `a` still prints `10` afterward. Two `int` variables holding the "same" value are two entirely separate values in memory — changing one can never affect the other.

## Arrays and Objects Are Shared by Reference

```java
public class Main {
    static void modifyArray(int[] arr) {
        arr[0] = 999;
    }

    static void reassignArray(int[] arr) {
        arr = new int[]{1, 2, 3};
    }

    public static void main(String[] args) {
        int[] a = {1, 2, 3};
        int[] b = a;
        b[0] = 100;
        System.out.println(a[0]);

        modifyArray(a);
        System.out.println(a[0]);

        reassignArray(a);
        System.out.println(a[0]);
    }
}
```

```text
100
999
999
```

`int[] b = a;` — unlike `int b = a`'s value-copy above, this copies a **reference** — a pointer to the same array in memory. `a` and `b` are two different variable names for the exact same underlying array. `b[0] = 100;` changes the array itself, so `a[0]` also reads `100` — there was only ever one array.

`modifyArray(a)` — `arr` inside the method is a *copy of the reference*, not a copy of the array — it still points at the same real array `a` does. `arr[0] = 999;` reaches through that shared reference and really does change the array `a` refers to, which is why `a[0]` prints `999` afterward, unlike `modify(x)`'s primitive case above.

`reassignArray(a)` — `arr = new int[]{1, 2, 3};` makes the *local copy of the reference*, `arr`, point at a brand-new array instead. It does **not** change what `a` itself points to back in `main` — `a[0]` still prints `999`, the value `modifyArray` left behind, completely unaffected by `reassignArray`'s reassignment. The reference itself was copied by value into the parameter — exactly like `modify(x)`'s `int` was — even though what that reference *points to* is shared.

## The Same Rule Applies to Every Object

```java
public class Main {
    static class Point {
        int x, y;
        Point(int x, int y) { this.x = x; this.y = y; }
    }

    static void move(Point p) {
        p.x += 10;
    }

    public static void main(String[] args) {
        Point p1 = new Point(1, 1);
        Point p2 = p1;
        p2.x = 99;
        System.out.println(p1.x);

        move(p1);
        System.out.println(p1.x);
    }
}
```

```text
99
109
```

`Point p2 = p1;` — same rule as the array above: `p2` is a second reference to the exact same `Point` object `p1` already points to, not a new, independent `Point`. `p2.x = 99;` changes the one shared object, so `p1.x` reads `99` too.

`move(p1)` — `p` inside `move` is a reference-copy pointing at that same object; `p.x += 10;` reaches through it and really does change `p1`'s own `x`, exactly the way `modifyArray` changed `a`'s contents. `109` — `99` plus the `10` `move` added.

**CS lens:** This is the exact same value-vs-reference split most languages make somewhere — Python's `int` vs `list`, JavaScript's `number` vs `object`, C#'s `struct` vs `class` (Level 5 of the earlier C# curriculum in this course, if you've taken it). Java simplifies the question to exactly two categories: the handful of primitive types are always copied by value; every single object type — `String`, arrays, every class ever written — is always accessed through a shared reference. There's no third option and no way to opt out of either behavior for a given type.

**SE lens:** This is why methods that need to hand back a "modified" primitive must `return` a new value (as Level 1's `grade` did), while methods that mutate an object's fields directly (`move`, `modifyArray`) don't need to return anything at all — the caller's own object already changed, because there was only ever one object to begin with. Confusing the two is a real, common bug: expecting `modify(x)` to change `x` the way `move(p1)` changes `p1` is exactly the mistake this lesson's first example was built to make visible.

## Challenge: describe_type

Write a `static String describeType(String typeName)` method that returns `"copied on assignment"` when `typeName` is `"int"`, `"boolean"`, or `"double"` (primitives), and `"shared by reference on assignment"` for any other `typeName` (an array or object type).

```challenge
static String describeType(String typeName) {
    // TODO
}
```

```test
assert describeType("int").equals("copied on assignment")
assert describeType("boolean").equals("copied on assignment")
assert describeType("double").equals("copied on assignment")
assert describeType("array").equals("shared by reference on assignment")
assert describeType("object").equals("shared by reference on assignment")
```
