import type { PracticeChallenge } from './loader'

export const title = 'Observer Pattern'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write a function `createEmitter()` returning `{ on(event, cb), emit(event, ...args) }`, where `emit` calls every subscribed callback for that event.',
        starter: '',
        tests: `
const e = createEmitter()
let received = null
e.on('test', v => { received = v; })
assert (e.emit('test', 42), true)
assert received === 42
`,
        solution: 'function createEmitter() { const listeners = {}; return { on(event, cb) { (listeners[event] ??= []).push(cb); }, emit(event, ...args) { (listeners[event] ?? []).forEach(cb => cb(...args)); } }; }',
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Finish `createEmitter()` so it supports MULTIPLE subscribers per event, all called in the order they subscribed.',
        starter: 'function createEmitter() {\n  // TODO: return { on(event, cb), emit(event, ...args) } supporting multiple listeners per event\n}',
        tests: `
const e = createEmitter()
let calls = []
assert (e.on('x', () => calls.push('a')), true)
assert (e.on('x', () => calls.push('b')), true)
assert (e.emit('x'), true)
assert JSON.stringify(calls) === JSON.stringify(['a','b'])
`,
        solution: 'function createEmitter() { const listeners = {}; return { on(event, cb) { (listeners[event] ??= []).push(cb); }, emit(event, ...args) { (listeners[event] ?? []).forEach(cb => cb(...args)); } }; }',
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `createEmitter()` so that `on(event, cb)` returns an UNSUBSCRIBE function — after calling it, that callback no longer fires on future `emit` calls.',
        starter: '',
        tests: `
const e = createEmitter()
let count = 0
const unsub = e.on('x', () => { count++; })
assert (e.emit('x'), true)
assert count === 1
assert (unsub(), true)
assert (e.emit('x'), true)
assert count === 1
`,
        solution: 'function createEmitter() { const listeners = {}; return { on(event, cb) { (listeners[event] ??= []).push(cb); return () => { listeners[event] = listeners[event].filter(fn => fn !== cb); }; }, emit(event, ...args) { (listeners[event] ?? []).forEach(cb => cb(...args)); } }; }',
      },
    ],
  },
]

export default challenges
