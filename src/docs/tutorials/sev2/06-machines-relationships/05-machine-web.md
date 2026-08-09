# Tutorial 5: Machine Web Layer

## Introduction

This tutorial implements the web layer for Machines, including routes for managing Machines and Part-Machine associations.

---

## Part 1: Machine Routes

Create `src/partflow/web/routes/machines.py`:

```python
"""Machine routes for PartFlow."""

from flask import Blueprint, render_template, request, redirect, url_for, flash
from uuid import UUID

from partflow.domain.entities.machine import ControllerType, MachineStatus
from partflow.domain.errors import ValidationError, DuplicateEntityError, NotFoundError


machines_bp = Blueprint('machines', __name__, url_prefix='/machines')


def get_machine_service():
    """Get MachineService instance."""
    from partflow.repository.sqlite.database import Database
    from partflow.repository.sqlite.machine_repository import SQLiteMachineRepository
    from partflow.repository.sqlite.part_machine_repository import SQLitePartMachineRepository
    from partflow.service.machine_service import MachineService
    from partflow.config import get_config
    
    config = get_config()
    db = Database(config.DATABASE_PATH)
    machine_repo = SQLiteMachineRepository(db)
    part_machine_repo = SQLitePartMachineRepository(db)
    return MachineService(machine_repo, part_machine_repo)


@machines_bp.route('/')
def list_machines():
    """Display all Machines."""
    service = get_machine_service()
    machines = service.get_all_machines()
    return render_template('machines/list.html', machines=machines)


@machines_bp.route('/new')
def new_machine():
    """Display Machine creation form."""
    controller_types = list(ControllerType)
    return render_template('machines/new.html', controller_types=controller_types)


@machines_bp.route('/', methods=['POST'])
def create_machine():
    """Handle Machine creation."""
    service = get_machine_service()
    
    try:
        machine = service.create_machine(
            machine_id=request.form['machine_id'],
            name=request.form['name'],
            controller_type=ControllerType(request.form['controller_type']),
            axes=int(request.form.get('axes', 3)),
            max_spindle_speed=int(request.form.get('max_spindle_speed', 10000)),
            description=request.form.get('description') or None,
        )
        flash(f'Machine {machine.machine_id} created.', 'success')
        return redirect(url_for('machines.detail', machine_uuid=machine.id))
    
    except ValidationError as e:
        flash(f'Validation error: {e.message}', 'error')
        return render_template('machines/new.html', 
                               controller_types=list(ControllerType)), 400
    
    except DuplicateEntityError:
        flash('Machine ID already exists.', 'error')
        return render_template('machines/new.html',
                               controller_types=list(ControllerType)), 409


@machines_bp.route('/<uuid:machine_uuid>')
def detail(machine_uuid: UUID):
    """Display Machine details."""
    service = get_machine_service()
    
    try:
        machine = service.get_machine(machine_uuid)
        associations = service.get_parts_for_machine(machine_uuid)
        return render_template('machines/detail.html', 
                               machine=machine,
                               associations=associations)
    except NotFoundError:
        flash('Machine not found.', 'error')
        return redirect(url_for('machines.list_machines'))


@machines_bp.route('/<uuid:machine_uuid>/maintenance', methods=['POST'])
def start_maintenance(machine_uuid: UUID):
    """Put Machine into maintenance."""
    service = get_machine_service()
    
    try:
        service.start_maintenance(machine_uuid)
        flash('Machine in maintenance mode.', 'success')
    except NotFoundError:
        flash('Machine not found.', 'error')
    
    return redirect(url_for('machines.detail', machine_uuid=machine_uuid))


@machines_bp.route('/<uuid:machine_uuid>/activate', methods=['POST'])
def complete_maintenance(machine_uuid: UUID):
    """Return Machine to active."""
    service = get_machine_service()
    
    try:
        service.complete_maintenance(machine_uuid)
        flash('Machine returned to active.', 'success')
    except NotFoundError:
        flash('Machine not found.', 'error')
    
    return redirect(url_for('machines.detail', machine_uuid=machine_uuid))
```

---

## Part 2: Templates

### List Template

Create `src/partflow/web/templates/machines/list.html`:

```html
{% extends "base.html" %}

{% block title %}Machines - PartFlow{% endblock %}

{% block content %}
<h2>Machines</h2>
<p><a href="{{ url_for('machines.new_machine') }}" class="btn">+ New Machine</a></p>

{% if machines %}
<table>
    <thead>
        <tr>
            <th>Machine ID</th>
            <th>Name</th>
            <th>Controller</th>
            <th>Axes</th>
            <th>Status</th>
        </tr>
    </thead>
    <tbody>
        {% for machine in machines %}
        <tr>
            <td><a href="{{ url_for('machines.detail', machine_uuid=machine.id) }}">{{ machine.machine_id }}</a></td>
            <td>{{ machine.name }}</td>
            <td>{{ machine.controller_type.value }}</td>
            <td>{{ machine.axes }}-axis</td>
            <td>
                <span class="status-{{ machine.status.value }}">
                    {{ machine.status.value }}
                </span>
            </td>
        </tr>
        {% endfor %}
    </tbody>
</table>
{% else %}
<p>No machines yet. <a href="{{ url_for('machines.new_machine') }}">Add one</a>.</p>
{% endif %}
{% endblock %}
```

### Detail Template

Create `src/partflow/web/templates/machines/detail.html`:

```html
{% extends "base.html" %}

{% block title %}{{ machine.machine_id }} - PartFlow{% endblock %}

{% block content %}
<h2>{{ machine.machine_id }}: {{ machine.name }}</h2>

<table>
    <tr><th>Machine ID</th><td>{{ machine.machine_id }}</td></tr>
    <tr><th>Name</th><td>{{ machine.name }}</td></tr>
    <tr><th>Controller</th><td>{{ machine.controller_type.value }}</td></tr>
    <tr><th>Axes</th><td>{{ machine.axes }}-axis</td></tr>
    <tr><th>Max Spindle Speed</th><td>{{ machine.max_spindle_speed }} RPM</td></tr>
    <tr><th>Status</th><td>{{ machine.status.value }}</td></tr>
    <tr><th>Description</th><td>{{ machine.description or '-' }}</td></tr>
</table>

<h3>Status Actions</h3>
{% if machine.status.value == 'active' %}
<form action="{{ url_for('machines.start_maintenance', machine_uuid=machine.id) }}" method="POST" style="display:inline;">
    <button type="submit" class="btn">Start Maintenance</button>
</form>
{% elif machine.status.value == 'maintenance' %}
<form action="{{ url_for('machines.complete_maintenance', machine_uuid=machine.id) }}" method="POST" style="display:inline;">
    <button type="submit" class="btn">Complete Maintenance</button>
</form>
{% endif %}

<h3>Parts on this Machine</h3>
{% if associations %}
<table>
    <thead>
        <tr>
            <th>Part ID</th>
            <th>Setup Time</th>
            <th>Primary</th>
        </tr>
    </thead>
    <tbody>
        {% for assoc in associations %}
        <tr>
            <td>{{ assoc.part_id }}</td>
            <td>{{ assoc.setup_time_minutes }} min</td>
            <td>{{ 'Yes' if assoc.is_primary else 'No' }}</td>
        </tr>
        {% endfor %}
    </tbody>
</table>
{% else %}
<p>No parts assigned to this machine yet.</p>
{% endif %}

<p><a href="{{ url_for('machines.list_machines') }}">Back to list</a></p>
{% endblock %}
```

### New Machine Form

Create `src/partflow/web/templates/machines/new.html`:

```html
{% extends "base.html" %}

{% block title %}New Machine - PartFlow{% endblock %}

{% block content %}
<h2>New Machine</h2>

<form action="{{ url_for('machines.create_machine') }}" method="POST">
    <div class="form-group">
        <label for="machine_id">Machine ID</label>
        <input type="text" id="machine_id" name="machine_id" placeholder="MCH-001" required>
    </div>
    
    <div class="form-group">
        <label for="name">Name</label>
        <input type="text" id="name" name="name" placeholder="Haas VF-2" required>
    </div>
    
    <div class="form-group">
        <label for="controller_type">Controller Type</label>
        <select id="controller_type" name="controller_type" required>
            {% for ct in controller_types %}
            <option value="{{ ct.value }}">{{ ct.value|title }}</option>
            {% endfor %}
        </select>
    </div>
    
    <div class="form-group">
        <label for="axes">Axes</label>
        <select id="axes" name="axes">
            <option value="3">3-axis</option>
            <option value="4">4-axis</option>
            <option value="5">5-axis</option>
        </select>
    </div>
    
    <div class="form-group">
        <label for="max_spindle_speed">Max Spindle Speed (RPM)</label>
        <input type="number" id="max_spindle_speed" name="max_spindle_speed" value="10000" min="1" max="50000">
    </div>
    
    <div class="form-group">
        <label for="description">Description</label>
        <textarea id="description" name="description" rows="3"></textarea>
    </div>
    
    <button type="submit" class="btn">Create Machine</button>
    <a href="{{ url_for('machines.list_machines') }}">Cancel</a>
</form>
{% endblock %}
```

---

## Part 3: Register Blueprint

Update `src/partflow/web/app.py`:

```python
def register_blueprints(app: Flask) -> None:
    """Register Flask blueprints."""
    from partflow.web.routes.health import health_bp
    from partflow.web.routes.parts import parts_bp
    from partflow.web.routes.machines import machines_bp
    
    app.register_blueprint(health_bp)
    app.register_blueprint(parts_bp)
    app.register_blueprint(machines_bp)
```

---

## Part 4: Update Navigation

Update `base.html` nav:

```html
<nav>
    <a href="{{ url_for('health.index') }}">Home</a>
    <a href="{{ url_for('parts.list_parts') }}">Parts</a>
    <a href="{{ url_for('machines.list_machines') }}">Machines</a>
</nav>
```

---

## Phase 06 Complete!

You've implemented:
- ✅ Machine entity with status transitions
- ✅ Part-Machine associations
- ✅ Machine repository
- ✅ Machine service
- ✅ Machine web layer

**Next:** [Phase 07: Refactor Checkpoint #1 →](../07-refactor-checkpoint-1/README.md)
