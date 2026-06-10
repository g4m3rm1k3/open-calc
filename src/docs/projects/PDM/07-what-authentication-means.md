# Vault PDM — Lesson 07 — What Authentication Means

## What You Will Build

A "Connect to GitLab" screen in the Vault window. The user types a GitLab Personal
Access Token into a password-type input and clicks Connect. The form works — the
token is stored in React state and a loading state shows while connection is in
progress. Validation against GitLab happens in lesson 08. The Connect screen replaces
the file view until authentication succeeds.

## What You Need to Know First

Lessons 01–06. The four-layer skeleton is established. This lesson adds the
presentation layer for authentication — the UI screen. The domain and data layers
for auth come in lessons 08 and 09.

---

## The Problem

The hardcoded file view in lesson 04 has no concept of who is viewing it. In a PDM
system, every operation has an owner: who checked out this file? Who committed this
version? Who is currently using Vault? The system has no answers because it has no
identity.

Authentication is the first step: establishing who the user is before allowing any
operation. Without authentication, any user can check out files in anyone's name, see
files they should not, and corrupt the audit trail.

Authentication must come before the features it protects. This is why phase 2 builds
identity before phase 3 builds the file tree — the file tree will eventually show
who has files checked out, and that information requires a known user.

---

## Step 1 — Authentication vs Authorisation

**These two terms are frequently confused. They are distinct concepts.**

**Authentication** — "Who are you?"
Proving identity. The process of verifying that a person (or system) is who they
claim to be. Methods:
- Username + password: you know the password, so you are the owner
- Hardware token: you physically possess the device, so you are the owner
- Personal Access Token: you possess the token, so you are the authorised user

After authentication, the system knows who is making a request.

**Authorisation** — "What are you allowed to do?"
Deciding what an authenticated user can do. Examples:
- A user may check out files in their team's project, but not in another team's
- An admin user may delete version records; regular users may not
- A read-only user may view the file tree but not check out files

Authorisation always comes after authentication. You cannot decide what someone is
allowed to do until you know who they are.

**CS lens — the authentication-authorisation separation:**
These two concerns are always separated in well-designed systems. A user might be
authenticated (proven their identity) but not authorised (not permitted to do the
requested action). The system must check both: "Is this a real user?" and "Is this
user allowed to do this?" Conflating them produces access control bugs where
authenticated-but-not-authorised users succeed at operations they should not.

---

## Step 2 — Personal Access Tokens

**Personal Access Token (PAT) — first appearance:**
A **Personal Access Token** is a string that represents a user's identity and
permissions, scoped to a specific set of actions. GitLab generates PATs for users
in their account settings. A PAT looks like:

```
glpat-xxxxxxxxxxxxxxxxxxxx
```

The string itself is the credential — whoever possesses it has the permissions
associated with it. A PAT is:
- **Generated** by the service (GitLab), not the user
- **Scoped** to specific permissions (read API, write repository, etc.)
- **Revocable** — if lost or compromised, it can be deleted and regenerated
- **Time-limited** — GitLab allows setting an expiration date

**GitLab PAT scopes for Vault:**
When generating a PAT in GitLab for use with Vault, select these scopes:
- `read_api` — read any GitLab API endpoint (required to read project info and file trees)
- `read_repository` — read file content from repositories (required to download files)
- `write_repository` — commit files to repositories (required for check-in and WIP saves)

**Principle of least privilege — first appearance:**
Only request the minimum permissions needed. Vault does not need scope `api` (full
API access including creating projects, managing members, etc.) — only the three
listed above. If the PAT is compromised, the attacker can only do what the PAT
permits. Requesting fewer permissions limits the blast radius of a compromise.

**Security lens — why PATs must never be logged:**
A PAT is equivalent to a username+password combination. Any system that logs it —
in a terminal, in a log file, in a monitoring service — exposes it to anyone with
access to those logs. Vault must never log the PAT:
- No `console.log('Connecting with token:', pat)` — ever
- The PAT is sent over HTTP but only via request body (lesson 08 explains why not
  the URL)
- The PAT is displayed as `type="password"` in the UI (explained below)
- The PAT is never stored in plain text in the database (lesson 09 explains where
  it is stored and where it is not)

---

## Step 3 — The Connect Screen Component

### Create `src/renderer/ConnectScreen.tsx`

```typescript
import { useState } from 'react'
import './ConnectScreen.css'

type ConnectionState = 'idle' | 'connecting' | 'error'

interface ConnectScreenProps {
  onConnected: (userId: string) => void
}

export function ConnectScreen({ onConnected }: ConnectScreenProps) {
  const [token,           setToken]           = useState('')
  const [gitlabUrl,       setGitlabUrl]       = useState('https://gitlab.com')
  const [connectionState, setConnectionState] = useState<ConnectionState>('idle')
  const [errorMessage,    setErrorMessage]    = useState('')

  const canConnect = token.trim().length > 0 && gitlabUrl.trim().length > 0

  function handleTokenChange(event: React.ChangeEvent<HTMLInputElement>): void {
    setToken(event.target.value)
    if (connectionState === 'error') {
      setConnectionState('idle')
      setErrorMessage('')
    }
  }

  async function handleConnect(): Promise<void> {
    if (!canConnect) return
    setConnectionState('connecting')
    setErrorMessage('')

    try {
      const response = await fetch('http://localhost:3001/api/auth/connect', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ token, gitlabUrl }),
      })

      const data = await response.json() as { userId?: string; error?: string }

      if (response.ok && data.userId !== undefined) {
        onConnected(data.userId)
      } else {
        setConnectionState('error')
        setErrorMessage(data.error ?? 'Connection failed')
      }
    } catch {
      setConnectionState('error')
      setErrorMessage('Could not reach Vault API. Is the app running?')
    }
  }

  return (
    <div className="connect-screen">
      <div className="connect-card">
        <h1 className="connect-title">Connect to GitLab</h1>
        <p className="connect-description">
          Enter your GitLab Personal Access Token to connect Vault.
          Generate one at GitLab → Settings → Access Tokens.
          Required scopes: read_api, read_repository, write_repository.
        </p>

        <label className="field-label" htmlFor="gitlab-url">
          GitLab URL
        </label>
        <input
          id="gitlab-url"
          type="url"
          className="field-input"
          value={gitlabUrl}
          onChange={(e) => setGitlabUrl(e.target.value)}
          placeholder="https://gitlab.com"
          autoComplete="off"
        />

        <label className="field-label" htmlFor="pat-input">
          Personal Access Token
        </label>
        <input
          id="pat-input"
          type="password"
          className="field-input"
          value={token}
          onChange={handleTokenChange}
          placeholder="glpat-xxxxxxxxxxxxxxxxxxxx"
          autoComplete="off"
          spellCheck={false}
        />

        {connectionState === 'error' && (
          <p className="connect-error">{errorMessage}</p>
        )}

        <button
          className={`connect-btn connect-btn--${connectionState}`}
          onClick={handleConnect}
          disabled={!canConnect || connectionState === 'connecting'}
        >
          {connectionState === 'connecting' ? 'Connecting...' : 'Connect'}
        </button>
      </div>
    </div>
  )
}
```

**`type="password"` — first appearance:**
The HTML `type="password"` attribute on `<input>` tells the browser to:
1. Render the typed characters as dots or asterisks — **prevents shoulder surfing**
   (someone looking over the user's shoulder reading the token)
2. Suppress autocomplete suggestions — the browser's autocomplete remembers typed
   values; password-type inputs are excluded from this history
3. Not include the value in form-fill suggestions

Never use `type="text"` for secrets. A PAT displayed as plain text in a password
field is always a security mistake — even in internal tools. The `.step` is to set
this correctly from the first line of code.

**`autoComplete="off"` and `spellCheck={false}`:**
`autoComplete="off"` prevents the browser from suggesting previously typed values
for this input. Autocomplete is useful for names and addresses but harmful for tokens —
it might suggest an old revoked token.

`spellCheck={false}` prevents the browser from running spell-check on the token value.
Spell-check in some browsers uploads input content to a server for checking. A token
sent to a spell-check service is a token leak.

**`htmlFor` — linking labels to inputs:**
`<label htmlFor="pat-input">` links the label to the `<input id="pat-input">`.
In React, the HTML attribute `for` is written as `htmlFor` (to avoid conflict with
the JavaScript keyword `for`). Clicking the label focuses the input. Screen readers
announce the label text when the input is focused. Always associate labels with inputs
via `htmlFor`/`id`.

**`ConnectionState` — UI state machine:**
`'idle' | 'connecting' | 'error'` — three states. The connect button is disabled in
`'connecting'` state (prevents double-submission) and re-enabled in `'idle'` and
`'error'` states. The error message is shown only in `'error'` state. Typing in the
token field while in `'error'` state resets to `'idle'` — the user is trying again.

This is a **state machine**: a finite set of states, explicit transitions between
them. A boolean pair (`isConnecting: boolean, hasError: boolean`) would allow
impossible states (`isConnecting: true, hasError: true`). A union type prevents
impossible combinations.

**`onConnected` prop — lifting auth state:**
When authentication succeeds, `ConnectScreen` calls `onConnected(userId)` with the
user's UUID. The App component (which renders `ConnectScreen`) stores the userId in
state and switches to the file tree view. The ConnectScreen does not decide what to
show after authentication — it notifies its parent, which decides.

---

## Step 4 — Integrating the Connect Screen

### Update `src/renderer/App.tsx`

```typescript
import { useState, useEffect } from 'react'
import { ConnectScreen }        from './ConnectScreen.js'
import './App.css'

export default function App() {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  if (currentUserId === null) {
    return <ConnectScreen onConnected={(id) => setCurrentUserId(id)} />
  }

  return (
    <div className="app-shell">
      <header className="toolbar">
        <span className="app-name">Vault</span>
        <span className="toolbar-spacer" />
        <span className="user-indicator">Connected — {currentUserId}</span>
      </header>
      <main className="content">
        <p>File tree coming in lesson 12.</p>
      </main>
    </div>
  )
}
```

**Conditional rendering based on auth state:**
When `currentUserId` is `null`, the user is not authenticated — render
`ConnectScreen`. When it is a string, the user is authenticated — render the main
app shell. This pattern (render different root components based on auth state) is the
standard React authentication pattern. No routing library is needed for this simple
case.

---

## Step 5 — CSS for the Connect Screen

### Create `src/renderer/ConnectScreen.css`

```css
.connect-screen {
  display:         flex;
  align-items:     center;
  justify-content: center;
  height:          100vh;
  background:      var(--colour-background);
}

.connect-card {
  width:         400px;
  background:    var(--colour-surface);
  border:        1px solid var(--colour-border);
  border-radius: 8px;
  padding:       32px;
  display:       flex;
  flex-direction: column;
  gap:           14px;
}

.connect-title {
  font-size:   1.25rem;
  font-weight: 700;
  color:       var(--colour-text);
}

.connect-description {
  font-size: 0.8125rem;
  color:     var(--colour-text-muted);
  line-height: 1.6;
}

.field-label {
  font-size:   0.8125rem;
  font-weight: 500;
  color:       var(--colour-text-muted);
}

.field-input {
  background:    var(--colour-background);
  border:        1px solid var(--colour-border);
  border-radius: 4px;
  color:         var(--colour-text);
  padding:       8px 12px;
  font-size:     0.875rem;
  width:         100%;
  font-family:   monospace;
  outline:       none;
}

.field-input:focus {
  border-color: var(--colour-accent);
}

.connect-error {
  color:     var(--colour-error);
  font-size: 0.8125rem;
}

.connect-btn {
  padding:          10px;
  background-color: var(--colour-accent);
  color:            #0f172a;
  border:           none;
  border-radius:    4px;
  font-weight:      600;
  font-size:        0.875rem;
  cursor:           pointer;
  transition:       opacity 0.15s;
}

.connect-btn:disabled {
  opacity: 0.4;
  cursor:  not-allowed;
}

.connect-btn--connecting {
  opacity: 0.7;
}
```

**`:focus` styling — first appearance:**
`:focus` is a CSS pseudo-class that applies when an element has keyboard focus (the
user has tabbed to it or clicked it). `border-color: var(--colour-accent)` gives the
input a visual indicator when active — critical for keyboard navigation accessibility.
Without a focus style, keyboard users cannot tell which field is active.

---

## Connect the Pieces

The Connect screen is the entry point to the application. After lesson 08 validates
the PAT, the flow will be:

```
User opens Vault
  → currentUserId === null → ConnectScreen renders
  → User types PAT → handleConnect()
  → POST /api/auth/connect (lesson 08)
  → GitLab validates PAT → returns user info
  → DB writes user record (lesson 09)
  → onConnected(userId) → currentUserId set
  → Main file tree renders (lesson 12)
```

The `currentUserId` stored in App state is the UUID from the `users` table — not
the GitLab user ID. This distinction matters: the UUID is Vault's internal identity;
the GitLab user ID is the external identity. They are linked in the database.

---

## What Breaks Without This

**Without `type="password"` on the PAT input:**
The token is visible as plain text. Any bystander can read it from the screen.
Even in internal tools used only by engineers in an office, shoulder surfing is a
real attack. `type="password"` is a one-line change with no downsides.

**Without clearing the error on token change:**
The user types an invalid token, sees "Invalid token." They correct the token and
press Enter — but the error message from the previous attempt is still showing. The
UI is misleading: it shows an error state while the user is typing a new attempt.
Resetting to `'idle'` on input change ensures the error only shows for the current
attempt.

---

## Definition of Done

- [ ] The Connect screen renders when the app launches (before authentication)
- [ ] The PAT input renders characters as dots (type="password")
- [ ] Typing any value enables the Connect button
- [ ] The Connect button shows "Connecting..." and is disabled during the API call
- [ ] After the API call (which returns 404 — the route does not exist yet), the error state shows
- [ ] You can explain the difference between authentication and authorisation with a concrete example
- [ ] You can explain what a PAT scope is and the principle of least privilege
- [ ] You can explain why PATs must never be logged and what harm logging would cause
- [ ] You can explain `type="password"` and what it prevents
- [ ] You can explain the `ConnectionState` union type and why it is better than two booleans
- [ ] Run:
      ```
      git add src/renderer/
      git commit -m "Add Connect screen: PAT input with type=password, state machine for connection state, conditional auth-gated rendering"
      ```

---

*Next: Lesson 08 — Validating the Token Against GitLab. The API layer adds
`POST /api/auth/connect`. The Express server calls GitLab's `/api/v4/user` endpoint.
If the token is valid, the user's name appears in Vault. HTTP status codes, request
bodies, and authorization headers are taught in detail.*
