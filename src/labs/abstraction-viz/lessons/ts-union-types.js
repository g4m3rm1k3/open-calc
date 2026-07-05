export default {
  id: 'ts-union-types',
  title: 'Union Types & Type Guards',
  tag: 'TypeScript',
  lang: 'ts',
  steps: [
    {
      title: 'Union type — a value that can be one of several types',
      code:
`type StringOrNumber = string | number

function printLength(value: StringOrNumber): void {
  if (typeof value === 'string') {
    console.log(value.length)
  } else {
    console.log(value.toString().length)
  }
}

printLength('hello')
printLength(12345)`,
      runCode:
`function printLength(value) {
  if (typeof value === 'string') {
    console.log(value.length)
  } else {
    console.log(value.toString().length)
  }
}

printLength('hello')
printLength(12345)`,
      explanation: [
        '`type StringOrNumber = string | number` declares a union type — a value that can be either a `string` OR a `number`. `printLength(\'hello\')` passes a string: `typeof value === \'string\'` is true, `value.length` is `5`. `printLength(12345)` passes a number: the else branch runs, `(12345).toString().length` is `5`. Both lines print `5`.',
        'CS — A union type is the type-theoretic union of two or more types. A value of type `A | B` can hold any value valid for `A` or any value valid for `B`. The TypeScript compiler tracks which branch of a conditional runs and narrows the type accordingly: inside `if (typeof value === \'string\')`, TypeScript knows `value` is `string`, not `string | number`.',
        'SE — Union types are used everywhere: `string | null` for nullable strings (instead of `undefined` or `null` leaking into type signatures), `\'success\' | \'error\' | \'pending\'` for status enums, `number | string` for IDs that can be either. React\'s `ReactNode = ReactChild | ReactFragment | ReactPortal | boolean | null | undefined` is a union. DOM\'s `EventTarget | null` is a union. Discriminated unions power Redux action types.',
        'Without this: without union types, you\'d use `any` for "string or number" — losing all type checking. TypeScript would allow `.length` on a number (which doesn\'t exist), and the error would only surface at runtime. Union types let the compiler prove at build time that every branch handles its type correctly.',
      ],
      active: [
        { startLine: 1,  endLine: 1,  color: 'indigo',  label: 'type alias — string | number union' },
        { startLine: 4,  endLine: 7,  color: 'violet',  label: 'typeof guard — narrows the type in each branch' },
        { startLine: 11, endLine: 12, color: 'emerald', label: 'printLength("hello") → 5; printLength(12345) → 5' },
      ],
      connections: [],
    },
    {
      title: 'Discriminated union — a shared tag field',
      code:
`type Circle = {
  kind: 'circle'
  radius: number
}

type Rectangle = {
  kind: 'rectangle'
  width:  number
  height: number
}

type Shape = Circle | Rectangle

function area(shape: Shape): number {
  if (shape.kind === 'circle') {
    return Math.PI * shape.radius * shape.radius
  }
  return shape.width * shape.height
}

const c: Circle    = { kind: 'circle',    radius: 5       }
const r: Rectangle = { kind: 'rectangle', width: 4, height: 6 }
console.log(area(c).toFixed(2))
console.log(area(r))`,
      runCode:
`function area(shape) {
  if (shape.kind === 'circle') {
    return Math.PI * shape.radius * shape.radius
  }
  return shape.width * shape.height
}

var c = { kind: 'circle',    radius: 5 }
var r = { kind: 'rectangle', width: 4, height: 6 }
console.log(area(c).toFixed(2))
console.log(area(r))`,
      explanation: [
        'Each type in the union has a literal `kind` field (`\'circle\'` or `\'rectangle\'`). Checking `shape.kind === \'circle\'` narrows the type to `Circle` — TypeScript knows `shape.radius` exists and `shape.width/height` does not. The else branch is narrowed to `Rectangle`. `area(c)` = π × 25 ≈ 78.54. Line 23 prints `\'78.54\'`. `area(r)` = 4 × 6 = 24. Line 24 prints `24`.',
        'CS — A discriminated union is a tagged union or sum type — a type with a tag field that identifies which variant is active. This is the core algebraic data type from functional programming. TypeScript infers the correct variant from the tag check and removes impossible property accesses statically. If `shape.width` were accessed in the `\'circle\'` branch, TypeScript would error at compile time.',
        'SE — Redux action types are discriminated unions: `{ type: \'INCREMENT\' } | { type: \'DECREMENT\', amount: number }`. The `switch (action.type)` is the discriminant. TypeScript\'s exhaustiveness checking (`never` type in the default case) ensures every variant is handled — if you add a new action type to the union and forget to handle it, the compiler flags the missing case. React\'s `useReducer` pattern relies on this.',
        'Without this: without the discriminant field, you\'d check `instanceof Circle` (requires classes, not plain objects) or optional field presence (`if (\'radius\' in shape)`). Discriminated unions are the idiomatic TypeScript approach — they work with plain objects, destructuring, and switch statements, without requiring class instances.',
      ],
      active: [
        { startLine: 1,  endLine: 11, color: 'indigo',  label: 'Circle + Rectangle — each has a kind discriminant' },
        { startLine: 15, endLine: 18, color: 'violet',  label: 'kind check — narrows to Circle or Rectangle' },
        { startLine: 21, endLine: 24, color: 'emerald', label: 'circle area ≈ 78.54, rectangle area = 24' },
      ],
      connections: [{ fromLine: 15, toLine: 2, color: 'violet', label: 'kind === "circle" → TypeScript knows it\'s Circle' }],
    },
    {
      title: 'instanceof guard — narrowing class instances',
      code:
`type Circle = { kind: 'circle'; radius: number }
type Rectangle = { kind: 'rectangle'; width: number; height: number }
type Shape = Circle | Rectangle

function area(shape: Shape): number {
  if (shape.kind === 'circle') return Math.PI * shape.radius * shape.radius
  return shape.width * shape.height
}

class ApiError extends Error {
  statusCode: number
  constructor(message: string, statusCode: number) {
    super(message)
    this.statusCode = statusCode
  }
}

class ValidationError extends Error {
  field: string
  constructor(message: string, field: string) {
    super(message)
    this.field = field
  }
}

function handleError(err: ApiError | ValidationError): string {
  if (err instanceof ApiError) {
    return 'HTTP ' + err.statusCode + ': ' + err.message
  }
  return 'Validation failed on "' + err.field + '": ' + err.message
}

const api = new ApiError('Not Found', 404)
const val = new ValidationError('too short', 'username')
console.log(handleError(api))
console.log(handleError(val))`,
      runCode:
`class ApiError {
  constructor(message, statusCode) {
    this.message = message
    this.statusCode = statusCode
  }
}

class ValidationError {
  constructor(message, field) {
    this.message = message
    this.field = field
  }
}

function handleError(err) {
  if (err instanceof ApiError) {
    return 'HTTP ' + err.statusCode + ': ' + err.message
  }
  return 'Validation failed on "' + err.field + '": ' + err.message
}

var api = new ApiError('Not Found', 404)
var val = new ValidationError('too short', 'username')
console.log(handleError(api))
console.log(handleError(val))`,
      explanation: [
        '`err instanceof ApiError` is a type guard for class instances. Inside the `if` branch, TypeScript narrows `err` from `ApiError | ValidationError` to `ApiError` — `err.statusCode` is accessible. Outside the branch, TypeScript knows it must be `ValidationError` — `err.field` is accessible. Line 34 prints `\'HTTP 404: Not Found\'`. Line 35 prints `\'Validation failed on "username": too short\'`.',
        'CS — `instanceof` traverses the prototype chain, checking if `ApiError.prototype` appears anywhere. TypeScript uses this runtime check as a compile-time narrowing guarantee: if `instanceof ApiError` returns true, all of `ApiError`\'s properties are guaranteed present. This bidirectional contract (runtime check ↔ compile-time narrowing) is what makes type guards powerful.',
        'SE — Error class hierarchies are a standard pattern: `BaseError → HttpError → NotFoundError`, `BaseError → ValidationError → FieldError`. Express error middleware uses `instanceof`: `if (err instanceof HttpError) res.status(err.statusCode)`. Sequelize throws `ValidationError | UniqueConstraintError | DatabaseError` — `instanceof` routing in the catch block handles each case. TypeScript makes this pattern airtight.',
        'Without this: without `instanceof` narrowing, accessing `err.statusCode` on an `ApiError | ValidationError` union produces a TypeScript error — `statusCode` doesn\'t exist on `ValidationError`. The guard is the proof that the compiler needs before allowing the access. Without it, you\'d use `(err as ApiError).statusCode` — a type assertion that bypasses safety.',
      ],
      active: [
        { startLine: 10, endLine: 23, color: 'indigo',  label: 'two Error subclasses — ApiError + ValidationError' },
        { startLine: 26, endLine: 29, color: 'violet',  label: 'instanceof guard — narrows union to correct class' },
        { startLine: 33, endLine: 35, color: 'emerald', label: 'HTTP 404 / validation failed on username' },
      ],
      connections: [],
    },
    {
      title: 'Custom type guard — user-defined narrowing',
      code:
`type Circle = { kind: 'circle'; radius: number }
type Rectangle = { kind: 'rectangle'; width: number; height: number }
type Shape = Circle | Rectangle

function area(shape: Shape): number {
  if (shape.kind === 'circle') return Math.PI * shape.radius * shape.radius
  return shape.width * shape.height
}

class ApiError extends Error {
  statusCode: number
  constructor(message: string, statusCode: number) { super(message); this.statusCode = statusCode }
}

class ValidationError extends Error {
  field: string
  constructor(message: string, field: string) { super(message); this.field = field }
}

function handleError(err: ApiError | ValidationError): string {
  if (err instanceof ApiError) return 'HTTP ' + err.statusCode + ': ' + err.message
  return 'Validation failed on "' + err.field + '": ' + err.message
}

type StringInput  = { type: 'text'; value: string  }
type NumberInput  = { type: 'number'; value: number }
type FormInput    = StringInput | NumberInput

function isStringInput(input: FormInput): input is StringInput {
  return input.type === 'text'
}

function processInput(input: FormInput): string {
  if (isStringInput(input)) {
    return input.value.toUpperCase()
  }
  return input.value.toFixed(2)
}

const t: StringInput = { type: 'text',   value: 'hello' }
const n: NumberInput = { type: 'number', value: 3.14159 }
console.log(processInput(t))
console.log(processInput(n))`,
      runCode:
`function isStringInput(input) {
  return input.type === 'text'
}

function processInput(input) {
  if (isStringInput(input)) {
    return input.value.toUpperCase()
  }
  return input.value.toFixed(2)
}

var t = { type: 'text',   value: 'hello' }
var n = { type: 'number', value: 3.14159 }
console.log(processInput(t))
console.log(processInput(n))`,
      explanation: [
        '`isStringInput(input): input is StringInput` is a user-defined type guard. The return type `input is StringInput` tells TypeScript: "if this function returns `true`, narrow `input` to `StringInput`." Inside the `if (isStringInput(input))` block, TypeScript knows `input.value` is `string` — `.toUpperCase()` is valid. In the else, `input.value` is `number` — `.toFixed()` is valid. Line 41 prints `\'HELLO\'`. Line 42 prints `\'3.14\'`.',
        'CS — A predicate function with return type `x is T` is a type predicate. The function must return a boolean. TypeScript trusts your predicate — if you write `function isString(x: any): x is string { return typeof x === \'number\' }`, you\'ve lied to the compiler and will get runtime errors. The predicate is your type-narrowing contract: you prove the shape, TypeScript trusts it.',
        'SE — Type predicates are used when `typeof` and `instanceof` are not specific enough. Zod\'s `.safeParse()` returns `{ success: true; data: T } | { success: false; error: ZodError }` — `result.success` is the discriminant. A type predicate `function isSuccess<T>(r): r is { success: true; data: T }` lets callers access `result.data` after the guard. React Query uses similar patterns for `isError`, `isLoading`, `isSuccess` state.',
        'Without this: without a type predicate, `isStringInput` just returns a boolean — TypeScript doesn\'t know what the boolean means for the type. After `if (isStringInput(input))`, `input` is still `FormInput`, not `StringInput`. Calling `input.value.toUpperCase()` would error because `number.toUpperCase` doesn\'t exist. The `input is StringInput` syntax bridges the gap between runtime logic and compile-time type knowledge.',
      ],
      active: [
        { startLine: 28, endLine: 30, color: 'violet',  label: 'type predicate — "input is StringInput" return type' },
        { startLine: 33, endLine: 37, color: 'indigo',  label: 'processInput — predicate narrows the union' },
        { startLine: 40, endLine: 42, color: 'emerald', label: 'HELLO from string path, 3.14 from number path' },
      ],
      connections: [{ fromLine: 29, toLine: 33, color: 'violet', label: 'predicate true → TypeScript narrows to StringInput' }],
    },
    {
      title: 'never — exhaustiveness checking',
      code:
`type Circle = { kind: 'circle'; radius: number }
type Rectangle = { kind: 'rectangle'; width: number; height: number }
type Triangle  = { kind: 'triangle'; base: number; height: number }

type Shape = Circle | Rectangle | Triangle

function area(shape: Shape): number {
  switch (shape.kind) {
    case 'circle':
      return Math.PI * shape.radius * shape.radius
    case 'rectangle':
      return shape.width * shape.height
    case 'triangle':
      return 0.5 * shape.base * shape.height
    default: {
      const exhausted: never = shape
      return exhausted
    }
  }
}

const c: Circle    = { kind: 'circle',    radius: 5 }
const r: Rectangle = { kind: 'rectangle', width: 4, height: 6 }
const t: Triangle  = { kind: 'triangle',  base: 3, height: 8 }
console.log(area(c).toFixed(2))
console.log(area(r))
console.log(area(t))`,
      runCode:
`function area(shape) {
  switch (shape.kind) {
    case 'circle':    return Math.PI * shape.radius * shape.radius
    case 'rectangle': return shape.width * shape.height
    case 'triangle':  return 0.5 * shape.base * shape.height
    default:          return 0
  }
}

var c = { kind: 'circle',    radius: 5 }
var r = { kind: 'rectangle', width: 4, height: 6 }
var t = { kind: 'triangle',  base: 3, height: 8 }
console.log(area(c).toFixed(2))
console.log(area(r))
console.log(area(t))`,
      explanation: [
        '`const exhausted: never = shape` in the `default` branch uses the `never` type for exhaustiveness checking. If all union variants are handled, `shape` in the `default` branch has type `never` — the assignment is valid. If you add a new `Shape` variant but forget to add a `switch` case, the default branch receives the unhandled variant, TypeScript sees it\'s not `never`, and errors: "Type \'Square\' is not assignable to type \'never\'." Lines 24–26 print `\'78.54\'`, `24`, `12`.',
        'CS — `never` is TypeScript\'s "bottom type" — the type with no values. A function that throws always returns `never`. An `infinite while(true)` loop returns `never`. A variable typed `never` is logically unreachable code. Assigning a value to a `never` variable is only valid if that value is also `never`. This property is what makes exhaustiveness checking work: at runtime it never runs; at compile time it catches omissions.',
        'SE — Exhaustiveness checking is a production safety net. Redux reducers use it in switch statements — every action type must be handled. TypeScript\'s strict mode in large codebases (Airbnb, Stripe, Microsoft) requires exhaustive switches. When a new event type, API status, or variant is added, the compiler immediately flags every switch that needs updating — no runtime tests needed.',
        'Without this: without the `never` check, a new `Triangle` added to the `Shape` union would compile without errors even with no `triangle` case in `area()`. The default would return `undefined`, causing `NaN` calculations silently. The `never` pattern makes "forgot to handle a case" a compile-time error rather than a runtime bug.',
      ],
      active: [
        { startLine: 3,  endLine: 3,  color: 'indigo',  label: 'Triangle added — new union variant' },
        { startLine: 15, endLine: 17, color: 'violet',  label: 'never — exhaustiveness guard in default' },
        { startLine: 24, endLine: 26, color: 'emerald', label: '78.54, 24, 12 — all three shapes handled' },
      ],
      connections: [],
    },
  ],
}
