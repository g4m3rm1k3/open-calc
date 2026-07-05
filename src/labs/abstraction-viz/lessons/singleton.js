export default {
  id: 'singleton',
  title: 'Singleton',
  tag: 'Design Pattern',
  steps: [
    {
      title: 'Config class',
      semanticEvent: 'DefineClass',
      code:
`class Config {
  constructor() {
    this.settings = {
      theme: 'dark',
      language: 'en',
    }
  }
}`,
      explanation: [
        '`Config` defines the **blueprint for application settings** — but right now nothing prevents multiple independent instances from being created. Each call to `new Config()` would produce its own fresh `settings` object. The problem this class sets up: shared state that should be consistent everywhere but isn\'t yet guaranteed to be a single instance.',
        'CS — The Singleton pattern solves the multiple-instance problem: ensure that a class has at most one instance in memory, and that all code that needs it receives the same reference. Without this guarantee, distributed state (config, connection pools, registries) fragments into independent copies that diverge when one is mutated.',
        'SE — Classic Singleton use cases: a database connection pool (expensive to create, must be shared), a logger (all modules should write to the same output stream), an app-wide config store (settings should be consistent everywhere). Node.js module caching provides Singleton semantics automatically for module-level exports — every `require(\'./config\')` returns the same cached object.',
        'Without this: without the Singleton pattern, `const a = new Config(); const b = new Config()` creates two independent objects. `a.settings.theme = \'light\'` would not change `b.settings.theme`. Any module that gets a different instance would see stale or different settings — a classic source of subtle bugs in multi-module apps.',
      ],
      active: [{ startLine: 1, endLine: 8, color: 'indigo', label: 'Config — needs exactly one instance' }],
      connections: [],
    },
    {
      title: 'The guard variable',
      semanticEvent: 'CreateVariable',
      code:
`class Config {
  constructor() {
    this.settings = {
      theme: 'dark',
      language: 'en',
    }
  }
}

let _instance = null

function getConfig() {
  if (!_instance) {
    _instance = new Config()
  }
  return _instance
}`,
      explanation: [
        '`_instance = null` establishes the **guard variable** — the memory slot that will hold the one allowed instance once created. `getConfig()` checks this slot before constructing: on the first call `_instance` is `null` so construction happens; on every subsequent call `_instance` already holds the instance so it is returned directly. The guard is the only thing that makes this a Singleton.',
        'CS — The guard variable is the core of the Singleton pattern. `_instance` is a module-level (or closure-level) variable that acts as a cache for the one allowed instance. The `if (!_instance)` check is a lazy initialisation: the instance is not created until it is first needed. This is distinct from eager initialisation, where the instance is created at module load time.',
        'SE — In JavaScript, module-scope variables achieve the same effect without a guard: `const config = new Config()` at the top of a module creates one instance when the module is first imported. Node.js caches the module, so every `import` or `require` of that module gets the same `config`. The `_instance` guard pattern is necessary when you need deferred creation or more control over timing.',
        'Without this: if `getConfig` simply returned `new Config()` every time, callers would each receive a different instance. Module A\'s config and Module B\'s config would be independent objects. Mutating one would never propagate to the other. The guard is the single line of code that enforces global uniqueness.',
      ],
      active: [
        { startLine: 10, endLine: 10, color: 'emerald', label: '_instance — the guard' },
        { startLine: 12, endLine: 16, color: 'violet',  label: 'getConfig — check before creating' },
      ],
      connections: [],
    },
    {
      title: 'First call — guard passes',
      semanticEvent: 'CreateObject',
      code:
`class Config {
  constructor() {
    this.settings = {
      theme: 'dark',
      language: 'en',
    }
  }
}

let _instance = null

function getConfig() {
  if (!_instance) {
    _instance = new Config()
  }
  return _instance
}

const a = getConfig()
console.log(a.settings.theme)`,
      explanation: [
        'The first call to `getConfig()` **constructs and stores the singleton**: `_instance` is `null` so the guard passes, `new Config()` runs once, and the result is stored in `_instance`. From this point forward `_instance` is not null — the guard will never pass again. `a` holds the one permitted instance and `a.settings.theme` confirms it is `\'dark\'`.',
        'CS — This is lazy initialisation: the object is created on first access, not at program start. The cost of constructing `Config` is paid only when it is first needed. If `getConfig()` is never called, the object is never created. This matters for expensive initialisations — database connections, file reads — that should be deferred until necessary.',
        'SE — The guard check `if (!_instance)` is not thread-safe in languages with true shared memory (Java, C++). In those languages, two threads can simultaneously pass the guard, both see `_instance === null`, and both create an instance — the Double-Checked Locking pattern addresses this. In JavaScript\'s single-threaded model, this is not an issue — concurrent access is not possible.',
        'Without this: if the constructor threw an error on first call (say, reading a missing config file), `_instance` would remain `null` and every subsequent `getConfig()` would re-attempt construction and throw again. A robust guard also handles the error case: check `_instance`, attempt creation, only store to `_instance` if creation succeeds.',
      ],
      active: [
        { startLine: 19, endLine: 20, color: 'emerald', label: 'first call — instance created' },
        { startLine: 13, endLine: 14, color: 'violet',  label: 'guard passes — creates Config' },
        { startLine: 2,  endLine: 7,  color: 'indigo',  label: 'constructor runs' },
      ],
      connections: [
        { fromLine: 19, toLine: 12, color: 'emerald', label: 'enters', type: 'calls' },
        { fromLine: 14, toLine: 2,  color: 'indigo',  label: 'new Config()', type: 'creates' },
      ],
    },
    {
      title: 'Second call — guard blocks',
      semanticEvent: 'TakeBranch',
      code:
`class Config {
  constructor() {
    this.settings = {
      theme: 'dark',
      language: 'en',
    }
  }
}

let _instance = null

function getConfig() {
  if (!_instance) {
    _instance = new Config()
  }
  return _instance
}

const a = getConfig()
console.log(a.settings.theme)

const b = getConfig()`,
      explanation: [
        'The second call to `getConfig()` **takes the else branch**: `_instance` is no longer null so `!_instance` is false — the construction block is skipped entirely. `_instance` is returned directly. `b` receives the same object reference as `a`. The constructor runs exactly once across the entire lifetime of the program — that is the Singleton guarantee.',
        'CS — The guard effectively makes `new Config()` callable only once for the lifetime of the program. Every subsequent call is reduced to a single property lookup (`_instance`) and a return. This is `O(1)` per call regardless of how expensive construction is. The lazy initialisation cost is paid exactly once.',
        'SE — In production, you might call `getConfig()` from 30 different modules. Each call returns the same reference in `O(1)`. The pattern also makes testing easier — you can reset `_instance = null` before each test to force fresh construction without modifying the `Config` class itself. This is why the guard is a module-level `let`, not a class static.',
        'Without this: if `getConfig()` created a new instance on every call, the second call would return an independent `Config` with its own `settings` object. `a.settings.theme` and `b.settings.theme` would be separate values. Any mutation to `a.settings` would be invisible to `b`. This is the problem Singleton solves — the next step proves it.',
      ],
      active: [
        { startLine: 22, endLine: 22, color: 'emerald', label: 'second call' },
        { startLine: 13, endLine: 13, color: 'violet',  label: 'guard blocks — _instance exists' },
        { startLine: 16, endLine: 16, color: 'violet',  label: 'returns existing instance' },
      ],
      connections: [{ fromLine: 22, toLine: 12, color: 'emerald', label: 'enters', type: 'calls' }],
    },
    {
      title: 'Same object — mutation proves it',
      semanticEvent: 'WriteProperty',
      code:
`class Config {
  constructor() {
    this.settings = {
      theme: 'dark',
      language: 'en',
    }
  }
}

let _instance = null

function getConfig() {
  if (!_instance) {
    _instance = new Config()
  }
  return _instance
}

const a = getConfig()
console.log(a.settings.theme)

const b = getConfig()

a.settings.theme = 'light'

console.log(b.settings.theme)
console.log(a === b)`,
      explanation: [
        'Mutating `a.settings.theme` **immediately affects `b.settings.theme`** — because they are the same object in memory. `b.settings.theme` returns `\'light\'` without being set directly. `a === b` is `true`. This mutation test is the definitive proof of the Singleton guarantee: one change through one reference is visible everywhere.',
        'CS — Reference equality (`===`) compares memory addresses, not values. `a === b` being `true` proves `a` and `b` point to the same heap location. This is distinct from value equality — two separate `Config` objects with identical `settings` would be `===` false even though they look the same. The mutation test is the definitive proof: if changing `a` changes `b`, they are the same object.',
        'SE — This is why global config objects are typically singletons in production apps. Every module that calls `getConfig()` reads the same object. When the app loads a new config file and updates the singleton, every module sees the update immediately — no refresh, no re-import. React\'s Context and Redux\'s store both follow this model: one store, all components read from it.',
        'Without this: if the singleton guard were missing, `a` and `b` would be independent objects. `a.settings.theme = \'light\'` would only change `a`. `b.settings.theme` would still be `\'dark\'`. The module responsible for UI theming would see `\'light\'`, the module responsible for saving preferences might see `\'dark\'`. The split-brain state would produce a class of bugs that are extremely hard to reproduce.',
      ],
      active: [
        { startLine: 25, endLine: 25, color: 'pink',    label: 'mutate via a' },
        { startLine: 27, endLine: 28, color: 'emerald', label: 'b sees same change — same object' },
      ],
      connections: [],
    },
  ],
}
