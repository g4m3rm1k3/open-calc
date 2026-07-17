---
concept: 090-decorator-pattern
name: Decorator Pattern
---

## Definition

The Decorator pattern adds new behavior to an individual object by wrapping
it in another object with the same interface, instead of modifying the
original class or creating a new subclass for every possible combination of
added behavior.

## Problem

Subclassing to add behavior multiplies combinatorially as more optional
add-ons exist — a subclass for "with milk," another for "with milk and
sugar," another for "with milk, sugar, and whip." A decorator wraps the
base object one layer at a time, so any combination of add-ons is just a
matter of how many layers get wrapped, not a new subclass per combination.

## Execution

Start with a plain Coffee (cost: 2)
↓
Wrap it in a MilkDecorator → cost() calls the wrapped coffee's cost() and adds its own milk cost: 2 + 0.5 = 2.5
↓
Wrap THAT in a SugarDecorator → cost() calls the wrapped MilkDecorator's
cost() (which itself calls the base Coffee) and adds sugar's cost: 2.5 + 0.25 = 2.75
↓
Each layer only knows about the layer directly inside it — the outermost
call cascades all the way down through every wrapped layer, accumulating
cost as it goes

## Computer Science

Every decorator implements the same interface as the object it wraps (so a
decorated object can itself be wrapped again by another decorator,
transparently) and forwards to the wrapped object internally, adding its
own behavior before or after that forwarded call — this is why decorators
can be stacked in any combination and any order.

Tags: Composition, Interface conformance, Wrapping, Stackable behavior

## Software Engineering

This avoids the "subclass explosion" of trying to represent every
combination of optional add-on behaviors as its own named class — real
examples include I/O stream wrappers (a buffered, compressed, encrypted
stream, layered) and UI component libraries that add borders, scrollbars,
or tooltips by wrapping a base component rather than subclassing per
combination.

Tags: Subclass explosion, Stream wrappers, Open/closed principle

## Common Mistakes

- Confusing Decorator with simple inheritance — a decorator wraps an INSTANCE at runtime, in any combination decided dynamically, while subclassing fixes the combination of behavior at compile/class-definition time.
- Not realizing wrapping order can silently change behavior — some decorator combinations behave differently depending on the order they're applied, easy to overlook if each decorator was designed and tested in isolation.

## Exercises

- Add a `WhipDecorator` and wrap a coffee in all three decorators (milk, sugar, whip) in different orders — confirm the final cost is the same regardless of order for this particular example.
- Describe a case where wrapping order WOULD change the final behavior, not just the cost total.

## javascript

```javascript
class Coffee {
  cost() { return 2 }
  description() { return 'Coffee' }
}

class MilkDecorator {
  constructor(coffee) { this.coffee = coffee }
  cost() { return this.coffee.cost() + 0.5 }
  description() { return this.coffee.description() + ' + Milk' }
}

class SugarDecorator {
  constructor(coffee) { this.coffee = coffee }
  cost() { return this.coffee.cost() + 0.25 }
  description() { return this.coffee.description() + ' + Sugar' }
}

let order = new Coffee()
order = new MilkDecorator(order)
order = new SugarDecorator(order)

console.log(order.description())    // 'Coffee + Milk + Sugar'
console.log(order.cost())           // 2.75
```
Walkthrough: each decorator holds the object it wraps and calls through to
it before adding its own contribution — `SugarDecorator` calls
`MilkDecorator.cost()`, which itself calls `Coffee.cost()`, so the final
`2.75` accumulates from the base coffee outward through every layer that
was wrapped around it.

## python

```python
class Coffee:
    def cost(self):
        return 2

    def description(self):
        return 'Coffee'


class MilkDecorator:
    def __init__(self, coffee):
        self.coffee = coffee

    def cost(self):
        return self.coffee.cost() + 0.5

    def description(self):
        return self.coffee.description() + ' + Milk'


class SugarDecorator:
    def __init__(self, coffee):
        self.coffee = coffee

    def cost(self):
        return self.coffee.cost() + 0.25

    def description(self):
        return self.coffee.description() + ' + Sugar'


order = Coffee()
order = MilkDecorator(order)
order = SugarDecorator(order)

print(order.description())    # 'Coffee + Milk + Sugar'
print(order.cost())           # 2.75
```
Walkthrough: identical layered-wrapping mechanics as the JavaScript version
— each decorator forwards to whatever it wraps before adding its own cost,
so unwrapping the call chain from the outside in retraces exactly how the
object was built up, layer by layer.
