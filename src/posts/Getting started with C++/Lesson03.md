# Lesson 3: Making Decisions with if-else in C++

In Lesson 1 we wrote our first program.  
In Lesson 2 we learned about variables and storing information.

Now in **Lesson 3**, we’re going to give your programs the ability to **make decisions**. This is where programming starts to feel really powerful.

---

## What Are Conditions?

A condition is a question your program can ask, and based on the answer, it can do different things.

Examples of questions:

- Is the user older than 18?
- Did they enter the correct password?
- Is the temperature above freezing?

In C++, we use **if-else** statements to handle these decisions.

---

## Basic if-else Structure

```cpp
#include <iostream>

int main() {
    int age;

    std::cout << "How old are you? ";
    std::cin >> age;

    if (age >= 18) {
        std::cout << "You are old enough to vote!" << std::endl;
    } else {
        std::cout << "You are not old enough to vote yet." << std::endl;
    }

    return 0;
}
```

### Explanation:

- `if (condition)` → If the condition is **true**, run the code inside the `{ }`
- `else` → If the condition is **false**, run the code in the else block
- Curly braces `{ }` group the instructions that belong together

---

## Comparison Operators

These are the “questions” you can ask:

| Operator | Meaning               | Example     |
| -------- | --------------------- | ----------- |
| `==`     | Equal to              | `age == 18` |
| `!=`     | Not equal to          | `age != 18` |
| `>`      | Greater than          | `age > 18`  |
| `<`      | Less than             | `age < 18`  |
| `>=`     | Greater than or equal | `age >= 18` |
| `<=`     | Less than or equal    | `age <= 18` |

**Important**: Use `==` to check equality, not `=`. `=` is for assigning values.

---

## else if — Checking Multiple Conditions

```cpp
#include <iostream>

int main() {
    int score;

    std::cout << "Enter your test score (0-100): ";
    std::cin >> score;

    if (score >= 90) {
        std::cout << "Grade: A - Excellent!" << std::endl;
    } else if (score >= 80) {
        std::cout << "Grade: B - Good job!" << std::endl;
    } else if (score >= 70) {
        std::cout << "Grade: C - You passed!" << std::endl;
    } else if (score >= 60) {
        std::cout << "Grade: D - Needs improvement" << std::endl;
    } else {
        std::cout << "Grade: F - Better luck next time" << std::endl;
    }

    return 0;
}
```

---

## Logical Operators (AND, OR, NOT)

```cpp
#include <iostream>

int main() {
    int age;
    bool hasLicense = false;

    std::cout << "How old are you? ";
    std::cin >> age;

    std::cout << "Do you have a driver's license? (1 for Yes, 0 for No): ";
    std::cin >> hasLicense;

    if (age >= 18 && hasLicense) {           // AND: both must be true
        std::cout << "You can drive!" << std::endl;
    } else if (age >= 18 || hasLicense) {    // OR: at least one is true
        std::cout << "You're close to being able to drive." << std::endl;
    } else {
        std::cout << "You cannot drive yet." << std::endl;
    }

    return 0;
}
```

- `&&` = AND (both conditions true)
- `||` = OR (at least one condition true)
- `!` = NOT (reverses true/false)

---

## Mini Project: Number Guessing Game

```cpp
#include <iostream>

int main() {
    int secretNumber = 7;
    int guess;

    std::cout << "Guess the secret number (1-10): ";
    std::cin >> guess;

    if (guess == secretNumber) {
        std::cout << "Congratulations! You guessed it!" << std::endl;
    } else if (guess > secretNumber) {
        std::cout << "Too high! Try again." << std::endl;
    } else {
        std::cout << "Too low! Try again." << std::endl;
    }

    return 0;
}
```

---

## Practice Exercises

1. Write a program that asks for a number and tells you if it’s positive, negative, or zero.
2. Create a simple login checker (hardcode username = "admin", password = "1234").
3. Make a program that gives different messages based on the time of day (ask user for hour 0-23).

---

## Common Mistakes

- Using `=` instead of `==`
- Forgetting curly braces `{ }` when you have more than one line
- Putting a semicolon `;` right after the `if` condition
- Confusing `&&` and `||`

---

You’ve now learned how to make your programs **smart** and responsive!

This is a huge milestone. Decision-making is at the heart of almost every useful program.
