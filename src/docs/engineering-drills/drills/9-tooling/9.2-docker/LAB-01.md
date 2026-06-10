# Drill 9.2 — Docker Internals: Containers Are Just Processes

**Standalone drill. Prerequisite: Docker installed.**
**Time estimate:** 75–90 minutes
**Environment:** Docker, Python 3.8+
**What you will build:** A Dockerfile for a FastAPI app, an optimized multi-stage build, a Docker Compose setup for a multi-container stack, and a demonstration of what a container actually IS at the Linux kernel level.
**What you will understand:** What namespaces and cgroups are, why containers are not VMs, how layers work, and why image size matters.

---

## Quick Check

Answer these before starting. Answers at the bottom.

1. A container runs Python 3.11 on a host running Python 3.8. The container has no VM. How? What Linux kernel feature makes this possible?

2. A Docker image has 5 layers. You change one file in layer 3. What happens when you rebuild? What is NOT rebuilt?

3. Your Docker image is 1.2GB. Your FastAPI app code is 50KB. Where does the other 1.199GB come from, and how would you reduce it?

4. `docker run -p 8080:5000` maps host port 8080 to container port 5000. Who can connect to the service: processes on the host, other containers in the same Compose network, or containers in a different network?

*(Answers at the bottom.)*

---

## The Concept: Linux Namespaces and cgroups

### Concept: Containers Are Isolated Processes

**What it is:**
A Docker container is a Linux process (or group of processes) isolated using two kernel features: **namespaces** (what the process can see) and **cgroups** (what resources it can use). There is no hypervisor, no separate kernel, no virtual hardware. The container shares the host kernel.

**Namespaces — what the process sees:**
| Namespace | Isolates |
|---|---|
| PID | Process tree — container only sees its own processes |
| NET | Network interfaces — container has its own network stack |
| MNT | Filesystem — container sees its own root filesystem |
| UTS | Hostname — container can have a different hostname |
| IPC | Inter-process communication |
| USER | User IDs — UID 0 (root) in container can map to unprivileged UID on host |

When a container starts, Docker creates these namespaces. The container process runs in all of them. From the container's perspective, it's the only thing running. From the host's perspective, it's just a process.

**cgroups — what the process can use:**
Control groups limit resource consumption: CPU time, memory, disk I/O, network bandwidth. `docker run --memory=512m` creates a cgroup that prevents the container from using more than 512MB RAM. Without this limit, a container can consume all host memory.

**The container filesystem:**
Docker uses union filesystems (OverlayFS) to stack read-only layers. Each layer is a diff (added/modified files). The container gets a writable layer on top. The image layers are shared between all containers running the same image — starting 100 containers from the same image doesn't create 100 copies of the base filesystem.

**What happens at `docker run`:**
1. Docker pulls the image layers (if not cached) — unpacked to `/var/lib/docker/overlay2/`
2. Creates a container: new PID, NET, MNT, UTS namespaces
3. Mounts the filesystem: lower layers (image) + upper layer (writable container layer)
4. Sets up cgroup limits (if specified)
5. Executes the entrypoint command inside the namespaces

**Image layers:**
Every Dockerfile instruction creates a new layer. Layers are cached by content hash. If `RUN pip install requirements.txt` is unchanged, Docker reuses the cached layer — no reinstall. If `COPY app/ /app/` changes one Python file, only that layer and subsequent layers rebuild.

**Constraints:**
- Containers share the host kernel — a kernel vulnerability affects all containers on that host
- OverlayFS writes: container writes go to the writable layer and are lost when the container is removed. Persistent data requires volumes.
- Windows containers use a different mechanism (Hyper-V isolation) — they're not the same as Linux containers

**Tradeoffs:**
- Containers vs VMs: containers are faster (no boot time, no hypervisor overhead), share the kernel (lower memory overhead per container). VMs have stronger isolation (separate kernel, different OS possible), but use much more memory and take minutes to start.
- Container vs virtualenv: virtualenv isolates Python packages. Containers isolate everything (OS, system libraries, processes, network). Use virtualenv for Python-only isolation; use containers for full application + dependency isolation.

**Failure modes:**
- Large images: `FROM ubuntu` → `RUN apt-get install python3` creates a 500MB base image. Use `FROM python:3.11-slim` (150MB) or `FROM python:3.11-alpine` (50MB).
- No .dockerignore: `COPY . /app` copies `.git/`, `node_modules/`, `venv/` into the image — inflating it.
- Secrets in images: `RUN curl -H "Authorization: $API_KEY"` embeds credentials in the layer (visible with `docker history --no-trunc`).
- Running as root: default container process runs as root — if the app has a vulnerability, the attacker has root in the container (and potentially on the host with misconfigured Docker).

**Operational reality:**
Docker is the standard for packaging applications. Kubernetes runs containers (via containerd, not Docker daemon directly). Most cloud services (AWS ECS, GCP Cloud Run, Azure Container Instances) run your container images. Understanding layers and build caching is essential for fast CI/CD pipelines — a badly ordered Dockerfile can slow every PR build by 5 minutes.

**You will see this again in:**
Every production deployment, Kubernetes pod specs, CI/CD pipelines, microservice packaging, serverless container platforms (Cloud Run, Lambda containers).

**Watch for:**
The order of Dockerfile instructions matters for caching. Put rarely-changed instructions first (base image, system packages) and frequently-changed instructions last (your app code). If `COPY . /app` is instruction 2, every code change invalidates every subsequent cache layer.

---

## Step 1 — Dockerfile for a FastAPI App

Create a FastAPI app first:

```
fastapi_app/
  app/
    main.py
    models.py
  requirements.txt
  Dockerfile
  .dockerignore
```

Create `fastapi_app/app/main.py`:

```python
from fastapi import FastAPI
from pydantic import BaseModel
import time

app = FastAPI(title="Docker Demo API")

class Item(BaseModel):
    name: str
    price: float

ITEMS = []

@app.get("/")
def root():
    return {"message": "FastAPI in Docker", "uptime": time.time()}

@app.get("/items")
def list_items():
    return {"items": ITEMS, "count": len(ITEMS)}

@app.post("/items")
def create_item(item: Item):
    ITEMS.append(item.model_dump())
    return {"created": item.model_dump(), "total": len(ITEMS)}

@app.get("/health")
def health():
    return {"status": "healthy"}
```

Create `fastapi_app/requirements.txt`:
```
fastapi==0.104.1
uvicorn==0.24.0
pydantic==2.5.0
```

Create `fastapi_app/.dockerignore`:
```
__pycache__
*.pyc
*.pyo
.git
.gitignore
.env
venv/
.venv/
*.egg-info
dist/
build/
.DS_Store
```

Create `fastapi_app/Dockerfile` — BAD version first to show the problem:

```dockerfile
# Dockerfile.bad — naive approach (don't use this)
FROM python:3.11

# Copy everything first (problem: any change rebuilds pip install)
COPY . /app
WORKDIR /app

# Install dependencies (cache-busted by ANY code change)
RUN pip install -r requirements.txt

EXPOSE 5000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "5000"]
```

Then the correct version `fastapi_app/Dockerfile`:

```dockerfile
# Dockerfile — optimized layer order
FROM python:3.11-slim

# 1. System-level dependencies (rarely change — cached layer)
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# 2. Create non-root user (security best practice)
RUN useradd --create-home --shell /bin/bash appuser

WORKDIR /home/appuser/app

# 3. Copy ONLY requirements first (changes less often than code)
COPY requirements.txt .

# 4. Install dependencies (cached unless requirements.txt changes)
RUN pip install --no-cache-dir -r requirements.txt

# 5. Copy application code LAST (changes most often — only this layer rebuilds)
COPY app/ ./app/

# 6. Switch to non-root user
USER appuser

EXPOSE 5000

# Health check: container orchestration uses this
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:5000/health || exit 1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "5000"]
```

### SAVE AND TRY

```bash
cd fastapi_app
docker build -t fastapi-demo:v1 .
docker images fastapi-demo
docker run -d -p 5000:5000 --name fastapi-demo fastapi-demo:v1
curl http://localhost:5000/
curl http://localhost:5000/health
docker logs fastapi-demo
```

Expected output:
```
{"message":"FastAPI in Docker","uptime":1715770000.0}
{"status":"healthy"}
```

**Demonstrate layer caching:**
Change one line in `app/main.py` (e.g., the message string). Rebuild:
```bash
docker build -t fastapi-demo:v2 .
```

Watch the output — layers 1-4 will show `CACHED`. Only layer 5 (COPY app/) and the final layer rebuild. This is why `requirements.txt` is copied separately: you only reinstall dependencies when they actually change.

**Show the bad Dockerfile:**
```bash
docker build -f Dockerfile.bad -t fastapi-demo-bad:v1 .
# Change one line in main.py
docker build -f Dockerfile.bad -t fastapi-demo-bad:v2 .
```
Watch: `pip install` runs again from scratch even though requirements.txt didn't change. On a large requirements file, this wastes 2-5 minutes per build.

**Cleanup:**
```bash
docker stop fastapi-demo
docker rm fastapi-demo
```

---

## Step 2 — Multi-Stage Builds: Smaller Production Images

Multi-stage builds use one image for building (with compilers, build tools) and a smaller image for running:

```dockerfile
# Dockerfile.multistage — builder + runtime stages
# ── Stage 1: Builder ────────────────────────────────────────────────────────
FROM python:3.11 AS builder

WORKDIR /build

# Install build dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

# ── Stage 2: Runtime ─────────────────────────────────────────────────────────
FROM python:3.11-slim AS runtime

# Copy only the installed packages from builder (not the compiler, build tools, etc.)
COPY --from=builder /install /usr/local

WORKDIR /app
COPY app/ ./app/

RUN useradd --create-home appuser
USER appuser

EXPOSE 5000
HEALTHCHECK --interval=30s --timeout=10s CMD curl -f http://localhost:5000/health || exit 1
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "5000"]
```

### SAVE AND TRY

```bash
docker build -f Dockerfile.multistage -t fastapi-demo:multistage .
docker images fastapi-demo

# Compare sizes
docker images | grep fastapi-demo
```

Expected output:
```
REPOSITORY     TAG           IMAGE ID   SIZE
fastapi-demo   multistage    abc123     185MB
fastapi-demo   v1            def456     235MB
```

The multistage image is smaller because the builder's Python headers, pip cache, and compilation tools are not included.

**Show layer inspection:**
```bash
docker history fastapi-demo:v1
docker history fastapi-demo:multistage
```

Shows each layer and its size. The multistage build has fewer large layers.

---

## Step 3 — Docker Compose: Multi-Container Stack

Create `docker-compose.yml` in the parent directory:

```yaml
# docker-compose.yml
version: "3.9"

services:
  api:
    build:
      context: ./fastapi_app
      dockerfile: Dockerfile
    ports:
      - "5000:5000"
    environment:
      - DATABASE_URL=postgresql://user:password@postgres:5432/myapp
      - REDIS_URL=redis://redis:6379
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_started
    networks:
      - backend
    restart: unless-stopped

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
      POSTGRES_DB: myapp
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U user -d myapp"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - backend
    ports:
      - "5432:5432"  # expose for local dev tools

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    networks:
      - backend

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro
    depends_on:
      - api
    networks:
      - backend

volumes:
  postgres_data:
  redis_data:

networks:
  backend:
    driver: bridge
```

Create `nginx.conf`:

```nginx
# nginx.conf — reverse proxy to the FastAPI app
server {
    listen 80;
    
    location / {
        proxy_pass http://api:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
    
    location /health {
        proxy_pass http://api:5000/health;
        access_log off;
    }
}
```

### SAVE AND TRY

```bash
docker compose up -d
docker compose ps
curl http://localhost/
curl http://localhost/health
```

Expected `docker compose ps` output:
```
NAME              IMAGE              COMMAND              STATUS
api               fastapi_app-api    "uvicorn app.main..."  Up
nginx             nginx:alpine       "/docker-entrypoint..."  Up
postgres          postgres:15-alpine "docker-entrypoint..."  Up (healthy)
redis             redis:7-alpine     "docker-entrypoint..."  Up
```

Observe service discovery: `api` can reach `postgres` by hostname `postgres` (Docker's built-in DNS within a network). The `api` service uses `DATABASE_URL=postgresql://user:password@postgres:5432/myapp` — `postgres` resolves to the container's IP automatically.

```bash
# Inspect the network
docker network ls
docker network inspect <project>_backend

# See what containers are in the network
docker compose exec api ping -c 3 postgres  # by hostname
docker compose exec api ping -c 3 redis
```

**Cleanup:**
```bash
docker compose down
docker compose down -v  # also remove volumes (deletes postgres data)
```

**Show volume persistence:**
```bash
docker compose up -d
curl -X POST http://localhost/items -H "Content-Type: application/json" -d '{"name":"book","price":12.99}'
docker compose restart api  # restart the API container
curl http://localhost/items  # items are GONE — in-memory, not persisted
```

This demonstrates why you need database volumes: in-memory state in the container is lost on restart. The Postgres volume (`postgres_data`) persists database data across restarts.

---

## Challenge

**No solution provided. Requirements checklist only.**

Build a production-ready containerized deployment for a multi-service application.

**Requirements checklist:**

- [ ] Application: a task manager with `api` (FastAPI), `worker` (RQ background worker), `redis` (queue), `postgres` (storage)
- [ ] `api/Dockerfile` — multi-stage build with builder stage and slim runtime. Image size < 200MB.
- [ ] `worker/Dockerfile` — shares requirements with api but runs `python -m rq worker` instead of uvicorn
- [ ] `docker-compose.yml` — all four services with proper `depends_on`, health checks, and named networks
- [ ] Secrets: `DATABASE_URL` and `SECRET_KEY` come from a `.env` file (not in docker-compose.yml). A `.env.example` documents required variables.
- [ ] `api` service: `HEALTHCHECK` that calls `GET /health` — compose restarts the service if it fails 3 times
- [ ] `worker` service: graceful shutdown — catches SIGTERM, finishes the current job, then exits
- [ ] Non-root user in both api and worker containers
- [ ] `volumes`: postgres data persisted across `docker compose down` + `docker compose up`
- [ ] `docker compose up --scale worker=3` should start 3 worker instances that all connect to the same Redis queue

**Starter:**
```yaml
# docker-compose.yml skeleton
version: "3.9"

services:
  api:
    build: ./api
    env_file: .env
    depends_on:
      postgres:
        condition: service_healthy
    # TODO: ports, healthcheck, networks, restart policy
  
  worker:
    build: ./worker
    env_file: .env
    # TODO: depends_on redis and postgres
    # TODO: scale support (no ports — multiple instances okay)
  
  redis:
    image: redis:7-alpine
    # TODO: healthcheck
  
  postgres:
    image: postgres:15-alpine
    # TODO: environment from .env, healthcheck, volume
```

**When you're done:**
```bash
docker compose up -d
docker compose ps  # all services healthy

curl http://localhost:5000/tasks  # empty list
curl -X POST http://localhost:5000/tasks -d '{"title":"test"}'
# returns task id and "status": "queued"

docker compose logs worker  # shows worker processing the task

docker compose down
docker compose up -d  # postgres data persists — tasks still exist

docker compose up -d --scale worker=3  # 3 workers running
docker compose ps | grep worker  # shows 3 worker containers
```

**Stuck?** Ask AI: "In Docker Compose, how do I configure a Python RQ worker service to run multiple instances with `--scale worker=3`? What do I need to avoid in the service definition (like fixed port mappings) that would prevent scaling? Show me the Dockerfile and compose service definition."

---

## Quick Check Answers

**1. Container running Python 3.11 on a Python 3.8 host — no VM:**
Linux namespaces. The container's MNT (mount) namespace gives it its own root filesystem, which includes Python 3.11 binaries and libraries. The container process sees a different `/usr/bin/python3` than the host process. Both run on the same Linux kernel. Python is just a userspace program — the kernel doesn't know or care which Python version a process uses. The namespace makes the container's Python installation invisible to the host and vice versa.

**2. Changing layer 3 — what rebuilds:**
Layers 1-2 are unchanged and served from cache. Layer 3 (changed instruction) is rebuilt. Layers 4-5 are also rebuilt — every layer after the changed one is invalidated because Docker's layer addressing includes all previous layers. This is the key insight: put frequently-changed instructions (your code) LAST in the Dockerfile so they only invalidate their own layer, not everything above them.

**3. 1.2GB image from 50KB of code:**
The base OS (Ubuntu = 70MB, Debian = 120MB), Python runtime + stdlib (~55MB), pip cache (~50MB), installed packages (FastAPI, uvicorn, dependencies = ~100MB), and build artifacts (compilers, headers, etc. included in full `python:3.11` = ~900MB base). Reduction: use `python:3.11-slim` (150MB base), add `--no-cache-dir` to pip, use multi-stage builds to exclude build tools, and add `.dockerignore` to exclude development files.

**4. Who can connect to `-p 8080:5000`:**
All three: processes on the host (via localhost:8080), other containers in the same Compose network (via the service name on port 5000 — they bypass the host mapping and connect directly), and containers in different networks if they explicitly route to the host's IP and port 8080. Containers in the same Docker network communicate directly on the container port (5000) without going through the host port mapping.
