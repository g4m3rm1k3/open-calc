# Tutorial 5: Lock UI Indicators

## Introduction

Users need to see lock status in the UI. This tutorial adds visual indicators and lock controls.

---

## Part 1: UI Requirements

### 1.1 What Users Need to See

| Scenario | UI Display |
|----------|------------|
| Unlocked | "Edit" button enabled |
| Locked by me | "Locked by you" + timer + "Extend" + "Check In" |
| Locked by other | "Locked by [name]" + "Edit" disabled |
| Lock expiring soon | Warning message |

### 1.2 Lock Status Component

```html
<!--  Lock status indicator -->
<div class="lock-status">
    {% if lock.is_locked and lock.locked_by == current_user %}
        <span class="badge badge-success">🔒 Locked by you</span>
        <span class="timer">{{ lock.time_remaining | format_duration }}</span>
        <form action="{{ url_for('parts.extend_lock', part_id=part.id) }}" method="POST">
            <button type="submit" class="btn-small">Extend</button>
        </form>
    {% elif lock.is_locked %}
        <span class="badge badge-warning">🔒 Locked by {{ lock.locked_by }}</span>
    {% else %}
        <span class="badge badge-neutral">Unlocked</span>
    {% endif %}
</div>
```

---

## Part 2: Update Part Routes

### 2.1 Add Lock Status to Detail

Update `src/partflow/web/routes/parts.py`:

```python
from partflow.dependencies import get_deps


@parts_bp.route('/<uuid:part_id>')
def detail(part_id: UUID):
    """Display Part details with lock status."""
    deps = get_deps()
    
    try:
        part = deps.part_service.get_part(part_id)
        lock_status = deps.lock_service.get_lock_status(part_id)
        
        return render_template(
            'parts/detail.html',
            part=part,
            lock_status=lock_status,
            current_user="user123",  # TODO: Get from session
        )
    except NotFoundError:
        flash('Part not found.', 'error')
        return redirect(url_for('parts.list_parts'))


@parts_bp.route('/<uuid:part_id>/checkout', methods=['POST'])
def check_out(part_id: UUID):
    """Acquire lock on Part."""
    deps = get_deps()
    user_id = "user123"  # TODO: Get from session
    
    try:
        deps.lock_service.check_out(part_id, user_id)
        flash('Part locked for editing.', 'success')
    except PartLockedError as e:
        flash(f'Part is locked by {e.locked_by}.', 'error')
    
    return redirect(url_for('parts.detail', part_id=part_id))


@parts_bp.route('/<uuid:part_id>/checkin', methods=['POST'])
def check_in(part_id: UUID):
    """Release lock on Part."""
    deps = get_deps()
    user_id = "user123"  # TODO: Get from session
    
    try:
        deps.lock_service.check_in(part_id, user_id)
        flash('Lock released.', 'success')
    except NotAuthorizedError:
        flash('You cannot release this lock.', 'error')
    
    return redirect(url_for('parts.detail', part_id=part_id))


@parts_bp.route('/<uuid:part_id>/extend', methods=['POST'])
def extend_lock(part_id: UUID):
    """Extend lock on Part."""
    deps = get_deps()
    user_id = "user123"  # TODO: Get from session
    
    try:
        deps.lock_service.extend_lock(part_id, user_id)
        flash('Lock extended by 1 hour.', 'success')
    except (NotFoundError, NotAuthorizedError, LockExpiredError) as e:
        flash(str(e), 'error')
    
    return redirect(url_for('parts.detail', part_id=part_id))
```

---

## Part 3: Update Templates

### 3.1 Part Detail with Lock Status

Update `src/partflow/web/templates/parts/detail.html`:

```html
{% extends "base.html" %}

{% block title %}{{ part.part_number }} - PartFlow{% endblock %}

{% block content %}
<h2>{{ part.part_number }}</h2>

<!-- Lock Status Bar -->
<div class="lock-status-bar 
            {% if lock_status.is_locked %}
                {% if lock_status.locked_by == current_user %}locked-by-me{% else %}locked-by-other{% endif %}
            {% endif %}">
    
    {% if lock_status.is_locked %}
        {% if lock_status.locked_by == current_user %}
            <span class="lock-indicator">🔒 Locked by you</span>
            <span class="lock-timer">
                Expires in {{ (lock_status.time_remaining / 60) | int }} minutes
            </span>
            <form action="{{ url_for('parts.extend_lock', part_id=part.id) }}" method="POST" style="display:inline;">
                <button type="submit" class="btn-small">+ 1 Hour</button>
            </form>
            <form action="{{ url_for('parts.check_in', part_id=part.id) }}" method="POST" style="display:inline;">
                <button type="submit" class="btn-small btn-secondary">Check In</button>
            </form>
        {% else %}
            <span class="lock-indicator">🔒 Locked by {{ lock_status.locked_by }}</span>
            <span class="lock-timer">
                Available in {{ (lock_status.time_remaining / 60) | int }} minutes
            </span>
        {% endif %}
    {% else %}
        <span class="lock-indicator">🔓 Available</span>
        <form action="{{ url_for('parts.check_out', part_id=part.id) }}" method="POST" style="display:inline;">
            <button type="submit" class="btn-small">Check Out to Edit</button>
        </form>
    {% endif %}
</div>

<!-- Part Details -->
<table class="detail-table">
    <tr><th>Part Number</th><td>{{ part.part_number }}</td></tr>
    <tr><th>Name</th><td>{{ part.name }}</td></tr>
    <tr><th>Description</th><td>{{ part.description or '-' }}</td></tr>
    <tr><th>Status</th><td>{{ part.status.value }}</td></tr>
    <tr><th>Created</th><td>{{ part.created_at.strftime('%Y-%m-%d %H:%M') }}</td></tr>
</table>

<!-- Actions -->
<div class="actions">
    {% if not lock_status.is_locked or lock_status.locked_by == current_user %}
        <a href="{{ url_for('parts.edit_part', part_id=part.id) }}" class="btn">Edit</a>
    {% else %}
        <button class="btn" disabled title="Locked by {{ lock_status.locked_by }}">Edit (Locked)</button>
    {% endif %}
    <a href="{{ url_for('parts.list_parts') }}">Back to list</a>
</div>
{% endblock %}
```

### 3.2 Lock Status CSS

Add to `base.html` styles:

```css
.lock-status-bar {
    padding: 10px 15px;
    margin: 15px 0;
    border-radius: 4px;
    background: #f0f0f0;
    display: flex;
    align-items: center;
    gap: 15px;
}

.lock-status-bar.locked-by-me {
    background: #d4edda;
    border: 1px solid #c3e6cb;
}

.lock-status-bar.locked-by-other {
    background: #fff3cd;
    border: 1px solid #ffc107;
}

.lock-indicator {
    font-weight: bold;
}

.lock-timer {
    color: #666;
    font-size: 0.9em;
}

.btn-small {
    padding: 5px 10px;
    font-size: 0.85em;
}

.btn-secondary {
    background: #6c757d;
}

button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}
```

---

## Part 4: Edit Page Protection

### 4.1 Check Lock on Edit

```python
@parts_bp.route('/<uuid:part_id>/edit')
def edit_part(part_id: UUID):
    """Display edit form (requires lock)."""
    deps = get_deps()
    user_id = "user123"  # TODO: Get from session
    
    try:
        part = deps.part_service.get_part(part_id)
        
        # Check if user has lock
        if deps.lock_service.is_locked_by_other(part_id, user_id):
            flash('You must check out this part to edit it.', 'error')
            return redirect(url_for('parts.detail', part_id=part_id))
        
        return render_template('parts/edit.html', part=part)
    
    except NotFoundError:
        flash('Part not found.', 'error')
        return redirect(url_for('parts.list_parts'))
```

---

## Summary

### UI Components

| Component | Purpose |
|-----------|---------|
| Lock status bar | Show current status |
| Check Out button | Acquire lock |
| Check In button | Release lock |
| Extend button | Add time |
| Disabled Edit | When locked by other |

### Phase 08 Complete!

**Next:** [Phase 09: Revision Control →](../09-revision-control/README.md)
