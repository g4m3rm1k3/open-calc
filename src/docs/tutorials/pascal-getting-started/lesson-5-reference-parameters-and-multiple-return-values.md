# Lesson 5: Reference Parameters and Multiple Return Values

**What you will build:** A procedure that modifies the caller's own
variable directly, and a second procedure that hands back two separate
string results at once — something a Pascal `function` (which returns
exactly one value) cannot do on its own.

**What you need to know first:** Lesson 4 — `Copy`, `Pos`, `Length`,
and string indexing. Lesson 2 — the difference between a `procedure`
(no return value) and a `function` (returns one value via its own
name).

**Terms used in this lesson:**
- **Value parameter** — the default way a Pascal procedure or function
  receives a parameter: the parameter variable inside the routine holds
  a *copy* of whatever was passed in. Changing that copy inside the
  routine has no effect on the caller's original variable — this is
  exactly how Lesson 2's `Square(x: integer)` parameter behaved,
  restated here in full as the contrasting case for this lesson's new
  construct.
- **`var` parameter** — a parameter declared with the keyword `var`
  immediately before its name in the parameter list. Instead of a copy,
  the routine receives direct access to the caller's actual storage
  location — changes made to a `var` parameter inside the routine are
  changes to the caller's own variable, visible after the call returns.
  This exists specifically because a Pascal `function` can only return
  one value through its name; `var` parameters are how a routine hands
  back more than one result, or modifies something the caller already
  owns instead of building a new value from scratch.

**Objects and methods used:**
- **`Increment`** (this lesson's own procedure) —
  - *What it is:* a procedure, defined by this lesson's own code, that
    adds one to whatever `integer` variable is passed to it.
  - *Implementation:* `procedure Increment(var value: integer);` — one
    `var` parameter, no return value.
  - *Its use:* the simplest possible demonstration of a `var`
    parameter's effect: a one-line body that only makes sense if
    `value` really is the caller's own variable, not a copy.
- **`Split`** (this lesson's own procedure) —
  - *What it is:* a procedure, defined by this lesson's own code, that
    divides a sentence into its first word and everything after it.
  - *Implementation:* `procedure Split(s: string; var first, rest:
    string);` — one plain value parameter (`s`), and two `var`
    parameters (`first`, `rest`) sharing a single `var` keyword.
  - *Its use:* demonstrates the actual reason `var` parameters exist:
    handing back **two** separate results from one procedure call,
    which a `function` — limited to one return value — cannot do
    directly.

---

## The Problem

Lesson 2's `Square` function computed and returned exactly one value.
Some tasks need a routine to change a variable the *caller* already
owns (increment a counter in place), or to produce more than one result
from a single call (split a sentence into two pieces at once) — neither
fits through a function's single return value.

## The Code

```pascal
program VarParams;

procedure Increment(var value: integer);
begin
  value := value + 1;
end;

procedure Split(s: string; var first, rest: string);
begin
  first := Copy(s, 1, Pos(' ', s) - 1);
  rest := Copy(s, Pos(' ', s) + 1, Length(s));
end;

var
  count: integer;
  sentence, head, tail: string;
begin
  count := 5;
  Increment(count);
  writeln('Count after Increment: ', count);

  sentence := 'the quick brown fox';
  Split(sentence, head, tail);
  writeln('Head: ', head);
  writeln('Tail: ', tail);
end.
```

## Walkthrough

`procedure Increment(var value: integer);` declares a procedure with
one parameter, `value`, of type `integer` — and the keyword `var`
immediately before it, marking this as a **`var` parameter**, defined
in Terms above. Without that `var`, this would be an ordinary **value
parameter** (also defined above) — the same kind Lesson 2's `Square`
used — and the entire rest of this Concept Unit would have nothing to
demonstrate, since a copy's modifications never escape the procedure.

`value := value + 1;` is the procedure's entire body: read `value`, add
`1`, store the result back into `value`. Written in isolation this
looks identical to any earlier assignment in this series — the
difference is entirely in what `value` *refers to*, which is governed
by the `var` in the declaration above, not by anything in this line
itself.

`count := 5;` and `Increment(count);` — calling `Increment` with
`count` as the argument. Because `Increment`'s parameter is declared
`var`, this call does not copy `count`'s value into `value` the way a
plain value parameter would; instead, `value` becomes another name for
`count`'s own storage, for the duration of the call. When the
procedure's body runs `value := value + 1;`, it is directly modifying
`count`.

`writeln('Count after Increment: ', count);` prints `6`, not `5` —
proof that the call actually changed the caller's own variable, not a
throwaway copy.

**Optional aside, skip freely if this doesn't ring a bell:** if you've
ever seen a C++ function parameter written with a trailing `&`, like
`void increment(int& value)`, that's the same idea as a Pascal `var`
parameter — both mean the callee receives the caller's actual storage
location, not a copy, so writes through the parameter are writes to the
caller's variable. The only difference is where the marker sits: Pascal
writes `var` before the parameter name; C++ writes `&` after the type.
Not needed to understand anything below — just a label for readers who
happen to already have that one pattern in their head.

`procedure Split(s: string; var first, rest: string);` declares a
second procedure with three parameters: `s`, a plain **value**
parameter (no `var`) holding a copy of whatever string is passed in —
modifying `s` inside this procedure would not affect the caller, though
this procedure never does; and `first, rest: string`, two parameter
names sharing one `var` keyword and one `string` type. Pascal allows
grouping several parameter names together like this when they share
both a passing mode and a type — this declares `first` and `rest`
identically to writing `var first: string; var rest: string;`
separately.

`first := Copy(s, 1, Pos(' ', s) - 1);` reuses `Copy` and `Pos` from
Lesson 4, in full: `Pos(' ', s)` finds the first space's position
(`4`, for this sentence); `Copy(s, 1, 4 - 1)` extracts the first `3`
characters, `"the"`; `:=` stores that into `first` — but because
`first` is a `var` parameter, this assignment reaches directly into
whatever variable the *caller* passed as `first`, not a local copy.

`rest := Copy(s, Pos(' ', s) + 1, Length(s));` computes the remainder
of the sentence: `Pos(' ', s) + 1` is `5`, the position right after the
space; `Copy(s, 5, Length(s))` asks for `Length(s)` (`19`) characters
starting at position `5` — more characters than actually remain, which
`Copy` handles safely by simply returning everything available up to
the string's actual end, `"quick brown fox"`. `:=` stores that into
`rest`, again writing directly to the caller's variable via the `var`
parameter.

`sentence := 'the quick brown fox';` assigns the input sentence, same
as Lesson 4.

`Split(sentence, head, tail);` — this single call produces **two**
results at once: after it returns, `head` holds `"the"` and `tail`
holds `"quick brown fox"`, even though neither `head` nor `tail` was
ever assigned anywhere in the main program's own code — both were
filled in entirely by `Split`, reaching into them through its `var`
parameters. This is the concrete answer to this lesson's opening
problem: a `function` could return `first` or `rest`, but never both
from one call; a procedure with two `var` parameters can.

`writeln('Head: ', head);` and `writeln('Tail: ', tail);` print both
results, confirming the split actually happened.

## SE Lens

The design principle here is **output via explicit reference, not
hidden global state.** An alternative that was *not* chosen: `Split`
could have written its results into global variables instead of `var`
parameters, avoiding parameters entirely — but that would silently
couple `Split` to specific variable names chosen outside it, making it
unusable with any other pair of strings without editing `Split`
itself. `var` parameters keep the same "modify the caller's data"
capability while staying fully general: `Split` works on *whichever*
two string variables the caller hands it, by position, not by name.
The real cost of `var` parameters, honestly: a call site like
`Split(sentence, head, tail)` does not visually announce, the way a
value-returning call does, that `head` and `tail` are about to be
overwritten — a reader has to already know the procedure's signature to
know that. This is a genuine, standing tradeoff, not a solved problem.

## Expected Output

```
Count after Increment: 6
Head: the
Tail: quick brown fox
```

Not run this session — confirm with `fpc varparams.pas` and
`.\varparams.exe`.

## Try It Yourself

- Write a `Swap(var a, b: integer)` procedure that exchanges two
  integers' values using a third, temporary variable inside the
  procedure — a classic use of `var` parameters that is impossible to
  write correctly with plain value parameters.
- Remove the `var` keyword from `Increment`'s parameter, recompile, and
  observe that `count` now prints `5`, not `6` — direct proof of what
  `var` was actually doing.
- Call `Split` a second time on a different sentence, reusing the same
  `head`/`tail` variables, and confirm both get fully overwritten with
  the new sentence's pieces.

**Next:** `lesson-6-reading-and-writing-text-files.md`
