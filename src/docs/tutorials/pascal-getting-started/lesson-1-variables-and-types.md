# Lesson 1: Variables, Types, and Input

**What you will build:** A program that declares typed variables, reads
input from the console, and prints a formatted message — the minimum
vocabulary needed to read or write any non-trivial Pascal program.

**What you need to know first:** Lesson 0 — a working `fpc` install,
and the `program ... begin ... end.` shape.

**Terms used in this lesson:**
- **`var` block** — a section, written as the keyword `var` followed by
  one or more declarations, that lists every variable a program uses
  *before* any of them are used. Pascal requires this: unlike some
  languages, you cannot introduce a new variable mid-statement the
  first time you assign to it — it must already exist in a `var` block.
- **Type** — the fixed category of value a variable is allowed to hold
  (whole number, decimal number, single character, text, true/false).
  Pascal checks this at compile time: assigning a value of the wrong
  type is a compile error, not something discovered while the program
  runs.
- **Assignment operator (`:=`)** — the two-character symbol that stores
  a value into a variable. This is deliberately different from the
  single `=` symbol, which in Pascal means numeric or value equality,
  used only in comparisons — writing `x = 5` where you meant `x := 5`
  is a real compile error, not a typo Pascal silently accepts.
- **Constant (`const`)** — a named value fixed at compile time, declared
  in a `const` block instead of `var`. Attempting to assign to it later
  is a compile error, which is the point: it documents, and enforces,
  that this value is never meant to change.

**Objects and methods used:**
- **`integer`** —
  - *What it is:* a built-in Pascal type representing a whole number.
  - *Implementation:* on Free Pascal for 64-bit Windows, a signed
    32-bit value (range roughly -2,147,483,648 to 2,147,483,647).
  - *Its use:* this lesson's `age` variable is a count of whole years,
    so it's declared `integer`, not `real`.
- **`real`** —
  - *What it is:* a built-in Pascal type representing a decimal number.
  - *Implementation:* a floating-point value; Free Pascal treats plain
    `real` as a double-precision float on modern platforms.
  - *Its use:* this lesson's `price` variable needs a fractional part
    (`19.99`), which `integer` cannot hold.
- **`string`** —
  - *What it is:* a built-in Pascal type representing text of any
    length.
  - *Implementation:* a Free Pascal extension type (not part of the
    strict 1970s ISO Pascal standard, but available by default in Free
    Pascal's default mode) — internally a length-prefixed, dynamically
    sized character buffer, not a fixed-size array.
  - *Its use:* this lesson's `name` variable holds whatever text the
    user types, which could be any length.
- **`write`** —
  - *What it is:* a built-in procedure that prints text to the console
    *without* moving to a new line afterward.
  - *Implementation:* takes one or more comma-separated values to
    print, of any printable type.
  - *Its use:* this lesson uses `write` (not `writeln`) for prompts like
    `'Enter your name: '`, so the user's typed answer appears on the
    same line as the prompt, not on a new line below it.
- **`writeln`** —
  - *What it is:* the same printing procedure as `write`, except it
    moves to a new line after printing.
  - *Implementation:* takes one or more comma-separated values, exactly
    like `write`.
  - *Its use:* used here to print the final combined message as a
    complete line.
- **`readln`** —
  - *What it is:* a built-in procedure that reads one line of console
    input and stores it into a variable.
  - *Implementation:* takes a variable (not a value) as its argument,
    and converts the typed text into that variable's type — typed text
    into an `integer` variable, for example, is parsed as a number.
  - *Its use:* this lesson uses it twice, once to read `name` as text
    and once to read `age`, parsed as a number.

---

## The Problem

Lesson 0's program only ever printed one fixed string. A real program
needs to hold values that change — user input, computed results — and
Pascal requires declaring, up front, exactly what *kind* of value each
one will hold.

## The Code

```pascal
program Basics;
var
  name: string;
  age: integer;
  price: real;
begin
  write('Enter your name: ');
  readln(name);
  write('Enter your age: ');
  readln(age);
  price := 19.99;
  writeln('Hello, ', name, '! You are ', age, ' years old.');
  writeln('Price: ', price:0:2);
end.
```

## Walkthrough

The `var` block declares three variables before any code runs:
`name: string`, `age: integer`, `price: real`. Each line follows the
pattern `identifier: Type;` — the variable's name, a colon, its type,
a semicolon. All three exist, unassigned, the moment execution reaches
`begin`.

`write('Enter your name: ');` prints the prompt text with no trailing
newline, so the cursor stays on the same line waiting for input.

`readln(name);` reads a full line of console input and stores it into
`name`. Because `name` is declared `string`, whatever the user types is
stored as-is, no conversion needed.

`write('Enter your age: ');` and `readln(age);` repeat the same pattern
for `age` — except here, `age` is declared `integer`, so `readln`
parses the typed text as a whole number. If the user types non-numeric
text here, the program raises a runtime error, because the conversion
from text to `integer` fails — a limitation of this simple version,
not something this lesson's code guards against.

`price := 19.99;` is a plain assignment: the `:=` operator stores the
value `19.99` into `price`. This is not user input — it's a fixed value
set directly in code, to demonstrate `real` alongside the other two
types.

`writeln('Hello, ', name, '! You are ', age, ' years old.');` passes
five comma-separated arguments to `writeln` — three string literals and
two variables, interleaved. `writeln` (and `write`) accept any number
of comma-separated values and print them concatenated, with no space
or separator added automatically — every space in the output above
comes from a literal space typed inside one of the quoted strings.

`writeln('Price: ', price:0:2);` introduces one new piece of syntax:
`price:0:2` is not `price` followed by a `:=`-style assignment — it's a
**formatting specifier**, valid only inside a `write`/`writeln`
argument list, telling Pascal how to render a `real` value as text. The
first number (`0`) sets a minimum field width (`0` means "no padding,
use exactly as much space as needed"); the second number (`2`) sets the
number of digits after the decimal point. Without this, printing a
`real` directly prints it in a much longer, less readable form (Free
Pascal's default real formatting uses scientific notation with many
digits) — `:0:2` is what produces the plain `19.99` most programs
actually want.

## Expected Output

Given input `Ada` then `36`:

```
Enter your name: Ada
Enter your age: 36
Hello, Ada! You are 36 years old.
Price: 19.99
```

Not run this session — confirm it yourself with `fpc basics.pas`
followed by `.\basics.exe`.

## Try It Yourself

- Add a fourth variable, `favoriteColor: string`, prompt for it, and
  include it in the final greeting.
- Change `price:0:2` to `price:0:0` and predict the output before
  running it — this tests whether you understood what the second
  number controls.
- Try assigning a decimal value like `age := 5.5;` to the `integer`
  variable `age` and recompile — read the compiler's error message
  carefully; it's Pascal's type system catching a real mistake before
  the program ever runs.

**Next:** `lesson-2-control-flow-and-procedures.md`
