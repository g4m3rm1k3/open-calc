---
concept: 154-merging
name: Merging
---

## Definition

Merging combines the changes from two divergent branches back into one,
creating a new "merge commit" that has BOTH branches' histories as its
parents, integrating their changes into a single unified line going
forward.

## Problem

After branches diverge (see Branching) and each accumulates its own
commits, the work done on a feature branch eventually needs to become
part of main — merging brings both histories together, applying the
feature branch's changes on top of main, without losing either branch's
commit history.

## Execution

main is at C3 (with a typo fix); feature is at C2 (with a login form
added); both diverged from shared ancestor C1
↓
Merge feature into main
↓
Git finds the common ancestor (C1), then combines the changes made on
EACH side since then
↓
A new merge commit C4 is created, with TWO parents: C3 and C2 —
recording that this commit brings both histories together
↓
main now points at C4 — it contains both the typo fix AND the login form
change

## Computer Science

A merge commit is exactly what makes the commit history a directed graph
rather than a simple straight line — most commits have exactly one
parent, but a merge commit has two (or more), recording the actual point
where separate lines of history were combined back together.

Tags: DAG (directed acyclic graph), Merge commits, Common ancestor, Three-way merge

## Software Engineering

Git determines what changed on each side by comparing both branches
against their common ancestor (a "three-way merge") — this is what lets
it automatically combine non-overlapping changes without any help, and is
exactly why merge conflicts (see Merge Conflicts) only happen specifically
when BOTH sides changed the very same lines.

Tags: Three-way merge, Automatic merging, Merge conflicts

## Common Mistakes

- Assuming a merge always requires manual conflict resolution — most merges combine cleanly and automatically, since real conflicts only happen when both branches changed the exact same lines; that's the exception, not the rule.
- Merging a very stale branch that hasn't incorporated main's recent changes in a long time — the longer the divergence, the more likely (and larger) any eventual conflicts become.

## Exercises

- Trace through the merge example above and explain specifically why C4 has TWO parents instead of one, unlike every other commit shown.
- Explain what the "common ancestor" is for two branches that have never been merged before, and why git needs to find it before it can merge.

## javascript

```javascript
// Extending the branch simulation with a merge operation that creates a
// two-parent merge commit, combining both branches' changes.
class Repo {
  #commits = { C1: { parents: [], message: 'initial', changes: {} } }
  #branches = { main: 'C1' }
  #nextId = 2

  createBranch(name, from) { this.#branches[name] = this.#branches[from] }

  commit(branch, message, changes) {
    const id = `C${this.#nextId++}`
    this.#commits[id] = { parents: [this.#branches[branch]], message, changes }
    this.#branches[branch] = id
    return id
  }

  merge(into, from) {
    const id = `C${this.#nextId++}`
    // combine the changes accumulated on EACH side since they diverged
    const combined = { ...this.#commits[this.#branches[into]].changes, ...this.#commits[this.#branches[from]].changes }
    this.#commits[id] = { parents: [this.#branches[into], this.#branches[from]], message: `merge ${from} into ${into}`, changes: combined }
    this.#branches[into] = id
    return id
  }

  head(branch) { return this.#branches[branch] }
  parentsOf(commitId) { return this.#commits[commitId].parents }
}

const repo = new Repo()
repo.createBranch('feature', 'main')
repo.commit('feature', 'add login form', { login: true })
repo.commit('main', 'fix typo', { typo: 'fixed' })

const mergeCommit = repo.merge('main', 'feature')
console.log(repo.head('main'))              // C4 -- main now points at the new merge commit
console.log(repo.parentsOf(mergeCommit))    // [ 'C3', 'C2' ] -- TWO parents, recording both branches being combined
```
Walkthrough: `merge` creates a new commit whose `parents` array has BOTH
`C3` (main's tip) and `C2` (feature's tip) — the only kind of commit in
this simulation with two parents, exactly matching how a real merge
commit records that two separate lines of history were combined at that
point.

## python

```python
class Repo:
    def __init__(self):
        self._commits = {'C1': {'parents': [], 'message': 'initial', 'changes': {}}}
        self._branches = {'main': 'C1'}
        self._next_id = 2

    def create_branch(self, name, from_branch):
        self._branches[name] = self._branches[from_branch]

    def commit(self, branch, message, changes):
        commit_id = f'C{self._next_id}'
        self._next_id += 1
        self._commits[commit_id] = {'parents': [self._branches[branch]], 'message': message, 'changes': changes}
        self._branches[branch] = commit_id
        return commit_id

    def merge(self, into, from_branch):
        commit_id = f'C{self._next_id}'
        self._next_id += 1
        combined = {**self._commits[self._branches[into]]['changes'], **self._commits[self._branches[from_branch]]['changes']}
        self._commits[commit_id] = {
            'parents': [self._branches[into], self._branches[from_branch]],
            'message': f'merge {from_branch} into {into}',
            'changes': combined,
        }
        self._branches[into] = commit_id
        return commit_id

    def head(self, branch):
        return self._branches[branch]

    def parents_of(self, commit_id):
        return self._commits[commit_id]['parents']


repo = Repo()
repo.create_branch('feature', 'main')
repo.commit('feature', 'add login form', {'login': True})
repo.commit('main', 'fix typo', {'typo': 'fixed'})

merge_commit = repo.merge('main', 'feature')
print(repo.head('main'))            # C4 -- main now points at the new merge commit
print(repo.parents_of(merge_commit))  # ['C3', 'C2'] -- TWO parents, recording both branches being combined
```
Walkthrough: identical two-parent merge-commit mechanics as the
JavaScript version — the merge commit's `parents` list records both
branches' tips, marking exactly where the two histories were combined.
