import type { PracticeChallenge } from './loader'

export const title = 'Handling Errors Well: Custom Error Types'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `class ValidationError extends Error` with a `.field` property, and `makeValidationError(field, msg)` returning an instance of it.',
        starter: '',
        tests: `
const e = makeValidationError('email','required')
assert e.field === 'email'
assert e.message === 'required'
assert e instanceof Error === true
`,
        solution: 'class ValidationError extends Error { constructor(field, message) { super(message); this.field = field; } }\nfunction makeValidationError(field, msg) { return new ValidationError(field, msg); }',
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Finish `isValidationError(err)` so it returns `true` only if `err` is an instance of `ValidationError`.',
        starter: 'class ValidationError extends Error {\n  constructor(field, message) { super(message); this.field = field; }\n}\nfunction isValidationError(err) {\n  // TODO\n}',
        tests: `
assert isValidationError(new ValidationError('x','bad')) === true
assert isValidationError(new Error('plain')) === false
`,
        solution: 'class ValidationError extends Error { constructor(field, message) { super(message); this.field = field; } }\nfunction isValidationError(err) { return err instanceof ValidationError; }',
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `ValidationError` (with `.field`) and `NetworkError` (with `.status`) custom error classes, plus `handleError(err)` that dispatches a different message per error TYPE.',
        starter: '',
        tests: `
assert handleError(new ValidationError('email','bad')) === 'Invalid field: email'
assert handleError(new NetworkError('timeout', 504)) === 'Network error 504'
assert handleError(new Error('other')) === 'Unknown error'
`,
        solution: "class ValidationError extends Error { constructor(field, message) { super(message); this.field = field; } }\nclass NetworkError extends Error { constructor(message, status) { super(message); this.status = status; } }\nfunction handleError(err) { if (err instanceof ValidationError) return 'Invalid field: ' + err.field; if (err instanceof NetworkError) return 'Network error ' + err.status; return 'Unknown error'; }",
      },
    ],
  },
]

export default challenges
