# Tutorial 3: VS Code Configuration

## Introduction

Visual Studio Code (VS Code) is a free, powerful code editor. This tutorial configures it for Python development with:
- Python language support
- Linting and formatting
- Integrated terminal
- Debugging

---

## Part 1: Install VS Code

### 1.1 Download

Download from [code.visualstudio.com](https://code.visualstudio.com/)

### 1.2 Install

**Windows:** Run the installer, accept defaults.

**macOS:** Drag to Applications folder.

**Linux:** Use package manager or .deb/.rpm file.

### 1.3 Launch

Open VS Code. You should see the Welcome tab.

---

## Part 2: Essential Extensions

### 2.1 Install Python Extension

1. Click Extensions icon (sidebar, or `Ctrl+Shift+X`)
2. Search "Python"
3. Install "Python" by Microsoft

This provides:
- IntelliSense (autocomplete)
- Linting
- Debugging
- Test discovery

### 2.2 Other Recommended Extensions

| Extension | Purpose |
|-----------|---------|
| **Python** (Microsoft) | Core Python support |
| **Pylance** | Enhanced language server |
| **GitLens** | Git blame, history |
| **Error Lens** | Inline error display |

Optional but useful:
- **Material Icon Theme** - Better file icons
- **One Dark Pro** - Nice dark theme

---

## Part 3: Open Your Project

### 3.1 Open Folder

1. File → Open Folder
2. Navigate to `c:\Users\g4m3r\Documents\se-path-v2`
3. Click "Select Folder"

### 3.2 Trust the Folder

When prompted, click "Yes, I trust the authors."

### 3.3 Select Python Interpreter

1. Press `Ctrl+Shift+P` to open Command Palette
2. Type "Python: Select Interpreter"
3. Choose the one in your venv: `.\venv\Scripts\python.exe`

You'll see the selected interpreter in the status bar.

---

## Part 4: Settings Configuration

### 4.1 Open Settings

`Ctrl+,` opens Settings GUI.

For JSON settings: Click the `{}` icon in top right.

### 4.2 Recommended Settings

Create/edit `.vscode/settings.json` in your project:

```json
{
    "python.defaultInterpreterPath": "${workspaceFolder}/venv/Scripts/python.exe",
    
    "python.formatting.provider": "none",
    "[python]": {
        "editor.defaultFormatter": "ms-python.black-formatter",
        "editor.formatOnSave": true
    },
    
    "python.linting.enabled": true,
    
    "editor.rulers": [88],
    "editor.tabSize": 4,
    "editor.insertSpaces": true,
    
    "files.trimTrailingWhitespace": true,
    "files.insertFinalNewline": true,
    
    "python.testing.pytestEnabled": true,
    "python.testing.pytestArgs": ["tests"],
    
    "files.exclude": {
        "**/__pycache__": true,
        "**/*.pyc": true,
        "venv": true
    }
}
```

### 4.3 Setting Explanations

| Setting | Purpose |
|---------|---------|
| `defaultInterpreterPath` | Points to your venv |
| `formatOnSave` | Auto-format when saving |
| `rulers: [88]` | Line length guide at 88 chars |
| `pytestEnabled` | Use pytest for testing |
| `files.exclude` | Hide clutter in explorer |

---

## Part 5: Keyboard Shortcuts

### 5.1 Essential Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+P` | Command Palette |
| `Ctrl+P` | Quick file open |
| `Ctrl+`` ` | Toggle terminal |
| `F5` | Start debugging |
| `Ctrl+Shift+E` | File explorer |
| `Ctrl+Shift+F` | Search in files |
| `Ctrl+/` | Toggle comment |
| `Ctrl+D` | Select next occurrence |
| `F12` | Go to definition |
| `Shift+F12` | Find all references |

### 5.2 Python-Specific

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+P` → "Run Python File" | Execute current file |
| `Shift+Enter` | Run selection in terminal |
| `Ctrl+Shift+P` → "Python: Run Tests" | Run tests |

---

## Part 6: Integrated Terminal

### 6.1 Open Terminal

Press `Ctrl+`` ` (backtick) or Terminal → New Terminal.

### 6.2 Terminal Defaults

VS Code opens terminal in your project folder.

If venv isn't auto-activated, activate manually:
```powershell
.\venv\Scripts\Activate.ps1
```

### 6.3 Multiple Terminals

- Click `+` to add terminals
- Split with the split button
- Switch using dropdown

---

## Part 7: Debugging Setup

### 7.1 Create Launch Configuration

1. Go to Run view (`Ctrl+Shift+D`)
2. Click "create a launch.json file"
3. Select "Python"
4. Select "Python File"

This creates `.vscode/launch.json`:

```json
{
    "version": "0.2.0",
    "configurations": [
        {
            "name": "Python: Current File",
            "type": "debugpy",
            "request": "launch",
            "program": "${file}",
            "console": "integratedTerminal"
        }
    ]
}
```

### 7.2 Using the Debugger

1. Set breakpoint: Click left of line number
2. Press `F5` to start debugging
3. Use debug toolbar to step through code
4. Inspect variables in the Debug panel

---

## Part 8: Exercises

### Exercise 1: Verify Setup

Create a test file and verify everything works:

1. Create `test_setup.py` in project root
2. Add:
   ```python
   def greet(name: str) -> str:
       return f"Hello, {name}!"
   
   if __name__ == "__main__":
       print(greet("PartFlow"))
   ```
3. Right-click → Run Python File
4. Verify "Hello, PartFlow!" appears

<details>
<summary>Troubleshooting</summary>

**If it doesn't run:**
- Check interpreter is set to venv
- Ensure file is saved
- Check terminal for errors

</details>

---

### Exercise 2: Debugging Practice

1. Add a breakpoint on the `return` line
2. Press `F5`
3. When stopped, check the `name` variable in Debug panel
4. Press `F5` again to continue

<details>
<summary>What You Should See</summary>

- Execution pauses at breakpoint
- Debug panel shows: `name = "PartFlow"`
- After continuing, output appears

</details>

---

## Summary

### Key Takeaways

| Component | Configuration |
|-----------|---------------|
| Python extension | Core language support |
| Interpreter | Set to venv Python |
| formatOnSave | Keeps code clean |
| pytest | Test framework enabled |
| Terminal | Integrated, auto-activated |

### Verification Checklist

- [ ] Python extension installed
- [ ] Interpreter shows venv path in status bar
- [ ] Terminal opens in project folder
- [ ] Can run Python files
- [ ] Can set and hit breakpoints

---

## Next Tutorial

[Tutorial 4: Git Basics →](./04-git-basics.md)
