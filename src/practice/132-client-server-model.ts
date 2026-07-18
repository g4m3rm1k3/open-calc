import type { PracticeChallenge } from './loader'

export const title = 'Client-Server Model'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `makeServer()` returning `{ getItems(), addItem(item) }`, holding one shared `items` list. A change made via `addItem` must be visible to every subsequent `getItems()` call, since there\'s only one centrally-held copy of the data.',
        starter: '',
        tests: `
const server = makeServer()
assert JSON.stringify(server.getItems()) === JSON.stringify(['apple'])
assert (server.addItem('banana'), true)
assert JSON.stringify(server.getItems()) === JSON.stringify(['apple','banana'])
`,
        solution: `function makeServer() {
  const items = ['apple']
  return {
    getItems() { return [...items] },
    addItem(item) { items.push(item) },
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
        prompt: 'Fix `getItems()`: it must return a COPY of the items array, not the real internal array — otherwise a caller can mutate the server\'s actual stored data directly through the returned reference, bypassing the server entirely.',
        starter: 'function makeServer() {\n  const items = [\'apple\']\n  return {\n    // TODO: return a COPY of items, not the real internal array — otherwise\n    // a caller can mutate the server\'s actual data directly through the\n    // returned reference\n    getItems() { return items },\n    addItem(item) { items.push(item) },\n  }\n}',
        tests: `
const server = makeServer()
const itemsA = server.getItems()
assert (itemsA.push('hacked'), true)
assert JSON.stringify(server.getItems()) === JSON.stringify(['apple'])
`,
        solution: `function makeServer() {
  const items = ['apple']
  return {
    getItems() { return [...items] },
    addItem(item) { items.push(item) },
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
        prompt: 'Write `makeServerWithValidation()`: `addItem(item)` must reject (`{ success: false, error }`) anything that isn\'t a non-empty string, and this check must be enforced by the SERVER itself — a client bypassing its own validation and sending garbage directly must still be rejected.',
        starter: '',
        tests: `
const server = makeServerWithValidation()
const result1 = server.addItem('banana')
assert result1.success === true
const result2 = server.addItem('')
assert result2.success === false
assert JSON.stringify(server.getItems()) === JSON.stringify(['apple','banana'])
`,
        solution: `function makeServerWithValidation() {
  const items = ['apple']
  return {
    getItems() { return [...items] },
    addItem(item) {
      if (typeof item !== 'string' || item.trim() === '') {
        return { success: false, error: 'invalid item' }
      }
      items.push(item)
      return { success: true }
    },
  }
}`,
      },
    ],
  },
]

export default challenges
