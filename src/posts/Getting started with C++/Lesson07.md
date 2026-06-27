# Lesson 7: Working with Strings (Text) in C++

You’re making excellent progress. In this lesson, we’ll dive deeper into **strings** — how to work with text in C++.

---

## What is a String?

A string is a sequence of characters (letters, numbers, symbols). We’ve used them before with `std::string`.

```cpp
#include <iostream>
#include <string>

int main() {
    std::string greeting = "Hello, World!";
    std::string name = "Alex";

    std::cout << greeting << std::endl;
    return 0;
}
```

---

## Basic String Operations

```cpp
#include <iostream>
#include <string>

int main() {
    std::string firstName = "Sarah";
    std::string lastName = "Chen";

    // Concatenation (joining strings)
    std::string fullName = firstName + " " + lastName;
    std::cout << "Full name: " << fullName << std::endl;

    // Getting length
    std::cout << "Length: " << fullName.length() << std::endl;

    // Accessing individual characters
    std::cout << "First letter: " << fullName[0] << std::endl;

    // Changing a character
    fullName[0] = 'C';
    std::cout << "Modified: " << fullName << std::endl;

    return 0;
}
```

---

## Getting Text Input

```cpp
#include <iostream>
#include <string>

int main() {
    std::string fullName;
    std::string address;

    std::cout << "Enter your full name: ";
    std::getline(std::cin, fullName);     // Best for full lines with spaces

    std::cout << "Enter your city: ";
    std::getline(std::cin, address);

    std::cout << "\nHello, " << fullName << " from " << address << "!" << std::endl;

    return 0;
}
```

---

## Useful String Methods

```cpp
#include <iostream>
#include <string>

int main() {
    std::string text = "Hello, C++ Programming!";

    std::cout << "Original: " << text << std::endl;
    std::cout << "Length: " << text.length() << std::endl;
    std::cout << "Substring (0-5): " << text.substr(0, 5) << std::endl;
    std::cout << "Find 'C++': " << text.find("C++") << std::endl;

    // Check if string is empty
    if (text.empty()) {
        std::cout << "String is empty" << std::endl;
    }

    return 0;
}
```

---

## Mini Project: Personalized Greeting Program

```cpp
#include <iostream>
#include <string>

int main() {
    std::string name;
    int age;

    std::cout << "What is your name? ";
    std::getline(std::cin, name);

    std::cout << "How old are you? ";
    std::cin >> age;

    std::cout << "\n=== Welcome " << name << " ===\n";

    if (age < 18) {
        std::cout << "You're young and learning C++ — awesome!\n";
    } else if (age < 30) {
        std::cout << "Great time to build cool projects!\n";
    } else {
        std::cout << "Experience + C++ knowledge = powerful combination!\n";
    }

    std::cout << "Keep coding and have fun!\n";

    return 0;
}
```

---

## Practice Exercises

1. Ask the user for their first and last name, then print their initials.
2. Write a program that checks if a word is a palindrome (reads the same forwards and backwards).
3. Create a simple story generator: ask for name, animal, color, and insert them into a story.
4. Make a program that counts the number of vowels in a sentence.

---

## Important Tips

- Always use `std::getline(std::cin, variable)` when reading text that may contain spaces.
- Remember to `#include <string>`
- String indices start at 0, just like arrays.
- Strings are very flexible — experiment with them!

---

You now have solid skills with text handling!
