# Concept: C++ Exception Handling — `throw`/`try`/`catch`

**What you'll understand by the end:** how to signal that a real
problem was detected, at the exact point it was found, and interrupt
normal control flow until something explicitly handles it — proven both
uncaught (a real program crash) and caught (a real recovery), rather
than asserted.

**Prerequisites:** None — ordinary C++ classes and constructors.

## Setup

A C++17 compiler (this file verified with `g++ -std=c++17`). No external
libraries — `<stdexcept>`, part of the standard library, provides the
real exception type used below.

## The Problem

Some values are the right *type* but the wrong *value* — a percentage
of `150`, say: a real `double`, syntactically fine, but not something a
`Percentage` should ever actually hold. Nothing about C++'s own type
system catches this automatically. Code that constructs a `Percentage`
needs a real way to refuse an invalid value, at the exact moment it's
given one, rather than silently accepting it and letting the mistake
surface somewhere else, later, disconnected from its real cause.

## The Isolated Example

```cpp
#include <iostream>
#include <stdexcept>

class Percentage
{
public:
    double value;

    explicit Percentage(double value) : value(value)
    {
        if (value < 0.0 || value > 100.0)
        {
            throw std::invalid_argument(
                "Percentage must be between 0 and 100, got " + std::to_string(value));
        }
    }
};

int main()
{
    Percentage battery(150.0);
    std::cout << "Battery: " << battery.value << "%" << std::endl;
}
```

Compiled and run:

```bash
g++ -std=c++17 -Wall -o percentage_uncaught.exe percentage_uncaught.cpp
./percentage_uncaught.exe
```

**Real output** — the program compiles and links cleanly, then
terminates abnormally the moment it runs:

```
terminate called after throwing an instance of 'std::invalid_argument'
  what():  Percentage must be between 0 and 100, got 150.000000
```

**What this proves:** `Percentage`'s constructor really did detect
`150.0` was out of range and `throw`n a real `std::invalid_argument` —
and with nothing anywhere in `main()` prepared to catch it, that real
exception terminates the whole program immediately, printing its own
real message (`.what()`) first. This is called an **uncaught
exception**.

The identical class, this time with code prepared to handle the same
real failure:

```cpp
#include <iostream>
#include <stdexcept>

class Percentage
{
public:
    double value;

    explicit Percentage(double value) : value(value)
    {
        if (value < 0.0 || value > 100.0)
        {
            throw std::invalid_argument(
                "Percentage must be between 0 and 100, got " + std::to_string(value));
        }
    }
};

int main()
{
    try
    {
        Percentage battery(150.0);
        std::cout << "Battery: " << battery.value << "%" << std::endl;
    }
    catch (const std::invalid_argument& e)
    {
        std::cout << "Rejected: " << e.what() << std::endl;
    }

    std::cout << "Program continues." << std::endl;

    Percentage cpu_load(42.5);
    std::cout << "CPU load: " << cpu_load.value << "%" << std::endl;
}
```

Real output — the program does *not* crash this time:

```
Rejected: Percentage must be between 0 and 100, got 150.000000
Program continues.
CPU load: 42.5%
```

**What this proves:** the identical real failure — `150.0`, out of
range — produces the identical real message either way; the only
difference is whether anything was prepared to `catch` it. Caught, the
program keeps running past the whole `try`/`catch`, and a second, valid
`Percentage(42.5)` afterward constructs and prints normally, proving the
earlier failure didn't leave the program in some broken state.

## Mechanical Walkthrough

- `throw std::invalid_argument("...")` — constructs a real
  `std::invalid_argument` object (from `<stdexcept>`, inheriting from
  `std::logic_error`, which inherits from `std::exception`) with a real
  message string, and immediately raises it, abandoning the rest of the
  constructor's own body — `battery.value` is never actually set in the
  uncaught run because construction never completes.
- `try { ... }` — marks a block whose exceptions should be looked for by
  the `catch` clauses that follow it, rather than left to propagate
  uncaught.
- `catch (const std::invalid_argument& e)` — only runs if the real
  thrown object's type matches (or is a real subclass of) exactly this
  type; `e` refers to that real exception object, letting `e.what()`
  read its real message. A `catch` for an unrelated exception type would
  not have caught this one, and the program would have crashed exactly
  as the uncaught version did.
- `std::cout << "Program continues." << std::endl;` — placed *after*
  the whole `try`/`catch`, proving control genuinely resumed past the
  failure rather than the program having crashed.

## Execution Trace

Not required for this concept: the code has no loop, no recursion, and
no state carried across steps — a single `throw` and a single matching
`catch`, each real value change (the exception raised, then handled)
already shown directly in the real output above.

## CS Lens

This is **structured exception handling** — separating "code that
detects a problem" from "code that decides how to respond to it," which
don't have to be the same function, or even nearby in the source. The
mechanism between the two is called **stack unwinding**: every function
call still in progress between the `throw` and the matching `catch`
exits immediately, and any local object with a real destructor along
the way still gets destroyed correctly — a thrown exception skips the
*rest of the normal code* in each of those functions, not their real
cleanup.

Also recognized in: Python's `raise`/`try`/`except`, Java's and C#'s own
`throw`/`try`/`catch` (near-identical keyword spelling, the same
underlying mechanism), any web framework's global error handler
catching failures from many different request handlers in one place,
and a database driver's connection-retry logic catching a real
connection failure and deciding whether to retry rather than crashing
the whole application.

## SE Lens

Why `throw` a real exception here, instead of giving `Percentage` a
`bool is_valid` field the caller has to remember to check afterward? A
`bool` flag can be silently ignored — nothing stops code from using a
`Percentage` without ever checking whether it's actually valid, and the
mistake wouldn't surface until much later, somewhere disconnected from
where the real problem actually was. A thrown exception makes ignoring
the problem structurally harder: an uncaught one crashes the program
loudly, immediately, at the real point of failure. The real cost:
exception handling carries real performance overhead compared to a
checked return value, in languages and situations where that overhead
actually matters — a genuine tradeoff, not a reason to avoid exceptions
where correctness matters more than raw speed, which is the common case
for constructors validating their own real invariants.

## Connection

Builds on ordinary C++ constructors and classes — no other concept file
required first. Commonly paired with a project's own custom exception
types (subclassing `std::exception` or one of its standard subclasses)
once a generic message string like this file's own isn't specific
enough to distinguish one real failure mode from another at the
`catch` site.

## Try It Yourself

1. Add a second `catch` block, after the existing one, for
   `const std::exception& e` (`std::invalid_argument`'s own base class).
   Deliberately construct a different real `std::exception` subclass
   yourself (`std::out_of_range`, say) and confirm this second, more
   general `catch` is the one that actually handles it — proving
   `catch` selection genuinely depends on the real thrown type, not
   just which `catch` block appears first in the source.
2. Change `Percentage`'s constructor to also reject `NaN` (`value != value`
   is `true` only for `NaN`, a real, standard trick), with its own real
   message distinguishing "out of range" from "not a real number."
   Trigger both real failures separately and confirm each produces its
   own distinct, correct message.
3. Remove the `throw` entirely and replace it with a `std::cerr` message
   plus silently clamping `value` into range. Construct a few
   out-of-range `Percentage`s and consider, concretely, how a bug caused
   by a silently-clamped value would actually surface later — compare
   how much harder that is to trace back to its real cause than this
   file's own loud, immediate, caught-or-crashed behavior.
