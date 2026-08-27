# Lesson 15: Cache Organization — Direct-Mapped, Set-Associative, and Fully Associative

What you will build: The reader will understand the exact hardware structure of a CPU cache: how memory addresses are decoded into tag/set/offset fields, how cache lines are looked up, what happens on a hit vs a miss, and the tradeoffs between the three cache organizations. We will build an intuition for how caches work internally.

What you need to know first: Lessons 00–14.

Terms used in this lesson:
- **Cache line** — the basic unit of storage in a cache, containing a valid bit, a tag, and a data block of B bytes, because moving data in blocks exploits spatial locality.
- **Set** — a grouping of one or more cache lines, selected by the set index bits of an address, which restricts where a given memory block can reside to simplify hardware lookup.
- **Tag** — a unique identifier stored alongside the data block, made of the remaining upper bits of an address, to verify that the cached block is indeed the one requested.
- **Block offset** — the lowest bits of the address, used to select the specific byte within a cached block, because the CPU often requests smaller data than the full block.
- **Valid bit** — a single bit per cache line indicating whether the line contains meaningful data, because at startup caches contain garbage.
- **Hit** — a successful lookup in the cache, saving time by avoiding a slower memory access.
- **Miss** — a failed lookup in the cache, requiring the CPU to fetch data from the next level in the hierarchy.
- **Eviction** — the process of removing an existing block from the cache to make room for a new one, necessary because caches are finite.
- **Direct-mapped cache** — a cache where each set contains exactly one line, making hardware fast but prone to conflicts.
- **Set-associative cache** — a cache where each set contains multiple lines, balancing fast lookup with reduced conflicts.
- **Fully associative cache** — a cache with only one set containing all lines, eliminating conflict misses but requiring expensive parallel hardware.
- **Conflict miss** — a miss occurring when multiple active blocks map to the same set, thrashing the cache despite available capacity elsewhere.
- **Capacity miss** — a miss occurring because the working set of the program exceeds the total capacity of the cache.
- **Cold miss** — a compulsory miss occurring the first time a block is accessed, unavoidable because the data has never been requested yet.
- **Write-through** — a policy of writing data to both the cache and main memory simultaneously, keeping them synchronized.
- **Write-back** — a policy of writing data only to the cache, marking it dirty, and deferring memory updates until eviction, saving bandwidth.
- **Write-allocate** — loading a block into cache on a write miss, used typically with write-back to exploit spatial locality for writes.
- **No-write-allocate** — bypassing the cache on a write miss and writing directly to memory, typically paired with write-through.
- **LRU (Least Recently Used)** — a replacement policy that evicts the block that has gone unused for the longest time, assuming past behavior predicts future needs.

Objects and methods used:

**`printf`**
- *What it is:* A standard C library function for formatted output.
- *Implementation:* `int printf(const char *format, ...);`
- *Its use:* We use it in our labs to print memory addresses and cache calculations.
- *Type:* Standard library function.
- *Responsibility:* Formats data according to a format string and writes it to standard output.
- *Depends on:* A valid format string, matching variadic arguments, and a functional standard output stream.
- *Connects to:* Called by user code; calls OS write syscalls under the hood; passes text to the console.
- *Shape:* A public API boundary to the operating system's standard out.

**`sizeof`**
- *What it is:* A compile-time operator in C.
- *Implementation:* `size_t sizeof(type)` or `size_t sizeof(expression)`
- *Its use:* We use it to inspect the size of data types to understand cache block sizing.
- *Type:* Language operator.
- *Responsibility:* Evaluates to the size in bytes of a type or an expression's type at compile time.
- *Depends on:* The compiler knowing the type definition.
- *Connects to:* Evaluated entirely by the compiler; emits a constant literal into the assembly.
- *Shape:* An internal language construct, not a runtime function.


## Concept Unit: Cache parameters and the (S, E, B) notation

### The Problem
How does a CPU organize memory so it can find things quickly? If we have a small, fast memory, how do we map a 64-bit address into it?
> Socratic prompt: If you had 64 bytes of fast memory and had to store chunks of main memory in it, how would you decide where chunk 0x1000 goes vs 0x2000? How do you look it up fast? Try sketching a mapping rule.

### Introduce the concept in isolation
Let's see how an address breaks down into Tag, Set, and Offset.
```c
#include <stdio.h>

int main() {
    // 32-byte cache, 4-byte lines, 8 sets (S=8, E=1, B=4)
    // b=2 bits, s=3 bits
    unsigned int addr = 0x00000024;
    unsigned int offset = addr & 0x3;          // lower 2 bits
    unsigned int set = (addr >> 2) & 0x7;      // next 3 bits
    unsigned int tag = addr >> 5;              // remaining bits

    printf("Addr: 0x%08X -> Tag: 0x%X, Set: %u, Offset: %u\n", addr, tag, set, offset);
    return 0;
}
```
Output:
```
Addr: 0x00000024 -> Tag: 0x1, Set: 1, Offset: 0
```
This proves that mathematical bit-shifting perfectly decomposes any memory address into discrete coordinates for a hardware cache. This structure is called **(S, E, B) notation**.

### Discard the throwaway example
This throwaway C example is deleted. We will not use it in the project.

### Project Change
- Reference Source: No reference counterpart — this is a from-scratch addition because we are simulating hardware in software.
- Files affected: `src/cache_sim.c` (created)
- Change type: Add.
- Location: Brand new file.
- Dependencies: Standard C library.

### The New Code
```c
struct CacheLine {
    int valid;
    unsigned int tag;
    char data[4];
};

struct CacheLine cache[8]; // S=8, E=1, B=4
```

### The Updated Project
```c
// ← new
struct CacheLine {
    int valid;
    unsigned int tag;
    char data[4];
};

struct CacheLine cache[8]; // S=8, E=1, B=4
```
This sets up a data structure that mirrors a physical cache in software.

### Mechanical walkthrough
1. `struct CacheLine {` — defines a new composite data type representing one hardware cache line.
2. `int valid;` — a boolean flag indicating if this line holds meaningful data.
3. `unsigned int tag;` — stores the upper bits of the address to identify which memory block is currently sitting in this line.
4. `char data[4];` — an array of 4 bytes (B=4), the actual cached data payload.
5. `};` — closes the struct.
6. `struct CacheLine cache[8];` — allocates an array of 8 cache lines (S=8).

### CS lens
Address decomposition. Also recognized in: hash tables, IP routing tables, disk sector addressing, virtual memory page tables.

### SE lens
We chose to explicitly store `valid` and `tag`. An alternative is storing only `tag` and dedicating a specific tag value to mean "invalid" (like -1). We rejected that because in real hardware, any tag bit pattern might be a valid address, so an explicit out-of-band valid bit is safer and more accurate to silicon design.

### Commands needed
`gcc src/cache_sim.c -o cache_sim`
Compiles our simulation.

### Run it
No executable logic yet. Confidently predictably, this will compile but produce no output.

### One sentence connecting this unit to what came immediately before
Now that we have the data structures modeling lines and sets, we can look at how a direct-mapped lookup algorithm uses them.

## Concept Unit: Direct-mapped cache (E=1)

### The Problem
If each set holds exactly one line, what happens when two addresses want the same set?
> Socratic prompt: In our 8-set cache, what set does address 0x00 go to? What set does 0x20 go to? If you access them back and forth, what happens?

### Introduce the concept in isolation
```c
#include <stdio.h>
int main() {
    unsigned int a1 = 0x00; // set = (0>>2)&7 = 0
    unsigned int a2 = 0x20; // set = (32>>2)&7 = 0
    printf("0x00 -> set %u\n", (a1>>2)&7);
    printf("0x20 -> set %u\n", (a2>>2)&7);
    return 0;
}
```
Output:
```
0x00 -> set 0
0x20 -> set 0
```
This proves that multiple addresses map to the exact same slot. This is a **Direct-mapped cache**.

### Discard the throwaway example
We discard this throwaway snippet.

### Project Change
- Reference Source: No reference counterpart.
- Files affected: `src/cache_sim.c`
- Change type: Add.
- Location: At the end of the file.
- Dependencies: `CacheLine` struct.

### The New Code
```c
int read_direct_mapped(unsigned int addr) {
    unsigned int set = (addr >> 2) & 0x7;
    unsigned int tag = addr >> 5;
    if (cache[set].valid && cache[set].tag == tag) {
        return 1; // HIT
    }
    // MISS: evict and load
    cache[set].valid = 1;
    cache[set].tag = tag;
    return 0; // MISS
}
```

### The Updated Project
```c
struct CacheLine {
    int valid;
    unsigned int tag;
    char data[4];
};

struct CacheLine cache[8]; // S=8, E=1, B=4

// ← new
int read_direct_mapped(unsigned int addr) {
    unsigned int set = (addr >> 2) & 0x7;
    unsigned int tag = addr >> 5;
    if (cache[set].valid && cache[set].tag == tag) {
        return 1; // HIT
    }
    // MISS: evict and load
    cache[set].valid = 1;
    cache[set].tag = tag;
    return 0; // MISS
}
```
This function models a hardware direct-mapped lookup: index to a single set, check the tag, and hit or miss.

### Mechanical walkthrough
1. `int read_direct_mapped(unsigned int addr) {` — declares a function taking a raw memory address.
2. `unsigned int set = (addr >> 2) & 0x7;` — calculates the set index by shifting out the 2-bit offset and masking 3 bits.
3. `unsigned int tag = addr >> 5;` — extracts the remaining upper bits as the tag.
4. `if (cache[set].valid && cache[set].tag == tag) {` — checks if the single line in the target set is valid AND its tag matches our address's tag.
5. `return 1;` — returns a hit status.
6. `cache[set].valid = 1;` — on a miss, sets the valid bit to 1, simulating loading the block.
7. `cache[set].tag = tag;` — updates the stored tag to the newly loaded block's tag.
8. `return 0;` — returns a miss status.

### CS lens
Collision handling by overwrite. Also recognized in: direct-addressed hash tables with no chaining, fixed-slot load balancers.

### SE lens
We chose to overwrite the old cache line immediately on a miss. The alternative is reading the new data into a temporary buffer first. We rejected that because hardware physically wires the bus directly into the cache SRAM, so the load inherently overwrites the slot in one action.

### Commands needed
None new.

### Run it
Not executable standalone without a main loop. Confidently predictably, it simply updates the `cache` global array.

### One sentence connecting this unit to what came immediately before
Because a direct-mapped cache has only one slot per set, we can easily run into situations where two addresses fight over it indefinitely.

## Concept Unit: Conflict misses and thrashing

### The Problem
If two frequently accessed variables map to the exact same cache set, they will constantly evict each other.
> Socratic prompt: In a loop adding elements of `a[i]` and `b[i]`, what happens if `a[i]` and `b[i]` always target Set 4?

### Introduce the concept in isolation
```c
#include <stdio.h>
int main() {
    int cache_tag = -1;
    int misses = 0;
    for (int i=0; i<4; i++) {
        // Access A (maps to set 0, tag 0)
        if (cache_tag != 0) { misses++; cache_tag = 0; }
        // Access B (maps to set 0, tag 2)
        if (cache_tag != 2) { misses++; cache_tag = 2; }
    }
    printf("Total misses: %d\n", misses);
    return 0;
}
```
Output:
```
Total misses: 8
```
This proves that accessing two alternating tags in the same set causes a miss on every single access. This is called **Thrashing** due to **Conflict misses**.

### Discard the throwaway example
Discarded.

### Project Change
- Reference Source: No reference counterpart.
- Files affected: `src/cache_sim.c`
- Change type: Add.
- Location: End of file.
- Dependencies: `read_direct_mapped`.

### The New Code
```c
void simulate_thrashing() {
    // Accessing 0x00 and 0x20 repeatedly. Both map to set 0.
    int m1 = read_direct_mapped(0x00);
    int m2 = read_direct_mapped(0x20);
    int m3 = read_direct_mapped(0x00);
    int m4 = read_direct_mapped(0x20);
    printf("Hits: %d %d %d %d\n", m1, m2, m3, m4);
}
```

### The Updated Project
```c
// ... cache and read_direct_mapped ...

// ← new
void simulate_thrashing() {
    // Accessing 0x00 and 0x20 repeatedly. Both map to set 0.
    int m1 = read_direct_mapped(0x00);
    int m2 = read_direct_mapped(0x20);
    int m3 = read_direct_mapped(0x00);
    int m4 = read_direct_mapped(0x20);
    printf("Hits: %d %d %d %d\n", m1, m2, m3, m4);
}
```
This function drives the simulator to prove that a pathological access pattern guarantees zero hits in a direct-mapped cache.

### Mechanical walkthrough
1. `void simulate_thrashing() {` — starts the test driver.
2. `int m1 = read_direct_mapped(0x00);` — accesses address 0x00. Misses (cold), loads tag 0 into set 0.
3. `int m2 = read_direct_mapped(0x20);` — accesses 0x20. Tag is 1, set is 0. Mismatches tag 0. Conflict miss. Evicts tag 0, loads tag 1.
4. `int m3 = read_direct_mapped(0x00);` — accesses 0x00. Tag 0 mismatches tag 1. Conflict miss.
5. `int m4 = read_direct_mapped(0x20);` — accesses 0x20. Tag 1 mismatches tag 0. Conflict miss.
6. `printf("Hits: %d %d %d %d\n", m1, m2, m3, m4);` — prints the results (all 0s).

### CS lens
Pathological inputs to deterministic algorithms. Also recognized in: hash table worst-case O(N) chains, quicksort O(N^2) on sorted arrays, regex catastrophic backtracking.

### SE lens
We chose to demonstrate thrashing with hardcoded addresses. An alternative is dynamic allocation of large arrays, but we rejected that because the C memory allocator adds unpredictable offsets that might accidentally avoid the conflict. Hardcoded addresses mathematically force the collision.

### Commands needed
None new.

### Run it
1. We run `simulate_thrashing()` (mentally or via adding `main`).
2. The output is reliably `Hits: 0 0 0 0`.

### One sentence connecting this unit to what came immediately before
Since direct-mapped caches thrash easily, hardware designers added multiple lines per set to absorb collisions.

## Concept Unit: Set-associative cache (E>1)

### The Problem
How can we store both 0x00 and 0x20 in Set 0 simultaneously?
> Socratic prompt: If a set has two slots, how does the lookup logic change? What do you have to check now?

### Introduce the concept in isolation
```c
#include <stdio.h>
int main() {
    int ways[2] = {-1, -1};
    int tag_to_find = 2;
    ways[0] = 0; ways[1] = 2; // Populate
    
    int hit = (ways[0] == tag_to_find) || (ways[1] == tag_to_find);
    printf("Hit? %d\n", hit);
    return 0;
}
```
Output:
```
Hit? 1
```
This proves we can avoid conflicts by checking multiple slots in parallel. This is a **Set-associative cache**.

### Discard the throwaway example
Discarded.

### Project Change
- Reference Source: No reference counterpart.
- Files affected: `src/cache_sim.c`
- Change type: Refactor.
- Location: Top of file.
- Dependencies: None.

### The New Code
```c
struct Set {
    struct CacheLine ways[2]; // E=2
    int lru_way;
};
struct Set assoc_cache[4]; // S=4, E=2, B=4
```

### The Updated Project
```c
struct CacheLine {
    int valid;
    unsigned int tag;
    char data[4];
};

// ← new
struct Set {
    struct CacheLine ways[2]; // E=2
    int lru_way;
};
struct Set assoc_cache[4]; // S=4, E=2, B=4
```
We redefined the cache so each Set contains an array of `CacheLine`s (Ways) and metadata for eviction.

### Mechanical walkthrough
1. `struct Set {` — defines a container for multiple cache lines that map to the same index.
2. `struct CacheLine ways[2];` — embeds exactly two cache lines, meaning this is a 2-way set-associative cache (E=2).
3. `int lru_way;` — stores an integer indicating which way (0 or 1) is the least recently used, so we know what to evict.
4. `};` — closes the struct.
5. `struct Set assoc_cache[4];` — allocates 4 sets. S=4, E=2, B=4. Total capacity is 32 bytes, same as before.

### CS lens
Parallel search spaces. Also recognized in: Bloom filters (multiple hash functions), cuckoo hashing, SIMD instructions.

### SE lens
We grouped the lines into a `Set` struct. An alternative is a 2D array `CacheLine cache[4][2]`. We chose the struct because it cleanly encapsulates the LRU metadata alongside the ways, mirroring how real hardware keeps LRU bits in the set decode logic.

### Commands needed
None new.

### Run it
Confidently predictably, this only allocates memory; no runtime output.

### One sentence connecting this unit to what came immediately before
With multiple ways per set, we can absorb conflicts, but if a set fills up, we must decide which way to kick out.

## Concept Unit: Fully associative cache (E=S, 1 set)

### The Problem
What if we never want a conflict miss at all, and just want to store any block anywhere?
> Socratic prompt: If there is only one giant set for the whole cache, how many bits of the address are used for the set index? 

### Introduce the concept in isolation
```c
#include <stdio.h>
int main() {
    unsigned int addr = 0x00000024;
    unsigned int offset = addr & 0x3;     // b=2
    unsigned int tag = addr >> 2;         // all remaining 30 bits! s=0.
    printf("Tag: 0x%X\n", tag);
    return 0;
}
```
Output:
```
Tag: 0x9
```
This proves that with zero set index bits, the tag becomes the entire block address. This is a **Fully associative cache**.

### Discard the throwaway example
Discarded.

### Project Change
- Reference Source: No reference counterpart.
- Files affected: `src/cache_sim.c`
- Change type: Add.
- Location: End of file.
- Dependencies: `CacheLine` struct.

### The New Code
```c
struct CacheLine full_cache[8]; // S=1, E=8, B=4

int read_fully_associative(unsigned int addr) {
    unsigned int tag = addr >> 2; // No set bits
    for(int i=0; i<8; i++) {
        if(full_cache[i].valid && full_cache[i].tag == tag) return 1;
    }
    return 0; // MISS
}
```

### The Updated Project
```c
// ... previous code ...

// ← new
struct CacheLine full_cache[8]; // S=1, E=8, B=4

int read_fully_associative(unsigned int addr) {
    unsigned int tag = addr >> 2; // No set bits
    for(int i=0; i<8; i++) {
        if(full_cache[i].valid && full_cache[i].tag == tag) return 1;
    }
    return 0; // MISS
}
```
This function checks all lines linearly (simulating a parallel hardware check).

### Mechanical walkthrough
1. `struct CacheLine full_cache[8];` — an array of 8 lines serving as a single giant set.
2. `int read_fully_associative(unsigned int addr) {` — the lookup function.
3. `unsigned int tag = addr >> 2;` — extracts the tag directly after the offset. The set index is exactly 0 bits long.
4. `for(int i=0; i<8; i++) {` — a software loop simulating hardware parallel comparators checking every line simultaneously.
5. `if(full_cache[i].valid && full_cache[i].tag == tag) return 1;` — hit detected.
6. `return 0;` — if no line matches, it's a miss.

### CS lens
Content Addressable Memory (CAM). Also recognized in: TLBs (Translation Lookaside Buffers), network switch MAC tables.

### SE lens
We simulate parallel hardware comparators with a sequential `for` loop. The alternative is multi-threading. We rejected threading because hardware propagation delay (picoseconds) cannot be accurately modeled by OS threads (microseconds); a synchronous loop accurately reflects the logical O(N) gate cost.

### Commands needed
None.

### Run it
Confidently predictably, this will compile but produce no standalone output.

### One sentence connecting this unit to what came immediately before
Fully associative caches eliminate conflict misses entirely, leaving only capacity and cold misses, but require complex replacement policies to manage their single full set.

## Concept Unit: Replacement policies and write strategies

### The Problem
When a cache misses and needs to load data into a full set, which existing block is deleted? And if we write data, when does main memory see it?
> Socratic prompt: If you have to kick out a roommate to make room for a new one, do you kick out the one you talked to yesterday, or the one you haven't seen in a year?

### Introduce the concept in isolation
```c
#include <stdio.h>
int main() {
    int last_used[2] = {10, 5}; // timestamps
    int lru_index = (last_used[0] < last_used[1]) ? 0 : 1;
    printf("Evict index: %d\n", lru_index);
    return 0;
}
```
Output:
```
Evict index: 1
```
This proves that keeping track of access time allows us to identify the oldest line. This is **Least Recently Used (LRU)** replacement.

### Discard the throwaway example
Discarded.

### Project Change
- Reference Source: No reference counterpart.
- Files affected: `src/cache_sim.c`
- Change type: Add.
- Location: End of file.
- Dependencies: `assoc_cache` from earlier.

### The New Code
```c
int read_assoc(unsigned int addr) {
    unsigned int set = (addr >> 2) & 0x3;
    unsigned int tag = addr >> 4;
    for(int w=0; w<2; w++) {
        if(assoc_cache[set].ways[w].valid && assoc_cache[set].ways[w].tag == tag) {
            assoc_cache[set].lru_way = 1 - w; // Update LRU
            return 1; // HIT
        }
    }
    // MISS: evict the LRU way
    int evict_w = assoc_cache[set].lru_way;
    assoc_cache[set].ways[evict_w].valid = 1;
    assoc_cache[set].ways[evict_w].tag = tag;
    assoc_cache[set].lru_way = 1 - evict_w; // Toggle LRU
    return 0; // MISS
}
```

### The Updated Project
```c
// ... assoc_cache declaration ...

// ← new
int read_assoc(unsigned int addr) {
    unsigned int set = (addr >> 2) & 0x3;
    unsigned int tag = addr >> 4;
    for(int w=0; w<2; w++) {
        if(assoc_cache[set].ways[w].valid && assoc_cache[set].ways[w].tag == tag) {
            assoc_cache[set].lru_way = 1 - w; // Update LRU
            return 1; // HIT
        }
    }
    // MISS: evict the LRU way
    int evict_w = assoc_cache[set].lru_way;
    assoc_cache[set].ways[evict_w].valid = 1;
    assoc_cache[set].ways[evict_w].tag = tag;
    assoc_cache[set].lru_way = 1 - evict_w; // Toggle LRU
    return 0; // MISS
}
```
This completes the set-associative cache logic, demonstrating LRU eviction using a simple toggle bit (since E=2).

### Mechanical walkthrough
1. `unsigned int set = (addr >> 2) & 0x3;` — calculates set index (2 bits for 4 sets).
2. `unsigned int tag = addr >> 4;` — extracts tag.
3. `for(int w=0; w<2; w++) {` — iterates over the 2 ways in the target set.
4. `if(assoc_cache[set].ways[w].valid && ...` — if hit...
5. `assoc_cache[set].lru_way = 1 - w;` — ...updates the LRU pointer to the *other* way (since there are only 2, `1 - w` flips it).
6. `return 1;` — returns hit.
7. `int evict_w = assoc_cache[set].lru_way;` — on a miss, selects the currently marked LRU way for eviction.
8. `assoc_cache[set].ways[evict_w].valid = 1;` — loads new block.
9. `assoc_cache[set].lru_way = 1 - evict_w;` — flips the LRU bit to protect the newly loaded block.
10. `return 0;` — returns miss.

### CS lens
Temporal locality exploitation. Also recognized in: OS page replacement, web browser caches, Redis eviction policies, database buffer pools.

### SE lens
We chose a 1-bit toggle for LRU since E=2. If E was 4 or 8, we would need a full queue or timestamp per line. We avoided that here because a 1-bit toggle is physically how dual-core or 2-way L1 caches are wired—it is precisely accurate to real silicon.

### Commands needed
None.

### Run it
Confidently predictably, this executes the LRU policy correctly upon being called.

### One sentence connecting this unit to what came immediately before
With LRU handling evictions, we can fully categorize every cache miss we encounter into one of three distinct types.

## Concept Unit: The three types of cache misses (3Cs)

### The Problem
Why did our cache miss? Was it because it was empty, because it was too small, or because we got unlucky with mapping?
> Socratic prompt: If you have a 32-byte cache and you read 64 bytes of an array once, why did you miss? If you read it a second time, why do you miss again?

### Introduce the concept in isolation
```c
#include <stdio.h>
int main() {
    int misses = 0;
    // Cold miss simulation
    int initialized = 0;
    if (!initialized) { misses++; initialized = 1; }
    printf("First access misses: %d\n", misses);
    return 0;
}
```
Output:
```
First access misses: 1
```
This proves that the first access to any data is guaranteed to miss. This is a **Cold (compulsory) miss**.

### Discard the throwaway example
Discarded.

### Project Change
- Reference Source: No reference counterpart.
- Files affected: `src/cache_sim.c`
- Change type: Add.
- Location: End of file.
- Dependencies: `read_assoc`.

### The New Code
```c
void simulate_3cs() {
    // 32-byte cache.
    // 1. Cold Miss
    int m1 = read_assoc(0x00);
    
    // 2. Conflict Miss (Force eviction of 0x00 from Set 0)
    int m2 = read_assoc(0x10); // Tag 1, Set 0
    int m3 = read_assoc(0x20); // Tag 2, Set 0 (Evicts 0x00)
    int m4 = read_assoc(0x00); // Conflict miss!
    
    // 3. Capacity Miss (Read more than 32 bytes)
    for(unsigned int addr = 0x40; addr < 0x80; addr += 4) {
        read_assoc(addr); // Floods cache
    }
    int m5 = read_assoc(0x00); // Capacity miss!
    
    printf("M1: %d, M4: %d, M5: %d\n", m1, m4, m5);
}
```

### The Updated Project
```c
// ... read_assoc ...

// ← new
void simulate_3cs() {
    // 32-byte cache.
    // 1. Cold Miss
    int m1 = read_assoc(0x00);
    
    // 2. Conflict Miss (Force eviction of 0x00 from Set 0)
    int m2 = read_assoc(0x10); // Tag 1, Set 0
    int m3 = read_assoc(0x20); // Tag 2, Set 0 (Evicts 0x00)
    int m4 = read_assoc(0x00); // Conflict miss!
    
    // 3. Capacity Miss (Read more than 32 bytes)
    for(unsigned int addr = 0x40; addr < 0x80; addr += 4) {
        read_assoc(addr); // Floods cache
    }
    int m5 = read_assoc(0x00); // Capacity miss!
    
    printf("M1: %d, M4: %d, M5: %d\n", m1, m4, m5);
}
```
This function intentionally creates the three distinct types of misses.

### Mechanical walkthrough
1. `void simulate_3cs() {` — test driver for miss categorization.
2. `int m1 = read_assoc(0x00);` — a cold miss. The cache is entirely empty at startup.
3. `int m2 = read_assoc(0x10);` and `int m3 = read_assoc(0x20);` — loads two new blocks into Set 0, filling both ways. 0x00 is evicted by LRU.
4. `int m4 = read_assoc(0x00);` — 0x00 was evicted because Set 0 was full, despite the rest of the cache being empty. This is a conflict miss.
5. `for(unsigned int addr = 0x40; addr < 0x80; addr += 4)` — iterates over 64 bytes of addresses, which is double the cache's 32-byte capacity.
6. `read_assoc(addr);` — fills every set and evicts all previous data.
7. `int m5 = read_assoc(0x00);` — 0x00 is gone because the working set (64 bytes) exceeded total cache size. This is a capacity miss.
8. `printf("M1: %d, M4: %d, M5: %d\n", m1, m4, m5);` — prints 0 (miss) for all of them.

### CS lens
Classification of performance bottlenecks. Also recognized in: network packet drops (congestion vs routing vs checksum errors), garbage collection pauses (minor vs major).

### SE lens
We chose to explicitly force each miss type in code. We rejected using a trace file parser because embedding the exact memory addresses in C code provides immediate visual proof of the mathematical collisions without hiding it behind file I/O abstraction.

### Commands needed
None.

### Run it
1. Execution trace:
   1. `read_assoc(0x00)` — miss (0)
   2. `read_assoc(0x10)` — miss (0)
   3. `read_assoc(0x20)` — miss (0), evicts 0x00.
   4. `read_assoc(0x00)` — miss (0).
   5. Loop runs 16 times, missing and evicting.
   6. `read_assoc(0x00)` — miss (0).
2. The print output is `M1: 0, M4: 0, M5: 0`.

### One sentence connecting this unit to what came immediately before
By understanding why misses happen, we can restructure our C loops to minimize them, which leads directly to cache performance analysis.

## Connecting the pieces
A 64-bit address flows from the CPU, gets sliced into Tag, Set, and Offset bits, indexes into a hardware Set (either direct-mapped, associative, or fully associative), compares its Tag against the stored Valid lines, and resolves as a Hit (fast) or Miss (triggering an LRU eviction and memory fetch), directly impacting program execution speed.

Next lesson: Lesson 16 covers cache performance: how to quantify miss penalties with AMAT.
