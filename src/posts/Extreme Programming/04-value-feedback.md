# Value: Feedback

Every engineering decision is a guess until something real confirms or refutes it.
The question Feedback asks isn't "are we getting feedback" — every team eventually
finds out whether its code works. The question is **how long the gap is** between
making a guess and finding out whether it was right, and Extreme Programming treats
shrinking that gap as one of the highest-leverage things a team can do.

## The gap, made concrete

Consider the same mistake — a subtly wrong assumption about how two parts of a
system interact — surfacing at four different possible moments: while you're
typing it (a red squiggly line), thirty seconds later (a test you just wrote
fails), an hour later (continuous integration catches it against the rest of the
codebase), or six months later (a customer reports data corruption in production).
It's the *same mistake* every time. What changes is entirely the cost of fixing
it — the context is still fresh in your head at thirty seconds; it's gone, possibly
along with the person who wrote it, at six months. Feedback as a value is the
commitment to systematically pull that gap as far left as it can go, for as many
kinds of mistakes as possible.

## Why this is a value, not just "testing"

It's tempting to read Feedback as "write tests," but that undersells it. Feedback
is the value; testing is one mechanism, not the only one. A pair programmer
catching a bug as you type it is feedback, arriving in seconds, faster than any
automated test could. A continuous integration server telling you your change broke
someone else's code is feedback, arriving in minutes. A customer using a working
increment of the product and telling you it's not what they meant is feedback too —
slower, but often catching mistakes no test could, because the mistake wasn't in
the code, it was in what the code was asked to do. XP's practices form a deliberate
ladder of feedback loops at different speeds, each catching a different category of
mistake, and no single one of them is sufficient alone.

## The actual argument for tightening the loop

The intuitive objection is that fast feedback sounds expensive — surely running
tests constantly, integrating constantly, slows you down compared to just writing
the code and checking later? The empirical answer, which is really the whole
premise underlying Test-First Programming (Post 7) and Continuous Integration
(Post 11), is that a mistake caught in thirty seconds costs approximately thirty
seconds to fix, while the *identical* mistake caught six months later costs hours
or days — tracing it back through six months of subsequent code that was built on
top of the wrong assumption, re-deriving context nobody remembers, and fixing it
without breaking whatever now unknowingly depends on the bug's specific wrong
behavior. Tight feedback loops aren't slower engineering with extra safety
theater bolted on. They're the version of engineering where mistakes get fixed
while they're still cheap, which is a real, compounding speed advantage over time,
even though every individual feedback loop (writing a test, waiting for a build)
feels like it's adding friction in the moment.

## What this looks like at different timescales

Feedback isn't only about code correctness — Beck's own framing includes feedback
at the scale of the whole project. A team that shows working software to a real
customer every week or two gets feedback about whether they're building the right
thing, not just whether the thing they're building works — a distinct and often
more expensive kind of mistake to leave uncaught. This is why "working software,
demonstrated often" shows up repeatedly across XP's practices at every scale: a
passing test is feedback about a function; a green CI build is feedback about a
whole codebase's integration; a customer reaction to a real demo is feedback about
the entire direction of the project. Each is the same underlying value, applied at
a different radius.

## Where this shows up in practice

Test-First Programming (Post 7) is Feedback at the tightest possible radius —
seconds, about a single piece of behavior. Continuous Integration (Post 11) is
Feedback at the scale of the whole team's combined work, on a cadence of minutes to
hours. The Bowling Game project (`src/docs/projects/bowling-game-tdd/`) is a
real, lived demonstration of the tightest loop: every single lesson in that
project's Epic 1 shows a real test failing, then the real fix, then the real test
passing — feedback measured in the seconds between running a command and reading
its output, not an abstraction to take on faith.
