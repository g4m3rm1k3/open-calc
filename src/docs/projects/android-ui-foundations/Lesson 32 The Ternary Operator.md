# Lesson 32: The Ternary Operator

**What you will build:** Nothing app-related yet — a disposable example
proving what the ternary operator does and when it's the right,
more-readable choice over a plain `if`/`else`, before it appears in real
project code. The transferable problem: picking one of exactly two
values based on a condition is common enough that most languages have a
compact form for it, and meeting the syntax cold, inline, inside
unfamiliar real code is exactly the kind of "familiar-looking, still a
trap" case worth a proper first look.

**What you need to know first:** Nothing beyond `if`/`else`, already
familiar from before this series began.

**Terms introduced in this lesson:**
- **Ternary operator (`? :`)** — a compact expression form of `if`/`else`
  that produces a value directly, rather than executing a branching
  statement.

**Objects and methods used**
- `System.out.println(...)` — Java's `static` print-to-standard-output
  method, already taught in Lesson 01 — reappears in this lesson's own
  lab exactly as before. The ternary operator is this lesson's own
  subject, given full treatment below.

---

## Concept Unit: An Expression That Picks One of Two Values

### The Problem

Picking one of exactly two values based on a `boolean` condition is
common enough — and simple enough — that writing a full `if`/`else`
block every time can be more ceremony than the decision actually needs.

### Introduce the Concept in Isolation

```java
public class TernaryDemo {
    public static void main(String[] args) {
        int temperature = 30;
        String description = temperature > 20 ? "warm" : "cold";
        System.out.println(description);

        temperature = 10;
        description = temperature > 20 ? "warm" : "cold";
        System.out.println(description);
    }
}
```

Compile and run:

```
javac TernaryDemo.java
java TernaryDemo
```

Real output:

```
warm
cold
```

### Mechanical Walkthrough

`temperature > 20 ? "warm" : "cold"` is a **ternary operator** expression
— "ternary" meaning it takes three operands, separated by `?` and `:`.
The part before `?` is a `boolean` condition; the part between `?` and
`:` is the value produced if that condition is `true`; the part after
`:` is the value produced if it's `false`. Unlike an `if`/`else`
**statement**, which executes one branch or the other but produces no
value of its own, this entire expression evaluates directly to one of
the two strings — usable immediately, as shown, assigned straight into
`description`. The equivalent, longer `if`/`else` form:

```java
String description;
if (temperature > 20) {
    description = "warm";
} else {
    description = "cold";
}
```

Both forms produce identical results; the ternary form is preferred
specifically when both branches only ever do one thing — produce a
value — with no other statements needed in either branch. The moment a
branch needs to do more than that (multiple statements, side effects), a
plain `if`/`else` is the correct, more readable choice instead.

### Discard the Throwaway Example

`TernaryDemo` is deleted now. The real project code this project builds
next uses this exact same operator, picking between two string resources
instead of two literal words.

### CS Lens

The ternary operator is Java's one, dedicated **conditional expression**
— a construct that itself evaluates to a value, as opposed to a
conditional *statement* (`if`/`else`), which only decides what code runs
next.

Also recognized in: nearly every C-family language's own `? :` operator
(C, C++, C#, JavaScript — identical syntax), and Python's differently-
ordered but equivalent `value_if_true if condition else value_if_false`.

### SE Lens

**Why does Java offer both a conditional statement and a conditional
expression instead of just one?** An `if`/`else` statement is the more
general tool — either branch can contain any number of statements,
including ones with no return value at all. The ternary operator trades
that generality for compactness, but only remains readable for genuinely
simple, single-value choices; nesting ternary expressions inside one
another to express more complex logic is a real, common readability
trap, which is why this project reaches for it only in the single-value
case it was designed for.

---

## Connect the Pieces

One trace: `temperature > 20 ? "warm" : "cold"` evaluated directly to
one of two strings, based on one condition, with no separate statement
needed to assign the result. The real project code next reuses this
exact shape to pick between two string resources based on a permission
result.

## What Breaks Without This

Attempt to use a ternary expression where a branch needs to do more than
produce one value — for instance, `condition ? System.out.println("a")
: System.out.println("b")`, then try to actually use the ternary
expression's own result (`println` returns `void`, no value at all).
Real error:

```
error: incompatible types: bad type in conditional expression
  void cannot be converted to a value
```

confirming the ternary operator genuinely requires both branches to
produce a real value, unlike `if`/`else`, which is happy running
statements that produce nothing at all.

## Exercises

1. Rewrite a plain `if`/`else` block you've already seen used for
   picking one of two values in an earlier lesson (or write a small new
   one) as a ternary expression, and confirm both produce identical
   results.
2. Try nesting a second ternary inside the first branch of one you've
   already written (`condition1 ? (condition2 ? "a" : "b") : "c"`) and
   judge, honestly, how much harder it is to read at a glance — direct,
   personal confirmation of the SE Lens's readability warning.

## Definition of Done

- [ ] You ran the lab and saw the ternary expression produce two
      different values from two different conditions.
- [ ] You can state, precisely, when a ternary expression is preferred
      over `if`/`else`, and when it isn't.
- [ ] You triggered the real "incompatible types" error from a branch
      producing no value.
- [ ] Commit: not applicable — the example is a throwaway lab.

Next: back to the real project — reacting to a permission result using
exactly this operator.
