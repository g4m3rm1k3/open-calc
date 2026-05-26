const TEMPLATES_CODE = `#include <iostream>
#include <vector>
#include <string>
#include <stdexcept>
using namespace std;

// ── Function template ─────────────────────────────────────────
template<typename T>
T maxOf(T a, T b) {
    return (a > b) ? a : b;
}

template<typename T>
T clamp(T val, T lo, T hi) {
    if (val < lo) return lo;
    if (val > hi) return hi;
    return val;
}

// ── Class template ─────────────────────────────────────────────
template<typename T>
class Pair {
    T first, second;
public:
    Pair(T a, T b) : first(a), second(b) {}
    T getFirst()  const { return first;  }
    T getSecond() const { return second; }
    Pair<T> swap() const { return {second, first}; }
    void print() const {
        cout << "(" << first << ", " << second << ")";
    }
};

// ── Stack class template ───────────────────────────────────────
template<typename T>
class Stack {
    vector<T> data;
public:
    void push(const T& val) { data.push_back(val); }
    T pop() {
        if (data.empty()) throw runtime_error("Stack is empty");
        T top = data.back();
        data.pop_back();
        return top;
    }
    const T& peek() const {
        if (data.empty()) throw runtime_error("Stack is empty");
        return data.back();
    }
    bool   empty() const { return data.empty(); }
    size_t size()  const { return data.size(); }
};

// ── Template with multiple type parameters ────────────────────
template<typename K, typename V>
struct KeyValue {
    K key; V value;
    void print() const { cout << key << " => " << value << endl; }
};

// __OUTPUT__: --- Function templates ---\\nmax(3, 7) = 7\\nmax(3.14, 2.71) = 3.14\\nmax(hello, world) = world\\nclamp(15, 0, 10) = 10\\n--- Class templates ---\\nIntPair: (1, 2)  Swapped: (2, 1)\\nStringPair: (Alice, Bob)\\n--- Stack<int> ---\\nPushed: 1 2 3\\nPop: 3\\nPeek: 2  Size: 2\\n--- KeyValue template ---\\nname => Alice\\nage => 30

int main() {
    cout << "--- Function templates ---" << endl;
    cout << "max(3, 7) = "            << maxOf(3, 7)         << endl;
    cout << "max(3.14, 2.71) = "      << maxOf(3.14, 2.71)   << endl;
    cout << "max(hello, world) = "    << maxOf(string("hello"), string("world")) << endl;
    cout << "clamp(15, 0, 10) = "     << clamp(15, 0, 10)    << endl;

    cout << "--- Class templates ---" << endl;
    Pair<int>    ip(1, 2);
    cout << "IntPair: "; ip.print();
    cout << "  Swapped: "; ip.swap().print(); cout << endl;

    Pair<string> sp("Alice", "Bob");
    cout << "StringPair: "; sp.print(); cout << endl;

    cout << "--- Stack<int> ---" << endl;
    Stack<int> s;
    for (int i : {1, 2, 3}) { s.push(i); cout << "Pushed: " << i << " "; }
    cout << endl;
    cout << "Pop: "  << s.pop() << endl;
    cout << "Peek: " << s.peek() << "  Size: " << s.size() << endl;

    cout << "--- KeyValue template ---" << endl;
    KeyValue<string, string> kv1{"name", "Alice"};
    KeyValue<string, int>    kv2{"age",  30};
    kv1.print(); kv2.print();

    return 0;
}`;

const lesson = {
  id: "cpp-1-004",
  slug: "templates",
  chapter: "cpp-1",
  order: 4,
  title: "Templates",
  subtitle: "Write code once that works with any type — generic programming with function and class templates",
  tags: ["c++", "cpp", "templates", "generics", "function-template", "class-template", "type-parameters"],
  aliases: [
    "c++ templates",
    "c++ generic programming",
    "c++ function templates",
    "c++ class templates",
    "c++ template parameters",
  ],

  hook: `Without templates, you'd write \`sort\` for int arrays, then again for double arrays, then again for string arrays. With templates, you write it once and the compiler generates the specific version for each type you use. Templates are the foundation of the entire STL (sort, vector, map, all of them). They're also the mechanism behind zero-cost abstractions — the abstraction lives in the source code, the runtime code is as fast as hand-written type-specific code.`,

  mentalModel: [
    "**A template is a blueprint that the compiler instantiates for each type used.** `maxOf<int>(3, 7)` causes the compiler to generate a concrete `int` version of `maxOf`. `maxOf<double>(3.14, 2.71)` generates a `double` version. This happens at compile time — there's no runtime overhead from 'being generic'. The binary contains the specific compiled code for each instantiation.",
    "**Template argument deduction lets you omit type parameters.** `maxOf(3, 7)` — the compiler sees `int` arguments and deduces `T = int`. `maxOf(3.14, 2.71)` — deduces `T = double`. You only need `maxOf<int>(3.0, 7)` when the arguments are ambiguous or you want to force a specific type. Deduction makes templates as easy to call as regular functions.",
    "**Class templates are parameterized types.** `Stack<int>` and `Stack<string>` are distinct types — the compiler generates separate code for each. A `Stack<int>` can't hold strings. This is stronger type safety than a `Stack` that holds `void*` — misuse is caught at compile time, not runtime.",
  ],

  intuition: {
    prose: [
      "**Template instantiation happens at compile time.** When you write `vector<int>`, the compiler literally generates the code for an integer vector — inline, specialized for `int`. This is why templates must be in header files (or the translation unit that uses them): the compiler needs to see the template definition to generate the instantiation. You can't 'compile a template' separately like a regular function.",
      "**Type requirements are implicit.** `template<typename T> T maxOf(T a, T b) { return a > b ? a : b; }` works for any `T` that supports `>`. If you call `maxOf(Point{1,2}, Point{3,4})` and `Point` doesn't have `operator>`, you get a compile error — usually a long template error message. C++20 Concepts (next module) make these requirements explicit and give better error messages.",
      "**Template specialization lets you handle specific types differently.** The general `maxOf<T>` works for most types. But what if you want `maxOf<const char*>` to compare strings by content, not pointer? You write a specialization: `template<> const char* maxOf<const char*>(const char* a, const char* b) { return strcmp(a, b) > 0 ? a : b; }`. The compiler uses the specialization when the type matches exactly.",
      "**`typename` vs `class` in template parameters.** `template<typename T>` and `template<class T>` are identical — both say 'T is a type parameter'. `typename` is more modern and clear (T doesn't have to be a class — it can be `int`, `double`, a pointer, etc.). `class` is historical. Use `typename` in new code.",
    ],
    visualizations: [
      {
        id: "CppLab",
        mathBridge:
          "**Explore templates:**\n\n1. Compile and run — the same Stack and Pair work with int, string, double\n2. Try `Stack<string> ss; ss.push(\"hello\"); ss.push(\"world\");`\n3. Add `template<typename T> void printAll(const vector<T>& v)` — works with any vector type\n4. Add a non-type template parameter: `template<typename T, int N> struct Array { T data[N]; };`\n5. Try calling `maxOf(3, 3.14)` (without explicit type) — what error do you get? Why?\n6. Add template specialization for string that compares case-insensitively",
        props: {
          mainFile: "main.cpp",
          initialFiles: {
            "/home/user/main.cpp": TEMPLATES_CODE,
          },
        },
      },
    ],
  },

  rigor: {
    prose: [
      "**Two-phase name lookup.** Templates go through two phases of name resolution. In phase 1 (when the template is defined), non-dependent names (names that don't involve T) are looked up immediately. In phase 2 (when the template is instantiated with a specific type), dependent names (involving T) are looked up. This means template errors can appear at seemingly random places. Understanding this helps debug complex template errors.",
      "**Template specialization vs overloading.** Function templates and regular functions can coexist. `maxOf(int, int)` (regular) takes priority over `maxOf<T>(T, T)` (template) when called with ints. Partial specialization is only available for class templates, not function templates — for functions, use overloads instead. Full specialization is available for both.",
      "**Non-type template parameters.** Beyond types, templates can take integers: `template<typename T, size_t N> class FixedArray { T data[N]; }`. `FixedArray<int, 10>` is a completely different type from `FixedArray<int, 20>`. This enables stack-allocated, zero-overhead generic arrays. `std::array<T, N>` is implemented this way. Non-type parameters must be compile-time constants.",
    ],
    callouts: [
      {
        type: "warning",
        title: "Templates must be defined in header files",
        body: "Because the compiler needs to generate instantiations at each point of use, template definitions must be in header files (or in the `.cpp` file that uses them). You can't put a template definition in a `.cpp` file and use it from another `.cpp` — the linker won't find it. This is the main practical constraint of templates.",
      },
      {
        type: "info",
        title: "Template error messages can be long",
        body: "Pre-C++20, template errors produce long chains of messages showing the instantiation stack. Start reading from the first error and from the bottom of the chain where it mentions your code. The error is usually a type mismatch or a missing operator. C++20 Concepts dramatically improve template error messages.",
      },
      {
        type: "tip",
        title: "Use auto for template-deduced return types",
        body: "In C++14+, `template<typename T, typename U> auto add(T a, U b) { return a + b; }` lets the compiler deduce the return type. For `add(1, 2.5)`, it returns `double`. Without `auto`, you'd need `decltype(a + b)` or make both types the same. `auto` return types are convenient for lambdas and generic code.",
      },
    ],
  },

  examples: [
    {
      title: "Generic algorithms as function templates",
      body: `// Generic linear search — works on any container element type
template<typename T>
int linearSearch(const T* arr, int n, const T& target) {
    for (int i = 0; i < n; i++)
        if (arr[i] == target) return i;
    return -1;
}

// Generic swap — works for any assignable type
template<typename T>
void swap(T& a, T& b) {
    T tmp = a; a = b; b = tmp;
}

// Generic print all — works for any printable element
template<typename Container>
void printAll(const Container& c) {
    for (const auto& x : c) cout << x << " ";
    cout << endl;
}

// Usage
int ints[]     = {1, 2, 3, 4, 5};
string words[] = {"cat", "dog", "bird"};
cout << linearSearch(ints, 5, 3) << endl;      // 2
cout << linearSearch(words, 3, string("dog")) << endl;  // 1`,
    },
    {
      title: "Class template: generic matrix",
      body: `template<typename T, int ROWS, int COLS>
class Matrix {
    T data[ROWS][COLS];
public:
    Matrix() { for (int i = 0; i < ROWS*COLS; i++) data[0][i] = T{}; }

    T& at(int r, int c)             { return data[r][c]; }
    const T& at(int r, int c) const { return data[r][c]; }

    void fill(T val) {
        for (int r = 0; r < ROWS; r++)
            for (int c = 0; c < COLS; c++)
                data[r][c] = val;
    }

    Matrix<T, ROWS, COLS> operator+(const Matrix& other) const {
        Matrix result;
        for (int r = 0; r < ROWS; r++)
            for (int c = 0; c < COLS; c++)
                result.data[r][c] = data[r][c] + other.data[r][c];
        return result;
    }
};

// 3×3 double matrix — all on the stack
Matrix<double, 3, 3> A, B;
A.fill(1.0);  B.fill(2.0);
auto C = A + B;   // C is all 3.0`,
    },
    {
      title: "Template specialization",
      body: `// General template
template<typename T>
string describe(T val) {
    return "value: " + to_string(val);
}

// Specialization for bool
template<>
string describe<bool>(bool val) {
    return val ? "true" : "false";
}

// Specialization for char*
template<>
string describe<const char*>(const char* val) {
    return string("string: '") + val + "'";
}

cout << describe(42)         << endl;  // value: 42
cout << describe(3.14)       << endl;  // value: 3.14
cout << describe(true)       << endl;  // true
cout << describe("hello")    << endl;  // string: 'hello'`,
    },
  ],

  challenges: [
    {
      difficulty: "medium",
      problem:
        "Write a `template<typename T> class Queue` backed by a vector. Implement `enqueue(T val)`, `dequeue()` (removes and returns front), `front()`, `empty()`, `size()`. Note: dequeue from a vector's front is O(n) — that's fine for now. Test with `Queue<int>` and `Queue<string>`.",
      hint: "For dequeue: `T val = data.front(); data.erase(data.begin()); return val;`. Or use indices.",
      walkthrough: [
        "Private: vector<T> data;",
        "enqueue: data.push_back(val)",
        "front: return data.front() (throw if empty)",
        "dequeue: T val = data[0]; data.erase(data.begin()); return val;",
        "Test both Queue<int> and Queue<string>",
      ],
    },
    {
      difficulty: "hard",
      problem:
        "Implement `template<typename T> T accumulate(T* arr, int n, T init, /* function */ )` that takes a binary function (or lambda) and folds the array. Then test: sum (init=0, f=add), product (init=1, f=multiply), max (init=INT_MIN, f=max). Hint: the function parameter type is `function<T(T,T)>` from `<functional>`.",
      hint: "`#include <functional>`. Parameter: `function<T(T,T)> f`. Body: `for (int i=0; i<n; i++) init = f(init, arr[i]); return init;`",
      walkthrough: [
        "Include <functional>",
        "Signature: template<typename T> T fold(T* arr, int n, T init, function<T(T,T)> f)",
        "Body: for each element: init = f(init, arr[i])",
        "Sum: fold(arr, n, 0, [](int a, int b){ return a+b; })",
        "Max: fold(arr, n, INT_MIN, [](int a, int b){ return a>b?a:b; })",
      ],
    },
  ],

  assessment: {
    questions: [
      {
        id: "cpp1-004-q1",
        type: "choice",
        text: "When does the compiler generate a template instantiation?",
        options: [
          "When you include the header containing the template",
          "When the template is used with a specific type",
          "At runtime, when the function is first called",
          "When you define the template class",
        ],
        answer: 1,
        explanation:
          "Template instantiation happens at compile time when the template is used with a specific type. `vector<int>` causes instantiation of the vector template for `int`. Each distinct type usage generates separate code.",
      },
      {
        id: "cpp1-004-q2",
        type: "choice",
        text: "Why must template definitions usually be in header files?",
        options: [
          "It's a C++ standard requirement",
          "The compiler needs the full definition to generate instantiations at each point of use",
          "Templates can't be compiled into object files",
          "Templates are slower when in separate .cpp files",
        ],
        answer: 1,
        explanation:
          "The compiler generates template code (instantiations) where the template is used. It needs to see the full template definition at that point. If the definition is in a separate `.cpp`, it's not visible to other translation units, causing linker errors.",
      },
      {
        id: "cpp1-004-q3",
        type: "choice",
        text: "What is a non-type template parameter?",
        options: [
          "A template parameter that isn't a class type",
          "A compile-time constant value (integer, pointer, etc.) used as a template argument, like `Array<int, 10>`",
          "A parameter that has a default value",
          "A parameter that can be either a type or a value",
        ],
        answer: 1,
        explanation:
          "Non-type template parameters are compile-time constant values. `template<typename T, size_t N>` — N is a non-type parameter. `std::array<int, 5>` uses this: the array size is baked into the type at compile time, allowing stack allocation.",
      },
      {
        id: "cpp1-004-q4",
        type: "choice",
        text: "What does template specialization allow?",
        options: [
          "Making a template work faster for all types",
          "Providing a custom implementation for a specific type while keeping the general template for others",
          "Using a template without specifying any type parameters",
          "Preventing a template from being instantiated for certain types",
        ],
        answer: 1,
        explanation:
          "Template specialization provides an alternative implementation for a specific type. The general template handles most types; specializations handle specific types differently. Example: a general string conversion template, but a specialized version for `bool` that returns 'true'/'false' instead of '1'/'0'.",
      },
    ],
  },
};

export default lesson;
