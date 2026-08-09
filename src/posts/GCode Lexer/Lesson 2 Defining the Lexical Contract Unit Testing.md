# Lesson 2: Defining the Lexical Contract (Unit Testing)

**What you will build:** We will build an automated test suite using `pytest` to mathematically verify that our lexer correctly processes machine code without regressions. The working feature is a script that runs automatically and reports passes/fails. The transferable problem this lesson is actually about is establishing a strict behavioral contract at a system boundary before building the downstream consumers (the parser).

**What you need to know first:** Lesson 1 (Pattern Matching and Tokenization).

**Pipeline diagram:** `Text → [Lexer] → Parser → AST → Semantic Analysis`. This lesson tests only the `[Lexer]` stage. The literal text `"G01 X10.0"` must deterministically become the token list `[('G', 1.0), ('X', 10.0)]` under automated scrutiny before we ever permit the Parser stage to consume it.

---

## Concept Unit: The Test Assertion

### The Problem

We need a programmatic way to fail the build if `lex_block` ever stops returning the exact tuple list we expect, rather than relying on printing to the console and manually eyeballing the output.

### Introduce the concept in isolation

```python
expected = 5
actual = 2 + 3
assert actual == expected
print("Assertion passed.")

```

**Output:** `Assertion passed.`

This proves that the `assert` keyword evaluates an expression and silently continues execution if true. If it were false, the program would instantly halt and throw an `AssertionError`. This is called an **assertion**.

### Discard the throwaway example

The throwaway example is deleted and will not appear in the project again. It serves only to prove the equality-checking mechanism that our test framework relies on.

### Project Change

* **Reference Source:** No reference counterpart — this is a from-scratch addition because we are establishing the initial testing architecture.
* **Files affected:** Created `tests/test_lexer.py`.
* **Change type:** Add.
* **Location:** Brand new file in a new `tests/` directory at the project root. Keeping `tests/` entirely separate from `src/` prevents testing tools from drifting into the production bundle.
* **Dependencies:** `pytest` framework.

### The New Code

```python
from src.parser.lexer import lex_block

def test_lex_basic_linear_move():
    tokens = lex_block("G01 X10.5 Y-5.0")
    assert tokens == [('G', 1.0), ('X', 10.5), ('Y', -5.0)]

```

### The Updated Project

```python
# tests/test_lexer.py
# ← new
from src.parser.lexer import lex_block

def test_lex_basic_linear_move():
    tokens = lex_block("G01 X10.5 Y-5.0")
    assert tokens == [('G', 1.0), ('X', 10.5), ('Y', -5.0)]

```

This file now defines a single test case that imports our existing lexer and asserts its output against a hardcoded, known-good list of tokens.

### Mechanical walkthrough

1. `from src.parser.lexer import lex_block`: First appearance. Imports the function we wrote in Lesson 1 into this test file's namespace.
2. `def test_lex_basic_linear_move():`: First appearance of a `test_` prefixed function. `pytest` uses reflection to automatically find and run any function starting with this prefix.
3. `tokens = lex_block("G01 X10.5 Y-5.0")`: Already established syntax.
4. `assert tokens == [('G', 1.0), ('X', 10.5), ('Y', -5.0)]`: Hard concept reappearing — **assertion**. Evaluates strict equality between the generated tokens and our known-good state, failing the test runner if they diverge.

### CS Lens

This embodies **Unit Testing**.
Also recognized in: hardware-in-the-loop testing for automated manufacturing cells, continuous integration pipelines, contract-driven web development, and formal verification systems.

### SE Lens

The design principle here is **Test-Driven / Contract-Driven Behavior**. The alternative not chosen was running manual MDI (Manual Data Input) style tests by typing strings into a CLI and reading the output. The tradeoff is writing twice as much code up front. The failure cost of the alternative is that as you scale up to add Okuma dialects or complex wait-code synchronizations, you will inevitably break your baseline parsing logic without realizing it until it hits production.

### Commands needed to make this unit real

* `pip install pytest`: Installs the testing framework into your Python environment.
* `mkdir tests`: Creates the test directory at the root level (alongside `src/`).
* `touch tests/test_lexer.py`: Creates the new test file.

### Run it. Show the real output.

Run `pytest tests/test_lexer.py` in your terminal.
**Output:**

```
================ test session starts ================
collected 1 item

tests/test_lexer.py .                          [100%]

================= 1 passed in 0.01s =================

```

### Connection

We now have a mathematical proof that our text-to-token pipeline works for basic linear moves, but writing a new function for every single possible block variation would lead to massive duplication.

---

## Concept Unit: Parameterized Testing

### The Problem

Writing a separate test function for every possible edge case (rapid moves, dwells, negative coordinates) leads to bloated, unmaintainable test files. We need a way to feed multiple inputs and expected outputs through a single test logic block.

### Introduce the concept in isolation

```python
import pytest

@pytest.mark.parametrize("input_val, expected", [
    (2, 4),
    (3, 9)
])
def test_square(input_val, expected):
    assert input_val * input_val == expected

```

*(When run via `pytest`, this outputs `2 passed in 0.01s`)*

This proves that a single test function can be executed multiple times with different data sets injected dynamically into its arguments. This is called a **parameterized test**.

### Discard the throwaway example

Deleted and will not appear again.

### Project Change

* **Reference Source:** No reference counterpart.
* **Files affected:** Modified `tests/test_lexer.py`.
* **Change type:** Add.
* **Location:** At the top (for the import) and appended to the bottom of the file.
* **Dependencies:** `pytest`.

### The New Code

```python
@pytest.mark.parametrize("block, expected_tokens", [
    ("M03 S1500", [('M', 3.0), ('S', 1500.0)]),
    ("G04 X2.0", [('G', 4.0), ('X', 2.0)]),
    ("X-0.005", [('X', -0.005)])
])
def test_lex_various_blocks(block, expected_tokens):
    assert lex_block(block) == expected_tokens

```

### The Updated Project

```python
# tests/test_lexer.py
import pytest  # ← new
from src.parser.lexer import lex_block

def test_lex_basic_linear_move():
    tokens = lex_block("G01 X10.5 Y-5.0")
    assert tokens == [('G', 1.0), ('X', 10.5), ('Y', -5.0)]

# ← new (from here down)
@pytest.mark.parametrize("block, expected_tokens", [
    ("M03 S1500", [('M', 3.0), ('S', 1500.0)]),
    ("G04 X2.0", [('G', 4.0), ('X', 2.0)]),
    ("X-0.005", [('X', -0.005)])
])
def test_lex_various_blocks(block, expected_tokens):
    assert lex_block(block) == expected_tokens

```

The test file now leverages a framework decorator to run three distinct parsing scenarios through the lexer without duplicating the actual assertion code.

### Mechanical walkthrough

1. `import pytest`: First appearance. Imports the testing framework itself to access its decorators.
2. `@pytest.mark.parametrize`: First appearance. A decorator that intercepts the function below it and tells the `pytest` runner to generate multiple distinct tests from the provided list.
3. `"block, expected_tokens"`: First appearance. A comma-separated string mapping the tuple values below directly to the argument names in the function definition.
4. `("M03 S1500", [('M', 3.0), ('S', 1500.0)])`: Already established syntax. A tuple containing `(input string, expected list of tuples)`.
5. `def test_lex_various_blocks(block, expected_tokens):`: First appearance of parameterized arguments in a test function. `pytest` automatically injects the data here.
6. `assert lex_block(block) == expected_tokens`: Already established syntax.

**Execution trace:** (Timing/Control flow)

1. `pytest` parses the file and sees the `@pytest.mark.parametrize` decorator.
2. `pytest` dynamically generates three completely separate test cases in memory before running anything.
3. `test_lex_various_blocks` is invoked the first time by the framework, injecting `block = "M03 S1500"`.
4. `test_lex_various_blocks` is invoked a second time, injecting `block = "G04 X2.0"`.

### CS Lens

This embodies **Data-Driven Execution**.
Also recognized in: database query planners executing over varying recordsets, rendering pipelines running identical shader logic over multiple vertices, and CNC macro loops running the same repetitive cycle over an array of variables.

### SE Lens

The design principle is **DRY (Don't Repeat Yourself)** applied to testing. The alternative not chosen was writing `test_spindle_start`, `test_dwell`, and `test_negative_decimal` as three separate blocks. The tradeoff is that a failure inside a massive parameterized block can occasionally be harder to quickly read in the console if the input data strings are huge. The maintenance cost of the alternative is test suite bloat that actively discourages developers from adding new edge cases when they find a bug.

### Commands needed to make this unit real

No new commands; `pytest` is already installed.

### Run it. Show the real output.

Run `pytest -v tests/test_lexer.py` (the `-v` flag increases verbosity so we can see the individual parameterized runs).
**Output:**

```
test_lexer.py::test_lex_basic_linear_move PASSED
test_lexer.py::test_lex_various_blocks[M03 S1500-expected_tokens0] PASSED
test_lexer.py::test_lex_various_blocks[G04 X2.0-expected_tokens1] PASSED
test_lexer.py::test_lex_various_blocks[X-0.005-expected_tokens2] PASSED

```

### Connection

We've shifted from testing a single happy path to establishing a matrix of machine behaviors that the lexer is contractually obligated to support.

---

## Closing

* **Connect the pieces:** The raw string `"X-0.005"` was injected into the test function by the parameterize decorator, passed through our `lex_block` regex engine, and mathematically asserted against `[('X', -0.005)]` entirely automatically.
* **What breaks without this:** If you misspell `expected_tokens` inside the decorator string (e.g., `expected_token`), `pytest` will crash before running any tests, throwing a `ValueError` because the decorator arguments no longer align with the function signature.
* **Exercises:** Add a new tuple to the parameter list to test a line containing macro variable assignment, like `"#100=1.5"`. Note that the lexer will currently fail this test because `#` and `=` are not accounted for in our `[A-Z]` regex pattern.
* **Definition of done:**
* [x] Test directory established and isolated from `src/`.
* [x] `tests/test_lexer.py` executing parameterized assertions.
* `git commit -m "Implement automated boundary testing and parametrization for the lexical analyzer"`



---
