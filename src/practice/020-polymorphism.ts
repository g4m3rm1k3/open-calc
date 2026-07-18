import type { PracticeChallenge } from './loader'

export const title = 'Polymorphism'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `class Circle` and `class Square`, each with its own `area()`, plus a function `totalArea(shapes)` that sums `.area()` across a mixed array — without checking each shape\'s concrete type.',
        starter: '',
        tests: `
const shapes = [new Square(2), new Square(3)]
assert totalArea(shapes) === 13
`,
        solution: "class Circle { constructor(r) { this.r = r; } area() { return Math.PI * this.r * this.r; } }\nclass Square { constructor(s) { this.s = s; } area() { return this.s * this.s; } }\nfunction totalArea(shapes) { return shapes.reduce((sum, s) => sum + s.area(), 0); }",
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Finish `speakAll(animals)` so it calls `.speak()` on each animal polymorphically and returns the results as an array.',
        starter: 'function speakAll(animals) {\n  // TODO: call .speak() on each animal, polymorphically\n}',
        tests: `
const animals = [{ speak: () => 'Meow' }, { speak: () => 'Woof' }]
assert JSON.stringify(speakAll(animals)) === JSON.stringify(['Meow', 'Woof'])
`,
        solution: "class Cat { speak() { return 'Meow'; } }\nclass Dog { speak() { return 'Woof'; } }\nfunction speakAll(animals) { return animals.map(a => a.speak()); }",
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `class Circle` and `class Square`, each with `area()`, plus `largestArea(shapes)` returning the largest area across a mixed array of both.',
        starter: '',
        tests: `
const shapes = [new Square(2), new Circle(1)]
assert Math.abs(largestArea(shapes) - 4) < 0.001
`,
        solution: "class Circle { constructor(r) { this.r = r; } area() { return Math.PI * this.r * this.r; } }\nclass Square { constructor(s) { this.s = s; } area() { return this.s * this.s; } }\nfunction largestArea(shapes) { return Math.max(...shapes.map(s => s.area())); }",
      },
    ],
  },
]

export default challenges
