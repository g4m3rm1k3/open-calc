import type { PracticeChallenge } from './loader'

export const title = 'Event Loop (JavaScript)'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript-program',
        prompt: 'Print `\'start\'`. Create `const timerDone = new Promise(resolve => setTimeout(() => { console.log(\'timeout callback\'); resolve() }, 0))`. Schedule `Promise.resolve().then(() => console.log(\'promise callback\'))`. Print `\'end\'`. Finally `await timerDone` (needed so the program doesn\'t exit before the timer fires) — confirm the print order shows the synchronous code first, then the microtask, then the macrotask.',
        starter: '',
        tests: `
assert output === 'start\\nend\\npromise callback\\ntimeout callback'
`,
        solution: `console.log('start')

const timerDone = new Promise(resolve => setTimeout(() => { console.log('timeout callback'); resolve() }, 0))

Promise.resolve().then(() => console.log('promise callback'))

console.log('end')

await timerDone
`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript-program',
        prompt: 'Fix `delayedDouble`: it schedules `setTimeout(() => { result = n * 2 }, 0)` and then immediately `return result` — but `setTimeout(fn, 0)` NEVER runs "immediately," it always defers until after the current synchronous code finishes, so `result` is still `undefined` at the `return`. Rewrite `delayedDouble` to return a `new Promise(resolve => setTimeout(() => resolve(n * 2), 0))`, and `await` its result at the call site with `console.log(await delayedDouble(5))`.',
        starter: `function delayedDouble(n) {
  let result
  setTimeout(() => {
    result = n * 2
  }, 0)
  return result
}

console.log(delayedDouble(5))
`,
        tests: `
assert output === '10'
`,
        solution: `function delayedDouble(n) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(n * 2)
    }, 0)
  })
}

console.log(await delayedDouble(5))
`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript-program',
        prompt: 'Print `\'A\'`. Create `const done = new Promise(resolve => setTimeout(() => { console.log(\'D (macrotask)\'); resolve() }, 0))`. Schedule TWO separate microtasks: `Promise.resolve().then(() => console.log(\'B (microtask 1)\'))` and `Promise.resolve().then(() => console.log(\'C (microtask 2)\'))`. Finally `await done` — confirm BOTH microtasks fully drain (in the order they were scheduled) before the single macrotask runs, even though two microtasks were queued against just one macrotask.',
        starter: '',
        tests: `
assert output === 'A\\nB (microtask 1)\\nC (microtask 2)\\nD (macrotask)'
`,
        solution: `console.log('A')

const done = new Promise(resolve => setTimeout(() => { console.log('D (macrotask)'); resolve() }, 0))

Promise.resolve().then(() => console.log('B (microtask 1)'))
Promise.resolve().then(() => console.log('C (microtask 2)'))

await done
`,
      },
    ],
  },
]

export default challenges
