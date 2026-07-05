export default {
  id: 'ts-conditional-types',
  title: 'Conditional Types',
  tag: 'TypeScript',
  lang: 'ts',
  steps: [
    {
      title: 'T extends U ? X : Y — type-level if/else',
      code:
`type IsString<T> = T extends string ? 'yes' : 'no'

type Test1 = IsString<string>
type Test2 = IsString<number>
type Test3 = IsString<'hello'>
type Test4 = IsString<boolean>

function typeLabel<T>(value: T): IsString<T> {
  return (typeof value === 'string' ? 'yes' : 'no') as IsString<T>
}

console.log(typeLabel('hello'))
console.log(typeLabel(42))
console.log(typeLabel(true))`,
      runCode:
`function typeLabel(value) {
  return typeof value === 'string' ? 'yes' : 'no'
}

console.log(typeLabel('hello'))
console.log(typeLabel(42))
console.log(typeLabel(true))`,
      explanation: [
        '`type IsString<T> = T extends string ? \'yes\' : \'no\'` is a conditional type: if `T` extends (is assignable to) `string`, the type resolves to `\'yes\'`; otherwise `\'no\'`. `IsString<string>` = `\'yes\'`. `IsString<number>` = `\'no\'`. `IsString<\'hello\'>` = `\'yes\'` (literal strings extend `string`). `typeLabel(\'hello\')` returns a value typed as `\'yes\'`. Lines 12–14 print `\'yes\'`, `\'no\'`, `\'no\'`.',
        'CS — Conditional types are the type-level equivalent of a ternary expression. `T extends U` is a type subtype check: "is `T` assignable to `U`?" at compile time. Conditional types enable type-level programming — computing types from other types using logic. This is a form of dependent typing: the TYPE of a result depends on the TYPE of the input.',
        'SE — Conditional types are used heavily in TypeScript\'s standard library: `NonNullable<T>` is `T extends null | undefined ? never : T`. `Awaited<T>` (extract what a Promise resolves to) is a conditional type that recurses through nested Promises. Zod\'s type inference, React\'s `ComponentProps<T>`, and TypeScript\'s DOM types all use conditional types.',
        'Without this: without conditional types, you need function overloads to express "if the input is a string, return \'yes\'; otherwise return \'no\'." Overloads are verbose and finite — you list the cases manually. Conditional types compute the result type for ALL possible inputs at once, including generic inputs you haven\'t thought of yet.',
      ],
      active: [
        { startLine: 1,  endLine: 1,  color: 'indigo',  label: 'conditional type — T extends U ? X : Y' },
        { startLine: 3,  endLine: 6,  color: 'violet',  label: 'Test1=yes, Test2=no, Test3=yes, Test4=no' },
        { startLine: 12, endLine: 14, color: 'emerald', label: 'yes, no, no at runtime' },
      ],
      connections: [],
    },
    {
      title: 'infer — extract a type from a generic',
      code:
`type IsString<T> = T extends string ? 'yes' : 'no'

type UnwrapPromise<T> = T extends Promise<infer R> ? R : T

type A = UnwrapPromise<Promise<string>>
type B = UnwrapPromise<Promise<number>>
type C = UnwrapPromise<string>

function unwrap<T>(value: T): UnwrapPromise<T> {
  return value as any
}

function getFirstElement<T>(arr: T[]): T {
  return arr[0]
}

type ElementType<T> = T extends (infer E)[] ? E : never

type StrEl  = ElementType<string[]>
type NumEl  = ElementType<number[]>
type Never  = ElementType<string>

const el1 = getFirstElement([1, 2, 3])
const el2 = getFirstElement(['a', 'b', 'c'])
console.log(el1)
console.log(el2)
console.log(typeof el1)
console.log(typeof el2)`,
      runCode:
`function getFirstElement(arr) {
  return arr[0]
}

var el1 = getFirstElement([1, 2, 3])
var el2 = getFirstElement(['a', 'b', 'c'])
console.log(el1)
console.log(el2)
console.log(typeof el1)
console.log(typeof el2)`,
      explanation: [
        '`infer R` in `T extends Promise<infer R> ? R : T` tells TypeScript: "if `T` matches `Promise<something>`, capture that something as `R` and return it." `UnwrapPromise<Promise<string>>` = `string`. `UnwrapPromise<Promise<number>>` = `number`. `UnwrapPromise<string>` = `string` (not a Promise — return `T` unchanged). `ElementType<string[]>` extracts `string`. Lines 24–27 print `1`, `\'a\'`, `\'number\'`, `\'string\'`.',
        'CS — `infer` is pattern matching at the type level. `T extends Promise<infer R>` is a type-level structural match: "does `T` look like `Promise<?>` — if so, what is `?`." This is the same concept as destructuring at the value level: `const { name } = user` extracts `name`; `infer R` extracts the generic parameter `R` from `Promise<R>`. TypeScript resolves `infer` only inside a conditional type.',
        'SE — `infer` powers TypeScript\'s `ReturnType<T>` (`T extends (...args: any) => infer R ? R : any`), `Parameters<T>`, `ConstructorParameters<T>`, and `InstanceType<T>`. Zod\'s `z.infer<typeof schema>` uses conditional types + `infer` to extract the TypeScript type from a Zod schema definition. React\'s `ComponentPropsWithRef<T>` uses `infer` to extract ref type from component type.',
        'Without this: without `infer`, you\'d need function overloads or manual type aliases to express "give me the type inside a Promise." `Promise<string>` resolves to `string`, but expressing that generically requires `infer`. Before TypeScript 2.8 (when `infer` was added), library authors had to define dozens of overloads for each possible wrapped type.',
      ],
      active: [
        { startLine: 3,  endLine: 3,  color: 'indigo',  label: 'infer R — extract the wrapped type from Promise<R>' },
        { startLine: 17, endLine: 17, color: 'violet',  label: 'ElementType — extract element type from array type' },
        { startLine: 23, endLine: 27, color: 'emerald', label: '1, a, number, string' },
      ],
      connections: [],
    },
    {
      title: 'Distributive conditional types',
      code:
`type IsString<T> = T extends string ? 'yes' : 'no'
type UnwrapPromise<T> = T extends Promise<infer R> ? R : T

type ToArray<T> = T extends any ? T[] : never

type StrOrNumArrays  = ToArray<string | number>
type BooleanArray    = ToArray<boolean>

function wrapInArray<T>(value: T): T[] {
  return [value]
}

function processUnion(input: string | number | boolean): string {
  if (typeof input === 'string')  return 'str: ' + input
  if (typeof input === 'number')  return 'num: ' + input
  return 'bool: ' + input
}

console.log(processUnion('hello'))
console.log(processUnion(42))
console.log(processUnion(true))
console.log(wrapInArray(5))
console.log(wrapInArray('x'))`,
      runCode:
`function wrapInArray(value) {
  return [value]
}

function processUnion(input) {
  if (typeof input === 'string')  return 'str: ' + input
  if (typeof input === 'number')  return 'num: ' + input
  return 'bool: ' + input
}

console.log(processUnion('hello'))
console.log(processUnion(42))
console.log(processUnion(true))
console.log(wrapInArray(5))
console.log(wrapInArray('x'))`,
      explanation: [
        '`ToArray<T>` is a distributive conditional type — when `T` is a union, TypeScript distributes the conditional over each member. `ToArray<string | number>` becomes `ToArray<string> | ToArray<number>` = `string[] | number[]`. This is NOT `(string | number)[]` — the union distributes to create separate array types. `ToArray<boolean>` = `boolean[]`. Lines 19–23 print `\'str: hello\'`, `\'num: 42\'`, `\'bool: true\'`, `[5]`, `[\'x\']`.',
        'CS — Distribution happens when the type parameter is "naked" — appears directly as `T` (not wrapped in `Array<T>` or another generic). `T extends any ? T[] : never` is always true for any `T` — the key is the distribution. To prevent distribution, wrap `T` in a tuple: `[T] extends [any] ? T[] : never`. This is a subtle but important distinction in advanced TypeScript.',
        'SE — Distributive conditional types power `NonNullable<T>`: `T extends null | undefined ? never : T`. When `T` is `string | null | undefined`, distribution applies: `string extends null|undefined ? never : string = string; null extends null|undefined ? never : never; undefined extends null|undefined ? never : never`. Result: `string` — null and undefined are filtered out. This is the core mechanism behind non-null types.',
        'Without this: without distribution, `NonNullable<string | null>` would check if `string | null` extends `null | undefined` — which it doesn\'t — returning `string | null` unchanged. Distribution is what makes the type utility work per-member of the union. It\'s the key insight that makes conditional types compose correctly over union types.',
      ],
      active: [
        { startLine: 4,  endLine: 4,  color: 'violet',  label: 'ToArray<T> — distributes over union members' },
        { startLine: 6,  endLine: 7,  color: 'indigo',  label: 'string[] | number[], boolean[] — per-member arrays' },
        { startLine: 19, endLine: 23, color: 'emerald', label: 'str/num/bool labeled; [5] and ["x"] wrapped' },
      ],
      connections: [],
    },
    {
      title: 'Exclude and Extract — filter union members',
      code:
`type IsString<T> = T extends string ? 'yes' : 'no'
type ToArray<T>  = T extends any ? T[] : never

type Exclude<T, U> = T extends U ? never : T
type Extract<T, U> = T extends U ? T    : never

type Status     = 'pending' | 'active' | 'suspended' | 'deleted'
type LiveStatus = Exclude<Status, 'deleted' | 'suspended'>
type EndStatus  = Extract<Status, 'suspended' | 'deleted'>

function handleLive(status: LiveStatus): string {
  return 'live: ' + status
}

function handleEnd(status: EndStatus): string {
  return 'ended: ' + status
}

console.log(handleLive('pending'))
console.log(handleLive('active'))
console.log(handleEnd('suspended'))
console.log(handleEnd('deleted'))`,
      runCode:
`function handleLive(status) {
  return 'live: ' + status
}

function handleEnd(status) {
  return 'ended: ' + status
}

console.log(handleLive('pending'))
console.log(handleLive('active'))
console.log(handleEnd('suspended'))
console.log(handleEnd('deleted'))`,
      explanation: [
        '`Exclude<T, U>` removes union members that extend `U`. `Exclude<Status, \'deleted\' | \'suspended\'>` = `\'pending\' | \'active\'`. `Extract<T, U>` keeps only members that extend `U`. `Extract<Status, \'suspended\' | \'deleted\'>` = `\'suspended\' | \'deleted\'`. `handleLive` can only accept `\'pending\'` or `\'active\'` — passing `\'deleted\'` would be a TypeScript error. Lines 19–22 print the four status labels.',
        'CS — `Exclude` and `Extract` are the set-theoretic complement and intersection at the type level. `Exclude<A, B>` = A − B (set difference). `Extract<A, B>` = A ∩ B (set intersection). They work by distributing over union members and returning `never` or the member. `never` is absorbed in union types — `string | never` = `string` — so members excluded become invisible.',
        'SE — `Exclude` is used for: creating a type of "everything except error states," restricting event handler parameter types, and removing `null`/`undefined` from unions (which is what `NonNullable` does internally). TypeScript\'s own lib.es2015.ts uses `Exclude` to define types like `Exclude<keyof ReadonlyArray<T>, keyof Array<T>>`. Redux\'s `ActionCreatorWithoutPayload` uses `Exclude` to filter action types.',
        'Without this: without `Exclude`, you manually list the members you want to keep — `type LiveStatus = \'pending\' | \'active\'`. When a new live status is added to `Status` (`\'trial\'`), you must remember to add it to `LiveStatus` too. With `Exclude`, `LiveStatus` is always derived — add `\'trial\'` to `Status` and `LiveStatus` automatically includes it, `EndStatus` automatically excludes it.',
      ],
      active: [
        { startLine: 4,  endLine: 5,  color: 'indigo',  label: 'Exclude + Extract — filter union with conditional type' },
        { startLine: 7,  endLine: 9,  color: 'violet',  label: 'LiveStatus = pending|active; EndStatus = suspended|deleted' },
        { startLine: 19, endLine: 22, color: 'emerald', label: 'live: pending/active; ended: suspended/deleted' },
      ],
      connections: [],
    },
    {
      title: 'DeepReadonly — recursive conditional type',
      code:
`type IsString<T> = T extends string ? 'yes' : 'no'
type Exclude<T, U> = T extends U ? never : T
type Extract<T, U> = T extends U ? T    : never

type Primitive = string | number | boolean | null | undefined

type DeepReadonly<T> = T extends Primitive
  ? T
  : T extends Array<infer E>
    ? ReadonlyArray<DeepReadonly<E>>
    : { readonly [K in keyof T]: DeepReadonly<T[K]> }

interface AppState {
  user: { name: string; email: string }
  items: string[]
  count: number
}

function freezeState(state: AppState): DeepReadonly<AppState> {
  return state as DeepReadonly<AppState>
}

const state = freezeState({
  user: { name: 'Alice', email: 'a@x.com' },
  items: ['a', 'b', 'c'],
  count: 42,
})

console.log(state.user.name)
console.log(state.items[0])
console.log(state.count)
console.log(state.items.length)`,
      runCode:
`function freezeState(state) {
  return state
}

var state = freezeState({
  user: { name: 'Alice', email: 'a@x.com' },
  items: ['a', 'b', 'c'],
  count: 42,
})

console.log(state.user.name)
console.log(state.items[0])
console.log(state.count)
console.log(state.items.length)`,
      explanation: [
        '`DeepReadonly<T>` is a recursive conditional type: primitives return as-is; arrays become `ReadonlyArray<DeepReadonly<E>>`; objects become `{ readonly [K in keyof T]: DeepReadonly<T[K]> }`. Applied to `AppState`: `count: number` stays `number`; `user: { name: string }` becomes `{ readonly name: string }`; `items: string[]` becomes `ReadonlyArray<string>`. Attempting `state.user.name = \'Bob\'` would be a TypeScript error. Lines 28–31 print `\'Alice\'`, `\'a\'`, `42`, `3`.',
        'CS — Recursive conditional types apply themselves to their own output — type-level recursion. TypeScript limits recursion depth to prevent infinite loops. `DeepReadonly` is the type-level equivalent of `Object.freeze()` applied recursively. The combination of `infer` (to extract array element types), mapped types (to iterate object keys), and conditional recursion produces a utility that works on arbitrarily nested structures.',
        'SE — `DeepReadonly` is used for Redux state types (state should never be mutated), configuration objects that are loaded once and read many times, and server-side props in Next.js (passed down immutably to components). Immer\'s `Draft<T>` is the inverse — it makes deeply readonly types mutable for the duration of `produce`. The two types are complementary in Redux + Immer codebases.',
        'Without this: without `DeepReadonly`, `Readonly<AppState>` makes the top-level object readonly — but `state.user.name = \'Bob\'` still compiles because `user` itself is mutable. You\'d need `Readonly<{ user: Readonly<{ name: string; email: string }> }>` — manually nested. `DeepReadonly` automates this for any level of nesting.',
      ],
      active: [
        { startLine: 7,  endLine: 11, color: 'violet',  label: 'DeepReadonly — recursive: primitive | array | object' },
        { startLine: 19, endLine: 31, color: 'emerald', label: 'Alice, a, 42, 3 — deeply readonly state reads fine' },
      ],
      connections: [{ fromLine: 10, toLine: 7, color: 'violet', label: 'DeepReadonly recurses on E (array element type)' }],
    },
  ],
}
