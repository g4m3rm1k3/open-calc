---
concept: 158-remotes
name: Remotes
---

## Definition

A remote is a reference to a version of a repository hosted elsewhere
(typically on a server like GitHub) — local commits are pushed TO a
remote to share them, and other people's commits are pulled/fetched FROM
a remote to receive them, keeping separate copies of the same repository
in sync.

## Problem

Git is fundamentally distributed — every clone has a COMPLETE copy of the
repository's history, with no single "master copy" required for it to
function locally. But collaboration requires a shared, agreed-upon place
to synchronize work — a remote is that shared reference point, letting
multiple independent local copies push and pull changes to stay in sync
with each other.

## Execution

Developer A clones a repository — this creates a full LOCAL copy, plus a
reference called "origin" pointing back at the remote it came from
↓
Developer A commits locally — this ONLY affects their local copy; the
remote is completely unaware of it so far
↓
Developer A pushes to origin — their new commits are uploaded, and the
remote's copy is updated to match
↓
Developer B (who also cloned this repository earlier) pulls from origin
— they fetch Developer A's new commits and merge them into their own
local copy
↓
Both developers' local repositories are now in sync with each other, via
the shared remote

## Computer Science

Because every clone holds the FULL history (not just a partial
checkout), git is a genuinely distributed version control system —
there's no technical requirement for a central server at all (two
developers could push/pull directly to each other's machines), though in
practice, a shared remote (GitHub, GitLab) serves as the conventional
single point of coordination.

Tags: Distributed version control, Full history clones, Push/pull/fetch

## Software Engineering

"origin" is just the CONVENTIONAL default name for the remote a
repository was cloned from — a repository can have multiple remotes
(e.g., "origin" for your own fork, "upstream" for the original project
you forked from), each independently push/pull-able.

Tags: Origin, Upstream, Multiple remotes, Forking workflow

## Common Mistakes

- Assuming "pull" and "fetch" are the same thing — fetch only downloads the remote's new commits without merging them into your current branch; pull does a fetch AND automatically merges (or rebases) them in.
- Forgetting to push before assuming your work is "saved" or shared — a local commit exists only on your own machine until it's explicitly pushed to a remote; if your machine is lost, un-pushed commits are lost with it.

## Exercises

- Explain the specific difference between `fetch` and `pull` using the example above — what would change if Developer B had only fetched, not pulled?
- Trace through what happens to Developer A's local commits BEFORE they push — are they visible to Developer B at all at that point?

## javascript

```javascript
// Simulating push/pull between a local repo and a shared remote directly.
class Remote {
  commits = ['C1']
}

class LocalRepo {
  constructor(remote) {
    this.remote = remote
    this.commits = [...remote.commits]   // clone: full copy of history at clone time
  }
  commit(id) { this.commits.push(id) }   // local-only until pushed
  push() { this.remote.commits = [...this.commits] }
  pull() { this.commits = [...this.remote.commits] }
}

const remote = new Remote()
const devA = new LocalRepo(remote)
const devB = new LocalRepo(remote)

devA.commit('C2')   // local to devA only so far
console.log(remote.commits)   // [ 'C1' ] -- remote is UNAWARE of C2 until devA pushes
console.log(devB.commits)     // [ 'C1' ] -- devB has no idea C2 exists yet either

devA.push()
console.log(remote.commits)   // [ 'C1', 'C2' ] -- now the remote has it

devB.pull()
console.log(devB.commits)     // [ 'C1', 'C2' ] -- devB is now in sync, via the shared remote
```
Walkthrough: `devA.commit('C2')` only changes `devA`'s own local commits
list — neither `remote` nor `devB` know about it until `devA.push()`
explicitly uploads it. Only after `devB.pull()` does `devB`'s local copy
reflect `C2`, demonstrating that synchronization only happens through
explicit push/pull operations against the shared remote, never
automatically.

## python

```python
class Remote:
    def __init__(self):
        self.commits = ['C1']


class LocalRepo:
    def __init__(self, remote):
        self.remote = remote
        self.commits = list(remote.commits)   # clone: full copy of history at clone time

    def commit(self, commit_id):
        self.commits.append(commit_id)   # local-only until pushed

    def push(self):
        self.remote.commits = list(self.commits)

    def pull(self):
        self.commits = list(self.remote.commits)


remote = Remote()
dev_a = LocalRepo(remote)
dev_b = LocalRepo(remote)

dev_a.commit('C2')   # local to dev_a only so far
print(remote.commits)   # ['C1'] -- remote is UNAWARE of C2 until dev_a pushes
print(dev_b.commits)    # ['C1'] -- dev_b has no idea C2 exists yet either

dev_a.push()
print(remote.commits)   # ['C1', 'C2'] -- now the remote has it

dev_b.pull()
print(dev_b.commits)    # ['C1', 'C2'] -- dev_b is now in sync, via the shared remote
```
Walkthrough: identical push/pull synchronization mechanics as the
JavaScript version — changes stay local until explicitly pushed, and
other copies only see them after explicitly pulling.
