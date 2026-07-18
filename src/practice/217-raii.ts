import type { PracticeChallenge } from './loader'

export const title = 'RAII (C++)'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'cpp-program',
        prompt: 'Write `class LogGuard` storing a `std::string name`, whose constructor prints `"opening " + name` and whose destructor prints `"closing " + name`. In `main`, print `"start"`, then in a nested `{ }` block construct `LogGuard guard("session.log")` and print `"writing to log"` — the block ending triggers `guard`\'s destructor automatically — then print `"end"` after the block.',
        starter: '',
        tests: `
assert output === 'start\\nopening session.log\\nwriting to log\\nclosing session.log\\nend'
`,
        solution: `#include <iostream>
#include <string>

class LogGuard {
    std::string name;
public:
    LogGuard(const std::string& n) : name(n) {
        std::cout << "opening " << name << std::endl;
    }
    ~LogGuard() {
        std::cout << "closing " << name << std::endl;
    }
};

int main() {
    std::cout << "start" << std::endl;
    {
        LogGuard guard("session.log");
        std::cout << "writing to log" << std::endl;
    }
    std::cout << "end" << std::endl;
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
        prompt: 'Fix `process`: it manually calls `acquire("resource")` and `release("resource")` — but the early `return` on the `fail` path skips `release` entirely, leaking the resource. Replace `acquire`/`release` with an RAII `ResourceGuard` class (constructor prints `"acquiring " + name`, destructor prints `"releasing " + name`) — constructing `ResourceGuard guard("resource")` at the top of `process` guarantees its destructor runs on EVERY exit path, including the early return.',
        starter: `#include <iostream>
#include <string>

void acquire(const std::string& name) {
    std::cout << "acquiring " << name << std::endl;
}

void release(const std::string& name) {
    std::cout << "releasing " << name << std::endl;
}

void process(bool fail) {
    acquire("resource");
    if (fail) {
        std::cout << "failed early" << std::endl;
        return;
    }
    std::cout << "processing" << std::endl;
    release("resource");
}

int main() {
    process(true);
    return 0;
}
`,
        tests: `
assert output === 'acquiring resource\\nfailed early\\nreleasing resource'
`,
        solution: `#include <iostream>
#include <string>

class ResourceGuard {
    std::string name;
public:
    ResourceGuard(const std::string& n) : name(n) {
        std::cout << "acquiring " << name << std::endl;
    }
    ~ResourceGuard() {
        std::cout << "releasing " << name << std::endl;
    }
};

void process(bool fail) {
    ResourceGuard guard("resource");
    if (fail) {
        std::cout << "failed early" << std::endl;
        return;
    }
    std::cout << "processing" << std::endl;
}

int main() {
    process(true);
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
        prompt: 'Using the same `ResourceGuard` shape, write `risky()` that constructs `ResourceGuard guard("connection")`, prints `"about to throw"`, then `throw std::runtime_error("something broke")`. In `main`, call `risky()` inside a `try`/`catch (const std::exception& e)`, printing `"caught: " + e.what()`. Confirm `guard`\'s destructor still runs (via stack unwinding) BEFORE the exception reaches the `catch` block.',
        starter: '',
        tests: `
assert output === 'acquiring connection\\nabout to throw\\nreleasing connection\\ncaught: something broke'
`,
        solution: `#include <iostream>
#include <string>
#include <stdexcept>

class ResourceGuard {
    std::string name;
public:
    ResourceGuard(const std::string& n) : name(n) {
        std::cout << "acquiring " << name << std::endl;
    }
    ~ResourceGuard() {
        std::cout << "releasing " << name << std::endl;
    }
};

void risky() {
    ResourceGuard guard("connection");
    std::cout << "about to throw" << std::endl;
    throw std::runtime_error("something broke");
}

int main() {
    try {
        risky();
    } catch (const std::exception& e) {
        std::cout << "caught: " << e.what() << std::endl;
    }
    return 0;
}
`,
      },
    ],
  },
]

export default challenges
