export default {
  id: 'ae-p0-06-python-environments',
  slug: 'python-environments',
  chapter: 'ae-p0',
  order: 5,
  title: 'Python Environments',
  subtitle: 'Dependency hell is real. Virtual environments are the cure.',
  tags: ['python', 'uv', 'venv', 'conda', 'pyproject.toml', 'lockfile', 'virtual environments', 'cuda'],

  hook: {
    question: 'Why does installing PyTorch for one project silently break your other projects?',
    realWorldContext:
      'You install PyTorch 2.4 for a fine-tuning project. Next week, a different project needs PyTorch 2.1 because its CUDA build is pinned. You upgrade globally, and the first project breaks. You downgrade, and the second one breaks. This is dependency hell. It happens constantly in AI/ML work because PyTorch, JAX, and TensorFlow each ship their own CUDA bindings, model libraries pin specific framework versions, and a global `pip install` overwrites whatever was there before. CUDA 11.8 builds don\'t work with CUDA 12.x drivers. The fix: every project gets its own isolated environment with its own packages.',
    previewVisualizationId: 'PythonNotebook',
  },

  intuition: {
    prose: [
      'A virtual environment is a directory containing an isolated Python interpreter and its own `site-packages`. Installing a package into one environment does not affect any other environment or the system Python.',
      'The modern standard is `uv` — a Rust-based package manager 10–100x faster than pip that manages Python versions, virtual environments, and lockfiles in one tool. For environments needing system-level CUDA toolkit control (pinning cuDNN, C libraries), conda fills that role instead.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'uv replaces pip + venv',
        body: '`uv` is a Rust-based Python package manager that is 10-100x faster than pip. It manages Python versions AND virtual environments. In 2025, `uv` is the standard for Python AI projects.',
      },
      {
        type: 'warning',
        title: 'Never commit .venv to git',
        body: 'Virtual environments are 200MB–2GB and are not portable between machines. Add `.venv/` to `.gitignore` immediately. Commit `pyproject.toml` and the lockfile instead — those are everything needed to recreate the environment.',
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'Python Environments',
        mathBridge: 'Each project gets its own isolated interpreter + packages. No project can break another by upgrading a shared dependency.',
        caption: 'Work through these cells to understand environment isolation and the uv workflow used throughout this course.',
        props: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Setting up with uv (Recommended)',
              prose: [
                '## Option 1: uv venv (Recommended)',
                '`uv` is the fastest Python package manager (10-100x faster than pip). It handles virtual environments, Python versions, and dependency resolution in one tool.',
                '```bash\ncurl -LsSf https://astral.sh/uv/install.sh | sh\n\nuv python install 3.12\n\ncd your-project\nuv venv\nsource .venv/bin/activate\n```',
                '## Install packages',
                '```bash\nuv pip install torch numpy\n```',
                '## Create a project with pyproject.toml in one step',
                '```bash\nuv init my-ai-project\ncd my-ai-project\nuv add torch numpy matplotlib\n```',
              ],
              code: `import sys
import os

# Check which Python interpreter is active
print(f"Python: {sys.version}")
print(f"Executable: {sys.executable}")

# Show where packages are installed
site_packages = [p for p in sys.path if 'site-packages' in p]
print(f"\\nPackage install locations:")
for p in site_packages:
    print(f"  {p}")

# Detect virtual environment
in_venv = (
    hasattr(sys, 'real_prefix') or
    (hasattr(sys, 'base_prefix') and sys.base_prefix != sys.prefix)
)
print(f"\\nInside virtual environment: {in_venv}")
# When active, sys.executable should point to .venv/bin/python
# not /usr/bin/python3`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 2,
              cellTitle: 'Option 2: venv (Built-in) and Option 3: conda',
              prose: [
                '## Option 2: venv (Built-in)',
                'If you cannot install `uv`, Python ships with `venv`:',
                '```bash\npython3 -m venv .venv\nsource .venv/bin/activate  # Linux/macOS\n.venv\\\\Scripts\\\\activate   # Windows\n\npip install torch numpy\n```',
                '## Option 3: conda (When You Need It)',
                'Conda manages non-Python dependencies like CUDA toolkits, cuDNN, and C libraries. Use it when:\n- You need a specific CUDA toolkit version without installing it system-wide\n- You\'re on a shared cluster\n- A library\'s install instructions say "use conda"',
                '**One rule:** if you use conda for an environment, use conda for all packages. Mixing `pip install` into a conda env causes dependency conflicts that are painful to debug.',
                '```bash\nconda create -n myproject python=3.12\nconda activate myproject\nconda install pytorch torchvision pytorch-cuda=12.4 -c pytorch -c nvidia\n```',
              ],
              code: `# Demonstrate the per-phase environment strategy for this course
# Different phases need different (sometimes conflicting) dependencies

course_structure = {
    "Phases 0–3 (setup, math, ML basics)": {
        "env": ".venv/  (repo root, shared lightweight env)",
        "packages": ["numpy", "matplotlib", "scikit-learn", "jupyter"],
    },
    "Phase 4+ (neural networks, vision)": {
        "env": "phases/04-neural-networks/.venv/",
        "packages": ["torch>=2.3", "torchvision"],
    },
    "Phase 8 (transformers)": {
        "env": "phases/08-transformers/.venv/",
        "packages": ["torch>=2.3", "transformers", "datasets"],
    },
    "Phase 11 (LLM APIs)": {
        "env": "phases/11-llm-apis/.venv/",
        "packages": ["anthropic", "openai"],
        "note": "No torch needed — API-only",
    },
}

print("Per-phase environment strategy:")
print("=" * 50)
for phase, info in course_structure.items():
    print(f"\\n{phase}")
    print(f"  Environment: {info['env']}")
    print(f"  Packages: {', '.join(info['packages'])}")
    if 'note' in info:
        print(f"  Note: {info['note']}")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 3,
              cellTitle: 'pyproject.toml basics',
              prose: [
                '## pyproject.toml replaces setup.py, setup.cfg, and requirements.txt',
                'Every Python project should have a `pyproject.toml`. It defines your project metadata, required Python version, and dependencies — including optional dependency groups.',
                '```toml\n[project]\nname = "ai-engineering-from-scratch"\nversion = "0.1.0"\nrequires-python = ">=3.11"\ndependencies = [\n    "numpy>=1.26",\n    "matplotlib>=3.8",\n    "jupyter>=1.0",\n    "scikit-learn>=1.4",\n]\n\n[project.optional-dependencies]\ntorch = ["torch>=2.3", "torchvision>=0.18"]\nllm = ["anthropic>=0.39", "openai>=1.50"]\n```',
                '## Installing optional groups',
                '```bash\nuv pip install -e ".[torch]"      # base + PyTorch\nuv pip install -e ".[llm]"       # base + LLM SDKs\nuv pip install -e ".[torch,llm]" # everything\n```',
              ],
              code: `# Demonstrate lockfile concept: pyproject.toml is flexible ranges,
# lockfile is exact pinned versions for reproducibility

# What pyproject.toml specifies (flexible)
requirements_spec = {
    "numpy": ">=1.26",
    "torch": ">=2.3",
    "anthropic": ">=0.39",
    "scikit-learn": ">=1.4",
}

# What the lockfile records (exact, including transitive deps)
lockfile_pins = {
    "numpy": "2.0.1",
    "torch": "2.3.1",
    "anthropic": "0.39.0",
    "scikit-learn": "1.5.1",
    # Transitive dependencies (not in pyproject.toml)
    "filelock": "3.15.4",
    "jinja2": "3.1.4",
    "sympy": "1.13.2",
    "networkx": "3.3",
}

print("pyproject.toml (flexible ranges):")
for pkg, spec in requirements_spec.items():
    print(f"  {pkg}{spec}")

print("\\nuv.lock (exact pins, guaranteed reproducible):")
for pkg, ver in lockfile_pins.items():
    marker = " ← direct" if pkg in requirements_spec else " ← transitive"
    print(f"  {pkg}=={ver}{marker}")

print(f"\\n{len(requirements_spec)} direct deps → {len(lockfile_pins)} total locked (including transitive)")
print("Commit uv.lock to git. Anyone who runs 'uv sync' gets identical packages.")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 4,
              cellTitle: 'Common mistakes and CUDA version mismatch',
              prose: [
                '## Common mistake 1: Installing globally',
                '```bash\npip install torch  # BAD: installs to system Python\n\nsource .venv/bin/activate\npip install torch  # GOOD: installs to virtual environment\n```',
                'Check where packages go: `which python` should show `.venv/bin/python`, not `/usr/bin/python`.',
                '## Common mistake 2: Mixing pip and conda',
                'If you use conda for an environment, use conda for ALL packages. Install all conda packages first, pip packages last if necessary.',
                '## Common mistake 3: CUDA version mismatch',
                '```bash\nnvidia-smi                                          # driver CUDA version (e.g., 12.4)\npython -c "import torch; print(torch.version.cuda)"  # PyTorch CUDA version\n# PyTorch CUDA version must be <= driver CUDA version\n```',
                '## Common mistake 4: Committing .venv',
                '```bash\necho ".venv/" >> .gitignore\n```',
              ],
              code: `import sys
import subprocess

def check_environment_health():
    """Diagnose common environment mistakes."""
    issues = []
    ok_items = []

    # Check 1: Are we in a virtual environment?
    in_venv = (
        hasattr(sys, 'real_prefix') or
        (hasattr(sys, 'base_prefix') and sys.base_prefix != sys.prefix)
    )
    if in_venv:
        ok_items.append(f"Virtual env active: {sys.prefix}")
    else:
        issues.append("Not in a virtual environment — run: source .venv/bin/activate")

    # Check 2: Python version
    major, minor = sys.version_info[:2]
    if major == 3 and minor >= 11:
        ok_items.append(f"Python {major}.{minor} — compatible")
    else:
        issues.append(f"Python {major}.{minor} detected — need 3.11+. Run: uv python install 3.12")

    # Check 3: NumPy available (basic sanity check)
    try:
        import numpy as np
        ok_items.append(f"numpy {np.__version__} installed")
    except ImportError:
        issues.append("numpy not installed — run: uv pip install numpy")

    print("Environment Health Check")
    print("=" * 40)
    for item in ok_items:
        print(f"  ✓ {item}")
    for issue in issues:
        print(f"  ✗ {issue}")

    if not issues:
        print("\\nAll checks passed. Environment is healthy.")
    else:
        print(f"\\n{len(issues)} issue(s) found — fix before running course code.")

check_environment_health()`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 'c1',
              challengeType: 'write',
              challengeNumber: 1,
              challengeTitle: 'Environment isolation verifier',
              difficulty: 'easy',
              prompt: 'Write `check_isolation(env_a, env_b)` that takes two dicts mapping package name → version string, and returns a dict with keys: `"shared"` (packages in both with identical versions), `"conflicts"` (packages in both with different versions — value is a tuple `(ver_a, ver_b)`), `"unique_a"` (packages only in A), `"unique_b"` (packages only in B). This models the core problem virtual environments solve.',
              code: `def check_isolation(env_a, env_b):
    """
    Compare two environment package sets.
    Returns dict with: shared, conflicts, unique_a, unique_b
    """
    pass

env_project_a = {
    "numpy": "1.26.4",
    "torch": "2.4.0",
    "transformers": "4.44.0",
    "requests": "2.31.0",
}

env_project_b = {
    "numpy": "1.26.4",
    "torch": "2.1.0",      # conflict!
    "diffusers": "0.28.0",
    "requests": "2.31.0",
}

result = check_isolation(env_project_a, env_project_b)
print(f"Shared (same version): {result['shared']}")
print(f"Conflicts: {result['conflicts']}")
print(f"Only in A: {result['unique_a']}")
print(f"Only in B: {result['unique_b']}")
`,
              output: '', status: 'idle', figureJson: null,
              testCode: `
if 'check_isolation' not in dir():
    res = "ERROR: check_isolation not defined."
else:
    a = {"numpy": "1.26.4", "torch": "2.4.0", "requests": "2.31.0"}
    b = {"numpy": "1.26.4", "torch": "2.1.0", "diffusers": "0.28.0"}
    r = check_isolation(a, b)
    if not isinstance(r, dict):
        res = "ERROR: Return value must be a dict."
    elif set(r.get('shared', [])) != {'numpy', 'requests'}:
        res = f"ERROR: shared should be {{'numpy','requests'}}, got {r.get('shared')}"
    elif 'torch' not in r.get('conflicts', {}):
        res = f"ERROR: torch should be in conflicts, got {r.get('conflicts')}"
    elif r['conflicts']['torch'] != ('2.4.0', '2.1.0'):
        res = f"ERROR: torch conflict should be ('2.4.0','2.1.0'), got {r['conflicts']['torch']}"
    elif set(r.get('unique_a', [])) != {'transformers'}:
        res = f"ERROR: unique_a should be {{'transformers'}}, got {r.get('unique_a')}"
    elif set(r.get('unique_b', [])) != {'diffusers'}:
        res = f"ERROR: unique_b should be {{'diffusers'}}, got {r.get('unique_b')}"
    else:
        res = "SUCCESS: check_isolation correctly identifies shared, conflicting, and unique packages."
res
`,
              hint: 'Iterate over keys in both dicts. Both present + same version → shared. Both present + different → conflicts with tuple (ver_a, ver_b). Only in one → unique_a or unique_b.',
            },
            {
              id: 'c2',
              challengeType: 'write',
              challengeNumber: 2,
              challengeTitle: 'pyproject.toml dependency parser',
              difficulty: 'medium',
              prompt: 'Write `parse_dependencies(toml_text)` that parses a simplified pyproject.toml string and returns a dict with `"base"` (list of base dependency strings) and `"optional"` (dict mapping group name to list of dependency strings). Only handle `[project] dependencies` and `[project.optional-dependencies]` sections.',
              code: `def parse_dependencies(toml_text):
    """
    Parse a simplified pyproject.toml string.
    Returns: {"base": [...], "optional": {"torch": [...], ...}}
    """
    pass

toml_text = """
[project]
name = "ai-engineering-from-scratch"
version = "0.1.0"
requires-python = ">=3.11"
dependencies = [
    "numpy>=1.26",
    "matplotlib>=3.8",
    "jupyter>=1.0",
    "scikit-learn>=1.4",
]

[project.optional-dependencies]
torch = ["torch>=2.3", "torchvision>=0.18"]
llm = ["anthropic>=0.39", "openai>=1.50"]
"""

result = parse_dependencies(toml_text)
print(f"Base deps ({len(result['base'])}):")
for dep in result['base']:
    print(f"  {dep}")
print(f"\\nOptional groups:")
for group, deps in result['optional'].items():
    print(f"  [{group}]: {deps}")
`,
              output: '', status: 'idle', figureJson: null,
              testCode: `
if 'parse_dependencies' not in dir():
    res = "ERROR: parse_dependencies not defined."
else:
    text = """
[project]
dependencies = [
    "numpy>=1.26",
    "matplotlib>=3.8",
]

[project.optional-dependencies]
torch = ["torch>=2.3"]
llm = ["anthropic>=0.39"]
"""
    r = parse_dependencies(text)
    if not isinstance(r, dict):
        res = "ERROR: Must return a dict."
    elif len(r.get('base', [])) != 2:
        res = f"ERROR: Expected 2 base deps, got {r.get('base')}"
    elif 'numpy>=1.26' not in r['base']:
        res = f"ERROR: 'numpy>=1.26' should be in base, got {r['base']}"
    elif set(r.get('optional', {}).keys()) != {'torch', 'llm'}:
        res = f"ERROR: optional groups should be {{'torch','llm'}}, got {set(r.get('optional',{}).keys())}"
    elif r['optional'].get('torch') != ['torch>=2.3']:
        res = f"ERROR: torch group should be ['torch>=2.3'], got {r['optional'].get('torch')}"
    else:
        res = "SUCCESS: parse_dependencies correctly parses base and optional dependency groups."
res
`,
              hint: 'Split the text by section headers. For [project] find the dependencies = [...] block. For [project.optional-dependencies] each line like `torch = [...]` is a group. Strip quotes and whitespace from individual dep strings.',
            },
          ],
        },
      },
    ],
  },

  quiz: [
    {
      id: 'q1',
      question: 'What problem do virtual environments solve?',
      options: [
        'They make Python code run faster by optimizing the interpreter',
        'They isolate project dependencies so different projects can use different package versions',
        'They provide a graphical interface for managing Python scripts',
        'They automatically update packages to the latest versions',
      ],
      correct: 1,
      explanation: 'Virtual environments give each project its own isolated set of packages. Without them, installing PyTorch 2.4 for one project would overwrite PyTorch 2.1 needed by another.',
    },
    {
      id: 'q2',
      question: 'What is a lockfile in the context of Python dependency management?',
      options: [
        'A file that prevents other users from editing your code',
        'A file that pins every package to an exact version for reproducible installs',
        'A file that locks the Python interpreter version',
        'A file that encrypts your project dependencies',
      ],
      correct: 1,
      explanation: 'A lockfile records the exact version of every package (including transitive dependencies) so anyone installing from it gets identical packages, ensuring reproducibility.',
    },
    {
      id: 'q3',
      question: 'How can you verify that your pip and python commands are using the virtual environment and not the system Python?',
      options: [
        "Run 'pip --version' and check the version number",
        "Run 'which python' and confirm it shows .venv/bin/python, not /usr/bin/python",
        'Check if the terminal background color has changed',
        "Run 'python --check-env' to verify",
      ],
      correct: 1,
      explanation: "'which python' (or 'where python' on Windows) shows the full path to the interpreter. If it points to .venv/bin/python, you are in the virtual environment.",
    },
    {
      id: 'q4',
      question: 'Why is mixing pip and conda in the same environment problematic?',
      options: [
        "Pip packages are incompatible with conda's Python interpreter",
        "Pip installs can break conda's dependency tracking, causing hard-to-debug conflicts",
        'Conda cannot install packages that pip has already installed',
        'It doubles the disk space used by every package',
      ],
      correct: 1,
      explanation: "Conda maintains its own dependency solver. Pip installs bypass it, so conda no longer knows the true state of the environment. This leads to dependency conflicts that are painful to resolve.",
    },
    {
      id: 'q5',
      question: "Your PyTorch code reports 'CUDA not available' despite having an NVIDIA GPU. What is the most likely cause?",
      options: [
        'Your GPU does not support CUDA',
        'PyTorch was installed with a CUDA version incompatible with your GPU driver',
        'You forgot to import the torch.cuda module',
        'Virtual environments cannot access GPU hardware',
      ],
      correct: 1,
      explanation: "PyTorch ships CUDA bindings compiled for specific CUDA versions. If the PyTorch CUDA version exceeds your driver's CUDA version, CUDA will not be available. Check with nvidia-smi and torch.version.cuda.",
    },
  ],
}
