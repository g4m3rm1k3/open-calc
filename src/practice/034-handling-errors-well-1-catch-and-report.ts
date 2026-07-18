import type { PracticeChallenge } from './loader'

export const title = 'Handling Errors Well: Catch and Report'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `tryOperation(fn)` returning `{ success: true, value }` if `fn()` succeeds, or `{ success: false, error }` (with `error` set to the error\'s message) if it throws.',
        starter: '',
        tests: `
assert JSON.stringify(tryOperation(() => 42)) === JSON.stringify({success:true,value:42})
assert JSON.stringify(tryOperation(() => { throw new Error('bad'); })) === JSON.stringify({success:false,error:'bad'})
`,
        solution: "function tryOperation(fn) { try { return { success: true, value: fn() }; } catch (e) { return { success: false, error: e.message }; } }",
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Finish `reportErrors(fns)` so it runs every zero-arg function in `fns`, returning an array of `{ success, value }` or `{ success, error }` for each.',
        starter: 'function reportErrors(fns) {\n  // TODO: run each fn, collecting {success,value} or {success,error} for each\n}',
        tests: `
const results = reportErrors([() => 1, () => { throw new Error('x'); }])
assert results[0].success === true && results[0].value === 1
assert results[1].success === false && results[1].error === 'x'
`,
        solution: "function reportErrors(fns) { return fns.map(fn => { try { return { success: true, value: fn() }; } catch (e) { return { success: false, error: e.message }; } }); }",
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `retryOperation(fn, maxAttempts)` that retries `fn()` up to `maxAttempts` times whenever it throws, returning the first successful value, or re-throwing the last error once attempts are exhausted.',
        starter: '',
        tests: `
let calls = 0
const flaky = () => { calls++; if (calls < 3) throw new Error('fail'); return 'ok'; }
assert retryOperation(flaky, 5) === 'ok'
assert calls === 3
let caught = null
try { retryOperation(() => { throw new Error('always'); }, 2) } catch (e) { caught = e.message }
assert caught === 'always'
`,
        solution: "function retryOperation(fn, maxAttempts) { let lastError; for (let i = 0; i < maxAttempts; i++) { try { return fn(); } catch (e) { lastError = e; } } throw lastError; }",
      },
    ],
  },
]

export default challenges
