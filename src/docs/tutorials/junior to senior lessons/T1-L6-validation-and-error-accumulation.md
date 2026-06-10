# Junior to Senior — T1·L6 — Validation Patterns and Error Accumulation

**Prerequisites:** T1·L5 (Parsing Without Regex). You can parse CSV files.
This lesson covers how to validate parsed data and report every problem — not
just the first one.

**What this lab adds:**
- Fail-fast vs error accumulation — two validation strategies
- The `Result<T, E>` type — returning errors without throwing
- Collecting all validation errors in a single pass
- Reporting errors with row, field, and reason context
- The `zod` library — introduced as a preview of typed schema validation

**Time:** 60–90 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. A form has 10 fields. A user submits it. The server validates field 1,
>    finds an error, and returns immediately. What does the user experience?
>    Why is this frustrating?
> 2. What is the difference between throwing an error and returning a
>    `Result` type? When is each appropriate?
> 3. `zod` validates a string as an email. What two things does it give you?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

A contact import validator that processes an entire CSV and reports every
problem in one pass:

```
$ npx ts-node validate-contacts.ts

Validating contacts.csv...

Row 3 — Field 'email': "not-an-email" is not a valid email address
Row 4 — Field 'name':  Value is required (got empty string)
Row 6 — Field 'city':  "Lon don" contains invalid characters
Row 7 — (row): Expected 3 fields, got 2

Validation complete: 4 valid rows, 3 rows with errors

Valid contacts ready to import:
  Alice <alice@example.com> — London
  Bob <bob@example.com> — Paris
  ...
```

---

### Concept: Fail-Fast vs Error Accumulation

**What it is:** Two strategies for handling validation failures.

**Fail-fast:** Stop at the first error, report it, return immediately.

```ts
function validateRow(parts: string[]): Contact {
  if (parts.length !== 3) throw new Error('Wrong field count');  // stops here
  if (!parts[1].includes('@')) throw new Error('Invalid email'); // never reached
  return { name: parts[0], email: parts[1], city: parts[2] };
}
```

**Error accumulation:** Continue past all errors, collect them all, report at the end.

```ts
function validateRow(parts: string[]): ValidationResult {
  const errors: string[] = [];
  if (parts.length !== 3) errors.push('Wrong field count');
  if (parts[1] && !parts[1].includes('@')) errors.push('Invalid email');
  // ... more checks ...
  return errors.length === 0
    ? { kind: 'ok', contact: { ... } }
    : { kind: 'error', errors };
}
```

**When to use each:**

| Use fail-fast | Use error accumulation |
|---|---|
| Programming errors (bugs) — throw immediately | User input — show all problems at once |
| Security failures — abort and log | File imports — report all bad rows |
| Unrecoverable state | Form submissions — let user fix everything |
| When the first error prevents all subsequent checks | When checks are independent |

**The canonical user experience difference:**

*Fail-fast for user input:*
1. User fills in a 10-field form
2. Submits
3. Server returns "email is invalid"
4. User fixes email, submits again
5. Server returns "phone is missing"
6. User fixes phone, submits again
7. Server returns "city is required"
8. → Three round trips to find three problems that could have been reported in one

*Error accumulation:*
1. User fills in form
2. Submits
3. Server returns: "email invalid, phone missing, city required"
4. User fixes all three, submits
5. → One round trip for all three problems

**You will see this again in:** Form libraries (react-hook-form + zod), CSV
importers, any "batch validation" scenario. Error accumulation is the correct
default for user-facing validation.

---

### Concept: `Result<T, E>` — Returning Errors Without Throwing

**What it is:** A `Result` type represents a computation that can succeed (`ok`)
or fail (`error`). Instead of throwing exceptions, functions return a value
that encodes both outcomes.

**The problem before:**

```ts
// Throw-based — caller must remember to try/catch:
function validate(contact: unknown): Contact {
  if (!isContact(contact)) throw new Error('Invalid contact');
  return contact;
}

// Easy to forget:
const contact = validate(data);  // runtime crash if data is invalid
contact.email;                    // never runs if validate threw
```

**The solution:**

```ts
type Result<T, E = string> =
  | { kind: 'ok';    value: T }
  | { kind: 'error'; errors: E[] };

function validate(contact: unknown): Result<Contact> {
  // Returns a result — never throws
}

const result = validate(data);
if (result.kind === 'ok') {
  result.value.email;  // safe
} else {
  result.errors.forEach(e => console.error(e));
}
```

**What it hides:** `Result` hides the exception handling ceremony. There is
no `try/catch`, no possibility of an unhandled exception propagating up the
call stack. The error is data — it is in the return value where you must deal with it.

The invariant: a `Result` is always one of two states. It is never partially
constructed. The caller always knows whether the operation succeeded.

**Canonical example:** A `Result` is like a bank transaction receipt. It always
says either "APPROVED — balance: $X" or "DECLINED — reason: insufficient funds."
It never disappears. You cannot lose track of a declined transaction the way
you can lose track of a thrown exception.

**You will see this again in:** Rust's `Result<T, E>` (the language enforces
handling it), Go's `(value, error)` return pattern, every robust TypeScript
validation library, the G-code parser in Topic 9.

**Watch for:** `Result` can make code verbose if overused. Use `throw` for
programming errors (bugs, violated invariants) and `Result` for expected
failure cases (user input validation, file parsing, API responses).

---

## Step 1 — Define the Validation Infrastructure

Create `validate-contacts.ts`:

```ts
import * as fs   from 'fs';
import * as path from 'path';

// ── Result type ─────────────────────────────────────────────────────────

type ValidationError = {
  row:     number;
  field:   string;
  message: string;
};

type RowResult =
  | { kind: 'ok';    contact: Contact; row: number }
  | { kind: 'error'; errors: ValidationError[]; row: number };

interface Contact { name: string; email: string; city: string }

// ── Validators ──────────────────────────────────────────────────────────

function validateName(value: string, row: number): ValidationError | null {
  if (value.trim().length === 0) {
    return { row, field: 'name', message: 'Value is required (got empty string)' };
  }
  return null;  // no error
}

function validateEmail(value: string, row: number): ValidationError | null {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return { row, field: 'email', message: 'Value is required' };
  }
  if (!trimmed.includes('@') || !trimmed.includes('.')) {
    return { row, field: 'email', message: `"${trimmed}" is not a valid email address` };
  }
  return null;
}

function validateCity(value: string, row: number): ValidationError | null {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return { row, field: 'city', message: 'Value is required' };
  }
  if (/[^a-zA-Z\s\-]/.test(trimmed)) {
    return { row, field: 'city', message: `"${trimmed}" contains invalid characters` };
  }
  return null;
}
```

### SAVE AND TRY

```bash
npx ts-node validate-contacts.ts
```

Expected: no output — we have only defined types and functions so far.

**Change something:** Call `validateEmail('not-an-email', 1)` and log the result.
Expected: `{ row: 1, field: 'email', message: '"not-an-email" is not a valid email address' }`.
Call `validateEmail('alice@example.com', 1)` — expected: `null` (no error).

---

## Step 2 — Accumulate All Errors Per Row

```ts
// ── Row validator — accumulates ALL errors, does not stop at first ─────

function validateRow(fields: string[], rowNumber: number): RowResult {
  const errors: ValidationError[] = [];

  // Wrong field count — report this and stop (other checks would crash):
  if (fields.length !== 3) {
    return {
      kind: 'error',
      errors: [{
        row:     rowNumber,
        field:   '(row)',
        message: `Expected 3 fields, got ${fields.length}`,
      }],
      row: rowNumber,
    };
  }

  const [name, email, city] = fields;

  // Run all validators — push errors into the array (do NOT return early):
  const nameError  = validateName(name, rowNumber);
  const emailError = validateEmail(email, rowNumber);
  const cityError  = validateCity(city, rowNumber);

  if (nameError)  errors.push(nameError);
  if (emailError) errors.push(emailError);
  if (cityError)  errors.push(cityError);

  if (errors.length > 0) {
    return { kind: 'error', errors, row: rowNumber };
  }

  return {
    kind:    'ok',
    contact: { name: name.trim(), email: email.trim(), city: city.trim() },
    row:     rowNumber,
  };
}
```

### SAVE AND TRY

Add a test call at the bottom:

```ts
const testRow = validateRow(['', 'not-an-email', 'Lon don'], 5);
console.log(JSON.stringify(testRow, null, 2));
```

```bash
npx ts-node validate-contacts.ts
```

Expected:
```json
{
  "kind": "error",
  "errors": [
    { "row": 5, "field": "name",  "message": "Value is required (got empty string)" },
    { "row": 5, "field": "email", "message": "\"not-an-email\" is not a valid email address" },
    { "row": 5, "field": "city",  "message": "\"Lon don\" contains invalid characters" }
  ],
  "row": 5
}
```

**All three errors are reported** from a single row. Without error accumulation,
the first error (name required) would have stopped execution and the email and
city errors would never be found.

**Change something:** Add `return { kind: 'error', ... }` after the `nameError` check:
```ts
if (nameError) { errors.push(nameError); return { kind: 'error', errors, row: rowNumber }; }
```
Run again. Only the name error appears now — fail-fast. Remove the early return.

---

## Step 3 — Process the Entire File

Create `contacts-to-validate.csv`:

```
Alice,alice@example.com,London
Bob,bob@example.com,Paris
invalid,not-an-email,Berlin
,charlie@example.com,Madrid
Dave,dave@example.com,Lon don
Eve,eve@example.com
```

Add the full processing loop:

```ts
console.log('Validating contacts.csv...\n');

const csvPath = path.join(__dirname, 'contacts-to-validate.csv');
const raw     = fs.readFileSync(csvPath, 'utf-8');

const rowResults: RowResult[] = raw
  .split(/\r?\n/)
  .map((line, index) => ({ line: line.trim(), rowNumber: index + 1 }))
  .filter(({ line }) => line.length > 0)
  .map(({ line, rowNumber }) => {
    const fields = line.split(',').map(f => f.trim());
    return validateRow(fields, rowNumber);
  });

// Separate ok from errors:
const validRows   = rowResults.filter((r): r is Extract<RowResult, {kind:'ok'}>  => r.kind === 'ok');
const errorRows   = rowResults.filter((r): r is Extract<RowResult, {kind:'error'}> => r.kind === 'error');

// Report all errors first:
errorRows.forEach(result => {
  result.errors.forEach(err => {
    console.log(`Row ${err.row} — Field '${err.field}': ${err.message}`);
  });
});

console.log(`\nValidation complete: ${validRows.length} valid rows, ${errorRows.length} rows with errors`);

if (validRows.length > 0) {
  console.log('\nValid contacts ready to import:');
  validRows.forEach(r => {
    const { name, email, city } = r.contact;
    console.log(`  ${name} <${email}> — ${city}`);
  });
}
```

### SAVE AND TRY

```bash
npx ts-node validate-contacts.ts
```

Expected:
```
Validating contacts.csv...

Row 3 — Field 'email': "not-an-email" is not a valid email address
Row 4 — Field 'name': Value is required (got empty string)
Row 5 — Field 'city': "Lon don" contains invalid characters
Row 6 — (row): Expected 3 fields, got 2

Validation complete: 2 valid rows, 4 rows with errors

Valid contacts ready to import:
  Alice <alice@example.com> — London
  Bob <bob@example.com> — Paris
```

**Change something:** Add `invalid,valid@test.com,` (empty city) as a new row.
It should produce a city "Value is required" error. The empty field after the
last comma is `''` — the trim and required check catches it.

---

### Concept: `zod` — Typed Schema Validation (Preview)

**What it is:** `zod` is a TypeScript-first schema validation library.
You define the schema once, and `zod` generates both the TypeScript type and
the runtime validation logic from it.

**The problem before:**

```ts
// Manual — two places to maintain (the interface AND the validator):
interface Contact { name: string; email: string; city: string }

function isContact(x: unknown): x is Contact {
  return typeof x === 'object' && x !== null &&
    typeof (x as any).name  === 'string' &&
    typeof (x as any).email === 'string' &&
    // ...
}
```

**The solution:**

```ts
import { z } from 'zod';

const ContactSchema = z.object({
  name:  z.string().min(1, 'Name is required'),
  email: z.string().email('Not a valid email'),
  city:  z.string().min(1, 'City is required'),
});

// TypeScript type derived automatically from the schema:
type Contact = z.infer<typeof ContactSchema>;

// Validate — returns errors or the typed value:
const result = ContactSchema.safeParse(incoming);
if (result.success) {
  result.data.email;  // typed as string — TypeScript knows
} else {
  result.error.issues; // array of validation errors
}
```

**What it hides:** `zod` hides the manual correlation between type definition
and validator function. Define the schema once; get the type and the validator
for free.

The invariant: `z.infer<typeof Schema>` produces exactly the TypeScript type
that the schema validates. They are always in sync — change the schema,
the type changes automatically.

**Smallest possible example:**
```ts
import { z } from 'zod';

const UserSchema = z.object({
  name:  z.string(),
  age:   z.number().min(0).max(150),
  email: z.string().email(),
});

type User = z.infer<typeof UserSchema>;
// { name: string; age: number; email: string }

UserSchema.safeParse({ name: 'Alice', age: 30, email: 'alice@example.com' });
// { success: true, data: { name: 'Alice', age: 30, email: 'alice@example.com' } }

UserSchema.safeParse({ name: 'Bob', age: -1, email: 'not-email' });
// { success: false, error: { issues: [{ path: ['age'], ... }, { path: ['email'], ... }] } }
```

**You will see this again in:** Topic 6 (React + react-hook-form uses zod for
form validation), Topic 5 (Pydantic in Python is the equivalent), every API
that validates incoming requests. Zod is the standard for TypeScript validation.

**Career signal:** "Which validation library would you use for TypeScript?"
— `zod` is the current standard answer. Knowing why (`z.infer` eliminates
type/validator duplication) demonstrates understanding, not just familiarity.

---

## Step 4 — Preview of `zod` Validation

Install zod:

```bash
npm install zod
```

Add a zod-based validator alongside the manual one:

```ts
import { z } from 'zod';

const ContactSchema = z.object({
  name:  z.string().min(1, { message: 'Name is required' }),
  email: z.string().email({ message: 'Not a valid email address' }),
  city:  z.string().min(1, { message: 'City is required' })
            .regex(/^[a-zA-Z\s\-]+$/, { message: 'City contains invalid characters' }),
});

type ZodContact = z.infer<typeof ContactSchema>;

// Validate one row with zod:
function validateWithZod(fields: string[], rowNumber: number): RowResult {
  const [name, email, city] = fields;
  const result = ContactSchema.safeParse({ name, email, city });

  if (result.success) {
    return { kind: 'ok', contact: result.data, row: rowNumber };
  }

  const errors: ValidationError[] = result.error.issues.map(issue => ({
    row:     rowNumber,
    field:   issue.path.join('.'),
    message: issue.message,
  }));

  return { kind: 'error', errors, row: rowNumber };
}

// Test:
console.log('\n--- Zod Validation ---');
const zodResult = validateWithZod(['', 'not-an-email', 'Berlin'], 99);
console.log(zodResult.kind, zodResult.kind === 'error' ? zodResult.errors : zodResult.contact);
```

### SAVE AND TRY

```bash
npx ts-node validate-contacts.ts
```

Expected new output at the bottom:
```
--- Zod Validation ---
error [
  { row: 99, field: 'name',  message: 'Name is required' },
  { row: 99, field: 'email', message: 'Not a valid email address' }
]
```

**Change something:** In `ContactSchema`, change the email schema to
`z.string().min(1).email()`. The error for an empty email changes — `min(1)`
fires first with "String must contain at least 1 character(s)", before the
email check runs. Order of chained validators matters in zod.

---

## 🎯 Challenge: Validate the Entire CSV with Zod

**You know:** Error accumulation, `Result` types, `zod` schema validation.

**Task:** Replace the manual validators (`validateName`, `validateEmail`,
`validateCity`, `validateRow`) with a single `validateRowWithZod` function that
uses the `ContactSchema` and produces the same `RowResult` type.

Process the entire CSV using the new function and confirm the same errors appear
as with the manual version.

**Requirements:**
- Use `ContactSchema.safeParse` instead of manual checks
- The output format must match (same field names, same messages style)
- Keep the same `RowResult` discriminated union return type

Try for at least 10 minutes before revealing the solution.

---

<details>
<summary>▶ Show Solution</summary>

```ts
function validateRowWithZod(fields: string[], rowNumber: number): RowResult {
  // Wrong field count — zod can't help here (it validates object shapes):
  if (fields.length !== 3) {
    return {
      kind: 'error',
      errors: [{ row: rowNumber, field: '(row)', message: `Expected 3 fields, got ${fields.length}` }],
      row: rowNumber,
    };
  }

  const [name, email, city] = fields.map(f => f.trim());
  const result = ContactSchema.safeParse({ name, email, city });

  if (result.success) {
    return { kind: 'ok', contact: result.data, row: rowNumber };
  }

  const errors: ValidationError[] = result.error.issues.map(issue => ({
    row:     rowNumber,
    field:   String(issue.path[0] ?? '(unknown)'),
    message: issue.message,
  }));

  return { kind: 'error', errors, row: rowNumber };
}

// Replace validateRow with validateRowWithZod in the processing loop:
const zodRowResults: RowResult[] = raw
  .split(/\r?\n/)
  .map((line, index) => ({ line: line.trim(), rowNumber: index + 1 }))
  .filter(({ line }) => line.length > 0)
  .map(({ line, rowNumber }) => {
    const fields = line.split(',');
    return validateRowWithZod(fields, rowNumber);
  });
```

**Key insight:** Zod removes the manual validator functions entirely. The schema
IS the validator. `safeParse` returns all errors at once (by default — zod
accumulates errors across all fields). The only logic you still write is the
field-count check (before zod sees the data) and the error format mapping
(from zod's issue format to your `ValidationError` format). The domain rules
(email format, required fields, city character set) live in the schema.

</details>

---

## Final Check

| What to verify | How to verify | Expected result |
|---|---|---|
| Error accumulation | Validate row with 3 errors | Returns all 3 errors |
| Fail-fast behavior | Add early return to validator | Only first error returned |
| `Result` type | Validate valid row | `{ kind: 'ok', contact: ... }` |
| `Result` errors | Validate invalid row | `{ kind: 'error', errors: [...] }` |
| `zod` schema derives type | `type C = z.infer<typeof ContactSchema>` | Same as manual interface |
| `zod` accumulates errors | `safeParse` with 2 invalid fields | Returns 2 issues |

---

## Quick Check Answers

**1. Fail-fast for user input — what is the experience? Why frustrating?**

The user fills in a 10-field form, submits, and receives one error. They fix it,
submit again, and receive a different error. They fix that, submit again — another
error. They must submit the form 10 times to discover 10 problems that could have
been reported in one response. This is the classic fail-fast frustration:
the server answers "what is the first thing wrong?" instead of "what are ALL
the things wrong?" Error accumulation changes the server's answer to the latter.

**2. Throwing an error vs returning a `Result`?**

Throwing an exception interrupts the normal control flow. The exception propagates
up the call stack until it is caught by a `try/catch` block. If no `catch` exists,
the program crashes. The caller must remember to use `try/catch` — forgetting is
silent until runtime. `Result` is a normal return value. The caller must inspect
it before using the value — they cannot ignore it the way they can ignore a thrown
exception (in TypeScript, if the function signature includes `Result`, the compiler
can remind them to check). Throw for programming errors (bugs, violated invariants).
Use `Result` for expected failure cases where the caller must handle the failure.

**3. What does `zod` give you from a schema definition?**

Two things: (1) a **TypeScript type** derived via `z.infer<typeof Schema>` — the
exact type that the schema validates, always in sync with the schema definition,
and (2) a **runtime validator** — `schema.parse(data)` or `schema.safeParse(data)`
that checks actual data at runtime and returns structured error information.
Without zod, you write the interface separately from the validator function, and
they can diverge. With zod, the schema is the single source of truth for both.
