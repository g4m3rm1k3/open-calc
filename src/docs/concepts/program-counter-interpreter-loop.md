# Concept: An Interpreter Loop Driven by an Explicit Program Counter

**What you'll understand by the end:** how to interpret a small,
real program with loops by tracking an explicit **program counter**
(which line executes next) instead of a plain top-to-bottom scan, and
how pre-resolving `WHILE`/`END`-style pairs into a real **jump table**
lets the counter jump backward and forward correctly, in both
directions, without re-scanning the program to find a match every time.

**Prerequisites:** `sticky-state-modal-behavior.md`.

## Setup

Python 3, no packages needed.

## The Problem

A plain `for line in program:` walk visits every real line **exactly
once**, top to bottom — completely fine for a program with no real
control flow, but structurally unable to express "go back and run
these lines again" at all. A real language with loops needs something
that can move execution to an *earlier* line, then later move it back
*forward* past the loop once its real condition stops holding — a
single linear pass over the lines has no way to do either.

## The Isolated Example

The broken, naive approach — a single top-to-bottom pass:

```python
program = ["SET x 0", "WHILE x<3", "PRINT x", "SET x x+1", "END", "PRINT done"]

variables = {}
output = []
for line in program:
    if line.startswith("SET"):
        _, name, expr = line.split(" ", 2)
        variables[name] = eval(expr, {}, variables)
    elif line.startswith("PRINT"):
        _, name = line.split(" ", 1)
        output.append(variables.get(name, name))
    # WHILE/END: a single top-to-bottom pass has no way to jump backward at all

print(output)
```

**Real output, run this session:**
```
[0, 'done']
```

**What this proves:** the real, intended program should print `x` on
every one of three real loop iterations (`0`, `1`, `2`) before
`"done"` — the naive scan printed `x` exactly **once** (`0`) and then
moved straight on, because a plain `for` loop over the program's own
lines structurally visits each line a single time, with no real
mechanism to revisit `PRINT x` after `SET x x+1` runs.

The fix — an explicit program counter, plus a real jump table
pre-computed from matching `WHILE`/`END` pairs:

```python
def build_jump_table(lines):
    while_to_end = {}
    end_to_while = {}
    stack = []
    for i, line in enumerate(lines):
        if line.startswith("WHILE"):
            stack.append(i)
        elif line == "END":
            start = stack.pop()
            while_to_end[start] = i
            end_to_while[i] = start
    return while_to_end, end_to_while


def run(lines):
    while_to_end, end_to_while = build_jump_table(lines)
    variables = {}
    output = []
    pc = 0
    steps = 0
    while pc < len(lines):
        steps += 1
        line = lines[pc]
        if line.startswith("SET"):
            _, name, expr = line.split(" ", 2)
            variables[name] = eval(expr, {}, variables)
            pc += 1
        elif line.startswith("WHILE"):
            condition = line[len("WHILE"):]
            if eval(condition, {}, variables):
                pc += 1
            else:
                pc = while_to_end[pc] + 1  # jump PAST the matching END
        elif line == "END":
            pc = end_to_while[pc]  # jump BACK to re-check the condition
        elif line.startswith("PRINT"):
            _, name = line.split(" ", 1)
            output.append(variables.get(name, name))
            pc += 1
        else:
            pc += 1
    return output, steps


output, steps = run(program)
print("output:", output)
print("total steps executed:", steps)
```

**Real output, run this session:**
```
output: [0, 1, 2, 'done']
total steps executed: 15
```

**What this proves:** `x` genuinely printed on all three real
iterations (`0`, `1`, `2`) before `"done"` — the program counter
(`pc`) revisited lines `2`-`4` three separate times, something a plain
linear scan structurally cannot do. `steps: 15` — more than the
program's own `6` real lines — is direct, concrete proof execution
genuinely looped, re-running the same lines' own indices multiple
times rather than visiting each index once.

## Mechanical Walkthrough

- `pc` (the **program counter**) is a plain integer holding "which
  line index runs next" — nothing more exotic than that; every
  instruction's own job is to read `pc`, do its real work, and then
  set `pc` to whatever should run next (usually `pc + 1`, but not
  always).
- `build_jump_table` runs **once**, before real execution starts — a
  single pass using a real **stack** (`stack.append`/`stack.pop`) to
  correctly pair each `WHILE` with its own matching `END`, even when
  multiple loops appear in the same program (the stack ensures the
  *most recently opened* `WHILE` matches the *next* `END`
  encountered, correctly handling nested loops).
- At a `WHILE` line, the real condition is evaluated **fresh, every
  time** that line is reached — a false condition jumps `pc` forward
  past the loop's own matching `END` (using `while_to_end`, no
  re-scanning needed); a true condition just falls through to `pc +
  1`, entering the loop body.
- At an `END` line, `pc` unconditionally jumps **back** to its own
  matching `WHILE` (via `end_to_while`) — not into the loop body
  directly, so the condition gets **re-checked** on every real
  iteration, correctly stopping the loop the moment it goes false.
- Pre-computing both jump tables once, up front, means neither `WHILE`
  nor `END` ever has to re-scan the program to find its own partner at
  runtime — a real, worthwhile cost/benefit tradeoff, doing the
  matching work exactly once regardless of how many times a loop
  actually iterates.

## CS Lens

This is the real, foundational shape of how an actual CPU (or a
virtual machine/bytecode interpreter) executes a program: an explicit
**program counter** naming the next instruction, updated by each
instruction — usually incrementing by one, but able to be
**overwritten directly** (a jump) to implement any real control flow
(loops, conditionals, function calls) that a plain sequential counter
alone cannot express. Pre-resolving jump targets into a lookup table
before execution starts is the identical real technique an assembler
uses to resolve label names into concrete instruction addresses before
a program ever runs.

Also recognized in: any real bytecode VM (the Python interpreter's own
CPython bytecode includes real, explicit jump instructions for `while`
loops); a CPU's own instruction pointer/program counter register,
overwritten directly by a real branch instruction; a state machine
(per `sticky-state-modal-behavior.md`'s own related shape) where `pc`
is itself the "current state," and jump instructions are explicit,
data-driven state transitions rather than `if`-chain logic.

## SE Lens

The real, practical payoff of pre-computing the jump table once,
rather than searching for a matching `WHILE`/`END` every time one is
reached: a loop that runs a thousand real iterations only pays the
real cost of finding its own boundaries **once**, not a thousand
times — the exact same "compute once, reuse many times" tradeoff
behind caching generally. The real, honest risk this technique
introduces, absent from a plain linear scan: a **malformed** real
program (a `WHILE` with no matching `END`, or a condition that never
goes false) can make `pc` loop forever, something a single top-to-
bottom pass is structurally incapable of doing even by accident.

## Connection

Builds on `sticky-state-modal-behavior.md` for the general idea of
state persisting silently across iterations — `pc` is exactly that
kind of state, just specifically tracking "position in the program"
rather than a formatting mode. A real, applied instance in this
project's own history: a Fanuc-style macro interpreter resolving
`WHILE`/`DO`/`END` pairs into real `while_to_end`/`end_to_while`
dictionaries in one upfront pass, then running a `pc`-driven loop
evaluating conditions, variable assignments, and `IF`/`THEN` branches
— substituting every resolved `#variable` reference into literal text
before handing each resolved line to the project's own downstream
motion-parsing logic, letting a macro-driven program (where a single
source line can genuinely execute — and need to be re-parsed —
multiple times, once per real loop iteration) feed the identical code
path a plain, loop-free file already used.

## Try It Yourself

1. Add a second, real loop later in `program` (a fresh
   `WHILE`/`END` pair) and confirm `build_jump_table` correctly
   matches each `END` to its own, separate `WHILE` — real, direct
   proof the stack-based matching handles more than one loop in the
   same program.
2. Nest one `WHILE`/`END` pair **inside** another and confirm the
   stack-based matching still pairs each correctly — reasoning about
   why a stack (last-opened, first-closed) is specifically the right
   real structure for this, rather than, say, a plain counter.
3. Deliberately write a `WHILE` condition that never goes false (e.g.
   `WHILE 1<2`) and run it — after confirming (and then interrupting)
   that it genuinely never terminates, reason about what real,
   additional safeguard a production interpreter would need to protect
   against exactly this.
