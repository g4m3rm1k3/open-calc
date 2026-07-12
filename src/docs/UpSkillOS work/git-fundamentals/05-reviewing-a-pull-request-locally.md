# Reviewing a Pull Request Locally

**Case study:** PR #7 came with AI-generated advice that assumed the
contributor's branch lived on `origin` — running the suggested commands
would have silently done nothing to the actual PR. The real branch lived
on an external contributor's *fork*, a completely separate repository.
Getting this right meant fetching the PR directly by number, confirming
where it actually lived, and testing it locally before merging — the
GitHub website's diff view alone doesn't tell you whether the code
actually runs.

## What you will build

The ability to pull down any GitHub pull request — from your own repo or
someone else's fork — and have it sitting in your working folder as a
real, runnable checkout, without ever needing to clone the contributor's
fork separately or trust the web UI's diff view as the whole picture.

## What you need to know first

[Lesson 02](02-staying-in-sync.md) (fetch, remotes) and
[Lesson 04](04-reading-history-and-conflicts.md) (`merge-base`, reading
diffs between two points).

---

## The Lesson

### Define at use — what a pull request actually is, to git

GitHub's pull request is a GitHub concept, not a git one — git itself has
no idea what a "PR" is. What GitHub actually does, underneath the web UI,
is expose every open PR as a special read-only ref on your repository:
`refs/pull/<number>/head`. That ref exists whether the PR's branch is on
your own repo or on a stranger's fork — GitHub makes it available either
way, specifically so you never have to add the contributor's fork as a
separate remote just to look at their code.

```bash
git ls-remote origin 'refs/pull/*/head'
```
```
2e8ea0c7712f062f244694c783bf542227b4c198	refs/pull/7/head
908056b4017935a6deda53aef3a3bad5d52e5e3e	refs/pull/6/head
...
```

**Walkthrough:** this is exactly the command that confirmed, today, that
PR #7's head commit (`2e8ea0c7...`) matched the local branch we'd already
fetched — proving the earlier advice's PR number was at least correct,
even though its remote assumption wasn't.

### Fetching a PR into a real local branch

```bash
git fetch origin pull/7/head:pr-7-review
git checkout pr-7-review
```

**Walkthrough:** `fetch origin pull/7/head:pr-7-review` downloads that PR
ref's commits and creates a **new local branch** named `pr-7-review`
pointing at the PR's exact code — regardless of whether the PR's source
is a branch on `origin` or a completely different repository someone
forked. You never needed to know or care where it actually lives; GitHub
already resolved that for you into one fetchable ref.

**CS lens:** this is the same `fetch` from Lesson 02, just fetching a ref
that isn't a normal branch name. Git doesn't distinguish `refs/heads/main`
from `refs/pull/7/head` structurally — both are just named pointers to a
commit. GitHub's convention of exposing PRs this way is what makes this
whole workflow possible without ever touching the contributor's actual
repository.

You can now run the app, the tests, anything — for real, on your own
machine, exactly as the contributor's code would run — before deciding
anything about merging it.

### Finding out where a PR actually came from

If something about a PR seems off — like advice assuming it lives
somewhere it doesn't — the GitHub API answers precisely, without needing
`gh` CLI or any authentication for a public repo:

```bash
curl -sL https://api.github.com/repos/<owner>/<repo>/pulls/7 \
  | grep -E '"ref"|"full_name"|"mergeable"|"maintainer_can_modify"'
```

**Define at use:** `head.ref` and `head.repo.full_name` name the PR's
actual source branch and repository — `full_name` will say
`your-username/your-repo` if the PR came from a branch you control, or
`someone-else/your-repo` if it's a fork. `mergeable` tells you whether
GitHub sees a hard conflict (`true`/`false`) — separate from
`mergeable_state`, which can say `"unstable"` even when `mergeable` is
`true`, usually meaning a CI check hasn't passed, not that there's a
conflict. `maintainer_can_modify` tells you whether the contributor left
"Allow edits from maintainers" enabled — if `true`, you technically
*could* push directly to their fork branch, though the safer default is
almost always to merge as normal and follow up with your own commit if
something needs correcting, exactly as done today.

### Comparing a PR against its actual starting point, not just current main

```bash
git merge-base origin/main pr-7-review
git log --oneline $(git merge-base origin/main pr-7-review)..origin/main | wc -l
git diff --stat $(git merge-base origin/main pr-7-review) pr-7-review
```

**Walkthrough — why this three-command sequence matters:** a raw
`git diff origin/main pr-7-review` compares two *current* snapshots
directly, which is misleading if the PR's branch is old — every commit
`main` has gained since the PR started shows up as something the PR
"deletes," even though the PR's own commits never touched those files.
`merge-base` finds the actual **common ancestor** — the point where the
branches split — and diffing from *there* shows only what the PR itself
actually changed. This is exactly the sequence that took PR #7 from
looking like a 368-file, 83,000-line disaster down to its real shape: five
files, a few hundred lines, because the branch was simply 41 commits
stale, not full of destructive changes.

**CS lens:** this is precisely why `merge-base` exists as its own command
rather than something you'd compute by eye — finding the common ancestor
of two arbitrary points in a commit DAG (Lesson 01) is a real graph
traversal problem (it's the same shape as "lowest common ancestor" from
any algorithms course), and git needs the correct answer to do *any*
three-way merge correctly, not just for this diagnostic use.

---

## Connect the pieces

The full sequence run today, in order:

```bash
git ls-remote origin 'refs/pull/7/head'                      # confirm the PR exists, get its hash
curl ... pulls/7 ... 'ref'/'full_name'/'mergeable'            # discovered: fork, not a branch on origin
git fetch origin main mobile-ui-fix 2>&1                     # (mobile-ui-fix was already fetched as a local branch)
git merge-base origin/main mobile-ui-fix                     # found the real divergence point
git diff --stat $(git merge-base origin/main mobile-ui-fix) mobile-ui-fix   # saw the PR's real, small diff
git checkout main
git merge --no-commit --no-ff mobile-ui-fix                  # merged, paused before committing
git checkout main -- package-lock.json                       # Lesson 03's file-from-another-branch move
git commit -m "Merge pull request #7 from natural-mess/mobile-ui-fix"
git push origin main
```

The `--no-commit --no-ff` flags on that merge are worth naming explicitly:
`--no-commit` stops git right after merging, before creating the merge
commit, giving you a chance to inspect and adjust (exactly how the
lockfile got corrected) before finalizing anything. `--no-ff` forces a
real merge commit even if a fast-forward would have been possible —
useful specifically for PRs, where you generally *want* a visible "this
is where PR #7 landed" marker in history, rather than main's line silently
absorbing the commits with no trace of the merge event itself.

## What breaks without this

Trusting GitHub's web-UI diff view alone, without fetching and running
the PR's actual code, means merging based on what the code *looks like*
rather than what it *does* — a lockfile conflict that "resolves cleanly"
in the browser's merge-conflict UI can still produce a broken
`package-lock.json`, exactly the trap in
[Lesson 04](04-reading-history-and-conflicts.md). And without
`merge-base`-aware diffing, a stale-but-otherwise-fine PR from a
contributor who hasn't rebased in a while looks indistinguishable from
one that's genuinely destructive — you either reject good contributions
out of unfounded alarm, or you stop checking diffs carefully because
they're "always" alarming and stop being useful signal.

## Definition of done

- [ ] You can explain what `refs/pull/<n>/head` is and why it exists
- [ ] You've fetched a real PR (on any public repo you have permission to
      experiment against, or `open-calc` itself against a real number)
      into a local branch and checked it out
- [ ] You can write the three-command `merge-base` diff sequence from
      memory, and explain why it gives a truer picture than a raw
      two-branch diff
- [ ] Commit this lesson:

```bash
git add "src/docs/UpSkillOS work/git-fundamentals/05-reviewing-a-pull-request-locally.md"
git commit -m "docs: reviewing-a-pull-request-locally lesson — fetching PR refs, merge-base diffing"
```

---

*Next: [CONTRIBUTING.md](../../../../CONTRIBUTING.md) covers the other
side of this exact interaction — what a contributor should do, on their
end, before opening or updating a PR against this repo.*
