import type { PracticeChallenge } from './loader'

export const title = 'String Slicing'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `firstN(s, n)` returning `s.slice(0, n)` (the first `n` characters) and `lastN(s, n)` returning `s.slice(-n)` (the last `n` characters — the "from the end" syntax). Confirm the original string is never mutated by calling `firstN` on it and checking it\'s unchanged afterward.',
        starter: '',
        tests: `
assert firstN('Hello', 3) === 'Hel'
assert lastN('Hello', 3) === 'llo'
const original = 'Hello'
firstN(original, 3)
assert original === 'Hello'
`,
        solution: `function firstN(s, n) {
  return s.slice(0, n)
}
function lastN(s, n) {
  return s.slice(-n)
}`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Fix `firstN`: it hand-rolls the same logic with a character-by-character loop, but `for (let i = 0; i <= n; i++)` has an off-by-one error — using `<=` instead of `<` means it copies ONE EXTRA character (`firstN(\'Hello\', 3)` wrongly returns `\'Hell\'`, 4 characters, not 3). Delete the loop entirely and use `s.slice(0, n)` instead — reaching for the built-in slice removes this whole category of off-by-one bug.',
        starter: `function firstN(s, n) {
  let result = ''
  for (let i = 0; i <= n; i++) {
    result += s[i]
  }
  return result
}`,
        tests: `
assert firstN('Hello', 3) === 'Hel'
`,
        solution: `function firstN(s, n) {
  return s.slice(0, n)
}`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `middleSlice(s, start, end)` returning `s.slice(start, end)` — a range from the MIDDLE of the string, not just from an edge. Call it TWICE on the same `original` string with different ranges (`(6, 11)` and `(0, 5)` on `\'Hello World\'`), then confirm `original` itself is still completely unchanged after both calls — slicing always returns a new string, never a view into (or mutation of) the source.',
        starter: '',
        tests: `
const original = 'Hello World'
const mid1 = middleSlice(original, 6, 11)
const mid2 = middleSlice(original, 0, 5)
assert mid1 === 'World'
assert mid2 === 'Hello'
assert original === 'Hello World'
`,
        solution: `function middleSlice(s, start, end) {
  return s.slice(start, end)
}`,
      },
    ],
  },
]

export default challenges
