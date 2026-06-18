export default {
  id: 'ae-p0-08-editor-setup',
  slug: 'editor-setup',
  chapter: 'ae-p0',
  order: 7,
  title: 'Editor Setup',
  subtitle: 'Your editor is your co-pilot. Configure it once so it stays out of your way and starts pulling its weight.',
  tags: ['vscode', 'pylance', 'jupyter', 'remote-ssh', 'black', 'ruff', 'extensions', 'editor'],

  hook: {
    question: 'How much time do you lose every day to a misconfigured editor?',
    realWorldContext:
      "You'll spend thousands of hours inside your editor writing Python, running notebooks, debugging training loops, and SSH-ing into GPU boxes. A misconfigured editor turns every session into friction: no autocomplete, no type hints, no inline errors, manual formatting, and a clunky terminal workflow. The right setup takes 20 minutes. Skipping it costs you 20 minutes every day.",
    previewVisualizationId: 'PythonNotebook',
  },

  intuition: {
    prose: [
      'An AI engineering editor setup needs five layers, each building on the one below: (1) base editor, (2) extensions, (3) AI-specific settings, (4) terminal integration, (5) remote development via SSH.',
      'VS Code is the recommended editor — free, cross-platform, first-class Jupyter support, and the extension ecosystem covers everything needed for AI work. Cursor and Windsurf are VS Code forks with built-in AI generation; they use the same settings and extension format.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Remote SSH is the most important extension for AI',
        body: 'You will train on remote GPU machines. Remote SSH lets you open a folder on a Lambda/RunPod/EC2 box, edit files, run terminals, and debug — all as if the files were local. Set this up before you need it.',
      },
      {
        type: 'warning',
        title: "Don't start Vim/Neovim now",
        body: "If you already use Vim and are productive in it, stay there. If you don't, the learning curve will compete with learning AI engineering. Use VS Code.",
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'Editor Setup',
        mathBridge: 'Five-layer setup: Base Editor → Extensions → AI-Specific Settings → Terminal Integration → Remote Development.',
        caption: 'Work through these cells to understand the VS Code setup for AI engineering.',
        props: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Essential extensions',
              prose: [
                '## Install with one command',
                '```bash\ncode --install-extension ms-python.python\ncode --install-extension ms-python.vscode-pylance\ncode --install-extension ms-toolsai.jupyter\ncode --install-extension eamodio.gitlens\ncode --install-extension ms-vscode-remote.remote-ssh\ncode --install-extension ms-python.debugpy\ncode --install-extension ms-python.black-formatter\ncode --install-extension charliermarsh.ruff\n```',
                '## What each extension does',
                '| Extension | Why |\n|-----------|-----|\n| Python | Language support, virtual env detection, run/debug |\n| Pylance | Fast type checking, autocomplete, import resolution |\n| Jupyter | Run notebooks inside VS Code, variable explorer |\n| GitLens | See who changed what, inline git blame |\n| Remote SSH | Open a folder on a remote GPU box as if it were local |\n| Debugpy | Step-through debugging for Python |\n| Black Formatter | Auto-format on save, consistent style |\n| Ruff | Fast linting, catches common mistakes |',
              ],
              code: `# The five layers of an AI engineering editor setup

layers = {
    "1. Base Editor": {
        "tool": "VS Code",
        "why": "Free, extensible, universal — Jupyter support, cross-platform",
        "install": "code.visualstudio.com",
    },
    "2. Extensions": {
        "tool": "Python, Pylance, Jupyter, GitLens, Remote SSH, Debugpy, Black, Ruff",
        "why": "Language intelligence, notebook support, remote dev, formatting",
        "install": "code --install-extension <id>",
    },
    "3. AI-Specific Settings": {
        "tool": "settings.json",
        "why": "Type checking, format-on-save, notebook output scrolling",
        "install": "Settings > Open Settings (JSON)",
    },
    "4. Terminal Integration": {
        "tool": "Integrated terminal",
        "why": "Run scripts, monitor GPU, manage environments without leaving editor",
        "install": "Ctrl+\` to open",
    },
    "5. Remote Development": {
        "tool": "Remote SSH extension",
        "why": "Edit files on GPU boxes, run training, debug — all locally",
        "install": "Ctrl+Shift+P → Remote-SSH: Connect to Host",
    },
}

for layer, info in layers.items():
    print(f"{layer}")
    print(f"  Tool: {info['tool']}")
    print(f"  Why:  {info['why']}")
    print(f"  How:  {info['install']}")
    print()`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 2,
              cellTitle: 'Key settings for AI work',
              prose: [
                '## The settings that matter',
                '```jsonc\n{\n    "python.analysis.typeCheckingMode": "basic",\n    "editor.formatOnSave": true,\n    "editor.rulers": [88, 120],\n    "notebook.output.scrolling": true,\n    "files.autoSave": "afterDelay"\n}\n```',
                '## Why each setting matters',
                '- **Type checking on basic**: Catches wrong argument types before you run. Saves debugging time on tensor shape mismatches and wrong API parameters.\n- **Format on save**: Never think about formatting again. Black handles it.\n- **Rulers at 88 and 120**: Black wraps at 88. The 120 marker shows when docstrings are too long.\n- **Notebook output scrolling**: Training loops print thousands of lines. Without scrolling, the output panel explodes.\n- **Auto-save**: You will forget to save. Your training script will run stale code.',
                '## Terminal settings',
                '```jsonc\n{\n    "terminal.integrated.defaultProfile.linux": "bash",\n    "terminal.integrated.fontSize": 13,\n    "terminal.integrated.scrollback": 10000\n}\n```',
              ],
              code: `# Demonstrate why type checking catches AI bugs early

def compute_loss(predictions, targets, reduction='mean'):
    """Cross-entropy loss. predictions: (batch, classes), targets: (batch,)"""
    # Type checker would flag if you passed the wrong shapes
    if not (len(predictions.shape) == 2 and len(targets.shape) == 1):
        raise ValueError(
            f"Expected predictions (batch, classes) and targets (batch,), "
            f"got {predictions.shape} and {targets.shape}"
        )
    return predictions, targets

import numpy as np

# Correct usage
preds = np.zeros((32, 10))   # batch=32, classes=10
tgts = np.zeros(32)           # batch=32

# This is what Pylance flags BEFORE you run:
# Wrong shapes that cause silent failures in PyTorch
wrong_preds = np.zeros((10, 32))  # transposed!
wrong_tgts = np.zeros((32, 1))    # extra dimension

print("Type checking catches shape mismatches at edit time:")
print(f"  Correct: preds={preds.shape}, targets={tgts.shape} ✓")
print(f"  Wrong:   preds={wrong_preds.shape} (transposed) — Pylance flags this")
print(f"  Wrong:   targets={wrong_tgts.shape} (extra dim) — Pylance flags this")
print()
print("Without type checking: fails at runtime after potentially hours of training.")
print("With Pylance basic: fails immediately at edit time with a red squiggle.")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 3,
              cellTitle: 'Remote SSH for GPU boxes',
              prose: [
                '## Setup',
                '1. Install the Remote SSH extension (done in Step 2).\n2. Press `Ctrl+Shift+P`, type "Remote-SSH: Connect to Host".\n3. Enter `user@your-gpu-box-ip`.\n4. VS Code installs its server component on the remote machine automatically.',
                '## Passwordless access with SSH keys',
                '```bash\nssh-keygen -t ed25519 -C "your-email@example.com"\nssh-copy-id user@your-gpu-box-ip\n```',
                '## ~/.ssh/config for convenience',
                '```\nHost gpu-box\n    HostName 203.0.113.50\n    User ubuntu\n    IdentityFile ~/.ssh/id_ed25519\n    ForwardAgent yes\n```',
                'Now "Remote-SSH: Connect to Host → gpu-box" connects instantly.',
                '## Editor alternatives',
                '**Cursor** (cursor.com) and **Windsurf** (windsurf.com) are VS Code forks with built-in AI generation. Both use the same extension ecosystem and settings format — everything in this lesson applies to them.',
              ],
              code: `# SSH config parser — demonstrates the ~/.ssh/config structure
# that makes Remote SSH connections instant

def parse_ssh_config(config_text):
    """Parse a simplified ~/.ssh/config into a dict of hosts."""
    hosts = {}
    current_host = None

    for line in config_text.strip().split('\\n'):
        line = line.strip()
        if not line or line.startswith('#'):
            continue
        key, _, value = line.partition(' ')
        key = key.strip()
        value = value.strip()

        if key == 'Host':
            current_host = value
            hosts[current_host] = {}
        elif current_host:
            hosts[current_host][key] = value

    return hosts

ssh_config = """
Host gpu-box
    HostName 203.0.113.50
    User ubuntu
    IdentityFile ~/.ssh/id_ed25519
    ForwardAgent yes

Host lambda-a100
    HostName 192.168.1.100
    User ubuntu
    IdentityFile ~/.ssh/lambda_key
    Port 22
"""

hosts = parse_ssh_config(ssh_config)
print("SSH hosts configured:")
for host, settings in hosts.items():
    print(f"\\n  {host}:")
    for key, val in settings.items():
        print(f"    {key}: {val}")

print("\\nConnect with VS Code: Ctrl+Shift+P → Remote-SSH: Connect to Host → gpu-box")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 'c1',
              challengeType: 'write',
              challengeNumber: 1,
              challengeTitle: 'settings.json validator',
              difficulty: 'easy',
              prompt: 'Write `validate_vscode_settings(settings)` that takes a dict of VS Code settings and returns a list of missing recommended settings for AI work. Check for: `"python.analysis.typeCheckingMode"` set to `"basic"` or `"strict"`, `"editor.formatOnSave"` set to `True`, `"notebook.output.scrolling"` set to `True`, and `"files.autoSave"` set to `"afterDelay"`.',
              code: `def validate_vscode_settings(settings):
    """
    Check a VS Code settings dict for recommended AI engineering settings.
    Returns a list of warning strings for missing/incorrect settings.
    """
    pass

# Missing several recommended settings
partial_settings = {
    "editor.formatOnSave": True,
    "editor.rulers": [88, 120],
    "terminal.integrated.fontSize": 13,
}

warnings = validate_vscode_settings(partial_settings)
print(f"{len(warnings)} warnings:")
for w in warnings:
    print(f"  {w}")

print()

# Fully configured
full_settings = {
    "python.analysis.typeCheckingMode": "basic",
    "editor.formatOnSave": True,
    "notebook.output.scrolling": True,
    "files.autoSave": "afterDelay",
}

warnings2 = validate_vscode_settings(full_settings)
print(f"Full settings — {len(warnings2)} warnings (should be 0)")
`,
              output: '', status: 'idle', figureJson: null,
              testCode: `
if 'validate_vscode_settings' not in dir():
    res = "ERROR: validate_vscode_settings not defined."
else:
    empty = {}
    w = validate_vscode_settings(empty)
    if not isinstance(w, list):
        res = "ERROR: Must return a list."
    elif len(w) < 4:
        res = f"ERROR: Empty settings should have at least 4 warnings, got {len(w)}: {w}"
    else:
        full = {
            "python.analysis.typeCheckingMode": "basic",
            "editor.formatOnSave": True,
            "notebook.output.scrolling": True,
            "files.autoSave": "afterDelay",
        }
        w2 = validate_vscode_settings(full)
        if len(w2) != 0:
            res = f"ERROR: Full settings should have 0 warnings, got {len(w2)}: {w2}"
        else:
            res = "SUCCESS: validate_vscode_settings correctly identifies missing AI engineering settings."
res
`,
              hint: 'Check each recommended setting individually. For typeCheckingMode, accepted values are "basic" and "strict". Return a descriptive string for each missing or incorrect setting.',
            },
            {
              id: 'c2',
              challengeType: 'write',
              challengeNumber: 2,
              challengeTitle: 'Extension dependency checker',
              difficulty: 'medium',
              prompt: 'Write `check_extensions(installed, required)` where `installed` is a list of installed extension IDs and `required` is a dict mapping extension ID to description. Return a dict with `"installed"` (list of satisfied extensions), `"missing"` (list of extension IDs not installed), and `"install_command"` (a single `code --install-extension` shell command string to install all missing extensions at once).',
              code: `def check_extensions(installed, required):
    """
    Check which required VS Code extensions are missing.
    Returns: {installed, missing, install_command}
    """
    pass

installed_extensions = [
    "ms-python.python",
    "ms-python.vscode-pylance",
    "ms-toolsai.jupyter",
    "eamodio.gitlens",
]

required_extensions = {
    "ms-python.python": "Python language support",
    "ms-python.vscode-pylance": "Type checking and autocomplete",
    "ms-toolsai.jupyter": "Notebook support",
    "eamodio.gitlens": "Git integration",
    "ms-vscode-remote.remote-ssh": "Remote GPU development",
    "ms-python.debugpy": "Python debugger",
    "ms-python.black-formatter": "Auto-formatting",
    "charliermarsh.ruff": "Fast linting",
}

result = check_extensions(installed_extensions, required_extensions)
print(f"Installed ({len(result['installed'])}): {result['installed']}")
print(f"Missing ({len(result['missing'])}): {result['missing']}")
print(f"\\nInstall command:")
print(result['install_command'])
`,
              output: '', status: 'idle', figureJson: null,
              testCode: `
if 'check_extensions' not in dir():
    res = "ERROR: check_extensions not defined."
else:
    installed = ["ms-python.python", "ms-toolsai.jupyter"]
    required = {
        "ms-python.python": "Python",
        "ms-toolsai.jupyter": "Jupyter",
        "charliermarsh.ruff": "Linting",
    }
    r = check_extensions(installed, required)
    if not isinstance(r, dict):
        res = "ERROR: Must return a dict."
    elif set(r.get('installed', [])) != {"ms-python.python", "ms-toolsai.jupyter"}:
        res = f"ERROR: installed wrong, got {r.get('installed')}"
    elif r.get('missing') != ["charliermarsh.ruff"]:
        res = f"ERROR: missing should be ['charliermarsh.ruff'], got {r.get('missing')}"
    elif 'code --install-extension charliermarsh.ruff' not in r.get('install_command', ''):
        res = f"ERROR: install_command should contain 'code --install-extension charliermarsh.ruff', got: {r.get('install_command')}"
    else:
        res = "SUCCESS: check_extensions correctly identifies missing extensions and generates the install command."
res
`,
              hint: 'installed list = [ext for ext in required if ext in installed]. missing = [ext for ext in required if ext not in installed]. install_command = "code " + " ".join(f"--install-extension {e}" for e in missing).',
            },
          ],
        },
      },
    ],
  },

  quiz: [
    {
      id: 'q1',
      question: 'What is a Language Server Protocol (LSP)?',
      options: [
        'A protocol for transferring files between editors',
        'A standard for editors to receive type info, completions, and diagnostics from a language-specific server',
        'A compression format for source code files',
        'A network protocol for remote pair programming',
      ],
      correct: 1,
      explanation: 'LSP is a standardized protocol that lets editors communicate with language servers for features like autocomplete, type checking, and error diagnostics, regardless of the editor used.',
    },
    {
      id: 'q2',
      question: 'Why is format-on-save useful for team projects?',
      options: [
        'It reduces file sizes by removing whitespace',
        'It ensures consistent code style across all contributors without manual formatting',
        'It catches runtime bugs before the code is executed',
        'It compresses the code for faster git operations',
      ],
      correct: 1,
      explanation: 'Format-on-save runs a formatter (like Black or Ruff) every time you save, ensuring all code follows the same style conventions regardless of who wrote it.',
    },
    {
      id: 'q3',
      question: 'Which VS Code extension enables editing code on a remote GPU machine as if it were local?',
      options: [
        'GitLens',
        'Pylance',
        'Remote SSH',
        'Debugpy',
      ],
      correct: 2,
      explanation: 'Remote SSH installs a lightweight VS Code server on the remote machine and streams the UI to your local editor, letting you edit files, run terminals, and debug remotely.',
    },
    {
      id: 'q4',
      question: "Why should 'notebook.output.scrolling' be enabled in VS Code settings for AI work?",
      options: [
        'It enables horizontal scrolling for wide dataframes',
        'It prevents training loop output (thousands of lines) from exploding the output panel',
        'It allows scrolling between notebook cells with the mouse wheel',
        'It enables smooth scrolling animations in the editor',
      ],
      correct: 1,
      explanation: "Training loops can print thousands of lines of output. Without output scrolling, the notebook output panel grows unbounded, making the notebook unusable.",
    },
    {
      id: 'q5',
      question: "What does setting 'python.analysis.typeCheckingMode' to 'basic' in VS Code accomplish?",
      options: [
        'It enables syntax highlighting for Python files',
        'It catches wrong argument types and tensor shape mismatches before running the code',
        'It formats Python code according to PEP 8 standards',
        'It enables Python 3.12 language features',
      ],
      correct: 1,
      explanation: "Basic type checking with Pylance flags type mismatches, wrong argument types, and incorrect API parameters at edit time, catching bugs before you run a potentially expensive training script.",
    },
  ],
}
