# Lesson 33 — Docker Language Images

## What You Will Build

Each language executor in the Docker tier uses a pre-built, minimal Docker image tagged
by language and version — `codex/python:3.12`, `codex/go:1.22`, `codex/rust:1.78`. A
`Makefile` builds and tags all images. Container startup time drops from several seconds
(downloading a base image) to under 500ms (pulling a cached local image). Go and Rust
blocks now run in every environment including the web shell.

---

## What You Need to Know First

- Lesson 18: Docker execution sandbox, `docker run`, temp files, the `RemoteExecutor`
- Lesson 25: C compilation in two steps — multi-stage Docker builds follow the same logic
- Lesson 7: runtime detection — the Docker executor checks if `docker` is available

---

## The Lesson

### Step 1 — Why Pre-Built Images Matter

In Lesson 18, the Docker executor runs:
```bash
docker run --rm python:3.12 python3 /code/main.py
```

This works, but it has a performance problem: `python:3.12` is the official Docker Hub
image for Python. On first use, Docker downloads it — approximately 350MB. On subsequent
runs, Docker uses the cached layer. For a learning environment:

- The *first* time a student clicks Run on a Python block, they wait while 350MB downloads.
- This is unacceptable for any latency-sensitive UX.

**The solution: pre-built minimal images.**
Instead of `python:3.12` (the full Python image), we build `codex/python:3.12` — a
minimal image that contains only the Python interpreter and no other tooling. The image
is ~50MB instead of 350MB. It is built once (at deploy time or at `make build` time) and
cached locally. Docker pulls from the local cache, not from Docker Hub, on every run.

**CS lens:** This is **precomputation** — do expensive work once, cache the result, reuse
the cache on every subsequent request. The build time cost is paid once by the developer;
the runtime cost is paid zero times by the student.

### Step 2 — Multi-Stage Dockerfiles

A **multi-stage Dockerfile** has multiple `FROM` statements. Each stage produces an
intermediate image; only the last stage produces the final image. Earlier stages are
discarded after the build.

**Why multi-stage for Rust:**
The Rust compiler (`rustc`) + `cargo` + standard library is ~600MB. The compiled Rust
binary is a few kilobytes. A multi-stage Dockerfile compiles the runtime in the first
stage (with the full toolchain) and copies only the compiled binary to the final stage
(with no toolchain).

```dockerfile
# codex/images/rust/Dockerfile

# Build stage: has the full Rust toolchain
FROM rust:1.78-slim AS builder

# Install any system dependencies for compilation
RUN apt-get update && apt-get install -y gcc && rm -rf /var/lib/apt/lists/*

# Production stage: has only what's needed to RUN code
FROM debian:bookworm-slim AS runtime

# Copy the Rust runtime (libstd) but not the toolchain
RUN apt-get update && apt-get install -y libgcc-s1 && rm -rf /var/lib/apt/lists/*

# The Rust binary will be compiled at execution time and mounted in
# We need rustc to be available, so keep it but strip it
COPY --from=builder /usr/local/cargo/bin/rustc /usr/local/bin/rustc
COPY --from=builder /usr/local/rustup /usr/local/rustup

ENV RUSTUP_HOME=/usr/local/rustup
ENV PATH="/usr/local/cargo/bin:${PATH}"

WORKDIR /code
```

For simpler languages, multi-stage is not needed:

```dockerfile
# codex/images/python/Dockerfile
FROM python:3.12-slim

# Remove documentation, tests, and pip cache to minimise size
RUN pip install --no-cache-dir pip && \
    find / -name "*.pyc" -delete && \
    find / -name "__pycache__" -type d -exec rm -rf {} + 2>/dev/null; exit 0

WORKDIR /code
```

```dockerfile
# codex/images/go/Dockerfile
FROM golang:1.22-alpine

WORKDIR /code
```

**`-slim` and `-alpine` tags explained:**
- `python:3.12-slim` uses Debian with minimal packages — no documentation, no build tools.
  Smaller than the default `python:3.12` but still Debian.
- `golang:1.22-alpine` uses Alpine Linux — a security-focused Linux with musl libc instead
  of glibc. ~5MB base image instead of ~100MB.

### Step 3 — The Image Registry

In `packages/executor/src/RemoteExecutor.ts`, maintain a mapping from language to image:

```typescript
const DOCKER_IMAGES: Record<string, string> = {
  python:     'codex/python:3.12',
  py:         'codex/python:3.12',
  go:         'codex/go:1.22',
  rust:       'codex/rust:1.78',
  rs:         'codex/rust:1.78',
  c:          'codex/c:latest',
  javascript: 'codex/node:20',
  js:         'codex/node:20',
  lua:        'codex/lua:5.4',
  ruby:       'codex/ruby:3.3',
}
```

Update the `docker run` command in the executor to use this registry:

```typescript
const image = DOCKER_IMAGES[language]
if (image === undefined) {
  return {
    stdout: [],
    stderr: [`No Docker image for language: ${language}`],
    exitCode: 1,
    durationMs: 0,
  }
}

const result = await runProcess('docker', [
  'run',
  '--rm',
  '--network', 'none',
  '--memory', '64m',
  '--cpus', '0.5',
  '--read-only',
  '-v', `${tempFile}:/code/main.${ext}:ro`,
  image,
  ...getRunCommand(language, '/code/main'),
], timeoutMs)
```

`getRunCommand` returns the command to run inside the container:

```typescript
function getRunCommand(language: string, filePath: string): string[] {
  switch (language) {
    case 'python': case 'py':   return ['python3', `${filePath}.py`]
    case 'go':                  return ['go', 'run', `${filePath}.go`]
    case 'rust': case 'rs':     return ['sh', '-c', `rustc ${filePath}.rs -o /tmp/out && /tmp/out`]
    case 'c':                   return ['sh', '-c', `gcc ${filePath}.c -o /tmp/out && /tmp/out`]
    case 'javascript': case 'js': return ['node', `${filePath}.js`]
    default:                    return ['sh', '-c', `echo "unknown language"`]
  }
}
```

For Rust and C, we run a shell command (`sh -c`) that compiles and executes in one step.

### Step 4 — The Makefile

A `Makefile` in the project root builds and tags all images:

```makefile
# Makefile (project root)

IMAGES := python go rust c node lua ruby

.PHONY: build-images push-images

build-images:
	@for lang in $(IMAGES); do \
	  echo "Building codex/$$lang…"; \
	  docker build -t codex/$$lang:latest codex/images/$$lang; \
	done
	@echo "All images built."

push-images:
	@for lang in $(IMAGES); do \
	  docker push codex/$$lang:latest; \
	done

clean-images:
	@for lang in $(IMAGES); do \
	  docker rmi codex/$$lang:latest 2>/dev/null || true; \
	done
```

**Why a Makefile?**
Makefiles are universally available on macOS and Linux and on Windows via Git Bash or WSL.
They are language-agnostic — you do not need to know Python to read `make build-images`.
They handle incremental builds (Make only rebuilds targets whose dependencies have changed).
For a list of shell commands, a Makefile is more maintainable than a shell script or an npm
script with a long `&&`-chained command.

**Pinning versions:**
`codex/python:3.12` specifies the Python version. If the Dockerfile uses `FROM python:3.12-slim`,
the image always uses Python 3.12 regardless of what Docker Hub updates. This is reproducibility:
the same `make build-images` run tomorrow produces the same image as today.

### Step 5 — Checking Docker Availability

The Docker executor only runs if Docker is installed and the Docker daemon is running.
Add a probe to the runtime detection (Lesson 7):

```typescript
// In packages/executor/src/runtimeDetection.ts
docker: await probeRuntime('docker', ['info'])
```

`docker info` returns 0 only if the Docker daemon is running and responsive (not just if
`docker` is installed). This is a more reliable check than `docker --version`.

Add `docker` to the status bar:
```
● python  ● node  ● go  ● docker
```

---

## Connect the Pieces

Pre-built images complete the Docker execution tier. Go and Rust blocks — which have no
WASM fallback — now have a working Tier 3. The complete execution decision tree from the
BRD is implemented: Tier 1 (local) → Tier 2 (WASM) → Tier 3 (Docker) → Tier 4 (read-only).

The Makefile's `push-images` target pushes images to a Docker registry (Docker Hub or a
private registry). For a deployed web shell (Lesson 35), the images are pre-pulled on the
server. The execution API server runs `docker run` and the images are already cached.

Pre-built minimal images with pinned versions are the same technique used by every
production CI/CD pipeline. GitHub Actions uses pre-built runner images (ubuntu-22.04)
that are fully cached on GitHub's infrastructure — workflows start in seconds, not the
minutes it would take to install an OS from scratch. AWS CodeBuild and Google Cloud Build
work the same way. The Codex `codex/python:3.12` image is structurally identical to
these runner images: built once, pushed to a registry, pulled by any machine that needs
to run code in that environment. The Makefile's `make build-images` step is the same
as GitHub's nightly base image rebuild.

---

## What Breaks Without This

Without pre-built images, the first `docker run` for a given language downloads the base
image on-demand. This may take 30–120 seconds on a slow connection. The circuit breaker
(Lesson 19) may trip on the first request if the download causes the execution to exceed
the timeout. Pre-building eliminates this first-run penalty.

---

## Definition of Done

- [ ] `make build-images` completes without errors for Python, Go, and Rust
- [ ] A Go block runs via Docker (Tier 3) when `go` is not installed locally
- [ ] A Rust block runs via Docker (Tier 3) when `rustc` is not installed locally
- [ ] Container startup takes under 500ms after the images are built
- [ ] `docker` appears in the runtime status bar (green if daemon is running)
- [ ] You can answer: what is a multi-stage Dockerfile and why is it used for compiled languages?
- [ ] You can answer: what does `--read-only` do to a Docker container?
- [ ] `git commit` with a message explaining why
