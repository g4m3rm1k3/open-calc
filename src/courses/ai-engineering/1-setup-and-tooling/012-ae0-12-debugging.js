export default {
  id: 'ae-p0-12-debugging',
  slug: 'debugging-and-profiling',
  chapter: 'ae-p0',
  order: 11,
  title: 'Debugging & Profiling',
  subtitle: 'The worst AI bugs don\'t crash. They train silently on garbage and report a beautiful loss curve.',
  tags: ['debugging', 'profiling', 'tensorboard', 'pdb', 'breakpoint', 'nan', 'cProfile', 'memory', 'shape-mismatch'],

  hook: {
    question: 'How do you catch the bugs that never crash but silently waste 8 hours of GPU time?',
    realWorldContext:
      'AI code fails differently than regular code. A web app crashes with a stack trace. A misconfigured training loop runs for 8 hours, burns $200 in GPU time, and produces a model that predicts the mean of every input. The code never errored. The bug was a tensor on the wrong device, a forgotten `.detach()`, or labels leaking into features. You need debugging tools that catch these silent failures before they waste your time and compute.',
    previewVisualizationId: 'PythonNotebook',
  },

  intuition: {
    prose: [
      'AI debugging operates at three levels: (1) standard Python — breakpoints, logging, profiling; (2) tensor operations — shapes, dtypes, devices, NaN/Inf; (3) training dynamics — loss curves, gradient norms, activations. Most people jump straight to level 3. But 80% of AI bugs live at levels 1 and 2.',
      'The five most common AI bugs: shape mismatch (tensor has wrong dimensions), NaN loss (something exploded — learning rate too high, log of zero), data leakage (test samples in training set), wrong device (CPU tensor silently passed to GPU model), and forgotten `.detach()` (computational graph builds up and OOMs).',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Print debugging works. Use it.',
        body: 'A targeted `debug_print(name, tensor)` that shows shape, dtype, device, min/max/mean, and NaN status beats stepping through a debugger for tensor bugs. You see everything at once.',
      },
      {
        type: 'warning',
        title: 'Data loading often takes 60% of training time',
        body: 'When you profile a training loop, the most common finding is that data loading — not GPU compute — is the bottleneck. The fix is `num_workers > 0` in your DataLoader, not a faster GPU.',
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'Debugging & Profiling',
        mathBridge: 'NaN propagation: any arithmetic involving NaN produces NaN. Once one value in a tensor becomes NaN, it spreads to everything that touches it. Catch it at the source.',
        caption: 'Work through these cells to build the debugging toolkit used for every training loop in this course.',
        props: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'debug_print and conditional breakpoints',
              prose: [
                '## The debug_print utility',
                'For tensor code, a targeted print statement beats stepping through a debugger because you see shapes, dtypes, devices, and value ranges all at once:',
                '```python\ndef debug_print(name, tensor):\n    print(f"{name}: shape={tensor.shape}, dtype={tensor.dtype}, "\n          f"device={tensor.device}, "\n          f"min={tensor.min().item():.4f}, max={tensor.max().item():.4f}, "\n          f"mean={tensor.mean().item():.4f}, "\n          f"has_nan={tensor.isnan().any().item()}")\n```',
                '## Conditional breakpoints',
                '```python\ndef training_step(model, batch, criterion, optimizer):\n    inputs, labels = batch\n    outputs = model(inputs)\n    loss = criterion(outputs, labels)\n\n    if loss.item() > 100 or torch.isnan(loss):\n        breakpoint()  # only stops when something is wrong\n\n    loss.backward()\n    optimizer.step()\n```',
                'Useful pdb commands: `p outputs.shape`, `p loss.item()`, `p torch.isnan(outputs).sum()`, `c` (continue), `q` (quit).',
              ],
              code: `import math

def debug_print(name, data):
    """
    Print tensor-like debug info. Works with lists for demonstration.
    In real code, replace with PyTorch tensor operations.
    """
    if hasattr(data, 'shape'):
        # Real PyTorch tensor
        print(f"{name}: shape={data.shape}, dtype={data.dtype}, "
              f"min={data.min().item():.4f}, max={data.max().item():.4f}, "
              f"has_nan={data.isnan().any().item()}")
    else:
        # Simulate with Python list
        flat = [x for x in data if x is not None]
        has_nan = any(math.isnan(x) for x in flat if isinstance(x, float))
        min_v = min(flat) if flat else None
        max_v = max(flat) if flat else None
        mean_v = sum(flat) / len(flat) if flat else None
        print(f"{name}: len={len(data)}, "
              f"min={min_v:.4f}, max={max_v:.4f}, mean={mean_v:.4f}, "
              f"has_nan={has_nan}")

# Simulate a training step with NaN detection
import random
random.seed(42)

print("Normal training step:")
predictions = [random.gauss(0, 1) for _ in range(10)]
debug_print("predictions", predictions)

print("\\nAbnormal step — NaN detected:")
bad_predictions = predictions[:5] + [float('nan'), float('inf')] + predictions[7:]
debug_print("bad_predictions", bad_predictions)

print("\\nConditional breakpoint logic:")
loss = float('nan')
if math.isnan(loss) or loss > 100:
    print(f"  Would trigger breakpoint() here: loss={loss}")
    print(f"  In real code: inspect model.parameters() for NaN gradients")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 2,
              cellTitle: 'Common AI bugs: shape mismatch, NaN loss, data leakage',
              prose: [
                '## Shape mismatch detection',
                '```python\ndef check_shapes(model, sample_input):\n    """Map every shape transformation in your model."""\n    for name, module in model.named_modules():\n        hooks.append(module.register_forward_hook(make_hook(name)))\n    with torch.no_grad():\n        model(sample_input)\n```\nRun this once with a sample batch before training.',
                '## NaN loss detection',
                '```python\ndef detect_nan(model, loss, step):\n    if torch.isnan(loss):\n        for name, param in model.named_parameters():\n            if param.grad is not None:\n                if torch.isnan(param.grad).any():\n                    print(f"NaN gradient in {name}")\n```',
                '## Data leakage check',
                '```python\ndef check_data_leakage(train_set, test_set, id_column="id"):\n    train_ids = set(train_set[id_column].tolist())\n    test_ids = set(test_set[id_column].tolist())\n    overlap = train_ids & test_ids\n    if overlap:\n        print(f"DATA LEAKAGE: {len(overlap)} samples in both splits")\n```',
              ],
              code: `import math

def detect_nan_in_params(named_params_grads):
    """
    Simulate nan detection in model parameters.
    named_params_grads: list of (name, value, grad) tuples
    """
    issues = []
    for name, value, grad in named_params_grads:
        if isinstance(value, float) and math.isnan(value):
            issues.append(f"NaN in param: {name}")
        if grad is not None and isinstance(grad, float) and math.isnan(grad):
            issues.append(f"NaN gradient in: {name}")
        if grad is not None and isinstance(grad, float) and math.isinf(grad):
            issues.append(f"Inf gradient in: {name}")
    return issues

def check_data_leakage(train_ids, test_ids):
    """Check for samples appearing in both train and test."""
    train_set = set(train_ids)
    test_set = set(test_ids)
    overlap = train_set & test_set
    return len(overlap) > 0, list(overlap)

# Simulate NaN detection
params = [
    ("fc1.weight", 0.5, 0.1),
    ("fc1.bias", 0.2, float('nan')),   # NaN gradient!
    ("fc2.weight", float('nan'), 0.3),  # NaN param!
    ("fc2.bias", 0.1, float('inf')),   # Inf gradient!
]

issues = detect_nan_in_params(params)
print("NaN/Inf detection:")
for issue in issues:
    print(f"  ✗ {issue}")

print("\\nData leakage check:")
train_ids = list(range(800))
test_ids = list(range(795, 810))  # overlap at 795-799!

leaked, overlap = check_data_leakage(train_ids, test_ids)
print(f"  Has leakage: {leaked}")
print(f"  Leaked IDs: {sorted(overlap)}")
print(f"  This is why test accuracy of 99% is a red flag.")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 3,
              cellTitle: 'Profiling: cProfile, timing, and memory',
              prose: [
                '## cProfile (whole script)',
                '```bash\npython -m cProfile -s cumtime train.py\n```',
                '## Manual timing',
                '```python\nimport time\n\nclass Timer:\n    def __init__(self, name=""):\n        self.name = name\n    def __enter__(self):\n        self.start = time.perf_counter()\n        return self\n    def __exit__(self, *args):\n        elapsed = time.perf_counter() - self.start\n        print(f"[{self.name}] {elapsed:.4f}s")\n\nwith Timer("data loading"):\n    batch = next(dataloader_iter)\n\nwith Timer("forward pass"):\n    outputs = model(batch)\n```',
                '## Memory profiling',
                '```python\nimport tracemalloc\ntracemalloc.start()\n# ... your code ...\nsnapshot = tracemalloc.take_snapshot()\nfor stat in snapshot.statistics("lineno")[:10]:\n    print(stat)\n```',
                '## GPU memory',
                '```python\nprint(torch.cuda.memory_summary())\nprint(f"Allocated: {torch.cuda.memory_allocated() / 1e9:.2f} GB")\n```',
              ],
              code: `import time
import tracemalloc

class Timer:
    """Context manager for timing code sections."""
    def __init__(self, name=""):
        self.name = name
        self.elapsed = 0.0

    def __enter__(self):
        self.start = time.perf_counter()
        return self

    def __exit__(self, *args):
        self.elapsed = time.perf_counter() - self.start
        print(f"  [{self.name}] {self.elapsed*1000:.2f} ms")

# Simulate profiling a training step breakdown
def simulate_data_loading():
    time.sleep(0.008)  # simulate slow data loading
    return list(range(1000))

def simulate_forward_pass(batch):
    time.sleep(0.002)  # fast GPU forward
    return [x * 0.5 for x in batch]

def simulate_backward_pass(outputs):
    time.sleep(0.003)  # backward slightly slower
    return sum(outputs) / len(outputs)

print("Training step timing breakdown:")
print("=" * 40)
with Timer("data loading") as t_data:
    batch = simulate_data_loading()

with Timer("forward pass") as t_fwd:
    outputs = simulate_forward_pass(batch)

with Timer("backward + optimizer") as t_bwd:
    loss = simulate_backward_pass(outputs)

total = t_data.elapsed + t_fwd.elapsed + t_bwd.elapsed
print(f"\\nBreakdown (%):")
print(f"  Data loading:        {t_data.elapsed/total*100:.0f}%  ← common bottleneck")
print(f"  Forward pass:        {t_fwd.elapsed/total*100:.0f}%")
print(f"  Backward + step:     {t_bwd.elapsed/total*100:.0f}%")
print(f"\\nFix data loading bottleneck: DataLoader(num_workers=4, pin_memory=True)")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 4,
              cellTitle: 'TensorBoard: what to look for',
              prose: [
                '## Setup',
                '```bash\npip install tensorboard\n```',
                '```python\nfrom torch.utils.tensorboard import SummaryWriter\n\nwriter = SummaryWriter("runs/experiment_1")\n\nfor step in range(num_steps):\n    loss = train_step(model, batch)\n    writer.add_scalar("loss/train", loss.item(), step)\n    writer.add_scalar("lr", optimizer.param_groups[0]["lr"], step)\n\n    if step % 100 == 0:\n        for name, param in model.named_parameters():\n            writer.add_histogram(f"weights/{name}", param, step)\n            if param.grad is not None:\n                writer.add_histogram(f"grads/{name}", param.grad, step)\n\nwriter.close()\n```',
                '```bash\ntensorboard --logdir=runs\n```',
                '## What to look for',
                '- **Loss not decreasing**: Learning rate too low, or architecture issue\n- **Loss oscillating wildly**: Learning rate too high\n- **Loss goes to NaN**: Numerical instability\n- **Train loss ↓, val loss ↑**: Overfitting\n- **Weight histograms collapsing to zero**: Vanishing gradients\n- **Gradient histograms exploding**: Need gradient clipping',
              ],
              code: `# Simulate reading TensorBoard scalar data and diagnosing issues

def diagnose_training_run(loss_history, val_loss_history=None):
    """
    Analyze a loss history and diagnose common training problems.
    loss_history: list of (step, loss_value) tuples
    """
    if not loss_history:
        return ["No data"]

    diagnoses = []
    losses = [l for _, l in loss_history]
    final_loss = losses[-1]
    initial_loss = losses[0]

    # Check for NaN
    import math
    nan_steps = [step for step, l in loss_history if math.isnan(l) or math.isinf(l)]
    if nan_steps:
        diagnoses.append(f"NaN/Inf loss at steps {nan_steps[:3]} — check LR, log(0), div by zero")
        return diagnoses

    # Check if loss is decreasing
    improvement = (initial_loss - final_loss) / initial_loss if initial_loss != 0 else 0
    if improvement < 0.01:
        diagnoses.append("Loss barely changed — LR may be too low, or architecture issue")
    elif improvement > 0:
        diagnoses.append(f"Loss improved {improvement*100:.1f}% ✓")

    # Check for wild oscillation
    diffs = [abs(losses[i] - losses[i-1]) for i in range(1, len(losses))]
    mean_diff = sum(diffs) / len(diffs) if diffs else 0
    if mean_diff > initial_loss * 0.2:
        diagnoses.append("High step-to-step variance — LR may be too high")

    # Check for overfitting
    if val_loss_history:
        val_losses = [l for _, l in val_loss_history]
        if val_losses[-1] > val_losses[0] * 1.1:
            diagnoses.append("Val loss increasing while train loss decreasing — overfitting")

    return diagnoses

# Scenario 1: Good training
good_run = [(i*10, 2.3 * (0.95 ** i)) for i in range(20)]
print("Scenario 1 (good training):")
for d in diagnose_training_run(good_run):
    print(f"  {d}")

# Scenario 2: NaN
nan_run = [(i*10, 2.3 - i * 0.05) for i in range(10)] + [(100, float('nan'))]
print("\\nScenario 2 (NaN loss):")
for d in diagnose_training_run(nan_run):
    print(f"  {d}")

# Scenario 3: Overfitting
train_run = [(i*10, 2.3 * (0.93**i)) for i in range(20)]
val_run = [(i*10, 1.2 + i * 0.03) for i in range(20)]  # val loss increasing
print("\\nScenario 3 (overfitting):")
for d in diagnose_training_run(train_run, val_run):
    print(f"  {d}")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 'c1',
              challengeType: 'write',
              challengeNumber: 1,
              challengeTitle: 'Tensor shape validator',
              difficulty: 'easy',
              prompt: 'Write `validate_shapes(inputs, expected_shapes)` where `inputs` is a dict mapping name to a list representing the tensor shape, and `expected_shapes` is a dict mapping name to expected shape tuple. Return a dict with `"valid"` (True if all shapes match), `"errors"` (list of error strings for mismatches), and `"checked"` (count of shapes checked).',
              code: `def validate_shapes(inputs, expected_shapes):
    """
    Validate that tensor shapes match expectations.
    inputs: {"name": [dim1, dim2, ...]}  (shape as list)
    expected_shapes: {"name": (dim1, dim2, ...)}  (expected shape as tuple)
    Returns: {valid, errors, checked}
    """
    pass

# Before training: validate your data pipeline
inputs = {
    "batch_images": [32, 3, 224, 224],    # (batch, channels, H, W)
    "batch_labels": [32],                   # (batch,)
    "encoder_output": [32, 768],            # (batch, hidden_dim)
    "wrong_logits": [10, 32],              # transposed! should be (32, 10)
}

expected = {
    "batch_images": (32, 3, 224, 224),
    "batch_labels": (32,),
    "encoder_output": (32, 768),
    "wrong_logits": (32, 10),             # expect (batch, classes)
}

result = validate_shapes(inputs, expected)
print(f"Valid: {result['valid']}")
print(f"Checked: {result['checked']}")
print(f"Errors ({len(result['errors'])}):")
for err in result['errors']:
    print(f"  {err}")
`,
              output: '', status: 'idle', figureJson: null,
              testCode: `
if 'validate_shapes' not in dir():
    res = "ERROR: validate_shapes not defined."
else:
    inputs = {"a": [32, 10], "b": [32, 5], "c": [10, 32]}
    expected = {"a": (32, 10), "b": (32, 10), "c": (32, 10)}
    r = validate_shapes(inputs, expected)
    if not isinstance(r, dict):
        res = "ERROR: Must return a dict."
    elif r.get('valid') != False:
        res = f"ERROR: valid should be False (b and c are wrong), got {r.get('valid')}"
    elif r.get('checked') != 3:
        res = f"ERROR: checked should be 3, got {r.get('checked')}"
    elif len(r.get('errors', [])) != 2:
        res = f"ERROR: Should have 2 errors (b and c), got {len(r.get('errors', []))}"
    else:
        # All correct
        inputs2 = {"a": [32, 10]}
        expected2 = {"a": (32, 10)}
        r2 = validate_shapes(inputs2, expected2)
        if not r2.get('valid'):
            res = f"ERROR: valid should be True for matching shapes, got {r2}"
        else:
            res = "SUCCESS: validate_shapes correctly identifies shape mismatches."
res
`,
              hint: 'For each name in expected_shapes, compare tuple(inputs[name]) to expected_shapes[name]. If mismatch, add an error string. valid = len(errors) == 0.',
            },
            {
              id: 'c2',
              challengeType: 'write',
              challengeNumber: 2,
              challengeTitle: 'Training profiler',
              difficulty: 'medium',
              prompt: 'Write a `TrainingProfiler` class with `record(phase, duration_ms)` and `summary()` methods. `record` accumulates timing data for named phases (e.g. "data_loading", "forward", "backward"). `summary()` returns a dict mapping phase to `{"total_ms", "count", "mean_ms", "pct_of_total"}`, where `pct_of_total` is the percentage of total time spent in that phase.',
              code: `class TrainingProfiler:
    """Track time spent in each phase of the training loop."""

    def __init__(self):
        self._records = {}  # phase -> list of durations

    def record(self, phase, duration_ms):
        """Record a duration (ms) for a phase."""
        pass

    def summary(self):
        """
        Return per-phase stats.
        {phase: {total_ms, count, mean_ms, pct_of_total}}
        """
        pass

import random
random.seed(42)

profiler = TrainingProfiler()

# Simulate 100 training steps
for step in range(100):
    profiler.record("data_loading", random.gauss(8.0, 1.0))    # slow!
    profiler.record("forward", random.gauss(2.0, 0.3))
    profiler.record("backward", random.gauss(3.0, 0.4))
    profiler.record("optimizer_step", random.gauss(0.5, 0.1))

stats = profiler.summary()
print("Training Phase Profiling (100 steps):")
print(f"{'Phase':<20} {'Mean (ms)':>10} {'Total (ms)':>12} {'%':>8}")
print("-" * 55)
for phase, info in sorted(stats.items(), key=lambda x: -x[1]['pct_of_total']):
    print(f"{phase:<20} {info['mean_ms']:>10.2f} {info['total_ms']:>12.0f} {info['pct_of_total']:>7.1f}%")

print("\\n→ Data loading is the bottleneck. Fix: DataLoader(num_workers=4, pin_memory=True)")
`,
              output: '', status: 'idle', figureJson: null,
              testCode: `
if 'TrainingProfiler' not in dir():
    res = "ERROR: TrainingProfiler not defined."
else:
    p = TrainingProfiler()
    p.record("data", 8.0)
    p.record("data", 12.0)
    p.record("forward", 2.0)
    stats = p.summary()
    if 'data' not in stats or 'forward' not in stats:
        res = f"ERROR: summary should have 'data' and 'forward' keys, got {list(stats.keys())}"
    elif stats['data'].get('count') != 2:
        res = f"ERROR: data count should be 2, got {stats['data'].get('count')}"
    elif abs(stats['data'].get('total_ms', 0) - 20.0) > 0.01:
        res = f"ERROR: data total_ms should be 20.0, got {stats['data'].get('total_ms')}"
    elif abs(stats['data'].get('mean_ms', 0) - 10.0) > 0.01:
        res = f"ERROR: data mean_ms should be 10.0, got {stats['data'].get('mean_ms')}"
    else:
        total_pct = sum(v['pct_of_total'] for v in stats.values())
        if abs(total_pct - 100.0) > 0.1:
            res = f"ERROR: pct_of_total should sum to 100%, got {total_pct}"
        else:
            res = "SUCCESS: TrainingProfiler correctly accumulates timings and computes phase percentages."
res
`,
              hint: 'self._records[phase] = [] list. record: append. summary: total per phase, grand total = sum of all. pct = phase_total / grand_total * 100. mean = total / count.',
            },
          ],
        },
      },
    ],
  },

  quiz: [
    {
      id: 'q1',
      question: 'What makes debugging AI/ML code fundamentally different from debugging a typical web application?',
      options: [
        'AI code uses different programming languages',
        'AI bugs often don\'t crash — they silently produce incorrect results with no error messages',
        'AI code cannot be debugged with standard tools like print statements',
        'AI code always requires a GPU to debug',
      ],
      correct: 1,
      explanation: 'The worst AI bugs produce valid-looking output. A misconfigured training loop might run for hours without errors while the model learns nothing useful, unlike web apps that crash with stack traces.',
    },
    {
      id: 'q2',
      question: 'What does a profiler measure?',
      options: [
        'Whether the code produces correct output',
        'How much time and memory each part of the code consumes',
        'How many bugs exist in the codebase',
        'The code coverage of unit tests',
      ],
      correct: 1,
      explanation: 'Profilers measure resource consumption — execution time per function, memory allocation, and GPU utilization — helping you find bottlenecks and optimize performance.',
    },
    {
      id: 'q3',
      question: 'Your model achieves 99% accuracy on the test set. What AI-specific bug should you suspect first?',
      options: [
        'The model has too many parameters',
        'Data leakage — test samples may have leaked into the training set',
        'The learning rate is too high',
        'The batch size is too large',
      ],
      correct: 1,
      explanation: 'Suspiciously high accuracy often indicates data leakage — overlap between training and test data, or features that contain the target label. Always check for train/test overlap.',
    },
    {
      id: 'q4',
      question: "What is the most common finding when profiling a training loop's time breakdown?",
      options: [
        'The backward pass takes 90% of the time',
        'Data loading takes more time than the forward and backward passes combined',
        'Writing logs takes the most time',
        'GPU memory allocation is the bottleneck',
      ],
      correct: 1,
      explanation: 'Data loading often takes 60%+ of training time when num_workers=0 in the DataLoader. The fix is setting num_workers > 0 to load data in parallel with GPU computation.',
    },
    {
      id: 'q5',
      question: 'You see NaN loss at step 500. Which approach will help you find the root cause?',
      options: [
        'Restart training from scratch with a different random seed',
        'Use detect_nan to check for NaN/Inf in gradients and add breakpoint() at the failure point',
        'Increase the batch size to stabilize gradients',
        'Switch from Adam to SGD optimizer',
      ],
      correct: 1,
      explanation: 'First identify WHERE the NaN originates by checking gradients for each parameter. A conditional breakpoint at the NaN step lets you inspect tensor values interactively. Common causes: learning rate too high, log(0), or division by zero.',
    },
  ],
}
