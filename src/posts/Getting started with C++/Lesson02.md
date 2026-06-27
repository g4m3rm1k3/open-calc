# Lesson 2: Variables, Data Types, and Storing Information in C++

Welcome back! �

If you completed Lesson 1, you’ve already written your first program and understand the basic structure of C++. Great job!

In this lesson, we’re going to slow down and really understand **variables** — one of the most important concepts in programming. We’ll go deep so you truly get it, even with zero prior experience.

---

## What is a Variable?

A **variable** is like a labeled box that holds information. You can put something in the box, look at what’s inside, and even change it later.

Think of it like this:

- A box labeled `age` can hold the number 15.
- A box labeled `name` can hold the text “Alex”.

Every time you want to remember something in your program, you use a variable.

---

## How to Create Variables

Here’s the basic pattern:

```cpp
data_type variable_name = value;
```

````

Let’s look at a full example:

```cpp
#include <iostream>
#include <string>

int main() {
    // Creating variables
    int age = 17;
    double height = 5.6;
    char initial = 'A';
    std::string name = "Emma Thompson";
    bool isStudent = true;

    // Using the variables
    std::cout << "Name: " << name << std::endl;
    std::cout << "Age: " << age << std::endl;
    std::cout << "Height: " << height << " feet" << std::endl;
    std::cout << "First initial: " << initial << std::endl;
    std::cout << "Is a student? " << isStudent << std::endl;

    return 0;
}
```

---

## Common Data Types (Explained Simply)

| Data Type     | What it Stores                  | Example             | Notes                        |
| ------------- | ------------------------------- | ------------------- | ---------------------------- |
| `int`         | Whole numbers                   | `25`, `-10`         | Most common for counting     |
| `double`      | Numbers with decimals           | `3.14159`, `19.99`  | Good for money, measurements |
| `float`       | Numbers with decimals (smaller) | `2.5f`              | Less precise than double     |
| `char`        | Single character                | `'A'`, `'7'`, `'!'` | Always use single quotes     |
| `std::string` | Text (words and sentences)      | `"Hello World"`     | Needs `#include <string>`    |
| `bool`        | True or False                   | `true`, `false`     | Very useful for decisions    |

---

## Changing Variables (Assignment)

You can change what’s inside a variable at any time:

```cpp
#include <iostream>

int main() {
    int score = 0;
    std::cout << "Current score: " << score << std::endl;

    score = 10;                    // Change the value
    std::cout << "New score: " << score << std::endl;

    score = score + 5;             // Add to current value
    std::cout << "Updated score: " << score << std::endl;

    return 0;
}
```

---

## Basic Math Operations

```cpp
#include <iostream>

int main() {
    int a = 20;
    int b = 7;

    std::cout << "a + b = " << (a + b) << std::endl;
    std::cout << "a - b = " << (a - b) << std::endl;
    std::cout << "a * b = " << (a * b) << std::endl;
    std::cout << "a / b = " << (a / b) << std::endl;   // 2 (integer division)
    std::cout << "a % b = " << (a % b) << std::endl;   // remainder = 6

    return 0;
}
```

**Important Note**: When you divide two `int` values, C++ throws away the decimal part (e.g., 20 / 7 = 2).

---

## Getting User Input into Variables

```cpp
#include <iostream>
#include <string>

int main() {
    std::string name;
    int age;
    double weight;

    std::cout << "What is your name? ";
    std::getline(std::cin, name);      // Best for full names

    std::cout << "How old are you? ";
    std::cin >> age;

    std::cout << "How much do you weigh (in kg)? ";
    std::cin >> weight;

    std::cout << "\n--- Your Info ---" << std::endl;
    std::cout << "Hello " << name << "!" << std::endl;
    std::cout << "You are " << age << " years old." << std::endl;
    std::cout << "You weigh " << weight << " kg." << std::endl;

    return 0;
}
```

---

## Mini Project: Simple Age Calculator

Try writing this yourself first, then compare:

```cpp
#include <iostream>

int main() {
    int currentYear;
    int birthYear;

    std::cout << "What is the current year? ";
    std::cin >> currentYear;

    std::cout << "What year were you born? ";
    std::cin >> birthYear;

    int age = currentYear - birthYear;

    std::cout << "\nYou are approximately " << age << " years old!" << std::endl;

    return 0;
}
```

---

## Common Mistakes to Avoid

1. Forgetting `#include <string>` when using `std::string`
2. Using `=` when you mean `==` (we’ll cover this in conditions)
3. Mixing up single quotes (`'A'`) and double quotes (`"text"`)
4. Not declaring the variable type before using it
5. Case sensitivity: `Age` is different from `age`

---

## Practice Exercises

1. Create variables for your name, favorite color, and age. Print them nicely.
2. Ask the user for two numbers and print their sum, difference, and product.
3. Make a program that converts temperature from Celsius to Fahrenheit.

---

You did great in Lesson 2!

Variables are the foundation of almost everything in programming. The more comfortable you get with them, the easier everything else becomes.
````
