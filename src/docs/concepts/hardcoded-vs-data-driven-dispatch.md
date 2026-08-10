# Concept: Hardcoded Dispatch vs. Data-Driven Dispatch

**What you'll understand by the end:** why the same real problem — "run
different logic depending on which code came in" — sometimes gets solved
with a fixed switch statement and sometimes with a lookup into
per-configuration data, and how to tell which one a real situation
actually calls for.

**Prerequisites:** `dict-as-lookup-table.md`.

## Setup

Any Python 3 install, no packages needed.

## The Problem

Both G-codes and M-codes in real G-code are "a number that means a
specific action" — the same shape of problem on the surface. But G-codes
mean close to the same thing across every real Fanuc-family control
(`G0` is always rapid), while M-codes are notoriously inconsistent
machine-to-machine — one builder's `M43` might mean something a Fanuc
mill's `M43` never does. Code that dispatches on either has to decide:
is the mapping from number to meaning fixed enough to write directly
into the code, or does it genuinely vary by which real machine is
running the program?

## The Isolated Example

```python
def apply_g_hardcoded(code):
    if code == 0: return "rapid"
    if code == 1: return "linear"
    return "unknown"


MACHINE_M_CODES = {
    "fanuc": {"spindle_cw": [3], "coolant_flood": [8]},
    "okuma": {"spindle_cw": [3, 43], "coolant_flood": [8, 51]},
}

def apply_m_data_driven(code, bank):
    if code in bank["spindle_cw"]:
        return "spindle_cw"
    if code in bank["coolant_flood"]:
        return "coolant_flood"
    return "unknown"


print(apply_g_hardcoded(0))
print(apply_m_data_driven(43, MACHINE_M_CODES["okuma"]))
print(apply_m_data_driven(43, MACHINE_M_CODES["fanuc"]))
```

**Real output, run this session:**
```
rapid
spindle_cw
unknown
```

**What this proves:** `M43` means two genuinely different things
depending purely on *which bank* (`okuma` vs. `fanuc`) is consulted —
the same numeric input, two real, different, correct answers, because
the mapping itself is data the caller supplies, not baked into
`apply_m_data_driven`'s own code. `apply_g_hardcoded`, by contrast, has
no such parameter at all — there's only ever one real answer for `G0`,
so there's nothing to configure.

## Mechanical Walkthrough

- `apply_g_hardcoded(code)` — **(b) reappearing**, `dict-as-lookup-table.md`'s
  own branch-chain shape (here left as `if` statements rather than a
  dict specifically because, in the real project this mirrors, each
  case's real action does more than return one plain value — the same
  distinction that concept file's own SE Lens already draws).
- `MACHINE_M_CODES = {"fanuc": {...}, "okuma": {...}}` — **(a) first
  appearance** — a lookup table *of* lookup tables: which bank applies
  is itself a real, separate piece of information (which machine is
  active), not fixed at write-time.
- `apply_m_data_driven(code, bank)` — **(a) first appearance** — the
  function itself takes the mapping as a parameter (`bank`), rather than
  referencing one fixed dict by name — the same code runs correctly
  against *any* real bank passed to it.

## Execution Trace

The same input, `43`, run through `apply_m_data_driven` twice with two
different banks:

- Call 1: apply_m_data_driven(43, MACHINE_M_CODES["okuma"])
  bank = {"spindle_cw": [3, 43], "coolant_flood": [8, 51]}
  43 in bank["spindle_cw"] ([3, 43])?    → True  → return "spindle_cw"

- Call 2: apply_m_data_driven(43, MACHINE_M_CODES["fanuc"])
  bank = {"spindle_cw": [3], "coolant_flood": [8]}
  43 in bank["spindle_cw"] ([3])?        → False
  43 in bank["coolant_flood"] ([8])?     → False
  → falls through to return "unknown"

`apply_m_data_driven`'s own source code never changed between the two
calls — only the `bank` argument did. `apply_g_hardcoded(0)`, by
contrast, has no second argument to vary at all: `code == 0` is checked
against a fixed literal baked into the function itself, so there's only
ever one real call shape to trace.

## CS Lens

This is the same real tension as **compile-time vs. run-time
configuration** — a hardcoded switch is resolved once, by whoever wrote
the code, for every possible future caller; a data-driven lookup defers
that resolution to whenever the code actually runs, using whatever real
configuration is supplied then. Neither is "better" in general — the
right choice depends entirely on whether the real mapping is one fixed
fact or a genuinely variable one.

Also recognized in: a compiler's fixed opcode table (an instruction's
meaning never depends on which program is being compiled) versus a game
engine's own moddable item database (the same item ID meaning something
different depending on which mod pack is loaded), and a web framework's
built-in HTTP status codes (fixed, universal) versus its per-application
route table (entirely configuration, supplied by whoever builds that
specific app).

## SE Lens

The real, concrete cost of picking the wrong one: hardcoding a mapping
that actually varies means real, valid input from one real machine gets
silently misread as if it came from another; making a genuinely fixed
mapping configurable anyway adds real indirection (a lookup, a
parameter, a place the configuration itself could be wrong) for no real
benefit, since nothing was ever going to vary. The real reference engine
this project ports from draws this line exactly where it belongs: G-codes
(`cnc/engineGCodeApply.ts`) as one fixed, hardcoded switch, shared by
every real machine definition; M-codes (`cnc/engineMCodeApply.ts`) as a
lookup into each specific `machDef.mCodes` bank — the same file drawing
two different, real, deliberate architectural choices for two
superficially similar problems.

## Connection

Builds on `dict-as-lookup-table.md`. Directly relevant to why this
project's own G-code fix and its still-open M-code/tool-change gap are
genuinely different-shaped pieces of work, not the same fix applied
twice: the G-code dispatch could be ported directly, self-contained; the
M-code dispatch cannot be, without also bringing in the specific machine
definition it depends on.

## Try It Yourself

1. Add a third bank, `"haas"`, with its own real-or-invented M-code
   numbers, and confirm `apply_m_data_driven` works against it with zero
   changes to the function itself — the entire point of the data being
   separate from the code that reads it.
2. Try to add a *second* real meaning for `G0` (say, a hypothetical
   machine where `G0` means something else) to `apply_g_hardcoded`
   without breaking every other machine's correct reading of `G0` —
   notice this genuinely requires restructuring the function into the
   data-driven shape; a hardcoded mapping has no room for real variation
   without becoming a different kind of function.
3. Look up `cnc/machineDefinitions.ts`'s own `haas_mill` and `fanuc_mill`
   `mCodes` banks directly and compare them: `haas_mill` has real entries
   for `gearHigh: ["M41"]`/`gearLow: ["M42"]` (a two-speed gearbox) that
   `fanuc_mill`'s own bank has no equivalent for at all — the same real
   number, `M41`, is a recognized, meaningful code on one real machine and
   simply absent — not just differently named, genuinely unrecognized —
   on another.
