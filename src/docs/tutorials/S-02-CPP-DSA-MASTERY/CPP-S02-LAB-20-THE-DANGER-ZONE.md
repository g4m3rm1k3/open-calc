# CPP DSA — LAB-20 — The Danger Zone: Classic C++ Memory Bugs

**Prerequisites:** LAB-19 (Building a File-Backed Searchable Database)

## Quick Check

Before starting, answer these (answers at the bottom):

1. Why is "the program didn't crash" not the same as "the program is correct," for every bug in this lab?
2. What does "undefined behavior" mean in C++, specifically — what does the language standard actually guarantee (or not guarantee) once it occurs?
3. What is a memory sanitizer (like AddressSanitizer), and why would you want one running while you develop, rather than only when something's already visibly broken?

## What You Will Build

Nothing new gets built structurally — this lab is five deliberately broken pieces of code, each reproducing a real, classic C++ bug on purpose, diagnosed, then fixed and re-verified. This is the lab this series has been building toward since LAB-04: every data structure you've written in this series (`MyVector`, `MyLinkedList`, `MyHashMap`) is vulnerable to some version of these five bugs if handled carelessly — this lab is where you learn to recognize each one on sight, in your own future code, not just in these five staged examples.

```
$ ./danger_zone
[1] Dangling pointer:     REPRODUCED then FIXED
[2] Pointer invalidation: REPRODUCED then FIXED
[3] Off-by-one:           REPRODUCED then FIXED
[4] Memory leak:          REPRODUCED then FIXED (confirmed via leak count)
[5] Shallow-copy double-free: REPRODUCED then FIXED (cross-reference to LAB-04)
```

## Concept: Undefined Behavior — Why "It Didn't Crash" Proves Nothing

**What it is:** C++ has a category of mistakes the language standard calls **undefined behavior**: code that's syntactically legal, compiles without error, but has no defined meaning at all once executed — dereferencing a dangling pointer, reading past the end of an array, using memory after it's freed. Critically, the standard doesn't require the program to crash — it permits *literally anything* to happen: a crash, silently wrong output, or (most dangerously) apparently correct behavior that only breaks later, on a different machine, with different data, or after a compiler upgrade changes how the surrounding code happens to be optimized.

**The problem before:** Every lab in this series so far has assumed you write correct pointer/memory code the first time, following the patterns each lab taught. Real development doesn't work that way — bugs happen, and undefined behavior bugs are uniquely dangerous specifically *because* they don't reliably announce themselves. A dangling pointer that happens to still point at unreclaimed memory can "work" for weeks of testing and then fail the moment that memory gets reused for something else — which is very likely the exact experience behind "the implementations we were given were incorrect" and the vague, hard-to-pin-down "dangers" mentioned as motivation for this whole series: bugs that passed testing but were never actually correct.

**The solution:** Learn to recognize the five patterns below on sight, in your own code, before they cause a problem — and use tools built specifically to catch undefined behavior *even when it doesn't crash*. AddressSanitizer (built into `g++`/`clang++` via a compile flag, `-fsanitize=address`) instruments a program to detect memory errors — dangling pointer use, buffer overruns, leaks, double-frees — the instant they happen, with a precise report, rather than waiting for a possibly-much-later, possibly-silent failure.

**Canonical example (compiling with the sanitizer):**

```
$ g++ -fsanitize=address -g danger_zone.cpp -o danger_zone
$ ./danger_zone
==12345==ERROR: AddressSanitizer: heap-use-after-free ...
```

**Project Application:** Every structure this series built — `MyVector` (LAB-06), `MyLinkedList`/`MyDoublyLinkedList` (LAB-07/08), `MyHashMap` (LAB-14) — is directly vulnerable to specific bugs in this lab if their Rule of Three (LAB-04) is skipped, if raw pointers into them are held across a resize, or if their bounds aren't checked. This lab is the "why" behind nearly every "watch for" callout across the entire series, collected in one place.

**Watch for:** Trusting a program's apparent correctness during your own testing as proof it's actually correct. Every bug in this lab can pass casual testing and still be genuinely, dangerously wrong — that gap between "seemed to work" and "is actually correct" is this lab's entire subject.

## Step 1: Dangling pointers — returning the address of a local variable

```cpp
// BROKEN
int* makeDangerousInt() {
    int localValue = 42;
    return &localValue; // returning the ADDRESS of a variable that's about to be destroyed
} // localValue's lifetime ENDS here, the instant the function returns

int main() {
    int* danger = makeDangerousInt();
    std::cout << *danger << "\n"; // undefined behavior -- danger points at memory that's no longer valid
    return 0;
}
```

`localValue` is a stack variable — its lifetime ends the instant `makeDangerousInt` returns, exactly LAB-11's call-stack lesson: the stack frame is popped, and that memory is now free to be reused by whatever function is called next. The returned pointer still holds the *old* address — it's now **dangling**, pointing at memory the program no longer owns any claim to. Dereferencing it (`*danger`) might print `42` anyway (if nothing has overwritten that memory yet) or might print garbage, or crash — all three are "valid" outcomes for undefined behavior, which is exactly the danger: this bug can pass a quick test run and still be completely wrong.

**The fix:** never return the address of a local (stack) variable. Return by value instead (letting the caller own a fresh copy), or `new` the value on the heap and document clearly that the caller now owns it and must `delete` it (LAB-04's discipline), or — the most modern, safest option — return a smart pointer (briefly previewed in this lab's Challenge).

```cpp
// FIXED
int makeSafeInt() {
    int localValue = 42;
    return localValue; // returns a COPY of the value -- no address involved at all
}
```

### SAVE AND TRY

Compile and run the broken version. It may well print `42` correctly the *first* time — that's the trap. Now call `makeDangerousInt()` again in a loop several times, with some other function calls or local variable declarations mixed in between, and print each result — watch for the output eventually becoming wrong (a garbage value instead of `42`) as something else's stack usage overwrites the reclaimed memory. Then switch to `makeSafeInt()` and confirm it's correct every single time, with no dependency on what else happens to be using the stack.

## Step 2: Pointer invalidation — a pointer into `MyVector` that resize just broke

```cpp
// BROKEN
MyVector<int> vec;
vec.push_back(1);
vec.push_back(2);

int* firstElementPtr = &vec[0]; // a raw pointer INTO the vector's internal array
std::cout << "Before growth: " << *firstElementPtr << "\n"; // fine, prints 1

vec.push_back(3); // if this triggers a resize (LAB-06's grow()), the OLD array is delete[]-d,
                    // and a NEW array is allocated elsewhere -- firstElementPtr now points at FREED memory

std::cout << "After growth: " << *firstElementPtr << "\n"; // undefined behavior
```

This is LAB-06's `grow()` (from Step 4 of that lab) doing exactly what it's supposed to — allocating a new, bigger array, copying every element across, and freeing the old one — except a raw pointer taken *before* the resize still points at the now-freed old array. Nothing about `MyVector`'s implementation is wrong here; the bug is entirely in code that held onto a raw pointer into the vector's internals across an operation (`push_back`) that can invalidate it. This is a genuinely common, easy-to-miss real-world bug — the real `std::vector` has this exact same danger, documented but easy to forget.

**The fix:** never hold a raw pointer/reference into a dynamic array's contents across any operation that might resize it. If you need to refer to an element later, store its *index*, not a pointer to it — re-fetch `vec[index]` fresh each time, after confirming the vector hasn't been resized in a way that would invalidate the specific index too (removal, not just growth, can shift indices).

```cpp
// FIXED
MyVector<int> vec;
vec.push_back(1);
vec.push_back(2);

int firstElementIndex = 0; // store the INDEX, not a pointer
std::cout << "Before growth: " << vec[firstElementIndex] << "\n";

vec.push_back(3); // resize happens, but nothing we're holding onto was invalidated

std::cout << "After growth: " << vec[firstElementIndex] << "\n"; // still correct
```

### SAVE AND TRY

Run the broken version enough times, with enough `push_back` calls, that a resize is guaranteed to occur (recall LAB-06: capacity doubles at `1, 2, 4, 8, ...` — pushing past one of those thresholds triggers it) — print the vector's `data` pointer address before and after the resize (temporarily expose it, or infer it from LAB-06's internals) to directly confirm the underlying array's address actually changed, which is the literal reason the old raw pointer became invalid.

## Step 3: Off-by-one — the classic `<=` vs `<` buffer overrun

```cpp
// BROKEN
void printArray(int* arr, int size) {
    for (int i = 0; i <= size; i++) { // <= instead of < -- reads ONE PAST the valid range
        std::cout << arr[i] << " ";
    }
    std::cout << "\n";
}

int main() {
    int values[5] = {10, 20, 30, 40, 50};
    printArray(values, 5); // arr[5] is accessed -- one past the last VALID index (0-4)
    return 0;
}
```

Valid indices for a 5-element array are `0` through `4` — `arr[5]` reads memory immediately *past* the array's allocated bounds, which might be uninitialized garbage, might belong to a completely unrelated variable, or might (for a heap array) belong to the memory allocator's own internal bookkeeping. `<=` instead of `<` is possibly the single most common beginner C++ bug — it compiles cleanly, and for a stack array like this one, it very often "just works" by accident (reading whatever garbage or adjacent stack data happens to be there) without any visible crash, which is exactly why it survives into "working" code so easily.

**The fix:** use `<`, not `<=`, when looping up to (but not including) a size — or, better, avoid the raw index entirely by using `MyVector`'s bounds-checked `.at()` (LAB-06's Challenge) whenever correctness matters more than raw speed.

```cpp
// FIXED
void printArraySafe(int* arr, int size) {
    for (int i = 0; i < size; i++) { // < -- stops correctly at the last valid index
        std::cout << arr[i] << " ";
    }
    std::cout << "\n";
}
```

### SAVE AND TRY

Compile and run the broken version with `g++ -fsanitize=address` (this lab's concept section's exact tool). AddressSanitizer should report a `stack-buffer-overflow` (or similar) error the instant `arr[5]` is accessed — a precise, immediate diagnosis, compared to the plain (non-sanitized) build, which likely printed *some* value for `arr[5]` with no error at all, silently.

## Step 4: Memory leaks — losing the only pointer to allocated memory

```cpp
// BROKEN
void processData() {
    int* buffer = new int[1000];
    // ... use buffer for something ...

    if (someErrorCondition()) {
        return; // EARLY RETURN -- buffer is never delete[]-d on this path!
    }

    delete[] buffer; // only reached if someErrorCondition() was false
}
```

`buffer`'s allocated memory is only ever freed on *one* of the function's two exit paths — the early `return` inside the `if` skips the `delete[]` entirely. This is a **memory leak**: the memory is still allocated, still tracked by the heap allocator as "in use," but the *only* pointer that ever referenced it (`buffer`, a local variable) has just gone out of scope — nothing in the program can ever reach that memory again to free it. Call `processData()` repeatedly with `someErrorCondition()` true, and the program's memory usage grows without bound, forever, exactly LAB-95's leak lesson from the SE Masterclass series (a JS garbage-collection leak, caused by an unreachable-but-still-referenced object) — arriving here in C++ form, except with no garbage collector to eventually reclaim it at all.

**The fix, immediately:** use RAII (LAB-04) — wrap the raw `new`/`delete[]` in a class whose destructor handles cleanup automatically, so *every* exit path (early return, exception, normal completion) triggers the destructor and frees the memory, with no path left that can forget.

```cpp
// FIXED -- using LAB-04's Buffer class instead of a raw new[]/delete[] pair
void processDataSafe() {
    Buffer buffer(1000); // constructor acquires; destructor WILL run on every exit path

    if (someErrorCondition()) {
        return; // Buffer's destructor still runs here automatically -- no leak possible
    }

    // no explicit delete needed anywhere -- RAII handles it
}
```

### SAVE AND TRY

Compile the broken version with `-fsanitize=address` and run it with `someErrorCondition()` forced to `true`. AddressSanitizer reports leaks at program exit (a `LeakSanitizer` summary, usually printed automatically alongside AddressSanitizer) — confirm it reports exactly the `1000 * sizeof(int)` bytes as leaked, then switch to `processDataSafe()` using LAB-04's `Buffer` and confirm the leak report disappears entirely.

## 🎯 Challenge

The fifth classic bug — shallow-copy double-free — was already fully reproduced and fixed in LAB-04's `BrokenBuffer`/`Buffer`. Revisit that lab now, with this lab's broader "undefined behavior means no guarantee, not a guaranteed crash" framing in mind, and compile LAB-04's broken version with `-fsanitize=address` (if you didn't already). Then research (briefly) `std::unique_ptr` and `std::shared_ptr` — C++'s standard-library smart pointers — and write one paragraph explaining, in your own words, how each one would have prevented the *specific* bug LAB-04 demonstrated, without you needing to hand-write a destructor, copy constructor, or copy assignment operator at all.

<details>
<summary>Solution</summary>

Compiling LAB-04's `broken_main.cpp` with `-fsanitize=address` should report a `double-free` (or `heap-use-after-free`, depending on timing) error pointing directly at the second destructor call — the exact bug LAB-04's Step 1 asked you to reproduce and observe, now diagnosed precisely instead of just "crashed, or maybe didn't."

On smart pointers, briefly: `std::unique_ptr<T>` owns a heap allocation exclusively — it cannot be copied at all (the compiler rejects it outright, turning LAB-04's entire bug class into a compile-time error instead of a runtime one), only *moved* (LAB-04's Challenge previewed exactly this). `std::shared_ptr<T>` allows multiple owners by maintaining an internal reference count — copying a `shared_ptr` increments the count instead of copying the raw pointer unsafely, and the underlying memory is only actually freed once the *last* owning `shared_ptr` is destroyed, the count reaching zero. Both types wrap exactly the Rule of Three discipline LAB-04 taught by hand into a reusable, pre-built class — this series deliberately built everything from raw pointers first specifically so this payoff (seeing exactly what a smart pointer is automating) actually means something now, rather than being an opaque "just use this" instruction with no understanding behind it.

</details>

## Mental Model

| Bug | What it looks like | The fix |
|---|---|---|
| Dangling pointer | Returning `&localVariable` from a function | Return by value, or heap-allocate with clear ownership |
| Pointer invalidation | A raw pointer into a container, held across a resize | Store an index, not a pointer; re-fetch after any resize |
| Off-by-one | `<=` instead of `<` in a bounds loop | Use `<`, or bounds-checked `.at()` (LAB-06) |
| Memory leak | An early `return`/exception skipping `delete` | RAII (LAB-04) — destructor runs on every exit path automatically |
| Shallow-copy double-free | Copying a class with a raw pointer, no Rule of Three | Full Rule of Three (LAB-04), or a smart pointer |

## Final Check

| # | Question | Your answer |
|---|---|---|
| 1 | Why can a dangling-pointer bug "work" during testing and still be genuinely broken? | |
| 2 | Why does storing an index instead of a pointer avoid LAB-06's resize-invalidation bug? | |
| 3 | Why does RAII (LAB-04) fix the early-return memory leak from Step 4 without requiring the programmer to remember anything at each new exit path added later? | |

## Quick Check Answers

1. Because undefined behavior is, by definition, not required to crash — a crash is only one of many "valid" (in the sense of "not forbidden by the standard") outcomes; silently wrong output, or output that happens to look correct by coincidence, are equally valid outcomes the standard permits, which is exactly why passing a test run proves nothing about correctness for this category of bug.
2. Once undefined behavior occurs, the C++ standard makes precisely zero guarantees about what happens next — not "it will probably crash," not "it will corrupt nearby memory," literally no guarantee at all; the actual observed behavior depends on the compiler, optimization settings, what memory happens to be nearby, and can differ between runs of the identical compiled program.
3. It's a tool (AddressSanitizer being one specific, widely-used example) that instruments a compiled program to detect memory errors — dangling pointer use, buffer overruns, leaks, double-frees — at the exact moment they occur, with a precise report of what happened and where; running it continuously during development catches these bugs immediately, at the point of the mistake, rather than waiting for them to eventually manifest as a confusing, hard-to-trace failure much later, possibly in production.

*Next: [LAB-21 — Capstone: The In-Memory Record Store](CPP-S02-LAB-21-CAPSTONE.md)*
