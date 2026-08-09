# Lesson 0: Understanding init. 

The `ModuleNotFoundError: No module named 'src'` error happens because Python doesn't know where to find the `src` directory when `pytest` runs, or it doesn't recognize `src` as a valid Python package.

Here are the most common ways to fix this, starting with the easiest:

### 1. Run pytest as a Python module (Easiest Fix)

Instead of typing just `pytest`, run it through the Python executable. This automatically adds your current directory (`Android lessons`) to Python's system path, allowing it to find the `src` folder.

Run this in your PowerShell terminal:

```powershell
python -m pytest

```

### 2. Verify Your Folder Structure

Make sure you are running the command from the correct root folder and that the `src` folder actually exists right next to your `tests` folder. Your file tree inside `C:\Users\<username>\Documents\...\` must look exactly like this:

```text
Top level folder/
├── src/
│   └── parser/
```

### Current File Structure Checkpoint
*Crucial: Ensure your project file structure tracks exactly as shown below to prevent environment drift across steps.*

```text
Top Level Folder/
├── conftest.py
├── src/
│   ├── __init__.py
│   └── parser/
│       ├── __init__.py
│       └── lexer.py
└── tests/
    └── test_lexer.py
```

### Absolute vs. Relative Imports
*   **Absolute Imports:** `from src.parser import lexer` (Always starts from the project root. Safer, but can be verbose).
*   **Relative Imports:** `from . import lexer` (Current directory) or `from .. import parser` (One directory up).

### The Danger of Circular Imports
**Warning:** A common pitfall in complex software architectures is the circular import (where File A imports File B, but File B also imports File A). This will crash Python. Always try to keep your imports flowing in one direction!

### Implicit Namespace Packages (Python 3.3+)
While `__init__.py` is required in older Python versions, Python 3.3+ introduced *Implicit Namespace Packages*. This means Python *can* treat folders without `__init__.py` as packages, but doing so can sometimes confuse older tools or specific Pytest configurations. It is generally safer to include them when building comprehensive testing frameworks.

### Interactive Challenge
Fix the broken virtual file tree in the editor below by adding the missing `__init__.py` files or fixing a broken `from x import y` statement to make the mock Pytest run turn green.

```
│       └── lexer.py      <-- (Your code from Lesson 1)
└── tests/
    └── test_lexer.py     <-- (The test file you just created)

```

If your `src` folder is somewhere else or named differently, Python won't be able to import it.

### 3. Add `__init__.py` Files

Python sometimes needs a special file called `__init__.py` to explicitly tell it that a directory is a package containing importable modules.

Create an empty file named `__init__.py` inside both the `src` and `parser` directories:

* `src/__init__.py`
* `src/parser/__init__.py`

*(Note: In newer versions of Python, this is often optional, but testing frameworks like pytest still frequently rely on them to map out the project structure correctly).*

### 4. Set the PYTHONPATH Environment Variable

If the above steps don't work, you can force your terminal to recognize the current folder as the root for Python imports.

Since you are using PowerShell, run this command before running pytest:

```powershell
$env:PYTHONPATH = "."
pytest

```

At its core, the `__init__.py` file is Python’s way of knowing that a directory isn't just a random folder full of files, but an official **Python Package** that can be imported.

Here is exactly how Python uses it and what kind of magic you can put inside those specific `src/__init__.py` and `src/parser/__init__.py` files.

### How Python Uses `__init__.py`

When you write `from src.parser.lexer import lex_block`, Python looks at the `src` folder. If it sees `__init__.py`, it says, "Ah, this is a package!" It then executes whatever code is inside `src/__init__.py`.
Next, it looks into the `parser` folder, finds *that* `__init__.py`, and runs it. Finally, it grabs your `lexer.py` file.

**Crucial detail:** Python only runs a package's `__init__.py` **once** per session, the very first time you import anything from that package.

### What Can You Put Inside Them?

Most of the time in modern Python, **you leave them completely empty**. Just their existence is enough to make the imports work. However, if you want to write code in them, here are the most common uses:

#### 1. "Convenience" Imports (Flattening the Namespace)

This is the coolest and most common use for `__init__.py`. You can use it to make your imports shorter and cleaner for the rest of your project.

Right now, your test file has to dig deep to get the function:

```python
from src.parser.lexer import lex_block

```

If you open **`src/parser/__init__.py`** and add this single line:

```python
# Inside src/parser/__init__.py
from .lexer import lex_block 

```

*(Note the `.` which means "from the lexer file in this exact same folder")*

You are "promoting" `lex_block` to the top level of the `parser` package. Now, anywhere else in your project (like your test file), you can import it much more cleanly:

```python
# Inside tests/test_lexer.py
from src.parser import lex_block

```

#### 2. Controlling What Gets Exported (`__all__`)

If your `lexer.py` file has 20 different helper functions in it, but you only want people to use the main `lex_block` function, you can use `__all__` in the `__init__.py` file to gatekeep.

```python
# Inside src/parser/__init__.py
from .lexer import lex_block
from .lexer import some_internal_helper

# Only lex_block is allowed to be imported when someone uses `from src.parser import *`
__all__ = ['lex_block'] 

```

#### 3. Package-Level Setup and Variables

Because the `__init__.py` runs the moment the package is imported, you can use it to set up things that the whole package needs to share.

For example, in `src/parser/__init__.py`, you could define package-wide variables:

```python
# Inside src/parser/__init__.py
PARSER_VERSION = "1.0.0"
SUPPORTED_G_CODES = ['G00', 'G01', 'G02', 'G03']

```

Then, any file in your project can just do `from src.parser import PARSER_VERSION`.

### The Verdict for Your Project

For your `Android lessons` project:

* **`src/__init__.py`**: Definitely leave this one **completely empty**. It just needs to exist so Python knows `src` is a package.
* **`src/parser/__init__.py`**: Leave it empty for now. But as you add more files to the parser (like `parser/ast.py` or `parser/nodes.py`), you might want to use it for **Convenience Imports** so your main application doesn't have to memorize exactly which sub-file every function lives in!