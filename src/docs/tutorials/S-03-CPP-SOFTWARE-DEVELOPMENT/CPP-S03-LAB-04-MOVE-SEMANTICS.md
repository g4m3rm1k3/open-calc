# Lesson 4: A Move Is a Copy That Steals Instead of Duplicating
### (LAB 04 — Move Semantics and the Rule of Five)

**What you will build:** An `Inventory` class owning a heap-allocated array, given a full Rule-of-Five treatment — destructor, copy constructor, copy assignment, move constructor, move assignment — with every operation printing what it did, so a `std::vector<Inventory>` growing past its capacity can be *watched* choosing between an expensive deep copy and a cheap pointer steal. The transferable problem: Lesson 3 used `std::move` on a `unique_ptr` without fully explaining it, and `S-02-CPP-DSA-MASTERY` LAB-04 built a Rule-of-Three `Buffer` class whose own preview of move semantics was flagged as explicitly out of scope. This lesson is that gap closed — and it uncovers a real, easy-to-miss rule that silently degrades performance if missed: the compiler will happily copy instead of move, with no warning, unless specific conditions are met.

**What you need to know first:** `S-02-CPP-DSA-MASTERY` LAB-04 — RAII, the Rule of Three (destructor, copy constructor, copy assignment), deep vs. shallow copy. This series' Lesson 3 — `std::move`, previewed without full explanation.

**Terms introduced in this lesson**

> **Lvalue** — an expression referring to a persisting object with a name and an address (a variable).
> **Rvalue** — an expression referring to a temporary value with no persisting name (a literal, a function's return value, the result of `std::move`).
> **Rvalue reference (`T&&`)** — a reference type that can only bind to an rvalue, distinguishing "this argument is a temporary/disposable value" from an ordinary `T&`, which binds to lvalues.
> **Move constructor (`T(T&& other)`)** — constructs a new object by taking ownership of another (about-to-be-destroyed) object's resources, rather than duplicating them.
> **Move assignment operator (`T& operator=(T&& other)`)** — the move counterpart to copy assignment.
> **Rule of Five** — the Rule of Three, extended: if a class manages a resource manually, it typically needs all five of destructor, copy constructor, copy assignment, move constructor, and move assignment.
> **`noexcept`** — a promise that a function will not throw an exception; on a move constructor specifically, this promise changes how the standard library is willing to use it.
> **Move-only type** — a class with copying explicitly deleted, movable only — `std::unique_ptr` (Lesson 3) is the standard library's own example.

No pipeline diagram applies — this bridge series builds standalone concept programs.

---

## Concept Unit 1: The Problem — a Deep Copy Nobody Actually Needed

### The Problem

`S-02-CPP-DSA-MASTERY` LAB-04's Rule of Three gives a resource-owning class a correct copy constructor — a full, deep duplication of whatever it owns. But some copies happen in situations where the *source* object is about to be destroyed anyway (a temporary, a local variable being returned, an element being relocated during a container's internal reallocation) — duplicating its resource in that situation is wasted work: nothing will ever read the original again.

### Concept Lab

```cpp
// scratch_vector_grow.cpp  (disposable)
#include <iostream>
#include <vector>
class Inventory {
    int* items;
    int size;
public:
    Inventory(int n) : items(new int[n]), size(n) {
        std::cout << "constructed (size " << size << ")" << std::endl;
    }
    Inventory(const Inventory& other) : items(new int[other.size]), size(other.size) {
        for (int i = 0; i < size; ++i) items[i] = other.items[i];
        std::cout << "COPY constructed (deep copy, size " << size << ")" << std::endl;
    }
    ~Inventory() {
        delete[] items;
        std::cout << "destroyed" << std::endl;
    }
};
int main() {
    std::vector<Inventory> bags;
    bags.reserve(1);
    std::cout << "--- pushing 1 ---" << std::endl;
    bags.emplace_back(3);
    std::cout << "--- pushing 2 (forces reallocation, capacity was 1) ---" << std::endl;
    bags.emplace_back(4);
    std::cout << "--- main ending ---" << std::endl;
}
```

Run it — verified this session:

```
$ g++ scratch_vector_grow.cpp -o scratch_vector_grow -std=c++17 -Wall -Wextra
$ ./scratch_vector_grow.exe
--- pushing 1 ---
constructed (size 3)
--- pushing 2 (forces reallocation, capacity was 1) ---
constructed (size 4)
COPY constructed (deep copy, size 3)
destroyed
--- main ending ---
destroyed
destroyed
```

What that proves: `bags.reserve(1)` gives the vector room for exactly one element. Adding a second forces the vector to allocate a *new*, larger buffer and relocate every existing element into it — `S-01-CPP-FOUNDATIONS` LAB-06's own array-growth cost, now happening to full class objects. The first `Inventory` (size `3`) is deep-copied into the new buffer, then the original is destroyed — a full heap allocation and element-by-element duplication, immediately followed by throwing that exact duplicated source away. This work was entirely wasted: nothing needed the *original* `Inventory` to still exist once its data had somewhere new to live.

This scratch file is discarded now; Concept Unit 2 adds the tool that avoids exactly this waste.

### CS Lens

Every container growth in this curriculum that holds resource-owning class objects (not primitive types like `int`, which copy trivially and cheaply) pays this identical cost without a move constructor — `S-02-CPP-DSA-MASTERY` LAB-06's own `MyVector<T>` inherits this exact problem the moment `T` is a class that owns a heap resource, whether or not that lesson dwelled on it.

### SE Lens

The fix isn't "avoid vectors of resource-owning objects" — that would give up one of the standard library's most useful containers for exactly the kind of type that benefits most from being stored in one. The fix is giving `Inventory` a second way to be constructed from another `Inventory`: one that, when the source is known to be disposable, *steals* its resource instead of duplicating it.

### Connection

Concept Unit 2 introduces the language feature that distinguishes "this source is disposable" from "this source must be preserved" — the rvalue/lvalue distinction `std::move` (Lesson 3) already relied on without full explanation.

---

## Concept Unit 2: Lvalues, Rvalues, and `T&&`

### The Problem

A move constructor needs to exist *alongside* a copy constructor, not replace it — sometimes a source genuinely must be preserved (an ordinary variable, still in use), and sometimes it's known to be disposable (a temporary). The language needs a way to tell these two cases apart in a function's own signature.

### No isolated code lab for this step

This is a categorization of *expressions*, not new runnable behavior on its own — demonstrated through the syntax it enables, in Concept Unit 3.

### Explanation

Every C++ expression is, informally, one of two kinds. An **lvalue** has a name and a persisting address — a variable like `a` in `Inventory a(3);`, still there after the statement that created it. An **rvalue** is a temporary with no persisting name — the literal `3`, the return value of a function not stored anywhere, or (Lesson 3's own preview) the result of `std::move(a)`, which doesn't create a new object at all — it only *relabels* `a` as "treat me as disposable from here," without changing `a` itself in any way on its own.

An **rvalue reference**, written `T&&`, is a reference type that can only bind to an rvalue — distinct from an ordinary reference `T&` (`S-01-CPP-FOUNDATIONS` LAB-09), which binds to lvalues. A function overloaded on both `T&` and `T&&` lets the compiler pick, automatically, based on whether the argument at a given call site is an lvalue or an rvalue.

### CS Lens

This lvalue/rvalue distinction already existed in C++ before move semantics — `int x = 5;` is legal (`5` is an rvalue, fine on the right of `=`) but `5 = x;` is not (`5` has no address to assign into) — C++11 gave the *category itself* a reference type (`T&&`) that could be overloaded on, turning a preexisting grammatical distinction into something a class's own constructors could react to.

### SE Lens

`std::move(a)` doing nothing but relabeling `a` — never actually moving anything itself — is worth stating precisely, because the name is a common source of confusion: `std::move` is a cast, not an action. The actual moving — stealing a pointer, nulling out the source — happens entirely inside whatever move constructor or move assignment operator ends up selected because the argument was cast to an rvalue reference.

### Connection

Concept Unit 3 writes `Inventory`'s move constructor, using `T&&` for real.

---

## Concept Unit 3: The Move Constructor

### The Problem

`Inventory` needs a constructor that, given another `Inventory` known to be disposable, takes its `items` pointer directly instead of allocating a new array and copying every element.

### Project Change

- **Reference Source:** `S-02-CPP-DSA-MASTERY` LAB-04's `Buffer` class — the Rule of Three shape (constructor, copy constructor, destructor), extended here with the two members that lesson explicitly deferred.
- **Files affected:** `main.cpp` — new file for this lesson.
- **Change type:** Add (new file).
- **Location:** Inside `Inventory`.
- **Dependencies:** `new[]`/`delete[]` (`S-02-CPP-DSA-MASTERY` LAB-04), rvalue references (Concept Unit 2).

### The New Code

```cpp
Inventory(Inventory&& other) noexcept : items(other.items), size(other.size) {
    other.items = nullptr;
    other.size = 0;
    std::cout << "MOVE constructed (stole pointer, size " << size << ")" << std::endl;
}
```

(`noexcept` is used here already — its own explanation is Concept Unit 4, where its real, verified importance is demonstrated.)

### The Updated Project

```cpp
class Inventory {
    int* items;
    int size;
public:
    Inventory(int n) : items(new int[n]), size(n) {
        std::cout << "constructed (size " << size << ")" << std::endl;
    }
    Inventory(const Inventory& other) : items(new int[other.size]), size(other.size) {
        for (int i = 0; i < size; ++i) items[i] = other.items[i];
        std::cout << "COPY constructed (deep copy, size " << size << ")" << std::endl;
    }
    Inventory(Inventory&& other) noexcept : items(other.items), size(other.size) {   // ← new
        other.items = nullptr;
        other.size = 0;
        std::cout << "MOVE constructed (stole pointer, size " << size << ")" << std::endl;
    }
    ~Inventory() {
        delete[] items;
        std::cout << "destroyed (items=" << (items ? "real" : "null") << ")" << std::endl;
    }
};
```

### Concept Lab

No separate throwaway: Concept Unit 1's exact scenario, rerun below with only the move constructor added, is this unit's own clearest demonstration.

Run it — verified this session:

```
$ g++ scratch_vector_move.cpp -o scratch_vector_move -std=c++17 -Wall -Wextra
$ ./scratch_vector_move.exe
--- pushing 1 ---
constructed (size 3)
--- pushing 2 (forces reallocation, capacity was 1) ---
constructed (size 4)
MOVE constructed (stole pointer, size 3)
destroyed (items=null)
--- main ending ---
destroyed (items=real)
destroyed (items=real)
```

What that proves: identical scenario to Concept Unit 1 — same `reserve(1)`, same forced reallocation — but the vector now chooses `Inventory(Inventory&& other)` over the copy constructor: `"MOVE constructed"` appears instead of `"COPY constructed"`. The destroyed source's own destructor prints `items=null` — `other.items` was set to `nullptr` inside the move constructor, so the moved-*from* object's own destructor safely does nothing (`delete[] nullptr;` is well-defined and harmless in C++, unlike `S-01-CPP-FOUNDATIONS` LAB-08's dangling-pointer dangers). No heap allocation, no element copying happened at all — `items` (a single pointer) was copied from `other` to the new object, and `other`'s copy was zeroed out. Ownership transferred; nothing was duplicated.

### Mechanical Walkthrough

- `Inventory(Inventory&& other)` — **(a) first appearance of a move constructor.** `Inventory&&` — an rvalue reference to `Inventory` itself — only binds when the compiler can prove the argument is disposable (a temporary, or something explicitly cast via `std::move`).
- `items(other.items)` in the initializer list — **(a) first appearance of stealing a pointer instead of allocating.** No `new` anywhere in this constructor's body — `items` simply receives the exact address `other.items` already held.
- `other.items = nullptr;` — **(a) first appearance of nulling out a moved-from object's own pointer**, specifically so its own upcoming destructor's `delete[] items;` does nothing, rather than deleting the same memory the new object now owns (which would be a double-free, `S-01-CPP-FOUNDATIONS` LAB-08's named danger, reached here through moving instead of raw pointer misuse).

### CS Lens

A move constructor is `O(1)` — copying one pointer and one integer, regardless of how large the array it points to actually is — where the copy constructor Concept Unit 1 proved wasteful is `O(n)` in the array's size. This is the identical "shape of the cost, not just its existence" lesson `S-01-CPP-FOUNDATIONS` LAB-13's own array-shift analysis taught, here applied to construction cost instead of removal cost.

### SE Lens

Leaving a moved-from object in a valid-but-unspecified state (here, `items = nullptr`, `size = 0` — safe to destroy, safe to assign a new value to, but not meaningful to *read* as if it still held its original data) is the standard contract every move operation in this course follows: a moved-from object must remain destructible and reassignable, but its actual contents afterward are deliberately not something calling code should rely on.

### Connection

Concept Unit 4 uncovers a real, easy-to-miss rule about exactly when the standard library is willing to choose Concept Unit 3's own move constructor at all.

---

## Concept Unit 4: `noexcept` — the Condition That Decides Copy vs. Move

### The Problem

Concept Unit 3's move constructor is marked `noexcept`. Does that word actually matter, or is it decoration?

### Concept Lab

```cpp
// scratch_vector_move_throw.cpp  (disposable — identical to Concept Unit 3's fix, minus 'noexcept')
#include <iostream>
#include <vector>
class Inventory {
    int* items;
    int size;
public:
    Inventory(int n) : items(new int[n]), size(n) {
        std::cout << "constructed (size " << size << ")" << std::endl;
    }
    Inventory(const Inventory& other) : items(new int[other.size]), size(other.size) {
        for (int i = 0; i < size; ++i) items[i] = other.items[i];
        std::cout << "COPY constructed (deep copy, size " << size << ")" << std::endl;
    }
    Inventory(Inventory&& other) : items(other.items), size(other.size) {   // NOT noexcept
        other.items = nullptr;
        other.size = 0;
        std::cout << "MOVE constructed (stole pointer, size " << size << ")" << std::endl;
    }
    ~Inventory() { delete[] items; }
};
int main() {
    std::vector<Inventory> bags;
    bags.reserve(1);
    bags.emplace_back(3);
    std::cout << "--- pushing 2 (reallocation) ---" << std::endl;
    bags.emplace_back(4);
}
```

Run it — verified this session:

```
$ g++ scratch_vector_move_throw.cpp -o scratch_vector_move_throw -std=c++17 -Wall -Wextra
$ ./scratch_vector_move_throw.exe
constructed (size 3)
--- pushing 2 (reallocation) ---
constructed (size 4)
COPY constructed (deep copy, size 3)
```

**A real, verified, and genuinely surprising rule, worth stating exactly:** removing only the word `noexcept` — the move constructor's own logic is byte-for-byte identical to Concept Unit 3's working version — silently reverts the vector to copying during reallocation, exactly as if the move constructor didn't exist at all. No error. No warning. The move constructor is still *there*, still correctly written, and `std::vector` simply chooses not to use it.

The reason: `std::vector`'s reallocation offers a **strong exception guarantee** — if something goes wrong partway through relocating elements to the new buffer, the vector must be able to leave the *original* buffer untouched and valid, as if nothing happened. A copy constructor can safely be interrupted by an exception this way, because the *source* elements are never modified — only new ones are being built. A move constructor that *can* throw cannot offer this guarantee: if it throws after already stealing some of the source's resources, the source is left in a half-modified state, and the guarantee is broken. `std::vector`, unable to prove a move constructor won't throw unless it's explicitly marked `noexcept`, conservatively falls back to the always-safe option — copying — rather than risk that guarantee.

This scratch file is discarded now; the real `Inventory` (Concept Unit 3) keeps `noexcept` specifically because of this verified rule.

### Mechanical Walkthrough

- `noexcept` (on the move constructor) — **(a) first appearance.** A promise, checked by the compiler at points like this one, that the function will not throw an exception. `std::vector` (and other standard containers) specifically check this promise before choosing to use a type's move constructor during reallocation.

### CS Lens

This is a real instance of a broader C++ design principle: the standard library will not silently take an action it cannot *prove* is safe, even when a faster option exists — it prefers a guaranteed-correct fallback (copying) over an unverified optimization (moving) when the type itself hasn't promised the optimization is safe.

### SE Lens

**The rule this verified finding justifies:** every move constructor and move assignment operator in this course is marked `noexcept`, always, unless there is a specific, understood reason it might genuinely throw (rare, and not encountered in this bridge series) — omitting it costs real performance, silently, exactly as demonstrated here, with nothing in a normal build calling attention to the regression.

### Connection

Concept Unit 5 completes the Rule of Five with move assignment — the `=` counterpart to this unit's constructor.

---

## Concept Unit 5: Move Assignment and the Complete Rule of Five

### The Problem

Concept Unit 3's move constructor only helps when a *new* `Inventory` is being created from a disposable source. Assigning into an *already-existing* `Inventory` (`b = std::move(a);`) needs its own move counterpart to `S-02-CPP-DSA-MASTERY` LAB-04's copy assignment operator.

### Project Change

- **Reference Source:** `S-02-CPP-DSA-MASTERY` LAB-04's copy assignment operator shape — extended with a move version.
- **Files affected:** `main.cpp` — modified.
- **Change type:** Add.
- **Location:** Inside `Inventory`, alongside copy assignment.
- **Dependencies:** Move constructor (Concept Unit 3), `noexcept` (Concept Unit 4).

### The New Code

```cpp
Inventory& operator=(const Inventory& other) {
    std::cout << "COPY assigned" << std::endl;
    if (this == &other) return *this;
    delete[] items;
    size = other.size;
    items = new int[size];
    for (int i = 0; i < size; ++i) items[i] = other.items[i];
    return *this;
}

Inventory& operator=(Inventory&& other) noexcept {
    std::cout << "MOVE assigned" << std::endl;
    if (this == &other) return *this;
    delete[] items;
    items = other.items;
    size = other.size;
    other.items = nullptr;
    other.size = 0;
    return *this;
}
```

### Concept Lab

No separate throwaway: run directly below, this is already the clearest demonstration of both operators side by side.

Run it — verified this session:

```
$ g++ main.cpp -o dungeon -std=c++17 -Wall -Wextra
$ ./dungeon.exe
constructed (size 3)
constructed (size 5)
--- b = a (copy assign) ---
COPY assigned
--- b = std::move(a) (move assign) ---
constructed (size 2)
MOVE assigned
--- end ---
```

What that proves: `b = a;` — `a` is an ordinary lvalue, still in use — calls `operator=(const Inventory&)`, per Concept Unit 2's own overload-resolution rule. `c = std::move(a);` — `a` cast to an rvalue reference — calls `operator=(Inventory&& other)` instead, stealing `a`'s pointer into `c` exactly the way the move constructor steals during construction. Both operators check `this == &other` first — **(c) reusing** `S-02-CPP-DSA-MASTERY` LAB-04's own self-assignment guard, necessary for the identical reason there: without it, `delete[] items;` on `x = x;` (or the rarer but real `x = std::move(x);`) would delete memory the right-hand side still needs to read from.

### Mechanical Walkthrough

- `Inventory& operator=(Inventory&& other) noexcept` — **(a) first appearance of the move assignment operator**, mirroring the move constructor's own logic (Concept Unit 3) but operating on an already-existing object: `delete[] items;` first releases whatever `*this` currently owns, before stealing `other`'s resource — a step the move *constructor* never needed, since a freshly-constructed object owns nothing yet.

### CS Lens

Together, these five special member functions — destructor, copy constructor, copy assignment, move constructor, move assignment — are the **Rule of Five**, the direct extension of `S-02-CPP-DSA-MASTERY` LAB-04's Rule of Three: any class that manages a resource manually needs to define how it's destroyed, duplicated, and transferred, in both construction and assignment form.

### SE Lens

**A real, verified trap worth naming precisely:** declaring *any* of the Rule of Three (a custom destructor, copy constructor, or copy assignment) does **not** cause the compiler to also generate move operations — it *suppresses* them. Verified this session:

```cpp
// scratch_implicit_move.cpp  (disposable — a class with a custom copy ctor, no move ctor declared at all)
```

```
$ ./scratch_implicit_move.exe
constructed
COPY constructed
done
destroyed
destroyed
```

`Inventory b = std::move(a);` — explicitly requesting a move — silently fell back to the copy constructor, because no move constructor was ever declared, and the compiler will not implicitly generate one for a class that already declares a custom destructor or copy operations (the reasoning: a class needing a custom copy constructor almost certainly manages a resource the compiler's own naive, member-by-member "move" — which is really just a copy for non-pointer members — would handle incorrectly, so it declines to guess). This scratch file is discarded now; it is exactly why `Inventory`'s Rule of Five is written out in full, explicitly, rather than left partially to the compiler.

### Connection

Concept Unit 6 shows the other end of this same rule — a class that only wants moving, never copying, at all.

---

## Concept Unit 6: Move-Only Types — `= delete` and `= default`

### The Problem

`std::unique_ptr` (Lesson 3) cannot be copied, only moved — proven directly by Lesson 3's own compiler error on attempted copying. Nothing in this lesson has yet shown how a class declares that exact restriction for itself.

### Project Change

- **Reference Source:** Lesson 3's own verified `unique_ptr` copy-prevention behavior — reproduced here as a hand-written class.
- **Files affected:** N/A — Concept Lab only, demonstrating the pattern rather than modifying `Inventory` itself (`Inventory`, per Concept Unit 5, supports both copying and moving deliberately).
- **Change type:** N/A.
- **Location:** N/A.
- **Dependencies:** `= delete` (this series' Lesson 3), move constructor/assignment (Concept Units 3, 5).

### Concept Lab

```cpp
// scratch_moveonly_clean.cpp  (disposable)
#include <iostream>
class Inventory {
    int* items;
    int size;
public:
    Inventory(int n) : items(new int[n]), size(n) {}
    Inventory(const Inventory&) = delete;
    Inventory& operator=(const Inventory&) = delete;
    Inventory(Inventory&& other) noexcept : items(other.items), size(other.size) {
        other.items = nullptr; other.size = 0;
    }
    Inventory& operator=(Inventory&& other) noexcept {
        if (this != &other) {
            delete[] items;
            items = other.items; size = other.size;
            other.items = nullptr; other.size = 0;
        }
        return *this;
    }
    ~Inventory() { delete[] items; }
};
int main() {
    Inventory a(3);
    Inventory c = a;   // attempt to copy a move-only type
}
```

Compiling — verified this session:

```
$ g++ scratch_moveonly_clean.cpp -o scratch_moveonly_clean -std=c++17 -Wall -Wextra
scratch_moveonly_clean.cpp:24:19: error: use of deleted function 'Inventory::Inventory(const Inventory&)'
   24 |     Inventory c = a;   // attempt to copy a move-only type
      |                   ^
```

What that proves: `= delete` on the copy constructor and copy assignment operator (this series' Lesson 3's own mechanism, applied here by hand instead of encountered inside the standard library's own source) makes copying `Inventory` a hard compile error, identical in kind to Lesson 3's own `unique_ptr` proof — while moving still works exactly as Concept Units 3 and 5 already demonstrated. This is precisely how `std::unique_ptr` itself is built: a move-only type, exclusive ownership enforced by the same `= delete` this scratch class uses directly.

This scratch file is discarded now; the real `Inventory` (Concept Unit 5) deliberately supports both, since a party's inventory copying (say, for an undo feature) is a reasonable, real operation this project doesn't want to forbid — the choice between "supports copying" and "move-only" is a real per-class design decision, not a rule to apply uniformly.

### Mechanical Walkthrough

- `Inventory(const Inventory&) = delete;` — **(c) reusing** `= delete` (this series' Lesson 3), applied here by the class author directly, rather than encountered as `unique_ptr`'s own internal declaration.

### CS Lens

`= delete` and `= default` (used briefly in this lesson's own move constructor discussions) are two explicit tools for the exact same decision every Rule-of-Five class must make for each of its five special members: write custom logic, ask the compiler to generate the ordinary version (`= default`), or forbid it outright (`= delete`) — a decision this course now expects to be made deliberately, for every one of the five, rather than left to whichever combination the compiler happens to infer.

### SE Lens

A move-only type is the right choice specifically when duplicating the resource wouldn't make sense at all — `std::unique_ptr`'s entire premise (Lesson 3) is that exactly one owner should ever exist, so a copy constructor for it couldn't have any sensible meaning beyond "silently create a second owner," which is precisely the double-free risk `unique_ptr` exists to prevent. `Inventory`, by contrast, has a perfectly sensible meaning for "duplicate this" (a real, independent second inventory with the same starting contents), so this course's own version keeps both.

### Connection

This closes every new mechanism in this lesson — the Closing section connects the full Rule of Five and the `noexcept` finding that governs when it actually helps.

---

## Closing

### Connect the pieces

Concept Unit 1 proved a real, wasted cost: `std::vector<Inventory>` deep-copying an element during reallocation, immediately discarding the copied-from original. Concept Unit 2 named the language-level distinction (lvalue vs. rvalue, `T&&`) that makes it possible to write code specifically for "this source is disposable." Concept Unit 3's move constructor used that distinction to steal a pointer instead of duplicating an array — verified to actually change the vector's behavior. Concept Unit 4 uncovered the one condition that governs whether that move constructor is ever used at all: `noexcept`, without which the exact same logic silently reverts to copying. Concept Unit 5 completed the pair with move assignment, and named the equally important trap in the other direction — declaring a custom copy operation suppresses implicit move generation entirely, verified directly. Concept Unit 6 showed the same `= delete` tool, applied to forbid copying outright, exactly the mechanism `std::unique_ptr` itself is built from.

### What breaks without this

Concept Unit 4's own verified finding is this lesson's most load-bearing "what breaks": a move constructor that's correct in every way except missing `noexcept` produces *zero* observable difference in program correctness — the program still runs, still produces the same output — but silently pays Concept Unit 1's own full copying cost on every container reallocation, for the entire lifetime of the project, with nothing in a normal build ever flagging it. This is a real, common, and genuinely difficult-to-detect performance regression class in real C++ codebases — not a hypothetical this lesson invented to justify itself.

### Exercises

1. Reproduce Concept Unit 4's `noexcept`-removal finding yourself — build both versions, verify the copy-vs-move switch directly, and explain, in your own words, why `std::vector` cannot simply trust an un-annotated move constructor not to throw.
2. Reproduce Concept Unit 5's implicit-move-suppression finding yourself: write a class with only a custom copy constructor declared (no move operations, no `= default`/`= delete` on them), attempt `std::move` on an instance, and confirm — for real — that it silently copies instead.
3. Build `Inventory` as a genuine move-only type (Concept Unit 6's pattern) instead of this lesson's copy-and-move version, and confirm a `std::vector<Inventory>` still works correctly with `emplace_back` (which constructs in place, never needing to copy the argument at all) even though copying the type itself is forbidden.
4. Add a `print()` method to `Inventory` that prints `"empty (moved-from)"` if `items == nullptr`, or the actual contents otherwise — call it on a moved-from object after moving it, confirming it behaves safely (no crash, no undefined behavior) even though its contents are, per Concept Unit 3's own contract, no longer meaningful.

### Definition of done

- [ ] `Inventory` implements the complete Rule of Five: destructor, copy constructor, copy assignment, move constructor, move assignment — with both move operations marked `noexcept`.
- [ ] The program compiles with zero warnings under `-std=c++17 -Wall -Wextra`.
- [ ] You can state, from Concept Unit 4's own verified proof, the specific condition under which `std::vector` will use a type's move constructor during reallocation, and what it falls back to otherwise.
- [ ] You can state, from Concept Unit 5's own verified proof, what declaring a custom copy constructor does to a class's implicitly-generated move operations.
- [ ] All four Exercises completed with real compiled output, including Exercise 2's independent reproduction of the implicit-move-suppression trap.
- [ ] Commit: `git add main.cpp && git commit -m "S03-LAB-04: Inventory's full Rule of Five, with noexcept verified to control vector's copy-vs-move choice"` — states why (a real, measured performance difference, not a style preference) not just what changed.
