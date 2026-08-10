# Concept: Build-Tool Plugins

**What you'll understand by the end:** why a dev/build tool ships with a minimal core and adds capabilities like JSX compilation through explicit, opt-in plugins instead of supporting everything out of the box.

**Prerequisites:** `npm-package-json.md`, `vite-dev-server-config.md`.

## Setup

A Vite-scaffolded project:
```
npm create vite@latest my-app -- --template vanilla-ts
npm install
```

## The Problem

A build tool's core job — transforming and serving source files quickly during development, bundling them for production — is useful to nearly every project the same way. But *what kinds* of files and syntax a project uses varies enormously: plain TypeScript, JSX, Vue's own template syntax, CSS preprocessors, and many more, each requiring different transformation logic. Building support for every possible syntax directly into the tool's core would make it bigger and slower for the vast majority of projects that only need a fraction of it.

## The Isolated Example

`vite.config.ts` with no plugins:
```typescript
import { defineConfig } from "vite";

export default defineConfig({});
```
Attempting to use a `.tsx` file with JSX syntax under this config:
```tsx
function Hello() {
  return <h1>Hi</h1>;
}
```
**Real behavior:** the dev server fails to serve the file correctly — Vite's core has no idea how to transform `<h1>Hi</h1>` into valid JavaScript, since JSX isn't standard TypeScript/JavaScript syntax at all.

`vite.config.ts` with the plugin added:
```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
});
```
**Real behavior:** the identical `.tsx` file now compiles and renders correctly — the plugin taught Vite's transformation pipeline a new capability it didn't have before.

**What this proves:** Vite's own core behavior didn't change between the two configs — the exact same dev server, given a fundamentally new capability (understanding JSX) purely by being told, explicitly, to load an additional plugin.

## Mechanical Walkthrough

- `plugins: [react()]` — the `plugins` array in a Vite config lists every extension the build pipeline should load; `react()` calls a factory function (imported from a separate, real npm package, `@vitejs/plugin-react`) that returns a plugin object Vite knows how to hook into its own transformation pipeline.
- A plugin can hook into several different stages of the build process (transforming file contents, resolving import paths, injecting code) — the JSX plugin specifically hooks into the file-transformation stage, intercepting `.tsx`/`.jsx` files before Vite's own core ever sees their raw contents.
- Plugins are ordinary npm packages (installed via `npm install --save-dev @vitejs/plugin-react`, the same mechanism as any other dependency — see `npm-package-json.md`), not a special built-in category — anyone can author and publish one.
- Multiple plugins can be listed together in the same array, each adding its own independent capability, composed by Vite's own pipeline in the order they're listed.

## CS Lens

This is a **plugin architecture** — a design where a tool's core stays deliberately small and general, and specific, optional capabilities are added through a well-defined extension point rather than being built into the core itself. This tradeoff — a lean core plus opt-in extensions, versus one large tool supporting everything by default — recurs across many kinds of software: it keeps the common case fast and simple (a project using no exotic syntax pays no cost for JSX support it never asked for) while still allowing the uncommon case to be fully supported when genuinely needed.

Also recognized in: webpack's own loader/plugin system (an earlier, similarly-shaped build tool), Babel's plugin ecosystem (which `@vitejs/plugin-react` itself partly builds on, for its JSX transform), browser extensions, and any editor/IDE's own plugin marketplace — the same underlying shape: a small trusted core, extended by independently-developed, independently-installed modules.

## SE Lens

Every plugin added is a real, explicit dependency — reviewable in `package.json`, and a real, understood addition to what the build process does, rather than a hidden default behavior a developer might not realize was even active. This directly mirrors the same "only pay for what you use, and know exactly what you're paying for" instinct behind separate `@types/` packages (`typescript-types-only-package.md`) — capability is opt-in and visible, not implicit.

## Connection

Builds on `vite-dev-server-config.md` and `npm-package-json.md`. Directly enables `jsx-syntax.md` — without this plugin loaded, none of a project's JSX would compile at all.

## Try It Yourself

1. Remove `react()` from a working project's `plugins` array, restart the dev server, and observe the real error a `.tsx` file with JSX now produces — confirming the plugin, not Vite's core, was responsible for that capability.
2. Look up one other real Vite plugin unrelated to React (search "vite plugin" for any small, popular one, such as one that generates a PWA manifest) and read what specific pipeline stage it hooks into, according to its own documentation.
3. Add a second plugin alongside `react()` in the `plugins` array and confirm both capabilities work simultaneously — reasoning about why plugin order can sometimes matter when two plugins both want to transform the same kind of file.
