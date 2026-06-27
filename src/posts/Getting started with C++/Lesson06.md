# Lesson 6: Arrays — Working with Lists of Data in C++

You’ve come a long way. You now know variables, conditions, loops, and functions.

In **Lesson 6**, we’ll learn about **arrays** — a way to store multiple pieces of data of the same type in one place.

---

## What is an Array?

An array is like a list of boxes with the same label, each holding a value. All items in an array must be of the same data type (all `int`, all `double`, etc.).

Example: Store the test scores of 5 students.

---

## How to Create an Array

```cpp
#include <iostream>

int main() {
    // Creating an array of 5 integers
    int scores[5] = {85, 92, 78, 95, 88};

    // Accessing elements (index starts at 0!)
    std::cout << "First score: " << scores[0] << std::endl;
    std::cout << "Third score: " << scores[2] << std::endl;

    // Changing a value
    scores[1] = 90;

    std::cout << "Updated second score: " << scores[1] << std::endl;

    return 0;
}
```

**Important**: Array indices start at **0**, not 1.

---

## Looping Through an Array

```cpp
#include <iostream>

int main() {
    int numbers[6] = {10, 20, 30, 40, 50, 60};

    std::cout << "Array elements:" << std::endl;

    for (int i = 0; i < 6; i++) {
        std::cout << "Index " << i << ": " << numbers[i] << std::endl;
    }

    return 0;
}
```

---

## Getting Array Size Automatically (Modern C++)

```cpp
#include <iostream>

int main() {
    int scores[] = {85, 92, 78, 95, 88, 76};

    int size = sizeof(scores) / sizeof(scores[0]);

    std::cout << "Number of scores: " << size << std::endl;

    for (int i = 0; i < size; i++) {
        std::cout << scores[i] << " ";
    }
    std::cout << std::endl;

    return 0;
}
```

---

## Mini Project: Average Calculator

```cpp
#include <iostream>

int main() {
    int n;
    std::cout << "How many numbers do you want to average? ";
    std::cin >> n;

    double numbers[100]; // Maximum 100 numbers
    double sum = 0;

    for (int i = 0; i < n; i++) {
        std::cout << "Enter number " << (i + 1) << ": ";
        std::cin >> numbers[i];
        sum += numbers[i];
    }

    double average = sum / n;

    std::cout << "\nAverage = " << average << std::endl;

    return 0;
}
```

---

## Common Array Operations

### Finding the Maximum Value

```cpp
#include <iostream>

int main() {
    int arr[] = {45, 72, 33, 95, 68};
    int max = arr[0];

    for (int i = 1; i < 5; i++) {
        if (arr[i] > max) {
            max = arr[i];
        }
    }

    std::cout << "Maximum value: " << max << std::endl;
    return 0;
}
```

---

## Practice Exercises

1. Create an array of 10 numbers and print them in reverse order.
2. Write a program that finds the minimum and maximum in an array.
3. Make a program that counts how many times a specific number appears in an array.
4. Build a simple grade book: store 5 student scores and calculate average, highest, and lowest.

---

## Important Tips

- Arrays have fixed size once created (in basic C++)
- Always stay within the array bounds (don’t access index 5 in a 5-element array)
- Index starts at 0
- Be careful with large arrays — they take up memory

---

You now have another powerful tool in your toolbox!
