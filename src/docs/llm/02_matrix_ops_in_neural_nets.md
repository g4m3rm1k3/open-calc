# Module 02 — Matrix Operations in Neural Networks

> **The big idea:** A neural network layer is just a matrix multiplication followed by a nonlinearity. Every "neuron", every "weight", every "parameter" — it's all matrices.

---

## 2.1 A Single Neuron = A Dot Product

A single neuron takes an input vector **x** ∈ ℝⁿ, computes a weighted sum, and applies an activation:

```
output = f(w · x + b)
```

Where **w** ∈ ℝⁿ is a weight vector and b is a scalar bias. This is just a **dot product**.

```python
import torch
import torch.nn as nn
import matplotlib.pyplot as plt

# One neuron
x = torch.tensor([1.0, 2.0, 3.0])   # input: 3 features
w = torch.tensor([0.5, -1.0, 0.3])  # weights
b = torch.tensor(0.1)               # bias

pre_activation = torch.dot(w, x) + b
output = torch.relu(pre_activation)  # ReLU activation: max(0, x)

print(f"Dot product: {torch.dot(w, x):.3f}")
print(f"Pre-activation: {pre_activation:.3f}")
print(f"After ReLU: {output:.3f}")
```

---

## 2.2 A Layer = A Matrix Multiplication

Instead of one neuron, we have **many neurons in parallel**. Each has its own weight vector. Stack them as rows of a matrix W ∈ ℝ^(m×n):

```
y = f(W x + b)
```

Where x ∈ ℝⁿ → y ∈ ℝᵐ. This transforms an n-dimensional input to an m-dimensional output.

```python
# A linear layer: 3 inputs → 5 outputs
n_in  = 3
n_out = 5

W = torch.randn(n_out, n_in)   # weight matrix: [5, 3]
b = torch.randn(n_out)          # bias vector:   [5]
x = torch.randn(n_in)           # input:         [3]

# Forward pass
y = W @ x + b   # matrix-vector multiply → [5]
y_activated = torch.relu(y)

print(f"W shape: {W.shape}")
print(f"x shape: {x.shape}")
print(f"y shape: {y.shape}")   # [5]
```

**This is all nn.Linear does:**

```python
layer = nn.Linear(in_features=3, out_features=5)
# layer.weight has shape [5, 3]
# layer.bias   has shape [5]

x = torch.randn(3)
y = layer(x)
print(f"nn.Linear output shape: {y.shape}")   # [5]
```

---

## 2.3 Batching = Adding a Batch Dimension

In practice we process many inputs at once (a "batch"). This turns matrix-vector into **matrix-matrix** multiplication:

```
Y = f(X W^T + b)
```

Where X ∈ ℝ^(B×n), W ∈ ℝ^(m×n), Y ∈ ℝ^(B×m)

```python
B = 32    # batch size
n_in  = 64
n_out = 128

X = torch.randn(B, n_in)          # [32, 64]
W = torch.randn(n_out, n_in)      # [128, 64]
b = torch.randn(n_out)            # [128]

# Y = X @ W.T + b  (PyTorch broadcasts b across the batch)
Y = X @ W.T + b
print(f"X:  {X.shape}")   # [32, 64]
print(f"W:  {W.shape}")   # [128, 64]
print(f"Y:  {Y.shape}")   # [32, 128]

# Same thing with nn.Linear (handles transpose automatically):
layer = nn.Linear(n_in, n_out)
Y2 = layer(X)
print(f"nn.Linear(X): {Y2.shape}")   # [32, 128]
```

---

## 2.4 Activation Functions — The Nonlinearity

Without an activation function, stacking linear layers does nothing useful — a composition of linear functions is just another linear function. We need **nonlinearity** to learn complex patterns.

```python
x = torch.linspace(-3, 3, 200)

activations = {
    "ReLU":    torch.relu(x),
    "GELU":    nn.functional.gelu(x),    # used in modern LLMs (GPT, BERT)
    "Sigmoid": torch.sigmoid(x),
    "Tanh":    torch.tanh(x),
}

fig, axes = plt.subplots(1, 4, figsize=(14, 3))
for ax, (name, y) in zip(axes, activations.items()):
    ax.plot(x.numpy(), y.detach().numpy(), lw=2.5, color='steelblue')
    ax.axhline(0, color='gray', lw=0.5)
    ax.axvline(0, color='gray', lw=0.5)
    ax.set_title(name, fontsize=13)
    ax.grid(True, alpha=0.3)

plt.suptitle("Activation Functions", fontsize=14)
plt.tight_layout()
plt.savefig("activations.png", dpi=120)
plt.show()
```

**Modern LLMs use GELU** (Gaussian Error Linear Unit). It's smoother than ReLU and empirically works better.

---

## 2.5 Stacking Layers = Composing Matrix Transforms

A deep neural network is just layers of (Wx + b) with activations in between:

```
h₁ = f(W₁ x  + b₁)
h₂ = f(W₂ h₁ + b₂)
y  = W₃ h₂ + b₃
```

Each Wᵢ projects into a new vector space. The network *learns* what transformations are useful.

```python
class MLP(nn.Module):
    """A simple multi-layer perceptron (the building block inside transformers)."""
    def __init__(self, d_in, d_hidden, d_out):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(d_in, d_hidden),
            nn.GELU(),
            nn.Linear(d_hidden, d_out),
        )
    
    def forward(self, x):
        return self.net(x)

mlp = MLP(d_in=32, d_hidden=128, d_out=32)

x = torch.randn(16, 32)   # batch=16, features=32
y = mlp(x)
print(f"MLP: {x.shape} → {y.shape}")   # [16, 32] → [16, 32]

# Count parameters
n_params = sum(p.numel() for p in mlp.parameters())
print(f"Total parameters: {n_params:,}")
```

---

## 2.6 The Transformer's Feed-Forward Block

Inside every transformer layer there's an MLP. Specifically, the **feed-forward network (FFN)**:

```
FFN(x) = GELU(x W₁ + b₁) W₂ + b₂
```

The hidden dimension is typically **4× larger** than the model dimension (this is a heuristic from the original paper):

```python
class FeedForward(nn.Module):
    """The FFN block inside a transformer layer."""
    def __init__(self, d_model):
        super().__init__()
        d_ff = 4 * d_model                      # classic 4x expansion
        self.w1 = nn.Linear(d_model, d_ff)
        self.w2 = nn.Linear(d_ff, d_model)
        self.act = nn.GELU()
    
    def forward(self, x):
        return self.w2(self.act(self.w1(x)))    # expand → activate → contract

ff = FeedForward(d_model=256)
x  = torch.randn(4, 10, 256)   # batch=4, seq_len=10, d_model=256
y  = ff(x)
print(f"FFN: {x.shape} → {y.shape}")   # shape preserved: [4, 10, 256]

n_params = sum(p.numel() for p in ff.parameters())
print(f"FFN parameters: {n_params:,}")
```

Note: FFN operates **independently on each token** (same weights, applied position-by-position). The attention mechanism (next module) is what lets tokens talk to each other.

---

## 2.7 Layer Normalization

Modern LLMs normalize the vectors at each layer to keep training stable. **Layer Norm** normalizes across the feature dimension:

```
LayerNorm(x) = γ · (x - μ)/σ + β
```

Where μ and σ are computed per-sample (not per-batch like BatchNorm), and γ, β are learned.

```python
# Manual LayerNorm to see what's happening
def layer_norm_manual(x, gamma, beta, eps=1e-5):
    # x: [batch, seq, d_model]
    mu    = x.mean(dim=-1, keepdim=True)
    sigma = x.std(dim=-1, keepdim=True)
    x_hat = (x - mu) / (sigma + eps)
    return gamma * x_hat + beta

d_model = 64
x     = torch.randn(2, 10, d_model)
gamma = torch.ones(d_model)    # learned scale (initialized to 1)
beta  = torch.zeros(d_model)   # learned shift (initialized to 0)

y_manual = layer_norm_manual(x, gamma, beta)
y_torch  = nn.LayerNorm(d_model)(x)

print(f"Manual LN mean: {y_manual.mean().item():.6f}")     # ≈ 0
print(f"Manual LN std:  {y_manual.std().item():.6f}")      # ≈ 1
print(f"Match PyTorch:  {torch.allclose(y_manual, y_torch, atol=1e-5)}")
```

---

## 2.8 Counting Parameters

Understanding how many parameters a model has helps you reason about its capacity and memory:

```python
def count_params(model):
    total     = sum(p.numel() for p in model.parameters())
    trainable = sum(p.numel() for p in model.parameters() if p.requires_grad)
    print(f"Total parameters:     {total:>12,}")
    print(f"Trainable parameters: {trainable:>12,}")
    return total

# Let's estimate GPT-2 small (117M params)
d_model   = 768
n_heads   = 12
n_layers  = 12
vocab_size = 50_257
seq_len   = 1_024

params_per_layer = (
    3 * d_model * d_model +   # Q, K, V projections
    d_model * d_model +        # output projection
    4 * d_model * d_model * 2  # FFN (expand + contract)
)

total_approx = (
    vocab_size * d_model +     # embedding matrix
    seq_len    * d_model +     # positional embeddings
    n_layers   * params_per_layer +
    vocab_size * d_model       # output (often shared with embedding)
)

print(f"Approximate GPT-2 small params: {total_approx:,}")
# Should be close to 117,000,000
```

---

## ✅ Module 02 Summary

| Operation | Shape | What it does |
|-----------|-------|--------------|
| `W @ x` | `[m,n] @ [n] → [m]` | Linear projection |
| `X @ W.T` | `[B,n] @ [n,m] → [B,m]` | Batched projection |
| `GELU(x)` | same shape | Nonlinearity |
| `LayerNorm(x)` | same shape | Normalize features |
| FFN block | `[B,T,d] → [B,T,d]` | Per-token transformation |

---

## 🧪 Experiments to Try

1. Remove the GELU from the MLP. Does it still work? (Train a tiny classifier and compare.)
2. Make a `FeedForward` with 8× expansion instead of 4×. How many more parameters?
3. Compute the singular value decomposition (SVD) of a weight matrix. What do the singular values tell you about what the layer learned?

---

> **Next:** `03_backprop_and_gradients.md` — how the model actually learns by computing gradients through all these matrices →
