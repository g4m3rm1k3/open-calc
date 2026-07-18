import type { PracticeChallenge } from './loader'

export const title = 'Builder Pattern'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `makePizzaBuilder()` returning `{ setSize(s), addTopping(t), build() }`. `setSize`/`addTopping` must chain (each returns the builder itself); `build()` returns `{ size, toppings }`.',
        starter: '',
        tests: `
const pizza = makePizzaBuilder().setSize('large').addTopping('mushroom').addTopping('olive').build()
assert pizza.size === 'large'
assert JSON.stringify(pizza.toppings) === JSON.stringify(['mushroom','olive'])
`,
        solution: `function makePizzaBuilder() {
  let size = 'medium'
  const toppings = []
  return {
    setSize(s) { size = s; return this },
    addTopping(t) { toppings.push(t); return this },
    build() { return { size, toppings: [...toppings] } },
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
        prompt: 'Fix `makePizzaBuilder()` so `setSize` and `addTopping` each return the builder itself (`this`) — without that, chained calls fail since the next method is called on `undefined`. Default size (when never set) must stay `\'medium\'`, and each call to `makePizzaBuilder()` must produce an independent builder.',
        starter: 'function makePizzaBuilder() {\n  // TODO: setSize and addTopping must each return "this" so calls can be chained\n  let size = \'medium\'\n  const toppings = []\n  return {\n    setSize(s) { size = s },\n    addTopping(t) { toppings.push(t) },\n    build() { return { size, toppings: [...toppings] } },\n  }\n}',
        tests: `
let pizza
assert (pizza = makePizzaBuilder().setSize('large').addTopping('mushroom').addTopping('olive').build(), true)
assert pizza.size === 'large'
assert JSON.stringify(pizza.toppings) === JSON.stringify(['mushroom','olive'])
const untouched = makePizzaBuilder().build()
assert untouched.size === 'medium'
assert JSON.stringify(untouched.toppings) === JSON.stringify([])
`,
        solution: `function makePizzaBuilder() {
  let size = 'medium'
  const toppings = []
  return {
    setSize(s) { size = s; return this },
    addTopping(t) { toppings.push(t); return this },
    build() { return { size, toppings: [...toppings] } },
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
        prompt: 'Write `makeImmutableQueryBuilder(params = {})` returning `{ set(key, value), build() }`, where `build()` returns a query string like `"a=1&b=2"`. Unlike a normal chained builder, `set` must return a BRAND NEW builder holding the merged params, leaving the original builder\'s own `build()` output unchanged.',
        starter: '',
        tests: `
const qb1 = makeImmutableQueryBuilder()
const qb2 = qb1.set('a','1')
const qb3 = qb2.set('b','2')
assert qb1.build() === ''
assert qb2.build() === 'a=1'
assert qb3.build() === 'a=1&b=2'
`,
        solution: `function makeImmutableQueryBuilder(params = {}) {
  return {
    set(key, value) {
      return makeImmutableQueryBuilder({ ...params, [key]: value })
    },
    build() {
      return Object.entries(params).map(([k, v]) => \`\${k}=\${v}\`).join('&')
    },
  }
}`,
      },
    ],
  },
]

export default challenges
