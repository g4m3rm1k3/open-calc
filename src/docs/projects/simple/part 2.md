**Lesson 2: Tokenizing G-code Lines**

### What you will build
Extend the loader to break each G-code line into structured **tokens** (e.g., `G00`, `X10.5`, `; comment`). This creates the foundation for syntax highlighting, validation, and the backplot pipeline.

**Transferable problems**: Lexical analysis (turning raw text into tokens) — the first stage of any parser, compiler, or domain-specific language processor.

**What you need to know first**: Lesson 1 (safe file loading into lines).

**Pipeline diagram** (Text → Lexer → ...):  
**Text → Lexer** (this lesson) → Parser → Semantic Analysis → Backplot Renderer  
Concrete example carried through:  
`G01 X100.0 Y50.5 F200 ; rapid move`  
→ lines (Lesson 1) → tokens: `[G01, X100.0, Y50.5, F200, ; rapid move]`

---

## Concept Unit: Defining Token Types

### The Problem
Raw lines are just strings. To highlight or interpret G-code we need to classify parts of each line (motion codes, coordinates, feeds, comments, etc.).

### Introduce the concept in isolation
**Throwaway lab** (new temp file `lab_token_types.py`):

```python
from enum import Enum

class TokenType(Enum):
    G_CODE = "G_CODE"
    M_CODE = "M_CODE"
    COORD = "COORD"
    COMMENT = "COMMENT"

print(TokenType.G_CODE)
print(TokenType.G_CODE.value)
print(list(TokenType))
```

**Output**:
```
TokenType.G_CODE
G_CODE
[<TokenType.G_CODE: 'G_CODE'>, <TokenType.M_CODE: 'M_CODE'>, ...]
```

**What this proves**: `Enum` gives us a clean, explicit set of named categories with string values, preventing typos and enabling easy matching later.

**Discard the throwaway example.** Delete the lab file.

### Project Change
- **Files affected**: Modified `pdm/gcode_file.py` (add token support); New `pdm/tokenizer.py`.
- **Change type**: Add new module + extend existing.
- **Location**: New file `tokenizer.py`; small addition to `gcode_file.py`.
- **Dependencies**: `enum` from standard library (Python 3.6+).

### The New Code — type it yourself
Create `pdm/tokenizer.py`:

```python
from enum import Enum
from typing import NamedTuple

class TokenType(Enum):
    G_CODE = "G"
    M_CODE = "M"
    AXIS = "AXIS"
    NUMBER = "NUMBER"
    COMMENT = "COMMENT"
    OTHER = "OTHER"

class Token(NamedTuple):
    type: TokenType
    value: str
```

### The Updated Project
Updated `pdm/gcode_file.py` (now exports tokens too):

```python
from pathlib import Path
from typing import List
from tokenizer import Token, TokenType   # ← new import

def load_gcode_file(file_path: str) -> List[str]:
    path = Path(file_path)
    if not path.exists():
        raise FileNotFoundError(f"G-code file not found: {file_path}")
    content = path.read_text(encoding="utf-8")
    return content.splitlines()

# New helper (added at bottom)
def load_and_tokenize(file_path: str) -> List[List[Token]]:
    lines = load_gcode_file(file_path)
    return [tokenize_line(line) for line in lines]  # will implement next
```

Complete new `pdm/tokenizer.py`:

```python
from enum import Enum
from typing import NamedTuple

class TokenType(Enum):
    G_CODE = "G"
    M_CODE = "M"
    AXIS = "AXIS"
    NUMBER = "NUMBER"
    COMMENT = "COMMENT"
    OTHER = "OTHER"

class Token(NamedTuple):
    type: TokenType
    value: str
```

These two files together now provide typed tokens.

### Mechanical walkthrough
1. `from enum import Enum` — first appearance: Creates enumerated constants.
2. `class TokenType(Enum)` — defines a new enumeration.
3. `G_CODE = "G"` — each member has a human-readable value.
4. `from typing import NamedTuple` — first appearance: Lightweight immutable data class.
5. `class Token(NamedTuple)` — defines a record with `type` and `value` fields.
6. `type: TokenType` — type annotation using the Enum.
7. `value: str` — stores the actual text.

(No loops here.)

### CS Lens
This is **lexical analysis** (lexer/tokenizer stage).  
Also recognized in: compilers (C, Python, JavaScript), JSON parsers, URL routers, spreadsheet formula engines, every CNC controller firmware.

### SE Lens
We used `Enum` + `NamedTuple` instead of plain strings or dicts for type safety and clarity. Alternative (magic strings everywhere) creates subtle bugs. Tradeoff: More upfront structure, but vastly better maintainability as the tokenizer grows.

### Commands needed
No new commands — just edit the files.

### Run it
Update `pdm/main.py`:

```python
from gcode_file import load_and_tokenize
from tokenizer import TokenType

if __name__ == "__main__":
    tokens_per_line = load_and_tokenize("example.nc")
    for line_num, tokens in enumerate(tokens_per_line[:3], 1):
        print(f"Line {line_num}:")
        for t in tokens:
            print(f"  {t.type.value:6} → {t.value}")
```

**Note**: `tokenize_line` is not implemented yet — this will fail. That's expected.

**Real output** (after we add the function in next unit): Will show classified tokens.

### Connecting sentence
Token types are now defined — next we implement the actual splitting logic.

---

## Concept Unit: Simple Line Tokenization

### The Problem
We need to split a single G-code line into individual tokens while recognizing comments and basic words.

### Introduce the concept in isolation
**Throwaway lab** (`lab_split.py`):

```python
import re

line = "G01 X100.5 Y-50 ; comment here"
parts = re.findall(r'([A-Za-z][0-9.-]+)|(;.*)', line)
print(parts)
```

**Output** (simplified): Shows matched groups for codes and comments.

**What this proves**: Regex can extract structured parts from G-code lines reliably.

**Discard the throwaway example.**

### Project Change
- **Files affected**: `pdm/tokenizer.py`
- **Change type**: Add implementation function.
- **Location**: Inside `tokenizer.py`, after the class definitions.
- **Dependencies**: `re` standard library.

### The New Code — type it yourself
Add to `pdm/tokenizer.py`:

```python
import re

def tokenize_line(line: str) -> List[Token]:
    tokens = []
    # Simple regex for now: words like G01, X100, comments
    for match in re.finditer(r'([A-Za-z][0-9.-]*)|(;.*)', line.strip()):
        val = match.group(0)
        if val.startswith(';'):
            tokens.append(Token(TokenType.COMMENT, val))
        elif val[0].isalpha():
            if val[0].upper() in 'GM':
                tokens.append(Token(TokenType.G_CODE if val[0].upper() == 'G' else TokenType.M_CODE, val))
            else:
                tokens.append(Token(TokenType.AXIS if val[0].upper() in 'XYZABC' else TokenType.OTHER, val))
        else:
            tokens.append(Token(TokenType.NUMBER, val))
    return tokens
```

### The Updated Project
Updated `pdm/tokenizer.py` (full relevant part):

```python
import re
from enum import Enum
from typing import List, NamedTuple

class TokenType(Enum):
    ... # as before

class Token(NamedTuple):
    ... # as before

def tokenize_line(line: str) -> List[Token]:   # ← new function
    tokens = []
    for match in re.finditer(...):            # ← new
        ...                                        # full body above
    return tokens
```

### Mechanical walkthrough
(Enumeration of the new `tokenize_line` code — every element):

1. `import re` — first appearance: Regular expression module for pattern matching.
2. `def tokenize_line(line: str)` — new function.
3. `re.finditer(r'pattern', line.strip())` — finds all non-overlapping matches.
4. `match.group(0)` — gets the full matched text.
5. `if val.startswith(';')` — comment detection.
6. `elif val[0].isalpha()` — letter-starting codes.
7. `val[0].upper() in 'GM'` — modal command classification.
8. `Token(...)` constructor calls.

**Execution trace** example line `"G01 X100 ; fast"`:
- Match "G01" → G_CODE
- Match "X100" → AXIS
- Match "; fast" → COMMENT

### CS Lens
**Finite state / pattern matching** for tokenization.  
Also recognized in: text editors, search engines, network protocol parsers, DNA sequence analyzers.

### SE Lens
Regex for initial lexer is simple but has limits (we'll improve later). Alternative (manual character-by-character) is more robust for complex dialects but slower to write. Tradeoff: Speed of development vs. long-term accuracy (current debt: basic regex).

### Run it
Rerun `python main.py`. You should now see tokenized output for your `example.nc`.

**Real output example**:
```
Line 1:
  G      → G21
  OTHER  → ;
  COMMENT→ ; metric
...
```

### Connecting sentence
Lines are now tokenized — ready for highlighting and deeper analysis.

---

## Closing

**Connect the pieces**: File → lines (Lesson 1) → tokens per line (Lesson 2). Concrete value flows end-to-end.

**What breaks without this**: Without tokenization, syntax highlighting and backplot are impossible — try removing `tokenize_line` and observe downstream failure.

**Exercises**
1. Improve regex to better handle numbers with decimals/negatives.
2. Add support for block numbers `N123`.
3. Print colored output using `print("\033[91m" + ...)` for basic highlighting.

**Definition of done**
- [ ] `tokenizer.py` with `TokenType`, `Token`, and `tokenize_line`
- [ ] `main.py` demonstrates full load + tokenize
- [ ] `git commit -m "Lesson 2: Basic G-code lexer and token types"`

---

Ready for **Lesson 3** (e.g., simple syntax highlighting in terminal or basic web viewer)? Or adjustments?