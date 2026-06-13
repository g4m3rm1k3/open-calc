# FOUNDATIONS — LAB-035 — TypeScript: Union Types and Discriminated Unions

**Series:** FOUNDATIONS — Part VII: TypeScript Type System
**Environment:** TypeScript playground at typescriptlang.org/play
**Time:** 45–60 minutes.

---

## What You Will Build

A union type, a discriminated union for geometric shapes, a switch statement that TypeScript can exhaustively check, and a demonstration of TypeScript's type narrowing. After this lab you will understand how TypeScript tracks which variant of a union is active, and why adding a new variant to a discriminated union makes TypeScript find every switch that needs updating.

---

## What You Need to Know First

**From LAB-034 (Interfaces):** You know how to define an interface and use structural typing. Discriminated unions are interfaces with a special `kind` field.

**From LAB-015 (Polymorphism):** You know how runtime dispatch works via method overriding. Discriminated unions are the TypeScript alternative for data that is one of a fixed set of shapes — the functional equivalent of a class hierarchy.

---

> **Quick Check — try to answer before reading:**
>
> 1. JavaScript has `typeof` to check types at runtime. Why isn't that enough for TypeScript's purposes?
> 2. What does "exhaustive check" mean in the context of a switch statement?
> 3. When would you prefer a discriminated union over a class hierarchy?
>
> *(Answers at the end of this lab)*

---

## The Lesson

---

### Step 1 — Union Types: A Value That Is One of Several Types

**The code:**

```typescript
type StringOrNumber = string | number;

function formatValue(value: StringOrNumber): string {
  if (typeof value === 'string') {
    return `"${value}"`;       // TypeScript knows: value is string here
  }
  return value.toFixed(2);    // TypeScript knows: value is number here
}

console.log(formatValue('hello'));  // "hello"
console.log(formatValue(3.14159));  // 3.14
```

**The walkthrough:** The `|` operator creates a union — the value is string OR number, never both. Inside the `if (typeof value === 'string')` block, TypeScript **narrows** the type from `StringOrNumber` to just `string`. After the if block, only the `number` case remains. TypeScript uses this narrowed information to allow `.toFixed(2)` on the value — a method that exists on numbers but not strings.

**Type narrowing** is TypeScript's ability to track which variant of a union is active based on runtime checks. `typeof`, `instanceof`, equality checks, and custom type guards all produce narrowing.

---

### Step 2 — The Problem with Plain Objects

```typescript
// Without a discriminant — TypeScript cannot tell which shape this is
type Shape = {
  radius?: number;    // only for circles
  width?: number;     // only for rectangles
  height?: number;    // only for rectangles
  side?: number;      // only for squares
};

function computeArea(shape: Shape): number {
  // TypeScript cannot narrow here — all fields are optional
  // TypeScript cannot tell which case applies
  if (shape.radius !== undefined) {
    return Math.PI * shape.radius ** 2;
  } else if (shape.width !== undefined && shape.height !== undefined) {
    return shape.width * shape.height;
  }
  // What if shape.side is also undefined? Silently returns undefined → NaN at runtime
  return shape.side! ** 2;  // The ! is a lie — shape.side could be undefined
}
```

This approach is fragile. TypeScript cannot guarantee the shape is well-formed. A value `{ radius: 5, width: 10 }` would pass the type check but represents an impossible shape. The `!` (non-null assertion) is a signal that the programmer is overriding TypeScript's safety.

---

### Step 3 — Discriminated Union: A Literal `kind` Field

**The solution:** Give each variant a unique literal string field. TypeScript uses this field to narrow the union to exactly one variant.

```typescript
interface Circle {
  kind: 'circle';       // literal type — exactly the string 'circle', no other value
  radius: number;
}

interface Rectangle {
  kind: 'rectangle';
  width: number;
  height: number;
}

interface Triangle {
  kind: 'triangle';
  base: number;
  height: number;
}

type Shape = Circle | Rectangle | Triangle;
```

**The walkthrough:** The `kind` field is typed as a **literal type** — `'circle'` means the exact string `'circle'`, not just any string. TypeScript can compare `shape.kind === 'circle'` and know with certainty that inside that branch, `shape` is a `Circle` and has a `radius`. The discriminant makes impossible states unrepresentable.

---

### Step 4 — Exhaustive Switch with `never`

```typescript
function computeArea(shape: Shape): number {
  switch (shape.kind) {
    case 'circle':
      return Math.PI * shape.radius ** 2;  // TypeScript: shape is Circle here
    case 'rectangle':
      return shape.width * shape.height;   // TypeScript: shape is Rectangle here
    case 'triangle':
      return 0.5 * shape.base * shape.height;  // TypeScript: shape is Triangle here
    default:
      // This branch is reached only if a new variant was added to Shape
      // but not handled above. TypeScript narrows to 'never' here.
      const exhaustivenessCheck: never = shape;
      throw new Error(`Unhandled shape variant: ${JSON.stringify(exhaustivenessCheck)}`);
  }
}
```

**The walkthrough — what is `never`:**

After all three cases are handled, TypeScript knows that `shape.kind` cannot be `'circle'`, `'rectangle'`, or `'triangle'`. If `Shape` is exactly those three, `shape` in the `default` branch has type `never` — the type that has no values. Assigning it to `never` compiles correctly because `never` is a subtype of everything.

**Now add a new variant:**

```typescript
interface Square {
  kind: 'square';
  side: number;
}

type Shape = Circle | Rectangle | Triangle | Square;  // add Square
```

Immediately, `computeArea` produces a TypeScript error:
`Type 'Square' is not assignable to type 'never'.`

TypeScript found the missing case **at compile time**, before the code runs. The exhaustiveness check converts "forgot to handle a new variant" from a silent runtime bug into a compile error.

**The CS lens — algebraic data types:** Discriminated unions are TypeScript's version of algebraic data types (ADTs), specifically "sum types" (the value is one of a sum of variants). Languages like Haskell, Rust, and Elm have native sum types. TypeScript simulates them with discriminated unions. The `never` exhaustiveness trick is the TypeScript equivalent of Rust's exhaustive `match`.

**The SE lens — making invalid states unrepresentable:** The original `Shape` with optional fields allowed objects like `{ radius: 5, width: 10 }` — a physically impossible shape that would silently produce wrong output. The discriminated union makes this impossible to express: you cannot have `kind: 'circle'` and `width: 10` simultaneously because `Circle` has no `width` field.

---

### Step 5 — Type Narrowing Beyond `typeof`

```typescript
// instanceof narrowing for class instances
class Dog {
  bark() { return 'woof'; }
}
class Cat {
  meow() { return 'meow'; }
}

function makeNoise(animal: Dog | Cat): string {
  if (animal instanceof Dog) {
    return animal.bark();  // narrowed to Dog
  }
  return animal.meow();    // narrowed to Cat (only option left)
}

// Property-presence narrowing with 'in'
interface ApiSuccess { data: unknown; }
interface ApiError   { error: string; }
type ApiResponse = ApiSuccess | ApiError;

function handleResponse(response: ApiResponse): string {
  if ('data' in response) {
    return `Success: ${JSON.stringify(response.data)}`;  // narrowed to ApiSuccess
  }
  return `Error: ${response.error}`;  // narrowed to ApiError
}
```

**The walkthrough:** TypeScript tracks every narrowing check and maintains the narrowed type throughout the relevant scope. After `if ('data' in response)`, TypeScript knows `response` is `ApiSuccess`. In the else branch (or after the if with an early return), it knows `response` is `ApiError`.

**Try it:**

```typescript
const shapes: Shape[] = [
  { kind: 'circle', radius: 5 },
  { kind: 'rectangle', width: 4, height: 6 },
  { kind: 'triangle', base: 3, height: 8 },
];

shapes.forEach(shape => {
  console.log(`${shape.kind}: area = ${computeArea(shape).toFixed(2)}`);
});
// circle: area = 78.54
// rectangle: area = 24.00
// triangle: area = 12.00
```

---

## Connect the Pieces

- **React's `action` types** in reducers are discriminated unions. `{ type: 'INCREMENT' }`, `{ type: 'SET_VALUE', payload: number }` — exactly the same pattern.
- **Rust's `Result<T, E>`** — `Ok(value)` and `Err(error)` — is a discriminated union. TypeScript's `type Result<T, E> = { kind: 'ok'; value: T } | { kind: 'err'; error: E }` is the same concept.
- **GraphQL's union types** are discriminated unions at the API level, with `__typename` as the discriminant — the exact field that TypeScript generates automatically for schema-driven types.

---

## What Breaks Without This

**Adding a new variant without updating the switch — no exhaustiveness check:**

```typescript
// Without the never check:
function computeAreaUnsafe(shape: Shape): number {
  switch (shape.kind) {
    case 'circle': return Math.PI * shape.radius ** 2;
    case 'rectangle': return shape.width * shape.height;
    // triangle and square missing — no error, returns undefined
  }
}

computeAreaUnsafe({ kind: 'triangle', base: 3, height: 4 });  // returns undefined → NaN everywhere
```

The function silently returns `undefined` (TypeScript widens the return type to `number | undefined` but may not warn depending on strictness settings). Without the exhaustiveness check, adding `Square` to `Shape` requires manually searching every switch statement — a maintenance nightmare in a large codebase.

---

## Definition of Done

- [ ] Define a discriminated union `PaymentMethod` with three variants: `'card'` (with `cardNumber: string`), `'cash'`, `'crypto'` (with `walletAddress: string`)
- [ ] Write `processPayment(method: PaymentMethod)` with an exhaustive switch and a `never` default
- [ ] TypeScript reports a compile error when you add a fourth variant without updating the switch
- [ ] You can explain in one sentence what `never` means and why it produces an error when a new variant is added

**Git commit:**

```
git add src/
git commit -m "LAB-035: discriminated unions with literal kind field — never-based exhaustiveness check makes missing-case bugs compile errors"
```

---

## Quick Check Answers

1. **`typeof` only distinguishes `string | number | boolean | function | object | undefined | symbol | bigint`.** It cannot distinguish between two object shapes — `typeof { radius: 5 }` and `typeof { width: 4, height: 6 }` both return `'object'`. Discriminated unions solve this with a literal field that `typeof` cannot provide.
2. **Exhaustive check means every possible variant is handled.** A switch on a discriminated union is exhaustive if every member of the union has a corresponding case. When you handle all variants, the type in the `default` branch is `never`. If you miss one, `default` has a non-`never` type and the `never` assignment produces a compile error.
3. **When the variants are data (not objects with behavior), when the variants are defined externally (you do not control the classes), or when you prefer pattern-matching over polymorphism.** Class hierarchies are better when variants need methods. Discriminated unions are better when the variants are plain data and the behavior lives in functions that process them (functional style).
