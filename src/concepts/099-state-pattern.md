---
concept: 099-state-pattern
name: State Pattern
---

## Definition

The State pattern lets an object change its behavior entirely when its
internal state changes, by delegating each behavior to a separate state
object, instead of a single class with a giant conditional checking "which
state am I in" before every action.

## Problem

An object whose behavior genuinely differs depending on some internal mode
— a traffic light behaving differently when red, yellow, or green — ends up
with every method riddled with "if state is X, do this" checks, scattered
across every single method. State pattern moves each mode's entire behavior
into its own class, and the object just delegates to whichever state object
it currently holds.

## Execution

trafficLight.state = RedState
↓
Call trafficLight.next() → delegates to RedState.next(trafficLight) → sets trafficLight.state = GreenState
↓
Call trafficLight.next() again → NOW delegates to GreenState.next(trafficLight) (different behavior, since the state object itself changed) → sets trafficLight.state = YellowState
↓
The SAME method call on the SAME object produces different behavior over
time, purely because which state object is currently held has changed

## Computer Science

Each state object implements the same interface, and the context object
(the traffic light) simply forwards calls to whichever state it currently
holds — transitioning between states means literally swapping which state
object is held. This is closely related to Strategy: the difference is
that State transitions between different behaviors as a natural sequence
over time, while Strategy typically picks one algorithm without necessarily
changing it based on the object's own internal events.

Tags: Finite state machine, Delegation, Strategy pattern, Behavior encapsulation

## Software Engineering

This directly models a finite state machine in object-oriented code —
anywhere behavior needs to change based on a well-defined set of modes and
transitions between them (workflow statuses, connection states, game
character states), State pattern keeps each mode's logic isolated instead
of scattered across conditionals.

Tags: Finite state machine, Workflow states, Game states

## Common Mistakes

- Keeping the "which state am I in" conditional logic anyway, inside the context object, instead of truly delegating to separate state objects — this defeats the whole purpose, since the giant conditional is still there, just moved.
- Forgetting to update the context's current state reference during a transition — the state object decides what should happen next, but the context still points at the old, stale state object.

## Exercises

- Add a `YellowState` completing the red→green→yellow→red cycle, and trace through several `next()` calls to confirm the cycle repeats correctly.
- Compare this pattern side by side with Strategy — write one sentence describing the key difference in when/why the "current implementation" changes.

## javascript

```javascript
class RedState {
  next(light) { light.state = new GreenState() }
  name() { return 'red' }
}
class GreenState {
  next(light) { light.state = new YellowState() }
  name() { return 'green' }
}
class YellowState {
  next(light) { light.state = new RedState() }
  name() { return 'yellow' }
}

class TrafficLight {
  constructor() { this.state = new RedState() }
  next() { this.state.next(this) }
  currentName() { return this.state.name() }
}

const light = new TrafficLight()
console.log(light.currentName())   // 'red'
light.next()
console.log(light.currentName())   // 'green'
light.next()
console.log(light.currentName())   // 'yellow'
```
Walkthrough: `TrafficLight.next()` never checks "what color am I" itself —
it just calls `this.state.next(this)`, and each state object decides both
what the next state should be and swaps `light.state` to it. The same
`next()` call site produces a different transition each time purely
because `light.state` is a different object by then.

## python

```python
class RedState:
    def next(self, light):
        light.state = GreenState()

    def name(self):
        return 'red'


class GreenState:
    def next(self, light):
        light.state = YellowState()

    def name(self):
        return 'green'


class YellowState:
    def next(self, light):
        light.state = RedState()

    def name(self):
        return 'yellow'


class TrafficLight:
    def __init__(self):
        self.state = RedState()

    def next(self):
        self.state.next(self)

    def current_name(self):
        return self.state.name()


light = TrafficLight()
print(light.current_name())   # 'red'
light.next()
print(light.current_name())   # 'green'
light.next()
print(light.current_name())   # 'yellow'
```
Walkthrough: identical delegation-to-current-state mechanics as the
JavaScript version — `TrafficLight.next()` simply forwards to whichever
state object it currently holds, and each state decides the next
transition on its own.
