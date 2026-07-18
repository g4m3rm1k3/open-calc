import type { PracticeChallenge } from './loader'

export const title = 'Strategy Pattern: First-Class Functions'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `runStrategyFn(strategyFn, a, b)` that calls `strategyFn(a, b)` — the "strategy" is just a plain function, no class needed.',
        starter: '',
        tests: `
assert runStrategyFn((a,b) => a + b, 2, 3) === 5
assert runStrategyFn((a,b) => a * b, 2, 3) === 6
`,
        solution: 'function runStrategyFn(strategyFn, a, b) { return strategyFn(a, b); }',
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Finish `makeCalculator(strategyFn)` so it returns `{ calculate(a, b) }`, delegating to the injected `strategyFn`.',
        starter: 'function makeCalculator(strategyFn) {\n  // TODO: return { calculate(a,b) } delegating to strategyFn\n}',
        tests: `
const calc = makeCalculator((a,b) => a - b)
assert calc.calculate(5, 3) === 2
`,
        solution: `function makeCalculator(strategyFn) {
  return { calculate: (a, b) => strategyFn(a, b) }
}`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write a `strategies` object mapping names (`add`, `mul`, `sub`) to functions, and `runNamed(name, a, b)` looking up and calling the right one.',
        starter: '',
        tests: `
assert runNamed('add', 2, 3) === 5
assert runNamed('mul', 2, 3) === 6
assert runNamed('sub', 5, 2) === 3
`,
        solution: `const strategies = {
  add: (a, b) => a + b,
  mul: (a, b) => a * b,
  sub: (a, b) => a - b,
}
function runNamed(name, a, b) { return strategies[name](a, b); }`,
      },
    ],
  },
]

export default challenges
