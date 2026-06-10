# Python Tool Database — LAB 23 — Test-Driven Development: Red, Green, Refactor

**Prerequisites:** Lab 22. You can write pytest test functions, read the output, and use `pytest.raises`. You understand what the Red-Green-Refactor cycle is (from Lesson 00c) but have not practiced it in depth on a real function.

**What this lab adds:**
- Practicing the full TDD cycle on a real calculation function
- Writing the test *before* the function exists — seeing the `NameError` on purpose
- Building `calculate_sfm` step by step, one test at a time
- The refactor step: cleaning up with confidence because the tests protect you
- Recognizing when a cycle is too big and needs to be split

**Time:** 40–55 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. You write a test for a function that does not exist yet. You run pytest. What error do you see, and why is seeing that error important?
> 2. The "Green" step says: write the *minimum* code to make the test pass. Why "minimum" — why not write the complete, final solution?
> 3. After the refactor step, you run the tests. One turns red. What does that tell you about the refactor?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

A `calculate_sfm` function, built entirely by TDD.

```python
# tooldb/sfm.py
def calculate_sfm(diameter_inches: float, rpm: float) -> float:
    """Surface Feet per Minute = π × diameter × RPM / 12"""
```

This is a machining calculation: SFM (Surface Feet per Minute) is how fast the cutting edge moves against the workpiece. Carbide tools typically run at 250–500 SFM, HSS tools at 100–150 SFM.

The formula: **SFM = π × d × RPM / 12**

For a 1.0" diameter cutter at 3820 RPM: SFM = π × 1.0 × 3820 / 12 ≈ 1000.

New file:
```
tooldb/
    sfm.py       ← NEW
tests/
    test_sfm.py  ← NEW
```

---

## Step 1 — RED: Write the Test Before the Function

Create `tests/test_sfm.py`. The function does not exist yet.

```python
from tooldb.sfm import calculate_sfm


def test_calculate_sfm_one_inch_at_3820_rpm():
    result = calculate_sfm(diameter_inches=1.0, rpm=3820)
    assert abs(result - 1000.0) < 1.0  # within 1 SFM of the expected value
```

Why `abs(result - 1000.0) < 1.0` instead of `result == 1000.0`?

Floating-point arithmetic. `math.pi * 1.0 * 3820 / 12` is `999.95...`, not exactly `1000.0`. The assertion uses a tolerance of ±1 SFM, which is fine for a machining calculation. For exact integer math you can use `==`; for floating-point results you almost always need a tolerance.

### Run it — expect failure

```
pytest tests/test_sfm.py -v
```

Expected output:
```
ERRORS

tests/test_sfm.py::test_calculate_sfm_one_inch_at_3820_rpm ERROR

ModuleNotFoundError: No module named 'tooldb.sfm'
```

This is the Red step. The test cannot even run because the module doesn't exist. That is intentional — you are now committed to building exactly what the test demands.

---

## Step 2 — GREEN: Minimum Code to Pass

Create `tooldb/sfm.py`:

```python
import math


def calculate_sfm(diameter_inches: float, rpm: float) -> float:
    return math.pi * diameter_inches * rpm / 12
```

Run pytest:

```
pytest tests/test_sfm.py -v
```

Expected:
```
tests/test_sfm.py::test_calculate_sfm_one_inch_at_3820_rpm PASSED
1 passed in 0.03s
```

Green. The function is done — for the one test that exists. Don't add anything else yet.

---

## Step 3 — Second RED: Edge Case

Now add a second test: what happens with a half-inch tool?

```python
def test_calculate_sfm_half_inch_at_3820_rpm():
    result = calculate_sfm(diameter_inches=0.5, rpm=3820)
    assert abs(result - 500.0) < 1.0
```

Run pytest — it should pass immediately. Why? Because the formula handles this automatically. The second test confirms the scaling behavior: halving the diameter halves the SFM.

This is normal in TDD: sometimes a new test passes right away. That is fine — the test still has value as documentation and regression protection.

---

## Step 4 — Third RED: Error Case

What should happen when `diameter_inches` is zero or negative? A zero-diameter tool doesn't make physical sense. Add a test for it:

```python
import pytest

def test_calculate_sfm_zero_diameter_raises_error():
    with pytest.raises(ValueError):
        calculate_sfm(diameter_inches=0.0, rpm=3820)


def test_calculate_sfm_negative_diameter_raises_error():
    with pytest.raises(ValueError):
        calculate_sfm(diameter_inches=-0.5, rpm=3820)
```

Run pytest — these will fail:

```
FAILED tests/test_sfm.py::test_calculate_sfm_zero_diameter_raises_error
FAILED tests/test_sfm.py::test_calculate_sfm_negative_diameter_raises_error
```

The function currently returns `0.0` for zero diameter and a negative number for negative diameter. Neither raises an error. The tests are telling you: there is a missing rule.

---

## Step 5 — GREEN: Add the Validation

Update `tooldb/sfm.py`:

```python
import math


def calculate_sfm(diameter_inches: float, rpm: float) -> float:
    if diameter_inches <= 0:
        raise ValueError(f"diameter_inches must be positive, got {diameter_inches}")
    return math.pi * diameter_inches * rpm / 12
```

Run pytest:

```
pytest tests/test_sfm.py -v
```

Expected:
```
test_calculate_sfm_one_inch_at_3820_rpm PASSED
test_calculate_sfm_half_inch_at_3820_rpm PASSED
test_calculate_sfm_zero_diameter_raises_error PASSED
test_calculate_sfm_negative_diameter_raises_error PASSED
4 passed
```

All green.

---

## Step 6 — REFACTOR: Clean Up Without Breaking

The function is correct. Now look at it critically:

```python
def calculate_sfm(diameter_inches: float, rpm: float) -> float:
    if diameter_inches <= 0:
        raise ValueError(f"diameter_inches must be positive, got {diameter_inches}")
    return math.pi * diameter_inches * rpm / 12
```

Two possible improvements:

**Option 1: Extract the validation into a guard clause**

The function is already clean. The guard clause at the top is clear. No change needed — this is YAGNI.

**Option 2: Add a meaningful constant**

The `/ 12` converts inches to feet (12 inches per foot). A reader who doesn't know this formula might wonder. Add a constant:

```python
import math

_INCHES_PER_FOOT = 12


def calculate_sfm(diameter_inches: float, rpm: float) -> float:
    if diameter_inches <= 0:
        raise ValueError(f"diameter_inches must be positive, got {diameter_inches}")
    return math.pi * diameter_inches * rpm / _INCHES_PER_FOOT
```

The leading underscore on `_INCHES_PER_FOOT` means "private to this module." It's a naming convention, not enforcement.

Run the tests after the refactor:

```
pytest tests/test_sfm.py -v
```

All four still pass. The refactor is safe.

---

## Concept Block — The TDD Rhythm

```
┌─────────────────────────────────────────────────┐
│                                                 │
│  RED  →  Write a test that fails                │
│          The test defines what you need         │
│                                                 │
│  GREEN →  Write just enough code to pass        │
│           Not the cleanest. Not the most        │
│           general. Just enough.                 │
│                                                 │
│  REFACTOR → Improve without changing behavior   │
│             Tests stay green = safe             │
│                                                 │
│  Cycle time: minutes, not hours                 │
│  If it takes more than 20 min, step is too big  │
│                                                 │
└─────────────────────────────────────────────────┘
```

The key discipline: **don't skip ahead.** Don't write two tests at once. Don't write the whole function on the first pass. The cycle is short by design — each loop gives you a green test you can keep.

---

## Step 7 — Fourth RED: RPM Validation

Same pattern for RPM: what should happen with zero or negative RPM?

Add two more tests:

```python
def test_calculate_sfm_zero_rpm_raises_error():
    with pytest.raises(ValueError):
        calculate_sfm(diameter_inches=1.0, rpm=0.0)


def test_calculate_sfm_negative_rpm_raises_error():
    with pytest.raises(ValueError):
        calculate_sfm(diameter_inches=1.0, rpm=-100.0)
```

Run pytest — these fail. Update the function to handle them.

---

## Step 8 — GREEN: Add RPM Validation

```python
import math

_INCHES_PER_FOOT = 12


def calculate_sfm(diameter_inches: float, rpm: float) -> float:
    if diameter_inches <= 0:
        raise ValueError(f"diameter_inches must be positive, got {diameter_inches}")
    if rpm <= 0:
        raise ValueError(f"rpm must be positive, got {rpm}")
    return math.pi * diameter_inches * rpm / _INCHES_PER_FOOT
```

Run pytest — all six pass.

---

## Step 9 — SAVE AND TRY: Full Suite

```
pytest -v
```

Confirm all tests in the project still pass. Adding `sfm.py` and `test_sfm.py` should not affect any other test.

Also confirm the module is importable:

```python
python -c "from tooldb.sfm import calculate_sfm; print(calculate_sfm(1.0, 3820))"
```

Expected output: approximately `999.95`.

---

## Step 10 — REFACTOR: Final Review

Look at the function now:

```python
def calculate_sfm(diameter_inches: float, rpm: float) -> float:
    if diameter_inches <= 0:
        raise ValueError(f"diameter_inches must be positive, got {diameter_inches}")
    if rpm <= 0:
        raise ValueError(f"rpm must be positive, got {rpm}")
    return math.pi * diameter_inches * rpm / _INCHES_PER_FOOT
```

The two validation lines are similar in structure. You could extract a helper:

```python
def _require_positive(value: float, name: str) -> None:
    if value <= 0:
        raise ValueError(f"{name} must be positive, got {value}")


def calculate_sfm(diameter_inches: float, rpm: float) -> float:
    _require_positive(diameter_inches, "diameter_inches")
    _require_positive(rpm, "rpm")
    return math.pi * diameter_inches * rpm / _INCHES_PER_FOOT
```

Is this better? It removes duplication. It is also more abstract — a reader has to look at `_require_positive` to understand what it does. For two uses, it's borderline. For five or six uses across the module, it's clearly better.

Make the call and run the tests. Either way is correct as long as the tests pass.

---

## Challenge

Add an `rpm_for_sfm` function to `tooldb/sfm.py` using TDD:

```python
def rpm_for_sfm(diameter_inches: float, target_sfm: float) -> float:
    """Given a tool diameter and desired SFM, return the required RPM."""
```

Formula: **RPM = SFM × 12 / (π × diameter)**

Write the tests first. Handle the validation cases. Make everything green. Then refactor.

<details>
<summary>Answer</summary>

**Test file additions to `tests/test_sfm.py`:**

```python
from tooldb.sfm import calculate_sfm, rpm_for_sfm


def test_rpm_for_sfm_one_inch_at_1000_sfm():
    result = rpm_for_sfm(diameter_inches=1.0, target_sfm=1000.0)
    assert abs(result - 3820.0) < 5.0  # within 5 RPM


def test_rpm_for_sfm_is_inverse_of_calculate_sfm():
    # Round-trip: SFM → RPM → SFM should recover the original SFM
    diameter = 0.75
    original_sfm = 350.0
    calculated_rpm = rpm_for_sfm(diameter_inches=diameter, target_sfm=original_sfm)
    recovered_sfm = calculate_sfm(diameter_inches=diameter, rpm=calculated_rpm)
    assert abs(recovered_sfm - original_sfm) < 0.1


def test_rpm_for_sfm_zero_diameter_raises_error():
    with pytest.raises(ValueError):
        rpm_for_sfm(diameter_inches=0.0, target_sfm=300.0)


def test_rpm_for_sfm_zero_sfm_raises_error():
    with pytest.raises(ValueError):
        rpm_for_sfm(diameter_inches=1.0, target_sfm=0.0)
```

**Production code addition to `tooldb/sfm.py`:**

```python
def rpm_for_sfm(diameter_inches: float, target_sfm: float) -> float:
    _require_positive(diameter_inches, "diameter_inches")
    _require_positive(target_sfm, "target_sfm")
    return target_sfm * _INCHES_PER_FOOT / (math.pi * diameter_inches)
```

The round-trip test is especially valuable: it proves that the two functions are mathematically consistent with each other — not just that each one passes a single hand-calculated case.

</details>

---

## Final Check

| I can... | Yes / Not yet |
|----------|--------------|
| Write a test for a function that doesn't exist yet | |
| Run it and see the expected `NameError` or `ModuleNotFoundError` | |
| Write the minimum code to make it pass | |
| Add the next test and repeat the cycle | |
| Refactor with confidence because tests stay green | |
| Explain why you write "minimum code" rather than the full solution | |
| Recognize when a cycle is too big (taking > 20 min) | |

---

## Quick Check Answers

1. **You see `ModuleNotFoundError` or `NameError` (or `AttributeError` for a missing method).** Seeing the failure is important because it proves the test is real — it is actually checking something that does not exist. A test that passes before you write the code is broken: it is not checking anything meaningful.

2. **Minimum code forces you to think about one test at a time.** If you write the complete solution on the first pass, you may add logic that no test currently requires — logic that could have bugs you haven't tested. Writing minimum code keeps the test suite and the production code in lockstep: every line of production code exists because a test demanded it.

3. **The refactor changed the behavior, not just the structure.** When a refactor makes a test red, it means you accidentally changed what the code does while trying to improve how it looks. Undo the last change and try a smaller step.
