# Lesson 0: Setting Up Perl

**What you will build:** A working Perl interpreter, confirmed by
running a minimal script two different ways, so every later lesson can
start directly on syntax instead of re-explaining installation.

**What you need to know first:** Nothing — this is the first lesson in
this series.

**Terms used in this lesson:**
- **Interpreter** — a program that reads your source code and executes
  it directly, one piece at a time, with no separate compile step
  producing a standalone `.exe` first. This is a specific, explicit
  contrast worth stating: Pascal (taught in this curriculum's other new
  series) is compiled — you run `fpc` to produce an `.exe`, then run
  that `.exe` separately. Perl has no such separate step: you run the
  `.pl` source file directly, every time, through the `perl` program.
- **Script** — the plain-text `.pl` file containing Perl code. Unlike a
  compiled Pascal program, this file itself is what gets run — there is
  no separate executable produced from it.
- **Shebang line** — a special first line in a script, starting with
  `#!` followed by a path to an interpreter, such as
  `#!/usr/bin/perl`. On Unix-like systems (Git Bash, WSL, Linux, macOS),
  this line tells the operating system which program should run the
  rest of the file when it's executed directly. On plain Windows
  (running `perl script.pl` from PowerShell), this line is not
  consulted at all — Windows already knows to use Perl because you
  typed `perl` explicitly — but it's still included by convention.
- **Pragma** — a directive to the Perl interpreter itself about how to
  process the rest of the file, rather than an instruction that does
  something when the program runs. `use strict;` and `use warnings;`,
  introduced below, are both pragmas.

**Objects and methods used:**
- **`perl`** —
  - *What it is:* the command-line Perl interpreter.
  - *Implementation:* a standalone executable installed by Strawberry
    Perl; invoked as `perl <filename>.pl`.
  - *Its use:* this is the program that reads and runs every `.pl` file
    in this series — there is no separate compile step to run first.
- **`print`** —
  - *What it is:* a built-in Perl function that writes text to the
    console.
  - *Implementation:* takes one or more values to print; unlike
    Pascal's `writeln`, it does **not** add a newline automatically —
    any newline has to be written explicitly, as `\n`, inside the text.
  - *Its use:* this lesson's script uses it to print a single greeting
    line, with `\n` added by hand to end that line.

---

## Installing Perl

Windows does not include Perl by default. Download **Strawberry Perl**
from its official site: `https://strawberryperl.com`. Download the
64-bit MSI installer and run it, accepting the defaults — it adds
`perl` to your PATH automatically. (Strawberry Perl is recommended over
other Windows Perl distributions specifically because it bundles a C
compiler and build tools, which some Perl packages need later — not
relevant yet in this lesson, but worth having from the start.)

If you already use Chocolatey, the community package
`choco install strawberryperl` is a known alternative — but the
installer above is the more reliably current path if you're unsure.

Open a **new** PowerShell window after installing (PATH changes only
apply to windows opened afterward) and confirm:

```powershell
perl -v
```

A working install prints several lines including a version number, for
example `This is perl 5, version 38...`. If PowerShell says
`perl is not recognized as the name of a cmdlet...`, either reopen
PowerShell fresh, or the installer didn't reach PATH and needs to be
added manually via Windows' "Edit environment variables" settings.

## Writing and Running Your First Script

Create a file named `hello.pl` with exactly this content:

```perl
#!/usr/bin/perl
use strict;
use warnings;

print "Hello, Perl!\n";
```

The first line is the shebang, explained above — included by
convention even though plain Windows won't read it. `use strict;`
tells Perl to require every variable to be explicitly declared (with
`my`, introduced in Lesson 1) before use — without it, Perl silently
allows typos in variable names to create new, empty variables instead
of raising an error, which is a common source of hard-to-find bugs.
`use warnings;` tells Perl to print a warning message for other
common mistakes (using an undefined value, for example) instead of
silently continuing. Both are pragmas, processed before the script
runs, not statements that do anything themselves. `print "Hello,
Perl!\n";` prints the text between the quotes; `\n` is an escape
sequence representing a newline character, required here because
`print` does not add one automatically.

Run it:

```powershell
perl hello.pl
```

Expected output:

```
Hello, Perl!
```

I have not run this myself this session — this is a standard,
well-established Perl "hello world" shape, but confirm it yourself
against your own install before moving on.

If you're working from Git Bash instead of PowerShell, and you make the
file executable-style, the shebang line becomes meaningful: `./hello.pl`
would work directly there, because Git Bash respects `#!` lines the way
Unix shells do. This series otherwise assumes PowerShell with the
explicit `perl hello.pl` form, which works identically in both.

## Try It Yourself

- Change the text inside the `print` string and re-run — confirm you
  see the new text.
- Delete the trailing `\n` from the `print` line, add a second `print
  "Goodbye!\n";` line after it, and run again — notice the first line's
  missing newline causes both `print` outputs to land on the same
  console line. This is a deliberate, common Perl beginner mistake to
  see once on purpose.

**Next:** `lesson-1-scalars-arrays-hashes.md`
