# Lesson 13: std::fstream and Binary I/O

**What you will build**
You will build a series of small, isolated programs that write and read raw memory directly to and from a file on disk, sidestepping C++'s standard text-formatting streams. You will learn how to bypass string conversion to save structured data as exact byte copies, how to navigate to specific offsets within a file without reading the entire contents, and how the Resource Acquisition Is Initialization (RAII) pattern guarantees file handles are safely released even when errors interrupt the program. All code in this lesson is throwaway and will be discarded once the concepts are proven.

**What you need to know first**
- C++ From Scratch (RAII, exceptions, memory model, basic `sizeof`).

**Terms used in this lesson**
- **Text Mode** — the default behavior of C++ file streams where newline characters are automatically translated between the program's internal representation (`\n`) and the operating system's expected line endings (like `\r\n` on Windows) during read and write operations. It exists to make plain text files portable across platforms, but it silently corrupts non-text data by altering bytes that happen to match newline ASCII values.
- **Binary Mode** — a file stream mode that disables all automatic character translation. It exists so that exactly the bytes requested for writing are written to the disk, and exactly the bytes on disk are read into memory, which is strictly required when saving raw memory structures, images, or custom data formats.
- **Stream Position Indicator** — an internal cursor maintained by the operating system for an open file, tracking the exact byte offset where the next read or write will occur. It exists so that sequential operations naturally advance through the file, and so that random access can be achieved by moving the cursor before an operation.
- **Resource Acquisition Is Initialization (RAII)** — a C++ design pattern where a resource (like an open file handle) is tied directly to the lifespan of a local object. It exists to guarantee that resources are cleanly released when the object goes out of scope, whether by normal return or because an exception was thrown, preventing resource leaks without requiring manual cleanup code.
- **Type Aliasing (via Cast)** — the act of telling the compiler to treat a pointer to one type of data as if it were a pointer to a different type. In binary I/O, it exists specifically to view structured types (like an `int` or a `struct`) as a flat array of raw `char` bytes so they can be written to disk byte-by-byte.

**Objects and methods used**

- **`std::ofstream`**
  - *What it is:* An output file stream class that writes data from the program to a file on disk.
  - *Implementation:* `class ofstream : public ostream { ... };`
  - *Its use:* Used to open a file for writing and send bytes to it.

- **`std::ifstream`**
  - *What it is:* An input file stream class that reads data from a file on disk into the program.
  - *Implementation:* `class ifstream : public istream { ... };`
  - *Its use:* Used to open a file for reading and extract bytes from it into memory.

- **`std::ios::binary`**
  - *What it is:* A stream open mode flag.
  - *Implementation:* A constant of type `std::ios_base::openmode`.
  - *Its use:* Passed to the constructor or `open()` method of a file stream to instruct it to operate in binary mode, disabling newline translation.

- **`std::ostream::write`**
  - *What it is:* An unformatted output function.
  - *Implementation:* `ostream& write(const char* s, streamsize n);`
  - *Its use:* Used to write a specific number of raw, unformatted bytes directly from memory into the file stream.

- **`std::istream::read`**
  - *What it is:* An unformatted input function.
  - *Implementation:* `istream& read(char* s, streamsize n);`
  - *Its use:* Used to read a specific number of raw bytes directly from the file stream into memory.

- **`reinterpret_cast`**
  - *What it is:* A C++ cast operator that performs low-level reinterpretation of bit patterns.
  - *Implementation:* `reinterpret_cast<new_type>(expression)`
  - *Its use:* Used to convert a pointer to an arbitrary data type (like `int*`) into a `char*` so that `write` and `read` can process the memory as a sequence of bytes.

- **`std::istream::seekg` / `std::ostream::seekp`**
  - *What it is:* Functions that move the stream's internal position indicator.
  - *Implementation:* `istream& seekg(off_type off, ios_base::seekdir dir);` and `ostream& seekp(pos_type pos);`
  - *Its use:* Used to jump to a specific byte offset in the file before reading (`seekg`, "seek get") or writing (`seekp`, "seek put").

- **`std::istream::tellg`**
  - *What it is:* A function that reports the stream's current position indicator.
  - *Implementation:* `pos_type tellg();`
  - *Its use:* Used to determine the current byte offset in the file, often to find the total file size after seeking to the end.

**Everything else in the file, not this lesson's subject but still explained:**

- **`sizeof`**
  - *What it is:* A compile-time operator that computes the size of a type or object in bytes.
  - *Implementation:* `sizeof(type)` or `sizeof expression`
  - *Its use:* Used to calculate exactly how many bytes need to be written or read for a specific data structure.

- **`std::runtime_error`**
  - *What it is:* A standard exception class for errors that can only be detected at runtime.
  - *Implementation:* `class runtime_error : public exception { ... };`
  - *Its use:* Thrown to demonstrate RAII cleanup when an error interrupts the program sequence.

---

## Concept Unit: Unformatted Binary Output and Input

### The Problem
When we use the standard `<<` and `>>` operators with file streams, C++ formats the data as human-readable text. If we output the integer `12345`, C++ writes the five ASCII characters `'1'`, `'2'`, `'3'`, `'4'`, `'5'` (5 bytes). Furthermore, in text mode, the operating system silently translates newline characters, mutating the data stream. When saving exact memory structures — like an image format, an audio file, or a densely packed database record — we cannot afford translation or string conversion. We must dump the exact literal bytes from RAM directly to the hard drive, and read them back identically.

### Introduce the concept in isolation
We will write an integer's raw memory footprint to a file, then read those exact bytes back into a new integer, proving that no text formatting occurred.

```cpp
#include <fstream>
#include <iostream>

void write_raw_int() {
    int value_to_write = 12345;
    std::ofstream out_file("data.bin", std::ios::binary);
    out_file.write(reinterpret_cast<char*>(&value_to_write), sizeof(value_to_write));
    out_file.close();

    int read_value = 0;
    std::ifstream in_file("data.bin", std::ios::binary);
    in_file.read(reinterpret_cast<char*>(&read_value), sizeof(read_value));
    
    std::cout << "Read value: " << read_value << "\n";
}

int main() {
    write_raw_int();
    return 0;
}
```
Output:
```
Read value: 12345
```
This output proves that the exact byte pattern representing `12345` was saved to disk and restored perfectly into `read_value` without ever being converted to the text string `"12345"`.

### Discard the throwaway example
We have proven how `write` and `read` work in isolation. This throwaway example is discarded and will not be carried forward.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition because this lesson is built entirely of isolated conceptual proofs.
- **Files affected:** `main.cpp` (created).
- **Change type:** Add.
- **Location:** Inside `main.cpp`.
- **Dependencies:** Standard library `<fstream>`.

### The New Code
```cpp
int original = 8675309;
std::ofstream out("raw.bin", std::ios::binary);
out.write(reinterpret_cast<char*>(&original), sizeof(original));
```

### The Updated Project
Because this is an isolated proof, the entire file `main.cpp` serves as the structure:
```cpp
#include <fstream>

int main() {
    int original = 8675309;
    std::ofstream out("raw.bin", std::ios::binary);
    out.write(reinterpret_cast<char*>(&original), sizeof(original)); // ← new
    return 0;
}
```
This block opens a file handle in binary mode and dumps the literal four bytes of the integer `original` directly to disk.

### Mechanical walkthrough

- `int` — the standard 32-bit integer type.
- `original` — the local variable storing our integer value.
- `= 8675309;` — the assignment operator and the numeric literal value being assigned.
- `std::ofstream` — the standard output file stream class. It manages the operating system file handle and provides the interface for pushing data to disk.
- `out` — the local variable name for our output stream instance.
- `("raw.bin", ...)` — the constructor arguments. `"raw.bin"` is the target file name.
- `std::ios::binary` — a stream open mode flag. It explicitly disables the default text mode behavior, ensuring that if our raw data happens to contain a byte that matches the ASCII newline character, the operating system will not silently mutate it into a `\r\n` sequence.
- `out.write(...)` — an unformatted output method. Unlike the `<<` operator which converts numbers to text strings, `write` takes a raw memory address and a byte count, and blindly copies those exact bits to the file.
- `reinterpret_cast<char*>` — a low-level C++ cast operator that tells the compiler to treat a pointer of one type as a pointer to another completely unrelated type. Here, it is the mechanism that allows us to view structured data as a flat array of bytes.
- `(&original)` — the memory address of our integer variable. We must pass a pointer, not the value itself, because `write` needs to know where in memory the bytes live.
- `sizeof(original)` — a compile-time operator that calculates the exact number of bytes the type `int` occupies (typically 4 bytes). We pass this to `write` so it knows exactly how many bytes to pull from memory starting at the provided pointer.

### CS Lens
This is the concept of **Serialization**. Serialization is the process of translating complex, structured data in active memory into a flat, sequential format that can be stored or transmitted, and later reconstructed identically. 
Also recognized in: network packet construction, saving game states, marshaling data between processes, GPU texture uploads.

### SE Lens
The design principle here is **Type Punning vs. Safety**. C++'s type system strongly resists letting you treat an `int` as if it were a `char`. By forcing you to use `reinterpret_cast`, the language makes the violation explicit and searchable. The alternative — allowing any pointer to be silently passed to a byte-writing function — would lead to catastrophic silent errors where developers accidentally pass values instead of pointers, or pointers to the wrong structures. The tradeoff is verbosity: binary I/O in C++ requires explicitly stating "I know this is an integer, but I am intentionally bypassing the type system to read its raw bytes."

### Commands needed to make this unit real
```bash
g++ -std=c++17 main.cpp -o main
./main
```
- `g++`: The GNU C++ compiler.
- `-std=c++17`: Instructs the compiler to use the C++17 standard.
- `main.cpp`: The source file to compile.
- `-o main`: Names the compiled executable `main`.
- `./main`: Executes the resulting program.

### Run it
```
(No terminal output, but a 4-byte file named 'raw.bin' is created on disk)
```

### One sentence connecting this unit to what came immediately before.
Now that we can blindly write a block of memory to disk, we need a way to navigate around a file that contains many such blocks without reading them all sequentially.

---

## Concept Unit: Stream Positioning (Seeking)

### The Problem
When a file is opened, the operating system maintains a hidden cursor that tracks exactly where the next read or write will occur. By default, every operation advances this cursor sequentially. If a file contains one million integers and we only want to read the 500,000th one, reading the first 499,999 integers just to advance the cursor is an unacceptable waste of time and memory. We need to tell the operating system to move the cursor directly to a specific byte offset.

### Introduce the concept in isolation
We will write three distinct integers to a file, then use seeking to jump directly to the third integer and read it, bypassing the first two entirely. We will also use `tellg` to ask the file for its total size.

```cpp
#include <fstream>
#include <iostream>

void demonstrate_seek() {
    // Write three integers
    std::ofstream out("array.bin", std::ios::binary);
    int data[3] = {10, 20, 30};
    out.write(reinterpret_cast<char*>(data), sizeof(data));
    out.close();

    std::ifstream in("array.bin", std::ios::binary);
    
    // Seek to the end and get the file size
    in.seekg(0, std::ios::end);
    std::streampos size = in.tellg();
    std::cout << "File size: " << size << " bytes\n";
    
    // Jump past the first two integers (2 * sizeof(int) bytes) from the beginning
    in.seekg(2 * sizeof(int), std::ios::beg);
    
    int read_value = 0;
    in.read(reinterpret_cast<char*>(&read_value), sizeof(read_value));
    
    std::cout << "Jumped to read value: " << read_value << "\n";
}

int main() {
    demonstrate_seek();
    return 0;
}
```
Output:
```
File size: 12 bytes
Jumped to read value: 30
```
This output proves that the internal file cursor was successfully repositioned, allowing us to read exactly the bytes representing `30` without ever processing `10` or `20`, and proving we can dynamically query the cursor position.

### Discard the throwaway example
The concept of random access is proven. This throwaway code is discarded.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `main.cpp` (modified).
- **Change type:** Replace.
- **Location:** Replacing the previous `main` function body.
- **Dependencies:** None.

### The New Code
```cpp
std::ifstream in("array.bin", std::ios::binary);
in.seekg(0, std::ios::end);
std::streampos file_size = in.tellg();
in.seekg(0, std::ios::beg);
```

### The Updated Project
```cpp
#include <fstream>

int main() {
    std::ifstream in("array.bin", std::ios::binary);
    in.seekg(0, std::ios::end); // ← new
    std::streampos file_size = in.tellg(); // ← new
    in.seekg(0, std::ios::beg); // ← new
    
    // The cursor is now reset, ready to read from the start
    return 0;
}
```
This opens an existing binary file, uses a jump to the end to measure the file's total size, and safely resets the read cursor to the beginning.

### Mechanical walkthrough

- `std::ifstream` — the standard input file stream class. It provides the interface for pulling data from a file on disk into memory.
- `in` — the local variable name for the input stream.
- `("array.bin", std::ios::binary)` — constructor arguments opening the file named `array.bin` in binary mode to prevent text translation.
- `in.seekg(...)` — the stream method that repositions the read cursor ("seek get"). It directly commands the operating system to change the file descriptor's byte offset.
- `0` — the offset value for the seek operation. Here, zero bytes away from the chosen anchor point.
- `std::ios::end` — a standard constant indicating the absolute end of the file. Passed as the second argument to `seekg`, it acts as the anchor point.
- `std::streampos` — the specific return type of stream positioning functions, capable of holding file sizes much larger than a standard integer.
- `file_size` — the variable storing the returned size in bytes.
- `in.tellg()` — "tell get". A method that returns the read cursor's current byte offset from the start of the file. Because we just moved the cursor to the exact end, querying the cursor's location effectively reveals the total size of the file.
- `in.seekg(0, std::ios::beg)` — a subsequent call to reposition the cursor. Moving it `0` bytes from the beginning (`std::ios::beg`) acts as a reset, ensuring any upcoming `in.read()` calls start cleanly at the first byte.

### CS Lens
This is the concept of **Random Access**. Random access means the time it takes to reach an element is constant, regardless of its position in the dataset.
Also recognized in: RAM (Random Access Memory) addressing, database index lookups, seeking in a video player, jumping to a specific sector on a hard drive.

### SE Lens
The design principle here is **O(1) Time Complexity via Pointer Arithmetic**. The alternative — reading every byte sequentially until the target is found, or reading the entire file into a buffer to measure its length — is an O(N) operation, which degrades fatally as the file size grows. By commanding the operating system to modify its internal offset cursor mathematically, the software can jump anywhere instantly. The cost is inflexibility: if records had variable lengths (like arbitrary strings), mathematical seeking would be impossible, and we would be forced to parse the file sequentially or build a separate lookup index.

### Commands needed to make this unit real
```bash
g++ -std=c++17 main.cpp -o main
./main
```

### Run it
```
(No terminal output, but the program safely measures the file and resets the cursor)
```

### One sentence connecting this unit to what came immediately before.
With the ability to open files and jump around them at will, we must now ensure that the operating system resources behind these streams are safely released, even when reading or seeking fails abruptly.

---

## Concept Unit: File Handles and RAII

### The Problem
When a program opens a file, the operating system allocates a file handle — a limited, system-wide resource that locks the file to prevent conflicts. If the program fails to release that handle, the file remains locked, preventing other programs from accessing it and eventually exhausting the system's handle pool. If we manually call `file.close()` at the end of our function, everything seems fine — until an exception is thrown halfway through. If an exception interrupts the execution path, the code jumps directly to the nearest `catch` block, skipping our manual `close()` call entirely, and permanently leaking the file handle.

### Introduce the concept in isolation
We will open a file, throw an exception before closing it, and prove that C++ automatically closes the file during the exception unwind process.

```cpp
#include <fstream>
#include <iostream>
#include <stdexcept>

void dangerous_operation() {
    std::ofstream out("safe.txt");
    std::cout << "File opened.\n";
    
    // An error occurs before we can ever call out.close()
    throw std::runtime_error("Simulated catastrophic failure");
    
    out.close(); // This line is permanently unreachable
}

int main() {
    try {
        dangerous_operation();
    } catch (const std::exception& e) {
        std::cout << "Caught exception: " << e.what() << "\n";
    }
    
    // Prove the file is closed by successfully opening it again
    std::ofstream check("safe.txt");
    if (check.is_open()) {
        std::cout << "File was successfully released and reopened!\n";
    }
    
    return 0;
}
```
Output:
```
File opened.
Caught exception: Simulated catastrophic failure
File was successfully released and reopened!
```
This output proves that even though the manual `close()` line was bypassed by the exception, the file handle was still properly released back to the operating system, allowing it to be immediately reopened.

### Discard the throwaway example
The automatic cleanup behavior is proven. The throwaway code is discarded.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `main.cpp` (modified).
- **Change type:** Replace.
- **Location:** Replacing the previous `main` function body.
- **Dependencies:** `<stdexcept>`.

### The New Code
```cpp
void process_file() {
    std::ifstream in("data.bin", std::ios::binary);
    if (!in) {
        throw std::runtime_error("File not found");
    }
    // No in.close() is written here.
}
```

### The Updated Project
```cpp
#include <fstream>
#include <stdexcept>

void process_file() {
    std::ifstream in("data.bin", std::ios::binary); // ← new
    if (!in) {
        throw std::runtime_error("File not found"); // ← new
    }
    // No in.close() is written here.
}

int main() {
    try {
        process_file();
    } catch (...) {}
    return 0;
}
```
This function safely handles a file resource without ever explicitly closing it, relying entirely on the scope boundary to manage the lifecycle.

### Mechanical walkthrough

- `void` — the return type indicating `process_file` returns no value.
- `process_file()` — the function declaration.
- `std::ifstream` — the standard input file stream class.
- `in` — our local file stream object. When this line runs, the object is constructed on the stack, and its constructor immediately asks the operating system for a file handle. This is the "Acquisition Is Initialization" part of RAII.
- `("data.bin", std::ios::binary)` — constructor arguments opening the file named `data.bin` in binary mode to prevent text translation.
- `if` — the standard conditional statement.
- `(!in)` — the logical NOT operator applied to the stream object. The stream class overloads this operator to evaluate to true if the file failed to open (e.g., the file does not exist).
- `throw` — the C++ keyword that immediately halts current execution and raises an exception up the call stack, looking for a matching `catch` block.
- `std::runtime_error(...)` — a standard exception class representing an error that can only be detected while the program is running.
- **Hidden behavior:** When `process_file` ends — either by returning normally or by throwing an exception — the local object `in` goes out of scope. When a C++ object goes out of scope, the compiler automatically invokes its destructor. The destructor for `std::ifstream` contains the hardcoded instruction to release the operating system file handle. This guarantees the resource is freed no matter how the function exits.

Execution trace for the exception path:
1. `std::ifstream in("data.bin", std::ios::binary)` — the object is created on the stack and acquires the file handle.
2. `throw std::runtime_error(...)` — the normal control flow is violently interrupted.
3. *Stack Unwinding* — before jumping to the `catch` block, C++ destroys all local objects in the aborted scope. The `in` object's destructor fires, executing an automatic `close()` and safely releasing the file handle.

### CS Lens
This is the concept of **Deterministic Finalization**. Unlike garbage-collected languages where cleanup happens at some unknown future time when memory is low, C++ guarantees that destructors run at the exact, mathematically predictable moment an object goes out of scope.
Also recognized in: database transaction rollbacks on failure, releasing mutex locks, closing network sockets.

### SE Lens
The design principle here is **Resource Acquisition Is Initialization (RAII)**. The alternative — relying on the programmer to manually write `close()` or `release()` on every possible exit path, including error states — is a proven mathematical impossibility in large systems; humans will inevitably forget one. By tying the resource's lifespan strictly to the automatic scoping rules of the language, the compiler enforces the cleanup automatically. The tradeoff is that classes managing resources must be carefully designed with proper destructors, but the benefit is complete immunity to resource leaks even during catastrophic failures.

### Commands needed to make this unit real
```bash
g++ -std=c++17 main.cpp -o main
./main
```

### Run it
```
(No output, program exits cleanly having safely managed the file resource)
```

### One sentence connecting this unit to what came immediately before.
Because RAII guarantees our files will never be leaked, we can confidently read and seek through raw binary data without littering our logic with fragile manual cleanup code.

---

## Closing

- **Connect the pieces** — To process a structured binary file, we open a `std::ifstream` with `std::ios::binary` which immediately locks the file and relies on RAII to ensure it will close later. We use `seekg` to jump the internal cursor directly to the relevant byte offset. We then use `read` combined with `reinterpret_cast<char*>` to pull the exact raw memory footprint off the disk into a typed C++ variable, safely bypassing text formatting and ensuring no resources are leaked when the function finishes.
- **What breaks without this** — If you remove `std::ios::binary` when writing the integer `10`, and your system writes newline translations, the raw bytes written might silently mutate from `0A 00 00 00` to `0D 0A 00 00 00` on Windows, corrupting the integer so that reading it back produces complete garbage data. If you omit RAII practices and rely on manual `close()` calls, any unhandled error will permanently lock the file.
- **Exercises** — 
  1. Write an array of 5 floating-point numbers to a file using `write`.
  2. Use `seekp` (seek put) to jump the write cursor to the 3rd float's position and overwrite it with a new value without modifying the rest of the file.
  3. Read the file back to verify the specific modification worked.
- **Definition of done** — 
  - [x] Raw memory can be dumped to disk without text translation.
  - [x] The read cursor can be mathematically repositioned for O(1) random access.
  - [x] File resources are guaranteed to release on error via RAII.
  - `git commit -m "Prove binary I/O and RAII file handling mechanics"`
