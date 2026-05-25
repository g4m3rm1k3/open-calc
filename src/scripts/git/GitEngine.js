/**
 * GitEngine - A high-fidelity JS simulation of the Git internal logic.
 * Manages:
 *   - Blobs (Content)
 *   - Trees (Directory)
 *   - Commits (History)
 *   - Staging (The Index)
 *   - Refs (Branches)
 *   - Working Directory (Virtual RAM Filesystem)
 */

export class GitEngine {
  constructor() {
    this.reset();
  }

  reset() {
    this.objects = new Map(); // hash -> { type, data }
    this.branches = { main: null };
    this.head = "main";
    this.staging = new Map(); // filename -> hash
    this.workingDir = new Map(); // filename -> content
    this.statusMessage = "Initialized empty git repository.";
  }

  // ─── WORKING DIRECTORY ────────────────────────────────────────────────────────
  writeFile(path, content) {
    this.workingDir.set(path, content);
  }

  readFile(path) {
    return this.workingDir.get(path) ?? "";
  }

  // ─── STAGING ────────────────────────────────────────────────────────────────
  add(path) {
    const content = this.workingDir.get(path);
    if (content === undefined) {
      this.statusMessage = `error: pathspec '${path}' did not match any files.`;
      return;
    }

    const hash = this._hash(content);
    this.objects.set(hash, { type: "blob", data: content });
    this.staging.set(path, hash);
    this.statusMessage = `added '${path}' to stage.`;
  }

  // Returns Map<filename, content> of files in the current HEAD commit tree
  getCommittedFiles() {
    const tip = this._getBranchTip(this.head);
    if (!tip) return new Map();
    const commit = this.objects.get(tip)?.data;
    if (!commit) return new Map();
    const tree = this.objects.get(commit.tree)?.data;
    if (!tree) return new Map();
    const result = new Map();
    tree.split("\n").forEach((line) => {
      const [path, hash] = line.split(":");
      result.set(path, this.objects.get(hash)?.data ?? "");
    });
    return result;
  }

  status() {
    const committed = this.getCommittedFiles();
    const staged = Array.from(this.staging.keys());

    // Modified: tracked files (committed or staged) whose content differs from staged version
    const modified = Array.from(this.workingDir.keys()).filter((f) => {
      const content = this.workingDir.get(f);
      const hash = this._hash(content);
      if (this.staging.has(f)) return this.staging.get(f) !== hash;
      if (committed.has(f)) return this._hash(committed.get(f)) !== hash;
      return false; // untracked — not modified
    });

    // Untracked: in workingDir but never committed and never staged
    const untracked = Array.from(this.workingDir.keys()).filter(
      (f) => !committed.has(f) && !this.staging.has(f),
    );

    // Deleted: in last commit but missing from workingDir
    const deleted = Array.from(committed.keys()).filter(
      (f) => !this.workingDir.has(f),
    );

    return {
      branch: this.head,
      staged,
      modified,
      untracked,
      deleted,
    };
  }

  deleteFile(path) {
    this.workingDir.delete(path);
  }

  renameFile(oldPath, newPath) {
    const content = this.workingDir.get(oldPath);
    if (content === undefined) return;
    this.workingDir.set(newPath, content);
    this.workingDir.delete(oldPath);
    if (this.staging.has(oldPath)) {
      this.staging.set(newPath, this.staging.get(oldPath));
      this.staging.delete(oldPath);
    }
  }

  // Restore a file from the last commit (git restore <file>)
  discardChanges(path) {
    const committed = this.getCommittedFiles();
    if (committed.has(path)) {
      this.workingDir.set(path, committed.get(path));
    } else {
      // File wasn't in last commit — remove it (discard untracked addition)
      this.workingDir.delete(path);
    }
    this.staging.delete(path);
  }
  commit(message) {
    if (this.staging.size === 0) {
      this.statusMessage = "nothing to commit, working tree clean";
      return null;
    }

    // 1. Create Tree Object from Staging
    const treeData = Array.from(this.staging.entries())
      .map(([p, h]) => `${p}:${h}`)
      .join("\n");
    const treeHash = this._hash(treeData);
    this.objects.set(treeHash, { type: "tree", data: treeData });

    // 2. Create Commit Object
    const parent = this._getBranchTip(this.head);
    const commit = {
      tree: treeHash,
      parent,
      message,
      timestamp: Date.now(),
      author: "User <user@opencalc.io>",
    };
    const commitHash = this._hash(JSON.stringify(commit));
    this.objects.set(commitHash, { type: "commit", data: commit });

    // 3. Move Branch Pointer
    if (this._isDetached()) {
      this.head = commitHash;
    } else {
      this.branches[this.head] = commitHash;
    }

    this.staging.clear();
    this.statusMessage = `[${this.head} ${commitHash.slice(0, 7)}] ${message}`;
    return commitHash;
  }

  // ─── BRANCHING ──────────────────────────────────────────────────────────────
  branch(name) {
    if (this.branches[name]) {
      this.statusMessage = `fatal: a branch named '${name}' already exists.`;
      return;
    }
    this.branches[name] = this._getBranchTip(this.head);
    this.statusMessage = `Created branch '${name}'.`;
  }

  checkout(target) {
    // 1. If Target is branch
    if (this.branches[target] !== undefined) {
      this.head = target;
      this._restoreWorkingDir(this.branches[target]);
      this.statusMessage = `Switched to branch '${target}'.`;
    }
    // 2. If Target is commit hash
    else if (this.objects.has(target)) {
      this.head = target; // Detached HEAD
      this._restoreWorkingDir(target);
      this.statusMessage = `Note: switching to '${target.slice(0, 7)}' (Detached HEAD).`;
    } else {
      this.statusMessage = `error: pathspec '${target}' did not match any file(s) known to git.`;
    }
  }

  // ─── TEAM SIMULATION ───────────────────────────────────────────────────────
  simulateTeamChange(type = "commit") {
    if (type === "commit") {
      const originalHead = this.head;
      const originalMainTip = this.branches["main"];

      // Switch to main if not there
      this.head = "main";
      const content = this.workingDir.get("main.js") || "// Initial code";
      this.workingDir.set(
        "main.js",
        content +
          "\n// Team member update @ " +
          new Date().toLocaleTimeString(),
      );
      this.add("main.js");
      this.commit("Collaborative update from origin/main");

      // Restore head
      this.head = originalHead;
      return "Team member pushed a change to origin/main";
    }
  }

  // ─── HELPERS ────────────────────────────────────────────────────────────────
  _hash(data) {
    // Simple but realistic looking hash (JS version of a basic rolling hash)
    let h1 = 0x811c9dc5,
      h2 = 0xdeadbeef;
    for (let i = 0; i < data.length; i++) {
      h1 = Math.imul(h1 ^ data.charCodeAt(i), 16777619);
      h2 = Math.imul(h2 ^ data.charCodeAt(i), 16777619);
    }
    const h = ((h1 >>> 0).toString(16) + (h2 >>> 0).toString(16)).substring(
      0,
      40,
    );
    return h.padStart(10, "0");
  }

  _getBranchTip(ref) {
    return this.branches[ref] ?? ref; // Returns hash if ref is a branch name, else returns ref
  }

  _isDetached() {
    return this.branches[this.head] === undefined;
  }

  _restoreWorkingDir(commitHash) {
    const commit = this.objects.get(commitHash)?.data;
    if (!commit) return;
    const tree = this.objects.get(commit.tree)?.data;
    if (!tree) return;

    this.workingDir.clear();
    tree.split("\n").forEach((line) => {
      const [path, hash] = line.split(":");
      this.workingDir.set(path, this.objects.get(hash).data);
    });
  }

  getHistory() {
    const history = [];
    let current = this._getBranchTip(this.head);
    while (current) {
      const obj = this.objects.get(current);
      if (!obj) break;
      const commit = obj.data;
      history.push({ hash: current, ...commit });
      current = commit.parent;
    }
    return history;
  }

  // ─── MERGING ────────────────────────────────────────────────────────────────
  merge(sourceBranch) {
    const sourceTip = this.branches[sourceBranch];
    if (!sourceTip) return { error: `branch '${sourceBranch}' not found` };
    const currentTip = this._getBranchTip(this.head);
    if (!currentTip) return { error: "no commits on current branch" };
    if (sourceTip === currentTip) return { status: "already-up-to-date" };

    // Fast-forward: current tip is an ancestor of source tip
    if (this._isAncestor(currentTip, sourceTip)) {
      if (!this._isDetached()) this.branches[this.head] = sourceTip;
      else this.head = sourceTip;
      this._restoreWorkingDir(sourceTip);
      return { status: "fast-forward", hash: sourceTip };
    }

    // Three-way merge
    const sourceFiles = this._getFilesAtCommit(sourceTip);
    const currentFiles = this._getFilesAtCommit(currentTip);
    const ancestor = this._findCommonAncestor(currentTip, sourceTip);
    const baseFiles = ancestor ? this._getFilesAtCommit(ancestor) : new Map();

    const mergedFiles = new Map(currentFiles);
    const conflicts = [];

    for (const [path, srcContent] of sourceFiles) {
      const curContent = currentFiles.get(path);
      const baseContent = baseFiles.get(path);
      if (curContent === srcContent) continue;
      if (curContent === undefined || curContent === baseContent) {
        mergedFiles.set(path, srcContent);
      } else if (srcContent !== baseContent) {
        conflicts.push(path);
        mergedFiles.set(
          path,
          `<<<<<<< HEAD\n${curContent ?? ""}\n=======\n${srcContent}\n>>>>>>> ${sourceBranch}`,
        );
      }
    }

    if (conflicts.length > 0) {
      this.workingDir.clear();
      for (const [p, c] of mergedFiles) this.workingDir.set(p, c);
      this.staging.clear();
      return { status: "conflict", conflicts };
    }

    // No conflicts — apply merged state and create merge commit
    this.workingDir.clear();
    this.staging.clear();
    for (const [path, content] of mergedFiles) {
      this.workingDir.set(path, content);
      const hash = this._hash(content);
      this.objects.set(hash, { type: "blob", data: content });
      this.staging.set(path, hash);
    }
    const treeData = Array.from(this.staging.entries())
      .map(([p, h]) => `${p}:${h}`)
      .join("\n");
    const treeHash = this._hash(treeData);
    this.objects.set(treeHash, { type: "tree", data: treeData });
    const mergeCommitData = {
      tree: treeHash,
      parent: currentTip,
      mergeParent: sourceTip,
      message: `Merge branch '${sourceBranch}'`,
      timestamp: Date.now(),
      author: "User <user@opencalc.io>",
    };
    const mergeHash = this._hash(JSON.stringify(mergeCommitData));
    this.objects.set(mergeHash, { type: "commit", data: mergeCommitData });
    if (!this._isDetached()) this.branches[this.head] = mergeHash;
    else this.head = mergeHash;
    this.staging.clear();
    return { status: "merged", hash: mergeHash };
  }

  _getFilesAtCommit(commitHash) {
    const commit = this.objects.get(commitHash)?.data;
    if (!commit) return new Map();
    const tree = this.objects.get(commit.tree)?.data;
    if (!tree) return new Map();
    const result = new Map();
    tree.split("\n").forEach((line) => {
      const [path, hash] = line.split(":");
      result.set(path, this.objects.get(hash)?.data ?? "");
    });
    return result;
  }

  _isAncestor(ancestor, descendant) {
    const visited = new Set();
    let cur = descendant;
    while (cur && !visited.has(cur)) {
      if (cur === ancestor) return true;
      visited.add(cur);
      const obj = this.objects.get(cur);
      if (!obj) break;
      if (
        obj.data.mergeParent &&
        this._isAncestor(ancestor, obj.data.mergeParent)
      )
        return true;
      cur = obj.data.parent;
    }
    return false;
  }

  _findCommonAncestor(hash1, hash2) {
    // Collect all ancestors of hash1
    const ancestors1 = new Set();
    const v1 = new Set();
    let cur = hash1;
    while (cur && !v1.has(cur)) {
      ancestors1.add(cur);
      v1.add(cur);
      const obj = this.objects.get(cur);
      if (!obj) break;
      if (obj.data.mergeParent) {
        let mc = obj.data.mergeParent;
        const vm = new Set();
        while (mc && !vm.has(mc)) {
          ancestors1.add(mc);
          vm.add(mc);
          const mo = this.objects.get(mc);
          if (!mo) break;
          mc = mo.data.parent;
        }
      }
      cur = obj.data.parent;
    }
    // Walk hash2's ancestors, return first match
    cur = hash2;
    const v2 = new Set();
    while (cur && !v2.has(cur)) {
      if (ancestors1.has(cur)) return cur;
      v2.add(cur);
      const obj = this.objects.get(cur);
      if (!obj) break;
      if (obj.data.mergeParent && ancestors1.has(obj.data.mergeParent))
        return obj.data.mergeParent;
      cur = obj.data.parent;
    }
    return null;
  }
}
