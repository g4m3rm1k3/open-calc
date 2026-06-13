# FOUNDATIONS — LAB-039 — TypeScript: Async and Promises

**Series:** FOUNDATIONS — Part VII: TypeScript Type System
**Environment:** TypeScript playground at typescriptlang.org/play or Node.js (node --version to verify ≥ 18)
**Time:** 45–60 minutes.

---

## What You Will Build

Typed `Promise<T>`, typed async functions, chained `.then()` with preserved types, typed error handling, and a demonstration of what `Promise<void>` vs `Promise<never>` means. After this lab you will understand how TypeScript threads type information through asynchronous chains, and why you cannot use a `Promise<number>` where a `number` is expected.

---

## What You Need to Know First

**From LAB-011 (Async — Callbacks, Promises, async/await):** You understand the mechanics of Promises and async/await. This lab adds TypeScript's type layer on top of that.

**From LAB-036 (Generics):** `Promise<T>` is a generic type — `T` is the resolved value type.

---

> **Quick Check — try to answer before reading:**
>
> 1. If `fetchUser` returns `Promise<User>`, what does `await fetchUser(1)` return?
> 2. What does `async function foo(): Promise<void>` mean?
> 3. TypeScript allows `async (x: number) => x * 2`. What is the inferred return type?
>
> *(Answers at the end of this lab)*

---

## The Lesson

---

### Step 1 — `Promise<T>`: The Generic Promise

```typescript
// A Promise that resolves to a number
const delayedNumber: Promise<number> = new Promise((resolve, reject) => {
  setTimeout(() => resolve(42), 1000);
});

// TypeScript knows the resolved type:
delayedNumber.then(value => {
  value.toFixed(2);   // OK — value is number
  value.toUpperCase(); // TypeScript error: toUpperCase does not exist on number
});

// Cannot use the Promise where a number is expected:
const doubled: number = delayedNumber * 2;  // TypeScript error: cannot multiply Promise<number> by 2
```

**The walkthrough:** `Promise<T>` is TypeScript's way of saying "this value will eventually be a `T`." The `T` is preserved through `.then()` — the callback argument is typed as `T`. TypeScript prevents you from using the Promise itself as a number — you must `await` or `.then()` to get the actual value.

**The CS lens — type threading through async:** TypeScript's type system models asynchrony. `Promise<T>` is a container type — the T lives inside the promise until it resolves. This is the same concept as `Array<T>` (T lives inside the array). You extract the T from Array<T> with indexing; you extract T from Promise<T> with `await`.

---

### Step 2 — Typing Async Functions

```typescript
interface User {
  id: number;
  name: string;
  email: string;
}

// Return type annotation is optional — TypeScript infers Promise<User>
async function fetchUser(userId: number): Promise<User> {
  const response = await fetch(`https://api.example.com/users/${userId}`);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: Failed to fetch user ${userId}`);
  }

  // response.json() returns Promise<any> — we need to validate
  const rawData: unknown = await response.json();

  // Type guard (from LAB-037) — validate before trusting
  if (!isUser(rawData)) {
    throw new Error('API returned unexpected shape');
  }

  return rawData;  // TypeScript: rawData is User
}

function isUser(value: unknown): value is User {
  return (
    typeof value === 'object' && value !== null &&
    'id' in value && typeof (value as any).id === 'number' &&
    'name' in value && typeof (value as any).name === 'string' &&
    'email' in value && typeof (value as any).email === 'string'
  );
}
```

**The walkthrough:** An `async` function always returns a `Promise`. `async function fetchUser(userId: number): Promise<User>` declares the return type explicitly. TypeScript checks that every `return` inside the function returns a value assignable to `User`. Throwing does not violate this — a thrown error causes the Promise to reject, which is outside the type's concern (TypeScript does not type rejection reasons).

---

### Step 3 — Typed `.then()` Chains

```typescript
function doubleUserId(userId: number): Promise<number> {
  return fetchUser(userId).then(user => user.id * 2);
  // .then() callback: user is User, user.id is number, * 2 is number
  // Return type of .then() callback is number → Promise<number>
}

function formatUserSummary(userId: number): Promise<string> {
  return fetchUser(userId)
    .then(user => ({
      name: user.name,
      emailDomain: user.email.split('@')[1],
    }))
    // TypeScript: intermediate type is { name: string; emailDomain: string }
    .then(summary => `${summary.name} @ ${summary.emailDomain}`);
    // TypeScript: final type is string → Promise<string>
}
```

**The walkthrough:** Each `.then()` callback's return type becomes the `T` of the next `Promise<T>`. TypeScript tracks this chain precisely. If you return `user.id` (a number), the next `.then()` receives a `number`. If you return a new object, the next `.then()` receives that object type.

---

### Step 4 — Error Handling and `Promise<void>`

```typescript
// Promise<void>: resolves with no value — only used for side effects
async function logUserActivity(userId: number, action: string): Promise<void> {
  const user = await fetchUser(userId);
  console.log(`[${new Date().toISOString()}] ${user.name}: ${action}`);
  // No return needed — the function resolves with undefined, typed as void
}

// await a void Promise — fine, you just don't use the result
await logUserActivity(1, 'login');

// Promise<never>: never resolves (always throws or runs forever)
async function failAlways(): Promise<never> {
  throw new Error('This always fails');
  // TypeScript knows no return is possible — return type is never
}
```

**`void` vs `undefined` vs `never`:**
- `Promise<void>` — resolves with `undefined`, but callers should not use the value
- `Promise<undefined>` — resolves with `undefined` explicitly; callers may use it
- `Promise<never>` — never resolves; the function always throws or runs forever

**Typed error handling:**

```typescript
async function safelyFetchUser(userId: number): Promise<User | null> {
  try {
    return await fetchUser(userId);
  } catch {
    // TypeScript: the error in catch is 'unknown' since TS 4.0
    // You should narrow it before using
    return null;
  }
}

// The caller handles the null explicitly:
const user = await safelyFetchUser(1);
if (user === null) {
  console.log('User not found');
} else {
  console.log(user.name);  // TypeScript: user is User here (null eliminated)
}
```

**The SE lens — typed null instead of throwing:** Returning `User | null` makes the absence of a user part of the type contract — callers must handle it. Throwing makes the error invisible to TypeScript's type system (TypeScript does not type thrown errors). `User | null` is more honest about what callers need to handle.

---

### Step 5 — `Promise.all` with Types

```typescript
// TypeScript infers the tuple type from the Promise array
async function fetchMultipleUsers(userIds: number[]): Promise<User[]> {
  const userPromises: Promise<User>[] = userIds.map(id => fetchUser(id));
  return Promise.all(userPromises);
  // Promise.all<User[]>(...) → Promise<User[]>
}

// TypeScript handles mixed types with a tuple:
const [user, settings, permissions] = await Promise.all([
  fetchUser(1),            // Promise<User>
  fetchSettings(1),        // Promise<Settings>
  fetchPermissions(1),     // Promise<string[]>
]);
// user: User, settings: Settings, permissions: string[]
// TypeScript infers the exact tuple type — each element has its own type
```

**The walkthrough:** `Promise.all` is typed as a generic function that takes a tuple of Promises and returns a Promise of a tuple of resolved values. TypeScript uses tuple types to track that element 0 is `User`, element 1 is `Settings`, and element 2 is `string[]` — they do not collapse into a union.

---

## Connect the Pieces

- **`fetch` in TypeScript** returns `Promise<Response>`. `response.json()` returns `Promise<any>` — which is why you always need a type guard or assertion after it.
- **React Query / SWR** wrap async functions in hooks and expose the typed result: `useQuery<User, Error>('user', fetchUser)` — the `User` type flows from your typed `fetchUser` into the hook's return type.
- **Node.js `fs/promises`** module: `readFile` returns `Promise<Buffer>` when called without encoding, `Promise<string>` with encoding. TypeScript picks the correct overload.

---

## What Breaks Without This

**Forgetting `await`:**

```typescript
async function showUserName(userId: number): Promise<void> {
  const user = fetchUser(userId);  // BUG: forgot await — user is Promise<User>
  console.log(user.name);          // TypeScript error: Property 'name' does not exist on type 'Promise<User>'
}
```

TypeScript catches this at compile time. Without TypeScript, `user.name` would be `undefined` at runtime — a silent bug. The error message "Property 'name' does not exist on type 'Promise<User>'" is the exact hint you need: you forgot to await.

---

## Definition of Done

- [ ] Write `fetchProduct(id: number): Promise<Product>` with a type guard
- [ ] TypeScript error when you use the Promise directly without `await`
- [ ] `.then()` chain where types change: `Promise<Product>` → `Promise<string>` (name only)
- [ ] `Promise.all` with two different Promise types — TypeScript correctly types each resolved value
- [ ] You can explain: what is the difference between an `async` function that `return`s a value vs one that `throw`s — and how does `Promise<T>` relate to each?

**Git commit:**

```
git add src/
git commit -m "LAB-039: TypeScript Promise<T> and async functions — type threading through await chains; missing await produces a compile error not a silent undefined"
```

---

## Quick Check Answers

1. **`User`.** `await` unwraps the Promise. `await Promise<User>` produces `User`. TypeScript knows this because `await` on `Promise<T>` returns `T`.
2. **The function resolves with no meaningful value.** `Promise<void>` means the function's asynchronous work completes but the resolved value should not be used by callers. Typically used for functions called for side effects — logging, saving to a database, sending an email.
3. **`Promise<number>`.** Every `async` function returns a Promise. TypeScript infers the resolved type from the function body's return value: `x * 2` is `number`, so the return type is `Promise<number>`. You can verify: `const result: number = await ((async (x: number) => x * 2)(5))` — TypeScript accepts this.
