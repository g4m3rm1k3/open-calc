# C++ Terminal RPG — LAB 09 — Vectors & the Inventory

**Prerequisites:** LAB 08. You have ANSI colors, the character sheet, and the
game loop. You understand structs.

**What this lab adds:**
- `std::vector` — dynamic arrays for storing collections
- An `Item` struct with types, values, and effects
- A full inventory: add items, drop items, use items, display inventory

**Time:** 60–75 minutes

---

## What You Will Build

The `[I]nventory` command now shows a fully functional item management screen:

```
  ┌──────────────────────────────────────────┐
  │   INVENTORY  (3/10 slots used)           │
  ├──────────────────────────────────────────┤
  │  [0] ⚔  Longsword      — Weapon (1d8)   │
  │  [1] 🛡  Leather Armor  — Armor  (+2 DEF)│
  │  [2] 🧪  Health Potion  — Usable (+10 HP)│
  └──────────────────────────────────────────┘

  Commands: [U]se  [D]rop  [B]ack
  > u 2

  You drink the Health Potion. +10 HP restored.
  HP: 16/16
```

---

> **Quick Check — try to answer before reading:**
> 1. What is a `std::vector` and why is it better than a plain C++ array
>    for an inventory?
> 2. What is the difference between `vector.size()` and `vector.capacity()`?
> 3. Prediction: if you have `vector<Item> inv` with 3 items (indices 0,1,2)
>    and call `inv.erase(inv.begin() + 1)`, what happens to the item that
>    was at index 2?
> *(Answers at the end of this lab)*

---

## Concept: `std::vector` — Dynamic Arrays

**What it is:** A sequence container that grows or shrinks automatically.
Think of it as an array where you never need to specify the size upfront.

**The problem before:**
```cpp
// C-style array — must pick a max size:
Item inventory[10];   // exactly 10 slots, always
int  itemCount = 0;   // must track size manually
// Adding beyond 10 items = buffer overflow = crash
```

**The solution:**
```cpp
#include <vector>
std::vector<Item> inventory;  // empty, zero size
inventory.push_back(sword);   // adds to the end — grows automatically
inventory.push_back(potion);
std::cout << inventory.size() << std::endl;  // prints 2
```

**What it hides:** Hides dynamic memory allocation. Without `vector`, adding
items to an array requires `malloc`/`realloc`/`free` and pointer arithmetic.
Invariant: elements are always contiguous in memory and indexed 0 to
`size()-1`. `vector` automatically manages the underlying array when it needs
to grow — typically doubling its capacity — so you never manually resize.

**Canonical example (General Explanation):**
A shopping cart — you add items (`push_back`), remove them (`erase`), check
how many are in it (`size()`), and access any item by position (`[index]`).
Unlike a fixed-size array, you don't declare how many items you'll have in
advance.
```cpp
std::vector<std::string> cart;
cart.push_back("Sword");
cart.push_back("Potion");
std::cout << cart[0] << std::endl;  // "Sword"
std::cout << cart.size() << std::endl;  // 2
```
Why this example makes the mechanic obvious: the "add and remove freely"
mechanic mirrors a real-world list. Everyone understands that a shopping cart
has no fixed maximum — you just keep adding items until you're done.

**Project Application (The "Why" here):**
The player's inventory is a `vector<Item>`. Picking up a sword:
`inventory.push_back(sword)`. Dropping it:
`inventory.erase(inventory.begin() + index)`. Checking count:
`inventory.size()`. The vector grows and shrinks as the player picks up and
drops items — no fixed limit, no manual size tracking, no wasted slots.

**Smallest possible example:**
```cpp
#include <vector>
#include <iostream>

std::vector<int> numbers;
numbers.push_back(10);
numbers.push_back(20);
numbers.push_back(30);

std::cout << numbers.size() << std::endl;  // 3
std::cout << numbers[0]     << std::endl;  // 10  (zero-indexed)
std::cout << numbers[2]     << std::endl;  // 30

numbers.erase(numbers.begin() + 1);        // remove index 1 (value 20)
std::cout << numbers.size() << std::endl;  // 2 (was 3)
std::cout << numbers[1]     << std::endl;  // 30 (shifted down from index 2)
```

**Why it matters here:** The inventory has a variable number of items. The
player finds items, drops items, uses items. A fixed-size array cannot
accommodate this without complex manual bookkeeping. `vector` handles it.

**Watch for:** Accessing `vector[index]` does NOT check bounds. `inventory[99]`
on a 3-item vector is undefined behavior (likely a crash). Use `inventory.at(99)`
(throws an exception) or always check `index < inventory.size()` first.

---

## Concept: Range-Based `for` Loop — Iterating Collections

**What it is:** A `for` loop syntax specifically for iterating over all
elements of a container without managing indices.

**The problem before:**
```cpp
// Index-based loop — works but verbose:
for (int index = 0; index < inventory.size(); index++) {
    std::cout << inventory[index].name << std::endl;
}
```

**The solution:**
```cpp
// Range-based for — cleaner:
for (const Item& item : inventory) {     // read-only
    std::cout << item.name << std::endl;
}

// Or to modify items:
for (Item& item : inventory) {          // by reference
    item.quantity--;
}
```

**Canonical example (General Explanation):**
Reading every entry on a list top-to-bottom. `for (const auto& item : inventory)`
means "for each item in inventory, in order." *(auto: the compiler deduces
the type automatically — `auto item = inventory[0]` has the same type as
`inventory`'s element type, without you writing it out.)*
```cpp
std::vector<std::string> names = {"Alice", "Bob", "Carol"};
for (const auto& name : names) {
    std::cout << "Hello, " << name << "!" << std::endl;
}
```
Why obvious: mirrors "go through each item on the list" — you don't need to
know the index, just do something with each element in turn.

**Project Application (The "Why" here):**
Displaying the inventory, searching for an equipped item to un-equip it, and
applying effects to all items in the pack all use range-based `for`. When
`equipItem` needs to find any currently-equipped weapon before swapping, it
uses `for (Item& existing : hero.inventory)` — no index arithmetic needed.

**Smallest possible example:**
```cpp
std::vector<std::string> names = {"Alice", "Bob", "Carol"};
for (const std::string& name : names) {
    std::cout << "Hello, " << name << "!" << std::endl;
}
```

**Why it matters here:** Displaying the inventory, searching for items,
and applying effects to all items in the pack all use range-based `for`.

**Watch for:** Use `const Type&` when you only need to read — the `const`
communicates intent and prevents accidental modification. Use `Type&` when
you need to modify. Use `Type` (by value) only for small/trivial types
like `int` or `char`.

> **Note on removing while iterating:** You CANNOT safely call `erase` inside
> a range-based `for` loop — erasing an element invalidates the iterator the
> loop holds, causing undefined behavior. To remove items while iterating,
> either collect indices first and erase in reverse order (highest index first,
> so earlier indices aren't shifted by earlier erasures), or use the
> `erase`-`remove_if` idiom. In this lab all `erase` calls happen AFTER the
> loop finishes (e.g., `useItem` erases by index only when the user explicitly
> picks a slot, not mid-loop).

---

## Step 1 — The Item Struct

Add these definitions to `main.cpp` (after the `DamageType` enum):

```cpp
// ── Item type enum ────────────────────────────────────────────
enum class ItemType {
    Weapon,     // equippable — changes ATK
    Armor,      // equippable — changes DEF
    Usable,     // one-shot consumable (potions, scrolls)
    KeyItem,    // quest items, cannot be dropped
    Gold        // gold coins (used internally)
};

// ── Item struct ───────────────────────────────────────────────
struct Item {
    std::string name;
    ItemType    type;
    int         value;      // gold value for buying/selling
    int         effectPower; // +HP for potions, +ATK for weapons, etc.
    std::string description; // one-line lore/stat description
    int         quantity;    // for stackable items (potions, arrows)
    bool        equipped;    // true if currently equipped
};

// ── Add inventory to Character struct ─────────────────────────
// Open the Character struct and add:
//   std::vector<Item> inventory;
//   const int MAX_INVENTORY_SIZE = 10;  ← make this a global const
const int MAX_INVENTORY_SIZE = 10;
// Then in the Character struct: std::vector<Item> inventory;
```

Add `std::vector<Item> inventory;` to the `Character` struct.

Add `#include <vector>` to the includes at the top.

### SAVE AND TRY

```bash
g++ -std=c++17 -o dungeon main.cpp && echo "Item struct OK"
```

---

## Step 2 — Item Factory Functions

Add these item creator functions:

```cpp
// ── Item creators ─────────────────────────────────────────────
Item makeHealthPotion() {
    Item potion;
    potion.name        = "Health Potion";
    potion.type        = ItemType::Usable;
    potion.value       = 20;   // costs 20 gold to buy
    potion.effectPower = 20;   // restores 20 HP when used
    potion.description = "Restores 20 HP";
    potion.quantity    = 1;
    potion.equipped    = false;
    return potion;
}

Item makeManaPotion() {
    Item potion;
    potion.name        = "Mana Potion";
    potion.type        = ItemType::Usable;
    potion.value       = 25;
    potion.effectPower = 15;   // restores 15 MP
    potion.description = "Restores 15 MP";
    potion.quantity    = 1;
    potion.equipped    = false;
    return potion;
}

Item makeLongsword() {
    Item sword;
    sword.name        = "Longsword";
    sword.type        = ItemType::Weapon;
    sword.value       = 50;
    sword.effectPower = 4;    // +4 ATK when equipped
    sword.description = "A reliable steel blade (+4 ATK)";
    sword.quantity    = 1;
    sword.equipped    = false;
    return sword;
}

Item makeLeatherArmor() {
    Item armor;
    armor.name        = "Leather Armor";
    armor.type        = ItemType::Armor;
    armor.value       = 40;
    armor.effectPower = 2;    // +2 DEF when equipped
    armor.description = "Supple leather, light protection (+2 DEF)";
    armor.quantity    = 1;
    armor.equipped    = false;
    return armor;
}

Item makeScroll(const std::string& spellName, int damage) {
    Item scroll;
    scroll.name        = "Scroll of " + spellName;
    scroll.type        = ItemType::Usable;
    scroll.value       = 30;
    scroll.effectPower = damage;
    scroll.description = "Single-use spell: deals " + std::to_string(damage) + " damage";
    scroll.quantity    = 1;
    scroll.equipped    = false;
    return scroll;
}
```

Add `#include <string>` is already there. `std::to_string` converts an int
to a string (included in `<string>`).

---

## Step 3 — Inventory Functions

Add these:

```cpp
// ── Inventory helpers ─────────────────────────────────────────
std::string getItemTypeSymbol(ItemType type) {
    switch (type) {
        case ItemType::Weapon:  return "⚔";
        case ItemType::Armor:   return "🛡";
        case ItemType::Usable:  return "🧪";
        case ItemType::KeyItem: return "🔑";
        default:                return "?";
    }
}

// Tries to add an item to the inventory
// Returns true on success, false if inventory is full
bool addToInventory(Character& hero, const Item& item) {
    if (static_cast<int>(hero.inventory.size()) >= MAX_INVENTORY_SIZE) {  // ← MAX_INVENTORY_SIZE is 10 (global const above)
        std::cout << "  Inventory full! Cannot carry " << item.name << "." << std::endl;
        return false;
    }
    hero.inventory.push_back(item);
    std::cout << "  Picked up: " << item.name << std::endl;
    return true;
}

// Displays the full inventory
void displayInventory(const Character& hero) {
    std::cout << std::endl;
    std::cout << "  ┌──────────────────────────────────────────┐" << std::endl;
    std::cout << "  │   " << COLOR_YELLOW << "INVENTORY" << COLOR_RESET
              << "  (" << hero.inventory.size() << "/" << MAX_INVENTORY_SIZE
              << " slots used)           │" << std::endl;
    std::cout << "  ├──────────────────────────────────────────┤" << std::endl;

    if (hero.inventory.empty()) {
        std::cout << "  │   (empty)                                │" << std::endl;
    } else {
        for (int index = 0; index < static_cast<int>(hero.inventory.size()); index++) {
            const Item& item = hero.inventory[index];
            std::string equippedMark = item.equipped ? " [E]" : "    ";
            std::cout << "  │  [" << index << "] "
                      << getItemTypeSymbol(item.type) << "  "
                      << item.name
                      << equippedMark
                      << std::endl;
            std::cout << "  │       " << COLOR_DARK << item.description << COLOR_RESET << std::endl;
        }
    }

    std::cout << "  └──────────────────────────────────────────┘" << std::endl;
    std::cout << "  Commands: [U]se #  [D]rop #  [B]ack" << std::endl;
}

// Uses a consumable item at the given index
void useItem(Character& hero, int index) {
    if (index < 0 || index >= static_cast<int>(hero.inventory.size())) {
        std::cout << "  Invalid slot." << std::endl;
        return;
    }

    Item& item = hero.inventory[index];

    switch (item.type) {
        case ItemType::Usable: {
            // Check if it's a healing item (description contains "HP")
            if (item.description.find("HP") != std::string::npos) {
                int healed = item.effectPower;
                hero.hp   += healed;
                if (hero.hp > hero.maxHP) hero.hp = hero.maxHP;
                std::cout << "  You use " << item.name << ". +" << healed << " HP." << std::endl;
            } else if (item.description.find("MP") != std::string::npos) {
                int restored = item.effectPower;
                hero.mp    += restored;
                if (hero.mp > hero.maxMP) hero.mp = hero.maxMP;
                std::cout << "  You use " << item.name << ". +" << restored << " MP." << std::endl;
            } else {
                // Scroll — deal damage to an enemy (handled properly in Lab 12)
                std::cout << "  You read " << item.name << ". Energy crackles." << std::endl;
                std::cout << "  (Scrolls deal " << item.effectPower << " damage in battle.)" << std::endl;
            }
            // Remove from inventory after use (consumables are one-shot)
            hero.inventory.erase(hero.inventory.begin() + index);
            break;
        }
        case ItemType::Weapon:
        case ItemType::Armor:
            std::cout << "  Use [E]quip from this menu to equip gear. (Lab 09 challenge)" << std::endl;
            break;
        default:
            std::cout << "  That item cannot be used here." << std::endl;
    }
}

// Drops an item from the inventory
void dropItem(Character& hero, int index) {
    if (index < 0 || index >= static_cast<int>(hero.inventory.size())) {
        std::cout << "  Invalid slot." << std::endl;
        return;
    }
    std::cout << "  Dropped: " << hero.inventory[index].name << std::endl;
    hero.inventory.erase(hero.inventory.begin() + index);
}
```

---

## Step 4 — Wire Into the Game Loop

In `createCharacter()`, give the player starting items. Add these lines at
the end of `createCharacter()`, after the character stats are set:

```cpp
// Give starting items based on class
addToInventory(hero, makeHealthPotion());          // ← add this
addToInventory(hero, makeHealthPotion());          // ← add this

switch (hero.characterClass) {
    case CharacterClass::Warrior:
    case CharacterClass::Paladin:
        addToInventory(hero, makeLongsword());     // ← add this
        addToInventory(hero, makeLeatherArmor());  // ← add this
        break;
    case CharacterClass::Mage:
        addToInventory(hero, makeScroll("Fireball", 25));  // ← add this
        addToInventory(hero, makeManaPotion());             // ← add this
        break;
    case CharacterClass::Rogue:
    case CharacterClass::Ranger:
        addToInventory(hero, makeLeatherArmor());  // ← add this
        break;
    case CharacterClass::Cleric:
        addToInventory(hero, makeLeatherArmor());  // ← add this
        addToInventory(hero, makeManaPotion());    // ← add this
        break;
}
```

In the game loop, add the inventory command alongside the existing commands.
Find the `if/else if` chain that handles `'q'`, `'h'`, etc., and add:

```cpp
} else if (command == 'i' || command == 'I') {     // ← add this block
    displayInventory(hero);
    std::cout << "  > ";
    char invCmd;
    std::cin >> invCmd;
    if (invCmd == 'u' || invCmd == 'U') {
        std::cout << "  Use item #: ";
        int slot;
        std::cin >> slot;
        useItem(hero, slot);
    } else if (invCmd == 'd' || invCmd == 'D') {
        std::cout << "  Drop item #: ";
        int slot;
        std::cin >> slot;
        dropItem(hero, slot);
    }
    // 'b' or anything else returns to main loop
```

### SAVE AND TRY

Compile and run. Create a Mage character. Type `i`.

**You should see:** Inventory with Health Potions, a Fireball scroll, and
Mana Potion. Type `u 0` to use the first health potion.

**You should see:** HP restored message, item removed from inventory.

**Change something:** Add 10 health potions at the start. The 11th should
trigger `"Inventory full!"`. Remove the extras.

---

## Challenge: The Equip System

**You know:** `vector`, item types, struct modification.

**Task:** Write `void equipItem(Character& hero, int index)` that:
1. Only accepts `ItemType::Weapon` or `ItemType::Armor`
2. Un-equips any previously equipped item of the same type
3. Marks the item as `equipped = true`
4. Applies the `effectPower` to `hero.atk` (weapons) or `hero.def` (armor)
5. Prints `"Equipped: ItemName (+X ATK/DEF)"`

---

<details>
<summary>▶ Show Solution</summary>

```cpp
void equipItem(Character& hero, int index) {
    if (index < 0 || index >= static_cast<int>(hero.inventory.size())) {
        std::cout << "  Invalid slot." << std::endl;
        return;
    }

    Item& newItem = hero.inventory[index];

    if (newItem.type != ItemType::Weapon && newItem.type != ItemType::Armor) {
        std::cout << "  That item cannot be equipped." << std::endl;
        return;
    }

    // Un-equip any existing item of the same type
    for (Item& existingItem : hero.inventory) {
        if (existingItem.equipped && existingItem.type == newItem.type && &existingItem != &newItem) {
            existingItem.equipped = false;
            // Remove the old bonus
            if (existingItem.type == ItemType::Weapon) hero.atk -= existingItem.effectPower;
            if (existingItem.type == ItemType::Armor)  hero.def -= existingItem.effectPower;
            std::cout << "  Unequipped: " << existingItem.name << std::endl;
        }
    }

    // Equip the new item
    newItem.equipped = true;
    if (newItem.type == ItemType::Weapon) {
        hero.atk += newItem.effectPower;
        std::cout << "  Equipped: " << newItem.name << " (+" << newItem.effectPower << " ATK)" << std::endl;
    } else {
        hero.def += newItem.effectPower;
        std::cout << "  Equipped: " << newItem.name << " (+" << newItem.effectPower << " DEF)" << std::endl;
    }
}
```

**Key insight:** The range-based `for` with `Item& existingItem` iterates by
reference — modifications to `existingItem` change the actual inventory entry.
The `&existingItem != &newItem` check compares ADDRESSES (not values) to skip
the item we are currently equipping. Comparing addresses is how you check "is
this the same object in memory" vs "do these objects have the same values."

</details>

---

## Final Check

| Feature | How to verify |
|---------|--------------|
| `vector<Item>` compiles | `g++ -std=c++17 -o dungeon main.cpp` |
| Inventory starts with class-appropriate items | Play Mage — see scroll in inventory |
| `displayInventory` shows all items with indices | Type `i` — see formatted list |
| `useItem(hero, 0)` removes the item | Use potion — item disappears from list |
| `addToInventory` rejects when full | Add 11+ items — see "Inventory full!" |
| `dropItem` removes by index and shifts others | Drop item 0 — item 1 becomes item 0 |
| `inventory.size()` updates correctly | Count items after add/remove |

---

## Quick Check Answers

**1. What is `std::vector` and why is it better than a C-style array for inventory?**
`std::vector` is a dynamic array that manages its own memory. Unlike `Item[10]`
(fixed size), a vector grows automatically when you `push_back`. It tracks its
own size via `.size()`. When items are erased, it compacts the remaining elements.
A fixed array requires manual size tracking, manual compaction on deletion, and
pre-committing to a maximum size. If you underestimate the max, you overflow.
If you overestimate, you waste memory. Vector eliminates all of this.

**2. What is the difference between `vector.size()` and `vector.capacity()`?**
`size()` is how many elements are currently stored (logical size).
`capacity()` is how many elements the vector can hold before it needs to
allocate more memory (physical size). A vector with 3 items might have
capacity for 8 — it pre-allocated extra space to avoid frequent re-allocation.
When size reaches capacity and you `push_back`, the vector allocates ~2× the
current capacity. You almost never need to use `capacity()` directly — the
vector manages it for you.

**3. `inv.erase(inv.begin() + 1)` with 3 items — what happens to item at index 2?**
It shifts down to index 1. `erase` removes the element at the given position
and shifts all subsequent elements one position to the left. After erasing
index 1, the vector has 2 items: the original index 0 at position 0, and
the original index 2 now at position 1. This is why dropping an item
invalidates any index you stored before the operation — always re-display
or re-confirm indices after a drop/use operation.
