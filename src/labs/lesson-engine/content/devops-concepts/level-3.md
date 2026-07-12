---
series: devops-concepts
level: 3
title: Containers and Docker
lang: javascript
---

# Containers and Docker

Every computer is different. Your MacBook runs macOS; the CI server runs Ubuntu 22.04; the production server runs Amazon Linux 2. Your project requires Node.js 20.11.0; a colleague installed 18.x; the production server has 16.x from an old project. Your code uses a library that behaves differently on macOS versus Linux.

Containers solve this by bundling the application, its runtime, and all its dependencies into a single portable artifact. The container runs identically on any machine that has a container runtime — the host OS is irrelevant. "Works on my machine" becomes "works in the container," and the container goes everywhere. By the end of this lesson you will understand what containers are, how Docker works, and how to write a Dockerfile for a Node.js application.

## What a container is

```text
THE CONTAINER MENTAL MODEL:

  VIRTUAL MACHINES (before containers):
    Full operating system per VM (kernel + userland).
    Starts in minutes. Takes gigabytes of disk. Slow to build and share.
    Useful for complete OS isolation (different kernels).

  CONTAINERS:
    Share the host machine's OS kernel.
    Contain only: the application, runtime (Node.js), and dependencies.
    Starts in seconds. Takes megabytes. Fast to build and share.
    Provides: process isolation, filesystem isolation, network isolation.
    Does NOT provide: kernel-level isolation (all containers share the host kernel).

ANALOGY:
  A VM is like renting an entire house — you have your own plumbing, electricity, walls.
  A container is like renting a room in a shared house — you have your own space,
  but you share the building's infrastructure (the kernel).

  Both isolate your "stuff" from your neighbours.
  The container is cheaper, faster, and lighter — the right tool for most applications.
```

## The Dockerfile

A Dockerfile is a text file that describes how to build a container image — a snapshot of a filesystem and its metadata (what command to run, what ports to expose, what user to use).

```dockerfile
# Dockerfile for a Node.js API server

# Base image: an official Docker image with Node.js 20 on Alpine Linux (tiny — ~5 MB)
FROM node:20-alpine

# Set the working directory inside the container:
WORKDIR /app

# Copy dependency files FIRST (for Docker's layer cache):
# If package.json hasn't changed, Docker reuses the cached npm ci layer.
COPY package.json package-lock.json ./

# Install dependencies:
RUN npm ci --omit=dev     # --omit=dev skips devDependencies (smaller image)

# Copy the rest of the source code:
COPY . .

# Build the application (if using TypeScript):
RUN npm run build

# Document which port the app listens on (informational — does not publish it):
EXPOSE 3000

# The command to run when the container starts:
CMD ["node", "dist/server.js"]
```

```text
DOCKERFILE INSTRUCTIONS:
  FROM:     Base image. The starting point. Everything builds on top of this.
  WORKDIR:  Set the working directory for all subsequent commands.
  COPY:     Copy files from the host into the image.
  RUN:      Execute a shell command during the BUILD step (installs packages, compiles, etc.).
  EXPOSE:   Document which port the application listens on.
  CMD:      The default command to run when a container starts from this image.
            Only one CMD per Dockerfile (the last one wins).
  ENV:      Set environment variables in the image.
  ARG:      Build-time arguments (not available at runtime, unlike ENV).
```

## Building and running a container

```text
DOCKER COMMANDS:

  Build an image from the Dockerfile in the current directory:
    docker build -t my-app:1.0 .
      -t my-app:1.0      name:tag for the image

  List images:
    docker images

  Run a container from an image:
    docker run -p 3000:3000 my-app:1.0
      -p 3000:3000       map host port 3000 → container port 3000
      (without -p, the container's port is unreachable from the host)

  Run with environment variables:
    docker run -p 3000:3000 -e DATABASE_URL=postgres://... my-app:1.0

  Run in the background (detached):
    docker run -d -p 3000:3000 my-app:1.0

  List running containers:
    docker ps

  Stop a container:
    docker stop <container-id>

  View logs:
    docker logs <container-id>
    docker logs -f <container-id>   ← follow (like tail -f)

  Open a shell inside a running container:
    docker exec -it <container-id> sh
```

**CS lens:** A container image is a **content-addressed, layered filesystem**. Each instruction in the Dockerfile creates a new layer — a set of filesystem changes on top of the previous layer. Docker caches each layer by its content hash. If the instruction and its inputs have not changed, Docker reuses the cached layer. This is why `COPY package.json ...` and `RUN npm ci` come before `COPY . .`: if source code changes but `package.json` does not, the `npm ci` layer is reused from cache, and only the source copy layer runs fresh. This cache strategy makes builds fast.

## Why containers matter for DevOps

```text
CONTAINERS IN THE DEVOPS PIPELINE:

  Developer's laptop:
    docker build -t my-app:1.0 .
    docker run -p 3000:3000 my-app:1.0
    → exactly the same environment as production

  CI pipeline:
    docker build -t my-app:$GITHUB_SHA .   ← tag with git commit hash
    docker push my-registry/my-app:$GITHUB_SHA
    → image is pushed to a registry (Docker Hub, AWS ECR, GitHub Container Registry)

  Production deployment:
    docker pull my-registry/my-app:$GITHUB_SHA
    docker run -d -p 80:3000 my-registry/my-app:$GITHUB_SHA
    → exact same image that was built and tested in CI

THE GUARANTEE:
  The same container image that passed CI is deployed to production.
  No difference between test environment and production environment.
  "Works in CI" == "works in production" (for environment reasons, at least).
```

**SE lens:** Container images are **immutable artifacts**. Once built and pushed to a registry, the image at a given tag does not change. This immutability is what makes rollbacks reliable: if the new version breaks production, you deploy the previous container image. You are not redeploying code — you are deploying a known, tested, previous artifact. This is the same principle as treating deployed software as versioned, immutable releases rather than as a mutable state that gets updated in place.

**Common mistakes:**
- Copying `.env` into the container — environment variables for secrets should be injected at runtime (`docker run -e SECRET=...`), not baked into the image (which would leak secrets to anyone who has the image). Add `.env` to `.dockerignore`.
- Running as root inside the container — by default, Docker containers run as root. If the container is compromised, the attacker has root access. Add a non-root user: `USER node` at the end of the Dockerfile (the official `node` image pre-creates a `node` user).
- Not using `.dockerignore` — without it, `COPY . .` copies `node_modules`, `.git`, `.env`, and everything else into the image. Create `.dockerignore` with `node_modules`, `.env`, `.git`, `dist` (it will be built fresh).

**Debug tip:** When a container fails to start, check the logs first: `docker logs <container-id>`. The most common causes: the `CMD` command references a file that was not built or copied (check your build step), a required environment variable is not set (`process.env.DATABASE_URL` is undefined), or a port conflict on the host (`-p 3000:3000` fails if the host port is already in use — change the host port: `-p 3001:3000`).

## Challenge: dockerfile_analysis

Reason about Dockerfile construction and container behaviour.

```challenge
function analyseDockerfile(scenario) {
  // scenario: a string describing a Dockerfile or Docker situation
  // Returns: an object with your analysis

  if (scenario === 'layer-cache') {
    // A Dockerfile has these steps:
    //   FROM node:20-alpine
    //   COPY . .
    //   RUN npm ci
    //   CMD ["node", "server.js"]
    //
    // The developer changes server.js and rebuilds.
    // Does 'npm ci' run again, or does Docker use its cache?
    return {
      npmCiRunsAgain: false,  // true or false
      reason: '',             // one sentence explaining why
    }
  }

  if (scenario === 'optimised-layer-cache') {
    // The Dockerfile is changed to:
    //   FROM node:20-alpine
    //   COPY package.json package-lock.json ./
    //   RUN npm ci
    //   COPY . .
    //   CMD ["node", "server.js"]
    //
    // The developer changes server.js and rebuilds.
    // Does 'npm ci' run again, or does Docker use its cache?
    return {
      npmCiRunsAgain: false,  // true or false
      reason: '',             // one sentence explaining why
    }
  }

  if (scenario === 'port-mapping') {
    // The app listens on port 3000 inside the container.
    // The command is: docker run -p 8080:3000 my-app
    // What URL do you visit in your browser to reach the app?
    return {
      url: '',   // 'http://localhost:8080' or 'http://localhost:3000'
    }
  }
}
```

```test
const cache = analyseDockerfile('layer-cache')
assert cache.npmCiRunsAgain === true
assert cache.reason.length > 20

const opt = analyseDockerfile('optimised-layer-cache')
assert opt.npmCiRunsAgain === false
assert opt.reason.length > 20

const port = analyseDockerfile('port-mapping')
assert port.url === 'http://localhost:8080'
```
