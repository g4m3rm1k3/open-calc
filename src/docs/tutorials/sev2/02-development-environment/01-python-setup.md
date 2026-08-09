# Tutorial 1: Python Setup

## Introduction

Python is the language we'll use for PartFlow. This tutorial ensures you have Python 3.11+ installed correctly.

---

## Part 1: Check Current Installation

### 1.1 Open a Terminal

**Windows:** Press `Win + R`, type `cmd` or `powershell`, press Enter.

**macOS/Linux:** Open Terminal application.

### 1.2 Check Python Version

```bash
python --version
```

You should see something like:
```
Python 3.11.4
```

**If you see `Python 2.x` or an error:**
Try:
```bash
python3 --version
```

**If neither works**, proceed to installation.

---

## Part 2: Install Python

### 2.1 Windows Installation

1. **Download** Python from [python.org/downloads](https://www.python.org/downloads/)
2. **Run** the installer
3. **CRITICAL**: Check ✅ "Add Python to PATH" at the bottom of the first screen
4. Click "Install Now"
5. Restart your terminal

**Verify:**
```bash
python --version
```

### 2.2 macOS Installation

**Option A: Using Homebrew (Recommended)**
```bash
# Install Homebrew if not present
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Python
brew install python@3.11
```

**Option B: Download from python.org**
1. Download from [python.org/downloads](https://www.python.org/downloads/)
2. Run the .pkg installer
3. Follow the prompts

### 2.3 Linux Installation

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install python3.11 python3.11-venv python3-pip
```

**Fedora:**
```bash
sudo dnf install python3.11
```

---

## Part 3: Verify Installation

### 3.1 Basic Verification

```bash
# Version check
python --version
# OR
python3 --version
```

Expected output: `Python 3.11.x` or higher

### 3.2 Test the REPL

```bash
python
```

You should see:
```
Python 3.11.x (...)
Type "help", "copyright", "credits" or "license" for more information.
>>>
```

Test with:
```python
>>> print("Hello, PartFlow!")
Hello, PartFlow!
>>> exit()
```

### 3.3 Pip Verification

```bash
pip --version
# OR
pip3 --version
```

Expected output: `pip 23.x from ... (python 3.11)`

---

## Part 4: Understanding the Python Ecosystem

### 4.1 What is Python?

Python is:
- An **interpreted** language (runs line by line)
- **Dynamically typed** (types checked at runtime)
- **High-level** (memory managed for you)
- **Readable** (clean, expressive syntax)

### 4.2 Key Components

| Component | Purpose |
|-----------|---------|
| **python** | The interpreter—runs your code |
| **pip** | Package manager—installs libraries |
| **venv** | Virtual environment tool—isolates projects |
| **REPL** | Interactive interpreter—test code quickly |

### 4.3 Python vs python3

On some systems:
- `python` → Python 2.x (legacy)
- `python3` → Python 3.x (current)

On newer systems:
- `python` → Python 3.x

**For this curriculum, we assume `python` means Python 3.11+.**

---

## Part 5: Exercises

### Exercise 1: Version Exploration

Run these commands and record the output:

```bash
python --version
pip --version
python -c "import sys; print(sys.executable)"
```

<details>
<summary>Expected Output Example</summary>

```
Python 3.11.4
pip 23.0.1 from /usr/local/lib/python3.11/site-packages/pip (python 3.11)
/usr/local/bin/python3.11
```

The path will vary by system.

</details>

---

### Exercise 2: REPL Exploration

Open the Python REPL and try these:

```python
>>> 2 + 2
>>> "PartFlow"[0]
>>> len("Manufacturing")
>>> type(42)
>>> import this
```

<details>
<summary>What You Should See</summary>

```python
>>> 2 + 2
4
>>> "PartFlow"[0]
'P'
>>> len("Manufacturing")
13
>>> type(42)
<class 'int'>
>>> import this
The Zen of Python, by Tim Peters
...
```

The `import this` displays Python's philosophy!

</details>

---

## Summary

### Key Takeaways

- Python 3.11+ is **required** for this curriculum
- `python --version` verifies your installation
- `pip` manages packages
- The REPL lets you experiment quickly

### Verification Checklist

- [ ] `python --version` shows 3.11 or higher
- [ ] `pip --version` shows pip is installed
- [ ] REPL starts with `python` command
- [ ] REPL exits with `exit()`

---

## Next Tutorial

[Tutorial 2: Virtual Environments →](./02-virtual-environments.md)
