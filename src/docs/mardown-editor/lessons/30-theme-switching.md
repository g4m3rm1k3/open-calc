# Lesson 30 — Theme Switching

## What You Will Build

A toggle in the app header switches between light and dark mode. The Monaco editor, the
markdown renderer, and the shell chrome all update instantly. The theme preference is
persisted to `localStorage` (web) or Electron's store (desktop) and restored on the next
launch. This lesson introduces React Context — the tool for state that many components need.

---

## What You Need to Know First

- Lesson 9: Monaco editor, `editor.updateOptions`, the `theme` prop
- Lesson 10: `localStorage` persistence, `electron-store`
- Lesson 3: `ChapterView`, `ReactMarkdown`, component props

---

## The Lesson

### Step 1 — The Problem: Prop Drilling

Without React Context, sharing the current theme with every component that needs it would
require passing it as a prop through every level of the component tree:

```
App (has theme)
  ↓ theme prop
  Sidebar (passes theme down, doesn't use it)
    ↓ theme prop
    ChapterItem (uses theme for text colour)
  ↓ theme prop
  ChapterView (passes theme down)
    ↓ theme prop
    CodeBlock (uses theme for Monaco and output panel)
      ↓ theme prop
      OutputPanel (uses theme for background)
```

This is **prop drilling** — passing data through components that do not use it, just to
get it to a component that does. It creates tight coupling (Sidebar must know about theme
even though it does not care) and makes refactoring painful.

**React Context solves this.** A Context is a value that any component in the tree can
read without it being passed as a prop. The value is provided once at the top of the tree
and consumed wherever it is needed.

### Step 2 — CSS Custom Properties

Before wiring up React Context, define the theme as CSS custom properties (also called
CSS variables). This is the mechanism that makes theme switching instant:

In `packages/renderer/src/themes.css`:

```css
:root {
  /* Dark theme (default) */
  --bg-primary:    #0d1117;
  --bg-secondary:  #161b22;
  --bg-code:       #0d0d1a;
  --border:        #30363d;
  --text-primary:  #e6edf3;
  --text-secondary: #8b949e;
  --text-link:     #58a6ff;
  --syntax-string: #79c0ff;
  --syntax-keyword: #ff7b72;
}

[data-theme="light"] {
  --bg-primary:    #ffffff;
  --bg-secondary:  #f6f8fa;
  --bg-code:       #f6f8fa;
  --border:        #d0d7de;
  --text-primary:  #1f2328;
  --text-secondary: #57606a;
  --text-link:     #0969da;
  --syntax-string: #0a3069;
  --syntax-keyword: #cf222e;
}
```

Applying the light theme is one attribute on the document root:
```javascript
document.documentElement.setAttribute('data-theme', 'light')
// or
document.documentElement.removeAttribute('data-theme')
```

Replace hardcoded colour values in existing components with CSS variables:
```typescript
// Before:
background: '#0d1117',
color: '#e2e8f0',

// After:
background: 'var(--bg-primary)',
color: 'var(--text-primary)',
```

**CS lens:** CSS custom properties cascade — a variable set on `:root` is available to all
elements. Setting a different value on `[data-theme="light"]` overrides the root value for
all elements under that attribute. The browser re-paints every affected element immediately
when the attribute changes. This is why theme switching is instant — no JavaScript
re-renders, no state updates.

### Step 3 — The Theme Context

```typescript
// packages/renderer/src/ThemeContext.tsx
import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

type Theme = 'dark' | 'light'

interface ThemeContextValue {
  readonly theme: Theme
  readonly toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'dark',
  toggleTheme: () => {},
})

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    // Read persisted preference on first render
    try {
      const stored = localStorage.getItem('codex:theme')
      return stored === 'light' ? 'light' : 'dark'
    } catch {
      return 'dark'
    }
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    try {
      localStorage.setItem('codex:theme', theme)
    } catch {
      // localStorage may be unavailable in some environments
    }
  }, [theme])

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark')

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext)
}
```

**`createContext` explained:**
`createContext(defaultValue)` creates a Context object. The default value is used when a
component tries to consume the context but is not wrapped in a Provider. The default here
is `{ theme: 'dark', toggleTheme: () => {} }` — safe defaults that do nothing, preventing
crashes if a component is accidentally rendered outside the Provider.

**Lazy initialiser in `useState`:**
```typescript
const [theme, setTheme] = useState<Theme>(() => {
  // ...read from localStorage
})
```
The function form of `useState` runs only on the first render. Without it, `localStorage.getItem`
would run on every render — wasteful when `useState` only uses the initial value once.

**`useEffect` dependency on `[theme]`:**
The effect runs whenever `theme` changes: it sets the `data-theme` attribute and saves to
`localStorage`. This ensures the DOM and storage stay in sync with React state.

### Step 4 — Monaco Theme

Monaco has its own theme system. Update `CodeBlock.tsx` to read the current theme and pass
it to Monaco:

```typescript
import { useTheme } from './ThemeContext'

export function CodeBlock({ language, children, onRun }: CodeBlockProps) {
  const { theme } = useTheme()
  // ...

  return (
    <div>
      {/* ... */}
      <Editor
        theme={theme === 'dark' ? 'vs-dark' : 'vs'}
        // ... other props
      />
    </div>
  )
}
```

Monaco's built-in themes:
- `'vs-dark'` — dark theme (matches VS Code's dark mode)
- `'vs'` — light theme (VS Code's light mode)

### Step 5 — The Theme Toggle Button

Add a toggle to the app header:

```typescript
// In App.tsx header:
import { useTheme } from '@codex/renderer'

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  return (
    <button
      onClick={toggleTheme}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      style={{
        background: 'none',
        border: '1px solid var(--border)',
        borderRadius: '4px',
        padding: '4px 8px',
        color: 'var(--text-secondary)',
        cursor: 'pointer',
        fontSize: '0.85rem',
      }}
    >
      {theme === 'dark' ? '☀ Light' : '☾ Dark'}
    </button>
  )
}
```

Wrap the entire app in `ThemeProvider`:

```typescript
// In apps/electron/src/renderer/index.tsx (or wherever React mounts):
import { ThemeProvider } from '@codex/renderer'

root.render(
  <ThemeProvider>
    <App />
  </ThemeProvider>
)
```

### Step 6 — Electron Store for Desktop

In Electron, `localStorage` works but its data can be cleared by OS cleanup utilities.
`electron-store` persists to a JSON file in the user's application data directory, which
survives clear operations.

```typescript
// In apps/electron/src/main.ts
import Store from 'electron-store'

const store = new Store<{ theme: 'dark' | 'light' }>()

ipcMain.handle('theme:get', () => store.get('theme', 'dark'))
ipcMain.handle('theme:set', (_event, theme: 'dark' | 'light') => store.set('theme', theme))
```

In `preload.ts`:
```typescript
getTheme: (): Promise<'dark' | 'light'> => ipcRenderer.invoke('theme:get'),
setTheme: (theme: 'dark' | 'light'): Promise<void> => ipcRenderer.invoke('theme:set', theme),
```

Update `ThemeProvider` to use Electron's API when available, falling back to `localStorage`:

```typescript
const savedTheme = window.codexAPI?.getTheme ? await window.codexAPI.getTheme() : localStorage.getItem('codex:theme')
```

---

## Connect the Pieces

The `ThemeContext` is consumed by `CodeBlock`, the markdown renderer wrapper, the sidebar,
and the output panel. Each component reads `useTheme().theme` and adjusts its appearance.
No prop is passed — the context is a global within the React tree. Components are decoupled
from the source of the theme preference.

Lesson 22 (VS Code extension) uses Monaco's built-in light/dark detection via the VS Code
API — `vscode.window.activeColorTheme` — and does not need this context at all. This is
the adapter pattern: the VSCode shell provides the theme in its own way; the shared renderer
package reads from whatever source is available.

CSS custom properties as a theming primitive is the same technique used by every major
design system: GitHub's Primer, Atlassian's Design System, Material UI, and Tailwind all
define their colour tokens as CSS custom properties on `:root`. This means third-party
components that respect these variables participate in theme switching without any explicit
wiring. The pattern in this lesson — define the palette once on `:root`, override on a
`[data-theme]` attribute, let every component inherit — is production-grade. It is also
what `prefers-color-scheme` media queries hook into: the OS dark mode preference can be
read in CSS with `@media (prefers-color-scheme: dark)` and used to set the `data-theme`
attribute automatically, which is a natural extension of the `ThemeProvider` built here.

---

## What Breaks Without This

Without CSS custom properties, theme switching requires re-rendering every component with
new inline style values. With 50 code blocks on a long chapter page, this would be
noticeably slow. CSS custom properties let the browser handle the visual update natively,
without any JavaScript component re-rendering.

---

## Definition of Done

- [ ] The header shows a light/dark toggle button
- [ ] Clicking the toggle switches all UI between light and dark
- [ ] Monaco editor theme switches between `vs-dark` and `vs`
- [ ] The theme preference is saved and restored on the next app launch
- [ ] No component passes `theme` as a prop — all read from `useTheme()`
- [ ] You can answer: what problem does React Context solve?
- [ ] You can answer: why do CSS custom properties make theme switching fast?
- [ ] `git commit` with a message explaining why
