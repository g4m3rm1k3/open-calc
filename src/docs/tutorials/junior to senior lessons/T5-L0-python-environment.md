# Junior to Senior — T5·L0 — Python Environment and Configuration

**Prerequisites:** T4·L10 (Applying Patterns to the Domain). You have a complete
domain model in TypeScript. This lesson starts Topic 5 by setting up Python —
the backend language — with proper environment isolation and configuration management.

**What this lab adds:**
- Virtual environments: why every Python project needs one
- `pyproject.toml`: the modern way to declare dependencies
- `.env` files: secrets and environment-specific config
- `python-dotenv`: loading `.env` into `os.environ`
- Pydantic `BaseSettings`: typed, validated config from environment variables

**Time:** 45–60 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. Two Python projects on the same machine need different versions of the same
>    library. What is the problem and how is it solved?
> 2. A `.env` file contains `DATABASE_URL=postgresql://user:pass@localhost/db`.
>    Should this file be committed to git?
> 3. Your app reads `os.environ["PORT"]` and crashes with `KeyError` when `PORT`
>    is not set. What is a better pattern?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

A Python project with proper isolation and typed configuration:

```bash
$ python main.py
Config loaded:
  app_name:     Task Manager API
  port:         8000
  debug:        False
  database_url: sqlite:///./tasks.db

$ python main.py  # with PORT=9000 in .env
Config loaded:
  port: 9000
```

---

### Concept: Virtual Environments

**What it is:** A virtual environment is an isolated Python installation.
It has its own `python`, `pip`, and installed packages — separate from every
other project and from the system Python.

**Why needed:** Without a virtual environment, all Python projects share the
same package installation. If project A needs `requests==2.28` and project B
needs `requests==2.31`, one of them breaks. Virtual environments give each
project its own space.

```bash
# Create a virtual environment in .venv:
python -m venv .venv

# Activate it (Windows PowerShell):
.venv\Scripts\Activate.ps1

# Activate it (Mac/Linux):
source .venv/bin/activate

# Verify:
which python   # → .venv/bin/python (Mac/Linux)
where python   # → .venv\Scripts\python.exe (Windows)
```

**What it hides:** Once activated, `python` and `pip` refer to the virtual
environment's versions. Installing packages with `pip install X` installs to
the virtual environment only — not globally.

**The `.gitignore` rule:** The virtual environment directory (`.venv`, `env`)
must be in `.gitignore`. It is large (thousands of files), platform-specific,
and can be recreated from the dependency file.

---

### Concept: `pyproject.toml`

**What it is:** The modern Python packaging standard (PEP 517/518). Replaces
`setup.py` and partially replaces `requirements.txt`.

```toml
[project]
name = "task-api"
version = "0.1.0"
requires-python = ">=3.12"
dependencies = [
    "fastapi>=0.115",
    "pydantic>=2.0",
    "pydantic-settings>=2.0",
    "uvicorn[standard]>=0.30",
    "sqlalchemy[asyncio]>=2.0",
    "python-dotenv>=1.0",
]

[project.optional-dependencies]
dev = [
    "pytest>=8.0",
    "httpx>=0.27",
    "pytest-asyncio>=0.23",
]
```

Install all dependencies:
```bash
pip install -e ".[dev]"  # -e = editable; installs dev extras too
```

**`requirements.txt` vs `pyproject.toml`:**

| `requirements.txt` | `pyproject.toml` |
|---|---|
| Simple list of packages + versions | Full project metadata |
| Generated with `pip freeze` | Edited by hand (or by tools like `poetry`) |
| No distinction between direct and transitive deps | Only direct dependencies listed |
| Still common for deployment | Modern standard for new projects |

---

### Concept: `.env` File and `python-dotenv`

**What it is:** A `.env` file stores environment variables as `KEY=VALUE` pairs.
`python-dotenv` loads them into `os.environ` at startup. This keeps secrets out of
source code.

```bash
# .env (never commit this file)
DATABASE_URL=sqlite:///./tasks.db
SECRET_KEY=dev-secret-key-change-in-production
DEBUG=false
PORT=8000
APP_NAME=Task Manager API
```

```python
# Loading manually:
from dotenv import load_dotenv
import os

load_dotenv()  # reads .env, sets os.environ

database_url = os.environ.get("DATABASE_URL", "sqlite:///./default.db")
port         = int(os.environ.get("PORT", "8000"))
```

**The problem with `os.environ.get`:** Every access requires a manual type cast.
If `PORT` is not set, you get `None` or a default string — easy to forget the
`int()` cast. If a required variable is missing, you get `None` silently.

---

### Concept: Pydantic `BaseSettings`

**What it is:** `pydantic-settings` reads environment variables and validates
them using Pydantic. Each field is automatically type-cast and validated.
Missing required fields raise a clear error at startup.

```python
from pydantic_settings import BaseSettings, SettingsConfigDict

class Config(BaseSettings):
    model_config = SettingsConfigDict(
        env_file='.env',
        env_file_encoding='utf-8',
    )

    app_name:     str  = 'Task Manager API'
    port:         int  = 8000
    debug:        bool = False
    database_url: str  # required — no default; missing raises ValidationError

# Usage:
config = Config()
print(config.port)         # int — auto-cast from "8000"
print(config.debug)        # bool — auto-cast from "false" → False
print(config.database_url) # str — must be set in .env or env var
```

**What it hides:** Pydantic Settings handles all type casting (str → int, str → bool,
str → list, etc.), all default values, and all validation. If `PORT=not-a-number`,
it raises a clear `ValidationError` at startup — before the server accepts any requests.

---

## Step 1 — Set Up the Python Project

Create a new directory for Topic 5:

```bash
mkdir task-api
cd task-api
python -m venv .venv
```

Activate the virtual environment:
- Windows PowerShell: `.venv\Scripts\Activate.ps1`
- Mac/Linux: `source .venv/bin/activate`

Create `pyproject.toml`:

```toml
[project]
name = "task-api"
version = "0.1.0"
requires-python = ">=3.12"
dependencies = [
    "fastapi>=0.115",
    "pydantic>=2.0",
    "pydantic-settings>=2.0",
    "uvicorn[standard]>=0.30",
    "sqlalchemy[asyncio]>=2.0",
    "aiosqlite>=0.20",
    "python-dotenv>=1.0",
    "python-jose[cryptography]>=3.3",
    "passlib[bcrypt]>=1.7",
]

[project.optional-dependencies]
dev = [
    "pytest>=8.0",
    "httpx>=0.27",
    "pytest-asyncio>=0.23",
    "pytest-cov>=5.0",
]

[tool.pytest.ini_options]
asyncio_mode = "auto"
```

Install:
```bash
pip install -e ".[dev]"
```

Create `.env`:
```
DATABASE_URL=sqlite+aiosqlite:///./tasks.db
SECRET_KEY=dev-secret-key-change-in-production
DEBUG=false
PORT=8000
APP_NAME=Task Manager API
```

Create `.gitignore`:
```
.venv/
__pycache__/
*.pyc
.env
*.db
dist/
.pytest_cache/
```

---

## Step 2 — Typed Configuration

Create `src/config.py`:

```python
from pydantic_settings import BaseSettings, SettingsConfigDict


class Config(BaseSettings):
    model_config = SettingsConfigDict(
        env_file='.env',
        env_file_encoding='utf-8',
        extra='ignore',         # ignore unknown env vars
    )

    app_name:     str  = 'Task Manager API'
    port:         int  = 8000
    debug:        bool = False
    database_url: str  = 'sqlite+aiosqlite:///./tasks.db'
    secret_key:   str  = 'change-me-in-production'


# Module-level singleton — import this everywhere:
config = Config()
```

Create `main.py`:

```python
from src.config import config

def main() -> None:
    print('Config loaded:')
    print(f'  app_name:     {config.app_name}')
    print(f'  port:         {config.port}')
    print(f'  debug:        {config.debug}')
    print(f'  database_url: {config.database_url}')

if __name__ == '__main__':
    main()
```

### SAVE AND TRY

```bash
python main.py
```

Expected:
```
Config loaded:
  app_name:     Task Manager API
  port:         8000
  debug:        False
  database_url: sqlite+aiosqlite:///./tasks.db
```

**Change something:** Edit `.env` and set `PORT=9000`. Run again.
Expected: `port: 9000`. The type is `int` — no manual cast required.

**Change something:** Set `DEBUG=true` in `.env`. Run again.
Expected: `debug: True`. Pydantic converts `"true"` → `True` automatically.

---

## Step 3 — Write Configuration Tests

Create `tests/test_config.py`:

```python
import pytest
from pydantic import ValidationError


def test_config_loads_defaults() -> None:
    """Config has expected defaults when no env vars are set."""
    import os
    from unittest.mock import patch

    # Remove .env influence — test pure defaults:
    with patch.dict(os.environ, {}, clear=True):
        # Import fresh Config (not the module singleton):
        from pydantic_settings import BaseSettings, SettingsConfigDict

        class TestConfig(BaseSettings):
            model_config = SettingsConfigDict(env_file=None)
            port: int = 8000

        cfg = TestConfig()
        assert cfg.port == 8000


def test_config_reads_from_environment() -> None:
    """Config reads PORT from environment and converts to int."""
    import os
    from unittest.mock import patch
    from pydantic_settings import BaseSettings, SettingsConfigDict

    with patch.dict(os.environ, {'PORT': '9000'}, clear=False):
        class TestConfig(BaseSettings):
            model_config = SettingsConfigDict(env_file=None)
            port: int = 8000

        cfg = TestConfig()
        assert cfg.port == 9000


def test_config_rejects_invalid_port() -> None:
    """Config raises ValidationError when PORT is not a number."""
    import os
    from unittest.mock import patch
    from pydantic_settings import BaseSettings, SettingsConfigDict

    with patch.dict(os.environ, {'PORT': 'not-a-number'}):
        class TestConfig(BaseSettings):
            model_config = SettingsConfigDict(env_file=None)
            port: int

        with pytest.raises(ValidationError):
            TestConfig()
```

Run the tests:

```bash
pytest tests/ -v
```

Expected:
```
tests/test_config.py::test_config_loads_defaults PASSED
tests/test_config.py::test_config_reads_from_environment PASSED
tests/test_config.py::test_config_rejects_invalid_port PASSED

3 passed
```

---

## 🎯 Challenge: Add a `DatabaseConfig` Nested Model

**You know:** Pydantic `BaseSettings`, nested models, field validation.

**Task:** The `DATABASE_URL` encodes host, port, name, and credentials.
Build a `DatabaseConfig` Pydantic model that breaks the URL into parts and
validates each:

```python
# These env vars:
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=tasks
# DB_USER=admin
# DB_PASS=secret

class DatabaseConfig(BaseSettings):
    host: str = 'localhost'
    port: int = 5432
    name: str = 'tasks'
    user: str = 'admin'
    password: str

    @property
    def url(self) -> str:
        return f'postgresql+asyncpg://{self.user}:{self.password}@{self.host}:{self.port}/{self.name}'
```

Requirements:
- `port` must be between 1 and 65535
- `name` must not be empty
- `password` is required (no default)
- Write two pytest tests: one that succeeds, one that validates the port range

Try for at least 10 minutes before revealing the solution.

---

<details>
<summary>▶ Show Solution</summary>

```python
from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class DatabaseConfig(BaseSettings):
    model_config = SettingsConfigDict(env_prefix='DB_', env_file='.env')

    host:     str = 'localhost'
    port:     int = Field(default=5432, ge=1, le=65535)
    name:     str = Field(default='tasks', min_length=1)
    user:     str = 'admin'
    password: str  # required

    @property
    def url(self) -> str:
        return (
            f'postgresql+asyncpg://{self.user}:{self.password}'
            f'@{self.host}:{self.port}/{self.name}'
        )
```

```python
# tests/test_database_config.py
import os
import pytest
from unittest.mock import patch
from pydantic import ValidationError


def test_database_config_builds_correct_url() -> None:
    with patch.dict(os.environ, {'DB_PASSWORD': 'secret'}, clear=False):
        from your_module import DatabaseConfig
        cfg = DatabaseConfig()
        assert 'localhost' in cfg.url
        assert '5432' in cfg.url


def test_database_config_rejects_port_out_of_range() -> None:
    with patch.dict(os.environ, {'DB_PASSWORD': 'secret', 'DB_PORT': '99999'}):
        from your_module import DatabaseConfig
        with pytest.raises(ValidationError):
            DatabaseConfig()
```

**Key insight:** `env_prefix='DB_'` tells Pydantic Settings to read `DB_HOST`,
`DB_PORT`, `DB_NAME`, etc. — avoiding conflicts with other `HOST` or `PORT` env vars.
The `@property` builds the connection URL from parts — if any part is wrong
(e.g., port 99999), Pydantic catches it at construction time.

</details>

---

## Final Check

| What to verify | How to verify | Expected result |
|---|---|---|
| Virtual environment active | `which python` (Mac/Linux) or `where python` (Windows) | Points to `.venv` |
| Dependencies installed | `pip list` | fastapi, pydantic-settings, etc. present |
| Config reads `.env` | Change `PORT=9000` in `.env`, run `main.py` | `port: 9000` |
| Type casting | Set `DEBUG=true`, run | `debug: True` (not string `'true'`) |
| Tests pass | `pytest tests/` | 3 passed |

---

## Quick Check Answers

**1. Two projects need different versions of the same library. Problem and solution?**

Python has one global package installation by default. If you install `requests==2.31`
for project B, it overwrites `requests==2.28` for project A, which may break.
The solution: virtual environments. Each project has its own `.venv` directory with
its own isolated package installation. Activating a project's virtual environment
uses only that project's packages.

**2. `.env` contains `DATABASE_URL=postgresql://user:pass@localhost/db`. Commit to git?**

No — never. The `.env` file contains credentials. Once committed to git, those
credentials are in the git history forever — even if the file is later deleted.
Anyone with access to the repository can see the credentials. Add `.env` to `.gitignore`.
Document the required environment variables in a `.env.example` file with placeholder
values (e.g., `DATABASE_URL=postgresql://user:password@localhost/dbname`).

**3. `os.environ["PORT"]` crashes with `KeyError`. Better pattern?**

Several options, best to worst:
1. **Pydantic `BaseSettings`** (best): typed, validated, raises a clear `ValidationError`
   with the field name and constraint at startup.
2. `os.environ.get("PORT", "8000")` + `int(...)`: provides a default but no validation —
   still crashes if `PORT=not-a-number`.
3. Try/catch every access: verbose, error-prone.

Use Pydantic `BaseSettings` — it validates all configuration at startup, before
the server accepts any requests, with a clear error message for every missing or
invalid field.
