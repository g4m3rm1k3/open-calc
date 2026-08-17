# Verification Code

Every real, compiled proof behind this curriculum's lessons — every
isolated lab, every incremental project snapshot, every deliberate
"what breaks without this" failure — lives here, one subfolder per
lesson (`B1/`, `B2/`, ...), instead of only in a session's throwaway
scratch directory.

**Why this exists:** the schema's own verification rule (see the
handoff, working rule 2) requires every command, output, and failure
shown in a lesson to actually be run, this session, with a real tool —
never written from memory or confidence. Without a persistent home,
that verification code was being rebuilt from scratch, in a
session-local scratchpad, every single session — the exact same labs,
retyped, for no reason beyond the scratchpad not surviving past one
conversation. This folder is the fix: write it once here, and reuse or
extend it in every future session instead of re-deriving it.

## Organization

One subfolder per lesson file, named to match
(`B1-three-ways-to-walk-the-same-shape.md` → `B1/`). Within a lesson's
folder, filenames follow the naming pattern actually used inside that
lesson's own prose (a lesson's Concept Units cite these exact
filenames in its `Commands Needed`/`Run It` code fences — the file on
disk here and the filename named in the lesson text should always
match):

- `lab*.cpp` — an isolated Concept Unit lab (Concept Isolation Rule):
  throwaway code proving one new construct in the smallest possible
  form, before it meets real project code.
- `step*.cpp` — a snapshot of the real project at one specific
  lesson-stage's exact state, used to verify a `Run It` block's output
  against the exact code shown at that point, not a later or earlier
  state.
- `break*.cpp` — a deliberate failure, used for a Concept Unit's or
  the Closing's "what breaks without this" — some of these are
  expected to **fail to compile** (that's the point; the failure
  message itself is the lesson's own proof). Check the specific
  lesson's own Closing section before assuming a `break*.cpp` file
  should build successfully.
- `scale*.cpp` (as needed) — a larger, at-scale build used for a real
  measured comparison (timing, peak memory via `/usr/bin/time -l`,
  etc.), when a lesson's own claim is quantitative rather than just
  correctness-based.

## Rebuilding

Same toolchain and flags used throughout this curriculum:

```
clang++ -std=c++17 -Wall -Wextra <file>.cpp -o <name> && ./<name>
```

`scale*.cpp` files additionally use `-O2` (see the relevant lesson's
own Commands Needed for why — an unoptimized build's bookkeeping can
obscure a real memory/timing comparison at scale).

## Using this across sessions

- **Before re-verifying an existing lesson's claims** (an edit, a
  correction, answering a question about it): recompile the relevant
  file(s) here instead of retyping them from the lesson's own prose —
  they're already the exact, real source of the lesson's own pasted
  output.
- **Before writing a new lesson**: check whether an already-solved
  isolated lab here is directly reusable (a fresh isolated lab is
  still required per the Concept Isolation Rule — "already lab'd
  earlier" is never a skip condition — but the *scratch work* of
  designing and debugging one can still be reused as a starting point
  when the same underlying construct comes up again in a new context).
- **After writing a new lesson**: commit that lesson's own verification
  files here, under its own `B<N>/` (or the current track's own
  letter) subfolder, using the naming convention above — don't leave
  them only in the session-local scratchpad, or the next session pays
  the same rebuilding cost this folder exists to remove.
