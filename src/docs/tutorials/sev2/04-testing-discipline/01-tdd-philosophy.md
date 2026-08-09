# Tutorial 1: TDD Philosophy

## Introduction

**Test-Driven Development (TDD)** is not about testing. It's about design.

TDD is a discipline where:
1. You write a failing test first
2. You write just enough code to pass
3. You refactor under test coverage

> **TDD is not "write code then test". It is "test drives code".**

---

## Part 1: The TDD Cycle

### 1.1 Red-Green-Refactor

```
    ┌─────────────────────────────────────────────────┐
    │                                                 │
    │   1. RED         2. GREEN        3. REFACTOR   │
    │   ─────────      ──────────      ────────────  │
    │   Write test     Write code      Clean up      │
    │   that fails     to pass         under tests   │
    │                                                 │
    │   ┌───────┐      ┌───────┐      ┌───────┐     │
    │   │ TEST  │ ──▶  │ TEST  │ ──▶  │ TEST  │     │
    │   │ FAILS │      │ PASS  │      │ PASS  │     │
    │   └───────┘      └───────┘      └───────┘     │
    │       │                              │         │
    │       └──────────────────────────────┘         │
    │                  (repeat)                      │
    └─────────────────────────────────────────────────┘
```

### 1.2 Each Phase

| Phase | What You Do | What You Feel |
|-------|-------------|---------------|
| **RED** | Write test for behavior that doesn't exist | "I know what I want but can't have it yet" |
| **GREEN** | Write the simplest code to pass | "I'm allowed to write ugly code — temporarily" |
| **REFACTOR** | Clean up while tests still pass | "I can improve with confidence" |

---

## Part 2: Why TDD Works

### 2.1 Design Benefits

TDD forces you to:
- Think about the **interface** before implementation
- Design for **testability** (which means better design)
- Write **focused, single-purpose** functions
- Avoid **over-engineering** (write only what tests need)

### 2.2 vs Test-After

| Test-After | Test-First (TDD) |
|------------|------------------|
| Test what you built | Build what you spec |
| Tests pass because code exists | Tests pass because code is correct |
| Hard-to-test code is skipped | Code must be testable |
| Tests are afterthought | Tests are specification |
| "Works on my machine" | Works as defined |

### 2.3 The Confidence Loop

```
Write Test → See it Fail → Confirm test is valid
     ↓
Write Code → See it Pass → Confirm code is correct
     ↓
Refactor → Still Passes → Confirm nothing broke
     ↓
Repeat with confidence
```

---

## Part 3: TDD in Practice

### 3.1 Example: Part Number Validation

**Requirement:** Part numbers must match format XX-NNNNN (2 letters, hyphen, 5 digits)

**Step 1: RED — Write failing test**

```python
# tests/unit/domain/test_part_number.py

def test_valid_part_number():
    """Valid part numbers should be accepted."""
    from partflow.domain.value_objects.part_number import PartNumber
    
    pn = PartNumber("PN-12345")
    assert str(pn) == "PN-12345"
```

Run:
```bash
pytest tests/unit/domain/test_part_number.py
```

Result: **FAILS** (PartNumber doesn't exist)

**Step 2: GREEN — Write minimal code**

```python
# src/partflow/domain/value_objects/part_number.py

class PartNumber:
    def __init__(self, value: str):
        self._value = value
    
    def __str__(self) -> str:
        return self._value
```

Run test again: **PASSES**

But wait—we're not validating! Add more tests:

**Step 3: RED — Add validation test**

```python
def test_invalid_part_number_raises():
    """Invalid format should raise ValueError."""
    from partflow.domain.value_objects.part_number import PartNumber
    import pytest
    
    with pytest.raises(ValueError):
        PartNumber("12345")  # Missing letters
```

Run: **FAILS** (no validation yet)

**Step 4: GREEN — Add validation**

```python
import re

class PartNumber:
    PATTERN = re.compile(r'^[A-Z]{2}-\d{5}$')
    
    def __init__(self, value: str):
        if not self.PATTERN.match(value):
            raise ValueError(f"Invalid part number format: {value}")
        self._value = value
    
    def __str__(self) -> str:
        return self._value
```

Run: **ALL PASS**

**Step 5: REFACTOR — Add more cases, clean up**

```python
import pytest
from partflow.domain.value_objects.part_number import PartNumber


class TestPartNumber:
    """Tests for PartNumber value object."""
    
    def test_valid_format(self):
        """Standard format should be accepted."""
        pn = PartNumber("PN-12345")
        assert str(pn) == "PN-12345"
    
    def test_valid_format_variants(self):
        """Various valid formats should work."""
        assert str(PartNumber("AB-00001")) == "AB-00001"
        assert str(PartNumber("ZZ-99999")) == "ZZ-99999"
    
    def test_invalid_missing_hyphen(self):
        """Missing hyphen should raise."""
        with pytest.raises(ValueError, match="Invalid part number"):
            PartNumber("PN12345")
    
    def test_invalid_lowercase(self):
        """Lowercase letters should raise."""
        with pytest.raises(ValueError, match="Invalid part number"):
            PartNumber("pn-12345")
    
    def test_invalid_too_few_digits(self):
        """Too few digits should raise."""
        with pytest.raises(ValueError, match="Invalid part number"):
            PartNumber("PN-1234")
```

---

## Part 4: TDD Mindset

### 4.1 Think Before Code

Before writing any code, ask:
- What behavior do I want?
- How would I test that behavior?
- What should the interface look like?

### 4.2 One Test at a Time

Don't write all tests upfront. Write one, make it pass, write the next.

```
Test 1 → Pass → Test 2 → Pass → Test 3 → Pass
```

### 4.3 Test Behavior, Not Implementation

**Bad:** Testing internal state
```python
def test_internal_value():
    pn = PartNumber("PN-12345")
    assert pn._value == "PN-12345"  # Testing private attribute!
```

**Good:** Testing public behavior
```python
def test_string_representation():
    pn = PartNumber("PN-12345")
    assert str(pn) == "PN-12345"  # Testing public interface
```

### 4.4 Make It Fail First

Always verify your test fails before implementing. A test that never fails is worthless.

---

## Part 5: Common TDD Mistakes

### 5.1 Writing Too Much Code

**Mistake:** Implementing everything before running tests
**Fix:** Write just enough to pass, then add tests for more behavior

### 5.2 Skipping Red Phase

**Mistake:** Writing code before seeing test fail
**Fix:** Run test, see failure, then implement

### 5.3 Making Tests Pass by Accident

**Mistake:** Test passes for wrong reason
**Fix:** Verify test fails with incorrect implementation first

### 5.4 Testing Implementation Details

**Mistake:** Testing private methods, internal state
**Fix:** Test only public interface and observable behavior

---

## Part 6: Exercises

### Exercise 1: Red-Green-Refactor

Implement `Revision` value object using TDD:

Requirements:
- Revision has major and minor version (e.g., 1.3)
- major and minor must be non-negative
- String representation is "major.minor"

Write tests first, then implement.

<details>
<summary>TDD Sequence</summary>

**Test 1: Basic creation**
```python
def test_revision_creation():
    from partflow.domain.value_objects.revision import Revision
    rev = Revision(1, 3)
    assert str(rev) == "1.3"
```

**Minimal implementation:**
```python
class Revision:
    def __init__(self, major: int, minor: int):
        self.major = major
        self.minor = minor
    
    def __str__(self) -> str:
        return f"{self.major}.{self.minor}"
```

**Test 2: Negative validation**
```python
def test_negative_major_raises():
    with pytest.raises(ValueError):
        Revision(-1, 0)
```

**Add validation:**
```python
def __init__(self, major: int, minor: int):
    if major < 0:
        raise ValueError("major must be non-negative")
    if minor < 0:
        raise ValueError("minor must be non-negative")
    self.major = major
    self.minor = minor
```

</details>

---

### Exercise 2: Identify the Mistake

What's wrong with this test?

```python
def test_part_service_saves_correctly():
    service = PartService(MockRepository())
    service.create_part("PN-12345", "Test Part")
    assert service.repo._parts == {"PN-12345": ...}  # Checking internal state
```

<details>
<summary>Solution</summary>

**Mistake:** Testing internal implementation (`_parts` dictionary)

**Better approach:**
```python
def test_part_service_creates_retrievable_part():
    service = PartService(MockRepository())
    service.create_part("PN-12345", "Test Part")
    
    # Test through public interface
    part = service.get_part("PN-12345")
    assert part is not None
    assert part.name == "Test Part"
```

</details>

---

## Summary

### Key Takeaways

| Concept | What It Means |
|---------|---------------|
| **TDD** | Test drives design, not just validates |
| **Red-Green-Refactor** | Fail → Pass → Clean |
| **Test first** | Write test before code |
| **Behavior over implementation** | Test public interfaces |

### TDD Checklist

For every feature:
- [ ] Write test first
- [ ] See test fail
- [ ] Write minimal code to pass
- [ ] See test pass
- [ ] Refactor if needed
- [ ] All tests still pass

---

## Next Tutorial

[Tutorial 2: Pytest Fundamentals →](./02-pytest-fundamentals.md)
