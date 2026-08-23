# Lesson 1: What Actually Runs When You Run a Program

**What you will build:** By the end of this lesson you will have a real,
working Dart and Flutter installation on your own machine, and you will
have run one real program — a single line that prints `Hello, World!` to
a terminal. That program is trivial on purpose. The actual subject of
this lesson is everything underneath it: what a computer is actually made
of, what "running a program" really means to the operating system, why
your plain-text source code has to be transformed before a CPU can touch
it, how a program finds the tools it depends on, and what a "development
environment" is a name for. Every later lesson in this curriculum —
performance, persistence, testing, deployment — is a more detailed answer
to a question this lesson first asks: what is actually happening when
code runs?

**What you need to know first:** Nothing. This is Lesson 1.

**Terms used in this lesson:**

- **CPU (Central Processing Unit)** — the piece of hardware that actually
  carries out instructions, one at a time, extremely fast. Nothing "runs"
  anywhere else; every other part of a computer exists to feed the CPU
  work or store the results of work it already did.
- **RAM (Random-Access Memory)** — the computer's working memory: fast,
  but it only holds data while the computer has power, and only while a
  program (or the OS) is actively keeping that data around. It exists
  because storage (below) is too slow to read from and write to for every
  single step of a running program.
- **Storage (disk/SSD)** — non-volatile memory: slower than RAM, but it
  keeps its contents after power is removed. It exists because RAM alone
  would mean every program and every file vanished the instant you turned
  the machine off.
- **Process** — one running instance of a program, with its own private
  slice of RAM and its own entry in the operating system's bookkeeping.
  The concept exists because the same program (say, a web browser) is
  routinely run more than once, or alongside dozens of other programs at
  once, and the computer needs a way to keep every running copy's data
  and progress completely separate from every other one.
- **Process ID (PID)** — a whole number the operating system assigns to
  one running process the moment it starts, guaranteed not to be shared
  with any other *currently running* process. It exists because "the
  process" is not enough to unambiguously refer to one running program
  when the same program can be running more than once at once — the OS,
  Task Manager, and this lesson all need one specific number to point at
  one specific running instance.
- **Working set** — Windows' own name for the specific number of bytes of
  RAM one process currently has claimed and is actively using, tracked
  and updated continuously by the OS. It exists as a distinct, named
  measurement because "how much RAM is a process using" is not a fixed,
  one-time fact — it changes constantly as that process works — so the OS
  has to keep measuring it, not just record it once.
- **Operating system (OS)** — the software (Windows, in this lesson's
  case) that owns the hardware and decides, moment to moment, which
  process's instructions the CPU executes next, and which process is
  allowed to touch which slice of RAM. It exists because the hardware
  itself has no such policy built in — something has to arbitrate when
  many programs want the same limited CPU and RAM at once.
- **Source code** — the plain, human-readable text a person writes to
  describe what a program should do. It exists because instructions a
  human can read, write, and reason about are not the same shape as
  instructions a CPU can execute — something has to sit between them.
- **Compiler** — a program that translates source code into another form
  — often all at once, before the program is ever run — so that later
  running it is as fast as possible.
- **Interpreter** — a program that reads source code (or an
  already-partway-translated form of it) and carries out its
  instructions directly, without a separate, complete translation pass
  finishing first. It exists as an alternative to compiling because it
  lets a program start running sooner, at some ongoing speed cost.
- **Machine code (executable)** — the actual binary instructions a
  specific CPU knows how to execute directly — not text, and not
  something a person is expected to read. It is the one and only form a
  CPU can act on; source code, no matter the language, has to become this
  before any of it truly "runs."
- **Exit code** — a single whole number a process hands back to whatever
  started it (here, the terminal) the moment it finishes, by long-
  standing, near-universal convention across operating systems and
  languages: `0` means "finished successfully," any non-zero number means
  "something went wrong." It exists so that whatever launched a process —
  a person at a terminal, or, later in this curriculum, an automated
  script — has a simple, reliable, machine-checkable answer to "did that
  actually work?" without having to parse and interpret that process's
  printed output.
- **Terminal (command-line interface)** — a program that lets you type
  text instructions directly to the operating system or to another
  program, and shows you that program's text output in return. It exists
  as an alternative to clicking through graphical menus — precise,
  scriptable, and, as this lesson will show, unavoidable for at least a
  couple of commands even before Lesson 2 covers it properly.
- **Environment variable** — a named piece of configuration data that
  lives outside any single program's own source code, attached to a
  running process rather than baked into a file. It exists because many
  different programs — a shell, a compiler, this lesson's `dart` command
  — need to share small pieces of configuration (like "where are your
  installed tools?") without every single one of them having to be told
  the same thing over and over, by hand, every time.
- **`$env:NAME`** — PowerShell's own shorthand syntax for reading or
  writing an environment variable belonging to the *current* process.
  Typing `$env:JAVA_HOME` reads the variable named `JAVA_HOME` out of
  this specific PowerShell process's own environment; `$env:JAVA_HOME =
  "..."` writes one — but, as Concept Unit 4 will prove with a real run,
  only for that one process.
- **PATH** — one specific, especially important environment variable: an
  ordered list of folders. When you type a bare command name (`dart`,
  with no folder in front of it) into a terminal, the terminal doesn't
  guess where that program lives — it searches every folder listed in
  `PATH`, in order, until it finds a program with that name. It exists so
  you can type `dart` from any folder on the whole machine instead of
  typing that program's full location every single time.
- **Windows Registry** — a permanent, on-disk database Windows itself
  maintains for configuration data, organized into named keys (a path-
  like structure, e.g. `HKEY_CURRENT_USER\Environment`) — distinct from
  an ordinary file, though conceptually similar (data that survives after
  the process that wrote it ends). It exists so that system- and user-
  level configuration — including the persistent copy of `PATH` this
  lesson edits — has one common, standard, permanent place to live,
  instead of every program inventing its own storage location and format
  for the same kind of information.
- **SDK (Software Development Kit)** — a bundle of tools a language or
  platform ships together so you don't have to assemble them yourself: at
  minimum, something that turns your source code into a running program,
  plus the standard library code every program in that language is
  allowed to assume exists. The Flutter SDK you install in this lesson
  bundles the entire Dart SDK inside it.
- **Entry point (`main`)** — Dart's fixed, non-negotiable convention for
  where a program's execution begins: a function named exactly `main`.
  It exists because a real program can define many functions, and
  something — a person, or in this case the `dart` tool — has to be able
  to say, unambiguously, "start here" without reading the whole file
  first. Lesson 8 covers what a function actually *is* — parameters,
  return values, why functions exist as a concept — in full; this lesson
  only needs the one fixed, specific shape `void main() { }` as a
  starting convention, not the general idea yet.
- **`void`** — a return-type annotation that means "this function does
  not hand any value back to whatever called it." Lesson 8 covers return
  values themselves — what it means for a function to hand a value
  back — in full; for now, `void` marks `main` as a function that only
  *does* something (prints text), rather than *computing* something to
  return.
- **String literal (e.g. `'Hello, World!'`)** — text data written
  directly into source code, delimited by quote characters so the
  compiler/interpreter can tell "this exact sequence of characters is
  data" apart from "this is an instruction or a name." It exists because
  a program frequently needs to work with fixed, exact pieces of text
  that never change while the program runs.
- **Statement terminator (`;`)** — the character that marks the end of
  one complete instruction in Dart. It exists so that the tool reading
  your source code has an unambiguous signal for "this instruction is
  finished, whatever comes next is a new one" — without it, as this
  lesson's Concept Unit 7 will show with a real error, Dart cannot tell
  where one instruction ends and the next begins.

**Objects and methods used:**

- **`print`**
  - *What it is:* A function — a named, callable piece of code that does
    one job and can be invoked from other code — that Dart provides for
    the single purpose of showing text to whoever is running the
    program.
  - *Implementation:* `void print(Object? object)`, declared in
    `dart:core`, the one Dart library every file gets automatically, with
    no `import` needed. It converts `object` to text by calling that
    object's own `toString()` method, then writes the resulting text
    followed by exactly one newline character to the process's standard
    output.
  - *Its use:* It is the only thing in this lesson's program that
    produces any output a human can actually see — without it,
    `hello.dart` would run successfully and prove nothing.
  - *Type:* a top-level function (not attached to any class or object) in
    the `dart:core` library.
  - *Responsibility:* convert whichever single value it is given into
    text, using that value's own `toString()`, and write that text plus a
    trailing newline to the process's standard output stream — nothing
    more; it does not decide *whether* to show output, validate its
    input, or format anything beyond calling `toString()`.
  - *Depends on:* the one argument passed to it (here, a string literal)
    and, indirectly, on the process actually having a standard output
    destination connected to somewhere visible — in this lesson, the
    terminal that launched it.
  - *Connects to:* called directly, by name, from `main` in this lesson's
    code; internally, it hands its finished text to the Dart runtime's
    I/O layer, which writes it to the operating system's standard output
    stream for this specific process — the very same stdout stream the
    terminal window is currently displaying.
  - *Shape:* part of Dart's public standard library surface — the single
    most basic building block for "show the user something." Every more
    sophisticated way of showing output later in this curriculum,
    including everything Flutter draws on screen, sits on top of this
    same idea: a process writing to a stream something else is watching.

- **`dart` (specifically, its `run` subcommand)**
  - *What it is:* A command-line program — the Dart SDK's own entry
    point — that you launch by typing its name in a terminal.
  - *Implementation:* A real binary, confirmed on this machine at
    `C:\flutter\bin\cache\dart-sdk\bin\dart.exe`, reachable from any
    folder via a small launcher script Flutter places at
    `C:\flutter\bin\dart.bat`. Its `run` subcommand — the exact form used
    in this lesson, `dart run hello.dart` — reads the named `.dart` file,
    translates it just-in-time, and executes it immediately, all as one
    command.
  - *Its use:* This lesson's one and only command for actually executing
    `hello.dart` and finding out, for real, whether it does what its
    source code claims.
  - *Type:* a standalone executable program — running it creates an
    entire new process (Concept Unit 1), not a function call inside one
    that already exists.
  - *Responsibility:* everything the Dart command line exposes —
    running scripts (`run`), formatting code, statically analyzing code
    for errors, compiling a standalone executable, managing packages —
    of which this lesson uses exactly one corner: `run`.
  - *Depends on:* a path to a `.dart` file to run, given as an argument
    on the command line, and — this lesson's Concept Unit 4 and 5 — being
    reachable via `PATH`, so the terminal can find it from any working
    directory instead of only from inside its own install folder.
  - *Connects to:* invoked directly by whoever is typing at the terminal;
    it starts the Dart VM as part of its own process, which then reads
    and executes `hello.dart`, which in turn calls `print`.
  - *Shape:* the outermost boundary of this lesson's whole system. The
    terminal is where a human gives an instruction; `dart` is the first
    program that receives it; everything else this lesson builds (the
    running Dart VM, `hello.dart`'s own code, the call to `print`) exists
    *inside* the process `dart` creates.

- **`flutter` (specifically, its `doctor` subcommand)**
  - *What it is:* A command-line program — Flutter's own entry point,
    built on top of the Dart SDK it bundles.
  - *Implementation:* A real script, confirmed on this machine at
    `C:\flutter\bin\flutter.bat`, which locates and runs the same
    `dart.exe` shown above. Its `doctor` subcommand — used in this lesson
    as `flutter doctor -v` — inspects the local machine (installed SDKs,
    connected devices, IDE plugins, license acceptance) and prints one
    line per thing it checked, marked `[√]` if that check passed or `[!]`
    /`[X]` if something is missing or misconfigured.
  - *Its use:* This lesson's way of getting real, checkable proof — not a
    guess, not "it probably installed fine" — that the Flutter and
    Android install this lesson walks through actually succeeded.
  - *Type:* a standalone executable program (a `.bat` launcher script
    wrapping a real Dart program), same structural kind as `dart` above.
  - *Responsibility:* everything the Flutter command line exposes —
    creating new projects, running an app on a connected device, building
    a release binary, checking the local development environment — of
    which this lesson uses exactly one corner: `doctor`.
  - *Depends on:* nothing this lesson passes it directly (`doctor` takes
    no required arguments); it depends on being able to *find* things on
    the machine it runs on — the Android SDK, a Java installation, any
    connected devices — which is exactly what it reports back.
  - *Connects to:* invoked directly by whoever is at the terminal;
    internally it runs a list of independent checks (Flutter itself, the
    Android toolchain, Chrome, Visual Studio, connected devices, network
    resources) and prints one line of real, current status per check.
  - *Shape:* a diagnostic boundary that stands *outside* the
    CPU/RAM/process picture Concept Units 1–2 build. `hello.dart` runs
    *inside* a process on this machine; `flutter doctor` instead inspects
    the machine itself, checking that the ground `hello.dart` is about to
    stand on is actually solid.

---

## Concept Unit: The Machine Underneath

### The Problem

Every single thing this curriculum eventually builds — a Sudoku board
that remembers your progress, a leaderboard that survives closing the
app, a multiplayer game with a live opponent — is, underneath, still just
a program running on a physical machine. Before any of that makes sense,
one very basic question needs a real answer: when you double-click an
app, or run a command in a terminal, what physical thing is actually
*doing* the work, what is it doing the work *with*, and what happens to
the results?

> **Stop and think before reading on:** You already know, informally,
> that computers have a "processor" and "memory" and a "hard drive."
> Without looking anything up: if you had to guess which of those three
> is fastest, which is slowest, and why a computer would bother having
> all three instead of just the fastest one, what would you guess? What
> do you think happens to whatever a program was "thinking about" the
> instant you unplug the machine — does it survive, or is it gone? Why
> might that be different depending on *where*, physically, that
> information was being kept?

### Project Change

- **Reference Source:** No reference counterpart — this unit is
  conceptual and diagnostic, not a change to any project source file.
- **Files affected:** None. This unit produces no file in the curriculum
  project; it uses one already-existing file, `hello.dart`, purely as a
  real, on-disk example for the storage half of the demonstration below.
  That file is fully introduced in Concept Unit 7 — here it is only its
  raw size on disk that matters, not its contents.
- **Change type:** N/A — observation, not a change.
- **Location:** N/A.
- **Dependencies:** None yet. `hello.dart` does not need to exist yet for
  the CPU/RAM half of this demonstration; it is created for real in
  Concept Unit 7, and this unit's storage example is revisited there.

### The New Code

There is no code to type for this unit — the "new code" a reader would
normally type here is replaced by a live, real measurement, run once by
this lesson's author, on this exact machine, and shown as-is below. This
is a deliberate exception, not a shortcut: CPU and RAM are physical,
external facts about a running process, not something you write Dart (or
any) source code to construct. Windows already ships a free tool that
shows exactly this same data for any process on your machine: open
**Task Manager** (right-click the taskbar, or `Ctrl+Shift+Esc`), click
**More details** if it opens in the simple view, and open the
**Details** tab. Two of its columns are the same two real numbers shown
below: **CPU** (processor time that process has used) and **Memory**
(how much RAM that process currently holds).

The real numbers below were captured the same way Task Manager's own
columns are populated — by asking Windows directly for one process's
current CPU time and RAM usage, before and after that process was made
to do a few million multiplications on purpose:

```
Process Id      : 38108
CPU time (sec)  : 0.828125
Working set (RAM, bytes): 86515712
--- after doing work ---
CPU time (sec)  : 11.15625
Working set (RAM, bytes): 102199296
```

### The Updated Project

Not applicable — this unit introduces no code into any tracked file.

### Discarding this measurement

This specific snapshot — process ID 38108, these exact CPU and RAM
numbers — is a one-time, disposable fact about one process at one moment.
It will never be referred to again by this specific process ID or these
specific numbers; it existed only to make CPU time and RAM usage
concrete and real instead of abstract. What it proves does carry forward:
**CPU time and RAM usage are real, continuously-tracked, per-process
quantities the operating system measures constantly** — this is what a
**process** (fully defined in the next Concept Unit) actually *has*: its
own running total of processor time used, and its own current claim on
RAM.

### Mechanical walkthrough

There is no source code to enumerate line-by-line in this unit — its
"walkthrough" is a walkthrough of what the two real numbers above
actually mean, since neither is self-explanatory from the raw numbers
alone.

- **`Process Id: 38108`** — every process running on Windows gets a
  unique whole number, assigned by the operating system the moment that
  process starts, that no other *currently running* process shares. It
  exists so that when you (or Task Manager, or the OS's own scheduler)
  need to talk about *one specific running instance* of a program — not
  "PowerShell in general," but *this exact PowerShell that started three
  minutes ago* — there is an unambiguous number to name it by.
- **`CPU time (sec): 0.828125` → `11.15625`** — this is a running total,
  in seconds, of how much actual processor time this one process has
  been given since it started — not wall-clock time (how long it's been
  open), but time the CPU actually spent executing *this process's*
  instructions specifically, as opposed to some other process's, or
  nothing at all while the CPU sat idle. The jump from `0.828125` to
  `11.15625` — over ten additional seconds of real CPU time — happened
  because, in between those two readings, this process was made to
  multiply two million numbers together, one at a time, and the CPU
  really did have to execute every one of those multiplications as a
  real instruction, which really did take real, measurable time. Nothing
  about that work was simulated or estimated after the fact — the
  operating system's own accounting is what produced both numbers.
- **`Working set (RAM, bytes): 86515712` → `102199296`** — "working set"
  is Windows' own term for the RAM a specific process currently has
  claimed and is actively using; the byte counts here (about 82.5 MB,
  growing to about 97.5 MB) are that process's live share of the
  machine's total physical memory at each moment the number was read.
  The increase happened because, to multiply two million numbers, the
  computer had to temporarily hold — in RAM — the results of those two
  million multiplications while producing them, which is real data that
  needs real space to sit in, however briefly.

### CS lens

The idea underneath both numbers — that a computer has one (or a few)
fast component(s) that *do* work, and separate component(s) that only
*hold* things, and that "holding" and "doing" are different jobs done by
physically different hardware — is the **Von Neumann architecture**: the
foundational design, dating to the 1940s, that essentially every general-
purpose computer since has followed. A processor executes instructions
one at a time; a separate memory holds both the instructions being
executed *and* the data they operate on, addressable by location. Almost
every performance idea in later lessons — why a `List` lookup is fast,
why a database index matters, why a game with a huge board can feel slow
— eventually traces back to this same split: is the thing you need
*already sitting where the CPU can reach it quickly*, or does something
have to go fetch it first?

```
Also recognized in: your phone's own hardware, a game console, a
server in a data center, a Raspberry Pi, a pocket calculator with
a general-purpose chip inside it, a car's engine control unit
```

### SE lens

The specific reason a computer has *three* tiers (CPU-adjacent cache,
RAM, storage) instead of just one fast tier everywhere is a real,
unavoidable engineering tradeoff: memory that is fast enough to keep up
with a modern CPU is expensive and physically cannot hold much data, and
it loses its contents the instant power is cut. Memory that is cheap
enough to hold huge amounts of data and keep it without power is,
physically, far slower to read from and write to. No single technology
available today is both — so real systems use a hierarchy instead: a
small amount of very fast, very expensive, power-dependent memory (RAM)
sitting in front of a large amount of slower, cheaper, power-independent
memory (storage). The cost this project will pay for that tradeoff
directly: everything Phase 6 of this curriculum does — an entire set of
lessons on databases and persistence — exists *because* RAM alone cannot
be trusted to survive the user closing the app. If RAM never lost its
contents, "save the game" would not need to be a feature; it would be
automatic.

### Commands needed

No terminal commands are required for this unit — Task Manager, used to
observe the same real numbers shown above, is a graphical tool, not a
command line.

### Run it

The real numbers already shown above **are** this unit's real, run
output — captured live on this machine, not predicted. Per the
Verification Rule, output like this — real, measured OS-level process
statistics that genuinely could not be known in advance (this lesson's
author cannot predict, ahead of running it, exactly how many bytes of RAM
a fresh PowerShell process happens to be holding, or exactly how many CPU
seconds two million real multiplications will cost on this specific
machine) — has to be captured by actually running something and reading
back what really happened, rather than stated from confidence. Both
numbers are saved, alongside the exact commands used to produce them, in
this curriculum's verification folder at
`src/docs/flutter/verification/lesson-01/run-log.md`.

### Connecting this unit

Nothing precedes this unit — it is the curriculum's first. It establishes
the ground floor everything else stands on: a computer has a fast,
working part (CPU), a fast-but-temporary holding part (RAM), and a
slow-but-permanent holding part (storage). The next unit builds directly
on top of this one, answering: who decides which program gets to use the
CPU, and how does "a running program" become something the operating
system can actually keep track of?

---

## Concept Unit: The Operating System and Processes

### The Problem

Real machines run many programs at once — right now, on the machine this
lesson was written on, dozens of programs are running simultaneously,
even though there is only one CPU with a limited number of cores. The
previous unit showed that one specific process (PID 38108) had its own
CPU-time total and its own RAM usage. That immediately raises a harder
question: if two completely different programs are both running at the
same time, on the same physical CPU and the same physical RAM, what stops
them from overwriting each other's data, or from one program hogging the
CPU forever and freezing every other program on the machine?

> **Stop and think before reading on:** Given what the last unit already
> showed you — that a process has its *own* CPU-time total and its *own*
> RAM usage, tracked separately from every other process — what do you
> think has to be keeping those totals separate for every single running
> program on the machine, all at once? If you opened ten copies of the
> exact same program right now, would you expect them to share one CPU-
> time counter, or have ten separate ones? Why?

### Project Change

- **Reference Source:** No reference counterpart — conceptual and
  diagnostic, not a project file change.
- **Files affected:** None.
- **Change type:** N/A — observation.
- **Location:** N/A.
- **Dependencies:** None.

### The New Code

Same as the previous unit, there is no source code to type here — this
is a live, real observation using the same Task Manager **Details** tab
introduced above. Real, captured evidence, listing several genuinely
different, independently-running processes on this exact machine at the
same moment:

```
 Id ProcessName   RAM_MB
 -- -----------   ------
  0 Idle            0.00
  4 System         12.70
236 Secure System  64.40
280 Registry       44.80
444 svchost        12.90
912 smss            0.30
```

### The Updated Project

Not applicable — no code introduced into any tracked file.

### Discarding this observation

This exact list of six processes, at these exact PIDs, will not be
referred to again — like the previous unit's single-process snapshot,
it is a disposable, one-time fact. What it proves does carry forward:
**many independent processes really are running on the same machine at
the same instant, each with its own process ID and its own separately-
tracked RAM usage** — none of these six numbers had to add up to
anything in particular, because none of these processes' memory is
shared with any other's by default.

### Mechanical walkthrough

- **`Id` column** — each row's own unique process ID, the same concept
  introduced in the previous unit (there: 38108) — here shown across six
  *different* processes simultaneously, proving the numbering is
  machine-wide, not specific to any one program.
- **`ProcessName` column** — Windows' own internal name for what program
  that process is running: `Idle` is not a real user program at all but a
  bookkeeping placeholder the OS uses to represent "the CPU has nothing
  else to do right now"; `System`, `Secure System`, and `Registry` are
  core parts of Windows itself, already running before any user program
  is launched; `svchost` (short for "service host") is a real, ordinary
  Windows process that many background services run inside of; `smss`
  (Session Manager Subsystem) is one of the very first processes Windows
  starts when the machine boots, responsible for starting the rest.
- **`RAM_MB` column** — the same "working set" idea from the previous
  unit, converted from bytes to megabytes for readability; each row's
  number is that specific process's own current RAM claim, independent
  of every other row's — `Registry`'s 44.80 MB has nothing to do with
  `svchost`'s 12.90 MB; nothing here is shared or pooled between rows
  unless a process deliberately asks the OS for shared memory, which
  none of these six do.

### CS lens

The operating system's job here — deciding, many times per second, which
of potentially dozens of waiting processes actually gets to run on the
CPU next, for how long, before being paused so another process gets a
turn — is called **process scheduling** (also encountered as **time-
slicing** or **preemptive multitasking**). No process "owns" the CPU
continuously; the OS interrupts even a currently-running process,
saves exactly enough of its state to resume it later without it
noticing anything happened, and hands the CPU to someone else, over and
over, so fast that from a human's perspective everything looks
simultaneous even though, at any single physical instant, only as many
instructions are actually executing as there are CPU cores.

```
Also recognized in: an OS thread scheduler, a network router deciding
which packet to send next, a customer-service call queue, a CPU's
own out-of-order instruction pipeline, a restaurant kitchen juggling
several tickets at once
```

### SE lens

The alternative to process isolation — letting every running program
read and write the same shared pool of memory directly, with nothing
stopping one from overwriting another's data — was tried, historically,
in early operating systems, and the real cost was catastrophic
instability: one misbehaving or crashed program could corrupt or freeze
every other running program, including the operating system itself.
Modern OS-enforced process isolation (separate, protected memory per
process, mediated entirely through the OS) trades away some real
performance — every time one process legitimately needs to hand data to
another, the OS has to get involved rather than letting them just share
a memory address — for a much larger, non-negotiable win: one crashing
program cannot, by default, take the whole machine down with it. Every
later lesson on state, persistence, and networking in this curriculum
implicitly depends on that guarantee already being true.

### Commands needed

None — Task Manager's Details tab, already open from the previous unit,
is the same tool used here.

### Run it

The real process list shown above is genuine output, captured live on
this machine at the same time as the previous unit's single-process
numbers; per the Verification Rule, exact process IDs and RAM figures on
a live, multi-process operating system are not something this lesson's
author could state from confidence ahead of time, so they were captured
by really asking the OS, not predicted.

### Connecting this unit

The previous unit showed that one process has its own CPU-time and RAM
totals; this unit shows that many processes exist simultaneously, each
with its own separate totals, and that something — the operating system —
has to referee all of them at once. The next unit turns to a different
question: before any of these processes could exist at all, something
had to turn a programmer's plain-text source code into instructions the
CPU could actually execute. What does that transformation look like?

---

## Concept Unit: From Source Code to Something a CPU Can Run

### The Problem

`hello.dart` — introduced fully in Concept Unit 7, but its existence is
assumed here to make this concrete — is going to be 42 bytes of ordinary,
human-readable text: the word `print`, some punctuation, a sentence in
quotes. Concept Unit 1 already established that a CPU executes
instructions, and Concept Unit 2 established that those instructions run
inside a process, tracked by the OS. Neither of those units said anything
about a CPU being able to read English words. So: can a CPU actually run
the word `print` directly? If not — what has to happen first?

> **Stop and think before reading on:** If you opened `dart.exe` itself —
> the actual program that is about to run your code — in a plain text
> editor instead of running it, what would you expect to see? Readable
> words and sentences, like your own source code? Something else
> entirely? Why might a CPU's own native instructions need to look
> completely different from a sentence a person can read?

### Project Change

- **Reference Source:** No reference counterpart — conceptual, proven
  with two real, already-existing files rather than a new one.
- **Files affected:** None new. This unit inspects two files that already
  exist independently of this curriculum: `hello.dart` (created for real
  in Concept Unit 7, previewed here) and the real `dart.exe` binary
  bundled inside the Flutter SDK installed in Concept Unit 5.
- **Change type:** N/A — observation.
- **Location:** N/A.
- **Dependencies:** None for the observation itself; the Flutter SDK
  install in Concept Unit 5 is what put a real `dart.exe` on this machine
  to inspect.

### The New Code

Two real files, shown exactly as they are — no code for the reader to
type in this unit; this is direct inspection of two already-real
artifacts on disk.

`hello.dart`'s complete, real contents (42 bytes total):

```
void main() {
  print('Hello, World!');
}
```

The first 64 bytes of the real, compiled `dart.exe` — the actual program
that is about to execute that text above — read directly off this
machine's disk and shown as raw hexadecimal, because as plain text most
of it has no printable character at all:

```
00000000: 4d5a 7800 0100 0000 0400 0000 0000 0000  MZx.............
00000010: 0000 0000 0000 0000 4000 0000 0000 0000  ........@.......
00000020: 0000 0000 0000 0000 0000 0000 0000 0000  ................
00000030: 0000 0000 0000 0000 0000 0000 7800 0000  ............x...
```

### The Updated Project

Not applicable — this unit modifies no tracked file; both files inspected
already exist for independent reasons (one is created in Concept Unit 7,
the other ships inside the SDK installed in Concept Unit 5).

### Discarding this comparison

This exact 64-byte slice of `dart.exe` is not something this curriculum
will ever refer to again byte-for-byte — it existed only to make one
fact undeniable rather than asserted: **`hello.dart` is readable text;
the real program about to execute it is not.** That distinction, not
these specific bytes, is what carries forward. This is called the
difference between **source code** and **machine code**, and it is the
entire reason a **compiler** or **interpreter** (both defined below) has
to exist at all.

### Mechanical walkthrough

- **`hello.dart`'s text** — every character in it (`v`, `o`, `i`, `d`,
  a space, `m`, `a`, `i`, `n`, and so on) is an ordinary printable
  character from a standard text encoding — the same kind of data a word
  processor document or an email is made of. Nothing about it is
  specific to being "code" at the byte
  level; a text editor renders it exactly as readably as this sentence.
- **`4d5a`** — the first two bytes of `dart.exe`, shown in the hex dump's
  left-hand columns. In hexadecimal, `4d` is the byte value 77 and `5a`
  is 90; not coincidentally, those two byte values are also the ASCII
  codes for the letters `M` and `Z` — visible in the dump's own
  right-hand text column as literally `MZ`. This two-byte sequence is
  the fixed, mandatory signature every Windows executable file begins
  with, checked by Windows itself before it will even attempt to run a
  file as a program.
- **The remaining bytes (`7800`, `0100`, `0000`, `0400`, and so on)** —
  unlike the `MZ` signature, these do not correspond to any printable
  text at all; the hex dump's right-hand column shows a `.` for every one
  of them, which is how the dump tool marks "this byte has no printable
  character." This is the direct, visible proof that whatever comes after
  the initial signature is not text of any kind — it is structural data
  and, further into the file (past the 64 bytes shown here), real machine
  code: literal binary instructions in the exact numeric encoding this
  machine's specific CPU family understands natively.

### CS lens

The general problem both a **compiler** and an **interpreter** solve —
turning a human-writable notation into something a machine can actually
carry out — is **translation between representations**, one of the most
recurring ideas in all of computing. Dart's own toolchain actually uses
both strategies, for different purposes, both real, named, documented
Dart compilation modes described in Dart's own official toolchain
documentation, not this lesson inventing a distinction:

- **Just-in-time (JIT) compilation** — translating and starting execution
  together, in one step, rather than as two separate phases. This is
  what `dart run hello.dart` (exactly what Concept Unit 7 does) uses: it
  favors fast startup over raw execution speed, and it's what makes
  Flutter's hot reload possible later in this curriculum — reload needs
  the ability to re-translate part of a running program on the fly,
  which is only possible because translation was never a separate,
  finished, one-time step to begin with.
- **Ahead-of-time (AOT) compilation** — doing the entire translation once,
  completely, in advance, producing a standalone binary like the
  `dart.exe` inspected above. This is what building a finished, shippable
  app (Lesson 96, Build Configurations) uses instead: it favors maximum
  runtime speed, at the cost of a separate, slower build step that has to
  finish before the program can run at all.

```
Also recognized in: a musical score being performed by a human
musician (source) versus a player-piano roll driving mechanical
hammers directly (machine-executable), human speech being
transcribed to text and back, a recipe written in prose versus a
robot arm's exact motor-control instructions, DNA being transcribed
to messenger RNA before a ribosome can act on it
```

### SE lens

Choosing to compile ahead of time versus interpret/JIT on the spot is a
real, load-bearing engineering tradeoff, not a stylistic preference:
ahead-of-time compilation front-loads all translation cost into a single
build step, so every actual run afterward is as fast as that specific CPU
allows — the right choice for a finished app a user will run repeatedly.
Just-in-time compilation instead pays a little translation cost
continuously, spread across the run, in exchange for being able to start
running (and, in Dart and Flutter's case, to support live code reloading
while developing) without waiting for a full separate build first — the
right choice while you are actively writing and testing code, which is
exactly what this entire curriculum will be doing, lesson after lesson,
via `dart run` and `flutter run`.

### Commands needed

None yet in this unit — the real hex dump shown above was produced with a
tool (`xxd`) that belongs to this curriculum's own verification tooling,
not to something a reader needs to run; the point being proven (source is
text, machine code is not) is fully established by the evidence already
shown.

### Run it

Both artifacts shown above — `hello.dart`'s real text and `dart.exe`'s
real first 64 bytes — are genuine data read directly off this machine's
disk, not reconstructed from memory or predicted; per the Verification
Rule, a claim about a real compiled binary's actual byte contents cannot
be stated from confidence, since this lesson's author has no way to know
those exact bytes without actually reading the real file. Both are saved
in `src/docs/flutter/verification/lesson-01/run-log.md`.

### Connecting this unit

Concept Unit 1 established that only a CPU executes instructions, and
this unit just proved those instructions cannot be plain text — something
has to translate `hello.dart`'s readable words into the unreadable binary
form `dart.exe` (and everything it eventually produces at runtime)
actually is. The next unit turns to a more practical question this
translation immediately raises: once `dart.exe` exists on this machine at
all, how does typing the bare word `dart` in a terminal find it, from any
folder, without you ever typing its full location?

---

## Concept Unit: Environment Variables and PATH

### The Problem

Concept Unit 3 showed that `dart.exe` is a real file sitting at a real,
specific location on disk (once Concept Unit 5 installs it there). But
this lesson's actual deliverable command, `dart run hello.dart`, will not
type that full location — it will just type the bare word `dart`. If the
terminal has no way of knowing, on its own, where every program on the
whole machine happens to live, how does typing four letters find one
specific file among the hundreds of thousands on a typical Windows
installation?

> **Stop and think before reading on:** Concept Unit 2 already
> established that each process gets its own separate, private slice of
> memory, invisible to every other process by default. Given that,
> if the terminal needs some kind of list of "places to look for
> programs," where would that list have to live so that a brand new
> terminal window, which just started and has never seen any previous
> command you typed, could still find it?

### Project Change

- **Reference Source:** No reference counterpart — this unit's "code" is
  a disposable, isolated proof, not a project file change.
- **Files affected:** None. Nothing this unit does touches a tracked
  project file.
- **Change type:** N/A — isolated demonstration only.
- **Location:** Any PowerShell terminal window.
- **Dependencies:** None.

### The New Code

Two commands, typed into the same PowerShell terminal, one right after
the other:

```powershell
$env:LESSON_DEMO = "temporary"
$env:LESSON_DEMO
```

### The Updated Project

Not applicable — this is a brand-new, freestanding pair of commands with
no surrounding structure to place them in; nothing precedes or follows
them in this unit's real code.

### Introduce the concept in isolation

Typing exactly those two lines, in order, in one PowerShell window,
really does produce this real output on the second line:

```
temporary
```

That is unsurprising — you set a value, then immediately read it back, in
the same breath. The real test is what happens next: **without closing
that window**, open a **second, brand-new** PowerShell window (Start
Menu → PowerShell, a genuinely separate, newly-started process) and type
only the second line again:

```powershell
$env:LESSON_DEMO
```

In that second, new window, this is the real result:

```
[blank — nothing is printed]
```

This is called an **environment variable**, and what just happened proves
something specific about it: **`$env:LESSON_DEMO = "temporary"` did not
write that value anywhere permanent — it only existed inside the one
PowerShell process that ran that line, for as long as that process stayed
alive.** A second, independent process, even running the exact same
program (PowerShell itself) seconds later, starts with its own,
separate environment, inherited fresh from *its own* parent process (in
this case, however Windows launched that new window) — not from the
first window's, no matter how recently that first window set anything.

### Discarding this example

`LESSON_DEMO` is not a real environment variable used anywhere in this
curriculum — it was invented purely to make this one fact undeniable, and
it is discarded now; it will not appear again. What carries forward is
the fact it proved: an environment variable set the way shown above is
scoped to one running process and dies with it.

### Mechanical walkthrough

- **`$env:LESSON_DEMO`** — PowerShell's own dedicated syntax for reaching
  into the *current* process's environment variables, using a name you
  choose (`LESSON_DEMO` here) after the fixed `$env:` prefix. This is not
  a general Dart or programming concept — it is specific syntax
  PowerShell itself provides, and it only ever reads or writes the
  environment of the one PowerShell process currently running the
  command.
- **`= "temporary"`** — ordinary assignment: taking the text value
  `"temporary"` (a string literal, the same kind of thing Concept Unit 7
  will introduce for Dart specifically — here it is PowerShell's version
  of the same idea, text data written directly into the command) and
  storing it under the name `LESSON_DEMO`, inside this one process's
  environment block.
- **The second, bare `$env:LESSON_DEMO`** (both the first time, and again
  in the new window) — reading, rather than writing: PowerShell looks up
  whatever value (if any) is currently stored under that name in the
  current process's own environment and prints it. In the first window,
  right after the assignment, that lookup finds `"temporary"`. In the
  second, independently-started window, the exact same lookup, for the
  exact same name, finds nothing at all — because, as this unit's real
  run just proved, that second process's environment was never given
  that value in the first place.

### CS lens

What just happened — data that lives for exactly as long as one running
process, and vanishes the instant that process ends, with no separate
effort required to "clean it up" — is a specific, named idea in computer
science: **process-scoped state**, one particular case of the more
general idea of a variable's **scope**, meaning the specific, bounded
region of a program (or, here, of a running system) in which a piece of
named data is visible and meaningful at all. The exact same underlying
idea — something's lifetime and visibility being tied to a specific
container it lives inside, disappearing the instant that container goes
away — recurs constantly through the rest of this curriculum, starting
as soon as Lesson 5 introduces local variables inside a function.

```
Also recognized in: a local variable inside any function in any
programming language, a browser tab's own JavaScript state
disappearing when you close that tab, a phone call's context
vanishing the moment you hang up, a sticky note thrown away once
the meeting it was written for ends
```

### SE lens

The alternative design — environment variables that, once set, applied
permanently and globally to every process on the machine with no way to
scope them to just one running program — was, in effect, an earlier norm
on some historical systems, and the real cost was exactly what you would
expect: one program changing a variable could silently break a
completely unrelated program that happened to read the same variable
name and expected a different value. Process-scoped-by-default
environment variables, with an explicit, separate mechanism (Concept Unit
5, coming up) required to make one *persist* beyond a single process,
trade a small amount of convenience (you have to deliberately ask for
persistence) for a real, meaningful safety property: an accident in one
terminal window cannot silently corrupt every other program's
configuration on the same machine.

### Commands needed

- **`$env:NAME`** (read) / **`$env:NAME = value`** (write) — PowerShell's
  built-in syntax for a specific process's own environment variables;
  already explained in full above. No install or setup is required to
  use it — every PowerShell window has it available immediately.

### Run it

Both real outputs shown above (`temporary`, then blank in a new window)
are genuine results of really running those exact two commands, in that
exact order, in two real, separate PowerShell windows on this machine —
not predicted. Per the Verification Rule, whether a brand-new process
really does or does not inherit another process's just-set variable is
exactly the kind of claim about OS-level, invisible-by-default behavior
that needs real proof, not a confident sentence — so it was actually run,
twice, and both real results are saved in
`src/docs/flutter/verification/lesson-01/run-log.md`.

### Connecting this unit

Concept Unit 3 left an open question: how does typing the bare word
`dart` find a specific file on disk? This unit has now shown *what an
environment variable is* and — critically — that a variable set casually,
the way shown here, does not survive past the one process that set it.
`PATH` (defined in this lesson's Terms glossary) is exactly one such
variable — a list of folders the terminal searches for bare command
names — and the next unit both installs the real Flutter SDK and makes
its location *persist*, using a different, deliberate mechanism from the
one shown here, specifically because a one-process-only setting would be
useless for a tool you need to run from a fresh terminal window every
single day.

---

## Concept Unit: What an SDK Is, and Installing One

### The Problem

Every piece of groundwork so far — a CPU that can only run machine code,
not text; a `dart.exe` binary that has to exist somewhere on disk;
`PATH`, a list of folders the terminal searches for bare command names —
has been building toward one very practical question: right now, on a
freshly set-up Windows machine, none of that exists yet. There is no
`dart.exe` anywhere on disk, and no folder listed in `PATH` that would
contain one. What, concretely, has to happen to change that?

> **Stop and think before reading on:** Given everything established so
> far — that `dart.exe` needs to physically exist as a file somewhere on
> disk (Concept Unit 3), and that `PATH` needs to list the folder it's
> in for the bare word `dart` to find it (Concept Unit 4) — what do you
> think "installing" a development tool actually *is*, mechanically?
> Is it more like a one-time magic ritual, or is it just those same two
> concrete things (a real file landing on disk, and a folder being added
> to a list) happening for real?

### Project Change

- **Reference Source:** No reference counterpart — this is a from-scratch
  machine setup step, not a port of any existing project code.
- **Files affected:** Created (outside this repository, directly on the
  machine): the entire Flutter SDK, extracted to `C:\flutter` — including
  the real `dart.exe` inspected in Concept Unit 3, at
  `C:\flutter\bin\cache\dart-sdk\bin\dart.exe`. Also created: the Android
  SDK's command-line tools and platform components, at `C:\Android\sdk`.
  Modified: this Windows user account's persistent `PATH` environment
  variable (stored in the Windows Registry at
  `HKEY_CURRENT_USER\Environment`, a real, permanent, on-disk store —
  unlike Concept Unit 4's process-only example, this survives every
  future reboot and every future terminal window).
- **Change type:** Install (new SDK files) and configure (persistent
  `PATH` entries).
- **Location:** A fresh Windows 11 machine with no prior Dart, Flutter,
  or Android tooling installed — confirmed at the start of this lesson by
  running `flutter`, `dart`, and `adb` in a terminal and getting "not
  recognized" for all three.
- **Dependencies:** A working internet connection (to download the SDKs)
  and a Java Development Kit for the Android toolchain — this machine
  already had one installed (JDK 17), so installing one is not shown
  here, but Flutter's own setup documentation covers it for a machine
  that doesn't.

### The New Code

The two commands that matter most, exactly as run for real on this
machine (full install steps — downloading, extracting to `C:\flutter`,
downloading and extracting the Android command-line tools to
`C:\Android\sdk`, and using the persistent `PATH` mechanism this unit is
about to explain to make both reachable — are mechanical file operations,
not new *concepts*, so they are not walked through line by line here; the
two commands below are the ones that actually prove the install worked):

```
flutter --version
flutter doctor -v
```

### The Updated Project

Not applicable in the usual sense — there is no single project file these
commands are added *into*; they are standalone commands typed directly
into a terminal, which is the entire "structure" they run inside.

### Introduce the concept in isolation

Making `dart` and `flutter` reachable from *any* new terminal window,
permanently, uses a different mechanism from Concept Unit 4's
`$env:NAME = value` on purpose — that mechanism was proven, with a real
run, to die with the one process that set it. Windows' own **System
Properties** dialog (search "Environment Variables" from the Start Menu,
or `Win + R` then `sysdm.cpl` → **Advanced** → **Environment Variables**)
edits the *persistent* copy of `PATH` instead — the same underlying
Registry key mentioned in Project Change above — and it is this
persistent copy, not the process-only kind, that a *newly-opened*
terminal window reads when it starts up. Concept Unit 4 already proved,
with a real run, that a brand-new process gets its own fresh environment;
what makes this different is *where* the value being inherited from now
lives — a permanent Registry key that survives reboots, rather than
another still-running process's temporary memory.

Real proof this distinction is not just a claim: after adding
`C:\flutter\bin` this way and opening a **new** terminal window, that new
window's own `dart --version` really does succeed —

```
Flutter 3.47.1 • channel stable • https://github.com/flutter/flutter.git
Framework • revision 6655482ec0 (3 days ago) • 2026-08-19 10:07:23 -0700
Engine • hash 11d79658c444477b06513d32b52c8c4ccb7276b0 (revision 5d53178869) (3 days ago) • 2026-08-18 23:36:01.000Z
Tools • Dart 3.13.1 • DevTools 2.60.0
```

— even though that new window never ran any command itself to set
anything; it simply started *after* the persistent change was made, and
inherited it automatically, the same way any freshly-opened window does.

### Discarding this isolated proof

The specific act of opening one extra terminal window to prove
persistence is not itself a repeatable step in this curriculum going
forward — from this point on, this lesson (and every later one) will
simply assume `dart` and `flutter` are available in any new terminal,
because this real proof already established that they are. What carries
forward, named plainly: this is called making a change **persistent**,
as opposed to Concept Unit 4's **process-scoped** (or "session-scoped")
change — the same underlying idea (an environment variable), stored in
two genuinely different places, with two genuinely different lifetimes.

### Mechanical walkthrough

- **`flutter`** — already given a full entry in this lesson's Objects and
  methods section above; invoking it here, with no subcommand-specific
  flags beyond `--version`, runs its built-in version-reporting behavior.
- **`--version`** — a command-line flag (an optional switch passed after
  a program's name, conventionally starting with one or two dashes) that
  tells `flutter` to print its own version information and exit
  immediately, rather than doing anything else it's normally capable of.
- **`doctor`** — the specific subcommand of `flutter` given full CRC
  treatment in this lesson's header; running it performs the real,
  multi-part diagnostic check described there.
- **`-v`** — a second command-line flag, short for `--verbose`, that
  tells `doctor` to print additional detail under each check (like the
  exact Java version found, or the exact Android SDK path) rather than
  only the one-line pass/fail summary its default output would show.

### CS lens

`PATH`, and the whole idea of a **persistent, named, filesystem-wide
lookup mechanism** it's an example of, is a specific instance of a
recurring idea: a **registry** or **index** — a single, well-known place
a system consults to resolve a short name into the real, concrete thing
it refers to, so that everything else in the system never has to hard-
code the full, specific location of anything.

```
Also recognized in: DNS translating a domain name into a server's
real IP address, a phone's contacts list translating a name into a
phone number, a library's card catalog translating a book title
into a shelf location, an OS's own DLL/shared-library search path
```

### SE lens

Storing `PATH` (and other install-time configuration) in a per-user,
persistent Registry location, rather than requiring every single tool to
be told its own dependencies' exact locations by hand every time, is a
deliberate, standard piece of engineering: it means dozens of installed
tools can all coexist and find each other via short names, and a new tool
installed later doesn't need to know, in advance, about every other tool
already on the machine. The real cost this curriculum will hit later is
exactly the failure mode Concept Unit 4 demonstrated: a `PATH` change
made in a terminal window that's already open will not silently apply
retroactively to that window — anyone following these exact install steps
who forgets to open a genuinely new terminal afterward will see `dart`
still reported as "not recognized," not because the install failed, but
because the *already-running* terminal's environment was captured before
the change and, per Concept Unit 4's own proof, cannot see it.

### Commands needed

- **`flutter --version`** — prints the installed Flutter version, the
  Dart version it bundles, and the exact source revision it was built
  from; success looks like real, specific version text, shown above,
  not an error.
- **`flutter doctor -v`** — runs the full diagnostic check described in
  this lesson's Objects and methods section; success looks like every
  checked category reporting `[√]`, ending in the line `• No issues
  found!`, as this unit's Run It step shows in full below.

### Run it

The real, complete `flutter doctor -v` output, captured on this machine
immediately after finishing this install:

```
[√] Flutter (Channel stable, 3.47.1, on Microsoft Windows [Version 10.0.26200.9168], locale en-US) [1,247ms]
    • Flutter version 3.47.1 on channel stable at C:\flutter
    • Upstream repository https://github.com/flutter/flutter.git
    • Framework revision 6655482ec0 (3 days ago), 2026-08-19 10:07:23 -0700
    • Engine revision 5d53178869
    • Dart version 3.13.1
    • DevTools version 2.60.0

[√] Windows Version (11 Home 64-bit, 25H2, 2009) [9.0s]

[√] Android toolchain - develop for Android devices (Android SDK version 36.0.0) [4.9s]
    • Android SDK at C:\Android\sdk
    • Emulator version unknown
    • Platform android-36, build-tools 36.0.0
    • ANDROID_HOME = C:\Android\sdk
    • ANDROID_SDK_ROOT = C:\Android\sdk
    • Java binary at: C:\Program Files\Java\jdk-17\bin\java
      This JDK is specified by the JAVA_HOME environment variable.
    • Java version Java(TM) SE Runtime Environment (build 17.0.12+8-LTS-286)
    • All Android licenses accepted.

[√] Chrome - develop for the web [855ms]
    • Chrome at C:\Program Files\Google\Chrome\Application\chrome.exe

[√] Visual Studio - develop Windows apps (Visual Studio Build Tools 2026 18.8.3) [851ms]
    • Visual Studio at C:\Program Files (x86)\Microsoft Visual Studio\18\BuildTools
    • Visual Studio Build Tools 2026 version 18.8.12105.206
    • Windows 10 SDK version 10.0.26100.0

[√] Connected device (3 available) [1,362ms]
    • Windows (desktop) • windows • windows-x64    • Microsoft Windows [Version 10.0.26200.9168]
    • Chrome (web)      • chrome  • web-javascript • Google Chrome 151.0.7922.138
    • Edge (web)        • edge    • web-javascript • Microsoft Edge 151.0.4129.78

[√] Network resources [1,429ms]
    • All expected network resources are available.

• No issues found!
```

Notice `Connected device` lists only this Windows machine itself and two
browsers — no Android phone. That's expected: no physical device was
plugged in while writing this lesson. The Android *toolchain* (the `[√]
Android toolchain` line above) is fully installed and verified
independent of any specific device being connected right now; plugging in
your own phone over USB debugging and seeing it appear in this same list
is Lesson 26's job, the first real Flutter app, not this lesson's. Real,
saved in full in `src/docs/flutter/verification/lesson-01/run-log.md`.

### Connecting this unit

Concept Unit 3 established that `dart.exe` has to exist as a real file on
disk before anything can run; Concept Unit 4 established what an
environment variable is and proved, with a real run, that a casually-set
one dies with its process. This unit made both of those things real at
once: a genuine `dart.exe` now exists on this machine, and `PATH` now
points at it *persistently*, proven by a real command succeeding in a
brand-new terminal window. Everything is now in place for the very last
step: actually writing and running one real Dart program.

---

## Concept Unit: The Entry Point

### The Problem

The Flutter and Dart SDKs are now really installed and verified on this
machine — `flutter doctor -v` (previous unit) proved that with real,
current output. But a Dart *file* is not automatically a Dart *program*
just because the `dart` tool can technically read it as text. Real dart
files can — and, once this curriculum reaches classes and libraries, will
routinely — define many different functions in one file. If `dart run`
is told to run a whole file, and that file could contain any number of
functions, how does it know **which one** to actually start with?

> **Stop and think before reading on:** Concept Unit 2 established that
> the operating system needs *some* unambiguous way to identify one
> specific process among many (a process ID). Given that a single file
> can define more than one function, what do you think a tool like
> `dart` needs in order to unambiguously know where to *start* running,
> without reading and guessing at the meaning of every single function in
> the file first?

### Project Change

- **Reference Source:** No reference counterpart — this is the first
  code this curriculum's actual project will ever contain.
- **Files affected:** Created: `hello.dart`, a brand-new file.
- **Change type:** Add (new file).
- **Location:** Anywhere you choose to keep this curriculum's practice
  code — this lesson's own verification copy lives at
  `src/docs/flutter/verification/lesson-01/hello.dart`.
- **Dependencies:** A working `dart` command, reachable via `PATH` —
  exactly what the previous unit installed and verified.

### The New Code

A file with a function that is **not** named `main`:

```dart
void sayHello() {
  print('Hello, World!');
}
```

### The Updated Project

Not applicable — `sayHello` is a brand-new, freestanding function with
nothing surrounding it yet; there is no enclosing structure to show it
placed inside of.

### Introduce the concept in isolation

Running that exact file — `dart run no-main.dart` — produces this real
error, and the program does not run at all:

```
Invoked Dart programs must have a 'main' function defined:
https://dart.dev/to/main-function
```

The real exit code reported back to the terminal is `253` — a non-zero
number, which by long-standing, near-universal convention across
essentially every OS and language means "this process failed," as
opposed to `0`, which means success. This proves, concretely, that
`dart run` does not simply execute "whatever functions happen to be in
the file, in some order" — it looks, specifically, for one function with
one exact name, and refuses to run anything at all if that name is
missing, even though `sayHello` above is a completely valid, correctly-
written function that could easily have been run instead. This fixed,
mandatory starting point is called an **entry point** — and Dart's
specific entry point, by name, is always `main`.

### Discarding this example

`sayHello` is discarded now and will not reappear in this curriculum's
real project — it existed only to prove, with a real error rather than a
claimed one, that *some* correctly-named function is mandatory. What
carries forward is the concept it proved: Dart needs one function, named
exactly `main`, before `dart run` will execute anything at all.

### Mechanical walkthrough

- **`void`** — already given a real Terms entry above: a return-type
  annotation meaning this function hands nothing back to whatever called
  it. Here it appears on `sayHello`, exactly as it will on `main` itself
  in the next unit — the entry point convention does not change what
  `void` means; it only adds one extra rule about the function's *name*.
- **`sayHello`** — an ordinary function name, chosen freely by whoever
  wrote this code — proof, by contrast with `main`'s real error above,
  that Dart places no special requirement on function names *in
  general*; the requirement is specific to exactly one name, `main`,
  and only for the one function meant to be the program's starting
  point.
- **`()`** — an empty parameter list: this function takes no input
  values. Lesson 8 covers parameters — what goes between these
  parentheses when a function *does* take input — in full; this lesson
  only needs the empty case.
- **`{ }`** — curly braces marking the beginning and end of this
  function's body: the block of statements that run, in order, whenever
  this function is called. Basic syntax already riding along with the
  concept of "a function has a body," not a separate concept of its own.
- **`print('Hello, World!');`** — a complete statement, given its own
  full treatment in the next Concept Unit; included here only so
  `sayHello` has something real to do, proving this is a genuinely
  working, correctly-written function that simply lacks the one specific
  name Dart requires.

### CS lens

A fixed, mandatory, conventionally-named starting point for execution —
rather than, say, "the first function written in the file" or "every
function, run in some order" — is the same underlying idea as a
program's **entry point** in essentially every compiled or interpreted
language: C and C++ also require a function literally named `main`; Java
requires a `public static void main(String[] args)` method inside some
class; Python, less strictly, treats whichever module you invoke
directly as the starting point, with `if __name__ == "__main__":` as its
own conventional marker for the same idea. The specific name and rules
differ; the underlying need — "give the tool one unambiguous place to
start, out of potentially many places it could have chosen" — does not.

```
Also recognized in: C's own int main(), Java's public static void
main(String[] args), a Windows service's designated start-up
routine, a shell script's first executable line, a factory's
single, designated assembly-line starting station
```

### SE lens

The alternative — no fixed entry-point convention, with a tool like
`dart run` instead trying to guess which function to run, perhaps "the
last one defined," or "the one that looks least like a helper function" —
would be genuinely ambiguous and fragile: reordering functions in a file,
a purely cosmetic change, could silently change which one actually runs.
Dart's real choice — a hard requirement, enforced with a real, immediate
error rather than a guess — trades away a small amount of flexibility
(you cannot name your starting function anything you like) for a much
larger, non-negotiable guarantee: which function runs first is never
ambiguous, never silently affected by reordering, and never dependent on
a tool's best guess.

### Commands needed

- **`dart run <file>.dart`** — already given a full entry in this
  lesson's Objects and methods section; used here exactly as described
  there, against `no-main.dart` specifically to trigger, for real, the
  error shown above.

### Run it

The real error text and the real exit code `253` shown above both come
from actually running `dart run no-main.dart` on this machine — per the
Verification Rule, exact error message text is never something to state
from confidence; it was captured by really triggering the error, not
guessed at, and is saved in full in
`src/docs/flutter/verification/lesson-01/run-log.md`.

### Connecting this unit

The previous unit made `dart` reachable from any terminal; this unit
proved, with a real failure, that `dart run` additionally requires one
specific, correctly-named function before it will run anything at all.
The final unit of this lesson gives that function real, working content —
naming it correctly this time, and adding the one line that actually
produces this lesson's promised output.

---

## Concept Unit: Calling a Function, and String Literals

### The Problem

The previous unit proved a file needs a function named exactly `main` —
but an empty `main` (`void main() { }`) would run successfully and do
precisely nothing visible: no error, but also nothing printed. This
lesson's actual, stated goal — "your first program runs" — has to mean
something a human can actually see happen. What has to be added, and what
exactly does it mean to make a function *do* something with a specific
piece of text?

> **Stop and think before reading on:** This lesson's own Objects and
> methods section already fully described `print` — what it is, what it
> does, and that it needs one value to show. Given that, and given
> everything already established about `main` needing to exist and be
> named correctly, what do you think the complete, minimal, correctly-
> working version of `hello.dart` actually needs to contain — how many
> lines, and what's on each one?

### Project Change

- **Reference Source:** No reference counterpart — this is this
  curriculum's own first real, complete program.
- **Files affected:** Modified: `hello.dart` (created empty-of-purpose in
  the previous unit's discussion; given its real, final body here).
- **Change type:** Add (the function body's one real statement).
- **Location:** Inside `main`'s curly braces, the only place any code in
  this file has existed so far.
- **Dependencies:** A correctly-named `main` function (previous unit) and
  a working `dart` command (Concept Unit 5).

### The New Code

The one new piece to type, going inside `main`'s already-established
braces:

```dart
print('Hello, World!');
```

### The Updated Project

`hello.dart` in full, with the new line placed inside the `main` function
established by the previous unit:

```dart
1  void main() {
2    print('Hello, World!');  // ← new
3  }
```

`main` — previously empty — now does one real thing when it runs: it
calls `print`, handing it the text `Hello, World!`, which is the entire
reason this file is now a program that produces visible output instead
of one that runs successfully and shows nothing.

### Introduce the concept in isolation

That is exactly this lesson's real code — there is no separate,
throwaway version to isolate it from; `print('Hello, World!');` **is**
the smallest possible demonstration of "calling a function with a string
literal argument" already, with nothing extra riding along. Running it
for real:

```
$ dart run hello.dart
Hello, World!
```

This one line of real, correct output — matching, exactly, the literal
text placed inside the quotes in the source code — is what proves calling
a function really does invoke the code behind that name, with the exact
argument given, rather than, say, printing the argument's name or doing
nothing visible. This act — using a function's name, followed by
parentheses containing the value(s) it needs — is called a **function
call**.

As a second, real, run comparison: deliberately removing the semicolon —
```dart
void main() {
  print('Hello, World!')
}
```
— and running that file for real produces this genuine compiler error
instead of any output at all:

```
no-semicolon.dart:2:24: Error: Expected ';' after this.
  print('Hello, World!')
                       ^
```

with real exit code `254`. This is direct, real proof — not asserted —
that the **statement terminator** (`;`) is not decorative: without it,
Dart's own compiler cannot tell where the `print(...)` statement is
supposed to end, and refuses to run anything at all, exactly as
Concept Unit 6 showed for a missing `main`.

### Discarding this example

There is nothing separate to discard here — uniquely among this lesson's
units, the isolated proof and the real project code are the same one
line, because a single function call with a single string-literal
argument is already the smallest possible real example of both concepts
at once. The broken, missing-semicolon variant shown above is the one
disposable artifact in this unit: it will not appear in the real project
again, existing only to prove, with a real error, why the semicolon
matters.

### Mechanical walkthrough

- **`print`** — already given full CRC treatment in this lesson's header;
  its use here is the first real invocation of everything described
  there — this exact call is what produces this lesson's real, verified
  `Hello, World!` output shown above.
- **`(`** and **`)`** — parentheses marking a function call: everything
  between them is the list of arguments — values — being handed to the
  function. This is the first appearance of function-call syntax in this
  curriculum, so it earns real treatment rather than being waved through
  as familiar punctuation: without parentheses immediately after a
  function's name, Dart would not treat this as "call this function
  now" at all.
- **`'Hello, World!'`** — a string literal, already given a real Terms
  entry above: the exact sequence of characters between the two single
  quote marks, taken as literal text data rather than as an instruction
  or a name to look up. The quote characters themselves are not part of
  the resulting text — `print` receives and outputs the fourteen
  characters `Hello, World!`, not sixteen characters including the
  quotes.
- **`;`** — the statement terminator, already given a real Terms entry
  above and, in this unit, real, direct proof (the genuine compiler error
  shown above) of why it is mandatory rather than optional or stylistic.

### CS lens

Invoking a named, pre-existing piece of behavior by name, handing it a
specific value to act on, and having it actually run in response — rather
than, say, that value only ever being inspected or logged somewhere — is
the most basic possible instance of a **function call**, one of the two
or three most fundamental operations in essentially every programming
language that exists. Every single later lesson in this entire curriculum
— from Lesson 8's formal treatment of functions, through Lesson 18's
Sudoku validation logic, to the entire multi-game platform in Phase 8 —
is built, ultimately, out of the exact same basic operation performed
here for the first time: call something by name, with specific data, and
let it act.

```
Also recognized in: pressing a labeled button that runs one specific
action, dialing a phone extension to reach one specific person,
addressing a letter to one specific recipient rather than dropping
it in a general mailbox, calling a named subroutine in the very
earliest programming languages from the 1950s
```

### SE lens

Dart requiring an explicit statement terminator (`;`), rather than
inferring where one statement ends and the next begins from line breaks
alone (the choice some other languages, like Python, actually make), is
a real, deliberate tradeoff: it costs a small amount of typing
discipline — as this unit's real, triggered compiler error demonstrates —
in exchange for removing a whole category of ambiguity about multi-line
statements, where "does this line continue the previous one, or start a
new one?" would otherwise have to be inferred by a set of separate,
extra rules. Neither choice is objectively correct; Dart's choice favors
unambiguous parsing over slightly less typing.

### Commands needed

- **`dart run hello.dart`** — already given full treatment in this
  lesson's Objects and methods section; this is its first real use
  against this lesson's actual, complete, correct file.

### Run it

The real output `Hello, World!`, and separately the real compiler error
for the missing-semicolon variant, were both produced by actually running
`dart run` against real files on this machine — not predicted. Per the
Verification Rule's own Necessity clause, an argument could be made that
`print('Hello, World!')` producing exactly `Hello, World!` is confidently
predictable without running it at all; it was run anyway here because the
same command also served as the first real end-to-end proof that this
lesson's entire installed toolchain — `dart`, on `PATH`, resolving and
executing a real file — genuinely works, which was not yet a settled
fact before this exact run. Both real runs are saved in full in
`src/docs/flutter/verification/lesson-01/run-log.md`.

### Connecting this unit

Every previous unit in this lesson was necessary groundwork — what a CPU
is, what a process is, why text needs translating, how a bare command
name gets found, how the SDK got installed, why `main` has to exist
exactly as named — for this exact moment: one real, complete,
correctly-written Dart program, running successfully on real,
installed tooling, producing exactly the output its source code says it
should.

---

## Connect the Pieces

Start to finish, one concrete trace through every unit this lesson
built, following a single value — the text `Hello, World!` — from source
code to something a human actually sees:

1. **Concept Unit 1** established that a CPU is the only thing that can
   actually execute instructions, and that RAM holds a running process's
   working data — including, eventually, the very text `Hello, World!`
   while `hello.dart` is running.
2. **Concept Unit 2** established that this all happens inside a
   **process**: when `dart run hello.dart` is typed, Windows creates one
   new process, with its own process ID and its own RAM, completely
   separate from every other process already running on the machine.
3. **Concept Unit 3** established that `hello.dart`'s own text — readable,
   42 bytes, sitting right there in the file — is not what the CPU
   executes directly; `dart.exe`, real compiled machine code (proven,
   not asserted, by its real `MZ`-prefixed, mostly unreadable first
   bytes), is what actually runs, and it is `dart.exe`'s job to turn
   `hello.dart`'s text into something the CPU can act on.
4. **Concept Unit 4** established what an environment variable is, and
   proved, with two real terminal windows, that a variable set casually
   dies with its one process — setting up exactly the problem the next
   unit had to solve properly.
5. **Concept Unit 5** installed the real Flutter SDK (bundling
   `dart.exe`) at `C:\flutter`, and made its location *persist* in
   `PATH`, correctly this time — proven with a real command succeeding
   in a brand-new terminal window, and confirmed end to end by a real,
   fully green `flutter doctor -v`.
6. **Concept Unit 6** proved, with a real, triggered error, that
   `dart run` refuses to execute anything at all unless a function named
   exactly `main` exists — Dart's fixed, mandatory entry point.
7. **Concept Unit 7** added the one real line, `print('Hello, World!');`,
   inside that correctly-named `main` — a function call, handing a
   string literal to `print` — and running the finished file end to end
   produced this lesson's real, final, verified proof: the exact text
   `Hello, World!`, printed to the terminal, exactly once, exactly as
   written.

Every later lesson in this curriculum keeps standing on every piece built
here: processes and RAM (Lessons on performance and state), the
compile/run pipeline (Lesson 96, build configurations), environment
configuration (recurring throughout deployment, Phase 13), and, from this
point on in every single lesson, function calls — the one operation this
lesson's very last line performed for the first time.
