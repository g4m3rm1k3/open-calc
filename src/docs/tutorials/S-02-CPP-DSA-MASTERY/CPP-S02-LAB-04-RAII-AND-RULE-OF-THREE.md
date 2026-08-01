# CPP DSA — LAB-04 — RAII, Destructors, and the Rule of Three

**Prerequisites:** LAB-03 (Operator Overloading)

## Quick Check

Before starting, answer these (answers at the bottom):

1. In C++, when does a local object's destructor run, exactly — what event triggers it?
2. If a class holds a raw pointer to heap memory and you *don't* write a custom copy constructor, what does the compiler's default copy constructor do to that pointer?
3. What does "double free" mean, and why does it crash a program instead of just being a harmless no-op?

## What You Will Build

A `Buffer` class that owns a raw `int*` array on the heap — first built *without* proper copying (deliberately reproducing a crash), then fixed with a real copy constructor, copy assignment operator, and destructor, so copying a `Buffer` is actually safe. This is the single most important lab in this series for understanding why every hand-built data structure from LAB-06 onward is written the way it is.

```
$ ./buffer_demo
--- BROKEN VERSION ---
Buffer b1 created, data[0] = 42
Buffer b2 = b1 (copied)
b2 destroyed
free(): double free detected in tcache 2
Aborted (core dumped)

--- FIXED VERSION ---
Buffer b1 created, data[0] = 42
Buffer b2 = b1 (deep copied)
b2 destroyed -- only b2's memory freed
b1 still valid, data[0] = 42
b1 destroyed -- clean exit
```

## Concept: RAII — Resource Acquisition Is Initialization

**What it is:** RAII is the C++ idiom where a resource (heap memory, a file handle, a network connection) is acquired in a class's **constructor** and released in its **destructor** — tying the resource's lifetime directly to the object's lifetime. A destructor (`~ClassName()`) runs automatically the instant an object goes out of scope, with zero manual cleanup code required at every call site. The **Rule of Three** says: if a class needs a custom destructor, it almost certainly also needs a custom **copy constructor** and **copy assignment operator** — because the default, compiler-generated versions of all three only do the right thing for simple classes with no owned resources.

**The problem before:** Say `Buffer` allocates `int* data = new int[size];` in its constructor. If you never write a destructor, that memory is never freed — a **memory leak**, silent and easy to miss. Worse: if you write a destructor that calls `delete[] data;`, but never write a custom copy constructor, the *compiler's default* copy constructor copies the raw pointer value — not the data it points to. Now two separate `Buffer` objects both hold the exact same memory address. When the first one is destroyed, its destructor frees that memory. When the second one is later destroyed, its destructor tries to free the *same* memory *again* — a **double free**, which corrupts the heap's internal bookkeeping and crashes the program, often with a confusing error far from the actual bug's location.

**The solution:** Write all three together. The destructor frees what the constructor acquired. The copy constructor performs a **deep copy** — allocating *new*, separate memory and copying the actual values into it, so two `Buffer` objects never share the same underlying allocation. The copy assignment operator (`operator=`) does the same thing for `b2 = b1` (assigning to an *already-existing* object) as the copy constructor does for `Buffer b2 = b1` (creating a *brand-new* object as a copy) — a subtly different situation that needs its own, separate implementation.

**Canonical example:**

```cpp
class Buffer {
private:
    int* data;
    int size;
public:
    Buffer(int s) : size(s), data(new int[s]) {}
    ~Buffer() { delete[] data; }                          // release what the constructor acquired
    Buffer(const Buffer& other);                           // deep copy on construction
    Buffer& operator=(const Buffer& other);                 // deep copy on assignment
};
```

**Project Application:** Every heap-owning structure in this series — `MyVector` (LAB-06), `MyLinkedList` (LAB-07), `MyHashMap` (LAB-14) — needs exactly this Rule of Three treatment. LAB-20's "Danger Zone" lab is built entirely around bugs that happen when a class skips this discipline; this lab is where you learn *why* those bugs happen, not just that they exist.

**Watch for:** Writing a destructor but forgetting the copy constructor and copy assignment operator — the single most common source of a C++ program that crashes seemingly at random, far from where the actual mistake (an unguarded copy) happened. If your class manages a raw resource, all three members of the Rule of Three come as a set, not individually.

## Step 1: The broken version — reproducing the double-free on purpose

```cpp
// BrokenBuffer.h
#ifndef BROKEN_BUFFER_H
#define BROKEN_BUFFER_H

class BrokenBuffer {
public:
    int* data;
    int size;

    BrokenBuffer(int s) : size(s), data(new int[s]) {
        data[0] = 42;
    }

    ~BrokenBuffer() {
        delete[] data; // frees the memory -- but see what happens on copy, below
    }
    // NO copy constructor, NO copy assignment operator written --
    // the compiler generates default ones that just copy the POINTER VALUE
};

#endif
```

```cpp
// broken_main.cpp
#include "BrokenBuffer.h"
#include <iostream>

int main() {
    BrokenBuffer b1(10);
    std::cout << "Buffer b1 created, data[0] = " << b1.data[0] << "\n";

    BrokenBuffer b2 = b1; // COPY CONSTRUCTOR runs here -- the compiler-generated default one
    std::cout << "Buffer b2 = b1 (copied)\n";

    // b2 and b1 now both hold the SAME pointer value in b2.data / b1.data.
    // When b2 goes out of scope first, its destructor frees that memory.
    // When b1 goes out of scope next, its destructor tries to free the SAME memory again.
    return 0; // <-- crash happens here, or right before, depending on your platform
}
```

The default copy constructor the compiler silently generates (because none was written) does a **shallow copy**: it copies `data` and `size` field-by-field, meaning `b2.data` ends up holding the *exact same address* as `b1.data` — not a new array with the same values. Both objects now believe they independently own that memory. Neither does.

### SAVE AND TRY

Compile and run this (a real crash is expected and is the point — don't be alarmed). On most systems this either crashes with a `double free` / heap corruption message, or in undefined-behavior fashion silently corrupts something else. If it doesn't visibly crash on your machine, that's not proof it's safe — undefined behavior means the language makes zero guarantees, including the guarantee it'll crash loudly enough for you to notice.

## Step 2: `Buffer.h` — declaring all three, and a destructor

```cpp
// Buffer.h
#ifndef BUFFER_H
#define BUFFER_H

class Buffer {
private:
    int* data;
    int size;

public:
    Buffer(int s);
    ~Buffer();
    Buffer(const Buffer& other);              // copy constructor
    Buffer& operator=(const Buffer& other);    // copy assignment operator

    int get(int index) const;
    void set(int index, int value);
    int getSize() const;
};

#endif
```

Four special members declared together on purpose: the constructor (acquires), the destructor (releases — note the `~` prefix, and no return type, and no parameters), and both copy operations (deep-copy). Declaring them all in one place in the header is a visible signal to any reader of this class: "this class owns a resource, and here's the complete set of rules for how it's managed."

### SAVE AND TRY

Before writing any definitions, just get this header to compile as part of an otherwise-empty `Buffer.cpp` with stub bodies (`Buffer::Buffer(int s) {}`, etc. — empty for now). Confirm it compiles cleanly — this proves the *declarations* are syntactically correct before you commit to writing real logic inside each one.

## Step 3: The destructor and a correct copy constructor

```cpp
// Buffer.cpp
#include "Buffer.h"

Buffer::Buffer(int s) : size(s), data(new int[s]) {
    for (int i = 0; i < size; i++) data[i] = 0;
}

Buffer::~Buffer() {
    delete[] data;
}

Buffer::Buffer(const Buffer& other) : size(other.size), data(new int[other.size]) {
    for (int i = 0; i < size; i++) {
        data[i] = other.data[i]; // copy the VALUES, not the pointer
    }
}
```

The copy constructor allocates its *own* new array (`new int[other.size]`) — a completely separate block of heap memory from `other.data` — then copies each individual value across. After this runs, `data` and `other.data` are two different addresses holding equal values; changing one array afterward has zero effect on the other. This is the deep copy the concept section named: not "same data shared by two objects," but "two independent, equal copies of the data."

### SAVE AND TRY

```cpp
Buffer b1(5);
b1.set(0, 42);
Buffer b2 = b1; // now using the REAL copy constructor
b2.set(0, 999); // change b2's copy
std::cout << "b1[0] = " << b1.get(0) << ", b2[0] = " << b2.get(0) << "\n";
// b1[0] = 42, b2[0] = 999  -- proves they're independent, not sharing memory
```

If this printed `999, 999` instead, that would mean the copy was still shallow — confirm you see two *different* values, direct proof the deep copy actually happened.

## Step 4: Copy assignment — the trickier fourth case

```cpp
Buffer& Buffer::operator=(const Buffer& other) {
    if (this == &other) {
        return *this; // self-assignment guard: `b1 = b1;` must not destroy its own data before copying it
    }

    delete[] data; // free THIS object's existing memory before replacing it

    size = other.size;
    data = new int[size];
    for (int i = 0; i < size; i++) {
        data[i] = other.data[i];
    }

    return *this;
}
```

Copy assignment is a genuinely different situation from the copy constructor: `b2 = b1` means `b2` **already exists** and already owns its own memory — that old memory must be freed *before* the new copy is made, or it leaks. The `this == &other` self-assignment guard handles a specific, easy-to-miss edge case: `b1 = b1;` (assigning an object to itself) would, without the guard, `delete[]` `data` and then immediately try to read from `other.data` — which is the exact same, now-freed memory, since `other` *is* `b1`. Returning `*this` (by reference) is what makes chained assignment like `a = b = c;` work, exactly parallel to LAB-03's `operator<<` returning its stream.

### SAVE AND TRY

```cpp
Buffer b1(5);
b1.set(0, 42);
Buffer b2(3);
b2 = b1; // copy ASSIGNMENT, not construction -- b2 already existed
std::cout << "b2[0] after assignment = " << b2.get(0) << "\n"; // 42

b1 = b1; // self-assignment -- must not crash
std::cout << "b1[0] after self-assignment = " << b1.get(0) << "\n"; // still 42, no crash
```

Confirm both lines run without crashing — especially the self-assignment line, which is exactly the case the `this == &other` guard exists to protect.

## 🎯 Challenge

Add a `Buffer(Buffer&& other) noexcept` **move constructor** — instead of deep-copying `other`'s data, it *steals* `other`'s pointer directly (fast, no new allocation) and sets `other.data = nullptr` so `other`'s destructor doesn't also try to free the now-stolen memory. This is a preview of move semantics, a topic this series doesn't cover in full depth but is worth a first look here since it directly builds on everything this lab just taught.

<details>
<summary>Solution</summary>

```cpp
// Buffer.h -- add
Buffer(Buffer&& other) noexcept;
```

```cpp
// Buffer.cpp
Buffer::Buffer(Buffer&& other) noexcept : size(other.size), data(other.data) {
    other.data = nullptr; // critical: prevent other's destructor from freeing memory we now own
    other.size = 0;
}
```

`Buffer&&` (an rvalue reference) matches temporary, about-to-be-destroyed `Buffer` objects — for those, there's no point deep-copying, since the source is going away anyway; just take its pointer directly. Setting `other.data = nullptr` is what makes this safe: `delete[] nullptr;` is explicitly defined by the language to do nothing at all, so when `other`'s destructor eventually runs, it safely no-ops instead of double-freeing memory this new object now owns. This is the exact same "who owns this memory, and does the destructor need to know it shouldn't free it" reasoning as the rest of the lab, just applied to a transfer of ownership instead of a duplication of it.

</details>

## Mental Model

| Concept | Wrong instinct | Correct instinct |
|---|---|---|
| Destructor timing | Whenever the garbage collector gets to it | Immediately, deterministically, the instant the object goes out of scope |
| Copying a class with a raw pointer | The default copy is "probably fine" | The default copy copies the pointer VALUE — shallow, and dangerous |
| Copy constructor vs. copy assignment | Same thing, one function covers both | Two different situations: constructing new vs. replacing existing — need separate code |
| Self-assignment (`b1 = b1`) | An edge case not worth handling | Handle it explicitly, or a naive assignment operator frees data before reading it |

## Final Check

| # | Question | Your answer |
|---|---|---|
| 1 | Why does the broken version's crash happen at the SECOND destructor call, not the first? | |
| 2 | Why must copy assignment `delete[]` its OWN existing data before copying from `other`, while the copy constructor doesn't need to? | |
| 3 | What specifically would go wrong if `operator=` didn't check `this == &other`? | |

## Quick Check Answers

1. A local object's destructor runs automatically the moment it goes out of scope — when the enclosing block (a function body, a loop iteration) ends, in reverse order of construction, with zero manual code required at the call site.
2. The compiler's default copy constructor copies each member field exactly as stored — for a raw pointer, that means copying the address itself, not allocating new memory and copying the pointed-to values, leaving two objects pointing at the same block of memory.
3. Freeing the same block of memory twice corrupts the memory allocator's internal bookkeeping (which tracks what's free and what's in use) — the second `delete`/`delete[]` operates on data the allocator no longer considers valid, and most allocators detect this inconsistency and abort the program rather than silently continuing in a corrupted state.

*Next: [LAB-05 — Templates](CPP-S02-LAB-05-TEMPLATES.md)*
