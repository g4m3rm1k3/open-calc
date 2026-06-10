# Drill 9.1 — Git Internals: What Commits Actually Are

**Standalone drill. No prerequisites except having Git installed.**
**Time estimate:** 60–75 minutes
**Environment:** Git (any version), Python 3.8+ for the visualization scripts
**What you will build:** A minimal git object store from scratch in Python: hash objects, write tree objects, create commit objects, and traverse the graph. Then verify your objects are identical to real git objects.
**What you will understand:** What git is storing in `.git/objects/`, why SHA-1 hashes are used, what a commit really contains, and why `git reset`, `git rebase`, and `git cherry-pick` are all the same operation at different levels.

---

## Quick Check

Answer these before starting. Answers at the bottom.

1. You make a commit, then change a file, then make another commit. How many objects does git store? List the types.

2. Two commits on different branches modify different files. You `git cherry-pick` the first commit onto the second branch. Does git "copy" the code changes? Or does it re-apply the diff? What's the difference?

3. `git reset --hard HEAD~1` and deleting the last commit both "undo" a commit. What happens to the objects in `.git/objects/`?

4. A "fast-forward merge" doesn't create a new commit. What does it do instead?

*(Answers at the bottom.)*

---

## The Concept: Git's Object Model

### Concept: Content-Addressable Storage

**What it is:**
Git is a content-addressable key-value store. Everything git stores — file content, directory structures, commits, tags — is stored as an "object." Each object's key is the SHA-1 hash of its content. If you know the content, you know the key. If you know the key, you can retrieve the content.

**The four object types:**

**blob**: stores raw file content. No filename, no permissions — just bytes.
```
blob 13\0Hello, World!
```
SHA-1 of this string = `8ab686eafeb1f44702738c8b0f24f2567c36da6d`

**tree**: stores a directory listing. Each entry: permissions, type (blob/tree), SHA-1, filename.
```
tree 37\0
100644 blob 8ab686e... hello.txt
040000 tree a1b2c3d... subdir
```

**commit**: stores metadata about a snapshot. Points to a tree (the root directory state).
```
commit
tree 4b825dc642cb6eb9a060e54bf8d69288fbee4904
parent abc123...
author Alice <alice@example.com> 1620000000 +0000
committer Alice <alice@example.com> 1620000000 +0000

Initial commit
```

**tag**: annotated tag — points to any object with a message and tagger info.

**The graph structure:**
```
Commit C → Commit B → Commit A → (no parent)
   |           |           |
   v           v           v
  Tree        Tree        Tree
 /    \      /    \      /
Blob  Blob  Blob  Blob  Blob
```

Commits form a linked list (each points to its parent). Trees form a tree structure. Blobs are the leaves. The entire project history is a DAG (directed acyclic graph) of these objects.

**Why SHA-1:**
SHA-1 provides two properties: (1) the same content always produces the same hash — deterministic and content-addressable. (2) different content produces different hashes (with extremely high probability) — collision-resistant. If any bit of an object changes, its hash changes, and every object that references it (trees, commits) must also change. This is why you can't quietly edit history without changing commit SHAs.

**What happens in a commit:**
When you run `git commit`:
1. Each modified file becomes a new blob (if content changed)
2. Each affected directory becomes a new tree
3. A new commit object is created pointing to the new root tree and the previous commit
4. The branch ref (e.g., `refs/heads/main`) is updated to point to the new commit SHA

Objects are stored in `.git/objects/` with the first 2 hex chars as the directory name and the remaining 38 as the filename. The content is zlib-compressed.

**Branches are just pointers:**
A branch is a file containing one SHA-1 hash. `refs/heads/main` contains one line: the SHA-1 of the latest commit. Moving a branch = updating this file. Deleting a branch = deleting this file (the objects remain until garbage collected).

**Constraints:**
- Objects are immutable — you never edit a git object, you create new ones
- SHA-1 has known theoretical weaknesses; git is transitioning to SHA-256 (git 2.29+)
- Packfiles: git occasionally consolidates loose objects into binary pack files for efficiency — same objects, different storage format

**Tradeoffs:**
- Content-addressable vs named storage: if you store the same file in 10 commits, git only stores one blob (deduplication by content). If you rename a file without changing it, the blob is reused. This is how git is storage-efficient.
- Immutable objects: you can't "edit" a commit. Amend creates a new commit. Rebase creates new commits. The old commits remain until garbage collected. This is why "rewriting history" can't be done quietly.

**Failure modes:**
- Losing commits after `reset --hard`: the commits exist in `.git/objects/` but are no longer reachable from any ref. `git reflog` shows them; `git gc` eventually deletes them.
- Detached HEAD: checking out a commit SHA directly doesn't update a branch. New commits are reachable from HEAD but from no branch. If you switch branches, the commits are "lost" (until reflog).
- Force push: replaces the remote branch pointer with your local one. Teammates with the old commits have diverged history.

**Operational reality:**
Every git operation is just creating, copying, and pointing to objects. `git stash` creates a commit (two, actually). `git cherry-pick` reads a diff between a commit and its parent, applies it, creates a new blob and tree, and makes a new commit. `git rebase` does the same for each commit in the range. Once you understand the object model, every git command becomes predictable.

**You will see this again in:**
Debugging strange git states, understanding `git reflog`, explaining why rebasing changes commit SHAs, implementing git hooks, understanding git's storage efficiency.

**Watch for:**
`git cat-file -p <sha>` — the single most important git debugging command. It shows the raw content of any object. Use it to inspect blobs, trees, and commits directly.

---

## Step 1 — Explore the Object Store

Create a git repo and explore its objects:

```bash
# Create a test repo
mkdir git-internals-drill
cd git-internals-drill
git init

# Check what .git/objects contains (should be empty except HEAD and config)
find .git/objects -type f
```

Now create some objects manually:

```bash
# Create a blob from file content
echo "Hello, World!" > hello.txt
git add hello.txt

# Look at what was created
find .git/objects -type f
# Should see one new file: .git/objects/8a/b686eafeb1f44702738c8b0f24f2567c36da6d (or similar)

# Inspect the blob
git cat-file -t 8ab686e   # type: blob
git cat-file -p 8ab686e   # content: Hello, World!

# Make a commit
git commit -m "Initial commit"

# Now look at all objects
find .git/objects -type f | sort

# There should be: 1 blob (hello.txt), 1 tree (root dir), 1 commit
```

Create `explore_objects.py`:

```python
# explore_objects.py — explore git's object store
import subprocess
import os

def git(cmd: str) -> str:
    result = subprocess.run(
        ["git"] + cmd.split(),
        capture_output=True, text=True, cwd="."
    )
    return result.stdout.strip()

def list_all_objects():
    """List all objects and their types."""
    # All loose objects are in .git/objects/XX/YYYYY...
    objects = []
    objects_dir = ".git/objects"
    for subdir in os.listdir(objects_dir):
        full_subdir = os.path.join(objects_dir, subdir)
        if len(subdir) == 2 and os.path.isdir(full_subdir):
            for filename in os.listdir(full_subdir):
                sha = subdir + filename
                obj_type = git(f"cat-file -t {sha}")
                objects.append((sha, obj_type))
    return sorted(objects, key=lambda x: x[1])

def show_commit_graph():
    """Show commits and what they point to."""
    log = git("log --oneline --all")
    print("=== Commit Graph ===")
    for line in log.splitlines():
        sha_short, message = line.split(" ", 1)
        sha_full = git(f"rev-parse {sha_short}")
        
        # Show what the commit points to
        commit_content = git(f"cat-file -p {sha_full}")
        tree_line = next(l for l in commit_content.splitlines() if l.startswith("tree"))
        tree_sha = tree_line.split()[1]
        
        print(f"\nCommit: {sha_short} — '{message}'")
        print(f"  Full SHA: {sha_full}")
        print(f"  Points to tree: {tree_sha}")
        
        # Show tree contents
        tree_content = git(f"cat-file -p {tree_sha}")
        for entry in tree_content.splitlines():
            print(f"    {entry}")

if __name__ == "__main__":
    print("=== All Objects in .git/objects ===")
    for sha, obj_type in list_all_objects():
        print(f"  {sha[:12]}... ({obj_type})")
    
    print()
    show_commit_graph()
    
    # Show the branch pointer
    main_sha = open(".git/refs/heads/main", "r").read().strip()
    print(f"\n=== Branch Pointer ===")
    print(f"  refs/heads/main → {main_sha[:12]}...")
    print(f"  (branch is just a file containing one SHA)")
```

### SAVE AND TRY

```
python explore_objects.py
```

Expected output (SHAs will differ):
```
=== All Objects in .git/objects ===
  8ab686eafeb1... (blob)
  4b825dc642cb... (tree)
  abc123def456... (commit)

Commit: abc123 — 'Initial commit'
  Full SHA: abc123def456...
  Points to tree: 4b825dc...
    100644 blob 8ab686e... hello.txt

=== Branch Pointer ===
  refs/heads/main → abc123def456...
  (branch is just a file containing one SHA)
```

**Change something:** Add a second file and commit:
```bash
echo "world" > world.txt
git add world.txt
git commit -m "Add world.txt"
python explore_objects.py
```

Now you have 5 objects: 2 blobs (hello.txt, world.txt), 2 trees (before and after), 2 commits. Notice the first tree is still there (immutable). The second tree is a new object.

---

## Step 2 — Implement the Git Object Format

Build the git object format in Python to understand the exact byte layout:

```python
# git_objects.py — implement git's object format from scratch
import hashlib
import zlib
import os

def create_blob(content: bytes) -> tuple[str, bytes]:
    """
    Create a git blob object.
    Format: "blob <size>\0<content>"
    Returns: (sha1_hex, compressed_bytes)
    """
    header = f"blob {len(content)}\0".encode()
    store_content = header + content
    sha1 = hashlib.sha1(store_content).hexdigest()
    compressed = zlib.compress(store_content)
    return sha1, compressed


def create_tree(entries: list[tuple[str, str, str]]) -> tuple[str, bytes]:
    """
    Create a git tree object.
    entries: list of (mode, sha1_hex, filename)
    Format: "tree <size>\0" + each entry as "<mode> <name>\0<20-byte-sha>"
    Returns: (sha1_hex, compressed_bytes)
    """
    body = b""
    for mode, sha1, filename in entries:
        # Tree entry: "<mode> <filename>\0<20 binary bytes of sha>"
        sha_bytes = bytes.fromhex(sha1)
        body += f"{mode} {filename}\0".encode() + sha_bytes
    
    header = f"tree {len(body)}\0".encode()
    store_content = header + body
    sha1 = hashlib.sha1(store_content).hexdigest()
    compressed = zlib.compress(store_content)
    return sha1, compressed


def create_commit(
    tree_sha: str,
    parent_sha: str | None,
    author: str,
    message: str,
    timestamp: int = 1620000000,
) -> tuple[str, bytes]:
    """
    Create a git commit object.
    Returns: (sha1_hex, compressed_bytes)
    """
    lines = [f"tree {tree_sha}"]
    if parent_sha:
        lines.append(f"parent {parent_sha}")
    lines.append(f"author {author} {timestamp} +0000")
    lines.append(f"committer {author} {timestamp} +0000")
    lines.append("")
    lines.append(message)
    
    body = "\n".join(lines).encode()
    header = f"commit {len(body)}\0".encode()
    store_content = header + body
    sha1 = hashlib.sha1(store_content).hexdigest()
    compressed = zlib.compress(store_content)
    return sha1, compressed


def write_object(git_dir: str, sha1: str, compressed: bytes) -> None:
    """Write a git object to the .git/objects directory."""
    obj_dir = os.path.join(git_dir, "objects", sha1[:2])
    os.makedirs(obj_dir, exist_ok=True)
    obj_path = os.path.join(obj_dir, sha1[2:])
    if not os.path.exists(obj_path):
        with open(obj_path, "wb") as f:
            f.write(compressed)


def read_object(git_dir: str, sha1: str) -> bytes:
    """Read and decompress a git object."""
    obj_path = os.path.join(git_dir, "objects", sha1[:2], sha1[2:])
    with open(obj_path, "rb") as f:
        return zlib.decompress(f.read())


if __name__ == "__main__":
    import subprocess
    
    # Work in a temp git repo
    os.makedirs("test_repo/.git/objects", exist_ok=True)
    os.makedirs("test_repo/.git/refs/heads", exist_ok=True)
    os.chdir("test_repo")
    subprocess.run(["git", "init", "-q"])
    
    print("=== Building git objects from scratch ===\n")
    
    # Create a blob for "hello.txt"
    content = b"Hello from scratch!\n"
    blob_sha, blob_compressed = create_blob(content)
    write_object(".git", blob_sha, blob_compressed)
    print(f"Blob SHA: {blob_sha}")
    print(f"Blob content (raw): {read_object('.git', blob_sha)}")
    
    # Create a tree containing that blob
    tree_sha, tree_compressed = create_tree([("100644", blob_sha, "hello.txt")])
    write_object(".git", tree_sha, tree_compressed)
    print(f"\nTree SHA: {tree_sha}")
    
    # Create a commit pointing to that tree
    commit_sha, commit_compressed = create_commit(
        tree_sha=tree_sha,
        parent_sha=None,
        author="Alice <alice@example.com>",
        message="Initial commit from scratch",
    )
    write_object(".git", commit_sha, commit_compressed)
    print(f"\nCommit SHA: {commit_sha}")
    
    # Verify with git
    print(f"\n=== Verification with git cat-file ===")
    print("Blob type:", subprocess.run(
        ["git", "cat-file", "-t", blob_sha], capture_output=True, text=True
    ).stdout.strip())
    
    print("Commit content:")
    print(subprocess.run(
        ["git", "cat-file", "-p", commit_sha], capture_output=True, text=True
    ).stdout)
    
    # Point HEAD to our commit
    with open(".git/refs/heads/main", "w") as f:
        f.write(commit_sha + "\n")
    
    with open(".git/HEAD", "w") as f:
        f.write("ref: refs/heads/main\n")
    
    print("git log:")
    print(subprocess.run(
        ["git", "log", "--oneline"], capture_output=True, text=True
    ).stdout)
    
    os.chdir("..")
```

### SAVE AND TRY

```
python git_objects.py
```

Expected output:
```
=== Building git objects from scratch ===

Blob SHA: c57afe31f...
Blob content (raw): b'blob 20\x00Hello from scratch!\n'

Tree SHA: 9a8b4c...

Commit SHA: def456...

=== Verification with git cat-file ===
Blob type: blob
Commit content:
tree 9a8b4c...
author Alice <alice@example.com> 1620000000 +0000
committer Alice <alice@example.com> 1620000000 +0000

Initial commit from scratch

git log:
def456... Initial commit from scratch
```

Our manually-created objects are valid git objects. `git cat-file` can read them. `git log` shows our commit. This is exactly what `git add` and `git commit` do internally.

**Change something:** Run `git cat-file -p <blob_sha>` directly in the `test_repo` directory — it returns `Hello from scratch!`. The format we implemented is exactly what git uses.

---

## Step 3 — Visualize the Commit Graph

```python
# visualize_git.py — visualize a git repository's object graph
import subprocess
import os
import textwrap

def git_run(cmd: str, cwd: str = ".") -> str:
    result = subprocess.run(["git"] + cmd.split(), capture_output=True, text=True, cwd=cwd)
    return result.stdout.strip()

def visualize_history():
    """Show commit graph with trees and blobs."""
    commits = git_run("log --format=%H --all").splitlines()
    
    print("=== Repository Object Graph ===\n")
    
    for commit_sha in commits:
        # Commit info
        summary = git_run(f"log -1 --format=%s {commit_sha}")
        parent = git_run(f"log -1 --format=%P {commit_sha}")
        tree_sha = git_run(f"log -1 --format=%T {commit_sha}")
        
        print(f"COMMIT {commit_sha[:8]} — '{summary}'")
        if parent:
            print(f"  parent → {parent[:8]}")
        print(f"  tree   → {tree_sha[:8]}")
        
        # Show tree contents recursively
        tree_content = git_run(f"ls-tree -r --full-tree {tree_sha}")
        for entry in tree_content.splitlines():
            parts = entry.split("\t", 1)
            meta, filename = parts[0], parts[1]
            _, obj_type, sha = meta.split()
            print(f"    {obj_type} {sha[:8]} {filename}")
        
        print()
    
    # Show branch and tag refs
    print("=== References ===")
    refs = git_run("show-ref").splitlines()
    for ref in refs:
        sha, name = ref.split()
        print(f"  {name:<40} → {sha[:8]}")

def show_diff_as_objects(commit_sha: str):
    """Show what objects changed between a commit and its parent."""
    parent = git_run(f"log -1 --format=%P {commit_sha}")
    if not parent:
        print("Initial commit — all objects are new")
        return
    
    print(f"=== Objects changed in {commit_sha[:8]} ===")
    diff_tree = git_run(f"diff-tree -r {parent} {commit_sha}")
    for line in diff_tree.splitlines():
        parts = line.split()
        old_mode, new_mode, old_sha, new_sha, status, filename = parts
        if status == "M":
            print(f"  Modified: {filename}")
            print(f"    Old blob: {old_sha[:8]}")
            print(f"    New blob: {new_sha[:8]}")
        elif status == "A":
            print(f"  Added: {filename} → blob {new_sha[:8]}")
        elif status == "D":
            print(f"  Deleted: {filename}")

if __name__ == "__main__":
    visualize_history()
    
    # Show last commit's objects
    latest = git_run("rev-parse HEAD")
    show_diff_as_objects(latest)
```

### SAVE AND TRY

```
python visualize_git.py
```

Run this in any git repo with some history. It shows the exact object graph: commits → trees → blobs.

**Change something:** Run `git log --graph --oneline --all` in the same repo. The ASCII art graph corresponds exactly to the commit objects and their parent pointers you saw in the visualizer.

---

## Challenge

**No solution provided. Requirements checklist only.**

Implement a minimal `git log` and `git diff` using only Python and the `.git` directory — no subprocess calls to git.

**Requirements checklist:**

- [ ] `read_object(git_dir, sha) → (type_str, content_bytes)` — reads and decompresses any object from `.git/objects/`
- [ ] `parse_commit(content) → dict` — parses a commit's raw bytes into `{tree, parent, author, message}`
- [ ] `parse_tree(content) → list[dict]` — parses a tree's bytes into `[{mode, type, sha, name}]`
- [ ] `walk_commits(git_dir, start_sha) → list[dict]` — follows parent pointers from `start_sha` to the root, returns all commits in order
- [ ] `mini_git_log(repo_path)` — reads `HEAD`, follows to current branch ref, walks commits, prints:
  ```
  commit abc123 (HEAD -> main)
  Author: Alice <alice@example.com>
  Date:   <timestamp>
  
      Initial commit
  ```
- [ ] `mini_git_diff(repo_path, sha1, sha2)` — compares two commit trees and prints which files changed (added, modified, deleted)
- [ ] `mini_git_show(repo_path, sha)` — for a given commit SHA, shows the commit message plus unified diff of changes vs parent

**Starter:**
```python
import zlib
import os
import struct

def read_object(git_dir: str, sha: str) -> tuple[str, bytes]:
    path = os.path.join(git_dir, "objects", sha[:2], sha[2:])
    raw = zlib.decompress(open(path, "rb").read())
    # Format: "<type> <size>\0<content>"
    null_pos = raw.index(b"\0")
    header = raw[:null_pos].decode()
    obj_type, _ = header.split(" ", 1)
    content = raw[null_pos + 1:]
    return obj_type, content

def parse_commit(content: bytes) -> dict:
    # TODO: parse "tree <sha>\nparent <sha>\nauthor ...\n\n<message>"
    pass

def parse_tree(content: bytes) -> list[dict]:
    # TODO: parse entries: "<mode> <name>\0<20-bytes-sha>"
    # Note: sha in tree entries is 20 raw bytes, not hex string
    # Convert with: sha.hex()
    pass
```

**When you're done:**
```python
# run against any real git repo
mini_git_log("/path/to/your/repo/.git")
```
Output matches `git log --oneline` for the same repo.

**Stuck?** Ask AI: "In Python, how do I parse a git tree object's binary format? Each entry is '<mode> <name>\\0<20-raw-bytes>' where the SHA is 20 binary bytes, not hex. Show me how to iterate through the entries and convert the binary SHA to a hex string."

---

## Quick Check Answers

**1. Objects created for two commits modifying one file:**
First commit: 1 blob (file content v1), 1 tree (root dir), 1 commit. Second commit (modifying the file): 1 new blob (file content v2), 1 new tree (updated root dir pointing to new blob), 1 new commit. Total: 6 objects. The original blob and tree are preserved (immutable) — they're still referenced by the first commit. Unchanged files (other files in the root) still point to the same blobs they always did.

**2. `git cherry-pick` — copy or re-apply diff:**
Cherry-pick re-applies the diff. It computes the diff between the commit and its parent (`what changed`), then applies that patch to the current branch's latest commit. It creates a new commit with new blobs and a new SHA. The code change is identical but the commit object is different (different parent, different timestamp, different SHA). This is why cherry-picking creates a "copy" of the commit — same logical change, different git object.

**3. What happens to objects after `git reset --hard HEAD~1`:**
The commit objects remain in `.git/objects/`. `reset --hard` just moves the branch pointer (`refs/heads/main`) to point to the previous commit. The "removed" commit is still there — `git reflog` shows it, and you can restore it with `git reset --hard <old_sha>`. The objects are only truly deleted when `git gc` runs and removes unreachable objects (objects with no ref pointing to them, not in reflog). By default, objects are kept for at least 30 days.

**4. Fast-forward merge:**
A fast-forward merge moves the branch pointer. If `main` is at commit A and `feature` is at commit C (with B and C ahead of A), fast-forward merge just updates `refs/heads/main` to point to C. No new commit object is created. The commit graph already had a linear path — no "merge commit" is needed. `git merge --no-ff` forces a merge commit even when fast-forward is possible, preserving the branch history visually.
