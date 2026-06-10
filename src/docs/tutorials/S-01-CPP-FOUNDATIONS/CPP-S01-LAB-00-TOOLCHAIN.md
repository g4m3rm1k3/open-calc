# C++ Masterclass — S-01 — LAB 00 — The Toolchain: From Text to Running Program

**Prerequisites:** None. This is the first lab in the series.

**What this lab adds:**
- A working C++ compiler installed on your machine
- Your first program: one line of text printed to the terminal
- A `Makefile` so you never type the full compile command again
- A precise mental model of what happens between writing code and running it

**Time:** ~60 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. When you write a story in Notepad and save it as `story.txt`, the file contains
>    English words. When you write C++ code and save it as `main.cpp`, the file also
>    contains text. So what is the difference between a text file and a program?
> 2. If you rename `main.cpp` to `main.txt`, can you still compile it with
>    `g++ main.txt -o dungeon`? What do you predict will happen?
> 3. A `.exe` file on Windows can be double-clicked to run. A `.cpp` file cannot.
>    Why not?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

When this lab is complete, typing `.\dungeon` in your terminal produces exactly this:

```
Hello, Dungeon! The adventure begins.
```

One line. But to reach it, you will understand every step between the words you type
and the output that appears — a chain of tools that transforms human-readable text into
instructions the CPU can execute.

---

## Part 1 — The Problem: Computers Don't Read English

Before any concept, here is the core problem this entire lab solves.

A CPU (Central Processing Unit — the chip that executes instructions in your computer)
does not understand English, C++, or any human language. It understands one thing:
**machine code** — sequences of numbers (specifically binary: 0s and 1s) that correspond
to specific operations like "add these two numbers" or "store this value in memory."

You cannot write machine code by hand. The numbers are different for every CPU family,
there are thousands of them, and a single program might require millions of them.

The solution is a **toolchain**: a set of programs that take code written in a
human-readable language (C++) and automatically translate it into machine code.

The three tools in the C++ toolchain are:

| Tool | Input | Output | Job |
|------|-------|--------|-----|
| **Preprocessor** | `.cpp` file | Expanded `.cpp` | Handles `#include` and `#define` — pastes files together |
| **Compiler** | Expanded `.cpp` | `.obj` file | Translates C++ into machine code |
| **Linker** | One or more `.obj` files | `.exe` file | Combines object files into one runnable program |

When you run `g++`, it runs all three in sequence automatically. You never call them
separately unless you have a specific reason to.

---

## Part 2 — Installing the Toolchain

### Concept: w64devkit — A Self-Contained C++ Toolchain for Windows

**What it is:** A single ZIP file containing `g++` (the compiler), `make` (the build
automation tool), and everything they depend on. No installer. No admin rights required.
Unzip it, tell Windows where to find it, and you have a working C++ toolchain.

**The problem before:** The official Windows C++ toolchain is Visual Studio — a
multi-gigabyte IDE. To get just the compiler, you need to install the IDE and locate
the compiler buried inside it. An alternative, MSYS2, requires a package manager and
multiple install steps. w64devkit is one ZIP.

**The solution:** Download once, extract once, add one entry to PATH.

**What PATH is:** PATH is an environment variable — a named list of folder paths —
that Windows checks whenever you type a command in the terminal. When you type `g++`,
Windows looks through every folder in PATH until it finds a program called `g++.exe`.
If it does not find one, you see: `'g++' is not recognized as an internal or external command`.
Adding `C:\w64devkit\bin` to PATH tells Windows to look there.

**Watch for:** PATH changes do not apply to terminals that are already open. After
editing PATH, always open a **new** terminal window to test.

### Installation Steps

1. Go to `https://github.com/skeeto/w64devkit/releases`
2. Download the file named `w64devkit-x86_64-VERSION.zip` (latest version)
3. Extract the ZIP to `C:\w64devkit\`
4. Add to PATH:
   - Press `Win + R`, type `sysdm.cpl`, press Enter
   - Click **Advanced** → **Environment Variables**
   - Under **System variables**, find `Path`, click **Edit**
   - Click **New**, type `C:\w64devkit\bin`, click OK through all dialogs
5. Open a **new** terminal (PowerShell or Windows Terminal)

### SAVE AND TRY

In the new terminal, type:

```
g++ --version
```

**You should see:** A line starting with `g++ (GCC)` followed by a version number
(13.x or 14.x). The exact version does not matter.

**Also type:**

```
make --version
```

**You should see:** A line starting with `GNU Make` followed by a version number.

**Change something:** Type `g++ --help` and press Enter. You will see a list of
every flag `g++` accepts. This is the reference you can always come back to.
Press `q` or `Ctrl+C` if it fills more than one screen.

---

## Part 3 — The Project Folder

### Concept: Working Directory — where your files live

**What it is:** Every terminal session has a "working directory" — the folder it
currently sees as its location. When you type `g++ main.cpp`, the compiler looks for
`main.cpp` in the working directory.

**Why it matters here:** All files for this lab must be in the same folder, and your
terminal must be pointed at that folder. If they are not, `g++` will report that
`main.cpp` does not exist even if it does — just in a different folder.

**How to navigate:** Use `cd` (change directory) to move:
```
cd C:\Users\YourName\Desktop\cadcam\masterclass\S-01-CPP-FOUNDATIONS
```

Or, in Windows Explorer: navigate to the folder, then Shift+right-click and choose
**"Open PowerShell window here"** or **"Open in Terminal"**.

### Step 1 — Create the project folder

In Windows Explorer, navigate to:
```
C:\Users\g4m3r\Desktop\cadcam\masterclass\S-01-CPP-FOUNDATIONS\
```

This folder already exists. Open a terminal pointed at it.

---

## Part 4 — Your First Program

We will build the program in three steps. Each step compiles and runs.

### Concept: `int main()` — The Entry Point

**What it is:** Every C++ program has exactly one function named `main`. When the
operating system runs your program, it calls `main` first. Execution starts at the
opening `{` of `main` and ends at the closing `}` (or at a `return` statement).

**Why `int`:** The `int` before `main` means the function returns an integer.
`return 0;` at the end sends the value `0` back to the operating system. By convention,
`0` means "the program finished successfully." Any non-zero value means "something went
wrong." This is how programs report errors to the scripts and systems that run them.

**The problem before (no entry point):** Machine code has no concept of "start here."
The entry point is the convention that bridges C++ to the operating system's program
loader — without it, the OS would not know which instruction to execute first.

**Canonical example:**
Think of `main` as the front door of a building. You do not enter a building through
a random wall — there is one official entrance. The OS uses `main` as the one official
entrance to your program. Everything inside happens after stepping through that door.

```cpp
int main() {
    return 0;   // ← "I finished without errors" — 0 is the success code by convention
}
```

**What it hides:** The OS program loader, which sets up your program's memory, loads
libraries, and calls `main`. Without the `main` convention, you would have to manually
write OS-specific startup code for every platform.

**The protected invariant:** There is exactly one `main`. C++ will not compile a program
with two `main` functions — it would be ambiguous where to start.

**Watch for:** `void main()` appears in old tutorials. This is technically invalid C++
(though some compilers accept it). Always write `int main()`.

### Step 1 — The Minimal Program

Create a new file called `main.cpp` in the S-01-CPP-FOUNDATIONS folder.
Type this exactly — do not copy-paste yet. Typing forces you to read every character:

```cpp
int main() {        // ← the one required function — the OS calls this to start your program
    return 0;       // ← send "success" (0) back to the operating system
}
```

This is a complete, valid C++ program. It does nothing visible — but it compiles.

### SAVE AND TRY

Save `main.cpp`. In your terminal (pointed at S-01-CPP-FOUNDATIONS), type:

```
g++ main.cpp -o dungeon -std=c++17 -Wall -Wextra
```

Breaking down each part of this command:

| Part | Meaning |
|------|---------|
| `g++` | The compiler program |
| `main.cpp` | The source file to compile |
| `-o dungeon` | Name the output `dungeon` (creates `dungeon.exe` on Windows) |
| `-std=c++17` | Use the C++17 standard — required for features in later series |
| `-Wall` | Enable all common warnings — the compiler tells you about likely mistakes |
| `-Wextra` | Enable extra warnings — even more feedback |

**You should see:** No output at all. Silence means success. An `.exe` file named
`dungeon.exe` now exists in your folder.

Then run the program:

```
.\dungeon
```

**You should see:** Nothing. The program starts, returns 0, and exits. There is
no output because we have not told it to produce any.

**Change something:** Change `return 0;` to `return 1;`. Recompile. Run.
The program still produces no visible output — but it now tells the OS it "failed."
In PowerShell, type `echo $LASTEXITCODE` after running — you will see `1` instead of `0`.
Change it back to `return 0`.

---

### Concept: `#include` — Adding Code from Other Files

**What it is:** `#include <filename>` is a preprocessor directive. The preprocessor
(the first of the three toolchain stages) runs before the compiler and literally
copy-pastes the contents of `filename` into your source file at the point where
`#include` appears.

**Why this is needed:** The C++ language itself has no built-in way to print text
to the terminal. That capability lives in the **standard library** — a collection of
pre-written code that ships with your compiler. To use it, you must tell the
preprocessor to paste its declarations into your file.

**`<iostream>` specifically:** The standard library file that provides:
- `std::cout` — for output to the terminal
- `std::cin` — for reading keyboard input
- `std::endl` — for ending a line of output

**Angle brackets `<>` vs quotes `""`:**
- `#include <iostream>` — angle brackets tell the preprocessor to search the compiler's
  own library folders. Use for standard library headers.
- `#include "myfile.h"` — quotes tell the preprocessor to search the current folder
  first. Use for your own headers.

**What it hides:** The location of standard library files on disk. On Windows with
w64devkit, they might be in `C:\w64devkit\lib\gcc\...`. You do not need to know this
path. `<iostream>` is a name the compiler knows.

**Watch for:** Forgetting `#include` for a feature you use. The error message will say
`error: 'cout' was not declared in this scope`. That almost always means a missing `#include`.

### Step 2 — Add the Include

Add one line to `main.cpp`. The `// ← add this line` marker shows exactly what is new:

```cpp
#include <iostream>     // ← add this line: pastes the iostream header into this file

int main() {
    return 0;
}
```

### SAVE AND TRY

Recompile: `g++ main.cpp -o dungeon -std=c++17 -Wall -Wextra`

**You should see:** No errors. The program still prints nothing — but now the
iostream library is available to use.

---

### Concept: `std::cout` and `<<` — Printing to the Terminal

**What it is:** `std::cout` (character output) is a **stream** — an abstraction that
represents a sequence of characters flowing to a destination. For `std::cout`, the
destination is the terminal. The `<<` operator (called the **stream insertion operator**)
sends a value into the stream.

**What it hides:** System calls. Printing text to a terminal requires calling the
operating system — on Linux it is `write()`, on Windows it is `WriteFile()`. These
functions take raw memory addresses and byte counts, not C++ strings. `std::cout`
hides all of that behind a single operator.

**The protected invariant:** Text sent to `std::cout` always appears in the order it
was sent. You never worry about ordering, buffering strategy, or which OS function to
call.

**`std::` — the namespace prefix:** Everything in the standard library lives inside
a **namespace** named `std` (short for "standard"). A namespace is a named scope that
prevents name collisions — if you create your own variable called `cout`, it will not
conflict with `std::cout` because they are in different namespaces. Writing `std::cout`
says "the `cout` that lives in the `std` namespace."

Many tutorials use `using namespace std;` to avoid typing `std::` every time. This
course does not. Seeing `std::` in every line makes it unambiguous where each name
comes from, which matters when you read other people's code.

**`std::endl` vs `"\n"`:** Both end the current line. The difference:
- `std::endl` outputs a newline character AND **flushes the buffer** (forces the output
  to appear immediately)
- `"\n"` outputs only a newline (output may be held in a buffer briefly)

For interactive programs, `std::endl` is safer — you see output immediately. For
high-performance programs writing thousands of lines, `"\n"` is faster.

**Canonical example:**
Think of `std::cout` as a postal drop-box. You insert (`<<`) letters (values) into it.
The postal service (the OS) handles delivery. You do not address the envelope or
drive to the post office yourself.

```cpp
std::cout << "First"  << " Second" << std::endl;
//        ↑ insert     ↑ chain        ↑ end the line
// Output: First Second
```

**Watch for:** Forgetting `<<` between items. `std::cout "Hello"` is a syntax error.
Always use `<<` to push each piece into the stream.

### Step 3 — Print Something

Add the output line. Only the middle line is new:

```cpp
#include <iostream>

int main() {
    std::cout << "Hello, Dungeon! The adventure begins." << std::endl;   // ← add this line
    return 0;
}
```

### SAVE AND TRY

Recompile and run:

```
g++ main.cpp -o dungeon -std=c++17 -Wall -Wextra
.\dungeon
```

**You should see:**

```
Hello, Dungeon! The adventure begins.
```

**Change something:** Change the message to your own text. Recompile. Run.
The new text appears. Change it back to `"Hello, Dungeon! The adventure begins."`.

**Cause an error deliberately:** Remove the `"` at the start of the string.
Recompile. Read the error message:

```
main.cpp:4:17: error: 'Hello' was not declared in this scope
```

The compiler tried to read `Hello` as a variable name, not text. Add the `"` back.

---

## Part 5 — The Makefile

### Concept: `make` and `Makefile` — Automating the Build

**What it is:** Typing `g++ main.cpp -o dungeon -std=c++17 -Wall -Wextra` every time
you change a line is error-prone. `make` is a program that reads a `Makefile` — a
file that defines build rules — and runs the correct commands automatically. It also
tracks which files have changed and skips recompiling files that are already up to date.

**What it hides:** Which files need recompiling. In a project with 30 source files,
`make` only recompiles the files that changed since the last build — saving minutes of
compile time on every iteration.

**The protected invariant:** You never run the wrong compile command. The `Makefile`
is the single source of truth for how the project is built.

**Syntax — one rule:**
```makefile
target: dependency1 dependency2
	recipe command
```
- `target` — the file to build
- `dependencies` — files this target depends on (rebuild if any dependency changed)
- `recipe` — the command to run (must be indented with a **tab**, not spaces)

**Watch for:** The indentation before the recipe **must** be a real tab character (`\t`),
not spaces. This is one of `make`'s historical quirks. If you see the error
`missing separator`, you have spaces where a tab is required.

### Step 4 — Create the Makefile

Create a new file called `Makefile` (no extension) in the same folder as `main.cpp`.
Type it out — the tab character on the recipe line is critical:

```makefile
# Makefile for S-01 C++ Foundations
# Run 'make' to compile. Run 'make clean' to remove the executable.

# ── Compiler settings ─────────────────────────────────────────────────────────
CXX      = g++
# -std=c++17  : Use C++17 — required for features in S-02 through S-13
# -Wall       : Warn about common mistakes
# -Wextra     : Warn about additional edge cases
# -g          : Include debug information (makes error messages show line numbers)
CXXFLAGS = -std=c++17 -Wall -Wextra -g

# ── Build rule ────────────────────────────────────────────────────────────────
# 'dungeon' is the target. 'main.cpp' is the dependency.
# If main.cpp is newer than dungeon.exe, the recipe runs.
dungeon: main.cpp
	$(CXX) $(CXXFLAGS) main.cpp -o dungeon

# ── Clean rule ────────────────────────────────────────────────────────────────
# 'make clean' deletes the compiled executable.
# The '-' before del tells make to ignore errors (e.g., if dungeon.exe doesn't exist).
clean:
	-del dungeon.exe
```

### SAVE AND TRY

In the terminal:

```
make
```

**You should see:**

```
g++ -std=c++17 -Wall -Wextra -g main.cpp -o dungeon
```

Then:

```
.\dungeon
```

**You should see:**

```
Hello, Dungeon! The adventure begins.
```

**Run `make` a second time without changing anything:**

```
make
```

**You should see:**

```
make: 'dungeon' is up to date.
```

`make` checked the timestamps: `dungeon.exe` is newer than `main.cpp`. No work to do.

**Change something:** Edit `main.cpp` — add any second `std::cout` line. Save. Run `make`.
You will see the compile command run again because `main.cpp` is now newer than the
old `dungeon.exe`. Run `.\dungeon` to see both lines.

---

## 🎯 Challenge: Read a Compiler Error

**You know:** How to compile with `g++` and read the output.

**Task:** Introduce each of these three errors into `main.cpp` one at a time.
For each one: compile, read the **full error message**, identify the file and line
number it points to, understand what it is saying, then fix it before moving to the next.

1. Remove the semicolon at the end of the `std::cout` line
2. Change `int main()` to `main()` (remove the `int`)
3. Add a second `int main()` function below the first (duplicate the whole function)

**Hint:** Error messages have this format: `filename:line:column: error: description`.
The line number is your first clue. Read only the **first** error — later errors are
often cascading effects of the first.

---

<details>
<summary>▶ Show what you should see (expand after attempting)</summary>

**Error 1 — Missing semicolon:**
```
main.cpp:4:5: error: expected ';' before 'return'
```
The compiler expected the statement to end with `;`. It found `return` instead.
Fix: Add `;` at the end of the `std::cout` line.

**Error 2 — Missing return type:**
```
main.cpp:3:1: error: ISO C++ forbids declaration of 'main' with no type
```
Every function must have a declared return type. `main` must return `int`.
Fix: Restore `int main()`.

**Error 3 — Duplicate `main`:**
```
main.cpp:8:5: error: redefinition of 'int main()'
```
There can only be one entry point. The linker would not know which to use.
Fix: Delete the duplicate.

**Key insight:** C++ error messages always tell you file, line, and column.
The first error in the list is almost always the root cause. Fix it first, then
recompile before addressing the rest — many "errors" disappear once the real one is fixed.

</details>

---

## Final Check

| Feature | How to Verify |
|---------|--------------|
| `g++` installed | `g++ --version` prints a version number |
| `make` installed | `make --version` prints a version number |
| `main.cpp` compiles | `make` runs without errors |
| Program runs | `.\dungeon` prints "Hello, Dungeon! The adventure begins." |
| Makefile saves typing | `make` recompiles when `main.cpp` changes; skips when unchanged |
| Clean works | `make clean` removes `dungeon.exe`; `make` recreates it |

---

## Quick Check Answers

**1. What is the difference between a text file and a program?**
Both are files containing text. The difference is interpretation. A `.txt` file is
read by humans or text editors. A `.cpp` file is read by a compiler, which translates
it into machine code — binary instructions the CPU executes directly. A `.exe` file
contains that machine code. The text you write in `main.cpp` is not what runs;
the machine code the compiler generates from it is what runs.

**2. If you rename `main.cpp` to `main.txt`, can you still compile it?**
Yes — the compiler does not care about the file extension. `g++ main.txt -o dungeon`
works. The extension is a convention for humans and editors (so they know to apply
C++ syntax highlighting), not a requirement for the compiler. The `-std=c++17` flag
tells `g++` to treat the input as C++17 regardless of what the file is named.

**3. Why can't you double-click a `.cpp` file to run it?**
A `.cpp` file contains C++ source code — text. Double-clicking it tells Windows
to open it in a text editor (like Notepad), not execute it, because Windows does not
associate `.cpp` with an executable action. To run it, you must compile it into a
`.exe` first. The `.exe` contains machine code that the CPU can execute directly.
Windows associates `.exe` with "run this," which is why double-clicking it works.
