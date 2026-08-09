# Tutorial 5: Workflow UI

## Introduction

This tutorial adds workflow controls to the UI—submit, approve, reject, and history views.

---

## Part 1: Workflow Routes

Add to `src/partflow/web/routes/parts.py`:

```python
@parts_bp.route('/<uuid:part_id>/submit', methods=['POST'])
def submit_for_review(part_id: UUID):
    """Submit Part for review."""
    deps = get_deps()
    user_id = "user123"  # TODO: Get from session
    
    try:
        deps.workflow_service.submit_for_review(
            part_id, 
            user_id,
            request.form.get('comments'),
        )
        flash('Part submitted for review.', 'success')
    except Exception as e:
        flash(str(e), 'error')
    
    return redirect(url_for('parts.detail', part_id=part_id))


@parts_bp.route('/<uuid:part_id>/approve', methods=['POST'])
def approve(part_id: UUID):
    """Approve Part."""
    deps = get_deps()
    user_id = "approver"  # TODO: Get from session
    
    try:
        deps.workflow_service.approve(
            part_id,
            user_id,
            request.form.get('comments'),
        )
        flash('Part approved.', 'success')
    except Exception as e:
        flash(str(e), 'error')
    
    return redirect(url_for('parts.detail', part_id=part_id))


@parts_bp.route('/<uuid:part_id>/reject', methods=['POST'])
def reject(part_id: UUID):
    """Reject Part."""
    deps = get_deps()
    user_id = "approver"  # TODO: Get from session
    
    try:
        comments = request.form.get('comments', '')
        deps.workflow_service.reject(part_id, user_id, comments)
        flash('Part rejected.', 'info')
    except Exception as e:
        flash(str(e), 'error')
    
    return redirect(url_for('parts.detail', part_id=part_id))


@parts_bp.route('/<uuid:part_id>/activate', methods=['POST'])
def activate(part_id: UUID):
    """Activate approved Part."""
    deps = get_deps()
    user_id = "admin"  # TODO: Get from session
    
    try:
        deps.workflow_service.activate(part_id, user_id)
        flash('Part activated for production.', 'success')
    except Exception as e:
        flash(str(e), 'error')
    
    return redirect(url_for('parts.detail', part_id=part_id))


@parts_bp.route('/<uuid:part_id>/workflow')
def workflow_history(part_id: UUID):
    """View workflow history."""
    deps = get_deps()
    
    try:
        part = deps.part_service.get_part(part_id)
        transitions = deps.workflow_service.get_transition_history(part_id)
        
        return render_template(
            'parts/workflow.html',
            part=part,
            transitions=transitions,
        )
    except NotFoundError:
        flash('Part not found.', 'error')
        return redirect(url_for('parts.list_parts'))


@parts_bp.route('/pending-reviews')
def pending_reviews():
    """List Parts pending review."""
    deps = get_deps()
    parts = deps.workflow_service.get_pending_reviews()
    
    return render_template('parts/pending.html', parts=parts)
```

---

## Part 2: Update Part Detail Template

Add workflow controls to `parts/detail.html`:

```html
<!-- Add after lock status bar -->

<div class="workflow-bar status-{{ part.status.value }}">
    <strong>Status:</strong> 
    <span class="status-badge">{{ part.status.value | upper }}</span>
    
    <div class="workflow-actions">
        {% if part.status.value == 'draft' %}
            <form action="{{ url_for('parts.submit_for_review', part_id=part.id) }}" 
                  method="POST" class="inline-form">
                <input type="text" name="comments" placeholder="Comments (optional)">
                <button type="submit" class="btn btn-primary">Submit for Review</button>
            </form>
        
        {% elif part.status.value == 'review' %}
            <form action="{{ url_for('parts.approve', part_id=part.id) }}" 
                  method="POST" class="inline-form">
                <input type="text" name="comments" placeholder="Approval notes">
                <button type="submit" class="btn btn-success">Approve</button>
            </form>
            
            <form action="{{ url_for('parts.reject', part_id=part.id) }}" 
                  method="POST" class="inline-form">
                <input type="text" name="comments" placeholder="Rejection reason" required>
                <button type="submit" class="btn btn-danger">Reject</button>
            </form>
        
        {% elif part.status.value == 'approved' %}
            <form action="{{ url_for('parts.activate', part_id=part.id) }}" 
                  method="POST" class="inline-form">
                <button type="submit" class="btn btn-primary">Activate</button>
            </form>
        
        {% elif part.status.value == 'active' %}
            <span class="text-success">✓ In Production</span>
        
        {% elif part.status.value == 'obsolete' %}
            <span class="text-muted">Obsoleted</span>
        {% endif %}
    </div>
    
    <a href="{{ url_for('parts.workflow_history', part_id=part.id) }}">
        View Workflow History
    </a>
</div>
```

---

## Part 3: Workflow History Template

Create `src/partflow/web/templates/parts/workflow.html`:

```html
{% extends "base.html" %}

{% block title %}Workflow History - {{ part.part_number }}{% endblock %}

{% block content %}
<h2>Workflow History: {{ part.part_number }}</h2>
<p>Current Status: <strong>{{ part.status.value | upper }}</strong></p>

{% if transitions %}
<table class="workflow-table">
    <thead>
        <tr>
            <th>Date/Time</th>
            <th>Transition</th>
            <th>By</th>
            <th>Comments</th>
        </tr>
    </thead>
    <tbody>
        {% for t in transitions %}
        <tr>
            <td>{{ t.transitioned_at.strftime('%Y-%m-%d %H:%M') }}</td>
            <td>
                <span class="state from">{{ t.from_state.value }}</span>
                →
                <span class="state to">{{ t.to_state.value }}</span>
                <br>
                <small>{{ t.transition_name }}</small>
            </td>
            <td>{{ t.transitioned_by }}</td>
            <td>{{ t.comments or '-' }}</td>
        </tr>
        {% endfor %}
    </tbody>
</table>
{% else %}
<p>No workflow history yet.</p>
{% endif %}

<p><a href="{{ url_for('parts.detail', part_id=part.id) }}">← Back to Part</a></p>
{% endblock %}
```

---

## Part 4: Pending Reviews Dashboard

Create `src/partflow/web/templates/parts/pending.html`:

```html
{% extends "base.html" %}

{% block title %}Pending Reviews - PartFlow{% endblock %}

{% block content %}
<h2>Parts Pending Review</h2>

{% if parts %}
<table>
    <thead>
        <tr>
            <th>Part Number</th>
            <th>Name</th>
            <th>Actions</th>
        </tr>
    </thead>
    <tbody>
        {% for part in parts %}
        <tr>
            <td>
                <a href="{{ url_for('parts.detail', part_id=part.id) }}">
                    {{ part.part_number }}
                </a>
            </td>
            <td>{{ part.name }}</td>
            <td>
                <a href="{{ url_for('parts.detail', part_id=part.id) }}" class="btn btn-small">
                    Review
                </a>
            </td>
        </tr>
        {% endfor %}
    </tbody>
</table>
{% else %}
<p class="empty-state">No parts pending review. 🎉</p>
{% endif %}
{% endblock %}
```

---

## Part 5: CSS Additions

```css
.workflow-bar {
    padding: 15px;
    margin: 15px 0;
    border-radius: 4px;
    display: flex;
    align-items: center;
    gap: 15px;
    flex-wrap: wrap;
}

.workflow-bar.status-draft { background: #e3f2fd; }
.workflow-bar.status-review { background: #fff3e0; }
.workflow-bar.status-approved { background: #e8f5e9; }
.workflow-bar.status-active { background: #c8e6c9; }
.workflow-bar.status-obsolete { background: #f5f5f5; }

.status-badge {
    padding: 4px 8px;
    border-radius: 4px;
    font-weight: bold;
    font-size: 0.85em;
}

.workflow-actions {
    display: flex;
    gap: 10px;
}

.inline-form {
    display: flex;
    gap: 5px;
    align-items: center;
}

.btn-success { background: #4caf50; }
.btn-danger { background: #f44336; }
.btn-primary { background: #2196f3; }

.workflow-table .state.from { color: #666; }
.workflow-table .state.to { color: #1976d2; font-weight: bold; }
```

---

## Summary

### Phase 10 Complete!

You've implemented:
- ✅ Workflow concepts and state machine
- ✅ Transition validation and recording
- ✅ Approval/rejection workflow
- ✅ Audit logging
- ✅ Workflow UI controls and history

**Next:** [Phase 11: CAM Import →](../11-cam-import/README.md)
