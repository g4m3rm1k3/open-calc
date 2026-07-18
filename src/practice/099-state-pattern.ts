import type { PracticeChallenge } from './loader'

export const title = 'State Pattern'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `makeRedState()` and `makeGreenState()`, each `{ next(light), name() }`, plus `makeTrafficLight()` returning `{ state, next(), currentName() }`. `TrafficLight.next()` must delegate to `state.next(light)` rather than checking the color itself; red transitions to green.',
        starter: '',
        tests: `
const light = makeTrafficLight()
assert light.currentName() === 'red'
assert (light.next(), true)
assert light.currentName() === 'green'
`,
        solution: `function makeRedState() {
  return { next(light) { light.state = makeGreenState() }, name: () => 'red' }
}
function makeGreenState() {
  return { next(light) { light.state = makeRedState() }, name: () => 'green' }
}
function makeTrafficLight() {
  const light = {
    state: null,
    next() { light.state.next(light) },
    currentName() { return light.state.name() },
  }
  light.state = makeRedState()
  return light
}`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Add `makeYellowState()` to complete the cycle: green transitions to yellow, and yellow transitions back to red — trace `next()` calls to confirm the full red → green → yellow → red loop.',
        starter: 'function makeRedState() {\n  return { next(light) { light.state = makeGreenState() }, name: () => \'red\' }\n}\nfunction makeGreenState() {\n  return { next(light) { light.state = makeYellowState() }, name: () => \'green\' }\n}\nfunction makeYellowState() {\n  // TODO: next(light) must set light.state back to a RedState, completing the cycle\n  return { next(light) {}, name: () => \'yellow\' }\n}\nfunction makeTrafficLight() {\n  const light = {\n    state: null,\n    next() { light.state.next(light) },\n    currentName() { return light.state.name() },\n  }\n  light.state = makeRedState()\n  return light\n}',
        tests: `
const light = makeTrafficLight()
assert light.currentName() === 'red'
assert (light.next(), true)
assert light.currentName() === 'green'
assert (light.next(), true)
assert light.currentName() === 'yellow'
assert (light.next(), true)
assert light.currentName() === 'red'
`,
        solution: `function makeRedState() {
  return { next(light) { light.state = makeGreenState() }, name: () => 'red' }
}
function makeGreenState() {
  return { next(light) { light.state = makeYellowState() }, name: () => 'green' }
}
function makeYellowState() {
  return { next(light) { light.state = makeRedState() }, name: () => 'yellow' }
}
function makeTrafficLight() {
  const light = {
    state: null,
    next() { light.state.next(light) },
    currentName() { return light.state.name() },
  }
  light.state = makeRedState()
  return light
}`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `makeStateMachine(transitions, initial)` returning `{ current(), next() }` — a data-driven generalization of State, where `transitions` is a plain object mapping each state name to the name of the state it transitions to on `next()`.',
        starter: '',
        tests: `
const machine = makeStateMachine({ red: 'green', green: 'yellow', yellow: 'red' }, 'red')
assert machine.current() === 'red'
assert (machine.next(), true)
assert machine.current() === 'green'
assert (machine.next(), true)
assert machine.current() === 'yellow'
assert (machine.next(), true)
assert machine.current() === 'red'
`,
        solution: `function makeStateMachine(transitions, initial) {
  let current = initial
  return {
    current() { return current },
    next() { current = transitions[current] },
  }
}`,
      },
    ],
  },
]

export default challenges
