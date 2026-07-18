import type { PracticeChallenge } from './loader'

export const title = 'Assignment'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Assignment stores a value in a variable. Write `celsiusToFahrenheit(celsius)`, reassigning a variable `f` step by step: start it at `celsius`, then multiply by `9/5`, then add `32`.',
        starter: '',
        tests: `
assert celsiusToFahrenheit(0) === 32
assert celsiusToFahrenheit(100) === 212
assert celsiusToFahrenheit(-40) === -40
`,
        solution: `function celsiusToFahrenheit(celsius) {
  let f = celsius;
  f = f * 9 / 5;
  f = f + 32;
  return f;
}`,
      },
      {
        lang: 'typescript',
        prompt: 'Assignment stores a value in a variable. Write `celsiusToFahrenheit(celsius)`, reassigning a variable `f` step by step: start it at `celsius`, then multiply by `9/5`, then add `32`.',
        starter: '',
        tests: `
assert celsiusToFahrenheit(0) === 32
assert celsiusToFahrenheit(100) === 212
assert celsiusToFahrenheit(-40) === -40
`,
        solution: `function celsiusToFahrenheit(celsius: number): number {
  let f: number = celsius;
  f = f * 9 / 5;
  f = f + 32;
  return f;
}`,
      },
      {
        lang: 'python',
        prompt: 'Assignment stores a value in a variable. Write `celsius_to_fahrenheit(celsius)`, reassigning a variable `f` step by step: start it at `celsius`, then multiply by `9/5`, then add `32`.',
        starter: '',
        tests: `
assert celsius_to_fahrenheit(0) == 32
assert celsius_to_fahrenheit(100) == 212
assert celsius_to_fahrenheit(-40) == -40
`,
        solution: `def celsius_to_fahrenheit(celsius):
    f = celsius
    f = f * 9 / 5
    f = f + 32
    return f`,
      },
      {
        lang: 'java',
        prompt: 'Assignment stores a value in a variable. Write `celsiusToFahrenheit(celsius)`, reassigning a variable `f` step by step: start it at `celsius`, then multiply by `9/5`, then add `32`.',
        starter: '',
        tests: `
assert celsiusToFahrenheit(0) == 32
assert celsiusToFahrenheit(100) == 212
assert celsiusToFahrenheit(-40) == -40
`,
        solution: `static int celsiusToFahrenheit(int celsius) {
    int f = celsius;
    f = f * 9 / 5;
    f = f + 32;
    return f;
}`,
      },
      {
        lang: 'csharp',
        prompt: 'Assignment stores a value in a variable. Write `CelsiusToFahrenheit(celsius)`, reassigning a variable `f` step by step: start it at `celsius`, then multiply by `9/5`, then add `32`.',
        starter: '',
        tests: `
assert CelsiusToFahrenheit(0) == 32
assert CelsiusToFahrenheit(100) == 212
assert CelsiusToFahrenheit(-40) == -40
`,
        solution: `static int CelsiusToFahrenheit(int celsius) {
    int f = celsius;
    f = f * 9 / 5;
    f = f + 32;
    return f;
}`,
      },
      {
        lang: 'cpp',
        prompt: 'Assignment stores a value in a variable. Write `celsiusToFahrenheit(celsius)`, reassigning a variable `f` step by step: start it at `celsius`, then multiply by `9/5`, then add `32`.',
        starter: '',
        tests: `
assert celsiusToFahrenheit(0) == 32
assert celsiusToFahrenheit(100) == 212
assert celsiusToFahrenheit(-40) == -40
`,
        solution: `int celsiusToFahrenheit(int celsius) {
    int f = celsius;
    f = f * 9 / 5;
    f = f + 32;
    return f;
}`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Finish `trackMax(nums)` so it reassigns `best` whenever a later number is larger, then returns the final value.',
        starter: `function trackMax(nums) {
  let best = nums[0];
  // TODO: reassign best whenever a later number is larger
  return best;
}`,
        tests: `
assert trackMax([3, 7, 2]) === 7
assert trackMax([5]) === 5
assert trackMax([-1, -9, -3]) === -1
`,
        solution: `function trackMax(nums) {
  let best = nums[0];
  for (const n of nums) {
    if (n > best) {
      best = n;
    }
  }
  return best;
}`,
      },
      {
        lang: 'typescript',
        prompt: 'Finish `trackMax(nums)` so it reassigns `best` whenever a later number is larger, then returns the final value.',
        starter: `function trackMax(nums: number[]): number {
  let best: number = nums[0];
  // TODO: reassign best whenever a later number is larger
  return best;
}`,
        tests: `
assert trackMax([3, 7, 2]) === 7
assert trackMax([5]) === 5
assert trackMax([-1, -9, -3]) === -1
`,
        solution: `function trackMax(nums: number[]): number {
  let best: number = nums[0];
  for (const n of nums) {
    if (n > best) {
      best = n;
    }
  }
  return best;
}`,
      },
      {
        lang: 'python',
        prompt: 'Finish `track_max(nums)` so it reassigns `best` whenever a later number is larger, then returns the final value.',
        starter: `def track_max(nums):
    best = nums[0]
    # TODO: reassign best whenever a later number is larger
    return best`,
        tests: `
assert track_max([3, 7, 2]) == 7
assert track_max([5]) == 5
assert track_max([-1, -9, -3]) == -1
`,
        solution: `def track_max(nums):
    best = nums[0]
    for n in nums:
        if n > best:
            best = n
    return best`,
      },
      {
        lang: 'java',
        prompt: 'Finish `trackMax(nums)` so it reassigns `best` whenever a later number is larger, then returns the final value.',
        starter: `static int trackMax(int[] nums) {
    int best = nums[0];
    // TODO: reassign best whenever a later number is larger
    return best;
}`,
        tests: `
assert trackMax(new int[]{3, 7, 2}) == 7
assert trackMax(new int[]{5}) == 5
assert trackMax(new int[]{-1, -9, -3}) == -1
`,
        solution: `static int trackMax(int[] nums) {
    int best = nums[0];
    for (int n : nums) {
        if (n > best) {
            best = n;
        }
    }
    return best;
}`,
      },
      {
        lang: 'csharp',
        prompt: 'Finish `TrackMax(nums)` so it reassigns `best` whenever a later number is larger, then returns the final value.',
        starter: `static int TrackMax(int[] nums) {
    int best = nums[0];
    // TODO: reassign best whenever a later number is larger
    return best;
}`,
        tests: `
assert TrackMax(new int[]{3, 7, 2}) == 7
assert TrackMax(new int[]{5}) == 5
assert TrackMax(new int[]{-1, -9, -3}) == -1
`,
        solution: `static int TrackMax(int[] nums) {
    int best = nums[0];
    foreach (int n in nums) {
        if (n > best) {
            best = n;
        }
    }
    return best;
}`,
      },
      {
        lang: 'cpp',
        prompt: 'Finish `trackMax(nums)` so it reassigns `best` whenever a later number is larger, then returns the final value.',
        starter: `int trackMax(std::vector<int> nums) {
    int best = nums[0];
    // TODO: reassign best whenever a later number is larger
    return best;
}`,
        tests: `
assert trackMax(std::vector<int>{3, 7, 2}) == 7
assert trackMax(std::vector<int>{5}) == 5
assert trackMax(std::vector<int>{-1, -9, -3}) == -1
`,
        solution: `int trackMax(std::vector<int> nums) {
    int best = nums[0];
    for (int n : nums) {
        if (n > best) {
            best = n;
        }
    }
    return best;
}`,
      },
    ],
  },
]

export default challenges
