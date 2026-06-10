# CNC-SIM — LAB-25 — TDD and Domain Modeling: Tests as Executable Specifications

**Prerequisites:** LAB-24. You have: a working docking library with a pure reducer.
You have been reading *Architecture Patterns with Python* and hit the section on domain
modeling and TDD. The book gives you business rules but does not show you how to
translate them into test code.

**What this lab adds:**

- A mental model for what a test actually is
- The Arrange / Act / Assert pattern applied to real business rules
- The Red → Green → Refactor cycle made concrete
- Tests written for the allocation domain from the book
- Tests written for the docking reducer you already built
- An understanding of why "test first" forces better design

**Time:** 60 minutes  
**Stack additions:** None — the concepts apply to any language

---

## Quick Check

*(Answers at the end of this lab)*

1. **Prediction:** You write a test before the code it tests. The test references a class
   called `Batch` that does not exist yet. What happens when you run the test?

2. **Mechanism:** A test calls `batch.allocate(line)` and then checks
   `batch.available_quantity == 18`. What are the three parts of this test,
   and what is the name of the pattern they form?

3. **Connection:** In LAB-24 we used a pure reducer so state logic could be tested
   without rendering React. What property of the reducer makes it testable without
   a browser?

4. **Prediction:** A developer writes one test that checks five different things with
   five `assert` statements. The test fails. What information does the failure give
   them, and what would they know if instead they had five separate tests?

---

## What You Will Build

At the end of this lab you will have written tests for two domains.

**Allocation domain (from the book, Python):**

```python
def test_allocating_reduces_available_quantity():
    batch = Batch("batch-001", "SMALL-TABLE", qty=20, eta=None)
    line  = OrderLine("order-123", "SMALL-TABLE", qty=2)

    batch.allocate(line)

    assert batch.available_quantity == 18
```

**Docking domain (your reducer, TypeScript):**

```typescript
test('docking a panel to the left creates a slot', () => {
    const state = registerPanel(initialState, makePanel('geometry'));

    const next = dockingReducer(state, {
        type: 'DOCK_TO_EDGE',
        id:   'geometry',
        edge: 'left',
    });

    expect(next.slots.left).not.toBeNull();
    expect(next.floating).not.toContain('geometry');
});
```

---

## The Question You Are Actually Asking

When you said "I don't know how I would write a test," you were asking something more
specific: *How do I get from a paragraph of business rules to actual test code?*

The answer is that the business rules ARE the test specifications. They are already
written — just in English instead of code. Your job is translation.

Look at this rule from the book:

> We have a batch of 20 SMALL-TABLE, and we allocate an order line for 2 SMALL-TABLE.
> The batch should have 18 SMALL-TABLE remaining.

It already has three parts:

| English | Test term |
|---|---|
| We have a batch of 20 SMALL-TABLE | **Arrange** — set up the world |
| We allocate an order line for 2 SMALL-TABLE | **Act** — do the thing |
| The batch should have 18 SMALL-TABLE remaining | **Assert** — check the result |

Every test you will ever write has exactly these three parts. The pattern is called
**Arrange / Act / Assert** (also written as **Given / When / Then** in BDD style).

---

## Concept: Arrange / Act / Assert — The Structure of Every Test

**What it is:**  
A three-phase structure for writing tests. Arrange sets up the inputs, Act performs
the operation, Assert checks the output. Every valid test maps to this structure.

**The problem before:**  
Without a structure, tests become long procedural scripts that set up state, do several
things, and check several results. When they fail, you cannot tell which part failed or
why. They are also hard to read — there is no clear boundary between "what I'm setting
up" and "what I'm checking."

**The mechanism:**  
Each phase has a single responsibility:

```python
def test_allocating_reduces_available_quantity():
    # Arrange — build the world
    batch = Batch("batch-001", "SMALL-TABLE", qty=20, eta=None)
    line  = OrderLine("order-123", "SMALL-TABLE", qty=2)

    # Act — do the one thing being tested
    batch.allocate(line)

    # Assert — check exactly one outcome
    assert batch.available_quantity == 18
```

The blank lines between phases are intentional. Some teams add comments. The important
thing is that each phase is visually distinct.

**What it hides:**  
The Arrange / Act / Assert structure hides "how do I organise this?" behind a simple
formula. Once you accept the formula, you never have to think about test structure again —
only about what to arrange, what to act on, and what to assert.

**Canonical example — abstract:**  
Like a science experiment: hypothesis (what you are testing), procedure (what you do),
observation (what you check). Every experiment ever run has these three phases. The
structure is the same whether you are testing a drug or a `Batch` class.

```python
# The smallest possible example:
def test_addition():
    # Arrange
    a, b = 2, 3

    # Act
    result = a + b

    # Assert
    assert result == 5
```

**Project application:**  
Every test in the allocation domain follows this structure, and so does every test for
the docking reducer.

**Constraints:**  
The Act phase should call exactly one function or method — the thing being tested.
If you find yourself calling three functions in the Act phase, you are testing three
things at once. Split into three tests.

**Tradeoffs:**  
Some test frameworks use `describe` / `it` blocks that put the Arrange inside a
`beforeEach`. This hides the Arrange phase. It reduces duplication but makes each
test less readable in isolation. For learning, keep all three phases in each test.

**Failure modes:**

```python
# WRONG — multiple things in one test, fails on the first assert,
#          you learn nothing about the others:
def test_batch():
    batch = Batch("b", "SKU", qty=10, eta=None)
    line  = OrderLine("o", "SKU", qty=3)
    batch.allocate(line)
    assert batch.available_quantity == 7
    assert batch.can_allocate(OrderLine("o2", "SKU", qty=8)) is False
    assert batch.can_allocate(OrderLine("o3", "SKU", qty=7)) is True
    # When this fails, which rule is wrong? You don't know.

# RIGHT — one behaviour per test:
def test_allocating_reduces_available_quantity():
    ...

def test_cannot_allocate_if_not_enough_remaining():
    ...

def test_can_allocate_if_exactly_enough_remaining():
    ...
```

**Operational reality:**  
Arrange / Act / Assert is universally used across Python (pytest), JavaScript (Jest,
Vitest), Java (JUnit), C# (NUnit), Go (testing package), and Rust (built-in tests).
The names differ but the structure is identical.

**Transferability:**  
Every testing framework you will ever use. The pattern was described in 2001 and has
not changed because it correctly captures what a test is.

**You will see this again in:** Every lab from here on. Every test in the codebase.

**Watch for:** Tests that have two `Act` phases (two separate function calls that both
do meaningful things). This is a sign you are writing an integration test that should
be broken into unit tests.

---

## Step 1 — Translate Business Rules to Tests (Allocation Domain)

The book gives you five rules. Each becomes one test function. Here is the complete
translation:

**Rule 1:** Allocating reduces available quantity.

```python
def test_allocating_to_a_batch_reduces_the_available_quantity():
    batch = Batch("batch-001", "SMALL-TABLE", qty=20, eta=None)
    line  = OrderLine("order-ref", "SMALL-TABLE", qty=2)

    batch.allocate(line)

    assert batch.available_quantity == 18
```

**Rule 2:** Cannot allocate if available quantity is less than the order line.

```python
def test_cannot_allocate_if_available_smaller_than_required():
    small_batch = Batch("batch-001", "BLUE-CUSHION", qty=1,  eta=None)
    large_line  = OrderLine("order-ref", "BLUE-CUSHION", qty=2)

    assert small_batch.can_allocate(large_line) is False
```

**Rule 3:** Cannot allocate the same line twice.

```python
def test_cannot_allocate_the_same_line_twice():
    batch = Batch("batch-001", "BLUE-VASE", qty=10, eta=None)
    line  = OrderLine("order-ref", "BLUE-VASE", qty=2)

    batch.allocate(line)
    batch.allocate(line)  # second call on the same line object

    assert batch.available_quantity == 8
```

**Rule 4:** Prefer warehouse stock (eta=None) to shipment batches.

```python
def test_prefers_warehouse_stock_to_shipment_batch():
    warehouse = Batch("warehouse",  "RETRO-CLOCK", qty=100, eta=None)
    shipment  = Batch("shipment-1", "RETRO-CLOCK", qty=100, eta=date(2021, 1, 1))
    line      = OrderLine("oref",   "RETRO-CLOCK", qty=10)

    allocate(line, [warehouse, shipment])

    assert warehouse.available_quantity == 90   # warehouse was used
    assert shipment.available_quantity  == 100  # shipment untouched
```

**Rule 5:** Among shipments, prefer the earliest ETA.

```python
def test_prefers_earlier_batches():
    earliest  = Batch("s-1", "MINIMALIST-SPOON", qty=100, eta=date(2021, 1, 1))
    medium    = Batch("s-2", "MINIMALIST-SPOON", qty=100, eta=date(2021, 2, 1))
    latest    = Batch("s-3", "MINIMALIST-SPOON", qty=100, eta=date(2021, 3, 1))
    line      = OrderLine("oref", "MINIMALIST-SPOON", qty=10)

    allocate(line, [medium, earliest, latest])

    assert earliest.available_quantity == 90    # earliest was used
    assert medium.available_quantity   == 100
    assert latest.available_quantity   == 100
```

Notice that the tests were written before `Batch`, `OrderLine`, or `allocate` exist.
That is the point — the tests define the interface. When you run them now, they all fail
with `NameError: name 'Batch' is not defined`. That is the "Red" in Red / Green / Refactor.

### SAVE AND TRY

```bash
pytest test_allocate.py
```

Expected (before writing any domain code):

```
E   NameError: name 'Batch' is not defined
FAILED test_allocating_to_a_batch_reduces_the_available_quantity
```

**What this proves:** The test runs and fails for the right reason — the class does not
exist yet. A test that cannot even run is not useful. An error about a missing class is
different from a logic error; it confirms you have wired up the test runner correctly.

**Change something:** Change `qty=20` to `qty=15` in the first test, but keep the assert
`== 18`. Run the tests.  
Expected when broken: the test still fails `NameError` at this stage (because `Batch`
doesn't exist). This shows that the Arrange phase's values are not checked until the
implementation exists.

---

## Concept: Red → Green → Refactor — The TDD Cycle

**What it is:**  
Test-Driven Development is a discipline where you write a failing test before writing
any implementation code, then write the minimum code to make it pass, then improve the
code without changing its behaviour.

**The problem before:**  
Writing code before tests means you are designing in the dark. You build an API and then
write tests to match what you built. Those tests test implementation details, not
behaviour. When the implementation changes, the tests break even if the behaviour is
correct. The tests are fragile.

**The mechanism:**  
The cycle has three states:

```
RED    — write a failing test
         The test describes the desired behaviour.
         It must fail to prove the behaviour does not exist yet.

GREEN  — write the minimum code to pass
         Do not write anything that is not needed to pass the test.
         Do not anticipate future requirements.

REFACTOR — improve the code without changing behaviour
         Extract duplication. Rename things. Simplify.
         The tests protect you — if they still pass, the behaviour is unchanged.
```

Repeat for every new behaviour.

**What it hides:**  
The cycle hides "where do I start?" The answer is always: write the next failing test.
You never have to decide what to build next; the failing test tells you.

**Canonical example — abstract:**  
Like navigation by landmark. You do not plan the entire route before leaving. You drive
to the next visible landmark (Green), check you are on course (tests pass), then look
for the next landmark (write the next test). You make progress incrementally with
constant verification.

**Smallest possible example:**

```python
# Step 1 — RED: write the failing test
def test_can_allocate_if_available_greater_than_required():
    batch = Batch("b-001", "SMALL-TABLE", qty=20, eta=None)
    small_line = OrderLine("order-ref", "SMALL-TABLE", qty=2)
    assert batch.can_allocate(small_line) is True
# Run → NameError: name 'Batch' is not defined

# Step 2 — GREEN: minimum code to pass
class Batch:
    def __init__(self, ref, sku, qty, eta):
        self.sku, self.eta = sku, eta
        self._purchased_quantity = qty
        self._allocations: Set[OrderLine] = set()

    @property
    def available_quantity(self) -> int:
        return self._purchased_quantity - sum(l.qty for l in self._allocations)

    def can_allocate(self, line: OrderLine) -> bool:
        return self.sku == line.sku and self.available_quantity >= line.qty

    def allocate(self, line: OrderLine):
        if self.can_allocate(line):
            self._allocations.add(line)
# Run → PASSED

# Step 3 — REFACTOR: the code is already clean; move on to the next test
```

**Project application:**  
For the docking reducer, the cycle would look like:

```
RED:    Write test_docking_panel_to_left_creates_slot
        → fails: dockingReducer does not handle DOCK_TO_EDGE yet

GREEN:  Add the DOCK_TO_EDGE case to dockingReducer
        → test passes

REFACTOR: evictFromSlots is duplicated in two cases — extract it
        → tests still pass
```

The refactor step is what produces clean code over time. Without tests protecting you,
refactoring is risky. With tests, you can restructure freely.

**Constraints:**  
TDD requires discipline. It is tempting to write "just a little" implementation before
the test. Resist this — you lose the design benefit. The test forces you to think about
the interface from the consumer's perspective, which produces better APIs.

**Tradeoffs:**  
TDD slows initial development and speeds long-term maintenance. The time cost is real:
writing tests takes time. The benefit is also real: bugs found in a test runner take
seconds to fix; bugs found in production take hours or days. Teams that adopt TDD
consistently report fewer production incidents.

**Failure modes:**

```python
# WRONG — writing tests after the code ("test-after"):
# Your tests will exactly mirror the implementation.
# They will test HOW it works, not WHAT it should do.
# When you refactor, the tests break even though behaviour is unchanged.

# WRONG — writing the test and immediately passing it without running RED first:
# You skip the proof that the test actually catches the bug.
# A test you never saw fail might never catch a real failure either.
```

**Operational reality:**  
TDD is standard practice at Google, Amazon, and most high-quality software teams.
Kent Beck formalised it in the 1990s and popularised it in *Test Driven Development:
By Example*. The book you are reading (*Architecture Patterns with Python*) uses TDD
throughout.

**You will see this again in:** Every feature added to CNC-SIM from this point forward.
The G-code parser, toolpath generator, and geometry operations are all candidates for
pure-function TDD.

**Watch for:** The difference between a test that is "Green because the implementation
is correct" and a test that is "Green because the assertion is wrong." A test with
`assert True` always passes and proves nothing. Always verify that your test can fail
by temporarily breaking the implementation.

---

## Step 2 — Write the Domain Implementation (Allocation Domain)

Now that all five tests exist and are Red, write the minimum implementation:

```python
from __future__ import annotations
from dataclasses import dataclass
from datetime import date
from typing import Optional, Set, List


@dataclass(frozen=True)
class OrderLine:
    orderid: str
    sku:     str
    qty:     int


class Batch:
    def __init__(self, ref: str, sku: str, qty: int, eta: Optional[date]):
        self.reference = ref
        self.sku       = sku
        self.eta       = eta
        self._purchased_quantity = qty
        self._allocations: Set[OrderLine] = set()

    def allocate(self, line: OrderLine):
        if self.can_allocate(line):
            self._allocations.add(line)

    def can_allocate(self, line: OrderLine) -> bool:
        return self.sku == line.sku and self.available_quantity >= line.qty

    @property
    def available_quantity(self) -> int:
        return self._purchased_quantity - sum(l.qty for l in self._allocations)

    def __gt__(self, other: Batch) -> bool:
        if self.eta is None:
            return False
        if other.eta is None:
            return True
        return self.eta > other.eta


def allocate(line: OrderLine, batches: List[Batch]) -> str:
    batch = next(b for b in sorted(batches) if b.can_allocate(line))
    batch.allocate(line)
    return batch.reference
```

### SAVE AND TRY

```bash
pytest test_allocate.py -v
```

Expected:

```
PASSED test_allocating_to_a_batch_reduces_the_available_quantity
PASSED test_cannot_allocate_if_available_smaller_than_required
PASSED test_cannot_allocate_the_same_line_twice
PASSED test_prefers_warehouse_stock_to_shipment_batch
PASSED test_prefers_earlier_batches
5 passed in 0.03s
```

**What this proves:** The implementation satisfies every business rule. The tests are the
proof. If you hand this code to a new developer, they can read the test names to understand
what the system is supposed to do, without reading the implementation.

**Change something:** In `Batch.allocate`, remove the `if self.can_allocate(line):` guard.  
Expected when broken:  
`FAILED test_cannot_allocate_the_same_line_twice` — because `OrderLine` is a frozen
dataclass (hashed by value), adding the same line to the set twice is a no-op. The test
still passes. This reveals a subtlety: the test for "cannot allocate same line twice" is
actually checking that using a `set` for `_allocations` handles deduplication, not that
`can_allocate` blocks it. A good reason to look at the test more carefully.

---

## Step 3 — Tests for the Docking Reducer (TypeScript)

The docking reducer from LAB-24 is a pure function. It is a perfect test target because
it takes plain objects and returns plain objects — no React, no DOM, no browser.

```typescript
// dock-lib/src/dockingReducer.test.ts
import { dockingReducer, initialState } from './dockingReducer';
import type { PanelDef } from './panelTypes';

// Helper — creates a minimal valid PanelDef
function makePanel(id: string): PanelDef {
    return {
        id,
        title:           id,
        content:         null,
        defaultLocation: { kind: 'floating', x: 0, y: 0, w: 300, h: 400 },
        visible:         true,
        closeable:       true,
    };
}

// Helper — registers a panel and returns the new state
function withPanel(id: string) {
    return dockingReducer(initialState, {
        type:  'REGISTER_PANEL',
        panel: makePanel(id),
    });
}

test('registering a panel adds it to panels map', () => {
    const next = withPanel('geometry');

    expect(next.panels['geometry']).toBeDefined();
    expect(next.panels['geometry'].title).toBe('geometry');
});

test('docking a panel to the left creates a left slot', () => {
    const state = withPanel('geometry');

    const next = dockingReducer(state, {
        type: 'DOCK_TO_EDGE',
        id:   'geometry',
        edge: 'left',
    });

    expect(next.slots.left).not.toBeNull();
    expect(next.floating).not.toContain('geometry');
});

test('closing a docked panel removes its slot when empty', () => {
    let state = withPanel('geometry');
    state = dockingReducer(state, { type: 'DOCK_TO_EDGE', id: 'geometry', edge: 'left' });

    const next = dockingReducer(state, { type: 'CLOSE_PANEL', id: 'geometry' });

    expect(next.slots.left).toBeNull();
});

test('floating a docked panel removes it from slot and adds to floating', () => {
    let state = withPanel('geometry');
    state = dockingReducer(state, { type: 'DOCK_TO_EDGE', id: 'geometry', edge: 'left' });

    const next = dockingReducer(state, {
        type: 'FLOAT_PANEL',
        id:   'geometry',
        x:    100,
        y:    200,
    });

    expect(next.slots.left).toBeNull();
    expect(next.floating).toContain('geometry');
    expect(next.panels['geometry'].defaultLocation).toMatchObject({
        kind: 'floating',
        x:    100,
        y:    200,
    });
});

test('docking two panels to the same edge makes them tabs in one leaf', () => {
    let state = withPanel('geometry');
    state = withPanel('gcode'); // re-using withPanel resets state — fix:
    state = dockingReducer(
        dockingReducer(initialState, { type: 'REGISTER_PANEL', panel: makePanel('geometry') }),
        { type: 'REGISTER_PANEL', panel: makePanel('gcode') },
    );
    state = dockingReducer(state, { type: 'DOCK_TO_EDGE', id: 'geometry', edge: 'left' });

    const next = dockingReducer(state, { type: 'DOCK_TO_EDGE', id: 'gcode', edge: 'left' });

    expect(next.slots.left?.root.kind).toBe('leaf');
    expect((next.slots.left?.root as any).panelIds).toContain('geometry');
    expect((next.slots.left?.root as any).panelIds).toContain('gcode');
});
```

Notice what is NOT in these tests:

- No `render()` calls
- No `screen.getByText()`
- No `fireEvent.click()`
- No DOM
- No React

The reducer is a pure function. Testing it is just calling a function and checking
what comes back. This is why the pure reducer pattern is valuable for testability.

### SAVE AND TRY

```bash
cd dock-lib && npx vitest run
```

Expected:

```
✓ registering a panel adds it to panels map
✓ docking a panel to the left creates a left slot
✓ closing a docked panel removes its slot when empty
✓ floating a docked panel removes it from slot and adds to floating
✓ docking two panels to the same edge makes them tabs in one leaf
5 tests passed
```

**What this proves:** The pure reducer is fully tested without a browser. These tests
run in under 50ms. Any bug introduced into the reducer logic is caught immediately.

---

## Concept: One Test Per Behaviour — Why Test Names Matter

**What it is:**  
A test name is a statement of the behaviour being tested, written so that a failing test
name tells you exactly what is broken without reading the code.

**The problem before:**  
Tests named `test_batch_1`, `test_scenario_a`, or `test_it_works` tell you nothing
when they fail. You must read the test body to understand what it was checking.

**The mechanism:**  
Test names should be sentences describing behaviour:

```python
# WRONG — what is being tested?
def test_batch():
    ...

def test_1():
    ...

# RIGHT — the name is a spec
def test_allocating_to_a_batch_reduces_the_available_quantity():
    ...

def test_cannot_allocate_if_available_smaller_than_required():
    ...

def test_prefers_warehouse_stock_to_shipment_batch():
    ...
```

When `test_prefers_warehouse_stock_to_shipment_batch` fails, you know immediately:
the preference ordering is wrong. You do not need to read the test body.

**Canonical example — abstract:**  
Like headlines in a newspaper. "Man Bites Dog" vs "Article 47." The first tells you
what happened. The second tells you nothing.

**Project application:**  
The docking reducer tests above use sentence-style names:

```typescript
test('docking a panel to the left creates a left slot', ...)
test('closing a docked panel removes its slot when empty', ...)
```

If `closing a docked panel removes its slot when empty` fails after a refactor, you
know exactly which behaviour regressed.

**You will see this again in:** Every test in CNC-SIM.

**Watch for:** Names that describe implementation rather than behaviour:
`test_sets_slots_left_to_null` describes how, not what. Prefer
`closing the last panel in a slot removes the slot`.

---

## SOLID Check

**Single Responsibility:**  
Each test function has one responsibility: verify one behaviour. When a test fails, it
should identify exactly one broken rule.

**Open/Closed:**  
Adding a new business rule = adding a new test. Existing tests are never modified.
The test suite is open for extension, closed for modification.

**Liskov Substitution:**  
If `Batch.__gt__` is replaced with a different comparison implementation, all tests
that depend on ordering behaviour must still pass. Tests are the contract that any
substitution must satisfy.

**Interface Segregation:**  
Tests depend only on the public interface of the code being tested: `batch.allocate()`,
`batch.available_quantity`, `batch.can_allocate()`. They do not access `_allocations`
or `_purchased_quantity` directly. Tests that access private internals are testing
implementation details, not behaviour — and they break on refactoring.

**Dependency Inversion:**  
The tests depend on the `Batch` and `OrderLine` abstractions, not on the SQLAlchemy
models, the database, or the HTTP layer. Domain tests should never touch infrastructure.

---

## 🎯 Challenge: Write Tests for Line Properties

**You know:** The Arrange / Act / Assert pattern. Business rules become tests.

**Task:** Write tests for the line tool in `GeometryContext.tsx`. The line tool has
four methods (Two Points, Horizontal, Vertical, At Angle) and a `computeLineEnd`
function.

**Requirements checklist:**

- [ ] Test that `computeLineEnd` with `horizontal` method produces an endpoint with
  the same Y as the start and X offset by the length
- [ ] Test that `computeLineEnd` with `vertical` method produces an endpoint with
  the same X as the start and Y offset by the length
- [ ] Test that `computeLineEnd` with `at-angle` at 0° produces a horizontal line
  (same as horizontal method)
- [ ] Test that `computeLineEnd` with `at-angle` at 90° produces a vertical line
  (same as vertical method)
- [ ] Test that `computeLineEnd` with `two-points` returns the `endX`/`endY` from
  the options unchanged

**When you are done:** Five tests, all green, covering the complete `computeLineEnd`
function. No React, no rendering — just the pure function and its outputs.

**Stuck?** Ask AI: *"I want to test a TypeScript function called `computeLineEnd`
that takes a `LineOptions` object and returns `{ endX, endY }`. The function is a pure
function. Show me how to set up Vitest in a TypeScript project and write the first test."*

---

## Final Check

| What to verify | How to verify | Expected result |
|---|---|---|
| You can state the three phases | Cover them without looking | Arrange, Act, Assert — in that order |
| Business rules map to tests | Take any rule from the book's notes | You can write the test without help |
| Red → Green works | Write a test, run it before the code | It fails with a meaningful error |
| Reducer tests run | `npx vitest run` in dock-lib | 5 tests pass, no DOM or React required |
| One behaviour per test | Count asserts per test | Each test has exactly one `assert` / `expect` |

---

## Quick Check Answers

**1. What happens when you run a test for a class that doesn't exist?**  
The test fails immediately with a `NameError` (Python) or `ReferenceError` (JavaScript).
This is intentional — it is the "Red" step. A test you have never seen fail is a test
you cannot trust. The error message confirms that the test is being executed and that
the class genuinely does not exist yet. This is different from a logic error (the class
exists but behaves wrongly); it tells you exactly what to build next.

**2. What are the three parts and what is the pattern called?**  
`batch.allocate(line)` is the **Act** phase — the single operation being tested.
`batch = Batch(...)` and `line = OrderLine(...)` are the **Arrange** phase — setting up
inputs. `assert batch.available_quantity == 18` is the **Assert** phase — checking the
outcome. Together they form the **Arrange / Act / Assert** pattern (also called
**Given / When / Then** in BDD terminology). Every valid unit test maps to exactly
these three phases.

**3. What property of the reducer makes it testable without a browser?**  
The reducer is a **pure function** — it takes `(state, action)` as arguments and
returns a new state. It has no side effects: it does not touch the DOM, does not read
from `window` or `document`, does not call `useState` or any other hook, and does not
make network requests. Its output depends only on its inputs. A test only needs to
call the function with inputs and inspect the output — no render engine, no DOM,
no browser environment required.

**4. What does a failing single multi-assert test tell you vs five separate tests?**  
A single test with five asserts tells you: *the test failed*. You know which assert
failed (the first one that throws), but not whether the others would have passed or
failed — the test runner stops at the first failure. You must fix the first issue and
re-run to discover the second, and so on. Five separate tests tell you: *exactly which
behaviours are broken and which are correct*. If tests 2 and 4 fail, you know rules 2
and 4 are broken and rules 1, 3, and 5 are intact. This dramatically reduces debugging
time and makes it clear whether a fix introduced a regression elsewhere.
