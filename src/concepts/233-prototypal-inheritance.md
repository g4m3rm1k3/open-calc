---
concept: 233-prototypal-inheritance
name: Prototypal Inheritance (JavaScript)
---

## Definition

JavaScript objects inherit properties and methods through a PROTOTYPE
CHAIN — each object has an internal link to another object (its
prototype), and property lookups that fail on the object itself
automatically continue up this chain — a fundamentally different
inheritance model from class-based languages, even though JS's `class`
syntax is built on top of it.

## Problem

Class-based inheritance (Java, C#) defines a fixed hierarchy at compile
time, with each object having a rigid, unchangeable relationship to its
class. JavaScript instead links objects directly to OTHER OBJECTS as
prototypes — a more flexible, dynamic model where the prototype chain
itself can be inspected and even modified at runtime, and where `class`
syntax is really just a more familiar-looking wrapper around this same
underlying object-linking mechanism.

## Execution

A plain object has one method
↓
A second object is created with the first set as its PROTOTYPE — the
second object itself has NO OWN copy of that method
↓
Calling the method on the second object: JS looks for it DIRECTLY first
— not found — then follows the prototype link — FOUND there — returns
the result
↓
Adding a method DIRECTLY to the second object does NOT affect the
prototype or any OTHER object using that same prototype
↓
`class Dog extends Animal { }` syntax compiles down to essentially the
SAME prototype-chain-linking mechanism — `class` is syntactic sugar over
prototypal inheritance, not a fundamentally different system

## Computer Science

Property lookup in JS walks the prototype chain — checking the object
itself, then its prototype, then ITS prototype, and so on, until either
the property is found or the chain ends (at `null`) — this dynamic,
per-lookup traversal is what makes JS's inheritance model fundamentally
different from a class-based language's fixed, compile-time-resolved
method dispatch.

Tags: Prototype chain, Dynamic property lookup, class as syntactic sugar

## Software Engineering

Understanding that `class` is built on prototypes (not a separate
system) explains otherwise-confusing JS behavior — like why modifying a
class's prototype method affects EVERY existing instance immediately,
since instances don't hold their own copy of methods, they just look
them up through the shared prototype link at call time.

Tags: Shared method storage, Runtime prototype modification, Debugging prototype-based behavior

## Common Mistakes

- Assuming each object instance has its OWN independent copy of every method — methods typically live on the shared PROTOTYPE, looked up dynamically per call, not duplicated per instance (which is actually a memory efficiency, not a bug, once understood).
- Confusing JavaScript's prototypal inheritance with classical (class-based) inheritance conceptually — `class` syntax LOOKS similar to Java/C#, but the underlying mechanism (a dynamic, walkable chain of object links) behaves differently in subtle ways, especially around dynamic modification.

## Exercises

- Trace through what happens if the prototype's method is REASSIGNED to a new function AFTER a dependent object is created — does the dependent object's call reflect that change?
- Explain why adding a method directly to one object doesn't affect any OTHER object that also uses the same prototype.

## javascript

```javascript
const animal = {
  speak() { return 'some sound' }
}

const dog = Object.create(animal)   // dog's prototype is animal

console.log(dog.speak())   // 'some sound' -- found via the prototype chain, not on dog itself

dog.bark = function() { return 'Woof!' }   // added directly to dog
console.log(dog.bark())    // 'Woof!'

const cat = Object.create(animal)   // a DIFFERENT object, also using animal as its prototype
console.log(typeof cat.bark)   // 'undefined' -- bark was only added to dog, not to animal or cat

animal.speak = function() { return 'a NEW sound' }   // reassigning animal's method
console.log(dog.speak())   // 'a NEW sound' -- dog's lookup follows the chain fresh each call, sees the change
```
Walkthrough: `dog.speak()` finds `speak` via the prototype chain (on
`animal`, not `dog` itself). `dog.bark` was added directly to `dog`, so
`cat` — a separate object also prototyping from `animal` — never sees it.
Reassigning `animal.speak` changes what `dog.speak()` resolves to on the
VERY NEXT call, since each lookup walks the chain fresh rather than
caching a fixed reference.
