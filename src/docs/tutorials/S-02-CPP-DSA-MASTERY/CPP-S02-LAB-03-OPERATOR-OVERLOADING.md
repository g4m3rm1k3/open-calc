# CPP DSA — LAB-03 — Operator Overloading

**Prerequisites:** LAB-02 (Classes, Structs, and Encapsulation)

## Quick Check

Before starting, answer these (answers at the bottom):

1. When you write `std::cout << 5;`, what is `<<` actually doing — what does it mean for an operator to be a function?
2. Why can't the compiler automatically figure out how to print a custom class with `std::cout <<` on its own?
3. Why does `operator<<` for printing a class need to be a free function (not a method *of* the class), while `operator+` usually can be either?

## What You Will Build

A `Fraction` class that supports `+`, `==`, and `<<` exactly like a built-in numeric type — `frac1 + frac2`, `frac1 == frac2`, `std::cout << frac1` — all working because you defined what those operators *mean* for a `Fraction`, not because C++ somehow already knew.

```
$ ./fraction_demo
f1 = 1/2
f2 = 1/3
f1 + f2 = 5/6
f1 == f2? false
f1 == Fraction(1, 2)? true
```

## Concept: Operators Are Just Functions With Special Syntax

**What it is:** In C++, `+`, `==`, `<<`, `[]`, and most other operators are, under the hood, ordinary functions — `a + b` for built-in types like `int` is handled by the compiler directly, but for a *class type*, `a + b` is literally sugar for calling a function named `operator+` with `a` and `b` as arguments. **Operator overloading** means writing that function yourself, so an operator that only ever meant something for `int`/`double` can be given a sensible meaning for a class you designed.

**The problem before:** Without operator overloading, adding two `Fraction` objects would require an ugly named method — `f1.add(f2)` — and printing one would require manually pulling out its numerator and denominator every single time you wanted to display it: `std::cout << f1.getNumerator() << "/" << f1.getDenominator();`, repeated at every print site, easy to get subtly wrong or inconsistent between call sites.

**The solution:** Define `operator+`, `operator==`, and `operator<<` for `Fraction`, each specifying exactly what that operator *means* for two fractions. Once defined, `f1 + f2` and `std::cout << f1` work exactly as naturally as they do for `int` — because as far as the compiler's concerned now, they're calling the exact functions you wrote, just through familiar symbol syntax instead of a named-method call.

**Canonical example:**

```cpp
class Fraction {
public:
    int numerator, denominator;
    Fraction(int n, int d) : numerator(n), denominator(d) {}

    Fraction operator+(const Fraction& other) const {
        return Fraction(numerator * other.denominator + other.numerator * denominator,
                         denominator * other.denominator);
    }
};

std::ostream& operator<<(std::ostream& out, const Fraction& f) {
    out << f.numerator << "/" << f.denominator;
    return out;
}
```

**Project Application:** Every container this series builds — `MyVector`, `MyLinkedList`, `MyHashMap` — gets an `operator<<` so you can print its contents in one line while debugging, and several get `operator[]` (LAB-06) so they can be indexed exactly like a built-in array. Operator overloading isn't decoration here; it's how hand-built data structures end up *feeling* like the language's own types.

**Watch for:** Overloading an operator to do something surprising or unrelated to its normal meaning (making `+` on your class trigger a file write, say). This compiles fine — the compiler has no opinion on whether your overload makes *sense* — but it violates the entire reason operator overloading is useful: someone reading `f1 + f2` should be able to trust it behaves the way `+` behaves everywhere else, combining two values into a related third value, not doing something an experienced C++ reader wouldn't expect.

## Step 1: `Fraction.h` — the class, without any operators yet

```cpp
// Fraction.h
#ifndef FRACTION_H
#define FRACTION_H

class Fraction {
public:
    int numerator;
    int denominator;

    Fraction(int n, int d);
};

#endif
```

```cpp
// Fraction.cpp
#include "Fraction.h"

Fraction::Fraction(int n, int d) : numerator(n), denominator(d) {}
```

Starting deliberately without any operators — this is the "before" state the concept section described: without `operator<<`, `operator+`, and `operator==`, using `Fraction` requires manual field access everywhere, which Step 2 will make visible by trying to print one the awkward way first.

### SAVE AND TRY

```cpp
#include "Fraction.h"
#include <iostream>

int main() {
    Fraction f(1, 2);
    std::cout << f.numerator << "/" << f.denominator << "\n"; // the awkward way -- works, but repeats everywhere it's used
    return 0;
}
```

Compile and run it. Confirm it prints `1/2` — then imagine writing that same three-part expression (`f.numerator`, `"/"`, `f.denominator`) at every single place in a real program that needs to print a fraction, and notice how easy it'd be to typo one of those call sites differently from another.

## Step 2: `operator<<` — the free function that makes `std::cout << f` work

```cpp
// Fraction.h -- add this declaration, OUTSIDE the class body
#include <iostream>
// ...class Fraction { ... }; stays the same...

std::ostream& operator<<(std::ostream& out, const Fraction& f);
```

```cpp
// Fraction.cpp -- add the definition
std::ostream& operator<<(std::ostream& out, const Fraction& f) {
    out << f.numerator << "/" << f.denominator;
    return out;
}
```

This function is declared **outside** the `Fraction` class — not as a method — because of how `<<` actually resolves: `std::cout << f` needs the *left-hand* operand (`std::cout`, an `std::ostream`) to determine which `operator<<` overload gets called, and you don't own the `std::ostream` class to add a method to it. A free function taking `(std::ostream&, const Fraction&)` sidesteps that entirely: it's not a method of either type, just an ordinary function the compiler matches based on both argument types. Returning `out` (the same stream reference passed in) is what makes chaining work — `std::cout << f1 << " and " << f2;` only compiles because each `<<` call returns something you can immediately `<<` again.

### SAVE AND TRY

```cpp
Fraction f1(1, 2);
Fraction f2(1, 3);
std::cout << f1 << " and " << f2 << "\n";
```

Confirm this prints `1/2 and 1/3` — and specifically notice this *is* chaining: `std::cout << f1` returns `std::cout` itself (by reference), so `<< " and "` and `<< f2` are really three separate calls to `operator<<` in sequence, each one handed the same stream to keep writing to.

## Step 3: `operator+` — a method, this time, and why the difference matters

```cpp
// Fraction.h -- add inside the class body
class Fraction {
public:
    int numerator;
    int denominator;

    Fraction(int n, int d);
    Fraction operator+(const Fraction& other) const;
};
```

```cpp
// Fraction.cpp
Fraction Fraction::operator+(const Fraction& other) const {
    int newNumerator = numerator * other.denominator + other.numerator * denominator;
    int newDenominator = denominator * other.denominator;
    return Fraction(newNumerator, newDenominator);
}
```

`f1 + f2` with `operator+` as a *method* is sugar for `f1.operator+(f2)` — the left operand (`f1`) is the implicit object the method runs on (`this`), and `other` is the right operand. This works as a method (unlike `operator<<`) specifically because the left-hand side of `+` *is* a `Fraction`, an object you own the class of — there's no equivalent problem to `operator<<`'s "I don't own `std::ostream`" situation. The `const` at the end promises this method doesn't modify `f1` — an addition shouldn't mutate either input, only produce a new result, exactly matching how `+` behaves for `int`.

### SAVE AND TRY

```cpp
Fraction f1(1, 2);
Fraction f2(1, 3);
Fraction sum = f1 + f2;
std::cout << "f1 + f2 = " << sum << "\n";
```

Confirm this prints `f1 + f2 = 5/6` (the unreduced cross-multiplied sum: `1*3 + 1*2 = 5`, over `2*3 = 6`) — and notice `sum` printed correctly via the `operator<<` from Step 2 with zero additional code, since `sum` is just another `Fraction`.

## Step 4: `operator==` — comparing by value, not by identity

```cpp
// Fraction.h -- add inside the class body
bool operator==(const Fraction& other) const;
```

```cpp
// Fraction.cpp
bool Fraction::operator==(const Fraction& other) const {
    // 1/2 and 2/4 should be considered equal, so cross-multiply instead of comparing fields directly
    return numerator * other.denominator == other.numerator * denominator;
}
```

Without `operator==` defined, `f1 == f2` simply wouldn't compile at all for a class type — the compiler has no built-in notion of what "equal" means for two `Fraction`s, unlike `int`, where equality is just comparing the raw bit patterns. Notice the implementation deliberately *doesn't* just compare `numerator == other.numerator && denominator == other.denominator` — that would wrongly say `1/2` and `2/4` are different, when mathematically they're the same fraction; cross-multiplying (`a/b == c/d` exactly when `a*d == c*b`) gets the actual mathematical meaning right, which is the whole point of writing this operator yourself instead of accepting some default the compiler might guess.

### SAVE AND TRY

```cpp
Fraction f1(1, 2);
Fraction f2(1, 3);
Fraction f3(1, 2);
std::cout << "f1 == f2? " << (f1 == f2 ? "true" : "false") << "\n"; // false
std::cout << "f1 == f3? " << (f1 == f3 ? "true" : "false") << "\n"; // true

Fraction f4(2, 4);
std::cout << "f1 == f4? " << (f1 == f4 ? "true" : "false") << "\n"; // true -- 1/2 equals 2/4, even though the stored fields differ
```

Confirm the last comparison prints `true` — direct proof the cross-multiplication approach correctly treats mathematically-equal fractions as equal, even though their raw `numerator`/`denominator` fields are completely different numbers.

## 🎯 Challenge

Add `operator*` (multiplication: `(a/b) * (c/d) = (a*c)/(b*d)`, much simpler than addition — no common denominator needed) and `operator!=` (defined in terms of the `operator==` you already wrote, not reimplemented from scratch — `a != b` should just be `!(a == b)`).

<details>
<summary>Solution</summary>

```cpp
// Fraction.h
Fraction operator*(const Fraction& other) const;
bool operator!=(const Fraction& other) const;
```

```cpp
// Fraction.cpp
Fraction Fraction::operator*(const Fraction& other) const {
    return Fraction(numerator * other.numerator, denominator * other.denominator);
}

bool Fraction::operator!=(const Fraction& other) const {
    return !(*this == other);
}
```

`!(*this == other)` reuses `operator==` instead of duplicating the cross-multiplication logic — `*this` dereferences the `this` pointer to get the actual current `Fraction` object (as opposed to `this` itself, which is a pointer), letting it be passed to `operator==` by value/reference like any other `Fraction`. Defining `!=` in terms of `==` (rather than reimplementing the comparison) means if the equality logic ever needs to change later, there's exactly one place to fix it, not two that could silently drift out of sync.

</details>

## Mental Model

| Concept | Wrong instinct | Correct instinct |
|---|---|---|
| `a + b` on a class | Some built-in magic the compiler provides | A call to `operator+`, a function you wrote |
| `operator<<` for printing | Should be a method of the class | Must be a free function — the left operand is `std::ostream`, which you don't own |
| `operator+`/`operator==` | Should be free functions too, for consistency | Can be methods — the left operand IS your class, which you do own |
| `1/2 == 2/4` | Compare fields directly, they'll never match | Compare by actual mathematical meaning (cross-multiply), not raw storage |

## Final Check

| # | Question | Your answer |
|---|---|---|
| 1 | Why must `operator<<` be a free function instead of a method of `Fraction`? | |
| 2 | Why does `operator<<` return `std::ostream&` instead of returning nothing? | |
| 3 | Why did `operator==` cross-multiply instead of comparing `numerator` and `denominator` directly? | |

## Quick Check Answers

1. `<<` is, for class types, sugar for calling a function named `operator<<` — for `std::cout << 5`, that's `operator<<(std::cout, 5)`, a real function call the compiler just lets you write with symbol syntax instead of a function name.
2. Because a custom class's fields, layout, and intended meaning are something only the class's author defines — the compiler has no generic notion of "here's how to print any class," unlike `int`, where printing is a built-in, well-defined operation.
3. Because the left operand of `<<` in `std::cout << f` is `std::cout`, an `std::ostream` — a type you don't own and can't add methods to — so the only way to hook into `<<` for that combination of types is a free function taking both operands as parameters, letting the compiler match it based on argument types rather than which class it's a method of.

*Next: [LAB-04 — RAII, Destructors, and the Rule of Three](CPP-S02-LAB-04-RAII-AND-RULE-OF-THREE.md)*
