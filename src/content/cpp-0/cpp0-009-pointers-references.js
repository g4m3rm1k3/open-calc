const ADDR_CODE = `#include <iostream>
using namespace std;

// __OUTPUT__: x = 42\\naddr of x: 0x... (varies each run)\\n*ptr = 42\\nafter *ptr = 100: x = 100

int main() {
    int x = 42;
    int* ptr = &x;   // ptr holds the address of x

    cout << "x = " << x << endl;
    cout << "addr of x: " << ptr << endl;
    cout << "*ptr = " << *ptr << endl;   // dereference: read value at address

    *ptr = 100;                          // write through pointer
    cout << "after *ptr = 100: x = " << x << endl;

    return 0;
}`;

const PTR_ARITH_CODE = `#include <iostream>
using namespace std;

// __OUTPUT__: arr[0]=10 arr[1]=20 arr[2]=30\\nvia pointer: 10 20 30 40 50

int main() {
    int arr[] = {10, 20, 30, 40, 50};

    // arr[i] and *(arr + i) are identical
    cout << "arr[0]=" << arr[0]
         << " arr[1]=" << arr[1]
         << " arr[2]=" << arr[2] << endl;

    // Walk the array using a pointer
    int* p = arr;
    cout << "via pointer: ";
    for (int i = 0; i < 5; i++) {
        cout << *(p + i) << " ";
    }
    cout << endl;

    return 0;
}`;

const REF_CODE = `#include <iostream>
using namespace std;

// __OUTPUT__: y = 42\\nref = 42 (same object)\\nafter ref = 200: y = 200\\naddr equal: 1

int main() {
    int y = 42;
    int& ref = y;   // ref is an alias for y — same memory location

    cout << "y = " << y << endl;
    cout << "ref = " << ref << " (same object)" << endl;

    ref = 200;      // modifies y directly
    cout << "after ref = 200: y = " << y << endl;

    // Confirm they're the same address
    cout << "addr equal: " << (&ref == &y) << endl;

    return 0;
}`;

const SWAP_CODE = `#include <iostream>
using namespace std;

// __OUTPUT__: pointer swap: a=10 b=5\\nreference swap: a=5 b=10

void swapPtr(int* a, int* b) {
    int tmp = *a;  *a = *b;  *b = tmp;
}

void swapRef(int& a, int& b) {
    int tmp = a;  a = b;  b = tmp;
}

int main() {
    int a = 5, b = 10;
    swapPtr(&a, &b);   // pass addresses explicitly
    cout << "pointer swap: a=" << a << " b=" << b << endl;

    a = 5; b = 10;
    swapRef(a, b);     // reference: no & at call site
    cout << "reference swap: a=" << a << " b=" << b << endl;

    return 0;
}`;

const lesson = {
  id: "cpp-0-009",
  slug: "pointers-and-references",
  chapter: "cpp-0",
  order: 9,
  title: "Pointers and References",
  subtitle: "Memory addresses, pointer dereferencing, and reference aliases",
  tags: ["c++", "cpp", "pointers", "references", "memory", "addresses", "nullptr", "dereferencing"],
  aliases: [
    "c++ pointers",
    "c++ references",
    "pointer arithmetic c++",
    "null pointer c++",
    "c++ memory addresses",
  ],

  hook: `Pointers are C++'s most powerful and most feared feature. They're also completely logical: every variable lives at some memory address, and a pointer is just a variable that holds an address. Once you see that, everything follows — dereference to read/write, arithmetic to navigate arrays, null-check before use.`,

  mentalModel: [
    "**A pointer stores a memory address.** `int* ptr = &x` makes `ptr` hold x's address. `&x` is 'address-of'. `*ptr` is 'dereference' — follow the pointer and access the value there. `*ptr = 100` writes 100 into whatever `ptr` is pointing at.",
    "**A reference is a permanent alias.** `int& ref = x` makes `ref` another name for `x` — same memory location. Everywhere `ref` appears, it behaves exactly as if you wrote `x`. A reference can't be null and can't be rebound after initialization — safer than a pointer for 'always present' data.",
    "**`nullptr` means the pointer points to nothing.** Dereferencing `nullptr` crashes the program. Always check: `if (ptr != nullptr)` before `*ptr`. References can't be null — that's one reason to prefer them over pointers when a value is always required.",
  ],

  intuition: {
    prose: [
      "**Memory is a numbered sequence of bytes.** `int x = 42` reserves 4 bytes somewhere — say bytes 1000–1003. `&x` returns 1000. `ptr = &x` stores 1000 in `ptr`. `*ptr` means 'go to address 1000 and read an int'. This is direct hardware memory access, not abstraction.",
    ],
    visualizations: [
      {
        id: "CppLab",
        mathBridge: "**Run it — address changes every run (ASLR). Then explore:**\n\n- Add `cout << sizeof(ptr)` — all pointers are 8 bytes on 64-bit systems regardless of type.\n- Try `int* p = nullptr; cout << *p;` — what happens? (segfault — undefined behavior)\n- Declare `int z = 99; ptr = &z;` — now ptr points to z. Does changing `*ptr` change z?\n- Print both `ptr` and `&x` — are they the same address?",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": ADDR_CODE },
        },
      },
      {
        id: "CppLab",
        mathBridge: "**Pointer arithmetic — run it then explore:**\n\n- Print `p`, `p+1`, `p+2` — what's the difference between addresses? (4 bytes for int)\n- `*(p+2) = 99` — does arr[2] change? Verify with `arr[2]`.\n- Try iterating with `p++`: `for (int* q = arr; q < arr+5; q++) cout << *q`.\n- What does `arr` decay to when passed to a function? Add `void print(int* a, int n)` and call it.",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": PTR_ARITH_CODE },
        },
      },
    ],
  },

  rigor: {
    prose: [
      "**References bind once and never rebind.** `int& ref = y; ref = z;` does NOT make `ref` point to `z` — it copies `z`'s value into `y`. After initialization, any assignment through a reference modifies the original object. This is why `ref = 200` changes `y` in the example — they ARE the same thing.",
      "**Pointers vs references — when to use which.** Use references when the value is always present and you don't need to reassign. Use pointers when the value might be absent (nullptr for 'no value'), when you need to change what's pointed to, or when interfacing with C APIs. In function parameters: `const T&` for read-only large objects, `T&` for output parameters, `T*` when null is a valid option.",
    ],
    visualizations: [
      {
        id: "CppLab",
        mathBridge: "**References — run it then explore:**\n\n- Verify `&ref == &y` prints 1 (same address).\n- Try `int& unbound;` — does it compile? References must be initialized.\n- Add `int z = 99; ref = z;` — is this rebinding or copying? Check `y` afterwards.\n- Use a reference in a range-for to modify a vector: `for (int& x : v) x *= 2;` — does v change?",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": REF_CODE },
        },
      },
      {
        id: "CppLab",
        mathBridge: "**Pointer swap vs reference swap — run it then explore:**\n\n- In `swapPtr`, what happens if you pass `swapPtr(a, b)` instead of `swapPtr(&a, &b)`? (compile error — wrong type)\n- In `swapRef`, try `swapRef(5, 10)` — compile error: can't bind non-const ref to literal.\n- Add `void swap3(int& a, int& b, int& c)` that rotates: a→b, b→c, c→a.\n- Use `std::swap(a, b)` from `<algorithm>` — same result as swapRef?",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": SWAP_CODE },
        },
      },
    ],
    callouts: [
      {
        type: "warning",
        title: "Never dereference nullptr or dangling pointers",
        body: "Dereferencing null or freed/out-of-scope pointers is undefined behavior — usually a segfault. Always initialize pointers (to `nullptr` or a valid address) and check before use. Enable `-fsanitize=address` to catch these at runtime.",
      },
      {
        type: "tip",
        title: "const& for large read-only parameters",
        body: "`void f(const string& s)` avoids copying the string (the `&`) while the `const` prevents modification. For small types like `int`, `double` — pass by value. For strings, vectors, structs — pass by `const&`.",
      },
    ],
  },

  examples: [
    {
      title: "Function returning a pointer to the max element",
      body: `const int* findMax(const int* arr, int n) {
    const int* maxPtr = arr;
    for (int i = 1; i < n; i++) {
        if (arr[i] > *maxPtr) maxPtr = arr + i;
    }
    return maxPtr;
}

int data[] = {5, 2, 8, 1, 9};
const int* m = findMax(data, 5);
cout << "max = " << *m << endl;   // 9`,
    },
    {
      title: "const pointer vs pointer to const",
      body: `int x = 10;

// Pointer to const int — can't modify *p1
const int* p1 = &x;
// *p1 = 99;   // ERROR: data is const
p1 = &x;       // OK: can repoint

// Const pointer to int — can't repoint p2
int* const p2 = &x;
*p2 = 99;      // OK: can modify data
// p2 = &x;   // ERROR: pointer is const`,
    },
  ],

  challenges: [
    {
      difficulty: "easy",
      problem:
        "Write `void reverseArray(int* arr, int n)` that reverses an array in-place using pointer arithmetic — use `*(arr + i)` syntax, not `arr[i]`. Also write `int* findMax(int* arr, int n)` that returns a pointer to the maximum element. Test both in main.",
      hint: "For reverse: use two pointers, `int* lo = arr; int* hi = arr + n - 1;` walking toward center. For findMax: start `maxPtr = arr` and compare `*(arr+i) > *maxPtr`.",
      walkthrough: [
        "reverseArray: lo = arr; hi = arr+n-1; while (lo < hi) { swap(*lo, *hi); lo++; hi--; }",
        "findMax: maxPtr = arr; for i=1..n-1: if *(arr+i) > *maxPtr: maxPtr = arr+i; return maxPtr",
        "Main: declare arr, call reverseArray, print; call findMax, print *result",
      ],
    },
    {
      difficulty: "medium",
      problem:
        "Build a simple singly-linked list. Define `struct Node { int data; Node* next; };`. Write: (1) `Node* createNode(int val)` using `new`, (2) `void printList(Node* head)` — traverse and print, (3) `void freeList(Node* head)` — delete all nodes with `delete`. Build a 3-node list in main, print it, free it.",
      hint: "Link nodes: `n1->next = n2; n2->next = n3;`. freeList: save `tmp = head->next` before `delete head`.",
      walkthrough: [
        "createNode: return new Node{val, nullptr};",
        "printList: Node* curr = head; while (curr) { cout << curr->data; curr = curr->next; }",
        "freeList: while (head) { Node* tmp = head->next; delete head; head = tmp; }",
        "Main: create n1,n2,n3; n1->next=n2; n2->next=n3; printList(n1); freeList(n1)",
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
          "Creates a copy of x in ptr",
          "Makes ptr store the memory address of x",
          "Makes ptr an alias for x",
          "Dereferences x into ptr",
        ],
        answer: 1,
        explanation:
          "`&x` is the address-of operator — it gives the memory address where `x` lives. `ptr` holds that address. `*ptr` accesses the value at that address.",
      },
      {
        id: "cpp0-009-q2",
        type: "choice",
        text: "What's the key difference between a pointer and a reference?",
        options: [
          "References are faster",
          "Pointers can be null or repointed; references must be initialized and always bind to the same object",
          "They're syntactically different but functionally identical",
          "References are only for function parameters",
        ],
        answer: 1,
        explanation:
          "References bind once at initialization and cannot be null. Pointers can be nullptr, changed to point elsewhere, and do arithmetic. Use references for 'always valid' data; pointers for 'might be absent' cases.",
      },
      {
        id: "cpp0-009-q3",
        type: "choice",
        text: "If `int arr[5]` starts at address 1000 and `int` is 4 bytes, what address does `arr + 2` point to?",
        options: ["1002", "1004", "1006", "1008"],
        answer: 3,
        explanation:
          "Pointer arithmetic steps by `sizeof(T)` bytes. `arr + 2` = 1000 + 2 × 4 = 1008. This is why `arr[2]` and `*(arr + 2)` are identical.",
      },
      {
        id: "cpp0-009-q4",
        type: "choice",
        text: "What is a dangling pointer?",
        options: [
          "A pointer initialized to nullptr",
          "A pointer that was never initialized",
          "A pointer to memory that has been freed or gone out of scope",
          "A pointer to a const variable",
        ],
        answer: 2,
        explanation:
          "A dangling pointer points to memory that's no longer valid — freed heap, or a local variable whose scope ended. Dereferencing it is undefined behavior (usually crash or silent corruption).",
      },
    ],
  },
};

export default lesson;
