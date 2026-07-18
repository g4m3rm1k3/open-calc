import type { PracticeChallenge } from './loader'

export const title = 'Singleton Pattern'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `makeSingletonFactory(create)` returning a `getInstance()` function that calls `create()` to build the instance the FIRST time it\'s called, and returns that exact SAME object on every later call.',
        starter: '',
        tests: `
const getInstance = makeSingletonFactory(() => ({ settings: {} }))
const a = getInstance()
const b = getInstance()
assert a === b
`,
        solution: `function makeSingletonFactory(create) {
  let instance = null
  return function getInstance() {
    if (!instance) instance = create()
    return instance
  }
}`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Finish `makeConfigSingleton()` returning a `getConfig()` function. The FIRST call must create a `{ set(key, value), get(key) }` object; every later call must return that SAME object, so a value set through one reference is visible through another.',
        starter: 'function makeConfigSingleton() {\n  // TODO: return a getConfig() function that creates a { set(key,value), get(key) }\n  // object the FIRST time it\'s called, and returns that SAME object on every later call\n  return function getConfig() {\n    return { set() {}, get() {} }\n  }\n}',
        tests: `
const getConfig = makeConfigSingleton()
const a = getConfig()
const b = getConfig()
assert (a.set('theme', 'dark'), true)
assert a === b
assert b.get('theme') === 'dark'
`,
        solution: `function makeConfigSingleton() {
  let instance = null
  return function getConfig() {
    if (!instance) {
      const settings = {}
      instance = {
        set(key, value) { settings[key] = value },
        get(key) { return settings[key] },
      }
    }
    return instance
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
        prompt: 'Write `makeLazySingleton(factory)` returning a `getInstance()` function that does NOT call `factory` until the first time `getInstance()` is actually called (lazy initialization), and calls it AT MOST once no matter how many times `getInstance()` is called afterward.',
        starter: '',
        tests: `
let calls = 0
const getInstance = makeLazySingleton(() => { calls++; return { id: 1 } })
assert calls === 0
const a = getInstance()
assert calls === 1
const b = getInstance()
assert calls === 1
assert a === b
`,
        solution: `function makeLazySingleton(factory) {
  let instance = null
  let created = false
  return function getInstance() {
    if (!created) {
      instance = factory()
      created = true
    }
    return instance
  }
}`,
      },
    ],
  },
]

export default challenges
