# FOUNDATIONS — LAB-038 — TypeScript: Mapped Types and Utility Types

**Series:** FOUNDATIONS — Part VII: TypeScript Type System
**Environment:** TypeScript playground at typescriptlang.org/play
**Time:** 50–65 minutes.

---

## What You Will Build

`Partial<T>` and `Readonly<T>` implemented from scratch as mapped types, `Pick<T, K>` and `Omit<T, K>` for view-model derivation, a `DeepReadonly<T>` using conditional types, and a practical example of deriving update DTOs from domain types. After this lab you will understand how TypeScript's utility types work internally and how to write your own.

---

## What You Need to Know First

**From LAB-036 (Generics):** Mapped types use the same `T` type parameter syntax. `keyof T` appears in constraints.

**From LAB-034 (Interfaces):** You know the `readonly` modifier and `?` optional modifier on properties. Mapped types programmatically apply and remove these modifiers.

---

> **Quick Check — try to answer before reading:**
>
> 1. `keyof User` where `User = { id: number; name: string; email: string }` — what type does this produce?
> 2. What is `T[K]` called, and what does it produce?
> 3. What is the difference between `Partial<User>` and `Omit<User, 'id'>`?
>
> *(Answers at the end of this lab)*

---

## The Lesson

---

### Step 1 — `keyof` and Indexed Access Types

Before writing mapped types, understand the two building blocks:

```typescript
interface User {
  id: number;
  name: string;
  email: string;
  age?: number;
}

// keyof produces a union of all property name literal types
type UserKey = keyof User;  // 'id' | 'name' | 'email' | 'age'

// Indexed access type T[K] produces the type of property K on type T
type UserName  = User['name'];   // string
type UserId    = User['id'];     // number
type UserAge   = User['age'];    // number | undefined (because age is optional)
type AnyField  = User[keyof User];  // number | string | number | undefined = string | number | undefined
```

**The walkthrough:** `keyof User` asks TypeScript: "what string literals are valid keys of User?" The answer is a union of all property names. `User['name']` asks TypeScript: "what type is the `name` property of User?" The answer is `string`. Combining them: `User[keyof User]` is the union of all possible value types.

---

### Step 2 — Implementing `Partial<T>` from Scratch

**`Partial<T>`** makes every property of `T` optional. Its implementation:

```typescript
// The built-in Partial<T> is defined as:
type MyPartial<T> = {
  [K in keyof T]?: T[K];
};

// The [K in keyof T] part is a mapped type — it iterates over every key K in T
// The ?: makes each mapped property optional
// T[K] preserves the original type of each property

// Example:
type PartialUser = MyPartial<User>;
// Equivalent to:
// {
//   id?: number;
//   name?: string;
//   email?: string;
//   age?: number;
// }

function updateUser(userId: number, changes: MyPartial<User>): void {
  // changes can have any subset of User's fields
  console.log(`Updating user ${userId}:`, changes);
}

updateUser(1, { name: 'Alice' });         // OK — only name, all others optional
updateUser(1, { email: 'new@example.com', age: 31 }); // OK
updateUser(1, { unknownField: 'x' });     // TypeScript error — 'unknownField' not in User
```

**The walkthrough — mapped type syntax:**

`[K in keyof T]` is a **mapped type** — it produces one property for each key `K` in `keyof T`. The `in` is like a `for...of` loop over a union type: for each key literal in `keyof T`, create a property with that name and type `T[K]`.

The `?` modifier on `[K in keyof T]?` makes every generated property optional. Without `?`, the mapped type would reproduce T exactly.

---

### Step 3 — Implementing `Readonly<T>`

```typescript
type MyReadonly<T> = {
  readonly [K in keyof T]: T[K];
};

type ReadonlyUser = MyReadonly<User>;
// {
//   readonly id: number;
//   readonly name: string;
//   readonly email: string;
//   readonly age?: number;
// }

const frozenUser: MyReadonly<User> = { id: 1, name: 'Alice', email: 'a@example.com' };
frozenUser.name = 'Bob';  // TypeScript error: Cannot assign to 'name' because it is read-only
```

**Removing modifiers with `-`:**

TypeScript lets you remove modifiers from mapped types using `-`:

```typescript
type Mutable<T> = {
  -readonly [K in keyof T]: T[K];   // remove readonly from every property
};

type Required<T> = {
  [K in keyof T]-?: T[K];  // remove optional (?) from every property
};
```

The `-?` removes the optional modifier — every property becomes required. The `-readonly` removes the readonly modifier.

---

### Step 4 — `Pick<T, K>` and `Omit<T, K>` for View Models

In applications, you often need a subset of a type. A user profile page might only need `name` and `email`. An update endpoint might accept all fields except `id`.

```typescript
type MyPick<T, K extends keyof T> = {
  [P in K]: T[P];   // only iterate over the selected keys K
};

type MyOmit<T, K extends keyof T> = MyPick<T, Exclude<keyof T, K>>;
// Exclude<'id'|'name'|'email'|'age', 'id'> = 'name'|'email'|'age'

// Practical usage:
type UserProfileView = MyPick<User, 'name' | 'email'>;
// { name: string; email: string }

type UserUpdateInput = MyOmit<User, 'id'>;
// { name: string; email: string; age?: number }

function renderProfile(profile: UserProfileView): string {
  return `${profile.name} (${profile.email})`;
}

function handleUpdate(userId: number, input: UserUpdateInput): void {
  // input.id — TypeScript error: 'id' does not exist on type 'UserUpdateInput'
}
```

**The walkthrough — `Exclude<T, U>`:** `Exclude<T, U>` removes types from a union that are assignable to U. `Exclude<'id' | 'name' | 'email', 'id'>` produces `'name' | 'email'`. `MyOmit` uses `Exclude` to remove the unwanted keys from `keyof T`, then uses `MyPick` on the remaining keys.

**The SE lens — derive, don't repeat:** `UserUpdateInput` is derived from `User` — if you add a field to `User`, `UserUpdateInput` automatically includes it. If you had written `UserUpdateInput` manually, you would need to remember to update it whenever `User` changes. Deriving types from the source of truth is the DRY principle applied to the type system.

---

### Step 5 — `Record<K, V>` for Dictionaries

```typescript
// Record<K, V> creates a type where keys are K and values are V
type UserRole = 'admin' | 'editor' | 'viewer';
type RolePermissions = Record<UserRole, string[]>;
// { admin: string[]; editor: string[]; viewer: string[] }

const permissionMap: RolePermissions = {
  admin:  ['read', 'write', 'delete'],
  editor: ['read', 'write'],
  viewer: ['read'],
  // TypeScript error if 'viewer' is missing — all keys in UserRole are required
};

// TypeScript error:
const badMap: RolePermissions = {
  admin: ['read'],
  superAdmin: ['all'],  // 'superAdmin' is not in UserRole
};
```

`Record` is defined as `type Record<K extends keyof any, T> = { [P in K]: T }`. It is a mapped type where all keys have the same value type.

---

### Step 6 — Conditional Types

Conditional types allow a type to depend on a condition:

```typescript
type IsArray<T> = T extends any[] ? 'yes' : 'no';

type CheckString = IsArray<string>;   // 'no'
type CheckArray  = IsArray<number[]>; // 'yes'

// Built-in NonNullable<T>:
type MyNonNullable<T> = T extends null | undefined ? never : T;
type SafeString = MyNonNullable<string | null | undefined>;  // string
```

`T extends U ? TrueType : FalseType` — if `T` is assignable to `U`, the result is `TrueType`; otherwise `FalseType`. When `T` is a union, the condition is distributed over each member.

**Try it:**

```typescript
interface Product {
  id: number;
  name: string;
  price: number;
  description?: string;
}

type CreateProductInput = Omit<Product, 'id'>;
type UpdateProductInput = Partial<Omit<Product, 'id'>>;
// All fields optional except id (which is excluded entirely)

function createProduct(input: CreateProductInput): Product {
  return { id: Math.random(), ...input };
}

function updateProduct(productId: number, changes: UpdateProductInput): void {
  console.log(`Updating ${productId}:`, changes);
}
```

---

## Connect the Pieces

- **Every form library** (React Hook Form, Formik) uses `Partial<T>` for default values and `Required<Partial<T>>` for submission.
- **REST API design:** The create endpoint takes `Omit<T, 'id'>` (id is generated by the server). The update endpoint takes `Partial<Omit<T, 'id'>>` (only changed fields needed). These types are generated from the domain model.
- **TypeScript's own codebase** uses mapped types extensively. The entire `lib.es5.d.ts` is built from mapped types over JavaScript's built-in APIs.

---

## What Breaks Without This

**Manual copies that drift:**

```typescript
interface User {
  id: number;
  name: string;
  email: string;
  // Developer adds: joinedAt: Date;
}

// Manually maintained copy — now out of date:
interface UserUpdateInput {
  name?: string;
  email?: string;
  // joinedAt was added to User but forgotten here
}

// updateUser never accepts joinedAt — silent omission
// Could have been: type UserUpdateInput = Partial<Omit<User, 'id'>>;
// Then joinedAt appears automatically
```

Manual copies are a shotgun surgery waiting to happen. Every field added to `User` requires hunting for every manually written subset type. Derived types eliminate this category of bug entirely.

---

## Definition of Done

- [ ] Implement `MyPartial<T>` from scratch and verify it makes every field of `User` optional
- [ ] `MyReadonly<User>` — TypeScript error when assigning to any field
- [ ] `MyPick<User, 'name' | 'email'>` — the result type has exactly two fields
- [ ] `MyOmit<User, 'id'>` — the result type has all User fields except `id`
- [ ] `Record<'active' | 'inactive', number>` — TypeScript error when a key is missing
- [ ] You can explain why deriving types is better than manually writing subset types

**Git commit:**

```
git add src/
git commit -m "LAB-038: TypeScript mapped types — Partial, Readonly, Pick, Omit implemented from scratch; derive types from source-of-truth to stay in sync"
```

---

## Quick Check Answers

1. **`'id' | 'name' | 'email' | 'age'`** — a union of all string literal property names. TypeScript computes this at compile time from the interface definition.
2. **An indexed access type.** `T[K]` produces the type of property `K` on type `T`. `User['name']` is `string`. `User['id']` is `number`. It is the type-level equivalent of `obj[key]` in JavaScript.
3. **`Partial<User>` keeps all fields but makes them optional.** `Omit<User, 'id'>` removes the `id` field entirely and keeps the rest required. You would use `Partial` to allow partial updates (PATCH endpoint). You would use `Omit` to remove fields that callers should not provide (like server-generated IDs). `Partial<Omit<User, 'id'>>` combines both.
