---
concept: 098-memento-pattern
name: Memento Pattern
---

## Definition

The Memento pattern captures and externalizes an object's internal state at
a point in time, so it can be restored to that exact state later, without
exposing the object's internal implementation details to whoever is storing
the snapshot.

## Problem

Implementing undo requires saving enough of an object's past state to
restore it later — but directly exposing all of an object's internal
fields to whatever code is managing undo history breaks encapsulation. A
memento lets the object itself decide what to save and how to restore it,
handing back an opaque snapshot the external code can store without
inspecting or modifying.

## Execution

editor.setText('Hello') → editor's internal state changes
↓
Save a memento: editor.save() → returns an opaque snapshot holding a COPY of the current text
↓
editor.setText('Hello World') → editor's internal state changes again
↓
Restore: editor.restore(savedMemento) → editor's text reverts to exactly
what it was when the memento was created, undoing the second change

## Computer Science

The memento object is opaque to whoever holds it — a history or "caretaker"
list just stores it, without reading or modifying its contents. Only the
**originator** object that created the memento knows how to interpret it and
restore its own state from it, keeping the internal representation fully
encapsulated even while its state is being saved and restored externally.

Tags: Encapsulation, State snapshots, Undo/redo, Opaque objects

## Software Engineering

This is the standard mechanism behind undo/redo history (a stack of
mementos, one per past state) and checkpoint/rollback systems (save a
known-good state before a risky operation, restore it if something goes
wrong) — the caretaker never needs to understand the snapshot's internal
shape, just when to save and restore one.

Tags: Undo/redo, Checkpointing, Rollback, History management

## Common Mistakes

- Storing every single field of the object directly in the caretaker/history code, rather than letting the object itself produce an opaque memento — this exposes internals and couples the history-tracking code to the object's implementation details.
- Saving a REFERENCE to mutable internal state instead of a genuine copy — if the memento just points at the same mutable object being saved, later changes to the "current" state silently corrupt the "saved" snapshot too.

## Exercises

- Save a memento, make two more changes, then restore — confirm the state reverts to exactly the point the memento was taken, undoing BOTH later changes at once.
- Modify the example so multiple mementos are stored in a history list, and add an `undo()` that pops the most recent one and restores it.

## javascript

```javascript
class Editor {
  #text = ''
  setText(text) { this.#text = text }
  getText() { return this.#text }
  save() { return { text: this.#text } }              // an opaque memento
  restore(memento) { this.#text = memento.text }
}

const editor = new Editor()
editor.setText('Hello')
const saved = editor.save()
editor.setText('Hello World')
console.log(editor.getText())   // 'Hello World'
editor.restore(saved)
console.log(editor.getText())   // 'Hello' — reverted
```
Walkthrough: `save()` returns a small snapshot object holding a copy of the
current text. Storing that snapshot elsewhere and calling `restore()` with
it later resets the editor's internal `#text` back to exactly what it was
— the caretaker holding `saved` never needed to know or touch the editor's
internal representation directly.

## python

```python
class Editor:
    def __init__(self):
        self._text = ''

    def set_text(self, text):
        self._text = text

    def get_text(self):
        return self._text

    def save(self):
        return {'text': self._text}   # an opaque memento

    def restore(self, memento):
        self._text = memento['text']


editor = Editor()
editor.set_text('Hello')
saved = editor.save()
editor.set_text('Hello World')
print(editor.get_text())   # 'Hello World'
editor.restore(saved)
print(editor.get_text())   # 'Hello' -- reverted
```
Walkthrough: identical snapshot-and-restore mechanics as the JavaScript
version — `save()` produces a small independent copy of the current state,
and `restore()` resets the editor using that copy, undoing whatever
changed after it was taken.
