# Lesson 9: A Build System Describes What to Build, Not How to Type the Command
### (LAB 09 — CMake)

**What you will build:** A real multi-file project — `Character.h`/`Character.cpp`, `main.cpp` — configured and built entirely through CMake instead of a hand-typed `g++` command or `S-01-CPP-FOUNDATIONS` LAB-00's own toy Makefile, with warnings enabled through CMake itself and incremental rebuilds verified to only recompile what actually changed. The transferable problem: every lesson in this entire curriculum, from `S-01-CPP-FOUNDATIONS` LAB-00 onward, has compiled with one file, one `g++` command, or a Makefile with exactly one rule. A real project has many source files, needs to build the same way on a teammate's machine as on yours, and needs its warnings, standard version, and structure declared once, not retyped at every terminal. CMake is the tool nearly every real C++ project uses to describe all of that, once, in a file a build tool then reads.

**What you need to know first:** `S-01-CPP-FOUNDATIONS` LAB-00 — the compile/link model, Makefiles, `-Wall -Wextra`. `S-02-CPP-DSA-MASTERY` LAB-01 — splitting a project into header (`.h`) and source (`.cpp`) files.

**Terms introduced in this lesson**

> **CMake** — a cross-platform tool that reads a project description (`CMakeLists.txt`) and generates the actual build files (Makefiles, on this toolchain) for a specific platform and compiler.
> **`CMakeLists.txt`** — the file describing a CMake project: its name, required C++ standard, source files, and build targets.
> **Configure step** — running `cmake -B <dir>`, which reads `CMakeLists.txt` and generates build files into `<dir>`, without compiling anything yet.
> **Build step** — running `cmake --build <dir>`, which invokes the actual compiler according to the generated build files.
> **Out-of-source build** — keeping generated build files in a separate directory from the source code, so the source tree itself stays clean.
> **Target** — a named thing CMake builds — an executable (`add_executable`) or a library — with its own sources, options, and dependencies.

No pipeline diagram applies — this bridge series builds standalone concept programs; this lesson's own project is the first genuinely multi-file one.

---

## Concept Unit 1: The Problem — a Hand-Typed Command Doesn't Scale

### The Problem

`S-01-CPP-FOUNDATIONS` LAB-00's Makefile had exactly one rule, compiling exactly one file. A project with several `.cpp` files, needing consistent warnings and a consistent C++ standard version across all of them, on potentially different machines with different installed compilers, needs something that describes the build once, not a command retyped (and potentially mistyped, inconsistently, machine to machine) every time.

### No isolated code lab for this step

The problem is felt directly by attempting the alternative — extending `S-01-CPP-FOUNDATIONS` LAB-00's own approach to more files — not by an invented illustration.

### Explanation

`g++ main.cpp Character.cpp -o dungeon -std=c++17 -Wall -Wextra` already works for two files — but every new file means editing this command, by hand, everywhere it's run: a teammate's terminal, a CI system, a script. `S-01-CPP-FOUNDATIONS` LAB-00's Makefile improves this somewhat (one file lists the command once), but that Makefile's own syntax (tabs, `$(CXX)`, manual `clean` rules) is Unix-specific and hand-maintained — nothing generates it, nothing checks it stays correct as files are added or removed, and it says nothing about what happens on a different operating system or compiler.

### CS Lens

CMake does not compile anything itself — it is a **build system generator**: it reads a description of a project and produces the actual build files (a Makefile, on this toolchain; a Visual Studio project, on Windows with MSVC; an Xcode project, on macOS) for whatever the local platform and installed tools actually are. The same `CMakeLists.txt` produces correct, platform-appropriate build files on every one of them.

### SE Lens

This is the reason nearly every real, multi-file C++ project — libraries, applications, anything meant to be built by more than one person or one machine — uses CMake or a similar tool, rather than a hand-maintained Makefile: the description lives in one place, generates correctly for whoever's building it, and scales to any number of files without the description itself growing more complex per file.

### Connection

Concept Unit 2 writes the smallest real `CMakeLists.txt` and runs the actual two-step build process this lesson's every project uses from here forward.

---

## Concept Unit 2: `CMakeLists.txt` — Configure, Then Build

### The Problem

Nothing exists yet describing this project to CMake at all — the smallest possible version needs to exist and actually build something before anything more complex is added.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `CMakeLists.txt` — new file; `main.cpp` — new file for this lesson.
- **Change type:** Add (new files).
- **Location:** Project root.
- **Dependencies:** CMake itself, installed and on PATH (verified this session: version 3.31.5).

### The New Code

```cmake
cmake_minimum_required(VERSION 3.15)
project(DungeonPartyManager)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

add_executable(dungeon main.cpp)
```

```cpp
// main.cpp
#include <iostream>
int main() {
    std::cout << "Hello from CMake!" << std::endl;
    return 0;
}
```

### Concept Lab

No separate throwaway: this real, minimal project, configured and built below, is the smallest possible demonstration.

Run it — verified this session:

```
$ cmake -B build -G "MinGW Makefiles"
-- The C compiler identification is GNU 14.2.0
-- The CXX compiler identification is GNU 14.2.0
...
-- Configuring done (13.5s)
-- Generating done (0.1s)
-- Build files have been written to: .../build

$ cmake --build build
[ 50%] Building CXX object CMakeFiles/dungeon.dir/main.cpp.obj
[100%] Linking CXX executable dungeon.exe
[100%] Built target dungeon

$ ./build/dungeon.exe
Hello from CMake!
```

What that proves: two distinct steps — **configure** (`cmake -B build`, reading `CMakeLists.txt`, detecting the compiler, and generating real Makefiles into a `build/` directory it creates) and **build** (`cmake --build build`, invoking those generated Makefiles, which in turn invoke `g++` — the identical compiler this entire curriculum has used since `S-01-CPP-FOUNDATIONS` LAB-00, now invoked by CMake's own generated files instead of typed directly). The project's own source files (`main.cpp`, `CMakeLists.txt`) stay untouched by this process — every generated file lives inside `build/`, an **out-of-source build**: deleting `build/` entirely and reconfiguring reproduces the exact same result, with nothing generated ever mixed into the real source tree.

### Mechanical Walkthrough

- `cmake_minimum_required(VERSION 3.15)` — **(a) first appearance.** States the oldest CMake version this file's own syntax is written for — CMake itself refuses to proceed if the installed version is older, rather than failing confusingly partway through.
- `project(DungeonPartyManager)` — **(a) first appearance.** Names the project — used in generated build-file metadata, IDE integration, and later CMake features not exercised in this lesson.
- `set(CMAKE_CXX_STANDARD 17)` / `set(CMAKE_CXX_STANDARD_REQUIRED ON)` — **(a) first appearance.** The CMake-level replacement for typing `-std=c++17` on every `g++` invocation by hand (`S-01-CPP-FOUNDATIONS` LAB-00) — declared once, applied to every source file this project compiles.
- `add_executable(dungeon main.cpp)` — **(a) first appearance.** Declares a **target** named `dungeon`, built from `main.cpp` — the CMake-level replacement for `g++ main.cpp -o dungeon`.

### CS Lens

The configure step doing real, non-trivial work (detecting the compiler, checking it actually works, probing its capabilities — visible in the `"Detecting CXX compiler ABI info"` lines above) before any build file is even generated is why configuring is a separate step from building — that detection work only needs to happen once, cached in `build/`, not repeated on every single build afterward.

### SE Lens

Every command in this lesson from here forward assumes this two-step shape: reconfigure (`cmake -B build`) only when `CMakeLists.txt` itself changes; rebuild (`cmake --build build`) for every ordinary source-code change — the same "check what actually needs redoing" discipline `S-01-CPP-FOUNDATIONS` LAB-00's own Makefile already established for a single file, now scaled to an entire project's configuration.

### Connection

Concept Unit 3 adds a real second source file — the multi-file case this whole lesson exists for.

---

## Concept Unit 3: Multiple Source Files — a Real `.h`/`.cpp` Split

### The Problem

`main.cpp` alone doesn't demonstrate anything a single `g++` command couldn't already do. A project needs at least one more file — the `.h`/`.cpp` split `S-02-CPP-DSA-MASTERY` LAB-01 already taught — to show CMake actually managing a multi-file build.

### Project Change

- **Reference Source:** `S-02-CPP-DSA-MASTERY` LAB-01's own `.h`/`.cpp` declaration/definition split, and this series' own `Character` class (Lesson 1–2).
- **Files affected:** `Character.h`, `Character.cpp` — new files; `main.cpp`, `CMakeLists.txt` — modified.
- **Change type:** Add (two new files) + Replace (`add_executable`'s source list).
- **Location:** Project root.
- **Dependencies:** `S-02-CPP-DSA-MASTERY` LAB-01's header guard, `virtual`/`override` (this series' Lesson 2).

### The New Code

```cpp
// Character.h
#ifndef CHARACTER_H
#define CHARACTER_H
#include <string>
class Character {
protected:
    std::string name;
public:
    Character(const std::string& n) : name(n) {}
    virtual void describe() const;
    virtual ~Character() = default;
};
#endif
```

```cpp
// Character.cpp
#include "Character.h"
#include <iostream>
void Character::describe() const {
    std::cout << "[Character] " << name << std::endl;
}
```

```cmake
add_executable(dungeon
    main.cpp
    Character.cpp
)

target_compile_options(dungeon PRIVATE -Wall -Wextra)
```

### The Updated Project

```cpp
// main.cpp
#include "Character.h"
int main() {
    Character c("Zara");
    c.describe();
    return 0;
}
```

```cmake
cmake_minimum_required(VERSION 3.15)
project(DungeonPartyManager)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

add_executable(dungeon
    main.cpp
    Character.cpp
)

target_compile_options(dungeon PRIVATE -Wall -Wextra)
```

### Concept Lab

No separate throwaway: this real, two-source-file project, configured and built below, is the demonstration.

Run it — verified this session:

```
$ cmake -B build -G "MinGW Makefiles"
...
$ cmake --build build
[ 33%] Building CXX object CMakeFiles/dungeon.dir/main.cpp.obj
[ 66%] Building CXX object CMakeFiles/dungeon.dir/Character.cpp.obj
[100%] Linking CXX executable dungeon.exe
[100%] Built target dungeon

$ ./build/dungeon.exe
[Character] Zara
```

What that proves: both `main.cpp` and `Character.cpp` compiled into separate object files (`.obj`, this toolchain's own object-file extension), then linked together into one executable — precisely `S-01-CPP-FOUNDATIONS` LAB-00's own compile-then-link model, now driven by CMake-generated build files instead of a hand-typed sequence.

### Mechanical Walkthrough

- `add_executable(dungeon main.cpp Character.cpp)` — **(c) reusing** the same command from Concept Unit 2, now given a real list of two files instead of one — every entry compiles separately, then links into the one named target.
- `target_compile_options(dungeon PRIVATE -Wall -Wextra)` — **(a) first appearance.** Attaches compiler flags specifically to the `dungeon` target — the CMake-level replacement for typing `-Wall -Wextra` on every `g++` invocation, applied uniformly to every source file this target compiles, with `PRIVATE` marking these flags as only affecting `dungeon` itself, not anything that might depend on it (relevant once a project has more than one target — not exercised further in this lesson).

### CS Lens

Explicitly listing every source file (`main.cpp`, `Character.cpp`) rather than using a wildcard/glob pattern to find them automatically is a deliberate CMake convention, not an oversight: a glob-based file list can silently miss a newly-added file if the build system doesn't know to re-scan the directory, where an explicit list makes every file CMake will compile visible directly in `CMakeLists.txt` itself, and adding a new file means a one-line, obvious edit.

### SE Lens

`target_compile_options` attached to a specific target, rather than a global flag set applied to everything, is what lets a real project (not exercised further here, but worth naming) apply stricter warnings to its own code while leaving third-party dependencies compiled with their own, different settings — a real, common need once a project depends on code it doesn't own.

### Connection

Concept Unit 4 verifies the real payoff of a generated build system over a hand-typed command — genuinely correct incremental rebuilds.

---

## Concept Unit 4: Incremental Rebuilds — Verified, Not Assumed

### The Problem

`S-01-CPP-FOUNDATIONS` LAB-00 proved a simple Makefile correctly skips recompiling when nothing changed. Does CMake's generated build system provide the identical guarantee for a real, multi-file project — and does it correctly limit recompilation to only the file that actually changed?

### Concept Lab

No separate throwaway: this real project's own build, run three ways below, is the demonstration.

Run it — verified this session:

```
$ cmake --build build
[100%] Built target dungeon
```

Nothing changed since Concept Unit 3's own build — zero recompilation, zero relinking, exactly `S-01-CPP-FOUNDATIONS` LAB-00's own "up to date" guarantee. Now, editing only `main.cpp` (verified this session with `touch main.cpp`, standing in for a real edit):

```
$ cmake --build build
[ 33%] Building CXX object CMakeFiles/dungeon.dir/main.cpp.obj
[ 66%] Linking CXX executable dungeon.exe
[100%] Built target dungeon
```

What that proves: only `main.cpp.obj` rebuilt — `Character.cpp.obj`, untouched by the edit, was **not** recompiled at all, confirmed by its own line simply not appearing in this build's output. The final link step still ran (it must — the executable itself depends on both object files, and `main.cpp.obj` changed), but the more expensive compilation step ran only for the file that actually needed it. A deliberately warning-triggering edit to `main.cpp` (an unused variable, `S-01-CPP-FOUNDATIONS` LAB-02's own category of warning) surfaced correctly, through the exact `target_compile_options` flags set in Concept Unit 3:

```
$ cmake --build build
[ 33%] Building CXX object CMakeFiles/dungeon.dir/main.cpp.obj
main.cpp: In function 'int main()':
main.cpp:5:9: warning: unused variable 'unused' [-Wunused-variable]
...
[100%] Built target dungeon
```

### Mechanical Walkthrough

- The absence of a `"Building CXX object ... Character.cpp.obj"` line on the second build — **(a) first appearance of verified per-file incremental compilation in a generated (not hand-written) build system.** CMake's generated Makefiles track each object file's own dependency (its source file, and every header it `#include`s) independently — editing `Character.h` alone, not exercised directly here but a real consequence of this same tracking, would correctly trigger recompiling *both* `Character.cpp` (which includes it directly) and anything else that includes it, without recompiling files that don't.

### CS Lens

This is `S-01-CPP-FOUNDATIONS` LAB-00's own timestamp-comparison mechanism, scaled correctly to a real multi-file dependency graph — each `.obj` file's build rule depends on its own `.cpp` file *and* every header that file (transitively) includes, tracked automatically by the generated Makefile, not manually maintained the way `S-01-CPP-FOUNDATIONS` LAB-00's own single-file Makefile never needed to consider at all.

### SE Lens

For a project of two files, the difference between "recompile everything" and "recompile only what changed" is invisible — a fraction of a second either way. For a real project with dozens or hundreds of source files, this exact mechanism, verified here at the smallest possible scale, is what keeps a single one-line edit's rebuild taking seconds instead of minutes — the same "invisible until it scales" theme this entire bridge series keeps returning to, now demonstrated for build systems specifically.

### Connection

This closes every new mechanism in this lesson — the Closing section connects the full build description to every multi-file concept this bridge series (and `S-02-CPP-DSA-MASTERY` before it) has already built.

---

## Closing

### Connect the pieces

`S-01-CPP-FOUNDATIONS` LAB-00 taught the compile/link model with one file and one hand-typed command; `S-02-CPP-DSA-MASTERY` LAB-01 split a project into a `.h`/`.cpp` pair, compiled with three explicit `g++` commands. This lesson's `CMakeLists.txt` (Concept Unit 2) described that identical model — compiler standard, warnings, source files — once, in a file a tool reads rather than a human retypes. Concept Unit 3 proved it scales correctly to a real two-file project, built through the identical configure-then-build two-step process regardless of how many files are added. Concept Unit 4 verified, not assumed, that CMake's generated build files provide the exact same "only rebuild what changed" guarantee `S-01-CPP-FOUNDATIONS` LAB-00's own toy Makefile provided for one file — now correctly scoped per-file, automatically, for a project with real internal dependencies between source and header files.

### What breaks without this

Reasoned through directly: a project that stayed with `S-01-CPP-FOUNDATIONS` LAB-00's own hand-maintained Makefile approach, scaled up to ten or twenty real source files, would need its Makefile's dependency rules maintained by hand — every new file added, every new `#include` relationship, would need a human to update the Makefile correctly, or risk exactly the kind of stale-build bug where an edited header doesn't trigger recompilation of everything that includes it. CMake's generated build files track this automatically, verified directly in Concept Unit 4 — the dependency graph is derived from the actual `#include` relationships in the code, not maintained separately from it.

### Exercises

1. Add a third source file (`Mage.h`/`Mage.cpp`, this series' own Lesson 1/2 class) to the project, add it to `add_executable`'s source list, reconfigure, and rebuild — confirm it compiles and links correctly alongside the existing files.
2. Edit only `Character.h` (not `.cpp`) — add a new method declaration, for instance — and rebuild; confirm, from the build output, that `Character.cpp` (which includes it) recompiles, and reason about why `main.cpp` would also need to recompile if it uses that new method, even though `main.cpp` itself wasn't directly edited.
3. Delete the entire `build/` directory and reconfigure from scratch — confirm the project builds identically, proving nothing about the previous build's correctness depended on any file inside `build/` surviving.
4. Add a second target — a small, separate `add_executable` for a standalone test program (previewing this bridge series' own upcoming testing lesson) — and confirm both targets build independently with `cmake --build build`, each producing its own executable.

### Definition of done

- [ ] The project has a real `CMakeLists.txt` describing at least two source files, the C++ standard version, and compiler warning flags.
- [ ] `cmake -B build && cmake --build build` succeeds with zero warnings, and `./build/dungeon.exe` (or `build\dungeon.exe` on Windows) runs correctly.
- [ ] A second, no-op `cmake --build build` reports nothing rebuilt; an edit to exactly one source file rebuilds only that file, verified by reading the actual build output, not assumed.
- [ ] You can state, from Concept Unit 2's own verified proof, the difference between the configure step and the build step, and why they're separate.
- [ ] You can explain why source files are listed explicitly in `add_executable` rather than discovered automatically, using Concept Unit 3's own reasoning.
- [ ] All four Exercises completed with real, observed build output, including Exercise 2's header-change recompilation trace.
- [ ] Commit: `git add CMakeLists.txt main.cpp Character.h Character.cpp && git commit -m "S03-LAB-09: CMake build replacing hand-typed g++ commands, verified incremental rebuilds"` — states why (a real, scalable, dependency-aware build description, verified correct) not just what changed. (Do not commit the `build/` directory itself — it is generated output, the CMake equivalent of `S-01-CPP-FOUNDATIONS` LAB-00's own compiled `.exe`, never committed to version control.)
