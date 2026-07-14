import type { PracticeChallenge } from './loader'

export const title = 'Comments'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Comments describe code without affecting how it runs. Follow the comment inside `rectangleArea` to complete the function.',
        starter: `function rectangleArea(width, height) {
  // Return width multiplied by height
}`,
        tests: `
assert rectangleArea(3, 4) === 12
assert rectangleArea(5, 1) === 5
assert rectangleArea(0, 9) === 0
`,
        solution: `function rectangleArea(width, height) {
  // Return width multiplied by height
  return width * height;
}`,
      },
      {
        lang: 'typescript',
        prompt: 'Comments describe code without affecting how it runs. Follow the comment inside `rectangleArea` to complete the function.',
        starter: `function rectangleArea(width: number, height: number): number {
  // Return width multiplied by height
}`,
        tests: `
assert rectangleArea(3, 4) === 12
assert rectangleArea(5, 1) === 5
assert rectangleArea(0, 9) === 0
`,
        solution: `function rectangleArea(width: number, height: number): number {
  // Return width multiplied by height
  return width * height;
}`,
      },
      {
        lang: 'python',
        prompt: 'Comments describe code without affecting how it runs. Follow the comment inside `rectangle_area` to complete the function.',
        starter: `def rectangle_area(width, height):
    # Return width multiplied by height
    pass`,
        tests: `
assert rectangle_area(3, 4) == 12
assert rectangle_area(5, 1) == 5
assert rectangle_area(0, 9) == 0
`,
        solution: `def rectangle_area(width, height):
    # Return width multiplied by height
    return width * height`,
      },
      {
        lang: 'java',
        prompt: 'Comments describe code without affecting how it runs. Follow the comment inside `rectangleArea` to complete the method.',
        starter: `static int rectangleArea(int width, int height) {
    // Return width multiplied by height
    return 0;
}`,
        tests: `
assert rectangleArea(3, 4) == 12
assert rectangleArea(5, 1) == 5
assert rectangleArea(0, 9) == 0
`,
        solution: `static int rectangleArea(int width, int height) {
    // Return width multiplied by height
    return width * height;
}`,
      },
      {
        lang: 'csharp',
        prompt: 'Comments describe code without affecting how it runs. Follow the comment inside `RectangleArea` to complete the method.',
        starter: `static int RectangleArea(int width, int height) {
    // Return width multiplied by height
    return 0;
}`,
        tests: `
assert RectangleArea(3, 4) == 12
assert RectangleArea(5, 1) == 5
assert RectangleArea(0, 9) == 0
`,
        solution: `static int RectangleArea(int width, int height) {
    // Return width multiplied by height
    return width * height;
}`,
      },
      {
        lang: 'cpp',
        prompt: 'Comments describe code without affecting how it runs. Follow the comment inside `rectangleArea` to complete the function.',
        starter: `int rectangleArea(int width, int height) {
    // Return width multiplied by height
    return 0;
}`,
        tests: `
assert rectangleArea(3, 4) == 12
assert rectangleArea(5, 1) == 5
assert rectangleArea(0, 9) == 0
`,
        solution: `int rectangleArea(int width, int height) {
    // Return width multiplied by height
    return width * height;
}`,
      },
    ],
  },
]

export default challenges
