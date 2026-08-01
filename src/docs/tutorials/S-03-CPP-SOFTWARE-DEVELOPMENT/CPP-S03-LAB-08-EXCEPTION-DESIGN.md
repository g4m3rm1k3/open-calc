# Lesson 8: An Exception Is a Return Value That Finds Its Own Way Home
### (LAB 08 — Exception Design)

**What you will build:** A character-loading function that `throw`s a custom exception type on invalid input, propagating automatically through an intermediate function with no error-handling code of its own, caught once at the top — with a real, verified proof that RAII (`S-02-CPP-DSA-MASTERY` LAB-04) and smart pointers (this series' Lesson 3) clean up correctly even when an exception interrupts normal control flow. The transferable problem: `S-01-CPP-FOUNDATIONS` LAB-12 built `CreateResult`, an `enum class` a function returns to report failure — but every function *between* the one that detects a problem and the one that handles it has to manually check and re-forward that value, or the error silently gets lost. `S-02-CPP-DSA-MASTERY` only ever *caught* exceptions the standard library already threw (`std::out_of_range`) — this lesson is the missing half: designing and throwing your own.

**What you need to know first:** `S-01-CPP-FOUNDATIONS` LAB-12 — `enum class` error codes, the return-code pattern this lesson contrasts against directly. `S-02-CPP-DSA-MASTERY` LAB-04 — RAII, destructors. This series' Lesson 2 — `virtual`/`override`, needed for a custom exception's `what()`. This series' Lesson 3 — smart pointers.

**Terms introduced in this lesson**

> **Exception** — an object thrown to signal an error, automatically propagating up the call stack until something catches it.
> **`throw`** — raises an exception, immediately transferring control away from the normal flow.
> **`try` / `catch`** — a block that may throw, paired with one or more handlers for specific exception types.
> **`std::exception`** — the standard library's base class for exceptions; `.what()` returns a description.
> **Stack unwinding** — the process of destroying every local object in every function between a `throw` and the matching `catch`, in reverse construction order, as control propagates upward.
> **`catch(...)`** — catches literally anything thrown, including non-`std::exception` types.

No pipeline diagram applies — this bridge series builds standalone concept programs.

---

## Concept Unit 1: The Problem — Return Codes Require Manual Forwarding

### The Problem

`S-01-CPP-FOUNDATIONS` LAB-12's `CreateResult createCharacter(Player& out)` returns a value the caller must check. If `createCharacter` were called from inside a *deeper* call chain — a function that itself calls another function that calls `createCharacter` — every intermediate function would need its own `if (result != CreateResult::Success) return result;` line, just to pass the failure upward untouched.

### No isolated code lab for this step

Best shown directly against `S-01-CPP-FOUNDATIONS` LAB-12's own real pattern, not an invented illustration.

### Explanation

```cpp
// S-01-CPP-FOUNDATIONS LAB-12's own pattern, extended by one layer
CreateResult createCharacter(Player& out) { /* ... */ }

CreateResult setupNewGame(Player& out) {
    CreateResult result = createCharacter(out);
    if (result != CreateResult::Success) {
        return result;   // manually forward the failure -- easy to forget
    }
    // ... more setup ...
    return CreateResult::Success;
}
```

Every layer between the failure's origin and the code that actually handles it needs this identical `if (failed) { return failed; }` boilerplate — and forgetting it, even once, silently loses the error: the caller sees `CreateResult::Success` (or whatever the forgetting function happens to return) even though something genuinely failed several layers down.

### CS Lens

An exception inverts this: instead of a value the caller must actively check and re-propagate, `throw` immediately transfers control to the nearest matching `catch`, skipping every intermediate frame automatically — no intermediate function needs to know or care that an error is passing through it at all.

### SE Lens

Return codes remain the right tool for **expected, routine outcomes** — `S-01-CPP-FOUNDATIONS` LAB-12's `getValidInt` returning after a bad keystroke is not exceptional; it happens on nearly every real run. Exceptions are the right tool for **genuinely exceptional conditions** — a corrupted save file, a required resource that doesn't exist — where forcing every intermediate layer to participate in propagating the failure would be pure, error-prone boilerplate.

### Connection

Concept Unit 2 throws a real exception and proves it propagates automatically through exactly the kind of intermediate function this unit just showed needing manual forwarding.

---

## Concept Unit 2: `throw` and Automatic Propagation

### The Problem

A function detecting invalid input two call-layers deep needs to report that failure to code at the top, without every layer in between writing forwarding logic.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `main.cpp` — new file for this lesson.
- **Change type:** Add (new file).
- **Location:** Two functions, plus `main`.
- **Dependencies:** `#include <stdexcept>`.

### The New Code

```cpp
void loadPlayerStats(int level) {
    if (level < 1) {
        throw std::runtime_error("invalid level: must be >= 1");
    }
    std::cout << "stats loaded for level " << level << std::endl;
}

void createCharacter(int level) {
    std::cout << "creating character..." << std::endl;
    loadPlayerStats(level);   // no try/catch here at all
    std::cout << "character created" << std::endl;
}
```

### The Updated Project

```cpp
#include <iostream>
#include <stdexcept>

void loadPlayerStats(int level) { /* shown above */ }
void createCharacter(int level) { /* shown above */ }

int main() {
    std::cout << "starting..." << std::endl;
    try {
        createCharacter(-1);
    } catch (const std::runtime_error& e) {
        std::cout << "caught in main: " << e.what() << std::endl;
    }
    std::cout << "back in main, still running" << std::endl;
}
```

### Concept Lab

No separate throwaway: this real code, run below, is already the smallest useful demonstration of propagation across a real intermediate function.

Run it — verified this session:

```
$ g++ main.cpp -o dungeon -std=c++17 -Wall -Wextra
$ ./dungeon.exe
starting...
creating character...
caught in main: invalid level: must be >= 1
back in main, still running
```

What that proves, precisely: `createCharacter` prints `"creating character..."`, calls `loadPlayerStats(-1)`, which `throw`s — and `createCharacter`'s own final line, `"character created"`, **never prints**. Control left `createCharacter` immediately at the `throw`, skipping the rest of its body entirely, with `createCharacter` containing zero error-handling code of its own — no `if`, no check, no forwarding. Execution resumed at `main`'s `catch` block, two call-frames away from where the exception originated, exactly the automatic propagation Concept Unit 1 argued for.

### Mechanical Walkthrough

- `#include <stdexcept>` — **(a) first appearance.** Declares `std::runtime_error` and several other standard exception types (`std::out_of_range`, already encountered as a *consumer* in `S-02-CPP-DSA-MASTERY` LAB-06/09, is declared here too).
- `throw std::runtime_error("...")` — **(a) first appearance of `throw`.** Constructs a `std::runtime_error` (a real object, holding the given message) and immediately begins propagating it upward, abandoning the rest of the current function's body.
- `try { createCharacter(-1); } catch (const std::runtime_error& e) { ... }` — **(a) first appearance of `try`/`catch`.** Everything inside `try` is monitored; `catch` matches by type — `const std::runtime_error&` here — and only runs if a thrown object's type matches (or derives from — Concept Unit 3) the caught type.

### CS Lens

Exception propagation is implemented by the compiler generating, for every function, a table of what to clean up and where control should transfer if an exception passes through — invisible in the source code, but real, generated machinery, the same category of "the compiler does real work you don't write by hand" as `virtual`'s vtable (this series' Lesson 2).

### SE Lens

`catch (const std::runtime_error& e)` — **(c) reusing** `const&` (`S-01-CPP-FOUNDATIONS` LAB-09) — catches by reference specifically to avoid an unnecessary copy of the exception object, and specifically avoids catching by value, which (for a class hierarchy, Concept Unit 3) would risk this series' own Lesson 1 object-slicing danger on the caught exception itself.

### Connection

Concept Unit 3 replaces `std::runtime_error` with a real, custom exception type — and shows it caught polymorphically, tying directly back to this series' own Lesson 2.

---

## Concept Unit 3: Custom Exception Classes

### The Problem

`std::runtime_error`'s message is just a string — a caller that wants to react differently to different *kinds* of failure (a corrupt save file versus an invalid level number, say) has no structured way to distinguish them beyond parsing the message text itself.

### Project Change

- **Reference Source:** `std::exception`'s own interface (declared in `<exception>`) — this lesson's own class derives from it, using this series' Lesson 1's inheritance and Lesson 2's `virtual`/`override`.
- **Files affected:** `main.cpp` — modified.
- **Change type:** Add (new class); `loadPlayerStats` updated to throw it.
- **Location:** Above `loadPlayerStats`.
- **Dependencies:** `class Derived : public Base` (Lesson 1), `virtual`/`override` (Lesson 2), `std::string` (`S-01-CPP-FOUNDATIONS` LAB-07).

### The New Code

```cpp
class InvalidLevelError : public std::exception {
    std::string message;
public:
    InvalidLevelError(int level) : message("invalid level: " + std::to_string(level)) {}
    const char* what() const noexcept override {
        return message.c_str();
    }
};
```

### Concept Lab

No separate throwaway: run directly below, this real class is already the clearest demonstration.

Run it — verified this session:

```
$ g++ scratch_custom_exception.cpp -o scratch_custom_exception -std=c++17 -Wall -Wextra
$ ./scratch_custom_exception.exe
caught: invalid level: -5
```

(`scratch_custom_exception.cpp`'s `main` catches via `catch (const std::exception& e)` — the **base** class, not `InvalidLevelError` directly.) What that proves: `InvalidLevelError`, thrown as `throw InvalidLevelError(level);`, was successfully caught by a handler written for the *base* `std::exception` type — this series' own Lesson 2 polymorphism, applied to exceptions: `catch (const std::exception&)` dispatches to `InvalidLevelError::what()` correctly (not a generic base message), the identical `virtual` dispatch mechanism Lesson 2 proved for `describe()`, here happening automatically because `std::exception::what()` is itself declared `virtual` in the standard library.

### Mechanical Walkthrough

- `class InvalidLevelError : public std::exception` — **(c) reusing** inheritance syntax (Lesson 1) — deriving from a standard library class exactly the way `Warrior`/`Mage` derived from a hand-written `Character`.
- `const char* what() const noexcept override` — **(c) reusing** `override` (Lesson 2) — matching `std::exception::what()`'s exact signature (`const`, `noexcept`, returning `const char*`) is required for this to be a genuine override, not a silently-hidden method (Lesson 1's own verified danger) — `override` here catches the identical class of signature-mismatch bug Lesson 2's own Concept Unit 2 demonstrated.
- `message.c_str()` — **(a) first appearance.** Returns a raw `const char*` (a C-string, `S-01-CPP-FOUNDATIONS` LAB-07) pointing at `message`'s own internal buffer — `what()`'s return type is fixed by `std::exception`'s own interface (a legacy `const char*`, predating `std::string`'s prevalence), so a `std::string` member must be converted at the point of return.

### CS Lens

A custom exception hierarchy — several specific exception types all deriving from `std::exception`, or from a project's own intermediate base — lets calling code catch broadly (`catch (const std::exception&)`, handling anything) or narrowly (`catch (const InvalidLevelError&)`, handling only this one specific case) at whichever level of the call stack is actually equipped to do something different depending on which failure occurred.

### SE Lens

Deriving from `std::exception` (rather than throwing a bare `int` or `std::string`, both legal C++) is this course's standard practice specifically because it participates in the exact polymorphic `catch (const std::exception&)` pattern verified above — any code written to catch "any standard-shaped exception" automatically handles a well-designed custom one too, with no special-casing required.

### Connection

Concept Unit 4 proves the single most important reason exceptions are safe to use at all in resource-owning code — what actually happens to local objects between the `throw` and the `catch`.

---

## Concept Unit 4: Stack Unwinding — Why RAII Makes This Safe

### The Problem

Concept Unit 2 proved a `throw` abandons the rest of a function's body immediately. If that function had local objects owning resources — a `Resource` on the stack, a `unique_ptr` owning something on the heap (this series' Lesson 3) — does `throw` leak them, the way an early `return` without a matching `delete` leaked in Lesson 3's own Concept Unit 1?

### Concept Lab

```cpp
// scratch_unwind.cpp  (disposable)
#include <iostream>
#include <memory>
#include <stdexcept>
class Resource {
    std::string name;
public:
    Resource(std::string n) : name(n) { std::cout << name << " acquired" << std::endl; }
    ~Resource() { std::cout << name << " released" << std::endl; }
};
void riskyOperation() {
    Resource r("local resource");
    auto smart = std::make_unique<Resource>("heap resource");
    std::cout << "about to throw..." << std::endl;
    throw std::runtime_error("something went wrong");
    std::cout << "this line never runs" << std::endl;
}
int main() {
    try {
        riskyOperation();
    } catch (const std::exception& e) {
        std::cout << "caught: " << e.what() << std::endl;
    }
    std::cout << "main continues" << std::endl;
}
```

Run it — verified this session:

```
$ g++ scratch_unwind.cpp -o scratch_unwind -std=c++17 -Wall -Wextra
$ ./scratch_unwind.exe
local resource acquired
heap resource acquired
about to throw...
heap resource released
local resource released
caught: something went wrong
main continues
```

**This is the single most important verified proof in this lesson.** Both `r` (a plain local object) and `smart` (a `unique_ptr`, this series' own Lesson 3) are correctly destroyed — `"heap resource released"` and `"local resource released"` both print — **before** `"caught: ..."` ever appears, meaning cleanup happened *during* the `throw`'s propagation, not as part of the `catch` block's own code (which contains no cleanup logic at all). The destruction order is the reverse of construction (`heap resource` was created second, destroyed first) — the identical ordering rule `S-02-CPP-DSA-MASTERY` LAB-04 already established for ordinary scope exit, now proven to hold during **stack unwinding** as well.

This scratch file is discarded now — but its lesson is the reason this entire bridge series built RAII (`S-02-CPP-DSA-MASTERY` LAB-04) and smart pointers (Lesson 3) *before* exceptions: nothing in `riskyOperation`'s own code had to anticipate the exception at all. It never wrote a `catch` block of its own, never checked a return code, never manually freed anything — correctness came entirely from `Resource`'s and `unique_ptr`'s own destructors running automatically, on every path out of scope, exactly as RAII always promised.

### Mechanical Walkthrough

- `Resource r("local resource");` (a plain, non-pointer local object) — **(c) reusing** ordinary construction (`S-02-CPP-DSA-MASTERY` LAB-02) — its destructor is guaranteed to run on any exit from `riskyOperation`'s scope, throw or otherwise, per this unit's own verified proof.
- The absence of any `catch` or cleanup code inside `riskyOperation` itself — **(a) first appearance of a function that is exception-safe by construction, not by explicit handling.** Nothing needed to be written for this safety to exist.

### CS Lens

**Stack unwinding** is the mechanism `throw` actually performs: walk back up the call stack, frame by frame, from the point of the `throw` to the matching `catch`, destroying every local object in every frame passed through, in reverse construction order — the identical destructor-ordering guarantee ordinary scope exit already had, extended to cover this less predictable exit path too.

### SE Lens

**This is the real argument for RAII and smart pointers, made concrete rather than asserted:** any function using raw `new`/`delete` (this series' own Lesson 3 Concept Unit 1) would leak on this exact path — a `throw` between `new` and the matching `delete` skips the `delete` entirely, the identical leak Lesson 3 already proved for an early `return`, now shown for an exception instead. A codebase using RAII and smart pointers consistently gets exception safety *for free*, throughout, without auditing every function for what happens if an exception passes through it — a codebase using raw resource management has to consider this exact scenario, correctly, in every single function that might be on the call stack when something throws.

### Connection

Concept Unit 5 closes with `catch(...)` and this lesson's own design guidance — when to reach for exceptions versus `S-01-CPP-FOUNDATIONS` LAB-12's own return-code pattern.

---

## Concept Unit 5: `catch(...)` and Choosing Between Exceptions and Return Codes

### The Problem

Not everything thrown is necessarily a `std::exception` — C++ permits throwing any type at all, including ones with no relation to the standard hierarchy. And nothing in this lesson has yet stated, plainly, when to reach for `throw` versus `S-01-CPP-FOUNDATIONS` LAB-12's own `enum class` return-code pattern.

### Concept Lab

```cpp
// scratch_catchall.cpp  (disposable)
#include <iostream>
int main() {
    try {
        throw 42;   // throwing a plain int -- not a std::exception at all
    } catch (...) {
        std::cout << "caught something via catch(...)" << std::endl;
    }
}
```

Run it — verified this session:

```
$ g++ scratch_catchall.cpp -o scratch_catchall -std=c++17 -Wall -Wextra
$ ./scratch_catchall.exe
caught something via catch(...)
```

What that proves: `throw 42;` — a bare `int`, nothing to do with `std::exception` at all — is legal C++, and `catch (...)` (three literal dots, not a typo) catches it anyway, with no way to inspect what was actually thrown (an `int` has no `.what()`, no members `catch(...)` can safely assume exist). This is a real, if rarely-needed, safety net — typically used at a program's outermost boundary to guarantee *nothing* escapes uncaught, not as a substitute for catching specific, known exception types.

A second, related proof — what happens with no `catch` at all:

```
$ echo '#include <stdexcept>
int main() { throw std::runtime_error("uncaught!"); }' > scratch_uncaught.cpp
$ g++ scratch_uncaught.cpp -o scratch_uncaught -std=c++17 -Wall -Wextra
$ ./scratch_uncaught.exe
terminate called after throwing an instance of 'std::runtime_error'
  what():  uncaught!
```

An exception that propagates all the way past `main` with no matching `catch` anywhere terminates the entire program — verified this session, exit code `3`, no graceful recovery of any kind. This is the real cost of an exception no code was prepared to handle — worth knowing precisely because it's the argument for `catch(...)` at a program's true outer boundary, and for careful design of which exceptions a given piece of code is actually expected to handle.

Both scratch files are discarded now.

### Explanation — the decision, stated directly

| Situation | Use |
|---|---|
| A routine, expected outcome the caller should always check (bad user input, `S-01-CPP-FOUNDATIONS` LAB-12) | Return code / `enum class` |
| A failure that must propagate through several layers uninvolved in handling it | Exception |
| A failure that should be impossible to silently ignore (a caller that forgets to check a return code just gets stale/wrong data; a caller that never catches an exception gets a loud program termination) | Exception |
| Code in a tight, performance-sensitive loop where the failure is common, not exceptional (`S-01-CPP-FOUNDATIONS` LAB-12's own repeated bad-keystroke case) | Return code — exceptions carry real overhead when actually thrown, appropriate for rare, genuine failures, not routine control flow |

### CS Lens

Both mechanisms coexist in real, idiomatic C++ — the standard library itself uses both (`std::vector::at()` throws; `std::vector::operator[]` doesn't check at all; `.find()` on a map returns an iterator instead of throwing, this series' own Lesson 5). Choosing between them, per call, is a real design decision this lesson's own table makes concrete, not a language-level rule to apply uniformly.

### SE Lens

Every custom exception type this course writes derives from `std::exception` (Concept Unit 3), specifically so a `catch(...)` at a program's outermost boundary is genuinely the *last* resort, not the *primary* way unexpected errors get handled — a well-designed exception hierarchy means most `catch` blocks in real code target `std::exception` or a specific derived type, with `catch(...)` reserved for the rare case of something entirely unanticipated crossing that boundary.

### Connection

This closes every new mechanism in this lesson — the Closing section connects exception-safety back to every RAII and ownership lesson this bridge series has already built.

---

## Closing

### Connect the pieces

Concept Unit 1 proved `S-01-CPP-FOUNDATIONS` LAB-12's own return-code pattern requires every intermediate layer to manually forward a failure. Concept Unit 2's `throw`/`try`/`catch` proved automatic propagation through exactly such an intermediate function, with zero forwarding code written. Concept Unit 3 replaced a generic `std::runtime_error` with a real, custom exception type, caught polymorphically through `std::exception`'s own `virtual what()` — this series' Lesson 2 applied to a standard-library hierarchy instead of a hand-written one. Concept Unit 4's verified stack-unwinding proof is this lesson's real center: every local object and every smart pointer (Lesson 3) between a `throw` and its `catch` is destroyed correctly, automatically, specifically *because* `S-02-CPP-DSA-MASTERY` LAB-04's RAII and this series' own smart-pointer discipline were built first — a codebase without them would leak on every one of the paths this lesson just proved safe. Concept Unit 5 closed with `catch(...)`'s real, narrow purpose and a concrete decision rule for choosing between exceptions and return codes going forward.

### What breaks without this

Reasoned through directly from Concept Unit 4's own verified proof, inverted: replace `riskyOperation`'s `Resource r` and `std::unique_ptr<Resource> smart` with a raw `Resource* r = new Resource("leaked");` and no matching `delete` before the `throw`. The exact same stack-unwinding process that correctly destroyed `r` and `smart` in the verified version has *nothing* to destroy for a raw pointer — `delete` is not automatic, was never called, and the `Resource` it pointed to leaks, permanently, the instant the `throw` propagates past it. This is `S-01-CPP-FOUNDATIONS` LAB-08 and this series' own Lesson 3 Concept Unit 1's leak, reached through an exception instead of an early `return` — the identical failure mode, a third time, with the identical fix: RAII, not manual bookkeeping.

### Exercises

1. Reproduce Concept Unit 4's stack-unwinding proof yourself, then deliberately replace the `unique_ptr` with a raw `new`/no-`delete` pointer and confirm, by the *absence* of a "released" message, that it leaks on the exact same `throw` that safely cleaned up everything else.
2. Extend `InvalidLevelError` (Concept Unit 3) with a second custom exception type, `CorruptSaveFileError`, and write a `catch` chain in `main` that handles each specifically (`catch (const InvalidLevelError&)`, `catch (const CorruptSaveFileError&)`) before a final `catch (const std::exception&)` — confirm each exception type reaches its own specific handler, not the generic fallback.
3. Rewrite `S-01-CPP-FOUNDATIONS` LAB-12's own `getValidInt` (or a close equivalent) to `throw` a custom exception on invalid input instead of looping until valid — then explain, in writing, why this specific case (LAB-12's own repeated-bad-keystroke scenario) is actually a *worse* fit for exceptions than for its original return-code loop, using this lesson's own decision table.
4. Trigger an uncaught exception deliberately, in your own small program, and read the real terminal output — confirm it matches this lesson's own verified `terminate called after throwing...` message, and note the actual process exit code your shell reports.

### Definition of done

- [ ] The project throws a custom exception type (deriving from `std::exception`, with a correct `override`-marked `what()`), propagating through at least one function with no error-handling code of its own.
- [ ] The program compiles with zero warnings under `-std=c++17 -Wall -Wextra`.
- [ ] Every resource in the project (heap allocations, owned objects) is managed through RAII or a smart pointer — none rely on manual cleanup that a `throw` could skip.
- [ ] You can state, from Concept Unit 4's own verified proof, exactly what stack unwinding does and in what order, and why it makes RAII-managed code exception-safe with no extra effort.
- [ ] You can explain, using Concept Unit 5's own decision table, at least one real scenario better suited to a return code than an exception, and one better suited to an exception than a return code.
- [ ] All four Exercises completed with real compiled output, including Exercise 1's deliberate leak-through-an-exception reproduction.
- [ ] Commit: `git add main.cpp && git commit -m "S03-LAB-08: custom exception hierarchy with verified stack-unwinding safety through RAII and smart pointers"` — states why (automatic propagation and proven leak-free cleanup, not just a new keyword used) not just what changed.
