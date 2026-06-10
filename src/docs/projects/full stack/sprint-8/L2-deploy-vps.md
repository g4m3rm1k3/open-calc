# Sprint 8 · Lesson 2 — Deploy to a VPS

## What you will build

By the end of this lesson, the application is running on a real server at a real domain. HTTPS is configured with a Let's Encrypt certificate (auto-renewed). Nginx (host-level, not Docker) terminates TLS and forwards traffic to the Docker stack. Systemd starts the Docker Compose stack on boot and restarts it on failure. A deploy script pushes changes without downtime.

---

## What you need to know first

- Sprint 8 L1: Dockerfiles, docker-compose full stack, Nginx config.
- Sprint 6 L4: Environment variables, secrets management.

---

## The lesson

---

### 1. Set up the VPS

**Choose a provider:** DigitalOcean Droplet, Linode/Akamai Nanode, AWS Lightsail, or Vultr — all offer Ubuntu 22.04 LTS servers for ~$5–$12/month. Create a 1GB RAM Ubuntu 22.04 instance. Add your SSH public key during creation.

SSH into the new server:

```bash
ssh root@YOUR_SERVER_IP
```

Create a non-root deploy user:

```bash
useradd -m -s /bin/bash deploy
usermod -aG sudo deploy
usermod -aG docker deploy  # after Docker is installed
mkdir -p /home/deploy/.ssh
cp ~/.ssh/authorized_keys /home/deploy/.ssh/
chown -R deploy:deploy /home/deploy/.ssh
chmod 700 /home/deploy/.ssh
chmod 600 /home/deploy/.ssh/authorized_keys
```

Install Docker:

```bash
apt-get update
apt-get install -y docker.io docker-compose-plugin
systemctl enable docker
systemctl start docker
```

Install Nginx and certbot:

```bash
apt-get install -y nginx certbot python3-certbot-nginx
```

Point your domain (or subdomain) to the server's IP address. Create an A record: `workorders.yourdomain.com` → `YOUR_SERVER_IP`. DNS propagation takes 1–24 hours.

**CS lens — why a non-root deploy user.** The principle of least privilege applied to system users: the `deploy` user needs access to Docker and the application files — not root access to the entire system. Running `docker compose` as root means a vulnerability in the application or Docker daemon could give an attacker root. `deploy` limits the blast radius. `sudo` allows `deploy` to execute specific elevated commands when needed.

---

### 2. Configure Nginx for TLS

On the server, create `/etc/nginx/sites-available/workorders`:

```nginx
server {
    listen 80;
    server_name workorders.yourdomain.com;

    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Wait — this would conflict. The plan: host Nginx (on the server, not in Docker) handles TLS on port 443 and forwards to Docker Nginx on port 8080. Update the compose file to expose the frontend on 8080 instead of 80:

```yaml
frontend:
  ports:
    - "8080:80"
```

Update the Nginx site config:

```nginx
server {
    listen 80;
    server_name workorders.yourdomain.com;
    return 301 https://$host$request_uri;  # redirect HTTP to HTTPS
}

server {
    listen 443 ssl;
    server_name workorders.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/workorders.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/workorders.yourdomain.com/privkey.pem;

    # Modern TLS settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # HSTS
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
    }
}
```

Enable the site and get the TLS certificate:

```bash
ln -s /etc/nginx/sites-available/workorders /etc/nginx/sites-enabled/
nginx -t  # test config
systemctl reload nginx

# First, get certificate with HTTP challenge (port 80 must be serving)
# Update Nginx to temporarily serve a plain HTTP site (no proxy), then:
certbot --nginx -d workorders.yourdomain.com
```

Certbot modifies the Nginx config automatically to add TLS settings and sets up auto-renewal.

**Walkthrough — TLS termination:**

`ssl_protocols TLSv1.2 TLSv1.3` — only allow TLS 1.2 and 1.3. TLS 1.0 and 1.1 are deprecated with known vulnerabilities (BEAST, POODLE). TLS 1.3 is faster (0-RTT handshake) and more secure.

`ssl_prefer_server_ciphers off` — for TLS 1.3, the client's cipher preference is used. This allows modern clients to use the strongest available cipher. For TLS 1.2 compatibility, the server's list determines the cipher — hence the explicit cipher list.

`proxy_set_header X-Forwarded-Proto https` — tells the backend that the original request was HTTPS. FastAPI can read this to generate correct URLs and set the `Secure` flag on cookies.

`return 301 https://$host$request_uri` — permanent redirect. All HTTP traffic is immediately redirected to HTTPS. Browsers cache 301 redirects — repeat visitors skip the HTTP request entirely.

**CS lens — TLS handshake and certificate chain.** When a browser connects to `https://workorders.yourdomain.com`, it: sends a `ClientHello` listing supported TLS versions and ciphers; the server responds with its certificate and `ServerHello`; the browser verifies the certificate against trusted root CAs (Certificate Authorities); both sides derive a shared session key using ECDHE (Elliptic Curve Diffie-Hellman Ephemeral). The session key is derived without transmitting it — an eavesdropper cannot decrypt traffic even if they capture it all. Let's Encrypt is a free, automated CA — it verifies domain ownership by checking a challenge file you create at a known URL (`/.well-known/acme-challenge/...`).

**SE lens — TLS termination at the boundary.** Internal traffic (Docker internal network, between containers) is HTTP. TLS termination at the Nginx boundary means: only one component manages certificates, and certificate management is decoupled from the application. The FastAPI backend never handles TLS — it receives plain HTTP from Nginx. This is the standard architecture for web applications: one entry point (load balancer, reverse proxy) handles TLS; everything behind it is HTTP.

---

### 3. Configure systemd to manage the application

Systemd manages system services — it starts them on boot, restarts them on failure, and logs their output.

Create `/etc/systemd/system/workorders.service`:

```ini
[Unit]
Description=Work Orders Application
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/home/deploy/workorders
ExecStart=/usr/bin/docker compose up -d
ExecStop=/usr/bin/docker compose down
User=deploy
TimeoutStartSec=120

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
systemctl daemon-reload
systemctl enable workorders.service
systemctl start workorders.service
systemctl status workorders.service
```

**Walkthrough:**

`Requires=docker.service` and `After=docker.service` — this service depends on Docker. Systemd ensures Docker is running before starting `workorders.service`.

`Type=oneshot` — the service runs a command that exits immediately (`docker compose up -d` exits after starting containers in background). `RemainAfterExit=yes` marks the service as active even after the command exits.

`WorkingDirectory=/home/deploy/workorders` — `docker compose` reads `docker-compose.yml` and `.env` from this directory.

`ExecStart=/usr/bin/docker compose up -d` — the command to start the service. `-d` starts containers in detached mode.

`User=deploy` — runs the service as the `deploy` user.

`WantedBy=multi-user.target` — starts the service when the system reaches multi-user mode (normal operation, not single-user mode or rescue).

Now, on every server reboot, the application starts automatically. If a container crashes, `docker compose` restarts it (configured by `restart: always` in `docker-compose.yml` — add this to each service).

**CS lens — supervisor processes and process trees.** Systemd is a process supervisor: it maintains the tree of processes and their desired states. A process that should always be running is `WantedBy=multi-user.target`; if it exits unexpectedly, systemd can restart it. Docker is also a supervisor: it maintains container processes. The nesting (systemd manages Docker Compose, Docker Compose manages containers) creates a supervision hierarchy. `restart: always` in compose means Docker restarts individual crashed containers; systemd manages the overall stack.

---

### 4. Write the deploy script

`deploy.sh`:

```bash
#!/bin/bash
set -e  # exit on any error

SERVER=deploy@workorders.yourdomain.com
APP_DIR=/home/deploy/workorders

echo "Syncing files..."
rsync -avz --exclude='.env' --exclude='venv/' --exclude='node_modules/' \
  fullstack-project/ $SERVER:$APP_DIR/

echo "Building and restarting..."
ssh $SERVER "cd $APP_DIR && docker compose pull && docker compose up -d --build"

echo "Running migrations..."
ssh $SERVER "cd $APP_DIR && docker compose exec backend alembic upgrade head"

echo "Deploy complete."
```

Run locally:

```bash
chmod +x deploy.sh
./deploy.sh
```

**Walkthrough:**

`set -e` — exits the script immediately if any command fails. Without this, a failed `rsync` would not stop the deploy — a partially-synced deploy would proceed to restart.

`rsync -avz` — syncs local files to the server. `-a` (archive) preserves permissions, timestamps, ownership. `-v` (verbose) lists synced files. `-z` (compress) compresses data in transit. `--exclude` patterns prevent syncing `.env` (the server has its own), `venv/`, and `node_modules/` (installed in Docker, not needed on server).

`docker compose up -d --build` — rebuilds images from the new code and starts containers. Containers are replaced one-by-one (blue-green style by default in recent Docker Compose versions). Traffic continues during the rebuild.

`docker compose exec backend alembic upgrade head` — runs database migrations after the new image is running. The backend container has the new migration files; this executes them against the production database.

**Zero-downtime deploy:** `docker compose up --build` stops the old container and starts the new one. There is a brief moment (typically <2 seconds) where neither the old nor new container is serving requests. For true zero-downtime (no gap), you need multiple replicas and a load balancer that removes the old container before stopping it. For a single-instance deployment, the 2-second gap is acceptable.

**CS lens — idempotent deployments.** `alembic upgrade head` is idempotent: running it multiple times produces the same result as running it once (Alembic tracks which migrations have run). `docker compose up --build` is also idempotent: if no files changed, no rebuild occurs and containers are unchanged. The deploy script can be re-run safely — it does not create duplicate resources.

**SE lens — the deploy script as documentation.** The deploy script is documentation: it records exactly what steps are required to deploy the application. A new team member can read `deploy.sh` and understand the deploy process completely. Without a script, deploy steps are oral tradition — forgotten, inconsistently applied, absent when urgently needed.

---

## Connect the pieces

The application is now:
- Accessible at `https://workorders.yourdomain.com`
- TLS-protected with auto-renewing Let's Encrypt certificate
- Started automatically on server boot via systemd
- Deployable with one command: `./deploy.sh`

Lesson 3 adds structured logging and Sentry error tracking — visibility into what happens in production.

---

## What breaks without this

**`ExecStart` path wrong:** Systemd requires absolute paths. `/usr/bin/docker` not `docker`. Run `which docker` to find the absolute path.

**`.env` not on the server before first deploy:** The application starts but fails because `SECRET_KEY` and `DATABASE_URL` are unset. Fix: create `/home/deploy/workorders/.env` with production values before running `./deploy.sh` for the first time.

---

## Definition of done

- [ ] `https://workorders.yourdomain.com` loads the application over HTTPS
- [ ] HTTP (`http://workorders.yourdomain.com`) redirects to HTTPS
- [ ] `systemctl status workorders.service` shows `active (exited)` (or `active (running)`)
- [ ] Server reboot: `ssh server "sudo reboot"` → after 60s: application is running again
- [ ] `./deploy.sh` deploys a code change in under 2 minutes
- [ ] You can explain what `rsync --exclude='.env'` does and why
- [ ] You can explain what TLS termination means and why it is done at the Nginx layer

**Git commit:**

```
git add deploy.sh
git commit -m "Add deploy script: rsync + docker compose rebuild + alembic migrations over SSH"
```
