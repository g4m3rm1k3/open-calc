# Concept: `package.json`

**What you'll understand by the end:** what a Node/npm project's manifest file controls, and what its most common fields actually mean.

**Prerequisites:** `python-import-statement.md` (for contrast — the ecosystem-equivalent concept), `dependency-graph-resolution.md`.

## Setup

Node.js and `npm` installed. No project needed beyond a folder to experiment in.

## The Problem

An npm-based project needs one canonical place declaring what the project is, what it depends on, and what commands are available to run against it — a role every JavaScript/Node project shares in common, read by `npm` itself and by many other tools built on top of it.

## The Isolated Example

```json
{
  "name": "demo-project",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build"
  },
  "devDependencies": {
    "typescript": "~6.0.2",
    "vite": "^8.1.1"
  }
}
```

Running one of the declared scripts:
```
npm run dev
```

**What this proves:** `npm run dev` works specifically because `"dev": "vite"` exists under `"scripts"` — `npm` looked up the name `"dev"` in this exact file and ran the command it maps to. Running `npm run nonexistent` (a name not declared here) fails with a real, specific error rather than doing anything — proof `scripts` is a real, closed registry `npm` consults, not an open convention.

## Mechanical Walkthrough

- `"name"`/`"version"` identify the package — required fields even for a private application never meant to be published.
- `"private": true` tells `npm` to refuse to publish this project to the public npm registry, even by accident — a real safeguard for an application (as opposed to a library meant for others to install).
- `"type": "module"` tells Node.js to treat this project's `.js` files as ECMAScript modules (`import`/`export` syntax) rather than Node's older `require`/`module.exports` system.
- `"scripts"` is a dict of named shortcuts, each mapping a name to a real shell command — `npm run <name>` looks the name up and runs the associated command.
- `"devDependencies"` lists packages needed to build or test the project, but not needed by the shipped, running application itself — contrasted with `"dependencies"` (not shown here), which lists packages the running application actually needs at runtime.

## CS Lens

This is a **manifest file** — a single, canonical, machine-readable description of a project's identity, dependencies, and entry points, read by tooling rather than a human running each step manually. Centralizing this information in one file is what lets any tool (an editor, a CI system, another developer's `npm install`) understand the project's shape without executing any of its code first.

Also recognized in: Python's `pyproject.toml` (increasingly replacing `requirements.txt`/`setup.py` for this exact role), Rust's `Cargo.toml`, Ruby's `Gemfile` — every major language ecosystem has converged on some form of this same manifest-file pattern.

## SE Lens

Separating `"dependencies"` from `"devDependencies"` matters concretely once a project is actually deployed: a production install (`npm install --production`, or an equivalent flag) skips `devDependencies` entirely, since a running application never needs a compiler or test runner — only whatever it actually imports at runtime. Getting this split wrong (putting a runtime-needed package under `devDependencies`) produces a project that works perfectly during development and breaks specifically in production, a real, common, and confusing class of deployment bug this split exists to prevent.

## Connection

Directly produced by `npm-project-scaffolding.md`'s generation step. The `"devDependencies"`/`"dependencies"` split is the direct ecosystem counterpart to `dependency-graph-resolution.md`'s pinning discussion — same underlying need (recording exactly what's needed), different ecosystem's manifest format.

## Try It Yourself

1. Add a new script, `"hello": "echo hello from npm"`, and run `npm run hello` — confirm a script doesn't need to invoke a JavaScript tool at all; it's just a named shell command.
2. Move `typescript` from `devDependencies` to `dependencies` (or vice versa) and reason about whether that's actually the more correct place for it in this project's case, given what `SE Lens` above explains about the split's real purpose.
3. Delete `node_modules/` entirely, then run `npm install` with no other changes. Confirm it recreates `node_modules/` correctly from `package.json` (and, if present, `package-lock.json`) alone — proof the manifest is the real source of truth, and `node_modules/` is disposable, reproducible output.
