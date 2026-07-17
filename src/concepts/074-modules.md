---
concept: 074-modules
name: Modules / Import-Export
---

## Definition

A module is a self-contained unit of code that explicitly declares what it
makes available to other code (exports) and pulls in only what it actually
needs from elsewhere (imports) — instead of everything living in one shared
global scope.

## Problem

Without modules, every file's top-level variables and functions live in the
same global namespace — two files that happen to both define something
called `config` collide, and it's not obvious from reading one file alone
what it actually depends on from elsewhere. Modules make both the dependency
and the boundary explicit.

## Computer Science

A module's exports and imports form a dependency graph between files — the
module system (ESM, CommonJS, Python's import machinery) resolves that
graph and runs each module's top-level code exactly once, no matter how
many other modules import it, caching the result for every later import of
the same module.

Tags: Dependency graph, Module resolution, Namespace isolation, Single evaluation

## Software Engineering

Explicit exports and imports make a codebase's actual dependencies visible
just from reading the top of a file, instead of tracing which global
variables a piece of code happens to rely on. This is also what enables
tree-shaking — removing unused exported code from a final bundle — since a
bundler can see precisely which exports are actually imported anywhere.

Tags: Encapsulation, Tree-shaking, Namespace collisions, Dependency management

## Common Mistakes

- Creating a circular dependency (module A imports from module B, which imports from module A) — depending on the module system and what's used at the top level, this can silently produce an incomplete value instead of a clear error.
- Using a wildcard import when only one or two specific things are needed — this defeats tree-shaking and makes it unclear from the import line alone what's actually being used.

## Exercises

- Split a file with two related functions into two real files, one importing from the other, and confirm both still work when imported from a third file.
- Look up whether a real project's build tool reports any circular dependency warnings, and if so, trace which two modules are actually involved.

## javascript

```javascript
// In a real project this would be its own file, math.js, imported elsewhere
// with a static "import square, { add, multiply } from './math.js'" line.
// It's built here as a data: URL instead, purely so this whole demo can run
// as one self-contained script rather than two separate files.
const moduleCode = `
export function add(a, b) { return a + b }
export function multiply(a, b) { return a * b }
export default function square(x) { return x * x }
`
const moduleUrl = 'data:text/javascript;base64,' + btoa(moduleCode)

const { default: square, add, multiply } = await import(moduleUrl)
console.log(add(2, 3))        // 5
console.log(multiply(2, 3))   // 6
console.log(square(4))        // 16
```
Walkthrough: the module has two **named exports** (`add`, `multiply`) and
one **default export** (`square`). Named exports must be imported with
matching names inside `{ }`, while a default export can be bound to any
name the importer chooses — here, `square`. `import()` loads the module and
runs its top-level code exactly once, returning an object holding everything
it exported.

## python

```python
import types

# In a real project this would be its own file, math_utils.py, imported
# elsewhere with a plain "import math_utils" line. It's built here as an
# in-memory module object instead, purely so this whole demo can run as one
# self-contained script rather than two separate files.
module_code = '''
def add(a, b):
    return a + b

def multiply(a, b):
    return a * b
'''

math_utils = types.ModuleType('math_utils')
exec(module_code, math_utils.__dict__)

print(math_utils.add(2, 3))        # 5
print(math_utils.multiply(2, 3))   # 6
```
Walkthrough: `math_utils` is a real module object with its own namespace
(`__dict__`) — exactly what `import math_utils` would give you if this were
a real file, just constructed in-memory here. Accessing `math_utils.add`
instead of a bare `add` is the same namespacing a real `import module_name`
statement provides, keeping this module's names from colliding with
anything else in the calling script.
