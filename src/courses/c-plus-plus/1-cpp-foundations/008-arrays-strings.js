const ARRAY_CODE = `#include <iostream>
using namespace std;

// __OUTPUT__: 85 92 78 95 88\\nHighest: 95\\nAverage: 87.6

int main() {
    int scores[5] = {85, 92, 78, 95, 88};

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

    return 0;
}`;

const STDARRAY_CODE = `#include <iostream>
#include <array>
using namespace std;

// __OUTPUT__: size = 5\\n10 20 30 40 50\\nfib: 0 1 1 2 3 5 8 13 21 34

int main() {
    // std::array knows its own size and supports range-based for
    array<int, 5> vals = {10, 20, 30, 40, 50};

    cout << "size = " << vals.size() << endl;
    for (int v : vals) cout << v << " ";
    cout << endl;

    array<int, 10> fib = {0, 1, 1, 2, 3, 5, 8, 13, 21, 34};
    cout << "fib: ";
    for (int n : fib) cout << n << " ";
    cout << endl;

    return 0;
}`;

const STRING_OPS_CODE = `#include <iostream>
#include <string>
using namespace std;

// __OUTPUT__: Hello, World!\\nlength: 13\\nchar at 7: W\\nsubstr: World\\nfound at: 7

int main() {
    string s = "Hello, World!";
    cout << s << endl;
    cout << "length: " << s.length() << endl;
    cout << "char at 7: " << s[7] << endl;

    // substr(start, length)
    cout << "substr: " << s.substr(7, 5) << endl;

    // find returns index, or string::npos if not found
    size_t pos = s.find("World");
    cout << "found at: " << pos << endl;

    return 0;
}`;

const STRING_BUILD_CODE = `#include <iostream>
#include <string>
using namespace std;

// __OUTPUT__: Alice Smith\\nHello, Alice Smith!\\nupper: HELLO\\ndigits: 5

int main() {
    string first = "Alice", last = "Smith";
    string full = first + " " + last;   // concatenation
    cout << full << endl;
    cout << "Hello, " << full << "!" << endl;

    // Convert to uppercase in place
    string s = "hello";
    for (char& c : s) c = toupper(c);
    cout << "upper: " << s << endl;

    // Count digits in a string
    string mixed = "a1b2c3d4e5";
    int digits = 0;
    for (char c : mixed) if (isdigit(c)) digits++;
    cout << "digits: " << digits << endl;

    return 0;
}`;

const lesson = {
  id: "cpp-0-008",
  slug: "arrays-and-strings",
  chapter: "cpp-0",
  order: 8,
  title: "Arrays and Strings",
  subtitle: "Fixed-size sequences and text — indexing, iteration, and common operations",
  tags: ["c++", "cpp", "arrays", "strings", "std::string", "std::array", "indexing", "substring"],
  aliases: [
    "c++ arrays",
    "c++ string operations",
    "c++ array iteration",
    "string manipulation c++",
    "c++ substr find",
  ],

  hook: `Almost every real program processes collections: a list of scores, a sentence to parse, a buffer of data. Arrays and strings are the two most fundamental collection types. Their key trait — contiguous memory — explains both their O(1) access speed and their pitfalls like out-of-bounds writes.`,

  mentalModel: [
    "**An array is a fixed-size contiguous block of same-type elements.** `int scores[5]` reserves exactly 5 × 4 = 20 bytes. Elements are 0-indexed: `scores[0]` through `scores[4]`. `scores[5]` is undefined behavior — C++ doesn't check bounds at runtime.",
    "**`std::array<T, N>` is a safer wrapper around a C array.** Same performance, same fixed size — but it knows its own size (`.size()`), supports copy/assignment, and works with range-based for. Prefer it over raw `int arr[]` in new code.",
    "**`std::string` is a smart sequence of characters.** Unlike C strings (`char*`), it knows its length, handles memory automatically, and supports `+` (concatenation), `==` (content comparison), `.substr()`, and `.find()`. It's mutable — you can change individual characters with `s[i] = 'X'`.",
  ],

  intuition: {
    prose: [
      "**C-style arrays are the foundation.** Fixed size declared at compile time, 0-based indexing, O(1) access via address arithmetic. The array name decays to a pointer — `scores` is the address of `scores[0]`. Iteration is just walking that pointer forward.",
    ],
    visualizations: [
      {
        id: "CppLab",
        mathBridge: "**Run it — then explore:**\n\n- Change the values. What happens to highest and average?\n- Try `scores[5] = 100` — that's out of bounds. Does it crash immediately or silently corrupt memory?\n- Add a loop to find the minimum: initialize `int lowest = scores[0]` and compare.\n- Compute the sum of squares: change `total += scores[i]` to `total += scores[i] * scores[i]`.",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": ARRAY_CODE },
        },
      },
      {
        id: "CppLab",
        mathBridge: "**std::array — run it then explore:**\n\n- Try `vals.at(10)` — unlike `vals[10]`, `.at()` throws an exception. What's the error message?\n- `std::array` supports assignment: `array<int,5> copy = vals;` — does modifying `copy[0]` affect `vals`?\n- Add `cout << vals.front() << \" \" << vals.back();` — first and last elements.\n- Try `vals.fill(0)` to zero all elements — then print.",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": STDARRAY_CODE },
        },
      },
    ],
  },

  rigor: {
    prose: [
      "**`std::string` operations.** `.length()` returns the number of characters. `s[i]` accesses character i (no bounds check). `.substr(start, len)` returns a new string of `len` chars starting at `start`. `.find(sub)` returns the starting index, or `string::npos` if not found — always compare with `!= string::npos`, not `-1`.",
      "**String building.** `+` concatenates strings. `+=` appends in-place. `to_string(42)` converts a number to string. `stoi(\"42\")` parses a string to int. Characters can be modified in place: `for (char& c : s) c = toupper(c)` uppercases every character.",
    ],
    visualizations: [
      {
        id: "CppLab",
        mathBridge: "**String operations — run it then explore:**\n\n- Try `s.substr(0, 5)` — what does that give?\n- Try `s.find(\"xyz\")` — what value does it return? Print it and compare to `string::npos`.\n- Add `s.replace(7, 5, \"C++\")` to replace \"World\" with \"C++\". What does s look like?\n- Try `s[0] = 'h'` — strings are mutable in C++.",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": STRING_OPS_CODE },
        },
      },
      {
        id: "CppLab",
        mathBridge: "**String building — run it then explore:**\n\n- Add `full += \"!\"` after building the full name. Does it append correctly?\n- Count vowels instead of digits: check `c == 'a' || c == 'e' || ...`\n- Try `string repeated = string(5, '*')` — creates `\"*****\"`. Print it.\n- Use `to_string(42)` and append it to a string: `\"Score: \" + to_string(score)`.",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": STRING_BUILD_CODE },
        },
      },
    ],
    callouts: [
      {
        type: "warning",
        title: "Array out-of-bounds is silent undefined behavior",
        body: "`arr[5]` on a 5-element array doesn't crash immediately — it silently reads/writes past the end and can corrupt memory in ways that cause bugs far from the root cause. Enable `-fsanitize=address` in development: `g++ -fsanitize=address main.cpp`.",
      },
      {
        type: "tip",
        title: "string::npos is not -1 (it's the max size_t value)",
        body: "`s.find()` returns `string::npos` when not found. `npos` is `size_t(-1)` — a very large unsigned number, not -1 signed. Always write `if (s.find(x) != string::npos)`. Comparing with `-1` or using it in boolean context gives wrong results.",
      },
    ],
  },

  examples: [
    {
      title: "Reverse an array in-place",
      body: `int arr[] = {1, 2, 3, 4, 5};
int n = 5;

for (int i = 0, j = n-1; i < j; i++, j--) {
    int tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
}
// arr is now {5, 4, 3, 2, 1}`,
    },
    {
      title: "String split on delimiter",
      body: `string csv = "Alice,Bob,Charlie";
vector<string> parts;
size_t pos = 0;
while ((pos = csv.find(',')) != string::npos) {
    parts.push_back(csv.substr(0, pos));
    csv.erase(0, pos + 1);
}
parts.push_back(csv);  // last token
// parts = {"Alice", "Bob", "Charlie"}`,
    },
  ],

  challenges: [
    {
      difficulty: "easy",
      problem:
        "Read 5 integers into an array, then print: (1) the minimum, (2) the maximum, (3) all elements in reverse order. Initialize min/max to `arr[0]` and compare from index 1.",
      hint: "For reverse: `for (int i = 4; i >= 0; i--) cout << arr[i]`.",
      walkthrough: [
        "Read 5 ints: for i = 0..4: cin >> arr[i]",
        "min = max = arr[0]",
        "Loop i=1..4: compare arr[i] with min and max",
        "Reverse loop: i = 4 down to 0",
      ],
    },
    {
      difficulty: "medium",
      problem:
        "Caesar cipher: read a string and a shift (1-25), encrypt by shifting each letter forward by `shift` positions (wrapping 'z' → 'a'). Use `(c - 'a' + shift) % 26 + 'a'` for lowercase. Handle uppercase separately. Non-letters pass through unchanged. Then decrypt by shifting `(26 - shift) % 26`.",
      hint: "Check `islower(c)` and `isupper(c)` to handle both cases. Modify characters in place.",
      walkthrough: [
        "For each char c: if islower(c): c = (c - 'a' + shift) % 26 + 'a'",
        "If isupper(c): c = (c - 'A' + shift) % 26 + 'A'",
        "Print encrypted string",
        "Decrypt: shift by (26 - shift) % 26",
      ],
    },
  ],

  assessment: {
    questions: [
      {
        id: "cpp0-008-q1",
        type: "choice",
        text: "What is the valid index range for `int arr[10]`?",
        options: ["1 to 10", "0 to 10", "0 to 9", "1 to 9"],
        answer: 2,
        explanation:
          "C++ arrays are 0-indexed. Valid indices are 0 through n-1 where n is the size. `arr[10]` is one past the end — undefined behavior.",
      },
      {
        id: "cpp0-008-q2",
        type: "choice",
        text: "What does `s.find(\"xyz\")` return when `\"xyz\"` is not in `s`?",
        options: ["-1", "0", "std::string::npos", "The length of s"],
        answer: 2,
        explanation:
          "`find()` returns `std::string::npos` (max value of `size_t`, not signed -1) when not found. Always compare with `!= string::npos`.",
      },
      {
        id: "cpp0-008-q3",
        type: "choice",
        text: "What does `s.substr(3, 4)` return for `s = \"Hello, World!\"`?",
        options: ['"lo, "', '"Hello"', '"World"', '"llo,"'],
        answer: 0,
        explanation:
          "`substr(start, length)` — starting at index 3 for 4 chars: s[3]='l', s[4]='o', s[5]=',', s[6]=' ' → `\"lo, \"`. It's (start, length) not (start, end).",
      },
      {
        id: "cpp0-008-q4",
        type: "choice",
        text: "What advantage does `std::array<int,5>` have over `int arr[5]`?",
        options: [
          "std::array uses less memory",
          "std::array is dynamically resizable",
          "std::array knows its size (.size()), supports copy/assignment, and doesn't decay to a pointer",
          "std::array performs automatic bounds checking with []",
        ],
        answer: 2,
        explanation:
          "`std::array` has the same fixed-size performance but adds `.size()`, copy/assignment, and avoids array-to-pointer decay. It does NOT resize. Bounds checking requires `.at()`, not `[]`.",
      },
    ],
  },
};

export default lesson;
