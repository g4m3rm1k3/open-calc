const TRAITS_CODE = `#include <iostream>
#include <type_traits>
#include <string>
using namespace std;

// __OUTPUT__: int: integral=yes  arith=yes  trivial=yes\\ndouble: float=yes  arith=yes\\nstring: trivial=no  copyable=yes\\npointer: ptr=yes  base_int=yes

int main() {
    // Type queries — all resolved at compile time
    cout << "int: "
         << "integral=" << (is_integral_v<int> ? "yes":"no") << "  "
         << "arith=" << (is_arithmetic_v<int> ? "yes":"no") << "  "
         << "trivial=" << (is_trivial_v<int> ? "yes":"no") << "\\n";

    cout << "double: "
         << "float=" << (is_floating_point_v<double> ? "yes":"no") << "  "
         << "arith=" << (is_arithmetic_v<double> ? "yes":"no") << "\\n";

    cout << "string: "
         << "trivial=" << (is_trivial_v<string> ? "yes":"no") << "  "
         << "copyable=" << (is_copy_constructible_v<string> ? "yes":"no") << "\\n";

    cout << "pointer: "
         << "ptr=" << (is_pointer_v<int*> ? "yes":"no") << "  "
         << "base_int=" << (is_same_v<remove_pointer_t<int*>, int> ? "yes":"no") << "\\n";

    return 0;
}`;

const TRANSFORM_CODE = `#include <iostream>
#include <type_traits>
using namespace std;

// __OUTPUT__: remove_const: int\\nadd_pointer: int*\\nremove_ref: int\\nconditional: double\\ndecay: int

int main() {
    // Type transformations — manipulate types at compile time
    using T1 = remove_const_t<const int>;
    using T2 = add_pointer_t<int>;
    using T3 = remove_reference_t<int&>;
    using T4 = conditional_t<true, double, int>;
    using T5 = decay_t<int[5]>;   // array → pointer (like passing to function)

    cout << "remove_const: " << typeid(T1).name() << "\\n";  // i = int
    cout << "add_pointer: " << typeid(T2).name() << "\\n";   // Pi = int*
    cout << "remove_ref: " << typeid(T3).name() << "\\n";    // i = int
    cout << "conditional: " << typeid(T4).name() << "\\n";   // d = double
    cout << "decay: " << typeid(T5).name() << "\\n";         // Pi = int*

    // Checking before operations
    static_assert(is_same_v<T1, int>);
    static_assert(is_same_v<T2, int*>);
    static_assert(is_same_v<T3, int>);
    static_assert(is_same_v<T4, double>);

    cout << "all static_asserts passed\\n";

    return 0;
}`;

const ENABLE_IF_CODE = `#include <iostream>
#include <type_traits>
using namespace std;

// __OUTPUT__: sum(1,2,3)=6.0\\nsum(1.1,2.2)=3.3\\nprint int: 42\\nprint float: 3.14

// enable_if: disable a template for certain types
// enable_if_t<condition, ReturnType> — SFINAE: substitution failure is not an error
template<typename T>
enable_if_t<is_integral_v<T>, double> sum(T a, T b, T c) {
    cout << "sum(" << a << "," << b << "," << c << ")=";
    return static_cast<double>(a+b+c);
}

template<typename T>
enable_if_t<is_floating_point_v<T>, double> sum(T a, T b) {
    cout << "sum(" << a << "," << b << ")=";
    return a+b;
}

// Modern C++20 way: use concepts (simpler)
// Old way: enable_if + SFINAE
template<typename T, enable_if_t<is_integral_v<T>, int> = 0>
void print(T val) { cout << "print int: " << val << "\\n"; }

template<typename T, enable_if_t<is_floating_point_v<T>, int> = 0>
void print(T val) { cout << "print float: " << val << "\\n"; }

int main() {
    cout << sum(1, 2, 3) << "\\n";
    cout << sum(1.1, 2.2) << "\\n";
    print(42);
    print(3.14f);
    return 0;
}`;

const DETECT_CODE = `#include <iostream>
#include <type_traits>
using namespace std;

// __OUTPUT__: HasToString<Widget>: yes\\nHasToString<int>: no\\nHasSize<string>: yes\\nHasSize<int>: no

// Detection idiom: check if a type has a member/method
template<typename T, typename = void>
struct HasToString : false_type {};

template<typename T>
struct HasToString<T, void_t<decltype(declval<T>().toString())>>
    : true_type {};

template<typename T, typename = void>
struct HasSize : false_type {};

template<typename T>
struct HasSize<T, void_t<decltype(declval<T>().size())>>
    : true_type {};

struct Widget {
    string toString() const { return "Widget"; }
};

int main() {
    cout << "HasToString<Widget>: " << (HasToString<Widget>::value ? "yes":"no") << "\\n";
    cout << "HasToString<int>: "   << (HasToString<int>::value ? "yes":"no") << "\\n";
    cout << "HasSize<string>: "    << (HasSize<string>::value ? "yes":"no") << "\\n";
    cout << "HasSize<int>: "       << (HasSize<int>::value ? "yes":"no") << "\\n";

    return 0;
}`;

const lesson = {
  id: "cpp-3-003",
  slug: "type-traits-sfinae",
  chapter: "cpp-3",
  order: 3,
  title: "Type Traits and SFINAE",
  subtitle: "Compile-time type queries, transformations, and conditional template enablement",
  tags: ["c++", "cpp", "type-traits", "SFINAE", "enable_if", "is_integral", "void_t", "detection-idiom"],
  aliases: [
    "c++ type traits",
    "c++ SFINAE",
    "c++ enable_if",
    "c++ is_integral",
    "c++ template metaprogramming",
    "c++ detection idiom",
  ],

  hook: `Templates are powerful but blunt — they instantiate for any type, even invalid ones. Type traits give you compile-time information about types. SFINAE (Substitution Failure Is Not An Error) lets you enable or disable templates based on those traits. Together they let you write one template that does different things for different types — without runtime overhead.`,

  mentalModel: [
    "**Type traits are `constexpr bool` values about types.** `is_integral_v<T>` is `true` for `int`, `char`, `bool`, etc. `is_trivially_copyable_v<T>` is `true` for types you can `memcpy`. All resolved at compile time, zero runtime cost.",
    "**Type transformations produce new types.** `remove_const_t<const int>` is `int`. `add_pointer_t<int>` is `int*`. `decay_t<int[5]>` is `int*` (same as passing an array to a function). These are the building blocks of generic code.",
    "**SFINAE: failed template substitution is skipped, not an error.** `enable_if_t<condition, T>` exists only when condition is true — substitution fails silently when condition is false, and the compiler tries the next overload. Modern C++20 replaces most SFINAE with Concepts, but understanding SFINAE explains why old code works.",
  ],

  intuition: {
    prose: [
      "**`void_t<expr>` detects validity.** `void_t<decltype(expr)>` is `void` if `expr` is valid — it fails substitution silently if `expr` is invalid. Combined with partial specialization, this lets you detect whether a type has a specific method, member, or operator at compile time.",
    ],
    visualizations: [
      {
        id: "CppLab",
        mathBridge: "**Type traits — run it then explore:**\n\n- `is_base_of_v<Base, Derived>` — check inheritance at compile time.\n- `is_constructible_v<string, int>` — can you construct a string from an int?\n- `is_convertible_v<int, double>` — implicit conversion check.\n- `is_trivially_copyable_v<pair<int,int>>` vs `pair<int,string>` — why different?",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": TRAITS_CODE },
        },
      },
      {
        id: "CppLab",
        mathBridge: "**Type transformations — run it then explore:**\n\n- `make_unsigned_t<int>` → `unsigned int`. `make_signed_t<unsigned>` → `signed int`.\n- `common_type_t<int, double>` — what type can hold both? (double)\n- Chain: `remove_pointer_t<add_pointer_t<int>>` → back to int.\n- `decay_t<int(&)[5]>` — reference to array decays to pointer.",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": TRANSFORM_CODE },
        },
      },
    ],
  },

  rigor: {
    prose: [
      "**SFINAE with `enable_if_t`.** `enable_if_t<cond, T>` is `T` when `cond` is true — the function return type exists. When `cond` is false, the typedef doesn't exist, substitution fails silently, and the compiler tries other overloads. This is how `std::sort` can accept different iterator categories with different implementations.",
      "**The detection idiom with `void_t`.** C++17 `void_t<...>` maps any valid list of types to `void`. Used with partial specialization: the primary template inherits `false_type`, the specialized template (with `void_t<decltype(T::member)>`) inherits `true_type`. If `T::member` doesn't exist, substitution fails and the primary template is chosen.",
    ],
    visualizations: [
      {
        id: "CppLab",
        mathBridge: "**enable_if SFINAE — run it then explore:**\n\n- Try `sum(1.5, 2.5, 3.5)` — which overload? (neither — no 3-arg float overload)\n- `print(string(\"hello\"))` — which overload? (neither — neither integral nor floating point; compile error)\n- SFINAE is silent: adding `print(string)` doesn't conflict.\n- C++20 replacement: `void print(integral auto val)` — cleaner, same result.",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": ENABLE_IF_CODE },
        },
      },
      {
        id: "CppLab",
        mathBridge: "**Detection idiom — run it then explore:**\n\n- Add a `HasBegin<T>` trait that detects `begin()` method — test with `vector<int>` and `int`.\n- Use the trait in `if constexpr`: `if constexpr (HasSize<T>::value) cout << obj.size();`\n- Add `operator+` to Widget — write `HasPlusOp<T>` detecting it.\n- C++20 makes this easier with concepts — but `void_t` is the C++17 pattern.",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": DETECT_CODE },
        },
      },
    ],
    callouts: [
      {
        type: "info",
        title: "C++20 Concepts replace most SFINAE",
        body: "SFINAE with `enable_if` produces unreadable error messages and complex syntax. C++20 Concepts provide the same functionality with clean syntax and better diagnostics. `template<integral T>` replaces `template<typename T, enable_if_t<is_integral_v<T>, int> = 0>`. If you're writing new code, use Concepts.",
      },
      {
        type: "tip",
        title: "Use _v and _t aliases",
        body: "`is_integral_v<T>` (C++17) is shorthand for `is_integral<T>::value`. `remove_const_t<T>` is shorthand for `typename remove_const<T>::type`. Always use the `_v` and `_t` aliases — less verbosity, same semantics.",
      },
    ],
  },

  examples: [
    {
      title: "Type-dispatch serializer",
      body: `template<typename T>
std::string serialize(const T& val) {
    if constexpr (std::is_arithmetic_v<T>)
        return std::to_string(val);
    else if constexpr (std::is_same_v<T, std::string>)
        return "\\"" + val + "\\"";
    else if constexpr (HasToString<T>::value)
        return val.toString();
    else
        return "[unknown]";
}
// No virtual dispatch — fully resolved at compile time`,
    },
    {
      title: "Optimized copy based on trivial-copyability",
      body: `template<typename T>
void copyRange(T* dst, const T* src, size_t n) {
    if constexpr (std::is_trivially_copyable_v<T>) {
        std::memcpy(dst, src, n * sizeof(T));  // O(n) fast byte copy
    } else {
        for (size_t i = 0; i < n; ++i)
            new(dst + i) T(src[i]);             // call copy constructors
    }
}
// std::vector uses this pattern internally`,
    },
  ],

  challenges: [
    {
      difficulty: "easy",
      problem:
        "Write a `printTypeName<T>()` function that prints 'integer', 'floating-point', 'pointer', or 'other' based on type traits. Use `if constexpr`. Test with `int`, `double`, `int*`, `string`.",
      hint: "`if constexpr (is_integral_v<T>) ... else if constexpr (is_floating_point_v<T>) ... else if constexpr (is_pointer_v<T>) ...`",
      walkthrough: [
        "template<typename T> void printTypeName()",
        "if constexpr (is_integral_v<T>) cout << 'integer';",
        "else if constexpr (is_floating_point_v<T>) cout << 'floating-point';",
        "else if constexpr (is_pointer_v<T>) cout << 'pointer';",
        "else cout << 'other';",
      ],
    },
    {
      difficulty: "medium",
      problem:
        "Implement a type-safe `Converter<From, To>` with a static `convert(From)` method. Use enable_if to provide: (1) identity conversion when From==To, (2) numeric cast when both are arithmetic, (3) to_string when To is string and From is arithmetic. Fail to compile for invalid conversions.",
      hint: "Three partial specializations with enable_if or three overloads. Primary template with static_assert(false) for the fallback.",
      walkthrough: [
        "template<typename From, typename To, typename = void> struct Converter { static_assert(false); };",
        "Specialize for same type: return val directly",
        "Specialize for arithmetic: return static_cast<To>(val)",
        "Specialize for To=string: return to_string(val)",
      ],
    },
  ],

  assessment: {
    questions: [
      {
        id: "cpp3-003-q1",
        type: "choice",
        text: "What is SFINAE?",
        options: [
          "A runtime exception handling mechanism",
          "Substitution Failure Is Not An Error — failed template instantiation is silently discarded, and the compiler tries other overloads",
          "A compiler optimization for templates",
          "A way to detect memory leaks at compile time",
        ],
        answer: 1,
        explanation:
          "SFINAE (Substitution Failure Is Not An Error) means that when the compiler tries to instantiate a template and the substitution fails (e.g., a type doesn't have the required member), it silently skips that overload and tries others — instead of issuing a compile error. This enables conditional template selection.",
      },
      {
        id: "cpp3-003-q2",
        type: "choice",
        text: "What does `std::enable_if_t<std::is_integral_v<T>, int>` evaluate to when T is `double`?",
        options: [
          "int",
          "Substitution failure — the type doesn't exist, causing that overload to be discarded",
          "void",
          "double",
        ],
        answer: 1,
        explanation:
          "`enable_if_t<false, int>` does not define a `type` member — accessing it is a substitution failure. For SFINAE to work, this failure must occur in the immediate context of the template signature. The overload is silently discarded.",
      },
      {
        id: "cpp3-003-q3",
        type: "choice",
        text: "What does `void_t<decltype(declval<T>().toString())>` do?",
        options: [
          "Calls toString() on T and discards the result",
          "Maps to void if T has a toString() method, otherwise fails substitution (used in detection idiom)",
          "Converts the result of toString() to void",
          "Asserts at compile time that toString() returns void",
        ],
        answer: 1,
        explanation:
          "`declval<T>()` creates an unevaluated T without constructing it. `decltype(expr)` gets the type of an expression without evaluating it. If `T::toString()` doesn't exist, `decltype` fails. `void_t<>` wraps this — if it fails, the specialization doesn't match, and the primary template (with `false_type`) is chosen.",
      },
      {
        id: "cpp3-003-q4",
        type: "choice",
        text: "What is the difference between `is_trivially_copyable_v<T>` being true vs false for an optimization?",
        options: [
          "No difference — all types can be memcpy'd",
          "Trivially copyable types can use memcpy (O(n) byte copy) instead of calling n copy constructors",
          "Trivially copyable types don't need destructors",
          "Only trivially copyable types can be put in containers",
        ],
        answer: 1,
        explanation:
          "Trivially copyable types (like `int`, `float`, plain structs without constructors) can be safely copied with `memcpy` — a single O(n) byte copy. Non-trivially-copyable types (like `string` with internal pointers) must have their copy constructor called for each element. `std::vector` and `std::copy` use this distinction for optimization.",
      },
    ],
  },
};

export default lesson;
