export default {
  id: 'ae-p0-03-gpu-setup',
  slug: 'gpu-setup-and-cloud',
  chapter: 'ae-p0',
  order: 2,
  title: 'GPU Setup & Cloud',
  subtitle: 'Verify local GPU access and connect to cloud compute — you will need both.',
  tags: ['gpu', 'cuda', 'mps', 'pytorch', 'colab', 'cloud', 'nvidia', 'apple silicon'],

  hook: {
    question: 'Do you actually need a GPU to learn AI engineering?',
    realWorldContext:
      'The short answer: for Phase 11 (LLM Engineering), no — you are calling APIs. For training your own models (Phases 3–10), yes — a CPU is 50–1000x slower. The good news: Google Colab gives you free T4 GPU access, and most cloud providers offer cheap spot instances. This lesson covers verifying local GPU access (NVIDIA CUDA or Apple MPS), and setting up cloud GPU options so you always have compute when you need it.',
    previewVisualizationId: 'PythonNotebook',
  },

  intuition: {
    prose: [
      'GPUs are parallel compute engines. A modern GPU has thousands of small cores optimized for the matrix multiplications that power neural networks. An NVIDIA A100 can do ~312 TFLOPS of FP16 math — roughly 100x what a CPU can do.',
      'PyTorch abstracts the hardware. The same code runs on CPU, NVIDIA CUDA, and Apple Silicon MPS — you just change the device string.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Device-agnostic code pattern',
        body: '`device = torch.device("cuda" if torch.cuda.is_available() else "mps" if torch.backends.mps.is_available() else "cpu")` — write this once at the top of every script. All tensors and models go to `device`. Your code works everywhere.',
      },
      {
        type: 'warning',
        title: 'CUDA version must match PyTorch',
        body: 'PyTorch ships different wheels for different CUDA versions (cu118, cu121, cu124). Install the wrong one and CUDA is silently disabled. Always check: `torch.cuda.is_available()` after install.',
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'GPU Setup & Cloud',
        mathBridge: 'GPU parallelism: a neural network forward pass is mostly matrix multiplications. GPUs process these with SIMD (single instruction, multiple data) parallelism — thousands of multiply-add operations simultaneously.',
        caption: 'Check your hardware, understand the cloud options, and write device-agnostic PyTorch.',
        props: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Detect available compute hardware',
              prose: 'Before writing any GPU code, detect what hardware is available. This cell identifies the best device on your machine and prints a detailed hardware report.',
              code: `import sys

def get_best_device():
    """Detect and return the best available compute device."""
    try:
        import torch
        if torch.cuda.is_available():
            return "cuda", torch.cuda.get_device_name(0)
        elif hasattr(torch.backends, 'mps') and torch.backends.mps.is_available():
            return "mps", "Apple Silicon GPU"
        else:
            return "cpu", "CPU only"
    except ImportError:
        return "cpu", "PyTorch not installed"

device_type, device_name = get_best_device()
print(f"Best device: {device_type}")
print(f"Device name: {device_name}")
print()

try:
    import torch
    print(f"PyTorch version: {torch.__version__}")
    print(f"CUDA available: {torch.cuda.is_available()}")
    if torch.cuda.is_available():
        print(f"CUDA version: {torch.version.cuda}")
        print(f"GPU count: {torch.cuda.device_count()}")
        for i in range(torch.cuda.device_count()):
            props = torch.cuda.get_device_properties(i)
            print(f"  GPU {i}: {props.name}, {props.total_memory / 1e9:.1f} GB VRAM")
    print(f"MPS available: {getattr(torch.backends, 'mps', None) and torch.backends.mps.is_available()}")
except ImportError:
    print("Install PyTorch: uv pip install torch")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 2,
              cellTitle: 'Device-agnostic PyTorch: the universal pattern',
              prose: [
                '## The one-time device setup',
                'Write this at the top of every PyTorch script. It picks the best available device automatically:',
                '```python\ndevice = (\n    torch.device("cuda") if torch.cuda.is_available()\n    else torch.device("mps") if torch.backends.mps.is_available()\n    else torch.device("cpu")\n)\n```',
                '## Moving tensors to device',
                '- `tensor.to(device)` — move an existing tensor\n- `tensor.cuda()` — shorthand for `.to("cuda")` (avoid this, not portable)\n- Create directly on device: `torch.zeros(3, 3, device=device)`',
              ],
              code: `try:
    import torch

    # Device-agnostic setup
    device = (
        torch.device("cuda") if torch.cuda.is_available()
        else torch.device("mps") if hasattr(torch.backends, 'mps') and torch.backends.mps.is_available()
        else torch.device("cpu")
    )
    print(f"Using device: {device}")

    # Create tensors directly on the right device
    a = torch.randn(3, 3, device=device)
    b = torch.randn(3, 3, device=device)

    # Matrix multiply (uses GPU if available)
    c = torch.matmul(a, b)
    print(f"Matrix multiply shape: {c.shape}")
    print(f"Tensor is on: {c.device}")
    print(f"Result:\\n{c}")

except ImportError:
    print("PyTorch not installed — run: uv pip install torch")
    print("\\nSimulating with numpy instead:")
    import numpy as np
    a = np.random.randn(3, 3)
    b = np.random.randn(3, 3)
    c = np.matmul(a, b)
    print(f"Matrix multiply (CPU numpy): {c.shape}")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 3,
              cellTitle: 'Cloud GPU options: cost vs. convenience',
              prose: [
                '## Your cloud GPU options in 2025',
                '| Provider | Free tier | Paid (per hour) | Best for |\n|---|---|---|---|\n| Google Colab | T4 GPU (limited hours) | $10/month Pro | Experimentation, learning |\n| Kaggle | 30h/week T4 or P100 | Free | Competitions, datasets |\n| Lambda Labs | None | ~$0.60/hr A10 | Cost-effective training |\n| Vast.ai | None | ~$0.20-0.80/hr | Cheapest spot instances |\n| Modal | $30 credit/month | Pay-per-second | Serverless ML inference |\n| Replicate | Free tier | Pay-per-prediction | Running open models |\n| RunPod | None | ~$0.20-0.50/hr | Persistent pods |\n| AWS/GCP/Azure | Spot credits | $0.90-3/hr | Enterprise, existing infra |',
                '## Rule of thumb',
                'For learning: Colab free tier. For experiments that take >1hr: Lambda or Vast.ai spot. For production inference: Modal or Replicate. For training runs >$10: compare Lambda, RunPod, and Vast.ai at time of purchase.',
              ],
              code: `# GPU cost calculator

GPU_PRICES = {
    "Google Colab T4 (free)":     {"price_per_hour": 0.0,  "vram_gb": 15, "tflops_fp16": 65},
    "Lambda Labs A10":             {"price_per_hour": 0.60, "vram_gb": 24, "tflops_fp16": 125},
    "Vast.ai RTX 4090 (spot)":    {"price_per_hour": 0.35, "vram_gb": 24, "tflops_fp16": 330},
    "Lambda Labs A100 (40GB)":    {"price_per_hour": 1.10, "vram_gb": 40, "tflops_fp16": 312},
    "Vast.ai H100 (spot)":        {"price_per_hour": 2.50, "vram_gb": 80, "tflops_fp16": 1979},
}

def compute_cost(gpu_name, hours):
    """Estimate training cost."""
    gpu = GPU_PRICES[gpu_name]
    return {
        "gpu": gpu_name,
        "hours": hours,
        "total_cost": gpu["price_per_hour"] * hours,
        "compute_flops": gpu["tflops_fp16"] * hours * 3600,  # total FLOPs
    }

# Compare cost for a 10-hour training run
print(f"{'GPU':<35} {'Cost':>8} {'TFLOPS':>8}")
print("-" * 55)
for gpu_name in GPU_PRICES:
    result = compute_cost(gpu_name, 10)
    gpu = GPU_PRICES[gpu_name]
    cost_str = "FREE" if result["total_cost"] == 0 else f"\${result['total_cost']:.2f}"
    print(f"{gpu_name:<35} {cost_str:>8} {gpu['tflops_fp16']:>8}")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 'c1',
              challengeType: 'write',
              challengeNumber: 1,
              challengeTitle: 'GPU selector function',
              difficulty: 'easy',
              prompt: 'Write `select_gpu(budget_per_hour, min_vram_gb)` that filters the `GPU_PRICES` dict and returns the name of the cheapest GPU that meets the budget and VRAM requirements. Return `None` if no GPU qualifies.',
              code: `GPU_PRICES = {
    "Colab T4 (free)":     {"price_per_hour": 0.0,  "vram_gb": 15},
    "Lambda A10":          {"price_per_hour": 0.60, "vram_gb": 24},
    "Vast RTX 4090":       {"price_per_hour": 0.35, "vram_gb": 24},
    "Lambda A100 (40GB)":  {"price_per_hour": 1.10, "vram_gb": 40},
    "Vast H100":           {"price_per_hour": 2.50, "vram_gb": 80},
}

def select_gpu(budget_per_hour, min_vram_gb):
    """Return cheapest GPU within budget that has enough VRAM."""
    pass

print(select_gpu(1.0, 20))   # "Vast RTX 4090" (cheapest under $1 with 24GB)
print(select_gpu(0.5, 20))   # "Vast RTX 4090" ($0.35 < $0.50, 24GB >= 20)
print(select_gpu(0.0, 10))   # "Colab T4 (free)" (free with 15GB)
print(select_gpu(0.0, 20))   # None (free T4 only has 15GB < 20GB)
`,
              output: '', status: 'idle', figureJson: null,
              testCode: `
if 'select_gpu' not in dir():
    res = "ERROR: select_gpu not defined."
else:
    r1 = select_gpu(0.0, 10)
    r2 = select_gpu(0.0, 20)
    r3 = select_gpu(0.5, 20)
    if r1 != "Colab T4 (free)":
        res = f"ERROR: select_gpu(0.0, 10) should be 'Colab T4 (free)', got {r1!r}"
    elif r2 is not None:
        res = f"ERROR: select_gpu(0.0, 20) should be None (no free GPU with 20GB), got {r2!r}"
    elif r3 not in ("Vast RTX 4090",):
        res = f"ERROR: select_gpu(0.5, 20) should be 'Vast RTX 4090', got {r3!r}"
    else:
        res = "SUCCESS: select_gpu filters by budget and VRAM correctly."
res
`,
              hint: 'Filter GPU_PRICES for entries where price_per_hour <= budget_per_hour AND vram_gb >= min_vram_gb. Among the qualifying GPUs, return the name of the one with the lowest price_per_hour. Return None if no GPU qualifies.',
            },
          ],
        },
      },
    ],
  },

  quiz: [
    {
      id: 'q1',
      question: 'What is the device-agnostic PyTorch pattern?',
      options: [
        'Always use `tensor.cuda()` for GPU tensors',
        'Use `device = "cuda" if available else "mps" if available else "cpu"` and call `.to(device)` on all tensors',
        'Check `torch.cuda.is_available()` only once at startup',
        'Write separate code paths for CPU and GPU',
      ],
      correct: 1,
      explanation: 'The device-agnostic pattern detects the best available hardware at runtime (CUDA > MPS > CPU) and stores it in a `device` variable. All tensors and models are moved to this device with `.to(device)`. The same code then runs on any hardware.',
    },
  ],
}
