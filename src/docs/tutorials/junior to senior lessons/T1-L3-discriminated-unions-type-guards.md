# Junior to Senior — T1·L3 — Discriminated Unions and Type Guards

**Prerequisites:** T1·L2 (Generics and Utility Types). You know how to write
generic reusable code. This lesson covers how to model a value that can be
one of several distinct shapes — and how TypeScript narrows the type based on runtime checks.

**What this lab adds:**
- Discriminated unions — a shared `kind` or `type` field that identifies the variant
- Type narrowing — TypeScript refining a type inside conditional blocks
- `typeof`, `instanceof`, `in` — the three built-in narrowing operators
- Custom type predicates — `(x): x is T` for reusable narrowing functions
- Exhaustive checks with `never` (from T1·L1, now applied to union types)

**Time:** 60–90 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. You have `type Shape = Circle | Rectangle`. Inside `if (shape.kind === 'circle')`,
>    what type does TypeScript infer for `shape`?
> 2. What is the difference between `typeof x === 'string'` and `x instanceof String`?
> 3. A function has signature `(x: unknown): x is Contact`. What does returning
>    `true` from this function tell TypeScript?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

A contact notification system where messages can be emails, SMS texts, or
push notifications — each with different required fields:

```
$ npx ts-node unions.ts

--- Discriminated Union ---
Sending email to alice@example.com: subject="Welcome"
Sending SMS to +44-7700-000001: 160 chars
Sending push to device-token-xyz: badge=1

--- Type Guards ---
Contact Alice has valid email
Contact Bob has valid phone
Unknown data: not a Contact

--- Exhaustive Check ---
All notification types handled
```

---

### Concept: Discriminated Unions

**What it is:** A discriminated union (also called a tagged union or algebraic
data type) is a union where each member has a shared literal field — the
*discriminant* — that uniquely identifies which variant you have.

**The problem before:**

```ts
// Without discriminant — must check every possible field:
interface Notification {
  email?:       string;  // present for email notifications
  phone?:       string;  // present for SMS
  deviceToken?: string;  // present for push
  message:      string;
}

function send(n: Notification): void {
  if (n.email) {
    // Is this email? Or could both email and phone be set?
    // TypeScript does not know — every field is optional
  }
}
```

This model is ambiguous and unsafe: a notification could have `email`, `phone`,
AND `deviceToken` all set — which does not make sense.

**The solution:**

```ts
type Notification =
  | { kind: 'email'; to: string; subject: string; body: string }
  | { kind: 'sms';   to: string; message: string }
  | { kind: 'push';  deviceToken: string; title: string; badge: number };

function send(n: Notification): void {
  switch (n.kind) {
    case 'email': n.to;     n.subject;  break;  // TypeScript knows all email fields
    case 'sms':   n.to;     n.message;  break;  // TypeScript knows all SMS fields
    case 'push':  n.deviceToken; n.badge; break; // TypeScript knows all push fields
  }
}
```

**What it hides:** The discriminant hides the need to manually guard every
optional field. TypeScript narrows the union type based on the `kind` field —
inside `case 'email'`, only `EmailNotification` fields exist.

The invariant: every member of the union must have the same discriminant field
with a unique literal value. TypeScript uses this to narrow exhaustively.
Each variant is its own complete type — no fields are optional.

**Canonical example:** A discriminated union is like a sorted mail tray.
Each slot has a label (`kind`). When you pick up a letter from the "PRIORITY" slot,
you know it is a priority letter — it has a priority stamp, a delivery date, and
all the fields a priority letter has. You do not need to check each field manually.

**Smallest possible example:**
```ts
type Result<T> =
  | { kind: 'ok';    value: T }
  | { kind: 'error'; message: string };

function handle<T>(result: Result<T>): void {
  if (result.kind === 'ok') {
    console.log(result.value);    // TypeScript knows .value exists
  } else {
    console.log(result.message);  // TypeScript knows .message exists
  }
}
```

**You will see this again in:** Every domain model with variants (payment: card/bank/wallet,
geometry: line/arc/circle, operation: contour/pocket/drill). The `Result<T, E>`
pattern (ok/error) used throughout functional TypeScript. Redux/Zustand actions.
React Router's route match types.

**Career signal:** Discriminated unions are a core TypeScript interview topic.
"How would you model a value that can be one of several shapes?" — the answer is
a discriminated union.

**Watch for:** The discriminant must be a *literal* type, not `string` or `number`.
`kind: string` does not discriminate — TypeScript cannot narrow on it.
The discriminant field must have a specific literal value in each variant.

---

## Step 1 — Define and Use a Discriminated Union

Create `unions.ts`:

```ts
console.log('--- Discriminated Union ---');

// Each notification type is a distinct shape with a 'kind' discriminant:
type EmailNotification = {
  kind:    'email';
  to:      string;
  subject: string;
  body:    string;
};

type SmsNotification = {
  kind:    'sms';
  to:      string;
  message: string;
};

type PushNotification = {
  kind:        'push';
  deviceToken: string;
  title:       string;
  badge:       number;
};

// The union — a Notification is exactly ONE of these three:
type Notification = EmailNotification | SmsNotification | PushNotification;

// A function that handles all three variants — TypeScript ensures completeness:
function send(notification: Notification): void {
  switch (notification.kind) {
    case 'email':
      // Inside this case, TypeScript narrows to EmailNotification:
      console.log(`Sending email to ${notification.to}: subject="${notification.subject}"`);
      break;
    case 'sms':
      // TypeScript narrows to SmsNotification:
      console.log(`Sending SMS to ${notification.to}: ${notification.message.length} chars`);
      break;
    case 'push':
      // TypeScript narrows to PushNotification:
      console.log(`Sending push to ${notification.deviceToken}: badge=${notification.badge}`);
      break;
    default: {
      // Exhaustive check — if a new kind is added but not handled, this fails:
      const exhausted: never = notification;
      throw new Error(`Unhandled notification kind: ${JSON.stringify(exhausted)}`);
    }
  }
}

send({ kind: 'email', to: 'alice@example.com', subject: 'Welcome', body: 'Hello!' });
send({ kind: 'sms',   to: '+44-7700-000001',   message: 'Your code is 123456' });
send({ kind: 'push',  deviceToken: 'device-token-xyz', title: 'New message', badge: 1 });
```

### SAVE AND TRY

```bash
npx ts-node unions.ts
```

Expected:
```
--- Discriminated Union ---
Sending email to alice@example.com: subject="Welcome"
Sending SMS to +44-7700-000001: 20 chars
Sending push to device-token-xyz: badge=1
```

**Change something:** Add a `case 'email':` branch and try accessing
`notification.deviceToken` inside it. Expected compile error: `Property 'deviceToken'
does not exist on type 'EmailNotification'`. TypeScript knows the exact type inside
each case.

---

### Concept: Type Guards — Narrowing at Runtime

**What it is:** Type guards are expressions or functions that TypeScript recognises
as narrowing the type of a value within a conditional block.

**Three built-in type guards:**

**`typeof`** — narrows primitive types:
```ts
function process(value: string | number): void {
  if (typeof value === 'string') {
    value.toUpperCase();  // value: string here
  } else {
    value.toFixed(2);     // value: number here
  }
}
```

**`instanceof`** — narrows class instances:
```ts
function handleError(error: unknown): void {
  if (error instanceof Error) {
    console.log(error.message);  // error: Error here
  }
}
```

**`in`** — narrows to types that have a specific property:
```ts
type Contact = { name: string; email: string };
type Location = { city: string; country: string };

function describe(value: Contact | Location): void {
  if ('email' in value) {
    value.email;  // value: Contact here
  } else {
    value.city;   // value: Location here
  }
}
```

**What it hides:** Type guards hide the manual casting that would otherwise be
required. Without them, you would write `(value as Contact).email` everywhere —
which is unsafe (the cast can be wrong). With type guards, TypeScript narrows
the type safely based on actual runtime checks.

The invariant: type narrowing only applies within the block where the guard holds.
Outside the `if`, the type returns to its wider form.

**Canonical example:** A type guard is like a security clearance check.
Before the checkpoint: your role is "person" — unknown access level.
After passing the `isEmployee` check: your role is "employee" — specific
permissions apply. The check is a runtime verification; the narrowed type is
TypeScript's response.

**Smallest possible example:**
```ts
function formatValue(value: string | number | boolean): string {
  if (typeof value === 'string')  return value.toUpperCase();
  if (typeof value === 'number')  return value.toFixed(2);
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  const _: never = value;  // exhaustive — all cases handled
  return _;
}
```

**You will see this again in:** Error handling (`instanceof Error`), API response
parsing, React component prop handling, every function that accepts a union type.

**Watch for:** `typeof null === 'object'` — a famous JavaScript quirk. Checking
`typeof value === 'object'` does NOT exclude `null`. Always add `value !== null`
when checking for object types with `typeof`.

---

## Step 2 — Type Guards

```ts
console.log('\n--- Type Guards ---');

interface Contact { name: string; email?: string; phone?: string }

// Custom type guard using 'in' operator:
function hasEmail(contact: Contact): contact is Contact & { email: string } {
  return typeof contact.email === 'string' && contact.email.length > 0;
}

function hasPhone(contact: Contact): contact is Contact & { phone: string } {
  return typeof contact.phone === 'string' && contact.phone.length > 0;
}

const contacts: Contact[] = [
  { name: 'Alice', email: 'alice@example.com' },
  { name: 'Bob',   phone: '+44-7700-000001'   },
];

// unknown value from an API — use instanceof + typeof for narrowing:
const apiData: unknown = { name: 'Carol', email: 'carol@example.com' };

// Check if it is a Contact-shaped object:
function isContact(value: unknown): value is Contact {
  return (
    typeof value === 'object' &&
    value !== null &&              // typeof null === 'object' — must exclude
    'name' in value &&
    typeof (value as Record<string, unknown>).name === 'string'
  );
}

contacts.forEach(c => {
  if (hasEmail(c)) {
    console.log(`Contact ${c.name} has valid email`);  // c.email is string here
  } else if (hasPhone(c)) {
    console.log(`Contact ${c.name} has valid phone`);  // c.phone is string here
  }
});

if (isContact(apiData)) {
  console.log(`API contact: ${apiData.name}`);
} else {
  console.log('Unknown data: not a Contact');
}
```

### SAVE AND TRY

```bash
npx ts-node unions.ts
```

Expected:
```
--- Type Guards ---
Contact Alice has valid email
Contact Bob has valid phone
API contact: Carol
```

**Change something:** Change `apiData` to `JSON.parse('"just a string"')`.
`isContact` returns `false` — a string is not an object. The else branch prints
"Unknown data: not a Contact".

---

### Concept: Custom Type Predicates

**What it is:** A type predicate is a function return type annotation of the
form `(x): x is SpecificType` that tells TypeScript: "if this function returns
`true`, narrow `x` to `SpecificType`."

**The problem before:**

```ts
// Inline type checks are not reusable:
if (typeof value === 'object' && value !== null && 'email' in value) {
  // Works here — but you must repeat this everywhere
}
```

**The solution:**

```ts
function isEmailContact(value: unknown): value is { name: string; email: string } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'name' in value &&
    'email' in value
  );
}

// Reusable everywhere — the narrowing is encapsulated:
if (isEmailContact(incoming)) {
  incoming.email; // TypeScript narrows to { name: string; email: string }
}
```

**What it hides:** The type predicate hides the repetition of complex type checks.
The check is written once, tested once, named clearly, and reused everywhere.
TypeScript trusts the predicate — if `isEmailContact` returns `true`, TypeScript
narrows accordingly.

The invariant: TypeScript trusts you completely. If you return `true` from a
type predicate function but the value is actually the wrong type, TypeScript
will not catch it at runtime. The predicate's correctness is your responsibility.

**Canonical example:** A type predicate is like a notarised certificate.
"I hereby certify that this value is an EmailContact." The notary (TypeScript)
trusts the certificate — after seeing it, you get EmailContact access.
If the certificate is fraudulent (the predicate returns `true` incorrectly),
that is the issuer's fault, not the notary's.

**Smallest possible example:**
```ts
function isString(value: unknown): value is string {
  return typeof value === 'string';
}

const maybeString: unknown = 'hello';
if (isString(maybeString)) {
  maybeString.toUpperCase(); // safe — TypeScript narrowed to string
}
```

**You will see this again in:** Data validation at API boundaries, parsing untrusted
JSON, filtering arrays to a specific type (`array.filter((x): x is SpecificType => ...)`),
any place where you check a type once and want to reuse that check.

**Watch for:** A type predicate MUST accurately reflect what the runtime check
actually validates. A buggy predicate that returns `true` for the wrong type
causes runtime crashes that TypeScript cannot detect. Always test type predicates
thoroughly.

---

## Step 3 — Exhaustive Check Applied

```ts
console.log('\n--- Exhaustive Check ---');

type Channel = 'email' | 'sms' | 'push';

function getChannelLabel(channel: Channel): string {
  switch (channel) {
    case 'email': return 'Email';
    case 'sms':   return 'SMS Text';
    case 'push':  return 'Push Notification';
    default: {
      // TypeScript infers 'never' here — proves all cases are handled.
      // Add 'webhook' to Channel and this becomes a compile error immediately:
      const exhausted: never = channel;
      throw new Error(`Unhandled channel: ${exhausted}`);
    }
  }
}

const channels: Channel[] = ['email', 'sms', 'push'];
channels.forEach(c => console.log(`${c}: ${getChannelLabel(c)}`));
console.log('All notification types handled');
```

### SAVE AND TRY

```bash
npx ts-node unions.ts
```

Expected:
```
--- Exhaustive Check ---
email: Email
sms: SMS Text
push: Push Notification
All notification types handled
```

**Change something:** Add `'webhook'` to the `Channel` union:
`type Channel = 'email' | 'sms' | 'push' | 'webhook'`. TypeScript immediately
reports a compile error at the `never` assignment — `'webhook'` is not `never`.
Add `case 'webhook': return 'Webhook'` and the error disappears. The compiler
enforced the update.

---

## 🎯 Challenge: Result Type

**You know:** Discriminated unions, type guards, and type predicates.

**Task:** Implement a `Result<T, E>` discriminated union and helper functions
that make it easy to work with values that either succeed or fail.

```ts
// Your Result type:
type Result<T, E> = { kind: 'ok'; value: T } | { kind: 'error'; error: E };

// These functions should work:
const ok     = Result.ok(42);          // { kind: 'ok', value: 42 }
const err    = Result.error('not found'); // { kind: 'error', error: 'not found' }

Result.isOk(ok);       // true
Result.isOk(err);      // false
Result.map(ok, x => x * 2);   // Result.ok(84)
Result.map(err, x => x * 2);  // err unchanged

// Type-safe access:
if (Result.isOk(ok)) {
  ok.value; // TypeScript knows .value exists here
}
```

**Requirements:**
- `Result.ok<T>(value: T): Result<T, never>` — creates a success result
- `Result.error<E>(error: E): Result<never, E>` — creates an error result
- `Result.isOk<T, E>(r: Result<T, E>): r is { kind: 'ok'; value: T }` — type predicate
- `Result.map<T, U, E>(r: Result<T, E>, fn: (v: T) => U): Result<U, E>` — transform the value if ok

Try for at least 10 minutes before revealing the solution.

---

<details>
<summary>▶ Show Solution</summary>

```ts
type Result<T, E> =
  | { kind: 'ok';    value: T }
  | { kind: 'error'; error: E };

// Namespace for helper functions — groups them without a class:
const Result = {
  ok<T>(value: T): Result<T, never> {
    return { kind: 'ok', value };
  },

  error<E>(error: E): Result<never, E> {
    return { kind: 'error', error };
  },

  isOk<T, E>(result: Result<T, E>): result is { kind: 'ok'; value: T } {
    return result.kind === 'ok';
  },

  map<T, U, E>(result: Result<T, E>, fn: (value: T) => U): Result<U, E> {
    if (Result.isOk(result)) {
      return Result.ok(fn(result.value));
    }
    return result; // error passes through unchanged
  },
};

// Tests:
const ok    = Result.ok(42);
const err   = Result.error('not found');

console.log(Result.isOk(ok));            // true
console.log(Result.isOk(err));           // false
console.log(Result.map(ok, x => x * 2)); // { kind: 'ok', value: 84 }
console.log(Result.map(err, x => 0));    // { kind: 'error', error: 'not found' }

if (Result.isOk(ok)) {
  console.log('Value:', ok.value); // TypeScript narrows — .value is safe
}
```

**Key insight:** The `Result<T, never>` return type for `ok` and `Result<never, E>`
for `error` uses `never` for the type that cannot exist in each variant.
When you have `Result<number, never>`, TypeScript knows the error case is impossible.
`map` passes errors through using TypeScript's union narrowing — after the `isOk`
check, the else branch is definitively an error.

</details>

---

## Final Check

| What to verify | How to verify | Expected result |
|---|---|---|
| Discriminant narrows | Access email-only field inside `case 'sms'` | Compile error |
| `typeof` narrows | `if (typeof x === 'string') x.toUpperCase()` | No error |
| `null` trap | `typeof null === 'object'` | `true` — always add `!== null` |
| `instanceof` narrows | `if (e instanceof Error) e.message` | No error |
| `in` narrows | `if ('email' in c) c.email` | No error |
| Predicate trusted | Return `true` with wrong check | Runtime crash — TS trusts you |
| Exhaustive check | Add union member without case | Compile error at `never` |

---

## Quick Check Answers

**1. What type does TypeScript infer inside `if (shape.kind === 'circle')`?**

`Circle` — the specific member of the union where `kind` is the literal `'circle'`.
TypeScript narrows `Shape = Circle | Rectangle` to exactly `Circle` inside the
conditional. Every property unique to `Circle` (like `radius`) is accessible
without casting. Every property unique to `Rectangle` (like `width`) is a
compile error inside this block. This is the entire purpose of the discriminant.

**2. `typeof x === 'string'` vs `x instanceof String`?**

`typeof x === 'string'` checks for the primitive `string` type — the kind you
use 99% of the time. It narrows TypeScript's type to `string`.

`x instanceof String` checks for the `String` wrapper object — a rarely-used
object form of a string created with `new String('hello')`. TypeScript narrows
to `String` (capital S) which is different from `string` (lowercase s).
Almost no code uses `new String(...)` — use `typeof` for primitive string checks.

**3. What does returning `true` from `(x: unknown): x is Contact` tell TypeScript?**

It tells TypeScript that within the `if` block where this predicate returned
`true`, the type of `x` should be treated as `Contact`. TypeScript narrows the
`unknown` type to `Contact` and allows you to access `Contact`'s properties
without explicit casting. TypeScript trusts the predicate completely — if your
predicate incorrectly returns `true` for a non-Contact value, TypeScript will not
detect the error. The predicate is a promise to TypeScript that you validate.
