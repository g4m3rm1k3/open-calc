# Lesson 15: Turning Fourteen Lessons of `curl` Into a Test Suite

**What you will build:** a minimal, hand-rolled test harness (`TestRunner` — no external
library, for the same reason Lesson 1 chose raw sockets over a library: nothing to fetch
without network access, and a real, concrete look at what a test framework is actually doing
under the hood) and a real test suite, `tests.cpp`, compiled into its own separate
executable, `run_tests`, that exercises the lexer, parser, matrix math, control flow, and
function scoping directly — with no HTTP server, no sockets, no `curl` involved at all. The
transferable problem: every real bug this curriculum has found since Lesson 9 — negative
numbers breaking matrix literals, assignment breaking inside `while` bodies, underscores
breaking identifiers — was caught by hand, by typing a `curl` command and reading the
response. That works, but it doesn't scale, and it depends entirely on remembering to retest
everything by hand after every future change. This lesson turns four of those exact,
real, already-found bugs into permanent, automated regression tests — and, in the process,
finds and fixes a real bug in the test harness itself.

**What you need to know first:** nothing new about the language this project implements —
this lesson tests behavior every prior lesson already built and verified by hand. What's new
is entirely about *how* that verification happens from here on.

**Pipeline diagram:**

This lesson doesn't touch the pipeline at all — `Lexer`, `Parser`, `ast`, `Environment`,
`Matrix` are exercised exactly as `server.cpp` already exercises them, just from a different
`main()`. The real payoff of this lesson is a direct, visible consequence of the layering
choices made since Lesson 2: because none of those pieces have ever depended on sockets or
HTTP, they can be called directly, in a plain C++ program, with no server running at all.

---

## Concept Unit 1: `assert` stops at the first problem

### The Problem

The simplest possible way to check that code behaves correctly is C's own `assert` macro —
worth seeing its real behavior directly before building anything more elaborate, since its
one specific limitation is exactly what motivates everything else in this lesson.

### Introduce the concept in isolation

```cpp
#include <iostream>
#include <cassert>

int add(int a, int b) {
    return a + b;
}

int main() {
    assert(add(2, 2) == 4);
    std::cout << "first assert passed\n";
    assert(add(2, 2) == 5);
    std::cout << "this line never prints\n";
    return 0;
}
```

Real output:

```
assert_lab: assert_lab.cpp:11: int main(): Assertion `add(2, 2) == 5' failed.
Aborted
```

Real exit code: `134` (the process was killed by a signal — `SIGABRT`). The second `std::cout`
line genuinely never runs — nothing after a failed `assert` executes at all.

### Discard

This lab is deleted. `TestRunner::check` (Concept Unit 2) checks the same kind of boolean
condition, but responds to failure completely differently.

### Mechanical walkthrough

- `#include <cassert>` and `assert(...)` — **(a) first appearance.** A macro (not a function —
  no header needed beyond the include, and it can be compiled out entirely by defining
  `NDEBUG`) that evaluates its argument and, if false, prints the failing expression's source
  text, the file, and the line number, then calls `std::abort()` — which immediately
  terminates the entire process, running no further code, not even remaining statements in
  `main` itself.

### CS lens

`assert`'s all-or-nothing behavior is the right tool for a genuinely different job than
testing: it's meant to catch **programmer errors that should be impossible** if the code is
correct — an invariant that, if violated, means continuing to run would be actively
dangerous (operating on corrupted state). A *test suite*, by contrast, exists specifically to
discover which of many checks currently fail — stopping at the first one defeats that
purpose entirely, which is exactly the gap this lesson's own harness exists to close.

---

## Concept Unit 2: A check that survives its own failure

### Introduce the concept in isolation

```cpp
#include <iostream>

int passed = 0;
int failed = 0;

void check(bool condition, const std::string& description) {
    if (condition) {
        passed++;
    } else {
        failed++;
        std::cout << "FAILED: " << description << "\n";
    }
}

int add(int a, int b) {
    return a + b;
}

int main() {
    check(add(2, 2) == 4, "add(2,2) == 4");
    check(add(2, 2) == 5, "add(2,2) == 5 (deliberately wrong)");
    check(add(10, -3) == 7, "add(10,-3) == 7");

    std::cout << passed << " passed, " << failed << " failed\n";
    return 0;
}
```

Real output:

```
FAILED: add(2,2) == 5 (deliberately wrong)
2 passed, 1 failed
```

Real exit code: `0`. All three checks ran — including the one *after* the failure — and the
program exited normally, with a summary reporting exactly which one failed and how many
succeeded regardless.

### Discard

This global-variable version is deleted. The real project's version (Concept Unit 3) wraps
the same idea — record, don't abort — in a proper class instead of loose globals.

### Mechanical walkthrough

- `void check(bool condition, const std::string& description)` — **(b) reappearing shape,
  new consequence.** Structurally similar to any ordinary function this project has written
  — the entire difference from `assert` is behavioral, not syntactic: failure updates a
  counter and prints a message, then **returns normally**, letting execution continue exactly
  as if nothing had gone wrong, from the calling code's point of view.
- The third `check` call running and passing despite the second one failing — **(a) first
  appearance of this specific, deliberate property.** This is the entire point made
  concrete: a real test suite needs to report *everything* that's currently broken in one
  run, not stop at the first surprise and hide every other result behind it.

---

## Concept Unit 3: The real `TestRunner`

### Project Change

- **Reference Source:** no reference counterpart.
- **Files affected:** new `test_framework.h`, new `test_framework.cpp`.
- **Change type:** add.
- **Location:** new files, alongside every other project file.
- **Dependencies:** none — deliberately, this is the one piece of the project that doesn't
  depend on the lexer, parser, or anything else being tested.

### The New Code — type it yourself

`test_framework.h`:

```cpp
#pragma once
#include <string>
#include <vector>
#include <iostream>

class TestRunner {
public:
    void check(bool condition, const std::string& description);
    void check_equal(const std::string& actual, const std::string& expected, const std::string& description);
    int summarize() const;

private:
    int passed_ = 0;
    int failed_ = 0;
    std::vector<std::string> failures_;
};
```

### The Updated Project

Brand-new file, nothing to place it inside. `test_framework.cpp`, whole:

```cpp
#include "test_framework.h"

void TestRunner::check(bool condition, const std::string& description) {
    if (condition) {
        passed_++;
    } else {
        failed_++;
        failures_.push_back(description);
    }
}

void TestRunner::check_equal(const std::string& actual, const std::string& expected, const std::string& description) {
    check(actual == expected, description + " (expected \"" + expected + "\", got \"" + actual + "\")");
}

int TestRunner::summarize() const {
    std::cout << passed_ << " passed, " << failed_ << " failed\n";
    for (const std::string& failure : failures_) {
        std::cout << "  FAILED: " << failure << "\n";
    }
    return failed_;
}
```

### Mechanical walkthrough (new items only)

- `std::vector<std::string> failures_` — **(a) first appearance of deferred reporting.**
  Concept Unit 2's lab printed each failure immediately, interleaved with whatever else the
  test program printed; storing failure descriptions instead, and printing them all together
  in `summarize()`, keeps the actual per-check failure detail visually grouped at the very
  end, separate from any test output printed along the way.
- `check_equal(...)` calling `check(actual == expected, ...)` with an auto-built description
  — **(a) first appearance of a convenience wrapper around the more general primitive.**
  Every comparison this project's real tests need (Concept Unit 5) is "does this string equal
  that string" — `check_equal` exists purely so each individual test doesn't have to hand-
  build its own "expected X, got Y" message every time.
- `int TestRunner::summarize() const` returning the failure count — **(a) first appearance of
  this specific return-value convention.** Returning `0` on full success and a nonzero count
  otherwise means `main` (Concept Unit 6) can use this value directly as the whole program's
  **exit code** — `0` conventionally means success to any calling shell or CI system
  (Lesson 1's own `return 0;` from `main` established this convention back in the very first
  lesson), and a nonzero exit code is exactly what an automated pipeline would check to decide
  whether a build should be allowed to proceed.

---

## Concept Unit 4: A test file with no server in it at all

### Project Change

- **Reference Source:** no reference counterpart.
- **Files affected:** new `tests.cpp`.
- **Change type:** add.
- **Location:** new file, alongside `server.cpp`.
- **Dependencies:** `lexer.h`, `parser.h`, `environment.h`, `value.h` — and, notably, *not*
  anything socket- or HTTP-related.

### The New Code — type it yourself

```cpp
Value run(const std::string& source, Environment& env) {
    Lexer lexer(source);
    Parser parser(lexer.tokenize());
    std::unique_ptr<Expression> ast = parser.parse();
    return ast->evaluate(env);
}
```

### The Updated Project

The top of `tests.cpp`:

```cpp
#include "test_framework.h"
#include "lexer.h"
#include "parser.h"
#include "environment.h"
#include "value.h"
#include <stdexcept>

Value run(const std::string& source, Environment& env) {                 // ← new
    Lexer lexer(source);                                                 // ← new
    Parser parser(lexer.tokenize());                                     // ← new
    std::unique_ptr<Expression> ast = parser.parse();                    // ← new
    return ast->evaluate(env);                                          // ← new
}                                                                         // ← new
```

### Mechanical walkthrough

`run` is exactly the same four-line sequence `server.cpp`'s request loop has performed inside
its `try` block since Lesson 6 (Lexer → Parser → parse → evaluate) — extracted into its own
reusable function here specifically because tests need to run it dozens of times against
different source strings, not once per HTTP request. Worth stating plainly: this is the exact
proof of Lesson 1's original architecture decision paying off, several lessons later and in a
context nobody was originally imagining — a `Lexer`, `Parser`, and `Environment` that never
knew what a socket was can be driven directly, with zero adaptation, from a completely
different `main()` with a completely different purpose.

### CS lens

Testing a system through the same interface its real caller uses (`run`, mirroring
`server.cpp`'s own evaluation sequence) rather than reaching into individual internal pieces
is a real, general testing principle: it means these tests verify *actual, observable
behavior* — what a real client sees — rather than implementation details that might change
without the observable behavior changing at all.

---

## Concept Unit 5: Regression tests for four real, already-found bugs

### The Problem

Four of the real bugs this curriculum has found and fixed by hand — Lesson 9's negative-number
matrix literals, Lesson 13's assignment-inside-`while`, and Lesson 14's non-leaking parameter
scope and underscore-in-identifiers — are exactly the kind of thing that could silently break
again during some future, unrelated change, with nothing to catch it except noticing wrong
output by eye. Each deserves a permanent, named test.

### The New Code — type it yourself

```cpp
void test_matrix(TestRunner& t) {
    Environment env;
    t.check_equal(run("A = [1 2; 3 4]", env).to_string(), "[1 2; 3 4]", "matrix literal round-trips");
    t.check_equal(run("A + A", env).to_string(), "[2 4; 6 8]", "matrix addition");
    t.check_equal(run("det(A)", env).to_string(), "-2", "det([1 2;3 4]) == -2");

    // Lesson 9's real bug: negative numbers inside a matrix literal.
    t.check_equal(run("M = [6 1 1; 4 -2 5; 2 8 7]", env).to_string(),
                  "[6 1 1; 4 -2 5; 2 8 7]", "matrix literal with negative entries parses");
    t.check_equal(run("det(M)", env).to_string(), "-306", "det of the classic 3x3 textbook example == -306");
}
```

### The Updated Project

The rest of `tests.cpp`'s test groups (`test_lexer` and `test_arithmetic` are straightforward
reapplications of the same pattern and are not shown in full here — see the committed file):

```cpp
void test_control_flow(TestRunner& t) {
    Environment env;
    // Lesson 13's real bug: assignment as a while-loop body.
    run("x = 0", env);
    t.check_equal(run("while (x < 5) x = x + 1", env).to_string(), "5", "while loop counts to 5");
    t.check_equal(run("x", env).to_string(), "5", "while loop's mutation persisted");
    t.check_equal(run("while (0) 99", env).to_string(), "0", "a while loop that never runs returns the 0.0 default");
}

void test_functions_and_scope(TestRunner& t) {
    Environment env;
    run("function square(x) x * x end", env);
    t.check_equal(run("square(5)", env).to_string(), "25", "square(5) == 25");

    run("function fact(n) if (n <= 1) 1 else n * fact(n - 1) end", env);
    t.check_equal(run("fact(5)", env).to_string(), "120", "fact(5) == 120 (recursion)");

    // Lesson 14's core proof: a function's parameter must not leak into the caller's scope.
    run("x = 100", env);
    run("function leak(x) x + 1 end", env);
    run("leak(5)", env);
    t.check_equal(run("x", env).to_string(), "100", "global x is untouched by a same-named parameter");

    // Lesson 14's real bug: identifiers couldn't contain underscores.
    run("A = [1 2; 3 4]", env);
    run("function double_matrix(m) m + m end", env);
    t.check_equal(run("double_matrix(A)", env).to_string(), "[2 4; 6 8]", "underscore-named function with a matrix argument");
}

void expect_throw(TestRunner& t, const std::string& source, const std::string& description) {
    Environment env;
    try {
        run(source, env);
        t.check(false, description + " (expected an exception, but none was thrown)");
    } catch (const std::exception&) {
        t.check(true, description);
    }
}

void test_errors(TestRunner& t) {
    expect_throw(t, "2*(3+4", "unbalanced parentheses are rejected, not silently accepted");
    expect_throw(t, "2 $ 3", "an unrecognized character is rejected, not silently skipped");
    expect_throw(t, "sqrt([1 2; 3 4])", "a type error (matrix into a scalar function) is rejected");
    expect_throw(t, "undefined_name", "an undefined variable is rejected");
}
```

### Mechanical walkthrough (new items only)

- `Environment env;` declared once, at the top of each test function, then reused across
  several `run(...)` calls within that function — **(a) first appearance of this specific
  reuse pattern in a test context.** This directly exercises the exact thing Lesson 4 built
  `Environment` to prove — state persisting across separate evaluations — the same way
  separate `curl` requests against one running server did, except here it's separate function
  calls against one in-memory object, with no HTTP layer involved at all.
- `expect_throw` catching `const std::exception&` and asserting the *absence* of a throw is a
  failure — **(a) first appearance of testing for a required failure, not just a required
  success.** A test suite that only ever checks "does the right answer come back" would never
  notice if error handling silently broke — `2*(3+4` (unbalanced) or `2 $ 3` (unrecognized)
  *must* throw, and this test fails just as loudly if one of them stops throwing as it would
  if a correct computation stopped giving the right answer.
- Comments directly citing which lesson each regression test protects (`// Lesson 9's real
  bug: ...`) — **(a) first appearance of this documentation habit in test code specifically.**
  A failing test with no context just says something is wrong; a failing test that says *why
  this exact case matters* — which past, real incident it exists to prevent from recurring —
  is far more useful to whoever eventually breaks it and has to understand what went wrong.

### Run it. Real output.

```
$ g++ -std=c++17 -Wall -c tests.cpp -o tests.o
$ g++ tests.o lexer.o ast.o parser.o environment.o functions.o matrix.o value.o format.o svg.o user_function.o test_framework.o -o run_tests
$ ./run_tests
24 passed, 0 failed
```

All 24 checks — across the lexer, arithmetic, matrices, control flow, functions and scoping,
and error handling — pass against the real, current codebase, with the server never built or
started at all.

---

## Concept Unit 6: A bug in the test harness itself

### The Problem

A test suite is only as trustworthy as its own failure-handling. To find out whether this
one's actually reliable — not just assumed to be — the right move is to deliberately break
something real and watch what happens, the same "what breaks without this" instinct this
schema has applied to the project's own code in every lesson, now turned on the test code
itself.

### What actually happened

Reverting Lesson 9's negative-number fix in `parse_matrix` and rerunning `./run_tests`
produced this, for real:

```
terminate called after throwing an instance of 'std::runtime_error'
  what():  expected a number, '-', ';', or ']' in matrix literal (got MINUS)
Aborted
```

Exit code `134` — the same signal-killed code Concept Unit 1's bare `assert` produced. This
is a real, genuine bug in the harness, found by actually trying to break something rather than
assumed away: `test_matrix`'s calls to `run(...)` for the negative-number cases have no
`try`/`catch` around them at all — they expect success, and when `parse_matrix` unexpectedly
throws instead, that exception propagates all the way out of `test_matrix`, out of `main`,
and crashes the *entire test binary* — silently skipping every test group listed after
`test_matrix`, with no report of what actually failed, just a bare stack-unwinding message.
This defeats the entire point of Concept Unit 2's soft-failing `check` — the harness protects
against a *check* failing, but not against an *unexpected exception* escaping a whole test
group.

### Project Change

- **Reference Source:** no reference counterpart.
- **Files affected:** `tests.cpp`.
- **Change type:** add a wrapper around every test-group call in `main`.
- **Location:** `main`.
- **Dependencies:** none new.

### The New Code — type it yourself

```cpp
void run_group(TestRunner& t, const std::string& group_name, void (*group)(TestRunner&)) {
    try {
        group(t);
    } catch (const std::exception& e) {
        t.check(false, group_name + " threw an unexpected exception: " + e.what());
    }
}
```

### The Updated Project

`main`, in full:

```cpp
int main() {
    TestRunner t;
    run_group(t, "test_lexer", test_lexer);                              // ← changed
    run_group(t, "test_arithmetic", test_arithmetic);                    // ← changed
    run_group(t, "test_matrix", test_matrix);                            // ← changed
    run_group(t, "test_control_flow", test_control_flow);                // ← changed
    run_group(t, "test_functions_and_scope", test_functions_and_scope);  // ← changed
    run_group(t, "test_errors", test_errors);                            // ← changed
    return t.summarize() == 0 ? 0 : 1;
}
```

### Mechanical walkthrough (new items only)

- `void (*group)(TestRunner&)` as a parameter type — **(a) first appearance of a function
  pointer parameter in this project.** Unlike Lesson 5's `std::function` (a general-purpose
  wrapper that can hold *any* callable, including lambdas with captures), a plain function
  pointer here is enough and cheaper: `test_lexer`, `test_matrix`, and the rest are all
  ordinary free functions with no captured state, and a raw function pointer is the simplest
  tool that fits — worth noticing this as the inverse of Lesson 5's own SE lens, which chose
  `std::function` specifically *because* more flexibility was needed there; here, less
  machinery is the better fit.
- `try { group(t); } catch (const std::exception& e) { t.check(false, ...); }` — **(a) first
  appearance of exception containment at the test-group level, not just the individual-check
  level.** This is what actually fixes the crash: an unexpected exception from *anywhere*
  inside a test group is caught right here, turned into one ordinary failed `check`, and
  execution continues normally into the *next* group — exactly the property Concept Unit 2's
  simple `check` already had for boolean failures, now extended to cover exceptions too.

### Run it. Real output — verifying the fix actually works

Rebuilding with the harness fix, and *again* reverting Lesson 9's negative-number fix to
confirm the new behavior for real, rather than assuming it:

```
$ ./run_tests
22 passed, 1 failed
  FAILED: test_matrix threw an unexpected exception: expected a number, '-', ';', or ']' in matrix literal (got MINUS)
```

Exit code `1` — not `134`. Every other test group ran to completion; only the one genuinely
broken thing is reported, with the *exact* original error message preserved inside the
failure description, telling whoever sees this precisely what went wrong and where. Restoring
the real fix and rebuilding one more time:

```
$ ./run_tests
24 passed, 0 failed
```

Back to fully green — confirming the fix didn't just suppress the failure, it correctly
reports pass when the code is actually correct and fail when it isn't, in both directions,
checked for real rather than assumed.

### CS lens

This is **test isolation** — one test's failure, of any kind, including a crash-shaped one,
must never prevent every other test from running and reporting its own, independent result.
Also recognized in: this is precisely what real frameworks like Catch2 and Google Test do
automatically, and precisely why they exist rather than everyone hand-rolling `TestRunner`
from scratch for every project — this lesson's version makes the *mechanism* visible, at the
cost of the polish, breadth, and already-solved edge cases (this test binary has no timeout
protection either, for instance — an infinite loop inside a test group would still hang the
whole suite, a real, currently-unaddressed gap, worth naming honestly rather than implying
this harness is now bulletproof) that a mature, real-world framework provides.

### SE lens

Finding this bug required *actually breaking something real* and watching what happened,
not just reading the harness code and reasoning that it looked correct. This mirrors exactly
why this whole curriculum insists on running real commands and pasting real output rather
than describing expected behavior in prose — a test harness that's never been tested against
a real failure is exactly as unverified as any other piece of untested code, regardless of
how obviously correct its logic looks on the page.

---

## Closing

### Connect the pieces

Trace what happens when `./run_tests` runs today, in full: `main` calls `run_group` six
times, once per test group → each `run_group` call wraps its target function in a `try` block
(Concept Unit 6) → inside `test_matrix`, `run("M = [6 1 1; 4 -2 5; 2 8 7]", env)` (Concept
Unit 4's helper) constructs a `Lexer`, tokenizes the source — correctly handling the negative
`-2` thanks to Lesson 9's still-intact fix — builds a `Parser`, parses it into a real
`Matrix`-producing AST, and evaluates it against the shared `env` → `.to_string()` (Lesson 6)
formats the result → `t.check_equal(...)` (Concept Unit 3) compares it against the literal
string `"[6 1 1; 4 -2 5; 2 8 7]"`, recording a pass → `test_matrix` returns normally, no
exception thrown, so `run_group`'s `catch` never fires → after all six groups run,
`t.summarize()` prints `24 passed, 0 failed` and returns `0`, which becomes `run_tests`'s own
process exit code — the single number a CI system, or a person, would actually check to know
whether this project is currently working.

### What breaks without this

Already run, twice, for real, as this lesson's own central demonstration (Concept Unit 6):
without `run_group`'s `try`/`catch`, one genuinely broken piece of the project doesn't just
fail its own test — it silently prevents every test *after* it from running at all, and
crashes with a generic, unhelpful abort message instead of a clear, specific report. No
further "what breaks" experiment is needed beyond what's already been shown with real,
pasted output above.

### Exercises

- Add a test for Lesson 12's `else if` chaining (`"if (x > 100) 1 else if (x > 5) 2 else 3"`
  with some `x` you choose), and confirm it passes.
- `test_errors`'s `expect_throw` only confirms *that* an exception was thrown, never *which*
  one, or whether its message is the one actually expected. As an exercise only (not required
  for this lesson's Definition of Done), consider what `expect_throw` would need to also
  check the exception's `.what()` text, and what value that stronger check would add over what
  exists now.
- This lesson's harness has no timeout protection, named honestly in Concept Unit 6's CS lens.
  Sketch (in comments or on paper, not necessarily compiled) what would be needed to bound how
  long any single test group is allowed to run — and consider why Lesson 13's own
  `WhileExpression` iteration cap doesn't automatically solve this for a *test* that never
  actually calls `while` but hangs some other way.

### Definition of done

- [ ] `test_framework.h`/`test_framework.cpp` compile cleanly on their own.
- [ ] `tests.cpp` compiles and links into a standalone `run_tests` executable, using the same
      `lexer.o`/`ast.o`/`parser.o`/`environment.o`/etc. object files `server` uses — no
      duplicated logic.
- [ ] `server` itself still builds and links correctly, with `tests.o`/`test_framework.o`
      correctly excluded from it.
- [ ] `./run_tests` reports `24 passed, 0 failed` against the current, correct codebase.
- [ ] Deliberately reverting Lesson 9's negative-number fix and rerunning `./run_tests`
      produces exactly one failure, with the real, original error message preserved in the
      failure description — not a crash.
- [ ] The fix was restored and `./run_tests` was rerun a final time, confirming `24 passed,
      0 failed` again.
- [ ] Commit:

```
git add test_framework.h test_framework.cpp tests.cpp
git commit -m "Add a hand-rolled test harness and a real regression suite

TestRunner records check failures instead of aborting (unlike bare
assert, verified for real: assert kills the whole process on first
failure, exit 134). tests.cpp exercises the lexer/parser/matrix/
environment/functions directly, with zero dependency on sockets or
HTTP - direct payoff of the layering choices made since Lesson 2.

24 tests cover core arithmetic, matrices, control flow, function
scoping, and required error cases - including four regression tests
for real bugs this curriculum already found by hand (Lesson 9's
negative-number matrix literals, Lesson 13's assignment-inside-while,
Lesson 14's non-leaking parameter scope and underscore-in-identifiers).

Found and fixed a real bug in the harness itself: an unexpected
exception escaping a test group (as opposed to an ordinary failed
check) crashed the entire binary, silently skipping every later
test group with no report. run_group() now wraps each group in its
own try/catch, verified by actually reverting a real fix and
confirming a single clean failure instead of a crash, then restoring
it and confirming green again.

Known, honest limitation: no timeout protection for a hung test;
error tests only check that something throws, not which exception
or what its message says."
```

Next lesson: structured logging with levels, and the layered directory structure
(`lexer/ parser/ ast/ interpreter/ runtime/ matrix/ http/ tests/`) this project's original
architecture named all the way back in Lesson 1.
