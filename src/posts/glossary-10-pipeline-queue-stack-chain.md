# Sequence and Flow: Pipeline, Queue, Stack, Chain of Responsibility

## What you will build

Four runnable programs — one per concept — in both Python and TypeScript,
showing four different answers to the question "how should work flow
through a system?" A Pipeline transforms data through ordered stages. A
Queue holds work until something is ready to process it, in the order it
arrived. A Stack holds work to be processed last-in, first-out. A Chain
of Responsibility passes a request along a sequence of handlers until one
of them deals with it. By the end you'll recognize all four structures in
real code and know exactly which one fits which problem.

## What you need to know first

This post assumes comfort with basic Python (variables, functions,
classes) and basic TypeScript orientation from the TypeScript Prereq
posts. No prior glossary posts are required — this post stands fully
alone. The Pipeline connects to the Orchestrator from Glossary 04 (which
controls a sequence of steps — the difference is named below). The Queue
and Stack are fundamental data structures you may have encountered before;
this post gives them precise definitions and shows them in use.

## Setting up to run TypeScript

```
npx tsc filename.ts
node filename.js
```

`tsc` compiles and type-checks; a type error stops compilation. `node`
runs the compiled output.

---

## Concept 1: Pipeline

A **Pipeline** is a sequence of processing stages where the output of
each stage becomes the input of the next. Data enters one end, flows
through every stage in order, and exits the other end transformed.
Each stage does one focused job and knows nothing about the stages before
or after it.

### Problem first

Suppose you're processing text: clean up whitespace, split into words,
remove short words, and count frequencies. Without a pipeline, this
logic is either one large function mixing all four concerns together, or
four functions with their dependencies implied but not enforced by
structure.

### Python

```python
def clean(text):
    result = text.strip().lower()
    print(f"  [clean]  '{text[:20]}...' → '{result[:20]}...'")
    return result


def tokenize(text):
    result = text.split()
    print(f"  [tokenize] {len(result)} tokens")
    return result


def filter_short(words, min_length=3):
    result = [word for word in words if len(word) >= min_length]
    print(f"  [filter]   {len(result)} words remaining (min length {min_length})")
    return result


def count_frequencies(words):
    frequencies = {}
    for word in words:
        frequencies[word] = frequencies.get(word, 0) + 1
    result = dict(sorted(frequencies.items(), key=lambda item: item[1], reverse=True))
    print(f"  [count]    {len(result)} unique words")
    return result
```

**Walkthrough — new syntax.** `text.strip().lower()` chains two string
methods: `strip()` removes leading and trailing whitespace, then `lower()`
converts to lowercase — both familiar from this series' strings post,
chained here for conciseness. `[word for word in words if len(word) >=
min_length]` is a **list comprehension** — a compact way of building a new
list by filtering or transforming an existing sequence. It reads naturally:
"give me each `word` from `words`, but only if `len(word) >= min_length`."
This is equivalent to starting with `result = []`, looping over `words`,
and calling `result.append(word)` when the condition is true — just
expressed in one line. `frequencies.get(word, 0)` safely retrieves the
current count for `word`, defaulting to `0` if `word` hasn't been seen
yet (from this series' dictionaries post). `sorted(frequencies.items(),
key=lambda item: item[1], reverse=True)` sorts the dictionary's key-value
pairs by their value (the count, at index `1` of each pair), descending.
`lambda item: item[1]` is an inline anonymous function (from this series'
communication post): given a `(word, count)` pair, return the count.
`reverse=True` sorts highest-first instead of lowest-first.

Without a pipeline, calling these in sequence looks like:

```python
raw = "  The quick brown fox jumps over the lazy dog the fox  "
cleaned = clean(raw)
tokens = tokenize(cleaned)
filtered = filter_short(tokens)
result = count_frequencies(filtered)
print(f"\nResult: {result}")
```

This works, but the sequence of operations is expressed as four separate
assignment statements — the structure exists in the caller's mind, not
in the code. A pipeline makes the sequence explicit and reusable:

```python
class Pipeline:
    def __init__(self, *stages):
        self._stages = stages

    def run(self, data):
        for stage in self._stages:
            data = stage(data)
        return data
```

**Walkthrough — new syntax.** `def __init__(self, *stages)` — the `*`
before `stages` is the **variadic parameter** syntax (briefly named in
this series' Communication post when covering `EventEmitter`). It collects
any number of positional arguments into a tuple named `stages`. Calling
`Pipeline(clean, tokenize, filter_short, count_frequencies)` passes all
four functions as a single tuple — the pipeline doesn't need to know in
advance how many stages it will hold. `for stage in self._stages: data =
stage(data)` is the accumulator pattern from this series' loops post,
applied to transformation: `data` starts as the raw input and is
overwritten on each iteration with the output of the current stage,
feeding naturally into the next.

```python
pipeline = Pipeline(clean, tokenize, filter_short, count_frequencies)

print("Running pipeline:")
result = pipeline.run("  The quick brown fox jumps over the lazy dog the fox  ")
print(f"\nTop words: {list(result.items())[:3]}")
```

```
Running pipeline:
  [clean]  '  The quick brown fo...' → 'the quick brown fox ...'
  [tokenize] 11 tokens
  [filter]   11 words remaining (min length 3)
  [count]    8 unique words

Top words: [('the', 3), ('fox', 2), ('quick', 1)]
```

**Walkthrough:** Each stage receives the previous stage's output, does
its single job, and returns a transformed result. The pipeline itself is
agnostic to what the stages do — it only knows to call each one in order
and pass the output along. Swapping in a different stage, or inserting a
new one, requires changing only the pipeline's construction, not any of
the stage functions themselves.

**CS lens — Pipeline vs Orchestrator.** In Glossary 04, the Orchestrator
controlled a multi-step workflow where each step might succeed or fail,
branch on results, or call different services depending on outcomes. A
Pipeline is simpler and more constrained: every stage always runs, every
stage receives the previous stage's output as its only input, and the
same type of data flows through from start to finish. The Orchestrator is
for workflows with branching logic and heterogeneous steps; the Pipeline
is for linear, uniform data transformations where each stage's output is
the next stage's input by design.

**SE lens.** Pipelines appear constantly in real systems: Unix pipes
(`cat file | grep pattern | sort | uniq`), data processing pipelines
(ETL: Extract, Transform, Load), image processing chains (resize →
sharpen → compress → save), HTTP middleware chains (authenticate →
authorize → parse → handle → log). The defining property every real
pipeline shares: each stage is independently testable, replaceable, and
reorderable without the others knowing. This is the same separation of
concerns principle named throughout this series — applied specifically to
sequential data transformation.

**What breaks without this:** Mixing all transformation logic into one
large function means testing one transformation requires running all of
them, changing one transformation risks breaking the others, and reusing
any single stage elsewhere in the codebase means duplicating it.

### TypeScript

```typescript
type Stage<T> = (data: T) => T;

class Pipeline<T> {
  private stages: Stage<T>[];

  constructor(...stages: Stage<T>[]) {
    this.stages = stages;
  }

  run(data: T): T {
    for (const stage of this.stages) {
      data = stage(data);
    }
    return data;
  }
}
```

**Walkthrough — TypeScript syntax, explained at point of use.** `type
Stage<T> = (data: T) => T` is a generic type alias (from TypeScript
Prereq 02): `Stage<T>` is a function that takes a value of type `T` and
returns a value of the same type `T`. The generic `<T>` means this alias
works for any type — `Stage<string>` is a `string → string` function,
`Stage<number[]>` is a `number[] → number[]` function. `class Pipeline<T>`
declares a generic class — the same `T` flows through the whole class,
ensuring every stage in the pipeline works on the same type of data.
`constructor(...stages: Stage<T>[])` — the `...` is the TypeScript rest
parameter (from Prereq 02), collecting any number of arguments into an
array; the type `Stage<T>[]` means each one must be a function matching
the `Stage<T>` shape. This is the TypeScript equivalent of Python's
`*stages`, but with the type of each stage enforced at compile time.

```typescript
function clean(text: string): string {
  const result = text.trim().toLowerCase();
  console.log(`  [clean]  '${text.slice(0, 20)}...' → '${result.slice(0, 20)}...'`);
  return result;
}

function tokenize(text: string): string[] {
  const result = text.split(/\s+/);
  console.log(`  [tokenize] ${result.length} tokens`);
  return result;
}

function filterShort(words: string[]): string[] {
  const result = words.filter((word) => word.length >= 3);
  console.log(`  [filter]   ${result.length} words remaining (min length 3)`);
  return result;
}
```

**Walkthrough — new syntax.** `text.trim()` is JavaScript's equivalent of
Python's `str.strip()` — removes leading and trailing whitespace.
`.toLowerCase()` is `.lower()`. `.slice(0, 20)` returns the first 20
characters — JavaScript's equivalent of Python's `text[:20]` slice
notation. `text.split(/\s+/)` — `/\s+/` is a regular expression (briefly
introduced in Glossary 08): `\s` matches any whitespace character, `+`
means "one or more." Splitting on `/\s+/` handles multiple consecutive
spaces as a single separator, equivalent to Python's `.split()` with no
argument, which also handles runs of whitespace. `.filter((word) =>
word.length >= 3)` is the array filter method (from Prereq 02): returns
a new array keeping only items where the arrow function returns `true`.

```typescript
function countFrequencies(words: string[]): Record<string, number> {
  const frequencies: Record<string, number> = {};
  for (const word of words) {
    frequencies[word] = (frequencies[word] ?? 0) + 1;
  }
  const entries = Object.entries(frequencies).sort((a, b) => b[1] - a[1]);
  const result = Object.fromEntries(entries);
  console.log(`  [count]    ${Object.keys(result).length} unique words`);
  return result;
}
```

**Walkthrough — new syntax.** `frequencies[word] ?? 0` — the nullish
coalescing operator `??` (from Prereq 01): if `frequencies[word]` is
`undefined` (the key doesn't exist yet), use `0` as the fallback; otherwise
use the existing count. `Object.entries(frequencies)` returns an array of
`[key, value]` pairs, equivalent to Python's `dict.items()`.
`.sort((a, b) => b[1] - a[1])` sorts descending by the second element
(the count) — the comparator function pattern introduced in Glossary 07's
TypeScript Strategy example. `Object.fromEntries(entries)` converts the
sorted array of pairs back into an object — the reverse of `Object.entries`,
equivalent to `dict(sorted_pairs)` in Python.

Because the pipeline stages here have *different* input and output types
(`string → string → string[] → string[] → Record<string, number>`), a
single generic `Pipeline<T>` where `T` must stay consistent can't
express this directly. The idiomatic TypeScript solution for a
heterogeneous pipeline (where types change between stages) is to let
TypeScript infer through function composition, or use separate typed
stages. Here the simpler solution is to run the type-changing stages
explicitly and use the Pipeline only for the same-type stages:

```typescript
console.log("Running pipeline:");

const raw = "  The quick brown fox jumps over the lazy dog the fox  ";
const cleaned  = clean(raw);
const tokens   = tokenize(cleaned);

const wordPipeline = new Pipeline<string[]>(filterShort);
const filtered = wordPipeline.run(tokens);
const result   = countFrequencies(filtered);

const topWords = Object.entries(result).slice(0, 3);
console.log(`\nTop words: ${JSON.stringify(topWords)}`);
```

```
Running pipeline:
  [clean]  '  The quick brown fo...' → 'the quick brown fox ...'
  [tokenize] 11 tokens
  [filter]   11 words remaining (min length 3)
  [count]    8 unique words

Top words: [["the",3],["fox",2],["quick",1]]
```

**Walkthrough:** The type-changing transitions (`string → string[]`,
`string[] → Record`) are called directly because TypeScript's type system
can't express a pipeline whose data type changes between stages in this
simple generic form. The `Pipeline<string[]>` instance handles the
same-type stage (`filterShort`) cleanly with full type checking. This is
an honest limitation of the simple generic pipeline: it works perfectly
for uniform transformations (all stages share one type) but needs more
sophisticated generic machinery for heterogeneous ones. Real TypeScript
pipeline libraries use more advanced generics to handle this — but that's
beyond the orientation scope of this post.

---

## Concept 2: Queue

A **Queue** is a data structure that holds items in the order they arrived,
providing them for processing in that same order — first in, first out
(**FIFO**). A Queue is used when work arrives faster than it can be
processed, or when fairness demands that earlier arrivals are handled
before later ones.

### Python

Python's standard library includes a `deque` (double-ended queue) in its
`collections` module that's optimized for efficient additions to the right
and removals from the left — exactly the FIFO behavior a queue needs:

```python
from collections import deque


class TaskQueue:
    def __init__(self):
        self._queue = deque()

    def enqueue(self, task):
        self._queue.append(task)
        print(f"  Enqueued: '{task}' (queue size: {len(self._queue)})")

    def dequeue(self):
        if not self._queue:
            print("  Queue is empty — nothing to dequeue")
            return None
        task = self._queue.popleft()
        print(f"  Dequeued: '{task}' (queue size: {len(self._queue)})")
        return task

    def is_empty(self):
        return len(self._queue) == 0

    @property
    def size(self):
        return len(self._queue)
```

**Walkthrough — new syntax.** `from collections import deque` imports
the `deque` type from Python's built-in `collections` module. `deque` is
preferred over a plain `list` for queue operations because `list.pop(0)`
(removing from the front) requires shifting every other element one
position left — an O(n) operation that gets slower as the list grows.
`deque.popleft()` is O(1) — constant time regardless of size — because
a deque is implemented as a doubly-linked list optimized for both-end
operations. `self._queue.append(task)` adds to the right (the back of the
queue). `self._queue.popleft()` removes from the left (the front) —
exactly FIFO behavior. `not self._queue` evaluates to `True` when the
deque is empty — the same truthiness rule from this series' control flow
post: an empty collection is falsy.

```python
queue = TaskQueue()

print("Adding tasks:")
queue.enqueue("Send welcome email")
queue.enqueue("Process payment")
queue.enqueue("Update inventory")
queue.enqueue("Notify shipping")

print(f"\nQueue size: {queue.size}")

print("\nProcessing tasks:")
while not queue.is_empty():
    task = queue.dequeue()
    print(f"  → Processing: '{task}'")
```

```
Adding tasks:
  Enqueued: 'Send welcome email' (queue size: 1)
  Enqueued: 'Process payment' (queue size: 2)
  Enqueued: 'Update inventory' (queue size: 3)
  Enqueued: 'Notify shipping' (queue size: 4)

Queue size: 4

Processing tasks:
  Dequeued: 'Send welcome email' (queue size: 3)
  → Processing: 'Send welcome email'
  Dequeued: 'Process payment' (queue size: 2)
  → Processing: 'Process payment'
  Dequeued: 'Update inventory' (queue size: 1)
  → Processing: 'Update inventory'
  Dequeued: 'Notify shipping' (queue size: 0)
  → Processing: 'Notify shipping'
```

**Walkthrough:** Tasks are dequeued in exactly the order they were
enqueued — "Send welcome email" was added first and processed first. This
is the FIFO guarantee: no matter when in the future a task gets processed,
it respects the order in which tasks arrived.

**CS lens — why not just use a list?** A list supports the same logical
operations (`append` for enqueue, `pop(0)` for dequeue), but `pop(0)` on
a list is O(n) — to remove the first element, Python must shift every
remaining element one position forward in memory. For a queue holding
millions of tasks processed thousands of times per second, this becomes
the performance bottleneck. `deque.popleft()` is O(1) because the
structure is designed for exactly this access pattern. This is the same
data-structure-choice reasoning from this series' dictionaries post — the
right tool for the right operation matters at scale.

**SE lens.** Queues appear throughout real systems: message queues (Kafka,
RabbitMQ, AWS SQS) hold events or tasks to be processed by workers;
print spoolers queue documents; operating systems queue I/O operations;
web servers queue incoming requests when backend workers are busy. The
shared property: producers (code that adds to the queue) and consumers
(code that removes and processes) are decoupled in time — a producer
doesn't need to wait for a consumer to be ready, and a consumer doesn't
need to sit idle waiting for a producer.

**What breaks without this:** Without a queue, producers and consumers
must be synchronized — the producer waits for the consumer to be available
before handing off work, which either blocks the producer (slowing
everything that creates work) or drops work that arrives while the
consumer is busy.

### TypeScript

```typescript
class TaskQueue {
  private queue: string[] = [];

  enqueue(task: string): void {
    this.queue.push(task);
    console.log(`  Enqueued: '${task}' (queue size: ${this.queue.length})`);
  }

  dequeue(): string | null {
    if (this.queue.length === 0) {
      console.log("  Queue is empty — nothing to dequeue");
      return null;
    }
    const task = this.queue.shift();
    console.log(`  Dequeued: '${task}' (queue size: ${this.queue.length})`);
    return task ?? null;
  }

  isEmpty(): boolean {
    return this.queue.length === 0;
  }

  get size(): number {
    return this.queue.length;
  }
}
```

**Walkthrough — new syntax.** `this.queue.shift()` is JavaScript's
built-in array method that removes and returns the *first* element —
the direct equivalent of Python's `deque.popleft()`. Unlike Python's
`deque`, JavaScript's `Array.shift()` is technically O(n) for the same
reason Python's `list.pop(0)` is — but JavaScript engines optimize it
heavily in practice, and for the sizes typical in application code (not
millions of items), it's perfectly acceptable. Production JavaScript code
that genuinely needs O(1) dequeue uses a linked-list-based data structure
from a library, or manages head/tail indices manually. `get size(): number`
is a TypeScript getter (from Glossary 06's `LineItem.subtotal`) — accessed
as `queue.size`, not `queue.size()`. `task ?? null` — `.shift()` returns
`string | undefined` (undefined if the array was empty), and `?? null`
converts `undefined` to `null` to match the declared return type
`string | null`.

```typescript
const queue = new TaskQueue();

console.log("Adding tasks:");
queue.enqueue("Send welcome email");
queue.enqueue("Process payment");
queue.enqueue("Update inventory");
queue.enqueue("Notify shipping");

console.log(`\nQueue size: ${queue.size}`);

console.log("\nProcessing tasks:");
while (!queue.isEmpty()) {
  const task = queue.dequeue();
  console.log(`  → Processing: '${task}'`);
}
```

```
Adding tasks:
  Enqueued: 'Send welcome email' (queue size: 1)
  Enqueued: 'Process payment' (queue size: 2)
  Enqueued: 'Update inventory' (queue size: 3)
  Enqueued: 'Notify shipping' (queue size: 4)

Queue size: 4

Processing tasks:
  Dequeued: 'Send welcome email' (queue size: 3)
  → Processing: 'Send welcome email'
  Dequeued: 'Process payment' (queue size: 2)
  → Processing: 'Process payment'
  Dequeued: 'Update inventory' (queue size: 1)
  → Processing: 'Update inventory'
  Dequeued: 'Notify shipping' (queue size: 0)
  → Processing: 'Notify shipping'
```

---

## Concept 3: Stack

A **Stack** holds items and provides them in the reverse of the order
they were added — last in, first out (**LIFO**). A Stack is used whenever
the most recently added item is always the one needed next: function call
management (the current function is always at the top), undo history (the
most recent action is undone first), browser back-button history (the
most recently visited page is the one "back" returns to).

### Python

```python
class BrowserHistory:
    def __init__(self, start_page):
        self._stack = [start_page]
        print(f"  Opened browser at: {start_page}")

    def navigate(self, url):
        self._stack.append(url)
        print(f"  Navigated to: {url} (history depth: {len(self._stack)})")

    def back(self):
        if len(self._stack) <= 1:
            print("  Already at the start — cannot go back")
            return self._stack[0]
        self._stack.pop()
        current = self._stack[-1]
        print(f"  Went back to: {current} (history depth: {len(self._stack)})")
        return current

    @property
    def current(self):
        return self._stack[-1]
```

**Walkthrough:** `self._stack = [start_page]` initializes the stack with
the starting page already in it — there must always be at least one page,
since you can't go "back" from the very beginning. `self._stack.append(url)`
adds to the top (the right end of the list). `self._stack.pop()` removes
from the top (the right end) — the LIFO operation. `self._stack[-1]` reads
the top item without removing it — the `[-1]` negative index from this
series' strings and lists posts, meaning "last element." `len(self._stack)
<= 1` guards against popping the only remaining page — there must always
be at least one page in history.

```python
browser = BrowserHistory("google.com")
browser.navigate("github.com")
browser.navigate("docs.github.com")
browser.navigate("stackoverflow.com")

print(f"\nCurrent page: {browser.current}")

print("\nNavigating back:")
browser.back()
browser.back()
print(f"\nCurrent page: {browser.current}")

browser.back()
browser.back()
```

```
  Opened browser at: google.com
  Navigated to: github.com (history depth: 2)
  Navigated to: docs.github.com (history depth: 3)
  Navigated to: stackoverflow.com (history depth: 4)

Current page: stackoverflow.com

Navigating back:
  Went back to: docs.github.com (history depth: 3)
  Went back to: github.com (history depth: 2)

Current page: github.com
  Went back to: google.com (history depth: 1)
  Already at the start — cannot go back
```

**Walkthrough:** Pages are navigated forward (pushed onto the stack) and
revisited in reverse order (popped off). `stackoverflow.com` was added
last, so it's the first removed when going back. After two more back
operations: `docs.github.com` → `github.com` → `google.com`, and at
`google.com` (the start) the guard prevents popping further.

**CS lens — Stack as the universal undo mechanism.** The Stack is one of
the most fundamental data structures in computing. Every programming
language's function call mechanism uses a call stack — when `function_a`
calls `function_b`, `function_b`'s stack frame is pushed on top;
when `function_b` returns, its frame is popped and `function_a` resumes
exactly where it left off. The stack trace you see in an error message
is literally the call stack at the moment the error occurred — from the
error's location at the top to the entry point of the program at the
bottom. This is why the term "stack frame" from this series' Functions
post has "stack" in its name.

**SE lens.** The Command pattern from Glossary 07's `RemoteControl` was,
under the hood, a Stack: commands were pushed onto `_history` as they
executed, and `undo_last` popped the most recent one — LIFO behavior
driving an undo system. Browser history, editor undo, the call stack,
expression evaluation, and depth-first graph traversal all rely on the
same LIFO property.

**What breaks without this:** Implementing undo or back-navigation without
a stack requires either remembering a cursor position into a list (more
complex) or rebuilding history from scratch on each back operation (very
expensive). The stack's simplicity — push to go forward, pop to go back,
peek at the top to see where you are — is exactly matched to the shape of
these problems.

### TypeScript

```typescript
class BrowserHistory {
  private stack: string[];

  constructor(startPage: string) {
    this.stack = [startPage];
    console.log(`  Opened browser at: ${startPage}`);
  }

  navigate(url: string): void {
    this.stack.push(url);
    console.log(`  Navigated to: ${url} (history depth: ${this.stack.length})`);
  }

  back(): string {
    if (this.stack.length <= 1) {
      console.log("  Already at the start — cannot go back");
      return this.stack[0];
    }
    this.stack.pop();
    const current = this.stack[this.stack.length - 1];
    console.log(`  Went back to: ${current} (history depth: ${this.stack.length})`);
    return current;
  }

  get current(): string {
    return this.stack[this.stack.length - 1];
  }
}

const browser = new BrowserHistory("google.com");
browser.navigate("github.com");
browser.navigate("docs.github.com");
browser.navigate("stackoverflow.com");

console.log(`\nCurrent page: ${browser.current}`);

console.log("\nNavigating back:");
browser.back();
browser.back();
console.log(`\nCurrent page: ${browser.current}`);

browser.back();
browser.back();
```

```
  Opened browser at: google.com
  Navigated to: github.com (history depth: 2)
  Navigated to: docs.github.com (history depth: 3)
  Navigated to: stackoverflow.com (history depth: 4)

Current page: stackoverflow.com

Navigating back:
  Went back to: docs.github.com (history depth: 3)
  Went back to: github.com (history depth: 2)

Current page: github.com
  Went back to: google.com (history depth: 1)
  Already at the start — cannot go back
```

**Walkthrough:** `this.stack[this.stack.length - 1]` is TypeScript's
equivalent of Python's `self._stack[-1]` — JavaScript arrays don't support
negative indexing directly, so the last element must be accessed via
`array[array.length - 1]`. This is a genuine, minor ergonomic difference
between the two languages. Everything else is structurally identical to
the Python version.

---

## Concept 4: Chain of Responsibility

A **Chain of Responsibility** passes a request along a sequence of
handlers. Each handler decides: "can I handle this? if yes, handle it and
stop; if no, pass it to the next handler in the chain." The requester
doesn't know which handler will deal with its request — or even how many
handlers the chain contains.

### Problem first

Suppose a support ticket system routes tickets by severity: a basic
agent handles low-severity tickets, a senior agent handles medium ones,
a manager handles high ones, and anything unresolved is escalated.
Without a chain, the routing logic lives in one large `if`/`elif` block
that must know about every handler — adding a new tier means editing the
router.

### Python

```python
class SupportHandler:
    def __init__(self, name, max_severity):
        self.name = name
        self._max_severity = max_severity
        self._next = None

    def set_next(self, handler):
        self._next = handler
        return handler

    def handle(self, ticket_severity, ticket_description):
        if ticket_severity <= self._max_severity:
            print(f"  [{self.name}] Handling severity-{ticket_severity} ticket: '{ticket_description}'")
            return True
        if self._next:
            print(f"  [{self.name}] Passing severity-{ticket_severity} to next handler...")
            return self._next.handle(ticket_severity, ticket_description)
        print(f"  [Unresolved] No handler for severity-{ticket_severity}: '{ticket_description}'")
        return False
```

**Walkthrough:** Each `SupportHandler` knows its own `_max_severity`
threshold and a reference to the `_next` handler in the chain (or `None`
if it's the last one). `set_next` stores the next handler and
*returns it* — this allows chaining the setup calls together fluently,
as you'll see below. `handle` first checks whether this handler can deal
with the ticket (severity within its threshold). If yes, it handles it
and returns `True`. If not, it checks whether there's a next handler
and delegates to it — or, if it's the last handler and still can't handle
it, reports the ticket as unresolved.

```python
agent   = SupportHandler("Basic Agent",  max_severity=2)
senior  = SupportHandler("Senior Agent", max_severity=4)
manager = SupportHandler("Manager",      max_severity=6)

agent.set_next(senior).set_next(manager)

tickets = [
    (1, "Password reset request"),
    (3, "Data not syncing"),
    (5, "Production database down"),
    (7, "Complete system breach"),
]

print("Processing support tickets:")
for severity, description in tickets:
    print(f"\nTicket severity {severity}: '{description}'")
    agent.handle(severity, description)
```

```
Processing support tickets:

Ticket severity 1: 'Password reset request'
  [Basic Agent] Handling severity-1 ticket: 'Password reset request'

Ticket severity 3: 'Data not syncing'
  [Basic Agent] Passing severity-3 to next handler...
  [Senior Agent] Handling severity-3 ticket: 'Data not syncing'

Ticket severity 5: 'Production database down'
  [Basic Agent] Passing severity-5 to next handler...
  [Senior Agent] Passing severity-5 to next handler...
  [Manager] Handling severity-5 ticket: 'Production database down'

Ticket severity 7: 'Complete system breach'
  [Basic Agent] Passing severity-7 to next handler...
  [Senior Agent] Passing severity-7 to next handler...
  [Unresolved] No handler for severity-7: 'Complete system breach'
```

**Walkthrough:** Every request enters the chain at the *same point* —
`agent.handle(...)` — regardless of its severity. The chain itself decides
how far the request travels. Severity 1 is caught by the first handler;
severity 3 passes through the first and is caught by the second; severity
5 passes through both and reaches the manager; severity 7 reaches the end
of the chain unhandled. Adding a new handler tier (say, a `CrisisTeam`
for severity 7+) requires only creating a new `SupportHandler` and
inserting it into the chain — no changes to any existing handler, no
changes to the code that submits tickets.

**CS lens.** Chain of Responsibility is the pattern underneath middleware
stacks in web frameworks: each middleware function can either handle a
request (and stop) or call `next()` to pass it to the next middleware.
Django's middleware, Express's `app.use()`, ASP.NET's request pipeline —
all implement this structure. It's also the basis of event bubbling in
browser DOM: a click event on a button propagates up through parent
elements, each getting a chance to handle it.

**SE lens.** The key property: the *sender* of a request (the code
that calls `agent.handle(...)`) is completely decoupled from the
*receivers* (the individual handlers). The sender doesn't need to know
which handler will ultimately deal with the request, and doesn't need to
be updated when handlers are added, removed, or reordered. This is the
same decoupling benefit as Observer (Glossary 03), but applied to
request routing rather than event notification.

**What breaks without this:** Without a chain, a central routing function
must explicitly know about every possible handler and the conditions under
which each one applies — every new handler requires editing that central
function, and the function grows indefinitely as the system expands.

### TypeScript

```typescript
class SupportHandler {
  private next: SupportHandler | null = null;

  constructor(
    private name: string,
    private maxSeverity: number
  ) {}

  setNext(handler: SupportHandler): SupportHandler {
    this.next = handler;
    return handler;
  }

  handle(ticketSeverity: number, description: string): boolean {
    if (ticketSeverity <= this.maxSeverity) {
      console.log(`  [${this.name}] Handling severity-${ticketSeverity} ticket: '${description}'`);
      return true;
    }
    if (this.next) {
      console.log(`  [${this.name}] Passing severity-${ticketSeverity} to next handler...`);
      return this.next.handle(ticketSeverity, description);
    }
    console.log(`  [Unresolved] No handler for severity-${ticketSeverity}: '${description}'`);
    return false;
  }
}

const agent   = new SupportHandler("Basic Agent",  2);
const senior  = new SupportHandler("Senior Agent", 4);
const manager = new SupportHandler("Manager",      6);

agent.setNext(senior).setNext(manager);

const tickets: Array<[number, string]> = [
  [1, "Password reset request"],
  [3, "Data not syncing"],
  [5, "Production database down"],
  [7, "Complete system breach"],
];

console.log("Processing support tickets:");
for (const [severity, description] of tickets) {
  console.log(`\nTicket severity ${severity}: '${description}'`);
  agent.handle(severity, description);
}
```

**Walkthrough — new syntax.** `Array<[number, string]>` is the type of
an array where each element is a tuple of exactly a `number` followed by
a `string` — TypeScript's typed equivalent of Python's `list` of `(int,
str)` pairs. `for (const [severity, description] of tickets)` uses
**array destructuring** in the loop variable — the same destructuring from
Glossary 08's TypeScript Policy section, but applied to a two-element
array rather than an object. Each iteration unpacks the pair directly
into `severity` and `description`, without needing to access them as
`ticket[0]` and `ticket[1]`. This is the TypeScript equivalent of Python's
`for severity, description in tickets:` tuple unpacking.

```
Processing support tickets:

Ticket severity 1: 'Password reset request'
  [Basic Agent] Handling severity-1 ticket: 'Password reset request'

Ticket severity 3: 'Data not syncing'
  [Basic Agent] Passing severity-3 to next handler...
  [Senior Agent] Handling severity-3 ticket: 'Data not syncing'

Ticket severity 5: 'Production database down'
  [Basic Agent] Passing severity-5 to next handler...
  [Senior Agent] Passing severity-5 to next handler...
  [Manager] Handling severity-5 ticket: 'Production database down'

Ticket severity 7: 'Complete system breach'
  [Basic Agent] Passing severity-7 to next handler...
  [Senior Agent] Passing severity-7 to next handler...
  [Unresolved] No handler for severity-7: 'Complete system breach'
```

---

## Connect the pieces

All four concepts in this post describe how work or data flows through a
system — but each for a different shape of problem.

**Pipeline** transforms data linearly: the same data flows through every
stage in order, each stage focused on one transformation. Every stage
runs, every time.

**Queue** decouples producers from consumers in time: work is stored until
a consumer is ready, in the order it arrived. FIFO.

**Stack** provides the most recently added item first: ideal whenever the
most recent action is the one most likely to be relevant next (undo, back
navigation, function calls). LIFO.

**Chain of Responsibility** routes a request through handlers until one
claims it: unlike a Pipeline (where every stage runs), a Chain stops at
the first handler that accepts the request. Unlike a Dispatcher (Glossary
04, which routes to one specific handler based on a lookup key), a Chain
tries handlers in sequence, each one deciding independently whether to
accept or pass.

The distinction between Queue and Stack is worth memorizing directly:
Queue is a line (first served), Stack is a pile (last added, first taken).
The distinction between Pipeline and Chain of Responsibility is also
worth naming directly: Pipeline is "every stage runs, one output becomes
the next input"; Chain is "each handler decides whether to handle or pass,
and the chain stops when one handles it."

## What breaks without these patterns

Using a plain list as a queue and calling `pop(0)` instead of `popleft()`
works correctly but degrades to O(n) per dequeue — invisible in small
programs, a serious performance problem at scale. Mixing pipeline stage
logic together into one function makes each stage untestable in isolation.
Building routing logic as a central `if`/`elif` chain instead of a Chain
of Responsibility means every new handler requires editing the router,
violating the open/closed principle.

## Definition of done

- [ ] You can explain FIFO and LIFO in your own words, and give a real-
      world example of each that isn't in this post.
- [ ] You can explain the difference between Pipeline (every stage runs)
      and Chain of Responsibility (stops at first accepting handler).
- [ ] You can explain why Python's `deque.popleft()` is preferable to
      `list.pop(0)` for queue operations.
- [ ] You've run all four patterns in Python and TypeScript and confirmed
      matching output.
- [ ] You can explain why `stack[stack.length - 1]` in TypeScript
      achieves what `stack[-1]` achieves in Python.
- [ ] You can explain what `Array<[number, string]>` means in TypeScript
      and how `for (const [severity, description] of tickets)` unpacks it.
