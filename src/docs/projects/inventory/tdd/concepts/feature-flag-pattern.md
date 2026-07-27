# Concept: The Feature-Flag Pattern — Separating Recognition From Activation

**What you'll understand by the end:** how to structure code so that "noticing a condition" and "deciding whether that condition changes behavior" are two separate, independently-reasoned-about steps, rather than one fused decision.

**Prerequisites:** none.

## Setup

Any language works; the isolated example uses Python, no install needed.

## The Problem

Some behavior in a system should only activate when something else — a setting, a switch, an environment — explicitly permits it: a debug-only log line, an experimental feature only some users see, a machine operator's physical switch changing how a program is interpreted. Fusing "is this thing present" and "does it matter right now" into one check makes the code harder to reason about and test — the two questions have genuinely different, independent answers.

## The Isolated Example

```python
def process_lines(lines, verbose_mode_enabled):
    results = []
    for line in lines:
        is_debug_line = line.startswith("#debug:")
        if is_debug_line and verbose_mode_enabled:
            continue  # a debug-only line, skipped unless verbose mode is on
        results.append(line)
    return results

lines = ["real output", "#debug: internal state", "more output"]

print(process_lines(lines, verbose_mode_enabled=False))
print(process_lines(lines, verbose_mode_enabled=True))
```

**Real output:**
```
['real output', '#debug: internal state', 'more output']
['real output', 'more output']
```

**What this proves:** the exact same input, tagged identically both times (`is_debug_line` is computed the same way regardless of the flag), produced two different real outputs purely based on `verbose_mode_enabled` — the *tagging* step never changed; only the *decision* step, downstream of it, did.

## Mechanical Walkthrough

- **Recognition**: `is_debug_line = line.startswith("#debug:")` runs unconditionally, every time, regardless of the flag — this step only answers "what is this line," never "does it matter."
- **Activation**: `if is_debug_line and verbose_mode_enabled:` is the one place both facts (what the line is, and whether the switch is on) are combined into an actual decision — this is deliberately the *only* place that decision happens.
- Because recognition and activation are separate steps, either can change independently — a smarter way to detect debug lines wouldn't need to touch the activation logic at all, and a new condition for when verbose mode applies (say, only during business hours) wouldn't need to touch the recognition logic either.
- The flag itself (`verbose_mode_enabled`) is ordinary data, passed in from outside — nothing about *how* it's decided (a config file, a request field, a command-line argument) is baked into this function; it only consumes the already-decided value.

## Execution Trace

The identical 3-line input, run through the loop twice — once per flag
value — traced against the real output above:

```
process_lines(lines, verbose_mode_enabled=False):
  "real output":          is_debug_line=False → not skipped → results=["real output"]
  "#debug: internal state": is_debug_line=True → (True and False)=False → not skipped
                            → results=["real output", "#debug: internal state"]
  "more output":          is_debug_line=False → not skipped
                            → results=["real output", "#debug: internal state", "more output"]

process_lines(lines, verbose_mode_enabled=True):
  "real output":          is_debug_line=False → not skipped → results=["real output"]
  "#debug: internal state": is_debug_line=True → (True and True)=True → continue (skipped!)
                            → results=["real output"]  (unchanged)
  "more output":          is_debug_line=False → not skipped
                            → results=["real output", "more output"]
```

`is_debug_line` is computed identically on every iteration in both
runs — it's only the `and verbose_mode_enabled` half of the condition
that ever differs, and it's the only thing that does.

## CS Lens

This is a specific application of **separation of concerns**: two logically independent questions — "what is this" (a classification/recognition concern) and "does it matter right now" (a policy/activation concern) — are kept in genuinely separate pieces of code, rather than merged into one combined conditional evaluated in a single step. Keeping them separate means each can be tested, changed, and reasoned about on its own.

Also recognized in: real feature-flag systems in production software (a flag's value is looked up once, independently of whatever code paths check it), a compiler's preprocessor directives (`#ifdef DEBUG` — text is recognized as debug-only unconditionally; whether it's actually *compiled in* depends on a separate build-time flag), and access-control systems generally (a request is classified by what it's asking for, separately from whether the current user/context is permitted to do it).

## SE Lens

The real, practical payoff: a bug in *recognizing* debug lines (an incorrect prefix check) and a bug in *deciding whether verbose mode should be on* (wrong default, wrong config lookup) are two different bugs, in two different places, each independently testable — recognition can be tested with the flag fixed at a known value, and activation can be tested with recognition's result fixed at a known value, rather than needing every test to vary both simultaneously. Fusing the two into one combined check makes it structurally impossible to test either concern without the other.

## Connection

A specific application of the same instinct behind `pure-functions-testability.md` (separating computation from effect) and `open-closed-principle.md` (separating what varies from what stays fixed) — here applied specifically to separating "what was detected" from "whether it currently matters."

## Try It Yourself

1. Add a second, independent flag (`strip_comments_enabled`) governing a *different* recognition/activation pair in the same function, and confirm the two flags can be toggled completely independently of each other with no interaction.
2. Write a unit test for the recognition step alone — assert `"#debug: x".startswith("#debug:")` is `True` and `"real output".startswith("#debug:")` is `False` — with no `verbose_mode_enabled` involved at all, confirming recognition really is testable in total isolation from activation.
3. Deliberately fuse the two concerns back together (`if line.startswith("#debug:") and verbose_mode_enabled:` inlined directly, no intermediate `is_debug_line` variable) and reason about what's lost — is anything actually lost here, for a case this simple, or does the separation only start paying off once recognition logic becomes more complex than a single `startswith` check?
