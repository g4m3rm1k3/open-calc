import type { PracticeChallenge } from './loader'

export const title = 'Type Conversion'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `parseAge(input)` that converts the string `input` into a number and returns it.',
        starter: '',
        tests: `
assert parseAge('25') === 25
assert parseAge('0') === 0
assert parseAge('100') === 100
`,
        solution: `function parseAge(input) { return Number(input); }`,
      },
      {
        lang: 'typescript',
        prompt: 'Write `parseAge(input)` that converts the string `input` into a number and returns it.',
        starter: '',
        tests: `
assert parseAge('25') === 25
assert parseAge('0') === 0
assert parseAge('100') === 100
`,
        solution: `function parseAge(input: string): number { return Number(input); }`,
      },
      {
        lang: 'python',
        prompt: 'Write `parse_age(input_str)` that converts the string `input_str` into an int and returns it.',
        starter: '',
        tests: `
assert parse_age('25') == 25
assert parse_age('0') == 0
assert parse_age('100') == 100
`,
        solution: `def parse_age(input_str):
    return int(input_str)`,
      },
      {
        lang: 'java',
        prompt: 'Write `parseAge(input)` that converts the String `input` into an int and returns it.',
        starter: '',
        tests: `
assert parseAge("25") == 25
assert parseAge("0") == 0
assert parseAge("100") == 100
`,
        solution: `static int parseAge(String input) {
    return Integer.parseInt(input);
}`,
      },
      {
        lang: 'csharp',
        prompt: 'Write `ParseAge(input)` that converts the string `input` into an int and returns it.',
        starter: '',
        tests: `
assert ParseAge("25") == 25
assert ParseAge("0") == 0
assert ParseAge("100") == 100
`,
        solution: `static int ParseAge(string input) {
    return int.Parse(input);
}`,
      },
      {
        lang: 'cpp',
        prompt: 'Write `parseAge(input)` that converts the string `input` into an int and returns it.',
        starter: '',
        tests: `
assert parseAge("25") == 25
assert parseAge("0") == 0
assert parseAge("100") == 100
`,
        solution: `int parseAge(std::string input) {
    return std::stoi(input);
}`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Finish `describeScore(score)`, converting the number `score` to a string and returning `\'Score: \' + <that string>`.',
        starter: `function describeScore(score) {
  // TODO: convert score to a string and return 'Score: ' + <that string>
}`,
        tests: `
assert describeScore(90) === 'Score: 90'
assert describeScore(0) === 'Score: 0'
assert describeScore(-5) === 'Score: -5'
`,
        solution: `function describeScore(score) {
  return 'Score: ' + String(score);
}`,
      },
      {
        lang: 'typescript',
        prompt: 'Finish `describeScore(score)`, converting the number `score` to a string and returning `\'Score: \' + <that string>`.',
        starter: `function describeScore(score: number): string {
  // TODO: convert score to a string and return 'Score: ' + <that string>
}`,
        tests: `
assert describeScore(90) === 'Score: 90'
assert describeScore(0) === 'Score: 0'
assert describeScore(-5) === 'Score: -5'
`,
        solution: `function describeScore(score: number): string {
  return 'Score: ' + String(score);
}`,
      },
      {
        lang: 'python',
        prompt: 'Finish `describe_score(score)`, converting the int `score` to a string and returning `\'Score: \' + <that string>`.',
        starter: `def describe_score(score):
    # TODO: convert score to a string and return 'Score: ' + <that string>
    pass`,
        tests: `
assert describe_score(90) == 'Score: 90'
assert describe_score(0) == 'Score: 0'
assert describe_score(-5) == 'Score: -5'
`,
        solution: `def describe_score(score):
    return 'Score: ' + str(score)`,
      },
      {
        lang: 'java',
        prompt: 'Finish `describeScore(score)`, converting the int `score` to a String and returning `"Score: " + <that string>`.',
        starter: `static String describeScore(int score) {
    // TODO: convert score to a string and return "Score: " + <that string>
    return "";
}`,
        tests: `
assert describeScore(90).equals("Score: 90")
assert describeScore(0).equals("Score: 0")
assert describeScore(-5).equals("Score: -5")
`,
        solution: `static String describeScore(int score) {
    return "Score: " + Integer.toString(score);
}`,
      },
      {
        lang: 'csharp',
        prompt: 'Finish `DescribeScore(score)`, converting the int `score` to a string and returning `"Score: " + <that string>`.',
        starter: `static string DescribeScore(int score) {
    // TODO: convert score to a string and return "Score: " + <that string>
    return "";
}`,
        tests: `
assert DescribeScore(90) == "Score: 90"
assert DescribeScore(0) == "Score: 0"
assert DescribeScore(-5) == "Score: -5"
`,
        solution: `static string DescribeScore(int score) {
    return "Score: " + score.ToString();
}`,
      },
      {
        lang: 'cpp',
        prompt: 'Finish `describeScore(score)`, converting the int `score` to a string and returning `"Score: " + <that string>`.',
        starter: `std::string describeScore(int score) {
    // TODO: convert score to a string and return "Score: " + <that string>
    return "";
}`,
        tests: `
assert describeScore(90) == "Score: 90"
assert describeScore(0) == "Score: 0"
assert describeScore(-5) == "Score: -5"
`,
        solution: `std::string describeScore(int score) {
    return "Score: " + std::to_string(score);
}`,
      },
    ],
  },
]

export default challenges
