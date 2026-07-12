---
series: design-patterns
level: 0
title: What Design Patterns Are
lang: javascript
---

# What Design Patterns Are

A design pattern is a named, reusable solution to a recurring design problem. Patterns are not code you copy — they are templates for thinking. When you recognise a problem as "the observer problem" or "the strategy problem", you can apply a known solution instead of inventing one from scratch.

Patterns were named by the Gang of Four (Gamma, Helm, Johnson, Vlissides) in 1994. Their book catalogued 23 patterns across three categories. Not all are equally useful today; some have become idiomatic JavaScript; others are workarounds for the limitations of older languages. This series focuses on the patterns that appear most frequently in modern JavaScript and TypeScript codebases, and teaches you to recognise the problem each one solves.

## Why patterns matter

```text
WITHOUT PATTERN VOCABULARY:

  DEVELOPER A: "I have a user object that needs to notify several components
  when its profile is updated — the header avatar, the settings panel, and
  the notification count badge."

  DEVELOPER B: "OK, so we'll need to add methods to call each of those...
  wait, what if there are more components later? And how do we unsubscribe?"

  [30 minutes of design discussion]

WITH PATTERN VOCABULARY:

  DEVELOPER A: "Use the Observer pattern — the user object is the subject,
  the components are observers."

  DEVELOPER B: "Right. We'll use EventEmitter and .on()/.off()."

  [2 minutes. Both developers immediately know the shape of the solution.]
```

```text
THE THREE CATEGORIES:

  CREATIONAL: how objects are created
    → When the creation logic is complex, we want to separate it from use
    → Factory, Builder, Singleton

  STRUCTURAL: how objects are composed into larger structures
    → When we need to combine objects in flexible ways without tight coupling
    → Adapter, Decorator, Facade, Proxy, Composite

  BEHAVIOURAL: how objects communicate and distribute responsibility
    → When we need to define how objects interact without hard-coding the relationships
    → Observer, Strategy, Command, Iterator, State, Template Method

WHAT A PATTERN CONSISTS OF:
  Intent:     What problem does it solve? In one sentence.
  Structure:  The classes/objects and their relationships.
  When to use: The specific conditions that make this pattern applicable.
  Tradeoffs:  What you gain and what you give up.
```

**CS lens:** Design patterns are a **vocabulary** over the solution space of object-oriented design. They encode the experience of thousands of programmers who encountered the same structural problems. Patterns don't add new expressive power — you could write the same code without knowing the pattern name. Their value is in communication and in recognising the shape of a problem before you have solved it. When you see code and say "that's a Strategy", you immediately understand the code's intent: there are multiple interchangeable algorithms, and the choice is deferred until runtime.

## Recognising the problem, not the pattern

```text
HOW TO APPLY PATTERNS:

  WRONG WAY:
    "I want to use a Decorator pattern. Let me find a place to apply it."
    → Applying patterns without a problem to solve adds complexity for no benefit.

  RIGHT WAY:
    "I have code that wraps another object to add behaviour without modifying it."
    → Recognise the structural shape → this is the Decorator pattern → name it, use it.

  THE FOUR QUESTIONS THAT LEAD TO A PATTERN:
    1. Is this creation logic too complex to put at the call site?
       → Creational pattern (Factory, Builder)
    2. Do I need to combine objects or add behaviour without modifying them?
       → Structural pattern (Decorator, Adapter, Facade)
    3. Do I need objects to communicate without hard-coding the relationship?
       → Behavioural pattern (Observer, Strategy, Command)
    4. Can I simplify this by naming the existing structure?
       → Might not need a pattern — it might already be clean
```

## Patterns in modern JavaScript

```javascript
// OBSERVER: you already use this constantly
const emitter = new EventEmitter()
emitter.on('data', handler)   // subscribe
emitter.emit('data', value)   // notify
emitter.off('data', handler)  // unsubscribe

// ITERATOR: built into the language
for (const item of array) { ... }           // array[Symbol.iterator]()
for (const [k, v] of map.entries()) { ... } // Map iterator

// STRATEGY: functions as first-class values
const SORT_STRATEGIES = {
  byName:  (a, b) => a.name.localeCompare(b.name),
  byDate:  (a, b) => a.date - b.date,
  byPrice: (a, b) => a.price - b.price,
}
items.sort(SORT_STRATEGIES[userChoice])

// DECORATOR: higher-order functions
function withLogging(fn) {
  return function(...args) {
    console.log('called:', fn.name, args)
    const result = fn.apply(this, args)
    console.log('returned:', result)
    return result
  }
}

// FACADE: simplifying a complex subsystem
// axios is a facade over the browser's fetch/XMLHttpRequest
// React is a facade over the DOM
```

```text
JAVASCRIPT'S EFFECT ON PATTERNS:

  Several patterns exist specifically to work around the limitations of
  class-based OOP languages (Java, C++). JavaScript's features reduce their need:

  Singleton → module: a module is executed once; its exports are cached.
    Just export an instance from a module: export const db = createDatabase()

  Command → function: a command is just "an action packaged as an object."
    In JavaScript: just pass a function. const undo = () => { ... }

  Template Method → higher-order function: the "template" is a function
    that accepts other functions to fill in the variable parts.

  Iterator → Symbol.iterator + for...of: built into the language.

  Factory → function: a function that returns an object IS a factory.
    function createUser(name) { return { name, createdAt: Date.now() } }
```

**SE lens:** The value of patterns in a team setting is consistency. When a team agrees to use Observer for event propagation, Strategy for interchangeable algorithms, and Factory for complex construction, new team members can immediately recognise the intent of unfamiliar code. This is why many style guides and architecture documents reference patterns by name: they reduce the surface area of decisions. The risk is cargo-culting — applying patterns because they are patterns, not because they solve a specific problem. The discipline is: always start with the problem, then find the pattern that names its shape.

**Common mistakes:**
- Applying patterns everywhere — patterns are named for common problems. If the problem isn't common or isn't clearly present, the pattern adds complexity with no benefit. Three lines of code that inline a Strategy are often clearer than a proper Strategy hierarchy.
- Confusing patterns with implementations — the Observer pattern can be implemented with EventEmitter, with arrays of callbacks, with Proxy, or with a reactive library. The pattern is the intent; the implementation details vary.
- Not knowing when to stop — patterns can nest (a Facade that uses several Strategies internally is fine). But when you are applying a pattern to a pattern to a pattern to work around your own earlier patterns: the design may be wrong.

**Debug tip:** When reading unfamiliar code, look for pattern signatures: an `on`/`emit`/`off` trio → Observer; a function or object passed as a parameter to customise behaviour → Strategy; a wrapping object that forwards calls to an inner object while adding behaviour → Decorator; a method that calls abstract methods filled in by subclasses → Template Method. Naming the pattern gives you a mental model of the code's intent without reading every line.

## Challenge: patternIdentification

Identify which pattern is being used.

```challenge
function identifyPattern(codeDescription) {
  // Returns the pattern name: 'observer', 'strategy', 'decorator', 'factory', 'facade'
  
  // codeDescription values and expected patterns:
  //   'event-emitter'    → 'observer'    (subject notifies multiple observers)
  //   'sort-comparator'  → 'strategy'    (algorithm swapped at runtime)
  //   'logging-wrapper'  → 'decorator'   (adds behaviour without modifying the wrapped object)
  //   'create-function'  → 'factory'     (function that creates and returns configured objects)
  //   'api-client'       → 'facade'      (simple interface over a complex subsystem)
}
```

```test
assert identifyPattern('event-emitter')   === 'observer'
assert identifyPattern('sort-comparator') === 'strategy'
assert identifyPattern('logging-wrapper') === 'decorator'
assert identifyPattern('create-function') === 'factory'
assert identifyPattern('api-client')      === 'facade'
```
