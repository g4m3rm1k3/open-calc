# Lesson 3: Arrays and the Accumulator Pattern

**What you will build:** A program that stores several related values in
one array variable, walks over every element with a loop, and builds up
a running total as it goes — the standard shape almost every data-
processing routine in *Software Tools in Pascal* is built from.

**What you need to know first:** Lesson 2 — `for` loops, `:=`
assignment, and `writeln`'s multi-argument form.

**Terms used in this lesson:**
- **Array** — a fixed-size, ordered collection of values, all of the
  same type, stored under one variable name and accessed by a numeric
  index. This exists so a program handling many related values (five
  scores, a hundred characters) doesn't need a separately named
  variable for each one.
- **Index** — the numeric position used to select one element of an
  array, written in square brackets after the array's name (`numbers[3]`).
- **Accumulator** — a variable initialized once, before a loop begins,
  and updated on every single pass through the loop to build up a
  running result (a sum, in this lesson). This is not a Pascal keyword —
  it's a naming pattern for a specific, extremely common shape of code,
  worth being able to name and recognize on sight.
- **`/` (real division)** — the division operator that always produces
  a `real` result, even when both operands are whole numbers. This is a
  deliberate contrast with `mod`, taught in Lesson 2: `mod` gives the
  *remainder* of integer division as an `integer`; `/` gives the actual
  quotient as a `real`, discarding nothing.

**Objects and methods used:**
- **`Low`** —
  - *What it is:* a built-in Pascal function returning the lowest valid
    index of an array (or, more generally, the lowest value of an
    ordinal type).
  - *Implementation:* `function Low(arr): Integer;` — for an array
    declared `array[1..5] of integer`, `Low(numbers)` returns `1`.
  - *Its use:* this lesson uses it to start the loop at the array's
    actual lower bound, instead of hardcoding `1` — if the array's
    declared range ever changes, the loop still starts in the right
    place automatically.
- **`High`** —
  - *What it is:* the counterpart to `Low`, returning the highest valid
    index.
  - *Implementation:* `function High(arr): Integer;` — for
    `array[1..5] of integer`, `High(numbers)` returns `5`.
  - *Its use:* this lesson uses it both to end the loop at the correct
    upper bound, and to compute how many elements the array holds
    (`High - Low + 1`), for the average calculation.

---

## The Problem

Every variable declared so far in this series has held exactly one
value. Processing a *collection* of related values — five test scores,
every character in a line of text — one variable per value doesn't
scale: five values means five names to invent and five nearly-identical
lines of code. An array holds many values of the same type under one
name, indexed by position.

## The Code

```pascal
program Arrays;
var
  numbers: array[1..5] of integer;
  i, total: integer;
begin
  numbers[1] := 10;
  numbers[2] := 20;
  numbers[3] := 30;
  numbers[4] := 40;
  numbers[5] := 50;

  total := 0;
  for i := Low(numbers) to High(numbers) do
    total := total + numbers[i];

  writeln('Total: ', total);
  writeln('Average: ', total / (High(numbers) - Low(numbers) + 1):0:2);
end.
```

## Walkthrough

`numbers: array[1..5] of integer;` declares an array named `numbers`,
holding five `integer` values, indexed `1` through `5`. The
`array[1..5] of integer` syntax names the index range first (`1..5`,
meaning "from 1 to 5 inclusive"), then the element type (`integer`).
Pascal does not force arrays to start at index `0` the way some
languages do — the programmer chooses the bounds, and `1..5` was chosen
here deliberately, matching how a person would naturally count five
items.

`numbers[1] := 10;` through `numbers[5] := 50;` are five element
assignments. `numbers[1]` selects the first element by index, using
square brackets; `:=` then stores a value into that specific element,
exactly the same assignment operator used for plain variables since
Lesson 1 — an array element is, mechanically, just a variable you reach
through an index instead of a fixed name.

`total := 0;` initializes the **accumulator** — the pattern named in
Terms, above. Setting it to `0` before the loop matters specifically
because addition's identity value is `0`: adding `0` to anything leaves
it unchanged, so starting here guarantees the first real value added
in the loop becomes the total's actual starting point, not a leftover
from something else.

`for i := Low(numbers) to High(numbers) do` is Lesson 2's `for` loop
construct, reappearing — full treatment restated here, not skipped for
being previously taught: `for i := <start> to <end> do <statement>`
runs its body once per value of `i` from `<start>` to `<end>`
inclusive, incrementing `i` automatically between passes. The bounds
here are `Low(numbers)` (returns `1`) and `High(numbers)` (returns `5`),
so this behaves identically to `for i := 1 to 5 do` — but written this
way, the loop stays correct even if the array's declared size changes
later, since `Low`/`High` always reflect the array's *actual* declared
bounds rather than a number typed by hand that could drift out of sync.

`total := total + numbers[i];` is the accumulator's update step, and
the loop's entire body. `numbers[i]` reads the array element at the
*current* loop index — the same bracket syntax used to write elements
above, now used to read one instead. `total + numbers[i]` computes a
new sum from the old `total` plus this element; `:=` stores that sum
back into `total`, overwriting the old value. Each pass through the
loop, this reads the previous total, adds one more element, and saves
the result — the mechanism behind every "running total" in any
language.

**Execution trace:**

```
i=1: numbers[1]=10, total 0 → 10
i=2: numbers[2]=20, total 10 → 30
i=3: numbers[3]=30, total 30 → 60
i=4: numbers[4]=40, total 60 → 100
i=5: numbers[5]=50, total 100 → 150
```

Each line's new `total` is the previous line's `total` plus that
iteration's `numbers[i]` — the loop never "sees" the whole array at
once, only one element per pass, which is exactly why the accumulator
variable has to persist its value *across* iterations instead of being
reset each time.

`writeln('Total: ', total);` prints the final accumulated value, `150`,
using the same multi-argument `writeln` form from every earlier lesson.

`writeln('Average: ', total / (High(numbers) - Low(numbers) + 1):0:2);`
computes the average in one expression. `High(numbers) - Low(numbers) +
1` computes the element *count* (`5 - 1 + 1 = 5`) — this formula, not a
hardcoded `5`, is what makes the calculation stay correct if the array's
size changes. `total / 5` uses the `/` operator, defined in Terms above:
real division, producing a `real` result (`30.0`) even though both
`total` and the count are `integer` values — contrast this with `mod`
from Lesson 2, which instead produces the *remainder* as an `integer`.
`:0:2` is the same real-number formatting specifier from Lesson 1
(minimum field width `0`, two digits after the decimal point),
producing `30.00` instead of a long, less readable default.

## CS Lens

The **accumulator pattern** — a variable initialized outside a loop and
updated once per iteration to build a result — is one of the most
common shapes in all of programming. Also recognized in: `reduce`/`fold`
in functional languages (Python's `functools.reduce`, JavaScript's
`Array.prototype.reduce`), a running balance in a bank ledger, a
checksum computed byte-by-byte over a file, and a spreadsheet's `SUM`
column recomputing as rows are added.

## Expected Output

```
Total: 150
Average: 30.00
```

Not run this session — confirm with `fpc arrays.pas` and
`.\arrays.exe`.

## Try It Yourself

- Add a sixth score to the array (change the declaration to
  `array[1..6] of integer` and add a sixth assignment) — notice the
  loop and average calculation need **no changes at all**, because both
  were written in terms of `Low`/`High` instead of hardcoded numbers.
- Compute the *maximum* value in the array instead of the total: start
  a variable at `numbers[1]`, then inside the loop, replace it whenever
  a larger element is found. This is a different accumulator — same
  pattern, different combining rule.

**Next:** `lesson-4-strings-as-indexable-character-sequences.md`
