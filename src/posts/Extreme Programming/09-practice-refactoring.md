# Practice: Refactoring Is a Discipline, Not Cleanup

"Refactoring" gets used loosely to mean "going back and cleaning up code later,"
usually in a dedicated sprint or a guilty afternoon when a deadline finally
loosens. That's not what the word means in Extreme Programming, and the looseness
matters: Martin Fowler's precise definition, which Beck's own practice depends on,
is **changing a program's internal structure without changing its observable
behavior.** Refactoring isn't a phase you schedule. It's a move you make
constantly, in small steps, each one verified safe before the next one starts.

## Why "without changing behavior" is the entire definition

If a change alters what the program does — even to fix a bug — it isn't a
refactoring. It might be a good change, but it's a different kind of change, with
different verification needs. This distinction matters because it's what makes
refactoring safe to do constantly: a true refactoring, by definition, has an
existing test suite that should pass, completely unchanged, before and after. If a
test needs to change to accommodate your "refactoring," you've actually changed
behavior, and you should be honest with yourself about which kind of change you're
making.

## The mechanism that makes this safe

The Bowling Game project's Lesson 22
(`src/docs/projects/bowling-game-tdd/22-fearless-refactor.md`) demonstrates the
actual procedure rather than describing it abstractly: run the full test suite
first (nine tests, all passing, captured as real output), make a genuine
structural change — extracting a duplicated bonus-calculation expression into one
shared method — and run the exact same suite again. Same nine tests, same result,
both times. That side-by-side comparison *is* what makes a refactoring different
from a hopeful guess: you're not asserting the change is safe, you're
demonstrating it, mechanically, against a fixed set of checks that don't change
their mind based on how confident you feel.

## Why this has to happen constantly, not periodically

A codebase that only gets refactored in scheduled cleanup phases accumulates small
frictions between those phases — a slightly-wrong name here, a bit of duplicated
logic there — and each one makes every subsequent change slightly harder, which
compounds. By the time the next scheduled cleanup phase arrives, the mess is
substantial enough that fixing it feels like a project in itself, competing for
priority against actual features, and it usually loses. Continuous refactoring —
improving the specific piece of code you're touching, right now, as part of
whatever else you're doing — never lets the debt accumulate to that scale in the
first place, because it's paid down constantly, in small amounts, as a normal part
of every change rather than as a separate, schedulable line item that's easy to
deprioritize.

## The real relationship to the Four Rules

Post 8's four rules of simple design aren't a one-time design checklist — they're
what continuous refactoring is refactoring *toward*. Every time you touch a piece
of code, the honest question is: does this still pass its tests, reveal its
intention, avoid duplication, and stay no larger than it needs to be? If a change
you're making reveals that the answer to any of those has quietly become "no" —
even if your actual task today is unrelated — continuous refactoring means fixing
that now, as a small, separate, safety-net-verified step, not filing it away for
later.

## Why this requires Courage, specifically

Refactoring code you didn't write, that's currently working, with no immediate
feature pressure demanding you touch it, is exactly the situation Post 5
identified as needing Courage: the safe, path-of-least-resistance choice is to
leave it alone and work around it. Refactoring as an ongoing discipline is the
concrete, repeated exercise of choosing otherwise — and it's only a responsible
choice, not a reckless one, because of the safety net Post 7's test-first practice
already built. This is why these three practices — test-first programming,
refactoring, and the four rules — function as one connected system rather than
three separate techniques you could adopt independently and expect the same
result.

## The honest limit

Refactoring's safety guarantee is only as good as the test suite backing it. A
codebase with weak or missing test coverage can still be "refactored" in the
loose, colloquial sense, but without Post 7's discipline already in place, there's
no real mechanism proving behavior didn't change — you're back to hoping, which is
exactly the state this practice exists to move a team away from. Refactoring
without tests isn't a lesser version of this practice. It's a different, riskier
activity wearing the same name.
