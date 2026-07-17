---
concept: 101-template-method-pattern
name: Template Method Pattern
---

## Definition

The Template Method pattern defines the overall skeleton of an algorithm in
a base class, with specific steps left as methods for subclasses to
override — the base class controls the order of steps, while subclasses
control what each step actually does.

## Problem

Several related algorithms share the same overall sequence of steps but
differ in exactly how one or two of those steps are performed —
reimplementing the entire sequence in every variant duplicates the shared
structure just to change one step. Template Method factors the shared
sequence into one base method, leaving only the varying steps as
overridable hooks.

## Execution

Call recipe.prepare() (defined once, in the base class — never overridden)
↓
prepare() internally calls, in a FIXED order: gatherIngredients(), cook(), serve()
↓
gatherIngredients() and serve() might be identical across every recipe
(defined once, in the base class)
↓
cook() is OVERRIDDEN differently by each subclass — the only step that actually varies

## Computer Science

The base class's template method calls its own other methods — some
concrete and shared, some abstract and meant to be overridden. This is the
"Hollywood principle" in action ("don't call us, we'll call you"): a
subclass never calls the overall sequence itself, it only ever supplies the
missing pieces that the base class's fixed sequence calls back into.

Tags: Hollywood principle, Inversion of control, Inheritance, Algorithm skeleton

## Software Engineering

This is useful specifically when the structure of a process — its overall
steps, and their order — is genuinely shared and shouldn't be allowed to
vary, while only certain individual steps legitimately need to differ per
use case. If the order itself needs to vary too, Strategy (an entirely
swappable object) usually fits better.

Tags: Code reuse, Algorithm structure, Inheritance vs composition

## Common Mistakes

- Using Template Method (inheritance) when the varying behavior needs to change at RUNTIME, not just per-subclass at compile time — Strategy (composition, swappable at runtime) usually fits that case better.
- Overriding the template method itself instead of just the individual step methods — this breaks the whole guarantee that the sequence's order stays consistent across every variant.

## Exercises

- Add a `DessertRecipe` subclass overriding only `cook()`, and confirm `prepare()` still calls all three steps in the same fixed order.
- Try overriding `prepare()` itself in a subclass and observe how that breaks the pattern's whole guarantee about a shared, fixed step order.

## javascript

```javascript
class Recipe {
  prepare() {
    const steps = []
    steps.push(this.gatherIngredients())
    steps.push(this.cook())
    steps.push(this.serve())
    return steps
  }
  gatherIngredients() { return 'Gather ingredients' }   // shared across all recipes
  serve() { return 'Serve' }                             // shared across all recipes
}

class PastaRecipe extends Recipe {
  cook() { return 'Boil pasta' }   // the one step that actually varies
}
class SaladRecipe extends Recipe {
  cook() { return 'Toss vegetables' }
}

console.log(new PastaRecipe().prepare())
// [ 'Gather ingredients', 'Boil pasta', 'Serve' ]
console.log(new SaladRecipe().prepare())
// [ 'Gather ingredients', 'Toss vegetables', 'Serve' ]
```
Walkthrough: `prepare()` is defined ONCE, on the base `Recipe` class, and
is never overridden — it always calls `gatherIngredients()`, `cook()`, and
`serve()` in that fixed order. Only `cook()` differs between
`PastaRecipe` and `SaladRecipe`; the surrounding sequence and the other two
steps stay identical across both.

## python

```python
class Recipe:
    def prepare(self):
        steps = []
        steps.append(self.gather_ingredients())
        steps.append(self.cook())
        steps.append(self.serve())
        return steps

    def gather_ingredients(self):
        return 'Gather ingredients'   # shared across all recipes

    def serve(self):
        return 'Serve'   # shared across all recipes


class PastaRecipe(Recipe):
    def cook(self):
        return 'Boil pasta'   # the one step that actually varies


class SaladRecipe(Recipe):
    def cook(self):
        return 'Toss vegetables'


print(PastaRecipe().prepare())
# ['Gather ingredients', 'Boil pasta', 'Serve']
print(SaladRecipe().prepare())
# ['Gather ingredients', 'Toss vegetables', 'Serve']
```
Walkthrough: identical fixed-sequence-with-overridable-steps mechanics as
the JavaScript version — `prepare()` lives only on the base `Recipe` and
always calls the same three steps in the same order, with only `cook()`
actually differing per subclass.
