---
series: git-version-control
level: 4
title: Pull Requests and Code Review
lang: bash
---

# Pull Requests and Code Review

In Level 2 you merged branches locally. In professional teams, code does not merge directly — it goes through a **pull request** (PR) first. A PR is a proposal to merge a branch. It shows the diff, provides a thread for discussion, and requires at least one reviewer to approve before the code can be merged.

Pull requests are how professional software teams catch bugs before they reach production, share knowledge about what changed and why, and maintain code quality without requiring everyone to be in the same room.

By the end of this lesson you will understand the full pull request lifecycle, know how to write a PR description that reviewers can actually act on, understand what makes code review effective for both authors and reviewers, and know how to respond to review comments.

## The pull request workflow

```bash
# Standard team workflow:
# 1. Sync main:
git switch main
git pull

# 2. Create feature branch:
git switch -c feature/add-course-search

# 3. Do work and commit:
git add .
git commit -m "feat: add full-text search to GET /courses"
git commit -m "test: add search integration tests"

# 4. Push the branch to GitHub:
git push -u origin feature/add-course-search

# 5. Open a pull request on GitHub:
#    GitHub shows a banner: "feature/add-course-search had recent pushes. Compare & pull request"
#    Click → Fill in title and description → Create pull request

# 6. After review and approval, merge on GitHub.

# 7. Clean up:
git switch main
git pull            # get the merged changes
git branch -d feature/add-course-search  # delete local branch
```

```text
A good PR description includes:
- What changed and why (not just "fix the thing")
- How to test it
- Screenshots for UI changes
- Any risks or known issues

Title: "feat: Add full-text search to course listing API"
Body:
  ## What
  Added search parameter to GET /courses. Queries title and description.
  Uses PostgreSQL's to_tsvector/to_tsquery for full-text search.

  ## How to test
  GET /courses?search=python
  → returns courses matching "python" in title or description

  ## Notes
  Added a GIN index on (title, description) — migration included.
```

## Reading a diff in a pull request

```text
GitHub shows the diff of every file changed in the PR.

+ const search = req.query.search;                    ← added line (green)
+ if (search) {
+   query += ` WHERE to_tsvector('english', title || ' ' || description) @@ plainto_tsquery($1)`;
+   values.push(search);
+ }
  return pool.query(query, values);                   ← unchanged (grey)
- const result = await pool.query('SELECT * FROM courses');  ← removed line (red)

Reading a diff:
- Red lines (−) show what was removed
- Green lines (+) show what was added
- Grey lines show context (unchanged surrounding code)

In a code review, focus on:
- Does the logic handle edge cases?
- Are there security issues (SQL injection, missing auth)?
- Is the code readable and maintainable?
- Are there tests for the new behaviour?
```

**CS lens:** A pull request is a **patch** — a description of changes from one state to another. The diff format (unified diff) was standardized in the 1980s. `git diff` output and GitHub PR diffs use the same format. Understanding diff format means you can apply patches manually (`git apply`), read email-based code reviews (used in Linux kernel development), and understand what any automated tool is doing to your code.

## Reviewing code on GitHub

```text
GitHub PR review tools:
1. File-by-file diff view — see every change
2. Inline comments — click any line to leave a comment on that specific line
3. Suggestions — propose a specific code change in a comment; author can apply with one click
4. Review states:
   - Comment: leave feedback without approving or blocking
   - Approve: the code is ready to merge
   - Request changes: changes are required before merging

Good review feedback:
  "This doesn't handle the case where title is null — what should happen?"
  "Consider using ILIKE instead of LIKE for case-insensitive search in PostgreSQL"
  "Nice use of GIN index here — that'll make this scale well"

Bad review feedback:
  "Wrong."
  "This should be done differently."
  "Just use Elasticsearch." (without explaining why)
```

**SE lens:** Code review is the single highest-leverage improvement a team can make to code quality. Studies show code review catches 60-90% of bugs before they reach production. Self-taught developers working alone don't have reviewers — but internalizing the reviewer mindset ("would a colleague understand this? what edge case am I missing? is this secure?") changes how you write code, even alone. Reviewing open-source PRs on GitHub is free education in how experienced developers think.

**Common mistakes:**
- Massive PRs (hundreds of files) — reviewers can't meaningfully review large changes. Aim for PRs under 400 lines changed.
- Merging without review on shared branches — even one reviewer catching one bug is worth the time.

**Debug tip:** `git log origin/main..HEAD --oneline` shows commits that are on your branch but not yet on main — exactly what will be in the pull request.

**Next:** Rebase, stash, and advanced history manipulation.

## Challenge: pr_description

Write a good pull request description.

```challenge
// Context: you added password hashing to the user registration endpoint
// The change: import bcrypt, hash password before storing, add bcrypt to package.json

const prDescription = {
  title: '',      // write a clear PR title
  whatChanged: '', // describe what changed (1-2 sentences)
  howToTest: '',   // how a reviewer should verify it works
};
```

```test
assert prDescription.title.length > 10
assert prDescription.whatChanged.length > 20
assert prDescription.howToTest.length > 20
assert !prDescription.title.toLowerCase().includes('stuff') && !prDescription.title.toLowerCase().includes('changes')
```
