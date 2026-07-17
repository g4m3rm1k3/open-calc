---
concept: 156-rebasing
name: Rebasing
---

## Definition

Rebasing takes the commits made on one branch and replays them one by one
on top of a DIFFERENT starting point (usually the latest version of
another branch), rewriting history to make it look like that work had
started from there all along — as an alternative to merging, which
instead preserves both branches' history exactly as it happened with a
merge commit.

## Problem

Merging preserves the true, accurate history of when branches diverged
and merged, but that history can become cluttered with many merge
commits, especially if main is merged INTO a feature branch repeatedly to
keep it updated. Rebasing produces a cleaner, LINEAR history instead — as
if the feature branch's commits had been written on top of main's latest
commit from the start — at the cost of literally rewriting commit history
(each replayed commit gets a new identity).

## Execution

main is at C3; feature branched off earlier at C1, and has its own commit
C2
↓
Rebase feature onto main
↓
Git temporarily sets feature's commits aside, moves feature's starting
point to C3 (main's current tip), then REPLAYS C2's changes on top of C3
↓
This produces a NEW commit, C2' — same changes as C2, but with a
different parent (C3 instead of C1) and a different commit hash
↓
feature now points at C2' — its history is now a clean, straight line:
C1 → C3 → C2', with no merge commit and no divergence visible

## Computer Science

Rebasing doesn't literally "move" commits — since a commit's identity
(its hash) is derived partly from its parent, changing the parent
necessarily creates a brand NEW commit with different content, even
though the actual code changes are identical; this is why rebased commits
are considered fundamentally different commits, not the same ones
relocated.

Tags: Commit hashes, Immutable history, Linear history, Replaying commits

## Software Engineering

Never rebase commits that have already been pushed and that OTHER people
might have based their own work on — since rebasing creates new commit
identities, anyone who already has the OLD commits will see a confusing,
diverged history when they pull; rebasing is safe for LOCAL, not-yet-
shared commits, and merging is the safer choice for shared/published
history.

Tags: Rewriting shared history, Force-push risk, Local vs published commits

## Common Mistakes

- Rebasing commits that have already been pushed and pulled by teammates — this creates duplicate, conflicting versions of the same logical changes and typically requires a disruptive force-push that can confuse or break others' work.
- Confusing rebasing with merging as interchangeable — they produce genuinely different history shapes (linear vs. explicit merge commits), and the choice has real consequences for anyone else relying on that history staying stable.

## Exercises

- Trace through the example above and explain specifically why C2' has a different commit hash from C2, even though it represents the exact same code change.
- Explain the specific risk of rebasing a branch that a teammate has already pulled and started building further commits on top of.

## javascript

```javascript
// Simulating rebase as "replay onto a new parent, producing a new commit
// identity" directly, since real commit hashing requires an actual git object model.
function fakeHash(parent, message) {
  // stand-in for git's real content-addressed hash -- changes if the parent changes
  return `hash(${parent}:${message})`
}

const C1 = { id: fakeHash('root', 'initial'), parent: 'root', message: 'initial' }
const C3 = { id: fakeHash(C1.id, 'fix typo'), parent: C1.id, message: 'fix typo' }         // main's tip
const C2 = { id: fakeHash(C1.id, 'add login'), parent: C1.id, message: 'add login' }       // feature's original commit

// Rebase feature onto main: replay C2's CHANGE on top of C3 instead of C1
const C2rebased = { id: fakeHash(C3.id, 'add login'), parent: C3.id, message: 'add login' }

console.log(C2.id)          // hash(hash(root:initial):add login) -- original commit, parented on C1
console.log(C2rebased.id)   // hash(hash(hash(root:initial):fix typo):add login) -- rebased commit, parented on C3
console.log(C2.id === C2rebased.id)   // false -- different parent means a genuinely different commit identity
```
Walkthrough: `C2` and `C2rebased` represent the identical logical change
(`'add login'`), but their `id` differs because each one's hash depends
on its parent — `C2` was built on top of `C1`, while `C2rebased` was
replayed on top of `C3`. This demonstrates concretely why a rebased
commit is a genuinely NEW commit, not the same commit relocated.

## python

```python
def fake_hash(parent, message):
    # stand-in for git's real content-addressed hash -- changes if the parent changes
    return f'hash({parent}:{message})'


c1 = {'id': fake_hash('root', 'initial'), 'parent': 'root', 'message': 'initial'}
c3 = {'id': fake_hash(c1['id'], 'fix typo'), 'parent': c1['id'], 'message': 'fix typo'}          # main's tip
c2 = {'id': fake_hash(c1['id'], 'add login'), 'parent': c1['id'], 'message': 'add login'}        # feature's original commit

# Rebase feature onto main: replay C2's CHANGE on top of C3 instead of C1
c2_rebased = {'id': fake_hash(c3['id'], 'add login'), 'parent': c3['id'], 'message': 'add login'}

print(c2['id'])            # hash(hash(root:initial):add login) -- original commit, parented on C1
print(c2_rebased['id'])    # hash(hash(hash(root:initial):fix typo):add login) -- rebased commit, parented on C3
print(c2['id'] == c2_rebased['id'])   # False -- different parent means a genuinely different commit identity
```
Walkthrough: identical parent-dependent-hash mechanics as the JavaScript
version — the rebased commit's identity differs from the original,
despite representing the same logical change, since each one's hash
incorporates a different parent.
