**Lesson 3: Basic Terminal Syntax Highlighting**

### What you will build
A colored terminal viewer that displays tokenized G-code with meaningful colors (G/M codes blue, axes green, numbers orange, comments gray). This makes the PDM usable immediately and demonstrates the value of tokenization.

**Transferable problems**: Applying styles to structured text output, separation of concerns (tokens → rendering).

**What you need to know first**: Lessons 1–2 (loading + tokenization).

**Pipeline**: Text → Lexer (tokens) → **Renderer** (this lesson) → ...

---

## Concept Unit: ANSI Color Rendering

### The Problem
Plain text output is hard to read for long G-code programs. We need to apply visual styles based on token types without changing the underlying data.

### Introduce the concept in isolation
**Throwaway lab** (`lab_ansi.py`):

```python
class Colors:
    BLUE = "\033[94m"
    GREEN = "\033[92m"
    RESET = "\033[0m"

print(Colors.BLUE + "G01" + Colors.RESET + " X100")
```

**Output**: `G01` appears in blue, followed by white `X100`.

**What this proves**: ANSI escape codes let us change text color in most terminals without external libraries.

**Discard the throwaway example.**

### Project Change
- **Files affected**: New `pdm/renderer.py`; update `main.py`.
- **Change type**: New module.
- **Location**: New file.
- **Dependencies**: None.

### The New Code — type it yourself
Create `pdm/renderer.py`:

```python
from tokenizer import Token, TokenType

class Colors:
    G_M = "\033[94m"    # Blue
    AXIS = "\033[92m"   # Green
    NUMBER = "\033[93m" # Yellow/Orange
    COMMENT = "\033[90m"# Gray
    RESET = "\033[0m"

def highlight_line(tokens):
    parts = []
    for token in tokens:
        if token.type in (TokenType.G_CODE, TokenType.M_CODE):
            parts.append(Colors.G_M + token.value + Colors.RESET)
        elif token.type == TokenType.AXIS:
            parts.append(Colors.AXIS + token.value + Colors.RESET)
        elif token.type == TokenType.NUMBER:
            parts.append(Colors.NUMBER + token.value + Colors.RESET)
        elif token.type == TokenType.COMMENT:
            parts.append(Colors.COMMENT + token.value + Colors.RESET)
        else:
            parts.append(token.value)
    return " ".join(parts)
```

### The Updated Project
New complete `pdm/renderer.py` (as shown above).

Updated `pdm/main.py`:

```python
from gcode_file import load_and_tokenize
from renderer import highlight_line   # ← new

if __name__ == "__main__":
    tokens_per_line = load_and_tokenize("example.nc")
    for line_num, tokens in enumerate(tokens_per_line, 1):
        highlighted = highlight_line(tokens)   # ← new
        print(f"{line_num:3d}: {highlighted}")
```

### Mechanical walkthrough
1. `class Colors` — groups ANSI codes.
2. `"\033[94m"` — escape sequence for blue (first appearance of ANSI).
3. `highlight_line(tokens)` — takes list of tokens, returns styled string.
4. `if token.type in (TokenType.G_CODE, TokenType.M_CODE)` — type-based dispatch.
5. `Colors.XXX + value + RESET` — wrap with color and reset.
6. `" ".join(parts)` — reassemble the line.

### CS Lens
**Styling as transformation** of structured data.  
Also recognized in: web CSS, syntax-highlighting editors (VS Code), terminal UIs, data visualization pipelines.

### SE Lens
We kept rendering separate from tokenization (single responsibility). Alternative (mixing colors into tokenizer) would couple concerns tightly. Tradeoff: Cleaner code vs. slightly more function calls.

### Run it
```bash
python main.py
```

You should see color-coded G-code lines (works best in modern terminals).

---

## Concept Unit: Basic File Statistics

### The Problem
Users need quick insights (line count, estimated time, tool changes) before visualizing.

### Introduce the concept in isolation
**Throwaway lab** skipped — reuses prior concepts (loops over tokens).

### Project Change
- **Files affected**: `pdm/analyzer.py` (new); update `main.py`.
- **Change type**: New simple analysis module.
- **Location**: New file.

### The New Code — type it yourself
Create `pdm/analyzer.py`:

```python
from tokenizer import TokenType

def basic_stats(tokens_per_line):
    total_lines = len(tokens_per_line)
    tool_changes = sum(1 for line in tokens_per_line 
                      for t in line if t.type == TokenType.M_CODE and "M6" in t.value.upper())
    return {
        "lines": total_lines,
        "tool_changes": tool_changes
    }
```

### The Updated Project
New `pdm/analyzer.py` (full as above).

Updated `main.py`:

```python
from gcode_file import load_and_tokenize
from renderer import highlight_line
from analyzer import basic_stats   # ← new

if __name__ == "__main__":
    tokens_per_line = load_and_tokenize("example.nc")
    stats = basic_stats(tokens_per_line)   # ← new
    
    print("=== G-code PDM Preview ===")
    print(f"Lines: {stats['lines']} | Tool changes: {stats['tool_changes']}\n")
    
    for line_num, tokens in enumerate(tokens_per_line[:15], 1):  # limit for terminal
        print(f"{line_num:3d}: {highlight_line(tokens)}")
```

### Mechanical walkthrough
1. `def basic_stats(tokens_per_line)`
2. `len(tokens_per_line)` — total lines.
3. Nested generator expression with `sum()` and condition on `M6`.
4. Returns a dict of stats.

### CS Lens
**Lightweight static analysis** on tokens.  
Also recognized in: linters, code metrics tools, spreadsheet summaries.

### SE Lens
Simple dict return instead of a full class for now (low complexity). Tradeoff: Fast to write vs. harder to extend later (future debt acknowledged).

### Run it
Rerun `python main.py` — see stats header + colored lines.

---

## Closing

**Connect the pieces**: File → lines → tokens → highlighted output + stats. Full flow for one concrete file now works.

**What breaks without this**: Remove the renderer → plain text only (much harder to review code). Delete stats → no overview.

**Exercises**
1. Add feed rate detection to stats.
2. Support more token types (e.g., F for feed).
3. Make line limit configurable via command line argument (`sys.argv`).

**Definition of done**
- [ ] Colored terminal output working
- [ ] Basic stats displayed
- [ ] `git commit -m "Lesson 3: Terminal syntax highlighting and stats"`

---

Ready for **Lesson 4** (e.g., web-based viewer with CodeMirror or simple Tkinter GUI, or start the backplot pipeline)? Let me know preferences.