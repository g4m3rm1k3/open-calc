# Practice: The Four Rules of Simple Design

Post 3 introduced Simplicity as a value and promised this post would make it
checkable rather than a vague aesthetic preference. Here's Kent Beck's actual
test, in the priority order he gives it. A design is simple if it, in this exact
order of importance:

1. Passes its tests.
2. Reveals its intention.
3. Has no duplication.
4. Has the fewest possible elements.

The order matters as much as the list. These aren't four equally-weighted
criteria to balance — they're a strict priority ranking, and the most common
misapplication of "simple design" is treating rule 4 (fewest elements) as though
it were rule 1.

## Rule 1: Passes its tests

This rule existing at all, and existing first, is a direct statement that
Simplicity is never a trade against correctness. A design that's minimal but
wrong isn't simple — it's just short. Every other rule in this list only applies
to designs that already satisfy this one. There is no version of "elegant but
broken" that counts as simple design in Beck's sense.

## Rule 2: Reveals its intention

A reader — including you, in six months, having forgotten the details — should be
able to tell what a piece of code is *for* without tracing through its full
implementation. This is almost entirely about naming and structure, not
cleverness. Compare:

```java
int f(List<Integer> r) {
    int t = 0;
    for (int x : r) t += x;
    return t;
}
```

against:

```java
int sumOfRolls(List<Integer> rolls) {
    int total = 0;
    for (int pins : rolls) {
        total += pins;
    }
    return total;
}
```

Both do exactly the same thing. The second one tells you what it's for on
first read; the first one requires you to trace the logic to reconstruct
intent that the author already knew and simply didn't write down. Rule 2 is
the rule most often sacrificed for a false economy — fewer characters typed now,
at the cost of every future reader re-deriving what the original author already
understood.

## Rule 3: No duplication

Not "don't copy-paste text" — don't express the *same knowledge* in more than one
place, such that the two copies have to be kept in sync by hand whenever that
knowledge changes. The Bowling Game project's Lesson 22
(`src/docs/projects/bowling-game-tdd/22-fearless-refactor.md`) is a small, real
example: two separate expressions for gathering bonus rolls (one for a strike, one
for a spare) were really the same operation — "sum N rolls starting at some
position" — written twice, with slightly different arguments obscuring that they
were the same idea. Extracting one shared `bonusSum` method didn't change behavior
at all (the lesson's whole point was proving that with a passing test suite,
before and after) — it just stopped the codebase from having two independent
places that both needed updating, correctly, in sync, if that rule ever changed.
Duplication of *knowledge* — not text — is what this rule is actually about; two
functions that happen to look similar but express genuinely different domain
rules are not duplication, and merging them would be a mistake, not simplicity.

## Rule 4: Fewest elements

Only after the first three are satisfied does "does this class, method, or
parameter need to exist at all" become the question. This is deliberately last
because it's the rule most easily used to justify skipping the other three — a
design can be reduced to very few elements by making it unreadable (violating
rule 2) or by leaving actual duplication in place because removing it would add a
method (violating rule 3, in service of a shallow reading of rule 4). Rule 4 is a
real tiebreaker among designs that already satisfy 1 through 3, not a license to
ignore them for the sake of a smaller diff.

## Why the order is the actual discipline

Every one of these rules can be over-applied in isolation, and the priority order
is what prevents that. Chase rule 2 (revealing intention) with no regard for rule
3 and you get verbose, over-explained code with duplicated logic dressed up in
good names. Chase rule 4 (fewest elements) with no regard for rule 2 and you get
code that's short and unreadable. The four rules, applied in order, are a genuine
procedure — check correctness first, then clarity, then duplication, then size —
not four independent virtues to average together.

## Where this connects

This is Simplicity (Post 3) made mechanical: a real, ordered checklist instead of
an aesthetic feeling. It's also the standard Refactoring (Post 9) refactors
*toward* — a refactor with no clear target is just change; "does this get us
closer to satisfying these four rules, in this order" is what gives refactoring an
actual direction instead of being motion for its own sake.
