# Module 05 — The Transformer Architecture

> **The big idea:** A transformer is a stack of identical blocks. Each block = attention + FFN, with layer norm and residual connections. Stack 12-96 of these and you have GPT.

---

## 5.1 The Transformer Block

One transformer block (decoder-style, like GPT):

```
x = x + Attention(LayerNorm(x))    ← residual + attention
x = x + FFN(LayerNorm(x))          ← residual + feed-forward
```

That's it. The whole block is ~30 lines of code.

```python
import torch
import torch.nn as nn
import torch.nn.functional as F
import math

# ---- Re-use from previous modules ----

def scaled_dot_product_attention(Q, K, V, mask=None):
    d_k = Q.shape[-1]
    scores = Q @ K.transpose(-2, -1) / math.sqrt(d_k)
    if mask is not None:
        scores = scores.masked_fill(mask == 0, float('-inf'))
    weights = F.softmax(scores, dim=-1)
    return weights @ V, weights

class MultiHeadAttention(nn.Module):
    def __init__(self, d_model, n_heads):
        super().__init__()
        assert d_model % n_heads == 0
        self.n_heads = n_heads
        self.d_k     = d_model // n_heads
        self.W_Q = nn.Linear(d_model, d_model, bias=False)
        self.W_K = nn.Linear(d_model, d_model, bias=False)
        self.W_V = nn.Linear(d_model, d_model, bias=False)
        self.W_O = nn.Linear(d_model, d_model, bias=False)
    
    def forward(self, x, mask=None):
        B, T, d = x.shape
        Q = self.W_Q(x).view(B, T, self.n_heads, self.d_k).transpose(1, 2)
        K = self.W_K(x).view(B, T, self.n_heads, self.d_k).transpose(1, 2)
        V = self.W_V(x).view(B, T, self.n_heads, self.d_k).transpose(1, 2)
        out, _ = scaled_dot_product_attention(Q, K, V, mask)
        out = out.transpose(1, 2).contiguous().view(B, T, d)
        return self.W_O(out)

class FeedForward(nn.Module):
    def __init__(self, d_model, dropout=0.1):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(d_model, 4 * d_model),
            nn.GELU(),
            nn.Linear(4 * d_model, d_model),
            nn.Dropout(dropout),
        )
    def forward(self, x):
        return self.net(x)

# ---- The Transformer Block ----

class TransformerBlock(nn.Module):
    """One layer of a GPT-style transformer."""
    def __init__(self, d_model, n_heads, dropout=0.1):
        super().__init__()
        self.attn = MultiHeadAttention(d_model, n_heads)
        self.ff   = FeedForward(d_model, dropout)
        self.ln1  = nn.LayerNorm(d_model)    # before attention
        self.ln2  = nn.LayerNorm(d_model)    # before FFN
        self.drop = nn.Dropout(dropout)
    
    def forward(self, x, mask=None):
        # Pre-norm + residual (modern style, used in GPT-2+)
        x = x + self.drop(self.attn(self.ln1(x), mask))  # attention sublayer
        x = x + self.drop(self.ff(self.ln2(x)))           # FFN sublayer
        return x

# Test
block = TransformerBlock(d_model=128, n_heads=8)
x     = torch.randn(4, 10, 128)   # batch=4, seq=10, d_model=128
y     = block(x)
print(f"TransformerBlock: {x.shape} → {y.shape}")   # shape preserved!
```

---

## 5.2 The Residual Stream

The `x = x + ...` pattern is called a **residual connection** (skip connection). It's critical for:

1. **Gradient flow**: gradients can flow directly back to early layers (no vanishing gradient)
2. **Preservation**: each block *adds* to the representation rather than replacing it
3. **Interpretability**: you can think of the residual stream as the "main channel" that blocks read from and write to

```python
# Demonstrate: without residuals, deep networks are hard to train
class DeepNetNoResidual(nn.Module):
    def __init__(self, d, n_layers):
        super().__init__()
        self.layers = nn.ModuleList([nn.Linear(d, d) for _ in range(n_layers)])
    
    def forward(self, x):
        for layer in self.layers:
            x = torch.tanh(layer(x))   # no residual
        return x

class DeepNetWithResidual(nn.Module):
    def __init__(self, d, n_layers):
        super().__init__()
        self.layers = nn.ModuleList([nn.Linear(d, d) for _ in range(n_layers)])
    
    def forward(self, x):
        for layer in self.layers:
            x = x + torch.tanh(layer(x))   # residual!
        return x

d = 64
for n_layers in [4, 16, 64]:
    net_no  = DeepNetNoResidual(d, n_layers)
    net_yes = DeepNetWithResidual(d, n_layers)
    
    x    = torch.randn(1, d, requires_grad=True)
    loss = net_no(x).sum()
    loss.backward()
    grad_no = x.grad.norm().item()
    x.grad = None
    
    loss = net_yes(x).sum()
    loss.backward()
    grad_yes = x.grad.norm().item()
    x.grad = None
    
    print(f"Layers={n_layers:3d}  |  grad (no residual): {grad_no:.2e}  |  grad (with residual): {grad_yes:.2e}")
```

Expected: without residuals, gradients shrink to near-zero for deep networks (vanishing gradients). With residuals, they stay healthy.

---

## 5.3 Full GPT Model

Stack N transformer blocks with an embedding layer on top and a language model head on the bottom:

```python
class GPT(nn.Module):
    def __init__(self, vocab_size, d_model, n_heads, n_layers, max_seq_len, dropout=0.1):
        super().__init__()
        self.token_embed = nn.Embedding(vocab_size, d_model)
        self.pos_embed   = nn.Embedding(max_seq_len, d_model)
        self.drop        = nn.Dropout(dropout)
        
        # Stack of transformer blocks
        self.blocks = nn.ModuleList([
            TransformerBlock(d_model, n_heads, dropout)
            for _ in range(n_layers)
        ])
        
        self.ln_f = nn.LayerNorm(d_model)    # final layer norm
        self.lm_head = nn.Linear(d_model, vocab_size, bias=False)
        
        # Weight tying: share embedding and output weights (saves params + works better)
        self.lm_head.weight = self.token_embed.weight
        
        # Initialize weights
        self.apply(self._init_weights)
    
    def _init_weights(self, module):
        if isinstance(module, nn.Linear):
            nn.init.normal_(module.weight, mean=0.0, std=0.02)
            if module.bias is not None:
                nn.init.zeros_(module.bias)
        elif isinstance(module, nn.Embedding):
            nn.init.normal_(module.weight, mean=0.0, std=0.02)
    
    def forward(self, token_ids, targets=None):
        B, T = token_ids.shape
        
        # Embeddings
        tok = self.token_embed(token_ids)              # [B, T, d_model]
        pos = self.pos_embed(torch.arange(T))          # [T, d_model]
        x   = self.drop(tok + pos)                     # [B, T, d_model]
        
        # Causal mask
        mask = torch.tril(torch.ones(T, T, device=token_ids.device))
        
        # Transformer blocks
        for block in self.blocks:
            x = block(x, mask)
        
        x = self.ln_f(x)                               # [B, T, d_model]
        logits = self.lm_head(x)                       # [B, T, vocab_size]
        
        # Compute loss if targets provided
        loss = None
        if targets is not None:
            # Flatten batch and sequence dimensions
            loss = F.cross_entropy(
                logits.view(-1, logits.size(-1)),   # [B*T, vocab_size]
                targets.view(-1)                     # [B*T]
            )
        
        return logits, loss
    
    @torch.no_grad()
    def generate(self, idx, max_new_tokens, temperature=1.0, top_k=None):
        """Autoregressively generate tokens."""
        for _ in range(max_new_tokens):
            # Crop to max context
            idx_cond = idx[:, -self.pos_embed.num_embeddings:]
            
            # Forward pass
            logits, _ = self(idx_cond)
            logits = logits[:, -1, :] / temperature  # last token's logits
            
            # Optional top-k sampling
            if top_k is not None:
                v, _ = torch.topk(logits, min(top_k, logits.size(-1)))
                logits[logits < v[:, -1:]] = float('-inf')
            
            # Sample
            probs     = F.softmax(logits, dim=-1)
            next_token = torch.multinomial(probs, num_samples=1)
            idx       = torch.cat([idx, next_token], dim=1)
        
        return idx

# Instantiate a small GPT
model = GPT(
    vocab_size  = 256,    # character-level (ASCII)
    d_model     = 128,
    n_heads     = 4,
    n_layers    = 4,
    max_seq_len = 128,
)

n_params = sum(p.numel() for p in model.parameters())
print(f"Model parameters: {n_params:,}")

# Test forward pass
dummy_input = torch.randint(0, 256, (2, 32))   # batch=2, seq=32
logits, loss = model(dummy_input, targets=dummy_input[:, :])
print(f"Logits shape: {logits.shape}")   # [2, 32, 256]
print(f"Loss: {loss.item():.4f}")         # should be ≈ log(256) ≈ 5.5 (random)
```

---

## 5.4 Model Scaling

Let's see how model size changes with hyperparameters:

```python
def model_size(vocab_size, d_model, n_heads, n_layers, max_seq_len):
    model = GPT(vocab_size, d_model, n_heads, n_layers, max_seq_len)
    return sum(p.numel() for p in model.parameters())

configs = [
    # name          vocab   d_model  heads  layers  seq
    ("Tiny",        256,    64,      4,     2,      64),
    ("Small",       50257,  256,     4,     4,      512),
    ("Medium",      50257,  512,     8,     8,      1024),
    ("GPT-2 small", 50257,  768,     12,    12,     1024),
    ("GPT-2 large", 50257,  1280,    20,    36,     1024),
]

print(f"{'Name':<14} {'Params':>12}")
print("-" * 28)
for name, *args in configs:
    n = model_size(*args)
    print(f"{name:<14} {n:>12,}")
```

---

## 5.5 The Information Flow

Here's what happens to a token as it passes through the model:

```
Input: token_id (integer)
   ↓
Embedding: ℝ^d_model
   ↓
+ Positional embedding
   ↓
━━━━━━━━━━━━━━━━━━━━━━━ ×N blocks
LayerNorm
   ↓
Multi-Head Attention  ← attends to all other positions
   ↓
+ Residual
   ↓
LayerNorm
   ↓
Feed-Forward (MLP)    ← processes each position independently
   ↓
+ Residual
━━━━━━━━━━━━━━━━━━━━━━━
   ↓
Final LayerNorm
   ↓
Linear (d_model → vocab_size)
   ↓
Softmax → probability distribution over next token
```

```python
# Let's trace the shape at each step
model.eval()
x_ids = torch.randint(0, 256, (1, 8))   # 1 sequence of 8 tokens

print(f"Token IDs:          {x_ids.shape}")    # [1, 8]

tok = model.token_embed(x_ids)
print(f"After token embed:  {tok.shape}")      # [1, 8, 128]

pos = model.pos_embed(torch.arange(8))
x   = tok + pos
print(f"After pos embed:    {x.shape}")        # [1, 8, 128]

mask = torch.tril(torch.ones(8, 8))
for i, block in enumerate(model.blocks):
    x = block(x, mask)
    print(f"After block {i}:       {x.shape}")  # [1, 8, 128] — same throughout

x = model.ln_f(x)
logits = model.lm_head(x)
print(f"Final logits:       {logits.shape}")   # [1, 8, 256]
print(f"Prediction for pos 0: top-5 tokens = {logits[0,0].topk(5).indices.tolist()}")
```

---

## ✅ Module 05 Summary

| Component | Role | Equation |
|-----------|------|----------|
| Token embedding | int → vector | `E[token_id]` |
| Positional embedding | add position info | `+ pos_embed[pos]` |
| TransformerBlock | core computation | `x += Attn(LN(x)); x += FFN(LN(x))` |
| Residual connection | preserve info + gradient flow | `x = x + f(x)` |
| Layer Norm | stabilize training | `(x - μ)/σ * γ + β` |
| LM head | vector → token probs | `Linear → Softmax` |
| Weight tying | share embed/head weights | reduces params, improves quality |

---

## 🧪 Experiments to Try

1. Change `n_layers` from 4 to 1. How does the parameter count change? What about quality when you train it?
2. Remove `weight_tying` (make `lm_head` independent). Run the training loop from module 03. Does it matter?
3. Add a `dropout=0.0` vs `0.5` — when would you want more dropout?

---

> **Next:** `06_build_nanogpt.md` — train a real character-level LLM on Shakespeare and watch it learn to write! →
