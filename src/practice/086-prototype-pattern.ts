import type { PracticeChallenge } from './loader'

export const title = 'Prototype Pattern'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `cloneCharacter(character)`, where `character` is `{ name, stats }`. Return a NEW object with the same `name` and a COPY of `stats`, so mutating the clone never affects the original.',
        starter: '',
        tests: `
const original = { name: 'Goblin', stats: { hp: 10, attack: 3 } }
const clone = cloneCharacter(original)
clone.name = 'Goblin Chief'
clone.stats.hp = 30
assert original.name === 'Goblin'
assert original.stats.hp === 10
assert clone.name === 'Goblin Chief'
assert clone.stats.hp === 30
`,
        solution: `function cloneCharacter(character) {
  return { name: character.name, stats: { ...character.stats } }
}`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Finish `shallowClone(obj)` returning a shallow copy — a NEW top-level object, distinct from `obj` itself, but nested structures (like an array field) may still be shared references with the original (the classic shallow-copy pitfall).',
        starter: 'function shallowClone(obj) {\n  // TODO: return a shallow copy — a NEW top-level object, but nested structures\n  // (arrays, objects) can still be shared references with the original\n  return obj\n}',
        tests: `
const original = { name: 'Goblin', tags: ['boss', 'undead'] }
const clone = shallowClone(original)
clone.name = 'Goblin Chief'
clone.tags.push('elite')
assert original.name === 'Goblin'
assert original.tags.length === 3
assert clone.tags.length === 3
`,
        solution: `function shallowClone(obj) {
  return { ...obj }
}`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `deepClone(obj)` returning a FULLY independent copy — unlike a shallow clone, mutating any nested object or array on the clone must NEVER affect the original.',
        starter: '',
        tests: `
const original = { name: 'Goblin', stats: { hp: 10, attack: 3 }, tags: ['boss'] }
const clone = deepClone(original)
clone.stats.hp = 999
clone.tags.push('elite')
assert original.stats.hp === 10
assert original.tags.length === 1
assert clone.stats.hp === 999
assert clone.tags.length === 2
`,
        solution: `function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj))
}`,
      },
    ],
  },
]

export default challenges
