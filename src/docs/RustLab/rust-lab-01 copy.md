# Rust Web Server — LAB 01 — How Computers Work and Your First Rust Program

**Prerequisites:** None. This is the beginning.

**What this lab adds:**
- A clear mental model of what a computer actually does (CPU, memory, storage)
- An understanding of what a programming language is and why Rust exists
- Rust installed and running on your machine
- Your first Rust program compiled and running in the terminal
- A second program that does something genuinely useful: it accepts your name and greets you

**Time:** 2–4 hours if you read carefully and type everything yourself

---

> **Quick Check — try to answer before reading:**
>
> 1. When you write code in a file and "run" it, what do you think actually happens between the file and the computer executing it?
> 2. Your program stores the number `42` in a variable. Where do you think that number physically lives while the program is running?
> 3. What do you think would happen if you tried to give a computer instructions in plain English instead of a programming language?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

By the end of this lab, your terminal will look like this:

```
$ cargo run
   Compiling hello_rust v0.1.0
    Finished dev profile
     Running `target/debug/hello_rust`
What is your name? Ada
Hello, Ada! Welcome to Rust.
You typed 4 characters.
```

A small program, yes. But every line of it will make complete sense — not just *what* it does, but *why* it works.

---

## Part 1 — What a Computer Actually Is

Before writing a single line of Rust, you need a model of what you are actually talking to. Not a vague sense of it — a real one.

### Concept: The CPU (Central Processing Unit)

**What it is:** The CPU is the part of the computer that executes instructions — one at a time, billions of times per second.

**The problem before this concept:** Without understanding the CPU, code feels like magic. You type words and things happen. That feeling of magic is the enemy of deep understanding.

**The solution:** The CPU is not magic. It is a machine that does exactly one thing: reads an instruction, executes it, reads the next instruction, executes it. That's it. The entire complexity of modern software is just an enormous pile of these tiny instructions, executed in sequence.

**Canonical example (General Explanation):**

Think of a piano player reading sheet music. The sheet music is the program. The piano player is the CPU. The player reads one note, plays it, reads the next note, plays it. They never skip ahead. They never do two things at the same time (we are ignoring advanced concepts like parallelism for now). They just read and execute, one note at a time, very fast.

A modern CPU can execute around **3 billion instructions per second**. That number is why fast software matters — and it is a major reason Rust exists.

**What the CPU actually understands:** The CPU does not understand English. It does not understand Rust. It only understands **machine code** — a sequence of numbers, where each number means a specific operation: "add these two numbers", "store this value in memory", "jump to this other instruction". Those numbers are encoded in binary (ones and zeros).

Nobody writes machine code by hand anymore. That's what programming languages are for.

**Why it matters here:** Every Rust program you write in this series will eventually become machine code that the CPU executes. Understanding this chain — Rust source → machine code → CPU execution — is the foundation of everything else.

---

### Concept: Memory (RAM — Random Access Memory)

**What it is:** RAM is where a running program stores the data it is currently working with.

**The problem before:** People confuse memory (RAM) with storage (the hard drive). They are completely different things with completely different properties.

**The solution:**

Think of your desk as RAM. When you sit down to work, you put only the things you are *currently using* on the desk — an open book, a pen, a coffee. Your desk is fast to reach. But when you leave, the desk is cleared. Tomorrow, the book is gone unless you put it back on the shelf (storage).

RAM works the same way:
- It is **fast** — the CPU can read from and write to RAM in nanoseconds
- It is **temporary** — everything in RAM disappears when the program ends (or the computer loses power)
- It is **limited** — your computer might have 8 or 16 gigabytes of RAM (your desk only has so much space)

When your Rust program runs and you create a variable like `let name = "Ada"`, the string "Ada" lives in RAM. It exists in RAM only as long as the program is running.

**Why it matters here:** Rust is famous — genuinely famous across the entire programming world — for its approach to managing memory. The core ideas of Rust ownership, which you will learn in Lab 3, are entirely about answering one question: *who is responsible for cleaning up memory when it is no longer needed?* You cannot understand Rust's most important feature without first understanding what memory is.

---

### Concept: Storage (The Hard Drive / SSD)

**What it is:** Storage is where data lives permanently — your files, your programs, your photos — even when the computer is turned off.

**Canonical example:**

The shelf next to your desk. You can put things on the shelf and they stay there. But to actually use them, you have to pick them up and bring them to your desk (load them into RAM). Reading from the shelf is much slower than reaching across the desk.

In real numbers:
- Reading from RAM: ~100 **nanoseconds** (billionths of a second)
- Reading from an SSD: ~100 **microseconds** (millionths of a second) — that's 1,000 times slower
- Reading from a spinning hard drive: ~10 **milliseconds** — 100,000 times slower than RAM

**Why it matters here:** Your Rust source code (the `.rs` files you write) lives on storage. When you compile your program, the compiler reads those files from storage, does its work in RAM, and writes the final compiled program back to storage. When you *run* the compiled program, the operating system loads it from storage into RAM so the CPU can execute it.

---

### The Full Picture — From Your Code to Execution

Here is the complete chain, every time you run a Rust program:

```
YOUR SOURCE FILE (.rs)          ← lives on STORAGE
         ↓
    [COMPILER runs]             ← compiler itself runs in RAM
         ↓
COMPILED PROGRAM (binary)       ← written back to STORAGE
         ↓
    [YOU run it]
         ↓
PROGRAM LOADED INTO RAM         ← operating system loads it
         ↓
CPU READS INSTRUCTIONS          ← executes billions per second
         ↓
RESULTS APPEAR                  ← on screen, in files, over the network
```

This chain is not abstract. You will watch every step of it happen in this lab.

---

## Part 2 — What a Programming Language Is

### Concept: Programming Language

**What it is:** A programming language is a set of rules for writing instructions that a compiler or interpreter can translate into machine code the CPU can execute.

**The problem before:** Raw machine code (binary numbers) is unreadable and nearly impossible to write correctly for complex programs. Even the step above that — assembly language, where each instruction is a short code like `MOV AX, 5` — is brutally tedious and error-prone for large programs.

**The solution:** Programming languages let you write instructions in something that resembles human logic, and then a program (the compiler) translates that into machine code automatically.

**The levels of abstraction — from CPU to you:**

```
Level 0: Binary machine code        10110000 01100001
Level 1: Assembly language          MOV AL, 'a'
Level 2: C / C++                    char c = 'a';
Level 3: Rust                       let c = 'a';
Level 4: Python / JavaScript        c = 'a'
```

As you go up the levels, code becomes easier to write and read. But you also give up some control and usually some performance. Rust sits at Level 3 — it is as readable and expressive as high-level languages, but it compiles to machine code as fast and efficient as Level 2 languages like C and C++. That combination is what makes Rust special.

**Watch for:** More abstraction is not always better. Python (Level 4) is fantastic for writing scripts quickly. But if you are writing an operating system, a web server handling millions of requests, or a game engine — you want the control and speed of Level 3. You want Rust.

---

### Concept: The Compiler

**What it is:** A compiler is a program that reads your source code, checks it for errors, and translates it into machine code.

**The problem before:** If the compiler did not exist, you would have to write machine code directly. This is what programmers did in the 1940s and 1950s. Writing a simple addition required dozens of binary instructions.

**What it hides:** The compiler hides the entire CPU instruction set. You write `let result = 5 + 3` and the compiler produces the precise sequence of machine code instructions to perform that addition on your specific CPU architecture (x86, ARM, etc.). You never think about those instructions.

The invariant the compiler protects: **the code that runs is always a valid translation of the code you wrote.** You cannot accidentally write Rust that compiles to machine code that does something different from what you intended (with a few very advanced exceptions we'll encounter much later). The compiler is the guarantee.

**Rust's compiler specifically:** Rust's compiler (`rustc`) is particularly strict. It will refuse to compile code that could cause memory errors, data corruption, or certain classes of bugs. This strictness feels annoying at first. It becomes one of the most valuable things in your programming life. The compiler is not your enemy — it is finding your bugs before they become disasters in production.

**Canonical example:**

You write this Rust:
```rust
let result = 5 + 3;
```

The compiler produces something equivalent to these CPU instructions (simplified):
```
LOAD  5 into register A
LOAD  3 into register B
ADD   A and B, store in register C
```

You wrote one line. The compiler handled the rest.

**Why it matters here:** In a moment, you will type `cargo build` and watch the compiler turn your Rust source into an executable binary. You will see this process happen in real time.

---

### Why Rust Specifically?

You are learning Rust and not Python, JavaScript, or Java. That is a meaningful choice. Here is the honest reason Rust exists and why it matters for what you want to build.

**The problem Rust solves:**

C and C++ are the languages that power operating systems, browsers, databases, and game engines. They are fast. But they have a fundamental flaw: memory management is entirely the programmer's responsibility. You allocate memory, you must remember to free it. If you forget — or free it too early, or access memory you already freed — you get **memory bugs**. Memory bugs are the #1 cause of security vulnerabilities in software. Buffer overflows, use-after-free errors, null pointer dereferences — these have caused billions of dollars of damage and security breaches across the history of computing.

**What Rust did:** Rust's inventors at Mozilla (and now at the Rust Foundation) asked: *what if the compiler could guarantee memory safety at compile time, with no runtime cost?* The answer is Rust's ownership system. The compiler enforces rules about who owns memory and when it gets freed — so you get C-level speed with no memory bugs. If your code compiles, it is memory safe. The compiler already checked.

**The outcome:** Rust has been the #1 "most admired" programming language in the Stack Overflow developer survey every year since 2016. It is being used to write the Linux kernel, parts of Windows, web servers, game engines, and the WASM runtimes that power the modern web. The things you want to build — a web server, a transpiler, eventually a terminal — are exactly what Rust is built for.

---

## Part 3 — Installing Rust

### Concept: The Terminal (Command Line Interface)

**What it is:** The terminal is a text-based interface for giving commands directly to your operating system — no graphical buttons, just text.

**Why use it:** Every professional programming tool — compilers, version control systems, servers — is controlled through the terminal. Learning the terminal is not optional if you want to understand how software actually works.

**The terminal vocabulary you need right now:**

| Term | What it means |
|---|---|
| `$` | The prompt — the terminal waiting for your input. You do not type this. |
| command | A program you tell the terminal to run. Example: `rustc` |
| argument | Extra information you pass to a command. Example: `rustc main.rs` |
| flag | A special argument that changes how a command behaves. Example: `--version` |
| path | The address of a file or folder. Example: `/home/user/projects/hello` |

**On Windows:** You will use either **PowerShell** (search for it in the Start menu) or **Windows Terminal** (recommended — install it from the Microsoft Store if you do not have it). Do not use the old Command Prompt (`cmd.exe`) — it behaves differently.

---

### Step 1 — Install Rust

Rust is installed through a tool called `rustup`. It manages the Rust compiler and its related tools, and it keeps them up to date.

**Open your terminal and run:**

```
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

**What this command does, piece by piece:**

- `curl` — a command-line tool that downloads files from the internet (it is already installed on Windows 10+, macOS, and Linux)
- `--proto '=https'` — only use the secure HTTPS protocol (no unencrypted downloads)
- `--tlsv1.2` — require at least version 1.2 of the TLS security standard
- `-sSf` — three flags combined: `s` means silent (no progress bar), `S` means show errors if they occur, `f` means fail on server errors
- `https://sh.rustup.rs` — the URL of the Rust installer script
- `| sh` — pipe the downloaded script directly into the shell to run it

**On Windows:** If `curl` does not work, visit `https://rustup.rs` in your browser and download the `rustup-init.exe` installer directly. Run it.

**During installation:** The installer will ask you some questions. Press Enter to choose the default option for everything. The defaults are correct.

**What gets installed:**
- `rustc` — the Rust compiler itself
- `cargo` — Rust's build system and package manager (you will use this constantly)
- `rustup` — the tool that installed all of this (used for updates)
- The Rust standard library (built-in code that does common things — we will use it heavily)

**After installation, restart your terminal.** The installer adds Rust to your `PATH` — a list of folders your terminal searches when you type a command. The restart makes the terminal reload that list.

---

### SAVE AND TRY

Open a fresh terminal window. Run:

```
rustc --version
```

**You should see:** Something like `rustc 1.78.0 (9b00956e5 2024-04-29)` — the exact numbers will differ but the format will be the same.

Then run:

```
cargo --version
```

**You should see:** Something like `cargo 1.78.0 (something)`

**Change something:** Run `rustup show`. This prints everything `rustup` knows about your Rust installation — the active toolchain, installed targets, and more. You do not need to understand all of it yet. Just notice that Rust is aware of itself.

If either command says something like `command not found`, the terminal has not loaded the new `PATH` yet. Close it and open a new one.

---

## Part 4 — Your First Rust Program

### Concept: `cargo` — The Build System and Package Manager

**What it is:** `cargo` is the official tool for creating, building, testing, and running Rust projects.

**What it hides:** Without `cargo`, you would have to manually invoke `rustc` on every file, manage dependencies by hand, and figure out the linking step yourself (linking is when the compiler combines compiled files into a final executable). `cargo` hides all of that complexity.

The invariant `cargo` protects: **the build is always reproducible.** Given the same source code and the same `Cargo.toml` file (the configuration file `cargo` reads), `cargo` will produce the same output every time, on every machine. You can send your project to another person and it will build the same way on their computer.

**Canonical example (General Explanation):**

Think of `cargo` as the manager of a construction project. You are the architect — you design the building (write the code). `cargo` is the project manager who orders the materials (downloads libraries from the internet), schedules the workers (runs the compiler), and hands you the keys when it is done.

**Project Application:**

Every lab in this series starts with `cargo new project_name`. Every build is `cargo build` or `cargo run`. You will type `cargo` hundreds of times. It is the entry point for everything.

**Smallest possible example:**
```
cargo new hello          # creates a new project in a folder called hello
cd hello                 # move into that folder
cargo run                # compile and immediately run the program
```

**Why it matters here:** You are about to run these three commands.

**Watch for:** `cargo` is strict about project structure. It expects a specific folder layout. Never manually move files inside a cargo project — let `cargo` manage them.

---

### Step 2 — Create Your First Project

In your terminal, run these three commands:

```
cargo new hello_rust
cd hello_rust
```

**What `cargo new hello_rust` does:**

It creates a folder called `hello_rust` with this structure:

```
hello_rust/
├── Cargo.toml       ← the project configuration file
└── src/
    └── main.rs      ← your source code lives here
```

**What `cd hello_rust` does:**

`cd` stands for "change directory" — it moves your terminal's current location into the `hello_rust` folder. Think of the terminal as standing in a specific folder at all times. `cd` walks it from one folder to another.

Open `src/main.rs` in any text editor. You will see this code already there:

```rust
fn main() {
    println!("Hello, world!");
}
```

Before changing anything, run it exactly as it is.

---

### SAVE AND TRY

In your terminal (make sure you are inside the `hello_rust` folder), run:

```
cargo run
```

**You should see:**

```
   Compiling hello_rust v0.1.0 (/path/to/hello_rust)
    Finished dev [unoptimized + debuginfo] target(s) in 1.23s
     Running `target/debug/hello_rust`
Hello, world!
```

You just compiled and ran your first Rust program. Let us understand every part of what happened.

**Change something:** Change the text `"Hello, world!"` to `"Hello, Rust!"`. Save the file. Run `cargo run` again. The compiler notices the file changed and recompiles. Change it back to `"Hello, world!"` afterward.

---

## Part 5 — Understanding Every Line

Now you will learn what each character in that program actually means. Nothing will be skipped.

### Concept: Function

**What it is:** A function is a named block of code that you can run (call) by using its name.

**The problem before:**

Without functions, every program would be one long sequence of instructions from top to bottom, with no way to organize, name, or reuse chunks of logic. Adding the same calculation in ten places means writing it ten times — and if it has a bug, you fix it in ten places.

**What it hides:** A function hides its implementation from everything outside it. You call `println!` and something appears on screen — you do not have to think about how the terminal output works, what system calls are involved, or how text is encoded. The function name is the only thing you need to know.

The invariant functions protect: **the same function called with the same inputs always produces the same outputs.** This predictability is what makes programs testable and trustworthy.

**Canonical example (General Explanation):**

A toaster. You put bread in, push the lever, and toast comes out. You do not know or care about the heating element, the timer circuit, or the spring mechanism. The interface (the lever) hides all of that. A function is the same idea: a named lever that performs a hidden process.

In Rust, a function looks like this:

```rust
fn function_name() {
    // code goes here
}
```

- `fn` is the keyword that tells Rust "I am defining a function"
- `function_name` is what you will call it by
- `()` holds parameters — inputs the function receives (empty means no inputs)
- `{` and `}` are curly braces — they mark where the function's code begins and ends

**Project Application:**

`main` is the most important function in any Rust program. It is the function Rust calls first when your program starts. Every Rust program must have exactly one `main` function. It is the entry point — the front door.

**Watch for:** Rust is case-sensitive. `Main` and `main` are different things. `fn Main()` will not work. Always lowercase.

---

### Concept: `println!` — Printing to the Screen

**What it is:** `println!` is a Rust macro that writes text to the terminal and then moves to the next line.

**A note on the `!`:** The exclamation mark means `println!` is a **macro**, not a regular function. A macro is code that generates other code — it expands before the compiler translates your program to machine code. We will understand macros deeply in a later lab. For now, just know: if it ends with `!`, it is a macro. You call it exactly like a function.

**Canonical example:**

```rust
println!("Hello, world!");
//        ↑             ↑
//        the text to print
//        must be in double quotes
//        the ; ends this statement
```

**Why double quotes?** In Rust, text surrounded by double quotes is called a **string literal** — a piece of text baked directly into your source code. Single quotes mean something different (a single character). You will always use double quotes for text.

**Why the semicolon?** In Rust, most statements end with a semicolon (`;`). The semicolon tells Rust "this statement is complete, the next thing is a new statement." Forgetting semicolons is one of the most common beginner mistakes. The compiler will usually tell you when you forget one.

---

### Concept: Statement

**What it is:** A statement is a complete instruction — one thing for Rust to do.

**Canonical example:**

```rust
println!("Hello, world!");   // ← this entire line is one statement
```

Statements are the sentences of a program. Just as a sentence in English ends with a period, a statement in Rust ends with a semicolon. A program is a sequence of statements.

---

## Part 6 — Making the Program Yours

Now you will change the program to something that actually interacts with the person running it.

### Concept: Variable

**What it is:** A variable is a named location in memory that holds a value.

**The problem before:**

Without variables, you could only work with values you type directly into the code. You could never store a result, remember something the user typed, or build up a calculation across multiple steps.

**What it hides:** A variable hides a specific memory address. When you write `let name = "Ada"`, you do not care that "Ada" is stored at memory address `0x7FFE4B23A0C8`. You just write `name` and Rust knows where to look.

The invariant variables protect: **the name always refers to the same location in memory for the duration of that variable's life.** You cannot accidentally access a different location by using the same name.

**Canonical example (General Explanation):**

A labelled box. You write "SCORE" on a box and put the number 42 inside. Now you can say "add 1 to SCORE" without knowing or caring where the box is sitting in the warehouse. The label is what matters, not the physical location.

In Rust:

```rust
let age = 25;
//  ↑     ↑
//  name  value
```

- `let` is the keyword that creates a new variable
- `age` is the name you choose (make it descriptive — never `x` or `a`)
- `=` means "store the thing on the right into the name on the left"
- `25` is the value

**Rust's unusual rule:** By default, variables in Rust are **immutable** — once you set them, you cannot change them. This sounds frustrating. It is actually one of Rust's greatest safety features — we will explore why in Lab 3. For now, to make a variable changeable, you write `let mut`:

```rust
let mut score = 0;   // mut means "mutable" — this value can change
score = score + 1;   // now this is allowed
```

**Watch for:** Forgetting `mut` when you need to change a variable is extremely common. The compiler will tell you: `cannot assign twice to immutable variable`. The fix is always to add `mut`.

---

### Concept: String — Text Data

**What it is:** A string is a sequence of characters — letters, numbers, spaces, symbols — treated as one piece of data.

**Two kinds of strings in Rust** (you will use both, but only the first one today):

| Type | Written as | What it is |
|---|---|---|
| String literal | `"Hello"` | Text baked into the program at compile time |
| `String` (owned) | `String::new()` or input from the user | Text created and stored in memory at runtime |

The difference between these two is one of the most important concepts in Rust. You will learn it fully in Lab 3. Today: just know that when you read text the user types, it comes back as an owned `String`.

**Canonical example:**

```rust
let greeting = "Hello";         // a string literal — compile-time text
let user_input = String::new(); // an owned String — space reserved in memory for runtime text
```

---

### Concept: Reading User Input

**What it is:** Reading user input means pausing your program, waiting for the user to type something and press Enter, and then storing what they typed in a variable.

**The problem before:** Without reading input, every program runs the same way every time. It cannot respond to the person running it. That is not a program — that is a script.

**What Rust provides:** The `std::io` module (part of Rust's standard library) contains tools for reading from the keyboard and writing to the screen. `io::stdin().read_line(&mut some_string)` reads one line of input from the keyboard and appends it to the string you provide.

**Breaking that down:**

- `std::io` — the standard library's input/output module. `std` is the standard library (code that comes with Rust). `io` is the input/output section inside it.
- `stdin()` — "standard input" — the stream that connects the keyboard to your program. Every program has this by default.
- `read_line(&mut some_string)` — reads characters from the keyboard until the user presses Enter, and appends them to `some_string`
- `&mut` — means "a mutable reference to" — you are lending `read_line` the ability to write into your string. References are another deep Rust concept we will fully explore in Lab 3. For now, just use `&mut` when `read_line` requires it.

**Why `.expect("Failed to read line")`:** `read_line` returns a `Result` — a value that is either success or failure (what if the keyboard is disconnected? what if the OS refuses?). `.expect(...)` says "if it failed, print this message and crash the program." For now, this is the right approach. We will handle errors gracefully in Lab 5.

---

### Step 3 — Rewrite `main.rs`

Open `src/main.rs` in your text editor. Replace everything in the file with this:

```rust
use std::io;                         // ← add this: bring the io module into scope so we can use it

fn main() {
    println!("What is your name?"); // ← ask the user a question

    let mut name = String::new();   // ← create an empty, growable string to hold the answer
    //  ↑
    //  mut because read_line will write into name — it needs to be mutable

    io::stdin()                     // ← get the standard input stream (the keyboard)
        .read_line(&mut name)       // ← read one line into name (blocking — waits for Enter)
        .expect("Failed to read line"); // ← crash with this message if reading fails

    println!("Hello, {}!", name);   // ← print the greeting
    //              ↑
    //              {} is a placeholder — Rust fills it with the value of name
}
```

**Understanding `use std::io`:**

Rust's standard library has many modules. They are not all available by default — you bring in what you need. `use std::io` tells Rust: "I want to use the input/output tools from the standard library." Without this line, writing `io::stdin()` would give you an error: `use of undeclared crate or module io`.

Think of `use` like pulling a specific book off a shelf. The shelf (the standard library) has everything. `use` is how you put a specific book on your desk so you can open it.

**Understanding `{}`:**

`{}` inside a `println!` string is a **format placeholder**. Rust replaces it with the value of whatever variable or expression you put after the comma. This is called string formatting.

```rust
let score = 42;
println!("Your score is {}.", score);
// prints: Your score is 42.
```

You can use multiple placeholders:

```rust
println!("{} scored {} points.", name, score);
```

---

### SAVE AND TRY

Save `src/main.rs`. In your terminal, run:

```
cargo run
```

**You should see:**

```
   Compiling hello_rust v0.1.0
    Finished dev profile
     Running `target/debug/hello_rust`
What is your name?
```

The program pauses here, waiting. Type your name and press Enter.

**You should then see:**

```
Hello, Ada!
```

(or whatever name you typed)

**In the terminal, run it again:** `cargo run`. Type a different name. It should greet you differently each time.

**Change something:** Change `"What is your name?"` to `"Enter your name: "`. Run it again. Notice the prompt changes. Change it back.

**Notice something:** After your name, Rust printed a blank line before `Hello, Ada!`. That is because `read_line` includes the Enter key (`\n`) in what it reads. The blank line is actually the newline character at the end of your input. We will fix this in the next step.

---

### Concept: Method Chaining and `.trim()`

**What it is:** `.trim()` is a method that removes whitespace (spaces, tabs, and newline characters) from the beginning and end of a string.

**A method** is a function that belongs to a specific type of data and is called on a value using a dot. `name.trim()` means "call the `trim` method on the value stored in `name`."

**The problem before:**

When `read_line` reads what the user typed, it includes the newline character at the end — the `\n` that the Enter key produces. If you print `"Hello, Ada!\n"` with another newline from `println!`, you get a blank line in the middle of your output. The name `"Ada\n"` is also not equal to the name `"Ada"` — which will cause problems when we start comparing strings.

**Canonical example:**

```rust
let raw = "  Ada\n";    // what read_line gives you — spaces and a newline
let clean = raw.trim(); // "Ada" — no spaces, no newline
```

**Project Application:**

Every time you read a line of user input, you should `.trim()` it before using it. Make this a habit from the start.

**Watch for:** `.trim()` does not change the original string. It returns a new trimmed version. If you do not save the result (`let name = name.trim()`), nothing changes.

---

### Step 4 — Trim the Input and Count Characters

Add two lines to `main.rs`. Here is the full file with the additions marked:

```rust
use std::io;

fn main() {
    println!("What is your name?");

    let mut name = String::new();

    io::stdin()
        .read_line(&mut name)
        .expect("Failed to read line");

    let name = name.trim();             // ← add this: remove the trailing newline
    //  ↑
    //  this creates a NEW variable also called name
    //  the old mutable name is replaced by this new immutable one
    //  this is called "shadowing" — we will learn it properly in Lab 2

    let character_count = name.len();   // ← add this: count how many characters are in the name
    //                         ↑
    //                         .len() is a method that returns the length of a string

    println!("Hello, {}! Welcome to Rust.", name);  // ← update this line
    println!("You typed {} characters.", character_count); // ← add this line
}
```

---

### SAVE AND TRY

Save the file. Run:

```
cargo run
```

**You should see:**

```
What is your name? Ada
Hello, Ada! Welcome to Rust.
You typed 3 characters.
```

(The terminal shows your input on the same line as the prompt — that is normal.)

**In your terminal, try these experiments:**

1. Type a very long name. Does the character count go up?
2. Type a name with spaces like `Ada Lovelace`. Does it count the space too?
3. Press Enter without typing anything. What happens?

**Change something:** Change `"You typed {} characters."` to `"'{}' has {} letters."` and update the `println!` to include `name` before `character_count`:

```rust
println!("'{}' has {} letters.", name, character_count);
```

Confirm you see something like: `'Ada' has 3 letters.` Then change it back to the original.

---

## Part 7 — What Just Happened? The Full Picture

You have now run the complete chain we described earlier. Let us trace through it with your actual program:

**1. You wrote source code** (`src/main.rs`) — this lives on your hard drive (storage).

**2. You ran `cargo run`** — cargo invoked the Rust compiler (`rustc`) on your source file.

**3. The compiler read your source** into RAM, checked it for errors (type errors, undeclared variables, missing semicolons), and translated it to machine code.

**4. The compiler wrote the compiled binary** to `target/debug/hello_rust` on your hard drive. If you look in your project folder, you will find it there. On Windows it is `target\debug\hello_rust.exe`.

**5. Cargo ran the binary** — the operating system loaded it from storage into RAM and started the CPU executing its instructions.

**6. The CPU executed your instructions** — printed the question, waited for your input, stored your input in RAM, formatted the greeting string, printed it to the terminal.

Every time you type `cargo run`, this entire chain happens in under two seconds. You will repeat this cycle thousands of times as a programmer.

---

## Final Check

Verify every feature from this lab works before moving on:

| Feature | How to verify |
|---|---|
| Rust is installed | Run `rustc --version` — you see a version number |
| Cargo is installed | Run `cargo --version` — you see a version number |
| Project builds | Run `cargo run` from inside `hello_rust` — no red error text |
| Program asks for name | You see "What is your name?" before the program pauses |
| Program reads input | After typing and pressing Enter, the program continues |
| Program greets you | You see "Hello, [your name]! Welcome to Rust." |
| Character count works | You see "You typed [number] characters." and the number is correct |
| Trimming works | No blank line appears between the greeting and the count |

If any row fails, re-read the step that introduced that feature and look for a typo or missed line. The compiler error message will usually point you to the exact line with the problem.

---

## Quick Check Answers

**1. When you write code in a file and "run" it, what actually happens between the file and the computer executing it?**

Your source file lives on storage (the hard drive). When you run `cargo run`, the Rust compiler reads the source file from storage into RAM, checks it for errors, and translates it into machine code — a binary sequence of CPU instructions. The compiler writes that binary back to storage (`target/debug/hello_rust`). Then Cargo tells the operating system to run that binary. The OS loads it from storage into RAM, and the CPU begins executing the instructions one at a time. In this lab you watched `cargo run` trigger every step of this chain.

**2. Your program stores the number `42` in a variable. Where does that number physically live while the program is running?**

In RAM — Random Access Memory. The variable `let count = 42` causes the number 42 to be stored at a specific address in RAM. The variable name `count` is an alias the compiler uses to remember which address. While the program runs, the CPU reads and writes that RAM address whenever your code uses `count`. When the program ends, that memory is released — the number is gone.

**3. What would happen if you tried to give a computer instructions in plain English instead of a programming language?**

Plain English is ambiguous, context-dependent, and grammatically loose in ways that make it impossible for a computer to translate reliably. "Add the scores" — which scores? Where are they? Add how? Programming languages solve this by being completely precise: every word has exactly one meaning, every structure follows exact rules, and nothing is left to interpretation. The compiler can translate a programming language to machine code because there is no ambiguity. Natural language processing (AI) can interpret English — but that is a separate program running on top of the computer, not the computer itself responding to English.
