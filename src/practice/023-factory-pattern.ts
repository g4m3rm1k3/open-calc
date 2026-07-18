import type { PracticeChallenge } from './loader'

export const title = 'Factory Pattern'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: "Write a function `createShape(type)` returning `{ describe() }` — `'circle'` describes itself as `'I am a circle'`, `'square'` as `'I am a square'`, anything else returns `null`.",
        starter: '',
        tests: `
assert createShape('circle').describe() === 'I am a circle'
assert createShape('square').describe() === 'I am a square'
assert createShape('triangle') === null
`,
        solution: "function createShape(type) { if (type === 'circle') return { describe: () => 'I am a circle' }; if (type === 'square') return { describe: () => 'I am a square' }; return null; }",
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript',
        prompt: "Finish `createUser(role)` so it returns `{ role, permissions }` — `'admin'` gets `['read','write','delete']`, everyone else gets `['read']`.",
        starter: "function createUser(role) {\n  // TODO: return { role, permissions } -- admin gets ['read','write','delete'], others get ['read']\n}",
        tests: `
assert JSON.stringify(createUser('admin').permissions) === JSON.stringify(['read','write','delete'])
assert JSON.stringify(createUser('guest').permissions) === JSON.stringify(['read'])
`,
        solution: "function createUser(role) { const permissions = role === 'admin' ? ['read','write','delete'] : ['read']; return { role, permissions }; }",
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript',
        prompt: "Write `createVehicle(type)` that returns a `new Car()` for `'car'`, a `new Truck()` for `'truck'`, and `null` otherwise.",
        starter: '',
        tests: `
assert createVehicle('car') instanceof Car
assert createVehicle('truck') instanceof Truck
assert createVehicle('car').describe() === 'car'
`,
        solution: "class Car { describe() { return 'car'; } }\nclass Truck { describe() { return 'truck'; } }\nfunction createVehicle(type) { if (type === 'car') return new Car(); if (type === 'truck') return new Truck(); return null; }",
      },
    ],
  },
]

export default challenges
