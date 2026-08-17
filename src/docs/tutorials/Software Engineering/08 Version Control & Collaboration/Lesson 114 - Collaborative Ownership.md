# Lesson 114: Collaborative Ownership

**What you will build.** Nothing new — this lesson, like Lessons 12, 27,
39, 51, 71, and 92 before it in this curriculum, is this domain's own
closing synthesis. No new Git command appears anywhere below; every
concept this lesson names has already been given full, real, run
treatment somewhere in Lessons 105 through 113. What this lesson builds
instead is the connection between all ten of them: one throughline,
visible only once every piece is on the table at once, running under
branches, merging, rebasing, conflict resolution, pull requests, and
code review alike.

**What you need to know first.** Every lesson in this domain so far —
Lesson 105 (Why Version Control Exists) through Lesson 113 (Code
Review), all reused here in full, none by citation alone.

**Pipeline diagram.** Restated in full, for the final time this domain
touches it:

```text
Problem
  ↓
Requirements
  ↓
Domain model
  ↓
Specification
  ↓
Architecture
  ↓
Design
  ↓
Implementation
  ↓
Verification
  ↓
Integration
  ↓
Release
  ↓
Deployment
  ↓
Operations
  ↓
Observation
  ↓
Change
  ↓
Migration
  ↓
Evolution
  ↓
Retirement
```

This domain sat at **Implementation**, **Integration**, and, from Lesson
113 onward, **Verification** — and this lesson's own first Concept Unit
walks the one concrete example carried since Lesson 105,
`is_username_available` and the literal usernames `"dave"` and `"alice"`,
across every one of this domain's own ten lessons at once, the same way
Lesson 12 first walked it across Domain 1's own eleven, and the same
way every domain-closing lesson since has continued the practice without
needing that precedent restated by citation.

**Terms restated in this lesson.** Per the Repetition Rule, every term
this domain has already defined in full is available for reuse here, in
full, without a second definition — `branch`, `merge conflict`, `pull
request`, `CODEOWNERS`, and every other term from Lessons 105 through
113 alike. This lesson introduces no new term of its own; its own
Concept Units instead name, and lean on, exactly the terms already
built.

---

## Concept Unit: The Full Two-Engineer Story, End to End

### The Problem

Since Lesson 105, this domain has carried one running example forward,
piece by piece, never completed in any single lesson: Engineer A,
independently fixing `is_username_available`'s own case-sensitivity gap
(does `"Dave"` collide with `"dave"`?, first named back in Lesson 12);
Engineer B, independently adding the on-call logging Lesson 12's own
3 a.m. story implied someone eventually had to write. Ten lessons named
pieces of what happens to their work — committing it, branching it,
merging it, sometimes conflicting, eventually reviewing it — but no
single lesson walked the whole sequence start to finish. Does it actually
hold together as one coherent story, or was it ten separate illustrations
that happened to share two character names?

### The Concept

It holds together, and walking it end to end proves it rather than
asserting it. Lesson 105 placed both engineers at **Implementation**,
each independently editing the same function, with nothing yet
recording either change anywhere durable — the exact problem `git init`
and a real repository, per that lesson's own Concept Units, existed to
solve. Lesson 106 gave each engineer's own in-progress edit somewhere to
live before it was ready — staged, not yet committed, each one free to
revise their own work without disturbing the other's. Lesson 107 made
each fix real and permanent the moment each engineer committed — two
separate commits, two separate hashes, each addressed by its own content,
neither one yet visible to the other. Lesson 108 gave each engineer's
work its own branch, `fix/username-case-sensitivity` and
`feature/oncall-logging`, so neither one's still-incomplete work ever
touched the project's own stable `main`. Lesson 109 is where these two
branches, had they touched different lines of `accounts.py` — plausible,
since one edits a comparison expression and the other adds a call
elsewhere in the same function — would combine automatically into one
real merge commit, finally reaching **Integration** for the first time
in this whole story. Lesson 110 offered the alternative: either engineer
could have rebased their own branch onto the latest `main` first,
keeping the eventual history linear instead of showing a visible merge.
Lesson 111 is where the honest, harder version of this story lives: had
both engineers' fixes touched the *identical* line — both, say,
rewriting the same comparison expression, one adding `.lower()` calls,
the other adding a length check first — Integration would have failed
its first attempt, producing real conflict markers neither Git nor this
curriculum could resolve automatically, requiring exactly the human
judgment Lesson 111's own two Concept Units both ended on. Lesson 112
is where either engineer's branch, once ready, became visible to the
other at all — pushed to a shared remote, compared with the exact
triple-dot diff that shows only what each branch actually did, nothing
`main` did independently in the meantime. And Lesson 113 is where the
other engineer, or a third team member entirely, actually looked at the
proposed change before it merged — `git blame` available to trace any
confusing existing line back to its own author and commit, `CODEOWNERS`
available to make sure the right person was asked in the first place.

### CS Lens

This entire sequence is a real instance of a **pipeline with a human-in-
the-loop stage**: almost every step — staging, committing, branching,
even most merges — is fully automatable and this domain proved as much
by running each one as a real, deterministic command with real, provable
output. Exactly one step in the whole sequence cannot be: the moment a
conflict appears, per Lesson 111, or the moment a reviewer actually reads
a diff, per Lesson 113, both require a person's own judgment, and no
command in this domain, however thoroughly explained, replaces either.
Also recognized in: a manufacturing line that's almost entirely
automated except for a final human quality-control inspection step; a
content moderation system that auto-approves the overwhelming majority
of submissions but routes genuinely ambiguous ones to a human reviewer;
and an autopilot system that handles ordinary flight conditions
automatically but is designed to hand control back to a human pilot the
moment conditions fall outside what it can safely resolve alone.

### SE Lens

The realistic alternative — a team relying on manual copies, shared
drives, and remembered conventions instead of this domain's own ten
lessons of tooling — is the exact starting point Lesson 105 opened this
whole domain by rejecting, and walking the full story end to end here
proves, concretely, how much of that original problem is actually gone
by the time all ten lessons are combined: every version is real,
addressable, and permanent (Lesson 107); every line of divergent work is
isolated until it's genuinely ready (Lesson 108); combining independent
work is either fully automatic or, when it can't be, honestly flagged
rather than silently guessed at (Lessons 109–111); and every change is
visible, comparable, and traceable to a real person before it ever
reaches `main` (Lessons 112–113). What remains, deliberately not
automated by any of it: the actual decisions — what a merged line of
code should say, and whether a proposed change is actually correct —
which this domain's own recurring honesty, across eleven lessons now
counting this one, has never once pretended a tool could make instead of
a person.

---

## Concept Unit: What Ownership Actually Means in a Shared Repository

### The Problem

`git blame`, this domain's own Lesson 113, attaches a real person's name
to every single line of a project's code. `CODEOWNERS`, the same
lesson, assigns specific people to specific files by name. Both tools,
read carelessly, could suggest the opposite of what this domain has
actually spent ten lessons building toward: that pieces of a shared
codebase belong to individuals, fenced off from one another, each
person's own lines answerable only to them. Is that actually what these
tools are for?

### The Concept

No — and the tools' own real behavior, already proven across this
domain, says so directly. `git blame` finds who last touched a line, not
who's allowed to touch it next; nothing about its own real output, shown
in full in Lesson 113, restricts who can open `inventory_report.py` and
change any line at all, including one `git blame` attributes to someone
else entirely. `CODEOWNERS` routes a *review request* to a relevant
person; it doesn't — and, per Lesson 113's own honest limitation, can't,
since it's read only by a hosting platform, not by Git — actually block
anyone from editing a file it names. The real word this domain has been
building toward, across branches that let many people work on the
identical codebase at once (Lesson 108), merges that combine
independently written changes into one shared history (Lesson 109),
conflict resolution that treats a real disagreement as something to
work through rather than something to fence off (Lesson 111), and
`CODEOWNERS` itself, whose actual job is making sure the right *eyes*
see a change, not restricting whose *hands* can write it — is
**collaborative ownership**: every real person able to read, run, and
propose a change to any part of the shared project, with review and
discussion as the mechanism for quality, not exclusive write access as
the mechanism for control. `git blame`'s own name is itself a small,
honest artifact of this tension — a command literally named for finding
someone to fault, still in wide use today, even though every real team
this domain's own lessons describe uses it the way Lesson 113 actually
did: not to assign blame at all, but to find the person best positioned
to explain a decision.

### CS Lens

Collaborative ownership, enforced entirely through visibility and review
rather than access restriction, is the same underlying principle
recognized in an open-source project's own typical structure: anyone can
fork, branch, and propose a change (exactly Lesson 108's own mechanism,
extended by Lesson 112's own pull request across organizational
boundaries entirely), while a smaller set of maintainers control what
actually merges, through review, not through preventing the proposal
from being written in the first place. Also recognized in: a
Wikipedia article, editable by anyone, with its own full edit history
attributable to specific accounts (the exact shape `git blame` gives a
codebase) and a review layer for contested changes; and a shared lab
notebook in scientific research, where any team member can record an
observation, but significant claims get checked by colleagues before
they're treated as settled.

### SE Lens

The alternative — real, exclusive per-file ownership, where only one
person is permitted to modify a given file at all — trades this domain's
own real, demonstrated costs (Lesson 111's own honest conflicts,
requiring real human judgment to resolve) for a different, often worse
one: a project where any single person's absence — illness, vacation, a
change of job — blocks all further work on whatever they alone were
allowed to touch. This is the real, named risk **bus factor** describes:
how many people would need to become unavailable before a project stalls
because no one else understands or is permitted to touch some critical
part of it. Every mechanism this domain has taught — branches that let
more than one person work on the same code at once, merges and rebases
that recombine independent work automatically wherever possible, and
conflict resolution and review that handle the cases that can't be
automated — exists specifically to keep that number high, not low. The
real, honest cost of collaborative ownership, true throughout this
entire domain and worth stating plainly one final time: it requires
more coordination, more review, and more of exactly the human judgment
Lesson 111 and Lesson 113 both refused to pretend could be automated
away, than a simpler, exclusively-owned alternative ever would — a real
tradeoff, chosen because the alternative's own failure mode is worse,
not because this one is free.

---

## Connect the Pieces

Ten lessons, one story, walked start to finish in this lesson's own
first Concept Unit: two engineers' independent work, real from the
moment each one committed, isolated from each other until genuinely
ready, combined automatically wherever their changes didn't overlap,
resolved by hand wherever they did, made visible to each other and to a
reviewer before either change reached `main`. Not one step in that
sequence required trusting memory, and not one step pretended a human
decision could be replaced by a command — Lesson 105's own opening
rejection of manual, memory-dependent versioning is answered, completely,
by the time this lesson closes: every version addressable, every
combination automatic or honestly flagged, every change traceable to a
real person, and every remaining decision left, deliberately, in real
hands.

## What Breaks Without This

Every single "What Breaks Without This" section across this domain's ten
prior lessons already demonstrated one piece of this directly, on real
commands, with real output: `git status` refusing to run outside a
repository (Lesson 105); a staged snapshot silently failing to reflect a
later edit (Lesson 106); an uncommitted change vanishing from history
were it not for `git status` catching it first (Lesson 107); a branch
switch refusing to silently overwrite uncommitted work (Lesson 108); a
manually retyped function losing its own real history (Lesson 109); a
rebased, already-shared commit producing a real, duplicated-commit mess
in a second engineer's own clone (Lesson 110); a commit refusing to
complete while real conflict markers remain (Lesson 111); a two-dot diff
misleading a reviewer about a change the branch never made (Lesson 112);
and an unexplained line of code with nothing but a guess to go on, absent
`git blame` (Lesson 113). This lesson adds no eleventh failure of its
own — its own point is that all ten are the same failure, worn
differently: work, or its own history, silently lost or misunderstood,
purely because a person had to remember or guess something a real tool,
already proven across this entire domain, could instead prove.

## Exercises

1. Pick any one of this domain's own ten prior "What Breaks Without
   This" sections and reproduce it once more, from memory, without
   reopening that lesson. Afterward, check your own reproduction against
   the original — what, if anything, did you get wrong or forget?
2. Walk any real, small change you've made to any project — your own or
   someone else's — across as many of this domain's ten stages as
   actually apply to it: was it staged separately from other changes?
   Committed with a message that explains *why*, not just *what*?
   Branched? Reviewed by anyone else before merging? Name honestly which
   stages it skipped, and whether skipping them cost anything in this
   specific case.
3. In your own words, and without using the word "blame" except to name
   the command itself, explain what `git blame` is actually for. Then
   explain, separately, what a `CODEOWNERS` file is actually for. State,
   in one sentence each, why neither one is about restricting who can
   edit code.

## Definition of Done

- [ ] You can walk `is_username_available`'s own two-engineer story
      across all ten of this domain's lessons, by name, without notes.
- [ ] You can state, without looking anything up, what `bus factor`
      means and which specific mechanisms from this domain exist to keep
      it high.
- [ ] You can name, honestly, the one thing every mechanism in this
      entire domain still leaves to a real person, and why.

This domain's own closing commit — the tenth lesson's own habit, kept
one final time:

```bash
git add -A
git commit -m "close Domain 8: version control makes collaboration provable, not automatic"
```
