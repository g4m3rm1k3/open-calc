# Bug & Suggestion → Lesson Contract

This is [`LESSON_CONTRACT.md`](LESSON_CONTRACT.md) — the real one, adapted below only where it
names the Cammastah/C# project specifically, since a bug or suggestion here isn't from that
project. Every rule, every standard, every checklist item carries over unchanged. This is not a
thinner version. Nothing below is softened, shortened, or optional.

A lesson produced from this document that only describes a fix or hands over a file to add has
not met this contract. That is documentation, not teaching — see "The Difference Between
Describing and Teaching" below.

---

## The bug or feature is the laboratory, not the goal

This is the single most important rule for this use case, and the one most likely to get missed:
**the specific bug or feature is not what the lesson is for.** It's the concrete situation that
puts the learner in a position where some real engineering or CS idea *has* to come up — not
because a curriculum scheduled it, but because this real, reported thing needed it.

A lesson that only explains how to fix *this* bug or build *this* feature has not succeeded, no
matter how clearly it's written — because that lesson becomes worthless the moment the bug is
fixed or the feature ships. Nobody will ever need to fix this exact, already-fixed bug again.

Every lesson here is a **case study**, and must be introduced as one. Not "today we add a help
button to mobile" — "today we study how this app controls what's visible at which screen size;
our case study is adding a help button to mobile." State the engineering idea before the feature
name. The feature is disposable. The idea is not.

---

## The Silent Knowledge Problem

Tutorials have a structural flaw: they teach the topic and skip everything around it. A learner
who fixes a bug but doesn't know what the terminal command they ran actually did, or why the fix
lives in the file it lives in, has absorbed nothing that transfers to the next bug.

**If something appears in the lesson — regardless of what domain it comes from — it is taught at
the moment it appears.** No concept earns a pass by being "obvious," "just tooling," or "not the
point of this lesson." A terminal command is not "just how you run things." A prop being passed
down three components is not "just how React works." These are concepts with reasons, and they
are taught the same way the actual bug's root cause is taught: from first principles, at the
moment they appear, why before what.

First use, then assume: explain a concept fully once. After that, reference it by name.

---

## The Difference Between Describing and Teaching

A description tells you what something does. A lesson explains why it works, what it connects
to, and what breaks without it.

**Description:** The bug was that `useEffect` didn't have `userId` in its dependency array, so
it ran stale.

**Teaching:** React re-runs an effect only when a value in its dependency array changes between
renders. `userId` was read inside the effect but left out of the array, so React had no way to
know the effect depended on it — from React's point of view, nothing it was watching had
changed, so it never re-ran. This is the same closure-over-stale-value problem that shows up
anywhere a callback captures a variable and is expected to see it change later without being
told to re-subscribe.

The test: could the learner explain not just what the fix does, but why it was broken and what
else in this codebase could break the same way?

---

## The Two Lenses

Every non-trivial piece of code in the lesson is explained through two lenses.

**The CS lens** — What is this computationally? Name the concept: closure, hash lookup,
recursion, event loop, race condition, memoization. Do not leave a concept implicit.

**The SE lens** — How does this fit the system? Name the principle: separation of concerns,
single responsibility, prop drilling vs. context, controlled vs. uncontrolled component. Explain
why the decision was made, not just what it is.

Both lenses apply to every significant piece of code involved in the fix or feature. Neither is
optional.

---

## Concept Labs

Before a construct or pattern the learner hasn't seen is used in the real fix or feature, it
gets an isolated, disposable demonstration first — stripped of every surrounding complexity from
this codebase.

**The shape of a concept lab:**
1. Invent a disposable example — a name and context that means nothing and won't appear in the
   real code. Never reuse this app's actual component/variable names for a lab.
2. Write the smallest runnable snippet that demonstrates the concept. A handful of lines.
3. State exactly what to run (or trace) and what output to expect.
4. State what that output proves about the concept.
5. Say explicitly that this snippet is disposable and won't appear in the real fix.
6. Only then show the real code, and name the connection directly: "this is the same closure
   behavior you just saw, now happening inside the actual `useEffect` that broke."

Not every bug needs a concept lab — only constructs the learner may not already know. Use
judgment; the point is isolating the unfamiliar part before it's tangled up with this app's
specific complexity, not padding the lesson.

---

## Code Standards

**Break to the smallest runnable unit.** Do not present the whole fix and then explain it. Build
it piece by piece; each piece explained before the next appears.

**No code is in a bubble.** Every snippet connects to something explicit: "this is the state
variable from the component above," "this is the file the bug report pointed at."

**Names are always descriptive.** No single-letter variables, no unexplained abbreviations. If a
name needs a comment to make sense, it's a bad name.

**Comments explain the non-obvious.** Never restate the code. A comment that could be deleted
without losing understanding should be deleted.

---

## Explanation Standards

**Explain before you show.** Structure for every significant piece of code:
1. **The problem** — what are we solving right now?
2. **The code** — the smallest piece that solves it
3. **The walkthrough** — what it actually does, mechanically, when it runs
4. **The CS explanation** — what concept does this embody?
5. **The SE explanation** — why designed this way, what it connects to?
6. **What breaks without it** — concretely, what goes wrong if this is missing or wrong?

Not every step needs to be long — a sentence is enough when a sentence is enough. All six must
be present for every significant piece of code.

**Walk through the code.** The lenses explain why. The walkthrough explains what, mechanically —
what values come in, what decisions get made, what comes out. A student should be able to trace
the execution in their head after reading it.

**Name the concept.** Don't say "we store it in an object." Say "this is a lookup table — direct
key access, O(1), the standard structure whenever you need name-to-value binding."

**Nothing is assumed.** Every concept the lesson needs is taught in the lesson or briefly
recapped, regardless of whether an earlier lesson covered it. A reader who's never seen this
codebase before must be able to follow it end to end.

---

## Define at Use

Every construct, tool, command, or term that appears for the first time is defined at the exact
point it appears — not in a glossary, not "explained later." After the first definition, use it
freely. This applies to every domain that shows up, not just the code itself: language syntax,
imports (what module, what's imported, why this and not something else), data types and why this
one was chosen, terminal commands (what program, what each flag means, what success/failure
output looks like), tooling (Vite, npm — what it does, what problem it solves), config file
fields actually touched, file/directory structure and why it lives where it does, package
management concepts, git operations, browser/runtime APIs, security (any lesson handling user
input names the threat and shows the safe pattern), debugging (which tool reveals this class of
error, how to read the message), and performance where relevant (hot paths, what's expensive and
why). Only cover the domains that actually appear in this specific fix or feature — the point is
never silently skipping one that did appear, not force-fitting all of them into every lesson.

---

## The Aha Moment & Repetition

When code or a concept from earlier in the lesson (or from this codebase generally) reappears,
name the connection explicitly — one sentence is enough: "this is the same pattern the
`SuggestionBoxButton` modal already uses for its lock-when-signed-out state."

Basic syntax is explained once, then used without comment. Hard concepts — named patterns, SE
principles, CS ideas — are briefly renamed and reconnected every time they reappear, even late in
the lesson.

---

## Maximum Extraction

Every piece of code involved is a teaching opportunity beyond just "this fixes the bug" or "this
builds the feature." If the code embodies more than one concept, teach more than one. If an
engineering decision was made, explain it. If the same pattern showed up earlier in this
codebase, name it.

The learner should finish knowing: what was built/fixed, what data structure or pattern was used
and why, the CS lens, the SE lens, what it connects to elsewhere in this codebase, and where this
same idea shows up in software generally.

---

## Connection Standards

**Connect backwards** — state what the lesson builds on ("this file already had X; the bug/
feature touches it because Y").

**Connect forwards** — what does understanding this make possible next.

**Connect to the real world** — name where this exact idea shows up in production software
generally, not just in this app. "This is the same stale-closure problem every framework with a
dependency-array-style effect system has to solve."

**Recognition** — for genuinely hard concepts, list several unrelated places the same idea
recurs, not just one. This is what turns "I saw this once" into "I now notice this pattern."

---

## Structure

Every lesson has these six sections, in this order:

1. **What you will build** — one paragraph naming the general concept as a case study, with the
   specific bug/feature as the vehicle. Not just "we fix the mobile help bug."
2. **What you need to know first** — explicit prerequisites (link to the "How to Contribute"
   lessons if this assumes basics like Git or reading an unfamiliar file).
3. **The lesson** — the actual teaching, in smallest-runnable-unit steps, each with a walkthrough
   and both lenses, grounded in this codebase's real code.
4. **Connect the pieces** — after all the code is shown, map it back to the whole system.
5. **What breaks without this** — one concrete failure mode. Show the actual bug, or the actual
   gap the missing feature leaves.
6. **Definition of done** — a checklist the learner verifies themselves, including a git commit
   message in the format taught in the "How to Contribute" lessons.

No YAML frontmatter, no special file format — this is a Markdown document following the
structure above. Where it eventually lives (a blog post, contributor docs, a course lesson) is
the maintainer's call once it exists, not something to guess at up front.

---

## What changes for a bug or suggestion, specifically

1. **The concept isn't chosen in advance — it has to be found.** Before anything above can run,
   determine what the actual root cause is (for a bug) or what the actual design decision is
   (for a suggestion), from real code.
2. **The teacher — the AI reading this — very likely has no file access.** Most contributors
   paste this into a free chat AI (ChatGPT, Claude.ai), not a tool-using coding agent. Getting
   real code in front of it is a short, practical, one-time step, not the task itself:
   - Based on the app context below and the report, name the specific file(s) most likely
     involved and ask the contributor to paste their contents (or a targeted search result).
   - No invented code, ever. A lesson built on code the AI made up teaches the wrong thing,
     silently, and there's no way for anyone reading it later to know that.
   - Once real code is in front of you, this step is done — don't keep collecting files past
     what the lesson actually needs.
3. **The DEMONSTRATE / walkthrough code must be the real, specific fix or feature** — not a
   similar bug, not a generic version of the feature. Grounding is what makes the lesson
   trustworthy. But the *point being taught* — per "The bug or feature is the laboratory, not
   the goal" above — is the general concept the specific case makes concrete. Both are required:
   real code, general lesson. A lesson that's generic in its code has failed. A lesson that never
   rises above "here's what I did for this one bug" has also failed.

---

## Before you start

If you haven't completed the **"How to Contribute"** lessons yet (Help button → Feedback & Bugs
→ "Open the lessons"), do that first — this assumes you can find your way around an unfamiliar
file, read a React component, and know basic Git.

**App orientation:**

UpSkillOS (repo folder name: `open-calc`) is a free, open-source, browser-native STEM learning
platform — React 18 + Vite + Tailwind CSS, Firebase for auth and cross-device sync, no paid
backend.

Where things live: `src/courses/` is the main curriculum (784 lessons, 31 courses) — a JS-object
format, separate from this document. `src/labs/lesson-engine/` is a newer, much smaller runtime
for short code-forward series (Git, CSS, the "How to Contribute" series) — also a different,
narrower format, and not what this document's output should be forced into. `src/components/`,
`src/context/`, `src/hooks/` — shared UI, React context, hooks. `src/pages/` — routed pages,
wired up in `src/App.jsx`.

Local dev: `npm install` then `npm run dev`. `npm run build` before a PR. Workflow: fork, branch
off main, focused changes, PR against `g4m3rm1k3/upskillos`.

---

## Checklist

**Framing**
- [ ] The lesson is introduced as a case study of a general concept, not as "how to fix/build
      this one thing"
- [ ] The general concept is named explicitly, before the specific feature/bug name

**Teaching**
- [ ] Every significant piece of code has a walkthrough, not just lenses
- [ ] Every significant piece of code has both the CS lens and the SE lens
- [ ] No concept is left implicit — every pattern is named
- [ ] No concept is assumed — everything used is explained here
- [ ] "What breaks without this" is concrete, using this bug/feature's real failure mode

**Concept Labs**
- [ ] Every unfamiliar construct gets an isolated lab before appearing in the real code
- [ ] Every lab uses a disposable name, never this app's real identifiers
- [ ] Every lab states what to run/expect and what that proves
- [ ] Every lab is immediately followed by the real code, connection named directly

**Define at Use**
- [ ] Every domain that actually appears (syntax, imports, terminal commands, tooling, config,
      file structure, git, security, debugging) is explained at first appearance in this lesson

**Grounding**
- [ ] Every code example is the real, specific fix or feature — not a generic stand-in
- [ ] The contributor provided the real code; none of it was invented or guessed

**Connection**
- [ ] Connects backwards to what already exists in this codebase
- [ ] Connects forwards to what this makes possible
- [ ] Names at least one real-world production-software connection
- [ ] Hard concepts get a "recognition" list of several other places they recur

**Structure**
- [ ] All six sections present, in order
- [ ] Definition of done is specific and verifiable, including a real git commit message

---

*The test, same as the original: could someone who has never worked on this codebase read this
lesson and explain — in their own words — what the code does, why it's written that way, what it
connects to, and where they'll recognize this concept again? If not, the lesson isn't finished.*
