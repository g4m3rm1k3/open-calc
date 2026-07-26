# Lesson 0: Compiled, Statically-Typed Languages and the .NET Toolchain

*(Setting Up C# and WPF)*

**Developer Story**
> As a developer, I want to understand the WPF development environment so I
> can confidently begin building desktop applications.

**What you will build**
By the end of this lesson your Windows machine will have a working .NET SDK,
a console app you wrote yourself and ran from the terminal, a WPF window that
opens and shows a real greeting on screen, and a git repository with your
first commit. The actual problem this lesson solves isn't "install some
software" — it's building a correct mental model of what C# fundamentally
*is*, compared to the Python you already know, before a single line of the
real Pocket Inventory app gets written. Get this model wrong and every later
lesson's compiler errors will feel like arbitrary rules to memorize instead
of consequences of how the language actually works.

**What you need to know first**
Nothing about C# or WPF. You know Python: variables, functions, loops,
conditionals, and how to run a script from a terminal. That knowledge of
*what programming is for* transfers completely. It does not tell you how C#
behaves, and this lesson never assumes it does — every construct here gets
explained from zero, even the ones that look familiar.

**Terms introduced in this lesson:**
- **Dynamic typing** — a value's type is checked while the program
  runs, against the actual value present at that moment, not a fixed,
  declared type.
- **Interpreted execution model** — no separate step reads and
  validates the entire program before any of it runs; each line
  executes as it's reached.
- **Static typing** — every variable, parameter, and return value has
  a type fixed at compile time and checked before the program runs at
  all.
- **`dotnet` CLI** — the command-line tool the .NET SDK installs.
- **IL** (Intermediate Language) — what the C# compiler produces from
  `.cs` files; what the CLR actually loads and runs.
- **JIT compilation** (Just-In-Time) — the CLR's step of translating
  IL into real machine code for the specific CPU it's running on.
- **Type inference** (`var`) — the compiler derives a type from
  context (an initializer expression) instead of requiring an explicit
  annotation.
- **`<OutputType>`** — the `.csproj` setting choosing what kind of
  executable a project builds (`Exe` console vs. `WinExe` windowed).
- **`<TargetFramework>`'s `-windows` suffix** — unlocks Windows-only
  APIs (WPF among them) that a plain, non-`-windows` target cannot
  reference.
- **`<ImplicitUsings>`** — the compiler silently adds a small, fixed
  set of common `using` statements to every file, project-wide.
- **`<UseWPF>`** — turns on the WPF-specific build tooling that
  compiles `.xaml` files into part of the program.
- **`App.xaml` / `App.xaml.cs`** — application-wide startup concerns
  (shared resources, which window opens first), distinct from any one
  window.
- **`MainWindow.xaml` / `MainWindow.xaml.cs`** — the first real
  window's declarative markup paired with its own C# code-behind.
- **`git init` / `git add` / `git commit`** — version control basics:
  creating a repository, staging changes, and permanently recording a
  named snapshot of everything staged.

---

## Concept Unit: Interpreted, Dynamically-Typed Execution

### The Problem

You already have a working mental model of how code runs, and it's worth
making that model explicit before contrasting it with anything new. When you
run a Python script, the Python interpreter reads it top to bottom and
executes each line as it reaches it. If line 40 has a bug that line 1 through
39 never trigger, Python will happily run all 39 good lines and only fail
when it actually reaches line 40. Nothing checks the whole file for problems
before execution starts. This is worth *seeing* directly, because C# is
about to do something genuinely different, and "different how" is the whole
point of this unit.

### Introduce the Concept in Isolation
Create a throwaway file anywhere on your machine — it will not become part
of Pocket Inventory.

```python
# throwaway_typing_demo.py
def add(x, y):
    return x + y

print(add(10, 20))
print(add(10, "20"))
```

Run it:

```bash
python3 throwaway_typing_demo.py
```

Real output:

```text
30
Traceback (most recent call last):
  File "throwaway_typing_demo.py", line 6, in <module>
    print(add(10, "20"))
  File "throwaway_typing_demo.py", line 2, in add
    return x + y
TypeError: unsupported operand type(s) for +: 'int' and 'str'
```

*What this proves:* `30` printed **before** the crash. Python never looked
ahead at line 6 while it was busy running line 5. It discovered that
`10 + "20"` is nonsensical only at the exact moment it tried to execute that
specific line — a `TypeError`, thrown at runtime, in the middle of an
otherwise-successful run. Python's variables also have no fixed type: the
name `x` inside `add` happily holds an `int` on one call and would happily
hold a `str` on the next; the *variable* isn't typed, only the *value*
currently sitting in it is, and Python doesn't check whether a value will
work with an operation until that operation actually executes.

### Discard the Throwaway Example
Delete `throwaway_typing_demo.py`. It exists only to prove what "interpreted,
dynamically typed" actually means in practice, using a language you already
know. It will not appear again.

### Mechanical Walkthrough

- `def add(x, y): return x + y` — **genuinely basic, already-established
  syntax.** Ordinary Python function, nothing about it is new; it's the
  baseline the rest of this unit contrasts against.
- `print(add(10, 20))` — **basic.** Runs and prints `30` — both arguments
  are `int`, `+` behaves exactly as expected.
- `print(add(10, "20"))` — **first appearance of the behavior this unit
  is actually about.** The *syntax* is identical to the line above it;
  what's new is *when* Python discovers this line is a problem: not
  before running anything, not even while running line 5 — only at the
  exact moment this specific line executes and `x + y` tries to add an
  `int` to a `str`.

### CS Lens

This is **dynamic typing** combined with an **interpreted execution model**.
"Dynamic" means the type of a value is checked while the program is running,
against the actual value present at that moment — not against a fixed,
declared type. "Interpreted" here means there is no separate step that reads
the *entire* program and validates it before any of it runs; Python read and
ran line 5, then read and ran line 6, one at a time.

Also recognized in: shell scripts, most spreadsheet formula languages, Ruby,
JavaScript before TypeScript, and any live REPL session in any language —
anywhere code is evaluated expression-by-expression instead of validated as
a complete unit first.

### SE Lens

The real tradeoff, stated honestly: dynamic typing lets you write and run
code fast, with no ceremony, which is exactly why Python is a good language
to learn programming with first. The cost is that a whole category of bugs —
passing the wrong kind of value to a function — only surfaces when that
exact code path actually executes, which might be a rare branch that doesn't
run until production, months after the bug was written. C# was designed to
make an different, opposite bet, which the next two units show directly.

### Connection

Nothing yet — this unit exists purely to establish the baseline that C#'s
static type system is about to be contrasted against.

---

## Concept Unit: The .NET SDK and the CLR

### The Problem

A `.py` file runs the moment you have Python installed and type
`python3 file.py`. A `.cs` file — the file extension C# source code uses —
does nothing on its own. Windows has no built-in idea of what a `.cs` file
even is. Before you can run a single line of C#, two separate pieces of
software need to exist on your machine: something that turns C# source text
into instructions a computer can actually execute, and something that
executes those instructions once they exist. Both of those pieces are what
"installing .NET" actually installs.

### The two pieces, named

- **The C# compiler** (`csc`, invoked for you by the tools you'll use) reads
  every `.cs` file in your project, checks the entire program for errors —
  including type errors, which is the whole subject of the next unit — and,
  if the program is valid, translates it into an intermediate format called
  **IL** (Intermediate Language). IL is not the C# you wrote, and it is not
  the actual machine code your CPU runs either — it's a middle format,
  deliberately CPU-independent.
- **The CLR** (Common Language Runtime) is the program that actually runs
  your compiled IL. When you launch a .NET application, the CLR loads the IL,
  translates it to real machine code for the specific CPU you're running on
  **just before it runs** — this step is called **JIT compilation**
  (Just-In-Time) — and executes it. The CLR also manages memory for you
  automatically (this is where C#'s garbage collector lives) the same broad
  job Python's own runtime does for Python objects, just for a compiled
  language instead of an interpreted one.

Put together: C# source → compiler checks + translates → IL → CLR JIT-compiles
+ runs. Python source → interpreter checks + runs, one line at a time, no
separate translation step. That's the concrete difference behind "compiled"
vs. "interpreted" — it isn't a vague label, it's these specific extra steps
happening before your program's first line ever executes.

**The .NET SDK** is the single installer that gives you the compiler, the
CLR, and the command-line tool (`dotnet`) that drives both of them, plus the
project-scaffolding templates you'll use throughout this curriculum.

### Commands needed

Install the .NET SDK from the official Microsoft download page for your
Windows machine (search "download .NET SDK" — always prefer the current LTS,
Long Term Support, release; this curriculum doesn't hardcode a version number
because .NET ships a new one every November and the concepts here don't
change release to release). After installing, open a terminal (PowerShell or
Command Prompt) and confirm it worked:

```bash
dotnet --version
```

What this does: `dotnet` is the CLI tool the SDK installed; `--version` is a
flag telling it to report its own version instead of doing anything else.
Verified on the machine this lesson was written on:

```text
9.0.100
```

You may see a different number — a newer SDK release, most likely, since
this curriculum will be read after it was written. That's expected and fine.

```bash
dotnet --list-sdks
```

Lists every SDK version installed side by side (you can have several .NET
versions installed at once without conflict — each project picks the one it
targets in its `.csproj`, which the next unit introduces).

### Mechanical Walkthrough

- `dotnet --version` — **first appearance.** `dotnet` is the CLI tool
  the SDK installs; `--version` reports which SDK version is currently
  active, without building or running anything.
- `dotnet --list-sdks` — **first appearance.** Lists every SDK version
  installed on the machine, side by side — useful once a machine has
  more than one, which `--version` alone can't show.
- **IL** (Intermediate Language) — **first appearance.** Not code you
  write directly; it's what the C# compiler produces from your `.cs`
  files, and what the CLR actually loads and runs.
- **JIT compilation** (Just-In-Time) — **first appearance.** The CLR's
  step of translating IL into real machine code for the specific CPU
  it's running on, done at launch, not ahead of time.
- **The .NET SDK** — **first appearance.** The single installer
  bundling the compiler, the CLR, the `dotnet` CLI, and the project
  templates this curriculum uses throughout.

### CS Lens

This is **two-phase compilation through an intermediate representation**
— translate once, ahead of time, to a portable format, then translate
again, per-machine, to real instructions, right before running. Also
recognized in: Java's `.class` bytecode running on the JVM (the closest
direct equivalent — a compiler produces bytecode once, and each JVM
JIT-compiles it for its own specific CPU), Python's `.pyc` bytecode
files (compiled once, interpreted rather than JIT'd, but the same
"intermediate format, not source, not raw machine code" idea), and
WebAssembly (compiled once from C/C++/Rust/etc., then run by any
browser's own engine on any CPU architecture).

### SE Lens

Why does .NET compile to an intermediate format (IL) instead of straight to
machine code, the way C compilers traditionally do? Because IL is
CPU-independent — the exact same compiled `.dll` can run on an ARM-based
Windows laptop or an x64 desktop; the CLR's JIT step is what adapts it to
whichever chip it's actually running on, at the moment it runs, not at
compile time. The cost: JIT compilation takes real time the very first
moment a piece of code runs, which is why some methods run measurably slower
on their very first call than every call after — the JIT hasn't produced
native code for that method yet the first time through.

### Connection

Every C# program in this curriculum goes through exactly this pipeline. The
next unit uses it to run real C# for the first time and prove the claim from
Concept Unit 1: that C# rejects broken programs before running any of them.

---

## Concept Unit: Compiled, Statically-Typed Execution

### The Problem

Concept Unit 1 showed Python running line 5 successfully before crashing on
line 6. Does C#, with its separate compile step from Concept Unit 2, actually
behave differently — or is "the compiler checks types" just a claim so far?
This unit proves it, using the same shape of program.

### Introduce the Concept in Isolation
Create a console project — a program that runs in a terminal with no window,
the simplest possible C# project, and the right place to see raw language
behavior with nothing else going on.

```bash
dotnet new console -o lab-typing
cd lab-typing
```

`dotnet new` scaffolds a new project from a named template; `console` is the
template name (a plain terminal program, no UI); `-o lab-typing` names the
output folder. This created a file called `Program.cs`. Open it — the
default template already contains one line:

```csharp
Console.WriteLine("Hello, World!");
```

Run it exactly as generated, before changing anything:

```bash
dotnet run
```

Real output:

```text
Hello, World!
```

Now replace the whole file with the same shape of program Concept Unit 1
used in Python:

```csharp
int Add(int x, int y)
{
    return x + y;
}

Console.WriteLine(Add(10, 20));
Console.WriteLine(Add(10, "20"));
```

Run it:

```bash
dotnet run
```

Real output — verified on the machine this lesson was written on:

```text
Program.cs(7,27): error CS1503: Argument 2: cannot convert from 'string' to 'int'
The build failed. Fix the build errors and run again.
```

*What this proves:* line 6, `Console.WriteLine(Add(10, 20))`, is completely
correct C#. It never ran. Nothing printed — not even `30`. The compiler read
the *entire file*, found that line 7 passes a `string` where an `int` is
required, and refused to produce a runnable program at all. This is the
direct, concrete difference from Concept Unit 1's Python run: Python executed
the good line and crashed on the bad one; C# refused to run *any* of it,
because the whole file is checked before any of it executes.

### Discard the Throwaway Example
Delete the `lab-typing` folder. It proved the concept; it never becomes part
of Pocket Inventory.

### Mechanical Walkthrough
Every distinct element in the working version, in order:

1. `int Add(int x, int y)` — (first appearance) a **method** declaration.
   `int` before the name is the method's **return type** — a binding promise
   that calling `Add(...)` always produces an `int`, checked by the compiler,
   never just "whatever the last line happened to return" the way a Python
   function implicitly does. `Add` is the method's name. `(int x, int y)` is
   the **parameter list** — each parameter has an explicit declared type,
   unlike Python's `def add(x, y):`, where `x` and `y` carry no type
   annotation at all by default.
2. `{ ... }` — (first appearance) a **method body**, delimited by curly
   braces rather than Python's indentation. C# does not use indentation to
   mean anything to the compiler; the braces are what actually define the
   block. Indentation in the examples above is for human readability only.
3. `return x + y;` — (first appearance) the `return` keyword, and the
   **semicolon** ending the statement. C# requires a semicolon at the end of
   most statements; it is not optional whitespace the way a newline is in
   Python. `x + y` adds two values already known to the compiler to both be
   `int`, because the parameter list said so.
4. `Console.WriteLine(...)` — (first appearance) `Console` is a class the
   .NET SDK provides for you (no `import` needed for this one — it's part of
   a set of "implicit usings" the console template enables automatically,
   which later lessons will unpack). `WriteLine` is a method on it that
   prints its argument followed by a newline — the direct C# equivalent of
   Python's `print(...)`.
5. `Add(10, 20)` — (first appearance) a **method call**. `10` and `20` are
   `int` literals, matching `Add`'s declared parameter types exactly.
6. `Add(10, "20")` — `"20"` is a **string literal**, in double quotes (C#
   never uses single quotes for strings the way Python allows either). This
   is the line that fails: `Add` demands an `int` in that position; `"20"` is
   a `string`; the compiler rejects the call before the program is ever
   allowed to run.

### CS Lens

This is **static typing**: every variable, parameter, and return value has a
type that is fixed at compile time and checked against every use of it,
before the program runs at all — the direct opposite of Concept Unit 1's
dynamic typing, where a value's type is only ever checked at the exact
moment an operation touches it.

Also recognized in: Java, Rust, TypeScript (checked, notably, by a separate
tool rather than the browser that actually runs the JavaScript it produces),
Haskell, and Swift — any language where "does this program even type-check"
is a question with an answer before the program's first line executes.

### SE Lens

The real tradeoff: static typing catches an entire category of bugs before
your program ever ships, at the cost of writing more upfront — every
parameter and return type has to be declared, and code that Python lets you
write in five minutes sometimes takes longer in C# because the compiler
won't let you defer the type decision. The debt this project is *not*
carrying yet, because of this: no Pocket Inventory lesson will ever ship a
`TypeError` that only appears the first time a specific, rare code path
finally executes in front of a user — the compiler will have already refused
to build that version.

### Connection

Concept Units 1 and 3 together are the entire reason C# and Python "feel"
different to write, and it's a mechanical difference, not a style
preference: one checks types while running; the other refuses to run at all
until every type checks out.

---

## Concept Unit: `var` and Type Inference

### The Problem

Writing `int Add(int x, int y)` required naming `int` three times in one
line. Most of the time, when you write `int total = 10;`, the type is
completely obvious from the value on the right — writing `int` at all feels
redundant. C# has a keyword for this, and it is the single most common
source of confusion for anyone arriving from Python, because it looks like
Python's plain `total = 10` but is not the same thing at all.

### Introduce the Concept in Isolation
Create another throwaway console project.

```bash
dotnet new console -o lab-var
cd lab-var
```

Replace `Program.cs`:

```csharp
var count = 5;
var label = "widgets";
Console.WriteLine(count);
Console.WriteLine(label);
```

Run it:

```bash
dotnet run
```

Real output:

```text
5
widgets
```

*What this proves so far:* `var` let you skip writing `int` and `string`
explicitly. But this is **not** Python's untyped assignment happening again —
`count` is still, permanently, an `int` from this point on; the compiler
*inferred* that type from the literal `5` on the right-hand side, once, at
this line, and will enforce it exactly as if you'd written `int count = 5;`
by hand. Prove it:

```csharp
var count = 5;
count = "now a string";
```

Run it:

```text
Program.cs(2,9): error CS0029: Cannot implicitly convert type 'string' to 'int'
```

*What this proves:* `var` chose a type once, at declaration, and never
revisits that choice. This is exactly the static typing from the previous
unit — `var` only changes *who writes the type*, the compiler instead of
you; it changes nothing about *when* the type is checked or *whether* it can
later change.

### The exact gotcha this project exists partly to teach

Now try declaring two variables in one statement — completely normal with
explicit types:

```csharp
int a, b = 5;
```

This compiles. It declares two `int`s, `a` and `b`; only `b` is given a
value, `5`. Now do the same thing with `var`:

```csharp
var a, b = 5;
Console.WriteLine(a);
```

Run it. Real output — verified on the machine this lesson was written on:

```text
Program.cs(1,1): error CS0819: Implicitly-typed variables cannot have multiple declarators
Program.cs(1,5): error CS0818: Implicitly-typed variables must be initialized
Program.cs(1,8): warning CS0219: The variable 'b' is assigned but its value is never used
```

*What this proves:* `var` requires the compiler to infer a type from
*exactly one* initializer expression on the same line. `var a, b = 5;` is
ambiguous to the compiler in a way `int a, b = 5;` never was — does `a` get
inferred from `5` too? Does it get no type at all? C# refuses to guess, and
makes this a compile error rather than picking a default. This is why
`int a, b;` is legal but `var a, b;` never is, in any C# program, regardless
of what values follow. The fix is to give `var` exactly one declarator per
statement:

```csharp
var a = 5;
var b = 10;
int c = 15, d = 20;
Console.WriteLine(a);
Console.WriteLine(b);
Console.WriteLine(c);
Console.WriteLine(d);
```

Run it. Real output:

```text
5
10
15
20
```

### Discard the Throwaway Example
Delete the `lab-var` folder. Pocket Inventory will use `var` throughout —
this lab's job was only to prove exactly what it does and does not mean.

### Mechanical Walkthrough

- `var count = 5;` / `var label = "widgets";` — **first appearance.**
  The compiler infers `int` and `string` respectively from each
  initializer's literal, once, at declaration — not re-evaluated later.
- `count = "now a string";` after `var count = 5;` — **first
  appearance of the enforcement.** Rejected with `CS0029`, the exact
  same error explicit `int count = 5;` would produce — proof `var`
  changed nothing about *when* or *whether* the type is checked.
- `int a, b = 5;` — **reappearing**, basic multi-declarator syntax:
  legal because each declarator (`a`, `b = 5`) can have its own type
  independently understood from the shared `int` keyword.
- `var a, b = 5;` — **first appearance of `var`'s one real syntactic
  restriction.** Fails with `CS0819`/`CS0818`: `var` requires exactly
  one initializer to infer from, and a multi-declarator statement gives
  the compiler no way to decide which (or whether) each variable's type
  should be inferred.
- `var a = 5; var b = 10; int c = 15, d = 20;` — **first appearance of
  the fix.** One `var` declarator per statement sidesteps the ambiguity
  entirely; `int c = 15, d = 20;` still works multi-declarator, since
  `int` was never inferred in the first place.

### CS Lens

This is **type inference**: the compiler derives a type from context (here,
an initializer expression) instead of requiring an explicit annotation. It
is still fully static — the type is fixed at compile time, `var` only
changes who writes it down.

Also recognized in: TypeScript's `let x = 5` (inferred `number`), Rust's
`let x = 5` (inferred `i32`), Swift's `let x = 5` — the same idea, "infer
once at declaration, then enforce it like any other static type," recurring
across essentially every modern statically-typed language, precisely because
writing every type by hand at every declaration was found, repeatedly, to
add ceremony without adding safety.

### SE Lens

Why does C# allow `var` at all, instead of requiring explicit types
everywhere? Readability at the declaration site — `var total = GetTotal();`
reads cleanly, and the type is one hover or one click away in any real
editor. The real tradeoff: overusing `var` on a line where the right-hand
side's type isn't visually obvious (`var result = Process(data);`) forces a
reader to go find `Process`'s return type to understand what `result` even
is — this project will default to `var` for locals whose type is obvious
from the same line (`var items = new List<InventoryItem>();`) and an
explicit type when it isn't.

### Connection

Every C# variable in every remaining lesson is either declared with `var`
(inferred, but still fixed and enforced) or an explicit type — never
Python's untyped assignment. This unit is the one to come back to any time a
later lesson's compiler error mentions a type mismatch on a `var`-declared
variable.

---

## Concept Unit: WPF Among Windows UI Frameworks

### The Problem

.NET can build several completely different kinds of application from the
same C# language and the same SDK: a console app (Concept Unit 3), a web
API, or a desktop app with real windows, buttons, and menus. Building a
desktop app requires picking a **UI framework** — the library responsible for
actually drawing windows and controls and routing clicks back into your
code. Microsoft has shipped four different ones over the years, and this
curriculum needs to say plainly why it picked the one it did.

### The alternatives, and the real tradeoffs

- **WinForms** — the oldest (1990s-era design), still maintained. Drag a
  button onto a form in a visual designer; the designer generates C# code
  behind the scenes to create it. Simple to start, but layout is largely
  pixel-and-anchor based rather than a real layout system, and there's no
  separate markup language — the UI's structure lives inside generated C#,
  which makes it harder to keep structure and behavior cleanly separated.
- **UWP** (Universal Windows Platform) — designed for Windows Store apps
  with a heavily sandboxed security model. Microsoft has since redirected
  new development toward the next option; UWP is not the recommended
  starting point for new projects today.
- **.NET MAUI** — the actively-developed cross-platform successor,
  targeting Windows, macOS, iOS, and Android from one codebase. The
  direction Microsoft is investing in long-term — and also, as of this
  writing, the least mature of the four for pure Windows desktop work, with
  a smaller base of mature third-party tooling and community answers than
  WPF has accumulated over two decades.
- **WPF** (Windows Presentation Foundation) — introduced in 2006, uses a
  separate XAML markup language (the next unit's subject) to describe UI
  structure declaratively, with a mature, powerful data-binding system this
  entire curriculum leans on constantly starting in Epic 2. Windows-only.
  Not where Microsoft is investing new framework features — but exactly
  what your university course assigns, extremely well documented after two
  decades of real production use, and the framework whose ideas (XAML,
  binding, MVVM) MAUI itself directly inherited. Learning WPF's ideas
  transfers straight into MAUI later, far more than the reverse would.

This curriculum uses **WPF**, for one concrete reason: it's the framework
your course requires, and it happens to also be the one whose core ideas —
declarative markup, data binding, MVVM — are the most transferable to
everything that came after it.

### Commands needed

```bash
dotnet new wpf -o PocketInventory
```

This template requires the **Windows Desktop workload**, a piece of the SDK
that only installs and only runs on Windows — this is the one command in
this lesson that cannot be verified on a non-Windows machine; run it on your
Windows install and confirm the folder now contains the files the next unit
walks through.

### Mechanical Walkthrough

- `dotnet new wpf -o PocketInventory` — **first appearance of this
  specific template name.** `dotnet new console` (used throughout this
  lesson's earlier labs) scaffolds a bare console app; `wpf` scaffolds
  the real project shape — window, XAML, `App.xaml` — the next unit
  walks through file by file. `-o PocketInventory` — **reappearing**
  (the `-o` flag, already used in every earlier `dotnet new` call) —
  names the output folder.

### SE Lens

Why does .NET restrict WPF to Windows at all, when the CLR itself (Concept
Unit 2) is explicitly cross-platform? Because WPF's rendering pipeline calls
directly into Windows-specific graphics APIs to draw every window and
control — it was never built to be portable. That's the real cost of
choosing WPF over MAUI: this app will never run natively on macOS or Linux.
For a university course assigning WPF specifically, that cost doesn't apply —
but it's the honest reason MAUI exists at all.

### Connection

Every remaining lesson in this project targets the WPF project this unit's
command scaffolds, not the console project from Concept Unit 3 — though the
console project's C# (Units 1, 3, and 4) applies unchanged inside WPF too.

---

## Concept Unit: Anatomy of a WPF Project

### The Problem

`dotnet new wpf` just created several files you've never seen before. Before
writing a single new line of code, you need to know what each one is
responsible for — otherwise every future lesson's "open `MainWindow.xaml`"
instruction is meaningless.

### Project Change

- **Reference Source:** No reference counterpart — this is the standard
  scaffold `dotnet new wpf` generates; there is no prior lesson version to
  diff against.
- **Files affected:** `PocketInventory.csproj`, `App.xaml`, `App.xaml.cs`,
  `MainWindow.xaml`, `MainWindow.xaml.cs` — all created by the template
  command in the previous unit.
- **Change type:** Nothing to write yet — this unit only reads and explains
  what already exists.
- **Location:** Project root (`.csproj`) and the project folder directly
  (the four remaining files).
- **Dependencies:** None beyond the SDK from Concept Unit 2.

### The files, one at a time

**`PocketInventory.csproj`** — the project file, in XML, telling the
`dotnet` CLI what kind of project this is and how to build it:

```xml
<Project Sdk="Microsoft.NET.Sdk">

  <PropertyGroup>
    <OutputType>WinExe</OutputType>
    <TargetFramework>net10.0-windows</TargetFramework>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
    <UseWPF>true</UseWPF>
  </PropertyGroup>

</Project>
```

(The exact number in `net10.0-windows` tracks whichever .NET version is
current when you run `dotnet new wpf` — .NET ships a new major version every
November, so this will keep climbing in future years; whatever your own
generated file says is the right one, not a fixed number to match forever.)

Compare this to the console app's `.csproj` from Concept Unit 3, which had
`<OutputType>Exe</OutputType>`, `<TargetFramework>net10.0</TargetFramework>`,
and no `UseWPF` line at all. Four differences, each one meaningful:
`OutputType` is `WinExe` instead of `Exe` — a Windows GUI executable, which
launches without ever attaching a visible console/terminal window, versus a
plain console executable, which always has one. `TargetFramework` ends in
`-windows` — this project can now use Windows-only APIs (like WPF itself)
that a plain `net10.0` project is blocked from referencing at all, by design,
so a cross-platform console project can never accidentally depend on a
Windows-only type. `ImplicitUsings` — (first appearance) — when `enable`,
the compiler silently adds a small, fixed set of the most common `using`
statements (`System`, `System.Collections.Generic`, `System.Linq`, and a
handful more, different per project type) to every file in the project,
without you writing them — this is why code you type from this lesson
onward can call things like `Console.WriteLine` or use `List<T>` with no
`using System;` line visibly sitting at the top of the file. It's a project-
wide setting, not something any single `.cs` file controls, and it's on by
default in every template `dotnet new` generates today. `UseWPF` turns on
the WPF-specific build tooling that compiles `.xaml` files (covered next)
into part of the program.

**`App.xaml` / `App.xaml.cs`** — together, these define the **application**
as a whole, as opposed to any one window. `App.xaml` declares
application-wide resources (Lesson 5 uses this for shared styles) and names
which window opens first via its `StartupUri` attribute. `App.xaml.cs` is
this file's **code-behind** — a C# class that runs application-level code
(startup logic, unhandled-exception handling, later lessons' dependency
setup) and is paired with `App.xaml` by a shared class name.

**`MainWindow.xaml` / `MainWindow.xaml.cs`** — the first actual window.
`MainWindow.xaml` is the **markup file**: XAML, the declarative language the
next unit explains, describing what's inside this window. `MainWindow.xaml.cs`
is that window's own code-behind — C#, not XAML, handling clicks and other
logic for this specific window.

### Mechanical Walkthrough

- `<OutputType>WinExe</OutputType>` — **first appearance**, contrasted
  against the console template's `Exe`. Produces a Windows GUI
  executable — one that launches with no visible console/terminal
  window attached.
- `<TargetFramework>net10.0-windows</TargetFramework>` — **first
  appearance of the `-windows` suffix.** Unlocks Windows-only APIs
  (WPF itself among them); a plain `net10.0` target is blocked from
  referencing them at all, by design.
- `<ImplicitUsings>enable</ImplicitUsings>` — **first appearance.**
  The compiler silently adds a small, fixed set of common `using`
  statements to every file, project-wide — why code in this curriculum
  can call `Console.WriteLine` or use `List<T>` with no visible
  `using System;` line.
- `<UseWPF>true</UseWPF>` — **first appearance.** Turns on the
  WPF-specific build tooling that compiles `.xaml` files into part of
  the program — without this, `.xaml` files in the project wouldn't
  build at all.
- `App.xaml` / `App.xaml.cs` — **first appearance.** Application-wide
  concerns (shared resources, which window opens first via
  `StartupUri`) paired with C# code-behind for startup logic —
  distinct from any one window.
- `MainWindow.xaml` / `MainWindow.xaml.cs` — **first appearance.** The
  first real window: declarative XAML markup paired with its own C#
  code-behind for that window's specific logic.

### CS Lens

Splitting `App.xaml`/`MainWindow.xaml` (structure) from their paired `.cs`
files (behavior) is **separation of concerns** applied at the file level: a
change to what a window *looks like* touches only the `.xaml` file; a change
to what happens *when you click something* touches only the `.xaml.cs` file.
Two people could edit both simultaneously with no merge conflict, because
they're touching different files describing different concerns of the same
window.

### SE Lens

The alternative WinForms takes — generating the UI-construction code
directly into a C# file via a visual designer — collapses structure and
behavior into one file. The cost, felt directly the first time you
hand-edit generated designer code and the designer regenerates over your
change: there's no clean boundary protecting your logic from the
auto-generated layout code, or vice versa. WPF's two-file split is a direct
answer to that specific, real pain.

### Connection

`MainWindow.xaml` is exactly the file the next unit edits to put your first
real content on screen.

---

## Concept Unit: XAML as a Declarative Tree

### The Problem

`MainWindow.xaml`, as scaffolded, produces a blank window with a title bar
and nothing inside it. You need to actually put something on screen — text
that says Pocket Inventory is running — and to do that you need to
understand what the markup language inside this file actually is.

### Introduce the Concept in Isolation
The scaffolded `MainWindow.xaml` contains a `Grid` element with nothing
inside it:

```xml
<Window x:Class="PocketInventory.MainWindow"
        xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        Title="MainWindow" Height="450" Width="800">
    <Grid>

    </Grid>
</Window>
```

*What this is, mechanically:* XAML (eXtensible Application Markup Language)
is XML — angle-bracket tags, attributes in quotes, a strict single root
element (`Window`, here) — used to describe a tree of objects
**declaratively**: you state what the final structure should look like, not
the step-by-step code that would build it. `<Window ...>` is not a
convention or a comment; it directly means "create one instance of the C#
class `System.Windows.Window`." Every tag in XAML instantiates a real .NET
object the same way `new Window()` would in C#; XAML is a different syntax
for object construction, not a separate templating language layered on top
of it.

### Discard nothing — this is the real project file

Unlike the previous units, there is no throwaway version here: `MainWindow.xaml`
*is* the project's real file already, per the Concept Isolation Rule's own
allowance for when a concept's entire point is a type the project will
actually use.

### Project Change

- **Reference Source:** No reference counterpart — this is a from-scratch
  addition to the scaffolded template.
- **Files affected:** `MainWindow.xaml`.
- **Change type:** Add.
- **Location:** Inside the empty `<Grid>` element shown above.
- **Dependencies:** None beyond the scaffolded project from the previous
  unit.

### The New Code

```xml
<TextBlock Text="Pocket Inventory is running."
           FontSize="24"
           HorizontalAlignment="Center"
           VerticalAlignment="Center" />
```

### The Updated Project

```xml
<Window x:Class="PocketInventory.MainWindow"
        xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        Title="MainWindow" Height="450" Width="800">
    <Grid>
        <TextBlock Text="Pocket Inventory is running."
                   FontSize="24"
                   HorizontalAlignment="Center"
                   VerticalAlignment="Center" /> <!-- ← new -->
    </Grid>
</Window>
```

The window now contains exactly one visible element: a centered line of
text. Everything else in the file — the `Window` tag's attributes, the
otherwise-empty `Grid` — is unchanged from the template; the `Grid` now has
one child instead of zero.

### Mechanical Walkthrough
Every distinct element in the new line, in order:

1. `<TextBlock ... />` — (first appearance) instantiates
   `System.Windows.Controls.TextBlock`, the basic WPF control for displaying
   a run of text — the closest WPF equivalent to Python's `print(...)`
   output, except this text is a permanent, visible object on screen rather
   than a line sent to a console.
2. `Text="Pocket Inventory is running."` — (first appearance) sets the
   `TextBlock`'s `Text` **property** via an XAML attribute. This is
   equivalent to writing `textBlock.Text = "Pocket Inventory is running.";`
   in C# — XAML attributes are property assignments, not arbitrary markup.
3. `FontSize="24"` — sets the `FontSize` property, a `double` (a
   floating-point number) despite being written without a decimal point here;
   XAML converts the text `"24"` into the numeric type the property actually
   expects.
4. `HorizontalAlignment="Center"` / `VerticalAlignment="Center"` — (first
   appearance) set two properties whose values come from **enums** — closed
   sets of named options (`Left`, `Center`, `Right`, `Stretch` for
   `HorizontalAlignment`) — the same `enum` concept this project's roadmap
   introduces formally for inventory categories in Lesson 12. Center/Center
   places the text in the middle of the `Grid` both horizontally and
   vertically.
5. `/>` — the self-closing tag syntax, standard XML, meaning this element has
   no children — everything it needs is expressed through its attributes.

### CS Lens

This is a **declarative tree structure**: the whole `Window` is a tree of
objects (`Window` → `Grid` → `TextBlock`), described once, all at once, with
properties set as part of the description rather than assigned step by step
afterward in separate statements. WPF calls this the **visual tree**, and
every future WPF lesson in this project adds to it.

Also recognized in: HTML (a tree of DOM elements), React's JSX, Android's
XML layouts (seen directly in this curriculum's sibling project,
[`../track/`](../track/)), and Compose/SwiftUI's declarative view builders —
the same idea, "describe the structure you want, let the framework build
it," recurring across essentially every modern UI framework.

### SE Lens

The alternative — building this same window entirely in `MainWindow.xaml.cs`
with `new TextBlock { Text = "...", FontSize = 24 }` followed by
`grid.Children.Add(textBlock)` — is completely legal C# and would produce an
identical window. WPF's designers chose to make XAML the default *because*
a declarative tree, written as markup, is dramatically easier to read at a
glance than the equivalent imperative construction code, and because a
visual designer tool (Visual Studio's XAML preview) can render markup live
without running your program — something it cannot do for arbitrary C#.

### Commands needed

```bash
dotnet run
```

Rebuilds and launches the WPF application. On your Windows machine, this
opens a real window titled "MainWindow," 800×450 pixels, showing "Pocket
Inventory is running." centered on screen. This is the one output in this
lesson you must verify yourself, on Windows — WPF cannot run on the machine
this lesson was written on, for the exact reason stated in the previous
unit's SE Lens.

### Connection

This is the visible, working deliverable Agile Delivery requires of every
lesson in this curriculum, satisfied for the very first time: something you
can run and see, right now, not "once we wire it up later." Lesson 1 takes
this exact window and turns it into a genuine home screen with real layout
and a real greeting message tied to the Pocket Inventory app itself.

---

## Concept Unit: Version Control and the First Commit

### The Problem

Every lesson from here on modifies real files. Without version control,
there is no way to see what changed, when, or why — and no way to recover a
working version if a later lesson's change breaks something.

### What version control is, and why it's not optional here

Version control records a history of every change made to a project. You can
return to any previous state, see exactly what changed and when, and — later
in this curriculum, if you ever branch — work on two different changes in
parallel. For a self-taught or solo learner, this isn't a nice-to-have: it's
how you recover from your own mistakes and how you understand your own
history six months later. **Git** is the version control tool this
curriculum uses.

A file, in git, is always in one of three states: **modified** (you changed
it; git hasn't recorded anything yet), **staged** (you've told git "this
change belongs in the next snapshot"), and **committed** (that snapshot is
now permanently part of the project's history). A **commit** is a
named snapshot of every staged file at one moment in time. The message
attached to a commit should explain **why** the change was made — git
already records *what* files changed automatically; a message that just
repeats the file list adds nothing a reader couldn't get from the diff
itself.

### Commands needed

```bash
git init
```

`init` creates a new, empty git repository in the current folder — a hidden
`.git` folder that will hold this project's entire history from this point
forward.

```bash
git add .
```

`add` moves files from "modified" to "staged." `.` means "everything in the
current folder and below."

```bash
git commit -m "Set up .NET SDK, console and WPF project scaffolds, and first XAML greeting"
```

`commit` takes everything currently staged and permanently records it as one
snapshot. `-m "..."` supplies the commit message inline. This message states
*why* — establishing the toolchain and getting a first visible WPF window
running — rather than just "add files," which git's own diff would already
tell a reader.

### Mechanical Walkthrough

- `git init` — **first appearance.** Creates a hidden `.git` folder in
  the current directory — an empty repository, no history yet, ready
  to start tracking changes from this exact point forward.
- `git add .` — **first appearance.** Moves every file in the current
  folder and below from "modified" (git sees it changed, isn't
  tracking it for the next snapshot yet) to "staged" (included in the
  next commit). The `.` means "everything here," as opposed to naming
  individual files.
- `git commit -m "..."` — **first appearance.** Permanently records
  everything currently staged as one named snapshot in the project's
  history. `-m` supplies the message inline rather than opening an
  editor.

### CS Lens

A git repository is a **directed acyclic graph of immutable snapshots** —
each commit points backward at the commit(s) it came from, nothing ever
overwrites an earlier commit in place, and there's no cycle back to an
earlier state except by creating a brand-new commit that happens to match
it. Also recognized in: a filesystem with snapshotting (ZFS, Btrfs, Time
Machine), a database's write-ahead log replayed to reconstruct any past
state, an "undo" stack in any editor (each entry a snapshot, never mutated
once written), and a blockchain's chain of blocks, each referencing the
hash of the one before it.

### SE Lens

Why does a commit message matter if git already tracks every changed line?
Because six months from now, `git log` will show you *that* `MainWindow.xaml`
changed on a given date — only the message tells you *why* it was worth
changing, which is the part that isn't recoverable from the diff alone.

### Connection

Every remaining lesson in this curriculum ends its Definition of Done with a
git commit in this same format — this is the one and only lesson that
explains the format itself; every later commit just uses it.

---

## Closing

### Connect the Pieces
Start to finish: you installed the .NET SDK (Concept Unit 2), which gave you
`dotnet`, the compiler, and the CLR. You proved, with real running code, that
C#'s compiler rejects an entire broken program before executing any of it
(Unit 3) — the opposite of the Python behavior you confirmed first (Unit 1).
You learned that `var` doesn't undo any of that — it only lets the compiler
infer the type instead of you writing it (Unit 4), and hit the exact
compiler errors that fire when `var` is asked to do something it structurally
cannot. You chose WPF deliberately, over three real alternatives, for a
concrete reason (Unit 5), then walked through every file `dotnet new wpf`
generated (Unit 6), and used the actual markup language in one of those files
to put real, visible text on screen (Unit 7) — a working, visible result,
which Agile Delivery requires of every lesson from here on. Finally, you put
all of it under version control with a first real commit (Unit 8).

### What Breaks Without This
Delete the `TargetFramework` line's `-windows` suffix from `PocketInventory.csproj`
(make it just `net10.0`, or whatever number your own file actually shows)
and run `dotnet build`. Real, representative failure:
the WPF-specific types the project depends on (`Window`, `TextBlock`, and
everything else) are Windows-only APIs, and a `TargetFramework` without
`-windows` blocks a project from referencing them at all — you'll get a
build error naming the WPF types as unavailable in the current target
framework. Restore the `-windows` suffix and the project builds again. This
is the direct, hands-on proof behind Concept Unit 6's claim that
`-windows` is what unlocks Windows-only APIs — it isn't a formality.

### Exercises

- In a scratch console project, declare three `var`-typed locals in three
  separate statements, then try combining any two of them into one
  statement with a comma. Read the exact compiler error and match it against
  Concept Unit 4.
- Change `MainWindow.xaml`'s `HorizontalAlignment` from `Center` to `Left`,
  rerun, and observe exactly where the text moves. Then try a value that
  isn't a real option, like `HorizontalAlignment="Middle"` — read the error
  and connect it to enums being a *closed* set of named values.
- Run `dotnet new console -o lab-again` and open the generated `Program.cs`.
  Compare it, line by line, against Concept Unit 3's version — later
  lessons will explain any difference you find as soon as it's relevant.

### Definition of Done
- [ ] `dotnet --version` runs successfully on your machine.
- [ ] You ran the Concept Unit 1 Python example and the Concept Unit 3 C#
      example yourself and can state, in your own words, the difference
      their outputs proved.
- [ ] You triggered the real `CS0819`/`CS0818` errors from Concept Unit 4
      yourself, not just read about them.
- [ ] `dotnet new wpf -o PocketInventory` succeeded on your Windows machine.
- [ ] `dotnet run` opens a window showing "Pocket Inventory is running."
      centered on screen.
- [ ] `git init` has been run inside the `PocketInventory` project folder.
- [ ] Your first commit exists, with a message stating *why*, matching the
      format Concept Unit 8 taught.
