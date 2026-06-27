# Lesson 8: Introduction to Classes and Objects in C++

You’ve built a strong foundation. Now we’re entering one of the most important parts of C++ — **Object-Oriented Programming (OOP)**.

In this lesson, we’ll learn about **classes** and **objects**.

---

## What is a Class?

A **class** is like a blueprint or template for creating objects.  
An **object** is an actual thing created from that blueprint.

**Real-world analogy**:

- Class = Blueprint for a car
- Object = An actual car built from that blueprint

---

## Creating Your First Class

```cpp
#include <iostream>
#include <string>

// Define a class
class Student {
public:
    // Attributes (variables)
    std::string name;
    int age;
    double grade;

    // Method (function inside class)
    void introduce() {
        std::cout << "Hi, my name is " << name
                  << ", I am " << age
                  << " years old, and my grade is " << grade << "." << std::endl;
    }
};

int main() {
    // Creating objects from the class
    Student student1;
    student1.name = "Emma";
    student1.age = 16;
    student1.grade = 92.5;

    Student student2;
    student2.name = "Liam";
    student2.age = 17;
    student2.grade = 88.0;

    student1.introduce();
    student2.introduce();

    return 0;
}
```

---

## Better Way: Constructors

A constructor is a special function that runs when an object is created.

```cpp
#include <iostream>
#include <string>

class Player {
public:
    std::string name;
    int score;

    // Constructor
    Player(std::string playerName, int startingScore) {
        name = playerName;
        score = startingScore;
    }

    void addPoints(int points) {
        score += points;
        std::cout << name << " scored " << points
                  << " points! New score: " << score << std::endl;
    }
};

int main() {
    Player player1("Alex", 0);
    Player player2("Jordan", 0);

    player1.addPoints(10);
    player2.addPoints(25);

    return 0;
}
```

---

## Access Specifiers: public and private

```cpp
#include <iostream>

class BankAccount {
private:
    double balance;           // Can only be accessed inside the class

public:
    std::string owner;

    BankAccount(std::string name) {
        owner = name;
        balance = 0.0;
    }

    void deposit(double amount) {
        if (amount > 0) {
            balance += amount;
            std::cout << "Deposited $" << amount << std::endl;
        }
    }

    void showBalance() {
        std::cout << owner << "'s balance: $" << balance << std::endl;
    }
};

int main() {
    BankAccount account("Taylor");
    account.deposit(500);
    account.showBalance();

    return 0;
}
```

---

## Mini Project: Simple Dog Class

```cpp
#include <iostream>
#include <string>

class Dog {
public:
    std::string name;
    int age;
    std::string breed;

    Dog(std::string dogName, int dogAge, std::string dogBreed) {
        name = dogName;
        age = dogAge;
        breed = dogBreed;
    }

    void bark() {
        std::cout << name << " says: Woof Woof!" << std::endl;
    }

    void celebrateBirthday() {
        age++;
        std::cout << "Happy Birthday " << name << "! Now " << age << " years old." << std::endl;
    }

    void info() {
        std::cout << name << " is a " << breed
                  << " and is " << age << " years old." << std::endl;
    }
};

int main() {
    Dog dog1("Buddy", 3, "Golden Retriever");
    Dog dog2("Luna", 2, "Husky");

    dog1.info();
    dog1.bark();
    dog1.celebrateBirthday();

    dog2.info();
    dog2.bark();

    return 0;
}
```

---

## Practice Exercises

1. Create a `Book` class with title, author, and pages. Add a method to display info.
2. Make a `Car` class with make, model, year, and speed. Add accelerate and brake methods.
3. Build a `Rectangle` class that can calculate area and perimeter.

---

## Why Use Classes?

- Organize related data and functions together
- Create reusable code
- Model real-world things
- Prepare for larger, more complex programs

---

You’ve now touched the basics of Object-Oriented Programming — one of C++’s greatest strengths!
