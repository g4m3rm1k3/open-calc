export default {
  id: 'ae-p0-10-terminal',
  slug: 'terminal-and-shell',
  chapter: 'ae-p0',
  order: 9,
  title: 'Terminal & Shell',
  subtitle: 'The terminal is where AI engineers live. Get comfortable here.',
  tags: ['terminal', 'bash', 'tmux', 'ssh', 'rsync', 'pipes', 'redirects', 'htop', 'nvidia-smi'],

  hook: {
    question: 'How do you keep a training run alive after you close your laptop and go home?',
    realWorldContext:
      'You will spend more time in the terminal than in any editor. Training runs, GPU monitoring, log tailing, remote SSH sessions, environment management — every AI workflow touches the shell. If you\'re slow here, you\'re slow everywhere. This lesson covers the terminal skills that matter for AI work: no history of Unix, no deep-dive into Bash scripting, just what you need.',
    previewVisualizationId: 'PythonNotebook',
  },

  intuition: {
    prose: [
      'The core AI terminal workflow: start a tmux session, launch training in one pane, watch GPU usage in another, tail logs in a third. Detach with Ctrl+B, D — training keeps running. SSH back from home, reattach, and pick up where you left off.',
      'Three tools cover most AI terminal work: tmux (persistent sessions with multiple panes), pipes + redirects (process training logs), and SSH + rsync (transfer files to/from remote GPU boxes).',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'tmux is the single most useful tool for managing training runs',
        body: 'tmux lets you run multiple terminal sessions inside one window and detach/reattach them. A training run inside tmux survives closing your laptop. A training run with `&` does not.',
      },
      {
        type: 'warning',
        title: 'Use rsync over scp for large transfers',
        body: 'rsync only transfers changed bytes and resumes on failure. For anything larger than a few MB — model checkpoints, datasets — always use `rsync -avz --progress` instead of `scp`.',
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'Terminal & Shell',
        mathBridge: 'A pipe (|) is function composition: f(g(x)). Each command transforms the data stream and passes it to the next. `cat log | grep loss | awk \'{print $NF}\'` = parse(filter(read(log))).',
        caption: 'Work through these cells to build the terminal workflow for AI engineering.',
        props: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Piping and redirects for log processing',
              prose: [
                '## The three redirects you need',
                '| Symbol | What it does |\n|--------|-------------|\n| `>` | Write stdout to file (overwrite) |\n| `>>` | Append stdout to file |\n| `2>` | Write stderr to file |\n| `2>&1` | Send stderr to same place as stdout |\n| `\\|` | Send stdout of one command as stdin to the next |',
                '## Common AI log patterns',
                '```bash\n# Count how many times "loss" appears in a log\ncat train.log | grep "loss" | wc -l\n\n# Extract just the loss values\ngrep "loss:" train.log | awk \'{print $NF}\' > losses.txt\n\n# Watch a log in real time, filtering for errors\ntail -f train.log | grep --line-buffered "ERROR"\n\n# Redirect both stdout and stderr to one file\npython train.py > train_full.log 2>&1\n```',
              ],
              code: `import io
import re

def process_training_log(log_text):
    """
    Simulate shell pipeline: grep "loss" | extract values
    Equivalent to: grep "loss:" log | awk '{print $NF}'
    """
    lines = log_text.strip().split('\\n')

    # Step 1: grep equivalent — filter lines containing "loss:"
    loss_lines = [l for l in lines if 'loss:' in l]

    # Step 2: awk equivalent — extract the last field
    loss_values = []
    for line in loss_lines:
        parts = line.split()
        if parts:
            try:
                loss_values.append(float(parts[-1]))
            except ValueError:
                pass

    return loss_lines, loss_values

# Simulate a training log
fake_log = """
Epoch 1/10: step 100/500, loss: 2.3041
Epoch 1/10: step 200/500, loss: 1.9823
Epoch 1/10: step 300/500, loss: 1.7654
INFO: Saving checkpoint at step 300
Epoch 1/10: step 400/500, loss: 1.5432
WARNING: GPU memory at 90%
Epoch 1/10: step 500/500, loss: 1.3210
"""

loss_lines, values = process_training_log(fake_log)
print(f"Log lines matching 'loss:' ({len(loss_lines)} of {len(fake_log.split(chr(10)))-1} total):")
for line in loss_lines:
    print(f"  {line.strip()}")

print(f"\\nExtracted loss values: {values}")
print(f"Final loss: {values[-1]:.4f}")
print(f"Improvement: {values[0] - values[-1]:.4f} over {len(values)} steps")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 2,
              cellTitle: 'Background processes: &, nohup, tmux',
              prose: [
                '## Comparison',
                '| Method | Survives terminal close? | Can reattach? |\n|--------|-------------------------|---------------|\n| `command &` | No | No |\n| `nohup command &` | Yes | No (check log file) |\n| `screen` / `tmux` | Yes | Yes |',
                '## For anything longer than a few minutes, use tmux',
                '```bash\ntmux new -s training\n\n# Pane 1: start training\npython train.py --epochs 100 --lr 1e-4\n\n# Ctrl+B, " to split, then run GPU monitor\nwatch -n1 nvidia-smi\n\n# Ctrl+B, % to split vertically, tail the logs\ntail -f logs/experiment.log\n\n# Detach with Ctrl+B, d\n# SSH out, go home, come back\n# tmux attach -t training\n```',
                '## Key tmux shortcuts',
                '```bash\ntmux new -s training     # new session\ntmux attach -t training  # reattach\ntmux ls                  # list sessions\n# Inside tmux:\n# Ctrl+B, "  → split horizontal\n# Ctrl+B, %  → split vertical\n# Ctrl+B, arrow → navigate panes\n# Ctrl+B, d  → detach\n```',
              ],
              code: `# Demonstrate the difference between background methods

methods = {
    "command &": {
        "survives_close": False,
        "reattachable": False,
        "use_case": "Quick background tasks (< 1 min)",
        "example": "python quick_eval.py &",
        "check_output": "jobs  (then fg to bring back)",
    },
    "nohup command &": {
        "survives_close": True,
        "reattachable": False,
        "use_case": "Fire-and-forget jobs, output to log file",
        "example": "nohup python train.py > train.log 2>&1 &",
        "check_output": "tail -f train.log",
    },
    "tmux": {
        "survives_close": True,
        "reattachable": True,
        "use_case": "Long training runs, multi-pane GPU monitoring",
        "example": "tmux new -s training → python train.py",
        "check_output": "tmux attach -t training",
    },
}

print("Background process methods for AI training:")
print("=" * 55)
for method, info in methods.items():
    survive = "✓" if info["survives_close"] else "✗"
    reattach = "✓" if info["reattachable"] else "✗"
    print(f"\\n{method}")
    print(f"  Survives terminal close: {survive}")
    print(f"  Reattachable:           {reattach}")
    print(f"  Use case: {info['use_case']}")
    print(f"  Example:  {info['example']}")
    print(f"  Check:    {info['check_output']}")

print("\\nRule: If training takes > 5 minutes, use tmux.")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 3,
              cellTitle: 'GPU monitoring and SSH for remote boxes',
              prose: [
                '## Monitor GPU',
                '```bash\nnvidia-smi                                    # snapshot\nwatch -n1 nvidia-smi                          # update every second\nnvidia-smi --query-gpu=index,name,utilization.gpu,memory.used,memory.total --format=csv  # parseable\nhtop                                          # CPU + memory\n```',
                '## SSH and file transfer',
                '```bash\n# Connect\nssh user@gpu-box-ip\nssh -i ~/.ssh/my_gpu_key user@gpu-box-ip\n\n# Copy files\nscp model.pt user@gpu-box-ip:~/models/\nscp user@gpu-box-ip:~/results/metrics.json ./\n\n# Sync a directory (faster, resumes on failure)\nrsync -avz ./data/ user@gpu-box-ip:~/data/\nrsync -avz --progress user@gpu-box-ip:~/results/ ./results/\n\n# Port forward (access remote Jupyter locally)\nssh -L 8888:localhost:8888 user@gpu-box-ip\n# Then open localhost:8888 in browser\n```',
                '## ~/.ssh/config',
                '```\nHost gpu\n    HostName 192.168.1.100\n    User ubuntu\n    IdentityFile ~/.ssh/gpu_key\n# Then just: ssh gpu\n```',
              ],
              code: `# Simulate GPU monitoring output parsing
# (nvidia-smi --query-gpu=... --format=csv output)

mock_gpu_output = """index, name, utilization.gpu [%], memory.used [MiB], memory.total [MiB], temperature.gpu
0, NVIDIA RTX 4090, 87 %, 18432 MiB, 24576 MiB, 74
1, NVIDIA RTX 4090, 12 %, 2048 MiB, 24576 MiB, 51
"""

def parse_nvidia_smi(output):
    lines = [l.strip() for l in output.strip().split('\\n')]
    headers = [h.strip() for h in lines[0].split(',')]
    gpus = []
    for line in lines[1:]:
        values = [v.strip() for v in line.split(',')]
        gpu = {}
        for h, v in zip(headers, values):
            # Normalize: remove units
            v = v.replace(' %', '').replace(' MiB', '').strip()
            gpu[h.split('[')[0].strip()] = v
        gpus.append(gpu)
    return gpus

gpus = parse_nvidia_smi(mock_gpu_output)
print("GPU Status:")
print("-" * 50)
for gpu in gpus:
    util = int(gpu.get('utilization.gpu', 0))
    mem_used = int(gpu.get('memory.used', 0))
    mem_total = int(gpu.get('memory.total', 1))
    mem_pct = mem_used / mem_total * 100
    bar_util = '█' * (util // 5) + '░' * (20 - util // 5)
    bar_mem = '█' * int(mem_pct // 5) + '░' * (20 - int(mem_pct // 5))
    print(f"GPU {gpu['index']}: {gpu['name']}")
    print(f"  Util: [{bar_util}] {util}%")
    print(f"  Mem:  [{bar_mem}] {mem_used}/{mem_total} MiB ({mem_pct:.0f}%)")
    print(f"  Temp: {gpu['temperature.gpu']}°C")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 'c1',
              challengeType: 'write',
              challengeNumber: 1,
              challengeTitle: 'Training log parser',
              difficulty: 'easy',
              prompt: 'Write `parse_training_log(log_text)` that parses a training log where each progress line has the format `"Epoch N/T: step S/ST, loss: V"`. Return a list of dicts with keys `"epoch"`, `"step"`, and `"loss"`. Ignore lines that don\'t match this format.',
              code: `import re

def parse_training_log(log_text):
    """
    Parse training log lines like: "Epoch 1/10: step 100/500, loss: 2.3041"
    Returns list of {epoch, step, loss} dicts for matching lines only.
    """
    pass

log = """
Starting training...
Epoch 1/3: step 100/300, loss: 2.3041
Epoch 1/3: step 200/300, loss: 1.9823
INFO: Checkpoint saved
Epoch 1/3: step 300/300, loss: 1.7654
Epoch 2/3: step 100/300, loss: 1.5432
WARNING: High memory usage
Epoch 2/3: step 200/300, loss: 1.3210
Epoch 2/3: step 300/300, loss: 1.1987
Epoch 3/3: step 100/300, loss: 1.0654
Epoch 3/3: step 300/300, loss: 0.8432
Training complete.
"""

entries = parse_training_log(log)
print(f"Parsed {len(entries)} training steps:")
for e in entries:
    print(f"  Epoch {e['epoch']}, step {e['step']}: loss={e['loss']:.4f}")

if entries:
    print(f"\\nBest loss: {min(e['loss'] for e in entries):.4f}")
    print(f"Final loss: {entries[-1]['loss']:.4f}")
`,
              output: '', status: 'idle', figureJson: null,
              testCode: `
import re
if 'parse_training_log' not in dir():
    res = "ERROR: parse_training_log not defined."
else:
    log = "Epoch 1/3: step 100/300, loss: 2.3041\\nINFO: irrelevant\\nEpoch 2/3: step 200/300, loss: 1.5000"
    entries = parse_training_log(log)
    if len(entries) != 2:
        res = f"ERROR: Expected 2 entries (ignoring INFO line), got {len(entries)}"
    elif entries[0].get('epoch') != 1 or entries[0].get('step') != 100:
        res = f"ERROR: First entry should be epoch=1, step=100, got {entries[0]}"
    elif abs(entries[0].get('loss', 0) - 2.3041) > 0.001:
        res = f"ERROR: First loss should be 2.3041, got {entries[0].get('loss')}"
    elif entries[1].get('epoch') != 2:
        res = f"ERROR: Second entry epoch should be 2, got {entries[1].get('epoch')}"
    else:
        res = "SUCCESS: parse_training_log correctly extracts epoch, step, and loss values."
res
`,
              hint: 'Use re.search or re.match with pattern like r"Epoch (\\d+)/\\d+: step (\\d+)/\\d+, loss: ([\\d.]+)". Convert captured groups to int, int, float.',
            },
            {
              id: 'c2',
              challengeType: 'write',
              challengeNumber: 2,
              challengeTitle: 'tmux session manager',
              difficulty: 'medium',
              prompt: 'Write a `TmuxSessionManager` class with `new_session(name)`, `attach(name)`, `detach()`, `list_sessions()`, and `kill_session(name)` methods that simulate tmux session state. `new_session` raises `ValueError` if the session already exists. `attach` raises `ValueError` if the session doesn\'t exist. Store which session is currently "attached" (one at a time).',
              code: `class TmuxSessionManager:
    """Simulate tmux session state."""

    def __init__(self):
        self.sessions = {}       # name -> {"created": bool, "panes": int}
        self.attached = None     # currently attached session name

    def new_session(self, name):
        """Create a new session. Raises ValueError if already exists."""
        pass

    def attach(self, name):
        """Attach to a session. Raises ValueError if doesn't exist."""
        pass

    def detach(self):
        """Detach from current session."""
        pass

    def list_sessions(self):
        """Return list of session names."""
        pass

    def kill_session(self, name):
        """Delete a session. Raises ValueError if doesn't exist."""
        pass

tmux = TmuxSessionManager()
tmux.new_session("training")
tmux.new_session("eval")

print(f"Sessions: {tmux.list_sessions()}")

tmux.attach("training")
print(f"Attached: {tmux.attached}")

tmux.detach()
print(f"After detach: {tmux.attached}")

tmux.kill_session("eval")
print(f"After kill eval: {tmux.list_sessions()}")

# Try to create duplicate
try:
    tmux.new_session("training")
except ValueError as e:
    print(f"Duplicate error: {e}")
`,
              output: '', status: 'idle', figureJson: null,
              testCode: `
if 'TmuxSessionManager' not in dir():
    res = "ERROR: TmuxSessionManager not defined."
else:
    t = TmuxSessionManager()
    t.new_session("train")
    t.new_session("eval")
    if set(t.list_sessions()) != {"train", "eval"}:
        res = f"ERROR: list_sessions should return ['train','eval'] (any order), got {t.list_sessions()}"
    else:
        t.attach("train")
        if t.attached != "train":
            res = f"ERROR: attached should be 'train', got {t.attached}"
        else:
            t.detach()
            if t.attached is not None:
                res = f"ERROR: attached should be None after detach, got {t.attached}"
            else:
                try:
                    t.new_session("train")
                    res = "ERROR: Should raise ValueError for duplicate session name."
                except ValueError:
                    t.kill_session("eval")
                    if "eval" in t.list_sessions():
                        res = "ERROR: 'eval' should be removed after kill_session."
                    else:
                        res = "SUCCESS: TmuxSessionManager correctly manages session lifecycle."
res
`,
              hint: 'Use a dict self.sessions for session names. new_session: check if name in self.sessions, raise ValueError if so. attach: check if name in sessions, set self.attached. detach: set self.attached = None. kill_session: remove from dict.',
            },
          ],
        },
      },
    ],
  },

  quiz: [
    {
      id: 'q1',
      question: "What does the pipe operator '|' do in a shell command?",
      options: [
        'Runs two commands in parallel',
        'Sends the standard output of one command as standard input to the next',
        'Saves the output of a command to a file',
        'Combines two files into one',
      ],
      correct: 1,
      explanation: "The pipe operator connects commands in a pipeline. For example, 'cat log.txt | grep error' sends the contents of log.txt as input to grep, which filters for lines containing 'error'.",
    },
    {
      id: 'q2',
      question: 'What happens to a running process when you close the terminal that started it?',
      options: [
        'The process continues running in the background',
        'The process receives a hangup signal (SIGHUP) and typically terminates',
        'The process pauses until you open a new terminal',
        'The process automatically migrates to a system service',
      ],
      correct: 1,
      explanation: 'Closing the terminal sends SIGHUP to child processes, which causes them to terminate by default. Tools like tmux, nohup, or screen prevent this.',
    },
    {
      id: 'q3',
      question: "What is the key advantage of tmux over using 'nohup command &' for long-running training jobs?",
      options: [
        'tmux uses less CPU than nohup',
        'tmux lets you detach, reattach, and see live output with multiple panes',
        'tmux automatically restarts failed processes',
        'tmux compresses the process output to save disk space',
      ],
      correct: 1,
      explanation: "tmux creates persistent sessions you can detach from and reattach to later, with live output visible in multiple panes. nohup only logs to a file with no way to interact or reattach.",
    },
    {
      id: 'q4',
      question: "What does 'python train.py > output.log 2>&1' accomplish?",
      options: [
        'Runs train.py and saves only errors to output.log',
        'Runs train.py and redirects both standard output and standard error to output.log',
        'Runs train.py twice and logs the second run',
        'Runs train.py with double the memory allocation',
      ],
      correct: 1,
      explanation: "'> output.log' redirects stdout to the file. '2>&1' sends stderr to the same place as stdout. The result is both normal output and errors captured in one file.",
    },
    {
      id: 'q5',
      question: 'Which command lets you access a remote Jupyter notebook running on port 8888 of a GPU box from your local browser?',
      options: [
        'scp -P 8888 user@gpu-box:~/notebook.ipynb',
        'ssh -L 8888:localhost:8888 user@gpu-box',
        'rsync -avz user@gpu-box:8888 localhost:8888',
        'ssh user@gpu-box --forward-port 8888',
      ],
      correct: 1,
      explanation: 'SSH local port forwarding (-L) maps a remote port to your local machine. After this command, opening localhost:8888 in your browser accesses the remote Jupyter server.',
    },
  ],
}
