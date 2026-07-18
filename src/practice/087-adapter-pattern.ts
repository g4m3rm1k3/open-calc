import type { PracticeChallenge } from './loader'

export const title = 'Adapter Pattern'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `makePrinterAdapter(oldPrinter)` returning `{ print(text) }`, where `print` translates the call into `oldPrinter.oldPrint(text)`.',
        starter: '',
        tests: `
const calls = []
const oldPrinter = { oldPrint(text) { calls.push(text) } }
const adapter = makePrinterAdapter(oldPrinter)
assert (adapter.print('Report ready'), true)
assert calls.length === 1
assert calls[0] === 'Report ready'
`,
        solution: `function makePrinterAdapter(oldPrinter) {
  return {
    print(text) { oldPrinter.oldPrint(text) },
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
        prompt: 'Finish `makeLoggerAdapter(oldLogger)` returning `{ log(msg) }`, where `log` translates the call into `oldLogger.writeLog(msg)` — so any code expecting a `log(msg)` method can use an `oldLogger` that only has `writeLog(msg)`.',
        starter: 'function makeLoggerAdapter(oldLogger) {\n  // TODO: return { log(msg) } that translates log(msg) calls into oldLogger.writeLog(msg)\n  return {\n    log(msg) {},\n  }\n}',
        tests: `
const calls = []
const oldLogger = { writeLog(msg) { calls.push(msg) } }
const adapter = makeLoggerAdapter(oldLogger)
assert (adapter.log('hello'), true)
assert calls.length === 1
assert calls[0] === 'hello'
`,
        solution: `function makeLoggerAdapter(oldLogger) {
  return {
    log(msg) { oldLogger.writeLog(msg) },
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
        prompt: 'Write `makeTemperatureAdapter(oldSensor)` returning `{ readCelsius() }`. `oldSensor` only has `readFahrenheit()`; the adapter must call it and convert the result to Celsius (`(F - 32) * 5/9`).',
        starter: '',
        tests: `
const oldSensor = { readFahrenheit: () => 98.6 }
const adapter = makeTemperatureAdapter(oldSensor)
assert Math.abs(adapter.readCelsius() - 37) < 0.01
`,
        solution: `function makeTemperatureAdapter(oldSensor) {
  return {
    readCelsius() { return (oldSensor.readFahrenheit() - 32) * 5 / 9 },
  }
}`,
      },
    ],
  },
]

export default challenges
