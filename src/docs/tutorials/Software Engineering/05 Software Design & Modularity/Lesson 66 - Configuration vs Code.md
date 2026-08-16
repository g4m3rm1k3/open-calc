# Lesson 66: Configuration vs Code

**What you will build.** Which payment methods are currently enabled is
written as a hardcoded Python set, `ENABLED_PAYMENT_METHODS`, right in
`payments.py`. A fraud spike means `gift_card` needs to be disabled
right now — and doing that means editing Python source and redeploying
the whole service, the same cost as fixing an actual bug, for a decision
that has nothing to do with how the code itself works. This lesson
moves that decision into a JSON config file, read at runtime, so
disabling `gift_card` becomes editing one line of data with no code
change and no redeploy at all. The transferable problem: not every value
a program depends on is the same kind of fact — some are genuinely about
how the code works and belong in source; some are about the world right
now, change on a different schedule than the code does, and belong
outside it entirely.

**What you need to know first.** Extension Points (Lesson 65) — the
payment-method registry this lesson's config now decides which entries
of are actually active. Business Rules (Lesson 47) — a named function
answering one question, the same shape `is_payment_method_enabled`
reuses here.

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

Still the **Design** stage, though this lesson's whole point is a
decision that shouldn't have to travel through *Implementation* and
*Deployment* every time it changes — a config-driven value can move
straight from a decision to *Operations* without ever touching the code
stages in between, which is exactly the gap between "code" and
"configuration" this lesson names.

**Terms introduced in this lesson.** One line each.

- **configuration** — a value that controls a system's behavior but
  lives outside the program's own source code, in a file, environment
  variable, or external store that can be changed without editing or
  redeploying the code that reads it. It's distinguished from an
  ordinary constant by *who* can change it and *how fast* — not by the
  value's type or its role at runtime.
- **hardcoded value** — a value baked directly into a program's source
  code that needed to change based on circumstances the code itself
  can't predict — which payment methods are enabled today, this
  environment's own limits — but was written as if it were a fixed fact
  about how the program works. It's the specific mistake this lesson's
  Problem section demonstrates, and the thing "configuration" is the
  fix for.

**Objects and methods used.**

- **`json.load(file)`** (from Python's standard-library `json` module)
  - *What it is:* a function that reads JSON-formatted text from an
    already-open file object and returns the equivalent Python value —
    typically a `dict`, for a JSON object.
  - *Implementation:* `json.load(f)`, given a file object opened for
    reading, parses its entire contents as JSON and returns the parsed
    Python structure; a JSON object like `{"enabled_payment_methods":
    [...]}` becomes an ordinary Python `dict` with the same key.
  - *Its use:* this lesson uses it to read `payments_config.json` fresh,
    each time `is_payment_method_enabled` is asked, so an edit to the
    file is picked up the next time anything actually asks the
    question — no restart, no redeploy, no code change.
- **`open(path)`** (Python's built-in file-opening function, used with
  the `with` statement)
  - *What it is:* the built-in that opens a file on disk and returns a
    file object; `with open(path) as f:` ensures the file is
    automatically, correctly closed once the indented block finishes,
    even if an error happens partway through.
  - *Implementation:* `with open(path) as f:` binds `f` to the open file
    for the duration of the indented block; `json.load(f)` reads from it
    inside that block.
  - *Its use:* this lesson uses it to actually reach the config file on
    disk, the one piece of this fix that lives outside the running
    program's own source entirely.

## Concept Unit: A Decision That Shouldn't Need a Redeploy to Change

### The Problem

Which payment methods are currently accepted is written directly into
`payments.py`:

```python
ENABLED_PAYMENT_METHODS = {"credit_card", "paypal", "gift_card"}


def is_payment_method_enabled(name):
    return name in ENABLED_PAYMENT_METHODS


print("gift_card enabled:", is_payment_method_enabled("gift_card"))
```

This is illustrative, hand-built for this lesson, not a quoted line
range from any external system. Running it produces:

```
gift_card enabled: True
```

A fraud spike hits gift cards specifically, and the decision to disable
them right now belongs to a fraud-operations team, not a programmer —
but the only way to change `ENABLED_PAYMENT_METHODS` is to edit this
Python file and push it through this system's own build, test, and
deployment pipeline, the identical process a real bug fix would need,
for a decision that has nothing to do with whether the code itself is
correct. Every hour that pipeline takes is an hour gift cards stay
accepted after the decision to stop accepting them was already made.

### Project Change

- **Reference Source:** none — a from-scratch addition, not a port of
  an external reference codebase.
- **Files affected:** `payments.py`, modified; a new `payments_config.json`.
- **Change type:** refactor — `ENABLED_PAYMENT_METHODS` moves from a
  Python constant to a value read from a config file at call time.
- **Location:** `is_payment_method_enabled`'s own body.
- **Dependencies:** none — `json` is a Python standard-library module,
  no install needed.

### The New Code

The smallest new piece is the function that reads the config file:

```python
def load_enabled_payment_methods(path="payments_config.json"):
    with open(path) as f:
        config = json.load(f)
    return set(config["enabled_payment_methods"])
```

### The Updated Project

`is_payment_method_enabled` no longer checks a fixed Python set — it
calls the new loader every time it's asked:

```python
import json


def load_enabled_payment_methods(path="payments_config.json"):        # ← new
    with open(path) as f:                                              # ← new
        config = json.load(f)                                            # ← new
    return set(config["enabled_payment_methods"])                        # ← new


def is_payment_method_enabled(name, path="payments_config.json"):      # ← changed
    return name in load_enabled_payment_methods(path)                    # ← changed
```

Alongside it, `payments_config.json` holds the actual, current decision
as plain data:

```json
{
  "enabled_payment_methods": ["credit_card", "paypal", "gift_card"]
}
```

`is_payment_method_enabled`'s own source no longer names any specific
payment method anywhere — every name it checks against now lives
entirely in the JSON file, editable by anyone who can reach it, with no
Python knowledge required at all.

### Isolating the Concept: A Value Read From a File Instead of Written Into One

The mechanism doing the real work above — reading a value from an
external file at call time instead of hardcoding it into source — is
small enough to see directly through an unrelated example rather than a
separate throwaway one built solely to demonstrate `json.load` in
isolation, since the mechanism genuinely is just these two functions:

```python
import json


def load_max_login_attempts(path="app_config.json"):
    with open(path) as f:
        return json.load(f)["max_login_attempts"]


print("max login attempts:", load_max_login_attempts())
```

Running it, against a config file containing `{"max_login_attempts":
3}`, produces:

```
max login attempts: 3
```

This is the identical mechanism `load_enabled_payment_methods` uses,
applied to a single number instead of a list of names: `open` reaches
the file, `json.load` parses it, and the returned value is exactly
whatever the file currently says — changeable by editing the file, with
zero Python code involved in making that change. This throwaway example
is now discarded; `load_max_login_attempts` does not appear anywhere
else in this lesson or this project again.

### Mechanical Walkthrough

Working through every distinct syntactic element of the New Code block
above, in order:

- **`def load_enabled_payment_methods(path="payments_config.json"):`**
  — a function taking one parameter with a default value, the path to
  the config file, so callers can point at a different file (a test
  fixture, say) without needing to change this function's own body.
- **`with open(path) as f:`** — opens the file at `path` for reading,
  binding it to `f` for the duration of the indented block, and
  guaranteeing it's closed automatically once that block ends, even if
  `json.load` itself were to raise an error partway through.
- **`config = json.load(f)`** — reads and parses the entire file's
  contents as JSON, returning a Python `dict` — here, one with a single
  key, `"enabled_payment_methods"`, whose value is a JSON array, parsed
  into an ordinary Python `list`.
- **`return set(config["enabled_payment_methods"])`** — looks up that
  key and converts the resulting list into a `set`, so
  `is_payment_method_enabled`'s own `in` check behaves exactly the way
  it did against the original hardcoded set.

### CS Lens

This is the general principle of **externalized configuration**:
separating a program's own logic (how it decides whether a payment
method is enabled, given a set of enabled names) from the specific data
that logic currently operates on (which names are actually in that set,
right now). The same separation shows up as environment variables
configuring a program's connection strings without the program's source
mentioning any specific database, feature flags toggling behavior for a
subset of users without a code change, and a compiler's own
command-line flags controlling optimization behavior without the
compiler's source itself changing per invocation.

Also recognized in: a web server's own config file controlling which
port it listens on, a game's difficulty settings stored in a save file
rather than hardcoded per difficulty level, and Kubernetes' `ConfigMap`
objects, which exist specifically to let an application's behavior
change without rebuilding its container image.

### SE Lens

The principle is **match how fast a value needs to change to where it's
allowed to live** — a value that changes on the same schedule as the
code (an algorithm's own internal constant, a fixed business rule
Lesson 47 already gave its own name) belongs in source, reviewed and
tested the same way the logic around it is. A value that changes on a
*different*, often faster schedule — which payment methods are currently
trusted, today's rate limit, this environment's specific timeout — being
stuck in source forces it to move at code's slower, safer, but much
more expensive pace. The real cost of the fix: `payments_config.json`
now sits entirely outside this codebase's own test suite and code
review process by default — a config file with a typo in it fails
differently, and often more silently, than a Python syntax error would,
which is a real, ongoing risk this lesson's fix introduces in exchange
for the speed it buys.

### Commands Needed

Running any of this lesson's scripts is `python <filename>.py`, from the
directory containing both the script and `payments_config.json` — the
`python` program, given one positional argument, executes that file's
statements top to bottom, reading whatever local files it opens along
the way.

### Run It

Editing only `payments_config.json` — no Python file touched at all —
to remove `gift_card`:

```json
{
  "enabled_payment_methods": ["credit_card", "paypal"]
}
```

Then rerunning the identical check, against the identical, unmodified
`payments.py`:

```python
print("gift_card enabled after editing only the config file, no code change:", is_payment_method_enabled("gift_card"))
print("credit_card still enabled:", is_payment_method_enabled("credit_card"))
```

The real output:

```
gift_card enabled after editing only the config file, no code change: False
credit_card still enabled: True
```

`gift_card` is now correctly reported as disabled, and `credit_card`
remains correctly enabled — both facts came from one edited line of
JSON, with `payments.py` itself never opened, never edited, and never
redeployed. The exact operational decision that used to require a full
code deployment now takes effect the moment the file is saved and the
next call happens to run.

### Connecting Back

Where Lesson 65 made adding a new payment *type* require zero code
changes, this lesson makes changing which types are currently *enabled*
require zero code changes too — together, the two lessons separate
"what kinds of payment exist" (a code decision) from "which of them are
active right now" (a configuration decision) cleanly.

## Connect the Pieces

Whether `gift_card` is enabled was checked twice in this lesson, with
the identical `is_payment_method_enabled("gift_card")` call both times.
First, against the hardcoded `ENABLED_PAYMENT_METHODS` set:
`True`, changeable only by editing `payments.py` and redeploying.
Second, against `payments_config.json`, after editing only that file:
`False`, with `payments.py`'s own source completely untouched between
the two runs — proving the decision genuinely moved out of code and into
data that changes on its own, faster schedule.

## What Breaks Without This

Reading configuration from a file trades one risk for another: a typo in
`payments_config.json` fails very differently from a typo in Python
source:

```json
{
  "enabled_paymant_methods": ["credit_card", "paypal"]
}
```

Running `is_payment_method_enabled("credit_card")` against this
misspelled config produces:

```
KeyError: 'enabled_payment_methods'
```

No syntax highlighting caught the typo, no test suite ran against this
specific file's exact spelling before it reached a real running program,
and the failure only appears the moment something actually calls
`is_payment_method_enabled` — potentially far later, and in a very
different place, than wherever the file was actually edited. Moving a
decision into configuration doesn't remove the risk of getting it wrong;
it moves that risk out of the safety net — type checking, linting,
code review, a test suite — that source code normally has and a loose
JSON file usually doesn't, unless a project deliberately builds one for
its own config files too.

## Exercises

1. Write a `validate_payments_config(path)` function that checks the
   config file actually has an `"enabled_payment_methods"` key holding a
   list, raising a clear error naming the actual problem if it doesn't.
   Run it against the misspelled config above and compare its error
   message to the raw `KeyError`.
2. `load_enabled_payment_methods` re-reads the file from disk on every
   single call. Name one real cost of that, and one real benefit,
   using this lesson's own fraud-spike scenario to argue which one
   matters more for this specific piece of configuration.
3. `Order`'s own `ORDER_TRANSITIONS` table, from Lesson 46, is currently
   hardcoded Python. Using this lesson's own test — how fast does this
   value need to change, and who needs to be able to change it — argue
   whether it should stay as code or move to configuration.

## Definition of Done

- [ ] `payments.py` contains no hardcoded set of enabled payment method
      names anywhere.
- [ ] `payments_config.json` exists and holds the real, current list.
- [ ] The Problem section's hardcoded version has been run for real
      before you apply the fix, to see the original behavior.
- [ ] The "Run It" scenario above has been reproduced for real — edit
      the config file yourself, don't just read the pasted output — and
      produces output matching what's shown here.
- [ ] The "What Breaks Without This" misspelled-key scenario has been
      run against your own file, not just read.
- [ ] Commit, with a message stating *why*: something like
      `configuration: move enabled payment methods out of Python source
      into payments_config.json so disabling one doesn't require a
      redeploy`, not `add json config`.

Up next: Lesson 67, Side Effects — naming precisely what changes when
code like `load_enabled_payment_methods` reaches outside itself to read
a file, and why that matters for reasoning about a function's own
behavior.
