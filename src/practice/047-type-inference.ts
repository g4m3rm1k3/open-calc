import type { PracticeChallenge } from './loader'

export const title = 'Type Inference'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Finish `rectanglePerimeter`. `doubledWidth`/`doubledHeight` need no type annotation — their type is inferred from what\'s assigned to them.',
        starter: `function rectanglePerimeter(width, height) {
  let doubledWidth = width * 2;
  let doubledHeight = height * 2;
  // TODO: return the sum of doubledWidth and doubledHeight
}`,
        tests: `
assert rectanglePerimeter(3, 4) === 14
assert rectanglePerimeter(5, 5) === 20
assert rectanglePerimeter(0, 10) === 20
`,
        solution: `function rectanglePerimeter(width, height) {
  let doubledWidth = width * 2;
  let doubledHeight = height * 2;
  return doubledWidth + doubledHeight;
}`,
      },
      {
        lang: 'typescript',
        prompt: 'Finish `rectanglePerimeter`. `doubledWidth`/`doubledHeight` need no type annotation — TypeScript infers `number` from what\'s assigned to them.',
        starter: `function rectanglePerimeter(width: number, height: number) {
  let doubledWidth = width * 2;
  let doubledHeight = height * 2;
  // TODO: return the sum of doubledWidth and doubledHeight
}`,
        tests: `
assert rectanglePerimeter(3, 4) === 14
assert rectanglePerimeter(5, 5) === 20
assert rectanglePerimeter(0, 10) === 20
`,
        solution: `function rectanglePerimeter(width: number, height: number) {
  let doubledWidth = width * 2;
  let doubledHeight = height * 2;
  return doubledWidth + doubledHeight;
}`,
      },
      {
        lang: 'python',
        prompt: 'Finish `rectangle_perimeter`. `doubled_width`/`doubled_height` carry whatever type their assigned value has — no declaration needed.',
        starter: `def rectangle_perimeter(width, height):
    doubled_width = width * 2
    doubled_height = height * 2
    # TODO: return the sum of doubled_width and doubled_height
    pass`,
        tests: `
assert rectangle_perimeter(3, 4) == 14
assert rectangle_perimeter(5, 5) == 20
assert rectangle_perimeter(0, 10) == 20
`,
        solution: `def rectangle_perimeter(width, height):
    doubled_width = width * 2
    doubled_height = height * 2
    return doubled_width + doubled_height`,
      },
      {
        lang: 'java',
        prompt: 'Finish `rectanglePerimeter`. `var` tells Java to infer `doubledWidth`/`doubledHeight`\'s type (`int`) from what\'s assigned to them.',
        starter: `static int rectanglePerimeter(int width, int height) {
    var doubledWidth = width * 2;
    var doubledHeight = height * 2;
    // TODO: return the sum of doubledWidth and doubledHeight
    return 0;
}`,
        tests: `
assert rectanglePerimeter(3, 4) == 14
assert rectanglePerimeter(5, 5) == 20
assert rectanglePerimeter(0, 10) == 20
`,
        solution: `static int rectanglePerimeter(int width, int height) {
    var doubledWidth = width * 2;
    var doubledHeight = height * 2;
    return doubledWidth + doubledHeight;
}`,
      },
      {
        lang: 'csharp',
        prompt: 'Finish `RectanglePerimeter`. `var` tells C# to infer `doubledWidth`/`doubledHeight`\'s type (`int`) from what\'s assigned to them.',
        starter: `static int RectanglePerimeter(int width, int height) {
    var doubledWidth = width * 2;
    var doubledHeight = height * 2;
    // TODO: return the sum of doubledWidth and doubledHeight
    return 0;
}`,
        tests: `
assert RectanglePerimeter(3, 4) == 14
assert RectanglePerimeter(5, 5) == 20
assert RectanglePerimeter(0, 10) == 20
`,
        solution: `static int RectanglePerimeter(int width, int height) {
    var doubledWidth = width * 2;
    var doubledHeight = height * 2;
    return doubledWidth + doubledHeight;
}`,
      },
      {
        lang: 'cpp',
        prompt: 'Finish `rectanglePerimeter`. `auto` tells C++ to infer `doubledWidth`/`doubledHeight`\'s type (`int`) from what\'s assigned to them.',
        starter: `int rectanglePerimeter(int width, int height) {
    auto doubledWidth = width * 2;
    auto doubledHeight = height * 2;
    // TODO: return the sum of doubledWidth and doubledHeight
    return 0;
}`,
        tests: `
assert rectanglePerimeter(3, 4) == 14
assert rectanglePerimeter(5, 5) == 20
assert rectanglePerimeter(0, 10) == 20
`,
        solution: `int rectanglePerimeter(int width, int height) {
    auto doubledWidth = width * 2;
    auto doubledHeight = height * 2;
    return doubledWidth + doubledHeight;
}`,
      },
    ],
  },
]

export default challenges
