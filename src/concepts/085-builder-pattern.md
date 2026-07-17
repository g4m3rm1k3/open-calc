---
concept: 085-builder-pattern
name: Builder Pattern
---

## Definition

The Builder pattern constructs a complex object step by step, via a
sequence of chained method calls, instead of requiring one giant
constructor call with every parameter supplied at once.

## Problem

A constructor with many parameters — especially many optional ones —
becomes unreadable and error-prone at the call site: it's easy to pass
arguments in the wrong order, or to forget which of several boolean flags
means what. A builder names each parameter as its own method call, made
optional by simply not calling it.

## Execution

new PizzaBuilder() → an empty, in-progress Pizza being assembled
↓
.setSize('large') → records size, returns the SAME builder (for chaining)
↓
.addTopping('mushroom') → records a topping, returns the builder again
↓
.addTopping('olive') → records another topping
↓
.build() → assembles and returns the final Pizza object from everything recorded so far

## Computer Science

A builder decouples the *steps* of constructing an object from its final
*representation* — the object being built doesn't need a constructor
matching every possible combination of options; it only needs one that
accepts a builder's fully-assembled state.

Tags: Fluent interface, Method chaining, Immutability, Step-by-step construction

## Software Engineering

Builders are especially valuable when an object has many optional
parameters, or several boolean flags — reaching for a builder instead of an
ever-growing constructor parameter list makes the call site
self-documenting: each chained method name says exactly what it's setting.

Tags: Readability, Optional parameters, Self-documenting code, Telescoping constructor

## Common Mistakes

- Using a builder for an object with only 2-3 simple required fields — this adds ceremony (a whole separate builder class) for a problem a plain constructor already solves cleanly.
- Forgetting to return the builder itself from a chained setter method — this breaks the fluent chain, since the next call would then be operating on nothing instead of the builder.

## Exercises

- Add a `.setCrust('thin')` method to the builder and confirm it slots into the existing chain the same way `.setSize()` does.
- Build two pizzas from two separate builder instances and confirm modifying one never affects the other.

## javascript

```javascript
class Pizza {
  constructor(size, toppings) { this.size = size; this.toppings = toppings }
}

class PizzaBuilder {
  #size = 'medium'
  #toppings = []
  setSize(size) { this.#size = size; return this }
  addTopping(topping) { this.#toppings.push(topping); return this }
  build() { return new Pizza(this.#size, [...this.#toppings]) }
}

const pizza = new PizzaBuilder()
  .setSize('large')
  .addTopping('mushroom')
  .addTopping('olive')
  .build()

console.log(pizza.size)       // 'large'
console.log(pizza.toppings)   // [ 'mushroom', 'olive' ]
```
Walkthrough: every setter method (`setSize`, `addTopping`) returns `this`,
letting calls chain one after another directly. `build()` is the only
method that actually produces the final `Pizza`, using everything
accumulated on the builder up to that point.

## python

```python
class Pizza:
    def __init__(self, size, toppings):
        self.size = size
        self.toppings = toppings


class PizzaBuilder:
    def __init__(self):
        self._size = 'medium'
        self._toppings = []

    def set_size(self, size):
        self._size = size
        return self

    def add_topping(self, topping):
        self._toppings.append(topping)
        return self

    def build(self):
        return Pizza(self._size, list(self._toppings))


pizza = (PizzaBuilder()
         .set_size('large')
         .add_topping('mushroom')
         .add_topping('olive')
         .build())

print(pizza.size)        # 'large'
print(pizza.toppings)    # ['mushroom', 'olive']
```
Walkthrough: identical fluent-chaining mechanics as the JavaScript version —
each setter returns `self`, letting the whole construction read as one
chained expression, with `build()` producing the final `Pizza`.
