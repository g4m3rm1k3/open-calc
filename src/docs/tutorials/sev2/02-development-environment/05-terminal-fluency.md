# Tutorial 5: Terminal Fluency

## Introduction

The terminal (command line) is where engineers spend significant time. Fluency in the terminal makes you faster and more capable.

> **The terminal is not something to avoid—it's something to master.**

---

## Part 1: Why Terminal Matters

### 1.1 GUIs vs Terminal

| GUI | Terminal |
|-----|----------|
| Click to navigate | Type to navigate |
| Limited operations | Full power |
| Different per tool | Consistent interface |
| Scripts impossible | Scripts automate work |

### 1.2 Terminal Enables

- Automation through scripts
- Server management (no GUI available)
- Complex file operations
- Tool chaining (pipes)
- Reproducible commands

---

## Part 2: Navigation Commands

### 2.1 Where Am I?

```bash
pwd     # Print Working Directory (macOS/Linux)
cd      # On Windows PowerShell, just type cd
```

### 2.2 List Contents

**Windows (PowerShell):**
```powershell
dir         # List files
dir -Force  # Include hidden files
ls          # Alias for dir
```

**macOS/Linux:**
```bash
ls          # List files
ls -la      # Long format with hidden files
ls -lh      # Human-readable sizes
```

### 2.3 Change Directory

```bash
cd foldername       # Go into folder
cd ..               # Go up one level
cd ../..            # Go up two levels
cd ~                # Go to home directory
cd /                # Go to root
cd -                # Go to previous directory (Linux/macOS)
```

### 2.4 Common Paths

```bash
.     # Current directory
..    # Parent directory
~     # Home directory
/     # Root directory (Linux/macOS)
```

---

## Part 3: File Operations

### 3.1 Create Files

**Windows PowerShell:**
```powershell
New-Item filename.txt           # Create file
New-Item -ItemType Directory folder  # Create folder
ni filename.txt                 # Short form
mkdir folder                    # Create folder
```

**macOS/Linux:**
```bash
touch filename.txt    # Create empty file
mkdir folder          # Create folder
mkdir -p a/b/c        # Create nested folders
```

### 3.2 View Files

**Windows PowerShell:**
```powershell
type filename.txt     # Display file contents
Get-Content filename.txt  # Same, long form
gc filename.txt       # Same, short form
```

**macOS/Linux:**
```bash
cat filename.txt      # Display entire file
less filename.txt     # Paginated view (q to quit)
head filename.txt     # First 10 lines
tail filename.txt     # Last 10 lines
tail -f logfile.txt   # Follow file (live updates)
```

### 3.3 Copy, Move, Delete

**Windows PowerShell:**
```powershell
Copy-Item source dest     # Copy
Move-Item source dest     # Move/rename
Remove-Item filename      # Delete file
Remove-Item folder -Recurse  # Delete folder
```

**macOS/Linux:**
```bash
cp source dest        # Copy
cp -r folder dest     # Copy folder

mv source dest        # Move/rename

rm filename           # Delete file
rm -r folder          # Delete folder
rm -rf folder         # Force delete (dangerous!)
```

---

## Part 4: Searching

### 4.1 Find Files

**Windows PowerShell:**
```powershell
Get-ChildItem -Recurse -Filter "*.py"   # Find Python files
gci -r -filter "*.py"                    # Short form
```

**macOS/Linux:**
```bash
find . -name "*.py"           # Find Python files
find . -type f -name "*.md"   # Find Markdown files
find . -type d -name "test*"  # Find test directories
```

### 4.2 Search Within Files

**Windows PowerShell:**
```powershell
Select-String -Path "*.py" -Pattern "def"  # Find "def" in Python files
sls "error" logfile.txt                     # Search in file
```

**macOS/Linux:**
```bash
grep "def" *.py           # Find "def" in Python files
grep -r "TODO" .          # Recursive search
grep -n "error" file.txt  # Show line numbers
grep -i "Error" file.txt  # Case insensitive
```

---

## Part 5: Pipes and Redirection

### 5.1 Pipes

Pipes (`|`) send output of one command to another:

```bash
# Count Python files
dir *.py | Measure-Object         # Windows
ls *.py | wc -l                   # macOS/Linux

# Find large files
dir -Recurse | Sort-Object Length -Descending | Select-Object -First 10
ls -lS | head -10
```

### 5.2 Redirection

```bash
# Output to file
echo "Hello" > file.txt    # Overwrite
echo "World" >> file.txt   # Append

# Errors to file
python script.py 2> errors.txt   # Errors only
python script.py > output.txt 2>&1  # Both stdout and stderr
```

---

## Part 6: Environment Variables

### 6.1 View Variables

**Windows PowerShell:**
```powershell
$env:PATH              # View PATH
Get-ChildItem env:     # View all
$env:USERNAME          # Current user
```

**macOS/Linux:**
```bash
echo $PATH             # View PATH
env                    # View all
echo $USER             # Current user
```

### 6.2 Set Variables

**Windows PowerShell (session only):**
```powershell
$env:MY_VAR = "value"
```

**macOS/Linux (session only):**
```bash
export MY_VAR="value"
```

---

## Part 7: Process Management

### 7.1 Running Processes

**Windows PowerShell:**
```powershell
Get-Process                   # List processes
Get-Process python            # Find Python processes
Stop-Process -Name python     # Kill by name
```

**macOS/Linux:**
```bash
ps aux                    # List all processes
ps aux | grep python      # Find Python
kill PID                  # Kill by PID
kill -9 PID               # Force kill
```

### 7.2 Background Processes

```bash
python script.py &        # Run in background (Linux/macOS)
jobs                      # List background jobs
fg                        # Bring to foreground
```

---

## Part 8: Common Patterns

### 8.1 Quick File Operations

```bash
# Create file and open
touch newfile.py && code newfile.py

# Create folder and navigate
mkdir newfolder && cd newfolder

# Copy and rename
cp file.txt file_backup.txt
```

### 8.2 Python Development

```bash
# Run Python file
python script.py

# Run module
python -m pytest

# Install package
pip install flask

# Run with environment variable
DEBUG=true python app.py   # Linux/macOS
$env:DEBUG="true"; python app.py  # Windows PowerShell
```

### 8.3 Git Shortcuts

```bash
# Quick commit
git add . && git commit -m "Quick save"

# View recent changes
git log --oneline -5

# Check what's changed
git status && git diff
```

---

## Part 9: Exercises

### Exercise 1: Navigation

Starting from home directory:
1. Navigate to project: `cd Documents/se-path-v2`
2. List all files including hidden
3. Navigate to tutorials folder
4. Go back up one level
5. Return to home

<details>
<summary>Solution (Windows PowerShell)</summary>

```powershell
cd ~
cd Documents\se-path-v2
dir -Force
cd tutorials
cd ..
cd ~
```

</details>

---

### Exercise 2: File Operations

1. Create folder `sandbox` in project
2. Navigate into it
3. Create file `test.txt` with "Hello"
4. View contents
5. Copy to `test_backup.txt`
6. Delete both files
7. Navigate out and delete `sandbox`

<details>
<summary>Solution (Windows PowerShell)</summary>

```powershell
cd c:\Users\g4m3r\Documents\se-path-v2
mkdir sandbox
cd sandbox
"Hello" | Out-File test.txt
type test.txt
copy test.txt test_backup.txt
rm test.txt
rm test_backup.txt
cd ..
rm sandbox
```

</details>

---

### Exercise 3: Search and Count

1. Find all `.md` files in tutorials folder
2. Count how many there are
3. Search for the word "Introduction" in all markdown files

<details>
<summary>Solution (Windows PowerShell)</summary>

```powershell
cd c:\Users\g4m3r\Documents\se-path-v2\tutorials
dir -Recurse -Filter "*.md"
(dir -Recurse -Filter "*.md").Count
Select-String -Path (dir -Recurse -Filter "*.md").FullName -Pattern "Introduction"
```

</details>

---

## Summary

### Essential Commands

| Task | Windows PowerShell | macOS/Linux |
|------|-------------------|-------------|
| Where am I | `cd` | `pwd` |
| List files | `dir` | `ls -la` |
| Change directory | `cd path` | `cd path` |
| Create file | `ni file.txt` | `touch file.txt` |
| View file | `type file.txt` | `cat file.txt` |
| Search in files | `sls "pattern" *.txt` | `grep "pattern" *.txt` |

### Terminal Fluency Checklist

- [ ] Can navigate directories
- [ ] Can create/view/delete files
- [ ] Can search for files
- [ ] Can search within files
- [ ] Know piping basics

---

## Phase 02 Complete!

You now have a fully configured development environment:
- ✅ Python 3.11+ installed
- ✅ Virtual environment created
- ✅ VS Code configured
- ✅ Git initialized
- ✅ Terminal basics mastered

**Next:** [Phase 03: Project Structure →](../03-project-structure/README.md)

In Phase 03, you'll create the PartFlow project skeleton following clean architecture principles.
