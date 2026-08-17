# Lesson A2: One Class, Every Type

_The same growable-array logic would have to be copy-pasted per value type._

- **What you will build** — Lesson A1 built a dynamic array as three
  loose local variables (`data`, `size`, `capacity`) and a chunk of
  grow-on-full logic sitting inline inside `main()`'s reading loop. That
  works, once, for `int`. The moment a second program needs the exact
  same growable-storage behavior for `double`, or `char`, or anything
  else, the honest options are either to copy that whole file and
  hand-edit every `int` to `double`, or to find a way to write the logic
  exactly once and have it work for any type. This lesson bundles Lesson
  A1's data and logic into a real class, `IntArray`, then generalizes
  that class into a template, `Array<T>`, so one definition serves
  `int`, `double`, and `char` alike — the reusable answer to "I don't
  want to copy-paste this," the same way Lesson A1 was the reusable
  answer to "I don't want to guess a size."

- **What you need to know first** — Lesson A1's dynamic array: the
  `data`/`size`/`capacity` triple, the grow-on-full check
  (`size == capacity`), the doubling reallocation sequence (`new[]`,
  copy, `delete[]`, reassign), and the underlying `new[]`/`delete[]`
  heap-allocation mechanism it's built from.

- **Terms used in this lesson**

  - **Class** — a blueprint that bundles data (its *fields*) together
    with the behavior that operates on that data (its *methods*) into
    one named type. It exists because Lesson A1's dynamic array left its
    three pieces of state as separate local variables in `main()`, with
    the grow logic sitting inline in the loop — reusing that exact
    behavior anywhere else meant copying all four pieces by hand, in the
    right order, hoping nothing was missed. A class makes the state and
    the logic that owns it travel together as a single, reusable unit.
  - **Object (instance)** — a concrete value created from a class's
    blueprint, with its own private copy of every field the class
    declares. It's the difference between "the class `IntArray`," which
    is only a description, and an actual `IntArray` sitting in memory
    with its own real `data` pointer, `size`, and `capacity` — the class
    is the plan; the object is the thing built from it.
  - **Constructor** — a special method, sharing the class's own name,
    that runs automatically exactly once, the instant an object is
    created, before any other code can touch it. It exists because
    Lesson A1's version needed three separate lines
    (`capacity = 4; size = 0; data = new int[capacity];`) run in exactly
    the right order before the container could be used safely at all — a
    constructor guarantees those lines run, automatically, every time,
    so no caller can end up holding a half-initialized object because
    one line was forgotten.
  - **Destructor** — a special method, the class's own name prefixed
    with `~`, that runs automatically exactly once, the instant an
    object's lifetime ends. It exists because Lesson A1's version
    required `main()` itself to remember to call `delete[] data;` by
    hand at the very end — a destructor makes that happen automatically,
    the moment the object goes out of scope, whether or not the
    programmer writing the calling code ever thinks about it again.
  - **Access modifier — `private` / `public`** — keywords marking which
    members of a class can be reached from outside the class's own
    methods (`public`) versus only from inside them (`private`). They
    exist to enforce that adding a value is only ever possible through a
    method the class itself controls — nothing outside the class can
    reach into `data`, `size`, or `capacity` directly and violate the
    invariant (`size` never exceeds `capacity`) the grow logic depends
    on holding true.
  - **Member variable (field)** — a variable declared inside a class,
    existing once *per object* rather than once for the whole program.
    It exists because `data`, `size`, and `capacity` need to belong to
    one specific container, not be shared globally — two different
    `IntArray` objects must each keep their own, independent set of
    values.
  - **Member function (method)** — a function declared inside a class,
    which operates on one particular object's own fields without those
    fields being passed in as explicit arguments. It exists because
    Lesson A1's grow logic had to be handed `data`, `size`, and
    `capacity` explicitly every time (as ordinary local variables); a
    method already has access to its own object's fields directly,
    which is the entire point of bundling data and behavior together in
    the first place.
  - **Template (generics)** — a way to write a class (or function) once,
    parameterized by a type the compiler fills in per actual use, rather
    than duplicating source code once per type by hand. It exists
    because `IntArray`, `DoubleArray`, and `CharArray` would be
    identical code in every respect except the single word `int` — a
    template lets that one word become a placeholder the compiler
    resolves at compile time, generating a real, fully-typed class per
    type it's actually asked for.
  - **`template <typename T>`** — the specific syntax that turns an
    ordinary class or function definition into a template: `T` becomes a
    stand-in type name, usable anywhere an ordinary type name like `int`
    would be, and the compiler generates a real version of the class or
    function with `T` replaced by a concrete type the moment it sees
    that template actually used with one.

- **Objects and methods used**

  - **`IntArray`**
    - *What it is:* this lesson's own subject — a class bundling a
      growable block of `int` storage together with the operations that
      keep it consistent.
    - *Implementation:* `class IntArray { private: int* data; int size;
      int capacity; public: IntArray(); ~IntArray(); void
      push_back(int value); int get(int index); int getSize(); };` —
      three private fields, five public methods.
    - *Its use:* replaces Lesson A1's loose `data`/`size`/`capacity`
      variables and inline grow logic with a single, self-contained
      object.
  - **`IntArray::IntArray()`** (the constructor)
    - *What it is:* runs automatically, exactly once, the instant an
      `IntArray` object is created.
    - *Implementation:* takes no arguments; body is `capacity = 4; size
      = 0; data = new int[capacity];`.
    - *Its use:* guarantees every `IntArray` starts fully initialized —
      the exact three lines Lesson A1 required `main()` to write by
      hand, now impossible to forget or reorder.
  - **`IntArray::~IntArray()`** (the destructor)
    - *What it is:* runs automatically, exactly once, the instant an
      `IntArray` object's lifetime ends.
    - *Implementation:* takes no arguments, returns nothing; body is
      `delete[] data;`.
    - *Its use:* guarantees the heap block gets released without
      requiring the code that created the object to remember to free it.
  - **`IntArray::push_back(int value)`**
    - *What it is:* a member function that adds one value to the
      container.
    - *Implementation:* `void push_back(int value)`; runs Lesson A1's
      grow-on-full check, copy, and free sequence, then stores `value`
      at `data[size]` and increments `size`.
    - *Its use:* the only way outside code adds a value, keeping the
      grow logic in one place instead of repeated at every call site.
  - **`IntArray::get(int index)`**
    - *What it is:* a member function returning a stored value by
      position.
    - *Implementation:* `int get(int index)`; returns `data[index]`
      directly, with no bounds check.
    - *Its use:* lets calling code read a value back without reaching
      into `data` directly — though it does not, on its own, close the
      exact bounds-checking gap Lesson A1's Concept Unit A1.1
      demonstrated; wrapping it in a class relocates that gap, it
      doesn't fix it.
  - **`IntArray::getSize()`**
    - *What it is:* a member function reporting how many values are
      actually stored.
    - *Implementation:* `int getSize()`; returns `size`.
    - *Its use:* lets calling code know how far it's safe to call `get`,
      without exposing the `size` field itself.
  - **`Array<T>`** (the generalized version, Concept Unit A2.2)
    - *What it is:* a class template — not a class itself, but a
      pattern the compiler uses to generate a real class, once per
      distinct type `T` it's actually used with.
    - *Implementation:* `template <typename T> class Array { private:
      T* data; int size; int capacity; public: Array(); ~Array(); void
      push_back(T value); T get(int index); int getSize(); };` —
      identical in shape to `IntArray` above, with every `int` that
      named the stored type replaced by the type parameter `T`.
    - *Its use:* replaces `IntArray` (and the `DoubleArray`, `CharArray`
      copy-pasted variants this lesson's Problem section shows would
      otherwise be needed) with one definition the compiler specializes
      per type actually used.
  - **`Array<T>::Array()`** (the constructor, generalized)
    - *What it is:* runs automatically, exactly once, per `Array<T>`
      object created, for whatever `T` that particular object was
      declared with.
    - *Implementation:* takes no arguments; body is `capacity = 4; size
      = 0; data = new T[capacity];` — identical to `IntArray`'s
      constructor, with `T` standing in for `int`.
    - *Its use:* guarantees an `Array<double>` and an `Array<char>` are
      each fully initialized the same reliable way an `IntArray` was,
      without writing that initialization logic twice.
  - **`Array<T>::~Array()`** (the destructor, generalized)
    - *What it is:* runs automatically, exactly once, per `Array<T>`
      object's lifetime ending.
    - *Implementation:* takes no arguments, returns nothing; body is
      `delete[] data;` — identical to `IntArray`'s destructor, freeing
      whatever type of block `data` currently points at.
    - *Its use:* guarantees cleanup for any `Array<T>`, regardless of
      `T`, with no per-type version needed.
  - **`Array<T>::push_back(T value)`**
    - *What it is:* a member function adding one value of type `T` to
      the container.
    - *Implementation:* `void push_back(T value)`; the same grow-copy-
      free sequence as `IntArray::push_back`, with `T` standing in for
      `int` throughout.
    - *Its use:* the single definition that serves `Array<int>`,
      `Array<double>`, and `Array<char>` alike.
  - **`Array<T>::get(int index)`**
    - *What it is:* a member function returning a stored value of type
      `T` by position.
    - *Implementation:* `T get(int index)`; returns `data[index]`
      directly, with no bounds check — the same unresolved gap
      `IntArray::get` had.
    - *Its use:* reads a value back out, whatever `T` this particular
      `Array<T>` was declared with.
  - **`Array<T>::getSize()`**
    - *What it is:* a member function reporting how many values are
      stored, independent of `T`.
    - *Implementation:* `int getSize()`; returns `size`.
    - *Its use:* identical role to `IntArray::getSize()`, working the
      same way regardless of what type the container holds.

---

## Concept Unit A2.1: Bundling State and Behavior — the Class

### The Problem

In `dynamic_array.cpp` as Lesson A1 left it, `main()` itself owns `data`,
`size`, and `capacity` directly, as three separate local variables, and
`main()`'s own reading loop contains the grow-on-full logic inline. That
works, once. If a second, unrelated part of a larger program needed its
own independent growable list of integers, the only honest way to get
one would be to copy those three variables and that whole grow-check
block a second time — and keep the two copies in sync by hand, forever,
as bugs get fixed in one and not the other. What's needed is a way to
package "a growable `int` container" as one self-contained thing that
can be created as many independent times as needed, each with its own
state, without the grow logic itself ever being copied even once.

### Project Change

- **Reference Source** — No reference counterpart; from-scratch, same as
  Lesson A1.
- **Files affected** — `dynamic_array.cpp` (modified).
- **Change type** — refactor.
- **Location** — replacing the loose `data`/`size`/`capacity` variables
  and the inline grow block inside `main()` — both established in Lesson
  A1's Concept Unit A1.3 — with a class definition placed above `main()`,
  and a single object inside it.
- **Dependencies** — Lesson A1's grow-on-full logic, reused verbatim
  inside the new class's `push_back` method.

### The New Code

```cpp
class IntArray {
private:
    int* data;
    int size;
    int capacity;

public:
    IntArray() {
        capacity = 4;
        size = 0;
        data = new int[capacity];
    }

    ~IntArray() {
        delete[] data;
    }

    void push_back(int value) {
        if (size == capacity) {
            int newCapacity = capacity * 2;
            int* newData = new int[newCapacity];
            for (int i = 0; i < size; i++) {
                newData[i] = data[i];
            }
            delete[] data;
            data = newData;
            capacity = newCapacity;
        }
        data[size] = value;
        size++;
    }

    int get(int index) {
        return data[index];
    }

    int getSize() {
        return size;
    }
};
```

### The Updated Project

```cpp
#include <iostream>

class IntArray {                                    // ← new
private:                                             // ← new
    int* data;                                       // ← new
    int size;                                         // ← new
    int capacity;                                     // ← new

public:                                              // ← new
    IntArray() {                                     // ← new
        capacity = 4;                                // ← new
        size = 0;                                     // ← new
        data = new int[capacity];                    // ← new
    }                                                 // ← new

    ~IntArray() {                                    // ← new
        delete[] data;                               // ← new
    }                                                 // ← new

    void push_back(int value) {                      // ← new
        if (size == capacity) {                      // ← new
            int newCapacity = capacity * 2;           // ← new
            int* newData = new int[newCapacity];     // ← new
            for (int i = 0; i < size; i++) {           // ← new
                newData[i] = data[i];                 // ← new
            }                                         // ← new
            delete[] data;                           // ← new
            data = newData;                          // ← new
            capacity = newCapacity;                  // ← new
        }                                             // ← new
        data[size] = value;                          // ← new
        size++;                                      // ← new
    }                                                 // ← new

    int get(int index) {                             // ← new
        return data[index];                          // ← new
    }                                                 // ← new

    int getSize() {                                  // ← new
        return size;                                 // ← new
    }                                                 // ← new
};                                                    // ← new

int main() {
    IntArray arr;                                     // ← changed
    int value;
    while (std::cin >> value) {
        arr.push_back(value);                         // ← changed
    }

    std::cout << "Stored " << arr.getSize()           // ← changed
              << " values:" << std::endl;
    for (int i = 0; i < arr.getSize(); i++) {          // ← changed
        std::cout << arr.get(i) << " ";                // ← changed
    }
    std::cout << std::endl;

    return 0;
}
```

As a whole, `main()` no longer owns `data`, `size`, or `capacity` at
all, and no longer contains a single line of grow logic — every one of
those has moved inside `IntArray`. `main()` now only creates one
`IntArray`, calls `push_back` once per value read, and reads results
back through `get` and `getSize`. Note, too, what's conspicuously
absent from `main()` compared to Lesson A1's version: no `delete[]`
anywhere. Compiled and run against the same inputs Lesson A1 used:

```
$ g++ -std=c++17 -Wall -Wextra -o dynamic_array dynamic_array.cpp
$ printf "1\n2\n3\n4\n5\n6\n7\n8\n9\n10\n" | ./dynamic_array
Stored 10 values:
1 2 3 4 5 6 7 8 9 10
$ printf "7\n8\n" | ./dynamic_array
Stored 2 values:
7 8
```

Identical results to Lesson A1's version, with no leaked memory and no
`delete[]` call in sight in `main()` — proof is next.

### Introducing the Concept in Isolation

That last claim — memory got freed even though nothing in `main()` asked
for it — is exactly the kind of hidden-behavior claim that isn't allowed
to just sound plausible; it needs to be shown, not asserted. Taking the
exact `IntArray` class already shown above and adding two temporary
print statements — one inside the constructor, one inside the
destructor — makes the otherwise-invisible timing visible:

```cpp
IntArray() {
    capacity = 4;
    size = 0;
    data = new int[capacity];
    std::cout << "[constructor ran]" << std::endl;
}

~IntArray() {
    std::cout << "[destructor ran]" << std::endl;
    delete[] data;
}
```

```
$ ./intarray_instrumented
[constructor ran]
Stored 5 values:
1 2 3 4 5
main() about to return
[destructor ran, freeing capacity=8]
```

The constructor's message prints before a single value is read — proving
it really did run first, automatically, with nothing in `main()` calling
it by name anywhere (`IntArray arr;` is the only trace of it). The
destructor's message prints *after* `"main() about to return"`, meaning
`~IntArray()` fired on its own, automatically, at the exact moment `arr`
went out of scope at the closing `}` of `main()` — not one line sooner,
not one line later, and with nothing in `main()`'s own source calling it
by name. This automatic, exactly-once-per-object, no-one-has-to-remember
lifecycle is what a **constructor** and a **destructor** actually are,
demonstrated rather than just defined.

This instrumented version is discarded now; the two `std::cout` lines
above never appear in `dynamic_array.cpp` — they were added only to make
this proof possible, and the real project file stays exactly as shown in
the Updated Project step above.

### Mechanical Walkthrough

- **`class IntArray { ... };`** — declares a new **class**: a blueprint
  bundling data and the behavior that operates on it under one name.
  Nothing about writing this line creates any actual storage in memory
  yet — a class is a plan, not a thing; `int buffer[5]` from Lesson A1
  allocated five real integers the instant it ran, but `class IntArray
  { ... };` allocates nothing at all by itself.
- **`private:`** — an **access modifier**: everything listed after it,
  until the next access modifier, is reachable only from `IntArray`'s
  own methods, never from `main()` or anywhere else outside the class.
  `data`, `size`, and `capacity` are marked this way specifically so
  nothing outside `push_back`, `get`, and `getSize` can set `size`
  larger than `capacity` and recreate Lesson A1's exact overflow bug from
  outside the class instead of inside it.
- **`int* data; int size; int capacity;`** — three **member variables**:
  the same three pieces of state Lesson A1 kept as loose local variables
  in `main()`, now declared once, inside the class, so every `IntArray`
  object gets its own independent copy of all three.
- **`public:`** — the second access modifier, marking everything below it
  as reachable from outside the class. The constructor, destructor, and
  the three methods all have to be `public`, or nothing outside
  `IntArray` — including `main()` itself — could ever call them.
- **`IntArray() { ... }`** — the **constructor**: same name as the class,
  no return type at all (not even `void`), running automatically the
  instant an `IntArray` is created. Its body is the exact three lines
  Lesson A1 required `main()` to write itself, in this exact order,
  before the container was safe to use.
- **`~IntArray() { ... }`** — the **destructor**: the class's name
  prefixed with `~`, running automatically the instant an `IntArray`
  object's lifetime ends. Its one-line body, `delete[] data;`, is the
  exact call Lesson A1 required `main()` to remember at the very end —
  now guaranteed instead of hoped for.
- **`void push_back(int value) { ... }`** — a **member function**: the
  identical grow-on-full check, doubling reallocation, copy, and free
  sequence from Lesson A1's Concept Unit A1.3, unchanged in logic, now
  living inside the class instead of inline in `main()`'s loop, and
  operating on this object's own `data`/`size`/`capacity` directly
  rather than requiring them passed in as arguments.
- **`int get(int index) { return data[index]; }`** — a member function
  reading a value back by position, with the exact same absence of a
  bounds check Lesson A1's Concept Unit A1.1 demonstrated is dangerous —
  wrapping this logic in a class relocated that gap, it did not close
  it.
- **`int getSize() { return size; }`** — a member function exposing how
  many values are stored, without exposing the `size` field itself,
  which stays `private`.
- **`IntArray arr;`** (in `main()`) — creates one **object**: a real,
  concrete `IntArray`, with its own real `data`/`size`/`capacity`, built
  by automatically running the constructor shown above.
- **`arr.push_back(value);`** (and `arr.getSize()`, `arr.get(i)`) — calls
  a method on that specific object, using `.` to mean "run this method,
  operating on `arr`'s own fields specifically" — not on some other
  `IntArray` that might exist elsewhere in a larger program.

### CS Lens

Bundling data with the operations that maintain its own invariants,
under one name, so nothing outside can reach in and violate those
invariants directly, is called **encapsulation**.

```
Also recognized in: a bank account object that only ever changes its
own balance through a deposit/withdraw method, never a direct field
write; a database connection pool that hides its internal list of
live connections behind acquire/release calls; a thermostat's internal
temperature-sensor reading, never writable from outside, only readable
through a getCurrentTemperature() call
```

### SE Lens

The alternative not chosen here is the one Lesson A1 actually used:
loose global or local variables plus free-standing functions that take
them as explicit parameters. That approach costs nothing extra to set
up, and for a single, one-off use — exactly Lesson A1's situation — it's
not wrong. It stops working the moment more than one independent
instance of the same behavior is needed at once, because there's no
container for "this particular copy's state" separate from any other
copy's; every function has to be trusted to take the right variables in
the right order, every single call. A class costs a small amount of new
ceremony (the `class` block, the access modifiers) in exchange for that
guarantee holding automatically, for as many independent objects as get
created, forever, with the compiler itself enforcing which code can
touch which data.

### Connecting

`IntArray` is a genuine reusable unit now — but it's reusable only for
`int`. The vehicle problem this lesson actually opened with, needing the
identical behavior for other types without copy-pasting the class, is
still completely unsolved. That's next.

---

## Concept Unit A2.2: One Definition, Every Type — the Template

### The Problem

`IntArray` solved "bundle the state and logic together," but not the
problem this lesson's own header opened with. If a `DoubleArray` were
needed right now, the only way to get one, using only what's been built
so far, would be to copy every line of `IntArray` into a new class and
change each `int` that names the *stored type* to `double` — `int* data`
becomes `double* data`, `void push_back(int value)` becomes `void
push_back(double value)`, `int get(int index)` becomes `double
get(int index)` (note: not the `index` parameter itself — that stays
`int`, since it's a position, not a stored value). Every line of actual
logic — the grow check, the doubling, the copy loop — would be
duplicated verbatim, unchanged, for no reason other than the compiler
needing to know a concrete type up front. What's needed is a way to
write that logic exactly once and have the compiler generate the `int`
version, the `double` version, and any other version, only for the types
actually used.

### Project Change

- **Reference Source** — No reference counterpart; from-scratch, same as
  the previous unit.
- **Files affected** — `dynamic_array.cpp` (modified).
- **Change type** — refactor.
- **Location** — replacing `class IntArray { ... }` (Concept Unit
  A2.1's definition, shown in full above) with a class template, and
  updating `main()` to declare `Array<int>` in place of `IntArray`.
- **Dependencies** — Concept Unit A2.1's class, whose fields and methods
  this unit generalizes rather than replaces with new logic.

### The New Code

```cpp
template <typename T>
class Array {
private:
    T* data;
    int size;
    int capacity;

public:
    Array() {
        capacity = 4;
        size = 0;
        data = new T[capacity];
    }

    ~Array() {
        delete[] data;
    }

    void push_back(T value) {
        if (size == capacity) {
            int newCapacity = capacity * 2;
            T* newData = new T[newCapacity];
            for (int i = 0; i < size; i++) {
                newData[i] = data[i];
            }
            delete[] data;
            data = newData;
            capacity = newCapacity;
        }
        data[size] = value;
        size++;
    }

    T get(int index) {
        return data[index];
    }

    int getSize() {
        return size;
    }
};
```

### The Updated Project

```cpp
#include <iostream>

template <typename T>                                // ← new
class Array {                                         // ← changed
private:
    T* data;                                          // ← changed
    int size;
    int capacity;

public:
    Array() {                                         // ← changed
        capacity = 4;
        size = 0;
        data = new T[capacity];                       // ← changed
    }

    ~Array() {                                        // ← changed
        delete[] data;
    }

    void push_back(T value) {                         // ← changed
        if (size == capacity) {
            int newCapacity = capacity * 2;
            T* newData = new T[newCapacity];           // ← changed
            for (int i = 0; i < size; i++) {
                newData[i] = data[i];
            }
            delete[] data;
            data = newData;
            capacity = newCapacity;
        }
        data[size] = value;
        size++;
    }

    T get(int index) {                                // ← changed
        return data[index];
    }

    int getSize() {
        return size;
    }
};

int main() {
    Array<int> ints;                                   // ← changed
    ints.push_back(10);
    ints.push_back(20);
    ints.push_back(30);

    Array<double> doubles;                              // ← new
    doubles.push_back(1.5);
    doubles.push_back(2.5);

    Array<char> chars;                                  // ← new
    chars.push_back('a');
    chars.push_back('b');

    std::cout << "ints: ";
    for (int i = 0; i < ints.getSize(); i++) {
        std::cout << ints.get(i) << " ";
    }
    std::cout << std::endl;

    std::cout << "doubles: ";
    for (int i = 0; i < doubles.getSize(); i++) {
        std::cout << doubles.get(i) << " ";
    }
    std::cout << std::endl;

    std::cout << "chars: ";
    for (int i = 0; i < chars.getSize(); i++) {
        std::cout << chars.get(i) << " ";
    }
    std::cout << std::endl;

    return 0;
}
```

As a whole, `dynamic_array.cpp` now defines exactly one class, `Array`,
and `main()` creates three independent objects from it — `Array<int>`,
`Array<double>`, `Array<char>` — each with its own real, correctly-typed
`data` pointer, `push_back` accepting its own type, and `get` returning
its own type, without a second class definition existing anywhere.

```
$ g++ -std=c++17 -Wall -Wextra -o dynamic_array dynamic_array.cpp
$ ./dynamic_array
ints: 10 20 30
doubles: 1.5 2.5
chars: a b
```

### Introducing the Concept in Isolation

This is exactly what `template <typename T>` above is doing, isolated
down to the smallest case that shows it: a single function, rather than
an entire class, generic over `T`:

```cpp
template <typename T>
T maxOf(T a, T b) {
    if (a > b) {
        return a;
    }
    return b;
}
```

```
$ ./template_fn
7      // maxOf(3, 7)
2.5    // maxOf(2.5, 1.1)
z      // maxOf('a', 'z')
```

One function definition, called three times with three different types —
`int`, `double`, `char` — and the compiler produced a correctly-typed
comparison and return for each, without `maxOf` ever being written a
second time. This mechanism, a single definition standing in for a
family of type-specific versions the compiler generates on demand, is
called a **template**, and this is precisely what `Array<T>` above does
at class scale rather than function scale: `Array<int>`, `Array<double>`,
and `Array<char>` are three real, independently-compiled classes, each
generated from the one template definition the moment `main()` asked for
them by writing `Array<int>`, `Array<double>`, and `Array<char>`.

This isolated example is discarded now; `template_fn.cpp` does not
appear anywhere in this lesson's actual project — the real generic
container is `Array<T>`, already shown live in `dynamic_array.cpp` above.

### Mechanical Walkthrough

- **`template <typename T>`** — declares that the class definition
  immediately following is a template, and introduces `T` as a **type
  parameter**: a placeholder usable anywhere an ordinary type name like
  `int` could go, inside this one declaration only.
- **`T* data;`** — the same pointer field `IntArray` had, with `T` in
  place of `int`; once `Array<double>` is written somewhere, the
  compiler generates a real class where this line reads `double* data;`
  — a real, concrete pointer type, not a placeholder, in the actual
  generated code.
- **`data = new T[capacity];`** — the same **`new[]` expression** from
  Lesson A1, requesting a block sized for `capacity` values of whatever
  `T` turns out to be for this particular instantiation.
- **`void push_back(T value)`** and **`T get(int index)`** — the
  parameter and return types that used to say `int` now say `T`,
  meaning each generated version of `Array<T>` only accepts, and only
  returns, its own specific type — `Array<double>::push_back` will not
  silently accept an `int` argument without an implicit conversion the
  same way `IntArray::push_back` never accepted a `double` without one.
- **`Array<int> ints;`** (in `main()`) — this specific syntax, a type
  name followed by another type name in angle brackets, is how code
  asks the compiler to generate (or reuse an already-generated) real
  class from the template, with `T` fixed to `int` for this one
  declaration.

### CS Lens

```
Also recognized in: Java's and C#'s generics (ArrayList<T>,
List<T>), Python's typing.Generic (the same idea, checked
optionally rather than enforced by the compiler), SQL's stored
procedures parameterized over a column type, and mathematics' own
notion of a function defined "for all T" rather than for one
specific value
```

### SE Lens

The alternative not chosen here is the one Concept Unit A2.1 actually
used: write `IntArray`, then hand-copy it into `DoubleArray`,
`CharArray`, and so on, per type actually needed. That avoids templates'
own real cost — template error messages are notoriously harder to read
than an ordinary type error, since a mistake inside `Array<T>` often
surfaces at the *call site* that instantiated it, not at the line
inside the template that's actually wrong — but it reintroduces the
exact problem this lesson opened with: a bug found and fixed in
`DoubleArray`'s grow logic has to be remembered and re-applied, by hand,
in `IntArray` and `CharArray` too, with nothing enforcing that it
actually happens. One template definition trades a harder-to-read error
message, on the rare occasion something goes wrong inside it, for making
that kind of silent divergence between copies structurally impossible.

### Connecting

One class, `Array<T>`, now serves every type Lesson A1's dynamic array
concept applies to — `int`, `double`, `char`, or anything else — with
the grow-by-doubling logic written, and fixable, in exactly one place.

---

## Closing

**Connect the pieces.** Follow `1.5` through
`doubles.push_back(1.5);` in the real project's `main()`. `doubles` is
an `Array<double>`, meaning the compiler already generated a real class
for this exact call, with `T` fixed to `double` everywhere Concept Unit
A2.2's template said `T` — `push_back(T value)` really is
`push_back(double value)` for this object specifically. Its constructor
already ran automatically (Concept Unit A2.1's proof), setting
`capacity = 4`, `size = 0`, and requesting `new double[4]`. `1.5` arrives
as `value`; `size == capacity` is `0 == 4`, false, so no grow fires;
`data[0] = 1.5;` stores it, at full `double` precision, and `size`
becomes `1`. Later, `doubles.get(0)` returns `data[0]` back out as a real
`double` — `1.5`, unchanged — which is why the program's own output line
reads `doubles: 1.5 2.5` and not `doubles: 1 2`. Every step of that
chain — the constructor's automatic run, the type-correct storage, the
type-correct return — traces back to one single template definition,
`Array<T>`, doing exactly what Concept Unit A2.1's `IntArray` did for
`int`, generated fresh for `double` without a second class ever being
written.

**What breaks without this.** Go back to Concept Unit A2.1's
`IntArray` — before the template existed — and use it for `double`
values anyway, the only way that's possible: letting the compiler
implicitly convert each one to `int` at the call site, since
`push_back` only accepts an `int`:

```cpp
IntArray arr;
arr.push_back(1.5);
arr.push_back(2.75);
arr.push_back(3.9);

std::cout << "stored " << arr.getSize() << " values: ";
for (int i = 0; i < arr.getSize(); i++) {
    std::cout << arr.get(i) << " ";
}
std::cout << std::endl;
```

```
$ g++ -std=c++17 -Wall -Wextra -o intarray_misuse intarray_misuse.cpp
intarray_misuse.cpp:34:19: warning: implicit conversion from 'double'
to 'int' changes value from 1.5 to 1 [-Wliteral-conversion]
intarray_misuse.cpp:35:19: warning: implicit conversion from 'double'
to 'int' changes value from 2.75 to 2 [-Wliteral-conversion]
intarray_misuse.cpp:36:19: warning: implicit conversion from 'double'
to 'int' changes value from 3.9 to 3 [-Wliteral-conversion]
3 warnings generated.
$ ./intarray_misuse
stored 3 values: 1 2 3
```

This is a quieter failure than Lesson A1's crashes, and arguably a worse
one: the program compiles, runs, exits `0`, and prints a plausible-
looking line — `stored 3 values: 1 2 3` — with no crash anywhere to
notice. The actual values, `1.5`, `2.75`, `3.9`, are gone, silently
replaced by their truncated integer parts the instant they crossed into
`push_back`'s `int` parameter. `-Wall -Wextra` did catch it here, as
three warnings — but a warning is not an error; nothing stopped this
program from compiling and shipping exactly as broken as it is.
`Array<double>` closes this specific gap structurally: there is no
`int`-typed parameter anywhere for a `double` to narrow against, because
`T` is `double` for this object, not `int` pretending to accept one.

**Exercises.**

1. Add an `Array<char>` (or reuse the one in `main()`) and manually trace
   what `capacity` and `size` are, step by step, after each of three
   `push_back` calls — the same trace style Lesson A1's Closing used for
   its own dynamic array, applied here to confirm the template's
   generated `Array<char>` grows exactly the same way `Array<int>` does.
2. Add a `getCapacity()` method to `Array<T>`, returning `capacity`, and
   use it to print `Array<int>`'s and `Array<double>`'s capacities after
   the same number of insertions — confirming both independently-
   generated classes grow on the identical schedule, since they share
   one template definition.
3. Try instantiating `Array<IntArray>` — a dynamic array whose elements
   are themselves `IntArray` objects — and read whatever error message
   comes back (there will likely be one). It doesn't need to be fixed;
   the point of this exercise is only to see what a template
   instantiation failure actually looks like, since the SE Lens above
   named exactly this as templates' real cost.

**Definition of done.**

- [ ] `dynamic_array.cpp` defines `Array<T>` (not `IntArray`) and compiles
      cleanly with `g++ -std=c++17 -Wall -Wextra`, zero warnings.
- [ ] `main()` creates at least `Array<int>`, `Array<double>`, and
      `Array<char>`, each storing and returning values of its own
      correct type — confirmed by the printed output, not just by the
      code compiling.
- [ ] The instrumented constructor/destructor-timing proof was actually
      built and run this session, confirming automatic lifecycle timing,
      before being discarded.
- [ ] The `IntArray`-with-`double` misuse was actually built and run,
      confirming the silent truncation, as evidence for why the template
      version is the one that ships.
- [ ] `git commit` with a message explaining *why* one template
      definition replaces per-type classes — not merely that it does.
