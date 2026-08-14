# Concept: `dict.get()` and Its Default-Value Trap

**What you'll understand by the end:** how `.get()` differs from `in`-checking plus indexing, and a real, easy-to-miss bug it can cause when a "not present" case needs to be distinguished from a "present with a particular value" case.

**Prerequisites:** none.

## Setup

Python 3, no packages needed.

## The Problem

Reading a possibly-missing dict key with plain indexing (`d[key]`) raises a `KeyError` if the key is absent. Sometimes a default value is wanted instead of an error — but reaching for a default carelessly can silently erase the distinction between "this key was never provided" and "this key was provided, with a value that happens to equal the default."

## The Isolated Example

```python
partial_update = {"y": 20.0}

x_using_get = partial_update.get("x", 0.0)
print("using .get, missing x becomes:", x_using_get)

explicit_zero_update = {"x": 0.0, "y": 20.0}
x_using_get_2 = explicit_zero_update.get("x", 0.0)
print("using .get, explicit x=0.0 becomes:", x_using_get_2)

print("indistinguishable?", x_using_get == x_using_get_2)
```

**Real output:**
```
using .get, missing x becomes: 0.0
using .get, explicit x=0.0 becomes: 0.0
explicit_zero_update comparison -> indistinguishable? True
```

**What this proves:** `.get("x", 0.0)` produced the exact same result, `0.0`, whether `"x"` was genuinely absent from the dict or genuinely present with the value `0.0`. If the calling code needed to know *which* of those two cases actually happened — "should I reset this to zero" versus "leave this alone, nothing was said about it" — `.get()` with a default cannot make that distinction; both cases look identical once it returns.

## Mechanical Walkthrough

- `dict.get(key, default)` returns the value at `key` if present, or `default` if the key is absent — never raising `KeyError`, unlike plain `dict[key]`.
- The returned value carries no information about *which* of the two cases occurred — a caller only sees the final value, not "was this the real stored value or the fallback."
- `key in dict` followed by `dict[key]` (two separate operations) preserves the distinction: the `in` check explicitly answers "was this key present at all," independent of what value might otherwise look like a plausible default.

## CS Lens

This is about **information loss during a lookup** — collapsing two distinguishable states ("absent" and "present with this specific value") into one indistinguishable result. Whenever a lookup or query conflates "not found" with a real, valid value that happens to look the same, real information the caller might have needed is silently gone.

Also recognized in: SQL's `NULL` versus a real `0` or empty string being conflated by careless code (a hugely common real database bug class), JavaScript's `undefined` versus an explicit `null` versus a "falsy" value like `0` all being treated identically by careless `||`-based defaulting, and any API returning a sentinel value that happens to collide with a legitimate real result.

## SE Lens

Using `.get(key, default)` is exactly right when the caller genuinely doesn't care about the distinction — any value at all, real or default, should be treated identically afterward. It's the wrong tool the moment "was this explicitly provided" is itself meaningful information the following logic depends on — in that case, `key in dict` (checked separately, before ever reading the value) is the operation that actually preserves the distinction that matters.

## Connection

This is exactly the trap in porting a fold-style state update (like `sticky-state-modal-behavior.md`'s "only overwrite what was actually mentioned" logic) using `.get(key, current_value)`-style code instead of an explicit `if key in command:` check — both look almost identical, and only one of them actually preserves the "not mentioned means don't change it" behavior a modal/sticky-state system depends on.

## Try It Yourself

1. Rewrite the `MachineState`-style update logic (see `sticky-state-modal-behavior.md`) using `.get(axis, self.x)` instead of `if axis in command:`, and confirm — by testing against a command that legitimately sets an axis back to its *current* value — that both versions happen to agree in that specific case, then find and construct a case (an axis genuinely absent from a command) where they diverge.
2. Use `dict.get(key)` with no second argument at all, and confirm the fallback is `None` — Python's own value for "nothing meaningful here." Reason about whether `None` avoids this whole trap (it does, as long as `None` is never itself a legitimate stored value) or just relocates it.
3. Use a real sentinel object to disambiguate instead of a default value: `_MISSING = object(); value = d.get(key, _MISSING); if value is _MISSING: ...`. Confirm this correctly distinguishes "absent" from "present with any value, including one that looks like a typical default" in every case, at the cost of noticeably more code than a plain `.get(key, default)` call.
