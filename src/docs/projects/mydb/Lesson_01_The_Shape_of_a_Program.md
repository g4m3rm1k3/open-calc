# Lesson 1: The Shape of a Program Before It Becomes One
*(Compiling C++ and Writing Your First Durable Record)*

**What you will build.** A command-line program, `mydb`, that appends one
hardcoded student record to a file called `school.db`, then reads the
whole file back and prints it. On the surface this is barely more than
"hello world plus a text file." The transferable problem is bigger:
in Python, `python3 script.py` reads and runs your source in one step —
there is no separate compiled artifact. C++ can't do that. And once
you're writing bytes to a file that outlives the process, you're doing
the first, smallest version of what every real storage engine does:
turning something that lives in memory into something durable. Every
later lesson — pages, indexes, transactions, write-ahead logs — is a
more careful version of exactly what you'll do here by hand.

**What you need to know first.** Nothing — this is Lesson 1. You do
know Python, though, so where C++ is doing a familiar job (printing,
opening a file, looping) with unfamiliar rules, I'll say so explicitly;
and where it's a genuinely new idea with no Python equivalent (the
compile step itself), I'll say that too.

---

## Concept Unit: The Shape of a Runnable C++ Program

### The Problem

Run `python3 hello.py` and CPython reads your source file and executes
it, right then, in one process. There is no intermediate artifact —
nothing you could email someone and have them "just run" without also
sending them your `.py` file and a Python interpreter. C++ works
differently: the file you type is not a program. It's a *description*
of a program, in a language only a compiler understands. Before anything
can run, a separate tool has to translate that description into machine
code your CPU can actually execute, and save that translation as its own
file. Until you've done that translation step, `hello.cpp` cannot be run
at all — not slowly, not with a flag, not any way. This two-step
model — translate, then run the translation — is the first thing to get
comfortable with, because everything else in C++ assumes it.

### Introduce the Concept in Isolation

Throwaway file, `hello.cpp`:

```cpp
#include <iostream>

int main() {
    std::cout << "hello from C++";
    return 0;
}
```

Compiled and run:

```
$ g++ hello.cpp -o hello
$ ./hello
hello from C++
```

Notice what happened: the first command produced no visible output at
all — it silently created a new file named `hello`. The second command
is the one that actually ran anything, and it didn't touch `hello.cpp`
at all; it ran the *translated* file. That's the proof this is a
two-step process, not one: you can delete `hello.cpp` right now and
`./hello` still runs, because the executable no longer depends on the
source it came from.

### Discard the Throwaway Example

`hello.cpp` and the `hello` executable it produced are scratch work.
Neither will appear in the project again — from here on, all code goes
into the real project file, `mydb.cpp`.

### Project Change

- **Files affected:** `mydb.cpp` — new file.
- **Change type:** create.
- **Location:** n/a — nothing exists yet to locate a position within.
- **Dependencies:** a C++ compiler (`g++`), already confirmed installed.

### The New Code

```cpp
#include <iostream>

int main() {
    std::cout << "mydb starting up";
    return 0;
}
```

### The Updated Project

This *is* the whole file — there's no larger enclosing structure to
return to yet, since `mydb.cpp` didn't exist a moment ago. That's exactly
the case where this step is skipped, per the schema: a brand-new file
has nothing to locate a position within. `mydb.cpp` right now is a
single function, `main`, that prints one line and exits successfully.

### Mechanical Walkthrough

Going through every element in order:

- `#include <iostream>` — **first appearance.** A *preprocessor
  directive*: before compilation proper begins, the compiler literally
  pastes in the contents of a header file named `iostream`, which
  declares the input/output tools (`std::cout` among them) used below.
  Without this line, `std::cout` is a compile error — the compiler has
  no idea what it is. Python's rough equivalent is `import`, but the
  mechanism is different: Python imports a module *object* at runtime;
  `#include` pastes in *text* before your code is even compiled.
- `int main()` — **first appearance.** Every C++ program must have
  exactly one function named `main` — it's the entry point; when you run
  the executable, execution starts here and nowhere else. The `int`
  means this function reports back a whole-number result when it
  finishes (that's what `return 0;` supplies). Python scripts don't
  require a named entry-point function — this is a hard C++ rule with no
  Python equivalent.
- `{` / `}` — basic syntax, already familiar in spirit as "a block" even
  coming from Python's indentation-based blocks — not re-explained.
- `std::cout` — **first appearance.** An object representing "standard
  output" — your terminal. The `std::` prefix means it lives in the
  *standard library's namespace*, a naming container that keeps the
  library's names from colliding with your own; you'll see plain `cout`
  again later once we discuss namespaces properly, but for now,
  `std::cout` is the whole name.
- `<<` — **first appearance.** The *stream insertion operator*. It sends
  whatever's on its right into the stream on its left. Read `std::cout
  << "text"` as "insert this text into standard output," not as a
  function call — there are no parentheses because this is an operator,
  the same category as `+` or `*`, just redefined by the library to mean
  "send this data along."
- `"mydb starting up"` — a string literal; conceptually the same idea as
  a Python string literal, just double-quoted only in C++ (single quotes
  are reserved for individual characters). Basic, not re-explained
  further.
- `;` — **first appearance.** C++ statements end with a semicolon. Python
  uses line breaks; C++ uses this explicit terminator instead, which is
  why C++ statements can freely span multiple lines without a
  continuation character.
- `return 0;` — **first appearance.** Sends the value `0` back as
  `main`'s result. By convention, `0` means "the program succeeded";
  any other number signals a specific kind of failure to whatever
  launched it (your shell, a script, another program). Python scripts
  have this too — `sys.exit(0)` — but it's opt-in there; in C++, `main`
  returning a code is the normal, expected shape of the function.

### CS Lens

This is your first look at a **two-phase translation pipeline**:
source text → compiler → machine code, as a strictly separate step from
executing that machine code. This is also recognized in: assembling and
linking in every compiled language (Rust, Go, C); `.class` file
compilation in Java before the JVM runs it; even a spreadsheet's
formula bar being distinct from its computed cell value. The pattern —
"validate and transform a representation once, then run the transformed
result repeatedly and cheaply" — is one you'll meet again inside `mydb`
itself in Level 2, when a SQL query gets parsed once into a tree before
it's executed.

### SE Lens

The alternative to compiling would be an interpreted C++, which mostly
doesn't exist in mainstream use — and the reason is performance and
error-catching: a compiler can catch a huge class of mistakes (wrong
types, missing semicolons, unknown names) *before* a single instruction
runs, rather than discovering them mid-execution the way Python would.
The cost is friction: an edit-compile-run loop is slower than
edit-run, which is why real C++ projects invest early in fast build
tooling — something this project isn't dealing with yet at one file, but
will have to as `mydb.cpp` grows into many files.

### Commands

- `g++ hello.cpp -o hello` — invoke the GNU C++ compiler on `hello.cpp`;
  `-o hello` names the output executable `hello` (without `-o`, g++
  defaults to a file named `a.out`). Success looks like: no output at
  all, and a new file named `hello` appears.
- `./hello` — run an executable in the current directory. The `./` is
  required on Linux/macOS because, unlike Windows, the current directory
  isn't automatically searched for programs to run.

### Run It

```
$ g++ mydb.cpp -o mydb
$ ./mydb
mydb starting up
```

Confirmed — real compile, real run, real output above.

### One Sentence Connecting This to What Came Before

Nothing came before this — this line is the anchor everything else in
the curriculum builds on top of.

---

## Concept Unit: Storing Text — `std::string` and Writing to a File

### The Problem

`mydb` currently prints to the screen and forgets everything the moment
it exits. A database's entire job is the opposite of that: data has to
survive the process ending. The first move toward that is the simplest
possible one — write some text to a file on disk instead of to the
screen.

### Introduce the Concept in Isolation

Throwaway file, `write_test.cpp`:

```cpp
#include <iostream>
#include <fstream>
#include <string>

int main() {
    std::string line = "test line";
    std::ofstream out("scratch.txt");
    out << line << "\n";
    out.close();
    std::cout << "wrote it";
    return 0;
}
```

Run, then inspect the file it produced:

```
$ g++ write_test.cpp -o write_test
$ ./write_test
wrote it
$ cat scratch.txt
test line
```

The program's only screen output was `wrote it` — yet `scratch.txt` now
exists on disk with `test line` inside it, even after the process
exited. That's the proof: the data didn't just get printed, it got
*persisted* — a completely separate file, readable by any other program,
holding data this process no longer even has in memory.

### Discard the Throwaway Example

`write_test.cpp`, `write_test`, and `scratch.txt` are scratch work and
won't reappear. The real project writes into `school.db`, next.

### Project Change

- **Files affected:** `mydb.cpp` — modified.
- **Change type:** replace.
- **Location:** inside `main`, replacing the single `std::cout` line
  from Concept Unit 1.
- **Dependencies:** two new standard headers, `<fstream>` and
  `<string>`.

### The New Code

```cpp
std::string record = "1,Alice,20";

std::ofstream out("school.db", std::ios::app);
out << record << "\n";
out.close();
```

### The Updated Project

```cpp
#include <iostream>
#include <fstream>
#include <string>

int main() {
    std::string record = "1,Alice,20";        // ← new

    std::ofstream out("school.db", std::ios::app);  // ← new
    out << record << "\n";                    // ← new
    out.close();                               // ← new

    return 0;
}
```

`main` no longer prints a greeting — it now builds one hardcoded student
record as text, opens `school.db` for appending, writes the record into
it followed by a newline, and closes the file. Nothing is printed to the
screen at all yet; the whole visible effect of running this program is a
new or growing file on disk.

### Mechanical Walkthrough

- `#include <fstream>` — **first appearance.** The header declaring
  file-stream types (`ofstream`, `ifstream`, seen below and in the next
  unit). Same mechanism as `#include <iostream>` from Unit 1 — reused,
  not re-explained.
- `#include <string>` — **first appearance.** Declares `std::string`
  itself. You've used string *literals* (`"text"`) since Unit 1 without
  this header because literals are a built-in language feature; the
  `std::string` *type*, which can be stored in a variable and grown,
  requires this header explicitly.
- `std::string record = "1,Alice,20";` — **first appearance** of
  `std::string` as a variable type. This declares a variable named
  `record`, of type `std::string`, initialized to that text. Unlike a
  Python variable, which can hold any type and be reassigned to a
  different one later, `record` is now permanently a string — C++
  variables have a fixed type for their entire lifetime, decided at this
  declaration.
- `std::ofstream` — **first appearance.** "Output file stream" — an
  object representing a file opened for *writing*. Constructing it with
  `("school.db", std::ios::app)` opens that filename immediately.
- `std::ios::app` — **first appearance.** A flag meaning "append": if
  `school.db` already exists, new writes go after its existing content
  rather than erasing it first. This is the difference between a
  database growing and a database resetting itself every time you use
  it — worth getting right on day one.
- `out << record << "\n"` — reuses the `<<` stream-insertion operator
  from Unit 1 (basic reuse, not re-explained), but notice it's the
  *same* operator working on a *different* stream — `out` here instead
  of `std::cout`. That's the payoff of the design: "send this into a
  stream" is one idea that works identically whether the stream is your
  screen or a file.
- `"\n"` — **first appearance.** The newline escape sequence — a single
  character meaning "start a new line." Needed here because, unlike
  `std::cout` where a missing newline just runs into the next prompt,
  a file without newlines between records would be one unreadable line
  of glued-together data forever.
- `out.close();` — **first appearance.** Explicitly closes the file,
  which flushes any buffered writes to disk and releases the OS's file
  handle. Skipping this wouldn't necessarily lose data here — C++ closes
  open files automatically when a variable like `out` goes out of scope
  — but relying on that is fragile once files are held open across more
  code, so we're being explicit now while it's cheap to build the habit.

### CS Lens

This is your first act of **persistence** — moving state from volatile
memory (which the OS reclaims the instant the process ends) to a
durable medium (which survives it). Also recognized in: a text editor's
"save" button, a video game's save file, a web browser writing cookies
to disk, and — not coincidentally — the exact mechanism a real database
uses to survive a crash: nothing is safe until it's been written to a
disk, not just held in a variable.

### SE Lens

We chose `std::ios::app` (append) over the default (truncate, which
erases the file first) deliberately — the alternative, letting each run
wipe `school.db`, would make it impossible to ever accumulate more than
one record, defeating the entire point of a database. The cost of
appending instead is one this project will pay for several lessons: a
file that only ever grows, with no way yet to update or delete a
specific record without rewriting the whole file. That's real debt —
Level 3 (pages and indexes) exists specifically to pay it off.

### Commands

No new commands — same `g++ ... -o ...` and `./...` pattern as Unit 1,
just against `mydb.cpp`.

### Run It

```
$ g++ mydb.cpp -o mydb
$ ./mydb
$ cat school.db
1,Alice,20
```

Ran twice in a row to confirm append behavior, not overwrite:

```
$ ./mydb
$ ./mydb
$ cat school.db
1,Alice,20
1,Alice,20
```

Two runs, two lines — confirmed the file is genuinely accumulating data
rather than resetting.

### One Sentence Connecting This to What Came Before

Unit 1 got a program running at all; this unit gave that program
something worth running for — data that outlives it.

---

## Concept Unit: Reading It Back — `ifstream`, `getline`, and Looping Until Done

### The Problem

`school.db` now holds real data, but a database that can only write and
never read is useless. `mydb` needs to open that same file back up and
retrieve what's in it — and since it doesn't know in advance how many
records are in the file, it needs a way to keep reading *until there's
nothing left*, not a fixed number of times.

### Introduce the Concept in Isolation

Throwaway file, `read_test.cpp`, against a throwaway three-line text
file:

```cpp
#include <iostream>
#include <fstream>
#include <string>

int main() {
    std::ifstream in("scratch2.txt");
    std::string line;
    while (std::getline(in, line)) {
        std::cout << "got: " << line << "\n";
    }
    return 0;
}
```

Run against a file containing `line one`, `line two`, `line three`:

```
$ ./read_test
got: line one
got: line two
got: line three
```

Three lines in the file, three lines of output, each one round-tripped
through the `line` variable — proof the loop is reading every record
present and then correctly stopping, without being told in advance how
many there were.

### Discard the Throwaway Example

`read_test.cpp` and `scratch2.txt` are scratch work. The real project
reads `school.db`, next — the same file Unit 2 just wrote into.

### Project Change

- **Files affected:** `mydb.cpp` — modified.
- **Change type:** add.
- **Location:** inside `main`, immediately after `out.close();` from
  Concept Unit 2, before `return 0;`.
- **Dependencies:** none beyond what's already included.

### The New Code

```cpp
std::ifstream in("school.db");
std::string line;
while (std::getline(in, line)) {
    std::cout << line << "\n";
}
```

### The Updated Project

```cpp
#include <iostream>
#include <fstream>
#include <string>

int main() {
    std::string record = "1,Alice,20";

    std::ofstream out("school.db", std::ios::app);
    out << record << "\n";
    out.close();

    std::ifstream in("school.db");                  // ← new
    std::string line;                                // ← new
    while (std::getline(in, line)) {                 // ← new
        std::cout << line << "\n";                   // ← new
    }                                                 // ← new

    return 0;
}
```

`main` now does the full round trip in one run: it appends one hardcoded
record to `school.db`, then immediately reopens that same file for
reading and prints every line it contains — including every record any
*previous* run has ever appended, not just this run's.

### Mechanical Walkthrough

- `std::ifstream` — **first appearance**, mirrors `std::ofstream` from
  Unit 2 as the reading counterpart: "input file stream." Constructing
  it with `("school.db")` opens that file for reading.
- `std::string line;` — reuses the `std::string` type from Unit 2 (basic
  reuse), but notice this declaration has no `=` initializer — it starts
  as an empty string, meant to be overwritten on each loop pass rather
  than holding one fixed value.
- `while (...)` — **first appearance.** A loop that keeps re-running its
  block for as long as the condition in parentheses evaluates to true,
  re-checking that condition before every pass, including the very
  first. Python's `while` works the same way conceptually; the syntax
  difference is C++'s required parentheses around the condition and
  braces around the block instead of a colon and indentation.
- `std::getline(in, line)` — **first appearance.** A function that reads
  one line of text from the stream `in`, stores it into the variable
  `line`, and — this is the part making it work as a loop condition —
  returns something that behaves as `true` if a line was successfully
  read, and `false` once the stream has run out of lines. That dual job
  (read AND report success/failure) is exactly why it can sit directly
  inside a `while(...)` condition: the condition check and the read are
  the same call.
- `std::cout << line << "\n";` — reuses `std::cout` and `<<` from Unit 1
  and `"\n"` from Unit 2 — no new concepts, just familiar tools
  operating on a new variable.

**Execution trace** — this loop carries state across iterations, so
here's what actually happens against a `school.db` holding two records:

```
Before loop: line = "" (empty)

Iteration 1: getline(in, line) reads "1,Alice,20" into line → true
             prints: 1,Alice,20
Iteration 2: getline(in, line) reads "1,Alice,20" into line → true
             prints: 1,Alice,20
Iteration 3: getline(in, line) finds no more lines → false
             loop exits, line's leftover value is discarded
```

### CS Lens

This is a **sentinel-controlled iteration**: a loop whose stopping
condition is discovered by the act of trying to read, not decided in
advance. Also recognized in: reading a network socket until the
connection closes, reading rows from a real SQL query's result set one
at a time, a `for` loop over a Python iterator hitting `StopIteration`,
and a card dealer dealing until the deck runs out rather than counting
cards first.

### SE Lens

The alternative — reading the file's line count first, then looping
that many times — would require an entirely separate pass over the file
just to count, or trusting a stored count that could get out of sync
with the file's real contents. `getline`'s "keep going until it tells
you to stop" avoids that whole class of bug by never trusting a count
at all; the tradeoff is that this only works cleanly for streaming
reads front-to-back — it gives you no way to jump to record #47 without
reading the 46 before it, which is exactly the problem Level 3's
indexes exist to solve.

### Commands

No new commands.

### Run It

```
$ g++ mydb.cpp -o mydb
$ rm -f school.db
$ ./mydb
1,Alice,20
$ ./mydb
1,Alice,20
1,Alice,20
```

Confirmed: each run appends one record, then prints the full accumulated
file — the second run correctly shows both the old record and the new
one.

### One Sentence Connecting This to What Came Before

Unit 2 proved data could survive the process ending; this unit proved
`mydb` can prove it too, by reading back exactly what it — or any prior
run of itself — wrote.

---

## Closing

**Connect the pieces.** Follow one value, `"1,Alice,20"`, through the
whole lesson: it's declared as a `std::string` in memory (Unit 2) →
written through `std::ofstream` with the `app` flag into `school.db` on
disk, surviving the process exit (Unit 2) → on the very next line of the
*same* run, reopened through `std::ifstream` (Unit 3) → pulled back into
memory one line at a time by `getline` inside a `while` loop (Unit 3) →
printed to the screen through the same `std::cout << ` mechanism the
lesson opened with (Unit 1). One string, four different states: typed
literal, in-memory variable, bytes on disk, and printed output.

**What breaks without this.** Comment out `out.close();` and, instead,
try opening `in` on `school.db` *before* `out` is ever created, by
moving the `ifstream in("school.db");` line to the very top of `main`,
above the `ofstream`:

```
$ g++ mydb.cpp -o mydb
$ ./mydb
(school.db)                  ← this run prints nothing at all
```

The read happens before the write, so the file is opened for reading
either before it exists or before this run's record has landed in it —
proving the ordering in this lesson isn't arbitrary: write, close, *then*
read is a required sequence, not a style choice. Restore the original
order before continuing.

**Exercises.**
1. Change the hardcoded record to a second student, e.g. `"2,Bob,22"`,
   and run `mydb` twice. Confirm `school.db` ends up with three lines
   total in the order you'd expect.
2. Delete `school.db` entirely (`rm school.db`) and run `mydb` once.
   Does it error, or does `std::ofstream`'s `app` mode handle a
   not-yet-existing file gracefully? Predict first, then check.
3. Remove the `std::ios::app` flag entirely (leave just
   `std::ofstream out("school.db");`) and run `mydb` twice in a row.
   Explain, in a sentence, exactly why the second run's output differs
   from what you saw with `app` in place.

**Definition of done.**
- [ ] `mydb.cpp` compiles cleanly with `g++ mydb.cpp -o mydb -Wall` —
      no warnings.
- [ ] Running `./mydb` twice shows two accumulated lines in `school.db`,
      not one.
- [ ] You can explain, without looking back at this lesson, why
      compiling and running are two separate steps in C++ but one step
      in Python.
- [ ] You've completed at least exercise 1 above.
- [ ] Initialize a git repo if you haven't (`git init`), then:
      ```
      git add mydb.cpp
      git commit -m "Add mydb: append and read back one hardcoded record

      This is the smallest possible proof that state can survive process
      exit — the foundation every later storage feature (multiple
      records, pages, indexes) builds on top of."
      ```
      Note what the message explains: not *what* changed (git already
      shows that in the diff) but *why it matters* — the habit this
      project will keep asking you to build.
