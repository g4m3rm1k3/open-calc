import type { PracticeChallenge } from './loader'

export const title = 'Thread Pools'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `assignWorkers(taskCount, poolSize)` returning an array of worker indices, one per task, assigning task `i` to worker `i % poolSize` — modeling a fixed pool of `poolSize` workers being REUSED across `taskCount` tasks, round-robin.',
        starter: '',
        tests: `
assert JSON.stringify(assignWorkers(5, 2)) === JSON.stringify([0,1,0,1,0])
`,
        solution: `function assignWorkers(taskCount, poolSize) {
  const assignments = []
  for (let i = 0; i < taskCount; i++) assignments.push(i % poolSize)
  return assignments
}`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Fix `countUniqueWorkersUsed(taskCount, poolSize)`: it must count the number of DISTINCT worker indices actually assigned via `assignWorkers` — if there are fewer tasks than `poolSize`, not every worker in the pool ends up being used.',
        starter: 'function assignWorkers(taskCount, poolSize) {\n  const assignments = []\n  for (let i = 0; i < taskCount; i++) assignments.push(i % poolSize)\n  return assignments\n}\nfunction countUniqueWorkersUsed(taskCount, poolSize) {\n  // TODO: count the number of DISTINCT worker indices actually assigned —\n  // if there are fewer tasks than poolSize, not every worker gets used\n  return poolSize\n}',
        tests: `
assert countUniqueWorkersUsed(5, 2) === 2
assert countUniqueWorkersUsed(1, 2) === 1
`,
        solution: `function assignWorkers(taskCount, poolSize) {
  const assignments = []
  for (let i = 0; i < taskCount; i++) assignments.push(i % poolSize)
  return assignments
}
function countUniqueWorkersUsed(taskCount, poolSize) {
  return new Set(assignWorkers(taskCount, poolSize)).size
}`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `runTaskPool(tasks, poolSize)` returning `{ results, workerLog }` — `results` is every task\'s return value (in order), `workerLog` is which worker index (round-robin, `i % poolSize`) handled each task. Confirm all tasks complete correctly while only `poolSize` distinct workers were ever used.',
        starter: '',
        tests: `
const tasks = [1,2,3,4,5].map(n => () => n * n)
const { results, workerLog } = runTaskPool(tasks, 2)
assert JSON.stringify(results) === JSON.stringify([1,4,9,16,25])
assert JSON.stringify(workerLog) === JSON.stringify([0,1,0,1,0])
assert new Set(workerLog).size === 2
`,
        solution: `function runTaskPool(tasks, poolSize) {
  const results = tasks.map(task => task())
  const workerLog = tasks.map((_, i) => i % poolSize)
  return { results, workerLog }
}`,
      },
    ],
  },
]

export default challenges
