---
concept: 102-visitor-pattern
name: Visitor Pattern
---

## Definition

The Visitor pattern lets a new operation be added to a set of existing
classes without modifying those classes themselves, by moving the
operation's logic into a separate "visitor" object that each class accepts
and dispatches to.

## Problem

Adding a new operation across a whole family of related classes (compute
area for every Shape subclass, then later compute perimeter, then later
export-to-SVG) normally means adding a new method to every subclass, every
single time a new operation is needed. Visitor moves each new operation
into its own separate visitor class instead, requiring no changes to the
existing shape classes beyond one small "accept a visitor" method, written
once.

## Execution

circle.accept(areaVisitor) → Circle's accept() calls areaVisitor.visitCircle(this)
↓
areaVisitor.visitCircle(circle) contains the ACTUAL area-computation logic for circles specifically
↓
square.accept(areaVisitor) → Square's accept() calls areaVisitor.visitSquare(this)
↓
The SAME areaVisitor object handles both shapes, but runs DIFFERENT logic
for each, based on which visit method the shape's own accept() called into

## Computer Science

This is "double dispatch" — which actual code runs depends on BOTH the
concrete type of the shape (which `accept()` gets called, and which
`visitX()` it in turn calls) AND the concrete type of the visitor (which
operation's logic that `visitX()` actually contains). Plain polymorphism
alone (single dispatch) only varies behavior based on one type, not two
simultaneously.

Tags: Double dispatch, Open/closed principle, Operation extraction

## Software Engineering

Visitor is the right tool specifically when the set of shapes is stable
(rarely changes) but the set of operations on them grows over time (area,
then perimeter, then rendering, then serialization). If it's the other way
around — shapes change often, operations are fixed — a plain method on each
shape class is simpler and Visitor adds unnecessary indirection.

Tags: Open/closed principle, Stable hierarchy, Operation extraction

## Common Mistakes

- Reaching for Visitor when the class hierarchy itself changes frequently — every new shape subclass requires updating EVERY existing visitor with a new visit method, which is exactly backwards from the case Visitor is meant to help with.
- Forgetting to add the new visit method to EVERY existing visitor when a new element type is added — an incomplete visitor silently has no defined behavior for the new type.

## Exercises

- Add a `PerimeterVisitor` implementing the same visit methods as the existing `AreaVisitor`, and run both visitors over the same list of shapes.
- Add a `Triangle` shape and update every existing visitor to handle it — count how many places had to change, compared to how many would change if area/perimeter were just plain methods on each shape instead.

## javascript

```javascript
class Circle {
  constructor(radius) { this.radius = radius }
  accept(visitor) { return visitor.visitCircle(this) }
}
class Square {
  constructor(side) { this.side = side }
  accept(visitor) { return visitor.visitSquare(this) }
}

class AreaVisitor {
  visitCircle(circle) { return Math.PI * circle.radius ** 2 }
  visitSquare(square) { return square.side ** 2 }
}

const shapes = [new Circle(2), new Square(3)]
const areaVisitor = new AreaVisitor()
console.log(shapes.map(s => s.accept(areaVisitor)))
// [ 12.566..., 9 ]
```
Walkthrough: each shape's `accept()` calls back into the visitor's
matching `visitX()` method — `Circle.accept()` calls `visitCircle`,
`Square.accept()` calls `visitSquare`. The actual area-computation logic
lives entirely in `AreaVisitor`, not scattered across the shape classes
themselves, so a brand-new operation could be added later as a whole new
visitor class with zero changes to `Circle` or `Square`.

## python

```python
import math


class Circle:
    def __init__(self, radius):
        self.radius = radius

    def accept(self, visitor):
        return visitor.visit_circle(self)


class Square:
    def __init__(self, side):
        self.side = side

    def accept(self, visitor):
        return visitor.visit_square(self)


class AreaVisitor:
    def visit_circle(self, circle):
        return math.pi * circle.radius ** 2

    def visit_square(self, square):
        return square.side ** 2


shapes = [Circle(2), Square(3)]
area_visitor = AreaVisitor()
print([s.accept(area_visitor) for s in shapes])
# [12.566..., 9]
```
Walkthrough: identical double-dispatch mechanics as the JavaScript version
— each shape's `accept()` routes to the matching `visit_*` method on
whatever visitor it's given, keeping all the area logic inside
`AreaVisitor` rather than inside the shape classes.
