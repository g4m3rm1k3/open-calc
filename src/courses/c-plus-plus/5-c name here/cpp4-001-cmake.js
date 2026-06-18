const CMAKE_BASIC_CODE = `# CMakeLists.txt — minimal project
# __OUTPUT__: cmake configured\\nbuild: g++ -std=c++20 -o myapp main.cpp\\n./myapp: Hello from CMake

cmake_minimum_required(VERSION 3.20)
project(MyApp VERSION 1.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)   # use -std=c++20, not -std=gnu++20

# Create an executable target
add_executable(myapp main.cpp)

# Equivalent shell commands:
# mkdir build && cd build
# cmake ..          ← configure (generates Makefiles or Ninja files)
# cmake --build .   ← build (calls make or ninja)
# ./myapp`;

const TARGETS_CODE = `# CMakeLists.txt — libraries and targets
# __OUTPUT__: target mylib built\\ntarget myapp linked to mylib\\nPUBLIC propagates to dependents

cmake_minimum_required(VERSION 3.20)
project(MyProject LANGUAGES CXX)
set(CMAKE_CXX_STANDARD 20)

# Static library target
add_library(mylib STATIC
    src/math.cpp
    src/utils.cpp
)

# Interface: how to use the library
target_include_directories(mylib
    PUBLIC  include/        # consumers see this include dir too
    PRIVATE src/internal/   # only mylib itself uses this
)

target_compile_options(mylib
    PRIVATE -Wall -Wextra -Werror
)

# Executable depends on library
add_executable(myapp main.cpp)
target_link_libraries(myapp PRIVATE mylib)
# PRIVATE: myapp uses mylib but its dependents don't
# PUBLIC:  myapp uses mylib AND propagates to dependents
# INTERFACE: myapp doesn't use it directly but propagates`;

const FIND_PACKAGE_CODE = `# CMakeLists.txt — external dependencies
# __OUTPUT__: found OpenSSL 3.x\\nfound fmt library\\nconfigured with vcpkg toolchain

cmake_minimum_required(VERSION 3.20)
project(MyApp LANGUAGES CXX)
set(CMAKE_CXX_STANDARD 20)

# Find system-installed package
find_package(OpenSSL REQUIRED)
find_package(Threads REQUIRED)

add_executable(myapp main.cpp)

# Link with found packages (using imported targets)
target_link_libraries(myapp PRIVATE
    OpenSSL::SSL
    OpenSSL::Crypto
    Threads::Threads
)

# FetchContent: download dependency at configure time (CMake 3.14+)
include(FetchContent)
FetchContent_Declare(
    fmt
    GIT_REPOSITORY https://github.com/fmtlib/fmt.git
    GIT_TAG        10.2.1
)
FetchContent_MakeAvailable(fmt)
target_link_libraries(myapp PRIVATE fmt::fmt)`;

const MODERN_CMAKE_CODE = `# CMakeLists.txt — modern CMake patterns
# __OUTPUT__: out-of-source build\\nRelease vs Debug configs\\ninstall targets configured

cmake_minimum_required(VERSION 3.20)
project(MyLib VERSION 2.1.0 LANGUAGES CXX)
set(CMAKE_CXX_STANDARD 20)

# Build type (Release, Debug, RelWithDebInfo, MinSizeRel)
if(NOT CMAKE_BUILD_TYPE)
    set(CMAKE_BUILD_TYPE Release)
endif()

add_library(mylib src/mylib.cpp)
target_include_directories(mylib PUBLIC
    $<BUILD_INTERFACE:\${CMAKE_SOURCE_DIR}/include>
    $<INSTALL_INTERFACE:include>
)

# Version info
set_target_properties(mylib PROPERTIES
    VERSION \${PROJECT_VERSION}
    SOVERSION \${PROJECT_VERSION_MAJOR}
)

# Install rules
include(GNUInstallDirs)
install(TARGETS mylib EXPORT MyLibTargets
    LIBRARY DESTINATION \${CMAKE_INSTALL_LIBDIR}
    ARCHIVE DESTINATION \${CMAKE_INSTALL_LIBDIR}
)
install(DIRECTORY include/ DESTINATION \${CMAKE_INSTALL_INCLUDEDIR})

# Tests
option(BUILD_TESTS "Build tests" ON)
if(BUILD_TESTS)
    enable_testing()
    add_subdirectory(tests)
endif()`;

const lesson = {
  id: "cpp-4-001",
  slug: "cmake",
  chapter: "cpp-4",
  order: 1,
  title: "CMake Build System",
  subtitle: "CMakeLists.txt, targets, find_package, FetchContent, modern CMake",
  tags: ["c++", "cpp", "cmake", "build system", "targets", "find_package", "FetchContent"],
  aliases: [
    "c++ cmake",
    "cmake tutorial",
    "cmake targets",
    "cmake find_package",
    "cmake FetchContent",
  ],

  hook: `Every real C++ project needs a build system. CMake is the industry standard — it generates Makefiles, Ninja files, Visual Studio projects, and Xcode projects from a single description. Modern CMake (3.x) is target-based: you describe what you're building and its requirements, and CMake figures out the flags. Understanding CMake is not optional for professional C++ development.`,

  mentalModel: [
    "**Everything in modern CMake is a target.** Executables (`add_executable`), libraries (`add_library`), and even interface-only pseudo-targets. Targets have properties: include directories, compile options, link libraries. Properties propagate transitively based on `PUBLIC`, `PRIVATE`, or `INTERFACE` visibility.",
    "**`PUBLIC` / `PRIVATE` / `INTERFACE` control transitive propagation.** `PRIVATE`: this target only. `PUBLIC`: this target AND anything that links to it. `INTERFACE`: only things that link to it (not this target itself). Get this right and consumers get correct include paths and link flags automatically.",
    "**Separate configure from build.** `cmake ..` configures (reads CMakeLists.txt, generates build files). `cmake --build .` builds. Always build out-of-source (`mkdir build && cd build && cmake ..`) — keep build artifacts out of your source tree. Use `-DCMAKE_BUILD_TYPE=Release` or `-DCMAKE_BUILD_TYPE=Debug`.",
  ],

  intuition: {
    prose: [
      "**The shift to target-based CMake matters.** Old CMake set global variables like `include_directories()` and `link_libraries()`. Modern CMake uses `target_include_directories(mylib PUBLIC ...)` — the include path is attached to the target, not the global state. When you link against `mylib`, you automatically get its public include paths. No manual management of transitive dependencies.",
    ],
    visualizations: [
      {
        id: "CppLab",
        mathBridge: "**Minimal CMakeLists.txt — read it then explore:**\n\n- What does `cmake_minimum_required` protect against? (new CMake syntax in old CMake)\n- `CMAKE_CXX_EXTENSIONS OFF`: difference between `-std=c++20` and `-std=gnu++20`?\n- Try `add_executable(myapp main.cpp helper.cpp)` — multiple sources.\n- `cmake --build . -- -j4`: what does `-j4` do? (parallel jobs to make/ninja)",
        props: {
          mainFile: "CMakeLists.txt",
          initialFiles: { "/home/user/CMakeLists.txt": CMAKE_BASIC_CODE },
        },
      },
      {
        id: "CppLab",
        mathBridge: "**Targets and visibility — read it then explore:**\n\n- Change `PRIVATE mylib` to `PUBLIC mylib` in target_link_libraries — when does this matter?\n- `add_library(mylib SHARED ...)` instead of STATIC — what changes in the output? (.so vs .a)\n- `add_library(mylib INTERFACE)` — no source files, just include paths — for header-only libs.\n- `target_compile_definitions(mylib PUBLIC DEBUG_MODE)` — adds `-DDEBUG_MODE` to consumers.",
        props: {
          mainFile: "CMakeLists.txt",
          initialFiles: { "/home/user/CMakeLists.txt": TARGETS_CODE },
        },
      },
    ],
  },

  rigor: {
    prose: [
      "**`find_package` uses CMake's Find modules or package config files.** For common packages (OpenSSL, Boost, ZLIB), CMake ships `FindXxx.cmake` modules. For modern packages that install their own cmake files (e.g., `fmtConfig.cmake`), CMake uses the config file. Both provide imported targets (e.g., `OpenSSL::SSL`) — these carry all required include paths and link options.",
      "**`FetchContent` downloads dependencies at configure time.** Declare the source (git repo, URL, etc.) and call `FetchContent_MakeAvailable`. The dependency is built as part of your project — no separate install step. This is the modern alternative to git submodules for small/medium dependencies. For large projects, `vcpkg` or `Conan` are better package managers.",
    ],
    visualizations: [
      {
        id: "CppLab",
        mathBridge: "**find_package and FetchContent — read it then explore:**\n\n- `find_package(OpenSSL QUIET)` — doesn't error if not found, check `OpenSSL_FOUND`.\n- Imported targets (OpenSSL::SSL) vs old-style variables (OPENSSL_LIBRARIES) — prefer imported targets.\n- FetchContent: `GIT_TAG main` — live tip vs pinned version. Why pin? (reproducible builds)\n- `FetchContent_Populate` vs `FetchContent_MakeAvailable`: the latter also calls add_subdirectory.",
        props: {
          mainFile: "CMakeLists.txt",
          initialFiles: { "/home/user/CMakeLists.txt": FIND_PACKAGE_CODE },
        },
      },
      {
        id: "CppLab",
        mathBridge: "**Modern CMake patterns — read it then explore:**\n\n- Generator expressions `$<BUILD_INTERFACE:...>` vs `$<INSTALL_INTERFACE:...>` — different include paths at build vs install time.\n- `option(BUILD_TESTS ON)`: override with `cmake -DBUILD_TESTS=OFF ..`\n- `add_subdirectory(tests)` — each subdirectory has its own CMakeLists.txt.\n- `enable_testing()` + `add_test(NAME mytest COMMAND mytest_exe)` — run with `ctest`.",
        props: {
          mainFile: "CMakeLists.txt",
          initialFiles: { "/home/user/CMakeLists.txt": MODERN_CMAKE_CODE },
        },
      },
    ],
    callouts: [
      {
        type: "warning",
        title: "Never use file(GLOB ...) to collect source files",
        body: "`file(GLOB SOURCES src/*.cpp)` looks convenient but breaks incremental builds: if you add a new .cpp file, CMake doesn't re-run automatically (the glob result is cached). Always list source files explicitly in `add_executable` or `add_library`. If the list is long, use a separate variable.",
      },
      {
        type: "tip",
        title: "Use cmake --preset for standard configurations",
        body: "CMake 3.19+ supports `CMakePresets.json` — define named presets for common configurations (debug, release, asan, etc.). Team members run `cmake --preset=debug` instead of remembering long `-D` flags. Check `CMakePresets.json` into version control.",
      },
    ],
  },

  examples: [
    {
      title: "Multi-target project layout",
      body: `# Root CMakeLists.txt
cmake_minimum_required(VERSION 3.20)
project(MyProject LANGUAGES CXX)
set(CMAKE_CXX_STANDARD 20)

add_subdirectory(lib)     # defines mylib target
add_subdirectory(app)     # defines myapp, links mylib
add_subdirectory(tests)   # defines tests, links mylib

# lib/CMakeLists.txt
add_library(mylib STATIC math.cpp utils.cpp)
target_include_directories(mylib PUBLIC \${CMAKE_CURRENT_SOURCE_DIR}/include)

# app/CMakeLists.txt
add_executable(myapp main.cpp)
target_link_libraries(myapp PRIVATE mylib)

# tests/CMakeLists.txt
add_executable(test_math test_math.cpp)
target_link_libraries(test_math PRIVATE mylib)
add_test(NAME math_tests COMMAND test_math)`,
    },
  ],

  challenges: [
    {
      difficulty: "easy",
      problem:
        "Write a CMakeLists.txt for a project with: one static library `mathlib` (sources: `add.cpp`, `mul.cpp`, include dir `include/`), and one executable `calculator` that links to it. Set C++20, require the standard, and add `-Wall -Wextra` as private compile options on the library.",
      hint: "`add_library(mathlib STATIC add.cpp mul.cpp)` then `target_include_directories(mathlib PUBLIC include/)` then `target_link_libraries(calculator PRIVATE mathlib)`",
      walkthrough: [
        "cmake_minimum_required(VERSION 3.20)",
        "project(Calculator LANGUAGES CXX)",
        "set(CMAKE_CXX_STANDARD 20)",
        "set(CMAKE_CXX_STANDARD_REQUIRED ON)",
        "add_library(mathlib STATIC add.cpp mul.cpp)",
        "target_include_directories(mathlib PUBLIC include/)",
        "target_compile_options(mathlib PRIVATE -Wall -Wextra)",
        "add_executable(calculator main.cpp)",
        "target_link_libraries(calculator PRIVATE mathlib)",
      ],
    },
    {
      difficulty: "medium",
      problem:
        "Add Google Test to your project using `FetchContent`. Create a test executable `mathlib_test` that links to both `mathlib` and `GTest::gtest_main`. Add a test via `add_test`. Then add a CMake option `BUILD_TESTS` (default ON) that conditionally includes the test subdirectory.",
      hint: "`FetchContent_Declare(googletest GIT_REPOSITORY ... GIT_TAG ...)` then `FetchContent_MakeAvailable(googletest)` then `target_link_libraries(mathlib_test PRIVATE mathlib GTest::gtest_main)`",
      walkthrough: [
        "include(FetchContent)",
        "FetchContent_Declare(googletest GIT_REPOSITORY https://github.com/google/googletest.git GIT_TAG v1.14.0)",
        "FetchContent_MakeAvailable(googletest)",
        "add_executable(mathlib_test test_math.cpp)",
        "target_link_libraries(mathlib_test PRIVATE mathlib GTest::gtest_main)",
        "enable_testing()",
        "add_test(NAME MathTests COMMAND mathlib_test)",
      ],
    },
  ],

  assessment: {
    questions: [
      {
        id: "cpp4-001-q1",
        type: "choice",
        text: "What does `target_link_libraries(myapp PUBLIC mylib)` mean vs `PRIVATE mylib`?",
        options: [
          "PUBLIC is for shared libraries, PRIVATE for static",
          "PUBLIC: myapp and anything that links to myapp gets mylib's interface. PRIVATE: only myapp gets it — consumers don't see mylib.",
          "PUBLIC links at compile time, PRIVATE at link time",
          "There is no difference",
        ],
        answer: 1,
        explanation:
          "Visibility controls transitive propagation. `PRIVATE mylib`: myapp uses mylib internally — consumers of myapp don't automatically get mylib. `PUBLIC mylib`: myapp uses mylib AND any target that links to myapp also gets mylib automatically. Use `PRIVATE` unless consumers of your target need the dependency themselves.",
      },
      {
        id: "cpp4-001-q2",
        type: "choice",
        text: "Why should you always build out-of-source?",
        options: [
          "CMake requires it",
          "Build artifacts (object files, Makefiles, binaries) go in a separate directory — keeps the source tree clean, allows multiple build configurations simultaneously",
          "Out-of-source builds are faster",
          "In-source builds don't support shared libraries",
        ],
        answer: 1,
        explanation:
          "In-source builds scatter Makefiles, object files, and CMake cache files throughout your source tree. They're hard to clean (what's source vs generated?), can't easily have parallel Debug/Release builds, and pollute git status. Out-of-source: `mkdir build && cmake -S . -B build` keeps everything separate.",
      },
      {
        id: "cpp4-001-q3",
        type: "choice",
        text: "What is wrong with `file(GLOB SOURCES src/*.cpp)` in CMakeLists.txt?",
        options: [
          "GLOB doesn't work recursively",
          "CMake evaluates the glob at configure time and caches it — adding a new .cpp file won't be detected until you re-run cmake manually",
          "GLOB only works on Unix",
          "GLOB can't handle spaces in filenames",
        ],
        answer: 1,
        explanation:
          "When you add a new source file and run `cmake --build .`, CMake uses cached build rules and doesn't re-run the glob. The new file is silently ignored until you delete the build directory or re-run `cmake`. Always list sources explicitly — if the list is long, put it in a variable.",
      },
      {
        id: "cpp4-001-q4",
        type: "choice",
        text: "What is the difference between `FetchContent` and `find_package`?",
        options: [
          "FetchContent is for header-only libraries; find_package is for compiled libraries",
          "find_package looks for already-installed packages on the system; FetchContent downloads and builds the dependency as part of your configure step",
          "FetchContent only works with git; find_package works with any package manager",
          "They are interchangeable",
        ],
        answer: 1,
        explanation:
          "`find_package` searches for a package already installed on the system (via CMake Find modules or package config files). `FetchContent` downloads the source at configure time and builds it as part of your project. FetchContent is good for ensuring reproducible builds with pinned versions; find_package is good for system packages managed by the OS or a package manager.",
      },
    ],
  },
};

export default lesson;
