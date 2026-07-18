import type { PracticeChallenge } from './loader'

export const title = 'Encryption'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `xorCipher(text, key)`, XOR-ing each character\'s char code with the corresponding key character (cycling through `key` as needed). XOR is its own inverse, so applying it twice with the SAME key recovers the original text; a different key produces garbage.',
        starter: '',
        tests: `
const plaintext = 'meet at noon'
const key = 'K'
const ciphertext = xorCipher(plaintext, key)
assert xorCipher(ciphertext, key) === plaintext
assert xorCipher(ciphertext, 'X') !== plaintext
`,
        solution: `function xorCipher(text, key) {
  let result = ''
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length))
  }
  return result
}`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Fix `decryptWithShift(ciphertext, shift)`: decrypting must shift by the OPPOSITE amount used to encrypt (`-shift`), not the same amount again — a classic symmetric-cipher bug.',
        starter: 'function encryptWithShift(text, shift) {\n  return text.split(\'\').map(ch => {\n    if (ch >= \'a\' && ch <= \'z\') {\n      return String.fromCharCode(((ch.charCodeAt(0) - 97 + shift) % 26 + 26) % 26 + 97)\n    }\n    return ch\n  }).join(\'\')\n}\nfunction decryptWithShift(ciphertext, shift) {\n  // TODO: decrypting must shift by the OPPOSITE amount used to encrypt\n  return encryptWithShift(ciphertext, shift)\n}',
        tests: `
const ciphertext = encryptWithShift('meet at noon', 3)
assert ciphertext !== 'meet at noon'
assert decryptWithShift(ciphertext, 3) === 'meet at noon'
`,
        solution: `function encryptWithShift(text, shift) {
  return text.split('').map(ch => {
    if (ch >= 'a' && ch <= 'z') {
      return String.fromCharCode(((ch.charCodeAt(0) - 97 + shift) % 26 + 26) % 26 + 97)
    }
    return ch
  }).join('')
}
function decryptWithShift(ciphertext, shift) {
  return encryptWithShift(ciphertext, -shift)
}`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `makeKeyPair()` returning `{ publicKey, privateKey }` (an inverse substitution pair), `encryptWithPublicKey(text, publicKey)`, and `decryptWithPrivateKey(ciphertext, privateKey)` — modeling asymmetric encryption: text encrypted with the public key can only be correctly decrypted with the matching PRIVATE key, not the public key itself.',
        starter: '',
        tests: `
const keys = makeKeyPair()
const ciphertext = encryptWithPublicKey('meet', keys.publicKey)
assert ciphertext !== 'meet'
assert decryptWithPrivateKey(ciphertext, keys.privateKey) === 'meet'
assert decryptWithPrivateKey(ciphertext, keys.publicKey) !== 'meet'
`,
        solution: `function makeKeyPair() {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz'
  const shifted = alphabet.slice(3) + alphabet.slice(0, 3)
  const publicKey = {}
  const privateKey = {}
  for (let i = 0; i < alphabet.length; i++) {
    publicKey[alphabet[i]] = shifted[i]
    privateKey[shifted[i]] = alphabet[i]
  }
  return { publicKey, privateKey }
}
function encryptWithPublicKey(text, publicKey) {
  return text.split('').map(ch => publicKey[ch] ?? ch).join('')
}
function decryptWithPrivateKey(ciphertext, privateKey) {
  return ciphertext.split('').map(ch => privateKey[ch] ?? ch).join('')
}`,
      },
    ],
  },
]

export default challenges
