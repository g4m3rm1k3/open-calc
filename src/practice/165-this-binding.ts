import type { PracticeChallenge } from './loader'

export const title = 'this Binding'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `makeGreeter(name)` returning `{ name, greet() }`, where `greet` returns `this.name`. Calling `obj.greet()` returns the name; extracting `greet` and calling it standalone throws (no `this`); `.call(obj)` restores it; attaching the SAME detached function to a different object and calling it there gives THAT object\'s name instead.',
        starter: '',
        tests: `
const obj = makeGreeter('Alice')
assert obj.greet() === 'Alice'
const detached = obj.greet
let threw = false
try { detached() } catch (e) { threw = true }
assert threw === true
assert detached.call(obj) === 'Alice'
const obj2 = { name: 'Bob' }
obj2.greetAsBob = detached
assert obj2.greetAsBob() === 'Bob'
`,
        solution: `function makeGreeter(name) {
  return {
    name,
    greet() { return this.name },
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
        prompt: 'Fix `getBoundIncrement()`: it must return a BOUND version of `increment` (`this.increment.bind(this)`), not the raw unbound method — otherwise calling it standalone (as a detached callback) loses its connection to this counter object entirely.',
        starter: 'function makeCounterWithBoundIncrement() {\n  return {\n    count: 0,\n    increment() { this.count++ },\n    // TODO: return a BOUND version of increment (this.increment.bind(this)),\n    // not the raw unbound method — otherwise calling it standalone loses\n    // its connection to this counter object entirely\n    getBoundIncrement() { return this.increment },\n  }\n}',
        tests: `
const counter = makeCounterWithBoundIncrement()
const callback = counter.getBoundIncrement()
assert (callback(), true)
assert (callback(), true)
assert counter.count === 2
`,
        solution: `function makeCounterWithBoundIncrement() {
  return {
    count: 0,
    increment() { this.count++ },
    getBoundIncrement() { return this.increment.bind(this) },
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
        prompt: 'Write `makeTimerWithArrowCallback()` returning `{ label, getArrowCallback() }`, where `getArrowCallback` returns an ARROW function reading `this.label`. Arrow functions capture `this` lexically at definition time, so the callback keeps returning the ORIGINAL object\'s label even when called standalone or attached to a completely different object.',
        starter: '',
        tests: `
const timer = makeTimerWithArrowCallback()
const callback = timer.getArrowCallback()
assert callback() === 'Timer'
const otherObj = { label: 'Other' }
otherObj.callback = callback
assert otherObj.callback() === 'Timer'
`,
        solution: `function makeTimerWithArrowCallback() {
  return {
    label: 'Timer',
    getArrowCallback() {
      return () => this.label
    },
  }
}`,
      },
    ],
  },
]

export default challenges
