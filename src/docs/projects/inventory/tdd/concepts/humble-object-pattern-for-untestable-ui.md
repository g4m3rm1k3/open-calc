# Concept: The Humble Object Pattern — Isolating Untestable UI From Testable Logic

**What you'll understand by the end:** why bundling real validation
and business logic *inside* the same method that shows a modal
dialog or file picker makes that logic impossible to test without
actually driving a real UI element, and the real fix: splitting it
into a "humble," deliberately trivial UI-facing wrapper and a separate,
fully-testable method holding all the real logic.

**Prerequisites:** `automated-testing-unit-test-basics.md`,
`test-doubles-and-mocking.md`.

## Setup

None — plain Python, no packages (the UI-specific parts are described,
not executed, since the whole point is that the logic under test never
touches one).

## The Problem

A method that both **shows a real dialog** and **validates/stores the
result** forces every test of its own real logic to also drive that
dialog — a real modal window, a real file picker, something that
either can't run at all in an automated/headless test environment, or
requires real, brittle UI-automation code just to exercise logic that
has nothing to do with dialogs at all.

## The Isolated Example

```python
class InventoryPanel:
    def __init__(self):
        self.items = []

    def add_item(self, name, quantity):
        # The REAL logic -- validating and storing -- lives here,
        # with no dialog/UI code anywhere in this method.
        if not name:
            raise ValueError("name cannot be empty")
        if quantity < 0:
            raise ValueError("quantity cannot be negative")
        self.items.append((name, quantity))

    def prompt_add_item(self):
        # The "humble" wrapper -- all it does is drive a real modal
        # dialog and hand the result to add_item. Deliberately as thin
        # as possible: nothing here is worth unit-testing on its own.
        name, quantity = self._show_real_dialog()  # would show a real QDialog
        self.add_item(name, quantity)


panel = InventoryPanel()

# A real, automated test drives add_item DIRECTLY -- no dialog, no
# QApplication, no modal event loop involved at all.
panel.add_item("End Mill 1/4in", 12)
panel.add_item("Drill 5mm", 5)
print("items:", panel.items)

try:
    panel.add_item("", 3)
except ValueError as e:
    print("ValueError:", e)
```

**Real output, run this session:**
```
items: [('End Mill 1/4in', 12), ('Drill 5mm', 5)]
ValueError: name cannot be empty
```

**What this proves:** every real behavior worth testing —
successfully adding two items, correctly rejecting an empty name —
was exercised by calling `add_item` **directly**, with zero real UI
involved anywhere in this test. `prompt_add_item`, the only method
that touches a real dialog, was never called at all; its own job is
so thin (call a dialog, forward the result) that there's genuinely
nothing left in it worth a dedicated automated test.

## Mechanical Walkthrough

- The method holding **real logic** (`add_item`) takes its inputs as
  **plain arguments** — a name, a quantity — never reaching out to a
  dialog, a file picker, or any other real UI element to get them
  itself.
- The method touching **real UI** (`prompt_add_item`) is kept
  deliberately **humble** — its only real job is showing the dialog
  and forwarding whatever it returns into the logic method; it
  contains no validation, no branching, nothing that would be worth
  testing on its own even if it could be.
- A real, automated test calls the logic method directly, supplying
  whatever inputs a real dialog *might* have produced, without ever
  constructing or driving the dialog itself.
- The **UI-facing wrapper still exists** and still gets used in the
  real, running application — this pattern doesn't remove the dialog,
  it just relocates every piece of *testable* behavior out of the one
  method that can't itself be easily tested.

## CS Lens

This is the real, named **Humble Object** pattern (from Gerard
Meszaros's xUnit Test Patterns): when a piece of code is inherently
hard to test in isolation — because it depends on something external,
slow, or non-deterministic, a real UI dialog being a textbook real
example — the fix isn't to force a real test through that hard part,
it's to make the hard part **as thin and logic-free as possible**
("humble"), moving every piece of genuinely testable behavior into a
separate collaborator that has no such dependency at all.

Also recognized in: a web request handler that does nothing but parse
the request and call a separate, plain business-logic function (the
handler itself stays humble and untested; the business logic gets
full unit-test coverage); the MVP (Model-View-Presenter) pattern's own
deliberately "dumb" View layer, with all real logic living in a
separately-testable Presenter.

## SE Lens

The real, practical payoff: test coverage for the logic that actually
has bugs to catch (validation rules, edge cases, error handling) with
none of the real flakiness, slowness, or platform-dependence that
driving an actual modal dialog in an automated test would introduce.
The real, honest cost: an extra method and an extra layer of
indirection for what might otherwise have been one combined method —
worth it specifically because the split is what makes the logic
testable at all, not testable *and slightly more elegant*.

## Connection

Builds on `automated-testing-unit-test-basics.md` and
`test-doubles-and-mocking.md` (the humble wrapper is itself a natural
place a test double would stand in, if it ever needed testing at all).
A real, applied instance in this project's own history: a tool-library
panel splitting its own real logic (`add_tool`, `add_holder`,
`import_from_source`) from a set of thin, dialog-owning `_prompt_*`
wrapper methods — every real validation and storage rule gets full,
direct, automated test coverage; only the genuinely untestable
dialog-driving code stays outside that coverage, and stays trivial
enough that its own correctness is obvious by inspection.

## Try It Yourself

1. Add a real, second logic method, `remove_item(name)`, plus its own
   humble `prompt_remove_item` wrapper — confirm the identical split
   lets `remove_item` be tested directly, with no dialog involved.
2. Write a real, automated test using a plain function as a stand-in
   for `_show_real_dialog` (returning a fixed `(name, quantity)` tuple)
   and call `prompt_add_item` through it — confirming even the humble
   wrapper *can* be tested this way if truly needed, though the far
   more valuable coverage already came from testing `add_item` alone.
3. Find a real method in a codebase you have access to that mixes UI-
   driving code and real logic in one function, and sketch how you'd
   split it the same way this file does — identifying exactly which
   lines would move into the new, separately-testable logic method.
