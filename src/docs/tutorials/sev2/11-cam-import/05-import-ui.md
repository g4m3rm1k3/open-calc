# Tutorial 5: Import UI

## Introduction

This tutorial builds the file upload UI for CAM import with preview and confirmation.

---

## Part 1: Import Routes

Create `src/partflow/web/routes/import_.py`:

```python
"""Import routes for CAM files."""

from flask import Blueprint, render_template, request, redirect, url_for, flash
from werkzeug.utils import secure_filename

from partflow.dependencies import get_deps


import_bp = Blueprint('import', __name__, url_prefix='/import')


@import_bp.route('/')
def index():
    """Import landing page."""
    return render_template('import/index.html')


@import_bp.route('/cam', methods=['GET', 'POST'])
def cam_import():
    """CAM file import page."""
    if request.method == 'GET':
        return render_template('import/cam.html')
    
    # POST - handle file upload
    if 'file' not in request.files:
        flash('No file uploaded.', 'error')
        return render_template('import/cam.html')
    
    file = request.files['file']
    if file.filename == '':
        flash('No file selected.', 'error')
        return render_template('import/cam.html')
    
    if not file.filename.endswith('.xml'):
        flash('File must be XML.', 'error')
        return render_template('import/cam.html')
    
    try:
        xml_content = file.read().decode('utf-8')
    except Exception as e:
        flash(f'Error reading file: {e}', 'error')
        return render_template('import/cam.html')
    
    # Parse and preview
    deps = get_deps()
    preview, errors = deps.import_service.parse_and_preview(xml_content)
    
    if errors:
        for error in errors:
            flash(error, 'error')
        return render_template('import/cam.html')
    
    # Store XML in session for confirmation
    from flask import session
    session['pending_import_xml'] = xml_content
    
    return render_template(
        'import/preview.html',
        preview=preview,
    )


@import_bp.route('/cam/confirm', methods=['POST'])
def confirm_import():
    """Confirm and execute import."""
    from flask import session
    
    xml_content = session.pop('pending_import_xml', None)
    if not xml_content:
        flash('No pending import. Please upload again.', 'error')
        return redirect(url_for('import.cam_import'))
    
    part_number = request.form.get('part_number', '').strip()
    if not part_number:
        flash('Part number is required.', 'error')
        return redirect(url_for('import.cam_import'))
    
    deps = get_deps()
    user_id = "user123"  # TODO: Get from session
    
    result = deps.import_service.import_as_new_part(
        xml_content=xml_content,
        part_number=part_number,
        imported_by=user_id,
    )
    
    if result.success:
        for warning in result.warnings:
            flash(warning, 'warning')
        flash(f'Successfully imported as {result.part_number}', 'success')
        return redirect(url_for('parts.detail', part_id=result.part_id))
    else:
        for error in result.errors:
            flash(error, 'error')
        return redirect(url_for('import.cam_import'))
```

---

## Part 2: Templates

### 2.1 Import Index

Create `src/partflow/web/templates/import/index.html`:

```html
{% extends "base.html" %}

{% block title %}Import - PartFlow{% endblock %}

{% block content %}
<h2>Import Data</h2>

<div class="import-options">
    <div class="import-card">
        <h3>📁 CAM File Import</h3>
        <p>Import Parts from Mastercam XML files.</p>
        <a href="{{ url_for('import.cam_import') }}" class="btn">Import CAM File</a>
    </div>
</div>
{% endblock %}
```

### 2.2 CAM Upload Form

Create `src/partflow/web/templates/import/cam.html`:

```html
{% extends "base.html" %}

{% block title %}CAM Import - PartFlow{% endblock %}

{% block content %}
<h2>Import CAM File</h2>

<div class="import-instructions">
    <p>Upload a Mastercam XML file to import operations and tooling data.</p>
    <p><strong>Supported:</strong> .xml files exported from Mastercam</p>
</div>

<form action="{{ url_for('import.cam_import') }}" method="POST" 
      enctype="multipart/form-data" class="import-form">
    
    <div class="form-group">
        <label for="file">Select XML File</label>
        <input type="file" id="file" name="file" accept=".xml" required>
    </div>
    
    <button type="submit" class="btn btn-primary">
        Upload and Preview
    </button>
</form>

<p><a href="{{ url_for('import.index') }}">← Back to Import</a></p>
{% endblock %}
```

### 2.3 Import Preview

Create `src/partflow/web/templates/import/preview.html`:

```html
{% extends "base.html" %}

{% block title %}Import Preview - PartFlow{% endblock %}

{% block content %}
<h2>Import Preview</h2>

<div class="preview-summary">
    <h3>{{ preview.file_name }}</h3>
    
    <table class="summary-table">
        <tr>
            <th>Machine</th>
            <td>{{ preview.machine_name or 'Not specified' }}</td>
        </tr>
        <tr>
            <th>Operations</th>
            <td>{{ preview.operation_count }}</td>
        </tr>
        <tr>
            <th>Tools</th>
            <td>{{ preview.tool_count }}</td>
        </tr>
        <tr>
            <th>Est. Cycle Time</th>
            <td>{{ "%.1f"|format(preview.total_cycle_time) }} seconds</td>
        </tr>
    </table>
</div>

{% if preview.warnings %}
<div class="warnings">
    <h4>⚠️ Warnings</h4>
    <ul>
        {% for warning in preview.warnings %}
        <li>{{ warning }}</li>
        {% endfor %}
    </ul>
</div>
{% endif %}

<h3>Operations</h3>
<table class="operations-table">
    <thead>
        <tr>
            <th>#</th>
            <th>Name</th>
            <th>Type</th>
            <th>Tool</th>
            <th>RPM</th>
            <th>Feed</th>
            <th>Active</th>
        </tr>
    </thead>
    <tbody>
        {% for op in preview.operations %}
        <tr class="{% if not op.active %}inactive{% endif %}">
            <td>{{ op.sequence }}</td>
            <td>{{ op.name }}</td>
            <td>{{ op.type }}</td>
            <td>{{ op.tool }}</td>
            <td>{{ op.spindle }}</td>
            <td>{{ op.feed }}</td>
            <td>{{ 'Yes' if op.active else 'No' }}</td>
        </tr>
        {% endfor %}
    </tbody>
</table>

<h3>Confirm Import</h3>
<form action="{{ url_for('import.confirm_import') }}" method="POST" class="confirm-form">
    <div class="form-group">
        <label for="part_number">Part Number</label>
        <input type="text" id="part_number" name="part_number" 
               placeholder="PN-12345" required
               pattern="[A-Z]{2}-\d{5}"
               title="Format: XX-00000 (e.g., PN-12345)">
        <small>This will be the identifier for the new Part.</small>
    </div>
    
    <div class="form-actions">
        <button type="submit" class="btn btn-success">Confirm Import</button>
        <a href="{{ url_for('import.cam_import') }}" class="btn btn-secondary">Cancel</a>
    </div>
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
    from partflow.web.routes.import_ import import_bp
    
    app.register_blueprint(health_bp)
    app.register_blueprint(parts_bp)
    app.register_blueprint(machines_bp)
    app.register_blueprint(import_bp)
```

---

## Part 4: CSS Additions

```css
.import-options {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 20px;
    margin: 20px 0;
}

.import-card {
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 20px;
    text-align: center;
}

.import-card h3 {
    margin-top: 0;
}

.import-form {
    max-width: 500px;
    margin: 20px 0;
}

.preview-summary {
    background: #f5f5f5;
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 20px;
}

.operations-table tr.inactive {
    opacity: 0.5;
    font-style: italic;
}

.confirm-form {
    background: #e8f5e9;
    padding: 20px;
    border-radius: 8px;
    margin-top: 20px;
}

.warnings {
    background: #fff3e0;
    padding: 15px;
    border-radius: 4px;
    margin: 15px 0;
}
```

---

## Summary

### Phase 11 Complete!

You've implemented:
- ✅ XML parsing utilities
- ✅ CAM domain objects
- ✅ CAM file parser
- ✅ Import service with preview
- ✅ Upload and confirmation UI

**Next:** [Phase 12: Refactor Checkpoint #2 →](../12-refactor-checkpoint-2/README.md)
