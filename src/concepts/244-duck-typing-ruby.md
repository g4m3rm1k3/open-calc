---
concept: 244-duck-typing-ruby
name: Duck Typing (Ruby)
---

## Definition

Ruby's duck typing philosophy takes the "if it responds to the right
methods, it works" idea (see Duck Typing (Python)) further than most
languages — Ruby code idiomatically checks `respond_to?` rather than an
object's class, and even lets user-defined objects participate in
built-in language constructs (like `case/when`) by implementing the
right method (`===`), blurring the line between "built-in" and
"user-defined" behavior.

## Problem

Explicitly checking an object's CLASS before every operation couples
code tightly to specific classes and rejects other objects that would
work perfectly well. Ruby's philosophy is to trust that ANY object
supporting the needed method will work correctly, checking capability
(what it can DO) rather than identity (what CLASS it IS) — and to make
this trust nearly universal, even extending it into how core language
constructs like `case/when` themselves decide whether something
"matches."

## Execution

Calling a method directly, with no type check, works on any object that
responds to it (the same underlying idea as Python's duck typing)
↓
`respond_to?` is the IDIOMATIC Ruby way to check CAPABILITY before
calling, when a check is genuinely needed (rather than a class check)
↓
`case/when` calls `===` on EACH `when` clause's value against the target
— checking a built-in class like `Integer` this way checks "is this an
Integer," but a CUSTOM object could define its OWN `===` to participate
in `case/when` matching with entirely custom logic
↓
Defining a class-level `===` method lets that class be used directly as
a `when` clause, with its own custom matching logic running instead of
the default class-membership check

## Computer Science

`case/when` in Ruby is itself built entirely on duck typing — it doesn't
have special built-in knowledge of "what a type is"; it just calls
`===` on each candidate and trusts whatever that returns, which is why
user-defined objects can participate in `case/when` matching by
implementing their own `===`, the exact same mechanism Ruby's own
built-in classes use.

Tags: === operator, case/when internals, Uniform built-in/custom object treatment

## Software Engineering

`respond_to?` is the idiomatic way to write a genuinely
capability-checking guard clause in Ruby (when a check is truly needed)
instead of `is_a?`/class-based checks — this keeps code open to ANY
object supporting the right interface, matching Ruby's broader
duck-typing philosophy rather than working against it.

Tags: respond_to? idiom, Capability checking, Avoiding is_a? overuse

## Common Mistakes

- Defaulting to `is_a?`/class checks out of habit from more class-centric languages, instead of `respond_to?` or simply trusting duck typing and letting a `NoMethodError` surface naturally if something's genuinely wrong — this works against Ruby's whole philosophy of flexibility.
- Forgetting that `case/when` relies on `===`, not `==` — defining `==` on a custom class does NOT automatically make it work correctly as a `when` clause; `===` specifically needs to be implemented for that.

## Exercises

- Trace through what a custom `===` returns for an even versus an odd integer, given the definition below, and explain how `case/when` uses that result.
- Explain why Ruby's `case/when` being built on `===` (rather than having special compiler-level type-checking logic) is itself an application of duck typing.

## ruby

```ruby
class EvenNumber
  def self.===(other)
    other.is_a?(Integer) && other.even?
  end
end

def describe(value)
  case value
  when EvenNumber
    "#{value} is even"
  when Integer
    "#{value} is an odd integer"
  when String
    "#{value} is a string"
  else
    "something else"
  end
end

puts describe(4)
puts describe(7)
puts describe("hello")
```
Walkthrough: `case value; when EvenNumber` calls `EvenNumber.===(value)`
behind the scenes — for `4`, this returns `true` (even integer), so the
first branch matches; for `7`, it returns `false`, falling through to
the plain `Integer` branch instead. This demonstrates that `case/when`
treats a user-defined class exactly like it treats Ruby's own built-in
`Integer`/`String` — both are just things `===` is called against, with
zero special-casing for "built-in" versus "custom."
