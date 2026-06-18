export default {
  id: 'ae-p0-02-git',
  slug: 'git-and-collaboration',
  chapter: 'ae-p0',
  order: 1,
  title: 'Git & Collaboration',
  subtitle: 'Version control is not optional — it is the single tool that makes all other tools recoverable.',
  tags: ['git', 'version control', 'branches', 'commit', 'diff', '.gitignore', 'collaboration'],

  hook: {
    question: 'How many times have you lost work to an experiment that overwrote a working version?',
    realWorldContext:
      'AI research and engineering involves constant experimentation: trying a different prompt, changing a hyperparameter, swapping a model. Without version control, every experiment is a gamble. Git gives you unlimited undo. More importantly, it gives you the ability to run an experiment, measure its effect, and revert cleanly if it made things worse — without losing anything. Professional AI engineers commit after every meaningful change. The diff IS the experiment log.',
    previewVisualizationId: 'PythonNotebook',
  },

  intuition: {
    prose: [
      'Git stores snapshots of your project over time. Each snapshot is a commit. Each commit has a hash (a 40-character identifier), a message, and a pointer to its parent commit.',
      'The fundamental mental model: your project is a timeline. Commits are points on that timeline. Branches are parallel timelines. Merging combines parallel timelines into one.',
      'For AI work, branches are essential: use a branch for each experiment. If it works, merge. If it fails, delete the branch — nothing is lost.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'The three-stage model',
        body: 'Git has three stages: working directory (your files), staging area (what you\'ve selected to commit), and repository (all committed history). `git add` moves files from working dir to staging. `git commit` moves from staging to repository.',
      },
      {
        type: 'warning',
        title: 'Never commit model weights or API keys',
        body: 'Add `*.bin`, `*.safetensors`, `*.pt`, `*.ckpt` to `.gitignore`. API keys stored in `.env` files must also be in `.gitignore`. A committed API key is a permanent security leak — even after deletion, it stays in git history.',
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'Git & Collaboration',
        mathBridge: 'Git history is a directed acyclic graph (DAG). Commits are nodes. Parent pointers are edges. Branches are named pointers to commits. HEAD is the pointer to your current position.',
        caption: 'Work through each cell to understand git\'s data model and daily workflow.',
        props: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Git\'s data model: commits, trees, blobs',
              prose: [
                '## What git actually stores',
                'Git does not store diffs. It stores complete snapshots. Every commit contains:',
                '- **blob** — the content of a single file at that point in time\n- **tree** — a directory listing (maps filenames to blobs and other trees)\n- **commit** — a pointer to the root tree, author, timestamp, message, and parent commit hash',
                '## Content-addressable storage',
                'Every object (blob, tree, commit) is named by the SHA-1 hash of its content. If two files have the same content, they share one blob. If a file does not change between commits, the new commit reuses the old blob — no duplication.',
                '## What this means for you',
                'Git is fundamentally a key-value store where keys are hashes. `git log --oneline` shows you the commit hashes. `git show <hash>` shows you the full snapshot at that point.',
              ],
              code: `# Simulate git's content-addressable model
import hashlib
import json

def git_hash(content: str) -> str:
    """Compute git-style SHA1 hash of content."""
    # Git prepends object type + size to content before hashing
    header = f"blob {len(content.encode())}\\0"
    full = header + content
    return hashlib.sha1(full.encode()).hexdigest()

# Two identical files get the same hash
file_a = "print('hello world')"
file_b = "print('hello world')"
file_c = "print('goodbye world')"

print(f"file_a hash: {git_hash(file_a)[:12]}...")
print(f"file_b hash: {git_hash(file_b)[:12]}...")  # identical to file_a
print(f"file_c hash: {git_hash(file_c)[:12]}...")  # different

print(f"\\nfile_a == file_b: {git_hash(file_a) == git_hash(file_b)}")
print(f"file_a == file_c: {git_hash(file_a) == git_hash(file_c)}")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 2,
              cellTitle: 'The daily workflow: add → commit → push',
              prose: [
                '## Setup (one time per machine)',
                '```bash\ngit config --global user.name "Your Name"\ngit config --global user.email "you@example.com"\n```',
                '## Starting a project',
                '```bash\ngit init my-ai-project\ncd my-ai-project\n```',
                '## The daily cycle',
                '```bash\n# 1. Check what changed\ngit status\ngit diff\n\n# 2. Stage the changes you want to commit\ngit add src/prompt_engineering.py\ngit add src/utils.py\n# or stage everything:\ngit add .\n\n# 3. Commit with a clear message\ngit commit -m "feat: add persona pattern to prompt library"\n\n# 4. Push to remote\ngit push origin main\n```',
                '## Writing good commit messages',
                'Use the imperative: "add X", "fix Y", "refactor Z". Prefix with type: `feat:`, `fix:`, `refactor:`, `docs:`, `test:`. The message should complete the sentence: "This commit will ___."',
              ],
              code: `# Demonstrate the staging model in Python

# Think of git's three areas as three dicts
working_directory = {
    "prompt_engineering.py": "def build_prompt(pattern): ...",
    "utils.py": "def tokenize(text): ...",
    "README.md": "# AI Engineering Course",
}

staging_area = {}
repository = {}  # commits go here

def git_add(filename, working_dir, staging):
    """Stage a file from working directory."""
    if filename in working_dir:
        staging[filename] = working_dir[filename]
        print(f"Staged: {filename}")
    else:
        print(f"Error: {filename} not in working directory")

def git_commit(message, staging, repo):
    """Commit staged files."""
    if not staging:
        print("Nothing to commit (staging area is empty)")
        return
    import hashlib, time
    snapshot = dict(staging)
    commit_hash = hashlib.sha1(str(snapshot).encode()).hexdigest()[:8]
    repo[commit_hash] = {"message": message, "snapshot": snapshot, "time": time.time()}
    staging.clear()
    print(f"[{commit_hash}] {message}")
    print(f"  {len(snapshot)} file(s) committed")
    return commit_hash

# Simulate workflow
git_add("prompt_engineering.py", working_directory, staging_area)
git_add("utils.py", working_directory, staging_area)
print(f"\\nStaging area: {list(staging_area.keys())}")

commit = git_commit("feat: add prompt library and tokenizer", staging_area, repository)
print(f"\\nStaging area after commit: {list(staging_area.keys())} (cleared)")
print(f"Repository commits: {list(repository.keys())}")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 3,
              cellTitle: 'Branches: parallel timelines for experiments',
              prose: [
                '## The AI engineer\'s branch strategy',
                'Every experiment gets a branch. This is the killer feature of git for AI work:',
                '```bash\n# Start a new experiment\ngit checkout -b experiment/rag-chunking-512\n\n# Make changes, commit as you go\ngit add .\ngit commit -m "test: chunk size 512 vs 256"\n\n# If experiment fails: delete branch, nothing lost\ngit checkout main\ngit branch -d experiment/rag-chunking-512\n\n# If experiment works: merge\ngit checkout main\ngit merge experiment/rag-chunking-512\n```',
                '## Branch naming conventions for AI projects',
                '- `experiment/description` — a prompt or hyperparameter experiment\n- `feature/description` — new functionality\n- `fix/description` — bug fix\n- `refactor/description` — code cleanup with no behavior change',
              ],
              code: `# Simulate git branching model

class GitRepo:
    def __init__(self):
        self.commits = {}
        self.branches = {"main": None}  # branch → commit hash
        self.head = "main"

    def commit(self, message, changes):
        import hashlib
        parent = self.branches[self.head]
        h = hashlib.sha1(f"{parent}{message}{str(changes)}".encode()).hexdigest()[:8]
        self.commits[h] = {"message": message, "parent": parent, "changes": changes}
        self.branches[self.head] = h
        print(f"[{self.head}] {h}: {message}")
        return h

    def checkout_branch(self, name, create=False):
        if create:
            self.branches[name] = self.branches[self.head]  # branch from current
            print(f"Created branch '{name}' from '{self.head}'")
        self.head = name
        print(f"Switched to branch '{name}'")

    def log(self):
        print(f"\\n--- Git Log ({self.head}) ---")
        current = self.branches[self.head]
        while current:
            c = self.commits[current]
            print(f"  {current}: {c['message']}")
            current = c['parent']

repo = GitRepo()

# Main branch: base implementation
repo.commit("feat: initial RAG pipeline", {"chunker": "v1"})
repo.commit("feat: add embedding model", {"embedder": "openai"})

# Experiment branch: try different chunk size
repo.checkout_branch("experiment/chunk-512", create=True)
repo.commit("test: chunk size 512", {"chunker": "v2_512"})
repo.commit("test: measure retrieval accuracy", {"results": "accuracy=0.82"})

repo.log()

# Back to main
repo.checkout_branch("main")
repo.log()`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 4,
              cellTitle: '.gitignore: what to never commit',
              prose: [
                '## AI engineering .gitignore essentials',
                '```gitignore\n# Python\n__pycache__/\n*.pyc\n.venv/\n*.egg-info/\ndist/\n\n# Environment variables and secrets\n.env\n.env.local\n*.key\nsecrets.json\n\n# Model weights and datasets (large binary files)\n*.bin\n*.safetensors\n*.pt\n*.pth\n*.ckpt\n*.h5\ncheckpoints/\noutputs/\ndatasets/\n\n# Jupyter artifacts\n.ipynb_checkpoints/\n*.ipynb  # optional — commit notebooks intentionally\n\n# IDE\n.vscode/\n.idea/\n.DS_Store\n```',
                '## The rule',
                'If a file is auto-generated, large (>1MB), contains secrets, or can be reproduced from other committed files — it does not belong in git.',
              ],
              code: `# Simulate .gitignore filtering

import fnmatch

GITIGNORE_PATTERNS = [
    "__pycache__/",
    "*.pyc",
    ".venv/",
    ".env",
    "*.safetensors",
    "*.pt",
    "*.ckpt",
    "checkpoints/",
    ".DS_Store",
    "*.key",
]

def should_ignore(path: str, patterns: list) -> bool:
    """Return True if path matches any gitignore pattern."""
    for pattern in patterns:
        # Strip trailing slash for directory check
        clean = pattern.rstrip('/')
        if fnmatch.fnmatch(path, clean):
            return True
        # Check if path starts with pattern (directory prefix)
        if path.startswith(clean + '/') or path == clean:
            return True
    return False

test_files = [
    "src/prompt_engineering.py",       # should track
    "models/llama-3-8b.safetensors",   # IGNORE (large model weight)
    ".env",                            # IGNORE (secrets)
    "__pycache__/module.cpython.pyc",  # IGNORE (generated)
    "checkpoints/epoch_5.ckpt",        # IGNORE (checkpoint)
    "README.md",                       # should track
    "config.yaml",                     # should track
    "api_key.key",                     # IGNORE (secrets)
]

print(f"{'File':<45} {'Action'}")
print("-" * 60)
for f in test_files:
    action = "IGNORE" if should_ignore(f, GITIGNORE_PATTERNS) else "track"
    print(f"{f:<45} {action}")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 5,
              cellTitle: 'Essential git commands for AI work',
              prose: [
                '## The commands you\'ll use every day',
                '```bash\n# Status and inspection\ngit status              # what changed?\ngit diff                # what specifically changed?\ngit log --oneline       # commit history, compact\ngit show <hash>         # full diff of one commit\n\n# Undoing mistakes\ngit restore <file>      # discard unstaged changes to a file\ngit restore --staged <file>  # unstage (keep changes)\ngit revert <hash>       # undo a commit (creates new commit)\ngit stash               # temporarily shelve changes\ngit stash pop           # restore stashed changes\n\n# Working with remotes\ngit clone <url>         # copy a repo\ngit pull                # fetch + merge from remote\ngit push                # upload local commits to remote\n\n# Branches\ngit branch              # list branches\ngit checkout -b <name>  # create and switch to branch\ngit merge <branch>      # merge branch into current\n```',
              ],
              code: `# Parse and explain git log output
sample_git_log = """
a3f8c12 feat: add RAG retrieval pipeline
9b2e147 test: measure embedding similarity accuracy
c5d4f21 fix: handle empty context window gracefully
7f1a830 refactor: extract chunking logic to utils
2e9b054 feat: implement basic vector store
da3c119 feat: initial commit
""".strip()

def parse_git_log(log_output):
    """Parse --oneline git log into structured commits."""
    commits = []
    for line in log_output.split('\\n'):
        line = line.strip()
        if not line:
            continue
        parts = line.split(' ', 1)
        if len(parts) == 2:
            hash_short, message = parts
            # Parse conventional commit type
            prefix = message.split(':')[0] if ':' in message else 'other'
            commits.append({
                "hash": hash_short,
                "type": prefix.strip(),
                "message": message,
            })
    return commits

commits = parse_git_log(sample_git_log)
print(f"{'Hash':<10} {'Type':<12} {'Message'}")
print("-" * 60)
for c in commits:
    print(f"{c['hash']:<10} {c['type']:<12} {c['message']}")

# Summarize by type
from collections import Counter
type_counts = Counter(c['type'] for c in commits)
print(f"\\nCommit type summary: {dict(type_counts)}")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 'c1',
              challengeType: 'write',
              challengeNumber: 1,
              challengeTitle: 'Implement `should_track`',
              difficulty: 'easy',
              prompt: 'Write `should_track(filename)` that returns `False` for files that should be gitignored in an AI project, and `True` for files that should be tracked. Use the patterns from the lesson: ignore `.env`, `*.pt`, `*.safetensors`, `*.ckpt`, `__pycache__`, `.venv`.',
              code: `import fnmatch

IGNORE_PATTERNS = [
    ".env", "*.env",
    "*.pt", "*.pth", "*.safetensors", "*.ckpt", "*.bin",
    "__pycache__",
    ".venv",
    "*.pyc",
    "*.key",
]

def should_track(filename):
    """Return True if file should be tracked in git, False if it should be ignored."""
    pass

# Tests
print(should_track("model.safetensors"))     # False
print(should_track(".env"))                  # False
print(should_track("src/rag_pipeline.py"))   # True
print(should_track("README.md"))             # True
print(should_track("checkpoint_epoch5.pt"))  # False
`,
              output: '', status: 'idle', figureJson: null,
              testCode: `
if 'should_track' not in dir():
    res = "ERROR: should_track not defined."
else:
    tests = [
        ("model.safetensors", False),
        (".env", False),
        ("src/rag_pipeline.py", True),
        ("README.md", True),
        ("weights.pt", False),
        ("config.yaml", True),
        ("module.pyc", False),
    ]
    failures = []
    for fname, expected in tests:
        got = should_track(fname)
        if got != expected:
            failures.append(f"should_track({fname!r}) → {got}, expected {expected}")
    if failures:
        res = "ERROR: " + "; ".join(failures)
    else:
        res = "SUCCESS: All gitignore rules applied correctly."
res
`,
              hint: 'Loop over IGNORE_PATTERNS and use `fnmatch.fnmatch(filename, pattern)`. Also check if `filename == pattern` for exact matches like ".env". Return False if any pattern matches, True otherwise.',
            },
            {
              id: 'c2',
              challengeType: 'write',
              challengeNumber: 2,
              challengeTitle: 'Git commit message validator',
              difficulty: 'medium',
              prompt: 'Write `validate_commit_message(msg)` that returns `(is_valid, reason)`. Valid messages: start with a type prefix (`feat:`, `fix:`, `test:`, `refactor:`, `docs:`), are under 72 characters, and are not empty.',
              code: `VALID_PREFIXES = ["feat:", "fix:", "test:", "refactor:", "docs:", "chore:", "perf:"]

def validate_commit_message(msg):
    """Return (is_valid: bool, reason: str)."""
    pass

# Tests
print(validate_commit_message("feat: add RAG pipeline"))            # (True, "valid")
print(validate_commit_message("add stuff"))                          # (False, "missing type prefix")
print(validate_commit_message(""))                                   # (False, "empty message")
print(validate_commit_message("feat: " + "x" * 80))                 # (False, "too long")
print(validate_commit_message("fix: handle empty context window"))  # (True, "valid")
`,
              output: '', status: 'idle', figureJson: null,
              testCode: `
if 'validate_commit_message' not in dir():
    res = "ERROR: validate_commit_message not defined."
else:
    cases = [
        ("feat: add RAG pipeline", True),
        ("add stuff", False),
        ("", False),
        ("feat: " + "x" * 80, False),
        ("fix: handle empty context window", True),
        ("docs: update README", True),
    ]
    failures = []
    for msg, expected_valid in cases:
        valid, reason = validate_commit_message(msg)
        if valid != expected_valid:
            failures.append(f"validate({msg[:30]!r}...) → valid={valid}, expected {expected_valid}")
    if failures:
        res = "ERROR: " + "; ".join(failures)
    else:
        res = "SUCCESS: Commit message validator works correctly."
res
`,
              hint: 'Check three conditions: (1) msg is empty → return False, "empty message". (2) Not starts with any VALID_PREFIXES → return False, "missing type prefix". (3) len(msg) > 72 → return False, "too long". Otherwise return True, "valid".',
            },
          ],
        },
      },
    ],
  },

  quiz: [
    {
      id: 'q1',
      question: 'What does `git add` do in the three-stage model?',
      options: [
        'Creates a commit in the repository',
        'Moves changes from the working directory to the staging area',
        'Pushes commits to the remote repository',
        'Downloads changes from the remote',
      ],
      correct: 1,
      explanation: 'git add moves changes from the working directory to the staging area. The staging area is a preview of the next commit. git commit then moves staged changes to the repository.',
    },
    {
      id: 'q2',
      question: 'Which files should always be in .gitignore for an AI project?',
      options: [
        'Python source files (.py)',
        'Configuration files (.yaml, .json)',
        'Model weights (.safetensors, .pt), environment files (.env), and generated files (__pycache__)',
        'README.md and documentation',
      ],
      correct: 2,
      explanation: 'Model weights are large binary files (often GB) that bloat the repo. .env files contain API keys — a committed API key is a permanent security leak. __pycache__ is auto-generated and not needed in the repo.',
    },
    {
      id: 'q3',
      question: 'Why do AI engineers use experiment branches instead of committing experiments to main?',
      options: [
        'Branches are required by all CI/CD systems',
        'Branches allow experimenting freely and reverting cleanly — if the experiment fails, delete the branch; if it works, merge it',
        'Branches are faster than committing to main',
        'git does not allow committing directly to main',
      ],
      correct: 1,
      explanation: 'An experiment branch is a parallel timeline. You can commit as many changes as you want without affecting the stable main branch. If the experiment fails, `git branch -d experiment/xyz` removes it completely. If it succeeds, `git merge` brings it in.',
    },
  ],
}
