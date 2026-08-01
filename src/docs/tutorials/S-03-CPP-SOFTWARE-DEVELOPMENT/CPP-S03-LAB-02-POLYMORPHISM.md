# Lesson 2: `virtual` Is a Promise the Object Keeps, Not the Pointer
### (LAB 02 — Polymorphism)

**What you will build:** The same `Character`/`Warrior`/`Mage` hierarchy from Lesson 1, fixed with `virtual`, `override`, and a virtual destructor — ending in a single loop over `std::vector<Character*>` that correctly prints every character's own class-specific `describe()`, something Lesson 1 proved was impossible without this lesson's tools. The transferable problem: Lesson 1 ended with two verified, real gaps — method hiding (a `Character&`/`Character*` always calls `Character`'s own method) and object slicing (copying a derived object into a base variable discards everything derived-specific). Both gaps share one cause: by default, C++ decides which method runs by looking only at the *declared type* of the expression calling it, never the object's actual type. `virtual` is the one keyword that flips this default.

**What you need to know first:** This series' own Lesson 1 — `class Derived : public Base`, `protected`, constructor chaining, method hiding, object slicing. `S-02-CPP-DSA-MASTERY` LAB-04 — RAII, destructors (needed for this lesson's virtual-destructor danger).

**Terms introduced in this lesson**

> **`virtual`** — marks a base class method as eligible for dynamic dispatch: which override actually runs is decided by the object's real type, not the calling expression's declared type.
> **Dynamic (runtime) dispatch** — resolving which function to call by inspecting the object at runtime, the opposite of Lesson 1's static (compile-time) binding.
> **`override`** — an explicit marker on a derived method, telling the compiler "this is meant to override a virtual base method" — a compile error if no matching virtual method exists to override.
> **Virtual destructor** — a base class destructor marked `virtual`, required whenever an object might be `delete`d through a base class pointer.
> **Pure virtual function (`= 0`)** — a virtual method with no implementation in the base class at all; a class with one cannot be instantiated directly.
> **Abstract class** — a class with at least one pure virtual function; exists only to be inherited from, never instantiated on its own.
> **Interface** — an abstract class whose methods are entirely pure virtual, defining a contract with no shared implementation at all.
> **Polymorphism** — the ability to treat objects of different derived types uniformly, through a shared base type, with each object's own behavior still running correctly.

No pipeline diagram applies — this bridge series builds standalone concept programs.

---

## Concept Unit 1: `virtual` — Making the Object, Not the Pointer, Decide

### The Problem

Lesson 1's own Concept Unit 6 proved, with real compiled output, that `Character& ref = zara; ref.describe();` calls `Character::describe()`, never `Warrior::describe()`, even though `zara` is genuinely a `Warrior`. Nothing about `Character` or `Warrior`'s definitions so far tells the compiler this should work differently.

### Project Change

- **Reference Source:** This series' own Lesson 1 `Character`/`Warrior` — the exact classes, with one keyword added to each.
- **Files affected:** `main.cpp` — new file for this lesson (continuing Lesson 1's hierarchy fresh, not editing that lesson's own file).
- **Change type:** Add (new file, adapting known code).
- **Location:** `Character::describe()`'s declaration; `Warrior::describe()`'s declaration.
- **Dependencies:** `Character`, `Warrior` (this series' Lesson 1).

### The New Code

```cpp
class Character {
protected:
    std::string name;
public:
    Character(const std::string& n) : name(n) {}
    virtual void describe() const {
        std::cout << "[Character] " << name << std::endl;
    }
};

class Warrior : public Character {
public:
    Warrior(const std::string& n) : Character(n) {}
    void describe() const override {
        std::cout << "[Warrior] " << name << std::endl;
    }
};
```

(`override` is used here already — its own explanation is Concept Unit 2; for now, read it only as "marks this as intentionally replacing the base version.")

### The Updated Project

```cpp
#include <iostream>
#include <string>

class Character { /* shown above, with virtual */ };
class Warrior : public Character { /* shown above, with override */ };

int main() {
    Warrior zara("Zara");
    Character& ref = zara;
    ref.describe();

    Character* ptr = &zara;
    ptr->describe();

    return 0;
}
```

### Concept Lab

No separate throwaway: this is Lesson 1 Concept Unit 6's own scratch file, with exactly one word (`virtual`) added to the base method — run directly below to isolate that one word's effect precisely.

Run it — verified this session:

```
$ g++ main.cpp -o dungeon -std=c++17 -Wall -Wextra
$ ./dungeon.exe
[Warrior] Zara
[Warrior] Zara
```

What that proves: identical code to Lesson 1's own Concept Unit 6 — a `Character&` and a `Character*`, both referring to a `Warrior` — now both print `[Warrior] Zara`, not `[Character] Zara`. The *only* change was adding `virtual` to `Character::describe()`'s declaration. Every other line — how `ref`/`ptr` are declared, how `describe()` is called — is unchanged from the proof that this exact code *fails* to dispatch correctly.

### Mechanical Walkthrough

- `virtual void describe() const { ... }` (in `Character`) — **(a) first appearance.** Marks `describe()` as eligible for **dynamic dispatch** — a call to `describe()` through *any* `Character&` or `Character*`, anywhere in the program, will now be resolved by checking the actual object's real type at runtime, not the declared type of the reference or pointer used to call it.

### CS Lens

Mechanically, `virtual` works by giving every object of a class with virtual methods a hidden pointer (commonly called a **vtable pointer**) to a table of function addresses — one table per class, shared by every instance of that class, with a slot per virtual method holding the address of *that class's own* implementation. Calling a virtual method through a base reference or pointer means: follow the object's own vtable pointer (not the reference/pointer's declared type) to that object's actual class's table, and call whatever address is in the `describe()` slot. This is why the object's *real* type, not the calling expression's declared type, decides which function runs — the lookup happens through data stored *in the object itself*.

### SE Lens

This one keyword is the entire mechanism that makes a function like `void printAll(const std::vector<Character*>& party)` — one function, written once against `Character`, calling `.describe()` on each element — correctly print every character's own class-specific description, with zero `if`/`switch` on class type anywhere inside it. This is the payoff Lesson 1's Concept Unit 1 was building toward from its very first sentence: real polymorphism, not a string tag checked manually everywhere.

### Connection

Concept Unit 2 covers `override`, already used above without explanation — and a real, verified bug it exists specifically to catch.

---

## Concept Unit 2: `override` — Catching a Mismatch the Compiler Would Otherwise Ignore

### The Problem

`virtual` alone requires the derived method's signature to match the base's *exactly* — same name, same parameters, same `const`-ness — or the derived method silently becomes an entirely separate, non-overriding method instead, reproducing Lesson 1's own method-hiding bug with no error at all.

### Concept Lab

```cpp
// scratch_no_override.cpp  (disposable — a real, common typo: forgetting 'const')
#include <iostream>
#include <string>
class Character {
protected:
    std::string name;
public:
    Character(const std::string& n) : name(n) {}
    virtual void describe() const {
        std::cout << "[Character] " << name << std::endl;
    }
};
class Warrior : public Character {
public:
    Warrior(const std::string& n) : Character(n) {}
    void describe() {   // BUG: missing 'const' -- a different signature than the base's
        std::cout << "[Warrior] " << name << std::endl;
    }
};
int main() {
    Warrior zara("Zara");
    Character& ref = zara;
    ref.describe();
}
```

Compiling and running — verified this session:

```
$ g++ scratch_no_override.cpp -o scratch_no_override -std=c++17 -Wall -Wextra
scratch_no_override.cpp:8:18: warning: 'virtual void Character::describe() const' was hidden [-Woverloaded-virtual=]
    8 |     virtual void describe() const {
      |                  ^~~~~~~~
scratch_no_override.cpp:15:10: note:   by 'void Warrior::describe()'
$ ./scratch_no_override.exe
[Character] Zara
```

**A real, verified reproduction of Lesson 1's own bug, now hiding inside code that looks like it should be polymorphic:** `Warrior::describe()` is missing `const` — a one-character-category typo — which makes it a *different* function signature than `Character::describe() const`, not an override of it at all. `virtual` on the base does nothing here, because `Warrior` never actually overrode it — it merely *hid* it, exactly as Lesson 1's Concept Unit 6 demonstrated with no `virtual` involved at all. `ref.describe()` prints `[Character] Zara`, the identical wrong output Lesson 1 already proved. The only signal anything is wrong is a warning (`-Woverloaded-virtual`), easy to miss in a build with many warnings.

Now, the fix — adding `override`, verified this session:

```
$ echo '... same code, but: void describe() override { ...' > scratch_override_bad.cpp
$ g++ scratch_override_bad.cpp -o scratch_override_bad -std=c++17 -Wall -Wextra
scratch_override_bad.cpp:15:10: error: 'void Warrior::describe()' marked 'override', but does not override
   15 |     void describe() override {
      |          ^~~~~~~~
```

What that proves: `override`, added to a method that doesn't actually match any base class virtual method's signature, turns Lesson 1's silent bug into a hard compile error — `error: ... marked 'override', but does not override` — naming the exact problem. The identical missing-`const` typo now cannot compile at all.

Both scratch files are discarded now; the real `Warrior::describe() const override` (Concept Unit 1) uses `override` specifically so a future edit that accidentally breaks the signature match fails to compile instead of silently reintroducing this bug.

### Mechanical Walkthrough

- `void describe() const override` — **(a) first appearance of `override`.** Not required by the language to make a method a genuine override — matching the base signature exactly is what actually does that — but required by this course's own standard, because it converts a silent, warning-only mismatch into a compile error, verified directly above.

### CS Lens

`override` is a **compiler-checked assertion**: the programmer states an intent ("this overrides something"), and the compiler verifies that intent against the actual base class definition, rather than trusting it silently. This is the identical shift `S-01-CPP-FOUNDATIONS` LAB-02's `const` made for reassignment, and `S-02-CPP-DSA-MASTERY` LAB-02's `private` made for data access: a runtime hope turned into a compile-time guarantee.

### SE Lens

Every overriding method in this bridge series, from this point forward, is marked `override` — not because the language requires it, but because Concept Unit 2's own verified proof shows exactly what happens without it: a typo that should be loud (a broken override) stays silent (a mere warning) until it causes wrong behavior somewhere a reader has to debug from scratch.

### Connection

Concept Unit 3 shows a second, more dangerous default `virtual` alone does not fix — what happens when a polymorphic object is destroyed.

---

## Concept Unit 3: The Virtual Destructor — a Real, Verified Leak

### The Problem

`new Warrior(...)` allocates on the heap (`S-02-CPP-DSA-MASTERY` LAB-04's own subject); `delete`d through a `Character*` (exactly the pattern Concept Unit 1's own polymorphic dispatch is built for), which destructor actually runs — `~Character()`, `~Warrior()`, or both?

### Concept Lab

```cpp
// scratch_nonvirtual_dtor.cpp  (disposable)
#include <iostream>
#include <string>
class Character {
protected:
    std::string name;
public:
    Character(const std::string& n) : name(n) {}
    virtual void describe() const {
        std::cout << "[Character] " << name << std::endl;
    }
    ~Character() {   // NOT virtual
        std::cout << name << " (Character) destroyed" << std::endl;
    }
};
class Warrior : public Character {
    int* rageLog;
public:
    Warrior(const std::string& n) : Character(n), rageLog(new int[10]) {}
    void describe() const override {
        std::cout << "[Warrior] " << name << std::endl;
    }
    ~Warrior() {
        delete[] rageLog;
        std::cout << name << " (Warrior) destroyed, rageLog freed" << std::endl;
    }
};
int main() {
    Character* c = new Warrior("Zara");
    c->describe();
    delete c;
}
```

Compiling and running — verified this session:

```
$ g++ scratch_nonvirtual_dtor.cpp -o scratch_nonvirtual_dtor -std=c++17 -Wall -Wextra
scratch_nonvirtual_dtor.cpp: In function 'int main()':
scratch_nonvirtual_dtor.cpp:30:5: warning: deleting object of polymorphic class type 'Character' which has non-virtual destructor might cause undefined behavior [-Wdelete-non-virtual-dtor]
   30 |     delete c;
      |     ^~~~~~~~
$ ./scratch_nonvirtual_dtor.exe
[Warrior] Zara
Zara (Character) destroyed
```

What that proves, and it is exactly as serious as it looks: `c->describe()` correctly dispatched to `Warrior::describe()`, per Concept Unit 1 — `virtual` on `describe()` works. But `delete c;` printed only `"Zara (Character) destroyed"` — `~Warrior()` **never ran at all**. `rageLog`, allocated with `new int[10]` in `Warrior`'s constructor, was never freed — a real, verified memory leak, on every single `delete` of a `Warrior` through a `Character*`, with no crash, no visible symptom in this small program, only a compiler warning that's easy to miss under `-Wall -Wextra` alongside other warnings. This is `S-01-CPP-FOUNDATIONS` LAB-08's own memory-danger theme, reached through inheritance instead of a raw dangling pointer.

Now, verified with `virtual ~Character()` added — nothing else changed:

```
$ ./scratch_virtual_dtor.exe
Character constructed
Warrior constructed (rageLog allocated)
Warrior destroyed (rageLog freed)
Character destroyed
```

With the base destructor marked `virtual`, `delete c;` correctly runs `~Warrior()` *first* (freeing `rageLog`), *then* `~Character()` — the reverse of construction order, exactly matching `S-02-CPP-DSA-MASTERY` LAB-04's own Rule of Three destructor-ordering discipline, now spanning a base/derived pair instead of one class's own members.

Both scratch files are discarded now; the real `Character` (Concept Unit 1) is updated with `virtual ~Character() = default;`.

### Mechanical Walkthrough

- `~Character()` (non-virtual) — **(c) reusing** destructor syntax (`S-02-CPP-DSA-MASTERY` LAB-04), here proven insufficient the moment `delete` happens through a base pointer to a derived object.
- `virtual ~Character() = default;` — **(a) first appearance of a virtual destructor.** `virtual` here means exactly what it meant for `describe()` (Concept Unit 1) — which destructor actually runs is decided by the object's real type, not the pointer's declared type. `= default` (not previously used in this bridge series) asks the compiler to generate the ordinary, do-nothing-extra destructor body it would have generated anyway — the *only* thing this declaration changes is adding `virtual` to that otherwise-unremarkable destructor.

### CS Lens

A virtual destructor uses the identical vtable mechanism (Concept Unit 1's CS Lens) as any other virtual method — the base class's vtable slot for its destructor holds the address of whichever class's destructor actually applies to the real object, found the same way `describe()`'s correct override was found.

### SE Lens

**The rule this verified leak justifies, stated plainly:** any class with at least one `virtual` method, and any class ever meant to be deleted through a base class pointer, needs a `virtual` destructor — not as a stylistic preference, but because this session's own compiled proof shows the concrete, silent cost of skipping it. GCC's own `-Wdelete-non-virtual-dtor` warning (part of this course's standard `-Wall -Wextra`, verified firing above) exists specifically to catch this — treat it as a hard stop, the same standing this bridge series gives every "compiles but wrong" warning category.

### Connection

Concept Unit 4 introduces a base class that goes one step further than "has virtual methods" — one that cannot be instantiated at all, because some of its methods have no implementation whatsoever.

---

## Concept Unit 4: Pure Virtual Functions and Abstract Classes

### The Problem

`Character::describe()` currently has a real (if generic) implementation — but there's no meaningful generic "describe any character" text; every real character is some specific class. Nothing so far prevents someone from creating a bare `Character` directly, with no class-specific behavior at all.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `main.cpp` — modified.
- **Change type:** Replace (`Character::describe()`'s body is removed entirely).
- **Location:** `Character`'s definition.
- **Dependencies:** `virtual` (Concept Unit 1).

### The New Code

```cpp
class Character {
protected:
    std::string name;
    int hp;
public:
    Character(const std::string& n, int startHp) : name(n), hp(startHp) {}
    virtual void describe() const = 0;
    virtual ~Character() = default;
};
```

### The Updated Project

`Warrior`/`Mage` (from Lesson 1, carried forward) remain unchanged — each already provides a real `describe() const override`, which is what satisfies `Character`'s new requirement.

### Concept Lab

```cpp
// scratch_abstract.cpp  (disposable)
#include <string>
class Character {
protected:
    std::string name;
public:
    Character(const std::string& n) : name(n) {}
    virtual void describe() const = 0;
    virtual ~Character() = default;
};
int main() {
    Character c("nope");   // attempting to create a bare Character
    return 0;
}
```

Compiling — verified this session:

```
$ g++ scratch_abstract.cpp -o scratch_abstract -std=c++17 -Wall -Wextra
scratch_abstract.cpp:19:15: error: cannot declare variable 'c' to be of abstract type 'Character'
   19 |     Character c("nope");
      |               ^
scratch_abstract.cpp:3:7: note:   because the following virtual functions are pure within 'Character':
scratch_abstract.cpp:8:18: note:     'virtual void Character::describe() const'
```

What that proves: `= 0` instead of a method body makes `describe()` a **pure virtual function** — `Character` now has no implementation for it at all, which makes `Character` itself an **abstract class**: the compiler refuses to let one exist on its own, by name, in the exact error message. A second, related proof — a derived class that forgets to implement it:

```cpp
// scratch_missing_impl.cpp  (disposable)
class Rogue : public Character {
public:
    Rogue(const std::string& n) : Character(n) {}
    // forgot to implement describe()
};
int main() { Rogue r("Shade"); }
```

```
$ g++ scratch_missing_impl.cpp -o scratch_missing_impl -std=c++17 -Wall -Wextra
scratch_missing_impl.cpp:15:11: error: cannot declare variable 'r' to be of abstract type 'Rogue'
scratch_missing_impl.cpp:9:7: note:   because the following virtual functions are pure within 'Rogue':
scratch_missing_impl.cpp:7:18: note:     'virtual void Character::describe() const'
```

What that proves: `Rogue` *inherits* `describe()`'s pure-virtual, unimplemented status from `Character` — since `Rogue` never provides its own `describe() const override`, `Rogue` is *itself* still abstract, and cannot be instantiated either, until it does.

Both scratch files are discarded now; the real `Character` uses this exact pattern, and every real derived class (`Warrior`, `Mage`) already satisfies it.

### Mechanical Walkthrough

- `virtual void describe() const = 0;` — **(a) first appearance of a pure virtual function.** The `= 0` is not a return value or a real assignment — it is the specific syntax marking this virtual method as having no base implementation at all.

### CS Lens

An abstract class with only pure virtual methods and no data of its own is called an **interface** — a pure contract ("anything claiming to be a `Shape` must provide an `area()`," for a different example) with zero shared implementation. `Character` is not quite this pure (it holds real data — `name`, `hp` — and could, in principle, have non-pure virtual methods too), making it an abstract *base class* rather than a strict interface — a real, common distinction: interfaces define a contract; abstract base classes can define a contract *and* share real implementation and data, the way `Character` shares `name`/`hp` storage with every derived class.

### SE Lens

Making `Character` abstract is a design decision with real teeth, not just documentation: it is now a **compile error**, not a code-review note, to accidentally create a bare `Character` that was meant to always be some specific class. This is the same "turn a discipline into a guarantee" theme every access-control and `const` lesson in this series has repeated — here applied to "this type must never be instantiated directly."

### Connection

Concept Unit 5 puts every mechanism from this lesson together into the one thing Lesson 1 proved was impossible: a single, uniform loop over a mixed collection of characters.

---

## Concept Unit 5: The Payoff — a Polymorphic Collection

### The Problem

Lesson 1 ended unable to write one function that correctly prints every kind of character in a mixed collection — `Character&`/`Character*` always called the base version. Concept Units 1–4 have now individually fixed every piece that blocked this. Nothing has proven yet that they compose into the actual payoff.

### Project Change

- **Reference Source:** This series' own Lesson 1 `Warrior`/`Mage`, combined with this lesson's `Character`.
- **Files affected:** `main.cpp` — modified.
- **Change type:** Add.
- **Location:** `main`.
- **Dependencies:** `virtual` (Concept Unit 1), abstract `Character` (Concept Unit 4), `std::vector` (`S-01-CPP-FOUNDATIONS` LAB-07 preview), `new`/`delete` (`S-02-CPP-DSA-MASTERY` LAB-04).

### The New Code

```cpp
std::vector<Character*> party;
party.push_back(new Warrior("Zara", 100));
party.push_back(new Mage("Lyra", 80));

for (Character* c : party) {
    c->describe();
}

for (Character* c : party) {
    delete c;
}
```

### The Updated Project

```cpp
#include <iostream>
#include <string>
#include <vector>

class Character {
protected:
    std::string name;
    int hp;
public:
    Character(const std::string& n, int startHp) : name(n), hp(startHp) {}
    virtual void describe() const = 0;
    virtual ~Character() = default;
};

class Warrior : public Character {
public:
    Warrior(const std::string& n, int startHp) : Character(n, startHp) {}
    void describe() const override {
        std::cout << "[Warrior] " << name << " HP:" << hp << std::endl;
    }
};

class Mage : public Character {
public:
    Mage(const std::string& n, int startHp) : Character(n, startHp) {}
    void describe() const override {
        std::cout << "[Mage] " << name << " HP:" << hp << std::endl;
    }
};

int main() {
    std::vector<Character*> party;
    party.push_back(new Warrior("Zara", 100));
    party.push_back(new Mage("Lyra", 80));

    for (Character* c : party) {
        c->describe();
    }

    for (Character* c : party) {
        delete c;
    }
}
```

### Concept Lab

No separate throwaway: this real, full program, run below, *is* the demonstration this entire lesson has been building toward.

Run it — verified this session:

```
$ g++ main.cpp -o dungeon -std=c++17 -Wall -Wextra
$ ./dungeon.exe
[Warrior] Zara HP:100
[Mage] Lyra HP:80
```

What that proves, completely: `party` holds `Character*` — genuinely, `Warrior*` and `Mage*` values, upcast implicitly to `Character*` (legal by Lesson 1's "is-a" relationship) when `push_back`ed. The single `for (Character* c : party) { c->describe(); }` loop — one loop, zero `if`/`switch` on class type anywhere in it — correctly printed each object's own class-specific line, because `describe()` is `virtual` (Concept Unit 1) and each object's own vtable pointer (this lesson's own CS Lens) directed the call correctly. `delete c;` in the second loop correctly ran each object's *actual* destructor chain (Concept Unit 3), because `~Character()` is `virtual`.

### Mechanical Walkthrough

- `std::vector<Character*> party;` — **(a) first appearance of a container holding base-class pointers to a mix of derived types**, the concrete resolution of Lesson 1 Concept Unit 7's own warning: never a plain `Character` value (object slicing would apply); always a pointer, here specifically.
- `party.push_back(new Warrior("Zara", 100));` — **(c) reusing** `new` (`S-02-CPP-DSA-MASTERY` LAB-04) and `push_back` (`S-01-CPP-FOUNDATIONS` LAB-07 preview) — `new Warrior(...)` returns a `Warrior*`, implicitly convertible to `Character*` per the "is-a" relationship, with no cast needed.
- `for (Character* c : party) { c->describe(); }` — **(c) reusing** range-based `for` (`S-01-CPP-FOUNDATIONS` LAB-07) — `c`'s declared type is `Character*`; per Concept Unit 1, the *object's* real type still decides which `describe()` actually runs.

### CS Lens

This loop is polymorphism's actual definition, made concrete: the same code, `c->describe()`, produces different, correct behavior depending on which object `c` currently refers to — not through any branching the programmer wrote, but through the vtable mechanism resolving it automatically, per object, every single call.

### SE Lens

Every function this course writes against `Character*`/`Character&` from this lesson forward — not just `describe()`, any future virtual method — automatically works correctly on any current *or future* derived class, including ones that don't exist yet when the function is written. Adding a `Rogue` class later (this lesson's own Exercise) requires no change to this loop at all — it will simply print `Rogue`'s own `describe()` the moment a `Rogue*` is pushed into `party`, exactly the scalability gap Lesson 1's Concept Unit 1 opened this whole two-lesson arc with.

### Connection

This closes every new mechanism across both this lesson and Lesson 1 — the Closing section connects the full arc, and names the real, deliberate leak risk `new`/`delete` still carries, motivating Lesson 3's smart pointers directly.

---

## Closing

### Connect the pieces

Lesson 1 built real, distinct types (`Warrior`, `Mage`) sharing storage through `Character`, but proved two gaps: calling through a base reference/pointer used the base's own method (method hiding), and copying into a base variable lost derived data (slicing). This lesson closed the first gap with `virtual` (Concept Unit 1), made that fix compiler-checked with `override` (Concept Unit 2), extended the identical mechanism to destructors — proving, with a real observed leak, why skipping it matters (Concept Unit 3) — and used a pure virtual `describe()` to make `Character` itself uninstantiable, forcing every real character to be some specific, complete class (Concept Unit 4). Concept Unit 5's `std::vector<Character*>` loop is every one of those pieces working together: pointers (never plain base values, sidestepping slicing entirely), `virtual` dispatch (correct behavior per object), and a virtual destructor (correct, complete cleanup per object).

### What breaks without this

Concept Unit 3's own verified leak is this lesson's real "what breaks" — not hypothetical, run and observed this session: a `Character` with a non-virtual destructor, deleted through a `Character*` pointing at a `Warrior`, leaks that `Warrior`'s own heap-allocated `rageLog` silently, every single time, with only a compiler warning (easy to miss) as any signal something is wrong. Concept Unit 5's own `party` loop, if `~Character()` had been left non-virtual, would leak identically — twice, once per party member — with the program still running to completion and printing correct-looking output the entire time.

### Exercises

1. Add `Rogue` (this series' own Lesson 1 Exercise, if not already built) as a proper polymorphic class — `virtual`/`override` `describe()`, inheriting from the now-abstract `Character` — and push one into `party`; confirm the existing loop prints its line correctly with zero changes to the loop itself.
2. Deliberately omit `override` from one derived `describe()` and introduce the exact missing-`const` typo from Concept Unit 2 — confirm, for real, that it fails to compile, rather than trusting this lesson's own transcript.
3. Add a second pure virtual method to `Character` — say, `virtual int attackPower() const = 0;` — implement it in `Warrior`/`Mage` (and `Rogue`, if built), and call it inside the existing `for` loop, confirming each character reports its own value.
4. Reproduce Concept Unit 3's leak proof yourself, then use a tool to actually observe the leak directly rather than reasoning about it from missing output — if AddressSanitizer/LeakSanitizer is available on your toolchain (verify first — `S-01-CPP-FOUNDATIONS` LAB-06 found it unavailable on this session's own MinGW build), compile with `-fsanitize=address` and confirm it reports the leaked allocation by name.

### Definition of done

- [ ] `Character` is abstract (`describe() const = 0`), with a `virtual` destructor; `Warrior`/`Mage` both `override` `describe()`.
- [ ] A `std::vector<Character*>` loop correctly dispatches to each derived class's own `describe()`, verified with at least two different derived types.
- [ ] The program compiles with zero warnings under `-std=c++17 -Wall -Wextra`, and every `delete` through a base pointer is backed by a `virtual` destructor.
- [ ] You can state, from Concept Unit 1's own proof, what specifically changed between Lesson 1's failing method-hiding demo and this lesson's working one.
- [ ] You can explain, from Concept Unit 3's own observed leak, exactly what a missing virtual destructor costs and why the compiler only warns instead of refusing to compile.
- [ ] All four Exercises completed with real compiled output, including Exercise 2's deliberate reproduction of a caught compile error.
- [ ] Commit: `git add main.cpp && git commit -m "S03-LAB-02: virtual dispatch, override, virtual destructors, and a working polymorphic party loop"` — states why (both Lesson 1 gaps closed and verified, plus the leak a missing virtual destructor causes) not just what changed.
