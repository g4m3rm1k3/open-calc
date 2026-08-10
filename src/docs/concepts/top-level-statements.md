# Top-Level Statements

**What it is.** A C# 9+ feature that lets a file's executable code appear
directly at the top of a `.cs` file, with no surrounding `class Program`
and no explicit `static void Main`:

```csharp
System.Console.WriteLine("hi");
```

is a complete, runnable program.

**Why it exists.** Every C# program before this feature needed the same
few lines of ceremony before a beginner (or a throwaway script author)
could write a single line of real logic — a namespace, a class, a `Main`
signature, braces on their own lines. Top-level statements remove that
ceremony for the common case of "one file, one entry point," without
changing anything about what actually runs.

**What it really is — sugar, not a new execution model.** The compiler
still needs a real class and a real method to serve as the program's
entry point, because that's what the CLR's loader actually invokes to
start a managed executable — top-level statements don't change that
requirement, they just stop making you type it. Roslyn (`roslyn-compiler.md`)
synthesizes both: a class (conventionally named `Program`) and a method
compiled under the name `<Main>$`. This is directly inspectable in the
compiled assembly's (`dotnet-assembly.md`) metadata — nothing about it is
hidden or purely a source-level fiction.

**The one real restriction.** Only one file in a compilation may contain
top-level statements — the compiler wouldn't know which file's statements
should become the program's actual entry point if more than one did.
