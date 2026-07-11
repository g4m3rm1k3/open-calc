# Reference Notes

A running log of deep-dive explanations from working sessions on this app —
things worth keeping permanently instead of losing in chat scrollback. Each
entry below is self-contained. Newest entries are appended at the bottom;
this file is not read top-to-bottom as a sequence, so entries don't depend on
each other. Use Ctrl+F / your editor's search to jump to a topic.

---

## Feature Flags

A feature flag is a runtime switch that lets you turn a piece of code on/off
(or route between two versions of it) without deploying new code — the
branching logic ships dormant, and a flag value decides which path executes.

**Why they exist:**
- Ship code to production before it's ready for users (dark launch), then
  flip it on later
- Roll out to a subset of users first (a %, a cohort, internal only) instead
  of all-or-nothing
- Kill a bad feature instantly if it breaks something, without a rollback
  deploy
- A/B test two implementations
- Keep a long-lived branch's changes mergeable to main incrementally, gated
  behind a flag, instead of one giant merge at the end

**The core mechanism, at any complexity level, is the same shape:**

```ts
function isEnabled(flagName: string): boolean {
  return /* look this up somewhere */
}

if (isEnabled('new-checkout-flow')) {
  // new code path
} else {
  // old code path
}
```

The interesting part is entirely *where the flag's value comes from* — that's
what separates the tiers below.

**1. Hardcoded constant (barely a flag, but the simplest form)**
```ts
const FLAGS = { newCheckoutFlow: true }
```
Good for a temporary kill switch during development. Requires a code change
+ redeploy to flip — no real runtime benefit yet.

**2. Environment variable**
```ts
const enabled = import.meta.env.VITE_FEATURE_NEW_CHECKOUT === 'true'
```
Flip per-environment (on in staging, off in prod) without touching code.
Still requires a rebuild/redeploy to change.

**3. Config file or remote JSON fetched at startup**
A small `flags.json` (local or fetched from a server) read once when the app
boots. Now you can flip it without a redeploy — just edit the file/endpoint.
This is the first tier with genuine "change behavior without shipping code."

**4. User-scoped, persisted client-side (common for client-only apps like
this one)**
```ts
function isEnabled(flag: string): boolean {
  try {
    return localStorage.getItem(`flag:${flag}`) === 'true'
  } catch { return false }
}
```
Lets you or a tester toggle it in devtools without a build at all. Cheap, no
backend needed — fits an app like open-calc that's largely client-side.

**5. Real feature-flag service (LaunchDarkly, Unleash, GrowthBook, PostHog,
or a hand-rolled backend table)**
Flags are evaluated server-side per-user, support percentage rollouts,
targeting rules (user id, cohort, plan), and give you an admin UI to flip
things live. This is what "feature flag" usually means in a team/product
context — worth reaching for once you need gradual rollout or non-engineers
to control the flag.

**A few practical rules regardless of tier:**
- Check the flag at the *call site* of the behavior, not scattered in five
  places — centralize the lookup (`isEnabled('x')`) so there's one source of
  truth for what "on" means.
- Flags are meant to be temporary. A flag that's been `true` in every
  environment for six months is dead code with extra steps — delete the flag
  and the old branch.
- Don't let flag state leak into persisted data in a way that's hard to
  reverse (e.g., writing flag-gated data to a database in a new,
  incompatible shape) — if you turn the flag back off, the old code path
  should still work.

*Where this could apply in this app:* gating the autofind `contentLoader.ts`
work (`src/docs/UpSkillOS work/lesson-engine-autofind/`) behind a flag while
rolling it out, instead of switching `LessonEngineLab.tsx` over all at once.

---

## Lesson-Writing Workflow: When to Write a Lesson vs. Just Build

The `UpSkillOS work/` lesson series (autofind, matrix-reducer copy button,
etc.) exists so the app's architecture doesn't stay something only Claude
understands — so features/bugs can be explained accurately to
collaborators, contributors, and future-Claude without re-deriving the same
explanation every time.

That doesn't mean every future change needs a full lesson first. Splitting
work into two permanent, disconnected buckets — "lessons over here, real
code over there" — just recreates the original problem: whatever gets built
in the "real code" bucket unsupervised becomes new unexplained surface
area, and the next change to it starts from zero again.

**The actual rule: gate by novelty, not by new-vs-existing.**

- **A genuinely new pattern for this codebase** (an architecture/approach
  it doesn't already use anywhere) → lesson first, same shape as the
  existing sets: real code, a concept lab if the pattern is novel, then the
  implementation, built or directed once the Definition of Done is met.
- **A repeat of an already-taught pattern** (a third "add autofind to X," a
  second "add a copy button to Y") → no new lesson — just build it. This
  mirrors the Repetition Rule the lessons themselves already follow: a hard
  concept is taught deeply once, then referenced afterward, not re-taught
  from scratch on every reappearance.

This self-throttles naturally: unfamiliar territory always gets the full
teaching treatment; familiar territory ships at normal speed. New feature
*ideas* get the same treatment as existing-code lessons — the gate is
"is this pattern new," not "does this code already exist."

**Who builds a "repeat" instance, and why that's still worth having
learned it:** "no lesson needed" isn't "no need for you." The point of
learning a pattern isn't to hand it off to full autonomy — it's to become
someone who can specify it precisely (`"use parseFrac's null-return the way
we did in the matrix reducer"` instead of `"add some validation"`) and
review the result critically, instead of giving a vague ask and rubber-
stamping whatever comes back. For a repeat instance, Claude still writes
the code — fast, no lesson needed — but the user is the one steering and
checking it, which is the actual payoff of having learned the pattern.
Personally hand-typing a repeat instance for deliberate practice is a
separate, legitimate reason (skill-building, not workflow efficiency) —
worth saying explicitly when that's the goal, since it changes whether
Claude writes it or coaches through it.

**The interrupt protocol — what happens when something new comes up
mid-build:** the running inventory of "things the user should know about
this app" lives in `concept-map.md`, in this same folder. Before
introducing any pattern not already on that list, stop at that exact point
in the build and ask: teach it now, or defer? 
- **Teach now** → pause the build, run a full lesson right there (concept
  lab if the pattern is genuinely novel, real code, Definition of Done),
  then resume the build with the user now able to direct/review that piece.
- **No time right now** → keep building, but log the concept in
  `concept-map.md`'s "Pending" section, pointing at the real file/commit
  where it got used, so a lesson can be written afterward — still grounded
  in real code, just retroactively instead of in the moment.

**Writing concept labs inside the app itself, not just scratch files:**
for a concept that's self-contained (general JS/TS logic, an algorithm, a
browser API that doesn't depend on this project's specific build
pipeline), the app's own interactive code tools (e.g. the JS Playground,
TS Lab) are a legitimate place to write and run a concept lab instead of a
disposable file in the real source tree — same disposable-practice
principle, less cleanup. This doesn't work for concepts whose entire point
is this project's specific toolchain (e.g. `import.meta.glob`, which is a
Vite build-time transform — a sandboxed playground can't faithfully
reproduce it, since there's no real bundler behind it). For those, a real
throwaway file in the real repo, run through the real dev server, stays
necessary — anything else would be teaching a simulation of the app
instead of the app itself.

**On mastery — hands-on first, then reconciled against the real thing:**
writing a small, disposable version of a concept alone doesn't produce
mastery, and neither does reading real code alone. The part that actually
builds understanding is the reconciliation step in between: having built
the small version yourself, then reading the real, mature implementation
and explicitly naming *why* it differs — more edge cases, more scale, more
integration with the rest of the system. That comparison is what "Connect
the Pieces" and the CS/SE lenses in every lesson exist to force; it isn't
automatic just from doing both steps back to back.

**On when to start an entirely separate, unrelated project:** don't gate it
behind "finishing" this lesson series or "covering" all of `concept-map.md`.
A codebase this size (15+ games, dozens of courses/labs/tools) never really
reaches "fully covered," so treating that as a prerequisite just
indefinitely delays anything else. Better trigger: start the new thing when
there's an actual reason to (a real idea with its own timeline, or a
recurring gap the lessons haven't covered yet) — pulled by real need, not
pushed by a checklist.
