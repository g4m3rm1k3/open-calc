# Drill 9.3 — CI/CD Pipelines: From Push to Production

**Standalone drill. Prerequisite: GitHub account, basic git.**
**Time estimate:** 75–90 minutes
**Environment:** GitHub Actions (free), Python 3.11, Docker
**What you will build:** A complete CI/CD pipeline with three stages: test (lint + unit tests + coverage), build (Docker image), and deploy (with approval gate). The pipeline prevents merging code with failing tests or coverage below 80%.
**What you will understand:** What CI and CD mean as system properties (not just tools), what a pipeline stage is, how artifacts flow between stages, and what a deployment gate is.

---

## Quick Check

Answer these before starting. Answers at the bottom.

1. "Continuous Integration" means automatically testing every commit. "Continuous Deployment" means automatically deploying every passing commit. What is "Continuous Delivery" and how does it differ from CD?

2. Your CI pipeline runs 200 tests in 20 minutes. Why might you want to parallelize tests? What are the tradeoffs?

3. A developer merges a PR, the CI pipeline passes, and the deploy job starts. The deploy job needs to push a Docker image to a registry and update a Kubernetes deployment. Where do the registry credentials go? What is WRONG about putting them in the `.github/workflows/` YAML file?

4. A pipeline has jobs: test → build → deploy. Test takes 5 minutes, build takes 10 minutes, deploy takes 2 minutes. A critical bug is in production. What is the minimum time to get a fix deployed? What's the actual bottleneck?

*(Answers at the bottom.)*

---

## The Concept: CI/CD Pipelines

### Concept: Automated Quality Gates

**What it is:**
CI/CD (Continuous Integration / Continuous Deployment) is the practice of automatically running tests, building artifacts, and deploying software on every code change. The "pipeline" is the sequence of jobs that run: lint → test → build → stage → deploy. Each job is a quality gate — failure stops the pipeline.

**Continuous Integration:**
CI solves the "integration hell" problem: developers working on separate branches for weeks accumulate changes that conflict massively when merged. CI requires frequent merges (at least daily) and automated validation of every merge. The key property: if you break the build, everyone knows immediately, and the rule is "fix it before anything else."

**The pipeline as a quality gate system:**
```
Push to branch
  → Lint (formatting, type checks)
    → fail: PR can't be merged
  → Tests (unit, integration)
    → fail: PR can't be merged
  → Coverage check
    → fail: PR can't be merged
  → Build artifact (Docker image)
    → fail: no deployable artifact
  → Deploy to staging
    → manual approval
  → Deploy to production
```

Each stage produces artifacts (test reports, Docker images) or blocks progress. The system property: no code reaches production without passing all gates.

**GitHub Actions mechanics:**
- `.github/workflows/*.yml` defines workflows
- A workflow triggers on events: `push`, `pull_request`, `schedule`, manual `workflow_dispatch`
- A workflow has jobs; each job runs on a fresh virtual machine (runner)
- Jobs run in parallel by default; `needs:` makes them sequential
- Steps within a job are sequential shell commands
- `actions/checkout`, `actions/setup-python` are pre-built action modules
- Secrets (API keys, passwords) are stored in GitHub Settings → Secrets, accessed via `${{ secrets.MY_SECRET }}`

**Artifacts between jobs:**
Jobs run on separate machines and don't share filesystem state. To pass data between jobs: `actions/upload-artifact` (upload from job 1), `actions/download-artifact` (download in job 2). Or use a Docker registry to push/pull images between build and deploy jobs.

**Constraints:**
- GitHub Actions free tier: 2000 minutes/month for private repos; unlimited for public repos
- Runners are ephemeral: each job starts a fresh VM — no shared state between jobs except explicit artifact upload
- Secrets are masked in logs — you can't accidentally print them
- Maximum workflow duration: 6 hours per job, 72 hours total

**Tradeoffs:**
- Speed vs thoroughness: running more tests catches more bugs but takes longer. Set a max acceptable pipeline time (often 10-15 minutes) and optimize to stay under it.
- Parallelism vs isolation: parallel test jobs speed up CI but require tests to be truly independent (no shared databases, no shared file state).
- Automatic vs manual deploy: automatic deploy to production is faster but riskier. Use it for low-risk services; require manual approval for production.

**Failure modes:**
- Flaky tests: tests that sometimes pass, sometimes fail, unrelated to code changes. They erode trust in the pipeline. Fix or delete them.
- Secrets in code: hardcoded credentials committed to the repo are exposed in the git history forever. Use GitHub Secrets.
- Pipeline too slow: >15 minutes is too long — developers work around it. Profile and parallelize.
- No rollback: deploying without a rollback strategy. If deploy fails, the service is broken until a new deploy. Use blue-green or canary deployments.

**Operational reality:**
GitHub Actions, GitLab CI, CircleCI, and Jenkins are all implementations of the same concept: event-driven pipeline execution. The YAML syntax differs; the concepts don't. Every company with more than a few engineers has CI/CD. "Does it have tests?" and "does it have a pipeline?" are standard PR review questions.

**You will see this again in:**
FastAPI project deployment, Kubernetes GitOps (ArgoCD, FluxCD), Docker Hub automated builds, automated NPM package publishing, infrastructure-as-code validation (terraform plan in CI).

**Watch for:**
The difference between a **pipeline** (the configuration) and a **run** (an execution of the pipeline). When a pipeline "fails," a specific run failed on a specific commit. The pipeline itself is fine. Clear language helps when debugging: "the run for PR #42 failed at the test stage because X."

---

## Step 1 — The Project to Test

Create a small Python project to build the pipeline around:

```
fastapi-ci-demo/
  app/
    __init__.py
    main.py
    calculator.py
  tests/
    __init__.py
    test_calculator.py
    test_api.py
  requirements.txt
  requirements-dev.txt
  Dockerfile
  .github/
    workflows/
      ci.yml
      cd.yml
```

Create `app/calculator.py`:

```python
# calculator.py — business logic to test
def add(a: float, b: float) -> float:
    return a + b

def divide(a: float, b: float) -> float:
    if b == 0:
        raise ValueError("Cannot divide by zero")
    return a / b

def is_positive(n: float) -> bool:
    return n > 0

def fibonacci(n: int) -> int:
    if n < 0:
        raise ValueError("n must be non-negative")
    if n <= 1:
        return n
    a, b = 0, 1
    for _ in range(n - 1):
        a, b = b, a + b
    return b
```

Create `app/main.py`:

```python
from fastapi import FastAPI, HTTPException
from app.calculator import add, divide, fibonacci

app = FastAPI(title="CI Demo API")

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/add")
def api_add(a: float, b: float):
    return {"result": add(a, b)}

@app.get("/divide")
def api_divide(a: float, b: float):
    try:
        return {"result": divide(a, b)}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/fibonacci/{n}")
def api_fibonacci(n: int):
    if n > 100:
        raise HTTPException(status_code=400, detail="n must be <= 100")
    return {"n": n, "result": fibonacci(n)}
```

Create `tests/test_calculator.py`:

```python
import pytest
from app.calculator import add, divide, is_positive, fibonacci

def test_add():
    assert add(2, 3) == 5
    assert add(-1, 1) == 0
    assert add(0.1, 0.2) == pytest.approx(0.3)

def test_divide():
    assert divide(10, 2) == 5.0
    assert divide(1, 3) == pytest.approx(0.333, rel=1e-3)

def test_divide_by_zero():
    with pytest.raises(ValueError, match="Cannot divide by zero"):
        divide(5, 0)

def test_is_positive():
    assert is_positive(1) is True
    assert is_positive(0) is False
    assert is_positive(-1) is False

def test_fibonacci():
    assert fibonacci(0) == 0
    assert fibonacci(1) == 1
    assert fibonacci(10) == 55

def test_fibonacci_negative():
    with pytest.raises(ValueError):
        fibonacci(-1)
```

Create `tests/test_api.py`:

```python
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

def test_add():
    response = client.get("/add?a=5&b=3")
    assert response.status_code == 200
    assert response.json() == {"result": 8.0}

def test_divide():
    response = client.get("/divide?a=10&b=2")
    assert response.status_code == 200
    assert response.json() == {"result": 5.0}

def test_divide_by_zero():
    response = client.get("/divide?a=10&b=0")
    assert response.status_code == 400

def test_fibonacci():
    response = client.get("/fibonacci/10")
    assert response.status_code == 200
    assert response.json()["result"] == 55

def test_fibonacci_too_large():
    response = client.get("/fibonacci/101")
    assert response.status_code == 400
```

Create `requirements.txt`:
```
fastapi==0.104.1
uvicorn==0.24.0
pydantic==2.5.0
```

Create `requirements-dev.txt`:
```
-r requirements.txt
pytest==7.4.3
pytest-cov==4.1.0
httpx==0.25.2
ruff==0.1.6
```

---

## Step 2 — CI Workflow

Create `.github/workflows/ci.yml`:

```yaml
# .github/workflows/ci.yml
# Runs on every push and pull request
name: CI

on:
  push:
    branches: ["main", "develop"]
  pull_request:
    branches: ["main"]

jobs:
  # ── Job 1: Lint ──────────────────────────────────────────────────────────
  lint:
    name: Lint
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: "3.11"
          cache: "pip"
      
      - name: Install linting tools
        run: pip install ruff
      
      - name: Run ruff (format check)
        run: ruff check app/ tests/
      
      - name: Run ruff (import sort check)
        run: ruff check --select I app/ tests/

  # ── Job 2: Test ───────────────────────────────────────────────────────────
  test:
    name: Test (Python ${{ matrix.python-version }})
    runs-on: ubuntu-latest
    needs: lint
    strategy:
      matrix:
        python-version: ["3.10", "3.11", "3.12"]  # test on multiple versions
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Set up Python ${{ matrix.python-version }}
        uses: actions/setup-python@v4
        with:
          python-version: ${{ matrix.python-version }}
          cache: "pip"
      
      - name: Install dependencies
        run: pip install -r requirements-dev.txt
      
      - name: Run tests with coverage
        run: |
          pytest tests/ \
            --cov=app \
            --cov-report=xml \
            --cov-report=term-missing \
            --cov-fail-under=80 \
            -v
      
      - name: Upload coverage report
        uses: actions/upload-artifact@v3
        if: matrix.python-version == '3.11'  # only upload once
        with:
          name: coverage-report
          path: coverage.xml

  # ── Job 3: Build Docker image ─────────────────────────────────────────────
  build:
    name: Build Docker Image
    runs-on: ubuntu-latest
    needs: test
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3
      
      - name: Build image (no push — just verify it builds)
        uses: docker/build-push-action@v5
        with:
          context: .
          push: false
          tags: fastapi-ci-demo:${{ github.sha }}
          cache-from: type=gha  # GitHub Actions cache for Docker layers
          cache-to: type=gha,mode=max
      
      - name: Export image as artifact
        run: |
          docker save fastapi-ci-demo:${{ github.sha }} | gzip > image.tar.gz
      
      - name: Upload image artifact
        uses: actions/upload-artifact@v3
        with:
          name: docker-image
          path: image.tar.gz
          retention-days: 7
```

### SAVE AND TRY

Push this to a GitHub repository:

```bash
git add .
git commit -m "Add CI pipeline"
git push origin main
```

Go to GitHub → Actions tab. You'll see:
- `lint` job runs first
- `test` job runs for Python 3.10, 3.11, 3.12 in parallel (all wait for lint)
- `build` job runs after ALL test jobs pass

**Demonstrate a pipeline failure:**
Break a test intentionally:
```bash
# In test_calculator.py, change:
assert fibonacci(10) == 55
# to:
assert fibonacci(10) == 99  # wrong answer
```

Push. The `test` job fails. `build` does not run. The PR shows a red X — cannot be merged.

Fix the test and push. The pipeline goes green.

---

## Step 3 — CD Workflow with Approval Gate

Create `.github/workflows/cd.yml`:

```yaml
# .github/workflows/cd.yml
# Deploys to staging automatically, production requires manual approval
name: CD

on:
  push:
    branches: ["main"]  # only deploy from main

jobs:
  # ── Deploy to Staging ─────────────────────────────────────────────────────
  deploy-staging:
    name: Deploy to Staging
    runs-on: ubuntu-latest
    environment: staging  # uses staging secrets
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3
      
      - name: Login to Docker Hub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}
      
      - name: Build and push to staging tag
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: |
            ${{ secrets.DOCKERHUB_USERNAME }}/fastapi-ci-demo:staging
            ${{ secrets.DOCKERHUB_USERNAME }}/fastapi-ci-demo:${{ github.sha }}
      
      - name: Deploy to staging server
        # In a real scenario, this would SSH into a staging server or update a Kubernetes manifest
        run: |
          echo "Deploying image to staging environment"
          echo "Image: ${{ secrets.DOCKERHUB_USERNAME }}/fastapi-ci-demo:staging"
          echo "Commit: ${{ github.sha }}"
          # Example: kubectl set image deployment/api api=$IMAGE_TAG
      
      - name: Smoke test staging
        run: |
          echo "Running smoke tests against staging..."
          sleep 5  # wait for deploy
          # curl https://staging.example.com/health
          echo "Staging smoke test passed"

  # ── Deploy to Production (requires approval) ──────────────────────────────
  deploy-production:
    name: Deploy to Production
    runs-on: ubuntu-latest
    needs: deploy-staging
    environment: production  # has "Required reviewers" configured in GitHub settings
    # The "environment: production" protection rule requires manual approval in GitHub UI
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Login to Docker Hub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}
      
      - name: Promote staging image to production tag
        run: |
          docker pull ${{ secrets.DOCKERHUB_USERNAME }}/fastapi-ci-demo:${{ github.sha }}
          docker tag \
            ${{ secrets.DOCKERHUB_USERNAME }}/fastapi-ci-demo:${{ github.sha }} \
            ${{ secrets.DOCKERHUB_USERNAME }}/fastapi-ci-demo:latest
          docker push ${{ secrets.DOCKERHUB_USERNAME }}/fastapi-ci-demo:latest
      
      - name: Deploy to production
        run: |
          echo "Deploying to production..."
          echo "Image: ${{ secrets.DOCKERHUB_USERNAME }}/fastapi-ci-demo:latest"
      
      - name: Create deployment annotation
        run: |
          echo "Production deployment complete"
          echo "Commit: ${{ github.sha }}"
          echo "Time: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
```

### SAVE AND TRY

To use the CD pipeline:
1. Go to GitHub repo → Settings → Environments
2. Create "staging" environment — no protection rules
3. Create "production" environment — add "Required reviewers" with your username
4. Add secrets to each environment: `DOCKERHUB_USERNAME`, `DOCKERHUB_TOKEN`

Push to main. The workflow:
1. Runs CI tests first (from ci.yml)
2. Deploys to staging automatically
3. Pauses at "Deploy to Production" — shows "Waiting for review" in GitHub UI
4. You approve in the UI → production deploys

The approval gate means: staging always gets code automatically (fast feedback), production requires a human decision (safety). This is Continuous Delivery — every commit is deployable, but deployment to production is a manual trigger.

---

## Challenge

**No solution provided. Requirements checklist only.**

Build a full pipeline for a Python package that runs tests, checks coverage, publishes to PyPI on tagged releases, and sends a Slack notification on failure.

**Requirements checklist:**

- [ ] `.github/workflows/test.yml` — runs on every push: lint (ruff), type check (mypy), tests (pytest), coverage (must be >= 80%), test results uploaded as artifact
- [ ] `.github/workflows/publish.yml` — runs only on `v*` tags (e.g., `v1.2.3`): builds the package (`python -m build`), uploads to PyPI using `PYPI_TOKEN` secret, creates a GitHub Release with changelog
- [ ] Test matrix: Python 3.10, 3.11, 3.12 on ubuntu, windows, and macos (9 combinations)
- [ ] Cache: `pip` packages cached with `actions/setup-python cache: pip` to speed up subsequent runs
- [ ] Failure notification: on any job failure, sends a Slack message via webhook: `"Pipeline failed for commit <sha> on branch <branch>: <job> failed"`
- [ ] Branch protection: `.github/branch-protection.json` documents the required status checks (this is informational since branch protection is set in GitHub UI)
- [ ] Dependency review: a job that uses `actions/dependency-review-action` to flag new dependencies with known CVEs

**Starter:**
```yaml
# .github/workflows/test.yml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
        python-version: ["3.10", "3.11", "3.12"]
    
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v4
        with:
          python-version: ${{ matrix.python-version }}
          cache: pip
      
      # TODO: install, lint, type-check, test with coverage
      
  notify-on-failure:
    if: failure()
    needs: [test]
    runs-on: ubuntu-latest
    steps:
      # TODO: send Slack notification
      # Hint: use curl to POST to ${{ secrets.SLACK_WEBHOOK_URL }}
      pass
```

**When you're done:**
```bash
git tag v1.0.0
git push origin v1.0.0
```
- Test matrix runs for all 9 OS/Python combinations
- Package is built and uploaded to PyPI
- GitHub Release is created with `v1.0.0` tag
- If any step fails, Slack receives a notification

**Stuck?** Ask AI: "In GitHub Actions, how do I trigger a job only when a git tag matching v* is pushed? And how do I send a Slack webhook notification only when a previous job fails? Show me the workflow YAML with the correct trigger syntax and the `if: failure()` condition."

---

## Quick Check Answers

**1. Continuous Delivery vs Continuous Deployment:**
Continuous Delivery: every commit that passes tests is in a state ready to deploy — but deployment to production requires a manual decision. The pipeline produces a deployable artifact and deploys to staging automatically; a human approves before production. Continuous Deployment: every commit that passes tests is automatically deployed to production with no manual step. Continuous Delivery is safer (human approval for production) and common in regulated industries. Continuous Deployment is faster and used when deployment risk is low (e.g., a website with instant rollback capability).

**2. Parallelizing tests — why and tradeoffs:**
Why: 200 tests in 20 minutes is too slow for a PR. If tests can run in parallel across 4 machines, 5 minutes is achievable. The tradeoff: (a) Setup cost — spinning up 4 runners has overhead (30-90 seconds each); for a 1-minute test suite, parallelism makes it slower. (b) Isolation requirement — parallel tests can't share state (a database, a file, a counter). Shared state causes flaky tests. Each shard needs its own database or test fixtures. (c) Cost — 4 machines × 5 minutes = 20 machine-minutes vs 1 machine × 20 minutes. Same cost, 4× faster.

**3. Where secrets go — not in YAML files:**
Secrets go in GitHub Settings → Secrets and Variables → Actions. They are accessed via `${{ secrets.MY_SECRET }}` in the YAML. They are never exposed in logs (GitHub masks them). WHAT IS WRONG with putting credentials in the YAML file: the file is committed to git. Anyone with read access to the repo sees the credentials. The credentials are in git history forever, even after deletion. GitHub Secrets are encrypted at rest, never visible after creation, and scoped to the repo or environment.

**4. Critical bug — minimum time to deploy:**
17 minutes (5 lint+test + 10 build + 2 deploy). The actual bottleneck is the build job (10 minutes). Optimization options: (a) parallelize build and test if they're independent; (b) use Docker layer caching to speed up builds; (c) add a "hotfix" pipeline that skips the full build and promotes the previous Docker image with a config change; (d) pre-build "golden" images that don't need full rebuild for code-only changes. The pipeline is a tradeoff: thoroughness vs speed. For critical bugs, you want a fast path.
