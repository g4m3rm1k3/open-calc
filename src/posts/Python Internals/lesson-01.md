# Lesson 1: Giving a Value a Home in Memory

**What you will build:** A tiny C program that creates one value, gives it a
name and a type of its own (a `struct`), and prints the actual memory
address where that value lives. The working feature is a program that
prints a number and a hex address. The transferable problem this lesson is
actually about: in C, a value doesn't just exist in the abstract the way it
feels like it does in Python — it occupies a specific, printable location
in your computer's memory, and everything CPython does with a Python object
later in this curriculum is built on that same fact.

**What you need to know first:** Nothing. This is Lesson 1.

**Terms used in this lesson**

- **preprocessor directive** — a line starting with `#`, handled by a
  separate pass (the *preprocessor*) before your code is even compiled. It
  exists because C programs are built from many small pieces, and something
  has to pull the pieces together into one file before compilation can
  start; `#include` is how you pull in another file's declarations.
- **`int`** — a C type name: whole numbers, and, by long-standing
  convention, also the type a C function uses to report "how did I go" to
  whatever called it (0 usually means success). C makes you write a type
  name in front of every value: unlike Python, where a name can hold
  anything, C decides at compile time how much memory a value needs and
  what operations are legal on it, and it can only do that if you say the
  type up front.
- **`void`** — a type name meaning "no value." It exists so C has a way to
  say, in the same type-annotated syntax everything else uses, "this
  function takes no arguments" or "this function returns nothing" — a
  placeholder for the absence of a value, not a value itself.
- **`long`** — another C type name: a whole number, guaranteed by the
  language to be at least as big as `int` (often bigger, depending on the
  machine). It exists because a single `int` isn't always wide enough for
  every whole number a program needs to store; `long` is the "give me more
  room" version.
- **`struct`** — a keyword that defines a new type by naming a fixed group
  of other values (called *fields* or *members*) that travel together as
  one unit. It exists because a raw number sitting alone in memory has no
  way to say what it *means* or what it belongs with; a `struct` is C's way
  of saying "these particular values are one thing," which is the same job
  Python's own objects are doing constantly, just made explicit and
  manual here instead of automatic.
- **format specifier** — a `%`-prefixed placeholder inside a string passed
  to `printf` (`%d`, `%ld`, `%p`), telling `printf` how to read and display
  one of its extra arguments. It exists because C's `printf` has no way to
  inspect an argument's type at runtime the way Python's `print` does —
  you, the programmer, have to state the type yourself, in the format
  string, or `printf` will misread the bytes you handed it.
- **address-of operator (`&`)** — placed before a variable name, this asks
  C for that variable's actual memory address instead of its value. It
  exists because most of the time you want a variable's value, but
  sometimes — printing where something lives, or, in a later lesson,
  handing a variable to something that needs to modify it directly — you
  need the location itself, and C needs a distinct piece of syntax to ask
  for that instead.
- **cast (`(void *)`)** — writing a type name in parentheses in front of a
  value, telling the compiler "treat this value as this other type from
  here on." It exists because C is strict about types, and `printf`'s `%p`
  specifier is documented to expect specifically a `void *` (a "pointer to
  an unspecified type") — so a pointer of any other, more specific type has
  to be explicitly converted before it's safe to hand to `%p`.

**Objects and methods used**

- **`main`**
  - *What it is:* the one specially-named function every C program must
    define, and the only function the operating system itself knows how to
    start a C program at.
  - *Implementation:* `int main(void) { ... return 0; }` — takes no
    arguments (`void`), returns an `int` back to the operating system.
  - *Its use:* this lesson's whole program has to start running somewhere;
    C's answer to "where" is always a function named exactly `main`.
  - *Type:* a function definition — not a class, not a variable; a named,
    callable block of code, written directly at the top level of the file
    rather than inside anything else.
  - *Responsibility:* to be the single, unambiguous starting point of the
    program, and to hand the operating system a number summarizing whether
    the program's run succeeded or failed, once every other statement in it
    has finished.
  - *Depends on:* nothing from within this program — it is called by the
    operating system's own process-launching machinery, not by any code
    this lesson writes.
  - *Connects to:* every other function or statement in this file executes
    because `main` reaches it, directly or indirectly; `main` itself is
    called by the OS loader, and its `return` value flows back out to
    the OS (visible, on this machine, as the shell's `$?`).
  - *Shape:* takes nothing in (here); hands back exactly one whole number —
    never a string, never a struct, never nothing at all, even though the
    body can be arbitrarily long.

- **`printf`**
  - *What it is:* a function from C's standard library (declared in
    `stdio.h`, which is why this lesson's code starts with
    `#include <stdio.h>`) that writes formatted text to the terminal.
  - *Implementation:* `int printf(const char *format, ...);` — takes a
    format string first, then any number of additional arguments
    (the `...`) whose types must match the `%`-placeholders inside that
    format string; returns an `int` (the count of characters written,
    unused in this lesson).
  - *Its use:* this lesson's code needs to show a value and an address on
    the screen, and `printf` is C's standard way to turn in-memory values
    into readable text.
  - *Type:* a standard-library function — real code, shipped with the
    compiler's C library, not a language keyword and not something this
    lesson's own file defines.
  - *Responsibility:* to read its format string left to right, and for
    every `%`-specifier it finds, consume the next extra argument, convert
    it to text according to that specifier, and write the result to the
    terminal — the whole job, not just "prints text."
  - *Depends on:* a format string, and exactly as many extra arguments as
    that string has `%`-specifiers, each one of the type that specifier
    expects — `printf` has no way to check this at compile time in
    standard C, which is why a mismatched specifier is a real, silent bug
    class, not just a style concern.
  - *Connects to:* called directly by `main` in this lesson; internally, it
    calls further into the C library and ultimately the operating system's
    own facility for writing bytes to the terminal — machinery this lesson
    doesn't open up, since it isn't this lesson's subject.
  - *Shape:* input is one format string plus a flat list of scalar values
    (an `int`, a `long`, a pointer — never a struct passed as a single
    `%`-argument); output is plain text written to the terminal, plus a
    now-unused `int` count handed back to the caller.

---

## Concept Unit: Compiling and Running a C Program

### The Problem

Python code runs the moment you type `python3 myfile.py` — there's no
separate "build" step you have to think about. C doesn't work that way: a
`.c` file is just text until something turns it into a program the
operating system can actually execute. Before this lesson's real project
can do anything, you need to know what that "turning text into a program"
step actually is, and what the smallest possible C program even looks
like.

Before reading on: if you've ever run a Python script from a terminal,
what do you think the *equivalent* step for C might be called? Python
source is read and run by one program (`python3`) every time you execute
it — what would change if, instead, that reading-and-translating step
happened once, up front, and produced a separate, reusable file? What
would you expect that separate file to be able to do that a `.py` file by
itself cannot?

### Isolating the Concept

Here is the smallest possible complete C program:

```c
#include <stdio.h>

int main(void) {
    printf("hello, %d\n", 42);
    return 0;
}
```

This was compiled and actually run, not predicted:

```
$ gcc -Wall -o lab1_hello lab1_hello.c
$ ./lab1_hello
hello, 42
```

Two separate steps happened here, and it matters that they're separate.
`gcc -Wall -o lab1_hello lab1_hello.c` is the **compile** step: it reads
`lab1_hello.c` as plain text and produces a new file, `lab1_hello`, which
is not text at all — it's a binary the operating system knows how to load
directly into memory and run. `./lab1_hello` is a completely separate
**run** step: it doesn't touch the `.c` file at all anymore; it asks the
operating system to execute the binary that the compile step already
produced. This is called **compiling**: translating source text into a
standalone, directly-executable program, once, before any running happens
— unlike Python, where translation and running are interleaved every time
you invoke the interpreter.

What this proves: the text in `lab1_hello.c` and the program that actually
ran are two different files on disk, produced by two separate commands —
compiling is a real, distinct step in C, not something that happens
invisibly at run time the way it does when you type `python3 myfile.py`.

This throwaway example is now **discarded** — `lab1_hello.c` will not
appear in this lesson's real project again. What it taught (how `main`,
`printf`, and the compile-then-run sequence work) is about to be used for
real, but this exact file isn't kept.

### Project Change

- **Reference Source** — No reference counterpart. This is a from-scratch
  addition: this lesson exists to establish the minimum C mechanics a
  Python developer needs before any real CPython source is introduced.
  Lesson 2 is the first lesson to quote real CPython source
  (`Py_INCREF`).
- **Files affected** — `project/lesson-01/mini_object.c`, created.
- **Change type** — add (brand-new file).
- **Location** — n/a; this is the file's entire initial content.
- **Dependencies** — a working C compiler (`gcc`), confirmed above.

### The New Code

```c
#include <stdio.h>

int main(void) {
    return 0;
}
```

### The Updated Project

This new file has nothing surrounding it yet — it *is* the whole file, so
there's no larger enclosing structure to return to and re-show (per this
schema's own rule: Project Change already covers this case, since a
brand-new file has nothing to locate a position within).

### Mechanical Walkthrough

Every distinct syntactic element in the New Code block above, in order:

- **`#include <stdio.h>`** — a preprocessor directive: before compilation
  proper begins, the preprocessor literally pastes the declarations from
  the C standard library's `stdio.h` header file into this file, in place
  of this line. Without it, this file would have no declaration of what
  `printf` even is, and later in this lesson, when `printf` is actually
  called, the compiler would refuse to compile the file — it insists on
  seeing a function's declared shape before you call it, unlike Python,
  which only discovers a name is missing when the line that uses it
  actually executes.
- **`int main(void)`** — the declaration of the `main` function described
  in full in this lesson's Header, above: `int` states that this function
  will hand back a whole number when it finishes: `main` is the required
  name the operating system looks for to start the program; `(void)`
  states that this function accepts no arguments at all.
- **`{` and `}`** — these braces mark the start and end of `main`'s body —
  the block of statements that runs when `main` is called. This is not
  being decomposed further because it's ordinary block-delimiting syntax
  that rides along with the function it belongs to, not a concept in its
  own right (per this schema's own Stopping Rule).
- **`return 0;`** — the `return` keyword hands a value back to whatever
  called this function, and immediately ends the function's execution;
  `0` is that value. Per this lesson's Header, `main`'s return value is
  read by the operating system as a status code, and `0` is the
  long-standing C convention for "this program finished without error" —
  a convention `printf`, the C library, and the shell all share, which is
  why a nonzero return here would make `./mini_object`'s own exit status
  (visible via `$?` in a shell) read as failure even though nothing
  actually went wrong inside the program.

### CS Lens

Compiling — translating one complete representation of a program into a
different, more directly-executable representation, as a distinct step
performed once before any execution happens — is a real, recurring
computer-science idea, not just "how C happens to work." It's worth
naming several unrelated places the same idea shows up, so it reads as a
pattern rather than a C quirk:

```
Also recognized in: assemblers turning assembly text into machine code,
JIT compilers in browsers turning JavaScript into native code the first
time a function gets hot, regex engines compiling a pattern string into
an internal matching program before the first match attempt, LaTeX
compiling a .tex file into a .pdf, and — directly relevant to where this
curriculum is headed — CPython itself compiling your .py source into
bytecode before its evaluation loop ever runs a single instruction of it.
```

### SE Lens

The design principle here is **separating translation from execution**.
The alternative — reading and interpreting C source directly, line by
line, the way Python's own interpreter does with `.py` files — was not
chosen for C, and the real tradeoff is speed versus convenience. A
compiled binary runs fast, every time, because all the work of figuring
out what the code means happened once, in advance; but that convenience
cost is real: you cannot casually type C statements into a live prompt
and see them run immediately the way you can with `python3` alone (some
tools approximate this, but it isn't C's normal mode), and every change
to a `.c` file requires a full recompile before you can see its effect.
This curriculum is not currently carrying any debt from this choice — for
a lesson this small, the cost of recompiling is negligible — but it's the
same tradeoff that, at real project scale, is why C and C++ build systems
exist as a whole separate discipline that Python projects mostly don't
need.

### Commands Needed

- **`gcc -Wall -o mini_object mini_object.c`** — `gcc` is the GNU
  Compiler Collection, the specific compiler used throughout this
  curriculum. `-Wall` turns on (`W`) all (`all`) of the compiler's
  common warnings — without it, real mistakes (like the `printf`
  format-specifier mismatches this lesson's Header warned about) can
  compile silently and only misbehave later, at run time. `-o
  mini_object` names the output binary `mini_object` explicitly; without
  `-o`, `gcc` would default to naming it `a.out`, a name with no
  connection to this project. `mini_object.c` is the source file being
  compiled. Success looks like the command producing no output at all
  and creating a new file named `mini_object` in the current directory.
- **`./mini_object`** — runs the just-built binary. The leading `./`
  is required on this system because the current directory usually isn't
  on the shell's search path for executables; without it, the shell
  would report that no command named `mini_object` was found, even
  though the file exists right there.

### Run It

This was actually compiled and run this session, not predicted:

```
$ gcc -Wall -o mini_object mini_object.c
$ ./mini_object
$ echo $?
0
```

No output prints yet — this version of `main` does nothing but return —
which matches the New Code exactly: the only statement in the function
body is `return 0;`. The exit code confirms the return value made it all
the way back out to the shell.

### Connecting to What Came Before

This is the very first Concept Unit in this curriculum — there is nothing
earlier yet to connect it to. Concept Unit 2, immediately below, connects
back to this one directly: it grows this exact file.

---

## Concept Unit: Grouping Values with a Struct

### The Problem

`mini_object.c` can currently hold a return code and nothing else — there's
no place in it to put an actual value, let alone a value that has a name of
its own the way a Python object does. In Python, `x = 99` gives `99` a
name and, invisibly, a home in memory that Python manages for you. C
requires you to be explicit about both halves of that.

Before reading on: in the throwaway `lab1_hello.c` example from the
previous unit, `42` was just typed directly into the `printf` call, with
no name of its own. If you wanted to give that `42` a name — say `x` — and
also record that it was specifically *this program's kind of value*, not
just any number floating around, what would you need C to let you write?
What's the C equivalent of Python quietly building a box in memory the
moment you write `x = 99`?

### Isolating the Concept

```c
#include <stdio.h>

struct Point {
    int x;
    int y;
};

int main(void) {
    struct Point p;
    p.x = 3;
    p.y = 7;
    printf("p.x = %d, p.y = %d\n", p.x, p.y);
    return 0;
}
```

Actually compiled and run:

```
$ gcc -Wall -o lab2_struct lab2_struct.c
$ ./lab2_struct
p.x = 3, p.y = 7
```

`struct Point { int x; int y; };` defines a brand-new type named
`Point`, made of two `int` fields that always travel together, named `x`
and `y`. `struct Point p;` then creates one real, concrete `Point` —
called a variable, or, in the vocabulary this whole curriculum is
building toward, an *instance* of that type — and gives it the name `p`.
`p.x = 3;` and `p.y = 7;` use the `.` (dot) operator to reach into `p` and
set each of its two fields individually. The final `printf` reads both
fields back out, through the same `.` syntax, and the real output above
confirms both values survived being set individually and read back
together as one unit. This is called a **struct** — or, in the broader
computer-science vocabulary this curriculum will keep coming back to, a
**product type**: a new type built by grouping several existing values
together as fixed, named fields of one larger whole.

This throwaway example is now **discarded** — `lab2_struct.c`, and the
`Point` type specifically, will not appear in this lesson's real project.
What it proved — that a `struct` groups named fields into one addressable
unit, settable and readable field-by-field through `.` — is exactly what
the real project needs next, using a different, purpose-built type
instead of `Point`.

### Project Change

- **Reference Source** — No reference counterpart yet. `struct Point` and
  the `MiniObject` struct this unit is about to add are both from-scratch
  teaching constructs; this lesson still precedes any real CPython source
  quotation. Lesson 4 ("Every Object's Real Header") is where this
  curriculum first shows CPython's actual object struct
  (`PyObject`/`PyVarObject`, from `Include/object.h`) side by side with
  what this lesson's `MiniObject` was a simplified stand-in for.
- **Files affected** — `project/lesson-01/mini_object.c`, modified.
- **Change type** — add (a new struct definition, and new statements
  inside `main`).
- **Location** — the struct definition goes above `main`, in the same
  position `struct Point` occupied in the throwaway lab above; the new
  statements go inside `main`'s existing body, which currently contains
  only `return 0;` from Concept Unit 1.
- **Dependencies** — none beyond what Concept Unit 1 already established.

### The New Code

```c
struct MiniObject {
    long value;
};
```

```c
struct MiniObject thing;
thing.value = 99;

printf("thing.value = %ld\n", thing.value);
printf("thing lives at address %p\n", (void *)&thing);
```

### The Updated Project

```c
 1  #include <stdio.h>
 2
 3  struct MiniObject {              // ← new
 4      long value;                  // ← new
 5  };                                // ← new
 6
 7  int main(void) {
 8      struct MiniObject thing;                              // ← new
 9      thing.value = 99;                                     // ← new
10
11      printf("thing.value = %ld\n", thing.value);           // ← new
12      printf("thing lives at address %p\n", (void *)&thing);// ← new
13
14      return 0;
15  }
```

`main` now does real work: it creates one `MiniObject` named `thing`
(line 8), gives its single field a value (line 9), and prints both that
value and the memory address where `thing` itself actually lives
(lines 11–12), before returning success exactly as it did at the end of
Concept Unit 1 (line 14, unchanged).

### Mechanical Walkthrough

- **`struct MiniObject { long value; };`** — defines a new type,
  `MiniObject`, with exactly one field, `value`, of type `long` (per this
  lesson's Header: a whole number with more guaranteed range than a plain
  `int`). This is the same `struct` construct explained in full in this
  unit's isolated lab above: a new type built by grouping named fields
  into one unit. Here there's only one field instead of `Point`'s two —
  proof that a struct doesn't need multiple fields to be useful; even a
  one-field struct is a real, distinct type from the bare `long` it
  wraps, which matters because it means `thing` below has an identity and
  a type of its own, not just a number sitting loose.
- **`struct MiniObject thing;`** — creates one real, concrete
  `MiniObject`, named `thing` — an instance of the type just defined, the
  same relationship `struct Point p;` had to `struct Point` in the
  isolated lab above.
- **`thing.value = 99;`** — the `.` (dot) operator, already explained in
  this unit's isolated lab, reaches into `thing` and sets its one field to
  `99`. This is the first time in this curriculum a value has been placed
  inside something with both a name and a type of its own, rather than
  being handed directly to `printf` as a bare literal the way `42` was in
  Concept Unit 1's throwaway example.
- **`printf("thing.value = %ld\n", thing.value);`** — calls `printf`
  (given its full CRC treatment in this lesson's Header, above) with a
  format string containing the `%ld` format specifier from this lesson's
  Header: `l` states the following value is `long`-sized, not plain
  `int`-sized, and `d` states it should be displayed as a decimal whole
  number. `thing.value` reads the field back out through the same `.`
  operator used to set it. Getting `%ld` right instead of `%d` matters
  because `printf` has no way to check, on its own, that the argument
  you handed it actually matches the specifier — a mismatch here would
  compile (with `-Wall`, it would at least warn) but could print garbage
  at run time, since `printf` would read the wrong number of bytes off
  the argument.
- **`printf("thing lives at address %p\n", (void *)&thing);`** — a
  second, separate call to `printf`, not a continuation of the line
  before it. `%p`, from this lesson's Header, is the format specifier for
  printing a memory address in the implementation-defined hexadecimal
  form C compilers conventionally use. `&thing` is the address-of
  operator from this lesson's Header, applied to `thing` itself (not one
  of its fields) — it asks C for the actual memory location where `thing`
  lives, rather than the value stored there. `(void *)` is the cast from
  this lesson's Header: `&thing` on its own has the more specific type
  "pointer to a `struct MiniObject`," but `%p` is documented to expect
  specifically a `void *` — a pointer with no particular type attached —
  so the cast explicitly converts one pointer type to the other before
  handing it to `printf`; skipping the cast would still often work on a
  given machine, but only because pointers are usually the same size
  underneath, not because it's guaranteed correct.

### Execution Trace

This code has no loop, no recursion, and no state carried across steps —
it's a straight sequence of statements, each running once — so per this
schema's own Verification Rule, no `Iteration N:` trace or numbered
timing trace is needed here; a step-by-step trace exists to explain
*why* a value changed across repeated or delayed execution, and nothing
here repeats or is deferred.

### CS Lens

`struct` is this unit's hard concept, and its recognized name in computer
science more broadly is a **product type** (or, in many languages,
*record*): a new type formed by combining a fixed set of other types,
where a value of the new type genuinely needs all of the fields present
at once to be complete.

```
Also recognized in: a row in a SQL database table (each column is a
field with its own type); a JSON object (each key is a field, though
JSON's fields are untyped at the language level); a network packet
header (fixed fields like source address, destination address, and
length, packed together in a defined order); and, directly ahead in
this curriculum, every Python object's own internal representation —
CPython represents a Python object, underneath, as exactly this kind of
grouped-fields struct, which Lesson 4 shows for real.
```

### SE Lens

The design principle is **grouping related data under one name instead
of tracking it as separate, individually-named variables**. The
alternative not chosen here would have been two separate variables —
something like `long thing_value;` on its own, with no `struct` at all,
and, once this project grows to track more than one `MiniObject`, a
second separate variable for a second value, a third for a third, and so
on, each with its own made-up name. The real tradeoff: separate variables
avoid the small extra syntax of defining a `struct` up front, but they
give up the guarantee that fields belonging to the same conceptual object
actually travel together — nothing stops a future line of code from
updating one loose variable and forgetting a same the other, and nothing
in the language itself expresses that the two loose variables were ever
related at all. A `struct` makes that relationship a fact the compiler
itself knows, not just a convention in the programmer's head. This
project isn't carrying any debt from this choice yet — `MiniObject` has
only one field so far — but the very next lessons in this curriculum
grow it to more than one, which is exactly where the loose-variables
alternative would have started actively hurting.

### Commands Needed

No new commands — `gcc -Wall -o mini_object mini_object.c` and
`./mini_object`, from Concept Unit 1's Commands Needed section above,
build and run this unit's updated version of the same file unchanged.

### Run It

Actually compiled and run this session, not predicted:

```
$ gcc -Wall -o mini_object mini_object.c
$ ./mini_object
thing.value = 99
thing lives at address 0x7ffdf5847f50
```

Run a second time, as a genuinely separate process, to check whether that
address is a fixed property of the program or something that can change:

```
$ ./mini_object
thing.value = 99
thing lives at address 0x7fff87987080
```

`thing.value` printed `99` both times, exactly as set on line 9 of the
Updated Project above — that part of the output is fully predictable from
the code alone. The address, though, is different on the two runs. That's
not a bug: modern operating systems deliberately place a program's stack
(where `thing` lives, since it's declared inside `main` with no special
placement) at a randomized location each time a process starts, as a
security measure. The address is real and specific — it's the literal
location in this machine's memory where this run's `thing` existed — but
it's only meaningful for the lifetime of that one run, not as a fixed
fact about the program itself.

### Connecting to What Came Before

Concept Unit 1 established the empty shell — a `main` that compiles and
returns successfully, with nothing inside it yet. This unit filled that
shell with the first real value this curriculum has created: `thing`, an
instance of a purpose-built type, with a field that can be set and read
back, and — new in this unit — a physical location in memory that can be
printed and inspected, the same way Python's own `id()` reports where a
Python object lives, which is exactly the connection the next lesson
builds on.

---

## Connect the Pieces

Follow one concrete value, `99`, through everything this lesson built,
start to finish:

1. Concept Unit 1 established that C code has to be compiled — translated
   by `gcc` into a standalone binary — before it can run at all, and set
   up the empty `main` function that everything else in this lesson runs
   inside of.
2. Concept Unit 2 defined `struct MiniObject`, a new type with one field,
   `value`, of type `long` — a container `99` could be placed inside,
   rather than being a bare literal typed directly into a function call
   the way `42` was in Concept Unit 1's throwaway example.
3. `struct MiniObject thing;` created one real instance of that type,
   named `thing`, and `thing.value = 99;` placed `99` specifically inside
   that instance's one field, using the `.` operator.
4. `printf("thing.value = %ld\n", thing.value);` read `99` back out of
   `thing` and printed it — confirmed for real, this session, as
   `thing.value = 99` in the terminal output above.
5. `printf("thing lives at address %p\n", (void *)&thing);` printed not
   `99` itself, but *where* the `thing` holding it actually sat in this
   machine's memory during this specific run — confirmed for real as
   `0x7ffdf5847f50` on the first run and a different address,
   `0x7fff87987080`, on the second.

That last step is the one this whole lesson was building toward: `99`
wasn't just a number that got printed — it was a value with a real,
physical home, one this lesson could point at and print the address of
directly. Python hides this from you by default, but it isn't actually
different underneath: `id(x)` on a real Python value returns exactly this
same kind of number.

```
$ python3 -c "x = 99; print(hex(id(x)))"
0xb36ce8
```

Python's own documentation describes this precisely: `id()` returns a
number "guaranteed to be unique and constant for this object during its
lifetime," and, as a CPython-specific implementation detail, that number
*is* the object's address in memory — the exact same kind of value this
lesson's `%p` printed for `thing`. Lesson 2 picks up from here: CPython
doesn't just place an object in memory the way `thing` is placed on the
stack in this lesson's code — it counts, continuously, how many places in
a running program are pointing at that same address, so it knows the
precise moment it's safe to reclaim it. That's reference counting, and
it's the very next concept this curriculum builds.
