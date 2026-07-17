---
concept: 086-prototype-pattern
name: Prototype Pattern
---

## Definition

The Prototype pattern creates a new object by copying an existing
"prototype" instance, rather than constructing one from scratch through a
class's constructor.

## Problem

Building an object from scratch every time can be expensive (elaborate
setup, database lookups) or simply awkward when what's really needed is
"another one just like this one, with maybe one field tweaked." Cloning an
existing instance sidesteps re-running whatever expensive or complex setup
created the original.

## Execution

Create a fully-configured original object (the prototype)
↓
Call clone() → produce a NEW, independent object with the same field values as the prototype
↓
Modify one field on the clone
↓
The original prototype is unaffected — the clone is a fully separate object, not a reference to the same one

## Computer Science

This is essentially about copy semantics — a **shallow copy** duplicates
only the top-level fields (nested objects/arrays are still shared
references between original and clone), while a **deep copy** recursively
duplicates everything nested too. Choosing the wrong one is a common source
of "changing the clone somehow changed the original" bugs.

Tags: Shallow vs deep copy, Object cloning, Copy constructors

## Software Engineering

Prototype is useful when object creation is expensive (requiring, say, a
database round-trip to populate defaults) or when a system needs to produce
many similar-but-slightly-different objects derived from a small set of
"template" instances, without hard-coding a class hierarchy for every
variation.

Tags: Object copying, Template instances, Expensive initialization

## Common Mistakes

- Doing a shallow copy when a deep copy was actually needed (or vice versa) — mutating a nested object or array on the clone unexpectedly changes the original too, since they still share the same nested reference.
- Cloning an object with resources that shouldn't be duplicated (an open file handle, a network connection) without special-casing them — blindly copying every field can copy something that was never meant to exist twice.

## Exercises

- Clone a prototype object that has a nested array field, mutate the array on the clone, and observe whether the original changes too (a shallow-copy pitfall).
- Fix the previous exercise's problem by writing a proper deep clone for that same object.

## javascript

```javascript
class Character {
  constructor(name, stats) { this.name = name; this.stats = stats }
  clone() {
    return new Character(this.name, { ...this.stats })   // shallow copy of stats
  }
}

const original = new Character('Goblin', { hp: 10, attack: 3 })
const clone = original.clone()
clone.name = 'Goblin Chief'
clone.stats.hp = 30

console.log(original.name, original.stats.hp)   // 'Goblin' 10 — unaffected
console.log(clone.name, clone.stats.hp)         // 'Goblin Chief' 30
```
Walkthrough: `clone()` builds a brand-new `Character` with its own copy of
`stats` (via the spread `{ ...this.stats }`), so mutating `clone.stats.hp`
afterward has no effect on `original.stats.hp` — the two objects are fully
independent after cloning.

## python

```python
import copy


class Character:
    def __init__(self, name, stats):
        self.name = name
        self.stats = stats

    def clone(self):
        return Character(self.name, copy.copy(self.stats))   # shallow copy of stats


original = Character('Goblin', {'hp': 10, 'attack': 3})
clone = original.clone()
clone.name = 'Goblin Chief'
clone.stats['hp'] = 30

print(original.name, original.stats['hp'])   # Goblin 10 -- unaffected
print(clone.name, clone.stats['hp'])         # Goblin Chief 30
```
Walkthrough: identical shallow-copy mechanics as the JavaScript version —
Python's `copy.copy()` duplicates the top-level `stats` dict, so `clone`
and `original` no longer share the same dict object, even though they
started out with equal contents.
