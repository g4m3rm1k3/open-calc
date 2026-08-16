# Lesson 38: Contract Testing

**What you will build.** A real, automated test for Growth's side of the
`accounts.py` boundary — not a test that runs both `accounts.py` and
`growth_signup.py` together, but one that checks `can_purchase` against
every status the *published* contract, `ACCOUNT_STATUSES`, currently
allows. You'll watch it pass today, then watch Accounts add a real, fully
documented new status — the change Lesson 36 argued should always be
deliberate — and watch Growth's test fail immediately, in Growth's own
codebase, without a single line of `accounts.py` needing to run at all.

**What you need to know first.** Lesson 36's `ACCOUNT_STATUSES` contract
and Lesson 20's acceptance criteria — this lesson turns the contract
itself into something both sides of a boundary can test against
independently, the way Lesson 20 turned a written requirement into a
runnable check.

**Terms introduced in this lesson**

- **contract test** — an automated test that checks one side of an API
  relationship against an explicit, shared contract definition, catching
  a mismatch by running just that one side, without needing both systems
  running together. A **provider contract test** confirms the API's real
  behavior matches what it publishes; a **consumer contract test**
  confirms a caller correctly handles everything the published contract
  allows — not just the cases the caller happened to be written against.
  The word matters because Lesson 36's own `assert` inside
  `get_account_status` only ever catches a violation when that specific
  function actually runs. A contract test can catch a mismatch on
  Growth's side, in Growth's own test suite, with no call to
  `accounts.py` involved at all.

**Objects and methods used.** `isinstance(value, type)`, first appearance
in this curriculum: returns `True` if `value` is an instance of `type`,
used here to check that `can_purchase` returns an actual `bool` rather
than some other type that might happen to be truthy or falsy.

Pipeline: this lesson continues in the *Specification* stage, restated
per Lesson 28's convention:

```text
Problem → Requirements → Domain model → Specification → Architecture →
Design → Implementation → Verification → Integration → Release →
Deployment → Operations → Observation → Change → Migration → Evolution →
Retirement
```

---

## Concept Unit: Testing Growth's Side, Without Running Accounts' Code

### The Problem

Lesson 36's `ACCOUNT_STATUSES` guard only ever catches a violation when
`get_account_status` itself actually runs — which means catching a
problem with `can_purchase` still requires calling into `accounts.py`
first. Can Growth verify their own code is ready for *everything* the
published contract allows, without needing `accounts.py` running at all?

### The Concept

Yes — by testing `can_purchase` directly against the shared contract
definition, `ACCOUNT_STATUSES`, rather than against whatever specific
accounts happen to exist in `_accounts` right now:

```python
def consumer_contract_test():
    for status in ACCOUNT_STATUSES:
        result = can_purchase(status)
        assert isinstance(result, bool), "can_purchase must return True or False for every published status"
    print("consumer contract test passed for", ACCOUNT_STATUSES)
```

Run it against today's contract:

```python
consumer_contract_test()
```

Running it:

```text
$ python growth_tests.py
consumer contract test passed for {'active', 'suspended'}
```

Nothing about this test touched `_accounts`, `get_account_status`, or any
real account data. It checked `can_purchase` against every status the
published contract currently names, confirming Growth's code is ready for
all of them — not just `"bob"` and `"alice"`, whichever accounts happened
to exist when someone last tested it by hand.

### Mechanical Walkthrough

- `for status in ACCOUNT_STATUSES:` — already-assumed iteration over a
  `set`; the entire mechanism of a **consumer contract test** is right
  here: loop over what the contract actually promises, not over whatever
  sample data happens to be lying around.
- `isinstance(result, bool)` — given full treatment above; a real,
  slightly stronger check than just "didn't crash" — it confirms
  `can_purchase` returns the specific type its own contract implies.

### CS Lens

This is Lesson 34's behavioral property, aimed specifically at a
contract boundary instead of a single function's own internal logic: not
"does this work for one example," but "does this hold for every value
the published contract allows" — checked directly, exhaustively, against
the small, closed set `ACCOUNT_STATUSES` actually names.

### SE Lens

This test costs Growth nothing in coordination — no need to ask Accounts
to spin up their service, no shared test environment, no scheduling
between two teams. It only costs knowing the shared contract, which
Lesson 36 already made real and published. That's the entire practical
appeal of contract testing over full integration testing: each side can
verify its own half, on its own schedule, against a shared, agreed
definition neither side has to run the other's code to check.

---

## Concept Unit: A Documented Contract Change, Caught Immediately

### The Problem

Accounts wants to add a real, new status — `"pending_verification"` —
and this time does it the way Lesson 36 argued they should: updating the
published `ACCOUNT_STATUSES` deliberately, as a real, visible contract
change, not a silent one.

### The Code, Run for Real

```python
ACCOUNT_STATUSES = {"active", "suspended", "pending_verification"}
```

Run Growth's identical consumer contract test against the updated
contract — with no changes to `can_purchase` at all:

```python
consumer_contract_test()
```

Here's what actually happens:

```text
$ python growth_tests.py
Traceback (most recent call last):
  File "growth_tests.py", line 18, in <module>
    consumer_contract_test()
  File "growth_tests.py", line 14, in consumer_contract_test
    result = can_purchase(status)
  File "growth_tests.py", line 10, in can_purchase
    raise AssertionError("unexpected account status: " + status)
AssertionError: unexpected account status: pending_verification
```

Growth's own test suite fails, immediately, the moment the published
contract changes — not weeks later, in production, against a real
`"carol"` account, the way Lesson 36's original failure played out.
Nobody had to deploy `accounts.py` anywhere near Growth's code for this
to be caught. Adding one value to a shared `set` was enough.

### The Concept

This is the actual payoff of a **contract test**, distinct from Lesson
36's runtime guard: the runtime guard catches a violation as it happens,
live, inside a real call. A contract test catches an *entire class* of
future violations — every status the contract allows, checked in
advance, in Growth's own build, before a single real account with that
status ever exists. Accounts changing `ACCOUNT_STATUSES` is now a change
that visibly breaks Growth's own tests immediately, giving Growth exactly
the warning Lesson 36's silent version denied them — and giving Accounts
a real, automatic signal that this specific change needs coordination
before it ships, rather than discovering that the hard way.

### CS Lens

This is the same discipline **consumer-driven contract testing** uses in
real, production systems at scale: a consumer publishes what it expects
from a provider as a real, checkable artifact; the provider runs the
consumer's own expectations against their own real implementation before
shipping a change, catching a break before it ever reaches a shared
environment where both systems have to be running together to notice.

### SE Lens

The realistic alternative — full integration tests, running both
`accounts.py` and `growth_signup.py` together for every change either
team makes — genuinely also catches this kind of break, but at a real
cost: both systems have to be deployable together, coordinated, and run
on every change, which grows expensive and slow as more teams and more
boundaries like this one accumulate. Contract tests trade some of that
integration confidence for something that scales far better across a
real organization: each team verifies their own half, fast, against a
shared definition, and only the contract itself — a small, explicit
artifact — needs to be agreed on between them.

---

## Connect the Pieces

One shared contract, tested from both directions:

1. **The consumer contract test, passing today** —
   `consumer_contract_test` checks `can_purchase` against every currently
   published status, with no call into `accounts.py` at all.
2. **A real, documented contract change** — Accounts adds
   `"pending_verification"` to `ACCOUNT_STATUSES`, exactly the visible,
   deliberate kind of change Lesson 36 argued for.
3. **Caught immediately, on Growth's own side** — the identical consumer
   test fails the moment the contract changes, without needing
   `accounts.py`'s real implementation running anywhere near it.

## What Breaks Without This

Rely only on Lesson 36's runtime guard and real, manual testing against
whichever accounts happen to exist, the way this domain's earlier
lessons did. Accounts adds `"pending_verification"`, documents it
correctly this time, and ships it. Growth's own test suite — checking
`can_purchase` only against `"bob"` and `"alice"`, the two accounts
anyone happened to write a test for — stays green. The break isn't
caught until a real customer's account reaches the new status, in
production, the exact failure this lesson's contract test exists to
catch in Growth's own build instead.

## Exercises

1. Write a provider contract test — a function that checks
   `get_account_status`'s real behavior for a set of known usernames
   against `ACCOUNT_STATUSES`, the way Lesson 36's own `assert` does
   internally, but as a standalone, separately runnable test.
2. Update `can_purchase` to correctly handle `"pending_verification"`
   (treat it the same as `"suspended"` — no purchase allowed until
   verified), and confirm the consumer contract test passes again with
   the updated contract.
3. Explain, in a few sentences, why `consumer_contract_test` looping over
   `ACCOUNT_STATUSES` is a stronger check than a handful of individually
   written test cases like `assert can_purchase("active") == True`. What
   real mistake could the individually written version miss that the
   loop-based version can't?

## Definition of Done

- [ ] You can define "contract test" in your own words, and distinguish
      a provider contract test from a consumer contract test.
- [ ] You've reproduced the real, immediate consumer-test failure caused
      by a documented contract change, with no `accounts.py` code
      running.
- [ ] You've completed all three exercises.
- [ ] Commit `consumer_contract_test` and your provider contract test
      from Exercise 1. Commit message should explain *why*: for example,
      `Lesson 38 — added contract tests for both sides of the accounts
      boundary, so a published contract change is caught in each team's
      own test suite instead of at runtime in production.`
