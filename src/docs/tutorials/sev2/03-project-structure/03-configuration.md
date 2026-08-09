# Tutorial 3: Configuration System

## Introduction

Every application needs configuration—database paths, debug flags, secret keys. This tutorial creates a configuration system that:
- Separates configuration from code
- Supports different environments (dev, test, production)
- Uses environment variables for secrets

---

## Part 1: Why Separate Configuration?

### 1.1 The Problem

Hardcoded values:
```python
# BAD: Hardcoded
DATABASE_PATH = "C:/Users/me/data/partflow.db"
SECRET_KEY = "super-secret-key-123"
DEBUG = True
```

Problems:
- Different paths on different machines
- Secrets exposed in code
- Debug mode in production

### 1.2 The Solution

External configuration:
- Environment variables for secrets
- Config files for defaults
- Different configs for different environments

---

## Part 2: Create Configuration Module

### 2.1 The Config Class

Create `src/partflow/config.py`:

```python
"""Application configuration for PartFlow.

Configuration is loaded from environment variables with sensible defaults.
Different environments (development, testing, production) have different defaults.
"""

import os
from pathlib import Path


class Config:
    """Base configuration with default values."""
    
    # Application
    APP_NAME = "PartFlow"
    DEBUG = False
    TESTING = False
    
    # Paths
    BASE_DIR = Path(__file__).parent.parent.parent  # project root
    DATA_DIR = BASE_DIR / "data"
    
    # Database
    DATABASE_PATH = DATA_DIR / "partflow.db"
    
    # Security
    SECRET_KEY = os.environ.get("SECRET_KEY", "dev-key-change-in-production")
    
    # Server
    HOST = "127.0.0.1"
    PORT = 5000


class DevelopmentConfig(Config):
    """Development environment configuration."""
    
    DEBUG = True
    
    # More verbose logging in development
    LOG_LEVEL = "DEBUG"


class TestingConfig(Config):
    """Testing environment configuration."""
    
    TESTING = True
    DEBUG = True
    
    # Use in-memory database for tests
    DATABASE_PATH = ":memory:"
    
    # Faster tests
    LOG_LEVEL = "WARNING"


class ProductionConfig(Config):
    """Production environment configuration."""
    
    DEBUG = False
    
    # Production must have a real secret key
    SECRET_KEY = os.environ.get("SECRET_KEY")
    
    # Production logging
    LOG_LEVEL = "INFO"
    
    @classmethod
    def validate(cls):
        """Ensure required production settings are configured."""
        if not cls.SECRET_KEY:
            raise ValueError("SECRET_KEY environment variable required in production")


# Map environment names to config classes
config_by_name = {
    "development": DevelopmentConfig,
    "testing": TestingConfig,
    "production": ProductionConfig,
}


def get_config(env_name: str = None) -> type:
    """Get configuration class for the specified environment.
    
    Args:
        env_name: Environment name (development, testing, production).
                  Defaults to FLASK_ENV environment variable or 'development'.
    
    Returns:
        Configuration class for the environment.
    """
    if env_name is None:
        env_name = os.environ.get("FLASK_ENV", "development")
    
    return config_by_name.get(env_name, DevelopmentConfig)
```

### 2.2 Line-by-Line Explanation

| Line | Purpose |
|------|---------|
| `BASE_DIR = Path(__file__).parent.parent.parent` | Get project root by going up from config.py |
| `os.environ.get("SECRET_KEY", "dev-key...")` | Read from environment, use default if not set |
| `DATABASE_PATH = ":memory:"` | SQLite in-memory database for fast tests |
| `config_by_name` | Dictionary mapping names to classes |

---

## Part 3: Using Configuration

### 3.1 In Application Code

```python
from partflow.config import get_config

config = get_config()

# Access settings
print(config.DEBUG)
print(config.DATABASE_PATH)
```

### 3.2 In Flask App

```python
from flask import Flask
from partflow.config import get_config

def create_app(config_name: str = None):
    app = Flask(__name__)
    
    config = get_config(config_name)
    app.config.from_object(config)
    
    return app
```

### 3.3 In Tests

```python
# tests/conftest.py
import pytest
from partflow.config import TestingConfig

@pytest.fixture
def app():
    from partflow.web.app import create_app
    return create_app("testing")
```

---

## Part 4: Environment Variables

### 4.1 Setting Environment Variables

**Windows PowerShell (session only):**
```powershell
$env:SECRET_KEY = "my-secret-key"
$env:FLASK_ENV = "development"
```

**macOS/Linux:**
```bash
export SECRET_KEY="my-secret-key"
export FLASK_ENV="development"
```

### 4.2 Using .env Files

Create `.env` in project root:

```env
SECRET_KEY=development-secret-key-do-not-use-in-prod
FLASK_ENV=development
DATABASE_PATH=./data/partflow.db
```

**Important:** Add `.env` to `.gitignore`:
```gitignore
.env
*.env
```

### 4.3 Loading .env with python-dotenv

Install:
```bash
pip install python-dotenv
```

Update config.py:
```python
from dotenv import load_dotenv

# Load .env file if present
load_dotenv()

class Config:
    ...
```

---

## Part 5: Create Data Directory

### 5.1 Ensure Directory Exists

Add to config.py:

```python
class Config:
    # ... existing code ...
    
    @classmethod
    def ensure_directories(cls):
        """Create required directories if they don't exist."""
        cls.DATA_DIR.mkdir(parents=True, exist_ok=True)
```

### 5.2 Call on Startup

```python
# In app startup or __main__.py
config = get_config()
config.ensure_directories()
```

---

## Part 6: Exercises

### Exercise 1: Access Configuration

Create a test script that:
1. Imports get_config
2. Gets development config
3. Prints DEBUG value
4. Prints DATABASE_PATH

<details>
<summary>Solution</summary>

```python
# test_config.py
from partflow.config import get_config

config = get_config("development")

print(f"DEBUG: {config.DEBUG}")
print(f"DATABASE_PATH: {config.DATABASE_PATH}")
```

Expected output:
```
DEBUG: True
DATABASE_PATH: /path/to/project/data/partflow.db
```

</details>

---

### Exercise 2: Environment Override

1. Set environment variable: `$env:FLASK_ENV = "production"`
2. Get config (without specifying name)
3. Verify it's production config

<details>
<summary>Solution</summary>

```powershell
$env:FLASK_ENV = "production"
python -c "from partflow.config import get_config; c = get_config(); print(c.__name__)"
```

Output: `ProductionConfig`

</details>

---

## Summary

### Key Concepts

| Concept | Purpose |
|---------|---------|
| **Config class** | Holds all configuration values |
| **Environment configs** | Different settings per environment |
| **Environment variables** | Secrets and runtime overrides |
| **get_config()** | Factory to get correct config |

### Configuration Checklist

- [ ] Config class created
- [ ] Development/Testing/Production configs
- [ ] SECRET_KEY from environment
- [ ] .env in .gitignore
- [ ] Can access config in code

---

## Next Tutorial

[Tutorial 4: Application Factory →](./04-app-factory.md)
