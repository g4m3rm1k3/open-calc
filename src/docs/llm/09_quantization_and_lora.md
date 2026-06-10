# Module 09 — Quantization and LoRA
### Do more with less. Derive why both work.

---

## How to Use This Module

Create `09_efficiency.py`.
Type all model code from module 06 at the top, then this.

This module is about efficiency — your instinct from the beginning.
We derive both techniques mathematically, then implement them from scratch.

---

## PART 1 — Quantization

---

### 1.1 The Problem in Plain English

Your trained model stores each weight as a 32-bit floating point number.
That is 4 bytes per weight.

A model with 1 million parameters uses 4 MB.
GPT-2 (117M parameters): 468 MB.
Llama 7B (7 billion parameters): 28 GB.

To run Llama 7B on a 8 GB gaming GPU: impossible.
To run a quantized version: possible.

**Quantization** reduces precision to reduce memory:
- FP32 (32-bit float): 4 bytes per weight — full precision
- FP16 (16-bit float): 2 bytes — half precision, small quality loss
- INT8 (8-bit integer): 1 byte — quarter precision, acceptable quality loss
- INT4 (4-bit integer): 0.5 bytes — eighth precision, noticeable quality loss

The question is: **how much precision do we actually need?**

---

### 1.2 Why Less Precision Works

Neural networks are **robust to small weight perturbations**.

Think about why: a well-trained model sits near a minimum of the loss function.
At a minimum, the loss function is locally flat (otherwise you could decrease it further).
Small changes to weights = small changes to loss.

Small changes to weights is exactly what quantization introduces.
It rounds each weight to the nearest quantization level.
As long as the rounding error is small relative to the weight value,
the model barely changes.

This is not true during training — training requires precise gradients.
But during inference (running the model), approximate weights are fine.

---

### 1.3 The Math of Uniform Quantization

We want to map a range of float values to a limited set of integers.

**Given:** weights in range [wmin, wmax], target n_bits

**Number of quantization levels:** `N = 2^n_bits - 1`
- 8-bit: N = 255
- 4-bit: N = 15

**Scale:** how much real-number range each integer step represents
```
scale = (wmax - wmin) / N
```

**Zero point:** which integer represents 0.0
```
zero_point = round(-wmin / scale)
```

**Quantize** (float → integer):
```
q = round(w / scale) + zero_point
q = clamp(q, 0, N)   ← ensure within valid range
```

**Dequantize** (integer → approximate float):
```
w_approx = (q - zero_point) × scale
```

**Maximum error per weight:**
The worst case is rounding half a step in either direction:
```
max_error = scale / 2 = (wmax - wmin) / (2 × N)
```

For 8-bit quantization with typical weight range [-2, 2]:
```
scale = 4 / 255 ≈ 0.0157
max_error ≈ 0.0078
```

For typical weight magnitudes of ~0.1-1.0, this error is < 10%.
The model barely notices.

---

### 1.4 Per-Channel vs Per-Tensor Quantization

**Per-tensor:** one scale and zero_point for the entire weight matrix.
Simple. But if some output channels have very different weight ranges,
the channels with small weights get poor precision.

**Per-channel:** one scale and zero_point per output channel (row of the matrix).
Each channel's weights are quantized within their own range.
Better precision. Slightly more complex.

Modern quantization uses per-channel for better quality.
We implement per-tensor for simplicity.

---

## PART 2 — LoRA (Low-Rank Adaptation)

---

### 2.1 The Problem LoRA Solves

You have a trained model — say, a Gemma 2B with 2 billion parameters.
You want to fine-tune it on your own dataset (Python code you wrote,
a specific domain, a specific style).

**Full fine-tuning:**
- Update all 2 billion parameters
- Need gradients for all 2 billion parameters
- Requires huge GPU memory (80-200+ GB)
- You probably cannot do this at home

**LoRA's insight:**
You do not need to update ALL 2 billion parameters.
The update ΔW that fine-tuning would learn has low intrinsic rank.

What does "low rank" mean?

---

### 2.2 Rank and Low-Rank Matrices

A matrix W ∈ ℝ^(m×n) has **rank r** if it can be expressed as:
```
W = A × B     where A ∈ ℝ^(m×r), B ∈ ℝ^(r×n)
```

If r < min(m, n), this is a **low-rank** matrix.
It can be stored as A and B instead of W.

Storage comparison:
- Full W: m × n numbers
- Low-rank A, B: m×r + r×n = r(m+n) numbers

If r = 8, m = n = 512: full = 262,144 vs low-rank = 8,192 (3% of full)

---

### 2.3 Why Fine-Tuning Updates Have Low Rank

**Empirical observation:** When you fine-tune a large model on a specific task,
the weight changes ΔW tend to have low rank.

**Intuition:** The pretrained model already knows a lot.
Fine-tuning shifts the model toward a specific style or domain.
That shift lives in a low-dimensional subspace of the full weight space.

You do not need to change all 512×512 = 262,144 directions.
You need to change 8-16 key directions that define the style difference.

**LoRA's implementation:**
Instead of updating W directly, add a low-rank update:
```
W' = W + ΔW = W + B × A
```

Where:
- W is the pretrained weight (frozen — never updated)
- A ∈ ℝ^(r×n): a small matrix, initialized randomly
- B ∈ ℝ^(m×r): a small matrix, initialized to ZERO

**Why B=0 initialization?**
At the start of fine-tuning: B × A = zero × A = 0
So the initial output is identical to the pretrained model.
Fine-tuning starts from exactly the pretrained weights.

If B were random, the initial output would be garbage.
We would need to "undo" the random initialization before learning anything useful.

---

### 2.4 The Scaling Factor

LoRA adds a scaling factor α:
```
W' = W + (α/r) × B × A
```

This controls how large the LoRA update can grow.
Typical: α = 2r (so α/r = 2)

During training: only A and B are updated. W is frozen.
After training: you can merge: `W_merged = W + (α/r) × B × A`
The merged model is back to standard form — no inference overhead.

---

### 2.5 Parameter Count Comparison

For a weight matrix W ∈ ℝ^(768×768) with rank r=16:

| Method | Parameters trained |
|--------|-------------------|
| Full fine-tune | 768 × 768 = 589,824 |
| LoRA r=16 | 16×768 + 768×16 = 24,576 (4.2%) |
| LoRA r=4 | 4×768 + 768×4 = 6,144 (1.0%) |

---

## PART 3 — Writing the Code

```python
# 09_efficiency.py
#
# Quantization and LoRA — both built from scratch.
# Type all model code from module 06 at the top first.

import torch
import torch.nn as nn
import torch.nn.functional as F
import math
import pickle
import json
import copy
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np

# [Type all model code from modules 04-06 here]
```

```python
# ============================================================
# PART A: QUANTIZATION FROM SCRATCH
# ============================================================

# -------------------------------------------------------
# QUANTIZE A SINGLE TENSOR
#
# Maps float values to integers, stores scale and zero_point
# needed to recover approximate floats.
# -------------------------------------------------------

def quantize_tensor(tensor, n_bits=8):
    """
    Quantize a float tensor to n_bits unsigned integers.
    
    tensor:  a float tensor of any shape
    n_bits:  number of bits (8 = INT8, 4 = INT4)
    
    Returns: (quantized, scale, zero_point)
      quantized:   integer tensor, same shape
      scale:       float, how much real range each integer step represents
      zero_point:  int, which integer value represents 0.0
    """
    # Find the range of values in the tensor
    w_min = tensor.min().item()
    w_max = tensor.max().item()
    
    # Number of quantization levels (integer values we can use)
    # n_bits=8: 0 to 255 → 255 levels
    # n_bits=4: 0 to 15  → 15 levels
    n_levels = 2 ** n_bits - 1
    
    # Scale: real-number range per integer step
    # If weights span [-2, 2] = range 4, and we have 255 levels:
    # scale = 4 / 255 ≈ 0.0157  (each integer step = 0.0157 in real units)
    scale = (w_max - w_min) / n_levels
    
    # Guard against zero scale (all weights are identical)
    if scale == 0:
        scale = 1.0   # arbitrary, avoids division by zero
    
    # Zero point: which integer represents 0.0
    # 0.0 = (zero_point - zero_point) × scale
    # So zero_point = -w_min / scale
    zero_point = round(-w_min / scale)
    zero_point = max(0, min(n_levels, zero_point))   # clamp to valid range
    
    # Quantize: float → integer
    # 1. Divide by scale to convert to integer units
    # 2. Add zero_point to shift to unsigned range
    # 3. Round to nearest integer
    # 4. Clamp to [0, n_levels] to stay within valid range
    q = torch.round(tensor / scale + zero_point)
    q = q.clamp(0, n_levels)
    
    # Store as appropriate integer type
    if n_bits <= 8:
        q = q.to(torch.uint8)   # unsigned 8-bit integer
    else:
        q = q.to(torch.int32)   # for 4-bit we use int32 (no native 4-bit tensor)
    
    return q, scale, zero_point


def dequantize_tensor(quantized, scale, zero_point):
    """
    Recover approximate float values from quantized integers.
    
    This is the inverse of quantize_tensor.
    The result will differ from the original by at most scale/2 per element.
    """
    # Convert back: (integer - zero_point) × scale
    return (quantized.float() - zero_point) * scale


# Test
print("=== QUANTIZATION TEST ===")
print()

torch.manual_seed(0)
weight = torch.randn(32, 32)   # a typical weight matrix

for n_bits in [8, 4]:
    q, scale_q, zp = quantize_tensor(weight, n_bits)
    w_reconstructed = dequantize_tensor(q, scale_q, zp)
    
    error     = (weight - w_reconstructed).abs()
    max_error = error.max().item()
    avg_error = error.mean().item()
    
    # Theoretical maximum error
    n_levels       = 2 ** n_bits - 1
    theoretical_max = (weight.max() - weight.min()).item() / (2 * n_levels)
    
    # Memory
    orig_bytes = weight.numel() * 4   # float32 = 4 bytes
    quant_bytes = weight.numel() * (1 if n_bits == 8 else 0.5)
    
    print(f"INT{n_bits} quantization:")
    print(f"  Quantization levels: {n_levels + 1}")
    print(f"  Scale:               {scale_q:.6f}")
    print(f"  Zero point:          {zp}")
    print(f"  Max error:           {max_error:.6f}  (theoretical max: {theoretical_max:.6f})")
    print(f"  Mean error:          {avg_error:.6f}")
    print(f"  Memory: {orig_bytes} bytes → {quant_bytes:.0f} bytes  "
          f"({100*quant_bytes/orig_bytes:.0f}% of original)")
    print()
```

```python
# -------------------------------------------------------
# VISUALIZE QUANTIZATION ERROR
# -------------------------------------------------------

fig, axes = plt.subplots(1, 3, figsize=(15, 4.5))

# Original distribution
axes[0].hist(weight.numpy().flatten(), bins=60, color='steelblue', alpha=0.8)
axes[0].set_title("Original Weights (float32)\n4 bytes per value")
axes[0].set_xlabel("Weight Value")
axes[0].set_ylabel("Count")

# INT8 error
q8, s8, zp8 = quantize_tensor(weight, 8)
err8 = (weight - dequantize_tensor(q8, s8, zp8)).abs().numpy().flatten()
axes[1].hist(err8, bins=60, color='orange', alpha=0.8)
axes[1].set_title(f"INT8 Quantization Error\n1 byte per value (4× smaller)\nMax error: {err8.max():.4f}")
axes[1].set_xlabel("Absolute Error")

# INT4 error
q4, s4, zp4 = quantize_tensor(weight, 4)
err4 = (weight - dequantize_tensor(q4, s4, zp4)).abs().numpy().flatten()
axes[2].hist(err4, bins=60, color='tomato', alpha=0.8)
axes[2].set_title(f"INT4 Quantization Error\n0.5 bytes per value (8× smaller)\nMax error: {err4.max():.4f}")
axes[2].set_xlabel("Absolute Error")

plt.suptitle("Quantization Error Distribution\nINT8 is very accurate; INT4 is noisier but still usable",
             fontsize=12)
plt.tight_layout()
plt.savefig("09a_quantization_error.png", dpi=130)
print("Saved: 09a_quantization_error.png")
```

```python
# -------------------------------------------------------
# QUANTIZE THE FULL TRAINED MODEL
# -------------------------------------------------------

# Load trained model
print("\n=== QUANTIZE THE TRAINED MODEL ===")
print()

checkpoint = torch.load('trained_model.pt', map_location='cpu')
config_saved = checkpoint['config']
vocab_size_q = config_saved['vocab_size']
id_to_char_q = checkpoint['id_to_char']
char_to_id_q = checkpoint['char_to_id']

decode_q = lambda ids: ''.join(id_to_char_q[i] for i in ids)
encode_q = lambda text: [char_to_id_q[c] for c in text if c in char_to_id_q]

model_q = GPT(
    vocab_size  = vocab_size_q,
    d_model     = config_saved['d_model'],
    n_heads     = config_saved['n_heads'],
    n_layers    = config_saved['n_layers'],
    max_seq_len = config_saved['max_seq_len'],
)
model_q.load_state_dict(checkpoint['model_state_dict'])
model_q.eval()

def quantize_model(model, n_bits=8):
    """
    Quantize all weight matrices in the model.
    
    Returns a dict mapping parameter names to quantization info.
    """
    quant_state = {}
    total_orig  = 0
    total_quant = 0
    
    for name, param in model.named_parameters():
        # Only quantize weight matrices (2D+ tensors)
        # Skip biases, LayerNorm gamma/beta — these are small and important to keep precise
        if param.dim() >= 2 and 'weight' in name:
            q, scale, zp = quantize_tensor(param.data, n_bits)
            
            quant_state[name] = {
                'quantized':   q,
                'scale':       scale,
                'zero_point':  zp,
                'n_bits':      n_bits,
            }
            
            orig_bytes  = param.numel() * 4
            quant_bytes = param.numel() * (1 if n_bits == 8 else 0.5)
            total_orig  += orig_bytes
            total_quant += quant_bytes
    
    print(f"Quantized {len(quant_state)} weight tensors to INT{n_bits}")
    print(f"Memory: {total_orig/1e6:.2f} MB → {total_quant/1e6:.2f} MB  "
          f"({100*total_quant/total_orig:.0f}% of original)")
    
    return quant_state

quant_state = quantize_model(model_q, n_bits=8)
```

```python
# -------------------------------------------------------
# COMPARE GENERATION: ORIGINAL vs QUANTIZED
# -------------------------------------------------------

print("\n=== ORIGINAL vs QUANTIZED GENERATION ===")
print()
print("Temporarily applying quantized weights to show the effect...")
print()

def generate_q(model, prompt, max_tokens=150, temp=0.8, top_k=40):
    ids = torch.tensor([encode_q(prompt)], dtype=torch.long)
    with torch.no_grad():
        out = model.generate(ids, max_tokens, temp, top_k)
    return decode_q(out[0].tolist())

prompt_q = "\nHAMLET:\n"

# Generate with original weights
torch.manual_seed(42)
original_gen = generate_q(model_q, prompt_q)
print("Original (float32):")
print(original_gen[:300])
print()

# Apply quantized weights temporarily and generate
original_weights = {}
with torch.no_grad():
    for name, param in model_q.named_parameters():
        if name in quant_state:
            original_weights[name] = param.data.clone()
            qs = quant_state[name]
            # Replace float weights with dequantized approximations
            param.data = dequantize_tensor(qs['quantized'], qs['scale'], qs['zero_point'])

torch.manual_seed(42)
quantized_gen = generate_q(model_q, prompt_q)
print("After INT8 quantization:")
print(quantized_gen[:300])

# Restore original weights
with torch.no_grad():
    for name, param in model_q.named_parameters():
        if name in original_weights:
            param.data = original_weights[name]

print()
print("The outputs should be very similar.")
print("4× memory reduction with negligible quality loss — that is the point.")
```

```python
# ============================================================
# PART B: LoRA FROM SCRATCH
# ============================================================

print("\n\n=== LoRA FROM SCRATCH ===")
print()

# -------------------------------------------------------
# LoRA LINEAR LAYER
#
# Wraps a standard Linear layer.
# Freezes the original weights (W).
# Adds trainable low-rank matrices (A and B).
# Output = W × x  +  (α/r) × B × A × x
# -------------------------------------------------------

class LoRALinear(nn.Module):
    """
    A linear layer with LoRA low-rank adaptation.
    
    The original weight W is frozen (requires_grad=False).
    We add trainable low-rank update: ΔW = (α/r) × B × A
    
    Parameters:
    - original: the original nn.Linear layer
    - r:        rank of the adaptation (smaller = fewer params)
    - alpha:    scaling factor (controls magnitude of the update)
    
    During training: only A and B are updated.
    After training: can merge into W for zero inference overhead.
    """
    
    def __init__(self, original_linear, r=8, alpha=16):
        super().__init__()
        
        self.in_features  = original_linear.in_features
        self.out_features = original_linear.out_features
        self.r            = r
        self.alpha        = alpha
        self.scaling      = alpha / r   # the α/r scaling factor
        
        # Freeze the original weights
        # requires_grad=False: this parameter will NOT be updated by optimizer
        self.weight           = original_linear.weight
        self.weight.requires_grad = False
        
        # Keep the bias (if any), also frozen
        self.bias = original_linear.bias
        if self.bias is not None:
            self.bias.requires_grad = False
        
        # LoRA matrices — these ARE trained
        # A: [r, in_features] — projects down to rank-r space
        # B: [out_features, r] — projects back to output space
        self.lora_A = nn.Parameter(
            torch.empty(r, self.in_features)
        )
        self.lora_B = nn.Parameter(
            torch.zeros(self.out_features, r)   # ← ZERO initialization
        )
        
        # Initialize A with Kaiming uniform (standard for linear layers)
        # Initialize B with ZEROS so the initial LoRA contribution is zero
        nn.init.kaiming_uniform_(self.lora_A, a=math.sqrt(5))
        # lora_B is already zeros from nn.Parameter(torch.zeros(...))
    
    def forward(self, x):
        """
        x: [..., in_features]
        
        Output = W @ x + bias  +  scaling × B @ A @ x
                  ← original →    ←LoRA update (initially zero)→
        """
        # Original linear transformation (using frozen W)
        original = F.linear(x, self.weight, self.bias)
        
        # LoRA update: (α/r) × B × A × x
        # Step 1: project down to rank-r space: x → A×x  (shape: [..., r])
        # Step 2: project back up: A×x → B×(A×x)  (shape: [..., out_features])
        # Step 3: scale by α/r
        lora_update = (x @ self.lora_A.T) @ self.lora_B.T * self.scaling
        # Why @ self.lora_A.T and not @ self.lora_A?
        # Because linear layers convention: output = x @ W.T
        # Our A has shape [r, in_features], so we need [in_features, r] = A.T
        
        return original + lora_update
    
    @property
    def trainable_params(self):
        """Number of trainable parameters (just A and B)."""
        return self.lora_A.numel() + self.lora_B.numel()
    
    def merge_weights(self):
        """
        Merge LoRA update into W.
        
        After merging: W_new = W + (α/r) × B × A
        The LoRA layers can then be removed — no inference overhead.
        """
        with torch.no_grad():
            merged_W = self.weight + self.scaling * (self.lora_B @ self.lora_A)
        
        # Return a standard Linear layer with merged weights
        new_linear        = nn.Linear(self.in_features, self.out_features,
                                       bias=self.bias is not None)
        new_linear.weight = nn.Parameter(merged_W)
        if self.bias is not None:
            new_linear.bias = nn.Parameter(self.bias.data.clone())
        
        return new_linear


# Test LoRA initialization
print("=== LoRA LAYER TEST ===")
print()

original_layer = nn.Linear(64, 128)
lora_layer     = LoRALinear(original_layer, r=8, alpha=16)

x_lora = torch.randn(4, 10, 64)   # batch=4, seq=10

# At initialization, B=0, so LoRA output = original output
out_original = F.linear(x_lora, original_layer.weight, original_layer.bias)
out_lora     = lora_layer(x_lora)

print(f"Output shapes:  original={out_original.shape}, lora={out_lora.shape}")
print(f"Outputs match (B=0 at init): {torch.allclose(out_original, out_lora, atol=1e-6)}")
print()

# Parameter count comparison
orig_params   = original_layer.weight.numel() + (original_layer.bias.numel() if original_layer.bias else 0)
lora_trainable = lora_layer.trainable_params
print(f"Original parameters:   {orig_params:,}")
print(f"LoRA trainable params: {lora_trainable:,}  ({100*lora_trainable/orig_params:.1f}%)")
```

```python
# -------------------------------------------------------
# APPLY LoRA TO THE FULL MODEL
# -------------------------------------------------------

def apply_lora_to_model(model, r=8, alpha=16, target_modules=None):
    """
    Replace linear layers in the model with LoRA-wrapped versions.
    
    model:           the GPT model
    r:               LoRA rank
    alpha:           LoRA scaling factor
    target_modules:  list of module name substrings to apply LoRA to
                     (default: attention projection matrices)
    
    Returns: number of LoRA trainable parameters added
    """
    if target_modules is None:
        # Apply LoRA to attention projection matrices
        # These are the most impactful for fine-tuning style
        target_modules = ['W_Q', 'W_K', 'W_V', 'W_O']
    
    total_lora_params = 0
    replaced_layers   = []
    
    for module_path, module in list(model.named_modules()):
        # Check if this module's path matches any target
        should_replace = any(target in module_path for target in target_modules)
        
        if should_replace and isinstance(module, nn.Linear):
            # Navigate to the parent module
            path_parts  = module_path.split('.')
            parent      = model
            for part in path_parts[:-1]:
                parent = getattr(parent, part)
            attr_name = path_parts[-1]
            
            # Create LoRA wrapper
            lora_module = LoRALinear(module, r=r, alpha=alpha)
            
            # Replace the original layer with the LoRA wrapper
            setattr(parent, attr_name, lora_module)
            
            total_lora_params += lora_module.trainable_params
            replaced_layers.append(module_path)
    
    print(f"Applied LoRA to {len(replaced_layers)} layers:")
    for layer_path in replaced_layers[:8]:   # show first 8
        print(f"  {layer_path}")
    if len(replaced_layers) > 8:
        print(f"  ... and {len(replaced_layers) - 8} more")
    
    return total_lora_params


# Load trained model
lora_model = GPT(
    vocab_size  = vocab_size_q,
    d_model     = config_saved['d_model'],
    n_heads     = config_saved['n_heads'],
    n_layers    = config_saved['n_layers'],
    max_seq_len = config_saved['max_seq_len'],
)
lora_model.load_state_dict(checkpoint['model_state_dict'])

# Count parameters before LoRA
params_before = sum(p.numel() for p in lora_model.parameters())
print(f"\n=== APPLYING LoRA TO TRAINED MODEL ===")
print(f"Parameters before LoRA: {params_before:,}")
print()

# Apply LoRA
lora_params = apply_lora_to_model(lora_model, r=4, alpha=8)

# Count trainable parameters after LoRA
trainable_after = sum(p.numel() for p in lora_model.parameters() if p.requires_grad)
total_after     = sum(p.numel() for p in lora_model.parameters())

print()
print(f"After LoRA:")
print(f"  Total parameters:     {total_after:,}  (LoRA A+B added)")
print(f"  Trainable parameters: {trainable_after:,}  ({100*trainable_after/total_after:.2f}%)")
print(f"  Frozen parameters:    {total_after - trainable_after:,}  (original W matrices)")
print()
print(f"We train only {100*trainable_after/total_after:.2f}% of parameters.")
print(f"But the full model is used for inference — no quality loss from frozen weights.")
```

```python
# -------------------------------------------------------
# FINE-TUNE WITH LoRA ON PYTHON-ONLY DATA
#
# Our trained model knows both Shakespeare and Python.
# We fine-tune it to specialize in Python using LoRA.
# Only A and B are updated — W stays frozen.
# -------------------------------------------------------

print("\n=== LoRA FINE-TUNING ON PYTHON CODE ===")
print()

# Create a Python-only dataset for fine-tuning
python_only = """
def greet(name):
    print(f"Hello, {name}!")

def square(x):
    return x * x

def cube(x):
    return x * x * x

def power(base, exp):
    result = 1
    for _ in range(exp):
        result *= base
    return result

class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y
    
    def distance_to(self, other):
        dx = self.x - other.x
        dy = self.y - other.y
        return (dx**2 + dy**2) ** 0.5
    
    def __repr__(self):
        return f"Point({self.x}, {self.y})"

def find_max(lst):
    if not lst:
        return None
    maximum = lst[0]
    for item in lst[1:]:
        if item > maximum:
            maximum = item
    return maximum

def flatten(nested):
    result = []
    for item in nested:
        if isinstance(item, list):
            result.extend(flatten(item))
        else:
            result.append(item)
    return result
""" * 20   # repeat to have enough tokens

# Encode using existing tokenizer
python_ids = torch.tensor(
    [char_to_id_q[c] for c in python_only if c in char_to_id_q],
    dtype=torch.long
)
print(f"Python fine-tuning dataset: {len(python_ids):,} tokens")

# Optimizer — only train LoRA parameters
# This is the key efficiency gain: optimizer state only for A and B
lora_optimizer = torch.optim.AdamW(
    [p for p in lora_model.parameters() if p.requires_grad],
    lr = 2e-3,   # can use higher LR for LoRA since updates are small
)

# Fine-tuning loop
block_size_lora = 64
batch_size_lora = 8
n_finetune_steps = 300

lora_model.train()
lora_losses = []

print(f"Fine-tuning for {n_finetune_steps} steps...")
print(f"{'Step':>5}  {'Loss':>8}")
print("-" * 18)

for step in range(n_finetune_steps):
    # Random batch from Python code
    starts = torch.randint(0, len(python_ids) - block_size_lora - 1,
                           (batch_size_lora,))
    x_ft = torch.stack([python_ids[s : s + block_size_lora] for s in starts])
    y_ft = torch.stack([python_ids[s+1 : s + block_size_lora + 1] for s in starts])
    
    _, loss_ft = lora_model(x_ft, y_ft)
    
    lora_optimizer.zero_grad()
    loss_ft.backward()
    torch.nn.utils.clip_grad_norm_(
        [p for p in lora_model.parameters() if p.requires_grad],
        max_norm=1.0
    )
    lora_optimizer.step()
    
    lora_losses.append(loss_ft.item())
    
    if step % 50 == 0:
        print(f"{step:>5}  {loss_ft.item():>8.4f}")

print()
print("Fine-tuning complete.")
```

```python
# -------------------------------------------------------
# COMPARE: BASE vs LoRA FINE-TUNED
# -------------------------------------------------------

print("\n=== BASE MODEL vs LoRA FINE-TUNED ===")
print()
print("(LoRA fine-tuned on Python code only)")
print()

lora_model.eval()

code_prompts = [
    "\ndef ",
    "\nclass ",
    "\nfor i in ",
]

for prompt_text in code_prompts:
    torch.manual_seed(42)
    text = generate_q(lora_model, prompt_text, max_tokens=150, temp=0.7, top_k=30)
    print(f"Prompt: {repr(prompt_text)}")
    print(text[:300])
    print()
```

```python
# -------------------------------------------------------
# MERGE LoRA WEIGHTS AND COMPARE
# -------------------------------------------------------

print("=== MERGING LoRA WEIGHTS INTO BASE MODEL ===")
print()

def merge_lora_in_model(model):
    """
    Find all LoRALinear layers and replace with merged standard Linear layers.
    After merging: model is identical in structure to the original,
    but with updated weights. No inference overhead.
    """
    merged_count = 0
    
    for module_path, module in list(model.named_modules()):
        if isinstance(module, LoRALinear):
            # Navigate to parent
            parts  = module_path.split('.')
            parent = model
            for part in parts[:-1]:
                parent = getattr(parent, part)
            attr_name = parts[-1]
            
            # Merge and replace
            merged_linear = module.merge_weights()
            setattr(parent, attr_name, merged_linear)
            merged_count += 1
    
    print(f"Merged {merged_count} LoRA layers into base weights.")
    return model

merge_lora_in_model(lora_model)

# After merging: all parameters should be trainable again
trainable_merged = sum(p.numel() for p in lora_model.parameters() if p.requires_grad)
print(f"Trainable parameters after merge: {trainable_merged:,}")
print(f"(Same as original — LoRA is gone, weights are baked in)")
print()

# Generate from merged model — should give same results as pre-merge
torch.manual_seed(42)
text_merged = generate_q(lora_model, "\ndef ", max_tokens=150, temp=0.7, top_k=30)
print("Generation from merged model (no inference overhead):")
print(text_merged[:300])
```

```python
# -------------------------------------------------------
# SIDE-BY-SIDE SUMMARY
# -------------------------------------------------------

print("\n=== EFFICIENCY TECHNIQUES SUMMARY ===")
print()

# Reconstruct for parameter counting
base_model_final = GPT(
    vocab_size  = vocab_size_q,
    d_model     = config_saved['d_model'],
    n_heads     = config_saved['n_heads'],
    n_layers    = config_saved['n_layers'],
    max_seq_len = config_saved['max_seq_len'],
)
base_params = sum(p.numel() for p in base_model_final.parameters())

print(f"{'Technique':30s}  {'Memory':>12}  {'Training params':>16}  {'Notes'}")
print("-" * 85)
print(f"{'Full model (float32)':30s}  {base_params*4/1e6:>10.1f}MB  "
      f"{base_params:>16,}  Baseline")
print(f"{'INT8 quantization':30s}  {base_params*1/1e6:>10.1f}MB  "
      f"{'N/A (inference only)':>16}  4× smaller, ~same quality")
print(f"{'INT4 quantization':30s}  {base_params*0.5/1e6:>10.1f}MB  "
      f"{'N/A (inference only)':>16}  8× smaller, slight quality loss")
print(f"{'LoRA r=4, attn only':30s}  {base_params*4/1e6:>10.1f}MB  "
      f"{lora_params:>16,}  {100*lora_params/base_params:.2f}% trainable params")
print(f"{'LoRA r=4, INT8 model':30s}  {base_params*1/1e6:>10.1f}MB  "
      f"{lora_params:>16,}  Best combo for constrained hardware")

print()
print("For your gaming GPU (4-8GB VRAM):")
print("  - Your model (2M params):       fine for full training")
print("  - GPT-2 small (117M params):    INT8 + LoRA fine-tune")
print("  - Gemma 2B (2B params):         INT4 + LoRA fine-tune (borderline)")
print("  - Gemma 7B (7B params):         INT4 quantization, inference only")
print()
print("For your work Intel Max (64GB NPU):")
print("  - Gemma 7B:                     full fine-tune with LoRA")
print("  - Gemma 27B:                    INT8 inference, INT4 + LoRA fine-tune")
```

---

## PART 4 — What to Try Next

---

### 4.1 Loading Gemma With Your Understanding

Now that you understand the full architecture, every piece of Gemma
(or Llama, or Mistral) maps directly to what you built.

```python
# After pip install transformers:
from transformers import AutoTokenizer, AutoModelForCausalLM
import torch

model_name = "google/gemma-2-2b"   # or gemma-2-9b, phi-3-mini, llama3.2

tokenizer = AutoTokenizer.from_pretrained(model_name)
model     = AutoModelForCausalLM.from_pretrained(
    model_name,
    torch_dtype   = torch.bfloat16,   # 16-bit, 2× memory savings
    device_map    = "auto",           # automatic CPU/GPU allocation
)

# Things to explore:
print(model)                          # look at the architecture — you built this
print(model.config)                   # config file — exactly like your TRAINING_CONFIG
print(model.model.layers[0])         # one transformer block — same structure as yours

# Differences you will see (modern improvements):
# - RoPE instead of learned position embeddings (relative position encoding)
# - SwiGLU instead of GELU in the FFN
# - Grouped Query Attention (fewer KV heads than Q heads)
# - RMSNorm instead of LayerNorm (simpler, no mean subtraction)
# - Pre-norm (same as yours)
# - Weight tying (same as yours)
```

---

### 4.2 Fine-Tuning Gemma With LoRA

```python
# After pip install peft:
from peft import get_peft_model, LoraConfig, TaskType

lora_config = LoraConfig(
    r              = 16,
    lora_alpha     = 32,
    target_modules = ["q_proj", "k_proj", "v_proj", "o_proj"],
    lora_dropout   = 0.05,
    task_type      = TaskType.CAUSAL_LM,
)

peft_model = get_peft_model(model, lora_config)
peft_model.print_trainable_parameters()
# Trainable params: ~0.5% of total — this is what you built from scratch above
```

---

## ✅ Check Your Understanding

1. INT8 quantization has 256 levels. INT4 has 16 levels.
   If weights range from -2 to 2:
   What is the scale for INT8? For INT4?
   What is the maximum error for each?
   How does accuracy trade off against memory?

2. LoRA initializes B=0. After one gradient step, is B still zero?
   What is the LoRA contribution to the output after one step?
   How does this grow over many training steps?

3. We apply LoRA only to the attention matrices (W_Q, W_K, W_V, W_O).
   Why not also apply LoRA to the FFN linear layers?
   What would that cost in additional trainable parameters?
   When might you want to include the FFN?

4. After merging LoRA weights with `W_merged = W + (α/r) × B × A`,
   the model has the same structure as before LoRA.
   If you then fine-tune this merged model with LoRA again (adding new A and B),
   what does the merged model represent?
   Can you stack multiple rounds of LoRA fine-tuning this way?

5. Quantization is applied AFTER training (post-training quantization).
   Quantization-Aware Training (QAT) simulates quantization DURING training.
   Why would QAT give better results than post-training quantization?
   What is the main challenge with QAT?
   (Hint: the rounding operation in quantization is not differentiable.)

---

## 🧪 Experiments

**Experiment 1: Quantization error vs model quality**
Quantize the model at different levels: float32, INT8, INT4.
For each, generate 5 samples with the same prompt and seed.
Compute the perplexity on 100 validation batches.
Plot: quantization bits vs perplexity. At what level does quality degrade?

**Experiment 2: LoRA rank sensitivity**
Fine-tune three models with LoRA r=2, r=8, r=32.
Compare: trainable parameters, fine-tuning loss after 200 steps,
generation quality on the fine-tuning domain.
Is more rank always better? Where are the diminishing returns?

**Experiment 3: LoRA target layers**
Fine-tune with LoRA applied to: (a) only Q and K, (b) only V and O,
(c) only FFN, (d) all four attention matrices.
Which gives the best fine-tuning quality for the same parameter count?

**Experiment 4: Verify B stays zero at init**
Print the norm of lora_B before and after 1, 10, 100 training steps.
Does it grow monotonically? What does its growth represent?
(It represents how much the model has adapted from the pretrained weights.)

**Experiment 5: Per-channel vs per-tensor quantization**
Implement per-channel quantization: one scale per row of the weight matrix.
Compare max quantization error vs per-tensor for the same weight matrix.
Is per-channel always better? What is the overhead in terms of stored metadata?

---

> You have completed the core tutorial.
> Move to Module 10 for the roadmap to everything beyond.
