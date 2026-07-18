import type { PracticeChallenge } from './loader'

export const title = 'Stack Traces'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `hasStackTrace(err)` that returns `true` if `err.stack` is a non-empty string.',
        starter: '',
        tests: `
assert hasStackTrace(new Error('x')) === true
`,
        solution: "function hasStackTrace(err) { return typeof err.stack === 'string' && err.stack.length > 0; }",
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript',
        prompt: "Finish `wrapWithContext(err, context)` so it returns a NEW `Error` whose message is `context + ' -- caused by: ' + err.message`, with its `.cause` property set to the original `err`.",
        starter: 'function wrapWithContext(err, context) {\n  // TODO: build a new Error whose message combines context and err.message, with .cause set to err\n}',
        tests: `
const orig = new Error('inner')
const wrapped = wrapWithContext(orig, 'outer')
assert wrapped.message === 'outer -- caused by: inner'
assert wrapped.cause === orig
`,
        solution: "function wrapWithContext(err, context) { const wrapped = new Error(context + ' -- caused by: ' + err.message); wrapped.cause = err; return wrapped; }",
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `errorChainMessages(err)` that walks `err.cause` links and returns an array of every message in the chain, from outermost to innermost.',
        starter: '',
        tests: `
const e1 = new Error('first')
const e2 = new Error('second', { cause: e1 })
const e3 = new Error('third', { cause: e2 })
assert JSON.stringify(errorChainMessages(e3)) === JSON.stringify(['third','second','first'])
`,
        solution: 'function errorChainMessages(err) { const messages = []; let current = err; while (current) { messages.push(current.message); current = current.cause; } return messages; }',
      },
    ],
  },
]

export default challenges
