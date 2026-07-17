---
concept: 143-encryption
name: Encryption
---

## Definition

Encryption transforms readable data (plaintext) into an unreadable form
(ciphertext) using a key, such that only someone with the correct key can
reverse the transformation (decrypt) and recover the original data.

## Problem

Sensitive data (passwords in transit, stored credit card numbers, private
messages) must be protected from anyone who intercepts or gains access to
it without authorization — storing or transmitting it as plain, readable
text means anyone who obtains it can read it directly. Encryption ensures
that even if the data is intercepted or stolen, it's unreadable without
the corresponding key.

## Execution

plaintext = "meet at noon"
↓
Encrypt with key K: ciphertext = some unreadable scrambled bytes
↓
Ciphertext is transmitted or stored — even if intercepted, it reveals
nothing readable without K
↓
Decrypt with the SAME key K (for symmetric encryption): recovers "meet at
noon" exactly
↓
Attempting to decrypt with the WRONG key produces garbage, not the
original plaintext

## Computer Science

Symmetric encryption uses the SAME key for both encrypting and decrypting
(fast, but the key must somehow be shared secretly beforehand);
asymmetric encryption uses a mathematically related key PAIR — a public
key that encrypts, and a private key that only its owner holds that
decrypts — solving the problem of how to establish secure communication
without ever needing to share a secret key in advance.

Tags: Symmetric encryption, Asymmetric encryption, Public-key cryptography, Key exchange

## Software Engineering

Never invent your own encryption scheme — use well-established,
peer-reviewed algorithms and libraries (AES, RSA via vetted crypto
libraries) rather than a homemade cipher, since cryptographic algorithms
are notoriously easy to get subtly wrong in ways that aren't obvious
until an expert (or attacker) finds the flaw.

Tags: Standard algorithms, Cryptographic libraries, Don't roll your own crypto

## Common Mistakes

- Confusing encryption (reversible, meant to be decrypted with a key) with hashing (one-way, never meant to be reversed) — using the wrong one for the task (e.g., "encrypting" a password for storage instead of hashing it) creates a real vulnerability if the key is ever compromised.
- Hardcoding or embedding encryption keys directly in source code — anyone with access to the code (or its public repository) then has the key, defeating the entire purpose of encrypting the data in the first place.

## Exercises

- Explain why an attacker who intercepts ciphertext but doesn't have the key still can't read the original message, even knowing exactly which algorithm was used.
- Look up the difference between AES (symmetric) and RSA (asymmetric) in terms of typical use cases — why is a hybrid approach (RSA to exchange an AES key, then AES for the actual data) common in practice?

## javascript

```javascript
// A minimal (NOT cryptographically secure) XOR cipher, purely to demonstrate
// the encrypt-with-key / decrypt-with-same-key mechanic. Real applications
// must use vetted libraries (Web Crypto's AES-GCM, etc.), never a hand-rolled cipher.
function xorCipher(text, key) {
  let result = ''
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length))
  }
  return result
}

const plaintext = 'meet at noon'
const key = 'K'

const ciphertext = xorCipher(plaintext, key)
const decrypted = xorCipher(ciphertext, key)          // same operation, same key -- XOR is its own inverse
const wrongKeyResult = xorCipher(ciphertext, 'X')      // wrong key -- produces garbage, not the original

console.log(decrypted === plaintext)                   // true -- correct key recovers the exact original
console.log(wrongKeyResult === plaintext)               // false -- wrong key never recovers it
```
Walkthrough: `xorCipher` applied twice with the SAME key recovers the
original plaintext exactly, since XOR is its own inverse — this
demonstrates the core encrypt/decrypt-with-matching-key relationship,
though a real XOR cipher like this is trivially breakable and must never
be used for actual security; production code uses vetted algorithms like
AES instead.

## python

```python
def xor_cipher(text, key):
    return ''.join(chr(ord(c) ^ ord(key[i % len(key)])) for i, c in enumerate(text))


plaintext = 'meet at noon'
key = 'K'

ciphertext = xor_cipher(plaintext, key)
decrypted = xor_cipher(ciphertext, key)            # same operation, same key -- XOR is its own inverse
wrong_key_result = xor_cipher(ciphertext, 'X')     # wrong key -- produces garbage, not the original

print(decrypted == plaintext)         # True -- correct key recovers the exact original
print(wrong_key_result == plaintext)  # False -- wrong key never recovers it
```
Walkthrough: identical XOR-cipher mechanics as the JavaScript version —
applying the same key twice recovers the exact original plaintext,
demonstrating the encrypt/decrypt relationship (though, as noted, never
use a real XOR cipher for actual security).
