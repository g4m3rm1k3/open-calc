import type { PracticeChallenge } from './loader'

export const title = 'Visitor Pattern'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `Circle` and `Square` classes, each with an `accept(visitor)` method that calls `visitor.visitCircle(this)` or `visitor.visitSquare(this)` respectively. Write `AreaVisitor` with matching `visitCircle`/`visitSquare` methods computing each shape\'s area.',
        starter: '',
        tests: `
const shapes = [new Circle(2), new Square(3)]
const areaVisitor = new AreaVisitor()
const areas = shapes.map(s => s.accept(areaVisitor))
assert Math.abs(areas[0] - Math.PI * 4) < 0.001
assert areas[1] === 9
`,
        solution: `class Circle {
  constructor(radius) { this.radius = radius }
  accept(visitor) { return visitor.visitCircle(this) }
}
class Square {
  constructor(side) { this.side = side }
  accept(visitor) { return visitor.visitSquare(this) }
}
class AreaVisitor {
  visitCircle(circle) { return Math.PI * circle.radius ** 2 }
  visitSquare(square) { return square.side ** 2 }
}`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Finish `PerimeterVisitor`, implementing the SAME `visitCircle`/`visitSquare` shape as `AreaVisitor`, but computing perimeter (`2 * PI * radius` for a circle, `4 * side` for a square) instead of area — with zero changes to `Circle` or `Square`.',
        starter: 'class Circle {\n  constructor(radius) { this.radius = radius }\n  accept(visitor) { return visitor.visitCircle(this) }\n}\nclass Square {\n  constructor(side) { this.side = side }\n  accept(visitor) { return visitor.visitSquare(this) }\n}\nclass PerimeterVisitor {\n  // TODO: visitCircle must return 2 * PI * radius; visitSquare must return 4 * side\n  visitCircle(circle) { return 0 }\n  visitSquare(square) { return 0 }\n}',
        tests: `
const shapes = [new Circle(2), new Square(3)]
const perimeterVisitor = new PerimeterVisitor()
const perimeters = shapes.map(s => s.accept(perimeterVisitor))
assert Math.abs(perimeters[0] - 2 * Math.PI * 2) < 0.001
assert perimeters[1] === 12
`,
        solution: `class Circle {
  constructor(radius) { this.radius = radius }
  accept(visitor) { return visitor.visitCircle(this) }
}
class Square {
  constructor(side) { this.side = side }
  accept(visitor) { return visitor.visitSquare(this) }
}
class PerimeterVisitor {
  visitCircle(circle) { return 2 * Math.PI * circle.radius }
  visitSquare(square) { return 4 * square.side }
}`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Add a `Triangle` shape (`base, height, sideA, sideB, sideC`) with its own `accept(visitor)` calling `visitor.visitTriangle(this)`. Update BOTH `AreaVisitor` (area = `0.5 * base * height`) and `PerimeterVisitor` (perimeter = sum of the three sides) to handle it.',
        starter: '',
        tests: `
const shapes = [new Circle(2), new Square(3), new Triangle(4, 3, 3, 4, 5)]
const areaVisitor = new AreaVisitor()
const perimeterVisitor = new PerimeterVisitor()
const areas = shapes.map(s => s.accept(areaVisitor))
const perimeters = shapes.map(s => s.accept(perimeterVisitor))
assert Math.abs(areas[2] - 6) < 0.001
assert perimeters[2] === 12
`,
        solution: `class Circle {
  constructor(radius) { this.radius = radius }
  accept(visitor) { return visitor.visitCircle(this) }
}
class Square {
  constructor(side) { this.side = side }
  accept(visitor) { return visitor.visitSquare(this) }
}
class Triangle {
  constructor(base, height, sideA, sideB, sideC) {
    this.base = base; this.height = height
    this.sideA = sideA; this.sideB = sideB; this.sideC = sideC
  }
  accept(visitor) { return visitor.visitTriangle(this) }
}
class AreaVisitor {
  visitCircle(circle) { return Math.PI * circle.radius ** 2 }
  visitSquare(square) { return square.side ** 2 }
  visitTriangle(triangle) { return 0.5 * triangle.base * triangle.height }
}
class PerimeterVisitor {
  visitCircle(circle) { return 2 * Math.PI * circle.radius }
  visitSquare(square) { return 4 * square.side }
  visitTriangle(triangle) { return triangle.sideA + triangle.sideB + triangle.sideC }
}`,
      },
    ],
  },
]

export default challenges
