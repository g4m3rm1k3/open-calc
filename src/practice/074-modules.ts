import type { PracticeChallenge } from './loader'

export const title = 'Modules / Import-Export'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `defineMathModule()` returning an object with named exports `add(a, b)` and `multiply(a, b)`, plus a `default` key holding a `square(x)` function — modeling how a module exposes both named and default exports.',
        starter: '',
        tests: `
const mod = defineMathModule()
assert mod.add(2, 3) === 5
assert mod.multiply(2, 3) === 6
assert mod.default(4) === 16
`,
        solution: `function defineMathModule() {
  function add(a, b) { return a + b }
  function multiply(a, b) { return a * b }
  function square(x) { return x * x }
  return { add, multiply, default: square }
}`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Finish `createModuleSystem()` returning `{ define(name, factory), require(name) }`. `require` must call `factory` only on its FIRST call for a given name, caching the result for every later `require` of that same name — a module\'s top-level code runs exactly once, no matter how many times it\'s imported.',
        starter: 'function createModuleSystem() {\n  // TODO: return { define(name, factory), require(name) } — require() must call\n  // factory only on the FIRST call for a given name, caching the result for every\n  // later require() of the same name (single evaluation)\n  return {\n    define(name, factory) {},\n    require(name) { return {} },\n  }\n}',
        tests: `
const sys = createModuleSystem()
let calls = 0
assert (sys.define('math', () => { calls++; return { add: (a,b) => a + b } }), true)
const m1 = sys.require('math')
const m2 = sys.require('math')
assert m1 === m2
assert calls === 1
assert m1.add(2,3) === 5
`,
        solution: `function createModuleSystem() {
  const cache = new Map()
  const factories = new Map()
  return {
    define(name, factory) { factories.set(name, factory) },
    require(name) {
      if (cache.has(name)) return cache.get(name)
      const exportsObj = factories.get(name)()
      cache.set(name, exportsObj)
      return exportsObj
    },
  }
}`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `resolveLoadOrder(deps)`, where `deps` maps each module name to an array of names it depends on. Return an array giving a valid load order (every dependency before its dependent), or `null` if `deps` contains a circular dependency.',
        starter: '',
        tests: `
assert JSON.stringify(resolveLoadOrder({ a: ['b'], b: ['c'], c: [] })) === JSON.stringify(['c','b','a'])
assert resolveLoadOrder({ a: ['b'], b: ['a'] }) === null
`,
        solution: `function resolveLoadOrder(deps) {
  const order = []
  const state = new Map()
  function visit(name) {
    if (state.get(name) === 'done') return true
    if (state.get(name) === 'visiting') return false
    state.set(name, 'visiting')
    for (const dep of deps[name] || []) {
      if (!visit(dep)) return false
    }
    state.set(name, 'done')
    order.push(name)
    return true
  }
  for (const name of Object.keys(deps)) {
    if (!visit(name)) return null
  }
  return order
}`,
      },
    ],
  },
]

export default challenges
