# SE Masterclass — LAB-103 — Capstone Review

**Prerequisites:** LAB-102 (Capstone Build)

## Quick Check

Before starting, answer these (answers at the bottom):

1. Why is reviewing your own finished system a different skill than building it?
2. What's the difference between "a trade-off that turned out fine" and "a trade-off you'd make differently next time" — and why do both deserve to be written down?
3. Why does "what would I study next" belong at the end of a 103-lab curriculum instead of feeling like an admission the curriculum was incomplete?

## What You Will Produce

A written review of Riverbed (LAB-101/102) covering three things: which of LAB-101's trade-offs held up under real implementation versus which you'd revisit, concrete extension ideas the current design could support, and a reflection on which abstractions from across all nine phases actually transferred cleanly into this capstone versus which needed real rework to fit.

```
Trade-off review:
  ✓ SQLite transaction for claim-locking (LAB-101 row 3) -- held up, zero races observed
  ✗ Polling-based worker pickup (LAB-101 row 3, alt considered) -- 500ms poll adds
    real latency under light load; a push-based queue (LAB-93 IPC) would remove it

Extension ideas:
  - Retry policy for failed steps (reuses LAB-97's restart-count circuit breaker directly)
  - Multi-machine workers (LAB-93's Unix socket becomes a real network socket)

What transferred cleanly vs. what needed rework:
  ✓ LAB-74's ECS -- ported into the worker pool with almost no modification
  ✗ LAB-32's signals -- needed adaptation; the dashboard's data arrives from TWO sources
    (REST + WebSocket) where LAB-32's examples only ever had one
```

## Concept: Engineering Reflection — Learning From Your Own Decisions

**What it is:** Reflection, done properly, isn't "what went wrong" — it's a structured comparison between what you *predicted* (LAB-101's trade-off table, written before any code existed) and what you *observed* (LAB-102's actual implementation experience). Every row in LAB-101's trade-off table was a hypothesis; LAB-102 was the experiment; this lab is where you check the hypothesis against the result, honestly, including the ones that turned out to be exactly right.

**The problem before:** Nothing in Phases 1–8 asked you to look backward at your own design decisions with real implementation experience in hand — each lab's Final Check tested understanding of that lab's concept, not "would you architect it differently now that you've built it." A capstone is exactly the scale where architectural decisions have consequences that only become visible through actually living with them: a trade-off that looked reasonable on paper (LAB-101's "poll the database every 500ms" instead of a push-based queue) reveals its real cost — or its real fine-ness — only once real latency is something you can actually observe (LAB-102's dashboard visibly lagging, or not).

**The solution:** Go back through LAB-101's trade-off table row by row and, for each one, write down what actually happened — did the predicted benefit materialize? Did the accepted downside turn out to matter, or not? Then look forward: what would extending this system reveal about its current design's flexibility? And look across the *whole* curriculum: which specific abstractions (name the lab) ported into this capstone with no friction, and which needed real adaptation — because that's the most concrete, checkable evidence of which lessons in this curriculum actually taught something durable versus something narrowly specific to its original context.

**Canonical example:**

```markdown
## Trade-off: Worker execution as separate OS processes (LAB-101, row 1)
Predicted: real isolation, a crashing task can't take down the API server.
Observed:  confirmed -- deliberately made a step's command exit(1) mid-task;
           API server and dashboard stayed fully responsive throughout.
Verdict:   keep. The isolation cost (process spawn overhead per step) was
           negligible for this workload; would reconsider only at very high
           step-execution-frequency.
```

**Project Application:** This lab has no downstream lab — it's the last one in the curriculum. Its "project application" is you: the specific, concrete judgments you write here about what transferred and what didn't are the most honest signal available for what to actually reach for first the next time you're designing a system, and what to treat with more skepticism.

**Watch for:** Writing this review before actually re-reading LAB-101's original trade-off table. Reviewing from memory instead of against the written predictions defeats the entire point — the value is in comparing the *actual original prediction* against what happened, not a reconstructed, hindsight-biased memory of what you probably would have predicted.

## Step 1: Revisit every trade-off from LAB-101, one at a time

```markdown
## Trade-off: [copy the exact row from LAB-101's table]
Predicted: [what LAB-101 said would happen]
Observed:  [what actually happened during LAB-102 -- be specific: what did you
            do to test it, what did you see]
Verdict:   [keep / reconsider / would change -- and why, in one sentence]
```

Do this for every single row in LAB-101 Step 4's table, plus the sixth row you added in that lab's SAVE AND TRY. This is deliberately mechanical and exhaustive — the value isn't in a clever synthesis, it's in the discipline of checking every prediction against reality, including the boring ones that turned out exactly as expected, which are just as informative as the surprising ones (a correct prediction confirms the reasoning behind it was sound, not just lucky).

### SAVE AND TRY

Before writing anything, physically reopen LAB-101 and read Step 4's trade-off table fresh, without trying to remember it first. Compare your fresh reading against what you *thought* the table said — if there's any gap, that gap itself is worth noting: it's a small, concrete example of how memory of a decision drifts from the decision as actually written down, which is part of why LAB-101 insisted on writing it down at all.

## Step 2: Extension ideas — testing the design's flexibility on paper

```markdown
## Extension: Retry policy for failed steps
What it needs: a `retryCount` column on `steps`, a check in the worker pool's
failure-handling path (LAB-102's Challenge) that re-queues instead of marking
failed if `retryCount < maxRetries`.
Does the current design support this cleanly? Yes -- this is nearly identical
to LAB-97's restart-count circuit breaker, just applied to a step instead of
a whole process. No architectural change needed, only new columns and a
conditional.

## Extension: Multi-machine workers
What it needs: workers running on separate physical machines, not just
separate processes on one machine.
Does the current design support this cleanly? Partially -- SQLite (LAB-56)
assumes a single local file; a genuinely multi-machine deployment would need
a network-accessible database (a real trade-off LAB-101 didn't originally
surface, since it assumed single-machine deployment implicitly).
```

Extension ideas are a design-quality test performed *without writing any new code* — for each proposed extension, ask "does the current architecture make this a small, local change, or does it reveal a boundary drawn in the wrong place?" A design that only supports the exact features originally built, and resists anything new, is brittle in a way that wasn't visible from the inside during LAB-102; extension analysis is how that brittleness (or its absence) becomes visible without the cost of actually building the extension.

### SAVE AND TRY

Propose one extension idea of your own — something LAB-101/102 never mentioned — and honestly answer whether Riverbed's current five-layer design supports it cleanly or would require restructuring a layer boundary. If it requires restructuring, name *which* layer's responsibility (LAB-101 Step 1) was drawn too narrowly or too broadly to accommodate it.

## Step 3: What transferred cleanly across the whole curriculum, and what didn't

```markdown
## Transferred cleanly: LAB-74's ECS architecture
Used in: the worker pool (LAB-102 Layer 4).
Why it worked with no friction: task execution genuinely IS a compositional
problem -- a task entity's "traits" (has a step queue, is currently
executing, has failed and is blocked) map directly onto ECS components,
exactly the kind of orthogonal-traits problem LAB-74 designed ECS to solve.

## Needed real adaptation: LAB-32's signals
Used in: the dashboard (LAB-102 Layer 5).
Why it needed rework: LAB-32's original examples always had ONE source of
truth updating a signal. The dashboard has TWO -- an initial REST fetch and
an ongoing WebSocket stream -- and merging updates from both into one
signal's state required logic LAB-32 never had to teach, because its
examples never had two independent update sources for the same state.
```

This is the most honest, most useful artifact this entire curriculum can produce about itself: a direct, checkable record of which lessons generalized (ECS: yes, cleanly) and which needed genuine extension beyond what was taught (signals with multiple update sources: partially). Neither outcome is a failure of the original lab — LAB-32 taught signals correctly for the scope it covered; the capstone simply exercised a scenario slightly outside that scope, which is exactly the kind of gap only a real integration project this size can surface.

### SAVE AND TRY

Pick three more labs from anywhere in Phases 1–8 whose techniques you reused somewhere in LAB-102, and write one line each on whether they transferred with no friction or needed adaptation — deliberately choose at least one from an early phase (1–3) and one from a late phase (7–8), to see whether "how recently you learned it" has any relationship to "how cleanly it transferred," or whether that's not actually the deciding factor.

## Step 4: The honest final assessment

```markdown
## If I rebuilt Riverbed from scratch today, knowing what LAB-102 taught me:
[Write 3-5 sentences. Be specific: name actual layers, actual labs, actual
trade-offs. This is not a place for "it went well" -- it's a place for the
one or two decisions you'd genuinely make differently, and why, now that you
have real implementation evidence instead of only LAB-101's predictions.]

## What I'd study next, and why:
[Name something concretely outside this curriculum's 103 labs -- a specific
technology, pattern, or subfield -- and connect it to a specific gap or
curiosity this capstone exposed. Not "everything," not vague. One or two
concrete next steps.]
```

This is deliberately the last thing this lab — and this entire curriculum — asks you to write. "What I'd study next" belongs here, at the end, not because 103 labs left something incomplete, but because a curriculum's real job is to leave you able to correctly identify your *next* gap yourself, rather than needing lab 104 to tell you. That capability — knowing what you don't yet know, specifically enough to go find out — is the actual, final skill this whole masterclass has been building toward.

### SAVE AND TRY

Write both sections above for real, right now, about your actual Riverbed implementation — not a hypothetical one. If you genuinely can't name a concrete "what I'd study next," that's worth sitting with honestly: it likely means the reflection in Steps 1–3 wasn't specific enough yet to expose a real edge of your current understanding — go back and add more concrete detail to one of them.

## 🎯 Challenge

Take one of Step 1's "reconsider" or "would change" verdicts and actually prototype the alternative — for example, if you flagged database polling as a latency cost worth reconsidering, spend an hour building a LAB-93-style Unix-socket push notification from the API server to the worker pool instead, and measure whether it actually reduces observed latency, or whether the added complexity wasn't worth what turned out to be a small, unmeasurable improvement.

<details>
<summary>Solution</summary>

There's no single "solution" here — this challenge is intentionally open, matching the spirit of the rest of this curriculum's capstone: the value is in the act of testing a reconsidered trade-off against real measurement (LAB-08's benchmark-don't-guess instinct, one final time), not in arriving at a predetermined correct answer. A genuinely useful way to structure the attempt:

1. Measure current latency: time from a task becoming `queued` to a worker actually claiming it, averaged over 20 submissions, under the existing 500ms poll.
2. Build the alternative: a Unix socket (LAB-93 Step 3) the API server writes to on task submission, which the worker pool listens on instead of polling.
3. Measure the same latency metric again under the new mechanism.
4. Write the comparison down, in the same "predicted / observed / verdict" format as Step 1 — including the cost side (implementation complexity, new failure modes a socket-based approach introduces that polling didn't have) not just the latency win.

Whichever way the numbers land, the exercise itself is the point: turning a design-review opinion into a measured, falsifiable comparison is the single most transferable habit this entire 103-lab curriculum has been building toward, one lab at a time, since LAB-08 first introduced "benchmark it, don't guess."

</details>

## Mental Model

| Concept | Wrong instinct | Correct instinct |
|---|---|---|
| Reviewing your own system | Summarize what it does | Compare original predictions against real outcomes |
| A trade-off that held up | Not worth mentioning | Just as informative as one that didn't — confirms the reasoning was sound |
| Extension ideas | A wishlist | A test of the design's flexibility, done on paper |
| "What to study next" | A sign the curriculum was incomplete | The actual final skill the curriculum was building toward |

## Final Check

| # | Question | Your answer |
|---|---|---|
| 1 | Why must Step 1's review be done against the actual written LAB-101 table, not memory of it? | |
| 2 | What does an extension idea that "doesn't fit cleanly" reveal about the design that building the original system didn't? | |
| 3 | Why is naming a concrete "what to study next" more valuable than a vague one? | |

## Quick Check Answers

1. Building requires generating a working solution under real constraints; reviewing requires evaluating your own already-made decisions with hindsight and evidence you didn't have while building — the two pull on different judgment, one forward-looking and generative, the other backward-looking and evaluative.
2. A trade-off that "turned out fine" confirms the original reasoning was sound and worth trusting again in similar situations; a trade-off you'd change is just as valuable to record, because it identifies specifically what evidence or experience was missing at design time — both are real data, not just the second category.
3. Because a curriculum's deepest goal isn't covering every possible topic — it's building the skill of accurately locating your own current edge of understanding, specific enough to go investigate it — which is precisely what building and critically reviewing one large, real system, rather than reading about many small ones, is positioned to reveal.

## Curriculum Complete

This closes the SE Masterclass: 103 labs across 9 phases, from LAB-01's variables and memory model through this capstone's full-stack distributed system. Every phase built toward this one — the DSL techniques from Phase 7, the persistence patterns from Phase 5, the reactive UI patterns from Phase 3, the process/concurrency model from Phase 8, the ECS architecture from Phase 6, all converged into one real, working system, then critically reviewed rather than just shipped and forgotten. The specific technologies used throughout will age; the underlying instincts — decompose before you build, measure before you optimize, write contracts before you integrate, and review your own decisions honestly once you have evidence — are what this curriculum was actually teaching the whole time.
