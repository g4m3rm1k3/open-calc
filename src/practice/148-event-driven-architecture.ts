import type { PracticeChallenge } from './loader'

export const title = 'Event-Driven Architecture'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `makeEventBus()` returning `{ subscribe(eventName, handler), emit(eventName, payload) }`. `emit` must call EVERY handler subscribed to that event name, with the payload — any number of independent consumers can react.',
        starter: '',
        tests: `
const bus = makeEventBus()
const sideEffects = []
assert (bus.subscribe('OrderPlaced', order => sideEffects.push('email sent for order ' + order.id)), true)
assert (bus.subscribe('OrderPlaced', order => sideEffects.push('inventory updated for order ' + order.id)), true)
assert (bus.emit('OrderPlaced', { id: 101 }), true)
assert JSON.stringify(sideEffects) === JSON.stringify(['email sent for order 101','inventory updated for order 101'])
`,
        solution: `function makeEventBus() {
  const subscribers = {}
  return {
    subscribe(eventName, handler) {
      (subscribers[eventName] ??= []).push(handler)
    },
    emit(eventName, payload) {
      (subscribers[eventName] ?? []).forEach(handler => handler(payload))
    },
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
        prompt: 'Fix `placeOrder(bus, id)`: it must ONLY emit `\'OrderPlaced\'` — it must have ZERO direct reference to any specific consumer\'s logic (like calling an email function itself). Adding a new consumer later must never require touching `placeOrder`.',
        starter: 'function makeEventBus() {\n  const subscribers = {}\n  return {\n    subscribe(eventName, handler) {\n      (subscribers[eventName] ??= []).push(handler)\n    },\n    emit(eventName, payload) {\n      (subscribers[eventName] ?? []).forEach(handler => handler(payload))\n    },\n  }\n}\nfunction placeOrder(bus, id) {\n  // TODO: placeOrder must ONLY emit \'OrderPlaced\' — it must have zero direct\n  // reference to any specific consumer\'s logic (like sending an email itself)\n  return { id, placed: true }\n}',
        tests: `
const bus = makeEventBus()
let emailCalls = 0
assert (bus.subscribe('OrderPlaced', () => { emailCalls++ }), true)
const result = placeOrder(bus, 101)
assert result.id === 101
assert result.placed === true
assert emailCalls === 1
`,
        solution: `function makeEventBus() {
  const subscribers = {}
  return {
    subscribe(eventName, handler) {
      (subscribers[eventName] ??= []).push(handler)
    },
    emit(eventName, payload) {
      (subscribers[eventName] ?? []).forEach(handler => handler(payload))
    },
  }
}
function placeOrder(bus, id) {
  bus.emit('OrderPlaced', { id })
  return { id, placed: true }
}`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `getPaymentResultDirectly(paymentService, amount)` (a direct synchronous call, returning the real answer) and `emitPaymentRequestedEvent(bus, amount)` (emits an event instead). Confirm structurally why events are the WRONG tool for "did this succeed, right now": `emit` itself gives the producer nothing usable back.',
        starter: '',
        tests: `
const paymentService = { charge: amount => ({ success: true, amount }) }
const directResult = getPaymentResultDirectly(paymentService, 50)
assert directResult.success === true
const bus = makeEventBus()
const eventResult = emitPaymentRequestedEvent(bus, 50)
assert eventResult === undefined
`,
        solution: `function makeEventBus() {
  const subscribers = {}
  return {
    subscribe(eventName, handler) {
      (subscribers[eventName] ??= []).push(handler)
    },
    emit(eventName, payload) {
      (subscribers[eventName] ?? []).forEach(handler => handler(payload))
    },
  }
}
function getPaymentResultDirectly(paymentService, amount) {
  return paymentService.charge(amount)
}
function emitPaymentRequestedEvent(bus, amount) {
  return bus.emit('PaymentRequested', { amount })
}`,
      },
    ],
  },
]

export default challenges
