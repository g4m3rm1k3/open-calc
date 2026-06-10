# C++ Terminal RPG — LAB 14 — OOP: Classes & Inheritance

**Prerequisites:** LAB 13. You have the complete battle system. All game data
lives in `main.cpp`.

**What this lab adds:**
- `class` with public/private members and constructors
- An `Entity` base class that `Character` and `Enemy` inherit from
- `virtual` functions for polymorphic behavior
- Split into multiple files: `entity.h/.cpp`, `character.h/.cpp`, `enemy.h/.cpp`

**Time:** 75–90 minutes

---

## What You Will Build

After this lab the code is the same game, but organized into proper classes:

```
 Before:                        After:
 main.cpp (600+ lines)          main.cpp        (thin entry point)
 ─ Character struct              entity.h/.cpp   (base class)
 ─ Enemy struct                  character.h/.cpp (player)
 ─ All functions                 enemy.h/.cpp    (enemies)
 ─ Battle logic                  battle.h/.cpp   (battle system)
```

The battle system uses virtual functions so `Entity*` pointers work for
both `Character` and `Enemy`:

```cpp
Entity* attacker = &hero;
Entity* defender = &goblin;

// Works regardless of which derived type is pointed to:
int damage = attacker->rollAttack();
defender->takeDamage(damage);
```

---

> **Quick Check — try to answer before reading:**
> 1. What is the difference between `struct` and `class` in C++?
> 2. What does the `virtual` keyword do to a function?
> 3. Prediction: if `Enemy` inherits from `Entity` and overrides `getName()`,
>    what happens when you call `getName()` through an `Entity*` pointer?
>    What if the function is NOT virtual?
> *(Answers at the end of this lab)*

---

## Concept: `class` vs `struct` in C++

**What it is:** In C++, `class` and `struct` are almost identical — the only
difference is the default access: `struct` members are `public` by default,
`class` members are `private` by default.

**The problem before:**
```cpp
// Anyone can accidentally corrupt internal state:
hero.hp = -999;   // valid — hp is public in a struct
hero.level = 50;  // valid — skips XP requirement entirely
```

**The solution:**
```cpp
class Character {
private:
    int hp;     // ← no direct external access
    int level;  // ← must go through approved methods
public:
    void takeDamage(int amount);   // controlled modification
    int  getHP() const;            // safe read
    bool levelUp();                // enforces XP requirement
};
```

**What it hides:** Hides internal state management. Outside code cannot directly corrupt `hp` below 0 or above `maxHP` — only `takeDamage()` and `heal()` (which enforce invariants) can change it. Invariant: `0 <= hp <= maxHP` is guaranteed by the class interface; direct field modification is blocked.

**Canonical example (General Explanation):**
A bank account vs a sticky note. A sticky note (`struct`) is just data — anyone can read and write it. A bank account (`class`) has private data (your balance) and public methods (deposit, withdraw) that enforce rules. The bank prevents you from directly editing your balance to $1,000,000.

```cpp
class BankAccount {
    int balance = 0;        // private by default
public:
    void deposit(int amount) { balance += amount; }
    int getBalance() { return balance; }
};
```

Why obvious: "public interface, private data" is what distinguishes a class from a struct. You interact through controlled operations, not raw field access.

**Project Application (The "Why" here):**
The `Entity` base class in this lab hides `hp`, `maxHP`, and `def` as `protected`. All external code calls `takeDamage(amount)` or `heal(amount)` — methods that clamp HP between 0 and `maxHP`. If `hp` were public, any line of code could set `hero.hp = -999` or `enemy.hp = 9999` and break the game's invariants silently.

**Smallest possible example:**
```cpp
class BankAccount {
private:
    int balance;   // cannot be set directly from outside
public:
    BankAccount() : balance(0) {}     // constructor
    void deposit(int amount) { if (amount > 0) balance += amount; }
    int  getBalance() const  { return balance; }
};

BankAccount acct;
acct.deposit(100);
// acct.balance = -9999;  // ERROR: private
std::cout << acct.getBalance() << std::endl;  // 100
```

**Why it matters here:** The `Entity` base class hides HP manipulation behind
`takeDamage()` and `heal()`, ensuring HP never goes below 0 or above max
without going through the guarded methods.

---

## Concept: Constructors

**What it is:** A special function that runs automatically when an object is
created. It initializes all fields to valid starting values.

**The problem before:**
```cpp
Enemy goblin;
// Forgetting to set goblin.hp — undefined behavior
// No guarantee the struct is in a valid state
```

**The solution:**
```cpp
class Enemy : public Entity {
public:
    Enemy(const std::string& name, int maxHP, int atk, int def) {
        // All required fields initialized here
        this->name  = name;
        this->maxHP = maxHP;
        this->hp    = maxHP;  // always start at full HP
        this->atk   = atk;
        this->def   = def;
    }
};

// Usage: always fully initialized
Enemy goblin("Goblin Scout", 8, 4, 2);
```

**What it hides:** Hides uninitialized state. With a plain `struct`, you must remember to set every field. A constructor makes it impossible to create an object in an invalid state — the invariants are established at construction time and the compiler enforces that constructors run.

**Canonical example (General Explanation):**
A car factory's assembly line — when a car comes off the line, it's immediately ready to drive (all parts installed, tank filled). `Enemy::Enemy(...)` runs automatically when an `Enemy` object is created, ensuring it's never in an invalid state.

```cpp
class Lamp {
    bool isOn;
public:
    Lamp() : isOn(false) {}  // always starts off — never uninitialized
    void toggle() { isOn = !isOn; }
};
```

Why obvious: the "guaranteed-valid starting state" mirrors a product leaving a factory. You can't get a half-assembled `Lamp` — the constructor enforces that `isOn` is always set before the object is used.

**Project Application (The "Why" here):**
`Enemy::makeGoblin()` is a static factory method that calls the `Enemy` constructor with randomized stats. Before this lab, enemy creation required a multi-line block setting each field manually — and forgetting `goblin.hp = goblin.maxHP` meant the goblin started at 0 HP. The constructor guarantees `hp` is always initialized to `maxHP` at creation.

**Smallest possible example:**
```cpp
class Enemy {
    std::string name;
    int hp, maxHP;
public:
    Enemy(const std::string& n, int mHP)
        : name(n), hp(mHP), maxHP(mHP) {}  // hp always equals maxHP at start
    bool isAlive() const { return hp > 0; }
};

Enemy goblin("Goblin", 8);
// goblin.hp is guaranteed to be 8 — no manual setup needed
```

**Why it matters here:** Enemy creation becomes a one-liner with guaranteed
valid state, replacing the verbose factory functions.

---

## Concept: Inheritance

**What it is:** A mechanism where one class (`Enemy`, `Character`) automatically receives all the members and methods of another class (`Entity`). The derived class IS a specialized version of the base class.

**The problem before:**
```cpp
// Without inheritance — duplicated fields and logic in every type:
struct Character { std::string name; int hp; int maxHP; void takeDamage(int d) { hp -= d; if (hp < 0) hp = 0; } };
struct Enemy     { std::string name; int hp; int maxHP; void takeDamage(int d) { hp -= d; if (hp < 0) hp = 0; } };
// Adding a "status" field means editing BOTH structs
```

**The solution:**
```cpp
class Entity {
protected:
    std::string name;
    int hp, maxHP;
public:
    void takeDamage(int d) { hp -= d; if (hp < 0) hp = 0; }
};

class Character : public Entity { /* player-specific fields and methods */ };
class Enemy     : public Entity { /* enemy-specific fields and methods  */ };
```

**What it hides:** Hides code duplication between similar types. Without inheritance, `Warrior`, `Mage`, and `Rogue` would each repeat the `hp`, `takeDamage()`, `isAlive()` logic. Invariant: the base class (`Entity`) can evolve — adding a `status` field propagates to ALL subclasses automatically.

**Canonical example (General Explanation):**
Animal taxonomy — a `Dog` IS an `Animal`. A `Dog` has everything an `Animal` has (eats, breathes) plus dog-specific behavior (fetches, barks). `class Dog : public Animal` means Dog inherits all of Animal's public interface.

```cpp
class Animal {
public:
    void breathe() { std::cout << "breathing\n"; }
};
class Dog : public Animal {
public:
    void bark() { std::cout << "Woof!\n"; }
};
Dog d;
d.breathe();  // inherited from Animal
d.bark();     // Dog-specific
```

**Project Application (The "Why" here):**
`Enemy` inherits from `Entity` in this lab. `isAlive()`, `takeDamage()`, `heal()`, `getHP()`, and `getName()` are all implemented once in `entity.cpp`. Adding a new enemy type (`Dragon`, `Vampire`) means writing a new class that inherits from `Entity` — the HP system, clamping, and getters come along for free.

---

## Concept: `virtual` Functions and Polymorphism

**What it is:** A `virtual` function is one that CAN be overridden by a
derived class. When called through a base-class pointer, C++ uses the
ACTUAL object's version (dynamic dispatch).

**The problem before:**
```cpp
// Without virtual — base version always called:
Entity* ptr = new Goblin();
ptr->getName();  // calls Entity::getName(), not Goblin::getName() — WRONG
```

**The solution:**
```cpp
class Entity {
public:
    virtual std::string getName() const = 0;  // pure virtual — must be overridden
    virtual int rollAttack() const = 0;
    virtual void takeDamage(int amount);       // has a default implementation
};

class Goblin : public Entity {
public:
    std::string getName()   const override { return "Goblin Scout"; }
    int         rollAttack() const override { return roll(D6); }
};

Entity* enemy = new Goblin();
enemy->getName();     // calls Goblin::getName() — correct!
enemy->rollAttack();  // calls Goblin::rollAttack()
```

**What it hides:** Hides type-checking. Without `virtual`, you'd write `if (type == WARRIOR) warriorAttack(); else if (type == MAGE) mageAttack();`. With `virtual`, `character->attack()` dispatches automatically. Invariant: once a function is declared `virtual` in the base class, every derived class that overrides it participates in virtual dispatch — the base class doesn't need to know about its subclasses.

**Canonical example (General Explanation):**
A shape factory — you have a list of `Shape*` objects, and calling `shape->draw()` on each one draws the right thing (circle for circles, square for squares) even though the pointers are all `Shape*`. The actual function called is determined by the object's real type, not the pointer type.

```cpp
class Shape {
public:
    virtual void draw() { std::cout << "Shape\n"; }
};
class Circle : public Shape {
public:
    void draw() override { std::cout << "Circle\n"; }
};
Shape* s = new Circle();
s->draw();  // prints "Circle" — virtual dispatch
```

Why obvious: the pointer type is `Shape*` but `draw()` does the right thing for the actual object. Without `virtual`, all shapes would print "Shape" — the wrong behavior.

**Project Application (The "Why" here):**
`runBattle` accepts `Entity& enemy`. Inside the battle loop, `enemy.rollAttack()` calls the correct attack roll — `Goblin::rollAttack()` for goblins, `Dragon::rollAttack()` for dragons — with no `if/else` branching in the battle code. Adding a `Vampire` class with unique attack logic only requires a new class, not a change to `runBattle`.

**Smallest possible example:**
```cpp
class Entity {
public:
    virtual int rollAttack() const { return 1; }  // default
    virtual ~Entity() {}
};
class Goblin : public Entity {
public:
    int rollAttack() const override { return rand() % 6 + 1; }  // 1d6
};

Entity* e = new Goblin();
std::cout << e->rollAttack();  // calls Goblin's version — 1d6, not the default 1
delete e;
```

**Why it matters here:** The battle system can accept `Entity&` and work
with both `Character` and `Enemy` without knowing which one it has. Adding a
new enemy type (Vampire, Dragon) only requires a new class — the battle
system needs no changes.

---

## Step 1 — `entity.h` and `entity.cpp`

Create `entity.h`:

```cpp
// entity.h — Base class for anything with HP that can fight
#ifndef ENTITY_H
#define ENTITY_H

#include <string>

class Entity {
protected:
    std::string name;
    int         hp;
    int         maxHP;
    int         def;      // defense (armor class modifier)

public:
    Entity();
    Entity(const std::string& name, int maxHP, int def);

    // Getters (const — do not modify the object)
    std::string getName()  const;
    int         getHP()    const;
    int         getMaxHP() const;
    int         getDEF()   const;
    bool        isAlive()  const;

    // Modification (apply clamping and side effects)
    void takeDamage(int amount);
    void heal(int amount);

    // Pure virtual — every derived class must implement these
    virtual int         rollAttack()   const = 0;  // how much damage this entity deals
    virtual std::string getArtFrame(int frameIndex) const = 0;  // ASCII art row (Lab 14 preview)

    // Virtual destructor — required for safe polymorphic deletion
    virtual ~Entity() {}
};

#endif // ENTITY_H
```

Create `entity.cpp`:

```cpp
// entity.cpp — Entity base class implementation
#include "entity.h"
#include <algorithm>  // for std::max, std::min

Entity::Entity() : name("Unknown"), hp(1), maxHP(1), def(0) {}

Entity::Entity(const std::string& n, int mHP, int d)
    : name(n), hp(mHP), maxHP(mHP), def(d) {}

std::string Entity::getName()  const { return name; }
int         Entity::getHP()    const { return hp; }
int         Entity::getMaxHP() const { return maxHP; }
int         Entity::getDEF()   const { return def; }
bool        Entity::isAlive()  const { return hp > 0; }

void Entity::takeDamage(int amount) {
    hp -= amount;
    if (hp < 0) hp = 0;  // clamp — HP never goes below zero
}

void Entity::heal(int amount) {
    hp += amount;
    if (hp > maxHP) hp = maxHP;  // clamp — HP never exceeds max
}
```

---

## Step 2 — `enemy.h` and `enemy.cpp`

Create `enemy.h`:

```cpp
// enemy.h — Enemy class, inherits from Entity
#ifndef ENEMY_H
#define ENEMY_H

#include "entity.h"
#include <string>
#include <vector>

// ── Enemy type enum ────────────────────────────────────────────
enum class EnemyType { Goblin, Orc, Skeleton, Vampire, Dragon };

class Enemy : public Entity {
private:
    int        atk;
    int        xpReward;
    int        goldReward;
    EnemyType  type;

public:
    Enemy(const std::string& name, int maxHP, int atk, int def,
          int xpReward, int goldReward, EnemyType type);

    int       getATK()       const;
    int       getXPReward()  const;
    int       getGoldReward() const;
    EnemyType getType()      const;

    // Override pure virtuals from Entity
    int         rollAttack()              const override;
    std::string getArtFrame(int frameIndex) const override;

    // Static factory methods (replace the global factory functions)
    static Enemy makeGoblin();
    static Enemy makeOrc();
    static Enemy makeSkeleton();
    static Enemy makeDragon();
};

#endif // ENEMY_H
```

Create `enemy.cpp` (abbreviated — full version in the completed project):

```cpp
// enemy.cpp
#include "enemy.h"
#include <cstdlib>  // rand

Enemy::Enemy(const std::string& n, int mHP, int a, int d,
             int xp, int gold, EnemyType t)
    : Entity(n, mHP, d), atk(a), xpReward(xp), goldReward(gold), type(t) {}

int       Enemy::getATK()        const { return atk; }
int       Enemy::getXPReward()   const { return xpReward; }
int       Enemy::getGoldReward() const { return goldReward; }
EnemyType Enemy::getType()       const { return type; }

int Enemy::rollAttack() const {
    // 1d6 + atk modifier
    return (rand() % 6) + 1 + (atk / 4);
}

std::string Enemy::getArtFrame(int frameIndex) const {
    // Returns art row placeholder — full implementation uses art arrays
    return (frameIndex == 0) ? "  (°‿°)" :
           (frameIndex == 1) ? "  (>‿<)" : "  (*‿*)";
}

Enemy Enemy::makeGoblin() {
    int hp  = (rand() % 11) + 4;   // 2d6+2
    int atk = (rand() %  6) + 1;   // 1d6
    return Enemy("Goblin Scout", hp, atk, 2, 25, rand() % 4 + 1, EnemyType::Goblin);
}

Enemy Enemy::makeOrc() {
    int hp  = (rand() % 13) + 6;   // 2d8+4 approx
    int atk = (rand() %  8) + 1;   // 1d8
    return Enemy("Orc Warrior", hp, atk, 4, 50, rand() % 8 + 2, EnemyType::Orc);
}

Enemy Enemy::makeSkeleton() {
    int hp  = (rand() % 10) + 2;   // 2d6
    int atk = (rand() %  6) + 3;   // 1d6+2
    return Enemy("Skeleton", hp, atk, 1, 30, 0, EnemyType::Skeleton);
}

Enemy Enemy::makeDragon() {
    int hp  = (rand() % 27) + 23;  // 3d10+20 approx
    int atk = (rand() % 14) + 7;   // 2d8+5 approx
    return Enemy("Ancient Dragon", hp, atk, 8, 500, rand() % 136 + 15, EnemyType::Dragon);
}
```

---

## Step 3 — Compile With Multiple Files

```bash
g++ -std=c++17 -o dungeon main.cpp entity.cpp enemy.cpp
```

### SAVE AND TRY

The game plays identically. The refactoring is internal.

**Verify:** Run `./dungeon`. Character creation, battles, everything works as
before. The change is code organization, not behavior.

**In the terminal:**
```bash
g++ -std=c++17 -o dungeon main.cpp entity.cpp enemy.cpp && echo "OOP build OK"
```

---

## Step 4 — Use Polymorphism in the Battle

Update `runBattle` signature to accept `Entity&` instead of `Enemy&`:

```cpp
BattleResult runBattle(Character& hero, Entity& enemy);
```

Inside the battle, use `enemy.isAlive()`, `enemy.takeDamage(damage)`,
`enemy.getName()`, `enemy.rollAttack()` — all virtual/overridden from Entity.

This means you can pass any Entity subclass to `runBattle`. When you add
`Vampire` or `Dragon` in the challenges, the battle system needs no changes.

---

## Challenge: The Skeleton Class

**You know:** Inheritance, override, constructors.

**Task:** Create a `Skeleton` class that inherits from `Enemy` and overrides
`rollAttack()` to be weaker (1d4 + 1) but adds special behavior:
- Skeletons are immune to pierce/slash damage (DEF is effectively doubled
  against physical attacks — add a `isUndeadImmune()` method that returns `true`)
- `getArtFrame(0)` returns a different idle pose than the default

---

<details>
<summary>▶ Show Solution</summary>

```cpp
// skeleton.h
#ifndef SKELETON_H
#define SKELETON_H
#include "enemy.h"

class Skeleton : public Enemy {
public:
    Skeleton()
        : Enemy("Skeleton Warrior",
                (rand() % 10) + 2,   // 2d6 HP
                (rand() %  4) + 1,   // 1d4 base atk
                3,                   // DEF 3
                35, 0, EnemyType::Skeleton) {}

    int rollAttack() const override {
        return (rand() % 4) + 1 + 1;  // 1d4+1
    }

    bool isUndeadImmune() const { return true; }

    std::string getArtFrame(int frameIndex) const override {
        if (frameIndex == 0) return "  .___.  ";
        if (frameIndex == 1) return "  .>_<.  ";
        return "  .X_X.  ";
    }
};
#endif
```

**Key insight:** Overriding `rollAttack()` without touching `runBattle` is
polymorphism in action. The battle system calls `enemy.rollAttack()`. If the
enemy is a `Skeleton`, the skeleton's version runs. If it is an `Orc`, the
orc's version runs. The battle code did not change — only the enemy class
knows its own attack behavior. This is the Open/Closed Principle: open for
extension (new enemy types), closed for modification (battle system unchanged).

</details>

---

## Final Check

| Feature | How to verify |
|---------|--------------|
| `entity.h` compiles as a header | Include it in main.cpp, compile |
| `Enemy` inherits from `Entity` | `Enemy::isAlive()` calls `Entity::isAlive()` |
| `takeDamage` clamps HP to 0 | Call `takeDamage(9999)` — HP = 0, not negative |
| `Enemy::makeGoblin()` creates a valid enemy | `Enemy::makeGoblin().getName()` returns `"Goblin Scout"` |
| Battle works with refactored code | Full battle resolves correctly |
| Multiple file compile works | `g++ entity.cpp enemy.cpp main.cpp` succeeds |
| Polymorphism: `Entity*` calls derived method | `Entity* e = new Goblin(); e->rollAttack()` calls Goblin version |

---

## Quick Check Answers

**1. What is the difference between `struct` and `class` in C++?**
The ONLY difference is the default access specifier: `struct` members are
`public` by default; `class` members are `private` by default. Everything
else — inheritance, constructors, virtual functions, templates — works
identically. By convention, `struct` is used for simple data containers
(like the `Position` struct) and `class` is used when behavior (methods)
and encapsulation are important.

**2. What does the `virtual` keyword do to a function?**
`virtual` marks a function for dynamic dispatch: when called through a pointer
or reference to the BASE class, C++ looks up the ACTUAL object's type at
runtime and calls that type's version. Without `virtual`, the function called
is determined at COMPILE TIME based on the pointer/reference type, not the
actual object type. A pure virtual (`= 0`) means the base class has no
implementation — any derived class MUST override it, or the derived class
itself becomes abstract (cannot be instantiated).

**3. `Entity*` pointer to a `Goblin` — `getName()` is virtual or not?**
If `virtual`: calling `ptr->getName()` runs `Goblin::getName()` — the
derived class version. C++ checks the vtable (virtual function table) at
runtime to find the correct function. If NOT virtual: calling `ptr->getName()`
runs `Entity::getName()` — always, regardless of the actual object type.
This is the fundamental difference between polymorphism (virtual) and simple
function hiding (non-virtual). The non-virtual version is a common source
of bugs when you expect polymorphic behavior but forget the `virtual` keyword.
