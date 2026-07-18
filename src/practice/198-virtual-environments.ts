import type { PracticeChallenge } from './loader'

export const title = 'Virtual Environments (Python)'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'python-program',
        prompt: 'Simulate two isolated environments (a full spawned venv isn\'t available here) with a `VirtualEnv` class: `__init__(self, name)` sets `self.packages = {}`, `install(self, package, version)` sets `self.packages[package] = version`, `get_version(self, package)` returns `self.packages.get(package, "not installed")`. Create `web_env` and `data_env`, install `"flask"` at `"2.3"` into `web_env` and `"1.1"` into `data_env`, then print each `get_version("flask")` — two DIFFERENT versions coexisting without conflict.',
        starter: '',
        tests: `
assert output === '2.3\\n1.1'
`,
        solution: `class VirtualEnv:
    def __init__(self, name):
        self.name = name
        self.packages = {}

    def install(self, package, version):
        self.packages[package] = version

    def get_version(self, package):
        return self.packages.get(package, "not installed")


web_env = VirtualEnv("web-project")
data_env = VirtualEnv("data-project")

web_env.install("flask", "2.3")
data_env.install("flask", "1.1")

print(web_env.get_version("flask"))
print(data_env.get_version("flask"))
`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'python-program',
        prompt: 'Fix `main`: after `activate(env_a)` and installing `requests`, it calls `install_package("numpy", "1.24")` WITHOUT first calling `activate(env_b)` — since `install_package` always installs into whichever environment is currently `active_env`, `numpy` lands in `env_a` (still active) instead of `env_b`. Add `activate(env_b)` before installing `numpy`, so it lands in the correct, intended environment.',
        starter: `class VirtualEnv:
    def __init__(self, name):
        self.name = name
        self.packages = {}

    def install(self, package, version):
        self.packages[package] = version

    def get_version(self, package):
        return self.packages.get(package, "not installed")


active_env = None


def activate(env):
    global active_env
    active_env = env


def install_package(package, version):
    active_env.install(package, version)


env_a = VirtualEnv("project-a")
env_b = VirtualEnv("project-b")

activate(env_a)
install_package("requests", "2.0")

install_package("numpy", "1.24")

print(env_a.get_version("numpy"))
print(env_b.get_version("numpy"))
`,
        tests: `
assert output === 'not installed\\n1.24'
`,
        solution: `class VirtualEnv:
    def __init__(self, name):
        self.name = name
        self.packages = {}

    def install(self, package, version):
        self.packages[package] = version

    def get_version(self, package):
        return self.packages.get(package, "not installed")


active_env = None


def activate(env):
    global active_env
    active_env = env


def install_package(package, version):
    active_env.install(package, version)


env_a = VirtualEnv("project-a")
env_b = VirtualEnv("project-b")

activate(env_a)
install_package("requests", "2.0")

activate(env_b)
install_package("numpy", "1.24")

print(env_a.get_version("numpy"))
print(env_b.get_version("numpy"))
`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'python-program',
        prompt: 'Add `list_packages(self)` to `VirtualEnv`, returning `sorted(self.packages.items())`. Create `env_a` (installs `flask 2.3`, `requests 2.0`) and `env_b` (installs `django 4.2`, `requests 3.0`), print each `list_packages()`, then compute and print `sorted(set(env_a.packages) & set(env_b.packages))` — the package NAMES both environments happen to share, regardless of their (possibly different) installed versions.',
        starter: '',
        tests: `
assert output === "[('flask', '2.3'), ('requests', '2.0')]\\n[('django', '4.2'), ('requests', '3.0')]\\n['requests']"
`,
        solution: `class VirtualEnv:
    def __init__(self, name):
        self.name = name
        self.packages = {}

    def install(self, package, version):
        self.packages[package] = version

    def list_packages(self):
        return sorted(self.packages.items())


env_a = VirtualEnv("project-a")
env_a.install("flask", "2.3")
env_a.install("requests", "2.0")

env_b = VirtualEnv("project-b")
env_b.install("django", "4.2")
env_b.install("requests", "3.0")

print(env_a.list_packages())
print(env_b.list_packages())

shared = set(env_a.packages) & set(env_b.packages)
print(sorted(shared))
`,
      },
    ],
  },
]

export default challenges
