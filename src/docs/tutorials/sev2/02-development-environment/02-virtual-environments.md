# Tutorial 2: Virtual Environments

## Introduction

A **virtual environment** is an isolated Python installation for a specific project. It ensures:
- Your project's dependencies don't conflict with other projects
- You can reproduce the exact environment on any machine
- System Python stays clean

> **Never install project packages globally.** Always use virtual environments.

---

## Part 1: Why Virtual Environments?

### 1.1 The Problem Without Virtual Environments

Imagine:
- Project A needs `flask==2.0`
- Project B needs `flask==3.0`
- You install globally: only one version wins
- One project breaks

### 1.2 The Solution

| Without venv | With venv |
|--------------|-----------|
| One global Python | Isolated per project |
| Packages conflict | Each project has own packages |
| Upgrading breaks things | Upgrades are isolated |
| Can't reproduce | Lock file ensures exact versions |

---

## Part 2: Creating a Virtual Environment

### 2.1 Navigate to Project Directory

```bash
cd c:\Users\g4m3r\Documents\se-path-v2
```

### 2.2 Create the Virtual Environment

```bash
python -m venv venv
```

**Line-by-line breakdown:**

| Part | Meaning |
|------|---------|
| `python` | Run Python interpreter |
| `-m venv` | Run the `venv` module |
| `venv` | Name of the directory to create |

This creates a `venv` folder containing:
- A copy of the Python interpreter
- A `pip` for this environment
- A place for installed packages

### 2.3 Directory Structure Created

```
se-path-v2/
├── venv/                 # Virtual environment
│   ├── Scripts/          # (Windows) Activation scripts
│   │   ├── python.exe
│   │   ├── pip.exe
│   │   └── activate.bat
│   ├── bin/              # (macOS/Linux) Activation scripts
│   │   ├── python
│   │   ├── pip
│   │   └── activate
│   ├── lib/              # Installed packages go here
│   └── pyvenv.cfg        # Configuration
└── ...
```

---

## Part 3: Activating the Virtual Environment

### 3.1 Activation Commands

**Windows (PowerShell):**
```powershell
.\venv\Scripts\Activate.ps1
```

**Windows (Command Prompt):**
```cmd
.\venv\Scripts\activate.bat
```

**macOS/Linux:**
```bash
source venv/bin/activate
```

### 3.2 How to Know It's Active

Your prompt changes to show `(venv)`:

```
(venv) C:\Users\g4m3r\Documents\se-path-v2>
```

### 3.3 Verify Active Environment

```bash
which python    # macOS/Linux
where python    # Windows
```

Should show path inside `venv`:
```
C:\Users\g4m3r\Documents\se-path-v2\venv\Scripts\python.exe
```

---

## Part 4: Installing Packages

### 4.1 Install a Package

With venv activated:

```bash
pip install flask
```

### 4.2 Where Packages Go

Packages install into `venv/Lib/site-packages/`:
- NOT into global Python
- Isolated to this environment

### 4.3 List Installed Packages

```bash
pip list
```

Output:
```
Package    Version
---------- -------
Flask      3.0.0
Jinja2     3.1.2
...
```

---

## Part 5: Freezing Requirements

### 5.1 Create requirements.txt

```bash
pip freeze > requirements.txt
```

This creates a file listing exact versions:

```
Flask==3.0.0
Jinja2==3.1.2
MarkupSafe==2.1.3
Werkzeug==3.0.1
...
```

### 5.2 Why requirements.txt?

- **Reproducibility**: Anyone can recreate your environment
- **Documentation**: Shows what your project needs
- **Deployment**: Install same versions in production

### 5.3 Install from requirements.txt

On a new machine or fresh venv:

```bash
pip install -r requirements.txt
```

---

## Part 6: Deactivating

### 6.1 Deactivate the Environment

```bash
deactivate
```

Your prompt returns to normal (no more `(venv)`).

### 6.2 When to Deactivate

- When switching to a different project
- When you're done for the day
- Before activating a different venv

---

## Part 7: Best Practices

### 7.1 Virtual Environment Naming

| Convention | Example | Notes |
|------------|---------|-------|
| `venv` | `venv/` | Most common, recognized by tools |
| `.venv` | `.venv/` | Hidden on Linux/macOS |
| Project-based | `partflow-env/` | Clearer if multiple envs |

**We use `venv`** for simplicity.

### 7.2 Git Ignore

**Always add venv to .gitignore:**

```gitignore
# Virtual environment
venv/
.venv/

# Python cache
__pycache__/
*.pyc
```

Never commit the virtual environment—it's large and system-specific.

### 7.3 Keep requirements.txt Updated

After installing new packages:
```bash
pip freeze > requirements.txt
git add requirements.txt
git commit -m "Add flask dependency"
```

---

## Part 8: Exercises

### Exercise 1: Create and Activate

1. Navigate to project directory
2. Create venv: `python -m venv venv`
3. Activate it
4. Verify with `where python` or `which python`

<details>
<summary>Solution (Windows PowerShell)</summary>

```powershell
cd c:\Users\g4m3r\Documents\se-path-v2
python -m venv venv
.\venv\Scripts\Activate.ps1
where python
# Should show: C:\Users\g4m3r\Documents\se-path-v2\venv\Scripts\python.exe
```

</details>

---

### Exercise 2: Install and Freeze

1. Activate venv
2. Install pytest: `pip install pytest`
3. List packages: `pip list`
4. Freeze: `pip freeze > requirements.txt`
5. View the file

<details>
<summary>Solution</summary>

```bash
# Activate (Windows)
.\venv\Scripts\Activate.ps1

# Install
pip install pytest

# List
pip list
# Shows pytest and dependencies

# Freeze
pip freeze > requirements.txt

# View (Windows)
type requirements.txt
# View (macOS/Linux)
cat requirements.txt
```

</details>

---

### Exercise 3: Recreate Environment

Simulate what a teammate would do:

1. Deactivate current venv
2. Delete the venv folder
3. Create new venv
4. Activate
5. Install from requirements.txt
6. Verify pytest is installed

<details>
<summary>Solution</summary>

```bash
# Deactivate
deactivate

# Delete (Windows)
rmdir /s /q venv
# Delete (macOS/Linux)
rm -rf venv

# Recreate
python -m venv venv

# Activate
.\venv\Scripts\Activate.ps1  # Windows
# source venv/bin/activate   # macOS/Linux

# Install from file
pip install -r requirements.txt

# Verify
pip list
# pytest should be there
```

</details>

---

## Summary

### Key Takeaways

| Command | Purpose |
|---------|---------|
| `python -m venv venv` | Create virtual environment |
| `.\venv\Scripts\Activate.ps1` | Activate (Windows PowerShell) |
| `source venv/bin/activate` | Activate (macOS/Linux) |
| `pip install X` | Install package |
| `pip freeze > requirements.txt` | Save dependencies |
| `pip install -r requirements.txt` | Install from file |
| `deactivate` | Deactivate environment |

### Verification Checklist

- [ ] Can create a virtual environment
- [ ] Can activate (prompt shows `(venv)`)
- [ ] `where python` shows path inside venv
- [ ] Can install packages
- [ ] Can freeze requirements
- [ ] Can recreate from requirements.txt

---

## Next Tutorial

[Tutorial 3: VS Code Configuration →](./03-vscode-setup.md)
