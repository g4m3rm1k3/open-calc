import type { PracticeChallenge } from './loader'

export const title = 'Semaphores'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `makeSemaphore(count)` returning `{ acquire(), release(), available }`. `acquire` decrements `available` (throwing if it\'s already `0`); `release` increments it back — up to `count` holders are allowed concurrently, not just one.',
        starter: '',
        tests: `
const sem = makeSemaphore(2)
assert sem.available === 2
assert (sem.acquire(), true)
assert sem.available === 1
assert (sem.acquire(), true)
assert sem.available === 0
let threw = false
try { sem.acquire() } catch (e) { threw = true }
assert threw === true
assert (sem.release(), true)
assert sem.available === 1
`,
        solution: `function makeSemaphore(count) {
  let available = count
  return {
    acquire() {
      if (available <= 0) throw new Error('no slots available')
      available--
    },
    release() { available++ },
    get available() { return available },
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
        prompt: 'Fix `makeSemaphoreN(count)`: `available` must start equal to the FULL `count`, not `count - 1` — an off-by-one at initialization silently caps the semaphore\'s real capacity one below what was requested.',
        starter: 'function makeSemaphoreN(count) {\n  // TODO: available must start equal to count, the full capacity — not one less\n  let available = count - 1\n  return {\n    acquire() {\n      if (available <= 0) throw new Error(\'no slots available\')\n      available--\n    },\n    release() { available++ },\n    get available() { return available },\n  }\n}',
        tests: `
const sem = makeSemaphoreN(3)
assert sem.available === 3
assert (sem.acquire(), true)
assert (sem.acquire(), true)
assert (sem.acquire(), true)
assert sem.available === 0
let threw = false
try { sem.acquire() } catch (e) { threw = true }
assert threw === true
assert (sem.release(), true)
assert sem.available === 1
`,
        solution: `function makeSemaphoreN(count) {
  let available = count
  return {
    acquire() {
      if (available <= 0) throw new Error('no slots available')
      available--
    },
    release() { available++ },
    get available() { return available },
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
        prompt: 'Write `makeSemaphore(count)` (same as level 1). Using a semaphore of `count = 2`, confirm the exact scheduling from the concept\'s Execution section: two acquires succeed immediately, a third is blocked (throws) while both slots are held, and only succeeds once one holder releases.',
        starter: '',
        tests: `
const sem = makeSemaphore(2)
const log = []
assert (sem.acquire(), true)
assert (log.push('A-in'), true)
assert (sem.acquire(), true)
assert (log.push('B-in'), true)
let blocked = false
try { sem.acquire() } catch (e) { blocked = true }
assert blocked === true
assert (sem.release(), true)
assert (log.push('A-out'), true)
assert (sem.acquire(), true)
assert (log.push('C-in'), true)
assert JSON.stringify(log) === JSON.stringify(['A-in','B-in','A-out','C-in'])
assert sem.available === 0
`,
        solution: `function makeSemaphore(count) {
  let available = count
  return {
    acquire() {
      if (available <= 0) throw new Error('no slots available')
      available--
    },
    release() { available++ },
    get available() { return available },
  }
}`,
      },
    ],
  },
]

export default challenges
