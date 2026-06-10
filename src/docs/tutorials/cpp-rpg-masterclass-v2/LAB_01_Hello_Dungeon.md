# C++ Terminal RPG — LAB 01 — Hello, Dungeon

**Prerequisites:** A C++ compiler installed (see SERIES_OVERVIEW.md). No prior
C++ experience needed.

**What this lab adds:**
- Your first C++ program — compiled and running in the terminal
- A dungeon title screen in ASCII art
- Asking the player for their name and greeting them

**Time:** 30–45 minutes

---

## What You Will Build

When this lab is complete, running `./dungeon` shows:

```
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║    ██████╗ ██╗   ██╗███╗   ██╗ ██████╗ ███████╗ ██████╗  ║
║    ██╔══██╗██║   ██║████╗  ██║██╔════╝ ██╔════╝██╔═══██╗ ║
║    ██║  ██║██║   ██║██╔██╗ ██║██║  ███╗█████╗  ██║   ██║ ║
║    ██║  ██║██║   ██║██║╚██╗██║██║   ██║██╔══╝  ██║   ██║ ║
║    ██████╔╝╚██████╔╝██║ ╚████║╚██████╔╝███████╗╚██████╔╝ ║
║    ╚═════╝  ╚═════╝ ╚═╝  ╚═══╝ ╚═════╝ ╚══════╝ ╚═════╝  ║
║                                                          ║
║              of   D O O M                               ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝

  What is your name, brave adventurer? Erevan

  Welcome, Erevan! Your fate awaits in the dungeon below.
  Press ENTER to begin your descent...
```

---

> **Quick Check — try to answer before reading:**
> 1. What does `#include <iostream>` do, and why does every C++ program need it?
> 2. What do you think happens if you forget the semicolon at the end of a line?
> 3. Prediction: in Python you write `print("hello")`. What do you predict the
>    C++ equivalent looks like?
> *(Answers at the end of this lab)*

---

## Concept: The C++ Program Structure

**What it is:** Every C++ program is a collection of functions. The compiler
always starts execution at a function named `main`.

**The problem before:** Unlike a script (Python, JavaScript) that runs top-to-bottom
from any file, C++ needs an explicit entry point so the operating system knows
where to begin.

**The solution:** You write a `main` function. The OS calls it when your program
starts. It returns an `int` — by convention `0` means success, anything else
means an error occurred.

**Canonical example (General Explanation):**

The OS runs your program by calling exactly one function: the one named `main`. This is a convention baked into every C++ compiler and operating system — the program loader is hardcoded to look for the symbol `main` and call it. Nothing else in your file runs unless `main` calls it (directly or indirectly).

`return 0` is not decorative. The integer `main` returns goes back to the shell as the **exit code**. Run this and then check what the shell received:

```bash
./dungeon
echo $?    # prints the number main() returned — 0 means success
```

Change `return 0` to `return 1` and recompile — `echo $?` prints `1`. Scripts and CI systems use this to detect whether a program succeeded or failed. By convention, `0` = success, anything else = an error occurred.

This is why every function that isn't `main` must itself be called by `main` or by something `main` calls — execution starts at `main` and flows outward from there.

**Project Application (The "Why" here):**
`main()` in this series grows from 10 lines to a full game loop. By LAB-04 it contains the game loop that drives each turn. By LAB-10 it orchestrates rooms, battles, and inventory. Every feature added in every lab — title screen, character sheet, combat, items — eventually gets called from `main()`. Understanding that `main` is the single origin point explains why your code runs in the exact order it does.

**Smallest possible example:**
```cpp
int main() {
    return 0;
}
```
This is a valid C++ program. It does nothing and exits cleanly.

**Why it matters here:** Every lab starts by adding code inside `main`. Understanding
that `main` is the entry point explains why your code runs in the order it does.

**Watch for:** Forgetting `return 0;` at the end of `main`. Modern compilers
will often compile without it, but it is always required by the standard and
omitting it in other functions causes bugs.

---

## Concept: `#include` — Importing Standard Libraries

**What it is:** A preprocessor directive that copies the contents of a named
header file into your source file before compilation. It is how C++ accesses
built-in functionality.

**The problem before:**
```cpp
int main() {
    cout << "Hello!" << endl;  // ERROR: 'cout' was not declared in this scope
    // The compiler has never seen 'cout' or 'endl' — they are defined
    // inside iostream, which hasn't been included. The compiler only knows
    // what you've explicitly brought in.
    return 0;
}
```
`cout` is defined in the `iostream` library. Without including it, the compiler
does not know what `cout` is.

**The solution:**
```cpp
#include <iostream>
// Now 'std::cout', 'std::cin', 'std::endl' are all defined — pasted in
// from the iostream header by the preprocessor before compilation.

int main() {
    std::cout << "Hello!" << std::endl;
    // std:: prefix required because cout lives in the 'std' namespace.
    // Without std:: the compiler looks for a global 'cout' and fails.
    return 0;
}
```

**What it hides:** Hides the implementation details of `std::cout`, `std::cin`, and `std::endl` — you never need to know how the terminal stream works internally, only how to use it. Invariant: once included, those names are available globally for the rest of the translation unit; no other code can "un-include" them out from under you.

**Canonical example (General Explanation):**

`#include` is not an import or a link — it is a **literal text paste**. The preprocessor runs BEFORE the compiler. It finds every `#include` line, opens that file, and replaces the `#include` line with the entire text of the file. By the time the compiler sees your code, `#include <iostream>` has been replaced by thousands of lines of definitions.

You can see this yourself. Run:

```bash
g++ -E main.cpp    # -E = run preprocessor only, stop before compiling
```

The output is enormous — your five-line file becomes thousands of lines. Everything the compiler sees is already there in plain text. There is no runtime loading or dynamic linking at this stage.

This also explains why include order matters and why `#pragma once` (or include guards) exist: if two files both include the same header, without protection the preprocessor would paste the same definitions twice, causing "already defined" errors.

**Project Application (The "Why" here):**
Every lab in this series uses `#include <iostream>` because all game output goes to the terminal. As the project grows you will add `#include <string>` (LAB-02), `#include <vector>` (LAB-05), and `#include <cstdlib>` (LAB-05 for `rand()`). The angle-bracket form `< >` means "search the standard library." In LAB-14+ when you split code into your own header files, you switch to the quoted form: `#include "character.h"` — which means "search relative to this file first."

**Smallest possible example:**
```cpp
#include <iostream>

int main() {
    std::cout << "Hello, World!" << std::endl;
    return 0;
}
```

**Why it matters here:** Every lab includes `<iostream>` because we always
print to the terminal. You will add more includes as you need them.

**Watch for:** The angle brackets `< >` are for standard library headers. When
you include your own files (Lab 14+), you use quotes: `#include "character.h"`.

---

## Concept: `std::cout` — Printing to the Terminal

**What it is:** The standard output stream. `cout` means "character output."
The `<<` operator sends data into the stream, which the terminal displays.

**The problem before:** How do you get text on screen? In Python it is `print()`.
In C++ the mechanism is a stream — think of it as a pipe you pour text into,
and the terminal is at the other end.

**The solution:**
```cpp
std::cout << "text here" << std::endl;
```
- `std::` — the standard library namespace prefix (explained next)
- `cout` — the output stream object
- `<<` — the stream insertion operator (pour this into the stream)
- `"text"` — a string literal
- `std::endl` — end-of-line: flushes the stream and moves to a new line

**Canonical example (General Explanation):**

There are two mechanisms here that both need explaining: **why `<<` chains**, and **why `endl` matters**.

**Why `<<` chains:** `cout << "Hello"` does not return `void` — it returns `cout` itself. So `cout << "Hello" << " world"` is evaluated as `(cout << "Hello") << " world"`. The first `<<` returns `cout`, then you immediately call `<<` on `cout` again. You can chain a hundred values this way.

```cpp
// These two lines do exactly the same thing:
std::cout << "Part A " << "Part B" << std::endl;
(((std::cout << "Part A ") << "Part B") << std::endl);  // same thing, explicit
```

**Why `endl` instead of just `"\n"`:** Output does NOT go directly to the screen. It goes to a **buffer** — a chunk of memory your program fills up. The OS periodically flushes the buffer to the screen. `"\n"` adds a newline character but does NOT flush. `std::endl` adds `"\n"` AND forces an immediate flush.

If you do `cout << "Enter your name: "` (with `"\n"` not `endl`) and then immediately call `cin >>`, the prompt text might still be sitting in the unflushed buffer — invisible — while the player is already typing their answer. `endl` guarantees the text appears before the program waits for input.

**Project Application (The "Why" here):**
Every piece of game output in this series — dungeon room descriptions, battle results, character stats, menus — goes through `std::cout`. The `std::endl` at the end of each line flushes the buffer, which is important whenever the program is about to wait for input: it ensures the prompt text actually appears on screen before `std::cin` blocks waiting for the player to type.

**Smallest possible example:**
```cpp
std::cout << "Line 1" << std::endl;
std::cout << "Line 2" << std::endl;
// Chaining works too:
std::cout << "Part A " << "Part B" << std::endl;
```

**Why it matters here:** You use `cout` in every single lab. This is how every
piece of game output — rooms, characters, battle results — reaches the screen.

**Watch for:** `std::cout` vs `cout`. Both work if you write `using namespace std;`
at the top. This series does NOT use `using namespace std;` because in large
programs it causes name collisions. Every lab uses the `std::` prefix explicitly.

---

## Concept: `std::cin` — Reading Player Input

**What it is:** The standard input stream. `cin` means "character input."
The `>>` operator reads data FROM the stream into a variable.

**The problem before:** A game that cannot accept player input is just a
movie. You need a way to read text the player types.

**The solution:**
```cpp
std::string name;      // declare an empty string to receive the input
std::cin >> name;      // read one word from the keyboard into 'name'
                       // stops at whitespace — "Erevan Bold" → only "Erevan"

// For full lines with spaces:
std::getline(std::cin, name);
// reads everything up to '\n' (the ENTER keypress) — captures spaces too
// "Erevan the Bold" → name contains the full three words
```

**Canonical example (General Explanation):**

`cin` maintains a hidden **input buffer** — a string of everything the user has typed that your program hasn't read yet. `>>` reaches into that buffer, skips any leading whitespace, reads characters until it hits whitespace again, and stops — leaving everything after that whitespace still in the buffer.

```
User types: "Erevan Bold" and presses ENTER
Buffer contains: "Erevan Bold\n"

cin >> firstName   → reads "Erevan", stops at the space
Buffer now: " Bold\n"    ← the space, "Bold", and newline are still there

cin >> lastName    → skips the space, reads "Bold", stops at newline
Buffer now: "\n"         ← only the newline remains
```

This is exactly why `cin.ignore()` exists — it discards one character (the leftover `\n`) from the buffer. Without it, the next `cin.get()` or `getline` immediately reads the leftover newline and thinks the user already pressed ENTER, giving you an empty read.

The buffer model also explains `getline`: instead of stopping at whitespace, it reads everything up to the newline — capturing spaces and all.

**Project Application (The "Why" here):**
Used here to read the player's character name. In later labs `std::cin` reads single-character commands: `'a'` for attack, `'r'` for run, `'i'` for inventory. The `cin.ignore()` + `cin.get()` pattern appears whenever the program needs to pause and wait for the player to press ENTER — `ignore()` discards the leftover newline from the previous `>>` read, and `get()` blocks until ENTER is pressed.

**Smallest possible example:**
```cpp
#include <iostream>
#include <string>

int main() {
    std::string answer;
    std::cout << "What is your name? ";
    std::cin >> answer;
    std::cout << "Hello, " << answer << std::endl;
    return 0;
}
```

**Why it matters here:** The player will type their character's name in this
lab, and commands in every lab after.

**Watch for:** `std::cin >> name` reads ONE word and stops at whitespace.
If you want to read "Erevan the Bold" (a full line), use
`std::getline(std::cin, name)` instead.

---

## Step 1 — Your First Compilable Program

Create a new folder called `dungeon/` anywhere you like. Inside it, create
a file called `main.cpp` with exactly this content:

```cpp
#include <iostream>
// #include: preprocessor directive — pastes the entire iostream file here
// before the compiler runs. Without it, std::cout doesn't exist yet.
// <iostream>: angle brackets mean "search the standard library folder."

int main() {
// int main(): the function the OS calls when your program starts.
// 'int' is the return type — main must return a number (the exit code).
// The OS will not call any other function on its own — only main.

    std::cout << "Hello, Dungeon!" << std::endl;
    // std::    — namespace prefix: cout lives inside the 'std' namespace
    // cout     — the standard output stream (connected to your terminal)
    // <<       — stream insertion: sends what's on the right into the stream on the left
    // "Hello, Dungeon!" — a string literal: text in double quotes
    // << std::endl     — chains a second insertion: sends a newline AND flushes
    //                    the output buffer so the text appears immediately

    return 0;
    // Sends exit code 0 back to the OS. 0 = success by convention.
    // Try: after running, type 'echo $?' in the terminal — you'll see 0.
}
```

Open a terminal, navigate to your `dungeon/` folder, and compile:

```bash
g++ -std=c++17 -o dungeon main.cpp
# g++        — the GNU C++ compiler
# -std=c++17 — use the C++17 standard (required for features used later in the series)
# -o dungeon — name the output file 'dungeon' (without this, it defaults to 'a.out')
# main.cpp   — the source file to compile
```

Then run it:
```bash
./dungeon        # Mac / Linux — './' means "in the current folder"
dungeon.exe      # Windows
```

### SAVE AND TRY

Save. Compile with `g++ -std=c++17 -o dungeon main.cpp`. Run `./dungeon`.

**You should see:**
```
Hello, Dungeon!
```

**In the terminal:**
```bash
g++ -std=c++17 -o dungeon main.cpp && echo "Compile OK"
```
Expected: `Compile OK` — no errors.

**Change something:** Change the message to `"Hello, World of Pain!"`.
Recompile and run. You should see the new message.
Change it back to `"Hello, Dungeon!"`.

---

## Step 2 — The Title Screen

In Step 1 you had a bare `main()` that printed one line. Now you need to add
the `printTitleScreen` function and update `main` to call it. Add the new
function above `main`, and update the body of `main`:

```cpp
#include <iostream>
#include <string>                    // ← add this
// <string> defines std::string. Some compilers include it indirectly
// via <iostream>, but never rely on that — always include it explicitly.

// The title screen ASCII art (split across multiple cout calls for clarity)
void printTitleScreen() {            // ← add this entire function
// 'void' return type: this function produces output but returns no value.
// The caller (main) cannot use the result in an expression — there is none.
// Functions that only cause side effects (printing, writing files) are void.

    std::cout << "╔══════════════════════════════════════════════╗" << std::endl;
    std::cout << "║                                              ║" << std::endl;
    std::cout << "║   ██████╗ ██╗   ██╗███╗  ██╗ ██████╗ ███████╗║" << std::endl;
    std::cout << "║   ██╔══██╗██║   ██║████╗ ██║██╔════╝ ██╔════╝║" << std::endl;
    std::cout << "║   ██║  ██║██║   ██║██╔██╗██║██║  ███╗█████╗  ║" << std::endl;
    std::cout << "║   ██║  ██║██║   ██║██║╚████║██║   ██║██╔══╝  ║" << std::endl;
    std::cout << "║   ██████╔╝╚██████╔╝██║ ╚███║╚██████╔╝███████╗║" << std::endl;
    std::cout << "║   ╚═════╝  ╚═════╝ ╚═╝  ╚══╝ ╚═════╝ ╚══════╝║" << std::endl;
    // Each cout call prints one row of the box. The box-drawing characters
    // (╔ ═ ╗ ║ ╚ ╝) are Unicode — they only display correctly if your
    // terminal and font support Unicode (most modern ones do).
    // If lines look like "???" or scrambled, replace with ASCII: + - + | + +
    std::cout << "║                                              ║" << std::endl;
    std::cout << "║            of   D O O M                     ║" << std::endl;
    std::cout << "║                                              ║" << std::endl;
    std::cout << "╚══════════════════════════════════════════════╝" << std::endl;
    std::cout << std::endl;
    // The extra blank endl after the box adds a blank line of spacing.
    // Without it the next output (the name prompt) would appear cramped.
}

int main() {
    printTitleScreen();              // ← was: std::cout << "Hello, Dungeon!" << std::endl;
    // Calling printTitleScreen() here is what actually executes its code.
    // The function definition above only DESCRIBES what it does — calling
    // it is what runs it. The OS called main(); main calls printTitleScreen().
    return 0;
}
```

### SAVE AND TRY

Compile and run.

**You should see:** The ASCII art title box printed in the terminal.

**In the terminal — count the lines:**
The box has exactly 12 lines. Count them. If any lines look misaligned,
your font may not support Unicode box-drawing characters. Swap to the ASCII
version by replacing `╔`, `═`, `╗`, `║`, `╚`, `╝` with `+`, `-`, `+`, `|`,
`+`, `+`.

**Change something:** Add a second blank `std::cout << std::endl;` after the
last line of the box. Recompile. The spacing below the title changes.
Change it back to one blank line.

---

## Concept: `std::string` — Text Variables

**What it is:** A variable type that stores text. Requires `#include <string>`.

**The problem before:**
```cpp
// In C, text is a char array — awkward and error-prone:
char name[50];  // must guess max length in advance
                // if a player types more than 49 characters: buffer overflow —
                // undefined behavior, possible crash, possible security exploit
strcpy(name, "Erevan");       // copy into the array (no bounds check)
strcat(name, " the Bold");    // append — if total > 49 chars: silent corruption
```

**The solution:** `std::string` handles memory automatically. It grows as needed.
```cpp
std::string name = "Erevan";
// 'name' holds "Erevan" — the string manages its own memory internally

std::cout << "Hello, " << name << std::endl;
// 'name' is passed directly to cout — no pointer arithmetic needed

// Concatenate with +:
std::string greeting = "Hello, " + name + "!";
// + creates a new string from the pieces — all memory managed automatically
// "Hello, " is a string literal; + with std::string auto-converts it
```

**What it hides:** Hides manual memory management. Without `std::string`, you would use a fixed-size `char name[50]` and risk a buffer overflow the moment a player types more than 49 characters. Invariant: you can always append to a `std::string` — it grows automatically, so outside code can never overflow it by appending.

**Canonical example (General Explanation):**

A `std::string` is a class that internally manages a pointer to heap memory and a length counter. When you do `hero += " the Bold"`, the string checks if its current allocation has room. If not, it allocates a larger block, copies the existing text, appends the new text, and frees the old block — all invisibly.

Contrast this with the C approach to understand why `std::string` exists:

```cpp
// C-style — you must declare a fixed size upfront:
char name[50];         // can hold AT MOST 49 characters + null terminator
strcpy(name, "Erevan");
strcat(name, " the Very Very Very Long Name");  // undefined behavior if > 49 chars
                                                 // no warning, no error — just corruption

// C++ style — no size limit, no manual memory:
std::string name = "Erevan";
name += " the Very Very Very Long Name";  // just works, automatically resizes
```

The C version crashes or silently corrupts memory if the name is too long — a famous category of security vulnerabilities called **buffer overflows**. `std::string` makes buffer overflows impossible by handling the memory itself.

**Project Application (The "Why" here):**
Character names, room descriptions, enemy names, item names — every piece of text in this game is a `std::string`. The `+` operator concatenates strings for building dynamic messages like `"Welcome, " + playerName + "!"`. As the series progresses, you will build room descriptions with `+=` one sentence at a time, and pass `const std::string&` into functions to avoid copying large text blocks.

**Smallest possible example:**
```cpp
#include <string>
std::string hero = "Erevan";
std::string title = "the Bold";
std::cout << hero << " " << title << std::endl;
// Output: Erevan the Bold
```

**Why it matters here:** The player's character name is a string. Every enemy
name, room description, and item name in the game is a string.

**Watch for:** `std::string` is in `<string>`, not `<iostream>`. Many compilers
let you skip the include if `<iostream>` indirectly includes it, but always
include it explicitly — never rely on indirect includes.

---

## Step 3 — Ask the Player's Name

`printTitleScreen()` is already defined above `main`. Now update `main()` to
ask for the player's name. Replace the body of `main` with the following
(keep `printTitleScreen` unchanged above it):

```cpp
int main() {
    printTitleScreen();

    // ── Ask for the player's name ──────────────────────────────── // ← add from here
    std::cout << "  What is your name, brave adventurer? ";
    // No std::endl here — the cursor stays on the same line so the
    // player types their name right after the question mark.
    // Using std::endl would move to the next line before they type.

    std::string playerName;
    // Declares a string variable called playerName.
    // It starts empty — no value yet. cin >> fills it next.

    std::cin >> playerName;
    // Reads from the keyboard into playerName.
    // Stops at the first space — so "Erevan Bold" stores only "Erevan".
    // "Bold" stays in the input buffer (see Challenge below to fix this).

    std::cout << std::endl;
    // Blank line after the player types — purely visual spacing.

    std::cout << "  Welcome, " << playerName << "!" << std::endl;
    // Concatenates three things into one output:
    //   "  Welcome, " — the literal greeting
    //   playerName    — the variable containing what the player typed
    //   "!"           — closing punctuation
    // The << chaining works because each << returns cout (see Concept block).

    std::cout << "  Your fate awaits in the dungeon below." << std::endl;
    std::cout << std::endl;
    std::cout << "  Press ENTER to begin your descent..." << std::endl;

    // ── Wait for ENTER before continuing ─────────────────────────
    std::cin.ignore();
    // The previous 'cin >> playerName' read "Erevan" but left a '\n'
    // (the ENTER keypress) sitting in the input buffer.
    // ignore() discards that one leftover character so the next read
    // doesn't immediately consume it as a false ENTER press.

    std::cin.get();
    // Reads exactly one character from cin — blocks here until the
    // player presses ENTER, which sends '\n' and unblocks the read.
    // This is the "Press ENTER to continue" pause pattern.

    std::cout << std::endl;
    std::cout << "  You descend into darkness..." << std::endl;
    std::cout << std::endl;                              // ← to here

    return 0;
}
```

### SAVE AND TRY

Compile and run.

**You should see:**
1. The title screen
2. A prompt: `What is your name, brave adventurer?`
3. Type `Erevan` and press ENTER
4. `Welcome, Erevan!`
5. `Press ENTER to begin your descent...`
6. Press ENTER again
7. `You descend into darkness...`

**In the terminal — try a two-word name:**
Run again. Type `Erevan Bold` (with a space). What happens?
Expected: Only `Erevan` is stored. `Bold` is left in the input buffer —
a classic `cin >>` behavior. (We fix this in a challenge below.)

**Change something:** Change `"You descend into darkness..."` to
`"You take a deep breath and step forward..."`. Recompile. See the new message.
Change it back.

---

## Challenge: Two-Word Names

**You know:** `std::cin >> name` reads one word. `std::getline(std::cin, name)`
reads a full line.

**Task:** Allow the player to type a two-word name like `Erevan the Bold`
and have the full name printed in the welcome message.

**Starting code (the name section of main):**
```cpp
std::cout << "  What is your name, brave adventurer? ";
std::string playerName;
std::cin >> playerName;  // ← change this line
std::cout << "  Welcome, " << playerName << "!" << std::endl;
```

**Hint 1:** Replace `std::cin >> playerName` with `std::getline(std::cin, playerName)`.

**Hint 2:** `std::getline` requires the `<string>` header, which is already included.

Try for at least 5 minutes before revealing the solution.

---

<details>
<summary>▶ Show Solution</summary>

```cpp
std::cout << "  What is your name, brave adventurer? ";
std::string playerName;
std::getline(std::cin, playerName);
// getline reads everything until '\n' — captures spaces in the name.
// If a previous 'cin >>' left a '\n' in the buffer, getline immediately
// reads that empty line. Fix: add 'std::cin.ignore()' before getline.
std::cout << "  Welcome, " << playerName << "!" << std::endl;
```

**Key insight:** `cin >>` tokenizes by whitespace — it reads one "word."
`getline` reads everything up to the newline character (when you press ENTER).
In a game where names like `"The Dark One"` are valid, you almost always want
`getline`. The tradeoff: `getline` captures the newline, so if you mix `cin >>`
and `getline` in the same program you sometimes get an empty read. The
`std::cin.ignore()` call before `getline` clears this leftover newline.

</details>

---

## Challenge: A Custom Subtitle

**You know:** `std::cout << "text" << std::endl` prints a line.
You can call `printTitleScreen()` and add more output below it.

**Task:** Add a subtitle line inside the `printTitleScreen` function that
randomly selects one of three taglines:
- `"Where heroes are forged... or forgotten."`
- `"Abandon hope, all ye who enter here."`
- `"Death is only the beginning."`

For now, just pick one by hardcoding it (Lab 05 covers random selection).
The subtitle should appear centered on its own line between the bottom of
the ASCII art and the copyright/blank line.

**Hint:** Add another `std::cout` line at the end of `printTitleScreen()`.

---

<details>
<summary>▶ Show Solution</summary>

Add near the bottom of `printTitleScreen()`:
```cpp
std::cout << "║   \"Where heroes are forged... or forgotten.\"  ║" << std::endl;
```

**Key insight:** String literals in C++ use double quotes. To include a literal
`"` inside a string, escape it with a backslash: `\"`. This is the same in
most languages. The backslash tells the compiler "the next character is part
of the string, not the string delimiter."

</details>

---

## Final Check

| Feature | How to verify |
|---------|--------------|
| Program compiles without errors | `g++ -std=c++17 -o dungeon main.cpp` — no output = success |
| Title screen prints | Run `./dungeon` — see the ASCII art box |
| Title box is aligned | All `║` characters line up vertically |
| Name prompt appears | Run, see `What is your name, brave adventurer?` |
| Welcome message uses the entered name | Type `Erevan`, see `Welcome, Erevan!` |
| Program waits for ENTER before exiting | After welcome, press ENTER — program exits cleanly |

---

## Quick Check Answers

**1. What does `#include <iostream>` do, and why does every C++ program need it?**
`#include` is a preprocessor directive that copies the contents of the named
header file into your `.cpp` file before compilation. `iostream` (input/output
stream) defines `std::cout`, `std::cin`, and `std::endl`. Without it, the
compiler does not know what those names mean and will throw an error:
`'cout' was not declared in this scope`.

**2. What do you think happens if you forget the semicolon at the end of a line?**
A compile-time error. C++ requires every statement to end with a semicolon.
The compiler error will point to the line AFTER the missing semicolon (because
it sees the next line as a continuation of the previous broken statement).
This is a very common beginner confusion: the error line number is off-by-one
from the actual problem.

**3. Prediction: in Python `print("hello")` — what does the C++ equivalent look like?**
`std::cout << "hello" << std::endl;`
The `<<` operator feeds the string literal into the output stream. `std::endl`
adds the newline that Python's `print()` adds automatically. An alternative
is `std::cout << "hello\n";` using a newline escape character, which is
slightly faster because it does not flush the stream.
