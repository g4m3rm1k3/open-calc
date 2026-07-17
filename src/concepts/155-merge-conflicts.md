---
concept: 155-merge-conflicts
name: Merge Conflicts
---

## Definition

A merge conflict occurs when two branches being merged have both changed
the SAME lines of the same file in DIFFERENT ways — git can't
automatically decide which version is correct, so it stops and asks a
human to resolve the conflict manually.

## Problem

Git's automatic three-way merge (see Merging) works by comparing both
branches against their common ancestor and combining non-overlapping
changes — but if BOTH branches changed the exact same line differently,
there's no automatic way to know which change should "win," or whether
both should somehow be combined. Git marks the conflicting section and
pauses, requiring a person to decide.

## Execution

Common ancestor: a line reads "Hello"
↓
Branch A changes the line to "Hello there"
↓
Branch B changes the SAME line to "Hi"
↓
Merging A into B: git sees both sides changed the identical line
differently — CONFLICT
↓
Git inserts conflict markers into the file showing BOTH versions, and
pauses the merge
↓
A person edits the file to resolve it (pick one version, combine them, or
write something new), removes the conflict markers, and commits the
resolution — completing the merge

## Computer Science

A conflict is specifically the case where a three-way merge's automatic
combining logic breaks down — it can detect "both sides touched this
exact region" but has no way to know the SEMANTIC intent of either
change, which is exactly the judgment call only a human (who understands
what the code is supposed to do) can make.

Tags: Three-way merge, Conflict markers, Semantic intent

## Software Engineering

Frequent, small merges (integrating main into a feature branch often,
rather than letting it diverge for weeks) keep conflicts small and
manageable — a conflict between two lines changed yesterday is far easier
to resolve correctly than one between changes made weeks apart, since the
context is fresher and the number of touched lines is smaller.

Tags: Frequent integration, Conflict size, Divergence management

## Common Mistakes

- Resolving a conflict by blindly picking "my" version or "their" version without actually reading what each side intended to change — this can silently discard a real bug fix or feature from the other branch.
- Forgetting to remove the conflict markers themselves after resolving — leaving them in accidentally commits literal conflict-marker text as if it were real code.

## Exercises

- Trace through the example above: what would happen instead if Branch A changed one line and Branch B changed a COMPLETELY DIFFERENT line in the same file — would that still be a conflict?
- Explain why merging frequently (small, regular merges) tends to produce smaller, easier-to-resolve conflicts than merging rarely (long-lived, heavily diverged branches).

## javascript

```javascript
// Simulating conflict detection directly: comparing both branches against
// their common ancestor to decide whether a merge is clean or conflicting.
function threeWayMerge(ancestorLine, branchALine, branchBLine) {
  const aChanged = branchALine !== ancestorLine
  const bChanged = branchBLine !== ancestorLine

  if (aChanged && bChanged && branchALine !== branchBLine) {
    // both sides changed the SAME line differently -- can't auto-resolve
    return { conflict: true, markers: `<<<<<<< A\n${branchALine}\n=======\n${branchBLine}\n>>>>>>> B` }
  }
  if (aChanged) return { conflict: false, result: branchALine }   // only A changed it -- take A's version
  if (bChanged) return { conflict: false, result: branchBLine }   // only B changed it -- take B's version
  return { conflict: false, result: ancestorLine }                // neither changed it
}

console.log(threeWayMerge('Hello', 'Hello there', 'Hi'))        // { conflict: true, markers: '...' } -- both changed it differently
console.log(threeWayMerge('Hello', 'Hello there', 'Hello'))     // { conflict: false, result: 'Hello there' } -- only A changed it, clean merge
```
Walkthrough: the first call has BOTH `branchALine` and `branchBLine`
differing from the shared ancestor `'Hello'`, AND from each other — this
triggers `conflict: true`, since there's no automatic way to know which
change should win. The second call has only `branchALine` differing from
the ancestor (`branchBLine` matches the ancestor unchanged), so the merge
resolves cleanly by taking A's version, with no conflict at all.

## python

```python
def three_way_merge(ancestor_line, branch_a_line, branch_b_line):
    a_changed = branch_a_line != ancestor_line
    b_changed = branch_b_line != ancestor_line

    if a_changed and b_changed and branch_a_line != branch_b_line:
        # both sides changed the SAME line differently -- can't auto-resolve
        return {'conflict': True, 'markers': f'<<<<<<< A\n{branch_a_line}\n=======\n{branch_b_line}\n>>>>>>> B'}
    if a_changed:
        return {'conflict': False, 'result': branch_a_line}   # only A changed it -- take A's version
    if b_changed:
        return {'conflict': False, 'result': branch_b_line}   # only B changed it -- take B's version
    return {'conflict': False, 'result': ancestor_line}        # neither changed it


print(three_way_merge('Hello', 'Hello there', 'Hi'))        # {'conflict': True, 'markers': '...'} -- both changed it differently
print(three_way_merge('Hello', 'Hello there', 'Hello'))     # {'conflict': False, 'result': 'Hello there'} -- only A changed it, clean merge
```
Walkthrough: identical three-way-comparison logic as the JavaScript
version — a conflict is flagged only when both sides diverge from the
ancestor AND from each other; otherwise the non-conflicting side's change
(or the unchanged ancestor) is taken automatically.
