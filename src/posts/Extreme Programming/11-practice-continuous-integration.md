# Practice: Continuous Integration and the Ten-Minute Build

Every developer working on a shared codebase eventually meets the same failure
mode: two people each spend two weeks on separate branches, touching overlapping
code, and the day they finally try to merge, hours or days disappear into
resolving conflicts and rediscovering assumptions the other person made without
knowing they'd collide. Continuous Integration is the practice of never letting
that gap get large enough to hurt: integrate your changes with everyone else's,
completely, multiple times a day, every day.

## What "continuous" actually means here

Not "we have a CI server" — a huge number of teams have automated build servers
and still integrate rarely, working for days or weeks on long-lived feature
branches before merging. That's automation *of* infrequent integration, not
continuous integration. The practice's actual claim is about frequency: every
developer merges their changes into the shared mainline, and runs the full test
suite against the *combined* result, multiple times per day. The automation (a CI
server running the suite on every push) is what makes that frequency sustainable
without someone manually re-running everything by hand — but the automation is a
means, not the practice itself. A team merging to mainline once a week, no matter
how sophisticated their build server, is not practicing continuous integration in
Beck's sense.

## Why the ten-minute build is a real, load-bearing constraint

Beck's specific number — build and test suite completing in ten minutes or less —
isn't an arbitrary nicety. It's the constraint that makes frequent integration
psychologically and practically sustainable. A build that takes ten minutes fits
naturally into a short break; a developer will run it constantly, sometimes
several times an hour, because the cost of doing so is negligible. A build that
takes ninety minutes gets run once a day, if that, because the cost of frequent
runs becomes a real interruption to actual work — and the moment integration
frequency drops, the entire benefit of this practice (catching conflicts within
minutes of them happening, not weeks later) starts to erode. The ten-minute number
is a threshold below which the practice remains genuinely frequent, and above which
teams quietly, reasonably, stop doing it as often, for understandable reasons that
still defeat the practice's purpose.

## What this looks like now versus 1999

Beck's original description assumes a dedicated build machine and a team small
enough that "everyone integrates with everyone" is a simple, literal daily
routine. Modern tooling changed the mechanism without changing the underlying
requirement: a CI pipeline (GitHub Actions, GitLab CI, or equivalent) runs
automatically on every push, a suite of automated tests (Post 7's actual output,
not a manual QA pass) gives a real pass/fail signal within minutes, and short-lived
feature branches merged same-day or next-day approximate "everyone integrates with
everyone, constantly" at a scale and distribution 1999's staging didn't anticipate.
What hasn't changed at all is the actual failure mode this practice prevents:
long-lived branches that diverge from the mainline for weeks are exactly as
dangerous now as they were then, regardless of how sophisticated the eventual merge
tooling is — the problem was never *how* you merge, it was *how long you waited*
to do it.

## Why this is Feedback, applied at the scale of the whole team

Post 4 covered feedback at the scale of a single line of code, caught in seconds by
a test. Continuous Integration is the identical value, applied at the scale of
"does my work correctly coexist with everyone else's work," on a cadence of
minutes to hours instead of weeks. The mistake being caught is different in kind —
not "is this function correct" but "did my change and someone else's change make
incompatible assumptions about the same piece of the system" — but the underlying
logic is identical: the same conflict discovered in an hour costs an hour to
resolve, cleanly, while both people still remember exactly what they were doing;
discovered after three weeks of divergence, it costs days, and neither person
fully remembers their own reasoning anymore.

## Where this connects

Continuous Integration is what makes Incremental Design (Post 12) sustainable
across a whole team rather than just within one person's local work — a team
building incrementally, in small steps, needs those steps to actually converge on
one shared, working system constantly, not accidentally diverge into several
different systems that happen to share a repository. It's also the team-scale
version of the exact same trust Refactoring (Post 9) depends on locally: a passing
build, run constantly, is what lets everyone keep moving fast without a creeping
fear that someone else's unseen changes have silently broken what looked, from
where you're sitting, like working code.
