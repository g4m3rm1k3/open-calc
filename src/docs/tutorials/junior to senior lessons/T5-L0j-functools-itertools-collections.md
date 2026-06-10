# Junior to Senior — T5·L0j — `functools`, `itertools`, `collections`

**Prerequisites:** T5·L0i (Context Managers). You understand Python's execution model.
This lesson covers three standard library modules that replace common patterns you
would otherwise write by hand — often with better performance and fewer bugs.

**What this lab adds:**
- `functools.partial`: pre-filling function arguments — no lambdas needed
- `functools.lru_cache`: memoising expensive pure functions — O(1) after first call
- `itertools.chain`: merging iterables without creating a combined list
- `itertools.groupby`: grouping consecutive sorted items
- `collections.defaultdict`: dictionaries with automatic default values for missing keys
- `collections.Counter`: counting occurrences with a built-in `most_common()`
- `collections.deque(maxlen=N)`: O(1) append/pop from both ends with a bounded history

**Time:** 45–60 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. You call the same pure function with the same arguments 1,000 times.
>    What specific module and decorator avoids recomputing the result each time?
> 2. `defaultdict(list)` vs `{}` with `d.setdefault(key, [])` — name one
>    concrete difference in how you use them.
> 3. You have five lists of tasks from five different sources. You want to iterate
>    all of them as one sequence without creating a new combined list. Which function?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

Utility functions for the task API that use the standard library efficiently:

```python
>>> is_valid_task_title('Write tests')   # lru_cache — computed once, cached
True
>>> is_valid_task_title('Write tests')   # returned from cache — instant

>>> counts = Counter(t.priority for t in tasks)
>>> counts.most_common(2)
[('high', 15), ('medium', 8)]

>>> history = CommandHistory(maxlen=50)
>>> history.add('create task "Deploy"')
>>> history.recent(3)
['create task "Deploy"', ...]
```

---

### Concept: `functools.partial` — Pre-Filling Arguments

**What it is:** `partial(func, *args, **kwargs)` returns a new callable with
some arguments already filled in. Every call to the partial uses those pre-filled
arguments.

**The problem before:**

```python
def send_notification(recipient: str, subject: str, body: str) -> None:
    print(f'To: {recipient} | Subject: {subject}')

# To send multiple notifications to alice, you repeat the recipient:
send_notification('alice@e.com', 'Task done', 'Task 1 is complete')
send_notification('alice@e.com', 'Task due', 'Task 2 is due tomorrow')
send_notification('alice@e.com', 'New task', 'Task 3 was assigned to you')

# OR you write a lambda (awkward):
notify_alice = lambda subject, body: send_notification('alice@e.com', subject, body)
```

**The solution:**

```python
from functools import partial

notify_alice = partial(send_notification, 'alice@e.com')  # recipient pre-filled
notify_alice('Task done', 'Task 1 is complete')           # only remaining args
notify_alice('Task due', 'Task 2 is due tomorrow')
```

**What it hides:** The extra argument. `partial` wraps the original function with
the pre-filled arguments stored internally. Callers of `notify_alice` only provide
the remaining arguments.

**Canonical example:** A pizza order template. `small_margherita = partial(order_pizza, size='small', topping='margherita')`. Every call to `small_margherita(quantity=2)` uses the pre-filled size and topping.

**Project application:** A logging function pre-configured with the module name:
`log_task_event = partial(logger.info, 'Task event in module task_api: %s')`.

**Smallest possible example:**

```python
from functools import partial

def add(a: int, b: int) -> int:
    return a + b

add_five = partial(add, 5)   # a is pre-filled as 5
add_five(3)   # → 8   (same as add(5, 3))
add_five(10)  # → 15  (same as add(5, 10))
```

**You will see this again in:**
- `functools.reduce(partial(add, initial=0), items)` — partial inside higher-order functions
- `click` CLI library: `@click.option` uses partial to configure options
- `unittest.mock.patch` as a decorator uses partial for test fixtures

**Watch for:** Arguments passed to `partial` are positional by default. `partial(add, 5)` fills
the FIRST positional argument. To fill a keyword argument:
`partial(add, b=5)` — now `add_five_b(3)` returns `add(3, b=5) = 8`.

---

## Step 1 — See `partial` in Action

```bash
python -c "
from functools import partial

def multiply(x: int, factor: int) -> int:
    return x * factor

double = partial(multiply, factor=2)
triple = partial(multiply, factor=3)

print(double(5))   # → 10
print(triple(5))   # → 15
print(double(7))   # → 14
"
```

**You should see:**
```
10
15
14
```

---

### Concept: `functools.lru_cache` — Memoisation

**What it is:** `@lru_cache(maxsize=128)` caches the return value of a function
for each unique set of arguments. LRU stands for Least Recently Used — when the
cache is full, the least recently used entry is evicted.

**The problem before:**

```python
import re

def is_valid_task_title(title: str) -> bool:
    # Compiling the regex on EVERY call:
    pattern = re.compile(r'^[A-Za-z0-9 \-_,.!?]{2,200}$')
    return bool(pattern.match(title.strip()))

# Called 1,000 times: compiles regex 1,000 times
# Especially wasteful in a tight loop or hot code path
```

**The solution:**

```python
from functools import lru_cache
import re

@lru_cache(maxsize=256)
def is_valid_task_title(title: str) -> bool:
    pattern = re.compile(r'^[A-Za-z0-9 \-_,.!?]{2,200}$')
    return bool(pattern.match(title.strip()))

# First call with 'Write tests': computed and cached
# All subsequent calls with 'Write tests': O(1) cache hit
is_valid_task_title.cache_info()
# CacheInfo(hits=999, misses=1, maxsize=256, currsize=1)
```

**What it hides:** The cache data structure and the key hashing. The decorator
intercepts every call, computes the cache key from the arguments, looks up the
result, and either returns the cached value or computes and stores the new one.

**The invariant `lru_cache` protects:** For pure functions (same input → same output,
no side effects), the cached result is always correct. The cache is transparent —
callers do not need to know it exists.

**Canonical example:** A restaurant menu. Computing the price of a 'burger' from
raw ingredients takes seconds. Caching the computed price means subsequent requests
for 'burger' return instantly from memory. The menu (cache) is valid as long as
prices don't change (pure function guarantee).

**Project application:** `is_valid_task_title` is called on every incoming API
request to validate the title. With `@lru_cache`, the first validation of each
title is computed; subsequent identical titles return from cache.

**Smallest possible example:**

```python
from functools import lru_cache

@lru_cache(maxsize=32)
def fibonacci(n: int) -> int:
    if n < 2:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

fibonacci(35)   # fast — O(n) total because results are cached
```

**You will see this again in:**
- `re.compile(pattern)` already uses a small internal cache for regex patterns
- `@lru_cache` on expensive database lookups (careful: cache invalidation becomes your problem)
- `@cached_property` from `functools` — same idea, per-instance on a class attribute

**Watch for:**
1. All arguments must be HASHABLE (strings, ints, tuples — not lists or dicts).
   `lru_cache` uses arguments as dict keys.
2. The function must be PURE — same inputs must always produce the same output.
   Never cache functions with side effects or that depend on external state.
3. `lru_cache` with `maxsize=None` is `@cache` — unbounded, never evicts entries.

---

### Concept: `itertools.chain` — Merging Iterables Without a New List

**What it is:** `chain(iter1, iter2, ...)` returns a lazy iterator that yields all
items from `iter1`, then all items from `iter2`, etc. — without creating a new combined list.

**The problem before:**

```python
# To iterate three lists together, you build a new combined list:
all_tasks = active_tasks + on_hold_tasks + done_tasks   # NEW list in memory
for task in all_tasks:   # then iterate
    process(task)
```

If each list has 10,000 items, the combined list is 30,000 items in memory — even
if you only need to iterate it once.

**The solution:**

```python
from itertools import chain

for task in chain(active_tasks, on_hold_tasks, done_tasks):   # no new list
    process(task)
# chain lazily switches from one iterable to the next — O(1) overhead
```

**What it hides:** The pointer management. `chain` maintains an iterator over its
arguments, advancing through them in sequence. No data is copied.

**Canonical example:** Reading multiple chapters of a book in sequence. You don't
photocopy all chapters into one document first — you just turn to the next chapter
when the current one ends.

**Project application:** Processing all tasks from multiple projects or sources in
a single pipeline — `chain(project1.tasks, project2.tasks, project3.tasks)`.

**Smallest possible example:**

```python
from itertools import chain

list(chain([1, 2], [3, 4], [5]))   # → [1, 2, 3, 4, 5]

# chain.from_iterable: flattens a list of lists:
nested = [[1, 2], [3, 4], [5]]
list(chain.from_iterable(nested))  # → [1, 2, 3, 4, 5]
```

**You will see this again in:**
- `itertools.chain.from_iterable(nested_list)` — the standard way to flatten a list of lists
- Database ORM: chaining multiple querysets without combining them into one SQL query
- Any pipeline that processes items from multiple sources in sequence

**Watch for:** `chain` is lazy — it does not validate that its arguments are iterable
until it reaches them. `chain([1, 2], 'not-iterable')` won't fail until the iterator
advances to `'not-iterable'`.

---

### Concept: `collections.defaultdict` — Dicts With Automatic Defaults

**What it is:** `defaultdict(factory)` is a dict that calls `factory()` automatically
when you access a key that doesn't exist. You never need to check whether the key exists
before using it.

**The problem before:**

```python
# Grouping tasks by priority — manual key existence check:
by_priority: dict[str, list] = {}
for task in tasks:
    if task.priority not in by_priority:   # check on every iteration
        by_priority[task.priority] = []
    by_priority[task.priority].append(task)
```

**The solution:**

```python
from collections import defaultdict

by_priority: dict[str, list] = defaultdict(list)
for task in tasks:
    by_priority[task.priority].append(task)  # no if-check needed
    # If the key doesn't exist, defaultdict calls list() and creates []
```

**What it hides:** The key existence check. The `defaultdict` calls the factory
once per new key and stores the result. All subsequent accesses return the stored value.

**Canonical example:** A classroom roll call. `defaultdict(list)` with student groups
— if you call `groups['year7'].append('Alice')` and 'year7' doesn't exist yet, an empty
list is created for 'year7' first. You never check if 'year7' exists.

**Project application:** Grouping tasks by priority, by status, or by assignee.

**Smallest possible example:**

```python
from collections import defaultdict

word_count: dict[str, int] = defaultdict(int)   # default: 0 (int())
for word in 'the quick brown fox the fox'.split():
    word_count[word] += 1   # no 'if word not in word_count' check

dict(word_count)  # → {'the': 2, 'quick': 1, 'brown': 1, 'fox': 2}
```

**You will see this again in:**
- Graph adjacency lists: `adjacency = defaultdict(set)` — add edges without checking if node exists
- Caching: `cache = defaultdict(compute_expensive_value)` — compute on demand
- Every time you build a group-by operation in Python

**Watch for:** `defaultdict` creates the key on READ, not just on write.
`if 'missing_key' in my_dict:` doesn't trigger the default. But
`my_dict['missing_key']` DOES — even if you're just reading. This can cause
unexpected keys to appear in the dict.

---

### Concept: `collections.Counter` — Counting With `most_common()`

**What it is:** `Counter(iterable)` counts occurrences of each item. It is a
subclass of `dict` with built-in `most_common(n)`, arithmetic, and subtraction.

**The problem before:**

```python
priority_counts: dict[str, int] = {}
for task in tasks:
    if task.priority in priority_counts:
        priority_counts[task.priority] += 1
    else:
        priority_counts[task.priority] = 1

# To get the top 2:
top2 = sorted(priority_counts.items(), key=lambda x: x[1], reverse=True)[:2]
```

**The solution:**

```python
from collections import Counter

priority_counts = Counter(t.priority for t in tasks)
top2 = priority_counts.most_common(2)   # [(priority, count), ...] sorted by count
```

**What it hides:** The sorting and counting logic. `most_common(n)` uses a partial
heap sort (O(n log k) where k is n) rather than sorting the entire collection.

**Project application:** Task statistics — which priorities are most common, which
users have the most overdue tasks.

**Smallest possible example:**

```python
from collections import Counter

letters = Counter('aabbccaaa')
letters['a']              # → 5
letters.most_common(2)    # → [('a', 5), ('b', 2)]
letters.total()           # → 9 (Python 3.10+)
```

**You will see this again in:**
- Log analysis: counting error types
- Text processing: word frequency, n-gram counting
- Any "what's the most common X?" query

**Watch for:** `Counter` initialised with a dict vs an iterable:
- `Counter({'a': 3, 'b': 1})` — initialise from an existing count dict
- `Counter('aaa b')` — count characters
- `Counter(['a', 'a', 'b'])` — count list items

---

### Concept: `collections.deque` — O(1) Bounded History

**What it is:** `deque` (double-ended queue) supports O(1) append and pop from
BOTH ends. With `maxlen=N`, it automatically discards the oldest item when full.

**The problem before:**

```python
history = []
MAX_SIZE = 50

def add_to_history(command: str) -> None:
    history.append(command)
    if len(history) > MAX_SIZE:
        history.pop(0)   # O(n) — shifts all elements left
```

`list.pop(0)` is O(n) — it copies every element left by one position.
For a history of 10,000 items, each add costs 10,000 copies.

**The solution:**

```python
from collections import deque

history: deque[str] = deque(maxlen=50)
history.appendleft('most recent')    # O(1) — adds to the left end
# When the deque reaches maxlen=50, the rightmost item is automatically discarded
```

**What it hides:** The circular buffer implementation. `deque` uses a doubly-linked
list internally, giving O(1) operations at both ends. `maxlen` makes it self-bounded.

**Canonical example:** A newsroom ticker. The most recent 10 headlines scroll from
right to left. When a new headline arrives, the oldest is automatically removed.
The ticker has a fixed capacity — `deque(maxlen=10)`.

**Project application:** `CommandHistory` — the last 100 commands run by a user,
with automatic eviction of the oldest.

**Smallest possible example:**

```python
from collections import deque

log = deque(maxlen=3)   # keep only 3 most recent entries
log.append('first')
log.append('second')
log.append('third')
log.append('fourth')    # 'first' is automatically discarded

list(log)   # → ['second', 'third', 'fourth']
```

**You will see this again in:**
- Rate limiting: sliding window of recent requests
- Undo/redo stacks with a maximum depth
- Any bounded cache or history buffer

**Watch for:** `deque` is not subscriptable like a list: `d[0]` works (first element),
but `d[5:-2]` raises `TypeError`. For slicing, convert to a list first: `list(d)[5:-2]`.

---

## Step 2 — Build the Task Utilities

Create `src/utils/task_utils.py`:

```python
# src/utils/task_utils.py
from __future__ import annotations
from functools    import lru_cache, partial
from itertools    import chain, groupby
from collections  import defaultdict, Counter, deque
from typing       import Iterator, Any
import re
from src.domain.task  import Task
from src.domain.enums import Priority


@lru_cache(maxsize=256)
def is_valid_task_title(title: str) -> bool:
    """Validates a task title. Cached — the same title is validated only once."""
    return bool(re.match(r'^[A-Za-z0-9 \-_,.!?]{2,200}$', title.strip()))
```

### SAVE AND TRY

```bash
python -c "
from src.utils.task_utils import is_valid_task_title
is_valid_task_title.cache_clear()         # start fresh

print(is_valid_task_title('Write tests')) # miss — computed
print(is_valid_task_title('Write tests')) # hit — cached
print(is_valid_task_title(''))            # miss — computed (empty, invalid)

info = is_valid_task_title.cache_info()
print(f'hits={info.hits}, misses={info.misses}')
"
```

**You should see:**
```
True
True
False
hits=1, misses=2
```

Now add the grouping and counting utilities:

```python
def group_by_priority(tasks: list[Task]) -> dict[str, list[Task]]:   # ← add this
    """Groups tasks by priority using defaultdict — no manual key checks."""
    result: dict[str, list[Task]] = defaultdict(list)
    for task in tasks:
        result[task.priority].append(task)
    return dict(result)   # convert to plain dict for clean return type


def priority_counts(tasks: list[Task]) -> Counter:                    # ← add this
    """Counts tasks per priority level."""
    return Counter(t.priority for t in tasks)


class CommandHistory:                                                  # ← add this
    """Bounded history of commands — newest first, auto-evicts oldest."""

    def __init__(self, maxlen: int = 100) -> None:
        self._history: deque[str] = deque(maxlen=maxlen)

    def add(self, command: str) -> None:
        self._history.appendleft(command)   # newest goes to the front

    def recent(self, n: int) -> list[str]:
        return list(self._history)[:n]      # n most recent

    def clear(self) -> None:
        self._history.clear()

    def __len__(self) -> int:
        return len(self._history)
```

### SAVE AND TRY

```bash
python -c "
from src.domain.task      import Task
from src.utils.task_utils import group_by_priority, priority_counts, CommandHistory

tasks = [
    Task('A', 'high'), Task('B', 'high'), Task('C', 'low'), Task('D', 'medium'),
]

groups = group_by_priority(tasks)
print('high count:', len(groups['high']))   # 2
print('low count:',  len(groups['low']))    # 1

counts = priority_counts(tasks)
print(counts.most_common(1))               # [('high', 2)]

h = CommandHistory(maxlen=3)
h.add('create task A')
h.add('complete task B')
h.add('delete task C')
h.add('create task D')   # 'create task A' is dropped (maxlen=3)
print(len(h))            # 3
print(h.recent(2))       # 2 most recent
"
```

**You should see:**
```
high count: 2
low count: 1
[('high', 2)]
3
['create task D', 'complete task B']
```

---

## Step 3 — Write the Tests

Create `tests/test_task_utils.py`:

```python
# tests/test_task_utils.py
import pytest
from collections import Counter
from src.domain.task      import Task
from src.utils.task_utils import (
    is_valid_task_title, group_by_priority, priority_counts, CommandHistory,
)


class TestIsValidTaskTitle:

    def setup_method(self) -> None:
        is_valid_task_title.cache_clear()   # fresh cache for each test

    def test_accepts_valid_title(self) -> None:
        assert is_valid_task_title('Write tests') is True

    def test_rejects_empty_title(self) -> None:
        assert is_valid_task_title('') is False

    def test_rejects_single_character(self) -> None:
        assert is_valid_task_title('A') is False   # less than 2 chars

    def test_caches_repeated_calls(self) -> None:
        is_valid_task_title('Write tests')  # miss
        is_valid_task_title('Write tests')  # hit
        info = is_valid_task_title.cache_info()
        assert info.hits   == 1
        assert info.misses == 1


class TestGroupByPriority:

    def test_groups_tasks_by_priority(self) -> None:
        tasks  = [Task('A', 'high'), Task('B', 'low'), Task('C', 'high')]
        groups = group_by_priority(tasks)
        assert len(groups['high']) == 2
        assert len(groups['low'])  == 1

    def test_returns_empty_for_priorities_with_no_tasks(self) -> None:
        tasks  = [Task('A', 'high')]
        groups = group_by_priority(tasks)
        assert 'low' not in groups   # no 'low' tasks — key not present


class TestPriorityCounts:

    def test_counts_each_priority_correctly(self) -> None:
        tasks  = [Task('A', 'high'), Task('B', 'high'), Task('C', 'low')]
        counts = priority_counts(tasks)
        assert counts['high'] == 2
        assert counts['low']  == 1

    def test_most_common_returns_top_priority(self) -> None:
        tasks  = [Task(f'T{i}', 'high') for i in range(5)]
        tasks += [Task(f'L{i}', 'low')  for i in range(2)]
        counts = priority_counts(tasks)
        assert counts.most_common(1)[0][0] == 'high'   # 'high' is most common


class TestCommandHistory:

    def test_add_and_retrieve_recent(self) -> None:
        h = CommandHistory()
        h.add('create task')
        h.add('delete task')
        assert h.recent(1) == ['delete task']   # newest first

    def test_recent_capped_at_n(self) -> None:
        h = CommandHistory()
        for i in range(10):
            h.add(f'cmd {i}')
        assert len(h.recent(3)) == 3

    def test_bounded_by_maxlen(self) -> None:
        h = CommandHistory(maxlen=3)
        for i in range(5):
            h.add(f'cmd {i}')
        assert len(h) == 3   # oldest two dropped automatically

    def test_clear_empties_history(self) -> None:
        h = CommandHistory()
        h.add('cmd')
        h.clear()
        assert len(h) == 0
```

### SAVE AND TRY

```bash
pytest tests/test_task_utils.py -v
```

**You should see:**
```
tests/test_task_utils.py::TestIsValidTaskTitle::test_accepts_valid_title PASSED
...
tests/test_task_utils.py::TestCommandHistory::test_clear_empties_history PASSED

12 passed
```

---

## 🎯 Challenge: Build a `TaskFrequencyTracker`

**You know:** `Counter`, `defaultdict`, `deque`.

**Task:** Build a `TaskFrequencyTracker` that records task completion events:

```python
tracker = TaskFrequencyTracker()
tracker.record_completion('t-1', assignee='alice')
tracker.record_completion('t-2', assignee='alice')
tracker.record_completion('t-3', assignee='bob')

tracker.top_assignees(2)           # [('alice', 2), ('bob', 1)]
tracker.completions_by_assignee    # {'alice': ['t-1', 't-2'], 'bob': ['t-3']}
tracker.recent_completions(2)      # ['t-3', 't-2'] — newest first
```

Write 4 tests before implementing.

---

<details>
<summary>▶ Show Solution</summary>

```python
class TaskFrequencyTracker:
    def __init__(self) -> None:
        self._assignee_counts: Counter            = Counter()
        self._assignee_tasks:  dict[str, list]   = defaultdict(list)
        self._recent:          deque[str]         = deque(maxlen=200)

    def record_completion(self, task_id: str, assignee: str) -> None:
        self._assignee_counts[assignee] += 1
        self._assignee_tasks[assignee].append(task_id)
        self._recent.appendleft(task_id)   # newest first

    def top_assignees(self, n: int) -> list[tuple[str, int]]:
        return self._assignee_counts.most_common(n)

    @property
    def completions_by_assignee(self) -> dict[str, list[str]]:
        return dict(self._assignee_tasks)

    def recent_completions(self, n: int) -> list[str]:
        return list(self._recent)[:n]
```

**Tests:**
```python
def test_top_assignees_sorted_by_count() -> None:
    t = TaskFrequencyTracker()
    t.record_completion('t-1', 'alice')
    t.record_completion('t-2', 'alice')
    t.record_completion('t-3', 'bob')
    assert t.top_assignees(1) == [('alice', 2)]

def test_completions_by_assignee_groups_task_ids() -> None:
    t = TaskFrequencyTracker()
    t.record_completion('t-1', 'alice')
    t.record_completion('t-2', 'alice')
    assert t.completions_by_assignee['alice'] == ['t-1', 't-2']

def test_recent_completions_newest_first() -> None:
    t = TaskFrequencyTracker()
    t.record_completion('t-1', 'alice')
    t.record_completion('t-2', 'bob')
    assert t.recent_completions(2)[0] == 't-2'   # most recent first

def test_empty_tracker_returns_no_top_assignees() -> None:
    assert TaskFrequencyTracker().top_assignees(5) == []
```

</details>

---

## Final Check

| Tool | Use case | Key advantage |
|---|---|---|
| `partial` | Pre-fill function arguments | No wrapper lambda needed |
| `lru_cache` | Repeated calls with same args | O(1) after first call |
| `chain` | Iterate multiple sequences as one | No new list allocated |
| `defaultdict(list)` | Group items by key | No `if key not in d:` check |
| `Counter` | Count occurrences | `most_common(n)` built-in |
| `deque(maxlen=N)` | Bounded history | O(1) append/pop both ends |

---

## Quick Check Answers

**1. Same function, same arguments, 1,000 times. Specific module and decorator?**

`functools.lru_cache`. Apply `@lru_cache(maxsize=N)` to the function. The first call
computes and caches the result. All 999 subsequent calls with identical arguments
return the cached result in O(1) without executing the function body.

**2. `defaultdict(list)` vs `{}.setdefault(key, [])` — one concrete difference?**

With `defaultdict(list)`, accessing a missing key (`d['missing_key']`) automatically
creates an empty list for that key. You write `d['key'].append(item)` without any
check. With `{}.setdefault(key, [])`, you must call `setdefault` explicitly before
every operation: `d.setdefault('key', []).append(item)`. The `defaultdict` auto-creates
on access; the plain dict requires an explicit creation call.

**3. Five task lists to iterate as one without a combined list — which function?**

`itertools.chain(list1, list2, list3, list4, list5)`. Returns a lazy iterator that
yields from each list in turn. No new list is created, no data is copied.
`chain.from_iterable([list1, list2, ...])` handles a list of lists.
