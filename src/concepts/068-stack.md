---
concept: 068-stack
name: Stack
---

## Definition

A stack is a data structure that only allows adding and removing items from
one end — the "top" — meaning the last item added is always the first one
removed (LIFO: last in, first out).

## Problem

Some data naturally needs to be processed in reverse order of arrival —
undoing the most recent action first, or backtracking out of whatever
function call was entered most recently. A stack enforces exactly that
access pattern by restricting operations to push (add to the top) and pop
(remove from the top), rather than allowing arbitrary insertion or removal
anywhere in the collection.

## Execution

push(1) → stack holds [1]
↓
push(2) → stack holds [1, 2]
↓
push(3) → stack holds [1, 2, 3]
↓
pop() → returns 3 (the most recently added item), stack holds [1, 2]
↓
pop() → returns 2, stack holds [1]
↓
peek() → returns 1 without removing it — stack still holds [1]

## Computer Science

A stack is exactly the structure the call stack (see the Function concept)
uses to track function calls — each call pushes a frame, each return pops
one, which is precisely why recursion (see the Recursion concept) that never
reaches its base case overflows the stack. Push, pop, and peek are all O(1)
operations, regardless of how many items the stack holds.

Tags: LIFO, Call stack, Backtracking, Constant-time operations

## Software Engineering

Stacks show up anywhere "undo" semantics or "handle the most recent thing
first" logic is needed — undo/redo history, a browser's back-button history,
matching balanced brackets in a parser, and depth-first traversal of a tree
or graph. Implementing one on top of a plain array by pushing/popping from
the END is O(1); implementing it by inserting/removing from the FRONT of an
array is O(n), since every other element has to shift over.

Tags: Undo/redo, Depth-first search, Balanced brackets, Amortized O(1)

## Common Mistakes

- Popping from an empty stack without checking first — a common source of crashes or exceptions; always check whether the stack is empty before popping.
- Implementing a stack by inserting/removing from the FRONT of an array instead of the end — this silently turns an O(1) operation into O(n), since every remaining element has to shift.

## Exercises

- Use a stack to check whether a string of brackets like `"([{}])"` is balanced — push each opening bracket, and on each closing bracket, pop and confirm it matches.
- Trace by hand what the call stack looks like while `factorial(3)` calls `factorial(2)` calls `factorial(1)` — compare it against the Recursion concept's own execution trace of the same example.

## javascript

```javascript
class Stack {
  #items = []
  push(item) { this.#items.push(item) }
  pop() { return this.#items.pop() }
  peek() { return this.#items[this.#items.length - 1] }
  get isEmpty() { return this.#items.length === 0 }
}

const s = new Stack()
s.push(1)
s.push(2)
s.push(3)
console.log(s.pop())    // 3 — last one in, first one out
console.log(s.pop())    // 2
console.log(s.peek())   // 1 — still on the stack, not removed
```
Walkthrough: `push` always adds to the end (the "top"), and `pop` always
removes from that same end — `3` was the last item pushed, so it's the first
one popped. `peek()` looks at the top without removing it, leaving `1` still
on the stack afterward.

## python

```python
class Stack:
    def __init__(self):
        self._items = []

    def push(self, item):
        self._items.append(item)

    def pop(self):
        return self._items.pop()

    def peek(self):
        return self._items[-1]

    @property
    def is_empty(self):
        return len(self._items) == 0


s = Stack()
s.push(1)
s.push(2)
s.push(3)
print(s.pop())    # 3 -- last one in, first one out
print(s.pop())    # 2
print(s.peek())   # 1 -- still on the stack, not removed
```
Walkthrough: identical LIFO behavior to the JavaScript version — Python's
list `append`/`pop()` (with no index argument) are themselves O(1)
operations on the end of the list, which is exactly why they're the natural
fit for implementing a stack.
