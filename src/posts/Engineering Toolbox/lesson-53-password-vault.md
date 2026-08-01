# Lesson 53: One Password Unlocks Everything, Which Is the Whole Point and the Whole Risk

## What you will build

A real password vault: a single master password derives an encryption
key (never stored anywhere, on disk or otherwise), that key encrypts
every stored password with Lesson 45's AES-GCM before it ever touches
Lesson 50's SQLite storage, and unlocking the vault with the wrong
master password is rejected cleanly using the exact same tamper-
detection mechanism Lesson 45 built for a completely different reason.
This lesson doesn't introduce new cryptographic or database primitives —
it combines five already-built, already-verified pieces from this
curriculum into one real, working tool, and is honest about exactly
what it does and doesn't protect once assembled.

## What you need to know first

- **Lesson 42** — PBKDF2, `hashlib.pbkdf2_hmac`, and why a slow hash
  function is the right choice for anything derived from a human-chosen
  secret. Today reuses the identical function for a subtly different
  purpose, explained directly in the first unit.
- **Lesson 45** — `AESGCM`, nonce-prepending, and `InvalidTag` — reused
  completely unchanged as this lesson's actual encryption layer.
- **Lesson 43** — `secrets`, for generating strong passwords to store in
  the vault in the first place.
- **Lesson 50** — `sqlite3` and parameterized queries, reused for every
  single value this lesson writes to disk.

---

## The Problem, in prose, no code yet

A password vault needs to solve a problem none of this curriculum's
prior security lessons faced alone: a single, human-memorized secret (the
master password) must protect an entire collection of other secrets,
recoverable in full, not just verified — Lesson 42's password hashing is
the wrong tool here, since hashing is one-way and a vault needs to give
the *actual* stored password back. Lesson 45's encryption is exactly the
right tool for the "recoverable in full" part — but it needs a key, and
the master password itself, a string a person can remember, is not
directly usable as a 256-bit AES key. This lesson's actual new idea is
narrow and specific: turn a password into a key, deterministically, the
same way every time, without ever storing that key anywhere at all.

---

## Concept Unit: One Function, Two Different Jobs

### The Problem

Lesson 42 used `hashlib.pbkdf2_hmac` to produce a value *compared*
against a stored hash — proving a password was correct without ever
recovering it. This lesson needs something that looks superficially
identical but is used completely differently: the *output itself*
becomes a real AES key, actively used to encrypt and decrypt real data,
not merely compared against anything.

### Introduce the concept in isolation

```python
import hashlib
import os

password = "correct horse battery staple"
salt = os.urandom(16)

def derive_key(password, salt, iterations=200_000):
    return hashlib.pbkdf2_hmac("sha256", password.encode(), salt, iterations, dklen=32)

key_attempt_1 = derive_key(password, salt)
key_attempt_2 = derive_key(password, salt)
key_wrong_password = derive_key("wrong password entirely", salt)

print("same password derives the same key every time:", key_attempt_1 == key_attempt_2)
print("wrong password derives a different key:", key_attempt_1 != key_wrong_password)
```

Run it:

```
same password derives the same key every time: True
wrong password derives a different key: True
```

What this proves: `dklen=32` (**first appearance of this parameter**)
tells `pbkdf2_hmac` exactly how many bytes of output to produce — `32`
bytes, precisely the length `AESGCM` needs for a 256-bit key (the same
key size Lesson 45's `generate_key` produced via pure randomness; here,
derived from a password instead). The determinism proven above is the
entire point: because `derive_key` is a pure function (same inputs,
same output, every time — a **hard concept reappearing** from this
curriculum's earliest discussions of pure functions), the vault never
needs to *store* the actual encryption key anywhere — it's recomputed
fresh, identically, every single time the correct master password and
the stored salt are supplied together.

This lab is deleted now; it never appears in the project.

### CS Lens

This is **key derivation** in the strict sense — using PBKDF2 not as a
comparison mechanism (Lesson 42's use) but as its other, equally
standard role: turning low-entropy human input into a high-entropy,
fixed-size key suitable for a cipher that has no concept of "passwords"
at all, only fixed-length keys.

Also recognized in: full-disk encryption tools (a device password
deriving the actual disk encryption key, never stored on the disk
itself), password-protected ZIP and PDF encryption, this exact
technique's own standard name, PBKDF2, appearing in both roles
throughout real-world software, distinguished only by what the caller
does with the output.

### SE Lens

Never storing the derived key at all — only the salt, and, as the next
unit builds, a way to verify a *candidate* key is correct — is a
deliberate security property: even someone with complete read access to
the vault's database file cannot recover the encryption key without
also knowing the master password, since the key doesn't exist anywhere
except transiently, recomputed in memory, for as long as the vault
stays unlocked.

---

## Concept Unit: Proving the Password Is Right Without a Separate Check

### The Problem

Given a candidate master password, the vault needs to know whether it's
*correct* before trying to use the derived key on real stored data —
otherwise, a wrong password would silently derive a wrong key, and every
decryption attempt would fail with confusing, generic errors rather than
a clear "wrong password" signal. Lesson 42 solved a similar-sounding
problem with a dedicated stored hash for comparison — this lesson
doesn't need a second mechanism at all.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** new file, `vault.py`.
- **Change type:** add.
- **Dependencies:** `derive_key` (previous unit), `AESGCM` (Lesson 45).

### The New Code

```python
CANARY_PLAINTEXT = b"vault-unlock-check"

def create(self, master_password):
    salt = os.urandom(16)
    key = derive_key(master_password, salt)
    canary = encrypt(key, CANARY_PLAINTEXT)
    self.connection.execute("INSERT INTO vault_meta (salt, canary) VALUES (?, ?)", (salt, canary))
    self.connection.commit()
    self.key = key

def unlock(self, master_password):
    salt, canary = self.connection.execute("SELECT salt, canary FROM vault_meta").fetchone()
    candidate_key = derive_key(master_password, salt)
    try:
        decrypt(candidate_key, canary)
    except InvalidTag:
        raise WrongMasterPasswordError("incorrect master password")
    self.key = candidate_key
```

### Mechanical Walkthrough

- `CANARY_PLAINTEXT` — **first appearance of this term in this
  curriculum**, though the technique is a direct reuse: a **canary
  value** is a small, fixed, known plaintext, encrypted once at vault
  creation using the real derived key, and stored alongside the salt.
  It contains no real secret at all — its only purpose is being
  something to *attempt to decrypt* later.
- `create` — generates a real random salt (Lesson 42's own
  `os.urandom`), derives the real key from it, encrypts the canary with
  that key, and stores only the salt and the encrypted canary — never
  the key itself, exactly as the previous unit's SE lens required.
- `unlock` — derives a **candidate** key from whatever password was
  just supplied, using the *stored* salt (required — a different salt
  would derive a different key even from the correct password), then
  attempts to `decrypt` the stored canary with it. If the password was
  correct, the candidate key exactly matches the one used to encrypt the
  canary originally, and decryption succeeds. If not, `AESGCM`'s own
  authentication check — the exact mechanism Lesson 45 built and proved
  with `InvalidTag` — fails, because a wrong key produces a wrong
  authentication tag, and `except InvalidTag:` catches it, `raise`-ing a
  clear, specific `WrongMasterPasswordError` instead.

### CS Lens

This is reusing **authenticated encryption's own built-in integrity
check as a password verifier**, with no separate hash-and-compare
structure needed at all — a direct, elegant consequence of Lesson 45's
own design: because `AESGCM.decrypt` already refuses to return anything
at all unless the key is exactly correct, "can this key decrypt this
known value" and "is this password correct" become the identical
question, answered by one function call.

### SE Lens

The alternative — storing a separate PBKDF2 hash of the master password,
Lesson 42-style, purely for verification, then deriving the actual
encryption key some other way — would work, but duplicates effort and
introduces two separate places that could, through a coding mistake,
disagree with each other (a verification hash saying "correct" while a
separately-derived key is somehow wrong). The canary approach collapses
verification and key derivation into one consistent mechanism, with no
opportunity for the two to drift apart.

---

## Concept Unit: Storing Entries — And What This Design Actually Protects

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `vault.py`.
- **Change type:** add.
- **Location:** the `Vault` class's `add_entry`/`list_entries` methods.

### The New Code

```python
def add_entry(self, site, username, password):
    if self.key is None:
        raise VaultLockedError("unlock the vault before adding entries")
    encrypted_password = encrypt(self.key, password.encode())
    self.connection.execute(
        "INSERT INTO entries (site, username, encrypted_password) VALUES (?, ?, ?)",
        (site, username, encrypted_password),
    )
    self.connection.commit()

def list_entries(self):
    if self.key is None:
        raise VaultLockedError("unlock the vault before listing entries")
    rows = self.connection.execute("SELECT site, username, encrypted_password FROM entries").fetchall()
    return [
        (site, username, decrypt(self.key, encrypted_password).decode())
        for site, username, encrypted_password in rows
    ]
```

### Mechanical Walkthrough

- `if self.key is None: raise VaultLockedError(...)` — a **hard concept
  reappearing** from Lesson 37's `CheckResult`-style deliberate,
  explicit failure signaling: every method that needs the key checks for
  its absence first and fails with a specific, named exception rather
  than letting a `None`-related error surface confusingly from deep
  inside the encryption call.
- `encrypt(self.key, password.encode())` — only the `password` field is
  encrypted here — `site` and `username` are stored as plain `TEXT`
  columns, inserted via ordinary parameters (Lesson 50's `?` discipline,
  followed correctly even though this data isn't adversarial input).
- `list_entries`'s list comprehension — a **hard concept reappearing**,
  decrypting each row's password fresh, on every call, rather than
  keeping any decrypted value cached anywhere.

### Run it — including checking what the design actually protects

A full real lifecycle: create a vault, add two entries, lock it,
simulate a fresh process reopening it, refuse access while locked,
reject the wrong password, then succeed with the right one:

```
vault initialized: True
entries while unlocked: [('github.com', 'alice', 'gh_p4ssw0rd!'), ('email.example.com', 'alice@example.com', 'em@il-Secret-99')]

=== locking and reopening as a fresh Vault instance (simulating app restart) ===
correctly refused while locked: unlock the vault before listing entries

=== unlocking with the WRONG master password ===
correctly rejected: incorrect master password

=== unlocking with the CORRECT master password ===
entries after correct unlock: [('github.com', 'alice', 'gh_p4ssw0rd!'), ('email.example.com', 'alice@example.com', 'em@il-Secret-99')]
```

Now, checking directly — not assuming — exactly what ends up readable in
the raw database file on disk:

```python
raw_bytes = open("vault_demo.db", "rb").read()
for secret in [b"gh_p4ssw0rd!", b"em@il-Secret-99", b"alice", b"github.com"]:
    print(f"{secret!r} found in raw file:", secret in raw_bytes)
```

```
b'gh_p4ssw0rd!' found in raw file: False
b'em@il-Secret-99' found in raw file: False
b'alice' found in raw file: True
b'github.com' found in raw file: True
```

Exactly as the code predicts, and worth confirming directly rather than
assuming: every stored **password** is genuinely unrecoverable without
the master password — but **usernames and site names are not encrypted
at all**, plainly readable by anyone with access to the raw file. This
is a real, deliberate design limit of this lesson's vault, now proven
rather than left ambiguous.

### CS Lens

This is a real instance of **partial confidentiality by design** —
this vault protects one specific field, the one judged most sensitive,
while leaving structural/contextual data (which sites exist, which
usernames are used) in plaintext, a genuinely common real tradeoff (many
real password managers work identically, encrypting credentials while
leaving site names visible in their own local metadata), not
automatically a flaw — but only genuinely acceptable when it's a
deliberate choice, confirmed directly, rather than an unnoticed side
effect.

### SE Lens

Encrypting `site` and `username` too would be a small, direct extension
of this lesson's own `encrypt`/`decrypt` functions — the same
mechanism, applied to two more columns — traded against being unable to
search or index by site name without decrypting every row first, a real
usability cost real password managers weigh differently depending on
their own threat model. This lesson's choice — protect the password,
leave the rest searchable — is stated here as a deliberate, named
tradeoff, not a limitation quietly left undiscovered.

---

## Connect the pieces

One master password, followed through the entire vault: `create` derives
a real AES key from it via PBKDF2 (Lesson 42's function, Lesson 45's
purpose), encrypts a small known canary with that key, and stores only
the salt and that encrypted canary — never the key. `add_entry` uses the
same in-memory key to encrypt each stored password individually before
handing it to Lesson 50's parameterized `INSERT`. Locking the vault
discards the key from memory entirely; a later `unlock` re-derives a
candidate key from whatever password is supplied and a single attempt to
decrypt the stored canary — succeeding only if the password was
genuinely correct — either restores full access or raises a specific,
clear rejection, with no separate verification mechanism required at
all.

## What breaks without this

Attempting `list_entries()` immediately after `lock()`, without
unlocking again, is already shown directly above to raise
`VaultLockedError` rather than silently returning stale or empty data —
a deliberate, explicit failure rather than a confusing wrong answer.
Separately, checking the raw file directly (rather than assuming) is
what caught this lesson's own real, honest limitation: `'alice'` and
`'github.com'` are both genuinely present, in plain readable text, in
the database file — proof that "the vault is encrypted" is true only for
the specific field this lesson chose to encrypt, not for the file as a
whole.

## Definition of done

- [ ] `create` followed immediately by `list_entries` (while still
      unlocked) returns every added entry's password exactly as
      originally supplied.
- [ ] `unlock` with the correct master password succeeds and grants
      access to real, correctly-decrypted entries.
- [ ] `unlock` with an incorrect master password raises
      `WrongMasterPasswordError`, not a generic or confusing exception.
- [ ] Any vault method requiring the key raises `VaultLockedError`
      immediately if called while locked.
- [ ] You directly confirmed, by reading the raw database file's bytes,
      which fields are and are not readable without the master password.
- [ ] You can explain, without looking back at this lesson, why the
      canary technique makes a separate password-verification hash
      (Lesson 42-style) unnecessary here.
- [ ] Commit with a message explaining why, not just what:

  ```
  git add vault.py
  git commit -m "Add password vault combining PBKDF2 key derivation, AES-GCM canary-based unlock verification, and SQLite storage — confirmed directly that only the password field is encrypted, not usernames or site names"
  ```

## What's next

This closes the loop this curriculum's Track 5 opened: Lesson 42's
hashing, Lesson 43's secure generation, Lesson 45's encryption, Lesson
47's key-handling discipline, and Lesson 50's safe database access all
appear here as genuinely reused, not re-explained, pieces. Lesson 54's
CRUD app is the next natural extension — this vault's `add_entry`/
`list_entries` shape is already 80% of a real, small application; what's
missing is only the interactive interface around it.
