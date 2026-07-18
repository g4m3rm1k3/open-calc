import type { PracticeChallenge } from './loader'

export const title = 'Operator Overloading (C++)'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'cpp-program',
        prompt: 'Write `class Point` with public `int x, y;` and a MEMBER `Point operator+(const Point& other) const` returning `Point{x + other.x, y + other.y}`. Write a FREE function `bool operator==(const Point& lhs, const Point& rhs)` comparing both fields. Compute `c = a + b` for `a{1,2}` and `b{5,5}`, print `c.x, c.y`. Compare `c == d` against `d{6,7}` and print the result.',
        starter: '',
        tests: `
assert output === '6, 7\\n1'
`,
        solution: `#include <iostream>

class Point {
public:
    int x, y;

    Point operator+(const Point& other) const {
        return Point{x + other.x, y + other.y};
    }
};

bool operator==(const Point& lhs, const Point& rhs) {
    return lhs.x == rhs.x && lhs.y == rhs.y;
}

int main() {
    Point a{1, 2};
    Point b{5, 5};
    Point c = a + b;

    std::cout << c.x << ", " << c.y << std::endl;

    Point d{6, 7};
    std::cout << (c == d) << std::endl;

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
        prompt: 'Fix `Point::operator+`: it MULTIPLIES the components (`x * other.x`, `y * other.y`) instead of adding them — genuinely surprising behavior for an operator named `+`, violating the principle of least surprise. Change it to `x + other.x, y + other.y`.',
        starter: `#include <iostream>

class Point {
public:
    int x, y;

    Point operator+(const Point& other) const {
        return Point{x * other.x, y * other.y};
    }
};

int main() {
    Point a{2, 3};
    Point b{4, 5};
    Point c = a + b;

    std::cout << c.x << ", " << c.y << std::endl;

    return 0;
}
`,
        tests: `
assert output === '6, 8'
`,
        solution: `#include <iostream>

class Point {
public:
    int x, y;

    Point operator+(const Point& other) const {
        return Point{x + other.x, y + other.y};
    }
};

int main() {
    Point a{2, 3};
    Point b{4, 5};
    Point c = a + b;

    std::cout << c.x << ", " << c.y << std::endl;

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
        prompt: 'Write a FREE function `std::ostream& operator<<(std::ostream& os, const Point& p)` printing `"(" + p.x + ", " + p.y + ")"` and returning `os` (letting `std::cout << somePoint` work directly). Declare `const Point a{1, 2};` and `const Point b{3, 4};` — computing `a + b` requires `operator+` to be a `const` member function (as in the earlier levels), since both operands are `const`. Print `` a << " + " << b << " = " << (a + b) ``.',
        starter: '',
        tests: `
assert output === '(1, 2) + (3, 4) = (4, 6)'
`,
        solution: `#include <iostream>

class Point {
public:
    int x, y;

    Point operator+(const Point& other) const {
        return Point{x + other.x, y + other.y};
    }
};

std::ostream& operator<<(std::ostream& os, const Point& p) {
    os << "(" << p.x << ", " << p.y << ")";
    return os;
}

int main() {
    const Point a{1, 2};
    const Point b{3, 4};
    Point c = a + b;

    std::cout << a << " + " << b << " = " << c << std::endl;

    return 0;
}
`,
      },
    ],
  },
]

export default challenges
