# Vault PDM — Lesson 10 — Sessions: Staying Logged In

## What You Will Build

After connecting, Vault stores a session token in Electron's encrypted storage. On
the next app launch, Vault reads the session token, validates it, and skips the
Connect screen — the user is already logged in. A "Disconnect" button in the toolbar
deletes the session and returns to the Connect screen. The PAT is stored encrypted
via the OS keychain; it is never in a plaintext file.

## What You Need to Know First

Lessons 01–09. Authentication creates a `StoredUser` in the database. This lesson
makes that authentication persist across app launches.

---

## The Problem

After connecting in lesson 09, closing and reopening Vault returns to the Connect
screen. The user must enter their PAT again. This is acceptable for a prototype but
unworkable in daily use — engineers check files in and out dozens of times per day
and cannot be expected to paste a PAT on every launch.

The solution is a **session**: a token that represents "this device has already
authenticated." The session token is stored securely by Electron and verified on
launch. If the session is valid, the app boots directly into the authenticated state.

---

## Step 1 — What a Session Is

**Session — first appearance:**
A **session** is a server-side record (or an encrypted token) that represents an
authenticated state. When a user authenticates, a session is created. On subsequent
requests, the session token is presented instead of credentials — the server verifies
the session and knows who the user is without requiring re-authentication.

A session token is not a credential — it does not prove who the user is on GitLab.
It proves that this device was authenticated at some point in the past. The distinction
matters: a stolen session token allows impersonating the session; it does not reveal
the PAT.

**Why not store the PAT and re-use it:**
The PAT allows Vault to authenticate as the user on GitLab. Storing it is storing a
credential. The session approach stores a derivative: a UUID that maps to a user
record, plus a mechanism to re-validate the PAT when needed. The PAT does need to
be stored to allow non-interactive GitLab API calls (lesson 20 — WIP saves); it is
stored encrypted via `safeStorage` for that purpose.

---

## Step 2 — Electron's safeStorage

**`safeStorage` — first appearance:**
Electron's `safeStorage` API encrypts and decrypts strings using the OS credential
manager:
- **macOS:** Keychain Services (the same system that stores Wi-Fi passwords, SSH keys)
- **Windows:** DPAPI (Data Protection API) — the OS encrypts data tied to the
  Windows user account
- **Linux:** Secret Service (GNOME Keyring or KWallet)

The encryption key is derived from OS-managed credentials. An attacker who has the
encrypted bytes but not the OS access cannot decrypt them. An attacker who already
has OS access can decrypt them — but at that point, they have access to everything
on the machine anyway.

**What `safeStorage` protects against:**
- Reading the Vault application data directory and extracting stored tokens from
  plain files
- Recovering secrets from a disk image or backup of the machine
- Memory dumps (partial protection — the decrypted value is in memory briefly)

**What `safeStorage` does NOT protect against:**
- A fully compromised OS (the attacker has your user account)
- Physical access with boot from external media (if full-disk encryption is not enabled)

For a developer desktop application, `safeStorage` is the correct security level.
Production enterprise software would add certificate pinning, hardware security
modules (HSMs), and multi-factor authentication. For Vault's scope, `safeStorage` is
both necessary and sufficient.

---

## Step 3 — Session Management in the Main Process

### Create `src/main/sessionStore.ts`

```typescript
import { safeStorage, app }  from 'electron'
import path                   from 'path'
import fs                     from 'fs'
```

**`fs` — first appearance:**
`fs` (file system) is a Node.js built-in module for reading and writing files. We use
it to persist the encrypted session token to a file (the encrypted bytes themselves
are safe to store in a file — they cannot be decrypted without the OS credentials).

`safeStorage.encryptString(value)` — encrypts a string, returns a `Buffer` (raw bytes).
`safeStorage.decryptString(buffer)` — decrypts a `Buffer`, returns the original string.
The `Buffer` can be written to a file and read back.

```typescript
const SESSION_FILE = path.join(app.getPath('userData'), 'vault-session.bin')
```

**`app.getPath('userData')` — first appearance:**
`app.getPath('userData')` returns the OS-standard path for application data:
- macOS: `~/Library/Application Support/vault/`
- Windows: `%APPDATA%\vault\`
- Linux: `~/.config/vault/`

This is the correct place to store application state files. Do not write to the
current working directory or the app bundle — these may not be writable in
production builds.

```typescript
export interface SessionData {
  vaultUserId: string
  username:    string
  name:        string
  email:       string
  gitlabUrl:   string
  encryptedPat: string
}

export function saveSession(data: SessionData & { pat: string }): void {
  if (!safeStorage.isEncryptionAvailable()) {
    console.warn('safeStorage encryption not available — session will not persist')
    return
  }

  const sessionPayload = JSON.stringify({
    vaultUserId: data.vaultUserId,
    username:    data.username,
    name:        data.name,
    email:       data.email,
    gitlabUrl:   data.gitlabUrl,
  })

  const encryptedSession = safeStorage.encryptString(sessionPayload)
  const encryptedPat     = safeStorage.encryptString(data.pat)

  const combined = {
    session: encryptedSession.toString('base64'),
    pat:     encryptedPat.toString('base64'),
  }

  fs.writeFileSync(SESSION_FILE, JSON.stringify(combined), 'utf8')
}

export function loadSession(): (SessionData & { pat: string }) | null {
  if (!safeStorage.isEncryptionAvailable()) return null
  if (!fs.existsSync(SESSION_FILE)) return null

  try {
    const raw     = fs.readFileSync(SESSION_FILE, 'utf8')
    const combined = JSON.parse(raw) as { session: string; pat: string }

    const sessionBuffer = Buffer.from(combined.session, 'base64')
    const patBuffer     = Buffer.from(combined.pat,     'base64')

    const sessionPayload = JSON.parse(
      safeStorage.decryptString(sessionBuffer),
    ) as SessionData

    const pat = safeStorage.decryptString(patBuffer)

    return { ...sessionPayload, pat }
  } catch {
    return null
  }
}

export function clearSession(): void {
  if (fs.existsSync(SESSION_FILE)) {
    fs.unlinkSync(SESSION_FILE)
  }
}
```

**`safeStorage.isEncryptionAvailable()` — first appearance:**
Returns `true` if the OS keychain is available. On Linux without a secret service
configured, it returns `false`. Vaulting silently if encryption is unavailable (with
a warning) is more robust than crashing.

**`Buffer.from(string, 'base64')` and `.toString('base64')` — first appearance:**
`safeStorage.encryptString` returns a `Buffer` — raw bytes. Files are written as
text. Converting bytes to base64 makes them safe to store in a JSON string:

- `encryptedBytes.toString('base64')` — converts bytes to a base64 ASCII string
- `Buffer.from(base64String, 'base64')` — converts back to bytes

**Base64 — first appearance:**
**Base64** is an encoding that represents binary data as printable ASCII characters.
It groups 3 bytes into 4 characters from a 64-character alphabet (A-Z, a-z, 0-9, +,
/). Base64-encoded data is about 33% larger than the original. Base64 is not
encryption — it is encoding. The encrypted bytes are secure; base64 just makes them
safe to embed in JSON.

**`fs.existsSync` — first appearance:**
`fs.existsSync(path)` returns `true` if the file exists. Unlike `fs.readFileSync`,
it does not throw if the file is absent. Use it to check for optional files before
reading.

**`try/catch` in `loadSession`:**
The session file might be corrupted (truncated write, disk error, manual editing).
`try/catch` handles any parse or decryption error by returning `null` — the app
falls back to the Connect screen. A crash on session load would make the app
unlaunchable without manually deleting the session file.

---

## Step 4 — Boot Sequence: Check Session on Launch

### Update `src/main/main.ts`

```typescript
import { loadSession } from './sessionStore.js'

app.whenReady().then(async () => {
  const existingSession = loadSession()
  createWindow()

  // After window is ready, tell the renderer about the session:
  mainWindow.webContents.once('did-finish-load', () => {
    if (existingSession !== null) {
      mainWindow.webContents.send('session:restore', existingSession)
    }
  })
})
```

**`mainWindow.webContents.send(channel, data)` — first appearance:**
`webContents.send` sends an IPC (Inter-Process Communication) message from the main
process to the renderer. `channel` is a string name for the message type;
`data` is the payload. The renderer listens for this channel with `ipcRenderer.on`.

**IPC (Inter-Process Communication) — first appearance:**
The main process and renderer process cannot share memory directly — they are separate
OS processes. IPC is the controlled message channel between them. Electron's IPC
has two sides:
- `webContents.send(channel, data)` — main → renderer
- `ipcRenderer.send(channel, data)` or `ipcRenderer.invoke(channel)` — renderer →
  main (used in lesson 19 for file downloads)

This is the first time the main process initiates communication with the renderer.

**Update `src/main/preload.ts` to expose the IPC channel:**

```typescript
import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  onSessionRestore: (callback: (session: SessionData) => void) => {
    ipcRenderer.on('session:restore', (_event, session) => callback(session))
  },
  saveSession: (data: SessionData & { pat: string }) => {
    ipcRenderer.send('session:save', data)
  },
  clearSession: () => {
    ipcRenderer.send('session:clear')
  },
})
```

**Update `src/main/main.ts` — handle session IPC from renderer:**

```typescript
import { ipcMain } from 'electron'
import { saveSession, clearSession } from './sessionStore.js'

ipcMain.on('session:save',  (_event, data) => saveSession(data))
ipcMain.on('session:clear', ()             => clearSession())
```

**`ipcMain.on(channel, handler)` — first appearance:**
`ipcMain.on` registers a listener in the main process for a channel. When the renderer
calls `ipcRenderer.send('session:save', data)`, the main process handler runs with
the data. `ipcMain.on` is for one-way messages; `ipcMain.handle` is for request-
response (covered in lesson 19).

---

## Step 5 — Renderer: Restore Session on Load

### Update `src/renderer/App.tsx`

```typescript
useEffect(() => {
  window.electronAPI.onSessionRestore((session) => {
    setCurrentUser({
      vaultUserId:  session.vaultUserId,
      username:     session.username,
      name:         session.name,
      email:        session.email,
    })
  })
}, [])
```

After connecting successfully, save the session:

```typescript
function handleConnected(user: ConnectedUser & { pat: string; gitlabUrl: string }): void {
  setCurrentUser(user)
  window.electronAPI.saveSession({
    vaultUserId: user.vaultUserId,
    username:    user.username,
    name:        user.name,
    email:       user.email,
    gitlabUrl:   user.gitlabUrl,
    pat:         user.pat,
  })
}
```

Add a Disconnect button to the toolbar:

```typescript
function handleDisconnect(): void {
  window.electronAPI.clearSession()
  setCurrentUser(null)
}

// In toolbar JSX:
<button className="disconnect-btn" onClick={handleDisconnect}>
  Disconnect
</button>
```

---

## Connect the Pieces

Session lifecycle:

```
First launch → no session file → Connect screen
User connects → GitLab validates → user upserted → session saved (encrypted)
App closed and reopened → session file exists → decrypt → session:restore IPC
Renderer receives session → skips Connect screen → user is logged in
User clicks Disconnect → session:clear IPC → file deleted → Connect screen
```

The PAT is stored encrypted alongside the session data. Lesson 20 (WIP saves) and
lesson 21 (check-in) will use the stored PAT to make authenticated GitLab API calls
without prompting the user again.

---

## What Breaks Without This

**Without `safeStorage` (storing session as plaintext):**
The session file at `userData/vault-session.json` is readable by any process on the
machine. More critically, it appears in backups — macOS Time Machine, Windows Backup,
cloud backup services. A backup of the app data contains the PAT in plaintext. The
PAT grants write access to the user's GitLab repositories. A leaked PAT from a backup
means a compromised repository.

**Without `webContents.once('did-finish-load', ...)`:**
Sending IPC before the renderer has loaded its JavaScript produces a message that is
delivered with no registered listener — it is silently dropped. The renderer never
receives the session data. The user sees the Connect screen despite a valid session.
The `once('did-finish-load', ...)` delay ensures the renderer is ready to receive.

---

## Definition of Done

- [ ] Connecting with a valid PAT, closing the app, and reopening it skips the Connect screen
- [ ] The toolbar shows the correct user name after session restore
- [ ] Clicking Disconnect returns to the Connect screen (session deleted)
- [ ] Reopening after Disconnect shows the Connect screen (session is gone)
- [ ] You can explain what `safeStorage` is and which OS system it uses on your platform
- [ ] You can explain base64 encoding — what it is, what it is not, and why bytes need it for JSON storage
- [ ] You can explain IPC — what it is, why main and renderer cannot share memory directly
- [ ] You can explain the difference between `ipcMain.on` and `ipcMain.handle`
- [ ] You can explain what a session token is and what it protects against vs what the PAT protects against
- [ ] Run:
      ```
      git add src/main/ src/renderer/
      git commit -m "Add session persistence: safeStorage encrypted session file, IPC session:restore on launch, Disconnect button clears session"
      ```

---

*Next: Lesson 11 — Connecting to a GitLab Project. After login, the user enters a
GitLab project ID. Vault fetches the project name from the GitLab API and stores the
selection. Phase 3 begins: the file tree.*
