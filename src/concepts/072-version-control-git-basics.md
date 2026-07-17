---
concept: 072-version-control-git-basics
name: Version Control (Git Basics)
---

## Definition

Version control tracks changes to a project over time by recording
snapshots of its files, so any prior state can be recovered, compared, or
built upon — instead of relying on manually renamed copies like
`project-final-v2`.

## Problem

Without version control, tracking "what changed and when" across a project
means either losing history entirely (overwriting files in place) or
manually managing an ever-growing pile of dated copies. Neither approach
lets you see exactly what changed between two points, or safely undo one
specific change without undoing everything after it too.

## Execution

Edit a file
↓
`git add <file>` → the change moves into the **staging area** — a holding
zone for exactly what will go into the next snapshot
↓
`git commit -m "message"` → everything staged becomes one permanent
snapshot, given a unique identifier and a message describing *why*
↓
`git log` → shows the full history of snapshots, in order
↓
`git diff` → shows exactly what changed, line by line, between any two
snapshots (or between the working files and the last snapshot)

## Computer Science

Git's actual data model isn't "store the diff between each version," the
way some older systems worked — a commit is a snapshot of the **entire**
project's file tree at that moment (deduplicated under the hood, so
unchanged files aren't literally re-copied), linked to its parent commit(s),
forming a directed acyclic graph of history. This is why examining an old
commit is fast: it's the whole state at that point, not a diff that has to
be replayed from the very beginning.

Tags: Snapshots, Directed acyclic graph, Content-addressable storage, Distributed version control

## Software Engineering

The staging area exists specifically to let a commit be smaller or more
deliberate than "every single uncommitted change" — you can stage only some
of the files you've touched, building one commit at a time even while
several unrelated changes sit unstaged in the working directory. Small,
focused commits with clear messages are what make `git log` and `git diff`
actually useful later, when you (or someone else) need to understand why a
specific change was made.

Tags: Staging area, Commit granularity, Commit messages, Collaboration

## Common Mistakes

- Committing everything in one giant commit with a vague message like "updates" — this makes it nearly impossible to find or safely undo one specific change later without undoing everything else too.
- Forgetting to stage a change before committing and being surprised the commit doesn't include it — only staged changes go into the next commit, not just any uncommitted change.

## Exercises

- Make two separate changes to two different files, stage and commit only one of them, then check what's still reported as uncommitted.
- On a real repository you have access to, run `git log` and `git diff` against an earlier commit, and find one commit whose message alone tells you clearly why the change was made.

## javascript

```javascript
class Repo {
  #staged = new Set()
  #commits = []
  stage(filename) { this.#staged.add(filename) }
  commit(message) {
    const snapshot = { id: this.#commits.length + 1, message, files: [...this.#staged] }
    this.#commits.push(snapshot)
    this.#staged.clear()   // staging area is cleared after each commit
    return snapshot
  }
  log() { return this.#commits.map(c => `#${c.id} ${c.message} (${c.files.join(', ')})`) }
}

const repo = new Repo()
repo.stage('index.html')
repo.commit('Add homepage')
repo.stage('style.css')
repo.stage('index.html')   // index.html changed again
repo.commit('Add styling, tweak homepage')

console.log(repo.log())
// [ '#1 Add homepage (index.html)', '#2 Add styling, tweak homepage (style.css, index.html)' ]
```
Walkthrough: `stage` mirrors `git add` — it moves a filename into the
staging area without creating a snapshot yet. `commit` mirrors
`git commit` — it freezes whatever is currently staged into a permanent,
numbered snapshot, then clears the staging area so the next commit starts
empty. `log` mirrors `git log`, listing every snapshot in order. The second
commit includes `index.html` again — a file can appear in more than one
commit if it's staged and committed again after further changes, exactly
like a real repository's history.

## python

```python
class Repo:
    def __init__(self):
        self._staged = []
        self._commits = []

    def stage(self, filename):
        if filename not in self._staged:
            self._staged.append(filename)

    def commit(self, message):
        snapshot = {"id": len(self._commits) + 1, "message": message, "files": list(self._staged)}
        self._commits.append(snapshot)
        self._staged.clear()
        return snapshot

    def log(self):
        return [f"#{c['id']} {c['message']} ({', '.join(c['files'])})" for c in self._commits]


repo = Repo()
repo.stage('index.html')
repo.commit('Add homepage')
repo.stage('style.css')
repo.stage('index.html')
repo.commit('Add styling, tweak homepage')

print(repo.log())
# ['#1 Add homepage (index.html)', '#2 Add styling, tweak homepage (style.css, index.html)']
```
Walkthrough: identical staging-then-snapshot mechanics as the JavaScript
version — `stage` records a pending filename without touching history,
`commit` is the moment a permanent, numbered snapshot is actually created
and the staging area resets.
