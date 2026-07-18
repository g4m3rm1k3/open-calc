import type { PracticeChallenge } from './loader'

export const title = 'Race Conditions'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `simulateRace(startValue, numThreads)`: `numThreads` threads all read the SAME stale `startValue` before any of them writes back, then each writes `read + 1` in turn — the last write wins, silently losing every increment but one. Return the final counter value.',
        starter: '',
        tests: `
assert simulateRace(0, 2) === 1
assert simulateRace(0, 3) === 1
assert simulateRace(5, 4) === 6
`,
        solution: `function simulateRace(startValue, numThreads) {
  const reads = []
  for (let i = 0; i < numThreads; i++) reads.push(startValue)
  let counter = startValue
  for (const read of reads) counter = read + 1
  return counter
}`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Fix `simulateSequentialIncrements(startValue, times)`: each read must happen IMMEDIATELY before its own write, not be batched with every other read first — batching the reads recreates the exact race-condition bug, silently losing increments. Done correctly, `times` sequential increments must never lose any.',
        starter: 'function simulateSequentialIncrements(startValue, times) {\n  // TODO: each read must happen IMMEDIATELY before its own write, not be\n  // batched with every other read first — batching the reads recreates the\n  // exact race-condition bug, losing increments\n  const reads = []\n  for (let i = 0; i < times; i++) reads.push(startValue)\n  let counter = startValue\n  for (const read of reads) counter = read + 1\n  return counter\n}',
        tests: `
assert simulateSequentialIncrements(0, 5) === 5
`,
        solution: `function simulateSequentialIncrements(startValue, times) {
  let counter = startValue
  for (let i = 0; i < times; i++) {
    const read = counter
    counter = read + 1
  }
  return counter
}`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `countLostIncrements(startValue, numThreads)` — using `simulateRace`, return how many increments were silently lost compared to the CORRECT total (`startValue + numThreads`).',
        starter: '',
        tests: `
assert countLostIncrements(0, 2) === 1
assert countLostIncrements(0, 5) === 4
`,
        solution: `function simulateRace(startValue, numThreads) {
  const reads = []
  for (let i = 0; i < numThreads; i++) reads.push(startValue)
  let counter = startValue
  for (const read of reads) counter = read + 1
  return counter
}
function countLostIncrements(startValue, numThreads) {
  const raced = simulateRace(startValue, numThreads)
  const correct = startValue + numThreads
  return correct - raced
}`,
      },
    ],
  },
]

export default challenges
