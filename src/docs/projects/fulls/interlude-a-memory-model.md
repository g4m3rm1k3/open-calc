# Interlude A: The Memory Model — Stack, Heap, and References

**What you will build**
Nothing user-facing — this interlude has no route or feature. Instead you'll build a small, deliberately broken function that demonstrates a real bug class, then fix it by understanding *why* it happened. The problem we're solving: every function you've written so far has "just worked," which has let you build correct code without ever having a mental model of *why* it was correct. That gap becomes dangerous the moment code stops being simple — including when you're reviewing something an AI agent wrote and it "looks right."

**What you need to know first**
Lesson 1 (functions, `return`, basic types).

**Exemption from the failing-test-first rule:** this interlude has no application behavior change, so Concept Units here open with a *demonstration* of a real bug instead of a spec-driven test — the bug itself plays the same role a failing test normally does: it's the concrete problem the explanation exists to solve.

---

## Concept Unit: The Call Stack

### The Problem

Every time you call a function, Python has to keep track of that function's local variables somewhere, and forget them the instant the function returns — otherwise every function call would leak memory forever. Where does that "somewhere" live, and what does "forget" actually mean?

### Demonstrate the behavior

Create `lab_stack.py`:

```python
def inner():
    x = 100
    print(f"Inside inner, x = {x}, id = {id(x)}")

def outer():
    x = 5
    print(f"Before calling inner, outer's x = {x}, id = {id(x)}")
    inner()
    print(f"After calling inner, outer's x = {x}, id = {id(x)}")

outer()
```

Run it:

```bash
python lab_stack.py
```

Output:

```text
Before calling inner, outer's x = 5, id = 4362834800
Inside inner, x = 100, id = 4362838192
After calling inner, outer's x = 5, id = 4362834800
```

*What this proves:* `inner()`'s `x` and `outer()`'s `x` are two completely separate pieces of memory, even though they share a name. `outer`'s `x` is untouched by whatever `inner` does with its own `x`. `id(x)` prints the actual memory address, which is how we can see this instead of just trusting it.

### Explain the mechanism

Each function call gets its own private workspace — called a **stack frame** — holding just its local variables and where to return to when it's done. These frames stack on top of each other as functions call other functions (hence "call stack"): `outer`'s frame stays put while `inner`'s frame sits on top of it. The moment `inner()` returns, its frame is discarded entirely — its `x` is gone, full stop, freeing that memory automatically. This is why `outer`'s `x` was never at risk: it lived in a different frame the whole time. This mechanism is universal — it's not a Python thing, it's how every mainstream language (JavaScript, C#, Java, C++) runs functions. We'll see it explicitly in C++ later, where you manage part of this yourself instead of it being automatic.

### CS Lens

**The call stack.** This is *the* reason infinite recursion crashes with `RecursionError` / "stack overflow" — frames keep stacking up with nowhere to go, and there's a hard limit on how many can exist at once. It's also why a function's local variables are invisible to the function that called it, and vice versa — each frame is sealed off from the others by default.

### Connecting sentence

Simple values like integers behave exactly as intuition suggests: each frame gets its own private copy. Lists and other mutable objects don't — and that's where real bugs live.

---

## Concept Unit: References, Aliasing, and a Real Bug

### The Problem

Not everything lives inside a stack frame the way `x = 5` does. Some things are too big, or need to outlive the function that created them, or need to be shared between two frames on purpose. Those live somewhere else — and understanding where is what separates "my code happened to work" from "I know why my code works."

### Demonstrate the behavior

Create `lab_aliasing.py`:

```python
def add_welcome_bonus(user_scores):
    user_scores.append(100)
    return user_scores

alice_scores = [10, 20, 30]
bonus_scores = add_welcome_bonus(alice_scores)

print("bonus_scores:", bonus_scores)
print("alice_scores:", alice_scores)
```

Run it:

```bash
python lab_aliasing.py
```

Output:

```text
bonus_scores: [10, 20, 30, 100]
alice_scores: [10, 20, 30, 100]
```

*What this proves — and this is the bug:* we only appended to `bonus_scores`. `alice_scores` was never touched by name anywhere in `add_welcome_bonus`. And yet it changed too. If this were real code — say, `alice_scores` represents a specific user's actual saved data — you've just silently corrupted it while only intending to compute a bonus preview.

### Explain the mechanism

When you write `x = 5`, the stack frame stores the value `5` directly. When you write `alice_scores = [10, 20, 30]`, the stack frame does **not** store the list itself — it stores a *reference*: the address of a list object that actually lives elsewhere, in a much larger, unstructured pool of memory called the **heap**. When you called `add_welcome_bonus(alice_scores)`, Python didn't copy the list into the function's frame — it copied the *reference* (the address). So `user_scores` inside the function and `alice_scores` outside it are two different names pointing at the exact same object on the heap. `.append(100)` mutates the object at that address — and both names see it, because there was only ever one object.

This is why the integer example in the previous unit behaved differently: small immutable values like `int` are simple enough that this distinction is invisible in practice, but the underlying rule — variables hold references, not the objects themselves — is the same for both. It only becomes visible (and dangerous) with mutable objects like lists and dicts.

### The fix

```python
def add_welcome_bonus(user_scores):
    user_scores_copy = user_scores.copy()
    user_scores_copy.append(100)
    return user_scores_copy
```

`.copy()` creates a genuinely new list object on the heap, so `user_scores_copy` and the original `alice_scores` point at two different addresses — mutating one can no longer affect the other.

### Mechanical walkthrough

1. `user_scores.append(100)`: (first appearance in this context, already-known syntax) — mutates the object `user_scores` refers to, in place, on the heap.
2. `id(x)`: (already established from the previous unit) — this is exactly the tool that would let you catch this bug yourself: `id(alice_scores) == id(bonus_scores)` would print `True`, immediately revealing they're the same object.
3. `.copy()`: (first appearance). Allocates a new list on the heap with the same contents, and returns a reference to *that* new object — breaking the aliasing.

### CS Lens

**The heap, and reference (not value) semantics for mutable objects.** The stack is small, fast, and automatically cleaned up frame-by-frame. The heap is a much larger pool where objects live independently of any one function call, addressed by reference — which is exactly what lets two different parts of a program share the same data on purpose (useful) or by accident (a bug). This same reference model is why two variables pointing at "the same" dictionary, the same object instance, or the same array in JavaScript/Java/C# all show this identical behavior — this isn't a Python quirk, it's a design decision nearly every language makes for mutable data, for the same performance reason: copying large objects on every function call would be far too slow.

### SE Lens

**Defensive copying vs. designing for immutability.** The fix above (`.copy()`) is a *defensive* fix — you copy at the boundary to be safe. The more robust long-term habit, especially as systems grow, is to prefer functions that don't mutate their inputs at all, and to be explicit in naming and documentation when a function *is* allowed to mutate what you hand it. This is also exactly the kind of bug you should now actively watch for when reviewing AI-generated code: does this function silently mutate an argument it was only supposed to read?

### Commands needed

```bash
python lab_aliasing.py
```

(Already run above — no project files change in this interlude.)

---

## Closing

**Connect the pieces**
Every variable you write is a reference living in a stack frame. For simple immutable values, that distinction never bites you. For mutable objects — lists, dicts, and (soon) your own classes — two references can point at one shared object on the heap, and mutating through either reference affects both. `add_welcome_bonus` looked correct, ran without error, and produced a wrong result — the exact "looks right" failure mode you were worried about with AI-generated code, except here you caused it yourself, on purpose, to see it clearly.

**What breaks without this**
Without this model, aliasing bugs are effectively unfindable by reading code casually — the code *looks* like it only touches a local variable. They tend to surface much later, far from the function that caused them, as "the data is wrong somewhere" — one of the hardest bug categories to trace back to its source.

**Exercises**
1. In `lab_aliasing.py`, add `print(alice_scores is bonus_scores)` before the fix, then again after applying `.copy()`. Confirm it prints `True`, then `False`.
2. Write a function `add_item(d, key, value)` that takes a dict, and deliberately make two versions: one that mutates the caller's dict, one that returns a new one via `d.copy()`. Call both and inspect the original dict afterward to confirm the difference.

**Definition of Done**
* [x] Demonstrated the call stack with `lab_stack.py`.
* [x] Demonstrated a real aliasing bug with `lab_aliasing.py`, then fixed it.
* [x] Can explain, without notes, why `alice_scores` changed even though it was never named inside the function.

---

## Context Snapshot (End of Interlude A)

**1-5, 7-8.** Unchanged from end of Lesson 1 — no application files were touched.

**6. Terminology Ledger (additions):**
| Term | First taught | Plain meaning |
|---|---|---|
| Stack frame | Interlude A | A function call's private workspace, discarded when it returns |
| Call stack | Interlude A | Frames stacked as functions call other functions |
| Heap | Interlude A | Larger memory pool where mutable objects actually live, addressed by reference |
| Reference | Interlude A | A variable holds the address of an object, not the object itself |
| Aliasing | Interlude A | Two variable names pointing at the same object on the heap |
| `id()` | Interlude A | Reveals an object's actual memory address — the tool for detecting aliasing |
| Defensive copying | Interlude A | Copying data at a function boundary so mutation can't leak back to the caller |

**7. Lesson Completion State:**
- Completed: Lesson 1, Interlude A
- Next: Lesson 2 — Community Members Listing (database.py, SQLite basics, SELECT, templates)
