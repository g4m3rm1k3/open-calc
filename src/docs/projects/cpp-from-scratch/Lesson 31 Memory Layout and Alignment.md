# Lesson 31: Memory Layout and Alignment

**What you will build:** A series of isolated console programs that allocate structures in memory, measure their size and alignment requirements, and manipulate how the compiler pads and packs them. You will observe how the physical architecture of the CPU influences the logical layout of data in C++.

**What you need to know first:** Lesson 01 Types and Variables, Lesson 02 Memory The Stack and the Heap, Lesson 06 Classes and Objects.

**Terms used in this lesson:**
- **Alignment** — the requirement that certain types of data must be placed in memory at addresses that are multiples of a specific byte boundary. *Why it exists:* because modern CPUs read memory in chunks (like 4 or 8 bytes) rather than byte-by-byte; placing data at unaligned addresses forces the CPU to perform multiple reads and stitch the data together, crushing performance or even causing hardware faults.
- **Padding** — empty, unused bytes automatically inserted by the compiler between members of a `struct` or `class`. *Why it exists:* to satisfy the alignment requirements of the subsequent members, ensuring the CPU can read them efficiently, even if it wastes some memory space.
- **Packing** — the deliberate instruction to the compiler to disable padding and pack data members as tightly as possible. *Why it exists:* to match strict binary layouts required by network protocols, file formats, or hardware registers, trading CPU read efficiency for exact spatial control.
- **Cache Line** — the fixed-size chunk of memory (typically 64 bytes) that the CPU fetches into its high-speed cache at one time. *Why it exists:* to exploit spatial locality—when a program accesses one variable, it is statistically likely to access adjacent variables, so loading them together drastically reduces memory access latency.

**Objects and methods used:**
- **`sizeof`**
  - *What it is:* A compile-time operator that returns the size, in bytes, of a type or variable.
  - *Implementation:* `sizeof(type)` or `sizeof(expression)`, returning a `std::size_t`.
  - *Its use:* To prove how much total memory a structure consumes, revealing the presence of hidden padding bytes.
- **`alignof`**
  - *What it is:* A compile-time operator that returns the alignment requirement, in bytes, of a specific type.
  - *Implementation:* `alignof(type)`, returning a `std::size_t`.
  - *Its use:* To uncover the strict boundary rules the compiler enforces for different data types.
- **`alignas`**
  - *What it is:* A specifier used to force a custom, stricter alignment requirement on a type or variable.
  - *Implementation:* `alignas(N) type variable;`, where `N` is a power of 2.
  - *Its use:* To manually position data at specific boundaries, most commonly for aligning structures to CPU cache lines to prevent performance penalties.
- **`#pragma pack`**
  - *What it is:* A compiler directive that temporarily changes the maximum alignment for struct members.
  - *Implementation:* `#pragma pack(push, 1)` to force 1-byte alignment (no padding), and `#pragma pack(pop)` to restore defaults.
  - *Its use:* To strip out compiler-inserted padding when mapping a C++ struct directly to a raw binary file or network packet.

---

## Concept Unit: `sizeof` and Basic Sizes

### The Problem
When you declare variables, the computer allocates memory for them. To understand how memory is structured, you first need a way to measure exactly how many bytes a specific data type consumes.

### The New Code
```cpp
#include <iostream>

int main() {
    int score = 100;
    double temperature = 98.6;
    char grade = 'A';

    std::cout << "Size of int: " << sizeof(score) << " bytes\n";
    std::cout << "Size of double: " << sizeof(temperature) << " bytes\n";
    std::cout << "Size of char: " << sizeof(grade) << " bytes\n";

    return 0;
}
```

### Mechanical Walkthrough
- `#include <iostream>` imports the standard input/output stream library, allowing us to print to the console.
- `int main() { ... }` defines the entry point of the C++ program.
- `int score = 100;` allocates memory for a 32-bit integer.
- `double temperature = 98.6;` allocates memory for a double-precision floating-point number.
- `char grade = 'A';` allocates memory for a single character.
- `sizeof(score)` evaluates, at compile-time, exactly how many bytes the `int` type requires on this specific architecture. It does not evaluate the value `100`; it evaluates the physical storage requirement of `int`.
- `sizeof(temperature)` evaluates the bytes required to store a double-precision floating-point number.
- `sizeof(grade)` evaluates the bytes required to store a single character.
- `std::cout << ... << "\n";` prints the resulting sizes to the standard output.

### CS Lens
This embodies the concept of Hardware-Dependent Types. Unlike languages that guarantee an `int` is always exactly 32 bits everywhere, C++ types are often sized based on what is most efficient for the target CPU architecture. `sizeof` is the bridge that allows your code to adapt to the physical machine it is compiled for.

### SE Lens
The engineering principle is avoiding hardcoded assumptions. The alternative not chosen is typing `4` instead of `sizeof(int)`. The tradeoff of hardcoding `4` is that while it saves a few keystrokes, the code will silently break when compiled on a different architecture where `int` might be 2 bytes or 8 bytes. `sizeof` guarantees correctness across platforms.

### Run It Yourself
1. Open a terminal and create a file named `sizeof_concept.cpp`.
2. Paste the code above into the file.
3. Compile the program: `g++ -std=c++17 sizeof_concept.cpp -o sizeof_concept`.
4. Run the program: `./sizeof_concept` (or `.\sizeof_concept.exe` on Windows).
5. Expected output (may vary by architecture, but commonly):
   ```
   Size of int: 4 bytes
   Size of double: 8 bytes
   Size of char: 1 bytes
   ```

---

## Concept Unit: `alignof` and Alignment Requirements

### The Problem
Knowing the size of a variable is only half the picture. CPUs do not like reading data from arbitrary memory addresses. If a 4-byte integer starts at an odd address (like byte 3), the CPU might have to perform two memory reads to fetch it, stitching the halves together. We need to see the rules the compiler enforces to prevent this.

### The New Code
```cpp
#include <iostream>

int main() {
    std::cout << "Alignment of int: " << alignof(int) << " bytes\n";
    std::cout << "Alignment of double: " << alignof(double) << " bytes\n";
    std::cout << "Alignment of char: " << alignof(char) << " bytes\n";

    return 0;
}
```

### Mechanical Walkthrough
- `alignof(int)` is a compile-time operator that returns the alignment requirement for the `int` type. It answers the question: "What multiple must this type's memory address be?" If it returns 4, an `int` can only be placed at memory addresses ending in 0, 4, 8, or C (in hex).
- `alignof(double)` checks the alignment for a `double`. Because a `double` is larger, it typically demands a stricter alignment, often 8 bytes, so the CPU can load all 64 bits in a single aligned memory fetch.
- `alignof(char)` checks the alignment for a `char`. Because a `char` is exactly 1 byte, it can be placed at any memory address, so its alignment is always 1.

### CS Lens
This embodies Memory Alignment. Hardware memory is not a continuous, featureless ribbon of bytes; it is organized into "words" (chunks of 4 or 8 bytes). Accessing a word-aligned address is a single hardware instruction. Accessing an unaligned address spans across two physical memory words, forcing the hardware to issue two reads, mask out the unwanted bytes, and shift the remaining bytes together.

### SE Lens
The alternative not chosen is allowing unaligned access by default to save memory. The tradeoff C++ makes is prioritizing speed over space. By enforcing alignment, C++ guarantees the fastest possible memory access on the target hardware, accepting that this might leave small gaps in memory to push subsequent variables to the next aligned boundary.

### Run It Yourself
1. Create a file named `alignof_concept.cpp`.
2. Paste the code above into the file.
3. Compile the program: `g++ -std=c++17 alignof_concept.cpp -o alignof_concept`.
4. Run the program.
5. Expected output:
   ```
   Alignment of int: 4 bytes
   Alignment of double: 8 bytes
   Alignment of char: 1 bytes
   ```

---

## Concept Unit: Struct Padding

### The Problem
When you group multiple variables into a `struct`, you might expect the total size of the `struct` to be the exact sum of its members' sizes. However, because the compiler enforces the alignment rules we just saw, it must insert invisible gaps to ensure every member lands on its required boundary.

### The New Code
```cpp
#include <iostream>

struct PlayerState {
    char active;      // 1 byte
    int health;       // 4 bytes
    char team;        // 1 byte
};

int main() {
    std::cout << "Size of active: " << sizeof(char) << " bytes\n";
    std::cout << "Size of health: " << sizeof(int) << " bytes\n";
    std::cout << "Size of team: " << sizeof(char) << " bytes\n";
    std::cout << "Sum of members: 6 bytes\n";
    std::cout << "Actual Size of PlayerState: " << sizeof(PlayerState) << " bytes\n";

    return 0;
}
```

### Mechanical Walkthrough
- `struct PlayerState { ... };` defines a custom data type grouping three variables.
- `char active;` is placed first. It takes 1 byte.
- `int health;` requires 4-byte alignment. It cannot sit immediately after `active` at byte offset 1, because 1 is not a multiple of 4. The compiler silently inserts 3 bytes of padding. `health` begins at byte offset 4.
- `char team;` takes 1 byte. It is placed immediately after `health` at byte offset 8.
- `sizeof(PlayerState)` evaluates the total size of the struct. The compiler must also pad the *end* of the struct so that if we create an array of `PlayerState` objects, the `health` integer in the *second* element remains correctly aligned. Since the strictest alignment in the struct is 4 (for `int`), the total size of the struct must be a multiple of 4. The current layout takes 9 bytes (1 + 3 pad + 4 + 1), so 3 more padding bytes are added at the end, bringing the total to 12 bytes.

### CS Lens
This embodies Structural Padding. The physical layout in memory looks like this: `[char] [pad] [pad] [pad] [int] [int] [int] [int] [char] [pad] [pad] [pad]`. The order you declare members in a struct drastically affects how much memory is wasted. Reordering this struct to `[int] [char] [char]` would drop its total size from 12 bytes to 8 bytes.

### SE Lens
The tradeoff is developer convenience vs memory efficiency. The compiler will never automatically reorder your struct members to save space, because C++ guarantees that the memory layout matches your declaration order (vital for compatibility with C APIs). If memory footprint matters—such as having a million `PlayerState` objects in an array—it is the engineer's responsibility to arrange members from largest to smallest to minimize padding waste.

### Run It Yourself
1. Create a file named `padding_concept.cpp`.
2. Paste the code above.
3. Compile the program: `g++ -std=c++17 padding_concept.cpp -o padding_concept`.
4. Run the program.
5. Expected output:
   ```
   Size of active: 1 bytes
   Size of health: 4 bytes
   Size of team: 1 bytes
   Sum of members: 6 bytes
   Actual Size of PlayerState: 12 bytes
   ```

---

## Concept Unit: `#pragma pack`

### The Problem
Sometimes you *cannot* have padding. If you are reading a raw binary file from disk (like a bitmap image header) or receiving a strict network packet, the bytes arrive packed tightly together. If your C++ struct contains hidden padding, reading the raw bytes directly into the struct will misalign the data, writing network bytes into padding spaces and destroying the values.

### The New Code
```cpp
#include <iostream>

#pragma pack(push, 1)
struct NetworkPacket {
    char packetType;  // 1 byte
    int payloadID;    // 4 bytes
    char checksum;    // 1 byte
};
#pragma pack(pop)

int main() {
    std::cout << "Packed Size of NetworkPacket: " << sizeof(NetworkPacket) << " bytes\n";
    return 0;
}
```

### Mechanical Walkthrough
- `#pragma pack(push, 1)` is a compiler directive instructing the compiler to temporarily change the maximum alignment requirement for struct members to 1 byte. "Push" saves the current default alignment rules, and "1" dictates that no member requires alignment greater than a 1-byte boundary.
- `struct NetworkPacket { ... };` defines the structure under these new rules. Because maximum alignment is 1, `payloadID` (an `int`) is allowed to sit immediately after `packetType` at byte offset 1. No padding is inserted.
- `#pragma pack(pop)` restores the compiler's normal alignment rules for any code that follows. This is critical so you do not accidentally disable padding for the rest of your program, which would cripple performance globally.
- `sizeof(NetworkPacket)` evaluates to exactly 6 bytes (1 + 4 + 1). The compiler has stripped away the performance protections to give you exact spatial control.

### CS Lens
This embodies Unaligned Memory Access. By packing the struct, you are forcing the CPU to fetch `payloadID` from an unaligned address. On some architectures (like x86), the CPU handles this automatically, but it takes more clock cycles. On other architectures (like older ARM), this will crash the program with a hardware fault (a Bus Error or Segmentation Fault).

### SE Lens
The engineering principle is Exact Data Representation. The alternative not chosen is manually reading the data byte-by-byte and shifting it into variables with bitwise operators. The tradeoff `#pragma pack` makes is sacrificing CPU access speed (and risking hardware faults on some platforms) to gain immense simplicity when serializing or deserializing strict binary formats.

### Run It Yourself
1. Create a file named `pack_concept.cpp`.
2. Paste the code above.
3. Compile the program: `g++ -std=c++17 pack_concept.cpp -o pack_concept`.
4. Run the program.
5. Expected output:
   ```
   Packed Size of NetworkPacket: 6 bytes
   ```

---

## Concept Unit: `alignas` and Cache-Line Alignment

### The Problem
Sometimes the compiler's default alignment isn't strict enough. Modern CPUs fetch memory from RAM into their ultra-fast L1 cache in blocks of 64 bytes, called "cache lines". If two independent variables (like lock variables used by different threads) happen to fall into the exact same 64-byte cache line, modifying one will invalidate the cache for the other, causing a massive performance collapse known as "False Sharing". You need a way to force a variable onto its own dedicated cache line.

### The New Code
```cpp
#include <iostream>

struct StandardData {
    int value;
};

struct alignas(64) CacheLineData {
    int value;
};

int main() {
    std::cout << "Alignment of StandardData: " << alignof(StandardData) << " bytes\n";
    std::cout << "Size of StandardData: " << sizeof(StandardData) << " bytes\n";

    std::cout << "Alignment of CacheLineData: " << alignof(CacheLineData) << " bytes\n";
    std::cout << "Size of CacheLineData: " << sizeof(CacheLineData) << " bytes\n";

    return 0;
}
```

### Mechanical Walkthrough
- `struct StandardData { int value; };` creates a normal struct. Its alignment is driven by its largest member, `int`, so its alignment is 4, and its size is 4.
- `struct alignas(64) CacheLineData { int value; };` applies the `alignas` specifier to the struct definition. `alignas(64)` dictates that this struct must be placed at a memory address that is a multiple of 64.
- `alignof(CacheLineData)` evaluates to 64, proving that the compiler is now enforcing the custom boundary.
- `sizeof(CacheLineData)` evaluates to 64. Because the struct *must* be 64-byte aligned, its size must also be a multiple of 64 so that arrays of `CacheLineData` continue to satisfy the alignment. The compiler automatically pads the struct with 60 bytes of empty space to fill the 64-byte requirement.

### CS Lens
This embodies Spatial Locality and Cache Architecture. A cache line is the smallest unit of data transfer between RAM and the CPU cache. By aligning to 64 bytes, you guarantee that `CacheLineData` begins at the exact start of a new cache line, and because its size is padded to 64 bytes, you guarantee it occupies the entire cache line alone. No other variables can physically share that cache line.

### SE Lens
The alternative not chosen is manually inserting 60 bytes of dummy variables (`char pad[60];`) to push the size up. The tradeoff of using `alignas(64)` is a significant waste of memory (60 bytes thrown away per object) in exchange for absolute protection against False Sharing in high-performance multithreaded systems. You only use this when profiling proves that cache invalidation is the bottleneck.

### Run It Yourself
1. Create a file named `alignas_concept.cpp`.
2. Paste the code above.
3. Compile the program: `g++ -std=c++17 alignas_concept.cpp -o alignas_concept`.
4. Run the program.
5. Expected output:
   ```
   Alignment of StandardData: 4 bytes
   Size of StandardData: 4 bytes
   Alignment of CacheLineData: 64 bytes
   Size of CacheLineData: 64 bytes
   ```

---

## Connect the Pieces

Observe how memory layout tools give you absolute control over the physical reality of your data:
You use `sizeof` to measure a struct and realize it's larger than you expected. You use `alignof` to discover the boundaries the compiler is enforcing, realizing that padding is being inserted to protect memory access speed. If you are writing a network driver and must perfectly match a protocol, you use `#pragma pack` to strip the padding away, accepting the performance hit. If you are writing a high-frequency trading algorithm and need threads to operate without cache interference, you use `alignas` to artificially inflate the alignment, burning memory to guarantee cache isolation. C++ does not abstract the hardware away; it gives you the tools to command it.

## What Breaks Without This

If you ignore memory alignment when interacting with raw binary data, your program will interpret bytes incorrectly.

Create a file named `break_padding.cpp`:
```cpp
#include <iostream>
#include <cstring>

struct Header {
    char type;
    int id;
};

int main() {
    // 5 raw bytes simulating a network packet (1 byte type 'A', 4 byte int '256')
    char rawBytes[5] = {'A', 0, 1, 0, 0}; 

    Header h;
    // We copy the 5 bytes directly into the struct
    std::memcpy(&h, rawBytes, 5);

    std::cout << "Type: " << h.type << "\n";
    std::cout << "ID: " << h.id << "\n";

    return 0;
}
```

Run it.

**The error/output:**
```
Type: A
ID: 0
```

The `id` is completely wrong (it should be 256). Why? Because `Header` contains 3 padding bytes after `type`. `std::memcpy` blindly copied the data, shoving the important bytes of the ID into the useless padding space. The actual `h.id` integer was filled with zeros or garbage. To fix it, you must use `#pragma pack(push, 1)` around `Header` so its physical layout exactly matches the raw bytes.

## Exercises

1. Create a struct with a `char`, a `double`, and an `int` in that order. Print its `sizeof`. Then rearrange the members to `double`, `int`, `char` and print its `sizeof` again. Prove to yourself that the order of declaration changes the total memory footprint.
2. Apply `#pragma pack(push, 1)` to the first struct from Exercise 1. Print its `sizeof` to verify that all padding is removed, regardless of the order.
3. Create an array of two `alignas(64)` structs. Print the memory address of the first element (`&arr[0]`) and the second element (`&arr[1]`). Subtract them (or visually inspect the hex) to prove they are exactly 64 bytes apart.

## Definition of Done
- [ ] You have written and executed code that uses `sizeof` and `alignof` to measure data types.
- [ ] You have proven that struct member ordering affects total size due to padding.
- [ ] You have used `#pragma pack(push, 1)` to disable padding and evaluate the raw packed size.
- [ ] You have used `alignas` to inflate alignment to cache-line boundaries.
- [ ] You can explain the tradeoff between memory packing and CPU access speed out loud to someone who hasn't read this lesson.
