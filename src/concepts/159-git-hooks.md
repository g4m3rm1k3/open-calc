---
concept: 159-git-hooks
name: Git Hooks
---

## Definition

A git hook is a script that git automatically runs at specific points in
its workflow (before a commit, after a commit, before a push) — letting
you automate checks or actions (running tests, enforcing a commit message
format) without relying on developers remembering to do it manually.

## Problem

Relying on every developer to remember to run tests, or lint their code,
or follow a commit message convention BEFORE committing is unreliable —
people forget, or skip it under time pressure. A hook runs automatically
at the right moment, giving a chance to block a bad commit/push (or run
some automated action) without depending on human memory.

## Execution

Developer runs a commit command
↓
BEFORE the commit is actually created, git looks for a "pre-commit" hook
script and runs it automatically
↓
Hook script runs (e.g., a linter check) — if it exits with an
error/failure code, git ABORTS the commit entirely
↓
If the hook succeeds (exits cleanly), the commit proceeds normally
↓
Later, pushing triggers a "pre-push" hook the same way, potentially
running a fuller test suite before allowing the push to go through

## Computer Science

Hooks are simply scripts triggered at specific well-defined lifecycle
events (pre-commit, post-commit, pre-push, and others) — git doesn't care
what language they're written in, only that they're executable and
communicate success/failure via their exit code, the same universal
convention shell scripts and CI pipelines use everywhere.

Tags: Lifecycle events, Exit codes, Automation, Shell scripts

## Software Engineering

Hooks stored in a repository's local hooks folder are NOT automatically
shared when a repository is cloned (that folder isn't part of the tracked
history) — teams that want everyone to share the same hooks typically use
a dedicated tool or a checked-in script that installs the hooks, rather
than relying on the hooks folder itself being version-controlled.

Tags: Local hooks folder, Hook sharing, Husky (JS ecosystem), Team-wide enforcement

## Common Mistakes

- Assuming hooks are automatically shared across a team just because they're in the repository — the actual hook scripts live outside normal version control, so teams need an explicit setup step or tool to install them for every clone.
- Writing a slow, heavyweight pre-commit hook (e.g., running an entire test suite) — this frustrates everyday committing; slower checks are usually better placed at pre-push or in CI instead, with only fast checks (formatting, linting) at pre-commit.

## Exercises

- Explain why a hook aborting a commit specifically depends on its exit code, not anything about what it printed to the screen.
- Identify one check that belongs in a fast pre-commit hook versus one that belongs in a slower pre-push hook or CI pipeline instead, and explain why.

## javascript

```javascript
// Simulating hook execution and exit-code-based abort logic directly,
// since real git hooks require an actual git installation and filesystem.
function runPreCommitHook(lintErrors) {
  const exitCode = lintErrors.length > 0 ? 1 : 0   // non-zero exit code == failure, by convention
  return { exitCode, aborted: exitCode !== 0 }
}

function attemptCommit(message, lintErrors) {
  const hookResult = runPreCommitHook(lintErrors)
  if (hookResult.aborted) {
    return { committed: false, reason: 'pre-commit hook failed', exitCode: hookResult.exitCode }
  }
  return { committed: true, message }
}

console.log(attemptCommit('add feature', ['missing semicolon on line 12']))   // { committed: false, ... } -- hook blocked it
console.log(attemptCommit('add feature', []))                                  // { committed: true, message: 'add feature' } -- hook passed, commit proceeds
```
Walkthrough: `runPreCommitHook` returns a non-zero `exitCode` whenever
there are lint errors, and `attemptCommit` treats ANY non-zero exit code
as an abort signal — mirroring exactly how a real git hook communicates
success or failure to git purely through its process exit code, with no
special meaning attached to anything it printed.

## python

```python
def run_pre_commit_hook(lint_errors):
    exit_code = 1 if lint_errors else 0   # non-zero exit code == failure, by convention
    return {'exit_code': exit_code, 'aborted': exit_code != 0}


def attempt_commit(message, lint_errors):
    hook_result = run_pre_commit_hook(lint_errors)
    if hook_result['aborted']:
        return {'committed': False, 'reason': 'pre-commit hook failed', 'exit_code': hook_result['exit_code']}
    return {'committed': True, 'message': message}


print(attempt_commit('add feature', ['missing semicolon on line 12']))   # {'committed': False, ...} -- hook blocked it
print(attempt_commit('add feature', []))                                   # {'committed': True, 'message': 'add feature'} -- hook passed, commit proceeds
```
Walkthrough: identical exit-code-based abort logic as the JavaScript
version — any non-empty lint errors produce a non-zero exit code, which
`attempt_commit` treats as a signal to block the commit entirely.
