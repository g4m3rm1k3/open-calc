---
series: cpp-fundamentals
level: 5
title: Structs
lang: cpp
---

# Structs

A struct groups related data under a single name. Where an array holds multiple values of the same type, a struct holds values of different types that belong together — the name, age, and score of a student; the x, y coordinates of a point. Structs are C++'s most important tool for modelling real-world entities, and they are the conceptual foundation of classes.

## Defining and Using a Struct

```cpp
#include <iostream>
using namespace std;

struct Point {
    double x;
    double y;
};

int main() {
    Point p1;
    p1.x = 3.0;
    p1.y = 4.0;

    Point p2 = {1.0, 2.0};

    cout << p1.x << ", " << p1.y << endl;
    cout << p2.x << ", " << p2.y << endl;

    return 0;
}
```

```text
3, 4
1, 2
```

`struct Point { ... };` — defines a new type named `Point`. The semicolon after the closing brace is required. Fields (`x`, `y`) are declared inside with their types.

`Point p1;` — declares a variable of type `Point`. Fields are uninitialised (undefined values) unless initialised.
`p1.x = 3.0;` — accesses the `x` field of `p1` with the **dot operator** `.`.
`Point p2 = {1.0, 2.0};` — **aggregate initialisation**: sets `x = 1.0`, `y = 2.0` in declaration order.

**CS lens:** A struct is a contiguous block of memory. A `Point` with two `double` fields occupies 16 bytes (2 × 8 bytes). `p1.x` is at offset 0; `p1.y` is at offset 8. The compiler calculates field offsets at compile time — field access is O(1) and involves no lookup at runtime.

## Structs in Functions

Structs can be passed to and returned from functions:

```cpp
#include <iostream>
#include <cmath>
using namespace std;

struct Point {
    double x;
    double y;
};

double distance(Point a, Point b) {
    double dx = b.x - a.x;
    double dy = b.y - a.y;
    return sqrt(dx * dx + dy * dy);
}

Point midpoint(Point a, Point b) {
    Point mid;
    mid.x = (a.x + b.x) / 2.0;
    mid.y = (a.y + b.y) / 2.0;
    return mid;
}

int main() {
    Point origin = {0.0, 0.0};
    Point corner = {3.0, 4.0};

    cout << "Distance: " << distance(origin, corner) << endl;

    Point mid = midpoint(origin, corner);
    cout << "Midpoint: " << mid.x << ", " << mid.y << endl;

    return 0;
}
```

```text
Distance: 5
Midpoint: 1.5, 2
```

`#include <cmath>` — includes the C math library, which provides `sqrt`.

Structs are passed **by value** by default: `distance` receives copies of `a` and `b`. For large structs, use `const Point&` to avoid copying (as with `string` in Level 4).

`return mid;` — returns a copy of the local `Point`. The caller receives a complete copy of the struct's fields.

## Arrays of Structs

Structs compose naturally with arrays to model collections of records:

```cpp
#include <iostream>
using namespace std;

struct Student {
    int id;
    double gpa;
};

double averageGpa(Student students[], int count) {
    double total = 0.0;
    for (int i = 0; i < count; i++) {
        total += students[i].gpa;
    }
    return total / count;
}

int main() {
    Student roster[3] = {
        {101, 3.8},
        {102, 3.2},
        {103, 3.9},
    };

    cout << "Average GPA: " << averageGpa(roster, 3) << endl;
    cout << "First student ID: " << roster[0].id << endl;

    return 0;
}
```

```text
Average GPA: 3.63333
First student ID: 101
```

`Student roster[3] = { {101, 3.8}, ... }` — an array of three `Student` structs, each initialised with an inner initialiser list.

`students[i].gpa` — index into the array to get a `Student`, then use `.` to access its `gpa` field. The two operators combine: `[]` first, then `.`.

## Structs with Pointers — The Arrow Operator

When accessing a struct through a pointer, use `->` instead of `.`:

```cpp
#include <iostream>
using namespace std;

struct Point {
    double x;
    double y;
};

void moveRight(Point* p, double amount) {
    p->x += amount;
}

int main() {
    Point pt = {1.0, 2.0};
    moveRight(&pt, 5.0);
    cout << pt.x << ", " << pt.y << endl;
    return 0;
}
```

```text
6, 2
```

`p->x` is equivalent to `(*p).x` — dereference the pointer, then access the field. The `->` operator combines both steps. Pointers to structs arise constantly in data structures (linked lists, trees) and are covered further in Level 6.

**SE lens:** Choosing between `.` and `->` is just a question of whether you have the struct itself (`pt.x`) or a pointer to the struct (`p->x`). The compiler tells you if you use the wrong one — it is a type error.

## Challenge: temperature_stats

Define a struct `TempRecord` with two fields: `double high` and `double low`. Write a function `TempRecord weekStats(double highs[], double lows[], int days)` that computes the overall highest high and lowest low across all days and returns them as a `TempRecord`.

```challenge
#include <iostream>
using namespace std;

struct TempRecord {
    double high;
    double low;
};

TempRecord weekStats(double highs[], double lows[], int days) {
    // TODO
}

int main() {
    double highs[] = {22.5, 19.0, 25.3, 18.7, 23.1};
    double lows[]  = { 8.1,  5.5, 10.2,  3.9,  7.8};
    TempRecord result = weekStats(highs, lows, 5);
    cout << "High: " << result.high << endl;
    cout << "Low: "  << result.low  << endl;
    return 0;
}
```

```test
#include <iostream>
#include <cassert>
using namespace std;

struct TempRecord {
    double high;
    double low;
};

TempRecord weekStats(double highs[], double lows[], int days) {
    TempRecord r;
    r.high = highs[0];
    r.low  = lows[0];
    for (int i = 1; i < days; i++) {
        if (highs[i] > r.high) r.high = highs[i];
        if (lows[i]  < r.low)  r.low  = lows[i];
    }
    return r;
}

int main() {
    double highs[] = {22.5, 19.0, 25.3, 18.7, 23.1};
    double lows[]  = { 8.1,  5.5, 10.2,  3.9,  7.8};
    TempRecord r = weekStats(highs, lows, 5);
    assert(r.high > 25.0 && r.high < 25.5);
    assert(r.low  > 3.5  && r.low  < 4.5);

    double h2[] = {10.0};
    double l2[] = {-2.0};
    TempRecord r2 = weekStats(h2, l2, 1);
    assert(r2.high == 10.0);
    assert(r2.low  == -2.0);

    cout << "ok" << endl;
    return 0;
}
```
