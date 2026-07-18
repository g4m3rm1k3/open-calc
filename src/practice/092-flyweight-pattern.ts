import type { PracticeChallenge } from './loader'

export const title = 'Flyweight Pattern'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `makeTree(x, y, type)` returning `{ x, y, type, describe() }`, where `describe()` returns `"Tree at (x,y) using {type.mesh}"`. Two trees built with the SAME `type` argument must share that exact object, not copies of it.',
        starter: '',
        tests: `
const oakType = { mesh: 'oak-mesh' }
const t1 = makeTree(1, 2, oakType)
const t2 = makeTree(5, 8, oakType)
assert t1.describe() === 'Tree at (1,2) using oak-mesh'
assert t1.type === t2.type
`,
        solution: `function makeTree(x, y, type) {
  return {
    x, y, type,
    describe() { return \`Tree at (\${x},\${y}) using \${type.mesh}\` },
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
        prompt: 'Finish `makeTreeFactory()` returning `{ getTreeType(mesh, texture) }` — a flyweight factory that returns the exact SAME shared object every time it\'s called with the same `mesh`+`texture` combination, and only creates a new one for a combination it hasn\'t seen before.',
        starter: 'function makeTreeFactory() {\n  // TODO: return { getTreeType(mesh, texture) } that returns the SAME shared\n  // object every time it\'s called with the same mesh+texture combination\n  return {\n    getTreeType(mesh, texture) { return { mesh, texture } },\n  }\n}',
        tests: `
const factory = makeTreeFactory()
const oak1 = factory.getTreeType('oak-mesh', 'oak-texture')
const oak2 = factory.getTreeType('oak-mesh', 'oak-texture')
const pine = factory.getTreeType('pine-mesh', 'pine-texture')
assert oak1 === oak2
assert oak1 !== pine
`,
        solution: `function makeTreeFactory() {
  const cache = new Map()
  return {
    getTreeType(mesh, texture) {
      const key = mesh + '|' + texture
      if (!cache.has(key)) cache.set(key, { mesh, texture })
      return cache.get(key)
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
        prompt: 'Write `countUniqueTypes(trees)`, where each tree is `{ type, ... }`. Return the number of DISTINCT `type` objects referenced across `trees` (by identity, not by equal-looking contents) — the flyweight count, versus the total number of tree instances.',
        starter: '',
        tests: `
const oak = { mesh: 'oak' }
const pine = { mesh: 'pine' }
const trees = [makeTree(1,1,oak), makeTree(2,2,oak), makeTree(3,3,pine), makeTree(4,4,oak)]
assert countUniqueTypes(trees) === 2
assert trees.length === 4
`,
        solution: `function makeTree(x, y, type) {
  return {
    x, y, type,
    describe() { return \`Tree at (\${x},\${y}) using \${type.mesh}\` },
  }
}
function countUniqueTypes(trees) {
  return new Set(trees.map(t => t.type)).size
}`,
      },
    ],
  },
]

export default challenges
