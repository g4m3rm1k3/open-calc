const ARRAYS_CODE = `#include <iostream>
#include <string>
#include <array>    // std::array (C++11)
using namespace std;

// __OUTPUT__: --- C-style array ---\\nscores: 85 92 78 95 88 \\nHighest: 95\\nAverage: 87.6\\n--- std::array (safer) ---\\nfib: 0 1 1 2 3 5 8 13 21 34 \\n--- String operations ---\\nOriginal: Hello, World!\\nLength: 13\\nUpper-case first char: H\\nSubstring: World\\nFound at index: 7\\nReversed: !dlroW ,olleH\\n--- String building ---\\nFull name: Alice Smith\\nGreeting: Hello, Alice Smith!

int main() {
    // ── C-style array ──────────────────────────────────────────
    cout << "--- C-style array ---" << endl;
    int scores[5] = {85, 92, 78, 95, 88};
    cout << "scores: ";
    for (int i = 0; i < 5; i++) cout << scores[i] << " ";
    cout << endl;

    int highest = scores[0];
    double total = 0;
    for (int i = 0; i < 5; i++) {
        if (scores[i] > highest) highest = scores[i];
        total += scores[i];
    }
    cout << "Highest: " << highest << endl;
    cout << "Average: " << total / 5 << endl;

    // ── std::array ─────────────────────────────────────────────
    cout << "--- std::array (safer) ---" << endl;
    array<int, 10> fib = {0,1,1,2,3,5,8,13,21,34};
    cout << "fib: ";
    for (int n : fib) cout << n << " ";
    cout << endl;

    // ── std::string operations ─────────────────────────────────
    cout << "--- String operations ---" << endl;
    string s = "Hello, World!";
    cout << "Original: "  << s << endl;
    cout << "Length: "    << s.length() << endl;
    cout << "Upper-case first char: " << (char)toupper(s[0]) << endl;
    cout << "Substring: " << s.substr(7, 5) << endl;       // "World"
    cout << "Found at index: " << s.find("World") << endl; // 7

    // Reverse
    string rev = string(s.rbegin(), s.rend());
    cout << "Reversed: " << rev << endl;

    // ── String building ────────────────────────────────────────
    cout << "--- String building ---" << endl;
    string first = "Alice", last = "Smith";
    string full = first + " " + last;
    cout << "Full name: "  << full << endl;
    cout << "Greeting: Hello, " << full << "!" << endl;

    return 0;
}`;

const lesson = {
  id: "cpp-0-008",
  slug: "arrays-and-strings",
  chapter: "cpp-0",
  order: 8,
  title: "Arrays and Strings",
  subtitle: "Store sequences of data with C-arrays, std::array, and std::string",
  tags: ["c++", "cpp", "arrays", "strings", "std::string", "std::array", "indexing", "substring"],
  aliases: [
    "c++ arrays",
    "c++ string operations",
    "c++ array iteration",
    "c++ array vs vector",
    "string manipulation c++",
  ],

  hook: `Almost every real program processes collections of data: a list of scores, a sentence to parse, a buffer of network bytes. Arrays and strings are the two most fundamental collection types. Understanding their memory layout — contiguous bytes — explains both their performance characteristics and their pitfalls (buffer overflows, off-by-one errors, null termination).`,

  mentalModel: [
    "**An array is a contiguous block of memory holding elements of the same type.** `int scores[5]` reserves exactly 5 × 4 = 20 bytes. Elements are accessed by index starting at 0: `scores[0]` through `scores[4]`. The index is just an offset: `scores[i]` is the value at memory address `scores + i * sizeof(int)`. This is why array access is O(1) — it's just address arithmetic.",
    "**Arrays don't know their own size.** C-style arrays decay to a pointer when passed to a function — the size information is lost. You must pass the size separately: `void print(int arr[], int n)`. `std::array<int, 5>` (C++11) wraps a C-array and preserves the size, providing `.size()`. `std::vector` (next lesson) adds dynamic resizing. Prefer `std::array` over C-arrays, `std::vector` over both for most cases.",
    "**`std::string` is a sequence of characters with a rich interface.** Unlike C strings (`char*`), `std::string` knows its own length, manages its memory, and supports operations like `+` (concatenation), `==` (comparison), `.substr()`, `.find()`, and `.at()` (bounds-checked indexing). The underlying data is still a contiguous char array — `s.data()` gives you a pointer to it.",
  ],

  intuition: {
    prose: [
      "**Array bounds are your responsibility.** `int arr[5]; arr[5] = 10;` is undefined behavior — you're writing one element past the end of the array. The compiler doesn't check bounds at runtime (by default). This is a *buffer overflow* — one of the most common security vulnerabilities in C/C++ programs. `std::array::at(i)` and `std::vector::at(i)` perform bounds checking and throw `std::out_of_range` if `i` is invalid. Use `.at()` during development to catch bugs.",
      "**String indexing with `[]` vs `.at()`.** `s[i]` accesses character i with no bounds check — reading `s[s.length()]` is technically undefined (though it returns `\\0` for `std::string` by convention). `s.at(i)` throws `std::out_of_range` if `i >= s.length()`. In performance-critical loops, use `[]`; in defensive code, use `.at()`.",
      "**`std::string` is both a sequence and a value type.** Unlike Java/Python strings, C++ strings are mutable — you can modify individual characters with `s[i] = 'A'`. String comparison with `==` compares content (not addresses). Two different `std::string` objects holding `\"hello\"` are `==`. This is different from C strings where `str1 == str2` compares pointers, not content.",
      "**Multidimensional arrays** are arrays of arrays. `int matrix[3][4]` is a 3×4 grid of integers, laid out in row-major order (row 0 complete, then row 1, etc.). Access: `matrix[row][col]`. Pass to functions: `void f(int m[][4], int rows)` — the inner dimension must be known at compile time. For variable-size 2D data, prefer `vector<vector<int>>`.",
    ],
    visualizations: [
      {
        id: "CppLab",
        mathBridge:
          "**Explore arrays and strings:**\n\n1. Compile and run — study each operation\n2. Try accessing `scores[5]` (out of bounds) — what happens? (undefined behavior, might crash or give garbage)\n3. Sort the scores array manually using a nested loop (bubble sort)\n4. Count how many characters in `\"Hello, World!\"` are uppercase using a range-based for\n5. Try `s.replace(7, 5, \"C++\")` to replace `World` with `C++`\n6. Build a new string using += in a loop: `for (char c : original) if (isupper(c)) result += c;`",
        props: {
          mainFile: "main.cpp",
          initialFiles: {
            "/home/user/main.cpp": ARRAYS_CODE,
          },
        },
      },
    ],
  },

  rigor: {
    prose: [
      "**Memory layout matters for performance.** Arrays are cache-friendly — elements are packed contiguously, so iterating linearly loads them into CPU cache one cache line at a time (~64 bytes = 16 ints). Accessing random indices in a large array causes cache misses. For performance-critical code, traversing a 2D array row-by-row (matching C++'s row-major layout) is significantly faster than column-by-column.",
      "**`std::string` has small-string optimization (SSO).** For short strings (typically ≤ 15 characters), `std::string` stores the characters directly inside the object — no heap allocation. For longer strings, it allocates on the heap. This means short string operations are very fast. It also means comparing string sizes matters: copying a 5-char string is nearly free; copying a 1MB string is expensive. Use `std::move` or `const&` for large strings.",
      "**String conversions.** `std::to_string(42)` converts integers and doubles to strings. `std::stoi(\"42\")` parses an integer from a string (throws `std::invalid_argument` if it fails). `std::stod` for doubles. These are safer than C's `atoi` (which returns 0 on failure with no error indication) and `sprintf`/`sscanf` (which use format strings and are error-prone). Prefer the C++ standard library functions.",
    ],
    callouts: [
      {
        type: "warning",
        title: "Array bounds overflow is silent and dangerous",
        body: "Reading or writing past array bounds is undefined behavior — C++ doesn't check bounds at runtime. The program might silently corrupt memory, crash later with an unrelated error, or seem to work fine. Use `-fsanitize=address` when compiling for development to catch buffer overflows automatically: `g++ -fsanitize=address -g main.cpp`.",
      },
      {
        type: "info",
        title: "C-string vs std::string",
        body: "`\"hello\"` is a C string literal — a `const char*` pointing to 6 bytes ('h','e','l','l','o','\\0'). C strings are null-terminated: the end is marked by a zero byte. `std::string` knows its length and handles null bytes internally. Mixing them: `std::string s = \"hello\"` works (string constructed from C-string). `s.c_str()` gives back a C string for legacy APIs.",
      },
      {
        type: "tip",
        title: "String find returns string::npos on not-found",
        body: "`s.find(\"xyz\")` returns `std::string::npos` (a very large value, typically `size_t(-1)`) when the substring is not found. Always compare against `npos`: `if (s.find(\"hello\") != string::npos)`. Don't compare against -1 or check for truthiness — `npos` is unsigned and may not behave as expected.",
      },
    ],
  },

  examples: [
    {
      title: "Array algorithms: sort, search, reverse",
      body: `int arr[] = {5, 2, 8, 1, 9, 3};
int n = 6;

// Bubble sort
for (int i = 0; i < n-1; i++) {
    for (int j = 0; j < n-i-1; j++) {
        if (arr[j] > arr[j+1]) {
            int tmp = arr[j];
            arr[j] = arr[j+1];
            arr[j+1] = tmp;
        }
    }
}
// arr is now {1, 2, 3, 5, 8, 9}

// Linear search
int target = 8;
int idx = -1;
for (int i = 0; i < n; i++) {
    if (arr[i] == target) { idx = i; break; }
}

// Reverse in place
for (int i = 0, j = n-1; i < j; i++, j--) {
    int tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
}`,
    },
    {
      title: "String manipulation patterns",
      body: `string s = "  Hello, World!  ";

// Trim leading/trailing spaces (manual)
size_t start = s.find_first_not_of(" ");
size_t end   = s.find_last_not_of(" ");
string trimmed = s.substr(start, end - start + 1);
// "Hello, World!"

// Split on comma
string csv = "Alice,Bob,Charlie";
vector<string> names;
size_t pos = 0;
while ((pos = csv.find(',')) != string::npos) {
    names.push_back(csv.substr(0, pos));
    csv.erase(0, pos + 1);
}
names.push_back(csv);  // last element

// Convert to uppercase (in place)
for (char& c : s) c = toupper(c);

// Count occurrences of a char
int count = 0;
for (char c : s) if (c == 'l') count++;`,
    },
    {
      title: "2D array: matrix operations",
      body: `const int ROWS = 3, COLS = 3;
int A[ROWS][COLS] = {{1,2,3},{4,5,6},{7,8,9}};
int B[ROWS][COLS] = {{9,8,7},{6,5,4},{3,2,1}};
int C[ROWS][COLS] = {};   // zero-initialized

// Matrix addition: C = A + B
for (int i = 0; i < ROWS; i++)
    for (int j = 0; j < COLS; j++)
        C[i][j] = A[i][j] + B[i][j];

// Print matrix
for (int i = 0; i < ROWS; i++) {
    for (int j = 0; j < COLS; j++)
        cout << C[i][j] << " ";
    cout << endl;
}
// 10 10 10
// 10 10 10
// 10 10 10`,
    },
  ],

  challenges: [
    {
      difficulty: "easy",
      problem:
        "Write a program that reads 5 integers into an array, then prints: (1) the minimum, (2) the maximum, (3) the range (max - min), (4) all elements in reverse order. Don't use std::sort or any library functions — implement the min/max search yourself.",
      hint: "Initialize min and max to arr[0]. Loop from index 1. For reverse, loop from index 4 down to 0.",
      walkthrough: [
        "Read 5 ints: `for (int i = 0; i < 5; i++) cin >> arr[i]`",
        "Initialize minVal = maxVal = arr[0]",
        "Loop i=1 to 4: compare arr[i] with minVal and maxVal",
        "Reverse: for (int i = 4; i >= 0; i--) print arr[i]",
      ],
    },
    {
      difficulty: "medium",
      problem:
        "Write a Caesar cipher: read a string and a shift amount (1-25), then encrypt by shifting each letter by `shift` positions (wrapping: 'z' + 1 = 'a', 'Z' + 1 = 'A'). Print the encrypted string. Then decrypt by shifting backward. Hint: use `(c - 'a' + shift) % 26 + 'a'` for lowercase.",
      hint: "Check `if (islower(c))` and `if (isupper(c))` to handle case separately. Non-letters pass through unchanged.",
      walkthrough: [
        "Read string and int shift",
        "For each char c in the string: if islower, c = (c - 'a' + shift) % 26 + 'a'; if isupper, same with 'A'",
        "Print encrypted; then shift by (26 - shift) % 26 to decrypt",
      ],
    },
  ],

  assessment: {
    questions: [
      {
        id: "cpp0-008-q1",
        type: "choice",
        text: "What is the valid index range for `int arr[10]`?",
        options: [
          "1 to 10",
          "0 to 10",
          "0 to 9",
          "1 to 9",
        ],
        answer: 2,
        explanation:
          "C++ arrays are 0-indexed. `arr[0]` through `arr[9]` are valid. `arr[10]` is one past the end — undefined behavior. A 10-element array has indices 0, 1, ..., n-1 where n=10.",
      },
      {
        id: "cpp0-008-q2",
        type: "choice",
        text: "What value does `s.find(\"xyz\")` return when `\"xyz\"` is not in `s`?",
        options: [
          "-1",
          "0",
          "`std::string::npos`",
          "The length of s",
        ],
        answer: 2,
        explanation:
          "`find()` returns `std::string::npos` (maximum value of `size_t`, effectively -1 as unsigned) when not found. Always compare with `!= string::npos`, not with `-1` or truthiness check.",
      },
      {
        id: "cpp0-008-q3",
        type: "choice",
        text: "What's the advantage of `std::array<int,5>` over `int arr[5]`?",
        options: [
          "std::array uses less memory",
          "std::array is dynamically resizable",
          "std::array knows its size (.size()), supports copy/assignment, and can be passed to functions without losing size",
          "std::array performs bounds checking by default with []",
        ],
        answer: 2,
        explanation:
          "`std::array` has the same fixed-size performance as C arrays but adds `.size()`, copy/assignment operators, range-based for support, and can be passed to template functions. It does NOT resize. Bounds checking with `[]` is not guaranteed; use `.at()` for that.",
      },
      {
        id: "cpp0-008-q4",
        type: "choice",
        text: "What does `s.substr(3, 4)` return for `s = \"Hello, World!\"`?",
        options: [
          "\"lo, \"",
          "\"Hello\"",
          "\"World\"",
          "\"lo, W\"",
        ],
        answer: 0,
        explanation:
          "`substr(start, length)` — starting at index 3 for 4 characters: s[3]='l', s[4]='o', s[5]=',', s[6]=' ' — gives `\"lo, \"`. Note: it's (starting index, length), not (start, end).",
      },
    ],
  },
};

export default lesson;
