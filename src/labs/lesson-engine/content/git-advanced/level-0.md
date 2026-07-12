---
series: git-advanced
level: 0
title: Git Internals — The Object Model
lang: bash
---

# Git Internals — The Object Model

Most developers use Git as a black box: type commands, something happens. That works until it doesn't — and when Git behaves unexpectedly, the developer who understands the object model can reason their way out of any situation in minutes, while the one who doesn't spends an hour searching Stack Overflow.

Git's design is elegant and small: four object types, a content-addressed key-value store, and a handful of ref files. Everything else — branches, merges, rebases, the staging area — is built on top of those primitives. Understanding them is not "advanced" knowledge; it is the foundation that makes the rest of Git obvious rather than magical.

By the end of this lesson you will understand exactly what `.git/` contains, how Git stores files and history as content-addressed objects, what a branch physically is (a 41-byte file), and why this design makes operations like branching and rebasing cheap and safe.

## What lives in .git/

```text
.git/
├── objects/          ← the object store — every file version, tree, commit
│   ├── 2e/
│   │   └── a1b2c3d4...   ← object whose SHA starts with "2e"
│   ├── pack/         ← packed objects (Git compresses periodically)
│   └── info/
├── refs/
│   ├── heads/        ← local branches (one file per branch)
│   │   ├── main      ← contains: "a1b2c3d4e5f6..." (a commit hash)
│   │   └── feature/x ← contains: "b2c3d4e5f6a1..."
│   └── remotes/
│       └── origin/
│           └── main  ← last-known remote state (updated by fetch/pull)
├── HEAD              ← "ref: refs/heads/main" or a bare hash (detached)
├── index             ← the staging area (binary file)
├── config            ← this repo's git configuration
└── COMMIT_EDITMSG    ← last commit message (used by --amend)
```

```text
The four object types (stored in .git/objects/):

BLOB — file content
  Does NOT store the filename. Just the bytes.
  SHA-1("blob " + size + "\0" + content)

TREE — directory
  Stores: file mode + name → blob hash (for files)
          file mode + name → tree hash (for subdirectories)
  Two trees for identical directories share the same hash (deduplication).

COMMIT — snapshot + metadata
  Stores: tree hash (the root directory snapshot)
          parent hash(es) — zero for initial commit, two for merge commit
          author + committer (name, email, timestamp)
          commit message

TAG (annotated) — named pointer + metadata
  Stores: object hash being tagged + tagger + message
  Signed tags also include a GPG signature.
```

## Reading objects directly

```bash
# Inspect any object by its hash:
git cat-file -t a1b2c3d   # type: blob / tree / commit / tag
git cat-file -p a1b2c3d   # pretty-print the contents

# Example: read the current commit
git cat-file -p HEAD
# → tree 4b825dc642cb6eb9a060e54bf8d69288fbee4904
# → parent a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2
# → author Jane Smith <jane@example.com> 1705000000 +0000
# → committer Jane Smith <jane@example.com> 1705000000 +0000
# →
# → feat: add user authentication

# Read the tree from that commit
git cat-file -p 4b825dc6
# → 100644 blob a8f3b... README.md
# → 040000 tree 9b2c1... src
# → 100644 blob c4d5e... package.json

# Read a blob
git cat-file -p a8f3b...
# → (the raw contents of README.md)

# Hash a string to see how Git creates object hashes:
echo -n "hello" | git hash-object --stdin
# → ce013625030ba8dba906f756967f9e9ca394464a
```

```text
Content-addressing means:
  • Same content → same hash, always, forever, across all repos.
  • If two files have identical content, Git stores ONE blob.
  • You can verify data integrity: re-hash any object and compare.
  • This is how git clone --reference works (share object stores).

SHA-1 collisions are theoretically possible. Git is adding SHA-256 support
(git -c extensions.objectFormat=sha256) as a future-proof replacement.
The SHAttered attack (2017) produced the first SHA-1 collision but requires
a specific structure git doesn't use. In practice, SHA-1 git repos are safe.
```

## How branches and HEAD actually work

```bash
# A branch is just a file containing a commit hash:
cat .git/refs/heads/main
# → a1b2c3d4e5f6789012345678901234567890abcd

# Creating a branch writes a new file:
git branch feature/x
# Equivalent to:
echo "a1b2c3d4e5f6789012345678901234567890abcd" > .git/refs/heads/feature/x

# HEAD points to the current branch:
cat .git/HEAD
# → ref: refs/heads/main

# Switching branches rewrites HEAD and updates working directory:
git switch feature/x
cat .git/HEAD
# → ref: refs/heads/feature/x

# Detached HEAD — HEAD contains a hash directly, not a ref:
git checkout a1b2c3d
cat .git/HEAD
# → a1b2c3d4e5f6789012345678901234567890abcd
# You are not on any branch. Commits here are "orphaned" unless you branch.
```

```text
Why branching is free in Git:
  Creating a branch = writing a 41-byte file (40-char hash + newline).
  O(1) time and space regardless of repo size.

  Compare with SVN: copying a directory of files (O(n) time and space).

  This is why "branch early, branch often" is the Git idiom.
  There is no cost. A branch is a name for a commit.
```

**CS lens:** Git's object store is a **content-addressed persistent data structure** — the same design used in distributed hash tables (Kademlia), the Bitcoin blockchain (UTXO set hashes), and IPFS (InterPlanetary File System). Content-addressing gives you: deduplication (same file → one blob), integrity verification (hash mismatch = corruption detected), and immutability (objects are write-once, never modified). The DAG of commits is append-only; "rewriting history" creates new nodes and moves ref pointers. Old nodes remain until `git gc` runs. This design is why `git reflog` can always recover "deleted" commits.

**SE lens:** Every "mysterious" Git behavior has a mechanical explanation at the object level. `git push --force` overwrites a remote ref, disconnecting teammates' history from yours — because their local refs still point to the old commit hash. `git stash` creates two commits (one for the index, one for the working tree) and stores them as `refs/stash`. `git rebase` creates new commit objects (same diffs, new parent hashes) and moves the branch ref. Once you can read `.git/` directly, Git is no longer a black box.

**Common mistakes:**
- Thinking "detached HEAD" means something is broken — it just means HEAD contains a hash instead of a branch name. Make a branch from it and you're back to normal: `git switch -c recovery/my-work`.
- Confusing the staging area (`.git/index`) with the working directory — `git add` copies content to the index (creates blobs); `git commit` reads the index to create a tree. The working directory is just your filesystem.

**Debug tip:** When Git does something unexpected, inspect the refs directly: `cat .git/HEAD`, `cat .git/refs/heads/main`, `git cat-file -p HEAD`. The object graph never lies. If you want to see all objects in the repository: `git rev-list --objects --all`.

## Challenge: git_internals

Answer questions about Git's object model.

```challenge
const internals = {
  // What are the four Git object types?
  objectTypes: '',

  // A branch is physically stored as what in .git/?
  branchIsA: '',

  // True or false: two files with identical content are stored as two separate blobs.
  deduplicated: '',

  // What does "detached HEAD" mean exactly?
  detachedHead: '',

  // What command lets you read the raw contents of any Git object?
  readObject: '',

  // Why does creating a Git branch take the same time regardless of repo size?
  branchCost: '',
};
```

```test
assert internals.objectTypes.toLowerCase().includes('blob') && internals.objectTypes.toLowerCase().includes('tree') && internals.objectTypes.toLowerCase().includes('commit') && internals.objectTypes.toLowerCase().includes('tag')
assert internals.branchIsA.toLowerCase().includes('file') || internals.branchIsA.toLowerCase().includes('ref') || internals.branchIsA.toLowerCase().includes('hash') || internals.branchIsA.toLowerCase().includes('pointer')
assert internals.deduplicated.toLowerCase() === 'false' || internals.deduplicated.toLowerCase().includes('false') || internals.deduplicated.toLowerCase().includes('same hash') || internals.deduplicated.toLowerCase().includes('one blob')
assert internals.detachedHead.toLowerCase().includes('hash') || internals.detachedHead.toLowerCase().includes('branch') || internals.detachedHead.toLowerCase().includes('direct')
assert internals.readObject.includes('cat-file')
assert internals.branchCost.toLowerCase().includes('file') || internals.branchCost.toLowerCase().includes('41') || internals.branchCost.toLowerCase().includes('o(1)') || internals.branchCost.toLowerCase().includes('pointer') || internals.branchCost.toLowerCase().includes('hash')
```
