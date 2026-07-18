import type { PracticeChallenge } from './loader'

export const title = 'Smart Pointers (C++)'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'cpp-program',
        prompt: 'Create `auto ptr = std::make_unique<int>(100);` and print `*ptr`. Create `auto shared1 = std::make_shared<int>(7);` and print `shared1.use_count()`. Create `auto shared2 = shared1;` (a COPY — both now share ownership) and print `shared1.use_count()` again. Finally print both `*shared1` and `*shared2`.',
        starter: '',
        tests: `
assert output === '100\\ncount: 1\\ncount: 2\\nshared1: 7, shared2: 7'
`,
        solution: `#include <iostream>
#include <memory>

int main() {
    auto ptr = std::make_unique<int>(100);
    std::cout << *ptr << std::endl;

    auto shared1 = std::make_shared<int>(7);
    std::cout << "count: " << shared1.use_count() << std::endl;

    auto shared2 = shared1;
    std::cout << "count: " << shared1.use_count() << std::endl;

    std::cout << "shared1: " << *shared1 << ", shared2: " << *shared2 << std::endl;
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
        prompt: 'Fix `main`: `auto copy = original;` tries to COPY a `std::unique_ptr` directly — `unique_ptr`\'s copy constructor is explicitly DELETED (it enforces exactly one owner at a time), so this is a COMPILE ERROR. Replace it with `auto moved = std::move(original);`, transferring ownership instead of copying it.',
        starter: `#include <iostream>
#include <memory>

int main() {
    auto original = std::make_unique<int>(42);
    auto copy = original;
    std::cout << *copy << std::endl;
    return 0;
}
`,
        tests: `
assert output === '42'
`,
        solution: `#include <iostream>
#include <memory>

int main() {
    auto original = std::make_unique<int>(42);
    auto moved = std::move(original);
    std::cout << *moved << std::endl;
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
        prompt: 'Create `auto shared1 = std::make_shared<int>(99);` and print its `use_count()`. In a nested `{ }` scope, create `auto shared2 = shared1;` and print `use_count()` again. In an EVEN MORE nested scope inside that, create `auto shared3 = shared1;` and print `use_count()` a third time. After the innermost scope ends (destructing `shared3`), print `use_count()` again — then after the middle scope ends (destructing `shared2`), print it once more — the count decrements by exactly one each time a copy is destroyed.',
        starter: '',
        tests: `
assert output === 'count: 1\\ncount: 2\\ncount: 3\\ncount after inner scope ends: 2\\ncount after middle scope ends: 1'
`,
        solution: `#include <iostream>
#include <memory>

int main() {
    auto shared1 = std::make_shared<int>(99);
    std::cout << "count: " << shared1.use_count() << std::endl;

    {
        auto shared2 = shared1;
        std::cout << "count: " << shared1.use_count() << std::endl;

        {
            auto shared3 = shared1;
            std::cout << "count: " << shared1.use_count() << std::endl;
        }
        std::cout << "count after inner scope ends: " << shared1.use_count() << std::endl;
    }
    std::cout << "count after middle scope ends: " << shared1.use_count() << std::endl;

    return 0;
}
`,
      },
    ],
  },
]

export default challenges
