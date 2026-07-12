---
series: devops-concepts
level: 2
title: CI/CD — Automating the Pipeline
lang: javascript
---

# CI/CD — Automating the Pipeline

Before continuous integration existed, teams integrated code infrequently — sometimes only once every few weeks. Each integration was a painful event: merging code that had diverged for weeks, resolving hundreds of conflicts, discovering that things that worked separately did not work together. The longer you waited to integrate, the worse the integration became.

CI/CD inverts this: integrate constantly (every push), test automatically, and deliver quickly. The result is a system where bugs are caught at the moment they are introduced, not weeks later when the context is gone and the fix is expensive. By the end of this lesson you will understand what CI/CD pipelines do, how to write a basic GitHub Actions workflow, and what makes a pipeline trustworthy.

## What CI/CD is

```text
CONTINUOUS INTEGRATION (CI):
  Every time code is pushed to the repository, a pipeline runs automatically:
    1. Check out the code
    2. Install dependencies
    3. Run linters and type checkers
    4. Run tests
    5. Build the application
  If any step fails, the pipeline is "red" — the build is broken.
  The team's first priority is to fix a broken build (it blocks everyone else).

CONTINUOUS DELIVERY (CD):
  After CI passes, the build artifact (container image, zip, binary) is:
    1. Packaged automatically
    2. Pushed to a staging environment (for final human verification)
    3. Made available to deploy to production with a single click

CONTINUOUS DEPLOYMENT:
  Same as Continuous Delivery but the production deployment is also automated.
  Every green build goes to production automatically.
  Requires very high confidence in the test suite.
```

## A GitHub Actions workflow

GitHub Actions is the most common CI/CD platform for open-source and many commercial projects. A workflow is a YAML file that lives in `.github/workflows/`.

```yaml
# .github/workflows/ci.yml

name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  build-and-test:
    runs-on: ubuntu-latest          # the OS the pipeline runs on

    steps:
      - name: Check out code
        uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'              # cache node_modules between runs (faster)

      - name: Install dependencies
        run: npm ci                 # ci installs exactly what's in the lock file

      - name: Run linter
        run: npm run lint

      - name: Run type check
        run: npm run typecheck      # tsc --noEmit

      - name: Run tests
        run: npm test

      - name: Build
        run: npm run build
```

```text
KEY GITHUB ACTIONS CONCEPTS:

  on:           When to run the workflow. 'push' and 'pull_request' are most common.
  jobs:         Independent units of work. Each job runs on its own VM.
  steps:        Sequential tasks within a job. Each step is either a shell command
                (run:) or a pre-built action (uses:).
  uses:         A reusable action from the GitHub Actions marketplace or a local file.
  runs-on:      The operating system. 'ubuntu-latest' is the default (cheapest/fastest).
  env:          Environment variables for the job or step.
    env:
      DATABASE_URL: ${{ secrets.DATABASE_URL }}
  secrets:      Encrypted values stored in GitHub repository settings.
                Accessed as ${{ secrets.SECRET_NAME }} in workflows.
```

**CS lens:** A CI pipeline is a **directed acyclic graph** (DAG) of computational steps. Each step depends on the output of previous steps. If any step fails, the subsequent steps do not run (short-circuit evaluation). GitHub Actions parallelises independent jobs — if you have a `lint` job and a `test` job with no dependency between them, they run simultaneously on separate VMs. This is pipeline parallelism: the same principle used in CPU instruction pipelines and data stream processing.

## What `npm ci` vs `npm install` means

```javascript
// npm install:
//   Resolves dependencies freshly. May update package-lock.json.
//   Good for: initial setup on developer machines, adding packages.

// npm ci:
//   Installs EXACTLY what is in package-lock.json. Never updates the lock file.
//   Deletes node_modules first, then installs from scratch.
//   Fails if package.json and package-lock.json are out of sync.
//   Good for: CI pipelines (reproducible, no surprises).

// WHY THIS MATTERS:
//   If you use 'npm install' in CI, the lock file may be silently ignored and
//   you could get a different version of a dependency than what's on your machine.
//   'npm ci' guarantees the exact same dependency tree as the lock file specifies.
```

## Adding secrets to the pipeline

The pipeline often needs secrets (database URL for running integration tests, deployment credentials). These are set in the repository's settings and accessed via `secrets`.

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    env:
      DATABASE_URL: ${{ secrets.TEST_DATABASE_URL }}   # set in repo Settings → Secrets
      NODE_ENV: test

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm' }
      - run: npm ci
      - run: npm test
```

```text
SECRETS IN GITHUB ACTIONS:
  Set at: repository Settings → Secrets and Variables → Actions → New repository secret
  Access in workflow: ${{ secrets.SECRET_NAME }}
  GitHub masks secret values in log output (replaces with ***).
  Never echo secrets in run: commands — they appear in logs before masking.
```

**SE lens:** The key discipline CI enforces is that the **main branch must always be deployable**. A red main branch means every developer on the team is affected — they cannot merge, they cannot deploy, and they inherit the broken state. This constraint creates a social contract: fix broken builds immediately, before anything else. Teams that let a red build sit for days lose the trust in CI that makes it valuable. A green main branch is a shared asset; a red one is a shared liability.

**Common mistakes:**
- Not using `npm ci` in the pipeline — `npm install` may silently install a different version of a package. Use `npm ci` for reproducible builds.
- Checking secrets into the workflow file — `DATABASE_URL: postgres://user:password@host/db` in the YAML file is committed to Git. Use `${{ secrets.DATABASE_URL }}` instead.
- Making the pipeline too slow — a CI pipeline that takes 20 minutes will be bypassed. Keep the fast feedback loop (lint, type check, unit tests) under 5 minutes. Run slower integration tests separately or in parallel.

**Debug tip:** When a CI pipeline fails with "module not found" or "command not found" but the code works locally, the most common cause is a dependency that is installed globally on your machine but not in the CI environment. Check `package.json` — everything the pipeline needs must be in `dependencies` or `devDependencies`. Run `npm ci` locally (it deletes `node_modules` first) to simulate the CI environment.

## Challenge: pipeline_config

Write the configuration for a minimal but complete CI pipeline.

```challenge
function describePipeline(projectType) {
  // projectType: 'node-api' or 'react-app'
  //
  // Returns an object describing the pipeline steps in order:
  // {
  //   trigger: string[],        // list of git events that trigger this pipeline
  //   steps: string[],          // ordered list of step names
  //   secretsNeeded: string[],  // environment variables that should come from secrets
  //   nodeVersion: string,      // which Node.js version to use
  // }
  //
  // For 'node-api': needs DATABASE_URL secret, steps include lint+typecheck+test+build
  // For 'react-app': no secrets needed, steps include lint+typecheck+test+build
  // Both should trigger on push to main and on pull_request
  // Both should use Node 20
}
```

```test
const api = describePipeline('node-api')
assert api.trigger.includes('push')
assert api.trigger.includes('pull_request')
assert api.steps.includes('lint') || api.steps.some(s => s.includes('lint'))
assert api.steps.includes('test') || api.steps.some(s => s.includes('test'))
assert api.steps.includes('build') || api.steps.some(s => s.includes('build'))
assert api.secretsNeeded.includes('DATABASE_URL')
assert api.nodeVersion === '20'

const app = describePipeline('react-app')
assert app.secretsNeeded.length === 0
assert app.nodeVersion === '20'
assert app.steps.some(s => s.includes('test') || s.includes('build'))
```
