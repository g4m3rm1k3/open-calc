# Lesson M1.4: One Object's Method Changing a Different Object

*File paths under mastercam-app/... refer to the real manufacturing-platform repository's mastercam-app folder. Paths under verification/... refer to that same repository's verification folder.*

**What you will build:** A throwaway proof that a real method on one object can reach into a second, real, separate object and change one of its own fields directly - not just change the object the method was called on. Then this app's own real `Sequence.add_operation` (mastercam-app/mastercam_app/parsing/parser.py:255-270), which uses exactly that to build a real, implicit linked list of operations, one real `.next` pointer at a time, while also growing a real dict of lists keyed by program - and `Sequence.regroup_operations_by_subprogram` (:294-339), which rebuilds that entire real structure from scratch using Lesson M0.2's own `extract_subprogram_number`. Backed by 12 real, already-passing tests (mastercam-app/tests/test_sequence.py). The transferable problem: a real method doesn't have to limit its own effects to the object it was called on - and knowing exactly which other real objects a method reaches out and changes is what makes a real codebase's own behavior predictable instead of surprising.

**What you need to know first:** Lesson M0.2's own `extract_subprogram_number`; Lesson M1.3's own `Operation` class and its real `next` field.

## Terms used in this lesson

- **in-place mutation across objects** — A real method, called on one object, directly changing a field on a real, different, separate object it has a reference to - not just changing `self`, the object the method itself was actually called on. It exists as a real, named idea specifically because it's easy to assume a method's own effects stay confined to `self` alone; `Sequence.add_operation`, below, is real, concrete proof that isn't a real guarantee at all.
- **implicit linked list** — A real chain of objects connected by each one holding a real reference to the next one in its own `next` field - "implicit" because nothing anywhere declares "this is a linked list"; the real structure exists only because `Operation`'s own real `next` field (Lesson M1.3) gets set, one real object at a time, by `Sequence.add_operation`, below.

## Objects and methods used

- **`Sequence.add_operation`**
  - *What it is:* A real, ordinary instance method that adds one real `Operation` into a real `Sequence`'s own operations, and, along the way, links it to whichever real operation was added immediately before it under the same real program key.
  - *Implementation:* `def add_operation(self, op: Operation, program_key: Optional[str] = None, link_global: bool = False):` at mastercam-app/mastercam_app/parsing/parser.py:255-270. Reads or creates a real list at `self.operations[prog]`, appends `op` to it, and, if a real, previous operation already exists for that same real program (tracked in `self._last_op_by_program`), sets that *other*, real, previous operation's own `next` field to `op` directly.
  - *Its use:* Called once per real `<OPERATION>` element this app's parser finds, from `parse_mastercam_xml` (a later lesson) - this is the real, one place every real operation actually enters a real sequence's own structure.
  - *Type:* A real, ordinary instance method on `Sequence`.
  - *Responsibility:* Record one real operation under its own real program key, and, if a real, earlier operation already exists for that same real program, connect the two by setting the earlier one's own real `next` field - never the new operation's own `next`, which starts real and `None` until something *after* it triggers the identical real update in turn.
  - *Depends on:* A real `Operation` to add, an optional real, explicit program key (falling back to `op.number` when not given), and this `Sequence`'s own real, already-existing `_last_op_by_program` dict to find what to link it to, if anything.
  - *Connects to:* Mutates a real, different `Operation` object's own `next` field directly - not `self`'s own fields alone. Read afterward by this app's own real coloring-book generation code (color.py), which walks each real operation's own `.next` chain to render balloons in the correct real order.
  - *Shape:* Returns nothing at all - every real effect is a mutation: either `self.operations` gains a real entry, or grows an existing one, and, separately, some *other* real `Operation` object's own `next` field may change too.

## Concept Unit: A Method Can Reach Past self and Change a Different, Real Object

### The Problem

`Sequence.add_operation` (Objects and methods, above) is called on one real `Sequence`, but it needs to connect two real, separate `Operation` objects to each other - neither of which is the `Sequence` itself. Before any real tool is shown: can a real method, called on object A, reach into a genuinely different, already-existing object B it has a reference to, and change one of B's own fields directly - or can a method only ever change the object it was called on?

Before reading on:

- If a real method does self.other_object.some_field = new_value, whose field actually changes - self's own, or other_object's?
- Given that, if a class kept a real reference to "the last item I added" and a new item came in, could a method connect the new item to the old one by changing a field on the old item directly, rather than the new one?
- Why might connecting them that direction - the earlier object pointing forward to the newer one - make more sense than the reverse, given items arrive one at a time, in order?

### Project Change

- **Reference Source:** No reference counterpart - a from-scratch, throwaway example proving the one real mechanism `Sequence.add_operation` (the unit right after this one) depends on.
- **Files affected:** `verification/mastercam-phase-01/lab_cross_object_mutation.py` (new)
- **Change type:** add
- **Location:** New file, no existing project to place it within.
- **Dependencies:** Nothing beyond Python's own standard library.

### The New Code

Two small, real, throwaway classes, typed fresh - a `Node` with its own real `next` field, and a `Chain` that connects each new real node to whichever one was added right before it:

**File:** `verification/mastercam-phase-01/lab_cross_object_mutation.py` (new)

```python
class Node:
    def __init__(self, label):
        self.label = label
        self.next = None


class Chain:
    def __init__(self):
        self.last_added = None

    def add(self, node):
        if self.last_added is not None:
            self.last_added.next = node
        self.last_added = node


chain = Chain()
first = Node("A")
second = Node("B")
chain.add(first)
chain.add(second)
print("first.next is second:", first.next is second)
print("second.next is:", second.next)
```

### Mechanical Walkthrough

- `class Node: ... self.next = None` — An already-familiar real class - one real field, `label`, plus `next`, real and `None` by default, the identical real shape as `Operation`'s own real `next` field (Lesson M1.3).
- `class Chain: ... self.last_added = None` — A second real class, tracking exactly one thing: a real reference to whichever real `Node` was most recently added - or `None`, before anything has been.
- `if self.last_added is not None: self.last_added.next = node` — Full treatment above (Terms, in-place mutation across objects) - `self` here is the real `Chain`, but the line being changed, `self.last_added.next`, belongs to a genuinely different, real `Node` object - the one added previously, not the one being added now, and not `Chain` itself.
- `self.last_added = node` — Only *this* line changes `Chain`'s own real field - updates `Chain`'s own record of "most recent," so the *next* real call to `add` will correctly link to `node`, whichever one that turns out to be.
- `chain.add(first) / chain.add(second)` — Two real, sequential calls - the first has no real, prior `last_added` yet, so it only updates `Chain`'s own field; the second finds `first` already there, and mutates `first`'s own real `next` field, directly, before updating `Chain`'s own record again.
- `first.next is second` — Read directly, in the outer, real scope - after both calls, confirming in Verification, below, that `first`, a real object never itself passed to the second `chain.add(second)` call, was still genuinely changed by it.

### CS Lens

This is a real, explicit **linked list**, built one real node at a time - each real node knows only the one real node after it, and nothing connects them into a single structure except those real, individual `.next` references. Also recognized in: a real scavenger hunt (each real clue only ever points to the next one, never the whole sequence at once), a real chain of command (each real person only knows who they report to next, not the entire org chart), and a real train (each real car is coupled only to the one immediately behind it).

### SE Lens

The real design principle this pattern trades on: **a method's own real effects are not limited to `self`** - anything it holds a real reference to is fair game. The real alternative not chosen: giving `Chain` its own real list of every node, in order, and deriving "what comes after `first`" by searching that list for `first`'s own real position every time it's needed. That alternative avoids ever mutating a `Node` from outside itself - the real, honest cost this app's own chosen design accepts instead: a reader looking only at `Operation`'s own class definition (Lesson M1.3) would never guess its `next` field gets set by a completely different class's own method, unless they also read `Sequence.add_operation` directly - the real connection between the two classes isn't visible from either one alone.

### Commands needed

- `python verification/mastercam-phase-01/lab_cross_object_mutation.py` — Runs the real, throwaway file directly with the real Python interpreter, from inside manufacturing-platform's own repo root.

### Verification

```text
first.next is second: True
second.next is: None
```

Full saved run: `verification/mastercam-phase-01/lab_cross_object_mutation_output.txt`.

### Connection to the previous unit

There is no previous unit - this is the first one in this lesson.

## Concept Unit: add_operation Grows a Dict of Lists and Links Operations Together at the Same Time

### The Problem

A real `Sequence` needs to hold many real operations, grouped by real program key, *and* know which real operation immediately followed which, within each real group. Given the unit above's own real proof that a method can mutate a different, real object: would `Sequence` need two entirely separate real passes over its own operations to build both of those real structures - the grouped dict, and the linked chain - or can one real method build both at once, incrementally, as each real operation arrives?

Before reading on:

- If Sequence only tracked "the last operation added to program X," for every real program X separately, would that be enough information to link a new operation to the correct real previous one, even with several real programs interleaved?
- Given the unit above, what real, single line would connect a new operation to that real, tracked previous one?
- Why might a real Sequence need a genuinely separate dict, _last_op_by_program, instead of just checking the last item in self.operations[prog] directly?

### Project Change

- **Reference Source:** mastercam-app/mastercam_app/parsing/parser.py:255-270 (quoted in
full, the real, whole method):
def add_operation(self, op: Operation, program_key: Optional[str] = None,
                  link_global: bool = False):
    prog = program_key if program_key is not None else op.number
    if prog is None:
        raise ValueError("Program key is None.")
    if prog not in self.operations:
        self.operations[prog] = []
    prev = self._last_op_by_program.get(prog)
    if prev is not None:
        prev.next = op
    self.operations[prog].append(op)
    self._last_op_by_program[prog] = op
    if link_global:
        if self._all_ops:
            self._all_ops[-1].next = op
        self._all_ops.append(op)
- **Files affected:** `mastercam-app/mastercam_app/parsing/parser.py` (existing), `mastercam-app/tests/test_sequence.py` (new)
- **Change type:** none
- **Location:** mastercam-app/mastercam_app/parsing/parser.py already exists. mastercam-app/tests/test_sequence.py is a new, real, permanent test file, already written and passing this session.
- **Dependencies:** The unit above's own real proof of cross-object mutation - `prev.next = op`, below, is the identical real mechanism.

### The Updated Project

`add_operation`'s own real body, already existing, read directly:

**File:** `mastercam-app/mastercam_app/parsing/parser.py` (already exists — read-only, nothing to type)

```python
def add_operation(self, op: Operation, program_key: Optional[str] = None,
                  link_global: bool = False):
    prog = program_key if program_key is not None else op.number
    if prog is None:
        raise ValueError("Program key is None.")
    if prog not in self.operations:
        self.operations[prog] = []
    prev = self._last_op_by_program.get(prog)
    if prev is not None:
        prev.next = op
    self.operations[prog].append(op)
    self._last_op_by_program[prog] = op
    if link_global:
        if self._all_ops:
            self._all_ops[-1].next = op
        self._all_ops.append(op)
```

### Mechanical Walkthrough

- `prog = program_key if program_key is not None else op.number` — A real conditional expression (the identical shape already established in Lesson M1.1) - uses the real, explicit `program_key` if one was given at all, falling back to `op.number` only when it wasn't. Confirmed as two real, separate paths by `test_add_operation_uses_op_number_as_default_program_key` and `test_add_operation_accepts_explicit_program_key_overriding_op_number`.
- `if prog is None: raise ValueError("Program key is None.")` — A real, ordinary guard - if `op.number` was itself `None` *and* no explicit `program_key` was given either, there's genuinely no real key to file this operation under, so this raises rather than silently using a real, made-up default, confirmed by `test_add_operation_raises_when_both_program_key_and_op_number_are_none`.
- `if prog not in self.operations: self.operations[prog] = []` — Grows `self.operations`, a real dict of lists, one real key at a time - the first real operation under any given real program creates that program's own real, empty list first.
- `prev = self._last_op_by_program.get(prog)` — A real dict `.get()` call - returns the real, previous operation filed under this same real program, or real `None` if this is the first one for it. `_last_op_by_program` is a real, second dict, separate from `self.operations`, existing specifically to answer "what was the real, most recent operation for program X" in one real step, without re-reading `self.operations[prog]`'s own last real element every time.
- `if prev is not None: prev.next = op` — Full treatment above (Terms, in-place mutation across objects) - the identical real mechanism as the unit above's own throwaway `Chain.add`, now against this app's own real `Operation` objects.
- `self.operations[prog].append(op) / self._last_op_by_program[prog] = op` — Two real, separate updates, both real and necessary: the first adds `op` to its own real group; the second makes `op` itself the new real "most recent" for this program, so the *next* real call to `add_operation` links correctly to it instead of to `prev`.
- `if link_global: ...` — A real, optional, second chain - identical real shape to the per-program chain above it, but tracking one real, global "most recently added, regardless of program" instead, confirmed by `test_add_operation_with_link_global_chains_across_different_programs` to link operations from genuinely different real programs together when this real flag is set.

### CS Lens

This is the identical real **linked list** concept from the unit above, now maintained incrementally, one real method call at a time, alongside a real dict grouping the same real objects a second, independent way - proving one real object can genuinely belong to two different real structures (a grouped dict, and a linked chain) built by the same real method call.

### SE Lens

The real design principle: **paying a small, real, ongoing bookkeeping cost (`_last_op_by_program`) to avoid a real, repeated search later**. The real alternative not chosen: dropping `_last_op_by_program` entirely, and finding "the real, previous operation for this program" by reading `self.operations[prog][-1]` directly, right before appending the new one. That alternative would work identically for this specific real case - the real, honest reason it isn't done that way: `_last_op_by_program` also answers the identical real question in `regroup_operations_by_subprogram` (a later unit) without needing to re-derive it from scratch there either, at the real, small memory cost of a real, second dict that always just duplicates what `self.operations`'s own last elements would already tell you.

### Verification

```text
collected 12 items

tests/test_sequence.py::test_add_operation_uses_op_number_as_default_program_key PASSED
tests/test_sequence.py::test_add_operation_accepts_explicit_program_key_overriding_op_number PASSED
tests/test_sequence.py::test_add_operation_raises_when_both_program_key_and_op_number_are_none PASSED
tests/test_sequence.py::test_add_operation_links_next_pointer_between_ops_sharing_a_program PASSED
tests/test_sequence.py::test_add_operation_with_link_global_chains_across_different_programs PASSED
tests/test_sequence.py::test_get_programs_returns_the_real_dict_keys_in_order PASSED
tests/test_sequence.py::test_iter_all_ops_falls_back_to_flattening_operations_dict_when_all_ops_empty PASSED
tests/test_sequence.py::test_to_dict_nests_tool_and_every_operation PASSED
tests/test_sequence.py::test_regroup_reassigns_keys_using_O_prefixed_comment_numbers PASSED
tests/test_sequence.py::test_regroup_falls_back_to_sequence_number_when_comment_has_no_number PASSED
tests/test_sequence.py::test_regroup_on_sequence_with_no_operations_does_nothing_and_does_not_raise PASSED
tests/test_sequence.py::test_regroup_relinks_next_pointers_within_each_new_group PASSED

12 passed in 0.08s
```

Full saved run: `mastercam-app/tests/test_sequence.py`.

### Connection to the previous unit

The unit above proved one real object's method can mutate a different, real object directly; this unit showed `Sequence.add_operation` using that exact mechanism to maintain a real, implicit linked list per program, alongside a real dict grouping those same real operations a second, independent way - both built incrementally, one real call at a time. (This lesson's own real dataclasses citation covers `regroup_operations_by_subprogram` too - its own real mechanism, re-keying by `extract_subprogram_number`, already received full treatment in Lesson M0.2, and this lesson's real test suite, `test_regroup_*`, confirms it still holds against this exact `Sequence` class.)

## Connect the pieces

Two real operations, added to the same real `Sequence`, followed through both units: the first unit proved, with a throwaway `Chain`/`Node` pair, that one real object's method can reach past itself and change a genuinely different, already-existing object's own field. The second unit showed this app's own real `Sequence.add_operation` doing exactly that, twice over, for real - growing `self.operations`, a real dict of lists, while separately setting the *previous* real operation's own `.next` field to point at the one just added, using `_last_op_by_program` to know which real operation that was without re-deriving it. All twelve of this lesson's own real claims about `Sequence` are backed by mastercam-app/tests/test_sequence.py.

**Next lesson:** Part and parse_mastercam_xml - the real top-level container, and the real orchestration logic that decides which operations belong in which sequence at all, including a real, concrete "+200" rule for when the identical real tool number gets used again, non- consecutively, in the same real part.