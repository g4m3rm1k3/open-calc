# Module 04 — Embeddings and Attention
### From integers to vectors. Then the core mechanism of every LLM.

---

## How to Use This Module

This is the longest module. Take your time.
Attention is the one thing most tutorials hand-wave.
We will not. Every step is derived.

Create `04_embeddings_attention.py` and type every line.

---

## PART 1 — Embeddings

---

### 1.1 Where We Are

The tokenizer gave us integers. The model needs vectors.
We have a sequence like `[22, 8, 47, 3]` and we need to turn
each integer into a vector of real numbers that the model can compute with.

The operation that does this is called an **embedding lookup**.

---

### 1.2 The Embedding Matrix

We create a matrix E with shape `[vocab_size, d_model]`.

- `vocab_size` rows — one row per token in the vocabulary
- `d_model` columns — each token gets a vector of this length

Row `i` of E is the embedding vector for token `i`.

Looking up the embedding for token 22 = selecting row 22 of E.

That is literally the entire operation. Select a row.

The matrix E starts with random values. During training, gradient descent
adjusts each row so that tokens that appear in similar contexts
end up with similar vectors. We do not design the vectors — they learn.

**Why a matrix and not a dictionary?**
Because we need gradients to flow through the lookup.
If we stored embeddings in a Python dictionary, there would be no
gradient with respect to the values. A matrix is a tensor, so
PyTorch can compute `∂L/∂E[i]` — how should token i's embedding change
to reduce the loss. A dictionary cannot do that.

**The shape rule:**
```
E:          [vocab_size, d_model]     ← the full embedding matrix
token_id:   integer (e.g., 22)
result:     E[22]  →  [d_model]       ← one row selected
```

For a batch of sequences:
```
token_ids:  [batch_size, seq_len]     ← integers
result:     [batch_size, seq_len, d_model]  ← each integer replaced by its row
```

---

### 1.3 Positional Embeddings — Why We Need Them

Here is a subtle problem with attention (which we have not built yet,
but we need to understand this now to motivate positional embeddings).

Attention computes a score between every pair of tokens.
The score for token i attending to token j is based on their vectors.
But it is NOT based on their positions.

This means: if you shuffle the tokens in a sentence, attention gives
the same scores. The model has no idea about order.

"Dog bites man" and "Man bites dog" would produce identical attention scores
if we did not add position information. Clearly that is wrong.

**The fix:** add a position-dependent vector to each token's embedding.
The final representation is: `word_meaning + position_information`.

We use a second embedding matrix P with shape `[max_seq_len, d_model]`.
Row `i` of P is the positional embedding for position `i`.

The full embedding for token at position `t` is: `E[token_id] + P[t]`

Why add instead of concatenate? Because adding keeps the dimension at `d_model`.
Concatenating would double it to `2 * d_model`, making the model twice as wide.
Addition is simpler, uses fewer parameters, and works just as well.

---

## PART 2 — Attention

---

### 2.1 The Problem Attention Solves

After the embedding layer, each token is a vector.
But each vector only knows about itself — its own identity and position.

"The bank was flooded by the river."

When processing "bank", the model needs to know it means a riverbank, not
a financial institution. But the token "bank" by itself carries both meanings.

The model needs to look at "river" and update its understanding of "bank"
based on that context.

**Attention is the mechanism that lets tokens communicate.**

Every token gets to look at every other token and decide:
"how much information should I gather from you?"

The tokens with high relevance get their information mixed in.
The tokens with low relevance are mostly ignored.

---

### 2.2 Deriving Attention From First Principles

Let's derive the formula by thinking through what we actually want.

**We want:**
For each token i, produce an updated representation that incorporates
information from other tokens, weighted by relevance.

**Step 1: Measure relevance.**
How relevant is token j to token i?

The simplest measure of relevance between two vectors: dot product.
(We built this in module 01 — it measures directional similarity.)

So: relevance(i, j) = (vector_i) · (vector_j)

But if we use the raw token embeddings for both sides of this dot product,
we are asking "how similar is this token's meaning to that token's meaning?"
That is not quite right. We want to ask different questions:

- Token i asks: "What am I looking for?" (its **query**)
- Token j says: "What do I contain?" (its **key**)

These can be different from the raw embedding.
We use learned linear projections to create them.

**Step 2: Define Query, Key, Value.**

Each token's embedding `x` gets projected three ways:

```
Query: Q = x W_Q       "What am I looking for?"
Key:   K = x W_K       "What do I contain / advertise?"
Value: V = x W_V       "What information do I share if attended to?"
```

`W_Q`, `W_K`, `W_V` are weight matrices we learn during training.
They are different matrices — different learned roles.

**Step 3: Compute attention scores.**

For each token i, compute its score against every token j:

```
score(i, j) = Q_i · K_j
```

This tells us: "how well does token i's query match token j's key?"

**Step 4: Scale the scores.**

There is a problem. If the vectors have dimension `d_k` components,
each drawn from a distribution with variance 1, then the dot product
has variance `d_k`. For large `d_k` (like 64), the scores get large,
the softmax becomes very peaked (one token gets all the weight),
and gradients vanish.

Fix: divide by `√d_k`. Now the variance is 1 regardless of `d_k`.

**Why √d_k specifically?**
If `Q_i` and `K_j` each have `d_k` components with variance 1,
then `Q_i · K_j = Σ Q_i[k] × K_j[k]`. Each term has expected value 0
and variance 1. Summing `d_k` of them gives variance `d_k`.
Dividing by `√d_k` gives variance 1. Clean and stable.

```
score(i, j) = (Q_i · K_j) / √d_k
```

**Step 5: Normalize to weights.**

We have scores but we want weights that sum to 1.
Softmax does this.

```
weight(i, j) = softmax_j[ score(i, j) ]
             = exp(score(i,j)) / Σ_j' exp(score(i,j'))
```

Now `weight(i, j)` is the fraction of attention token i pays to token j.
All weights for token i sum to 1. They are like probabilities.

**Step 6: Weighted sum of Values.**

Token i's new representation = weighted sum of all tokens' values:

```
output_i = Σ_j weight(i, j) × V_j
```

**The complete formula in matrix form:**

```
Attention(Q, K, V) = softmax(Q K^T / √d_k) × V
```

Where `Q`, `K`, `V` are matrices with one row per token.
`Q K^T` computes all pairwise query-key dot products at once.
The result shape is `[T, T]` — T tokens × T tokens.

---

### 2.3 The Causal Mask — Why Language Models Cannot See the Future

When training on "The cat sat on the mat":
- When predicting token 3 ("sat"), should the model see "on the mat"?
- No. That would be cheating. The model must predict without seeing the future.

This is enforced with a **causal mask** — a matrix that blocks attention
to future positions.

The mask is a lower-triangular matrix:
```
Position: 0 1 2 3 4 5
       0: 1 0 0 0 0 0    token 0 can only see token 0
       1: 1 1 0 0 0 0    token 1 can see tokens 0-1
       2: 1 1 1 0 0 0    token 2 can see tokens 0-2
       3: 1 1 1 1 0 0    token 3 can see tokens 0-3
       4: 1 1 1 1 1 0    token 4 can see tokens 0-4
       5: 1 1 1 1 1 1    token 5 can see all tokens
```

1 = allowed to attend, 0 = blocked

We apply the mask by setting the blocked positions to -∞ before softmax.
After softmax, exp(-∞) = 0, so blocked positions get zero weight.

---

### 2.4 Multi-Head Attention — Why Multiple Heads

One attention head might learn to track grammatical relationships.
Another might track co-reference (what does "it" refer to?).
Another might track long-range topic relationships.

Instead of one set of Q, K, V projections, we use `n_heads` of them.
Each head operates in a lower-dimensional space `d_head = d_model / n_heads`.

All heads run in parallel. Their outputs are concatenated, then projected.

**Why divide the dimension?**
If we gave each head the full `d_model` dimensions, the total computation
would be `n_heads` times more expensive. By dividing, total computation
stays the same while we get multiple independent views.

Think of it as: instead of one expert examining all `d_model` features,
we have `n_heads` specialists each examining `d_head` features.

---

## PART 3 — Writing the Code

Create `04_embeddings_attention.py` and type everything below.

```python
# 04_embeddings_attention.py
#
# In this file we build:
# 1. The embedding layer (token + position)
# 2. Scaled dot-product attention (the core mechanism)
# 3. The causal mask
# 4. Multi-head attention
#
# By the end, you have the most important part of the transformer.

import torch
import torch.nn as nn
import torch.nn.functional as F
import math
import pickle
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np

# Load the tokenizer we built in module 03
with open('tokenizer.pkl', 'rb') as f:
    tok_data   = pickle.load(f)

char_to_id = tok_data['char_to_id']
id_to_char = tok_data['id_to_char']
vocab_size  = tok_data['vocab_size']

encode = lambda text: [char_to_id[c] for c in text if c in char_to_id]
decode = lambda ids:  ''.join(id_to_char[i] for i in ids)

print(f"Loaded tokenizer: {vocab_size} unique characters")
```

```python
# -------------------------------------------------------
# PART A: THE EMBEDDING LAYER
#
# Plain English:
#   - Token embedding: look up a vector for each token ID
#   - Position embedding: look up a vector for each position
#   - Add them together to get the final representation
#
# The token embedding matrix: [vocab_size, d_model]
# The position embedding matrix: [max_seq_len, d_model]
# Both are learned parameters — gradient descent adjusts them.
# -------------------------------------------------------

class EmbeddingLayer(nn.Module):
    """
    Converts a sequence of token IDs to a sequence of vectors.
    
    Two components:
    1. Token embedding: what is this token? (its identity)
    2. Position embedding: where is this token? (its location)
    
    We add them together. The model learns to use both.
    """
    
    def __init__(self, vocab_size, d_model, max_seq_len, dropout=0.1):
        # nn.Module.__init__() must always be called first in any nn.Module subclass
        # This sets up PyTorch's internal bookkeeping for parameters and gradients
        super().__init__()
        
        self.d_model     = d_model
        self.max_seq_len = max_seq_len
        
        # Token embedding matrix: [vocab_size, d_model]
        # nn.Embedding is a special layer that is just a matrix lookup
        # It is equivalent to a [vocab_size, d_model] matrix
        # but optimized for integer indexing (no matrix multiply needed)
        self.token_embedding = nn.Embedding(vocab_size, d_model)
        
        # Position embedding matrix: [max_seq_len, d_model]
        # One vector per possible position (0, 1, 2, ..., max_seq_len-1)
        self.position_embedding = nn.Embedding(max_seq_len, d_model)
        
        # Dropout: randomly zeros some values during training
        # This prevents the model from relying too heavily on any one feature
        # At inference time (eval mode), dropout is disabled automatically
        self.dropout = nn.Dropout(dropout)
        
        # Initialize with small random values
        # Why small? Large initial values cause large initial activations,
        # which can cause unstable training
        # std=0.02 is the value used in GPT-2 and has become standard
        nn.init.normal_(self.token_embedding.weight,    std=0.02)
        nn.init.normal_(self.position_embedding.weight, std=0.02)
    
    def forward(self, token_ids):
        """
        token_ids: [batch_size, seq_len]  — integers, each in range [0, vocab_size)
        returns:   [batch_size, seq_len, d_model]  — vectors
        
        Step by step:
        1. Look up token embedding for each token: [batch, seq, d_model]
        2. Create position indices [0, 1, 2, ..., seq_len-1]
        3. Look up position embedding for each position: [seq, d_model]
        4. Add them together (position broadcasts across batch)
        5. Apply dropout
        """
        batch_size, seq_len = token_ids.shape
        
        # Check we are not exceeding the maximum sequence length
        # If we are, the position embedding matrix does not have enough rows
        if seq_len > self.max_seq_len:
            raise ValueError(
                f"Sequence length {seq_len} exceeds maximum {self.max_seq_len}. "
                f"Either increase max_seq_len or shorten the input."
            )
        
        # Step 1: Token embeddings
        # token_ids[b, t] is an integer, and we look up row token_ids[b,t] of the embedding matrix
        # Result: each integer is replaced by its corresponding d_model-dimensional vector
        tok_emb = self.token_embedding(token_ids)
        # tok_emb shape: [batch_size, seq_len, d_model]
        
        # Step 2: Position indices
        # We need a tensor [0, 1, 2, ..., seq_len-1]
        # device=token_ids.device ensures position indices are on the same device
        # (CPU or GPU) as the token IDs — they must be on the same device
        positions = torch.arange(seq_len, device=token_ids.device)
        # positions shape: [seq_len]
        
        # Step 3: Position embeddings
        # Look up row positions[t] = t from the position embedding matrix
        pos_emb = self.position_embedding(positions)
        # pos_emb shape: [seq_len, d_model]
        
        # Step 4: Add token and position embeddings
        # Broadcasting: pos_emb [seq_len, d_model] is broadcast across the batch dimension
        # It becomes [1, seq_len, d_model] which broadcasts to [batch_size, seq_len, d_model]
        x = tok_emb + pos_emb
        # x shape: [batch_size, seq_len, d_model]
        
        # Step 5: Dropout
        x = self.dropout(x)
        
        return x


# Test the embedding layer
torch.manual_seed(42)
d_model     = 64     # small for testing
max_seq_len = 256    # maximum sequence length

embed = EmbeddingLayer(vocab_size, d_model, max_seq_len)

# Encode a sentence
sentence   = "To be or not to be"
ids        = torch.tensor([encode(sentence)], dtype=torch.long)  # [1, len]
vectors    = embed(ids)

print("\n=== EMBEDDING LAYER TEST ===")
print(f"Sentence:     '{sentence}'")
print(f"Token IDs:    {ids.shape}  = {ids.tolist()}")
print(f"Vectors:      {vectors.shape}")
print(f"              (batch=1, seq_len={len(sentence)}, d_model={d_model})")
print(f"\nFirst token 'T' vector (first 8 dims): {vectors[0, 0, :8].detach().numpy().round(3)}")
print(f"Second token 'o' vector (first 8 dims): {vectors[0, 1, :8].detach().numpy().round(3)}")
print(f"\nThese are random now. After training, similar characters will")
print(f"have similar vectors.")
```

```python
# -------------------------------------------------------
# PART B: SCALED DOT-PRODUCT ATTENTION
#
# This implements the formula we derived:
#   Attention(Q, K, V) = softmax(Q K^T / √d_k) × V
#
# Shapes:
#   Q: [batch, heads, seq, d_k]    queries
#   K: [batch, heads, seq, d_k]    keys
#   V: [batch, heads, seq, d_v]    values
#   output: [batch, heads, seq, d_v]
#   weights: [batch, heads, seq, seq]   ← the attention matrix
# -------------------------------------------------------

def scaled_dot_product_attention(Q, K, V, mask=None):
    """
    Compute scaled dot-product attention.
    
    Q: queries  [batch, heads, seq_len, d_k]
    K: keys     [batch, heads, seq_len, d_k]
    V: values   [batch, heads, seq_len, d_v]
    mask: optional causal mask [seq_len, seq_len]
          1 = allowed to attend, 0 = blocked
    
    Returns:
      output:  [batch, heads, seq_len, d_v]
      weights: [batch, heads, seq_len, seq_len]
    
    We return weights so we can visualize attention patterns later.
    """
    # d_k is the dimension of queries and keys
    # We use it to scale the dot products
    d_k = Q.shape[-1]
    
    # Step 1: Compute all pairwise query-key dot products
    #
    # Q:   [batch, heads, seq, d_k]
    # K^T: [batch, heads, d_k, seq]   (transpose last two dims)
    # Q @ K^T: [batch, heads, seq, seq]
    #
    # scores[b, h, i, j] = "how much should token i attend to token j?"
    #                     = dot product of token i's query with token j's key
    scores = torch.matmul(Q, K.transpose(-2, -1))
    # scores shape: [batch, heads, seq, seq]
    
    # Step 2: Scale by 1/√d_k
    #
    # Without scaling: large d_k → large dot products → softmax peaks sharply
    # → one token gets almost all the weight → gradients vanish
    # With scaling: variance is 1 regardless of d_k → stable gradients
    scores = scores / math.sqrt(d_k)
    
    # Step 3: Apply causal mask (if provided)
    #
    # The mask has 1 where attention is allowed, 0 where it is blocked.
    # We set blocked positions to -infinity.
    # After softmax, exp(-infinity) = 0, so they contribute nothing.
    if mask is not None:
        scores = scores.masked_fill(mask == 0, float('-inf'))
    
    # Step 4: Softmax over the key dimension
    #
    # For each query position i (each row), normalize over all key positions j.
    # After softmax, each row sums to 1 — they are now attention weights.
    weights = torch.softmax(scores, dim=-1)
    # weights shape: [batch, heads, seq, seq]
    
    # Handle numerical edge case: if ALL positions are masked (entire row is -inf),
    # softmax produces NaN (0/0). Replace with 0 — no information flows.
    weights = torch.nan_to_num(weights, nan=0.0)
    
    # Step 5: Weighted sum of Values
    #
    # weights: [batch, heads, seq, seq]
    # V:       [batch, heads, seq, d_v]
    # output:  [batch, heads, seq, d_v]
    #
    # output[b, h, i, :] = Σ_j weights[b, h, i, j] × V[b, h, j, :]
    # = the weighted combination of value vectors, where the weights
    # tell us how much attention each token i pays to each token j
    output = torch.matmul(weights, V)
    # output shape: [batch, heads, seq, d_v]
    
    return output, weights


# Test with a tiny example
torch.manual_seed(0)
B, H, T, d_k = 1, 1, 4, 8   # batch=1, heads=1, seq=4, key_dim=8

Q_test = torch.randn(B, H, T, d_k)
K_test = torch.randn(B, H, T, d_k)
V_test = torch.randn(B, H, T, d_k)

output_test, weights_test = scaled_dot_product_attention(Q_test, K_test, V_test)

print("\n=== ATTENTION FUNCTION TEST ===")
print(f"Q shape: {Q_test.shape}  (batch, heads, seq, d_k)")
print(f"Output:  {output_test.shape}  (batch, heads, seq, d_k)")
print(f"Weights: {weights_test.shape}  (batch, heads, seq, seq)")
print()
print("Attention weight matrix (each row sums to 1):")
print(weights_test[0, 0].detach().numpy().round(3))
print()
print("Row sums (should all be 1.0):")
print(weights_test[0, 0].sum(dim=-1).detach().numpy().round(6))
```

```python
# -------------------------------------------------------
# PART C: THE CAUSAL MASK
#
# For language modeling, token i cannot attend to tokens i+1, i+2, ...
# (cannot see the future).
#
# We create a lower-triangular matrix: 1 on and below the diagonal, 0 above.
# torch.tril() does this — "lower triangular."
# -------------------------------------------------------

def make_causal_mask(seq_len, device='cpu'):
    """
    Create a causal (autoregressive) attention mask.
    
    Returns a [seq_len, seq_len] matrix where:
      mask[i, j] = 1  if token i is allowed to attend to token j
      mask[i, j] = 0  if token i is NOT allowed to attend to token j
    
    Token i can attend to tokens 0, 1, ..., i (itself and all past tokens).
    Token i cannot attend to tokens i+1, i+2, ... (future tokens).
    
    torch.tril() keeps the lower triangle (including diagonal) and zeros the rest.
    """
    # torch.ones(T, T): creates a T×T matrix of all ones
    # torch.tril(...): zeroes out the upper triangle (above diagonal)
    mask = torch.tril(torch.ones(seq_len, seq_len, device=device))
    return mask

# Visualize the mask
T    = 6
mask = make_causal_mask(T)

print("=== CAUSAL MASK ===")
print(f"Shape: {mask.shape}")
print()
print("Mask (1=can attend, 0=blocked):")
for i in range(T):
    row = [int(mask[i, j].item()) for j in range(T)]
    can_see = [j for j, allowed in enumerate(row) if allowed]
    print(f"  Token {i}: {row}  ← can see tokens {can_see}")

# Visualize with matplotlib
fig, axes = plt.subplots(1, 2, figsize=(11, 4.5))

im0 = axes[0].imshow(mask.numpy(), cmap='Blues', vmin=0, vmax=1)
axes[0].set_title("Causal Mask\n(blue=allowed, white=blocked)", fontsize=11)
axes[0].set_xlabel("Key position (token being attended to)")
axes[0].set_ylabel("Query position (token doing the attending)")
for i in range(T):
    for j in range(T):
        axes[0].text(j, i, int(mask[i,j].item()),
                    ha='center', va='center', fontsize=12)

# Show what masked attention weights look like
Q_m = torch.randn(1, 1, T, 8)
K_m = torch.randn(1, 1, T, 8)
V_m = torch.randn(1, 1, T, 8)
_, w_masked = scaled_dot_product_attention(Q_m, K_m, V_m, mask=mask)

im1 = axes[1].imshow(w_masked[0, 0].detach().numpy(), cmap='Blues', vmin=0)
axes[1].set_title("Masked Attention Weights\n(upper triangle = zero)", fontsize=11)
axes[1].set_xlabel("Key position")
axes[1].set_ylabel("Query position")
plt.colorbar(im1, ax=axes[1])

plt.suptitle("Causal Masking: Each Token Can Only See Its Past", fontsize=12)
plt.tight_layout()
plt.savefig("04a_causal_mask.png", dpi=130)
print("\nSaved: 04a_causal_mask.png")
```

```python
# -------------------------------------------------------
# PART D: MULTI-HEAD ATTENTION
#
# We run n_heads parallel attention operations.
# Each head has its own W_Q, W_K, W_V projection matrices.
# Each head operates on d_head = d_model / n_heads dimensions.
#
# Implementation trick: instead of n_heads separate matrices,
# we use one large matrix and reshape.
# This is mathematically equivalent but faster.
#
# Step by step:
#   1. Project x to Q, K, V using large matrices [d_model → d_model]
#   2. Reshape to split the d_model into n_heads × d_head
#   3. Run attention on all heads simultaneously
#   4. Concatenate head outputs back to d_model
#   5. Final linear projection
# -------------------------------------------------------

class MultiHeadAttention(nn.Module):
    """
    Multi-head attention.
    
    Runs n_heads attention operations in parallel.
    Each head learns to attend to different aspects of the sequence.
    """
    
    def __init__(self, d_model, n_heads, dropout=0.1):
        super().__init__()
        
        # Validate that the split works evenly
        if d_model % n_heads != 0:
            raise ValueError(
                f"d_model ({d_model}) must be divisible by n_heads ({n_heads}). "
                f"Otherwise we cannot split evenly across heads."
            )
        
        self.d_model = d_model
        self.n_heads = n_heads
        self.d_head  = d_model // n_heads  # dimension per head
        
        # Projection matrices for Q, K, V
        # Each maps [d_model] → [d_model] = [n_heads × d_head]
        # We then reshape to separate the heads
        self.W_Q = nn.Linear(d_model, d_model, bias=False)
        self.W_K = nn.Linear(d_model, d_model, bias=False)
        self.W_V = nn.Linear(d_model, d_model, bias=False)
        
        # Output projection: combines all heads' outputs back to [d_model]
        self.W_O = nn.Linear(d_model, d_model, bias=False)
        
        self.dropout = nn.Dropout(dropout)
        
        # Initialize with small random values
        for linear in [self.W_Q, self.W_K, self.W_V, self.W_O]:
            nn.init.normal_(linear.weight, std=0.02)
    
    def forward(self, x, mask=None):
        """
        x:    [batch, seq_len, d_model]
        mask: [seq_len, seq_len]  — causal mask (optional)
        
        Returns: [batch, seq_len, d_model]
        """
        B, T, d = x.shape  # batch, sequence length, model dimension
        
        # Step 1: Project x to Q, K, V
        # Each of these is a standard linear transformation
        # Input: [B, T, d_model], Output: [B, T, d_model]
        Q = self.W_Q(x)
        K = self.W_K(x)
        V = self.W_V(x)
        
        # Step 2: Reshape to separate heads
        # [B, T, d_model] → [B, T, n_heads, d_head] → [B, n_heads, T, d_head]
        #
        # .view() reshapes without copying data
        # We split the last dimension (d_model) into (n_heads, d_head)
        #
        # .transpose(1, 2) swaps dimensions 1 and 2
        # From [B, T, n_heads, d_head] to [B, n_heads, T, d_head]
        # Now the first "sequence" dimension is heads, not positions
        # This lets attention operate independently per head
        Q = Q.view(B, T, self.n_heads, self.d_head).transpose(1, 2)
        K = K.view(B, T, self.n_heads, self.d_head).transpose(1, 2)
        V = V.view(B, T, self.n_heads, self.d_head).transpose(1, 2)
        # All three: [B, n_heads, T, d_head]
        
        # Step 3: Attention — all heads computed simultaneously
        # PyTorch handles the batch × heads dimensions automatically
        attn_output, attn_weights = scaled_dot_product_attention(Q, K, V, mask)
        # attn_output: [B, n_heads, T, d_head]
        # attn_weights: [B, n_heads, T, T]
        
        # Step 4: Concatenate heads
        # Undo the reshape from step 2
        # [B, n_heads, T, d_head] → [B, T, n_heads, d_head] → [B, T, d_model]
        #
        # .transpose(1, 2): back to [B, T, n_heads, d_head]
        # .contiguous(): ensure memory is laid out contiguously (required before .view())
        # .view(B, T, d): merge last two dims back into d_model
        attn_output = attn_output.transpose(1, 2).contiguous().view(B, T, d)
        # attn_output: [B, T, d_model]
        
        # Step 5: Output projection
        # Mix the concatenated heads together
        output = self.W_O(attn_output)
        output = self.dropout(output)
        # output: [B, T, d_model]
        
        return output, attn_weights


# Test multi-head attention
torch.manual_seed(42)
d_model = 64
n_heads = 4

mha = MultiHeadAttention(d_model, n_heads)
x   = torch.randn(2, 10, d_model)   # batch=2, seq=10, d_model=64
mask = make_causal_mask(10)

output, weights = mha(x, mask)

print("\n=== MULTI-HEAD ATTENTION TEST ===")
print(f"Input:   {x.shape}     (batch=2, seq=10, d_model={d_model})")
print(f"Output:  {output.shape}   (same shape — attention transforms in place)")
print(f"Weights: {weights.shape}  (2 batches, {n_heads} heads, 10×10 attention matrix)")
print()

# Count parameters
n_params = sum(p.numel() for p in mha.parameters())
print(f"Parameters in MultiHeadAttention:")
print(f"  W_Q: {mha.W_Q.weight.shape}  = {mha.W_Q.weight.numel():,}")
print(f"  W_K: {mha.W_K.weight.shape}  = {mha.W_K.weight.numel():,}")
print(f"  W_V: {mha.W_V.weight.shape}  = {mha.W_V.weight.numel():,}")
print(f"  W_O: {mha.W_O.weight.shape}  = {mha.W_O.weight.numel():,}")
print(f"  Total: {n_params:,}")
```

```python
# -------------------------------------------------------
# PART E: VISUALIZING ATTENTION
#
# Let's look at what the attention weight matrix actually looks like.
# This is the core of "what is the model doing?"
# Each cell (i, j) tells us how much token i attends to token j.
# -------------------------------------------------------

# Encode a short sentence and run it through attention
sentence    = "the cat sat on the mat"
sentence_ids = torch.tensor([encode(sentence)], dtype=torch.long)

# Get embeddings
embed_test  = EmbeddingLayer(vocab_size, d_model=64, max_seq_len=256)
x_embedded  = embed_test(sentence_ids)   # [1, len, 64]

# Run through attention
mha_test    = MultiHeadAttention(d_model=64, n_heads=4)
mha_test.eval()   # disable dropout for visualization

with torch.no_grad():
    mask_sentence = make_causal_mask(len(sentence))
    _, attn_weights = mha_test(x_embedded, mask_sentence)

# attn_weights: [1, 4, len, len]
# Let us look at each head
chars = list(sentence)   # individual characters

fig, axes = plt.subplots(1, 4, figsize=(16, 4))

for head_idx in range(4):
    ax  = axes[head_idx]
    w   = attn_weights[0, head_idx].detach().numpy()   # [len, len]
    
    im = ax.imshow(w, cmap='Blues', vmin=0, vmax=w.max())
    ax.set_title(f"Head {head_idx}", fontsize=11)
    
    # Label axes with characters (every other one to avoid crowding)
    ax.set_xticks(range(0, len(chars), 2))
    ax.set_xticklabels(chars[::2], fontsize=7, rotation=45)
    ax.set_yticks(range(0, len(chars), 2))
    ax.set_yticklabels(chars[::2], fontsize=7)
    
    if head_idx == 0:
        ax.set_ylabel("Query (attending)", fontsize=9)
    ax.set_xlabel("Key (attended to)", fontsize=9)

plt.suptitle(
    f"Attention Patterns (untrained — random)\n"
    f"After training, each head will learn a different pattern",
    fontsize=11
)
plt.tight_layout()
plt.savefig("04b_attention_heads.png", dpi=130)
print("Saved: 04b_attention_heads.png")
print()
print("These attention patterns are random now (untrained).")
print("After training, some heads will specialize:")
print("  - Some will attend to adjacent characters (local)")
print("  - Some will attend to matching characters (global)")
print("  - Some will attend to the beginning of words")
```

```python
# -------------------------------------------------------
# PART F: DEMONSTRATE WHY SCALING MATTERS
#
# Remove the 1/√d_k scaling and see what happens to the distribution.
# This is why we scale — without it, large d_k causes attention collapse.
# -------------------------------------------------------

print("\n=== WHY WE SCALE BY 1/√d_k ===")
print()
print("Without scaling (large d_k → peaked softmax → vanishing gradients):")
print()

torch.manual_seed(0)
for d_k_test in [4, 16, 64, 256]:
    # Random Q and K of dimension d_k_test
    q = torch.randn(d_k_test)
    k = torch.randn(10, d_k_test)   # 10 key vectors
    
    # Unscaled dot products
    scores_unscaled = k @ q   # [10]
    probs_unscaled  = torch.softmax(scores_unscaled, dim=0)
    
    # Scaled dot products
    scores_scaled   = k @ q / math.sqrt(d_k_test)
    probs_scaled    = torch.softmax(scores_scaled, dim=0)
    
    # Measure how "peaked" the distribution is (max probability)
    # A very peaked distribution means one token gets all the attention
    # This is bad: gradients vanish for all other tokens
    max_unscaled = probs_unscaled.max().item()
    max_scaled   = probs_scaled.max().item()
    
    print(f"  d_k={d_k_test:4d}:")
    print(f"    Unscaled max prob: {max_unscaled:.4f}  {'← collapsed!' if max_unscaled > 0.9 else ''}")
    print(f"    Scaled   max prob: {max_scaled:.4f}  (more uniform, healthier gradients)")
    print()

print("As d_k grows, unscaled scores have larger variance.")
print("Softmax on high-variance inputs collapses to near-one-hot distributions.")
print("Dividing by √d_k normalizes the variance back to 1 regardless of d_k.")
```

---

## ✅ Check Your Understanding

1. The embedding lookup is "selecting a row from a matrix."
   When we do `E[token_id]`, what shape is the result?
   If we process a batch of 4 sequences, each 32 tokens long,
   what shape is the full embedding output?

2. We add token and position embeddings rather than concatenate.
   What would happen to the model dimension if we concatenated?
   Why is addition the right choice here?

3. The attention formula divides by √d_k.
   If d_k = 64, what is the scaling factor?
   Walk through: two random vectors of dimension 64, each with variance 1.
   What is the expected variance of their dot product?
   After dividing by √64, what is the variance?

4. The causal mask sets future positions to -∞ before softmax.
   After softmax, what probability do these positions get?
   Work through: exp(-∞) = ?

5. Multi-head attention uses n_heads=4, d_model=64, so d_head=16.
   After the reshape, Q has shape [B, 4, T, 16].
   After attention, we transpose and reshape to [B, T, 64].
   Trace through these shapes step by step.

---

## 🧪 Experiments

**Experiment 1: Embedding similarity after random init**
Create an EmbeddingLayer and look up embeddings for 'a', 'b', 'c', 'A', 'B', 'C'.
Compute cosine similarity between all pairs.
Are they random (near zero) or do similar characters cluster?
They should be nearly random before training.
After training (modules 08-09), come back and recheck.

**Experiment 2: Attention without masking**
Run MultiHeadAttention without a mask. Look at the weight matrix.
Is it symmetric? Should it be?
Then run it WITH the causal mask. How does the upper triangle change?

**Experiment 3: The effect of d_head**
Try d_model=64 with n_heads=1, 2, 4, 8, 16, 32.
What is d_head for each?
The total parameter count should stay the same (why?).
Does d_head=1 make sense? What is the model doing when d_head is very small?

**Experiment 4: Manual attention**
For a 4-token sequence, compute the attention weights by hand (with numpy).
Use: Q = eye(4) (identity), K = eye(4), V = some matrix you choose.
What should the attention weights be when Q and K are both the identity?
(Hint: the i-th query is the standard basis vector eᵢ. What is eᵢ · eⱼ?)

**Experiment 5: Gradient flow**
Create a simple test: input → embedding → attention → sum → loss.
Call loss.backward().
Check that gradients exist for the embedding weights.
Check that gradients exist for W_Q, W_K, W_V.
This confirms the full gradient pipeline works through attention.

---

> Move to Module 05 when you have done all experiments.
> We build the feed-forward network, layer normalization, and residual connections.
> Then we assemble everything into a complete transformer block.
