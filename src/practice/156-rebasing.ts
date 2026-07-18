import type { PracticeChallenge } from './loader'

export const title = 'Rebasing'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `fakeHash(parent, message)` returning `\'hash(\' + parent + \':\' + message + \')\'` — a stand-in for git\'s content-addressed hash, which changes if the parent changes. Confirm that replaying the same logical change onto a DIFFERENT parent produces a different id.',
        starter: '',
        tests: `
const c1 = { id: fakeHash('root', 'initial'), parent: 'root', message: 'initial' }
assert c1.id === 'hash(root:initial)'
const c2 = { id: fakeHash(c1.id, 'add login'), parent: c1.id, message: 'add login' }
const c3 = { id: fakeHash(c1.id, 'fix typo'), parent: c1.id, message: 'fix typo' }
const c2rebased = { id: fakeHash(c3.id, 'add login'), parent: c3.id, message: 'add login' }
assert c2.id !== c2rebased.id
`,
        solution: `function fakeHash(parent, message) {
  return 'hash(' + parent + ':' + message + ')'
}`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Fix `rebaseCommits(commits, newParentId)`: the FIRST commit replays onto `newParentId`, but every commit AFTER that must chain onto the PREVIOUSLY rebased commit — not directly onto `newParentId` every time, which would silently drop the ordering between the replayed commits.',
        starter: 'function fakeHash(parent, message) {\n  return \'hash(\' + parent + \':\' + message + \')\'\n}\nfunction rebaseCommits(commits, newParentId) {\n  // TODO: each commit after the first must chain onto the PREVIOUSLY\n  // rebased commit, not directly onto newParentId every time\n  const rebased = []\n  for (const commit of commits) {\n    const id = fakeHash(newParentId, commit.message)\n    rebased.push({ id, parent: newParentId, message: commit.message })\n  }\n  return rebased\n}',
        tests: `
const original = [{message:'add login'}, {message:'add logout'}]
const rebased = rebaseCommits(original, 'C3')
assert rebased[0].parent === 'C3'
assert rebased[1].parent === rebased[0].id
`,
        solution: `function fakeHash(parent, message) {
  return 'hash(' + parent + ':' + message + ')'
}
function rebaseCommits(commits, newParentId) {
  let parent = newParentId
  const rebased = []
  for (const commit of commits) {
    const id = fakeHash(parent, commit.message)
    rebased.push({ id, parent, message: commit.message })
    parent = id
  }
  return rebased
}`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `isSafeToRebase(commits, pushedCommitIds)` returning `false` if ANY commit being rebased already exists in `pushedCommitIds` — rebasing already-shared commits creates duplicate, conflicting history for anyone who already pulled them; only purely local, not-yet-pushed commits are safe to rebase.',
        starter: '',
        tests: `
const commits = [{id:'C2a'}, {id:'C2b'}]
assert isSafeToRebase(commits, new Set(['C2a'])) === false
assert isSafeToRebase(commits, new Set()) === true
`,
        solution: `function isSafeToRebase(commits, pushedCommitIds) {
  return commits.every(c => !pushedCommitIds.has(c.id))
}`,
      },
    ],
  },
]

export default challenges
