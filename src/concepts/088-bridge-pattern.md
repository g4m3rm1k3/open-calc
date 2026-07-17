---
concept: 088-bridge-pattern
name: Bridge Pattern
---

## Definition

The Bridge pattern separates an abstraction (what something does) from its
implementation (how it does it), letting the two vary and be combined
independently instead of being locked together in one class hierarchy.

## Problem

Modeling "shapes that can be drawn in different rendering styles" as one
class per shape-per-renderer combination multiplies out of control as
either dimension grows. Bridge splits the two dimensions into two separate,
independently-extensible hierarchies connected by composition.

## Execution

Create a Circle(renderer) — Circle HOLDS a reference to whichever renderer was passed in
↓
Call circle.draw() → Circle delegates the actual drawing work to renderer.renderCircle(...)
↓
Swap in a DIFFERENT renderer (same Circle class, no code changes) → circle.draw() now draws using the new renderer instead
↓
Adding a NEW shape only requires implementing it against the existing
renderer interface — no new renderer code needed; adding a NEW renderer
only requires implementing that interface — no shape code needed

## Computer Science

This is fundamentally "favor composition over inheritance" applied to two
independently-varying dimensions — instead of one combined inheritance
hierarchy covering every (shape × renderer) pair, each shape holds a
reference to a renderer object and delegates to it, so the two hierarchies
can each grow independently without multiplying together.

Tags: Composition over inheritance, Decoupling, Abstraction vs implementation

## Software Engineering

Bridge is worth reaching for specifically when there are two genuinely
independent dimensions of variation in what would otherwise be one class
hierarchy — if there's really only one dimension varying, a simpler
inheritance hierarchy is enough, and introducing a bridge adds indirection
with no real payoff.

Tags: Class explosion, Independent variation, Extensibility

## Common Mistakes

- Applying Bridge when there's genuinely only one dimension of variation — this adds an extra layer of indirection for a problem plain inheritance already solves without it.
- Hard-coding which specific renderer a shape uses inside the shape's own constructor, instead of accepting the renderer as a parameter — this defeats the whole point, since the two are supposed to vary independently.

## Exercises

- Add a `Square` shape and a `CanvasRenderer` alongside the existing `Circle`/`SvgRenderer`, and confirm all four combinations work without any shape needing renderer-specific code.
- Count how many classes a naive "one class per shape-per-renderer" design would need for 3 shapes and 3 renderers, versus how many the Bridge design needs for the same coverage.

## javascript

```javascript
class SvgRenderer {
  renderCircle(radius) { return `<svg-circle r="${radius}"/>` }
}
class CanvasRenderer {
  renderCircle(radius) { return `canvas.arc(0,0,${radius})` }
}

class Circle {
  constructor(radius, renderer) { this.radius = radius; this.renderer = renderer }
  draw() { return this.renderer.renderCircle(this.radius) }
}

const svgCircle = new Circle(5, new SvgRenderer())
const canvasCircle = new Circle(5, new CanvasRenderer())
console.log(svgCircle.draw())      // '<svg-circle r="5"/>'
console.log(canvasCircle.draw())   // 'canvas.arc(0,0,5)'
```
Walkthrough: `Circle` never hard-codes HOW it's drawn — it holds a
`renderer` and delegates `draw()` to whichever one it was given. The exact
same `Circle` class produces completely different output depending only on
which renderer object it holds, with zero changes to `Circle` itself.

## python

```python
class SvgRenderer:
    def render_circle(self, radius):
        return f'<svg-circle r="{radius}"/>'


class CanvasRenderer:
    def render_circle(self, radius):
        return f'canvas.arc(0,0,{radius})'


class Circle:
    def __init__(self, radius, renderer):
        self.radius = radius
        self.renderer = renderer

    def draw(self):
        return self.renderer.render_circle(self.radius)


svg_circle = Circle(5, SvgRenderer())
canvas_circle = Circle(5, CanvasRenderer())
print(svg_circle.draw())      # '<svg-circle r="5"/>'
print(canvas_circle.draw())   # 'canvas.arc(0,0,5)'
```
Walkthrough: identical delegation structure as the JavaScript version —
`Circle` holds whichever renderer it's given and forwards `draw()` to it,
letting shape and rendering strategy vary completely independently.
