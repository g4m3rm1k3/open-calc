export default {
  id: 'ts-utility-types',
  title: 'Utility Types',
  tag: 'TypeScript',
  lang: 'ts',
  steps: [
    {
      title: 'Partial<T> — make all properties optional',
      code:
`interface User {
  id:    number
  name:  string
  email: string
  age:   number
}

function updateUser(id: number, patch: Partial<User>): User {
  const current: User = { id: 1, name: 'Alice', email: 'a@x.com', age: 25 }
  return { ...current, ...patch, id }
}

const updated = updateUser(1, { name: 'Bob', age: 30 })
console.log(updated.name)
console.log(updated.email)
console.log(updated.age)`,
      runCode:
`function updateUser(id, patch) {
  var current = { id: 1, name: 'Alice', email: 'a@x.com', age: 25 }
  return Object.assign({}, current, patch, { id: id })
}

var updated = updateUser(1, { name: 'Bob', age: 30 })
console.log(updated.name)
console.log(updated.email)
console.log(updated.age)`,
      explanation: [
        '`Partial<User>` transforms the `User` type so ALL properties become optional (`?`). The `patch` parameter can have zero, one, or all properties of `User`. `updateUser(1, { name: \'Bob\', age: 30 })` passes a partial with two fields — `email` and `id` are omitted. Line 14 prints `\'Bob\'`, line 15 prints `\'a@x.com\'` (unchanged from `current`), line 16 prints `30`.',
        'CS — `Partial<T>` is a mapped type defined in TypeScript\'s standard library: `type Partial<T> = { [K in keyof T]?: T[K] }`. It iterates every key of `T` and adds `?` — making each optional. Mapped types are metaprogramming at the type level: they transform one type into another using type-level computation, analogous to `Array.map` at the value level.',
        'SE — `Partial<T>` is the standard type for PATCH-style API requests. REST APIs use PATCH to update a subset of resource fields — the request body is a `Partial<Resource>`. ORMs like Prisma and TypeORM use `Partial<Model>` for update operations. React\'s `setState` (class component) accepted `Partial<State>` — only the fields you pass are updated.',
        'Without this: without `Partial<T>`, you\'d need to define a separate interface for each update shape — `UserNamePatch`, `UserEmailPatch`, `UserAgePatch`. Adding a new field to `User` would require updating every patch type. `Partial<User>` derives automatically from `User` — add a field to the base type and all partial types update for free.',
      ],
      active: [
        { startLine: 1,  endLine: 6,  color: 'indigo',  label: 'User — four required fields' },
        { startLine: 8,  endLine: 11, color: 'violet',  label: 'Partial<User> — all fields optional in patch' },
        { startLine: 13, endLine: 16, color: 'emerald', label: 'Bob (updated), a@x.com (unchanged), 30 (updated)' },
      ],
      connections: [],
    },
    {
      title: 'Required<T> and Readonly<T>',
      code:
`interface User {
  id:    number
  name:  string
  email: string
  age:   number
}

function updateUser(id: number, patch: Partial<User>): User {
  var current: User = { id: 1, name: 'Alice', email: 'a@x.com', age: 25 }
  return { ...current, ...patch, id } as User
}

interface Config {
  host?:    string
  port?:    number
  timeout?: number
}

function createServer(config: Required<Config>) {
  console.log(config.host + ':' + config.port)
  console.log('timeout: ' + config.timeout)
}

const frozen: Readonly<User> = { id: 1, name: 'Alice', email: 'a@x.com', age: 25 }
console.log(frozen.name)
console.log(frozen.id)

createServer({ host: 'localhost', port: 3000, timeout: 5000 })`,
      runCode:
`function createServer(config) {
  console.log(config.host + ':' + config.port)
  console.log('timeout: ' + config.timeout)
}

var frozen = { id: 1, name: 'Alice', email: 'a@x.com', age: 25 }
console.log(frozen.name)
console.log(frozen.id)

createServer({ host: 'localhost', port: 3000, timeout: 5000 })`,
      explanation: [
        '`Required<Config>` is the inverse of `Partial` — it makes all optional properties required. `Config` has three optional fields; `Required<Config>` requires all three. `createServer` must receive all three. `Readonly<User>` marks all properties as read-only — attempting `frozen.name = \'Bob\'` would be a TypeScript compile error. Line 24 prints `\'Alice\'`. Line 25 prints `1`. Line 27 prints `\'localhost:3000\'` and `\'timeout: 5000\'`.',
        'CS — `Required<T>` maps: `{ [K in keyof T]-?: T[K] }` — the `-?` removes the optional modifier. `Readonly<T>` maps: `{ readonly [K in keyof T]: T[K] }` — adds `readonly` to every property. These are modifier mapped types. TypeScript has four modifiers: `?` (optional), `-?` (required), `readonly`, `-readonly`. Mapped types can add or remove any combination.',
        'SE — `Readonly<T>` is used for configuration objects that should never be mutated after construction. Redux\'s state is typed `Readonly<State>` — reducers must return new objects, never mutate the existing state. React\'s `props` are `Readonly<Props>` — components should not mutate their own props. Immer\'s `Draft<T>` is the inverse: a mutable version of an otherwise `Readonly<T>` type.',
        'Without this: without `Readonly<T>`, a function receiving a User object could silently mutate the caller\'s data — `user.name = \'Modified\'` would change the original. The caller has no way to prevent it. `Readonly<T>` makes the mutation a compile-time error, enforcing the pure function contract at the type level.',
      ],
      active: [
        { startLine: 13, endLine: 17, color: 'indigo',  label: 'Config — all fields optional' },
        { startLine: 19, endLine: 22, color: 'violet',  label: 'Required<Config> — all fields now mandatory' },
        { startLine: 23, endLine: 27, color: 'emerald', label: 'Alice/1 from Readonly; localhost:3000/timeout from Required' },
      ],
      connections: [],
    },
    {
      title: 'Pick<T, K> — select a subset of properties',
      code:
`interface User {
  id:    number
  name:  string
  email: string
  age:   number
}

function updateUser(id: number, patch: Partial<User>): User {
  var current: User = { id: 1, name: 'Alice', email: 'a@x.com', age: 25 }
  return { ...current, ...patch, id } as User
}

type UserPreview  = Pick<User, 'id' | 'name'>
type UserPublic   = Pick<User, 'name' | 'email'>

function showPreview(u: UserPreview): void {
  console.log(u.id + ': ' + u.name)
}

function showPublic(u: UserPublic): void {
  console.log(u.name + ' <' + u.email + '>')
}

const alice: User = { id: 1, name: 'Alice', email: 'a@x.com', age: 25 }
showPreview(alice)
showPublic(alice)`,
      runCode:
`function showPreview(u) {
  console.log(u.id + ': ' + u.name)
}

function showPublic(u) {
  console.log(u.name + ' <' + u.email + '>')
}

var alice = { id: 1, name: 'Alice', email: 'a@x.com', age: 25 }
showPreview(alice)
showPublic(alice)`,
      explanation: [
        '`Pick<User, \'id\' | \'name\'>` creates a type with ONLY `id` and `name` from `User`. `Pick<User, \'name\' | \'email\'>` creates a type with only `name` and `email`. `showPreview` receives `UserPreview` — accessing `u.age` inside would be a TypeScript error. `showPublic` can access `name` and `email` but not `id` or `age`. Line 24 prints `\'1: Alice\'`. Line 25 prints `\'Alice <a@x.com>\'`.',
        'CS — `Pick<T, K>` is defined as `{ [P in K]: T[P] }` where `K extends keyof T`. It distributes over the union of key literals `K`, selecting only those properties from `T`. The complement is `Omit<T, K>`, which selects everything EXCEPT `K`. `Pick` and `Omit` are dual — `Pick<T, K>` = `Omit<T, Exclude<keyof T, K>>`.',
        'SE — `Pick` is used for view models and API response shaping. A `GET /users` endpoint returns `Pick<User, \'id\' | \'name\' | \'email\'>` — the `passwordHash` field is excluded by type. GraphQL\'s selection sets are essentially `Pick` at the query language level. tRPC procedures return `Pick<Model, \'field1\' | \'field2\'>` to prevent over-fetching. Prisma\'s `select: { name: true, email: true }` produces a `Pick` type in the result.',
        'Without this: without `Pick`, you\'d define `UserPreview` and `UserPublic` as separate interfaces, manually duplicating the property declarations from `User`. When `User` gains a new field, you manually decide if each view type should include it. `Pick` makes the view type a derivation — change `User`, and any `Pick` that should include the new field is updated by listing the key.',
      ],
      active: [
        { startLine: 13, endLine: 14, color: 'violet',  label: 'Pick — subset of User properties' },
        { startLine: 16, endLine: 22, color: 'indigo',  label: 'functions typed to Pick — can only access selected fields' },
        { startLine: 24, endLine: 25, color: 'emerald', label: '1: Alice; Alice <a@x.com>' },
      ],
      connections: [],
    },
    {
      title: 'Omit<T, K> — exclude specific properties',
      code:
`interface User {
  id:         number
  name:       string
  email:      string
  age:        number
  passwordHash: string
}

function updateUser(id: number, patch: Partial<User>): void {}

type PublicUser    = Omit<User, 'passwordHash'>
type CreateUserDTO = Omit<User, 'id'>

function registerUser(data: CreateUserDTO): User {
  return { ...data, id: Math.floor(Math.random() * 1000) + 1 }
}

function displayUser(u: PublicUser): void {
  console.log(u.name + ' (' + u.age + ') <' + u.email + '>')
}

const newUser = registerUser({
  name: 'Carol', email: 'c@x.com', age: 28, passwordHash: 'hashed-pw'
})
console.log(newUser.id > 0)
displayUser(newUser)`,
      runCode:
`function registerUser(data) {
  return Object.assign({}, data, { id: Math.floor(Math.random() * 1000) + 1 })
}

function displayUser(u) {
  console.log(u.name + ' (' + u.age + ') <' + u.email + '>')
}

var newUser = registerUser({
  name: 'Carol', email: 'c@x.com', age: 28, passwordHash: 'hashed-pw'
})
console.log(newUser.id > 0)
displayUser(newUser)`,
      explanation: [
        '`Omit<User, \'passwordHash\'>` creates `PublicUser` — all `User` fields EXCEPT `passwordHash`. `Omit<User, \'id\'>` creates `CreateUserDTO` — all fields except `id` (the server assigns the ID). `registerUser` receives data without an ID and returns a full `User` with a generated ID. Line 24 prints `true` (ID is positive). Line 25 prints `\'Carol (28) <c@x.com>\'`.',
        'CS — `Omit<T, K>` is defined as `Pick<T, Exclude<keyof T, K>>` — it uses `Exclude` (another utility type) to compute which keys to keep, then uses `Pick` to select them. `Exclude<Union, U>` removes members of `U` from `Union`: `Exclude<\'a\'|\'b\'|\'c\', \'a\'> = \'b\'|\'c\'`. These utility types are built from each other using conditional types and mapped types.',
        'SE — `Omit` is used for DTO (Data Transfer Object) shaping. A `CreateUserDTO` omits server-generated fields (`id`, `createdAt`, `updatedAt`). A `PublicUser` omits sensitive fields (`passwordHash`, `twoFactorSecret`). Prisma\'s `UserCreateInput` is `Omit<User, \'id\' | \'createdAt\'>`. Next.js API routes return `Omit<DbModel, \'internalField\'>` to prevent leaking internal data.',
        'Without this: without `Omit`, defining `CreateUserDTO` requires listing all `User` fields except `id` — 5 fields copied manually. Add `phone` to `User`, forget to add it to `CreateUserDTO`, and the DTO silently misses the new field until a runtime test catches it. `Omit` derives the type — add `phone` to `User` and `CreateUserDTO` automatically includes it.',
      ],
      active: [
        { startLine: 11, endLine: 12, color: 'violet',  label: 'Omit — all fields except the listed ones' },
        { startLine: 14, endLine: 16, color: 'indigo',  label: 'CreateUserDTO — no id; registerUser assigns one' },
        { startLine: 23, endLine: 25, color: 'emerald', label: 'id > 0 (generated), name/age/email displayed' },
      ],
      connections: [],
    },
    {
      title: 'Record<K, V> — typed dictionary',
      code:
`interface User {
  id: number; name: string; email: string; age: number
}

type Role = 'admin' | 'editor' | 'viewer'

type RolePermissions = Record<Role, string[]>

const permissions: RolePermissions = {
  admin:  ['read', 'write', 'delete'],
  editor: ['read', 'write'],
  viewer: ['read'],
}

function canDo(role: Role, action: string): boolean {
  return permissions[role].includes(action)
}

console.log(canDo('admin',  'delete'))
console.log(canDo('editor', 'delete'))
console.log(canDo('viewer', 'read'))

type UserCache = Record<number, User>

const cache: UserCache = {
  1: { id: 1, name: 'Alice', email: 'a@x.com', age: 25 },
  2: { id: 2, name: 'Bob',   email: 'b@x.com', age: 30 },
}
console.log(cache[1].name)
console.log(cache[2].age)`,
      runCode:
`var permissions = {
  admin:  ['read', 'write', 'delete'],
  editor: ['read', 'write'],
  viewer: ['read'],
}

function canDo(role, action) {
  return permissions[role].includes(action)
}

console.log(canDo('admin',  'delete'))
console.log(canDo('editor', 'delete'))
console.log(canDo('viewer', 'read'))

var cache = {
  u1: { id: 1, name: 'Alice', email: 'a@x.com', age: 25 },
  u2: { id: 2, name: 'Bob',   email: 'b@x.com', age: 30 },
}
console.log(cache.u1.name)
console.log(cache.u2.age)`,
      explanation: [
        '`Record<Role, string[]>` creates a type where the keys are the `Role` union members (`\'admin\'` | `\'editor\'` | `\'viewer\'`) and each value is `string[]`. TypeScript verifies all three keys are present — omitting `\'viewer\'` would be a compile error. `Record<number, User>` creates a numeric-keyed dictionary of Users. Lines 18–20 print `true`, `false`, `true`. Lines 28–29 print `\'Alice\'`, `30`.',
        'CS — `Record<K, V>` is defined as `{ [P in K]: V }` — a homogeneous mapped type where all values have the same type `V`. The key type `K` must be `string | number | symbol`. When `K` is a union literal type (`\'a\' | \'b\' | \'c\'`), TypeScript checks that ALL members of the union are present as keys — completeness checking for dictionaries, analogous to exhaustiveness checking for unions.',
        'SE — `Record` is used for lookup tables, caches, and dispatch maps. Express route registries: `Record<string, RequestHandler>`. React\'s `useReducer` switch dispatch: `Record<ActionType, ReducerFn>`. Redux\'s entity adapter stores: `Record<EntityId, Entity>`. Internationalization (i18n) dictionaries: `Record<Locale, Record<MessageKey, string>>`. Configuration maps: `Record<FeatureFlag, boolean>`.',
        'Without this: without `Record<Role, string[]>`, the type would be `{ [key: string]: string[] }` — which allows any string as a key, including typos (`\'adminn\'`). TypeScript would not catch a missing `viewer` key. `Record<Role, string[]>` constrains the keys to exactly the three role strings — completeness and spelling are both checked at compile time.',
      ],
      active: [
        { startLine: 7,  endLine: 7,  color: 'violet',  label: 'Record<Role, string[]> — all 3 roles required as keys' },
        { startLine: 9,  endLine: 13, color: 'indigo',  label: 'permissions — complete dictionary enforced by type' },
        { startLine: 18, endLine: 29, color: 'emerald', label: 'true/false/true, Alice, 30' },
      ],
      connections: [],
    },
    {
      title: 'ReturnType<T> and Parameters<T>',
      code:
`interface User {
  id: number; name: string; email: string; age: number
}

type Role = 'admin' | 'editor' | 'viewer'
type RolePermissions = Record<Role, string[]>

const permissions: RolePermissions = {
  admin: ['read','write','delete'], editor: ['read','write'], viewer: ['read'],
}

function canDo(role: Role, action: string): boolean {
  return permissions[role].includes(action)
}

function createUser(name: string, age: number): User {
  return { id: Date.now(), name, email: name + '@x.com', age }
}

type CreateUserReturn = ReturnType<typeof createUser>
type CreateUserParams = Parameters<typeof createUser>

function wrappedCreate(...args: CreateUserParams): CreateUserReturn {
  console.log('creating user: ' + args[0])
  return createUser(...args)
}

const u = wrappedCreate('Diana', 32)
console.log(u.name)
console.log(u.age)
console.log(u.email)`,
      runCode:
`function createUser(name, age) {
  return { id: 1, name: name, email: name + '@x.com', age: age }
}

function wrappedCreate(...args) {
  console.log('creating user: ' + args[0])
  return createUser(args[0], args[1])
}

var u = wrappedCreate('Diana', 32)
console.log(u.name)
console.log(u.age)
console.log(u.email)`,
      explanation: [
        '`ReturnType<typeof createUser>` extracts the return type of `createUser` — `User`. `Parameters<typeof createUser>` extracts the parameter types as a tuple — `[string, number]`. `wrappedCreate` uses both: `...args: CreateUserParams` means the wrapper accepts exactly the same arguments as `createUser`, and the return type is `CreateUserReturn` (also `User`). Line 28 prints `\'Diana\'`. Line 29 prints `32`. Line 30 prints `\'Diana@x.com\'`.',
        'CS — `ReturnType<T>` and `Parameters<T>` are conditional types using the `infer` keyword: `type ReturnType<T> = T extends (...args: any) => infer R ? R : never`. The `infer R` keyword tells TypeScript "extract the return type into `R`". This is type-level pattern matching — TypeScript destructures function types the same way destructuring destructures values.',
        'SE — These types are essential for wrapping third-party functions without re-declaring their types. A performance wrapper around `fetch`: `function trackedFetch(...args: Parameters<typeof fetch>): ReturnType<typeof fetch>`. The wrapper\'s type is always derived from the wrapped function — update the fetch signature and the wrapper updates automatically. Express `RequestHandler` type checking uses this pattern.',
        'Without this: without `ReturnType` and `Parameters`, wrapping `createUser` requires manually re-declaring: `function wrappedCreate(name: string, age: number): User`. When `createUser`\'s signature changes (add `email` parameter), you must update both `createUser` and `wrappedCreate` in sync. With `ReturnType`/`Parameters`, only `createUser`\'s signature changes — the wrapper derives everything automatically.',
      ],
      active: [
        { startLine: 20, endLine: 21, color: 'violet',  label: 'ReturnType + Parameters — extract from existing function' },
        { startLine: 23, endLine: 26, color: 'indigo',  label: 'wrapper uses derived types — stays in sync automatically' },
        { startLine: 28, endLine: 30, color: 'emerald', label: 'Diana, 32, Diana@x.com' },
      ],
      connections: [],
    },
  ],
}
