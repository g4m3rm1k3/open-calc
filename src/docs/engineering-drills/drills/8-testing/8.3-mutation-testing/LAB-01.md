# Drill 8.3 — Mutation Testing: Testing Your Tests

**Standalone drill. Prerequisite: basic pytest.**
**Time estimate:** 60–75 minutes
**Environment:** Python 3.8+ — `pip install pytest mutmut`
**What you will build:** A banking module with tests, then run mutation testing to find which tests fail to catch code changes. You will see that 80% code coverage can still leave critical bugs undetected — and fix the tests until the mutation score is high.
**What you will understand:** What mutation testing is, why coverage % is a weak signal, what a "surviving mutant" means, and how to write assertions that actually catch bugs.

---

## Quick Check

Answer these before starting. Answers at the bottom.

1. You have 100% line coverage. Every line of code runs during tests. Does this mean your tests would catch a bug where `<` is changed to `<=`? Why or why not?

2. A mutation is a small code change (replacing `+` with `-`, removing a condition). A "surviving mutant" is one where all tests still pass after the mutation. What does a surviving mutant tell you about your tests?

3. Mutation testing is slow. On a codebase with 10,000 lines and 500 mutations, each requiring a full test suite run. What would you do to make it practical?

4. `assert result is not None` vs `assert result == {"id": 1, "name": "Alice"}`. Which assertion kills more mutants? Why?

*(Answers at the bottom.)*

---

## The Concept: Mutation Testing

### Concept: Measuring Test Effectiveness

**What it is:**
Mutation testing evaluates test suite quality by making small, systematic changes (mutations) to the production code and running the tests. If the tests detect the change (a test fails), the mutant is "killed." If all tests still pass after the mutation, the mutant "survives" — meaning your tests would not detect that particular code change.

**Why coverage is insufficient:**
```python
def is_adult(age: int) -> bool:
    return age >= 18

def test_adult():
    assert is_adult(25) == True   # 100% line coverage
```
100% line coverage — every line runs. But the test would pass even if the function were `return age > 18` (mutant), `return age >= 17` (mutant), or `return age >= 19` (mutant). The test has no assertions that pin down the boundary behavior. Coverage says "this code ran." Mutation testing says "your tests would catch this change."

**The mutation operators — what changes are made:**
- Arithmetic: `+` → `-`, `*` → `/`, etc.
- Relational: `>` → `>=`, `<` → `<=`, `==` → `!=`
- Logical: `and` → `or`, `not x` → `x`
- Control: remove an `if` condition, change `return True` to `return False`
- Statement deletion: remove a line entirely

**The mutation score:**
```
Mutation Score = (Killed Mutants) / (Total Mutants) × 100%
```
A score of 80% means 20% of mutations survive — 20% of small code changes would not be caught by your tests.

**The mechanism:**
1. Copy the source file
2. Make one mutation (e.g., change line 5 `>=` to `>`)
3. Run the test suite
4. If any test fails: mutant killed (test suite detected the change)
5. If all tests pass: mutant survived (gap in test coverage)
6. Restore original, repeat for next mutation

**What surviving mutants tell you:**
Each surviving mutant points to a specific gap in test coverage:
- A boundary value not tested (survives `>` → `>=`)
- A return value never checked (survives `return True` → `return False`)
- A condition never exercised as both true and false
- A computation whose result is never verified

**Constraints:**
- Mutation testing is slow: N mutations × test suite time. A 10-minute test suite with 500 mutations = 83 hours. Mitigations: test only changed files, use parallel mutation runners, run only the tests related to the mutated code.
- Equivalent mutants: some mutations don't change the program's behavior (e.g., `a + b` → `b + a`). These always survive but don't represent bugs. They inflate the mutant count.
- Not all surviving mutants need tests: some are equivalent mutants, some test behavior that's truly irrelevant. Judgment is required.

**Tradeoffs:**
- Mutation score vs time: 100% mutation score requires testing every boundary, every return value, every condition — very thorough but slow to write. Aim for 80-90% and focus on killing mutants in critical business logic.
- Weak assertions vs strong: `assert result is not None` is a weak assertion — almost no mutation kills it. `assert result == expected_value` is strong — changes to the value computation kill it.

**Failure modes:**
- Tests only assert presence, not value: `assert "error" in response` survives mutations that change what the error says
- Happy path only: no tests for edge cases → mutations on edge case handling survive
- Single test per function: if one test covers the function, it may not catch mutations for specific paths
- Testing only the external API without internals: a function with complex internal logic has many surviving mutants if only the final result is checked

**Operational reality:**
`mutmut` (Python) and `Stryker` (JavaScript) are the standard tools. Mutation testing is not run on every commit — it's too slow. Run it: before releasing a critical module, when reviewing test quality of a PR, or on a weekly CI schedule for core business logic. Use the results to prioritize which tests to strengthen.

**You will see this again in:**
Quality gates for financial calculation modules, payment processing, authorization logic — any code where a silent bug (survives all tests) would have serious consequences.

**Watch for:**
Tests that only check `assert result is not None` or `assert len(result) > 0`. These are "existence tests" that kill almost no mutants. Strong assertions check exact values, specific fields, and boundary conditions.

---

## Step 1 — Write the Module Under Test

Create `bank.py`:

```python
# bank.py — banking logic with several decision points
from dataclasses import dataclass
from typing import Optional

@dataclass
class Transaction:
    type: str       # "deposit" or "withdrawal"
    amount: float
    description: str = ""

@dataclass
class Account:
    account_id: str
    balance: float
    owner: str
    overdraft_limit: float = 0.0
    transactions: list = None
    
    def __post_init__(self):
        if self.transactions is None:
            self.transactions = []

class BankError(Exception):
    pass

def deposit(account: Account, amount: float, description: str = "") -> Account:
    if amount <= 0:
        raise BankError(f"Deposit amount must be positive, got {amount}")
    account.balance += amount
    account.transactions.append(Transaction("deposit", amount, description))
    return account

def withdraw(account: Account, amount: float, description: str = "") -> Account:
    if amount <= 0:
        raise BankError(f"Withdrawal amount must be positive, got {amount}")
    
    available = account.balance + account.overdraft_limit
    if amount > available:
        raise BankError(
            f"Insufficient funds: balance={account.balance}, "
            f"overdraft={account.overdraft_limit}, requested={amount}"
        )
    
    account.balance -= amount
    account.transactions.append(Transaction("withdrawal", amount, description))
    return account

def transfer(from_account: Account, to_account: Account, amount: float) -> tuple[Account, Account]:
    """Transfer amount from one account to another."""
    if amount <= 0:
        raise BankError("Transfer amount must be positive")
    if from_account.account_id == to_account.account_id:
        raise BankError("Cannot transfer to the same account")
    
    withdraw(from_account, amount, f"Transfer to {to_account.account_id}")
    deposit(to_account, amount, f"Transfer from {from_account.account_id}")
    return from_account, to_account

def calculate_interest(account: Account, rate: float, months: int) -> float:
    """Calculate simple interest: principal × rate × time."""
    if rate < 0:
        raise BankError("Interest rate cannot be negative")
    if months <= 0:
        raise BankError("Months must be positive")
    return account.balance * rate * (months / 12)

def is_eligible_for_premium(account: Account) -> bool:
    """Premium eligibility: balance >= 10000 AND at least 3 transactions."""
    return account.balance >= 10000 and len(account.transactions) >= 3
```

---

## Step 2 — Write Weak Tests (Intentionally Poor Quality)

Create `test_bank_weak.py` — tests with weak assertions that will survive many mutations:

```python
# test_bank_weak.py — these tests have weak assertions (intentionally)
import pytest
from bank import Account, deposit, withdraw, transfer, calculate_interest, is_eligible_for_premium, BankError

def make_account(balance=1000.0, overdraft=0.0):
    return Account("ACC-001", balance, "Alice", overdraft)

# WEAK TESTS — these leave many surviving mutants

def test_deposit_returns_account():
    acc = make_account()
    result = deposit(acc, 100)
    assert result is not None        # WEAK: survives any mutation to the deposit amount

def test_deposit_raises_for_zero():
    acc = make_account()
    with pytest.raises(BankError):   # WEAK: doesn't check the error message
        deposit(acc, 0)

def test_withdraw_works():
    acc = make_account(1000)
    withdraw(acc, 500)
    assert acc.balance > 0           # WEAK: doesn't check exact value

def test_withdraw_raises_on_overdraft():
    acc = make_account(100)
    with pytest.raises(BankError):
        withdraw(acc, 200)           # WEAK: doesn't check that withdraw(100) would succeed

def test_transfer_works():
    src = make_account(1000)
    dst = make_account(0)
    transfer(src, dst, 500)
    assert src.balance < 1000        # WEAK: doesn't check exact values

def test_interest():
    acc = make_account(1000)
    interest = calculate_interest(acc, 0.05, 12)
    assert interest > 0              # WEAK: survives any mutation to the formula

def test_premium_eligibility():
    acc = make_account(10000)
    for i in range(3):
        deposit(acc, 1)              # add transactions
    result = is_eligible_for_premium(acc)
    assert result is True or result is False   # ABSOLUTELY USELESS assertion
```

### SAVE AND TRY

First, run the tests to see they pass:

```
python -m pytest test_bank_weak.py -v
```

Expected: all 7 tests pass. Now run mutation testing:

```
mutmut run --paths-to-mutate bank.py --runner "python -m pytest test_bank_weak.py -x -q"
mutmut results
```

Expected: very low mutation score (~20-40%). Many mutants survive because the weak assertions don't pin down exact behavior.

```
mutmut show <surviving mutant number>
```

Shows the exact change that survived — e.g., `account.balance += amount` → `account.balance -= amount`. The deposit test doesn't check the exact balance, so it can't detect that the operation became a subtraction.

---

## Step 3 — Write Strong Tests That Kill Mutants

Create `test_bank_strong.py`:

```python
# test_bank_strong.py — tests with strong assertions that kill mutants
import pytest
from bank import Account, deposit, withdraw, transfer, calculate_interest, is_eligible_for_premium, BankError

def make_account(balance=1000.0, overdraft=0.0, txn_count=0):
    acc = Account("ACC-001", balance, "Alice", overdraft)
    # Add fake historical transactions if needed
    for _ in range(txn_count):
        from bank import Transaction
        acc.transactions.append(Transaction("deposit", 1.0))
    return acc


# ── deposit() ──────────────────────────────────────────────────────────────

def test_deposit_increases_balance_by_exact_amount():
    acc = make_account(1000.0)
    deposit(acc, 250.0)
    assert acc.balance == 1250.0      # STRONG: exact value kills arithmetic mutants

def test_deposit_records_transaction():
    acc = make_account(0.0)
    deposit(acc, 100.0, "paycheck")
    assert len(acc.transactions) == 1
    assert acc.transactions[0].type == "deposit"
    assert acc.transactions[0].amount == 100.0
    assert acc.transactions[0].description == "paycheck"

def test_deposit_zero_raises_bank_error():
    acc = make_account()
    with pytest.raises(BankError, match="must be positive"):  # STRONG: checks message
        deposit(acc, 0)

def test_deposit_negative_raises_bank_error():
    acc = make_account()
    with pytest.raises(BankError):
        deposit(acc, -1)

def test_deposit_boundary_positive_just_above_zero():
    acc = make_account(0.0)
    deposit(acc, 0.01)  # smallest valid amount
    assert acc.balance == 0.01       # STRONG: kills > vs >= mutant


# ── withdraw() ─────────────────────────────────────────────────────────────

def test_withdraw_decreases_balance_by_exact_amount():
    acc = make_account(1000.0)
    withdraw(acc, 300.0)
    assert acc.balance == 700.0       # STRONG: exact value

def test_withdraw_at_exact_balance_succeeds():
    acc = make_account(100.0)
    withdraw(acc, 100.0)              # boundary: exact balance
    assert acc.balance == 0.0

def test_withdraw_just_over_balance_fails():
    acc = make_account(100.0)
    with pytest.raises(BankError):
        withdraw(acc, 100.01)         # STRONG: one cent over fails

def test_withdraw_uses_overdraft_limit():
    acc = make_account(100.0, overdraft=50.0)
    withdraw(acc, 150.0)             # balance + overdraft = 150 exactly
    assert acc.balance == -50.0      # STRONG: balance goes negative (overdraft used)

def test_withdraw_over_overdraft_fails():
    acc = make_account(100.0, overdraft=50.0)
    with pytest.raises(BankError):
        withdraw(acc, 150.01)        # one cent over limit

def test_withdraw_zero_raises():
    with pytest.raises(BankError):
        withdraw(make_account(), 0)

def test_withdraw_records_transaction():
    acc = make_account(500.0)
    withdraw(acc, 200.0, "rent")
    assert acc.transactions[-1].type == "withdrawal"
    assert acc.transactions[-1].amount == 200.0


# ── transfer() ─────────────────────────────────────────────────────────────

def test_transfer_moves_exact_amount():
    src = Account("A", 1000.0, "Alice")
    dst = Account("B", 0.0, "Bob")
    transfer(src, dst, 400.0)
    assert src.balance == 600.0    # STRONG: exact source balance
    assert dst.balance == 400.0    # STRONG: exact destination balance

def test_transfer_total_preserved():
    src = Account("A", 1000.0, "Alice")
    dst = Account("B", 500.0, "Bob")
    transfer(src, dst, 300.0)
    assert src.balance + dst.balance == 1500.0  # conservation of money

def test_transfer_to_same_account_raises():
    acc = make_account()
    with pytest.raises(BankError, match="same account"):
        transfer(acc, acc, 100.0)

def test_transfer_zero_raises():
    src = Account("A", 1000.0, "Alice")
    dst = Account("B", 0.0, "Bob")
    with pytest.raises(BankError):
        transfer(src, dst, 0)


# ── calculate_interest() ───────────────────────────────────────────────────

def test_interest_simple_case():
    acc = make_account(1200.0)
    result = calculate_interest(acc, 0.05, 12)
    assert result == 60.0          # 1200 * 0.05 * (12/12) = 60 exactly

def test_interest_partial_year():
    acc = make_account(1200.0)
    result = calculate_interest(acc, 0.12, 6)
    assert result == 72.0          # 1200 * 0.12 * (6/12) = 72

def test_interest_zero_rate():
    acc = make_account(1000.0)
    assert calculate_interest(acc, 0.0, 12) == 0.0

def test_interest_negative_rate_raises():
    with pytest.raises(BankError):
        calculate_interest(make_account(), -0.01, 12)

def test_interest_zero_months_raises():
    with pytest.raises(BankError):
        calculate_interest(make_account(), 0.05, 0)


# ── is_eligible_for_premium() ─────────────────────────────────────────────

def test_premium_eligible_when_both_conditions_met():
    acc = make_account(10000.0, txn_count=3)
    assert is_eligible_for_premium(acc) is True

def test_premium_not_eligible_low_balance():
    acc = make_account(9999.99, txn_count=3)
    assert is_eligible_for_premium(acc) is False   # STRONG: exact boundary

def test_premium_not_eligible_few_transactions():
    acc = make_account(10000.0, txn_count=2)
    assert is_eligible_for_premium(acc) is False

def test_premium_boundary_exactly_10000():
    acc = make_account(10000.0, txn_count=3)
    assert is_eligible_for_premium(acc) is True    # STRONG: >= vs > at 10000

def test_premium_boundary_exactly_3_transactions():
    acc = make_account(10000.0, txn_count=3)
    assert is_eligible_for_premium(acc) is True    # STRONG: >= vs > at 3

def test_premium_not_eligible_neither_condition():
    acc = make_account(100.0, txn_count=0)
    assert is_eligible_for_premium(acc) is False
```

### SAVE AND TRY

```
python -m pytest test_bank_strong.py -v
```

Expected: all tests pass. Now run mutation testing:

```
mutmut run --paths-to-mutate bank.py --runner "python -m pytest test_bank_strong.py -x -q"
mutmut results
```

Expected: much higher mutation score (80-95%). The strong assertions with exact values, boundary tests, and specific error messages kill far more mutants.

Compare the surviving mutants between the two test files. The strong tests kill mutants like:
- `account.balance += amount` → `account.balance -= amount` — killed by `test_deposit_increases_balance_by_exact_amount`
- `rate < 0` → `rate <= 0` — killed by `test_interest_zero_rate`
- `>= 10000` → `> 10000` — killed by `test_premium_boundary_exactly_10000`

**Change something:** Look at any surviving mutants after the strong test suite. For each one, write a new test that kills it. The mutation name tells you exactly what changed — write a test that would fail if that change were real.

---

## Challenge

**No solution provided. Requirements checklist only.**

Apply mutation testing to a discount calculation module and achieve a mutation score above 85%.

**Requirements checklist:**

- [ ] Module `discounts.py` with these functions:
  - `apply_discount(price, discount_percent)` — returns price after discount, raises `ValueError` for invalid inputs (price <= 0, discount < 0, discount > 100)
  - `calculate_loyalty_discount(purchases: int, years: int)` — returns discount percent: 5% if purchases >= 10 OR years >= 5; 10% if purchases >= 50 AND years >= 3; 0% otherwise
  - `apply_coupon(price, coupon_code)` — returns discounted price. Coupon codes: `SAVE10` = 10%, `HALF50` = 50%, `VIP20` = 20%; invalid code = 0% discount
  - `stack_discounts(price, discounts: list[float])` — applies multiple discounts sequentially (not additively): `stack_discounts(100, [10, 20])` = 100 * 0.9 * 0.8 = 72.0
- [ ] Test file `test_discounts_weak.py` — write deliberately weak tests (existence checks, no exact values). Run `mutmut` and record the mutation score.
- [ ] Test file `test_discounts_strong.py` — write strong tests: exact values, boundaries, error messages, negative paths. Run `mutmut` and achieve mutation score >= 85%.
- [ ] Document in a comment block at the top of `test_discounts_strong.py`: what surviving mutants you found, what tests you added to kill them, and the before/after mutation scores.

**Starter:**
```python
# discounts.py
def apply_discount(price: float, discount_percent: float) -> float:
    if price <= 0:
        raise ValueError(f"Price must be positive, got {price}")
    if discount_percent < 0 or discount_percent > 100:
        raise ValueError(f"Discount must be 0-100, got {discount_percent}")
    return price * (1 - discount_percent / 100)

def calculate_loyalty_discount(purchases: int, years: int) -> float:
    # TODO: implement the tier logic
    pass

def apply_coupon(price: float, coupon_code: str) -> float:
    COUPONS = {"SAVE10": 10, "HALF50": 50, "VIP20": 20}
    # TODO: implement
    pass

def stack_discounts(price: float, discounts: list[float]) -> float:
    # TODO: implement sequential application
    pass
```

**When you're done:**
```
mutmut run --paths-to-mutate discounts.py --runner "python -m pytest test_discounts_weak.py -x -q"
mutmut results
# Score: ~30-40%

mutmut run --paths-to-mutate discounts.py --runner "python -m pytest test_discounts_strong.py -x -q"  
mutmut results
# Score: >= 85%
```

**Stuck?** Ask AI: "I'm writing Python tests to achieve a high mutation score with mutmut. My function has `discount_percent < 0 or discount_percent > 100`. What tests do I need to kill the mutants where `<` changes to `<=` and `>` changes to `>=`? Show me the specific boundary test cases."

---

## Quick Check Answers

**1. Does 100% line coverage catch `<` → `<=`?**
No. Coverage only tracks whether a line executes — not whether the line's specific values are verified by assertions. If you test `is_adult(25)`, the line `return age >= 18` executes (100% coverage). But neither `is_adult(17)` nor `is_adult(18)` is tested. Changing `>=` to `>` would make `is_adult(18)` return `False` instead of `True` — but since you don't test that boundary, the mutation survives. Coverage measures execution; mutation testing measures assertion quality.

**2. What a surviving mutant means:**
A surviving mutant means your test suite would not detect that specific code change. If `a + b` changed to `a - b` and all tests pass, your tests don't verify the result of that computation. Either: (a) no test checks the value this code produces, (b) tests only check a coarser property ("is it positive?" when the exact value matters), or (c) the code path isn't reached at all. A surviving mutant is a specific, actionable pointer: "this line/condition is inadequately tested."

**3. Making mutation testing practical:**
(a) Test only changed files: run mutations only on code modified in the current PR, not the entire codebase. (b) Run related tests only: identify which tests cover the mutated code (via coverage data) and only run those, not the full suite. (c) Parallel mutation runners: mutmut and Stryker support parallel execution. (d) Incremental runs: save which mutants were killed previously and only test new code/new mutations. (e) Target high-value code: run mutation testing only on critical business logic (payment processing, auth, financial calculations).

**4. `assert result is not None` vs `assert result == expected`:**
`assert result == {"id": 1, "name": "Alice"}` kills far more mutants. Any mutation that changes the id computation, the name lookup, or the dict construction is killed by the exact equality check. `assert result is not None` kills almost no mutants — the only mutations it kills are ones that return `None` explicitly (rare). Most real bugs (wrong value, wrong field name, wrong calculation) produce a non-None result with an incorrect value. Weak existence assertions are nearly useless for mutation testing.
