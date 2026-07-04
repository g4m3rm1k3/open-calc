export default   {
    id: 'singleton',
    title: 'Singleton',
    tag: 'Design Pattern',
    steps: [
      {
        title: 'Config class',
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
          '`Config` on line 1 stores application settings. The constructor on line 2 runs every time `new Config()` is called, creating a fresh `settings` object with default values. Right now, nothing prevents multiple instances from being created — each call to `new Config()` would produce an independent copy of `settings`.',
          'CS — The Singleton pattern solves the multiple-instance problem: ensure that a class has at most one instance in memory, and that all code that needs it receives the same reference. Without this guarantee, distributed state (config, connection pools, registries) fragments into independent copies that diverge when one is mutated.',
          'SE — Classic Singleton use cases: a database connection pool (expensive to create, must be shared), a logger (all modules should write to the same output stream), an app-wide config store (settings should be consistent everywhere). Node.js module caching provides Singleton semantics automatically for module-level exports — every `require(\'./config\')` returns the same cached object.',
          'Without this: without the Singleton pattern, `const a = new Config(); const b = new Config()` creates two independent objects. `a.settings.theme = \'light\'` would not change `b.settings.theme`. Any module that gets a different instance would see stale or different settings — a classic source of subtle bugs in multi-module apps.',
        ],
        active: [{ startLine: 1, endLine: 8, color: 'indigo', label: 'Config — needs exactly one instance' }],
        connections: [],
      },
      {
        title: 'The guard variable',
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
          '`_instance` on line 10 starts as `null`. `getConfig()` on line 12 checks `!_instance` before creating anything. First call: `_instance` is `null`, so `!_instance` is `true` — line 14 runs `new Config()` and stores the result in `_instance`. Every subsequent call: `_instance` is not `null`, so the `if` block is skipped entirely and the existing instance is returned on line 16.',
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
          'Line 19 calls `getConfig()`. Execution enters at line 12. `!_instance` is `true` — `_instance` is still `null`. Line 14 runs `new Config()`: the constructor fires at line 2, creates `settings = { theme: \'dark\', language: \'en\' }`, and the new instance is stored in `_instance`. Line 16 returns it. `a` now holds the one and only `Config` instance. Line 20 prints `\'dark\'` to confirm.',
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
          { fromLine: 19, toLine: 12, color: 'emerald', label: 'enters' },
          { fromLine: 14, toLine: 2,  color: 'indigo',  label: 'new Config()' },
        ],
      },
      {
        title: 'Second call — guard blocks',
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
          'Line 22 calls `getConfig()` a second time. Execution enters at line 12. `_instance` is no longer `null` — it holds the `Config` from the first call. `!_instance` is `false`. Line 14 is skipped. Line 16 returns the existing `_instance` directly. `b` now holds the same reference that `a` holds. The constructor never runs again.',
          'CS — The guard effectively makes `new Config()` callable only once for the lifetime of the program. Every subsequent call is reduced to a single property lookup (`_instance`) and a return. This is `O(1)` per call regardless of how expensive construction is. The lazy initialisation cost is paid exactly once.',
          'SE — In production, you might call `getConfig()` from 30 different modules. Each call returns the same reference in `O(1)`. The pattern also makes testing easier — you can reset `_instance = null` before each test to force fresh construction without modifying the `Config` class itself. This is why the guard is a module-level `let`, not a class static.',
          'Without this: if `getConfig()` created a new instance on every call, the second call would return an independent `Config` with its own `settings` object. `a.settings.theme` and `b.settings.theme` would be separate values. Any mutation to `a.settings` would be invisible to `b`. This is the problem Singleton solves — the next step proves it.',
        ],
        active: [
          { startLine: 22, endLine: 22, color: 'emerald', label: 'second call' },
          { startLine: 13, endLine: 13, color: 'violet',  label: 'guard blocks — _instance exists' },
          { startLine: 16, endLine: 16, color: 'violet',  label: 'returns existing instance' },
        ],
        connections: [{ fromLine: 22, toLine: 12, color: 'emerald', label: 'enters' }],
      },
      {
        title: 'Same object — mutation proves it',
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
          'Line 25 mutates `a.settings.theme` to `\'light\'`. Line 27 reads `b.settings.theme` and gets `\'light\'` — not `\'dark\'`. `a` and `b` are the same object in memory. Mutating through one reference is immediately visible through the other. Line 28 confirms: `a === b` is `true`. The Singleton held — one object, two variable names.',
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
