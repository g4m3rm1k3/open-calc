# Lesson 0: Nothing Runs Until Something Translates It
### (LAB 00 — The C++ Toolchain)

**What you will build:** A working C++ toolchain on your machine, and one real program — `dungeon.exe` — that prints a single line of text when you run it. The transferable problem this lesson is actually about is bigger than one program, though: every piece of software you will ever run started as text a human typed, and something had to turn that text into instructions a CPU can execute. This lesson is about that translation step — what tools perform it, what each one actually does, and how to automate running them so you stop typing the same command by hand.

**What you need to know first:** Nothing. This is the first lesson in the curriculum.

**Terms introduced in this lesson**

> **CPU (Central Processing Unit)** — the chip in a computer that executes instructions; understands only machine code, never source text.
> **Machine code** — binary instructions a specific CPU family can execute directly.
> **Toolchain** — the set of programs (preprocessor, compiler, linker) that turn human-written source code into machine code.
> **Preprocessor** — the toolchain stage that runs before compilation, performing text substitutions like `#include`.
> **Compiler** — the toolchain stage that translates preprocessed source text into machine code.
> **Linker** — the toolchain stage that combines one or more compiled object files into one runnable program.
> **PATH** — an environment variable holding a list of folder paths; the operating system searches it, in order, to find the program behind a typed command name.
> **Environment variable** — a named value the operating system stores and makes available to every program that runs.
> **Working directory** — the folder a running terminal session currently treats as its location; relative file names (like `main.cpp`) resolve against it.
> **Entry point** — the one function an operating system calls first when it runs a compiled program; in C++, this is `main`.
> **Preprocessor directive** — a line starting with `#`, processed by the preprocessor before compilation; `#include` is one.
> **Header file** — a file (conventionally `.h`) containing declarations meant to be pasted into other files via `#include`.
> **Standard library** — the collection of pre-written, pre-compiled code that ships with a C++ compiler and is available to every C++ program.
> **Namespace** — a named scope that groups identifiers to prevent naming collisions between unrelated pieces of code.
> **Stream** — an abstraction representing a sequence of characters flowing to or from a destination (a terminal, a file, memory).
> **Stream insertion operator (`<<`)** — the operator that sends a value into an output stream.
> **Buffering** — temporarily holding output in memory before actually sending it to its destination, for efficiency.
> **Flush** — forcing buffered output to be sent to its destination immediately, rather than waiting.
> **Makefile** — a file of build rules that the `make` program reads to decide what to compile and when.
> **Target, dependency, recipe** — the three parts of a `make` rule: the file to produce, the files it depends on, and the command that produces it.
> **Exit code** — the integer a program returns to the operating system when it finishes; `0` conventionally means success.

No pipeline diagram applies yet — this is the first lesson, and no multi-stage project pipeline has been established. This lesson's own three-stage pipeline (source text → preprocessor → compiler → linker → executable) is introduced below, in Concept Unit 1.

---

## Concept Unit 1: The Toolchain — Why Text Needs Translation

### The Problem

A CPU does not understand English, C++, or any language people read. It understands exactly one thing: **machine code** — sequences of binary numbers, each corresponding to one operation the specific CPU family knows how to perform, like "add these two numbers" or "store this value at this address." When you type `int main() { return 0; }` and save it as `main.cpp`, that file contains text — readable by you, meaningless to the CPU. Nobody writes machine code by hand: the exact numbers differ between CPU families, there are thousands of distinct instructions, and a trivial program already needs many of them. Something has to sit between the text you write and the numbers the CPU executes.

### No isolated code lab for this step

This concept has no code of its own to isolate — it is the reason code needs translating at all, not a language construct. The three-stage pipeline below is demonstrated for real starting in Concept Unit 4, once there is a file to run it on.

### Explanation

That "something" is a **toolchain**: a set of programs that automatically translate human-readable C++ into machine code. For C++, it is three stages, each with its own job:

| Stage | Input | Output | Job |
|---|---|---|---|
| **Preprocessor** | `.cpp` file | Expanded `.cpp` text | Performs `#include` and `#define` — text substitution, before anything is understood as C++ |
| **Compiler** | Expanded `.cpp` text | `.o` (object file) | Translates C++ into machine code for one file at a time |
| **Linker** | One or more `.o` files | `.exe` | Combines object files into one runnable program |

When you run the single command `g++ main.cpp -o dungeon`, it silently runs all three stages in sequence. This lesson runs them as one command throughout — a later lab (CPP-S02-LAB-01, Header Files and Compilation) is where compiling and linking are deliberately split into separate commands, because that split is the whole point of that lesson.

### CS Lens

This is a **compilation pipeline** — a sequence of independent transformation stages, each consuming the previous stage's output format and producing the next stage's input format, with no stage needing to know how any other stage does its job. The preprocessor doesn't know what a machine instruction is; the linker doesn't know what `#include` means. Also recognized in: image processing pipelines (raw → decoded → filtered → encoded), HTTP request handling (parse → route → handle → serialize), shader compilation in graphics programming, and every interpreted language's own internal pipeline (source → tokens → AST → bytecode).

### SE Lens

Splitting translation into independent stages, each with one job, is why a C++ project with a hundred `.cpp` files doesn't need to recompile all hundred of them every time one line changes — only the compiler stage has to re-run for the changed file; the linker just re-stitches the object files. The alternative — one monolithic tool that reads source text and produces a runnable program in one opaque step — would be simpler to describe but would force a full rebuild on every change, and would give you no way to compile files written for different platforms and link them together (which the preprocessor/compiler/linker split makes possible, because object files are the common format every stage after the compiler agrees on). The cost of the split: three distinct failure points instead of one, each with its own category of error message — you will learn to tell a preprocessor error, a compiler error, and a linker error apart, starting in Concept Unit 7.

### Connection

This three-stage model is what every command in the rest of this lesson is actually doing, whether it's shown as one `g++` call or, in `CPP-S02-LAB-01`, as three.

---

## Concept Unit 2: Installing the Toolchain (w64devkit and PATH)

### The Problem

Windows does not ship a C++ compiler. The two common ways to get one — installing Visual Studio (a multi-gigabyte IDE, with the compiler buried inside it) or installing MSYS2 (a package manager requiring several setup steps) — are both more than a first lesson should demand before writing a single line of code. `w64devkit` is a single ZIP file containing a working `g++` and `make`, with nothing to install.

### Project Change

- **Reference Source:** No reference counterpart — this is a from-scratch tooling setup, not ported from any reference application.
- **Files affected:** None yet. This step configures the operating system's PATH, a system-level setting, not a project file.
- **Change type:** Configure (system PATH).
- **Location:** Windows Environment Variables dialog, `System variables` → `Path`.
- **Dependencies:** None.

### No isolated code lab for this step

Installing a toolchain has no code to isolate — there is no throwaway-versus-production distinction for a ZIP extraction and a PATH edit. The commands in the **Commands** step below are this concept's own demonstration, run directly, not first in a disposable form and then again for real.

### Mechanical Walkthrough

Not applicable — this unit produces no code.

### CS Lens

**PATH** is a **search path** — an ordered list the operating system checks, in order, stopping at the first match. This is the same idea as a compiler's `#include` search path (Concept Unit 5) and a shell's command lookup: an ordered list of places to look, checked front to back, first hit wins.

### SE Lens

A single self-contained ZIP with no installer is a **reproducibility** choice: any two machines that extract the same ZIP to the same path have an identical toolchain, byte for byte — no installer state, no registry entries, no "works on my machine" drift caused by two different installers making two different choices. The tradeoff: you are responsible for the one PATH edit an installer would otherwise do for you, and for keeping track of where you extracted it.

### Commands

1. Open `https://github.com/skeeto/w64devkit/releases` in a browser and download the file named `w64devkit-x86_64-VERSION.zip` (the latest version).
2. Extract the ZIP to `C:\w64devkit\`.
3. Add `C:\w64devkit\bin` to PATH:
   - Press `Win + R`, type `sysdm.cpl`, press Enter.
   - Click **Advanced** → **Environment Variables**.
   - Under **System variables**, select `Path`, click **Edit**.
   - Click **New**, type `C:\w64devkit\bin`, click OK through every open dialog.
4. Open a **new** terminal window. PATH changes only take effect in terminals opened after the change — a terminal that was already open when you edited PATH keeps its old copy of the variable for its entire lifetime, because the operating system only reads PATH into a process once, when that process starts.

```
g++ --version
```

`g++` is the compiler program itself — its name is what your terminal looks up in PATH, per Concept Unit 2's CS Lens. `--version` is a flag telling `g++` to print its own version and exit immediately, instead of trying to compile anything.

```
make --version
```

`make` is the build-automation program used starting in Concept Unit 9.

### Run It

This project's own toolchain (verified this session, not the version a student's fresh install will show) reports:

```
$ g++ --version
g++.exe (MinGW-W64 x86_64-ucrt-posix-seh, built by Brecht Sanders, r3) 14.2.0
```

A student's own install will print a different build string and version number — that's expected; any `g++ (GCC) 13.x` or newer works for this series.

### Connection

Everything from here on assumes `g++` (and later `make`) can be typed from any folder, because PATH now points at it.

---

## Concept Unit 3: The Working Directory

### The Problem

`g++ main.cpp` tells the compiler to look for a file literally named `main.cpp`. It does not search your whole disk for it — it looks in exactly one place: the terminal's **working directory**. If your terminal is pointed at a different folder than the one holding `main.cpp`, `g++` reports the file doesn't exist, even though it does — just not where the terminal is currently looking.

### No isolated code lab for this step

This is a tooling/shell concept, not a language construct — there is no C++ code to isolate. The `cd` command itself, run below, is the demonstration.

### Mechanical Walkthrough

Not applicable — no code in this unit.

### CS Lens

Every running process has an associated working directory — this is an operating-system concept, not something C++ or `g++` invented. It's the same reason a relative path like `./photo.jpg` in any program on any OS depends on where that program was launched from.

### SE Lens

Resolving `main.cpp` relative to the working directory, rather than requiring a full path every time, is what makes `g++ main.cpp` typeable at all — the tradeoff is exactly the confusion this Concept Unit exists to prevent: a command that looks identical succeeds or fails depending on invisible state (which folder the terminal happens to be in) that isn't visible in the command itself.

### Commands

```
cd C:\Users\YourName\Desktop\cadcam\masterclass\S-01-CPP-FOUNDATIONS
```

`cd` (change directory) is a shell built-in command that changes the calling terminal's working directory to the path given as its argument. It affects only the current terminal session — not other open terminals, not the operating system as a whole.

Alternative, without typing a path: in Windows Explorer, navigate to the folder, then Shift+right-click and choose **"Open PowerShell window here"** or **"Open in Terminal"** — this opens a new terminal with its working directory already set to that folder, doing the same thing `cd` does, just triggered from the file browser instead of typed.

### Run It

There is no visible output from `cd` on success — the terminal prompt itself (which on most configurations shows the current path) is the only feedback. This is deferred to Concept Unit 4's Run It, once there's a `main.cpp` in that folder to compile.

### Connection

Every `g++` and `make` command for the rest of this lab assumes the terminal's working directory is the project folder created here.

---

## Concept Unit 4: `int main()` — The Entry Point

### The Problem

Machine code has no built-in notion of "start here." A compiled program is just a block of instructions in memory — the operating system's program loader needs to know exactly which instruction to run first. C++ solves this with a convention: every program has exactly one function named `main`, and the operating system calls it first, always.

### Project Change

- **Reference Source:** No reference counterpart — foundational language syntax, not ported from a reference application.
- **Files affected:** `main.cpp` — created.
- **Change type:** Add (new file).
- **Location:** Project root (the working directory set up in Concept Unit 3).
- **Dependencies:** None.

### The New Code

```cpp
int main() {
    return 0;
}
```

### The Updated Project

This is a brand-new file — the code above is the entire file, with nothing surrounding it yet. There is no larger enclosing structure to return to.

### Concept Lab

This two-line program *is* the smallest possible C++ program — there is no smaller disposable host to invent that would demonstrate `main` without being `main`. This is the one case in this lesson where the "isolated throwaway" and "the real project" are the same two lines, because `main` cannot be shown any other way. Nothing here is later deleted; it is the permanent starting point of every C++ program in this curriculum.

Run it:

```
$ g++ main.cpp -o dungeon -std=c++17 -Wall -Wextra
$ ./dungeon.exe
$ echo $LASTEXITCODE
0
```

The compile step produced no output at all (verified this session) — silence from `g++` means success. Running `./dungeon.exe` also produced no output — the program does nothing visible yet, because nothing inside `main` asks for visible output. What the empty output *proves*: a C++ program does not need to print anything to compile and run successfully; `main` only needs to exist and return. This is called the **entry point**.

### Mechanical Walkthrough

Enumerating every syntactic element in order:

- `int` — **(a) first appearance.** A type name, declaring that this function returns a whole number. Fundamental types are given full treatment in LAB-01; here, only its role in this specific line matters: `main`'s return type must be `int`, by convention (see CS Lens below), because the operating system expects an integer status code back.
- `main` — **(a) first appearance.** The function's name. Not an arbitrary choice — the operating system's program loader specifically looks for a function named exactly `main` to call first; naming a function anything else means the OS has no function to call, and the linker reports an error (`undefined reference to WinMain` or similar, depending on platform).
- `()` — **(a) first appearance.** An empty parameter list — this `main` accepts no arguments. (A version accepting command-line arguments, `int main(int argc, char* argv[])`, exists but isn't needed yet — introduced only when a later lesson actually reads command-line input.)
- `{` ... `}` — **(a) first appearance.** A **block** — delimits the function's body. Execution begins at the opening `{` and proceeds statement by statement until the closing `}` or a `return`.
- `return 0;` — **(a) first appearance.** `return` sends a value back to whatever called this function and immediately ends the function's execution. `0` is that value. By convention — not a language rule, a convention every operating system agrees on — `0` means "finished without error." Any other value means "something went wrong," and shell scripts and other programs that launch this one can check that value to decide what to do next.
- `;` — **(a) first appearance.** Terminates a statement. C++ uses `;` to mark the end of each instruction, because (unlike some languages) it does not treat line breaks as statement boundaries — a single statement can span multiple lines, and multiple statements can share one line, so the compiler needs an explicit marker.

### CS Lens

`main` as a single, mandatory, universally-agreed entry point is the C++ instance of a general idea: every runnable program, in every language, needs exactly one place execution provably starts, so the loader never has to guess. Also recognized in: Python's `if __name__ == "__main__":` block, Java's `public static void main(String[] args)`, a `.exe`'s PE header pointing at a specific first instruction, and a CNC controller's G-code program starting at its first block after `%`.

### SE Lens

Requiring exactly one `main`, at compile time, is a **protected invariant** — the compiler physically refuses to build a program with two `main` functions (verified in Concept Unit 8's Challenge), because two entry points would leave the loader with no way to choose which one to run. The alternative — allowing multiple and picking one by some rule (first found, alphabetically first, whatever) — would make a program's actual starting behavior depend on file order or naming, silently, which is exactly the kind of ambiguity a convention like "exactly one `main`" exists to rule out by construction rather than by discipline.

### Commands

```
g++ main.cpp -o dungeon -std=c++17 -Wall -Wextra
```

| Part | Meaning |
|---|---|
| `g++` | Invokes the compiler program (found via PATH, Concept Unit 2). |
| `main.cpp` | The source file to compile — resolved relative to the working directory (Concept Unit 3). |
| `-o dungeon` | Names the output file `dungeon` — on Windows, `g++` appends `.exe` automatically, producing `dungeon.exe`. |
| `-std=c++17` | Selects the C++17 language standard. Without it, `g++` defaults to whatever standard version it ships with, which can silently differ between machines and compiler versions — later labs in this series use C++17-specific features, so this flag is pinned from lesson one. |
| `-Wall` | Enables a broad set of compiler warnings for common mistakes that are legal C++ but usually bugs. |
| `-Wextra` | Enables additional warnings beyond `-Wall`. |

### Run It

```
$ g++ main.cpp -o dungeon -std=c++17 -Wall -Wextra
$ ./dungeon.exe
$ echo $LASTEXITCODE
0
```

Verified this session: the compile produced no output (success), the run produced no output, and the exit code was `0`. Changing `return 0;` to `return 1;` and rebuilding (also verified this session) changes only the exit code, to `1` — the program's visible behavior is identical; only the OS-facing status differs. In PowerShell, `echo $LASTEXITCODE` after running reads that value.

### Connection

Every concept unit after this one adds to the body of this same `main` function — nothing about the entry point itself changes again in this lesson.

---

## Concept Unit 5: `#include` — The Preprocessor Directive

### The Problem

C++ itself has no built-in way to print text to a terminal — that ability lives in the **standard library**, code that ships with the compiler but is not automatically part of every file. `main` above compiles with nothing printed because nothing has told the preprocessor to bring that capability in yet.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `main.cpp` — modified.
- **Change type:** Add (one line).
- **Location:** First line of `main.cpp`, before `int main()`.
- **Dependencies:** None (`<iostream>` ships with the compiler).

### The New Code

```cpp
#include <iostream>
```

### The Updated Project

```cpp
#include <iostream>     // ← new

int main() {
    return 0;
}
```

`main` itself is unchanged; the file now has one line above it.

### Concept Lab

A minimal, disposable demonstration of what `#include` actually does — text substitution, nothing more — using a throwaway header unrelated to this project:

```cpp
// scratch_greeting.h  (disposable — never part of this project)
const char* GREETING = "borrowed text";
```

```cpp
// scratch_main.cpp  (disposable)
#include "scratch_greeting.h"
#include <iostream>

int main() {
    std::cout << GREETING << std::endl;
}
```

Run it: compiling and running this prints `borrowed text` — a value that was never typed inside `scratch_main.cpp` itself, only pulled in by `#include`. What that proves: `#include` is not a function call or an import in the sense other languages use that word — it is a literal, dumb copy-paste, performed by the **preprocessor** (Concept Unit 1's first pipeline stage) before the compiler ever runs. The preprocessor opens `scratch_greeting.h` and pastes its entire contents into `scratch_main.cpp` at the exact spot the `#include` line sat, then hands the combined, expanded text to the compiler — which never sees an `#include` line at all, only the pasted result.

This throwaway pair (`scratch_greeting.h`, `scratch_main.cpp`) is now discarded — it will not appear in the project again. `#include <iostream>` in the real `main.cpp` does exactly this same paste, just with a much larger file the compiler already ships: `<iostream>`, which is where `std::cout` (Concept Unit 7) is declared.

### Mechanical Walkthrough

- `#` — **(a) first appearance.** Marks this line as a **preprocessor directive** — an instruction for the preprocessor stage specifically, not a C++ statement. This is why the line has no trailing `;`: it isn't C++ syntax at all, it's a separate mini-language the preprocessor reads before the compiler starts.
- `include` — **(a) first appearance.** The specific directive requesting a text paste, as demonstrated in the Concept Lab above.
- `<iostream>` — **(a) first appearance.** The name of the file to paste in, using angle brackets. Angle brackets versus quotes is covered next, since it's a genuinely separate decision, not a detail of `#include` itself.

### CS Lens

Text substitution before a "real" compilation step is a general pattern: templating engines expand `{{variable}}` placeholders before the result is parsed as HTML; a linker's macro-expansion assemblers do the same for assembly source. Any time one stage's whole job is "expand shorthand into the real thing, verbatim, with no understanding of what it means," that's this same pattern.

### SE Lens

Splitting "declare what exists" (a header) from "use what exists" (`#include`-ing it) is what lets `<iostream>`'s actual implementation live once, inside the compiler's own installation, while being usable from every C++ file that needs it, without copying its source into your project. The cost: because `#include` is a blind paste with no awareness of what's already been pasted, including the same header twice in a way the compiler processes together can produce duplicate declarations — this is the exact problem header guards solve, in `CPP-S02-LAB-01`.

### Watch for

Forgetting `#include` for a feature you use produces an error naming the missing feature directly — Concept Unit 7's Challenge reproduces this for real, with the exact compiler message.

### Connection

`<iostream>` is what makes `std::cout`, used starting in Concept Unit 7, available at all.

---

## Concept Unit 6: Angle Brackets vs. Quotes

### The Problem

`#include <iostream>` uses angle brackets. A project's own header, later in this series (`CPP-S02-LAB-01`'s `Greeter.h`), is included as `#include "Greeter.h"` — quotes. These are not stylistic; they tell the preprocessor to search different places.

### No isolated code lab for this step

This reuses the Concept Lab from Concept Unit 5 (the same `#include` mechanism) — only the search-location rule is new, and it's small enough to state directly rather than build a second throwaway pair for.

### Mechanical Walkthrough

- `<...>` — **(a) first appearance.** Tells the preprocessor to search the compiler's own installed library directories (where standard-library headers like `<iostream>` live) — not the current project folder.
- `"..."` — **(a) first appearance, not used yet in this lesson's own code, but explained here since it's the direct contrast that makes `<...>` meaningful.** Tells the preprocessor to search the current project directory first, then fall back to the compiler's library directories. Used for a project's own headers.

### CS Lens

This is a **search path with priority order** again — the same idea as PATH from Concept Unit 2, restated: an ordered list of places to look, and which list you get depends on which syntax you use.

### SE Lens

The two-syntax split exists so a file named, say, `string.h` inside your own project doesn't accidentally shadow the standard library's own headers, or vice versa — quotes and brackets keep "my code" and "the library" in two separate search spaces by construction, rather than relying on you to avoid name collisions by convention.

### Watch for

Using quotes for a standard-library header, or angle brackets for your own, is a common "file not found" mistake for beginners — the preprocessor searched the wrong list.

### Connection

This distinction becomes load-bearing the moment a project has its own header files, starting in `CPP-S02-LAB-01`.

---

## Concept Unit 7: Namespaces and the `std::` Prefix

### The Problem

The standard library defines thousands of names — types, functions, constants. If all of them lived in the same global naming space as every name you write yourself, an accidental collision (you naming your own variable `count`, and the library already having one) would be a constant risk in any nontrivial program.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `main.cpp` — will be modified in Concept Unit 8, once there's a reason to write `std::` for real.
- **Change type:** N/A for this unit specifically — this Concept Unit teaches the `std::` prefix in isolation before Concept Unit 8 uses it.
- **Location:** N/A.
- **Dependencies:** None.

### Concept Lab

```cpp
// scratch_namespace.cpp  (disposable)
namespace scratch {
    int cout = 42;   // deliberately named "cout" — not the real std::cout
}

int main() {
    return scratch::cout;   // 42, via echo $LASTEXITCODE
}
```

Run it: `echo $LASTEXITCODE` after running prints `42`. What that proves: `scratch::cout` and any hypothetical global `cout` are different names, even though both are spelled `cout` — the `scratch::` prefix is what disambiguates them. `std::cout`, used starting next unit, works by exactly this same rule: `std` is a **namespace** — a named scope — and `std::cout` means specifically "the `cout` declared inside the `std` namespace," not any other `cout` that might exist.

This throwaway file is discarded now; the real project's `main.cpp` never declares its own namespace in this lesson.

### Mechanical Walkthrough

- `namespace scratch { ... }` — **(a) first appearance.** Declares a named scope; every identifier declared inside it (here, `cout`) must be referred to as `scratch::cout` from outside the namespace, exactly as demonstrated above.
- `::` — **(a) first appearance.** The **scope resolution operator** — reads left to right as "inside," so `scratch::cout` reads as "the `cout` inside `scratch`."

### CS Lens

A namespace is a **name scope** — the same general idea as a file-local variable versus a global one, or a class's private members versus its public ones (LAB-10, Structs): a boundary that controls which names are visible from where, so two unrelated pieces of code can each use a short, natural name without one silently overwriting the other's meaning.

### SE Lens

The standard library puts every one of its names inside `std` specifically so that a beginner's very first program — which might reasonably declare a variable called `cout`, `string`, or `vector` before ever learning those are taken — doesn't collide with the library by accident. The explicit `std::` this course always writes (never `using namespace std;`, which would paste every standard-library name into the global scope at once) costs a few extra keystrokes per line, in exchange for every name in every line of code in this series being traceable to exactly where it came from just by reading it.

### Watch for

`using namespace std;` appears in many tutorials and would make `cout` alone work without the `std::` prefix — this course never uses it, specifically so `std::` in front of a name is always a reliable signal that it comes from the standard library.

### Connection

`std::cout`, next, is this same rule applied to the real standard library instead of a scratch one.

---

## Concept Unit 8: `std::cout` and `<<` — Printing to the Terminal

### The Problem

`main` currently runs and exits, but produces no visible output. The `dungeon.exe` this lab is building toward is defined by one line of visible text — something has to actually send characters to the terminal.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `main.cpp` — modified.
- **Change type:** Add (one statement).
- **Location:** Inside `main`'s body, before `return 0;`.
- **Dependencies:** `#include <iostream>` (Concept Unit 5) — `std::cout` is declared there.

### The New Code

```cpp
std::cout << "Hello, Dungeon! The adventure begins." << std::endl;
```

### The Updated Project

```cpp
#include <iostream>

int main() {
    std::cout << "Hello, Dungeon! The adventure begins." << std::endl;   // ← new
    return 0;
}
```

### Concept Lab

```cpp
// scratch_stream.cpp  (disposable)
#include <iostream>

int main() {
    std::cout << "First";
    std::cout << " Second";
    std::cout << std::endl;
}
```

Run it — verified this session:

```
$ g++ scratch_stream.cpp -o scratch_stream -std=c++17 -Wall -Wextra
$ ./scratch_stream.exe
First Second
```

What that proves: two separate `std::cout <<` statements write to the *same* destination, in the order they run, with nothing resetting between them — `std::cout` is called a **stream**, an abstraction for "a sequence of characters flowing to a destination," and each `<<` sends one more piece into that flow. Chaining, `std::cout << "First" << " Second"`, does the identical thing in one statement — `<<` returns the stream itself after each use, which is what makes chaining multiple `<<` in a row work at all, rather than needing a separate statement per piece.

This scratch file is discarded now; the real `main.cpp` uses one chained statement, shown above, doing exactly what this scratch version did across three.

### Mechanical Walkthrough

- `std::cout` — **(a) first appearance.** The standard output stream object — its destination is the terminal. Declared inside `<iostream>` (Concept Unit 5), inside the `std` namespace (Concept Unit 7).
- `<<` — **(a) first appearance.** The **stream insertion operator**. As demonstrated in the Concept Lab, it sends the value on its right into the stream on its left, and evaluates to that same stream — which is why a second `<<` can immediately follow.
- `"Hello, Dungeon! The adventure begins."` — **(c) already basic.** A string literal; string literals themselves are covered fully in LAB-07 (Strings) — here it is used only as a value to send into the stream, nothing new about the literal syntax itself beyond what's needed to write text in quotes.
- `std::endl` — **(a) first appearance, covered in full in the next Concept Unit** — noted here only as "the third thing chained onto this stream," not yet explained, since it deserves its own throwaway comparison against `"\n"`.
- `;` — **(c) already basic.** Statement terminator, per Concept Unit 4.

### CS Lens

A stream you write into with an operator, rather than calling a `print(value)` function, is the same idea C++ reuses for reading input (`std::cin >>`), writing to files (`CPP-S02-LAB-18`), and even for building strings in memory (`std::ostringstream`) — one interface, many destinations, because all of them share the same "sequence of characters flowing somewhere" shape.

### SE Lens

Hiding the actual mechanism behind `std::cout << value` — on Linux, ultimately a `write()` system call; on Windows, `WriteFile()`; neither of which takes a C++ string directly, both take raw memory addresses and byte counts — is an **abstraction boundary**: the stream interface is the same regardless of which operating system compiled the program, so `main.cpp` never needs an `#ifdef` to print differently on Windows versus Linux. The cost of that abstraction: exactly how and when the underlying system call actually happens (immediately, or batched later) is now something you don't control directly — which is precisely the question the next Concept Unit exists to answer.

### Connection

The chained `<< std::endl` at the end of this same statement is Concept Unit 9's subject.

---

## Concept Unit 9: `std::endl` vs. `"\n"` — Buffering

### The Problem

Both `std::endl` and `"\n"` end the current line of output. They are not interchangeable in what else they do, and the difference is invisible in a program this small — which is itself worth being honest about before claiming a difference exists.

### Project Change

Already covered by Concept Unit 8's Project Change — `std::endl` is part of the same line added there. This unit only explains the piece that unit deferred.

### Concept Lab

There is no runnable demonstration in this lesson that makes the difference between `std::endl` and `"\n"` visible in the terminal — both produce output that looks identical here, because nothing in a two-line `main` competes for buffer space or crashes before flushing. Rather than fabricate a "proof" this lesson's own program can't actually show, here is what's true, cited to the language rather than asserted as self-evident: `std::endl` writes a newline character *and* calls `flush()` on the stream, forcing any buffered output to actually reach the terminal immediately. `"\n"` writes only the newline character — the surrounding output *may* sit in a buffer briefly before appearing, at the implementation's discretion. **Buffering** means output is temporarily held in memory rather than sent to its destination the instant it's written, because grouping many small writes into fewer, larger ones is faster than sending each one individually. A program that crashes (say, from an unrelated bug introduced in a later lab) before its buffer is ever flushed can lose output written with `"\n"` that was never forced out — output written with `std::endl` has already left the buffer by the time of the crash, because the flush already happened.

### CS Lens

Buffering-with-explicit-flush is the same tradeoff as a text editor's autosave: batching writes is more efficient, but something has to decide when "efficient" gives way to "guaranteed visible now." Also recognized in: database transaction commits, network socket writes (Nagle's algorithm batches small packets), and any logging library's distinction between a buffered logger and one that flushes every line.

### SE Lens

This course defaults to `std::endl` for interactive, line-at-a-time programs like this one — output should appear the moment it's produced, not whenever the buffer happens to fill. For a program writing thousands of lines quickly (a later lab that logs every step of a large data structure), the tradeoff flips: forcing a flush after every single line is measurably slower than letting the buffer batch writes and flushing occasionally, so `"\n"` becomes the better default there. Neither is universally correct; which one to reach for depends on whether "appears instantly" or "runs fast" matters more for that specific program.

### Watch for

A program that appears to "hang" with no output, when it is actually running correctly but hasn't flushed yet, is a real and common source of confusion — if a later lab's output seems delayed or missing, whether the stream has been flushed is one of the first things to check.

### Connection

This closes out every piece of the `std::cout << "..." << std::endl;` statement from Concept Unit 8 — the next unit moves to automating how this file gets compiled.

---

## Concept Unit 10: `make` and the Makefile

### The Problem

Typing `g++ main.cpp -o dungeon -std=c++17 -Wall -Wextra` by hand every time a single line changes is tedious and error-prone — a mistyped flag silently produces a differently-configured build with no warning that anything was different from last time.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `Makefile` — created.
- **Change type:** Add (new file).
- **Location:** Project root, alongside `main.cpp`.
- **Dependencies:** `make`, installed alongside `g++` in Concept Unit 2.

### The New Code

```makefile
CXX      = g++
CXXFLAGS = -std=c++17 -Wall -Wextra -g

dungeon.exe: main.cpp
	$(CXX) $(CXXFLAGS) main.cpp -o dungeon.exe

clean:
	-del dungeon.exe
```

### The Updated Project

This is a brand-new file — the code above is the entire `Makefile`, with nothing surrounding it yet.

### Concept Lab

Skipped deliberately: `make`'s rule syntax is small enough, and specific enough to this one file, that a separate disposable Makefile would just be this same content with different names — it would not strip away any complexity this file doesn't already have at its smallest. The Mechanical Walkthrough below teaches the syntax directly against the real file.

### Mechanical Walkthrough

- `CXX = g++` — **(a) first appearance.** A **variable** assignment in Makefile syntax (a different, much smaller language than C++ — `make` reads this file with its own parser, not the C++ compiler). `CXX` is a conventional name for "the C++ compiler to use," not a keyword — it could be named anything, but every C/C++ Makefile in existence uses this exact name by convention, so this course does too.
- `CXXFLAGS = -std=c++17 -Wall -Wextra -g` — **(a) first appearance for the variable mechanism** (reusing `CXX`'s pattern); **(a) first appearance for `-g`** specifically — a new flag not used in earlier Concept Units, telling the compiler to include debug information in the output, which makes later error messages and debuggers report real line numbers instead of raw memory addresses.
- `dungeon.exe: main.cpp` — **(a) first appearance.** A **rule**. The word before `:` is the **target** — the file this rule knows how to produce. The word after is the **dependency** — a file this target needs; if `main.cpp` is newer than `dungeon.exe`, the rule's recipe runs. If `dungeon.exe` is already newer than `main.cpp`, `make` skips the recipe entirely and reports the target is up to date.
- `\t$(CXX) $(CXXFLAGS) main.cpp -o dungeon.exe` — **(a) first appearance.** The **recipe** — the actual command to run, indented with a literal tab character, not spaces (a real quirk of `make`'s file format; spaces produce the error `missing separator`). `$(CXX)` and `$(CXXFLAGS)` are variable *references* — `make` substitutes each with the value assigned above before running the line, producing the exact same command Concept Unit 4 typed by hand.
- `clean:` — **(a) first appearance.** A second rule, with no dependency — meaning it always runs when invoked directly (`make clean`), never automatically as a side effect of building `dungeon.exe`.
- `-del dungeon.exe` — **(a) first appearance.** `del` is the delete command; the leading `-` tells `make` to ignore a nonzero exit code from this line (so `make clean` doesn't report failure if `dungeon.exe` doesn't exist yet to delete).

### A real bug this lesson's own earlier version had, caught by actually running it

The most natural version of this Makefile names the target `dungeon` — matching the `-o dungeon` flag from Concept Unit 4 exactly. On Windows, though, `g++ -o dungeon` still produces a file named `dungeon.exe` (the `.exe` is appended automatically), and `make` looks for a file literally named `dungeon`, with no extension, to decide whether the target is up to date. Verified this session: with the target spelled `dungeon:` instead of `dungeon.exe:`, no file matching that exact name ever exists, so `make` concludes the target is always missing and recompiles on *every* invocation — it never reports "up to date," even seconds after a successful build with nothing changed. Naming the target `dungeon.exe:` (as shown above), matching the real output filename exactly, fixes this — verified below.

### Run It

Verified this session, in order, from a clean project folder:

```
$ make
g++ -std=c++17 -Wall -Wextra -g main.cpp -o dungeon.exe

$ ./dungeon.exe
Hello, Dungeon! The adventure begins.

$ make
mingw32-make: 'dungeon.exe' is up to date.
```

The second `make` compiled nothing — it compared `dungeon.exe`'s modification time against `main.cpp`'s, found the executable newer, and did no work. After editing `main.cpp` and saving (verified with `touch main.cpp` this session, standing in for a real edit):

```
$ make
g++ -std=c++17 -Wall -Wextra -g main.cpp -o dungeon.exe
```

It recompiled — `main.cpp` was now newer than the existing `dungeon.exe`.

```
$ make clean
del dungeon.exe
```

`dungeon.exe` no longer exists in the folder after this — verified this session.

### Connection

This is the last piece of LAB-00 — every lab after this one assumes you can type `make` instead of the full `g++` command, and that `make` will only do real work when something has actually changed.

---

## Closing

### Connect the pieces

One value — the string `"Hello, Dungeon! The adventure begins."` — moving through every stage this lesson built: it is typed as a string literal inside `main.cpp` (Concept Unit 8), inside a call to `std::cout <<` that only compiles because `#include <iostream>` (Concept Unit 5) pasted in `std::cout`'s declaration and `std::` (Concept Unit 7) correctly names which `cout` is meant. `make` (Concept Unit 10) runs the exact `g++` command from Concept Unit 4 — preprocessor, compiler, linker (Concept Unit 1) — to turn that file into `dungeon.exe`. Running `dungeon.exe` sends that same string, via the stream and the flush from `std::endl` (Concept Unit 9), to the terminal, where it appears as the one line this lesson set out to produce.

### What breaks without this

Deliberately removing `#include <iostream>` while keeping the `std::cout` line (verified this session) produces:

```
main.cpp: In function 'int main()':
main.cpp:2:10: error: 'cout' is not a member of 'std'
    2 |     std::cout << "Hello, Dungeon! The adventure begins." << std::endl;
      |          ^~~~
main.cpp:1:1: note: 'std::cout' is defined in header '<iostream>'; this is probably fixable by adding '#include <iostream>'
  +++ |+#include <iostream>
    1 | int main() {
main.cpp:2:66: error: 'endl' is not a member of 'std'
    2 |     std::cout << "Hello, Dungeon! The adventure begins." << std::endl;
      |                                                                  ^~~~
main.cpp:1:1: note: 'std::endl' is defined in header '<ostream>'; this is probably fixable by adding '#include <ostream>'
```

Both `std::cout` and `std::endl` fail the same way: the compiler knows the name `std::cout` exists somewhere in the standard library (it even names the correct header to fix it) but refuses to compile without the declaration that `#include` was responsible for pasting in. Restoring the `#include <iostream>` line fixes both errors at once, because both names live in headers `<iostream>` pulls in.

### Exercises

1. Change `return 0;` to `return 1;` in `main.cpp`, rebuild, run `dungeon.exe`, then check `echo $LASTEXITCODE` in PowerShell. Confirm the visible output is identical and only the exit code changed. Change it back.
2. Remove the semicolon at the end of the `std::cout` line, rebuild, and read the resulting error message — identify the file, line, and column it names, and what statement it says was expected. Fix it.
3. Add a second `int main() { return 0; }` below the existing one, rebuild, and read the resulting "redefinition" error — identify both line numbers the compiler names, and explain in your own words why the compiler cannot pick one and ignore the other.
4. Delete `dungeon.exe` by hand (not with `make clean`), then run `make`. Confirm it rebuilds even though `main.cpp` never changed — because the target file itself was missing, not because it was outdated.

### Definition of done

- [ ] `g++ --version` and `make --version` both print a version number in a newly opened terminal.
- [ ] `main.cpp` exists, includes `<iostream>`, and its `main` prints `Hello, Dungeon! The adventure begins.` via `std::cout << ... << std::endl;`.
- [ ] `Makefile` exists with a `dungeon.exe:` target (not `dungeon:`) and a `clean:` target.
- [ ] `make` compiles cleanly with no warnings; `.\dungeon.exe` prints the expected line.
- [ ] Running `make` a second time with nothing changed reports `'dungeon.exe' is up to date.` — not a recompile.
- [ ] `make clean` removes `dungeon.exe`; a following `make` recreates it.
- [ ] All four exercises above completed, including reading and understanding each real compiler error produced.
- [ ] Commit: `git add main.cpp Makefile && git commit -m "LAB-00: working toolchain, first compiled program"` — the message states *why* this commit exists (a working, reproducible build), not just which files changed.
