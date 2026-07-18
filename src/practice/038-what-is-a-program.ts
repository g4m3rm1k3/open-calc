import type { PracticeChallenge } from './loader'

export const title = 'What is a Program?'

// A program is a sequence of instructions a computer executes to produce a
// result. No function signature fits yet (functions haven't been introduced
// as a concept), so this grades the whole program's stdout via the
// `<lang>-program` routing in ChallengeStep, not a callable's return value.
const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript-program',
        prompt: 'A program is a sequence of instructions a computer executes. Write a program that prints exactly `Hello, World!`.',
        starter: '',
        tests: `assert output.trim() === 'Hello, World!'`,
        solution: `console.log('Hello, World!');`,
      },
      {
        lang: 'typescript-program',
        prompt: 'A program is a sequence of instructions a computer executes. Write a program that prints exactly `Hello, World!`.',
        starter: '',
        tests: `assert output.trim() === 'Hello, World!'`,
        solution: `console.log('Hello, World!');`,
      },
      {
        lang: 'python-program',
        prompt: 'A program is a sequence of instructions a computer executes. Write a program that prints exactly `Hello, World!`.',
        starter: '',
        tests: `assert output.trim() === 'Hello, World!'`,
        solution: `print('Hello, World!')`,
      },
      {
        lang: 'java-program',
        prompt: 'A program is a sequence of instructions a computer executes. Write a program that prints exactly `Hello, World!`.',
        starter: '',
        tests: `assert output.trim() === 'Hello, World!'`,
        solution: `System.out.println("Hello, World!");`,
      },
      {
        lang: 'csharp-program',
        prompt: 'A program is a sequence of instructions a computer executes. Write a program that prints exactly `Hello, World!`.',
        starter: '',
        tests: `assert output.trim() === 'Hello, World!'`,
        solution: `Console.WriteLine("Hello, World!");`,
      },
      {
        lang: 'cpp-program',
        prompt: 'A program is a sequence of instructions a computer executes. Write a program that prints exactly `Hello, World!`.',
        starter: '',
        tests: `assert output.trim() === 'Hello, World!'`,
        solution: `std::cout << "Hello, World!" << std::endl;`,
      },
    ],
  },
]

export default challenges
