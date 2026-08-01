# Lesson 11: A Breakpoint Is a Question You Get to Ask the Running Program
### (LAB 11 — Debugging with gdb)

**What you will build:** A real gdb session — breakpoints inside a loop, watching a variable change step by step, and a real backtrace on a real, deliberately-reproduced segfault (`S-01-CPP-FOUNDATIONS` LAB-08's own dangling pointer, revisited). The transferable problem: every bug this entire curriculum has diagnosed so far was diagnosed by reading code and reasoning, or by adding a temporary `std::cout` line and recompiling. That works, but it requires guessing where to look *before* running the program. A debugger lets you pause a running program at an exact point and ask it directly — what's in this variable, right now, on this exact call?

**What you need to know first:** Nothing new conceptually — this lesson is a tool, not a language feature. `S-01-CPP-FOUNDATIONS` LAB-08's own dangling-pointer crash, revisited directly with a debugger instead of reasoning alone.

**Terms introduced in this lesson**

> **Debugger** — a tool that runs a program under its control, able to pause execution, inspect memory and variables, and step through code line by line.
> **Breakpoint** — a specific line or function marked to pause execution the instant it's reached.
> **Stepping** — advancing execution one line at a time; **step** enters a called function, **next** runs it to completion and stops after the call.
> **Backtrace** — the list of function calls currently active, from where execution stopped back to `main` — the debugger's own view of the call stack (`S-01-CPP-FOUNDATIONS` LAB-05).
> **`-g`** — a compiler flag embedding debug information (variable names, source line mappings) into the compiled binary, required for a debugger to show meaningful source-level information.

No pipeline diagram applies — this bridge series builds standalone concept programs.

---

## Concept Unit 1: Compiling With Debug Info

### The Problem

A debugger needs to map raw machine instructions back to source lines and variable names — none of that exists in a compiled binary by default; it has to be requested explicitly.

### Project Change

- **Reference Source:** `S-01-CPP-FOUNDATIONS` LAB-00's own Makefile, which already included `-g` in `CXXFLAGS` without full explanation.
- **Files affected:** None — a compiler flag, not new code.
- **Change type:** N/A.
- **Location:** The compile command.
- **Dependencies:** None.

### Explanation

`g++ -g -std=c++17 -Wall -Wextra main.cpp -o dungeon` — the same command this entire curriculum has run, with `-g` added. Without it, a debugger can still technically attach to a running program, but sees only raw machine addresses — no variable names, no source lines, nothing legible. `-g` embeds a separate section of debug information into the compiled binary: which machine addresses correspond to which source lines, and which memory locations correspond to which variable names.

### CS Lens

Debug information is a real, if usually invisible, part of a compiled binary — `S-01-CPP-FOUNDATIONS` LAB-00's own three-stage toolchain (preprocessor, compiler, linker) already produces it whenever `-g` is present; nothing about this lesson requires a different build than every prior lesson has already been using.

### SE Lens

Release builds of real software often strip debug information entirely (a separate, later step, not exercised here) — smaller binaries, and no internal variable names or source paths exposed to anyone examining the shipped executable. Development builds, including every build this curriculum has made, keep it, specifically so a debugger remains useful throughout development.

### Connection

Concept Unit 2 uses this debug information for real, pausing a running program at an exact line.

---

## Concept Unit 2: Breakpoints and Inspecting Variables

### The Problem

`S-01-CPP-FOUNDATIONS` LAB-05's own `calculateDamage` example was understood entirely by reading its code and reasoning about what it does with given inputs — nothing let you pause it mid-execution and ask what `attack` and `defense` actually held on a specific call.

### Project Change

- **Reference Source:** `S-01-CPP-FOUNDATIONS` LAB-05's own `calculateDamage` function.
- **Files affected:** `main.cpp` — new file for this lesson.
- **Change type:** Add (new file, reusing known logic).
- **Location:** Whole file.
- **Dependencies:** `-g` (Concept Unit 1).

### The New Code

```cpp
#include <iostream>
int calculateDamage(int attack, int defense) {
    int damage = attack - defense;
    if (damage < 0) damage = 0;
    return damage;
}
int main() {
    int totalDamage = 0;
    for (int i = 0; i < 3; ++i) {
        int dmg = calculateDamage(10 + i, 3);
        totalDamage += dmg;
        std::cout << "hit " << i << " dealt " << dmg << std::endl;
    }
    std::cout << "total: " << totalDamage << std::endl;
    return 0;
}
```

### Concept Lab

No separate throwaway: this real program, debugged below, is already the smallest useful demonstration.

Run it — verified this session:

```
$ g++ -g -std=c++17 -Wall -Wextra main.cpp -o dungeon
$ gdb -batch -ex "break calculateDamage" -ex "run" -ex "print attack" -ex "print defense" -ex "continue" ./dungeon.exe
Breakpoint 1 at 0x1400016de: file main.cpp, line 3.

Thread 1 hit Breakpoint 1, calculateDamage (attack=10, defense=3) at main.cpp:3
3	    int damage = attack - defense;
$1 = 10
$2 = 3
hit 0 dealt 7

Thread 1 hit Breakpoint 1, calculateDamage (attack=11, defense=3) at main.cpp:3
3	    int damage = attack - defense;
```

What that proves: `break calculateDamage` set a **breakpoint** on that function's first line; `run` started the program, which paused *automatically*, mid-execution, the instant `calculateDamage` was entered — gdb reports the exact arguments this specific call received (`attack=10, defense=3`), matching the loop's first iteration (`10 + 0`). `print attack` and `print defense` confirmed those exact values by direct query, not by reading the source and inferring them. `continue` resumed execution — which ran to completion of that call, printed `"hit 0 dealt 7"`, then immediately hit the *same* breakpoint again on the loop's second iteration, now reporting `attack=11` — `S-01-CPP-FOUNDATIONS` LAB-04's own loop-invariant idea, made directly observable: the same breakpoint, hit multiple times, showing the exact value each iteration actually used.

### Mechanical Walkthrough

- `break calculateDamage` — **(a) first appearance.** Sets a **breakpoint** at a named function's entry — execution will pause there every time it's called, not just once.
- `run` — **(a) first appearance.** Starts the program under gdb's control.
- `print attack` — **(a) first appearance.** Queries the current value of a variable (or any expression) in the currently-paused scope — `$1`, `$2` are gdb's own numbered history of query results, referenceable in later commands (not exercised further in this lesson).
- `continue` — **(a) first appearance.** Resumes execution until the next breakpoint (or the program's natural end).

### CS Lens

A breakpoint works by the debugger temporarily replacing the target instruction with a special trap instruction, which, when executed, hands control back to the debugger instead of the program — invisible to the program itself, which has no way to detect it's being debugged through ordinary execution (special-purpose detection tricks exist but are out of this lesson's scope).

### SE Lens

Pausing inside a loop and seeing the *actual* sequence of argument values, iteration by iteration, is strictly more reliable than reasoning about what a loop "should" produce — the same "verify, don't assume" discipline this bridge series' every lesson has already practiced through actually compiling and running code, now applied at the level of a single running process's internal state.

### Connection

Concept Unit 3 moves one line at a time through a function's own body, rather than jumping between breakpoints.

---

## Concept Unit 3: Stepping — `next`, `step`, `finish`

### The Problem

A breakpoint pauses at one specific line — understanding *how* a value changes across several lines within one function call needs a way to advance one statement at a time.

### Concept Lab

No separate throwaway: run directly below, against Concept Unit 2's own real program.

Run it — verified this session:

```
$ gdb -batch -ex "break calculateDamage" -ex "run" -ex "next" -ex "print damage" -ex "next" -ex "print damage" -ex "finish" ./dungeon.exe
Breakpoint 1 at 0x1400016de: file main.cpp, line 3.

Thread 1 hit Breakpoint 1, calculateDamage (attack=10, defense=3) at main.cpp:3
3	    int damage = attack - defense;
4	    if (damage < 0) damage = 0;
$1 = 7
5	    return damage;
$2 = 7
0x00007ff7534b172c in main () at main.cpp:10
10	        int dmg = calculateDamage(10 + i, 3);
Value returned is $3 = 7
```

What that proves: `next` (stepping over line 3) advanced to line 4, and `print damage` confirmed `7` — `10 - 3`, computed correctly. A second `next` advanced to line 5 (`return damage;`), with `damage` still `7` — no change occurred on line 4's `if`, since `7` was never negative. `finish` ran the rest of `calculateDamage` to completion and returned control to `main`, reporting the actual **return value**, `7` — confirming not just that the function returned, but exactly what it handed back to its caller.

### Mechanical Walkthrough

- `next` — **(a) first appearance.** Executes the current line and stops at the next one, *without* entering any function calls that line makes (a call on that line runs to completion invisibly).
- `step` — mentioned, not directly exercised in this transcript: the counterpart to `next` that *does* enter a called function, pausing at its first line — the tool for "I want to see inside this specific call," where `next` is "run this call, I trust it, show me what happens after."
- `finish` — **(a) first appearance.** Runs the remainder of the *current* function to completion, stopping back in its caller, and reports the return value directly.

### CS Lens

`next` versus `step`'s distinction is exactly `S-01-CPP-FOUNDATIONS` LAB-05's own call stack, navigated interactively: `step` pushes a new frame onto the debugger's own view and follows it in; `next` treats the called function as opaque, staying at the current frame's depth.

### Connection

Concept Unit 4 uses this exact machinery on a real crash — not a function returning normally, but a program terminating unexpectedly.

---

## Concept Unit 4: `backtrace` — Diagnosing a Real Crash

### The Problem

`S-01-CPP-FOUNDATIONS` LAB-08 proved, by reasoning and by observing a segfault, that returning the address of a local variable produces a dangling pointer. A debugger should be able to show, directly, exactly where such a crash happens and how execution got there — without needing to have predicted the bug in advance.

### Project Change

- **Reference Source:** `S-01-CPP-FOUNDATIONS` LAB-08's own `createDanger()` — the identical dangling-pointer bug, revisited with a debugger instead of reasoning alone.
- **Files affected:** `crash.cpp` — new file for this lesson (kept separate from the main project, since it's deliberately broken).
- **Change type:** Add (new file, reproducing a known bug).
- **Location:** Whole file.
- **Dependencies:** `S-01-CPP-FOUNDATIONS` LAB-08's own verified crash.

### The New Code

```cpp
#include <iostream>
int* createDanger() {
    int localVar = 42;
    return &localVar;
}
void useIt() {
    int* p = createDanger();
    std::cout << *p << std::endl;
}
int main() {
    useIt();
    return 0;
}
```

### Concept Lab

No separate throwaway: this real, deliberately-broken program, debugged below, is the demonstration.

Run it — verified this session:

```
$ g++ -g -std=c++17 -Wall -Wextra crash.cpp -o crash
crash.cpp:4:12: warning: address of local variable 'localVar' returned [-Wreturn-local-addr]

$ gdb -batch -ex "run" -ex "backtrace" ./crash.exe

Thread 1 received signal SIGSEGV, Segmentation fault.
0x00007ff6d98216ff in useIt () at crash.cpp:8
8	    std::cout << *p << std::endl;
#0  0x00007ff6d98216ff in useIt () at crash.cpp:8
#1  0x00007ff6d982173d in main () at crash.cpp:11
```

What that proves: no breakpoint was set at all — the program simply crashed, gdb caught the operating-system-level signal (`SIGSEGV`, `S-01-CPP-FOUNDATIONS` LAB-08's own named crash type) *automatically*, and paused there. The crash location is reported precisely: `useIt()`, `crash.cpp:8`, the exact `*p` dereference. `backtrace` lists every active call: `#0` (the innermost, where the crash happened, `useIt`) and `#1` (its caller, `main`) — the actual, real call chain that led to the crash, read directly from the paused program's own stack, not reconstructed by guessing.

### Mechanical Walkthrough

- `SIGSEGV` caught automatically, with no breakpoint set — **(a) first appearance of a debugger catching an operating-system signal rather than a manually-placed breakpoint.** gdb attaches to the process regardless, and the OS delivering a fault signal (`S-01-CPP-FOUNDATIONS` LAB-08's own explanation of what a segfault actually is) is itself an event gdb intercepts.
- `backtrace` — **(a) first appearance.** Lists every currently-active stack frame, most recent first — the debugger's own direct view of `S-01-CPP-FOUNDATIONS` LAB-05's call stack, at the exact moment of the crash.

### CS Lens

A backtrace at the moment of a crash is strictly more information than "the program crashed" — it names the *exact* function and line, and the *exact* chain of calls that reached it, collapsing what could otherwise be a search through an entire codebase into a direct pointer at the responsible code.

### SE Lens

This is the practical payoff of everything this lesson built up to: a crash discovered in a real, larger program — not a small, deliberately-reproduced example like this one — is diagnosed the identical way: run it under gdb (or open its **core dump**, a saved snapshot of a crashed process's memory, not exercised directly here but a real, related tool), get a backtrace, and go directly to the responsible line, rather than re-reading the entire codebase guessing where the problem might be.

### Connection

This closes every new mechanism in this lesson — the Closing section connects debugging back to every crash and bug this entire curriculum has already reasoned about by hand.

---

## Closing

### Connect the pieces

Concept Unit 1's `-g` flag — already present, unexplained, in every Makefile this curriculum has used since `S-01-CPP-FOUNDATIONS` LAB-00 — is what made every other mechanism in this lesson possible. Concept Unit 2's breakpoints paused `calculateDamage` at the exact moment of each call, showing real argument values across real loop iterations. Concept Unit 3's stepping commands (`next`, `step`, `finish`) moved through a function's own body one line at a time, confirming a value's evolution directly rather than by re-reading the source and reasoning. Concept Unit 4 applied the identical tool to a real crash — `S-01-CPP-FOUNDATIONS` LAB-08's own dangling pointer, caught automatically, with a backtrace naming the exact crash site and call chain with no prior investigation required.

### What breaks without this

Reasoned through directly: every bug this entire curriculum diagnosed without a debugger — the wrong `.find()` position in `S-01-CPP-FOUNDATIONS` LAB-07, the leaked `Warrior` in this series' own Lesson 2, the reference cycle in Lesson 3 — was diagnosed by adding temporary `std::cout` lines, recompiling, and re-running, repeatedly, until enough state was visible to understand what was happening. That approach works, and this curriculum used it deliberately throughout, specifically to build the habit of *verifying* rather than assuming. But it requires guessing, in advance, which variables and which moments matter enough to print — a debugger removes that guessing: any variable, at any paused moment, is available on demand, after the fact, with no recompilation required to ask a new question.

### Exercises

1. Reproduce Concept Unit 2's breakpoint session yourself, then add a **conditional breakpoint** (`break calculateDamage if attack > 10`) and confirm it only pauses on the loop iterations where that condition actually holds.
2. Reproduce Concept Unit 4's crash yourself, then use `frame 1` (not directly demonstrated in this lesson's own transcript) to move gdb's focus to `main`'s own frame, and `print p` from there — reasoning about, then confirming, what that would show given `p` doesn't exist in `main`'s scope at all.
3. Take a real bug from an earlier lesson in this bridge series (this series' Lesson 6's own erase-while-iterating skip, for instance) and diagnose it with gdb instead of print statements — set a breakpoint inside the loop, step through several iterations, and directly observe the exact moment the skip happens.
4. Compile a program *without* `-g` and attempt the same breakpoint session from Concept Unit 2 — observe, precisely, what information gdb can and cannot show without debug information present, connecting the result back to Concept Unit 1's own explanation of what `-g` actually embeds.

### Definition of done

- [ ] A real gdb session was run against a real compiled program, with at least one breakpoint hit and inspected.
- [ ] A real crash (this lesson's own `crash.cpp`, or an equivalent) was diagnosed with `backtrace`, correctly identifying the exact line and call chain responsible.
- [ ] You can state, from Concept Unit 3's own verified proof, the difference between `next` and `step`, and when each is the right choice.
- [ ] You can explain what `-g` actually embeds in a compiled binary, and what a debugger loses without it (Exercise 4's own verification).
- [ ] All four Exercises completed with real, observed gdb output, including Exercise 3's application of gdb to a genuine earlier bug from this bridge series rather than a freshly-invented one.
- [ ] You can state, honestly, at least one real bug from this entire curriculum that would have been faster to diagnose with a debugger than with the print-and-recompile approach this curriculum otherwise used throughout.
