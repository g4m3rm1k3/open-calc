# Practice: Pair Programming, and What Changed When Teams Went Remote

Two people, one task, one keyboard at a time, working together continuously
rather than splitting up and reviewing each other's work later. That's pair
programming, and it's the XP practice most likely to provoke immediate
skepticism, because the objection is obvious and arithmetically intuitive: doesn't
putting two engineers on one task literally halve the team's throughput? The
practice's entire claim is that this arithmetic is wrong, and it's worth taking
the claim seriously enough to examine why, rather than dismissing it on the same
first-glance math.

## The claim, stated honestly

Two people pairing on one task do not produce code twice as fast as one person
working alone. What the practice actually claims is narrower and more defensible:
the pair produces *better* code — fewer defects, better design decisions caught in
real time rather than discovered later — at a total time cost that's less than the
sum of "one person writes it, then someone else reviews it, then the defects that
slipped through review get found and fixed later." The comparison isn't pairing
versus solo work with no other cost; it's pairing versus solo work *plus* the
separate review step and *plus* the later cost of the defects that the separated
review step didn't catch, because a reviewer looking at a finished diff has far
less context than a partner who watched the decision get made in real time.

## Why real-time catches more than after-the-fact review does

A code reviewer sees a finished diff and has to reconstruct the reasoning behind
every decision from the code alone. A pairing partner watched the decision happen
and can object *before* it's written, not after it's already shipped and needs a
second changeset to fix. This is Feedback (Post 4) at its absolute tightest
radius — not minutes, not seconds even, but the gap between one person starting to
type something questionable and the other person saying "wait, why not—" before
the line is finished. It's also Communication (Post 2) in its most literal form:
there is no lossy compression step between what one person understands and what
the other person knows, because they built the understanding together, in real
time.

## What Beck's original staging assumed, and what changed

The original practice assumes two people at one physical desk, one keyboard, one
monitor, close enough to point at the screen and finish each other's sentences.
Most teams practicing this now are not co-located, and the honest question is
whether the value survives translation to a screen-share and a voice call instead
of a shared desk. The evidence, and most teams' actual experience, is that it does
survive — imperfectly, with real friction the original staging didn't have (a
half-second of lag makes handing off the keyboard feel less fluid; you lose the
ability to glance at a partner's face for a confused expression) — but the core
mechanism, real-time shared decision-making with no lossy handoff, transfers to a
screen-share plus a live voice or video call reasonably well. What doesn't
translate is *asynchronous* "pairing" — leaving comments on a pull request over a
day, or a recorded video walkthrough with no live back-and-forth — because that
reintroduces exactly the lossy, delayed feedback loop pairing exists to eliminate.
The honest rule: if it's happening live, with both people present and able to
interrupt each other in real time, it's still pairing in every way that matters.
If it's asynchronous, it's something else — possibly still valuable, but not this
practice.

## Mobbing: the same idea, more people

A related, increasingly common variant — mob programming — puts an entire team on
one task at once, one person "driving" the keyboard while everyone else navigates,
rotating the driver role frequently. It's the same underlying bet as pairing,
scaled up: more real-time shared context costs more people's simultaneous
attention, in exchange for a decision that the *whole team* now understands
immediately, with no knowledge silo forming at all. Teams that find pure pairing's
"halves your throughput" objection hard to accept organizationally sometimes find
mobbing, used for specifically gnarly or architecturally significant problems, an
easier sell — not as a replacement for pairing generally, but as the same value
applied where the stakes of a knowledge silo forming are highest.

## Where this connects

Pair programming is Communication (Post 2) and Respect (Post 6) made structural
rather than aspirational — it only works, and doesn't become miserable, on a team
where Respect is real rather than nominal, which is exactly why Post 6 named this
practice as its clearest test case. It also directly serves Feedback (Post 4): a
partner catching a mistake as you type it is feedback arriving faster than any
automated test ever could.
