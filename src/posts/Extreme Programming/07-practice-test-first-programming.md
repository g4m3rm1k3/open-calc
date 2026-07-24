# Practice: Test-First Programming

Test-first programming has a precise, easy-to-state rule that's routinely
misunderstood by being softened into something vaguer: **never write a line of
production code without a failing test that requires it.** Not "write tests
alongside your code." Not "make sure you have good coverage before you ship."
The test comes *first*, chronologically, every time, and it fails, for real,
before anything exists to make it pass. This post is about why that specific,
rigid ordering matters, and it points to the Bowling Game project
(`src/docs/projects/bowling-game-tdd/`) throughout, because that project is this
practice demonstrated at length rather than described in the abstract.

## Why the ordering is the entire point

If you write the code first and the test after, the test you write is
shaped by the code you already wrote — you'll tend to test what the code
actually does, which is not at all the same question as what the code is
*supposed* to do. A test written after the fact is disturbingly good at
passing against buggy code, because both the code and the test were written by
the same person, holding the same mistaken assumption. A test written *first*
has no code to be influenced by — it can only be a direct statement of the
requirement, written by someone who, at that exact moment, is thinking about
behavior, not implementation. This is the entire mechanism. It's not about
having tests; it's about what *writing the test first* forces you to get
right that writing it after does not.

## Red, first, on purpose

The practice has three phases, and the first one — red — is the one most often
skipped by teams that think they're doing TDD. Before writing any implementation,
you run the new test and *watch it fail*. This isn't ceremony. The Bowling Game
project's Lesson 1 (`src/docs/projects/bowling-game-tdd/01-red-green-refactor.md`)
makes this concrete: the very first test in that entire project fails to
*compile*, because the class it references doesn't exist yet. That's still red —
red just means "this test does not currently pass," by whatever mechanism. Seeing
it fail, honestly, for the reason you expect, is the only way to know your test
actually tests something. A test that passes the first time you run it, before you
wrote any code for it, is a test with a bug in its own logic — you'd never notice,
because it "works" either way.

## Green, minimally, on purpose

The second phase is the one that surprises people who expect TDD to mean "design
the whole solution, then implement it test-first." It doesn't. Green means: write
the smallest, most honest change that makes the currently-failing test pass — no
more. Lesson 1's first implementation is a hardcoded `return 0`, which is a real
technique with a real name — "fake it till you make it" — not a shortcut you're
getting away with. The *next* test is what forces that fake to become general,
and Lesson 2 is exactly that moment: a second test the hardcoded fake can't
satisfy, forcing real storage and
real logic into existence. Nothing is built ahead of a test that demands it. This
is Simplicity (Post 3) enacted mechanically, not just argued for.

## Refactor, with the safety net already in place

The third phase — clean up the code's structure once it's green, using the tests
you already have as proof nothing broke — is covered in depth in Post 9. What
matters here is the sequencing: refactoring only happens *after* green, never
mixed into the same step as making a test pass. Trying to write clean, well-designed
code and make a failing test pass simultaneously is trying to solve two problems
at once; TDD's discipline is to solve them one at a time, in a fixed order, every
cycle.

## The actual argument for writing tests first

Beyond the design-quality argument above, test-first programming is Feedback
(Post 4) engineered to the tightest possible radius — you find out whether your
understanding of a requirement was correct within seconds of writing the test,
not after building an entire feature around a misunderstanding. It's also Courage
(Post 5)'s enabling condition made concrete: the Bowling Game project's Lesson 22
(`src/docs/projects/bowling-game-tdd/22-fearless-refactor.md`) runs a full
suite of nine tests before and after a real internal redesign, specifically to
demonstrate that the confidence to change working code isn't a personality trait —
it's a direct, mechanical consequence of having tests that would catch you if you
were wrong.

## The honest cost

Test-first programming is slower in the first ten minutes of writing any given
piece of code, every single time, and faster in aggregate over the following
months, in a way that's hard to feel in the moment and only becomes obvious in
hindsight — which is exactly why it's the practice most commonly abandoned under
deadline pressure, at precisely the moment it would have paid for itself. This
isn't a minor caveat. It's the actual reason this practice requires Courage
(Post 5) to sustain: doing the thing you know pays off later, while it visibly
costs you time right now, is a real, recurring act of discipline, not a one-time
decision.
