# The Stream Model: Input and Output in C++

In 1969, Ken Thompson and Dennis Ritchie at Bell Labs built Unix around a radical idea: **everything is a file**. Disk files, network connections, terminals, printers — all of them exposed through the same interface of `read()` and `write()` system calls. This unification was so elegant that it shaped computing for the next five decades and beyond.

C++ inherited this philosophy and extended it. The `iostream` library doesn't just wrap `printf` and `scanf`. It introduces a unified **stream** abstraction where data flows in one direction — into or out of a source — and that source might be your terminal, a file on disk, a network socket, or even a string in memory. Learning streams properly means learning a model, not just a set of functions.

## Three Streams You Always Have

Every C++ program starts with three open streams, mirroring Unix's standard file descriptors:

- **`std::cin`** — standard input (file descriptor 0). By default, your keyboard.
- **`std::cout`** — standard output (file descriptor 1). By default, your terminal.
- **`std::cerr`** — standard error (file descriptor 2). Also your terminal, but unbuffered.

The separation of `cout` and `cerr` is deliberate and important. When you redirect output to a file (`./program > output.txt`), `cout` goes to the file but `cerr` still appears in your terminal. This means your program can silently write results to a file while still printing errors visibly to the developer. Good system programs always send diagnostics to `cerr`, never `cout`.

```cpp
#include <iostream>

int main() {
    std::cout << "This is normal output — goes to stdout" << std::endl;
    std::cerr << "This is an error message — goes to stderr" << std::endl;

    // In the terminal, try: ./program > output.txt
    // cout will be captured, cerr will still print to screen
}
```

## Why `<<` and `>>` for I/O?

If you come from Python or Java, you might expect output to look like `print("hello")` or `System.out.println("hello")`. Instead, C++ uses `cout << "hello"`. That `<<` is peculiar. What is it?

It's the **bitwise left-shift operator**, repurposed through operator overloading. In C, `a << b` shifts the bits of `a` left by `b` positions. Bjarne Stroustrup, designing the stream interface for C++ in the early 1980s, overloaded this operator for streams because visually, `<<` suggests data flowing to the left — into `cout`. `>>` suggests data flowing out — from `cin` into your variable.

This was controversial. Using operators for non-arithmetic purposes felt like abuse. But it worked beautifully: the `<<` operator returns the stream itself, enabling **chaining**:

```cpp
#include <iostream>

int main() {
    int age = 25;
    std::string name = "Alice";

    // Each << returns cout, so we can chain indefinitely
    std::cout << "Name: " << name << ", Age: " << age << std::endl;

    // This is equivalent to:
    // (((std::cout << "Name: ") << name) << ", Age: ") << age) << std::endl;
}
```

The chaining works because `operator<<` returns a reference to the stream. It's a beautiful example of how operator overloading can make an interface feel natural.

## Reading Input: `cin` and Its Traps

Reading from `cin` with `>>` is deceptively simple:

```cpp
#include <iostream>

int main() {
    int x;
    std::cout << "Enter a number: ";
    std::cin >> x;
    std::cout << "You entered: " << x << std::endl;
}
```

But there's a subtle problem lurking here. The `>>` operator skips leading whitespace, reads a value, and **stops at the first non-matching character — leaving it in the buffer**. That leftover character is almost always a newline from pressing Enter.

This creates a classic bug when mixing `>>` with `getline`:

```cpp
#include <iostream>
#include <string>

int main() {
    int age;
    std::string name;

    std::cout << "Enter your age: ";
    std::cin >> age;  // Reads the number, leaves '\n' in buffer

    std::cout << "Enter your name: ";
    std::getline(std::cin, name);  // Immediately reads the leftover '\n' — name is empty!

    std::cout << "Name: '" << name << "', Age: " << age << std::endl;
}
```

The fix: call `std::cin.ignore()` after reading with `>>` to discard the leftover newline before using `getline`:

```cpp
#include <iostream>
#include <string>

int main() {
    int age;
    std::string name;

    std::cout << "Enter your age: ";
    std::cin >> age;
    std::cin.ignore();  // Discard the leftover newline

    std::cout << "Enter your name: ";
    std::getline(std::cin, name);

    std::cout << "Hello, " << name << "! You are " << age << " years old." << std::endl;
}
```

`getline` is preferred over `>>` for strings because `>>` stops at whitespace — it reads one word, not a full line. `std::getline(std::cin, name)` reads everything up to (but not including) the newline.

## Output Formatting

Raw `cout` output is fine for simple values, but real programs need control over formatting. The `<iomanip>` header provides **stream manipulators** — objects that modify how subsequent output is formatted:

```cpp
#include <iostream>
#include <iomanip>
#include <cmath>

int main() {
    double pi = M_PI;

    // Default output
    std::cout << pi << std::endl;  // 3.14159

    // Control decimal places
    std::cout << std::fixed << std::setprecision(10) << pi << std::endl;  // 3.1415926536

    // Scientific notation
    std::cout << std::scientific << std::setprecision(4) << pi << std::endl;  // 3.1416e+00

    // Integer formatting
    int n = 255;
    std::cout << std::dec << n << std::endl;  // 255 (decimal)
    std::cout << std::hex << n << std::endl;  // ff (hexadecimal)
    std::cout << std::oct << n << std::endl;  // 377 (octal)

    // Field width and fill character
    std::cout << std::dec;
    std::cout << std::setw(10) << std::setfill('0') << 42 << std::endl;  // 0000000042

    // Print a bool as true/false instead of 1/0
    std::cout << std::boolalpha << true << " " << false << std::endl;
}
```

Manipulators that affect subsequent output (like `fixed`, `hex`, `boolalpha`, `setprecision`) are **sticky** — they persist until you change them. `setw` is an exception — it applies only to the next output operation.

## String Streams: I/O Without I

One of the most powerful features of the stream model is that you can apply it to strings. `std::stringstream` lets you use the same `<<` and `>>` syntax to build or parse strings in memory:

```cpp
#include <iostream>
#include <sstream>
#include <iomanip>
#include <string>

int main() {
    // Building a formatted string
    std::ostringstream oss;
    oss << "The result is: " << std::fixed << std::setprecision(2) << 3.14159;
    std::string result = oss.str();
    std::cout << result << std::endl;

    // Parsing a string (like sscanf but type-safe)
    std::string data = "42 3.14 hello";
    std::istringstream iss(data);

    int i;
    double d;
    std::string s;
    iss >> i >> d >> s;

    std::cout << "Parsed: " << i << ", " << d << ", " << s << std::endl;
}
```

This is particularly useful for building complex strings before output, or for parsing structured text without bringing in a full parsing library.

## `cout` vs `printf`: Speed and Safety

C programmers often reach for `printf`. It's terser, and in some benchmarks, faster:

```cpp
#include <cstdio>
#include <iostream>

int main() {
    // C-style: fast, concise, but dangerous
    printf("Name: %s, Age: %d, Pi: %.4f", "Alice", 25, 3.14159);
    printf("\n");

    // C++ style: type-safe, extensible, but slightly more verbose
    std::cout << "Name: " << "Alice" << ", Age: " << 25 << ", Pi: " << 3.14159 << std::endl;
}
```

`printf`'s format string is checked at runtime — passing the wrong type causes undefined behavior and has been the source of countless security vulnerabilities (format string attacks). `cout` is type-safe: the compiler picks the right `operator<<` overload based on the type.

For new C++ code, prefer `cout` or — in C++20 — `std::format`:

```cpp
#include <iostream>
#include <format>

int main() {
    std::string msg = std::format("Name: {}, Age: {}, Pi: {:.4f}", "Alice", 25, 3.14159);
    std::cout << msg << std::endl;
}
```

`std::format` gives you the conciseness of `printf` with the type safety of `cout`. It's the future of C++ string formatting.

## Why Streams Matter Beyond I/O

The stream abstraction's real power is polymorphism. A function that accepts `std::ostream&` (a reference to any output stream) works identically whether called with `std::cout`, a file stream, or a string stream:

```cpp
#include <iostream>
#include <fstream>
#include <sstream>
#include <string>

// This function works with ANY output stream
void writeReport(std::ostream& out, const std::string& name, int score) {
    out << "Student: " << name << std::endl;
    out << "Score:   " << score << std::endl;
    out << "Grade:   " << (score >= 90 ? "A" : score >= 80 ? "B" : "C") << std::endl;
}

int main() {
    // Print to terminal
    writeReport(std::cout, "Alice", 95);

    // Capture to string
    std::ostringstream oss;
    writeReport(oss, "Bob", 82);
    std::string captured = oss.str();
    std::cout << std::endl << "Captured:" << std::endl << captured;
}
```

This is the Unix philosophy expressed in C++: write functions that operate on streams, not specific devices. Your code becomes composable, testable, and adaptable without modification.
