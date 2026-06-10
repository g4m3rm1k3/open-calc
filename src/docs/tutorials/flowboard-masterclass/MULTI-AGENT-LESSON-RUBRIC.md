# FlowBoard Masterclass — Multi-Agent Lesson Rubric

Last Updated: 2026-05-12

Purpose: You run multiple agents to improve lesson quality. This rubric gives a deterministic merge method so you choose what teaches best, not what reads smoothest.

## Core Principle

Do not rank outputs by polish first. Rank by transfer:
- Can the learner explain the abstraction after the lab?
- Can the learner apply it in a different app?

If not, the lesson is incomplete even if the app feature works.

## Scoring Matrix (0-2 each, max 20)

1. Problem-before-solution evidence
- 0: no failure shown
- 1: failure described but not run
- 2: learner runs naive version and sees failure

2. Define-before-use rigor
- 0: terms used without definition
- 1: most terms defined
- 2: all new terms defined before first use

3. Abstraction clarity
- 0: feature-only explanation
- 1: abstraction named but vague
- 2: explicitly states hide/raw/invariant

4. Transfer outside FlowBoard
- 0: none
- 1: one weak example
- 2: two concrete non-FlowBoard applications

5. Alternative decision quality
- 0: no alternatives named
- 1: alternatives named without tradeoff test
- 2: alternatives tested with concrete reason for choice

6. Verification quality
- 0: no clear checks
- 1: one basic check
- 2: SAVE AND TRY includes visible, console, mutation checks

7. Concept Registry compatibility
- 0: duplicates/reteaches concepts
- 1: partial checks
- 2: no duplicate concept blocks, proper references

8. Step granularity
- 0: multi-concept jumps
- 1: mostly single-concept
- 2: each step is one concept or one feature change

9. Failure-oriented debugging guidance
- 0: no error path
- 1: errors mentioned
- 2: common failure signatures + exact fix path

10. End-state handoff quality
- 0: weak continuity
- 1: summary exists
- 2: next-session startup is unambiguous

## Merge Algorithm for 3+ Agent Outputs

1. Score each output with the matrix above.
2. Select base draft = highest total score.
3. For each category where another draft scores higher, transplant that section into base draft.
4. Re-run scoring once after merge.
5. Final draft must score:
- >= 16/20 overall
- and at least 2/2 on categories 1, 3, 4, and 6.

If any hard category is below 2, do not ship the lab.

## Hard Fail Conditions (auto reject)

Reject any draft if one of these is true:
- Uses undefined terms.
- Introduces abstraction before visible problem.
- Lacks transfer section.
- Missing SAVE AND TRY checkpoints.
- Re-teaches a concept already in Concept Registry as new.

## Practical Session Workflow

When session time is short:
- Ask each agent for different strength areas:
  - Agent A: concept blocks and abstraction rigor
  - Agent B: runnable steps and SAVE AND TRY checks
  - Agent C: debugging/failure clinic and transfer examples
- Merge with this rubric rather than choosing one whole draft.

This keeps your paid sessions focused on maximum learning yield per minute.
