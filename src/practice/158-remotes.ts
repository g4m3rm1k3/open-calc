import type { PracticeChallenge } from './loader'

export const title = 'Remotes'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `makeRemote()` (`{ commits: [\'C1\'] }`) and `makeLocalRepo(remote)` returning `{ commits, commit(id), push(), pull() }`. A local `commit` only affects that repo\'s own `commits` until `push()` uploads it to the remote; another repo only sees it after calling `pull()`.',
        starter: '',
        tests: `
const remote = makeRemote()
const devA = makeLocalRepo(remote)
const devB = makeLocalRepo(remote)
assert (devA.commit('C2'), true)
assert JSON.stringify(remote.commits) === JSON.stringify(['C1'])
assert JSON.stringify(devB.commits) === JSON.stringify(['C1'])
assert (devA.push(), true)
assert JSON.stringify(remote.commits) === JSON.stringify(['C1','C2'])
assert (devB.pull(), true)
assert JSON.stringify(devB.commits) === JSON.stringify(['C1','C2'])
`,
        solution: `function makeRemote() {
  return { commits: ['C1'] }
}
function makeLocalRepo(remote) {
  let commits = [...remote.commits]
  return {
    get commits() { return commits },
    commit(id) { commits.push(id) },
    push() { remote.commits = [...commits] },
    pull() { commits = [...remote.commits] },
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
        prompt: 'Fix `fetch()`: it must download the remote\'s commits into `fetchedRef` WITHOUT merging them into the active `commits` — only `pull()` does both. Confusing the two means assuming you have the latest changes when you\'ve only downloaded, not merged, them.',
        starter: 'function makeRemote() {\n  return { commits: [\'C1\'] }\n}\nfunction makeLocalRepo(remote) {\n  let commits = [...remote.commits]\n  let fetchedRef = null\n  return {\n    get commits() { return commits },\n    get fetchedRef() { return fetchedRef },\n    commit(id) { commits.push(id) },\n    push() { remote.commits = [...commits] },\n    // TODO: fetch must download the remote\'s commits into fetchedRef WITHOUT\n    // merging them into the active commits — only pull() does both\n    fetch() { commits = [...remote.commits]; fetchedRef = [...remote.commits] },\n    pull() {\n      fetchedRef = [...remote.commits]\n      commits = [...fetchedRef]\n    },\n  }\n}',
        tests: `
const remote = makeRemote()
const devA = makeLocalRepo(remote)
const devB = makeLocalRepo(remote)
assert (devA.commit('C2'), true)
assert (devA.push(), true)
assert (devB.fetch(), true)
assert JSON.stringify(devB.commits) === JSON.stringify(['C1'])
assert JSON.stringify(devB.fetchedRef) === JSON.stringify(['C1','C2'])
assert (devB.pull(), true)
assert JSON.stringify(devB.commits) === JSON.stringify(['C1','C2'])
`,
        solution: `function makeRemote() {
  return { commits: ['C1'] }
}
function makeLocalRepo(remote) {
  let commits = [...remote.commits]
  let fetchedRef = null
  return {
    get commits() { return commits },
    get fetchedRef() { return fetchedRef },
    commit(id) { commits.push(id) },
    push() { remote.commits = [...commits] },
    fetch() { fetchedRef = [...remote.commits] },
    pull() {
      fetchedRef = [...remote.commits]
      commits = [...fetchedRef]
    },
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
        prompt: 'Write `makeMultiRemoteRepo(remotes)`, where `remotes` is `{ origin, upstream, ... }`. Return `{ commits, commit(id), pushTo(remoteName), pullFrom(remoteName) }` — a repo that can independently push to and pull from ANY named remote, without affecting the others.',
        starter: '',
        tests: `
const origin = { commits: ['C1'] }
const upstream = { commits: ['C1', 'U1'] }
const devA = makeMultiRemoteRepo({ origin, upstream })
assert JSON.stringify(devA.commits) === JSON.stringify(['C1'])
assert (devA.pullFrom('upstream'), true)
assert JSON.stringify(devA.commits) === JSON.stringify(['C1','U1'])
assert (devA.commit('C2'), true)
assert (devA.pushTo('origin'), true)
assert JSON.stringify(origin.commits) === JSON.stringify(['C1','U1','C2'])
assert JSON.stringify(upstream.commits) === JSON.stringify(['C1','U1'])
`,
        solution: `function makeMultiRemoteRepo(remotes) {
  let commits = [...remotes.origin.commits]
  return {
    get commits() { return commits },
    commit(id) { commits.push(id) },
    pushTo(remoteName) { remotes[remoteName].commits = [...commits] },
    pullFrom(remoteName) { commits = [...remotes[remoteName].commits] },
  }
}`,
      },
    ],
  },
]

export default challenges
