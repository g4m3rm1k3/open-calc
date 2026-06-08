# Module 01 — Vectors and Embeddings

> **The big idea:** Every word, token, or concept in an LLM is a vector — a point in high-dimensional space. The *geometry* of that space encodes meaning.

---

## 1.1 Why Vectors?

Computers can't work with the word "cat" directly. We need to turn it into numbers. The naive approach — assign each word an integer — fails because it implies ordering: is "cat" (42) somehow *between* "bus" (41) and "dog" (43)?

The better approach: **embed** each word as a vector in ℝᵈ where *direction and distance carry meaning*.

This is called an **embedding**.

---

## 1.2 The Embedding Matrix

If our vocabulary has V words and we want d-dimensional embeddings, we store them in a matrix:

```
E ∈ ℝ^(V × d)
```

Each row is one word's embedding vector. Looking up a word's embedding = selecting a row from E.

In code, this is just an index operation:

```python
import torch
import torch.nn as nn
import numpy as np
import matplotlib.pyplot as plt

# --- Setup ---
vocab_size = 10_000   # number of unique tokens
embed_dim  = 64       # dimension of each embedding vector

# This matrix is what the model LEARNS during training
E = nn.Embedding(vocab_size, embed_dim)

print(f"Embedding matrix shape: {E.weight.shape}")  # [10000, 64]

# Looking up word index 42 ("cat", say)
cat_idx = torch.tensor(42)
cat_vec = E(cat_idx)
print(f"'cat' embedding shape: {cat_vec.shape}")    # [64]
print(f"First 5 values: {cat_vec[:5].detach()}")
```

**Key insight:** At initialization these are random. After training, similar words will have similar vectors. That's the whole magic.

---

## 1.3 Vector Similarity = Semantic Similarity

Once trained, the **cosine similarity** between two vectors tells you how related the concepts are:

```
cos(θ) = (u · v) / (‖u‖ ‖v‖)
```

- cos(θ) = 1  →  identical direction (same meaning)
- cos(θ) = 0  →  orthogonal (unrelated)
- cos(θ) = -1 →  opposite direction (antonyms, sometimes)

```python
def cosine_similarity(u, v):
    return torch.dot(u, v) / (torch.norm(u) * torch.norm(v))

# Simulate what trained embeddings look like
# (We'll fake it with random vecs for now, just to see the mechanics)
torch.manual_seed(0)
king  = torch.randn(64)
queen = king + torch.randn(64) * 0.3   # queen is CLOSE to king
rock  = torch.randn(64)                 # rock is far away

print(f"king  ↔ queen : {cosine_similarity(king, queen):.3f}")   # high
print(f"king  ↔ rock  : {cosine_similarity(king, rock):.3f}")    # low
print(f"queen ↔ rock  : {cosine_similarity(queen, rock):.3f}")   # low
```

---

## 1.4 The Famous Word Analogy

The reason embeddings took the world by storm: **vector arithmetic encodes analogies**.

```
king - man + woman ≈ queen
```

This works because the model learns that the *direction* from man→woman captures the concept of "gender", and that direction applied to king lands near queen.

```python
# Let's see this with pre-trained embeddings
# We'll use a tiny pre-trained word2vec-style set for illustration

from sklearn.decomposition import PCA

# Fake 6 "trained" embeddings in 8D
# (direction of axis 0 = royalty, axis 1 = gender)
embeddings = {
    "king":   torch.tensor([2.0,  1.0,  0.3, -0.1,  0.5,  0.2, -0.3,  0.1]),
    "queen":  torch.tensor([2.0, -1.0,  0.2,  0.1,  0.4,  0.3, -0.2,  0.2]),
    "man":    torch.tensor([0.1,  1.0, -0.1,  0.0,  0.1, -0.1,  0.0, -0.1]),
    "woman":  torch.tensor([0.1, -1.0,  0.0,  0.1,  0.2,  0.0,  0.1,  0.0]),
    "prince": torch.tensor([1.5,  1.1,  0.4, -0.2,  0.3,  0.1, -0.4,  0.2]),
    "apple":  torch.tensor([-1.5, 0.2, 1.0,  0.8, -0.5, -0.3,  0.6,  0.4]),
}

# The analogy: king - man + woman = ?
result = embeddings["king"] - embeddings["man"] + embeddings["woman"]

# Find closest word
for word, vec in embeddings.items():
    sim = cosine_similarity(result, vec).item()
    print(f"  similarity to '{word}': {sim:.3f}")
```

**Expected:** "queen" scores highest.

---

## 1.5 Visualizing Embedding Space (PCA)

High-dimensional vectors are hard to visualize. **PCA** (which you know from linear algebra — it's eigendecomposition of the covariance matrix) projects them down to 2D:

```python
import matplotlib.pyplot as plt
from sklearn.decomposition import PCA

# Stack all vectors into a matrix
words = list(embeddings.keys())
matrix = torch.stack([embeddings[w] for w in words]).numpy()  # shape [6, 8]

# PCA: find the 2 principal components (eigenvectors with largest eigenvalues)
pca = PCA(n_components=2)
coords = pca.fit_transform(matrix)  # shape [6, 2]

print(f"Explained variance: {pca.explained_variance_ratio_}")

# Plot
plt.figure(figsize=(7, 5))
for i, word in enumerate(words):
    plt.scatter(coords[i, 0], coords[i, 1], s=100)
    plt.annotate(word, (coords[i, 0] + 0.02, coords[i, 1] + 0.02), fontsize=12)

# Draw the analogy arrow
king_i  = words.index("king")
queen_i = words.index("queen")
plt.annotate("", xy=coords[queen_i], xytext=coords[king_i],
             arrowprops=dict(arrowstyle="->", color="red", lw=2))
plt.title("Embedding Space (PCA to 2D)")
plt.grid(True, alpha=0.3)
plt.tight_layout()
plt.savefig("embeddings_pca.png", dpi=120)
plt.show()
print("Saved to embeddings_pca.png")
```

---

## 1.6 Positional Embeddings

Here's a problem: the embedding for "dog" is the same whether it appears first or last in a sentence. But position matters! "Dog bites man" ≠ "Man bites dog."

Transformers solve this by **adding** a positional embedding to each word embedding:

```
final_embedding = word_embedding + positional_embedding
```

The original transformer used a clever formula based on sin/cos waves:

```python
def positional_encoding(seq_len, d_model):
    """
    Returns a matrix of shape [seq_len, d_model]
    where each row encodes a position using sin/cos at different frequencies.
    """
    PE = torch.zeros(seq_len, d_model)
    position = torch.arange(seq_len).unsqueeze(1).float()  # [seq_len, 1]
    
    # Frequencies: 1/10000^(2i/d_model) for each dimension pair i
    div_term = torch.exp(
        torch.arange(0, d_model, 2).float() * (-np.log(10000.0) / d_model)
    )
    
    PE[:, 0::2] = torch.sin(position * div_term)  # even dims → sin
    PE[:, 1::2] = torch.cos(position * div_term)  # odd dims  → cos
    
    return PE

pe = positional_encoding(seq_len=20, d_model=16)
print(f"Positional encoding shape: {pe.shape}")  # [20, 16]

# Visualize: each row is a position, each col is a dimension
plt.figure(figsize=(10, 4))
plt.imshow(pe.numpy(), aspect='auto', cmap='RdBu')
plt.colorbar()
plt.xlabel("Embedding Dimension")
plt.ylabel("Position in Sequence")
plt.title("Positional Encodings (sin/cos pattern)")
plt.tight_layout()
plt.savefig("positional_encoding.png", dpi=120)
plt.show()
```

**Why sin/cos?** Because the dot product between two positional encodings depends only on their *distance* apart — the model can learn relative positions.

---

## 1.7 Putting It Together

```python
class EmbeddingLayer(nn.Module):
    def __init__(self, vocab_size, d_model, max_seq_len=512):
        super().__init__()
        self.word_embed = nn.Embedding(vocab_size, d_model)
        self.pos_embed  = nn.Embedding(max_seq_len, d_model)  # learned positions
        
    def forward(self, token_ids):
        # token_ids: [batch, seq_len]
        B, T = token_ids.shape
        
        # Word embeddings
        word_vecs = self.word_embed(token_ids)              # [B, T, d_model]
        
        # Position embeddings (0, 1, 2, ..., T-1)
        positions = torch.arange(T, device=token_ids.device)
        pos_vecs  = self.pos_embed(positions)               # [T, d_model]
        
        return word_vecs + pos_vecs   # broadcast: [B, T, d_model]

# Test it
embed_layer = EmbeddingLayer(vocab_size=1000, d_model=32)
dummy_tokens = torch.randint(0, 1000, (2, 10))  # batch=2, seq_len=10
output = embed_layer(dummy_tokens)
print(f"Input shape:  {dummy_tokens.shape}")   # [2, 10]
print(f"Output shape: {output.shape}")         # [2, 10, 32]
```

---

## ✅ Module 01 Summary

| Concept | What it is | Math |
|---------|-----------|------|
| Embedding | Vector representation of a token | `e ∈ ℝᵈ` |
| Embedding matrix | All embeddings stacked | `E ∈ ℝ^(V×d)` |
| Lookup | Select a row from E | `e = E[i]` |
| Cosine similarity | Angle between vectors | `(u·v)/(‖u‖‖v‖)` |
| Positional encoding | Adds position info to embeddings | `e_final = e_word + e_pos` |

---

## 🧪 Experiments to Try

1. Change `embed_dim` to 2 and visualize 10 words directly (no PCA needed!)
2. Compute the embedding matrix's covariance — what do you notice?
3. What happens to cosine similarity if you add a constant to every vector?

---

> **Next:** `02_matrix_ops_in_neural_nets.md` — how matrix multiplications *are* neural network layers →
