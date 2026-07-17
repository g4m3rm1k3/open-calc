---
concept: 096-interpreter-pattern
name: Interpreter Pattern
---

## Definition

The Interpreter pattern represents a grammar's rules as a tree of objects,
where evaluating the tree — calling the same method on each node —
produces the result of interpreting the corresponding expression.

## Problem

Evaluating a small custom language or expression syntax by hand-parsing
strings every time is repetitive and hard to extend with new operators.
Representing each grammar rule as its own class, composed into a tree, lets
each piece interpret only its own small piece of the grammar.

## Execution

Parse "3 + 4" into a tree: Add(Number(3), Number(4))
↓
Call interpret() on the root Add node
↓
Add.interpret() calls interpret() on both its children and combines their results
↓
Number.interpret() just returns its own literal value directly (the base case)
↓
Add's interpret() returns 3 + 4 = 7

## Computer Science

Each grammar rule (a number, an addition, a subtraction) is its own class
implementing a shared `interpret()` method — this is the Composite pattern
applied specifically to representing and evaluating a grammar, where
"evaluating an expression" recursively means "evaluate each sub-expression
and combine the results."

Tags: Abstract syntax tree, Composite pattern, Recursive evaluation, Grammar rules

## Software Engineering

Interpreter works well for small, simple, rarely-changing grammars — a
basic expression language, simple rule conditions. For anything approaching
a real programming language's complexity, a dedicated parser generator or
existing language is almost always the better choice; hand-rolling
Interpreter-pattern classes for a large grammar becomes unwieldy fast.

Tags: Domain-specific languages, Parsers, Grammar complexity

## Common Mistakes

- Reaching for Interpreter to build what's really a full programming language — this pattern is meant for small, simple grammars; anything more complex needs real parsing/compiler tools, not a hand-built tree of interpreter classes.
- Forgetting the base case (a leaf node like a literal number) that terminates the recursion — every composite rule's `interpret()` eventually needs to bottom out at something that doesn't recurse further.

## Exercises

- Add a `Subtract` expression class alongside `Add`, following the exact same `interpret()` shape, and build a tree for `10 - 3 - 2`.
- Build a tree by hand for `(2 + 3) + 4` and trace through calling `interpret()` on the outermost node.

## javascript

```javascript
class Num {
  constructor(value) { this.value = value }
  interpret() { return this.value }
}

class Add {
  constructor(left, right) { this.left = left; this.right = right }
  interpret() { return this.left.interpret() + this.right.interpret() }
}

// Represents: 3 + 4
const expr = new Add(new Num(3), new Num(4))
console.log(expr.interpret())   // 7

// Represents: (2 + 3) + 4
const nested = new Add(new Add(new Num(2), new Num(3)), new Num(4))
console.log(nested.interpret())   // 9
```
Walkthrough: `Num.interpret()` is the base case — it just returns its own
literal value. `Add.interpret()` recursively calls `interpret()` on both of
its children and adds the results, which works whether those children are
plain numbers or themselves nested `Add` expressions, exactly like
Composite's recursive uniform-interface trick.

## python

```python
class Num:
    def __init__(self, value):
        self.value = value

    def interpret(self):
        return self.value


class Add:
    def __init__(self, left, right):
        self.left = left
        self.right = right

    def interpret(self):
        return self.left.interpret() + self.right.interpret()


# Represents: 3 + 4
expr = Add(Num(3), Num(4))
print(expr.interpret())   # 7

# Represents: (2 + 3) + 4
nested = Add(Add(Num(2), Num(3)), Num(4))
print(nested.interpret())   # 9
```
Walkthrough: identical recursive-evaluation mechanics as the JavaScript
version — `Num` terminates the recursion with a literal value, `Add`
recursively combines whatever its two children evaluate to.
