# Lesson 0.1: The Shape of a Running Program

**What you will build.** A single Kotlin file, `Calculator.kt`, that
compiles, runs, prints several lines of text to a terminal, and stores
and changes a number — the first sliver of Slice 0's console calculator
(a terminal program capable of `+`, `-`, `*`, `/`). No arithmetic
operations are wired up yet; that starts in Lesson 0.2. This lesson is
about the transferable problem underneath *any* program before it can
do anything else: what a program actually is to a computer, how it gets
from source text to something running, what a value and a type are, and
the two ways Kotlin lets you attach a name to a value — one that refuses
to change, and one that doesn't.

**What you need to know first.** Nothing. This is the first lesson of
the curriculum.

**Terms used in this lesson**

- **program** — a finite sequence of instructions a computer executes,
  one after another, to produce some effect (printed text, a changed
  value, a file written). The term exists to separate the *text* you
  type (source code) from the *behavior* that text causes once it runs
  — the same source file is inert on disk and only becomes a program in
  the sense meant here while it's executing.
- **instruction** — one individual step in a program: "print this,"
  "add these two numbers," "store this value under this name." A
  program is instructions in sequence; understanding "what does this
  program do" always reduces to "what does each instruction do, in the
  order it runs."
- **JVM (Java Virtual Machine)** — the program that actually runs
  compiled Kotlin code. Kotlin's compiler (`kotlinc`) does not turn
  source code into instructions a processor runs directly; it turns
  Kotlin into `.class` files containing JVM bytecode, and the JVM
  (started by the `java` command) is what reads that bytecode and
  actually executes it. This exists because it lets the same compiled
  output run unmodified on any machine with a JVM installed, regardless
  of the underlying processor or operating system — the JVM is the one
  thing that has to match the machine; the compiled Kotlin does not.
- **`fun`** — the keyword that begins a function declaration in Kotlin.
  It exists because the compiler has to be told, unambiguously, "what
  follows is a named, callable block of instructions," as opposed to a
  variable declaration or a type declaration, which use different
  keywords (`val`, `var`, `class`). Without a keyword marking the start,
  the compiler would have no way to tell `main() {}` apart from a
  function call sitting at the top level of a file.
- **statement** — an instruction that is executed for its effect (what
  it *does*), not for a value it hands back to be used by more code
  around it. A call like `println("hi")` is a statement: nothing else
  in the program uses whatever `println` returns; you ran it because
  you wanted the side effect (text appearing on the terminal), not to
  get a result you'd plug into the next piece of code.
- **expression** — a piece of code that evaluates to a value. `2 + 3` is
  an expression: run it, and there is a value at the end (`5`) that
  something else could use — pass it to a function, store it under a
  name, compare it to something. The distinction from a statement above
  is not about *what the code looks like*, it's about *whether there's
  a resulting value the rest of the program can pick up and use*.
- **value** — a piece of data a program can hold, pass around, and
  operate on: `5`, `3.5`, `true`, `"hello"` are all values. The term
  exists because "value" is the unit everything else in this lesson is
  built from — an expression *produces* one, a type *categorizes* one,
  and `val`/`var` *name* one.
- **type** — a category that determines what a value's data actually
  is (an integer, a piece of text, a yes/no answer) and what operations
  are valid on it. The reason this matters practically, not just as
  vocabulary: Kotlin's compiler checks, before your program ever runs,
  that every operation you write is actually valid for the types
  involved — mixing an operation with the wrong type of value is
  rejected at compile time, not discovered as a crash later. This
  lesson proves that check is real, not just claimed, in Concept Unit 4
  below.
- **`val`** — the keyword that declares an immutable named binding: a
  name attached to a value that cannot later be pointed at a different
  value. It exists so that "this name's value never changes after this
  line" can be a fact the compiler enforces for you, rather than a rule
  you have to remember and hope you don't break three screens of code
  later.
- **`var`** — the keyword that declares a mutable named binding: a name
  attached to a value that *can* later be pointed at a different value,
  using `=` again on its own line. It exists for the cases where "this
  name's value never changes" is false by design — a running total, a
  counter, anything that's expected to be reassigned as the program
  runs.
- **type inference** — the compiler working out a `val` or `var`'s type
  from the value used to initialize it, without you writing the type
  down. It exists so that types stay real and enforced (see "type",
  above) without every declaration needing a redundant type annotation
  when the initializing value already makes the type obvious.
- **identifier** — the technical name for a name a programmer chooses
  for something — a `val`, a `var`, a function — as opposed to a
  keyword the language itself reserves (`fun`, `val`, `var`). The term
  exists to separate "a name the compiler already knows the meaning of"
  from "a name you just invented," since the two look identical on the
  page but mean completely different things to the compiler.
- **type annotation (`:`)** — a colon followed by a type name, written
  directly after a `val`/`var`'s identifier, stating that name's type
  explicitly rather than leaving it to be worked out from the
  initializing value. It exists as the manual alternative to type
  inference (above): the same fact (a name's type), stated by the
  programmer instead of determined by the compiler.
- **`=` (initializer / assignment)** — the operator that gives a name a
  value: on a `val`/`var` declaration it's called an *initializer*
  (the value a newly-declared name starts with); on its own, targeting
  a name that already exists, it's a *reassignment*. It exists as the
  one piece of syntax connecting a name on its left to a value on its
  right — without it, a declaration like `val displayValue` would have
  a name and a type but nothing to actually hold.
- **`static`** — a Java keyword (surfacing in this lesson only inside
  real quoted output and source, never written in this lesson's own
  Kotlin code, which has no direct equivalent syntax) marking a field
  or method as belonging to the *class itself*, not to any individual
  object built from it — reachable directly by the class's name, with
  no object needing to exist first. It exists because some things
  genuinely aren't a property of any one instance: `System.out` is one
  standard-output stream shared by the whole running process, not
  something that would make sense to have a separate copy of per
  object; the JVM's entry-point `main` (this lesson's Header entry,
  above) is another — there is no "instance" of a program to call it
  on before it starts.
- **`public`** — a Java/Kotlin visibility keyword (surfacing in this
  lesson only inside quoted real source and `javap` output, never
  written by hand in this lesson's own code) marking a field, method,
  or class as callable or readable from any other code, with no
  restriction. It exists as the opposite of a *private* member (not
  used anywhere in this lesson's own quoted evidence), which would
  restrict access to code inside the same class only — every real
  signature quoted in this lesson's Header (`println`'s overloads,
  `Int.plus`, `System.out`, and `main` itself) is `public` because each
  one is specifically meant to be called from *outside* the file that
  declares it, which is exactly what this lesson's own code does with
  every one of them.
- **compiler annotation (`@kotlin.internal...`)** — a piece of metadata
  attached directly above a declaration, surfacing in this lesson only
  inside quoted real stdlib source, that tells the Kotlin compiler
  itself to treat that specific declaration specially — never something
  the declaration's own caller has to know or act on. The two that
  appear in this lesson's quoted `println` and `Int.plus` source
  (`@kotlin.internal.InlineOnly`, `@kotlin.internal.IntrinsicConstEvaluation`)
  are internal to the Kotlin compiler's own build of its standard
  library, not public API a reader would ever write themselves — they
  exist here only as part of the real, unedited source being quoted as
  evidence, and this lesson does not teach writing annotations, only
  reading past ones that happen to sit inside genuine source it quotes.
- **overload** — one of several functions that share the same name but
  accept different, specific argument types — `println(message: Int)`
  and `println(message: Boolean)`, quoted in the Header entry below,
  are two overloads of `println`. The term exists because a language
  needs some way to let one call site (`println(2)`) automatically
  reach the specific version that matches what's actually being passed,
  rather than forcing every distinct argument type to go through a
  differently-named function (`printlnInt`, `printlnBoolean`, and so
  on).

**Objects and methods used**

- **`main`**
  - *What it is:* the one specially-recognized function name a Kotlin
    program compiled as a standalone application is required to have —
    it is where the running program's very first instruction executes.
  - *Implementation:* declared in this lesson as `fun main() { }` — no
    parameters, no explicit return type. Kotlin also allows
    `fun main(args: Array<String>) { }` (command-line arguments captured
    as a parameter) but this lesson's calculator takes no command-line
    input yet, so the no-parameter form is what's used.
  - *Its use:* every real project file this lesson touches needs
    exactly one `main` function — it's the only reason `kotlinc` and
    the JVM know where a compiled Kotlin program should start running.
  - *Type:* a free (top-level, not attached to any class) function
    declaration.
  - *Responsibility:* to be the single, unambiguous starting point of
    the compiled program's execution — the JVM's launcher looks for it
    by exact name and signature, and refuses to start anything without
    it.
  - *Depends on:* nothing to be *declared* — but to actually run, it
    depends on the file it's declared in having been compiled to a
    `.class` file the JVM can load.
  - *Connects to:* nothing calls `main` from inside this lesson's own
    code — it is called by the JVM's own launcher machinery, external
    to anything written here, the moment `java -jar Calculator.jar`
    runs. Everything this lesson's program does happens because `main`
    itself, directly or indirectly, executes it.
  - *Shape:* the outermost public boundary of the whole program — the
    seam between "code you wrote" and "the JVM's own launcher," which
    is real code (part of the `java` command) but not code this
    curriculum will ever open or edit.

- **`println`**
  - *What it is:* a Kotlin standard-library function that writes text
    to the program's standard output stream (the terminal, when run
    from a terminal) and then starts a new line.
  - *Implementation:* real source, fetched this session from
    `kotlin-stdlib-sources.jar` (`jvmMain/kotlin/io/Console.kt`, package
    `kotlin.io`) — `println` is not one function but a family of
    overloads, each accepting one specific type:
    ```kotlin
    /** Prints the given [message] and the line separator to the standard output stream. */
    @kotlin.internal.InlineOnly
    public actual inline fun println(message: Any?) {
        System.out.println(message)
    }

    /** Prints the given [message] and the line separator to the standard output stream. */
    @kotlin.internal.InlineOnly
    public inline fun println(message: Int) {
        System.out.println(message)
    }

    /** Prints the given [message] and the line separator to the standard output stream. */
    @kotlin.internal.InlineOnly
    public inline fun println(message: Boolean) {
        System.out.println(message)
    }

    /** Prints the given [message] and the line separator to the standard output stream. */
    @kotlin.internal.InlineOnly
    public inline fun println(message: Double) {
        System.out.println(message)
    }
    ```
    (The real file also declares overloads for `Long`, `Byte`, `Short`,
    `Char`, `Float`, `CharArray`, and a zero-argument `println()` that
    prints only a line break — the four shown above are the ones this
    lesson's code actually calls.) The first overload is marked `actual`
    — the JVM-specific counterpart to an `expect` declaration elsewhere
    in Kotlin's multiplatform source (the same `expect`/`actual` pairing
    the Header's `Int.plus` entry, below, explains for `Int` itself) —
    meaning this exact body is the real one that runs when this lesson's
    code, compiled for the JVM, calls `println` with any type that falls
    through to this general overload. Every overload's real body is one
    line: it hands the value straight to `System.out.println`, a method
    on a pre-existing Java object (`System.out`, of type
    `java.io.PrintStream`) that represents the process's standard
    output stream — Kotlin's `println` is a thin, real, inspectable
    wrapper around ordinary Java standard output, not a special
    language feature.
  - *Its use:* this lesson's only way to make anything visible — every
    concept unit from here on proves what it proves by calling
    `println` and reading the real terminal output.
  - *Type:* a set of top-level `inline` functions (each compiles as if
    its body were pasted directly at the call site, rather than a real
    separate function call — a performance detail, not something that
    changes what the code means).
  - *Responsibility:* convert whichever single value it's given into
    text and write that text, followed by a line separator, to standard
    output — nothing more (it does not return a usable value, does not
    read input, does not format numbers specially).
  - *Depends on:* exactly one argument — the value to print — whose
    type picks which overload above actually runs; and, transitively,
    `System.out` already existing and being open for writing (true for
    the whole lifetime of a normal running program).
  - *Connects to:* called directly, by name, from inside `main` in this
    lesson's project code; internally calls `System.out.println`, part
    of the Java standard library `Calculator.kt` never has to import by
    name because `kotlin.io` (where `println` itself lives) is
    imported into every Kotlin file automatically.
  - *Shape:* a public standard-library API surface — code this lesson
    calls constantly but will never need to open or modify, the same
    way `main` is called by code this lesson doesn't own.

- **`Int.plus`**
  - *What it is:* the real function `+` calls when both sides are
    numbers — an *operator function*, meaning Kotlin lets it be written
    with the `+` symbol instead of a normal `name(argument)` call, but
    it is still a real, named, declared function underneath.
  - *Implementation:* real source, fetched this session from
    `kotlin-stdlib-sources.jar` (`commonMain/kotlin/Primitives.kt`,
    inside `Int`'s own class declaration, itself written as
    `expect class Int` — `expect` marking that only `Int`'s signatures
    are fixed in this shared file, with the real, working implementation
    supplied separately per target platform, JVM included):
    ```kotlin
    /** Adds the other value to this value. */
    @kotlin.internal.IntrinsicConstEvaluation
    public operator fun plus(other: Int): Int
    ```
    This function has **no body at all** — not because the source is
    incomplete, but because, on the JVM (the one platform this lesson's
    code ever targets), `Int` and its arithmetic operators are compiler
    intrinsics: the
    Kotlin compiler generates the actual machine-level addition
    directly, rather than compiling a real method call the way
    `println` compiles to a real call into `System.out`. This is not an
    assertion taken on faith — Concept Unit 4, below, shows the exact
    same fact a second way, using the real compiler's own error output.
    The same file declares five sibling overloads on `Int` —
    `plus(other: Byte): Int`, `plus(other: Short): Int`,
    `plus(other: Long): Long`, `plus(other: Float): Float`, and
    `plus(other: Double): Double` — one for every other numeric type
    `Int` can be added to; there is no `plus(other: Boolean)` anywhere
    in the file, which is exactly what makes `1 + true` fail to
    compile, below.
  - *Its use:* this lesson's only arithmetic — `2 + 3`, evaluated as an
    expression — resolves to a call to this exact function.
  - *Type:* an `operator fun` (instance method) declared on `Int`
    itself, with no runnable body (a compiler intrinsic).
  - *Responsibility:* given another numeric value, produce the sum,
    typed according to a fixed table (`Int + Int` stays `Int`;
    `Int + Double` widens to `Double`, and so on across its six
    overloads) — never anything outside that fixed set of input types.
  - *Depends on:* the value it's called on (the left-hand side of `+`)
    and one argument (the right-hand side) whose type must match one of
    its six declared overloads, or the compiler rejects the expression
    before the program ever runs.
  - *Connects to:* invoked wherever this lesson's code writes `+`
    between two numbers (`2 + 3` in Concept Unit 4); nothing in this
    lesson calls `plus(...)` by its ordinary function-call name — the
    `+` operator syntax is the only way it's used here.
  - *Shape:* a compiler-intrinsic seam — syntax (`+`) that looks
    identical to calling any other function, but is one of the few
    places in Kotlin where "real function, no real body" is the honest
    answer, and the lesson proves that rather than gliding past it.

**Everything else in the file, not this lesson's subject but still
explained.**

- **`System.out`**
  - *What it is:* a pre-existing Java object representing the running
    process's standard output stream — the same destination a terminal
    displays when a program run from it prints text. Every `println`
    overload quoted above forwards to it directly.
  - *Implementation:* declared in the JDK as
    `public static final PrintStream out` on `java.lang.System` — a
    `static` field (not a method: there is no `()` call involved in
    reaching it, just a name accessed directly on the `System` class),
    holding an already-constructed instance of `java.io.PrintStream`, a
    Java standard-library class whose own `println` method performs the
    real write.
  - *Its use:* this lesson's code never writes `System.out` by name —
    it exists here only because it's what `println`'s real quoted
    source, above, calls into; per this schema's own rule, anything a
    shown real implementation references has to be explained, not left
    as an unexplained name.
  - *Type:* a `public static final` field on `java.lang.System`, whose
    value is an instance of `java.io.PrintStream`.
  - *Responsibility:* represent, and provide write access to, this
    process's standard output stream for the program's entire run.
  - *Depends on:* nothing from this lesson's own code — it is
    initialized by the JVM itself before `main` (this lesson's own
    entry point, given full treatment above) ever runs.
  - *Connects to:* called by every `println` overload shown in this
    Header; itself writes bytes to whatever the operating system has
    connected as this process's standard output — a terminal, in every
    run shown in this lesson.
  - *Shape:* a boundary between the JVM/Java standard library and the
    operating system — depended on constantly in this lesson, never
    opened or edited by it, the same kind of boundary `main` forms with
    the JVM's own launcher.

---

## Concept Unit: Programs, Instructions, and the Entry Point

### The Problem

A computer's processor does not understand Kotlin, or any programming
language — it understands a small, fixed set of machine-level
operations, executed one at a time, in order. Every program you will
ever write, no matter how large, reduces to that: a sequence of
instructions, executed one after another. Before a calculator can add
two numbers, it needs to exist as a *running program* at all — which
means the JVM (the Java Virtual Machine, the program Kotlin code
actually runs on) needs a single, unambiguous place to start executing
the sequence.

Given that a source file might contain many function declarations
(this lesson's finished file will, once Lesson 0.2 adds `add`,
`subtract`, and so on), how would the JVM know *which one* to run
first, if nothing marked one of them specially? If you were designing
this yourself — before reading any further — what would you require the
programmer to write, so that "start here" is unambiguous no matter how
many other functions the file contains? Would a comment work
(`// start here`)? Why might a language designer prefer something the
*compiler* checks, rather than something a human has to read correctly
every time?

### Project Change

- **Reference Source** — no reference counterpart; this is a
  from-scratch addition. The BRD (`brd.md`, Lesson 0.1) specifies a
  "tiny Kotlin program" as the practice exercise, with no existing
  implementation to port from.
- **Files affected** — created: `Calculator.kt`, at the project's root
  (Stage 0 is plain Kotlin, no Android project structure yet — that
  arrives in Stage 1).
- **Change type** — add (brand-new file).
- **Location** — n/a; this is the first content the file has ever had.
- **Dependencies** — the Kotlin compiler (`kotlinc`) and a JVM
  (`java`), both already installed and confirmed working this session
  (`kotlinc-jvm 2.4.10`, `java 21.0.6`).

### The New Code

```kotlin
fun main() {
}
```

### The Updated Project

This is a brand-new file — step 5's code above is the *entire* file,
with nothing surrounding it yet, so there is no larger enclosing
structure to return to and re-show.

### Introduce the Concept in Isolation

This is exactly the code just shown above, typed again in a disposable
scratch file (`verification/0.1/lab1_empty_main.kt` in this
curriculum's own verification folder) purely to run it and watch what
happens with nothing else present:

```kotlin
fun main() {
}
```

Compiled and run this session:

```
$ kotlinc lab1_empty_main.kt -include-runtime -d lab1_empty_main.jar
$ java -jar lab1_empty_main.jar
```

Real output: nothing. The program produces zero lines of text, and the
process exits with code `0` (success) — confirmed this session. This
proves two things at once: first, that an empty `main` is a completely
valid, compilable program — the JVM starts it, finds no instructions
inside, and stops; second, that nothing outside `main` runs
automatically. There is exactly one instruction sequence the JVM will
execute for this file, and right now that sequence is empty. This
starting point is called the program's **entry point**.

To prove `main` really is treated specially — not just "a function that
happens to be first in the file" — this session also compiled the same
code to a raw `.class` file (skipping the `-include-runtime` jar
packaging) and inspected the real result with `javap -p`, a tool built
into the JDK that prints a compiled class's actual method signatures:

```
$ kotlinc lab1_empty_main.kt -d classes
$ javap -p classes/Step1_empty_mainKt.class
```

Real output:

```
Compiled from "step1_empty_main.kt"
public final class Step1_empty_mainKt {
  public static final void main();
  public static void main(java.lang.String[]);
}
```

This is not a description of what the compiler "probably does" — it is
the actual compiled class, inspected directly. The Kotlin compiler
takes the file name (`step1_empty_main.kt`), capitalizes its first
letter, and appends `Kt` to produce the compiled class's real name
(`Step1_empty_mainKt`); a file named `Calculator.kt` compiles to a real
class named `CalculatorKt` by the same rule (confirmed separately this
session by compiling a file with that exact name). Inside that class,
the Kotlin compiler generated **two** real `static` methods from the
single `fun main() { }` written in the source: a no-argument
`public static final void main()` (the direct translation of what was
written) and a second `public static void main(java.lang.String[])` —
the exact signature the JVM's own launcher is hard-coded to look for.
Kotlin generates this second one automatically so that a Kotlin
`fun main()` satisfies the JVM's launcher contract without the
programmer having to write the `Array<String>` parameter by hand when
no command-line arguments are needed.

### Discard the Throwaway Example

`lab1_empty_main.kt` was scratch work, kept only in this curriculum's
verification folder as a record of what was actually run this session
— it is not part of the calculator project and will not be referenced
again. What it proved — that `fun main() { }` is a real, compilable,
specially-recognized **entry point** — is what carries forward into
`Calculator.kt`.

### Mechanical Walkthrough

Every distinct syntactic element in the New Code block above, in order:

- **`fun`** — the keyword marking the start of a function declaration.
  Without it, the compiler would have no way to distinguish "a new
  function is being declared here" from other things a line of Kotlin
  could be (a variable declaration starts with `val` or `var`; a class
  starts with `class`). This is a **term**, not an object or method —
  it is language syntax, not a callable thing.
- **`main`** — the name of the function being declared. This specific
  name is not arbitrary: it is the one name the JVM's launcher searches
  for by convention, proven above by the real `javap` output showing
  both generated `main` methods. Any other name (`fun start() { }`)
  would compile without complaint but would never run automatically —
  the JVM would report it can't find a `main` method.
- **`()`** — an empty parameter list. It states, explicitly, that this
  function takes zero arguments. This particular empty parameter list
  is why the compiler generated the no-argument `main()` overload seen
  in the `javap` output above; a version written as
  `fun main(args: Array<String>) { }` would instead generate only the
  one-argument form directly, without a separate wrapper.
- **`{` `}`** — a block: a pair of braces marking the boundary of the
  function's body, the set of instructions that belong to `main`. Right
  now that set is empty, which is exactly why running the program does
  nothing — there is nothing between the braces for the JVM to execute
  after transferring control here.

### CS Lens

The idea that a program needs one designated, unambiguous starting
point — rather than execution beginning "wherever," or requiring a
human to remember which line to run first — is not specific to Kotlin
or the JVM. Also recognized in: the `main` function required by every
C and C++ program compiled to a standalone executable; the `_start`
symbol a linker looks for at the very bottom of that same chain, below
even `main`; a CPU's own reset vector, a fixed memory address the
processor jumps to the instant it powers on; an operating system's
init process (PID 1 on Linux), the first process the kernel starts and
the one every other process on the machine ultimately descends from.
Every one of these is the same idea at a different layer: a system with
many possible places execution *could* begin still needs exactly one
place it's guaranteed to *actually* begin.

### SE Lens

The alternative to a compiler-enforced, specially-named entry point
would be a convention enforced only by human discipline — a comment, a
naming pattern, documentation saying "run the function called
`start`." That alternative was not chosen, and the tradeoff is direct:
a convention a human has to remember and apply correctly, every time,
in every file, fails silently the moment someone forgets it or a
different convention gets used in a different file on the same team. A
name the *compiler* checks (as proven above — the JVM's launcher looks
for an exact method signature, and Kotlin generates it to match) fails
loudly instead: if it's missing or misspelled, nothing runs at all, and
the failure is immediate and specific ("main method not found") rather
than a silent bug that surfaces only when the wrong function was
supposed to have run and didn't. This lesson's own project is not yet
carrying any debt from this decision — a single-file program with one
`main` has no competing candidates for the role, but the tradeoff
becomes real the moment a project has multiple files, each capable of
declaring its own `main` (which Kotlin genuinely allows) — a case
Stage 1's actual Android project structure will make unavoidable, since
Android's own equivalent entry point (`onCreate`, covered when Stage 1
begins) is a different mechanism from this console entry point
entirely, for reasons that lesson will cover when it arrives.

### Commands Needed

Two commands make this unit real; both were used above and are needed
for every unit in this lesson from here on:

- **`kotlinc <file>.kt -include-runtime -d <name>.jar`** — invokes the
  Kotlin compiler (`kotlinc`) on the named source file. `-d <name>.jar`
  tells it to write its output to a file named `<name>.jar` (a Java
  Archive — a zip-format bundle of compiled `.class` files the JVM can
  run) rather than the default of a folder of loose `.class` files.
  `-include-runtime` bundles the Kotlin standard library's own compiled
  classes into that jar — without this flag, the jar would contain only
  the code this lesson wrote, and running it would fail the moment it
  used anything from Kotlin's standard library (`println` included),
  because a bare JVM has no built-in knowledge of Kotlin, only of Java.
  Success produces no output at all — a compiler that has nothing to
  complain about prints nothing, which is itself useful to recognize:
  silence means success, not "it did nothing."
- **`java -jar <name>.jar`** — invokes the JVM (`java`), telling it to
  run the program packaged inside `<name>.jar`. The JVM opens the jar,
  reads a manifest file inside it (written automatically by `kotlinc`)
  that names which class holds the real `main` method to start with,
  and calls that method — the exact mechanism `javap`, above, showed
  the compiler preparing for.

### Run It

Real output, from `Calculator.kt` at this lesson's current state
(compiled and run this session as `step1_empty_main.kt`, an identical
copy kept in the verification folder under the name the real project
file will use once Lesson 0.2 begins editing it further):

```
$ kotlinc Calculator.kt -include-runtime -d Calculator.jar
$ java -jar Calculator.jar
```

No output. The process exits with code `0`. This is expected and
correct for this exact state of the file — the next unit gives `main`
its first real instruction.

### Connect

`Calculator.kt` now exists, compiles, and runs — it just has nothing to
say yet, because its `main` function's body is still empty. The next
unit gives it its first actual instruction.

---

## Concept Unit: Producing Output — Statements and `println`

### The Problem

`main`'s body is currently empty, which is exactly why running it
produces no visible output — there is nothing between its braces to
execute. To make the calculator do anything a person could actually
see, some instruction needs to go inside those braces. Given what
Concept Unit 1 already showed — that everything between `main`'s `{`
and `}` runs, in order, when the program starts — what would you guess
is the simplest possible thing to put there, if the goal is just to get
one line of text to appear in the terminal? Kotlin's standard library
already has a function for this; based on names you may have seen in
other languages (`print`, `console.log`, `System.out.println`), what
would you guess Kotlin's version might be called?

### Project Change

- **Reference Source** — no reference counterpart; from-scratch, per
  the BRD's "Print values" practice item for this lesson.
- **Files affected** — modified: `Calculator.kt`.
- **Change type** — add (one line, inside the existing empty body from
  Concept Unit 1).
- **Location** — inside `main`'s body, between the `{` and `}` added in
  Concept Unit 1.
- **Dependencies** — none beyond what Concept Unit 1 already
  established.

### The New Code

```kotlin
println("Calculator starting up")
```

### The Updated Project

```kotlin
1: fun main() {
2:     println("Calculator starting up")  // ← new
3: }
```

`main`'s body is no longer empty: it now contains exactly one
instruction, and that instruction runs the moment the program starts —
the same guarantee Concept Unit 1 proved for an empty body applies
identically here, just with something now inside it to actually
execute.

### Introduce the Concept in Isolation

A disposable scratch file
(`verification/0.1/lab2_println_lines.kt`), calling `println` twice in
a row, to see exactly what "producing output" really does, separately
from the specific message `Calculator.kt` happens to print:

```kotlin
fun main() {
    println("first")
    println("second")
}
```

Compiled and run this session:

```
$ kotlinc lab2_println_lines.kt -include-runtime -d lab2_println_lines.jar
$ java -jar lab2_println_lines.jar
```

Real output:

```
first
second
```

This proves two things the real project code above depends on. First,
that `println` really does write its argument to the terminal — the
literal text passed in appears, unchanged. Second — and this is the
part a single call to `println` in `Calculator.kt` wouldn't reveal on
its own — that each call to `println` ends its own output with a line
break: "first" and "second" land on two separate lines, not run
together as "firstsecond", because `println`'s real source (quoted in
this lesson's Header, above) calls `System.out.println`, whose whole
job — beyond `print`'s, which exists in the same source file without
the trailing break — is exactly that trailing line separator. This
sequence of "run one instruction after another, each with its own
observable effect" is what the Header's **statement** and **program**
entries meant concretely: `println("first")` is a statement (its
effect — text on screen — is why it's there, not any value it might
hand back), and running two of them in order is a two-instruction
program.

### Discard the Throwaway Example

`lab2_println_lines.kt` is scratch, recorded only in the verification
folder, and is not part of the calculator project going forward. What
it proved — that `println` writes its argument to the terminal followed
by its own line break — is what `Calculator.kt`'s real call, above,
relies on.

### Mechanical Walkthrough

Every distinct syntactic element in the New Code block:

- **`println`** — a call to the standard-library function of the same
  name, given full treatment in this lesson's Header, above (an
  overloaded, `inline` function that hands its argument to
  `System.out.println`). This specific call passes a `String`, which
  Kotlin resolves to the `println(message: Any?)` overload shown in the
  Header — `String` is not one of the specifically-typed overloads
  (`Int`, `Boolean`, `Double`, and the others named there), so it falls
  through to the general `Any?` version, which accepts any value
  whatsoever, including `String`.
- **`(` `)`** — the call syntax: parentheses surrounding the single
  argument being passed to `println`. This is what makes it a function
  *call* rather than just the name `println` sitting on its own (which
  would be a compile error — the compiler would expect something to
  call it with).
- **`"Calculator starting up"`** — a string literal: text written
  directly in the source code, delimited by double quotes, that becomes
  a `String` value the instant the program runs this line. It is a
  **value** in the Header's sense — concrete data the program holds and
  passes to `println` — of **type** `String`, one of Kotlin's built-in
  types for holding text.

### CS Lens

Writing text to a standard output stream that a running program can
target without knowing or caring whether a human, a file, or another
program is on the other end of it is not specific to Kotlin. Also
recognized in: C's `printf` and `stdout`; Python's `print`; JavaScript's
`console.log`; every Unix shell's convention that a program's normal
output goes to file descriptor 1, separate from file descriptor 2 for
errors — the same "standard output" `System.out` (which `println`'s
real source above calls into) represents inside the JVM.

### SE Lens

`println` writes directly to the terminal, with no way to redirect,
capture, or turn it off short of not calling it — the alternative
(which real production Kotlin/Android code actually uses, and this
curriculum will reach in Stage 15's testing lessons) is a logging
framework, where each call states a severity level and a destination
can be configured separately from the code that produces the message.
That alternative is not used here on purpose: this lesson's entire
subject is the bare mechanics of a program executing and producing
output, and a logging framework would bury that under configuration
this lesson isn't ready to explain yet. The debt this incurs is real
and explicit: every `println` written in Stage 0's console calculator
will need to be reconsidered once Stage 1 moves the project onto
Android, where `println`'s output has nowhere standard to go on a
phone with no attached terminal — a problem Stage 1 addresses directly
rather than something quietly forgotten.

### Commands Needed

No new commands — the same `kotlinc ... -include-runtime -d ...` /
`java -jar ...` pair from Concept Unit 1, above, compiles and runs this
unit's code too.

### Run It

Real output, `Calculator.kt` at its current state (verified this
session as `step2_println.kt`):

```
$ kotlinc Calculator.kt -include-runtime -d Calculator.jar
$ java -jar Calculator.jar
```

Real output:

```
Calculator starting up
```

### Connect

`main` now runs one real instruction — printing a line of text — proving
Concept Unit 1's entry point actually executes what's placed inside it.
The next unit looks at what kinds of things besides plain text a
program can hold and print.

---

## Concept Unit: Values and Types

### The Problem

`"Calculator starting up"` is text. A calculator, by definition, is
going to need to hold and print *numbers* too — and, eventually, a
yes/no answer to questions like "did this division fail." Before this
curriculum can teach `+` (Lesson 0.2) or a division-by-zero check
(Stage 2), there needs to be a real, concrete answer to a more basic
question: are a piece of text, a whole number, and a yes/no answer the
*same kind of thing* to Kotlin, or genuinely different kinds? If you
tried printing `2` the same way `"Calculator starting up"` was printed
in Concept Unit 2 — with `println(2)`, no quotes — what would you
expect the terminal to show? Would it look any different from printing
`"2"`, with quotes, as text? What would have to be true about how
Kotlin treats `2` internally for those two calls to end up looking
identical, versus genuinely different?

### Project Change

- **Reference Source** — no reference counterpart; from-scratch, per
  the BRD's "Print values" practice item.
- **Files affected** — modified: `Calculator.kt`.
- **Change type** — add (three new lines).
- **Location** — inside `main`, immediately after the `println` call
  added in Concept Unit 2.
- **Dependencies** — none beyond what Concept Units 1–2 established.

### The New Code

```kotlin
println(2)
println(3.5)
println(true)
```

### The Updated Project

```kotlin
1: fun main() {
2:     println("Calculator starting up")
3:     println(2)      // ← new
4:     println(3.5)    // ← new
5:     println(true)   // ← new
6: }
```

`main`'s body now runs four statements in sequence: the text line from
Concept Unit 2, then three more calls to the same `println` function —
each with a value of a different kind.

### Introduce the Concept in Isolation

A disposable scratch file (`verification/0.1/lab3_distinct_literals.kt`),
using different literal values than the real project code above, to
confirm this is a general fact about `println` and literals — not
something specific to the exact numbers `2`, `3.5`, and `true`
happening to work out:

```kotlin
fun main() {
    println(7)
    println(1.5)
    println(false)
    println("scratch")
}
```

Compiled and run this session:

```
$ kotlinc lab3_distinct_literals.kt -include-runtime -d lab3_distinct_literals.jar
$ java -jar lab3_distinct_literals.jar
```

Real output:

```
7
1.5
false
scratch
```

Each value printed in exactly its own natural written form — no quotes
appear around `scratch` even though it's text, and `false` prints as
the word `false`, not as `0` or `1` the way some languages would show a
yes/no answer. This is the concrete proof behind the Header's
**value**/**type** entries: `7`, `1.5`, `false`, and `"scratch"` are
four **values**, and each one carries a **type** — a category
determining both what its data actually is and how `println` (via the
specific overload the Header's real source showed being selected for
each: `println(Int)`, `println(Double)`, `println(Boolean)`, and the
general `println(Any?)` for `String`) knows how to turn it into text.
`7` is Kotlin's `Int` type (a whole number); `1.5` is `Double` (a
number with a fractional part); `false` is `Boolean` (exactly one of
two possible values, `true` or `false`); `"scratch"`, delimited by
quotes, is `String` (text). Nothing was written anywhere in this file
declaring these types by name — the next concept unit shows exactly how
the compiler still knows them regardless.

### Discard the Throwaway Example

`lab3_distinct_literals.kt` is scratch, recorded in the verification
folder, not part of the calculator project going forward.
`Calculator.kt`'s own three new lines, above, are the values that
matter from here on.

### Mechanical Walkthrough

Every distinct syntactic element across the three new lines:

- **`println(2)`** — the same `println` function from Concept Unit 2's
  Header entry, called again here with a different argument. Per the
  Repetition Rule, this reappearance gets full treatment exactly like
  its first use: it is still the overloaded, `inline`,
  `System.out.println`-delegating function documented in this lesson's
  Header. This specific call's argument, `2`, is an `Int` literal — so
  Kotlin resolves this particular call to the `println(message: Int)`
  overload quoted in the Header, not the general `Any?` one Concept
  Unit 2's `String` argument resolved to. `println` itself does not
  change; which of its several real, separately-declared overloads gets
  called depends entirely on the type of whatever is passed in.
- **`2`** — an `Int` literal: a whole number written directly in
  source. `Int` is Kotlin's type for whole numbers; it exists as a
  distinct type from `Double` (below) because whole-number arithmetic
  and fractional arithmetic are genuinely different operations at the
  processor level, and keeping them as separate types is what lets the
  compiler catch, before the program runs, an attempt to use one where
  the other was actually needed.
- **`println(3.5)`** — the same overloaded, `inline`,
  `System.out.println`-delegating standard-library function given full
  treatment in this lesson's Header, reappearing a second time in this
  unit's own code. `3.5` is a `Double` literal, so Kotlin resolves this
  particular call to the `println(message: Double)` overload quoted in
  the Header — a different real function from the `println(message:
  Int)` overload the line above resolved to, even though both are
  written as "`println(...)`" in the source.
- **`3.5`** — a `Double` literal: a number written with a decimal
  point, Kotlin's type for numbers that may have a fractional part.
- **`println(true)`** — the same overloaded, `inline`,
  `System.out.println`-delegating function, reappearing a third time.
  `true` is a `Boolean` literal, resolving this call to the
  `println(message: Boolean)` overload quoted in the Header — a third
  distinct real overload, selected the same way as the two calls above
  it, purely by the type of the one argument each call passes.
- **`true`** — a `Boolean` literal: one of exactly two possible values
  (`true` or `false`) that a program can hold — used for yes/no,
  on/off, valid/invalid questions. `Boolean` is its own type, distinct
  from `Int`, because "is this true or false" and "what number is
  this" are different questions with different valid operations —
  numbers can be added; `true` and `false` cannot.

### CS Lens

Categorizing every value into a fixed set of types, and having the
language enforce which operations are valid for each type, is not a
Kotlin-specific idea. Also recognized in: SQL columns, each declared
`INTEGER`, `TEXT`, or `BOOLEAN` and rejecting rows that don't match;
JSON's own value kinds (`number`, `string`, `boolean`, `null`, `object`,
`array`) that every JSON parser has to distinguish on the way in; a
spreadsheet cell's format (currency vs. plain number vs. text) changing
how the exact same typed digits are displayed and what operations
("sum this column") are even offered; a physical measuring instrument's
units (a thermometer reads in degrees, not in generic "numbers") making
some comparisons ("is 5 degrees greater than 5 kilograms") meaningless
by construction rather than merely wrong.

### SE Lens

The alternative to a type system that checks these categories before
the program runs is a language that just treats everything as
interchangeable data and only discovers a mismatch when the running
program actually hits it — a runtime error, potentially deep inside
logic a user is actively relying on, instead of a compiler refusing to
build the program at all. That alternative was not chosen for Kotlin:
Concept Unit 4, next, proves directly that Kotlin catches a type
mismatch before the program ever runs, and states the real cost of the
alternative honestly — a language that defers this check to runtime
trades an earlier, cheaper-to-fix compile error for a später, more
expensive one that might not surface until a specific code path
actually executes in front of a real user.

### Commands Needed

No new commands — the same `kotlinc ... -include-runtime -d ...` /
`java -jar ...` pair from Concept Unit 1 was used again here.

### Run It

Real output, `Calculator.kt` at its current state (verified this
session as `step3_values_types.kt`):

```
$ kotlinc Calculator.kt -include-runtime -d Calculator.jar
$ java -jar Calculator.jar
```

Real output:

```
Calculator starting up
2
3.5
true
```

### Connect

Four values of three different types (`String`, `Int`, `Double`,
`Boolean`) now print correctly, each through the specific `println`
overload its own type resolves to. The next unit shows what happens
when two values are *combined* rather than just printed individually —
and uses that combination to prove type-checking is a real, enforced
compiler behavior, not just a labeling scheme.

---

## Concept Unit: Expressions

### The Problem

Every value shown so far has been a single literal, printed as-is.
A calculator's entire purpose is combining values — `2` and `3` need to
become `5`. Given that `println` only ever takes one argument (proven
by every call so far), how could `2` and `3` be combined into a single
value *before* `println` ever sees them? Kotlin, like most languages,
uses `+` for addition, written between two numbers the way arithmetic
is normally written by hand (`2 + 3`, not `plus(2, 3)`). If `println`
were called as `println(2 + 3)`, what would you expect the terminal to
show — the text `2 + 3`, or a single number? What would have to happen
to `2 + 3` *before* `println` runs, for either answer to make sense?

### Project Change

- **Reference Source** — no reference counterpart; from-scratch, the
  first arithmetic in the project, laying groundwork the BRD's Lesson
  0.2 (`add()`, `subtract()`, `multiply()`, `divide()`) builds on
  directly.
- **Files affected** — modified: `Calculator.kt`.
- **Change type** — add (one new line).
- **Location** — inside `main`, immediately after the three `println`
  calls added in Concept Unit 3.
- **Dependencies** — none beyond what Concept Units 1–3 established.

### The New Code

```kotlin
println(2 + 3)
```

### The Updated Project

```kotlin
1: fun main() {
2:     println("Calculator starting up")
3:     println(2)
4:     println(3.5)
5:     println(true)
6:     println(2 + 3)  // ← new
7: }
```

`main` now runs five statements; the fifth is the first one whose
argument is not a bare literal but a small computation.

### Introduce the Concept in Isolation

Two small scratch files this time, because proving "an expression
produces a real value" needs a success case and proving "type-checking
is real, not just a label" needs a genuine failure — both kept in the
verification folder.

First, `verification/0.1/lab4_expression_value.kt`, checking whether
`2 + 3`'s value exists even when nothing consumes it:

```kotlin
fun main() {
    println(2 + 3)
    2 + 3
}
```

Compiled and run this session:

```
$ kotlinc lab4_expression_value.kt -include-runtime -d lab4_expression_value.jar
$ java -jar lab4_expression_value.jar
```

Real output:

```
5
```

Two things confirmed here. First, `println(2 + 3)` printed `5`, not the
text `2 + 3` — proving `2 + 3` is evaluated to a single value *before*
`println` ever receives it; `println` never sees the `+` at all, only
its result. This is exactly the Header's **expression** entry made
concrete: `2 + 3` is a piece of code that evaluates to a value, and
that value — not the code that produced it — is what gets passed
onward. Second, the bare line `2 + 3` on its own, with nothing done
with the result, compiled and ran with **no error and no warning at
all** (confirmed by the empty compiler output this session) — proving
that an expression's defining trait is that it *produces* a value, full
stop, whether or not anything goes on to use that value. Compare this
to `println("Calculator starting up")` from Concept Unit 2: that line
is a **statement** — you run it entirely for what it *does* (text
appearing), and it hands nothing back that the rest of the program
could use even if it wanted to.

Second, `verification/0.1/lab4_type_mismatch.kt`, testing whether `+`
actually enforces the types Concept Unit 3 introduced, or just prints
whatever it's given:

```kotlin
fun main() {
    println(1 + true)
}
```

Compiled this session (deliberately, to observe the failure):

```
$ kotlinc lab4_type_mismatch.kt -include-runtime -d lab4_type_mismatch.jar
```

Real compiler output — this file was never run, because it never
successfully compiled:

```
lab4_type_mismatch.kt:2:15: error: none of the following candidates is applicable:

fun plus(other: Int): Int:
  Argument type mismatch: actual type is 'Boolean', but 'Int' was expected.

fun plus(other: Byte): Int:
  Argument type mismatch: actual type is 'Boolean', but 'Byte' was expected.

fun plus(other: Short): Int:
  Argument type mismatch: actual type is 'Boolean', but 'Short' was expected.

fun plus(other: Long): Long:
  Argument type mismatch: actual type is 'Boolean', but 'Long' was expected.

fun plus(other: Float): Float:
  Argument type mismatch: actual type is 'Boolean', but 'Float' was expected.

fun plus(other: Double): Double:
  Argument type mismatch: actual type is 'Boolean', but 'Double' was expected.
    println(1 + true)
              ^
```

This is a real compiler rejection, not a runtime crash — the program
never ran at all; `kotlinc` refused to produce a jar. This is the
Header's **`Int.plus`** entry proven directly: `+` between `1` and
`true` resolves to `Int.plus`, and the compiler lists *every one of its
six real overloads* — exactly the six shown in this lesson's Header,
quoted from the real stdlib source (`Byte`, `Short`, `Int`, `Long`,
`Float`, `Double`) — and reports that `true`, a `Boolean`, matches none
of them. This is the concrete proof, promised in the Header, that
`Int`'s arithmetic operators are a fixed, checked set: there is no
`plus(other: Boolean)` anywhere in the real source, so the compiler has
no candidate to fall back on, and it says so specifically rather than
guessing or converting `true` into a number the way some languages
would.

### Discard the Throwaway Examples

Both `lab4_expression_value.kt` and `lab4_type_mismatch.kt` are
scratch, recorded in the verification folder, not part of the
calculator project. What they proved — that an expression always
produces a value, and that `+`'s type-checking is real and enforced —
is what `Calculator.kt`'s own `println(2 + 3)`, above, relies on
succeeding.

### Mechanical Walkthrough

Every distinct syntactic element in the New Code block:

- **`println(2 + 3)`** — the same overloaded, `inline`,
  `System.out.println`-delegating standard-library function given full
  treatment in this lesson's Header, reappearing a fourth time. The
  argument here is not a bare literal but the expression `2 + 3`;
  because that expression evaluates to an `Int` (shown next), this call
  resolves to the same `println(message: Int)` overload a bare `Int`
  literal would.
- **`2`** — a whole-number `Int` literal, Kotlin's type for numbers
  with no fractional part, distinct from `Double` because the processor
  performs whole-number and fractional arithmetic differently underneath.
- **`+`** — operator syntax calling `Int.plus`, the real, declared
  (though bodyless — a compiler intrinsic) instance method on `Int`
  given full treatment in this lesson's Header, including its real
  six-overload source (`Byte`, `Short`, `Int`, `Long`, `Float`,
  `Double`) fetched from the actual stdlib this session. Writing `2 + 3`
  is Kotlin syntax for calling `plus` *on* the value `2` *with* the
  value `3` as its one argument.
- **`3`** — a second whole-number `Int` literal, the same type as `2`
  above, passed as `plus`'s one argument. Evaluating `2 + 3` calls
  `2.plus(3)`, which — per the Header's real quoted signature
  `public operator fun plus(other: Int): Int` — returns the `Int` value
  `5`, confirmed by the real run below.

### CS Lens

Every expression evaluating down to exactly one value before that value
is used anywhere else — rather than the raw *code* somehow being passed
around — is a foundational idea, not a Kotlin-specific one. Also
recognized in: arithmetic itself, taught long before any programming
language existed (`2 + 3` means "the number 5," not "the instruction
add 2 and 3"); a spreadsheet cell showing `5`, not the formula `=2+3`,
once it's calculated; a calculator's own display, showing a result, not
a record of the buttons pressed; every compiler's expression evaluator,
which is exactly the piece of `kotlinc` that decided `2 + 3` becomes
`5` before `println` ever runs.

### SE Lens

Kotlin checks the types on either side of `+` at compile time, before
the program runs, and reports every rejected candidate overload by name
(as the real error above shows) rather than either silently converting
`true` into a number (which some languages do — treating `true` as `1`)
or waiting until the program actually executes this line to fail. The
alternative — implicit conversion between types — was not chosen for
Kotlin, and the tradeoff is concrete: implicit conversion makes some
code shorter to write, but it also means a typo (writing a `Boolean`
where an `Int` was meant) silently becomes a different, often wrong,
number instead of an error a person actually sees. Kotlin's choice
costs a small amount of typing discipline now (get the types right, or
the compiler stops you) in exchange for eliminating an entire category
of silent, hard-to-trace bugs from ever compiling in the first place —
a tradeoff this curriculum will keep encountering as it accumulates
software-engineering judgment beyond just Kotlin syntax.

### Commands Needed

No new commands — the same compile/run pair, applied a fourth time; the
type-mismatch lab additionally demonstrates that a failed `kotlinc`
compile simply stops, with nothing to run afterward.

### Run It

Real output, `Calculator.kt` at its current state (verified this
session as `step4_expression.kt`):

```
$ kotlinc Calculator.kt -include-runtime -d Calculator.jar
$ java -jar Calculator.jar
```

Real output:

```
Calculator starting up
2
3.5
true
5
```

### Connect

`Calculator.kt` now computes a value, not just prints literals — `5`
came from a real `+` expression, type-checked by the compiler before
the program ever ran. Right now that `5` only exists for the instant
`println` is called with it; the next unit gives a computed value a
name, so it can be reused instead of recomputed.

---

## Concept Unit: Naming a Value — `val` and Explicit Types

### The Problem

`2 + 3`'s result, `5`, exists only for the instant `println` runs — if
the calculator needed that value again three lines later, `2 + 3` would
have to be written out again. A real calculator needs to hold onto a
result: compute it once, give it a name, and reuse that name. Before
seeing how, consider: once a value has a name, should that name be
allowed to later point at a *different* value, or should it be locked
to the one value it started with? Are there cases in a calculator where
you'd want a named result to never change once computed? Are there
cases (a running total, perhaps) where you'd want the opposite?

### Project Change

- **Reference Source** — no reference counterpart; from-scratch, per
  the BRD's "Print values" practice item extended to a stored result.
- **Files affected** — modified: `Calculator.kt`.
- **Change type** — replace (the bare `println(2 + 3)` from Concept
  Unit 4 becomes two lines: a named declaration, then a print of that
  name).
- **Location** — replacing the line added in Concept Unit 4, inside
  `main`.
- **Dependencies** — none beyond what Concept Units 1–4 established.

### The New Code

```kotlin
val displayValue: Int = 2 + 3
println(displayValue)
```

### The Updated Project

```kotlin
1: fun main() {
2:     println("Calculator starting up")
3:     println(2)
4:     println(3.5)
5:     println(true)
6:     val displayValue: Int = 2 + 3  // ← new (replaces `println(2 + 3)`)
7:     println(displayValue)          // ← new
8: }
```

`main` now names its computed result before printing it, rather than
printing the raw expression directly.

### Introduce the Concept in Isolation

A disposable scratch file (`verification/0.1/lab5_val_reassign.kt`),
deliberately trying to change a `val` after declaring it, to check
whether "immutable" is a real, enforced guarantee or just a naming
convention:

```kotlin
fun main() {
    val displayValue: Int = 2 + 3
    displayValue = 10
    println(displayValue)
}
```

Compiled this session (deliberately, to observe the failure):

```
$ kotlinc lab5_val_reassign.kt -include-runtime -d lab5_val_reassign.jar
```

Real compiler output — this file was never run:

```
lab5_val_reassign.kt:3:5: error: 'val' cannot be reassigned.
    displayValue = 10
    ^^^^^^^^^^^^
```

This proves `val` is called an **immutable binding** for a concrete,
enforced reason, not just as a label: the compiler refuses to build the
program at all the moment a second assignment to a `val` name appears,
pointing at the exact line and the exact name involved. This is the
same category of protection Concept Unit 4 proved for types (a wrong
type is rejected before the program runs) applied to a different
question — not "is this the right kind of value," but "is this name
even allowed to be given a new value at all."

### Discard the Throwaway Example

`lab5_val_reassign.kt` is scratch, recorded in the verification folder,
not part of the calculator project. What it proved — that `val` is
enforced, not just conventional — is why `Calculator.kt`'s own
`displayValue`, above, is safe to treat as fixed for the rest of this
lesson.

### Mechanical Walkthrough

Every distinct syntactic element in the New Code block:

- **`val`** — the keyword declaring an immutable binding, given full
  treatment in this lesson's Header. Its use here — naming the result
  of `2 + 3` — is exactly the case the Header describes: a name whose
  value should never change after this line, which the lab above just
  proved is a real, compiler-enforced guarantee, not merely a style
  choice.
- **`displayValue`** — an identifier: the name being attached to the
  value `2 + 3` produces. This particular name was chosen (rather than,
  say, `x`) because it describes what the value represents in this
  program — the number about to be shown to whoever is using the
  calculator — a naming habit this curriculum will keep reinforcing as
  programs grow past a handful of lines.
- **`: Int`** — a type annotation: a colon followed by a type name,
  stating `displayValue`'s type explicitly rather than leaving it to be
  worked out from the initializing value. `Int` here is the same
  whole-number type already used for the literals `2`, `7`, and `2` and
  `3` inside `2 + 3` — reappearing now not as a literal's own type but
  as a declared name's type. Writing `: Int` states, explicitly, "this
  name will only ever hold an `Int`" — and because `2 + 3` evaluates to
  an `Int` (via `Int.plus(other: Int): Int`, the Header's real quoted
  signature), this annotation matches what the right-hand side actually
  produces; had `2 + 3` been written as `2.0 + 3` instead (evaluating to
  a `Double`, per `Int.plus`'s sibling overload for `Double` shown in
  the Header), this same `: Int` annotation would fail to compile with
  a type-mismatch error in the same family the real `1 + true` error
  above already showed.
- **`=`** — the initializer operator: it assigns the value on its right
  (the result of evaluating `2 + 3`) to the name being declared on its
  left, at the moment `val displayValue: Int = 2 + 3` runs. This is the
  one and only time this particular `=` executes for this name — proven
  by the lab above, where a *second* `=` targeting the same name was
  rejected outright.
- **`println(displayValue)`** — the same overloaded, `inline`,
  `System.out.println`-delegating standard-library function given full
  treatment in this lesson's Header, reappearing a fifth time. The
  argument this time is not a literal or a fresh expression but a named
  value — `displayValue` — which, because it holds an `Int`, resolves
  this call to the same `println(message: Int)` overload the earlier
  `println(2)` call resolved to.

### CS Lens

Attaching a name to a value so it can be referenced again without
recomputing or retyping it is one of the most basic ideas in all of
programming. Also recognized in: algebra's own use of a letter (`let x
= 5`) to stand in for a value across several subsequent lines of
reasoning; a spreadsheet's named cell or range, letting a formula refer
to `TaxRate` instead of `$B$2`; a database column alias in a SQL query;
a `const` declaration in nearly every other mainstream language
(JavaScript's `const`, Java's `final`), each solving the exact same
problem Kotlin's `val` solves here.

### SE Lens

Kotlin chose to make immutable binding (`val`) the *shorter*, more
convenient keyword to type, with mutability (`var`, covered in the next
unit) requiring the same three letters but a genuinely separate,
deliberate choice — rather than making plain assignment mutable by
default the way many older languages do. The alternative not chosen —
everything mutable unless specially marked otherwise — trades a small
amount of upfront ceremony (deciding `val` vs. `var` for every name) for
eliminating an entire class of bugs where a value quietly changes
somewhere unexpected in a large program, because nothing prevented it.
This lesson's calculator is far too small to feel that cost yet — but
Stage 4's architecture lessons, once state has to be shared across
multiple screens, will make the value of that guarantee concrete rather
than theoretical.

### Commands Needed

No new commands — the same compile/run pair as every prior unit.

### Run It

Real output, `Calculator.kt` at its current state (verified this
session as `step5_val.kt`):

```
$ kotlinc Calculator.kt -include-runtime -d Calculator.jar
$ java -jar Calculator.jar
```

Real output:

```
Calculator starting up
2
3.5
true
5
```

Identical output to Concept Unit 4's run — `displayValue` now holds the
same `5` that used to be printed directly, proving that naming a value
changes nothing about the program's observable behavior, only how the
code refers to it.

### Connect

`5` now has a name, `displayValue`, that cannot be reassigned — proven
by the lab's real compiler rejection. The next unit asks whether that
name's type — written explicitly here as `: Int` — actually needed to
be written down at all.

---

## Concept Unit: Type Inference

### The Problem

`val displayValue: Int = 2 + 3` states the type twice, in a sense: once
explicitly (`: Int`) and once implicitly, in what `2 + 3` actually
evaluates to. Concept Unit 4 already established that `Int.plus(Int)`
returns `Int` — so the compiler, in order to type-check this line at
all (the same type-checking Concept Unit 4 proved is real, using
`1 + true`), must already know `2 + 3` produces an `Int`, independent
of whatever comes after the `=` sign. Given that, is the `: Int`
annotation actually telling the compiler something it wouldn't
otherwise know? What would you expect to happen if `: Int` were simply
deleted, leaving `val displayValue = 2 + 3`?

### Project Change

- **Reference Source** — no reference counterpart; from-scratch.
- **Files affected** — modified: `Calculator.kt`.
- **Change type** — refactor (removing the explicit type annotation
  added in Concept Unit 5; behavior is unchanged).
- **Location** — the `val displayValue: Int = 2 + 3` line added in
  Concept Unit 5.
- **Dependencies** — none beyond what Concept Unit 5 established.

### The New Code

```kotlin
val displayValue = 2 + 3
```

### The Updated Project

```kotlin
1: fun main() {
2:     println("Calculator starting up")
3:     println(2)
4:     println(3.5)
5:     println(true)
6:     val displayValue = 2 + 3       // ← changed: `: Int` removed
7:     println(displayValue)
8: }
```

Only line 6 changed; everything else, including line 7's `println`
call, is identical to Concept Unit 5's state.

### Introduce the Concept in Isolation

A disposable scratch file (`verification/0.1/lab6_inference_mismatch.kt`),
checking whether the compiler still enforces a specific type on
`displayValue`-like name even with no annotation ever written — by
trying to use the inferred value where a different, incompatible type
is required:

```kotlin
fun main() {
    val count = 5
    val label: String = count
    println(label)
}
```

Compiled this session (deliberately, to observe the failure):

```
$ kotlinc lab6_inference_mismatch.kt -include-runtime -d lab6_inference_mismatch.jar
```

Real compiler output — this file was never run:

```
lab6_inference_mismatch.kt:3:23: error: initializer type mismatch: expected 'String', actual 'Int'.
    val label: String = count
                      ^
```

This is direct, verified proof that **type inference** is real: `count`
was declared with no type annotation at all (`val count = 5`), yet the
compiler's own error message states, explicitly, `actual 'Int'` — the
compiler determined, on its own, from the literal `5` alone, that
`count` is an `Int`, and it enforces that determination exactly as
strictly as the explicit `: Int` annotation was enforced back in
Concept Unit 4's `1 + true` error. Nothing about omitting the
annotation made the type any less real or any less checked — it only
changed who wrote the type down: the programmer, or the compiler,
working it out from the initializing expression on the right of `=`.

### Discard the Throwaway Example

`lab6_inference_mismatch.kt` is scratch, recorded in the verification
folder, not part of the calculator project. What it proved — that an
inferred type is exactly as real and enforced as a written one — is why
removing `: Int` from `Calculator.kt`'s own `displayValue`, above, is
safe.

### Mechanical Walkthrough

Every distinct syntactic element in the New Code block, compared
against Concept Unit 5's version:

- **`val`** — the same immutable-binding keyword given full treatment
  in this lesson's Header: it declares a name whose value the compiler
  will refuse to let be reassigned after this line, proven for real by
  the earlier `'val' cannot be reassigned` error above.
- **`displayValue`** — the same identifier (a programmer-chosen name,
  as opposed to a reserved keyword) still naming the value `2 + 3`
  produces — unchanged in spelling and meaning from its prior
  appearance, only its declaration's type annotation is different here.
- **(absence of `: Int`)** — there is no longer a written type
  annotation at all. This is the one actual change from Concept Unit 5,
  and it is precisely what makes this **type inference**: the compiler
  looks at the expression on the right of `=` (`2 + 3`), determines —
  using the exact same `Int.plus(Int): Int` resolution the Header
  documents and Concept Unit 4 exercised — that the result is an `Int`,
  and silently attaches type `Int` to `displayValue` exactly as if `:
  Int` had been typed by hand. The lab above proves this attachment is
  not weaker or "less official" than an explicit one: it produces the
  identical class of compiler error when violated.
- **`= 2 + 3`** — the same `=` initializer operator given full
  treatment in this lesson's Header, assigning the value the expression
  `2 + 3` produces to the name on its left; `2 + 3` itself still
  resolves through the real, bodyless `Int.plus(other: Int): Int`
  intrinsic quoted in the Header, still producing the `Int` value `5`.

### CS Lens

A compiler determining a value's type from context, rather than
requiring every single declaration to spell it out, is a mainstream
idea well beyond Kotlin. Also recognized in: C++'s `auto`, doing
exactly this for a local variable; TypeScript inferring a variable's
type from its initializer while still enforcing it afterward; Python's
own dynamic typing carrying a looser cousin of the same idea (a name's
type is whatever its current value's type is, tracked at runtime rather
than compile time); even natural language, where "she picked up the
book" doesn't need "book" annotated as a physical object for a listener
to correctly infer what kind of thing is being discussed, from context
alone.

### SE Lens

Kotlin's design lets a programmer choose, line by line, between writing
`: Int` explicitly (Concept Unit 5's version) and leaving it out
(this unit's version) — it did not force either one universally. The
real tradeoff: an explicit annotation costs a few extra characters but
documents intent directly in the code, useful when the initializing
expression is complex enough that its resulting type isn't obvious at
a glance; inference costs nothing to type but asks a reader to work out
the type themselves by reading the initializer, which is easy for
`2 + 3` and much harder for a long chain of function calls several
lessons from now. This curriculum will default to inference where the
type is obvious (as it is here) and switch to explicit annotations the
moment that stops being true — a judgment call this lesson is
establishing now, in the simplest possible case, precisely so later
lessons can apply it without re-deriving the reasoning each time.

### Commands Needed

No new commands.

### Run It

Real output, `Calculator.kt` at its current state (verified this
session as `step6_inference.kt`):

```
$ kotlinc Calculator.kt -include-runtime -d Calculator.jar
$ java -jar Calculator.jar
```

Real output:

```
Calculator starting up
2
3.5
true
5
```

Identical to Concept Unit 5's output — proving, a second way, that
removing the explicit `: Int` changed nothing about what the program
actually does, only how its type got determined.

### Connect

`displayValue` still holds `5`, still cannot be reassigned, and its
`Int` type is now determined by the compiler rather than written by
hand — proven, in the lab above, to be just as real either way. The
last unit in this lesson asks what happens when a name genuinely does
need to change after it's declared.

---

## Concept Unit: Changing a Value — `var` and Reassignment

### The Problem

`displayValue` currently holds `5`, permanently — Concept Unit 5 proved
directly that trying to change it is a compile error. A calculator, in
its finished form, will need running totals that genuinely do change —
press `+`, then a number, and the display's value updates. Given
everything shown so far about `val`'s enforced immutability, what would
need to be different about a declaration for reassignment to actually
be allowed? Is there a reason Kotlin might want that to require a
*different* keyword, spelled out explicitly, rather than just relaxing
`val`'s own rule?

### Project Change

- **Reference Source** — no reference counterpart; from-scratch, per
  the BRD's "Change variables" practice item.
- **Files affected** — modified: `Calculator.kt`.
- **Change type** — replace (`val` becomes `var`) and add (a
  reassignment line and a second print).
- **Location** — the `val displayValue = 2 + 3` line from Concept Unit
  6, plus two new lines immediately after the existing `println(displayValue)`.
- **Dependencies** — none beyond what Concept Unit 6 established.

### The New Code

Two small edits, typed at two different spots in the existing file: the
existing declaration's `val` becomes `var`,

```kotlin
var displayValue = 2 + 3
```

and two new lines are added after the existing `println(displayValue)`:

```kotlin
displayValue = 10
println(displayValue)
```

### The Updated Project

```kotlin
1: fun main() {
2:     println("Calculator starting up")
3:     println(2)
4:     println(3.5)
5:     println(true)
6:     var displayValue = 2 + 3   // ← changed: `val` → `var`
7:     println(displayValue)
8:     displayValue = 10          // ← new
9:     println(displayValue)      // ← new
10: }
```

`main` now runs nine statements: the same six as Concept Unit 6, plus a
reassignment of `displayValue` and a second print showing the new
value.

### Introduce the Concept in Isolation

A disposable scratch file (`verification/0.1/lab7_var_reassign.kt`),
checking, directly, whether reassigning a `var` behaves the way
Concept Unit 5's failed `val` reassignment suggested it should:

```kotlin
fun main() {
    var total = 2 + 3
    println(total)
    total = 10
    println(total)
}
```

Compiled and run this session:

```
$ kotlinc lab7_var_reassign.kt -include-runtime -d lab7_var_reassign.jar
$ java -jar lab7_var_reassign.jar
```

Real output:

```
5
10
```

Where Concept Unit 5's `val` version of this exact pattern was rejected
by the compiler before the program ever ran, this `var` version
compiles and runs cleanly, printing `5` first (the original value) and
then `10` (the value after `total = 10` executed). This is direct proof
of a **mutable binding**: the same name, `total`, held two different
values at two different points during the same run of the same
program — first whatever `2 + 3` evaluated to, then whatever `10`
evaluated to — because `var`, unlike `val`, does not forbid a second
`=` targeting the same name.

### Discard the Throwaway Example

`lab7_var_reassign.kt` is scratch, recorded in the verification folder,
not part of the calculator project. What it proved — that `var`
genuinely allows reassignment where `val` genuinely forbids it — is
what `Calculator.kt`'s own `displayValue`, above, now relies on.

### Mechanical Walkthrough

Every distinct syntactic element in the New Code block:

- **`var`** — the keyword declaring a mutable binding: a name whose
  value *can* later be pointed at a different value via a second `=`,
  the direct opposite of `val`'s enforced immutability. Replacing the
  earlier `val` with `var` here is the one change that makes the
  reassignment two lines below legal — proven directly by contrast with
  the real `'val' cannot be reassigned` compiler rejection of this same
  pattern shown earlier in this lesson.
- **`displayValue`** — the same identifier, still naming the value
  `2 + 3` produces, now declared mutable instead of immutable; still an
  `Int`, still inferred from `2 + 3` the same way inference was shown to
  work earlier — `var` changes only whether the name can be reassigned,
  nothing about how its type is determined.
- **`= 2 + 3`** — the same `=` initializer operator, assigning the
  value the expression `2 + 3` produces (via the real, bodyless
  `Int.plus(other: Int): Int` intrinsic quoted in the Header) to the
  name on its left.
- **`displayValue = 10`** — a reassignment: the same `=` operator used
  for the original declaration, but this time with no `val`/`var`
  keyword in front of it, because `displayValue` already exists — this
  line does not create a new name, it changes what the existing name
  `displayValue` refers to. `10` is a fresh whole-number `Int` literal,
  the same type as every other numeric literal in this lesson.
- **`println(displayValue)`** (second occurrence) — the same
  overloaded, `inline`, `System.out.println`-delegating standard-library
  function given full treatment in this lesson's Header, called a sixth
  time. Because this call happens *after* the reassignment on the line
  above, `displayValue` now refers to `10`, not `5` — this is what a
  **statement** running as one instruction among several, in sequence,
  concretely means: which value this specific call sees depends
  entirely on what already ran before it, in order.

### CS Lens

A name whose associated value can change over the lifetime of a running
program — as opposed to a name that is fixed forever once declared — is
foundational to how most programs represent anything that changes over
time. Also recognized in: a thermostat's current-temperature reading,
updated continuously as sensors report new values under the same
"current temperature" label; a bank account balance, the same account
number referring to a different number after every transaction; a game
character's health point total, decremented by damage under the same
name across the whole match; a spreadsheet cell containing `=A1+1`,
recalculating to a new value every time `A1` itself changes, while
still being "the same cell."

### SE Lens

Kotlin requires `var` to be written explicitly, as a deliberate choice
distinct from `val`, rather than making every declared name mutable by
default and offering `val` as an opt-in restriction. The tradeoff: a
reader scanning unfamiliar code can tell, from the declaration alone
and without reading any further, whether a given name is ever going to
change — `val` is a promise the compiler itself enforces (proven in
Concept Unit 5), so "could this value have changed by the time I'm
reading it" never has to be answered by re-reading every line between
declaration and use. The cost is exactly what this unit's Project
Change paid: turning a `val` into a `var` requires a real edit, not
just writing `= 10` and hoping — a small amount of friction, deliberately,
in exchange for that stronger guarantee everywhere `val` is chosen
instead. This is the same design tradeoff Concept Unit 5's SE Lens
already named for `val` on its own; this unit is the concrete case
where the *other* side of that tradeoff — needing mutability, and
having to ask for it explicitly — is the one actually paid.

### Commands Needed

No new commands.

### Run It

Real output, `Calculator.kt`'s complete, final state for this lesson
(verified this session as `step7_var.kt`):

```
$ kotlinc Calculator.kt -include-runtime -d Calculator.jar
$ java -jar Calculator.jar
```

Real output:

```
Calculator starting up
2
3.5
true
5
10
```

### Connect

`displayValue` now genuinely changes during a single run of the
program — `5`, then `10` — proven against Concept Unit 5's contrasting
failure under `val`. This is the last new concept this lesson
introduces.

---

## Connect the Pieces

Follow `displayValue` and the number `10` through every unit this
lesson built, start to finish, using `Calculator.kt`'s real final state:

1. The program starts because `CalculatorKt.main()` — the real,
   compiler-generated JVM entry point Concept Unit 1's `javap` output
   proved exists — is the one method the `java -jar Calculator.jar`
   command's launcher machinery calls.
2. `println("Calculator starting up")` runs first (Concept Unit 2),
   producing the first line of real output verified above.
3. `println(2)`, `println(3.5)`, and `println(true)` run next (Concept
   Unit 3), each resolving to a different real `println` overload
   (`Int`, `Double`, `Boolean`) based on its argument's type, producing
   three more lines.
4. `2 + 3` evaluates (Concept Unit 4) by calling the real
   `Int.plus(other: Int): Int` from this lesson's Header, type-checked
   by the compiler before the program ever ran — the same check Concept
   Unit 4's `1 + true` lab proved fails loudly for an incompatible
   type.
5. That `5` is bound to the name `displayValue` (Concept Unit 5), first
   with an explicit `: Int` annotation, then (Concept Unit 6) with the
   annotation removed entirely — proven, via the real `initializer type
   mismatch` error on a similar case, to still be exactly `Int`,
   determined by the compiler rather than written by hand.
6. `println(displayValue)` prints `5` — the fourth line of real output.
7. `displayValue = 10` runs (Concept Unit 7) — legal only because line 6
   of `Calculator.kt` declared `displayValue` with `var`, not `val`;
   Concept Unit 5's own lab proved this exact line would be rejected by
   the compiler under `val`.
8. `println(displayValue)` runs a second time, printing `10` — the same
   name, a different value, because the reassignment on the line
   directly above it already ran by the time this call executes.

Six lines of real, verified terminal output — `Calculator starting up`,
`2`, `3.5`, `true`, `5`, `10` — are the complete, observable result of
every concept this lesson introduced. Lesson 0.2 picks this file back
up to turn `2 + 3` into a real, reusable `add` function.
