# Lesson 12: Hash Table

**What you will build:** You will build a custom hash table from scratch that stores key-value pairs. By implementing the internal bucket array, collision resolution, and automatic resizing, you will solve the transferable problem of achieving near-instant (O(1)) data lookups regardless of how large a dataset grows.

**What you need to know first:** C++ From Scratch series, DSA Lesson 01 (Big-O Notation), DSA Lesson 02 (Arrays).

**Terms used in this lesson:**
- **Hash function** — A mathematical algorithm that maps data of arbitrary size (like a text string) to a fixed-size integer. *Why it exists:* To compute a direct array index for a given key, bypassing the need to search through elements sequentially.
- **Collision** — An event where a hash function assigns the exact same integer index to two completely different keys. *Why it exists:* Because the range of possible keys (like all possible words) is infinitely larger than the fixed number of buckets in memory, forcing overlap (the Pigeonhole Principle).
- **Separate chaining** — A collision resolution strategy where each bucket in the array holds a list of items rather than a single item. *Why it exists:* To ensure that when two distinct keys hash to the same bucket, both can be saved without one overwriting the other.
- **Load factor** — The ratio of stored elements to total available buckets in a hash table (`elements / buckets`). *Why it exists:* To serve as a metric for when the table is getting too crowded and needs to be expanded to maintain fast lookups.
- **Rehashing** — The process of allocating a larger array and re-calculating the bucket index for every existing element. *Why it exists:* Because as the array grows, the modulo math used to assign indices changes; old elements must be moved to their new, correct buckets to be found again.

**Objects and methods used:**
- **`std::unordered_map<Key, T>` / `load_factor`**
  - *What it is:* The C++ standard library's hash table implementation.
  - *Implementation:* `float load_factor() const;`
  - *Its use:* Returns the current ratio of elements to buckets, revealing how crowded the internal structure is.
- **`std::unordered_map<Key, T>` / `max_load_factor`**
  - *What it is:* A configuration method for the hash table's resizing policy.
  - *Implementation:* `void max_load_factor(float z);`
  - *Its use:* Sets the strict limit for the load factor; if an insertion pushes the map above this ratio, the map automatically rehashes.
- **`std::unordered_map<Key, T>` / `bucket_count`**
  - *What it is:* A method to query the internal array size.
  - *Implementation:* `std::size_t bucket_count() const;`
  - *Its use:* Returns exactly how many separate slots the map has currently allocated.

**Everything else in the file, not this lesson's subject but still explained:**
- **`std::vector<T>` / `push_back`**
  - *What it is:* A dynamic array that can grow in size.
  - *Implementation:* `void push_back(const T& value);`
  - *Its use:* Appends an item to the end of the array, automatically allocating more memory if needed. Used here to build both the bucket array and the chains themselves.
- **`std::pair<T1, T2>`**
  - *What it is:* A simple struct that bundles two values of potentially different types together.
  - *Implementation:* `template<class T1, class T2> struct pair;`
  - *Its use:* Stores the key and the value together in the same chain link.

---

## Concept Unit: Hash Functions

### The Problem
Looking up a value in a standard array or vector takes O(N) time if we have to check every element sequentially. We want O(1) instant lookup, which is only possible if we know the exact array index where the data lives. But our keys are strings (like `"Alice"`), not integers. We need a mechanism to reliably convert a string into a valid array index.

### Introduce the concept in isolation
```cpp
#include <iostream>
#include <string>

int convertToNumber(const std::string& key) {
    int sum = 0;
    for (char c : key) {
        sum = sum + c;
    }
    return sum % 10;
}

int main() {
    std::cout << "Index for 'dog': " << convertToNumber("dog") << "\n";
    std::cout << "Index for 'cat': " << convertToNumber("cat") << "\n";
    return 0;
}
```

**Run it. Show the real output.**
```text
Index for 'dog': 4
Index for 'cat': 2
```
This output proves we can turn arbitrary text into a fixed integer between 0 and 9 reliably. This is called a **hash function**.

### Discard the throwaway example
This simple standalone program is deleted and will not appear in the project again.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition because we are building the fundamental mechanics before using the standard library.
- **Files affected:** Create `hash_table.cpp`.
- **Change type:** Add.
- **Location:** The entire file.

### The New Code
```cpp
#include <string>

class HashTable {
private:
    int hash(const std::string& key, int numBuckets) {
        int sum = 0;
        for (char c : key) {
            sum += c;
        }
        return sum % numBuckets;
    }
};
```

### The Updated Project
```cpp
#include <string>

class HashTable { // ← new
private:          // ← new
    int hash(const std::string& key, int numBuckets) { // ← new
        int sum = 0; // ← new
        for (char c : key) { // ← new
            sum += c; // ← new
        } // ← new
        return sum % numBuckets; // ← new
    } // ← new
}; // ← new
```
We now have a class containing a private method that converts string keys into integer indices, ensuring the resulting index will always fit within `numBuckets`.

### Mechanical Walkthrough
- `class HashTable`: Declares a new blueprint for our custom data structure. A class encapsulates data and the logic that operates on it.
- `private:`: An access modifier. It strictly hides the `hash` method from the outside world; code using `HashTable` will never call `hash()` directly, because indexing is an internal implementation detail.
- `int hash(const std::string& key, int numBuckets)`: A method that takes a read-only reference to a string (`key`) and the total number of available slots (`numBuckets`), returning an integer.
- `int sum = 0;`: Declares a local integer variable initialized to zero, which will act as an accumulator.
- `for (char c : key)`: A range-based loop. It automatically extracts each character from the string `key` one by one, placing it into the local variable `c` for the loop body.
- `sum += c;`: Adds the numeric ASCII value of the character `c` to `sum`. For example, `'A'` has an ASCII value of `65`.
- `return sum % numBuckets;`: The modulo operator `%` divides `sum` by `numBuckets` and returns only the remainder. Because the remainder of division by `N` is mathematically guaranteed to be between `0` and `N - 1`, this ensures the resulting index perfectly fits within our array bounds.

### CS Lens
A good hash function must possess two properties: **Determinism** (the same input must always produce the exact same output, otherwise you can never find your data again) and **Uniformity** (it should spread inputs evenly across all available buckets to avoid crowding). The simple sum function above is deterministic, but its uniformity is poor.

### SE Lens
The alternative not chosen is a cryptographically secure hash function like SHA-256. The tradeoff here is speed versus security. Cryptographic hashes deliberately consume heavy CPU cycles to be mathematically irreversible and collision-resistant. A data structure hash function must be lightning-fast above all else, because it runs on every single insertion and lookup; reversibility does not matter for an array index.

---

## Concept Unit: Collisions and Separate Chaining

### The Problem
If our hash function only produces numbers from `0` to `9`, what happens when we insert eleven items? The Pigeonhole Principle dictates that at least two items must be assigned the same index. Even with fewer items, the Birthday Problem proves that random distributions cause overlaps astonishingly early. If two completely different keys hash to the same index, a standard array will overwrite the first item with the second. We need a way to store multiple items at the identical array index safely.

### Introduce the concept in isolation
```cpp
#include <iostream>
#include <string>

int simpleHash(const std::string& key) {
    int sum = 0;
    for (char c : key) sum += c;
    return sum % 10;
}

int main() {
    std::cout << "act: " << simpleHash("act") << "\n";
    std::cout << "cat: " << simpleHash("cat") << "\n";
    return 0;
}
```

**Run it. Show the real output.**
```text
act: 2
cat: 2
```
Because `"act"` and `"cat"` use the exact same letters, their ASCII sums are identical. This proves that distinct inputs will hit the exact same array slot. This is called a **collision**.

### Discard the throwaway example
This collision proof is deleted and will not appear in the project.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `hash_table.cpp`
- **Change type:** Add.
- **Location:** Inside `class HashTable`, adding the buckets array and the `insert` method.

### The New Code
```cpp
#include <vector>
#include <utility>

    std::vector<std::vector<std::pair<std::string, int>>> buckets;

    HashTable(int size) {
        buckets.resize(size);
    }

    void insert(const std::string& key, int value) {
        int index = hash(key, buckets.size());
        
        for (auto& pair : buckets[index]) {
            if (pair.first == key) {
                pair.second = value;
                return;
            }
        }
        buckets[index].push_back({key, value});
    }
```

### The Updated Project
```cpp
#include <string>
#include <vector>  // ← new
#include <utility> // ← new

class HashTable {
private:
    // ← new start
    std::vector<std::vector<std::pair<std::string, int>>> buckets;
    // ← new end

    int hash(const std::string& key, int numBuckets) {
        int sum = 0;
        for (char c : key) {
            sum += c;
        }
        return sum % numBuckets;
    }

public: // ← new
    // ← new start
    HashTable(int size) {
        buckets.resize(size);
    }

    void insert(const std::string& key, int value) {
        int index = hash(key, buckets.size());
        
        for (auto& pair : buckets[index]) {
            if (pair.first == key) {
                pair.second = value;
                return;
            }
        }
        buckets[index].push_back({key, value});
    }
    // ← new end
};
```
We have changed the table's internal memory from a flat array into an array of lists. If `"act"` and `"cat"` both hash to index `2`, bucket `2` will simply hold a list containing both pairs.

### Mechanical Walkthrough
- `#include <vector>` and `#include <utility>`: Brings in the standard library definitions for the dynamic array (`std::vector`) and the two-item struct (`std::pair`).
- `std::vector<std::vector<std::pair<std::string, int>>> buckets;`: Declares a vector where every element is *itself* a vector holding `std::pair`s. The outer vector represents the slots in the table. The inner vector represents the "chain" of items stored at a specific slot.
- `public:`: An access modifier. Methods below this are exposed and callable by code outside the class.
- `HashTable(int size)`: The constructor. It automatically runs when a new `HashTable` object is created, taking the desired initial size.
- `buckets.resize(size);`: Calls the `resize` method on the outer vector, allocating exactly `size` empty inner vectors so our modulo hash function will not go out of bounds.
- `void insert(const std::string& key, int value)`: A method that takes a key and a value to store in the table.
- `int index = hash(key, buckets.size());`: Calls our private hash function, dynamically passing the current size of the outer vector, and stores the resulting integer.
- `for (auto& pair : buckets[index])`: A range-based loop over the inner vector located at `buckets[index]`. It uses `auto&` to deduce the type as a reference to a `std::pair`. Taking it by reference means modifications to `pair` will alter the actual item inside the vector, not a copy.
- `if (pair.first == key)`: `pair.first` accesses the string key stored in the struct. This checks if the exact key already exists in this chain.
- `pair.second = value;`: `pair.second` accesses the integer value. If the key exists, this updates its associated value (e.g., replacing Alice's old score with a new score).
- `return;`: Immediately halts the `insert` method, because the update is complete.
- `buckets[index].push_back({key, value});`: If the loop finishes without finding the key, this constructs a new `std::pair` and appends it to the end of the inner vector at `buckets[index]`.

### CS Lens
This collision strategy is called **Separate Chaining**. Because buckets hold collections rather than single items, the table never strictly runs out of room. The actual data lives in the chains, and the array simply acts as a directory of starting points. 

### SE Lens
The alternative not chosen is **Open Addressing**. In open addressing, the table remains a single flat array with no inner vectors. If a collision occurs, the algorithm simply steps forward to the next empty adjacent slot (probing). The tradeoff: Open addressing avoids the memory overhead of inner vectors and pointers, making it exceptionally cache-friendly for the CPU. However, it requires complex deletion logic (using "tombstone" markers) and catastrophic failure occurs if the array fills completely. Separate chaining is far simpler to implement and degrades gracefully under heavy load.

---

## Concept Unit: Load Factor and Rehashing

### The Problem
If we create a table with `10` buckets and insert `1000` items, separate chaining guarantees all items are saved. But each bucket's inner vector will now hold roughly `100` items. Finding an item requires computing the hash (fast), and then sequentially scanning a list of 100 items (slow). Our O(1) performance has collapsed into O(N). We must measure how crowded the table is, and if it exceeds a threshold, allocate a larger array and redistribute everything.

### Introduce the concept in isolation
```cpp
#include <iostream>

void evaluateLoad(int elements, int buckets) {
    float loadFactor = (float)elements / buckets;
    std::cout << "Load factor: " << loadFactor << "\n";
    if (loadFactor > 0.75f) {
        std::cout << "Too crowded! Must expand.\n";
    }
}

int main() {
    evaluateLoad(8, 10);
    return 0;
}
```

**Run it. Show the real output.**
```text
Load factor: 0.8
Too crowded! Must expand.
```
By casting the integers to a `float`, we compute the **load factor** — the ratio of elements to buckets. A load factor of `0.8` means the table is 80% full.

### Discard the throwaway example
This isolated math is deleted and will not appear in the project.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `hash_table.cpp`
- **Change type:** Add.
- **Location:** Inside `class HashTable`, tracking total elements, adding the `rehash` method, and updating `insert` to trigger it.

### The New Code
```cpp
    int numElements = 0;

    void rehash() {
        std::vector<std::vector<std::pair<std::string, int>>> oldBuckets = buckets;
        buckets.clear();
        buckets.resize(oldBuckets.size() * 2);
        numElements = 0;
        
        for (const auto& chain : oldBuckets) {
            for (const auto& pair : chain) {
                insert(pair.first, pair.second);
            }
        }
    }
```

### The Updated Project
```cpp
#include <string>
#include <vector>
#include <utility>
#include <iostream> // ← new

class HashTable {
private:
    std::vector<std::vector<std::pair<std::string, int>>> buckets;
    int numElements = 0; // ← new

    int hash(const std::string& key, int numBuckets) {
        int sum = 0;
        for (char c : key) sum += c;
        return sum % numBuckets;
    }

    // ← new start
    void rehash() {
        std::vector<std::vector<std::pair<std::string, int>>> oldBuckets = buckets;
        buckets.clear();
        buckets.resize(oldBuckets.size() * 2);
        numElements = 0;
        
        for (const auto& chain : oldBuckets) {
            for (const auto& pair : chain) {
                insert(pair.first, pair.second);
            }
        }
    }
    // ← new end

public:
    HashTable(int size) {
        buckets.resize(size);
    }

    void insert(const std::string& key, int value) {
        // ← new start
        float loadFactor = (float)(numElements + 1) / buckets.size();
        if (loadFactor > 0.75f) {
            std::cout << "Rehashing...\n";
            rehash();
        }
        // ← new end
        
        int index = hash(key, buckets.size());
        for (auto& pair : buckets[index]) {
            if (pair.first == key) {
                pair.second = value;
                return;
            }
        }
        buckets[index].push_back({key, value});
        numElements++; // ← new
    }
};
```
Before inserting, we calculate the prospective load factor. If it exceeds 0.75, we trigger a rehash: doubling the array size and re-inserting every item, because a changed array size completely alters where the modulo arithmetic places each key.

### Mechanical Walkthrough
- `int numElements = 0;`: A private integer tracking the total number of items stored across all chains combined.
- `float loadFactor = (float)(numElements + 1) / buckets.size();`: Casts the sum to a `float` to force floating-point division. Without `(float)`, C++ would perform integer division, discarding the decimal and returning exactly `0` until the table is 100% full.
- `if (loadFactor > 0.75f)`: The `f` suffix denotes a float literal. If the ratio exceeds 75%, we call `rehash()`.
- `void rehash()`: A private method that handles the complex expansion logic.
- `std::vector<...> oldBuckets = buckets;`: Creates a full, deep copy of the entire existing bucket array, preserving all our currently stored data safely.
- `buckets.clear();`: Calls `clear` on the original vector, wiping out all inner chains and dropping its internal size to zero.
- `buckets.resize(oldBuckets.size() * 2);`: Re-allocates the vector to be exactly twice as large as it was before.
- `numElements = 0;`: Resets our global tracker to zero, because the subsequent re-insertions will artificially increment it back up to its true value.
- `for (const auto& chain : oldBuckets)`: A loop traversing the saved copy of the outer array. `chain` represents one inner vector.
- `for (const auto& pair : chain)`: A nested loop traversing the inner vector.
- `insert(pair.first, pair.second);`: Recursively calls our own `insert` method. Because `buckets.size()` has doubled, the `hash` function will compute entirely new indices, moving old items into new homes perfectly distributed across the larger space.
- `numElements++;`: At the very end of `insert`, increments our global tracker to account for the newly added item.

### CS Lens
This is **Amortized Constant Time**. A single `insert` is normally O(1). But when rehashing triggers, that specific `insert` suddenly costs O(N) as the entire structure rearranges itself. Because we double the array size, rehashing happens exponentially less often as the table grows. When averaged out across thousands of operations, the cost per insertion remains mathematically O(1).

### SE Lens
The 0.75 load factor threshold is an engineered tradeoff. A threshold of 0.9 saves maximum memory but allows chains to get dangerously long, slowing lookups. A threshold of 0.4 keeps chains virtually empty for instant lookups but aggressively wastes memory with allocated, unused vectors. The industry standard default for most languages is 0.75, balancing space and speed perfectly.

---

## Concept Unit: `std::unordered_map`

### The Problem
Writing a custom hash table, managing its inner vectors, manually tracking the element count, and computing load factors by hand is error-prone and tedious. For production software, you need a pre-built, heavily optimized container that implements hashing, chaining, and automatic rehashing invisibly.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** Create `stl_hash.cpp`.
- **Change type:** Add.
- **Location:** The entire file.

### The New Code
```cpp
#include <iostream>
#include <unordered_map>
#include <string>

int main() {
    std::unordered_map<std::string, int> dictionary;
    
    dictionary.max_load_factor(0.5f);
    
    dictionary["cherry"] = 3;
    dictionary["apple"] = 1;
    dictionary["banana"] = 2;
    
    std::cout << "Current load factor: " << dictionary.load_factor() << "\n";
    std::cout << "Total buckets allocated: " << dictionary.bucket_count() << "\n";
    std::cout << "Value for cherry: " << dictionary["cherry"] << "\n";
    
    return 0;
}
```

### The Updated Project
There is no surrounding structure; the new code above is the entirety of `stl_hash.cpp`. The C++ Standard Library provides `std::unordered_map`, which does exactly what our custom `HashTable` did under the hood.

### Mechanical Walkthrough
- `#include <unordered_map>`: Brings in the definition for the standard library's hash table.
- `std::unordered_map<std::string, int> dictionary;`: Instantiates the map. The first template type (`std::string`) is the Key, and the second (`int`) is the Value. It uses an internal hashing algorithm specifically optimized for strings.
- `dictionary.max_load_factor(0.5f);`: Calls a method configuring the map's internal threshold. Here we lower it to `0.5`, forcing the map to rehash and expand sooner than its default (which is usually 1.0 in standard C++ implementations) to strictly minimize collisions at the cost of more memory.
- `dictionary["cherry"] = 3;`: The `[]` operator searches the map for `"cherry"`. Because it does not exist, the map automatically computes the hash, allocates space in the correct bucket, and stores the value `3`.
- `dictionary.load_factor()`: Calls a method returning the current ratio of elements to buckets.
- `dictionary.bucket_count()`: Calls a method returning the raw number of array slots currently allocated internally.
- `dictionary["cherry"]`: Calls the `[]` operator again. This time it finds the key immediately via its hash and returns the stored integer.

### CS Lens
The C++ Standard Library explicitly dictates that `std::unordered_map` must provide average constant-time O(1) complexity for search, insertion, and removal. While implementations vary by compiler (GCC vs Clang vs MSVC), they universally use separate chaining to achieve this, just as we built.

### SE Lens
The alternative not chosen is `std::map`. The tradeoff here is hashing versus sorting. `std::map` does not use a hash function at all; it uses a binary search tree to keep all keys perfectly sorted alphabetically. You choose `std::unordered_map` when raw lookup speed is paramount; you choose `std::map` when you must iterate over the keys in sorted order, accepting O(log N) lookup times.

---

## Connect the Pieces

Trace an insertion through the `std::unordered_map`. When you write `dictionary["cherry"] = 3;`, the map feeds `"cherry"` into `std::hash<std::string>`, producing a massive, highly uniform integer. It modulo-divides this integer by `dictionary.bucket_count()` to find the exact array slot. It jumps instantly to that slot. If the slot is empty, it stores it. If a collision occurred, it uses separate chaining to append it to the list. Finally, it recalculates `dictionary.load_factor()`. If that decimal exceeds `dictionary.max_load_factor()`, it allocates a new array twice as large and recalculates the modulo math for every single item, maintaining O(1) performance forever.

## What Breaks Without This

If you disable rehashing by setting an impossibly high load factor, performance will collapse.

Modify `stl_hash.cpp` to insert thousands of items into a constrained bucket array:
```cpp
dictionary.max_load_factor(10000.0f);
for (int i = 0; i < 50000; i++) {
    dictionary[std::to_string(i)] = i;
}
```

Because the map is forbidden from expanding, all `50,000` items are forced into the tiny default allocation of buckets. Collisions become practically guaranteed. The separate chains grow thousands of links long. When you look up a value, the hash table is forced to linearly scan a massive list, completely destroying the O(1) speed benefit and dragging your program to a halt.

## Exercises

1. **Collision Counting:** Add an `int collisionCount = 0;` member to our custom `HashTable`. Inside the `insert` method, increment it specifically when `buckets[index]` is not empty before pushing back. Print it in `main` to see how many overlaps occurred.
2. **Standard Library Probing:** Write a program using `std::unordered_map` that inserts elements in a loop. Inside the loop, print the `bucket_count()` and `load_factor()`. Watch the exact moment the bucket count doubles.
3. **Worst Case Hash:** Modify our custom `hash` method to simply `return 0;` no matter what string is passed. Insert ten words. Write out what this mathematically forces the separate chaining vector to look like, and what the lookup time complexity becomes.

## Definition of Done

- [ ] You have compiled and run a custom hash function that maps strings to numbers.
- [ ] You have observed a mathematical collision where two keys share an index.
- [ ] You have implemented separate chaining to safely store overlapping keys.
- [ ] You have traced the rehashing logic that prevents chains from growing infinitely.
- [ ] You can explain out loud what a load factor represents.
- [ ] You have configured and queried `std::unordered_map` in the C++ standard library.
