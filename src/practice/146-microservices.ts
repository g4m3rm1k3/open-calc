import type { PracticeChallenge } from './loader'

export const title = 'Microservices'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `monolithHandleRequest(path, servicesUp)` (returns `503` if `servicesUp.monolith` is false — EVERYTHING shares one process) and `microserviceHandleRequest(path, serviceName, servicesUp)` (returns `503` only if THAT specific `servicesUp[serviceName]` is down).',
        starter: '',
        tests: `
const monolithDown = { monolith: false }
const microservicesPartialDown = { users: true, orders: true, payments: false }
assert monolithHandleRequest('/orders', monolithDown).status === 503
assert microserviceHandleRequest('/orders', 'orders', microservicesPartialDown).status === 200
assert microserviceHandleRequest('/payments', 'payments', microservicesPartialDown).status === 503
`,
        solution: `function monolithHandleRequest(path, servicesUp) {
  if (!servicesUp.monolith) return { status: 503, path }
  return { status: 200, path }
}
function microserviceHandleRequest(path, serviceName, servicesUp) {
  if (!servicesUp[serviceName]) return { status: 503, path }
  return { status: 200, path }
}`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Fix `callDependentService(callerService, targetService, servicesUp)`: a network call to another microservice can fail independently. Return `{ success: false, reason: \'network call to {targetService} failed\' }` if `servicesUp[targetService]` is down, instead of assuming the call always succeeds.',
        starter: 'function callDependentService(callerService, targetService, servicesUp) {\n  // TODO: a network call to another microservice can fail independently —\n  // check servicesUp[targetService] and return a failure result if it\'s down,\n  // instead of assuming the call always succeeds\n  return { success: true }\n}',
        tests: `
const servicesUp = { users: false, orders: true }
const result = callDependentService('orders', 'users', servicesUp)
assert result.success === false
assert result.reason === 'network call to users failed'
`,
        solution: `function callDependentService(callerService, targetService, servicesUp) {
  if (!servicesUp[targetService]) {
    return { success: false, reason: 'network call to ' + targetService + ' failed' }
  }
  return { success: true }
}`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `estimateScalingCost(serviceLoads, isMicroservices)`, where `serviceLoads` maps each service to its relative load. With microservices, total instances is the SUM of each service\'s own load (scaled independently). As a monolith, EVERY service must scale together to match whichever service has the highest load, since they share one deployable unit.',
        starter: '',
        tests: `
const loads = { users: 1, orders: 10, payments: 1 }
assert estimateScalingCost(loads, true) === 12
assert estimateScalingCost(loads, false) === 30
`,
        solution: `function estimateScalingCost(serviceLoads, isMicroservices) {
  const services = Object.keys(serviceLoads)
  if (isMicroservices) {
    return services.reduce((total, s) => total + serviceLoads[s], 0)
  }
  const maxLoad = Math.max(...services.map(s => serviceLoads[s]))
  return maxLoad * services.length
}`,
      },
    ],
  },
]

export default challenges
