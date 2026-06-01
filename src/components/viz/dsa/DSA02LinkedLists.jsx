import { useState, useRef, useEffect, useCallback } from "react";
import Editor from "@monaco-editor/react";
import { setupOpenCalcMonaco } from "../../../utils/monacoThemes.js";

// ─────────────────────────────────────────────────────────────────────────────
//  DSA SERIES — APP 02: LINKED LISTS
//  Same aesthetic as App 01 — phosphor on near-black, mono everything.
//  New visual: animated node boxes with pointer arrows, not memory grid.
// ─────────────────────────────────────────────────────────────────────────────

const T = {
  bg: "#080c0f",
  surface: "#0d1117",
  panel: "#0f1923",
  border: "#1a2530",
  border2: "#243040",
  green: "#00ff88",
  green2: "#00cc66",
  blue: "#4fc3f7",
  amber: "#ffb347",
  red: "#ff4d6d",
  purple: "#c084fc",
  cyan: "#22d3ee",
  muted: "#3a5060",
  dim: "#111c26",
  text: "#c0d8e8",
  textDim: "#507080",
  textBright: "#e0f0ff",
  mono: "'JetBrains Mono','Fira Code','Cascadia Code',monospace",
  sans: "'IBM Plex Sans','SF Pro Text',system-ui,sans-serif",
};

// ─────────────────────────────────────────────────────────────────────────────
//  INTERNAL LIST REPRESENTATION
//  We represent a linked list as an array of node objects for rendering.
//  Each node: { id, value, next (id or null) }
//  This mirrors how the kernel's task_struct works in memory.
// ─────────────────────────────────────────────────────────────────────────────
let _nodeId = 1;
const makeNode = (value) => ({ id: _nodeId++, value, next: null });

const arrayToList = (arr) => {
  if (!arr.length) return null;
  const nodes = arr.map((v) => makeNode(v));
  for (let i = 0; i < nodes.length - 1; i++) nodes[i].next = nodes[i + 1].id;
  return nodes;
};

const listToArray = (nodes) => {
  if (!nodes || !nodes.length) return [];
  const map = Object.fromEntries(nodes.map((n) => [n.id, n]));
  const head = nodes[0];
  const result = [];
  let cur = head;
  let safety = 0;
  while (cur && safety < 100) {
    result.push(cur.value);
    cur = cur.next ? map[cur.next] : null;
    safety++;
  }
  return result;
};

// ─────────────────────────────────────────────────────────────────────────────
//  TRACE GENERATORS — produce step arrays for the visualizer
// ─────────────────────────────────────────────────────────────────────────────

const tracePrepend = (arr, val) => {
  const steps = [];
  const nodes = arrayToList([...arr]);

  steps.push({
    nodes: nodes ? [...nodes] : [],
    highlight: null,
    newNode: null,
    note: `State before prepend(${val}). head → ${arr[0] ?? "null"}`,
    phase: "start",
    pointers: { head: nodes?.[0]?.id ?? null },
  });

  const newNode = makeNode(val);
  steps.push({
    nodes: [newNode, ...(nodes || [])],
    highlight: newNode.id,
    newNode: newNode.id,
    note: `Allocate new node(${val}) somewhere in memory. next = null so far.`,
    phase: "alloc",
    pointers: { head: nodes?.[0]?.id ?? null, newNode: newNode.id },
  });

  newNode.next = nodes?.[0]?.id ?? null;
  steps.push({
    nodes: [newNode, ...(nodes || [])],
    highlight: newNode.id,
    newNode: newNode.id,
    note: `newNode.next = head  (point new node at old head)`,
    phase: "link",
    pointers: { head: nodes?.[0]?.id ?? null, newNode: newNode.id },
  });

  steps.push({
    nodes: [newNode, ...(nodes || [])],
    highlight: newNode.id,
    note: `head = newNode  ✓  Done in O(1) — no traversal needed.`,
    phase: "done",
    pointers: { head: newNode.id },
  });

  return steps;
};

const traceAppend = (arr, val) => {
  const steps = [];
  const nodes = arrayToList([...arr]);
  const nodeMap = nodes ? Object.fromEntries(nodes.map((n) => [n.id, n])) : {};

  steps.push({
    nodes: nodes ? [...nodes] : [],
    highlight: null,
    note: `Append(${val}). Must walk to the tail first — O(n).`,
    phase: "start",
    pointers: { head: nodes?.[0]?.id ?? null },
  });

  // Walk to tail
  let cur = nodes?.[0];
  while (cur?.next) {
    steps.push({
      nodes: nodes ? [...nodes] : [],
      highlight: cur.id,
      note: `cur = node(${cur.value}). cur.next exists → keep walking.`,
      phase: "walk",
      pointers: { head: nodes?.[0]?.id ?? null, cur: cur.id },
    });
    cur = nodeMap[cur.next];
  }
  if (cur) {
    steps.push({
      nodes: nodes ? [...nodes] : [],
      highlight: cur.id,
      note: `cur = node(${cur.value}). cur.next = null → this is the tail.`,
      phase: "tail",
      pointers: { head: nodes?.[0]?.id ?? null, cur: cur.id },
    });
  }

  const newNode = makeNode(val);
  const allNodes = [...(nodes || []), newNode];
  steps.push({
    nodes: allNodes,
    highlight: newNode.id,
    newNode: newNode.id,
    note: `Allocate new node(${val}).`,
    phase: "alloc",
    pointers: { head: nodes?.[0]?.id ?? null, cur: cur?.id ?? null },
  });

  if (cur) cur.next = newNode.id;
  steps.push({
    nodes: allNodes,
    highlight: newNode.id,
    note: `tail.next = newNode  ✓  Done. O(n) because of the walk.`,
    phase: "done",
    pointers: { head: nodes?.[0]?.id ?? null },
  });

  return steps;
};

const traceDelete = (arr, targetVal) => {
  const steps = [];
  const nodes = arrayToList([...arr]);
  if (!nodes) return steps;
  const nodeMap = Object.fromEntries(nodes.map((n) => [n.id, n]));

  steps.push({
    nodes: [...nodes],
    highlight: null,
    note: `Delete node with value ${targetVal}. Need prev pointer to rewire.`,
    phase: "start",
    pointers: { head: nodes[0].id },
  });

  // Special case: delete head
  if (nodes[0].value === targetVal) {
    steps.push({
      nodes: [...nodes],
      highlight: nodes[0].id,
      note: `Found target at head! head = head.next — no rewiring needed.`,
      phase: "found",
      pointers: { head: nodes[0].id },
    });
    const newNodes = nodes.slice(1);
    steps.push({
      nodes: newNodes,
      highlight: newNodes[0]?.id ?? null,
      note: `head = node(${newNodes[0]?.value ?? "null"})  ✓  O(1) delete.`,
      phase: "done",
      pointers: { head: newNodes[0]?.id ?? null },
    });
    return steps;
  }

  let prev = nodes[0],
    cur = nodeMap[nodes[0].next];
  steps.push({
    nodes: [...nodes],
    highlight: prev.id,
    note: `prev = head(${prev.value}), cur = node(${cur?.value}).`,
    phase: "walk",
    pointers: { head: nodes[0].id, prev: prev.id, cur: cur?.id },
  });

  while (cur) {
    if (cur.value === targetVal) {
      steps.push({
        nodes: [...nodes],
        highlight: cur.id,
        note: `Found! cur = node(${cur.value}). Rewire prev.next to skip cur.`,
        phase: "found",
        pointers: { head: nodes[0].id, prev: prev.id, cur: cur.id },
      });
      prev.next = cur.next;
      const newNodes = nodes.filter((n) => n.id !== cur.id);
      steps.push({
        nodes: newNodes,
        highlight: prev.id,
        note: `prev.next = cur.next  ✓  cur is now unreachable (garbage collected). O(1) pointer rewire.`,
        phase: "done",
        pointers: { head: nodes[0].id },
      });
      return steps;
    }
    steps.push({
      nodes: [...nodes],
      highlight: cur.id,
      note: `cur(${cur.value}) ≠ ${targetVal} → advance. prev = cur.`,
      phase: "walk",
      pointers: { head: nodes[0].id, prev: prev.id, cur: cur.id },
    });
    prev = cur;
    cur = nodeMap[cur.next];
  }

  steps.push({
    nodes: [...nodes],
    highlight: null,
    note: `Value ${targetVal} not found in list.`,
    phase: "notfound",
    pointers: { head: nodes[0].id },
  });
  return steps;
};

const traceReverse = (arr) => {
  const steps = [];
  const nodes = arrayToList([...arr]);
  if (!nodes || nodes.length < 2) return steps;
  const nodeMap = Object.fromEntries(nodes.map((n) => [n.id, n]));

  steps.push({
    nodes: [...nodes],
    highlight: null,
    note: `Reverse. Three pointers: prev=null, cur=head, next=null`,
    phase: "start",
    pointers: { head: nodes[0].id },
    prev: null,
    cur: nodes[0].id,
    nxt: null,
  });

  let prev = null;
  let cur = nodes[0];

  while (cur) {
    const next = cur.next ? nodeMap[cur.next] : null;
    steps.push({
      nodes: [...nodes],
      highlight: cur.id,
      note: `Save next = cur.next = ${next?.value ?? "null"}`,
      phase: "save",
      pointers: { head: nodes[0].id },
      prev: prev?.id ?? null,
      cur: cur.id,
      nxt: next?.id ?? null,
    });

    cur.next = prev ? prev.id : null;
    steps.push({
      nodes: [...nodes],
      highlight: cur.id,
      note: `cur.next = prev (${prev?.value ?? "null"}) — flip the arrow`,
      phase: "flip",
      pointers: { head: nodes[0].id },
      prev: prev?.id ?? null,
      cur: cur.id,
      nxt: next?.id ?? null,
    });

    prev = cur;
    cur = next;

    if (cur) {
      steps.push({
        nodes: [...nodes],
        highlight: cur.id,
        note: `Advance: prev = old cur, cur = saved next(${cur.value})`,
        phase: "advance",
        pointers: { head: nodes[0].id },
        prev: prev?.id ?? null,
        cur: cur.id,
        nxt: null,
      });
    }
  }

  steps.push({
    nodes: [...nodes].reverse(),
    highlight: prev?.id ?? null,
    note: `Done. head = prev = node(${prev?.value})  ✓  O(n), O(1) space.`,
    phase: "done",
    pointers: { head: prev?.id ?? null },
    prev: null,
    cur: null,
    nxt: null,
  });

  return steps;
};

const traceCycle = (arr, cycleAt) => {
  const steps = [];
  const vals = [...arr];
  const nodes = vals.map((v, i) => ({
    id: i,
    value: v,
    next: i < vals.length - 1 ? i + 1 : cycleAt >= 0 ? cycleAt : null,
  }));

  steps.push({
    nodes: [...nodes],
    slow: 0,
    fast: 0,
    note: `Floyd's cycle detection. slow and fast both start at head.`,
    phase: "start",
    hasCycle: cycleAt >= 0,
  });

  let slow = 0,
    fast = 0,
    safety = 0;
  while (safety < 20) {
    const nextFast =
      nodes[fast]?.next != null
        ? (nodes[nodes[fast].next]?.next ?? null)
        : null;
    if (nextFast === null && nodes[fast]?.next === null) {
      fast = null;
      break;
    }
    slow = nodes[slow].next;
    fast = nodes[nodes[fast].next]?.next ?? null;
    if (fast === null) break;
    safety++;

    steps.push({
      nodes: [...nodes],
      slow,
      fast,
      note: `slow → ${nodes[slow]?.value}, fast → ${fast !== null ? nodes[fast]?.value : "null"}  ${slow === fast ? "EQUAL — cycle detected!" : ""}`,
      phase: slow === fast ? "found" : "walk",
      hasCycle: cycleAt >= 0,
    });

    if (slow === fast) break;
  }

  if (fast === null) {
    steps.push({
      nodes: [...nodes],
      slow: null,
      fast: null,
      note: `fast reached null — no cycle. List terminates normally.`,
      phase: "nocycle",
      hasCycle: false,
    });
  }

  return steps;
};

// ─────────────────────────────────────────────────────────────────────────────
//  LESSONS
// ─────────────────────────────────────────────────────────────────────────────
const LESSONS = [
  {
    id: 0,
    title: "Nodes & Pointers",
    shortTitle: "Nodes",
    color: T.green,
    osHook: "task_struct / kernel memory",
    concept: [
      {
        head: "What a linked list actually is",
        body: `A linked list is NOT a contiguous block of memory.
It is a chain of independently allocated objects,
each holding a value and a pointer to the next.

In C (which is what the Linux kernel is written in):

  struct Node {
    int value;
    struct Node *next;  // pointer = memory address
  };

"Pointer" means: a variable that holds a memory
address. node->next = 0x7f3a2c10 means "the next
node lives at address 0x7f3a2c10".

The list has no fixed location in memory. Nodes
can be anywhere on the heap — scattered randomly.`,
      },
      {
        head: "OS: every process is a node",
        body: `The Linux kernel represents every process as a
task_struct — a large C struct (~700 fields).

Inside task_struct:
  struct list_head {
    struct list_head *next;
    struct list_head *prev;
  } tasks;

Every running process is a node in a circular
doubly-linked list. The kernel's init process
(PID 1) is the head.

Run this in a terminal:
  cat /proc/1/status      # init's task_struct
  ls /proc/               # all PIDs = all nodes

When you type 'ps aux', the kernel walks this
linked list and prints each task_struct's fields.
O(n) traversal — same as your code below.`,
      },
      {
        head: "Why not just use an array?",
        body: `For processes: new processes are created and
destroyed constantly. With an array, creating
a process would require O(n) shifting.

With a linked list, fork() = allocate one
task_struct + two pointer writes = O(1).

The trade-off:
  Array:       O(1) access by index, O(n) insert/delete
  Linked list: O(n) access by index, O(1) insert/delete
                                     (if you have the pointer)

This is the fundamental data structure choice
that shapes the Linux process scheduler.`,
      },
    ],
    pseudo: `// A node is just a struct with two fields:
STRUCT Node:
  value   ← the data (int, string, anything)
  next    ← pointer to next Node (or null)

// Create a node:
FUNCTION makeNode(value):
  node ← allocate new Node on heap
  node.value ← value
  node.next  ← null
  RETURN node   // return the pointer (address)

// Traverse a list:
FUNCTION printAll(head):
  cur ← head
  WHILE cur ≠ null:
    PRINT cur.value
    cur ← cur.next   // follow the pointer`,
    starterCode: `// In JavaScript, objects act as nodes.
// { value: 5, next: null } is a node.

function makeNode(value) {
  // YOUR CODE ↓
  // Return an object with 'value' and 'next: null'
  ___
}

function listLength(head) {
  // YOUR CODE ↓
  // Walk the list counting nodes until cur === null
  // Tip: let cur = head; while (cur !== null) { ... cur = cur.next; }
  let count = 0;
  ___
  return count;
}`,
    blanks: ["___", "___"],
    solutions: [
      `  return { value, next: null };`,
      `  let cur = head;\n  while (cur !== null) { count++; cur = cur.next; }`,
    ],
    testFn: (fn) => {
      const src = fn.toString();
      // Extract both functions
      const mkMatch = src.match(/function makeNode[\s\S]*?(?=function|\}$)/);
      const llMatch = src.match(/function listLength[\s\S]*/);
      try {
        // eslint-disable-next-line no-new-func
        const mkFn = new Function(
          `return ${mkMatch[0].trim().replace(/function makeNode/, "function")}`,
        )();
        // eslint-disable-next-line no-new-func
        const llFn = new Function(`return ${llMatch[0].trim()}`)();
        const n1 = mkFn(42);
        const n2 = mkFn(7);
        n1.next = n2;
        const len = llFn(n1);
        const lenNull = llFn(null);
        return {
          ok:
            n1.value === 42 &&
            n1.next === n2 &&
            n2.next === null &&
            len === 2 &&
            lenNull === 0,
          result: `node(${n1.value}) → node(${n2.value}) → null, length=${len}`,
          checks: [
            { label: "makeNode(42).value === 42", pass: n1.value === 42 },
            { label: "makeNode().next === null", pass: n2.next === null },
            { label: "Can link: n1.next = n2", pass: n1.next === n2 },
            { label: "listLength(2-node list) === 2", pass: len === 2 },
            { label: "listLength(null) === 0", pass: lenNull === 0 },
          ],
        };
      } catch (e) {
        return {
          ok: false,
          result: null,
          checks: [{ label: String(e), pass: false }],
        };
      }
    },
    multi: true,
  },

  {
    id: 1,
    title: "Prepend & Append",
    shortTitle: "Insert",
    color: T.blue,
    osHook: "fork() / process creation",
    concept: [
      {
        head: "Prepend is O(1) — no traversal",
        body: `Adding to the front of a linked list:
  1. Allocate new node
  2. new.next = head
  3. head = new

Three operations. Constant time regardless of
list length. This is the O(1) insert that arrays
cannot do.

This is why doubly-linked lists with a head
pointer are used for anything that requires
frequent prepending — like a job queue where
high-priority jobs jump to the front.`,
      },
      {
        head: "OS: fork() is a list prepend",
        body: `When you run a command in the terminal, the
shell calls fork(). The kernel:

  1. Allocates a new task_struct (O(1) from slab allocator)
  2. Copies the parent's task_struct
  3. Inserts it into the process list:
       list_add(&p->tasks, &init_task.tasks)
       // ^ this is literally a linked list prepend

The Linux source: kernel/fork.c ~ line 2000.
list_add() does exactly newNode.next = head.

On a busy server doing 1000 fork()s/second,
O(1) insert matters enormously.`,
      },
      {
        head: "Append is O(n) without a tail pointer",
        body: `Adding to the end requires walking to the tail.
Every step must follow next pointers — O(n).

The fix: keep a tail pointer alongside head.
  list.head = first node
  list.tail = last node

Then append becomes:
  tail.next = newNode
  tail = newNode
  // O(1) — no traversal

This is the standard optimization. Python's
collections.deque and most production linked
list implementations maintain both head and tail.

Without tail pointer: append O(n).
With tail pointer:    append O(1).`,
      },
    ],
    pseudo: `FUNCTION prepend(head, value):
  newNode ← makeNode(value)
  newNode.next ← head    // point at old head
  head ← newNode         // update head pointer
  RETURN head            // O(1) — constant time

FUNCTION append(head, value):
  newNode ← makeNode(value)
  IF head = null:
    RETURN newNode       // empty list

  cur ← head
  WHILE cur.next ≠ null: // walk to tail — O(n)
    cur ← cur.next

  cur.next ← newNode     // attach at end
  RETURN head`,
    starterCode: `function prepend(head, value) {
  // YOUR CODE ↓
  // 1. Create a new node with the value
  // 2. Set newNode.next = head
  // 3. Return newNode as the new head
  ___
}

function append(head, value) {
  const newNode = { value, next: null };
  if (head === null) return newNode;

  // YOUR CODE ↓
  // Walk to the last node (where cur.next === null)
  // Then set cur.next = newNode
  // Return the original head (it doesn't change)
  ___
}`,
    blanks: ["___", "___"],
    solutions: [
      `  const newNode = { value, next: null };\n  newNode.next = head;\n  return newNode;`,
      `  let cur = head;\n  while (cur.next !== null) cur = cur.next;\n  cur.next = newNode;\n  return head;`,
    ],
    testFn: (fn) => {
      const src = fn.toString();
      try {
        // eslint-disable-next-line no-new-func
        const preFn = new Function(
          `return ${src.match(/function prepend[\s\S]*?(?=\nfunction)/)[0]}`,
        )();
        // eslint-disable-next-line no-new-func
        const appFn = new Function(
          `return ${src.match(/function append[\s\S]*/)[0]}`,
        )();
        let h = null;
        h = preFn(h, 3);
        h = preFn(h, 2);
        h = preFn(h, 1);
        const preVals = [];
        let c = h;
        while (c) {
          preVals.push(c.value);
          c = c.next;
        }

        let h2 = null;
        h2 = appFn(h2, 1);
        h2 = appFn(h2, 2);
        h2 = appFn(h2, 3);
        const appVals = [];
        c = h2;
        while (c) {
          appVals.push(c.value);
          c = c.next;
        }

        const preOk = JSON.stringify(preVals) === "[1,2,3]";
        const appOk = JSON.stringify(appVals) === "[1,2,3]";
        return {
          ok: preOk && appOk,
          result: `prepend order: [${preVals}], append order: [${appVals}]`,
          checks: [
            { label: "prepend builds list in reverse: [1,2,3]", pass: preOk },
            { label: "append builds list in order: [1,2,3]", pass: appOk },
            {
              label: "prepend to empty list works",
              pass: preFn(null, 5)?.value === 5,
            },
            {
              label: "append to empty list works",
              pass: appFn(null, 5)?.value === 5,
            },
          ],
        };
      } catch (e) {
        return {
          ok: false,
          result: null,
          checks: [{ label: String(e), pass: false }],
        };
      }
    },
    multi: true,
    hasTrace: true,
    traceType: "prepend",
  },

  {
    id: 2,
    title: "Delete a Node",
    shortTitle: "Delete",
    color: T.amber,
    osHook: "process exit / task removal",
    concept: [
      {
        head: "O(1) delete — if you have the prev pointer",
        body: `Deleting a node requires only two pointer writes:
  prev.next = target.next

The target node is now unreachable — no code
can get to it by following pointers from head.
The garbage collector (or free()) will reclaim it.

No shifting. No moving data. Two pointer assignments.
This is the fundamental advantage over arrays.

The catch: you need the previous node's pointer.
Finding it by value requires O(n) traversal first.
A doubly-linked list stores prev pointers in each
node, making deletion O(1) if you have ANY pointer
into the list.`,
      },
      {
        head: "OS: process exit and list_del()",
        body: `When a process calls exit(), the kernel calls
do_exit() in kernel/exit.c, which eventually
calls list_del() to remove the task_struct:

  static inline void __list_del(
    struct list_head *prev,
    struct list_head *next)
  {
    next->prev = prev;   // rewire backward
    prev->next = next;   // rewire forward
  }

Exactly two pointer writes. The process is gone
from the scheduler's view in O(1) — even if there
are millions of other processes running.

The freed task_struct memory returns to the kernel's
slab allocator — a free-list of reusable structs.`,
      },
      {
        head: "Edge cases that bite everyone",
        body: `1. Deleting the head node:
   head = head.next  (no prev node to update)

2. Deleting the tail node:
   prev.next = null

3. Deleting from a single-node list:
   head = null

4. Deleting a node not in the list:
   walk reaches null without finding target
   → do nothing (or throw, depending on API)

Real implementations handle all four. Many
interview candidates only handle the middle case
and fail on edge cases. Check yours below.`,
      },
    ],
    pseudo: `FUNCTION delete(head, target_value):
  IF head = null: RETURN null

  // Edge case: target is the head node
  IF head.value = target_value:
    RETURN head.next    // new head

  // General case: find prev such that prev.next.value = target
  prev ← head
  WHILE prev.next ≠ null:
    IF prev.next.value = target_value:
      prev.next ← prev.next.next  // skip target
      RETURN head
    prev ← prev.next

  RETURN head   // not found, list unchanged`,
    starterCode: `function deleteNode(head, targetValue) {
  if (head === null) return null;

  // YOUR CODE A ↓
  // Handle the edge case: target is the head node
  // If so, return head.next as the new head
  ___A___

  // YOUR CODE B ↓
  // Walk the list using a 'prev' pointer
  // When prev.next.value === targetValue:
  //   prev.next = prev.next.next  (skip it)
  //   return head
  // If not found, return head unchanged
  ___B___
}`,
    blanks: ["___A___", "___B___"],
    solutions: [
      `  if (head.value === targetValue) return head.next;`,
      `  let prev = head;\n  while (prev.next !== null) {\n    if (prev.next.value === targetValue) {\n      prev.next = prev.next.next;\n      return head;\n    }\n    prev = prev.next;\n  }\n  return head;`,
    ],
    testFn: (fn) => {
      const makeList = (arr) => {
        if (!arr.length) return null;
        const nodes = arr.map((v) => ({ value: v, next: null }));
        for (let i = 0; i < nodes.length - 1; i++) nodes[i].next = nodes[i + 1];
        return nodes[0];
      };
      const toArr = (h) => {
        const r = [];
        let c = h,
          s = 0;
        while (c && s < 20) {
          r.push(c.value);
          c = c.next;
          s++;
        }
        return r;
      };
      try {
        const r1 = toArr(fn(makeList([1, 2, 3, 4, 5]), 3));
        const r2 = toArr(fn(makeList([1, 2, 3, 4, 5]), 1));
        const r3 = toArr(fn(makeList([1, 2, 3, 4, 5]), 5));
        const r4 = toArr(fn(makeList([1, 2, 3, 4, 5]), 9));
        const r5 = toArr(fn(null, 1));
        return {
          ok:
            JSON.stringify(r1) === "[1,2,3,4,5]".replace("3,", "") &&
            JSON.stringify(r2) === "[2,3,4,5]",
          result: `delete(3): [${r1}]`,
          checks: [
            {
              label: "delete middle (3) → [1,2,4,5]",
              pass: JSON.stringify(r1) === "[1,2,4,5]",
            },
            {
              label: "delete head (1) → [2,3,4,5]",
              pass: JSON.stringify(r2) === "[2,3,4,5]",
            },
            {
              label: "delete tail (5) → [1,2,3,4]",
              pass: JSON.stringify(r3) === "[1,2,3,4]",
            },
            {
              label: "delete missing (9) → unchanged",
              pass: JSON.stringify(r4) === "[1,2,3,4,5]",
            },
            { label: "delete from null → null", pass: r5.length === 0 },
          ],
        };
      } catch (e) {
        return {
          ok: false,
          result: null,
          checks: [{ label: String(e), pass: false }],
        };
      }
    },
    multi: true,
    hasTrace: true,
    traceType: "delete",
  },

  {
    id: 3,
    title: "Reverse a List",
    shortTitle: "Reverse",
    color: T.purple,
    osHook: "VMA list / memory maps",
    concept: [
      {
        head: "Three-pointer technique",
        body: `Reversing a linked list is a classic problem
because it forces you to manage pointer state
carefully. You cannot lose a node mid-operation.

Three pointers: prev, cur, next
  prev = null  (will become the new tail's next)
  cur  = head  (current node being processed)
  next = null  (saved before we overwrite cur.next)

Each iteration:
  1. Save next = cur.next        (don't lose it!)
  2. cur.next = prev             (flip the arrow)
  3. prev = cur                  (advance prev)
  4. cur  = next                 (advance cur)

When cur reaches null, prev is the new head.
O(n) time, O(1) space — no extra memory needed.`,
      },
      {
        head: "OS: /proc/self/maps and VMA list",
        body: `Every process has a list of Virtual Memory Areas
(VMAs) — contiguous ranges of virtual addresses
with the same permissions (read, write, execute).

The kernel stores them as a linked list:
  struct vm_area_struct {
    unsigned long vm_start;  // start address
    unsigned long vm_end;    // end address
    struct vm_area_struct *vm_next;
    struct vm_area_struct *vm_prev;
    ...
  };

Try: cat /proc/self/maps
Each line is one VMA node. The kernel traverses
this list for page fault handling, mmap(), and
memory accounting.

The list must occasionally be reordered — when
new mappings are created, the VMAs are sorted
by start address. Reversing is a building block
for these reorganization operations.`,
      },
      {
        head: "Recursive vs iterative",
        body: `Recursive reversal is elegant but dangerous:

  function reverse(node, prev=null) {
    if (!node) return prev;
    const next = node.next;
    node.next = prev;
    return reverse(next, node);  // tail call
  }

Problem: each recursive call adds a stack frame.
For a list of 10,000 nodes → 10,000 stack frames.
Default stack size is ~8MB. At ~200 bytes/frame,
you stack-overflow at ~40,000 nodes.

The iterative version uses O(1) stack space.
This is why production code prefers iteration
for list operations on potentially long lists.
The kernel's linked list operations are all
iterative for exactly this reason.`,
      },
    ],
    pseudo: `FUNCTION reverse(head):
  prev ← null
  cur  ← head

  WHILE cur ≠ null:
    next    ← cur.next    // 1. save next (CRITICAL)
    cur.next ← prev       // 2. flip arrow backward
    prev    ← cur         // 3. advance prev
    cur     ← next        // 4. advance cur

  // cur is null, prev is the new head
  RETURN prev`,
    starterCode: `function reverseList(head) {
  let prev = null;
  let cur  = head;

  while (cur !== null) {
    // YOUR CODE ↓
    // Step 1: save cur.next before you overwrite it
    // Step 2: flip cur.next to point backward (to prev)
    // Step 3: advance prev to cur
    // Step 4: advance cur to saved next
    // All four steps, in order.
    ___
  }

  return prev; // prev is now the new head
}`,
    blanks: ["___"],
    solutions: [
      `    const next = cur.next;\n    cur.next = prev;\n    prev = cur;\n    cur = next;`,
    ],
    testFn: (fn) => {
      const makeList = (arr) => {
        if (!arr.length) return null;
        const nodes = arr.map((v) => ({ value: v, next: null }));
        for (let i = 0; i < nodes.length - 1; i++) nodes[i].next = nodes[i + 1];
        return nodes[0];
      };
      const toArr = (h) => {
        const r = [];
        let c = h,
          s = 0;
        while (c && s < 20) {
          r.push(c.value);
          c = c.next;
          s++;
        }
        return r;
      };
      try {
        const r1 = toArr(fn(makeList([1, 2, 3, 4, 5])));
        const r2 = toArr(fn(makeList([1])));
        const r3 = toArr(fn(null));
        const r4 = toArr(fn(makeList([1, 2])));
        return {
          ok: JSON.stringify(r1) === "[5,4,3,2,1]",
          result: `[${r1}]`,
          checks: [
            {
              label: "reverse([1,2,3,4,5]) = [5,4,3,2,1]",
              pass: JSON.stringify(r1) === "[5,4,3,2,1]",
            },
            {
              label: "reverse([1]) = [1] (single node)",
              pass: JSON.stringify(r2) === "[1]",
            },
            { label: "reverse(null) = null", pass: r3.length === 0 },
            {
              label: "reverse([1,2]) = [2,1]",
              pass: JSON.stringify(r4) === "[2,1]",
            },
          ],
        };
      } catch (e) {
        return {
          ok: false,
          result: null,
          checks: [{ label: String(e), pass: false }],
        };
      }
    },
    hasTrace: true,
    traceType: "reverse",
  },

  {
    id: 4,
    title: "Detect a Cycle",
    shortTitle: "Cycle",
    color: T.cyan,
    osHook: "Deadlock detection",
    concept: [
      {
        head: "Floyd's cycle detection algorithm",
        body: `Two pointers: slow (moves 1 step) and fast (2 steps).

If there is NO cycle: fast reaches null. Done.
If there IS a cycle: fast laps slow. They meet.

Why do they always meet inside the cycle?
Once both pointers are in the cycle:
  - Each iteration, fast gains 1 step on slow
  - The "distance" between them decreases by 1
  - Eventually distance = 0 → they are equal

Time:  O(n) — fast pointer covers the list once
Space: O(1) — only two pointer variables

Compare to the naive approach:
  Store every visited node in a hash set.
  O(n) time but O(n) space — uses memory
  proportional to list length.

Floyd's is the gold standard: O(n) time, O(1) space.`,
      },
      {
        head: "OS: deadlock detection",
        body: `A deadlock occurs when processes wait for each
other in a cycle:
  Process A waits for resource held by B
  Process B waits for resource held by C
  Process C waits for resource held by A

The kernel models this as a wait-for graph:
nodes are processes, edges are "waits for".
A deadlock = a cycle in this graph.

The Linux kernel uses a depth-limited DFS cycle
detector in its mutex/lock infrastructure
(CONFIG_LOCKDEP). It builds a lock dependency
graph and checks for cycles every time a lock
is acquired — in debug kernels.

Database engines (MySQL, PostgreSQL) run deadlock
detection on their transaction wait-for graphs
using similar cycle-detection algorithms.`,
      },
      {
        head: "Finding where the cycle starts",
        body: `Floyd's tells you IF there's a cycle.
To find WHERE it starts (cycle entry point):

After slow == fast (meeting point inside cycle):
  Reset slow to head.
  Move both slow and fast ONE step at a time.
  They meet at the cycle start.

Mathematical proof:
  Let F = steps from head to cycle start
  Let C = cycle length
  Let H = steps from cycle start to meeting point
  
  slow traveled: F + H
  fast traveled: F + H + n*C  (lapped slow n times)
  fast = 2 × slow:
    F + H + n*C = 2(F + H)
    n*C = F + H
    F = n*C - H
  
  Resetting slow to head and advancing both 1 step:
  After F more steps, slow is at cycle start.
  Fast is also at cycle start (it did n full cycles
  minus H steps, then F = n*C-H more steps).`,
      },
    ],
    pseudo: `FUNCTION hasCycle(head):
  slow ← head
  fast ← head

  WHILE fast ≠ null AND fast.next ≠ null:
    slow ← slow.next          // 1 step
    fast ← fast.next.next     // 2 steps

    IF slow = fast:
      RETURN true             // pointers met — cycle!

  RETURN false                // fast hit null — no cycle

// O(n) time, O(1) space`,
    starterCode: `function hasCycle(head) {
  let slow = head;
  let fast = head;

  // YOUR CODE ↓
  // Move slow 1 step, fast 2 steps each iteration
  // If they ever point to the same node: cycle exists
  // If fast or fast.next becomes null: no cycle
  // Return true if cycle found, false otherwise
  ___
}`,
    blanks: ["___"],
    solutions: [
      `  while (fast !== null && fast.next !== null) {\n    slow = slow.next;\n    fast = fast.next.next;\n    if (slow === fast) return true;\n  }\n  return false;`,
    ],
    testFn: (fn) => {
      // Build list with cycle
      const makeCycleList = (arr, cycleAt) => {
        if (!arr.length) return null;
        const nodes = arr.map((v) => ({ value: v, next: null }));
        for (let i = 0; i < nodes.length - 1; i++) nodes[i].next = nodes[i + 1];
        if (cycleAt >= 0) nodes[nodes.length - 1].next = nodes[cycleAt];
        return nodes[0];
      };
      try {
        const cyclic = makeCycleList([1, 2, 3, 4, 5], 1);
        const acyclic = makeCycleList([1, 2, 3, 4, 5], -1);
        const single = makeCycleList([1], -1);
        const selfLoop = makeCycleList([1], 0);
        return {
          ok: fn(cyclic) === true && fn(acyclic) === false,
          result: `cycle: ${fn(cyclic)}, no cycle: ${fn(acyclic)}`,
          checks: [
            { label: "detects cycle at node 1", pass: fn(cyclic) === true },
            {
              label: "no false positive on acyclic list",
              pass: fn(acyclic) === false,
            },
            { label: "null head → false", pass: fn(null) === false },
            {
              label: "single node, no cycle → false",
              pass: fn(single) === false,
            },
            {
              label: "self-loop (node.next = node) → true",
              pass: fn(selfLoop) === true,
            },
          ],
        };
      } catch (e) {
        return {
          ok: false,
          result: null,
          checks: [{ label: String(e), pass: false }],
        };
      }
    },
    hasTrace: true,
    traceType: "cycle",
  },
];

// ── PYTHON STARTERS ───────────────────────────────────────────────────────────
const PY_STARTERS = [
  `class Node:
    def __init__(self, value):
        # YOUR CODE ↓  set self.value and self.next
        ___

def list_length(head):
    count = 0
    # YOUR CODE ↓  walk the list
    ___
    return count`,

  `def prepend(head, value):
    # YOUR CODE ↓  create node, point at head, return new head
    ___

def append(head, value):
    new_node = Node(value)
    if head is None: return new_node
    # YOUR CODE ↓  walk to tail, attach
    ___`,

  `def delete_node(head, target_value):
    if head is None: return None
    # YOUR CODE A ↓  handle deleting the head
    ___A___
    # YOUR CODE B ↓  walk with prev pointer, rewire
    ___B___`,

  `def reverse_list(head):
    prev = None
    cur  = head
    while cur is not None:
        # YOUR CODE ↓  four steps: save next, flip, advance prev, advance cur
        ___
    return prev`,

  `def has_cycle(head):
    slow = head
    fast = head
    # YOUR CODE ↓  Floyd's algorithm
    ___`,
];

const PY_BLANKS = [
  ["___", "___"],
  ["___", "___"],
  ["___A___", "___B___"],
  ["___"],
  ["___"],
];

const PY_SOLUTIONS = [
  [
    "        self.value = value\n        self.next = None",
    "    cur = head\n    while cur is not None:\n        count += 1\n        cur = cur.next",
  ],
  [
    "    new_node = Node(value)\n    new_node.next = head\n    return new_node",
    "    cur = head\n    while cur.next is not None: cur = cur.next\n    cur.next = new_node\n    return head",
  ],
  [
    "    if head.value == target_value: return head.next",
    "    prev = head\n    while prev.next is not None:\n        if prev.next.value == target_value:\n            prev.next = prev.next.next\n            return head\n        prev = prev.next\n    return head",
  ],
  [
    "        nxt = cur.next\n        cur.next = prev\n        prev = cur\n        cur = nxt",
  ],
  [
    "    while fast is not None and fast.next is not None:\n        slow = slow.next\n        fast = fast.next.next\n        if slow is fast: return True\n    return False",
  ],
];

const PY_HARNESSES = [
  `import json as _j
_n = Node(42)
_n2 = Node(7); _n.next = _n2
_len = list_length(_n)
_len0 = list_length(None)
_checks=[
  {'label':'Node(42).value==42','pass':_n.value==42},
  {'label':'Node().next is None','pass':Node(1).next is None},
  {'label':'length of 2-node list==2','pass':_len==2},
  {'label':'length of None==0','pass':_len0==0},
]
_matrix_result=_j.dumps({'ok':all(c['pass'] for c in _checks),'checks':_checks,'result':_len})`,

  `import json as _j
_h=None
_h=prepend(_h,3);_h=prepend(_h,2);_h=prepend(_h,1)
_pre=[]
_c=_h
while _c:_pre.append(_c.value);_c=_c.next
_h2=None
_h2=append(_h2,1);_h2=append(_h2,2);_h2=append(_h2,3)
_app=[]
_c=_h2
while _c:_app.append(_c.value);_c=_c.next
_checks=[
  {'label':'prepend order [1,2,3]','pass':_pre==[1,2,3]},
  {'label':'append order [1,2,3]','pass':_app==[1,2,3]},
]
_matrix_result=_j.dumps({'ok':all(c['pass'] for c in _checks),'checks':_checks,'result':_pre})`,

  `import json as _j
def _mk(arr):
    if not arr: return None
    ns=[Node(v) for v in arr]
    for i in range(len(ns)-1): ns[i].next=ns[i+1]
    return ns[0]
def _to(h):
    r=[];c=h;s=0
    while c and s<20:r.append(c.value);c=c.next;s+=1
    return r
_r1=_to(delete_node(_mk([1,2,3,4,5]),3))
_r2=_to(delete_node(_mk([1,2,3,4,5]),1))
_r3=_to(delete_node(_mk([1,2,3,4,5]),9))
_checks=[
  {'label':'delete middle','pass':_r1==[1,2,4,5]},
  {'label':'delete head','pass':_r2==[2,3,4,5]},
  {'label':'delete missing','pass':_r3==[1,2,3,4,5]},
]
_matrix_result=_j.dumps({'ok':all(c['pass'] for c in _checks),'checks':_checks,'result':_r1})`,

  `import json as _j
def _mk(arr):
    if not arr: return None
    ns=[Node(v) for v in arr]
    for i in range(len(ns)-1): ns[i].next=ns[i+1]
    return ns[0]
def _to(h):
    r=[];c=h;s=0
    while c and s<20:r.append(c.value);c=c.next;s+=1
    return r
_r=_to(reverse_list(_mk([1,2,3,4,5])))
_r2=_to(reverse_list(_mk([1])))
_checks=[
  {'label':'reverse [1..5]=[5..1]','pass':_r==[5,4,3,2,1]},
  {'label':'reverse single=[1]','pass':_r2==[1]},
  {'label':'reverse None=None','pass':reverse_list(None) is None},
]
_matrix_result=_j.dumps({'ok':all(c['pass'] for c in _checks),'checks':_checks,'result':_r})`,

  `import json as _j
def _mk(arr,cycle_at=-1):
    if not arr: return None
    ns=[Node(v) for v in arr]
    for i in range(len(ns)-1): ns[i].next=ns[i+1]
    if cycle_at>=0: ns[-1].next=ns[cycle_at]
    return ns[0]
_cyclic=_mk([1,2,3,4,5],1)
_acyclic=_mk([1,2,3,4,5])
_checks=[
  {'label':'detects cycle','pass':has_cycle(_cyclic)==True},
  {'label':'no false positive','pass':has_cycle(_acyclic)==False},
  {'label':'None head -> False','pass':has_cycle(None)==False},
]
_matrix_result=_j.dumps({'ok':all(c['pass'] for c in _checks),'checks':_checks,'result':has_cycle(_cyclic)})`,
];

// ── JS RUNNER ─────────────────────────────────────────────────────────────────
const runJS = (lesson, code) => {
  try {
    // eslint-disable-next-line no-new-func
    const fns = new Function(
      code +
        "; return { makeNode: typeof makeNode!=='undefined'?makeNode:null, listLength: typeof listLength!=='undefined'?listLength:null, prepend: typeof prepend!=='undefined'?prepend:null, append: typeof append!=='undefined'?append:null, deleteNode: typeof deleteNode!=='undefined'?deleteNode:null, reverseList: typeof reverseList!=='undefined'?reverseList:null, hasCycle: typeof hasCycle!=='undefined'?hasCycle:null };",
    )();
    const fnMatch = code.match(/function\s+(\w+)/);
    if (!fnMatch) return { error: "No function found." };
    const testResult = lesson.testFn(fns[fnMatch[1]] || (() => {}));
    return { testResult, error: null };
  } catch (e) {
    return { error: e.message || String(e) };
  }
};

// ── LINKED LIST VISUALIZER ────────────────────────────────────────────────────
const NodeBox = ({
  node,
  isHighlight,
  isNew,
  isSlow,
  isFast,
  isPrev,
  isCur,
  isHead,
  color,
}) => {
  const border = isHighlight
    ? color
    : isNew
      ? T.green
      : isHead
        ? T.blue
        : T.border2;
  const bg = isHighlight
    ? `${color}15`
    : isNew
      ? `${T.green}10`
      : isHead
        ? `${T.blue}08`
        : T.dim;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 3,
      }}
    >
      {/* Pointer label above */}
      <div
        style={{
          height: 16,
          display: "flex",
          gap: 4,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {isHead && (
          <span
            style={{
              fontSize: 8,
              color: T.blue,
              fontFamily: T.mono,
              fontWeight: 700,
            }}
          >
            HEAD
          </span>
        )}
        {isSlow && (
          <span
            style={{
              fontSize: 8,
              color: T.amber,
              fontFamily: T.mono,
              fontWeight: 700,
            }}
          >
            slow
          </span>
        )}
        {isFast && (
          <span
            style={{
              fontSize: 8,
              color: T.red,
              fontFamily: T.mono,
              fontWeight: 700,
            }}
          >
            fast
          </span>
        )}
        {isPrev && (
          <span style={{ fontSize: 8, color: T.purple, fontFamily: T.mono }}>
            prev
          </span>
        )}
        {isCur && (
          <span style={{ fontSize: 8, color: T.green, fontFamily: T.mono }}>
            cur
          </span>
        )}
      </div>

      {/* Node box */}
      <div
        style={{
          display: "flex",
          borderRadius: 5,
          border: `1.5px solid ${border}`,
          background: bg,
          overflow: "hidden",
          boxShadow: isHighlight
            ? `0 0 10px ${color}44`
            : isNew
              ? `0 0 8px ${T.green}33`
              : "none",
          transition: "all .25s",
        }}
      >
        {/* Value cell */}
        <div
          style={{
            width: 46,
            height: 40,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: T.mono,
            fontSize: 14,
            fontWeight: 700,
            color: isHighlight ? color : isNew ? T.green : T.textBright,
            borderRight: `1px solid ${border}`,
          }}
        >
          {node.value}
        </div>
        {/* Next pointer cell */}
        <div
          style={{
            width: 26,
            height: 40,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: T.mono,
            fontSize: 9,
            color: T.muted,
          }}
        >
          {node.next !== null ? "→" : "∅"}
        </div>
      </div>

      {/* Node id hint */}
      <div style={{ fontSize: 7, color: T.muted, fontFamily: T.mono }}>
        id:{node.id}
      </div>
    </div>
  );
};

const LinkedListViz = ({ steps, stepIdx, color }) => {
  if (!steps || !steps.length) return null;
  const step = steps[Math.min(stepIdx, steps.length - 1)];
  const {
    nodes,
    highlight,
    newNode,
    pointers,
    slow,
    fast,
    prev: prevPtr,
    cur: curPtr,
    phase,
    note,
    hasCycle,
  } = step;

  const headId = pointers?.head ?? nodes?.[0]?.id;

  return (
    <div>
      {/* Node chain */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: 0,
          overflowX: "auto",
          paddingBottom: 6,
          paddingTop: 4,
        }}
      >
        {(nodes || []).map((node, i) => (
          <div key={node.id} style={{ display: "flex", alignItems: "center" }}>
            <NodeBox
              node={node}
              isHighlight={node.id === highlight}
              isNew={node.id === newNode}
              isSlow={node.id === slow}
              isFast={node.id === fast}
              isPrev={node.id === prevPtr}
              isCur={node.id === curPtr}
              isHead={node.id === headId && i === 0}
              color={color}
            />
            {/* Arrow to next */}
            {i < nodes.length - 1 && (
              <div
                style={{
                  width: 28,
                  height: 2,
                  margin: "0 -1px",
                  marginBottom: 22,
                  background: `linear-gradient(90deg, ${T.border2}, ${T.muted})`,
                  position: "relative",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    right: -3,
                    top: -4,
                    color: T.muted,
                    fontSize: 10,
                    fontFamily: T.mono,
                  }}
                >
                  ›
                </div>
              </div>
            )}
            {/* Cycle back-arrow indicator */}
            {hasCycle &&
              node.next !== null &&
              nodes.findIndex((n) => n.id === node.next) < i && (
                <div
                  style={{
                    fontSize: 9,
                    color: T.red,
                    fontFamily: T.mono,
                    marginBottom: 22,
                    marginLeft: 2,
                  }}
                >
                  ↩
                </div>
              )}
          </div>
        ))}
        {/* null terminator */}
        <div
          style={{
            marginLeft: 4,
            marginBottom: 22,
            fontSize: 11,
            color: T.muted,
            fontFamily: T.mono,
            whiteSpace: "nowrap",
          }}
        >
          {phase === "nocycle" || (!hasCycle && nodes?.length) ? "→ null" : ""}
        </div>
      </div>

      {/* Note */}
      <div
        style={{
          marginTop: 8,
          padding: "8px 12px",
          background: T.dim,
          borderRadius: 4,
          borderLeft: `2px solid ${
            phase === "done"
              ? T.green
              : phase === "found"
                ? T.green
                : phase === "notfound" || phase === "nocycle"
                  ? T.amber
                  : phase === "flip" || phase === "alloc"
                    ? color
                    : T.border2
          }`,
          fontFamily: T.mono,
          fontSize: 11,
          color: T.textDim,
          lineHeight: 1.5,
        }}
      >
        {note}
      </div>

      {/* Phase badge */}
      <div style={{ marginTop: 6, display: "flex", gap: 6 }}>
        <span
          style={{
            fontSize: 9,
            fontFamily: T.mono,
            letterSpacing: "0.08em",
            color: color,
            background: `${color}15`,
            border: `1px solid ${color}30`,
            borderRadius: 3,
            padding: "2px 7px",
          }}
        >
          {phase}
        </span>
      </div>
    </div>
  );
};

// ── OS CALLOUT ────────────────────────────────────────────────────────────────
const OSCallout = ({ lessonIdx }) => {
  const items = [
    {
      title: "/proc/[pid] — every process is a list node",
      body: "Open a terminal and run: ls /proc/ | head -20\nEach number is a PID. Each PID is a task_struct node\nin the kernel's process linked list. The kernel walks\nthis list to answer 'ps aux'.",
      cmd: "cat /proc/1/status | head -10",
    },
    {
      title: "kernel/fork.c — list_add() is literally prepend",
      body: "When fork() creates a process, the kernel calls\nlist_add(&p->tasks, &init_task.tasks).\nThis is a doubly-linked list prepend in C.\nExact same logic as your prepend() function.",
      cmd: "grep -n 'list_add' /proc/kallsyms | head -5",
    },
    {
      title: "kernel/exit.c — list_del() removes on exit",
      body: "When exit() is called, do_exit() calls\nlist_del_init(&current->tasks).\nTwo pointer writes. O(1). Even with millions\nof other processes running.",
      cmd: "cat /proc/self/status | grep Pid",
    },
    {
      title: "/proc/self/maps — the VMA linked list",
      body: "Each line is one vm_area_struct node.\nThe kernel traverses this list on every\npage fault, mmap(), and memory query.\nYour process likely has 20-50 VMAs.",
      cmd: "cat /proc/self/maps",
    },
    {
      title: "Deadlock detection via cycle finding",
      body: "Linux kernel's lockdep subsystem builds a\nlock dependency graph and runs cycle detection\non every lock acquisition (in debug builds).\nFloyd's algorithm — same as your hasCycle().",
      cmd: "dmesg | grep -i deadlock | head -5",
    },
  ];
  const item = items[lessonIdx] || items[0];
  return (
    <div style={{ padding: "12px 14px" }}>
      <div
        style={{
          fontSize: 9,
          fontWeight: 700,
          color: T.muted,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          marginBottom: 8,
          fontFamily: T.mono,
        }}
      >
        OS Connection
      </div>
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: T.green,
          fontFamily: T.mono,
          marginBottom: 6,
          lineHeight: 1.4,
        }}
      >
        {item.title}
      </div>
      <pre
        style={{
          fontSize: 10.5,
          color: T.textDim,
          lineHeight: 1.7,
          whiteSpace: "pre-wrap",
          margin: "0 0 10px",
          fontFamily: T.mono,
        }}
      >
        {item.body}
      </pre>
      <div
        style={{
          padding: "5px 10px",
          background: "#050e08",
          border: `1px solid ${T.green}30`,
          borderRadius: 4,
          fontFamily: T.mono,
          fontSize: 10,
          color: T.green2,
        }}
      >
        $ {item.cmd}
      </div>
    </div>
  );
};

// ── COMPLEXITY TABLE ──────────────────────────────────────────────────────────
const ComplexityTable = ({ activeLesson }) => {
  const rows = [
    { op: "get(i)", arr: "O(1)", ll: "O(n)", note: "Array wins" },
    { op: "prepend", arr: "O(n)", ll: "O(1)", note: "List wins" },
    { op: "append", arr: "O(1)*", ll: "O(n)", note: "Array wins*" },
    { op: "insert(i)", arr: "O(n)", ll: "O(1)**", note: "List wins**" },
    { op: "delete(i)", arr: "O(n)", ll: "O(1)**", note: "List wins**" },
    { op: "search", arr: "O(n)", ll: "O(n)", note: "Equal" },
    { op: "cache perf", arr: "✓✓✓", ll: "✗", note: "Array wins" },
  ];
  return (
    <div style={{ padding: "10px 14px" }}>
      <div
        style={{
          fontSize: 9,
          fontWeight: 700,
          color: T.muted,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          marginBottom: 8,
          fontFamily: T.mono,
        }}
      >
        Array vs Linked List
      </div>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontFamily: T.mono,
          fontSize: 10,
        }}
      >
        <thead>
          <tr>
            {["Operation", "Array", "List", ""].map((h, i) => (
              <th
                key={i}
                style={{
                  textAlign: "left",
                  padding: "3px 6px",
                  color: T.muted,
                  fontSize: 9,
                  borderBottom: `1px solid ${T.border}`,
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr
              key={i}
              style={{ background: i % 2 === 0 ? "transparent" : T.dim + "44" }}
            >
              <td style={{ padding: "4px 6px", color: T.textDim }}>{r.op}</td>
              <td
                style={{
                  padding: "4px 6px",
                  color: r.arr.startsWith("O(1)")
                    ? T.green
                    : r.arr === "✓✓✓"
                      ? T.green
                      : T.amber,
                }}
              >
                {r.arr}
              </td>
              <td
                style={{
                  padding: "4px 6px",
                  color: r.ll.startsWith("O(1)")
                    ? T.green
                    : r.ll === "O(n)"
                      ? T.amber
                      : T.red,
                }}
              >
                {r.ll}
              </td>
              <td style={{ padding: "4px 6px", color: T.muted, fontSize: 9 }}>
                {r.note}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div
        style={{
          marginTop: 6,
          fontSize: 9,
          color: T.muted,
          fontFamily: T.mono,
          lineHeight: 1.7,
        }}
      >
        * amortized &nbsp; ** requires pointer to prev node
      </div>
    </div>
  );
};

// ── MAIN ──────────────────────────────────────────────────────────────────────
export default function DSA02LinkedLists({ onBack }) {
  const [lessonIdx, setLessonIdx] = useState(0);
  const [tab, setTab] = useState("concept");
  const [lang, setLang] = useState("js");
  const [jsCode, setJsCode] = useState(LESSONS[0].starterCode);
  const [pyCode, setPyCode] = useState(PY_STARTERS[0]);
  const [runResult, setRunResult] = useState(null);
  const [running, setRunning] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [traceSteps, setTraceSteps] = useState([]);
  const [traceIdx, setTraceIdx] = useState(0);
  const [completed, setCompleted] = useState(new Set());
  const [demoVal, setDemoVal] = useState(99);
  const [demoTarget, setDemoTarget] = useState(3);
  const [demoArr] = useState([10, 20, 30, 40, 50]);

  const lesson = LESSONS[lessonIdx];
  const lc = lesson.color;
  const isComplete = completed.has(lessonIdx);

  const currentCode = lang === "js" ? jsCode : pyCode;
  const setCurrentCode = lang === "js" ? setJsCode : setPyCode;
  const currentBlanks =
    lang === "js" ? lesson.blanks : PY_BLANKS[lessonIdx] || [];
  const currentSols =
    lang === "js" ? lesson.solutions : PY_SOLUTIONS[lessonIdx] || [];
  const currentStarter =
    lang === "js" ? lesson.starterCode : PY_STARTERS[lessonIdx];

  const switchLesson = (idx) => {
    setLessonIdx(idx);
    setJsCode(LESSONS[idx].starterCode);
    setPyCode(PY_STARTERS[idx]);
    setRunResult(null);
    setShowHint(false);
    setTraceSteps([]);
    setTraceIdx(0);
    setTab("concept");
  };

  const buildTrace = useCallback(() => {
    const l = LESSONS[lessonIdx];
    if (!l.hasTrace) return;
    let steps = [];
    if (l.traceType === "prepend") steps = tracePrepend(demoArr, demoVal);
    if (l.traceType === "append") steps = traceAppend(demoArr, demoVal);
    if (l.traceType === "delete") steps = traceDelete(demoArr, demoTarget);
    if (l.traceType === "reverse") steps = traceReverse(demoArr);
    if (l.traceType === "cycle") steps = traceCycle([1, 2, 3, 4, 5], 1);
    setTraceSteps(steps);
    setTraceIdx(0);
  }, [lessonIdx, demoArr, demoVal, demoTarget]);

  const handleRun = async () => {
    setRunning(true);
    setRunResult(null);
    if (lang === "js") {
      const res = runJS(lesson, jsCode);
      setRunResult(res);
      if (res.testResult?.ok) {
        setCompleted((c) => new Set([...c, lessonIdx]));
        buildTrace();
      }
    } else {
      try {
        const { getPyodide } =
          await import("../../../utils/pyodideRuntime.js").catch(() => ({
            getPyodide: null,
          }));
        if (!getPyodide) {
          setRunResult({ error: "Pyodide not available." });
          setRunning(false);
          return;
        }
        const pyodide = await getPyodide();
        const fullCode = `${pyCode}\n${PY_HARNESSES[lessonIdx]}`;
        await pyodide.runPythonAsync(fullCode);
        const proxy = pyodide.globals.get("_matrix_result");
        const parsed = JSON.parse(
          typeof proxy === "string" ? proxy : proxy.toString(),
        );
        if (typeof proxy?.destroy === "function") proxy.destroy();
        setRunResult({
          testResult: {
            ok: parsed.ok,
            checks: parsed.checks,
            result: parsed.result,
          },
        });
        if (parsed.ok) {
          setCompleted((c) => new Set([...c, lessonIdx]));
          buildTrace();
        }
      } catch (e) {
        setRunResult({ error: e.message || String(e) });
      }
    }
    setRunning(false);
  };

  const handleReveal = () => {
    let code = currentStarter;
    currentBlanks.forEach((b, i) => {
      code = code.replace(b, currentSols[i] || "");
    });
    setCurrentCode(code);
  };

  const cur = traceSteps[traceIdx];
  const scanlineStyle = {
    position: "fixed",
    inset: 0,
    pointerEvents: "none",
    zIndex: 9999,
    backgroundImage:
      "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.025) 2px,rgba(0,0,0,0.025) 4px)",
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: T.bg,
        fontFamily: T.sans,
        color: T.text,
        overflow: "hidden",
        position: "relative",
      }}
    >
      <div style={scanlineStyle} />

      {/* ═══ HEADER ═══ */}
      <div
        style={{
          height: 46,
          background: T.surface,
          borderBottom: `1px solid ${T.border}`,
          display: "flex",
          alignItems: "center",
          padding: "0 18px",
          gap: 14,
          flexShrink: 0,
        }}
      >
        {onBack && (
          <button
            onClick={onBack}
            style={{
              height: 28,
              padding: "0 10px",
              borderRadius: 4,
              background: "transparent",
              border: `1px solid ${T.border2}`,
              color: T.muted,
              fontSize: 11,
              cursor: "pointer",
              fontFamily: T.mono,
              display: "flex",
              alignItems: "center",
              gap: 5,
              flexShrink: 0,
            }}
          >
            ‹ Back
          </button>
        )}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "4px 10px",
            borderRadius: 4,
            background: `${T.green}12`,
            border: `1px solid ${T.green}30`,
          }}
        >
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: T.green,
              boxShadow: `0 0 6px ${T.green}`,
            }}
          />
          <span
            style={{
              fontSize: 10,
              fontFamily: T.mono,
              color: T.green,
              letterSpacing: "0.12em",
              fontWeight: 700,
            }}
          >
            DSA SERIES
          </span>
        </div>
        <div
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: T.textBright,
            letterSpacing: -0.3,
          }}
        >
          02 — Linked Lists
        </div>
        <div style={{ fontSize: 11, color: T.textDim, fontFamily: T.mono }}>
          node → node → node → null &nbsp;|&nbsp; O(1) insert &nbsp;|&nbsp; O(n)
          access
        </div>
        <div
          style={{
            marginLeft: "auto",
            display: "flex",
            gap: 5,
            alignItems: "center",
          }}
        >
          {LESSONS.map((_, i) => (
            <div
              key={i}
              onClick={() => switchLesson(i)}
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                cursor: "pointer",
                background: completed.has(i)
                  ? LESSONS[i].color
                  : i === lessonIdx
                    ? LESSONS[i].color + "55"
                    : T.dim,
                border: `1px solid ${completed.has(i) || i === lessonIdx ? LESSONS[i].color : T.border2}`,
                boxShadow: completed.has(i)
                  ? `0 0 6px ${LESSONS[i].color}66`
                  : "none",
                transition: "all .2s",
              }}
            />
          ))}
          <span
            style={{
              fontSize: 10,
              color: T.muted,
              marginLeft: 6,
              fontFamily: T.mono,
            }}
          >
            {completed.size}/{LESSONS.length}
          </span>
        </div>
      </div>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* ═══ SIDEBAR ═══ */}
        <div
          style={{
            width: 240,
            background: T.panel,
            borderRight: `1px solid ${T.border}`,
            display: "flex",
            flexDirection: "column",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              padding: "12px 14px 6px",
              fontSize: 9,
              fontWeight: 700,
              color: T.muted,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              fontFamily: T.mono,
            }}
          >
            Lessons
          </div>
          <div style={{ overflowY: "auto", flex: 1 }}>
            {LESSONS.map((l, i) => {
              const active = i === lessonIdx,
                done = completed.has(i);
              return (
                <div
                  key={i}
                  onClick={() => switchLesson(i)}
                  style={{
                    padding: "10px 14px",
                    cursor: "pointer",
                    background: active ? `${l.color}08` : "transparent",
                    borderLeft: `2px solid ${active ? l.color : "transparent"}`,
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 10,
                    transition: "background .1s",
                  }}
                >
                  <div
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 4,
                      flexShrink: 0,
                      background: done ? l.color : T.dim,
                      border: `1px solid ${done ? l.color : active ? l.color + "66" : T.border2}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 9,
                      fontWeight: 700,
                      color: done ? "#000" : active ? l.color : T.muted,
                      fontFamily: T.mono,
                    }}
                  >
                    {done ? "✓" : i + 1}
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: active ? 600 : 400,
                        color: active ? T.textBright : T.textDim,
                        lineHeight: 1.3,
                      }}
                    >
                      {l.shortTitle}
                    </div>
                    <div
                      style={{
                        fontSize: 9,
                        color: T.muted,
                        marginTop: 2,
                        fontFamily: T.mono,
                      }}
                    >
                      {l.osHook}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <ComplexityTable activeLesson={lessonIdx} />
        </div>

        {/* ═══ MAIN ═══ */}
        <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
          {/* ── LEFT: Lesson ── */}
          <div
            style={{
              width: 380,
              background: T.panel,
              borderRight: `1px solid ${T.border}`,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "14px 16px 12px",
                borderBottom: `1px solid ${T.border}`,
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  color: lc,
                  background: `${lc}15`,
                  border: `1px solid ${lc}30`,
                  borderRadius: 3,
                  padding: "2px 8px",
                  fontFamily: T.mono,
                  display: "inline-block",
                  marginBottom: 6,
                }}
              >
                {lesson.osHook.toUpperCase()}
              </div>
              <div
                style={{
                  fontSize: 17,
                  fontWeight: 700,
                  color: T.textBright,
                  letterSpacing: -0.5,
                  lineHeight: 1.2,
                }}
              >
                {lesson.title}
              </div>
            </div>

            <div
              style={{
                display: "flex",
                background: T.bg,
                borderBottom: `1px solid ${T.border}`,
                flexShrink: 0,
              }}
            >
              {[
                ["concept", "Concept"],
                ["pseudo", "Pseudocode"],
                ["inputs", "Inputs"],
              ].map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  style={{
                    flex: 1,
                    padding: "8px 0",
                    fontSize: 11,
                    fontWeight: tab === id ? 700 : 400,
                    color: tab === id ? lc : T.muted,
                    background: "transparent",
                    border: "none",
                    borderBottom: `2px solid ${tab === id ? lc : "transparent"}`,
                    cursor: "pointer",
                    fontFamily: T.mono,
                    transition: "color .12s",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: "14px 16px" }}>
              {tab === "concept" &&
                lesson.concept.map((b, i) => (
                  <div key={i} style={{ marginBottom: 20 }}>
                    <div
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: lc,
                        letterSpacing: "0.1em",
                        marginBottom: 6,
                        textTransform: "uppercase",
                        fontFamily: T.mono,
                      }}
                    >
                      {b.head}
                    </div>
                    <pre
                      style={{
                        fontSize: 11.5,
                        color: T.textDim,
                        lineHeight: 1.85,
                        whiteSpace: "pre-wrap",
                        margin: 0,
                        fontFamily: T.mono,
                      }}
                    >
                      {b.body}
                    </pre>
                  </div>
                ))}

              {tab === "pseudo" && (
                <div>
                  <div
                    style={{
                      fontSize: 9,
                      fontWeight: 700,
                      color: T.muted,
                      letterSpacing: "0.1em",
                      marginBottom: 10,
                      textTransform: "uppercase",
                      fontFamily: T.mono,
                    }}
                  >
                    Algorithm
                  </div>
                  <pre
                    style={{
                      fontSize: 11.5,
                      color: "#a8c8a8",
                      lineHeight: 2,
                      whiteSpace: "pre-wrap",
                      margin: 0,
                      fontFamily: T.mono,
                      background: "#080f08",
                      border: `1px solid #1a3020`,
                      borderRadius: 6,
                      padding: "14px",
                    }}
                  >
                    {lesson.pseudo}
                  </pre>
                  <div
                    style={{
                      marginTop: 12,
                      padding: "8px 12px",
                      background: `${lc}0a`,
                      border: `1px solid ${lc}20`,
                      borderRadius: 5,
                      fontSize: 10.5,
                      color: T.textDim,
                      lineHeight: 1.6,
                      fontFamily: T.mono,
                    }}
                  >
                    Each <span style={{ color: lc }}>___</span> blank maps to
                    one step in the pseudocode above.
                  </div>
                </div>
              )}

              {tab === "inputs" && (
                <div>
                  <div
                    style={{
                      fontSize: 9,
                      color: T.muted,
                      letterSpacing: "0.1em",
                      marginBottom: 10,
                      fontFamily: T.mono,
                      textTransform: "uppercase",
                    }}
                  >
                    Demo List
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: 3,
                      flexWrap: "wrap",
                      marginBottom: 14,
                    }}
                  >
                    {demoArr.map((v, i) => (
                      <div
                        key={i}
                        style={{ display: "flex", alignItems: "center" }}
                      >
                        <div
                          style={{
                            width: 40,
                            height: 36,
                            background: T.dim,
                            border: `1px solid ${T.border2}`,
                            borderRadius: 3,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            fontFamily: T.mono,
                          }}
                        >
                          <span
                            style={{
                              fontSize: 12,
                              color: T.textBright,
                              fontWeight: 700,
                            }}
                          >
                            {v}
                          </span>
                          <span style={{ fontSize: 7, color: T.muted }}>
                            node
                          </span>
                        </div>
                        {i < demoArr.length - 1 && (
                          <div
                            style={{
                              width: 12,
                              height: 1,
                              background: T.border2,
                            }}
                          />
                        )}
                      </div>
                    ))}
                    <div
                      style={{
                        marginLeft: 4,
                        fontSize: 11,
                        color: T.muted,
                        fontFamily: T.mono,
                        alignSelf: "center",
                      }}
                    >
                      → null
                    </div>
                  </div>

                  {/* Trace controls */}
                  {(lessonIdx === 1 || lessonIdx === 2) && (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                      }}
                    >
                      {lessonIdx === 1 && (
                        <div
                          style={{
                            display: "flex",
                            gap: 6,
                            alignItems: "center",
                          }}
                        >
                          <span
                            style={{
                              fontSize: 10,
                              color: T.textDim,
                              fontFamily: T.mono,
                              width: 40,
                            }}
                          >
                            value
                          </span>
                          <input
                            type="number"
                            value={demoVal}
                            onChange={(e) => setDemoVal(+e.target.value)}
                            style={{
                              width: 55,
                              padding: "3px 6px",
                              background: T.dim,
                              border: `1px solid ${T.border2}`,
                              borderRadius: 3,
                              color: T.text,
                              fontFamily: T.mono,
                              fontSize: 11,
                            }}
                          />
                          <button
                            onClick={() => {
                              setTraceSteps(tracePrepend(demoArr, demoVal));
                              setTraceIdx(0);
                            }}
                            style={{
                              padding: "4px 8px",
                              background: `${lc}18`,
                              border: `1px solid ${lc}44`,
                              borderRadius: 3,
                              color: lc,
                              fontSize: 10,
                              cursor: "pointer",
                              fontFamily: T.mono,
                            }}
                          >
                            prepend trace
                          </button>
                        </div>
                      )}
                      {lessonIdx === 2 && (
                        <div
                          style={{
                            display: "flex",
                            gap: 6,
                            alignItems: "center",
                          }}
                        >
                          <span
                            style={{
                              fontSize: 10,
                              color: T.textDim,
                              fontFamily: T.mono,
                              width: 50,
                            }}
                          >
                            delete
                          </span>
                          <input
                            type="number"
                            value={demoTarget}
                            onChange={(e) => setDemoTarget(+e.target.value)}
                            style={{
                              width: 55,
                              padding: "3px 6px",
                              background: T.dim,
                              border: `1px solid ${T.border2}`,
                              borderRadius: 3,
                              color: T.text,
                              fontFamily: T.mono,
                              fontSize: 11,
                            }}
                          />
                          <button
                            onClick={() => {
                              setTraceSteps(traceDelete(demoArr, demoTarget));
                              setTraceIdx(0);
                            }}
                            style={{
                              padding: "4px 8px",
                              background: `${lc}18`,
                              border: `1px solid ${lc}44`,
                              borderRadius: 3,
                              color: lc,
                              fontSize: 10,
                              cursor: "pointer",
                              fontFamily: T.mono,
                            }}
                          >
                            trace
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {lessonIdx === 3 && (
                    <button
                      onClick={() => {
                        setTraceSteps(traceReverse(demoArr));
                        setTraceIdx(0);
                      }}
                      style={{
                        padding: "5px 12px",
                        background: `${lc}18`,
                        border: `1px solid ${lc}44`,
                        borderRadius: 3,
                        color: lc,
                        fontSize: 10,
                        cursor: "pointer",
                        fontFamily: T.mono,
                      }}
                    >
                      trace reverse
                    </button>
                  )}
                  {lessonIdx === 4 && (
                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        onClick={() => {
                          setTraceSteps(traceCycle([1, 2, 3, 4, 5], 1));
                          setTraceIdx(0);
                        }}
                        style={{
                          padding: "5px 10px",
                          background: `${T.red}18`,
                          border: `1px solid ${T.red}44`,
                          borderRadius: 3,
                          color: T.red,
                          fontSize: 10,
                          cursor: "pointer",
                          fontFamily: T.mono,
                        }}
                      >
                        with cycle
                      </button>
                      <button
                        onClick={() => {
                          setTraceSteps(traceCycle([1, 2, 3, 4, 5], -1));
                          setTraceIdx(0);
                        }}
                        style={{
                          padding: "5px 10px",
                          background: `${T.green}18`,
                          border: `1px solid ${T.green}44`,
                          borderRadius: 3,
                          color: T.green,
                          fontSize: 10,
                          cursor: "pointer",
                          fontFamily: T.mono,
                        }}
                      >
                        no cycle
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ── CENTER: Editor ── */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              background: T.bg,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: 40,
                background: T.surface,
                borderBottom: `1px solid ${T.border}`,
                display: "flex",
                alignItems: "center",
                padding: "0 14px",
                gap: 8,
                flexShrink: 0,
              }}
            >
              <button
                onClick={handleRun}
                disabled={running}
                style={{
                  height: 26,
                  padding: "0 16px",
                  borderRadius: 4,
                  background: isComplete ? `${T.green}18` : `${lc}15`,
                  border: `1px solid ${isComplete ? T.green2 : lc + "55"}`,
                  color: isComplete ? T.green : lc,
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: running ? "default" : "pointer",
                  fontFamily: T.mono,
                  letterSpacing: "0.04em",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  opacity: running ? 0.6 : 1,
                  boxShadow: isComplete ? `0 0 8px ${T.green}22` : "none",
                }}
              >
                <span style={{ fontSize: 8 }}>{running ? "⟳" : "▶"}</span>
                {running ? "Running…" : "Run"}
              </button>
              <button
                onClick={() => setShowHint((h) => !h)}
                style={{
                  height: 26,
                  padding: "0 10px",
                  borderRadius: 4,
                  background: "transparent",
                  border: `1px solid ${T.border2}`,
                  color: showHint ? lc : T.muted,
                  fontSize: 11,
                  cursor: "pointer",
                  fontFamily: T.mono,
                }}
              >
                {showHint ? "Hide Hint" : "Hint"}
              </button>
              <button
                onClick={handleReveal}
                style={{
                  height: 26,
                  padding: "0 10px",
                  borderRadius: 4,
                  background: "transparent",
                  border: `1px solid ${T.border2}`,
                  color: T.muted,
                  fontSize: 11,
                  cursor: "pointer",
                  fontFamily: T.mono,
                }}
              >
                Reveal
              </button>
              {lesson.hasTrace && (
                <button
                  onClick={buildTrace}
                  style={{
                    height: 26,
                    padding: "0 10px",
                    borderRadius: 4,
                    background: `${T.purple}15`,
                    border: `1px solid ${T.purple}44`,
                    color: T.purple,
                    fontSize: 11,
                    cursor: "pointer",
                    fontFamily: T.mono,
                  }}
                >
                  Step Through
                </button>
              )}
              {isComplete && (
                <span
                  style={{
                    fontSize: 10,
                    color: T.green,
                    background: `${T.green}10`,
                    border: `1px solid ${T.green}30`,
                    borderRadius: 3,
                    padding: "3px 8px",
                    fontFamily: T.mono,
                    boxShadow: `0 0 6px ${T.green}22`,
                  }}
                >
                  ✓ passing
                </span>
              )}
              <div style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
                {[
                  ["js", "JS"],
                  ["python", "Python"],
                ].map(([id, label]) => (
                  <button
                    key={id}
                    onClick={() => {
                      setLang(id);
                      setRunResult(null);
                    }}
                    style={{
                      height: 22,
                      padding: "0 8px",
                      borderRadius: 3,
                      background:
                        lang === id
                          ? `${id === "js" ? "#f7df1e" : "#7dd3fc"}18`
                          : "transparent",
                      border: `1px solid ${lang === id ? (id === "js" ? "#f7df1e" : "#7dd3fc") : T.border2}`,
                      color:
                        lang === id
                          ? id === "js"
                            ? "#f7df1e"
                            : "#7dd3fc"
                          : T.muted,
                      fontSize: 10,
                      fontWeight: 700,
                      cursor: "pointer",
                      fontFamily: T.mono,
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {showHint && (
              <div
                style={{
                  padding: "8px 14px",
                  background: "#1a1400",
                  borderBottom: `1px solid #3a2800`,
                  fontSize: 11,
                  color: "#c8a040",
                  fontFamily: T.mono,
                  lineHeight: 1.6,
                  flexShrink: 0,
                }}
              >
                <span style={{ color: "#705010", marginRight: 6 }}>hint</span>
                {currentBlanks.map((b, i) => (
                  <div key={i} style={{ color: "#c8a840", marginTop: 2 }}>
                    {b}: {currentSols[i]}
                  </div>
                ))}
              </div>
            )}

            <Editor
              height="100%"
              language={lang === "python" ? "python" : "javascript"}
              value={currentCode}
              onChange={(val) => setCurrentCode(val || "")}
              beforeMount={setupOpenCalcMonaco}
              theme="open-calc-dark"
              options={{
                fontSize: 13,
                lineHeight: 22,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                wordWrap: "on",
                tabSize: 2,
                renderLineHighlight: "line",
                padding: { top: 12, bottom: 12 },
                smoothScrolling: true,
                cursorBlinking: "smooth",
                fontLigatures: true,
                fontFamily: "'JetBrains Mono','Fira Code','Cascadia Code',monospace",
              }}
            />
          </div>

          {/* ── RIGHT: Results + Trace ── */}
          <div
            style={{
              width: 360,
              background: T.panel,
              borderLeft: `1px solid ${T.border}`,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              flexShrink: 0,
            }}
          >
            {/* Test results */}
            <div
              style={{
                padding: "12px 14px",
                borderBottom: `1px solid ${T.border}`,
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  color: T.muted,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  marginBottom: 10,
                  fontFamily: T.mono,
                }}
              >
                Test Results
              </div>

              {!runResult && !running && (
                <div
                  style={{
                    fontSize: 11,
                    color: T.muted,
                    lineHeight: 1.7,
                    fontFamily: T.mono,
                  }}
                >
                  Fill <span style={{ color: lc }}>___</span> blanks → Run
                </div>
              )}
              {running && (
                <div
                  style={{ fontSize: 11, color: T.textDim, fontFamily: T.mono }}
                >
                  Running…
                </div>
              )}

              {runResult?.error && (
                <div
                  style={{
                    background: "#200808",
                    border: `1px solid ${T.red}44`,
                    borderRadius: 5,
                    padding: "10px 12px",
                  }}
                >
                  <div
                    style={{
                      color: T.red,
                      fontSize: 10,
                      fontWeight: 700,
                      marginBottom: 4,
                      fontFamily: T.mono,
                    }}
                  >
                    error
                  </div>
                  <div
                    style={{
                      color: "#c06060",
                      fontSize: 10,
                      fontFamily: T.mono,
                      lineHeight: 1.6,
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-all",
                    }}
                  >
                    {runResult.error}
                  </div>
                </div>
              )}

              {runResult?.testResult && (
                <div>
                  {runResult.testResult.checks.map((c, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        gap: 7,
                        alignItems: "flex-start",
                        marginBottom: 7,
                      }}
                    >
                      <div
                        style={{
                          width: 14,
                          height: 14,
                          borderRadius: 3,
                          flexShrink: 0,
                          marginTop: 1,
                          background: c.pass ? `${T.green}20` : "#300",
                          border: `1px solid ${c.pass ? T.green2 : T.red}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 8,
                          color: c.pass ? T.green : T.red,
                          fontFamily: T.mono,
                        }}
                      >
                        {c.pass ? "✓" : "✗"}
                      </div>
                      <span
                        style={{
                          fontSize: 10.5,
                          color: c.pass ? T.textDim : T.muted,
                          lineHeight: 1.5,
                          fontFamily: T.mono,
                        }}
                      >
                        {c.label}
                      </span>
                    </div>
                  ))}
                  <div
                    style={{
                      marginTop: 8,
                      padding: "8px 10px",
                      borderRadius: 5,
                      background: runResult.testResult.ok
                        ? `${T.green}0d`
                        : "#200808",
                      border: `1px solid ${runResult.testResult.ok ? T.green2 + "44" : T.red + "33"}`,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: runResult.testResult.ok ? T.green : T.red,
                        fontFamily: T.mono,
                        marginBottom:
                          runResult.testResult.result != null ? 4 : 0,
                      }}
                    >
                      {runResult.testResult.ok
                        ? "✓ all tests pass"
                        : "✗ tests failing"}
                    </div>
                    {runResult.testResult.result != null && (
                      <div
                        style={{ fontSize: 11, color: lc, fontFamily: T.mono }}
                      >
                        {JSON.stringify(runResult.testResult.result)}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Trace or OS panel */}
            {traceSteps.length > 0 ? (
              <div
                style={{
                  flex: 1,
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div
                  style={{
                    padding: "8px 14px",
                    borderBottom: `1px solid ${T.border}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      fontSize: 9,
                      fontWeight: 700,
                      color: T.muted,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      fontFamily: T.mono,
                    }}
                  >
                    Execution Trace
                  </div>
                  <span
                    style={{
                      fontSize: 10,
                      color: T.textDim,
                      fontFamily: T.mono,
                    }}
                  >
                    {traceIdx + 1}/{traceSteps.length}
                  </span>
                </div>
                <div
                  style={{
                    padding: "8px 14px",
                    borderBottom: `1px solid ${T.border}`,
                    display: "flex",
                    gap: 5,
                    alignItems: "center",
                    flexShrink: 0,
                  }}
                >
                  {[
                    ["«", () => setTraceIdx(0)],
                    ["‹", () => setTraceIdx((i) => Math.max(0, i - 1))],
                    [
                      "›",
                      () =>
                        setTraceIdx((i) =>
                          Math.min(traceSteps.length - 1, i + 1),
                        ),
                    ],
                    ["»", () => setTraceIdx(traceSteps.length - 1)],
                  ].map(([label, action], i) => (
                    <button
                      key={i}
                      onClick={action}
                      style={{
                        width: 26,
                        height: 24,
                        borderRadius: 3,
                        background: T.dim,
                        border: `1px solid ${T.border2}`,
                        color: T.textDim,
                        fontSize: 12,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontFamily: T.mono,
                      }}
                    >
                      {label}
                    </button>
                  ))}
                  <input
                    type="range"
                    min={0}
                    max={traceSteps.length - 1}
                    value={traceIdx}
                    onChange={(e) => setTraceIdx(+e.target.value)}
                    style={{ flex: 1, accentColor: lc }}
                  />
                </div>
                <div
                  style={{ flex: 1, overflowY: "auto", padding: "12px 14px" }}
                >
                  <LinkedListViz
                    steps={traceSteps}
                    stepIdx={traceIdx}
                    color={lc}
                  />
                </div>
              </div>
            ) : (
              <div
                style={{
                  flex: 1,
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <OSCallout lessonIdx={lessonIdx} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
