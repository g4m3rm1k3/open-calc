# OpenMAT — Lesson 07 — Floating Point

## What You Will Build

After this lesson, typing `0.1 + 0.2` produces:

```
>> 0.1 + 0.2
0.3
```

Instead of:

```
>> 0.1 + 0.2
0.30000000000000004
```

The underlying computation is unchanged — `0.1 + 0.2` still produces
`0.30000000000000004` internally. What changes is how the result is
*displayed*. You will also see `0.1 + 0.2 == 0.3` evaluate to `false` in the
calculator, understand exactly why, and know the correct way to compare
floating-point numbers for equality.

---

## What You Need to Know First

Lessons 01–06 are complete. The full `tokenize → parse → evaluate` pipeline runs.
`3 + 4 * 2` prints `11`. `RuntimeError` is thrown for division by zero.
The `switch` statement with type narrowing dispatches over AST node types.

No new dependencies. No new files beyond `src/format.test.ts`.
No changes to `tokenize`, `parse`, or `evaluate` — those are correct.

---

## Concept: Why Computers Cannot Represent 0.1 Exactly

**The problem is binary fractions.**

Decimal fractions express parts of a whole using powers of 10:

```
0.1  =  1/10
0.25 =  1/4  =  25/100
0.75 =  3/4  =  75/100
```

Binary fractions express parts of a whole using powers of 2:

```
0.1₂  =  1/2   = 0.5   in decimal
0.01₂ =  1/4   = 0.25  in decimal
0.001₂ = 1/8   = 0.125 in decimal
```

A fraction that terminates cleanly in binary is one whose denominator is a
power of 2. `0.5` and `0.25` are exact. `0.1` is not — its denominator is 10,
which has the prime factors 2 and 5. The factor of 5 cannot be expressed as a
power of 2, so `0.1` in binary is an infinite repeating pattern, just as `1/3`
in decimal is `0.333...` repeating forever:

```
0.1 (decimal) = 0.000110011001100110011001100... (binary, repeating forever)
```

**IEEE 754 Double Precision**

Every `number` in JavaScript — and every numeric value in OpenMAT — is stored in
IEEE 754 double-precision binary format. *IEEE 754* is the standard published by
the Institute of Electrical and Electronics Engineers in 1985 that defines exactly
how floating-point numbers are stored in hardware. It is called *double precision*
because it uses 64 bits (twice the 32-bit *single precision* format).

The 64 bits are divided into three fields:

```
[ 1 bit: sign ] [ 11 bits: exponent ] [ 52 bits: fraction ]
```

The *fraction* field (also called the *mantissa* or *significand*) stores the
significant digits of the number in binary. 52 bits gives approximately 15–16
significant decimal digits of precision.

Because `0.1` has an infinite binary expansion, the hardware stores the nearest
value that fits in 52 fraction bits:

```
stored value of 0.1:
  0.1000000000000000055511151231257827021181583404541015625
```

That deviation from the true `0.1` is tiny — about 5.5 × 10⁻¹⁸ — but it
accumulates. Add it to the stored approximation of `0.2`:

```
0.1 (stored) ≈ 0.1000000000000000055511151231257827...
0.2 (stored) ≈ 0.2000000000000000111022302462515654...
sum          ≈ 0.3000000000000000444089209850062616...
```

Which, when printed with JavaScript's default number-to-string conversion, shows as:

```
0.30000000000000004
```

**This is not a JavaScript bug.** It is the correct IEEE 754 result. Python, Java,
C++, MATLAB, and every other language that uses 64-bit doubles produces the same
output for `0.1 + 0.2`. The standard is the same everywhere.

---

## Concept: What `Number.EPSILON` Is

`Number.EPSILON` is `2.220446049250313e-16` — the smallest difference between
two representable doubles. More precisely: it is the smallest positive number `ε`
such that `1 + ε ≠ 1` in IEEE 754 arithmetic. It represents the gap between `1`
and the next representable double-precision number above it.

Comparing two floating-point values with `===` checks for exact bit-for-bit
equality, which fails for any computation involving inexact fractions:

```typescript
0.1 + 0.2 === 0.3   // false — the bit patterns differ by rounding error
```

The correct approach for equality tests is *relative epsilon comparison*: check
whether the difference is smaller than a tolerance that scales with the magnitude
of the numbers being compared.

```typescript
Math.abs(a - b) < Number.EPSILON * Math.max(Math.abs(a), Math.abs(b))
```

This asks "are these numbers close enough given their magnitude?" rather than
using an absolute threshold. An absolute threshold like `< 0.00001` would treat
`1000000.0` and `1000000.1` as equal, which is wrong. A relative threshold scales:
two numbers are close if their difference is small *relative to their size*.

`Number.EPSILON` itself (`≈ 2.22 × 10⁻¹⁶`) is the right scale for a single IEEE
754 rounding error. For a multi-step computation that accumulates several rounding
errors, a small multiple (such as `10 × Number.EPSILON`) may be needed.

**The `==` operator in OpenMAT uses `===` for comparison.** This means
`0.1 + 0.2 == 0.3` returns `false` in OpenMAT — the same result as in MATLAB and
Python. This is mathematically honest. A calculator that silently hides
floating-point behaviour from the user teaches habits that break in real numerical
computing.

---

## Concept: Display Precision vs Computation Precision

There are two separate concerns:

1. **Computation precision** — the internal accuracy of the arithmetic. IEEE 754
   gives approximately 15–16 significant decimal digits.
2. **Display precision** — how many significant digits to show in output. Showing
   all 15–16 digits creates noise for typical inputs; showing too few hides
   meaningful differences.

MATLAB defaults to 4 significant digits in `short` mode (`3.1416` for π) and
15 digits in `long` mode. OpenMAT will default to 12 significant digits — enough
to show all meaningful differences while hiding the pure rounding noise that
appears in digits 13–16.

The principle: **computation and display are separate concerns.** The evaluator
computes at full precision. A dedicated formatter rounds for display. This is
*separation of concerns* — the same principle that separates `tokenize` from
`parse`, and `parse` from `evaluate`. Each function does one job. Mixing display
rounding into the evaluator would mean the evaluator's output could no longer be
used reliably for further computation.

---

## Step 1 — Observe the Problem

With the console from lesson 06 running, type:

```
>> 0.1 + 0.2
```

You see:

```
0.30000000000000004
```

Now type:

```
>> 0.1 + 0.2 == 0.3
```

You see:

```
false
```

Both outputs are *correct*. The first shows the true IEEE 754 result. The second
shows that two floating-point values that differ in their last bit are not equal.

The goal of this lesson is to fix the display (show `0.3`, not
`0.30000000000000004`) while leaving the computation unchanged (the `== 0.3`
result stays `false`).

---

## Step 2 — Add a Number Formatter

**The problem:** `String(result)` outputs the full JavaScript floating-point
representation. We need a function that rounds to a reasonable precision and
removes trailing zeros.

In `src/main.ts`, add this function before the `initConsole` call:

```typescript
function formatResult(value: number | string | boolean): string {
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (typeof value === 'string')  return `'${value}'`;

  // Use 12 significant digits — enough to show real differences, not rounding noise
  const formatted = value.toPrecision(12);

  // Remove trailing zeros after the decimal point
  // '0.300000000000' → '0.3'
  // '3.14159265359' → '3.14159265359'
  return parseFloat(formatted).toString();
}
```

Update the console callback to use it:

```typescript
initConsole(function(userInput: string): void {
  try {
    const tokens = tokenize(userInput);
    const tree   = parse(tokens);
    const result = evaluate(tree);
    printOutput(formatResult(result));
  } catch (error) {
    printOutput((error as Error).message);
  }
});
```

### Walkthrough: What `formatResult` Does for `0.1 + 0.2`

`evaluate` returns `0.30000000000000004` — the true IEEE 754 sum. That value is
passed to `formatResult`.

- `typeof value === 'boolean'` — `0.30000000000000004` is a number, not a boolean.
  This branch is skipped.
- `typeof value === 'string'` — it is not a string. This branch is skipped.
- `value.toPrecision(12)` — `toPrecision(n)` is a method on JavaScript numbers.
  It accepts a count of *significant figures* and returns a string representation
  rounded to that many figures. `(0.30000000000000004).toPrecision(12)` returns
  `'0.300000000000'`. Why 12 figures? JavaScript doubles have ~15–16 significant
  decimal digits of precision. At 12 significant figures, the floating-point noise
  that lives in digits 13–16 is hidden. Meaningful numerical differences still
  appear (two values that differ in the twelfth digit are different numbers); only
  pure rounding artefacts are suppressed.
- `parseFloat('0.300000000000')` — `parseFloat` is a built-in JavaScript function.
  It accepts a string and parses it as a floating-point number, stopping at the
  first character that cannot be part of a number. Crucially, it strips trailing
  zeros: `parseFloat('0.300000000000')` returns the number `0.3`, not
  `0.30000000000000`. The trailing zeros are not significant — they carry no
  information.
- `.toString()` — JavaScript's `Number.prototype.toString()` converts a number to
  its shortest string representation. `(0.3).toString()` returns `'0.3'`.

The result returned to `printOutput` is `'0.3'`. The user sees `0.3`, even though
the underlying floating-point value is `0.30000000000000004`.

**Why `typeof` works here:** the `value` parameter is typed as
`number | string | boolean` — a TypeScript *union type*, which allows one of three
types (introduced in lesson 02). `typeof` is JavaScript's runtime type check
operator. TypeScript *narrows* the union: after `if (typeof value === 'boolean')`,
TypeScript knows `value` is `boolean` inside that branch and `number | string`
after it. After the second check, TypeScript knows `value` is `number`. This is
the same type narrowing used in the `evaluate` switch from lesson 04.

### SAVE AND TRY

Type `0.1 + 0.2`:

```
>> 0.1 + 0.2
0.3
```

Type `1 / 3`:

```
>> 1 / 3
0.333333333333
```

Type `2 ^ 0.5`:

```
>> 2 ^ 0.5
1.4142135623731
```

Type `0.1 + 0.2 == 0.3`:

```
>> 0.1 + 0.2 == 0.3
false
```

The display is clean. The equality check is still mathematically honest.

---

## Step 3 — Write a Test for the Formatter

**Why a test for this specific function?** `formatResult` is a pure function —
it takes a value and returns a string, with no side effects and no dependency on
the DOM or the console. Pure functions are the easiest category of code to test:
call it with a known input, assert the output. (Pure functions were named in
lesson 03 when `evaluate` was introduced as a pure function.)

**The new file: `src/format.test.ts`**

`format.test.ts` lives in `src/` alongside `main.ts` because it tests code
defined in `main.ts`. Vitest (introduced in lesson 03) discovers test files
automatically by looking for files matching `*.test.ts`. Its single
responsibility: verify that `formatResult` behaves correctly for every type it
handles.

Add `src/format.test.ts`:

```typescript
import { formatResult } from './main';

test('formats 0.1 + 0.2 as 0.3', () => {
  expect(formatResult(0.1 + 0.2)).toBe('0.3');
});

test('formats 1/3 with 12 significant digits', () => {
  expect(formatResult(1/3)).toBe('0.333333333333');
});

test('formats integers without decimal point', () => {
  expect(formatResult(42)).toBe('42');
});

test('formats boolean values', () => {
  expect(formatResult(true)).toBe('true');
  expect(formatResult(false)).toBe('false');
});

test('formats strings with quotes', () => {
  expect(formatResult('hello')).toBe("'hello'");
});
```

**The import statement:** `import { formatResult } from './main'` declares a
dependency on `main.ts`. The `./` prefix means the path is relative to the
current file — `format.test.ts` is in the same directory as `main.ts`. The curly
braces `{ formatResult }` use *named import* syntax (introduced in lesson 01):
import only the `formatResult` name from that module's public exports. We do not
import the whole module because we only need this one function — importing only
what you need makes dependencies explicit.

To export `formatResult` from `main.ts`, change the function declaration:

```typescript
export function formatResult(value: number | string | boolean): string {
```

The `export` keyword makes this function part of the module's public interface —
it can now be imported by other files. Without `export`, `formatResult` is private
to `main.ts` and the import in `format.test.ts` would fail with a compile error.

Run `npx vitest run` — tests should pass.

`npx vitest run` was explained in lesson 03: `npx` runs a package from
`node_modules` without installing it globally; `vitest` is the test runner;
`run` executes all tests once and exits (as opposed to `npx vitest`, which
watches for file changes). A passing run prints each test name in green.

---

## Connect the Pieces

```
evaluate()            returns full-precision IEEE 754 number
    ↓
formatResult()        rounds to 12 significant digits, strips trailing zeros
    ↓
printOutput()         displays to console
```

`formatResult` sits between the evaluator and the display layer. The evaluator is
never modified — it always works at full IEEE 754 precision. Only the display
rounds. This is the same separation of concerns that keeps `tokenize` from
touching the AST and `parse` from knowing about the DOM.

| Input              | `evaluate()` returns          | `formatResult()` shows  |
|--------------------|-------------------------------|-------------------------|
| `0.1 + 0.2`        | `0.30000000000000004`         | `0.3`                   |
| `1 / 3`            | `0.3333333333333333`          | `0.333333333333`         |
| `0.1 + 0.2 == 0.3` | `false`                       | `false`                  |
| `42`               | `42`                          | `42`                    |

**Real-world connection — floating point and money**

Every financial system that uses floating-point arithmetic for monetary values has
wrestled with exactly this problem. The solution in banking software is not epsilon
comparison — it is using integers. £10.50 is stored as `1050` (pence). All
arithmetic is done in pence; the display layer divides by 100 to show pounds.
JavaScript's `BigDecimal` libraries, Java's `BigDecimal`, and Python's `decimal`
module all do the same: represent decimal values exactly by avoiding binary
fractions altogether.

IEEE 754 floating point is the right tool for scientific computing — it handles
numbers spanning dozens of orders of magnitude with uniform relative precision.
It is the wrong tool for exact monetary arithmetic. Knowing this distinction is
what separates a programmer who knows the language from a software engineer who
knows when to use it.

---

## What Breaks Without This

Remove the 12-digit rounding and use `String(value)` directly:

```typescript
printOutput(String(result));
```

Type `0.1 + 0.2`. You see `0.30000000000000004`. A user who does not know about
IEEE 754 sees a broken calculator. Teaching the concept *and* formatting the output
cleanly gives the honest answer: the computation is correct; the raw representation
is noisy; the display rounds to a meaningful precision. The computation and the
display serve different purposes — conflating them produces a result that is
technically correct and practically confusing.

---

## Definition of Done

- [ ] `0.1 + 0.2` → `0.3` in the console
- [ ] `1 / 3` → `0.333333333333`
- [ ] `0.1 + 0.2 == 0.3` → `false`
- [ ] All `format.test.ts` tests pass
- [ ] You can explain why `0.1` cannot be represented exactly in binary
- [ ] You can explain why `toPrecision(12)` hides floating-point noise but not meaningful differences
- [ ] You can explain the difference between computation precision and display precision
- [ ] You can explain why `==` correctly returns `false` for `0.1 + 0.2 == 0.3`
- [ ] You can explain why banking software stores money as integers rather than floats
- [ ] `git add src/main.ts` then `git commit -m "Add formatResult: floating point display rounded to 12 significant figures, 0.1+0.2 shows 0.3"`

---

*Next: Lesson 08 — Variables. Typing `x = 10` stores the value; `x + 5`
retrieves it and evaluates to `15`. The evaluator gains a symbol table.*
