import type { PracticeChallenge } from './loader'

export const title = 'Hashing / Hash Tables'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `simpleHash(str, tableSize)` that sums each character\'s char code and returns the sum modulo `tableSize`.',
        starter: '',
        tests: `
assert simpleHash('a', 10) === 7
assert simpleHash('', 10) === 0
`,
        solution: `function simpleHash(str, tableSize) {
  let sum = 0
  for (const ch of str) { sum += ch.charCodeAt(0) }
  return sum % tableSize
}`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Finish `hasCollision(strs, tableSize)` — using the given `simpleHash`, return `true` if any TWO strings in `strs` hash to the same bucket.',
        starter: 'function simpleHash(str, tableSize) {\n  let sum = 0\n  for (const ch of str) { sum += ch.charCodeAt(0) }\n  return sum % tableSize\n}\nfunction hasCollision(strs, tableSize) {\n  // TODO: return true if any two strings in strs hash to the same bucket\n}',
        tests: `
assert hasCollision(['ab','ba'], 100) === true
assert hasCollision(['a','z'], 100) === false
`,
        solution: `function simpleHash(str, tableSize) {
  let sum = 0
  for (const ch of str) { sum += ch.charCodeAt(0) }
  return sum % tableSize
}
function hasCollision(strs, tableSize) {
  const seen = new Set()
  for (const s of strs) {
    const h = simpleHash(s, tableSize)
    if (seen.has(h)) return true
    seen.add(h)
  }
  return false
}`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `makeHashTable(size)` returning `{ set(key, value), get(key) }`, using `simpleHash` for bucketing and CHAINING (an array per bucket) to handle collisions.',
        starter: '',
        tests: `
const table = makeHashTable(10)
table.set('apple', 1)
table.set('banana', 2)
assert table.get('apple') === 1
assert table.get('banana') === 2
assert table.get('missing') === undefined
`,
        solution: `function simpleHash(str, tableSize) {
  let sum = 0
  for (const ch of str) { sum += ch.charCodeAt(0) }
  return sum % tableSize
}
function makeHashTable(size) {
  const buckets = Array.from({length: size}, () => [])
  return {
    set(key, value) {
      const idx = simpleHash(key, size)
      const bucket = buckets[idx]
      const existing = bucket.find(entry => entry[0] === key)
      if (existing) existing[1] = value
      else bucket.push([key, value])
    },
    get(key) {
      const idx = simpleHash(key, size)
      const entry = buckets[idx].find(entry => entry[0] === key)
      return entry ? entry[1] : undefined
    },
  }
}`,
      },
    ],
  },
]

export default challenges
