export default {
  id: 'ts-union-types',
  title: 'Union Types & Type Guards',
  tag: 'TypeScript',
  lang: 'ts',
  steps: [
    {
      title: 'Union type — a value that can be one of several types',
      semanticEvent: 'NarrowType',
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
          '`type StringOrNumber = string | number` establishes the **multi-type value contract**: the annotation `value: StringOrNumber` tells the compiler the value is one of two types. The `typeof` guard narrows the union in each branch — inside `if (typeof value === \'string\')` TypeScript treats `value` as `string` and allows `.length`; in the else it is `number` and only number methods are safe.',
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
      semanticEvent: 'NarrowType',
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
          'The literal `kind` field establishes the **discriminated union tag relationship**: checking `shape.kind === \'circle\'` narrows the union to `Circle` — TypeScript knows `shape.radius` exists and blocks `shape.width/height`. The else branch is automatically narrowed to `Rectangle`. The tag field is the compile-time proof that identifies which variant is active at each code path.',
        'CS — A discriminated union is a tagged union or sum type — a type with a tag field that identifies which variant is active. This is the core algebraic data type from functional programming. TypeScript infers the correct variant from the tag check and removes impossible property accesses statically. If `shape.width` were accessed in the `\'circle\'` branch, TypeScript would error at compile time.',
        'SE — Redux action types are discriminated unions: `{ type: \'INCREMENT\' } | { type: \'DECREMENT\', amount: number }`. The `switch (action.type)` is the discriminant. TypeScript\'s exhaustiveness checking (`never` type in the default case) ensures every variant is handled — if you add a new action type to the union and forget to handle it, the compiler flags the missing case. React\'s `useReducer` pattern relies on this.',
        'Without this: without the discriminant field, you\'d check `instanceof Circle` (requires classes, not plain objects) or optional field presence (`if (\'radius\' in shape)`). Discriminated unions are the idiomatic TypeScript approach — they work with plain objects, destructuring, and switch statements, without requiring class instances.',
      ],
      active: [
        { startLine: 1,  endLine: 11, color: 'indigo',  label: 'Circle + Rectangle — each has a kind discriminant' },
        { startLine: 15, endLine: 18, color: 'violet',  label: 'kind check — narrows to Circle or Rectangle' },
        { startLine: 21, endLine: 24, color: 'emerald', label: 'circle area ≈ 78.54, rectangle area = 24' },
      ],
      connections: [{ fromLine: 15, toLine: 2, color: 'violet', label: 'kind === "circle" → TypeScript knows it\'s Circle', type: 'narrows' }],
    },
    {
      title: 'instanceof guard — narrowing class instances',
      semanticEvent: 'NarrowType',
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
          '`err instanceof ApiError` establishes the **prototype-chain narrowing relationship**: inside the `if` branch TypeScript narrows `err` from `ApiError | ValidationError` to `ApiError` — `err.statusCode` is accessible. Outside the branch `err` is narrowed to `ValidationError` — `err.field` is accessible. The runtime prototype check is the compile-time narrowing proof.',
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
      semanticEvent: 'NarrowType',
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
          '`input is StringInput` establishes the **user-defined narrowing contract**: the type predicate tells TypeScript that when `isStringInput` returns `true`, `input` is narrowed to `StringInput` at every call site. Inside `if (isStringInput(input))`, `input.value.toUpperCase()` is valid (`string`); in the else, `input.value.toFixed(2)` is valid (`number`). The developer owns the narrowing logic; the compiler trusts the predicate.',
        'CS — A predicate function with return type `x is T` is a type predicate. The function must return a boolean. TypeScript trusts your predicate — if you write `function isString(x: any): x is string { return typeof x === \'number\' }`, you\'ve lied to the compiler and will get runtime errors. The predicate is your type-narrowing contract: you prove the shape, TypeScript trusts it.',
        'SE — Type predicates are used when `typeof` and `instanceof` are not specific enough. Zod\'s `.safeParse()` returns `{ success: true; data: T } | { success: false; error: ZodError }` — `result.success` is the discriminant. A type predicate `function isSuccess<T>(r): r is { success: true; data: T }` lets callers access `result.data` after the guard. React Query uses similar patterns for `isError`, `isLoading`, `isSuccess` state.',
        'Without this: without a type predicate, `isStringInput` just returns a boolean — TypeScript doesn\'t know what the boolean means for the type. After `if (isStringInput(input))`, `input` is still `FormInput`, not `StringInput`. Calling `input.value.toUpperCase()` would error because `number.toUpperCase` doesn\'t exist. The `input is StringInput` syntax bridges the gap between runtime logic and compile-time type knowledge.',
      ],
      active: [
        { startLine: 28, endLine: 30, color: 'violet',  label: 'type predicate — "input is StringInput" return type' },
        { startLine: 33, endLine: 37, color: 'indigo',  label: 'processInput — predicate narrows the union' },
        { startLine: 40, endLine: 42, color: 'emerald', label: 'HELLO from string path, 3.14 from number path' },
      ],
      connections: [{ fromLine: 29, toLine: 33, color: 'violet', label: 'predicate true → TypeScript narrows to StringInput', type: 'narrows' }],
    },
    {
      title: 'never — exhaustiveness checking',
      semanticEvent: 'NarrowType',
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
          '`const exhausted: never = shape` establishes the **exhaustiveness enforcement relationship**: `never` is the bottom type — no real value can be assigned to it, so the code only type-checks if TypeScript can prove `shape` is unreachable. When all union variants are handled, `shape` in `default` narrows to `never` and the assignment is valid. Add a new variant, forget a case, and the assignment errors immediately at compile time.',
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
