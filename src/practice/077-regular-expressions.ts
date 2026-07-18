import type { PracticeChallenge } from './loader'

export const title = 'Regular Expressions'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `hasPhoneNumber(str)` returning `true` if `str` contains a phone-number-shaped substring (three digits, a dash, four digits), `false` otherwise.',
        starter: '',
        tests: `
assert hasPhoneNumber('Call 555-1234 now') === true
assert hasPhoneNumber('no numbers here') === false
`,
        solution: `function hasPhoneNumber(str) {
  return /\\d{3}-\\d{4}/.test(str)
}`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Finish `extractEmails(str)` returning an array of every email-like substring (`word@word.word`) found in `str`, in order, or an empty array if none are found.',
        starter: 'function extractEmails(str) {\n  // TODO: return an array of every email-like substring in str\n  return []\n}',
        tests: `
assert JSON.stringify(extractEmails('contact a@b.com or c@d.org')) === JSON.stringify(['a@b.com','c@d.org'])
assert JSON.stringify(extractEmails('no emails here')) === JSON.stringify([])
`,
        solution: `function extractEmails(str) {
  const matches = str.match(/\\w+@\\w+\\.\\w+/g)
  return matches || []
}`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `formatDate(str)` converting a `"MM/DD/YYYY"` string into `"YYYY-MM-DD"`, using regex capture groups to rearrange the pieces.',
        starter: '',
        tests: `
assert formatDate('07/18/2026') === '2026-07-18'
assert formatDate('01/05/2000') === '2000-01-05'
`,
        solution: `function formatDate(str) {
  return str.replace(/(\\d{2})\\/(\\d{2})\\/(\\d{4})/, '$3-$1-$2')
}`,
      },
    ],
  },
]

export default challenges
