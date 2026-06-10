# Sprint 5 · Lesson 4 — GitHub Actions: run tests on every push

## What you will build

By the end of this lesson, a GitHub Actions workflow runs your backend pytest suite and frontend Vitest suite automatically on every push to `main`. A failing test blocks the branch. You will understand workflow YAML syntax, jobs, steps, how secrets work in CI, and branch protection rules. When you push broken code, the pipeline tells you before a collaborator sees it.

---

## What you need to know first

- Sprint 5 L1–L3: What tests are and how to run them locally.
- Sprint 3 L1: Docker Compose, Postgres service.
- Sprint 1 L1: git concepts.

---

## The lesson

---

### 1. What CI is and what GitHub Actions is

**The problem:** You can run `pytest` and `npm test` locally. But "works on my machine" is not a guarantee — your machine has the right Python version, the right Node version, the right environment variables. A collaborator's machine, or a production server, may not. Continuous Integration (CI) solves this by running tests in a fresh, reproducible environment on every push.

**CI (Continuous Integration):** The practice of merging developer changes frequently and verifying each merge with an automated build and test run. CI's value is: bugs are caught when the code is fresh in mind — not weeks later when nobody remembers why the change was made.

**GitHub Actions:** GitHub's built-in CI system. You write YAML files in `.github/workflows/`. GitHub runs them on their hosted servers (Linux, macOS, or Windows virtual machines). Each VM starts fresh for every run — no state from previous runs.

**The alternative:** Jenkins (self-hosted), GitLab CI, CircleCI, Travis CI. They all do the same thing: run steps in a VM triggered by git events. The YAML syntax differs; the concept is the same.

---

### 2. Write the workflow

Create `.github/workflows/tests.yml`:

```yaml
name: Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  backend-tests:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_USER: devuser
          POSTGRES_PASSWORD: devpassword
          POSTGRES_DB: workorders_test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'

      - name: Install backend dependencies
        run: |
          cd fullstack-project/backend
          pip install -r requirements.txt

      - name: Run backend tests
        env:
          TEST_DATABASE_URL: postgresql://devuser:devpassword@localhost:5432/workorders_test
        run: |
          cd fullstack-project/backend
          pytest tests/ -v

  frontend-tests:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: fullstack-project/frontend/package-lock.json

      - name: Install frontend dependencies
        run: |
          cd fullstack-project/frontend
          npm ci

      - name: Run frontend tests
        run: |
          cd fullstack-project/frontend
          npm run test:run
```

Push this file to GitHub:

```
git add .github/workflows/tests.yml
git commit -m "Add GitHub Actions CI: run backend pytest and frontend Vitest on push to main"
git push origin main
```

Go to the repository on GitHub → Actions tab. Watch both jobs run.

---

### 3. Read the workflow YAML

**Walkthrough — the trigger:**

```yaml
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
```

`on:` — the event that triggers this workflow. Two events are listed:
- `push.branches: [main]` — triggers when code is pushed directly to `main`
- `pull_request.branches: [main]` — triggers when a pull request targeting `main` is opened or updated

Pull request triggers are the most useful: they run tests on proposed changes before they merge. If the tests fail, the merge button turns red — the PR is blocked until the tests pass (if branch protection is configured).

**Walkthrough — the Postgres service:**

```yaml
services:
  postgres:
    image: postgres:15
    env:
      POSTGRES_USER: devuser
      POSTGRES_PASSWORD: devpassword
      POSTGRES_DB: workorders_test
    ports:
      - 5432:5432
    options: >-
      --health-cmd pg_isready
      --health-interval 10s
      --health-timeout 5s
      --health-retries 5
```

`services:` — Docker containers that run alongside the job. GitHub Actions starts the `postgres` container before running any steps. It runs in the same Docker network as the job, accessible at `localhost:5432` from inside the job.

`image: postgres:15` — uses the official PostgreSQL 15 Docker image.

`env:` — environment variables passed to the container. These are the same variables you set in `docker-compose.yml` locally. The `POSTGRES_DB: workorders_test` creates the test database automatically.

`options: --health-cmd pg_isready` — waits until Postgres is ready before running steps. Without this, steps start immediately and the first step that connects to Postgres fails (the container is starting but not yet accepting connections). `pg_isready` is a built-in Postgres utility that returns exit code 0 when Postgres is ready.

`>-` — YAML multiline folded scalar. Folds multiple lines into a single line with no trailing newline. The `--health-*` options appear as a single space-separated string.

**Walkthrough — steps:**

```yaml
steps:
  - name: Checkout code
    uses: actions/checkout@v4
```

`steps:` — an ordered list of operations. Steps run sequentially. If any step fails (non-zero exit code), the remaining steps are skipped and the job fails.

`name:` — a label displayed in the GitHub Actions UI. Choose descriptive names — they appear in the job log.

`uses: actions/checkout@v4` — uses a pre-built action (a reusable step package). `actions/checkout@v4` is maintained by GitHub; it clones your repository into the VM. Without this step, the VM has no code.

`@v4` — the version pin. Actions are versioned. Pinning to a major version (`@v4`) means you get patch and minor updates automatically but not breaking changes.

```yaml
- name: Set up Python
  uses: actions/setup-python@v5
  with:
    python-version: '3.11'
```

`uses: actions/setup-python@v5` — installs the specified Python version on the VM. GitHub's hosted runners (ubuntu-latest) include multiple Python versions, but this ensures the right one is active.

`with:` — parameters passed to the action. `python-version: '3.11'` specifies Python 3.11.

```yaml
- name: Install backend dependencies
  run: |
    cd fullstack-project/backend
    pip install -r requirements.txt
```

`run: |` — runs shell commands. The `|` is YAML's "literal block scalar" — each line is a separate command. `cd fullstack-project/backend` changes directory, then `pip install -r requirements.txt` installs your Python dependencies. No virtual environment needed in CI — each job runs in an isolated VM.

```yaml
- name: Run backend tests
  env:
    TEST_DATABASE_URL: postgresql://devuser:devpassword@localhost:5432/workorders_test
  run: |
    cd fullstack-project/backend
    pytest tests/ -v
```

`env:` — environment variables available for this step. `TEST_DATABASE_URL` overrides the value hardcoded in `conftest.py` (if you update `conftest.py` to read from `os.environ.get("TEST_DATABASE_URL", "postgresql://...")`). This is good practice: the CI database URL is set by CI, not by application code.

**CS lens — jobs run in parallel by default.** `backend-tests` and `frontend-tests` are separate jobs. GitHub Actions runs them simultaneously (if runner capacity is available). The total CI time is `max(backend_time, frontend_time)`, not `backend_time + frontend_time`. This matters as test suites grow: splitting into parallel jobs keeps CI fast. If `frontend-tests` depends on `backend-tests`, use `needs: backend-tests` — but in this case they are independent.

**SE lens — `npm ci` not `npm install`.** The frontend install step uses `npm ci` (Clean Install), not `npm install`. The difference:

- `npm install` updates `package-lock.json` if it's out of sync. If someone pushed code without updating the lockfile, `npm install` installs different versions than tested locally — a reproducibility failure.
- `npm ci` reads `package-lock.json` exactly. If `package.json` and `package-lock.json` are out of sync, `npm ci` fails loudly. This enforces reproducibility: CI installs exactly what the developer tested.

Always use `npm ci` in CI pipelines.

**What breaks without this:** If the Postgres service health check is omitted, the `pytest` step starts before Postgres accepts connections. The first test that tries to connect fails with "connection refused." The rest of the tests fail in a cascade. The health check serialises startup: tests wait until Postgres is ready.

---

### 4. Add branch protection

**The problem:** A CI workflow that runs tests is only useful if failing tests block merges. Without branch protection, you can merge code that breaks the test suite.

On GitHub:
1. Repository → Settings → Branches → Add branch protection rule
2. Branch name pattern: `main`
3. Enable "Require status checks to pass before merging"
4. Search for your workflow jobs: `backend-tests` and `frontend-tests` — add both
5. Enable "Require branches to be up to date before merging"
6. Save changes

Now, attempting to push broken code to `main` still works (branch protection applies to pull requests and the merge button, not direct pushes — for that, add "Include administrators"). But for team workflow: all changes go through pull requests, and the merge button is blocked until both CI jobs pass.

**Walkthrough:**

After setting up branch protection, the PR workflow becomes:

1. Push to a feature branch
2. Open a pull request targeting `main`
3. GitHub Actions runs `backend-tests` and `frontend-tests`
4. If tests pass: the merge button is green
5. If tests fail: the merge button shows "X required status checks have not passed yet" and merging is blocked

This workflow is called **protected-trunk development**: the `main` branch is always in a known-working state. Every merge has been validated by the test suite.

**CS lens — CI as a formal verification gate.** Branch protection makes CI a hard gate, not advisory. Commit hooks (pre-commit, pre-push) are advisory — developers can skip them with `--no-verify`. CI on a protected branch cannot be bypassed without admin access. This creates a formal property about the `main` branch: every commit on `main` passed the test suite at the time it was merged. This is a weaker property than formal verification (tests do not prove correctness — only that specific cases pass), but it is practically achievable and catches the majority of regressions.

**SE lens — green main as a deployment invariant.** The test suite as a branch protection rule establishes an invariant: `main` is deployable. This is the prerequisite for Continuous Deployment (CD): if main is always deployable, you can deploy it to production automatically after every merge. Sprint 8 adds deployment — the CI from this lesson is the prerequisite for that CD pipeline.

---

### 5. Read a CI failure

**The problem:** The first time CI runs, it will probably fail. Reading the failure quickly is essential.

To see a failure deliberately: push a test that you know fails (change an assertion temporarily). The Actions tab shows:

```
❌ backend-tests    1m 23s
✅ frontend-tests   0m 47s
```

Click `backend-tests` to expand. Click the failing step (`Run backend tests`). The log shows the exact `pytest` output you would see locally:

```
FAILED tests/test_orders.py::test_create_order_returns_201_with_id - AssertionError: assert 422 == 201
```

The CI log is the same output as your terminal — it just runs in GitHub's VM. Everything you learned about reading test failures in Lesson 1 applies here.

**When CI fails but tests pass locally:**

1. **Different Python/Node versions:** Check `python-version` and `node-version` in the YAML match your local versions.
2. **Missing dependency in `requirements.txt`:** If you `pip install` something locally but forget `pip freeze > requirements.txt`, it works locally but not in CI (the VM only has what `requirements.txt` lists).
3. **Test database not available:** Check the Postgres service health check logs. Click the "Set up postgres" step in the job log.
4. **Environment variable missing:** If your code reads `os.environ["SECRET_KEY"]` and the variable is not set in CI, it raises `KeyError`. Add the variable to the `env:` block of the affected step.

**CS lens — hermetic builds.** A hermetic build is one that depends only on its explicit inputs: the code, the declared dependencies, the environment variables listed in CI. No implicit dependencies (local state, installed tools, environment-specific config). The goal of `pip install -r requirements.txt` and `npm ci` is hermeticity: the CI build succeeds for exactly the dependencies you declared, not the ones you happen to have installed locally. When CI fails but local tests pass, the cause is almost always a hermetic violation — an undeclared dependency.

---

## Connect the pieces

You now have a full test automation pipeline:
- Backend tests run against a real Postgres database (not mocked)
- Frontend tests run with MSW intercepting network calls (no running server needed)
- Both run on every push and pull request to `main`
- Branch protection blocks merges when tests fail
- `main` is always in a known-working state

Sprint 6 adds security: SQL injection prevention, IDOR checks, XSS/CORS headers, and rate limiting.

---

## What breaks without this

**Forgetting `npm ci` and using `npm install`:** Npm install may resolve different package versions than what was tested locally. A package that works on version 1.2.3 locally may break on 1.3.0 in CI (if the lock file was not committed). Fix: always commit `package-lock.json` and use `npm ci` in CI.

**No `--health-cmd` on the Postgres service:** Steps start before Postgres is ready, database connections fail, tests fail. Fix: always add health checks to service containers.

---

## Definition of done

- [ ] `.github/workflows/tests.yml` exists and is committed
- [ ] Pushing to `main` triggers both `backend-tests` and `frontend-tests` in the Actions tab
- [ ] Both jobs pass (green checkmarks)
- [ ] Branch protection requires both checks to pass before merging a PR
- [ ] You can find and read the log output of a failing step in the Actions UI
- [ ] You can explain what `npm ci` does differently from `npm install` and why it matters in CI
- [ ] You can explain what the Postgres service health check does and why it is necessary

**Git commit:**

```
git add .github/workflows/tests.yml
git commit -m "Add GitHub Actions workflow: run pytest and Vitest on push, with Postgres service container"
```
