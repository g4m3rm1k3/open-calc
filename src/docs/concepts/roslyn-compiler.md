# Roslyn — the C# Compiler

**What it is.** The actual program that turns `.cs` source into IL is
called Roslyn. It's not a metaphor or a codename for "the C# compiler" in
the abstract — it's a specific, real, open-source project
(`dotnet/roslyn` on GitHub), and the file that does the work is a managed
DLL, `csc.dll`, sitting inside the .NET SDK install itself.

**The backstory.** Before Roslyn shipped (with C# 6 / Visual Studio 2015,
after a multi-year public preview starting around 2011), the C# and VB
compilers were native, closed-source binaries. You handed them source
files; they handed back a compiled assembly; nothing about *how* — the
parse tree, the bound symbols, the type-checking decisions — was
inspectable or reusable by anything else. Every tool that wanted to
understand C# code (an IDE's autocomplete, a linter, a refactoring tool)
had to write its own approximate, second-guessing parser, because the
compiler's real understanding of the code was locked inside a black box.

Roslyn rewrote both compilers from scratch, in C# and VB themselves, and
deliberately exposed every stage of compilation — parsing, binding,
type-checking, emission — as a public, documented object model. This is
usually summarized as **"compiler as a service"**: the compiler is no
longer just an executable you invoke once and discard, it's a library
other programs can drive directly. That one design decision is *why*
modern C# tooling looks the way it does — an IDE's real-time red
squiggles, a Roslyn analyzer flagging a style violation, a source
generator writing code for you at build time — all of it calls into the
same compiler object model that ultimately produces your `.dll`, not a
separate approximation of it.

**Where it actually lives, and how it's actually invoked.** Inside the
.NET SDK, under `Roslyn/bincore/csc.dll`. `dotnet build` doesn't shell
out to a native `csc.exe` — it runs `dotnet exec` against that managed
DLL, passing every compiler flag explicitly on the command line (every
`/reference:`, `/target:`, `/out:`, source file, and more). Nothing about
what gets compiled, referenced, or produced is implicit; a build tool
just assembles that argument list and hands it to Roslyn.

**Why this matters beyond trivia.** "The compiler" stops being a sealed
box the moment you know it's a real, inspectable, currently-running
managed program with a documented API — the same posture this whole
curriculum takes toward every framework and runtime piece it uses.
