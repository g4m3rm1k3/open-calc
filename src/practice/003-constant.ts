import type { PracticeChallenge } from './loader'

export const title = 'Constant'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write a function `circleArea(radius)` that defines a constant `PI = 3.14159` and returns the circle\'s area.',
        starter: '',
        tests: `
assert Math.abs(circleArea(1) - 3.14159) < 0.001
assert Math.abs(circleArea(2) - 12.56636) < 0.001
`,
        solution: 'function circleArea(radius) { const PI = 3.14159; return PI * radius * radius; }',
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Finish `secondsInHours(hours)` — define a constant for the number of seconds per hour, then use it to compute the total.',
        starter: 'function secondsInHours(hours) {\n  // TODO: define a constant for seconds per hour, then use it\n}',
        tests: `
assert secondsInHours(1) === 3600
assert secondsInHours(2) === 7200
assert secondsInHours(0) === 0
`,
        solution: 'function secondsInHours(hours) { const SECONDS_PER_HOUR = 3600; return hours * SECONDS_PER_HOUR; }',
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write a function `convertTemps(celsiusArr)` that converts an array of Celsius values to Fahrenheit, using constants for the conversion factor and offset.',
        starter: '',
        tests: `
assert JSON.stringify(convertTemps([0, 100])) === JSON.stringify([32, 212])
assert JSON.stringify(convertTemps([])) === JSON.stringify([])
`,
        solution: 'function convertTemps(arr) { const FACTOR = 9/5; const OFFSET = 32; return arr.map(c => c * FACTOR + OFFSET); }',
      },
    ],
  },
]

export default challenges
