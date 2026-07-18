import type { PracticeChallenge } from './loader'

export const title = 'Composite Pattern'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `makeFile(name, size)` returning `{ name, size, getSize() }`, and `makeFolder(name)` returning `{ name, children, add(child), getSize() }`. A folder\'s `getSize()` must sum `getSize()` over every child — files and sub-folders alike, recursively.',
        starter: '',
        tests: `
const root = makeFolder('root')
assert (root.add(makeFile('a.txt', 100)), true)
assert (root.add(makeFolder('sub').add(makeFile('b.txt', 200))), true)
assert root.getSize() === 300
`,
        solution: `function makeFile(name, size) {
  return { name, size, getSize: () => size }
}
function makeFolder(name) {
  const children = []
  return {
    name,
    children,
    add(child) { children.push(child); return this },
    getSize() { return children.reduce((total, c) => total + c.getSize(), 0) },
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
        prompt: 'Finish `makeFolder`\'s `countFiles()` so it recursively sums `countFiles()` over every child, the exact same shape as `getSize()` — a file\'s `countFiles()` always returns `1`.',
        starter: 'function makeFile(name, size) {\n  return { name, size, getSize: () => size, countFiles: () => 0 }\n}\nfunction makeFolder(name) {\n  const children = []\n  return {\n    name,\n    children,\n    add(child) { children.push(child); return this },\n    getSize() { return children.reduce((total, c) => total + c.getSize(), 0) },\n    // TODO: countFiles() must recursively sum countFiles() over every child,\n    // just like getSize() does\n    countFiles() { return 0 },\n  }\n}',
        tests: `
const root = makeFolder('root')
  .add(makeFile('a.txt', 100))
  .add(makeFolder('sub').add(makeFile('b.txt', 200)).add(makeFile('c.txt', 50)))
assert root.countFiles() === 3
`,
        solution: `function makeFile(name, size) {
  return { name, size, getSize: () => size, countFiles: () => 1 }
}
function makeFolder(name) {
  const children = []
  return {
    name,
    children,
    add(child) { children.push(child); return this },
    getSize() { return children.reduce((total, c) => total + c.getSize(), 0) },
    countFiles() { return children.reduce((total, c) => total + c.countFiles(), 0) },
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
        prompt: 'Write `makeFile`/`makeFolder` so both implement `findLargestFile()`. A file\'s `findLargestFile()` returns itself as `{ name, size }`; a folder\'s recursively finds the largest file among ALL its descendants, at any depth, using the exact same method name on each child — no special-casing "is this a file or a folder" at the call site.',
        starter: '',
        tests: `
const root = makeFolder('root')
  .add(makeFile('a.txt', 100))
  .add(makeFolder('sub').add(makeFile('b.txt', 500)).add(makeFile('c.txt', 50)))
const largest = root.findLargestFile()
assert largest.name === 'b.txt'
assert largest.size === 500
`,
        solution: `function makeFile(name, size) {
  return {
    name, size,
    getSize: () => size,
    findLargestFile() { return { name, size } },
  }
}
function makeFolder(name) {
  const children = []
  return {
    name,
    children,
    add(child) { children.push(child); return this },
    getSize() { return children.reduce((total, c) => total + c.getSize(), 0) },
    findLargestFile() {
      return children.reduce((largest, child) => {
        const candidate = child.findLargestFile()
        return (!largest || candidate.size > largest.size) ? candidate : largest
      }, null)
    },
  }
}`,
      },
    ],
  },
]

export default challenges
