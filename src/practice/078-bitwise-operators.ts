import type { PracticeChallenge } from './loader'

export const title = 'Bitwise Operators'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `bitwiseOps(a, b)` returning `{ and, or, xor }` — the results of `a & b`, `a | b`, and `a ^ b`.',
        starter: '',
        tests: `
assert JSON.stringify(bitwiseOps(12, 10)) === JSON.stringify({ and: 8, or: 14, xor: 6 })
`,
        solution: `function bitwiseOps(a, b) {
  return { and: a & b, or: a | b, xor: a ^ b }
}`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Finish `hasFlag(bitmask, flagIndex)` returning `true` if the bit at `flagIndex` (0 = lowest bit) is set in `bitmask`, using `&` and a left shift.',
        starter: 'function hasFlag(bitmask, flagIndex) {\n  // TODO: return true if the bit at flagIndex is set in bitmask\n  return false\n}',
        tests: `
const READ = 1 << 0, WRITE = 1 << 1, EXEC = 1 << 2
const perms = READ | EXEC
assert hasFlag(perms, 0) === true
assert hasFlag(perms, 1) === false
assert hasFlag(perms, 2) === true
`,
        solution: `function hasFlag(bitmask, flagIndex) {
  return (bitmask & (1 << flagIndex)) !== 0
}`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `toggleFlag(bitmask, flagIndex)` returning a NEW bitmask with the bit at `flagIndex` flipped (on becomes off, off becomes on), using XOR.',
        starter: '',
        tests: `
assert toggleFlag(0b0101, 1) === 0b0111
assert toggleFlag(0b0111, 1) === 0b0101
`,
        solution: `function toggleFlag(bitmask, flagIndex) {
  return bitmask ^ (1 << flagIndex)
}`,
      },
    ],
  },
]

export default challenges
