# Lesson 16: Testing — assert and unittest

What you will build: The reader understands Python's testing tools: the assert statement for inline checks, unittest.TestCase for structured test suites, how to test for expected exceptions, and the basics of test-driven development (TDD). The transferable insight: a test is executable documentation. It says 'given this input, expect this output.' Any function without tests is unverified. Writing tests before code (TDD) forces you to think about the interface before the implementation.

What you need to know first: Lessons 00-15.

## Terms used in this lesson
- **assert statement** — A built-in language construct used for inline correctness checks. It evaluates a condition and raises an error if the condition is false. It exists to declare invariants that must always be true during normal execution.
- **AssertionError** — The built-in exception raised when an `assert` statement fails. It exists to violently crash the program with a traceback rather than proceeding with invalid state.
- **Test suite** — A collection of test cases grouped together for execution. It exists to verify a module or system as a whole.
- **Test-driven development (TDD)** — A software engineering practice where tests are written before the implementation code. It exists to force developers to design the interface and edge cases before getting bogged down in implementation details.
- **Context manager** — A construct that sets up and tears down resources automatically, often used with the `with` statement. Here, it is used to capture exceptions within a specific block of code.

## Objects and methods used

- **`unittest.TestCase`**
  - *What it is:* A base class provided by Python's standard library for creating unit tests.
  - *Implementation:* `class unittest.TestCase`
  - *Its use:* Subclassed to group related test methods and provide them with testing primitives.
  - *Type:* Base class.
  - *Responsibility:* Provides the execution context, setup/teardown hooks, and assertion methods necessary for individual tests.
  - *Depends on:* Standard library `unittest` module.
  - *Connects to:* The test runner which instantiates it and invokes its `test_*` methods.
  - *Shape:* A framework boundary; application tests inherit from it to plug into the test runner.

- **`unittest.main`**
  - *What it is:* The command-line entry point for the test framework.
  - *Implementation:* `def main(module='__main__', ...)`
  - *Its use:* Automatically discovers and runs all test cases defined in the current file.
  - *Type:* Function.
  - *Responsibility:* Discovers, loads, and executes tests, then reports the results to the console.
  - *Depends on:* The presence of `TestCase` subclasses in the module.
  - *Connects to:* All defined test classes in the script.
  - *Shape:* Application entry point.

- **`TestCase.assertEqual`**
  - *What it is:* An assertion method to check if two values are equal.
  - *Implementation:* `def assertEqual(self, first, second, msg=None)`
  - *Its use:* Verifying that a function's actual output matches the expected output.
  - *Type:* Instance method.
  - *Responsibility:* Fails the current test (raising a test failure exception) if `first != second`.
  - *Depends on:* The objects implementing `__eq__`.
  - *Connects to:* The test runner's failure reporting mechanism.
  - *Shape:* Internal test validation logic.

- **`TestCase.assertRaises`**
  - *What it is:* An assertion method and context manager to check if a specific exception is raised.
  - *Implementation:* `def assertRaises(self, expected_exception, *args, **kwargs)`
  - *Its use:* Verifying that a function correctly rejects invalid input.
  - *Type:* Instance method / Context manager.
  - *Responsibility:* Catches the specified exception and passes the test if it occurs, or fails the test if it does not.
  - *Depends on:* The code block inside the `with` statement.
  - *Connects to:* The test runner's reporting mechanism.
  - *Shape:* Internal test validation logic.

- **`TestCase.setUp`**
  - *What it is:* A hook method run before each test.
  - *Implementation:* `def setUp(self)`
  - *Its use:* Creating fresh, shared test fixtures (like a new `BankAccount` instance) before a test runs.
  - *Type:* Instance method.
  - *Responsibility:* Initializes state required by the test methods.
  - *Depends on:* Nothing explicitly.
  - *Connects to:* The test methods that read the state it prepares.
  - *Shape:* Test lifecycle hook.

- **`TestCase.tearDown`**
  - *What it is:* A hook method run after each test.
  - *Implementation:* `def tearDown(self)`
  - *Its use:* Cleaning up resources created by `setUp` or the test itself.
  - *Type:* Instance method.
  - *Responsibility:* Ensures side effects from one test do not leak into another.
  - *Depends on:* The state created during `setUp` or test execution.
  - *Connects to:* External resources that require explicit closure.
  - *Shape:* Test lifecycle hook.

- **`ValueError`**
  - *What it is:* A built-in exception raised when a function receives an argument of the correct type but an inappropriate value.
  - *Implementation:* `class ValueError(Exception)`
  - *Its use:* Raised manually in production code to signal invalid domain logic (e.g., negative age).
  - *Type:* Exception class.
  - *Responsibility:* Aborts current execution path and propagates error information up the call stack.
  - *Depends on:* The specific error message provided during instantiation.
  - *Connects to:* Any `try/except` blocks or test frameworks catching it.
  - *Shape:* Control flow interruption.


## Concept Unit: assert — inline correctness checks

### The Problem
How do you guarantee that a function's inputs meet strict requirements before it attempts to do its work? If a division function is handed a zero divisor, what should it do? Should it silently return a dummy value, or violently halt the program to prevent corrupt data from propagating further?

### Introduce the concept in isolation
```python
def check_positive(number):
    assert number > 0, 'Number must be strictly positive'
    return number
```
If we call `check_positive(-5)`, the output is an `AssertionError: Number must be strictly positive`. This proves that the **assert statement** actively guards the execution flow, halting the program if its condition evaluates to `False`.

### Discard the throwaway
This throwaway example is explicitly deleted and will not appear in the project again.

### Project Change
- **Reference Source:** None — this is a from-scratch addition because we are demonstrating fundamental test tooling.
- **Files affected:** `calculator.py` (created)
- **Change type:** Add
- **Location:** New file.
- **Dependencies:** None.

### The New Code
```python
def divide(a, b):
    assert b != 0, 'Divisor cannot be zero'
    return a / b
```

### The Updated Project
```python
1: def divide(a, b):
2:     assert b != 0, 'Divisor cannot be zero' # <- new
3:     return a / b
```
The `divide` function now protects itself from a zero divisor by explicitly asserting that `b` is not zero before attempting the arithmetic operation.

### Mechanical walkthrough
- `def divide(a, b):` declares the function.
- `assert` is a built-in Python keyword that initiates the check.
- `b != 0` is the boolean condition evaluated. If it is `True`, execution continues normally.
- `,` separates the condition from the optional error message.
- `'Divisor cannot be zero'` is the string message that will be attached to the `AssertionError` if the condition fails.
- `return a / b` performs the final logic.

### CS lens
This is the computer science concept of a **precondition invariant**. By establishing a known valid state before proceeding, we simplify the downstream logic. This appears in database constraints (rejecting negative account balances), network protocols (validating packet checksums before parsing), and compiler design (verifying syntax trees before semantic analysis).

### SE lens
Using `assert` is a design principle of **fail-fast**. The alternative not chosen is silently returning `None` or `0`, which would mask the error and cause unpredictable bugs later in the program. The tradeoff is that `assert` statements can be disabled globally with Python's `-O` (optimized) flag, meaning they should be used for internal invariants, not for validating user input in a production system.

### Commands needed
None for this unit.

### Run it
Predicted confidently: Calling `divide(10, 2)` returns `5.0`. Calling `divide(10, 0)` raises `AssertionError: Divisor cannot be zero`.

### One sentence connecting to previous unit
While inline checks prevent bad states during execution, we need an automated way to prove our code works without manually running it every time.

## Concept Unit: unittest.TestCase — structured tests

### The Problem
How can we automate the verification of our functions? If we just write a script with a dozen `print` statements, we have to manually read the console output to verify if the answers are correct. How do we create self-verifying code that explicitly reports failures without human intervention?

### Introduce the concept in isolation
```python
import unittest

class DummyTest(unittest.TestCase):
    def test_truth(self):
        self.assertEqual(1, 1)

if __name__ == '__main__':
    unittest.main()
```
This proves that subclassing **`unittest.TestCase`** and invoking **`unittest.main()`** allows the framework to automatically discover, run, and summarize methods that start with `test_`.

### Discard the throwaway
This throwaway code is explicitly discarded and will not be added to the project.

### Project Change
- **Reference Source:** None.
- **Files affected:** `test_calculator.py` (created)
- **Change type:** Add
- **Location:** New file.
- **Dependencies:** The `divide` function we wrote earlier, though we will first test a simple `add` function to demonstrate the framework.

### The New Code
```python
import unittest

def add(a, b):
    return a + b

class TestAdd(unittest.TestCase):
    def test_positive(self):
        self.assertEqual(add(2, 3), 5)

    def test_negative(self):
        self.assertEqual(add(-1, -1), -2)

    def test_zero(self):
        self.assertEqual(add(0, 0), 0)

    def test_mixed(self):
        self.assertEqual(add(-3, 3), 0)

if __name__ == '__main__':
    unittest.main()
```

### The Updated Project
```python
1:  import unittest
2:
3:  def add(a, b):
4:      return a + b
5:
6:  class TestAdd(unittest.TestCase): # <- new
7:      def test_positive(self):
8:          self.assertEqual(add(2, 3), 5)
9:
10:     def test_negative(self):
11:         self.assertEqual(add(-1, -1), -2)
12:
13:     def test_zero(self):
14:         self.assertEqual(add(0, 0), 0)
15:
16:     def test_mixed(self):
17:         self.assertEqual(add(-3, 3), 0)
18:
19: if __name__ == '__main__':
20:     unittest.main()
```
We now have a complete, runnable test script that defines a simple function and systematically verifies its behavior under various conditions.

### Mechanical walkthrough
- `import unittest` brings the standard testing framework into scope.
- `def add(a, b):` creates our subject under test.
- `class TestAdd(unittest.TestCase):` defines a new class that inherits all testing infrastructure from the framework.
- `def test_positive(self):` defines a single test scenario. The `test_` prefix is strictly required for the runner to discover it.
- `self.assertEqual(add(2, 3), 5)` calls the `add` function and uses the framework's assertion method to ensure the result is exactly `5`.
- `if __name__ == '__main__':` ensures the runner only executes if the script is run directly, not if it is imported.
- `unittest.main()` triggers the framework to discover all `TestCase` subclasses and execute their test methods.

### CS lens
This demonstrates **automated test discovery** and the **Command pattern**. The framework scans for methods matching a specific naming convention and executes them as independent commands, trapping exceptions to report failures without crashing the overall runner. This appears in build systems, CI/CD pipelines, and task runners like Make.

### SE lens
This is the foundation of **Test-Driven Development (TDD)**. By explicitly defining the expected outputs for various inputs, the test acts as executable documentation. The alternative not chosen is relying solely on manual ad-hoc testing in the REPL, which is error-prone, non-repeatable, and easily lost.

### Commands needed
`python3 test_calculator.py`

### Run it
Predicted confidently: The framework will discover 4 tests, run them, and output `....` followed by `OK`.

### One sentence connecting to previous unit
Now that we have a structured way to run tests, we can expand our vocabulary of assertions to check more than just simple equality.

## Concept Unit: Assertion methods — the full toolkit

### The Problem
What if you need to check if an item exists in a list, or if a variable is `None`, or if a computed float is *close enough* to an expected value? If we only use `assertEqual`, our test code becomes cluttered with manual type and condition checks.

### Introduce the concept in isolation
```python
import unittest

class AssortedTests(unittest.TestCase):
    def test_various(self):
        self.assertTrue(5 > 2)
        self.assertIsNone(None)
        self.assertIn('x', ['a', 'x', 'z'])
```
This proves that the `unittest.TestCase` base class provides a wide variety of specialized assertion methods that handle type checking, truthiness, and membership directly, producing clearer failure messages when they fail.

### Discard the throwaway
This throwaway example is explicitly discarded and will not be used in the project.

### Project Change
- **Reference Source:** None.
- **Files affected:** `test_calculator.py`
- **Change type:** Add
- **Location:** At the bottom of `test_calculator.py`, before the `if __name__` block.
- **Dependencies:** `unittest` must be imported.

### The New Code
```python
class TestMethods(unittest.TestCase):
    def test_equality(self):
        self.assertEqual(1 + 1, 2)
        self.assertNotEqual(1, 2)

    def test_truth(self):
        self.assertTrue(3 > 2)
        self.assertFalse(2 > 3)

    def test_membership(self):
        self.assertIn(3, [1, 2, 3])
        self.assertNotIn(4, [1, 2, 3])

    def test_none(self):
        self.assertIsNone(None)
        self.assertIsNotNone(42)

    def test_types(self):
        self.assertIsInstance(42, int)
        self.assertAlmostEqual(0.1+0.2, 0.3, places=10)
```

### The Updated Project
```python
1:  # ... (previous TestAdd class)
2:
3:  class TestMethods(unittest.TestCase): # <- new
4:      def test_equality(self):
5:          self.assertEqual(1 + 1, 2)
6:          self.assertNotEqual(1, 2)
7:
8:      def test_truth(self):
9:          self.assertTrue(3 > 2)
10:         self.assertFalse(2 > 3)
11:
12:     def test_membership(self):
13:         self.assertIn(3, [1, 2, 3])
14:         self.assertNotIn(4, [1, 2, 3])
15:
16:     def test_none(self):
17:         self.assertIsNone(None)
18:         self.assertIsNotNone(42)
19:
20:     def test_types(self):
21:         self.assertIsInstance(42, int)
22:         self.assertAlmostEqual(0.1+0.2, 0.3, places=10)
23:
24: if __name__ == '__main__':
25:     unittest.main()
```
We have added a comprehensive suite demonstrating the most common specialized assertions provided by the `unittest` framework.

### Mechanical walkthrough
- `self.assertNotEqual` ensures two values are different.
- `self.assertTrue` / `self.assertFalse` evaluates the boolean truthiness of the argument.
- `self.assertIn` checks if the first argument exists within the second argument (which must be an iterable).
- `self.assertNotIn` checks the reverse, ensuring an item is absent.
- `self.assertIsNone` explicitly checks for object identity with the `None` singleton, which is safer than equality checking.
- `self.assertIsNotNone` verifies the object is something other than `None`.
- `self.assertIsInstance` checks if the first argument is an instance of the class provided in the second argument.
- `self.assertAlmostEqual` compares floats to a specified number of decimal places, mitigating floating-point precision issues.

### CS lens
These specialized methods represent **Domain-Specific Language (DSL)** primitives for testing. By providing named methods for common logical operations, the framework reduces boilerplate and standardizes how failures are expressed. This appears in query builders (like SQL ORMs), configuration management tools, and behavior-driven development (BDD) frameworks.

### SE lens
The design principle here is **Expressiveness and Diagnostic Quality**. An alternative would be writing `self.assertTrue(a in b)`. However, if that fails, the framework only reports `False is not True`. By using `self.assertIn(a, b)`, the framework reports `Item 'a' not found in collection 'b'`, drastically reducing debugging time.

### Commands needed
`python3 test_calculator.py`

### Run it
Predicted confidently: The runner will discover all test methods across all classes and report `.........` followed by `OK`.

### One sentence connecting to previous unit
While we can now assert that outputs are correct, we must also be able to assert that our code correctly handles and rejects invalid inputs.

## Concept Unit: Testing for expected exceptions

### The Problem
If a function is designed to raise a `ValueError` when given bad data, how do we write a test for it? If we just call the function, the exception will crash the test and cause a failure. How do we tell the test runner that the exception *is* the expected correct behavior?

### Introduce the concept in isolation
```python
import unittest

def throw_error():
    raise ValueError("Boom")

class ExceptionTest(unittest.TestCase):
    def test_boom(self):
        with self.assertRaises(ValueError):
            throw_error()
```
This proves that the **context manager** created by `self.assertRaises` intercepts the specified exception. If `throw_error()` raises a `ValueError`, the context manager catches it, preventing the test from crashing, and allows the test to pass.

### Discard the throwaway
This throwaway code is explicitly deleted and will not be added to the project.

### Project Change
- **Reference Source:** None.
- **Files affected:** `test_calculator.py`
- **Change type:** Add
- **Location:** Below `TestMethods`, above the `if __name__` block.
- **Dependencies:** `unittest` and a function that explicitly raises an error.

### The New Code
```python
def parse_age(s):
    age = int(s)
    if age < 0:
        raise ValueError(f'Age cannot be negative: {age}')
    return age

class TestParseAge(unittest.TestCase):
    def test_valid(self):
        self.assertEqual(parse_age('25'), 25)

    def test_not_a_number(self):
        with self.assertRaises(ValueError):
            parse_age('abc')

    def test_negative(self):
        with self.assertRaises(ValueError) as ctx:
            parse_age('-5')
        self.assertIn('negative', str(ctx.exception))
```

### The Updated Project
```python
1:  # ... (previous test classes)
2:
3:  def parse_age(s): # <- new
4:      age = int(s)
5:      if age < 0:
6:          raise ValueError(f'Age cannot be negative: {age}')
7:      return age
8:
9:  class TestParseAge(unittest.TestCase): # <- new
10:     def test_valid(self):
11:         self.assertEqual(parse_age('25'), 25)
12:
13:     def test_not_a_number(self):
14:         with self.assertRaises(ValueError):
15:             parse_age('abc')
16:
17:     def test_negative(self):
18:         with self.assertRaises(ValueError) as ctx:
19:             parse_age('-5')
20:         self.assertIn('negative', str(ctx.exception))
21:
22: if __name__ == '__main__':
23:     unittest.main()
```
We have introduced a function that enforces domain rules using exceptions, and a test suite that explicitly verifies those exceptions are raised when expected.

### Mechanical walkthrough
- `def parse_age(s):` attempts to cast a string to an integer.
- `raise ValueError(...)` deliberately aborts execution if the age is semantically invalid.
- `with self.assertRaises(ValueError):` establishes a context manager that expects a `ValueError` to be raised by the code inside the block.
- `parse_age('abc')` triggers the exception because `int('abc')` fails.
- `as ctx:` binds the caught exception object to the variable `ctx` so we can inspect it after the block finishes.
- `str(ctx.exception)` extracts the actual error message string.
- `self.assertIn('negative', ...)` ensures the error message contains the expected explanatory text, proving the correct validation logic was triggered.

### CS lens
This highlights **control flow interception**. By wrapping execution in a designated boundary (the context manager), the test framework temporarily alters how the runtime handles fatal errors, capturing them for inspection instead of unwinding the stack to the top. This appears in transaction rollbacks, middleware error handlers, and debugger trace hooks.

### SE lens
This reinforces **Defensive Programming**. Testing for expected failures ensures that boundaries remain solid. The alternative not chosen is catching generic `Exception` types, which is dangerous because it could mask unrelated errors (like a typo in a variable name). By asserting a specific exception (`ValueError`), we ensure the function failed for the *exact reason* we anticipated.

### Commands needed
`python3 test_calculator.py`

### Run it
Predicted confidently: The tests pass. If `parse_age('abc')` miraculously succeeded, `assertRaises` would fail the test for missing the expected exception.

### One sentence connecting to previous unit
As our test suites grow, we often find ourselves writing the same setup logic (like creating objects or connecting to databases) in every single test method.

## Concept Unit: setUp, tearDown, and test organization

### The Problem
If ten tests all require a properly initialized `BankAccount` object to run, copying the instantiation code into every method is repetitive and fragile. How can we instruct the testing framework to automatically prepare a clean state before each test runs?

### Introduce the concept in isolation
```python
import unittest

class SetupDemo(unittest.TestCase):
    def setUp(self):
        print("-> Setting up")
        self.value = 42

    def test_one(self):
        print(f"Test one sees: {self.value}")

    def test_two(self):
        print(f"Test two sees: {self.value}")
```
If we ran this, we would see `-> Setting up` printed twice — exactly once before `test_one`, and once before `test_two`. This proves that **`setUp`** runs automatically as a precursor hook for every individual test method in the class.

### Discard the throwaway
This throwaway code is explicitly deleted and will not be kept in the project.

### Project Change
- **Reference Source:** None.
- **Files affected:** `test_bank.py` (created)
- **Change type:** Add
- **Location:** New file.
- **Dependencies:** `unittest`

### The New Code
```python
import unittest

class BankAccount:
    def __init__(self, balance):
        self.balance = balance

    def deposit(self, amount):
        self.balance += amount

    def withdraw(self, amount):
        if amount > self.balance:
            raise ValueError("Overdraft")
        self.balance -= amount

class TestBankAccount(unittest.TestCase):
    def setUp(self):
        self.account = BankAccount(1000)

    def tearDown(self):
        pass

    def test_deposit(self):
        self.account.deposit(500)
        self.assertEqual(self.account.balance, 1500)

    def test_withdraw_valid(self):
        self.account.withdraw(200)
        self.assertEqual(self.account.balance, 800)

    def test_withdraw_overdraft(self):
        with self.assertRaises(ValueError):
            self.account.withdraw(2000)
```

### The Updated Project
```python
1:  import unittest
2:
3:  class BankAccount: # <- new
4:      def __init__(self, balance):
5:          self.balance = balance
6:
7:      def deposit(self, amount):
8:          self.balance += amount
9:
10:     def withdraw(self, amount):
11:         if amount > self.balance:
12:             raise ValueError("Overdraft")
13:         self.balance -= amount
14:
15: class TestBankAccount(unittest.TestCase): # <- new
16:     def setUp(self):
17:         self.account = BankAccount(1000)
18:
19:     def tearDown(self):
20:         pass
21:
22:     def test_deposit(self):
23:         self.account.deposit(500)
24:         self.assertEqual(self.account.balance, 1500)
25:
26:     def test_withdraw_valid(self):
27:         self.account.withdraw(200)
28:         self.assertEqual(self.account.balance, 800)
29:
30:     def test_withdraw_overdraft(self):
31:         with self.assertRaises(ValueError):
32:             self.account.withdraw(2000)
33:
34: if __name__ == '__main__':
35:     unittest.main()
```
We have built a stateful object and a test suite that automatically injects a fresh, independent instance of that object into each test method.

### Mechanical walkthrough
- `class BankAccount:` defines a mutable object holding a `balance`.
- `def setUp(self):` overrides the framework's empty setup hook. The test runner calls this explicitly before every `test_` method.
- `self.account = BankAccount(1000)` creates a fresh instance and binds it to the test case instance so the test methods can access it via `self.account`.
- `def tearDown(self):` overrides the framework's cleanup hook. It runs after every test, regardless of success or failure. Here it is a `pass`, but is useful for closing files or network connections.
- `test_deposit` runs, and `self.account.deposit(500)` mutates the shared instance.
- Because `setUp` runs again before `test_withdraw_valid`, that mutation is wiped clean, ensuring tests do not influence each other.

### CS lens
This relies on **Lifecycle Hooks** and **Test Isolation**. The framework dictates the order of operations (`setUp` -> `test_*` -> `tearDown`), allowing developers to inject custom logic at specific stages of execution. This is identical in concept to React's `useEffect`, web framework middleware, and database transaction triggers.

### SE lens
This enforces **State Isolation**. The alternative not chosen is instantiating the account globally outside the class. If tests shared the same instance, `test_deposit` mutating the balance would cause `test_withdraw_valid` to fail because the starting balance would be wrong. Global test state leads to flaky, order-dependent tests that are notoriously difficult to debug.

### Commands needed
`python3 -m unittest test_bank.py`

### Run it
Predicted confidently: The three tests run and pass. `setUp` is executed exactly three times, guaranteeing each test operates on an account with exactly `1000`.

### One sentence connecting to previous unit
With setup hooks, exceptions, and assertion methods mastered, we now have a complete framework for writing rigorous, reproducible automated tests.

## Closing
### Connect the pieces
Testing is how we prove that code behaves identically to the mental model in our heads. Writing a robust system requires utilizing all of these tools in concert. 

Imagine writing a `safe_divide(a, b)` function. First, you use an **`assert` statement** to explicitly declare the preconditions. Next, you subclass **`unittest.TestCase`** to build a structured suite around the function. You use `assertEqual` to verify the normal case (`10 / 2 = 5`). But you must also prove the failure path, so you use `assertRaises(ValueError)` wrapped in a context manager to ensure `safe_divide(10, 0)` fails exactly the way you intend, rather than crashing the program unexpectedly. By writing these tests, you are creating an executable contract: anyone modifying `safe_divide` in the future will know instantly if they broke its intended behavior because the test runner will loudly catch them.
