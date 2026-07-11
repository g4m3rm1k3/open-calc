---
series: javascript-fundamentals
level: 9
title: Modules
lang: javascript
---

# Modules

A **module** is a file with its own scope. Without modules, every variable and function defined in any script file is in the global scope — all code in all files shares the same namespace, and name collisions are inevitable. With modules, each file is private by default. You choose exactly what to share.

This lesson teaches how to export values from a module, import them into another, and why modules are the foundation of any codebase larger than a single file.

## The Problem Modules Solve

Without modules, a 10-file project has one global scope:

```text
file1.js:  let count = 0     ← global
file2.js:  let count = 0     ← overwrites file1's count
file3.js:  count = 99        ← modifies which count?
```

Every name collision is a silent bug. With modules:
```text
file1.js:  let count = 0     ← private to file1
file2.js:  let count = 0     ← private to file2, no conflict
file3.js:  import { count } from './file1.js'  ← explicit
```

You import only what you need, from exactly the file you mean.

## Named Exports

`export` makes a value available to other modules. `export const`, `export function`, or `export class` at declaration time:

```javascript
export const PI = 3.14159

export function circleArea(radius) {
  return PI * radius * radius
}

export function circleCircumference(radius) {
  return 2 * PI * radius
}
```

This file exports three things: `PI`, `circleArea`, and `circleCircumference`. Everything else in the file (helper functions, intermediate variables) stays private.

## Named Imports

`import { name } from './module.js'` — imports a specific named export:

```javascript
import { circleArea, circleCircumference } from './geometry.js'

console.log(circleArea(5))
console.log(circleCircumference(5))
```

```text
78.53975
31.4159
```

`{ circleArea, circleCircumference }` — import only what you need. Unused exports are not loaded into the current scope. The path `'./geometry.js'` is relative to the current file — `./` means "same directory."

`as` renames an import to avoid name collisions:

```javascript
import { circleArea as area } from './geometry.js'

console.log(area(5))
```

## Default Exports

A module can have one **default export** — the "main thing" the module provides:

```javascript
export default class EventEmitter {
  constructor() {
    this.listeners = {}
  }

  on(event, handler) {
    if (!this.listeners[event]) {
      this.listeners[event] = []
    }
    this.listeners[event].push(handler)
  }

  emit(event, data) {
    const handlers = this.listeners[event] ?? []
    for (const handler of handlers) {
      handler(data)
    }
  }
}
```

`export default class EventEmitter` — the default export. A file has at most one default export.

`this.listeners[event] ?? []` — `??` is the **nullish coalescing operator**: if the left side is `null` or `undefined`, return the right side; otherwise return the left side. `this.listeners[event]` is `undefined` when no listener has been registered for that event yet, so `?? []` provides an empty array as the fallback.

Importing a default export uses no curly braces:

```javascript
import EventEmitter from './event-emitter.js'

const emitter = new EventEmitter()

emitter.on("data", value => console.log(`Received: ${value}`))
emitter.emit("data", "hello")
emitter.emit("data", "world")
```

```text
Received: hello
Received: world
```

`import EventEmitter from './event-emitter.js'` — the local name (`EventEmitter`) can be anything; it refers to whatever was the default export.

## Re-exporting — Building an Index Module

A common pattern: an `index.js` that re-exports from several files, creating a single import point:

```javascript
export { circleArea, circleCircumference } from './geometry.js'
export { default as EventEmitter } from './event-emitter.js'
export const VERSION = "1.0.0"
```

Callers import from `index.js` without needing to know the file structure:

```javascript
import { circleArea, EventEmitter, VERSION } from './index.js'
```

**SE lens:** Index modules are the JavaScript equivalent of a package's public API. They declare the contract — what callers can depend on. Internal modules can be reorganised without touching any caller, as long as the index re-exports remain stable.

## import() — Dynamic Import

`import(path)` imports a module at runtime and returns a Promise. Use it when you need to load a module conditionally or on demand:

```javascript
async function loadPlugin(pluginName) {
  const module = await import(`./plugins/${pluginName}.js`)
  return module.default
}
```

`import(path)` — a dynamic import. Unlike the static `import` declaration at the top of a file, this runs when the code reaches it and can use variables in the path. It returns a Promise that resolves with the module's exports.

**CS lens:** Static imports (at the top of a file) are resolved at load time — the bundler knows exactly what each file needs before any code runs. Dynamic `import()` is resolved at runtime — the code chooses which module to load based on values that only exist while running. Bundlers like Vite and webpack use this distinction to split code into separate files that are loaded on demand (code splitting).

## Challenge: make_registry

Write a function `makeRegistry()` that returns an object with two methods: `register(name, value)` and `lookup(name)`. `register` stores `value` under `name`. `lookup` returns the stored value, or `null` if no value has been registered under that name.

This is the same encapsulation pattern from Level 6 (closures) — the registry data must be private. The returned object is the only way to interact with it.

```challenge
function makeRegistry() {
  // TODO: return { register, lookup }
}
```

```test
const reg = makeRegistry()
reg.register("pi", 3.14159)
reg.register("e", 2.71828)
assert reg.lookup("pi") === 3.14159
assert reg.lookup("e") === 2.71828
assert reg.lookup("unknown") === null
assert typeof reg.register === "function"
```
