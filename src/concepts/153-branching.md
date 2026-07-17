---
concept: 153-branching
name: Branching
---

## Definition

A branch is an independent line of development within a repository — a
movable pointer to a specific commit, letting you work on new changes (a
feature, a fix) without affecting the main line of history until you're
ready to bring them together.

## Problem

Working directly on the main line of history means every half-finished
change is immediately mixed in with the stable, working code — if two
people work simultaneously, or if an experiment doesn't work out, there's
no clean way to isolate that work. Branching lets each line of work
develop independently, diverging from a shared starting point, and only
merged back in when it's ready.

## Execution

main branch points at commit C1
↓
Create branch "feature" — it ALSO points at C1 initially (same starting
point, same history so far)
↓
Commit C2 is made while on "feature" — "feature" now points at C2, but
"main" STILL points at C1, unaffected
↓
Meanwhile, a commit C3 is made directly on "main" — main now points at C3
↓
"main" and "feature" have now DIVERGED — they share the same history up
through C1, but each has commits the other doesn't

## Computer Science

A branch is really just a lightweight, movable reference (a pointer) to a
commit — creating one is nearly instant regardless of repository size,
since it doesn't copy any files or history, it just adds a new named
pointer into the existing commit graph.

Tags: Commit graph, Pointers, Divergent history, DAG (directed acyclic graph)

## Software Engineering

A common workflow keeps `main` always in a deployable, working state,
with all new work happening on separate feature branches that are only
merged in once reviewed and tested — this isolates in-progress,
potentially-broken work from the branch other people (or a deploy
pipeline) rely on being stable.

Tags: Feature branches, Trunk-based development, Code review workflow

## Common Mistakes

- Making large, long-lived branches that diverge heavily from main before merging — the longer a branch lives separately, the more likely it is to conflict significantly with changes made to main in the meantime.
- Forgetting which branch you're currently on and committing new work to the wrong one — always check the current branch before starting new work.

## Exercises

- Trace through the example above: after C2 and C3 both exist, what commit(s) would `main` and `feature` each show if you asked each branch for its own history?
- Explain why creating a new branch is fast even in a repository with thousands of commits — what does creating a branch actually do under the hood?

## javascript

```javascript
// Simulating a minimal commit graph and branch pointers directly, since a
// real git repository requires an actual git binary and filesystem.
class Repo {
  #commits = { C1: { parent: null, message: 'initial' } }
  #branches = { main: 'C1' }
  #nextId = 2

  createBranch(name, from) {
    this.#branches[name] = this.#branches[from]   // new pointer, same commit -- no copying involved
  }

  commit(branch, message) {
    const id = `C${this.#nextId++}`
    this.#commits[id] = { parent: this.#branches[branch], message }
    this.#branches[branch] = id
  }

  head(branch) { return this.#branches[branch] }
}

const repo = new Repo()
repo.createBranch('feature', 'main')
console.log(repo.head('main'), repo.head('feature'))   // C1 C1 -- both point at the same starting commit

repo.commit('feature', 'add login form')
repo.commit('main', 'fix typo in README')

console.log(repo.head('main'))      // C3 -- main advanced independently
console.log(repo.head('feature'))   // C2 -- feature advanced independently -- they've now DIVERGED
```
Walkthrough: right after `createBranch`, both `main` and `feature` point
at the identical commit `C1`. Committing separately on each branch moves
each branch's pointer independently — `feature` advances to `C2` while
`main` advances to `C3`, with neither branch's commits appearing on the
other, demonstrating how branches diverge from a shared starting point.

## python

```python
class Repo:
    def __init__(self):
        self._commits = {'C1': {'parent': None, 'message': 'initial'}}
        self._branches = {'main': 'C1'}
        self._next_id = 2

    def create_branch(self, name, from_branch):
        self._branches[name] = self._branches[from_branch]   # new pointer, same commit -- no copying involved

    def commit(self, branch, message):
        commit_id = f'C{self._next_id}'
        self._next_id += 1
        self._commits[commit_id] = {'parent': self._branches[branch], 'message': message}
        self._branches[branch] = commit_id

    def head(self, branch):
        return self._branches[branch]


repo = Repo()
repo.create_branch('feature', 'main')
print(repo.head('main'), repo.head('feature'))   # C1 C1 -- both point at the same starting commit

repo.commit('feature', 'add login form')
repo.commit('main', 'fix typo in README')

print(repo.head('main'))      # C3 -- main advanced independently
print(repo.head('feature'))   # C2 -- feature advanced independently -- they've now DIVERGED
```
Walkthrough: identical branch-pointer mechanics as the JavaScript version
— both branches start at the same commit, then diverge independently as
each receives its own separate commit.
