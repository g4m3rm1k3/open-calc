---
series: python-fundamentals
level: 32
title: Virtual Environments & pip
lang: python
---

Every Python project eventually depends on external packages — libraries not in the standard library. `pip` installs them. Virtual environments isolate them so different projects can use different versions of the same package without conflict. This is the infrastructure every Python project uses before it ships.

## The Problem Virtual Environments Solve

Without isolation, all Python projects share the same global package installation. If Project A needs `requests==2.28` and Project B needs `requests==2.31`, installing one breaks the other.

A virtual environment is a self-contained copy of Python with its own package directory. Packages installed inside it are invisible to other environments:

```text
Without venv:          With venv:
────────────────────   ────────────────────────────────
Global Python           project-a/
  requests 2.31           venv/
  flask 2.0                 site-packages/
  ← Project A broke          requests 2.28
    when Project B             flask 2.0
    upgraded requests        ...
                        project-b/
                          venv/
                            site-packages/
                              requests 2.31
                              ...
```

Each project gets exactly what it needs. Upgrading one never affects the other.

## Creating and Activating a Virtual Environment

These are shell commands, run in your terminal — not Python code:

```text
# Create a virtual environment named "venv"
python -m venv venv

# Activate it — Mac/Linux:
source venv/bin/activate

# Activate it — Windows:
venv\Scripts\activate

# Your prompt changes to show the active environment:
(venv) $
```

`python -m venv venv` — runs the `venv` module (part of the standard library) to create a new environment in a directory named `venv`. The `venv` directory contains a copy of the Python interpreter and an empty `site-packages` folder.

## pip — Package Installer for Python

With the virtual environment active, `pip` installs packages into it:

```text
pip install requests            # Install the latest version
pip install requests==2.28.2    # Install a specific version
pip install -r requirements.txt # Install everything in requirements.txt
pip list                        # Show installed packages
pip freeze                      # List packages in requirements.txt format
```

`pip install package` downloads the package from PyPI (the Python Package Index) and installs it into the active environment's `site-packages` folder. After installation, `import package` works in any Python file run from that environment.

## requirements.txt — Declaring Dependencies

A `requirements.txt` file lists every package the project depends on, one per line, usually with pinned versions:

```text
requests==2.31.0
flask==3.0.0
pytest==8.1.0
```

Anyone who clones the project runs `pip install -r requirements.txt` to get an identical environment. Version pinning (`==2.31.0`) ensures the same version is installed everywhere — floating versions (`>=2.31.0`) can install different versions on different machines, causing "works on my machine" bugs.

**SE lens:** `requirements.txt` is the contract between a developer and the machines that run their code. Production servers, CI/CD pipelines, and other developers all read it to reproduce the environment. A project without a `requirements.txt` is a project that only works on one machine.

## Inspecting the Environment from Python

From inside Python, `sys` (Level 25) lets you see where the interpreter is running and where it looks for packages:

```python
import sys

print(sys.version)
print(sys.executable)
print(sys.path[:3])
```

```text
3.12.0 (main, Oct  2 2023, 00:00:00)
/home/user/project-a/venv/bin/python
['/home/user/project-a', '/home/user/project-a/venv/lib/python3.12/site-packages', ...]
```

`sys.executable` shows the path to the Python interpreter — when a virtual environment is active, it points inside the `venv` directory. `sys.path` is the list of directories Python searches when you write `import something`. The `site-packages` entry in `sys.path` is where `pip` installs packages.

## Challenge: parse_requirements

Write a function `parse_requirements(requirements_text)` that parses a `requirements.txt`-format string and returns a list of `(package_name, version)` tuples, sorted alphabetically by package name.

Lines starting with `#` are comments and should be skipped. Empty lines should be skipped. Each non-comment line has the format `package==version`.

`line.startswith("#")` — `True` if the line begins with `#`.
`line.split("==")` — splits `"requests==2.31.0"` into `["requests", "2.31.0"]`.
`sorted(list, key=lambda item: item[0])` — sorts a list of tuples by the first element.

```challenge
def parse_requirements(requirements_text):
    pass
```

```test
req = "requests==2.31.0\nflask==3.0.0\n# a comment\npytest==8.1.0\n"
assert parse_requirements(req) == [("flask", "3.0.0"), ("pytest", "8.1.0"), ("requests", "2.31.0")]
assert parse_requirements("") == []
assert parse_requirements("# just a comment\n") == []
assert parse_requirements("numpy==1.26.0\n") == [("numpy", "1.26.0")]
assert parse_requirements("# comment\nzope==5.0\nalpha==1.0\n") == [("alpha", "1.0"), ("zope", "5.0")]
```
