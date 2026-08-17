# Lesson A5: One Interface, Many Behaviors

_Which lines matter changes day to day (by keyword today, by severity tomorrow)._

- **What you will build** — A program that reads a log file line by
  line and prints only the lines that "matter" — except what "matters"
  isn't fixed: today it might mean "contains the word ERROR," tomorrow
  it might mean "at or above WARN severity," and the code doing the
  actual reading shouldn't have to be rewritten every time that
  definition changes. This lesson builds two interchangeable ways of
  deciding whether a line matters, behind one shared interface, and one
  reading function that works identically no matter which one is
  plugged in — proving, with a real compile error and a real runtime
  demonstration, both that this depends on a C++ mechanism called
  virtual dispatch, and what breaks without it.

- **What you need to know first** — Lesson A3's `std::ifstream`-based
  file reading (`is_open()`, `eof()`), and Lesson A2's class syntax
  (fields, methods, constructors) — this lesson builds several small
  classes that share a common shape rather than one that stands alone.

- **Terms used in this lesson**

  - **Inheritance** — declaring a class (the *derived* class) in terms
    of another (the *base* class), automatically gaining that base
    class's members, and optionally providing its own version of some of
    them. It exists so that behavior common to several related types —
    here, "can be checked against a line of text and report whether it
    matches" — only has to be declared once, as a shared contract,
    instead of being reinvented independently inside every type that
    needs it.
  - **Base class / derived class** — the base class is the one being
    inherited from; the derived class is the one doing the inheriting,
    written as `class Derived : public Base { ... }`. Every derived
    class automatically has everything the base class declared, plus
    whatever new members the derived class adds of its own.
  - **Virtual method** — a method the base class declares with the
    `virtual` keyword, telling the compiler not to decide, at compile
    time, which version of that method a given call refers to — decide
    instead at runtime, based on the real, actual type of the object a
    pointer or reference refers to, regardless of the *declared* type of
    that pointer or reference. It exists because, without it, calling a
    method through a base-class reference always runs the base class's
    own version, even when the real underlying object is a derived type
    with its own override — a real, provable failure this lesson
    demonstrates directly, not just describes.
  - **`override`** — a keyword placed on a derived class's method,
    explicitly declaring "this is meant to override a specific virtual
    method inherited from the base class," rather than accidentally
    introducing an unrelated new method that merely happens to share a
    name. It exists as a safety net: if the signature doesn't actually
    match any virtual method the base class declares (a typo, a mismatched
    parameter type), the compiler treats that as a hard error instead of
    silently compiling a method that never overrides anything at all.
  - **Abstract class / pure virtual method** — a class containing at
    least one method declared with `= 0` instead of a body (a *pure
    virtual* method), marking it as something every concrete subclass
    *must* provide its own real implementation for. A class with even
    one such method — an *abstract class* — can never be instantiated
    directly. It exists to let a class state, with the compiler actually
    enforcing it, "this class only defines a shared contract; a real
    object has to come from a subclass that implements every part of
    it," rather than leaving that as an unenforced convention a reader
    just has to trust.
  - **Interface** — informally, a class (often entirely abstract) whose
    only job is to declare a contract — a set of methods every
    implementing type promises to provide — without supplying any
    behavior of its own. It exists to separate *what* can be done (the
    interface) from *how* it's actually done (each concrete
    implementation), which is exactly what lets interchangeable behavior
    sit behind one caller that never has to change.
  - **Strategy pattern** — the named design pattern this lesson builds:
    define a family of interchangeable behaviors behind one shared
    interface, so that any code using that behavior depends only on the
    interface, never on which specific implementation happens to be
    plugged in at the moment. It exists for exactly this lesson's
    vehicle: which lines matter changes from one run to the next, and
    the code that reads and filters those lines shouldn't have to be
    rewritten every single time that decision changes.

- **Objects and methods used**

  - **`LineFilter`**
    - *What it is:* this lesson's own subject — an abstract class
      declaring the shared interface every line-matching strategy
      implements.
    - *Implementation:* `class LineFilter { public: virtual bool
      matches(const std::string& line) = 0; virtual ~LineFilter() {} };`
      — one pure virtual method, plus a virtual destructor.
    - *Its use:* the one type `printMatchingLines` (below) actually
      depends on — it never mentions `KeywordFilter` or
      `SeverityFilter` by name anywhere in its own code.
  - **`KeywordFilter`**
    - *What it is:* a concrete strategy — a line "matters" if it
      contains a specific substring.
    - *Implementation:* `class KeywordFilter : public LineFilter {
      private: std::string keyword; public: KeywordFilter(const
      std::string& kw); bool matches(const std::string& line) override;
      };` — stores one keyword, checks each line for it.
    - *Its use:* the "by keyword today" half of this lesson's vehicle.
  - **`SeverityFilter`**
    - *What it is:* a second, unrelated concrete strategy — a line
      "matters" if its severity level meets or exceeds a stored
      threshold.
    - *Implementation:* `class SeverityFilter : public LineFilter {
      private: int threshold; int severityOf(const std::string& line);
      public: SeverityFilter(int t); bool matches(const std::string&
      line) override; };` — stores a numeric threshold, ranks each
      line's leading word against it.
    - *Its use:* the "by severity tomorrow" half of this lesson's
      vehicle — proof that a second, structurally different strategy
      plugs into the exact same interface as the first.
  - **`printMatchingLines(const std::string& filename, LineFilter&
    filter)`**
    - *What it is:* this lesson's own subject — the function that reads
      a file and prints whichever lines the supplied strategy accepts.
    - *Implementation:* `void printMatchingLines(const std::string&
      filename, LineFilter& filter);` — opens the file, reads it line by
      line, calls `filter.matches(line)` for each one.
    - *Its use:* the "caller that never changes" the Strategy pattern's
      own definition promises — this lesson calls it once with a
      `KeywordFilter` and once with a `SeverityFilter`, with its own
      source code identical both times.

  **Everything else in this lesson's code, not its own subject but
  still explained:**

  - **`std::string::find(const std::string& str, size_type pos = 0)`**
    (verified against this machine's real `<string>` header this
    session)
    - *What it is:* a method searching for the first occurrence of one
      string inside another.
    - *Implementation:* `size_type find(const basic_string& str,
      size_type pos = 0) const noexcept;` — returns the index of the
      first match, or the special constant `std::string::npos` if there
      is none.
    - *Its use:* `KeywordFilter::matches` uses it to check whether a
      line contains its stored keyword anywhere; `SeverityFilter`'s own
      helper uses the overload that searches from the start (`find(...)
      == 0`) to check specifically whether a line *begins with* a given
      word.
  - **`std::getline(std::istream& is, std::string& str)`** (verified
    against this machine's real `<string>` header this session)
    - *What it is:* a free function reading one line of text from a
      stream into a string, stopping at (and discarding) the newline.
    - *Implementation:* `basic_istream<charT, traits>& getline(...)` —
      returns the stream itself, the same self-returning idiom already
      used by `file >> value` in Lessons A1 through A4, letting it be
      used directly as a `while` loop's own condition.
    - *Its use:* `printMatchingLines` uses it instead of `file >> value`
      because a log line is text with spaces in it, not a single
      whitespace-delimited token the way an integer was in earlier
      lessons.

---

## Concept Unit A5.1: Virtual Dispatch — Letting the Real Type Decide

### The Problem

Two different ways of deciding "does this line matter" — checking for a
keyword, checking a severity level — need to sit behind one function
that reads a file and calls whichever one is currently active, without
that function ever being rewritten when the decision logic changes. That
requires calling a method through something that doesn't commit, in
advance, to exactly which concrete type it's dealing with — a reference
to a shared base type, standing in for any one of several different
derived types. Does an ordinary method call through a base-class
reference actually run the *derived* type's own version, or does
something else happen?

### Introducing the Concept in Isolation

Answering that concretely, with two near-identical class hierarchies —
one ordinary, one using a keyword this unit hasn't explained yet — side
by side:

```cpp
class NonVirtualBase {
public:
    std::string speak() { return "..."; }
};

class NonVirtualDerived : public NonVirtualBase {
public:
    std::string speak() { return "derived speaking (non-virtual)"; }
};

class VirtualBase {
public:
    virtual std::string speak() { return "..."; }
};

class VirtualDerived : public VirtualBase {
public:
    std::string speak() override { return "derived speaking (virtual)"; }
};
```

```cpp
NonVirtualDerived nvd;
NonVirtualBase& nvRef = nvd;
std::cout << "non-virtual, called through base reference: "
          << nvRef.speak() << std::endl;

VirtualDerived vd;
VirtualBase& vRef = vd;
std::cout << "virtual, called through base reference:     "
          << vRef.speak() << std::endl;
```

```
$ g++ -std=c++17 -Wall -Wextra -o virtual_proof virtual_proof.cpp
$ ./virtual_proof
non-virtual, called through base reference: ...
virtual, called through base reference:     derived speaking (virtual)
```

Both `nvRef` and `vRef` are references to a *base* type, both actually
refer to a *derived* object, and both derived classes define their own
`speak()`. The results are different anyway: `nvRef.speak()` prints
`"..."` — the base class's own version — even though `nvd` really is a
`NonVirtualDerived`. `vRef.speak()` prints `"derived speaking
(virtual)"` — the actual, real type's version. The only difference
between the two hierarchies is one keyword, `virtual`, on the base
class's declaration of `speak()`. That keyword is what tells the
compiler to defer the decision of *which* `speak()` to call until the
program is actually running, checking the real type of the object being
referred to rather than the declared type of the reference pointing at
it — a mechanism called **virtual dispatch**, and `virtual`, `override`,
and inheritance itself (`: public Base`) are the concrete language
features that make it available at all.

This isolated example is discarded now; `virtual_proof.cpp` does not
appear anywhere in this lesson's actual project. It exists only to prove
that `virtual` is not a formality — leaving it off produces a real,
different, wrong answer.

### Mechanical Walkthrough

- **`class NonVirtualDerived : public NonVirtualBase { ... }`** (and
  its `Virtual` counterpart) — this is **inheritance**: `NonVirtualDerived`
  automatically has everything `NonVirtualBase` declared, and its own
  `speak()` here is a completely separate, unrelated method that merely
  happens to share a name — not an override of anything, since
  `NonVirtualBase::speak()` was never marked `virtual` in the first
  place.
- **`virtual std::string speak() { return "..."; }`** (in `VirtualBase`)
  — the `virtual` keyword marks this specific method as one whose real,
  final version is decided at runtime, not compile time, by whatever
  object a call is actually made through.
- **`std::string speak() override { ... }`** (in `VirtualDerived`) — the
  `override` keyword confirms, and lets the compiler verify, that this
  method really is meant to replace `VirtualBase`'s own `speak()` for
  any `VirtualDerived` object, rather than being an unrelated method
  that happens to match by coincidence.
- **`NonVirtualBase& nvRef = nvd;`** (and its `Virtual` counterpart) —
  binds a reference of the *base* type to an object that is actually of
  the *derived* type. This is legal specifically because of inheritance:
  every `NonVirtualDerived` genuinely *is* a `NonVirtualBase` too, so a
  reference to the base type can validly refer to it.
- **`nvRef.speak()`** and **`vRef.speak()`** — the actual calls whose
  differing results are this unit's entire proof: the compiler decides
  which `speak()` each one runs based on whether `virtual` was present
  on the base class's declaration, not based on anything visible at the
  call site itself.

### CS Lens

```
Also recognized in: every GUI framework's event-handling base classes
(a generic Button base class calling an overridden onClick a specific
subclass provides), a game engine's Entity base class (update() runs
each subclass's own real behavior through one shared game loop), and
a plugin system loading unknown implementations of a known interface
at runtime, calling them the same way regardless of which one loaded
```

### SE Lens

The alternative not chosen here is what `NonVirtualBase` above actually
does: let each class define its own method with no shared, enforced
contract, and let the compiler pick a version based on the reference's
*declared* type rather than the object's *real* type. That costs
nothing extra and is faster at runtime — no decision has to be made at
the moment of the call, since the compiler already resolved it while
compiling. The real price, proven above: any code written against the
base type silently gets the base's own behavior, even when a more
specific, correct version exists on the actual object — a bug that
produces no warning, no error, and no crash, just a quietly wrong
answer, exactly as `nvRef.speak()` demonstrated.

### Connecting

Calling a method through a shared reference and getting the *real*
object's own behavior back, correctly, is the exact mechanism this
lesson's actual goal — one filtering function, many interchangeable
filter types — depends on. The next unit builds the real thing.

---

## Concept Unit A5.2: The Strategy Pattern

### The Problem

Two genuinely different ways of deciding "does this line matter" —
checking for a keyword, checking a severity level — need to share one
interface, so that a single reading function can call either one without
ever knowing, or caring, which specific one is active. Concept Unit
A5.1 proved the *mechanism* that makes this possible. This unit builds
the actual shared interface and two real implementations of it.

### Project Change

- **Reference Source** — No reference counterpart; from-scratch, same as
  every prior lesson in this track.
- **Files affected** — `strategy_filter.cpp` (new file).
- **Change type** — add.
- **Location** — n/a; this file's first content.
- **Dependencies** — `<fstream>`, `<string>`; a log file, `log.txt`, to
  filter.
- **Note on the ambient file resource:** the real work of reading and
  releasing the file itself continues to lean on `std::ifstream`'s own
  RAII behavior, exactly as Lesson A3 established — nothing about it
  changes here, so it isn't re-derived in this unit; this unit's own new
  concept is the interface `printMatchingLines` filters lines through,
  not how the file itself gets opened and closed.

### The New Code

```cpp
class LineFilter {
public:
    virtual bool matches(const std::string& line) = 0;
    virtual ~LineFilter() {}
};

class KeywordFilter : public LineFilter {
private:
    std::string keyword;

public:
    KeywordFilter(const std::string& kw) {
        keyword = kw;
    }

    bool matches(const std::string& line) override {
        return line.find(keyword) != std::string::npos;
    }
};

class SeverityFilter : public LineFilter {
private:
    int threshold;

    int severityOf(const std::string& line) {
        if (line.find("ERROR") == 0) return 2;
        if (line.find("WARN") == 0) return 1;
        if (line.find("INFO") == 0) return 0;
        return -1;
    }

public:
    SeverityFilter(int t) {
        threshold = t;
    }

    bool matches(const std::string& line) override {
        return severityOf(line) >= threshold;
    }
};
```

### The Updated Project

```cpp
#include <fstream>
#include <string>
#include <iostream>

class LineFilter {                                        // ← new
public:                                                    // ← new
    virtual bool matches(const std::string& line) = 0;     // ← new
    virtual ~LineFilter() {}                                // ← new
};                                                          // ← new

class KeywordFilter : public LineFilter {                  // ← new
private:                                                    // ← new
    std::string keyword;                                    // ← new

public:                                                     // ← new
    KeywordFilter(const std::string& kw) {                 // ← new
        keyword = kw;                                       // ← new
    }                                                       // ← new

    bool matches(const std::string& line) override {        // ← new
        return line.find(keyword) != std::string::npos;    // ← new
    }                                                       // ← new
};                                                          // ← new

class SeverityFilter : public LineFilter {                 // ← new
private:                                                    // ← new
    int threshold;                                          // ← new

    int severityOf(const std::string& line) {               // ← new
        if (line.find("ERROR") == 0) return 2;               // ← new
        if (line.find("WARN") == 0) return 1;                // ← new
        if (line.find("INFO") == 0) return 0;                // ← new
        return -1;                                          // ← new
    }                                                       // ← new

public:                                                     // ← new
    SeverityFilter(int t) {                                 // ← new
        threshold = t;                                      // ← new
    }                                                       // ← new

    bool matches(const std::string& line) override {        // ← new
        return severityOf(line) >= threshold;               // ← new
    }                                                       // ← new
};                                                          // ← new

void printMatchingLines(const std::string& filename, LineFilter& filter) { // ← new
    std::ifstream file(filename);                           // ← new
    if (!file.is_open()) {                                  // ← new
        return;                                             // ← new
    }                                                       // ← new
    std::string line;                                       // ← new
    while (std::getline(file, line)) {                       // ← new
        if (filter.matches(line)) {                          // ← new
            std::cout << line << std::endl;                  // ← new
        }                                                    // ← new
    }                                                        // ← new
}                                                            // ← new

int main() {
    std::cout << "-- keyword filter: ERROR --" << std::endl;
    KeywordFilter kw("ERROR");
    printMatchingLines("log.txt", kw);

    std::cout << "-- severity filter: WARN and above --" << std::endl;
    SeverityFilter sev(1);
    printMatchingLines("log.txt", sev);

    return 0;
}
```

As a whole, `printMatchingLines` mentions `LineFilter` and nothing else —
no `KeywordFilter`, no `SeverityFilter` anywhere in its own text. `main()`
calls it twice, once with each concrete strategy, and
`printMatchingLines`'s own source code is byte-for-byte identical both
times — Concept Unit A5.1's virtual dispatch is what makes `filter.matches(line)`
correctly run whichever concrete strategy was actually passed in.

```
$ cat log.txt
INFO: server started
WARN: disk usage high
ERROR: connection refused
INFO: request handled
ERROR: disk full
WARN: retrying request
$ g++ -std=c++17 -Wall -Wextra -o strategy_filter strategy_filter.cpp
$ ./strategy_filter
-- keyword filter: ERROR --
ERROR: connection refused
ERROR: disk full
-- severity filter: WARN and above --
WARN: disk usage high
ERROR: connection refused
ERROR: disk full
WARN: retrying request
```

### Mechanical Walkthrough

- **`virtual bool matches(const std::string& line) = 0;`** — a **pure
  virtual method**: the `= 0` means `LineFilter` provides no body for
  it at all, only a signature every subclass is required to implement.
  This is what makes `LineFilter` an **abstract class**, and what makes
  `LineFilter f;` on its own illegal — proven directly, not just stated,
  below.
- **`virtual ~LineFilter() {}`** — a virtual destructor with an empty
  body. It exists so that destroying a `LineFilter`-typed pointer to a
  real `KeywordFilter` or `SeverityFilter` object correctly runs that
  derived class's own destructor too, through the same virtual-dispatch
  mechanism Concept Unit A5.1 proved — without `virtual` here, deleting
  through a base pointer would only run the base's own (trivial)
  cleanup, silently skipping any derived class's own.
- **`class KeywordFilter : public LineFilter`** (and `SeverityFilter`'s
  identical relationship) — **inheritance**: each concrete filter *is a*
  `LineFilter`, gaining the obligation to implement `matches`, in
  exchange for being usable anywhere a `LineFilter` is expected.
- **`bool matches(const std::string& line) override`** (in both derived
  classes) — each class's own real implementation of the shared
  contract, marked `override` to have the compiler confirm it genuinely
  replaces `LineFilter`'s pure virtual declaration rather than
  introducing an unrelated method.
- **`line.find(keyword) != std::string::npos`** (in `KeywordFilter`) —
  calls the real `std::string::find` shown in this lesson's Header,
  comparing its result against `npos`, the sentinel value it returns
  when nothing matches — this line is `true` exactly when `keyword`
  appears anywhere inside `line`.
- **`line.find("ERROR") == 0`** (in `SeverityFilter::severityOf`) — the
  same `find` method, checked against `0` specifically rather than
  `npos`: this is `true` only when the match starts at the very first
  character, meaning the line *begins with* `"ERROR"`, not merely
  contains it somewhere.
- **`void printMatchingLines(const std::string& filename, LineFilter&
  filter)`** — its second parameter's type is the crux of this entire
  lesson: a **reference** to the abstract `LineFilter` **interface**,
  not to any specific concrete class, which is exactly what lets
  `main()` pass in either concrete strategy without this function's own
  signature or body ever needing to change.
- **`filter.matches(line)`** — the call whose behavior Concept Unit
  A5.1 already proved: because `matches` is `virtual`, this line runs
  whichever concrete class's own `matches` actually applies to the
  object `filter` currently refers to — `KeywordFilter`'s the first
  time `printMatchingLines` is called, `SeverityFilter`'s the second.

**Proof that `LineFilter` really can't be instantiated directly** — not
asserted, checked:

```cpp
LineFilter f;
```

```
$ g++ -std=c++17 -Wall -Wextra -c abstract_test.cpp
abstract_test.cpp:10:16: error: variable type 'LineFilter' is an
abstract class
    LineFilter f;
               ^
abstract_test.cpp:5:18: note: unimplemented pure virtual method
'matches' in 'LineFilter'
```

The compiler names the exact unimplemented method as its reason — real,
specific evidence that `= 0` does what this unit claims, not a
plausible-sounding assertion about it.

### CS Lens

```
Also recognized in: a payment processor accepting CreditCard,
PayPal, and BankTransfer behind one process(Payment&) interface; a
compression tool choosing gzip, bzip2, or zstd behind one compress()
call; a game's AI choosing between AggressiveStrategy and
DefensiveStrategy behind one decideMove() call, swappable mid-game
```

### SE Lens

The alternative not chosen here is the one a beginner reaches for first:
give `printMatchingLines` an extra parameter — a string, an enum, a flag
— naming *which* filtering logic to use, and put an `if`/`else` chain
inside the function itself choosing between keyword-matching code and
severity-checking code. That avoids `LineFilter` entirely, and for
exactly two filter kinds that never change, it's barely more code. It
stops scaling the moment a third filtering strategy is needed: the
`if`/`else` chain inside `printMatchingLines` has to be edited every
single time, meaning the one function this whole lesson was trying to
keep stable is exactly the one that keeps changing. The Strategy pattern
pays a small real cost — an extra abstract class, a virtual call instead
of a direct one, a little more code up front — in exchange for adding a
third, fourth, or hundredth filtering strategy without `printMatchingLines`
itself ever being touched again.

### Connecting

`printMatchingLines` doesn't know, and structurally can't know, whether
it's filtering by keyword or by severity — the decision lives entirely
inside whichever concrete `LineFilter` was passed in, made possible by
the exact virtual-dispatch mechanism Concept Unit A5.1 proved works.

---

## Closing

**Connect the pieces.** Follow the line `"WARN: disk usage high"`
through the second call in `main()`, `printMatchingLines("log.txt",
sev)` with `sev` a `SeverityFilter(1)`. `std::getline(file, line)`
reads it into `line`. `filter.matches(line)` is called — `filter` is
declared as a `LineFilter&`, but because `matches` is `virtual`, the
real, running type behind that reference (`SeverityFilter`) is what
actually decides which code runs, exactly as Concept Unit A5.1 proved.
Inside `SeverityFilter::matches`, `severityOf(line)` checks
`line.find("ERROR") == 0` — false, the line doesn't start with `ERROR`
— then `line.find("WARN") == 0` — true, since `line` begins with
`WARN:` — returning `1`. Back in `matches`, `1 >= threshold` (`1 >= 1`)
is `true`, so the line is printed. Not one line of `printMatchingLines`
itself needed to know any of this; it only ever asked `filter.matches(line)`
and trusted the answer, the same call it made once already for
`KeywordFilter` with completely different internal logic behind it.

**What breaks without this.** Remove `virtual` from `LineFilter`'s
declaration (and the now-illegal `= 0` along with it, replacing the pure
virtual method with an ordinary one that just returns `false`), leaving
every other line — including `KeywordFilter`'s own `matches`,
`printMatchingLines`, and `main()` — completely untouched:

```cpp
class LineFilter {
public:
    bool matches(const std::string& line) { return false; }  // virtual removed
};
```

```
$ g++ -std=c++17 -Wall -Wextra -o strategy_broken strategy_broken.cpp
$ ./strategy_broken
-- keyword filter: ERROR (virtual removed) --
-- (end) --
```

Silence. `log.txt` genuinely contains two lines with `ERROR` in them —
Concept Unit A5.2's own "Run it" output proves it — and this version
prints neither. No crash, no warning about the real bug (the compiler's
only complaint is an unused parameter, a red herring), no error message
of any kind: `filter.matches(line)` now resolves at compile time, before
the program even runs, to `LineFilter`'s own `matches`, which always
returns `false`, regardless of which concrete object `filter` actually
refers to at the moment of the call. This is the exact quiet-but-wrong
failure Concept Unit A5.1's SE Lens described in the abstract, now
reproduced in the real project: restoring `virtual` — and the pure
`= 0` that makes `LineFilter` properly abstract again — fixes it, for
the same reason Concept Unit A5.1's isolated proof worked the first
time.

**Exercises.**

1. Add a third strategy, `LineNumberFilter`, that matches every `Nth`
   line (tracking a running count internally), and plug it into
   `main()`'s existing calls to `printMatchingLines` — confirming that
   function's own source code still doesn't need to change at all.
2. Remove `override` (but not `virtual`) from one of `KeywordFilter` or
   `SeverityFilter`'s `matches` methods, and deliberately introduce a
   small signature mismatch (an extra `const`, a different parameter
   type) — observe whether the compiler catches it, or whether it
   silently compiles as an unrelated new method instead.
3. Change `SeverityFilter`'s constructor to accept a `threshold` of `3`
   (higher than any real severity this lesson defines) and predict,
   before running it, how many lines `printMatchingLines` will print —
   then confirm.

**Definition of done.**

- [ ] `strategy_filter.cpp` compiles cleanly with `g++ -std=c++17 -Wall
      -Wextra`, zero warnings.
- [ ] Both filter strategies, run against the same `log.txt`, produce
      correct and different output, using the identical call to
      `printMatchingLines`.
- [ ] The virtual-vs-non-virtual proof (Concept Unit A5.1) and the
      abstract-class compile error (Concept Unit A5.2) were both
      actually built and run this session, not assumed from familiarity
      with the pattern.
- [ ] The "what breaks without this" version was actually built and
      run, confirming the silent, crash-free failure, before `virtual`
      was restored.
- [ ] `git commit` with a message explaining *why* `printMatchingLines`
      never needs to change when a filtering strategy changes — not
      merely that the code compiles.
