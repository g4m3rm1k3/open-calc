import type { PracticeChallenge } from './loader'

export const title = 'Async, Part 1 — The Problem'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `runTwoBlocking(task1, task2)`, modeling two sequential BLOCKING calls: call `task1()` to completion, THEN call `task2()` to completion, returning `[result1, result2]` — a blocking call never overlaps with the next one, it fully finishes before the next one even starts.',
        starter: '',
        tests: `
let log = []
function task1() { log.push('task1 start'); log.push('task1 end'); return 'A' }
function task2() { log.push('task2 start'); log.push('task2 end'); return 'B' }
const result = runTwoBlocking(task1, task2)
assert JSON.stringify(log) === JSON.stringify(['task1 start', 'task1 end', 'task2 start', 'task2 end'])
assert JSON.stringify(result) === JSON.stringify(['A', 'B'])
`,
        solution: `function runTwoBlocking(task1, task2) {
  const r1 = task1()
  const r2 = task2()
  return [r1, r2]
}`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Fix `runTwoBlocking`: it calls `task2()` BEFORE `task1()` — the reversed order means `task1` (which should run first) actually runs second. Swap the two lines so `task1()` is called first and `task2()` second, matching the intended blocking sequence.',
        starter: `function runTwoBlocking(task1, task2) {
  const r2 = task2()
  const r1 = task1()
  return [r1, r2]
}`,
        tests: `
let log = []
function task1() { log.push('task1 start'); log.push('task1 end'); return 'A' }
function task2() { log.push('task2 start'); log.push('task2 end'); return 'B' }
const result = runTwoBlocking(task1, task2)
assert JSON.stringify(log) === JSON.stringify(['task1 start', 'task1 end', 'task2 start', 'task2 end'])
assert JSON.stringify(result) === JSON.stringify(['A', 'B'])
`,
        solution: `function runTwoBlocking(task1, task2) {
  const r1 = task1()
  const r2 = task2()
  return [r1, r2]
}`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `processQueueBlocking(requests)`, where each `request` is a function. Process each one in order — a blocking call, so each request must FULLY finish (start AND end) before the next one\'s start — collecting and returning every result in an array. This generalizes "sequential blocking calls never overlap" from 2 requests to N, showing why one slow blocking request makes every request behind it wait.',
        starter: '',
        tests: `
let log = []
function makeRequest(name) {
  return () => { log.push(name + ' start'); log.push(name + ' end'); return name }
}
const requests = [makeRequest('r1'), makeRequest('r2'), makeRequest('r3')]
const results = processQueueBlocking(requests)
assert JSON.stringify(log) === JSON.stringify(['r1 start','r1 end','r2 start','r2 end','r3 start','r3 end'])
assert JSON.stringify(results) === JSON.stringify(['r1','r2','r3'])
`,
        solution: `function processQueueBlocking(requests) {
  const results = []
  for (const request of requests) {
    results.push(request())
  }
  return results
}`,
      },
    ],
  },
]

export default challenges
