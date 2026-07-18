import type { PracticeChallenge } from './loader'

export const title = 'Version Control (Git Basics)'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `makeRepo()` returning `{ stage(filename), commit(message), log() }`. `stage` adds a filename to the staging area; `commit` freezes the staged files into a numbered snapshot and clears staging; `log` returns `"#id message (files)"` strings in order.',
        starter: '',
        tests: `
const repo = makeRepo()
assert (repo.stage('a.txt'), true)
assert (repo.commit('first'), true)
assert (repo.stage('b.txt'), true)
assert (repo.stage('a.txt'), true)
assert (repo.commit('second'), true)
assert JSON.stringify(repo.log()) === JSON.stringify(['#1 first (a.txt)', '#2 second (b.txt, a.txt)'])
`,
        solution: `function makeRepo() {
  let staged = []
  const commits = []
  return {
    stage(filename) { staged.push(filename) },
    commit(message) {
      const snapshot = { id: commits.length + 1, message, files: [...staged] }
      commits.push(snapshot)
      staged = []
      return snapshot
    },
    log() { return commits.map(c => \`#\${c.id} \${c.message} (\${c.files.join(', ')})\`) },
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
        prompt: 'Finish `diffCommits(commitA, commitB)`, each `{ files: [...] }`, returning `{ added, removed }` — filenames present in `commitB` but not `commitA` (added), and present in `commitA` but not `commitB` (removed).',
        starter: 'function diffCommits(commitA, commitB) {\n  // TODO: return { added, removed } describing the difference between commitA.files and commitB.files\n  return { added: [], removed: [] }\n}',
        tests: `
const c1 = { files: ['a.txt', 'b.txt'] }
const c2 = { files: ['b.txt', 'c.txt'] }
assert JSON.stringify(diffCommits(c1, c2)) === JSON.stringify({ added: ['c.txt'], removed: ['a.txt'] })
const c3 = { files: ['x.txt'] }
assert JSON.stringify(diffCommits(c3, c3)) === JSON.stringify({ added: [], removed: [] })
`,
        solution: `function diffCommits(commitA, commitB) {
  const added = commitB.files.filter(f => !commitA.files.includes(f))
  const removed = commitA.files.filter(f => !commitB.files.includes(f))
  return { added, removed }
}`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `cumulativeState(commits)`, where each commit is `{ changes: { filename: content } }` (only the files it touched). Return an array — one full project state per commit — where each state merges that commit\'s changes on top of the previous full state, reflecting that a real commit snapshots the WHOLE tree, not just a diff.',
        starter: '',
        tests: `
const commits = [
  { changes: { 'a.txt': 'v1' } },
  { changes: { 'b.txt': 'v1' } },
  { changes: { 'a.txt': 'v2' } },
]
const result = cumulativeState(commits)
assert JSON.stringify(result[0]) === JSON.stringify({ 'a.txt': 'v1' })
assert JSON.stringify(result[1]) === JSON.stringify({ 'a.txt': 'v1', 'b.txt': 'v1' })
assert JSON.stringify(result[2]) === JSON.stringify({ 'a.txt': 'v2', 'b.txt': 'v1' })
`,
        solution: `function cumulativeState(commits) {
  const states = []
  let current = {}
  for (const c of commits) {
    current = { ...current, ...c.changes }
    states.push({ ...current })
  }
  return states
}`,
      },
    ],
  },
]

export default challenges
