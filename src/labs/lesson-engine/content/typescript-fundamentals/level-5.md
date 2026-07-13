---
series: typescript-fundamentals
level: 5
title: Narrowing and Type Guards
lang: typescript
---

# Narrowing and Type Guards

A value of type `string | number | null` cannot be used as a string until you have verified that it actually is one. TypeScript enforces this — trying to call `.toUpperCase()` on `string | number` is a compile error.

**Narrowing** is the process of reducing a union type to one of its members inside a conditional branch. TypeScript's control flow analysis tracks the type at every point in your code — after an `if (typeof x === 'string')` check, TypeScript knows `x` is `string` inside that branch without you having to cast.

By the end of this lesson you will understand the forms of narrowing TypeScript recognises, how to write custom type guards with `is`, and why exhaustiveness checking catches missing cases in switch statements.

## typeof narrowing

```typescript
function formatValue(value: string | number | boolean): string {
  if (typeof value === "string") {
    // Here: value is string
    return value.toUpperCase();
  } else if (typeof value === "number") {
    // Here: value is number
    return value.toFixed(2);
  } else {
    // Here: value is boolean (TypeScript deduced this)
    return value ? "Yes" : "No";
  }
}
```

```text
formatValue("hello")   // → "HELLO"
formatValue(3.14159)   // → "3.14"
formatValue(true)      // → "Yes"
formatValue(false)     // → "No"
```

TypeScript uses **control flow analysis** — it follows the branches of your code and narrows the type based on what checks you've already done. After the `if (typeof value === "string")` check, TypeScript knows `value` is a `string` and allows `.toUpperCase()`. Without the check, `.toUpperCase()` on `string | number | boolean` would be an error.

## instanceof narrowing

`instanceof` narrows class types.

```typescript
class NetworkError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

class ValidationError extends Error {
  fields: string[];
  constructor(message: string, fields: string[]) {
    super(message);
    this.fields = fields;
  }
}

function handleError(error: NetworkError | ValidationError): string {
  if (error instanceof NetworkError) {
    return `Network ${error.statusCode}: ${error.message}`;
  } else {
    return `Validation failed on: ${error.fields.join(", ")}`;
  }
}
```

```text
handleError(new NetworkError("Not Found", 404))
// → "Network 404: Not Found"

handleError(new ValidationError("Invalid input", ["email", "password"]))
// → "Validation failed on: email, password"
```

**CS lens:** TypeScript's control flow analysis is a form of **abstract interpretation** — the compiler interprets the code abstractly to determine what types are possible at each point. This is the same technique used by static analysis tools and verifiers. The key insight: branching on a runtime check gives the compiler information it can use statically.

## Custom type guards — is predicates

When `typeof` and `instanceof` aren't enough (for plain objects), write a **type predicate** — a function that returns `value is Type`.

```typescript
interface AdminUser {
  role: "admin";
  permissions: string[];
}
interface StudentUser {
  role: "student";
  enrolledCourses: string[];
}

type AppUser = AdminUser | StudentUser;

function isAdmin(user: AppUser): user is AdminUser {
  return user.role === "admin";
}

function getPermissions(user: AppUser): string[] {
  if (isAdmin(user)) {
    // TypeScript narrows user to AdminUser here
    return user.permissions;
  }
  // TypeScript narrows user to StudentUser here
  return [];
}
```

```text
const admin: AppUser = { role: "admin", permissions: ["read", "write", "delete"] };
const student: AppUser = { role: "student", enrolledCourses: ["python", "css"] };

getPermissions(admin)    // → ["read", "write", "delete"]
getPermissions(student)  // → []
```

## The in operator — narrowing by property

`"property" in object` narrows to the type(s) that have that property.

```typescript
interface Circle { kind: "circle"; radius: number }
interface Rectangle { kind: "rect"; width: number; height: number }
type Shape = Circle | Rectangle;

function area(shape: Shape): number {
  if ("radius" in shape) {
    // TypeScript: shape is Circle here
    return Math.PI * shape.radius ** 2;
  } else {
    // TypeScript: shape is Rectangle here
    return shape.width * shape.height;
  }
}
```

```text
area({ kind: "circle", radius: 5 })          // → 78.54
area({ kind: "rect", width: 4, height: 6 })  // → 24
```

**SE lens:** Narrowing is the TypeScript-idiomatic alternative to casting (`as`). Casting (`value as string`) tells TypeScript "trust me, this is a string" — it removes the error but doesn't add any safety. Narrowing (`typeof value === "string"`) proves to TypeScript that the value is a string at runtime, which is actually true. In production code, `as` should appear rarely (only when you genuinely know more than the compiler) — narrowing is almost always the right approach.

**Common mistakes:**
- Using `as` to silence a type error instead of narrowing — `(value as string).toUpperCase()` will crash at runtime if `value` isn't actually a string. Narrowing is safe; casting is a lie.
- Writing type guards that can return the wrong answer — `user is AdminUser` is a promise to TypeScript. If your predicate logic is wrong, TypeScript trusts it and you get runtime crashes.

**Debug tip:** When TypeScript narrows unexpectedly (claims a value is `never`), it means all possible types have been eliminated by prior checks. This usually signals a logic error — review your conditions.

**Next:** Classes and access modifiers — TypeScript's class system with `private`, `protected`, `public`, and `readonly`.

## Challenge: type_guard

Write a type guard function.

Write `isString(value: unknown): value is string` — returns `true` if the value is a string.
Then use it in `processValue(value: unknown): string` — returns the uppercase string if it's a string, or `"not a string"` otherwise.

```challenge typescript
function isString(value: unknown): value is string {
  // implement the type guard
}

function processValue(value: unknown): string {
  if (isString(value)) {
    return value.toUpperCase();
  }
  return "not a string";
}
```

```test
assert isString("hello") === true
assert isString(42) === false
assert isString(null) === false
assert processValue("world") === "WORLD"
assert processValue(99) === "not a string"
assert processValue(null) === "not a string"
```
