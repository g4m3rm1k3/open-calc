import type { PracticeChallenge } from './loader'

export const title = 'Exceptions'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: "Write `parseNumber(str)` that returns `Number(str)`, throwing `new Error('Invalid number: ' + str)` if the result is `NaN`.",
        starter: '',
        tests: `
assert parseNumber('42') === 42
let caught = null
try { parseNumber('abc') } catch (e) { caught = e.message }
assert caught === 'Invalid number: abc'
`,
        solution: "function parseNumber(str) { const n = Number(str); if (Number.isNaN(n)) { throw new Error('Invalid number: ' + str); } return n; }",
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Finish `safeParse(str)` so it catches any exception from `JSON.parse(str)` and returns `null` on failure, or the parsed value on success.',
        starter: 'function safeParse(str) {\n  // TODO: catch JSON.parse errors and return null on failure\n}',
        tests: `
assert JSON.stringify(safeParse('{"a":1}')) === JSON.stringify({a:1})
assert safeParse('not json') === null
`,
        solution: 'function safeParse(str) { try { return JSON.parse(str); } catch (e) { return null; } }',
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript',
        prompt: "Write `loadConfig(raw)` that parses `raw` as JSON, and if that fails, catches the low-level error and throws a NEW error with message `'Invalid config: ' + <original message>`.",
        starter: '',
        tests: `
assert JSON.stringify(loadConfig('{"x":1}')) === JSON.stringify({x:1})
let caught = null
try { loadConfig('{bad') } catch (e) { caught = e.message }
assert caught.startsWith('Invalid config:')
`,
        solution: "function loadConfig(raw) { try { return JSON.parse(raw); } catch (e) { throw new Error('Invalid config: ' + e.message); } }",
      },
    ],
  },
]

export default challenges
