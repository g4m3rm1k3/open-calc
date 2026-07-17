---
concept: 100-strategy-pattern
name: Strategy Pattern
---

## Definition

The Strategy pattern lets an algorithm be selected and swapped at runtime
by passing in a different strategy object, instead of hard-coding one
specific algorithm — or a big if/else choosing between several — inside
the class that uses it.

## Problem

A class that needs to support several interchangeable algorithms for the
same task ends up either hard-coded to one, or filled with conditionals
selecting between them internally. Strategy extracts each algorithm into
its own interchangeable object, and the class just holds a reference to
whichever one it's currently using.

## Execution

Create a Checkout with a specific PaymentStrategy (say, CreditCardStrategy)
↓
Call checkout.pay(100) → delegates entirely to whatever strategy it holds
↓
Swap in a DIFFERENT strategy (PayPalStrategy) on the SAME Checkout object
↓
Call checkout.pay(100) again → now delegates to the new strategy instead —
completely different behavior, same Checkout class, same method call

## Computer Science

Every strategy implements the same interface, so the context object
holding a strategy doesn't need to know which concrete strategy it has — it
just calls the shared method name and gets whichever behavior that
specific strategy object provides. This is functionally very close to
passing a function as a parameter, just expressed as a swappable object
instead of a bare function.

Tags: Algorithm selection, Interchangeable behavior, Polymorphism, Higher-order functions

## Software Engineering

Strategy is the standard way to avoid a large conditional selecting between
several algorithm variants, and it makes adding a new variant a matter of
adding one new strategy class, with zero changes to the class that uses
strategies.

Tags: Open/closed principle, Algorithm variants, Extensibility

## Common Mistakes

- Implementing Strategy with a conditional inside the context class anyway — this defeats the purpose; the whole point is the context never branches on which strategy it holds, it just calls the shared method.
- Introducing a Strategy object for an algorithm that never actually varies in practice — if there's only ever one real implementation, the extra indirection isn't earning its complexity.

## Exercises

- Add a third payment strategy and swap it into an existing `Checkout` instance without changing the `Checkout` class at all.
- Rewrite the example using a plain function passed as a parameter instead of a strategy object/class — compare how similar the two approaches end up being.

## javascript

```javascript
class CreditCardStrategy {
  pay(amount) { return `Paid $${amount} by credit card` }
}
class PayPalStrategy {
  pay(amount) { return `Paid $${amount} via PayPal` }
}

class Checkout {
  constructor(strategy) { this.strategy = strategy }
  pay(amount) { return this.strategy.pay(amount) }
}

const checkout = new Checkout(new CreditCardStrategy())
console.log(checkout.pay(100))   // 'Paid $100 by credit card'

checkout.strategy = new PayPalStrategy()
console.log(checkout.pay(100))   // 'Paid $100 via PayPal'
```
Walkthrough: `Checkout.pay()` never knows or cares which concrete strategy
it holds — it just calls `this.strategy.pay(amount)`. Swapping
`checkout.strategy` to a different object entirely changes the outcome of
the next `pay()` call, with zero changes to `Checkout` itself.

## python

```python
class CreditCardStrategy:
    def pay(self, amount):
        return f'Paid ${amount} by credit card'


class PayPalStrategy:
    def pay(self, amount):
        return f'Paid ${amount} via PayPal'


class Checkout:
    def __init__(self, strategy):
        self.strategy = strategy

    def pay(self, amount):
        return self.strategy.pay(amount)


checkout = Checkout(CreditCardStrategy())
print(checkout.pay(100))   # 'Paid $100 by credit card'

checkout.strategy = PayPalStrategy()
print(checkout.pay(100))   # 'Paid $100 via PayPal'
```
Walkthrough: identical swappable-algorithm mechanics as the JavaScript
version — `Checkout.pay()` simply forwards to whichever strategy object it
currently holds.
