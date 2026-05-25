const HELLO_WORLD_CPP = `#include <iostream>
using namespace std;

// __OUTPUT__: Hello, World!
int main() {
    cout << "Hello, World!" << endl;
    return 0;
}`;

const lesson = {
  id: "cpp-0-001",
  slug: "hello-world",
  chapter: "cpp-0",
  order: 1,
  title: "Hello World",
  subtitle: "Write, compile, and run your first C++ program",
  tags: ["c++", "cpp", "hello-world", "compile", "g++", "fundamentals"],
  aliases: [
    "c++ hello world",
    "first c++ program",
    "compile c++",
    "g++ tutorial",
  ],

  hook: `Every programmer starts here: writing a program that proves the tools work. In C++, "Hello, World!" teaches you the four-step workflow of every systems program — write source code, compile it to machine code, get an executable, run it. This is the same workflow used to build browsers, game engines, and operating systems.`,

  mentalModel: [
    "C++ is a **compiled language**. You write human-readable source code (`.cpp`), then a compiler (`g++`) translates it into machine instructions your CPU executes directly — no interpreter running at runtime.",
    "**Compile ≠ Run.** `g++` reads your `.cpp`, checks for errors, and writes an executable binary. Only after compilation do you run the program with `./app`. Two distinct steps.",
    "The `main()` function is the entry point. Every C++ program begins executing there. `return 0` signals success to the shell — non-zero means failure.",
  ],

  intuition: {
    prose: [
      "Before C++ executes, it goes through a **build pipeline**: the preprocessor expands `#include` directives, the compiler translates your code to machine instructions, and the linker bundles everything into one executable. When you run `g++ main.cpp -o hello`, all three stages happen in one command.",
      "`cout << \"Hello, World!\" << endl;` is your first output statement. `cout` is the standard output stream connected to your terminal. The `<<` operator feeds data into it. `endl` terminates the line and flushes the buffer so the text appears immediately.",
      "The `#include <iostream>` line is an import statement — it tells the preprocessor to pull in the standard I/O library, giving you `cout`, `cin`, `cerr`, and related tools. Without it, the compiler doesn't know what `cout` means.",
      "In the lab below, the `// __OUTPUT__: Hello, World!` comment is a **simulator annotation** — it tells the virtual `g++` what text the compiled program should print when run. In a real compiler this would be ignored (it's just a comment). Once you compile and run, try editing the message in the editor, saving with ⌘S, then recompiling.",
    ],
    visualizations: [
      {
        id: "CppLab",
        mathBridge:
          "**Workflow to try:**\n\n1. Read `main.cpp` in the editor — note the `// __OUTPUT__:` annotation\n2. In the terminal: `g++ main.cpp -o hello` to compile\n3. Run: `./hello`\n4. Or one-liner: `g++ main.cpp -o hello && ./hello`\n5. Edit the string in `cout`, update the `__OUTPUT__` comment to match, **Save ⌘S**, then recompile\n6. Try `file hello` to inspect the binary type\n7. Try `echo $?` to see the exit code",
        props: {
          mainFile: "main.cpp",
          initialFiles: {
            "/home/user/main.cpp": HELLO_WORLD_CPP,
          },
        },
      },
    ],
  },

  rigor: {
    prose: [
      "**The four compilation stages.** Running `g++ main.cpp -o hello` triggers: **(1) Preprocessing** — the C preprocessor expands all `#include` directives and `#define` macros, producing a single translation unit. **(2) Compilation** — the compiler parses the C++ syntax, type-checks it, and emits assembly code. **(3) Assembly** — an assembler converts assembly instructions to binary object code (`.o` files). **(4) Linking** — the linker combines object files with runtime libraries (like the iostream runtime from `libstdc++`) into the final executable. Each stage can produce errors; knowing which stage failed tells you where to look.",
      "**Exit codes and `&&`.** `int main()` returns an integer — the **exit code**. By convention: `0` = success, non-zero = failure. The shell operator `&&` reads this: `g++ main.cpp -o app && ./app` only runs `./app` if compilation returned 0. This is why properly returning from `main()` matters even in tiny programs. Run `echo $?` after any command to inspect its exit code.",
      "**`std::` namespace.** Writing `using namespace std;` lets you type `cout` instead of the fully-qualified `std::cout`. The `std` namespace wraps all standard library names. In larger projects, developers often prefer explicit `std::` prefixes to prevent naming collisions, but `using namespace std` is idiomatic in educational and small programs.",
    ],
    callouts: [
      {
        type: "tip",
        title: "The __OUTPUT__ annotation is simulator-only",
        body: "The `// __OUTPUT__: text` comment in your .cpp tells the virtual g++ what text the binary should print. In a real compiler it is ignored — it is just a comment. Change both the `cout` string AND the `__OUTPUT__` annotation together to get consistent results in the simulator.",
      },
      {
        type: "info",
        title: "C++ vs C: a quick distinction",
        body: "`cout` and `<iostream>` are C++ additions. In C, output is `printf(\"Hello, World!\\n\")` with `#include <stdio.h>`. C++ is a strict superset of C — everything valid in C is valid in C++ — but C++ adds classes, templates, references, RAII, and the standard library.",
      },
      {
        type: "warning",
        title: "Always compile before running",
        body: "Editing a .cpp file does NOT change the binary on disk. You must recompile (`g++ main.cpp -o hello`) before running again, or your changes won't be reflected. This is a very common mistake when starting with compiled languages.",
      },
    ],
  },

  examples: [
    {
      title: "Full build-and-run workflow",
      body: `# 1. Source is already in main.cpp

# 2. Compile: translate .cpp → executable binary
g++ main.cpp -o hello

# 3. Run the executable (. = current directory)
./hello

# 4. Shortcut: compile AND run in one line
#    (./hello only runs if g++ returns exit code 0)
g++ main.cpp -o hello && ./hello

# 5. Inspect the binary type
file hello

# 6. Check exit code (0 = success)
echo $?`,
    },
    {
      title: "Anatomy of a minimal C++ program",
      body: `#include <iostream>    // Pull in the I/O library
using namespace std;   // No need to type std:: everywhere

int main() {           // Entry point — execution starts here
    cout << "Hi!";     // Write to stdout (your terminal)
    return 0;          // Exit code: 0 = success
}`,
    },
    {
      title: "Compiler flags you'll use often",
      body: `# Enable all common warnings (recommended always)
g++ -Wall main.cpp -o hello

# Use C++17 standard (required for many modern features)
g++ -std=c++17 main.cpp -o hello

# Optimized release build
g++ -O2 main.cpp -o hello

# Debug build (symbols for debugger)
g++ -g main.cpp -o hello

# All together (typical dev build)
g++ -std=c++17 -Wall -g main.cpp -o hello`,
    },
  ],

  assessment: {
    questions: [
      {
        id: "cpp0-001-q1",
        type: "choice",
        text: "What does `g++ main.cpp -o hello` do?",
        options: [
          "Runs the program named hello",
          "Compiles main.cpp and creates an executable named hello",
          "Creates a new source file called hello.cpp",
          "Installs the G++ compiler",
        ],
        answer: 1,
        explanation:
          "`g++` is the compiler. It reads `main.cpp` (source), translates it to machine instructions, and writes the output binary to `hello` (the `-o` flag specifies the output name). The program is not run — only compiled.",
      },
      {
        id: "cpp0-001-q2",
        type: "choice",
        text: "Why is `./` required when running `./hello`?",
        options: [
          "It tells the shell to run the file from the current directory",
          "It is the C++ namespace separator (like `std::`)",
          "It compiles the file before running it",
          "`./` is not required — you can just type `hello`",
        ],
        answer: 0,
        explanation:
          "The shell only searches for executables in directories listed in `$PATH`. The current directory `.` is deliberately excluded for security. `./hello` explicitly means: look in `.` (here) for `hello`.",
      },
      {
        id: "cpp0-001-q3",
        type: "choice",
        text: "What does `return 0` mean at the end of `int main()`?",
        options: [
          "The program returned nothing and printed 0",
          "The program ran 0 times",
          "The program exited successfully (exit code 0)",
          "The program will restart from the beginning",
        ],
        answer: 2,
        explanation:
          "`main()` returns an integer exit code. `0` means success by Unix convention. The shell reads this: `g++ file.cpp && ./app` only runs `./app` if `g++` returned 0 (success).",
      },
      {
        id: "cpp0-001-q4",
        type: "choice",
        text: "You edit `main.cpp` and save it. What must you do before `./hello` reflects your changes?",
        options: [
          "Nothing — the binary updates automatically when you save",
          "Recompile: `g++ main.cpp -o hello`",
          "Restart the terminal",
          "Run `source main.cpp`",
        ],
        answer: 1,
        explanation:
          "Editing the `.cpp` source file does NOT change the binary. You must recompile with `g++` to translate the new source into a new executable. This is the fundamental difference between compiled and interpreted languages.",
      },
    ],
  },
};

export default lesson;
