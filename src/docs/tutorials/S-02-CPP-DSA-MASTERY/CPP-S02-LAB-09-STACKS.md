# CPP DSA — LAB-09 — Stacks

**Prerequisites:** LAB-08 (Doubly Linked Lists)

## Quick Check

Before starting, answer these (answers at the bottom):

1. What does LIFO stand for, and what everyday physical object is it usually explained with?
2. Why is `MyVector` (LAB-06) actually a *good* backing structure for a stack, when it was O(n) for front-insertion — doesn't a stack insert and remove constantly?
3. What should `pop()` on an empty stack do — and why is silently returning a garbage value the wrong answer?

## What You Will Build

`MyStack<T>` implemented two ways — once backed by `MyVector<T>` (LAB-06), once backed by `MyLinkedList<T>` (LAB-07) — both exposing the identical `push`/`pop`/`top` interface, plus a real application: a bracket-matcher that uses a stack to check whether `()[]{}` in a string are correctly balanced.

```
$ ./stack_demo
push(1), push(2), push(3): top=3
pop(): removed 3, top=2
pop(): removed 2, top=1

Bracket check: "([{}])" -> BALANCED
Bracket check: "([)]"   -> NOT BALANCED (mismatch at ')')
Bracket check: "((("    -> NOT BALANCED (unclosed brackets remain)
```

## Concept: LIFO — Last In, First Out

**What it is:** A stack is a data structure with exactly three operations: `push` (add to the top), `pop` (remove from the top), `top`/`peek` (look at the top without removing it) — nothing else, no indexing, no insertion anywhere but the top. LIFO means the *last* thing pushed is the *first* thing popped — like a physical stack of plates: you can only take from the top, and whatever you set down most recently is what you'll pick up first.

**The problem before:** Plenty of real problems have exactly this "undo the most recent thing first" shape: matching brackets/parentheses (the innermost, most recently opened bracket must be the next one closed), tracking function calls (LAB-11's call stack — the most recently called function is the first to return), undo/redo systems, depth-first traversal (LAB-17). Using a general-purpose structure like `MyVector` directly, with no restriction, works but doesn't *communicate* the LIFO intent to anyone reading the code, and doesn't prevent accidentally reading/writing the middle of what should conceptually be a strict top-only structure.

**The solution:** Wrap a simpler structure (`MyVector` or `MyLinkedList`) and expose *only* `push`/`pop`/`top` — deliberately hiding everything else the underlying structure could do. This is `MyVector` used specifically for its O(1) *back*-insertion (`push_back`, from LAB-06) rather than front-insertion — a stack's "top" maps naturally onto an array's *end*, not its beginning, which is exactly why `MyVector` (O(1) at the back) is actually a well-suited backing structure, not a mismatched one, despite LAB-06's front-insertion being O(n).

**Canonical example:**

```cpp
template<typename T>
class MyStack {
private:
    MyVector<T> data;
public:
    void push(T value) { data.push_back(value); }
    T pop() {
        T value = data[data.getSize() - 1];
        data.pop_back(); // requires adding pop_back to MyVector -- Step 1 covers this
        return value;
    }
};
```

**Project Application:** LAB-11's recursion lab visualizes the real call stack using exactly this LIFO structure; LAB-17's depth-first graph traversal is directly implementable with an explicit stack instead of recursion, which this lab's bracket-matcher previews.

**Watch for:** Calling `pop()` or `top()` on an empty stack without checking first. Unlike LAB-07's `remove`, which returns `bool` to signal "not found," a naive `pop()` that just returns `data[data.getSize() - 1]` on an empty stack reads `data[-1]` — an out-of-bounds access, undefined behavior, exactly the kind of bug LAB-06's Challenge (`.at()` with bounds checking) exists to catch.

## Step 1: Adding `pop_back` to `MyVector` (a gap from LAB-06)

```cpp
// MyVector.h -- add this method
template<typename T>
void MyVector<T>::pop_back() {
    if (size > 0) {
        size--; // just decrement size -- the "removed" element's memory is still allocated,
    }             // simply no longer considered part of the logical contents
}
```

Notice `pop_back` doesn't actually deallocate anything or shrink `capacity` — it just decrements `size`. The element that was "removed" is still physically sitting in the array's memory, just past the new `size` boundary, which means it'll simply be overwritten the next time `push_back` grows into that slot. This is a deliberate, common design choice: shrinking capacity on every pop would be wasteful if the caller immediately pushes again, so most real dynamic arrays (including `std::vector`) only ever grow capacity, never automatically shrink it.

### SAVE AND TRY

```cpp
MyVector<int> vec;
vec.push_back(1);
vec.push_back(2);
std::cout << "size before pop: " << vec.getSize() << ", capacity: " << vec.getCapacity() << "\n";
vec.pop_back();
std::cout << "size after pop: " << vec.getSize() << ", capacity: " << vec.getCapacity() << "\n";
```

Confirm `capacity` stays the same across the `pop_back()` call while `size` drops by one — direct proof this implementation trades a small amount of "wasted" allocated-but-unused memory for avoiding unnecessary reallocation.

## Step 2: `MyStack<T>` — array-backed

```cpp
// MyStack.h
#ifndef MY_STACK_H
#define MY_STACK_H

#include "MyVector.h"
#include <stdexcept>

template<typename T>
class MyStack {
private:
    MyVector<T> data;

public:
    void push(T value) {
        data.push_back(value);
    }

    T pop() {
        if (data.getSize() == 0) {
            throw std::out_of_range("pop() called on empty stack");
        }
        T value = data[data.getSize() - 1];
        data.pop_back();
        return value;
    }

    T top() const {
        if (data.getSize() == 0) {
            throw std::out_of_range("top() called on empty stack");
        }
        return data[data.getSize() - 1];
    }

    bool isEmpty() const { return data.getSize() == 0; }
    int getSize() const { return data.getSize(); }
};

#endif
```

Both `pop()` and `top()` check `isEmpty()`-equivalent conditions *before* touching `data` at all, and `throw` a real exception (LAB-06's Challenge pattern, reused directly) rather than silently returning garbage or crashing with an out-of-bounds read — this is the concept section's warning, answered concretely: an empty-stack `pop()` fails loudly and immediately, at the exact call site, instead of corrupting something invisibly and crashing somewhere unrelated later.

### SAVE AND TRY

```cpp
MyStack<int> stack;
stack.push(1);
stack.push(2);
stack.push(3);
std::cout << "top: " << stack.top() << "\n"; // 3
std::cout << "pop: " << stack.pop() << "\n"; // 3
std::cout << "top: " << stack.top() << "\n"; // 2

MyStack<int> empty;
try {
    empty.pop();
} catch (const std::out_of_range& e) {
    std::cout << "Caught: " << e.what() << "\n";
}
```

## Step 3: `MyStack<T>` — linked-list-backed, and why both are valid

```cpp
// MyLinkedListStack.h
#ifndef MY_LINKED_LIST_STACK_H
#define MY_LINKED_LIST_STACK_H

#include "MyLinkedList.h" // LAB-07
#include <stdexcept>

template<typename T>
class MyLinkedListStack {
private:
    MyLinkedList<T> data;

public:
    void push(T value) {
        data.push_front(value); // O(1) -- the list's STRONG operation
    }

    T pop() {
        if (data.getSize() == 0) {
            throw std::out_of_range("pop() called on empty stack");
        }
        T value = /* need access to head's value -- add a peek/front accessor to MyLinkedList */;
        data.pop_front(); // requires adding pop_front to MyLinkedList, symmetric to LAB-08's version
        return value;
    }
};

#endif
```

Notice this version deliberately uses `push_front`/`pop_front` — the *front* of the list — not the back. This is the mirror image of Step 2's array-backed choice: `MyVector`'s strong end is the *back* (O(1) push/pop there), while `MyLinkedList`'s strong end is the *front* (O(1) push/pop there, per LAB-07). Both implementations expose the identical `push`/`pop`/`top` interface to their caller — nothing about *using* a `MyStack` reveals which one is backing it, exactly LAB-18's SOLID-style "the interface doesn't leak the implementation" idea from the SE Masterclass series, arriving here in C++ form.

### SAVE AND TRY

Add `peek()`/`pop_front()` methods to `MyLinkedList` (from LAB-07) analogous to what LAB-08 built for the doubly linked version, then finish this class and run the identical push/pop sequence from Step 2's SAVE AND TRY against `MyLinkedListStack` instead — confirm the *observable behavior* (the sequence of values popped) is identical between both backing implementations, even though the underlying memory layout is completely different.

## Step 4: A real application — matching brackets

```cpp
#include "MyStack.h"
#include <string>
#include <iostream>

bool isBalanced(const std::string& text) {
    MyStack<char> stack;

    for (char c : text) {
        if (c == '(' || c == '[' || c == '{') {
            stack.push(c);
        } else if (c == ')' || c == ']' || c == '}') {
            if (stack.isEmpty()) {
                return false; // closing bracket with nothing open to match it
            }
            char last = stack.pop();
            if ((c == ')' && last != '(') ||
                (c == ']' && last != '[') ||
                (c == '}' && last != '{')) {
                return false; // wrong TYPE of bracket closed
            }
        }
    }

    return stack.isEmpty(); // if anything's still on the stack, something was never closed
}
```

This is the LIFO property doing real, load-bearing work: the *most recently opened* bracket must be the *next one closed* — exactly stack semantics. `"([{}])"` pushes `(`, `[`, `{`, then immediately pops `{` to match `}`, pops `[` to match `]`, pops `(` to match `)` — each closing bracket matches whatever's currently on *top*, never anything deeper in the stack, which is precisely why a stack (not, say, a queue) is the right structure for this problem.

### SAVE AND TRY

```cpp
std::cout << (isBalanced("([{}])") ? "BALANCED" : "NOT BALANCED") << "\n"; // BALANCED
std::cout << (isBalanced("([)]") ? "BALANCED" : "NOT BALANCED") << "\n";   // NOT BALANCED
std::cout << (isBalanced("(((") ? "BALANCED" : "NOT BALANCED") << "\n";    // NOT BALANCED
```

Trace `"([)]"` by hand before running it: push `(`, push `[`, then hit `)` — pop gives `[`, but `)` needs to match `(`, not `[` — mismatch, returns `false` immediately. Confirm your hand-trace matches the program's actual output.

## 🎯 Challenge

Extend `isBalanced` to also report *where* the mismatch occurred (the character index), not just whether it's balanced — matching this lab's "What You Will Build" output format (`NOT BALANCED (mismatch at ')')`).

<details>
<summary>Solution</summary>

```cpp
#include <optional>

struct BalanceResult {
    bool balanced;
    int mismatchIndex; // -1 if balanced or if the problem is unclosed brackets at the end
};

BalanceResult checkBalance(const std::string& text) {
    MyStack<char> stack;

    for (size_t i = 0; i < text.size(); i++) {
        char c = text[i];
        if (c == '(' || c == '[' || c == '{') {
            stack.push(c);
        } else if (c == ')' || c == ']' || c == '}') {
            if (stack.isEmpty()) {
                return { false, static_cast<int>(i) };
            }
            char last = stack.pop();
            bool mismatch = (c == ')' && last != '(') || (c == ']' && last != '[') || (c == '}' && last != '{');
            if (mismatch) {
                return { false, static_cast<int>(i) };
            }
        }
    }

    if (!stack.isEmpty()) {
        return { false, -1 }; // unclosed brackets remain -- no single index to blame
    }
    return { true, -1 };
}
```

The `BalanceResult` struct (LAB-02's plain-data convention: `struct`, not `class`, since it's just a bundle of two related values with no behavior) lets the function report both *whether* and *where* in one return value, instead of needing a second separate call or an output parameter — a clean way to return more than one piece of related information from a single function.

</details>

## Mental Model

| Concept | Wrong instinct | Correct instinct |
|---|---|---|
| Stack backing structure | Must be array OR list, pick one "correct" answer | Either works — both expose the same interface, differing only in internal trade-offs |
| `MyVector` for a stack | Bad fit — front-insertion is O(n) | Good fit — a stack only ever touches the BACK, which is O(1) |
| Empty-stack `pop()` | Return some default/garbage value | `throw` — fail loudly at the exact call site |
| Bracket matching | Any structure would work | Specifically needs LIFO — the most-recently-opened bracket closes first |

## Final Check

| # | Question | Your answer |
|---|---|---|
| 1 | Why is `MyVector` actually well-suited for a stack, despite LAB-06 showing front-insertion is O(n)? | |
| 2 | Why does `pop()` check `isEmpty()` before touching `data`, rather than just trying the access and catching whatever error results? | |
| 3 | Why does `isBalanced` return `false` immediately when a closing bracket doesn't match what's on top, rather than continuing to scan the rest of the string? | |

## Quick Check Answers

1. LIFO ("Last In, First Out") — usually explained with a physical stack of plates or trays: you can only take the top one off, and whatever plate was set down most recently is the one sitting on top, ready to be the next one removed.
2. A stack only ever operates on its *top* — `MyVector`'s back is exactly that top, and `push_back`/`pop_back` (Step 1) are both O(1) operations on `MyVector`; the O(n) front-insertion LAB-06 discussed is irrelevant here, since a stack never touches the front at all.
3. Silently returning garbage means the caller has no way to distinguish "this really was the value on top" from "the stack was empty and this is meaningless leftover memory" — an empty stack is a real, expected situation any caller needs to be able to detect and handle deliberately, not something that should produce a plausible-looking but wrong answer.

*Next: [LAB-10 — Queues and Circular Buffers](CPP-S02-LAB-10-QUEUES-AND-CIRCULAR-BUFFERS.md)*
