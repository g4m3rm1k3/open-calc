import type { PracticeChallenge } from './loader'

export const title = 'Primitive Types'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `isAdult(age)` that takes a number and returns a boolean: `true` if `age >= 18`.',
        starter: '',
        tests: `
assert isAdult(20) === true
assert isAdult(17) === false
assert isAdult(18) === true
`,
        solution: `function isAdult(age) { return age >= 18; }`,
      },
      {
        lang: 'typescript',
        prompt: 'Write `isAdult(age)` that takes a `number` and returns a `boolean`: `true` if `age >= 18`.',
        starter: '',
        tests: `
assert isAdult(20) === true
assert isAdult(17) === false
assert isAdult(18) === true
`,
        solution: `function isAdult(age: number): boolean { return age >= 18; }`,
      },
      {
        lang: 'python',
        prompt: 'Write `is_adult(age)` that takes a number and returns a bool: `True` if `age >= 18`.',
        starter: '',
        tests: `
assert is_adult(20) == True
assert is_adult(17) == False
assert is_adult(18) == True
`,
        solution: `def is_adult(age):
    return age >= 18`,
      },
      {
        lang: 'java',
        prompt: 'Write `isAdult(age)` that takes a primitive `int` and returns a primitive `boolean`: `true` if `age >= 18`.',
        starter: '',
        tests: `
assert isAdult(20) == true
assert isAdult(17) == false
assert isAdult(18) == true
`,
        solution: `static boolean isAdult(int age) { return age >= 18; }`,
      },
      {
        lang: 'csharp',
        prompt: 'Write `IsAdult(age)` that takes a value-type `int` and returns a value-type `bool`: `true` if `age >= 18`.',
        starter: '',
        tests: `
assert IsAdult(20) == true
assert IsAdult(17) == false
assert IsAdult(18) == true
`,
        solution: `static bool IsAdult(int age) { return age >= 18; }`,
      },
      {
        lang: 'cpp',
        prompt: 'Write `isAdult(age)` that takes a primitive `int` and returns a primitive `bool`: `true` if `age >= 18`.',
        starter: '',
        tests: `
assert isAdult(20) == true
assert isAdult(17) == false
assert isAdult(18) == true
`,
        solution: `bool isAdult(int age) { return age >= 18; }`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Finish `isVowel(letter)`, a single-character string, returning true if it is `a`, `e`, `i`, `o`, or `u` (case-insensitive).',
        starter: `function isVowel(letter) {
  // TODO: return true if letter is 'a','e','i','o','u' (case-insensitive)
}`,
        tests: `
assert isVowel('a') === true
assert isVowel('E') === true
assert isVowel('z') === false
`,
        solution: `function isVowel(letter) {
  return 'aeiou'.includes(letter.toLowerCase());
}`,
      },
      {
        lang: 'typescript',
        prompt: 'Finish `isVowel(letter)`, a single-character string, returning true if it is `a`, `e`, `i`, `o`, or `u` (case-insensitive).',
        starter: `function isVowel(letter: string): boolean {
  // TODO: return true if letter is 'a','e','i','o','u' (case-insensitive)
}`,
        tests: `
assert isVowel('a') === true
assert isVowel('E') === true
assert isVowel('z') === false
`,
        solution: `function isVowel(letter: string): boolean {
  return 'aeiou'.includes(letter.toLowerCase());
}`,
      },
      {
        lang: 'python',
        prompt: 'Finish `is_vowel(letter)`, a single-character string, returning True if it is `a`, `e`, `i`, `o`, or `u` (case-insensitive).',
        starter: `def is_vowel(letter):
    # TODO: return True if letter is 'a','e','i','o','u' (case-insensitive)
    pass`,
        tests: `
assert is_vowel('a') == True
assert is_vowel('E') == True
assert is_vowel('z') == False
`,
        solution: `def is_vowel(letter):
    return letter.lower() in 'aeiou'`,
      },
      {
        lang: 'java',
        prompt: 'Finish `isVowel(letter)`, a primitive `char`, returning true if it is `\'a\'`, `\'e\'`, `\'i\'`, `\'o\'`, or `\'u\'` (case-insensitive).',
        starter: `static boolean isVowel(char letter) {
    // TODO: return true if letter is 'a','e','i','o','u' (case-insensitive)
    return false;
}`,
        tests: `
assert isVowel('a') == true
assert isVowel('E') == true
assert isVowel('z') == false
`,
        solution: `static boolean isVowel(char letter) {
    return "aeiou".indexOf(Character.toLowerCase(letter)) >= 0;
}`,
      },
      {
        lang: 'csharp',
        prompt: 'Finish `IsVowel(letter)`, a value-type `char`, returning true if it is `\'a\'`, `\'e\'`, `\'i\'`, `\'o\'`, or `\'u\'` (case-insensitive).',
        starter: `static bool IsVowel(char letter) {
    // TODO: return true if letter is 'a','e','i','o','u' (case-insensitive)
    return false;
}`,
        tests: `
assert IsVowel('a') == true
assert IsVowel('E') == true
assert IsVowel('z') == false
`,
        solution: `static bool IsVowel(char letter) {
    return "aeiou".IndexOf(char.ToLower(letter)) >= 0;
}`,
      },
      {
        lang: 'cpp',
        prompt: 'Finish `isVowel(letter)`, a primitive `char`, returning true if it is `\'a\'`, `\'e\'`, `\'i\'`, `\'o\'`, or `\'u\'` (case-insensitive).',
        starter: `bool isVowel(char letter) {
    // TODO: return true if letter is 'a','e','i','o','u' (case-insensitive)
    return false;
}`,
        tests: `
assert isVowel('a') == true
assert isVowel('E') == true
assert isVowel('z') == false
`,
        solution: `bool isVowel(char letter) {
    char c = letter;
    if (c >= 'A' && c <= 'Z') c = c + ('a' - 'A');
    return c == 'a' || c == 'e' || c == 'i' || c == 'o' || c == 'u';
}`,
      },
    ],
  },
]

export default challenges
