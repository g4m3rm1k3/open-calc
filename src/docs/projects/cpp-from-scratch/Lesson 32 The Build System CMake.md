# Lesson 32: The Build System - CMake

**What you will build** — A multi-file C++ project managed entirely through CMake, producing separate optimized and debugging executables without polluting the source directory. The transferable problem this lesson solves is how to systematically tell a compiler about multiple source files, header search paths, dependencies, and optimization flags without typing brittle, enormous terminal commands by hand.

**What you need to know first** — Lesson 15 Namespaces and Header Files (how headers and source files separate declarations from definitions).

**Terms used in this lesson**
- **CMake** — a build system generator. *Why it exists:* to read a high-level description of your project and automatically generate the low-level, platform-specific build scripts (like Makefiles or Visual Studio project files) needed to actually compile it, isolating you from platform differences.
- **Target** — a logical entity in a CMake build, usually an executable or a library. *Why it exists:* to act as an isolated container for source files and settings, so you can apply configuration to just one part of your project without affecting the rest.
- **Out-of-source build** — the practice of keeping all generated build files in a separate directory from your source code. *Why it exists:* so you can cleanly delete the build artifacts (the "build directory") without risking your source code, and so you never accidentally commit generated binaries to version control.
- **Build Type** — a named configuration profile (like Debug or Release) that controls how the code is built. *Why it exists:* to let you instantly switch between a version optimized for developer inspection (slow, but includes line numbers and variable names) and a version optimized for production (fast, heavily transformed by the compiler).

**Objects and methods used**
- **cmake_minimum_required**
  - *What it is:* A CMake command that sets the lowest version of CMake permitted to process the file.
  - *Implementation:* `cmake_minimum_required(VERSION <min>)`
  - *Its use:* To stop older, incompatible versions of CMake from attempting to build the project and failing later with confusing syntax errors.
- **project**
  - *What it is:* A CMake command that names the overall project.
  - *Implementation:* `project(<PROJECT-NAME> LANGUAGES <language-name>...)`
  - *Its use:* To initialize CMake's internal state, enable the correct compiler (C++), and define standard variables based on the project name.
- **add_executable**
  - *What it is:* A CMake command that defines a new executable target.
  - *Implementation:* `add_executable(<name> [source1] [source2] ...)`
  - *Its use:* To tell CMake to compile the listed source files into a final, runnable program with the given name.
- **target_include_directories**
  - *What it is:* A CMake command that adds directories to the compiler's include search path for a specific target.
  - *Implementation:* `target_include_directories(<target> <PRIVATE|PUBLIC|INTERFACE> <dir>...)`
  - *Its use:* So that `#include "my_header.h"` can locate files in designated folders without you having to write fragile, hardcoded relative paths like `../../include/my_header.h` in your C++ code.
- **add_library**
  - *What it is:* A CMake command that defines a new library target.
  - *Implementation:* `add_library(<name> STATIC [source1] [source2] ...)`
  - *Its use:* To group source files into a static library archive that can be linked by other targets, instead of building a standalone executable.
- **target_link_libraries**
  - *What it is:* A CMake command that declares a dependency between targets.
  - *Implementation:* `target_link_libraries(<target> <PRIVATE|PUBLIC|INTERFACE> <item>...)`
  - *Its use:* To instruct the linker to combine the specified library with your target, resolving any external function or class calls your target makes.

**Everything else in the file, not this lesson's subject but still explained:**
- **set**
  - *What it is:* A CMake command that assigns a value to a variable.
  - *Implementation:* `set(<variable> <value>)`
  - *Its use:* Used here specifically to set `CMAKE_CXX_STANDARD` to 17, forcing the compiler to use modern C++17 rules.

---

## Concept Unit: CMakeLists.txt and Targets

### The Problem
When you write a single `main.cpp`, compiling it is easy: `g++ main.cpp -o app`. But real projects have dozens of source files. Typing `g++ main.cpp user.cpp network.cpp display.cpp...` every time you build is tedious and error-prone. Worse, if you move to a different operating system, the compiler commands might change. We need a single configuration file that describes *what* makes up our program, leaving the *how* to a dedicated tool.

### Isolate the Concept
Create a temporary folder named `cmake_lab`, and inside it create two files: `main.cpp` and `CMakeLists.txt`.

**main.cpp**
```cpp
#include <iostream>

int main() {
    std::cout << "Built by CMake.\n";
    return 0;
}
```

**CMakeLists.txt**
```cmake
cmake_minimum_required(VERSION 3.10)
project(HelloProject LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)

add_executable(HelloApp main.cpp)
```

Run CMake to generate the build files, then run the build:
```bash
cmake -B build
cmake --build build
./build/HelloApp
```

**Output:**
```
Built by CMake.
```
This output proves that CMake successfully read our text file, found the C++ compiler, generated the necessary low-level build scripts in the `build` directory, and orchestrated the compiler to produce a runnable executable named `HelloApp`. This file is called a **CMake configuration script**.

### Discard the Throwaway Example
Delete the `cmake_lab` folder. We will now apply this to the real project structure.

### Project Change
No reference counterpart — this is a from-scratch addition because we are introducing a build system to the codebase.
- **Files created:** `/CMakeLists.txt`
- **Change type:** add
- **Location:** At the absolute root of your project directory.
- **Dependencies:** CMake installed on your system.

### The New Code
```cmake
cmake_minimum_required(VERSION 3.10)
project(Engine LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

add_executable(EngineApp src/main.cpp)
```

### The Updated Project
```
/
├── CMakeLists.txt  // ← new
└── src/
    └── main.cpp
```
The project now has a root-level definition file that formally declares an executable target named `EngineApp`, built from `src/main.cpp`.

### Mechanical Walkthrough
- `cmake_minimum_required(VERSION 3.10)` checks the installed version of CMake. If the user has an older version (like 3.8), CMake immediately stops with a clear error. This prevents mysterious failures later caused by missing modern CMake features.
- `project(Engine LANGUAGES CXX)` initializes the project workspace. It tells CMake the name of the project is "Engine", and that the language we are using is C++ (`CXX`). This causes CMake to actively probe the system to locate the C++ compiler.
- `set(CMAKE_CXX_STANDARD 17)` assigns the value `17` to the built-in variable `CMAKE_CXX_STANDARD`. This is how we instruct the underlying compiler to use the C++17 standard, replacing the need to manually pass `-std=c++17` on the command line.
- `set(CMAKE_CXX_STANDARD_REQUIRED ON)` enforces the previous line. If the compiler does not support C++17, the build fails immediately, rather than silently falling back to C++14 or older.
- `add_executable(EngineApp src/main.cpp)` creates a new **target**. A target is the fundamental unit of work in CMake. This specific target is an executable program named `EngineApp`, and it is built by compiling the source file `src/main.cpp`.

### CS Lens
This embodies declarative configuration. Rather than writing an imperative script of commands to run (`do this, then do that`), you declare the desired end state ("I want an executable named X made of these files"). The build system generator calculates the graph of actions needed to achieve that state.

### SE Lens
The engineering principle is platform abstraction. The alternative not chosen is writing a raw `Makefile` or an `install.bat` script. The tradeoff is learning a new configuration language (CMake) instead of using the shell you already know. The benefit is that this exact same `CMakeLists.txt` will automatically generate Makefiles on Linux, an Xcode project on macOS, and a Visual Studio solution on Windows, without changing a single line of code.

### Commands needed to make this unit real
- `cmake -B build` — `cmake` is the program. `-B build` tells it to generate the build system and place all generated files in a directory named `build`.
- `cmake --build build` — tells CMake to actually invoke whatever build tool it just generated (like `make` or `msbuild`) inside the `build` directory to compile the code.

### Run It
Run the generation and build steps:
```bash
cmake -B build
cmake --build build
```
Output:
```
-- The CXX compiler identification is GNU 11.4.0
-- Check for working CXX compiler: /usr/bin/c++ - skipped
-- Configuring done
-- Generating done
-- Build files have been written to: /path/to/project/build
[ 50%] Building CXX object CMakeFiles/EngineApp.dir/src/main.cpp.o
[100%] Linking CXX executable EngineApp
[100%] Built target EngineApp
```

### Connection
Now that we have a basic target, we need to solve the problem of organizing header files across multiple directories without hardcoding paths.

---

## Concept Unit: Out-of-Source Builds

### The Problem
When a compiler builds a C++ program, it creates intermediate files (object files, dependency graphs) alongside the final executable. If these files are dumped directly next to your source code, your project folder becomes a polluted mess of generated binaries mixed with human-written code. You risk accidentally committing compiled binaries to version control, and "cleaning" the project becomes dangerously equivalent to deleting files randomly in your source directory.

### Isolate the Concept
We will demonstrate this using the `cmake -B` flag on a dummy directory.
Create `dummy/CMakeLists.txt`:
```cmake
cmake_minimum_required(VERSION 3.10)
project(Dummy)
add_executable(app main.cpp)
```
Create `dummy/main.cpp`:
```cpp
int main() { return 0; }
```
Now, run CMake, but explicitly tell it to put the build files in a subfolder named `out`:
```bash
cd dummy
cmake -B out
```
**Output:**
```
-- Build files have been written to: /.../dummy/out
```
Look inside the `dummy` directory. The source files are completely untouched. Look inside `dummy/out`: it contains the `Makefile`, the `CMakeCache.txt`, and the `CMakeFiles` directory. This proves that we can physically separate the act of building from the source code itself.

### Discard the Throwaway Example
Delete the `dummy` folder.

### Project Change
No reference counterpart.
- **Files affected:** None directly. We are changing how we invoke the build.
- **Change type:** configure
- **Location:** The terminal.
- **Dependencies:** The CMake project from the previous unit.

### The New Code
```bash
rm -rf build/
cmake -B build/
```

### The Updated Project
```
/
├── CMakeLists.txt
├── build/          // ← new (generated out-of-source directory)
│   ├── CMakeCache.txt
│   ├── Makefile
│   └── EngineApp   // The final executable
└── src/
    └── main.cpp
```
The project structure now formally treats `build/` as an ephemeral directory that can be safely deleted at any time.

### Mechanical Walkthrough
- `rm -rf build/` completely deletes the existing build directory. Because this is an out-of-source build, deleting this folder is 100% safe. It acts as a perfect "clean" step, destroying all intermediate artifacts without ever touching the source code.
- `cmake -B build/` invokes CMake. The `-B build/` argument explicitly dictates the **Build** directory. CMake will read the `CMakeLists.txt` in the current directory, but it will write every single generated file—including the final executable—into the `build/` folder.

### CS Lens
This embodies the concept of pure functions applied to file systems. The source directory acts as read-only input. The build directory acts as the output. Because the input is never mutated, the build process is significantly more predictable and reproducible.

### SE Lens
The engineering principle is ephemeral artifacts. The alternative not chosen is an "in-source build" where CMake writes its generated files directly next to `CMakeLists.txt`. The immediate tradeoff of out-of-source builds is that you must navigate into `build/` to run your program, adding a step. The immense benefit is that you can add `build/` to your `.gitignore` file once, and permanently eliminate the risk of committing a compiled 50MB binary to your repository.

### Commands needed to make this unit real
- `rm -rf <dir>` — (Linux/Mac) forcefully removes a directory and all its contents. On Windows, use `rmdir /s /q <dir>`.

### Run It
```bash
cmake -B build/
ls -a
```
Output:
```
.  ..  build  CMakeLists.txt  src
```

### Connection
With our artifacts safely contained in a build folder, we can now confidently add more complex C++ code, including multiple directories for headers and source files.

---

## Concept Unit: target_include_directories

### The Problem
When you `#include "math/Vector.h"` in `main.cpp`, the compiler needs to know where the `math` directory actually lives. If you move `main.cpp` to a different folder, relative paths like `#include "../../math/Vector.h"` will break immediately. We need a way to tell the compiler, at the project level, exactly which directories act as the root search paths for header files.

### Isolate the Concept
Create a folder `include_lab`. Inside it, create `headers/Printer.h`:
```cpp
#pragma once
#include <iostream>
inline void print() { std::cout << "Header found.\n"; }
```
Create `src/main.cpp`:
```cpp
#include "Printer.h" // Notice there is no path here.

int main() {
    print();
    return 0;
}
```
Create `CMakeLists.txt`:
```cmake
cmake_minimum_required(VERSION 3.10)
project(IncludeLab LANGUAGES CXX)
add_executable(App src/main.cpp)

target_include_directories(App PRIVATE headers)
```

Run it:
```bash
cmake -B build
cmake --build build
./build/App
```
**Output:**
```
Header found.
```
This output proves that even though `main.cpp` asked for `Printer.h` without specifying a path, the compiler found it. It found it because CMake passed an include flag (like `-I headers`) to the compiler based on our `target_include_directories` command.

### Discard the Throwaway Example
Delete the `include_lab` folder.

### Project Change
No reference counterpart.
- **Files created:** `include/core/Logger.h`
- **Files modified:** `CMakeLists.txt`, `src/main.cpp`
- **Change type:** add
- **Location:** Added `target_include_directories` to `CMakeLists.txt`.

### The New Code
**include/core/Logger.h**
```cpp
#pragma once
#include <iostream>

namespace core {
    inline void log(const char* message) {
        std::cout << "[LOG] " << message << "\n";
    }
}
```

**src/main.cpp**
```cpp
#include "core/Logger.h"

int main() {
    core::log("Engine starting up.");
    return 0;
}
```

**CMakeLists.txt**
```cmake
cmake_minimum_required(VERSION 3.10)
project(Engine LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

add_executable(EngineApp src/main.cpp)
target_include_directories(EngineApp PRIVATE include)
```

### The Updated Project
```cmake
// CMakeLists.txt
add_executable(EngineApp src/main.cpp)
target_include_directories(EngineApp PRIVATE include) // ← new
```
The build configuration now explicitly informs the `EngineApp` target that the `include/` directory is a valid search path for headers.

### Mechanical Walkthrough
- `target_include_directories(EngineApp PRIVATE include)` is the command that modifies our target.
- `EngineApp` is the exact name of the target we defined earlier with `add_executable`. We are attaching properties directly to this specific target.
- `PRIVATE` is the visibility specifier. It declares that the `include` directory is needed to compile *this target only*. If another target later depends on `EngineApp`, that target will *not* inherit this include directory. `PRIVATE` means "this is an internal implementation detail of EngineApp."
- `include` is the relative path from the `CMakeLists.txt` file to the directory containing our headers. Because of this line, when `main.cpp` says `#include "core/Logger.h"`, the compiler automatically looks inside `include/` and finds `include/core/Logger.h`.

### CS Lens
This embodies dependency injection at the build level. Rather than the source code hardcoding the absolute path of its dependencies, the environment (CMake) injects the search paths into the compiler. This completely decouples the source file's physical location on disk from the headers it needs to access.

### SE Lens
The engineering principle is interface vs implementation separation. A common C++ project layout places all public `.h` files in a dedicated `include/` folder, and all internal `.cpp` files in a `src/` folder. The tradeoff is having to mirror your directory structure in two places. The benefit is immediate clarity: any file in `include/` is meant to be consumed by other parts of the codebase, while `src/` is strictly internal. `target_include_directories` is the mechanism that makes this layout physically possible to compile.

### Commands needed to make this unit real
No new commands. Rebuild the project using the same `cmake --build` command.

### Run It
```bash
cmake -B build
cmake --build build
./build/EngineApp
```
Output:
```
[LOG] Engine starting up.
```

### Connection
Including headers allows us to compile, but what if `Logger` was massive, contained its own `.cpp` file, and we wanted to compile it as a separate standalone library? We need to link targets together.

---

## Concept Unit: target_link_libraries

### The Problem
As a project grows, compiling every single source file directly into one massive executable becomes incredibly slow. Changing one file forces a recompilation of everything. We need to modularize the codebase: compile smaller, independent components into "libraries", and then stitch (link) those libraries into the final executable.

### Isolate the Concept
Create `link_lab`.
Create `MathLib.cpp`:
```cpp
int add(int a, int b) { return a + b; }
```
Create `main.cpp`:
```cpp
#include <iostream>
int add(int a, int b); // Declaration

int main() {
    std::cout << "Sum: " << add(2, 3) << "\n";
    return 0;
}
```
Create `CMakeLists.txt`:
```cmake
cmake_minimum_required(VERSION 3.10)
project(LinkLab)

add_library(MathLib STATIC MathLib.cpp)
add_executable(App main.cpp)
target_link_libraries(App PRIVATE MathLib)
```

Run it:
```bash
cmake -B build
cmake --build build
./build/App
```
**Output:**
```
Sum: 5
```
This output proves that `main.cpp` successfully called a function defined in a completely separate library. The linker took the compiled `MathLib` and the compiled `App`, saw that `App` needed the `add` function, and mathematically stitched them together to form the final executable.

### Discard the Throwaway Example
Delete the `link_lab` folder.

### Project Change
No reference counterpart.
- **Files created:** `src/Network.cpp`
- **Files modified:** `CMakeLists.txt`, `src/main.cpp`
- **Change type:** add/refactor
- **Location:** Added `add_library` and `target_link_libraries` to `CMakeLists.txt`.

### The New Code
**src/Network.cpp**
```cpp
#include <iostream>

namespace network {
    void connect() {
        std::cout << "Connected to server.\n";
    }
}
```

**src/main.cpp**
```cpp
#include "core/Logger.h"

namespace network {
    void connect(); // Forward declaration for simplicity
}

int main() {
    core::log("Engine starting up.");
    network::connect();
    return 0;
}
```

**CMakeLists.txt**
```cmake
cmake_minimum_required(VERSION 3.10)
project(Engine LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Define the library target
add_library(NetworkLib STATIC src/Network.cpp)

# Define the executable target
add_executable(EngineApp src/main.cpp)
target_include_directories(EngineApp PRIVATE include)

# Link the library into the executable
target_link_libraries(EngineApp PRIVATE NetworkLib)
```

### The Updated Project
```cmake
add_library(NetworkLib STATIC src/Network.cpp) // ← new

add_executable(EngineApp src/main.cpp)
target_include_directories(EngineApp PRIVATE include)

target_link_libraries(EngineApp PRIVATE NetworkLib) // ← new
```
We now have two distinct targets in our build: a library (`NetworkLib`) and an executable (`EngineApp`). The executable specifically relies on the library to resolve its function calls.

### Mechanical Walkthrough
- `add_library(NetworkLib STATIC src/Network.cpp)` creates a new target, but it is a library, not an executable. You cannot run a library directly.
- `NetworkLib` is the name we assign to this new target.
- `STATIC` explicitly defines the type of library. A static library is essentially a compressed zip file of compiled object code. When linked, the linker extracts the needed code and embeds it directly into the final executable.
- `src/Network.cpp` is the source file compiled to build this library.
- `target_link_libraries(EngineApp PRIVATE NetworkLib)` creates the actual bridge. It instructs the linker: "When you are assembling `EngineApp`, take the compiled contents of `NetworkLib` and wire them in."
- `PRIVATE` means `EngineApp` uses `NetworkLib` for its own internal implementation. If another target were to link against `EngineApp` (impossible for an executable, but relevant if `EngineApp` were itself a library), it would not automatically inherit `NetworkLib`.

### CS Lens
This embodies modular compilation and resolution. The compiler translates source files into object files independently. It leaves "holes" for functions it doesn't have the code for yet (like `network::connect()`). The linker is a separate program that runs afterward; it maps the missing symbols in the executable to the concrete implementations provided by the linked libraries.

### SE Lens
The engineering principle is component isolation. The alternative not chosen is listing every single `.cpp` file in the `add_executable` command. The tradeoff of multiple targets is a more complex `CMakeLists.txt`. The immense benefit is caching: if you change `main.cpp`, only `main.cpp` is recompiled. `NetworkLib` is already built, so the linker simply re-attaches it instantly. This is how massive C++ projects keep compilation times manageable.

### Run It
```bash
cmake --build build
./build/EngineApp
```
Output:
```
[LOG] Engine starting up.
Connected to server.
```

### Connection
We have successfully built a modular program. But currently, the compiler is doing exactly what we typed, with no optimization. To make it run fast in production or give us detailed inspection during development, we need Build Types.

---

## Concept Unit: Debug vs Release Configurations

### The Problem
When you are actively writing code, you need the compiler to embed line numbers and variable names into the executable so your debugger can tell you exactly where a crash happened. This makes the executable large and slow. When you ship the code to a user, you want the compiler to brutally optimize the math, discard variable names, and inline functions to make it run as fast as physically possible. You cannot have both at once.

### Isolate the Concept
Create a folder `build_type_lab` and `main.cpp`:
```cpp
#include <iostream>

int main() {
#ifdef NDEBUG
    std::cout << "Release mode: optimizations ON, debug asserts OFF.\n";
#else
    std::cout << "Debug mode: optimizations OFF, debug asserts ON.\n";
#endif
    return 0;
}
```
Create `CMakeLists.txt`:
```cmake
cmake_minimum_required(VERSION 3.10)
project(TypeLab)
add_executable(App main.cpp)
```
Generate and build a **Debug** version:
```bash
cmake -B build_debug -DCMAKE_BUILD_TYPE=Debug
cmake --build build_debug
./build_debug/App
```
**Output:**
```
Debug mode: optimizations OFF, debug asserts ON.
```

Generate and build a **Release** version:
```bash
cmake -B build_release -DCMAKE_BUILD_TYPE=Release
cmake --build build_release
./build_release/App
```
**Output:**
```
Release mode: optimizations ON, debug asserts OFF.
```
This proves that CMake is physically changing the flags passed to the compiler based on the Build Type. In Release mode, CMake automatically defined the `NDEBUG` macro (which disables assertions) and turned on optimization flags (like `-O3`).

### Discard the Throwaway Example
Delete the `build_type_lab` folder.

### Project Change
No reference counterpart.
- **Files affected:** None. We are changing the build invocation command.
- **Change type:** configure
- **Location:** The terminal.
- **Dependencies:** The existing CMake project.

### The New Code
```bash
rm -rf build/
cmake -B build -DCMAKE_BUILD_TYPE=Release
cmake --build build
```

### The Updated Project
The codebase on disk does not change. What changes is the binary generated inside the `build/` directory, which is now heavily optimized for speed rather than debugging.

### Mechanical Walkthrough
- `cmake -B build` tells CMake to generate into the `build` directory, as before.
- `-DCMAKE_BUILD_TYPE=Release` is a command-line override.
- `-D` is CMake's syntax for defining a variable from the command line.
- `CMAKE_BUILD_TYPE` is a built-in CMake variable that specifically controls the configuration.
- `Release` is the value we are assigning. This tells CMake to configure the project using its internal Release profile. For the GCC/Clang compilers, this automatically appends the `-O3` flag (maximum optimization) and `-DNDEBUG` (disable debug assertions).
- If we had passed `Debug` instead, CMake would append `-g` (generate debug symbols) and `-O0` (disable optimizations so the code executes exactly in the order you wrote it, making stepping through it predictable).

### CS Lens
This embodies static program analysis and transformation. In a Release build, the compiler is not merely translating your code; it is analyzing the control flow, predicting behavior, unrolling loops, and deleting code it proves is mathematically redundant. Debug builds forbid this because transforming the code makes it impossible to map the running machine instructions back to your original source lines.

### SE Lens
The engineering principle is deployment profiles. The tradeoff is build time: a Release build takes significantly longer to compile because the optimizer is running intense graph-coloring and path-finding algorithms on your code. The standard industry practice is to use `Debug` exclusively while writing code locally, and use `Release` only when benchmarking performance or building the final artifact for deployment.

### Run It
```bash
./build/EngineApp
```
Output:
```
[LOG] Engine starting up.
Connected to server.
```
The output looks identical, but the internal machine code is fundamentally different—smaller, faster, and stripped of debug metadata.

### Connection
You can now define targets, link them together, dictate their include paths, and control their optimization profiles—the entire lifecycle of translating C++ text into a structured, production-ready artifact.

---

## Connect the Pieces

Trace the lifecycle of our `network::connect()` call:
1. You run `cmake -B build -DCMAKE_BUILD_TYPE=Debug`.
2. CMake reads `CMakeLists.txt`, noting that `NetworkLib` is built from `src/Network.cpp` and `EngineApp` requires `NetworkLib`.
3. CMake generates a Makefile inside `build/` holding instructions to build `NetworkLib` with `-g` (Debug) flags.
4. You run `cmake --build build`.
5. The compiler compiles `src/Network.cpp` into an object file.
6. The compiler compiles `src/main.cpp` into an object file. It successfully finds `network::connect()` because of the forward declaration.
7. The linker runs, taking the `EngineApp` object file, locating the missing `network::connect` implementation inside `NetworkLib`, and binding them together into the final executable.

## What Breaks Without This

Let's break the link. Open `CMakeLists.txt` and delete the link command:
```cmake
# target_link_libraries(EngineApp PRIVATE NetworkLib)
```
Run `cmake --build build`.
**The error:**
```
/usr/bin/ld: CMakeFiles/EngineApp.dir/src/main.cpp.o: in function `main':
main.cpp:(.text+0x18): undefined reference to `network::connect()'
collect2: error: ld returned 1 exit status
```
This is a **linker error** (`ld` is the linker). The compiler succeeded—`main.cpp` compiled fine because it knew `network::connect()` *existed* (the declaration). But when the linker tried to assemble the final program, you never told it to link `NetworkLib`, so it couldn't find the *implementation*. Restore the `target_link_libraries` line to fix it.

## Exercises

1. Change `CMAKE_CXX_STANDARD` to `11`. Run `cmake -B build`. Notice how CMake reconfigures the build system instantly. Change it back to `17`.
2. Add a new file `src/Physics.cpp` with a simple function. Create a new library target named `PhysicsLib` in `CMakeLists.txt`. Link it into `EngineApp` and call the function from `main.cpp`.
3. Build the project in Debug mode, then run the Linux/Mac command `ls -lh build/EngineApp` to see its file size. Then, rebuild in Release mode (`-DCMAKE_BUILD_TYPE=Release`) and check the file size again. The Release binary should be noticeably smaller.

## Definition of Done
- [ ] You have written a `CMakeLists.txt` file from scratch.
- [ ] You have executed an out-of-source build, keeping your source directory clean.
- [ ] You have injected header search paths into a target using `target_include_directories`.
- [ ] You have compiled a separate static library and linked it to an executable using `target_link_libraries`.
- [ ] You have successfully switched between Debug and Release build configurations.
- [ ] You can explain what a CMake target is out loud, in your own words, to someone who hasn't read this lesson.
