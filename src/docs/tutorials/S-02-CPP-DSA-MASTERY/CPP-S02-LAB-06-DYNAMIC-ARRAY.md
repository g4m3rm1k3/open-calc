# CPP DSA — LAB-06 — Your Own Dynamic Array

**Prerequisites:** LAB-05 (Templates)

## Quick Check

Before starting, answer these (answers at the bottom):

1. Why can't a plain C-style array (`int arr[10];`) grow past 10 elements, ever, no matter what code you write?
2. If growing an array means allocating a bigger block of memory, why not just grow by exactly 1 slot every time you need 1 more element, instead of doubling capacity?
3. What's the difference between a dynamic array's **size** and its **capacity**?

## What You Will Build

`MyVector<T>` — a template class (LAB-05) implementing a resizable array from raw heap memory, with correct RAII (LAB-04), `operator[]` (LAB-03) for natural indexing, and a visualized trace of exactly when and how it grows.

```
$ ./vector_demo
push_back(1): size=1 capacity=1  [1]
push_back(2): size=2 capacity=2  [1, 2]
push_back(3): size=3 capacity=4  [1, 2, 3]        <- capacity doubled: 2 -> 4
push_back(4): size=4 capacity=4  [1, 2, 3, 4]
push_back(5): size=5 capacity=8  [1, 2, 3, 4, 5]   <- capacity doubled again: 4 -> 8
vec[2] = 3
```

## Concept: Amortized Growth — Why `std::vector` Doubles Instead of Adding One

**What it is:** A dynamic array is a class wrapping a raw heap-allocated array (`T* data`) plus two numbers: **size** (how many elements are actually stored) and **capacity** (how many elements the current allocation could hold before needing to grow). When `push_back` is called and `size == capacity`, the array must **grow**: allocate a new, bigger block, copy every existing element into it, free the old block, and only then add the new element. `MyVector` doubles capacity every time it needs to grow (1 → 2 → 4 → 8 → ...) rather than growing by a fixed small amount.

**The problem before:** A raw C-style array's size is fixed forever at compile time — `int arr[10];` can never hold an 11th element, period, no matter what the program does at runtime. Programs almost never know their exact data size in advance, so something has to handle growing beyond an initial guess. The naive fix — grow by exactly 1 element every time `push_back` is called — means every single `push_back` triggers a full copy of every existing element into a new, 1-larger array. Adding `n` elements this way costs roughly `1 + 2 + 3 + ... + n`, which is `O(n²)` total work — catastrophically slow for large `n` (this is directly LAB-08's complexity lesson from the SE Masterclass series, revisited here in C++).

**The solution:** Grow by *doubling* capacity instead of adding a fixed amount. This means most `push_back` calls are cheap (`O(1)` — just write into already-allocated space), and only the occasional call that actually triggers a resize pays the `O(n)` copy cost — but because doubling means resizes get exponentially rarer as the array grows, the *total* cost of `n` pushes averages out to `O(n)`, not `O(n²)`. This is called **amortized O(1)** per push — not every single call is O(1), but the average, spread across all calls, is.

**Canonical example:**

```cpp
template<typename T>
class MyVector {
private:
    T* data;
    int size;
    int capacity;

    void grow() {
        capacity = (capacity == 0) ? 1 : capacity * 2;
        T* newData = new T[capacity];
        for (int i = 0; i < size; i++) newData[i] = data[i];
        delete[] data;
        data = newData;
    }
public:
    void push_back(T value) {
        if (size == capacity) grow();
        data[size++] = value;
    }
};
```

**Project Application:** LAB-19's file-backed database uses `MyVector<Record>` to hold parsed records loaded from disk before they're indexed into LAB-14's hash table — the exact "load an unknown number of items, one at a time" scenario dynamic arrays exist for.

**Watch for:** Forgetting the Rule of Three (LAB-04) on this class. `MyVector` owns a raw `T* data` pointer, exactly the situation LAB-04 warned about — without a correct destructor, copy constructor, and copy assignment operator, copying a `MyVector` produces the exact double-free crash LAB-04 reproduced on purpose, just with `MyVector` in place of `Buffer`.

## Step 1: The fixed-size problem, made concrete

```cpp
int scores[5]; // fixed at exactly 5, forever, decided at compile time
scores[0] = 90;
scores[1] = 85;
// ... what happens when a 6th score needs to be stored? There is no scores[5] slot.
// scores[5] = 100;  // undefined behavior -- writes past the end of allocated memory
```

Writing past the end of a fixed-size array (`scores[5]` when the array only has indices 0–4) doesn't necessarily crash immediately — it's undefined behavior, meaning it might silently corrupt whatever memory happens to be adjacent, or crash, or appear to work, depending on what's nearby. This unpredictability is exactly why a real program needs a structure that *knows* its own bounds and grows safely instead of ever writing past them.

### SAVE AND TRY

Compile and run a program that writes to `scores[5]` and `scores[6]` on a stack-allocated `int scores[5];`, then prints `scores[0]` through `scores[4]` afterward. Depending on your compiler and optimization settings, you may see corrupted values in the original array, or no visible effect at all — either way, notice that nothing about the *language* stopped this, which is precisely the safety gap `MyVector` exists to close.

## Step 2: `MyVector.h` — the fields, constructor, destructor

```cpp
// MyVector.h
#ifndef MY_VECTOR_H
#define MY_VECTOR_H

template<typename T>
class MyVector {
private:
    T* data;
    int size;
    int capacity;
    void grow();

public:
    MyVector() : data(nullptr), size(0), capacity(0) {}
    ~MyVector() { delete[] data; }

    MyVector(const MyVector& other);
    MyVector& operator=(const MyVector& other);

    void push_back(T value);
    T& operator[](int index);
    int getSize() const { return size; }
    int getCapacity() const { return capacity; }
};

template<typename T>
void MyVector<T>::grow() {
    capacity = (capacity == 0) ? 1 : capacity * 2;
    T* newData = new T[capacity];
    for (int i = 0; i < size; i++) newData[i] = data[i];
    delete[] data;
    data = newData;
}

#endif
```

Note this whole class lives in the header — LAB-05's lesson applied directly, since `MyVector<T>` is a template. `data(nullptr)` in the default constructor's initializer list matters: an empty `MyVector` shouldn't allocate anything yet (there's nothing to store), so `data` starts as a null pointer rather than pointing at zero-sized garbage — `grow()`'s first call (`capacity == 0` case) is what performs the very first real allocation, lazily, only once something is actually pushed.

### SAVE AND TRY

Construct a `MyVector<int>` and immediately call `getSize()` and `getCapacity()` before pushing anything — confirm both report `0`, and confirm the program doesn't crash on destruction even though `data` was never allocated (`delete[] nullptr;` is safe by language rule, exactly as LAB-04's Challenge relied on).

## Step 3: `push_back` and `operator[]` — visualizing growth

```cpp
template<typename T>
void MyVector<T>::push_back(T value) {
    if (size == capacity) {
        grow();
    }
    data[size] = value;
    size++;
}

template<typename T>
T& MyVector<T>::operator[](int index) {
    return data[index]; // no bounds check yet -- Step 4 covers why that matters
}
```

`operator[]` returns `T&` — a **reference**, not a copy — which is what makes `vec[2] = 99;` work as an *assignment into the array*, not just reading a copy of what used to be there. This is LAB-03's operator-overloading pattern doing real, load-bearing work now: without it, `MyVector` couldn't be indexed with familiar `[]` syntax at all, only through an awkward named method like `vec.get(2)` / `vec.set(2, 99)`.

### SAVE AND TRY

```cpp
MyVector<int> vec;
for (int i = 1; i <= 5; i++) {
    vec.push_back(i);
    std::cout << "push_back(" << i << "): size=" << vec.getSize()
              << " capacity=" << vec.getCapacity() << "\n";
}
```

Run this and compare the printed capacities against "What You Will Build" at the top of this lab — confirm capacity jumps `0→1→2→4→4→8`, doubling only at the exact moments `size` catches up to the current `capacity`, never on every single push.

## Step 4: The Rule of Three, applied to `MyVector`

```cpp
template<typename T>
MyVector<T>::MyVector(const MyVector& other) : size(other.size), capacity(other.capacity) {
    data = new T[capacity];
    for (int i = 0; i < size; i++) data[i] = other.data[i]; // deep copy, exactly LAB-04's pattern
}

template<typename T>
MyVector<T>& MyVector<T>::operator=(const MyVector& other) {
    if (this == &other) return *this;

    delete[] data;
    size = other.size;
    capacity = other.capacity;
    data = new T[capacity];
    for (int i = 0; i < size; i++) data[i] = other.data[i];

    return *this;
}
```

This is LAB-04's `Buffer` copy constructor and copy assignment operator, applied to `MyVector` with zero conceptual changes — same deep-copy discipline, same self-assignment guard, same "free existing data before replacing it in assignment, but not in construction" distinction. If you skipped LAB-04, this is the exact bug that would otherwise bite here: copying a `MyVector` without these would produce two vectors sharing one `data` pointer, crashing on the second destructor call exactly like LAB-04's broken `Buffer` did.

### SAVE AND TRY

```cpp
MyVector<int> original;
original.push_back(10);
original.push_back(20);

MyVector<int> copy = original; // copy constructor
copy.push_back(30); // modifies ONLY the copy

std::cout << "original size: " << original.getSize() << "\n"; // 2
std::cout << "copy size: " << copy.getSize() << "\n";          // 3
```

Confirm the sizes differ — direct proof `copy` has its own independent `data` allocation, not one shared with `original`.

## 🎯 Challenge

Add bounds-checked access: an `at(int index)` method that throws `std::out_of_range` (from `<stdexcept>`) if `index` is negative or `>= size`, leaving the existing `operator[]` unchecked for speed (exactly the real `std::vector`'s design: `[]` is fast and unchecked, `.at()` is checked and slightly slower).

<details>
<summary>Solution</summary>

```cpp
// MyVector.h -- add
#include <stdexcept>
// ...inside the class...
T& at(int index) {
    if (index < 0 || index >= size) {
        throw std::out_of_range("MyVector index out of range");
    }
    return data[index];
}
```

```cpp
MyVector<int> vec;
vec.push_back(1);
try {
    vec.at(5); // out of range
} catch (const std::out_of_range& e) {
    std::cout << "Caught: " << e.what() << "\n";
}
```

`operator[]` stays deliberately unchecked (Step 3's version, unmodified) — matching real `std::vector` behavior, where `[]` trusts the caller for maximum speed in hot loops, and `.at()` exists specifically for situations where correctness matters more than the small overhead of a bounds check. Both coexisting side by side, rather than one replacing the other, is a deliberate design choice worth recognizing when you eventually read real STL source or documentation.

</details>

## Mental Model

| Concept | Wrong instinct | Correct instinct |
|---|---|---|
| Fixed C array size | Can be grown with the right code | Fixed forever at compile time — no code can extend it |
| Growth strategy | Grow by exactly 1 each time, simplest | Double capacity — amortized O(1) per push instead of O(n²) total |
| `size` vs `capacity` | The same number | `size` = elements actually stored; `capacity` = allocated room before the next resize |
| Copying `MyVector` | The default copy is probably fine | Needs the full Rule of Three, or it double-frees exactly like LAB-04's `Buffer` |

## Final Check

| # | Question | Your answer |
|---|---|---|
| 1 | Why does doubling capacity give amortized O(1) push_back, while growing by 1 each time gives O(n²) total for n pushes? | |
| 2 | Why does `operator[]` return `T&` instead of `T`? | |
| 3 | What specifically would go wrong if `MyVector` didn't implement its own copy constructor? | |

## Quick Check Answers

1. A C-style array's size is part of its type, fixed at compile time — the compiler allocates exactly that much space and nothing about the running program can extend it; a dynamic array instead owns a pointer to heap memory it can reallocate larger whenever needed, which is what makes growth possible at all.
2. Growing by 1 each time means every single push triggers a full copy of all existing elements — for n total pushes, that's roughly 1+2+3+...+n copies, which is O(n²); doubling means resizes happen only at positions 1, 2, 4, 8, 16... — exponentially rarer as the array grows — so the total copying work across n pushes stays proportional to n, not n².
3. Size is the count of elements actually in use right now (what `getSize()` reports, what a `for` loop should iterate up to); capacity is how many elements the current allocation could hold before another resize is needed — capacity is always greater than or equal to size, and the gap between them is unused-but-already-allocated space.

*Next: [LAB-07 — Singly Linked Lists](CPP-S02-LAB-07-SINGLY-LINKED-LIST.md)*
