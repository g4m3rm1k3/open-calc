import type { PracticeChallenge } from './loader'

export const title = 'Stashing'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `makeWorkingDirectory()` returning `{ edit(filename, content), read(filename), stash(), pop() }`. `stash` saves the current uncommitted state aside and reverts to the clean `\'original content\'` state; `pop` restores the most recently stashed state.',
        starter: '',
        tests: `
const dir = makeWorkingDirectory()
assert (dir.edit('file.js', 'half-finished feature code'), true)
assert dir.read('file.js') === 'half-finished feature code'
assert (dir.stash(), true)
assert dir.read('file.js') === 'original content'
assert (dir.pop(), true)
assert dir.read('file.js') === 'half-finished feature code'
`,
        solution: `function makeWorkingDirectory() {
  let files = { 'file.js': 'original content' }
  const stashStack = []
  return {
    edit(filename, content) { files[filename] = content },
    read(filename) { return files[filename] },
    stash() {
      stashStack.push({ ...files })
      files = { 'file.js': 'original content' }
    },
    pop() {
      files = stashStack.pop()
    },
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
        prompt: 'Fix `pop()`: it must restore the MOST RECENTLY stashed state first (LIFO, like a stack), not the oldest one — popping the wrong stash applies the wrong set of changes when multiple stashes have piled up.',
        starter: 'function makeWorkingDirectory() {\n  let files = { \'file.js\': \'original content\' }\n  const stashStack = []\n  return {\n    edit(filename, content) { files[filename] = content },\n    read(filename) { return files[filename] },\n    stash() {\n      stashStack.push({ ...files })\n      files = { \'file.js\': \'original content\' }\n    },\n    // TODO: pop must restore the MOST RECENTLY stashed state first (LIFO,\n    // like a stack) — not the oldest one\n    pop() {\n      files = stashStack.shift()\n    },\n  }\n}',
        tests: `
const dir = makeWorkingDirectory()
assert (dir.edit('file.js', 'first change'), true)
assert (dir.stash(), true)
assert (dir.edit('file.js', 'second change'), true)
assert (dir.stash(), true)
assert (dir.pop(), true)
assert dir.read('file.js') === 'second change'
assert (dir.pop(), true)
assert dir.read('file.js') === 'first change'
`,
        solution: `function makeWorkingDirectory() {
  let files = { 'file.js': 'original content' }
  const stashStack = []
  return {
    edit(filename, content) { files[filename] = content },
    read(filename) { return files[filename] },
    stash() {
      stashStack.push({ ...files })
      files = { 'file.js': 'original content' }
    },
    pop() {
      files = stashStack.pop()
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
        prompt: 'Write `makeNamedStashStore()` returning `{ save(label, snapshot), restore(label), list() }` — a safer, more deliberate alternative to a plain stack: each stash is saved under an explicit label, and `restore` removes and returns only the matching one, leaving every other named stash untouched.',
        starter: '',
        tests: `
const store = makeNamedStashStore()
assert (store.save('wip-login', { file: 'login code' }), true)
assert (store.save('wip-logout', { file: 'logout code' }), true)
assert JSON.stringify(store.list().sort()) === JSON.stringify(['wip-login','wip-logout'])
assert JSON.stringify(store.restore('wip-login')) === JSON.stringify({file:'login code'})
assert JSON.stringify(store.list()) === JSON.stringify(['wip-logout'])
`,
        solution: `function makeNamedStashStore() {
  const stashes = {}
  return {
    save(label, snapshot) { stashes[label] = snapshot },
    restore(label) {
      const snapshot = stashes[label]
      delete stashes[label]
      return snapshot
    },
    list() { return Object.keys(stashes) },
  }
}`,
      },
    ],
  },
]

export default challenges
