---
series: devops-concepts
level: 0
title: What DevOps Is
lang: javascript
---

# What DevOps Is

A programmer who only knows how to write code is like a chef who only knows how to cook but has never seen a kitchen, a supplier, or a customer. DevOps is the discipline that connects writing code to running code — the entire pipeline from your local machine to a production server that real users hit.

DevOps is not a job title, a toolset, or a department. It is a set of practices that close the gap between software development (Dev) and software operations (Ops). The core insight: the people who write code and the people who run it should work as one team, sharing responsibility for the software's behaviour in production. By the end of this series you will understand how code gets from your laptop to a server, why CI/CD pipelines exist, what containers are and why they matter, how environment variables keep secrets out of code, and what deployment means in practice.

## What "running code" means

When you run `node server.js` on your laptop, you are a developer. When that same code runs on a server, processes requests from users, and must not go down at 3 AM — that is operations. DevOps merges these two worlds.

```text
THE JOURNEY OF A LINE OF CODE:

  You write:
    git commit -m "add search feature"
    git push

  Automated pipeline runs:
    → build: npm install && tsc (compile TypeScript, bundle JS)
    → test:  npm test (unit tests, integration tests)
    → lint:  eslint . (catch common mistakes)
    → If all pass: the code is eligible for deployment

  Deployment:
    → Code is packaged (as a container image, a zip file, a binary, etc.)
    → Package is pushed to a server (EC2, Heroku, Fly.io, Render, etc.)
    → Server process restarts with the new version
    → Real users now run your code

  Monitoring:
    → Server logs requests, errors, and performance
    → Alerts fire if error rates spike
    → On-call engineer investigates and fixes
```

**CS lens:** The journey from source code to running process is a **compilation and deployment pipeline** — a directed acyclic graph (DAG) of transformations. Each step (lint → test → build → package → deploy) takes its input from the previous step's output and produces a new artifact. This is the same pattern as a compiler's multi-pass architecture: parsing → type-checking → optimisation → code generation. The difference is that a DevOps pipeline's final artifact is not a binary but a running process in a known environment.

## The problem DevOps solves

Before DevOps was formalised, the typical workflow looked like this:

```text
BEFORE DEVOPS (the "wall of confusion"):

  Developer:  "It works on my machine."
              Zips up the code, throws it over to Ops.

  Operations: "It crashed on the server."
              Sends it back.

  Developer:  "But it works on MY machine..."

WHY DOES THIS HAPPEN?
  The developer's laptop and the production server are DIFFERENT environments:
  → Different operating systems (macOS vs Ubuntu Linux)
  → Different versions of Node.js (18.x vs 20.x)
  → Different installed packages (global npm packages on one, not the other)
  → Different environment variables (DATABASE_URL is set on one, not the other)
  → Different file paths, available ports, network configuration

DevOps practices fix this by:
  → Defining the environment precisely (containers, lock files, .nvmrc)
  → Automating the deployment (CI/CD pipelines — no manual steps)
  → Making the production environment observable (logs, metrics, alerts)
  → Treating infrastructure as code (reproducible, reviewable, versioned)
```

## The four core DevOps practices

```text
1. VERSION CONTROL
   All code (and ideally, all infrastructure configuration) lives in Git.
   Every change is reviewed, logged, and reversible.
   No change goes to production without going through Git.

2. CONTINUOUS INTEGRATION (CI)
   Every push to the repository automatically runs tests and checks.
   If tests fail, the build is "red" — no deployment until it is green.
   Goal: catch bugs in the integration step (when code merges), not in production.

3. CONTINUOUS DELIVERY / DEPLOYMENT (CD)
   Once CI passes, code is automatically packaged and made ready to deploy.
   Continuous Delivery:   the pipeline can deploy at any time (with a human click).
   Continuous Deployment: the pipeline deploys automatically on every green build.

4. MONITORING AND OBSERVABILITY
   Running code must be observed: logs, metrics, health checks, error tracking.
   If a deployment breaks production, monitoring detects it; alerts fire; engineers respond.
   Without monitoring, broken production code is invisible until a user complains.
```

**SE lens:** These four practices form a **feedback loop**. Version control captures intent. CI amplifies confidence. CD delivers value. Monitoring closes the loop — it tells you whether what you delivered actually works. A team with a fast, reliable feedback loop ships confidently and recovers from mistakes quickly. A team without one ships fearfully and discovers mistakes from customer support tickets.

## What a typical project structure looks like

```text
PROJECT FILES WITH DEVOPS IN MIND:

  my-app/
  ├── src/                    ← application code
  ├── tests/                  ← automated tests
  ├── package.json            ← dependencies (the lock file pins exact versions)
  ├── package-lock.json       ← exact dependency tree (reproducible installs)
  ├── .nvmrc                  ← pinned Node.js version ("20.11.0")
  ├── .env.example            ← template showing WHAT env vars are needed (no values)
  ├── .env                    ← actual env vars with values (NOT committed to Git — in .gitignore)
  ├── Dockerfile              ← describes the container image (pinned OS + runtime)
  ├── .github/
  │   └── workflows/
  │       └── ci.yml          ← GitHub Actions: the CI/CD pipeline
  └── README.md               ← how to run the project locally

Key principle: the repository contains EVERYTHING needed to reproduce the build.
  If a new developer clones the repo and follows the README, it should just work.
  This means: pinned dependencies, documented setup steps, no "you also need to install X globally."
```

**Common mistakes:**
- Committing `.env` files to Git — this leaks secrets (API keys, database passwords) to anyone with repository access. Add `.env` to `.gitignore` immediately; it can never be removed from Git history without a full scrub.
- Not pinning dependency versions — `npm install lodash` without a version constraint means different developers (and the CI server) may get different versions. Use `package-lock.json` and commit it.
- Not having automated tests — without tests, CI cannot verify correctness. A pipeline that only runs `npm install` and `npm build` gives false confidence: the build may succeed while the logic is broken.

**Debug tip:** When something works locally but fails on the CI server or in production, the cause is almost always an environment difference: different Node.js version, missing environment variable, different installed dependencies, or different OS behaviour. Compare the environments systematically: node version → npm version → installed packages → environment variables. The `.nvmrc` file, `package-lock.json`, and environment variable documentation exist precisely to eliminate these differences.

## Challenge: devops_concepts

Reason about the DevOps pipeline and its purpose.

```challenge
const devopsConcepts = {
  // What is the difference between Continuous Delivery and Continuous Deployment?
  // Answer in one sentence.
  cdDifference: '',

  // You push code and CI fails because a test is broken.
  // Should you still deploy? Why not?
  whyNotDeployOnRedCI: '',

  // A secret API key is needed in production. Where should it be stored?
  // Options: 'in the source code', 'in an environment variable', 'in a config file committed to git'
  secretStorage: '',

  // What file ensures every developer installs the exact same package versions?
  lockFile: '',

  // Name one thing that monitoring/observability provides that CI/CD does not.
  monitoringProvides: '',
}
```

```test
const d = devopsConcepts
assert d.cdDifference.length > 20
assert d.whyNotDeployOnRedCI.length > 20
assert d.secretStorage === 'in an environment variable'
assert d.lockFile === 'package-lock.json' || d.lockFile === 'yarn.lock' || d.lockFile === 'lock file'
assert d.monitoringProvides.length > 15
```
