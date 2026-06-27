# Lesson 4: Loops — Repeating Code in C++

So far you’ve learned:

- Lesson 1: First program
- Lesson 2: Variables and data types
- Lesson 3: Making decisions with `if-else`

Now we’re going to learn **loops** — how to make the computer repeat things without writing the same code over and over.

---

## Why Do We Need Loops?

Imagine you want to print the numbers 1 to 10. You could write 10 `std::cout` lines… but that’s silly.

Loops let you repeat code efficiently.

There are two main types we’ll learn today:

1. `for` loop (when you know how many times to repeat)
2. `while` loop (repeat while a condition is true)

---

## The For Loop

```cpp
#include <iostream>

int main() {
    // Print numbers from 1 to 5
    for (int i = 1; i <= 5; i++) {
        std::cout << i << std::endl;
    }

    return 0;
}
```

### Breaking down the for loop:

```cpp
for (int i = 1;      // 1. Create counter variable (initialization)
     i <= 5;         // 2. Condition to check before each repeat
     i++)            // 3. Update the counter after each repeat
```

- `i` is the counter (you can name it anything, but `i` is very common)
- `i++` means “add 1 to i”

---

## Different Ways to Use For Loops

```cpp
#include <iostream>

int main() {
    // Count from 0 to 10
    for (int i = 0; i <= 10; i++) {
        std::cout << i << " ";
    }
    std::cout << std::endl;

    // Count backwards
    for (int i = 10; i > 0; i--) {
        std::cout << i << " ";
    }
    std::cout << std::endl;

    // Count by 2s
    for (int i = 0; i <= 20; i += 2) {
        std::cout << i << " ";
    }

    return 0;
}
```

---

## The While Loop

Use `while` when you don’t know exactly how many times you need to repeat.

```cpp
#include <iostream>

int main() {
    int number = 1;

    while (number <= 5) {
        std::cout << "Number: " << number << std::endl;
        number = number + 1;     // Very important! Prevent infinite loop
    }

    return 0;
}
```

---

## Mini Project: Multiplication Table

```cpp
#include <iostream>

int main() {
    int num;

    std::cout << "Enter a number to see its multiplication table: ";
    std::cin >> num;

    std::cout << "\nMultiplication Table for " << num << ":\n";

    for (int i = 1; i <= 10; i++) {
        std::cout << num << " x " << i << " = " << (num * i) << std::endl;
    }

    return 0;
}
```

---

## Practice Exercises

1. Write a program that prints all even numbers from 2 to 20.
2. Ask the user for a number and print that many stars (`*`).
3. Create a simple countdown from 10 to 1, then print "Blast off!".
4. Make a program that keeps asking for numbers until the user enters 0.

---

## Important Tips

- Always make sure the loop will eventually stop (update your counter!)
- Infinite loops happen when the condition never becomes false
- `for` loops are great when you know the count
- `while` loops are better when the stopping condition is more complex

---

You’re building real programming skills now!

Loops + conditions + variables = the foundation for almost any program you’ll ever write.
