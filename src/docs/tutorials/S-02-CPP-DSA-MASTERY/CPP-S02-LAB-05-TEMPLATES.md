# CPP DSA — LAB-05 — Templates: Writing Code Once for Every Type

**Prerequisites:** LAB-04 (RAII, Destructors, and the Rule of Three)

## Quick Check

Before starting, answer these (answers at the bottom):

1. Without templates, if you wanted a `Box` that could hold either an `int` or a `std::string`, what would you have to do — write it twice?
2. What does "compile-time" mean in "templates are resolved at compile time" — resolved into what, and when?
3. Why do template class definitions almost always live entirely in the header file, unlike every other class in this series so far?

## What You Will Build

A generic `Box<T>` class that can hold *any* type — `Box<int>`, `Box<std::string>`, `Box<Fraction>` (from LAB-03) — written exactly once, with the compiler generating a separate, real version of the class for each type you actually use it with.

```
$ ./box_demo
intBox holds: 42
stringBox holds: hello templates
fractionBox holds: 3/4
```

## Concept: Templates — Generic Code the Compiler Specializes For You

**What it is:** A template is a blueprint for a class or function that's parameterized by a type — written with `template<typename T>` (or the older, equivalent `template<class T>`) before the class/function, using `T` as a placeholder wherever a concrete type would normally go. The compiler doesn't compile the template itself into machine code; instead, every time you actually *use* it with a specific type (`Box<int>`, `Box<std::string>`), the compiler generates — behind the scenes, silently — a complete, real class specifically for that type, as if you'd hand-written a separate `BoxInt`, `BoxString`, etc.

**The problem before:** Every data structure this series is building — `MyVector`, `MyLinkedList`, `MyHashMap` — is useless if it only holds `int`. A real dynamic array needs to hold whatever type the program needs: integers, strings, `Fraction`s, custom game objects. Without templates, supporting multiple types means either writing the entire class once per type (massive duplication, and a bug fixed in `IntVector` doesn't automatically get fixed in `StringVector`), or using something like `void*` to erase the type entirely (which throws away all of C++'s compile-time type checking, letting you accidentally treat an `int` as a `std::string` with no error until the program crashes at runtime).

**The solution:** Write the class once, generically, with `T` standing in for "whatever type this instance is holding." `Box<int>` and `Box<std::string>` share the exact same source code but become two entirely separate, independently-compiled classes once the compiler processes them — each with `T` replaced by the real type throughout. This is called **template instantiation**, and it happens automatically, triggered just by writing `Box<int> myBox;` somewhere in your code.

**Canonical example:**

```cpp
template<typename T>
class Box {
private:
    T value;
public:
    Box(T v) : value(v) {}
    T get() const { return value; }
};

Box<int> intBox(42);
Box<std::string> stringBox("hello");
```

**Project Application:** Starting with LAB-06, every data structure this series builds is a template — `MyVector<T>`, `MyLinkedList<T>`, `MyHashMap<K, V>` — because a real, reusable data structure needs to work for any type its user needs, exactly the problem this lab exists to solve.

**Watch for:** Splitting a template class into a `.h` declaration and a `.cpp` definition the same way LAB-01 taught for ordinary classes. Templates mostly don't work that way — because the compiler needs the *full* template definition available at the exact point it instantiates `Box<int>`, template code almost always lives entirely in the header. This lab's Step 2 explains exactly why, and what error you get if you try to split it anyway.

## Step 1: The problem without templates — duplicated classes

```cpp
// IntBox.h -- works only for int
class IntBox {
private:
    int value;
public:
    IntBox(int v) : value(v) {}
    int get() const { return value; }
};

// StringBox.h -- nearly IDENTICAL code, just for std::string
class StringBox {
private:
    std::string value;
public:
    StringBox(std::string v) : value(v) {}
    std::string get() const { return value; }
};
```

These two classes are structurally identical — same constructor shape, same single `get()` method — differing only in which type replaces `int`/`std::string` throughout. If a bug were found in `IntBox` (say, the constructor should validate something), fixing it means remembering to *also* fix `StringBox`, and every other hand-duplicated `XBox` variant — a maintenance trap that gets worse with every type added.

### SAVE AND TRY

Write a third duplicate, `DoubleBox`, by hand, copy-pasting `IntBox` and replacing `int` with `double` everywhere. Notice how mechanical and error-prone this feels even for a two-line class — now imagine doing this for `MyVector`, a class with dozens of lines, every time a new type is needed.

## Step 2: The generic version, and why it must live in the header

```cpp
// Box.h
#ifndef BOX_H
#define BOX_H

template<typename T>
class Box {
private:
    T value;

public:
    Box(T v) : value(v) {}
    T get() const { return value; }
    void set(T v) { value = v; }
};

#endif
```

Everything — declaration *and* definition — lives in `Box.h`, with no `Box.cpp` at all. Here's why: when your code writes `Box<int> intBox(42);`, the compiler needs to generate a complete, real `Box<int>` class *at that exact point in compilation* — which means it needs to see the *entire* template definition, not just a declaration promising one exists somewhere else. If the definitions were split into a separate `Box.cpp` (the way LAB-01 through LAB-04 did for every non-template class), the compiler compiling *your* file would have no way to see inside `Box.cpp` to generate `Box<int>` — and the linker, which is what normally stitches separately-compiled pieces together, runs too late; it works with already-compiled machine code, not template source it could still instantiate from.

### SAVE AND TRY

As an experiment, try splitting `Box` into `Box.h` (declarations only) and `Box.cpp` (definitions, using `template<typename T>` and `Box<T>::Box(T v)` syntax) the same way you would a normal class. Attempt to use `Box<int>` from a third file. You should get a linker error mentioning an "undefined reference" to `Box<int>`'s constructor — a direct, hands-on confirmation of why templates live in headers, not a copy of the exact bug this step's explanation predicted.

## Step 3: Using `Box<T>` with multiple types, including your own `Fraction`

```cpp
#include "Box.h"
#include "Fraction.h" // from LAB-03
#include <iostream>
#include <string>

int main() {
    Box<int> intBox(42);
    Box<std::string> stringBox("hello templates");
    Box<Fraction> fractionBox(Fraction(3, 4));

    std::cout << "intBox holds: " << intBox.get() << "\n";
    std::cout << "stringBox holds: " << stringBox.get() << "\n";
    std::cout << "fractionBox holds: " << fractionBox.get() << "\n"; // uses LAB-03's operator<< automatically

    return 0;
}
```

`Box<Fraction>` works with *zero changes* to `Box.h` — the template doesn't know or care what `T` will eventually be; it just needs `T` to support whatever operations `Box`'s own code actually uses on it (here: being constructible, being copyable, being assignable — all of which `Fraction` already supports from LAB-03/LAB-04's work). `std::cout << fractionBox.get()` works because `fractionBox.get()` returns a real `Fraction`, and LAB-03 already gave `Fraction` a working `operator<<` — templates compose with everything you've already built, for free.

### SAVE AND TRY

Compile and run this. Confirm all three lines print correctly, including the `Fraction` one — and notice this file needed to `#include "Fraction.h"`, proving `Box<Fraction>` genuinely required `Fraction`'s real definition to be visible, exactly matching Step 2's explanation of why template instantiation needs the full type available.

## Step 4: What happens when `T` doesn't support what the template needs

```cpp
class NoPrinting {
public:
    int value;
    NoPrinting(int v) : value(v) {}
    // deliberately: NO operator<< defined for this class
};

int main() {
    Box<NoPrinting> weirdBox(NoPrinting(5));
    std::cout << weirdBox.get() << "\n"; // this line will NOT compile
    return 0;
}
```

`Box<NoPrinting>` itself compiles fine — `Box`'s own code (`value`, `get()`, `set()`) never tries to print `T`, so instantiating the template for `NoPrinting` succeeds. The failure happens one line later, at `std::cout << weirdBox.get()`, *outside* the template entirely — because *that* line requires an `operator<<` for `NoPrinting`, which doesn't exist. This is a real, common source of confusing template error messages: the error often points at the *usage* site (here) rather than the template definition (`Box.h`), because templates only fail when a specific operation a specific `T` doesn't support is actually attempted.

### SAVE AND TRY

Compile this and read the actual error message your compiler produces. It will likely be long and mention `operator<<` — practice picking out the one line in the middle that actually names the real problem (no matching `operator<<` for `NoPrinting`) versus the surrounding noise about template instantiation. Learning to read through a long template error to find the actual cause is a real, necessary skill for using templates in C++.

## 🎯 Challenge

Add a second type parameter to make a `Pair<T1, T2>` class (two independently-typed values, like a simplified `std::pair`) with a constructor taking both values, `getFirst()`/`getSecond()` accessors, and an `operator<<` that prints `(first, second)`.

<details>
<summary>Solution</summary>

```cpp
// Pair.h
#ifndef PAIR_H
#define PAIR_H

#include <iostream>

template<typename T1, typename T2>
class Pair {
private:
    T1 first;
    T2 second;

public:
    Pair(T1 f, T2 s) : first(f), second(s) {}
    T1 getFirst() const { return first; }
    T2 getSecond() const { return second; }
};

template<typename T1, typename T2>
std::ostream& operator<<(std::ostream& out, const Pair<T1, T2>& p) {
    out << "(" << p.getFirst() << ", " << p.getSecond() << ")";
    return out;
}

#endif
```

```cpp
Pair<int, std::string> p(1, "first place");
std::cout << p << "\n"; // (1, first place)
```

`operator<<` here is itself a template (`template<typename T1, typename T2>` before it) — it needs to be, because it must work for *any* `Pair<T1, T2>` instantiation, not just one specific combination of types, exactly the same generalization the class itself needed. Two independent type parameters, comma-separated inside the angle brackets, is exactly how `std::pair<T1, T2>` and `std::map<K, V>` (which LAB-14 will compare your own `MyHashMap<K, V>` against) both work under the hood.

</details>

## Mental Model

| Concept | Wrong instinct | Correct instinct |
|---|---|---|
| `Box<int>` vs `Box<std::string>` | The same class, working differently at runtime | Two entirely separate classes, generated by the compiler at compile time |
| Where template code lives | Split into `.h`/`.cpp` like every other class | Almost always entirely in the header |
| A type-mismatch template error | Happens inside the template definition | Often happens at the USE site, where a specific operation on `T` is attempted |
| Writing `IntBox`, `StringBox`, `DoubleBox` by hand | A normal, acceptable amount of duplication | Exactly the duplication templates exist to eliminate |

## Final Check

| # | Question | Your answer |
|---|---|---|
| 1 | Why does `Box<Fraction>` require `Fraction.h` to be `#include`-d, while `Box<int>` doesn't need any extra include? | |
| 2 | Why did splitting `Box` into a `.h`/`.cpp` pair produce a linker error instead of a compile error? | |
| 3 | Why might a template error message point at a line far from the template's own definition? | |

## Quick Check Answers

1. Yes — without templates, supporting a second type means either duplicating the entire class with the new type substituted throughout, or erasing the type information entirely (with something like `void*`), which throws away the compiler's ability to catch type mistakes at compile time.
2. Resolved into a real, concrete class or function generated by the compiler specifically for the type(s) you used the template with — this generation happens during compilation, before the program ever runs, which is why using a template with a type it doesn't actually support produces a compile-time error, not a runtime one.
3. Because the compiler needs the complete template definition visible at the exact point it generates (instantiates) a concrete version for a specific type — if the definition lived in a separate `.cpp` file, the compiler processing your code wouldn't have access to it, and the linker (which normally connects separately-compiled pieces) operates on already-compiled machine code, too late to generate a new template instantiation from source.

## Module 1 Complete

This closes the language-features module: header/source separation (LAB-01), classes and encapsulation (LAB-02), operator overloading (LAB-03), RAII and the Rule of Three (LAB-04), and templates (LAB-05). Every data structure starting with LAB-06 is a template class using all four of the previous labs' techniques together — private data, overloaded operators for natural use, a correct destructor/copy-constructor/copy-assignment set, and `typename T` genericity — with no further language-feature lessons needed; from here, it's data structures, one at a time.

*Next: [LAB-06 — Your Own Dynamic Array](CPP-S02-LAB-06-DYNAMIC-ARRAY.md)*
