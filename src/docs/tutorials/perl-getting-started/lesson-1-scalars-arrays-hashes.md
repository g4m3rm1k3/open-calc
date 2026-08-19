# Lesson 1: Scalars, Arrays, and Hashes

**What you will build:** A script that declares all three of Perl's
core data types — a single value, a list of values, and a set of
named key/value pairs — and prints values from each, using Perl's
sigil system to tell them apart.

**What you need to know first:** Lesson 0 — a working `perl` install,
`use strict;`/`use warnings;`, and `print`.

**Terms used in this lesson:**
- **Sigil** — a punctuation character prefixed to a variable name that
  marks what *kind* of data structure it is. Perl has three core
  sigils: `$` (scalar), `@` (array), `%` (hash). This exists because
  Perl lets all three kinds of variable share the same name
  simultaneously (`$x`, `@x`, and `%x` can all exist at once, as three
  unrelated variables) — the sigil, not the name alone, is what
  identifies which one a given piece of code means.
- **Scalar** — a single value: a number, a string, or a reference.
  Declared and accessed with the `$` sigil.
- **Array** — an ordered list of values, indexed from `0`. Declared
  with the `@` sigil, but — this is the specific gotcha this lesson
  exists to teach — accessing *one element* of an array switches to the
  `$` sigil, because a single element is itself a scalar.
- **Hash** — an unordered set of key/value pairs, where each key maps
  to one value. Declared with the `%` sigil, but accessing *one value*
  by its key also switches to the `$` sigil, for the same reason as an
  array element.
- **`my`** — a keyword that declares a new variable, scoped to the
  enclosing block. Required by `use strict;` from Lesson 0 — without
  `my`, `use strict;` refuses to compile a script that assigns to an
  undeclared variable.
- **String interpolation** — Perl's behavior of substituting a
  variable's actual value into a double-quoted string, wherever that
  variable's name appears inside it. This does **not** happen inside
  single-quoted strings, where `$name` would print literally as the
  four characters `$name`.

**Objects and methods used:**

This lesson has no new external functions beyond Lesson 0's `print` —
it focuses entirely on the three core data types and the sigils that
distinguish them, listed under Terms above.

---

## The Problem

Lesson 0's script only ever held one literal string, printed once. A
real script needs to hold a name, a number, a list of things, and
lookups by name — Perl's three core variable kinds cover all of those,
distinguished from each other by their leading sigil.

## The Code

```perl
use strict;
use warnings;

my $name = "Ada";
my $age  = 36;

my @numbers = (10, 20, 30);
my %ages = ("Ada" => 36, "Alan" => 41);

print "Name: $name, Age: $age\n";
print "First number: $numbers[0]\n";
print "Ada's age via hash: $ages{Ada}\n";
```

## Walkthrough

`my $name = "Ada";` declares a new scalar variable, `$name`, and
assigns it the string `"Ada"`. The `$` sigil marks this as a scalar —
one single value, not a list.

`my $age = 36;` declares a second scalar, `$age`, holding the number
`36`. Perl does not require declaring a variable's numeric-vs-string
type the way Pascal does — the same `$` sigil and the same `my`
keyword work for both; Perl decides how to treat the value based on
how it's used later (as text or as a number), not on a fixed
declaration.

`my @numbers = (10, 20, 30);` declares an array, `@numbers`, using the
`@` sigil, and assigns it a parenthesized, comma-separated list of
three values. The array is ordered: `10` is at index `0`, `20` at
index `1`, `30` at index `2`.

`my %ages = ("Ada" => 36, "Alan" => 41);` declares a hash, `%ages`,
using the `%` sigil. The list assigned to it alternates keys and
values; `=>` is a **fat comma**, functionally identical to a plain
comma but conventionally used between a hash key and its value to make
the pairing visually clear. This creates two key/value pairs: `"Ada"`
maps to `36`, and `"Alan"` maps to `41`.

`print "Name: $name, Age: $age\n";` demonstrates **string
interpolation**: because the string is double-quoted, Perl scans it for
variable names and substitutes their current values — `$name` becomes
`Ada`, `$age` becomes `36` — producing one combined line, without
needing `print`'s comma-separated argument style at all.

`print "First number: $numbers[0]\n";` accesses a single element of
the `@numbers` array. This is the sigil gotcha named in Terms, above:
even though the array was *declared* with `@`, reading one element
uses `$numbers[0]`, with a `$` sigil — because `$numbers[0]` refers to
one scalar value (the number `10`), not the whole list. The `[0]`
is the index, in square brackets, and `0` is the first position.

`print "Ada's age via hash: $ages{Ada}\n";` accesses a single value
from the `%ages` hash by key, following the exact same pattern:
`%ages` was declared with `%`, but `$ages{Ada}` uses `$`, because one
looked-up value is a scalar. Curly braces `{Ada}`, not square brackets,
mark a hash lookup by key, distinguishing it from an array's numeric
index lookup.

## Expected Output

```
Name: Ada, Age: 36
First number: 10
Ada's age via hash: 36
```

Not run this session — confirm with `perl basics.pl`.

## Try It Yourself

- Add a fourth scalar, `$city`, and include it in the first `print`
  line.
- Add a fourth number to `@numbers` and print `$numbers[3]` to confirm
  it's the new value.
- Change one of the double-quoted strings above to single-quoted (swap
  `"..."` for `'...'`) and run again — see `$name` print literally
  instead of interpolating, confirming the double-quote-only rule
  stated in Terms, above.

**Next:** `lesson-2-control-flow-and-subroutines.md`
