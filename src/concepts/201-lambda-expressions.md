---
concept: 201-lambda-expressions
name: Lambda Expressions (Java)
---

## Definition

A lambda expression is a concise, anonymous function literal —
`(parameters) -> expression` — letting you pass a small piece of behavior
directly as an argument (typically implementing a functional interface)
without writing a full named class or method just to hold that logic.

## Problem

Before lambdas, passing a small piece of custom behavior into a method (a
comparator, an event handler) required writing a full anonymous inner
class implementing the relevant interface — significant boilerplate for
what's conceptually just "here's a small function." Lambda expressions
let you write that same behavior far more concisely, directly at the call
site.

## Execution

Before lambdas, implementing a single comparison method required a full
anonymous class
↓
With a lambda, the SAME behavior is expressed far more concisely, as
`(a, b) -> expression`
↓
A lambda can be assigned to any variable whose type is a "functional
interface" (an interface with exactly ONE abstract method) — the
lambda's body becomes that single method's implementation
↓
The lambda is used exactly like the verbose anonymous class version
would have been, since both ultimately implement the same interface

## Computer Science

A lambda expression is syntactic sugar over an anonymous class
implementing a functional interface — the compiler determines WHICH
interface a lambda is meant to implement based on the TARGET TYPE it's
being assigned to or passed as (this is called "target typing"), which is
why the exact same lambda syntax can implement different interfaces
depending on context.

Tags: Functional interfaces, Target typing, Anonymous classes (predecessor), Syntactic sugar

## Software Engineering

Lambdas made functional-style code (particularly the Streams API, see
Streams API) practical and readable in Java — passing behavior around
concisely is what makes chains like filter-then-map readable instead of
requiring a separate named class for every small predicate or
transformation.

Tags: Functional-style Java, Streams API synergy, Concise behavior passing

## Common Mistakes

- Writing an overly complex, multi-line lambda that would be clearer as a properly named method reference or a regular named method — lambdas are meant for SHORT, focused pieces of behavior; long lambda bodies undermine their own readability benefit.
- Assuming a lambda can implement an interface with MORE than one abstract method — lambdas can only implement functional interfaces (exactly one abstract method); anything else still requires a full class or anonymous class.

## Exercises

- Trace through what interface (and which single method) a length-comparing lambda is actually implementing, given it's assigned to a `Comparator<String>` variable.
- Rewrite a lambda you've seen or written as the equivalent full anonymous class, to see exactly how much boilerplate the lambda syntax eliminates.

## java

```java
import java.util.Comparator;
import java.util.List;
import java.util.ArrayList;

public class Main {
    public static void main(String[] args) {
        List<String> words = new ArrayList<>(List.of("banana", "fig", "apple"));

        // Lambda implementing Comparator's single abstract method (compare)
        Comparator<String> byLength = (a, b) -> a.length() - b.length();
        words.sort(byLength);
        System.out.println(words);   // [fig, apple, banana] -- sorted shortest to longest

        // A lambda used directly, inline, without a named variable
        words.sort((a, b) -> b.compareTo(a));   // reverse alphabetical
        System.out.println(words);   // [fig, banana, apple]
    }
}
```
Walkthrough: `byLength` is a lambda implementing `Comparator<String>`'s
single abstract method `compare` — `words.sort(byLength)` sorts by string
length, shortest first. The second `sort` call passes a DIFFERENT lambda
directly inline, sorting in reverse alphabetical order instead —
demonstrating how concisely a lambda expresses a small piece of behavior
compared to writing a full anonymous class for each one.
