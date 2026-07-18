import type { PracticeChallenge } from './loader'

export const title = 'Validation'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: "Write `isValidEmail(str)` that returns `true` if `str` contains both `'@'` and `'.'`.",
        starter: '',
        tests: `
assert isValidEmail('a@b.com') === true
assert isValidEmail('nope') === false
`,
        solution: "function isValidEmail(str) { return typeof str === 'string' && str.includes('@') && str.includes('.'); }",
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript',
        prompt: "Finish `validateUser(user)` so it returns an array of error strings: `'name is required'` if `user.name` is falsy, `'age must be non-negative'` if `user.age` is missing or negative.",
        starter: 'function validateUser(user) {\n  // TODO: return an array of error strings for missing name / invalid age\n}',
        tests: `
assert JSON.stringify(validateUser({name:'Alice',age:30})) === JSON.stringify([])
assert JSON.stringify(validateUser({age:-1})) === JSON.stringify(['name is required', 'age must be non-negative'])
`,
        solution: "function validateUser(user) { const errors = []; if (!user.name) errors.push('name is required'); if (user.age === undefined || user.age < 0) errors.push('age must be non-negative'); return errors; }",
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript',
        prompt: "Write `validatePassword(pw)` returning an array of failed rule descriptions: `'too short'` (< 8 chars), `'needs a digit'`, `'needs an uppercase letter'`.",
        starter: '',
        tests: `
assert JSON.stringify(validatePassword('Abcdef12')) === JSON.stringify([])
assert JSON.stringify(validatePassword('abc')) === JSON.stringify(['too short', 'needs a digit', 'needs an uppercase letter'])
`,
        solution: "function validatePassword(pw) { const failures = []; if (pw.length < 8) failures.push('too short'); if (!/[0-9]/.test(pw)) failures.push('needs a digit'); if (!/[A-Z]/.test(pw)) failures.push('needs an uppercase letter'); return failures; }",
      },
    ],
  },
]

export default challenges
