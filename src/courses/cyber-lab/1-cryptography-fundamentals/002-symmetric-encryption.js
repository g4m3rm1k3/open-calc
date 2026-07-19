const lesson = {
  id: 'cyber-lab-1-002',
  slug: 'symmetric-encryption',
  chapter: 'cyber-lab-1',
  order: 2,
  title: 'Symmetric Encryption — AES',
  subtitle: 'Same key, both directions — and why the mode you pick matters more than the cipher itself',
  tags: ['encryption', 'aes', 'symmetric', 'ecb', 'cbc', 'gcm', 'security'],
  aliases: ['aes encryption', 'symmetric key encryption', 'ecb vs cbc', 'authenticated encryption'],

  hook: {
    question: 'Two companies both encrypt every message with AES — an unbroken, industry-standard cipher. One breach exposes nothing usable. The other hands over years of readable conversation. What did they actually do differently?',
    realWorldContext: `A messaging app and a backup service both advertise "AES-256 encryption" and both are telling the truth — the cipher itself was never the weak point in either system. Years later, both get breached. The backup service's stolen files are unreadable noise, exactly as promised. The messaging app's stolen archive turns out to be full of recognizable, decodable structure — not because AES was cracked, but because of how it was used: which 16-byte chunks got encrypted independently versus chained together, and whether the random value that seeds each encryption was actually random. Same cipher, same key length, same "AES-256" marketing claim on both — and the actual security came down to decisions most people never think to ask about.`,
  },

  mentalModel: [
    'Symmetric encryption uses the exact same key to encrypt and decrypt — unlike hashing (Lesson 1), it is fully, deliberately reversible. All of the security lives in one place: keeping that one shared key secret.',
    'AES only ever encrypts one fixed 16-byte block at a time. Anything longer has to be split into blocks, and something has to decide how those blocks relate to each other — that decision is called a "mode of operation," and it is a security-critical choice, not an implementation detail.',
    'Encrypting data and authenticating data are two different guarantees. Plain encryption (AES-CBC by itself) only hides the content — it says nothing about whether the ciphertext was tampered with in transit. Authenticated modes (AES-GCM) check both at once.',
  ],

  intuition: {
    prose: [
      'Lesson 1 was about a one-way operation: once something is hashed, there is no key or operation that reverses it. Encryption is the deliberate opposite — **AES is designed to be reversed**, by anyone holding the one key that both encrypted and will decrypt the data. That single shared key is called a *symmetric* key, because the same value runs the operation both directions. This immediately creates a problem hashing never has to solve: however two computers get that one secret key onto both machines *before* any encrypted data ever gets sent, that exchange itself has to happen safely — a problem this lesson deliberately leaves open, because solving it is a completely different piece of cryptography (public-key/asymmetric encryption) that deserves its own lesson rather than a rushed aside here.',
      'AES itself is a *block cipher*: it takes exactly 16 bytes of input and a key, and produces exactly 16 bytes of ciphertext — never more, never less, regardless of key size (AES-128, AES-192, and AES-256 differ in key length, not block size). Try the demo below: type a message, generate a key, encrypt, then decrypt with that same key and confirm you get the original text back exactly. Then flip a single bit in the ciphertext before decrypting — real AES-GCM notices.',
    ],
    callouts: [],
    visualizations: [
      {
        id: 'AESEncryptDemo',
        title: 'Encrypt, Decrypt, Then Try to Cheat',
        mathBridge:
          'Real AES-256-GCM via the Web Crypto API — the same primitive your browser uses for actual encrypted connections. Generate a key, encrypt your text, decrypt it back, then flip one bit of the ciphertext and watch decryption refuse to return anything at all.',
        props: { plaintext: 'Meet at the docks at midnight' },
      },
    ],
  },

  rigor: {
    prose: [
      "**Why a block cipher needs a \"mode of operation\" at all.** A single AES call only ever handles one 16-byte block. Almost everything worth encrypting is longer than 16 bytes, so real messages get split into many blocks — and something has to decide what happens to block 2 once block 1 is already encrypted. The simplest possible answer, called **ECB (Electronic Codebook)**, is: nothing. Encrypt every block completely independently, exactly like calling AES over and over with no memory of what came before. That sounds harmless — until two plaintext blocks happen to be identical.",
      '**What ECB actually leaks.** AES is deterministic in the sense that matters here: the same 16-byte input, under the same key, always produces the same 16-byte output. Under ECB, that means identical plaintext blocks anywhere in the message — repeated words, a repeating background color in an image, a fixed-format header — produce identical ciphertext blocks. The *content* is hidden, but the *pattern* of repetition is not. The demo below encrypts a real, deliberately striped image both ways: watch the stripes survive ECB encryption completely intact, in a different palette, while true chaining turns the same image into featureless noise.',
      '**How CBC (Cipher Block Chaining) fixes it.** CBC XORs each plaintext block with the *previous block\'s ciphertext* before encrypting it, using a random starting value (the IV — Initialization Vector) in place of a "previous block" for the very first one. Now identical plaintext blocks only produce identical ciphertext if everything chained in before them was *also* identical — which cascades: the moment anything upstream differs even slightly, every block after it comes out completely different. This is exactly the diagram below, toggled between the two modes.',
      '**Why the IV has to be random and unpredictable, every single time.** CBC\'s very first block has no previous ciphertext to chain from, so it uses the IV instead: `C1 = AES_Encrypt(P1 XOR IV)`. If an application reused the exact same fixed IV for every message it ever encrypted with the same key, then any two messages that happen to start with an identical first block would produce an identical `C1` — leaking, to anyone watching the ciphertexts, that two messages started the same way, without decrypting anything. This is precisely why the demo above generates a fresh random IV on every single encryption rather than reusing one.',
      "**Encryption alone doesn't prove nothing was tampered with.** Plain AES-CBC will happily \"successfully\" decrypt a ciphertext that was deliberately altered in transit — it just returns different, corrupted plaintext with no warning that anything was wrong. That's a real attack category (bit-flipping attacks against unauthenticated CBC). **Authenticated encryption** (AES-GCM, which this lesson's demo actually uses) closes that gap by computing a cryptographic *authentication tag* alongside the ciphertext and verifying it before returning any plaintext at all — if even one bit was changed, decryption fails outright instead of returning silently-corrupted data. That refusal is exactly what you saw when the demo's \"flip 1 bit\" button was clicked.",
    ],
    callouts: [
      {
        type: 'warning',
        title: 'Browsers deliberately do not expose AES-ECB',
        body: "The Web Crypto API supports AES-CBC, AES-CTR, and AES-GCM — but not raw AES-ECB. That omission is not an oversight; ECB's pattern-leakage is considered dangerous enough by default that browser vendors chose not to make it directly reachable at all. The ECB demo below still uses only real, native AES (via a mathematical equivalence explained in its own code), not a workaround that fakes the weakness.",
      },
    ],
    visualizations: [
      { id: 'BlockCipherModeDiagram', title: 'ECB vs. CBC: Where the Wiring Differs', props: { mode: 'ecb' } },
      { id: 'ECBPatternLeak', title: 'The Same Real Cipher, Two Different Outcomes' },
    ],
  },

  challenges: [
    {
      id: 'cyber-lab-1-002-ch1',
      difficulty: 'easy',
      problem:
        'Using the demo above, encrypt any message, then decrypt it. Confirm the decrypted text matches exactly. Then click "Flip 1 bit, then try to decrypt." What happens, and which specific mechanism causes it?',
      hint: 'This lesson explicitly distinguishes plain encryption from *authenticated* encryption — which one is AES-GCM?',
      walkthrough: [
        {
          expression: 'Decrypt succeeds normally; the tampered decrypt is rejected with an error.',
          annotation: "AES-GCM computes and checks an authentication tag before returning any plaintext. Flipping even one ciphertext bit changes the tag the receiver recomputes, so verification fails and decryption refuses to return anything — not corrupted output, an outright rejection.",
        },
      ],
      answer: 'The normal decrypt returns your exact original text. The tampered decrypt fails with an error instead of returning garbled text, because AES-GCM is authenticated encryption: it verifies a cryptographic tag before releasing any plaintext, and a single flipped bit makes that verification fail.',
    },
    {
      id: 'cyber-lab-1-002-ch2',
      difficulty: 'medium',
      problem:
        'Run the striped-image demo. Explain, in your own words and using what this lesson taught about how each mode processes blocks, why the stripe pattern survives in the ECB output but disappears into noise in the CBC output — even though both use the exact same key and the exact same real AES cipher.',
      hint: 'Which mode encrypts each 16-byte block completely independently, and which one feeds each block\'s result into the next?',
      walkthrough: [
        {
          expression: 'ECB: identical blocks in → identical blocks out. CBC: chained, so identical blocks in do not mean identical blocks out.',
          annotation: 'The stripes are literally repeated identical 16-byte plaintext blocks. ECB has no memory between blocks, so repeats stay repeats. CBC XORs in the previous ciphertext block first, so a "repeat" only produces a repeat if everything chained in before it was identical too — which stops being true as soon as the image has more than one stripe.',
        },
      ],
      answer:
        "The striped image is built from many repeated, identical 16-byte plaintext blocks (each flat-color stripe). ECB encrypts every block independently with no memory of any other block, so identical plaintext blocks always produce identical ciphertext blocks — the stripe boundaries survive, just recolored. CBC XORs each plaintext block with the previous block's ciphertext before encrypting it, so a block's output now depends on everything that came before it in the image, not just its own content — two identical stripes stop producing identical ciphertext the moment anything earlier in the image differs, which destroys the visible structure entirely.",
    },
    {
      id: 'cyber-lab-1-002-ch3',
      difficulty: 'hard',
      problem:
        'A messaging app encrypts every message with AES-CBC, but a bug in their code means the exact same hardcoded IV is reused for every message ever sent, by every user, forever — it never changes and is never randomly generated. Identify exactly what this leaks, and explain why generating a fresh random IV per message (like this lesson\'s demo does) fixes it.',
      hint: 'CBC\'s first block is `AES_Encrypt(P1 XOR IV)`. What has to be true of two different messages for their first encrypted block to come out identical, if the IV never changes?',
      walkthrough: [
        {
          expression: 'C1 = AES_Encrypt(P1 XOR IV) — with IV fixed, C1 is only a function of P1.',
          annotation: 'If two different messages happen to start with the same first 16 bytes of plaintext (say, the same greeting), their first ciphertext block will be bit-for-bit identical under a fixed IV — visible to anyone who can see the ciphertexts, without decrypting anything.',
        },
      ],
      answer:
        "With a fixed IV, the very first ciphertext block is entirely determined by the first plaintext block (since `P1 XOR IV` is now just a fixed transformation of P1). Any two messages that happen to start with identical content produce an identical first ciphertext block — leaking, to an observer who never decrypts anything, that two specific messages begin the same way. That's a real, meaningful leak (it can reveal shared greetings, shared headers, or repeated message templates across totally different conversations). Generating a fresh, unpredictable random IV for every single encryption — exactly what this lesson's demo does with `crypto.getRandomValues()` — means `P1 XOR IV` is different every time even for identical plaintext, so the first ciphertext block gives an outside observer no information at all about whether two messages start the same way.",
    },
    {
      id: 'cyber-lab-1-002-ch4',
      difficulty: 'medium',
      problem:
        'In the Python notebook\'s second cell below, `block` is repeated three times to build the plaintext. Change it so the three chunks are not all identical — for example, three genuinely different 16-character strings concatenated together — and re-run the cell. What happens to "All identical?" for the ECB blocks now, and why does that same change do nothing interesting to the CBC blocks (which were already all different)?',
      hint: 'ECB\'s "All identical?" check was only ever true because the *input* blocks were identical. What is it actually comparing?',
      walkthrough: [
        {
          expression: 'ECB: identical output only when input was identical. CBC: different output regardless.',
          annotation: 'ECB never "detects" repetition on purpose — it just has no mechanism to hide it. Once the three input blocks stop being identical, there is nothing left for ECB to (accidentally) reveal, because the thing it exposes is exactly "were these specific 16 bytes seen before," and now they weren\'t.',
        },
      ],
      answer:
        'With three different 16-byte chunks, the ECB ciphertext blocks come out different too — "All identical?" flips to False. This proves ECB isn\'t doing anything clever with repetition: it simply encrypts each block on its own, so identical input happens to produce identical output, and different input produces different output, exactly like any other deterministic function of one argument. CBC\'s blocks were already all different even when the plaintext blocks were identical, because each block\'s output depends on everything chained in before it, not just its own content — changing the input here doesn\'t reveal anything new about CBC, because CBC was never comparing blocks to each other in the first place.',
    },
  ],

  assessment: {
    questions: [
      {
        id: 'symmetric-encryption-q1',
        type: 'choice',
        text: 'What is the fundamental difference between what Lesson 1 (hashing) and this lesson (AES encryption) do?',
        options: [
          'They are the same operation with different names',
          'Hashing is one-way and never reversed; encryption is deliberately reversible by anyone holding the correct key',
          'Encryption is one-way; hashing can be reversed with the right password',
          'Hashing only works on passwords; encryption only works on files',
        ],
        answer: 'Hashing is one-way and never reversed; encryption is deliberately reversible by anyone holding the correct key',
      },
      {
        id: 'symmetric-encryption-q2',
        type: 'choice',
        text: 'Why does AES-ECB leak visible patterns when encrypting something like an image with large flat-colored areas?',
        options: [
          'ECB is a weaker, "fake" version of AES that isn\'t real encryption',
          'ECB encrypts every 16-byte block independently, so identical plaintext blocks always produce identical ciphertext blocks',
          'ECB only works correctly on text, not on images',
          'ECB uses a shorter, easily guessable key',
        ],
        answer: 'ECB encrypts every 16-byte block independently, so identical plaintext blocks always produce identical ciphertext blocks',
      },
      {
        id: 'symmetric-encryption-q3',
        type: 'choice',
        text: 'Why must AES-CBC use a fresh, random, unpredictable IV for every single encryption, rather than reusing one fixed IV?',
        options: [
          'A fixed IV makes AES itself mathematically reversible without the key',
          'A fixed IV means any two messages sharing the same first plaintext block will produce an identical first ciphertext block, leaking that fact to an observer',
          'A fixed IV only matters for AES-256, not AES-128',
          'It doesn\'t matter — the IV is only used for error-checking, not security',
        ],
        answer: 'A fixed IV means any two messages sharing the same first plaintext block will produce an identical first ciphertext block, leaking that fact to an observer',
      },
      {
        id: 'symmetric-encryption-q4',
        type: 'choice',
        text: 'What does AES-GCM (authenticated encryption) guarantee that plain AES-CBC by itself does not?',
        options: [
          'GCM is simply a faster version of CBC with no other differences',
          'GCM checks a verification tag before returning any plaintext, so tampered ciphertext is rejected outright instead of silently decrypting into corrupted data',
          'GCM doesn\'t require a shared secret key at all',
          'GCM can be reversed without the key, unlike CBC',
        ],
        answer: 'GCM checks a verification tag before returning any plaintext, so tampered ciphertext is rejected outright instead of silently decrypting into corrupted data',
      },
    ],
  },

  python: {
    cells: [
      {
        id: 'py1',
        cellTitle: 'Real AES-256-GCM in Python — Same Key, Both Directions, With Tamper Detection',
        prose: `Pyodide (the WebAssembly Python runtime this notebook runs on) doesn't ship AES support in its standard library, but it can install \`pycryptodome\` — a real, widely-used cryptography library — straight from its precompiled package index via \`micropip\`. Everything below is genuine AES-256-GCM, the same authenticated-encryption idea the JavaScript demo above used, just from the Python side this time — including reproducing that exact same tamper-detection result.`,
        code: `import micropip
await micropip.install("pycryptodome")

from Crypto.Cipher import AES
from Crypto.Random import get_random_bytes

# Generate a real random 256-bit key — this is the one shared secret both
# encrypting and decrypting depend on. Symmetric encryption: same key, both directions.
key = get_random_bytes(32)

cipher = AES.new(key, AES.MODE_GCM)
nonce = cipher.nonce  # GCM's equivalent of an IV — must never repeat under the same key
plaintext = b"Meet at the docks at midnight"
ciphertext, tag = cipher.encrypt_and_digest(plaintext)

print("Ciphertext:", ciphertext.hex())
print("Auth tag:  ", tag.hex())

# Decrypt with the same key and nonce
decrypt_cipher = AES.new(key, AES.MODE_GCM, nonce=nonce)
recovered = decrypt_cipher.decrypt_and_verify(ciphertext, tag)
print()
print("Decrypted:", recovered.decode())
assert recovered == plaintext
print("Matches original plaintext exactly.")

# Now flip one bit of the ciphertext and try again
tampered = bytearray(ciphertext)
tampered[0] ^= 0xFF
print()
print("Attempting to decrypt tampered ciphertext...")
try:
    bad_cipher = AES.new(key, AES.MODE_GCM, nonce=nonce)
    bad_cipher.decrypt_and_verify(bytes(tampered), tag)
    print("This line should never print.")
except ValueError as e:
    print(f"Rejected, as expected: {e}")
`,
      },
      {
        id: 'py2',
        cellTitle: 'Real AES-ECB Pattern Leakage — From Python, No Canvas Needed',
        prose: `The browser's Web Crypto API refuses to expose raw AES-ECB directly (Concept Unit note above) — but a general-purpose library like \`pycryptodome\` does, since it trusts the developer to know when not to use it. This cell proves the same "identical plaintext blocks in → identical ciphertext blocks out" leak the image demo showed, just as raw hex instead of pixels.`,
        code: `import micropip
await micropip.install("pycryptodome")

from Crypto.Cipher import AES
from Crypto.Random import get_random_bytes

key = get_random_bytes(32)

block = b"REPEATEDBLOCK!!!"  # exactly 16 bytes — one real AES block
plaintext = block + block + block  # three identical blocks back to back

# Real AES-ECB — pycryptodome exposes this directly, unlike the browser
ecb_cipher = AES.new(key, AES.MODE_ECB)
ecb_ciphertext = ecb_cipher.encrypt(plaintext)
ecb_blocks = [ecb_ciphertext[i:i+16].hex() for i in range(0, len(ecb_ciphertext), 16)]
print("ECB ciphertext blocks:")
for b in ecb_blocks:
    print(" ", b)
print("All identical?", len(set(ecb_blocks)) == 1)

# Same key, same plaintext, real AES-CBC with a random IV this time
iv = get_random_bytes(16)
cbc_cipher = AES.new(key, AES.MODE_CBC, iv=iv)
cbc_ciphertext = cbc_cipher.encrypt(plaintext)
cbc_blocks = [cbc_ciphertext[i:i+16].hex() for i in range(0, len(cbc_ciphertext), 16)]
print()
print("CBC ciphertext blocks:")
for b in cbc_blocks:
    print(" ", b)
print("All identical?", len(set(cbc_blocks)) == 1)

print()
print("Same key, same real AES, same repeated plaintext — ECB's three ciphertext")
print("blocks are byte-for-byte identical because each block is encrypted with")
print("zero memory of any other block. CBC's three blocks are all different,")
print("because each one is chained into the next.")
`,
      },
    ],
  },
}

export default lesson
