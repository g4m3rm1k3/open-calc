const lesson = {
  id: 'cyber-lab-1-001',
  slug: 'what-is-hashing',
  chapter: 'cyber-lab-1',
  order: 1,
  title: 'What Is Hashing?',
  subtitle: 'Why passwords are never stored as plaintext — and never decrypted either',
  tags: ['hashing', 'passwords', 'md5', 'sha256', 'salt', 'security'],
  aliases: ['password hashing', 'what is a hash', 'salt hashing', 'bcrypt'],

  hook: {
    question: 'Why do three companies leak the exact same breach and get three completely different outcomes?',
    realWorldContext: `A company's user database leaks. Ten million rows spill onto the internet. For users on Site A, every row is a plaintext password — every account on every other site those users reused a password on is now compromised too, instantly. For users on Site B, every row is a bare SHA-256 hash — cracked within hours using a table an attacker built years ago, for free, before this leak ever happened. For users on Site C, every row is a salted, iterated hash — and two years later, most of those hashes still haven't been cracked. Same breach, three completely different outcomes, and the only difference is one design decision made long before any of this happened: how the password was stored.`,
  },

  mentalModel: [
    'Encoding, encryption, and hashing are three different things with three different purposes — encoding just changes representation (Base64), encryption is reversible with the right key (AES), hashing is never reversed, by design.',
    'A hash function is deterministic (same input always gives the same output) and one-way (there is no operation that turns a hash back into its input) — "decrypting a hash" is not a real operation, in the same way "un-mixing paint" is not a real operation.',
    'Salt defeats precomputed attacks (rainbow tables, and reusing one cracked password across every account that shares it) — it does not, by itself, make one specific guess slower to check. Iteration count (the "cost factor" in bcrypt/scrypt/Argon2/PBKDF2) is what makes each individual guess expensive.',
  ],

  intuition: {
    prose: [
      "Before touching hashing specifically, one distinction has to be nailed down, because almost every beginner mixes these three up: **encoding** (Base64, URL-encoding) just changes how data is *represented* — it's not secret at all, anyone can decode it, and it exists purely so binary data can travel safely through text-only systems like URLs or JSON. **Encryption** (AES, RSA) is secret and *reversible* — if you have the right key, you get the original data back exactly. **Hashing** (MD5, SHA-256, bcrypt) is neither reversible nor meant to be — there is no key that turns a hash back into the password that produced it, because the operation that would do that doesn't exist. If you ever find yourself asking \"why don't we just decrypt the password to check it?\" — the answer is that a hash was never encrypted in the first place. There's nothing to decrypt.",
      'A hash function takes an input of any length and produces a fixed-length output — SHA-256 always produces exactly 256 bits (64 hex characters), whether you hash one character or the entire text of a novel. Two properties make it useful for passwords specifically: it\'s **deterministic** (hash "password123" today and hash it again next year — same output both times, which is exactly what lets a server check a login without ever storing the real password), and it exhibits the **avalanche effect** — changing even one character of the input scrambles roughly half the output bits, so no partial information about the input leaks from a partial look at the output.',
      "Try it yourself below: type anything, watch the hash change instantly and completely for even a tiny edit. Then switch algorithms — MD5 and SHA-1 are both still deterministic, one-way functions, but they're no longer trusted for security-sensitive use, for reasons the rest of this lesson makes concrete rather than just asserting.",
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Encoding vs. Encryption vs. Hashing',
        body: '**Encoding** — reversible, not secret (Base64). **Encryption** — reversible, secret, needs a key (AES). **Hashing** — irreversible, one-way, no key involved (SHA-256). If something can be "decrypted," it was encrypted, not hashed.',
      },
    ],
    visualizations: [
      {
        id: 'HashOutput',
        title: 'Hash Anything',
        mathBridge:
          'Type into the input and watch the hash update in real time — this is computing a **real** MD5, SHA-1, or SHA-256 digest right in your browser via the Web Crypto API (and a real MD5 library, since MD5 is deprecated and no longer built into browsers directly). Nothing here is simulated.',
        props: { text: 'password123', algorithm: 'SHA-256' },
      },
      {
        id: 'AvalancheDiff',
        title: 'The Avalanche Effect',
        mathBridge:
          'Two inputs, differing by exactly one character, both hashed with real SHA-256. The changed hex digits are highlighted — count how much of the output moved for such a tiny change in the input.',
        props: { textA: 'password', textB: 'passworE' },
      },
    ],
  },

  rigor: {
    prose: [
      "**What a real login actually does.** A server never stores your password and never checks a login by \"looking up your password and comparing it.\" It hashes whatever you just typed and compares *that hash* to the hash it stored back when you registered. If the two hashes match, you typed the same original input — the server never needed your actual password to know that. This is the diagram below: two separate moments, each hashing, never storing or reversing anything.",
      '**Why an unsalted hash is weak even though hashing itself is one-way.** One-way doesn\'t mean "impossible to guess" — it means "can\'t be mathematically reversed." An attacker who already suspects the input might be a common word doesn\'t need to reverse anything: they hash every word in a big list *once*, store the results in a lookup table, and then finding your password is just checking whether your hash appears in that table — instant, and reusable against every unsalted leak they ever get their hands on.',
      '**What salt actually changes.** A salt is a random value stored *alongside* the hash (it isn\'t secret — it doesn\'t need to be) and mixed into the input before hashing: `hash(salt + password)` instead of `hash(password)`. This doesn\'t make checking *one* password slower for someone who already knows the salt. What it defeats is *precomputation* — the attacker\'s lookup table was built without your specific salt, so it has no entry that matches your salted hash, even if your actual password is common and sits right there in their wordlist. It also stops one cracked password from immediately cracking every other account sharing that password, since each account\'s salt is different.',
      '**What iteration count (cost factor) actually changes.** Salt stops a precomputed table from working. It does nothing to slow down an attacker who *is* willing to redo the hashing per-guess with the correct salt. That\'s what iteration count is for: bcrypt, scrypt, Argon2, and PBKDF2 all deliberately repeat their internal hashing thousands to millions of times, so that computing even one candidate hash takes real, measurable time — multiplied across billions of guessed passwords, that adds up from "minutes" to "longer than anyone will wait." scrypt and Argon2 go further, deliberately requiring a large amount of memory per guess too (not just time), which resists cheap, massively-parallel cracking hardware (GPUs, ASICs) in a way plain repeated hashing doesn\'t.',
    ],
    callouts: [
      {
        type: 'warning',
        title: "MD5 and SHA-1 are broken — for a specific reason",
        body: "Being one-way was never MD5 or SHA-1's problem — the problem is that in 2004 (MD5) and 2017 (SHA-1, Google & CWI's \"SHAttered\" attack) researchers found ways to construct two *different* inputs that produce the *identical* hash — a collision. Anywhere a hash is trusted to uniquely represent one specific piece of data (a digital signature, a certificate, a file-integrity check), a findable collision breaks that guarantee. This isn't theoretical — try the real, published 2004 collision pair below yourself.",
      },
    ],
    visualizations: [
      { id: 'RegistrationLoginFlow', title: 'Registration vs. Login' },
      { id: 'DictionaryAttack', title: 'Attack a Precomputed Table' },
      { id: 'CollisionDemo', title: 'A Real MD5 Collision' },
      { id: 'PBKDF2CostDemo', title: 'A Real Cost Factor' },
    ],
  },

  challenges: [
    {
      id: 'cyber-lab-1-001-ch1',
      difficulty: 'easy',
      problem:
        'Using the "Attack a Precomputed Table" tool above, run the attack with the salt checkbox OFF. Which word from the list gets cracked, and how many guesses did it take?',
      hint: 'The target word is fixed for this demo — watch which row turns green.',
      walkthrough: [
        {
          expression: 'Run the attack unsalted.',
          annotation: 'The target hash was computed as plain sha256("football") with no salt — the attacker\'s precomputed table has an entry for exactly that.',
        },
      ],
      answer: '"football" is found — it\'s the 5th word checked, since the demo tries the wordlist in order.',
    },
    {
      id: 'cyber-lab-1-001-ch2',
      difficulty: 'medium',
      problem:
        'Now check the salt checkbox and run the attack again. Same wordlist, same target password. Explain — in your own words, using what you know about how the table was built — why it no longer finds a match, even though "football" is still right there in the list.',
      hint: "Think about *when* the attacker's table was computed, versus when the salt was generated.",
      walkthrough: [
        {
          expression: 'sha256("football") ≠ sha256(salt + "football")',
          annotation: 'The precomputed table only has entries for the plain, unsalted words — it has no idea what this account\'s specific salt is, so none of its precomputed hashes can ever match a salted target, regardless of whether the underlying password is common.',
        },
      ],
      answer:
        'The attacker\'s table was built once, without any salt, before this specific leak even existed. Salting changes the actual bytes being hashed (salt + password, not just password), so every entry in that old table produces a completely different hash than the salted target — a precomputed table built for unsalted hashes cannot find a match against a salted one, no matter how common the password is.',
    },
    {
      id: 'cyber-lab-1-001-ch3',
      difficulty: 'hard',
      problem:
        'A startup stores passwords as `sha256(password)` — unsalted, single-round SHA-256 — and argues this is "fine because SHA-256 itself has never been broken, unlike MD5." Identify what\'s actually wrong with their reasoning, and name the two separate fixes needed (not just one).',
      hint: 'This lesson deliberately taught salt and iteration count as two different properties, defeating two different kinds of attack. Which one (or both) is missing here?',
      walkthrough: [
        {
          expression: 'Fix 1: add a per-account salt. Fix 2: add real iteration/memory cost (bcrypt/scrypt/Argon2/PBKDF2).',
          annotation: 'SHA-256 not having known collisions is irrelevant to this specific weakness — the problem isn\'t that SHA-256 is reversible or collision-prone, it\'s that it\'s FAST, and used with no salt at all.',
        },
      ],
      answer:
        'SHA-256 being cryptographically un-broken (no known collisions) has nothing to do with this specific vulnerability. Unsalted means a precomputed table (or cross-account password reuse) instantly cracks any common password, for every account at once. Single-round SHA-256 is also extremely fast to compute — billions of guesses per second on ordinary hardware — so even a brute-force attack against one specific salted hash would be cheap. Both problems need fixing separately: add a random per-account salt (defeats precomputation/reuse), and replace plain SHA-256 with a real password-hashing function like bcrypt, scrypt, Argon2, or PBKDF2 with a high iteration count (makes each individual guess expensive).',
    },
    {
      id: 'cyber-lab-1-001-ch4',
      difficulty: 'medium',
      problem:
        'Run the Python notebook\'s first cell below. Type the exact same text into the "Hash Anything" demo above (in JavaScript) and switch it to SHA-256. Compare the two hex digests character by character. What do you expect, and why — given that one is running in your browser via the Web Crypto API and the other is running in a completely separate Python interpreter (compiled to WebAssembly)?',
      hint: 'SHA-256 is a published, standardized algorithm, not something owned by one specific library or language.',
      walkthrough: [
        {
          expression: 'JS Web Crypto SHA-256(x) === Python hashlib SHA-256(x)',
          annotation: 'Two totally independent implementations, in two different languages, produce byte-for-byte identical output for the same input — because both are implementing the same public specification, not their own private notion of "a hash."',
        },
      ],
      answer:
        'The two hex digests match exactly, character for character. This isn\'t a coincidence or a shared implementation under the hood — SHA-256 is a public, standardized algorithm (part of the SHA-2 family, published by NIST). Any correct implementation, in any language, must produce identical output for identical input, or it isn\'t actually implementing SHA-256. This is exactly what makes hashing useful for real-world verification across completely different systems: a file\'s SHA-256 checksum computed on one machine, in one language, means something to a completely different machine running different software, because both are computing the same defined function.',
    },
  ],

  assessment: {
    questions: [
      {
        id: 'what-is-hashing-q1',
        type: 'choice',
        text: 'A colleague says "we should decrypt the stored password to check the login." What\'s wrong with this sentence?',
        options: [
          'Nothing — that\'s exactly how login should work',
          'Passwords are hashed, not encrypted — there is no decryption operation for a hash to run',
          'Decryption is too slow to use for logins',
          'You need two keys to decrypt, and the server only has one',
        ],
        answer: 'Passwords are hashed, not encrypted — there is no decryption operation for a hash to run',
      },
      {
        id: 'what-is-hashing-q2',
        type: 'choice',
        text: 'What does adding a salt to password hashing actually defend against?',
        options: [
          'It makes each individual password guess take longer to compute',
          'It defeats precomputed lookup tables and stops one leaked password from cracking every account that reuses it',
          'It makes the hash function itself impossible to reverse',
          'It encrypts the password so it can be recovered later',
        ],
        answer: 'It defeats precomputed lookup tables and stops one leaked password from cracking every account that reuses it',
      },
      {
        id: 'what-is-hashing-q3',
        type: 'choice',
        text: 'Why does iteration count (the "cost factor" in bcrypt/scrypt/Argon2/PBKDF2) matter, given that salt already protects the hash?',
        options: [
          'It doesn\'t — salt alone is sufficient',
          'It makes each individual guess (even with the correct salt already known) take real, measurable time to compute, which adds up across billions of attempted guesses',
          'It generates a new salt automatically every time someone logs in',
          'It converts the hash back to plaintext after enough attempts',
        ],
        answer: 'It makes each individual guess (even with the correct salt already known) take real, measurable time to compute, which adds up across billions of attempted guesses',
      },
      {
        id: 'what-is-hashing-q4',
        type: 'choice',
        text: 'What does it mean that MD5 has known "collisions"?',
        options: [
          'MD5 hashes can be decrypted back to their original input',
          'Two different inputs have been found that produce the identical MD5 hash',
          'MD5 runs too slowly on modern hardware',
          'MD5 requires a secret key that has been leaked',
        ],
        answer: 'Two different inputs have been found that produce the identical MD5 hash',
      },
    ],
  },

  python: {
    cells: [
      {
        id: 'py1',
        cellTitle: 'Same Real Algorithm, Different Language — Verify It Yourself',
        prose: `Python's \`hashlib\` is standard library — no install needed. Run this, then type the exact same text into the "Hash Anything" demo above and switch it to SHA-256. The two hex digests should match exactly.`,
        code: `import hashlib

text = "password123"

md5_hash = hashlib.md5(text.encode()).hexdigest()
sha1_hash = hashlib.sha1(text.encode()).hexdigest()
sha256_hash = hashlib.sha256(text.encode()).hexdigest()

print(f"Input: {text!r}")
print(f"MD5:     {md5_hash}")
print(f"SHA-1:   {sha1_hash}")
print(f"SHA-256: {sha256_hash}")
print()
print("Copy this same text into the 'Hash Anything' demo above (real JavaScript,")
print("via the browser's Web Crypto API) and switch it to SHA-256 — the hex digest")
print("shown there should match the SHA-256 line above exactly, character for")
print("character. Two separate implementations, two different languages, running")
print("in two different places — identical output, because SHA-256 is a public,")
print("standardized algorithm, not something tied to one specific implementation.")
`,
      },
      {
        id: 'py2',
        cellTitle: 'Real PBKDF2 Cost, From Python',
        prose: `Python's \`hashlib\` (at least in this WebAssembly build) doesn't expose \`pbkdf2_hmac\` — so this cell uses \`pycryptodome\`'s real PBKDF2 instead, installed live via micropip. Same real cost-factor idea as the "A Real Cost Factor" demo above, timed from the Python side.`,
        code: `import micropip
await micropip.install("pycryptodome")

import time
from Crypto.Protocol.KDF import PBKDF2
from Crypto.Hash import SHA256

password = "password123"
salt = b"fixed-demo-salt"

def derive(iterations):
    start = time.perf_counter()
    key = PBKDF2(password, salt, dkLen=32, count=iterations, hmac_hash_module=SHA256)
    elapsed_ms = (time.perf_counter() - start) * 1000
    return key.hex(), elapsed_ms

for iterations in [1_000, 10_000, 100_000]:
    key_hex, elapsed = derive(iterations)
    print(f"{iterations:>7,} iterations -> {elapsed:7.1f} ms  key={key_hex[:32]}...")

print()
print("Real, measured time — not a fake delay. Compare the shape of this curve")
print("to the JavaScript demo above: more iterations costs real, proportionally")
print("more time in Python too, because both are running the same real algorithm,")
print("just in two different language runtimes.")
`,
      },
    ],
  },
}

export default lesson
