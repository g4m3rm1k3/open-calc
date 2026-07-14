import type { PracticeChallenge } from './loader'

export const title = 'Identifiers'

// An identifier is the name given to a variable, function, class, etc. The
// tests call the exact name the prompt asks for, so picking the right
// identifier is baked into passing at all — not just an implementation detail.
const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'An identifier is the name we give a variable or function. Write a function named exactly `calculateTotalPrice` that takes `price` and `quantity` and returns their product.',
        starter: '',
        tests: `
assert calculateTotalPrice(10, 3) === 30
assert calculateTotalPrice(0, 5) === 0
assert calculateTotalPrice(7, 1) === 7
`,
        solution: `function calculateTotalPrice(price, quantity) {
  return price * quantity;
}`,
      },
      {
        lang: 'typescript',
        prompt: 'An identifier is the name we give a variable or function. Write a function named exactly `calculateTotalPrice` that takes `price` and `quantity` and returns their product.',
        starter: '',
        tests: `
assert calculateTotalPrice(10, 3) === 30
assert calculateTotalPrice(0, 5) === 0
assert calculateTotalPrice(7, 1) === 7
`,
        solution: `function calculateTotalPrice(price: number, quantity: number): number {
  return price * quantity;
}`,
      },
      {
        lang: 'python',
        prompt: 'An identifier is the name we give a variable or function. Write a function named exactly `calculate_total_price` (Python identifiers use snake_case) that takes `price` and `quantity` and returns their product.',
        starter: '',
        tests: `
assert calculate_total_price(10, 3) == 30
assert calculate_total_price(0, 5) == 0
assert calculate_total_price(7, 1) == 7
`,
        solution: `def calculate_total_price(price, quantity):
    return price * quantity`,
      },
      {
        lang: 'java',
        prompt: 'An identifier is the name we give a variable or method. Write a method named exactly `calculateTotalPrice` (Java identifiers use camelCase) that takes `price` and `quantity` and returns their product.',
        starter: '',
        tests: `
assert calculateTotalPrice(10, 3) == 30
assert calculateTotalPrice(0, 5) == 0
assert calculateTotalPrice(7, 1) == 7
`,
        solution: `static int calculateTotalPrice(int price, int quantity) {
    return price * quantity;
}`,
      },
      {
        lang: 'csharp',
        prompt: 'An identifier is the name we give a variable or method. Write a method named exactly `CalculateTotalPrice` (C# methods use PascalCase) that takes `price` and `quantity` and returns their product.',
        starter: '',
        tests: `
assert CalculateTotalPrice(10, 3) == 30
assert CalculateTotalPrice(0, 5) == 0
assert CalculateTotalPrice(7, 1) == 7
`,
        solution: `static int CalculateTotalPrice(int price, int quantity) {
    return price * quantity;
}`,
      },
      {
        lang: 'cpp',
        prompt: 'An identifier is the name we give a variable or function. Write a function named exactly `calculateTotalPrice` that takes `price` and `quantity` and returns their product.',
        starter: '',
        tests: `
assert calculateTotalPrice(10, 3) == 30
assert calculateTotalPrice(0, 5) == 0
assert calculateTotalPrice(7, 1) == 7
`,
        solution: `int calculateTotalPrice(int price, int quantity) {
    return price * quantity;
}`,
      },
    ],
  },
]

export default challenges
