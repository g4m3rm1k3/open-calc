# Tutorial 6: Web Routes and Templates

## Introduction

The **Web Layer** handles HTTP requests and responses. It's the thin outer shell that translates between HTTP and our service layer.

---

## Part 1: Web Layer Responsibilities

### 1.1 What the Web Layer Does

| Responsibility | Example |
|----------------|---------|
| **Route definitions** | Map URLs to handlers |
| **Request parsing** | Extract form data, JSON |
| **Response rendering** | HTML templates, JSON |
| **Error translation** | Domain errors → HTTP status codes |
| **Session management** | User sessions, flash messages |

### 1.2 What the Web Layer Doesn't Do

| Not Web Responsibility | Where It Belongs |
|------------------------|------------------|
| Business logic | Domain entities |
| Data validation | Value objects, services |
| Data access | Repository |
| Authorization logic | Service layer |

---

## Part 2: Create Parts Blueprint

### 2.1 Create Routes

Create `src/partflow/web/routes/parts.py`:

```python
"""Part routes for PartFlow.

Handles HTTP requests for Part management.
"""

from flask import Blueprint, render_template, request, redirect, url_for, flash
from uuid import UUID

from partflow.domain.errors import ValidationError, DuplicateEntityError, NotFoundError


# Create blueprint
parts_bp = Blueprint('parts', __name__, url_prefix='/parts')


def get_part_service():
    """Get PartService instance.
    
    Factory function to get service with proper dependencies.
    In a larger app, this would use dependency injection.
    """
    from partflow.repository.sqlite.database import Database
    from partflow.repository.sqlite.part_repository import SQLitePartRepository
    from partflow.service.part_service import PartService
    from partflow.config import get_config
    
    config = get_config()
    db = Database(config.DATABASE_PATH)
    repo = SQLitePartRepository(db)
    return PartService(repo)


@parts_bp.route('/')
def list_parts():
    """Display list of all Parts.
    
    GET /parts/
    """
    service = get_part_service()
    parts = service.get_all_parts()
    
    return render_template('parts/list.html', parts=parts)


@parts_bp.route('/new')
def new_part():
    """Display Part creation form.
    
    GET /parts/new
    """
    return render_template('parts/new.html')


@parts_bp.route('/', methods=['POST'])
def create_part():
    """Handle Part creation form submission.
    
    POST /parts/
    
    Form fields:
        part_number: Part number (XX-NNNNN)
        name: Part name
        description: Optional description
    """
    service = get_part_service()
    
    try:
        part = service.create_part(
            part_number=request.form['part_number'],
            name=request.form['name'],
            description=request.form.get('description') or None,
        )
        flash(f'Part {part.part_number} created successfully.', 'success')
        return redirect(url_for('parts.detail', part_id=part.id))
    
    except ValidationError as e:
        flash(f'Validation error: {e.message}', 'error')
        return render_template('parts/new.html'), 400
    
    except DuplicateEntityError as e:
        flash(f'Part number already exists.', 'error')
        return render_template('parts/new.html'), 409


@parts_bp.route('/<uuid:part_id>')
def detail(part_id: UUID):
    """Display Part details.
    
    GET /parts/<uuid>
    """
    service = get_part_service()
    
    try:
        part = service.get_part(part_id)
        return render_template('parts/detail.html', part=part)
    except NotFoundError:
        flash('Part not found.', 'error')
        return redirect(url_for('parts.list_parts'))


@parts_bp.route('/<uuid:part_id>/edit')
def edit_part(part_id: UUID):
    """Display Part edit form.
    
    GET /parts/<uuid>/edit
    """
    service = get_part_service()
    
    try:
        part = service.get_part(part_id)
        return render_template('parts/edit.html', part=part)
    except NotFoundError:
        flash('Part not found.', 'error')
        return redirect(url_for('parts.list_parts'))


@parts_bp.route('/<uuid:part_id>', methods=['POST'])
def update_part(part_id: UUID):
    """Handle Part update form submission.
    
    POST /parts/<uuid>
    """
    service = get_part_service()
    
    try:
        part = service.update_part(
            part_id=part_id,
            name=request.form['name'],
            description=request.form.get('description') or None,
        )
        flash(f'Part updated successfully.', 'success')
        return redirect(url_for('parts.detail', part_id=part.id))
    
    except NotFoundError:
        flash('Part not found.', 'error')
        return redirect(url_for('parts.list_parts'))
    
    except ValidationError as e:
        flash(f'Validation error: {e.message}', 'error')
        return redirect(url_for('parts.edit_part', part_id=part_id))


@parts_bp.route('/<uuid:part_id>/delete', methods=['POST'])
def delete_part(part_id: UUID):
    """Handle Part deletion.
    
    POST /parts/<uuid>/delete
    """
    service = get_part_service()
    
    if service.delete_part(part_id):
        flash('Part deleted.', 'success')
    else:
        flash('Part not found.', 'error')
    
    return redirect(url_for('parts.list_parts'))
```

---

## Part 3: Create Templates

### 3.1 Base Template

Create `src/partflow/web/templates/base.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{% block title %}PartFlow{% endblock %}</title>
    <style>
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #f5f5f5;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        header {
            background: #2c3e50;
            color: white;
            padding: 20px 0;
        }
        header h1 {
            margin: 0;
        }
        header nav {
            margin-top: 10px;
        }
        header nav a {
            color: #ecf0f1;
            text-decoration: none;
            margin-right: 20px;
        }
        header nav a:hover {
            text-decoration: underline;
        }
        main {
            background: white;
            padding: 20px;
            margin-top: 20px;
            border-radius: 4px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .flash {
            padding: 10px 15px;
            margin-bottom: 20px;
            border-radius: 4px;
        }
        .flash.success {
            background: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }
        .flash.error {
            background: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }
        .btn {
            display: inline-block;
            padding: 10px 20px;
            background: #3498db;
            color: white;
            text-decoration: none;
            border-radius: 4px;
            border: none;
            cursor: pointer;
        }
        .btn:hover {
            background: #2980b9;
        }
        .btn-danger {
            background: #e74c3c;
        }
        .btn-danger:hover {
            background: #c0392b;
        }
        .form-group {
            margin-bottom: 15px;
        }
        .form-group label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
        }
        .form-group input,
        .form-group textarea {
            width: 100%;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
        }
        th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        th {
            background: #f8f9fa;
        }
        tr:hover {
            background: #f8f9fa;
        }
    </style>
</head>
<body>
    <header>
        <div class="container">
            <h1>PartFlow</h1>
            <nav>
                <a href="{{ url_for('health.index') }}">Home</a>
                <a href="{{ url_for('parts.list_parts') }}">Parts</a>
            </nav>
        </div>
    </header>
    
    <main>
        <div class="container">
            {% with messages = get_flashed_messages(with_categories=true) %}
                {% for category, message in messages %}
                    <div class="flash {{ category }}">{{ message }}</div>
                {% endfor %}
            {% endwith %}
            
            {% block content %}{% endblock %}
        </div>
    </main>
</body>
</html>
```

### 3.2 Parts List Template

Create `src/partflow/web/templates/parts/list.html`:

```html
{% extends "base.html" %}

{% block title %}Parts - PartFlow{% endblock %}

{% block content %}
<h2>Parts</h2>
<p><a href="{{ url_for('parts.new_part') }}" class="btn">+ New Part</a></p>

{% if parts %}
<table>
    <thead>
        <tr>
            <th>Part Number</th>
            <th>Name</th>
            <th>Status</th>
            <th>Created</th>
            <th>Actions</th>
        </tr>
    </thead>
    <tbody>
        {% for part in parts %}
        <tr>
            <td><a href="{{ url_for('parts.detail', part_id=part.id) }}">{{ part.part_number }}</a></td>
            <td>{{ part.name }}</td>
            <td>{{ part.status.value }}</td>
            <td>{{ part.created_at.strftime('%Y-%m-%d') }}</td>
            <td>
                <a href="{{ url_for('parts.edit_part', part_id=part.id) }}">Edit</a>
            </td>
        </tr>
        {% endfor %}
    </tbody>
</table>
{% else %}
<p>No parts yet. <a href="{{ url_for('parts.new_part') }}">Create one</a>.</p>
{% endif %}
{% endblock %}
```

### 3.3 Part Detail Template

Create `src/partflow/web/templates/parts/detail.html`:

```html
{% extends "base.html" %}

{% block title %}{{ part.part_number }} - PartFlow{% endblock %}

{% block content %}
<h2>{{ part.part_number }}</h2>

<table>
    <tr>
        <th>Part Number</th>
        <td>{{ part.part_number }}</td>
    </tr>
    <tr>
        <th>Name</th>
        <td>{{ part.name }}</td>
    </tr>
    <tr>
        <th>Description</th>
        <td>{{ part.description or '-' }}</td>
    </tr>
    <tr>
        <th>Status</th>
        <td>{{ part.status.value }}</td>
    </tr>
    <tr>
        <th>Created</th>
        <td>{{ part.created_at.strftime('%Y-%m-%d %H:%M') }}</td>
    </tr>
</table>

<p style="margin-top: 20px;">
    <a href="{{ url_for('parts.edit_part', part_id=part.id) }}" class="btn">Edit</a>
    <a href="{{ url_for('parts.list_parts') }}">Back to list</a>
</p>

<form action="{{ url_for('parts.delete_part', part_id=part.id) }}" method="POST" 
      style="margin-top: 30px;" onsubmit="return confirm('Delete this part?');">
    <button type="submit" class="btn btn-danger">Delete Part</button>
</form>
{% endblock %}
```

### 3.4 New Part Form

Create `src/partflow/web/templates/parts/new.html`:

```html
{% extends "base.html" %}

{% block title %}New Part - PartFlow{% endblock %}

{% block content %}
<h2>New Part</h2>

<form action="{{ url_for('parts.create_part') }}" method="POST">
    <div class="form-group">
        <label for="part_number">Part Number</label>
        <input type="text" id="part_number" name="part_number" 
               placeholder="XX-12345" pattern="[A-Z]{2}-[0-9]{5}" required>
        <small>Format: XX-NNNNN (e.g., PN-12345)</small>
    </div>
    
    <div class="form-group">
        <label for="name">Name</label>
        <input type="text" id="name" name="name" required>
    </div>
    
    <div class="form-group">
        <label for="description">Description</label>
        <textarea id="description" name="description" rows="3"></textarea>
    </div>
    
    <button type="submit" class="btn">Create Part</button>
    <a href="{{ url_for('parts.list_parts') }}">Cancel</a>
</form>
{% endblock %}
```

### 3.5 Edit Part Form

Create `src/partflow/web/templates/parts/edit.html`:

```html
{% extends "base.html" %}

{% block title %}Edit {{ part.part_number }} - PartFlow{% endblock %}

{% block content %}
<h2>Edit {{ part.part_number }}</h2>

<form action="{{ url_for('parts.update_part', part_id=part.id) }}" method="POST">
    <div class="form-group">
        <label>Part Number</label>
        <input type="text" value="{{ part.part_number }}" disabled>
        <small>Part numbers cannot be changed after creation.</small>
    </div>
    
    <div class="form-group">
        <label for="name">Name</label>
        <input type="text" id="name" name="name" value="{{ part.name }}" required>
    </div>
    
    <div class="form-group">
        <label for="description">Description</label>
        <textarea id="description" name="description" rows="3">{{ part.description or '' }}</textarea>
    </div>
    
    <button type="submit" class="btn">Save Changes</button>
    <a href="{{ url_for('parts.detail', part_id=part.id) }}">Cancel</a>
</form>
{% endblock %}
```

---

## Part 4: Register Blueprint

Update `src/partflow/web/app.py`:

```python
def register_blueprints(app: Flask) -> None:
    """Register Flask blueprints."""
    from partflow.web.routes.health import health_bp
    from partflow.web.routes.parts import parts_bp
    
    app.register_blueprint(health_bp)
    app.register_blueprint(parts_bp)
```

---

## Part 5: Run and Test

### 5.1 Run the Application

```bash
python -m partflow
```

### 5.2 Test in Browser

1. http://localhost:5000/ - Home page
2. http://localhost:5000/parts/ - Parts list
3. http://localhost:5000/parts/new - Create form
4. Create a part, view it, edit it, delete it

---

## Part 6: Phase 05 Complete!

You've built a complete vertical slice:
- ✅ Part entity with validation
- ✅ PartNumber value object
- ✅ Repository interface and SQLite implementation
- ✅ Service layer with business logic
- ✅ Web routes and templates
- ✅ Full CRUD functionality

**Next:** [Phase 06: Machines & Relationships →](../06-machines-relationships/README.md)
