# Module 04 — The Attention Mechanism

> **The big idea:** Attention lets every token in a sequence look at every other token and decide "how much should I pay attention to you?" It's implemented entirely with matrix multiplications.

---

## 4.1 The Problem Attention Solves

After the embedding layer, each token is just a vector. The FFN (module 02) processes each token *independently* — it has no idea what the surrounding words are.

Attention is the mechanism that lets tokens **communicate**. When processing "bank", the model needs to look at the surrounding words to know if it means a riverbank or a financial institution.

---

## 4.2 Scaled Dot-Product Attention

The core formula:

```
Attention(Q, K, V) = softmax(Q K^T / √d_k) V
```

Three matrices:
- **Q** (Queries): "What am I looking for?"
- **K** (Keys):    "What do I contain?"
- **V** (Values):  "What do I communicate if selected?"

```python
import torch
import torch.nn as nn
import torch.nn.functional as F
import matplotlib.pyplot as plt
import math

def scaled_dot_product_attention(Q, K, V, mask=None):
    """
    Q: [batch, heads, seq_len, d_k]
    K: [batch, heads, seq_len, d_k]
    V: [batch, heads, seq_len, d_v]
    Returns: output [batch, heads, seq_len, d_v], weights [batch, heads, seq_len, seq_len]
    """
    d_k = Q.shape[-1]
    
    # Step 1: Compute similarity scores between all pairs of tokens
    # scores[i,j] = "how much should token i attend to token j?"
    scores = Q @ K.transpose(-2, -1) / math.sqrt(d_k)   # [B, H, T, T]
    
    # Step 2: Apply causal mask (tokens can't look into the future)
    if mask is not None:
        scores = scores.masked_fill(mask == 0, float('-inf'))
    
    # Step 3: Softmax → attention weights (rows sum to 1)
    weights = F.softmax(scores, dim=-1)   # [B, H, T, T]
    
    # Step 4: Weighted sum of Values
    output = weights @ V                   # [B, H, T, d_v]
    
    return output, weights

# Test with tiny example
torch.manual_seed(42)
B, T, d_k = 1, 5, 8   # batch=1, seq_len=5, key_dim=8

Q = torch.randn(B, 1, T, d_k)  # [1, 1, 5, 8]
K = torch.randn(B, 1, T, d_k)
V = torch.randn(B, 1, T, d_k)

out, weights = scaled_dot_product_attention(Q, K, V)

print(f"Q, K, V shapes: {Q.shape}")
print(f"Output shape:   {out.shape}")       # [1, 1, 5, 8]
print(f"Weights shape:  {weights.shape}")   # [1, 1, 5, 5] — attention matrix!
print(f"\nAttention weights (first head):\n{weights[0, 0].detach().numpy().round(3)}")
```

---

## 4.3 Visualizing the Attention Matrix

```python
# Each row is a token, each column is how much it attends to other tokens
fig, ax = plt.subplots(figsize=(5, 4))
im = ax.imshow(weights[0, 0].detach().numpy(), cmap='Blues', vmin=0, vmax=1)
plt.colorbar(im, ax=ax)
ax.set_xlabel("Key (token being attended to)")
ax.set_ylabel("Query (attending token)")
ax.set_title("Attention Weights\n(how much each token attends to each other)")

tokens = ["The", "cat", "sat", "on", "mat"]
ax.set_xticks(range(5)); ax.set_xticklabels(tokens, rotation=45)
ax.set_yticks(range(5)); ax.set_yticklabels(tokens)
plt.tight_layout()
plt.savefig("attention_weights.png", dpi=120)
plt.show()
```

---

## 4.4 Where Q, K, V Come From

Q, K, V are **linear projections** of the input token embeddings. Each token's embedding x gets projected three ways:

```
Q = x W_Q
K = x W_K
V = x W_V
```

Where W_Q, W_K, W_V ∈ ℝ^(d_model × d_k) are learned weight matrices.

```python
class SingleHeadAttention(nn.Module):
    def __init__(self, d_model, d_k):
        super().__init__()
        self.W_Q = nn.Linear(d_model, d_k, bias=False)
        self.W_K = nn.Linear(d_model, d_k, bias=False)
        self.W_V = nn.Linear(d_model, d_k, bias=False)
        self.W_O = nn.Linear(d_k, d_model, bias=False)   # output projection
        self.d_k = d_k
    
    def forward(self, x, mask=None):
        # x: [batch, seq_len, d_model]
        B, T, _ = x.shape
        
        Q = self.W_Q(x)   # [B, T, d_k]
        K = self.W_K(x)   # [B, T, d_k]
        V = self.W_V(x)   # [B, T, d_k]
        
        # Add head dimension for compatibility with our function
        Q = Q.unsqueeze(1)   # [B, 1, T, d_k]
        K = K.unsqueeze(1)
        V = V.unsqueeze(1)
        
        out, weights = scaled_dot_product_attention(Q, K, V, mask)
        out = out.squeeze(1)   # [B, T, d_k]
        out = self.W_O(out)    # [B, T, d_model] — project back
        
        return out, weights

attn = SingleHeadAttention(d_model=32, d_k=16)
x = torch.randn(2, 6, 32)   # batch=2, seq=6, d_model=32
out, w = attn(x)
print(f"Input:  {x.shape}")   # [2, 6, 32]
print(f"Output: {out.shape}") # [2, 6, 32] — same shape!
```

---

## 4.5 Multi-Head Attention

Instead of one set of Q,K,V projections, we use **multiple** ("heads"), each learning to attend to different kinds of relationships:

- One head might track grammar (subject-verb)
- Another tracks coreference ("it" → what noun)
- Another tracks long-range dependencies

```
MultiHead(Q, K, V) = Concat(head₁, ..., headₕ) W_O

where headᵢ = Attention(Q Wᵢ_Q, K Wᵢ_K, V Wᵢ_V)
```

```python
class MultiHeadAttention(nn.Module):
    def __init__(self, d_model, n_heads):
        super().__init__()
        assert d_model % n_heads == 0
        self.n_heads = n_heads
        self.d_k     = d_model // n_heads   # each head has smaller dimension
        
        # Combined projections for all heads at once (efficient!)
        self.W_Q = nn.Linear(d_model, d_model, bias=False)
        self.W_K = nn.Linear(d_model, d_model, bias=False)
        self.W_V = nn.Linear(d_model, d_model, bias=False)
        self.W_O = nn.Linear(d_model, d_model, bias=False)
    
    def forward(self, x, mask=None):
        B, T, d_model = x.shape
        
        # Project and reshape into heads
        Q = self.W_Q(x).view(B, T, self.n_heads, self.d_k).transpose(1, 2)
        K = self.W_K(x).view(B, T, self.n_heads, self.d_k).transpose(1, 2)
        V = self.W_V(x).view(B, T, self.n_heads, self.d_k).transpose(1, 2)
        # Each: [B, n_heads, T, d_k]
        
        # Attention (all heads in parallel)
        out, weights = scaled_dot_product_attention(Q, K, V, mask)
        # out: [B, n_heads, T, d_k]
        
        # Concatenate heads
        out = out.transpose(1, 2).contiguous().view(B, T, d_model)
        # out: [B, T, d_model]
        
        out = self.W_O(out)   # final projection
        return out, weights

mha = MultiHeadAttention(d_model=64, n_heads=8)
x = torch.randn(2, 10, 64)
out, weights = mha(x)

print(f"Input:          {x.shape}")        # [2, 10, 64]
print(f"Output:         {out.shape}")      # [2, 10, 64]
print(f"Weights:        {weights.shape}")  # [2, 8, 10, 10] — 8 heads!
```

---

## 4.6 Causal Masking (GPT-style)

Language models are trained to predict the **next** token. So when processing position i, we should only be able to see positions 0...i-1 — not the future.

We implement this with a **causal mask** (also called autoregressive mask):

```python
def causal_mask(seq_len, device='cpu'):
    """Upper triangular matrix of -inf, zeros on/below diagonal."""
    # 1 = "allowed to attend", 0 = "blocked"
    mask = torch.tril(torch.ones(seq_len, seq_len, device=device))
    return mask   # [T, T]

T = 6
mask = causal_mask(T)
print("Causal mask (1=attend, 0=blocked):")
print(mask.numpy().astype(int))

# Visualize
fig, axes = plt.subplots(1, 2, figsize=(10, 4))

# Mask
axes[0].imshow(mask.numpy(), cmap='Blues', vmin=0, vmax=1)
axes[0].set_title("Causal Mask")
for i in range(T):
    for j in range(T):
        axes[0].text(j, i, int(mask[i,j].item()), ha='center', va='center', fontsize=11)

# Attention weights with masking
Q = torch.randn(1, 1, T, 8)
K = torch.randn(1, 1, T, 8)
V = torch.randn(1, 1, T, 8)
_, w_masked = scaled_dot_product_attention(Q, K, V, mask=mask)

axes[1].imshow(w_masked[0, 0].detach().numpy(), cmap='Blues', vmin=0)
axes[1].set_title("Masked Attention Weights")
plt.suptitle("Causal Masking: tokens only attend to past tokens")
plt.tight_layout()
plt.savefig("causal_mask.png", dpi=120)
plt.show()
```

---

## 4.7 Efficient Attention with Flash Attention (Conceptual)

The naive attention computation stores the full T×T attention matrix in memory. For long sequences this is O(T²) memory — expensive!

**Flash Attention** (and similar) recomputes attention in tiles without materializing the full matrix. PyTorch has this built in:

```python
# PyTorch's optimized attention (uses Flash Attention when available)
# This is what real models use
from torch.nn.functional import scaled_dot_product_attention as sdpa

B, H, T, d_k = 2, 8, 512, 64
Q = torch.randn(B, H, T, d_k)
K = torch.randn(B, H, T, d_k)
V = torch.randn(B, H, T, d_k)

# is_causal=True applies causal mask automatically
out = sdpa(Q, K, V, is_causal=True)
print(f"Flash-style attention output: {out.shape}")   # [2, 8, 512, 64]
```

---

## 4.8 The Attention Pattern — What Does the Model Actually Attend To?

Let's visualize what real attention looks like (using a pretrained model):

```python
# If you have transformers installed:
# pip install transformers

try:
    from transformers import GPT2Model, GPT2Tokenizer
    import numpy as np
    
    tokenizer = GPT2Tokenizer.from_pretrained("gpt2")
    model     = GPT2Model.from_pretrained("gpt2", output_attentions=True)
    model.eval()
    
    text   = "The cat sat on the mat"
    tokens = tokenizer(text, return_tensors="pt")
    
    with torch.no_grad():
        outputs = model(**tokens)
    
    # outputs.attentions: tuple of [batch, n_heads, seq, seq] per layer
    layer_0_attn = outputs.attentions[0][0]   # [12, seq_len, seq_len]
    
    token_labels = tokenizer.convert_ids_to_tokens(tokens["input_ids"][0])
    
    fig, axes = plt.subplots(3, 4, figsize=(14, 9))
    axes = axes.flatten()
    
    for head_i, ax in enumerate(axes):
        im = ax.imshow(layer_0_attn[head_i].numpy(), cmap='Blues', vmin=0)
        ax.set_title(f"Head {head_i}", fontsize=9)
        ax.set_xticks(range(len(token_labels)))
        ax.set_xticklabels(token_labels, rotation=45, fontsize=7)
        ax.set_yticks(range(len(token_labels)))
        ax.set_yticklabels(token_labels, fontsize=7)
    
    plt.suptitle("GPT-2 Layer 0: All 12 Attention Heads", fontsize=13)
    plt.tight_layout()
    plt.savefig("gpt2_attention_heads.png", dpi=120)
    plt.show()
    
    print("Each head specializes in different relationships!")

except ImportError:
    print("Run: pip install transformers")
    print("Then re-run this cell to see real GPT-2 attention patterns.")
```

---

## ✅ Module 04 Summary

| Component | Formula | Shape |
|-----------|---------|-------|
| Query | `Q = x W_Q` | `[B, T, d_k]` |
| Key | `K = x W_K` | `[B, T, d_k]` |
| Value | `V = x W_V` | `[B, T, d_v]` |
| Scores | `Q K^T / √d_k` | `[B, T, T]` |
| Weights | `softmax(scores)` | `[B, T, T]` |
| Output | `weights @ V` | `[B, T, d_v]` |
| Multi-head | h parallel heads + concat | `[B, T, d_model]` |

The **attention matrix** `[T, T]` is the key artifact — it says "how much does token i care about token j?"

---

## 🧪 Experiments to Try

1. What happens to attention if all Q, K are identical? What do the weights look like?
2. Remove the `/ sqrt(d_k)` scaling. What happens to the softmax? (Hint: try large d_k)
3. Run the GPT-2 visualization. Can you identify which head does what? (Look for diagonal patterns = local attention, or specific word positions)

---

> **Next:** `05_transformer_architecture.md` — assemble everything into a full transformer block →
