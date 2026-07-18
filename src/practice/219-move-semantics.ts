import type { PracticeChallenge } from './loader'

export const title = 'Move Semantics (C++)'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'cpp-program',
        prompt: 'Create `std::string a = "hello world";`, print `a.size()`. Create `std::string b = std::move(a);`, transferring `a`\'s internal buffer into `b`. Print `b.size()` then `a.size()` (left empty by the move). Finally print `b`\'s contents.',
        starter: '',
        tests: `
assert output === 'a size before move: 11\\nb size after move: 11\\na size after move: 0\\nb contents: hello world'
`,
        solution: `#include <iostream>
#include <string>

int main() {
    std::string a = "hello world";
    std::cout << "a size before move: " << a.size() << std::endl;

    std::string b = std::move(a);
    std::cout << "b size after move: " << b.size() << std::endl;
    std::cout << "a size after move: " << a.size() << std::endl;

    std::cout << "b contents: " << b << std::endl;

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
        prompt: 'Fix `main`: it calls `consume(std::move(numbers))`, but `main` still needs `numbers` AFTERWARD (it prints `numbers.size()` right after) — `std::move` signals "I\'m done with this," so `numbers`\'s internal buffer gets stolen, leaving it empty. Since `numbers` is genuinely needed again, call `consume(numbers)` WITHOUT `std::move` — passing a copy instead, leaving the original intact.',
        starter: `#include <iostream>
#include <vector>

void consume(std::vector<int> data) {
    std::cout << "consumed " << data.size() << " items" << std::endl;
}

int main() {
    std::vector<int> numbers = {10, 20, 30};
    consume(std::move(numbers));

    std::cout << "numbers size: " << numbers.size() << std::endl;

    return 0;
}
`,
        tests: `
assert output === 'consumed 3 items\\nnumbers size: 3'
`,
        solution: `#include <iostream>
#include <vector>

void consume(std::vector<int> data) {
    std::cout << "consumed " << data.size() << " items" << std::endl;
}

int main() {
    std::vector<int> numbers = {10, 20, 30};
    consume(numbers);

    std::cout << "numbers size: " << numbers.size() << std::endl;

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
        prompt: 'Write `class Buffer` with `int* data`, `size_t size`, a normal constructor (allocates `new int[n]`, prints `"constructed buffer of size " + n`), a MOVE constructor `Buffer(Buffer&& other) noexcept` (steals `other.data`/`other.size`, resets `other` to `nullptr`/`0`, prints `"moved buffer"`), and a COPY constructor `Buffer(const Buffer& other)` (allocates fresh memory and copies every element, prints `"copied buffer"`) — plus a destructor calling `delete[] data`. Construct `Buffer a(5)`, then `Buffer b(std::move(a))` (uses the move ctor), print both `.size` values, then `Buffer c(b)` (uses the copy ctor, since `b` is an lvalue), print `b.size` and `c.size` again.',
        starter: '',
        tests: `
assert output === 'constructed buffer of size 5\\nmoved buffer\\na.size after move: 0\\nb.size after move: 5\\ncopied buffer\\nb.size after copy: 5\\nc.size after copy: 5'
`,
        solution: `#include <iostream>

class Buffer {
public:
    int* data;
    size_t size;

    Buffer(size_t n) : size(n) {
        data = new int[n];
        std::cout << "constructed buffer of size " << n << std::endl;
    }

    Buffer(Buffer&& other) noexcept : data(other.data), size(other.size) {
        other.data = nullptr;
        other.size = 0;
        std::cout << "moved buffer" << std::endl;
    }

    Buffer(const Buffer& other) : size(other.size) {
        data = new int[size];
        for (size_t i = 0; i < size; i++) data[i] = other.data[i];
        std::cout << "copied buffer" << std::endl;
    }

    ~Buffer() {
        delete[] data;
    }
};

int main() {
    Buffer a(5);
    Buffer b(std::move(a));
    std::cout << "a.size after move: " << a.size << std::endl;
    std::cout << "b.size after move: " << b.size << std::endl;

    Buffer c(b);
    std::cout << "b.size after copy: " << b.size << std::endl;
    std::cout << "c.size after copy: " << c.size << std::endl;

    return 0;
}
`,
      },
    ],
  },
]

export default challenges
