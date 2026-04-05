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
    this.reset()
  }

  reset() {
    this.objects = new Map() // hash -> { type, data }
    this.branches = { main: null }
    this.head = 'main'
    this.staging = new Map() // filename -> hash
    this.workingDir = new Map() // filename -> content
    this.statusMessage = 'Initialized empty git repository.'
  }

  // ─── WORKING DIRECTORY ────────────────────────────────────────────────────────
  writeFile(path, content) {
    this.workingDir.set(path, content)
  }

  readFile(path) {
    return this.workingDir.get(path) ?? ''
  }

  // ─── STAGING ────────────────────────────────────────────────────────────────
  add(path) {
    const content = this.workingDir.get(path)
    if (content === undefined) {
      this.statusMessage = `error: pathspec '${path}' did not match any files.`
      return
    }

    const hash = this._hash(content)
    this.objects.set(hash, { type: 'blob', data: content })
    this.staging.set(path, hash)
    this.statusMessage = `added '${path}' to stage.`
  }

  status() {
    const staged = Array.from(this.staging.keys())
    const unstaged = Array.from(this.workingDir.keys()).filter(f => {
      const content = this.workingDir.get(f)
      const hash = this._hash(content)
      return this.staging.get(f) !== hash
    })

    return {
      branch: this.head,
      staged,
      modified: unstaged
    }
  }
  commit(message) {
    if (this.staging.size === 0) {
      this.statusMessage = 'nothing to commit, working tree clean'
      return null
    }

    // 1. Create Tree Object from Staging
    const treeData = Array.from(this.staging.entries()).map(([p, h]) => `${p}:${h}`).join('\n')
    const treeHash = this._hash(treeData)
    this.objects.set(treeHash, { type: 'tree', data: treeData })

    // 2. Create Commit Object
    const parent = this._getBranchTip(this.head)
    const commit = {
      tree: treeHash,
      parent,
      message,
      timestamp: Date.now(),
      author: 'User <user@opencalc.io>'
    }
    const commitHash = this._hash(JSON.stringify(commit))
    this.objects.set(commitHash, { type: 'commit', data: commit })

    // 3. Move Branch Pointer
    if (this._isDetached()) {
      this.head = commitHash
    } else {
      this.branches[this.head] = commitHash
    }

    this.staging.clear()
    this.statusMessage = `[${this.head} ${commitHash.slice(0,7)}] ${message}`
    return commitHash
  }

  // ─── BRANCHING ──────────────────────────────────────────────────────────────
  branch(name) {
    if (this.branches[name]) {
      this.statusMessage = `fatal: a branch named '${name}' already exists.`
      return
    }
    this.branches[name] = this._getBranchTip(this.head)
    this.statusMessage = `Created branch '${name}'.`
  }

  checkout(target) {
    // 1. If Target is branch
    if (this.branches[target] !== undefined) {
      this.head = target
      this._restoreWorkingDir(this.branches[target])
      this.statusMessage = `Switched to branch '${target}'.`
    } 
    // 2. If Target is commit hash
    else if (this.objects.has(target)) {
      this.head = target // Detached HEAD
      this._restoreWorkingDir(target)
      this.statusMessage = `Note: switching to '${target.slice(0,7)}' (Detached HEAD).`
    } else {
      this.statusMessage = `error: pathspec '${target}' did not match any file(s) known to git.`
    }
  }

  // ─── TEAM SIMULATION ───────────────────────────────────────────────────────
  simulateTeamChange(type = 'commit') {
    if (type === 'commit') {
        const originalHead = this.head
        const originalMainTip = this.branches['main']
        
        // Switch to main if not there
        this.head = 'main'
        const content = this.workingDir.get('main.js') || '// Initial code'
        this.workingDir.set('main.js', content + '\n// Team member update @ ' + new Date().toLocaleTimeString())
        this.add('main.js')
        this.commit('Collaborative update from origin/main')
        
        // Restore head
        this.head = originalHead
        return 'Team member pushed a change to origin/main'
    }
  }

  // ─── HELPERS ────────────────────────────────────────────────────────────────
  _hash(data) {
    // Simple but realistic looking hash (JS version of a basic rolling hash)
    let h1 = 0x811c9dc5, h2 = 0xdeadbeef
    for (let i = 0; i < data.length; i++) {
        h1 = Math.imul(h1 ^ data.charCodeAt(i), 16777619)
        h2 = Math.imul(h2 ^ data.charCodeAt(i), 16777619)
    }
    const h = ((h1 >>> 0).toString(16) + (h2 >>> 0).toString(16)).substring(0, 40)
    return h.padStart(10, '0')
  }

  _getBranchTip(ref) {
    return this.branches[ref] ?? ref // Returns hash if ref is a branch name, else returns ref
  }

  _isDetached() {
    return this.branches[this.head] === undefined
  }

  _restoreWorkingDir(commitHash) {
    const commit = this.objects.get(commitHash)?.data
    if (!commit) return
    const tree = this.objects.get(commit.tree)?.data
    if (!tree) return

    this.workingDir.clear()
    tree.split('\n').forEach(line => {
      const [path, hash] = line.split(':')
      this.workingDir.set(path, this.objects.get(hash).data)
    })
  }

  getHistory() {
    const history = []
    let current = this._getBranchTip(this.head)
    while (current) {
      const obj = this.objects.get(current)
      if (!obj) break
      const commit = obj.data
      history.push({ hash: current, ...commit })
      current = commit.parent
    }
    return history
  }
}
