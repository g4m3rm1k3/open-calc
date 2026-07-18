import type { PracticeChallenge } from './loader'

export const title = 'Chain of Responsibility Pattern'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `makeHandler(canHandle, process)` returning `{ setNext(handler), handle(request) }`. `handle` calls `process(request)` if `canHandle(request)` is true; otherwise it forwards to the next handler (set via `setNext`), or returns `"Unhandled: {request.issue}"` if there is no next handler.',
        starter: '',
        tests: `
const level1 = makeHandler(t => t.severity <= 1, t => \`Level1 handled: \${t.issue}\`)
const level2 = makeHandler(t => t.severity <= 2, t => \`Level2 handled: \${t.issue}\`)
assert (level1.setNext(level2), true)
assert level1.handle({severity:1, issue:'password reset'}) === 'Level1 handled: password reset'
assert level1.handle({severity:2, issue:'billing error'}) === 'Level2 handled: billing error'
assert level1.handle({severity:5, issue:'server down'}) === 'Unhandled: server down'
`,
        solution: `function makeHandler(canHandle, process) {
  let next = null
  return {
    setNext(handler) { next = handler; return handler },
    handle(request) {
      if (canHandle(request)) return process(request)
      if (next) return next.handle(request)
      return 'Unhandled: ' + request.issue
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
        prompt: 'Finish `buildChain(handlers)`, given an array of handlers (each already built with `makeHandler`). Wire each handler\'s `setNext` to the following one in the array, then return the FIRST handler — the head of the resulting chain.',
        starter: 'function makeHandler(canHandle, process) {\n  let next = null\n  return {\n    setNext(handler) { next = handler; return handler },\n    handle(request) {\n      if (canHandle(request)) return process(request)\n      if (next) return next.handle(request)\n      return \'Unhandled: \' + request.issue\n    },\n  }\n}\nfunction buildChain(handlers) {\n  // TODO: wire each handler\'s setNext to the following one in the array,\n  // then return the FIRST handler (the head of the chain)\n  return handlers[0]\n}',
        tests: `
const level1 = makeHandler(t => t.severity <= 1, t => \`Level1 handled: \${t.issue}\`)
const level2 = makeHandler(t => t.severity <= 2, t => \`Level2 handled: \${t.issue}\`)
const level3 = makeHandler(t => t.severity <= 3, t => \`Level3 handled: \${t.issue}\`)
const chain = buildChain([level1, level2, level3])
assert chain.handle({severity:1, issue:'a'}) === 'Level1 handled: a'
assert chain.handle({severity:3, issue:'b'}) === 'Level3 handled: b'
assert chain.handle({severity:9, issue:'c'}) === 'Unhandled: c'
`,
        solution: `function makeHandler(canHandle, process) {
  let next = null
  return {
    setNext(handler) { next = handler; return handler },
    handle(request) {
      if (canHandle(request)) return process(request)
      if (next) return next.handle(request)
      return 'Unhandled: ' + request.issue
    },
  }
}
function buildChain(handlers) {
  for (let i = 0; i < handlers.length - 1; i++) {
    handlers[i].setNext(handlers[i + 1])
  }
  return handlers[0]
}`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `makeLoggingFallbackHandler(log)`, a chain handler (same `{ setNext, handle }` shape as `makeHandler` produces) that always handles whatever reaches it — pushing `request.issue` into the `log` array and returning `\'unhandled\'` — meant to sit at the very END of a chain in place of the default `"Unhandled: ..."` message.',
        starter: '',
        tests: `
const logged = []
const fallback = makeLoggingFallbackHandler(logged)
const level1 = makeHandler(t => t.severity <= 1, t => \`Level1 handled: \${t.issue}\`)
assert (level1.setNext(fallback), true)
assert level1.handle({severity:1, issue:'a'}) === 'Level1 handled: a'
assert level1.handle({severity:9, issue:'b'}) === 'unhandled'
assert JSON.stringify(logged) === JSON.stringify(['b'])
`,
        solution: `function makeHandler(canHandle, process) {
  let next = null
  return {
    setNext(handler) { next = handler; return handler },
    handle(request) {
      if (canHandle(request)) return process(request)
      if (next) return next.handle(request)
      return 'Unhandled: ' + request.issue
    },
  }
}
function makeLoggingFallbackHandler(log) {
  return makeHandler(
    () => true,
    request => { log.push(request.issue); return 'unhandled' }
  )
}`,
      },
    ],
  },
]

export default challenges
