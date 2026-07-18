import type { PracticeChallenge } from './loader'

export const title = 'Const Correctness (C++)'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'cpp-program',
        prompt: 'Write `class Rectangle` with `double width, height;`, a constructor, `double getArea() const` (returns `width * height`), and `void setWidth(double w)` (NOT const — mutates `width`). Write `void printArea(const Rectangle& r)` that calls `r.getArea()` (valid, since `getArea` is const) and prints `"area: " + area`. Construct `Rectangle r(4.0, 5.0)`, call `printArea(r)`, then `r.setWidth(10.0)` (valid — `r` itself isn\'t const), then `printArea(r)` again.',
        starter: '',
        tests: `
assert output === 'area: 20\\narea: 50'
`,
        solution: `#include <iostream>

class Rectangle {
    double width, height;
public:
    Rectangle(double w, double h) : width(w), height(h) {}

    double getArea() const {
        return width * height;
    }

    void setWidth(double w) {
        width = w;
    }
};

void printArea(const Rectangle& r) {
    std::cout << "area: " << r.getArea() << std::endl;
}

int main() {
    Rectangle r(4.0, 5.0);
    printArea(r);

    r.setWidth(10.0);
    printArea(r);

    return 0;
}
`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'cpp-program',
        prompt: 'Fix `Rectangle::getArea()`: it\'s missing `const`, even though it never modifies the object — this means it CANNOT be called on a `const Rectangle&`, so `printArea`\'s `r.getArea()` call is a COMPILE ERROR ("passing \'const Rectangle\' as \'this\' argument discards qualifiers"). Add `const` after the parameter list: `double getArea() const`.',
        starter: `#include <iostream>

class Rectangle {
    double width, height;
public:
    Rectangle(double w, double h) : width(w), height(h) {}

    double getArea() {
        return width * height;
    }
};

void printArea(const Rectangle& r) {
    std::cout << "area: " << r.getArea() << std::endl;
}

int main() {
    Rectangle r(4.0, 5.0);
    printArea(r);
    return 0;
}
`,
        tests: `
assert output === 'area: 20'
`,
        solution: `#include <iostream>

class Rectangle {
    double width, height;
public:
    Rectangle(double w, double h) : width(w), height(h) {}

    double getArea() const {
        return width * height;
    }
};

void printArea(const Rectangle& r) {
    std::cout << "area: " << r.getArea() << std::endl;
}

int main() {
    Rectangle r(4.0, 5.0);
    printArea(r);
    return 0;
}
`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'cpp-program',
        prompt: 'Create `int a = 10;` and `int b = 20;`. Declare `const int* ptrToConst = &a;` (a POINTER TO CONST) — reseat it with `ptrToConst = &b;` (the pointer itself CAN be reseated) and print `*ptrToConst` (now `20`). Declare `int* const constPtr = &a;` (a CONST POINTER) — modify the pointed-to value with `*constPtr = 99;` (allowed, since it\'s `a` itself that\'s not const) and print `a` and `*constPtr` — both `99`, since `constPtr` always points to `a`.',
        starter: '',
        tests: `
assert output === '*ptrToConst after reseating: 20\\na after *constPtr = 99: 99\\n*constPtr: 99'
`,
        solution: `#include <iostream>

int main() {
    int a = 10;
    int b = 20;

    const int* ptrToConst = &a;
    ptrToConst = &b;
    std::cout << "*ptrToConst after reseating: " << *ptrToConst << std::endl;

    int* const constPtr = &a;
    *constPtr = 99;
    std::cout << "a after *constPtr = 99: " << a << std::endl;
    std::cout << "*constPtr: " << *constPtr << std::endl;

    return 0;
}
`,
      },
    ],
  },
]

export default challenges
