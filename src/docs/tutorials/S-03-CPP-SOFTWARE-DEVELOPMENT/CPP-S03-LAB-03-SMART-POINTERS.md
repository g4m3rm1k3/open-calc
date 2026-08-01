# Lesson 3: Ownership Is Something the Type Should Track, Not You
### (LAB 03 — Smart Pointers)

**What you will build:** The Lesson 2 polymorphic party loop, rebuilt with `std::unique_ptr` instead of raw `new`/`delete` — plus a real, deliberately-caused reference-cycle leak with `std::shared_ptr`, fixed with `std::weak_ptr`. The transferable problem: Lesson 2 ended with a working `std::vector<Character*>` loop that correctly dispatches and correctly deletes — but only because the code remembered to call `delete` on every element, on every path, every time. `S-02-CPP-DSA-MASTERY` LAB-04 taught RAII for a class's own resources; this lesson applies the identical idea to ownership of a heap object itself, so "did I remember to delete this" stops being a question a human has to get right on every code path.

**What you need to know first:** This series' Lessons 1–2 — inheritance, `virtual`, polymorphic collections via raw pointers. `S-02-CPP-DSA-MASTERY` LAB-04 — RAII, destructors, the Rule of Three.

**Terms introduced in this lesson**

> **Smart pointer** — a class that wraps a raw pointer and manages the lifetime of what it points to automatically, via RAII, rather than requiring manual `delete`.
> **`std::unique_ptr`** — a smart pointer representing exclusive ownership: exactly one `unique_ptr` ever owns a given object; copying is disabled, only moving is allowed.
> **`std::make_unique`** — the preferred way to create a `unique_ptr`-owned object.
> **`std::move`** — converts a value into a form that transfers ownership rather than copying (full treatment in Lesson 4).
> **`std::shared_ptr`** — a smart pointer representing shared ownership: multiple `shared_ptr`s can own the same object, which is destroyed only when the last one is gone, tracked via a reference count.
> **`use_count()`** — the number of `shared_ptr`s currently sharing ownership of an object.
> **Reference cycle** — two or more objects holding `shared_ptr`s to each other, keeping each other's reference count above zero forever, even when nothing outside the cycle refers to either.
> **`std::weak_ptr`** — a non-owning reference to an object managed by a `shared_ptr`, used to break reference cycles; must be `.lock()`ed into a temporary `shared_ptr` before the object can be accessed.

No pipeline diagram applies — this bridge series builds standalone concept programs.

---

## Concept Unit 1: The Problem — `delete` Requires Perfect Bookkeeping

### The Problem

`new` allocates; `delete` frees. Nothing enforces that every `new` has a matching `delete` on *every* code path — an early `return`, an exception thrown between the two, or simply a line forgotten during a later edit all produce the identical, silent failure: a leak.

### Concept Lab

```cpp
// scratch_forgotten_delete.cpp  (disposable)
#include <iostream>
class Character {
public:
    Character() { std::cout << "constructed" << std::endl; }
    ~Character() { std::cout << "destroyed" << std::endl; }
};
void processCharacter(bool earlyExit) {
    Character* c = new Character();
    if (earlyExit) {
        std::cout << "early return -- forgot to delete!" << std::endl;
        return;   // leak: never reaches delete c below
    }
    delete c;
}
int main() {
    processCharacter(true);
    std::cout << "back in main" << std::endl;
}
```

Run it — verified this session:

```
$ g++ scratch_forgotten_delete.cpp -o scratch_forgotten_delete -std=c++17 -Wall -Wextra
$ ./scratch_forgotten_delete.exe
constructed
early return -- forgot to delete!
back in main
```

What that proves, and what's genuinely alarming about it: `"destroyed"` never prints. `c` leaked, silently, with **zero compiler warnings** — nothing under `-Wall -Wextra` flags this, unlike Lesson 2's missing-virtual-destructor case, which at least produced a warning. The `delete c;` line at the bottom of `processCharacter` is completely correct — it simply never runs on this path. This is not a contrived example: an early return added during a later edit, without re-checking every existing `delete` in the function, is exactly how real leaks like this happen.

This scratch file is discarded now; the real fix doesn't add a second `delete` to the early-return path — it removes the need for `delete` at all.

### CS Lens

Manual `new`/`delete` places the entire burden of tracking an object's lifetime on the programmer, at every single point that object might stop being needed — every `return`, every `throw`, every code path. `S-02-CPP-DSA-MASTERY` LAB-04's RAII already solved exactly this problem for a class's own resources (a buffer, a file handle): tie the resource's lifetime to a *scope*, so it's released automatically when that scope ends, on every path, including ones the programmer didn't think to check by hand.

### SE Lens

The fix this lesson builds isn't "remember to delete more carefully" — that's the same discipline that already failed here. It's applying RAII to the pointer itself: a class that owns a raw pointer internally and deletes it in its own destructor, so leaving *any* scope — normally, via `return`, or via an exception — triggers the cleanup automatically, the same way `S-02-CPP-DSA-MASTERY` LAB-04's own `Buffer` class freed its memory the instant it went out of scope.

### Connection

Concept Unit 2 introduces exactly that class, already written and provided by the standard library: `std::unique_ptr`.

---

## Concept Unit 2: `std::unique_ptr` — Exclusive Ownership via RAII

### The Problem

Concept Unit 1's fix needs to exist as real, usable code — a pointer-like object that deletes what it owns automatically, on scope exit, on every path.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `main.cpp` — new file for this lesson.
- **Change type:** Add (new file).
- **Location:** Inside a function.
- **Dependencies:** `#include <memory>`.

### The New Code

```cpp
std::unique_ptr<Character> c = std::make_unique<Character>();
```

### Concept Lab

```cpp
// scratch_uniqueptr.cpp  (disposable — Concept Unit 1's exact scenario, fixed)
#include <iostream>
#include <memory>
class Character {
public:
    Character() { std::cout << "constructed" << std::endl; }
    ~Character() { std::cout << "destroyed" << std::endl; }
};
void processCharacter(bool earlyExit) {
    std::unique_ptr<Character> c = std::make_unique<Character>();
    if (earlyExit) {
        std::cout << "early return -- no delete needed" << std::endl;
        return;
    }
    std::cout << "normal path" << std::endl;
}
int main() {
    processCharacter(true);
    std::cout << "back in main" << std::endl;
}
```

Run it — verified this session:

```
$ g++ scratch_uniqueptr.cpp -o scratch_uniqueptr -std=c++17 -Wall -Wextra
$ ./scratch_uniqueptr.exe
constructed
early return -- no delete needed
destroyed
back in main
```

What that proves: identical control flow to Concept Unit 1's leaking version — the same early `return`, no `delete` written anywhere in `processCharacter` at all — and `"destroyed"` now prints, correctly, before `"back in main"`. `c`, a local `unique_ptr`, goes out of scope the instant `processCharacter` returns (early or not), and its own destructor deletes the `Character` it owns, automatically, on every path, the same guarantee `S-02-CPP-DSA-MASTERY` LAB-04's own RAII classes provide for any resource.

This scratch file is discarded now; every heap-allocated object in the rest of this lesson uses this exact pattern instead of raw `new`/`delete`.

### Mechanical Walkthrough

- `#include <memory>` — **(a) first appearance.** The header declaring `std::unique_ptr`, `std::shared_ptr`, `std::weak_ptr`, and their `make_*` helpers.
- `std::unique_ptr<Character>` — **(a) first appearance.** A **template** type (full treatment `S-02-CPP-DSA-MASTERY` LAB-05) parameterized on what it owns — `unique_ptr<Character>` owns a `Character`.
- `std::make_unique<Character>()` — **(a) first appearance.** Allocates a new `Character` on the heap (the identical `new` this replaces, happening internally) and returns it already wrapped in a `unique_ptr` — the preferred way to create one, over writing `std::unique_ptr<Character>(new Character())` directly, because it never exposes a raw, temporarily-unmanaged pointer at all.

### CS Lens

`unique_ptr` is a thin wrapper: internally, it holds exactly one raw pointer, and its destructor calls `delete` on it — nothing more sophisticated than that. Its entire value comes from RAII's own guarantee (`S-02-CPP-DSA-MASTERY` LAB-04): a destructor runs automatically, on every path out of scope, which a bare `Character* c = new Character();` has no equivalent mechanism for at all.

### SE Lens

`unique_ptr<Character>` costs nothing extra at runtime compared to a raw `Character*` — the same single pointer's worth of memory, the same access speed through `->`/`*` — the *only* difference is the automatic destructor call. This is why modern C++ style defaults to `unique_ptr` for any owned heap object and reaches for a raw pointer only when something genuinely needs to *not* own what it points to (a non-owning observer, covered implicitly by this lesson's own `weak_ptr`, Concept Unit 5).

### Connection

Concept Unit 3 shows what "exclusive" in "exclusive ownership" actually enforces — and what it deliberately refuses to let you do.

---

## Concept Unit 3: Exclusive Means Exclusive — No Copying, Only Moving

### The Problem

If two `unique_ptr`s both held the same raw address, both would try to `delete` it when they went out of scope — a **double-free** (`S-01-CPP-FOUNDATIONS` LAB-08's own named danger), undefined behavior. `unique_ptr`'s entire design has to prevent this from ever compiling.

### Concept Lab

```cpp
// scratch_uniqueptr_copy.cpp  (disposable)
#include <memory>
int main() {
    std::unique_ptr<int> a = std::make_unique<int>(42);
    std::unique_ptr<int> b = a;   // attempt to copy
    return 0;
}
```

Compiling — verified this session:

```
$ g++ scratch_uniqueptr_copy.cpp -o scratch_uniqueptr_copy -std=c++17 -Wall -Wextra
scratch_uniqueptr_copy.cpp:4:30: error: use of deleted function 'std::unique_ptr<_Tp, _Dp>::unique_ptr(const std::unique_ptr<_Tp, _Dp>&) [with _Tp = int; _Dp = std::default_delete<int>]'
    4 |     std::unique_ptr<int> b = a;   // attempt to copy
      |                              ^
C:/mingw64/include/c++/14.2.0/bits/unique_ptr.h:516:7: note: declared here
  516 |       unique_ptr(const unique_ptr&) = delete;
      |       ^~~~~~~~~~
```

What that proves: `unique_ptr`'s copy constructor is explicitly marked `= delete` — **(a) first appearance of `= delete` on a function**, distinct from Lesson 2's `= 0` (a pure virtual function, meaning "must be overridden") — `= delete` here means "this function does not exist; any attempt to call it is a compile error," used specifically to make copying a `unique_ptr` a hard error rather than something that compiles and causes a double-free later.

Ownership can still be *transferred*, deliberately, via `std::move`:

```cpp
// scratch_move.cpp  (disposable)
#include <iostream>
#include <memory>
int main() {
    std::unique_ptr<int> a = std::make_unique<int>(42);
    std::cout << "a before move: " << (a ? "owns" : "empty") << std::endl;
    std::unique_ptr<int> b = std::move(a);
    std::cout << "a after move: " << (a ? "owns" : "empty") << std::endl;
    std::cout << "b after move: " << (b ? "owns" : "empty") << " value=" << *b << std::endl;
}
```

```
$ g++ scratch_move.cpp -o scratch_move -std=c++17 -Wall -Wextra
$ ./scratch_move.exe
a before move: owns
a after move: empty
b after move: owns value=42
```

What that proves: `std::move(a)` did not copy `a`'s ownership — it *transferred* it. After the move, `a` is empty (`unique_ptr` converts to `false` when it owns nothing, checked here the same way a raw pointer is checked against `nullptr`) and `b` owns the original `int`. At no point did two `unique_ptr`s simultaneously own the same object — ownership moved, atomically, from one to the other. `std::move` itself gets full treatment in Lesson 4; here, it's used only as the specific tool that makes transfer (not duplication) of ownership possible.

Both scratch files are discarded now; the real project (Concept Unit 6) uses `std::make_unique` directly inside `push_back`, never needing an explicit `std::move` at all — a detail Lesson 4 explains precisely.

### Mechanical Walkthrough

- `unique_ptr(const unique_ptr&) = delete;` — **(a) first appearance of a deleted function**, seen here in the library's own source (quoted in the compiler's error output) rather than written by this lesson's own code — proof the restriction is real and enforced, not merely documented.
- `std::move(a)` — **(a) first appearance, previewed.** Converts `a` into a form `unique_ptr`'s move constructor (not its deleted copy constructor) accepts — the mechanism itself is Lesson 4's subject.

### CS Lens

"Exactly one owner, transferable but never duplicable" is a real, enforced invariant — the same category of guarantee `const` (`S-01-CPP-FOUNDATIONS` LAB-02) and `private` (`S-02-CPP-DSA-MASTERY` LAB-02) provide, here applied to *ownership* itself rather than mutability or access.

### SE Lens

A function taking `std::unique_ptr<Character>` by value (not by reference) is a real, visible signal in its own signature: calling it *requires* the caller to give up ownership (via `std::move` or a temporary like `make_unique`'s own return value) — the type system itself documents an ownership transfer that a raw `Character*` parameter could never express.

### Connection

Concept Unit 4 introduces the tool for when exclusive ownership genuinely isn't the right model — several places legitimately needing to share the same object.

---

## Concept Unit 4: `std::shared_ptr` — Ownership Split Across Several Owners

### The Problem

Some objects genuinely need more than one owner — no single place is clearly "the" owner responsible for deletion; the object should live as long as *any* of several places still need it, and no longer.

### Concept Lab

```cpp
// scratch_shared.cpp  (disposable)
#include <iostream>
#include <memory>
class Character {
public:
    Character() { std::cout << "constructed" << std::endl; }
    ~Character() { std::cout << "destroyed" << std::endl; }
};
int main() {
    std::shared_ptr<Character> a = std::make_shared<Character>();
    std::cout << "use_count after a: " << a.use_count() << std::endl;
    {
        std::shared_ptr<Character> b = a;
        std::cout << "use_count after b: " << a.use_count() << std::endl;
    }
    std::cout << "use_count after b goes out of scope: " << a.use_count() << std::endl;
    std::cout << "about to end main" << std::endl;
}
```

Run it — verified this session:

```
$ g++ scratch_shared.cpp -o scratch_shared -std=c++17 -Wall -Wextra
$ ./scratch_shared.exe
constructed
use_count after a: 1
use_count after b: 2
use_count after b goes out of scope: 1
about to end main
destroyed
```

What that proves: unlike `unique_ptr`, `std::shared_ptr<Character> b = a;` **compiled** — `shared_ptr` permits copying, and each copy increments a shared **reference count**, visible directly via `.use_count()`. `b` going out of scope (the inner block ending) decremented it back to `1`, without destroying the `Character` — `a` still owned it. `"destroyed"` printed only once `main` itself ended and `a`, the last remaining owner, went out of scope — the object lived exactly as long as at least one `shared_ptr` pointed to it, no longer.

This scratch file is discarded now; the real project's use of `shared_ptr` (Concept Unit 5) demonstrates the one real danger this ownership model introduces that `unique_ptr` cannot have at all.

### Mechanical Walkthrough

- `std::shared_ptr<Character>` — **(a) first appearance.** Like `unique_ptr`, a template wrapping a raw pointer — additionally storing (typically in a small separate heap allocation `make_shared` creates alongside the object) a reference count, incremented on copy, decremented on destruction.
- `.use_count()` — **(a) first appearance.** Returns the current reference count — useful for understanding/debugging ownership, not typically checked in real production logic.

### CS Lens

`shared_ptr`'s reference counting is the identical **resource lifetime tied to reachability** idea a garbage collector uses in languages like Java or Python, implemented explicitly and deterministically here instead of by a background collector — the object is destroyed the instant its count reaches zero, not "eventually, when the collector gets to it."

### SE Lens

`shared_ptr`'s extra bookkeeping (the reference count itself, atomic increments/decrements for thread safety) costs real, measurable overhead compared to `unique_ptr`'s "just a pointer" simplicity — this course's default is `unique_ptr` unless multiple genuine owners are a real requirement of the design, not a convenience for avoiding ownership decisions.

### Connection

Concept Unit 5 shows `shared_ptr`'s one real structural danger — verified as a genuine, observed leak, not a hypothetical warning.

---

## Concept Unit 5: The Reference Cycle — `shared_ptr`'s Real Danger

### The Problem

If two objects each hold a `shared_ptr` to the other, each one's reference count includes the other's ownership — could that keep both alive forever, even after nothing outside the pair refers to either one?

### Concept Lab

```cpp
// scratch_cycle.cpp  (disposable)
#include <iostream>
#include <memory>
#include <string>
struct Party;
struct Character {
    std::string name;
    std::shared_ptr<Party> party;   // child points back to parent
    Character(std::string n) : name(n) { std::cout << name << " constructed" << std::endl; }
    ~Character() { std::cout << name << " destroyed" << std::endl; }
};
struct Party {
    std::shared_ptr<Character> leader;   // parent points to child
    ~Party() { std::cout << "Party destroyed" << std::endl; }
};
int main() {
    {
        auto party = std::make_shared<Party>();
        auto zara = std::make_shared<Character>("Zara");
        party->leader = zara;
        zara->party = party;
        std::cout << "party use_count=" << party.use_count()
                  << " zara use_count=" << zara.use_count() << std::endl;
    }
    std::cout << "block ended -- did destructors run?" << std::endl;
}
```

Run it — verified this session:

```
$ g++ scratch_cycle.cpp -o scratch_cycle -std=c++17 -Wall -Wextra
$ ./scratch_cycle.exe
Zara constructed
party use_count=2 zara use_count=2
block ended -- did destructors run?
```

**A real, verified leak, worth stating plainly:** neither `"Party destroyed"` nor `"Zara destroyed"` ever prints. `party`'s `use_count` is `2` — one from the local variable `party`, one from `zara->party`. `zara`'s `use_count` is also `2` — one from the local variable `zara`, one from `party->leader`. When the block ends, the two *local* variables go out of scope, each decrementing its target's count by one — down to `1` each, not `0`. Each object is still referenced by the *other*, which is itself still alive only because of the first — a **reference cycle**. Both objects leak, permanently, for the remaining lifetime of the program, with `shared_ptr`'s own automatic cleanup mechanism providing zero protection against this specific shape of bug.

This scratch file is discarded now; Concept Unit 6 fixes this exact structure.

### Mechanical Walkthrough

- `std::shared_ptr<Party> party;` (inside `Character`) and `std::shared_ptr<Character> leader;` (inside `Party`) — **(c) reusing** `shared_ptr` declaration (Concept Unit 4), arranged here specifically to form a cycle — two objects, each holding shared ownership of the other.

### CS Lens

Reference counting's fundamental weakness, in any language that uses it, is exactly this: it can only detect "no one refers to me anymore" when the count reaches zero — it has no way to notice "a group of objects refer only to each other, and nothing outside the group refers to any of them," which is exactly what a true garbage collector's cycle-detection pass (absent from C++'s deliberately simpler `shared_ptr`) would catch.

### SE Lens

Any parent/child, owner/observer, or bidirectional relationship modeled with two `shared_ptr`s pointing at each other is a real, structural leak risk — not a rare edge case, but the *default* outcome of the most natural-looking way to model such a relationship with `shared_ptr` alone. Concept Unit 6's fix is the standard answer.

### Connection

Concept Unit 6 introduces `std::weak_ptr`, breaking exactly this cycle.

---

## Concept Unit 6: `std::weak_ptr` — a Non-Owning Reference

### The Problem

The "child points back to parent" direction of Concept Unit 5's cycle doesn't need to be an *owning* relationship — the child doesn't need to keep the parent alive; it only needs a way to *reach* the parent while the parent happens to still exist.

### Project Change

- **Reference Source:** Concept Unit 5's own `scratch_cycle.cpp` — one field's type changed.
- **Files affected:** N/A (Concept Lab only, no real project file for this specific fix — the real project, Concept Unit 7, doesn't use this parent/child shape).
- **Change type:** Replace (`std::shared_ptr<Party> party;` becomes `std::weak_ptr<Party> party;`).
- **Location:** `Character`'s own `party` member.
- **Dependencies:** `shared_ptr` (Concept Unit 4).

### Concept Lab

```cpp
// scratch_weak.cpp  (disposable)
#include <iostream>
#include <memory>
#include <string>
struct Party;
struct Character {
    std::string name;
    std::weak_ptr<Party> party;   // child holds a weak (non-owning) reference back
    Character(std::string n) : name(n) { std::cout << name << " constructed" << std::endl; }
    ~Character() { std::cout << name << " destroyed" << std::endl; }
};
struct Party {
    std::shared_ptr<Character> leader;
    ~Party() { std::cout << "Party destroyed" << std::endl; }
};
int main() {
    {
        auto party = std::make_shared<Party>();
        auto zara = std::make_shared<Character>("Zara");
        party->leader = zara;
        zara->party = party;
        std::cout << "party use_count=" << party.use_count()
                  << " zara use_count=" << zara.use_count() << std::endl;

        if (auto locked = zara->party.lock()) {
            std::cout << "locked party successfully while alive" << std::endl;
        }
    }
    std::cout << "block ended -- did destructors run?" << std::endl;
}
```

Run it — verified this session:

```
$ g++ scratch_weak.cpp -o scratch_weak -std=c++17 -Wall -Wextra
$ ./scratch_weak.exe
Zara constructed
party use_count=1 zara use_count=2
locked party successfully while alive
Party destroyed
Zara destroyed
block ended -- did destructors run?
```

What that proves: `party.use_count()` is now `1` — `zara->party` being a `weak_ptr` does *not* count toward the reference count at all, per this unit's own name ("non-owning"). When the block ends, the local `party` variable's destruction drops `Party`'s count to `0` — `Party` is destroyed. `Party`'s own destruction destroys its `leader` member (a real `shared_ptr<Character>`), dropping `Character`'s count to `0` in turn — both objects destroyed, correctly, in the right order, with no cycle at all. `zara->party.lock()`, called while `party` was still alive, succeeded, returning a temporary `shared_ptr<Party>` usable for exactly that `if` block — `.lock()` is the only way to actually *use* what a `weak_ptr` refers to; a `weak_ptr` itself provides no `->`/`*` access, precisely because what it refers to might already be gone.

This scratch file is discarded now — this bridge series' own project (Concept Unit 7) doesn't need a parent/child cycle, so this exact fix isn't repeated in real project code, but the pattern (owning relationship one direction, `weak_ptr` the other) applies any time this shape recurs.

### Mechanical Walkthrough

- `std::weak_ptr<Party> party;` — **(a) first appearance.** Holds a reference to an object managed by a `shared_ptr`, without contributing to its reference count.
- `zara->party.lock()` — **(a) first appearance.** Attempts to obtain a temporary, real `shared_ptr` to the referenced object — succeeds (returns a non-null `shared_ptr`) if the object is still alive; returns an empty (null-like) `shared_ptr` if it has already been destroyed. The `if (auto locked = ...)` pattern (LAB-03's own idiom) checks this safely in one line, the same "check before use" discipline `S-01-CPP-FOUNDATIONS` LAB-08 required for `nullptr`.

### CS Lens

`weak_ptr` breaking a cycle by removing one direction's *ownership*, while keeping the *reachability*, is the general fix for reference-counting cycles in any language that uses this scheme: designate one direction of a bidirectional relationship as "the real owner," and make the other direction observe without owning.

### SE Lens

Deciding which direction of a relationship should own and which should merely observe is a real design decision, not a mechanical rule — here, a `Party` naturally outlives being referenced by any one `Character` (a character could leave the party while the party continues), so `Party` owning its `leader` and `Character` only weakly referencing its `party` matches the real relationship's actual lifetime logic.

### Connection

Concept Unit 7 returns to this series' own running example — Lesson 2's polymorphic party loop — rebuilt with `unique_ptr`, the final payoff this whole lesson has been building toward.

---

## Concept Unit 7: Rebuilding Lesson 2's Party Loop, Leak-Proof

### The Problem

Lesson 2's `std::vector<Character*>` loop correctly dispatches and correctly deletes — but only because both `push_back` calls and the cleanup loop were written by hand and happened to be correct. Nothing in that code *prevents* a future edit from forgetting the `delete` loop entirely, reproducing Concept Unit 1's exact leak at a larger scale.

### Project Change

- **Reference Source:** This series' Lesson 2 `Character`/`Warrior`/`Mage` and its own `main` — the party-loop shape, with ownership now handled automatically.
- **Files affected:** `main.cpp` — modified.
- **Change type:** Replace (`Character*` becomes `std::unique_ptr<Character>` throughout; the explicit `delete` loop is removed entirely).
- **Location:** `main`.
- **Dependencies:** `unique_ptr`/`make_unique` (Concept Unit 2), Lesson 2's `Character` hierarchy.

### The New Code

```cpp
std::vector<std::unique_ptr<Character>> party;
party.push_back(std::make_unique<Warrior>("Zara", 100));
party.push_back(std::make_unique<Mage>("Lyra", 80));

for (const auto& c : party) {
    c->describe();
}

std::cout << "main ending -- no explicit delete anywhere" << std::endl;
```

### The Updated Project

```cpp
#include <iostream>
#include <string>
#include <vector>
#include <memory>

class Character { /* unchanged from Lesson 2 -- abstract, virtual ~Character() */ };
class Warrior : public Character { /* unchanged from Lesson 2 */ };
class Mage : public Character { /* unchanged from Lesson 2 */ };

int main() {
    std::vector<std::unique_ptr<Character>> party;
    party.push_back(std::make_unique<Warrior>("Zara", 100));
    party.push_back(std::make_unique<Mage>("Lyra", 80));

    for (const auto& c : party) {
        c->describe();
    }

    std::cout << "main ending -- no explicit delete anywhere" << std::endl;
}
```

### Concept Lab

No separate throwaway: this real, full program, run below, is this lesson's own final proof.

Run it — verified this session:

```
$ g++ main.cpp -o dungeon -std=c++17 -Wall -Wextra
$ ./dungeon.exe
[Warrior] Zara HP:100
[Mage] Lyra HP:80
main ending -- no explicit delete anywhere
```

What that proves: identical dispatch behavior to Lesson 2's own raw-pointer version — `virtual`/`override` (Lesson 2) work exactly the same whether the pointer managing the object is raw or a `unique_ptr` wrapping one. But the explicit `for (Character* c : party) { delete c; }` loop from Lesson 2 is **gone entirely** — when `party` (a `std::vector<std::unique_ptr<Character>>`) itself goes out of scope at the end of `main`, each `unique_ptr` element is destroyed as the vector destroys its own elements, and each `unique_ptr`'s own destructor deletes the `Character` it owns — the identical automatic-cleanup guarantee Concept Unit 2 proved, now composed with `virtual` dispatch (Lesson 2) and correct destructor chaining through Lesson 2's own `virtual ~Character()`. There is no line of code in this program capable of forgetting to clean up a party member.

### Mechanical Walkthrough

- `std::vector<std::unique_ptr<Character>> party;` — **(a) first appearance of a container holding smart pointers instead of raw ones.** `push_back(std::make_unique<Warrior>(...))` moves the freshly-created `unique_ptr` into the vector (Concept Unit 3's own move mechanism, happening here implicitly — `make_unique`'s return value is exactly the kind of temporary that moves rather than copies).
- `for (const auto& c : party)` — **(a) first appearance of `auto`**, deducing `c`'s type from `party`'s own element type (`const std::unique_ptr<Character>&`) rather than writing it out — full treatment of `auto` is implicit here; used because writing `const std::unique_ptr<Character>&` explicitly at every loop site is exactly the kind of verbosity `auto` exists to remove, without changing what's actually happening.
- `c->describe();` — **(c) reusing** `->` on a smart pointer exactly as it would be used on a raw pointer (`S-01-CPP-FOUNDATIONS` LAB-08) — `unique_ptr` and `shared_ptr` both overload `->` and `*` to behave like the raw pointer they wrap, which is why replacing `Character*` with `unique_ptr<Character>` throughout this loop required no change to how `c` is actually used, only how it's declared and owned.

### CS Lens

This is smart pointers' complete payoff, demonstrated together: `unique_ptr` provides RAII-guaranteed cleanup (Concept Unit 2) with zero runtime cost beyond a raw pointer (this unit's own SE Lens), composed transparently with `virtual` dispatch (Lesson 2) through the identical `->` interface a raw pointer already had — none of Lesson 2's polymorphism had to change to gain Concept Unit 1's leak-proofing.

### SE Lens

Modern C++ style treats a raw, owning `new`/`delete` pair as something to justify, not the default — this lesson's own arc (a real leak, a real fix, a real cycle, a real second fix) is the concrete argument for that style rule, not an abstract preference: every scenario this lesson demonstrated a danger for has a corresponding smart pointer whose entire job is making that specific danger impossible to write by accident.

### Connection

This closes every new mechanism in this lesson — the Closing section connects the full ownership story, and names the one mechanism (`std::move`) used without full explanation, motivating Lesson 4 directly.

---

## Closing

### Connect the pieces

Concept Unit 1 proved manual `delete` requires perfect bookkeeping across every code path, and showed a real leak from one missed path. Concept Unit 2's `unique_ptr` fixed that exact scenario via RAII (`S-02-CPP-DSA-MASTERY` LAB-04), with Concept Unit 3 proving its "exclusive ownership" promise is genuinely enforced — copying refuses to compile; only `std::move` transfers ownership. Concept Unit 4's `shared_ptr` handles the genuinely different case of multiple real owners, tracked by a reference count Concept Unit 5 proved has its own real failure mode: a cycle, verified as an actual, permanent leak. Concept Unit 6's `weak_ptr` broke that cycle by removing ownership from one direction while preserving reachability. Concept Unit 7 composed the first of these tools — `unique_ptr` — with Lesson 2's own polymorphic dispatch, producing a party loop with the exact same correct behavior as before, and no `delete` anywhere left to forget.

### What breaks without this

Concept Unit 5's own reference cycle *is* this lesson's "what breaks" — a real, permanent leak, verified this session, that `shared_ptr`'s own automatic reference counting provides zero protection against on its own. Unlike Concept Unit 1's forgotten-`delete` leak (fixable by remembering to add the missing line), a reference cycle cannot be fixed by adding more `shared_ptr`s or being more careful with existing ones — it requires recognizing the *shape* of the relationship (a cycle) and deliberately choosing one direction to be non-owning, which is a design decision, not a bug fix.

### Exercises

1. Rebuild Lesson 2's `Rogue` class (if built) to work with this lesson's `unique_ptr`-based party loop — confirm it dispatches and cleans up correctly with zero special-casing.
2. Reproduce Concept Unit 3's copy-prevention proof yourself, then fix it using `std::move` instead of a plain copy, confirming ownership transfers rather than failing to compile.
3. Build Concept Unit 5's reference-cycle leak yourself, for real, and confirm — by adding print statements to both destructors, as shown — that neither one ever runs. Then apply Concept Unit 6's `weak_ptr` fix yourself and confirm both destructors now run, in the correct order.
4. Change this lesson's own `party` vector from `std::unique_ptr<Character>` to `std::shared_ptr<Character>`, and add a second container (say, `std::vector<std::shared_ptr<Character>> reserves;`) that also holds a `shared_ptr` to Zara — confirm, using `.use_count()`, that Zara is correctly kept alive as long as *either* container references her, and is only destroyed once both no longer do.

### Definition of done

- [ ] The party loop uses `std::vector<std::unique_ptr<Character>>`, with `std::make_unique` at every construction site and no `delete` anywhere in the file.
- [ ] The program compiles with zero warnings under `-std=c++17 -Wall -Wextra`.
- [ ] You can state, from Concept Unit 3's own verified proof, exactly what `unique_ptr`'s deleted copy constructor prevents, and what `std::move` does instead.
- [ ] You can explain a reference cycle (Concept Unit 5) well enough to design around it — which direction of a parent/child relationship should own, and which should hold a `weak_ptr` — before writing the code, not just recognize one after it leaks.
- [ ] All four Exercises completed with real compiled output, including Exercise 3's full before/after (leaking, then fixed) reference-cycle reproduction.
- [ ] Commit: `git add main.cpp && git commit -m "S03-LAB-03: unique_ptr-based party loop, plus a verified shared_ptr reference-cycle leak fixed with weak_ptr"` — states why (every leak scenario this lesson demonstrated is now structurally prevented, not just avoided by discipline) not just what changed.
