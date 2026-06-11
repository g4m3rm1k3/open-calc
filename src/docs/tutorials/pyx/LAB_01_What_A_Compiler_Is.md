# PyX — LAB 01 — What a Compiler Is

**Prerequisites:** Python installed on your machine. A terminal you can type commands into. VS Code open.

**What this lab adds:**
- A real Python project with a proper package structure
- A `pyxc` command you can run from anywhere in your terminal
- A pipeline that reads a `.pyx` file and writes it back unchanged
- Your first understanding of what every compiler in the world actually does

**Time:** 60–90 minutes.

---

## What You Will Build

By the end of this lab, you can type this in your terminal:

```
> pyxc build hello.pyx
```

And the output file `hello.jsx` will contain the exact same text as `hello.pyx`. No transformation yet — the compiler copies the file unchanged. This sounds trivial. It is not. You are building the pipeline that every transformation for the next 29 labs will pass through. The identity transform (copy unchanged) is the correct first step because it proves the entire infrastructure works before any logic is added.

```
hello.pyx  ─→  [read]  ─→  [transform: nothing yet]  ─→  [write]  ─→  hello.jsx
```

---

> **Quick Check — try to answer before reading further:**
>
> 1. You have used Python before. When you run `python script.py`, does Python compile your script or interpret it? What is the difference?
> 2. TypeScript, CoffeeScript, and Sass all "compile to" something. What do they compile to, and why does the output have to be a different language?
> 3. If a compiler has four stages — lexing, parsing, transformation, code generation — why might you build them as four separate functions instead of one big function that does all four?
>
> *(Answers at the end of this lab)*

---

## Concept: What Is a Compiler?

**What it is:** A compiler is a program that reads text written in one language and writes equivalent text in a different language. That is the whole definition. No magic. Input language in, output language out.

The word "compiler" sounds like it implies something that runs code or understands it deeply. It does not have to. The simplest possible compiler reads a file and writes it back unchanged — which is exactly what you will build in this lab. More interesting compilers transform the language significantly: TypeScript reads `.ts` files and writes `.js` files. SCSS reads `.scss` files and writes `.css` files. `pyxc` will read `.pyx` files and write `.jsx` files.

**Compiler vs interpreter:**

An **interpreter** reads source code and *executes it directly* — it runs the program. When you type `python script.py`, Python interprets your script: it reads each statement and immediately does what the statement says.

A **compiler** reads source code and *writes different code* — it does not run anything. When you run `pyxc build app.pyx`, pyxc reads the `.pyx` file and writes a `.jsx` file. The `.jsx` file is what eventually runs in the browser.

Some languages are both. Python actually compiles your `.py` files to `.pyc` bytecode files (you have seen these in `__pycache__/`), then interprets the bytecode. The distinction matters less than people think — what matters is what the tool's output is.

**Why compilers exist:**

The browser can only run JavaScript. If you want to use a language that is nicer to write — more expressive, more type-safe, with better syntax — you write in that language and compile to JavaScript. The browser never sees your source language. This is why TypeScript, Elm, CoffeeScript, ClojureScript, and now PyX all exist. They are better-for-humans languages that compile to the only language browsers understand.

**Watch for:** People sometimes call `pyxc` a "transpiler" because it compiles Python to JavaScript (another high-level language) rather than to machine code. Transpiler means "source-to-source compiler." It is the same thing. The distinction is not important for building PyX.

---

## Concept: The Four Stages of a Compiler

**What it is:** Almost every compiler in existence uses the same four-stage pipeline. The names and details vary, but the structure is universal.

```
Source text
    ↓
1. LEXING (also called tokenisation)
   Characters → Tokens
   The source text is split into named chunks called tokens.
   "def foo():" becomes [KEYWORD:def, NAME:foo, LPAREN, RPAREN, COLON]
    ↓
2. PARSING
   Tokens → Abstract Syntax Tree (AST)
   The token stream is assembled into a tree that reflects the structure.
   The function definition becomes a tree node with name, args, and body.
    ↓
3. TRANSFORMATION
   Source AST → Target AST (or IR)
   The source language's tree is converted to the target language's tree.
   Python function definition becomes a JavaScript function definition.
    ↓
4. CODE GENERATION
   Target AST → Output text
   The target tree is serialised back into text.
   The JavaScript function definition becomes the string "function foo() { ... }"
```

**Why four separate stages?**

Each stage has a simple, well-defined job. A lexer only knows about characters. A parser only knows about tokens. A transformer only knows about trees. A code generator only knows about the target language.

If you wrote one giant function that did all four, it would become impossible to reason about. You cannot test "does the lexer handle `<div>`correctly?" without running the whole compiler. You cannot reuse the parser for a different output language. Separate stages mean each part is independently testable and replaceable.

You will see this structure in the Python interpreter itself, in every JavaScript bundler (Babel, esbuild, swc), in every CSS preprocessor, and in the PyX compiler you are building.

**Watch for:** PyX Phase 1 (Labs 01-05) only builds the pre-processor — it does not use all four stages for the full Python language. The pre-processor is a mini-compiler with its own four stages, but it only handles element syntax (`<div>...</div>`). Python's own `ast` module handles the full Python language starting in Phase 2.

---

## Concept: What Is a Virtual Environment?

**What it is:** A virtual environment is an isolated Python installation for one project. It has its own copy of pip and its own `site-packages` folder where installed libraries live.

**Why it matters:**

If you install every library globally (without a virtual environment), all your projects share the same libraries. Project A needs `requests==2.28`. Project B needs `requests==2.31`. They cannot both be installed globally at the same time — one will overwrite the other.

A virtual environment solves this by giving each project its own isolated space. Libraries installed inside one virtual environment are invisible to other projects.

**The three commands:**

```
python -m venv .venv          — create a virtual environment in the .venv folder
.venv\Scripts\activate        — activate it (Windows)
source .venv/bin/activate     — activate it (Mac/Linux)
deactivate                    — deactivate when you are done
```

After `activate`, your terminal prompt changes to show `(.venv)` at the start. Every `pip install` command now installs into the virtual environment, not globally.

**Watch for:** You must activate the virtual environment every time you open a new terminal window. The activation only lasts for the current terminal session. If `pyxc` suddenly stops being found, the most likely reason is that you opened a new terminal and forgot to activate.

---

## Step 1 — Create the Project Folder

Open your terminal in VS Code (**Terminal → New Terminal**).

Navigate to wherever you keep your projects. If you have a `Documents/projects/` folder:

```
> cd C:/Users/YourName/Documents/projects
```

Create the PyX project folder and enter it:

```
> mkdir pyx
> cd pyx
```

Create the internal structure that PyX needs:

```
> mkdir compiler
> mkdir examples
```

You should now be inside a `pyx/` folder with two empty subfolders. Verify:

```
> ls
```

**Expected output:**
```
compiler/
examples/
```

---

### SAVE AND TRY

This is just a folder. Nothing to run yet.

**What you should see:** Two folders inside `pyx/`. If you see them, continue.

---

## Step 2 — Create the Virtual Environment

From inside the `pyx/` folder, create the virtual environment:

```
> python -m venv .venv
```

This creates a hidden `.venv/` folder with a complete Python installation inside it. It takes 10–20 seconds.

Now activate it:

**Windows:**
```
> .venv\Scripts\activate
```

**Mac/Linux:**
```
> source .venv/bin/activate
```

Your terminal prompt should now start with `(.venv)`:

```
(.venv) >
```

Confirm Python is now the virtual environment's Python:

```
> python --version
```

**Expected output:**
```
Python 3.11.x
```

(Any version 3.10 or higher is fine.)

---

### SAVE AND TRY

```
> python -c "import sys; print(sys.prefix)"
```

**Expected output:** A path ending in `.venv` — something like `C:\Users\YourName\Documents\projects\pyx\.venv`

If you see your system Python path instead, you forgot to activate. Run the activate command again.

---

## Concept: What Is `pyproject.toml`?

**What it is:** The modern Python project definition file. It tells pip everything it needs to know about your project: what it is called, what version it is, what Python version it requires, what other packages it depends on, and what commands it installs.

**Why it exists:**

Before `pyproject.toml`, Python projects used `setup.py` — a Python script that had to be executed to describe the package. This caused circular dependency problems (you need Python to read `setup.py`, but `setup.py` might define what Python version to use). `pyproject.toml` is a plain text configuration file that pip can read without executing anything.

**The structure:**

```toml
[build-system]
requires = ["setuptools>=61"]
build-backend = "setuptools.backends.legacy:build"

[project]
name = "pyx-compiler"
version = "0.1.0"
requires-python = ">=3.10"
dependencies = []

[project.scripts]
pyxc = "compiler.cli:main"
```

The `[project.scripts]` section is the important one for this lab. It tells pip: "when someone installs this package, create a command called `pyxc` that runs the `main` function in `compiler/cli.py`." After you run `pip install -e .`, you can type `pyxc` in any terminal and it runs your code.

**Watch for:** `pyproject.toml` uses TOML syntax. Section headers are `[in.brackets]`. Key-value pairs use `=`. Strings use `"double quotes"`. Arrays use `["square", "brackets"]`. Do not use YAML syntax (colons for assignment) — it will fail to parse.

---

## Step 3 — Write `pyproject.toml`

In VS Code, open the `pyx/` folder (File → Open Folder → select `pyx`).

Create a new file called `pyproject.toml` in the root of the `pyx/` folder. Type this exactly:

```toml
[build-system]
requires = ["setuptools>=61"]
build-backend = "setuptools.backends.legacy:build"

[project]
name = "pyx-compiler"
version = "0.1.0"
requires-python = ">=3.10"
dependencies = []

[project.scripts]
pyxc = "compiler.cli:main"
```

Save the file.

**What each line means:**

`[build-system]` — tells pip which build tool to use. `setuptools` is the standard one that has been around for decades. You do not need to understand this section yet.

`[project]` — describes your package. The `name` is what appears on PyPI if you publish it. The `version` follows semantic versioning. `requires-python` ensures pip refuses to install on Python 2 or old Python 3 versions.

`[project.scripts]` — this is the entry point. `pyxc = "compiler.cli:main"` means: create a terminal command called `pyxc` that imports `compiler.cli` and calls `main()`. The `compiler` here refers to the `compiler/` folder you created in Step 1.

---

## Concept: What Is `pip install -e .`?

**What it is:** An **editable install** — it makes your package importable and its commands available without copying your code anywhere. The `.` means "this directory." The `-e` means "editable" (also called "development mode").

**Why you use it for development:**

A normal `pip install package-name` downloads and copies the package to `site-packages/`. If you change the source code, you must reinstall to see the changes.

An editable install (`pip install -e .`) creates a pointer from `site-packages/` to your source directory. When Python imports your package, it reads your source files directly. Changes you make take effect immediately — no reinstall needed.

**What it actually does:**

1. Reads `pyproject.toml` to understand the project
2. Creates a `.pth` file in `site-packages/` that points at your source directory
3. Creates the `pyxc` command in `.venv/Scripts/pyxc` (or `.venv/bin/pyxc` on Mac) that calls your `main` function

After running it once, you never run it again unless you change `pyproject.toml`.

**Watch for:** The `.` in `pip install -e .` is required. It means "the current directory." If you get an error saying no `pyproject.toml` was found, you are not in the right directory.

---

## Step 4 — Create the Package Files

Python needs an `__init__.py` file in each directory that should be importable as a package.

Create `compiler/__init__.py`. It should be empty:

```python
```

(Just create an empty file. Its presence is what matters — it tells Python "this folder is a package.")

Now create `compiler/cli.py`. This is the entry point that `pyxc` calls:

```python
import argparse
import sys


def main() -> None:
    parser = argparse.ArgumentParser(
        prog="pyxc",
        description="The PyX compiler — compiles .pyx files to .jsx",
    )

    subparsers = parser.add_subparsers(dest="command", required=True)

    build_parser = subparsers.add_parser("build", help="Compile a .pyx file to .jsx")
    build_parser.add_argument("input", help="Path to the .pyx source file")
    build_parser.add_argument(
        "--output", "-o",
        help="Path to the output .jsx file (default: same name, .jsx extension)",
        default=None,
    )

    args = parser.parse_args()

    if args.command == "build":
        _run_build(args.input, args.output)


def _run_build(input_path: str, output_path: str | None) -> None:
    if output_path is None:
        if input_path.endswith(".pyx"):
            output_path = input_path[:-4] + ".jsx"
        else:
            output_path = input_path + ".jsx"

    with open(input_path, "r", encoding="utf-8") as f:
        source = f.read()

    result = source

    with open(output_path, "w", encoding="utf-8") as f:
        f.write(result)

    print(f"Compiled {input_path} → {output_path}")
```

---

## Concept: What Is `argparse`?

**What it is:** Python's standard library module for parsing command-line arguments. It reads what the user typed after the command name and makes each piece available as a Python variable.

**How the terminal command works:**

When you type `pyxc build hello.pyx`, the operating system splits this into a list:
```python
["pyxc", "build", "hello.pyx"]
```

Python stores this list in `sys.argv`. `argparse` reads `sys.argv` and turns it into structured data:
- `args.command` → `"build"`
- `args.input` → `"hello.pyx"`
- `args.output` → `None` (not provided, so the default is used)

**Subcommands:**

`add_subparsers` creates a command structure. `pyxc build` is a subcommand (like `git commit` or `npm install`). You add a subparser for each subcommand. By Lab 29, `pyxc` will have `build`, `check`, and `version` subcommands.

**Why not just read `sys.argv` directly?**

You could. But `argparse` gives you:
- Automatic `--help` output (try `pyxc --help` after installing)
- Type conversion (a number argument is automatically an `int`)
- Error messages when required arguments are missing
- Default values for optional arguments

Without `argparse`, you would write all of this yourself. `argparse` is one of the few standard library modules where using it is unambiguously better than the alternative.

**Watch for:** `required=True` on `add_subparsers` means the user must provide a subcommand. Without it, `pyxc` with no arguments would silently do nothing instead of printing help.

---

## Concept: The `with` Statement and Context Managers

**What it is:** A **context manager** is a Python object that automatically sets something up before a block of code runs and tears it down after — even if the code raises an exception.

`open()` returns a context manager. The `with` statement uses it:

```python
with open("hello.pyx", "r", encoding="utf-8") as f:
    source = f.read()
# File is automatically closed here, even if f.read() raised an exception
```

**Why it matters:**

Files must be closed after reading. If you forget to close a file, your program holds a "file handle" open. On some systems, this means other programs cannot access the file. In long-running programs, running out of file handles crashes the program.

Without `with`:
```python
f = open("hello.pyx", "r", encoding="utf-8")
source = f.read()
f.close()  # easy to forget; never called if f.read() raises an exception
```

With `with`:
```python
with open("hello.pyx", "r", encoding="utf-8") as f:
    source = f.read()
# f.close() is called automatically, always, guaranteed
```

**The arguments to `open()`:**

| Argument | What it means |
|---|---|
| `"r"` | Read mode — the file must exist |
| `"w"` | Write mode — creates the file if it does not exist, overwrites if it does |
| `encoding="utf-8"` | Decode bytes as UTF-8 text. Always specify this. Without it, Python uses the system default, which varies by platform and causes bugs on Windows. |

**Watch for:** The `as f` part names the file object `f` so you can call methods on it inside the block. `f` is not accessible outside the `with` block (it is closed).

---

## Step 5 — Install the Package

In your terminal (make sure `(.venv)` is showing):

```
> pip install -e .
```

**Expected output:**
```
Obtaining file:///C:/Users/.../pyx
  Installing build dependencies ... done
  Checking if build backend supports build_editable ... done
  Getting requirements to build editable ... done
  Installing backend dependencies ... done
  Preparing editable install (pyproject.toml) ... done
  Building editable for pyx-compiler (pyproject.toml) ... done
Successfully installed pyx-compiler-0.1.0
```

Now test that the command exists:

```
> pyxc --help
```

**Expected output:**
```
usage: pyxc [-h] {build} ...

The PyX compiler — compiles .pyx files to .jsx

positional arguments:
  {build}
    build     Compile a .pyx file to .jsx

options:
  -h, --help  show this help message and exit
```

---

### SAVE AND TRY

```
> pyxc build --help
```

**Expected output:**
```
usage: pyxc build [-h] [--output OUTPUT] input

positional arguments:
  input                 Path to the .pyx source file

options:
  -h, --help            show this help message and exit
  --output OUTPUT, -o OUTPUT
                        Path to the output .jsx file (default: same name, .jsx extension)
```

`argparse` generated this help text automatically from your `add_argument` calls. You wrote zero help-text formatting code.

---

## Step 6 — Create a Test File and Run the Compiler

Create `examples/hello.pyx` with this content:

```python
def Hello():
    return <div>Hello from PyX</div>
```

This is not valid Python (the `<div>` will cause a syntax error if you try to run it with Python directly). That is fine — it is a `.pyx` file. The compiler will eventually handle the element syntax. For now the compiler just copies it.

Run the compiler:

```
> pyxc build examples/hello.pyx
```

**Expected output:**
```
Compiled examples/hello.pyx → examples/hello.jsx
```

Open `examples/hello.jsx`. It should contain exactly what `hello.pyx` contained:

```python
def Hello():
    return <div>Hello from PyX</div>
```

The compiler read the file and wrote it back unchanged. The pipeline works. The identity transform is done.

---

### SAVE AND TRY

Run the compiler with an explicit output path:

```
> pyxc build examples/hello.pyx --output examples/output.jsx
```

**Expected output:**
```
Compiled examples/hello.pyx → examples/output.jsx
```

Check that `examples/output.jsx` was created with the same content.

**Try the error case:**

```
> pyxc build examples/does_not_exist.pyx
```

**Expected output:** A Python traceback ending with `FileNotFoundError: [Errno 2] No such file or directory: 'examples/does_not_exist.pyx'`

This error is ugly. You will fix error handling in Lab 11 — for now it confirms that the file reading code is actually running.

---

## Challenge: Add a `--version` Flag

**You know:** `argparse.ArgumentParser` has `add_argument`. Arguments starting with `--` are optional flags. `action="store_true"` stores `True` when a flag is present, `False` when it is absent.

**Task:** Add a `--version` flag to `cli.py`. When the user runs `pyxc --version`, print `pyxc 0.1.0` and exit. Do not use `argparse`'s built-in version action — just check `args.version` yourself.

**Expected behavior:**
```
> pyxc --version
pyxc 0.1.0
```

Try for at least 5 minutes before revealing the solution.

---

<details>
<summary>▶ Show Solution</summary>

Add this argument to the parser (before `add_subparsers`):

```python
parser.add_argument(
    "--version", "-v",
    action="store_true",
    help="Print the compiler version and exit",
)
```

Then check it before handling subcommands:

```python
args = parser.parse_args()

if args.version:
    print("pyxc 0.1.0")
    sys.exit(0)

if args.command == "build":
    _run_build(args.input, args.output)
```

**Key insight:** `sys.exit(0)` exits the program immediately with exit code `0`. Exit code `0` means success. Exit code non-zero (usually `1`) means failure. Programs that call `pyxc` in a build script use the exit code to detect errors. `sys.exit(0)` is the correct way to exit after printing help or version information.

</details>

---

## Final Check

Go through this table before moving to Lab 02.

| Feature | How to verify |
|---|---|
| Virtual environment active | Terminal prompt shows `(.venv)` |
| `pyxc` command exists | `pyxc --help` prints usage |
| `pyxc build` subcommand works | `pyxc build examples/hello.pyx` prints "Compiled..." |
| Output file created | `examples/hello.jsx` exists with same content as `hello.pyx` |
| `--output` flag works | `pyxc build examples/hello.pyx -o examples/out.jsx` creates `out.jsx` |
| Help text generated | `pyxc build --help` shows argument descriptions |

---

## Your Complete Files

### `pyproject.toml`
```toml
[build-system]
requires = ["setuptools>=61"]
build-backend = "setuptools.backends.legacy:build"

[project]
name = "pyx-compiler"
version = "0.1.0"
requires-python = ">=3.10"
dependencies = []

[project.scripts]
pyxc = "compiler.cli:main"
```

### `compiler/__init__.py`
```python
```
(empty file)

### `compiler/cli.py`
```python
import argparse
import sys


def main() -> None:
    parser = argparse.ArgumentParser(
        prog="pyxc",
        description="The PyX compiler — compiles .pyx files to .jsx",
    )
    parser.add_argument(
        "--version", "-v",
        action="store_true",
        help="Print the compiler version and exit",
    )

    subparsers = parser.add_subparsers(dest="command", required=True)

    build_parser = subparsers.add_parser("build", help="Compile a .pyx file to .jsx")
    build_parser.add_argument("input", help="Path to the .pyx source file")
    build_parser.add_argument(
        "--output", "-o",
        help="Path to the output .jsx file (default: same name, .jsx extension)",
        default=None,
    )

    args = parser.parse_args()

    if args.version:
        print("pyxc 0.1.0")
        sys.exit(0)

    if args.command == "build":
        _run_build(args.input, args.output)


def _run_build(input_path: str, output_path: str | None) -> None:
    if output_path is None:
        if input_path.endswith(".pyx"):
            output_path = input_path[:-4] + ".jsx"
        else:
            output_path = input_path + ".jsx"

    with open(input_path, "r", encoding="utf-8") as f:
        source = f.read()

    result = source

    with open(output_path, "w", encoding="utf-8") as f:
        f.write(result)

    print(f"Compiled {input_path} → {output_path}")
```

### `examples/hello.pyx`
```python
def Hello():
    return <div>Hello from PyX</div>
```

### Project structure at end of Lab 01
```
pyx/
├── .venv/                  ← virtual environment (do not edit)
├── compiler/
│   ├── __init__.py         ← empty, marks compiler/ as a Python package
│   └── cli.py              ← the pyxc entry point
├── examples/
│   ├── hello.pyx           ← test source file
│   └── hello.jsx           ← compiled output (identity transform)
└── pyproject.toml          ← project definition
```

---

## Quick Check Answers

**1. When you run `python script.py`, does Python compile or interpret?**

Both, in sequence. Python first compiles your `.py` file to bytecode (the `.pyc` files in `__pycache__/`) and then interprets the bytecode. The "compilation" step is fast and mostly hidden from you. When people say "Python is interpreted," they mean it does not produce native machine code — the bytecode is interpreted by the Python runtime. This is why Python is slower than C for CPU-heavy work but faster to develop with: there is no separate compile step you have to run before testing.

**2. TypeScript, CoffeeScript, and Sass all compile to something. What and why?**

- TypeScript → JavaScript
- CoffeeScript → JavaScript
- Sass → CSS

The output must be a language the runtime understands. Browsers understand JavaScript and CSS. There is no choice — you must output one of those two. The source languages exist to give developers a better writing experience: TypeScript adds types, CoffeeScript adds cleaner syntax, Sass adds variables and nesting. The compiled output is what the browser actually runs.

**3. Why build four stages as separate functions rather than one big function?**

Each stage has a single job with a clear input type and output type:
- Lexer: string → list of tokens
- Parser: list of tokens → tree
- Transformer: source tree → target tree
- Code generator: target tree → string

With separate stages: you can test the lexer independently (does it correctly identify element boundaries?). You can reuse the parser with a different code generator. You can replace just the code generator to support a new output format. If there is a bug in the transformer, you know exactly where to look.

With one big function: every bug requires stepping through the entire thing. Every test exercises the whole pipeline. Every change risks breaking every other stage. The single-responsibility principle — each unit does one thing — is not just style. It directly determines whether the code is maintainable.

---

*End of LAB 01.*

*Lab 02 builds the pre-processor's lexer — the first real parser code. You will write a finite state machine that reads a `.pyx` source string character by character and identifies which parts are Python and which parts are element syntax.*
