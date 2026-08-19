# Lesson 16: Testing — `assert` and `unittest`

Testing is not optional — it is how you know your code works. In this lesson, we move from manually running code and looking at `print` statements to automating those checks.

**What you will build**
You will write automated unit tests using the simple `assert` statement, and then migrate to the structured `unittest.TestCase` framework. The transferable problems here are proving correctness without manual intervention, organizing tests logically, and writing tests before implementation to clarify interface design.

**What you need to know first**
- Lessons 0–15 (all prior Python constructs, including functions, classes, and exceptions).

**Terms used in this lesson**
- **`assert` statement** — a debugging aid that tests a condition. It exists to catch impossible states early; if the condition is false, it raises an exception, stopping execution immediately rather than letting bad data propagate.
- **AssertionError** — the built-in exception raised when an `assert` statement fails. It solves the problem of silently continuing with invalid state by loudly aborting the program.
- **Black-box testing** — a testing strategy based purely on the specification (the interface), without looking at the internal implementation. It exists to prove the function does what it promised, regardless of how it does it.
- **Glass-box testing** — a testing strategy based on knowing the internal implementation. It solves the problem of untested branches by ensuring every line of code (like specific `if/else` paths) is exercised at least once.
- **Edge cases** — inputs at the extreme ends of normal operation (like empty lists, zero, or `None`). Testing these exists because algorithms often fail at these boundaries while working fine for typical inputs.
- **Boundary values** — inputs exactly at, just below, or just above a cutoff point (e.g., if checking `x > 0`, testing `x = 0` and `x = 1`). Testing boundaries solves the "off-by-one" error problem.
- **Test-driven development (TDD)** — a software development process where tests are written *before* the code. It exists to force the programmer to define the exact interface and expected behavior before getting bogged down in implementation details.

**Objects and methods used**
- **`unittest.TestCase`**
  - *What it is:* The base class for creating structured unit tests.
  - *Implementation:* `class TestCase` in the `unittest` module.
  - *Its use:* You subclass it to group related tests and gain access to rich assertion methods.
  - *Type:* Class.
  - *Responsibility:* Manages test execution, provides setup/teardown hooks, and tracks successes and failures.
  - *Depends on:* The Python standard library `unittest` framework.
  - *Connects to:* Extended by your custom test classes; instantiated by the test runner.
  - *Shape:* Public API boundary of the testing framework.

- **`unittest.main`**
  - *What it is:* A command-line program that loads and runs tests.
  - *Implementation:* `def main(module='__main__', ...)`
  - *Its use:* Called at the bottom of a test script to automatically discover and run all `TestCase` subclasses.
  - *Type:* Function.
  - *Responsibility:* Discovers tests, runs them, and formats the output report (like dots for success or F for failure).
  - *Depends on:* Test classes defined in the file.
  - *Connects to:* Called by the Python interpreter when the file is run as a script.
  - *Shape:* Entry point for the testing framework.

- **`assertEqual`**
  - *What it is:* An assertion that checks for equality.
  - *Implementation:* `self.assertEqual(first, second)`
  - *Its use:* Used to verify that a computed result exactly matches the expected result.
  - *Type:* Instance method.
  - *Responsibility:* Fails the current test if `first != second`, reporting both values.
  - *Depends on:* Two values that support the `==` operator.
  - *Connects to:* Called by your test methods.
  - *Shape:* Internal test validation logic.

- **`assertNotEqual`**
  - *What it is:* An assertion that checks for inequality.
  - *Implementation:* `self.assertNotEqual(first, second)`
  - *Its use:* Used to ensure a function does *not* return a specific invalid value.
  - *Type:* Instance method.
  - *Responsibility:* Fails the test if `first == second`.
  - *Depends on:* Two comparable values.
  - *Connects to:* Called by test methods.
  - *Shape:* Internal test validation logic.

- **`assertTrue`**
  - *What it is:* An assertion that checks for truthiness.
  - *Implementation:* `self.assertTrue(expr)`
  - *Its use:* Validates that a boolean expression or function evaluates to True.
  - *Type:* Instance method.
  - *Responsibility:* Fails the test if `bool(expr)` is False.
  - *Depends on:* An expression that can be evaluated as a boolean.
  - *Connects to:* Called by test methods.
  - *Shape:* Internal test validation logic.

- **`assertFalse`**
  - *What it is:* An assertion that checks for falsiness.
  - *Implementation:* `self.assertFalse(expr)`
  - *Its use:* Validates that a boolean expression or function evaluates to False.
  - *Type:* Instance method.
  - *Responsibility:* Fails the test if `bool(expr)` is True.
  - *Depends on:* An expression that can be evaluated as a boolean.
  - *Connects to:* Called by test methods.
  - *Shape:* Internal test validation logic.

- **`assertIsNone`**
  - *What it is:* An assertion that checks for `None`.
  - *Implementation:* `self.assertIsNone(expr)`
  - *Its use:* Used when a function is expected to return `None` on failure or missing data.
  - *Type:* Instance method.
  - *Responsibility:* Fails the test if `expr is not None`.
  - *Depends on:* A single value.
  - *Connects to:* Called by test methods.
  - *Shape:* Internal test validation logic.

- **`assertIsNotNone`**
  - *What it is:* An assertion that ensures a value is not `None`.
  - *Implementation:* `self.assertIsNotNone(expr)`
  - *Its use:* Used to confirm an object was successfully created or returned.
  - *Type:* Instance method.
  - *Responsibility:* Fails the test if `expr is None`.
  - *Depends on:* A single value.
  - *Connects to:* Called by test methods.
  - *Shape:* Internal test validation logic.

- **`assertIn`**
  - *What it is:* An assertion that checks for membership.
  - *Implementation:* `self.assertIn(member, container)`
  - *Its use:* Verifies that an item exists within a list, set, dictionary, or string.
  - *Type:* Instance method.
  - *Responsibility:* Fails the test if `member not in container`.
  - *Depends on:* An item and a valid container type.
  - *Connects to:* Called by test methods.
  - *Shape:* Internal test validation logic.

- **`assertNotIn`**
  - *What it is:* An assertion that checks for non-membership.
  - *Implementation:* `self.assertNotIn(member, container)`
  - *Its use:* Verifies that an item is absent from a collection.
  - *Type:* Instance method.
  - *Responsibility:* Fails the test if `member in container`.
  - *Depends on:* An item and a valid container type.
  - *Connects to:* Called by test methods.
  - *Shape:* Internal test validation logic.

- **`assertAlmostEqual`**
  - *What it is:* An assertion that compares floating-point numbers within a tolerance.
  - *Implementation:* `self.assertAlmostEqual(first, second, places=7)`
  - *Its use:* Solves the problem of floating-point math inaccuracies (like `0.1 + 0.2 != 0.3`).
  - *Type:* Instance method.
  - *Responsibility:* Fails the test if the difference between values exceeds the given decimal places.
  - *Depends on:* Two numeric values.
  - *Connects to:* Called by test methods.
  - *Shape:* Internal test validation logic.

- **`assertRaises`**
  - *What it is:* A context manager assertion to verify exceptions.
  - *Implementation:* `with self.assertRaises(ExcType):`
  - *Its use:* Ensures a function properly raises an error under invalid conditions.
  - *Type:* Context manager / Instance method.
  - *Responsibility:* Passes the test if the code block raises `ExcType`; fails if no exception (or the wrong one) is raised.
  - *Depends on:* An exception class and a block of code.
  - *Connects to:* Wraps test execution code.
  - *Shape:* Internal test validation logic.

- **`setUp`**
  - *What it is:* A fixture method run before each test.
  - *Implementation:* `def setUp(self):`
  - *Its use:* Initializes shared state (like creating a fresh object) so tests don't interfere with each other.
  - *Type:* Instance method of `TestCase`.
  - *Responsibility:* Executes setup logic reliably before every single `test_` method is called.
  - *Depends on:* Overridden by your test class.
  - *Connects to:* Called automatically by the test runner.
  - *Shape:* Testing lifecycle hook.

- **`tearDown`**
  - *What it is:* A fixture method run after each test.
  - *Implementation:* `def tearDown(self):`
  - *Its use:* Cleans up resources (closing files, dropping databases) even if the test failed.
  - *Type:* Instance method of `TestCase`.
  - *Responsibility:* Executes cleanup logic reliably after every single `test_` method finishes.
  - *Depends on:* Overridden by your test class.
  - *Connects to:* Called automatically by the test runner.
  - *Shape:* Testing lifecycle hook.


## Concept Unit: `assert` — the simplest test

### The Problem

If we write a `square` function, how do we know it works? We could print `square(5)` and visually check if the terminal says `25`. But what if we change the function later? Do we want to manually re-read twenty print statements every time we save the file? If a manual check is boring, programmers will skip it. How can we make Python check the truth of a statement for us, and only complain if something is wrong?

### Project Change

- **Reference Source:** None — this is a from-scratch addition to introduce testing.
- **Files affected:** `test_square.py` (created)
- **Change type:** add
- **Location:** the entire file
- **Dependencies:** None

### The New Code

```python
def square(x):
    return x * x

assert square(0) == 0
assert square(5) == 25
assert square(-3) == 9
assert square(0.5) == 0.25
print('All assertions passed!')
```

### The Updated Project

```python
# test_square.py
def square(x):
    return x * x

# ← new
assert square(0) == 0
assert square(5) == 25
assert square(-3) == 9
assert square(0.5) == 0.25
print('All assertions passed!')
```
The file now defines a function and immediately runs a suite of automated checks. If it prints "All assertions passed!", we know every single equation evaluated to True.

### The Concept in Isolation

Let's see what happens when an assertion fails.

```python
# Throwaway test code
assert 2 + 2 == 5, 'Math is broken'
```

Output (predicted, because the exception stops execution):
```
Traceback (most recent call last):
  File "scratch.py", line 1, in <module>
    assert 2 + 2 == 5, 'Math is broken'
AssertionError: Math is broken
```
This is the **`assert` statement**. The output proves that if the condition evaluates to `False`, Python immediately crashes the program and raises an `AssertionError`, printing our optional message.

### Discarding the Throwaway Code

The broken math assertion is deleted and will not appear in the project again.

### Mechanical Walkthrough

- `assert` is a built-in Python keyword that tests a condition.
- `square(0) == 0` evaluates the function call and compares it to the expected result using the equality operator `==`.
- If the condition is `True`, the `assert` statement does absolutely nothing. Execution simply moves to the next line.
- By chaining several assertions together, we build a silent test suite. It only makes noise if something is broken. In production code, assertions can be completely disabled for speed by running Python with the `-O` (optimize) flag, which is why real, robust test suites use the `unittest` framework instead.


## Concept Unit: What to test — black-box vs glass-box

### The Problem

If we know *how* to test using `assert`, the next question is *what* to test. If a function takes an integer, we can't test all 4 billion possible integers. How do we choose a small handful of inputs that give us high confidence the function works perfectly? If we only test normal numbers, what happens when someone passes a zero?

### Project Change

- **Reference Source:** None
- **Files affected:** `math_specs.py` (created)
- **Change type:** add
- **Location:** entire file
- **Dependencies:** none

### The New Code

```python
def my_sqrt(x):
    """
    Returns the square root of x.
    - Raises ValueError if x < 0
    - Returns a float
    - Result squared should be within 0.001 of x
    """
    pass # Implementation hidden
```

### The Updated Project

```python
# math_specs.py
# ← new
def my_sqrt(x):
    """
    Returns the square root of x.
    - Raises ValueError if x < 0
    - Returns a float
    - Result squared should be within 0.001 of x
    """
    pass # Implementation hidden
```
This defines a specification without an implementation, giving us a target to test against.

### The Concept in Isolation

Imagine we test based purely on the docstring above. We test `x=0` (edge case), `x=4` (normal case), `x=2` (irrational case), and `x=-1` (error case).

```python
# Throwaway test planning
print("Testing specification without knowing the code.")
```
Output:
```
Testing specification without knowing the code.
```
This is called **Black-box testing**. The output simply proves we can plan our tests conceptually without executing internal logic.

### Discarding the Throwaway Code

The throwaway print statement is deleted.

### Mechanical Walkthrough

- **Black-box testing** means testing based purely on the specification. You don't look at the source code inside `my_sqrt`. You test normal cases, **Edge cases** (like zero), and error cases (like negative numbers).
- **Glass-box testing** means testing based on the implementation. If you opened `my_sqrt` and saw `if x < 0: ... else: ...`, glass-box testing dictates you must write at least one test where `x < 0` and one where `x >= 0` to ensure both paths are actually run by your test suite.
- **Boundary values** are inputs exactly at the split point of an `if` statement. If the code says `x > 0`, the boundaries are `0` and `1`. Testing them catches off-by-one errors.


## Concept Unit: `unittest.TestCase` — structured tests

### The Problem

Using plain `assert` statements is fine for a single file, but what if you have 500 tests? When one `assert` fails, the program crashes, and the remaining 499 tests never run. How can we run all tests, isolate failures so they don't crash the runner, and get a neat summary of exactly what passed and what failed?

### Project Change

- **Reference Source:** None
- **Files affected:** `test_math.py` (created)
- **Change type:** add
- **Location:** entire file
- **Dependencies:** the built-in `unittest` module

### The New Code

```python
import unittest

def add(a, b):
    return a + b

class TestAdd(unittest.TestCase):
    def test_positive_numbers(self):
        self.assertEqual(add(2, 3), 5)

    def test_negative_numbers(self):
        self.assertEqual(add(-1, -1), -2)

    def test_mixed(self):
        self.assertEqual(add(-1, 1), 0)

    def test_floats(self):
        self.assertAlmostEqual(add(0.1, 0.2), 0.3, places=5)

if __name__ == '__main__':
    unittest.main()
```

### The Updated Project

```python
# test_math.py
# ← new
import unittest

def add(a, b):
    return a + b

class TestAdd(unittest.TestCase):
    def test_positive_numbers(self):
        self.assertEqual(add(2, 3), 5)

    def test_negative_numbers(self):
        self.assertEqual(add(-1, -1), -2)

    def test_mixed(self):
        self.assertEqual(add(-1, 1), 0)

    def test_floats(self):
        self.assertAlmostEqual(add(0.1, 0.2), 0.3, places=5)

if __name__ == '__main__':
    unittest.main()
```
This is a complete, runnable test script using the standard library testing framework.

### The Concept in Isolation

Let's see what the framework outputs when we run a passing suite.

```python
# Throwaway test run (conceptual output)
```
Output (predicted):
```
....
----------------------------------------------------------------------
Ran 4 tests in 0.001s

OK
```
This is the **`unittest.TestCase`** framework. The output proves that the runner automatically discovered four tests, ran them, counted the time, and reported success without crashing.

### Discarding the Throwaway Code

The throwaway conceptual output is deleted.

### Mechanical Walkthrough

- `import unittest` brings in Python's built-in testing framework.
- `class TestAdd(unittest.TestCase):` defines a new class inheriting from **`unittest.TestCase`**. This inheritance is what gives the class its testing superpowers.
- `def test_positive_numbers(self):` is a test method. The framework automatically discovers and runs any method whose name begins with the exact prefix `test_`.
- `self.assertEqual(add(2, 3), 5)` calls the **`assertEqual`** method inherited from `TestCase`. It checks if `2 + 3` equals `5`.
- `self.assertAlmostEqual(add(0.1, 0.2), 0.3, places=5)` calls **`assertAlmostEqual`**. Because floating-point math is imprecise in binary (0.1 + 0.2 yields 0.30000000000000004), exact equality would fail here. This method checks equality up to 5 decimal places.
- `if __name__ == '__main__':` checks if the script is being run directly.
- `unittest.main()` starts the test runner, which hunts for `TestCase` classes, runs their methods, and prints the summary report.


## Concept Unit: Common assertion methods

### The Problem

If we want to test that `my_sqrt(-1)` properly raises a `ValueError`, how can we do that? We can't use `assertEqual`, because if the function actually raises the error, our test script itself will crash. How do we tell the testing framework to *expect* an exception and mark the test as passing only if the crash occurs?

### Project Change

- **Reference Source:** None
- **Files affected:** `test_math.py` (modified)
- **Change type:** add
- **Location:** inside `TestAdd`
- **Dependencies:** None

### The New Code

```python
    def test_raises_for_negative(self):
        with self.assertRaises(ValueError):
            my_sqrt(-1)
```

### The Updated Project

```python
# test_math.py
import unittest

def my_sqrt(x):
    if x < 0:
        raise ValueError("Cannot be negative")
    return x ** 0.5

class TestAdd(unittest.TestCase):
    # ... earlier tests unchanged
    
    # ← new
    def test_raises_for_negative(self):
        with self.assertRaises(ValueError):
            my_sqrt(-1)

if __name__ == '__main__':
    unittest.main()
```
The test suite now properly handles and expects an exception using a context manager.

### The Concept in Isolation

Let's test an expected exception that *doesn't* happen.

```python
# Throwaway exception test
import unittest
class TempTest(unittest.TestCase):
    def test_fail(self):
        with self.assertRaises(ValueError):
            pass # No exception raised
```
Output (predicted):
```
F
======================================================================
FAIL: test_fail (__main__.TempTest)
----------------------------------------------------------------------
AssertionError: ValueError not raised
```
This is the **`assertRaises`** method. The output proves that if the expected exception is *not* raised, the test fails.

### Discarding the Throwaway Code

The throwaway test class is deleted.

### Mechanical Walkthrough

- `with self.assertRaises(ValueError):` is a context manager. It wraps the block of code directly underneath it.
- **`assertRaises`** intercepts any `ValueError` that bubbles up from the block. If intercepted, it swallows the error and marks the test as passed.
- `my_sqrt(-1)` executes inside the context manager. It throws a `ValueError`, which `assertRaises` catches.
- Other common assertions exist for convenience: **`assertTrue`** and **`assertFalse`** check booleans; **`assertIsNone`** and **`assertIsNotNone`** check for `None`; **`assertIn`** and **`assertNotIn`** check membership in collections. **`assertNotEqual`** verifies two values are different.


## Concept Unit: `setUp` and `tearDown`

### The Problem

Tests must be independent. If `test_deposit` modifies a bank account, and `test_withdraw` runs right after it using the *same* bank account, the withdrawal test might fail because the balance is wrong. How do we guarantee that every single test gets a completely fresh, identical starting state, without copy-pasting the setup code into every test method?

### Project Change

- **Reference Source:** None
- **Files affected:** `test_bank.py` (created)
- **Change type:** add
- **Location:** entire file
- **Dependencies:** `unittest`

### The New Code

```python
class TestBankAccount(unittest.TestCase):
    def setUp(self):
        self.account = BankAccount(initial_balance=100)

    def tearDown(self):
        pass

    def test_initial_balance(self):
        self.assertEqual(self.account.balance, 100)

    def test_deposit(self):
        self.account.deposit(50)
        self.assertEqual(self.account.balance, 150)

    def test_withdraw(self):
        self.account.withdraw(30)
        self.assertEqual(self.account.balance, 70)

    def test_overdraft_raises(self):
        with self.assertRaises(ValueError):
            self.account.withdraw(200)
```

### The Updated Project

```python
# test_bank.py
import unittest

class BankAccount:
    def __init__(self, initial_balance):
        self.balance = initial_balance
    def deposit(self, amount):
        self.balance += amount
    def withdraw(self, amount):
        if amount > self.balance:
            raise ValueError()
        self.balance -= amount

# ← new
class TestBankAccount(unittest.TestCase):
    def setUp(self):
        self.account = BankAccount(initial_balance=100)

    def tearDown(self):
        pass

    def test_initial_balance(self):
        self.assertEqual(self.account.balance, 100)

    def test_deposit(self):
        self.account.deposit(50)
        self.assertEqual(self.account.balance, 150)

    def test_withdraw(self):
        self.account.withdraw(30)
        self.assertEqual(self.account.balance, 70)

    def test_overdraft_raises(self):
        with self.assertRaises(ValueError):
            self.account.withdraw(200)

if __name__ == '__main__':
    unittest.main()
```
The test suite now uses lifecycle hooks to guarantee fresh state for every test.

### The Concept in Isolation

Let's trace exactly when `setUp` runs.

```python
# Throwaway trace
import unittest

class TraceTest(unittest.TestCase):
    def setUp(self):
        print("SETUP")
    def test_one(self):
        print("  test one")
    def test_two(self):
        print("  test two")
```
Output (predicted):
```
SETUP
  test one
.SETUP
  test two
.
```
These are the **`setUp`** and **`tearDown`** hooks. The output proves that `setUp` is executed *before every individual test method*, not just once per class.

### Discarding the Throwaway Code

The trace test is deleted.

### Mechanical Walkthrough

- `def setUp(self):` overrides the **`setUp`** method from the base `TestCase`. The test runner calls this method automatically right before it invokes any `test_` method.
- `self.account = BankAccount(initial_balance=100)` attaches a brand new instance of a bank account to the test class instance. Because `setUp` runs before *each* test, `test_withdraw` gets a fresh account with 100 dollars, completely unaffected by what `test_deposit` did to its own instance.
- `def tearDown(self):` overrides the **`tearDown`** method. It runs automatically *after* every test method completes, even if the test failed or crashed. It is used to close files or database connections.


## Concept Unit: Test-driven development (TDD)

### The Problem

Usually, programmers write a function, then write a test to see if it works. But sometimes writing the function is hard because you don't actually know what the edge cases should do. What if we flipped the order? What if writing the tests *was* the process of designing the function?

### Project Change

- **Reference Source:** None
- **Files affected:** `palindrome.py` (created)
- **Change type:** add
- **Location:** entire file
- **Dependencies:** `unittest`

### The New Code

```python
# Step 1: write the test first
import unittest

class TestPalindrome(unittest.TestCase):
    def test_simple(self):
        self.assertTrue(is_palindrome('racecar'))
        self.assertFalse(is_palindrome('hello'))
    def test_empty(self):
        self.assertTrue(is_palindrome(''))
    def test_single(self):
        self.assertTrue(is_palindrome('a'))
```

### The Updated Project

```python
# palindrome.py
# ← new
import unittest

# The implementation is written AFTER the tests
def is_palindrome(s):
    return s == s[::-1]

class TestPalindrome(unittest.TestCase):
    def test_simple(self):
        self.assertTrue(is_palindrome('racecar'))
        self.assertFalse(is_palindrome('hello'))
    def test_empty(self):
        self.assertTrue(is_palindrome(''))
    def test_single(self):
        self.assertTrue(is_palindrome('a'))

if __name__ == '__main__':
    unittest.main()
```
The tests define exactly how the function should behave before the logic is even written.

### The Concept in Isolation

Imagine running the tests *before* writing the implementation.

```python
# Throwaway missing implementation
import unittest
def is_palindrome(s):
    pass # Not written yet

class TestP(unittest.TestCase):
    def test_p(self):
        self.assertTrue(is_palindrome('racecar'))
```
Output (predicted):
```
F
======================================================================
FAIL: test_p (__main__.TestP)
AssertionError: None is not true
```
This is **Test-driven development (TDD)**. The output proves that step 1 of TDD is running the test and watching it fail, confirming the test is actually checking something.

### Discarding the Throwaway Code

The failing mock is deleted.

### Mechanical Walkthrough

- **Test-driven development (TDD)** is a cycle: write a failing test, write the minimal code to make it pass, and then refactor.
- `def test_empty(self):` was written first. It forced us to decide: is an empty string a palindrome? Yes. By making that decision in the test, we designed the interface before touching the implementation.
- `def is_palindrome(s):` was written last. We just wrote `return s == s[::-1]` to make the tests turn green. The test *is* the specification.


## Concept Unit: Running tests from the command line

### The Problem

We've been putting `unittest.main()` at the bottom of our files. But in a real project with dozens of files inside a `tests/` folder, editing every file to run them manually is impossible. How do we tell Python to find every test in our entire project and run them all at once?

### Project Change

- **Reference Source:** None
- **Files affected:** Terminal / Command Line
- **Change type:** configure
- **Location:** Project root directory
- **Dependencies:** Existing test files

### The New Code

```bash
python -m unittest discover -s tests/
```

### The Updated Project

There is no code change. The project now relies on the command line interface to orchestrate tests.

### The Concept in Isolation

Running a single test file using the module system.

```bash
# Throwaway command
python -m unittest test_math.py
```
Output (predicted):
```
....
----------------------------------------------------------------------
Ran 4 tests in 0.002s
OK
```
This is the command-line interface for the testing framework. The output proves that you can run tests externally without hardcoding `unittest.main()` in your scripts.

### Discarding the Throwaway Code

The throwaway terminal command is complete.

### Mechanical Walkthrough

- `python -m unittest` tells the Python interpreter to execute the built-in `unittest` module as a script.
- `test_math.py` specifies a single file to run.
- You can also run a specific class: `python -m unittest test_math.TestAdd`.
- Passing the `-v` flag (verbose) prints the name of every single test method as it runs: `test_floats (test_math.TestAdd) ... ok`.
- `discover -s tests/` tells the framework to search the `tests/` directory for any file named `test_*.py`, load them all, and run every test it finds. This is how continuous integration servers run tests automatically.

---

Closing: Testing is not optional — it is how you know your code works and how you prevent future changes from breaking old logic. Lesson 17 covers debugging — what to do when tests reveal a failure.

**Exercises:**
- Write a full test suite using `unittest.TestCase` for the `count_words` function from Lesson 9. Test a normal sentence, an empty string, a single word, and repeated words.
- Practice TDD by writing tests for `merge_sorted` (a function that merges two sorted lists into one sorted list) *before* writing the implementation.
