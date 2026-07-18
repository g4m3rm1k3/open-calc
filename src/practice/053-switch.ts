import type { PracticeChallenge } from './loader'

export const title = 'switch'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: "Write `dayName(n)` using `switch` to map `1`→`'Mon'`, `2`→`'Tue'`, `3`→`'Wed'`, and anything else to `'Unknown'`.",
        starter: '',
        tests: `
assert dayName(1) === 'Mon'
assert dayName(3) === 'Wed'
assert dayName(9) === 'Unknown'
`,
        solution: "function dayName(n) { switch (n) { case 1: return 'Mon'; case 2: return 'Tue'; case 3: return 'Wed'; default: return 'Unknown'; } }",
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript',
        prompt: "Finish `sizeCategory(n)` using `switch (true)` with cases `n < 10` → `'small'`, `n < 100` → `'medium'`, else `'large'`.",
        starter: "function sizeCategory(n) {\n  // TODO: switch(true) with n<10 'small', n<100 'medium', else 'large'\n}",
        tests: `
assert sizeCategory(5) === 'small'
assert sizeCategory(50) === 'medium'
assert sizeCategory(500) === 'large'
`,
        solution: "function sizeCategory(n) { switch (true) { case n < 10: return 'small'; case n < 100: return 'medium'; default: return 'large'; } }",
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript',
        prompt: "Write `httpStatusCategory(code)` using `switch` on `Math.floor(code / 100)`, grouping `4` and `5` together as `'error'` via fallthrough, `2` as `'success'`, and anything else `'other'`.",
        starter: '',
        tests: `
assert httpStatusCategory(200) === 'success'
assert httpStatusCategory(404) === 'error'
assert httpStatusCategory(500) === 'error'
assert httpStatusCategory(301) === 'other'
`,
        solution: "function httpStatusCategory(code) { switch (Math.floor(code / 100)) { case 2: return 'success'; case 4: case 5: return 'error'; default: return 'other'; } }",
      },
    ],
  },
]

export default challenges
