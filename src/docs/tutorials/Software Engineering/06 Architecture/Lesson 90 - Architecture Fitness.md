# Lesson 90: Architecture Fitness

**What you will build.** ADR 0001, from Lesson 88, says
`order_lifecycle.py` must never import `customer_activity` — a rule a
human has to read and remember to actually enforce. This lesson writes
a **fitness function**: `check_no_forbidden_import`, which parses a
file's real source code and checks, mechanically, whether it imports a
named module — no human required. Run against the regressed version
from Lesson 88's own Problem section, it correctly reports failure;
run against the fixed version, it correctly reports success. The
transferable problem: an ADR records *why* a decision was made, for a
human to read; a fitness function checks *whether* the decision still
holds, automatically, every time — and the two are not substitutes for
each other, they close two different halves of the same gap.

**What you need to know first.** Architecture Decision Records (Lesson
88) — ADR 0001, the exact rule this lesson's fitness function checks
mechanically instead of relying on a human remembering it. Dependency
Direction (Lesson 57) — the original rule; this lesson is the third
lesson built entirely around this one decision, now enforced a third,
different way.

**Pipeline diagram.** Lesson 12 established the full sequence every
system in this curriculum is placed against:

```text
Problem
  ↓
Requirements
  ↓
Domain model
  ↓
Specification
  ↓
Architecture
  ↓
Design
  ↓
Implementation
  ↓
Verification
  ↓
Integration
  ↓
Release
  ↓
Deployment
  ↓
Operations
  ↓
Observation
  ↓
Change
  ↓
Migration
  ↓
Evolution
  ↓
Retirement
```

Still the **Architecture** stage. Carried through: Lesson 88 wrote the
decision down for a human to read; this lesson writes it down for a
machine to check — the same one rule, protected by both a document and
an automated test, neither one alone sufficient.

**Terms introduced in this lesson.** One line each.

- **architecture fitness function** — an automated, repeatable check
  that verifies a system's actual structure still satisfies an intended
  architectural rule, run continuously — in a CI pipeline, on every
  commit — rather than relying on a human noticing a violation. It's
  named because it turns an ADR's own written rule into something a
  machine enforces, closing the exact gap a document alone leaves open:
  a human still has to read, remember, and check it by hand for a
  written rule to matter on its own.
- **static analysis** — examining a program's source code structure
  without actually running it, to check properties like which modules
  import which others. It's the general technique this lesson's fitness
  function uses — parsing code into a tree structure and inspecting it —
  distinct from a runtime test, which would need to actually execute
  the code to check anything about it.

**Objects and methods used.**

- **`ast.parse(source, filename=...)`** (from Python's standard-library
  `ast` module)
  - *What it is:* parses Python source code into an Abstract Syntax
    Tree (AST) — a structured representation of the code's own grammar,
    without running any of it.
  - *Implementation:* `ast.parse(f.read(), filename=path)` returns a
    tree of node objects, each representing one syntactic construct —
    an import statement, a function definition, an assignment — exactly
    the same structure Python's own interpreter builds internally before
    ever executing a line.
  - *Its use:* this lesson uses it to inspect a file's import statements
    without executing the file at all, which matters specifically
    because the file being checked might itself be broken, or might have
    side effects unsafe to trigger just to check its own structure.
- **`ast.walk(tree)`**
  - *What it is:* a generator yielding every node in an AST, recursively,
    in no particular guaranteed order.
  - *Implementation:* `for node in ast.walk(tree):` visits every
    statement and sub-expression in the parsed file, one at a time.
  - *Its use:* this lesson uses it to find every import statement
    anywhere in a file, regardless of how deeply nested inside functions
    or conditionals it might be.
- **`ast.Import` / `ast.ImportFrom`**
  - *What it is:* the two distinct node types representing Python's two
    import syntaxes — `import x` (`ast.Import`) and `from x import y`
    (`ast.ImportFrom`).
  - *Implementation:* `isinstance(node, ast.Import)` checks for a plain
    `import` statement, whose `.names` attribute lists each imported
    module; `isinstance(node, ast.ImportFrom)` checks for a `from ...
    import ...` statement, whose `.module` attribute names the module
    being imported from.
  - *Its use:* this lesson checks both forms, since a forbidden
    dependency could be written either way.

## Concept Unit: A Rule a Machine Checks, Not Just One a Human Remembers

### The Problem

ADR 0001 states a rule in prose. Nothing checks it automatically —
Lesson 88's own regression happened specifically because a human,
without reading the ADR, wrote exactly the import the ADR forbids:

```python
import customer_activity


class Order:
    def transition_to(self, new_status):
        self.status = new_status
        customer_activity.log_order_activity(self.customer_id, f"order moved to {new_status}")
```

This is illustrative, hand-built for this lesson, not a quoted line
range from any external system. Nothing about running this file, or
reading it casually, flags the violation — it's syntactically valid
Python that does exactly what ADR 0001 says it must never do, and
without a fitness function checking for it, the only way to catch it is
the way Lesson 88 already did: waiting for the outage to happen again.

### Project Change

- **Reference Source:** none — a from-scratch addition, not a port of
  an external reference codebase.
- **Files affected:** a new `check_no_forbidden_import` function,
  intended to run in CI on every commit.
- **Change type:** add.
- **Location:** a dedicated architecture-fitness script or test file.
- **Dependencies:** `ast`, a Python standard-library module, no install
  needed.

### The New Code

The smallest new piece is the check itself:

```python
import ast


def check_no_forbidden_import(path, forbidden_module):
    with open(path) as f:
        tree = ast.parse(f.read(), filename=path)
    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            for alias in node.names:
                if alias.name == forbidden_module:
                    return False
        elif isinstance(node, ast.ImportFrom):
            if node.module == forbidden_module:
                return False
    return True
```

### The Updated Project

This function stands alone, ready to be run against any file in the
codebase, checked against ADR 0001's own specific rule:

```python
import ast                                                        # ← new


def check_no_forbidden_import(path, forbidden_module):             # ← new
    with open(path) as f:                                             # ← new
        tree = ast.parse(f.read(), filename=path)                        # ← new
    for node in ast.walk(tree):                                          # ← new
        if isinstance(node, ast.Import):                                   # ← new
            for alias in node.names:                                        # ← new
                if alias.name == forbidden_module:                            # ← new
                    return False                                               # ← new
        elif isinstance(node, ast.ImportFrom):                               # ← new
            if node.module == forbidden_module:                               # ← new
                return False                                                    # ← new
    return True                                                                  # ← new
```

Nothing about this function requires importing or running
`order_lifecycle.py` at all — it reads the file's own text and parses
its structure, which is exactly what makes it safe to run against
*any* file in a codebase, including ones that might currently be broken
for unrelated reasons.

### Isolating the Concept: Checking Structure Without Running Code

The mechanism doing the real work above — parsing a file's structure
without executing it — deserves to be seen proving its own real payoff
directly: running the check against both the regressed and the fixed
version of `order_lifecycle.py` from Lesson 88's own story:

```python
print("regressed version passes fitness check:", check_no_forbidden_import("order_lifecycle_regressed.py", "customer_activity"))
print("fixed version passes fitness check:", check_no_forbidden_import("order_lifecycle_clean.py", "customer_activity"))
```

Running it produces:

```
regressed version passes fitness check: False
fixed version passes fitness check: True
```

The exact regression Lesson 88 demonstrated with a real, run
`RuntimeError` is now caught here, mechanically, before the file is ever
executed at all — this check would have failed the moment the
regressing commit was made, in a CI pipeline, long before it reached
production and broke a real customer's order.

### Mechanical Walkthrough

Working through every distinct syntactic element of the New Code block
above, in order:

- **`tree = ast.parse(f.read(), filename=path)`** — reads the entire
  file's text and parses it into an AST; `filename=path` is used only to
  make any syntax error messages reference the real file, not required
  for parsing to succeed.
- **`for node in ast.walk(tree):`** — iterates every node in the parsed
  tree, at every level of nesting.
- **`if isinstance(node, ast.Import):`** — checks whether this specific
  node represents a plain `import x` statement.
- **`for alias in node.names:`** — an `ast.Import` node's `.names` is a
  list, because a single `import` statement can name several modules at
  once (`import os, sys`); each `alias` has a `.name` attribute holding
  the actual module name written.
- **`elif isinstance(node, ast.ImportFrom): if node.module == forbidden_module:`**
  — checks the second import form; `node.module` directly holds the
  module name for `from module import name` — no list to iterate,
  since this form only ever names one module to import from.

### CS Lens

This is **static analysis**: examining a program's structure by parsing
it, without ever executing it, to check properties that would otherwise
require either running the code or reading it by hand. This is the
identical underlying technique behind a linter flagging an unused
variable, a type checker catching a type mismatch before a program ever
runs, and real architecture-governance tools (ArchUnit for Java,
import-linter for Python) built specifically to enforce dependency
rules like ADR 0001's own, automatically, across an entire codebase, on
every commit.

Also recognized in: security scanners that detect a hardcoded secret in
source code without running it, dead-code detectors that find unreachable
functions by analyzing the call graph statically, and dependency
auditing tools that flag a vulnerable package version by parsing a
lockfile, never executing any of the code it describes.

### SE Lens

The principle is **enforce architectural rules the same way correctness
is enforced — automatically, on every change, not by relying on memory**
— the alternative that produced Lesson 88's own regression, an ADR with
no automated check behind it, depends entirely on every future engineer
actually reading it before making a related change, the identical
"depends on everyone remembering" weakness this curriculum has proven
failing, in one form or another, since its very first domain. The real
cost of a fitness function: it has to be written, for every rule worth
protecting, and wired into a real CI pipeline to run on every commit —
genuine, ongoing infrastructure work, not a one-time fix, and writing
one for every conceivable rule would itself become noise; the judgment
call is which decisions are important enough to be worth the ongoing
maintenance a fitness function requires.

### Commands Needed

Running any of this lesson's scripts is `python <filename>.py` — the
`python` program, given one positional argument, executes that file's
statements top to bottom in a fresh interpreter process. In a real CI
pipeline, `check_no_forbidden_import` would be called from a test
runner (`pytest`), failing the build the same way any other failing test
would, on every pull request.

### Run It

Running the fitness check against a third, hypothetical file that
imports something else entirely, proving the check is specific to the
forbidden module named, not a blanket rule against any import:

```python
with open("unrelated_module.py", "w") as f:
    f.write("import json\n")

print("unrelated file passes fitness check:", check_no_forbidden_import("unrelated_module.py", "customer_activity"))
```

The real output:

```
unrelated file passes fitness check: True
```

A file importing something entirely unrelated to `customer_activity`
correctly passes — the check is precise, catching exactly the one
forbidden dependency ADR 0001 names, not flagging every import as
suspicious.

### Connecting Back

Where Lesson 88 protected one decision by making its reasoning
discoverable, this lesson protects the identical decision by making its
violation *undeployable* — the two together close both halves of the
same gap: why a rule exists, and whether it currently holds.

## Connect the Pieces

The exact regression from Lesson 88 was checked twice in this lesson,
using its own two real files. First, the version with the forbidden
import restored: the fitness function correctly reported failure,
`False`, mechanically, with no human needing to notice anything. Second,
the fixed version, matching ADR 0001's own rule: the fitness function
correctly reported success, `True`. A third, unrelated file, importing
something the rule never mentioned, correctly passed too — proof the
check is precise, not just permissive or overly broad.

## What Breaks Without This

Checking one rule with one fitness function protects that one rule. It
does nothing for every other architectural decision this domain has made
that has no automated check yet:

```python
rules_with_no_fitness_function_yet = [
    "arch_inventory must not import arch_order (Lesson 72)",
    "order_lifecycle must not import promo_experiment (Lesson 60)",
    "no service may query customer_db directly except through get_customer_address (Lesson 87)",
]
print(f"{len(rules_with_no_fitness_function_yet)} real architectural rules with no automated enforcement yet")
```

Every one of these is exactly as vulnerable to a silent, well-meaning
regression as `order_lifecycle`'s own rule was before this lesson.
Writing one fitness function is a real, valuable start; a real system
needs this same treatment applied deliberately to every architectural
decision significant enough that violating it silently would be
genuinely costly — the identical judgment call Lesson 88 already named
for which decisions deserve an ADR in the first place.

## Exercises

1. Write a fitness function checking Lesson 72's own rule —
   `arch_inventory.py` must never import `arch_order` — and run it
   against both the circular and the fixed versions from that lesson.
2. Extend `check_no_forbidden_import` into
   `check_no_direct_database_access`, scanning for any reference to
   `customer_db` outside of `customers.py` itself, enforcing Lesson 87's
   own service-boundary rule automatically.
3. Write two or three sentences on how you'd decide, for a real project,
   which of its architectural decisions deserve a fitness function and
   which don't — using this lesson's own honest cost (ongoing
   maintenance, for every rule checked) against the real cost of a
   silent violation, the same weighing Lesson 89 already formalized for
   a different kind of decision.

## Definition of Done

- [ ] `check_no_forbidden_import` correctly parses a file's imports
      using `ast`, without executing the file.
- [ ] The check has been run for real against both the regressed and
      fixed versions of `order_lifecycle.py` from Lesson 88, producing
      `False` and `True` respectively.
- [ ] The "Run It" scenario above has been run against a third,
      unrelated file, proving the check doesn't produce false positives.
- [ ] You can state, in one sentence, the real difference between what
      an ADR (Lesson 88) protects and what a fitness function protects.
- [ ] Commit, with a message stating *why*: something like `architecture
      fitness: add an automated check for ADR 0001 so a forbidden
      customer_activity import fails CI instead of production`, not `add
      import checker`.

Up next: Lesson 91, Architecture Failure — what happens when a real
system's architecture breaks down anyway, despite every technique this
domain has built, and how to diagnose it honestly.
