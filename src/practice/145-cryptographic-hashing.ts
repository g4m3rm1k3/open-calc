import type { PracticeChallenge } from './loader'

export const title = 'Cryptographic Hashing'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `toyHash(str)`, a deterministic hash producing an 8-character hex digest. The SAME input must always produce the SAME digest; a one-character change in the input must produce a completely different digest (the avalanche effect).',
        starter: '',
        tests: `
assert toyHash('hunter2') === toyHash('hunter2')
assert toyHash('hunter2') !== toyHash('hunter3')
assert toyHash('hunter2').length === 8
`,
        solution: `function toyHash(str) {
  let h = 5381
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(h, 33) ^ str.charCodeAt(i)) >>> 0
  }
  h ^= h >>> 16
  h = Math.imul(h, 0x85ebca6b) >>> 0
  h ^= h >>> 13
  h = Math.imul(h, 0xc2b2ae35) >>> 0
  h ^= h >>> 16
  return (h >>> 0).toString(16).padStart(8, '0')
}`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Fix `verifyPassword(storedDigest, attemptedPassword, hashFn)`: it must hash `attemptedPassword` with `hashFn` FIRST, then compare the resulting DIGEST to `storedDigest` — never compare the plaintext attempt directly against a stored digest.',
        starter: 'function toyHash(str) {\n  let h = 5381\n  for (let i = 0; i < str.length; i++) {\n    h = (Math.imul(h, 33) ^ str.charCodeAt(i)) >>> 0\n  }\n  h ^= h >>> 16\n  h = Math.imul(h, 0x85ebca6b) >>> 0\n  h ^= h >>> 13\n  h = Math.imul(h, 0xc2b2ae35) >>> 0\n  h ^= h >>> 16\n  return (h >>> 0).toString(16).padStart(8, \'0\')\n}\nfunction verifyPassword(storedDigest, attemptedPassword, hashFn) {\n  // TODO: hash attemptedPassword first, then compare DIGESTS — never\n  // compare the plaintext attempt directly against the stored digest\n  return attemptedPassword === storedDigest\n}',
        tests: `
const stored = toyHash('hunter2')
assert verifyPassword(stored, 'hunter2', toyHash) === true
assert verifyPassword(stored, 'wrongpass', toyHash) === false
`,
        solution: `function toyHash(str) {
  let h = 5381
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(h, 33) ^ str.charCodeAt(i)) >>> 0
  }
  h ^= h >>> 16
  h = Math.imul(h, 0x85ebca6b) >>> 0
  h ^= h >>> 13
  h = Math.imul(h, 0xc2b2ae35) >>> 0
  h ^= h >>> 16
  return (h >>> 0).toString(16).padStart(8, '0')
}
function verifyPassword(storedDigest, attemptedPassword, hashFn) {
  return hashFn(attemptedPassword) === storedDigest
}`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `hashWithSalt(password, salt, hashFn)`, hashing `salt + password` together. The SAME password with DIFFERENT salts must produce DIFFERENT digests — this is why salting prevents identical passwords from ever revealing themselves as identical in stored digests.',
        starter: '',
        tests: `
const digest1 = hashWithSalt('hunter2', 'salt-abc', toyHash)
const digest2 = hashWithSalt('hunter2', 'salt-xyz', toyHash)
assert digest1 !== digest2
assert hashWithSalt('hunter2', 'salt-abc', toyHash) === digest1
`,
        solution: `function toyHash(str) {
  let h = 5381
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(h, 33) ^ str.charCodeAt(i)) >>> 0
  }
  h ^= h >>> 16
  h = Math.imul(h, 0x85ebca6b) >>> 0
  h ^= h >>> 13
  h = Math.imul(h, 0xc2b2ae35) >>> 0
  h ^= h >>> 16
  return (h >>> 0).toString(16).padStart(8, '0')
}
function hashWithSalt(password, salt, hashFn) {
  return hashFn(salt + password)
}`,
      },
    ],
  },
]

export default challenges
