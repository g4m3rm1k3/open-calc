# Lesson 3: Deferred Execution and System Traceability

**What you will build:** We are going to upgrade our lexical boundary to understand advanced macro variables, build a pipeline that streams data to downstream projects (like a backplotter) without crashing system memory, and implement a production-grade diagnostic logger. The working feature is parsing named variables like `[#_ALM]` and yielding them lazily. The transferable problem is handling massive datasets efficiently while gaining programmatic visibility into invisible system states.

**What you need to know first:** Lesson 1 (Pattern Matching and Tokenization), Lesson 2 (Unit Testing).

**Pipeline diagram:** `Text → [Lexer] → Parser → AST → Semantic Analysis`. This lesson heavily optimizes the `[Lexer]` stage. The literal text `"G01 [#_ALM]"` enters, is matched by an expanded grammar, and lazily streams `[('G', 1.0), ('[#_ALM]', None)]` to the Parser only when the Parser explicitly requests the next coordinate.

---

## Concept Unit: Lexing Extended System Variables

### The Problem

Raw Fanuc allows system variables like `[#_ALM]` and macro variables like `#100=1.5`. Our current regex `([A-Z])` strictly expects a single letter, meaning advanced macro logic is currently invisible to our parser and will be silently dropped, leading to incorrect state evaluation.

### Project Change

* **Reference Source:** No reference counterpart — this establishes the grammar rules for the parser boundary.
* **Files affected:** Modified `src/parser/lexer.py`. Strict project file structure tracking is maintained here to prevent environment drift before we hook into a separate backplotter module.
* **Change type:** Refactor.
* **Location:** Inside `lex_block`, completely replacing the `pattern` definition and the evaluation loop.
* **Dependencies:** None.

### The New Code

```python
        pattern = r'(\[#_[A-Z0-9_]+\]|#\d+|[A-Z])(=)?([-+]?\d*\.?\d+)?'
        matches = re.findall(pattern, block_text.upper())
        
        for address, equals_sign, value in matches:
            if value != '':
                tokens.append((address, float(value)))
            else:
                tokens.append((address, None))

```

### The Updated Project

```python
# src/parser/lexer.py
import re

# ← new (replacement of the function body)
def lex_block(block_text):
    tokens = []
    pattern = r'(\[#_[A-Z0-9_]+\]|#\d+|[A-Z])(=)?([-+]?\d*\.?\d+)?'
    matches = re.findall(pattern, block_text.upper())
    
    for address, equals_sign, value in matches:
        if value != '':
            tokens.append((address, float(value)))
        else:
            tokens.append((address, None))
            
    return tokens

```

This structure now evaluates strings containing brackets and hashes, separating the assignment operator so we can track variables that are merely being read rather than set.

### Introduce the concept in isolation

To understand how we can match entirely different shapes of text in the same pass, we isolate the new regex operator.

```python
import re
test_string = "G01 [#_ALM]"
isolated_pattern = r'(\[#_[A-Z]+\]|[A-Z])'
result = re.findall(isolated_pattern, test_string)
print(result)

```

**Output:** `['G', '[#_ALM]']`

This proves that the engine can be told to look for a highly specific bracketed sequence on the left, and if it fails, fall back to looking for a single letter on the right. This is called **regex alternation**, represented by the pipe `|` character.

### Discard the throwaway example

The throwaway example is deleted and will not appear in the project again. It serves only to prove the `|` alternation logic used in our real code.

### Mechanical walkthrough

1. `pattern =`: Genuinely basic, already-established syntax.
2. `r'...'`: Genuinely basic, already-established syntax.
3. `(`: Genuinely basic, already-established syntax.
4. `\[#_[A-Z0-9_]+\]`: First appearance. Because `[` is a reserved regex character, `\[` escapes it to look for a literal bracket. This block strictly matches Fanuc system variables formatted with an underscore.
5. `|`: First appearance. The regex alternation operator. Instructs the engine to match the pattern on its left *or* the pattern on its right.
6. `#\d+`: First appearance. Matches standard numerical macro variables (a literal `#` followed by one or more digits).
7. `[A-Z]`: Genuinely basic, already-established syntax.
8. `)`: Genuinely basic, already-established syntax.
9. `(=)?`: First appearance. A capture group that looks for an optional equals sign. Capturing this separately prevents it from crashing our `float()` conversion later.
10. `([-+]?\d*\.?\d+)?`: A hard concept reappearing — the optional numeric capture group from Lesson 1, designed to grab positive/negative floats safely.
11. `matches = re.findall(...)`: Genuinely basic, already-established syntax.
12. `for address, equals_sign, value in matches:`: A hard concept reappearing — tuple unpacking. Because our regex now has three capture groups (address, equals, value), `findall` returns a list of 3-item tuples. This unzips them directly into three variables per loop.
13. `if value != '':`: Genuinely basic, already-established syntax. `findall` returns an empty string when an optional group isn't found.
14. `tokens.append((address, float(value)))`: Genuinely basic, already-established syntax.
15. `else:`: Genuinely basic, already-established syntax.
16. `tokens.append((address, None))`: First appearance. The `None` keyword in Python represents a null state. We use this to indicate that a variable like `[#_ALM]` was queried, but no numeric value was assigned to it in this block.

### CS Lens

This embodies **Lexical Grammar Expansion**.
Also recognized in: SQL engines adding support for new proprietary keywords, compilers supporting different language dialects (C++11 vs C++14), and static code analyzers updating rulesets.

### SE Lens

The design principle here is the **Open-Closed Principle** (partially applied at the grammar level). The alternative not chosen was writing separate `if/else` loops to split strings manually based on the presence of a bracket. The tradeoff is that our regular expression becomes denser and harder to read at a glance. The maintenance cost of the alternative is a fragile lexer that shatters the moment an OSP or Siemens control introduces a slightly different variable syntax.

### Commands needed to make this unit real

No new commands; run within the existing `src/parser/` structure.

### Run it. Show the real output.

To verify, temporarily append this to the bottom of `lexer.py`:

```python
if __name__ == "__main__":
    print(lex_block("#100=1.5 G01 [#_ALM]"))

```

Run `python src/parser/lexer.py`.
**Output:**
`[('#100', 1.5), ('G', 1.0), ('[#_ALM]', None)]`

### Connection

We can now parse complex variable syntax, but if we attempt to parse a 50MB surfacing file, appending millions of these token lists into a master array will instantly exhaust the system's memory.

---

## Concept Unit: Streaming Pipelines (Generators)

### The Problem

When integrating this parser with an external backplotter or simulation GUI, returning a massive, fully-parsed list blocks the main thread until the entire file is processed. We need a way to open a file, read exactly one block, pause execution to hand that block to the GUI, and seamlessly resume from where we left off when the GUI asks for the next move.

### Project Change

* **Reference Source:** No reference counterpart.
* **Files affected:** Modified `src/parser/lexer.py`.
* **Change type:** Add.
* **Location:** Appended directly below the `lex_block` function.
* **Dependencies:** None.

### The New Code

```python
def stream_program(filepath):
    with open(filepath, 'r') as file:
        for line in file:
            if line.strip() != '':
                yield lex_block(line)

```

### The Updated Project

```python
# src/parser/lexer.py
import re

def lex_block(block_text):
    tokens = []
    pattern = r'(\[#_[A-Z0-9_]+\]|#\d+|[A-Z])(=)?([-+]?\d*\.?\d+)?'
    matches = re.findall(pattern, block_text.upper())
    
    for address, equals_sign, value in matches:
        if value != '':
            tokens.append((address, float(value)))
        else:
            tokens.append((address, None))
            
    return tokens

# ← new
def stream_program(filepath):
    with open(filepath, 'r') as file:
        for line in file:
            if line.strip() != '':
                yield lex_block(line)

```

This new function acts as the public API for our lexer module. Instead of returning a list, it creates a pipeline that yields tokens sequentially.

### Introduce the concept in isolation

To understand how a function can pause without losing its memory, we isolate the suspension keyword.

```python
def simple_counter():
    print("Starting generator")
    yield 1
    print("Resuming generator")
    yield 2

gen = simple_counter()
print(next(gen))
print(next(gen))

```

**Output:**

```
Starting generator
1
Resuming generator
2

```

This proves that returning a value does not have to destroy the function's local state. The function suspends entirely at the `yield` statement and waits for the caller to invoke `next()` before continuing to the next line. This is called a **generator**.

### Discard the throwaway example

The throwaway example is deleted and will not appear in the project again.

### Mechanical walkthrough

1. `def stream_program(filepath):`: Genuinely basic, already-established syntax.
2. `with`: First appearance. A context manager keyword. It guarantees that the resource it opens will be safely closed when the block ends, even if an error crashes the program inside the block.
3. `open(filepath, 'r')`: First appearance. Opens a file stream from the operating system in strictly read-only mode (`'r'`).
4. `as file:`: First appearance. Binds the open file resource to the variable `file`.
5. `for line in file:`: First appearance of iterating directly over a file object. This automatically reads the file sequentially, one line at a time, preventing the entire file from loading into RAM.
6. `if line.strip() != '':`: Genuinely basic, already-established syntax. Skips empty lines.
7. `yield`: First appearance. The generator suspension keyword. It passes the value back to the caller and freezes the function's state exactly where it is.
8. `lex_block(line)`: Genuinely basic, already-established syntax.

**Execution Trace (Control flow / Timing):**

1. `gen = stream_program("part.nc")` — builds the generator object in memory, but does *not* execute the `with open` block or read the file yet.
2. `next(gen)` (called externally) — execution enters the function, opens the file, reads the first string, and hits `yield`.
3. `yield lex_block(line)` — the function pauses entirely, handing the tokens back. The file remains open and locked in memory.
4. `next(gen)` (called again) — execution unfreezes directly after the `yield`, jumping immediately to the next iteration of the `for` loop without reopening the file.

### CS Lens

This embodies **Lazy Evaluation and Coroutines**.
Also recognized in: CNC controller lookahead buffers evaluating only the next 200 blocks, video streaming protocols buffering chunk by chunk, and infinite mathematical sequence generation.

### SE Lens

The design principle here is **Memory Efficiency via Iterators**. The alternative not chosen was `.readlines()`, which dumps the entire file into a massive array. The tradeoff is that while `yield` is highly memory efficient, it holds a file descriptor open on the operating system for as long as the generator is alive, meaning you cannot easily modify the file externally while it is being streamed.

### Commands needed to make this unit real

Create a dummy file to test the stream:
`echo "G01 X10.0\n#100=1.5\nM30" > test.nc`

### Run it. Show the real output.

To verify standalone execution, append this temporarily to `lexer.py`:

```python
if __name__ == "__main__":
    pipeline = stream_program("test.nc")
    print(next(pipeline))
    print(next(pipeline))

```

Run `python src/parser/lexer.py`.
**Output:**

```
[('G', 1.0), ('X', 10.0)]
[('#100', 1.5)]

```

### Connection

We now have an optimized pipeline capable of processing massive G-code files block by block, but silently yielding data isn't enough when building complex state machines; we need real-time operational visibility.

---

## Concept Unit: Standardized Diagnostics (Logging)

### The Problem

When building a system that autodetects dialects (like Fanuc vs Siemens), relying on `print()` to trace execution is unmanageable. `print` outputs cannot be easily leveled by severity (info vs error), muted in production, or routed directly to diagnostic text files.

### Project Change

* **Reference Source:** No reference counterpart.
* **Files affected:** Created `src/utils/logger.py`.
* **Change type:** Add.
* **Location:** A brand new utility module tracking cleanly alongside `parser`.
* **Dependencies:** Python 3 standard library `logging`.

### The New Code

```python
import logging

logging.basicConfig(
    level=logging.INFO, 
    format='%(levelname)s - %(name)s: %(message)s'
)
system_log = logging.getLogger("NC_CORE")

```

### The Updated Project

```python
# src/utils/logger.py
# ← new
import logging

logging.basicConfig(
    level=logging.INFO, 
    format='%(levelname)s - %(name)s: %(message)s'
)
system_log = logging.getLogger("NC_CORE")

```

This utility file establishes a global, pre-configured logging instance that any other file in our project can import and use to emit structured system events.

### Introduce the concept in isolation

```python
import logging
logging.basicConfig(level=logging.WARNING)
logger = logging.getLogger("lab")

logger.debug("This invisible event is ignored by the threshold.")
logger.warning("This threshold event is printed!")

```

**Output:** `WARNING:lab:This threshold event is printed!`

This proves that diagnostic messages can be assigned semantic severity levels, and a central configuration can universally filter out lower-tier noise. This is called **application logging**.

### Discard the throwaway example

The throwaway example is deleted and will not appear in the project again.

### Mechanical walkthrough

1. `import logging`: First appearance. Imports the standard library logging framework.
2. `logging.basicConfig(...)`: First appearance. A configuration method that sets the default routing rules for all loggers in the application that do not explicitly override them.
3. `level=logging.INFO`: First appearance. Sets the global threshold. Messages tagged as `DEBUG` will be silently dropped, while `INFO`, `WARNING`, and `ERROR` will be processed.
4. `format='%(levelname)s - %(name)s: %(message)s'`: First appearance. A framework-specific string syntax that dictates the exact visual shape of the output text.
5. `system_log = logging.getLogger("NC_CORE")`: First appearance. The Factory pattern. This requests a dedicated logger instance named `"NC_CORE"`. If it doesn't exist, the framework creates it; if it does, it returns the existing one.

### CS Lens

This embodies **Observability and Event Sourcing**.
Also recognized in: server access logs tracking incoming HTTP requests, crash-dump telemetry in operating systems, and CNC machine alarm history files.

### SE Lens

The design principle here is **Instrumentation**. The alternative not chosen was littering the codebase with `if debug_mode: print(...)`. The tradeoff is that the `logging` module is inherently slower than `print` due to internal thread-safety locks and formatting overhead. The maintenance cost of the alternative is a completely opaque application that forces developers to guess what state the macro variables were in right before a crash.

### Commands needed to make this unit real

Create the new utility directory:
`mkdir -p src/utils`
`touch src/utils/logger.py`

### Run it. Show the real output.

Temporarily append to `logger.py`:

```python
if __name__ == "__main__":
    system_log.info("Parser core initialized.")
    system_log.error("Fatal geometry exception detected.")

```

Run `python src/utils/logger.py`.
**Output:**

```
INFO - NC_CORE: Parser core initialized.
ERROR - NC_CORE: Fatal geometry exception detected.

```

### Connection

With a robust lexical grammar, a memory-safe execution pipeline, and standard diagnostic tooling, we have graduated from manipulating basic text strings to building the foundational architecture of a real computational engine.

---

## Closing

* **Connect the pieces:** The raw text `"G01 [#_ALM]"` is read from the hard drive by our generator pipeline, matched by the `|` alternation operator, formatted into a token list, and yielded to the caller, while any `system_log.debug()` events we embed in the parser can trace exactly when that yield occurred without cluttering the console.
* **What breaks without this:** If you try to pass an empty line (`"\n"`) to `lex_block` without the `line.strip() != ''` check we implemented in the generator, the regex will find no matches, and it will yield an empty list `[]`. When the downstream parser tries to extract the first token, it will throw an `IndexError` and crash the system.
* **Exercises:**
1. Import `system_log` from `src.utils.logger` into `lexer.py` and add an `INFO` level log immediately before the `yield` statement to trace exactly when a block is handed off.
2. Write a failing unit test in `tests/test_lexer.py` that asserts `#500=2.0` parses correctly, confirming that your pipeline enforces the contract we wrote in Lesson 2.


* **Definition of done:**
* [x] Lexer grammar refactored to support complex Fanuc variable structures.
* [x] Generator pipeline established for lazy data streaming.
* [x] Production logging utility instantiated.
* `git commit -m "Implement lazy token streaming pipeline and application logging"`



---

With the data reliably converting to tokens and streaming lazily, the next step is building the Parser module to actually interpret those tokens (e.g., remembering that a `G01` is active even if the next line only contains `X10.0`). 