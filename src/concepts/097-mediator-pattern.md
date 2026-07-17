---
concept: 097-mediator-pattern
name: Mediator Pattern
---

## Definition

The Mediator pattern centralizes how a set of objects communicate with
each other through one shared "mediator" object, instead of every object
holding direct references to every other object it needs to talk to.

## Problem

A group of objects that all need to notify or coordinate with each other
directly creates a tangled web of direct references — every object is
coupled to every other one it interacts with. A mediator becomes the ONLY
thing each object talks to, and it's responsible for routing messages
between them.

## Execution

WidgetA changes → notifies the mediator, NOT other widgets directly
↓
Mediator decides what should happen as a result (maybe WidgetB needs to
update, maybe WidgetC needs to disable)
↓
Mediator calls the appropriate methods on WidgetB/WidgetC directly
↓
WidgetA never knew WidgetB or WidgetC existed — it only ever talked to the mediator

## Computer Science

This replaces a many-to-many web of direct references between N objects
(which grows as roughly N² relationships) with a many-to-one relationship —
every object only needs a reference to the ONE mediator, and the mediator
alone knows about the full set of participants and how they should respond
to each other.

Tags: Decoupling, Centralized communication, Relationship reduction

## Software Engineering

This shows up in UI frameworks (a dialog's mediator coordinating several
form fields — enabling a submit button only once all required fields are
valid) and in chat-room-style systems (a central hub routing messages
between participants who never talk to each other directly).

Tags: UI coordination, Chat systems, Event coordination

## Common Mistakes

- Letting the mediator itself grow into an unmanageable "god object" that knows every detail of every participant's internal behavior — the mediator should coordinate, not absorb every participant's actual logic.
- Having participants ALSO keep direct references to each other on the side, defeating the whole point of routing everything through the mediator.

## Exercises

- Add a third widget or participant to the mediator example and have the mediator coordinate a rule involving all three.
- Identify a real UI form (like a checkout form) where one field's value affects whether another field is enabled — would a mediator help organize that logic?

## javascript

```javascript
class Dialog {
  #submitEnabled = false
  notify(sender, event) {
    if (sender === 'checkbox' && event === 'checked') {
      this.#submitEnabled = true
    }
  }
  get submitEnabled() { return this.#submitEnabled }
}

class Checkbox {
  constructor(mediator) { this.mediator = mediator }
  check() { this.mediator.notify('checkbox', 'checked') }
}

const dialog = new Dialog()
const checkbox = new Checkbox(dialog)

console.log(dialog.submitEnabled)   // false
checkbox.check()
console.log(dialog.submitEnabled)   // true
```
Walkthrough: `Checkbox` never touches a submit button directly — it only
calls `mediator.notify(...)`. `Dialog` (the mediator) is the only object
that knows checking the box should enable submit, keeping that
coordination logic in one place instead of scattered across every
participant.

## python

```python
class Dialog:
    def __init__(self):
        self._submit_enabled = False

    def notify(self, sender, event):
        if sender == 'checkbox' and event == 'checked':
            self._submit_enabled = True

    @property
    def submit_enabled(self):
        return self._submit_enabled


class Checkbox:
    def __init__(self, mediator):
        self.mediator = mediator

    def check(self):
        self.mediator.notify('checkbox', 'checked')


dialog = Dialog()
checkbox = Checkbox(dialog)

print(dialog.submit_enabled)   # False
checkbox.check()
print(dialog.submit_enabled)   # True
```
Walkthrough: identical centralized-coordination mechanics as the
JavaScript version — `Checkbox` only ever talks to the mediator, which
alone decides what checking the box should trigger elsewhere.
