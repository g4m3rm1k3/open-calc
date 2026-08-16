# Lesson 15: User Goals

**What you will build.** A file search feature, built exactly to its own
literal specification — return every file whose name contains the search
term — and shown to be completely correct by that specification while
still failing the one person actually using it, because the specific file
they were thinking of is buried sixth out of six results. Then a second
version, equally correct by the same specification, that surfaces it
first. The transferable problem: a system can complete the exact task it
was asked to perform, with no bug anywhere in sight, and still fail the
real reason a person was using it at all — because the task and the goal
behind it are not the same thing, and satisfying one is no guarantee of
the other.

**What you need to know first.** Lesson 13's problem-versus-solution
distinction (this lesson draws an adjacent but different line) and Lesson
14's stakeholders — this lesson looks specifically at the end user as a
stakeholder, and at the gap between what they literally do and what
they're actually trying to accomplish by doing it.

**Terms introduced in this lesson**

- **task** — a specific, literal action a user performs while using a
  system: typing a search term, clicking a button, filling in a form. A
  task has a clear, checkable definition of "done" — the search ran, the
  button was clicked, the form was submitted.
- **user goal** — the actual outcome a user is trying to reach, which
  motivates the task in the first place, and which a completed task does
  not automatically serve. Searching for "invoice" is a task; finding the
  *one specific invoice* the user actually needs is the goal behind it.
  The distinction matters because a system can be measured, and pass,
  purely on whether tasks complete — and still fail the people using it,
  if nobody ever checked whether completed tasks were actually reaching
  their goals.

**Objects and methods used.**

- **`sorted(iterable, key=...)`** —
  *What it is:* a built-in function returning a new, sorted list from any
  iterable.
  *Implementation:* `key` is a function called once per element; elements
  are ordered by comparing what `key` returns for each one, not the
  elements themselves. `sorted` is stable — elements whose `key` values
  are equal keep their original relative order from the input.
  *Its use:* this lesson's ranked search orders results by relevance
  score rather than alphabetically or by whatever order they happened to
  be stored in.

No pipeline diagram change — this lesson continues working in the
*Requirements* stage Lesson 12 named.

---

## Concept Unit: A Task Completed Correctly, a Goal Left Unserved

### The Problem

A specification arrives, precise and reasonable: given a search term,
return every filename that contains it. Build exactly that.

### The Code, Run for Real

```python
def search_files(query, filenames):
    return [f for f in filenames if query.lower() in f.lower()]
```

Run it against a realistic folder of files, searching for `"invoice"`:

```python
filenames = [
    "invoice_2023.pdf",
    "invoice_2024_final.pdf",
    "team_invoice_notes.txt",
    "old_invoice.pdf",
    "INVOICE_January.pdf",
    "invoice.pdf",
]

for r in search_files("invoice", filenames):
    print(r)
```

Running it:

```text
$ python search.py
invoice_2023.pdf
invoice_2024_final.pdf
team_invoice_notes.txt
old_invoice.pdf
INVOICE_January.pdf
invoice.pdf
```

Every one of these six files genuinely contains `"invoice"`, case-
insensitively. By the specification — return every matching filename —
this function is completely correct; nothing here is a bug in the sense
any earlier lesson in this curriculum has used that word.

### The Concept

Now picture the actual person running this search: they have one specific
file in mind — `invoice.pdf`, the current one — and typed "invoice" to
find it quickly. Their **task** was "search for invoice." Their **user
goal** was "open the one invoice I'm thinking of, right now." The task
completed successfully — six correct, relevant results, exactly as
specified. The goal was served badly: the one file they wanted is sitting
last, after five others they weren't looking for, in a list whose order
was never actually specified at all — it just happens to be whatever
order `filenames` was already stored in. Nothing about "return every
matching filename" was wrong. It simply never asked the question that
actually determines whether this feature helps the person using it: once
several files match, which one do they most likely want to see first?

### CS Lens

This is the identical gap Lesson 2 opened this curriculum with, moved
from a single function's specification to a person's actual reason for
using it: the programming question — does this return the correct set of
matches — is fully answered. The engineering question — does this
actually help the person searching find what they need — was never
asked, and answering the first correctly gives zero information about the
second.

### SE Lens

The realistic alternative here isn't "always solve full relevance ranking
for every feature" — for a folder of three files, unordered results serve
the goal just fine, and building ranking logic nobody needs would be the
same premature-defense mistake Lesson 2's closing unit already warned
against. The signal that this feature specifically needed more than the
literal task specification is concrete and checkable: multiple real
matches, competing for one person's attention, with no way for the system
to guess which one they meant without at least trying to estimate it.

---

## Concept Unit: Serving the Goal Without Changing the Task

### The Problem

The specification — return every filename containing the search term —
doesn't have to change at all. What has to change is which of the correct
matches the user actually sees first.

### The New Code

```python
def relevance_rank(query, filename):
    lower_name = filename.lower()
    lower_query = query.lower()
    stem = lower_name.rsplit(".", 1)[0]
    if stem == lower_query:
        return 0
    if lower_name.startswith(lower_query):
        return 1
    return 2
```

Using that score to sort the same matches this lesson's first unit
already found:

```python
def search_files_ranked(query, filenames):
    matches = [f for f in filenames if query.lower() in f.lower()]
    return sorted(matches, key=lambda f: relevance_rank(query, f))
```

### Run It Against the Same Files, Same Query

```python
for r in search_files_ranked("invoice", filenames):
    print(r)
```

Running it:

```text
$ python search.py
invoice.pdf
invoice_2023.pdf
invoice_2024_final.pdf
INVOICE_January.pdf
team_invoice_notes.txt
old_invoice.pdf
```

The exact same six files, in a different order: `invoice.pdf` — the one
file whose name, ignoring its extension, matches the query exactly — is
now first. `search_files` and `search_files_ranked` satisfy the identical
literal specification: same six results, same query, same match rule.
Only their order differs, and that's the entire difference between a
feature that completes its task and one that actually serves the goal
behind it.

### Mechanical Walkthrough

- `lower_name.rsplit(".", 1)[0]` — splits a filename from the right on
  its last `.`, keeping only the part before the extension. First
  appearance of `rsplit` in this curriculum: like `split`, but scanning
  from the right end of the string, which matters here because a filename
  could contain other dots before its extension.
- `relevance_rank(query, filename)` returning `0`, `1`, or `2` — a
  three-tier scoring rule: an exact match on the filename's stem scores
  best, a name merely starting with the query scores second, everything
  else that matched at all scores last. This is the one new engineering
  idea in this unit — not a language feature, a design decision about
  what "more relevant" means for this specific kind of search.
- `sorted(matches, key=lambda f: relevance_rank(query, f))` — first
  appearance of `sorted` with a `key`, given full treatment above. The
  `lambda` is already-assumed syntax (an anonymous function passed
  directly as an argument); what it does here is adapt `relevance_rank`,
  which takes two arguments, into a one-argument function `sorted` can
  call once per filename.
- Sort stability, made visible in the real output: three files —
  `invoice_2023.pdf`, `invoice_2024_final.pdf`, `INVOICE_January.pdf` —
  all score `1`, and appear in the ranked output in the exact same
  relative order they had in the original `filenames` list. That's
  `sorted`'s stability guarantee, not a coincidence: when two elements
  score identically, their original order is preserved rather than being
  rearranged arbitrarily.

### CS Lens

Separating *which items match* from *what order they're shown in* is a
recurring split in information retrieval generally: a search engine's
"find every relevant page" step and its "rank them by likely usefulness"
step are treated as genuinely separate problems, solved separately, for
exactly the reason this unit demonstrated — a system can excel at the
first and still fail the person using it without ever attempting the
second.

### SE Lens

`relevance_rank`'s three tiers are a real, debatable design decision, not
a mechanically correct answer derived from the specification — a
different reasonable rule (most recently modified first, say) would also
be defensible, and would rank this exact query's results differently.
That's honest, and worth stating plainly: serving a user goal, unlike
satisfying a literal task specification, doesn't have one checkable right
answer. It has better and worse guesses at what a real person most likely
meant, which is a fundamentally different kind of engineering question
than the one this lesson's first unit answered completely.

---

## Concept Unit: Checking for This Gap on Purpose

### The Problem

`search_files`'s gap wasn't caught by any test checking whether it
returned the right *set* of files — it did, every time. What kind of
check would have caught it?

### The Concept

The reliable check isn't "does the output match the specification" —
`search_files` already passed that completely. It's a different, harder
question: given a *specific, realistic* task a real user would actually
perform — not just any valid input, but the exact scenario, "I'm looking
for my current invoice, I know roughly what it's called" — does using the
system actually get that person to their goal efficiently? That's not a
question any unit test written against the literal specification would
ever ask, because the specification itself never mentioned the user's
goal at all. It has to be asked deliberately, by picturing a real person
with a real reason for using the feature, the same deliberate move Lesson
13 made by asking why a request was made in the first place, aimed here
at the *use* of an already-correct feature instead of the request for it.

### CS Lens

This is the same relationship as Lesson 6's correctness versus
reliability, moved from code behavior to user experience: `search_files`
is correct exactly the way `average` was correct in Lesson 6 — matching
its stated specification precisely — while failing to reliably get a real
user, under real, ordinary conditions, to what they actually needed.

### SE Lens

This is also why this curriculum's later material on acceptance criteria
matters as its own distinct step from "does the code match the ticket" —
a specification can be met exactly and still miss the goal it was
supposedly written to serve, unless someone deliberately checks the
second thing, not just the first. That check is this lesson's actual
contribution: not a rule for computing the right ranking, but the habit
of asking whether task completion and goal service were ever confirmed to
be the same thing, for this specific feature, before calling it done.

---

## Connect the Pieces

One search feature, one query, two orderings of the identical correct
results:

1. **The task, completed exactly** — `search_files("invoice", filenames)`
   returns all six correct matches, satisfying its specification fully.
2. **The goal, unserved** — the one file the user actually wanted,
   `invoice.pdf`, sits last, with no bug anywhere to point at.
3. **The same task, the goal now served** — `search_files_ranked`
   returns the identical six files, reordered so the most likely intended
   match appears first, with the underlying match logic completely
   unchanged.

## What Breaks Without This

Ship `search_files`, confirm it against every test that checks "does the
correct set of files come back" — every one of them passes, because the
underlying logic is genuinely correct. In real use, the file someone
needs is routinely buried behind several others they weren't looking for,
every single time more than one file happens to match. Nobody files a bug
report against a function that's returning exactly the files it was asked
to return — they just quietly find the feature slow and annoying to use,
give up, and go looking for the file some other way, while every metric
the team is actually watching — did the search run, did it return
results, did it error — stays green the entire time.

## Exercises

1. Add a fourth ranking tier to `relevance_rank`: files modified most
   recently should outrank equally-scored older files (you'll need to add
   a modification date to each test file — a plain integer standing in
   for a timestamp is fine). Re-run the search and confirm the ordering
   changes accordingly.
2. Think of a task you perform often in some app or website you use, and
   name the real goal behind it, in one sentence, the way this lesson
   separated "search for invoice" from "find my current invoice." Then
   say whether you think the tool actually serves that goal well, and
   why.
3. Look back at Lesson 14's `export_contacts_csv`. What's the sales rep's
   actual task when they click export, and what's their real goal behind
   it? Are they currently the same thing, or is there a gap this
   lesson's technique would find?

## Definition of Done

- [ ] You can state the difference between a task and a user goal, in
      your own words, using an example that isn't this lesson's search
      feature.
- [ ] You've run both `search_files` and `search_files_ranked` yourself
      and confirmed the reordering shown in this lesson.
- [ ] You've completed all three exercises.
- [ ] Commit `search_files_ranked` alongside the original. Commit message
      should explain *why*: for example, `Lesson 15 — added relevance
      ranking; search results were technically correct but buried the
      file a real user was actually looking for.`
