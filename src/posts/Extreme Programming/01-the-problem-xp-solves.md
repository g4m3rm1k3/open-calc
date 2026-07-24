# The Problem Extreme Programming Actually Solves

Kent Beck's *Extreme Programming Explained* opens with a claim that sounds almost
naive until you sit with it: the cost of changing software late in a project doesn't
have to rise exponentially over time. Every traditional engineering discipline
assumes it does — a mistake caught in a building's blueprints costs a phone call to
fix; the same mistake caught after the concrete is poured costs a demolition crew.
Software engineering, for decades, copied that assumption wholesale: freeze the
requirements early, design everything up front, because changing your mind later
will be catastrophically expensive. Extreme Programming is what happens when you
take seriously the possibility that this assumption is simply wrong for software,
and ask what practices would follow if it were.

## Why software might actually be different

A building's concrete is physically poured; a bridge's steel is physically welded.
Software has no equivalent physical commitment — every line of code is, in
principle, editable forever. The catch is "in principle." In practice, most
codebases *do* become expensive to change over time, not because of some law of
nature, but because of specific, nameable things teams do (or fail to do): no
tests, so every change risks a silent regression; tangled coupling, so changing one
thing breaks three others; poor communication, so nobody remaining on the team
understands why a piece of code does what it does. None of those are physical laws.
They're engineering choices, made or neglected, one commit at a time.

This is XP's actual bet, stated plainly: if the things that make software
expensive to change are engineering choices, then a different set of engineering
choices should be able to flatten the cost-of-change curve — keep it cheap to
change your mind in month eleven, not just month one. Every value and practice in
this series is downstream of that one bet.

## Why this looks "extreme"

The name comes from a real observation: if a practice is good, doing more of it
should be better, up to some sane limit. Code review is good — so review
constantly, as you write, not in a separate phase (pair programming). Testing is
good — so write the tests first, before the code they test, and run them
constantly (test-first programming, continuous integration). Simplicity is good —
so design for exactly what's needed today, not a speculative future need
(incremental design, not big design up front). Feedback is good — so shorten the
loop between writing code and finding out whether it works from months to minutes.
None of these ideas are individually radical. Turning each dial most of the way up,
simultaneously, and seeing what a team that actually did that would look like — that
was the "extreme" part, and it's the reason the name has aged more awkwardly than
the ideas themselves.

## What this series actually is

Beck's own books — *Extreme Programming Explained* and *Test-Driven Development: By
Example* — are excellent and, by his own admission in later editions, products of
their moment: written for co-located teams with whiteboards and index cards, before
GitHub, before Slack, before remote pairing was a normal thing to do. This series
takes the ideas seriously and asks what they look like now. Two through six cover
XP's core **values** — Communication, Simplicity, Feedback, Courage, and Respect —
the things you're actually trying to protect. Seven onward cover the concrete
**practices** — test-first programming, pair programming, continuous integration,
incremental design, and the rest — the specific things you actually do, each one
traceable back to a value it exists to serve.

This series is deliberately independent of the Bowling Game TDD project
(`src/docs/projects/bowling-game-tdd/`) living alongside it in this repository —
you don't need that project to get something real out of these posts, and you
don't need these posts to get something real out of that project.
But where a practice in this series has a genuinely concrete, lived example in that
project (test-first programming most of all), this series points to it directly,
because a real fifteen-lesson demonstration is worth more than another paragraph of
description.

## Where to go next

Read the five values next, in any order that interests you — Communication,
Simplicity, Feedback, Courage, Respect. Each stands alone. Together, they're the
actual argument this whole series is making: that a team's engineering practices
are downstream of what it actually values, and that naming the values honestly is
what makes the practices make sense instead of feeling like arbitrary rules.
