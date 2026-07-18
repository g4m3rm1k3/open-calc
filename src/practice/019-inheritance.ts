import type { PracticeChallenge } from './loader'

export const title = 'Inheritance'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: "Write `class Animal` with `speak()` returning `'some sound'`, and `class Dog extends Animal` overriding `speak()` to return `'Woof!'`.",
        starter: '',
        tests: `
const d = new Dog()
assert d.speak() === 'Woof!'
assert d instanceof Animal === true
`,
        solution: "class Animal { speak() { return 'some sound'; } }\nclass Dog extends Animal { speak() { return 'Woof!'; } }",
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Finish `class Square extends Shape` with a constructor taking `side` and an `area()` override returning `side * side`.',
        starter: 'class Shape {\n  area() { return 0; }\n}\nclass Square extends Shape {\n  // TODO: constructor(side), and area() returning side*side\n}',
        tests: `
const sq = new Square(4)
assert sq.area() === 16
assert sq instanceof Shape === true
`,
        solution: 'class Shape { area() { return 0; } }\nclass Square extends Shape { constructor(side) { super(); this.side = side; } area() { return this.side * this.side; } }',
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write a three-level chain — `Vehicle` → `Car extends Vehicle` → `SportsCar extends Car` — where each level\'s `describe()` calls `super.describe()` and appends its own text.',
        starter: '',
        tests: `
const sc = new SportsCar()
assert sc.describe() === 'a vehicle, specifically a car, a sports car'
assert sc instanceof Vehicle === true
assert sc instanceof Car === true
`,
        solution: "class Vehicle { describe() { return 'a vehicle'; } }\nclass Car extends Vehicle { describe() { return super.describe() + ', specifically a car'; } }\nclass SportsCar extends Car { describe() { return super.describe() + ', a sports car'; } }",
      },
    ],
  },
]

export default challenges
