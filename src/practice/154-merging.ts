import type { PracticeChallenge } from './loader'

export const title = 'Merging'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `makeRepo()` (extending the branching model) with `merge(into, from)`: create a new commit whose `parents` array is `[head(into), head(from)]`, advance `into`\'s pointer to it, and return the new commit id.',
        starter: '',
        tests: `
const repo = makeRepo()
assert (repo.createBranch('feature', 'main'), true)
assert (repo.commit('feature', 'add login form', {login: true}), true)
assert (repo.commit('main', 'fix typo', {typo: 'fixed'}), true)
const mergeCommit = repo.merge('main', 'feature')
assert repo.head('main') === mergeCommit
assert JSON.stringify(repo.parentsOf(mergeCommit)) === JSON.stringify(['C3','C2'])
`,
        solution: `function makeRepo() {
  const commits = { C1: { parents: [], message: 'initial', changes: {} } }
  const branches = { main: 'C1' }
  let nextId = 2
  return {
    createBranch(name, from) { branches[name] = branches[from] },
    commit(branch, message, changes) {
      const id = 'C' + nextId++
      commits[id] = { parents: [branches[branch]], message, changes }
      branches[branch] = id
      return id
    },
    merge(into, from) {
      const id = 'C' + nextId++
      const combined = { ...commits[branches[into]].changes, ...commits[branches[from]].changes }
      commits[id] = { parents: [branches[into], branches[from]], message: 'merge ' + from + ' into ' + into, changes: combined }
      branches[into] = id
      return id
    },
    head(branch) { return branches[branch] },
    parentsOf(commitId) { return commits[commitId].parents },
    getChanges(commitId) { return commits[commitId].changes },
  }
}`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Fix `merge`: it must combine changes from BOTH sides — the `into` branch\'s accumulated changes AND the `from` branch\'s — not just one side. A real three-way merge automatically combines non-overlapping changes from both branches.',
        starter: 'function makeRepo() {\n  const commits = { C1: { parents: [], message: \'initial\', changes: {} } }\n  const branches = { main: \'C1\' }\n  let nextId = 2\n  return {\n    createBranch(name, from) { branches[name] = branches[from] },\n    commit(branch, message, changes) {\n      const id = \'C\' + nextId++\n      commits[id] = { parents: [branches[branch]], message, changes }\n      branches[branch] = id\n      return id\n    },\n    merge(into, from) {\n      const id = \'C\' + nextId++\n      // TODO: combine changes from BOTH sides — the "into" branch\'s changes\n      // AND the "from" branch\'s changes — not just one side\n      const combined = { ...commits[branches[into]].changes }\n      commits[id] = { parents: [branches[into], branches[from]], message: \'merge \' + from + \' into \' + into, changes: combined }\n      branches[into] = id\n      return id\n    },\n    head(branch) { return branches[branch] },\n    parentsOf(commitId) { return commits[commitId].parents },\n    getChanges(commitId) { return commits[commitId].changes },\n  }\n}',
        tests: `
const repo = makeRepo()
assert (repo.createBranch('feature', 'main'), true)
assert (repo.commit('feature', 'add login form', {login: true}), true)
assert (repo.commit('main', 'fix typo', {typo: 'fixed'}), true)
const mergeCommit = repo.merge('main', 'feature')
assert JSON.stringify(repo.getChanges(mergeCommit)) === JSON.stringify({typo:'fixed', login:true})
`,
        solution: `function makeRepo() {
  const commits = { C1: { parents: [], message: 'initial', changes: {} } }
  const branches = { main: 'C1' }
  let nextId = 2
  return {
    createBranch(name, from) { branches[name] = branches[from] },
    commit(branch, message, changes) {
      const id = 'C' + nextId++
      commits[id] = { parents: [branches[branch]], message, changes }
      branches[branch] = id
      return id
    },
    merge(into, from) {
      const id = 'C' + nextId++
      const combined = { ...commits[branches[into]].changes, ...commits[branches[from]].changes }
      commits[id] = { parents: [branches[into], branches[from]], message: 'merge ' + from + ' into ' + into, changes: combined }
      branches[into] = id
      return id
    },
    head(branch) { return branches[branch] },
    parentsOf(commitId) { return commits[commitId].parents },
    getChanges(commitId) { return commits[commitId].changes },
  }
}`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `getCommitAncestors(repo, commitId)` returning a `Set` of every ancestor (including `commitId` itself), correctly following ALL parents of a merge commit (not just one) — since a merge commit has two, both sides of history must be walked.',
        starter: '',
        tests: `
const repo = makeRepo()
assert (repo.createBranch('feature', 'main'), true)
assert (repo.commit('feature', 'add login form', {login:true}), true)
assert (repo.commit('main', 'fix typo', {typo:'fixed'}), true)
const mergeCommit = repo.merge('main', 'feature')
const ancestors = getCommitAncestors(repo, mergeCommit)
assert ancestors.has('C1') === true
assert ancestors.has('C2') === true
assert ancestors.has('C3') === true
assert ancestors.size === 4
`,
        solution: `function makeRepo() {
  const commits = { C1: { parents: [], message: 'initial', changes: {} } }
  const branches = { main: 'C1' }
  let nextId = 2
  return {
    createBranch(name, from) { branches[name] = branches[from] },
    commit(branch, message, changes) {
      const id = 'C' + nextId++
      commits[id] = { parents: [branches[branch]], message, changes }
      branches[branch] = id
      return id
    },
    merge(into, from) {
      const id = 'C' + nextId++
      const combined = { ...commits[branches[into]].changes, ...commits[branches[from]].changes }
      commits[id] = { parents: [branches[into], branches[from]], message: 'merge ' + from + ' into ' + into, changes: combined }
      branches[into] = id
      return id
    },
    head(branch) { return branches[branch] },
    parentsOf(commitId) { return commits[commitId].parents },
    getChanges(commitId) { return commits[commitId].changes },
  }
}
function getCommitAncestors(repo, commitId) {
  const visited = new Set()
  function visit(id) {
    if (visited.has(id)) return
    visited.add(id)
    for (const parent of repo.parentsOf(id)) {
      visit(parent)
    }
  }
  visit(commitId)
  return visited
}`,
      },
    ],
  },
]

export default challenges
