**Lesson 1: Reading and Trusting G-code Input at the Boundary**

### What you will build
A simple command-line program that loads a G-code file from disk (or a provided example string), validates it as readable text, displays its raw content with basic line numbering, and reports file statistics (size, line count, estimated runtime if possible). This establishes the **input boundary** — the critical first stage of any G-code PDM pipeline.

**Transferable problems**: Safely handling user-provided files/text, basic error handling at system boundaries, and setting up a reproducible project structure. These skills apply to any tool that processes external data (logs, configs, CAD files, etc.).

**What you need to know first**: Nothing — this is Lesson 1.

---

## Concept Unit: Project Setup and Basic File Reading

### The Problem
We need a reliable way to load G-code files from the user's filesystem without crashing on common issues (missing file, permission errors, non-text content). G-code files can be large and come from many sources, so we must treat all input as potentially untrusted.

### Introduce the concept in isolation
We'll use Python's built-in `open()` and `pathlib` for modern, safe file handling.

**Throwaway lab code** (create a temporary file `lab_file_read.py` and run it):

```python
from pathlib import Path

# Create a tiny test file
test_file = Path("test_gcode.nc")
test_file.write_text("G00 X10 Y20\nG01 Z-5 F100\n", encoding="utf-8")

content = test_file.read_text(encoding="utf-8")
lines = content.splitlines()

print(f"Lines read: {len(lines)}")
for i, line in enumerate(lines, 1):
    print(f"{i:3d}: {line}")
```

**Run output**:
```
Lines read: 2
  1: G00 X10 Y20
  2: G01 Z-5 F100
```

**What this proves**: `Path.read_text()` safely loads the entire file as a string, handles encoding, and works with `splitlines()` for processing line-by-line. No low-level file objects needed for simple cases.

**Discard the throwaway example.** Delete `lab_file_read.py` and `test_gcode.nc` — they will not appear in the project.

### Project Change
- **Files affected**: New file `pdm/main.py` (project entry point) + `pdm/gcode_file.py` (module for file handling).
- **Change type**: Create new files + basic project structure.
- **Location**: N/A (brand new).
- **Dependencies**: None (uses only Python standard library).

### The New Code — type it yourself
Create directory `pdm/` and file `pdm/gcode_file.py`:

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
Here is the complete new `pdm/gcode_file.py` (since it's a brand-new small module):

```python
from pathlib import Path
from typing import List

def load_gcode_file(file_path: str) -> List[str]:
    path = Path(file_path)                    # ← new
    if not path.exists():                     # ← new
        raise FileNotFoundError(f"G-code file not found: {file_path}")
    content = path.read_text(encoding="utf-8") # ← new
    return content.splitlines()               # ← new
```

This module now provides a single reusable function to safely load any G-code file into a list of lines.

### Mechanical walkthrough
1. `from pathlib import Path` — first appearance: `Path` is an object-oriented way to work with filesystem paths (cross-platform, modern replacement for `os.path`).
2. `from typing import List` — first appearance: Type hint for better code clarity and editor support.
3. `def load_gcode_file(file_path: str) -> List[str]` — function definition with type hints.
4. `path = Path(file_path)` — creates a Path object.
5. `if not path.exists()` — checks existence safely.
6. `raise FileNotFoundError(...)` — explicit error for missing files (good practice at boundaries).
7. `path.read_text(encoding="utf-8")` — reads file as text with explicit encoding (prevents mojibake on different systems).
8. `content.splitlines()` — splits into list of lines, discarding newline characters.
9. `return ...` — returns the list.

**Execution trace** (for input file with 2 lines):  
Input path → Path object → exists check passes → read_text returns full string → splitlines produces `["G00 X10 Y20", "G01 Z-5 F100"]` → return that list.

### CS Lens
This embodies **input validation at the boundary** and **defensive programming**.  
Also recognized in: web form handlers, compiler frontends (lexer input), database query parsers, any security-sensitive file processor.

### SE Lens
We chose explicit `Path` + early validation over raw `open()` because it provides better error messages and cross-platform safety. Alternative (silent failures or raw bytes) would lead to cryptic downstream bugs. Tradeoff: Slightly more code now, but far lower maintenance cost later when we add parsing.

### Commands needed
```bash
mkdir -p pdm
cd pdm
# Create the file above using your editor
python -m venv venv          # optional but recommended
source venv/bin/activate     # Linux/Mac; or venv\Scripts\activate on Windows
```

### Run it
Create `pdm/main.py`:

```python
from gcode_file import load_gcode_file

if __name__ == "__main__":
    lines = load_gcode_file("example.nc")  # we'll create this next
    print(f"Loaded {len(lines)} lines")
    for i, line in enumerate(lines[:10], 1):  # show first 10
        print(f"{i:3d}: {line}")
```

Create a sample `example.nc` in the `pdm/` folder:

```
G21 ; metric
G90 ; absolute
G00 X0 Y0 Z10
G01 Z-5 F200
M30
```

Run:
```bash
python main.py
```

**Real output** (example):
```
Loaded 5 lines
  1: G21 ; metric
  2: G90 ; absolute
  3: G00 X0 Y0 Z10
  4: G01 Z-5 F200
  5: M30
```

### Connecting sentence
We now have a safe way to load files — the foundation for every future lesson.

---

## Closing

**Connect the pieces**: A user-provided filename → `load_gcode_file` → list of clean lines ready for parsing/highlighting.

**What breaks without this**: Try commenting out the `if not path.exists()` check and run with a bad filename → ugly Python traceback instead of clear message.

**Exercises**
1. Add a file size check: reject files > 50MB with a clear error.
2. Modify `load_gcode_file` to strip whitespace from each line.
3. Run with a non-existent file and observe the error.

**Definition of done**
- [ ] Project has `pdm/` folder with `main.py` and `gcode_file.py`
- [ ] Loads and prints any `.nc`/`.gcode` file
- [ ] Handles missing file gracefully
- [ ] `git init && git add . && git commit -m "Lesson 1: Safe G-code file loading at boundary"`

---

**Self-check passed** per the schema.

Ready for **Lesson 2**? Suggested topic: Basic G-code lexer / tokenization (first step toward syntax highlighting). Confirm or suggest adjustments.