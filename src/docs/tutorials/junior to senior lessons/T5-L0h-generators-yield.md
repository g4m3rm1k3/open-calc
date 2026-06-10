# Junior to Senior — T5·L0h — Generators and `yield`

**Prerequisites:** T5·L0g (Enums). You have the domain enums. This lesson covers
generators — the Python feature that produces values one at a time instead of all
at once, enabling memory-efficient data processing for large files and streams.

**What this lab adds:**
- `yield` turns a function into a generator — execution pauses at each `yield` and resumes on `next()`
- `StopIteration` — raised when a generator is exhausted
- Generator expressions: `(x for x in items if cond)` — lazy list comprehensions
- `yield from` — delegating to another iterable without a loop
- Memory efficiency: a generator that yields 1 billion items uses O(1) memory

**Time:** 45–60 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. `gen = count_to_three()`. The function body has NOT run yet. What does calling
>    `count_to_three()` return?
> 2. `[x*2 for x in range(10_000_000)]` vs `(x*2 for x in range(10_000_000))`.
>    Which one creates 10 million items in memory right now?
> 3. A generator is exhausted. You call `next(gen)`. What happens?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

A lazy task processing pipeline — each stage transforms data without materialising
a full list:

```
raw_data  →  parse_task_dicts()  →  filter_active()  →  generate_report_lines()
                   ↓                       ↓                       ↓
           yields one Task       yields only active       yields one line
           at a time             tasks                    at a time
```

No stage loads ALL data into memory — each yields one item, processes the next, yields.

---

### Concept: What a Generator Is

**What it is:** A generator is a function with `yield`. Calling such a function
does NOT run it — instead, it returns a generator object (a paused execution context).
Each call to `next()` on that object runs the function until the next `yield`,
then pauses again.

**The problem before:**

```python
def load_all_tasks_from_csv(filename: str) -> list[Task]:
    tasks = []
    with open(filename) as f:
        for line in f:
            tasks.append(parse_task(line))   # ALL tasks loaded before ANY processing
    return tasks   # if the file has 10 million tasks: 10M objects in memory simultaneously

all_tasks = load_all_tasks_from_csv('tasks.csv')   # waits for ALL tasks
for task in all_tasks:                             # THEN iterates
    process(task)
```

For a 1GB file, this loads 1GB into memory before any task can be processed.

**The solution:**

```python
def load_tasks_from_csv(filename: str):
    with open(filename) as f:
        for line in f:
            yield parse_task(line)   # yield ONE task, then pause

for task in load_tasks_from_csv('tasks.csv'):   # starts processing immediately
    process(task)   # task is available as soon as the FIRST line is parsed
                    # only ONE task in memory at a time — O(1) memory
```

**What it hides:** The iterator protocol. When Python executes `yield value`, it:
1. Saves the function's entire execution state (local variables, current line)
2. Returns `value` to the caller
3. On the next `next()` call, restores that state and resumes from after the `yield`

You do not write any of this state management — `yield` handles it.

**Canonical example:** A librarian handing you books one at a time from a vast archive.
A list would require the librarian to carry ALL books to you at once. A generator
sends one book, waits for you to read it and ask for the next, then fetches the next.

**Project application:** Loading tasks from a CSV or database returns a generator —
the FastAPI endpoint can start streaming results immediately, before all are loaded.

**Smallest possible example:**

```python
def count_to_three():
    print('starting')
    yield 1              # pause here, return 1
    print('continuing')
    yield 2              # pause here, return 2
    print('finishing')
    yield 3              # pause here, return 3
    print('done')

gen = count_to_three()   # NOTHING runs yet — no output
print(next(gen))         # → prints 'starting', returns 1
print(next(gen))         # → prints 'continuing', returns 2
print(next(gen))         # → prints 'finishing', returns 3
print(next(gen))         # → prints 'done', raises StopIteration
```

**You will see this again in:**
- Python's built-in `range()` is a lazy sequence (not a generator, but same principle)
- `open(filename)` iteration: reads one line at a time from disk
- Django: `QuerySet.iterator()` fetches database rows lazily
- `itertools` module: all functions return lazy generators

**Watch for:** A generator can only be iterated ONCE. After `StopIteration`, calling
`next()` again still raises `StopIteration` — the generator is exhausted. If you need
to iterate twice, either create a new generator or convert to a list first:
`tasks = list(load_tasks_from_csv('tasks.csv'))`.

---

## Step 1 — See the Generator Behaviour

```bash
python -c "
def count(n):
    print(f'generator started, n={n}')
    for i in range(n):
        print(f'  about to yield {i}')
        yield i
        print(f'  resumed after yielding {i}')
    print('generator finished')

gen = count(3)
print('generator created — nothing ran yet')
print('calling next...')
print('got:', next(gen))
print('calling next again...')
print('got:', next(gen))
"
```

**You should see:**
```
generator created — nothing ran yet
calling next...
generator started, n=3
  about to yield 0
got: 0
calling next again...
  resumed after yielding 0
  about to yield 1
got: 1
```

This shows the pause-resume behaviour. The function body runs up to `yield`, then
pauses. On the next `next()` call, it resumes from after the `yield`.

---

### Concept: Generator Expressions

**What it is:** `(expression for item in iterable if condition)` is the lazy equivalent
of a list comprehension. No values are computed until the expression is consumed.

**The problem before:**

```python
active_titles = [t.title for t in tasks if t.status == 'active']
# Creates a new list with ALL matching titles in memory.
# If tasks has 1 million items, this allocates memory for ~1M strings.

total_chars = sum(active_titles)   # then iterates this list
# Two full iterations, one of them storing the entire result.
```

**The solution:**

```python
active_titles = (t.title for t in tasks if t.status == 'active')
# NO computation yet — this is a generator expression.

total = sum(len(title) for title in active_titles)
# Computed lazily — titles are computed and consumed one at a time.
# Memory used: O(1) — one title in memory at a time.
```

**What it hides:** The iteration state. The generator expression holds a reference
to `tasks` and the current position — not the computed values. Memory grows with the
generator, not with the results.

**The `()` vs `[]` rule:**
- `[x for x in items]` — list comprehension — eager, returns a list, all values in memory
- `(x for x in items)` — generator expression — lazy, returns a generator, O(1) memory

**Canonical example:** A water filter running tap water through (lazy) vs filling
a bucket with all the water first, then filtering (eager). For large volumes, lazy is far more efficient.

**Project application:** `any(t.is_overdue() for t in task_list)` — stops at the first
overdue task, never computing the rest. `sum(1 for t in task_list if t.done)` — counts
done tasks without creating an intermediate list.

**Smallest possible example:**

```python
# Lazy — computes one at a time, stops early:
numbers = (x**2 for x in range(10_000_000))  # O(1) memory
first_5 = [next(numbers) for _ in range(5)]  # [0, 1, 4, 9, 16]

# Very useful with built-ins:
any(x > 5 for x in [1, 2, 6, 7])   # True — stops at 6, never checks 7
all(x > 0 for x in [1, 2, 3, -1])  # False — stops at -1
```

**You will see this again in:**
- `any()`, `all()`, `sum()`, `max()`, `min()` all accept generator expressions — no list needed
- Python's `map()` and `filter()` return lazy iterators (same principle as generators)
- DataFrame operations in pandas use lazy evaluation for large datasets

**Watch for:** Generator expressions inside function calls need only ONE set of
parentheses: `sum(x for x in items)` not `sum((x for x in items))`. The outer
function call's parentheses serve as the generator expression's parentheses.

---

## Step 2 — Build the Task Pipeline

Create `src/utils/task_pipeline.py`:

```python
# src/utils/task_pipeline.py
from __future__ import annotations
from typing import Iterator, Iterable
from src.domain.task        import Task
from src.domain.enums       import TaskStatus, Priority
```

### SAVE AND TRY

```bash
python -c "from src.utils.task_pipeline import *; print('imports OK')"
```

Now add `parse_task_dicts` — the first pipeline stage:

```python
# src/utils/task_pipeline.py
from __future__ import annotations
from typing import Iterator, Iterable
from src.domain.task  import Task
from src.domain.enums import TaskStatus, Priority


def parse_task_dicts(records: Iterable[dict]) -> Iterator[Task]:
    """Lazily converts dicts to Task objects, skipping invalid records."""
    for record in records:
        try:
            yield Task.from_dict(record)   # yield ONE task, then pause
        except (ValueError, KeyError):
            continue   # skip invalid records without crashing the pipeline
```

### SAVE AND TRY

```bash
python -c "
from src.utils.task_pipeline import parse_task_dicts
import types

records = [{'title': 'A', 'priority': 'high'}, {'title': ''}, {'title': 'B'}]
gen = parse_task_dicts(records)
print(type(gen).__name__)    # should be 'generator' — lazy
print(next(gen).title)       # 'A' — first valid
print(next(gen).title)       # 'B' — empty title was skipped
"
```

**You should see:**
```
generator
A
B
```

Add `filter_by_priority` — the second stage:

```python
def filter_by_priority(            # ← add this function
    tasks:        Iterable[Task],
    min_priority: Priority,
) -> Iterator[Task]:
    """Lazily yields only tasks at or above the minimum priority."""
    threshold = min_priority.numeric_value
    for task in tasks:
        if task.priority.numeric_value >= threshold:
            yield task
```

### SAVE AND TRY

```bash
python -c "
from src.utils.task_pipeline import parse_task_dicts, filter_by_priority
from src.domain.enums import Priority

records = [
    {'title': 'High task',   'priority': 'high'},
    {'title': 'Medium task', 'priority': 'medium'},
    {'title': 'Low task',    'priority': 'low'},
]

# Compose the pipeline:
tasks    = parse_task_dicts(records)
filtered = filter_by_priority(tasks, Priority.MEDIUM)

for t in filtered:
    print(t.title, t.priority)   # should skip 'low'
"
```

**You should see:**
```
High task high
Medium task medium
```

---

### Concept: `yield from` — Delegating to Another Iterable

**What it is:** `yield from iterable` yields every item from the iterable, one by one.
It is equivalent to `for item in iterable: yield item` — but cleaner and faster.

**The problem before:**

```python
def all_task_titles(projects: list) -> Iterator[str]:
    for project in projects:
        for task in project.tasks:      # nested loop
            yield task.title            # yield from the inner loop
```

**The solution:**

```python
def all_task_titles(projects: list) -> Iterator[str]:
    for project in projects:
        yield from (t.title for t in project.tasks)   # cleaner
```

**Canonical example:** A music playlist that contains other playlists. `yield from playlist`
plays all songs in that sub-playlist before moving to the next item in the outer playlist.
You hear each song once, in order — no batching.

**Project application:** Combining tasks from multiple projects into one flat stream
without creating an intermediate combined list.

**Smallest possible example:**

```python
def flatten(nested: list[list]) -> Iterator:
    for inner in nested:
        yield from inner   # yields all items from inner, then moves to next

list(flatten([[1, 2], [3, 4], [5]]))   # → [1, 2, 3, 4, 5]
```

**You will see this again in:**
- Recursive generators: `yield from traverse(child)` for tree walks
- `itertools.chain(*iterables)` uses `yield from` internally
- Any function that composes multiple generators into a single stream

**Watch for:** `yield from` on a non-iterable raises `TypeError`. It works with
any iterable: lists, generators, strings, dicts, custom iterables.

---

## Step 3 — Add `to_report_lines` and `batch`

```python
def to_report_lines(tasks: Iterable[Task]) -> Iterator[str]:    # ← add this
    """Lazily formats tasks as report lines."""
    for task in tasks:
        status = '✓' if task.done else '○'
        yield f'{status} [{task.priority.upper():<6}] {task.title}'


def batch(iterable: Iterable, size: int) -> Iterator[list]:     # ← add this
    """Groups items into batches of the given size."""
    current: list = []
    for item in iterable:
        current.append(item)
        if len(current) == size:
            yield current
            current = []
    if current:                 # yield any remaining items (last partial batch)
        yield current
```

### SAVE AND TRY

```bash
python -c "
from src.utils.task_pipeline import parse_task_dicts, to_report_lines, batch

records = [
    {'title': 'Write tests', 'priority': 'high'},
    {'title': 'Deploy',      'priority': 'medium'},
    {'title': 'Review PR',   'priority': 'low'},
]

tasks = parse_task_dicts(records)
lines = to_report_lines(tasks)
for line in lines:
    print(line)
"
```

**You should see:**
```
○ [HIGH  ] Write tests
○ [MEDIUM] Deploy
○ [LOW   ] Review PR
```

---

## Step 4 — Write the Tests

Create `tests/test_pipeline.py`:

```python
# tests/test_pipeline.py
import types
import pytest
from src.domain.task  import Task
from src.domain.enums import Priority
from src.utils.task_pipeline import (
    parse_task_dicts, filter_by_priority, to_report_lines, batch,
)


class TestParseTasks:

    def test_parses_valid_records(self) -> None:
        records = [{'title': 'Write tests', 'priority': 'high'}]
        tasks   = list(parse_task_dicts(records))
        assert len(tasks) == 1
        assert tasks[0].title == 'Write tests'

    def test_skips_records_with_empty_title(self) -> None:
        records = [
            {'title': 'Valid task'},
            {'title': ''},          # empty title — ValueError in Task()
            {'title': 'Another'},
        ]
        tasks = list(parse_task_dicts(records))
        assert len(tasks) == 2   # the empty-title record was skipped

    def test_returns_a_generator_not_a_list(self) -> None:
        records = [{'title': 'A'}]
        result  = parse_task_dicts(records)
        assert isinstance(result, types.GeneratorType)

    def test_nothing_runs_until_consumed(self) -> None:
        """Demonstrate that generator body doesn't execute until iterated."""
        side_effects = []

        def records_with_side_effects():
            for i in range(3):
                side_effects.append(i)    # records consumed here
                yield {'title': f'Task {i}'}

        gen = parse_task_dicts(records_with_side_effects())
        assert side_effects == []          # nothing consumed yet
        next(gen)
        assert len(side_effects) == 1      # only first record consumed


class TestFilterByPriority:

    def test_keeps_tasks_at_and_above_threshold(self) -> None:
        tasks = [
            Task('Low',    'low'),
            Task('Medium', 'medium'),
            Task('High',   'high'),
        ]
        result = list(filter_by_priority(tasks, Priority.MEDIUM))
        assert len(result) == 2
        assert all(t.priority.numeric_value >= Priority.MEDIUM.numeric_value for t in result)

    def test_returns_empty_when_nothing_meets_threshold(self) -> None:
        tasks  = [Task('Low', 'low')]
        result = list(filter_by_priority(tasks, Priority.HIGH))
        assert result == []


class TestBatch:

    def test_groups_items_into_batches_of_given_size(self) -> None:
        batches = list(batch(range(7), 3))
        assert batches == [[0, 1, 2], [3, 4, 5], [6]]

    def test_empty_input_gives_no_batches(self) -> None:
        assert list(batch([], 5)) == []

    def test_single_batch_when_fewer_items_than_size(self) -> None:
        assert list(batch([1, 2], 10)) == [[1, 2]]
```

### SAVE AND TRY

```bash
pytest tests/test_pipeline.py -v
```

**You should see:**
```
tests/test_pipeline.py::TestParseTasks::test_parses_valid_records PASSED
...
tests/test_pipeline.py::TestBatch::test_single_batch_when_fewer_items_than_size PASSED

9 passed
```

**Change something:** Replace the generator pipeline with a list pipeline to see memory:

```bash
python -c "
# Generator pipeline — O(1) memory:
import sys
from src.utils.task_pipeline import parse_task_dicts

records = [{'title': f'Task {i}'} for i in range(100_000)]

gen_pipe = parse_task_dicts(records)   # generator — tiny
print('generator object size:', sys.getsizeof(gen_pipe), 'bytes')

list_pipe = list(parse_task_dicts(records))   # materialised list
print('materialised list size:', sys.getsizeof(list_pipe), 'bytes')
"
```

**Expected:** Generator is ~100 bytes. List is much larger.

---

## 🎯 Challenge: Build `deduplicate`

**You know:** Generators, `yield`, memory-efficient iteration.

**Task:** Build `deduplicate(iterable, key=None)` — a generator that yields each
item only once, based on an optional key function:

```python
tasks = [Task('A'), Task('A'), Task('B')]
unique = list(deduplicate(tasks, key=lambda t: t.title))
# → [Task('A'), Task('B')] — first occurrence wins, order preserved
```

Requirements:
- `key=None` uses the item itself for deduplication
- Preserves insertion order (first occurrence)
- Memory: O(n) for the seen set, not O(n) for all items
- Write 3 tests before implementing

---

<details>
<summary>▶ Show Solution</summary>

```python
from typing import Callable, Hashable

def deduplicate(
    iterable: Iterable,
    key: Callable | None = None,
) -> Iterator:
    """Yields each item once. key(item) determines uniqueness."""
    seen: set[Hashable] = set()
    for item in iterable:
        k = key(item) if key is not None else item
        if k not in seen:
            seen.add(k)
            yield item
```

**Tests:**
```python
def test_removes_duplicate_integers() -> None:
    result = list(deduplicate([1, 2, 1, 3, 2]))
    assert result == [1, 2, 3]

def test_deduplicates_by_key_function() -> None:
    items  = [{'n': 'a'}, {'n': 'b'}, {'n': 'a'}]
    result = list(deduplicate(items, key=lambda x: x['n']))
    assert len(result) == 2

def test_preserves_first_occurrence_order() -> None:
    result = list(deduplicate([3, 1, 2, 1, 3]))
    assert result == [3, 1, 2]
```

**Key insight:** `seen` grows with the number of UNIQUE items, not the total items.
For a stream of 1 million items with 100 unique values, `seen` holds only 100 entries.
The generator yields items immediately as they're determined to be unique — no
intermediate list needed.

</details>

---

## Final Check

| Feature | What to verify |
|---|---|
| Generator is lazy | `type(parse_task_dicts([]))` → generator, not list |
| `yield` pauses execution | `nothing_runs_until_consumed` test passes |
| Generator is exhausted after use | `list(gen); list(gen)` → second list is empty |
| Generator expression is lazy | `(x for x in [])` has `type` `generator` |
| `batch` handles remainder | `batch(range(7), 3)` → `[[0,1,2], [3,4,5], [6]]` |
| Pipeline composes | `filter(parse(records), HIGH)` — no intermediate lists |

---

## Quick Check Answers

**1. `gen = count_to_three()`. The body has NOT run yet. What does `count_to_three()` return?**

A generator object — a paused execution context. Calling a generator function creates
the object and returns it immediately, without executing a single line of the function
body. The `print('starting')` inside does not run until `next(gen)` is first called.
This is what makes generators lazy — construction is O(1), computation is deferred.

**2. List comprehension vs generator expression — which allocates 10 million items now?**

The list comprehension `[x*2 for x in range(10_000_000)]` allocates all 10 million
integers immediately and stores them in a list. This uses ~80MB of memory.
The generator expression `(x*2 for x in range(10_000_000))` creates a 200-byte object.
No values are computed until iterated.

**3. Generator exhausted — call `next(gen)`. What happens?**

`StopIteration` is raised. Every time you call `next()` on an exhausted generator,
it immediately raises `StopIteration`. Python's `for` loop catches this exception to
know when to stop iterating — which is why `for x in gen:` terminates correctly.
If you call `next(gen, default)` — two-argument form — you get `default` instead of
the exception.
