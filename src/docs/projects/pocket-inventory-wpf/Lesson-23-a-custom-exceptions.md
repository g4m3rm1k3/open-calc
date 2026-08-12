# Lesson 23a: A Failure With Its Own Name

*(Prepended before Lesson 24 — see `CURRICULUM_NOTES.md`'s 2026-07-31
audit. Lesson 24's own real code catches `SqliteException` specifically
— a real, library-authored exception type, distinguishable from a
generic `Exception` — with no explanation of how that distinction is
even possible. This lesson explains it, and shows you how to write the
same kind of distinguishable failure yourself.)*

**Developer Story**
> As a developer about to catch `SqliteException` specifically, rather
> than plain `Exception`, I want to understand how a `catch` block can
> tell different kinds of failure apart — and how to give my own
> failures that same kind of name.

**What you will build**
Nothing that survives — every example here is a throwaway lab, same as
every other prepended lesson. What you'll walk away with: a real,
tested reason to define your own exception type, instead of always
throwing and catching plain `Exception`.

**What you need to know first**
Lesson 0a: class, inheritance. Lesson 0c: `abstract` classes (not
required, but the same "base type with real, meaningful subtypes"
shape applies here).

**Terms introduced in this lesson:**
- **Custom exception** — a class that inherits from `Exception` (or one
  of its subclasses), giving a specific kind of failure its own real
  type — catchable on its own, separately from every other kind of
  failure.
- **`catch` resolution by type** — when multiple `catch` blocks follow
  one `try`, C# checks them in order, top to bottom, and runs the first
  one whose declared exception type matches the thrown exception's real
  type (or a base type of it).

**Objects and methods used**
- **`System.Exception`**
  - *What it is:* the base class every exception type in .NET
    ultimately derives from.
  - *Implementation:* declares a `Message` property (a `string`
    describing what went wrong) and a constructor chain — a derived
    exception's own constructor typically calls `: base(message)` to
    store that text, inherited automatically rather than re-declared.
  - *Its use:* the real base class this lesson's own
    `InvalidCategoryException` derives from — this lesson's own
    subject, given full treatment in the Concept Unit below.

---

## Concept Unit: Why a Generic `Exception` Isn't Enough

### The Problem

`Validate` can fail for two genuinely different reasons — a blank
category, or a category that isn't a recognized one — and code calling
it might reasonably want to react differently to each (offer to create
a new category vs. simply ask for a non-blank one). Throwing plain
`Exception` for both, worth checking directly, whether the calling code
can actually tell them apart.

### Introduce the Concept in Isolation
```bash
dotnet new console -o ExceptionLab
```

Replace `Program.cs`:

```csharp
void Validate(string category)
{
    if (string.IsNullOrWhiteSpace(category))
    {
        throw new Exception("Category cannot be blank.");
    }
    if (category != "Tools" && category != "Electronics")
    {
        throw new Exception($"'{category}' is not a valid category.");
    }
}

string[] categories = { "Vehicles", "Tools" };

foreach (string category in categories)
{
    try
    {
        Validate(category);
        Console.WriteLine($"'{category}' is valid.");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Caught a problem: {ex.Message}");
        Console.WriteLine($"  What kind of problem was it? Can't tell — just 'Exception'.");
    }
}
```

Run it:

```bash
dotnet run
```

Real output:

```text
Caught a problem: 'Vehicles' is not a valid category.
  What kind of problem was it? Can't tell — just 'Exception'.
'Tools' is valid.
```

#### Execution Trace

1. `Validate("Vehicles")` — not blank, so the first check passes; fails
   the second check (`"Vehicles"` is neither `"Tools"` nor
   `"Electronics"`) and throws `new Exception("'Vehicles' is not a valid category.")`.
2. The `try` block's `Validate(category)` call never returns normally —
   control jumps straight to `catch (Exception ex)`, printing the real
   message and the honest admission that nothing about `ex`'s own type
   says which check actually failed.
3. `Validate("Tools")` — passes both checks, throws nothing; the `try`
   block completes normally, `catch` never runs, and
   `"'Tools' is valid."` prints.

*What this proves:* the `catch (Exception ex)` block genuinely cannot
tell, from `ex`'s own type, whether `Validate` failed because the
category was blank or because it wasn't recognized — both are exactly
the same type, `Exception`, distinguishable only by parsing
`ex.Message`'s text, a fragile approach that breaks the moment the
message wording ever changes.

### Discard the Throwaway Example
Keep `ExceptionLab` open — the fix, next, reuses this project.

### Mechanical Walkthrough

- `throw new Exception("...")`, used for two genuinely different real
  problems — reappearing shape (Lesson 35's CSV import already threw
  and caught plain exceptions), here deliberately shown as
  insufficient once a caller needs to react differently per failure
  kind.
- `catch (Exception ex)` — catches everything, by design; the problem
  isn't that it fails to catch, it's that it catches too broadly to act
  on afterward.

### CS Lens

Every exception in .NET, including every one thrown so far in this
project, is already some specific type — `Exception` itself, or one of
its many built-in subclasses (`ArgumentException`, `InvalidCastException`,
the real one this project's own Lesson 6a lab produced). The problem
this unit demonstrated isn't that C# lacks a way to distinguish failure
types — it's that *this specific code* threw the same, least-specific
type (`Exception` itself) for two different real problems, throwing
away information that already had a natural place to live.

### SE Lens

Why not just fix this by checking `ex.Message`'s text directly — for
example, `if (ex.Message.Contains("blank"))`? Because that ties correct
behavior to exact wording that has no reason to stay stable: a later
rewording of the message (fixing a typo, translating it, making it more
user-friendly) would silently break the check, with nothing in the type
system ever flagging the mismatch. Distinguishing failures by *type*
means the compiler and the runtime both enforce the distinction — a
message string can change freely without breaking anything that reacts
to the type itself.

### Connection

The fix is one small class, inheriting from `Exception`, next.

---

## Concept Unit: `class ... : Exception` — Catching by Real Type

### The Problem

`Validate`'s two real failure kinds need two real, distinguishable
types — not two different message strings that only a human reading the
text could tell apart.

### Introduce the Concept in Isolation

In the same `ExceptionLab` project, replace `Program.cs`:

```csharp
void Validate(string category)
{
    if (string.IsNullOrWhiteSpace(category))
    {
        throw new Exception("Category cannot be blank.");
    }
    if (category != "Tools" && category != "Electronics")
    {
        throw new InvalidCategoryException(category);
    }
}

string[] categories = { "Vehicles", "", "Tools" };

foreach (string category in categories)
{
    try
    {
        Validate(category);
        Console.WriteLine($"'{category}' is valid.");
    }
    catch (InvalidCategoryException ex)
    {
        Console.WriteLine($"Invalid category: '{ex.AttemptedCategory}' — offering to create it.");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Some other problem: {ex.Message}");
    }
}

class InvalidCategoryException : Exception
{
    public string AttemptedCategory { get; }

    public InvalidCategoryException(string attemptedCategory)
        : base($"'{attemptedCategory}' is not a recognized category.")
    {
        AttemptedCategory = attemptedCategory;
    }
}
```

Run it:

```bash
dotnet run
```

Real output:

```text
Invalid category: 'Vehicles' — offering to create it.
Some other problem: Category cannot be blank.
'Tools' is valid.
```

#### Execution Trace

1. `Validate("Vehicles")` throws a real `InvalidCategoryException` —
   `catch (InvalidCategoryException ex)`, the first `catch` block,
   matches it directly, and reads `ex.AttemptedCategory` — a real
   property this exception type carries that plain `Exception` never
   had.
2. `Validate("")` throws a plain `Exception` (the blank-category case
   was deliberately left unconverted) — `catch (InvalidCategoryException ex)`
   does **not** match (a blank-category failure is not an
   `InvalidCategoryException`); C# falls through to the second
   `catch (Exception ex)`, which does.
3. `Validate("Tools")` throws nothing — no `catch` runs at all,
   `"'Tools' is valid."` prints normally.

*What this proves:* two `catch` blocks, checked in order, correctly
route each real failure to the handler suited to it — the blank-category
problem never reaches the `InvalidCategoryException`-specific handler,
and the invalid-category problem is handled with real, structured data
(`AttemptedCategory`) instead of parsed out of a message string.

### Discard the Throwaway Example
Delete the `ExceptionLab` folder. `class ... : Exception` is not
discarded — `SqliteException` (Lesson 24), a real, library-authored
example of exactly this pattern, appears next.

### Mechanical Walkthrough

- `class InvalidCategoryException : Exception` — **first appearance of
  a custom exception type.** Ordinary inheritance (Lesson 0a) — nothing
  exception-specific about the syntax itself.
- `: base($"'{attemptedCategory}' is not a recognized category.")` —
  reappearing shape (Lesson 0a's own `: base(startsOn)` constructor
  chaining) — forwards a real message string to `Exception`'s own
  constructor, so `ex.Message` still works normally even on the derived
  type.
- The `AttemptedCategory` property — **first appearance of a
  custom exception carrying its own data**, beyond the inherited
  `Message` every exception already has — set once, in the constructor,
  and read back later by the specific `catch` block that knows to
  expect it.
- Two `catch` blocks, most specific first — **first appearance of
  multiple `catch` blocks on one `try`.** Order matters: had
  `catch (Exception ex)` been written *first*, it would have caught
  everything, including the real `InvalidCategoryException`, and the
  second, more specific `catch` block would never run at all — checked
  directly as this unit's own Exercises ask you to confirm.

### CS Lens

`catch` resolution works by walking the `catch` blocks top to bottom
and running the first one whose type matches — the exact same "is a"
relationship Lesson 0a's inheritance already established.
`InvalidCategoryException` *is an* `Exception` (by inheritance), so
`catch (Exception ex)` would also have matched it — which is precisely
why the more specific `catch (InvalidCategoryException ex)` has to come
*first*: general before specific would mean the specific one never
gets a chance to run.

### SE Lens

`Microsoft.Data.Sqlite`'s own real `SqliteException` (Lesson 24) is
this exact pattern, written by that library's own authors: a class
inheriting from `Exception`, carrying its own extra data
(`ex.SqliteErrorCode`, read directly in Lesson 24's real code) beyond
the inherited `Message`. `catch (SqliteException ex)` in Lesson 24
works for the identical reason `catch (InvalidCategoryException ex)`
does here — a library author decided a SQLite-specific failure deserved
its own real, catchable type, the same decision this unit's own
`InvalidCategoryException` makes for one narrow, project-specific case.

### Connection

`SqliteException` was never written by this project — it came from
`Microsoft.Data.Sqlite` itself. Lesson 24's own `catch (SqliteException ex)`
is the first real place this project's own code relies on someone
else's custom exception type, now with the mechanism behind it fully
understood.

---

## Closing

### Connect the Pieces

The first unit proved, with real output, that a generic `Exception`
thrown for two different real problems is genuinely indistinguishable
to the code catching it — nothing beyond a message string separates
them. The second unit's real `InvalidCategoryException`, inheriting from
`Exception` and carrying its own `AttemptedCategory` property, fixed
that directly: two ordered `catch` blocks correctly routed each real
failure kind to its own handler, proven by real, distinct output for
each. `SqliteException` (Lesson 24) is the identical pattern, already
written for you by `Microsoft.Data.Sqlite`'s own authors.

### What Breaks Without This

Already demonstrated directly, on purpose, in this lesson's first unit:
catching plain `Exception` for two genuinely different failures leaves
the calling code with no real way to react differently to each, short
of fragile string-matching against `ex.Message`. As a second,
real check: in the working `ExceptionLab` version, swap the order of
the two `catch` blocks — `catch (Exception ex)` first,
`catch (InvalidCategoryException ex)` second — and rerun. Real,
representative failure: the `InvalidCategoryException`-specific
message never prints again, for *any* input, because the more general
`catch` above it now claims every exception first, real, since
`InvalidCategoryException` genuinely is an `Exception` too. Restore the
original order afterward.

### Exercises

- Complete the check described above yourself: swap the two `catch`
  blocks' order, confirm the real, broken output, and restore the
  original order.
- Add a second custom exception, `BlankCategoryException : Exception`,
  and convert the blank-category case in `Validate` to throw it instead
  of plain `Exception`. Add a third `catch` block for it, most specific
  first, and confirm, with real output, that all three real failure
  kinds now route correctly.
- Reread Lesson 24's real `catch (SqliteException ex)` block and, in
  your own words, explain what would change (or wouldn't) if it were
  written as `catch (Exception ex)` instead, given the code inside it
  reads `ex.SqliteErrorCode` specifically.

### Definition of Done

- [ ] You ran the generic-`Exception` lab yourself and confirmed, with
      real output, that both real failure kinds print an identical,
      indistinguishable "just Exception" message.
- [ ] You ran the `InvalidCategoryException` lab yourself and confirmed
      each real failure kind is routed to its own `catch` block, with
      real, structured data (`AttemptedCategory`) available in the
      specific one.
- [ ] You completed the catch-order-swap exercise and saw the real,
      broken behavior it causes.
- [ ] You can explain, in your own words and without re-reading this
      lesson, why more specific `catch` blocks must come before more
      general ones.
