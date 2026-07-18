import type { PracticeChallenge } from './loader'

export const title = 'Async, Part 3 — Execution Models Compared'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `runCooperative(tasks)`, where each task is a GENERATOR function — modeling COOPERATIVE multitasking, where a task only yields control at its OWN explicit `yield` points, never forcibly interrupted mid-computation. Run all tasks in round-robin turns: each round, call `.next()` on every still-active task once, collecting yielded values in order, until every task is done. Return the collected log.',
        starter: '',
        tests: `
function* taskA() {
  yield 'A1'
  yield 'A2'
}
function* taskB() {
  yield 'B1'
  yield 'B2'
}
const log = runCooperative([taskA, taskB])
assert JSON.stringify(log) === JSON.stringify(['A1', 'B1', 'A2', 'B2'])
`,
        solution: `function runCooperative(tasks) {
  const active = tasks.map(t => ({ it: t(), done: false }))
  const log = []
  while (active.some(a => !a.done)) {
    for (const a of active) {
      if (a.done) continue
      const { value, done } = a.it.next()
      if (value !== undefined) log.push(value)
      a.done = done
    }
  }
  return log
}`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Fix `runCooperative`: it drains EACH task to full completion (`while (!result.done)`) before ever starting the next one — this is fully SEQUENTIAL, not cooperative concurrency, defeating the entire point of "multiple things making progress over the same time window." Replace it with true round-robin turn-taking: one `.next()` call per active task, per round, cycling through ALL tasks until every one is done.',
        starter: `function runCooperative(tasks) {
  const log = []
  for (const t of tasks) {
    const it = t()
    let result = it.next()
    while (!result.done) {
      log.push(result.value)
      result = it.next()
    }
  }
  return log
}`,
        tests: `
function* taskA() {
  yield 'A1'
  yield 'A2'
}
function* taskB() {
  yield 'B1'
  yield 'B2'
}
const log = runCooperative([taskA, taskB])
assert JSON.stringify(log) === JSON.stringify(['A1', 'B1', 'A2', 'B2'])
`,
        solution: `function runCooperative(tasks) {
  const active = tasks.map(t => ({ it: t(), done: false }))
  const log = []
  while (active.some(a => !a.done)) {
    for (const a of active) {
      if (a.done) continue
      const { value, done } = a.it.next()
      if (value !== undefined) log.push(value)
      a.done = done
    }
  }
  return log
}`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Using the same `runCooperative(tasks)`, generalize it to THREE tasks of UNEVEN length — `taskA` yields 3 times, `taskB` yields once, `taskC` yields twice. Confirm the round-robin log correctly gives each still-active task exactly one turn per round, and tasks that finish early (like `taskB`) simply stop appearing in later rounds while the others continue.',
        starter: '',
        tests: `
function* taskA() { yield 'A1'; yield 'A2'; yield 'A3' }
function* taskB() { yield 'B1' }
function* taskC() { yield 'C1'; yield 'C2' }
const log = runCooperative([taskA, taskB, taskC])
assert JSON.stringify(log) === JSON.stringify(['A1','B1','C1','A2','C2','A3'])
`,
        solution: `function runCooperative(tasks) {
  const active = tasks.map(t => ({ it: t(), done: false }))
  const log = []
  while (active.some(a => !a.done)) {
    for (const a of active) {
      if (a.done) continue
      const { value, done } = a.it.next()
      if (value !== undefined) log.push(value)
      a.done = done
    }
  }
  return log
}`,
      },
    ],
  },
]

export default challenges
