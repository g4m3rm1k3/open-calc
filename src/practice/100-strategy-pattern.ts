import type { PracticeChallenge } from './loader'

export const title = 'Strategy Pattern'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `makeCreditCardStrategy()` and `makePayPalStrategy()`, each `{ pay(amount) }`, and `makeCheckout(strategy)` returning `{ strategy, pay(amount) }`, where `pay` delegates to `this.strategy.pay(amount)`. Swapping `checkout.strategy` must change the outcome of the NEXT `pay()` call.',
        starter: '',
        tests: `
const checkout = makeCheckout(makeCreditCardStrategy())
assert checkout.pay(100) === 'Paid $100 by credit card'
assert (checkout.strategy = makePayPalStrategy(), true)
assert checkout.pay(100) === 'Paid $100 via PayPal'
`,
        solution: `function makeCreditCardStrategy() {
  return { pay(amount) { return \`Paid $\${amount} by credit card\` } }
}
function makePayPalStrategy() {
  return { pay(amount) { return \`Paid $\${amount} via PayPal\` } }
}
function makeCheckout(strategy) {
  return {
    strategy,
    pay(amount) { return this.strategy.pay(amount) },
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
        prompt: 'Finish `makeBankTransferStrategy()` returning `{ pay(amount) }` producing `"Paid $amount by bank transfer"` — a THIRD strategy that swaps into an existing `Checkout` with zero changes to `makeCheckout` itself.',
        starter: 'function makeCreditCardStrategy() {\n  return { pay(amount) { return `Paid $${amount} by credit card` } }\n}\nfunction makeBankTransferStrategy() {\n  // TODO: return { pay(amount) } returning "Paid $${amount} by bank transfer"\n  return { pay(amount) { return \'\' } }\n}\nfunction makeCheckout(strategy) {\n  return {\n    strategy,\n    pay(amount) { return this.strategy.pay(amount) },\n  }\n}',
        tests: `
const checkout = makeCheckout(makeCreditCardStrategy())
assert checkout.pay(100) === 'Paid $100 by credit card'
assert (checkout.strategy = makeBankTransferStrategy(), true)
assert checkout.pay(100) === 'Paid $100 by bank transfer'
`,
        solution: `function makeCreditCardStrategy() {
  return { pay(amount) { return \`Paid $\${amount} by credit card\` } }
}
function makeBankTransferStrategy() {
  return { pay(amount) { return \`Paid $\${amount} by bank transfer\` } }
}
function makeCheckout(strategy) {
  return {
    strategy,
    pay(amount) { return this.strategy.pay(amount) },
  }
}`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `makeCheckoutFn(payFn)` returning `{ payFn, pay(amount) }`, where `pay` delegates to `this.payFn(amount)` — the same swappable-behavior idea as Strategy, but using a plain FUNCTION instead of a strategy object.',
        starter: '',
        tests: `
const checkout = makeCheckoutFn(amount => \`Paid $\${amount} by credit card\`)
assert checkout.pay(100) === 'Paid $100 by credit card'
checkout.payFn = amount => \`Paid $\${amount} via PayPal\`
assert checkout.pay(100) === 'Paid $100 via PayPal'
`,
        solution: `function makeCheckoutFn(payFn) {
  return {
    payFn,
    pay(amount) { return this.payFn(amount) },
  }
}`,
      },
    ],
  },
]

export default challenges
