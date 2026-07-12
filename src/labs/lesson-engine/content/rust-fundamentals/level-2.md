---
series: rust-fundamentals
level: 2
title: Structs, Enums, and Pattern Matching
lang: javascript
---

# Structs, Enums, and Pattern Matching

Every programming language needs a way to define custom data types. Rust has two: **structs** combine multiple named fields into one type (like a record), and **enums** represent a value that is exactly one of several named variants. What makes Rust's approach distinctive is **exhaustive pattern matching** — the compiler guarantees that every variant of an enum is handled everywhere it appears. A missing case is a compile error, not a runtime surprise. By the end of this lesson you will understand the difference between product types and sum types, how to model data that can be "one of several things," and how Rust eliminates null.

## Structs — Product Types

A struct groups related fields together. It is a **product type**: its set of possible values is the product of the possible values of each field.

```javascript
// In real Rust:
//   struct Point { x: f64, y: f64 }
//   struct Circle { center: Point, radius: f64 }
//   let c = Circle { center: Point { x: 0.0, y: 0.0 }, radius: 5.0 }

// In JavaScript we use plain objects — same concept, no type enforcement:
function demonstrateStructs() {
  function makePoint(x, y) {
    return { x, y }
  }

  function makeCircle(center, radius) {
    return { center, radius }
  }

  function circleArea(circle) {
    return Math.PI * circle.radius * circle.radius
  }

  function circlePerimeter(circle) {
    return 2 * Math.PI * circle.radius
  }

  const origin = makePoint(0, 0)
  const c = makeCircle(origin, 5)
  console.log('center:', c.center.x, c.center.y)
  console.log('area:', circleArea(c).toFixed(4))
  console.log('perimeter:', circlePerimeter(c).toFixed(4))
}

demonstrateStructs()
```

```text
center: 0 0
area: 78.5398
perimeter: 31.4159
```

**CS lens:** A struct with fields of types A and B has |A| × |B| possible values — it is the **Cartesian product** of the field types. This is why structs are called product types. A `Point` with two `f64` fields has 2⁶⁴ × 2⁶⁴ possible values. The name comes from type theory, and it appears in every language: C structs, Java classes, TypeScript interfaces, Python dataclasses — all are product types.

## Enums — Sum Types

An enum represents a value that is **exactly one** of several named variants. It is a **sum type**: its total possible values is the sum of each variant's possible values.

```javascript
// In real Rust:
//   enum Shape {
//     Circle(f64),                  // one field: radius
//     Rectangle(f64, f64),          // two fields: width, height
//     Triangle(f64, f64, f64),      // three fields: sides a, b, c
//   }

// We simulate tagged unions in JavaScript:
function makeShape(tag, ...args) {
  return { tag, args }
}

function shapeArea(shape) {
  if (shape.tag === 'Circle') {
    const [radius] = shape.args
    return Math.PI * radius * radius
  }
  if (shape.tag === 'Rectangle') {
    const [width, height] = shape.args
    return width * height
  }
  if (shape.tag === 'Triangle') {
    const [a, b, c] = shape.args
    // Heron's formula
    const s = (a + b + c) / 2
    return Math.sqrt(s * (s - a) * (s - b) * (s - c))
  }
  throw new Error(`unhandled shape: ${shape.tag}`)
}

const shapes = [
  makeShape('Circle', 5),
  makeShape('Rectangle', 4, 6),
  makeShape('Triangle', 3, 4, 5),
]

for (const shape of shapes) {
  console.log(`${shape.tag}: area = ${shapeArea(shape).toFixed(4)}`)
}
```

```text
Circle: area = 78.5398
Rectangle: area = 24.0000
Triangle: area = 6.0000
```

Execution trace for Triangle (3, 4, 5):
```text
s = (3 + 4 + 5) / 2  = 6
area = √(6 × (6-3) × (6-4) × (6-5))
     = √(6 × 3 × 2 × 1)
     = √36
     = 6.0000
```

**CS lens:** An enum with variant A (holding type X) and variant B (holding type Y) has |X| + |Y| possible values — hence **sum type**. This contrasts with a struct of X and Y which has |X| × |Y| values. Sum types are the right model for "this can be one of several things." Many languages only have product types (structs), forcing programmers to encode sums with inheritance or union types — less safe, more verbose.

## Pattern Matching — Exhaustive by Design

Rust's `match` is not just a switch statement. It is a **pattern matching expression** that must handle every variant — the compiler rejects incomplete matches.

```javascript
function demonstratePatternMatching() {
  // Simulating Rust's match: must handle every variant
  function match(shape) {
    const handlers = {
      Circle:    ([r]) => `circle with radius ${r}`,
      Rectangle: ([w, h]) => `${w}×${h} rectangle`,
      Ring:      ([outer, inner]) => `ring: outer ${outer}, inner ${inner}`,
    }

    const handler = handlers[shape.tag]
    if (!handler) {
      // In Rust this would be a compile error, not a runtime error
      throw new Error(`non-exhaustive match: missing case '${shape.tag}'`)
    }
    return handler(shape.args)
  }

  const shapes = [
    makeShape('Circle', 3),
    makeShape('Rectangle', 4, 5),
    makeShape('Ring', 10, 6),
  ]

  for (const shape of shapes) {
    console.log(match(shape))
  }

  // In Rust, adding a new variant to the enum forces you to handle it everywhere:
  try {
    match(makeShape('Hexagon', 4))  // forgot to add the handler
  } catch (e) {
    console.log('Rust compile error equivalent:', e.message)
  }
}

// makeShape defined above — still in scope
const makeShape2 = (tag, ...args) => ({ tag, args })
demonstratePatternMatching()
```

```text
circle with radius 3
4×5 rectangle
ring: outer 10, inner 6
Rust compile error equivalent: non-exhaustive match: missing case 'Hexagon'
```

**SE lens:** Exhaustive matching is a **correctness enforcement mechanism**. When you add a new variant to an enum in Rust, the compiler lists every match expression that needs to be updated. This is the opposite of the Java/JavaScript approach where you add a new subclass or case and hope the existing `if/else if` chains handle it — they often don't, silently. Exhaustive matching turns "forgot to handle this case" from a production bug into a compile error.

## Option — Replacing Null

Rust has no `null`. Instead, it has `Option<T>`, an enum with two variants:

```javascript
// In real Rust:
//   enum Option<T> { Some(T), None }

function demonstrateOption() {
  // Simulating Option<T>
  const Some = value => ({ tag: 'Some', value })
  const None = { tag: 'None' }

  function divide(numerator, denominator) {
    if (denominator === 0) return None
    return Some(numerator / denominator)
  }

  function matchOption(option) {
    if (option.tag === 'Some') return `result: ${option.value}`
    if (option.tag === 'None') return 'division by zero'
    throw new Error('impossible: Option has only two variants')
  }

  console.log(matchOption(divide(10, 2)))
  console.log(matchOption(divide(10, 0)))

  // The key difference from null: you CANNOT forget to check
  // In Rust, calling option.value without matching is a compile error
  // There is no equivalent of JavaScript's null.property → crash
  const result = divide(5, 0)
  console.log('has value?', result.tag === 'Some')
}

demonstrateOption()
```

```text
result: 5
division by zero
has value?: false
```

**CS lens:** Tony Hoare, who invented the null reference in 1965, called it his "billion-dollar mistake" because of the crashes it caused over the following decades. `Option<T>` is the type-theoretically correct solution: absence of a value is encoded as `None`, a legitimate variant of the type. The compiler forces you to handle `None` everywhere an `Option` is used. `NullPointerException` in Java, `TypeError: Cannot read property of null` in JavaScript — neither can exist in safe Rust.

## Common Mistakes

```javascript
function showCommonMistakes() {
  // MISTAKE 1: Treating None like a value
  const None = { tag: 'None' }
  const Some = v => ({ tag: 'Some', value: v })
  const maybeValue = None

  // Wrong: accessing .value without checking
  // console.log(maybeValue.value)  // undefined in JS, compile error in Rust

  // Right: match first
  if (maybeValue.tag === 'Some') {
    console.log('value:', maybeValue.value)
  } else {
    console.log('no value — handle the None case')
  }

  // MISTAKE 2: Incomplete match (adding a variant, forgetting to update matches)
  // In Rust: non_exhaustive match → compile error → caught immediately
  // In JavaScript without discipline: runtime bug → caught in production
  console.log('exhaustive match: compiler finds missing cases at build time')
}

showCommonMistakes()
```

```text
no value — handle the None case
exhaustive match: compiler finds missing cases at build time
```

## Challenge: shape_calculator

Implement a shape area calculator supporting four shape types.

`createShapeCalculator()` — returns an object with:
- `.area(shape)` — `shape` is `{ type: string, ...fields }`; returns the area as a number; throws `'unknown shape'` for unrecognised types

Supported shapes and their fields:
- `{ type: 'circle', radius: number }` — area = π × radius²
- `{ type: 'rectangle', width: number, height: number }` — area = width × height
- `{ type: 'triangle', a: number, b: number, c: number }` — area via Heron's formula: s = (a+b+c)/2; area = √(s(s-a)(s-b)(s-c))
- `{ type: 'ring', outer: number, inner: number }` — area = π × (outer² − inner²)

`Math.PI` is the value of π. `Math.sqrt(n)` returns the square root of n.

```challenge
function createShapeCalculator() {
  return {
    area(shape) {
      return 0
    },
  }
}
```

```test
const calc = createShapeCalculator()
assert Math.abs(calc.area({ type: 'circle', radius: 5 }) - Math.PI * 25) < 0.001
assert calc.area({ type: 'rectangle', width: 4, height: 6 }) === 24
assert Math.abs(calc.area({ type: 'triangle', a: 3, b: 4, c: 5 }) - 6) < 0.001
assert Math.abs(calc.area({ type: 'ring', outer: 5, inner: 3 }) - Math.PI * 16) < 0.001
let threw = false
try { calc.area({ type: 'hexagon', side: 3 }) } catch (e) { threw = true }
assert threw === true
```
