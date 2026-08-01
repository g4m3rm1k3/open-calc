# Lesson 8: An Address Is a Value Like Any Other
### (LAB 08 — Pointers)

**What you will build:** A memory address inspector — printing real stack addresses, declaring a pointer, reading and writing through it, checking `nullptr` safely, and proving that array indexing (LAB-06) is pointer arithmetic wearing brackets. The transferable problem: LAB-06 asserted that arrays decay to pointers and that `tiles[i]` is address arithmetic, but never showed a pointer as its own value. This lesson makes the address itself a first-class thing a variable can hold — closing the gap between "the compiler computes an address for you" and "here is that address, printed, held in a variable, and followed on purpose."

**What you need to know first:** LAB-06 — arrays, address arithmetic, array decay. LAB-01's `sizeof`. LAB-05's pass-by-value.

**Terms introduced in this lesson**

> **Pointer** — a variable whose value is a memory address.
> **Address-of operator (`&`)** — prefixed to a variable, produces that variable's memory address.
> **Dereference operator (`*`)** — prefixed to a pointer, reads (or writes) the value at the address it holds.
> **`nullptr`** — a type-safe constant meaning "this pointer points to nothing valid."
> **Wild pointer** — an uninitialized pointer holding an arbitrary, meaningless address.
> **Dangling pointer** — a pointer whose target has been destroyed or gone out of scope, while the pointer still holds its old address.
> **Pointer arithmetic** — adding an integer to a pointer, advancing it by that many *elements* (not bytes).
> **`void*`** — a generic pointer type carrying no information about what type of data is at its address.
> **Segmentation fault (segfault)** — an operating-system-level crash triggered by accessing memory a process isn't permitted to touch.

No pipeline diagram applies — S-01 builds standalone concept programs.

---

## Concept Unit 1: Pointers — Variables That Hold Addresses

### The Problem

LAB-05 proved a plain `int` parameter is a copy — a function cannot reach back and modify the caller's original. LAB-06 showed arrays behave differently, because passing one secretly passes an address. Nothing so far has let a program hold "an address" as an explicit, named value the way it holds a number or a character.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `main.cpp` — new file for this lab.
- **Change type:** Add (new file).
- **Location:** Inside `main`'s body.
- **Dependencies:** `int` (LAB-01).

### The New Code

```cpp
int score  = 100;
int health = 75;

std::cout << "Variable 'score'  holds value: " << score  << std::endl;
std::cout << "Variable 'score'  lives at:    " << &score << std::endl;
std::cout << "Variable 'health' holds value: " << health << std::endl;
std::cout << "Variable 'health' lives at:    " << &health << std::endl;
```

### The Updated Project

```cpp
#include <iostream>

int main() {
    std::cout << "=== Memory Address Inspector ===" << std::endl;
    std::cout << std::endl;

    int score  = 100;   // ← new
    int health = 75;    // ← new

    std::cout << "Variable 'score'  holds value: " << score  << std::endl;   // ← new
    std::cout << "Variable 'score'  lives at:    " << &score << std::endl;   // ← new
    std::cout << "Variable 'health' holds value: " << health << std::endl;   // ← new
    std::cout << "Variable 'health' lives at:    " << &health << std::endl;  // ← new

    return 0;
}
```

### Concept Lab

No separate throwaway needed: printing `&score` directly, on the real variable this lesson is already built around, is already the smallest possible demonstration — there's no simpler disposable version that would show an address more clearly.

Run it — verified this session (your own addresses will differ — the OS assigns fresh stack memory on every run):

```
$ g++ main.cpp -o dungeon -std=c++17 -Wall -Wextra
$ ./dungeon.exe
=== Memory Address Inspector ===

Variable 'score'  holds value: 100
Variable 'score'  lives at:    0x90251ff85c
Variable 'health' holds value: 75
Variable 'health' lives at:    0x90251ff858
```

What that proves: `score` and `health`, declared one after another, live at addresses exactly `4` apart (`0x...85c − 0x...858 = 4`) — `sizeof(int)` (LAB-01), confirming the compiler places local variables on the stack sequentially, the same "consecutive storage" idea LAB-06 introduced for arrays, now observed for two independently-declared plain variables. Every value printed so far — `100`, `75` — has lived at an address the whole time; this is simply the first time that address has been made visible.

### Mechanical Walkthrough

- `&score` — **(a) first appearance.** The **address-of operator**, prefixed to a variable name (not in a declaration — a distinct role from LAB-09's `&`, flagged explicitly here to avoid confusion later): produces `score`'s memory address as a value.
- `std::cout << &score` — **(c) reusing** `<<` (LAB-00), applied here to a pointer value — `std::cout` prints an address in hexadecimal (base 16) specifically because addresses are conventionally read and written in hex, not because `<<` does anything different for this type.

### CS Lens

Every variable in this curriculum has always had an address — LAB-01's "mailbox" analogy for variables *was* describing this, just without a way to ask for the mailbox's own number. `&` is the operator that asks for it directly.

### SE Lens

The addresses printed here will differ every time this program runs — not a bug, but **ASLR** (Address Space Layout Randomization), an operating-system security feature that deliberately randomizes where a program's stack and other memory regions land, specifically to make memory-corruption exploits harder to write reliably (a topic this curriculum returns to when covering security directly). Code should never assume or hardcode a specific address.

### Connection

Concept Unit 2 gives "an address, held as a value" its own named variable type — a pointer.

---

## Concept Unit 2: Declaring and Dereferencing a Pointer

### The Problem

`&score` produces an address as a one-off expression, printed and discarded — nothing yet stores that address in a variable that can be reused, passed around, or followed later to reach `score` again.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `main.cpp` — modified.
- **Change type:** Add.
- **Location:** After the address prints, before `return 0;`.
- **Dependencies:** `score` (Concept Unit 1).

### The New Code

```cpp
int* p = &score;

std::cout << "pointer 'p' holds address:  " << p  << std::endl;
std::cout << "*p (value at that address): " << *p << std::endl;
```

### The Updated Project

```cpp
    std::cout << "Variable 'health' lives at:    " << &health << std::endl;

    std::cout << std::endl;                                              // ← new
    int* p = &score;                                                     // ← new

    std::cout << "pointer 'p' holds address:  " << p  << std::endl;      // ← new
    std::cout << "*p (value at that address): " << *p << std::endl;      // ← new

    return 0;
```

### Concept Lab

```cpp
// scratch_pointer.cpp  (disposable — same shape as the real project, isolated)
#include <iostream>
int main() {
    int treasureCount = 5;
    int* countPointer = &treasureCount;
    std::cout << *countPointer << std::endl;
    treasureCount = 8;
    std::cout << *countPointer << std::endl;
}
```

Run it — verified this session:

```
$ g++ scratch_pointer.cpp -o scratch_pointer -std=c++17 -Wall -Wextra
$ ./scratch_pointer.exe
5
8
```

What that proves: `*countPointer` printed `5`, then, after `treasureCount = 8;` changed `treasureCount` directly (not through the pointer at all), `*countPointer` printed `8` — the pointer's own value (the address) never changed, but what it points *at* did, and dereferencing always reads whatever is currently there. A pointer does not store a value; it stores a location, and following that location always gets the current contents.

This scratch file is discarded now; the real project's `p`/`score` pair behaves identically, verified next by running the real program.

### Mechanical Walkthrough

- `int* p = &score;` — **(a) first appearance of pointer declaration syntax.** `int*` reads as "pointer to `int`" — the `*` here is part of the *type*, declaring that `p` holds the address of an `int` specifically (not a `char`, not a `double`); the type records what kind of data lives at the address, which matters for both correctness (`*p` needs to know how many bytes to read) and Concept Unit 5's pointer arithmetic.
- `*p` (in `std::cout << *p`) — **(a) first appearance of `*` as the dereference operator.** A *different* role from the same symbol one line above (`int* p`, where `*` is part of the type) and from LAB-02's multiplication `*` — reads the value stored at the address `p` holds.

### Watch for

`*` genuinely means three different things in C++, distinguished only by where it appears: in a type (`int* p`) it declares a pointer; as a prefix on a variable (`*p`) it dereferences; as an infix operator (`3 * 4`) it multiplies. This is a real, frequently-cited point of confusion in the language — context, not the symbol itself, decides which meaning applies.

### CS Lens

`p` holding `score`'s address and `*p` reading what's there is the general **indirection** pattern: accessing a value *through* something that names its location, rather than the value directly. This is the mechanism underneath every reference (LAB-09), every dynamically allocated object (also LAB-09), and every linked structure (`CPP-S02-LAB-07` onward) in this curriculum — all of them are indirection, dressed in different syntax for different purposes.

### Run It

```
$ ./dungeon.exe
...
pointer 'p' holds address:  0x90251ff85c
*p (value at that address): 100
```

Verified this session — `p` prints the identical address `&score` printed in Concept Unit 1, and `*p` reads back `100`, `score`'s current value.

### Connection

Concept Unit 3 writes through `p`, not just reads through it — proving a pointer can modify the original it points to.

---

## Concept Unit 3: Writing Through a Pointer

### The Problem

Concept Unit 2 only *read* through `p`. LAB-05 proved a plain parameter can't reach back and modify its caller's original — does a pointer change that, and if so, how?

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `main.cpp` — modified.
- **Change type:** Add.
- **Location:** After Concept Unit 2's block, before `return 0;`.
- **Dependencies:** `p` (Concept Unit 2).

### The New Code

```cpp
std::cout << std::endl;
std::cout << "Changing score through the pointer..." << std::endl;

*p = 999;

std::cout << "score is now: " << score << std::endl;
```

### The Updated Project

Appended after Concept Unit 2's block, before `return 0;`.

### Concept Lab

No separate throwaway: `*p = 999;` on the real, already-verified `p`/`score` pair is already the clearest possible demonstration.

Run it — verified this session:

```
$ ./dungeon.exe
...
Changing score through the pointer...
score is now: 999
```

What that proves: `*p = 999;` never wrote `score = 999;` directly — `score`'s own name never appears on that line. `*p = 999` writes `999` to *the address `p` holds* — which happens to be `score`'s own address, so `score` itself changed. `p` itself is unaffected by this — it still holds the exact same address as before; only the *contents* at that address changed.

### Mechanical Walkthrough

- `*p = 999;` — **(a) first appearance of dereference used as an assignment target** (Concept Unit 2 only read `*p`; here it's written to) — writes to the memory location `p` points at, not to `p` itself.

### CS Lens

This is the mechanism LAB-05 previewed and deferred: a function that receives a pointer parameter can modify the caller's original variable by dereferencing and assigning, exactly as demonstrated here inline — `void modify(int* target) { *target = 999; }` called as `modify(&score)` produces the identical effect, just with the pointer crossing a function boundary instead of living in the same scope.

### SE Lens

This is the *first* mechanism this curriculum has shown for a function to modify its caller's data across a call boundary — LAB-09's references provide a second, generally preferred mechanism for the same job, with cleaner syntax at the call site; this lesson's own Closing Challenge (`swap`) implements the identical operation both ways, once here with pointers, once in LAB-09 with references, so the tradeoff is visible directly rather than asserted.

### Connection

`p` currently points to a valid, live variable — Concept Unit 4 covers the deliberate "points to nothing" state, and why leaving a pointer in no state at all is dangerous.

---

## Concept Unit 4: `nullptr` — The Safe "Points to Nothing" Value

### The Problem

A pointer that hasn't been assigned an address yet holds *something* — some leftover bits that happen to look like an address — and dereferencing that is exactly as dangerous as LAB-06's out-of-bounds array access: undefined behavior, with no guarantee about what happens.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `main.cpp` — modified.
- **Change type:** Add (new section).
- **Location:** After Concept Unit 3's block, before `return 0;`.
- **Dependencies:** Pointer syntax (Concept Unit 2).

### The New Code

```cpp
std::cout << std::endl;
std::cout << "=== Null Pointer ===" << std::endl;

int* nullPtr = nullptr;

std::cout << "nullPtr value: " << nullPtr << std::endl;

if (nullPtr != nullptr) {
    std::cout << *nullPtr << std::endl;
} else {
    std::cout << "Pointer is null — not dereferencing." << std::endl;
}
```

### The Updated Project

Appended after Concept Unit 3's block, before `return 0;`.

### Concept Lab

No separate throwaway: `int* nullPtr = nullptr;` is already the smallest possible demonstration.

Run it — verified this session:

```
$ ./dungeon.exe
...
=== Null Pointer ===
nullPtr value: 0
Pointer is null — not dereferencing.
```

**A real toolchain detail worth naming precisely:** `nullPtr` printed as the literal `0` on this exact build (GCC 14.2.0, MinGW-w64) — not `0x0` and not `(nil)`, both of which appear on other systems for the identical value. What matters is not the specific printed form but that it's a distinguishable, checkable value: `nullPtr != nullptr` (LAB-03's `!=`) evaluated `false`, so the `else` branch ran — the dereference on the `if` branch never executed at all, per LAB-03's own branching guarantee that exactly one side of an `if`/`else` runs.

### Mechanical Walkthrough

- `nullptr` — **(a) first appearance.** A type-safe constant (a genuine C++11 keyword, not a macro) meaning "this pointer holds no valid address." Distinguished from an *uninitialized* pointer (Concept Unit 4's Watch for): `nullptr` is a deliberate, checkable state; an uninitialized pointer's value is arbitrary and unknown.
- `nullPtr != nullptr` — **(c) already basic** (`!=`, LAB-03), applied here to compare a pointer against the `nullptr` constant.

### CS Lens

`nullptr` is a **sentinel value**, the same category LAB-07 introduced for the null terminator (`'\0'` marking "no more text") and `std::string::npos` (marking "not found") — here marking "this pointer intentionally names no location." Three different domains, one recurring pattern: a specific, reserved value standing in for "nothing here" so it can be checked rather than guessed at.

### SE Lens

`nullptr` (over the older `NULL` macro, which merely expands to the plain integer `0`, or a bare `0` written directly) is preferred in modern C++ specifically because it has a genuine pointer type — code that overloads a function differently for pointers versus integers (not exercised in this lesson, but a real category of code) can tell `nullptr` and the integer `0` apart, where `NULL`/`0` are ambiguous.

### Watch for

`nullptr` does not make dereferencing *safe* — `*nullPtr` (never executed in this lesson's own code, guarded by the `if` check) is still undefined behavior, and on nearly every real operating system, reading or writing address `0` triggers an immediate crash (a **segmentation fault**) rather than silently corrupting memory the way LAB-06's out-of-bounds array access could. `nullptr`'s value is *checkable before use* — that check, not the value itself, is what prevents the crash.

### Connection

Concept Unit 5 returns to LAB-06's arrays, now with pointer vocabulary in hand to explain exactly what `[]` was computing all along.

---

## Concept Unit 5: Pointer Arithmetic — Why Arrays Are Pointers

### The Problem

LAB-06 stated the address formula `base + index × element_size` and asserted that a function's array parameter "decays to a pointer," without ever showing a pointer being advanced through an array by hand. This unit closes that gap directly.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `main.cpp` — modified.
- **Change type:** Add (new section).
- **Location:** After Concept Unit 4's block, before `return 0;`.
- **Dependencies:** `char` arrays (LAB-06), pointer syntax (Concept Unit 2).

### The New Code

```cpp
std::cout << std::endl;
std::cout << "=== Array as Pointer ===" << std::endl;

char tiles[4] = {'.', '#', '.', '@'};

char* tilePtr = tiles;

for (int i = 0; i < 4; ++i) {
    std::cout << "tiles[" << i << "] is at: " << static_cast<void*>(tilePtr + i)
              << "   value: " << *(tilePtr + i)
              << "   (same as tiles[" << i << "] = " << tiles[i] << ")"
              << std::endl;
}
```

### The Updated Project

Appended after Concept Unit 4's block, before `return 0;` — this closes out the full assembled `main.cpp` for this lesson.

### Concept Lab

No separate throwaway: this real block, run below, already isolates the exact comparison it needs to make — `tiles[i]` against `*(tilePtr + i)`, side by side.

Run it — verified this session:

```
$ ./dungeon.exe
...
=== Array as Pointer ===
tiles[0] is at: 0x90251ff854   value: .   (same as tiles[0] = .)
tiles[1] is at: 0x90251ff855   value: #   (same as tiles[1] = #)
tiles[2] is at: 0x90251ff856   value: .   (same as tiles[2] = .)
tiles[3] is at: 0x90251ff857   value: @   (same as tiles[3] = @)
```

What that proves: `tilePtr + i`'s printed address advances by exactly `1` for each increment of `i` — `sizeof(char)` (LAB-01), matching LAB-06's address-arithmetic formula exactly. `*(tilePtr + i)` and `tiles[i]` printed identical values on every row — because `tiles[i]` *is* `*(tiles + i)`, per the C++ standard's own definition of `[]`: `[]` is defined in terms of pointer arithmetic and dereference, not the other way around. `tilePtr = tiles;` (Concept Unit 5's own declaration, no `&` needed) works because an array, used where a pointer is expected, already *is* the address of its first element — this is LAB-06's array-to-pointer decay, now happening explicitly at a plain assignment instead of implicitly at a function call.

### Mechanical Walkthrough

- `char* tilePtr = tiles;` — **(a) first appearance of assigning an array directly to a pointer, with no `&`.** `tiles`, used as a value here (not in a declaration or with `sizeof`), decays to `&tiles[0]` automatically — the identical decay LAB-06 proved happens when an array is passed as a function argument, shown here without a function call at all.
- `tilePtr + i` — **(a) first appearance of pointer arithmetic.** Adding an integer to a pointer does *not* add that many raw bytes — it adds `i × sizeof(*tilePtr)`, i.e., `i` elements' worth of bytes; here, `sizeof(char) = 1`, so `tilePtr + i` and "add `i` bytes" happen to coincide, but they are conceptually different operations that would diverge for any larger element type.
- `static_cast<void*>(tilePtr + i)` — **(a) first appearance of `void*` and `static_cast`.** `std::cout` treats a `char*` specially — printing it as C-string text (LAB-07), not as a raw address, because that's the far more common intent for a `char*`. Casting to `void*` — a generic pointer type carrying no information about what's stored at its address — forces `std::cout` to print the address itself instead. `static_cast<T>(value)` is C++'s explicit, checked way of requesting a type conversion the compiler wouldn't perform on its own; used here specifically because implicitly treating a `char*` as an address would be *silently* wrong for the far more common case of wanting to print actual text.

### CS Lens

`tiles[i]` compiling down to `*(tiles + i)` is not an implementation detail specific to this compiler — it's part of the C++ language definition itself: array subscripting *is defined as* pointer arithmetic plus dereference. Every array access in this entire curriculum, since LAB-06, has secretly been this.

### SE Lens

`tiles[i]` is still the form this course uses in real code, despite `*(tiles + i)` being exactly equivalent — the bracket form reads as "the element at position `i`," matching how a reader thinks about the data, where the pointer-arithmetic form reads as "a computed address, dereferenced," which is what's actually happening but is a worse match for the *intent* most code wants to express. Knowing the equivalence matters for understanding *why* out-of-bounds access (LAB-06) is dangerous and why array decay (LAB-06) happens the way it does — not for preferring one syntax over the other in day-to-day code.

### Connection

This closes every new pointer mechanism in this lesson — Concept Unit 6 names the ways pointers go wrong when these mechanisms are used carelessly, before the Closing section's `swap` challenge puts them to real use.

---

## Concept Unit 6: The Pointer Dangers — Wild, Dangling, and (Previewed) Double-Free

### The Problem

Every mechanism in this lesson — holding an address, dereferencing it, arithmetic on it — assumes the address is *valid*: that it still refers to memory the program is entitled to read or write. Nothing enforces that assumption automatically.

### No isolated code lab for this step

Two of the three dangers are demonstrated directly below since each needs to be *shown going wrong*, not built up incrementally as real project code (this lesson's own `main.cpp` never contains a genuine wild or dangling pointer).

### Concept Lab — the wild pointer

A wild pointer is simply Concept Unit 4's "uninitialized, not `nullptr`" case, already covered by that unit's own Watch for — restated here by name: `int* wild;` with no initializer holds whatever bits happened to already occupy that stack memory, which may coincidentally look like a plausible address. `*wild = 5;` would write `5` to that essentially random location — undefined behavior indistinguishable, in kind, from LAB-06's out-of-bounds array write. Prevention is the same in both cases: never leave a pointer uninitialized — assign a real address, or `nullptr`, always.

### Concept Lab — the dangling pointer

```cpp
// scratch_dangling.cpp  (disposable — deliberately reproduces a real bug)
#include <iostream>
int* createDanger() {
    int localVar = 42;
    return &localVar;
}
int main() {
    int* p = createDanger();
    std::cout << *p << std::endl;
}
```

Compiling — verified this session:

```
$ g++ scratch_dangling.cpp -o scratch_dangling -std=c++17 -Wall -Wextra
scratch_dangling.cpp:4:12: warning: address of local variable 'localVar' returned [-Wreturn-local-addr]
    4 |     return &localVar;
      |            ^~~~~~~~~
```

Running it anyway, to see the real consequence — verified this session:

```
$ ./scratch_dangling.exe
Segmentation fault
```

What that proves: `createDanger`'s stack frame (LAB-05) — including `localVar` — is reclaimed the instant `createDanger` returns (LAB-05's own explanation of the call stack). `p`, in `main`, holds `localVar`'s *old* address, which the program no longer owns in any meaningful sense; dereferencing it here crashed outright, verified this session on this exact machine — a real, observed segfault, not a hypothetical one. **This crash is not a guarantee, though** — dangling-pointer UB can just as easily appear to "work" on a different run, a different compiler, or a different optimization level, reading whatever now-unrelated data happens to occupy that reclaimed memory, which is precisely what makes this class of bug so dangerous: it does not reliably announce itself. GCC's own `-Wreturn-local-addr` warning, shown above, catches this *specific* shape (returning the address of a local variable) at compile time — worth treating as a hard stop, not an ignorable note.

This scratch file is discarded now; the real project never returns the address of a local variable.

### Explanation — double-free, previewed

A third danger, not reproducible yet with this lesson's own tools: deleting the same dynamically-allocated (heap) memory twice. `delete p;` followed by a second `delete p;` on the same pointer is undefined behavior — heap allocation and `delete` are introduced properly in LAB-09, where this danger becomes concrete rather than previewed.

### CS Lens

All three dangers — wild, dangling, double-free — share one root cause: a pointer's *type* (`int*`) says nothing at all about whether the address it currently holds is still valid. The type system that catches so many other mistakes at compile time (LAB-01's `sizeof` type-checking, LAB-03's `bool`-only conditions) has no equivalent check here — validity is a *runtime* property pointers don't carry, which is exactly why tools like AddressSanitizer (referenced in LAB-06, unavailable on this session's own toolchain per that lesson's own honest finding) exist to check it dynamically instead.

### SE Lens

These are not academic concerns reserved for advanced code — any function returning a pointer, any code interfacing with an OS API that hands back raw addresses (a real pattern this curriculum's later, systems-level series work with directly), and any hand-written dynamic-memory management (LAB-09) all carry these exact three risks. Recognizing the *shape* of each danger — a pointer outliving what it points to, a pointer never given a real value, a resource released more than once — matters more than memorizing these three specific code examples.

### Connection

The Closing Challenge below uses pointers for something constructive — modifying two variables through their addresses — putting Concept Units 2–3's write-through-a-pointer mechanism to real use, one final time, before LAB-09 offers a cleaner tool for the identical job.

---

## Closing

### Connect the pieces

Follow `score` through every pointer operation in this lesson: `&score` (Concept Unit 1) produces its address; `int* p = &score;` (Concept Unit 2) stores that address in a named variable; `*p` (Concept Unit 2) reads `score`'s current value through it; `*p = 999;` (Concept Unit 3) writes through it, changing `score` itself with no direct reference to `score`'s name on that line. Concept Unit 5 then proved this exact same mechanism — an address, held and followed — is what LAB-06's `tiles[i]` has been doing all along, just spelled with brackets instead of `*(pointer + offset)`. Concept Unit 6's dangers are what happens when the address a pointer holds stops being one the program can safely follow — verified directly, this session, as a real segmentation fault.

### What breaks without this

Deliberately dereferencing `nullPtr` — removing Concept Unit 4's `if` guard and running `std::cout << *nullPtr;` unconditionally — was not run in this project's own committed code, per that unit's own Watch for, but is entirely consistent with Concept Unit 6's verified dangling-pointer crash: address `0` is not memory this program owns, and reading it triggers the identical class of operating-system-level termination (a segmentation fault) observed there. The `!= nullptr` check is not a formality; it is the one line standing between "checked, safe" and "the same crash class verified in Concept Unit 6."

### Exercises

1. Add `char c = 'A';` between `score` and `health`'s declarations, print `&c`, and observe whether the gap between `score` and `health`'s addresses changed — compile and check for real; the compiler is free to reorder or pad local variables for alignment, so predicting the exact result without running it is not reliable.
2. Change `int score = 100` to `int score = 42`, rebuild, and confirm `*p` now reads `42` without `p`'s own declaration changing at all — `p` was never told to point somewhere new; the value at its target simply changed.
3. Build this lesson's `swap` Challenge: `void swap(int* a, int* b)`, using a temporary variable to exchange `*a` and `*b`. Call it as `swap(&x, &y)` on two `int`s and confirm, with real output, that the caller's originals swapped — not copies.
4. Reproduce Concept Unit 6's dangling-pointer crash yourself, in your own scratch file, and run it more than once if your system allows it — note whether it crashes identically every time, or whether the specific behavior varies, and connect what you observe back to this unit's own warning that UB is not guaranteed to behave the same way twice.

### Definition of done

- [ ] `main.cpp` declares a pointer, reads and writes through it, checks `nullptr` safely, and demonstrates pointer arithmetic matching `tiles[i]` exactly, index by index.
- [ ] The program compiles with zero warnings under `-std=c++17 -Wall -Wextra` in its final, committed form.
- [ ] Output matches this lesson's verified run (with your own, different addresses) exactly in structure.
- [ ] You can state, from Concept Unit 5's own proof, why `tiles[i]` and `*(tiles + i)` are not merely similar but identical.
- [ ] You can name and distinguish all three pointer dangers from Concept Unit 6, and explain why none of them are caught reliably by the compiler.
- [ ] The `swap` Challenge (Exercise 3) is built and verified with real output, and Exercise 4's repeated-run observation is recorded.
- [ ] Commit: `git add main.cpp && git commit -m "LAB-08: pointers, dereferencing, nullptr, and pointer arithmetic verified against LAB-06's arrays"` — states why (address-level understanding proven against real, run output, not just described) not just what changed.
