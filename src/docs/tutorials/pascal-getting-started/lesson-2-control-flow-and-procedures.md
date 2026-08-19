# Lesson 2: Control Flow and Procedures

**What you will build:** A program that loops over a range of numbers,
branches on a condition, and calls a function it defines itself — the
control-flow and code-organization vocabulary that most small Pascal
utility programs (the kind *Software Tools in Pascal* is built around)
are assembled from.

**What you need to know first:** Lesson 1 — `var` blocks, `integer`,
`write`/`writeln`, and the `:=` assignment operator.

**Terms used in this lesson:**
- **`if`/`then`/`else`** — a branching statement: `if <condition> then
  <statement> else <statement>`. Only one of the two branches ever
  runs, decided by whether `<condition>` evaluates to `true` or
  `false`.
- **`for` loop** — a loop that runs its body once for each value in a
  counted range, automatically incrementing (or decrementing) a control
  variable each pass. This exists so counted repetition doesn't require
  manually managing a counter variable and a stop condition by hand.
- **`begin`/`end` block** — a pair of keywords that group multiple
  statements into a single compound statement. This matters specifically
  because `if` and `for` each expect exactly *one* statement as their
  body — wrapping several statements in `begin ... end` is what makes
  "several statements" count as that one statement.
- **Procedure** — a named, reusable block of code that performs an
  action but returns no value.
- **Function** — a named, reusable block of code that performs an
  action *and* returns a value, usable anywhere a value of its return
  type is expected (inside an expression, as an argument, etc.).
- **`mod`** — the modulus operator, returning the remainder of integer
  division. `7 mod 2` is `1`; `8 mod 2` is `0`. This is how the code
  below tests whether a number is even.

**Objects and methods used:**
- **`Square`** (this lesson's own function) —
  - *What it is:* a function, defined by this lesson's own code, that
    computes the square of an integer.
  - *Implementation:* `function Square(x: integer): integer;` — takes
    one `integer` parameter named `x`, and is declared to return an
    `integer`.
  - *Its use:* demonstrates both function *declaration* and the
    specific, classic Pascal mechanism for returning a value: assigning
    to the function's own name.

---

## The Problem

Lesson 1's program ran exactly once, top to bottom, with no branching
and no repetition. Almost every real program needs both: doing
something a variable number of times, and doing different things
depending on a condition.

## The Code

```pascal
program ControlFlow;

function Square(x: integer): integer;
begin
  Square := x * x;
end;

var
  i: integer;
begin
  for i := 1 to 5 do
  begin
    if i mod 2 = 0 then
      writeln(i, ' is even, squared = ', Square(i))
    else
      writeln(i, ' is odd, squared = ', Square(i));
  end;
end.
```

## Walkthrough

`function Square(x: integer): integer;` declares a function *before*
the main program's own `begin`. This ordering is required in standard
Pascal: everything a program uses — functions, procedures, variables —
must be declared above the point where it's used, including above the
main program body itself.

`x: integer` inside the parentheses is a **parameter declaration** —
`x` is a local variable that exists only inside `Square`, automatically
set to whatever value is passed in when `Square` is called. The
trailing `: integer` after the closing parenthesis declares the
function's **return type** — the type of value calling `Square(...)`
produces.

`Square := x * x;` is the line that actually returns a value. This is
the classic Pascal convention: a function returns a value by assigning
it to a variable with the *same name as the function itself* — there is
no separate `return` keyword in standard Pascal syntax. (Free Pascal
also supports a newer `Result := x * x;` form as an alternative, but
this lesson uses the classic form since it's what you'll see in older
Pascal code, including *Software Tools in Pascal*-era programs.)

`for i := 1 to 5 do` declares the loop's control variable assignment
(`i := 1`), the upper bound (`5`), and the direction (`to`, meaning
count upward; `downto` would count downward). The loop body runs once
with `i` equal to each of `1, 2, 3, 4, 5` in turn, and `i` is
automatically incremented between iterations — no manual `i := i + 1`
needed anywhere in this code.

`begin ... end;` immediately after the `for ... do` groups the `if`
statement into the loop's body as a single compound statement. Without
this `begin`/`end` pair, only the single statement immediately after
`do` would repeat — everything else would run exactly once, after the
loop finished, which is not what this program intends.

`if i mod 2 = 0 then` evaluates `i mod 2` — the remainder of dividing
`i` by `2` — and compares it to `0` using the single `=` symbol, which
in this position means *comparison*, not assignment (the `:=` operator
from Lesson 1 is never used inside a condition). When the remainder is
`0`, `i` is even.

`writeln(i, ' is even, squared = ', Square(i))` is the `then` branch:
same multi-argument `writeln` from Lesson 1, except one of its
arguments, `Square(i)`, is a **function call** — Pascal evaluates
`Square(i)` first, producing a plain `integer` value, and passes that
value into `writeln` exactly as if it had been typed directly.

`else writeln(i, ' is odd, squared = ', Square(i));` is the alternate
branch, structured identically, run only when the `if` condition was
false. Note there is no semicolon before this `else` — a semicolon
directly before `else` is a compile error in Pascal, because `if/then/
else` is parsed as a single statement, not two separate ones.

## CS Lens

This is **structured programming**: expressing control flow with
named, nested constructs (`if`, `for`) instead of unstructured jumps
(`goto`). Also recognized in: every modern language's `if`/`for`/
`while`, state machines expressed as switch statements, and recursive
descent parsers that branch on token type.

## Expected Output

```
1 is odd, squared = 1
2 is even, squared = 4
3 is odd, squared = 9
4 is even, squared = 16
5 is odd, squared = 25
```

Not run this session — confirm with `fpc controlflow.pas` and
`.\controlflow.exe`.

## Try It Yourself

- Change `for i := 1 to 5 do` to `for i := 10 downto 1 do` and predict
  the order of output before running it.
- Write a second function, `Cube`, following the same pattern as
  `Square`, and call it instead.
- Delete the `begin`/`end` pair wrapping the `if` statement (leave the
  `for` loop itself intact) and recompile — read what actually changes
  about which lines run inside the loop versus after it.

## Connect the Pieces

Across this lesson: `i` starts at `1` inside the `for` loop's own
management; `i mod 2` decides which `writeln` branch runs; `Square(i)`
computes a value from that same `i` and hands it back into the chosen
`writeln` call — one value, `i`, flowing through the loop control, the
branch decision, and the function call, once per iteration.

**Next:** the series continues once expanded — see `HANDOFF.md` in this
folder for what's planned (working toward the kind of small text-
processing utility programs *Software Tools in Pascal* itself builds).
