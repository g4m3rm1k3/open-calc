# Lesson 75: Architectural Constraints

**What you will build.** `CreditCard.charge` logs a full card number in
plaintext — `charging $50 to card 4111111111111234` — a real,
demonstrated violation of a rule this system doesn't get a vote on: card
numbers must never appear in plaintext logs, a compliance requirement
imposed from outside any engineering tradeoff. This lesson fixes it with
`masked_card_number`, applied at the one place a card number is ever
turned into log text, so the raw number structurally can't reach a log
call from inside `charge` — and then proves, honestly, that a second,
unrelated function can still bypass it by reaching the private field
directly. The transferable problem: Lesson 74's quality attributes are
genuinely traded off, chosen deliberately based on what a system needs
more of; a **constraint** isn't traded against anything — it has to be
satisfied regardless of cost, and "we decided speed mattered more" is
never an acceptable answer to why cardholder data ended up in a log
file.

**What you need to know first.** Quality Attributes (Lesson 74) — the
contrast this lesson's own term depends on: a quality attribute is
chosen and traded off; a constraint is imposed and simply has to hold.
Boundary Design (Lesson 69) — `order_to_shipping_payload`'s own
technique, naming exactly what's allowed to cross a boundary, reused
here for exactly what's allowed to reach a log call.

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

Still the **Architecture** stage. Carried through: Lesson 74 showed a
real tradeoff between two properties a system could reasonably choose
between; this lesson shows a property that was never a choice at all —
the difference between "we decided" and "we were required to."

**Terms introduced in this lesson.** One line each.

- **architectural constraint** — a rule a system's architecture is
  required to satisfy, imposed from outside the engineering team's own
  tradeoff decisions: a regulation, a contractual obligation, an
  existing system that must be integrated with. It's distinguished from
  a quality attribute (Lesson 74) by whether it's actually negotiable —
  a quality attribute is traded against another; a constraint is
  satisfied, full stop, regardless of what it costs.
- **structural enforcement** — building a constraint into the shape of
  the code itself, so the constraint holds by construction rather than
  by every future engineer remembering a rule. It's the technique this
  lesson's fix uses, and its own real limit — proven honestly in "What
  Breaks Without This" — is the same one this curriculum has proven for
  every structural fix since Lesson 46: it protects the path that goes
  through it, not every possible path that could reach the same data.

**Objects and methods used.** None new — `logging` and ordinary string
formatting are already established; what's new is applying a boundary
function (Lesson 69's own technique) specifically to satisfy an external
requirement rather than an internal design decision.

## Concept Unit: A Rule the System Doesn't Get to Trade Away

### The Problem

`CreditCard.charge` logs what it's doing, including the card number it's
charging:

```python
import logging
logging.basicConfig(level=logging.INFO, format="%(message)s")
logger = logging.getLogger("payments")


class CreditCard:
    def __init__(self, number):
        self.number = number

    def charge(self, amount):
        logger.info(f"charging ${amount} to card {self.number}")
        return f"charged ${amount}"


card = CreditCard(number="4111111111111234")
card.charge(50)
```

This is illustrative, hand-built for this lesson, not a quoted line
range from any external system. Running it produces:

```
charging $50 to card 4111111111111234
```

The full card number is now sitting in plaintext, in a log file — a
real, serious violation of a rule this system was never given a choice
about. Nobody traded this away deliberately for a performance win or a
simpler implementation; the log line was just written the obvious way,
the same way `sorted_lines_by_price` once used `.sort()` the obvious
way in Lesson 67, and the constraint was simply never checked against.

### Project Change

- **Reference Source:** none — a from-scratch addition, not a port of
  an external reference codebase.
- **Files affected:** the payments logging code, modified.
- **Change type:** add — a `masked_card_number` function, applied at the
  one place a card number is formatted into a log message.
- **Location:** `CreditCard.charge`'s own body.
- **Dependencies:** none.

### The New Code

The smallest new piece is the masking function itself:

```python
def masked_card_number(number):
    return f"****-****-****-{number[-4:]}"
```

### The Updated Project

`charge` logs the masked form instead of the raw number, and `number`
becomes a private field, signaling — though, honestly, not enforcing —
that reaching it directly is exactly the mistake this lesson exists to
prevent:

```python
def masked_card_number(number):                                # ← new
    return f"****-****-****-{number[-4:]}"                        # ← new


class CreditCard:
    def __init__(self, number):
        self._number = number                                     # ← changed, renamed private

    def charge(self, amount):
        logger.info(f"charging ${amount} to card {masked_card_number(self._number)}")  # ← changed
        return f"charged ${amount}"
```

The raw card number now has exactly one path out of `CreditCard`'s own
`charge` method: through `masked_card_number`, every time, with no
branch or code path inside `charge` that could log the unmasked value
instead.

### Isolating the Concept: One Path Out, Always Masked

The mechanism doing the real work above — a boundary function that's
the only way a piece of sensitive data is allowed to become log text —
deserves to be seen on its own. Here it is protecting a social security
number from a support ticketing system's own logs:

```python
def masked_ssn(ssn):
    return f"***-**-{ssn[-4:]}"


def log_support_ticket(customer_id, ssn):
    print(f"ticket opened for customer {customer_id}, ssn {masked_ssn(ssn)}")


log_support_ticket(customer_id=17, ssn="000-12-3456")
```

Running it produces:

```
ticket opened for customer 17, ssn ***-**-3456
```

This is the identical technique `masked_card_number` uses, applied to a
different regulated fact: `log_support_ticket` has exactly one place a
raw SSN could reach a log line, and that place always calls
`masked_ssn` first. This throwaway example is now discarded;
`log_support_ticket` does not appear anywhere else in this lesson or
this project again.

### Mechanical Walkthrough

Working through every distinct syntactic element of the New Code block
above, in order:

- **`def masked_card_number(number):`** — a function taking the raw
  number and returning a new string, never mutating or storing anything.
- **`return f"****-****-****-{number[-4:]}"`** — an f-string combining a
  fixed masking pattern with `number[-4:]`, a slice taking the last four
  characters of `number` — the one part of a card number this system's
  own constraint still allows to appear in a log, for identification
  purposes, while the rest is permanently replaced with `*`.

### CS Lens

This is **data masking** (or **redaction**), a specific technique for
satisfying a **compliance constraint** — a rule imposed by a standard
like PCI-DSS for payment data, or by law for personal data like an SSN
or a medical record, rather than chosen by engineering judgment. The
constraint doesn't ask "is this convenient" or "is this fast" — it asks
"does the full, sensitive value ever appear somewhere it could leak,"
and the only acceptable answer is no, regardless of what enforcing that
costs in code complexity or logging verbosity.

Also recognized in: database column-level encryption required by
regulation regardless of query performance cost, data residency
requirements forcing specific cloud regions regardless of latency to
users elsewhere, and audit logging requirements mandating records be
kept for a legally specified duration regardless of storage cost.

### SE Lens

The principle is **build a constraint into the code's own shape, at the
one place the sensitive data would otherwise leak, rather than trusting
every future log statement to remember the rule** — the alternative
that was rejected, relying on code review or a style guide reminding
engineers "don't log card numbers," has the same honest weakness every
convention-based fix in this curriculum has already been shown failing:
it works exactly until one engineer, under deadline pressure, writes
`logger.info(f"... {card.number} ...")` without thinking about it,
because nothing in the code itself made that harder than the compliant
version. The real cost of this fix: every new place that legitimately
needs to reference a card number in a log now has to route through
`masked_card_number` deliberately — a small, real, ongoing discipline
requirement this fix reduces but, as the next section proves, doesn't
eliminate.

### Commands Needed

Running any of this lesson's scripts is `python <filename>.py` — the
`python` program, given one positional argument, executes that file's
statements top to bottom in a fresh interpreter process.

### Run It

Running the fixed `charge` against the identical card:

```python
card = CreditCard(number="4111111111111234")
card.charge(50)
```

The real output:

```
charging $50 to card ****-****-****-1234
```

The log line still identifies which card was charged — the last four
digits, exactly enough for a support engineer to match it against a
customer's own statement — and the full number never appears anywhere
in it.

### Connecting Back

Where Lesson 69 designed a boundary to keep an internal representation
from leaking to an external API by accident, this lesson designs a
boundary to keep a regulated value from leaking into a log by accident —
the same technique, satisfying a requirement this system was never
given the option to trade away.

## Connect the Pieces

Card `4111111111111234` was charged twice in this lesson, for the
identical amount. First, before the fix: the full number, in plaintext,
in a real log line — a genuine compliance violation, demonstrated, not
assumed. Second, after the fix: `****-****-****-1234`, the same
operation, the same log call site, with the constraint now satisfied by
construction, because `masked_card_number` sits on the only path a
number can take to become log text inside `charge`.

## What Breaks Without This

`masked_card_number` protects `charge`'s own log line. It does nothing
for a *second* function that reaches the private field directly:

```python
def refund(card, amount):
    logger.info(f"refunding ${amount} to card {card._number}")
    return f"refunded ${amount}"


refund(card, 20)
```

Run for real, this is what comes back:

```
refunding $20 to card 4111111111111234
```

The identical constraint, violated again, through a function that never
calls `masked_card_number` at all — the leading underscore on `_number`
is, once again, a convention, not a lock, the same honest limit this
curriculum has proven at every private-field boundary since Lesson 49.
`masked_card_number` makes the *correct* path easy; it does nothing to
stop a *different* path from being written the unsafe way, and a real
system satisfying this constraint reliably needs more than one fixed
function — it needs every place a card number could reach a log call
checked, or, better, tooling (a linter rule, a log-scrubbing proxy) that
catches the mistake even when a person doesn't.

## Exercises

1. Fix `refund` the same way this lesson fixed `charge` — route it
   through `masked_card_number` — and prove with real output that the
   identical operation no longer logs the raw number.
2. Write a `find_unmasked_card_numbers(log_text)` function using a
   regular expression that detects a 16-digit sequence appearing
   anywhere in a block of log text. Run it against both this lesson's
   broken and fixed log output, and use it as a real, mechanical check
   instead of reading log lines by eye.
3. Name one other place in this domain's own running example where a
   regulated or sensitive value might plausibly reach a log line or an
   external boundary without a masking step — a customer's shipping
   address (Lesson 54), an SSN if one were added to `Customer`. Sketch
   what the masking function would need to preserve and what it would
   need to hide.

## Definition of Done

- [ ] `charge` logs only `masked_card_number(self._number)`, never
      `self._number` directly.
- [ ] The Problem section's plaintext log has been reproduced for real,
      against the *original* version, before you apply the fix.
- [ ] The "Run It" scenario above runs against your own fixed file and
      produces output matching what's pasted here.
- [ ] The "What Breaks Without This" `refund` bypass has been run
      against your own file, not just read.
- [ ] Commit, with a message stating *why*: something like `compliance:
      mask card numbers before logging so charge no longer writes
      cardholder data in plaintext`, not `add masking function`.

Up next: Lesson 76, Architectural Boundaries — formalizing the line this
lesson's masking function sits on into a named, deliberate part of this
system's own architecture.
