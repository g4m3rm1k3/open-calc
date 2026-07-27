# Lesson 38: Watching Something You Can Only Poll

## What you will build

A clipboard history manager: a structure that keeps a deduplicated,
most-recent-first list of everything copied, and a watcher loop that
polls the system clipboard for changes and feeds new content into that
structure. The transferable problem this lesson is actually about: the
clipboard has no equivalent of Lesson 14's directory watcher or Lesson
30's server push — no operating system notifies a program the instant
something is copied. The only option is **polling**: repeatedly asking
"has this changed?" — and that has real, honest consequences for both
correctness (what counts as "changed"?) and cost (how often is it okay
to ask?).

## What you need to know first

- **Lesson 33** — the repeating-loop shape (`run_every_n_seconds`) this
  lesson's watcher echoes, though not reused directly since polling for
  a *change*, rather than running a fixed task, needs slightly different
  logic.
- **Lesson 14** — the directory watcher this lesson is deliberately
  contrasted against: that lesson could rely on the operating system
  telling it about changes; today's lesson cannot, and the difference is
  worth understanding directly rather than glossed over.
- **Lesson 35** — `pip` and virtual environments, reused for installing
  the real clipboard-access library this lesson uses (and, honestly,
  can't fully run in this environment — explained directly below).

---

## The Problem, in prose, no code yet

Lesson 14's directory watcher worked because the operating system is
willing to tell a program, directly, the instant a file changes — that's
a real OS feature (`inotify` on Linux, and similar mechanisms elsewhere)
built for exactly that purpose. The system clipboard offers no
equivalent: there is no "clipboard changed" event a Python program can
subscribe to. The only way to know the clipboard's content is to ask for
it, right now, and the only way to know if it *changed* is to ask
repeatedly and compare each answer to the last one. That's polling, and
it raises two real questions this lesson answers directly: what exactly
counts as "the same thing copied again" (should copying "apple," then
"banana," then "apple" again count as one entry or two?), and how does a
watcher actually read the real, OS-level clipboard from Python at all?

---

## Concept Unit: Naive Deduplication Only Catches Neighbors

### The Problem

A history that just appends every new clipboard value would fill up with
long runs of the same value repeated — copying the same URL five times in
a row shouldn't produce five identical history entries. The obvious fix,
skip appending if the new value equals the *last* one, is worth testing
directly before trusting it, because "the last one" is a narrower
condition than it sounds.

### Introduce the concept in isolation

```python
def add_naive(history_list, new_item, max_size):
    if not history_list or history_list[-1] != new_item:
        history_list.append(new_item)
    while len(history_list) > max_size:
        history_list.pop(0)
    return history_list

history = []
for item in ["apple", "apple", "banana", "apple", "banana", "banana"]:
    add_naive(history, item, max_size=10)
    print(f"after copying {item!r}: {history}")
```

Run it:

```
after copying 'apple': ['apple']
after copying 'apple': ['apple']
after copying 'banana': ['apple', 'banana']
after copying 'apple': ['apple', 'banana', 'apple']
after copying 'banana': ['apple', 'banana', 'apple', 'banana']
after copying 'banana': ['apple', 'banana', 'apple', 'banana']
```

What this proves: the two consecutive `'apple'` copies at the start were
correctly collapsed into one entry — `history_list[-1] != new_item`
correctly caught that immediate repeat. But `'apple'` shows up *again*,
as a second, separate entry, after `'banana'` was copied in between — a
real clipboard history where re-copying something you copied five
minutes ago creates a duplicate rather than just moving it back to the
top, which is not what a "history" of unique recent items should do.

This lab is deleted now; it never appears in the project. What survives
is the gap it exposes: only checking the *last* entry catches accidental
immediate repeats, but not genuine re-use of something copied earlier.

### CS Lens

This is the difference between **local** deduplication (comparing only
against the immediately preceding element) and **global** deduplication
(comparing against everything already present) — the same distinction
that separates a simple run-length check from an actual set-membership
check.

Also recognized in: shell history (most shells only skip a command from
history if it's identical to the *immediately previous* command, for
exactly this local-only reason — a deliberate, named design choice, not
an oversight), log deduplication tools that collapse repeated
consecutive log lines but not ones separated by other output.

### SE Lens

Local-only deduplication is cheaper — one comparison, no matter how large
the history — while global deduplication needs to check the new item
against every existing entry (or maintain a separate lookup structure to
avoid that cost, which is exactly what Track 10's upcoming hash table
lesson solves generally). For a clipboard history's realistic size (tens
of entries, not millions), the cost difference is irrelevant, so this
lesson chooses correctness — global deduplication — without needing to
worry about the performance tradeoff a much larger history might force.

---

## Concept Unit: A History That Moves Items, Not Just Appends Them

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** new file, `clipboard_history.py`.
- **Change type:** add.
- **Dependencies:** none.

### The New Code

```python
class ClipboardHistory:
    def __init__(self, max_size=20):
        self.max_size = max_size
        self.entries = []

    def add(self, item):
        if not item:
            return
        if item in self.entries:
            self.entries.remove(item)
        self.entries.append(item)
        while len(self.entries) > self.max_size:
            self.entries.pop(0)

    def most_recent_first(self):
        return list(reversed(self.entries))
```

### The Updated Project

A new, freestanding class with nothing surrounding it yet.

### Mechanical Walkthrough

- `if not item: return` — reused truthiness check (an empty string or
  `None` is treated as "nothing was actually copied," so it's ignored
  rather than stored).
- `if item in self.entries: self.entries.remove(item)` — the fix for the
  gap the previous unit exposed: **first appearance of checking
  membership against the *entire* collection**, not just the last
  element. If the new item already exists anywhere in the history, its
  old position is removed first.
- `self.entries.append(item)` — the item is then appended fresh, at the
  end — meaning a re-copied item always ends up in the *most recent*
  position, whether it's brand new or was already present somewhere
  earlier in the list.
- `while len(self.entries) > self.max_size: self.entries.pop(0)` — reused
  from Lesson 68's queue-adjacent logic; caps the history at a fixed
  size by discarding the oldest (least-recently-used) entries first once
  the limit is exceeded.
- `most_recent_first` — `self.entries` stores oldest-first internally
  (new items go on the end); `list(reversed(...))` (reused built-in)
  presents them in the order a person actually wants to see a history:
  newest first.

### Run it

The exact same input sequence as the naive lab above:

```python
history = ClipboardHistory(max_size=10)
for item in ["apple", "apple", "banana", "apple", "banana", "banana"]:
    history.add(item)
    print(f"after copying {item!r}: {history.entries}")
```

```
after copying 'apple': ['apple']
after copying 'apple': ['apple']
after copying 'banana': ['apple', 'banana']
after copying 'apple': ['banana', 'apple']
after copying 'banana': ['apple', 'banana']
after copying 'banana': ['apple', 'banana']
```

Compare directly against the naive version's final state —
`['apple', 'banana', 'apple', 'banana']`, four entries with a duplicate —
against this version's final state, `['apple', 'banana']`: exactly two
entries, no duplicates, `'apple'` correctly repositioned to the end
(most recent) the second time it was copied.

Confirming the size cap separately, with a smaller limit:

```python
history = ClipboardHistory(max_size=3)
for item in ["one", "two", "three", "four", "five"]:
    history.add(item)
    print(f"after {item!r}: {history.entries}")
```

```
after 'one': ['one']
after 'two': ['one', 'two']
after 'three': ['one', 'two', 'three']
after 'four': ['two', 'three', 'four']
after 'five': ['three', 'four', 'five']
```

`'one'` is correctly evicted the moment a fourth distinct item arrives,
and the history never exceeds 3 entries at any point.

### CS Lens

This is exactly an **LRU (Least Recently Used) cache**'s core behavior —
Track 10's Lesson 72, not yet built, gives this pattern its own dedicated
lesson and a more efficient implementation; this lesson's list-based
version is the same idea, at a scale (tens of entries) where the
`O(n)` cost of `in` and `.remove()` on a plain list is genuinely
irrelevant, named honestly here rather than silently optimized away.

Also recognized in: browser history's own "most recently visited"
ordering, an IDE's "recent files" menu, a phone's recent-apps switcher —
every one of them exhibiting the identical "re-using something moves it
to the front, it doesn't duplicate it" behavior this unit just built and
verified.

### SE Lens

This is a direct preview, worth naming honestly rather than treating as
a coincidence: Lesson 32's rate limiter ended with "what's next" pointing
at exactly this gap (an unbounded `client_buckets` dictionary with no
eviction), and this lesson's `ClipboardHistory` is a small, real instance
of the fix that problem needs — a bounded structure that evicts its
oldest entry once full. The same `max_size` + `pop(0)` shape would work
there too, once the deeper concept (why a list is the wrong underlying
structure at real scale) gets its own full treatment in Track 10.

---

## Concept Unit: Polling Without Real Clipboard Access, on Purpose

### The Problem

Testing a clipboard watcher against the *real* clipboard would make this
lesson's own automated verification depend on whatever happens to be on
this specific machine's clipboard at the moment it runs — not
reproducible, and not really testing the watcher's own logic at all.
The watcher's logic (poll, compare, store if changed) has nothing to do
with *how* the clipboard is actually read — which is exactly the seam to
split it at.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** new file, `watcher.py`.
- **Change type:** add.
- **Dependencies:** `ClipboardHistory`, from the previous unit.

### The New Code

```python
import time
from clipboard_history import ClipboardHistory


def watch_clipboard(read_clipboard, history, poll_count, poll_interval_seconds=0.5):
    last_seen_value = None
    for poll_number in range(1, poll_count + 1):
        current_value = read_clipboard()
        if current_value != last_seen_value:
            history.add(current_value)
            print(f"poll {poll_number}: new clipboard content {current_value!r}")
            last_seen_value = current_value
        else:
            print(f"poll {poll_number}: unchanged")
        time.sleep(poll_interval_seconds)
    return history
```

### Mechanical Walkthrough

- `read_clipboard` as a parameter — a **hard concept reappearing**: the
  same higher-order-function pattern Lesson 33's `task_function` and
  Lesson 35's `rename_function` already established. `watch_clipboard`
  contains no knowledge at all of *how* the clipboard is actually read —
  it only knows how to call whatever zero-argument function it's handed
  and expect a string (or `None`) back.
- `last_seen_value = None` then `if current_value != last_seen_value:` —
  reused comparison; this is the poll-and-compare mechanism itself, and
  it's deliberately comparing against *only* the previous poll's value,
  not the whole history — `history.add()` is what handles the
  global-deduplication concern from the earlier unit; this comparison's
  only job is deciding whether anything changed *since last time*, which
  is a genuinely different, narrower question.
- `time.sleep(poll_interval_seconds)` — a **hard concept reappearing**
  from Lesson 33; unlike that lesson's drift-corrected scheduling, this
  loop doesn't need fixed-point scheduling at all, since "poll roughly
  every half second" has no requirement to land on exact absolute times
  the way a report generator or a cron-like job would.

### Run it

Using a fake `read_clipboard` function — a small queue of pre-scripted
values, popped one at a time — standing in for a real OS clipboard so
this test is fully reproducible:

```python
fake_clipboard_over_time = [
    "https://example.com/first-link",
    "https://example.com/first-link",
    "192.168.1.1",
    "192.168.1.1",
    "192.168.1.1",
    "https://example.com/first-link",
    "a one-time password: 481922",
]

def fake_read_clipboard():
    return fake_clipboard_over_time.pop(0) if fake_clipboard_over_time else None

history = ClipboardHistory(max_size=20)
watch_clipboard(fake_read_clipboard, history, poll_count=7, poll_interval_seconds=0.01)
print("history, most recent first:", history.most_recent_first())
```

```
poll 1: new clipboard content 'https://example.com/first-link'
poll 2: unchanged
poll 3: new clipboard content '192.168.1.1'
poll 4: unchanged
poll 5: unchanged
poll 6: new clipboard content 'https://example.com/first-link'
poll 7: new clipboard content 'a one-time password: 481922'

history, most recent first: ['a one-time password: 481922', 'https://example.com/first-link', '192.168.1.1']
```

Poll 6 correctly registers as "new" even though `'https://example.com/first-link'`
had already appeared at poll 1 — it's new relative to poll 5's value
(`'192.168.1.1'`), which is exactly what `watch_clipboard`'s narrower
"did it change since last poll" question is supposed to catch, distinct
from (and complementary to) `ClipboardHistory`'s own broader "have I ever
seen this" deduplication, which correctly moved that same URL back to
the most-recent position rather than creating a duplicate entry.

### CS Lens

This is **dependency injection**: the thing being tested (`watch_clipboard`)
receives its dependency (a way to read the clipboard) as a parameter,
rather than reaching out and calling a real, fixed clipboard-access
function internally. This is what makes deterministic, repeatable testing
of polling logic possible at all, for anything the loop depends on that
isn't fully under the test's control.

Also recognized in: passing a fake database connection into code under
test, injecting a fake system clock into time-dependent logic, any unit
test that substitutes a real external service with a small, predictable
stand-in.

### SE Lens

Without this seam, testing `watch_clipboard` would require either a real
display server and real clipboard access during every test run (slow,
environment-dependent, and — as the next unit shows directly — not even
available in every environment this code might run in) or no automated
test at all. Splitting "how to read the clipboard" out as a parameter
means the polling logic itself — the part with actual decisions to get
right — can be fully verified with zero dependency on the real OS
clipboard, exactly as just demonstrated.

---

## Concept Unit: The Real Clipboard, and Its Honest Limits Here

### The Problem

`watch_clipboard` needs a real `read_clipboard` function to be useful
outside of tests. Reading the actual system clipboard from Python isn't
something the standard library does at all — it's fundamentally an
operating-system-specific operation (Windows, macOS, and Linux each
expose clipboard access through completely different underlying
mechanisms), which is exactly the kind of cross-platform variation a
third-party package exists to paper over.

### Commands needed

```
$ python3 -m venv .venv
$ .venv/bin/pip install --quiet pyperclip
$ .venv/bin/python3 -c "import pyperclip; pyperclip.copy('test')"
```

`pyperclip` (**first appearance**) is a small, widely-used package
whose entire job is exposing one consistent `copy(text)` /
`paste() -> text` interface, while internally using whatever mechanism
each operating system actually requires — the Windows clipboard API on
Windows, `pbcopy`/`pbpaste` (macOS's own built-in command-line clipboard
tools) on macOS, and, on Linux, an external command-line tool — `xclip`
or `xsel` on X11, `wl-clipboard` on Wayland — because Linux's clipboard is
itself a feature of whichever graphical display server is running, not
something the OS kernel or Python itself has any built-in access to at
all.

### Run it — the real, honest result in this environment

```
$ .venv/bin/python3 -c "import pyperclip; pyperclip.copy('test')"
PyperclipException: Pyperclip could not find a copy/paste mechanism for your system.
On Linux, you can run `sudo apt-get install xclip` ...
```

Following that message's own advice:

```
$ apt-get install -y xclip
$ .venv/bin/python3 -c "import pyperclip; pyperclip.copy('test')"
PyperclipException: Pyperclip could not find a copy/paste mechanism for your system.
```

The exact same error, even with `xclip` now genuinely installed and on
`PATH`. Running `xclip` directly, bypassing `pyperclip` entirely, shows
why:

```
$ xclip -selection clipboard -o
Error: Can't open display: (null)
```

This environment — a headless container, exactly like the one this
entire curriculum has been running inside — has no graphical display
server running at all, X11 or otherwise. `xclip` itself is genuinely
installed and genuinely runnable, but it depends on a running display
server to talk to, and there isn't one here; `pyperclip`'s own detection
logic runs `xclip` as a quick check, sees it fail (for this deeper
reason), and reports it as "no mechanism found" — a slightly misleading
top-level message caused by a real, honestly-explained chain of missing
dependencies, not a bug in `pyperclip` or in this lesson's code.

### CS Lens

This is a **layered dependency failure**: `watch_clipboard` depends on
`pyperclip`, which depends on `xclip`, which depends on a running X11
display server — and the failure surfaces at the topmost layer with a
message that doesn't immediately reveal which layer actually failed,
which is exactly why this unit traced the chain downward by hand, one
layer at a time, rather than stopping at the first error message.

Also recognized in: any "it works on my machine" bug report, where a
library's own error message names itself as the problem when the real
cause is two or three dependencies further down; Docker container image
debugging, where a missing system library often surfaces first as a
confusing failure in the application layer built on top of it.

### SE Lens

On a real desktop or laptop — anywhere with an actual display session
running — this exact same code (`pyperclip.copy()`/`pyperclip.paste()`)
works with no changes at all; the failure demonstrated here is entirely a
property of this specific sandboxed, headless environment, not of the
code. This is the same honest limitation Lesson 34 named for its
Windows Task Scheduler half: the correct implementation is shown in full,
verified as far as this environment allows (`xclip` genuinely installed,
genuinely reachable, genuinely failing for a real and explained reason),
and the parts that need a real desktop session are documented rather
than faked.

---

## Connect the pieces

One real copy action, traced through every piece built today, on a
machine where `pyperclip` *can* actually reach a clipboard: a person
copies a URL. `watch_clipboard`'s next poll calls `read_clipboard()` —
which, wired to `pyperclip.paste`, returns that URL. It differs from
`last_seen_value`, so `history.add(url)` runs. `ClipboardHistory.add`
checks whether that URL already exists anywhere in `self.entries` — if
it was copied before, its old position is removed first — appends it at
the end, and evicts the oldest entry if the history is now over
`max_size`. `most_recent_first()` presents the result in the order a
person actually wants to browse their history: newest first, no
duplicates, no matter how far back or how many times any single item was
copied before.

## What breaks without this

Swap `ClipboardHistory.add`'s `if item in self.entries: self.entries.remove(item)`
back out, reverting to the naive, local-only dedup from the very first
unit, and rerun the exact same six-item sequence:

```
after copying 'apple': ['apple']
after copying 'apple': ['apple']
after copying 'banana': ['apple', 'banana']
after copying 'apple': ['apple', 'banana', 'apple']
after copying 'banana': ['apple', 'banana', 'apple', 'banana']
after copying 'banana': ['apple', 'banana', 'apple', 'banana']
```

`'apple'` and `'banana'` each appear twice — a "history" that's supposed
to show unique recent items instead shows a growing, duplicate-laden
list, and a person browsing it sees the same thing they copied minutes
apart listed as if it were two different items. Restoring the
global-membership check collapses this back to exactly two, correctly
reordered, entries.

## Definition of done

- [ ] `ClipboardHistory.add`, given the same six-item sequence used
      throughout this lesson, produces the two-entry, correctly-reordered
      result shown above — not the four-entry naive result.
- [ ] `ClipboardHistory`'s size cap evicts the oldest entry correctly
      when a new, distinct item arrives after the cap is reached.
- [ ] `watch_clipboard`, given a scripted fake `read_clipboard` function,
      correctly reports "unchanged" for repeated consecutive values and
      "new clipboard content" only when the value actually differs from
      the previous poll.
- [ ] You can explain, without looking back at this lesson, why
      `watch_clipboard`'s own change-detection and `ClipboardHistory`'s
      deduplication are two different, complementary checks rather than
      one.
- [ ] You can explain the real three-layer failure chain
      (`pyperclip` → `xclip` → no display server) this lesson's own
      environment actually hit, in order.
- [ ] Commit with a message explaining why, not just what:

  ```
  git add clipboard_history.py watcher.py
  git commit -m "Add clipboard history with move-to-front dedup and a pollable watcher with clipboard access injected as a function, so the polling logic is fully testable without a real display server"
  ```

## What's next

`ClipboardHistory`'s list-based `in`/`.remove()` approach is `O(n)` per
copy — fine at the tens-of-entries scale a clipboard history actually
needs, but exactly the cost Track 10's Lesson 70 (hash tables) and Lesson
72 (a proper LRU cache) exist to eliminate at real scale, using the same
"move to most-recent, evict the oldest" behavior this lesson already
built by hand. Lesson 39's keyboard macro recorder is a natural
next-door problem: also polling for OS-level events with no built-in
"notify me" mechanism, this time keyboard input instead of clipboard
content.
