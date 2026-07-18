import type { PracticeChallenge } from './loader'

export const title = 'Checked vs. Unchecked Exceptions'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: "Write `checkedDivide(a, b)` — the \"checked\" style — that NEVER throws, instead returning `{ ok: true, value }` or `{ ok: false, error: 'division by zero' }`.",
        starter: '',
        tests: `
assert JSON.stringify(checkedDivide(10,2)) === JSON.stringify({ok:true,value:5})
assert JSON.stringify(checkedDivide(10,0)) === JSON.stringify({ok:false,error:'division by zero'})
`,
        solution: "function checkedDivide(a, b) { if (b === 0) { return { ok: false, error: 'division by zero' }; } return { ok: true, value: a / b }; }",
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Finish `uncheckedDivide(a, b)` — the "unchecked" style — that throws `new Error("Division by zero")` on invalid input instead of returning a result object.',
        starter: 'function uncheckedDivide(a, b) {\n  // TODO: throw an Error with message "Division by zero" if b is 0\n}',
        tests: `
assert uncheckedDivide(10,2) === 5
let caught = null
try { uncheckedDivide(1,0) } catch (e) { caught = e.message }
assert caught === 'Division by zero'
`,
        solution: "function uncheckedDivide(a, b) { if (b === 0) { throw new Error('Division by zero'); } return a / b; }",
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `safeCallChecked(fn)` that wraps ANY throwing function into the "checked" `{ ok, value }` / `{ ok, error }` style, converting unchecked exceptions into a forced-to-handle result.',
        starter: '',
        tests: `
const throwing = () => { throw new Error('kaboom'); }
assert JSON.stringify(safeCallChecked(throwing)) === JSON.stringify({ok:false,error:'kaboom'})
assert JSON.stringify(safeCallChecked(() => 7)) === JSON.stringify({ok:true,value:7})
`,
        solution: "function safeCallChecked(fn) { try { return { ok: true, value: fn() }; } catch (e) { return { ok: false, error: e.message }; } }",
      },
    ],
  },
]

export default challenges
