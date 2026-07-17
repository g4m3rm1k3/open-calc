---
concept: 198-virtual-environments
name: Virtual Environments (Python)
---

## Definition

A virtual environment is an isolated Python installation with its own
independent set of installed packages, separate from the system-wide
Python and from any other project's virtual environment — letting
different projects on the same machine use different (even conflicting)
package versions without interfering with each other.

## Problem

Installing packages globally (system-wide) means every project on a
machine shares the SAME package versions — if Project A needs one version
of a library and Project B needs a different, conflicting version,
installing one globally breaks the other. A virtual environment gives
each project its own isolated package installation, so different
projects' dependency requirements never conflict.

## Execution

Creating a virtual environment sets up a self-contained directory with
its own Python interpreter and package storage
↓
Activating it makes that environment's Python and packages the ones used
by subsequent commands in that shell session
↓
Installing a package installs it ONLY into the active environment,
completely separate from the system Python's packages, or any OTHER
project's virtual environment
↓
Running the project's code while that environment is active uses its
isolated packages
↓
Deactivating exits the virtual environment, returning to the system
Python — the environment's packages remain isolated inside its own
directory, unaffected by (and not affecting) anything else

## Computer Science

A virtual environment works by adjusting where Python looks for
installed packages (its `sys.path`) to prioritize the environment's own
isolated `site-packages` directory — this is a filesystem-and-path-based
isolation mechanism, not a full OS-level sandbox (unlike, say, a
container), but it's sufficient to solve the specific "different
projects need different package versions" problem.

Tags: sys.path, Package isolation, site-packages

## Software Engineering

Every serious Python project should use a virtual environment (or an
equivalent tool like `poetry` or `conda`) rather than installing
dependencies globally — this is now considered a baseline best practice,
since global installs make it nearly impossible to reliably reproduce a
project's exact dependency set on another machine, or to avoid
cross-project version conflicts.

Tags: Reproducibility, Dependency isolation best practice, requirements.txt

## Common Mistakes

- Installing project dependencies globally instead of inside an activated virtual environment — this risks version conflicts between projects and makes it much harder to reproduce the exact environment a project needs elsewhere.
- Forgetting to activate the correct virtual environment before installing a package or running code — packages can end up installed in the WRONG environment (or globally), especially when switching between multiple projects in the same terminal session.

## Exercises

- Explain what would happen if two projects needing different, conflicting versions of the same package both installed their dependencies globally on the same machine, without virtual environments.
- Look up what a `requirements.txt` (or equivalent) file is used for, and how it relates to reproducing a project's virtual environment on a different machine.

## python

```python
# Simulating package isolation across separate environments directly, since
# this app's code runner executes in a single shared process, not a real
# spawned virtual environment.
class VirtualEnv:
    def __init__(self, name):
        self.name = name
        self.packages = {}

    def install(self, package, version):
        self.packages[package] = version

    def get_version(self, package):
        return self.packages.get(package, 'not installed')


env_a = VirtualEnv('project-a-env')
env_b = VirtualEnv('project-b-env')

env_a.install('requests', '2.0')
env_b.install('requests', '3.0')

print(env_a.get_version('requests'))   # 2.0
print(env_b.get_version('requests'))   # 3.0 -- a DIFFERENT version, coexisting without conflict

# A package installed in one environment is simply absent from the other
env_a.install('numpy', '1.24')
print(env_a.get_version('numpy'))   # 1.24
print(env_b.get_version('numpy'))   # 'not installed' -- env_b never had numpy installed into IT
```
Walkthrough: `env_a` and `env_b` maintain completely independent package
dictionaries — installing `requests==2.0` into `env_a` has zero effect on
`env_b`, which has its own separate `requests==3.0` — exactly modeling
how two real virtual environments keep each project's dependencies
isolated from one another, even for the exact same package name.
