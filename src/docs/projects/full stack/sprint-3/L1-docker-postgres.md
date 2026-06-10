# Sprint 3 · Lesson 1 — Docker: run Postgres without installing it

## What you will build

By the end of this lesson, a Postgres database is running on your machine inside a Docker container. You will connect to it with a graphical client, inspect its structure, and create the `work_orders` table manually. You will understand what Docker is, what a container is, and what every line of `docker-compose.yml` does. Nothing persists in the container unless you configure a volume — and you will configure one.

---

## What you need to know first

- Sprint 1 L1: Terminal, working directory, environment variables.
- Sprint 1 L3: Ports, localhost.

---

## The lesson

---

### 1. What Docker is — and what it is not

**The problem:** You need a Postgres database. The naive solution is to install Postgres directly on your machine. The problem: Postgres requires system-level configuration, uses ports that other programs might need, and its version on your machine may differ from the version in production. Installing, upgrading, and removing databases from your machine is painful and leaves configuration files scattered across the file system.

Docker is the solution.

**What Docker is:** Docker is a program that runs other programs in **containers** — isolated, self-contained environments that include everything the program needs: its operating system libraries, its configuration, its runtime. A container is not a virtual machine — it does not emulate hardware or boot a full operating system. It uses the host operating system's kernel directly but isolates the process's file system, network, and process tree using Linux kernel features called **namespaces** and **cgroups**. On macOS and Windows, Docker runs a small Linux virtual machine to provide these Linux kernel features.

**Image vs container:** An **image** is a recipe — a read-only snapshot of a file system at a specific state (the OS, the installed software, the configuration). A **container** is a running instance of an image. The same image can run as many containers simultaneously. Images are downloaded from a **registry** — Docker Hub is the public registry where official images like `postgres:16` live.

**Why this matters:** The Postgres database running in a container is identical to the one running in production. Same version, same configuration format, same behaviour. When you write a SQL query in development and it works, it will work in production — they are the same database engine. When you run a container on your machine and a colleague runs the same container on theirs, the database behaves identically.

Install Docker from [https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/). After installation, verify:

```
docker --version
```

Expected output:
```
Docker version 26.1.0, build ...
```

Also verify Docker Compose (included with Docker Desktop):

```
docker compose version
```

Expected output:
```
Docker Compose version v2.26.0
```

**CS lens — namespaces as the kernel's isolation primitive.** Linux **namespaces** are the kernel feature that makes containers possible. Each namespace type isolates a specific resource: the PID namespace isolates process IDs (a process inside the container has PID 1; outside, it has a different PID); the network namespace isolates network interfaces (the container has its own virtual network stack); the mount namespace isolates the file system. Docker creates a set of namespaces for each container and places the container process inside them. From inside the container, it appears to have its own machine. From outside, it is a regular process on the host.

**SE lens — reproducible environments as a production requirement.** "It works on my machine" is the most common cause of production incidents in software development. Docker eliminates this by making environments reproducible: the `docker-compose.yml` file is a precise description of the environment. Anyone who runs it gets the same environment. The same file runs in CI/CD, in staging, and in production. Reproducibility is not a luxury — it is the prerequisite for reliable deployments.

---

### 2. Write `docker-compose.yml`

**The problem:** You need to run Postgres with specific configuration: a username, a password, a database name, a persistent volume, and a port binding. Docker Compose lets you declare all of this in a single file and start everything with one command.

Create `fullstack-project/docker-compose.yml`:

```yaml
services:
  database:
    image: postgres:16
    environment:
      POSTGRES_USER: devuser
      POSTGRES_PASSWORD: devpassword
      POSTGRES_DB: workorders
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U devuser -d workorders"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
```

**Walkthrough — every key explained:**

**`services:`** — the top-level key that lists all the services (containers) this Compose file manages. Each key under `services:` is a service name you choose. `database` is the name you are giving to this service.

**`image: postgres:16`** — the Docker image to use. `postgres` is the image name from Docker Hub. `16` is the tag — a label pointing to a specific version. `postgres:16` is the official PostgreSQL 16 image maintained by the PostgreSQL team. Specifying `16` rather than `latest` is deliberate: `latest` would give you the newest version without warning if a breaking change is introduced.

**`environment:`** — a map of environment variables passed to the container. The Postgres image reads these at first startup:

- `POSTGRES_USER: devuser` — creates a Postgres user named `devuser`
- `POSTGRES_PASSWORD: devpassword` — sets the password for `devuser`
- `POSTGRES_DB: workorders` — creates a database named `workorders` owned by `devuser`

These are the credentials your FastAPI app will use to connect. In production, these values come from real secrets management (a secrets vault, not a `docker-compose.yml` file). For development, hardcoded credentials in a file that is not committed to a public repository are acceptable.

**`ports: - "5432:5432"`** — maps a host port to a container port. The format is `"host_port:container_port"`. `5432` is Postgres's default port — it listens on port 5432 inside the container. The left `5432` makes it accessible at `localhost:5432` on your machine. Without port mapping, the container's port is not accessible from the host.

**`volumes: - postgres_data:/var/lib/postgresql/data`** — mounts a named volume at the path `/var/lib/postgresql/data` inside the container. This is where Postgres stores all its data files. Without this volume: when the container stops, all data is lost — the container's filesystem is temporary. With this volume: data is stored in `postgres_data` (managed by Docker on the host), which persists across container restarts. The named volume `postgres_data` is defined under the top-level `volumes:` key.

**`healthcheck:`** — tells Docker how to test whether the container is ready to accept connections (not just running). `pg_isready` is a Postgres utility that attempts to connect and reports whether the database is accepting connections. `interval: 5s` means Docker runs this check every 5 seconds. `retries: 5` means Docker retries 5 times before declaring the container unhealthy. In Lesson 3, SQLAlchemy will not connect until the health check passes.

**Top-level `volumes: postgres_data:`** — declares the named volume. Docker manages its location on the host file system. You can inspect it with `docker volume inspect postgres_data`.

**CS lens — declarative infrastructure.** `docker-compose.yml` is a **declarative** description of the desired infrastructure: services, their images, their configuration, their networking, their storage. Docker reads the declaration and creates the corresponding state. Compare this to imperatively running `docker run -e POSTGRES_USER=devuser -p 5432:5432 ...` — the command is harder to read, harder to share, and easy to get wrong. Declarative configuration files are the standard for infrastructure in production: Kubernetes uses YAML, Terraform uses HCL, AWS CloudFormation uses JSON/YAML. The specific format differs; the principle is identical.

**SE lens — environment variables for configuration.** `POSTGRES_USER`, `POSTGRES_PASSWORD`, and `POSTGRES_DB` are environment variables — the same configuration-through-environment pattern from Lesson 1. The Postgres image is designed this way: the program is identical across all environments; only the configuration (passed via environment variables) differs. In Sprint 6 you will move these values to a `.env` file so they are not hardcoded in `docker-compose.yml`.

**What breaks without this:** If you omit the `volumes:` section, Postgres data is stored in the container's writable layer. When you run `docker compose down`, the container is deleted along with its data. Every restart starts with an empty database. The volume is what makes the database persistent.

---

### 3. Start the database

Run from `fullstack-project/` (where `docker-compose.yml` lives):

```
docker compose up -d
```

Expected output:
```
[+] Running 2/2
 ✔ Volume "fullstack-project_postgres_data"  Created
 ✔ Container fullstack-project-database-1    Started
```

**Walkthrough:**

`docker compose up` — reads `docker-compose.yml`, downloads any images that are not already on your machine (first run: downloads `postgres:16`, ~100MB), creates the services, and starts them.

`-d` — **detached mode**. Without `-d`, the container's output streams to your terminal and the container stops when you press `Ctrl+C`. With `-d`, the containers run in the background and your terminal is returned immediately.

Check that it is running:

```
docker compose ps
```

Expected output:
```
NAME                            IMAGE         COMMAND                  SERVICE    CREATED        STATUS
fullstack-project-database-1    postgres:16   "docker-entrypoint.s…"  database   1 minute ago   Up 1 minute (healthy)
```

`STATUS: Up (healthy)` — the health check passed. Postgres is running and accepting connections.

Check the logs to see what Postgres printed on startup:

```
docker compose logs database
```

Expected output includes:
```
database-1  | PostgreSQL init process complete; ready for start up.
database-1  | LOG:  database system is ready to accept connections
```

To stop the database (without deleting data):

```
docker compose stop
```

To stop and remove the container (data is preserved in the volume):

```
docker compose down
```

To stop and delete everything including the volume (data is lost):

```
docker compose down -v
```

**The `-v` flag** on `docker compose down` is the only command that deletes the volume. Never run it unless you intend to wipe the database. This is why the definition of done for this lesson includes verifying that data persists across restarts.

**CS lens — container lifecycle.** A container has a lifecycle: **created** (image downloaded, container configured), **running** (process active), **stopped** (process exited, filesystem preserved), **removed** (filesystem deleted). `docker compose up` creates and starts. `docker compose stop` stops. `docker compose start` restarts a stopped container. `docker compose down` stops and removes. The volume is separate from the container lifecycle — it persists across `down` and is only deleted with `-v`.

**SE lens — `-d` for development.** Running databases and services in detached mode (`-d`) keeps the terminal available for other work. In CI/CD pipelines, services are also started in the background, the tests run in the foreground, and the services are stopped after the tests complete. The development workflow mirrors the CI workflow.

**What breaks without this:** If `docker compose up` fails with "port is already in use," another program (perhaps a locally installed Postgres) is already using port 5432. Options: stop the conflicting program, or change the host port mapping to `"5433:5432"` (map the container's 5432 to the host's 5433 instead) and update your database URL accordingly.

---

### 4. Connect with a GUI client

**The problem:** You have a running Postgres database but cannot see inside it. A graphical client lets you inspect the schema, run queries, and verify that your application's writes are landing correctly.

Download **TablePlus** from [https://tableplus.com](https://tableplus.com) (free tier covers this curriculum). Alternatives: DBeaver, pgAdmin, DataGrip.

In TablePlus, click "Create a new connection" and choose PostgreSQL. Enter:

- **Host:** `localhost`
- **Port:** `5432`
- **User:** `devuser`
- **Password:** `devpassword`
- **Database:** `workorders`

Click "Test" — should show "Connection is OK." Click "Connect."

You will see the `workorders` database. Under Schemas → public → Tables, it is empty. You will add a table in Lesson 2.

**Walkthrough:** TablePlus connects to the Postgres container via the host port mapping `5432:5432`. From TablePlus's perspective, it is connecting to `localhost:5432` — your machine's port 5432. Docker forwards that connection to the container's port 5432. Postgres inside the container receives the connection, authenticates with the username/password, and grants access to the `workorders` database.

**SE lens — the GUI as a development tool.** TablePlus (and equivalents) is not used in production. In production, you interact with the database through your application code or through `psql` (Postgres's command-line client). The GUI is a development aid: it lets you verify your application's database writes, inspect schemas, and run ad-hoc queries to debug data issues. Use it constantly during development; rely on the application in production.

**What breaks without this:** If the connection test fails with "Connection refused," the container is not running. Check `docker compose ps`. If the connection test fails with "authentication failed," the username or password is wrong — verify they match `docker-compose.yml`. If the connection test fails with "database does not exist," the `POSTGRES_DB` value does not match the database name you entered.

---

## Connect the pieces

You have a running Postgres database. In Lesson 2 you will learn SQL: create the `work_orders` table, insert data, and query it. In Lesson 3, SQLAlchemy replaces the in-memory list in FastAPI with queries to this database. In Lesson 4, Alembic handles schema changes. Everything in this lesson — Docker, the volume, the environment variables, the port mapping — becomes background infrastructure: it starts when you begin working and is never thought about again, until you deploy to production in Sprint 8.

---

## What breaks without this

**Data disappears on restart without a volume:** `docker compose down && docker compose up -d` and all your data is gone. Fix: confirm the `volumes:` section in `docker-compose.yml` is correct and the volume appears in `docker compose ps` output.

**Two docker-compose.yml files conflict:** If you run `docker compose up` from a different directory that also has a `docker-compose.yml`, you may start a second Postgres container trying to bind port 5432 — which is already taken by the first. Fix: always run from `fullstack-project/`.

---

## Definition of done

- [ ] `docker compose ps` shows `fullstack-project-database-1` with status `Up (healthy)`
- [ ] TablePlus (or equivalent) connects to `localhost:5432` with the credentials in `docker-compose.yml`
- [ ] You ran `docker compose stop`, then `docker compose start`, and TablePlus still connects
- [ ] You can explain the difference between an image and a container
- [ ] You can explain what the volume does and what happens without it
- [ ] You can explain what each line of `docker-compose.yml` does
- [ ] You can explain what the port mapping `"5432:5432"` means

**Git commit:**

```
git add docker-compose.yml
git commit -m "Add docker-compose.yml: Postgres 16 with named volume, health check, and port mapping for local development"
```
