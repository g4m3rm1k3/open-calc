---
concept: 204-autoboxing
name: Autoboxing (Java)
---

## Definition

Autoboxing is Java's automatic conversion between a primitive type
(`int`, `boolean`) and its corresponding wrapper object type (`Integer`,
`Boolean`) — happening implicitly wherever a primitive is used in a
context requiring an object (like adding an `int` to a `List<Integer>`),
without an explicit conversion call.

## Problem

Java's generic collections (`List<T>`, `Map<K, V>`) can only hold
OBJECTS, not primitive values directly — without autoboxing, adding an
`int` to a `List<Integer>` would require manually wrapping it every
single time, adding tedious, repetitive boilerplate. Autoboxing does this
wrapping (and the reverse, unboxing) automatically wherever the context
requires it.

## Execution

Adding a primitive `int` literal to a `List<Integer>` AUTOBOXES it into
an `Integer` object automatically, since the list can only hold objects
↓
Reading it back out UNBOXES it — the `Integer` object is automatically
converted back to a primitive `int`
↓
Comparing two separately-boxed large `Integer` values with `==` prints
`false` — `==` on boxed objects compares OBJECT IDENTITY, not value, and
two separately-boxed large numbers are DIFFERENT objects
↓
Comparing two separately-boxed SMALL `Integer` values with `==` prints
`true` — Java caches small boxed integers (-128 to 127) for reuse, so
these happen to be the SAME cached object — a genuinely surprising
inconsistency caused entirely by an implementation detail

## Computer Science

Autoboxing/unboxing is compiler-inserted syntactic sugar — the compiler
literally inserts calls to box or unbox wherever needed; this convenience
hides a real, meaningful distinction underneath (primitive value
semantics vs. object reference semantics), which is exactly why `==`
behaves inconsistently between small and large boxed integers.

Tags: Compiler-inserted conversions, Integer caching, Value vs reference semantics

## Software Engineering

Comparing boxed wrapper types with `==` is a classic, genuinely
dangerous Java bug — `.equals()` should always be used to compare
wrapper object VALUES, since `==` on objects compares identity, and
Integer caching makes this bug intermittently "work" for small numbers
while silently failing for larger ones, making it especially easy to
miss in testing.

Tags: equals vs ==, Integer caching gotcha, Common interview question

## Common Mistakes

- Comparing boxed wrapper objects (`Integer`, `Long`, etc.) with `==` instead of `.equals()` — this compares object identity, not value, and can silently produce wrong results specifically for values OUTSIDE the small-integer cache range.
- Unboxing a `null` wrapper object automatically (e.g., assigning a `null` `Integer` to a primitive `int` variable) — this throws a `NullPointerException` at the unboxing step, a subtle source of NPEs that don't LOOK like they should be possible from the code's surface appearance.

## Exercises

- Trace through the example below and predict whether each `==` comparison prints `true` or `false` BEFORE checking the actual output — what's the exact cutoff for Java's Integer cache?
- Explain why unboxing a `null` `Integer` into a primitive `int` throws a `NullPointerException`, tracing through what the compiler-inserted conversion actually does.

## java

```java
import java.util.ArrayList;
import java.util.List;

public class Main {
    public static void main(String[] args) {
        List<Integer> nums = new ArrayList<>();
        nums.add(5);   // autoboxing: int 5 -> Integer object
        int first = nums.get(0);   // unboxing: Integer object -> int
        System.out.println(first);   // 5

        Integer a = 1000;
        Integer b = 1000;
        System.out.println(a == b);   // false -- different objects, outside the cached range

        Integer c = 100;
        Integer d = 100;
        System.out.println(c == d);   // true -- both reference the SAME cached Integer object (-128 to 127)

        System.out.println(a.equals(b));   // true -- .equals() correctly compares VALUE, not identity
    }
}
```
Walkthrough: `a == b` is `false` even though both hold the value `1000`,
since `Integer` values outside Java's small-integer cache (-128 to 127)
are separately allocated objects, and `==` compares object identity. `c
== d` is `true` purely because `100` falls WITHIN that cached range, so
both variables happen to reference the exact same cached object — an
inconsistency that makes `==` on boxed types a genuine trap. `a.equals(b)`
correctly returns `true` regardless, since `.equals()` compares the
actual numeric VALUE.
