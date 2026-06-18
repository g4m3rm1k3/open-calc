export default {
  id: 'ae-p0-11-linux',
  slug: 'linux-for-ai',
  chapter: 'ae-p0',
  order: 10,
  title: 'Linux for AI',
  subtitle: 'Most AI runs on Linux. You need to know enough to not be stuck.',
  tags: ['linux', 'ubuntu', 'bash', 'permissions', 'apt', 'ssh', 'rsync', 'tmux', 'wsl2', 'filesystem'],

  hook: {
    question: 'What do you do when you SSH into a GPU box and have no GUI, no Finder, and no Explorer?',
    realWorldContext:
      'You develop on macOS or Windows. But the moment you SSH into a cloud GPU box, rent a Lambda instance, or spin up an EC2 machine, you land in Ubuntu. The terminal is your only interface. If you can\'t navigate the file system, install packages, and manage processes from the command line, you\'re stuck paying for idle GPU hours while googling "how to unzip a file in Linux." This is a survival guide — exactly what you need to operate on a remote Linux machine for AI work.',
    previewVisualizationId: 'PythonNotebook',
  },

  intuition: {
    prose: [
      'Linux organizes everything under a single root `/`. Your home directory `~` is where you do almost all your work. Understanding the six directories you will actually touch — `/home`, `/tmp`, `/usr`, `/etc`, `/var/log`, `/proc` — is enough for AI engineering.',
      'The 15 commands that cover 95% of remote GPU box work: `pwd`, `ls`, `cd`, `mkdir`, `cp`, `mv`, `rm`, `cat`, `head`, `tail`, `grep`, `find`, `chmod`, `apt`, `htop`. Everything else is optional.',
    ],
    callouts: [
      {
        type: 'warning',
        title: 'rm -rf is permanent',
        body: '`rm -rf` deletes a directory and everything inside it with no undo, no trash, no confirmation. Double-check the path before pressing Enter. This command has deleted production databases.',
      },
      {
        type: 'insight',
        title: 'macOS → Linux gotcha: case-sensitive filesystem',
        body: 'macOS filesystems are case-insensitive by default. Linux is case-sensitive. `Model.py` and `model.py` are two different files on Linux. This breaks import statements when moving code between systems.',
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'Linux for AI',
        mathBridge: 'Linux file permissions are a 3-bit octet per role: owner | group | other. chmod 755 = 7 (rwx) for owner, 5 (r-x) for group and other.',
        caption: 'Work through these cells to build Linux survival skills for remote GPU box work.',
        props: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Essential commands: navigation and file operations',
              prose: [
                '## Moving around',
                '```bash\npwd                  # Where am I?\nls                   # What\'s here?\nls -la               # With hidden files and details\ncd /path/to/dir      # Go there\ncd ~                 # Go home\ncd ..                # Up one level\n```',
                '## Files and directories',
                '```bash\nmkdir my-project          # Create a directory\nmkdir -p a/b/c            # Create nested directories\n\ncp file.txt backup.txt    # Copy a file\ncp -r src/ src-backup/    # Copy a directory\n\nmv old.txt new.txt        # Rename\nmv file.txt /tmp/         # Move\n\nrm file.txt               # Delete (no undo!)\nrm -rf my-dir/            # Delete directory and contents\n```',
                '## Reading files',
                '```bash\ncat file.txt              # Print entire file\nhead -20 file.txt         # First 20 lines\ntail -20 file.txt         # Last 20 lines\ntail -f log.txt           # Follow in real time\nless file.txt             # Scroll through (q to quit)\n```',
              ],
              code: `import os
import sys
from pathlib import Path

# Simulate Linux filesystem exploration
def explore_directory(path=None):
    """
    Simulate 'ls -la' output for a directory.
    Works on any OS — same commands in Linux.
    """
    if path is None:
        path = Path.home()
    else:
        path = Path(path)

    if not path.exists():
        print(f"Directory not found: {path}")
        return

    print(f"Directory: {path}")
    print(f"{'Type':<6} {'Name':<30} {'Size':>10}")
    print("-" * 50)

    try:
        entries = sorted(path.iterdir(), key=lambda p: (p.is_file(), p.name))
        for entry in entries[:15]:  # limit output
            if entry.is_dir():
                type_str = "dir"
                size_str = "-"
            else:
                type_str = "file"
                try:
                    size_str = f"{entry.stat().st_size:,} B"
                except:
                    size_str = "?"
            print(f"  {type_str:<4} {entry.name:<30} {size_str:>10}")
        if len(list(path.iterdir())) > 15:
            print(f"  ... (showing first 15 of {len(list(path.iterdir()))} entries)")
    except PermissionError:
        print("  (Permission denied)")

# Show current working directory
print(f"pwd: {os.getcwd()}")
print(f"Home (~): {Path.home()}")
print(f"Python executable: {sys.executable}")
print()
explore_directory(os.getcwd())`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 2,
              cellTitle: 'Permissions: chmod and chown',
              prose: [
                '## Understanding permission bits',
                '```bash\nls -l train.py\n# -rwxr-xr-- 1 user group 2048 train.py\n#  ^^^             owner: read, write, execute\n#     ^^^          group: read, execute\n#        ^^        others: read only\n```',
                '## The three numbers in chmod',
                '7 = rwx (4+2+1), 5 = r-x (4+0+1), 4 = r-- (4+0+0), 6 = rw- (4+2+0)',
                '```bash\nchmod +x train.sh          # Make executable\nchmod 755 deploy.sh        # Owner: full, others: read+execute\nchmod 644 config.yaml      # Owner: read+write, others: read\n\nchown user:group file.txt  # Change owner (needs sudo)\n```',
                '"Permission denied" almost always means `chmod +x` will fix it.',
              ],
              code: `def explain_permissions(octal_str):
    """
    Explain a chmod octal permission string.
    e.g. "755" -> "owner: rwx, group: r-x, others: r-x"
    """
    if len(octal_str) != 3 or not all(c in '01234567' for c in octal_str):
        raise ValueError(f"Expected 3-digit octal string, got: {octal_str}")

    bits_map = {
        0: '---', 1: '--x', 2: '-w-', 3: '-wx',
        4: 'r--', 5: 'r-x', 6: 'rw-', 7: 'rwx',
    }
    roles = ['owner', 'group', 'others']

    result = {}
    for role, digit in zip(roles, octal_str):
        result[role] = bits_map[int(digit)]

    return result

# Common permission patterns in AI work
patterns = {
    "755": "Training scripts (executable by all, writable by owner)",
    "644": "Config files, data files (readable by all, writable by owner)",
    "600": "SSH keys (readable by owner only)",
    "777": "Shared scratch dir (everyone can read/write/execute) — use carefully",
    "400": "Read-only model weights",
}

print("Common chmod patterns for AI projects:")
print("=" * 60)
for perm, use_case in patterns.items():
    explained = explain_permissions(perm)
    print(f"\\nchmod {perm}  —  {use_case}")
    for role, bits in explained.items():
        print(f"  {role:<7}: {bits}")

print("\\nFix 'Permission denied' when running a script:")
print("  chmod +x train.sh")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 3,
              cellTitle: 'apt, disk space, and macOS→Linux gotchas',
              prose: [
                '## Package management with apt',
                '```bash\nsudo apt update                          # Refresh package list (always first)\nsudo apt install -y htop tmux build-essential git curl wget unzip python3-venv\nsudo apt remove htop                    # Uninstall\n```',
                '## Disk space (models fill disks fast)',
                '```bash\ndf -h                                    # All mounted drives\ndu -sh *                                # Size of each item here\ndu -h --max-depth=1 / 2>/dev/null | sort -hr | head -20  # Biggest dirs\n\n# Clear caches\npip cache purge\nsudo apt clean\n```',
                '## macOS → Linux gotchas',
                `| macOS | Linux | Notes |
|-------|-------|-------|
| \`brew install\` | \`sudo apt install\` | Different package names sometimes |
| \`~/.zshrc\` | \`~/.bashrc\` | macOS defaults to zsh, Linux to bash |
| \`sed -i '' 's/a/b/'\` | \`sed -i 's/a/b/'\` | macOS sed needs empty string after -i |
| Case-insensitive FS | Case-sensitive FS | \`Model.py\` ≠ \`model.py\` on Linux |
| \`open file.txt\` | \`xdg-open\` or \`cat\` | No GUI on remote boxes |`,
              ],
              code: `# Demonstrate the case-sensitivity gotcha and other macOS→Linux differences

macos_linux_diffs = [
    {
        "issue": "Case-sensitive filesystem",
        "macos": "Model.py and model.py are the SAME file",
        "linux": "Model.py and model.py are DIFFERENT files",
        "fix": "Rename imports to be consistent: always use lowercase filenames",
    },
    {
        "issue": "sed -i syntax",
        "macos": "sed -i '' 's/old/new/' file",
        "linux": "sed -i 's/old/new/' file",
        "fix": "Use Python for cross-platform text substitution instead",
    },
    {
        "issue": "Default shell",
        "macos": "zsh (~/.zshrc)",
        "linux": "bash (~/.bashrc)",
        "fix": "Add aliases and env vars to ~/.bashrc on Linux servers",
    },
    {
        "issue": "Package manager",
        "macos": "brew install package",
        "linux": "sudo apt install package (name may differ)",
        "fix": "Check: brew install readline → apt install libreadline-dev",
    },
    {
        "issue": "Windows line endings",
        "macos": "LF (\\\\n) line endings",
        "linux": "LF (\\\\n) same — but Windows uses CRLF (\\\\r\\\\n)",
        "fix": "If script fails on Linux after editing on Windows: dos2unix script.sh",
    },
]

print("macOS → Linux Gotchas for AI Engineers:")
print("=" * 50)
for diff in macos_linux_diffs:
    print(f"\\n⚠ {diff['issue']}")
    print(f"  macOS: {diff['macos']}")
    print(f"  Linux: {diff['linux']}")
    print(f"  Fix:   {diff['fix']}")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 'c1',
              challengeType: 'write',
              challengeNumber: 1,
              challengeTitle: 'chmod permission decoder',
              difficulty: 'easy',
              prompt: 'Write `decode_permissions(octal_str)` that takes a 3-digit octal string (e.g. `"755"`) and returns a dict with keys `"owner"`, `"group"`, `"others"`, each mapping to a dict with boolean keys `"read"`, `"write"`, `"execute"`. Also write `encode_permissions(perms_dict)` that does the reverse — takes the nested dict and returns the octal string.',
              code: `def decode_permissions(octal_str):
    """
    Decode "755" -> {owner: {read: T, write: T, execute: T}, ...}
    """
    pass

def encode_permissions(perms_dict):
    """
    Encode {owner: {read: T, write: T, execute: T}, ...} -> "755"
    """
    pass

# Test decode
for perm in ["755", "644", "600", "777", "400"]:
    decoded = decode_permissions(perm)
    re_encoded = encode_permissions(decoded)
    match = "✓" if re_encoded == perm else "✗"
    print(f"{perm} → owner={decoded['owner']}, group={decoded['group']}, others={decoded['others']} → {re_encoded} {match}")
`,
              output: '', status: 'idle', figureJson: null,
              testCode: `
if 'decode_permissions' not in dir() or 'encode_permissions' not in dir():
    res = "ERROR: decode_permissions or encode_permissions not defined."
else:
    d = decode_permissions("755")
    if not isinstance(d, dict) or 'owner' not in d:
        res = f"ERROR: decode_permissions should return dict with owner/group/others keys, got {d}"
    elif not d['owner'].get('read') or not d['owner'].get('write') or not d['owner'].get('execute'):
        res = f"ERROR: owner in '755' should have read+write+execute, got {d['owner']}"
    elif d['others'].get('write'):
        res = f"ERROR: others in '755' should NOT have write, got {d['others']}"
    else:
        for perm in ["755", "644", "600", "777", "400"]:
            encoded = encode_permissions(decode_permissions(perm))
            if encoded != perm:
                res = f"ERROR: encode(decode('{perm}')) = '{encoded}', expected '{perm}'"
                break
        else:
            res = "SUCCESS: decode_permissions and encode_permissions are inverses for all test cases."
res
`,
              hint: 'Each digit is 0-7. Bit 4=read, bit 2=write, bit 1=execute. decode: int(digit) & 4 != 0 → read. encode: read*4 + write*2 + execute*1 for each role.',
            },
            {
              id: 'c2',
              challengeType: 'write',
              challengeNumber: 2,
              challengeTitle: 'Disk usage analyzer',
              difficulty: 'medium',
              prompt: 'Write `analyze_disk_usage(entries)` where `entries` is a list of `(path, size_mb)` tuples. Return a dict with: `"total_mb"`, `"largest"` (the path with the most MB), `"by_extension"` (dict mapping extension to total MB), and `"top_5"` (list of the 5 largest `(path, size_mb)` tuples sorted descending by size).',
              code: `from pathlib import Path

def analyze_disk_usage(entries):
    """
    Analyze disk usage entries.
    entries: list of (path_str, size_mb) tuples
    Returns: {total_mb, largest, by_extension, top_5}
    """
    pass

# Simulate du output for a model training directory
entries = [
    ("models/llama-7b/model.safetensors", 13_500),
    ("models/llama-7b/tokenizer.json", 2),
    ("data/train.parquet", 8_400),
    ("data/val.parquet", 1_050),
    ("checkpoints/epoch_01.pt", 6_200),
    ("checkpoints/epoch_02.pt", 6_200),
    ("checkpoints/epoch_03.pt", 6_200),
    ("outputs/predictions.csv", 450),
    ("outputs/metrics.json", 1),
    ("src/train.py", 0),
]

result = analyze_disk_usage(entries)
print(f"Total: {result['total_mb']:,} MB ({result['total_mb']/1024:.1f} GB)")
print(f"Largest: {result['largest']}")
print(f"\\nBy extension:")
for ext, mb in sorted(result['by_extension'].items(), key=lambda x: -x[1]):
    print(f"  {ext or '(no ext)'}: {mb:,} MB")
print(f"\\nTop 5 largest files:")
for path, mb in result['top_5']:
    print(f"  {path}: {mb:,} MB")
`,
              output: '', status: 'idle', figureJson: null,
              testCode: `
from pathlib import Path
if 'analyze_disk_usage' not in dir():
    res = "ERROR: analyze_disk_usage not defined."
else:
    entries = [
        ("models/a.safetensors", 1000),
        ("data/train.parquet", 500),
        ("data/val.parquet", 200),
        ("src/train.py", 1),
        ("outputs/results.csv", 50),
    ]
    r = analyze_disk_usage(entries)
    if r.get('total_mb') != 1751:
        res = f"ERROR: total_mb should be 1751, got {r.get('total_mb')}"
    elif r.get('largest') != 'models/a.safetensors':
        res = f"ERROR: largest should be 'models/a.safetensors', got {r.get('largest')}"
    elif r.get('by_extension', {}).get('.parquet') != 700:
        res = f"ERROR: .parquet total should be 700 MB, got {r.get('by_extension', {}).get('.parquet')}"
    elif len(r.get('top_5', [])) != 5:
        res = f"ERROR: top_5 should have 5 entries, got {len(r.get('top_5', []))}"
    elif r['top_5'][0][0] != 'models/a.safetensors':
        res = f"ERROR: top_5[0] should be the largest, got {r['top_5'][0]}"
    else:
        res = "SUCCESS: analyze_disk_usage correctly computes totals, largest, extension breakdown, and top 5."
res
`,
              hint: 'total_mb = sum of all sizes. largest = max by size. by_extension: use Path(p).suffix as key, accumulate. top_5 = sorted(entries, key=lambda x: -x[1])[:5].',
            },
          ],
        },
      },
    ],
  },

  quiz: [
    {
      id: 'q1',
      question: "What does the '~' symbol represent in a Linux file path?",
      options: [
        'The root directory of the file system',
        "The current user's home directory",
        'The temporary files directory',
        'The directory where system programs are installed',
      ],
      correct: 1,
      explanation: "The tilde (~) is a shortcut for the current user's home directory, typically /home/username on Linux. 'cd ~' takes you home from anywhere.",
    },
    {
      id: 'q2',
      question: "What is the purpose of 'sudo' before a command?",
      options: [
        'It speeds up the command execution',
        'It runs the command with root (administrator) privileges',
        'It runs the command in a sandboxed environment',
        'It logs the command output to a system file',
      ],
      correct: 1,
      explanation: 'sudo (superuser do) temporarily elevates your privileges to root level for a single command. Required for system-level operations like installing packages with apt.',
    },
    {
      id: 'q3',
      question: "You get 'Permission denied' when trying to run a shell script. What command fixes this?",
      options: [
        'sudo rm script.sh',
        'chmod +x script.sh',
        'chown root script.sh',
        'mv script.sh /usr/bin/',
      ],
      correct: 1,
      explanation: 'chmod +x adds execute permission to the file. Without the execute bit set, the shell refuses to run the script even if you own it.',
    },
    {
      id: 'q4',
      question: 'On a remote GPU box, your training data fills the disk. Which command shows the largest directories consuming space?',
      options: [
        'ls -la /',
        'du -h --max-depth=1 / | sort -hr | head -20',
        'cat /proc/meminfo',
        'free -h',
      ],
      correct: 1,
      explanation: 'du -h shows disk usage per directory, --max-depth=1 limits to top-level directories, and sort -hr sorts by size in descending order. This reveals which directories are consuming the most space.',
    },
    {
      id: 'q5',
      question: "What is a key difference between the macOS and Linux versions of 'sed -i'?",
      options: [
        'Linux sed is faster than macOS sed',
        'macOS sed requires an empty string argument after -i (\'sed -i "" pattern file\'), while Linux does not',
        'Linux sed does not support regular expressions',
        'macOS sed cannot modify files in place',
      ],
      correct: 1,
      explanation: "macOS uses BSD sed which requires 'sed -i \"\" pattern file', while Linux uses GNU sed which accepts 'sed -i pattern file'. This is a common gotcha when moving scripts between systems.",
    },
  ],
}
