import os
import sys

REPO_ROOT = r"C:\Users\g4m3r\Documents\manufacturing-platform"


def get_client():
    """Return a real Flask test client for whichever app ACCEPTANCE_TARGET names."""
    target = os.environ.get('ACCEPTANCE_TARGET', 'legacy')
    roots = {
        'legacy': 'backend',
        'new': 'rebuild-3/backend',
    }
    if target not in roots:
        raise ValueError(f"ACCEPTANCE_TARGET must be 'legacy' or 'new', got {target!r}")

    app_root = os.path.join(REPO_ROOT, roots[target])
    sys.path.insert(0, app_root)

    from app import create_app
    app = create_app('testing')
    return app.test_client()
