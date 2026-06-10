# FlowBoard Masterclass - Abstraction-First Reset (No Full Restart)

Last Updated: 2026-05-12

Decision: Do not restart from zero. Keep completed labs, change teaching mode from this point forward.

## Why this is the right reset

A full restart would re-spend time on mechanics already learned. The better move is:
- preserve completed labs as baseline,
- enforce abstraction-first standards for all upcoming labs,
- continue from current checkpoint.

This keeps momentum while fixing the teaching style problem.

## Current Checkpoint

- Labs 00-03: LOCKED
- Lab 04: IN PROGRESS
- Error clinic available: LAB-03A for TypeScript config/import failures

Source of truth: FLOWBOARD-CURRICULUM.md

## New Rule for Every Next Lab

Every lab must follow this sequence:
1. Show the problem in runnable code first.
2. Name the abstraction that solves it.
3. Explain what it hides.
4. State the invariant it protects.
5. Apply abstraction in FlowBoard.
6. Prove transfer to at least two non-FlowBoard contexts.

If any step is missing, lab is not complete.

## Session Startup (Fast)

Paste these at session start:
1. Current curriculum row
2. Last SAVE AND TRY output
3. Concept Registry snapshot
4. Last abstraction transfer check

## What to do now (next lab action)

Continue at Lab 04 completion under abstraction-first format, then move to Lab 05.

For Lab 04 completion, require these transfer examples at minimum:
- Flex column layout for a chat message thread
- Flex column layout for an email list panel

## Anti-Regression Rule

If a draft reads like "build this feature" without explicit abstraction transfer, reject and rewrite.

Use MULTI-AGENT-LESSON-RUBRIC.md threshold before accepting any new lab.
