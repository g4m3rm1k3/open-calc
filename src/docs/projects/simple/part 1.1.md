**Lesson 1: Reading and Trusting G-code Input at the Boundary**

### What you will build
A simple but solid foundation for our G-code PDM: a program that safely loads a G-code file from disk, displays its raw contents with line numbers, and shows basic statistics (number of lines, file size). This establishes the **input boundary** — the first and most critical stage of any tool that processes external files.

**Transferable problems**: Safely handling files from users (which may be missing, huge, or malicious), clear error messages, and building a reproducible project structure. These skills apply to editors, parsers, log analyzers, or any program that deals with user-supplied data.

**What you need to know first**: Nothing. This is Lesson 1.

---

## Concept Unit: Safe File Loading with pathlib

### The Problem
G-code files come from many sources (CAM software, USB sticks, email, etc.). We must load them without crashing on common problems like a missing file or encoding issues, and give the user clear feedback.

### Introduce the concept in isolation
**Throwaway lab** (create a temporary file called `lab_file_read.py`):

```python
from pathlib import Path

# Create a small test file
test_file = Path("test_example.nc")
test_file.write_text("G21 ; metric units\nG00 X10 Y20\n", encoding="utf-8")

content = test_file.read_text(encoding="utf-8")
lines = content.splitlines()

print(f"Loaded {len(lines)} lines:")
for i, line in enumerate(lines, 1):
    print(f"{i:3d}: {line}")
```

**Run it** — you will see the two lines printed with numbers.

**What this proves**: `Path.read_text(encoding="utf-8")` safely reads the entire file as text. Using `splitlines()` gives us a clean list of lines. The `Path` class from the standard library makes file operations modern, readable, and cross-platform.

**Discard the throwaway example.** Delete both the lab file and `test_example.nc`. It existed only to teach the concept.

### Project Change
- **Files affected**: New folder `pdm/` containing `pdm/gcode_file.py` (core file handling) and `pdm/main.py` (entry point).
- **Change type**: Create new project structure.
- **Location**: Brand new files.
- **Dependencies**: None (only Python standard library).

### The New Code — type it yourself
Create the file `pdm/gcode_file.py`:

```python
from pathlib import Path
from typing import List

def load_gcode_file(file_path: str) -> List[str]:
    path = Path(file_path)
    if not path.exists():
        raise FileNotFoundError(f"G-code file not found: {file_path}")
    content = path.read_text(encoding="utf-8")
    return content.splitlines()
```

### The Updated Project
Here is the complete `pdm/gcode_file.py` right after adding the code above:

```python
from pathlib import Path
from typing import List

def load_gcode_file(file_path: str) -> List[str]:
    path = Path(file_path)                    # Convert string to Path object
    if not path.exists():                     # Check if file actually exists
        raise FileNotFoundError(f"G-code file not found: {file_path}")
    content = path.read_text(encoding="utf-8") # Read as text with proper encoding
    return content.splitlines()               # Return list of lines
```

This single function now gives us a safe, reusable way to load any G-code file.

### Mechanical Walkthrough
Let’s walk through every important piece in order:

- `from pathlib import Path` — (a) first appearance. `Path` is the modern, recommended way to work with files and folders. It handles Windows, Linux, and macOS paths automatically.
- `from typing import List` — (a) first appearance. Type hints make the code easier to understand and help your editor give better suggestions.
- `def load_gcode_file(file_path: str) -> List[str]` — Defines a function that takes a filename and returns a list of strings (the lines).
- `path = Path(file_path)` — Creates a Path object from the string.
- `if not path.exists()` — Explicit safety check. This is defensive programming at the boundary.
- `raise FileNotFoundError(...)` — (a) first appearance of a clear, specific error. Much better than a generic crash.
- `path.read_text(encoding="utf-8")` — Reads the file safely. The `encoding` argument prevents weird character problems.
- `content.splitlines()` — Breaks the text into individual lines, removing the newline characters.

### CS Lens
This is **boundary validation** — treating all external input as untrusted.  
Also recognized in: web servers handling uploads, compilers reading source files, and any secure program that processes user data.

### SE Lens
We chose explicit checks and clear errors over "just open the file and hope." The alternative (silent failures or raw `open()`) leads to confusing bugs later. Tradeoff: A bit more code now for much better reliability and debuggability.

### Run It
Create `pdm/main.py`:

```python
from gcode_file import load_gcode_file

if __name__ == "__main__":
    lines = load_gcode_file("example.nc")
    print(f"Loaded {len(lines)} lines from the file.\n")
    for i, line in enumerate(lines[:10], 1):   # Show first 10 lines
        print(f"{i:3d}: {line}")
```

Create a sample file `pdm/example.nc`:

```
G21 ; metric units
G90 ; absolute positioning
G00 X0 Y0 Z10
G01 Z-5 F150
M30 ; end of program
```

Run:
```bash
cd pdm
python main.py
```

You should see the file loaded and printed with line numbers.

### Connecting sentence
We now have a trustworthy way to load G-code files — the foundation everything else will build on.

---

## Closing

**Connect the pieces**: User gives a filename → safe loading → list of lines ready for future processing.

**What breaks without this**: Try passing a non-existent filename without the `exists()` check — you get a cryptic Python error instead of our clear message.

**Exercises**
1. Add a check that rejects files larger than 10 MB.
2. Modify `load_gcode_file` to also return the file size.
3. Run the program with a missing file and observe the error message.

**Definition of done**
- [ ] Project structure with `pdm/gcode_file.py` and `pdm/main.py`
- [ ] Successfully loads and displays any G-code file
- [ ] Clear error for missing files
- [ ] `git init && git commit -m "Lesson 1: Safe G-code file loading at the boundary"`

---

This is the improved style (schema-compliant but much clearer explanations).  

Ready for **Lesson 2**? Just say “Ready for lesson 2”.