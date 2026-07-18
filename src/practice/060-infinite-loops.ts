import type { PracticeChallenge } from './loader'

export const title = 'Infinite Loops'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: "Write `simulateEventLoop(events)` using `while (true)`, processing events one at a time and `break`ing when it encounters `'STOP'`.",
        starter: '',
        tests: `
assert JSON.stringify(simulateEventLoop(['a','b','STOP','c'])) === JSON.stringify(['a','b'])
`,
        solution: `function simulateEventLoop(events) {
  let i = 0
  const processed = []
  while (true) {
    const event = events[i]
    if (event === 'STOP') break
    processed.push(event)
    i++
  }
  return processed
}`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Finish `retryUntilSuccess(attempts)` using `while (true)`, returning the index of the first `true` in `attempts`, or `-1` once attempts are exhausted.',
        starter: 'function retryUntilSuccess(attempts) {\n  // TODO: while(true) loop -- return the index of the first true, or -1 if none / out of attempts\n}',
        tests: `
assert retryUntilSuccess([false,false,true,false]) === 2
assert retryUntilSuccess([false,false]) === -1
`,
        solution: `function retryUntilSuccess(attempts) {
  let i = 0
  while (true) {
    if (i >= attempts.length) return -1
    if (attempts[i]) return i
    i++
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
        prompt: 'Write `boundedLoop(condition, maxIterations)` — a deliberately unbounded `while (true)` loop, made SAFE by an explicit iteration-count escape hatch — returning `{ finished, count }`.',
        starter: '',
        tests: `
assert JSON.stringify(boundedLoop(n => n < 3, 10)) === JSON.stringify({finished:true,count:3})
assert JSON.stringify(boundedLoop(n => true, 5)) === JSON.stringify({finished:false,count:5})
`,
        solution: `function boundedLoop(condition, maxIterations) {
  let count = 0
  while (true) {
    if (count >= maxIterations) return { finished: false, count }
    if (!condition(count)) return { finished: true, count }
    count++
  }
}`,
      },
    ],
  },
]

export default challenges
