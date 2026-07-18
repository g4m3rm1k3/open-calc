import type { PracticeChallenge } from './loader'

export const title = 'Threads'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `sharedMemoryThread(sharedState, key, computeFn)`, modeling Python\'s shared-memory threading model: it must write `computeFn(key)` directly into `sharedState[key]`, since real threads in the same process share memory directly.',
        starter: '',
        tests: `
const results = {}
assert (sharedMemoryThread(results, 5, n => n * n), true)
assert results[5] === 25
`,
        solution: `function sharedMemoryThread(sharedState, key, computeFn) {
  sharedState[key] = computeFn(key)
}`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Finish `messagePassingWorker(data, computeFn, onMessage)`, modeling Node\'s `worker_threads` model: compute the result, then deliver it by CALLING `onMessage(result)` — a worker communicates by sending a message, not by directly mutating shared state the caller can see.',
        starter: 'function messagePassingWorker(data, computeFn, onMessage) {\n  // TODO: compute the result, then deliver it via onMessage(result) — a\n  // worker communicates by SENDING a message, not by directly mutating\n  // shared state the caller can see\n  return computeFn(data)\n}',
        tests: `
let received = null
assert (messagePassingWorker(5, n => n * n, result => { received = result }), true)
assert received === 25
`,
        solution: `function messagePassingWorker(data, computeFn, onMessage) {
  const result = computeFn(data)
  onMessage(result)
}`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `runWorkersAndCollect(tasks)`, where each task is `{ data, computeFn }`. Return an array of every task\'s result, in order — modeling several independent worker threads each computing their own value without needing to wait on one another.',
        starter: '',
        tests: `
const tasks = [{data:3, computeFn: n => n*n}, {data:4, computeFn: n => n*n}]
assert JSON.stringify(runWorkersAndCollect(tasks)) === JSON.stringify([9,16])
`,
        solution: `function runWorkersAndCollect(tasks) {
  return tasks.map(task => task.computeFn(task.data))
}`,
      },
    ],
  },
]

export default challenges
