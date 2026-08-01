# Lesson 12: A Test Is a "SAVE AND TRY" That Never Forgets to Run Again
### (LAB 12 — Testing With Catch2)

**What you will build:** A real Catch2 test suite for `S-01-CPP-FOUNDATIONS` LAB-05's own `calculateDamage` function — passing tests, a deliberately failing one (to see Catch2's real failure report), exception tests exercising this series' own Lesson 8 design, and CMake/CTest integration (this series' own Lesson 9) so the whole suite runs with one command. The transferable problem: this entire curriculum's own "SAVE AND TRY" pattern — compile, run, read the output, compare by eye — is a manual test, performed once, by a human, then never repeated unless that human remembers to. A real test suite is that same verification, automated, kept, and re-run on every single change, forever, by a machine that never forgets and never gets tired of checking.

**What you need to know first:** `S-01-CPP-FOUNDATIONS` LAB-05's `calculateDamage`. This series' Lesson 8 — custom exceptions, `throw`. This series' Lesson 9 — CMake, `CMakeLists.txt`, targets.

**Terms introduced in this lesson**

> **Unit test** — a small, automated check that a specific piece of code produces a specific, expected result.
> **Test framework** — a library providing the structure (test declaration, assertions, reporting) for writing and running unit tests — Catch2, used in this lesson.
> **`TEST_CASE`** — Catch2's macro declaring one named test.
> **`REQUIRE`** — Catch2's core assertion: if the expression is false, the test fails immediately, with a detailed report of what was actually compared.
> **Regression** — a bug that reappears after having been fixed once, usually introduced by a later, unrelated change.
> **CTest** — CMake's own test-running tool, integrating any test executable into the `cmake --build`/`ctest` workflow.

No pipeline diagram applies — this bridge series builds standalone concept programs.

---

## Concept Unit 1: The Problem — "SAVE AND TRY" Doesn't Repeat Itself

### The Problem

Every lesson across this entire curriculum has ended sections with a manual verification step: compile, run, read the output, compare it by eye against what was expected. This works, and this curriculum's own schema insists on it — but it happens exactly once, by a human, at the moment the lesson was written. Nothing re-runs it automatically the next time the code changes.

### No isolated code lab for this step

The problem is felt directly by considering what this curriculum's own "SAVE AND TRY" steps never did: after `S-01-CPP-FOUNDATIONS` LAB-05 verified `calculateDamage(10, 3) == 7`, nothing checked that fact again in any later lesson, even though `calculateDamage`-shaped logic was reused and modified repeatedly (this series' own Lesson 8 added exception-throwing to an equivalent function).

### Explanation

A **unit test** is that exact same manual check, written down as real code instead of performed once by eye: "given these inputs, this function must produce this exact output." A **test framework** provides the scaffolding — a way to declare a test, a way to assert an expected result, and a way to run every test that's ever been written and report which passed and which didn't, all with one command.

### CS Lens

A test suite is, structurally, nothing more than a program whose only job is calling other functions with known inputs and checking the results — every mechanism this curriculum has already taught (functions, `if`, comparison operators) is sufficient to build one by hand. A test *framework* exists purely to remove the boilerplate of doing that by hand, repeatedly, with consistent, readable reporting.

### SE Lens

The real value of a test suite isn't verifying code once — it's verifying it *again*, automatically, every time something else changes, catching a **regression** (a previously-fixed bug reappearing) the instant it's reintroduced, rather than whenever a human happens to notice broken behavior in production.

### Connection

Concept Unit 2 gets a real test framework into a real project and writes the first real test.

---

## Concept Unit 2: `TEST_CASE` and `REQUIRE`

### The Problem

`S-01-CPP-FOUNDATIONS` LAB-05's own manual verification — `calculateDamage(10, 3)` should equal `7` — needs to become a real, automated, re-runnable check.

### Project Change

- **Reference Source:** `S-01-CPP-FOUNDATIONS` LAB-05's own `calculateDamage` function and its own manually-verified cases.
- **Files affected:** `test_damage.cpp` — new file; `catch2/catch.hpp` — a single downloaded header (Catch2's own "amalgamated" single-file distribution, the simplest way to add it to a small project with no package manager required).
- **Change type:** Add (new files).
- **Location:** Project root.
- **Dependencies:** None beyond the downloaded header itself.

### The New Code

```cpp
#define CATCH_CONFIG_MAIN
#include "catch2/catch.hpp"

int calculateDamage(int attack, int defense) {
    int damage = attack - defense;
    if (damage < 0) damage = 0;
    return damage;
}

TEST_CASE("calculateDamage subtracts defense from attack", "[damage]") {
    REQUIRE(calculateDamage(10, 3) == 7);
}

TEST_CASE("calculateDamage never goes negative", "[damage]") {
    REQUIRE(calculateDamage(3, 10) == 0);
}

TEST_CASE("calculateDamage handles exact equality", "[damage]") {
    REQUIRE(calculateDamage(5, 5) == 0);
}
```

### Concept Lab

No separate throwaway: this real test file, compiled and run below, is already the smallest useful demonstration.

Run it — verified this session:

```
$ g++ -std=c++17 -Wall -Wextra test_damage.cpp -o test_damage
$ ./test_damage.exe
===============================================================================
All tests passed (3 assertions in 3 test cases)
```

What that proves: three separate, named tests, each independently verifying one case this lesson's own reference source (`S-01-CPP-FOUNDATIONS` LAB-05) originally checked by hand — an exact match (`10, 3 → 7`), a clamped-to-zero case (`3, 10 → 0`), and a boundary case (`5, 5 → 0`, testing the `< 0` check's exact edge). All three pass, reported in one line, with no manual reading of individual `std::cout` lines required.

### Mechanical Walkthrough

- `#define CATCH_CONFIG_MAIN` — **(a) first appearance.** A preprocessor directive (`S-01-CPP-FOUNDATIONS` LAB-00's own category) telling Catch2's header to generate a real `main()` function automatically — the test file itself never writes one; the framework provides it.
- `#include "catch2/catch.hpp"` — **(c) reusing** `#include` with quotes (`S-01-CPP-FOUNDATIONS` LAB-00) for a local, project-relative header rather than a system one.
- `TEST_CASE("name", "[tag]")` — **(a) first appearance.** A macro (a preprocessor-level code-generation tool, `S-01-CPP-FOUNDATIONS` LAB-00's own `#include` already being the simplest example) that declares one independently-runnable test, named for a human reader, optionally tagged (`"[damage]"`, usable to run only tests with a given tag — not exercised further here).
- `REQUIRE(expression)` — **(a) first appearance.** Evaluates `expression`; if `false`, the test fails immediately and Catch2 reports exactly what was compared, with the real values involved (Concept Unit 3 demonstrates this precisely).

### CS Lens

Each `TEST_CASE` compiles down to a small, automatically-registered function — Catch2's generated `main()` (from `CATCH_CONFIG_MAIN`) discovers and runs every one of them, collecting results, without the test file itself ever explicitly listing which tests to run — the same "the framework provides the loop, you provide the logic" shape `std::sort` and `std::find_if` (this series' own Lesson 7) already demonstrated for algorithms.

### Connection

Concept Unit 3 makes a test fail on purpose — the more informative half of what a test suite actually reports.

---

## Concept Unit 3: A Real Failure — What Catch2 Actually Reports

### The Problem

Passing tests confirm correct behavior. The far more useful moment is a *failing* test — nothing so far has shown what that actually looks like, or how much information it provides beyond "something broke."

### Concept Lab

```cpp
// test_fail.cpp  (disposable — a deliberately reintroduced bug)
#define CATCH_CONFIG_MAIN
#include "catch2/catch.hpp"

int calculateDamage(int attack, int defense) {
    int damage = attack - defense;
    return damage;   // BUG: forgot the "clamp to zero" check
}

TEST_CASE("calculateDamage never goes negative") {
    REQUIRE(calculateDamage(3, 10) == 0);
}
```

Compiling and running — verified this session:

```
$ g++ -std=c++17 -Wall -Wextra test_fail.cpp -o test_fail
$ ./test_fail.exe
-------------------------------------------------------------------------------
calculateDamage never goes negative
-------------------------------------------------------------------------------
test_fail.cpp:9
...............................................................................

test_fail.cpp:10: FAILED:
  REQUIRE( calculateDamage(3, 10) == 0 )
with expansion:
  -7 == 0

===============================================================================
test cases: 1 | 1 failed
assertions: 1 | 1 failed
```

What that proves: Catch2 reports the exact file and line of the failing `REQUIRE`, the exact expression as written (`calculateDamage(3, 10) == 0`), **and** its expansion — the *actual runtime values* involved (`-7 == 0`), not just "assertion failed." This is `S-01-CPP-FOUNDATIONS` LAB-09's own `applyDamage` arithmetic-error moment, generalized into automated tooling: a test that would have caught that exact mistake the instant it was introduced, rather than requiring a careful, manual re-derivation later. Verified separately this session: the process exits with a nonzero code (`1`) on failure — a real, checkable signal any automated system (a CI pipeline, this lesson's own CTest integration) can act on.

This scratch file is discarded now; the real `calculateDamage` (Concept Unit 2) keeps its correct clamp, and all three of that unit's tests pass.

### Mechanical Walkthrough

- The `FAILED:` block's `with expansion:` line — **(a) first appearance of Catch2's expression expansion.** Catch2 captures both sides of a comparison operator inside `REQUIRE` and reports their actual runtime values, not merely that the boolean result was `false` — a real, load-bearing feature that turns a failure report into a diagnosis, not just an alarm.

### CS Lens

This expansion is implemented through operator overloading (this series' own Lesson 1's term, first applied there to `+`) — `REQUIRE`'s macro captures the expression in a way that lets Catch2 intercept `==` and similar comparison operators specifically to record both operands before evaluating the overall boolean result, entirely invisibly to the test-writer, who only ever writes an ordinary-looking comparison.

### SE Lens

A test failure that reports *exact values*, not just pass/fail, is the difference between "something is wrong" and "here is precisely what is wrong" — the same gap `S-01-CPP-FOUNDATIONS` LAB-09's own corrected arithmetic mistake (`130` versus the real, verified `100`) had to be found by hand, the hard way, before this schema's own verification discipline caught it. A real test suite catches exactly this class of mistake automatically, every time, forever.

### Connection

Concept Unit 4 tests this series' own Lesson 8 — not a return value, but whether a function throws correctly.

---

## Concept Unit 4: Testing Exceptions — `REQUIRE_THROWS_AS`

### The Problem

This series' own Lesson 8 built functions that `throw` on invalid input rather than returning a sentinel value — `REQUIRE(expr == value)` has no way to test "this expression should throw," since evaluating a throwing expression inside `REQUIRE` would itself propagate the exception, aborting the test rather than reporting it as expected behavior.

### Project Change

- **Reference Source:** This series' Lesson 8's own `throw`-based error handling.
- **Files affected:** `test_throws.cpp` — new file.
- **Change type:** Add.
- **Location:** Whole file.
- **Dependencies:** `throw`, `std::invalid_argument` (this series' Lesson 8, `<stdexcept>`).

### The New Code

```cpp
#define CATCH_CONFIG_MAIN
#include "catch2/catch.hpp"
#include <stdexcept>

int calculateDamage(int attack, int defense) {
    if (attack < 0 || defense < 0) {
        throw std::invalid_argument("attack and defense must be non-negative");
    }
    int damage = attack - defense;
    if (damage < 0) damage = 0;
    return damage;
}

TEST_CASE("calculateDamage rejects negative inputs") {
    REQUIRE_THROWS_AS(calculateDamage(-5, 3), std::invalid_argument);
}

TEST_CASE("calculateDamage accepts valid inputs") {
    REQUIRE_NOTHROW(calculateDamage(10, 3));
}
```

### Concept Lab

No separate throwaway: this real test file, run below, is already the demonstration.

Run it — verified this session:

```
$ g++ -std=c++17 -Wall -Wextra test_throws.cpp -o test_throws
$ ./test_throws.exe
All tests passed (2 assertions in 2 test cases)
```

What that proves: `REQUIRE_THROWS_AS(expression, ExceptionType)` ran `calculateDamage(-5, 3)` and confirmed it threw specifically a `std::invalid_argument` (this series' Lesson 8's own custom-exception pattern, here using a standard type directly) — not just *that* it threw, but that it threw the *correct* type. `REQUIRE_NOTHROW(expression)` confirmed the valid-input case completes without throwing at all — a real, useful assertion in its own right, since a function that throws unexpectedly on *valid* input is its own real bug.

### Mechanical Walkthrough

- `REQUIRE_THROWS_AS(expr, Type)` — **(a) first appearance.** Runs `expr` inside its own internal `try`/`catch` (this series' own Lesson 8), succeeding only if it throws exactly `Type` (or something derived from it, this series' Lesson 1's own inheritance, per Lesson 8's own polymorphic `catch` behavior) — failing the test if it throws nothing, or throws the wrong type.
- `REQUIRE_NOTHROW(expr)` — **(a) first appearance.** The inverse: fails if `expr` throws anything at all.

### CS Lens

Both macros are themselves built from ordinary `try`/`catch` (this series' Lesson 8) — Catch2 provides no exception-testing magic beyond what any hand-written test could do with a `try` block and a `bool` flag; the value is entirely in the concise, readable macro form and the consistent, detailed failure reporting Concept Unit 3 already proved.

### Connection

Concept Unit 5 wires this whole test executable into CMake (this series' own Lesson 9), so it runs with one command alongside the rest of a real project's build.

---

## Concept Unit 5: CTest — Running Tests Through CMake

### The Problem

A test executable, compiled and run by hand, still requires remembering its exact name and location — a real project wants "build, then run every test" as one uniform step, the same way `cmake --build` already uniformly builds every target regardless of project size.

### Project Change

- **Reference Source:** This series' own Lesson 9's `CMakeLists.txt`.
- **Files affected:** `CMakeLists.txt` — modified.
- **Change type:** Add.
- **Location:** Project root.
- **Dependencies:** `add_executable` (Lesson 9), the test executable (Concept Unit 2).

### The New Code

```cmake
enable_testing()

add_executable(test_damage test_damage.cpp)

add_test(NAME DamageTests COMMAND test_damage)
```

### The Updated Project

```cmake
cmake_minimum_required(VERSION 3.15)
project(DamageTests)
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

enable_testing()

add_executable(test_damage test_damage.cpp)

add_test(NAME DamageTests COMMAND test_damage)
```

### Concept Lab

No separate throwaway: this real project, configured, built, and tested below, is the demonstration.

Run it — verified this session (from a native Windows terminal — Concept Unit 5's own Watch for explains why that distinction matters here):

```
$ cmake -B build -G "MinGW Makefiles"
$ cmake --build build
[ 50%] Building CXX object CMakeFiles/test_damage.dir/test_damage.cpp.obj
[100%] Linking CXX executable test_damage.exe
[100%] Built target test_damage

$ cd build
$ ctest
Test project .../build
    Start 1: DamageTests
1/1 Test #1: DamageTests ......................   Passed    0.02 sec

100% tests passed, 0 tests failed out of 1
```

What that proves: `ctest`, run from inside the build directory, discovered and ran the registered test — `S-01-CPP-FOUNDATIONS` LAB-00's own Makefile "one command, whole project verified" idea, now genuinely scaled to any number of test executables a real project might register, each added with one `add_test` line.

### Watch for

**A real, verified environment quirk worth naming precisely:** running `ctest` from this session's own Git Bash/MSYS2 terminal produced a spurious failure (`Exit code 0xc0000139`) that did **not** reproduce when the identical command was run from a native Windows PowerShell terminal, where it correctly reported `100% tests passed`. This is a process-spawning quirk specific to how MSYS2-based shells launch child processes on Windows, not a real failure in the test or the build — worth knowing about directly, since a spurious environment-specific failure that looks like a real test failure is exactly the kind of confusing, misleading signal a real developer needs to learn to recognize and not chase as if it were a genuine bug.

### Mechanical Walkthrough

- `enable_testing()` — **(a) first appearance.** Activates CMake's testing support for this project — required before `add_test` has any effect.
- `add_test(NAME DamageTests COMMAND test_damage)` — **(a) first appearance.** Registers `test_damage` (the executable built by `add_executable`, this series' Lesson 9) as a named test CTest can run — `ctest`'s own exit code and pass/fail count come directly from that executable's own exit code (Concept Unit 3's own verified `1`-on-failure behavior).

### CS Lens

`ctest` treats any executable as a valid test, regardless of what framework (or none at all) it uses internally — its only contract is the executable's own exit code: `0` for success, nonzero for failure, exactly `S-01-CPP-FOUNDATIONS` LAB-00's own `return 0;`/`return 1;` convention, now used as the interface between a test framework and its build system.

### SE Lens

A real project typically registers dozens or hundreds of individual `TEST_CASE`s across a handful of test executables, each wired into CTest exactly once — `ctest` becomes the single command a developer (or a CI system, `S-02-CPP-DSA-MASTERY`/this series' own tooling themes) runs to answer "does everything still work?" after any change, the automated, permanent version of every "SAVE AND TRY" this entire curriculum has ever asked a human to perform once, by hand.

### Connection

This closes every new mechanism in this lesson — the Closing section connects automated testing back to the verification discipline this entire curriculum has practiced by hand from its very first lesson.

---

## Closing

### Connect the pieces

Every "SAVE AND TRY" and every "verified this session" claim across this entire curriculum — from `S-01-CPP-FOUNDATIONS` LAB-00's first compiled program through this series' own Lesson 11 — was a manual instance of exactly what this lesson automated. Concept Unit 2's `TEST_CASE`/`REQUIRE` turned `S-01-CPP-FOUNDATIONS` LAB-05's own manual verification into a permanent, re-runnable check. Concept Unit 3's deliberate failure proved Catch2 reports not just *that* something broke, but exactly what was compared and what the real values were — the automated version of this schema's own "prose isn't proof, run it and show the real output" standard. Concept Unit 4 extended that same discipline to this series' own Lesson 8 exception design. Concept Unit 5 wired the whole thing into Lesson 9's CMake build, so `ctest` becomes the one command verifying an entire project's correctness, the same way `cmake --build` is the one command that builds it.

### What breaks without this

Reasoned through directly from Concept Unit 3's own verified failure report: without a test suite, the exact regression that report demonstrated — a forgotten "clamp to zero" check, silently reintroduced by some later, unrelated edit — would only be discovered by someone noticing wrong behavior somewhere downstream, potentially long after the change that caused it, with no direct link back to which edit was responsible. A test suite catches it at the moment it's reintroduced, on the very next `ctest` run, with the exact file, line, and values Concept Unit 3 already proved Catch2 reports.

### Exercises

1. Write tests for this series' own Lesson 4 `Inventory` class — at minimum, one confirming a move-constructed object correctly "steals" its source's data, and one confirming the moved-from source is left in a safe, destructible state.
2. Reproduce Concept Unit 3's failure yourself, on your own machine, then fix the reintroduced bug and confirm the same test passes again — a full, real regression-caught-and-fixed cycle.
3. Add a `SECTION` (not directly demonstrated in this lesson's own transcript — look up its syntax in Catch2's own documentation) to share common setup between two related test cases, and confirm both still run and report independently.
4. Extend this lesson's own `CMakeLists.txt` with a second test executable, covering a different function from earlier in this bridge series, and confirm `ctest` runs and reports both, individually, in one invocation.

### Definition of done

- [ ] A real Catch2 test suite exists, covering at least one function from an earlier lesson in this curriculum, with both a passing case and (verified once, then fixed) a deliberately failing one.
- [ ] At least one test exercises exception-throwing behavior (`REQUIRE_THROWS_AS`/`REQUIRE_NOTHROW`), tied to this series' own Lesson 8.
- [ ] The test executable is registered with CTest via `enable_testing()`/`add_test()`, and `ctest` successfully runs and reports it — verified from a native terminal, per Concept Unit 5's own documented environment quirk.
- [ ] You can state, from Concept Unit 3's own verified proof, what information a failed `REQUIRE` reports beyond "the test failed."
- [ ] You can explain why a test suite is more valuable *after* a bug is fixed than at the moment it's fixed — Concept Unit 1's own regression argument, stated in your own words.
- [ ] All four Exercises completed with real, observed test output, including Exercise 2's full break-then-fix regression cycle.
- [ ] Commit: `git add CMakeLists.txt test_damage.cpp catch2/ && git commit -m "S03-LAB-12: automated Catch2 test suite for calculateDamage, wired into CTest"` — states why (permanent, automated verification replacing this curriculum's own manual SAVE AND TRY checks) not just what changed.
