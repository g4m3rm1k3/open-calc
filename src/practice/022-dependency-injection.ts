import type { PracticeChallenge } from './loader'

export const title = 'Dependency Injection'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write a function `greetUser(name, formatter)` that returns `formatter(name)` — the formatting behavior is injected, not hardcoded.',
        starter: '',
        tests: `
assert greetUser('Alice', n => 'Hi ' + n) === 'Hi Alice'
assert greetUser('Bob', n => n.toUpperCase()) === 'BOB'
`,
        solution: 'function greetUser(name, formatter) { return formatter(name); }',
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Finish `createOrderProcessor(paymentGateway)` so it returns `{ process(amount) }`, delegating to the INJECTED `paymentGateway.charge(amount)`.',
        starter: 'function createOrderProcessor(paymentGateway) {\n  // TODO: return an object with a process(amount) method using paymentGateway.charge\n}',
        tests: `
const fake = { charge: amt => 'charged ' + amt }
const proc = createOrderProcessor(fake)
assert proc.process(50) === 'charged 50'
`,
        solution: 'function createOrderProcessor(paymentGateway) { return { process(amount) { return paymentGateway.charge(amount); } }; }',
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `createOrderProcessor(paymentGateway)` again, then show the SAME processor code working correctly with two DIFFERENT injected gateways.',
        starter: '',
        tests: `
const gatewayA = { charge: amt => 'A charged ' + amt }
const gatewayB = { charge: amt => 'B charged ' + amt }
const procA = createOrderProcessor(gatewayA)
const procB = createOrderProcessor(gatewayB)
assert procA.process(10) === 'A charged 10'
assert procB.process(10) === 'B charged 10'
`,
        solution: 'function createOrderProcessor(paymentGateway) { return { process(amount) { return paymentGateway.charge(amount); } }; }',
      },
    ],
  },
]

export default challenges
