# Lesson 1: Where Your Variables Actually Live

- **What you will build** — A tiny command-line program, compiled and run
  yourself for the first time, that proves — using real, printed memory
  addresses — that some variables disappear the instant their function
  returns, while others survive until you explicitly say otherwise. The
  transferable problem: Python decides this for you, silently, every time.
  C++ makes you choose. That choice is the foundation the rest of this
  curriculum sits on — every data structure you build later is, underneath,
  a decision about which of these two places to put things.
- **What you need to know first** — Nothing beyond your existing Python
  fluency (variables, functions, `print`). No prior C++ exposure assumed.
  This is Lesson 1.
- **Pipeline diagram** — Not applicable yet. No multi-stage pipeline has
  been established in this curriculum.
- **Terms introduced in this lesson**
  - **`#include` directive** — em-dash: a line, processed before real
    compilation begins, that pastes the contents of another file (here, a
    standard library header) into this one. It exists because C++ code that
    uses `std::cout` needs to see its declaration somewhere first — the
    compiler cannot check that you're calling it correctly without that
    declaration in hand.
  - **stack** — a region of memory reserved automatically for each running
    function's local variables, cleaned up automatically the instant that
    function returns. It exists so that "ordinary," short-lived local data
    never needs manual cleanup code — the language handles the common case
    for free.
  - **heap** — a region of memory you request from and release yourself, at
    times you choose, independent of which function is currently running.
    It exists because some data legitimately needs to outlive the function
    that created it, or needs a size the compiler can't know in advance —
    the stack's automatic-cleanup model can't support either case.
  - **pointer** — a variable whose value is a memory address rather than
    an ordinary value like a number or character. It exists so code can
    refer to *where* a piece of data lives, which is the only way to reach
    heap data at all, since a heap value has no name of its own the way a
    stack variable does.
  - **address-of operator (`&`)** — a unary operator that, given a
    variable, produces the memory address where that variable is stored.
    It exists because you otherwise have no way to ask "where does this
    live" — ordinary use of a variable gives you its *value*, never its
    *location*.
  - **dereference operator (`*`)** — a unary operator that, given a
    pointer, produces the value stored at the address it holds. It exists
    as the address-of operator's inverse: `&` gets you *from* a variable
    *to* its address; `*` gets you back *from* an address *to* the value
    living there.
  - **`new` expression** — an expression that requests a block of memory
    from the heap, constructs a value in it, and evaluates to a pointer to
    that memory. It exists because ordinary variable declarations
    (`int x = 5;`) always allocate on the stack — `new` is the only way to
    put something on the heap instead.
  - **`delete` expression** — an expression that releases memory
    previously obtained from `new`, returning it to the heap for reuse. It
    exists because the heap has no automatic cleanup — unlike the stack, if
    you don't explicitly release heap memory, nothing else will, for as
    long as the program keeps running.
  - **dangling pointer** — a pointer that still holds an address, but the
    data that used to live at that address is gone (its stack frame
    returned, or its heap memory was `delete`d). It exists as a *name for a
    bug*, not a feature — reading through one produces undefined behavior,
    because you're reading memory that's no longer guaranteed to hold what
    you think it holds.
- **Objects and methods used**
  - **`std::cout`**
    - *What it is:* the standard output stream object — the thing that
      represents "text going to the terminal."
    - *Implementation:* an object of type `std::ostream`, defined in the
      `<iostream>` header, backed by the process's standard output file
      descriptor.
    - *Its use:* this lesson's code writes to it directly, every time it
      needs to show you something — a value, an address, a label — since
      it's the only channel this program has to the terminal.
  - **`operator<<` (stream insertion)**
    - *What it is:* an operator, overloaded for `std::ostream`, that
      writes its right-hand operand to the stream on its left and then
      evaluates to that same stream — which is what makes chaining
      (`cout << a << b`) possible.
    - *Implementation:* for the types this lesson uses (`const char*`,
      `int`, and a pointer value), the real signature looks like this —
      ```cpp
      std::ostream& operator<<(std::ostream& os, const char* str);
      std::ostream& operator<<(std::ostream& os, int value);
      std::ostream& operator<<(std::ostream& os, const void* ptr);
      ```
      Each one writes its second argument in the obvious textual form
      (text as-is, an `int` as decimal digits, a pointer as a hexadecimal
      address), then returns `os` by reference — the *same* stream object,
      not a copy — so the next `<<` in the chain has something to act on.
    - *Its use:* this is the actual mechanism behind every
      `std::cout << something` in this lesson's code, and the reason
      `std::cout << "x = " << x << std::endl;` is legal at all — each
      `<<` hands back the stream for the next one to use.
  - **`std::endl`**
    - *What it is:* a stream manipulator — a special value that, when
      sent to a stream with `<<`, doesn't print ordinary text but instead
      triggers an action.
    - *Implementation:* writing `std::endl` to a stream writes a newline
      character and then forces any buffered output to actually be sent to
      the terminal immediately (a "flush").
    - *Its use:* this lesson's code ends every line of output with it, so
      each `cout` statement's output appears on its own line, immediately,
      rather than possibly sitting in a buffer.

---

## Concept Unit: Printing to the Terminal

### The Problem

Before anything about memory can be shown, this program needs a way to
prove what it did — in Python, `print(x)` does this without a second
thought. C++ has no built-in `print` at all; getting text to the terminal
is itself something to learn first.

### Project Change

- **Reference Source** — No reference counterpart. This is a from-scratch
  teaching example, not a port of an existing codebase.
- **Files affected** — created `lesson1.cpp`
- **Change type** — add
- **Location** — new file, a single `main` function
- **Dependencies** — a working C++ compiler (`g++`), confirmed in
  Commands, below

### The New Code

```cpp
#include <iostream>

int main() {
    std::cout << "hello from C++" << std::endl;
    return 0;
}
```

### The Updated Project

Skipped — this *is* the whole new file, with nothing surrounding it yet
(the Project Change section above already covers this case: a brand-new
file has no existing structure to be located within).

### Introduce the Concept in Isolation

Throwaway lab — the exact code just shown above, typed and run standalone,
before it becomes "the project":

```cpp
#include <iostream>

int main() {
    std::cout << "hello from C++" << std::endl;
    return 0;
}
```

Compiled and run for real, this session:

```
$ g++ -std=c++17 -Wall -o lab1_print lab1_print.cpp
$ ./lab1_print
hello from C++
```

That real output proves two things at once: the `#include <iostream>`
line successfully made `std::cout` available, and the chain of
`<<` operators produced exactly the text and newline it looks like it
should. This whole mechanism — sending values to an output stream object
with `<<` — is called **stream insertion**.

### Discard the Throwaway Example

This lab is now discarded. It will not reappear — the real project code
shown above, in "The New Code," is what the rest of this lesson builds on.

### Mechanical Walkthrough

Enumerating every distinct syntactic element in "The New Code," in order:

- `#include <iostream>` — **(a) first appearance.** The `#include`
  directive, explained in the Header's Terms Introduced. `<iostream>` is
  the specific standard-library header that declares `std::cout` and
  `operator<<` for it — without this line, the next line wouldn't compile,
  because the compiler would have no idea what `std::cout` is.
- `int main()` — **(a) first appearance.** Every C++ program must define
  exactly one function named `main`; the operating system calls it to
  start the program running, the same conceptual role Python's top-level
  script body plays, except explicit here rather than implicit. The `int`
  is `main`'s return type — a number reported back to the operating system
  describing how the program finished.
- `std::cout` — **(a) first appearance**, given full treatment in the
  Header's Objects and methods used.
- `<<` — **(a) first appearance**, the stream insertion operator, given
  full treatment in the Header's Objects and methods used.
- `"hello from C++"` — **(a) first appearance.** A string literal — text
  written directly in the source code, of type `const char*` here. Unlike
  a Python string, this is not a rich string object with methods; it's
  effectively a pointer to a fixed block of characters sitting in the
  compiled program itself.
- `std::endl` — **(a) first appearance**, given full treatment in the
  Header's Objects and methods used.
- `return 0;` — **(a) first appearance.** Ends `main`, handing `0` back
  to the operating system as `main`'s result. By convention, `0` means
  "the program finished with no error" — a value any other program or
  script (including a Python one, via `$?` or `subprocess`) could check.

### CS Lens

Not a hard concept (no design pattern, SE principle, or CS idea named
here) — routine syntax establishing the toolchain. No extended
recognition list needed.

### SE Lens

Not applicable to this unit — there's no design decision or tradeoff
being made yet, only the minimum code needed to prove the toolchain
works.

### Commands

```
$ g++ -std=c++17 -Wall -o lesson1 lesson1.cpp
```

- `g++` — the GNU C++ compiler. Turns your `.cpp` source file into a real,
  runnable program.
- `-std=c++17` — tells the compiler which version of the C++ language
  standard to compile against. Named explicitly, rather than left to
  whatever the compiler defaults to, so this code behaves the same on any
  machine that runs this exact command.
- `-Wall` — turns on the compiler's full set of common warnings.
  Warnings aren't errors — the code still compiles without this flag —
  but this lesson uses them later (in the Closing section) to catch a real
  bug before it becomes a crash.
- `-o lesson1` — names the resulting compiled program `lesson1`, instead
  of the default name the compiler would otherwise choose.
- `lesson1.cpp` — the source file to compile.

Then, to run the compiled program:

```
$ ./lesson1
```

- `./` — run a program sitting in the current folder, rather than
  searching the system-wide list of installed programs (which is where a
  bare `lesson1` would look, and fail).
- `lesson1` — the compiled program's filename, produced by the command
  above.

### Run It

```
$ g++ -std=c++17 -Wall -o lesson1 lesson1.cpp
$ ./lesson1
hello from C++
```

### Connection

With a working toolchain and a way to print, the next unit can start
asking the actual question this lesson exists for: where does a variable
like an `int` actually live, and how would you even check?

---

## Concept Unit: The Stack and the Address-Of Operator

### The Problem

In Python, `x = 5` gives you a value with no visible location — asking
"where does `x` live in memory" isn't even a meaningful question at the
Python level. In C++, it is a meaningful question, with a real, printable
answer, and the answer is the entire reason the stack/heap distinction
exists. This unit gets that first real answer on screen.

### Project Change

- **Reference Source** — No reference counterpart.
- **Files affected** — modified `lesson1.cpp`
- **Change type** — add
- **Location** — inside `main`, after the existing `std::cout` line from
  the previous unit
- **Dependencies** — the previous unit's working `lesson1.cpp`

### The New Code

```cpp
int x = 5;
std::cout << "x        = " << x << std::endl;
std::cout << "&x       = " << &x << std::endl;
```

### The Updated Project

```cpp
#include <iostream>

int main() {
    std::cout << "hello from C++" << std::endl;

    int x = 5;                                       // ← new
    std::cout << "x        = " << x << std::endl;    // ← new
    std::cout << "&x       = " << &x << std::endl;    // ← new

    return 0;
}
```

`main` now does three things instead of one: prints a greeting (already
established), then declares a real stack variable and prints both its
*value* and its *address* — the two new lines that make the stack visible
for the first time instead of just assumed.

### Introduce the Concept in Isolation

Throwaway lab, isolating just the new idea — declaring `x` and reading its
address — separately from the rest of the growing project:

```cpp
#include <iostream>

int main() {
    int x = 5;
    std::cout << "x        = " << x << std::endl;
    std::cout << "&x       = " << &x << std::endl;
    return 0;
}
```

Compiled and run for real, twice in a row, this session:

```
$ g++ -std=c++17 -Wall -o lab2_address lab2_address.cpp
$ ./lab2_address
x        = 5
&x       = 0x7ffd67b243c4
$ ./lab2_address
x        = 5
&x       = 0x7fff3d929224
```

This is exactly what the two new lines in "The Updated Project" above are
doing, isolated: `x` prints the same value every run (`5`, as written),
but `&x` prints a *different address every single run of the same
program*. That's not random noise — it's the stack in action. Each run of
the program gets a freshly allocated stack region from the operating
system; `x`'s specific slot within it lands wherever that run's stack
happens to start. This is called **stack allocation**: memory reserved
automatically, at a location the program doesn't control and doesn't need
to.

### Discard the Throwaway Example

This lab is discarded. The real, connected version lives in
`lesson1.cpp`, shown in "The Updated Project" above.

### Mechanical Walkthrough

Enumerating every new syntactic element in "The New Code":

- `int x = 5;` — **(a) first appearance.** A variable declaration with an
  explicit type. Unlike Python's `x = 5` — which creates a name bound to
  wherever the integer object `5` happens to live — this line reserves a
  fixed-size block of memory (4 bytes, enough for one `int`) on the stack,
  right now, and puts `5` directly inside it. `x` isn't a name pointing at
  a `5` somewhere else; `x` *is* the memory holding `5`.
- `&x` — **(a) first appearance.** The address-of operator, given full
  treatment in the Header's Terms Introduced. Applied to `x` here, it
  evaluates to the actual memory address of the block just reserved above
  — not a copy of `x`'s value, but where that value physically sits.
- `std::cout << "&x       = " << &x` — **(c) already basic**, reusing
  stream insertion (fully explained in the previous unit) with a new
  operand type; `operator<<` for a pointer value prints it in hexadecimal,
  as already shown in the Header's Objects and methods used shape for
  `operator<<`.

### CS Lens

Not a hard concept by this schema's own definition (no named pattern,
principle, or algorithm) — but worth naming precisely anyway, since it's
foundational: this is **automatic storage duration**, the formal term for
what "the stack" provides. Also recognized in: a function call stack in
any language's debugger (including Python's own traceback, which is
listing exactly this kind of frame); a browser tab's JavaScript call
stack shown in dev tools; recursive descent parsers, where each recursive
call's local state occupies its own stack frame; a spreadsheet program's
"undo" limit, conceptually bounded the same way a real call stack is
bounded in size.

### SE Lens

The alternative to automatic stack cleanup is what C++ heap memory
requires instead: the programmer manually tracking and releasing every
allocation (covered in the next unit). The stack's tradeoff is that it
buys automatic, zero-effort cleanup and very fast allocation (reserving
stack space is just moving a pointer), at the cost of a hard constraint:
a stack variable's lifetime is rigidly tied to its enclosing function, and
its size must be known at compile time. Python sidesteps this entire
tradeoff by giving every value heap-like lifetime by default, managed by a
garbage collector — simpler to reason about, at a real, ongoing runtime
cost that C++ programmers are explicitly opting out of.

### Commands

No new commands — the same `g++ -std=c++17 -Wall -o lesson1 lesson1.cpp`
compile step from the previous unit still applies; only the source file's
contents changed.

### Run It

```
$ g++ -std=c++17 -Wall -o lesson1 lesson1.cpp
$ ./lesson1
hello from C++
x        = 5
&x       = 0x7ffda78d6264
```

### Connection

`x` lives at an address the program doesn't control, and that address is
only valid because `main` is currently running — the moment `main`
returns, that stack space is reclaimed. The next unit asks the opposite
question: what if you need memory that survives *past* the function that
created it? That's what the heap is for.

---

## Concept Unit: The Heap — `new` and `delete`

### The Problem

The stack cleans itself up automatically, which is convenient right up
until it's the wrong behavior — sometimes data needs to survive longer
than the function that created it, or needs a size that isn't known until
the program is running. The stack can't do either. This unit gets a
second kind of memory on screen, one the program controls directly, and
compares its address to the stack address from the previous unit.

### Project Change

- **Reference Source** — No reference counterpart.
- **Files affected** — modified `lesson1.cpp`
- **Change type** — add
- **Location** — inside `main`, after the stack variable code from the
  previous unit
- **Dependencies** — the previous unit's working `lesson1.cpp`

### The New Code

```cpp
int* heapX = new int(5);
std::cout << "heapX    = " << heapX << std::endl;
std::cout << "*heapX   = " << *heapX << std::endl;
delete heapX;
```

### The Updated Project

```cpp
#include <iostream>

int main() {
    std::cout << "hello from C++" << std::endl;

    int x = 5;
    std::cout << "x        = " << x << std::endl;
    std::cout << "&x       = " << &x << std::endl;

    int* heapX = new int(5);                          // ← new
    std::cout << "heapX    = " << heapX << std::endl;  // ← new
    std::cout << "*heapX   = " << *heapX << std::endl; // ← new
    delete heapX;                                      // ← new

    return 0;
}
```

`main` now allocates and prints from *both* kinds of memory in the same
run: `x` on the stack, `heapX` on the heap — which makes the previous
unit's address comparison concrete instead of hypothetical.

### Introduce the Concept in Isolation

Throwaway lab, isolating heap allocation next to a stack variable so the
two addresses can be compared directly:

```cpp
#include <iostream>

int main() {
    int stackVar = 5;
    int* heapVar = new int(5);

    std::cout << "stack address = " << &stackVar << std::endl;
    std::cout << "heap  address = " << heapVar << std::endl;
    std::cout << "heap  value   = " << *heapVar << std::endl;

    delete heapVar;
    return 0;
}
```

Compiled and run for real, this session:

```
$ g++ -std=c++17 -Wall -o lab3_heap lab3_heap.cpp
$ ./lab3_heap
stack address = 0x7ffec9e8569c
heap  address = 0x563a1d6c62b0
heap  value   = 5
```

This is exactly what "The Updated Project" above is doing with `x` and
`heapX`. Look at the two addresses: `0x7ffe...` and `0x563a...` aren't
just different numbers — they're in *entirely different regions* of the
program's address space, off by a factor in the trillions. That's not a
coincidence of this one run; the stack and heap are deliberately placed
far apart in memory by the operating system, precisely because they grow
independently and must never collide. Requesting memory this way — at a
time and place the program chooses, rather than tied to a function's
lifetime — is called **dynamic allocation**.

### Discard the Throwaway Example

This lab is discarded. The real, connected version lives in
`lesson1.cpp`, shown in "The Updated Project" above.

### Mechanical Walkthrough

Enumerating every new syntactic element in "The New Code":

- `int*` — **(a) first appearance.** A pointer type — "pointer to `int`,"
  given full treatment in the Header's Terms Introduced. The `*` here is
  part of the *type*, not the dereference operator yet; it says "this
  variable stores an address of an `int`," not "this variable stores an
  `int`."
- `new int(5)` — **(a) first appearance.** The `new` expression, given
  full treatment in the Header's Terms Introduced. Concretely, in this
  line: reserve enough heap memory for one `int`, put `5` inside it, and
  evaluate to a pointer to that memory — which is what gets stored into
  `heapX`.
- `heapX` — **(c) already basic**, an ordinary variable holding the
  pointer `new` just produced — the declaration syntax itself was already
  covered in the previous unit's treatment of `int x = 5;`; only the type
  changed, which is covered separately above.
- `std::cout << "heapX    = " << heapX` — **(c) already basic**, reusing
  stream insertion; printing a pointer value in hexadecimal was already
  established in the previous unit (`&x`).
- `*heapX` — **(a) first appearance.** The dereference operator, given
  full treatment in the Header's Terms Introduced. Here, applied to
  `heapX`, it reaches through the stored address and retrieves the actual
  `int` value sitting at that heap location — `5`.
- `delete heapX;` — **(a) first appearance.** The `delete` expression,
  given full treatment in the Header's Terms Introduced. This releases
  the heap memory `new` reserved above, back to the system, so it can be
  reused by a future allocation. Nothing else in this program does this
  automatically — unlike `x` on the stack, whose memory is reclaimed the
  instant `main` returns whether you ask for it or not.

### CS Lens

This is **dynamic (heap) storage duration** — memory whose lifetime is
controlled explicitly by the program rather than tied to a function call.
Also recognized in: a Python list growing past its current internal
buffer (CPython allocates new heap space and copies, invisibly, but it's
the same underlying operation); a web browser's tab process requesting
more memory as you scroll a long page; a database engine's buffer pool,
grown and shrunk on demand rather than fixed at startup; a video game's
asset loader, allocating room for a level's textures only once that level
is actually entered.

### SE Lens

The tradeoff here is the direct inverse of the previous unit's: the heap
buys flexibility — a lifetime independent of any one function, a size
decided at runtime instead of compile time — at the cost of manual
bookkeeping. Every `new` creates an obligation: exactly one matching
`delete`, on every path the program could take, including error paths.
Miss one, and the memory is never reclaimed for as long as the program
runs — a **memory leak**. Delete twice, or use the pointer afterward, and
the behavior is undefined rather than a clean error. Python's alternative
— automatic garbage collection for every value — removes this obligation
entirely, at the cost of the collector's own runtime overhead and less
predictable *timing* of cleanup, which is exactly why C++ was designed to
let the programmer choose rather than pay that cost unconditionally. The
next lesson's smart pointers exist specifically to get the heap's
flexibility back without this manual-`delete` obligation — but seeing the
manual version first is what will make that later fix legible as a fix,
rather than more unexplained magic.

### Commands

No new commands — the same compile step applies.

### Run It

```
$ g++ -std=c++17 -Wall -o lesson1 lesson1.cpp
$ ./lesson1
hello from C++
x        = 5
&x       = 0x7ffefad79f3c
heapX    = 0x558d7edb82c0
*heapX   = 5
```

### Connection

`x` and `heapX` now sit in visibly different regions of memory, with
visibly different rules: one cleaned up for you, one you cleaned up
yourself with `delete`. The Closing section, next, breaks this
deliberately — on purpose — to show what happens when that manual rule
isn't followed.

---

## Closing

### Connect the Pieces

Follow one value — `5` — through everything this lesson built:

1. `int x = 5;` puts `5` directly into a stack slot whose address (`&x`)
   is decided by the operating system the moment `main` starts running.
2. `int* heapX = new int(5);` puts a *second* `5` into a heap slot at a
   completely different address — one the program explicitly requested
   and controls.
3. `*heapX` reaches through `heapX`'s stored address and retrieves that
   second `5` back out.
4. `delete heapX;` releases that heap slot. If this program kept running
   afterward and tried `*heapX` again, that would be reading through a
   **dangling pointer** — which is exactly what the next section proves,
   on purpose.
5. `return 0;` ends `main`. At that instant, `x`'s stack slot is reclaimed
   automatically — no code anywhere asked for that; it's simply what
   "stack" means.

### What Breaks Without This

To make "a dangling pointer is undefined behavior" concrete instead of
abstract, here's a function that returns the address of one of its own
stack variables — a mistake this lesson's rules predict should fail:

```cpp
#include <iostream>

int* makeOnStack() {
    int localValue = 42;
    return &localValue;
}

int main() {
    int* danglingPtr = makeOnStack();
    std::cout << *danglingPtr << std::endl;
    return 0;
}
```

This is a **timing** failure, not a changing-values one — the bug is
entirely about *when* `localValue`'s memory stops being valid relative to
when it's read, so it's traced as a sequence of moments rather than a
table of values:

1. `int localValue = 42;` — reserves a stack slot inside `makeOnStack`'s
   own stack frame and puts `42` in it.
2. `return &localValue;` — hands back the *address* of that slot. The
   address itself is just a number; copying it out doesn't extend the
   slot's lifetime.
3. `makeOnStack` returns. Per this lesson's own Concept Unit on the
   stack, its entire stack frame — including `localValue`'s slot — is now
   reclaimed, automatically, whether or not anything still holds its
   address.
4. `int* danglingPtr = makeOnStack();` — `danglingPtr` now holds an
   address that used to be valid and no longer is. This is the textbook
   shape of a dangling pointer, named in the Header's Terms Introduced.
5. `std::cout << *danglingPtr << std::endl;` — dereferences it anyway.

Compiled with the same `-Wall` flag already established in this lesson's
Commands, the compiler actually catches this one before it even runs:

```
$ g++ -std=c++17 -Wall -Wextra -o break_demo break_demo.cpp
break_demo.cpp: In function 'int* makeOnStack()':
break_demo.cpp:5:12: warning: address of local variable 'localValue' returned [-Wreturn-local-addr]
    5 |     return &localValue;
      |            ^~~~~~~~~~~
break_demo.cpp:4:9: note: declared here
    4 |     int localValue = 42;
      |         ^~~~~~~~~~
```

Run anyway, despite the warning, this session's real result was a crash —
not "prints 42," not "prints garbage," a hard stop:

```
$ ./break_demo
Segmentation fault (core dumped)
```

That's the honest, load-bearing lesson underneath all of this: *undefined
behavior means undefined* — not "quietly wrong," not reliably "prints the
old value," but whatever the operating system's memory protection happens
to do when the program reaches into memory it no longer owns. This run
happened to segfault; a different compiler, a different optimization
level, or a different day could just as easily have printed `42` and kept
going, which would be worse, because nothing would look wrong.

Restoring `x` to genuinely valid stack use (declared and read within the
same function, as every earlier unit in this lesson already did) removes
the warning and the crash both — which is the actual point: the rule
this lesson taught (a stack variable's address is only good for as long
as its function is running) isn't a style preference, it's the real
mechanism, and breaking it produces a real, reproducible failure.

### Exercises

1. Add a second heap `int`, print its address next to `heapX`'s, and
   check: is it near `heapX` in memory, or far? Run it a few times — does
   the relationship stay consistent?
2. Remove the `delete heapX;` line entirely, recompile with `-Wall
   -Wextra`, and read the compiler's output closely — does it warn you
   about the missing `delete`? What does that tell you about how
   aggressively the compiler can (and can't) catch a memory leak, compared
   to how it caught the dangling-pointer case above?
3. Change `int x = 5;` to `int x = 5, y = 10;` and print `&x` and `&y`
   next to each other. Are they adjacent in memory? What does that suggest
   about how the stack lays out multiple local variables?

### Definition of Done

- [ ] `lesson1.cpp` compiles cleanly with `g++ -std=c++17 -Wall -Wextra`
      — zero warnings.
- [ ] Running it prints a stack address and a heap address that are
      visibly in different regions of memory.
- [ ] You can explain, out loud, without looking at this lesson, why `&x`
      changes value between separate runs of the program but `x` itself
      does not.
- [ ] You've run the intentional `break_demo.cpp` crash yourself and seen
      the real compiler warning and the real runtime failure, not just
      read about them here.
- [ ] Commit, with a message explaining *why*, not what — for example:
      `git commit -m "Add stack vs heap demo: variables need an explicit
      lifetime decision in C++, unlike Python"` rather than
      `git commit -m "Add lesson1.cpp"`.
