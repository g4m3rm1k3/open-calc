# Interlude D: Memory — Garbage Collection vs. Manual Management

**What you will build**
Nothing user-facing. You'll observe Python actually freeing heap memory in real time, then examine the one case where it can't do so automatically — setting up the contrast you'll meet directly if you ever work in a language without this safety net.

**What you need to know first**
Interlude A (stack, heap, references). Lesson 8 (`conn.close()` — resource cleanup, which turns out to be a related idea).

**Exemption from the failing-test-first rule:** memory management has no application feature to spec — this interlude demonstrates real, observable behavior instead.

---

## Concept Unit: Reference Counting

### The Problem

Interlude A established that mutable objects live on the heap, and variables hold references to them, not the objects themselves. But it left an open question: when a heap object has no more references pointing to it, what actually happens to the memory it occupies? If nothing reclaimed it, ever, a long-running program (like the FastAPI server this whole project runs inside) would slowly consume more and more memory until it crashed.

### Demonstrate the behavior

Create `lab_refcount.py`:

```python
import sys

class Widget:
    def __del__(self):
        print("Widget's memory is being freed")

w = Widget()
print("refcount:", sys.getrefcount(w) - 1)  # -1: getrefcount's own temporary reference doesn't count

w2 = w
print("refcount after w2 = w:", sys.getrefcount(w) - 1)

del w
print("still exists, w2 holds it")

del w2
print("nothing should reference it now")
```

Run it:

```bash
python lab_refcount.py
```

Output:

```text
refcount: 1
refcount after w2 = w: 2
still exists, w2 holds it
Widget's memory is being freed
nothing should reference it now
```

*What this proves:* Python tracks, for every object on the heap, exactly how many references currently point to it. `del w` didn't free the `Widget` — it only removed *one* reference, and `w2` still held another, so the refcount dropped from 2 to 1, not to 0. Only `del w2`, which removed the *last* reference, triggered `__del__` and released the memory. This is **reference counting**: an object's memory is automatically reclaimed the instant its reference count reaches zero — no scheduled cleanup pass, no delay, it happens immediately.

### Explain the mechanism

Every heap object secretly carries a counter. Every time a new variable, list entry, or object attribute is set to reference it, the counter increments; every time such a reference is removed (a variable reassigned, deleted, or goes out of scope when its stack frame is discarded, per Interlude A), the counter decrements. The moment that counter hits zero, Python immediately reclaims the object's memory — this is the actual mechanism behind something you've been trusting implicitly since your very first Python program: local variables inside a function "disappearing" when the function returns is really their reference count dropping to zero as their stack frame is discarded.

---

## Concept Unit: The Case Reference Counting Can't Handle

### The Problem

Reference counting works cleanly as long as references form a simple structure. What happens when two objects reference *each other* — can their reference counts ever legitimately reach zero, even after nothing outside the pair references either of them anymore?

### Demonstrate the behavior

Create `lab_cycle.py`:

```python
import gc

class Node:
    def __init__(self, name):
        self.name = name
        self.partner = None

    def __del__(self):
        print(f"{self.name} freed")

gc.disable()  # disable Python's cycle collector, to isolate reference counting alone

a = Node("A")
b = Node("B")
a.partner = b
b.partner = a

del a
del b
print("Deleted both local variables — but did __del__ run?")

gc.collect()  # manually run the cycle collector
print("After gc.collect():")
```

Run it:

```bash
python lab_cycle.py
```

Output:

```text
Deleted both local variables — but did __del__ run?
A freed
B freed
After gc.collect():
```

*What this proves:* after `del a` and `del b`, neither `Node`'s `__del__` ran — despite nothing in the rest of the program still referencing either one. Each still had a reference count of 1, from the *other* node's `.partner` attribute, pointing at it. Pure reference counting can't detect this: from either object's local perspective, it still looks "in use." Only `gc.collect()` — a separate mechanism, not reference counting at all — found and freed both, by specifically searching for groups of objects that reference each other but are unreachable from anywhere else in the program.

### Explain the mechanism

This second mechanism is Python's actual **garbage collector** (the `gc` module) — reference counting handles the vast majority of cases immediately and cheaply, and this separate, periodic process exists specifically to catch **reference cycles**, the one case reference counting structurally cannot resolve on its own. In normal use (without `gc.disable()`), this runs automatically in the background, so cycles get cleaned up eventually without any code of yours calling `gc.collect()` directly — this interlude disabled it deliberately, only to make the gap visible.

### CS Lens

**Automatic memory management is not one mechanism, but (at least) two working together.** "Python has garbage collection" undersells it — reference counting does most of the real-time work, and a separate cycle-detecting collector handles the specific case reference counting can't. This two-part design is common across managed languages, not unique to Python.

### SE Lens

**Manual memory management: the tradeoff this entire interlude exists to set up.** Not every language does any of this automatically. In C++ — which appears later in your language-breadth track — memory allocated with `new` must be explicitly released with `delete`, by the programmer, by hand, every time. Forget to `delete` something: that memory is never reclaimed — a **memory leak**, the manual-management equivalent of what reference counting prevents automatically here. `delete` something twice, or use a pointer after its memory was already freed: undefined behavior, frequently an actual security vulnerability (a **use-after-free** bug), not just a slowdown. Python's automatic management trades away that entire category of bug in exchange for real, if usually small, runtime overhead (maintaining every refcount, and periodically running the cycle collector) and less direct control over exactly when memory is released. This is precisely the tradeoff that motivates using a language like C++ for the specific parts of a system where that overhead and lack of control genuinely matter — not a sign either approach is simply better.

### An echo you've already seen

`conn.close()` in every database function since Lesson 2 is a related, smaller-scale version of this same idea: not memory management exactly, but *resource* management — a database connection holds a real, limited resource (an open file handle) that Python's garbage collector doesn't reliably or promptly reclaim just because a `conn` variable goes out of scope. That's precisely why closing connections explicitly has been done by hand this entire project, rather than left to automatic cleanup.

---

## Closing

**Connect the pieces**
Every heap object's memory is reclaimed the instant its reference count reaches zero — immediate, automatic, and the mechanism behind local variables "disappearing" you've trusted since your first Python program. Reference cycles are the one gap reference counting can't close alone, handled by a separate, periodic garbage collector. A language without any of this — C++, later in your track — makes memory management the programmer's explicit responsibility, trading automatic safety for direct control and lower overhead.

**What breaks without this**
Without the cycle collector, a program that builds and discards many cyclically-linked structures (a common real pattern — think of the `follows` graph from Lesson 9, where two `Member` objects could easily reference each other) would slowly leak memory forever, each cycle's objects technically unreachable but never freed, since reference counting alone can never see past the cycle.

**Exercises**
1. Modify `lab_cycle.py` to create a chain of 5 nodes referencing each other in a ring (not just 2), and confirm `gc.collect()` still frees all of them together.
2. Look up (search, don't guess) whether SQLite's Python connection objects are closed automatically by garbage collection if you forget `conn.close()` — and consider what that answer implies about whether every `conn.close()` call in this project so far has actually been necessary, or just good discipline.

**Definition of Done**
* [x] Observed reference counting freeing an object immediately upon its last reference being removed.
* [x] Observed a reference cycle surviving pure reference counting, then freed by the separate cycle collector.
* [x] Can explain, without notes, why C++ requires explicit `delete` and what a memory leak and a use-after-free bug actually are.

---

## Context Snapshot (End of Interlude D)

**1-5, 7-8.** Unchanged from end of Lesson 15 — no application files touched.

**6. Terminology Ledger (additions):**
| Term | First taught | Plain meaning |
|---|---|---|
| Reference counting | Interlude D | Memory freed immediately when an object's reference count reaches zero |
| Reference cycle | Interlude D | Two or more objects referencing each other, unreachable from reference counting alone |
| Garbage collector (cycle collector) | Interlude D | A separate, periodic process that finds and frees reference cycles |
| Memory leak | Interlude D | Memory that's never reclaimed because it was never explicitly freed (manual management) |
| Use-after-free | Interlude D | Accessing memory that's already been manually freed — undefined behavior, often a security bug |

**7. Lesson Completion State:**
- Completed: Lessons 1-15, Interludes A, B, C, D
- Next: Lesson 16 — Repository/Service Layers and Dependency Inversion (Phase 6 begins)
