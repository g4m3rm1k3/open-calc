export default {
  id: 'ae-p0-01-dev-environment',
  slug: 'dev-environment',
  chapter: 'ae-p0',
  order: 0,
  title: 'Dev Environment',
  subtitle: 'Set it up once, set it up right — every lesson depends on this.',
  tags: ['python', 'uv', 'node', 'rust', 'virtual environments', 'gpu', 'cuda', 'setup'],

  hook: {
    question: 'Why do most AI tutorials fail before you write a single line of model code?',
    realWorldContext:
      'The dirty secret of AI engineering is that most setup tutorials are either outdated, incomplete, or tuned for a specific OS. When your environment is broken, every lesson becomes a fight against tooling instead of learning. Version conflicts, missing CUDA drivers, pip hell, and incompatible packages are responsible for more abandoned AI projects than any algorithm. This lesson sets up your environment the way professional AI engineers do: bottom-up, layer by layer, with a verification script that tells you exactly what is working and what is not.',
    previewVisualizationId: 'PythonNotebook',
  },

  intuition: {
    prose: [
      'An AI engineering environment has four layers, installed bottom-up. Skipping or misordering them is the primary source of environment chaos.',
      'The four layers are: (1) system foundation — OS, shell, git, GPU drivers; (2) package managers — uv, pnpm, cargo; (3) language runtimes — Python 3.12, Node.js 22, Rust; (4) AI/ML libraries — PyTorch, transformers, NumPy.',
      'Each layer depends entirely on the one below it. A broken Python install cannot be fixed by reinstalling PyTorch. You must go down to the right layer.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'uv replaces pip + venv',
        body: '`uv` is a Rust-based Python package manager that is 10-100x faster than pip. It manages Python versions AND virtual environments. In 2025, `uv` is the standard for Python AI projects.',
      },
      {
        type: 'warning',
        title: 'Windows users: use WSL2',
        body: 'Most AI tooling is built for Linux. On Windows, run everything inside WSL2 (Ubuntu 24.04). This lesson\'s commands assume a Unix shell.',
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'Dev Environment Setup',
        mathBridge: 'The four-layer stack: System → Package Managers → Language Runtimes → AI Libraries. Install bottom-up, debug bottom-up.',
        caption: 'Run each cell in order. By the end, every tool in this course will be installed and verified.',
        props: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'The four-layer stack',
              prose: [
                '## Why layers matter',
                'Every tool you install lives on one of these four layers:',
                '- **Layer 1 — System foundation:** OS, shell, git, GPU drivers, compiler toolchain\n- **Layer 2 — Package managers:** uv (Python), pnpm (Node), cargo (Rust)\n- **Layer 3 — Language runtimes:** Python 3.12, Node.js 22, Rust stable\n- **Layer 4 — AI/ML libraries:** PyTorch, NumPy, transformers, anthropic SDK',
                'Install in this order. Debug in this order. When something breaks, ask: which layer is broken?',
              ],
              code: `import sys
import subprocess

# Layer 3: Check Python version
print(f"Python version: {sys.version}")
major, minor = sys.version_info[:2]
if major == 3 and minor >= 11:
    print("✓ Python 3.11+ — good to go")
else:
    print(f"✗ Need Python 3.11+. You have {major}.{minor}. Install uv and run: uv python install 3.12")

# Layer 1: Check git
result = subprocess.run(["git", "--version"], capture_output=True, text=True)
if result.returncode == 0:
    print(f"✓ {result.stdout.strip()}")
else:
    print("✗ git not found — install it from git-scm.com")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 2,
              cellTitle: 'Layer 2: Install uv (the Python package manager)',
              prose: [
                '`uv` is a drop-in replacement for `pip` + `venv` + `pyenv`, written in Rust. It handles Python version management, virtual environment creation, and package installation in one tool.',
                '## Install (run in your terminal, not this notebook)',
                '```bash\n# macOS / Linux\ncurl -LsSf https://astral.sh/uv/install.sh | sh\n\n# Windows (PowerShell)\npowershell -c "irm https://astral.sh/uv/install.ps1 | iex"\n```',
                '## Create a virtual environment for this course',
                '```bash\nuv venv .venv\nsource .venv/bin/activate   # Linux/macOS\n.venv\\Scripts\\activate       # Windows\n```',
                '## Install core AI packages',
                '```bash\nuv pip install numpy matplotlib jupyter torch anthropic openai\n```',
              ],
              code: `# Verify key packages are installed
packages_to_check = ['numpy', 'matplotlib', 'json', 'hashlib', 'time']

for pkg in packages_to_check:
    try:
        __import__(pkg)
        print(f"✓ {pkg}")
    except ImportError:
        print(f"✗ {pkg} — run: uv pip install {pkg}")

# Check numpy specifically (fundamental for AI work)
import numpy as np
a = np.array([1, 2, 3])
print(f"\\nNumPy {np.__version__}: dot product test: {np.dot(a, a)}")  # should be 14`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 3,
              cellTitle: 'Layer 3: Python version check + virtual env verification',
              prose: [
                'Virtual environments are isolated Python installations. Every project should have its own. Without them, packages from different projects conflict and produce subtle, hard-to-reproduce bugs.',
                '## The rule: one project, one venv',
                'This is not optional for AI work. PyTorch, JAX, and TensorFlow all ship different CUDA bindings and will conflict if installed globally.',
                '## Checking your venv',
                '`sys.prefix` shows the active Python path. If it contains `.venv`, you are in the venv. If it shows the system Python path, you forgot to activate.',
              ],
              code: `import sys
import os

# Check if we're inside a virtual environment
in_venv = sys.prefix != sys.base_prefix
venv_path = sys.prefix

print(f"Python executable: {sys.executable}")
print(f"Virtual env: {'YES ✓' if in_venv else 'NO ✗ — activate with: source .venv/bin/activate'}")
print(f"Env path: {venv_path}")

# Show installed packages count
import subprocess
result = subprocess.run(
    [sys.executable, '-m', 'pip', 'list', '--format=columns'],
    capture_output=True, text=True
)
lines = result.stdout.strip().split('\\n')
print(f"\\nInstalled packages: {len(lines) - 2}")  # subtract header lines`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 4,
              cellTitle: 'Layer 3: Node.js — for TypeScript/agent lessons',
              prose: [
                'Phases 13–17 (Tools, Agents, MCP) use TypeScript. You need Node.js 20+.',
                '## Install with fnm (Fast Node Manager)',
                '```bash\n# Install fnm\ncurl -fsSL https://fnm.vercel.app/install | bash\n\n# Install and use Node.js 22\nfnm install 22\nfnm use 22\n\n# Install pnpm (faster npm)\nnpm install -g pnpm\n```',
                '## Verify',
                '```bash\nnode --version    # should print v22.x.x\npnpm --version   # should print 8.x.x or higher\n```',
              ],
              code: `import subprocess

# Check Node.js
for cmd in [['node', '--version'], ['npm', '--version']]:
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode == 0:
        print(f"✓ {' '.join(cmd)}: {result.stdout.strip()}")
    else:
        print(f"✗ {cmd[0]} not found")
        print(f"  Install: curl -fsSL https://fnm.vercel.app/install | bash")
        print(f"  Then: fnm install 22 && fnm use 22")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 5,
              cellTitle: 'Layer 3: Rust — for performance-critical lessons',
              prose: [
                'Rust appears in phases covering inference optimization and systems-level AI. The Rust toolchain installs in one command and does not conflict with other languages.',
                '## Install rustup (Rust version manager)',
                '```bash\n# All platforms\ncurl --proto \'=https\' --tlsv1.2 -sSf https://sh.rustup.rs | sh\n```',
                'After installation, restart your shell and verify:',
                '```bash\nrustc --version   # rustc 1.82.0 or similar\ncargo --version   # cargo 1.82.0 or similar\n```',
                '## What cargo does',
                '`cargo` is Rust\'s package manager + build system. It downloads dependencies, compiles your project, runs tests, and benchmarks — all in one tool. There is no pip/npm confusion in Rust.',
              ],
              code: `import subprocess

# Check Rust
for cmd in [['rustc', '--version'], ['cargo', '--version']]:
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode == 0:
        print(f"✓ {result.stdout.strip()}")
    else:
        print(f"✗ {cmd[0]} not found")
        print(f"  Install: curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 6,
              cellTitle: 'Layer 4: GPU verification (PyTorch + CUDA)',
              prose: [
                'For training lessons you need a GPU. For inference and LLM engineering (Phase 11), CPU is fine. Check what you have.',
                '## Install PyTorch with CUDA 12.4',
                '```bash\n# NVIDIA GPU\nuv pip install torch torchvision --index-url https://download.pytorch.org/whl/cu124\n\n# CPU only (or Apple Silicon)\nuv pip install torch torchvision\n```',
                '## Apple Silicon (M1/M2/M3/M4)',
                'PyTorch supports MPS (Metal Performance Shaders) on Apple Silicon. Use `torch.device("mps")` instead of `cuda`.',
                '## No GPU?',
                'No problem. Google Colab gives free T4 GPUs. For Phase 11 (LLM Engineering), you\'re calling APIs — no local GPU needed.',
              ],
              code: `# Check GPU availability
try:
    import torch
    print(f"PyTorch {torch.__version__}")
    print(f"CUDA available: {torch.cuda.is_available()}")
    if torch.cuda.is_available():
        print(f"GPU: {torch.cuda.get_device_name(0)}")
        print(f"VRAM: {torch.cuda.get_device_properties(0).total_memory / 1e9:.1f} GB")
        # Quick tensor test
        x = torch.tensor([1.0, 2.0, 3.0]).cuda()
        print(f"Tensor on GPU: {x}")
    elif hasattr(torch.backends, 'mps') and torch.backends.mps.is_available():
        print("Apple MPS (Metal) GPU available ✓")
        x = torch.tensor([1.0, 2.0, 3.0]).to('mps')
        print(f"Tensor on MPS: {x}")
    else:
        print("No GPU found — CPU mode. Phase 11 works fine without one.")
except ImportError:
    print("PyTorch not installed.")
    print("Install: uv pip install torch")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 7,
              cellTitle: 'Verification: full environment health check',
              prose: 'Run this cell as a final verification. It checks every tool in the course stack and prints a clear pass/fail for each. Fix any failures before starting the curriculum.',
              code: `import sys
import subprocess
import importlib

def check(label, fn):
    try:
        result = fn()
        print(f"  ✓ {label}: {result}")
        return True
    except Exception as e:
        print(f"  ✗ {label}: {e}")
        return False

print("=" * 50)
print("  AI Engineering Environment Check")
print("=" * 50)

print("\\n[Python & Core]")
check("Python 3.11+", lambda: f"{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}")
check("numpy", lambda: importlib.import_module('numpy').__version__)
check("json (stdlib)", lambda: "ok")

print("\\n[Git]")
check("git", lambda: subprocess.run(['git', '--version'], capture_output=True, text=True).stdout.strip())

print("\\n[Node.js]")
check("node", lambda: subprocess.run(['node', '--version'], capture_output=True, text=True).stdout.strip())

print("\\n[Rust]")
check("rustc", lambda: subprocess.run(['rustc', '--version'], capture_output=True, text=True).stdout.strip().split()[1])

print("\\n[ML Libraries]")
check("torch", lambda: importlib.import_module('torch').__version__)

print("\\n[LLM SDKs]")
for pkg in ['anthropic', 'openai']:
    check(pkg, lambda p=pkg: importlib.import_module(p).__version__)

print("\\n" + "=" * 50)`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 'c1',
              challengeType: 'write',
              challengeNumber: 1,
              challengeTitle: 'Environment diagnostic function',
              difficulty: 'easy',
              prompt: 'Write `check_package(name)` that returns the version string of an installed package, or the string `"NOT INSTALLED"` if it is missing. Use `importlib.import_module` and `getattr(module, "__version__", "unknown")`.',
              code: `import importlib

def check_package(name):
    """Return version string or 'NOT INSTALLED'."""
    pass  # your implementation here

# Test
print(check_package("numpy"))       # e.g. "2.1.0"
print(check_package("json"))        # "unknown" (stdlib has no __version__)
print(check_package("fakepkg123"))  # "NOT INSTALLED"
`,
              output: '', status: 'idle', figureJson: null,
              testCode: `
if 'check_package' not in dir():
    res = "ERROR: check_package not defined."
else:
    import importlib
    r1 = check_package("numpy")
    r2 = check_package("fakepkg_that_does_not_exist_abc123")
    if r2 != "NOT INSTALLED":
        res = f"ERROR: check_package('fakepkg') should return 'NOT INSTALLED', got {r2!r}"
    elif not isinstance(r1, str):
        res = f"ERROR: check_package('numpy') should return a string, got {type(r1)}"
    else:
        res = f"SUCCESS: numpy={r1!r}, missing pkg='NOT INSTALLED'"
res
`,
              hint: 'Wrap `importlib.import_module(name)` in a try/except ImportError. On success, return `getattr(module, "__version__", "unknown")`. On ImportError, return `"NOT INSTALLED"`.',
            },
            {
              id: 'c2',
              challengeType: 'write',
              challengeNumber: 2,
              challengeTitle: 'Layer classifier',
              difficulty: 'easy',
              prompt: 'Given a tool name, classify which layer of the four-layer stack it belongs to. Implement `classify_layer(tool)` returning `"system"`, `"package_manager"`, `"runtime"`, or `"library"`.',
              code: `LAYER_MAP = {
    "git": "system",
    "curl": "system",
    "nvidia-smi": "system",
    "uv": "package_manager",
    "pnpm": "package_manager",
    "cargo": "package_manager",
    "python": "runtime",
    "node": "runtime",
    "rustc": "runtime",
    "numpy": "library",
    "torch": "library",
    "anthropic": "library",
}

def classify_layer(tool):
    """Return the stack layer for a given tool name."""
    pass

# Tests
print(classify_layer("git"))       # "system"
print(classify_layer("uv"))        # "package_manager"
print(classify_layer("python"))    # "runtime"
print(classify_layer("torch"))     # "library"
print(classify_layer("unknown"))   # "unknown"
`,
              output: '', status: 'idle', figureJson: null,
              testCode: `
if 'classify_layer' not in dir():
    res = "ERROR: classify_layer not defined."
else:
    tests = [
        ("git", "system"), ("uv", "package_manager"),
        ("python", "runtime"), ("torch", "library"), ("unknown_tool_xyz", "unknown"),
    ]
    failures = []
    for tool, expected in tests:
        got = classify_layer(tool)
        if got != expected:
            failures.append(f"classify_layer({tool!r}) → {got!r}, expected {expected!r}")
    if failures:
        res = "ERROR: " + "; ".join(failures)
    else:
        res = "SUCCESS: All layer classifications correct."
res
`,
              hint: 'Use LAYER_MAP.get(tool, "unknown") to look up the tool. That\'s all the logic needed.',
            },
            {
              id: 'c3',
              challengeType: 'write',
              challengeNumber: 3,
              challengeTitle: 'Install command generator',
              difficulty: 'medium',
              prompt: 'Write `install_command(package, manager)` that returns the shell command string to install a package using the given manager (`"uv"`, `"pnpm"`, or `"cargo"`). For unknown managers raise `ValueError`.',
              code: `def install_command(package, manager):
    """Return the install command string for the given manager."""
    pass

# Tests
print(install_command("numpy", "uv"))            # "uv pip install numpy"
print(install_command("react", "pnpm"))          # "pnpm add react"
print(install_command("serde", "cargo"))         # "cargo add serde"

# Should raise ValueError:
try:
    install_command("thing", "gem")
    print("ERROR: should have raised ValueError")
except ValueError as e:
    print(f"Correctly raised ValueError: {e}")
`,
              output: '', status: 'idle', figureJson: null,
              testCode: `
if 'install_command' not in dir():
    res = "ERROR: install_command not defined."
else:
    tests = [
        ("numpy", "uv", "uv pip install numpy"),
        ("react", "pnpm", "pnpm add react"),
        ("serde", "cargo", "cargo add serde"),
    ]
    failures = []
    for pkg, mgr, expected in tests:
        got = install_command(pkg, mgr)
        if got != expected:
            failures.append(f"install_command({pkg!r}, {mgr!r}) → {got!r}, expected {expected!r}")
    raised = False
    try:
        install_command("x", "gem")
    except ValueError:
        raised = True
    if not raised:
        failures.append("Did not raise ValueError for unknown manager 'gem'")
    if failures:
        res = "ERROR: " + "; ".join(failures)
    else:
        res = "SUCCESS: All install commands correct and ValueError raised for unknown manager."
res
`,
              hint: 'Use a dict mapping manager name → command template. For "uv": f"uv pip install {package}", "pnpm": f"pnpm add {package}", "cargo": f"cargo add {package}". Use .get() and raise ValueError if not found.',
            },
          ],
        },
      },
    ],
  },

  quiz: [
    {
      id: 'q1',
      question: 'What is the correct installation order for the four-layer AI engineering stack?',
      options: [
        'AI libraries → Language runtimes → Package managers → System',
        'System → Package managers → Language runtimes → AI libraries',
        'Language runtimes → System → AI libraries → Package managers',
        'Package managers → System → Language runtimes → AI libraries',
      ],
      correct: 1,
      explanation: 'Install bottom-up: system foundation first, then package managers, then language runtimes, then AI/ML libraries. Each layer depends on everything below it.',
    },
    {
      id: 'q2',
      question: 'What does `uv` replace compared to traditional Python tooling?',
      options: [
        'Only pip',
        'Only virtualenv',
        'pip + venv + pyenv (package management, virtual environments, and Python version management)',
        'conda + pip + Docker',
      ],
      correct: 2,
      explanation: 'uv is a Rust-based tool that handles Python version installation (replacing pyenv), virtual environment creation (replacing venv), and package installation (replacing pip) — all in one, 10-100x faster.',
    },
    {
      id: 'q3',
      question: 'Why should each AI project use its own virtual environment?',
      options: [
        'Virtual environments make code run faster',
        'Package managers require them',
        'Different projects have conflicting package versions — global installs cause subtle, hard-to-reproduce bugs',
        'They are required only for GPU code',
      ],
      correct: 2,
      explanation: 'PyTorch, JAX, and TensorFlow each ship different CUDA bindings. If installed globally, they conflict. Virtual environments isolate each project\'s dependencies.',
    },
    {
      id: 'q4',
      question: 'A student has Python 3.12 installed but PyTorch fails to import. Which layer should they debug first?',
      options: [
        'Layer 1 (system) — reinstall the OS',
        'Layer 4 (AI libraries) — reinstall PyTorch using the correct pip install command for their CUDA version',
        'Layer 3 (runtime) — downgrade Python',
        'Layer 2 (package manager) — update uv',
      ],
      correct: 1,
      explanation: 'Python 3.12 is fine (Layer 3 is working). The failure is in Layer 4 (AI libraries). The most common cause is installing PyTorch without the correct CUDA index URL, so the CPU-only version is installed instead of the GPU version.',
    },
    {
      id: 'q5',
      question: 'For the LLM Engineering phase (Phase 11), which hardware requirement is necessary?',
      options: [
        'An NVIDIA GPU with at least 8GB VRAM',
        'No GPU required — Phase 11 calls external LLM APIs (Anthropic, OpenAI)',
        'Apple Silicon M2 or higher',
        'At least 64GB RAM',
      ],
      correct: 1,
      explanation: 'Phase 11 is about LLM engineering patterns — prompt engineering, RAG, function calling, etc. All of these call external APIs. No local GPU is required. A GPU matters for training lessons in Phases 3–10.',
    },
  ],
}
