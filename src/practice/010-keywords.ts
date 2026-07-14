import type { PracticeChallenge } from './loader'

export const title = 'Keywords'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Keywords are reserved words with special meaning, like `if`, `else`, and `return`. Write `describeNumber(n)` using them to return `\'negative\'`, `\'zero\'`, or `\'positive\'`.',
        starter: '',
        tests: `
assert describeNumber(-5) === 'negative'
assert describeNumber(0) === 'zero'
assert describeNumber(8) === 'positive'
`,
        solution: `function describeNumber(n) {
  if (n < 0) {
    return 'negative';
  } else if (n === 0) {
    return 'zero';
  } else {
    return 'positive';
  }
}`,
      },
      {
        lang: 'typescript',
        prompt: 'Keywords are reserved words with special meaning, like `if`, `else`, and `return`. Write `describeNumber(n)` using them to return `\'negative\'`, `\'zero\'`, or `\'positive\'`.',
        starter: '',
        tests: `
assert describeNumber(-5) === 'negative'
assert describeNumber(0) === 'zero'
assert describeNumber(8) === 'positive'
`,
        solution: `function describeNumber(n: number): string {
  if (n < 0) {
    return 'negative';
  } else if (n === 0) {
    return 'zero';
  } else {
    return 'positive';
  }
}`,
      },
      {
        lang: 'python',
        prompt: 'Keywords are reserved words with special meaning, like `if`, `elif`, `else`, and `return`. Write `describe_number(n)` using them to return `\'negative\'`, `\'zero\'`, or `\'positive\'`.',
        starter: '',
        tests: `
assert describe_number(-5) == 'negative'
assert describe_number(0) == 'zero'
assert describe_number(8) == 'positive'
`,
        solution: `def describe_number(n):
    if n < 0:
        return 'negative'
    elif n == 0:
        return 'zero'
    else:
        return 'positive'`,
      },
      {
        lang: 'java',
        prompt: 'Keywords are reserved words with special meaning, like `if`, `else`, and `return`. Write `describeNumber(n)` using them to return `"negative"`, `"zero"`, or `"positive"`.',
        starter: '',
        tests: `
assert describeNumber(-5).equals("negative")
assert describeNumber(0).equals("zero")
assert describeNumber(8).equals("positive")
`,
        solution: `static String describeNumber(int n) {
    if (n < 0) {
        return "negative";
    } else if (n == 0) {
        return "zero";
    } else {
        return "positive";
    }
}`,
      },
      {
        lang: 'csharp',
        prompt: 'Keywords are reserved words with special meaning, like `if`, `else`, and `return`. Write `DescribeNumber(n)` using them to return `"negative"`, `"zero"`, or `"positive"`.',
        starter: '',
        tests: `
assert DescribeNumber(-5) == "negative"
assert DescribeNumber(0) == "zero"
assert DescribeNumber(8) == "positive"
`,
        solution: `static string DescribeNumber(int n) {
    if (n < 0) {
        return "negative";
    } else if (n == 0) {
        return "zero";
    } else {
        return "positive";
    }
}`,
      },
      {
        lang: 'cpp',
        prompt: 'Keywords are reserved words with special meaning, like `if`, `else`, and `return`. Write `describeNumber(n)` using them to return `"negative"`, `"zero"`, or `"positive"`.',
        starter: '',
        tests: `
assert describeNumber(-5) == "negative"
assert describeNumber(0) == "zero"
assert describeNumber(8) == "positive"
`,
        solution: `std::string describeNumber(int n) {
    if (n < 0) {
        return "negative";
    } else if (n == 0) {
        return "zero";
    } else {
        return "positive";
    }
}`,
      },
    ],
  },
]

export default challenges
