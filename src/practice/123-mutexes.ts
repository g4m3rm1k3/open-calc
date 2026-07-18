import type { PracticeChallenge } from './loader'

export const title = 'Mutexes'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `makeMutex()` returning `{ acquire(), release(), isLocked }`. `acquire` must throw if the mutex is already locked (mutual exclusion — only one holder at a time); `release` unlocks it.',
        starter: '',
        tests: `
const mutex = makeMutex()
assert mutex.isLocked === false
assert (mutex.acquire(), true)
assert mutex.isLocked === true
let threw = false
try { mutex.acquire() } catch (e) { threw = true }
assert threw === true
assert (mutex.release(), true)
assert mutex.isLocked === false
`,
        solution: `function makeMutex() {
  let locked = false
  return {
    acquire() {
      if (locked) throw new Error('already locked')
      locked = true
    },
    release() { locked = false },
    get isLocked() { return locked },
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
        prompt: 'Fix `incrementWithMutex(counterState, mutex)`: the write (`counterState.value = current + 1`) must happen BEFORE `mutex.release()` — releasing first reopens the critical section while the read-modify-write sequence is still incomplete, which is exactly the interleaving a mutex exists to prevent.',
        starter: 'function makeMutex() {\n  let locked = false\n  return {\n    acquire() { locked = true },\n    release() { locked = false },\n    get isLocked() { return locked },\n  }\n}\nfunction incrementWithMutex(counterState, mutex) {\n  mutex.acquire()\n  const current = counterState.value\n  // TODO: the write must happen BEFORE release() — releasing first reopens\n  // the critical section while the read-modify-write sequence is still incomplete\n  mutex.release()\n  counterState.value = current + 1\n}',
        tests: `
const mutex = makeMutex()
let lockedDuringWrite = null
const counterState = { _value: 0 }
Object.defineProperty(counterState, 'value', {
  get() { return this._value },
  set(v) { lockedDuringWrite = mutex.isLocked; this._value = v },
})
assert (incrementWithMutex(counterState, mutex), true)
assert lockedDuringWrite === true
assert counterState.value === 1
assert mutex.isLocked === false
`,
        solution: `function makeMutex() {
  let locked = false
  return {
    acquire() { locked = true },
    release() { locked = false },
    get isLocked() { return locked },
  }
}
function incrementWithMutex(counterState, mutex) {
  mutex.acquire()
  const current = counterState.value
  counterState.value = current + 1
  mutex.release()
}`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `readComputeWrite(sharedState, key, slowComputeFn, mutex)`: acquire the mutex only to READ `sharedState[key]`, release it, run the SLOW `slowComputeFn` entirely OUTSIDE the lock, then re-acquire the mutex just to WRITE the result back — keeping the critical section as small as correctness allows.',
        starter: '',
        tests: `
const mutex = makeMutex()
const sharedState = { x: 5 }
let lockedDuringSlowWork = null
function slowCompute(current) {
  lockedDuringSlowWork = mutex.isLocked
  return current * 2
}
assert (readComputeWrite(sharedState, 'x', slowCompute, mutex), true)
assert lockedDuringSlowWork === false
assert sharedState.x === 10
assert mutex.isLocked === false
`,
        solution: `function makeMutex() {
  let locked = false
  return {
    acquire() { locked = true },
    release() { locked = false },
    get isLocked() { return locked },
  }
}
function readComputeWrite(sharedState, key, slowComputeFn, mutex) {
  mutex.acquire()
  const current = sharedState[key]
  mutex.release()
  const computed = slowComputeFn(current)
  mutex.acquire()
  sharedState[key] = computed
  mutex.release()
}`,
      },
    ],
  },
]

export default challenges
