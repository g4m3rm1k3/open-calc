const PTR_CODE = `#include <iostream>
#include <string>
using namespace std;

// __OUTPUT__: --- Addresses and pointers ---\\nx = 42, address of x: 0x7ffd1234 (varies)\\nptr points to x: *ptr = 42\\nAfter *ptr = 100: x = 100\\n--- Pointer arithmetic ---\\narr[0] addr: 0x... arr[1] addr: 0x...+4 (4-byte spacing)\\narray via pointer: 10 20 30 40 50 \\n--- nullptr check ---\\nptr is null — cannot dereference safely\\n--- References ---\\nref is an alias: ref = 42\\nAfter ref = 200: x = 200 (same object!)\\n--- swap via pointers ---\\nBefore: a=5 b=10\\nAfter:  a=10 b=5\\n--- swap via references (cleaner) ---\\nBefore: a=5 b=10\\nAfter:  a=10 b=5

void swapPtr(int* a, int* b) {
    int tmp = *a;
    *a = *b;
    *b = tmp;
}

void swapRef(int& a, int& b) {
    int tmp = a;
    a = b;
    b = tmp;
}

int main() {
    // ── Addresses and pointers ─────────────────────────────────
    cout << "--- Addresses and pointers ---" << endl;
    int x = 42;
    int* ptr = &x;       // ptr holds the address of x
    cout << "x = " << x << ", address of x: " << ptr << endl;
    cout << "ptr points to x: *ptr = " << *ptr << endl;
    *ptr = 100;          // modify x through the pointer
    cout << "After *ptr = 100: x = " << x << endl;

    // ── Pointer arithmetic ─────────────────────────────────────
    cout << "--- Pointer arithmetic ---" << endl;
    int arr[] = {10, 20, 30, 40, 50};
    int* p = arr;        // p points to arr[0]
    cout << "array via pointer: ";
    for (int i = 0; i < 5; i++) {
        cout << *(p + i) << " ";    // p+i = address of arr[i]
    }
    cout << endl;

    // ── nullptr safety ─────────────────────────────────────────
    cout << "--- nullptr check ---" << endl;
    int* nullPtr = nullptr;
    if (nullPtr == nullptr) {
        cout << "ptr is null — cannot dereference safely" << endl;
    }

    // ── References ─────────────────────────────────────────────
    cout << "--- References ---" << endl;
    int y = 42;
    int& ref = y;        // ref is an alias for y — same memory location
    cout << "ref is an alias: ref = " << ref << endl;
    ref = 200;
    cout << "After ref = 200: x = " << y << " (same object!)" << endl;

    // ── Swap functions ─────────────────────────────────────────
    cout << "--- swap via pointers ---" << endl;
    int a = 5, b = 10;
    cout << "Before: a=" << a << " b=" << b << endl;
    swapPtr(&a, &b);     // pass addresses
    cout << "After:  a=" << a << " b=" << b << endl;

    cout << "--- swap via references (cleaner) ---" << endl;
    a = 5; b = 10;
    cout << "Before: a=" << a << " b=" << b << endl;
    swapRef(a, b);       // pass directly — ref binds to caller's vars
    cout << "After:  a=" << a << " b=" << b << endl;

    return 0;
}`;

const lesson = {
  id: "cpp-0-009",
  slug: "pointers-and-references",
  chapter: "cpp-0",
  order: 9,
  title: "Pointers and References",
  subtitle: "Understand memory addresses, pointer indirection, and reference semantics",
  tags: ["c++", "cpp", "pointers", "references", "memory", "addresses", "nullptr", "dereferencing"],
  aliases: [
    "c++ pointers",
    "c++ references",
    "pointer arithmetic c++",
    "null pointer c++",
    "c++ memory addresses",
  ],

  hook: `Pointers are C++'s most powerful and most feared feature. They're also completely logical once you understand what memory addresses are. Every variable lives somewhere in memory. A pointer is just a variable that holds an address. That's it. Once you internalize that — and understand the rules for dereferencing and null safety — pointers become a tool, not a mystery. They're also the gateway to dynamic memory allocation, data structures, and systems programming.`,

  mentalModel: [
    "**A pointer is a variable that stores a memory address.** `int* ptr = &x` makes `ptr` hold the address where `x` lives in memory. `&x` is the 'address-of' operator. `*ptr` is the 'dereference' operator — it follows the pointer to access the value at that address. So `*ptr = 42` stores 42 at the address stored in `ptr`, which is the location of `x`.",
    "**A reference is a permanent alias.** `int& ref = x` makes `ref` an alternative name for `x`. They occupy the same memory. Everywhere you use `ref`, it's as if you wrote `x`. You can't reassign a reference to point to a different variable — it binds once at initialization. References are safer than pointers: no null references, no pointer arithmetic, must be initialized.",
    "**Always check pointers for null before dereferencing.** `nullptr` is a pointer that points to nothing. Dereferencing `nullptr` is undefined behavior (usually a crash — segmentation fault). Before using a pointer: `if (ptr != nullptr) { *ptr = ...; }`. References can't be null, which is why they're preferred when a value is always required.",
  ],

  intuition: {
    prose: [
      "**What does memory look like?** Imagine RAM as a long sequence of numbered bytes: byte 0, byte 1, byte 2, .... When you write `int x = 42;`, the compiler reserves 4 bytes somewhere — say bytes 1000–1003. The 'address of x' is 1000. `&x` returns 1000. `int* ptr = &x` stores 1000 in `ptr`. `*ptr` means 'go to address 1000 and read/write an int there'. This is not magic — it's direct access to hardware memory.",
      "**Pointer arithmetic.** When you add 1 to a pointer, it advances by `sizeof(T)` bytes — not 1 byte. `int* p = arr; p + 1` advances by 4 bytes (sizeof(int) = 4), pointing to `arr[1]`. This is why `arr[i]` and `*(arr + i)` are exactly equivalent in C++. Pointer arithmetic is how C's entire string library is built — and why buffer overflows are possible: there's nothing stopping you from writing `*(p + 1000)` if `p` only points into a 5-element array.",
      "**When to use pointers vs references.** Prefer references when: (1) the parameter is always valid (can't be null), (2) you don't need to change what it points to. Use pointers when: (1) the value might be absent (nullptr for 'no value'), (2) you need to change what the pointer points to, (3) you're interfacing with C APIs or low-level code. The rule of thumb: references for 'always present' things, pointers for 'might be absent' or 'dynamic' things.",
      "**`const` with pointers has two positions.** `const int* ptr` — pointer to const int — you can't modify `*ptr` (the data), but you can change `ptr` to point elsewhere. `int* const ptr` — const pointer to int — you can modify `*ptr`, but you can't change where `ptr` points. `const int* const ptr` — both const. Most function parameters use `const T*` (pointer to const) to signal read-only access: `void print(const int* arr, int n)`. This matters when calling C library functions that take `const char*`.",
    ],
    visualizations: [
      {
        id: "CppLab",
        mathBridge:
          "**Explore pointers and references:**\n\n1. Compile and run — note how the address changes each run (ASLR)\n2. Add `cout << sizeof(ptr) << endl;` — all pointers are 8 bytes on 64-bit systems\n3. Try declaring `int* p = nullptr; cout << *p;` — observe the crash (segfault)\n4. Compare `&a == &ref` after `int& ref = a` — they should be equal (same address)\n5. Try `*(arr + 2) = 99;` — changes arr[2] via pointer arithmetic\n6. What does `p++` do inside `for (int* p = arr; p != arr + 5; p++)`?",
        props: {
          mainFile: "main.cpp",
          initialFiles: {
            "/home/user/main.cpp": PTR_CODE,
          },
        },
      },
    ],
  },

  rigor: {
    prose: [
      "**Pointer validity is your responsibility.** A valid pointer must: (1) not be `nullptr`, (2) point to memory you own (not freed memory, not beyond array bounds, not to a destroyed stack variable). A **dangling pointer** points to memory that has been freed or that belonged to a destroyed variable. Dereferencing a dangling pointer is undefined behavior — the program might crash, produce wrong results, or silently corrupt memory. This is why smart pointers (`unique_ptr`, `shared_ptr`) in the next module are so valuable: they automate validity management.",
      "**Pointer vs array decay.** When you pass `int arr[5]` to a function, it decays to `int*` — a pointer to the first element. The function loses the array size. You can't `sizeof` a decayed pointer to get the array size. `std::array<int,5>` and `std::vector<int>` don't decay — they carry their size. This is the fundamental reason to prefer `std::vector` over C arrays in modern C++.",
      "**Reference rules.** A reference must be initialized when declared and cannot be rebound. `int& ref;` is a compile error. `int& ref = x; ref = y;` doesn't make `ref` refer to `y` — it assigns `y`'s value to `x` (because `ref` IS `x`). References are implemented as pointers under the hood — the compiler stores the address, but the syntax hides it. Conceptually, references are aliases; implementation-wise, they're pointers with extra restrictions.",
    ],
    callouts: [
      {
        type: "warning",
        title: "Never dereference nullptr or dangling pointers",
        body: "Dereferencing null or freed/out-of-scope pointers is undefined behavior — usually a segfault. Always initialize pointers (to `nullptr` or a valid address), check for null before dereferencing, and never return pointers to local variables. Tools: `-fsanitize=address` catches these at runtime; Valgrind finds memory errors.",
      },
      {
        type: "info",
        title: "Pointer size is always 8 bytes on 64-bit systems",
        body: "`sizeof(int*)` = `sizeof(double*)` = `sizeof(char*)` = 8 bytes on any 64-bit machine. Pointers just hold addresses — the type only matters for arithmetic and dereferencing. A pointer to a 1-byte `char` and a pointer to an 8-byte `double` both occupy 8 bytes in memory.",
      },
      {
        type: "tip",
        title: "Use references in range-based for to avoid copies",
        body: "`for (auto& item : container)` iterates by reference — no copy. `for (auto item : container)` copies each element. For large objects (strings, structs), always use `auto&` (or `const auto&` if read-only). For small types (int, double), the difference is negligible.",
      },
    ],
  },

  examples: [
    {
      title: "Pointer to array — classic C pattern",
      body: `// Function using pointer and size
int sum(const int* arr, int n) {
    int total = 0;
    for (int i = 0; i < n; i++) {
        total += arr[i];        // arr[i] == *(arr + i)
    }
    return total;
}

// Find minimum — returns pointer to the min element
const int* findMin(const int* arr, int n) {
    const int* minPtr = arr;
    for (int i = 1; i < n; i++) {
        if (arr[i] < *minPtr) minPtr = arr + i;
    }
    return minPtr;
}

int data[] = {5, 2, 8, 1, 9};
cout << sum(data, 5) << endl;           // 25
cout << *findMin(data, 5) << endl;      // 1`,
    },
    {
      title: "Double pointer (pointer to pointer)",
      body: `// Modify a pointer from inside a function
void allocate(int** pp, int value) {
    *pp = new int(value);   // *pp is the pointer the caller passed
}

int* p = nullptr;
allocate(&p, 42);     // pass address of p so we can modify it
cout << *p << endl;   // 42
delete p;             // free heap memory (covered in next modules)

// Common use: array of strings (array of char*)
const char* names[] = {"Alice", "Bob", "Charlie"};
const char** ptr = names;
cout << *ptr     << endl;   // Alice
cout << *(ptr+1) << endl;   // Bob`,
    },
    {
      title: "const correctness with pointers",
      body: `int x = 10;
const int y = 20;

// Pointer to const int — can't modify the pointed-to value
const int* p1 = &x;   // legal: p1 sees x as const
// *p1 = 99;          // ERROR: cannot assign to const int
p1 = &y;              // OK: can change where p1 points

// Const pointer to int — can't change where it points
int* const p2 = &x;
*p2 = 99;             // OK: can modify the value
// p2 = &x2;          // ERROR: cannot rebind const pointer

// Both const
const int* const p3 = &y;
// *p3 = 5;            // ERROR
// p3  = &x;           // ERROR

// Function that promises not to modify the array
void print(const int* arr, int n) {
    for (int i = 0; i < n; i++) cout << arr[i] << " ";
}`,
    },
  ],

  challenges: [
    {
      difficulty: "easy",
      problem:
        "Write `void reverseArray(int* arr, int n)` that reverses an array in-place using pointer arithmetic (use `*(arr + i)` syntax, not `arr[i]`). Also write `int* findMax(int* arr, int n)` that returns a pointer to the maximum element. In main, call both and verify they work.",
      hint: "For reverse: use two pointers walking toward the center. For findMax: initialize maxPtr = arr, then compare *maxPtr with *(arr+i).",
      walkthrough: [
        "reverseArray: int* lo = arr; int* hi = arr + n - 1; while (lo < hi) { swap(*lo, *hi); lo++; hi--; }",
        "findMax: init maxPtr = arr; loop i=1 to n-1; if *(arr+i) > *maxPtr then maxPtr = arr+i; return maxPtr",
        "In main: print before, call reverseArray, print after; call findMax and print *result",
      ],
    },
    {
      difficulty: "medium",
      problem:
        "Implement a simple linked list manually. Define a struct `Node { int data; Node* next; };`. Write: (1) `Node* createNode(int val)` — allocates a node with `new`, (2) `void printList(Node* head)` — traverses and prints, (3) `void freeList(Node* head)` — deletes all nodes. Build a 3-node list in main, print it, then free it.",
      hint: "Create nodes: `Node* n1 = new Node{10, nullptr}; Node* n2 = new Node{20, nullptr}; n1->next = n2;`",
      walkthrough: [
        "createNode: `return new Node{val, nullptr};`",
        "printList: `Node* curr = head; while (curr) { cout << curr->data; curr = curr->next; }`",
        "freeList: `while (head) { Node* tmp = head->next; delete head; head = tmp; }`",
        "Main: create n1, n2, n3; link them; printList(n1); freeList(n1)",
      ],
    },
  ],

  assessment: {
    questions: [
      {
        id: "cpp0-009-q1",
        type: "choice",
        text: "What does `int* ptr = &x;` do?",
        options: [
          "Creates a copy of x and stores it in ptr",
          "Makes ptr store the memory address of x",
          "Makes ptr an alias (reference) to x",
          "Dereferences x and stores the result in ptr",
        ],
        answer: 1,
        explanation:
          "`&x` is the 'address-of' operator — it gives the memory address where `x` lives. `int*` is 'pointer to int'. So `ptr` is a pointer that holds x's address. `*ptr` would give back the value at that address.",
      },
      {
        id: "cpp0-009-q2",
        type: "choice",
        text: "What's the key difference between a pointer and a reference?",
        options: [
          "References are faster than pointers",
          "Pointers can be null or repointed; references must be initialized and always bind to the same object",
          "Pointers use * syntax; references use & syntax (no functional difference)",
          "References are only for function parameters",
        ],
        answer: 1,
        explanation:
          "References bind once at initialization and cannot be null. Pointers can be nullptr, can be changed to point to different objects, and can do arithmetic. Use references for 'always valid' data; pointers for 'might be absent' or dynamic contexts.",
      },
      {
        id: "cpp0-009-q3",
        type: "choice",
        text: "If `int arr[5]` starts at address 1000 and `int` is 4 bytes, what address does `arr + 2` point to?",
        options: ["1002", "1004", "1006", "1008"],
        answer: 3,
        explanation:
          "Pointer arithmetic advances by `sizeof(T)` bytes per step. `arr + 2` = address 1000 + 2 × 4 = 1008. So `*(arr + 2)` and `arr[2]` both access the int at address 1008.",
      },
      {
        id: "cpp0-009-q4",
        type: "choice",
        text: "What is a dangling pointer?",
        options: [
          "A pointer that points to nullptr",
          "A pointer that was never initialized",
          "A pointer that points to memory that has been freed or gone out of scope",
          "A pointer that points to a const variable",
        ],
        answer: 2,
        explanation:
          "A dangling pointer points to memory that's no longer valid — a freed heap allocation, a local variable whose scope ended, or an array element that was deleted. Dereferencing it is undefined behavior (usually a crash or silent corruption).",
      },
    ],
  },
};

export default lesson;
