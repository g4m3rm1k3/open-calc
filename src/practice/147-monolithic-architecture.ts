import type { PracticeChallenge } from './loader'

export const title = 'Monolithic Architecture'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `makeMonolith()` returning `{ getOrderWithUser(orderId, userId), crashUsersModule() }`. `getOrderWithUser` calls the internal `getUser` DIRECTLY (in-process, no network); once `crashUsersModule()` is called, EVERY subsequent call to `getOrderWithUser` must also throw, since they share the same process.',
        starter: '',
        tests: `
const app = makeMonolith()
assert JSON.stringify(app.getOrderWithUser(1,42)) === JSON.stringify({orderId:1,user:{id:42,name:'Alice'}})
assert (app.crashUsersModule(), true)
let threw = false
try { app.getOrderWithUser(2,42) } catch (e) { threw = true }
assert threw === true
`,
        solution: `function makeMonolith() {
  let usersDown = false
  function getUser(id) {
    if (usersDown) throw new Error('crash in users module')
    return { id, name: 'Alice' }
  }
  function getOrderWithUser(orderId, userId) {
    const user = getUser(userId)
    return { orderId, user }
  }
  return {
    getOrderWithUser,
    crashUsersModule() { usersDown = true },
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
        prompt: 'Fix `getOrderWithUser`: it has nothing to do with payments, so it must NOT be coupled to `paymentsDown` at all. Sharing one process doesn\'t mean every function must fail together — only calls that genuinely DEPEND on a crashed module should be affected; needlessly coupling unrelated code is exactly the "no internal module boundaries" anti-pattern.',
        starter: 'function makeMonolithWithPayments() {\n  let paymentsDown = false\n  function getPayment(id) {\n    if (paymentsDown) throw new Error(\'crash in payments module\')\n    return { id, amount: 100 }\n  }\n  function getOrderWithUser(orderId, userId) {\n    // TODO: this method has nothing to do with payments — it must NOT be\n    // coupled to paymentsDown at all; only calls that genuinely depend on\n    // the crashed module should be affected\n    if (paymentsDown) throw new Error(\'crash in payments module\')\n    return { orderId, user: { id: userId, name: \'Alice\' } }\n  }\n  return {\n    getPayment,\n    getOrderWithUser,\n    crashPaymentsModule() { paymentsDown = true },\n  }\n}',
        tests: `
const app = makeMonolithWithPayments()
assert (app.crashPaymentsModule(), true)
let threw = false
try { app.getPayment(1) } catch (e) { threw = true }
assert threw === true
assert JSON.stringify(app.getOrderWithUser(1,42)) === JSON.stringify({orderId:1,user:{id:42,name:'Alice'}})
`,
        solution: `function makeMonolithWithPayments() {
  let paymentsDown = false
  function getPayment(id) {
    if (paymentsDown) throw new Error('crash in payments module')
    return { id, amount: 100 }
  }
  function getOrderWithUser(orderId, userId) {
    return { orderId, user: { id: userId, name: 'Alice' } }
  }
  return {
    getPayment,
    getOrderWithUser,
    crashPaymentsModule() { paymentsDown = true },
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
        prompt: 'Write `scaleMonolith(serviceCapacities, extraInstances)` (adding instances multiplies EVERY service\'s capacity together, since they all deploy as one unit) and `scaleMicroservice(serviceCapacities, targetService, extraInstances)` (scales ONLY the target service). A monolith genuinely CAN scale — just never one piece independently of the rest.',
        starter: '',
        tests: `
const capacities = { users: 100, orders: 100, payments: 100 }
const monolithScaled = scaleMonolith(capacities, 2)
assert JSON.stringify(monolithScaled) === JSON.stringify({users:300,orders:300,payments:300})
const microserviceScaled = scaleMicroservice(capacities, 'orders', 2)
assert JSON.stringify(microserviceScaled) === JSON.stringify({users:100,orders:300,payments:100})
`,
        solution: `function scaleMonolith(serviceCapacities, extraInstances) {
  const result = {}
  for (const service in serviceCapacities) {
    result[service] = serviceCapacities[service] * (1 + extraInstances)
  }
  return result
}
function scaleMicroservice(serviceCapacities, targetService, extraInstances) {
  const result = { ...serviceCapacities }
  result[targetService] = serviceCapacities[targetService] * (1 + extraInstances)
  return result
}`,
      },
    ],
  },
]

export default challenges
