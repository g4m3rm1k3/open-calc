import type { PracticeChallenge } from './loader'

export const title = 'Handling Errors Well: Error Aggregation'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `collectErrors(fns)` that runs every zero-arg function in `fns`, collecting the MESSAGE of any that throw into an array (ignoring successes).',
        starter: '',
        tests: `
const errs = collectErrors([() => {}, () => { throw new Error('a'); }, () => { throw new Error('b'); }])
assert JSON.stringify(errs) === JSON.stringify(['a','b'])
`,
        solution: 'function collectErrors(fns) { const errors = []; for (const fn of fns) { try { fn(); } catch (e) { errors.push(e.message); } } return errors; }',
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Finish `validateFields(fields, rules)` so it runs EVERY rule (not stopping at the first failure) and returns an array of ALL failing field names.',
        starter: 'function validateFields(fields, rules) {\n  // TODO: run every rule, collecting ALL failing field names (not stopping at first)\n}',
        tests: `
const fields = { name: '', age: -1 }
const rules = { name: v => v.length > 0, age: v => v >= 0 }
assert JSON.stringify(validateFields(fields, rules)) === JSON.stringify(['name', 'age'])
`,
        solution: "function validateFields(fields, rules) { const failures = []; for (const key of Object.keys(rules)) { if (!rules[key](fields[key])) { failures.push(key); } } return failures; }",
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `class AggregateValidationError extends Error` holding an `.errors` array, and `validateOrThrow(fields, rules)` which runs every rule and throws ONE `AggregateValidationError` containing ALL failing field names if any fail.',
        starter: '',
        tests: `
assert validateOrThrow({name:'Alice'}, {name: v => v.length > 0}) === true
let caught = null
try { validateOrThrow({name:'',age:-1}, {name: v => v.length>0, age: v => v>=0}) } catch (e) { caught = e; }
assert caught instanceof AggregateValidationError
assert JSON.stringify(caught.errors) === JSON.stringify(['name','age'])
`,
        solution: "class AggregateValidationError extends Error { constructor(errors) { super('multiple validation errors'); this.errors = errors; } }\nfunction validateOrThrow(fields, rules) { const failures = []; for (const key of Object.keys(rules)) { if (!rules[key](fields[key])) { failures.push(key); } } if (failures.length > 0) { throw new AggregateValidationError(failures); } return true; }",
      },
    ],
  },
]

export default challenges
