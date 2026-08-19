# Lesson 0: Setting Up Pascal

**What you will build:** A working Free Pascal compiler on your
machine, confirmed by compiling and running a minimal program, so every
later lesson can start directly on syntax instead of re-explaining
installation.

**What you need to know first:** Nothing — this is the first lesson in
this series.

**Terms used in this lesson:**
- **Compiler** — a program that translates your entire source file into
  a standalone executable *before* you run it. This matters because it
  means errors in your code are caught at compile time, before the
  program ever runs, not discovered mid-execution the way an
  interpreted language would find them.
- **Free Pascal (fpc)** — the specific compiler this series uses. It is
  a free, actively maintained implementation of the Pascal language,
  and the one *Software Tools in Pascal*-style exercises can run on
  directly without needing period-accurate 1980s hardware or tooling.
- **Source file** — the plain-text `.pas` file you write, containing
  Pascal code. It does nothing by itself; it only becomes runnable
  after the compiler processes it.
- **Executable** — the `.exe` file the compiler produces from your
  source file. This is the thing you actually run; the `.pas` file is
  never executed directly.
- **PATH environment variable** — the list of folders Windows searches
  when you type a command name. The Free Pascal installer needs to add
  its `bin` folder to this list, or typing `fpc` at a prompt won't find
  anything.

**Objects and methods used:**
- **`fpc`** —
  - *What it is:* the Free Pascal command-line compiler.
  - *Implementation:* a standalone executable installed by the Free
    Pascal installer; invoked as `fpc <filename>.pas`.
  - *Its use:* this is the program that turns the `.pas` file you type
    in this lesson into a runnable `.exe`.

---

## Installing Free Pascal

Download the Windows installer from the project's official site:
`https://www.freepascal.org/download.html`. Pick the Windows 64-bit
installer under the "Downloads" section (currently under the "Stable
release" heading). Run the installer and accept the defaults — the
default install adds `fpc` to your PATH automatically.

If you already use Chocolatey as a package manager, the community
package `choco install fpc` is a known alternative — but the installer
above is the more reliably up-to-date path, so prefer it if you're
unsure.

Once installed, open a **new** PowerShell window (PATH changes only
apply to windows opened after the install) and confirm the compiler is
reachable:

```powershell
fpc -iV
```

A working install prints just a version number, something like `3.2.2`,
with no error about `fpc` not being recognized. If PowerShell instead
says `fpc is not recognized as the name of a cmdlet...`, the installer
did not add itself to PATH — close and reopen PowerShell first; if that
doesn't fix it, the install folder's `bin` subfolder needs to be added
to PATH manually via Windows' "Edit environment variables" settings.

## Writing and Running Your First Program

Create a file named `hello.pas` with exactly this content:

```pascal
program Hello;
begin
  writeln('Hello, Pascal!');
end.
```

Every Pascal program follows this same three-part shape. `program
Hello;` names the program — required, and the name here (`Hello`) is
arbitrary, chosen to match the file's purpose, not the filename itself.
`begin` and `end.` bracket the program's executable statements — note
the **period** after the final `end`, not a semicolon; that period
specifically marks the end of the *entire program*, distinct from every
other `end` you'll write later in this series (which mark the end of a
smaller block, like a procedure, and use a semicolon instead).
`writeln` is a built-in procedure that writes text to the console and
then moves to a new line — available automatically in every Free Pascal
program, with no import needed.

Compile it from the same folder:

```powershell
fpc hello.pas
```

This produces `hello.exe` in the same folder, along with a couple of
intermediate files (`hello.o`, `hello.ppu` on some setups) — those are
compiler bookkeeping files, safe to ignore. Run the result:

```powershell
.\hello.exe
```

Expected output:

```
Hello, Pascal!
```

I have not run this compile-and-run cycle myself this session — this
is the standard, well-established Free Pascal "hello world" shape, but
you should run it yourself to confirm your own install actually works
before moving on.

## Try It Yourself

- Change the text inside `writeln('...')` to something else, recompile
  with `fpc hello.pas`, and re-run `.\hello.exe` — confirm you see your
  new text, not the old one (a stale `.exe` from a forgotten recompile
  is a common early mistake).
- Add a second `writeln('...');` line before `end.` and confirm both
  lines print, in order, on separate lines.

**Next:** `lesson-1-variables-and-types.md`
