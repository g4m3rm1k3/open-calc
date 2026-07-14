import type { PracticeChallenge } from './loader'

export const title = 'Variables'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'A variable stores a value under a name. Write `createGreeting(name)` that stores `"Hello, " + name` in a variable `message` and returns it.',
        starter: '',
        tests: `
assert createGreeting('Ada') === 'Hello, Ada'
assert createGreeting('Sam') === 'Hello, Sam'
`,
        solution: `function createGreeting(name) {
  const message = 'Hello, ' + name;
  return message;
}`,
      },
      {
        lang: 'typescript',
        prompt: 'A variable stores a value under a name. Write `createGreeting(name)` that stores `"Hello, " + name` in a variable `message` and returns it.',
        starter: '',
        tests: `
assert createGreeting('Ada') === 'Hello, Ada'
assert createGreeting('Sam') === 'Hello, Sam'
`,
        solution: `function createGreeting(name: string): string {
  const message: string = 'Hello, ' + name;
  return message;
}`,
      },
      {
        lang: 'python',
        prompt: 'A variable stores a value under a name. Write `create_greeting(name)` that stores `"Hello, " + name` in a variable `message` and returns it.',
        starter: '',
        tests: `
assert create_greeting('Ada') == 'Hello, Ada'
assert create_greeting('Sam') == 'Hello, Sam'
`,
        solution: `def create_greeting(name):
    message = 'Hello, ' + name
    return message`,
      },
      {
        lang: 'java',
        prompt: 'A variable stores a value under a name. Write `createGreeting(name)` that stores `"Hello, " + name` in a variable `message` and returns it.',
        starter: '',
        tests: `
assert createGreeting("Ada").equals("Hello, Ada")
assert createGreeting("Sam").equals("Hello, Sam")
`,
        solution: `static String createGreeting(String name) {
    String message = "Hello, " + name;
    return message;
}`,
      },
      {
        lang: 'csharp',
        prompt: 'A variable stores a value under a name. Write `CreateGreeting(name)` that stores `"Hello, " + name` in a variable `message` and returns it.',
        starter: '',
        tests: `
assert CreateGreeting("Ada") == "Hello, Ada"
assert CreateGreeting("Sam") == "Hello, Sam"
`,
        solution: `static string CreateGreeting(string name) {
    string message = "Hello, " + name;
    return message;
}`,
      },
      {
        lang: 'cpp',
        prompt: 'A variable stores a value under a name. Write `createGreeting(name)` that stores `"Hello, " + name` in a variable `message` and returns it.',
        starter: '',
        tests: `
assert createGreeting("Ada") == "Hello, Ada"
assert createGreeting("Sam") == "Hello, Sam"
`,
        solution: `std::string createGreeting(std::string name) {
    std::string message = "Hello, " + name;
    return message;
}`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript',
        prompt: 'A variable can be reassigned as a program runs. Finish `runTotal(nums)` so it adds every number in `nums` onto `total`, one at a time, and returns the final value.',
        starter: `function runTotal(nums) {
  let total = 0;
  // TODO: add each number in nums to total
  return total;
}`,
        tests: `
assert runTotal([1, 2, 3]) === 6
assert runTotal([]) === 0
assert runTotal([10, -2, 2]) === 10
`,
        solution: `function runTotal(nums) {
  let total = 0;
  for (const n of nums) {
    total += n;
  }
  return total;
}`,
      },
      {
        lang: 'typescript',
        prompt: 'A variable can be reassigned as a program runs. Finish `runTotal(nums)` so it adds every number in `nums` onto `total`, one at a time, and returns the final value.',
        starter: `function runTotal(nums: number[]): number {
  let total: number = 0;
  // TODO: add each number in nums to total
  return total;
}`,
        tests: `
assert runTotal([1, 2, 3]) === 6
assert runTotal([]) === 0
assert runTotal([10, -2, 2]) === 10
`,
        solution: `function runTotal(nums: number[]): number {
  let total: number = 0;
  for (const n of nums) {
    total += n;
  }
  return total;
}`,
      },
      {
        lang: 'python',
        prompt: 'A variable can be reassigned as a program runs. Finish `run_total(nums)` so it adds every number in `nums` onto `total`, one at a time, and returns the final value.',
        starter: `def run_total(nums):
    total = 0
    # TODO: add each number in nums to total
    return total`,
        tests: `
assert run_total([1, 2, 3]) == 6
assert run_total([]) == 0
assert run_total([10, -2, 2]) == 10
`,
        solution: `def run_total(nums):
    total = 0
    for n in nums:
        total += n
    return total`,
      },
      {
        lang: 'java',
        prompt: 'A variable can be reassigned as a program runs. Finish `runTotal(nums)` so it adds every number in `nums` onto `total`, one at a time, and returns the final value.',
        starter: `static int runTotal(int[] nums) {
    int total = 0;
    // TODO: add each number in nums to total
    return total;
}`,
        tests: `
assert runTotal(new int[]{1, 2, 3}) == 6
assert runTotal(new int[]{}) == 0
assert runTotal(new int[]{10, -2, 2}) == 10
`,
        solution: `static int runTotal(int[] nums) {
    int total = 0;
    for (int n : nums) {
        total += n;
    }
    return total;
}`,
      },
      {
        lang: 'csharp',
        prompt: 'A variable can be reassigned as a program runs. Finish `RunTotal(nums)` so it adds every number in `nums` onto `total`, one at a time, and returns the final value.',
        starter: `static int RunTotal(int[] nums) {
    int total = 0;
    // TODO: add each number in nums to total
    return total;
}`,
        tests: `
assert RunTotal(new int[]{1, 2, 3}) == 6
assert RunTotal(new int[]{}) == 0
assert RunTotal(new int[]{10, -2, 2}) == 10
`,
        solution: `static int RunTotal(int[] nums) {
    int total = 0;
    foreach (int n in nums) {
        total += n;
    }
    return total;
}`,
      },
      {
        lang: 'cpp',
        prompt: 'A variable can be reassigned as a program runs. Finish `runTotal(nums)` so it adds every number in `nums` onto `total`, one at a time, and returns the final value.',
        starter: `int runTotal(std::vector<int> nums) {
    int total = 0;
    // TODO: add each number in nums to total
    return total;
}`,
        tests: `
assert runTotal(std::vector<int>{1, 2, 3}) == 6
assert runTotal(std::vector<int>{}) == 0
assert runTotal(std::vector<int>{10, -2, 2}) == 10
`,
        solution: `int runTotal(std::vector<int> nums) {
    int total = 0;
    for (int n : nums) {
        total += n;
    }
    return total;
}`,
      },
    ],
  },
]

export default challenges
