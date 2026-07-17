---
concept: 095-command-pattern
name: Command Pattern
---

## Definition

The Command pattern turns a request or action into a standalone object,
which can be stored, passed around, queued, or undone, instead of executing
the action immediately and irreversibly as a direct method call.

## Problem

A direct method call happens immediately and leaves no record of what
happened — implementing "undo," a queue of pending actions, or logging
every action performed requires something more than just calling a method
and forgetting about it. Wrapping each action in a Command object gives
something concrete to store, inspect, queue, or reverse.

## Execution

Create a command object representing "turn on the light" (holds a
reference to the light + what to do)
↓
Execute the command → it calls light.turnOn() internally
↓
Store the command in a history list (for undo later)
↓
To undo: call the command's own undo() method → it calls light.turnOff(),
reversing exactly what execute() did

## Computer Science

A command bundles a **receiver** (the object the action is actually
performed on) together with the action itself into one standalone object
with a uniform `execute()` (and often `undo()`) interface — this decouples
the code that TRIGGERS an action from the code that actually PERFORMS it,
since the trigger only needs to call `command.execute()`, not know anything
about how the action actually works.

Tags: Encapsulated action, Undo/redo, Decoupling, Request queuing

## Software Engineering

This is the standard way to implement undo/redo (each command knows how to
reverse itself), action queues or macros (a list of commands executed in
sequence), and decoupling UI elements from the business logic they trigger
— a button just holds and executes some command, without knowing what that
command actually does.

Tags: Undo/redo, Macro recording, UI decoupling, Action queues

## Common Mistakes

- Making a command execute immediately in its own constructor instead of via a separate `execute()` call — this defeats the purpose of being able to store, queue, or delay the command before it actually runs.
- Forgetting to implement `undo()` symmetrically with `execute()` — an undo that doesn't precisely reverse what execute did leaves the receiver in an inconsistent state.

## Exercises

- Create a history array that stores every executed command, then call `undo()` on the most recently stored one — confirm it reverses exactly the last action.
- Build a `MacroCommand` that holds a list of other commands and executes all of them in sequence when its own `execute()` is called.

## javascript

```javascript
class Light {
  constructor() { this.isOn = false }
  turnOn() { this.isOn = true }
  turnOff() { this.isOn = false }
}

class TurnOnCommand {
  constructor(light) { this.light = light }
  execute() { this.light.turnOn() }
  undo() { this.light.turnOff() }
}

const light = new Light()
const command = new TurnOnCommand(light)

command.execute()
console.log(light.isOn)   // true
command.undo()
console.log(light.isOn)   // false
```
Walkthrough: `command.execute()` and `command.undo()` are the only things
the calling code ever needs to call — it never touches `light.turnOn()` or
`light.turnOff()` directly. The command object bundles the receiver
(`light`) and the two matching actions together into one reversible unit.

## python

```python
class Light:
    def __init__(self):
        self.is_on = False

    def turn_on(self):
        self.is_on = True

    def turn_off(self):
        self.is_on = False


class TurnOnCommand:
    def __init__(self, light):
        self.light = light

    def execute(self):
        self.light.turn_on()

    def undo(self):
        self.light.turn_off()


light = Light()
command = TurnOnCommand(light)

command.execute()
print(light.is_on)   # True
command.undo()
print(light.is_on)   # False
```
Walkthrough: identical encapsulated-action mechanics as the JavaScript
version — the command bundles `light` together with the paired
execute/undo actions, exposing only those two methods to the caller.
