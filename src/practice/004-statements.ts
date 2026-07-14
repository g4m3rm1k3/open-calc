import type { PracticeChallenge } from './loader'

export const title = 'Statements'

// `-program` stdout-grading path — see the NOTE in 001/002: `tests` is always
// graded through the JS harness regardless of variant language.
const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript-program',
        prompt: 'A statement is one complete instruction. Write a program with three statements: store 5, store 10, then print their sum.',
        starter: '',
        tests: `assert output.trim() === '15'`,
        solution: `const a = 5;\nconst b = 10;\nconsole.log(a + b);`,
      },
      {
        lang: 'typescript-program',
        prompt: 'A statement is one complete instruction. Write a program with three statements: store 5, store 10, then print their sum.',
        starter: '',
        tests: `assert output.trim() === '15'`,
        solution: `const a: number = 5;\nconst b: number = 10;\nconsole.log(a + b);`,
      },
      {
        lang: 'python-program',
        prompt: 'A statement is one complete instruction. Write a program with three statements: store 5, store 10, then print their sum.',
        starter: '',
        tests: `assert output.trim() === '15'`,
        solution: `a = 5\nb = 10\nprint(a + b)`,
      },
      {
        lang: 'java-program',
        prompt: 'A statement is one complete instruction. Write a program with three statements: store 5, store 10, then print their sum.',
        starter: '',
        tests: `assert output.trim() === '15'`,
        solution: `int a = 5;\nint b = 10;\nSystem.out.println(a + b);`,
      },
      {
        lang: 'csharp-program',
        prompt: 'A statement is one complete instruction. Write a program with three statements: store 5, store 10, then print their sum.',
        starter: '',
        tests: `assert output.trim() === '15'`,
        solution: `int a = 5;\nint b = 10;\nConsole.WriteLine(a + b);`,
      },
      {
        lang: 'cpp-program',
        prompt: 'A statement is one complete instruction. Write a program with three statements: store 5, store 10, then print their sum.',
        starter: '',
        tests: `assert output.trim() === '15'`,
        solution: `int a = 5;\nint b = 10;\nstd::cout << a + b << std::endl;`,
      },
    ],
  },
]

export default challenges
