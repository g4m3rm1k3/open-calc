# Value: Simplicity

"Do the simplest thing that could possibly work" is the most quoted line from
Extreme Programming and, out of context, the most misleading. It sounds like an
excuse for laziness — skip the hard parts, ship whatever's easiest. That's exactly
backwards. Simplicity, as Beck means it, is a discipline that's *harder* to
practice than adding complexity, not easier, because it requires constantly
resisting a very natural engineering instinct: building for problems you don't have
yet.

## The instinct this value pushes back against

Every experienced developer has felt it: you're building a feature, and you can
see, clearly, three ways the requirements might expand next quarter. It feels
irresponsible not to design for them now — add the configuration option, build the
plugin interface, generalize the function to handle cases nobody's asked for. This
feels like professionalism. Beck's argument is that it's usually the opposite: you're
paying a real cost today (more code to write, more code to understand, more code
that can be wrong) for a benefit that may never arrive, because you don't actually
know the future requirements — you're guessing, and guesses about software
requirements are wrong far more often than engineers like to admit.

The alternative isn't "don't think ahead." It's: build the simplest thing that
satisfies today's actual, known requirement, and trust that if the future
requirement actually arrives, you'll be in a better position to build the right
generalization *then* — informed by a real requirement instead of a guess, and
supported by whatever refactoring discipline (Post 9) and test coverage (Post 7)
you've been maintaining all along. This is a genuine bet, and it's worth stating
the bet honestly: you're trading the comfort of feeling prepared for speed today,
on the wager that "prepared for a future that may not arrive" was mostly theater
anyway.

## Beck's actual test for simple design

*Extreme Programming Explained* gives four criteria, in priority order, and it's
worth having them stated plainly rather than paraphrased into vagueness. Working
code, in order of importance:

1. **Passes its tests.** Simplicity never means "less correct."
2. **Reveals its intention** — a reader can tell what it's for without archaeology.
3. **Has no duplication** — the same knowledge isn't expressed in two places that
   have to be kept in sync by hand.
4. **Has the fewest possible elements** — no class, method, or parameter that isn't
   earning its place.

Post 8 goes through these four rules in real depth with real code. What matters
here is the order: a design that's technically minimal (rule 4) but unreadable
(fails rule 2) is not simple in Beck's sense — it's just short. Simplicity is about
the reader's actual cognitive load, not a line count.

## Why "possibly work" is doing real work in that sentence

The full phrase is "the simplest thing that could **possibly work**" — not the
simplest thing that occurs to you first, and not the simplest thing full stop.
A one-line hack that happens to pass today's test but silently corrupts data the
first time a real edge case hits it is not simple in any useful sense — it's
just short and wrong. This is the phrase's most commonly missed nuance:
simplicity is bounded by correctness on one side, exactly the way Beck's four
rules put "passes its tests" first. Simplicity that sacrifices correctness isn't a
more extreme form of the value — it's a failure to practice it at all.

## The real cost this value asks you to accept

Simple, incremental design means you will, at some real and predictable rate,
build something today that needs restructuring next month when a new requirement
actually shows up — where speculative generalization would have (maybe) already
had the shape you needed. XP's answer isn't that this restructuring cost is zero.
It's that this cost, paid honestly and incrementally as real requirements arrive,
is *reliably smaller* than the cost of guessing wrong repeatedly and carrying every
wrong guess's complexity forever. A codebase with five speculative
"just-in-case" generalizations, four of which never got used, is carrying four
units of permanent, unnecessary complexity — a debt with no possible payoff. This
is the actual comparison Simplicity is asking you to make, not "no design vs. good
design," but "guess now, pay forever" vs. "wait, then pay once, for real."

## Where this shows up in practice

Incremental Design (Post 12) is Simplicity applied to a whole system's
architecture, not just one function. The Four Rules (Post 8) are Simplicity made
checkable, rather than a vague aesthetic preference. And if you want to see this
value actually lived rather than just argued for, the Bowling Game project's
(`src/docs/projects/bowling-game-tdd/`) own Lesson 6 is a small, real, honest
example: a test was written expecting to force new code, and it
passed immediately, because the existing design was already exactly as general as
it needed to be — no more, no less. That's what this value is actually for.
