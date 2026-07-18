**Lesson 4: 2D Backplot Visualization**

### What you will build
A basic 2D backplot that renders the toolpath from tokenized G-code using matplotlib. Moves (G00/G01) are drawn as lines, with rapid moves in one color and feed moves in another. This visualizes what the code actually does.

**Transferable problems**: Turning parsed commands into geometric visualization — core to CAD/CAM viewers, simulators, and graphics pipelines.

**What you need to know first**: Lessons 1–3 (loading, tokenizing, rendering).

**Pipeline**: Text → Lexer → **Interpreter / Plotter** (this lesson) → ...

---

## Concept Unit: Simple Matplotlib Setup

### The Problem
We need to draw lines representing tool movements. Raw tokens must be interpreted into (X, Y) positions.

### Introduce the concept in isolation
**Throwaway lab** (`lab_plot.py`):

```python
import matplotlib.pyplot as plt

plt.plot([0, 10, 15], [0, 5, 0], 'b-')   # blue line
plt.plot([15, 20], [0, 8], 'r--')        # red dashed
plt.grid(True)
plt.title("Test Toolpath")
plt.show()
```

**What this proves**: `plt.plot(x_points, y_points)` draws connected lines; different styles for rapid vs feed.

**Discard the throwaway example.**

### Project Change
- **Files affected**: New `pdm/backplot.py`; updates to `main.py`.
- **Change type**: New module + dependency.
- **Location**: New file.
- **Dependencies**: `matplotlib` (install once).

### The New Code — type it yourself
First, install dependency:

```bash
pip install matplotlib
```

Create `pdm/backplot.py`:

```python
import matplotlib.pyplot as plt
from tokenizer import TokenType

def plot_2d(tokens_per_line):
    x, y = [0.0], [0.0]  # start at origin
    current_x, current_y = 0.0, 0.0
    
    for line_tokens in tokens_per_line:
        g_code = None
        new_x, new_y = None, None
        
        for t in line_tokens:
            if t.type == TokenType.G_CODE:
                g_code = t.value.upper()
            elif t.type == TokenType.AXIS:
                if t.value.upper().startswith('X'):
                    new_x = float(t.value[1:])
                elif t.value.upper().startswith('Y'):
                    new_y = float(t.value[1:])
        
        if new_x is not None or new_y is not None:
            if new_x is None: new_x = current_x
            if new_y is None: new_y = current_y
            
            x.append(new_x)
            y.append(new_y)
            
            current_x, current_y = new_x, new_y
    
    plt.figure(figsize=(8, 6))
    plt.plot(x, y, 'b-', label='Feed moves')  # simple for now
    plt.grid(True)
    plt.xlabel('X')
    plt.ylabel('Y')
    plt.title('G-code 2D Backplot')
    plt.legend()
    plt.axis('equal')
    plt.show()
```

### The Updated Project
New `pdm/backplot.py` (full as above).

Updated `pdm/main.py`:

```python
from gcode_file import load_and_tokenize
from renderer import highlight_line
from analyzer import basic_stats
from backplot import plot_2d   # ← new

if __name__ == "__main__":
    tokens_per_line = load_and_tokenize("example.nc")
    stats = basic_stats(tokens_per_line)
    
    print("=== G-code PDM Preview ===")
    print(f"Lines: {stats['lines']} | Tool changes: {stats['tool_changes']}\n")
    
    for line_num, tokens in enumerate(tokens_per_line[:10], 1):
        print(f"{line_num:3d}: {highlight_line(tokens)}")
    
    print("\nGenerating 2D backplot...")
    plot_2d(tokens_per_line)
```

### Mechanical walkthrough
1. `import matplotlib.pyplot as plt` — plotting library.
2. `x, y = [0.0], [0.0]` — lists for coordinates (start origin).
3. Loop over lines and tokens to extract G and axis values.
4. `float(t.value[1:])` — parse number after letter.
5. `plt.plot(...)` — draws the path.
6. `plt.figure()`, `grid`, `title`, `show()` — display controls.

**Execution trace** (simple file with G00 X10 Y0 then G01 X10 Y10):
- Start (0,0)
- After first move → append (10,0)
- After second → append (10,10)
- Plot connects all points.

### CS Lens
**Incremental state machine** for simulation (current position + modal commands).  
Also recognized in: CNC controllers, game physics loops, graphics renderers, financial tick processors.

### SE Lens
We used a very simple interpreter (no full modal state yet). Alternative (full parser first) delays visualization. Tradeoff: Quick visual feedback vs. accumulating technical debt in the plotter (will refactor later).

### Run it
```bash
python main.py
```

A matplotlib window should pop up showing the toolpath.

---

## Closing

**Connect the pieces**: Load → tokenize → analyze/highlight → interpret positions → plot. One file now produces text + visual output.

**What breaks without this**: No visual verification — common cause of CNC crashes. Try removing coordinate parsing → empty plot.

**Exercises**
1. Color rapid (G00) vs feed (G01) moves differently.
2. Add Z axis awareness (even if 2D plot ignores depth for now).
3. Handle absolute (G90) vs incremental (G91) — big one!

**Definition of done**
- [ ] 2D backplot displays toolpath
- [ ] Integrated into main viewer
- [ ] `git commit -m "Lesson 4: Basic 2D backplot visualization"`

---

**Lesson 4 complete.**

Ready for **Lesson 5**? Suggestions: Improve parser with modal state (G90/G91, units), add zoomable web viewer, or diffing support. Tell me your preference.