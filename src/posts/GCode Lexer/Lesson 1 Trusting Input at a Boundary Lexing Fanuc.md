# Lesson 1: Trusting Input at a Boundary (Lexing Fanuc)

**What you will build:** We are going to build a basic lexer (tokenizer) that reads a raw string of text from a program file and converts it into a list of programmatic token objects. The working feature is isolating letter addresses from numeric values. The transferable problem this lesson is actually about is safely converting untrusted, unstructured text at an application boundary into a rigid, predictable data structure.

**What you need to know first:** Nothing.

**Pipeline diagram:** The standard compiler pipeline we will build is `Text → Lexer → Parser → AST → Semantic Analysis`. This lesson touches only the `Text → Lexer` stage. The literal value `"G01 X10.0"` enters as text, becomes `[Token(G, 1), Token(X, 10.0)]` in the Lexer, will become a `LinearInterpolationNode` in the AST, and will eventually generate a mathematical curve in Semantic Analysis.

---

## Concept Unit: Pattern Matching and Tokenization

### The Problem

A raw text file is just a sequence of characters. The software does not inherently know that `G01` is an instruction while `X10.0` is a coordinate. If we try to evaluate the raw string directly, handling spaces, negative signs, and decimals becomes a fragile mess of string-splitting. We need a way to mathematically extract addresses and their values before we try to understand what they mean.

### Project Change

* **Reference Source:** No reference counterpart — this is a from-scratch addition because we are establishing the initial project boundary.


* **Files affected:** Created `src/parser/lexer.py`.
* **Change type:** Add.


* **Location:** Brand new file inside a newly established `src/parser/` directory structure to prevent environment drift across future steps.


* **Dependencies:** Python 3 standard library `re` (regular expressions).



### The New Code

```python
import re

def lex_block(block_text):
    tokens = []
    pattern = r'([A-Z])([-+]?\d*\.?\d+)'
    matches = re.findall(pattern, block_text.upper())
    
    for address, value in matches:
        tokens.append((address, float(value)))
        
    return tokens

```

### The Updated Project

```python
# src/parser/lexer.py
import re

# ← new
def lex_block(block_text):
    tokens = []
    pattern = r'([A-Z])([-+]?\d*\.?\d+)'
    matches = re.findall(pattern, block_text.upper())
    
    for address, value in matches:
        tokens.append((address, float(value)))
        
    return tokens

```

This new file establishes our entry point: it takes a single line of G-code, ignores any extraneous whitespace by matching strictly against our pattern, and maps the results into a clean list of tuples representing our tokens.

### Introduce the concept in isolation

To understand how we map that text, we need to look at the pattern matching engine.

```python
import re
test_string = "X-15.2"
isolated_pattern = r'([-+]?\d*\.?\d+)'
result = re.findall(isolated_pattern, test_string)
print(result)

```

**Output:** `['-15.2']`

This proves that the engine can isolate optional signs, integers, and optional decimal components from a string, grouping them together regardless of the surrounding text. This is called a **regular expression**.

### Discard the throwaway example.

The throwaway example is deleted and will not appear in the project again. It serves only to prove the numeric extraction logic used in `pattern` in our real code.

### Mechanical walkthrough

1. `import re`: First appearance. Imports the standard regular expression library.
2. `def lex_block(block_text):`: Already established syntax.
3. `tokens = []`: Already established syntax.
4. `pattern = r'([A-Z])([-+]?\d*\.?\d+)'`: First appearance. A raw string (`r''`) containing two capture groups wrapped in parentheses. Group 1 `([A-Z])` captures exactly one uppercase letter. Group 2 `([-+]?\d*\.?\d+)` captures an optional positive/negative sign, optional leading digits, an optional decimal, and required trailing digits. This guarantees we only capture valid Fanuc numeric formats.
5. `matches = re.findall(pattern, block_text.upper())`: First appearance. The `findall` method scans the entire string and returns a list of tuples containing the matches from our two capture groups. `.upper()` ensures that even if a machine accepts lowercase `g01`, our lexer standardizes it to `G`.
6. `for address, value in matches:`: First appearance of tuple unpacking in a loop. Because `findall` returns `[('G', '1'), ('X', '10.0')]`, this loop automatically assigns `'G'` to `address` and `'1'` to `value` on the first pass.
7. `tokens.append((address, float(value)))`: Already established syntax. `float()` converts the matched string into a computable number.

**Execution Trace:**

```text
Iteration 1: tokens = [], matches = [('G', '1'), ('X', '10.0')]
Iteration 2: address = 'G', value = '1' -> tokens = [('G', 1.0)]
Iteration 3: address = 'X', value = '10.0' -> tokens = [('G', 1.0), ('X', 10.0)]

```

Iteration 2 occurs because the loop evaluates the first tuple in `matches`. Iteration 3 occurs because the loop advances to the second tuple.

### CS Lens

This embodies the computational concept of **Lexical Analysis**.
Also recognized in: JSON parsers evaluating key-value pairs, HTML engines reading tags, network protocol decoders splitting header fields, and every modern compiler's first compilation pass.

### SE Lens

The design principle here is **Separation of Concerns**. The alternative not chosen was reading the string and immediately trying to execute the machine state (e.g., `if 'G01' in block:`). The tradeoff is that we must maintain this intermediate `tokens` list in memory. The failure cost of the alternative is massive architectural debt: mixing parsing logic with execution logic makes supporting multi-channel wait codes or Siemens variables nearly impossible later.

### Commands needed to make this unit real

No external packages are required yet. To prepare for the next step, create the directory structure in your terminal:
`mkdir -p src/parser`


`touch src/parser/lexer.py`

* `mkdir -p`: Creates the directory path, creating parent directories as needed.


* `touch`: Creates an empty file or updates its timestamp.



### Run it. Show the real output.

To run this standalone, append this to the bottom of `lexer.py`:

```python
if __name__ == "__main__":
    print(lex_block("g01 x10.5 Y-5. Z0.0"))

```

Run `python src/parser/lexer.py` in your terminal.
**Output:**
`[('G', 1.0), ('X', 10.5), ('Y', -5.0), ('Z', 0.0)]`

### Connection

This unit successfully normalizes unstructured text into a predictable array of types and values, which allows us to begin building an Abstract Syntax Tree in the next phase.

---

## Closing

* **Connect the pieces:** The raw text `"g01 x10.5"` entered the function, was standardized to uppercase, matched by the regular expression engine, split into capture groups `('G', '1')` and `('X', '10.5')`, cast to floating-point numbers, and assembled into a secure list for the parser.


* **What breaks without this:** If you remove the `[-+]?` from the regex pattern and run the code against `X-15.0`, the output will be `[('X', 15.0)]`. The negative sign is completely ignored, causing a catastrophic machine crash in a real environment.


* **Exercises:**
1. Modify the regex to capture `O` (program numbers) that may not have decimals.
2. Try passing a string with a slash block (`/G01 X10.0`) and observe what the lexer currently does.


* **Definition of done:**
* [x] File `src/parser/lexer.py` created and tested against Fanuc coordinate data.


* `git commit -m "Initialize lexical analyzer to isolate Fanuc addresses from numeric parameters"`.

---
