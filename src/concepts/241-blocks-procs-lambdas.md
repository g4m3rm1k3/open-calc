---
concept: 241-blocks-procs-lambdas
name: Blocks, Procs, and Lambdas (Ruby)
---

## Definition

Ruby has three closely related ways to package up a chunk of code as a
value — a BLOCK (`{ }` or `do...end`, passed implicitly to a method), a
Proc (an explicit, storable object wrapping a block), and a Lambda (a
stricter variant of Proc with exact argument checking and normal
`return` semantics) — all three are ultimately closures over their
surrounding scope.

## Problem

Passing a piece of behavior into a method (like the comparison logic for
a sort, or the per-element transformation for a map) needs some concise
way to package that logic as a value — Ruby's block syntax provides a
lightweight, ubiquitous way to do this for the extremely common case of
"one method call, one piece of behavior," while Proc and Lambda provide
progressively more explicit, reusable, storable versions of the same
underlying idea.

## Execution

A BLOCK is passed IMPLICITLY to a method — not a separate object, just
syntax tied to this one method call
↓
A Proc EXPLICITLY captures a block as a reusable, storable object,
callable later with `.call`
↓
A Lambda is similarly storable and callable, but STRICTER about argument
count — a Proc called with the wrong number of arguments just ignores
extras or fills missing ones with `nil`; a Lambda RAISES an error
↓
Inside a Proc, `return` returns from the ENCLOSING method (can cause
surprising early exits); inside a Lambda, `return` returns just from the
Lambda ITSELF, behaving like an ordinary function — this difference is a
common source of confusion between the two

## Computer Science

All three (block, Proc, Lambda) are CLOSURES — they capture and can
access variables from their surrounding scope, exactly like JavaScript
closures (see First-Class Functions, Currying) — Ruby's block being the
lightweight, syntactically implicit version specifically optimized for
the extremely common "pass one chunk of behavior to a method" pattern.

Tags: Closures, Implicit vs explicit callable objects, Argument strictness

## Software Engineering

Reach for a plain block for one-off behavior passed to a single method
call (the overwhelmingly common case); reach for a Proc or Lambda
specifically when the behavior needs to be STORED in a variable, passed
around, or reused across multiple calls — Lambda is generally preferred
over Proc for this when strict argument checking and normal `return`
behavior are wanted.

Tags: Block vs Proc vs Lambda selection, Idiomatic Ruby callable choice

## Common Mistakes

- Using a Proc when a Lambda's stricter argument checking and normal `return` semantics were actually what was needed — a Proc's lenient argument handling and "return exits the ENCLOSING method" behavior can cause surprising bugs if a Lambda's stricter contract was actually assumed.
- Confusing a block (implicit, tied to one method call) with a full standalone object — a bare block by itself isn't a value you can store in a variable; it must be captured (via `Proc.new`/`&block` or by using `yield`) to become a reusable, storable thing.

## Exercises

- Trace through what happens if a lambda expecting one argument is called with two, versus what a Proc would do with the same extra argument.
- Explain why a block passed to `.each` can't be stored in a variable and reused for a LATER, unrelated `.each` call, while a Proc or Lambda can be.

## ruby

```ruby
[1, 2, 3].each { |x| puts x }

add_one = Proc.new { |x| x + 1 }
puts add_one.call(5)

add_one_lambda = lambda { |x| x + 1 }
puts add_one_lambda.call(5)

begin
  add_one_lambda.call(5, 10)
rescue ArgumentError => e
  puts "lambda rejected extra argument: #{e.message}"
end

proc_result = Proc.new { |x, y| [x, y] }.call(5)
puts proc_result.inspect
```
Walkthrough: the block passed to `.each` runs once per element, purely
as syntax attached to that call. `add_one` and `add_one_lambda` both
compute `6` from `5`, demonstrating Proc and Lambda's shared closure
behavior. Calling the lambda with an extra argument raises an
`ArgumentError`, while the SAME kind of mismatch on a Proc (calling with
one argument when two are expected) silently fills the missing one with
`nil` instead of raising, printing `[5, nil]`.
