# Lesson 5: Functions — Organizing and Reusing Code in C++

You’re doing great. By now you know variables, conditions, and loops.

In **Lesson 5**, we’ll learn about **functions** — blocks of code that you can reuse whenever you want. Functions help keep your code clean, organized, and easier to maintain.

---

## What is a Function?

A function is like a mini-program inside your program. You give it a name, some inputs (optional), and it performs a task and can return a result.

Think of it like a kitchen appliance:

- You put ingredients in (parameters)
- It does something (the code inside)
- It gives you a result (return value)

---

## Creating Your First Function

```cpp
#include <iostream>

// Function definition
int add(int a, int b) {
    return a + b;
}

int main() {
    int result = add(5, 7);           // Calling the function
    std::cout << "5 + 7 = " << result << std::endl;

    std::cout << "10 + 20 = " << add(10, 20) << std::endl;

    return 0;
}
```

### Parts of a Function:

- `int` → Return type (what the function gives back)
- `add` → Function name (you choose this)
- `(int a, int b)` → Parameters (inputs)
- `return a + b;` → Sends the result back
- `{ }` → Body of the function

---

## Different Types of Functions

### 1. Function with no parameters and no return

```cpp
#include <iostream>

void greet() {
    std::cout << "Hello! Welcome to C++!" << std::endl;
}

int main() {
    greet();        // Calling the function
    greet();
    return 0;
}
```

`void` means the function returns nothing.

### 2. Function that returns a value

```cpp
#include <iostream>

double square(double x) {
    return x * x;
}

int main() {
    std::cout << "Square of 4.5 is " << square(4.5) << std::endl;
    return 0;
}
```

---

## Real-World Example: Calculator Functions

```cpp
#include <iostream>

int add(int a, int b) { return a + b; }
int subtract(int a, int b) { return a - b; }
int multiply(int a, int b) { return a * b; }
double divide(double a, double b) {
    if (b == 0) {
        std::cout << "Error: Cannot divide by zero!" << std::endl;
        return 0;
    }
    return a / b;
}

int main() {
    int x = 15;
    int y = 6;

    std::cout << x << " + " << y << " = " << add(x, y) << std::endl;
    std::cout << x << " - " << y << " = " << subtract(x, y) << std::endl;
    std::cout << x << " * " << y << " = " << multiply(x, y) << std::endl;
    std::cout << x << " / " << y << " = " << divide(x, y) << std::endl;

    return 0;
}
```

---

## Why Use Functions?

- Avoid repeating code (DRY principle)
- Make code easier to read and debug
- Reuse the same logic in different parts of your program
- Organize large programs into smaller, manageable pieces

---

## Mini Project: Simple Menu Program

```cpp
#include <iostream>

void showMenu() {
    std::cout << "\n=== Simple Calculator ===\n";
    std::cout << "1. Add\n";
    std::cout << "2. Subtract\n";
    std::cout << "3. Multiply\n";
    std::cout << "4. Exit\n";
    std::cout << "Choose an option: ";
}

int main() {
    int choice;
    int a, b;

    do {
        showMenu();
        std::cin >> choice;

        if (choice == 4) break;

        std::cout << "Enter two numbers: ";
        std::cin >> a >> b;

        if (choice == 1) std::cout << "Result: " << (a + b) << std::endl;
        else if (choice == 2) std::cout << "Result: " << (a - b) << std::endl;
        else if (choice == 3) std::cout << "Result: " << (a * b) << std::endl;
        else std::cout << "Invalid choice!" << std::endl;

    } while (true);

    std::cout << "Goodbye!" << std::endl;
    return 0;
}
```

---

## Practice Exercises

1. Write a function that checks if a number is even or odd.
2. Create a function that returns the maximum of two numbers.
3. Make a function that prints a rectangle of stars given width and height.
4. Build a temperature converter function (Celsius to Fahrenheit and back).

---

You now have all the core building blocks: variables, conditions, loops, and functions!

This is enough knowledge to start building real small programs.
