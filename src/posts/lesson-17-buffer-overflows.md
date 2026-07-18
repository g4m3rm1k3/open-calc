# Lesson 17: Buffer Overflows

## What you will build

A small C program that authenticates based on a boolean flag — and a single command-line
argument, nine characters long, that flips that flag to "authenticated" without ever
supplying a correct credential, by writing past the end of an unrelated buffer sitting
next to it in memory. The transferable problem: every language you've used in this course
so far — Python — checks array bounds for you and raises an error the instant you go past
them. C does not check anything. This lesson is about exactly what "does not check
anything" actually means, mechanically, and what happens when an attacker controls the
data being written.

## What you need to know first

Nothing from this course's prior lessons is strictly required, but Lesson 1's trust
boundary framing is worth having in mind: this is the same "untrusted input crosses into
something that trusts it completely" pattern from Lessons 4–6, at a layer beneath any of
those — beneath the database, the shell, and the browser, in the raw memory a running
program uses to keep track of its own local variables. This is also this course's first
lesson in C rather than Python; every C-specific construct is taught from first principles
regardless of any resemblance to Python syntax you might notice.

---

## Concept Unit: A Buffer With No Bounds Checking

### The Problem

In every Python lesson so far, indexing past the end of a list — `my_list[10]` on a
3-element list — raises `IndexError` immediately, every time, without exception. C's
equivalent, an array, makes no such promise. This unit asks: what actually happens, in C,
when code reads past the end of an array it declared?

### Introduce the Concept in Isolation

```c
#include <stdio.h>

int main() {
    int numbers[3] = {10, 20, 30};
    printf("numbers[0] = %d\n", numbers[0]);
    printf("numbers[2] = %d\n", numbers[2]);
    printf("numbers[5] = %d  (index 5 does not exist in a 3-element array)\n", numbers[5]);
    printf("program did not crash or raise any error\n");
    return 0;
}
```

Compile and run it:

```
$ gcc -o bounds_demo bounds_demo.c
$ ./bounds_demo
numbers[0] = 10
numbers[2] = 30
numbers[5] = 1113489520  (index 5 does not exist in a 3-element array)
program did not crash or raise any error
```

This output proves the central fact this whole lesson rests on: `numbers[5]` does not
exist — `numbers` was declared to hold exactly 3 integers — and C's `[5]` syntax does not
check that before performing the read. It simply computes "the memory address of
`numbers[0]`, plus 5 times the size of an `int`," and reads whatever bytes happen to be
sitting at that address, whatever they mean. `1113489520` is not a number this program
ever stored — it's leftover data from something else the operating system placed at that
memory address, printed as if it were a valid `int`, because C has no mechanism to know or
care that it isn't one.

### Discard

`bounds_demo.c` is deleted now. It never appears again in this lesson — it existed only to
prove, by running it, that C performs no bounds checking at all, before that fact becomes
load-bearing in the next unit.

### Where This Lives

This lesson builds two standalone C files across its four Concept Units:
`auth_bypass.c` (the vulnerable program, built in the next two units) and a
recompiled version of the same file with a compiler flag changed (the mitigation,
in the final unit). Neither is part of any larger project — both are complete,
runnable, and discarded once their concept is learned, exactly like every other lab in
this course.

### CS Lens

```
Also recognized in: literally every buffer overflow vulnerability ever
discovered, in any language that compiles to unmanaged memory access -- C, C++,
assembly, and any runtime implemented in them (which includes the interpreters
for Python, JavaScript, and nearly every "safe" language you've used in this
course, underneath their own safety checks).
```

---

## Concept Unit: Overwriting a Neighbor on the Stack

### The Problem

`bounds_demo.c` only ever *read* past the end of an array — nothing was changed, nothing
was corrupted, only an incorrect value was printed. This unit asks the more dangerous
question: what happens when code *writes* past the end of a buffer, into memory that
belongs to a different, adjacent variable?

### Introduce the Concept in Isolation

Skipped: this unit reuses `bounds_demo.c`'s already-lab'd fact — C performs no bounds
checking — and applies it directly to a write instead of a read, inside the real code
below, rather than isolating a second throwaway example. The new element here is not a new
language construct but a new *consequence*, which the walkthrough below makes concrete.

### Where This Lives

**File:** `auth_bypass.c` (new file). **Dependencies:** `gcc` and the C standard library
headers `stdio.h` and `string.h`, both included with any standard C toolchain — nothing to
install beyond a compiler.

### The New Code

```c
int check_access(char *input_name) {
    char name_buffer[8];
    int is_authenticated = 0;

    strcpy(name_buffer, input_name);

    printf("name_buffer contains: %s\n", name_buffer);
    printf("is_authenticated = %d\n", is_authenticated);

    return is_authenticated;
}
```

### The Updated Project

```c
#include <stdio.h>
#include <string.h>

int check_access(char *input_name) {              // ← new
    char name_buffer[8];                           // ← new
    int is_authenticated = 0;                      // ← new

    strcpy(name_buffer, input_name);                // ← new

    printf("name_buffer contains: %s\n", name_buffer);   // ← new
    printf("is_authenticated = %d\n", is_authenticated); // ← new

    return is_authenticated;                        // ← new
}

int main(int argc, char *argv[]) {
    int result = check_access(argv[1]);
    if (result) {
        printf("ACCESS GRANTED\n");
    } else {
        printf("access denied\n");
    }
    return 0;
}
```

`main` takes a single command-line argument (`argv[1]`) and passes it to `check_access`,
which is meant to decide, via `is_authenticated`, whether access should be granted.
Nothing in `main` changed — it already existed to call `check_access` and report its
result; `check_access` itself is the entire new piece.

### Mechanical Walkthrough

- `char *input_name` — **(a) first appearance**: a **pointer** to `char` — a memory
  address where a sequence of characters begins, not the characters themselves. C strings
  are not a built-in type the way Python's `str` is; they're just a block of memory with
  a special end marker (the next item explains this).
- `char name_buffer[8]` — **(a) first appearance**: declares a fixed-size array of 8
  `char` values, reserving exactly 8 bytes of space in this function's **stack frame** —
  the region of memory the running program uses to hold this specific function call's
  local variables, for as long as that call is active.
- `int is_authenticated = 0` — **(c) already basic**: an integer variable, initialized to
  `0`, using syntax directly familiar from Python's own assignment, applied to C's
  explicitly-typed declaration.
- `strcpy(name_buffer, input_name)` — **(a) first appearance**: a C standard library
  function that copies characters from `input_name` into `name_buffer`, one byte at a
  time, until it reaches a **null terminator** — a single zero byte (`\0`) that marks the
  end of a C string, since C strings carry no built-in length the way Python's `str` does.
  Critically: `strcpy` has no parameter telling it how large `name_buffer` actually is. It
  will keep copying bytes past the end of `name_buffer` for as long as `input_name`
  provides more non-zero bytes, writing into whatever memory happens to sit immediately
  after `name_buffer` — with no check, no error, and no warning.
- `printf("%s", name_buffer)` — **(c) already basic**: printing a string; `%s` as a format
  specifier needs no further explanation for reading purposes here.

**Execution trace**, since this code's behavior depends entirely on how far `strcpy`
writes past `name_buffer`'s 8-byte boundary — the concrete values below are the actual
values this program produced when compiled and run:

```
input length 3  ("ada"):        name_buffer = "ada",        is_authenticated = 0
input length 8  ("AAAAAAAA"):   name_buffer = "AAAAAAAA",   is_authenticated = 0
input length 9  ("AAAAAAAAA"):  name_buffer = "AAAAAAAAA",  is_authenticated = 65
input length 10 ("AAAAAAAAAA"): name_buffer = "AAAAAAAAAA", is_authenticated = 16705
input length 12+:                                            program crashes
                                                               (Segmentation fault)
```

At exactly 9 characters — one character past `name_buffer`'s declared 8-byte size —
`strcpy` writes one extra byte immediately following the buffer, and on this compiler and
platform, that byte lands inside `is_authenticated`'s own memory. `65` is the ASCII code
for the character `'A'` — the single overflow byte, interpreted directly as (part of) an
integer, because C draws no boundary in memory between "this belongs to `name_buffer`" and
"this belongs to `is_authenticated`" beyond the compiler's own bookkeeping, which
`strcpy` has no way to consult or respect. At 12 or more characters, the overflow reaches
far enough to corrupt memory the program needs to keep running at all — most often the
**saved return address**, the memory location recording where execution should resume once
`check_access` finishes — and the program crashes outright rather than merely
misbehaving.

### CS Lens

This corrupted `is_authenticated` value is a direct, mechanical consequence of the **stack
frame layout**: local variables declared inside a function are laid out in adjacent memory
for the duration of that call, in an order and with padding entirely decided by the
compiler, not the programmer. `strcpy`'s unchecked write doesn't "know" it's touching
`is_authenticated` — it's simply writing sequentially through memory, and
`is_authenticated` happened to be there.

```
Also recognized in: the Morris Worm (1988, one of the first major internet
security incidents, propagating via a buffer overflow in a Unix service), the
Heartbleed vulnerability (2014, an out-of-bounds *read* -- this unit's Concept
Unit one, at internet scale, in OpenSSL), and an enormous share of historical CVE
entries in embedded systems, routers, and IoT devices, where C remains dominant
and memory-safety tooling is often absent.
```

### SE Lens

The alternative not chosen here is a bounds-checked copy — C's standard library provides
`strncpy(name_buffer, input_name, sizeof(name_buffer) - 1)`, which accepts a maximum
length and will not write past it. `strcpy`, used above, is easier to write and was, for
decades, extremely common in real production code specifically because it's shorter and
the danger is invisible until an input longer than expected actually arrives — exactly the
"looks completely correct for well-behaved input" trap this course has named in Lessons 4
through 6. The maintenance cost of this shortcut is not hypothetical: `strcpy`'s
unboundedness is precisely why modern C style guides and static analysis tools flag it
as forbidden or dangerous by default, and why the fix in this lesson's final unit doesn't
touch this function at all — it defends at a different layer, because auditing every call
site for a length check by hand does not scale, and one missed call site is sufficient for
a working exploit.

### Commands Needed

`gcc -o auth_bypass auth_bypass.c` — `gcc` is the GNU C Compiler; `-o auth_bypass` names
the output executable file `auth_bypass` (without `-o`, the default output name would be
the less descriptive `a.out`); `auth_bypass.c` is the source file to compile. No flags
beyond `-o` are required to reproduce Step-by-step behavior above on most systems, though
the exact numeric values in the execution trace can vary by compiler version and platform
— the *pattern* (correct up to 8 characters, flag corrupted at 9, crash beyond a further
threshold) is what to expect, not necessarily the identical numbers.

### Run It

```
$ gcc -o auth_bypass auth_bypass.c
$ ./auth_bypass "ada"
name_buffer contains: ada
is_authenticated = 0
access denied
$ ./auth_bypass "AAAAAAAAA"
name_buffer contains: AAAAAAAAA
is_authenticated = 65
ACCESS GRANTED
```

Nine characters — none of them a password, none of them checked against anything —
produced `ACCESS GRANTED`. This is the direct, running consequence of the fact proven in
the first Concept Unit (C performs no bounds checking) applied to a write instead of a
read: the exact same mechanical gap, with a materially worse outcome.

---

## Concept Unit: The Stack Protector

### The Problem

`auth_bypass.c` itself is unchanged from the previous unit — this unit asks whether the
*compiler* can catch this class of bug without the source code changing at all, since
auditing every `strcpy` call by hand, as the SE Lens above noted, does not scale.

### Introduce the Concept in Isolation

Skipped: this unit's "throwaway" demonstration *is* the compiled comparison below — there
is no smaller isolated example than recompiling the same function with one flag changed,
since the concept being taught is a property of compilation itself, not a new language
construct.

### Where This Lives

**File:** `auth_bypass.c`, recompiled with an added compiler flag — no source code
changes.

### The New Code

```
gcc -fstack-protector-all -o auth_bypass_protected auth_bypass.c
```

### The Updated Project

There is no source-level "updated project" for this unit — the entire change is the
compilation command itself, which now reads `gcc -fstack-protector-all -o
auth_bypass_protected auth_bypass.c` in place of the previous unit's plain `gcc -o
auth_bypass auth_bypass.c`. `auth_bypass.c`'s contents are identical to the file shown
in the previous unit.

### Mechanical Walkthrough

- `-fstack-protector-all` — **(a) first appearance**: a `gcc` compiler flag that inserts
  an extra, hidden value — a **canary**, named for the historical practice of carrying a
  live canary into a coal mine as an early warning of danger — into every function's stack
  frame, placed deliberately between local buffers like `name_buffer` and critical data
  like the saved return address. Before a function returns, the compiler-generated code
  checks whether that canary value still matches what it was set to at the start of the
  call. `strcpy`'s overflow, if it reaches far enough to endanger the return address, has
  to overwrite the canary first — and that overwrite is what gets detected.

### CS Lens

This is a **runtime integrity check**, in the same family as the checksum and signature
verification concepts from Lessons 7 and 9 — a value is set, and later compared against
its expected state, specifically to detect unauthorized modification, without needing to
prevent the modification from being attempted in the first place.

### SE Lens

The alternative this unit doesn't take is fixing every unbounded copy at the source level
(`strncpy`, bounds-checked parsing) — genuinely the more complete fix, since the stack
protector only detects certain corruption patterns (specifically, overflows that pass
through the canary's location on their way to the return address) and does nothing for a
corruption pattern like this lesson's 9-byte, `is_authenticated`-only overflow, which never
reaches the canary at all. The stack protector's real value is as defense in depth — a
safety net compiled in automatically, protecting even source code the current programmer
never gets around to auditing — not a substitute for fixing the unbounded copy itself.

### Run It

```
$ gcc -fstack-protector-all -o auth_bypass_protected auth_bypass.c
$ ./auth_bypass_protected "ada"
name_buffer contains: ada
is_authenticated = 0
access denied
$ ./auth_bypass_protected "AAAAAAAAA"
*** stack smashing detected ***: terminated
Aborted
```

The identical 9-character input that produced `ACCESS GRANTED` in the previous unit now
crashes the program outright, with an explicit, named error — `*** stack smashing
detected ***` — before `check_access` is even permitted to return. Note precisely what
this run does *not* show: `is_authenticated` was still overwritten to `65` internally, the
overflow still happened exactly as before — the protector didn't prevent the corruption,
it detected it before that corrupted state could be *used*, by refusing to let the
function return at all.

---

## Connect the Pieces

Trace one input end to end: the 9-character string `"AAAAAAAAA"`, passed as `argv[1]`,
enters `check_access` as `input_name`. `strcpy` copies all 9 characters plus a null
terminator into the 8-byte `name_buffer`, writing one byte past its end — into
`is_authenticated`'s memory, per the first Vulnerable-Endpoint-style unit's execution
trace, changing it from `0` to `65`. Compiled without protection, `check_access` returns
`65` (truthy), and `main` prints `ACCESS GRANTED` — the second Concept Unit's Run It.
Compiled with `-fstack-protector-all`, the exact same overflow still occurs, but the
compiler's inserted canary check catches the corruption before `check_access` can return
at all, aborting the program instead — the final unit's Run It. Same input, same
underlying memory corruption, two entirely different outcomes, determined by one
compiler flag.

## What Breaks Without This

Recompile `auth_bypass.c` without `-fstack-protector-all` — `gcc -o auth_bypass
auth_bypass.c`, exactly the second unit's plain build — and rerun the 9-character input.
`ACCESS GRANTED` reappears immediately, reproducing the second unit's vulnerability
exactly. Nothing else about the source file changed; the single missing compiler flag is
the entire difference between silent compromise and a loud, safe crash.

## Exercises

1. Try `./auth_bypass "AAAAAAAAAAAA"` (12 characters) against both the protected and
   unprotected builds, and compare the two crash messages — note that the protected build
   still says `*** stack smashing detected ***`, while the unprotected build produces a
   plain `Segmentation fault` with no indication of *why* it crashed.
2. Change `name_buffer`'s declared size from `8` to `16` and recompile the unprotected
   version. Determine, by testing increasing input lengths the way this lesson's execution
   trace did, the new length at which `is_authenticated` first becomes corrupted, and
   explain why it moved.
3. Replace `strcpy(name_buffer, input_name)` with
   `strncpy(name_buffer, input_name, sizeof(name_buffer) - 1)` and confirm that even a very
   long input no longer corrupts `is_authenticated` at all — this is the SE Lens's
   "genuinely more complete fix," verified by running it rather than taken on faith.

## Definition of Done

- [ ] You compiled and ran `bounds_demo.c` and reproduced an out-of-bounds read
      returning garbage rather than raising any error
- [ ] You compiled and ran the unprotected `auth_bypass`, reproducing `ACCESS GRANTED`
      from a 9-character, non-password input
- [ ] You compiled the protected version and reproduced `*** stack smashing detected
      ***` on the identical input
- [ ] You completed Exercise 3 and confirmed `strncpy` prevents the corruption entirely
- [ ] You can explain, in one sentence, why the stack protector is described as
      "detection," not "prevention," of the underlying memory corruption
- [ ] `git add .` and `git commit -m "Lesson 17: buffer overflows -- unbounded strcpy,
      stack corruption, and the stack protector"` in your `security-labs/` folder

**Next:** Lesson 18 — Privilege Escalation, where this lesson's crashed and corrupted
programs meet a further question this lesson deliberately set aside: what an attacker can
actually *do* with a successful memory corruption depends entirely on what permissions the
compromised process already held before the attack began.
