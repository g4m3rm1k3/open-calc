# Lesson 30: When Two Packages Want Different Things
### (Project 10 — Package Manager, C++)

**What you will build.** A real `Version` type that compares
`major.minor.patch` numerically instead of as text — fixing a genuine,
easy-to-miss bug — and a resolver that takes several packages' version
requirements for the *same* shared dependency and either finds the
highest version satisfying all of them, or reports, precisely, which
two requirements are impossible to satisfy together. The transferable
problem this lesson is actually about: comparing structured data by
treating it as plain text is a real, common trap, and "no solution
exists" is only a useful answer when it comes with a reason.

**What you need to know first.** Lesson 29 — `DependencyGraph`,
topological sort, and the precise, named-cycle error message this
lesson's own failure diagnostic directly echoes.

---

## Concept Unit: Comparing Versions Correctly

### The Problem

Every version string so far in this project has been just a string.
Comparing `"2.9.0"` and `"2.10.0"` the obvious way — with `<`, the way
any two strings compare — has a real, silent bug worth seeing before
building anything on top of it.

### Project Change

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — created `string_compare_bug.cpp` (throwaway,
  this unit only).
- **Change type** — add.
- **Location** — new file, new project directory.
- **Dependencies** — none beyond `g++`.

### The New Code

```cpp
std::string a = "2.9.0";
std::string b = "2.10.0";

std::cout << "a < b (as plain strings)? " << (a < b) << std::endl;
```

### The Updated Project

Brand-new throwaway file, shown whole above.

### Introduce the concept in isolation

Real output:

```
a = 2.9.0, b = 2.10.0
a < b (as plain strings)? 0
```

`"2.9.0" < "2.10.0"` is `0` — **false**. Plain string comparison
checks characters left to right: `'2' == '2'`, then `'.' == '.'`, then
`'9'` versus `'1'` — and `'9'` is a *larger* character than `'1'`, so
the comparison stops right there, concluding `"2.9.0"` is *not* less
than `"2.10.0"`. That's backward — `2.10.0` is the newer, larger
version. String comparison has no concept of "this is a number with
more than one digit"; it only ever compares character by character.

### Discard the throwaway example

`string_compare_bug.cpp` is deleted — it only existed to prove the bug
is real, before building the real fix.

### Project Change (the fix)

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — created `version.cpp`.
- **Change type** — add.
- **Location** — new file.
- **Dependencies** — `<sstream>`.

### The New Code

```cpp
struct Version {
    int major, minor, patch;

    static Version parse(const std::string& text) {
        std::vector<int> parts;
        std::stringstream ss(text);
        std::string segment;
        while (std::getline(ss, segment, '.')) {
            parts.push_back(std::stoi(segment));
        }
        return Version{parts[0], parts[1], parts[2]};
    }

    bool operator<(const Version& other) const {
        if (major != other.major) return major < other.major;
        if (minor != other.minor) return minor < other.minor;
        return patch < other.patch;
    }

    bool operator==(const Version& other) const {
        return major == other.major && minor == other.minor && patch == other.patch;
    }

    bool operator<=(const Version& other) const { return *this < other || *this == other; }
    bool operator>=(const Version& other) const { return !(*this < other); }
    bool operator>(const Version& other) const { return other < *this; }

    std::string toString() const {
        return std::to_string(major) + "." + std::to_string(minor) + "." + std::to_string(patch);
    }
};
```

### The Updated Project

Brand-new file, shown whole above — this lesson's real, permanent
version type.

### Mechanical walkthrough

- `struct Version { int major, minor, patch; ... };` — **(a) first
  appearance,** conceptually: version numbers are parsed *into three
  real integers*, not kept as text at all — the fix isn't a smarter
  string comparison, it's not comparing strings in the first place.
- `std::stringstream ss(text); while (std::getline(ss, segment, '.'))`
  — **(a) first appearance** of `std::stringstream`: treats a string as
  a readable stream, and `std::getline(ss, segment, '.')` reads one
  chunk at a time, splitting on `.` — the C++ standard library's own
  tool for exactly the job Project 5, Lesson 12's JavaScript `.split()`
  and Python's own string splitting did in earlier phases.
- `bool operator<(const Version& other) const { ... }` — **(a) first
  appearance** of **operator overloading**: defines what `<` *means*
  for two `Version` objects — comparing `major` first, falling through
  to `minor` only if `major` is equal, then `patch` only if both are
  equal — the exact, correct three-level comparison string comparison
  can't express.
- `bool operator<=(const Version& other) const { return *this < other || *this == other; }`
  — **(a) first appearance,** as a pattern: rather than writing four
  independent comparison implementations, `<=`, `>=`, and `>` are each
  defined *in terms of* `<` and `==` — one correct comparison,
  reused, rather than four separate chances to get the logic wrong.

### CS lens

This is defining a real **total order** on a custom type — a
well-defined, consistent way to say "this one comes before that one"
for every possible pair. Also recognized in: Java's `Comparable`
interface and `Comparator` (Project 7, Lesson 15's own CS lens named
this exact idea), Python's `__lt__`/`functools.total_ordering`, C#'s
`IComparable<T>` — every language in this curriculum has its own
version of "teach the language how to compare my own type correctly."

### SE lens

Proven directly:

```
a = 2.9.0, b = 2.10.0
a < b (as real Versions)? 1
```

The identical two version numbers, compared correctly this time — `1`,
true. The real cost of the fix: parsing every version string into a
`Version` object before it can be compared at all, rather than
comparing raw strings directly — a small, one-time cost per version,
paid once, in exchange for every comparison afterward being correct by
construction rather than accidentally correct for some inputs and
silently wrong for others.

### Commands needed

Same `g++ -std=c++17` pattern as Lesson 29.

### Run it

Both shown above.

### Connecting sentence

Versions can now be compared correctly — the next unit uses that
correctness to answer a real question: does a given version satisfy
what a package actually asked for?

---

## Concept Unit: Version Ranges

### The Problem

A package doesn't usually need one exact version — it needs *any*
version within some acceptable range, commonly expressed as
`>=2.0.0 <3.0.0`: at least 2.0.0, but nothing from 3.0.0 onward
(a common convention: a major version bump may include breaking
changes, so an upper bound excluding the next major version is a
realistic, common constraint shape).

### Project Change

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — created `version_range_lab.cpp` (throwaway, this
  unit only).
- **Change type** — add.
- **Location** — new file.
- **Dependencies** — `Version`, this lesson's previous unit.

### The New Code

```cpp
struct VersionRange {
    Version min;
    Version max;  // exclusive

    bool satisfies(const Version& v) const {
        return v >= min && v < max;
    }
};
```

### The Updated Project

Brand-new throwaway file, shown whole above.

### Introduce the concept in isolation

```cpp
VersionRange range{Version::parse("2.0.0"), Version::parse("3.0.0")};

for (const std::string v : {"1.9.0", "2.0.0", "2.5.3", "2.99.99", "3.0.0"}) {
    std::cout << v << " satisfies >=2.0.0 <3.0.0? " << range.satisfies(Version::parse(v)) << std::endl;
}
```

Real output:

```
1.9.0 satisfies >=2.0.0 <3.0.0? 0
2.0.0 satisfies >=2.0.0 <3.0.0? 1
2.5.3 satisfies >=2.0.0 <3.0.0? 1
2.99.99 satisfies >=2.0.0 <3.0.0? 1
3.0.0 satisfies >=2.0.0 <3.0.0? 0
```

The boundary behavior is exact and correct: `2.0.0` itself — the
minimum — satisfies (`min` is **inclusive**); `3.0.0` — the maximum —
does not (`max` is **exclusive**). `2.99.99`, despite looking close to
`3.0.0`, still satisfies, because version comparison — proven correct
in the previous unit — treats `99` as a number, not a string
approaching some visual limit.

### Discard the throwaway example

`version_range_lab.cpp`'s exact demonstration is deleted — the
`VersionRange`/`satisfies` shape carries forward directly into the real
resolver.

### Mechanical walkthrough

- `bool satisfies(const Version& v) const { return v >= min && v < max; }`
  — **(b) hard concept reappearing**: the `>=`/`<` operators from the
  previous unit, combined with `&&` — an ordinary boolean condition,
  now meaningful specifically because those operators were defined
  correctly.

### CS lens

Nothing new beyond what the previous unit already established about
correct comparison — this unit's real content is applying it to
express a *range* rather than a single point.

### SE lens

Choosing an inclusive minimum and exclusive maximum (rather than both
inclusive, or both exclusive) is a real, deliberate convention — it
means adjacent ranges can be expressed cleanly with no gap and no
overlap: `[1.0.0, 2.0.0)` followed immediately by `[2.0.0, 3.0.0)`
covers every version with no version double-counted or excluded at the
boundary — the same half-open interval convention many real range-based
tools and libraries use for exactly this reason.

### Commands needed

Same pattern.

### Run it

Shown above.

### Connecting sentence

One package's requirement can now be checked against one version — the
final unit answers the real question a package manager actually faces:
what happens when *several* packages each have their own requirement
for the *same* shared dependency?

---

## Concept Unit: Resolving Multiple Constraints

### The Problem

If `"app"` requires `web-framework >=2.0.0 <3.0.0` and, separately,
some other package requires `web-framework >=2.4.0 <2.20.0`, only a
version satisfying *both* ranges at once can actually be installed —
and among all such versions, a real package manager should pick the
*newest* one available, not just any one that happens to work.

### Project Change

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — created `resolve.cpp`.
- **Change type** — add.
- **Location** — new file.
- **Dependencies** — `<algorithm>`, `<optional>`.

### The New Code

```cpp
std::optional<Version> resolve(const std::vector<Version>& available, const std::vector<VersionRange>& constraints) {
    std::vector<Version> sorted = available;
    std::sort(sorted.begin(), sorted.end());

    for (auto it = sorted.rbegin(); it != sorted.rend(); ++it) {
        bool ok = true;
        for (const auto& c : constraints) {
            if (!c.satisfies(*it)) { ok = false; break; }
        }
        if (ok) return *it;
    }
    return std::nullopt;
}
```

### The Updated Project

Brand-new file, shown whole above.

### Mechanical walkthrough

- `std::sort(sorted.begin(), sorted.end());` — **(a) first appearance**
  of `std::sort`: the C++ standard library's own general-purpose sort —
  works here specifically because `Version::operator<` was defined
  correctly in this lesson's first unit; without it, `std::sort` would
  silently sort by whatever *incorrect* ordering the type happened to
  provide (or refuse to compile at all, if no ordering existed).
- `for (auto it = sorted.rbegin(); it != sorted.rend(); ++it)` — **(b)
  hard concept reappearing**: reverse iteration, the same technique
  from Lesson 29's cycle-path reconstruction, here walking from the
  *newest* available version toward the oldest, so the very first
  version found to satisfy every constraint is guaranteed to be the
  newest such version.
- `for (const auto& c : constraints) { if (!c.satisfies(*it)) { ok = false; break; } }`
  — **(b) hard concept reappearing**: `VersionRange::satisfies` from the
  previous unit, checked against *every* constraint for a given
  candidate version — `ok` only stays `true` if every single
  requirement is met.
- `return std::nullopt;` — **(b) hard concept reappearing**:
  `std::optional`'s "no value" state, from Lesson 27's AST, here
  representing "no version satisfies every constraint" — a real,
  expected outcome, not an error condition to crash on.

### CS lens

This is **constraint satisfaction**: finding a value that simultaneously
satisfies several independent conditions, or determining that none
exists. Also recognized in: exactly this problem in every real package
manager (`npm`, `pip`, `cargo` all perform genuine, often much more
sophisticated versions of this same resolution), a scheduling system
finding a meeting time that works for every attendee's calendar, a
puzzle solver checking whether a partial solution can still be
completed.

### SE lens

Proven directly, both outcomes:

```
--- compatible constraints ---
app requires >=2.0.0 <3.0.0
web-framework requires >=2.4.0 <2.20.0
Resolved: 2.10.0
```

`2.10.0` — correctly the *newest* available version satisfying both
ranges, found by walking from newest to oldest and stopping at the
first match.

```
--- incompatible constraints ---
app requires >=1.0.0 <2.0.0
web-framework requires >=2.4.0 <3.0.0
No compatible version found.
```

Correctly reported as unresolvable — but "no compatible version found"
alone, echoing Lesson 29's own insistence on naming an exact cycle
rather than just "a cycle exists," is not a satisfying answer on its
own. A real diagnostic should say *why*:

```cpp
bool overlaps(const VersionRange& other) const {
    return min < other.max && other.min < max;
}
```

```
Conflict: app requires >=1.0.0 <2.0.0 but web-framework requires >=2.4.0 <3.0.0 -- no version satisfies both.
```

`overlaps` checks whether two ranges share *any* version at all — two
ranges overlap exactly when each one's minimum is less than the
other's maximum. Checking every pair of constraints against this
finds and names the *specific* conflicting pair, the same precision
Lesson 29's cycle detector provided for circular dependencies, applied
here to version conflicts instead.

### Commands needed

Same `g++ -std=c++17` pattern.

### Run it

Shown above, all three outcomes: successful resolution, failed
resolution, and the precise conflict diagnosis.

### Connecting sentence

A version conflict is no longer a dead end with no explanation — the
exact two requirements that can't coexist are named directly, the same
standard this project has held itself to since Lesson 29's own cycle
detection.

---

## Closing

**Connect the pieces.** One dependency, through the whole lesson:
`web-framework`'s available versions — `1.8.0` through `3.0.0` — are
each parsed into real `Version` objects, comparable correctly by
`major`/`minor`/`patch`, not as text. `app` and a second package each
declare their own `VersionRange` requirement; `resolve` sorts every
available version correctly (only possible because `operator<` is
correct), walks from newest to oldest, and returns the first version
satisfying every requirement at once — `2.10.0`, found specifically
*because* `2.9.0` and `2.10.0` compare correctly relative to each other,
tracing directly back to this lesson's very first, smallest fix.

**What breaks without this.** Already shown directly — the real,
observed string-comparison bug that opened this lesson, and the
precise conflict diagnosis that closed it — deliberately not restaged,
since both landed exactly where they mattered.

**Exercises.**
1. Extend `Version::parse` to reject malformed input (`"2.x.0"`, or a
   version with only two segments) with a clear error rather than
   letting `std::stoi` throw an unrelated, less helpful exception.
2. Add a third package to this lesson's incompatible-constraints
   example, and confirm `explainFailure` correctly reports *every*
   conflicting pair, not just the first one found.
3. Real semantic versioning treats a major version of `0` specially
   (by convention, `0.x.y` releases may include breaking changes even
   in minor version bumps). Research this convention and describe, in a
   few sentences, how `VersionRange` would need to change to respect
   it.

**Definition of done.**
- [ ] You've triggered the real string-comparison bug, and confirmed
      the fixed `Version` type compares `2.9.0`/`2.10.0` correctly.
- [ ] `VersionRange::satisfies` correctly handles both boundary cases —
      inclusive minimum, exclusive maximum — confirmed against real
      output.
- [ ] `resolve` correctly finds the newest version satisfying multiple
      real constraints, and correctly reports failure — with a precise,
      named conflict — when no such version exists.
- [ ] Commit with a message explaining why — e.g. `"Compare versions
      numerically instead of as strings, fixing a real ordering bug,
      and resolve multiple version constraints to the newest mutually
      satisfying version or a precise conflict report"` — not `"add
      version resolution"`.

**Next lesson** stays in Project 10, closing it: the `Plugin` pattern,
once the package manager itself needs to support third-party install
hooks without knowing what any of them do in advance, and the `Chain of
Responsibility` pattern for validating a package before it's ever
allowed to resolve or install.
