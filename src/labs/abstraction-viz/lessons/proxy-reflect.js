export default {
  id: 'proxy-reflect',
  title: 'Proxy & Reflect',
  tag: 'JS Fundamentals',
  steps: [
    {
      title: 'Proxy — intercept property reads with a get trap',
      code:
`const target = { name: 'Alice', age: 30 }

const handler = {
  get(target, key) {
    console.log('reading: ' + key)
    return target[key]
  }
}

const p = new Proxy(target, handler)
console.log(p.name)
console.log(p.age)
console.log(p.missing)`,
      runCode:
`var target = { name: 'Alice', age: 30 }
var handler = {
  get: function(target, key) {
    console.log('reading: ' + key)
    return target[key]
  }
}
function proxyGet(key) { return handler.get(target, key) }
console.log(proxyGet('name'))
console.log(proxyGet('age'))
console.log(proxyGet('missing'))`,
      explanation: [
        '`new Proxy(target, handler)` creates a wrapper around `target`. The `get` trap intercepts every property read. `p.name` → trap fires: logs `\'reading: name\'`, returns `target[\'name\']` → prints `\'Alice\'`. `p.age` → logs `\'reading: age\'`, returns `30`. `p.missing` → logs `\'reading: missing\'`, returns `undefined` (key doesn\'t exist). Reads happen through the handler, not directly on the target.',
        'CS — A Proxy is a meta-object: it sits in front of another object and intercepts fundamental operations. The ECMAScript spec lists 13 trappable operations — `get`, `set`, `has`, `deleteProperty`, `apply`, `construct`, and more. The Proxy pattern in OOP (wrapping an object to add behavior) is here built into the language runtime itself — the trap fires even on property reads that go through `for...in` or destructuring.',
        'SE — Proxies power: Vue 3\'s reactivity system (property reads and writes trigger component re-renders), MobX 5+ observable objects, `immer`\'s `produce()` function (traps `set` to detect mutations), `jest.fn()` spy wrapping, and GraphQL schema stitching. The `@anthropic-ai/sdk` uses Proxy to create chainable API builders. Any object that "observes" reads/writes of another object uses a Proxy.',
        'Without this: without Proxy, intercepting property reads requires replacing every property with a getter: `Object.defineProperty(obj, \'name\', { get() { ... } })`. This must be done for every property, in advance, knowing the full key list. Proxy is dynamic — it intercepts reads for ANY key, including keys that don\'t exist yet, without knowing them upfront. Vue 2 required `Vue.set(obj, \'newProp\', value)` because defineProperty could only trap known keys. Vue 3 + Proxy eliminated this limitation.',
      ],
      active: [
        { startLine: 3,  endLine: 7,  color: 'violet',  label: 'handler.get — fires on every property read' },
        { startLine: 10, endLine: 13, color: 'emerald', label: 'reading: name/age/missing — trap fires for all keys' },
      ],
      connections: [{ fromLine: 5, toLine: 10, color: 'violet', label: 'p.name → get trap → logs → returns target.name' }],
    },
    {
      title: 'set trap — intercept and validate writes',
      code:
`const target = { name: 'Alice', age: 30 }

const handler = {
  get(target, key) {
    console.log('reading: ' + key)
    return target[key]
  },
  set(target, key, value) {
    if (key === 'age' && typeof value !== 'number') {
      throw new TypeError('age must be a number')
    }
    console.log('writing: ' + key + ' = ' + value)
    target[key] = value
    return true
  }
}

const p = new Proxy(target, handler)

p.age = 31
console.log(target.age)

try {
  p.age = 'thirty'
} catch (e) {
  console.log(e.message)
}`,
      runCode:
`var target = { name: 'Alice', age: 30 }
var handler = {
  set: function(target, key, value) {
    if (key === 'age' && typeof value !== 'number') {
      throw { message: 'age must be a number' }
    }
    console.log('writing: ' + key + ' = ' + value)
    target[key] = value
    return true
  }
}
function proxySet(key, value) { return handler.set(target, key, value) }
proxySet('age', 31)
console.log(target.age)
try {
  proxySet('age', 'thirty')
} catch(e) {
  console.log(e.message)
}`,
      explanation: [
        '`set` trap fires on every property assignment. `p.age = 31` → trap: key is `\'age\'`, value `31` is a number → logs `\'writing: age = 31\'` → `target.age = 31` → returns `true`. `target.age` is now `31`. Then `p.age = \'thirty\'` → trap: value is a string → throws `TypeError(\'age must be a number\')` — the write is rejected before touching `target`. The catch block prints the error message.',
        'CS — The `set` trap is the write-side of the interception. Returning `true` from `set` means the assignment succeeded. Returning `false` (or throwing) means it was rejected. In strict mode, returning `false` from a `set` trap triggers a `TypeError` automatically. The trap receives `(target, key, value, receiver)` — four arguments — where `receiver` is the proxy itself, used for prototype chain writes.',
        'SE — Validation proxies are used for: form state in reactive frameworks (reject invalid types), API response objects (throw if you try to assign to an API-fetched entity — it should be immutable), data store validation in Vuex/Pinia (set traps validate before committing state), and ORM models (reject writes to non-schema fields). `immer`\'s `produce()` uses the set trap to record every mutation as a patch.',
        'Without this: without a set trap, validation must wrap every assignment in a setter method: `user.setAge(31)` instead of `user.age = 31`. This changes the calling convention — callers must know to call the setter. A Proxy validates `user.age = 31` — the same natural syntax — without requiring callers to change anything. The validation layer is completely transparent.',
      ],
      active: [
        { startLine: 8,  endLine: 15, color: 'violet',  label: 'set trap — validates type before allowing write' },
        { startLine: 20, endLine: 21, color: 'emerald', label: 'write allowed: age = 31' },
        { startLine: 23, endLine: 26, color: 'indigo',  label: 'write rejected: "age must be a number"' },
      ],
      connections: [{ fromLine: 9, toLine: 23, color: 'violet', label: 'typeof check → throw rejects the invalid write' }],
    },
    {
      title: 'has trap — intercept the "in" operator',
      code:
`const target = { name: 'Alice', age: 30 }

const handler = {
  get(target, key) {
    console.log('reading: ' + key)
    return target[key]
  },
  set(target, key, value) {
    if (key === 'age' && typeof value !== 'number') throw new TypeError('age must be a number')
    console.log('writing: ' + key + ' = ' + value)
    target[key] = value; return true
  },
  has(target, key) {
    console.log('checking: ' + key)
    return key in target || key === 'toString'
  }
}

const p = new Proxy(target, handler)

console.log('name' in p)
console.log('email' in p)
console.log('toString' in p)`,
      runCode:
`var target = { name: 'Alice', age: 30 }
var handler = {
  has: function(target, key) {
    console.log('checking: ' + key)
    return (key in target) || key === 'toString'
  }
}
function proxyHas(key) { return handler.has(target, key) }
console.log(proxyHas('name'))
console.log(proxyHas('email'))
console.log(proxyHas('toString'))`,
      explanation: [
        '`has` trap intercepts the `in` operator. `\'name\' in p` → trap fires: logs `\'checking: name\'`, `\'name\' in target` is `true` → prints `true`. `\'email\' in p` → logs `\'checking: email\'`, not in target, not `\'toString\'` → prints `false`. `\'toString\' in p` → logs `\'checking: toString\'`, `key === \'toString\'` is `true` → prints `true`, even though `target` has no `toString` own property. The trap allows faking membership.',
        'CS — The `in` operator checks the entire prototype chain. The `has` trap intercepts it at the Proxy level before the prototype chain is searched. This allows the Proxy to add virtual "members" (`toString` above) or to hide real members (`key.startsWith(\'_\') ? false : key in target` hides private-ish properties from `in` checks). `hasOwnProperty` is NOT intercepted by `has` — it bypasses the proxy.',
        'SE — The `has` trap enables "private namespaces": create a Proxy where internal implementation keys (prefixed `__`) return `false` for `in` checks, hiding them from callers. Sandboxing environments use `has` to redirect global variable lookups: `with(new Proxy(sandbox, { has() { return true } })) { code }` — every identifier in `code` is first checked against the sandbox. This is how many template engine sandboxes work.',
        'Without this: without the `has` trap, `key in obj` always searches the real prototype chain — you can\'t intercept it. To add "virtual" keys, you\'d define actual properties on the object. To hide "private" keys, you\'d have to use Symbols or WeakMaps. The `has` trap lets you answer "is this key in this object?" with any custom logic, without modifying the underlying object.',
      ],
      active: [
        { startLine: 13, endLine: 16, color: 'violet',  label: 'has trap — intercepts "in" operator' },
        { startLine: 21, endLine: 23, color: 'emerald', label: 'true (name exists), false (email), true (toString virtual)' },
      ],
      connections: [{ fromLine: 15, toLine: 23, color: 'violet', label: '"toString" added virtually — not in target' }],
    },
    {
      title: 'Reflect — forward operations through the default path',
      code:
`const target = { name: 'Alice', age: 30 }

const handler = {
  get(target, key, receiver) {
    console.log('reading: ' + key)
    return Reflect.get(target, key, receiver)
  },
  set(target, key, value, receiver) {
    if (key === 'age' && typeof value !== 'number') throw new TypeError('age must be a number')
    console.log('writing: ' + key + ' = ' + value)
    return Reflect.set(target, key, value, receiver)
  },
  has(target, key) {
    console.log('checking: ' + key)
    return Reflect.has(target, key)
  }
}

const p = new Proxy(target, handler)

console.log(p.name)
p.age = 31
console.log('age' in p)
console.log(target.age)`,
      runCode:
`var Reflect = {
  get: function(target, key) { return target[key] },
  set: function(target, key, value) { target[key] = value; return true },
  has: function(target, key) { return key in target }
}
var target = { name: 'Alice', age: 30 }
var handler = {
  get: function(target, key, receiver) {
    console.log('reading: ' + key)
    return Reflect.get(target, key)
  },
  set: function(target, key, value, receiver) {
    if (key === 'age' && typeof value !== 'number') throw new TypeError('age must be a number')
    console.log('writing: ' + key + ' = ' + value)
    return Reflect.set(target, key, value)
  },
  has: function(target, key) {
    console.log('checking: ' + key)
    return Reflect.has(target, key)
  }
}
console.log(handler.get(target, 'name'))
handler.set(target, 'age', 31)
console.log(handler.has(target, 'age'))
console.log(target.age)`,
      explanation: [
        '`Reflect` is a built-in object with one static method per Proxy trap. `Reflect.get(target, key, receiver)` is the default property read — equivalent to `target[key]` but correctly handles prototype chains and receivers. Traps use `Reflect` to forward to default behavior after logging. `p.name` → trap logs `\'reading: name\'` → `Reflect.get` returns `\'Alice\'`. `p.age = 31` → trap logs `\'writing: age = 31\'` → `Reflect.set` writes it. `\'age\' in p` → `Reflect.has` returns `true`. `target.age` is `31`.',
        'CS — `Reflect` is the "forward to default" method for each trap. Before `Reflect`, traps called `target[key]` directly. This fails for prototype-chain correctness: if `target` has a getter that returns `this.x`, calling `target[key]` passes `target` as `this`, not the proxy (the `receiver`). `Reflect.get(target, key, receiver)` passes the receiver correctly — essential for inherited getters. Every Proxy trap maps 1:1 to a `Reflect` method with the same signature.',
        'SE — `Reflect` is used in all production Proxy code: Vue 3\'s reactive system calls `Reflect.get(target, key, receiver)` in every `get` trap to handle computed properties correctly. Immer\'s `produce` uses `Reflect.set` to apply mutations. Proxy + Reflect is the standard pattern: trap with custom logic → fall through to `Reflect` for default behavior. Without `Reflect`, handlers must manually re-implement what the engine already knows how to do.',
        'Without this: without `Reflect`, you write `return target[key]` in your `get` trap. This breaks for objects with inherited getters: `class Animal { get name() { return this._name } }`. If a Proxy wraps an `Animal` instance and you return `target.name` (not `Reflect.get(target, "name", receiver)`), `this` inside the getter is `target`, not the proxy — losing reactivity tracking. `Reflect` is the correctness fix.',
      ],
      active: [
        { startLine: 5,  endLine: 6,  color: 'violet',  label: 'Reflect.get — forward read through default engine path' },
        { startLine: 10, endLine: 10, color: 'indigo',  label: 'Reflect.set — forward write (handles receivers correctly)' },
        { startLine: 21, endLine: 24, color: 'emerald', label: 'Alice, "writing: age = 31", true, 31' },
      ],
      connections: [{ fromLine: 6, toLine: 5, color: 'violet', label: 'Reflect matches trap signature exactly — 1:1' }],
    },
    {
      title: 'apply trap — intercept function calls',
      code:
`const target = { name: 'Alice', age: 30 }

function greet(greeting) {
  return greeting + ', ' + this.name + '!'
}

const handler = {
  apply(targetFn, thisArg, args) {
    console.log('calling: ' + targetFn.name)
    console.log('args: ' + args.join(', '))
    const result = Reflect.apply(targetFn, thisArg, args)
    console.log('result: ' + result)
    return result
  }
}

const greetProxy = new Proxy(greet, handler)

greetProxy.call(target, 'Hello')
greetProxy.call(target, 'Hi')`,
      runCode:
`var target = { name: 'Alice', age: 30 }
function greet(greeting, name) {
  return greeting + ', ' + name + '!'
}
var applyHandler = {
  apply: function(targetFn, thisArg, args) {
    console.log('calling: ' + targetFn.name)
    console.log('args: ' + args.join(', '))
    var result = targetFn(args[0], thisArg.name)
    console.log('result: ' + result)
    return result
  }
}
function callProxy(fn, handler, thisArg, args) {
  return handler.apply(fn, thisArg, args)
}
callProxy(greet, applyHandler, target, ['Hello'])
callProxy(greet, applyHandler, target, ['Hi'])`,
      explanation: [
        '`apply` trap intercepts function calls. When `greetProxy.call(target, \'Hello\')` is called, the trap fires with `targetFn` = `greet`, `thisArg` = `target`, `args` = `[\'Hello\']`. It logs the function name and args, calls `Reflect.apply(targetFn, thisArg, args)` to execute the real function (returns `\'Hello, Alice!\'`), then logs the result. Second call with `\'Hi\'` runs identically. The trap intercepts both calls symmetrically.',
        'CS — The `apply` trap makes function calls interception-first. Unlike wrapping a function (`function wrapped(...args) { ... }`), a Proxy with `apply` intercepts `fn()`, `fn.call()`, `fn.apply()`, and `Reflect.apply()` uniformly. The trap receives the original function as `targetFn` — it can inspect `targetFn.name`, `targetFn.length` (arity), and call it via `Reflect.apply` with any `this` and args.',
        'SE — The `apply` trap powers: function memoization proxies (intercept calls, cache results), automatic logging/tracing (log every function invocation), argument validation (check arg types before calling), performance measurement (record call duration), and mock functions in testing. `jest.spyOn(obj, \'method\')` uses `apply` traps internally to record every call. Apollo GraphQL\'s field resolvers use apply-like interception.',
        'Without this: without the `apply` trap, you wrap functions: `const wrappedGreet = (...args) => { log(); return greet(...args) }`. This works for direct calls but breaks identity checks (`wrappedGreet !== greet`), `.name` is `\'wrappedGreet\'` not `\'greet\'`, and `.length` reflects the wrapper, not the original. A Proxy with `apply` is transparent — `greetProxy.name` is `\'greet\'`, `greetProxy.length` is `greet.length`.',
      ],
      active: [
        { startLine: 8,  endLine: 14, color: 'violet',  label: 'apply trap — fires on every function invocation' },
        { startLine: 18, endLine: 20, color: 'emerald', label: 'two calls logged: name, args, result each time' },
      ],
      connections: [{ fromLine: 11, toLine: 3, color: 'violet', label: 'Reflect.apply delegates to the real greet function' }],
    },
    {
      title: 'Proxy.revocable() — a killswitch for access',
      code:
`const target = { name: 'Alice', age: 30 }

function greet(greeting) {
  return greeting + ', ' + this.name + '!'
}

const handler = {
  get(target, key) {
    console.log('reading: ' + key)
    return Reflect.get(target, key)
  }
}

const { proxy, revoke } = Proxy.revocable(target, handler)

console.log(proxy.name)
console.log(proxy.age)

revoke()

try {
  console.log(proxy.name)
} catch (e) {
  console.log(e.message)
}`,
      runCode:
`var target = { name: 'Alice', age: 30 }
var handler = {
  get: function(target, key) {
    console.log('reading: ' + key)
    return target[key]
  }
}
var _revoked = false
var proxy = {
  get: function(key) {
    if (_revoked) throw { message: 'Cannot perform "get" on a proxy that has been revoked' }
    return handler.get(target, key)
  }
}
function revoke() { _revoked = true }

console.log(proxy.get('name'))
console.log(proxy.get('age'))
revoke()
try {
  proxy.get('name')
} catch(e) {
  console.log(e.message)
}`,
      explanation: [
        '`Proxy.revocable(target, handler)` returns `{ proxy, revoke }`. Before `revoke()`: `proxy.name` → trap fires → logs `\'reading: name\'` → returns `\'Alice\'`. `proxy.age` → logs `\'reading: age\'` → returns `30`. After `revoke()` is called, the proxy is permanently disabled. `proxy.name` → throws `TypeError: Cannot perform "get" on a proxy that has been revoked`. The error message is printed. Any further operation on the proxy throws.',
        'CS — `Proxy.revocable()` is a capability token: the `proxy` object is the capability (grants access to the target), and `revoke()` is the revocation function. Once revoked, the capability is gone — no further operations on the proxy succeed. This is the "capability-based security" pattern: grant a proxy to a subsystem, revoke it when done, without touching the underlying target object.',
        'SE — `Proxy.revocable()` is used for: sandboxed code execution (grant a module access to limited APIs via proxy, revoke when done), time-limited access tokens (revoke after N minutes), memory management (revoke reference to allow GC of target without nulling every external reference), and test isolation (grant test code a proxy to a service, revoke after the test to prevent cross-test state leakage).',
        'Without this: without revocable proxies, "cutting off access" to an object requires: either setting the reference to `null` everywhere (can\'t control external references you don\'t own), or wrapping every method in an "alive?" check (`if (!this.alive) throw`). Revocable proxies give the GRANTOR — not the grantee — the killswitch, without requiring cooperation from the code that holds the proxy reference.',
      ],
      active: [
        { startLine: 14, endLine: 14, color: 'violet',  label: 'Proxy.revocable — proxy + revoke function pair' },
        { startLine: 16, endLine: 17, color: 'emerald', label: 'reads work: Alice, 30' },
        { startLine: 19, endLine: 24, color: 'indigo',  label: 'after revoke() — any access throws TypeError' },
      ],
      connections: [{ fromLine: 19, toLine: 22, color: 'violet', label: 'revoke() → proxy permanently disabled' }],
    },
  ],
}
