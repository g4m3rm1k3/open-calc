# FOUNDATIONS — LAB-037 — TypeScript: Type Narrowing and Type Guards

**Series:** FOUNDATIONS — Part VII: TypeScript Type System
**Environment:** TypeScript playground at typescriptlang.org/play
**Time:** 45–60 minutes.

---

## What You Will Build

Custom type guard functions using `value is T` return types, a demonstration of all narrowing forms (`typeof`, `instanceof`, `in`, equality), exhaustiveness checking with `never`, and a real-world example of parsing untrusted API data. After this lab you will understand how TypeScript tracks type flow through control structures.

---

## What You Need to Know First

**From LAB-035 (Discriminated Unions):** You know that `switch (shape.kind)` narrows the type in each case. This lab explains the general mechanism behind all narrowing.

**From LAB-036 (Generics):** Custom type guards use a special generic-like syntax in their return type.

---

> **Quick Check — try to answer before reading:**
>
> 1. TypeScript narrows inside an `if` block. Does it also narrow after a `return`?
> 2. What happens to the type of a variable after `if (x === null) return`?
> 3. Why would a custom type guard use `value is SomeType` as its return type instead of `boolean`?
>
> *(Answers at the end of this lab)*

---

## The Lesson

---

### Step 1 — Narrowing Forms: The Four Mechanisms

**`typeof` narrowing:**

```typescript
function describe(value: string | number | boolean | null | undefined): string {
  if (value === null)           return 'null';
  if (value === undefined)      return 'undefined';
  if (typeof value === 'string')  return `string: "${value}"`;
  if (typeof value === 'number')  return `number: ${value.toFixed(2)}`;
  return `boolean: ${value}`;  // TypeScript: value is boolean here (all others eliminated)
}
```

After each `if` with a `return`, TypeScript eliminates that possibility from the remaining type. By the last line, `value` can only be `boolean`.

**`instanceof` narrowing:**

```typescript
class DatabaseError extends Error {
  constructor(public query: string, message: string) {
    super(message);
    this.name = 'DatabaseError';
  }
}

function handleError(error: Error | DatabaseError): string {
  if (error instanceof DatabaseError) {
    return `Database error in query "${error.query}": ${error.message}`;
    // TypeScript: error is DatabaseError, so .query is available
  }
  return `General error: ${error.message}`;
  // TypeScript: error is Error (not DatabaseError)
}
```

`instanceof` works with classes. TypeScript knows the class hierarchy and narrows to the specific subclass.

**`in` narrowing:**

```typescript
interface Cat { meow(): string; }
interface Dog { bark(): string; }

function makeSound(animal: Cat | Dog): string {
  if ('meow' in animal) {
    return animal.meow();  // TypeScript: animal is Cat
  }
  return animal.bark();   // TypeScript: animal is Dog
}
```

**Equality narrowing:**

```typescript
type Status = 'active' | 'inactive' | 'pending';

function handleStatus(status: Status | null): string {
  if (status === null) return 'No status';
  // TypeScript: status is now 'active' | 'inactive' | 'pending' (null eliminated)
  if (status === 'active') return 'User is active';
  // TypeScript: status is 'inactive' | 'pending' here
  return `Status: ${status}`;
}
```

**The CS lens — flow-sensitive typing:** TypeScript performs flow analysis on the control flow graph of each function. At each point in the code, it tracks the set of possible types for each variable, updating the set as control flow checks eliminate possibilities. This is called flow-sensitive typing or type flow analysis. Haskell's type system does the same at compile time without runtime checks.

---

### Step 2 — Custom Type Guards

**The problem this step solves:** You have a function that checks something complex — more than `typeof` or `instanceof` can express. You want TypeScript to trust the result of your check.

```typescript
interface AdminUser {
  role: 'admin';
  permissions: string[];
  name: string;
}

interface RegularUser {
  role: 'user';
  name: string;
}

type AppUser = AdminUser | RegularUser;

// Without custom guard: TypeScript does not trust the check
function checkAdmin(user: AppUser): boolean {
  return user.role === 'admin';
}

function grantAccess(user: AppUser): void {
  if (checkAdmin(user)) {
    // TypeScript still thinks user is AdminUser | RegularUser — it doesn't know checkAdmin narrowed it
    user.permissions.forEach(p => console.log(p));  // TypeScript ERROR
  }
}
```

TypeScript does not propagate narrowing through external function calls because the function might check something unrelated. `checkAdmin(user)` returning `true` does not tell TypeScript anything about what `user` IS.

**Custom type guard — the solution:**

```typescript
// The 'user is AdminUser' return type is the type predicate
function isAdminUser(user: AppUser): user is AdminUser {
  return user.role === 'admin';
}

function grantAccess(user: AppUser): void {
  if (isAdminUser(user)) {
    // TypeScript: user is AdminUser — permissions is available
    user.permissions.forEach(permission => console.log(permission));
  } else {
    // TypeScript: user is RegularUser
    console.log(`Regular user ${user.name} — no special permissions`);
  }
}
```

**The walkthrough:** `user is AdminUser` in the return type is a **type predicate**. It tells TypeScript: "if this function returns `true`, then in the calling scope, the argument `user` has type `AdminUser`." TypeScript expands narrowing through calls with this annotation.

**The SE lens — guard function is the single source of truth:** The runtime check `user.role === 'admin'` lives in one place. Every part of the codebase that needs to check for admin access calls `isAdminUser()`. If the check changes (e.g., role is renamed), you update one function. This is DRY applied to type narrowing.

---

### Step 3 — Parsing Untrusted Data

**A type guard for API responses:**

```typescript
interface ApiProduct {
  id: number;
  name: string;
  price: number;
}

function isApiProduct(value: unknown): value is ApiProduct {
  return (
    value !== null &&
    typeof value === 'object' &&
    'id'    in value && typeof (value as any).id === 'number' &&
    'name'  in value && typeof (value as any).name === 'string' &&
    'price' in value && typeof (value as any).price === 'number'
  );
}

async function fetchProduct(productId: number): Promise<ApiProduct> {
  const response = await fetch(`/api/products/${productId}`);
  const rawData: unknown = await response.json();   // unknown — we don't trust it yet

  if (!isApiProduct(rawData)) {
    throw new Error(`API returned unexpected shape: ${JSON.stringify(rawData)}`);
  }

  // TypeScript: rawData is ApiProduct here — safe to use
  return rawData;
}
```

**The walkthrough:** `response.json()` returns `any` in JavaScript. Typing it as `unknown` is safer — TypeScript refuses to let you use `unknown` values without narrowing them first. The type guard validates the shape at runtime and tells TypeScript the type at compile time. After the guard, TypeScript knows `rawData` is `ApiProduct`.

**The CS lens — `unknown` vs `any`:** `unknown` is the type-safe alternative to `any`. Both accept any value. But `any` lets you do anything with the value without checks. `unknown` forces you to narrow before using. `unknown` is the correct type for data from external sources (API responses, `JSON.parse`, user input). Using `unknown` with a type guard is the standard pattern for safe deserialization.

---

### Step 4 — The `never` Type for Exhaustiveness

From LAB-035, you know that `never` appears in the `default` branch of an exhaustive switch. Here is the pattern in a standalone utility:

```typescript
function assertNever(value: never, message?: string): never {
  throw new Error(message ?? `Unexpected value: ${JSON.stringify(value)}`);
}

// Usage in a switch:
function processShape(shape: Shape): number {
  switch (shape.kind) {
    case 'circle':    return Math.PI * shape.radius ** 2;
    case 'rectangle': return shape.width * shape.height;
    case 'triangle':  return 0.5 * shape.base * shape.height;
    default:          return assertNever(shape);
    // If 'square' is added to Shape, TypeScript error here:
    // Argument of type 'Square' is not assignable to parameter of type 'never'
  }
}
```

**The SE lens — runtime guard that matches compile-time check:** `assertNever` serves two purposes. Compile-time: TypeScript checks that the argument has type `never` — if it does not, a new variant was added without handling. Runtime: if somehow a value reaches the `default` branch (e.g., from untyped JavaScript calling this function), it throws with a useful error message instead of silently returning `undefined`.

---

## Connect the Pieces

- **Zod** is a runtime validation library that generates TypeScript types from schemas. `z.object({ name: z.string() }).safeParse(data)` is a type guard that validates at runtime and produces a strongly typed result — exactly the pattern in Step 3, with a library doing the boilerplate.
- **React's type narrowing** — `if (!props.isLoading)` narrows `props.data` from `T | undefined` to `T` when `isLoading` is defined to carry this information in the type.
- **Exhaustive pattern matching** is a first-class language feature in Rust (`match`), Kotlin (`when`), and Scala (`match`). TypeScript simulates it with discriminated unions + `never`.

---

## What Breaks Without This

**Forgetting `unknown` at API boundaries:**

```typescript
// BUG: using any
async function fetchUser(userId: number): Promise<User> {
  const response = await fetch(`/api/users/${userId}`);
  const data: any = await response.json();  // any — TypeScript stops checking
  return data;  // No error — but data might be { error: 'not found' } in production
}

const user = await fetchUser(1);
console.log(user.name.toUpperCase());  // Runtime crash if name is undefined
```

The `any` type suppresses all errors at the boundary and lets malformed data propagate deep into the application before crashing. The crash appears far from the source — harder to diagnose. The type guard pattern catches the shape mismatch at the exact point of deserialization.

---

## Definition of Done

- [ ] Write a custom type guard `isString(value: unknown): value is string`
- [ ] Use it to safely handle `unknown` data — TypeScript reports an error if you use the data without the guard
- [ ] Write `isAdminUser` and use it so TypeScript grants access to `permissions` only inside the guarded block
- [ ] The `assertNever` pattern produces a compile error when you add a new variant to a discriminated union without handling it
- [ ] You can explain the difference between `value: unknown` and `value: any`

**Git commit:**

```
git add src/
git commit -m "LAB-037: TypeScript type narrowing and custom type guards — unknown + isX pattern enforces safe deserialization at API boundaries"
```

---

## Quick Check Answers

1. **Yes — TypeScript narrows after `return`.** After `if (x === null) return`, TypeScript knows x is not null for the rest of the function. This is called "control flow analysis" — TypeScript tracks what is still possible after each statement that changes the flow.
2. **TypeScript removes `null` from x's type.** After `if (x === null) return`, TypeScript knows x cannot be null in the code that follows. If x was typed as `string | null`, it becomes just `string` after the guard.
3. **A `boolean` return does not propagate narrowing.** TypeScript does not look inside the function body to infer what was checked. The `value is SomeType` return type is an explicit instruction to TypeScript: "if this returns true, narrow the argument to SomeType at the call site." Without it, TypeScript treats the function as returning `boolean` with no side-effect on types.
