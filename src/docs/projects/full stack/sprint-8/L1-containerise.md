# Sprint 8 · Lesson 1 — Containerise: Dockerfile and docker-compose full stack

## What you will build

By the end of this lesson, you have a production-ready `Dockerfile` for the FastAPI backend and a `Dockerfile` for the React frontend. `docker compose up` starts the entire stack: Postgres database, FastAPI backend, Nginx serving the built React app, all networked together. The frontend communicates with the backend through Nginx, not directly. You understand multi-stage builds, why they matter for image size, and what each Dockerfile instruction does.

---

## What you need to know first

- Sprint 3 L1: Docker concepts — images, containers, layers, `docker-compose.yml` fields.
- Sprint 1 L3: FastAPI, uvicorn, ASGI.
- Sprint 1 L2: Vite build (`npm run build`), `dist/` directory.

---

## The lesson

---

### 1. The backend Dockerfile

**The problem:** The backend currently runs with `uvicorn main:app --reload` — a development server. In production: `--reload` watches the filesystem for changes (unnecessary and slow in production), the Python process runs directly on the host (no isolation), and there is no process manager to restart it on crash.

A Docker container solves isolation. A production uvicorn command without `--reload` solves the server configuration. Multiple workers (via `gunicorn`) solve throughput.

Create `fullstack-project/backend/Dockerfile`:

```dockerfile
# Stage 1: builder
FROM python:3.11-slim AS builder

WORKDIR /app

COPY requirements.txt .
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Stage 2: production image
FROM python:3.11-slim AS production

WORKDIR /app

# Copy installed packages from builder
COPY --from=builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

# Copy application code
COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]
```

**Walkthrough — every instruction:**

`FROM python:3.11-slim AS builder` — starts from the official Python 3.11 slim image (Debian-based, minimal OS packages). `AS builder` names this build stage. The `slim` variant is ~50MB; the full Python image is ~900MB. Use slim for smaller images.

`WORKDIR /app` — sets the working directory for subsequent instructions. Creates `/app` if it does not exist. All `COPY`, `RUN`, `CMD` instructions run relative to this directory.

`COPY requirements.txt .` — copies `requirements.txt` from the build context (your project directory) into the container's current directory (`/app`). This is done before `COPY . .` intentionally — see the layer caching explanation below.

`RUN pip install --upgrade pip && pip install --no-cache-dir -r requirements.txt` — installs Python dependencies. `--no-cache-dir` prevents pip from storing the download cache inside the image (reduces image size). `&&` chains commands in one `RUN` instruction — one Docker layer for both commands.

**Why `COPY requirements.txt .` before `COPY . .`:** Docker builds are layer-cached. A layer is only rebuilt if its inputs change. `requirements.txt` changes rarely; application code changes frequently. If you do `COPY . .` first, any code change invalidates the `pip install` layer — reinstalling all dependencies on every build. By copying `requirements.txt` first, the `pip install` layer is only rebuilt when dependencies change. Application code changes are fast.

`FROM python:3.11-slim AS production` — starts a new stage from the same base. This is the **multi-stage build**: the builder stage installs dependencies (creating compilation artifacts, cache files); the production stage copies only what the running application needs.

`COPY --from=builder /usr/local/lib/python3.11/site-packages ...` — copies the installed Python packages from the builder stage. The builder's build tools, pip cache, and intermediate files are not copied. The production image is smaller.

`COPY . .` — copies all application code.

`EXPOSE 8000` — documents that the container listens on port 8000. Does not actually open the port (that is done by `docker compose`'s `ports` mapping). It is metadata for tooling.

`CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]` — the default command. `--host 0.0.0.0` binds to all network interfaces (required inside Docker — binding to `127.0.0.1` would not be reachable from outside the container). `--workers 2` starts 2 worker processes for concurrent request handling.

**CS lens — layers as a content-addressed filesystem.** Docker images are a stack of filesystem layers. Each `RUN`, `COPY`, and `ADD` instruction creates a layer. Layers are content-addressed: the same instruction on the same inputs produces the same layer, which can be shared between images. A 100-image build system where all images start from `python:3.11-slim` shares that base layer — it is downloaded and stored once. Multi-stage builds discard intermediate layers: the builder stage's pip cache exists only during build, not in the final image.

**SE lens — multi-stage build as separation of build and runtime.** The build environment and the runtime environment have different requirements. Build needs: compilers, build tools, pip, dev dependencies. Runtime needs: only the application and its runtime dependencies. A multi-stage build uses one image to build, then copies artifacts to a minimal runtime image. The runtime image cannot be used to rebuild the application — it has no build tools. This minimises the attack surface (fewer packages installed = fewer potential vulnerabilities) and reduces image size (typical reduction: 40–60%).

---

### 2. The frontend Dockerfile

Create `fullstack-project/frontend/Dockerfile`:

```dockerfile
# Stage 1: build the React app
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json .
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: serve with Nginx
FROM nginx:alpine AS production

# Copy the built static files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
```

Create `fullstack-project/frontend/nginx.conf`:

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Serve static assets with caching
    location /assets {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Proxy API requests to the backend
    location /api/ {
        proxy_pass http://backend:8000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # React Router: serve index.html for any unknown path
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

**Walkthrough — Nginx config:**

`listen 80;` — Nginx listens on port 80 (standard HTTP).

`root /usr/share/nginx/html;` — the directory where Nginx serves static files. The frontend Dockerfile copies `dist/` here.

`location /assets { expires 1y; ... }` — Vite outputs JavaScript and CSS files with content-addressed filenames (`main-abc123.js`). Since the filename changes with every build, browsers can cache them aggressively for 1 year. `Cache-Control: public, immutable` tells CDNs and browsers: this file will never change at this URL.

`location /api/ { proxy_pass http://backend:8000/; }` — proxies `/api/*` requests to the backend container. `backend` is the Docker Compose service name — Docker's internal DNS resolves it to the backend container's IP. The React frontend makes requests to `/api/orders` instead of `http://localhost:8000/orders`. This avoids CORS issues in production (same-origin request from the browser's perspective) and hides the backend port.

`proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;` — passes the original client IP to the backend. FastAPI's `get_remote_address` (used for rate limiting) reads `X-Forwarded-For`. Without this header, all backend requests appear to come from the Nginx container's IP — rate limiting would affect all users simultaneously.

`try_files $uri $uri/ /index.html;` — React Router (client-side routing) handles paths like `/orders/42`. The browser requests `/orders/42`. Nginx looks for a file at that path — it doesn't exist. Without `try_files`, Nginx returns 404. With `try_files`, Nginx falls back to `index.html`, React Router handles the path, and the application renders correctly.

**CS lens — reverse proxy as a namespace unifier.** Before the reverse proxy, the React app calls `http://localhost:8000/orders` (a different origin, triggering CORS). After the reverse proxy, the React app calls `/api/orders` (same origin). Nginx translates `/api/orders` to `http://backend:8000/orders`. The browser sees a same-origin request — no CORS. The reverse proxy creates a single namespace where all resources (frontend assets, API calls) appear to be on the same server.

**SE lens — Nginx for static files, uvicorn for API.** Nginx is built for serving static files: it uses `sendfile()` syscall to copy files directly from disk to network buffer, bypassing the kernel copy. Uvicorn is an async Python web server — excellent for dynamic API responses, not optimised for static files. Separating concerns: Nginx serves `dist/*.js`, uvicorn handles `/api/*`. Each serves its purpose.

---

### 3. The full-stack docker-compose.yml

Update `fullstack-project/docker-compose.yml`:

```yaml
version: '3.8'

services:
  database:
    image: postgres:15
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    environment:
      DATABASE_URL: postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@database:5432/${POSTGRES_DB}
      SECRET_KEY: ${SECRET_KEY}
    depends_on:
      database:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  postgres_data:
```

Create `fullstack-project/.env` (for local development):

```
POSTGRES_USER=devuser
POSTGRES_PASSWORD=devpassword
POSTGRES_DB=workorders
SECRET_KEY=dev-secret-key-change-this-in-production
```

Add a health check endpoint to FastAPI (`backend/main.py`):

```python
@app.get("/health")
def health_check():
    return {"status": "ok"}
```

Start the full stack:

```
docker compose up --build
```

Visit `http://localhost` — the React app loads. It makes API calls to `/api/orders` which Nginx proxies to the FastAPI backend.

**Walkthrough — the compose file:**

`${POSTGRES_USER}` — reads from the `.env` file in the same directory. `docker compose` loads `.env` automatically. Environment variable substitution makes config values reusable across services.

`depends_on: database: condition: service_healthy` — waits for the `database` service's health check to pass before starting `backend`. The health check is the `pg_isready` command. Without this condition (or with just `depends_on: database`), the backend may start before Postgres accepts connections — the first request fails.

`volumes: postgres_data:` — a named volume. Data persists across `docker compose down` and `docker compose up`. Without it, the database is empty on every restart.

`ports: - "80:80"` — only the frontend is exposed. The backend and database are on Docker's internal network — not accessible from the host machine directly. External traffic flows: browser → `:80` → Nginx → `/api/*` → backend:8000. The backend has no host-accessible port.

**CS lens — Docker networking as a virtual LAN.** `docker compose` creates a virtual network (a bridge network) for all services in the file. Services communicate by name (`backend`, `database`, `frontend`). Docker's embedded DNS resolves service names to container IPs. Services are not accessible from the host unless explicitly mapped with `ports:`. This creates a network topology: the internet can reach port 80 (Nginx), Nginx can reach port 8000 (backend), backend can reach port 5432 (database). The database is never directly accessible from the internet.

---

## Connect the pieces

You now have a production-grade Docker setup:
- Multi-stage builds minimise image size
- Nginx serves the frontend and proxies API calls
- Docker Compose manages the three-service stack with health checks and dependencies
- Environment variables are never hardcoded in Dockerfiles or compose files

Lesson 2 deploys this stack to a real VPS: Nginx (host-level) terminates TLS, systemd manages the stack, and the deployment does not require downtime.

---

## What breaks without this

**`--host 127.0.0.1` instead of `0.0.0.0` in uvicorn CMD:** Docker containers have their own network namespace. `127.0.0.1` inside the container is the container's loopback — not reachable from Nginx or the host. `0.0.0.0` binds to all interfaces including the Docker bridge interface, making it reachable from other containers.

**Missing `try_files` in Nginx config:** React Router routes (`/orders/42`) return 404 from Nginx because no file exists at that path. The application appears broken on page refresh.

---

## Definition of done

- [ ] `docker compose up --build` starts all three services without errors
- [ ] `http://localhost` loads the React app
- [ ] API calls through the frontend reach the backend (work orders load)
- [ ] `docker compose down && docker compose up` — data persists (orders created before `down` are still there)
- [ ] `docker images` shows the backend and frontend images; sizes are reasonable (backend <500MB, frontend <50MB)
- [ ] You can explain what multi-stage build accomplishes for image size
- [ ] You can explain what `try_files $uri $uri/ /index.html` does for React Router

**Git commit:**

```
git add fullstack-project/backend/Dockerfile fullstack-project/frontend/Dockerfile fullstack-project/frontend/nginx.conf fullstack-project/docker-compose.yml fullstack-project/.env.example
git commit -m "Add production Dockerfiles: multi-stage backend, Nginx frontend with API proxy, full-stack docker compose"
```
