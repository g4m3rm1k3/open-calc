export default {
  id: 'ae-p0-05-jupyter',
  slug: 'jupyter-notebooks',
  chapter: 'ae-p0',
  order: 4,
  title: 'Jupyter Notebooks',
  subtitle: 'The explore-in-notebooks, ship-in-scripts workflow that every AI engineer uses.',
  tags: ['jupyter', 'jupyterlab', 'notebook', 'magic commands', 'ipython', 'colab', 'cells'],

  hook: {
    question: 'Why do AI researchers use notebooks when software engineers are taught to avoid them?',
    realWorldContext:
      'Jupyter notebooks are the primary development environment for AI research. Every major AI paper includes a companion notebook. Google Colab, Kaggle, and most cloud ML platforms are notebook-first. The reason: AI development is inherently exploratory — you run a cell, inspect the output, adjust, repeat. Scripts force you to run everything from scratch on every change. Notebooks let you iterate cell by cell, keeping intermediate state alive. The pro workflow is: explore in notebooks, then refactor the working code into importable scripts.',
    previewVisualizationId: 'PythonNotebook',
  },

  intuition: {
    prose: [
      'A Jupyter notebook is a JSON document containing an ordered list of cells. Each cell is either code (executable Python), markdown (rendered text), or raw (plain text). The kernel is a running Python process that cells communicate with.',
      'The critical insight: cells share state. A variable defined in cell 3 is available in cell 7. The kernel accumulates state as you run cells. This is powerful for exploration but dangerous for reproducibility — always restart and run all before sharing a notebook.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Keyboard shortcuts save hours',
        body: 'In command mode (Esc): `A` = insert above, `B` = insert below, `DD` = delete cell, `M` = markdown, `Y` = code, `Shift+Enter` = run and advance. In edit mode (Enter): `Shift+Enter` = run, `Ctrl+/` = comment. These 8 shortcuts cover 90% of notebook work.',
      },
      {
        type: 'warning',
        title: 'Notebook ≠ script: execution order matters',
        body: 'You can run cells out of order in Jupyter. This creates hidden state that breaks reproducibility. Always use "Restart Kernel and Run All Cells" before sharing a notebook or submitting results.',
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'Jupyter Notebooks',
        mathBridge: 'A notebook is a REPL (Read-Eval-Print Loop) with memory. Each cell is one iteration of the loop. The kernel holds the accumulated state across all iterations.',
        caption: 'Work through these cells to master the Jupyter workflow used in every AI lesson ahead.',
        props: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Cell types and the kernel model',
              prose: [
                '## The three cell types',
                '- **Code cells** — execute Python, display output below\n- **Markdown cells** — render formatted text, equations, images\n- **Raw cells** — plain text, not executed or rendered',
                '## The kernel',
                'The kernel is a Python process running in the background. When you run a code cell, the notebook sends the code to the kernel, the kernel executes it and returns the result, and the notebook displays it. The key consequence: **all cells share the same kernel state**.',
                '## Cell output types',
                'A cell can produce: text output (print statements), rich output (matplotlib figures, pandas DataFrames, images), or both. The last expression in a cell is auto-displayed if it has a repr.',
              ],
              code: `# This is a code cell
# The last expression is auto-displayed (no print needed)

# Multiple outputs in one cell
print("This is from print()")

x = [1, 2, 3, 4, 5]
total = sum(x)
print(f"Sum: {total}")

# The last expression is displayed automatically
x  # displays [1, 2, 3, 4, 5]`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 2,
              cellTitle: 'Shared kernel state: the power and the danger',
              prose: [
                '## State persists across cells',
                'Variables defined in one cell are available in all subsequent cells — as long as the kernel is running and you ran the defining cell.',
                '## The hidden state problem',
                'If you delete a cell that defined a variable but never restart the kernel, the variable still exists in kernel memory. Your notebook appears to work, but it will fail when someone runs it fresh. This is called **hidden state**.',
                '## The fix',
                'Before sharing: **Kernel → Restart Kernel and Run All Cells**. This proves the notebook is reproducible from a clean state.',
              ],
              code: `# Cell A: define a variable
LEARNING_RATE = 0.001
MODEL_NAME = "gpt-4o"
TEMPERATURE = 0.7

# Cell B (would be a separate cell in real notebook):
# This works because LEARNING_RATE was defined above
config = {
    "model": MODEL_NAME,
    "temperature": TEMPERATURE,
    "learning_rate": LEARNING_RATE,
}
print(f"Config: {config}")

# Demonstrate shared state
results = []  # defined here, used in later cells
results.append(f"Run 1: config loaded")
print(f"Results so far: {results}")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 3,
              cellTitle: 'Magic commands: %timeit, %%time, %who',
              prose: [
                '## What are magic commands?',
                'IPython (the kernel behind Jupyter) provides "magic commands" — special commands prefixed with `%` (line magic) or `%%` (cell magic). They are not Python — they are interpreted by IPython before execution.',
                '## The most useful magics for AI work',
                '- `%timeit expr` — benchmark a single expression (runs it many times, reports mean ± std)\n- `%%time` — time the entire cell (run once, report real + CPU time)\n- `%who` — list all variables in current namespace\n- `%whos` — list variables with type and value\n- `%reset` — clear all variables (like a mini restart)\n- `%load_ext autoreload` + `%autoreload 2` — auto-reload imported modules when files change',
              ],
              code: `import time
import numpy as np

# Simulate %timeit behavior (actual %timeit works in Jupyter cells)
def benchmark(fn, n_runs=1000, label=""):
    """Poor man's %timeit."""
    times = []
    for _ in range(n_runs):
        start = time.perf_counter()
        fn()
        times.append(time.perf_counter() - start)
    mean_us = np.mean(times) * 1e6
    std_us = np.std(times) * 1e6
    print(f"{label}: {mean_us:.2f} ± {std_us:.2f} µs per call ({n_runs} runs)")

# Compare list comprehension vs numpy for element-wise squaring
data_list = list(range(10000))
data_np = np.array(data_list)

benchmark(lambda: [x**2 for x in data_list], label="List comprehension")
benchmark(lambda: data_np ** 2, label="NumPy vectorized   ")

# In real Jupyter:
# %timeit [x**2 for x in data_list]
# %timeit data_np ** 2
print("\\nIn a real Jupyter cell, use %timeit for accurate benchmarking.")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 4,
              cellTitle: 'Rich output: displaying AI results',
              prose: [
                '## What Jupyter can display inline',
                'Jupyter renders many output types directly in the notebook:',
                '- **Strings** — plain text\n- **DataFrames** — formatted tables (pandas)\n- **Matplotlib figures** — inline plots\n- **Images** — `IPython.display.Image`\n- **JSON** — `IPython.display.JSON`\n- **HTML** — `IPython.display.HTML`\n- **Markdown** — `IPython.display.Markdown`',
                '## For AI work specifically',
                'Use `IPython.display.Markdown` to render LLM outputs with formatting. Use `IPython.display.JSON` to inspect structured API responses. Use `IPython.display.HTML` to display evaluation tables.',
              ],
              code: `# Demonstrate rich display objects (works in real Jupyter)
from IPython.display import display, Markdown, JSON

# Simulate an LLM API response
mock_llm_response = {
    "id": "msg_01abc",
    "model": "claude-sonnet-4-6",
    "content": [
        {
            "type": "text",
            "text": "## Analysis\\n\\n**Sentiment:** Positive\\n\\n**Key points:**\\n- Strong product satisfaction\\n- Minor delivery concern\\n- Would recommend"
        }
    ],
    "usage": {"input_tokens": 45, "output_tokens": 38}
}

# Display the raw JSON structure
print("Raw API response structure:")
import json
print(json.dumps(mock_llm_response, indent=2))

# In real Jupyter, you would do:
# display(JSON(mock_llm_response))  # interactive expandable JSON tree
# display(Markdown(mock_llm_response["content"][0]["text"]))  # rendered markdown

# Extract and display key info
print(f"\\nModel: {mock_llm_response['model']}")
print(f"Input tokens: {mock_llm_response['usage']['input_tokens']}")
print(f"Output tokens: {mock_llm_response['usage']['output_tokens']}")
print(f"\\nResponse text:")
print(mock_llm_response["content"][0]["text"])`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 5,
              cellTitle: 'The explore-in-notebooks, ship-in-scripts workflow',
              prose: [
                '## The professional AI engineering workflow',
                '1. **Explore in notebook** — prototype quickly, run cells interactively, inspect intermediate results\n2. **Identify what works** — find the cells that contain your core logic\n3. **Refactor into `.py` files** — extract functions and classes, add types and docstrings\n4. **Import into notebook** — `from my_module import my_function`\n5. **Use autoreload** — `%load_ext autoreload` + `%autoreload 2` reloads the module on every cell run',
                '## When to use notebooks vs. scripts',
                '| Use notebooks for | Use scripts (.py) for |\n|---|---|\n| Exploration and prototyping | Production code |\n| Visualization | Importable modules |\n| Documentation with code | CLI tools and pipelines |\n| Teaching and demos | Tests (pytest) |\n| One-off analysis | Scheduled jobs |',
              ],
              code: `# Simulate extracting notebook exploration into a module

# Step 1: In notebook, you explore and find this works
def chunk_text(text, chunk_size=512, overlap=50):
    """Split text into overlapping chunks for RAG."""
    words = text.split()
    chunks = []
    i = 0
    while i < len(words):
        chunk = words[i:i + chunk_size]
        chunks.append(' '.join(chunk))
        i += chunk_size - overlap
    return chunks

def count_tokens_approx(text):
    """Approximate token count (1 token ≈ 0.75 words)."""
    return int(len(text.split()) / 0.75)

# Step 2: Test it in notebook
sample = "Machine learning is a subset of artificial intelligence. " * 20
chunks = chunk_text(sample, chunk_size=20, overlap=5)

print(f"Input: {count_tokens_approx(sample)} tokens approx")
print(f"Chunks created: {len(chunks)}")
print(f"First chunk: '{chunks[0]}'")
print(f"Overlap check — end of chunk 0: '{' '.join(chunks[0].split()[-5:])}'")
print(f"Start of chunk 1: '{' '.join(chunks[1].split()[:5])}'")
print()
print("Step 3: This function goes into src/chunker.py")
print("Step 4: In notebook: from src.chunker import chunk_text, count_tokens_approx")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 'c1',
              challengeType: 'write',
              challengeNumber: 1,
              challengeTitle: 'Cell execution order tracker',
              difficulty: 'easy',
              prompt: 'Write a `NotebookState` class that tracks which cells have been executed and in what order. It should have `run_cell(cell_id, code)`, `get_execution_order()`, and `is_reproducible()` methods. `is_reproducible()` returns True if cells were run in sequential order (1, 2, 3, ...), False if out of order.',
              code: `class NotebookState:
    def __init__(self):
        self.execution_history = []  # list of cell_ids in execution order
        self.cell_outputs = {}

    def run_cell(self, cell_id: int, code: str):
        """Record that cell_id was executed."""
        pass

    def get_execution_order(self):
        """Return list of cell_ids in the order they were run."""
        pass

    def is_reproducible(self):
        """Return True if cells were run in sequential order."""
        pass

# Tests
nb = NotebookState()
nb.run_cell(1, "x = 10")
nb.run_cell(2, "y = x + 5")
nb.run_cell(3, "print(y)")
print(f"Order: {nb.get_execution_order()}")   # [1, 2, 3]
print(f"Reproducible: {nb.is_reproducible()}")  # True

nb2 = NotebookState()
nb2.run_cell(1, "x = 10")
nb2.run_cell(3, "print(x)")   # ran cell 3 before cell 2!
nb2.run_cell(2, "y = x + 5")
print(f"\\nOrder: {nb2.get_execution_order()}")   # [1, 3, 2]
print(f"Reproducible: {nb2.is_reproducible()}")  # False
`,
              output: '', status: 'idle', figureJson: null,
              testCode: `
if 'NotebookState' not in dir():
    res = "ERROR: NotebookState not defined."
else:
    nb = NotebookState()
    nb.run_cell(1, "x = 1")
    nb.run_cell(2, "y = 2")
    nb.run_cell(3, "z = 3")
    order = nb.get_execution_order()
    repro = nb.is_reproducible()

    nb2 = NotebookState()
    nb2.run_cell(1, "x = 1")
    nb2.run_cell(3, "z = 3")
    nb2.run_cell(2, "y = 2")
    repro2 = nb2.is_reproducible()

    if order != [1, 2, 3]:
        res = f"ERROR: execution_order should be [1,2,3], got {order}"
    elif not repro:
        res = f"ERROR: [1,2,3] should be reproducible, got {repro}"
    elif repro2:
        res = f"ERROR: [1,3,2] should NOT be reproducible, got {repro2}"
    else:
        res = "SUCCESS: NotebookState correctly tracks execution order and reproducibility."
res
`,
              hint: 'run_cell: append cell_id to self.execution_history. get_execution_order: return self.execution_history. is_reproducible: compare self.execution_history to sorted(self.execution_history) == list(range(1, len+1)).',
            },
            {
              id: 'c2',
              challengeType: 'write',
              challengeNumber: 2,
              challengeTitle: 'Notebook → script extractor',
              difficulty: 'medium',
              prompt: 'Write `extract_functions(notebook_cells)` that takes a list of code strings (notebook cells) and returns only the cells that define functions (lines starting with `def `). This simulates the "extract reusable code from notebook" step.',
              code: `def extract_functions(cells):
    """Return list of cells that contain function definitions."""
    pass

sample_cells = [
    "x = 10\\ny = 20",                                    # variable assignment — skip
    "def chunk_text(text, size=512):\\n    return text",  # function def — keep
    "print(x + y)",                                       # print — skip
    "def count_tokens(text):\\n    return len(text.split())", # function def — keep
    "import numpy as np\\ndata = np.array([1,2,3])",     # import — skip
    "def embed(text):\\n    pass",                        # function def — keep
]

result = extract_functions(sample_cells)
print(f"Found {len(result)} function definitions:")
for cell in result:
    first_line = cell.split('\\n')[0]
    print(f"  {first_line}")
`,
              output: '', status: 'idle', figureJson: null,
              testCode: `
if 'extract_functions' not in dir():
    res = "ERROR: extract_functions not defined."
else:
    cells = [
        "x = 10",
        "def foo(x):\\n    return x * 2",
        "print(x)",
        "def bar(a, b):\\n    return a + b",
        "import os",
    ]
    result = extract_functions(cells)
    if len(result) != 2:
        res = f"ERROR: Expected 2 function cells, got {len(result)}"
    elif not all('def ' in c for c in result):
        res = f"ERROR: Returned cells should all contain 'def ', got: {result}"
    else:
        res = "SUCCESS: extract_functions correctly identifies function definition cells."
res
`,
              hint: 'Return [cell for cell in cells if any(line.startswith("def ") for line in cell.split("\\n"))]',
            },
          ],
        },
      },
    ],
  },

  quiz: [
    {
      id: 'q1',
      question: 'What is "hidden state" in a Jupyter notebook?',
      options: [
        'Variables that are encrypted for security',
        'Variables that exist in kernel memory from previously run cells, but whose defining cells have been deleted or not yet run in the current session',
        'Python private variables starting with underscore',
        'Variables defined in imported modules',
      ],
      correct: 1,
      explanation: 'Hidden state occurs when you delete a cell that defined a variable but the kernel still holds the value in memory. The notebook appears to work but will fail when run fresh. Always use "Restart and Run All" to verify reproducibility.',
    },
    {
      id: 'q2',
      question: 'What does `%timeit` do in Jupyter?',
      options: [
        'Displays the current time',
        'Sets a timer for the cell to stop execution',
        'Benchmarks an expression by running it many times and reporting mean ± std deviation',
        'Shows how long the kernel has been running',
      ],
      correct: 2,
      explanation: '`%timeit expr` runs the expression hundreds or thousands of times and reports the mean execution time ± standard deviation. This gives accurate benchmarks, unlike a single `time.time()` measurement which includes noise.',
    },
    {
      id: 'q3',
      question: 'In the "explore-in-notebooks, ship-in-scripts" workflow, what happens in step 4?',
      options: [
        'Delete the notebook',
        'Rewrite everything in the notebook as a single script',
        'Import the refactored .py module back into the notebook and use %autoreload',
        'Deploy the notebook directly to production',
      ],
      correct: 2,
      explanation: 'After extracting working code into .py files, you import it back into the notebook. Combined with `%load_ext autoreload` + `%autoreload 2`, any changes to the .py file are automatically reloaded on the next cell run — you get interactive development without hidden state.',
    },
  ],
}
