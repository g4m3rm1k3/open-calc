import type { PracticeChallenge } from './loader'

export const title = 'Strategy Pattern: Interchangeable Classes'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `AddStrategy` and `MulStrategy` classes, each with `execute(a, b)`, plus `runStrategy(strategy, a, b)` that calls `strategy.execute(a, b)`.',
        starter: '',
        tests: `
assert runStrategy(new AddStrategy(), 2, 3) === 5
assert runStrategy(new MulStrategy(), 2, 3) === 6
`,
        solution: `class AddStrategy { execute(a, b) { return a + b; } }
class MulStrategy { execute(a, b) { return a * b; } }
function runStrategy(strategy, a, b) { return strategy.execute(a, b); }`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Finish `class Calculator` so it holds a strategy object, can `setStrategy(strategy)` to swap it at runtime, and `calculate(a, b)` delegates to the CURRENT strategy.',
        starter: 'class Calculator {\n  // TODO: constructor(strategy), setStrategy(strategy), calculate(a,b) delegating to strategy.execute\n}\nclass AddStrategy { execute(a, b) { return a + b; } }\nclass MulStrategy { execute(a, b) { return a * b; } }',
        tests: `
const calc = new Calculator(new AddStrategy())
assert calc.calculate(2, 3) === 5
assert (calc.setStrategy(new MulStrategy()), true)
assert calc.calculate(2, 3) === 6
`,
        solution: `class Calculator {
  constructor(strategy) { this.strategy = strategy; }
  setStrategy(strategy) { this.strategy = strategy; }
  calculate(a, b) { return this.strategy.execute(a, b); }
}
class AddStrategy { execute(a, b) { return a + b; } }
class MulStrategy { execute(a, b) { return a * b; } }`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `CheapShipping`/`FastShipping` strategy classes (each with `execute(weight)`), plus `selectStrategy(urgent)` picking the right one, and `shippingCost(weight, urgent)` using it.',
        starter: '',
        tests: `
assert shippingCost(10, false) === 5
assert shippingCost(10, true) === 30
`,
        solution: `class CheapShipping { execute(weight) { return weight * 0.5; } }
class FastShipping { execute(weight) { return weight * 2 + 10; } }
function selectStrategy(urgent) { return urgent ? new FastShipping() : new CheapShipping(); }
function shippingCost(weight, urgent) { return selectStrategy(urgent).execute(weight); }`,
      },
    ],
  },
]

export default challenges
