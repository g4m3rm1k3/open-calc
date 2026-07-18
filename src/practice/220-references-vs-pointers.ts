import type { PracticeChallenge } from './loader'

export const title = 'References vs Pointers (C++)'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'cpp-program',
        prompt: 'Create `int a = 5;` and `int& r = a;`. Set `r = 50;`, print `a` (changed, since `r` IS `a`). Create `int* p = &a;`, set `*p = 99;`, print `a` again. Create `int b = 7;`, reseat `p = &b;`, print `*p` (now `7`) and `a` (still `99`, unaffected by reseating `p`).',
        starter: '',
        tests: `
assert output === 'a after r = 50: 50\\na after *p = 99: 99\\n*p after reseating to b: 7\\na is still: 99'
`,
        solution: `#include <iostream>

int main() {
    int a = 5;
    int& r = a;
    r = 50;
    std::cout << "a after r = 50: " << a << std::endl;

    int* p = &a;
    *p = 99;
    std::cout << "a after *p = 99: " << a << std::endl;

    int b = 7;
    p = &b;
    std::cout << "*p after reseating to b: " << *p << std::endl;
    std::cout << "a is still: " << a << std::endl;

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
        prompt: 'Fix `main`: it dereferences `*result` WITHOUT first checking whether `result` is `nullptr` — since `findValue(false)` genuinely returns `nullptr`, this dereference is undefined behavior (a crash in practice). Add an `if (result != nullptr)` check, printing `"value: " + *result` when present, otherwise `"no value found"`.',
        starter: `#include <iostream>

int* findValue(bool found) {
    static int value = 42;
    if (found) return &value;
    return nullptr;
}

int main() {
    int* result = findValue(false);
    std::cout << "value: " << *result << std::endl;
    return 0;
}
`,
        tests: `
assert output === 'no value found'
`,
        solution: `#include <iostream>

int* findValue(bool found) {
    static int value = 42;
    if (found) return &value;
    return nullptr;
}

int main() {
    int* result = findValue(false);
    if (result != nullptr) {
        std::cout << "value: " << *result << std::endl;
    } else {
        std::cout << "no value found" << std::endl;
    }
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
        prompt: 'Write `incrementByRef(int& val)` (`val += 1`) and `incrementByPtr(int* val)` (checks `val != nullptr` before `*val += 1`). Create `int x = 10; int& ref = x;`. Set `x = 15;` directly and print `ref` (it "sees" the change — same memory). Call `incrementByRef(x)` and print `x` (`16`). Call `incrementByPtr(&x)` and print `x` (`17`). Call `incrementByPtr(nullptr)` (safely does nothing) and print `x` again (still `17`, unaffected).',
        starter: '',
        tests: `
assert output === 'ref after modifying x directly: 15\\nx after incrementByRef: 16\\nx after incrementByPtr: 17\\nx unaffected by null pointer call: 17'
`,
        solution: `#include <iostream>

void incrementByRef(int& val) {
    val += 1;
}

void incrementByPtr(int* val) {
    if (val != nullptr) {
        *val += 1;
    }
}

int main() {
    int x = 10;
    int& ref = x;

    x = 15;
    std::cout << "ref after modifying x directly: " << ref << std::endl;

    incrementByRef(x);
    std::cout << "x after incrementByRef: " << x << std::endl;

    incrementByPtr(&x);
    std::cout << "x after incrementByPtr: " << x << std::endl;

    incrementByPtr(nullptr);
    std::cout << "x unaffected by null pointer call: " << x << std::endl;

    return 0;
}
`,
      },
    ],
  },
]

export default challenges
