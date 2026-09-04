# Lesson 7: Comprehensions as Controlled Iteration

**What you will build.** You'll prove that a list comprehension is not
special syntax with its own separate rules — it's exactly the same
accumulator `for` loop this curriculum has already used, in a
compressed, restricted form, and you'll prove the restriction directly
by triggering a real `SyntaxError` trying to break it. You'll then
discover a genuinely surprising fact most working Python programmers
never deliberately test: a comprehension's loop variable doesn't leak
into the surrounding code the way an ordinary `for` loop's does — a
direct, concrete consequence of Lesson 3's scoping rules, applied
somewhere you might not expect them to matter. From there you'll build
dict and set comprehensions, and a comprehension with more than one
`for` clause, before adding two real lookup methods to the project's
`TaskList`, built entirely on these forms. The transferable problem:
comprehension-style syntax exists all over the place once you know to
look for it — C#'s LINQ query syntax, JavaScript's `.map()`/`.filter()`
chains, Rust's iterator adaptor chains — and every one of them is
solving the identical problem this lesson names precisely: expressing
"build a new collection from an existing one" as one controlled,
readable expression, rather than several lines of manual loop
bookkeeping. Knowing exactly what a comprehension is and isn't allowed
to do in Python — not by feel, but because you've hit the actual
boundary and seen the actual error — means recognizing the same
disciplined shape instantly in whatever syntax another language wraps
around it.

**What you need to know first.** Lesson 3's LEGB rule and its precise
claim about local-variable scope — this lesson's most surprising fact
(a comprehension's loop variable isn't visible outside it) only makes
sense as a real, checkable claim to someone who already knows exactly
what "local to a function" meant in Lesson 3 and can now ask the sharp
follow-up question this lesson answers: is a comprehension's own
namespace the same as its surrounding function's, or something
separate? Lesson 6's honest flag about `loud()` — the side-effecting
function this curriculum used, deliberately, to make laziness visible
in a comprehension body — is revisited directly in this lesson's first
unit as an example of exactly the style this lesson teaches you to
avoid outside that narrow teaching purpose.

**Terms used in this lesson**

- **Comprehension** — a single expression, using `[...]`, `{...}` (for a
  set), or `{key: value ...}` (for a dict), that builds a new
  collection from an existing iterable by evaluating one expression once
  per item, optionally filtered by an `if` clause. This term exists to
  name the general syntactic category this entire lesson is about — a
  list comprehension, dict comprehension, and set comprehension are all
  instances of it, sharing the identical restrictions this lesson's
  first unit proves directly.
- **Accumulator pattern** — the ordinary, explicit form a comprehension
  is compressed from: an empty collection created before a loop,
  followed by a `for` loop that adds one element to it per iteration
  (`result = []` then `result.append(...)` inside a loop, for a list).
  This term exists because this lesson's first unit's entire argument
  is that a comprehension *is* this pattern, restricted and compressed
  — not a different mechanism achieving a similar-looking result.
- **Comprehension scope** — the fact that a comprehension's own loop
  variable exists only within the comprehension itself, in a namespace
  that doesn't leak into whatever function or module contains it. This
  term exists to name the specific, checkable claim this lesson's first
  unit proves with a real `NameError` — a direct, sharper application of
  Lesson 3's LEGB rule to a piece of syntax that looks, at a glance,
  exactly like an ordinary `for` loop but behaves differently in this
  one specific way.
- **Filter clause** — an optional `if <condition>` appended to a
  comprehension, restricting which items from the source iterable
  actually get included. This term exists to name the piece of syntax
  this lesson's second unit adds on top of the basic accumulator
  pattern — genuinely optional, and, per this lesson's own rules,
  itself required to be a single expression, exactly like the
  comprehension's main expression is.
- **Dict comprehension** — comprehension syntax using `{key_expr:
  value_expr for item in iterable}`, producing a `dict` rather than a
  `list`. This term exists because it's a genuinely distinct syntactic
  form from a list comprehension (curly braces plus a colon-separated
  key/value pair, rather than square brackets and a single expression),
  even though it follows the identical underlying rules this lesson's
  first unit establishes.
- **Set comprehension** — comprehension syntax using `{expr for item in
  iterable}` — curly braces, like a dict comprehension, but with a
  single expression rather than a key/value pair — producing a `set`.
  This term exists to be explicitly distinguished from a dict
  comprehension, since both use curly braces and are easy to confuse at
  a glance; the presence or absence of the colon is what determines
  which one Python actually parses.

**Objects and methods used**

- **`exec`**
  - *What it is:* A built-in function, available everywhere with no
    import.
  - *Implementation:* `exec(source) -> None`. Takes a string of Python
    source code and executes it, as if that string had been the actual
    program text at this point.
  - *Its use:* This lesson's first unit needs to trigger a real
    `SyntaxError` — a parse-time failure, not a runtime one — from
    inside a running script, in order to catch it with `try`/`except`
    and print its exact message; a syntax error in code written
    directly in the file would prevent the *entire file* from running
    at all, so `exec()` on a string is the tool that lets a genuinely
    invalid piece of Python be attempted, and fail, without taking the
    whole script down with it.
  - *Type:* A built-in free function.
  - *Responsibility:* Parse and run the given string as Python code in
    the current scope — its full charter includes both steps; if
    parsing itself fails, `exec()` is where that failure surfaces, as a
    real, catchable `SyntaxError`.
  - *Depends on:* A single required argument — a string containing
    Python source code.
  - *Connects to:* Called directly in this lesson's first lab; parses
    the given string using the exact same parser Python itself uses for
    any other source; if parsing succeeds, runs the resulting code;
    if parsing fails, raises `SyntaxError` back to the caller.
  - *Shape:* Always returns `None` on success — like `print()`, its
    entire value is in the side effect (here, executing code), not in a
    returned value.

- **`SyntaxError`**
  - *What it is:* A built-in exception class, representing invalid
    Python source code that cannot be parsed at all.
  - *Implementation:* Constructed automatically by Python's own parser
    when it encounters text that doesn't match any valid grammar rule;
    carries a message describing the problem and, often, a suggestion.
  - *Its use:* This lesson's first unit needs a way to name, precisely,
    the category of failure a malformed comprehension produces —
    `SyntaxError` is that category, and it's categorically different
    from every exception this curriculum has used so far (`TypeError`,
    `StopIteration`, `AttributeError`, `UnboundLocalError`): those are
    all *runtime* failures, raised while otherwise-valid code is
    executing; `SyntaxError` is raised before execution ever begins at
    all, because the code couldn't even be understood as valid Python
    in the first place.
  - *Type:* A built-in class.
  - *Responsibility:* Carry a description of exactly what part of the
    source text couldn't be parsed, and, unlike the exceptions this
    curriculum has used before, often a specific suggestion for what
    might have been meant instead.
  - *Depends on:* Constructed automatically by the parser — not
    something this lesson's own code constructs directly with a
    `raise` statement, unlike Lesson 2's `TypeError`.
  - *Connects to:* Raised by `exec()`'s internal parsing step, before
    any of the malformed code's own logic ever runs; caught by this
    lesson's `try`/`except SyntaxError:`, the same exception-handling
    pattern Lesson 5 already established.
  - *Shape:* A single exception object; `str()` of it (what `print()`
    displays) includes both a description of the problem and, in this
    lesson's own real, executed case, a direct suggestion for the
    likely intended syntax.

**Everything else in the file, not this lesson's subject but still explained.**

- **`range`**
  - The same built-in class from Lesson 6's second unit — restated per
    the Repetition Rule: constructs a range object producing a
    sequence of integers when iterated; used throughout this lesson's
    labs as a simple, ready-made source of values.
- **`print`, `type`, `list.append`, `isinstance`**
  - All fully covered in previous lessons and reappearing here
    unchanged; used throughout this lesson's labs exactly as already
    established.

---

## Concept Unit: A List Comprehension Is a Restricted Accumulator Loop

### The Problem

This curriculum has already written accumulator-pattern code without
comment — Lesson 5's manual `while` loop, and countless real-world
Python scripts, build an empty list, then grow it one element at a time
inside a `for` loop. Python also offers `[expr for item in iterable]`
syntax, which this curriculum has used casually since Lesson 6 (`[loud(n)
for n in range(3)]`) without ever precisely stating what it's allowed
to contain or exactly how it relates to the explicit loop version. Are
these genuinely two different mechanisms that happen to produce similar
results, or is a list comprehension something more specific: the exact
same mechanism, restricted?

> **Before reading on:** picture the accumulator pattern —
> `result = []`, then a `for` loop appending one transformed value per
> iteration. A list comprehension packs this into one line:
> `[expr for item in iterable]`. If they're really the same underlying
> operation, what do you predict happens if you try to put something
> that *isn't* a single expression inside the brackets — say, an actual
> assignment statement, the way you might write `x = x * x` as a full
> line inside an ordinary loop body? Would Python allow it, silently
> producing something unexpected, or would it refuse to even parse the
> comprehension at all?

### Isolating the Concept

```python
squares_loop = []
for n in range(5):
    squares_loop.append(n * n)
print(squares_loop)

squares_comp = [n * n for n in range(5)]
print(squares_comp)
print(squares_loop == squares_comp)
```

Real output:

```
[0, 1, 4, 9, 16]
[0, 1, 4, 9, 16]
squares_loop == squares_comp: True
```

Identical results, confirmed with `==` (Lesson 1's equality check).
This is called the **accumulator pattern** (defined in Terms, above),
and a list comprehension is exactly this pattern, compressed: `n * n`
is the single expression evaluated once per item; `for n in range(5)`
is the source loop; the whole thing implicitly builds and returns a new
list, the same job `squares_loop.append(...)` was doing explicitly.

The restriction this unit's Socratic prompt asked about is real, and
provable directly:

```python
bad_code = "squares = [x = x * x for x in range(5)]"
try:
    exec(bad_code)
except SyntaxError as e:
    print(e)
```

Real output:

```
SyntaxError: invalid syntax. Maybe you meant '==' or ':=' instead of '='? (<string>, line 1)
```

`x = x * x` — an assignment *statement* — is not a valid comprehension
body at all; Python's parser rejects it before any code ever runs,
raising `SyntaxError` (full treatment in Objects and methods, above).
This is called **comprehension** syntax's core restriction (defined in
Terms, above): the part before the first `for` must be a single
*expression* — something that evaluates to a value, like `n * n` — never
a statement, like an assignment. Python's own error message even
suggests two things you might have meant instead (`==`, a comparison
expression; or `:=`, the walrus assignment expression, a genuinely
different piece of syntax this curriculum doesn't cover here) — both of
which *are* expressions, and both of which would have been syntactically
legal in this exact position, unlike the plain `=` that was actually
written.

A third lab exposes a fact most working Python programmers never
deliberately test:

```python
result = [y * 2 for y in range(3)]
print(result)
try:
    print(y)
except NameError as e:
    print(e)

for z in range(3):
    pass
print(z)
```

Real output:

```
result: [0, 2, 4]
NameError: name 'y' is not defined
z after the ordinary for-loop: 2
```

`y`, the comprehension's own loop variable, does not exist at all once
the comprehension finishes — reading it afterward raises a real
`NameError`. `z`, from the ordinary `for` loop directly below it, *does*
survive — printing `2` (its value on the loop's final iteration),
exactly the behavior Lesson 3's LEGB rule already predicts for an
ordinary `for` loop's assignment target. This is called **comprehension
scope** (defined in Terms, above): a list comprehension, unlike an
ordinary `for` loop, runs its loop variable in its own private
namespace, entirely separate from the function or module containing
it — a genuine, sharp exception to the intuition an ordinary `for` loop
might otherwise suggest, and a direct, checkable application of Lesson
3's scoping rules to a piece of syntax that looks, at a glance, like it
should behave identically to a `for` loop and, in this one specific
way, does not.

### Discarding the Example

All three throwaway scripts shown here — the accumulator/comprehension
equivalence proof, the `SyntaxError` demonstration, and the
scope-leakage comparison — are deleted now and won't appear in later
lessons or project code. They existed only to isolate exactly what a
list comprehension is, and is not, allowed to contain, and exactly how
its scoping differs from an ordinary loop's.

### Project Change

No project change in this unit — this unit establishes the ground
rules comprehensions actually follow; the project application, using
dict and set comprehensions specifically, arrives in the next unit.

### Mechanical Walkthrough

- `squares_loop = []` — an assignment statement (Lesson 1) binding
  `squares_loop` to a new, empty list literal (Lesson 1, restated per
  the Repetition Rule).
- `for n in range(5):` — a `for` statement (Lesson 5, restated per the
  Repetition Rule), iterating over `range(5)` (Lesson 6, restated per
  the Repetition Rule), binding `n` to each integer in turn.
- `squares_loop.append(n * n)` — a call to `append` (Lesson 1's
  "Everything else" section, restated per the Repetition Rule), growing
  `squares_loop` in place by one element: `n * n`, the `*` operator
  (new to this curriculum's explicit walkthroughs, though arithmetic
  itself is not — ordinary multiplication of the two int objects `n`
  is currently bound to).
- `[n * n for n in range(5)]` — a list comprehension: for each value
  `range(5)` produces, in order, `n` is bound to it (in the
  comprehension's own private namespace, per this unit's own finding),
  `n * n` is evaluated, and the result becomes one element of a new
  list, built and returned as a whole once the source iterable is
  exhausted.
- `squares_loop == squares_comp` — the `==` operator (Lesson 1,
  restated per the Repetition Rule), comparing the two lists'
  contents for equality.
- `exec(bad_code)` — a call to the `exec` built-in (full treatment
  above), passed a string containing invalid Python source; attempts to
  parse and run it.
- `except SyntaxError as e:` — an `except` clause (Lesson 5, restated
  per the Repetition Rule) matching `SyntaxError` (full treatment
  above) specifically; `as e` binds the caught exception object itself
  to the name `e`, so its message can be printed.
- `print(e)` — `print` (Lesson 1, restated per the Repetition Rule),
  given the exception object `e`; printing an exception object
  directly displays its message text, the same text `str(e)` would
  produce.
- `result = [y * 2 for y in range(3)]` — an assignment statement whose
  right-hand side is a list comprehension, identical mechanism to the
  first lab's, using `y` as its loop variable this time.
- `print(y)`, outside the comprehension — attempts to look up the name
  `y`; per this unit's own finding, `y` was never bound in this
  script's own namespace at all — only inside the comprehension's own,
  separate one — so this lookup fails via the ordinary LEGB search
  (Lesson 3), finding `y` nowhere, and raises `NameError`.
- `except NameError as e:` / `print(e)` — the same exception-handling
  pattern as the `SyntaxError` case above, this time catching
  `NameError` (a built-in exception this curriculum hasn't formally
  named before now, though Lesson 3's `UnboundLocalError` is a closely
  related, more specific case of a name failing to resolve;
  `NameError` is the general "this name doesn't exist anywhere LEGB
  looked" failure).
- `for z in range(3): pass` — an ordinary `for` loop (Lesson 5,
  restated per the Repetition Rule) with `pass` (Lesson 4, restated per
  the Repetition Rule: a statement that does nothing) as its entire
  body, included purely to bind `z` through every iteration without
  doing anything else.
- `print(z)`, after the loop — succeeds, per Lesson 3's LEGB rule and
  this unit's own contrast: `z`, unlike the comprehension's `y`, is an
  ordinary local (or module-level) name, bound directly in the
  surrounding namespace by the `for` loop itself, and still resolvable
  there after the loop ends.

### CS Lens

This is a hard concept — that a piece of syntax visually resembling
another (a comprehension's `for`, an ordinary loop's `for`) can carry a
genuinely different scoping rule — so, per the Repetition Rule, several
unrelated recurrences:

```
Also recognized in: JavaScript's `let`/`const` block scoping versus
`var`'s function scoping (two pieces of syntax that look similar at a
glance, with genuinely different variable-leakage behavior, the exact
same shape of surprise this unit's y/z contrast demonstrates), SQL
subqueries (a variable or alias defined inside a subquery isn't visible
outside it, the same "private, contained namespace" idea), mathematical
set-builder notation itself (`{x² | x ∈ S}` — the direct notational
ancestor of Python's comprehension syntax, where `x` is understood to
be local to the expression, never a variable available anywhere else in
the surrounding proof or text), and C#'s LINQ query expressions (`from
x in collection select x * x` — the range variable `x` is scoped
entirely to the query expression, unavailable outside it, the identical
principle under different syntax)
```

### SE Lens

The alternative — letting a comprehension's loop variable leak into the
surrounding scope, the way an ordinary `for` loop's does (this was
actually true in Python 2's list comprehensions, changed deliberately
for Python 3) — was rejected specifically because it caused real,
observed bugs: a comprehension is meant to be a self-contained,
disposable expression, and letting its loop variable silently persist
and potentially collide with an unrelated variable of the same name
elsewhere in the same function undermines that containment. The real
cost of Python 3's actual, corrected choice: it's a genuine surprise the
first time you hit it, precisely because a comprehension's `for` looks
identical to an ordinary loop's `for` — this unit's own `y`/`z` contrast
exists specifically because that surprise is worth confronting
directly, once, deliberately, rather than discovering it accidentally
mid-debugging session later.

### Commands Needed

Run the same way as every previous lesson: `python3 lab1.py`. Nothing
new.

### Run It

Already shown and verified above, under "Isolating the Concept," for
all three parts of this unit's lab.

### Connection

This unit established the ground rules every comprehension follows:
single expression only, its own private scope. The next unit builds on
those exact rules to construct two comprehension forms this curriculum
hasn't used yet — dict and set comprehensions — plus filtering and
multi-clause comprehensions, all governed by the identical restrictions
this unit just proved.

---

## Concept Unit: Filtering, Dict Comprehensions, Set Comprehensions, and Multiple `for` Clauses

### The Problem

The previous unit's comprehensions each transformed *every* item from
their source iterable, and always produced a `list`. Real filtering
needs — "only the even numbers," say — and real target shapes other
than a list — a lookup table (a `dict`), or a collection of unique
values (a `set`) — come up constantly in real code. Does comprehension
syntax extend to cover these needs, using the same underlying rules the
previous unit already proved, or does each of these require an
entirely separate mechanism?

> **Before reading on:** the previous unit proved `[expr for item in
> iterable]` is a compressed accumulator loop. If you wanted to filter
> out some items — skip odd numbers, say — using the accumulator
> pattern by hand, you'd add an `if` check inside the loop before the
> `.append()` call. Given that a comprehension is exactly this pattern
> compressed, what syntax would you guess lets you add that same
> filtering, directly inside the comprehension itself? And separately:
> if `{...}` with a single expression inside makes a `set` (the same
> curly-brace syntax a bare `{1, 2, 3}` literal already uses for a set,
> outside of any comprehension), what do you predict happens if you
> put a `key: value` pair inside curly braces instead, followed by a
> `for` clause — a `set`, still, or something else?

### Isolating the Concept

```python
nums = [1, 2, 3, 4, 5, 6]

evens = [n for n in nums if n % 2 == 0]
print(evens)
```

Real output:

```
[2, 4, 6]
```

`if n % 2 == 0` — a **filter clause** (defined in Terms, above) — is
itself an ordinary expression (`n % 2 == 0`, using `%`, the modulo
operator, and `==`, comparison), evaluated once per item, before that
item's main expression (here, just `n` itself) is included. An item is
included only when the filter expression is truthy — exactly matching
what an `if` check inside an accumulator loop's body would do before
its own `.append()` call.

```python
squares_dict = {n: n * n for n in nums}
print(squares_dict)
print(type(squares_dict))

remainders = {n % 3 for n in nums}
print(remainders)
print(type(remainders))
```

Real output:

```
{1: 1, 2: 4, 3: 9, 4: 16, 5: 25, 6: 36}
<class 'dict'>
{0, 1, 2}
<class 'set'>
```

`{n: n * n for n in nums}` — a **dict comprehension** (defined in
Terms, above) — produces a real `dict`, mapping each `n` to `n * n`;
the colon is what distinguishes this from a set comprehension, even
though both use curly braces. `{n % 3 for n in nums}` — a **set
comprehension** (defined in Terms, above), with no colon, a single
expression instead — produces a real `set`: note it holds only three
elements, `{0, 1, 2}`, even though `nums` has six — a `set`'s own
defining property (no duplicate elements, a fact this curriculum hasn't
formally covered but is directly visible here) automatically collapses
the repeated remainders `1 % 3` and `4 % 3` (both `1`) and `2 % 3` and
`5 % 3` (both `2`) down to one occurrence each.

A third lab proves a comprehension can draw from more than one source
at once:

```python
matrix = [[1, 2], [3, 4], [5, 6]]
flattened = [x for row in matrix for x in row]
print(flattened)

flattened_loop = []
for row in matrix:
    for x in row:
        flattened_loop.append(x)
print(flattened_loop)
print(flattened == flattened_loop)
```

Real output:

```
[1, 2, 3, 4, 5, 6]
[1, 2, 3, 4, 5, 6]
flattened == flattened_loop: True
```

`[x for row in matrix for x in row]` — two `for` clauses in one
comprehension — is exactly the compressed form of a *nested* `for`
loop: the first `for row in matrix` is the outer loop; the second
`for x in row` is the inner one, running completely, for each value of
`row`, before the outer loop advances — the identical order and
behavior as the explicit nested `for`/`for`/`.append()` version proven
equal by `==` here, confirming this multi-clause form follows the exact
same "compressed accumulator loop" rule this lesson's first unit
already established, just with two `for` clauses compressed instead of
one.

### Discarding the Example

All three throwaway scripts shown here — the filtered list
comprehension, the dict/set comprehension pair, and the
nested-`for`/flattening comparison — are deleted now and won't appear
in later lessons or project code. They existed only to isolate each
comprehension variant in the smallest possible form.

### Project Change

No project change in this unit — the project application, using a dict
comprehension and a set comprehension directly, arrives in the next
unit.

### Mechanical Walkthrough

- `nums = [1, 2, 3, 4, 5, 6]` — an assignment statement (Lesson 1)
  binding `nums` to a new list literal.
- `[n for n in nums if n % 2 == 0]` — a list comprehension (this
  lesson's first unit) with a filter clause: `n % 2 == 0` is a filter
  clause (defined in Terms, above), itself an expression using `%` (the
  modulo operator: computes the remainder of dividing `n` by `2`) and
  `==` (Lesson 1's equality check, restated per the Repetition Rule);
  for each `n` in `nums`, this expression is evaluated first, and `n`
  is included in the resulting list only when it evaluates to `True`.
- `{n: n * n for n in nums}` — a dict comprehension: for each `n` in
  `nums`, the pair `n: n * n` (key, then value, separated by a colon)
  is evaluated, and a new key/value pair is added to a new dict being
  built — `n` itself becomes the key, `n * n` becomes the value bound
  to it.
- `{n % 3 for n in nums}` — a set comprehension: for each `n` in
  `nums`, `n % 3` is evaluated, and the result is added to a new set
  being built — a `set`'s own nature (established as a real, observed
  fact by this unit's real output, though not this lesson's own
  subject) means a value already present is simply not added again,
  rather than producing a duplicate entry.
- `matrix = [[1, 2], [3, 4], [5, 6]]` — an assignment statement binding
  `matrix` to a list literal whose own elements are themselves list
  literals — a list of lists, genuinely narrow structure specific to
  this lab, not a subject of its own.
- `[x for row in matrix for x in row]` — a list comprehension with two
  `for` clauses: the first, `for row in matrix`, binds `row` to each
  inner list in turn; the second, `for x in row`, nested inside the
  first, binds `x` to each element of whichever `row` is currently
  bound to; `x` (the expression before the first `for`) is evaluated
  and included in the result for every combination this double
  iteration produces, in the exact order a nested loop would visit
  them.
- `for row in matrix:` / `for x in row:` / `flattened_loop.append(x)` —
  the explicit nested-loop, accumulator-pattern equivalent, confirming
  the comprehension's own order and result via `==`.

### CS Lens

This reappears the accumulator-compression idea from this lesson's
first unit, restated in full per the Repetition Rule, now shown to
extend uniformly across target collection types and multiple source
iterables:

```
Also recognized in: SQL's SELECT with a WHERE clause and a JOIN (a
filter clause is exactly a WHERE condition; multiple for clauses in a
comprehension are structurally close to a JOIN's cross-product-then-
filter behavior over multiple tables), functional programming's
map/filter/reduce trio generally (a comprehension with a filter clause
is precisely `filter` and `map` fused into one expression), Haskell's
own list comprehension syntax (nearly identical notation to Python's,
including multiple generators and guards/filters, and a direct
influence on Python's own design), and relational algebra's projection
and selection operators (the formal mathematical operations a SQL
SELECT/WHERE pair, and by extension a filtered comprehension, are
themselves modeling)
```

### SE Lens

The alternative — writing every one of these as an explicit
accumulator loop, always, with no comprehension form at all — remains
completely valid Python, and this lesson's own equality checks prove
the two are behaviorally identical; comprehensions are chosen, when
they're chosen well, purely for readability and conciseness at the call
site, not for any capability an explicit loop lacks. The real,
honest cost, worth naming directly rather than glossing over: a
comprehension with a filter clause *and* two `for` clauses, all
squeezed onto one line, can become genuinely harder to read than the
equivalent explicit nested loop with an `if` inside it — this lesson's
own multi-clause example is short enough to stay clear, but the same
compression applied to a more complex real-world filter-and-transform
operation is a common, real source of Python code that's technically
correct and genuinely difficult to read at a glance; there is no fixed
rule for exactly where that line sits, only the judgment that
readability, not brevity for its own sake, is the actual goal a
comprehension is meant to serve.

### Commands Needed

Run the same way as every previous lesson: `python3 lab2.py`. Nothing
new.

### Run It

Already shown and verified above, under "Isolating the Concept," for
all three parts of this unit's lab.

### Connection

This unit established dict comprehensions, set comprehensions, filter
clauses, and multi-clause comprehensions, all governed by the previous
unit's same core rules. The next unit applies two of these forms
directly to the project: a dict comprehension for fast lookup by task
ID, and a set comprehension for the distinct priority levels currently
in use.

---

## Concept Unit: `by_id()` and `priorities_used()` — Comprehensions Applied to the Project

### The Problem

`TaskList`, as Lesson 6 left it, supports iterating over every task and
filtering to just the pending ones — but has no fast way to find one
specific task by its `id`, short of looping through every task and
checking each one's `"id"` by hand. It also has no way to answer "what
priority levels are actually in use right now?" without similarly
writing a manual loop and manually avoiding duplicate entries. Both of
these are exactly the two comprehension forms this lesson just built —
does building them as real `TaskList` methods actually look any
different from this lesson's own throwaway labs, now that they're
solving a genuine need rather than an isolated example?

> **Before reading on:** a dict comprehension maps each source item to
> a key and a value. If you wanted a fast id-to-task lookup, what
> would the key be, and what would the value be, for each task in
> `self._tasks`? And separately: a set comprehension collects unique
> values, automatically dropping duplicates, exactly as this lesson's
> own `{n % 3 for n in nums}` lab already proved. If two different
> tasks in `self._tasks` happen to share the same `priority` value,
> what would you expect a set comprehension built from `task["priority"]`
> for every task to actually contain — one entry per task, or one entry
> per *distinct* priority value?

### Isolating the Concept

The mechanism this unit needs was already fully isolated in this
lesson's second unit — a dict comprehension mapping each item to a
key/value pair, and a set comprehension collecting distinct values. No
further throwaway lab is needed before applying both directly, the same
pattern Lesson 6's third unit already followed for its own
already-isolated `yield` mechanism.

### Discarding the Example

Not applicable — see above: this unit builds directly on the previous
units' already-isolated mechanisms, with no new throwaway script of its
own to discard.

### Project Change

- **Reference Source:** No reference counterpart — original to this
  project, same as every previous unit in this curriculum.
- **Files affected:** `project/tasks.py` (modified), `project/main.py`
  (modified).
- **Change type:** Add — two new methods, `by_id` and `priorities_used`,
  on the existing `TaskList` class in `tasks.py`; `main.py` updated to
  demonstrate both.
- **Location:** Both new methods are added directly after `TaskList.
  pending()`, established in Lesson 6; `main.py`'s existing setup and
  demonstrations are left unchanged, with new lines added at the end.
- **Dependencies:** None new — dict and set comprehensions are both
  already covered earlier in this lesson.

### The New Code

```python
    def by_id(self) -> dict:
        return {task["id"]: task for task in self._tasks}

    def priorities_used(self) -> set:
        return {task["priority"] for task in self._tasks}
```

### The Updated Project

```
tasks.py:
56  def pending(self):
57      for task in self._tasks:
58          if not task["done"]:
59              yield task
60
61      def by_id(self) -> dict:                                  # ← new
62          return {task["id"]: task for task in self._tasks}     # ← new
63                                                                  # ← new
64      def priorities_used(self) -> set:                         # ← new
65          return {task["priority"] for task in self._tasks}     # ← new
```

```
main.py:
26  print("=== Calling pending() a second time — a fresh generator, not exhausted ===")
27  for task in my_tasks.pending():
28      print(describe_task(task))
29
30  print("=== Looking up a task by id ===")                       # ← new
31  lookup = my_tasks.by_id()                                      # ← new
32  print(lookup[2]["title"])                                      # ← new
33
34  print("=== Distinct priority levels currently in use ===")     # ← new
35  print(my_tasks.priorities_used())                              # ← new
```

As a whole, `TaskList` now provides four distinct ways to work with its
contents: `__iter__` (Lesson 5) for every task; `pending()` (Lesson 6)
for just the unfinished ones; `by_id()` (this unit) for fast lookup by
a specific task's identifier; and `priorities_used()` (this unit) for
the distinct set of priority levels actually present, with no
duplicates even if several tasks happen to share a priority. `main.py`,
as a whole, now demonstrates both: looking up a specific task's title
by its known `id`, and printing the full set of priority levels
currently represented among the project's tasks.

### Mechanical Walkthrough

- `def by_id(self) -> dict:` — a method definition (Lesson 5, restated
  per the Repetition Rule) with a hinted return type (Lesson 2,
  restated per the Repetition Rule), taking only `self`.
- `return {task["id"]: task for task in self._tasks}` — a `return`
  statement (Lesson 2) whose value is a dict comprehension (full
  treatment in this lesson's second unit, restated per the Repetition
  Rule): for each `task` dict in `self._tasks`, the key is
  `task["id"]` (a subscript access, Lesson 3, restated per the
  Repetition Rule) and the value is `task` itself — the entire task
  dict, not a copy of it, per Lesson 1's binding model — bound to that
  key.
- `def priorities_used(self) -> set:` — a method definition, hinted
  return type `set`, taking only `self`.
- `return {task["priority"] for task in self._tasks}` — a `return`
  statement whose value is a set comprehension (full treatment in this
  lesson's second unit, restated per the Repetition Rule): for each
  `task` dict in `self._tasks`, `task["priority"]` (a subscript access)
  is evaluated and added to a new set — any repeated priority value
  across multiple tasks is automatically represented only once, per
  this lesson's second unit's own proof of `set`'s duplicate-collapsing
  behavior.
- `lookup = my_tasks.by_id()`, in `main.py` — a method call, binding
  `lookup` to the dict `by_id()` returns.
- `lookup[2]["title"]` — a subscript access on `lookup` (looking up the
  key `2`, retrieving the full task dict for the task whose `id` is
  `2` — `task_b`, per this project's own earlier `create_task` calls),
  followed by a second subscript access on the result, retrieving that
  task's `"title"` value.
- `print(lookup[2]["title"])` — `print` (Lesson 1, restated per the
  Repetition Rule), writing the retrieved title string.
- `print(my_tasks.priorities_used())` — a method call, then `print`,
  writing the resulting set directly.

### CS Lens

This reappears the dict/set comprehension idea from earlier in this
lesson, restated in full per the Repetition Rule, now specifically as a
real, reusable lookup and deduplication mechanism rather than an
isolated example:

```
Also recognized in: database indexes (a dict comprehension mapping id
to record is, structurally, exactly what a primary-key index provides
— O(1) lookup by a known key instead of scanning every record), the
DISTINCT keyword in SQL (priorities_used()'s set comprehension is the
identical operation: collapse a column's values down to their unique
set), caching/memoization layers generally (building an id-to-object
map once, up front, to avoid repeated linear scans — the same
trade this method makes, giving up a small amount of memory and
up-front construction time for fast repeated lookups), and hash
tables as a general data structure (a Python dict is, underneath, a
hash table — by_id()'s O(1) average-case lookup by key is a direct
consequence of that underlying structure, not something the
comprehension syntax itself grants; the comprehension is just a
concise way to build one)
```

### SE Lens

The alternative — leaving lookup-by-id to whatever calling code needs
it, requiring a manual linear scan through `TaskList.__iter__` (or
direct access to `self._tasks`, if `TaskList` even exposed that)
every single time a specific task needs to be found — was rejected
here because `by_id()` centralizes that lookup logic in exactly one
place, using the language's own hash-table-backed `dict` for genuinely
fast repeated access rather than every caller reimplementing its own
linear search. The real, honest cost: `by_id()`, as written, builds a
brand-new dict from scratch on every single call — it does not cache
anything, so `my_tasks.by_id()` called twice in a row does the identical
work twice, rebuilding an equivalent dict both times; for a `TaskList`
that changes frequently (new tasks added between calls), this is
actually the *correct*, safe behavior — a cached version could go
stale the moment a new task is added — but for a `TaskList` that's
queried far more often than it changes, this cost is real and worth
knowing about, not something this method's current design hides or
solves.

### Commands Needed

The updated project runs and checks the same way every previous
lesson's project code has: `python3 main.py`, `mypy main.py`.

### Run It

The real, updated project's full output:

```
=== Looking up a task by id ===
Review lesson 3
=== Distinct priority levels currently in use ===
{1, 2}
```

(shown here starting from this unit's own new lines; the earlier lines,
established in Lessons 5 and 6, are unchanged and already verified in
those lessons.) `lookup[2]["title"]` correctly retrieves `"Review
lesson 3"` — `task_b`'s title, since `task_b` was created with `id`
`2`. `priorities_used()` correctly returns `{1, 2}` — the two distinct
priority values actually present across `task_a` and `task_b`, with no
duplicates, since this project's own two tasks happen to have two
different priorities. `mypy main.py` reports:

```
Success: no issues found in 1 source file
```

### Connection

This unit is where both of this lesson's comprehension forms became
real, working project features: `by_id()` turns this lesson's dict
comprehension lab into fast, centralized lookup by a task's own
identifier; `priorities_used()` turns this lesson's set comprehension
lab into an honest, deduplicated answer to "what priority levels exist
right now" — both built on the exact same single-expression,
private-scope rules this lesson's first unit proved govern every
comprehension, with no exception carved out for being used inside a
real class method rather than a standalone script.

---

## Connect the Pieces

Trace `lookup[2]["title"]`, from the project's own `main.py`, back
through everything this lesson built. `my_tasks.by_id()` is called
first: per this lesson's first unit's own accumulator-pattern proof, `{
task["id"]: task for task in self._tasks}` is exactly the compressed
form of building an empty dict and looping over `self._tasks`, adding
one key/value pair per task — here, with `task["id"]` as each key,
proven, by this lesson's second unit's own dict-comprehension lab, to
produce a real `dict` rather than the `set` a colon-free version would
have produced. The comprehension's own loop variable, `task`, exists
only inside this expression's own private namespace — per this lesson's
first unit's `y`/`NameError` proof — and is discarded the moment the
comprehension finishes, leaving behind only the dict itself, bound to
`lookup`. `lookup[2]` then retrieves the one task dict whose `id` key
was `2` — `task_b`'s dict, unchanged from when `create_task` first
built it back in Lesson 2 — and `["title"]` retrieves its title string
directly. Every piece of that one expression — the single-expression
restriction, the private comprehension scope, the dict-versus-set
distinction, and the accumulator pattern it all compresses — is
something this lesson proved directly, with real, executed evidence,
before it was ever trusted to sit quietly inside a real method on the
project's own `TaskList`.
