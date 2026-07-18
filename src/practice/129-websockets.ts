import type { PracticeChallenge } from './loader'

export const title = 'WebSockets'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `makeFakeSocket()` returning `{ onMessage(fn), send(message) }`. `onMessage` registers a listener; `send` calls EVERY registered listener with the message.',
        starter: '',
        tests: `
const clientReceived = []
const clientSocket = makeFakeSocket()
assert (clientSocket.onMessage(msg => clientReceived.push(msg)), true)
assert (clientSocket.send('hello'), true)
assert JSON.stringify(clientReceived) === JSON.stringify(['hello'])
`,
        solution: `function makeFakeSocket() {
  const listeners = []
  return {
    onMessage(fn) { listeners.push(fn) },
    send(message) { listeners.forEach(fn => fn(message)) },
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
        prompt: 'Fix `makeChannel()` returning `{ client, server }`, two linked sockets: a message `client.send(...)` sends must reach `server`\'s listeners (not loop back to the client\'s own), and `server.send(...)` must reach `client`\'s listeners — either side can push to the other at any time, unprompted.',
        starter: 'function makeChannel() {\n  const clientListeners = []\n  const serverListeners = []\n  const client = {\n    onMessage(fn) { clientListeners.push(fn) },\n    // TODO: a message the client SENDS must reach the SERVER\'s listeners,\n    // not loop back to the client\'s own listeners\n    send(msg) { clientListeners.forEach(fn => fn(msg)) },\n  }\n  const server = {\n    onMessage(fn) { serverListeners.push(fn) },\n    send(msg) { clientListeners.forEach(fn => fn(msg)) },\n  }\n  return { client, server }\n}',
        tests: `
const channel = makeChannel()
const serverReceived = []
const clientReceived = []
assert (channel.server.onMessage(msg => serverReceived.push(msg)), true)
assert (channel.client.onMessage(msg => clientReceived.push(msg)), true)
assert (channel.client.send('hello'), true)
assert (channel.server.send('pushed update'), true)
assert JSON.stringify(serverReceived) === JSON.stringify(['hello'])
assert JSON.stringify(clientReceived) === JSON.stringify(['pushed update'])
`,
        solution: `function makeChannel() {
  const clientListeners = []
  const serverListeners = []
  const client = {
    onMessage(fn) { clientListeners.push(fn) },
    send(msg) { serverListeners.forEach(fn => fn(msg)) },
  }
  const server = {
    onMessage(fn) { serverListeners.push(fn) },
    send(msg) { clientListeners.forEach(fn => fn(msg)) },
  }
  return { client, server }
}`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `compareTransportCost(pollIntervalMs, totalDurationMs, actualUpdateCount)` returning `{ pollingRequests, websocketMessages, wastedPollingRequests }` — polling sends a request every `pollIntervalMs` regardless of whether anything changed, while a WebSocket sends exactly one message per actual update.',
        starter: '',
        tests: `
const result = compareTransportCost(1000, 10000, 3)
assert result.pollingRequests === 10
assert result.websocketMessages === 3
assert result.wastedPollingRequests === 7
`,
        solution: `function compareTransportCost(pollIntervalMs, totalDurationMs, actualUpdateCount) {
  const pollingRequests = Math.floor(totalDurationMs / pollIntervalMs)
  const websocketMessages = actualUpdateCount
  const wastedPollingRequests = Math.max(0, pollingRequests - actualUpdateCount)
  return { pollingRequests, websocketMessages, wastedPollingRequests }
}`,
      },
    ],
  },
]

export default challenges
