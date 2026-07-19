# Lesson 19: Secrets Management

## What you will build

A git repository where deleting a secret from the current file does nothing to remove it
from history, a background process whose password is readable by anyone permitted to look
at `/proc`, an encrypted secrets file that solves nothing on its own, and finally a
minimal vault that actually closes the gap all three expose. The transferable problem:
"don't hardcode secrets" is advice everyone has heard; this lesson is about the several
different, equally real ways a secret leaks even once it's no longer hardcoded, and what a
system has to do differently to actually be safe.

## What you need to know first

Lesson 3 (Authentication vs. Authorization) — this lesson's final unit is a small,
literal application of that lesson's exact check, applied to secrets instead of diary
entries. Lesson 8 (Symmetric Encryption) — the encrypted-file unit uses `Fernet` exactly
as that lesson built it. Lesson 18 (Privilege Escalation) — `/root/secret.txt`, protected
by nothing but file permissions in that lesson, is the plaintext-file anti-pattern this
lesson explicitly moves past.

---

## Concept Unit: Secrets Live Forever in Version Control

### The Problem

A secret hardcoded directly in source code is easy to spot as a bad idea, and easy to
"fix" — delete the line, commit again. This unit asks whether that fix actually removes
the secret from anywhere an attacker could look.

### Introduce the Concept in Isolation

```bash
git init
git config user.email "test@example.com"
git config user.name "Test"
```

```python
API_KEY = "sk_live_51H8xJ2kL9mNpQrStUvWxYz"
DATABASE_URL = "postgres://admin:hunter2@db.internal:5432/prod"
```

```bash
git add config.py
git commit -m "add config"
```

Now the "fix" — replace the hardcoded values with environment variable reads, and commit
again:

```python
import os
API_KEY = os.environ["API_KEY"]
DATABASE_URL = os.environ["DATABASE_URL"]
```

```bash
git add config.py
git commit -m "remove hardcoded secrets, use env vars"
cat config.py
git log --oneline
git show HEAD~1:config.py
```

```
--- current file (looks clean) ---
import os
API_KEY = os.environ["API_KEY"]
DATABASE_URL = os.environ["DATABASE_URL"]
--- but git history still has it ---
987310d remove hardcoded secrets, use env vars
25635f9 add config
--- showing the old commit ---
API_KEY = "sk_live_51H8xJ2kL9mNpQrStUvWxYz"
DATABASE_URL = "postgres://admin:hunter2@db.internal:5432/prod"
```

This output proves that `git show HEAD~1:config.py` retrieves the exact original file
content, secret included, from a commit that is still fully present in the repository's
history — `git commit` never deletes anything; it only ever adds a new snapshot on top of
every previous one. The current file being clean says nothing about whether the secret is
still retrievable by anyone with read access to the repository's full history, which, by
default, is anyone with read access to the repository at all.

### Discard

This `git_demo` repository is deleted now. It never appears again in this lesson — it
existed only to prove, by running it, that "removed in a later commit" and "gone" are not
the same fact.

### Where This Lives

This lesson's remaining units build three independent, small Python scripts —
`env_holder.py`, `encrypted_secrets.py`, and `vault.py` — each demonstrating one further
fact about secrets storage; none depend on each other or on the git repository from this
unit.

### CS Lens

Git's fundamental data model — every commit is an immutable, content-addressed snapshot,
linked to its predecessor, never mutated — is exactly what makes `git log` and `git blame`
so valuable for legitimate history-tracking, and exactly what makes accidentally committed
secrets so durable. The same property is being exploited by both use cases; nothing about
it is a bug.

```
Also recognized in: every "oops, I committed my AWS key" incident report and the
tooling built specifically around this problem (git-secrets, truffleHog, and
GitHub's own secret-scanning feature, which actively scans pushed commits,
including ones later force-overwritten, for exactly this pattern), the broader
principle that any append-only or backed-up storage system -- not just git --
retains data long after it's deleted from the "current" view, including database
backups, log aggregation systems, and object storage versioning.
```

---

## Concept Unit: Environment Variables Are Not Actually Hidden

### The Problem

`os.environ["DATABASE_URL"]`, the "fix" from the previous unit, is a genuine improvement —
the secret is no longer sitting in a file git tracks. This unit asks whether an
environment variable is actually private, or only private from the specific threat
(source code readers) the previous unit's fix addressed.

### Introduce the Concept in Isolation

```python
import os
import time

print("PID:", os.getpid())
print("holding secret, sleeping...")
time.sleep(6)
```

Run this script with a secret passed in as an environment variable at launch, and, while
it's still running, read that same secret from a second, separate process:

```bash
DB_PASSWORD="s3cr3t_db_pw" python3 env_holder.py &
cat /proc/<PID>/environ | tr '\0' '\n' | grep DB_PASSWORD
```

```
PID: 574
holding secret, sleeping...
--- another process (this shell) reads the first process's environment via /proc ---
DB_PASSWORD=s3cr3t_db_pw
```

This output proves that a running process's environment variables are not private to that
process alone — on Linux, `/proc/<pid>/environ` exposes them to anyone with sufficient
permission to read that file (the process's own owner, or root), with no involvement from
the process itself required. **A precise detail worth stating exactly, because testing
this is what surfaced it:** `/proc/<pid>/environ` reflects the environment block set at
the moment the process was launched (technically, at its `execve` system call) — setting
`os.environ["X"] = "..."` from *inside* an already-running Python program does not update
what `/proc/<pid>/environ` reports, because that file is a snapshot of the original launch
environment, not a live view of the process's current variables. The exposure this unit
demonstrates applies specifically to secrets passed in *at launch time* — via a shell
command, a process manager's configuration, or a container orchestrator's environment
block — which is, in practice, how the overwhelming majority of real applications receive
their secrets.

### Discard

`env_holder.py` is deleted now. It never appears again in this lesson.

### CS Lens

`/proc` is Linux's mechanism for exposing running-process information as a virtual
filesystem — every process gets a directory, and `environ` is one of several files inside
it exposing that process's own kernel-tracked state. This isn't a misconfiguration or a
bug; it's `/proc` working exactly as designed, for an audience (system administrators,
debugging tools) that legitimately needs this visibility — which is precisely why relying
on "environment variables are private" as your only protection is a mismatch between what
the mechanism actually promises and what a secret needs.

```
Also recognized in: `ps auxe` and similar tools (which can display a process's
environment on some systems and configurations), Docker's `docker inspect`
exposing a container's configured environment variables to anyone with Docker
daemon access, CI/CD pipeline logs that accidentally print environment variables
during a debug step, and crash reporting tools that, by default, capture and
transmit a process's full environment as part of an error report -- all
independent, real ways a launch-time secret has escaped its intended boundary in
real incidents.
```

### SE Lens

The alternative this unit doesn't yet build is not "stop using environment variables" —
they remain far better than hardcoding, and are the standard mechanism most secrets
managers ultimately use to hand a secret to an application at startup. The gap this unit
identifies is narrower: environment variables protect against *source code* exposure
(the previous unit's threat) but do nothing against a *different-but-adjacent* privileged
reader — anyone who can inspect the running process itself. Closing that gap needs a
different tool entirely, which the final two units build toward.

---

## Concept Unit: Encryption at Rest, and the Key You Still Have to Store

### The Problem

A secrets file sitting in plaintext on disk — exactly `/root/secret.txt` from Lesson 18 —
is readable by anyone who can read that file, permission bits notwithstanding once those
bits are misconfigured or bypassed. Lesson 7 and Lesson 8 already gave this course a tool
for exactly this: encryption. This unit asks whether applying it here actually solves the
problem, or only relocates it.

### Skip: Concept Already Lab'd

`Fernet.generate_key()`, `cipher.encrypt()`, and `cipher.decrypt()` are unchanged from
Lesson 8 and reused here without a new lab, per the Repetition Rule.

### Where This Lives

**File:** `encrypted_secrets.py` (new file). **Dependencies:** the `cryptography` package,
already used in Lessons 8 and 9.

### The New Code

```python
encryption_key = Fernet.generate_key()
cipher = Fernet(encryption_key)

secret_value = b"postgres://admin:hunter2@db.internal:5432/prod"
encrypted = cipher.encrypt(secret_value)

with open("secrets.enc", "wb") as f:
    f.write(encrypted)
```

### The Updated Project

```python
from cryptography.fernet import Fernet

encryption_key = Fernet.generate_key()          # ← new
cipher = Fernet(encryption_key)                  # ← new

secret_value = b"postgres://admin:hunter2@db.internal:5432/prod"  # ← new
encrypted = cipher.encrypt(secret_value)          # ← new

with open("secrets.enc", "wb") as f:               # ← new
    f.write(encrypted)                               # ← new

print("Stored on disk (encrypted):", encrypted[:50], "...")

with open("secrets.enc", "rb") as f:
    stored = f.read()
decrypted = Fernet(encryption_key).decrypt(stored)
print("Decrypted for use:", decrypted)
```

This program encrypts a database URL, writes only the ciphertext to disk, then reads it
back and decrypts it — end to end, a working, correct application of Lesson 8's symmetric
encryption to a secrets file.

### Mechanical Walkthrough

Every element here is a direct reapplication of Lesson 8's already-lab'd `Fernet` API —
**(b) hard concept reappearing** throughout, with one new fact worth isolating: `encrypted`
is written to `secrets.enc` on disk, but `encryption_key` — the one piece of information
that makes `secrets.enc` readable at all — exists, in this program, only as a Python
variable, generated fresh on every run, and printed nowhere. **This is deliberate, and it's
the entire point of this unit**: the code runs correctly, but it never actually answers the
question of where `encryption_key` itself is supposed to live between runs, or how a
*different* program — one that needs to read `secrets.enc` later, possibly on a different
machine — is supposed to obtain it.

### CS Lens

This is Lesson 8's key distribution problem, reappearing in a new form: encrypting a
secret converts "protect this data" into "protect this smaller piece of data (the key)
instead" — genuine progress only if the key ends up somewhere meaningfully harder to reach
than the original secret was. If `encryption_key` were simply written to a file sitting
next to `secrets.enc`, with the same permissions, encrypting the secret would have added
code and complexity while providing zero additional protection — anyone able to read one
file would read both.

### SE Lens

The tempting-but-circular alternative is encrypting the key with a *second* key — which
only pushes the identical question back one more level rather than answering it. The
actual answer real systems use is not "encrypt harder," it's structural: separate *who can
retrieve a secret* from *where the secret is stored*, and make that separation an
access-controlled, audited operation rather than a file permission. That's what the final
unit builds.

### Run It

```
Stored on disk (encrypted): b'gAAAAABqXBWoUwCsRlVaZ4O7zHnJDHs3aEtn1lO4418GAPTD3e' ...
Decrypted for use: b'postgres://admin:hunter2@db.internal:5432/prod'
```

The round trip works — encryption and decryption are both correct — but nothing in this
run demonstrates the file being safe from anyone who couldn't already have read the
original plaintext, because `encryption_key` never left this one process, and the moment
it needs to persist anywhere for reuse, this unit's unanswered question becomes real.

This unit connects directly to the previous one: environment variables solved "don't put
the secret in source code" without solving "don't expose it to a privileged process
reader," and this unit's encryption solves "don't leave it in plaintext on disk" without
solving "where does the key live" — each fix closes one specific gap and opens the next
question, rather than being a single complete answer.

---

## Concept Unit: A Minimal Vault — Access Control and an Audit Trail

### The Problem

Every previous unit protected a secret from one specific *kind* of exposure — source
history, process introspection, disk access — without ever asking *who* is requesting it
or *recording* that the request happened. This unit builds the piece that actually asks
both questions, which is what a real secrets manager's core job is.

### Skip: Concept Already Lab'd

The authorization check below — comparing a requester's identity against what they're
permitted to access — is Lesson 3's exact pattern, reused without a new lab.

### Where This Lives

**File:** `vault.py` (new file, standalone).

### The New Code

```python
def request_secret(identity, secret_name):
    allowed_secrets = authorized_identities.get(identity, [])
    granted = secret_name in allowed_secrets
    access_log.append({
        "time": time.strftime("%H:%M:%S"),
        "identity": identity,
        "secret_name": secret_name,
        "granted": granted,
    })
    if granted:
        return secrets_store[secret_name]
    return None
```

### The Updated Project

```python
import time

secrets_store = {"database_password": "hunter2"}
authorized_identities = {"backend-service": ["database_password"]}
access_log = []

def request_secret(identity, secret_name):        # ← new
    allowed_secrets = authorized_identities.get(identity, [])  # ← new
    granted = secret_name in allowed_secrets         # ← new
    access_log.append({                               # ← new
        "time": time.strftime("%H:%M:%S"),               # ← new
        "identity": identity,                              # ← new
        "secret_name": secret_name,                          # ← new
        "granted": granted,                                    # ← new
    })                                                          # ← new
    if granted:                                                  # ← new
        return secrets_store[secret_name]                         # ← new
    return None                                                    # ← new

print("backend-service requests database_password:",
      request_secret("backend-service", "database_password"))
print("intern-laptop requests database_password:",
      request_secret("intern-laptop", "database_password"))

for entry in access_log:
    print(entry)
```

`secrets_store` holds the actual secret values — in a real system, this would be
encrypted at rest using exactly Lesson 8's `Fernet`, with the decryption key managed by
the vault infrastructure itself rather than by any of its callers. `authorized_identities`
is a lookup table, in Lesson 3's exact shape, mapping a caller's identity to the specific
secrets that identity is permitted to retrieve — `backend-service` may fetch
`database_password`; nothing else may, by default.

### Mechanical Walkthrough

- `authorized_identities.get(identity, [])` — **(b) hard concept reappearing**: a
  dictionary lookup with a default value, defending against `KeyError` for an identity the
  vault has never heard of — reused from earlier lessons' lookup-table pattern.
- `secret_name in allowed_secrets` — **(b) hard concept reappearing**: Lesson 3's exact
  authorization check, applied here to secrets instead of diary entries — is the specific
  thing being requested in the specific list this identity is permitted to access.
- `access_log.append({...})` — **(a) first appearance**: every single call to
  `request_secret` is recorded — including denied ones — before the function returns
  anything. This line runs unconditionally, regardless of whether `granted` is `True` or
  `False`.
- `time.strftime("%H:%M:%S")` — **(a) first appearance**: formats the current time as an
  hour:minute:second string, giving each log entry a timestamp.

### CS Lens

The critical design decision is *where* `access_log.append` sits: before the
`if granted` branch, not after, and not only inside it. A version that logged only
successful retrievals would silently lose the far more security-relevant event — someone
who *shouldn't* have access, asking for it anyway.

```
Also recognized in: every real secrets manager (HashiCorp Vault, AWS Secrets
Manager, Azure Key Vault) built around this exact pattern -- authenticate the
caller, authorize the specific secret, log every access attempt whether granted
or denied -- and every SOC 2 or compliance audit that specifically asks "can you
show us who accessed this secret and when," a question none of this lesson's
earlier units could answer at all.
```

### SE Lens

The alternative this toy vault doesn't implement, but every production secrets manager
does, is **rotation**: periodically replacing a secret's value and updating every
authorized consumer, so that a secret leaked at some point in the past (via any of this
lesson's earlier failure modes, or simply through personnel turnover) has a bounded
useful lifetime for an attacker. Building rotation correctly is genuinely harder than
everything else in this lesson combined — it requires coordinating an update across every
system that depends on the old value without an outage — which is exactly why
organizations adopt dedicated secrets-management infrastructure rather than building this
toy version themselves, once the requirement grows past "one script, one secret."

### Run It

```
backend-service requests database_password: hunter2
intern-laptop requests database_password: None

--- audit log ---
{'time': '00:09:17', 'identity': 'backend-service', 'secret_name': 'database_password', 'granted': True}
{'time': '00:09:17', 'identity': 'intern-laptop', 'secret_name': 'database_password', 'granted': False}
```

`backend-service`'s legitimate request succeeds and is logged. `intern-laptop`'s request —
whether a genuine mistake or a real intrusion attempt — is refused *and* logged, with
enough detail (who, what, when, and the fact that it was denied) to actually investigate
later. None of the previous three units could produce this record: a hardcoded secret, a
launch-time environment variable, and an encrypted file all fail to answer "who accessed
this, and when" even in principle.

This unit is the answer every previous unit in this lesson was missing: not a stronger way
to hide a secret's *value*, but a system that controls and records who is allowed to see
it at all.

---

## Connect the Pieces

Trace `database_password`'s hypothetical journey across all four units: hardcoded in
`config.py`, it survives forever in git history even once deleted from the working file
(unit one). Moved to an environment variable, it's no longer in source control, but is
fully readable by anything with permission to inspect the running process (unit two).
Encrypted at rest, the file on disk is unreadable without the key — but the key itself has
to live somewhere, and encrypting a secret without solving *that* is motion without
progress (unit three). Only the vault (unit four) actually closes the loop: the secret's
value is never handed to a caller without an authorization check, and every attempt —
successful or not — leaves a record. Each unit's fix addressed one specific way the
previous approach could leak; none of the first three, individually, is "wrong" so much as
incomplete against the full range of realistic threats this lesson walked through in
order.

## What Breaks Without This

Delete the `access_log.append(...)` line from `vault.py` and rerun it with
`intern-laptop`'s denied request. The function still correctly returns `None` — access
control still works — but there is now no record anywhere that the attempt happened at
all. In a real incident, this is the exact difference between an investigation that can
answer "did anyone try to access this secret before it was found in an attacker's
possession" and one that has no way to know.

## Exercises

1. Add a second identity, `"batch-job"`, authorized only for a *different* secret than
   `database_password`, and confirm both that it can retrieve its own secret and that it is
   correctly denied `database_password`.
2. Modify `vault.py` so that `secrets_store`'s values are stored using `encrypted_secrets.py`'s
   `Fernet` approach internally, decrypting only inside `request_secret`'s `if granted`
   branch — combining units three and four into one system, the way a real vault does.
3. Add a simple rate limit to `request_secret` — refuse and log any identity that has
   made more than 3 requests (successful or not) within the current run — and explain, in
   one sentence, connecting to Lesson 2's `Doorbell` example, what class of attack this
   defends against.

## Definition of Done

- [ ] You reproduced the git history demo and confirmed `git show HEAD~1:config.py`
      recovers the deleted secret
- [ ] You reproduced the `/proc/<pid>/environ` exposure and can state, precisely, the
      distinction between a launch-time environment variable and a runtime
      `os.environ` assignment
- [ ] You ran `encrypted_secrets.py` and can explain, in one sentence, why encrypting a
      secrets file alone does not solve secrets management
- [ ] You ran `vault.py` and can explain why the audit log entry for the denied request
      matters as much as the entry for the granted one
- [ ] You completed at least one exercise
- [ ] `git add .` and `git commit -m "Lesson 19: secrets management -- history, process
      exposure, encryption at rest, and a minimal audited vault"` in your
      `security-labs/` folder

**Next:** Lesson 20 opens Module G — Practice — with Secure Code Review, where you'll
apply every pattern from this course as a checklist against a real, unfamiliar piece of
code, rather than being told in advance which lesson's vulnerability it contains.
