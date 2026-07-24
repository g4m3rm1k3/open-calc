# Practice: Incremental Design, and Beck's Real Argument Against Big Design Up Front

Traditional software engineering wisdom says: design the whole system before you
build it, because changing a foundational decision after code is built on top of
it is expensive, so get the foundation right first. Extreme Programming's most
disorienting claim, for anyone trained on that wisdom, is that this is often
backwards — that designing incrementally, evolving the architecture as real
requirements actually arrive rather than committing to a comprehensive upfront
design, produces *better* systems for a large and important class of real
projects. This is the practical, architecture-scale version of the bet Post 1
opened this whole series with: that the cost of changing software later doesn't
have to be catastrophic, if the team's practices are actually built to keep it
cheap.

## Why Big Design Up Front's core assumption is the weak point

Big Design Up Front (BDUF) requires accurately predicting your requirements before
you have any working software to learn from. This is precisely where it tends to
fail in practice: the people writing the upfront design are guessing, based on
requirements that are themselves usually incomplete or subtly wrong at that early
stage — before any real user has touched anything, before any stakeholder has seen
a working increment and said "oh, actually, that's not quite what I meant." A
comprehensive design built on an incomplete, unvalidated understanding isn't a
safety net. It's a large, confident structure built on a guess, and the later
you discover the guess was wrong, the more of that structure has to be undone.

## What incremental design actually asks you to do instead

Build the simplest design that satisfies today's actual, validated requirement
(Post 3's Simplicity value, Post 8's four rules, applied at the scale of a whole
system's architecture instead of one function). When a *new*, real requirement
arrives — not a guessed future one, an actual one, backed by a real need — evolve
the design to accommodate it, using the refactoring discipline from Post 9,
verified safe by the test suite from Post 7. Repeat. The architecture that results
isn't planned in advance; it's grown, one real, validated requirement at a time,
each step informed by an actual observed need instead of speculation about a need
that might arrive.

## The concrete example this whole series keeps returning to

The Bowling Game project's Lesson 8
(`src/docs/projects/bowling-game-tdd/08-design-fork-refactor.md`) is worth
revisiting specifically for this post, because it's a rare case where a team
faces the exact same fork BDUF and incremental design would resolve completely
differently. A comprehensive upfront design for a bowling scoring engine would
have to pick, before writing any code, between a flat data structure and an
object-oriented `Frame` model — a real, consequential architectural decision made
on paper, before either option had been built or tested against real requirements.
The incremental approach in that lesson does something different: it builds the
simplest working version first (a flat list, driven entirely by tests, Lessons
1 through 7), and only *then*, once real, working, fully-tested code exists in
both shapes, compares the two honestly, with real tradeoffs visible in actual code
rather than argued about on a whiteboard. Neither design turned out to be
objectively superior — which is itself the point. A comprehensive upfront design
process would have had to resolve that ambiguity by conviction alone, before
either option existed to actually compare.

## The honest cost, stated plainly

Incremental design means accepting that the architecture you have today is not
the architecture you'll need forever, and that real, working restructuring effort
will be required later, when real new requirements arrive — this is not a flaw
in the practice, it's the trade the practice is explicitly making: pay a real,
smaller cost later, informed by real information, instead of a speculative,
larger cost now, informed by guesses. This trade only works if Post 9's
refactoring discipline and Post 7's test-first safety net are actually in place —
incremental design without them isn't lean engineering, it's just accumulating
architectural debt with no mechanism to safely pay it down. The three practices
are, in the end, one system: incremental design is the payoff refactoring and
test-first programming exist to make affordable.

## Closing this series

Twelve posts, one underlying argument, stated once more plainly: a team's
practices only make sense in light of what it actually values, and Extreme
Programming's whole claim is that Communication, Simplicity, Feedback, Courage,
and Respect, taken seriously and practiced concretely — not as posters on a wall,
but as test-first programming, pairing, continuous integration, and design that
evolves instead of being predicted — can keep software genuinely cheap to change,
for years, instead of merely at the start. The Bowling Game project
(`src/docs/projects/bowling-game-tdd/`) is what several of these
ideas look like lived rather than argued for. This series was the argument itself.
Both were worth having, independently, and — per the value this whole series
opened with — that's exactly the point.
