# Lesson 2: Control Flow and Subroutines

**What you will build:** A script that loops over an array, branches on
a condition, and calls a subroutine it defines itself — enough
structure to start writing the kind of small, self-contained programs
*Programming Pearls*-style algorithm work is built from.

**What you need to know first:** Lesson 1 — `my`, scalars (`$`),
arrays (`@`), and string interpolation.

**Terms used in this lesson:**
- **`foreach`** — a loop that runs its body once for each element of a
  list or array, in order, binding a chosen variable to the current
  element on each pass. This exists so iterating over a whole array
  doesn't require manually tracking a numeric index.
- **`if`/`else`** — a branching statement, syntactically similar to
  many C-family languages: `if (<condition>) { ... } else { ... }`.
  Only one branch runs, chosen by whether `<condition>` is true or
  false. Unlike Pascal's `if/then/else`, Perl requires curly braces
  around each branch's body even when it's a single statement — there
  is no bare single-statement form.
- **`sub`** — the keyword that declares a subroutine: a named, reusable
  block of code. Perl does not distinguish "procedure" from "function"
  the way Pascal does — every `sub` can optionally return a value, and
  whether it does is a matter of whether it uses `return`, not a
  different declaration keyword.
- **`@_`** — a special array, automatically available inside every
  subroutine, holding the arguments it was called with, in order. This
  exists because Perl subroutines have no fixed, named parameter list
  in their declaration — `@_` is how a subroutine's body accesses
  whatever was passed in.
- **`return`** — a keyword that ends a subroutine immediately and
  specifies the value it produces to its caller.
- **`%`** — the modulus operator (in this position, an arithmetic
  operator, not the hash sigil from Lesson 1 — Perl reuses the `%`
  character for both, distinguished entirely by where it appears:
  before a variable name, it's a sigil; between two numbers, it's the
  modulus operator). Returns the remainder of integer division: `7 % 2`
  is `1`.

**Objects and methods used:**
- **`square`** (this lesson's own subroutine) —
  - *What it is:* a subroutine, defined by this lesson's own code, that
    computes the square of a number.
  - *Implementation:* `sub square { my ($x) = @_; return $x * $x; }` —
    takes its single argument from `@_`, unpacked into a lexical
    scalar `$x`, and returns `$x * $x`.
  - *Its use:* demonstrates subroutine declaration, argument passing
    via `@_`, and an explicit `return`.

---

## The Problem

Lesson 1's script read fixed data straight out of literal declarations,
with no repetition and no branching. Processing a whole array — the
core activity *Programming Pearls* revolves around — requires looping
over it, and often means factoring repeated logic into a named,
reusable subroutine instead of writing it inline every time.

## The Code

```perl
use strict;
use warnings;

sub square {
    my ($x) = @_;
    return $x * $x;
}

my @nums = (1, 2, 3, 4, 5);

foreach my $n (@nums) {
    if ($n % 2 == 0) {
        print "$n is even, squared = ", square($n), "\n";
    } else {
        print "$n is odd, squared = ", square($n), "\n";
    }
}
```

## Walkthrough

`sub square { ... }` declares a subroutine named `square`. Unlike
Pascal's function declaration from the Pascal series, there is no
parameter list in parentheses and no declared return type in the
`sub` line itself — both are handled inside the body instead.

`my ($x) = @_;` is the first line inside the subroutine, and it's how
Perl subroutines receive their arguments: `@_` (the special array
described in Terms, above) holds whatever was passed in when `square`
was called. `my ($x) = @_;` declares a new lexical scalar `$x` and
assigns it the *first* element of `@_` — the parentheses around `$x`
matter here: they make this a **list assignment** (unpack values from
a list, positionally), rather than `my $x = @_;` without parentheses,
which would instead assign the *count* of elements in `@_` to `$x` — a
common Perl beginner mistake, and the reason this pattern is always
written with the parentheses even for a single argument.

`return $x * $x;` computes `$x * $x` and immediately ends the
subroutine, handing that computed value back to whatever called it.

`my @nums = (1, 2, 3, 4, 5);` declares an array of five numbers, using
the same `@` sigil and parenthesized list syntax from Lesson 1.

`foreach my $n (@nums) { ... }` loops over `@nums` one element at a
time. `my $n` declares a new scalar, freshly scoped to each pass of the
loop, bound to the current element — on the first iteration `$n` is
`1`, on the second `2`, and so on through `5`. The parentheses around
`@nums` name the list being iterated.

`if ($n % 2 == 0) { ... } else { ... }` tests whether `$n % 2` (the
remainder of dividing `$n` by `2`) equals `0`, using `==`, Perl's
numeric-equality operator — distinct from a single `=`, which in Perl,
as in most C-family languages, means assignment, not comparison. When
the remainder is `0`, `$n` is even.

`print "$n is even, squared = ", square($n), "\n";` mixes both
`print` styles seen so far: `"$n is even, squared = "` interpolates
`$n` directly inside a double-quoted string, while `square($n)` is a
**subroutine call**, passed as a separate comma-separated argument —
Perl evaluates `square($n)` first, producing a plain number, then
`print` writes that number in sequence with the surrounding text. The
`else` branch mirrors this exactly, with `"odd"` instead of `"even"`.

## CS Lens

Factoring `square` out into a named subroutine instead of writing
`$n * $n` inline twice (once per branch) is the same idea Pascal's
`Square` function demonstrated in the Pascal series: naming a
computation once and reusing it removes duplication and gives the
computation a name a reader can search for. Also recognized in: any
language's function/method extraction, database views that name a
recurring query, and Unix pipelines built from small named tools —
which is exactly the organizing idea *Programming Pearls* keeps
returning to.

## Expected Output

```
1 is odd, squared = 1
2 is even, squared = 4
3 is odd, squared = 9
4 is even, squared = 16
5 is odd, squared = 25
```

Not run this session — confirm with `perl controlflow.pl`.

## Try It Yourself

- Add a `cube` subroutine, following the same `@_`/`return` pattern as
  `square`, and call it instead.
- Change `@nums` to include a negative number, like `-3`, and check
  whether `%` still behaves the way you expect for it.
- Remove the parentheses from `my ($x) = @_;`, leaving `my $x = @_;`,
  and run the script again — read the wrong output carefully; it's the
  count-vs-list-unpacking gotcha named in the walkthrough, made
  concrete.

## Connect the Pieces

Across this lesson: `@nums` supplies each `$n` in turn to the
`foreach` loop; `$n % 2` decides which `print` branch runs; `square($n)`
computes a value from that same `$n` inside either branch — one value,
`$n`, flowing through the loop, the branch decision, and the
subroutine call, once per iteration, mirroring the exact same shape as
the Pascal series' `Lesson 2`.

**Next:** the series continues once expanded — see `HANDOFF.md` in this
folder for what's planned (working toward small, self-contained
algorithm exercises in the spirit of *Programming Pearls*).
