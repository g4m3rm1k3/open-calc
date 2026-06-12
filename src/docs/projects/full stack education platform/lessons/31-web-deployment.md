# Lesson 31 — Web Deployment

## What You Will Build

Deploy the full stack: the Express API to a VPS (Hetzner or DigitalOcean), the React
web app to Vercel, and the database to a managed PostgreSQL instance. Configure a
custom domain, HTTPS, CI/CD pipeline, and health checks. The app runs in production.

---

## What You Need to Know First

- Lesson 11: Express, ports, environment variables
- Lesson 12: PostgreSQL, `DATABASE_URL`
- Lesson 17: JWT secret, environment secrets

---

## The Lesson

### Step 1 — The Twelve-Factor App

The **twelve-factor app** is a methodology for building deployable, scalable web
applications. Not all twelve factors apply here; the critical ones are:

**Factor III — Config:** Store configuration in the environment, not the code.
`DATABASE_URL`, `JWT_SECRET`, `REDIS_URL` are environment variables — different values
in development, staging, and production. Never hardcode them. Never commit them.

**Factor VI — Processes:** The app is a stateless process. Each request is served
independently; no request relies on in-process state from a previous request. User session
data lives in the database (Lesson 20), not in server memory. This means the API can
run as multiple identical processes behind a load balancer.

**Factor VII — Port binding:** The app binds to a port and listens for HTTP requests.
`app.listen(process.env['PORT'] ?? 3000)` — the port comes from the environment.
The process manager (systemd, Docker) decides which port to expose.

**Factor XI — Logs:** Treat logs as event streams. Write logs to stdout; let the
infrastructure (systemd, Docker, Datadog) collect and aggregate them. Do not write to
log files — files require rotation, disk space management, and log shipping.

**CS lens — separation of concerns at the infrastructure level:**
Twelve-factor separates what the app knows about itself (code) from what the environment
knows about the deployment (config). The same code, run in different environments with
different `DATABASE_URL` values, connects to different databases. This is dependency
injection at the infrastructure level.

### Step 2 — Deploying the API to a VPS

```bash
# On your local machine:
$ ssh root@your-server-ip

# On the server:
$ apt update && apt install -y nodejs npm nginx certbot python3-certbot-nginx

# Create a deployment user (principle of least privilege)
$ useradd -m -s /bin/bash codex
$ su - codex

# Clone the repo
$ git clone https://github.com/yourname/codex.git
$ cd codex/server
$ npm ci --production   # install only non-devDependencies
```

**`npm ci` vs `npm install` explained:**
- `npm install` resolves `package.json` constraints and may update `package-lock.json`
- `npm ci` installs exactly what is in `package-lock.json` — deterministic, reproducible

Deployments must be deterministic. If `npm install` installs a different patch version
than what was tested, behavior may differ. `npm ci` ensures production runs what was tested.

**systemd service for the API:**
```ini
# /etc/systemd/system/codex-api.service
[Unit]
Description=Codex API Server
After=network.target postgresql.service

[Service]
User=codex
WorkingDirectory=/home/codex/codex/server
ExecStart=/usr/bin/node dist/index.js
Restart=on-failure
RestartSec=5
StandardOutput=journal
StandardError=journal
Environment=NODE_ENV=production
EnvironmentFile=/home/codex/.env.production

[Install]
WantedBy=multi-user.target
```

```bash
$ systemctl enable codex-api
$ systemctl start codex-api
$ systemctl status codex-api
```

**`EnvironmentFile=/home/codex/.env.production` explained:**
`systemd` reads the file and sets each line as an environment variable for the process.
The file is owned by `codex` and not readable by other users (`chmod 600`).
This is separate from the codebase — the file is never committed to git.

**`Restart=on-failure` explained:**
systemd monitors the process. If it exits with a non-zero code (crashes), systemd
restarts it after `RestartSec=5` seconds. Without this, a crash takes the API offline
until manual intervention.

**`StandardOutput=journal` and `StandardError=journal`:**
stdout and stderr are captured by the systemd journal. `journalctl -u codex-api -f`
shows live logs. This satisfies twelve-factor Factor XI.

### Step 3 — Reverse Proxy with Nginx

The API runs on port 3000. Browsers expect HTTPS on port 443. Nginx sits in front:
```nginx
# /etc/nginx/sites-available/codex-api
server {
    listen 80;
    server_name api.codexapp.io;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
$ certbot --nginx -d api.codexapp.io
# Certbot adds SSL config, sets up auto-renewal
```

**Why a reverse proxy:**
- **TLS termination:** Nginx handles HTTPS. The Node.js app speaks plain HTTP on localhost.
- **Port 443:** Nginx listens on 443; Node.js runs on 3000 (non-privileged port)
- **WebSocket support:** `Upgrade` / `Connection` headers enable WebSocket proxying
- **Rate limiting, static files, load balancing:** Nginx handles these without touching Node.js

**`X-Forwarded-For` explained:**
When Nginx proxies a request, `req.ip` in Express is `127.0.0.1` (Nginx's address),
not the client's IP. `X-Forwarded-For` carries the original client IP. Express reads it
with `app.set('trust proxy', 1)`. Rate limiting and logging need the real client IP.

**Let's Encrypt / Certbot:**
Let's Encrypt is a free, automated certificate authority. Certbot is its client. It
requests a domain validation certificate (proves you control the domain by placing a file
on the server), downloads the certificate, configures Nginx, and sets up cron for
auto-renewal (certificates expire every 90 days).

### Step 4 — CI/CD Pipeline with GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Deploy to server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SERVER_IP }}
          username: codex
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /home/codex/codex
            git pull origin main
            cd server
            npm ci --production
            npm run build
            npx prisma migrate deploy
            systemctl restart codex-api
```

**`needs: test`:** The `deploy` job runs only if `test` passes. This enforces: tests must
pass before code reaches production. "Push to main deploys to production" is the CI/CD
pipeline; "tests must pass" is the quality gate.

**`npx prisma migrate deploy`:** Applies pending migrations to the production database.
This is the production equivalent of `prisma migrate dev`. It applies only migrations
that have not yet been applied, in order.

**`secrets.SERVER_IP` and `secrets.SSH_PRIVATE_KEY`:** Stored in GitHub Actions Secrets —
not in the repository. The SSH private key allows the CI runner to connect to the server
without a password. The corresponding public key is in `~/.ssh/authorized_keys` on the server.

### Step 5 — Deploying the Web App to Vercel

```bash
$ npm install -g vercel
$ vercel
# Detects Expo/React app, configures automatically
# Sets EXPO_PUBLIC_API_URL in Vercel environment settings
```

Vercel handles:
- CDN distribution across 100+ edge nodes
- Automatic HTTPS
- Preview deployments for every PR (unique URL for each PR to test before merging)
- Automatic deployment on push to `main`

---

## Connect the Pieces

The twelve-factor stateless process requirement (Factor VI) depends directly on the session
management choices in Lesson 20. Storing sessions in Redis (not in server memory) allows
any server instance to handle any request. A server that stores sessions in memory cannot
be scaled horizontally — a load balancer may route the second request to a different
instance that has no session for the user.

The GitHub Actions pipeline is the same structure as the TDD cycle from Lesson 10:
run tests (red/green), then apply the change. The CI pipeline enforces this at the
organizational level: no human can skip tests and deploy directly.

The systemd `Restart=on-failure` is a simple reliability mechanism — the same concept
as the Socket.io exponential backoff in Lesson 25. Both handle failure by retrying.
systemd retries the process; Socket.io retries the connection.

---

## What Breaks Without This

Without `npm ci`, a deployment on a server with a different npm version installs different
dependency versions. A security patch applied to a dependency locally (updating
`package-lock.json`) is silently not applied in production if `npm install` resolves to
a cached version. The production server runs a vulnerable dependency.

Without `proxy_set_header X-Forwarded-For`, all requests appear to come from `127.0.0.1`.
The rate limiter (Lesson 14) rate-limits Nginx's IP, not client IPs — after 100 requests
from any client, the rate limiter blocks all traffic. The entire API goes down.

---

## Definition of Done

- [ ] The API is running on the VPS and accessible at `https://api.codexapp.io/api/health`
- [ ] `systemctl status codex-api` shows `active (running)`
- [ ] HTTPS is configured with a Let's Encrypt certificate
- [ ] Pushing to `main` triggers the GitHub Actions pipeline (test → deploy)
- [ ] The web app is deployed to Vercel and loads at the production domain
- [ ] Production database migrations run on deploy (`prisma migrate deploy`)
- [ ] You can answer: what is the twelve-factor app and which factors apply here?
- [ ] You can answer: why does `npm ci` exist and when should you use it instead of `npm install`?
- [ ] You can answer: what is TLS termination and why does it happen in Nginx, not Node.js?
- [ ] You can answer: what is the `X-Forwarded-For` header and why does it exist?
- [ ] `git commit` with a message explaining why — "Add production deployment: systemd, Nginx, Certbot, GitHub Actions CI/CD"
