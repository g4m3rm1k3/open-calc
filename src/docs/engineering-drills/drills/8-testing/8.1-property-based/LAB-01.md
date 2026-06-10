# Drill 8.1 — Property-Based Testing: Test What Should Always Be True

**Standalone drill. Prerequisite: basic pytest (`pip install pytest`).**
**Time estimate:** 60–75 minutes
**Environment:** Python 3.8+ — `pip install hypothesis pytest`
**What you will build:** Property-based tests for a sorting function, a bank account, and a codec — finding real bugs that example-based tests miss, including one that would only be triggered by a specific input you'd never think to write manually.
**What you will understand:** What a property is, how Hypothesis generates and shrinks test cases, and why "test with 1000 random inputs" is different from "write 1000 examples."

---

## Quick Check

Answer these before starting. Answers at the bottom.

1. You write `test_sort()` with examples `[3,1,2]`, `[1]`, `[]`. Hypothesis tests 100 random lists. What is Hypothesis checking that your three examples don't check?

2. "Shrinking" is a key Hypothesis feature. When it finds a failing input (say, a list of 47 random integers), what does it do? Why is this useful?

3. Name one property of the `sorted()` function that is always true, regardless of input. Name one that is NOT a property (because it's not always true).

4. Property-based testing can't replace example-based testing. Give one specific scenario where example-based tests are essential and PBT can't substitute.

*(Answers at the bottom.)*

---

## The Concept: Property-Based Testing

### Concept: Properties vs Examples

**What it is:**
Property-based testing (PBT) is a testing approach where you describe invariants that should hold for all valid inputs, then a library (Hypothesis in Python) generates hundreds or thousands of random inputs to try to falsify your invariants. When it finds a failing case, it automatically "shrinks" the input to the smallest example that still fails.

**Example-based testing:**
```python
def test_sort():
    assert sort([3, 1, 2]) == [1, 2, 3]
    assert sort([1]) == [1]
    assert sort([]) == []
```
These tests are brittle: they test specific inputs that the test author chose. They miss all the inputs the author didn't think of.

**Property-based testing:**
```python
from hypothesis import given
from hypothesis import strategies as st

@given(st.lists(st.integers()))
def test_sort_is_sorted(lst):
    result = sort(lst)
    for i in range(len(result) - 1):
        assert result[i] <= result[i+1]  # always true for any sorted list
```
Hypothesis generates hundreds of random integer lists and verifies this property holds for all of them.

**What "property" means:**
A property is a statement that is true for ALL valid inputs, not just a specific example. Properties describe the structure of correct behavior:
- Idempotency: `sort(sort(x)) == sort(x)` — sorting an already-sorted list doesn't change it
- Inverse: `decode(encode(x)) == x` — encoding then decoding returns the original
- Commutativity: `a + b == b + a` — order doesn't matter for addition
- Length preservation: `len(sort(x)) == len(x)` — sorting doesn't add or remove elements
- Ordering: every element in `sort(x)` is <= its successor

**The shrinking mechanism:**
When Hypothesis finds a failing input (say, a list of 50 random numbers), it immediately begins shrinking: try with 49 elements, with smaller values, with simpler structure. It converges on the minimal failing case. A bug that manifests with `[0, -2147483648]` gets reported as `[0, -1]` — the smallest integers that trigger the bug.

**What Hypothesis generates:**
Hypothesis uses a strategy system: `st.integers()`, `st.text()`, `st.lists(...)`, `st.dictionaries(...)`, `st.floats()`, and composites. It also has a "database" — it saves previously found failures and replays them on future runs, so once a bug is found, it's always reproduced until you fix it.

**Constraints:**
- Properties must be true for ALL inputs in the strategy domain — if you write a property that's only true for small inputs, it will fail
- Hypothesis can't test properties that require human judgment ("is this output beautiful?")
- PBT is slow compared to example tests: 100 random inputs vs 1 fixed input. Use `@settings(max_examples=500)` for more thorough testing; reduce for fast CI
- Some functions are hard to test with PBT because you need an oracle (a reference implementation to compare against)

**Tradeoffs:**
- PBT vs example tests: PBT finds edge cases you didn't think of. Example tests document expected behavior clearly. Use both.
- PBT vs fuzzing: fuzzing generates arbitrary byte sequences (for security testing). PBT generates structured data conforming to your strategy. PBT is for business logic; fuzzing is for parsers and security.

**Failure modes:**
- Writing properties that are too weak: `assert len(result) >= 0` is always true — it tests nothing useful
- Writing properties that encode the implementation: if your property is just a re-implementation of the function, you're testing that your code equals itself
- Not including edge cases in strategies: `st.integers()` includes MIN_INT and MAX_INT. If you only want small numbers, use `st.integers(min_value=-100, max_value=100)`.

**Operational reality:**
Hypothesis is used in production by Dropbox, Stripe, and Mozilla. It famously found a bug in Python's `re` module. Libraries like `pandera` (DataFrame validation) and `pydantic` use Hypothesis for their own test suites. The property-first mindset also makes you think more clearly about invariants — which is valuable even when writing example tests.

**You will see this again in:**
Testing sorting/search algorithms, encoding/decoding functions, financial calculations, any pure function with strong mathematical properties. Essential for testing functions where correctness is defined by a mathematical relationship rather than a specific output.

**Watch for:**
The "oracle problem" — when you have no independent way to verify the output is correct, you can only test properties (structural truths) rather than exact values. For a compression algorithm, you can test `decompress(compress(data)) == data` even if you can't predict what `compress(data)` looks like.

---

## Step 1 — Property Tests for a Sorting Function

First, write a sorting function with a deliberate bug:

```python
# sort_impl.py
def buggy_sort(lst: list) -> list:
    """A sort with a subtle bug — can you spot it from tests?"""
    if len(lst) <= 1:
        return list(lst)
    
    # Modified quicksort with an off-by-one error
    pivot = lst[len(lst) // 2]
    left = [x for x in lst if x < pivot]
    # BUG: should include x == pivot in middle, but we're dropping duplicates
    right = [x for x in lst if x > pivot]
    return buggy_sort(left) + [pivot] + buggy_sort(right)


def correct_sort(lst: list) -> list:
    """Correct sorting using insertion sort."""
    result = list(lst)
    for i in range(1, len(result)):
        key = result[i]
        j = i - 1
        while j >= 0 and result[j] > key:
            result[j + 1] = result[j]
            j -= 1
        result[j + 1] = key
    return result
```

Create `test_sort.py`:

```python
# test_sort.py
import pytest
from hypothesis import given, settings, assume
from hypothesis import strategies as st
from sort_impl import buggy_sort, correct_sort


# ── Example-based tests (these might not catch the bug) ──────────────────────

def test_sort_basic():
    assert correct_sort([3, 1, 2]) == [1, 2, 3]
    assert correct_sort([]) == []
    assert correct_sort([1]) == [1]

def test_buggy_sort_misses_duplicates():
    # Will the buggy sort pass these?
    assert buggy_sort([3, 1, 2]) == [1, 2, 3]   # no duplicates — passes
    assert buggy_sort([1]) == [1]


# ── Property-based tests ──────────────────────────────────────────────────────

@given(st.lists(st.integers()))
def test_sort_output_is_ordered(lst):
    """Property: every element in the result is <= the next element."""
    result = correct_sort(lst)
    for i in range(len(result) - 1):
        assert result[i] <= result[i + 1], f"Out of order at {i}: {result[i]} > {result[i+1]}"

@given(st.lists(st.integers()))
def test_sort_preserves_length(lst):
    """Property: sort never adds or removes elements."""
    assert len(correct_sort(lst)) == len(lst)

@given(st.lists(st.integers()))
def test_sort_preserves_elements(lst):
    """Property: sorted result contains exactly the same elements (with multiplicity)."""
    result = correct_sort(lst)
    assert sorted(result) == sorted(lst)  # use Python's built-in as oracle

@given(st.lists(st.integers()))
def test_sort_idempotent(lst):
    """Property: sorting an already-sorted list returns the same list."""
    once = correct_sort(lst)
    twice = correct_sort(once)
    assert once == twice

# ── NOW test the buggy sort with properties ──────────────────────────────────

@given(st.lists(st.integers()))
def test_buggy_sort_output_is_ordered(lst):
    """Does buggy_sort produce ordered output? (It does — pivot ordering is correct)"""
    result = buggy_sort(lst)
    for i in range(len(result) - 1):
        assert result[i] <= result[i + 1]

@given(st.lists(st.integers()))
def test_buggy_sort_preserves_length(lst):
    """Does buggy_sort preserve length? (It DOESN'T for lists with duplicates)"""
    result = buggy_sort(lst)
    assert len(result) == len(lst), (
        f"Length changed: {len(lst)} → {len(result)}\n"
        f"Input: {lst}\n"
        f"Output: {result}"
    )
```

### SAVE AND TRY

```
python -m pytest test_sort.py -v
```

Expected output:
```
test_sort.py::test_sort_basic PASSED
test_sort.py::test_buggy_sort_misses_duplicates PASSED
test_sort.py::test_sort_output_is_ordered PASSED
test_sort.py::test_sort_preserves_length PASSED
test_sort.py::test_sort_preserves_elements PASSED
test_sort.py::test_sort_idempotent PASSED
test_sort.py::test_buggy_sort_output_is_ordered PASSED
test_sort.py::test_buggy_sort_preserves_length FAILED

========== FAILURES ==========
test_buggy_sort_preserves_length
Falsifying example: lst=[0, 0]

    assert len(result) == len(lst), (
AssertionError: Length changed: 2 → 1
Input: [0, 0]
Output: [0]
```

Hypothesis found the bug: `buggy_sort([0, 0])` drops one of the duplicate zeros. And it shrunk the failing case to the minimal example: `[0, 0]` — not the complex random list it first tried.

**Change something:** Change `test_buggy_sort_preserves_length` to test the correct sort. All tests pass. Now add `st.lists(st.integers(), min_size=1)` to require non-empty lists. Run — still passes. The strategy change narrows the domain.

---

## Step 2 — Property Tests for Encoding/Decoding

A codec should satisfy `decode(encode(x)) == x` for all valid inputs:

```python
# codec.py
import base64

def encode_v1(data: str) -> str:
    """Encode a string — version with a bug for certain inputs."""
    # Bug: strip() called on encoded data, which can alter base64 padding
    return base64.b64encode(data.encode()).decode().strip("=")

def decode_v1(encoded: str) -> str:
    """Decode — adds padding back, but may miscalculate padding length."""
    # Bug: this padding calculation is wrong for some lengths
    padding = 4 - (len(encoded) % 4)
    if padding == 4:
        padding = 0
    return base64.b64decode(encoded + "=" * padding).decode()

def encode_v2(data: str) -> bytes:
    """Correct encode."""
    return base64.b64encode(data.encode())

def decode_v2(encoded: bytes) -> str:
    """Correct decode."""
    return base64.b64decode(encoded).decode()
```

Create `test_codec.py`:

```python
from hypothesis import given, settings
from hypothesis import strategies as st
from codec import encode_v1, decode_v1, encode_v2, decode_v2

# Property: round-trip — encode then decode returns original
@given(st.text(alphabet=st.characters(whitelist_categories=("Lu", "Ll", "Nd"))))
def test_codec_v1_roundtrip(text):
    """Buggy codec: should always round-trip but doesn't."""
    encoded = encode_v1(text)
    decoded = decode_v1(encoded)
    assert decoded == text, f"Round-trip failed: {text!r} → {encoded!r} → {decoded!r}"

@given(st.text())
def test_codec_v2_roundtrip(text):
    """Correct codec: round-trip property."""
    assert decode_v2(encode_v2(text)) == text

# Additional properties for correct codec
@given(st.text())
def test_codec_v2_encode_is_deterministic(text):
    """Encoding the same text twice gives the same result."""
    assert encode_v2(text) == encode_v2(text)

@given(st.text(), st.text())
def test_codec_v2_different_inputs_different_outputs(a, b):
    """If inputs differ, encoded outputs should differ (no collision)."""
    if a != b:
        assert encode_v2(a) != encode_v2(b)
```

### SAVE AND TRY

```
python -m pytest test_codec.py -v
```

Expected: `test_codec_v1_roundtrip` fails on some text input. Hypothesis shrinks to the minimal failing example and shows the original text, encoded form, and incorrectly decoded form. `test_codec_v2_roundtrip` passes.

**Change something:** Replace `st.text()` with `st.binary().map(lambda b: b.decode("utf-8", errors="replace"))`. Hypothesis generates more exotic characters. Run — might find different failures.

---

## Step 3 — Stateful Testing with Hypothesis

Some properties require testing a sequence of operations. Hypothesis's `RuleBasedStateMachine` tests stateful APIs:

```python
# test_bank_stateful.py
from hypothesis.stateful import RuleBasedStateMachine, rule, invariant, initialize
from hypothesis import strategies as st, settings

class SimpleBankAccount:
    def __init__(self):
        self.balance = 0.0
        self.history = []
    
    def deposit(self, amount: float) -> None:
        if amount <= 0:
            raise ValueError("Deposit must be positive")
        self.balance += amount
        self.history.append(("deposit", amount))
    
    def withdraw(self, amount: float) -> bool:
        if amount <= 0:
            return False
        if self.balance < amount:
            return False
        self.balance -= amount
        self.history.append(("withdraw", amount))
        return True


class BankAccountStateMachine(RuleBasedStateMachine):
    """
    Hypothesis drives a sequence of operations and checks invariants after each step.
    """
    
    def __init__(self):
        super().__init__()
        self.account = SimpleBankAccount()
        self.expected_balance = 0.0
    
    @initialize()
    def setup(self):
        self.account = SimpleBankAccount()
        self.expected_balance = 0.0
    
    @rule(amount=st.floats(min_value=0.01, max_value=1000.0, allow_nan=False, allow_infinity=False))
    def do_deposit(self, amount):
        amount = round(amount, 2)
        self.account.deposit(amount)
        self.expected_balance += amount
    
    @rule(amount=st.floats(min_value=0.01, max_value=1000.0, allow_nan=False, allow_infinity=False))
    def do_withdraw(self, amount):
        amount = round(amount, 2)
        success = self.account.withdraw(amount)
        if success:
            self.expected_balance -= amount
    
    @invariant()
    def balance_never_negative(self):
        """Balance must never go below zero, regardless of operation sequence."""
        assert self.account.balance >= 0, (
            f"Balance went negative: {self.account.balance}\n"
            f"History: {self.account.history}"
        )
    
    @invariant()
    def balance_matches_expected(self):
        """Balance must match what we tracked manually."""
        assert abs(self.account.balance - self.expected_balance) < 0.01, (
            f"Balance mismatch: account={self.account.balance}, expected={self.expected_balance}"
        )


# This creates a pytest test case from the state machine
TestBankAccount = BankAccountStateMachine.TestCase
```

### SAVE AND TRY

```
python -m pytest test_bank_stateful.py -v
```

Hypothesis generates random sequences of deposit/withdraw operations and verifies invariants hold after each step. This tests the state machine, not just individual operations.

Expected output: all tests pass (the `SimpleBankAccount` implementation is correct). If you introduce a bug (e.g., don't check `amount <= 0` in withdraw), Hypothesis finds the sequence that violates the invariant.

---

## Challenge

**No solution provided. Requirements checklist only.**

Write property-based tests for a URL parser that correctly handles edge cases.

**Requirements checklist:**

- [ ] Function `parse_url(url) → {scheme, host, port, path, query}` that parses URLs
- [ ] Property: `build_url(parse_url(url)) == url` for all valid URLs (round-trip)
- [ ] Property: if `scheme` is "https", `port` defaults to 443; if "http", defaults to 80
- [ ] Property: `parse_url` and Python's `urllib.parse.urlparse` agree on `scheme` and `host` for all inputs (use stdlib as oracle)
- [ ] Property: `parse_url(url)['host']` never contains a slash
- [ ] Property: `parse_url(url)['path']` always starts with "/" if non-empty
- [ ] Custom strategy `st_url()` that generates syntactically valid URLs using Hypothesis composites: `@st.composite def st_url(draw): scheme = draw(st.sampled_from(["http", "https"])); host = draw(st.from_regex(r"[a-z][a-z0-9\-]{0,30}\.[a-z]{2,6}", fullmatch=True)); ...`
- [ ] At least 5 properties tested, with `@settings(max_examples=300)`
- [ ] At least 2 tests use the stdlib `urllib.parse` as an oracle

**Starter:**
```python
from hypothesis import given, settings, strategies as st
from urllib.parse import urlparse, urlencode

def parse_url(url: str) -> dict:
    """
    Parse a URL into components.
    TODO: implement this — test it with property tests before finalizing.
    """
    parsed = urlparse(url)
    return {
        "scheme": parsed.scheme,
        "host": parsed.hostname or "",
        "port": parsed.port,
        "path": parsed.path,
        "query": parsed.query,
    }

@st.composite
def st_url(draw):
    scheme = draw(st.sampled_from(["http", "https"]))
    # TODO: generate host, port, path, query
    # TODO: assemble into a URL string
    pass
```

**When you're done:**
```
python -m pytest test_url_parser.py -v --tb=short
```
- All properties pass with `max_examples=300`
- At least one test that would have been missed by example-based testing (Hypothesis found it, then you fixed the implementation to satisfy the property)

**Stuck?** Ask AI: "In Python Hypothesis, how do I write a composite strategy that generates syntactically valid HTTP URLs? I want to control each component (scheme, hostname, port, path, query string) separately using st.composite and then assemble them into a URL string."

---

## Quick Check Answers

**1. What Hypothesis checks that your three examples don't:**
Edge cases in the input space you didn't think of: very long lists, lists with repeated elements, lists with the minimum and maximum integer values, lists with only negative numbers, lists with a single repeated value. Your three examples cover the happy path for lists of 0, 1, and 3 unique small integers. They don't check: `[0, 0, 0]`, `[-2147483648, 2147483647]`, `[1] * 1000`, or the specific input that triggers the bug in your implementation.

**2. What shrinking does:**
When Hypothesis finds a failing input (e.g., a list of 47 random integers), it tries to find a simpler input that still fails. It removes elements, replaces large values with small ones, and simplifies the structure. It reports the minimal failing case: often just 2-3 elements with the smallest values that reproduce the bug. This is crucial because reading "test failed with [4, -2, 7, 0, 0, ...]" is opaque, while "test failed with [0, 0]" immediately tells you the bug is related to duplicate elements.

**3. A property of `sorted()` vs a non-property:**
Property (always true): `len(sorted(lst)) == len(lst)` — sorting never changes the length. Also: every adjacent pair satisfies `result[i] <= result[i+1]`. Non-property (not always true): `sorted(lst)[0] == 0` — the first element is not always zero. Or: `sorted(lst) == lst` — the list is not always already sorted.

**4. Where example-based tests are essential:**
Documenting the exact expected behavior for specific business-significant inputs — a specific invoice calculation with a known correct result, the exact error message returned for a specific invalid input, a specific API response format for a known request. These are "specification tests" — they express what the system should do for specific cases that a stakeholder cares about. PBT can't substitute because it doesn't know what the specific correct output should be for a specific input; it only knows structural properties.
