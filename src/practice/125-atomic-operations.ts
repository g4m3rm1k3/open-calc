import type { PracticeChallenge } from './loader'

export const title = 'Atomic Operations'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `atomicIncrement(counterRef)`, where `counterRef` is `{ value }`. Increment `counterRef.value` by `1` as a single indivisible operation — since JS itself is synchronous and single-threaded, one plain statement like this genuinely can\'t be observed "half-done" by anything else.',
        starter: '',
        tests: `
const counter = { value: 0 }
assert (atomicIncrement(counter), true)
assert (atomicIncrement(counter), true)
assert counter.value === 2
`,
        solution: `function atomicIncrement(counterRef) {
  counterRef.value += 1
}`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Fix `atomicCompareAndSwap(stateRef, expected, newValue)` — the compare-and-swap primitive: only swap in `newValue` if `stateRef.value` currently equals `expected`; ALWAYS return whatever value was actually seen, whether or not a swap happened.',
        starter: 'function atomicCompareAndSwap(stateRef, expected, newValue) {\n  // TODO: only swap in newValue if stateRef.value currently equals expected —\n  // always return whatever value was actually seen, swapped or not\n  const current = stateRef.value\n  stateRef.value = newValue\n  return current\n}',
        tests: `
const state = { value: 5 }
const result1 = atomicCompareAndSwap(state, 5, 10)
assert result1 === 5
assert state.value === 10
const result2 = atomicCompareAndSwap(state, 5, 99)
assert result2 === 10
assert state.value === 10
`,
        solution: `function atomicCompareAndSwap(stateRef, expected, newValue) {
  const current = stateRef.value
  if (current === expected) stateRef.value = newValue
  return current
}`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `raceOnConditionalIncrement(stateRef)`, simulating two threads each doing "read, then increment if under 5" as two SEPARATE atomic reads and two separate atomic writes (both reads happen before either write, exactly like the Race Conditions concept). Confirm the result proves that a sequence of individually-atomic operations is NOT automatically atomic as a whole.',
        starter: '',
        tests: `
const state = { value: 4 }
assert raceOnConditionalIncrement(state) === 5
`,
        solution: `function raceOnConditionalIncrement(stateRef) {
  const readA = stateRef.value
  const readB = stateRef.value
  if (readA < 5) stateRef.value = readA + 1
  if (readB < 5) stateRef.value = readB + 1
  return stateRef.value
}`,
      },
    ],
  },
]

export default challenges
