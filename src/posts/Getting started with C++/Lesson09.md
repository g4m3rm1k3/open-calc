# Lesson 9: Building a Mini Project — Student Grade Manager

We’ve covered a lot: variables, conditions, loops, functions, arrays, strings, and classes.

In **Lesson 9**, we’re going to put everything together and build a **mini project** — a simple Student Grade Manager.

---

## The Project: Student Grade Manager

This program will let you:

- Add students
- View all students
- Calculate class average
- Find the top student

---

### Complete Code

```cpp
#include <iostream>
#include <string>
#include <vector>

class Student {
public:
    std::string name;
    double grade;

    Student(std::string studentName, double studentGrade) {
        name = studentName;
        grade = studentGrade;
    }

    void display() const {
        std::cout << "Student: " << name << " | Grade: " << grade << std::endl;
    }
};

class GradeManager {
private:
    std::vector<Student> students;

public:
    void addStudent() {
        std::string name;
        double grade;

        std::cout << "Enter student name: ";
        std::cin.ignore();
        std::getline(std::cin, name);

        std::cout << "Enter grade (0-100): ";
        std::cin >> grade;

        students.push_back(Student(name, grade));
        std::cout << "Student added successfully!\n";
    }

    void displayAll() const {
        if (students.empty()) {
            std::cout << "No students yet.\n";
            return;
        }

        std::cout << "\n=== All Students ===\n";
        for (const auto& student : students) {
            student.display();
        }
    }

    void showAverage() const {
        if (students.empty()) {
            std::cout << "No students to calculate average.\n";
            return;
        }

        double sum = 0;
        for (const auto& student : students) {
            sum += student.grade;
        }

        double average = sum / students.size();
        std::cout << "Class Average: " << average << std::endl;
    }

    void showTopStudent() const {
        if (students.empty()) {
            std::cout << "No students yet.\n";
            return;
        }

        const Student* top = &students[0];

        for (const auto& student : students) {
            if (student.grade > top->grade) {
                top = &student;
            }
        }

        std::cout << "Top Student: " << top->name
                  << " with grade " << top->grade << std::endl;
    }
};

int main() {
    GradeManager manager;
    int choice;

    std::cout << "=== Student Grade Manager ===\n";

    do {
        std::cout << "\n1. Add Student\n";
        std::cout << "2. View All Students\n";
        std::cout << "3. Show Class Average\n";
        std::cout << "4. Show Top Student\n";
        std::cout << "5. Exit\n";
        std::cout << "Choose an option: ";
        std::cin >> choice;

        switch (choice) {
            case 1:
                manager.addStudent();
                break;
            case 2:
                manager.displayAll();
                break;
            case 3:
                manager.showAverage();
                break;
            case 4:
                manager.showTopStudent();
                break;
            case 5:
                std::cout << "Goodbye!\n";
                break;
            default:
                std::cout << "Invalid option. Try again.\n";
        }
    } while (choice != 5);

    return 0;
}
```

---

## Key Concepts Used

- **Classes**: `Student` and `GradeManager`
- **Vectors**: Dynamic array to store students (`#include <vector>`)
- **Encapsulation**: `private` and `public`
- **Constructors**
- **Loops** and **conditions**
- **Switch statement** for menu

---

## How to Run It

Copy the entire code into a new file (e.g. `grade_manager.cpp`), compile and run it:

```bash
g++ grade_manager.cpp -o grade_manager
./grade_manager
```

---

## Challenges to Improve It

1. Add the ability to remove a student.
2. Save students to a file and load them when the program starts.
3. Add letter grades (A, B, C, etc.) based on the number grade.
4. Add input validation (don’t allow grades > 100 or < 0).

---

## What You’ve Learned So Far

You now have the core tools to build real programs:

- Variables & Data Types
- Control Flow (`if`, loops)
- Functions
- Arrays / Vectors
- Strings
- Classes & Objects

---
