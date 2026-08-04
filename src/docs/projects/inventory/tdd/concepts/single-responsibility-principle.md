# Concept: The Single Responsibility Principle

**What you'll understand by the end:** what it really means for a unit
of code to have "one reason to change," how to spot when a function or
module actually has more than one, and why splitting it matters
concretely, not just stylistically.

**Prerequisites:** `avoid-premature-abstraction.md`.

## Setup

Python 3, no packages needed.

## The Problem

A single function can quietly grow to do two genuinely different real
jobs at once — say, turning raw text into clean tokens, *and* deciding
what those tokens mean. As long as both jobs are simple, combining them
feels harmless. The real cost shows up the moment either job needs to
change on its own: a change to comment syntax and a change to what
counts as a valid setting are two unrelated reasons to edit the same
function, and neither change can be made, tested, or reasoned about
without touching the other's code too.

## The Isolated Example

Before — one function, two real reasons to change:
```python
import re

def parse_setting_combined(line):
    line = re.sub(r"#.*", "", line).strip()  # tokenizing concern
    if not line:
        return None
    key, _, value = line.partition("=")       # interpreting concern
    return {"key": key.strip(), "value": value.strip()}

print(parse_setting_combined("timeout = 30  # seconds"))
```

After — split so each function has exactly one:
```python
def tokenize_setting_line(line):
    """Changes only if the raw-text format changes (comment style, etc.)."""
    return re.sub(r"#.*", "", line).strip()

def interpret_setting_tokens(clean_line):
    """Changes only if what a setting MEANS changes (key/value shape, etc.)."""
    if not clean_line:
        return None
    key, _, value = clean_line.partition("=")
    return {"key": key.strip(), "value": value.strip()}

def parse_setting(line):
    return interpret_setting_tokens(tokenize_setting_line(line))

print(parse_setting("timeout = 30  # seconds"))
print(tokenize_setting_line("retries = 3 # attempts"))
print(interpret_setting_tokens("retries = 3"))
```

**Real output, run this session:**
```
{'key': 'timeout', 'value': '30'}
{'key': 'timeout', 'value': '30'}
retries = 3
{'key': 'retries', 'value': '3'}
```

**What this proves:** the split version produces the identical real
result through `parse_setting`, but now `tokenize_setting_line` and
`interpret_setting_tokens` can each be called, tested, and changed
completely on their own — the last two lines of output show each half
working correctly in total isolation from the other, something the
combined version never allowed.

## Mechanical Walkthrough

- `parse_setting_combined` mixes a *syntactic* concern (what counts as
  a comment, how to strip it) with a *semantic* one (what a clean line
  actually means) in the same function body — a change to either
  concern means editing, and re-testing, the whole function.
- `tokenize_setting_line` owns only the syntactic concern; a future
  change (say, supporting `;`-style comments too) touches only this
  function.
- `interpret_setting_tokens` owns only the semantic concern; a future
  change (say, supporting nested keys like `db.host`) touches only this
  one, never the tokenizer.
- `parse_setting` composes the two — the real, observable behavior for
  a normal caller doesn't change at all; what changes is that each real
  *reason to change* now maps to exactly one real place in the code.

## CS Lens

This is the **Single Responsibility Principle**, the "S" in SOLID: a
unit of code should have exactly one real reason to change — one real
actor, concern, or requirement it answers to. "Responsibility" here
means a *reason to change*, not "does more than one line of work" —
a function can do several small steps and still have one responsibility
if they all serve the same real concern, and a one-line function can
still violate SRP if that one line answers to two genuinely unrelated
requirements at once (which isn't the case here, but is a real,
common confusion worth naming directly).

Also recognized in: a class that both reads a file *and* renders it to
the screen (two real reasons to change: the file format, and the
display logic); a web handler that both validates a request *and*
writes to the database (two real reasons: what counts as valid input,
and how data gets persisted).

## SE Lens

The real, concrete test worth asking: "if requirement A changes, and
requirement B doesn't, do I have to touch this same code either way?"
If yes, more than one responsibility is living in one place. The real,
honest cost on the other side: splitting too eagerly, before two real,
independent reasons to change actually exist, just adds indirection for
no real benefit — this principle and `avoid-premature-abstraction.md`'s
own judgment call pull in the same real direction: split when a second,
genuinely independent concern is *actually present*, not preemptively
because a function merely has more than one line in it.

## Connection

Builds on `avoid-premature-abstraction.md` — the same judgment call
(is there a real, current reason to separate this, or not yet) applied
specifically to *why* a unit of code might need to change, rather than
whether it's reused elsewhere. Directly relevant to
`layered-architecture-dependency-direction.md`: separating a
tokenizing concern from an interpreting one is the same real shape as
separating core logic from a delivery mechanism — different concerns,
kept independently changeable.

## Try It Yourself

1. Change `tokenize_setting_line` to also support `;`-prefixed
   comments, and confirm `interpret_setting_tokens` needed zero changes
   to keep working correctly.
2. Change `interpret_setting_tokens` to reject empty keys (return
   `None` if `key.strip()` is empty), and confirm `tokenize_setting_
   line` needed zero changes.
3. Deliberately re-merge the two functions back into one, then try to
   make *both* changes from steps 1 and 2 at once in the merged version.
   Notice how much harder it is to be confident neither change
   accidentally affected the other's real behavior, compared to making
   them independently against the split version.
