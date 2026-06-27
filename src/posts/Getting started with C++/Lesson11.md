# Lesson 11: Dynamic Memory with new and delete in C++

You’ve reached **Lesson 11**. Great persistence!

In this lesson, we’ll learn how to allocate and manage memory **dynamically** during program execution using `new` and `delete`.

---

## Why Dynamic Memory?

- You don’t know how much memory you need until the program is running
- You can create arrays whose size is decided by the user
- Better memory management for large programs

---

## Basic new and delete

```cpp
#include <iostream>

int main() {
    // Allocate memory for one integer
    int* ptr = new int;

    *ptr = 42;

    std::cout << "Value: " << *ptr << std::endl;
    std::cout << "Address: " << ptr << std::endl;

    // Free the memory
    delete ptr;
    ptr = nullptr;        // Good practice

    return 0;
}
```

---

## Dynamic Arrays

```cpp
#include <iostream>

int main() {
    int size;

    std::cout << "How many numbers do you want to store? ";
    std::cin >> size;

    // Create dynamic array
    int* numbers = new int[size];

    // Fill the array
    for (int i = 0; i < size; i++) {
        std::cout << "Enter number " << (i + 1) << ": ";
        std::cin >> numbers[i];
    }

    // Display
    std::cout << "\nYou entered: ";
    for (int i = 0; i < size; i++) {
        std::cout << numbers[i] << " ";
    }
    std::cout << std::endl;

    // Important: Free the memory
    delete[] numbers;
    numbers = nullptr;

    return 0;
}
```

**Note**: Use `delete[]` for arrays, `delete` for single values.

---

## Dynamic Memory with Classes

```cpp
#include <iostream>
#include <string>

class Player {
public:
    std::string name;
    int score;

    Player(std::string n, int s) : name(n), score(s) {
        std::cout << "Player " << name << " created!" << std::endl;
    }

    ~Player() {
        std::cout << "Player " << name << " destroyed." << std::endl;
    }
};

int main() {
    Player* p1 = new Player("Alice", 1500);

    std::cout << p1->name << " has score: " << p1->score << std::endl;

    delete p1;      // Calls destructor
    p1 = nullptr;

    return 0;
}
```

---

## Mini Project: Dynamic Student List

```cpp
#include <iostream>
#include <string>

class Student {
public:
    std::string name;
    double grade;

    Student(std::string n, double g) : name(n), grade(g) {}
};

int main() {
    int count;
    std::cout << "How many students? ";
    std::cin >> count;

    Student** students = new Student*[count];   // Array of pointers

    for (int i = 0; i < count; i++) {
        std::string name;
        double grade;

        std::cin.ignore();
        std::cout << "Student " << (i+1) << " name: ";
        std::getline(std::cin, name);

        std::cout << "Grade: ";
        std::cin >> grade;

        students[i] = new Student(name, grade);
    }

    std::cout << "\n=== Student List ===\n";
    for (int i = 0; i < count; i++) {
        std::cout << students[i]->name << ": " << students[i]->grade << std::endl;
        delete students[i];           // Clean up each student
    }

    delete[] students;                // Clean up array

    return 0;
}
```

---

## Practice Exercises

1. Write a program that creates a dynamic array, fills it with numbers 1 to n, and calculates the sum.
2. Create a dynamic 2D array (matrix) and fill it with values.
3. Build a simple inventory system using dynamic memory for items.

---

## Memory Management Rules

1. Every `new` should have a matching `delete`
2. Use `delete[]` for arrays
3. Set pointers to `nullptr` after deleting
4. Avoid memory leaks (forgetting to delete)
5. Avoid dangling pointers (using memory after deleting)

---

You now understand how C++ gives you direct control over memory — a key reason why it’s so powerful.
