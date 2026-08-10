# .NET Assembly

**What it is.** An assembly is the actual unit of deployment, versioning,
and identity in .NET — not a source file, not "a project," a specific
compiled artifact (almost always a `.dll`, even for a program you run
directly — see the apphost note below). Everything the CLR needs to know
about a piece of compiled code — its name, its version, what it depends
on, every type and method it defines, and where each method's IL
(`intermediate-language-il.md`) actually lives — is recorded inside the
assembly itself, in its **manifest**.

**Why this matters.** Nothing external has to track this information for
the runtime. There's no separate registry file saying "version 1.2 of
`MyLibrary` contains these types" — the assembly is self-describing. Load
one, and everything needed to use it correctly is already inside it.

**The manifest, concretely.** Two pieces matter most for a first look:

- **Assembly identity** — a name and a version number, recorded once,
  read back via the compiled file's own `AssemblyDefinition` metadata
  entry.
- **AssemblyRef entries** — a list of the *other* assemblies this one's
  code depends on, each recorded by name and version, not by a hardcoded
  file path. The CLR resolves each reference to a real file only at load
  time, which is what makes it possible to update or relocate a
  dependency without recompiling everything that references it.

**The apphost, and why the `.exe` you run isn't the assembly.** When you
`dotnet build` a console app, two files show up in the output: a managed
`.dll` (the actual assembly — every type, every method, every byte of IL)
and a small native executable carrying the project's own name, the
**apphost**. The apphost is not managed code
and contains none of your program's logic; its only job is locating an
installed .NET runtime and handing it the real `.dll` to execute. Running
`./Trace` and running `dotnet Trace.dll` end up doing the same thing —
one just has a tiny native launcher stapled in front of it for
convenience, so a user doesn't need `dotnet` typed out to start your
program.

**Where this shows up again.** Every later lesson that loads a plugin,
inspects a type at runtime, or resolves a dependency at startup is doing
something to (or reading something from) an assembly's manifest — this is
the vocabulary that describes what's actually being manipulated.
