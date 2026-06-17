# DSA + Design Patterns — Agent Reference Document
## Read this entire document before generating any lesson.

---

## PART 1 — WHAT THIS COURSE IS

This course teaches Data Structures and Algorithms together with Design Patterns.
They are not two subjects. They are one subject taught from two angles simultaneously.

Every lesson starts from a PROBLEM — something that breaks, slows down, or becomes
unmaintainable in real code. The DSA concept and the design pattern are both answers
to that same problem. The student never feels like they are learning two things.
They are learning one thing that happens to have two names.

The existing lesson 01 (Arrays + Factory) is the model for every lesson in this
course. Arrays and Factory are not taught separately. The problem of "what happens
when you store objects without a guaranteed shape" is what motivates both the array's
structure AND the Factory pattern simultaneously.

---

## PART 2 — THE EXISTING LESSONS (already built, do not regenerate)

These lessons exist and define the established teaching style.
When generating new lessons, match this style exactly.

| File | Title | Core problem taught |
|---|---|---|
| lesson-01.js | Arrays + Factory | Storing things with guaranteed shape |
| lesson-02.js | Linked Lists | O(1) insertion without shifting |
| lesson-03.js | Hash Tables | O(1) lookup without scanning |
| lesson-04.js | Stacks + Command | Reversible actions, undo/redo |
| lesson-05.js | Recursion | Problems that contain smaller versions of themselves |
| lesson-06.js | Binary Trees + Composite | Hierarchies where a group and a single item behave the same |
| lesson-07.js | Graphs + Strategy | Arbitrary relationships, swappable traversal algorithms |
| lesson-08.js | Heaps + Observer | Always-available min/max, reactive notification |
| lesson-09.js | Sorting + Template Method | Fixed algorithm skeleton, swappable steps |
| lesson-10.js | Dynamic Programming | Avoiding recomputation of overlapping subproblems |

---

## PART 3 — THE FULL CURRICULUM (problems first, DSA + pattern second)

Every lesson is defined by its core problem. The DSA concept and design pattern
are what the student discovers as the answer to that problem. They are taught
together in one unified lesson — never in separate sections.

Lessons already built are marked DONE. Generate only lessons marked TODO.
When a TODO lesson says "splits from lesson-XX", it means the existing lesson
covers this material too broadly and this lesson gives it the depth it deserves.

---

### CHAPTER 1 — How does a computer actually remember things?

These lessons establish the mental model of memory before any data structure.
Without this chapter, Big-O and pointer manipulation are magic words.

| ID | Problem | DSA concept | Pattern | Status |
|---|---|---|---|---|
| 01 | How do you store a list and read any item instantly? | Arrays, index arithmetic, contiguous memory | Factory — guaranteed object shape | DONE (lesson-01.js) |
| 02 | Two variables point at the same thing and you don't know it | References, mutation, aliasing, heap vs stack | Prototype — controlled cloning instead of aliasing | TODO |
| 03 | Your code works on 10 items but fails on 10 million | Big-O, growth rates, dominant terms | Strategy — swapping the algorithm when the cost changes | TODO |
| 04 | You compute the same expensive thing over and over | Space/time tradeoff, memory as a tool | Proxy — intercepting a call to return a cached result | TODO |
| 05 | You're building something incrementally and the cost surprises you | Amortized analysis, dynamic array doubling | Builder — constructing an object step by step | TODO |

---

### CHAPTER 2 — What happens when order matters?

These lessons cover linear structures. Each one exists because arrays fail at
something specific, and the new structure + pattern pair solves that failure.

| ID | Problem | DSA concept | Pattern | Status |
|---|---|---|---|---|
| 06 | Inserting in the middle of an array is too slow | Singly linked list, O(1) head insert | Decorator — adding behaviour to a node without rewriting it | DONE (lesson-02.js) |
| 07 | You need to go backward as well as forward | Doubly linked list, prev pointers, O(1) deletion by reference | Memento — reversibility requires stored previous state | TODO |
| 08 | You need to detect if a path loops back on itself | Fast/slow pointers, cycle detection, finding middle | Iterator — two independent cursors moving through the same structure | TODO |
| 09 | Requests need to pass through a chain of handlers in order | Queue, FIFO, circular buffer | Chain of Responsibility — each handler decides to process or pass forward | TODO |
| 10 | You need a sliding view over a sequence | Sliding window, variable and fixed size windows | Observer — the window reacts to what enters and leaves it | TODO |

---

### CHAPTER 3 — How do you find things without checking everything?

| ID | Problem | DSA concept | Pattern | Status |
|---|---|---|---|---|
| 11 | Scanning every element every time is too slow | Hash functions, buckets, O(1) average lookup | Registry — a named-instance store IS a hash table with a pattern name | DONE (lesson-03.js) |
| 12 | Two keys land in the same slot | Collision — chaining, open addressing, load factor, tombstones | (internals — no forced pattern; honest about when patterns don't apply) | TODO |
| 13 | You keep recomputing results you already computed | Memoization as a hash table technique | Proxy — the cache IS a proxy that intercepts the function call | TODO (splits from lesson-10.js) |
| 14 | You need to store a hierarchy where a group and a single item behave identically | Binary tree, recursive node structure, three traversals | Composite — a node that contains nodes IS the pattern | DONE (lesson-06.js) |
| 15 | You need sorted storage that stays fast as you insert and delete | BST invariant, search/insert/delete, inorder = sorted | Template Method — fixed search skeleton, swappable comparison logic | TODO (splits from lesson-06.js) |
| 16 | Your BST degenerates on sorted input | AVL rotations, balance factor, height guarantees | (mechanical — no forced pattern fit) | TODO |
| 17 | You always need the minimum (or maximum) instantly | Heap, complete binary tree as array, sift up/down | Observer — subscribing to priority changes; heap as a reactive priority queue | DONE (lesson-08.js) |
| 18 | You need O(1) prefix search across thousands of strings | Trie, shared prefix nodes, character-by-character storage | Flyweight — shared prefix nodes ARE shared flyweight objects | TODO |

---

### CHAPTER 4 — How do you model arbitrary relationships?

| ID | Problem | DSA concept | Pattern | Status |
|---|---|---|---|---|
| 19 | You need to represent connections between arbitrary things | Graph representation — adjacency list vs matrix | Adapter — two representations of the same abstraction; convert between them | TODO (splits from lesson-07.js) |
| 20 | You need to visit everything reachable from a starting point, level by level | BFS, queue-based traversal, shortest path in unweighted graphs | Observer — each discovered node notifies its unvisited neighbours | TODO (splits from lesson-07.js) |
| 21 | You need to explore as deep as possible before backtracking | DFS, stack-based traversal, cycle detection, connected components | Visitor — the action taken at each node is the visitor, separate from the traversal | DONE (lesson-07.js covers this but at surface depth) |
| 22 | You need to order tasks that depend on each other | Topological sort, DAG, Kahn's algorithm | Template Method — fixed skeleton (find zero-in-degree, process, decrement), variable steps | TODO |
| 23 | You need the cheapest path through a weighted network | Dijkstra's algorithm, min-heap as priority queue | Strategy — the cost function is pluggable; A* is Dijkstra with a heuristic strategy added | TODO |
| 24 | Edge weights can be negative | Bellman-Ford, negative cycle detection, Floyd-Warshall for all pairs | (pure algorithm mechanics — no forced pattern) | TODO |
| 25 | You need to connect everything with minimum total cost | Minimum spanning trees, Kruskal's + Union-Find, Prim's | Strategy — Kruskal's and Prim's are two strategies for the same MST problem | TODO |

---

### CHAPTER 5 — How do you approach a problem you've never seen before?

| ID | Problem | DSA concept | Pattern | Status |
|---|---|---|---|---|
| 26 | The problem is too big to solve directly | Divide and conquer, merge sort, quicksort, Master Theorem | Template Method — divide/conquer/combine IS the template; sort algorithms are the concrete implementations | DONE (lesson-09.js) |
| 27 | You're solving the same subproblem hundreds of times | Overlapping subproblems, memoization, top-down DP | Proxy — the memo cache IS a proxy around the recursive function | DONE (lesson-10.js) |
| 28 | You need to find the optimal way to transform one sequence into another | LCS, LIS, edit distance, 2D DP tables | (pure DP mechanics — the table IS the memory, no forced pattern) | TODO (splits from lesson-10.js) |
| 29 | You need to find the optimal path through a 2D space | Grid DP, interval DP, direction of subproblem dependency | (pure DP mechanics) | TODO (splits from lesson-10.js) |
| 30 | You need to choose what to include from a set to maximise value | Knapsack, subset sum, coin change, include/exclude decision | Strategy — the value function and weight function are swappable strategies | TODO (splits from lesson-10.js) |
| 31 | The locally best choice is also globally best | Greedy algorithms, exchange argument proofs, interval scheduling | Strategy — the greedy choice function IS a strategy; swap it, get a different algorithm | TODO |
| 32 | You've tried greedy and it fails; you need to explore everything | Backtracking framework, make/undo choice, pruning | State + Memento — saving state before a choice and restoring it on backtrack IS both patterns | TODO |
| 33 | Your backtracker is too slow; you need to prune earlier | Forward checking, MRV heuristic, constraint propagation | (applied backtracking mechanics — no new pattern) | TODO |

---

### CHAPTER 6 — What separates good engineers from great ones?

| ID | Problem | DSA concept | Pattern | Status |
|---|---|---|---|---|
| 34 | You need to find a pattern inside a string without re-examining characters | KMP failure function, O(n+m) matching | (pure string algorithm — no forced pattern fit) | TODO |
| 35 | You need to hash a sliding window in O(1) per step | Rolling hash, polynomial hashing, Rabin-Karp | Proxy — the rolling hash IS a proxy for substring equality comparison | TODO |
| 36 | You need range queries and point updates both in O(log n) | Segment tree, lazy propagation | Composite — a segment tree node aggregating its children IS Composite at scale | TODO |
| 37 | You need to track which groups things belong to as they merge | Union-Find, path compression, union by rank | Facade — two simple operations hiding the complexity of the internals | TODO |
| 38 | You need to process a sequence using the functional style | Map, filter, reduce, function composition, pipelines | Functional patterns — map IS Visitor, reduce IS Fold, compose IS Decorator chains | TODO |
| 39 | Some problems have no known polynomial solution | P vs NP, NP-completeness, approximation algorithms | (pure theory — no pattern bridge) | TODO |
| 40 | Worst-case analysis hides the expected performance | Randomized algorithms, expected complexity, skip lists, Bloom filters | Strategy — random pivot IS a strategy; probabilistic promotion is a structural strategy | TODO |

---

## PART 4 — THE LESSON SCHEMA

Every lesson is a JavaScript file that exports one object.
The structure must match this exactly.

```javascript
export const lesson = {
  id: string,                    // e.g. 'dsa-patterns-07'
  series: {
    id: 'dsa-patterns',
    title: 'DSA + Design Patterns',
  },
  title: string,                 // e.g. '7. Doubly Linked Lists + Memento'
  checkpoints: [                 // 2–4 checkpoints, one per major section
    { id: string, label: string },
  ],
  segments: [ ...Segment ],
}
```

### Segment types

**narration** — all teaching happens here
```javascript
{
  type: 'narration',
  id: string,           // unique within lesson, kebab-case
  text: string,         // the teaching text — see Part 5 for rules
  code: string | null,  // runnable JS shown alongside, or null
}
```

**challenge** — student writes code
```javascript
{
  type: 'challenge',
  id: string,
  text: string,              // fully specified task — see Part 5 rule 4
  expectedOutput: null,
  startCode: string,         // starter code the student edits
  hint: string,              // concrete, not vague
  validate: ({ logs }) => boolean,
}
```

**codelens** — guided step-through
```javascript
{
  type: 'codelens',
  id: string,
  text: string,   // step-by-step: what line, what changes, what it means
  code: string,
  lang: 'js',
}
```

**checkpoint** — section marker
```javascript
{
  type: 'checkpoint',
  id: string,   // must match a checkpoints entry
}
```

---

## PART 5 — QUALITY RULES FOR THE TEXT FIELD

These rules apply to every `text` field in every `narration` segment.
Breaking any rule produces a lesson that fails students.

---

### RULE 1 — Define every term the first time it appears

If a term has not been used in this lesson yet, define it in the same sentence
or the sentence immediately before. This applies to: every data structure term,
every Big-O notation, every pattern term, every word a beginner might not know.

If the term was defined in an earlier lesson, give a one-line recap:
"(recap: a reference stores a memory address, not a value directly)"

WRONG: "The node's next pointer creates the link."
RIGHT: "Each node — a plain object holding one value — has a next property.
        Next is a reference: a variable that stores a memory address pointing
        to the next node in the chain, rather than storing the node's value directly."

---

### RULE 2 — Explain why, not just what

Every concept introduction must answer: what problem does this solve?
What would break or slow down without it?

WRONG: "The head pointer points to the first node."
RIGHT: "The list needs one fixed entry point — we call this head. Without it,
        the chain of nodes exists in memory but we have no way to find where it
        starts. Head is the only door into the list. Every operation begins here."

---

### RULE 3 — Build code one piece at a time

When a narration has a code field (not null), that code shows ONE new concept
added to what came before. New or changed lines are marked with // ← NEW.
The full current state of the code is always shown, not just the new part.

Never show a complete implementation in one segment. Split every class into:
- the class shell
- one method at a time
- each method explained before its code appears

WRONG: one segment showing a complete LinkedList class with 5 methods
RIGHT: five segments, each adding one method, each preceded by an explanation
       of what that method does and why it exists

---

### RULE 4 — Challenges must be fully specified

Every challenge text must include:
- The exact function or method name to write
- A concrete input example
- The exact expected output for that input
- What NOT to use (which built-ins are off limits)
- At least one edge case to handle

WRONG: "Implement a stack with push and pop."
RIGHT: "Write a class called Stack with two methods: push(value) adds a value
        to the top, pop() removes and returns the top value. Do not use any array
        methods except push() and pop() on an internal array. If pop() is called
        on an empty stack, return null instead of throwing.
        Test: push 10, push 20, push 30, then pop twice.
        Expected output: 30 then 20, then stack contains only [10]."

---

### RULE 5 — The intro segment sets up the problem, not the solution

The segment with id 'intro' must open with a situation or problem the student
recognises. It names neither the DSA concept nor the pattern by name until
after the problem is established. It must not start with "In this lesson we will".

WRONG: "In this lesson we will learn about doubly linked lists and the Memento pattern."
RIGHT: "Every time you hit Ctrl+Z, something has to know what the state was
        before your last action. Not just the current state — the previous state.
        And the one before that. An ordinary singly linked list only knows what
        comes next. This lesson is about what happens when you need to know what
        came before — and the two ideas (one from data structures, one from
        software design) that solve it the same way."

---

### RULE 6 — The DSA and pattern must visibly meet

Every lesson must contain at least one narration segment where the connection
between the DSA concept and the pattern is made explicit. It must say — in plain
English — why these two things are the same idea.

WRONG: teaching linked lists in segments 1-6, then teaching Decorator in segments 7-10
RIGHT: a segment that says "This is where the two ideas meet. When you wrap a
        node inside another object that adds logging behaviour without changing
        the original Node class, you are writing a Decorator. The linked list
        node IS the component being decorated. The wrapper IS the decorator.
        They are structurally identical."

---

### RULE 7 — Big-O must always be justified

Never state a complexity without explaining why in one or two sentences.

WRONG: "Prepend is O(1)."
RIGHT: "Prepend is O(1) — constant time — because it only ever does two things:
        set node.next to the current head, and update head to the new node.
        Two operations, regardless of whether the list has 3 elements or 3 million."

---

### RULE 8 — CodeLens text must be a guided observation

The text of a codelens segment must name the exact line, describe the exact
change in the variables panel, and explain what that change means.

WRONG: "Step through and watch the variables update."
RIGHT: "Step to the line: node.next = this.head
        Variables panel: node.next changes from null to the address of the
        current head node. This is the moment the new node joins the chain —
        it now points forward into the existing list. Nothing else in the list
        has changed yet. Head still points to the old first node.

        Now step to: this.head = node
        Variables panel: this.head changes from the old first node's address
        to the new node's address. The list's entry point has moved. The new
        node is now first. The old first node is still there — reachable through
        new node's next pointer. No elements were shifted. No copying happened.
        That is why this operation is O(1)."

---

## PART 6 — SEGMENT STRUCTURE EVERY LESSON MUST FOLLOW

Segments appear in this order. Minimum 14 segments per lesson.

```
1.  narration id='intro'
      — opens with the problem, no solution names yet
      — ends by hinting that two ideas (not yet named) solve it

[DSA SECTION — 4 to 6 segments]
2.  narration  — name and define the DSA concept, explain why it exists
3.  narration  — first code step: the smallest unit (e.g. the Node class)
4.  narration  — second code step: the container (e.g. the List class)
5.  narration  — third code step: first operation (e.g. prepend)
6.  narration  — (optional) fourth code step: second operation or traversal
7.  challenge  — DSA-only challenge, fully specified
8.  checkpoint

[PATTERN SECTION — 3 to 5 segments]
9.  narration  — name and define the pattern; explain the problem it solves
                 WITHOUT yet connecting it to the DSA concept
10. narration  — show the pattern in code, built step by step
11. narration  — THE MEETING POINT: explicitly connect DSA and pattern
                 ("The [DSA thing] IS the [pattern thing] because...")
12. narration  — (optional) extended pattern code using the DSA structure
13. challenge  — pattern challenge, fully specified
14. checkpoint

[COMBINED SECTION — 2 to 3 segments]
15. narration  — build a small real component using both DSA and pattern together
16. challenge  — combined challenge
17. checkpoint

[CODELENS — 2 segments]
18. narration id='codelens-setup'
      — tells the student what specific thing to watch and why
19. codelens   — the combined code to step through
```

---

## PART 7 — WHAT TO DO WITH LESSONS THAT NEED SPLITTING

Lessons 06, 07, and 10 each cover multiple plan entries.
When generating a new lesson that "splits from lesson-XX", the new lesson:

- Does NOT re-teach what lesson-XX already covered well
- DOES go deeper on the specific concept that lesson-XX treated too briefly
- Opens with a short one-paragraph "In the previous lesson on [topic] we saw X.
  This lesson goes deeper on Y, which that lesson only touched on."
- Otherwise follows the full segment structure above

Specific splits:

**lesson-06.js (Binary Trees + Composite)** is broad.
Split into:
- Lesson 15: BST invariant + Template Method (search skeleton)
- Lesson 16: AVL rotations + balance (no forced pattern)

**lesson-07.js (Graphs + Strategy)** covers representation + BFS + DFS.
Split into:
- Lesson 19: Graph Representation + Adapter
- Lesson 20: BFS + Observer
- Lesson 21: DFS + Visitor (lesson-07 covers this but shallowly)

**lesson-10.js (Dynamic Programming)** covers memoization through knapsack.
Split into:
- Lesson 13: Memoization + Proxy (the cache as proxy — this is the core insight)
- Lesson 28: Sequence DP — LCS, LIS, edit distance
- Lesson 29: Grid DP and interval DP
- Lesson 30: Knapsack + Strategy

---

## PART 8 — OUTPUT FORMAT

Output ONLY the JavaScript object. No explanation. No markdown fences.
Raw JavaScript starting with:

  export const lesson = {

and ending with:

  }

The file must be directly importable without modification.
Every string in a code field must be syntactically valid JavaScript.
Every validate function must correctly check the expected output.

---

## PART 9 — BEFORE YOU OUTPUT, CHECK THESE

Answer YES to every item. If any is NO, the lesson is not finished.

```
[ ] Does the intro open with a problem, not a solution name?
[ ] Is every technical term defined before or when it first appears?
[ ] Does every Big-O claim include a one-sentence justification?
[ ] Is there a segment that explicitly connects the DSA concept to the pattern?
[ ] Is the code built in at least 3 steps with // ← NEW markers?
[ ] Does no single code segment contain a complete class implementation?
[ ] Does every challenge specify: function name, input, output, forbidden built-ins, edge case?
[ ] Does the codelens text name specific lines and specific variable changes?
[ ] Are there at least 14 segments?
[ ] Is every code string valid runnable JavaScript?
[ ] Do all checkpoint ids match entries in the top-level checkpoints array?
```