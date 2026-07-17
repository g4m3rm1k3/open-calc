---
concept: 242-mixins
name: Mixins (Ruby)
---

## Definition

A mixin is a Module whose methods are INCLUDED into a class via
`include`, adding that module's methods to every instance of the class —
Ruby's primary mechanism for sharing behavior across otherwise-unrelated
classes, since Ruby only allows SINGLE class inheritance but a class can
include MANY modules.

## Problem

Single inheritance means a class can only extend ONE parent — if a piece
of shared behavior (comparability, enumerability) needs to be reused
across many UNRELATED classes that already each have their own distinct
inheritance chain, inheritance alone can't provide it. Mixins let a class
pull in behavior from AS MANY modules as needed, layered ON TOP of its
single inheritance chain, achieving a form of controlled
multiple-behavior-sharing without full multiple inheritance's
complexity.

## Execution

A MODULE defines a method — not a class, so it can't be instantiated
directly
↓
`include SomeModule` inside a class mixes the module's methods INTO that
class
↓
The mixed-in method is now available on instances of the class, even
though it was defined in a completely separate module, not in the
class's own body
↓
Checking the class's ancestor chain shows the module INSERTED between the
class itself and its superclass — mixins participate directly in Ruby's
normal method resolution order, not as a separate, special mechanism

## Computer Science

`include` inserts the module directly into the INCLUDING class's
ancestor chain (visible via `.ancestors`) — method lookup then proceeds
through this chain exactly as it would for regular inheritance, which is
why a mixin's methods can be overridden by the including class, and why
multiple mixins are searched in a well-defined, deterministic ORDER (the
reverse of the order they were included).

Tags: Ancestor chain, Method resolution order, Module method lookup

## Software Engineering

Ruby's core library itself relies heavily on mixins — `Comparable`
(giving `<`, `>`, `==` etc. once a class defines `<=>`) and `Enumerable`
(giving `.map`, `.select`, `.reduce` etc. once a class defines `each`)
are both standard mixins, demonstrating the idiomatic pattern: implement
ONE core method, gain MANY derived behaviors for free.

Tags: Comparable, Enumerable, Implement-one-gain-many pattern

## Common Mistakes

- Confusing a module meant as a mixin (providing INSTANCE methods via `include`) with one meant as a namespace or a collection of MODULE-level utility methods (called directly on the module itself, via `extend` or `module_function`) — these are different, non-interchangeable usage patterns for Ruby modules.
- Including multiple modules that define the SAME method name without understanding Ruby's method resolution order — the LAST module included takes precedence (closer to the class in the ancestor chain), which can cause silent, confusing overrides if not intentional.

## Exercises

- Trace through what a class's ancestor list would show if a SECOND module were also included — where would it appear relative to the first module in the chain?
- Explain why `Comparable` needs a class to define `<=>` first before providing `<`, `>`, `==`, etc. — what's the underlying design principle this reflects (see also Traits (Rust) for a related "implement the minimum, derive the rest" pattern)?

## ruby

```ruby
module Greetable
  def greet
    "Hi, I'm #{name}"
  end
end

class Person
  include Greetable
  attr_accessor :name

  def initialize(name)
    @name = name
  end
end

alice = Person.new("Alice")
puts alice.greet

puts Person.ancestors.include?(Greetable)
```
Walkthrough: `Person.new("Alice").greet` calls `greet`, which was defined
entirely inside the `Greetable` module, not `Person` itself — proving the
mixin's method genuinely became available on `Person` instances.
`Person.ancestors.include?(Greetable)` confirms `Greetable` was actually
inserted into `Person`'s method-lookup chain, not just copied in some
separate way.
