# Rust Web Server — LAB 10 — The Operating System, System Calls, and File Descriptors

**Prerequisites:** LAB 01–09. You understand all of Phase 1 plus strings and slices. You have built a log parser that processes structured text.

**What this lab adds:**
- What an operating system actually is — the kernel, its job, and why it exists
- Kernel space vs user space — two CPU modes with completely different privileges
- System calls — the one and only way your program talks to hardware
- File descriptors — the OS abstraction that unifies files, sockets, pipes, and terminals
- `stdin`, `stdout`, and `stderr` — what they are at the OS level, not just the Rust level
- Lifetimes — formally introduced because OS resources make the borrow checker's lifetime tracking unavoidable
- A process inspector: a Rust program that reads information about its own process from the OS

**Time:** 5–7 hours. This lab is conceptually the richest in the series so far. The OS material in Parts 1–3 has no code — read it fully before starting Part 4. You will understand every piece of code you have ever written differently after this lab.

---

> **Quick Check — try to answer before reading further:**
>
> 1. When you call `println!("hello")` in Rust, text appears on your screen. How many steps do you think are between that function call and the hardware that actually lights up the pixels?
> 2. Two programs are running at the same time on your computer. What stops them from accidentally reading each other's memory — or from one program crashing the other?
> 3. You have used `io::stdin()` since Lab 01. It reads from "standard input." What do you think standard input actually is — where does it come from?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

By the end of this lab, you have a Rust program that interrogates the OS about itself — reading its own process ID, environment variables, and command-line arguments through system calls:

```
$ cargo run -- --verbose debug

Process Information
───────────────────────────────────────────
PID:              47832
Working dir:      /home/user/projects/process_info
Executable:       /home/user/projects/process_info/target/debug/process_info

Command-line arguments:
  [0] /home/user/.../process_info  (the program itself)
  [1] --verbose
  [2] debug

Environment variables (selected):
  HOME  =  /home/user
  PATH  =  /usr/local/bin:/usr/bin:/bin
  USER  =  user

File descriptor check:
  stdin  (fd 0): connected to terminal
  stdout (fd 1): connected to terminal
  stderr (fd 2): connected to terminal
```

Every piece of that output comes from the OS through system calls. Understanding how this works is the foundation for Lab 13, where your program will accept HTTP connections — also through system calls.

---

## Part 1 — The Operating System

### Concept: The Operating System — What It Actually Is

**What it is:** An operating system is a program that runs permanently on your computer and acts as an intermediary between all other programs and the hardware. It manages every resource the hardware provides — CPU time, memory, storage, network interfaces, input devices — and decides which programs get access to what and when.

**Why it exists — the three fundamental problems it solves:**

**Problem 1: Hardware is dangerous to touch directly.**

A program that could directly control hardware could do anything: corrupt another program's memory, overwrite the disk, send arbitrary network packets, freeze the CPU for other programs. Without an intermediary, every program is a potential catastrophe.

**Problem 2: Programs need to share resources.**

Your computer runs dozens of programs simultaneously. They all need CPU time. They all need memory. Some need the same files, the same network port, the same screen. Without coordination, they would collide — two programs writing to the same memory address simultaneously, two servers trying to listen on port 80 at the same time.

**Problem 3: Programs need a consistent interface to hardware.**

Your computer might have an NVIDIA or AMD or Intel GPU. An SSD or a spinning disk. An Intel or ARM CPU. Without abstraction, every program would need a different version for every hardware combination. The OS provides a stable interface — programs talk to the OS, and the OS deals with the hardware differences.

**The OS's job, stated precisely:**

The OS is the **resource manager** and **hardware abstractor**. It:
- Allocates memory to programs (and reclaims it when they finish)
- Schedules CPU time among running programs
- Mediates all access to hardware through controlled interfaces
- Provides a consistent interface that works regardless of specific hardware
- Enforces isolation — one program cannot touch another's memory

**The kernel:**

The core of the OS is called the **kernel**. It is a special program that runs with full hardware privileges — it can access any memory, talk to any device, and execute any CPU instruction. Your programs do not run with these privileges. They run in a restricted environment called **user space**. The kernel runs in **kernel space**.

---

### Concept: Kernel Space vs User Space — Two Modes of CPU Execution

**What they are:** Modern CPUs have at least two privilege levels — modes of operation that determine which instructions are legal to execute and which memory addresses are accessible.

**The physical mechanism — CPU rings:**

Intel and AMD CPUs implement four privilege rings (Ring 0 through Ring 3). Most operating systems use only two:

```
Ring 0 — Kernel mode (highest privilege):
  - Can execute any CPU instruction
  - Can access any memory address
  - Can talk directly to hardware devices
  - Can modify page tables (the memory map)
  - The OS kernel runs here

Ring 3 — User mode (restricted):
  - Cannot execute privileged instructions
  - Cannot access kernel memory
  - Cannot talk directly to hardware
  - Cannot modify the memory map
  - All your programs run here
```

**What happens when user code tries to do something privileged:**

If a user-mode program tries to execute a privileged instruction (like reading another process's memory), the CPU immediately raises an exception — a hardware interrupt that transfers control to the kernel. The kernel examines the violation and usually terminates the offending program. This is what causes "segmentation fault" crashes — the program violated the memory protection rules the kernel set up.

**Why this matters for your web server:**

Every interesting thing your web server does — accepting a network connection, reading from a socket, writing a response — requires kernel intervention. The web server runs in user space. The network hardware is controlled by the kernel. User space cannot touch hardware directly. The bridge between them is the system call.

---

### Concept: System Call — The Bridge Between User Space and Kernel Space

**What it is:** A system call (syscall) is a controlled mechanism by which a user-space program requests a service from the kernel. It is the only way a user-space program can access hardware, the filesystem, the network, or any other OS-managed resource.

**What it hides:** A system call hides the complexity of hardware interaction and the privilege transition. When Rust's `println!` writes to your terminal, you do not think about DMA transfers, UART registers, or privilege level switches. The abstraction chain is:

```
Your code:    println!("hello")
                ↓
Rust stdlib:  io::Write::write()
                ↓
OS library:   write() function in libc
                ↓
System call:  SYS_write  (syscall number 1 on Linux x86-64)
                ↓
CPU:          switches from Ring 3 to Ring 0
                ↓
Kernel:       validates the request, writes bytes to the file descriptor
                ↓
Hardware:     terminal driver receives bytes, displays them
                ↓
CPU:          switches back to Ring 3
                ↓
Your code:    println! returns
```

Every `println!`, every file read, every network connection goes through this chain. The privilege switch happens thousands of times per second in a busy program.

**The cost of system calls:**

A system call is not free. The CPU must:
1. Save the current register state
2. Switch from Ring 3 to Ring 0
3. Validate the request
4. Execute the kernel code
5. Switch back to Ring 3
6. Restore the register state

This transition costs roughly 100–1000 nanoseconds — much more expensive than a normal function call (< 1 nanosecond). This is why buffering exists: instead of calling `write()` once per character (one syscall per character), Rust's `println!` accumulates characters in a buffer and calls `write()` once for the whole buffer. The `flush()` call you have used since Lab 01 forces that buffer to be sent immediately.

**The most important system calls for your web server:**

| Syscall | What it does | When you use it |
|---|---|---|
| `read` | Read bytes from a file descriptor | Reading from a socket, file, or stdin |
| `write` | Write bytes to a file descriptor | Writing a response, printing, logging |
| `open` | Open a file, get a file descriptor | Reading config files, log files |
| `close` | Release a file descriptor | Closing a connection or file |
| `socket` | Create a network socket | Starting the server |
| `bind` | Attach a socket to an address/port | Telling the OS "I own port 8080" |
| `listen` | Start accepting connections | Making the socket a server |
| `accept` | Accept one incoming connection | Handling each new client |
| `connect` | Connect to a remote address | Making outgoing connections |
| `fork` | Create a copy of the current process | Spawning worker processes |

You will use all of these by Lab 15. Understanding that they are all the same kind of thing — requests to the kernel — is the key mental model.

---

### Concept: File Descriptor — The OS Abstraction for "Things You Can Read and Write"

**What it is:** A file descriptor (fd) is a small non-negative integer that represents an open resource managed by the kernel. When your program opens a file, creates a socket, or connects a pipe, the kernel gives it a file descriptor. All subsequent operations on that resource use the fd number.

**What it hides:** A file descriptor hides the specific type of resource behind a uniform read/write interface. The same `read(fd, buffer, size)` system call works whether `fd` refers to:
- A file on disk
- A network socket
- A pipe between processes
- The terminal keyboard
- A network socket pretending to be a file
- A timer that becomes readable when time expires

The invariant file descriptors protect: **you cannot access a resource without a valid file descriptor for it, and you cannot get a valid fd without going through the kernel.** The kernel validates every operation on every fd. You cannot accidentally read from a closed socket or write to a file you do not have permission to write. The fd is the gatekeeper.

**The fd table:**

Every process has a private table of file descriptors — a mapping from fd numbers to kernel-managed resources:

```
Process fd table:
┌────┬─────────────────────────────────────────┐
│ fd │ resource                                │
├────┼─────────────────────────────────────────┤
│  0 │ stdin  — the terminal keyboard          │
│  1 │ stdout — the terminal display           │
│  2 │ stderr — the terminal display (errors)  │
│  3 │ (open file: /var/log/server.log)        │
│  4 │ (network socket: port 8080)             │
│  5 │ (accepted connection from 192.168.1.5)  │
└────┴─────────────────────────────────────────┘
```

File descriptors 0, 1, and 2 are always set up for you by the OS before your program starts. That is why `io::stdin()`, `io::stdout()`, and `io::stderr()` work without any initialization — they always exist.

When you `open()` a file, the kernel finds the lowest available fd number (starting from 3) and adds it to your table. When you `close()` a fd, the kernel removes it from the table and the fd number becomes available again.

**The file descriptor number is just an index into this table.** The actual resource — the kernel-managed structure representing an open file, socket, or pipe — lives inside the kernel. User space only ever sees the integer handle.

---

### Concept: stdin, stdout, stderr — Not Magic, Just File Descriptors

**What they are:** The three standard streams are simply the file descriptors 0, 1, and 2 that every process starts with.

**Where they come from:**

When your shell (bash, zsh, PowerShell) runs your program, it sets up the child process's fd table before the process starts. By default:
- fd 0 (stdin) is connected to the keyboard
- fd 1 (stdout) is connected to the terminal display  
- fd 2 (stderr) is connected to the terminal display

But the shell can redirect them:

```bash
program < input.txt          # fd 0 reads from input.txt instead of keyboard
program > output.txt         # fd 1 writes to output.txt instead of terminal
program 2> errors.txt        # fd 2 writes to errors.txt instead of terminal
program | other_program      # fd 1 of program connects to fd 0 of other_program (a pipe)
```

The program itself does not know or care about the redirection. It calls `read(0, ...)` to read from stdin and gets bytes — from wherever fd 0 is connected. The abstraction is complete.

**This is why `io::stdin()` in Rust works anywhere:**

```rust
io::stdin().read_line(&mut input)
```

This calls `read(0, buffer, size)` — the `read` system call on fd 0. Whether fd 0 is a keyboard, a file, a pipe from another program, or a network socket pretending to be stdin — the code is identical. The OS handles the difference.

**stderr vs stdout — why both exist:**

Programs write normal output to stdout (fd 1) and error messages to stderr (fd 2). This separation lets users redirect normal output to a file while still seeing errors on the terminal:

```bash
cargo build > build_output.txt    # normal output to file, errors still visible
```

Without the separation, you could not tell which output was data and which was a problem.

---

## Part 2 — Lifetimes

You have encountered lifetimes in error messages since Lab 03 — the borrow checker mentioning "lifetime" when references are involved. Now that you are working with OS resources (which have real, bounded lifetimes determined by the OS), lifetimes become unavoidable to understand.

### Concept: Lifetime — How Long a Reference Is Valid

**What it is:** A lifetime is the span of code during which a reference is valid — guaranteed to point to live, accessible data. Every reference in Rust has a lifetime. The borrow checker tracks them and verifies that no reference outlives its referent.

**What it hides:** Lifetime annotations hide the complexity of proving that references do not outlive their data. In C, this verification is entirely the programmer's responsibility — dangling pointers (references to freed memory) are one of the most common bugs. In Rust, the compiler proves it for you at compile time, using lifetime annotations as evidence.

The invariant lifetimes protect: **a reference always points to valid data.** A reference to a local variable cannot escape the function. A reference to a `Vec` element is invalidated if the `Vec` is reallocated. A reference to an OS resource is invalidated when the resource is closed. The compiler tracks all of this.

**When you do not write lifetimes:**

Most of the time, Rust infers lifetimes through **lifetime elision** — rules that let the compiler deduce lifetimes without you writing them. You have been using elision since Lab 01. These rules cover the vast majority of cases:

```rust
// You write:
fn first_word(s: &str) -> &str { ... }

// Rust reads it as:
fn first_word<'a>(s: &'a str) -> &'a str { ... }
// The output &str lives as long as the input &str
// Elision rule: one input reference → output gets the same lifetime
```

**When you must write lifetimes explicitly:**

Lifetime annotations become necessary when the compiler cannot infer which input a returned reference comes from:

```rust
// COMPILE ERROR — which input does the returned &str come from?
fn longer(a: &str, b: &str) -> &str {
    if a.len() > b.len() { a } else { b }
}

// CORRECT — tell the compiler: output lives as long as both inputs
fn longer<'a>(a: &'a str, b: &'a str) -> &'a str {
    if a.len() > b.len() { a } else { b }
}
```

`'a` is a lifetime parameter — a name for a lifetime, the same way `T` is a name for a type. `&'a str` means "a reference to a str that lives at least as long as `'a`."

**The lifetime annotation is not a constraint you impose — it is a description you provide.** You are not telling the compiler to make `a` and `b` live for the same duration. You are telling the compiler: "the output's validity depends on both inputs — it can only be used while both inputs are valid." The compiler uses this information to verify that callers use the return value correctly.

**Lifetime in structs:**

When a struct holds a reference, the struct's lifetime is bounded by the reference's lifetime:

```rust
struct ParsedLine<'a> {
    level:   &'a str,    // borrows from the original line string
    message: &'a str,    // borrows from the original line string
}
// ParsedLine cannot outlive the string it was parsed from
```

This is why `LogEntry` in Lab 09 used owned `String` fields instead of `&str` — a struct that stores references must not outlive the source data, which is a constraint that makes them harder to return from functions and store in collections. Owned `String` avoids this entirely at the cost of allocation.

**The `'static` lifetime:**

`'static` is a special lifetime meaning "lives for the entire duration of the program." String literals have `'static` lifetime — they are baked into the binary and never freed. When you see `&'static str`, it means a string reference that is always valid, forever.

```rust
let greeting: &'static str = "hello";  // baked into the binary — lives forever
```

---

## Part 3 — The Environment Your Program Lives In

### Concept: Process — A Running Program

**What it is:** A process is a running instance of a program. It has:
- Its own private virtual memory space (no other process can read it)
- Its own fd table (file descriptors are not shared between processes)
- Its own CPU state (registers, stack pointer, program counter)
- A unique **process ID** (PID) — an integer the OS assigns at creation

**Virtual memory — why processes cannot read each other:**

Each process sees a private address space — a map of memory addresses that appears to be the entire machine's memory, but is actually a translation layer managed by the kernel. Address `0x1000` in process A maps to a different physical RAM location than address `0x1000` in process B. The CPU's **memory management unit** (MMU) performs this translation on every memory access. Processes live in isolated bubbles by hardware enforcement.

**The environment a process starts with:**

When the OS creates a process, it provides three things:
1. **Command-line arguments** — the words after the program name: `cargo run -- --verbose debug` gives `["cargo", "run", "--", "--verbose", "debug"]`
2. **Environment variables** — key-value pairs inherited from the shell: `HOME`, `PATH`, `USER`, etc.
3. **File descriptors** — at minimum, fd 0/1/2 (stdin/stdout/stderr)

All three are accessible in Rust through the `std::env` module.

---

## Part 4 — Building the Process Inspector

### Step 1 — Create the Project

```
cargo new process_info
cd process_info
```

Open `src/main.rs`. Replace everything:

```rust
use std::env;   // ← the standard library's environment module
                //   provides access to args, env vars, and process info

fn main() {
    println!("Process Information");
    println!("{}", "─".repeat(43));  // ← repeat "─" 43 times to make a separator line
    println!();
}
```

**`"─".repeat(n)`:** The `.repeat(n)` method on `&str` returns a new `String` with the original repeated `n` times. `"─".repeat(43)` produces 43 em-dash characters — a visual separator. This is the first appearance of `.repeat()` — defined here before use.

---

### SAVE AND TRY

```
cargo run
```

**You should see:**

```
Process Information
───────────────────────────────────────────

```

---

### Step 2 — Read the Process ID

Add process ID retrieval. The PID requires a system call — Rust provides it through `std::process`:

```rust
use std::env;
use std::process;   // ← add this: provides process::id() and process::exit()

fn main() {
    println!("Process Information");
    println!("{}", "─".repeat(43));
    println!();

    // Process ID — obtained via the getpid() system call internally
    let pid = process::id();   // ← calls getpid() syscall — returns u32
    println!("PID:              {}", pid);
}
```

**What `process::id()` does under the hood:**

It calls the `getpid` system call — syscall number 39 on Linux x86-64. The kernel looks up the calling process in its process table and returns the PID. On Linux you can verify this:

```bash
strace -e getpid cargo run 2>&1 | grep getpid
```

`strace` is a Linux tool that intercepts and prints every system call a program makes. You will see `getpid()` appear in the output. This is how you can directly observe the kernel calls any program makes.

---

### SAVE AND TRY

```
cargo run
```

**You should see:**

```
Process Information
───────────────────────────────────────────

PID:              47832
```

(Your PID will be different — the OS assigns it fresh each run.)

**Run it three times.** The PID changes each run — the OS assigns a new process ID each time your program starts.

**Change something:** Run two terminal windows simultaneously with `cargo run` and observe they get different PIDs. This demonstrates that each run is a separate process with its own identity.

---

### Step 3 — Read the Working Directory and Executable Path

```rust
fn main() {
    println!("Process Information");
    println!("{}", "─".repeat(43));
    println!();

    let pid = process::id();
    println!("PID:              {}", pid);

    // Current working directory — the folder the terminal was in when the program started
    // Returns Result<PathBuf, io::Error> — can fail if permissions deny access
    match env::current_dir() {
        Ok(path) => println!("Working dir:      {}", path.display()),
        //                                              ↑
        //                                              .display() converts PathBuf to
        //                                              a displayable form — handles
        //                                              platform differences (/ vs \)
        Err(e)   => println!("Working dir:      (error: {})", e),
    }

    // Path to the running executable
    match env::current_exe() {
        Ok(path) => println!("Executable:       {}", path.display()),
        Err(e)   => println!("Executable:       (error: {})", e),
    }

    println!();
}
```

**`PathBuf` — a new type:**

`PathBuf` is an owned, platform-aware path — like `String` but for filesystem paths. It handles the difference between Unix paths (`/home/user/file`) and Windows paths (`C:\Users\user\file`) automatically. `path.display()` produces a platform-appropriate string representation for printing.

`env::current_dir()` and `env::current_exe()` return `Result<PathBuf, io::Error>` — they are fallible operations. The directory might not be accessible; the executable path might not be resolvable. We handle both cases with `match`.

---

### SAVE AND TRY

```
cargo run
```

**You should see:**

```
PID:              47832
Working dir:      /home/user/projects/process_info
Executable:       /home/user/projects/process_info/target/debug/process_info

```

**Change something:** Run from a different directory:

```bash
cd /tmp
cargo run --manifest-path /path/to/process_info/Cargo.toml
```

The working directory should show `/tmp` while the executable path remains unchanged. This demonstrates that the working directory is the terminal's current location, not the program's location.

---

### Step 4 — Read Command-Line Arguments

```rust
// After the executable path, add:

println!("Command-line arguments:");

// env::args() returns an iterator over the argument strings
// Argument 0 is always the program's own path
for (index, arg) in env::args().enumerate() {
    //                          ↑
    //                          .enumerate() wraps each element with its index
    //                          produces (0, first_arg), (1, second_arg), etc.
    let note = if index == 0 { " (the program itself)" } else { "" };
    println!("  [{}] {}{}", index, arg, note);
}

println!();
```

**`.enumerate()` — a new iterator adapter:**

`.enumerate()` wraps an iterator to also produce the index of each element. Instead of producing `"hello"`, it produces `(0, "hello")`. The `for (index, arg)` destructures each tuple into two named variables. You will use `.enumerate()` constantly when you need both the position and the value.

**`env::args()` and ownership:**

`env::args()` returns an iterator of owned `String` values — each argument is a separate `String` allocated from the OS-provided argument data. The OS passes arguments as null-terminated C strings; Rust converts them to `String` as they are accessed.

---

### SAVE AND TRY

```
cargo run -- --verbose debug
```

The `--` tells cargo to pass everything after it to your program, not to cargo itself.

**You should see:**

```
Command-line arguments:
  [0] /path/to/process_info/target/debug/process_info (the program itself)
  [1] --verbose
  [2] debug

```

**Change something:** Run without arguments: `cargo run`. Only argument 0 appears. Run with many arguments: `cargo run -- a b c d e`. All appear with their indices.

---

### Step 5 — Read Environment Variables

```rust
// After the arguments, add:

println!("Environment variables (selected):");

// The variables we want to display — a compile-time fixed list
let interesting_vars = ["HOME", "PATH", "USER", "USERNAME", "SHELL", "TERM"];
//                      ↑
//                      a fixed-size array of &str — lives on the stack
//                      on Windows, HOME → USERPROFILE, USER → USERNAME

for var_name in &interesting_vars {
    // env::var() looks up one variable by name
    // returns Result<String, VarError>
    // VarError::NotPresent if the variable does not exist
    // VarError::NotUnicode if the value is not valid UTF-8
    match env::var(var_name) {
        Ok(value) => {
            // Truncate long values (PATH can be hundreds of characters)
            let display = if value.len() > 60 {
                format!("{}...", &value[..60])  // show first 60 bytes + "..."
                //                ↑
                //                &value[..60] is a string slice — first 60 bytes
                //                safe here because PATH is ASCII
            } else {
                value
            };
            println!("  {:8} =  {}", var_name, display);
            //        ↑
            //        {:8} formats var_name in a field 8 characters wide, left-aligned
            //        padding with spaces to align the = signs
        }
        Err(_) => {
            // Variable not set on this system — skip silently
        }
    }
}

println!();
```

**Format width specifiers:**

`{:8}` formats a value in a field exactly 8 characters wide, padded with spaces on the right. `{:>8}` right-aligns. `{:^8}` centers. These are the same format specifiers as Python's `str.format()`. You will use them to produce aligned output in the web server's log format.

**`env::var()` and OS interaction:**

`env::var("HOME")` calls the `getenv()` C library function, which reads from the process's environment block — a region of memory set up by the OS before your program started, containing all inherited environment variables. On Linux, you can see a process's full environment at `/proc/<PID>/environ`.

---

### SAVE AND TRY

```
cargo run
```

**You should see:**

```
Environment variables (selected):
  HOME     =  /home/user
  PATH     =  /usr/local/bin:/usr/bin:/bin:/usr/local/games:/usr/games...
  USER     =  user
  SHELL    =  /bin/bash
  TERM     =  xterm-256color

```

**Change something:** Set a custom environment variable when running:

```bash
MY_VAR=hello cargo run
```

Then add `"MY_VAR"` to the `interesting_vars` array. Run with the variable set — it appears. Run without — it is absent (the `Err` arm skips it). Remove `"MY_VAR"` from the array when done.

---

### Step 6 — Inspect the File Descriptors

Now the most direct OS interaction of the lab — checking the file descriptors. We will use the `std::os::unix::io` module on Unix, with a Windows fallback:

```rust
println!("File descriptor check:");

// Check each standard stream by attempting to get metadata about it
// On Unix, file descriptors 0, 1, 2 are always open
// We verify they are connected to a terminal using the isatty() concept
// std::io::IsTerminal is the Rust 1.70+ way to check this

use std::io::IsTerminal;   // ← trait providing .is_terminal() method

let stdin_is_tty  = std::io::stdin().is_terminal();
let stdout_is_tty = std::io::stdout().is_terminal();
let stderr_is_tty = std::io::stderr().is_terminal();

println!("  stdin  (fd 0): {}",
    if stdin_is_tty  { "connected to terminal" } else { "redirected (not a terminal)" }
);
println!("  stdout (fd 1): {}",
    if stdout_is_tty { "connected to terminal" } else { "redirected (not a terminal)" }
);
println!("  stderr (fd 2): {}",
    if stderr_is_tty { "connected to terminal" } else { "redirected (not a terminal)" }
);
```

**`IsTerminal` — what it does:**

`.is_terminal()` calls the `isatty()` system call (on Unix) or `GetConsoleMode()` (on Windows). The kernel checks whether the file descriptor is connected to an interactive terminal — a real keyboard and screen — or whether it has been redirected to a file or pipe. This is how programs like `ls` detect whether to use colors (terminal) or plain text (redirected to file).

---

### SAVE AND TRY

```
cargo run
```

**You should see:**

```
File descriptor check:
  stdin  (fd 0): connected to terminal
  stdout (fd 1): connected to terminal
  stderr (fd 2): connected to terminal
```

**Now redirect stdout to a file:**

```bash
cargo run > /tmp/output.txt
```

Then read the file: `cat /tmp/output.txt`. You should see stdout shows "redirected" — because fd 1 is now connected to the file, not the terminal. stdin and stderr are still terminals.

**This is the most direct demonstration of file descriptors in the lab.** The program's code is identical either way. The OS changed what fd 1 refers to before the program started.

---

The complete `src/main.rs`:

```rust
use std::env;
use std::process;
use std::io::IsTerminal;

fn main() {
    println!("Process Information");
    println!("{}", "─".repeat(43));
    println!();

    println!("PID:              {}", process::id());

    match env::current_dir() {
        Ok(path) => println!("Working dir:      {}", path.display()),
        Err(e)   => println!("Working dir:      (error: {})", e),
    }

    match env::current_exe() {
        Ok(path) => println!("Executable:       {}", path.display()),
        Err(e)   => println!("Executable:       (error: {})", e),
    }

    println!();
    println!("Command-line arguments:");

    for (index, arg) in env::args().enumerate() {
        let note = if index == 0 { " (the program itself)" } else { "" };
        println!("  [{}] {}{}", index, arg, note);
    }

    println!();
    println!("Environment variables (selected):");

    let interesting_vars = ["HOME", "PATH", "USER", "USERNAME", "SHELL", "TERM"];

    for var_name in &interesting_vars {
        match env::var(var_name) {
            Ok(value) => {
                let display = if value.len() > 60 {
                    format!("{}...", &value[..60])
                } else {
                    value
                };
                println!("  {:8} =  {}", var_name, display);
            }
            Err(_) => {}
        }
    }

    println!();
    println!("File descriptor check:");

    println!("  stdin  (fd 0): {}",
        if std::io::stdin().is_terminal()  { "connected to terminal" }
        else { "redirected (not a terminal)" }
    );
    println!("  stdout (fd 1): {}",
        if std::io::stdout().is_terminal() { "connected to terminal" }
        else { "redirected (not a terminal)" }
    );
    println!("  stderr (fd 2): {}",
        if std::io::stderr().is_terminal() { "connected to terminal" }
        else { "redirected (not a terminal)" }
    );
}
```

---

## 🎯 Challenge: Parse Command-Line Flags

**You know:** `env::args()`, iterators, `String`, `HashMap`, `Option`, `match`.

**Task:** Write a function `parse_args() -> HashMap<String, Option<String>>` that parses the command-line arguments into a map of flag names to optional values.

Rules:
- `--flag` with no following value → maps `"flag"` to `None`
- `--flag value` (next arg does not start with `--`) → maps `"flag"` to `Some("value")`
- Skip argument 0 (the program name)

Test cases:

```
cargo run -- --verbose --port 8080 --debug
→ { "verbose": None, "port": Some("8080"), "debug": None }

cargo run -- --host localhost --port 3000
→ { "host": Some("localhost"), "port": Some("3000") }

cargo run
→ {}
```

Print each parsed flag and value at the end of `main()`.

**Hints:**
1. `env::args().skip(1)` skips argument 0 (the program name)
2. Use a `Peekable` iterator — `.peekable()` on an iterator lets you look at the next element without consuming it: `iter.peek()` returns `Option<&String>`
3. A flag starts with `"--"` — check with `.starts_with("--")`
4. Strip the `"--"` prefix with `&arg[2..]` — a slice from byte 2 to the end

Try for at least 15 minutes before revealing.

---

<details>
<summary>▶ Show Solution</summary>

```rust
use std::collections::HashMap;

fn parse_args() -> HashMap<String, Option<String>> {
    let mut flags: HashMap<String, Option<String>> = HashMap::new();

    let mut args = env::args()
        .skip(1)        // skip arg[0] — the program name
        .peekable();    // wrap in Peekable so we can peek at the next element

    while let Some(arg) = args.next() {
        //  ↑
        //  while let: loop while the pattern matches
        //  equivalent to: loop { match args.next() { Some(a) => ..., None => break } }

        if arg.starts_with("--") {
            let flag_name = arg[2..].to_string();   // strip "--" prefix

            // Peek at the next argument to see if it is a value or another flag
            let value = match args.peek() {
                Some(next) if !next.starts_with("--") => {
                    // next exists AND does not start with "--" — it is a value
                    Some(args.next().unwrap())  // consume it (peek does not consume)
                }
                _ => None,  // next is another flag, or there is no next — no value
            };

            flags.insert(flag_name, value);
        }
        // Non-flag arguments (positional) are ignored for now
    }

    flags
}
```

In `main()`:

```rust
println!();
println!("Parsed flags:");
let flags = parse_args();
if flags.is_empty() {
    println!("  (none)");
} else {
    for (flag, value) in &flags {
        match value {
            Some(v) => println!("  --{} = {}", flag, v),
            None    => println!("  --{} (boolean flag)", flag),
        }
    }
}
```

**Key insight:** `Peekable` is an iterator adapter that adds one method: `.peek()`. It returns a reference to the next element without advancing the iterator. This "look ahead without consuming" capability is essential for parsers — you often need to see what is coming before deciding what the current token means. The HTTP parser in Lab 13 uses the same lookahead pattern when distinguishing between header continuation lines and new headers.

</details>

---

## 🎯 Challenge 2: The Syscall Experiment

**This is an observation challenge — no new code to write.**

Run your `process_info` program and then examine it from outside using OS tools. These commands work on Linux and macOS:

```bash
# In one terminal, run the program in a way that keeps it alive
# (We will add a pause — type this in main.rs temporarily)
use std::io::Read;
std::io::stdin().read(&mut [0u8]).ok(); // wait for one keypress
```

```bash
# In another terminal, while the first is waiting:

# See the process in the process list:
ps aux | grep process_info

# See all open file descriptors:
ls -la /proc/$(pgrep process_info)/fd/

# See the process's memory map:
cat /proc/$(pgrep process_info)/maps | head -20

# See every system call in real time:
strace -p $(pgrep process_info) 2>&1
```

**What you should observe:**
- `/proc/<PID>/fd/` shows symbolic links for each open file descriptor — 0, 1, 2 pointing to `/dev/pts/X` (your terminal)
- The memory map shows the program binary, the stack, the heap, and shared libraries
- `strace` shows system calls happening in real time as you interact with the program

On macOS, use `lsof -p <PID>` instead of the `/proc` filesystem. On Windows, use Process Explorer (from Sysinternals) or Task Manager's handles view.

**The goal:** See with your own eyes that everything taught in Parts 1–3 is real and observable — not theoretical. The fd table, the syscalls, the memory layout — they all exist and can be inspected.

---

## Final Check

| Feature | How to verify |
|---|---|
| PID prints and changes each run | Run three times — different numbers each time |
| Working dir reflects terminal location | Run from `/tmp` — shows `/tmp` |
| Executable path shows full path | Full path to the binary visible |
| Arguments passed with `--` appear | `cargo run -- --verbose` shows `--verbose` as arg[1] |
| Environment variables display | HOME, PATH, USER visible (if set on your system) |
| Long PATH is truncated | PATH truncates at 60 chars with `...` |
| stdin/stdout/stderr as terminal | Running normally — all show "connected to terminal" |
| stdout redirect detected | `cargo run > /tmp/out.txt` — stdout shows "redirected" |
| Flag parser handles `--flag value` | `--port 8080` → port maps to Some("8080") |
| Flag parser handles boolean flags | `--verbose` → verbose maps to None |

---

## Quick Check Answers

**1. How many steps are between `println!("hello")` and pixels lighting up?**

At least seven distinct layers. Your Rust code calls `println!` which writes to a buffer in user space. When the buffer is flushed, Rust calls the `write()` system call — this triggers a CPU privilege switch from Ring 3 to Ring 0. The kernel validates the request, looks up fd 1 in your process's fd table, and finds it connected to a terminal device. The kernel calls the terminal driver, which processes the bytes according to the terminal's settings (line discipline). The driver writes to the terminal emulator — a process managing your terminal window. The terminal emulator renders the characters using a font, producing pixel data. The pixel data goes through the display server (X11, Wayland, or the Windows compositor), which composites it with other windows. The display driver sends the final pixel values to the GPU. The GPU writes to the framebuffer. The display hardware reads the framebuffer and sends electrical signals to the monitor. The monitor drives the physical pixels. The entire chain completes in under one millisecond — fast enough to appear instantaneous.

**2. What prevents two programs from reading each other's memory?**

Virtual memory, enforced by hardware. Each process has its own virtual address space — a private map of addresses that are translated to physical RAM locations by the CPU's memory management unit (MMU) on every memory access. The kernel configures the MMU's page tables (translation maps) for each process. When process A reads address `0x1000`, the MMU translates it to one physical location. When process B reads the same address `0x1000`, the MMU translates it to a completely different physical location. Process A's translation tables never include process B's physical memory. If a process tries to access an address outside its own mapped pages, the MMU raises a hardware exception, the kernel intercepts it, and the offending process is terminated. This is "segmentation fault" — the process violated the memory segmentation rules. The protection is enforced by hardware on every single memory access, with no way for user-space code to bypass it.

**3. What is standard input, really?**

Standard input is file descriptor 0 — an entry in your process's file descriptor table that the OS sets up before your program starts. By default, fd 0 is connected to your terminal's keyboard driver — a kernel structure that receives characters as you type them. When your program calls `read(0, buffer, size)`, the kernel waits until the keyboard driver has data available, then copies those bytes into your buffer. The program does not know or care that it is reading from a keyboard — it just reads from fd 0. When you redirect stdin with `program < file.txt`, the shell sets up fd 0 to point to the file before starting your program. The program's code is identical — it still calls `read(0, ...)`. The OS changed what fd 0 refers to. This is why `io::stdin()` in Rust works everywhere without the program knowing its source.
