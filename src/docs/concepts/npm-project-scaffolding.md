# Concept: Project Scaffolding Tools

**What you'll understand by the end:** what a scaffolding tool actually does when it generates a new project, and why starting from generated files is different from writing every config file by hand.

**Prerequisites:** none.

## Setup

Node.js and `npm` installed (verify with `node --version` and `npm --version`).

## The Problem

Setting up a new project with a build tool from scratch means creating several interlocking config files by hand — a package manifest, a compiler config, an entry HTML file — each with fields that have to agree with each other and with the tool's own expectations. Getting all of that right by reading documentation, before writing a single line of real application code, is real, repetitive, error-prone work most projects share in common.

## The Isolated Example

```
npm create vite@latest demo-project -- --template vanilla-ts
```

**Real output:**
```
Scaffolding project in .../demo-project...
Done. Now run:
  cd demo-project
  npm install
  npm run dev
```

**What this proves:** one command produced a complete, working starting structure — a real `package.json`, `tsconfig.json`, `index.html`, and a `src/` folder with demo content — without anyone hand-writing any of those files' contents. Running the three suggested follow-up commands would install dependencies and start a real, working dev server immediately, with zero manual configuration.

## Mechanical Walkthrough

- `npm create <name>` is npm's convention for running a scaffolding tool published as `create-<name>` without permanently installing it — `npm create vite` runs `create-vite`, fetching its latest version and executing it once.
- `demo-project` is the folder name the new project gets created in.
- Everything after the bare `--` is passed through to the scaffolding tool itself, not consumed by `npm` — `--template vanilla-ts` tells `create-vite` specifically which starting template to generate (plain TypeScript, no framework, in this case).
- The tool writes real files to disk — nothing about the generated project is special or virtual; every file it created can be opened, read, and edited exactly like a hand-written one.

## CS Lens

A scaffolding tool is a **code generator** producing a known-good starting arrangement of files and their cross-references, based on a template — the same general idea as any template-based generation (a project template in an IDE, a `cookiecutter` template, a framework's own `new` command).

Also recognized in: `django-admin startproject`, `cargo new`, `create-react-app` (Vite's own predecessor for React specifically) — nearly every modern language/framework ecosystem provides some form of this exact tool, because the "several interlocking config files that need to agree" problem recurs everywhere.

## SE Lens

Generated files are still real files a project owns and can edit — nothing about them is magic or permanently tool-managed after generation. The real, honest cost of scaffolding: every generated file represents a decision (a default port, a default folder layout, a default set of compiler options) that a developer didn't make explicitly, and inheriting a decision without understanding it is a real risk the moment that default matters later. Treating every generated file as worth reading and understanding — not just trusting because a tool produced it — is what keeps a scaffolded project actually understood by whoever maintains it, rather than being a black box that happened to work on day one.

## Connection

Directly produces the files `npm-package-json.md` and `typescript-tsconfig.md` each explain in detail — this concept is about the *act* of generating them; those two are about what's actually inside what gets generated.

## Try It Yourself

1. Run the same scaffolding command with a different template (`--template vanilla` — plain JavaScript, no TypeScript) and diff the generated `package.json`/folder structure against the TypeScript version — confirm exactly what changes between templates.
2. Delete the generated demo content (`src/`'s starter files) and replace it with the smallest possible real file that still runs (a single `console.log` in `main.ts`). Confirm `npm run dev` still works — proof the demo content was never load-bearing, just a placeholder.
3. Read through every field in the generated `package.json` and `tsconfig.json` — even ones not covered by name in this project's own lessons — and look up any that seem unfamiliar, to build the habit of never treating a generated file as unreadable.
