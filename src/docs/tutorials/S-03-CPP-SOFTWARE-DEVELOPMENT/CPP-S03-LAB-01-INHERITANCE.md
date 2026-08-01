# Lesson 1: A Subclass Is a Base Class With Something Extra Bolted On
### (LAB 01 — Inheritance)

**What you will build:** A `Character` class hierarchy — `Warrior` and `Mage`, each a real, distinct C++ type, sharing name/HP/attack/defense through a common `Character` base, each adding its own unique data (`rage`, `mana`) and behavior (`buildRage()`, `castSpell()`). The transferable problem: `S-01-CPP-FOUNDATIONS` LAB-10's `Player` struct tracked a character's class as a plain `std::string className`, with every function that cared about class-specific behavior forced into an `if (classChoice == 1) {...}` chain. Every new class meant editing every one of those chains, in every function, and nothing stopped a typo (`"Warrio"`) from silently falling through every branch. Inheritance lets each class be its own real type instead of a string tag — the compiler, not a string comparison, decides what a `Warrior` is.

**What you need to know first:** `S-02-CPP-DSA-MASTERY` LAB-02 — `class`, `private`/`public`, constructors, member initializer lists, `this`, `ClassName::method`. `S-01-CPP-FOUNDATIONS` LAB-10's `Player` struct (the pattern this lesson replaces).

**Terms introduced in this lesson**

> **Inheritance** — defining a new class (a **derived class**) in terms of an existing one (a **base class**), automatically gaining its members and methods.
> **`class Derived : public Base`** — the syntax declaring `Derived` inherits publicly from `Base`.
> **`protected`** — an access level between `private` and `public`: invisible to code outside the class, but visible to derived classes.
> **Constructor chaining** — a derived class's constructor explicitly invoking its base class's constructor, via the member initializer list, before its own body runs.
> **Method hiding** — a derived class defining a method with the same name as a base class method; without `virtual` (next lesson), which version runs is decided by the *static type* of the expression used to call it, not the object's actual type.
> **Object slicing** — copying a derived object into a variable of the base type, discarding every member the derived class added.

No pipeline diagram applies — this bridge series builds standalone concept programs, extending `S-01`/`S-02`'s established RPG theme.

---

## Concept Unit 1: The Problem — a Class Tag Isn't a Class

### The Problem

`S-01-CPP-FOUNDATIONS` LAB-10 tracked a character's class as `std::string className`, set from a menu choice, with class-specific stats assigned via an `if` chain:

```cpp
if (classChoice == 1) { party[i].atk = 8;  party[i].def = 5; }   // Warrior
if (classChoice == 2) { party[i].atk = 12; party[i].def = 2; }   // Mage
if (classChoice == 3) { party[i].atk = 10; party[i].def = 3; }   // Rogue
```

Every function that needs to behave differently per class — a Mage casting spells, a Warrior building rage — would need its own copy of this same `if` chain, checking `className` by string comparison, with no guarantee every chain stays in sync as new classes are added.

### No isolated code lab for this step

The problem is best shown against the real, already-familiar S-01 code it replaces, not an invented illustration.

### Explanation

A `std::string className` is a **tag** — a label describing what kind of thing a `Player` is, checked manually, everywhere it matters, by whatever code happens to care. It is not, itself, a different *type* — every `Player`, Warrior or Mage or Rogue, is the exact same C++ type, with the exact same fields, some of them meaningless for a given class (a Rogue's `Player` still has a `mana`-shaped absence, an `atk`/`def` pair that means something different per class but is stored identically for all of them).

**Inheritance** replaces the tag with real, distinct types: a `Warrior` and a `Mage` become genuinely different classes, sharing what's common (name, HP, attack, defense) through one base class, each free to add exactly the fields and methods its own class actually needs — `rage` exists only on a `Warrior`; `mana` only on a `Mage`.

### CS Lens

A tag-and-`if`-chain design is sometimes called a **discriminated union without compiler support** — the "which variant is this" decision (`classChoice`) lives in ordinary data, checked by ordinary comparisons, with nothing preventing an inconsistent state (a `className` of `"Warrior"` on a `Player` whose stats were never actually set for that class) or a forgotten branch when a new variant is added. Inheritance moves that decision into the **type system** — a `Warrior` object cannot forget to be a `Warrior`, because its type *is* `Warrior`, checked and enforced by the compiler at every point it's used.

### SE Lens

The real cost `className` + `if`-chains impose isn't apparent with three classes and a handful of functions — it's the same "invisible until it scales" cost `S-01-CPP-FOUNDATIONS` LAB-13's own `dismissPlayer` O(n) shift demonstrated for arrays: each new class multiplies the number of `if`-chains that need a new branch, and nothing catches a forgotten one at compile time. Inheritance's payoff shows up exactly there — Lesson 2 (Polymorphism) makes adding a new class a matter of adding one new derived class, with the compiler helping ensure nothing was missed.

### Connection

Concept Unit 2 builds the real `Character` base class this lesson's `Warrior`/`Mage` will inherit from.

---

## Concept Unit 2: `class Derived : public Base`

### The Problem

`Character` needs to exist as a real type before anything can inherit from it — holding exactly the fields every kind of character shares, regardless of class.

### Project Change

- **Reference Source:** `S-02-CPP-DSA-MASTERY` LAB-02's `BankAccount` (this bridge series' prerequisite) — reused for its `private`/constructor/member-initializer-list pattern, applied here to a new class.
- **Files affected:** `main.cpp` — new file for this lesson.
- **Change type:** Add (new file).
- **Location:** Above `main`.
- **Dependencies:** `class`, constructors, member initializer lists (`S-02-CPP-DSA-MASTERY` LAB-02).

### The New Code

```cpp
class Character {
protected:
    std::string name;
    int hp;
    int maxHp;
    int atk;
    int def;

public:
    Character(const std::string& n, int startHp, int startAtk, int startDef)
        : name(n), hp(startHp), maxHp(startHp), atk(startAtk), def(startDef) {}

    void describe() const {
        std::cout << "[Character] " << name << ": HP " << hp << "/" << maxHp
                  << " ATK " << atk << " DEF " << def << std::endl;
    }

    int attack() const {
        return atk;
    }
};

class Warrior : public Character {
public:
    Warrior(const std::string& n, int startHp, int startAtk, int startDef)
        : Character(n, startHp, startAtk, startDef) {}
};
```

### The Updated Project

```cpp
#include <iostream>
#include <string>

class Character { /* shown above */ };

class Warrior : public Character { /* shown above */ };

int main() {
    Warrior zara("Zara", 100, 15, 8);
    zara.describe();
    std::cout << "attack() returns: " << zara.attack() << std::endl;
    return 0;
}
```

### Concept Lab

No separate throwaway: `Warrior`, run directly below, is already the smallest real demonstration of inheritance — a derived class with no members of its own yet, proving it gains everything from its base before anything is added on top.

Run it — verified this session:

```
$ g++ main.cpp -o dungeon -std=c++17 -Wall -Wextra
$ ./dungeon.exe
Zara: HP 100/100 ATK 15 DEF 8
attack() returns: 15
```

What that proves: `Warrior zara("Zara", 100, 15, 8);` compiled and ran even though `Warrior` itself declares no constructor body of its own beyond forwarding to `Character`'s, and `zara.describe()`/`zara.attack()` both worked even though neither method is written anywhere inside `Warrior`'s own definition — `Warrior` inherited both, in full, from `Character`, exactly as `class Warrior : public Character` promised.

### Mechanical Walkthrough

- `class Warrior : public Character` — **(a) first appearance.** Declares `Warrior` as a **derived class** of `Character` (the **base class**), inheriting **publicly** — every `public` member of `Character` remains `public` when accessed through a `Warrior`. This is the "is-a" relationship: a `Warrior` genuinely *is* a `Character`, with everything that implies about which methods it has.
- `Warrior(const std::string& n, int startHp, int startAtk, int startDef) : Character(n, startHp, startAtk, startDef) {}` — **(a) first appearance of constructor chaining**, covered in full in Concept Unit 4 — noted here only as "how `Warrior` gets a working `Character` portion," since it deserves its own explanation.

### CS Lens

Inheritance's "gains everything from the base" behavior is the type-system version of Concept Unit 1's own critique: where a `className` string had to be checked by every interested function, a `Warrior` *is* a `Character` by construction — every function written to accept a `Character` (Lesson 2's whole subject) automatically works correctly on a `Warrior`, with zero string comparisons anywhere.

### SE Lens

Sharing `name`/`hp`/`maxHp`/`atk`/`def` through one base class, rather than redeclaring them in `Warrior`, `Mage`, and `Rogue` separately, is the identical DRY principle `S-01-CPP-FOUNDATIONS` LAB-05 introduced for functions — a bug fix or a new shared field added to `Character` automatically applies to every class derived from it, with no risk of one derived class's copy drifting out of sync with another's.

### Connection

`zara`'s fields (`name`, `hp`, etc.) are currently invisible to `Warrior`'s own code — Concept Unit 3 explains why they're reachable at all, given they're not `public`.

---

## Concept Unit 3: `protected` — Visible to Derived Classes, Hidden From Everyone Else

### The Problem

`Character`'s fields are declared `protected`, not `private` — `S-02-CPP-DSA-MASTERY` LAB-02 only ever used `private`. Something about inheritance specifically needs a third access level.

### Concept Lab

```cpp
// scratch_protected.cpp  (disposable)
#include <string>
class Character {
protected:
    std::string name;
public:
    Character(const std::string& n) : name(n) {}
};
int main() {
    Character c("Zara");
    return c.name.length();   // deliberately reaching for a protected member from outside
}
```

Compiling — verified this session:

```
$ g++ scratch_protected.cpp -o scratch_protected -std=c++17 -Wall -Wextra
scratch_protected.cpp:10:14: error: 'std::string Character::name' is protected within this context
   10 |     return c.name.length();
      |              ^~~~
```

What that proves: `protected`, from outside the class, behaves exactly like `private` — `main`'s attempt to read `c.name` fails identically to how `S-02-CPP-DSA-MASTERY` LAB-02's `account.balance` failed. The real difference only shows up from *inside a derived class*:

```cpp
// scratch_derived_access.cpp  (disposable)
#include <string>
#include <iostream>
class Character {
protected:
    std::string name;
public:
    Character(const std::string& n) : name(n) {}
};
class Warrior : public Character {
public:
    Warrior(const std::string& n) : Character(n) {}
    void shout() const {
        std::cout << name << " shouts a battle cry!" << std::endl;
    }
};
int main() {
    Warrior w("Zara");
    w.shout();
}
```

```
$ g++ scratch_derived_access.cpp -o scratch_derived_access -std=c++17 -Wall -Wextra
$ ./scratch_derived_access.exe
Zara shouts a battle cry!
```

What that proves: `Warrior::shout()` reads `name` directly, with no qualifier, no error — `protected` grants exactly this access: visible to the class itself *and every class derived from it*, invisible to everything else. `private` would have blocked `Warrior` too, per `S-02-CPP-DSA-MASTERY` LAB-02's own rule with no exception for derived classes.

Both scratch files are discarded now; the real `Character`'s fields use `protected` specifically because `Warrior`/`Mage` (Concept Unit 5) need to read and write them directly, inside their own methods.

### Mechanical Walkthrough

- `protected:` — **(a) first appearance.** A third access specifier, between `private` (class-only) and `public` (everyone) — grants access to the declaring class and every class that derives from it.

### CS Lens

`protected` exists specifically to serve inheritance's needs: `private` would force every derived class to go through the base's own `public` methods to touch inherited data at all (a valid, sometimes preferred, design — Lesson 2's abstract-class pattern leans this way for some members) — `protected` instead trusts derived classes with direct access, the same way a base class trusts itself.

### SE Lens

`protected` is a real design tradeoff, not a strictly safer or strictly more convenient choice than `private`: it grants derived classes direct access, which is convenient (`Warrior::shout()` needed no getter), but it also means *any* future derived class can modify `name` however it likes, with none of `private`'s "only these specific methods can touch this" guarantee — a base class's own invariants (LAB-02's whole reason for encapsulation) are correspondingly weaker for `protected` members than `private` ones. This lesson chooses `protected` because `Character`'s own fields are simple and every derived class genuinely needs direct access to them; a class with real invariants to protect (a balance that must never go negative, say) would keep those fields `private` even from its own derived classes.

### Connection

Concept Unit 4 explains exactly how `Warrior`'s constructor gets `Character`'s own fields initialized in the first place.

---

## Concept Unit 4: Constructor Chaining

### The Problem

`Character`'s constructor requires four arguments. `Warrior`'s constructor also takes four arguments and does nothing visible with them in its own body — something has to actually run `Character`'s constructor logic, or `name`/`hp`/`maxHp`/`atk`/`def` would never be set at all.

### No isolated code lab for this step

Already demonstrated as part of Concept Unit 2's own code — this unit names and explains the mechanism that code used without full explanation.

### Explanation

```cpp
Warrior(const std::string& n, int startHp, int startAtk, int startDef)
    : Character(n, startHp, startAtk, startDef) {}
```

`: Character(n, startHp, startAtk, startDef)` is `Warrior`'s own member initializer list (`S-02-CPP-DSA-MASTERY` LAB-02's own syntax) — except instead of initializing a member variable directly, it invokes `Character`'s constructor, passing along the values `Warrior`'s constructor received. This runs *before* `Warrior`'s own constructor body (here, empty — `{}`) executes. Every base class's constructor runs before its derived class's constructor body, always, whether explicitly chained (as here) or implicitly (if a base class has a constructor taking no arguments, it runs automatically with no `: Base(...)` needed at all — not the case here, since `Character` requires four arguments).

### CS Lens

Constructor chaining guarantees a derived object's base portion is always fully, correctly constructed before any derived-specific logic runs — the same "smallest piece first, then build outward" ordering `S-01-CPP-FOUNDATIONS` LAB-05's call stack demonstrated for function calls, here applied to object construction: `Character`'s constructor completes, in full, before `Warrior`'s own constructor body gets a chance to run at all.

### SE Lens

If `Character` had no constructor taking exactly zero or matching arguments and `Warrior` failed to chain to it explicitly, the code would not compile at all — the compiler refuses to leave a base class's fields uninitialized by construction, the same "no invariant left unenforced" discipline `S-01-CPP-FOUNDATIONS` LAB-01 demanded for plain variables, now enforced automatically across an entire inheritance chain.

### Connection

Concept Unit 5 gives `Warrior` and `Mage` fields and methods `Character` doesn't have at all.

---

## Concept Unit 5: Derived-Only Members and Methods

### The Problem

A `Warrior`'s rage and a `Mage`'s mana have no equivalent in `Character` — nothing shared between classes should force every character to carry fields that only make sense for one of them.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `main.cpp` — modified.
- **Change type:** Add.
- **Location:** Inside `Warrior`'s definition; a new `Mage` class alongside it.
- **Dependencies:** `Character` (Concept Unit 2), `protected` access (Concept Unit 3).

### The New Code

```cpp
class Warrior : public Character {
public:
    int rage;

    Warrior(const std::string& n, int startHp, int startAtk, int startDef)
        : Character(n, startHp, startAtk, startDef), rage(0) {}

    void buildRage() {
        rage += 10;
        std::cout << name << " builds rage (" << rage << ")" << std::endl;
    }
};

class Mage : public Character {
public:
    int mana;

    Mage(const std::string& n, int startHp, int startAtk, int startDef, int startMana)
        : Character(n, startHp, startAtk, startDef), mana(startMana) {}

    void castSpell() {
        if (mana >= 20) {
            mana -= 20;
            std::cout << name << " casts a spell! (mana now " << mana << ")" << std::endl;
        } else {
            std::cout << name << " doesn't have enough mana." << std::endl;
        }
    }
};
```

### The Updated Project

```cpp
int main() {
    Warrior zara("Zara", 100, 15, 8);
    Mage lyra("Lyra", 80, 12, 4, 50);

    zara.describe();
    lyra.describe();

    zara.buildRage();
    lyra.castSpell();
    lyra.castSpell();
    lyra.castSpell();

    return 0;
}
```

(`describe()` is overridden per-class in Concept Unit 6 — shown here already updated, since Concept Unit 6 explains exactly what changed and why.)

### Concept Lab

No separate throwaway: `zara`/`lyra`, run directly below, already demonstrate the full pattern.

Run it — verified this session:

```
$ g++ main.cpp -o dungeon -std=c++17 -Wall -Wextra
$ ./dungeon.exe
[Warrior] Zara: HP 100/100 ATK 15 DEF 8 RAGE 0
[Mage] Lyra: HP 80/80 ATK 12 DEF 4 MANA 50
Zara builds rage (10)
Lyra casts a spell! (mana now 30)
Lyra casts a spell! (mana now 10)
Lyra doesn't have enough mana.
```

What that proves: `rage` exists only on `Warrior`, `mana` only on `Mage` — neither class carries a meaningless field for the other's mechanic, unlike LAB-10's `Player` struct, which held `atk`/`def` meaningfully for every class but had no way to hold a Warrior-only or Mage-only field at all without adding it, unused, to *every* character regardless of class. `castSpell()` correctly refused the third cast — `mana`, reduced by 20 twice from 50, reached `10`, below the `20` threshold — demonstrating a derived class's own method reading and modifying its own derived-only field, using the exact same syntax as any other member function.

### Mechanical Walkthrough

- `int rage;` (inside `Warrior`), `int mana;` (inside `Mage`) — **(c) reusing** plain member-variable declaration (`S-02-CPP-DSA-MASTERY` LAB-02), now inside a *derived* class, alongside inherited `protected` members it never redeclares.
- `void buildRage()`, `void castSpell()` — **(c) reusing** member-function syntax (`S-02-CPP-DSA-MASTERY` LAB-02) — each accesses both its own class's new field (`rage`, `mana`) and the inherited `protected` `name`, in the same method body, with no special syntax marking the difference.

### CS Lens

A derived class adding fields and methods the base class knows nothing about is the core payoff of inheritance done well: `Character` never needs to know `Warrior` or `Mage` exist, let alone what `rage` or `mana` mean — the dependency runs one direction only, derived depending on base, never the reverse.

### SE Lens

This one-directional dependency is what makes adding a third class (`Rogue`, this lesson's own Exercise) require zero changes to `Character`, `Warrior`, or `Mage` — a real, structural version of the "logic stays fixed, data varies" payoff `S-01-CPP-FOUNDATIONS` LAB-05 first demonstrated for functions, now scaled to entire classes.

### Connection

Every character so far describes itself differently — Concept Unit 6 explains exactly how, and the real surprise waiting in that mechanism.

---

## Concept Unit 6: Method Hiding — the Surprise Without `virtual`

### The Problem

`Warrior` and `Mage` each define their own `describe()`, printing their own class-specific tag and fields. Calling `zara.describe()` directly clearly calls `Warrior`'s version — but what happens if `zara` is accessed through a `Character&` or `Character*` instead?

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `main.cpp` — modified.
- **Change type:** Add (a `describe()` override in each derived class, already shown in Concept Unit 5's Updated Project).
- **Location:** Inside `Warrior` and `Mage`.
- **Dependencies:** `Character::describe()` (Concept Unit 2).

### The New Code

```cpp
// Inside Warrior:
void describe() const {
    std::cout << "[Warrior] " << name << ": HP " << hp << "/" << maxHp
              << " ATK " << atk << " DEF " << def << " RAGE " << rage << std::endl;
}

// Inside Mage:
void describe() const {
    std::cout << "[Mage] " << name << ": HP " << hp << "/" << maxHp
              << " ATK " << atk << " DEF " << def << " MANA " << mana << std::endl;
}
```

### Concept Lab

This needs a dedicated, minimal Concept Lab — the real project never accesses a `Warrior` through a `Character&`/`Character*`, so it can't demonstrate the surprise this unit exists to reveal.

```cpp
// scratch_hiding.cpp  (disposable)
#include <iostream>
#include <string>
class Character {
protected:
    std::string name;
public:
    Character(const std::string& n) : name(n) {}
    void describe() const {
        std::cout << "[Character] " << name << std::endl;
    }
};
class Warrior : public Character {
public:
    Warrior(const std::string& n) : Character(n) {}
    void describe() const {
        std::cout << "[Warrior] " << name << std::endl;
    }
};
int main() {
    Warrior zara("Zara");
    zara.describe();

    Character& ref = zara;
    ref.describe();

    Character* ptr = &zara;
    ptr->describe();
}
```

Run it — verified this session:

```
$ g++ scratch_hiding.cpp -o scratch_hiding -std=c++17 -Wall -Wextra
$ ./scratch_hiding.exe
[Warrior] Zara
[Character] Zara
[Character] Zara
```

**A real, verified surprise worth stating plainly, not softening:** `zara.describe()` — called directly on the `Warrior` variable — correctly prints `[Warrior] Zara`. But `ref.describe()` (a `Character&` bound to that exact same `zara` object) and `ptr->describe()` (a `Character*` pointing at that exact same object) both print `[Character] Zara` — the *base* class's version, even though the actual object, in memory, is unambiguously a `Warrior`. Nothing about the object changed between these three calls; only the *declared type of the expression used to call `describe()`* changed. This is called **method hiding**: `Warrior::describe()` does not replace or override `Character::describe()` in any way the compiler tracks by object identity — it simply happens to share a name, and which one gets called is decided, at compile time, by the static type of the calling expression (`Warrior`, `Character&`, `Character*`), not by what the object actually is at runtime.

This scratch file is discarded now — the real project (Concept Unit 5) never calls `describe()` through a `Character&`/`Character*`, so it never hits this surprise; but any code that *does* need to work correctly through a base reference or pointer — which is precisely how `Lesson 2` will let one function handle every kind of `Character` uniformly — needs a different tool entirely.

### Mechanical Walkthrough

- `Character& ref = zara;` — **(c) reusing** reference binding (`S-01-CPP-FOUNDATIONS` LAB-09), here binding a base-type reference to a derived-type object — legal, per the "is-a" relationship Concept Unit 2 established: a `Warrior` genuinely is a `Character`, so a `Character&` can validly refer to one.
- `ref.describe();` / `ptr->describe();` — **(a) first appearance of calling a hidden method through a base reference/pointer**, resolved at compile time to `Character::describe()`, per this unit's own verified proof.

### CS Lens

This is **static (compile-time) binding**: the compiler decides which `describe()` to call by looking only at the declared type of `ref`/`ptr` — `Character` — without ever consulting what the object actually is at runtime. This is the *default* behavior for every C++ member function unless something explicitly requests the opposite — exactly what `virtual` (Lesson 2) does.

### SE Lens

This is precisely why a `className` string plus manual `if`-chains (Concept Unit 1) doesn't disappear immediately just by switching to inheritance: a function written to take a `Character&` and call `.describe()` on it will, right now, always print the generic `[Character]` line, never the derived class's own version — inheritance alone gives you shared *storage* and shared *interface names*, but not yet shared *correct runtime behavior* through that interface. Lesson 2 closes exactly this gap.

### Connection

Concept Unit 7 shows a second, related surprise — what happens when a derived object is *copied* into a base-typed variable, not just referred to through one.

---

## Concept Unit 7: Object Slicing

### The Problem

Concept Unit 6 showed that *referring* to a `Warrior` through a `Character&`/`Character*` loses access to `Warrior`-specific behavior. What happens if a `Warrior` is *copied* — by value — into a plain `Character` variable?

### Concept Lab

```cpp
// scratch_slicing.cpp  (disposable)
#include <iostream>
#include <string>
class Character {
protected:
    std::string name;
public:
    Character(const std::string& n) : name(n) {}
    void describe() const { std::cout << "[Character] " << name << std::endl; }
};
class Warrior : public Character {
public:
    int rage = 100;
    Warrior(const std::string& n) : Character(n) {}
    void describe() const { std::cout << "[Warrior] " << name << " rage=" << rage << std::endl; }
};
int main() {
    Warrior zara("Zara");
    Character sliced = zara;   // copying a Warrior into a plain Character variable
    sliced.describe();
}
```

Run it — verified this session:

```
$ g++ scratch_slicing.cpp -o scratch_slicing -std=c++17 -Wall -Wextra
$ ./scratch_slicing.exe
[Character] Zara
```

What that proves: `Character sliced = zara;` compiles — a `Warrior` genuinely *is* a `Character`, per Concept Unit 2's "is-a" relationship, so this assignment is legal — but `sliced` is a real, ordinary `Character`, not secretly a `Warrior`. Its `rage` (which doesn't exist on `Character` at all) is simply not there — copied out of existence, not preserved anywhere. This is called **object slicing**: only the `Character` portion of `zara` — `name`, and whatever else `Character` itself declares — was copied; everything `Warrior` added on top was silently discarded, with no error, no warning, and no way to recover it from `sliced` afterward.

This scratch file is discarded now; the real project (`S-01-CPP-FOUNDATIONS`'s own `Player` array, revisited with real classes in a later lesson) never assigns a derived object into a base-typed variable by value — it always uses references or, per Lesson 2's own upcoming pattern, pointers, specifically to avoid this.

### Mechanical Walkthrough

- `Character sliced = zara;` — **(a) first appearance of assigning a derived object to a base-typed variable by value.** Legal by the "is-a" relationship, but constructs a genuinely new `Character` object, copying only what `Character` itself owns.

### CS Lens

Object slicing is the "is-a" relationship's own sharp edge: a `Warrior` *is* a `Character`, so a `Character`-typed variable can legally hold one — but a variable's declared type in C++ determines exactly how much storage it has, always, and a plain (non-reference, non-pointer) `Character` variable simply does not have room for a `Warrior`'s extra fields, no matter what was assigned into it.

### SE Lens

This is a second, independent reason (alongside Concept Unit 6's method-hiding surprise) that working with a mixed collection of `Warrior`s and `Mage`s through their shared `Character` base requires references or pointers, never plain base-typed values — `S-01-CPP-FOUNDATIONS` LAB-13's `Player party[MAX_PARTY]` array, storing every character as the exact same struct type, sidestepped this problem entirely only because it never had derived types to slice in the first place; Lesson 2 shows the real, class-hierarchy-safe way to store a mixed party.

### Connection

This closes every new mechanism in this lesson — the Closing section connects inheritance's real gain against its two now-verified gaps, both closed by Lesson 2's `virtual`.

---

## Closing

### Connect the pieces

`Character` (Concept Unit 2) holds what every character shares, in `protected` fields (Concept Unit 3) reachable directly by any class that inherits from it. `Warrior` and `Mage` (Concept Units 2, 5) each chain to `Character`'s constructor (Concept Unit 4) to get that shared portion initialized, then add exactly their own class-specific field and method — `rage`/`buildRage()`, `mana`/`castSpell()` — with zero changes required to `Character` itself. Each also redefines `describe()` (Concept Unit 6) to include its own extra field. Called directly (`zara.describe()`), this works exactly as expected. But Concept Units 6 and 7, both verified this session, show the same underlying gap from two angles: a `Character&`/`Character*` referring to a `Warrior` calls `Character::describe()`, not `Warrior::describe()` (Concept Unit 6); and copying a `Warrior` into a plain `Character` loses its `Warrior`-ness entirely (Concept Unit 7). Inheritance alone gives you shared storage and a shared interface *name* — it does not yet give you correct behavior when a derived object is accessed generically, through its base type. That gap is exactly what Lesson 2 (`virtual`) closes.

### What breaks without this

Reasoned through directly from Concept Unit 1's own motivating problem: without inheritance, adding a fourth character class to `S-01-CPP-FOUNDATIONS` LAB-13's design means finding every `if (classChoice == N)` chain across every function that behaves per-class and adding a new branch to each one — with the compiler offering no help finding them all, and a forgotten branch failing silently (the new class simply gets whatever the `if` chain's implicit fallthrough leaves it with, per that lesson's own verified finding about unguarded `if` chains). With inheritance, per Concept Unit 5's own proof, adding a fourth class (`Rogue`, this lesson's Exercise) means writing one new class, inheriting from `Character`, adding exactly its own fields and methods — nothing about `Character`, `Warrior`, or `Mage` needs to change at all.

### Exercises

1. Add a third derived class, `Rogue`, with its own field (e.g., `int stealth`) and method (e.g., `void sneak()`), following `Warrior`/`Mage`'s exact pattern from Concept Unit 5 — confirm it compiles and runs with zero changes to `Character`, `Warrior`, or `Mage`.
2. Reproduce Concept Unit 6's method-hiding proof yourself, but bind the `Character&` to a `Mage` instead of a `Warrior`, and confirm it also prints the generic `[Character]` line, not `[Mage]`'s — the surprise is not specific to `Warrior`.
3. Attempt (and fail on purpose) to access a `protected` field from a class that does *not* inherit from `Character` at all — write a small unrelated class attempting `character.name` on a `Character` parameter — and read the exact compiler error, confirming `protected` extends no access to non-derived classes.
4. Reproduce Concept Unit 3's default-inheritance finding yourself: declare `class Warrior : Character` (omitting `public`), attempt to call `zara.describe()` from `main`, and read the real compiler error — then explain, in your own words, why `class`'s default access level (`S-02-CPP-DSA-MASTERY` LAB-02) and its default *inheritance* level turn out to be the same underlying rule.

### Definition of done

- [ ] `Character`, `Warrior`, and `Mage` all compile and run, with `Warrior`/`Mage` each exposing at least one field and method `Character` does not have.
- [ ] The program compiles with zero warnings under `-std=c++17 -Wall -Wextra`.
- [ ] You can state, from Concept Unit 6's own verified proof, exactly what determines which `describe()` runs when called through a `Character&`/`Character*` — and that it is not the object's actual runtime type.
- [ ] You can explain object slicing (Concept Unit 7) well enough to say, before running it, what fields survive and what's lost when a derived object is assigned to a base-typed variable.
- [ ] All four Exercises completed with real compiled output, including Exercise 4's explicit connection back to `S-02-CPP-DSA-MASTERY` LAB-02's `class`/`struct` default-access rule.
- [ ] Commit: `git add main.cpp && git commit -m "S03-LAB-01: Character/Warrior/Mage inheritance hierarchy, replacing S-01's className string tag"` — states why (real types instead of a string tag, with both remaining gaps — method hiding and slicing — verified and named) not just what changed.
