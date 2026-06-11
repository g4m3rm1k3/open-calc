# PyX — LAB 28 — The Vite Plugin

**Prerequisites:** Lab 27 complete. The full-stack app runs.

**What this lab adds:**
- A Vite plugin that transforms `.pyx` files via `pyxc`
- The Vite `transform` hook — called by Vite for every imported file
- Hot Module Replacement (HMR) for `.pyx` files
- The workflow: save `.pyx` → Vite detects → pyxc transforms → browser reloads

**Time:** 45–60 minutes.

---

## What You Will Build

A Vite plugin `vite-plugin-pyx.js` that:

```javascript
// app/vite.config.js
import { defineConfig } from 'vite'
import { pyxPlugin } from './vite-plugin-pyx.js'

export default defineConfig({
  plugins: [pyxPlugin()],
  esbuild: {
    jsxFactory: 'h',
    jsxFragment: 'Fragment',
    jsxInject: `import { h, Fragment } from 'pyx-runtime'`,
  },
})
```

After this: `import { Counter } from './counter.pyx'` works in JavaScript — Vite calls pyxc on the `.pyx` file automatically.

---

> **Quick Check:**
>
> 1. The Vite `transform` hook receives a file's source code and its ID (file path). It returns the transformed code. For a `.pyx` file, what transformation should it perform?
> 2. Vite uses ES modules. To use `.pyx` files as modules, Vite must resolve them. What does the `resolveId` hook do?
> 3. When you `import { Counter } from './counter.pyx'`, what does Vite serve to the browser?
>
> *(Answers at the end)*

---

## Concept: The Vite Plugin API

**What it is:** A Vite plugin is a JavaScript object with hooks. Vite calls the hooks at specific points during the build:

| Hook | When called | What to return |
|---|---|---|
| `resolveId(id)` | Vite resolves an import path | The resolved path, or null to skip |
| `load(id)` | Vite reads a file | The file source, or null to use the file system |
| `transform(code, id)` | Vite transforms a file | The transformed code, or null to skip |
| `handleHotUpdate(ctx)` | A file changes in dev mode | Nothing (trigger HMR manually if needed) |

For the PyX plugin, only `transform` is needed: when the file ID ends with `.pyx`, run `pyxc` on the source and return the JSX output.

---

## Step 1 — Write the Vite Plugin

Create `app/vite-plugin-pyx.js`:

```javascript
import { execSync } from 'child_process'
import { writeFileSync, readFileSync, unlinkSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'

/**
 * A Vite plugin that transforms .pyx files using pyxc.
 *
 * For each .pyx file imported in the project, the plugin:
 * 1. Writes the source to a temporary .pyx file
 * 2. Runs `pyxc build` on it to get JSX output
 * 3. Returns the JSX to Vite for further processing
 */
export function pyxPlugin() {
  return {
    name: 'vite-plugin-pyx',
    enforce: 'pre',  // run before other plugins

    transform(code, id) {
      if (!id.endsWith('.pyx')) return null

      // Write to a temp file
      const tmpPyx = join(tmpdir(), `pyx_${Date.now()}.pyx`)
      const tmpJsx = tmpPyx.replace('.pyx', '.jsx')

      try {
        writeFileSync(tmpPyx, code, 'utf-8')
        execSync(`pyxc build "${tmpPyx}" --output "${tmpJsx}"`, {
          stdio: 'pipe',
        })
        const jsx = readFileSync(tmpJsx, 'utf-8')
        return { code: jsx, map: null }
      } catch (err) {
        const message = err.stderr?.toString() || err.message
        this.error(`PyX compilation failed for ${id}:\n${message}`)
        return null
      } finally {
        try { unlinkSync(tmpPyx) } catch {}
        try { unlinkSync(tmpJsx) } catch {}
      }
    },
  }
}
```

---

## Step 2 — Update the Vite Config

Update `app/vite.config.js`:

```javascript
import { defineConfig } from 'vite'
import { pyxPlugin } from './vite-plugin-pyx.js'
import path from 'path'

export default defineConfig({
  plugins: [pyxPlugin()],
  resolve: {
    alias: {
      'pyx-runtime': path.resolve(__dirname, '../runtime/src/index.ts'),
    },
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.pyx'],  // add .pyx
  },
  esbuild: {
    jsxFactory: 'h',
    jsxFragment: 'Fragment',
    jsxInject: `import { h, Fragment } from 'pyx-runtime'`,
  },
})
```

---

## Step 3 — Update main to Import `.pyx` Directly

Update `app/src/main.js`:

```javascript
import { TodoApp } from '../examples/full-stack/app.pyx'
import { renderRoot } from 'pyx-runtime'

renderRoot(TodoApp, document.getElementById('root'))
```

---

### SAVE AND TRY

```
> cd app && npm run dev
```

Modify `app.pyx` — change the heading text. Save. The browser should hot-reload with the new text — without running `pyxc build` manually.

---

## Step 4 — Improve Error Display

The current plugin throws a Vite build error for pyxc failures. Better: show the error as an overlay in the browser, like Vite does for TypeScript errors.

Update the `transform` hook's catch:

```javascript
} catch (err) {
  const message = err.stderr?.toString() || err.message
  // Return an error module that displays the error in the browser
  const escapedMsg = JSON.stringify(message)
  return {
    code: `
      const msg = ${escapedMsg};
      if (import.meta.hot) {
        import.meta.hot.send('pyx:error', { message: msg });
      }
      throw new Error('PyX compilation error: ' + msg);
    `,
    map: null,
  }
}
```

---

## Challenge: Source Map Integration

**You know:** The pyxc compiler generates `.jsx.map` files (Lab 15). The plugin currently ignores them.

**Task:** Update the `transform` hook in the Vite plugin to also read the generated source map file and return it alongside the JSX code. When Vite receives a source map from a plugin, it threads it through to the browser devtools.

After this change, errors in a PyX component should show `.pyx` source lines in the browser, not `.jsx` lines.

Try modifying the plugin before revealing the solution.

---

<details>
<summary>▶ Show Solution</summary>

```javascript
async transform(code, id) {
  if (!id.endsWith('.pyx')) return null;

  const tmpPyx = id + '.tmp.pyx';
  const tmpJsx = id + '.tmp.jsx';

  writeFileSync(tmpPyx, code, 'utf-8');

  execSync(`pyxc build ${tmpPyx} --output ${tmpJsx}`);

  const jsx = readFileSync(tmpJsx, 'utf-8');

  // Read the source map if it was generated
  const mapPath = tmpJsx + '.map';
  let map = null;
  if (existsSync(mapPath)) {
    map = JSON.parse(readFileSync(mapPath, 'utf-8'));
  }

  return { code: jsx, map };
}
```

**Key insight:** Vite's `transform` hook can return either a plain string (`code`) or an object with `code` and `map`. When the `map` field is present, Vite registers it as the source map for this module. The browser devtools then use it to translate generated positions back to `.pyx` source positions. `existsSync(mapPath)` prevents a crash when source maps are disabled — the map is optional.

</details>

---

## Final Check

| Feature | How to verify |
|---|---|
| `.pyx` files import directly | `import { X } from './x.pyx'` works in JS |
| Vite hot-reloads on `.pyx` save | Edit a `.pyx` file → browser updates without manual build |
| Compilation errors show | Introduce a syntax error in `.pyx` → error displays |
| Source maps work | Error points to `.pyx` line in devtools |

---

## Your Complete Files

### Changed files this lab

**`runtime/vite.config.ts`** — add the PyX plugin (`pyxPlugin()`) and the `.pyx` extension. Full updated content in Steps 1–2.

### Project structure at end of Lab 28

```
pyx/
├── .venv/
├── backend/               ← unchanged
├── compiler/              ← unchanged
├── runtime/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts     ← updated (PyX plugin added)
│   └── src/
│       └── (all runtime source files — unchanged)
├── examples/
│   └── (all .pyx and .jsx files)
└── pyproject.toml
```

---

## Quick Check Answers

**1. What transformation should the `transform` hook perform?**

Run `pyxc build` on the `.pyx` source and return the JSX output as the `code` field. Vite then processes the JSX (compiling `<div>` to `h("div", ...)` calls) as it would any `.jsx` file.

**2. What does the `resolveId` hook do?**

It tells Vite how to find a module given its import ID. For standard files, Vite resolves by looking in the file system. For custom module types, `resolveId` can redirect to a custom location. For `.pyx` files, Vite can resolve them by file path without a custom `resolveId` — the `extensions` config option and the `transform` hook together handle it.

**3. What does Vite serve to the browser for a `.pyx` import?**

The browser never sees `.pyx` files. Vite intercepts the import, calls the `transform` hook which runs pyxc and returns JSX, then compiles the JSX to JavaScript using esbuild. The browser receives plain JavaScript — no trace of Python or PyX visible in the network tab.

---

*End of LAB 28.*

*Lab 29 reviews every error message in the compiler and runtime — each is evaluated against the standard: does it say what went wrong, where, and what to do? Poor messages are rewritten.*
