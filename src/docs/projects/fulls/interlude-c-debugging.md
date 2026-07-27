# Interlude C: Debugging as a Method

**What you will build**
Nothing new user-facing. You'll deliberately break the project in two different ways — one that crashes loudly, one that fails silently — and practice a repeatable method for finding the cause of each, instead of the "change something and see if it works" approach that got your earlier hacked-together scripts working eventually, at the cost of not knowing why.

**What you need to know first**
Lesson 6 (the full CRUD surface — something to actually break).

**Exemption from the failing-test-first rule:** debugging methodology has no application feature to spec ahead of time — the bug itself, deliberately introduced, is what the method is exercised against.

---

## Concept Unit: Reading a Stack Trace, Bottom to Top

### The Problem

A crash prints a wall of text that looks intimidating and, to someone without a method, looks the same whether the bug is trivial or serious. Most of that text isn't useful to you — most of it is describing code you didn't write. Knowing which part to actually read is the whole skill.

### Introduce a real bug

In `main.py`, deliberately swap the argument order in `update_post`:

```python
# broken on purpose:
conn.execute("UPDATE posts SET content = ? WHERE id = ?", (post_id, update.content))
```

Run the test suite:

```bash
pytest tests/ -x
```

Output (abridged to the parts that matter):

```text
tests/test_api.py:34: in test_update_own_post
    assert response.json()["content"] == "edited"
E   AssertionError: assert 5 == 'edited'
```

*How to read this:* ignore the noise above this line — Python's traceback shows every frame the error passed through, including deep framework internals you didn't write and don't need right now. Read from the **bottom up**, and stop at the first line that names a file *you* wrote (here, `tests/test_api.py`). That line tells you exactly what was expected (`'edited'`) versus what actually happened (`5`) — which is already a huge clue: `5` looks like it could be a post's id, not its content, which points straight at an argument-order mistake without needing to guess randomly.

### Explain the mechanism

A stack trace is, quite literally, the call stack from Interlude A, printed out at the moment of failure — one line per frame, showing which function called which, all the way down to where the actual error occurred. The frames near the top of the traceback are the ones closest to where Python itself detected the problem; the frames near your assertion (often at the bottom, depending on your test runner) are closest to *your* code's intent. For an `AssertionError` like this one, the bottom is exactly where to look, because the assertion is the earliest point where "what we expected" and "what happened" were compared directly.

### Fix it and confirm

```python
conn.execute("UPDATE posts SET content = ? WHERE id = ?", (update.content, post_id))
```

```bash
pytest tests/
```

```text
============================= test session starts ==============================
collected 13 items
tests/test_api.py .............                                          [100%]
============================== 13 passed in 0.12s ===============================
```

### CS Lens

**Stack unwinding.** When an exception is raised deep inside a call chain, each frame gets a chance to handle it before Python gives up and moves to the next frame up — this process is called unwinding the stack. The traceback you read is a record of exactly that unwinding, in order. This is why the traceback contains multiple file names and line numbers, not just one — it's showing you the actual path execution took to reach the failure.

### SE Lens

**A crash with a clear message is a gift, not a problem.** `AssertionError: assert 5 == 'edited'` told you immediately, in one line, that content and id got swapped. Contrast this with the next unit's bug, which won't crash at all — and is much more expensive to find as a result. A loud, specific failure close to the actual mistake is the best-case outcome; the goal of good tests and type checks throughout this curriculum is to convert as many bugs as possible into *that* kind of failure, and as few as possible into the next kind.

---

## Concept Unit: A Silent Bug and the Bisection Method

### The Problem

Not every bug crashes. The most dangerous ones produce output that's simply wrong, with no error at all — exactly like the `alice_scores` aliasing bug in Interlude A. Without a crash to point at a location, you need a method for *finding* where reality diverges from expectation, rather than reading code top to bottom hoping to spot it by eye.

### Introduce a real bug

In `get_feed`, deliberately break the ordering without causing an error:

```python
# broken on purpose: ASC instead of DESC — still valid SQL, wrong result
ORDER BY posts.created_at ASC
```

Run the app and call `/feed` — it returns `200`, valid JSON, the right *shape* of data. Nothing crashes. If your test suite happens to only check that a request succeeds, and not the actual order, this bug ships silently — check `test_feed_returns_posts_newest_first_with_author` from Lesson 5 and confirm it *does* still catch this, because it checked `data[0]["content"]` specifically, not just status code `200`. That specificity is exactly what caught it.

```bash
pytest tests/
```

```text
FAILED tests/test_api.py::test_feed_returns_posts_newest_first_with_author
AssertionError: assert 'first' == 'second'
```

### Explain the method: bisection

When a failure doesn't point at an obvious location (imagine, for a moment, that this test only checked status code, and you had to find the ordering bug by hand): don't read every line hoping to spot the mistake. Instead, **bisect**: pick a point roughly in the middle of the suspect code, check whether the data is already wrong *by that point*, and repeat on whichever half still contains the problem. Concretely here: query the database directly (bypassing the API) to check if `posts.created_at` values themselves are correct — if yes, the bug is in the query/ordering; if the raw data were also wrong, the bug would be further back, in how `created_at` gets written. This halves your search space every time, the same underlying idea as binary search over a sorted list — you're binary-searching over *where in the pipeline* the value went wrong, not over data.

### Fix it and confirm

```python
ORDER BY posts.created_at DESC
```

```bash
pytest tests/
```

```text
============================= test session starts ==============================
collected 13 items
tests/test_api.py .............                                          [100%]
============================== 13 passed in 0.13s ===============================
```

### CS Lens

**Binary search, applied to debugging instead of data.** Binary search works because each check eliminates half the remaining possibilities. Bisection debugging applies the identical idea to "where in this pipeline did things go wrong" — check the midpoint, discard the half that's already confirmed correct, repeat. It's the single most effective general-purpose debugging technique precisely because it scales logarithmically: doubling the size of a pipeline only adds one more check, not twice as many.

### SE Lens

**Form the hypothesis before you change the code.** The instinct when something's wrong is to start editing and re-running to see if it helped — which is exactly the "looks right" pattern that got your earlier hacked-together scripts working without your fully understanding why. The disciplined version: state, in words, what you think is wrong and why, *before* touching code — "I think the ordering is ASC when it should be DESC, because the test shows the oldest post first" — then make exactly the change that tests that specific hypothesis. If it doesn't fix it, you've learned your hypothesis was wrong, which is real information; if you just change things and rerun, a fix that "worked" teaches you nothing about why the original code was broken.

---

## Closing

**Connect the pieces**
Both bugs today were one-line, plausible-looking mistakes — the kind an AI agent could just as easily introduce, and the kind that would pass a quick glance. The crash was found by reading the traceback bottom-up to the frame you own. The silent bug was found by bisecting the pipeline against a hypothesis, not by scanning code hoping to notice it.

**What breaks without this**
Without a specific assertion (`data[0]["content"] == "second"`, not just `status_code == 200`), the ordering bug ships to production undetected — the app "works," every test is green, and users just see their feed subtly, mysteriously out of order.

**Exercises**
1. Deliberately reintroduce the `ASC`/`DESC` bug, then find it again using only `sqlite3` in a Python shell — querying `posts` directly — without looking at this lesson, timing yourself.
2. Pick any endpoint from Lessons 1-6, introduce one deliberate bug of your own choosing, and write down your hypothesis in a sentence before fixing it.

**Definition of Done**
* [x] Found and fixed a crashing bug by reading a traceback bottom-up.
* [x] Found and fixed a silent bug via bisection, hypothesis stated before the fix.
* [x] Can explain both methods without notes.

---

## Context Snapshot (End of Interlude C)

**1-5, 7-8.** Unchanged from end of Lesson 6 — no lasting application changes (bugs introduced were reverted).

**6. Terminology Ledger (additions):**
| Term | First taught | Plain meaning |
|---|---|---|
| Stack trace | Interlude C | A printed record of the call stack at the moment of failure |
| Stack unwinding | Interlude C | Frames giving up control one by one as an exception propagates upward |
| Bisection debugging | Interlude C | Repeatedly checking the midpoint of a pipeline to halve the search space for a bug |
| Hypothesis-first debugging | Interlude C | Stating what you think is wrong and why, before changing code, so a fix's success or failure is actually informative |

**7. Lesson Completion State:**
- Completed: Lesson 1, Interlude A, Lessons 2-6, Interlude C
- Next: Lesson 7 — Commenting on Posts (multiple JOINs, nested data, constraints)
