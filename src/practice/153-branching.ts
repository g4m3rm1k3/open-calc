import type { PracticeChallenge } from './loader'

export const title = 'Branching'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `makeRepo()` returning `{ createBranch(name, from), commit(branch, message), head(branch), getParent(commitId) }`. `createBranch` makes a new pointer at the SAME commit as `from`; `commit` advances only the given branch\'s pointer, leaving others untouched.',
        starter: '',
        tests: `
const repo = makeRepo()
assert (repo.createBranch('feature', 'main'), true)
assert repo.head('main') === repo.head('feature')
assert (repo.commit('feature', 'add login form'), true)
assert (repo.commit('main', 'fix typo in README'), true)
assert repo.head('main') !== repo.head('feature')
`,
        solution: `function makeRepo() {
  const commits = { C1: { parent: null, message: 'initial' } }
  const branches = { main: 'C1' }
  let nextId = 2
  return {
    createBranch(name, from) { branches[name] = branches[from] },
    commit(branch, message) {
      const id = 'C' + nextId++
      commits[id] = { parent: branches[branch], message }
      branches[branch] = id
    },
    head(branch) { return branches[branch] },
    getParent(commitId) { return commits[commitId].parent },
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
        prompt: 'Finish `getBranchHistory(repo, branch)`: walk parent pointers from the branch\'s head all the way back to the root (`parent === null`), collecting every commit id along the way, most recent first.',
        starter: 'function makeRepo() {\n  const commits = { C1: { parent: null, message: \'initial\' } }\n  const branches = { main: \'C1\' }\n  let nextId = 2\n  return {\n    createBranch(name, from) { branches[name] = branches[from] },\n    commit(branch, message) {\n      const id = \'C\' + nextId++\n      commits[id] = { parent: branches[branch], message }\n      branches[branch] = id\n    },\n    head(branch) { return branches[branch] },\n    getParent(commitId) { return commits[commitId].parent },\n  }\n}\nfunction getBranchHistory(repo, branch) {\n  // TODO: walk parent pointers from the branch\'s head all the way back to\n  // the root (parent === null), collecting every commit id along the way\n  return [repo.head(branch)]\n}',
        tests: `
const repo = makeRepo()
assert (repo.createBranch('feature', 'main'), true)
assert (repo.commit('feature', 'add login form'), true)
assert (repo.commit('main', 'fix typo in README'), true)
assert JSON.stringify(getBranchHistory(repo, 'main')) === JSON.stringify(['C3','C1'])
assert JSON.stringify(getBranchHistory(repo, 'feature')) === JSON.stringify(['C2','C1'])
`,
        solution: `function makeRepo() {
  const commits = { C1: { parent: null, message: 'initial' } }
  const branches = { main: 'C1' }
  let nextId = 2
  return {
    createBranch(name, from) { branches[name] = branches[from] },
    commit(branch, message) {
      const id = 'C' + nextId++
      commits[id] = { parent: branches[branch], message }
      branches[branch] = id
    },
    head(branch) { return branches[branch] },
    getParent(commitId) { return commits[commitId].parent },
  }
}
function getBranchHistory(repo, branch) {
  const history = []
  let current = repo.head(branch)
  while (current !== null) {
    history.push(current)
    current = repo.getParent(current)
  }
  return history
}`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `findMergeBase(repo, branchA, branchB)` returning the most recent commit id shared by BOTH branches\' histories — the point where they diverged, walking `branchB`\'s history until a commit already in `branchA`\'s history is found.',
        starter: '',
        tests: `
const repo = makeRepo()
assert (repo.createBranch('feature', 'main'), true)
assert (repo.commit('feature', 'add login form'), true)
assert (repo.commit('main', 'fix typo in README'), true)
assert findMergeBase(repo, 'main', 'feature') === 'C1'
`,
        solution: `function makeRepo() {
  const commits = { C1: { parent: null, message: 'initial' } }
  const branches = { main: 'C1' }
  let nextId = 2
  return {
    createBranch(name, from) { branches[name] = branches[from] },
    commit(branch, message) {
      const id = 'C' + nextId++
      commits[id] = { parent: branches[branch], message }
      branches[branch] = id
    },
    head(branch) { return branches[branch] },
    getParent(commitId) { return commits[commitId].parent },
  }
}
function getBranchHistory(repo, branch) {
  const history = []
  let current = repo.head(branch)
  while (current !== null) {
    history.push(current)
    current = repo.getParent(current)
  }
  return history
}
function findMergeBase(repo, branchA, branchB) {
  const historyA = new Set(getBranchHistory(repo, branchA))
  let current = repo.head(branchB)
  while (current !== null) {
    if (historyA.has(current)) return current
    current = repo.getParent(current)
  }
  return null
}`,
      },
    ],
  },
]

export default challenges
