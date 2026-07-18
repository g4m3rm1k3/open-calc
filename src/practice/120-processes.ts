import type { PracticeChallenge } from './loader'

export const title = 'Processes'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `serializeForIPC(value)` and `deserializeFromIPC(str)` — since separate processes don\'t share memory, data crossing a process boundary must be converted to a plain string first (serialization), then parsed back on the other side.',
        starter: '',
        tests: `
const message = serializeForIPC({n: 5, result: 25})
assert typeof message === 'string'
assert JSON.stringify(deserializeFromIPC(message)) === JSON.stringify({n:5, result:25})
`,
        solution: `function serializeForIPC(value) {
  return JSON.stringify(value)
}
function deserializeFromIPC(str) {
  return JSON.parse(str)
}`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Fix `runInChildProcess(inputData, childFn)`: a real child process can\'t see or modify the parent\'s memory. Pass `childFn` an ISOLATED COPY of `inputData`, so any mutation `childFn` makes never affects the original object back in the parent.',
        starter: 'function runInChildProcess(inputData, childFn) {\n  // TODO: a real child process can\'t see or modify the parent\'s memory —\n  // pass childFn an ISOLATED COPY of inputData, not the same object\n  return childFn(inputData)\n}',
        tests: `
const original = { counter: 0 }
const result = runInChildProcess(original, data => { data.counter = 99; return data.counter })
assert result === 99
assert original.counter === 0
`,
        solution: `function runInChildProcess(inputData, childFn) {
  const isolatedCopy = JSON.parse(JSON.stringify(inputData))
  return childFn(isolatedCopy)
}`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `multiprocessingMap(items, sharedConfig, computeFn)`, calling `computeFn(item, config)` for each item where `config` is a FRESH isolated copy of `sharedConfig` every time — no process may see another process\'s mutations to that config, and the original `sharedConfig` must be untouched afterward.',
        starter: '',
        tests: `
const sharedConfig = { multiplier: 2 }
function compute(item, config) { const before = config.multiplier; config.multiplier = 999; return item * before }
const results = multiprocessingMap([1,2,3], sharedConfig, compute)
assert JSON.stringify(results) === JSON.stringify([2,4,6])
assert sharedConfig.multiplier === 2
`,
        solution: `function multiprocessingMap(items, sharedConfig, computeFn) {
  return items.map(item => {
    const isolatedConfig = JSON.parse(JSON.stringify(sharedConfig))
    return computeFn(item, isolatedConfig)
  })
}`,
      },
    ],
  },
]

export default challenges
