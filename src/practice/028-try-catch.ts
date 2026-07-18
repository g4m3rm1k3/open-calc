import type { PracticeChallenge } from './loader'

export const title = 'try / catch'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `safeDivide(a, b)` that uses `try`/`catch` to return `null` if dividing by zero throws, otherwise the quotient.',
        starter: '',
        tests: `
assert safeDivide(10, 2) === 5
assert safeDivide(10, 0) === null
`,
        solution: 'function safeDivide(a, b) { try { if (b === 0) throw new Error("div by zero"); return a / b; } catch (e) { return null; } }',
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Finish `attemptAll(fns)` so it runs each zero-arg function in `fns`, catching any error, and returns an array of `{ ok: true, value }` or `{ ok: false, error }` for each.',
        starter: 'function attemptAll(fns) {\n  // TODO: run each fn, catching errors, return array of {ok, value} or {ok, error}\n}',
        tests: `
const results = attemptAll([() => 1, () => { throw new Error('bad'); }, () => 3])
assert results[0].ok === true && results[0].value === 1
assert results[1].ok === false && results[1].error === 'bad'
assert results[2].ok === true && results[2].value === 3
`,
        solution: 'function attemptAll(fns) { return fns.map(fn => { try { return { ok: true, value: fn() }; } catch (e) { return { ok: false, error: e.message }; } }); }',
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `parseAndDouble(str)` that parses `str` as JSON and doubles it inside a nested `try`, catching a parse failure and re-throwing with added context, then catches THAT in an outer `try` and returns its message.',
        starter: '',
        tests: `
assert parseAndDouble('21') === 42
assert typeof parseAndDouble('{bad') === 'string'
assert parseAndDouble('{bad').startsWith('parse failed:')
`,
        solution: "function parseAndDouble(str) { try { try { return JSON.parse(str) * 2; } catch (inner) { throw new Error('parse failed: ' + inner.message); } } catch (outer) { return outer.message; } }",
      },
    ],
  },
]

export default challenges
