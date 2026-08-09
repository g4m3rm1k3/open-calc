# Tutorial 4: Application Factory

## Introduction

The **application factory pattern** creates your Flask app in a function rather than at module level. This enables:
- Multiple instances (for testing)
- Different configurations
- Clean initialization

---

## Part 1: Why Application Factory?

### 1.1 The Problem with Global App

```python
# BAD: Global app
from flask import Flask
app = Flask(__name__)  # Created at import time

@app.route('/')
def index():
    return "Hello"
```

Problems:
- Can't create multiple instances
- Configuration locked at import
- Hard to test with different settings

### 1.2 The Factory Solution

```python
# GOOD: Factory function
from flask import Flask

def create_app(config_name=None):
    app = Flask(__name__)
    # Configure here
    return app
```

Benefits:
- Create fresh app for each test
- Different configs per instance
- Clean, predictable initialization

---

## Part 2: Create the Application Factory

### 2.1 Create app.py

Create `src/partflow/web/app.py`:

```python
"""Flask application factory for PartFlow.

This module provides the create_app factory function that creates
and configures a Flask application instance.
"""

from flask import Flask

from partflow.config import get_config


def create_app(config_name: str = None) -> Flask:
    """Create and configure the Flask application.
    
    Args:
        config_name: Configuration environment name 
                     ('development', 'testing', 'production').
                     Defaults to FLASK_ENV environment variable.
    
    Returns:
        Configured Flask application instance.
    """
    # Create Flask app
    app = Flask(
        __name__,
        template_folder="templates",
        static_folder="static",
    )
    
    # Load configuration
    config = get_config(config_name)
    app.config.from_object(config)
    
    # Ensure required directories exist
    if hasattr(config, 'ensure_directories'):
        config.ensure_directories()
    
    # Register blueprints
    register_blueprints(app)
    
    # Register error handlers
    register_error_handlers(app)
    
    return app


def register_blueprints(app: Flask) -> None:
    """Register Flask blueprints.
    
    Blueprints group related routes together.
    """
    # Will add blueprints as we create them
    # from partflow.web.routes.parts import parts_bp
    # app.register_blueprint(parts_bp)
    pass


def register_error_handlers(app: Flask) -> None:
    """Register error handlers for the application."""
    
    @app.errorhandler(404)
    def not_found(error):
        return {"error": "Not found"}, 404
    
    @app.errorhandler(500)
    def internal_error(error):
        return {"error": "Internal server error"}, 500
```

### 2.2 Line-by-Line Explanation

| Code | Purpose |
|------|---------|
| `Flask(__name__, ...)` | Create Flask app with correct template path |
| `app.config.from_object(config)` | Load config class into Flask's config |
| `register_blueprints(app)` | Add route groups to app |
| `register_error_handlers(app)` | Add global error handling |

---

## Part 3: Create Entry Point

### 3.1 Create __main__.py

Create `src/partflow/__main__.py`:

```python
"""Entry point for running PartFlow as a module.

Usage:
    python -m partflow
"""

from partflow.web.app import create_app


def main():
    """Run the PartFlow application."""
    app = create_app()
    
    # Get config values
    host = app.config.get("HOST", "127.0.0.1")
    port = app.config.get("PORT", 5000)
    debug = app.config.get("DEBUG", False)
    
    print(f"Starting PartFlow on http://{host}:{port}")
    app.run(host=host, port=port, debug=debug)


if __name__ == "__main__":
    main()
```

### 3.2 Run the Application

```bash
python -m partflow
```

You should see:
```
Starting PartFlow on http://127.0.0.1:5000
 * Running on http://127.0.0.1:5000
```

Visit http://127.0.0.1:5000 in browser—you'll see 404 (no routes yet).

---

## Part 4: Add a Health Check Route

### 4.1 Create Base Routes

Create `src/partflow/web/routes/health.py`:

```python
"""Health check routes for PartFlow.

These routes verify the application is running correctly.
"""

from flask import Blueprint, jsonify

health_bp = Blueprint("health", __name__)


@health_bp.route("/health")
def health_check():
    """Return application health status.
    
    Returns:
        JSON with status and version.
    """
    import partflow
    return jsonify({
        "status": "healthy",
        "version": partflow.__version__,
    })


@health_bp.route("/")
def index():
    """Application root."""
    return jsonify({
        "name": "PartFlow",
        "message": "Manufacturing Engineering Platform",
    })
```

### 4.2 Register the Blueprint

Update `src/partflow/web/app.py`:

```python
def register_blueprints(app: Flask) -> None:
    """Register Flask blueprints."""
    from partflow.web.routes.health import health_bp
    app.register_blueprint(health_bp)
```

### 4.3 Test It

Restart the app and visit:
- http://127.0.0.1:5000/ → Welcome message
- http://127.0.0.1:5000/health → Health status

---

## Part 5: Exercises

### Exercise 1: Create and Run

1. Create the app.py file
2. Create the __main__.py file
3. Create the health.py routes
4. Run with `python -m partflow`
5. Verify /health returns JSON

<details>
<summary>Expected Result</summary>

Visiting http://127.0.0.1:5000/health should return:
```json
{
    "status": "healthy",
    "version": "0.1.0"
}
```

</details>

---

### Exercise 2: Test Different Configs

1. Create app with testing config
2. Verify DEBUG is True
3. Verify DATABASE_PATH is ":memory:"

<details>
<summary>Solution</summary>

```python
from partflow.web.app import create_app

app = create_app("testing")
print(f"DEBUG: {app.config['DEBUG']}")
print(f"TESTING: {app.config['TESTING']}")
print(f"DATABASE_PATH: {app.config.get('DATABASE_PATH')}")
```

</details>

---

## Summary

### Key Concepts

| Concept | Purpose |
|---------|---------|
| **Application factory** | Function that creates app instances |
| **Blueprint** | Group of related routes |
| **__main__.py** | Entry point for `python -m` |
| **Error handlers** | Global error responses |

### Application Factory Checklist

- [ ] create_app() function exists
- [ ] Config loaded from get_config()
- [ ] Blueprints registered
- [ ] Error handlers registered
- [ ] __main__.py created
- [ ] `python -m partflow` works

---

## Phase 03 Complete!

You now have a complete project structure:
- ✅ Layered folder structure
- ✅ Python packages with exports
- ✅ Configuration system
- ✅ Application factory
- ✅ Health check endpoint

**Next:** [Phase 04: Testing Discipline →](../04-testing-discipline/README.md)

In Phase 04, you'll learn Test-Driven Development (TDD) before implementing any features.
