export default {
  id: 'ae-p11-08-fine-tuning-lora',
  slug: 'fine-tuning-and-lora',
  chapter: 'ae-p11',
  order: 7,
  title: 'Fine-Tuning & LoRA',
  subtitle: 'Adapt a 70B model to your task by training just 0.1% of its parameters.',
  tags: ['fine-tuning', 'lora', 'qlora', 'peft', 'sft', 'adapter', 'rank decomposition', 'quantization'],

  hook: {
    question: 'If you need GPT-4 quality on your specific task but cannot afford GPT-4 for every request, what is the correct solution?',
    realWorldContext: 'Fine-tune a smaller open-weight model (Llama 3 8B, Mistral 7B, Qwen2.5 7B) using LoRA. LoRA (Low-Rank Adaptation) fine-tunes a 70B model by training only ~70M parameters — 0.1% of the model — while keeping all other weights frozen. The result: near-GPT-4 performance on your specific task, at $0.00006 per 1K tokens instead of $0.03. This is the economics that makes AI engineering viable at scale.',
    previewVisualizationId: 'PythonNotebook',
  },

  intuition: {
    prose: [
      'Full fine-tuning trains all model parameters. For a 70B model, that requires ~560GB of GPU memory for the weights alone. LoRA decomposes each weight update ΔW into two small matrices: ΔW = B × A, where B is n×r and A is r×m, with r << n,m. For r=8, a 4096×4096 weight matrix (16M parameters) becomes two matrices (32K + 32K = 64K parameters) — 250x fewer.',
      'QLoRA adds 4-bit quantization (NF4 format) for the frozen base model weights, reducing memory from 560GB to ~140GB for a 70B model. This fits on 4 A100 GPUs instead of 8.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'LoRA math: ΔW = B × A',
        body: 'For weight matrix W (n×m), LoRA adds a bypass: output = Wx + (α/r) × B(Ax). A is initialized from Gaussian, B is initialized to zero — so at training start, the LoRA contribution is zero and training continues from the base model.',
      },
      {
        type: 'warning',
        title: 'When NOT to fine-tune',
        body: 'Decision tree: (1) Try prompt engineering first — often sufficient. (2) If retrieval is the issue, use RAG. (3) Only fine-tune for: consistent output format/style, domain-specific vocabulary, classification with labeled data, or reducing latency/cost by moving to smaller model. Never fine-tune to teach facts.',
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'Fine-Tuning & LoRA',
        mathBridge: 'LoRA parameter count: 2 × r × (n + m) vs. full: n × m. For W (4096×4096), r=8: 65,536 vs. 16,777,216 — 256x fewer trainable parameters.',
        caption: 'Implement LoRA layer mathematics, parameter counting, and understand the QLoRA quantization chain.',
        props: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'LoRA mathematics: low-rank weight decomposition',
              prose: [
                '## The core idea',
                'A pre-trained weight matrix W₀ ∈ ℝⁿˣᵐ has learned rich representations. Fine-tuning adds a small change ΔW. LoRA hypothesizes that ΔW has low intrinsic rank.',
                '## The decomposition',
                '`ΔW = B × A` where `B ∈ ℝⁿˣʳ`, `A ∈ ℝʳˣᵐ`, and `r << min(n, m)`.',
                '## The forward pass',
                '`h = W₀x + (α/r) × BAx`\n\nAt init: B=0, so ΔW=0 and training starts from the frozen base model. The alpha/r scaling normalizes the contribution as r changes.',
              ],
              code: `import random
import math

class LoRALayer:
    """LoRA low-rank adaptation layer."""

    def __init__(self, in_features, out_features, rank=8, alpha=16):
        self.rank = rank
        self.alpha = alpha
        self.scaling = alpha / rank

        # Frozen base weight (pre-trained)
        # In practice: loaded from a pre-trained checkpoint
        seed = 42
        rng = random.Random(seed)
        self.W0 = [[rng.gauss(0, 0.02) for _ in range(in_features)] for _ in range(out_features)]

        # LoRA matrices (trainable)
        # A: initialized from Gaussian (breaks symmetry)
        self.A = [[rng.gauss(0, 0.02) for _ in range(in_features)] for _ in range(rank)]
        # B: initialized to zero (ΔW = 0 at start of training)
        self.B = [[0.0] * rank for _ in range(out_features)]

    def matmul(self, matrix, vector):
        """Matrix-vector multiplication."""
        return [sum(row[j] * vector[j] for j in range(len(vector))) for row in matrix]

    def forward(self, x):
        """h = W0*x + (alpha/r) * B*(A*x)"""
        # Base model output
        base_out = self.matmul(self.W0, x)

        # LoRA delta
        Ax = self.matmul(self.A, x)    # rank-dimensional
        BAx = self.matmul(self.B, Ax)  # output-dimensional

        # Combine
        return [base_out[i] + self.scaling * BAx[i] for i in range(len(base_out))]

    @property
    def trainable_params(self):
        return self.rank * len(self.W0[0]) + self.rank * len(self.W0)  # A + B

    @property
    def frozen_params(self):
        return len(self.W0) * len(self.W0[0])

    @property
    def total_params(self):
        return self.frozen_params + self.trainable_params

    def param_efficiency(self):
        return self.trainable_params / self.total_params

# Demonstrate a LoRA-adapted linear layer
in_dim, out_dim = 512, 512
layer = LoRALayer(in_features=in_dim, out_features=out_dim, rank=8, alpha=16)

# Forward pass
x = [random.gauss(0, 1) for _ in range(in_dim)]
h = layer.forward(x)

print(f"Layer: {in_dim} → {out_dim}")
print(f"Full fine-tuning params: {layer.frozen_params:,}")
print(f"LoRA trainable params:   {layer.trainable_params:,}")
print(f"Parameter efficiency:    {layer.param_efficiency():.2%} of full fine-tuning")
print(f"\\nForward pass output shape: {len(h)}")
print(f"Output magnitude: {math.sqrt(sum(v**2 for v in h[:5])):.4f} (first 5 dims)")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 2,
              cellTitle: 'Rank selection and its effect on parameter count',
              prose: [
                '## Choosing rank r',
                '| Rank (r) | Use case | % of full fine-tuning |\n|---|---|---|\n| r=4 | Tight memory budget, simple tasks | 0.025% |\n| r=8 | Default, most tasks | 0.05% |\n| r=16 | Complex tasks, domain adaptation | 0.1% |\n| r=64 | Near full fine-tuning quality | 0.4% |\n| r=128 | When you want FT quality with LoRA framework | 0.78% |',
                '## Where to apply LoRA',
                'Apply to attention layers: `q_proj`, `v_proj` (minimum). For better results: also `k_proj`, `o_proj`, and MLP layers (`up_proj`, `down_proj`).',
              ],
              code: `def lora_param_count(model_dims, rank, target_modules=None):
    """
    Calculate LoRA parameter counts for a transformer model.

    model_dims: {"hidden": int, "heads": int, "head_dim": int, "ffn_intermediate": int}
    """
    if target_modules is None:
        target_modules = ["q_proj", "v_proj"]

    hidden = model_dims["hidden"]
    ffn = model_dims.get("ffn_intermediate", hidden * 4)

    # Common transformer weight shapes
    projection_shapes = {
        "q_proj": (hidden, hidden),
        "k_proj": (hidden, hidden),
        "v_proj": (hidden, hidden),
        "o_proj": (hidden, hidden),
        "up_proj": (hidden, ffn),
        "down_proj": (ffn, hidden),
        "gate_proj": (hidden, ffn),
    }

    trainable = 0
    frozen = 0

    for module in target_modules:
        if module in projection_shapes:
            n, m = projection_shapes[module]
            frozen += n * m
            trainable += rank * (n + m)  # A + B

    return {
        "rank": rank,
        "target_modules": target_modules,
        "trainable_params": trainable,
        "frozen_params": frozen,
        "pct_of_targeted": trainable / frozen * 100 if frozen > 0 else 0,
    }

# Compare rank choices for Llama 3 8B (hidden=4096, ffn=14336)
llama_3_8b = {"hidden": 4096, "ffn_intermediate": 14336}

modules_minimal  = ["q_proj", "v_proj"]
modules_standard = ["q_proj", "k_proj", "v_proj", "o_proj"]
modules_full_attn = ["q_proj", "k_proj", "v_proj", "o_proj", "up_proj", "down_proj"]

print(f"LoRA configurations for Llama 3 8B:")
print(f"{'Config':<40} {'r':>4} {'Trainable':>12} {'%':>6}")
print("-" * 65)

for rank in [4, 8, 16, 64]:
    for mods, mod_name in [(modules_minimal, "q+v"), (modules_standard, "q+k+v+o"), (modules_full_attn, "all")]:
        result = lora_param_count(llama_3_8b, rank, mods)
        label = f"r={rank}, {mod_name}"
        print(f"{label:<40} {rank:>4} {result['trainable_params']:>12,} {result['pct_of_targeted']:>5.2f}%")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 3,
              cellTitle: 'QLoRA: quantization for memory reduction',
              prose: [
                '## The QLoRA stack (Dettmers et al., 2023)',
                '1. **NF4 quantization** — store base model weights in 4-bit NormalFloat format (optimally placed quantization points for normally distributed weights)\n2. **Double quantization** — quantize the quantization constants themselves (saves another 0.37 bits/parameter)\n3. **Paged optimizers** — use CPU RAM for optimizer states when GPU memory spills\n4. **LoRA adapters** — train in 16-bit float precision',
                '## Memory savings',
                '| Format | Bytes/param | 70B model memory |\n|---|---|---|\n| float32 | 4 | 280 GB |\n| bfloat16 | 2 | 140 GB |\n| int8 | 1 | 70 GB |\n| NF4 (QLoRA) | 0.5 | 35 GB |',
              ],
              code: `def memory_estimate_gb(param_count_billions, format_type):
    """Estimate GPU memory for a model in different formats."""
    bytes_per_param = {
        "float32": 4,
        "bfloat16": 2,
        "float16": 2,
        "int8": 1,
        "nf4": 0.5,  # QLoRA
        "nf4_double_quant": 0.45,
    }
    bpp = bytes_per_param.get(format_type, 2)
    total_bytes = param_count_billions * 1e9 * bpp
    return total_bytes / 1e9  # GB

def qlora_training_memory(model_size_b, lora_rank=8, n_target_modules=4):
    """Estimate total training memory with QLoRA."""
    # Base model: NF4 (0.5 bytes/param)
    base_memory = memory_estimate_gb(model_size_b, "nf4_double_quant")

    # LoRA adapters: float16 (2 bytes/param)
    # Rough estimate: LoRA adds ~0.1% of model params
    lora_params = model_size_b * 1e9 * 0.001
    lora_memory = lora_params * 2 / 1e9  # float16

    # Optimizer states for LoRA only (AdamW: 8 bytes/param)
    optimizer_memory = lora_params * 8 / 1e9

    # Activations + gradient checkpointing (rough estimate)
    activation_memory = model_size_b * 0.2  # ~20% of weights

    total = base_memory + lora_memory + optimizer_memory + activation_memory
    return {
        "base_model_gb": round(base_memory, 1),
        "lora_params_gb": round(lora_memory, 2),
        "optimizer_gb": round(optimizer_memory, 2),
        "activations_gb": round(activation_memory, 1),
        "total_gb": round(total, 1),
    }

print("Memory comparison: full fine-tuning vs QLoRA")
print(f"{'Model':<15} {'Full FT (bf16)':>18} {'QLoRA':>12}")
print("-" * 48)

for model, size in [("Llama 3 8B", 8), ("Llama 3 70B", 70), ("Llama 3 405B", 405)]:
    full_ft = memory_estimate_gb(size, "bfloat16") * 3  # weights + gradients + optimizer (very rough)
    qlora = qlora_training_memory(size)
    print(f"{model:<15} {full_ft:>15.0f} GB {qlora['total_gb']:>9.0f} GB")

print()
print("QLoRA breakdown for Llama 3 70B:")
breakdown = qlora_training_memory(70)
for key, val in breakdown.items():
    print(f"  {key}: {val} GB")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 'c1',
              challengeType: 'write',
              challengeNumber: 1,
              challengeTitle: 'LoRA parameter savings calculator',
              difficulty: 'easy',
              prompt: 'Write `lora_savings(n, m, r)` that returns a dict with `full_params` (n×m), `lora_params` (r×n + r×m), `reduction_factor` (full/lora), and `pct_trainable` (lora/full × 100).',
              code: `def lora_savings(n, m, r):
    """Calculate LoRA parameter savings vs full fine-tuning."""
    pass

# Standard attention projection: 4096×4096 with r=8
result = lora_savings(4096, 4096, r=8)
print(f"Full params:      {result['full_params']:,}")
print(f"LoRA params:      {result['lora_params']:,}")
print(f"Reduction factor: {result['reduction_factor']:.0f}x")
print(f"% trainable:      {result['pct_trainable']:.3f}%")

# Compare across ranks
print("\\nRank vs savings for 4096×4096:")
for r in [4, 8, 16, 32, 64]:
    s = lora_savings(4096, 4096, r)
    print(f"  r={r:<4}: {s['lora_params']:>8,} params ({s['pct_trainable']:.3f}%), {s['reduction_factor']:.0f}x reduction")
`,
              output: '', status: 'idle', figureJson: null,
              testCode: `
if 'lora_savings' not in dir():
    res = "ERROR: lora_savings not defined."
else:
    r = lora_savings(4096, 4096, 8)
    if r['full_params'] != 4096*4096:
        res = f"ERROR: full_params should be {4096*4096}, got {r['full_params']}"
    elif r['lora_params'] != 8*4096 + 8*4096:
        res = f"ERROR: lora_params should be {8*4096+8*4096}, got {r['lora_params']}"
    elif abs(r['reduction_factor'] - r['full_params']/r['lora_params']) > 0.1:
        res = "ERROR: reduction_factor = full_params / lora_params"
    else:
        res = f"SUCCESS: r=8 on 4096×4096: {r['lora_params']:,} params, {r['reduction_factor']:.0f}x reduction."
res
`,
              hint: 'full_params = n*m. lora_params = r*n + r*m (matrix A is r×m, B is n×r). reduction_factor = full/lora. pct_trainable = lora/full*100.',
            },
          ],
        },
      },
    ],
  },

  quiz: [
    {
      id: 'q1',
      question: 'What is the LoRA forward pass formula?',
      options: [
        'h = W₀x + ΔW where ΔW is fully trained',
        'h = W₀x + (α/r) × B(Ax) where A and B are low-rank matrices',
        'h = Ax + Bx where A and B are trained from scratch',
        'h = W₀x × (1 + LoRA_scale)',
      ],
      correct: 1,
      explanation: 'LoRA adds a low-rank bypass to the frozen base weight: h = W₀x + (α/r)×BAx. B is n×r, A is r×m. B initialized to zero means ΔW=0 at training start. The α/r scaling normalizes the contribution as rank changes, making hyperparameter tuning easier.',
    },
    {
      id: 'q2',
      question: 'When should you use fine-tuning instead of RAG?',
      options: [
        'When you want the model to know new factual information',
        'When you want consistent output format/style, domain vocabulary, or to reduce inference cost by using a smaller model',
        'Always — fine-tuning is always better than RAG',
        'When you have more than 1000 documents to index',
      ],
      correct: 1,
      explanation: 'Fine-tuning is NOT for teaching facts (models forget them inconsistently and updates require expensive retraining). Fine-tuning IS for: consistent format/style (e.g., always respond as JSON), domain vocabulary (medical, legal jargon), labeled classification tasks, or replacing a large API model with a small deployed model.',
    },
  ],
}
