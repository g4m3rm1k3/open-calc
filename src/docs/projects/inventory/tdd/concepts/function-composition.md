# Concept: Function Composition

**What you'll understand by the end:** how combining small, single-purpose functions with a thin wrapper builds a bigger capability without any one function needing to grow more complex.

**Prerequisites:** none.

## Setup

Python 3, no packages needed.

## The Problem

A real operation is sometimes naturally made of smaller, independent steps (clean some text, then measure it, for example). Writing one large function that does all the steps internally works, but makes each step harder to test, reuse, or replace on its own — and mixes concerns that don't actually depend on each other into one place.

## The Isolated Example

```python
def strip_whitespace(text):
    return text.strip()

def count_words(text):
    return len(text.split())

def analyze(text):
    cleaned = strip_whitespace(text)
    return count_words(cleaned)

print(analyze("   hello there friend   "))
```

**Real output:**
```
3
```

**What this proves:** `analyze` contains no real logic of its own beyond calling the two smaller functions in order and passing one's result to the next — `strip_whitespace` and `count_words` can each be tested, understood, and reused entirely independently of `analyze`, and independently of each other.

## Mechanical Walkthrough

- `strip_whitespace` and `count_words` each do exactly one job, with no knowledge of the other existing.
- `analyze` sequences them: it calls `strip_whitespace` first, then feeds *that result* into `count_words`, returning the second function's result as its own.
- Neither `strip_whitespace` nor `count_words` needed to change to be combined this way — `analyze` is the only place that knows about the combination.

## CS Lens

**Function composition**: building a new function's behavior out of two or more smaller functions, called in sequence, each one's output becoming the next one's input. Mathematically, this is the same idea as composing functions `f` and `g` into `f(g(x))` — `analyze(text)` is exactly `count_words(strip_whitespace(text))`, just written as two separate statements instead of one nested expression.

Also recognized in: Unix pipes (`cat file | grep pattern | sort` — each program does one job, composed by the shell into a bigger pipeline), functional-programming pipelines generally, and any multi-stage processing pipeline where each stage is independently simple and the whole is built by chaining them.

## SE Lens

The alternative — one function containing both the whitespace-stripping and word-counting logic inline — is fewer functions to read, which is a real, if small, benefit for a two-step case this simple. The real payoff of keeping them separate shows up as steps are added, reused elsewhere, or need independent testing: `count_words` could be reused by a function that *doesn't* need whitespace-stripping first, without duplicating its logic — a reuse `analyze`'s existence doesn't block, because `count_words` was never coupled to being called only from inside `analyze`.

## Connection

This is the general shape behind combining a comment-stripping step with a word-tokenizing step into one real "parse a line" operation — each step independently useful, correct, and testable, combined by a third, thin function that only sequences them.

## Try It Yourself

1. Add a third small function, `to_lowercase`, and insert it into the pipeline between the other two. Confirm `analyze` only needed one new line to gain a real new capability — none of the existing functions needed to change.
2. Write a generic `pipe(value, *functions)` helper that applies a list of functions to a value in sequence (`functools.reduce` — see `fold-reduce-pattern.md` — is one clean way to implement it), and rebuild `analyze` using it instead of hand-written sequential calls.
3. Test `count_words` completely on its own, with input that was never passed through `strip_whitespace` first (e.g. an already-clean string). Confirm it works correctly in total isolation — proof it was never actually dependent on the other function, just used alongside it.
