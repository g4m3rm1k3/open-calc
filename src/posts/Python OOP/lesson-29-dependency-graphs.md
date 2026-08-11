# Lesson 29: An Order That Doesn't Always Exist
### (Project 10 — Package Manager, C++)

**What you will build.** A `DependencyGraph` — the actual core of any
real package manager — that takes a set of packages and their
dependencies and produces a valid install order, where every dependency
installs before anything that needs it. Then the real, harder half:
detecting a *circular* dependency, where no valid order can possibly
exist, and reporting exactly which packages form the cycle rather than
looping forever or silently producing a wrong answer. The transferable
problem this lesson is actually about: this curriculum enters "real
architecture" the way the project map itself describes it — not a new
language feature to learn, but graph traversal, a genuine algorithm,
reached for because the problem needs it, using tools every prior phase
already built.

**What you need to know first.** Everything from Phase 5 — this project
continues in C++, reusing its instincts (RAII, real measured
correctness) without re-teaching the language itself. Project 9,
Lesson 26 — recursive tree traversal, generalized here to a graph,
which can have cycles a tree structurally cannot.

---

## Concept Unit: Representing Dependencies as a Graph

### The Problem

A package manager needs to know, for any given package, exactly what
it depends on — and, critically, what *those* dependencies depend on,
transitively, all the way down. A flat list per package (`"app"` needs
`["web-framework", "logger"]`) is the raw data; something needs to
represent the *whole* structure — every package's own dependencies,
together — before any real question ("what order should these
install in?") can be answered.

### Project Change

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — created `graph_lab.cpp` (throwaway, this unit
  only).
- **Change type** — add.
- **Location** — new file, new project directory.
- **Dependencies** — `<map>`, `<vector>`, part of the C++ standard
  library.

### The New Code

```cpp
#include <map>
#include <vector>
#include <string>

std::map<std::string, std::vector<std::string>> graph;
graph["app"] = {"web-framework", "logger"};
graph["web-framework"] = {"logger"};
graph["logger"] = {};
```

### The Updated Project

Brand-new throwaway file, shown whole above.

### Introduce the concept in isolation

```cpp
for (const auto& [name, deps] : graph) {
    std::cout << name << " depends on: ";
    for (const auto& d : deps) std::cout << d << " ";
    std::cout << std::endl;
}
```

Real output:

```
app depends on: web-framework logger
logger depends on:
web-framework depends on: logger
```

`std::map<std::string, std::vector<std::string>>` — a map from package
name to its list of direct dependencies — is an **adjacency list**: the
standard, simple way to represent a graph, where each entry names one
**node** (`"app"`) and the list of other nodes it has a directed
connection, or **edge**, to (`"web-framework"`, `"logger"`). Notice
`"logger"` appears as a *dependency* of two other packages, but is
itself a node with no dependencies of its own — proving this structure
naturally represents **shared** dependencies, not just separate,
disconnected chains.

### Discard the throwaway example

`graph_lab.cpp`'s plain `std::map` is deleted — the adjacency-list
shape it proved carries forward directly into this project's real,
class-wrapped version.

### Mechanical walkthrough

- `std::map<std::string, std::vector<std::string>> graph;` — **(b)
  hard concept reappearing**: `std::map`, C++'s own ordered
  key-value structure — the direct counterpart to Python's `dict`,
  JavaScript's `Map`, Java's/C#'s `HashMap`/`Dictionary` — here nesting
  a `vector` as each value.
- `for (const auto& [name, deps] : graph)` — **(a) first appearance**
  of **structured bindings** (`[name, deps]`): unpacks each key-value
  pair from the map directly into two named variables in one line —
  C++17's own version of the tuple-unpacking idea Project 1, Lesson 2's
  Python `for key, value in dict.items():` already used.

### CS lens

This is a **directed graph**: nodes connected by one-way relationships
— `"app"` depends on `"logger"`, not the reverse. Also recognized in:
a web page's own link structure, a corporate org chart's reporting
lines, this project's own README-referenced pipeline diagrams (each
stage depending on the one before it) — worth noting, a **tree**
(Project 8, Lesson 22's `Category`, Project 4, Lesson 11's Kanban
board) is actually a *restricted* kind of graph, one where no node can
be reached by more than one path from the root; a general graph, this
lesson's real subject, has no such restriction.

### SE lens

Nothing to compare yet — this unit's whole job is establishing the
representation the rest of this lesson operates on. The real design
question — what to *do* with this structure — is the next unit's
entire subject.

### Commands needed

`g++ -std=c++17 -o <output> <file>.cpp` — **(a) first appearance** of
`-std=c++17`: selects a specific C++ language standard version;
structured bindings, used above, require at least C++17, not available
in earlier standard versions.

### Run it

Shown above.

### Connecting sentence

Dependencies now have a real, queryable structure — the next unit asks
the actual question a package manager needs answered: given this
structure, what order should things install in?

---

## Concept Unit: Topological Sort

### The Problem

Installing `"app"` before `"logger"` would be wrong — `"app"` needs
`"logger"` to already exist. A valid install order has to place every
dependency *before* anything that needs it, for the entire graph at
once, not just one package's immediate dependencies.

### Project Change

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — created `toposort_lab.cpp` (throwaway, this
  unit only).
- **Change type** — add.
- **Location** — new file.
- **Dependencies** — `<functional>`, `<set>`.

### The New Code

```cpp
#include <functional>
#include <set>

std::vector<std::string> order;
std::set<std::string> visited;

std::function<void(const std::string&)> visit = [&](const std::string& node) {
    if (visited.count(node)) return;
    visited.insert(node);
    for (const auto& dep : graph[node]) {
        visit(dep);
    }
    order.push_back(node);  // a node is only added after all its deps are added
};
```

### The Updated Project

Brand-new throwaway file, shown whole above.

### Introduce the concept in isolation

```cpp
for (const auto& [name, deps] : graph) {
    visit(name);
}

std::cout << "Install order: ";
for (const auto& n : order) std::cout << n << " ";
```

Real output, against a slightly larger graph — `A` depends on `B` and
`C`; both `B` and `C` depend on `D`:

```
Install order: D B C A
```

`D` — the package with no dependencies of its own — comes first,
correctly, and `A` — the package everything else feeds into — comes
last. The mechanism: `visit` recurses into every dependency *before*
adding the current node to `order` — `order.push_back(node)` only runs
*after* the loop over `graph[node]` has finished, meaning every one of
`node`'s dependencies is guaranteed to already be in `order` by the
time `node` itself is added. This is called **topological sort** (or
**topological ordering**): an ordering of a graph's nodes such that
every edge points from earlier in the order to later.

### Discard the throwaway example

`toposort_lab.cpp`'s standalone `visit` lambda is deleted — the
recursive, deps-first insertion technique it proved carries forward
directly into the real `DependencyGraph` class.

### Mechanical walkthrough

- `std::function<void(const std::string&)> visit = [&](const std::string& node) { ... };`
  — **(a) first appearance** of `std::function` holding a **recursive
  lambda**: because the lambda calls itself by name (`visit(dep)`
  inside its own body), it needs to be declared with an explicit type
  (`std::function<...>`) *before* being assigned, unlike Project 5,
  Lesson 12's simpler, non-recursive JavaScript arrow functions, which
  never needed a name to exist before their own definition.
- `if (visited.count(node)) return;` — **(b) hard concept reappearing**:
  the same "already processed, skip it" guard as any memoized or
  visited-tracking traversal — here preventing `"logger"`, reachable
  through two different paths, from being visited or added to `order`
  twice.
- `for (const auto& dep : graph[node]) { visit(dep); }` followed by
  `order.push_back(node);` — **(a) first appearance,** conceptually:
  this specific ordering — recurse fully into every dependency *first*,
  only add the current node *after* — is the entire mechanism that
  makes the result topologically valid; reversing these two lines would
  produce a completely wrong order.

### CS lens

Topological sort is a graph traversal with one, specific, structural
goal: an ordering respecting every directed edge. Also recognized in:
a build system deciding compilation order (a file that `#include`s
another must compile after it), a spreadsheet recalculating cells in
dependency order when one cell's formula references another, a course
catalog's prerequisite chains determining a valid semester-by-semester
plan.

### SE lens

This specific technique — recursive depth-first traversal, appending
each node to the result only after all its dependents have been fully
visited — is one standard way to compute a topological sort; an
alternative, iterative approach (repeatedly removing nodes with no
remaining unprocessed dependencies, called **Kahn's algorithm**) exists
too, with a real, different tradeoff: this lesson's recursive version
naturally tracks the *path* currently being explored, which the next
unit needs directly to explain a cycle precisely; Kahn's algorithm
would need separate bookkeeping to produce an equally specific
explanation.

### Commands needed

Same pattern.

### Run it

Shown above.

### Connecting sentence

A valid install order can be computed correctly — but only if one
actually exists. The final unit builds the real, harder case: what
happens when it doesn't.

---

## Concept Unit: Detecting a Cycle

### The Problem

If `"plugin-system"` depends on `"web-framework"`, and `"web-framework"`
depends on `"plugin-system"`, there is no install order that could ever
satisfy both — installing either one first requires the other to
already be installed. The previous unit's `visit` function, run against
a graph like this, would recurse forever: `visit("web-framework")` calls
`visit("plugin-system")`, which calls `visit("web-framework")` again,
endlessly, since `visited.count(node)` only prevents *finished* nodes
from being revisited, not nodes still actively being processed.

### Project Change

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — created `dependency_graph.cpp`.
- **Change type** — add.
- **Location** — new file.
- **Dependencies** — `<stdexcept>`.

### The New Code

```cpp
class DependencyGraph {
public:
    void addPackage(const std::string& name, std::vector<std::string> dependencies) {
        graph[name] = dependencies;
    }

    std::vector<std::string> resolveInstallOrder() {
        order.clear();
        visited.clear();
        inProgress.clear();

        for (const auto& [name, deps] : graph) {
            visit(name);
        }
        return order;
    }

private:
    std::map<std::string, std::vector<std::string>> graph;
    std::vector<std::string> order;
    std::set<std::string> visited;
    std::set<std::string> inProgress;
    std::vector<std::string> pathStack;

    void visit(const std::string& name) {
        if (visited.count(name)) return;

        if (inProgress.count(name)) {
            std::string cycleDescription = name;
            for (auto it = pathStack.rbegin(); it != pathStack.rend(); ++it) {
                cycleDescription = *it + " -> " + cycleDescription;
                if (*it == name) break;
            }
            throw std::runtime_error("Circular dependency detected: " + cycleDescription);
        }

        inProgress.insert(name);
        pathStack.push_back(name);

        for (const auto& dep : graph[name]) {
            visit(dep);
        }

        pathStack.pop_back();
        inProgress.erase(name);
        visited.insert(name);
        order.push_back(name);
    }
};
```

### The Updated Project

Brand-new file, shown whole above — this lesson's real, permanent
`DependencyGraph` class, wrapping the previous unit's `visit` logic with
one crucial addition: tracking not just what's *finished* (`visited`)
but what's *currently being explored* (`inProgress`) at every point
during the recursion.

### Mechanical walkthrough

- `std::set<std::string> inProgress;` — **(a) first appearance,**
  conceptually: a *second* tracking set, distinct from `visited` —
  `visited` means "fully processed, safe to skip"; `inProgress` means
  "currently on the call stack, still being explored" — a node can be
  `inProgress` without yet being `visited`.
- `if (inProgress.count(name))` — **(a) first appearance** of cycle
  detection itself: reaching a node that's *already* on the current
  path being explored — not finished, still actively in progress — is
  the exact, precise signature of a cycle: the only way to revisit a
  node still mid-exploration is if some path leads back to it.
- `std::vector<std::string> pathStack;` — **(a) first appearance**:
  records the exact sequence of nodes currently being explored, in
  order — pushed on entry to `visit`, popped on exit — so that if a
  cycle is found, the *exact* path that forms it can be reconstructed,
  not just "somewhere, a cycle exists."
- `for (auto it = pathStack.rbegin(); it != pathStack.rend(); ++it) { cycleDescription = *it + " -> " + cycleDescription; if (*it == name) break; }`
  — **(a) first appearance** of a **reverse iterator** (`rbegin`/`rend`):
  walks `pathStack` from its *most recently added* end backward,
  building the cycle description from the repeated node outward, and
  stopping the instant it reaches that same node again — reconstructing
  precisely the minimal cycle, not the entire, possibly much longer,
  exploration path.
- `inProgress.insert(name); pathStack.push_back(name); ... pathStack.pop_back(); inProgress.erase(name); visited.insert(name);`
  — **(a) first appearance,** as a whole unit: the complete lifecycle
  of one node's exploration — enter (mark in-progress, push), recurse
  into every dependency, exit (unmark in-progress, pop, mark finished)
  — this ordering is exactly what makes `inProgress` accurately reflect
  "on the current path" at every single moment during the recursion.

### CS lens

This is **cycle detection** via **depth-first search coloring** — a
classic, named technique: every node is conceptually "white"
(untouched), "gray" (`inProgress` — currently being explored), or
"black" (`visited` — fully finished), and a cycle exists precisely when
a search reaches a gray node. Also recognized in: a build system
correctly refusing to compile two files that `#include` each other
directly or indirectly, a spreadsheet detecting `A1` and `B1` each
referencing the other's formula, a real package manager (`npm`,
`pip`, `cargo` — every one of them) refusing to resolve a dependency
set with a genuine circular requirement.

### SE lens

The alternative — simply not tracking `inProgress` at all, the previous
unit's own version — was already named as looping forever on exactly
this input; that's not a hypothetical, it's the real, guaranteed
behavior of the previous unit's code if actually run against a circular
graph. This unit's fix costs one extra set and a few extra lines of
bookkeeping around every node's exploration; the payoff, proven
directly below, is a precise, actionable error instead of a hung
program.

### Commands needed

Same `g++ -std=c++17` pattern.

### Run it

The valid case first, confirming the real class still produces a
correct order:

```cpp
DependencyGraph packages;
packages.addPackage("app", {"web-framework", "logger"});
packages.addPackage("web-framework", {"logger", "http-parser"});
packages.addPackage("logger", {});
packages.addPackage("http-parser", {});

std::vector<std::string> order = packages.resolveInstallOrder();
```

```
Install order: logger http-parser web-framework app
```

And a genuine circular dependency:

```cpp
DependencyGraph packages;
packages.addPackage("app", {"web-framework"});
packages.addPackage("web-framework", {"plugin-system"});
packages.addPackage("plugin-system", {"web-framework"});  // circular!

try {
    packages.resolveInstallOrder();
} catch (const std::runtime_error& e) {
    std::cout << "Error: " << e.what() << std::endl;
}
```

```
Error: Circular dependency detected: web-framework -> plugin-system -> web-framework
```

Not "a cycle exists somewhere" — the *exact* two packages involved,
in the *exact* order that forms the cycle, ready to show directly to
whoever needs to fix their package's own dependency declaration.

### Connecting sentence

A dependency graph can now be resolved into a correct install order
when one exists, and, when it genuinely doesn't, the exact problem is
named precisely instead of the program hanging or silently producing a
broken order.

---

## Closing

**Connect the pieces.** One package, through the whole lesson:
`"web-framework"` is added with dependencies `["logger",
"http-parser"]`; `resolveInstallOrder()` calls `visit("web-framework")`,
which marks it `inProgress`, pushes it onto `pathStack`, recurses into
both `"logger"` and `"http-parser"` (each fully resolving and being
added to `order` first, since neither has further dependencies), then
finally pops `"web-framework"` off `pathStack`, marks it `visited`, and
appends it to `order` — correctly positioned after both of its own
dependencies. If, instead, `"web-framework"`'s own dependency chain
looped back to itself, the exact same `inProgress` check that let this
correct case succeed is what catches the circular one, precisely,
before the recursion could ever run forever.

**What breaks without this.** Already named directly: the previous
unit's version, with no `inProgress` tracking at all, would recurse
without end against a circular graph — an infinite loop, not a crash,
arguably worse, since nothing would ever signal that anything had gone
wrong at all, just a program that never finishes. This lesson's fix is
the direct, necessary answer, not a separate failure demonstrated after
the fact.

**Exercises.**
1. Add a `removePackage(name)` method to `DependencyGraph`, and decide
   — and implement — what should happen if another package still
   depends on the one being removed.
2. Extend the cycle-detection error message to include a suggestion —
   which single dependency, if removed, would break the cycle — for the
   simple case of a two-package cycle like this lesson's own example.
3. Build a longer, three-or-more-package cycle
   (`A → B → C → A`) and confirm the real error message correctly
   names all three packages in the cycle, not just two.

**Definition of done.**
- [ ] `DependencyGraph::resolveInstallOrder()` correctly produces a
      valid install order for a real, non-circular dependency set,
      confirmed against real output.
- [ ] A genuine circular dependency is detected, not infinitely looped
      on, and the real error names the exact packages involved.
- [ ] You can explain, in one sentence, the difference between
      `visited` and `inProgress`, and why cycle detection specifically
      needs both, not just one.
- [ ] Commit with a message explaining why — e.g. `"Resolve package
      install order via topological sort, tracking in-progress nodes
      separately from finished ones so a circular dependency is
      detected and named precisely instead of looping forever"` — not
      `"add dependency resolution"`.

**Next lesson** stays in Project 10: semantic version resolution — given
several packages each requiring *different, possibly incompatible*
version ranges of the same shared dependency, finding a version that
satisfies all of them, or reporting precisely why none exists.
