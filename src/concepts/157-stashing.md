---
concept: 157-stashing
name: Stashing
---

## Definition

Stashing temporarily sets aside uncommitted changes in the working
directory (without committing them), restoring a clean working state —
letting you switch to something else (another branch, an urgent fix) and
bring the stashed changes back later.

## Problem

Sometimes you need to switch context (check out a different branch, pull
in urgent changes) but have half-finished, uncommitted work that isn't
ready to be committed yet — switching branches with uncommitted changes
present can be blocked or risky. Stashing lets you set that unfinished
work aside temporarily, without creating a real commit for incomplete
work, and restore it later exactly as it was.

## Execution

Working directory has uncommitted changes to a file (not yet committed —
not ready)
↓
An urgent task requires switching to a different branch — but uncommitted
changes are in the way
↓
Stash: uncommitted changes are saved aside, and the working directory
reverts to its last clean committed state
↓
Switch branches, do the urgent work, switch back
↓
Pop the stash: the previously-stashed changes are reapplied to the
working directory, exactly as they were before stashing

## Computer Science

A stash is essentially a temporary, unnamed commit-like snapshot that
lives OUTSIDE the normal commit history (not on any branch) — it exists
specifically to let you save "not ready to commit yet" work without
polluting the actual commit log with a half-finished commit.

Tags: Working directory, Snapshot, Outside commit history

## Software Engineering

Stashing is meant for short-lived context switches, not as a long-term
storage mechanism for abandoned work — a project with dozens of old
stashes accumulated over months is a sign that work should have either
been committed to a proper branch or discarded, since stashes are easy to
forget about and lose track of.

Tags: Short-lived context switching, Stash management

## Common Mistakes

- Using stash as long-term storage for work you're not sure about, instead of committing it to a dedicated branch — old, forgotten stashes are easy to lose track of and can be accidentally dropped.
- Forgetting which stash corresponds to which uncommitted work when multiple stashes pile up — stashes are typically ordered like a stack, and popping the wrong one applies the wrong changes.

## Exercises

- Trace through the example above: what does the working directory look like immediately after stashing, and immediately after popping the stash back?
- Explain why stashed changes don't show up as commits in the branch's history — where do they actually live instead?

## javascript

```javascript
// Simulating stash-and-pop directly: setting aside uncommitted working
// directory changes, then restoring them later.
class WorkingDirectory {
  #files = { 'file.js': 'original content' }
  #stashStack = []

  edit(filename, content) { this.#files[filename] = content }
  read(filename) { return this.#files[filename] }

  stash() {
    // save the CURRENT uncommitted state, then revert to the last clean state
    this.#stashStack.push({ ...this.#files })
    this.#files = { 'file.js': 'original content' }   // reverts to last committed state
  }

  pop() {
    this.#files = this.#stashStack.pop()   // restore the previously-stashed state
  }
}

const dir = new WorkingDirectory()
dir.edit('file.js', 'half-finished feature code')
console.log(dir.read('file.js'))   // 'half-finished feature code' -- uncommitted work in progress

dir.stash()
console.log(dir.read('file.js'))   // 'original content' -- working directory is clean again, ready to switch context

dir.pop()
console.log(dir.read('file.js'))   // 'half-finished feature code' -- the stashed work is back, exactly as it was
```
Walkthrough: `stash()` saves the in-progress edit and reverts the working
directory to its clean state, so `read('file.js')` shows the original
content again. `pop()` restores the saved snapshot, bringing back the
exact uncommitted edit that was set aside — demonstrating that stashed
work isn't lost, just temporarily out of the way.

## python

```python
class WorkingDirectory:
    def __init__(self):
        self._files = {'file.js': 'original content'}
        self._stash_stack = []

    def edit(self, filename, content):
        self._files[filename] = content

    def read(self, filename):
        return self._files[filename]

    def stash(self):
        # save the CURRENT uncommitted state, then revert to the last clean state
        self._stash_stack.append(dict(self._files))
        self._files = {'file.js': 'original content'}   # reverts to last committed state

    def pop(self):
        self._files = self._stash_stack.pop()   # restore the previously-stashed state


directory = WorkingDirectory()
directory.edit('file.js', 'half-finished feature code')
print(directory.read('file.js'))   # 'half-finished feature code' -- uncommitted work in progress

directory.stash()
print(directory.read('file.js'))   # 'original content' -- working directory is clean again, ready to switch context

directory.pop()
print(directory.read('file.js'))   # 'half-finished feature code' -- the stashed work is back, exactly as it was
```
Walkthrough: identical stash-and-pop mechanics as the JavaScript version —
the working directory reverts to a clean state on stash, and the exact
uncommitted edit returns on pop.
