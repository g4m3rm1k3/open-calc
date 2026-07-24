# Value: Courage

Courage is the value people misunderstand fastest, because "be brave" sounds like
license for exactly the kind of reckless behavior good engineering discipline is
supposed to prevent — rewrite it all this weekend, skip the tests, ship it and see.
Beck's actual meaning is closer to the opposite. Courage, in Extreme Programming,
is the willingness to do the *responsible* thing even when it's uncomfortable —
and it only works, safely, in the presence of the other four values. Courage
without Feedback isn't brave. It's just risky.

## The specific fears this value names

Every engineer knows a version of this feeling: staring at a piece of code that's
clearly wrong — badly named, doing too much, coupled to things it shouldn't know
about — and choosing not to fix it. Not because fixing it is hard, necessarily, but
because touching it feels dangerous. What if fixing it breaks something you can't
see? What if you're blamed for the regression instead of praised for the cleanup?
The path of least resistance is to leave it, add your own new code around it
without touching it, and let the problem compound for the next person. Courage
names this exact moment and asks for the opposite choice: fix the thing that's
wrong, right now, because leaving it wrong is a decision too, and usually the worse
one.

## Why courage requires the other values, not just willpower

This is the part that separates XP's Courage from simple risk-tolerance. Deleting
and rewriting a working piece of code with no tests, based purely on a hunch that
the new version is better, isn't Courage — it's gambling with the codebase's known
working state as the stake. The exact same act, with a comprehensive test suite as
a safety net (Feedback), done as a small, incremental step rather than a rewrite
(Simplicity), discussed with a pair before doing it (Communication) — that's
Courage, because the risk has been engineered down to something a professional can
responsibly take. This is why Beck introduces Courage last, or near-last, in most
orderings of the values: it's the one that cashes in the other three. Without
tests, "just refactor it" is bravado. With tests, it's due diligence.

## The bowling game as the concrete version of this argument

The Bowling Game project's (`src/docs/projects/bowling-game-tdd/`) own
Lesson 22 exists specifically to make this argument un-ignorable rather than
merely asserted. It runs the full test suite, makes a real internal change to the
scoring engine's structure, and runs the suite again — the same nine checks,
before and after, both passing. That's what Courage actually looks like in
practice: not a leap of faith, a calculated bet where the calculation is a real
test suite's actual output, not a feeling. A team with a codebase they're afraid to
touch doesn't have a courage problem at its root — it has a feedback problem
(no tests, or tests nobody trusts) that makes courage *correctly* feel
unavailable. Fix the feedback loop, and the courage to change things follows,
because the risk genuinely dropped.

## The forms this value takes beyond refactoring

Courage also shows up as: telling a customer honestly that a deadline isn't
achievable instead of quietly overcommitting and hoping; admitting a design
decision was wrong and needs to change, in front of the team, instead of quietly
defending it to save face; deleting code that turned out not to be needed instead
of leaving it in "just in case," a direct enactment of the Simplicity value from
Post 3. Each of these is a small act of honesty that's socially or emotionally
easier to avoid than to do — and each one, avoided repeatedly across a team over
time, is exactly how technical debt and unspoken misunderstandings accumulate.

## Where this shows up in practice

Refactoring as an ongoing discipline (Post 9) is Courage's most direct practical
expression — the willingness to keep improving a design continuously rather than
declaring it finished and untouchable. Incremental Design (Post 12) requires
Courage too: trusting that today's simple, sufficient design can be safely
changed later, rather than over-building now out of fear that later will be too
late. In both cases, the actual enabling condition is the same one this post keeps
returning to: Courage is only a virtue when Feedback (Post 4) has made the risk
real and small instead of imagined and large.
