# Module 05 — FFN, LayerNorm, Residuals, and the Transformer Block
### Build every remaining piece. Then assemble them.

---

## How to Use This Module

Create `05_transformer_block.py` and type every line.
This module finishes all the components and puts them together.
By the end, you have one complete transformer layer.

---

## PART 1 — The Feed-Forward Network

---

### 1.1 What the FFN Does and Why It Exists

After attention, each token has gathered information from other tokens.
The attention mechanism is the "communication" step.

But gathering information is not the same as processing it.
The feed-forward network (FFN) is the "computation" step.
It takes each token's representation and runs it through a small neural network,
independently for each token.

Think of it this way:
- Attention says: "token 5 should look at tokens 2 and 7"
- FFN says: "now that token 5 has that information, compute something useful with it"

The FFN has no interaction between positions.
Token 5's FFN output depends only on token 5's vector (after attention).
Token 6's FFN output depends only on token 6's vector.
They are processed independently with the same weights.

This independence is important: it means the FFN is learning a function
that maps one token representation to another, applied at every position.
It is like a dictionary of transformations: "given this kind of representation,
produce this kind of output."

---

### 1.2 The Architecture

```
FFN(x) = W₂ × GELU(W₁ x + b₁) + b₂
```

Two linear layers with a non-linear activation in between.

- W₁: expands from d_model to d_ff (the expansion)
- GELU: the activation function (non-linearity)
- W₂: contracts from d_ff back to d_model (the contraction)

The hidden dimension d_ff is typically 4 × d_model.
This 4× factor was in the original 2017 paper and has persisted.
Intuitively: expand to a larger space to compute, then compress back.

**Why do we need two layers?**
One linear layer followed by one linear layer is just... one linear layer.
The composition of two linear functions is a linear function.
We NEED the non-linearity (GELU) between them.
That is what makes the two-layer version more powerful than one layer.

---

### 1.3 GELU — The Activation Function

**What an activation function is:**
An activation function introduces non-linearity.
Without it, stacking linear layers gives us nothing beyond one linear layer.
With it, the network can approximate any function (Universal Approximation Theorem).

**Why GELU and not ReLU?**
ReLU: f(x) = max(0, x). Simple, but has a "dead" region: for x < 0, output is 0
AND gradient is 0. Neurons can "die" — become permanently inactive.

GELU (Gaussian Error Linear Unit):
```
GELU(x) = x × Φ(x)
```

Where Φ(x) is the probability that a standard normal random variable is ≤ x
(the Gaussian Cumulative Distribution Function).

**Intuition:** GELU is a "smooth gate." When x is large and positive:
Φ(x) ≈ 1, so GELU(x) ≈ x (passes through).
When x is large and negative: Φ(x) ≈ 0, so GELU(x) ≈ 0 (blocked).
Near 0: smooth transition, not the hard kink that ReLU has.

The smooth transition means gradients are never exactly zero.
Training is more stable, especially for deep networks.

**The approximation we use:**
The exact Gaussian CDF has no closed form — it requires numerical integration.
We use a very accurate approximation:
```
GELU(x) ≈ 0.5x × (1 + tanh[√(2/π) × (x + 0.044715x³)])
```

This is the version used in GPT-2 and most modern models.

---

## PART 2 — Layer Normalization

---

### 2.1 The Problem It Solves

During training, as weights change, the distribution of activations
at each layer changes. Layer 5 is learning to process inputs from layer 4,
but layer 4 is also changing because it is also being trained.

Each layer is trying to learn something useful from a moving target.
This makes training slow and can make it unstable.

This problem is called **internal covariate shift**.

**Layer Normalization** solves it by normalizing each token's vector
to have zero mean and unit variance before it passes to the next layer.
Now each layer always sees inputs with the same distribution,
regardless of what earlier layers are doing.

---

### 2.2 The Formula Derived

For a vector x ∈ ℝᵈ (one token's representation):

**Step 1:** Compute the mean across all d dimensions:
```
μ = (1/d) Σᵢ xᵢ
```

**Step 2:** Compute the variance:
```
σ² = (1/d) Σᵢ (xᵢ - μ)²
```

**Step 3:** Normalize:
```
x̂ᵢ = (xᵢ - μ) / √(σ² + ε)
```

The ε (epsilon) is a tiny constant (like 1e-5) to prevent division by zero
when variance is zero.

After normalization, x̂ has mean 0 and variance 1.

**Step 4:** Apply learned scale and shift:
```
output = γ × x̂ + β
```

γ (gamma) and β (beta) are learned parameters.
Why not just keep the normalized version?
Because forcing mean=0, std=1 forever might not be optimal.
γ and β let the model "un-normalize" by whatever amount is useful.
They start at γ=1, β=0 (identity) and the model learns from there.

**Why across features, not across the batch?**
BatchNorm (popular in image models) normalizes across the batch dimension.
For text, sequences have different lengths. Batch statistics are unreliable
when the batch contains short and long sequences mixed together.
LayerNorm normalizes across the feature dimension for each token independently.
No batch dependency. Works the same way regardless of batch size or sequence length.

---

## PART 3 — Residual Connections

---

### 3.1 The Problem They Solve

A 12-layer transformer has many operations stacked.
During backpropagation, the gradient must flow backwards through all 12 layers.

For a chain of 12 operations f₁₂(f₁₁(...f₁(x)...)), the gradient at layer 1 is:
```
∂L/∂x = (∂L/∂f₁₂) × (∂f₁₂/∂f₁₁) × ... × (∂f₂/∂f₁)
```

This is a product of 12 terms (the chain rule applied 12 times).
If each term is < 1 (very common), the product → 0 for large depth.
Gradients vanish. Early layers learn nothing.

This is the **vanishing gradient problem** and it was the main barrier
to training deep networks before 2015.

---

### 3.2 The Residual Fix

Instead of: `x = f(x)` (output replaces input)
Use: `x = x + f(x)` (output ADDS to input)

This is a **residual connection** or **skip connection**.

Why does this fix vanishing gradients?

The gradient of `x = x + f(x)` with respect to x (the input) is:
```
∂(x + f(x))/∂x = 1 + ∂f(x)/∂x
```

There is a "+1" term. This means:
Even if ∂f/∂x → 0, the total gradient is still at least 1.
Gradients cannot vanish to zero — the "+1" term is always there.

Geometrically: the residual connection creates a direct highway for gradients
to flow backwards through the network, bypassing all the transformations.

**The "residual stream" view:**
Think of x as a "stream" of information.
Each transformer block reads from the stream, computes something, and adds back.
The stream is never replaced — only updated.
Information from the very first layer can persist all the way to the output.

---

### 3.3 Pre-Norm vs Post-Norm

**Original transformer (2017):** Post-norm
```
x = LayerNorm(x + Attention(x))
x = LayerNorm(x + FFN(x))
```

**GPT-2 and modern models:** Pre-norm
```
x = x + Attention(LayerNorm(x))
x = x + FFN(LayerNorm(x))
```

We use pre-norm because:
- The residual stream (x) is never normalized, so gradients flow cleanly
- Each block sees a normalized input regardless of what happened before
- Training is more stable for deep models (many layers)

---

## PART 4 — Writing the Code

```python
# 05_transformer_block.py
#
# In this file we build:
# 1. GELU activation (derived above)
# 2. FeedForward network
# 3. LayerNorm
# 4. The complete TransformerBlock (assembling everything)
#
# We also copy in all code from module 04 (attention).
# This file becomes the complete set of model building blocks.

import torch
import torch.nn as nn
import torch.nn.functional as F
import math
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np

# ---- Copy these from 04_embeddings_attention.py ----
# scaled_dot_product_attention()
# make_causal_mask()
# EmbeddingLayer class
# MultiHeadAttention class
# (Type them here again — the repetition helps you learn them)
```

```python
# -------------------------------------------------------
# GELU ACTIVATION — BUILT FROM SCRATCH
#
# Plain English: a smooth gate function.
# Large positive x → passes through (like identity)
# Large negative x → blocked (like zero)
# Near zero → smooth transition (unlike ReLU's hard kink)
#
# Formula:
#   GELU(x) ≈ 0.5x × (1 + tanh[√(2/π) × (x + 0.044715x³)])
# -------------------------------------------------------

def gelu(x):
    """
    Gaussian Error Linear Unit activation function.
    
    x: a tensor of any shape
    returns: same shape, with GELU applied element-wise
    
    This is the approximation used in GPT-2.
    It is almost identical to the exact GELU but runs faster.
    The error is less than 0.001 for any input.
    """
    # Constants in the approximation formula
    # √(2/π) ≈ 0.7978845608
    # 0.044715 is a fitted constant from the original GELU paper
    
    inner = math.sqrt(2.0 / math.pi) * (x + 0.044715 * x ** 3)
    # inner is the argument to tanh
    # For large positive x: inner → large positive → tanh → +1
    # For large negative x: inner → large negative → tanh → -1
    # Near 0: tanh is approximately linear
    
    return 0.5 * x * (1.0 + torch.tanh(inner))
    # 0.5 × x × (1 + tanh(inner))
    # When tanh(inner) ≈ +1: result ≈ 0.5 × x × 2 = x  (pass through)
    # When tanh(inner) ≈ -1: result ≈ 0.5 × x × 0 = 0  (blocked)


# Compare GELU to ReLU visually and numerically
x_test = torch.linspace(-3, 3, 200)
relu_out = torch.relu(x_test)
gelu_out = gelu(x_test)

fig, axes = plt.subplots(1, 3, figsize=(15, 4))

# The functions themselves
axes[0].plot(x_test.numpy(), relu_out.numpy(), color='tomato',    lw=2.5, label='ReLU')
axes[0].plot(x_test.numpy(), gelu_out.detach().numpy(), color='steelblue', lw=2.5, label='GELU')
axes[0].axhline(0, color='black', lw=0.5)
axes[0].axvline(0, color='black', lw=0.5)
axes[0].set_title("ReLU vs GELU", fontsize=11)
axes[0].set_xlabel("Input x")
axes[0].set_ylabel("f(x)")
axes[0].legend(); axes[0].grid(True, alpha=0.3)

# Their difference (GELU is negative for small negative x, ReLU is zero)
diff = gelu_out.detach().numpy() - relu_out.numpy()
axes[1].plot(x_test.numpy(), diff, color='purple', lw=2.5)
axes[1].axhline(0, color='black', lw=0.5)
axes[1].set_title("GELU - ReLU\n(GELU allows small negative outputs)", fontsize=11)
axes[1].set_xlabel("Input x")
axes[1].set_ylabel("GELU(x) - ReLU(x)")
axes[1].grid(True, alpha=0.3)

# The gradient (GELU is smooth, ReLU has a kink at 0)
x_grad = x_test.clone().requires_grad_(True)
gelu_out_grad = gelu(x_grad)
gelu_out_grad.sum().backward()
gelu_gradient = x_grad.grad.numpy()

x_relu_grad = x_test.clone().requires_grad_(True)
relu_out_grad = torch.relu(x_relu_grad)
relu_out_grad.sum().backward()
relu_gradient = x_relu_grad.grad.numpy()

axes[2].plot(x_test.numpy(), relu_gradient, color='tomato',    lw=2.5, label='ReLU gradient')
axes[2].plot(x_test.numpy(), gelu_gradient, color='steelblue', lw=2.5, label='GELU gradient')
axes[2].set_title("Gradients\n(GELU: smooth everywhere; ReLU: kink at 0)", fontsize=11)
axes[2].set_xlabel("Input x")
axes[2].set_ylabel("df/dx")
axes[2].legend(); axes[2].grid(True, alpha=0.3)

plt.suptitle("GELU vs ReLU Activation Function", fontsize=12)
plt.tight_layout()
plt.savefig("05a_activations.png", dpi=130)
print("Saved: 05a_activations.png")
print()
print("Key difference: GELU gradient is non-zero for negative inputs.")
print("ReLU gradient is exactly 0 for all x < 0 ('dead ReLU' problem).")
```

```python
# -------------------------------------------------------
# FEED-FORWARD NETWORK
#
# Plain English:
#   1. Expand from d_model to 4×d_model (first linear layer)
#   2. Apply GELU (non-linearity — makes the network powerful)
#   3. Contract from 4×d_model back to d_model (second linear layer)
#
# Applied independently at each token position.
# Same weights used at every position.
# -------------------------------------------------------

class FeedForward(nn.Module):
    """
    Position-wise feed-forward network.
    
    Two linear layers with GELU activation between them.
    Applied identically and independently to each token position.
    
    The 4× expansion gives the network internal space to compute
    complex functions before compressing back to d_model.
    """
    
    def __init__(self, d_model, dropout=0.1):
        super().__init__()
        
        # Hidden dimension: 4 times the model dimension
        # This ratio comes from the original 2017 transformer paper
        # and has become a standard choice
        d_ff = 4 * d_model
        
        # First linear: expand d_model → d_ff
        self.linear1 = nn.Linear(d_model, d_ff)
        
        # Second linear: contract d_ff → d_model
        self.linear2 = nn.Linear(d_ff, d_model)
        
        # Dropout for regularization
        self.dropout = nn.Dropout(dropout)
        
        # Initialize weights
        nn.init.normal_(self.linear1.weight, std=0.02)
        nn.init.normal_(self.linear2.weight, std=0.02)
        nn.init.zeros_(self.linear1.bias)
        nn.init.zeros_(self.linear2.bias)
    
    def forward(self, x):
        """
        x: [batch, seq_len, d_model]
        returns: [batch, seq_len, d_model]  — same shape
        
        Applied independently at each position:
        for each token t:
            x[b, t, :] → linear1 → GELU → dropout → linear2 → output[b, t, :]
        """
        # Step 1: expand to hidden dimension
        # [batch, seq, d_model] → [batch, seq, d_ff]
        h = self.linear1(x)
        
        # Step 2: apply GELU activation
        # The non-linearity is what makes two linear layers more powerful than one
        # Without this, linear1 followed by linear2 would just be one linear layer
        # (a composition of linear functions is linear)
        h = gelu(h)
        
        # Step 3: dropout for regularization
        h = self.dropout(h)
        
        # Step 4: contract back to model dimension
        # [batch, seq, d_ff] → [batch, seq, d_model]
        output = self.linear2(h)
        
        return output


# Test the FFN
torch.manual_seed(42)
d_model = 64
ff = FeedForward(d_model)
x  = torch.randn(2, 8, d_model)   # batch=2, seq=8
y  = ff(x)

print("\n=== FEED-FORWARD NETWORK TEST ===")
print(f"Input:   {x.shape}    (batch=2, seq=8, d_model={d_model})")
print(f"Output:  {y.shape}    (same shape — FFN is shape-preserving)")
print()

n_params = sum(p.numel() for p in ff.parameters())
print(f"Parameters:")
print(f"  linear1: weight {ff.linear1.weight.shape} + bias {ff.linear1.bias.shape}")
print(f"           = {ff.linear1.weight.numel() + ff.linear1.bias.numel():,} params")
print(f"  linear2: weight {ff.linear2.weight.shape} + bias {ff.linear2.bias.shape}")
print(f"           = {ff.linear2.weight.numel() + ff.linear2.bias.numel():,} params")
print(f"  Total:   {n_params:,}")
```

```python
# -------------------------------------------------------
# VERIFY FFN PROCESSES EACH POSITION INDEPENDENTLY
#
# This is a key property: the FFN at position 5 does not
# "know about" position 3. They use the same weights but
# operate independently.
#
# We verify this by processing tokens separately vs together.
# -------------------------------------------------------

ff.eval()   # disable dropout for deterministic test

# Two individual token vectors
token_a = torch.randn(1, 1, d_model)   # [1, 1, 64]
token_b = torch.randn(1, 1, d_model)   # [1, 1, 64]

# Process them individually
out_a = ff(token_a)
out_b = ff(token_b)

# Process them together in one sequence
both_together = torch.cat([token_a, token_b], dim=1)  # [1, 2, 64]
out_together  = ff(both_together)

# Split the combined output
out_a_from_together = out_together[:, 0:1, :]   # first position
out_b_from_together = out_together[:, 1:2, :]   # second position

# They must be identical — FFN is position-independent
match_a = torch.allclose(out_a, out_a_from_together, atol=1e-6)
match_b = torch.allclose(out_b, out_b_from_together, atol=1e-6)

print("\n=== FFN POSITION INDEPENDENCE TEST ===")
print(f"Token A: processed alone vs. in a sequence: {match_a}")
print(f"Token B: processed alone vs. in a sequence: {match_b}")
print()
print("This confirms: FFN processes each position independently.")
print("The same weights are applied at every position, but there is no")
print("cross-position interaction (that is attention's job).")
```

```python
# -------------------------------------------------------
# LAYER NORMALIZATION — BUILT FROM SCRATCH
#
# Plain English:
#   1. Compute mean of the vector
#   2. Compute standard deviation
#   3. Normalize: subtract mean, divide by std
#   4. Apply learned scale (gamma) and shift (beta)
#
# Applied to the last dimension (the feature dimension, d_model).
# Each token's vector is normalized independently.
# -------------------------------------------------------

class LayerNorm(nn.Module):
    """
    Layer normalization.
    
    For each token vector x ∈ ℝ^d_model:
    1. Compute mean μ and variance σ² across the d_model dimension
    2. Normalize: x̂ = (x - μ) / √(σ² + ε)
    3. Scale and shift: output = γ × x̂ + β
    
    γ (gamma) and β (beta) are learned parameters.
    They start at 1 and 0 (identity), then adapt during training.
    """
    
    def __init__(self, d_model, eps=1e-5):
        super().__init__()
        
        # eps: small constant to prevent division by zero
        # 1e-5 is the standard value
        self.eps = eps
        
        # gamma: learned scale, shape [d_model]
        # Initialized to all ones (no scaling initially)
        self.gamma = nn.Parameter(torch.ones(d_model))
        
        # beta: learned shift, shape [d_model]
        # Initialized to all zeros (no shift initially)
        self.beta  = nn.Parameter(torch.zeros(d_model))
    
    def forward(self, x):
        """
        x: [..., d_model]  — any number of leading dimensions
        returns: same shape as x
        
        The normalization is computed over the LAST dimension (d_model).
        This means: for each token position, normalize its feature vector.
        """
        # Step 1: compute mean over the last dimension (features, not positions)
        # keepdim=True: keep the dimension for broadcasting in later steps
        # dim=-1: the last dimension (d_model)
        mean = x.mean(dim=-1, keepdim=True)
        # mean shape: [..., 1]
        
        # Step 2: compute variance over the last dimension
        # unbiased=False: divide by N, not N-1
        # We use biased variance to match the definition
        var = x.var(dim=-1, keepdim=True, unbiased=False)
        # var shape: [..., 1]
        
        # Step 3: normalize
        # Subtract mean, divide by standard deviation
        # Add eps to variance before sqrt to prevent division by zero
        x_normalized = (x - mean) / torch.sqrt(var + self.eps)
        # x_normalized shape: same as x
        # After this: each token vector has mean≈0 and std≈1
        
        # Step 4: apply learned scale and shift
        # gamma and beta are [d_model], they broadcast over batch and seq dims
        output = self.gamma * x_normalized + self.beta
        
        return output


# Test LayerNorm
d_model = 8
ln = LayerNorm(d_model)

# Input with non-zero mean and non-unit variance
x_ln = torch.tensor([[5.0, 2.0, 8.0, 1.0, 4.0, 9.0, 3.0, 7.0]])   # [1, 8]

output_ln = ln(x_ln)

print("\n=== LAYER NORM TEST ===")
print(f"Input:  {x_ln[0].tolist()}")
print(f"  mean: {x_ln.mean(dim=-1).item():.4f}")
print(f"  std:  {x_ln.std(dim=-1).item():.4f}")
print()
print(f"Output: {output_ln.detach()[0].tolist()}")
print(f"  mean: {output_ln.mean(dim=-1).item():.6f}  (≈ 0)")
print(f"  std:  {output_ln.std(dim=-1).item():.6f}   (≈ 1)")
print()
print("After layer norm, each vector has approximately mean=0, std=1.")
print("The learned gamma and beta can adjust this during training.")
```

```python
# -------------------------------------------------------
# VISUALIZE WHY LAYER NORM HELPS TRAINING STABILITY
# -------------------------------------------------------

# Simulate what happens to activations over 20 layers without vs with LayerNorm

torch.manual_seed(42)
d = 64
n_sim_layers = 20

# Random linear layer (same for both — simulating one kind of transformation)
sim_layer = nn.Linear(d, d)
ln_sim    = LayerNorm(d)

# Start with the same input
x_no_ln   = torch.randn(100, d)  # 100 "samples"
x_with_ln = x_no_ln.clone()

means_no, stds_no   = [x_no_ln.mean().item()], [x_no_ln.std().item()]
means_yes, stds_yes = [x_with_ln.mean().item()], [x_with_ln.std().item()]

with torch.no_grad():
    for layer_num in range(n_sim_layers):
        # Without LayerNorm: apply linear + tanh activation
        x_no_ln   = torch.tanh(sim_layer(x_no_ln))
        means_no.append(x_no_ln.mean().item())
        stds_no.append(x_no_ln.std().item())
        
        # With LayerNorm: normalize before linear + tanh
        x_with_ln = torch.tanh(sim_layer(ln_sim(x_with_ln)))
        means_yes.append(x_with_ln.mean().item())
        stds_yes.append(x_with_ln.std().item())

fig, axes = plt.subplots(1, 2, figsize=(12, 4.5))

layer_nums = range(n_sim_layers + 1)

axes[0].plot(layer_nums, means_no,  color='tomato',    lw=2, label='No LayerNorm')
axes[0].plot(layer_nums, means_yes, color='steelblue', lw=2, label='With LayerNorm')
axes[0].axhline(0, color='gray', linestyle='--', alpha=0.5, label='Target: 0')
axes[0].set_xlabel("Layer Number")
axes[0].set_ylabel("Mean of Activations")
axes[0].set_title("Mean Drift Without LayerNorm\n(Training becomes unstable)")
axes[0].legend(); axes[0].grid(True, alpha=0.3)

axes[1].plot(layer_nums, stds_no,  color='tomato',    lw=2, label='No LayerNorm')
axes[1].plot(layer_nums, stds_yes, color='steelblue', lw=2, label='With LayerNorm')
axes[1].axhline(1, color='gray', linestyle='--', alpha=0.5, label='Target: 1')
axes[1].set_xlabel("Layer Number")
axes[1].set_ylabel("Std of Activations")
axes[1].set_title("Std Drift Without LayerNorm\n(Gradients vanish or explode)")
axes[1].legend(); axes[1].grid(True, alpha=0.3)

plt.suptitle("Layer Normalization Keeps Activations Stable Across Layers", fontsize=12)
plt.tight_layout()
plt.savefig("05b_layernorm_stability.png", dpi=130)
print("Saved: 05b_layernorm_stability.png")
print()
print("Without LayerNorm: activations drift, training is unstable.")
print("With LayerNorm: activations stay near mean=0, std=1 throughout.")
```

```python
# -------------------------------------------------------
# DEMONSTRATE RESIDUAL CONNECTIONS AND VANISHING GRADIENTS
# -------------------------------------------------------

print("\n=== RESIDUAL CONNECTIONS: GRADIENT FLOW TEST ===")
print()

# Build deep networks with and without residuals
# and measure how gradients flow back to the input

class LayerNoResidual(nn.Module):
    def __init__(self, d):
        super().__init__()
        self.ln = LayerNorm(d)
        self.ff = nn.Linear(d, d)
    def forward(self, x):
        # No residual: output REPLACES input
        return gelu(self.ff(self.ln(x)))

class LayerWithResidual(nn.Module):
    def __init__(self, d):
        super().__init__()
        self.ln = LayerNorm(d)
        self.ff = nn.Linear(d, d)
    def forward(self, x):
        # Residual: output ADDS TO input
        # x = x + f(x)
        # Gradient: ∂/∂x [x + f(x)] = 1 + ∂f/∂x  (never < 1)
        return x + gelu(self.ff(self.ln(x)))

d = 64
for n_layers_test in [4, 8, 16, 32]:
    # Build stacks
    stack_no  = nn.Sequential(*[LayerNoResidual(d)   for _ in range(n_layers_test)])
    stack_yes = nn.Sequential(*[LayerWithResidual(d) for _ in range(n_layers_test)])
    
    # Measure gradient magnitude at input
    x_test = torch.randn(1, d, requires_grad=True)
    
    loss_no = stack_no(x_test).sum()
    loss_no.backward()
    grad_norm_no = x_test.grad.norm().item()
    x_test.grad = None
    
    loss_yes = stack_yes(x_test).sum()
    loss_yes.backward()
    grad_norm_yes = x_test.grad.norm().item()
    x_test.grad = None
    
    vanish_warning = "← VANISHED!" if grad_norm_no < 0.001 else ""
    print(f"  {n_layers_test:2d} layers:  "
          f"No residual: {grad_norm_no:.6f}  {vanish_warning}")
    print(f"           With residual: {grad_norm_yes:.6f}")
    print()

print("Residual connections prevent gradients from vanishing in deep networks.")
print("This is what makes 12, 24, 96+ layer transformers trainable.")
```

```python
# -------------------------------------------------------
# THE COMPLETE TRANSFORMER BLOCK
#
# Now we assemble everything:
#   1. Pre-LayerNorm
#   2. Multi-Head Attention
#   3. Residual connection (add back to x)
#   4. Pre-LayerNorm
#   5. Feed-Forward Network
#   6. Residual connection (add back to x)
#
# The residuals mean x is never destroyed — only enhanced.
# Each block adds to the representation, building up understanding.
# -------------------------------------------------------

class TransformerBlock(nn.Module):
    """
    One transformer block (GPT-style, decoder-only).
    
    Architecture (pre-norm with residuals):
        x = x + Attention(LayerNorm(x))    ← communication step
        x = x + FFN(LayerNorm(x))          ← computation step
    
    The LayerNorm before each sublayer stabilizes training.
    The residual (x = x + ...) prevents vanishing gradients.
    """
    
    def __init__(self, d_model, n_heads, dropout=0.1):
        super().__init__()
        
        # LayerNorm before attention (pre-norm style)
        self.ln1  = LayerNorm(d_model)
        
        # Multi-head attention
        self.attn = MultiHeadAttention(d_model, n_heads, dropout)
        
        # LayerNorm before FFN
        self.ln2  = LayerNorm(d_model)
        
        # Feed-forward network
        self.ff   = FeedForward(d_model, dropout)
    
    def forward(self, x, mask=None):
        """
        x:    [batch, seq_len, d_model]
        mask: [seq_len, seq_len]  — causal mask
        
        Returns: [batch, seq_len, d_model]  — same shape
        
        Step by step:
        1. LayerNorm(x): normalize for stable attention input
        2. Attention(normalized): gather information from other tokens
        3. x = x + attention_output: add back (residual)
        4. LayerNorm(x): normalize for stable FFN input
        5. FFN(normalized): process each token independently
        6. x = x + ffn_output: add back (residual)
        """
        # Attention sublayer with pre-norm and residual
        normed_x         = self.ln1(x)
        attn_output, _   = self.attn(normed_x, mask)
        x                = x + attn_output   # residual: ADD, don't replace
        
        # Feed-forward sublayer with pre-norm and residual
        normed_x         = self.ln2(x)
        ff_output        = self.ff(normed_x)
        x                = x + ff_output     # residual again
        
        return x


# Test the full transformer block
torch.manual_seed(42)
d_model = 64
n_heads = 4
block   = TransformerBlock(d_model, n_heads)

x    = torch.randn(2, 10, d_model)   # batch=2, seq=10
mask = make_causal_mask(10)

y = block(x, mask)

print("\n=== TRANSFORMER BLOCK TEST ===")
print(f"Input:  {x.shape}   (batch=2, seq=10, d_model={d_model})")
print(f"Output: {y.shape}   (same shape — each layer is shape-preserving)")
print()

n_params = sum(p.numel() for p in block.parameters())
print(f"Parameters in one transformer block:")
print(f"  LayerNorm 1:   {sum(p.numel() for p in block.ln1.parameters()):,}")
print(f"  Attention:     {sum(p.numel() for p in block.attn.parameters()):,}")
print(f"  LayerNorm 2:   {sum(p.numel() for p in block.ln2.parameters()):,}")
print(f"  Feed-forward:  {sum(p.numel() for p in block.ff.parameters()):,}")
print(f"  TOTAL:         {n_params:,}")
print()
print(f"A 4-layer model has {4 * n_params:,} parameters in transformer blocks")
print(f"Plus embedding parameters.")
```

```python
# -------------------------------------------------------
# TRACE THE INFORMATION FLOW THROUGH THE BLOCK
#
# Let's trace the shapes and values step by step
# to see exactly what happens inside the block.
# -------------------------------------------------------

block.eval()

x_trace = torch.randn(1, 4, d_model)   # batch=1, seq=4
mask_trace = make_causal_mask(4)

print("\n=== INFORMATION FLOW TRACE ===")
print(f"Starting shape: {x_trace.shape}")
print()

with torch.no_grad():
    # Step 1: LayerNorm before attention
    after_ln1 = block.ln1(x_trace)
    print(f"After LayerNorm 1: {after_ln1.shape}")
    print(f"  Input mean:  {x_trace.mean().item():.4f}  std: {x_trace.std().item():.4f}")
    print(f"  Output mean: {after_ln1.mean().item():.6f}  std: {after_ln1.std().item():.6f}")
    print(f"  (Normalized to ~mean=0, std=1)")
    print()
    
    # Step 2: Attention
    attn_out, attn_weights = block.attn(after_ln1, mask_trace)
    print(f"After Attention: {attn_out.shape}")
    print(f"  Attention weights shape: {attn_weights.shape}")
    print(f"  Each row of weights sums to: {attn_weights[0, 0].sum(dim=-1).tolist()}")
    print()
    
    # Step 3: Residual add
    x_after_attn = x_trace + attn_out
    print(f"After residual (x + attn): {x_after_attn.shape}")
    print(f"  Changed from input: {(x_after_attn - x_trace).abs().mean().item():.6f} avg change per dim")
    print()
    
    # Step 4: LayerNorm before FFN
    after_ln2 = block.ln2(x_after_attn)
    print(f"After LayerNorm 2: {after_ln2.shape}")
    print()
    
    # Step 5: FFN
    ff_out = block.ff(after_ln2)
    print(f"After FFN: {ff_out.shape}")
    print()
    
    # Step 6: Final residual
    x_final = x_after_attn + ff_out
    print(f"After final residual: {x_final.shape}")
    print(f"  Total change from input: {(x_final - x_trace).abs().mean().item():.6f} avg change per dim")
    print()

print("The transformer block has transformed the representations")
print("while preserving the shape and using residuals throughout.")
```

---

## ✅ Check Your Understanding

1. The FFN uses GELU between two linear layers.
   Remove GELU and replace with nothing (just two linear layers in sequence).
   This is equivalent to one linear layer. Why?
   (Hint: if A and B are matrices, what is A × (B × x)?)

2. LayerNorm normalizes across the feature dimension (d_model).
   If a token vector has all identical values [5, 5, 5, 5, 5],
   what is the variance? What happens when you try to normalize it?
   What does the epsilon prevent?

3. The residual connection: x = x + f(x).
   Write out the gradient ∂/∂x[x + f(x)].
   Why is this always ≥ 1 for the identity part?
   How does this prevent vanishing gradients?

4. Pre-norm (normalize before attention) vs post-norm (normalize after).
   In post-norm: `x = LayerNorm(x + Attention(x))`.
   The residual stream x gets normalized at every layer.
   In pre-norm: `x = x + Attention(LayerNorm(x))`.
   The residual stream x is NEVER normalized directly.
   Why might this be better for gradient flow?

5. One transformer block has two residual additions.
   After the first (attention), x has been updated once.
   After the second (FFN), x has been updated twice.
   In a 4-layer model, how many times total is x updated?
   (Counting each residual addition as one update.)

---

## 🧪 Experiments

**Experiment 1: FFN expansion ratio**
Build FeedForward with d_ff = 1×, 2×, 4×, 8× d_model.
Count the parameters for each. Plot parameters vs expansion ratio.
The 4× standard gives how many parameters?

**Experiment 2: LayerNorm with extreme inputs**
Create a vector that is all zeros. Run it through LayerNorm.
What happens? (Variance is zero — check what the epsilon prevents.)
Create a vector with all identical non-zero values [5, 5, 5, 5, 5].
What is the output? (Still zero variance — it normalizes to all zeros.)

**Experiment 3: Residual norm growth**
Run a random input through 20 transformer blocks.
After each block, compute the norm of x.
With residuals: does the norm grow, shrink, or stay roughly constant?
Without residuals (replace x = x + f(x) with x = f(x)):
What happens to the norm?

**Experiment 4: Gradient verification**
Create a single transformer block.
Run a forward pass. Compute a simple loss (sum of outputs).
Run loss.backward().
Print the gradient norm for each parameter:
  - LayerNorm gamma and beta
  - Attention W_Q, W_K, W_V, W_O
  - FFN linear1 and linear2 weights
Do all parameters get gradients? Are any zero?

**Experiment 5: Verify the block is deterministic**
Run the same input through the block twice (with model.eval()).
Are the outputs identical?
Now run with model.train() twice.
Are they identical? Why not?
(Hint: what does dropout do during training?)

---

> Move to Module 06 when all experiments are done.
> We build the complete GPT model: stack the blocks,
> add the output head, and implement text generation.
