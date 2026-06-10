# FlowBoard Masterclass — Session Usage Plan

Last Updated: 2026-05-12

Goal: Maximize paid session value by producing reusable lesson assets in batches, with no context drift between sessions.

Reference rubric: flowboard-masterclass/MULTI-AGENT-LESSON-RUBRIC.md
Current continuation checkpoint: flowboard-masterclass/ABSTRACTION-FIRST-RESET.md

## Rules

- Never start a session with open-ended planning.
- Always start from one curriculum row, one saved checkpoint, and the current app state ledger.
- Prefer single-lab completion with verified code continuity over batch output.
- A session is successful only if files are created or updated.

## Session Input Packet (paste at start)

1. Current lab row from FLOWBOARD-CURRICULUM.md
2. Last SAVE AND TRY output
3. Concept Registry snapshot
4. Last amendment log entries (if any)
5. APP-STATE-CANON snapshot (current file/component/class/data shape)

## Output Requirements Per Session

Minimum output target per session:
- 1 full lab written end-to-end with verified continuity from previous lab
- APP-STATE-CANON updated to match actual code after the lab
- Registry/spec updates completed

A lab is counted complete only when all are present:
- Full lab file with runnable steps
- Baseline Lock Snapshot + Translation Map filled from real code
- Delta Plan (only changed files listed)
- SAVE AND TRY checkpoints in each behavior step
- Final Check table
- End State Summary
- Concept Registry update
- Master checklist update
- Abstraction Transfer Check block
- Rubric score >= 16/20 with required categories passing (see rubric)

## Canonical State Workflow (Required)

Source of truth files:
- flowboard-masterclass/APP-STATE-CANON.md
- latest End State Summary in current lab file

Execution model:
1. Lock baseline from APP-STATE-CANON.md.
2. Write a delta-only plan (which files change and why).
3. Apply changes in small steps with SAVE AND TRY after each behavior change.
4. Resolve conflicts by adapting snippets to baseline names/interfaces.
5. Update APP-STATE-CANON.md after lab completion.

Hard rule:
- Never replace working learner structure with tutorial naming by default.

## Delivery Cadence

One-lab cadence:
- Complete one lab.
- Verify end state.
- Update APP-STATE-CANON.
- Start next lab only after continuity is confirmed.

## Drift Prevention Checklist

Before writing any lab:
- Confirm prerequisites match End State Summary from previous lab.
- Confirm prerequisites match APP-STATE-CANON current state.
- Confirm concepts are not duplicated from Concept Registry.
- Confirm one clear feature outcome.

After writing any lab:
- Update Concept Registry.
- Update curriculum status to IN PROGRESS or LOCKED.
- Update APP-STATE-CANON with exact current code shape.
- Record curriculum or scope changes in Amendment Log.

## If Time Runs Out Mid-Lab

Write a checkpoint block at end of file:
- Last completed step number
- Last working SAVE AND TRY result
- Next exact step to continue
- Known errors and current hypothesis

This checkpoint is mandatory and makes next session startup under 2 minutes.

## Multi-Agent Consolidation Protocol

When using multiple agents for one lab:
- Do not pick a winner by style.
- Score each output using MULTI-AGENT-LESSON-RUBRIC.md.
- Merge highest scoring sections into one final draft.
- Reject drafts with hard-fail conditions from the rubric.

This prevents polished but shallow feature-first lessons from being accepted.
