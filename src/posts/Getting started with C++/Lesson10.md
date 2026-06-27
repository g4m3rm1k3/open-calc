# Lesson 10: Pointers — Understanding Memory Addresses in C++

You’ve reached Lesson 10 — congratulations!

Today we’re learning about **pointers**. Pointers are one of the most powerful (and sometimes tricky) features in C++. They let you work directly with memory.

---

## What is a Pointer?

A **pointer** is a variable that stores the **memory address** of another variable.

Think of it like this:

- Normal variable = A house with a name
- Pointer = The address of that house

---

## Basic Pointer Syntax

```cpp
#include <iostream>

int main() {
    int number = 42;
    int* pointer = &number;     // & = address-of operator

    std::cout << "Value of number: " << number << std::endl;
    std::cout << "Address of number: " << &number << std::endl;
    std::cout << "Value stored in pointer: " << pointer << std::endl;
    std::cout << "Value pointed to: " << *pointer << std::endl;   // * = dereference

    return 0;
}
```

- `int*` → declares a pointer to an integer
- `&number` → gets the address of `number`
- `*pointer` → gets the value at that address

---

## Why Use Pointers?

1. Dynamic memory allocation
2. Passing large data efficiently to functions
3. Working with arrays more flexibly
4. Creating complex data structures (linked lists, trees, etc.)

---

## Pointers and Functions

```cpp
#include <iostream>

// Pass by value (original doesn't change)
void passByValue(int x) {
    x = 100;
}

// Pass by pointer (original can change)
void passByPointer(int* x) {
    *x = 100;
}

int main() {
    int value = 25;

    std::cout << "Before: " << value << std::endl;

    passByValue(value);
    std::cout << "After passByValue: " << value << std::endl;

    passByPointer(&value);
    std::cout << "After passByPointer: " << value << std::endl;

    return 0;
}
```

---

## Pointers and Arrays

```cpp
#include <iostream>

int main() {
    int arr[5] = {10, 20, 30, 40, 50};

    std::cout << "Array elements using pointers:" << std::endl;

    for (int i = 0; i < 5; i++) {
        std::cout << "Element " << i << ": " << *(arr + i) << std::endl;
    }

    return 0;
}
```

Note: The array name `arr` acts like a pointer to the first element.

---

## Null Pointers

```cpp
#include <iostream>

int main() {
    int* ptr = nullptr;     // Safe empty pointer

    if (ptr == nullptr) {
        std::cout << "Pointer is null (safe)" << std::endl;
    }

    return 0;
}
```

---

## Mini Project: Swap Two Numbers Using Pointers

```cpp
#include <iostream>

void swap(int* a, int* b) {
    int temp = *a;
    *a = *b;
    *b = temp;
}

int main() {
    int x = 10;
    int y = 25;

    std::cout << "Before swap: x = " << x << ", y = " << y << std::endl;

    swap(&x, &y);

    std::cout << "After swap: x = " << x << ", y = " << y << std::endl;

    return 0;
}
```

---

## Practice Exercises

1. Write a function that finds the maximum and minimum in an array using pointers.
2. Create a program that dynamically allocates an array based on user input size.
3. Write a function that reverses an array using pointers.

---

## Important Tips

- Always initialize pointers (preferably to `nullptr`)
- Be careful with dereferencing (`*`) — dereferencing null or invalid pointers causes crashes
- Pointers are powerful but can be dangerous if misused
- Use references (`&`) when possible instead of pointers for simpler cases

---

Pointers are a big concept — don’t worry if it feels confusing at first. Practice is the key.
