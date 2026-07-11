# 029 — Python Environment

*VS Code for Python, the interpreter, virtual environments, and why Python is different from JavaScript*

---

## What You Will Build

You will install Python, configure VS Code for Python development, create a virtual environment, and run a Python script that prints structured output to the terminal. The script will be the first piece of a Python CLI calculator — a standalone program that takes an expression and prints the result.

By the end of this lesson: `python calculator.py "1+2"` prints `3`.

---

## What You Need to Know First

Lesson 002 — Your Environment. The terminal, PATH, and what a runtime is. This lesson parallels that one, for Python.

---

## The Lesson

### Python is not JavaScript

The most important orientation before writing a line of Python: Python's syntax is completely different from JavaScript's. There are no:

- **Braces `{}`** to delimit blocks of code — indentation does that
- **Closing tags** — Python has no JSX, no HTML, no closing angle brackets
- **Semicolons** — each statement is one line
- **`const`/`let`/`var`** — variables are just assigned with `=`
- **`function` keyword** — Python uses `def`

The mental model: Python is a scripting language where **whitespace is syntax**. A code block is defined by its indentation level, not by braces. If the indentation is wrong, the program crashes — not with a subtle bug, but with an `IndentationError`.

```python
# Python — indentation defines the block
def greet(name):
    message = "Hello, " + name   # 4 spaces — inside the function
    return message                # 4 spaces — still inside the function

result = greet("World")           # 0 spaces — outside the function
print(result)
```

```javascript
// JavaScript — braces define the block
function greet(name) {
    const message = "Hello, " + name;   // inside the function
    return message;
}

const result = greet("World");          // outside the function
console.log(result);
```

The two programs do the same thing. The structure is the same: define a function, call it, print the result. The notation is entirely different.

---

**CS lens — interpreted vs compiled:**

Python is an **interpreted language**: the Python interpreter reads your `.py` source file and executes it line by line at runtime. There is no separate compilation step. This is different from TypeScript (which compiles to JavaScript) and more similar to JavaScript running in Node.js (which also interprets source code at runtime).

The Python interpreter is the program that understands Python syntax. Different versions (Python 3.11, 3.12, 3.13) understand slightly different feature sets. **Always use Python 3** — Python 2 (released in 2000, deprecated 2020) is dead and should never be used for new code.

The parallel to lesson 002: just as Node.js was the JavaScript runtime, the Python interpreter is the Python runtime. Both are programs that execute your code. Both have version numbers. Both must be installed before your code can run.

---

**SE lens — the indentation contract:**

Python's indentation-as-syntax is a deliberate design decision by Guido van Rossum (Python's creator). It enforces one of software engineering's best practices: **code structure must be visible**. In JavaScript, you can write a function with the body at column 0 and the compiler does not care:

```javascript
function add(a, b) {
return a + b  // legal JavaScript — terrible style
}
```

In Python:

```python
def add(a, b):
return a + b  # IndentationError — Python requires indentation
```

Python's enforced indentation eliminates a class of bugs where visual structure and logical structure diverge. When you read Python, the indentation is the truth — you cannot be misled by mismatched visual indent and logical structure.

The standard: **4 spaces per indentation level**. VS Code enforces this automatically with the Python extension. Never use tabs in Python (or configure your editor to convert tabs to 4 spaces).

---

### Install Python

**macOS:**

```bash
# Check if Python is already installed
python3 --version
```

If this prints `Python 3.11.x` or later, Python is installed. If it returns `command not found`, install it.

**Install via Homebrew (recommended on macOS):**

```bash
# Install Homebrew if not installed (see brew.sh)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Python
brew install python
```

`brew install python` — installs the latest stable Python 3 as `/usr/local/bin/python3` (Intel Mac) or `/opt/homebrew/bin/python3` (Apple Silicon).

After installation:

```bash
python3 --version
# Python 3.13.x

which python3
# /opt/homebrew/bin/python3 (or similar)
```

`which python3` — prints the full path to the `python3` executable that the shell will use. The shell finds it via PATH, exactly as described in lesson 002 for Node.js.

Note: on macOS, `python` (without the 3) may still point to Python 2 or nothing. Always use `python3` explicitly, or configure an alias.

**Windows:**

Download the installer from python.org. During installation: **check "Add Python to PATH"** — without this, `python` will not be found in your terminal.

---

### Install the VS Code Python Extension

Open VS Code. Press `Cmd+Shift+X` (Mac) or `Ctrl+Shift+X` (Windows/Linux) to open the Extensions panel.

Search for: **Python** (publisher: Microsoft)

Install it. Also install:

- **Pylance** — the Python language server. Provides type checking, autocompletion, and go-to-definition. The equivalent of TypeScript's language service for Python.

After installing: open any `.py` file. VS Code shows a Python version indicator in the status bar (bottom right). Click it to select your Python interpreter — choose the Homebrew-installed `python3`.

---

**CS lens — the language server protocol:**

When VS Code shows autocompletion for Python functions, that is not VS Code's built-in intelligence — VS Code does not understand Python. It delegates to a **language server**: a separate process that understands one specific language and communicates with VS Code via the **Language Server Protocol (LSP)**.

Pylance is Microsoft's Python language server. It:
- Reads your Python code
- Builds a model of your types and names
- Responds to VS Code's queries: "what can I put here?", "where is this defined?", "what type does this have?"

The LSP is the same protocol used by the TypeScript language server (tsserver) for JavaScript/TypeScript. This is why VS Code can support many languages without each needing a custom editor: any language that implements an LSP server gets full IDE support.

---

### Create a virtual environment

In JavaScript, packages live in `node_modules/` inside the project. In Python, the equivalent is a **virtual environment** (venv).

```bash
# Create a new directory for the Python project
mkdir my-python-platform
cd my-python-platform

# Create a virtual environment in a folder called .venv
python3 -m venv .venv
```

`python3 -m venv .venv` — runs the `venv` module (`-m venv`) with `python3`, creating a virtual environment directory called `.venv`.

The `.venv` directory contains:
- A copy of (or symlink to) the Python interpreter
- `pip` — the package installer
- An isolated `site-packages/` directory where packages are installed

**Activate the virtual environment:**

```bash
# macOS / Linux
source .venv/bin/activate

# Windows (Command Prompt)
.venv\Scripts\activate.bat

# Windows (PowerShell)
.venv\Scripts\Activate.ps1
```

After activation, the shell prompt changes:

```
(.venv) $
```

The `(.venv)` prefix shows that the virtual environment is active. Now:

```bash
python --version
# Python 3.13.x — the version from .venv, not system Python
```

`which python` now points to `.venv/bin/python`. Any packages installed with `pip install` go into `.venv/site-packages/`, not the global Python installation.

---

**CS lens — isolation and dependency management:**

A virtual environment solves the **dependency conflict problem**: different Python projects may require different versions of the same library. Without isolation, installing `requests==2.31` for project A breaks project B that needs `requests==2.28`.

The JavaScript equivalent is `node_modules/` — each project has its own `node_modules/` with its own package versions. Python projects used to install everything globally (into the system Python), causing conflicts. Virtual environments (introduced in Python 3.3) solved this: each project gets an isolated Python installation.

The workflow:
1. Create a venv for each project
2. Activate it before working
3. Install packages into the active venv
4. Deactivate (`deactivate` command) when switching projects

---

**SE lens — .venv in .gitignore:**

Just like `node_modules/` should not be committed (lesson 003), `.venv/` must also be in `.gitignore`. The venv directory is large, platform-specific, and regeneratable from the requirements file.

Create `.gitignore`:

```
.venv/
__pycache__/
*.pyc
*.pyo
.DS_Store
.env
```

`__pycache__/` — a directory Python creates automatically, containing compiled bytecode (`.pyc` files). These are platform-specific cache files. Python uses them to speed up loading (compiling `.py` to bytecode once instead of on every run). They are safe to delete and are always regenerated.

`*.pyc` — compiled Python bytecode files. Generated alongside `.py` files in older Python versions (before `__pycache__`).

---

### Set up requirements

Python's equivalent of `package.json` is `requirements.txt` — a file listing package names and versions.

Create `requirements.txt`:

```
# Requirements file for my-python-platform
# Install with: pip install -r requirements.txt
```

Currently empty (no external packages needed for the first script). As packages are added, they are listed here:

```
requests==2.31.0
pytest==8.3.0
```

Install from requirements:

```bash
pip install -r requirements.txt
```

`pip` — the Python package installer. `pip install -r requirements.txt` reads the file and installs every package listed. The `-r` flag means "from a requirements file" (not a package name).

The Python package registry is **PyPI** (the Python Package Index, at pypi.org) — the equivalent of npm's registry.

There is also `pyproject.toml` (a modern alternative) and `setup.py` (older). For this series, `requirements.txt` is the starting point. It is the simplest format and what most Python tutorials use.

---

**CS lens — pip vs npm:**

Both `pip` and `npm` install packages from their respective registries. Key differences:

| | npm | pip |
|---|---|---|
| Registry | npmjs.com | pypi.org |
| Lock file | `package-lock.json` | `requirements.txt` (manual) or `pip freeze > requirements.txt` |
| Dev deps | `devDependencies` in package.json | separate `requirements-dev.txt` (convention) |
| Scripts | `"scripts"` in package.json | `Makefile` or `justfile` (no built-in equivalent) |
| Virtualenv | Automatic (per project in `node_modules/`) | Manual (`.venv`, must activate) |

The `npm` ecosystem has an automatic lock file (`package-lock.json`) with exact version information. Python's `requirements.txt` is manual — you write the versions you want. To capture exact current versions:

```bash
pip freeze > requirements.txt
```

`pip freeze` lists all installed packages and their exact versions. Redirecting to `requirements.txt` creates a full lock file.

---

### Write the first Python script

Create `calculator.py`:

```python
# calculator.py
#
# Python CLI calculator.
# Usage: python calculator.py "1+2"
# Output: 3

import sys

def evaluate(expression: str) -> str:
    """
    Evaluate a mathematical expression string and return the result.
    
    Args:
        expression: A string like "1+2" or "10*5".
    
    Returns:
        The result as a string, or an error message prefixed with "Error:".
    """
    expression = expression.strip()
    
    if not expression:
        return "Error: expression is empty"
    
    try:
        # eval() used for demonstration — lesson 030 replaces it
        # with a safe expression parser.
        result = eval(expression)  # noqa: S307
        
        if not isinstance(result, (int, float)):
            return f"Error: result is not a number ({type(result).__name__})"
        
        if result != result:  # NaN check (NaN != NaN in IEEE 754)
            return "Error: result is NaN"
        
        if result == float('inf') or result == float('-inf'):
            return "Error: division by zero"
        
        # Format: integers without decimal point, floats with up to 10 places
        if isinstance(result, int) or result == int(result):
            return str(int(result))
        
        return f"{result:.10g}"  # g format: removes trailing zeros
    
    except SyntaxError:
        return f"Error: invalid expression syntax"
    
    except ZeroDivisionError:
        return "Error: division by zero"
    
    except Exception as e:
        return f"Error: {e}"


def main() -> None:
    """Entry point. Reads expression from command-line argument."""
    if len(sys.argv) < 2:
        print("Usage: python calculator.py \"<expression>\"")
        print("Example: python calculator.py \"1+2\"")
        sys.exit(1)
    
    expression = sys.argv[1]
    result = evaluate(expression)
    print(result)


if __name__ == "__main__":
    main()
```

Run it:

```bash
python calculator.py "1+2"
# 3

python calculator.py "10*5"
# 50

python calculator.py "22/7"
# 3.142857143

python calculator.py "1/0"
# Error: division by zero

python calculator.py ""
# Error: expression is empty
```

---

### Full walkthrough of calculator.py

Every Python concept in this file, defined at use:

**`import sys`** — the `import` statement loads a module. `sys` is a built-in Python module (part of the standard library — no installation needed). It provides access to interpreter-level values: `sys.argv` (command-line arguments), `sys.exit()` (terminate the program), `sys.stdin`/`sys.stdout`/`sys.stderr` (input/output streams).

There are no braces, no `from 'sys'` path. Built-in module names are just bare names.

**`def evaluate(expression: str) -> str:`** — defines a function.
- `def` is the keyword (short for "define")
- `evaluate` is the function name
- `(expression: str)` — one parameter named `expression`, with a **type annotation** `: str`. Type annotations in Python are optional hints, not enforced by the interpreter. They are used by type checkers (like `mypy` or Pylance in VS Code).
- `-> str` — the **return type annotation**. This function returns a `str`.
- `:` at the end — the colon begins the function body. Every block in Python (function, if, for, while, class) ends with `:` and the block is the indented lines that follow.

**No closing tag or `}` ends the function.** When the indentation returns to the same level as `def`, the function is over.

**Docstring:**

```python
"""
Evaluate a mathematical expression string and return the result.

Args:
    expression: A string like "1+2" or "10*5".

Returns:
    The result as a string, or an error message prefixed with "Error:".
"""
```

A triple-quoted string immediately after the function definition is a **docstring** — Python's built-in documentation system. Unlike comments (which are for developers reading the code), docstrings are accessible at runtime: `evaluate.__doc__` returns the string. Tools like `pydoc`, `help()`, and IDEs display docstrings.

The `Args:` / `Returns:` format is **Google-style docstrings** — the most common Python documentation convention. Pylance reads docstrings and displays them in VS Code's hover tooltip.

**`expression = expression.strip()`** — `str.strip()` removes leading and trailing whitespace. This is a method call on the `expression` string. Python strings are objects; methods are called with dot notation.

Note: Python allows reassigning the parameter variable (`expression = expression.strip()`). This is different from JavaScript where you would declare a new variable (`const trimmed = expression.trim()`). In Python, variable declarations are just assignments — there is no `const`/`let`.

**`if not expression:`** — `not` is Python's boolean negation (equivalent to `!` in JavaScript). An empty string is **falsy** in Python — `if not ""` is `True`. This checks whether the stripped expression is empty.

Unlike JavaScript, Python's truthy/falsy rules are simple: `None`, `False`, `0`, `0.0`, `""`, `[]`, `{}`, `()` are all falsy. Everything else is truthy.

**`return "Error: expression is empty"`** — returns a string. The function is over at this point (early return).

**`try: ... except SyntaxError: ... except Exception as e:`** — Python's exception handling:

```python
try:
    # code that might raise an exception
    result = eval(expression)
except SyntaxError:
    # handles only SyntaxError
    return "Error: invalid expression syntax"
except ZeroDivisionError:
    return "Error: division by zero"
except Exception as e:
    # catches any other exception
    # 'as e' binds the exception object to the name 'e'
    return f"Error: {e}"
```

Python uses `try/except` where JavaScript uses `try/catch`. The `except` keyword handles exceptions. Multiple `except` clauses handle different exception types. The order matters: more specific exceptions go first.

`Exception as e` — `as e` binds the caught exception to the variable `e`. `str(e)` or `f"{e}"` gives the error message.

**`isinstance(result, (int, float))`** — checks if `result` is an instance of either `int` or `float`. Python has two numeric types for real numbers: `int` (arbitrary precision integers) and `float` (64-bit floating point). Passing a tuple `(int, float)` to `isinstance` checks against both.

**`result != result`** — NaN check. In IEEE 754 floating-point, `NaN != NaN` is true (NaN is not equal to itself). This is the same in Python as in JavaScript. Python also has `math.isnan(result)` for a clearer check.

**`f"Error: result is not a number ({type(result).__name__})"`** — an **f-string** (formatted string literal). `f"..."` is Python's template literal. `{expression}` inside an f-string evaluates the Python expression and inserts the result. `type(result).__name__` gets the class name of `result`'s type (e.g., `'str'`).

f-strings are the modern Python string interpolation syntax (Python 3.6+). Older code uses `"Error: %s" % value` or `"Error: {}".format(value)`. Always use f-strings in new code.

**`f"{result:.10g}"`** — f-string with format specification. `:` separates the value from the format spec. `.10g` means: general format (removes trailing zeros), up to 10 significant figures. `3.14159265358979` becomes `3.141592654`. `3.0` becomes `3`.

**`def main() -> None:`** — a function with return type `None`. `None` is Python's `null`/`void` — a value that means "nothing." Functions that have no meaningful return value return `None` implicitly.

The naming convention: `main()` is the conventional entry point function name. It is not required by Python (unlike `main()` in C or `main()` in Java), but it is a strong convention.

**`len(sys.argv)`** — `len()` returns the length of any sequence. `sys.argv` is a list (Python's equivalent of an array) containing the command-line arguments. `sys.argv[0]` is always the script name (`'calculator.py'`). `sys.argv[1]` is the first argument the user passed.

**`sys.exit(1)`** — terminates the program with exit code `1`. Exit code `0` means success. Non-zero means failure. Shell scripts and CI systems check this exit code.

**`if __name__ == "__main__":`** — Python's equivalent of "run this block only when the script is executed directly, not when it is imported as a module."

When you run `python calculator.py "1+2"`, Python sets `__name__` to `"__main__"`. When another script imports `calculator` (`import calculator`), Python sets `__name__` to `"calculator"`. The `if __name__ == "__main__":` guard prevents `main()` from running during import — the same reason JavaScript modules do not auto-run their entry code.

---

**CS lens — Python's type system:**

Python's type annotations (`: str`, `-> str`, `-> None`) are a **gradual type system**. They are optional — the interpreter ignores them. But tools like Pylance and `mypy` (a separate type checker) read them and report errors.

This is different from TypeScript's type system:
- TypeScript: no types = error (with `noImplicitAny`)
- Python: no types = any type is allowed (gradual)

Python's gradual typing means you can add types to a file incrementally without requiring annotations everywhere. Start with none; add where the code is complex or the interface matters.

The type checker for Python is **mypy** (or Pylance, which includes its own checker). For this series, Pylance in VS Code provides type checking as you write. To run mypy from the terminal:

```bash
pip install mypy
mypy calculator.py
```

---

## Connect the Pieces

**Connection to lesson 002:** Python's environment parallels Node.js's exactly: interpreter → PATH → version → package manager → virtual environment. The concepts are identical; the tools are different.

**Connection to lesson 006:** `requirements.txt` parallels `package.json` for dependency declaration. `pip freeze > requirements.txt` parallels writing `dependencies` in `package.json`. Both track what the project needs to run.

**Connection to lesson 030:** The `eval()` in `calculator.py` is flagged with `# noqa: S307` (suppress the security linting warning). Lesson 030 replaces it with a safe expression parser — the same evolution as the JavaScript calculator.

---

## What Breaks Without This

**Wrong Python version:**

```bash
python --version
# Python 2.7.16
```

Python 2 is incompatible with Python 3 in significant ways. `print "hello"` (valid Python 2) is a `SyntaxError` in Python 3. Type annotations exist in Python 3 but not Python 2. Always verify you are using Python 3.

**No virtual environment activated:**

```bash
pip install requests
```

Without activation, `pip` installs to the global Python. After multiple projects install different versions of the same package, conflicts arise. Always activate before installing.

**IndentationError:**

```python
def add(a, b):
  return a + b    # 2 spaces
    result = 0    # 4 spaces — IndentationError: unexpected indent
```

```
IndentationError: unexpected indent
```

Python expects consistent indentation within a block. Mixing 2 and 4 spaces, or mixing spaces and tabs, produces `IndentationError`. VS Code with the Python extension auto-formats to 4 spaces.

**Missing `:` at end of block header:**

```python
def add(a, b)    # Missing colon
    return a + b
```

```
SyntaxError: expected ':'
```

Every block header (`def`, `if`, `for`, `while`, `class`, `try`, `except`, `with`) must end with `:`. There is no equivalent in JavaScript — the colon is Python's "the body begins here" signal.

---

## Definition of Done

- [ ] `python3 --version` prints Python 3.11 or later
- [ ] VS Code Python extension and Pylance are installed
- [ ] A virtual environment exists at `.venv/` and is activated
- [ ] `.gitignore` includes `.venv/`, `__pycache__/`, `*.pyc`
- [ ] `calculator.py` exists and runs without errors
- [ ] `python calculator.py "1+2"` prints `3`
- [ ] `python calculator.py "1/0"` prints `Error: division by zero`
- [ ] `python calculator.py ""` prints `Error: expression is empty`
- [ ] You can explain what indentation does in Python that braces do in JavaScript
- [ ] You can explain why the virtual environment exists and what `.venv/bin/activate` does
- [ ] You can explain the `if __name__ == "__main__":` guard
- [ ] Git commit:
  ```
  git add calculator.py requirements.txt .gitignore
  git commit -m "Add Python CLI calculator entry point

  calculator.py accepts expression via sys.argv, evaluates safely.
  Virtual environment at .venv (not committed).
  Python type annotations on all functions.
  evaluate() returns string results — error messages prefixed with 'Error:'."
  ```
