import type { PracticeChallenge } from './loader'

export const title = 'Constants'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'A constant is a name bound to a value that never changes. Declare `const MINUTES_PER_HOUR = 60` and write `hoursToMinutes(hours)` that returns `hours * MINUTES_PER_HOUR`.',
        starter: '',
        tests: `
assert hoursToMinutes(2) === 120
assert hoursToMinutes(0) === 0
assert hoursToMinutes(5) === 300
`,
        solution: `const MINUTES_PER_HOUR = 60;
function hoursToMinutes(hours) {
  return hours * MINUTES_PER_HOUR;
}`,
      },
      {
        lang: 'typescript',
        prompt: 'A constant is a name bound to a value that never changes. Declare `const MINUTES_PER_HOUR = 60` and write `hoursToMinutes(hours)` that returns `hours * MINUTES_PER_HOUR`.',
        starter: '',
        tests: `
assert hoursToMinutes(2) === 120
assert hoursToMinutes(0) === 0
assert hoursToMinutes(5) === 300
`,
        solution: `const MINUTES_PER_HOUR: number = 60;
function hoursToMinutes(hours: number): number {
  return hours * MINUTES_PER_HOUR;
}`,
      },
      {
        lang: 'python',
        prompt: 'A constant is a name bound to a value that (by convention) never changes. Declare `MINUTES_PER_HOUR = 60` and write `hours_to_minutes(hours)` that returns `hours * MINUTES_PER_HOUR`.',
        starter: '',
        tests: `
assert hours_to_minutes(2) == 120
assert hours_to_minutes(0) == 0
assert hours_to_minutes(5) == 300
`,
        solution: `MINUTES_PER_HOUR = 60

def hours_to_minutes(hours):
    return hours * MINUTES_PER_HOUR`,
      },
      {
        lang: 'java',
        prompt: 'A constant is a name bound to a value that never changes. Declare `static final int MINUTES_PER_HOUR = 60` and write `hoursToMinutes(hours)` that returns `hours * MINUTES_PER_HOUR`.',
        starter: '',
        tests: `
assert hoursToMinutes(2) == 120
assert hoursToMinutes(0) == 0
assert hoursToMinutes(5) == 300
`,
        solution: `static final int MINUTES_PER_HOUR = 60;
static int hoursToMinutes(int hours) {
    return hours * MINUTES_PER_HOUR;
}`,
      },
      {
        lang: 'csharp',
        prompt: 'A constant is a name bound to a value that never changes. Declare `const int MinutesPerHour = 60` and write `HoursToMinutes(hours)` that returns `hours * MinutesPerHour`.',
        starter: '',
        tests: `
assert HoursToMinutes(2) == 120
assert HoursToMinutes(0) == 0
assert HoursToMinutes(5) == 300
`,
        solution: `const int MinutesPerHour = 60;
static int HoursToMinutes(int hours) {
    return hours * MinutesPerHour;
}`,
      },
      {
        lang: 'cpp',
        prompt: 'A constant is a name bound to a value that never changes. Declare `const int MINUTES_PER_HOUR = 60` and write `hoursToMinutes(hours)` that returns `hours * MINUTES_PER_HOUR`.',
        starter: '',
        tests: `
assert hoursToMinutes(2) == 120
assert hoursToMinutes(0) == 0
assert hoursToMinutes(5) == 300
`,
        solution: `const int MINUTES_PER_HOUR = 60;
int hoursToMinutes(int hours) {
    return hours * MINUTES_PER_HOUR;
}`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Declare `const MAX_ATTEMPTS = 3` and finish `attemptsLeft(used)` so it returns `MAX_ATTEMPTS - used`, but never a value below 0.',
        starter: `const MAX_ATTEMPTS = 3;
function attemptsLeft(used) {
  // TODO: return MAX_ATTEMPTS - used, but never less than 0
}`,
        tests: `
assert attemptsLeft(0) === 3
assert attemptsLeft(2) === 1
assert attemptsLeft(5) === 0
`,
        solution: `const MAX_ATTEMPTS = 3;
function attemptsLeft(used) {
  return Math.max(0, MAX_ATTEMPTS - used);
}`,
      },
      {
        lang: 'typescript',
        prompt: 'Declare `const MAX_ATTEMPTS = 3` and finish `attemptsLeft(used)` so it returns `MAX_ATTEMPTS - used`, but never a value below 0.',
        starter: `const MAX_ATTEMPTS: number = 3;
function attemptsLeft(used: number): number {
  // TODO: return MAX_ATTEMPTS - used, but never less than 0
}`,
        tests: `
assert attemptsLeft(0) === 3
assert attemptsLeft(2) === 1
assert attemptsLeft(5) === 0
`,
        solution: `const MAX_ATTEMPTS: number = 3;
function attemptsLeft(used: number): number {
  return Math.max(0, MAX_ATTEMPTS - used);
}`,
      },
      {
        lang: 'python',
        prompt: 'Declare `MAX_ATTEMPTS = 3` and finish `attempts_left(used)` so it returns `MAX_ATTEMPTS - used`, but never a value below 0.',
        starter: `MAX_ATTEMPTS = 3

def attempts_left(used):
    # TODO: return MAX_ATTEMPTS - used, but never less than 0
    pass`,
        tests: `
assert attempts_left(0) == 3
assert attempts_left(2) == 1
assert attempts_left(5) == 0
`,
        solution: `MAX_ATTEMPTS = 3

def attempts_left(used):
    return max(0, MAX_ATTEMPTS - used)`,
      },
      {
        lang: 'java',
        prompt: 'Declare `static final int MAX_ATTEMPTS = 3` and finish `attemptsLeft(used)` so it returns `MAX_ATTEMPTS - used`, but never a value below 0.',
        starter: `static final int MAX_ATTEMPTS = 3;
static int attemptsLeft(int used) {
    // TODO: return MAX_ATTEMPTS - used, but never less than 0
    return 0;
}`,
        tests: `
assert attemptsLeft(0) == 3
assert attemptsLeft(2) == 1
assert attemptsLeft(5) == 0
`,
        solution: `static final int MAX_ATTEMPTS = 3;
static int attemptsLeft(int used) {
    return Math.max(0, MAX_ATTEMPTS - used);
}`,
      },
      {
        lang: 'csharp',
        prompt: 'Declare `const int MaxAttempts = 3` and finish `AttemptsLeft(used)` so it returns `MaxAttempts - used`, but never a value below 0.',
        starter: `const int MaxAttempts = 3;
static int AttemptsLeft(int used) {
    // TODO: return MaxAttempts - used, but never less than 0
    return 0;
}`,
        tests: `
assert AttemptsLeft(0) == 3
assert AttemptsLeft(2) == 1
assert AttemptsLeft(5) == 0
`,
        solution: `const int MaxAttempts = 3;
static int AttemptsLeft(int used) {
    return Math.Max(0, MaxAttempts - used);
}`,
      },
      {
        lang: 'cpp',
        prompt: 'Declare `const int MAX_ATTEMPTS = 3` and finish `attemptsLeft(used)` so it returns `MAX_ATTEMPTS - used`, but never a value below 0.',
        starter: `const int MAX_ATTEMPTS = 3;
int attemptsLeft(int used) {
    // TODO: return MAX_ATTEMPTS - used, but never less than 0
    return 0;
}`,
        tests: `
assert attemptsLeft(0) == 3
assert attemptsLeft(2) == 1
assert attemptsLeft(5) == 0
`,
        solution: `const int MAX_ATTEMPTS = 3;
int attemptsLeft(int used) {
    return std::max(0, MAX_ATTEMPTS - used);
}`,
      },
    ],
  },
]

export default challenges
