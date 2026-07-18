import type { PracticeChallenge } from './loader'

export const title = 'Source Code'

// Same `-program` stdout-grading path as 038-what-is-a-program.ts. NOTE:
// runProgramOutputTest always grades the captured `output` through the
// JAVASCRIPT harness (see testRunner.ts), regardless of which language
// produced it — every `tests` string below must be JS syntax (`===`, not
// Python's `==`/`is`), even for the python/java/csharp/cpp variants.
const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript-program',
        prompt: 'Source code is the literal text of instructions you write, before anything runs it. Write source code that computes `6 * 7` and prints the result.',
        starter: '',
        tests: `assert output.trim() === '42'`,
        solution: `console.log(6 * 7);`,
      },
      {
        lang: 'typescript-program',
        prompt: 'Source code is the literal text of instructions you write, before anything runs it. Write source code that computes `6 * 7` and prints the result.',
        starter: '',
        tests: `assert output.trim() === '42'`,
        solution: `console.log(6 * 7);`,
      },
      {
        lang: 'python-program',
        prompt: 'Source code is the literal text of instructions you write, before anything runs it. Write source code that computes `6 * 7` and prints the result.',
        starter: '',
        tests: `assert output.trim() === '42'`,
        solution: `print(6 * 7)`,
      },
      {
        lang: 'java-program',
        prompt: 'Source code is the literal text of instructions you write, before anything runs it. Write source code that computes `6 * 7` and prints the result.',
        starter: '',
        tests: `assert output.trim() === '42'`,
        solution: `System.out.println(6 * 7);`,
      },
      {
        lang: 'csharp-program',
        prompt: 'Source code is the literal text of instructions you write, before anything runs it. Write source code that computes `6 * 7` and prints the result.',
        starter: '',
        tests: `assert output.trim() === '42'`,
        solution: `Console.WriteLine(6 * 7);`,
      },
      {
        lang: 'cpp-program',
        prompt: 'Source code is the literal text of instructions you write, before anything runs it. Write source code that computes `6 * 7` and prints the result.',
        starter: '',
        tests: `assert output.trim() === '42'`,
        solution: `std::cout << 6 * 7 << std::endl;`,
      },
    ],
  },
]

export default challenges
