# Concept: Regular Languages & Finite State Machines

**What you'll understand by the end:** the theoretical machine regular expressions actually run on, and the real, named limit on what that class of pattern can recognize.

**Prerequisites:** `python-regex-search-findall.md`.

## Setup

Python 3, no packages needed.

## The Problem

Regex patterns feel like a practical tool, but they correspond to a precise idea from computer science theory — understanding that idea explains both why regex is so effective at certain problems, and why it provably cannot solve certain others (like matching balanced parentheses of arbitrary depth).

## The Isolated Example

A finite state machine, hand-built, recognizing the same thing a tiny regex would (`ab*c` — an "a," then zero or more "b"s, then a "c"):

```python
def matches_ab_star_c(text):
    state = "start"
    for ch in text:
        if state == "start":
            state = "seen_a" if ch == "a" else "reject"
        elif state == "seen_a":
            if ch == "b":
                state = "seen_a"  # stay here, more b's allowed
            elif ch == "c":
                state = "accept"
            else:
                state = "reject"
        elif state == "accept":
            state = "reject"  # nothing allowed after c
        elif state == "reject":
            break
    return state == "accept"

for test in ["ac", "abc", "abbbc", "abcx", "xabc"]:
    print(test, "->", matches_ab_star_c(test))
```

**Real output:**
```
ac -> True
abc -> True
abbbc -> True
abcx -> False
xabc -> False
```

**What this proves:** the function never looks back at earlier characters or stores more than "which state am I in right now" — one variable, `state`, updated one character at a time. This is a finite state machine: a fixed, small set of named states, and rules for which state a given input character moves you to next. `re.compile(r"ab*c")` builds essentially this same kind of machine internally, automatically, from the pattern text.

## Mechanical Walkthrough

- `state` only ever holds one of a small, fixed set of values (`"start"`, `"seen_a"`, `"accept"`, `"reject"`) — the defining property of "finite" state.
- Each character read causes at most one state transition, based only on the *current* state and that one character — never on the history of characters seen before reaching this state.
- Reaching `"accept"` after all input is consumed means the whole string matched the pattern; any other final state means it didn't.

## Execution Trace

All 5 real test strings, character by character, traced against the
real output above:

```
"ac":    start --a--> seen_a --c--> accept.  End of input, state=accept → True
"abc":   start --a--> seen_a --b--> seen_a (stays) --c--> accept.  → True
"abbbc": start --a--> seen_a --b--> seen_a --b--> seen_a --b--> seen_a --c--> accept.  → True
"abcx":  start --a--> seen_a --b--> seen_a --c--> accept --x--> reject
         (the "accept" branch: state = "reject", nothing allowed after c)
         End of input, state=reject → False
"xabc":  start --x--> reject (start branch: ch is not "a" → reject)
         --a--> break (the "reject" branch exits the loop immediately,
         "b" and "c" are never even read)
         End (via break), state=reject → False
```

`"abbbc"` is the one worth noticing for the "finite" part of "finite
state machine": however many `b`s appear, the machine stays in the
exact same `seen_a` state — it never counts them, never remembers "how
many so far," because `seen_a` has no way to hold that information;
zero, one, or a thousand `b`s all look identical to the machine's own
one variable.

## CS Lens

A **regular language** is the formal-languages term for exactly the class of patterns a finite state machine (and therefore a regular expression) can recognize. A key, provable limit: no finite state machine can match "balanced parentheses of arbitrary depth" (or check that a count of one thing equals a count of another) — doing that requires remembering an unbounded amount of information (how deep you are), which a *finite* set of states structurally cannot hold. This is why real programming-language parsers need something more powerful (a full grammar and parser) layered on top of, or instead of, plain regex — a real, concrete boundary rather than an abstract theoretical footnote.

Also recognized in: traffic lights (a small set of states, transitioning on a timer or sensor input), TCP connection states (`LISTEN`, `SYN_SENT`, `ESTABLISHED`, etc., transitioning on specific packets), every real compiler's own lexer stage, and UI workflow steppers (checkout flows moving through a fixed sequence of named steps).

## SE Lens

Recognizing when a problem is "regular" (a finite state machine, or a plain regex, suffices) versus when it genuinely needs more power (matching nested structure, tracking unbounded counts) is a real, practical design decision. Reaching for regex on a problem that isn't actually regular (parsing nested JSON with a single regex, a well-known anti-pattern) produces something that appears to work on simple inputs and fails unpredictably on more complex ones — the theory here isn't academic trivia, it predicts exactly where that kind of solution breaks.

## Connection

Builds on `python-regex-search-findall.md` — this is the theoretical machine underneath it. Directly relevant the moment a project's own text format needs anything with nested or balanced structure (like expressions inside brackets) — that's the concrete signal a hand-written parser is needed, not a bigger regex.

## Try It Yourself

1. Extend `matches_ab_star_c` to instead recognize `a+b+` (one or more a's, then one or more b's) by adding a new state. Test it against `"ab"`, `"aab"`, `"b"`, and `"ba"`.
2. Try to write a finite state machine (fixed number of named states, no counters, no memory beyond "current state") that correctly matches balanced parentheses up to any depth, e.g. `"(())"` and `"((()))"` as valid, `"(()"` as invalid. Notice where you get stuck — you'll find yourself wanting to *count* how many opens are unmatched, which needs unbounded memory, not a fixed set of states.
3. Write the same "balanced parentheses" checker using a real stack (a list, `.append`/`.pop`) instead of a fixed set of states, and confirm it correctly handles depths your state-machine attempt couldn't.
