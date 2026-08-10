# IL (Intermediate Language)

**What it is.** When Roslyn (`roslyn-compiler.md`) compiles a `.cs` file, it does not produce
machine code for any specific CPU. It produces **IL** — Intermediate
Language, also called CIL (Common Intermediate Language) or MSIL — a
CPU-independent instruction set that describes *what* a method does, not
*how* any particular processor should do it.

IL is **stack-based**, not register-based: an instruction doesn't name a
register to operate on, it pushes and pops values on an implicit
evaluation stack. `ldarg.0` pushes the method's first argument onto that
stack; `add` pops the top two values, adds them, and pushes the result
back; `ret` pops the return value off the stack and returns it. This is
deliberately simple to encode and simple to verify — nothing in IL
depends on how many registers a real CPU happens to have.

**Why this exists.** If `csc` emitted x86 machine code directly, that
output would only run on x86. IL defers the CPU-specific translation to
a separate step — the **JIT** (Just-In-Time compiler), part of the CLR,
running on the machine that actually executes the program — which turns
IL into real machine code for *that* machine, right before it runs. This
is the actual mechanism behind ".NET code runs on multiple platforms": it
isn't that your C# source gets reinterpreted differently per platform,
it's that one shared IL output gets JIT-compiled differently per
platform, each time, by a JIT built for that CPU.

**What it looks like.** IL instructions are single-byte opcodes, some
followed by operands (a 4-byte metadata token for `call`, for instance).
A method compiled from `int Add(int a, int b) => a + b` produces exactly
four bytes: `02 03 58 2A` — `ldarg.0`, `ldarg.1`, `add`, `ret`. Every IL
opcode's byte value is fixed and public, defined in the ECMA-335
standard (the specification .NET's own runtime and compiler both
implement) — nothing about decoding `58` as `add` is guesswork or
version-specific trivia.

**Where it lives.** IL isn't loose bytes floating in a file — every
method's IL body sits inside the compiled assembly (`dotnet-assembly.md`),
addressed by an RVA (Relative Virtual
Address) recorded in that method's metadata entry. Tooling can read it
back directly: .NET's own `System.Reflection.Metadata` and
`System.Reflection.PortableExecutable` namespaces expose exactly this —
`PEReader.GetMethodBody(rva)` returns the real bytes, no disassembler
required.
