import type { PracticeChallenge } from './loader'

export const title = 'Test Doubles / Mocking'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `makeFakeEmailService()` returning `{ sentEmails: [], send(to, subject) }`, where `send` RECORDS the call into `sentEmails` instead of actually sending anything.',
        starter: '',
        tests: `
const svc = makeFakeEmailService()
assert (svc.send('alice@example.com', 'Welcome!'), true)
assert svc.sentEmails.length === 1
assert svc.sentEmails[0].to === 'alice@example.com'
assert svc.sentEmails[0].subject === 'Welcome!'
`,
        solution: `function makeFakeEmailService() {
  return {
    sentEmails: [],
    send(to, subject) { this.sentEmails.push({ to, subject }) },
  }
}`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Finish `notifyUser(emailService, userEmail)` so it calls `emailService.send(userEmail, \'Welcome!\')` — it should work identically whether `emailService` is the real service or a test double, since it never checks which one it got.',
        starter: 'function notifyUser(emailService, userEmail) {\n  // TODO: call emailService.send(userEmail, \'Welcome!\')\n}',
        tests: `
function makeFake() { const calls = []; return { calls, send(to, subject) { calls.push({to, subject}) } } }
const fake = makeFake()
assert (notifyUser(fake, 'bob@example.com'), true)
assert fake.calls.length === 1
assert fake.calls[0].to === 'bob@example.com'
assert fake.calls[0].subject === 'Welcome!'
`,
        solution: `function notifyUser(emailService, userEmail) {
  emailService.send(userEmail, 'Welcome!')
}`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `makeStubClock(fixedHour)` returning `{ now: () => fixedHour }`, and `isBusinessHours(clock)` returning `true` if `clock.now()` is between 9 (inclusive) and 17 (exclusive) — letting "is it business hours?" be tested without depending on the real current time.',
        starter: '',
        tests: `
const morningClock = makeStubClock(10)
const nightClock = makeStubClock(22)
assert isBusinessHours(morningClock) === true
assert isBusinessHours(nightClock) === false
`,
        solution: `function makeStubClock(fixedHour) {
  return { now: () => fixedHour }
}
function isBusinessHours(clock) {
  const hour = clock.now()
  return hour >= 9 && hour < 17
}`,
      },
    ],
  },
]

export default challenges
