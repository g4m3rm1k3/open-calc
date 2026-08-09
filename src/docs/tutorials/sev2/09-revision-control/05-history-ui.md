# Tutorial 5: History UI

## Introduction

Users need to view revision history, compare versions, and restore previous states through the UI.

---

## Part 1: History Routes

Add to `src/partflow/web/routes/parts.py`:

```python
@parts_bp.route('/<uuid:part_id>/history')
def history(part_id: UUID):
    """Display revision history for a Part."""
    deps = get_deps()
    
    try:
        part = deps.part_service.get_part(part_id)
        revisions = deps.revision_service.get_history(part_id)
        
        return render_template(
            'parts/history.html',
            part=part,
            revisions=revisions,
        )
    except NotFoundError:
        flash('Part not found.', 'error')
        return redirect(url_for('parts.list_parts'))


@parts_bp.route('/<uuid:part_id>/revision/<uuid:revision_id>')
def view_revision(part_id: UUID, revision_id: UUID):
    """View a specific revision."""
    deps = get_deps()
    
    try:
        part = deps.part_service.get_part(part_id)
        revision = deps.revision_service.get_revision(revision_id)
        
        return render_template(
            'parts/revision.html',
            part=part,
            revision=revision,
        )
    except NotFoundError:
        flash('Revision not found.', 'error')
        return redirect(url_for('parts.history', part_id=part_id))


@parts_bp.route('/<uuid:part_id>/compare', methods=['GET', 'POST'])
def compare_revisions(part_id: UUID):
    """Compare two revisions."""
    deps = get_deps()
    
    try:
        part = deps.part_service.get_part(part_id)
        revisions = deps.revision_service.get_history(part_id)
        
        if request.method == 'POST':
            rev1_id = UUID(request.form['revision_1'])
            rev2_id = UUID(request.form['revision_2'])
            
            diff = deps.revision_service.compare(rev1_id, rev2_id)
            rev1 = deps.revision_service.get_revision(rev1_id)
            rev2 = deps.revision_service.get_revision(rev2_id)
            
            return render_template(
                'parts/compare.html',
                part=part,
                revisions=revisions,
                diff=diff,
                rev1=rev1,
                rev2=rev2,
            )
        
        return render_template(
            'parts/compare.html',
            part=part,
            revisions=revisions,
            diff=None,
        )
    except NotFoundError:
        flash('Part not found.', 'error')
        return redirect(url_for('parts.list_parts'))
```

---

## Part 2: Templates

### 2.1 History Page

Create `src/partflow/web/templates/parts/history.html`:

```html
{% extends "base.html" %}

{% block title %}History - {{ part.part_number }}{% endblock %}

{% block content %}
<h2>Revision History: {{ part.part_number }}</h2>

<p>
    <a href="{{ url_for('parts.detail', part_id=part.id) }}">← Back to Part</a>
    | <a href="{{ url_for('parts.compare_revisions', part_id=part.id) }}">Compare Versions</a>
</p>

{% if revisions %}
<table class="history-table">
    <thead>
        <tr>
            <th>Version</th>
            <th>Changed By</th>
            <th>Changed At</th>
            <th>Reason</th>
            <th>Actions</th>
        </tr>
    </thead>
    <tbody>
        {% for rev in revisions %}
        <tr class="{% if loop.first %}current{% endif %}">
            <td>
                <strong>{{ rev.version_string }}</strong>
                {% if rev.external_revision %}
                    ({{ rev.external_revision }})
                {% endif %}
                {% if loop.first %}
                    <span class="badge">Current</span>
                {% endif %}
            </td>
            <td>{{ rev.changed_by }}</td>
            <td>{{ rev.changed_at.strftime('%Y-%m-%d %H:%M') }}</td>
            <td>{{ rev.change_reason }}</td>
            <td>
                <a href="{{ url_for('parts.view_revision', part_id=part.id, revision_id=rev.id) }}">View</a>
            </td>
        </tr>
        {% endfor %}
    </tbody>
</table>
{% else %}
<p>No revision history available.</p>
{% endif %}
{% endblock %}
```

### 2.2 Revision Detail Page

Create `src/partflow/web/templates/parts/revision.html`:

```html
{% extends "base.html" %}

{% block title %}Version {{ revision.version_string }} - {{ part.part_number }}{% endblock %}

{% block content %}
<h2>{{ part.part_number }} - Version {{ revision.version_string }}</h2>

<div class="revision-meta">
    <p><strong>Changed By:</strong> {{ revision.changed_by }}</p>
    <p><strong>Changed At:</strong> {{ revision.changed_at.strftime('%Y-%m-%d %H:%M:%S UTC') }}</p>
    <p><strong>Reason:</strong> {{ revision.change_reason }}</p>
    {% if revision.external_revision %}
    <p><strong>External Revision:</strong> {{ revision.external_revision }}</p>
    {% endif %}
</div>

<h3>Snapshot Data</h3>
<table class="detail-table">
    <tr><th>Part Number</th><td>{{ revision.snapshot.part_number }}</td></tr>
    <tr><th>Name</th><td>{{ revision.snapshot.name }}</td></tr>
    <tr><th>Description</th><td>{{ revision.snapshot.description or '-' }}</td></tr>
    <tr><th>Status</th><td>{{ revision.snapshot.status }}</td></tr>
</table>

{% if revision.snapshot.machines %}
<h4>Machines at this Version</h4>
<ul>
    {% for m in revision.snapshot.machines %}
    <li>{{ m.machine_id }}: {{ m.machine_name }} 
        (Setup: {{ m.setup_time_minutes }} min)
        {% if m.is_primary %}⭐ Primary{% endif %}
    </li>
    {% endfor %}
</ul>
{% endif %}

<p>
    <a href="{{ url_for('parts.history', part_id=part.id) }}">← Back to History</a>
</p>
{% endblock %}
```

### 2.3 Compare Page

Create `src/partflow/web/templates/parts/compare.html`:

```html
{% extends "base.html" %}

{% block title %}Compare Versions - {{ part.part_number }}{% endblock %}

{% block content %}
<h2>Compare Versions: {{ part.part_number }}</h2>

<form method="POST" class="compare-form">
    <div class="compare-selectors">
        <div class="selector">
            <label for="revision_1">From Version:</label>
            <select name="revision_1" id="revision_1">
                {% for rev in revisions %}
                <option value="{{ rev.id }}"
                    {% if rev1 and rev1.id == rev.id %}selected{% endif %}>
                    {{ rev.version_string }} ({{ rev.changed_at.strftime('%Y-%m-%d') }})
                </option>
                {% endfor %}
            </select>
        </div>
        <div class="selector">
            <label for="revision_2">To Version:</label>
            <select name="revision_2" id="revision_2">
                {% for rev in revisions %}
                <option value="{{ rev.id }}"
                    {% if rev2 and rev2.id == rev.id %}selected{% endif %}>
                    {{ rev.version_string }} ({{ rev.changed_at.strftime('%Y-%m-%d') }})
                </option>
                {% endfor %}
            </select>
        </div>
        <button type="submit" class="btn">Compare</button>
    </div>
</form>

{% if diff is not none %}
<h3>Changes: {{ rev1.version_string }} → {{ rev2.version_string }}</h3>

{% if diff %}
<div class="diff-view">
    {% for field, change in diff.items() %}
        {% if field == 'machines' %}
            {% if change.added %}
            <div class="diff-added">
                <strong>Added Machines:</strong>
                <ul>
                    {% for m in change.added %}
                    <li>{{ m.machine_id }}</li>
                    {% endfor %}
                </ul>
            </div>
            {% endif %}
            {% if change.removed %}
            <div class="diff-removed">
                <strong>Removed Machines:</strong>
                <ul>
                    {% for m in change.removed %}
                    <li>{{ m.machine_id }}</li>
                    {% endfor %}
                </ul>
            </div>
            {% endif %}
        {% else %}
            <div class="diff-changed">
                <strong>{{ field }}:</strong>
                <span class="old">"{{ change.old }}"</span>
                →
                <span class="new">"{{ change.new }}"</span>
            </div>
        {% endif %}
    {% endfor %}
</div>
{% else %}
<p class="no-changes">No differences between these versions.</p>
{% endif %}
{% endif %}

<p><a href="{{ url_for('parts.history', part_id=part.id) }}">← Back to History</a></p>
{% endblock %}
```

---

## Part 3: CSS Additions

```css
.history-table tr.current {
    background: #e8f5e9;
}

.badge {
    font-size: 0.75em;
    padding: 2px 6px;
    background: #4caf50;
    color: white;
    border-radius: 3px;
}

.diff-view {
    background: #f5f5f5;
    padding: 15px;
    border-radius: 4px;
}

.diff-added {
    color: #2e7d32;
    margin: 10px 0;
}

.diff-removed {
    color: #c62828;
    margin: 10px 0;
}

.diff-changed .old {
    background: #ffcdd2;
    padding: 2px 4px;
}

.diff-changed .new {
    background: #c8e6c9;
    padding: 2px 4px;
}

.compare-form {
    background: #f5f5f5;
    padding: 15px;
    border-radius: 4px;
    margin-bottom: 20px;
}

.compare-selectors {
    display: flex;
    gap: 20px;
    align-items: flex-end;
}
```

---

## Summary

### Phase 09 Complete!

You've implemented:
- ✅ Revision entity with versioning
- ✅ Snapshot capture and comparison
- ✅ Revision repository and service
- ✅ History and compare UI

**Next:** [Phase 10: Workflows & Governance →](../10-workflows-governance/README.md)
