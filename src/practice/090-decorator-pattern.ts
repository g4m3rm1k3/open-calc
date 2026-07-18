import type { PracticeChallenge } from './loader'

export const title = 'Decorator Pattern'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `makeMilkDecorator(coffee)` returning `{ cost(), description() }` that wraps `coffee`, adding `0.5` to `cost()` and `\' + Milk\'` to `description()`, calling through to `coffee` first.',
        starter: '',
        tests: `
const coffee = { cost: () => 2, description: () => 'Coffee' }
const withMilk = makeMilkDecorator(coffee)
assert withMilk.cost() === 2.5
assert withMilk.description() === 'Coffee + Milk'
`,
        solution: `function makeMilkDecorator(coffee) {
  return {
    cost() { return coffee.cost() + 0.5 },
    description() { return coffee.description() + ' + Milk' },
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
        prompt: 'Finish `makeSugarDecorator(coffee)`, matching `makeMilkDecorator`\'s shape: it must call through to `coffee` first, adding `0.25` to `cost()` and `\' + Sugar\'` to `description()` — and it must be stackable on top of an already-decorated coffee (like one already wrapped in milk).',
        starter: 'function makeMilkDecorator(coffee) {\n  return {\n    cost() { return coffee.cost() + 0.5 },\n    description() { return coffee.description() + \' + Milk\' },\n  }\n}\nfunction makeSugarDecorator(coffee) {\n  // TODO: return { cost(), description() } that wraps coffee, adding 0.25 to\n  // cost() and \' + Sugar\' to description(), calling through to coffee first\n  return coffee\n}',
        tests: `
const coffee = { cost: () => 2, description: () => 'Coffee' }
let order = makeMilkDecorator(coffee)
order = makeSugarDecorator(order)
assert order.cost() === 2.75
assert order.description() === 'Coffee + Milk + Sugar'
`,
        solution: `function makeMilkDecorator(coffee) {
  return {
    cost() { return coffee.cost() + 0.5 },
    description() { return coffee.description() + ' + Milk' },
  }
}
function makeSugarDecorator(coffee) {
  return {
    cost() { return coffee.cost() + 0.25 },
    description() { return coffee.description() + ' + Sugar' },
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
        prompt: 'Write `makeWhipDecorator(coffee)` (adds `0.1` / `\' + Whip\'`, same shape as milk/sugar) and `applyDecorators(base, decoratorFns)`, which applies each decorator function in `decoratorFns`, in order, wrapping `base` progressively. Confirm the FINAL cost is the same no matter what order the same three decorators are applied in.',
        starter: '',
        tests: `
const coffee = { cost: () => 2, description: () => 'Coffee' }
const order1 = applyDecorators(coffee, [makeMilkDecorator, makeSugarDecorator, makeWhipDecorator])
const order2 = applyDecorators(coffee, [makeWhipDecorator, makeMilkDecorator, makeSugarDecorator])
assert Math.abs(order1.cost() - order2.cost()) < 0.0001
assert Math.abs(order1.cost() - 2.85) < 0.0001
`,
        solution: `function makeMilkDecorator(coffee) {
  return {
    cost() { return coffee.cost() + 0.5 },
    description() { return coffee.description() + ' + Milk' },
  }
}
function makeSugarDecorator(coffee) {
  return {
    cost() { return coffee.cost() + 0.25 },
    description() { return coffee.description() + ' + Sugar' },
  }
}
function makeWhipDecorator(coffee) {
  return {
    cost() { return coffee.cost() + 0.1 },
    description() { return coffee.description() + ' + Whip' },
  }
}
function applyDecorators(base, decoratorFns) {
  return decoratorFns.reduce((order, decorate) => decorate(order), base)
}`,
      },
    ],
  },
]

export default challenges
