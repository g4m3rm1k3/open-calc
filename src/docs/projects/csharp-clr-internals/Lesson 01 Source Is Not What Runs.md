# Lesson 1: Source Is Not What Runs

*(What `csc` Actually Does)*

**What you will build**
Two small, real programs. The first, `Greet`, is deliberately trivial —
its only job is to exist as a genuine compiled specimen, something with
real IL and a real assembly manifest inside it. The second,
`AssemblyPeek`, is the actual point: a command-line tool, built up piece
by piece across this unit and the next several units in this series, that
opens a compiled `.dll` and reads back exactly what's inside it — no
disassembler, no third-party tool, using nothing but the same public
`System.Reflection.Metadata` API .NET's own tooling is built on.
`AssemblyPeek` is this curriculum's running project: every later lesson
in this series adds to it as you learn one more layer of what a compiled
.NET program actually is underneath. The transferable problem underneath
"build an inspector tool" is the one this whole lesson is really about:
`dotnet build` is not a black box, the `.exe` you run is not the real
program, and every claim this lesson makes about what's "really" going on
is something you can point a real tool at and see for yourself, this
session, not take on faith.

**What you need to know first**
Nothing — this is Lesson 1.

**Terms introduced in this lesson**
- **Managed code** — code whose execution is supervised by a runtime (for
  .NET, the CLR — Common Language Runtime) rather than running as raw
  instructions the OS hands straight to the CPU. This is the root reason
  every other term below exists: IL, JIT compilation, assemblies, and
  automatic memory management are all consequences of a runtime standing
  between your code and the processor, watching what runs.
- **Roslyn** (`roslyn-compiler.md`) — the real, open-source program that
  compiles C# source into IL.
- **IL / Intermediate Language** (`intermediate-language-il.md`) — the
  CPU-independent instruction set Roslyn emits instead of machine code.
- **Assembly** (`dotnet-assembly.md`) — the actual compiled, self-describing
  unit of deployment and identity in .NET.
- **Top-level statements** (`top-level-statements.md`) — the C# 9+ syntax
  that lets a file's executable code appear without a hand-written class
  or `Main` method.
- **Local function** (`local-functions.md`) — a function declared inside
  another method's body, scoped so only that method can call it.

**Objects and methods used**
- **`System.Console.WriteLine`** — a `static` method (see the Concept
  Isolation lab below for what that word actually means in practice):
  it belongs to the `Console` class itself, not to any particular
  `Console` object, because there is nothing per-instance about writing
  a line to standard output — there is one console, not one per object,
  so no object needs to exist for this call to make sense.
- **`PEReader`** — a sealed class from `System.Reflection.PortableExecutable`
  that reads the Portable Executable (PE) file format .NET assemblies are
  stored in. Constructed once, over an open file stream; its real
  declared shape (the specific members this lesson calls) is shown at
  first use, in Concept Unit 5, per this curriculum's Usage Contract
  Rule — a type this lesson calls more than one related member of.
- **`MetadataReader`** — a sealed class from `System.Reflection.Metadata`
  that reads the actual metadata tables (type definitions, method
  definitions, assembly references, and more) out of a `PEReader`'s PE
  image. Obtained via `GetMetadataReader()` — itself an *extension*
  method on `PEReader`, not a member `PEReader` declares directly, worth
  knowing precisely because it means `MetadataReader` and `PEReader` are
  genuinely two separate objects cooperating, not one object with two
  names. Real declared shape shown at first use, Concept Unit 4.

---

## Concept Unit: Top-Level Statements

### The Problem

Every C# program needs a real starting point — some specific method the
operating system's process loader and the CLR agree to call first, the
same way a C `main` function or a Python script's top-level module code
does. Historically, C# forced you to write that starting point out by
hand, in full, before you could write a single line of actual logic:

```csharp
using System;

namespace Greet
{
    class Program
    {
        static void Main(string[] args)
        {
            Console.WriteLine("hi");
        }
    }
}
```

Six lines of ceremony — a `namespace`, a `class`, a method signature with
an unused `args` parameter — before the one line that does anything. For
a small tool, a script, or (as in this lesson) a deliberately tiny
specimen program, that ceremony is pure overhead: correct, but
unrelated to whatever the program is actually for.

### Introduce the concept in isolation

Create a brand-new console project:

```bash
dotnet new console -o Greet
```

`dotnet new console` scaffolds a runnable console-app project; `-o Greet`
names both the output folder and, by convention, the project inside it.
Open the `Program.cs` it generated — recent SDKs generate this file
already using the feature this unit is about, so replace its contents
with this instead, to see the feature clearly against a minimal example
of your own:

```csharp
System.Console.WriteLine("hi");
```

Run it:

```bash
dotnet run
```

```
hi
```

That's a complete, real, runnable C# program — one line, no visible
class, no visible `Main`. This is called **top-level statements**: a C#
9+ feature that lets a file's executable code appear directly, with the
compiler filling in the class-and-`Main` ceremony you didn't write. The
output proves the program really did run, start to finish, with none of
that ceremony present in the source — it does not yet prove the ceremony
is truly *gone* underneath, only that it's no longer something you had
to type. Proving that claim for real is this lesson's whole second half.

### Project change

- **Reference Source** — no reference counterpart; this is a from-scratch
  specimen written for this lesson alone.
- **Files affected** — `Greet/Program.cs`, created by `dotnet new console`
  and then replaced.
- **Change type** — replace.
- **Location** — the entire file; `dotnet new console`'s generated content
  is discarded in favor of the minimal version above.
- **Dependencies** — the .NET SDK (this lesson was verified against SDK
  9.0.100; `dotnet --version` shows yours).

Unlike a normal isolated lab in this curriculum, `Greet/Program.cs` is
**not discarded** once this concept is demonstrated — the rest of this
lesson needs `Greet` to keep existing as a real, compiled specimen for
`AssemblyPeek` to examine. Its role here is a lab that happens to also be
the thing under test for every later unit, not the ongoing project
`AssemblyPeek` itself.

### Mechanical walkthrough

Enumerating `System.Console.WriteLine("hi");`, in order:

- **`System.Console`** — first appearance. A `static` class from the
  .NET base class library — "static" here means the class itself has no
  instances; you never write `new Console()`, because a running program
  has exactly one standard-output stream, not a variable number of
  `Console` objects each with their own. The fully-qualified
  `System.Console` (rather than a bare `Console` after a `using System;`
  line) is used here deliberately: a brand-new file with nothing else in
  it has no `using` directives yet, and spelling the full name once,
  correctly, is more honest about what's actually being called than
  assuming a directive that isn't there yet.
- **`.WriteLine("hi")`** — first appearance. A `static` method on
  `Console` that writes its argument to standard output followed by a
  newline. Takes a `string` (or, via overloads, nearly anything with a
  sensible text representation) and returns nothing (`void`) — nothing
  comes back because the entire point of the call is the side effect of
  printed text, not a value to use afterward.
- **`"hi"`** — a string literal; already-basic syntax, no restatement
  owed.
- **The missing `class`/`Main`** — this is the concept this unit is
  about: **top-level statements**, letting this file skip writing an
  explicit entry point by hand.

### CS lens

This is an instance of **syntactic sugar** — a language feature that
changes nothing about what actually executes, only what a programmer has
to type to express it. Also recognized in: LINQ query syntax desugaring
into ordinary method calls, JavaScript's `class` keyword desugaring into
prototype-chain assignments, Python's `with` statement desugaring into a
`try`/`finally` block, and property auto-implementation in C# itself
(a later lesson's subject) desugaring into a backing field plus two
methods.

### SE lens

The design principle here is reducing ceremony for the overwhelmingly
common case (one file, one entry point) without inventing a second
execution model to do it — the alternative *not* chosen was adding a new
kind of "script mode" with different rules than a normal compiled
program. The cost of the alternative would have been a second mental
model to learn; the cost of the choice actually made is that a reader
unfamiliar with the feature can be left wondering where the class and
`Main` "went," which is exactly the question the rest of this lesson
exists to answer with evidence instead of a shrug.

### Connect

One line, one real running program, and one open question: is the
class-and-`Main` ceremony this file skipped actually *gone*, or just
unwritten? The next unit sets up a second concept this same file happens
to demonstrate; the unit after that starts building the tool that will
actually answer the open question.

---

## Concept Unit: Local Functions

### The Problem

`Greet` is about to grow one more line — not more output, but a small
computation worth naming, the way any real program eventually needs a
helper that isn't reused anywhere else and doesn't deserve to live as a
permanent, externally-visible member of some class that doesn't really
exist yet in this file anyway.

### Introduce the concept in isolation

Replace `Greet/Program.cs` with:

```csharp
int Add(int a, int b) => a + b;

System.Console.WriteLine(Add(2, 3));
```

Run it:

```bash
dotnet run
```

```
5
```

`Add` is declared *inside* the same top-level-statements file, right
alongside the code that calls it, using an expression body (`=> a + b`)
instead of a `{ return a + b; }` block — both are ordinary, equivalent
ways to write a method body; the arrow form is just shorter when the
whole body is one expression. This is called a **local function**: a
function declared inside another function/method's own scope, callable
only from within it. Nothing outside this file — nothing outside this
*method*, if `Greet` later grows a real one — can see or call `Add`.

### Project change

- **Reference Source** — no reference counterpart; from-scratch.
- **Files affected** — `Greet/Program.cs`.
- **Change type** — replace.
- **Location** — whole file (still small enough that a full replacement
  is clearer than a diff against the one-line version above).
- **Dependencies** — none beyond the previous unit's project.

### Mechanical walkthrough

Enumerating the new line, `int Add(int a, int b) => a + b;`:

- **`int Add(int a, int b)`** — first appearance of a **local function**
  declaration: a name, a parameter list, each parameter typed (`int a`,
  `int b`), and a declared return type (`int`) out front, exactly like an
  ordinary method signature — the only difference from an ordinary method
  is *where* it's written and therefore what can see it.
- **`=> a + b`** — an expression-bodied member: the `=>` introduces a
  single expression standing in for a full `{ return ...; }` block.
  First appearance of this syntax shape in this curriculum, though not
  of `+` on `int`s, which is already-basic.
- **`Add(2, 3)`** — an ordinary call to the local function just declared,
  passing two `int` literals positionally.

### CS lens

Local functions are an instance of **restricting scope to exactly where
something is needed**, rather than to "the whole class" by default. Also
recognized in: nested function definitions in Python and JavaScript,
block-scoped `let`/`const` limiting a variable's visibility to the `{}`
it's declared in, and private inner classes in Java used by exactly one
outer class.

### SE lens

The alternative here would be a `private` method on some enclosing class
— which C# already has, and which is strictly *more* visible than a
local function needs to be: any other method on that same class could
still call it, whether or not that ever makes sense for a helper that
conceptually belongs to one specific method alone. The tradeoff is the
usual one for tighter scoping: if a sibling method later turns out to
need the same helper, a local function has to be promoted out to a real
method first — a small, deliberate cost in exchange for not exposing
something everywhere by default just in case.

### Connect

`Greet` now demonstrates two concepts at once: no visible class, and a
function declared somewhere a normal method never could be. Both are
still just claims about what the *source* looks like. The next three
units build the actual tool that checks what's true underneath —
starting with what `dotnet build` really does to turn this file into
something that runs at all.

---

## Concept Unit: Roslyn — the Real Compiler Invocation

### The Problem

`dotnet build` and `dotnet run` feel like one atomic action: you type a
command, a program starts. Treating that as a sealed black box is exactly
the posture this curriculum takes toward nothing else — every other
framework or runtime piece gets opened up and shown as real, ordinary,
inspectable work someone's code actually does. The compiler deserves the
same treatment before anything else in this lesson can be trusted.

### Observe it directly — no new code, real captured output

This unit has no new C# to type; its subject is `dotnet build`'s own
behavior, observed by asking it to say what it's doing instead of
staying quiet about it.

```bash
dotnet build -v:normal
```

Buried in the (long) output is a line starting with `/usr/local/share/dotnet/dotnet exec`
(the exact path depends on your own install). Trimmed to what matters —
the real run, verified this session against .NET SDK 9.0.100, had well
over a hundred `/reference:` flags, one per base-class-library assembly,
elided below with `...`:

```
/usr/local/share/dotnet/dotnet exec \
  "/usr/local/share/dotnet/sdk/9.0.100/Roslyn/bincore/csc.dll" \
  /target:exe \
  /out:obj/Debug/net9.0/Greet.dll \
  /reference:.../System.Console.dll \
  /reference:.../System.Runtime.dll \
  ... \
  Program.cs \
  obj/Debug/net9.0/Greet.GlobalUsings.g.cs \
  obj/Debug/net9.0/Greet.AssemblyInfo.cs
```

This is not a summary or a paraphrase of what `dotnet build` does — it is
the literal command `dotnet build` ran, captured this session. Read
plainly, it says: `dotnet exec` runs a managed DLL called `csc.dll` —
this **is** the real compiler; there is no separate native `csc.exe`
involved on this platform — and hands it an explicit, fully-spelled-out
argument list: what kind of output to produce (`/target:exe`), where to
write it (`/out:...Greet.dll` — a `.dll`, not a `.exe`, on a project
whose *type* is `exe`; the next unit explains why), every assembly this
code is allowed to reference by exact file path, and every source file
to compile, including two files you never wrote (`GlobalUsings.g.cs`
and `AssemblyInfo.cs` — small, generated files the SDK adds automatically
before compiling; not a concept this lesson needs to open further, only
worth knowing they exist so the file list isn't mysterious).

`csc.dll` is not an internal implementation detail with no name of its
own — it's **Roslyn** (`roslyn-compiler.md`), the real, specific,
open-source compiler backing every version of C# since 2015.

### CS lens

A build tool "compiling your project" is, underneath, exactly this: a
real program (Roslyn) with an explicit, enumerable list of inputs,
invoked as an ordinary subprocess. Also recognized in: webpack calling
Babel with an explicit config, Cargo invoking `rustc` with a computed
flag list, and any Makefile target that turns out, on inspection, to be
one specific `gcc` invocation with specific flags.

### SE lens

Before Roslyn (detailed fully in `roslyn-compiler.md`), the alternative
was a closed, native compiler binary: correct, but with none of its
internal understanding of the code exposed to anything else. The
engineering cost of that alternative was borne by every *other* tool
wanting to understand C# — an IDE's autocomplete, a linter — each forced
to write its own approximate re-parsing of the language, independently
drifting from the real compiler's actual behavior over time. Exposing the
compiler itself as a callable library traded a small amount of
architectural complexity (a compiler that's also a set of public APIs)
for eliminating an entire category of "the tool disagrees with the
compiler" bugs.

### Connect

The compiler's own command line already answered one question in
passing: it produces a `.dll`, even though the project itself is an
`exe`. That's not a typo in the captured output — it's the next real
fact worth digging into, and the first thing `AssemblyPeek` will be built
to look at directly.

---

## Concept Unit: The Assembly Manifest

### The Problem

Running `dotnet run` in `Greet/` produces a program you can execute —
but the previous unit's captured compiler output named the file it
produces `Greet.dll`, not `Greet.exe`. Something you can run, and the
actual output of the compiler, are apparently not the same file. Rather
than take a sentence's word for what's really in that `.dll`, this unit
starts building a tool that reads it directly.

### The New Code — type it yourself

Create the tool this whole series builds on:

```bash
dotnet new console -o AssemblyPeek
```

Replace `AssemblyPeek/Program.cs` with:

```csharp
using System.Reflection.Metadata;
using System.Reflection.PortableExecutable;

var path = args[0];
using var fs = File.OpenRead(path);
using var pe = new PEReader(fs);
var mr = pe.GetMetadataReader();

var asm = mr.GetAssemblyDefinition();
Console.WriteLine($"Assembly: {mr.GetString(asm.Name)}, Version {asm.Version}");
```

### The Updated Project

`AssemblyPeek/Program.cs`, in full — this is a brand-new file, so there
is no larger enclosing structure to place it within yet:

```csharp
using System.Reflection.Metadata;
using System.Reflection.PortableExecutable;

var path = args[0];
using var fs = File.OpenRead(path);
using var pe = new PEReader(fs);
var mr = pe.GetMetadataReader();

var asm = mr.GetAssemblyDefinition();
Console.WriteLine($"Assembly: {mr.GetString(asm.Name)}, Version {asm.Version}");
```

**`PEReader` and `MetadataReader`, the real declared shape of what this
lesson actually calls** (Usage Contract Rule — this lesson calls more
than one related member of each):

- **`PEReader(Stream stream)`** — a public constructor taking any
  readable `Stream`; verified against the type's own documentation
  (`System.Reflection.PortableExecutable.PEReader`, .NET API reference).
  Reads the Portable Executable file format directly from that stream.
- **`PEReader.GetMethodBody(int relativeVirtualAddress)`** — used
  starting in the next Concept Unit; documented as an *extension*
  method (declared in `PEReaderExtensions`, not on `PEReader` itself),
  returning a `MethodBodyBlock` for the method whose IL starts at that
  RVA (Relative Virtual Address) — introduced now because it's part of
  the same `PEReader` this unit constructs, even though it isn't called
  until IL is this lesson's actual subject.
- **`PEReader.GetMetadataReader()`** — likewise documented as an
  extension method, not a `PEReader` member — worth being precise about,
  because it means `PEReader` (raw PE-file access) and `MetadataReader`
  (structured metadata-table access) are two separate, cooperating
  objects, not one object wearing two names.
- **`MetadataReader.GetAssemblyDefinition()`** — takes no arguments,
  returns an `AssemblyDefinition` — a compound value, not a single
  primitive, carrying (at minimum) this assembly's own `Name` (a
  `StringHandle`, not a plain `string` — metadata stores strings once in
  a shared table and refers to them by a small handle rather than
  repeating text, which is why `GetString` below is a separate step) and
  `Version` (an ordinary `System.Version`).
- **`MetadataReader.GetString(StringHandle handle)`** — resolves one of
  those handles back into the real `string` it refers to.

### Mechanical walkthrough

Enumerating the new code, in order:

- **`using System.Reflection.Metadata;` / `using System.Reflection.PortableExecutable;`**
  — first appearance of both namespaces in this curriculum; already
  covered by the Objects and methods used section above, no separate
  restatement owed here per this schema's Repetition Rule.
- **`args[0]`** — first appearance. `args` is the `string[]` every C#
  program's entry point receives (visible explicitly in the traditional
  `Main(string[] args)` form shown in this lesson's first unit; top-level
  statements still receive it, just under the implicit name `args`
  rather than a parameter you wrote yourself). `[0]` reads the first
  command-line argument — the path to the `.dll` to inspect.
- **`File.OpenRead(path)`** — a `static` method on `System.IO.File`
  that opens an existing file for reading and returns a `FileStream`;
  first appearance, single simple call with one plain input and one
  plain output, no shown shape owed per this schema's own exception for
  ordinary single-method use.
- **`using var fs = ...` / `using var pe = ...`** — first appearance of
  a `using` *statement* (distinct from a `using` *directive* just above
  it, despite the identical keyword) applied to a local variable: it
  guarantees `Dispose()` is called on `fs` and `pe` once they go out of
  scope, even if an exception is thrown in between — both `FileStream`
  and `PEReader` hold real OS or unmanaged resources (a file handle;
  loaded PE image data) that need an explicit release, unlike ordinary
  managed objects a later lesson in this series will show the garbage
  collector reclaiming on its own.
- **`new PEReader(fs)`** — constructs a `PEReader` over the open file
  stream; shape shown above.
- **`pe.GetMetadataReader()`** — shape shown above; called with instance
  syntax (`pe.GetMetadataReader()`) despite being an extension method,
  which is exactly what extension methods are for: calling a method that
  isn't actually declared on the type, written as if it were.
- **`mr.GetAssemblyDefinition()`** — shape shown above.
- **`mr.GetString(asm.Name)`** — shape shown above; `asm.Name` is the
  `StringHandle` field being resolved.
- **`asm.Version`** — a plain `System.Version` field read directly, no
  handle-resolution step needed (unlike `Name`, `Version` isn't stored as
  interned text, so there's nothing to look up).
- **`$"Assembly: {...}, Version {...}"`** — a string interpolation
  expression; already-basic syntax in any curriculum that has covered
  string formatting, and this curriculum's first program (Concept Unit
  1) already used a simpler `Console.WriteLine` call, so the mechanism of
  passing a computed value to it is not new — only the interpolation
  syntax itself would be first appearance if not already covered
  elsewhere; treated here as basic, following ordinary C-family
  string-formatting conventions.

### Commands needed

```bash
dotnet build            # inside Greet/, produces obj/Debug/net9.0/Greet.dll
cd ../AssemblyPeek
dotnet run -- ../Greet/obj/Debug/net9.0/Greet.dll
```

`dotnet run -- <args>` passes everything after `--` through to the
program itself, rather than treating it as an argument to `dotnet run`
— without `--`, `dotnet run` would try to interpret the path as its own
option and fail.

### Run it. Show the real output.

Verified this session (.NET SDK 9.0.100 — your assembly's own name will
match whatever you named the `Greet` project):

```
Assembly: Greet, Version 1.0.0.0
```

This is the actual content of `Greet.dll`'s manifest (`dotnet-assembly.md`)
— not a description of it, not `dotnet`'s own reporting about it, read
directly out of the compiled file's own metadata by code you just wrote
and ran yourself.

### CS lens

An assembly carrying its own name and version inside itself, rather than
relying on something external (a filename, a folder path) to say what it
is, is an instance of a **self-describing artifact**. Also recognized in:
a JPEG's embedded EXIF metadata, a JAR file's `MANIFEST.MF`, a Docker
image's own `manifest.json`, an ELF binary's section headers.

### SE lens

The alternative not chosen is identity-by-location: treat "whatever file
is sitting at this path" as a dependency's identity, the way naive static
linking or a hardcoded file path would. The manifest approach instead
resolves dependencies by name and version at load time (the next lesson
in this series opens `AssemblyReferences`, the other half of this same
manifest, to show exactly that), at the cost of needing a real resolution
step the simpler, location-based alternative wouldn't — a cost .NET
accepts because it's what allows a dependency to move, update, or be
shared across multiple programs without recompiling anything that
depends on it.

### Connect

`AssemblyPeek` can now read an assembly's own identity, in its own words.
Its constructor argument, `mr`, holds far more than a name and version —
the next unit reaches into the exact same `mr` for something the compiler
never told you about directly: the real, byte-for-byte contents of one
compiled method.

---

## Concept Unit: IL — What's Actually Inside a Method

### The Problem

Two claims are still sitting unproven from the first two units of this
lesson: that top-level statements really do compile to a real class and
method, and that a local function really does compile to a real,
separate method with its own name. Prose already asserted both. This
curriculum's own standard for a claim like that is explicit: "the
compiler generated it" is not proof, only a real tool's output is.
`AssemblyPeek` already has everything needed to check — it just needs to
look at more than one field of `mr`.

### The New Code — type it yourself

Add this after the existing `Console.WriteLine` call in
`AssemblyPeek/Program.cs`:

```csharp
foreach (var typeHandle in mr.TypeDefinitions)
{
    var type = mr.GetTypeDefinition(typeHandle);
    var typeName = mr.GetString(type.Name);
    if (typeName == "<Module>") continue;

    Console.WriteLine($"Type: {typeName}");
    foreach (var methodHandle in type.GetMethods())
    {
        var method = mr.GetMethodDefinition(methodHandle);
        Console.WriteLine($"  method: {mr.GetString(method.Name)}");
    }
}
```

### The Updated Project

`AssemblyPeek/Program.cs`, in full:

```csharp
using System.Reflection.Metadata;
using System.Reflection.PortableExecutable;

var path = args[0];
using var fs = File.OpenRead(path);
using var pe = new PEReader(fs);
var mr = pe.GetMetadataReader();

var asm = mr.GetAssemblyDefinition();
Console.WriteLine($"Assembly: {mr.GetString(asm.Name)}, Version {asm.Version}");

foreach (var typeHandle in mr.TypeDefinitions) // ← new
{
    var type = mr.GetTypeDefinition(typeHandle);
    var typeName = mr.GetString(type.Name);
    if (typeName == "<Module>") continue;

    Console.WriteLine($"Type: {typeName}");
    foreach (var methodHandle in type.GetMethods())
    {
        var method = mr.GetMethodDefinition(methodHandle);
        Console.WriteLine($"  method: {mr.GetString(method.Name)}");
    }
}
```

**`TypeDefinition` and `MethodDefinition`, real declared shape of what
this lesson calls** (compound values returned from the calls above, per
the Usage Contract Rule):

- **`MetadataReader.TypeDefinitions`** — a property returning every type
  this assembly itself defines, as a collection of handles (not the full
  type data yet — metadata is read lazily, handle first, details only
  when you ask for them by passing the handle to `GetTypeDefinition`).
- **`MetadataReader.GetTypeDefinition(TypeDefinitionHandle)`** — resolves
  one handle into a real `TypeDefinition`, carrying (among other fields)
  `Name` and `Namespace` (both `StringHandle`s, resolved the same way as
  the assembly's own name) and a `GetMethods()` method of its own.
- **`TypeDefinition.GetMethods()`** — returns every method *that specific
  type* declares, again as handles.
- **`MetadataReader.GetMethodDefinition(MethodDefinitionHandle)`** —
  resolves one of those handles into a real `MethodDefinition`, carrying
  `Name` (a `StringHandle`) and, used in the next step,
  `RelativeVirtualAddress` — the exact location of that method's real IL
  bytes.

### Run it. Show the real output.

```bash
cd AssemblyPeek
dotnet run -- ../Greet/obj/Debug/net9.0/Greet.dll
```

Verified this session:

```
Assembly: Greet, Version 1.0.0.0
Type: Program
  method: <Main>$
  method: .ctor
  method: <<Main>$>g__Add|0_0
```

Both open claims are now settled by direct evidence, not assertion:

- **Top-level statements really do compile to a real class and method.**
  `Type: Program` is a real type in the compiled metadata — the
  conventional name the compiler chose, exactly as `top-level-statements.md`
  described — and `<Main>$` is a real method on it: the entry point,
  compiler-generated, using a name (`$` is not a legal character in a
  hand-written C# identifier) deliberately chosen so it can never
  collide with anything you could have typed yourself.
- **Local functions really do compile to a real, separate method.**
  `<<Main>$>g__Add|0_0` is `Add`, compiled — a real method on `Program`,
  named to embed which method it came from (`<Main>$`) and marked as a
  compiler-generated local function (`g__`), for the same
  can't-collide-with-real-code reason.
- **`.ctor`** is the class's default constructor — every class gets one
  unless it defines its own, a fact this lesson is naming now because it
  just became visible in real output; full treatment of what a
  constructor actually does is a future lesson's subject.

### Introduce the concept in isolation — IL itself

The method names above prove *which* methods exist. They say nothing yet
about what's actually inside one. Extend the same loop to fetch it, for
the local function specifically:

```csharp
if (mr.GetString(method.Name).Contains("g__Add"))
{
    var body = pe.GetMethodBody(method.RelativeVirtualAddress);
    Console.WriteLine($"    IL: {BitConverter.ToString(body.GetILBytes())}");
}
```

Placed inside the existing inner `foreach` loop, right after the
`method:` line it extends. Run again:

```
    IL: 02-03-58-2A
```

Four bytes. This is called **IL (Intermediate Language)** — detailed
fully in `intermediate-language-il.md` — the actual instructions Roslyn
emitted for `int Add(int a, int b) => a + b`, and every one of those four
bytes has a fixed, public meaning defined by the ECMA-335 standard:

1. `02` — `ldarg.0`: push argument 0 (`a`) onto IL's evaluation stack.
2. `03` — `ldarg.1`: push argument 1 (`b`).
3. `58` — `add`: pop the top two stack values, push their sum.
4. `2A` — `ret`: pop the remaining value and return it.

Read in order, those four bytes are a literal, mechanical transcription
of `a + b` — proof, not description, that this is what "the compiler
generates IL" actually means: four specific, publicly-documented bytes,
sitting at a specific address inside a specific file, readable by any
program (including one you just wrote) that knows where to look.

### `PEReader.GetMethodBody`, real declared shape

- **`PEReader.GetMethodBody(int relativeVirtualAddress)`** — an extension
  method (see this unit's earlier note on `GetMetadataReader` for what
  that distinction means) returning a `MethodBodyBlock` for the method
  whose IL begins at that RVA.
- **`MethodBodyBlock.GetILBytes()`** — returns the method's raw IL as a
  `byte[]`; single simple call, one plain output, no further shape owed.

### CS lens

IL sitting between C# source and real machine code is an instance of an
**intermediate representation** in a compilation pipeline. Also
recognized in: LLVM IR sitting between many source languages and every
CPU backend LLVM targets, a regular-expression engine compiling a pattern
into an NFA before ever matching a character, and Python source
compiling to `.pyc` bytecode before CPython's interpreter loop runs it.

### SE lens

The design principle is deferring CPU-specific work to the latest safe
moment — run time, via the JIT (a future lesson's subject) — rather than
doing it once at compile time the way a native C or C++ compiler does.
The alternative not chosen (compile straight to one CPU's real machine
code) is simpler and has no warm-up cost, but ties every compiled binary
to one instruction set forever. IL's cost is the opposite trade: every
process pays a real, measurable JIT cost before its hottest code reaches
full speed, in exchange for one build working, unmodified, on every CPU
architecture a .NET runtime exists for.

### Connect

Four bytes, fully decoded by hand, are what this entire lesson's opening
claim — "source is not what runs" — actually cashes out to: not a slogan,
a specific `02-03-58-2A` sitting inside a specific `.dll`, found by a
tool you built yourself this session.

---

## Connect the pieces

One value, traced through every unit built in this lesson: the number
`5`.

1. `Greet/Program.cs` declares `Add`, a **local function**
   (`local-functions.md`), inside a file with no visible class — **top-level
   statements** (`top-level-statements.md`).
2. `dotnet run` invisibly asks `dotnet build` to compile it — which
   really means running **Roslyn** (`roslyn-compiler.md`), `csc.dll`, with
   an explicit, fully-spelled-out argument list, producing `Greet.dll`.
3. `Greet.dll` is a real **assembly** (`dotnet-assembly.md`) — its
   manifest, read directly by `AssemblyPeek`, reports `Assembly: Greet,
   Version 1.0.0.0`.
4. Inside that assembly, `AssemblyPeek` finds a type named `Program` with
   three methods — `<Main>$`, `.ctor`, and `<<Main>$>g__Add|0_0` — proving
   both of this lesson's syntax claims empirically.
5. The last of those methods' real **IL** (`intermediate-language-il.md`)
   is exactly four bytes — `02-03-58-2A` — a mechanical transcription of
   `a + b`, decoded by hand above.
6. Running `Greet` prints `5` — the one number every step above
   ultimately exists to compute correctly, from source, through a real
   compiler, into a real file, down to four real bytes.

## What breaks without this

Delete the `-o` flag's target and pass a path to something that isn't a
.NET assembly at all — for instance, point `AssemblyPeek` at its own
source file instead of a compiled `.dll`:

```bash
dotnet run -- ../Greet/Program.cs
```

Verified this session:

```
Unhandled exception. System.BadImageFormatException: Image is too small.
   at System.Reflection.Throw.ImageTooSmall()
   at System.Reflection.PortableExecutable.SectionHeader..ctor(PEBinaryReader& reader)
   at System.Reflection.PortableExecutable.PEHeaders.ReadSectionHeaders(PEBinaryReader& reader)
   at System.Reflection.PortableExecutable.PEHeaders..ctor(Stream peStream, Int32 size, Boolean isLoadedImage)
   at System.Reflection.PortableExecutable.PEReader.InitializePEHeaders()
   at System.Reflection.PortableExecutable.PEReader.GetMetadataBlock()
   at System.Reflection.Metadata.PEReaderExtensions.GetMetadataReader(PEReader peReader, ...)
   at Program.<Main>$(String[] args)
```

This is `PEReader` (correctly) refusing to treat plain text as a Portable
Executable image — it doesn't even get as far as looking for metadata;
it fails while trying to parse a PE section-header structure that a
`.cs` text file has no bytes for at all. Proof, in the negative
direction, that everything `AssemblyPeek` reads is real, structured
binary format, not something it could just as easily fake from a text
file. Notice, too, the stack trace's own last line: `Program.<Main>$` —
the same compiler-generated entry-point name this lesson found by hand
above, showing up on its own in a real crash, from a program you never
told to reveal it. Restore the real path afterward.

## Exercises

1. Add a second local function to `Greet` — something with three
   parameters, or one that calls `Add` internally — and predict its
   compiled name before running `AssemblyPeek` against the rebuilt `.dll`.
   Check your prediction against the real output.
2. `mr.AssemblyReferences` (mentioned in `dotnet-assembly.md`, not yet
   used in this lesson's own code) lists every assembly `Greet.dll`
   depends on. Add a loop that prints each one's name and version, the
   same way this lesson printed the assembly's own identity.
3. Decode the IL for `<Main>$` itself by hand, the same way this lesson
   decoded `Add`'s four bytes — it's longer, and will contain a `call`
   opcode (`28`) followed by a 4-byte metadata token you are not expected
   to fully decode yet; identifying just the `ldc.i4` (load constant),
   `call`, and `ret` opcodes you already know is enough.

## Definition of done

- [ ] `Greet` runs and prints `5`.
- [ ] `AssemblyPeek` runs against `Greet.dll` and prints the assembly's
      name and version, every type and method name, and the local
      function's real IL bytes.
- [ ] You can explain, out loud, without looking back at this lesson,
      why `Greet.dll` (not `Greet`, the apphost) is the file `AssemblyPeek`
      actually has to point at.
- [ ] You can decode `02-03-58-2A` by hand from memory.
- [ ] `git commit` both projects, with a message explaining *why* this
      lesson exists — for example: `"Prove source isn't what runs: build
      an inspector that reads a real compiled method's IL, instead of
      trusting that the compiler 'just handles it'"` — not merely what
      files it added.
