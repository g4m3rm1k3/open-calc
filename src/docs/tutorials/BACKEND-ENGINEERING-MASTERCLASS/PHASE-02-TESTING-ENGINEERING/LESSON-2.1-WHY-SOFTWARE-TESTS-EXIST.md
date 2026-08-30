# Lesson 2.1: Why Software Tests Exist

*File paths under backend/... refer to the real manufacturing-platform repository. Paths under verification/... refer to that same repository's verification folder.*

**What you will build:** Five small, real, throwaway `assert`-based checks against a single tiny function - used to directly observe, one at a time, what correctness, regression, an executable specification, confidence, and refactoring safety actually mean in practice - and why this project's own real, already-existing "test" script for its Mastercam XML parser provides none of them today, before this curriculum starts writing real tests against the real backend.

**What you need to know first:** Defining and calling plain Python functions; reading a raised exception's traceback back to the line that raised it; list and dict literals, dict key access, and list slicing; generator expressions passed to an aggregating call like `sum`.

## Terms used in this lesson

- **correctness** — The property of a piece of code producing the output its author actually intended for a given input - not "ran without crashing" or "looks plausible," but matches a specific, statable expectation. It exists as a concept because "the code executed" and "the code did the right thing" are two entirely different claims, and a program can satisfy the first while completely failing the second.
- **regression** — A previously-working piece of behavior that quietly stops working because of a later, often unrelated-looking, change elsewhere in the code. It exists as a named failure mode because software rarely breaks all at once - it breaks one small, later edit at a time - and without something re-checking the old behavior every time, nobody notices until the broken version has already shipped.
- **executable specification** — A statement of what code is supposed to do, expressed in a form the computer itself runs and checks against the real implementation, rather than prose a human has to read and separately re-verify by eye. It exists because a prose description (a comment, a docstring) can silently drift out of sync with the code it describes, and nothing about running the code ever re-checks it - while a specification written as real code gets re-checked, automatically, every single time it runs. This does not mean an executable specification is automatically correct: the expected value written into it can itself be the wrong one, the same as a prose claim can. What it guarantees is narrower and still real - it cannot silently stop matching the code without saying so, the way a comment or docstring can.
- **confidence** — In the sense this lesson uses it, the concrete, checkable knowledge that a change did not break existing behavior - as opposed to a personal hope or guess based on reading code or output. It exists as a distinct idea because "I think this still works" and "something just verified this still works" are different states, and only the second one is a safe basis for deciding to ship a change.
- **refactoring safety** — The guarantee that restructuring code's internal shape (how it is written) without changing its external behavior (what it does) can actually be verified, not just assumed. It exists because a "refactor" that quietly changes behavior is not a refactor at all - it is an undetected bug - and only a check run both before and after the restructuring can tell the two apart.
- **assert statement** — Python's own built-in `assert <condition>, <message>` statement: it evaluates `<condition>`; if that is `True`, execution continues as though the line were not there; if it is `False`, Python raises `AssertionError` immediately, carrying `<message>`. It exists as the smallest possible way to write "I expect this to be true" in a form Python itself checks every time the line runs, rather than a comment a human has to re-verify by eye. It is a primitive language mechanism, not a testing framework - Python can be told to skip every `assert` in a program entirely (running it with the `-O` flag strips them out), which is exactly why real test suites are normally built on a dedicated framework instead of bare `assert` statements left in production code; this lesson uses bare `assert` deliberately, to teach the underlying idea before a framework is introduced.
- **generator expression** — A compact expression of the shape `EXPR for NAME in ITERABLE`, producing values one at a time, on demand, rather than building a whole list in memory up front. It exists so an aggregating call like `sum(...)` can consume items one at a time without a separate, fully-built intermediate list ever needing to exist.
- **list slicing** — The `sequence[start:stop]` syntax, returning a new, separate sequence containing the elements from index `start` up to (but not including) index `stop`; omitting either side means "from the beginning" or "through the end." It exists as a compact way to select a contiguous sub-range of a sequence without writing an explicit loop.
- **dictionary key access** — The `some_dict["key"]` syntax, which looks up and returns the value stored under the literal key `"key"`, raising `KeyError` if that exact key is not present. It exists as the direct, ordinary way to read one named field out of a dict, used throughout this lesson's own `op["minutes"]`.
- **f-string** — A string literal written as `f"...{expression}..."`, where anything inside `{}` is evaluated as real Python and inserted into the string at the point the f-string itself runs. It exists so a value does not have to be manually converted to text and concatenated by hand to appear inside a message.
- **docstring** — A string literal written as the very first statement inside a function's (or class's, or module's) body, conventionally describing what that function does; Python stores it on the function object itself but never executes or checks it against anything. It exists as a place to write human-readable documentation directly next to the code it documents - but, as this lesson's own executable-specification unit shows, being written does not make it true.
- **traceback** — The block of text Python prints when an exception propagates all the way up without being caught: which line raised it, which function called which function to get there, and the exception's own type and message. It exists so a failure is not just "the program stopped" - it is a specific, readable record of exactly where and why.
- **name rebinding** — What happens when a name - like a function's own name, `total_minutes` - is assigned to again: Python does not modify whatever the name previously pointed to; it simply makes the name point at the new object from that point in the code onward, and any later use of that name reaches the new object. It exists as a real mechanism (not just a phrase) because Python names are labels pointing at objects, not fixed slots holding one unchangeable value - writing `def total_minutes(ops):` a second time in the same scope produces a second, brand-new function object and re-points the name at it.

## Objects and methods used

- **`sum`**
  - *What it is:* A built-in Python function that adds together every item in an iterable and returns the total.
  - *Implementation:* `sum(iterable, start=0)`, defined among Python's builtins; iterates once over `iterable`, adding each item to a running total that begins at `start` (`0` by default), and returns that total once the iterable is exhausted.
  - *Its use:* This lesson uses it to compute one number, `total_minutes`, from the `"minutes"` field of a list of operation-like dicts, so that a bug, a fix, or a regression in that number has exactly one obvious place it happens.
  - *Type:* A builtin function - called as a bare name, `sum(...)`, never as a method on an object.
  - *Responsibility:* Reducing any iterable of numbers down to one running total, without the caller having to write the accumulation loop by hand.
  - *Depends on:* An iterable whose items support `+` with `start`'s own type - here, plain `int`s produced by `op["minutes"]`, added to the default `start=0`.
  - *Connects to:* Called directly by `total_minutes` in this lesson's generator-based versions; receives a generator expression as its sole argument and consumes it lazily, one `op["minutes"]` value at a time, never holding the whole sequence of values at once.
  - *Shape:* Takes any iterable of numbers in, returns a single plain number out - never a list, never `None` (an empty iterable with the default `start=0` returns `0`, not an error).

- **`AssertionError`**
  - *What it is:* A built-in exception class that Python raises automatically when an `assert` statement's condition evaluates to `False`.
  - *Implementation:* A subclass of Python's built-in `Exception`, defined inside the interpreter itself; carries whatever optional message string was written after the comma in the `assert` statement that raised it.
  - *Its use:* Every lab in this lesson relies on `AssertionError` being the concrete, visible signal that a stated expectation did not hold - it is what turns a silently-wrong number into a loud, unmissable failure with a real traceback.
  - *Type:* A builtin exception class - an object the interpreter instantiates automatically when an `assert` fails, never constructed by hand in this lesson's own code.
  - *Responsibility:* Representing, as a real Python object carrying a traceback, the specific fact that some `assert`ed condition was false at a specific line.
  - *Depends on:* An `assert` statement whose condition evaluated to `False`; optionally, the message string written after the comma becomes this exception's own stored arguments.
  - *Connects to:* Raised by the Python interpreter itself at the exact point an `assert`'s condition fails; propagates upward exactly like any other exception, printing a traceback and stopping the script whenever nothing catches it - as every failing lab in this lesson demonstrates.
  - *Shape:* A single exception object carrying one optional message string; never a return value - its presence or absence is itself the signal a caller reacts to.

- **`test_parser`**
  - *What it is:* A real, already-existing function in this project's own backend, named as though it tests the Mastercam XML parser.
  - *Implementation:* `def test_parser():` - takes no arguments, loops over two real sample XML files, calls `parse_mastercam_xml` on each, and calls `print()` repeatedly to show the parsed metadata, sequences, and tool assemblies in the terminal.
  - *Its use:* This lesson uses it as real, existing evidence for what "testing" currently means in this codebase - it is read and cited, never called or modified by this lesson's own code.
  - *Type:* A standalone module-level function, not a method on any class, defined at `backend/test_xml_parser.py:16`.
  - *Responsibility:* As written, its real responsibility is only to print information for a human to read - nothing in its own body compares any printed value against an expected one.
  - *Depends on:* The real sample XML files under `sample-data/`, and the real `parse_mastercam_xml` function it imports and calls.
  - *Connects to:* Called only from this file's own `if __name__ == '__main__':` guard; it calls `parse_mastercam_xml` and, on a successful parse, writes the parsed result out to a JSON file for later inspection.
  - *Shape:* Its real, declared shape returns nothing (`None`, implicitly) and contains no `assert` anywhere across its 67 real lines - every line that reports information does so through `print()`.

## Concept Unit: Correctness - What "Right" Even Means

### The Problem

`backend/test_xml_parser.py` calls itself a test script for this project's Mastercam XML parser. Its own `test_parser` function, read in full this session, prints the parser's output - file names, tool counts, operation times - for a human sitting at a terminal to look at. Nowhere in that function, or anywhere else in this project, is there a single line stating what the *correct* parsed result for either sample file actually is. If the parser started returning a slightly wrong number tomorrow, what in this project would notice?

Before reading on:

- The lab below prints `total_minutes(ops) = 6` for `ops = [{"minutes": 4}, {"minutes": 6}]`. Before reading further: is `6` the right answer? What would you actually need, beyond that printed line, to answer that question at all?
- If you had to teach a computer - not a person reading a terminal - how to decide whether `6` is right or wrong, what is the smallest true-or-false statement you would write down?
- `backend/test_xml_parser.py`'s own `test_parser` function prints results the exact same way. What happens inside that file if the real parser it calls starts returning a slightly wrong number next month?

### Project Change

- **Reference Source:** No reference counterpart for this unit's own throwaway code. Real specimen motivating this unit: `backend/test_xml_parser.py:16-82` (`test_parser`), read in full this session. Its own docstring at line 17 reads `"""Test parser with sample files."""`; nowhere in its 67 lines does it state what a correct parse actually looks like beyond whatever gets printed.
- **Files affected:** None
- **Change type:** none
- **Location:** N/A - a new, standalone throwaway script; no existing project structure to place it within.
- **Dependencies:** None beyond Python 3 itself - no imports from the project.

### The New Code

The smallest possible version of this problem: one function, one expected total, one implementation that has a real bug in it.

**File:** `verification/phase-02/lab_correctness.py` (new)

```python
def total_minutes(ops):
    return sum(op["minutes"] for op in ops[1:])  # bug: skips the first operation


ops = [{"minutes": 4}, {"minutes": 6}]
print(f"total_minutes(ops) = {total_minutes(ops)}")

assert total_minutes(ops) == 10, "expected 10 total minutes"
```

### Mechanical Walkthrough

- `def total_minutes(ops):` — Defines a plain function named `total_minutes`, taking one parameter, `ops`, meant to stand for a list of operation-like dicts. The `def` statement does not run the body at all - it only creates a function object and binds the name `total_minutes` to it in the current scope, ready to be called later.
- `ops[1:]` — A list slice. `ops[1:]` builds a brand-new list containing every element of `ops` from index `1` onward, dropping index `0` entirely - it does not modify `ops` itself. This is the actual bug: the intent was to sum every operation's minutes, but this slice silently throws away the first operation before the sum ever sees it.
- `op["minutes"] for op in ops[1:]` — A generator expression. For each `op` produced by iterating over the sliced list, it evaluates `op["minutes"]` and yields that one value, on demand, without ever building a separate list of those values in memory first.
- `op["minutes"]` — A dictionary key access. Each `op` is a dict like `{"minutes": 6}`; this reads the value stored under the literal string key `"minutes"`. If a dict in `ops` were missing that key, this would raise `KeyError` instead of silently returning anything - there is no default here.
- `sum(...)` — Calls the built-in `sum` on the generator expression, consuming every value it yields and adding them together, starting from `sum`'s own default `start` of `0`. Because the generator already dropped the first operation's minutes, `sum` genuinely has no way to know that - it only ever sees what the generator hands it.
- `return` — Ends `total_minutes` and hands the value `sum(...)` computed back to whatever called the function - here, `6`, not the `10` a reader would expect from two operations of `4` and `6` minutes.
- `ops = [{"minutes": 4}, {"minutes": 6}]` — Builds a real list containing two real dicts, each with one key, `"minutes"`, and assigns it to the name `ops` at module scope - the concrete input every version of `total_minutes` in this lesson gets called with.
- `print(f"total_minutes(ops) = {total_minutes(ops)}")` — An f-string that calls `total_minutes(ops)` once and embeds the returned value directly into the printed message. This line is exactly the same shape as `backend/test_xml_parser.py`'s own prints - a computed value shown to a human, with nothing here saying whether `6` is the right answer.
- `assert total_minutes(ops) == 10, "expected 10 total minutes"` — An `assert` statement. It calls `total_minutes(ops)` a second time (a fresh call, not reusing the printed value above), compares the result to `10` with `==`, and, because `6 == 10` is `False`, raises `AssertionError("expected 10 total minutes")` immediately - exactly the real traceback shown in this unit's own saved verification output below.

### Execution Trace

```
slice: ops[1:] -> [{"minutes": 6}]  (index 0, {"minutes": 4}, dropped by the slice)
generator: yields op["minutes"] for the one remaining op -> yields 6
sum(...): running total starts at 0 (sum's own default start), adds the single yielded value -> 0 + 6 = 6
```

### CS Lens

This is the gap between an **implementation** and a **specification**: code that runs is only an implementation; correctness is always relative to some separately-stated specification of what the output should be. Also recognized in: a compiler's type checker (checking code against declared types, a partial specification); a database's own `CHECK` constraint (rejecting a row that violates a stated rule); contract-based programming's preconditions and postconditions; and, in this project's own domain, a machine's first-article proveout - the real database schema this project already has includes a `status` field, on a machine/CAM-file pairing, defaulting to `'untested'` (`machine_cam_pairings`, read this session), precisely because "the program ran" and "this pairing is actually proven correct on this machine" are recognized as two separate questions on the shop floor, too.

### SE Lens

The design principle at stake is stating a definition of correctness explicitly, in a checkable form, instead of leaving it implicit in whoever happens to be reading the output. The real alternative already in use in this project is exactly what `backend/test_xml_parser.py`'s `test_parser` does: print everything and let a human decide whether it looks right. That alternative is cheap to write - no expected value ever has to be pinned down - but it does not scale (every future run needs a human's attention again), is inconsistent between different readers, and can regress silently, because nothing about it changes when the underlying numbers do. Writing a real `assert` instead costs real, honest work up front: someone has to decide, and write down, what the *actual* correct total is - work this project has never done for its own parser.

### Commands needed

- `python verification/phase-02/lab_correctness.py` — Runs the lab script directly from the manufacturing-platform repository root. No flags are needed - the script has no project imports, only the standard library's own `sum` and the `assert` statement.

### Verification

```text
total_minutes(ops) = 6
Traceback (most recent call last):
  File "C:\Users\g4m3r\Documents\manufacturing-platform\verification\phase-02\lab_correctness.py", line 8, in <module>
    assert total_minutes(ops) == 10, "expected 10 total minutes"
           ^^^^^^^^^^^^^^^^^^^^^^^^
AssertionError: expected 10 total minutes
```

Full saved run: `verification/phase-02/lab_correctness_output.txt`.

### Connection to the previous unit

This is the lesson's first unit - it establishes the running example, `total_minutes(ops)`, and the gap between "printed" and "correct" that every later unit in this lesson builds on.

## Concept Unit: Regression - When Working Code Quietly Breaks

### The Problem

Suppose `total_minutes` gets fixed and is passing today. Months from now, someone edits it again for a completely different, plausible-sounding reason - unrelated, in their mind, to the case that already worked. Nothing in this project as it exists right now would notice if that edit also broke the case that used to pass. `backend/test_xml_parser.py`'s own approach - print everything, let a human judge it - has no memory of what "used to be right" even means.

Before reading on:

- Given what an `assert` statement already does, would the exact same `assert total_minutes(ops) == 10` line, left in place and re-run later, catch a completely different bug introduced by a future, unrelated edit - or only the specific bug it was originally written against?
- If the previous unit's `assert` had been deleted right after it passed once, what would be left in this project to notice a later change breaking the same case again?

### Project Change

- **Reference Source:** No reference counterpart for this unit's own throwaway code. Same real specimen as the previous unit: `backend/test_xml_parser.py:16-82`, read in full this session. Nothing in that function connects a change to `app/services/mastercam_xml_parser.py` to this file being re-run automatically at all - there is no mechanism in this project linking the two.
- **Files affected:** None
- **Change type:** none
- **Location:** N/A - a new, standalone throwaway script; no existing project structure to place it within.
- **Dependencies:** None beyond Python 3 itself - no imports from the project.

### The New Code

Starting from the fixed version of `total_minutes`, then editing it again for a reason that has nothing to do with the case that already passed:

**File:** `verification/phase-02/lab_regression.py` (new)

```python
def total_minutes(ops):
    return sum(op["minutes"] for op in ops)


ops = [{"minutes": 4}, {"minutes": 6}]
assert total_minutes(ops) == 10
print("before the change: assert passed, total_minutes(ops) == 10")


# Someone later edits total_minutes for an unrelated-sounding reason:
# skip any operation under 5 minutes, treating it as noise not worth
# counting.
def total_minutes(ops):
    return sum(op["minutes"] for op in ops if op["minutes"] >= 5)


print(f"after the change: total_minutes(ops) = {total_minutes(ops)}")
assert total_minutes(ops) == 10, "regression: total_minutes(ops) no longer == 10"
```

### Mechanical Walkthrough

- `def total_minutes(ops): return sum(op["minutes"] for op in ops)` — The corrected version of `total_minutes` from the previous unit's bug, now summing every operation with no slice dropping anything; this `def` binds the name `total_minutes` to this first function object.
- `ops = [{"minutes": 4}, {"minutes": 6}]` — The same two-operation list as the previous unit, reused unchanged as this unit's fixed input, so any difference in outcome traces back to the code, not the data.
- `assert total_minutes(ops) == 10` — Calls the current `total_minutes` (still the first version), gets `10`, and the condition is `True`, so nothing happens. This `assert` carries no message argument - it still works exactly the same way on success; it would only matter if it ever failed, in which case it would raise a bare `AssertionError` with no text.
- `print("before the change: assert passed, ...")` — Only reached because the assert above did not raise; a plain string, not an f-string, since nothing here needs to be computed.
- `if op["minutes"] >= 5` — A conditional filter added inside the second `def`'s generator expression: only operations whose `"minutes"` value is `5` or greater get included in the sum at all; `>=` is a comparison operator, evaluated once per `op`.
- `def total_minutes(ops): return sum(op["minutes"] for op in ops if op["minutes"] >= 5)` — A brand-new function object, created by a second `def` using the identical name `total_minutes`. Per name rebinding, the module-level name `total_minutes` now points at this second function instead of the first; the first function object still exists in memory, but nothing refers to it anymore.
- `total_minutes(ops) inside the "after the change" f-string` — Calls whatever `total_minutes` currently names, which after the second `def` is the filtered version. The `4`-minute operation fails the `>= 5` filter and gets dropped, so this call returns `6`.
- `assert total_minutes(ops) == 10, "regression: ..."` — Calls the rebound name a second time, compares `6 == 10`, gets `False`, and raises `AssertionError("regression: total_minutes(ops) no longer == 10")` - the identical assert *expression* as the earlier one in this same file, unedited, now catching a completely different bug than the one from the previous unit.

### Execution Trace

1. `def total_minutes(ops): return sum(op["minutes"] for op in ops)` - defines the first version and binds the name `total_minutes` to it.
2. `assert total_minutes(ops) == 10` - calls the name, which still points at the first version; returns `10`; condition `True`; nothing happens.
3. `print("before the change: ...")` - only reached because the previous step's assert did not raise, confirming the first version really did pass.
4. `def total_minutes(ops): return sum(op["minutes"] for op in ops if op["minutes"] >= 5)` - a second, brand-new function object is created, and the name `total_minutes` is rebound to point at it; the first version's object still exists but is no longer reachable by name.
5. `total_minutes(ops)` inside the f-string - calls whatever `total_minutes` currently points to, which is now the second version; returns `6`, since the `4`-minute operation fails the `>= 5` filter.
6. `assert total_minutes(ops) == 10, "regression: ..."` - calls the same rebound name again; `6 == 10` is `False`; Python raises `AssertionError("regression: total_minutes(ops) no longer == 10")`, which is the exact traceback this unit's saved verification output shows.

### CS Lens

This is **regression testing**: re-running an old, already-passing check against new code to confirm old behavior survived. Also recognized in: `git bisect`, which finds exactly which commit broke a previously-working case by re-running the same check across a range of commits; a continuous-integration pipeline blocking a merge because a previously-green check turned red; a web browser engine's own regression suite, re-run on every change to catch a previously-fixed bug quietly coming back; and, in this project's own domain, a First Article Inspection being re-run after a process change, specifically to catch a part that used to pass inspection quietly failing to anymore.

### SE Lens

The design principle is treating a passing check as a permanent asset that keeps earning its value on every future change, not a one-time box ticked off and forgotten. The real alternative already in use in this project is relying on someone downstream - a CAM programmer, a machine operator - to notice a wrong number after the fact. The honest cost of that alternative: by the time a human notices, the broken version has already shipped, and tracing the wrong number back to the specific edit that caused it takes far longer than an `assert` failing immediately, at the exact line, the moment it happens. The honest cost on the other side: keeping the `assert` around forever only pays off if it keeps getting re-run - a check nobody ever runs again provides exactly the same protection as no check at all.

### Commands needed

- `python verification/phase-02/lab_regression.py` — Runs the lab script from the repository root; no flags needed.

### Verification

```text
before the change: assert passed, total_minutes(ops) == 10
after the change: total_minutes(ops) = 6
Traceback (most recent call last):
  File "C:\Users\g4m3r\Documents\manufacturing-platform\verification\phase-02\lab_regression.py", line 18, in <module>
    assert total_minutes(ops) == 10, "regression: total_minutes(ops) no longer == 10"
           ^^^^^^^^^^^^^^^^^^^^^^^^
AssertionError: regression: total_minutes(ops) no longer == 10
```

Full saved run: `verification/phase-02/lab_regression_output.txt`.

### Connection to the previous unit

The previous unit wrote down what "correct" meant for `total_minutes`; this unit shows that the exact same written-down check, left in place, is what catches the correct version quietly breaking later - correctness stated once has to survive change, or it was never worth much.

## Concept Unit: Executable Specifications - A Claim the Machine Checks

### The Problem

`backend/test_xml_parser.py:17`'s own docstring on `test_parser` says, in English, that this is a test of the parser. Nothing about that sentence being true or false is ever checked by running the file - a human has to read it and decide whether to believe it. Is there an actual difference between writing a claim about correct behavior in a comment, and writing that same claim as code?

Before reading on:

- The docstring on `total_minutes` below says `"Returns total minutes across ops."` If the function's actual code stops matching that sentence, what happens? Who or what finds out, and when?
- What is actually different between writing `# should equal 10` as a comment above a line of code, versus writing `assert ... == 10` as a real statement? Both say the same thing in English - do they *do* the same thing?

### Project Change

- **Reference Source:** No reference counterpart for this unit's own throwaway code. Same real specimen: `backend/test_xml_parser.py:17`'s own docstring, quoted verbatim, read this session: `"""Test parser with sample files."""` - a prose claim that nothing in the rest of the function ever checks against what actually happens when it runs.
- **Files affected:** None
- **Change type:** none
- **Location:** N/A - a new, standalone throwaway script; no existing project structure to place it within.
- **Dependencies:** None beyond Python 3 itself - no imports from the project.

### The New Code

The same broken, filtered `total_minutes` from the previous unit, deliberately left broken, now with a docstring claiming something its own code no longer does:

**File:** `verification/phase-02/lab_executable_spec.py` (new)

```python
def total_minutes(ops):
    """Returns total minutes across ops."""  # a prose claim - nothing checks it
    return sum(op["minutes"] for op in ops if op["minutes"] >= 5)  # doesn't match its own docstring


ops = [{"minutes": 4}, {"minutes": 6}]
print("docstring claims: 'Returns total minutes across ops'")
print(f"total_minutes(ops) = {total_minutes(ops)}")

# The docstring never runs and never complained that the code beneath
# it stopped matching what it says. The identical claim, written as
# code instead of prose, does:
assert total_minutes(ops) == sum(op["minutes"] for op in ops), \
    "total_minutes should return total minutes across ALL ops"
```

### Mechanical Walkthrough

- `"""Returns total minutes across ops."""` — A docstring: a string literal written as the first statement in the function body. Python stores it on the function object itself (readable later as `total_minutes.__doc__`) but never evaluates it as a claim to check against anything - it is inert text, exactly as true or false as whoever wrote it left it.
- `return sum(op["minutes"] for op in ops if op["minutes"] >= 5)` — The exact `>=5`-filtering body kept from the regression unit, deliberately left broken here, specifically so its docstring's claim ("across ops," meaning all of them) and its real behavior (across only some of them) now visibly disagree.
- `print("docstring claims: 'Returns total minutes across ops'")` — Prints the docstring's own English claim as a plain string, so a reader can compare it directly against the very next line's real printed number.
- `print(f"total_minutes(ops) = {total_minutes(ops)}")` — The same f-string pattern as the earlier units; prints `6`, directly contradicting the docstring's "across ops" claim for this `ops` value, and nothing about running this line signals that contradiction to anyone.
- `assert total_minutes(ops) == sum(op["minutes"] for op in ops), "..."` — Writes the exact same claim the docstring makes ("total minutes across ops," with no filter), but as a real comparison: it calls `total_minutes(ops)` (`6`, using the broken, filtered version) and separately computes the unfiltered `sum(op["minutes"] for op in ops)` fresh, right here (`10`), as the value `total_minutes` was supposed to equal. Because `6 != 10`, this raises `AssertionError` immediately, the moment this line runs - which the docstring, sitting one function above, has been silently failing to do the entire time.
- `\ (line continuation)` — The backslash at the end of the `assert` line lets the statement's message argument continue onto the next source line without splitting the statement in two; Python treats the two physical lines as one logical statement.

### CS Lens

This is an **executable specification**: a claim about behavior that is itself run and checked, as opposed to a claim only documented. Also recognized in: Python's own `doctest` module, which literally executes example code written inside a docstring and compares it against the output also written there; an OpenAPI or JSON Schema definition, validated against real request and response bodies at runtime; a database's declared column constraints, enforced on every insert, not just described in a wiki page; a static type checker validating type hints against real code; and, in this project's own domain, a real G-code program itself, which is an executable specification of a toolpath - a machine control does not "read about" the path, it runs the exact statement of it.

### SE Lens

The design principle is a single, checked source of truth over separately-maintained prose documentation. The real alternative already in use in this project is exactly `test_xml_parser.py:17`'s own docstring - a plain-English description, sitting right next to code that is completely free to drift away from it with no warning. The honest cost of choosing prose: it is cheap to write and reads naturally, but nothing enforces that it stays true past the moment it was written. The honest cost of choosing an `assert` instead: writing a real, checkable claim requires actually deciding on and hard-coding a specific expected value - real work a vague sentence like "returns total minutes" never demanded - and a badly-chosen `assert` can itself be wrong, which is its own real problem this project has not had to face yet, because it has never written one for this parser.

### Commands needed

- `python verification/phase-02/lab_executable_spec.py` — Runs the lab script from the repository root; no flags needed.

### Verification

```text
docstring claims: 'Returns total minutes across ops'
total_minutes(ops) = 6
Traceback (most recent call last):
  File "C:\Users\g4m3r\Documents\manufacturing-platform\verification\phase-02\lab_executable_spec.py", line 13, in <module>
    assert total_minutes(ops) == sum(op["minutes"] for op in ops), \
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
AssertionError: total_minutes should return total minutes across ALL ops
```

Full saved run: `verification/phase-02/lab_executable_spec_output.txt`.

### Connection to the previous unit

The previous unit showed the same `assert` catching a regression; this unit shows what makes that possible at all - the claim is written in a form the computer runs, unlike the docstring sitting right above it, which makes the exact same claim and catches nothing.

## Concept Unit: Confidence - Knowing Instead of Hoping

### The Problem

`backend/test_xml_parser.py:16-82` runs, prints roughly a page of nested output for two real sample files, and stops. If it ran right now, how would anyone actually decide whether everything it printed was correct? Reading is not the same as knowing.

Before reading on:

- If you ran `backend/test_xml_parser.py` right now, how would you actually decide, from what it prints, whether everything is correct?
- Compare that to a single line that either prints `OK` or raises `AssertionError`. Which one actually answers the question "did I break anything?" - and which one just gives you more reading to do?

### Project Change

- **Reference Source:** No reference counterpart for this unit's own throwaway code. Same real specimen: `backend/test_xml_parser.py:30-70`, read in full this session - the loop body that prints metadata, sequences, and tool assemblies for two real sample files. Its only acknowledgment that something could go wrong is the generic `except Exception as e:` block at lines 79-82, which reports that a failure happened, never whether a successful run's numbers were the right ones.
- **Files affected:** None
- **Change type:** none
- **Location:** N/A - a new, standalone throwaway script; no existing project structure to place it within.
- **Dependencies:** None beyond Python 3 itself - no imports from the project.

### The New Code

The same correct `total_minutes` from the correctness unit, checked two different ways side by side - by eye, and by `assert`:

**File:** `verification/phase-02/lab_confidence.py` (new)

```python
def total_minutes(ops):
    return sum(op["minutes"] for op in ops)


ops = [{"minutes": 4}, {"minutes": 6}]

# Eyeball approach - same shape as backend/test_xml_parser.py: print
# everything, let a human decide whether it looks right.
print("=== eyeball check ===")
print(f"op 1: {ops[0]['minutes']} minutes")
print(f"op 2: {ops[1]['minutes']} minutes")
print(f"total_minutes(ops) = {total_minutes(ops)}")
print("does that look right? (nothing here answers that)")

# Checked approach - one boolean question, answered by the computer,
# not the reader.
print()
print("=== checked approach ===")
assert total_minutes(ops) == 10
print("OK - total_minutes(ops) == 10")
```

### Mechanical Walkthrough

- `def total_minutes(ops): return sum(op["minutes"] for op in ops)` — The correct, unbroken version again, used deliberately here so this unit's point is not "is this function right" (already settled by the correctness unit) but "how would a reader know it is right, using only what is printed."
- `ops[0]['minutes']` — Indexes the list `ops` by integer position `0` to get the first dict, then reads its `"minutes"` key - the same dict-key-access construct as before, chained onto a fresh list index.
- `print(f"op 1: {ops[0]['minutes']} minutes")` — An f-string print manually restating one operation's raw input value - exactly the same shape as `backend/test_xml_parser.py`'s own per-item prints, such as its `print(f"  - {nc_file['ncFile']}")` line.
- `print(f"total_minutes(ops) = {total_minutes(ops)}")` — Prints the computed total, `10`, the same way the earlier units did.
- `print("does that look right? (nothing here answers that)")` — A literal rhetorical question left genuinely unanswered by the code; nothing in this whole "eyeball check" section computes an expected value or compares anything - the section's job ends the moment it finishes printing.
- `print() with no arguments` — Prints a single blank line, used purely to visually separate the two sections in the terminal output, with no other effect on the program.
- `assert total_minutes(ops) == 10` — The same assert-statement construct explained in the correctness unit, here doing a different job: not introducing the concept, but standing in direct contrast to the five print statements above it - one line, evaluated by Python itself, versus several lines a human has to read and personally judge.
- `print("OK - total_minutes(ops) == 10")` — Only reached if the assert above did not raise; this single line is the entire "checked approach" section's output, versus the five lines the "eyeball check" section needed in order to say nothing conclusive at all.

### CS Lens

This is a **feedback loop**: how quickly, and how definitively, a system tells you whether something is wrong. Also recognized in: a compiler rejecting a type error before the program ever runs, instead of the error surfacing as a crash later; a spell-checker's red underline versus proofreading an entire document by hand; a continuous-integration status badge turning red the moment a check fails, instead of someone reading a log file; and, in this project's own domain, a pre-shift smoke test on a CNC machine giving a single go/no-go answer, instead of an operator having to infer machine health from watching an entire run.

### SE Lens

The design principle is optimizing for how fast and how certainly a person finds out something broke - a "shift-left" idea, catching problems as early and as cheaply as possible. The real alternative already in use in this project is `test_xml_parser.py`'s own approach: run a script by hand, then read its output. The honest cost of that alternative is that it does not scale with output size or with how often it needs to run, and different readers can reasonably disagree about whether something "looks right." The honest cost on the other side: an automated check like `assert` is only as good as the equality it actually states - it can give false confidence just as easily as a hasty eyeball check can, if the expected value written into it was itself wrong.

### Commands needed

- `python verification/phase-02/lab_confidence.py` — Runs the lab script from the repository root; no flags needed.

### Verification

```text
=== eyeball check ===
op 1: 4 minutes
op 2: 6 minutes
total_minutes(ops) = 10
does that look right? (nothing here answers that)

=== checked approach ===
OK - total_minutes(ops) == 10
```

Full saved run: `verification/phase-02/lab_confidence_output.txt`.

### Connection to the previous unit

The previous unit showed that an `assert` is a claim the machine checks; this unit shows the direct, practical payoff of that - what it actually feels like, as the person running the code, to get a checked answer instead of a pile of numbers to personally judge.

## Concept Unit: Refactoring Safety - Restructuring Without Guessing

### The Problem

This curriculum's own stated method is to characterize an existing implementation with a real test first, then build a better version that passes that same test. Given everything shown so far in this lesson, why does the test have to come first - why not restructure the code first and check the result afterward?

Before reading on:

- If you rewrote `total_minutes`'s internals - same inputs, same outputs, different code - without re-running anything, how would you actually know your rewrite did not quietly change what it returns?
- Given this lesson's own regression unit, what is the real difference between "a change that was meant to add a new behavior" and "a change that was meant to restructure the code without changing behavior at all," from the point of view of an `assert` that only checks the final result?

### Project Change

- **Reference Source:** No reference counterpart for this unit's own throwaway code. Same real specimen as the rest of this lesson: `backend/test_xml_parser.py:16-82`, read in full this session. This project's own stated curriculum method is to characterize an existing implementation with a real test, then build a better version that passes that same test - `test_parser`, having no real test inside it at all, is not yet in a state that method could even start from.
- **Files affected:** None
- **Change type:** none
- **Location:** N/A - a new, standalone throwaway script; no existing project structure to place it within.
- **Dependencies:** None beyond Python 3 itself - no imports from the project.

### The New Code

The same `assert`, re-run three times against the same `ops`, across three different implementations of `total_minutes` - one baseline, one genuine refactor, and one that only looks safe:

**File:** `verification/phase-02/lab_refactor_safety.py` (new)

```python
def total_minutes(ops):
    return sum(op["minutes"] for op in ops)


ops = [{"minutes": 4}, {"minutes": 6}]
assert total_minutes(ops) == 10
print("before refactor: assert passed, total_minutes(ops) == 10")


# Refactor 1: same behavior, different internal shape (explicit loop
# instead of sum() over a generator expression) - a real restructuring,
# not a rewrite of what it does.
def total_minutes(ops):
    total = 0
    for op in ops:
        total += op["minutes"]
    return total


assert total_minutes(ops) == 10
print("after safe refactor: assert still passed, total_minutes(ops) == 10")


# Refactor 2: looks like a similarly small, safe-looking change, but
# actually changes behavior - drops the last operation.
def total_minutes(ops):
    total = 0
    for op in ops[:-1]:
        total += op["minutes"]
    return total


print(f"total_minutes(ops) = {total_minutes(ops)}")
assert total_minutes(ops) == 10, "refactor silently changed behavior"
```

### Mechanical Walkthrough

- `def total_minutes(ops): return sum(op["minutes"] for op in ops)` — The original, already-correct baseline this unit starts from, identical in behavior to the fixed version used in the earlier units.
- `assert total_minutes(ops) == 10 / print("before refactor: ...")` — Establishes that the baseline genuinely passes before any restructuring begins - the same before-confirmation pattern used in the regression unit.
- `total = 0` — A plain variable assignment, initializing an accumulator to the integer `0` - standing in for what `sum`'s own hidden `start=0` was doing implicitly in the generator-based version.
- `for op in ops:` — An ordinary `for` loop over the full `ops` list, with no slice this time, binding `op` to each dict in turn.
- `total += op["minutes"]` — An augmented-assignment operator, `+=`, equivalent to `total = total + op["minutes"]`: reads this `op`'s `"minutes"` value and adds it into the running `total`.
- `return total (second def)` — Hands back the accumulated value once the loop finishes; the second `def total_minutes` rebinds the name again - the same name-rebinding mechanism from the regression unit, here used to model a genuine, behavior-preserving refactor instead of a bug.
- `assert total_minutes(ops) == 10 (second occurrence) / print("after safe refactor: ...")` — The exact same assert expression, unedited, re-run against the exact same `ops`, now calling the explicit-loop version; it still passes, which is the concrete proof this restructuring did not change what the function returns.
- `ops[:-1]` — A list slice with an omitted start (meaning "from the beginning") and a negative stop index `-1` (meaning "up to, but not including, the last element"), returning a new list with the final operation silently dropped.
- `for op in ops[:-1]: (third def)` — The same loop shape as the "safe" refactor, but now iterating over the sliced list instead of the full one - the accumulation logic itself (`total = 0`, `+=`, `return total`) is unchanged, which is exactly why this looks like a similarly small, safe edit.
- `print(f"total_minutes(ops) = {total_minutes(ops)}") / assert total_minutes(ops) == 10, "refactor silently changed behavior"` — Calls the third, now-rebound version, gets `4` instead of `10`, and the same unedited assert expression this unit has been re-running the whole time catches it immediately - proof this particular "refactor" was never actually safe.

### Execution Trace

1. `def total_minutes(ops): return sum(op["minutes"] for op in ops)` - the baseline; `assert ... == 10` passes, confirming it before anything is restructured.
2. `def total_minutes(ops): total = 0; for op in ops: total += op["minutes"]; return total` - a genuine refactor: different internal shape, same external behavior; rebinds the name `total_minutes` to this new function object.
3. `assert total_minutes(ops) == 10` (re-run, unedited) - calls the refactored version against the same `ops`; still passes, which is the actual proof the refactor was safe.
4. `def total_minutes(ops): total = 0; for op in ops[:-1]: total += op["minutes"]; return total` - a second edit that looks the same shape as the first, but silently drops the last operation; rebinds the name again.
5. `assert total_minutes(ops) == 10, "refactor silently changed behavior"` (re-run, still unedited) - calls the third version against the same `ops`; returns `4` instead of `10`; the condition is `False`, so Python raises `AssertionError`, catching a change that "looked" just as safe as the previous one.

### CS Lens

This is **refactoring**: restructuring a program's internal structure without changing its observable behavior - a change to how, never to what. Also recognized in: a database migration that changes a schema's internal representation while preserving every query's results; an API's internal implementation being rewritten while its versioned external contract stays identical; a compiler optimization pass that must, by definition, preserve a program's exact semantics while changing the instructions it produces; and a manufacturing retrofit that changes a machine's internal tooling or control hardware while its certified working envelope must stay provably the same.

### SE Lens

The design principle is this curriculum's own stated method: test the existing behavior first, then rebuild, so the rebuild can be checked against the exact same standard the original had to meet. The real alternative not chosen is restructuring first and checking afterward, by inspection - exactly the temptation this lesson's own second "refactor" shows failing: a change that *looked* just as small and safe as the first one, caught only because a check that already existed, unedited, was still there to catch it. The honest cost of testing first: it is real, extra work done before any visible improvement exists yet. The honest cost on the other side, stated plainly: a passing `assert` only proves behavior stayed the same for the exact inputs it actually checks - `ops` here, and nothing else - so it is real protection, not a complete guarantee against every possible behavior change.

### Commands needed

- `python verification/phase-02/lab_refactor_safety.py` — Runs the lab script from the repository root; no flags needed.

### Verification

```text
before refactor: assert passed, total_minutes(ops) == 10
after safe refactor: assert still passed, total_minutes(ops) == 10
total_minutes(ops) = 4
Traceback (most recent call last):
  File "C:\Users\g4m3r\Documents\manufacturing-platform\verification\phase-02\lab_refactor_safety.py", line 34, in <module>
    assert total_minutes(ops) == 10, "refactor silently changed behavior"
           ^^^^^^^^^^^^^^^^^^^^^^^^
AssertionError: refactor silently changed behavior
```

Full saved run: `verification/phase-02/lab_refactor_safety_output.txt`.

### Connection to the previous unit

The previous unit showed what it feels like to get a checked answer instead of an eyeballed one; this unit shows why that matters most exactly when code is being restructured - a "safe-looking" change is exactly where an eyeball check is weakest and a real `assert` is strongest.

## Connect the pieces

Follow `total_minutes(ops)`, for `ops = [{"minutes": 4}, {"minutes": 6}]`, expected total `10`, through every unit in this lesson. First it has no defined right answer at all - a buggy slice quietly returns `6`, and only a written-down `assert total_minutes(ops) == 10` reveals that `6` was wrong (correctness). Once fixed and passing, a later, unrelated-looking edit reintroduces the same wrongness, and the exact same, unedited `assert` catches it a second time (regression). The whole time, a docstring sitting right above the code claims "total minutes across ops" - true or false, it never once checks itself; only the `assert`, stating the identical claim as real code, ever does (executable specification). Reading printed numbers alone never answers whether `10` (or `6`) is right; the same `assert` answers it in one line - `OK`, or a traceback - instead of asking a human to decide (confidence). And restructuring the correct implementation from a generator expression to an explicit loop leaves that same `assert` green, proving the restructuring was safe; a different restructuring that drops the last operation turns the same `assert` red on the same `ops`, proving it was not - and the `assert` is what tells the two apart (refactoring safety). Every single one of these five ideas is a different answer to the same question this lesson opened with: what does `backend/test_xml_parser.py`'s own real, already-existing "test" script actually prove today? The honest answer, after this lesson, is: none of them.

**Next lesson:** Next, this same vocabulary - what a test actually checks, and how confidently it checks it - gets sorted into a precise taxonomy: unit tests, integration tests, and system tests, each answering a different question about correctness at a different scope, so "write a test" stops being one vague instruction and starts meaning a specific, deliberate choice.