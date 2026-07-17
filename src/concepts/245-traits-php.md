---
concept: 245-traits-php
name: Traits (PHP)
---

## Definition

A PHP trait is a mechanism for reusing a set of methods across multiple,
unrelated classes — similar to a mixin (see Mixins (Ruby)) — using `use
TraitName;` inside a class body to literally COPY the trait's methods
into that class, working around PHP's single-inheritance limitation.

## Problem

PHP classes support only single inheritance — a class can extend just
ONE parent — but shared behavior often needs to be reused across classes
that already have DIFFERENT, unrelated parent classes. Traits let a
class pull in a set of methods from AS MANY traits as needed, layered on
top of its single inheritance chain, without needing a common ancestor.

## Execution

A trait defines methods, similar to an abstract class but NOT
instantiable itself
↓
`use TraitName;` inside a class body COPIES the trait's methods DIRECTLY
into that class
↓
The copied-in method works as if it had been written directly inside the
using class
↓
Unlike Ruby's `include` (which inserts the module into the ancestor
chain, see Mixins (Ruby)), PHP's `use` literally FLATTENS the trait's
methods into the class itself — checking the object's class name shows
no trace of the trait appearing in the class hierarchy at all

## Computer Science

PHP traits are resolved at COMPILE time via literal method copying
(conceptually like a text-substitution/flattening step) rather than
being inserted into a runtime-walkable ancestor chain — this is a
meaningfully different mechanism from Ruby's mixins, even though both
solve the same "share behavior without a common superclass" problem.

Tags: Compile-time method copying, Flattening (vs ancestor chain insertion), Cross-language mixin comparison

## Software Engineering

When a class uses MULTIPLE traits that define the SAME method name, PHP
requires an explicit `insteadof`/`as` conflict-resolution block rather
than silently picking one — this is a deliberate design difference from
languages that resolve such conflicts via an implicit ordering rule.

Tags: Trait conflict resolution, insteadof/as syntax, Explicit over implicit

## Common Mistakes

- Assuming a trait can be instantiated directly, like a class — traits exist purely to be `use`d inside a class; they have no standalone existence of their own.
- Combining multiple traits that define the same method name without an explicit conflict-resolution block — PHP raises a FATAL ERROR in this case, rather than silently picking one implementation, specifically to force the ambiguity to be resolved explicitly.

## Exercises

- Trace through what `get_class()` reports for an object using a trait — does the trait show up anywhere in that result?
- Explain the specific syntax needed to resolve a conflict when two traits used in the same class both define a method with the identical name.

## php

```php
<?php
trait Greetable {
    public function greet() {
        return "Hi, I'm " . $this->name;
    }
}

class Person {
    use Greetable;
    public $name;
    public function __construct($name) {
        $this->name = $name;
    }
}

$alice = new Person("Alice");
echo $alice->greet() . "\n";
echo get_class($alice) . "\n";
```
Walkthrough: `$alice->greet()` works even though `greet` was defined
entirely inside the `Greetable` trait, not `Person` itself — `use
Greetable;` copies it directly in. `get_class($alice)` reports just
`"Person"`, with no trace of `Greetable` in the result, confirming traits
are FLATTENED into the class rather than tracked as a separate entity in
the runtime hierarchy.
