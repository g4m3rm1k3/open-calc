# Concept: Sticky (Modal) State

**What you'll understand by the end:** the specific pattern where a value, once set, stays in effect for every subsequent operation until something explicitly changes it — rather than resetting after each one.

**Prerequisites:** `python-classes-instances.md`.

## Setup

Python 3, no packages needed.

## The Problem

Some sequences of operations have a property where later ones implicitly depend on a setting established earlier, without needing to restate it every time. Recognizing this as a distinct, common pattern — rather than reinventing the same "remember the last setting" logic ad hoc each time it comes up — makes it easier to implement correctly and to recognize elsewhere.

## The Isolated Example

```python
class TextFormatter:
    def __init__(self):
        self.bold = False

    def apply(self, command):
        if command == "BOLD_ON":
            self.bold = True
        elif command == "BOLD_OFF":
            self.bold = False
        else:
            style = "**" if self.bold else ""
            return f"{style}{command}{style}"


f = TextFormatter()
for cmd in ["hello", "BOLD_ON", "world", "there", "BOLD_OFF", "again"]:
    result = f.apply(cmd)
    if result is not None:
        print(result)
```

**Real output:**
```
hello
**world**
**there**
again
```

**What this proves:** `"BOLD_ON"` was only stated once, yet both `"world"` and `"there"` came out bold — the setting *stuck* across multiple later operations without being restated on each one. `"again"`, after `"BOLD_OFF"`, correctly reverted. No command ever needs to say "and remember, bold is currently on" — that's exactly what makes this "modal": the mode persists implicitly until changed.

## Mechanical Walkthrough

- `self.bold` is the sticky state — set by `"BOLD_ON"`/`"BOLD_OFF"`, read by every other command.
- Commands that aren't mode-changers (`"hello"`, `"world"`, etc.) never touch `self.bold` — they only *read* whatever it currently holds.
- The entire "stickiness" is just: nothing resets `self.bold` between calls to `apply`. An instance attribute (see `python-classes-instances.md`) naturally persists this way — sticky state doesn't require any special mechanism beyond ordinary object state.

## CS Lens

This is **sticky state** (in some domains called "modal" state) — a specific shape of state distinguished by what changes it: only explicit mode-setting operations change it, while other operations merely read the currently active mode, and it never silently reverts on its own between operations.

Also recognized in: a text editor's current font/bold setting (stays on until turned off), a terminal's current working directory (`cd` changes it for every subsequent command, not just one), CSS's cascade and inheritance (a set property applies to all descendants until overridden), and a video game's currently equipped weapon (stays equipped across many turns until switched).

## SE Lens

The alternative — requiring every single operation to restate its full context explicitly (`"BOLD hello"`, `"BOLD world"`, `"BOLD there"`, `"PLAIN again"`) — is more verbose input, but removes any dependency on history: each operation is fully self-describing, with no need to know what came before it. Real-world formats overwhelmingly choose the sticky/modal form specifically because the common case (many operations in a row sharing the same setting) is far more frequent than the setting changing every single time — verbosity would dominate the common case to spare the rare one.

## Connection

Builds on `python-classes-instances.md` — sticky state is simply an instance attribute that specific operations update and other operations merely read. This is the general shape behind a G-code interpreter's motion mode, active tool, or active work-coordinate-system all persisting silently across many lines of a program until a line explicitly changes one of them.

## Try It Yourself

1. Add a second sticky mode, `self.uppercase`, toggled by `"UPPER_ON"`/`"UPPER_OFF"` commands, combinable with the bold state independently. Confirm both stick correctly and combine (bold + uppercase at once) when both are active.
2. Feed the formatter a sequence that never sends `"BOLD_ON"` at all. Confirm every result is plain, unstyled text — proof the *absence* of a mode-setting command means the previous default (here, `False`) simply continues, exactly as real modal defaults work.
3. Create two separate `TextFormatter` instances and interleave `.apply()` calls on both. Confirm each tracks its own bold state completely independently — the same per-instance isolation `python-classes-instances.md` demonstrated, now applied specifically to sticky state.
