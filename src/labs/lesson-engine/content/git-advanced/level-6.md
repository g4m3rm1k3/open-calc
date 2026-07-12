---
series: git-advanced
level: 6
title: Git Hooks — Automation at Every Step
lang: bash
---

# Git Hooks — Automation at Every Step

Every time you run `git commit`, `git push`, or `git merge`, Git checks a directory for executable scripts with specific names and runs them before or after the operation. These are hooks — the built-in plugin system for Git.

Hooks can enforce standards automatically: check code style before every commit, run tests before every push, validate commit message format, post a Slack notification after a merge, update a ticket tracker after a push. They run locally (client-side hooks) or on the server (server-side hooks), and they can block operations that don't meet your standards.

By the end of this lesson you will understand every significant Git hook and when it fires, be able to write hooks that enforce commit message standards and run pre-commit checks, and know how to share hooks across a team using tools like Husky.

## How hooks work

```text
Hooks live in .git/hooks/
After git init, this directory contains sample hooks (all disabled):
  .git/hooks/
  ├── applypatch-msg.sample
  ├── commit-msg.sample
  ├── post-update.sample
  ├── pre-applypatch.sample
  ├── pre-commit.sample
  ├── pre-push.sample
  ├── pre-rebase.sample
  ├── prepare-commit-msg.sample
  └── update.sample

To enable a hook: remove the .sample extension and make it executable.
  cp .git/hooks/pre-commit.sample .git/hooks/pre-commit
  chmod +x .git/hooks/pre-commit

Hooks can be written in any language (bash, Python, Node.js, Ruby...)
as long as they are executable (chmod +x) and have a shebang line.

Exit 0 → hook passed, operation continues.
Exit non-zero → hook FAILED, operation is aborted.
```

## Client-side hooks

```bash
# pre-commit — runs before the commit message editor opens
# Can inspect what's being staged. Non-zero exit aborts the commit.
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
# Block commits that include TODO or FIXME (force resolution before committing)
if git diff --cached | grep -E '^\+.*(TODO|FIXME)' > /dev/null; then
  echo "ERROR: Commit contains TODO or FIXME. Resolve them first."
  exit 1
fi

# Run linter on staged files only
STAGED=$(git diff --cached --name-only --diff-filter=ACM | grep '\.js$')
if [ -n "$STAGED" ]; then
  echo "$STAGED" | xargs npx eslint
  if [ $? -ne 0 ]; then
    echo "ERROR: ESLint failed. Fix errors before committing."
    exit 1
  fi
fi
exit 0
EOF
chmod +x .git/hooks/pre-commit
```

```bash
# commit-msg — runs after you write a commit message; receives the message file path
# Validate message format (Conventional Commits, Jira ticket refs, etc.)
cat > .git/hooks/commit-msg << 'EOF'
#!/bin/bash
MSG_FILE="$1"
MSG=$(cat "$MSG_FILE")
PATTERN="^(feat|fix|docs|style|refactor|test|chore|perf|ci|build|revert)(\([a-z-]+\))?: .{1,72}$"

if ! echo "$MSG" | grep -qE "$PATTERN"; then
  echo "ERROR: Commit message must follow Conventional Commits format."
  echo "  Expected: type(scope): description"
  echo "  Example:  feat(auth): add JWT refresh token support"
  echo "  Types:    feat fix docs style refactor test chore perf ci build revert"
  exit 1
fi
EOF
chmod +x .git/hooks/commit-msg

# Now any commit with a bad message is rejected:
# git commit -m "stuff" → ERROR: Commit message must follow Conventional Commits format.
# git commit -m "feat: add search" → allowed
```

```bash
# pre-push — runs before git push; receives remote name and URL
# Good for running the full test suite before pushing (slower than pre-commit)
cat > .git/hooks/pre-push << 'EOF'
#!/bin/bash
echo "Running tests before push..."
npm test
if [ $? -ne 0 ]; then
  echo "ERROR: Tests failed. Fix them before pushing."
  exit 1
fi
exit 0
EOF
chmod +x .git/hooks/pre-push

# prepare-commit-msg — runs before commit message editor opens; can prefill the message
cat > .git/hooks/prepare-commit-msg << 'EOF'
#!/bin/bash
# Prepend the branch name to every commit message automatically:
BRANCH=$(git symbolic-ref --short HEAD)
MSG_FILE="$1"
# Only add branch name if not already there and branch isn't main
if [[ "$BRANCH" != "main" && ! $(cat "$MSG_FILE") =~ "[$BRANCH]" ]]; then
  sed -i "1s/^/[$BRANCH] /" "$MSG_FILE"
fi
EOF
chmod +x .git/hooks/prepare-commit-msg
```

## Server-side hooks

```text
Server-side hooks run on the Git server (GitHub, GitLab, Bitbucket, self-hosted).
They enforce policy that client-side hooks can't — because clients can bypass
local hooks with --no-verify.

pre-receive  — runs when the server receives a push, before any refs are updated.
               Exit non-zero to reject the ENTIRE push.
               Receives: old-hash new-hash refname for each ref being updated.

update       — runs once per ref being updated (pre-receive runs once per push).
               More granular: can reject specific branches while allowing others.

post-receive — runs after a successful push. Used for:
               • Deploying to staging/production
               • Sending Slack/email notifications
               • Updating issue tracker tickets
               • Triggering CI pipelines (though webhooks are now more common)

post-update  — older version of post-receive; use post-receive.
```

## Sharing hooks with a team using Husky

```bash
# Problem: .git/hooks/ is not tracked by Git — hooks are local to each developer.
# Solution: Husky — puts hooks in the repo and installs them automatically.

npm install --save-dev husky

# Initialize Husky (creates .husky/ directory tracked by Git):
npx husky init
# → creates .husky/pre-commit

# Add a pre-commit hook:
echo "npm test" > .husky/pre-commit
chmod +x .husky/pre-commit

# Add to package.json to auto-install on npm install:
# "scripts": {
#   "prepare": "husky"
# }
# Now every developer who runs npm install gets the hooks automatically.

# .husky/commit-msg (Conventional Commits validation):
echo 'npx --no -- commitlint --edit "$1"' > .husky/commit-msg
chmod +x .husky/commit-msg

# Install commitlint:
npm install --save-dev @commitlint/cli @commitlint/config-conventional
echo "export default { extends: ['@commitlint/config-conventional'] };" > commitlint.config.js
```

```text
Bypassing hooks:
  --no-verify (or -n) skips all client-side hooks:
  git commit --no-verify -m "emergency: skip hooks"
  git push --no-verify

  This exists for legitimate emergencies (hooks broken, time-critical hotfix).
  Server-side hooks cannot be bypassed by clients — use them for hard policy.

  Tracking hook bypass:
  Some teams log --no-verify usage in their CI pipeline (the commit is flagged
  and requires manual review). Others require a Jira ticket number in the message.
```

**CS lens:** Git hooks implement the **observer pattern** at the version control level — each operation (commit, push, merge) is an event that triggers registered listeners (the hooks). The pre-* hooks are **pre-conditions** (can veto the operation); post-* hooks are **side effects** (operation already complete, notification only). This is identical to database triggers (BEFORE INSERT, AFTER INSERT), HTTP middleware (request interceptors), and browser event listeners (preventDefault() vs addEventListener). The key design principle: fail fast in pre-hooks (abort before state changes), notify in post-hooks (state already committed).

**SE lens:** Well-configured hooks eliminate entire classes of code review comments. "Fix the lint errors" and "commit messages need a Jira ticket" are automatable — hooks catch them before they reach review. This shifts review attention to what humans are actually good at: design decisions, edge cases, algorithm correctness, and architecture. The tradeoff: hooks add seconds to every commit and push. For a 200ms test suite, a pre-commit hook is appropriate. For a 5-minute test suite, pre-push is better; the full CI run happens on the server anyway.

**Common mistakes:**
- Putting slow operations in `pre-commit` — blocking the commit for 30 seconds for every minor change creates friction that causes developers to use `--no-verify` routinely. Pre-commit should run in under 2 seconds. Full test suites belong in `pre-push` or CI.
- Forgetting `chmod +x` — hooks that aren't executable are silently ignored. If a hook isn't running, check: `ls -la .git/hooks/` and confirm it has execute permission.
- Not handling the case where staged files are empty — a `pre-commit` hook that runs linters should check `git diff --cached --name-only` first and exit 0 if there's nothing to lint.

**Debug tip:** To test a hook without committing, run it directly: `bash .git/hooks/pre-commit` (or `.husky/pre-commit`). Hooks are just shell scripts — you can run them in isolation to debug. Add `set -x` at the top temporarily for verbose output of every command.

## Challenge: git_hooks

Answer questions about Git hooks.

```challenge
const hooks = {
  // Which hook runs BEFORE the commit message editor opens and can abort the commit?
  preCommitHook: '',

  // Which hook validates the commit message text itself?
  messageHook: '',

  // A developer uses --no-verify to bypass your pre-commit hook. Which type of hook
  // cannot be bypassed by developers pushing code?
  unbypAssable: '',

  // Why should slow test suites go in pre-push rather than pre-commit?
  hookPlacement: '',

  // What tool shares hooks across a team by putting them in the repository?
  sharingTool: '',
};
```

```test
assert hooks.preCommitHook.toLowerCase().includes('pre-commit') || hooks.preCommitHook.toLowerCase().includes('pre commit')
assert hooks.messageHook.toLowerCase().includes('commit-msg') || hooks.messageHook.toLowerCase().includes('commit msg')
assert hooks.unbypAssable.toLowerCase().includes('server') || hooks.unbypAssable.toLowerCase().includes('pre-receive') || hooks.unbypAssable.toLowerCase().includes('update')
assert hooks.hookPlacement.toLowerCase().includes('slow') || hooks.hookPlacement.toLowerCase().includes('friction') || hooks.hookPlacement.toLowerCase().includes('every commit') || hooks.hookPlacement.toLowerCase().includes('second')
assert hooks.sharingTool.toLowerCase().includes('husky') || hooks.sharingTool.toLowerCase().includes('.husky') || hooks.sharingTool.toLowerCase().includes('repo')
```
