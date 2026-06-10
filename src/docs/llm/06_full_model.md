# Module 06 — The Complete GPT Model
### Stack everything. Add the output head. Generate text.

---

## How to Use This Module

Create `06_full_model.py`.
This file will contain ALL code from modules 04 and 05 at the top,
then the new code here. Type everything.

This is the culmination of modules 01-05.
By the end, you have a complete language model that can generate text.
It is untrained, so the text will be random — but the architecture is complete.

---

## PART 1 — The Complete Architecture

---

### 1.1 What We Have, What We Need

So far you have built:
- Tokenizer: text → integers
- Embedding layer: integers → vectors
- Multi-head attention: tokens communicate
- Feed-forward network: tokens compute
- Layer normalization: keeps training stable
- Residual connections: gradient flow through depth
- Transformer block: attention + FFN + norms + residuals

What we still need to build:
- The full GPT class that stacks N blocks
- The output head that maps vectors to vocabulary scores
- The generation algorithm that samples text token by token

---

### 1.2 The Full Architecture

```
Input:  token IDs    [batch, seq_len]

    ↓
Embedding Layer      [batch, seq_len, d_model]
(token + position)

    ↓ (repeated N times)
┌─────────────────────────────────┐
│  TransformerBlock               │
│   LayerNorm → Attention → +x    │  [batch, seq_len, d_model]
│   LayerNorm → FFN → +x          │
└─────────────────────────────────┘

    ↓
Final LayerNorm      [batch, seq_len, d_model]

    ↓
LM Head (Linear)     [batch, seq_len, vocab_size]
(maps d_model → vocab_size)

Output: logits       [batch, seq_len, vocab_size]
```

The output gives us, for each position in the sequence,
a score for every possible next token.
We convert these to probabilities with softmax.

---

### 1.3 Weight Tying

The token embedding matrix has shape `[vocab_size, d_model]`.
The LM head (output projection) has shape `[d_model, vocab_size]`.

These are transposes of each other — same information, flipped.

The embedding maps: token → vector ("what vector represents this token?")
The LM head maps: vector → token scores ("what token does this vector predict?")

It makes sense for these to use the same learned representation.
In practice: sharing weights works better AND saves parameters.

Implementation: `lm_head.weight = token_embedding.weight`
Now there is ONE matrix, used for both operations.

---

### 1.4 Text Generation — The Autoregressive Loop

The model predicts probability distributions, not text.
To generate text, we sample from those distributions one token at a time.

**The loop:**
1. Start with a prompt (some token IDs)
2. Run the model → get logits for the last position
3. Convert to probabilities (softmax)
4. Sample one token from the distribution
5. Append that token to the sequence
6. Go to step 2 with the extended sequence

This is called **autoregressive generation** — each token is generated
one at a time, and each new token is conditioned on all previous tokens.

---

### 1.5 Temperature and Top-K Sampling

**Temperature:**
Before converting logits to probabilities, we divide by temperature T.

```
probabilities = softmax(logits / T)
```

- T = 1.0: use the model's raw probabilities (default)
- T < 1.0: divide by something < 1 → larger scaled logits → more peaked distribution → more predictable, repetitive text
- T > 1.0: divide by something > 1 → smaller scaled logits → flatter distribution → more random, creative text

**Top-K:**
Instead of sampling from all vocab_size tokens, only consider the top K most likely.
Set all others to -∞ before softmax.

This prevents the model from ever generating very unlikely tokens.
Even with high temperature, you can avoid completely nonsensical characters.

**Why these controls matter:**
- For code generation: low temperature (you want predictable, correct syntax)
- For creative writing: medium temperature (balanced between coherence and variety)
- For brainstorming: high temperature (maximize diversity)
- Top-K=1: always pick the most likely token (greedy decoding, no randomness)

---

## PART 2 — Writing the Code

```python
# 06_full_model.py
#
# The complete GPT model.
# Type ALL code from modules 04 and 05 first:
#   - gelu()
#   - scaled_dot_product_attention()
#   - make_causal_mask()
#   - LayerNorm
#   - EmbeddingLayer
#   - MultiHeadAttention
#   - FeedForward
#   - TransformerBlock
#
# Then type the new code below.

import torch
import torch.nn as nn
import torch.nn.functional as F
import math
import pickle
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

# [Type all code from modules 04 and 05 here]
# This repetition is intentional — it builds fluency with the code
```

```python
# -------------------------------------------------------
# THE COMPLETE GPT MODEL
#
# Plain English:
#   1. Embed tokens (identity + position)
#   2. Pass through N transformer blocks
#   3. Apply final LayerNorm
#   4. Project to vocabulary scores (LM head)
#   5. If targets given: compute cross-entropy loss
# -------------------------------------------------------

class GPT(nn.Module):
    """
    A complete GPT-style language model.
    
    Input:  token IDs [batch, seq_len]
    Output: logits    [batch, seq_len, vocab_size]
            loss      scalar (if targets provided)
    
    During training:   call model(input_ids, targets) to get loss
    During generation: call model.generate(prompt_ids, n_tokens)
    """
    
    def __init__(self, vocab_size, d_model, n_heads, n_layers,
                 max_seq_len, dropout=0.1):
        super().__init__()
        
        # Store hyperparameters so we can save and reload the model later
        self.vocab_size  = vocab_size
        self.d_model     = d_model
        self.n_heads     = n_heads
        self.n_layers    = n_layers
        self.max_seq_len = max_seq_len
        
        # ---- Embedding layer ----
        # This handles both token and position embeddings
        self.embedding = EmbeddingLayer(vocab_size, d_model, max_seq_len, dropout)
        
        # ---- Transformer blocks ----
        # nn.ModuleList: a list of modules that PyTorch knows to register
        # If we used a plain Python list, PyTorch would not track these
        # parameters and they would not get trained
        self.blocks = nn.ModuleList([
            TransformerBlock(d_model, n_heads, dropout)
            for _ in range(n_layers)   # create n_layers identical blocks
        ])
        
        # ---- Final layer normalization ----
        # Applied to the output of the last transformer block
        # before the LM head
        self.ln_final = LayerNorm(d_model)
        
        # ---- Language model head ----
        # Projects from d_model to vocab_size
        # No bias: empirically works better without it
        self.lm_head = nn.Linear(d_model, vocab_size, bias=False)
        
        # ---- Weight tying ----
        # Share weights between token embedding and LM head
        # They have the same shape (transposed), same semantic role
        # This reduces parameters and improves training
        # After this line: lm_head.weight and embedding.token_embedding.weight
        # point to the SAME underlying tensor
        self.lm_head.weight = self.embedding.token_embedding.weight
        
        # ---- Initialize weights ----
        # Apply _init_weights to every module in the model
        # This sets weights to small random values and zeros biases
        self.apply(self._init_weights)
        
        # ---- Special initialization for residual projections ----
        # The output projections of attention (W_O) and FFN (linear2)
        # contribute to the residual stream at every layer.
        # With n_layers layers, each position gets n_layers additions.
        # Scale down by 1/√(2 × n_layers) to keep the residual stream
        # from growing too large at initialization.
        # The 2 accounts for both attention and FFN blocks per layer.
        scale_factor = 1.0 / math.sqrt(2 * n_layers)
        for name, param in self.named_parameters():
            if 'W_O' in name or 'linear2' in name:
                nn.init.normal_(param, mean=0.0, std=0.02 * scale_factor)
    
    def _init_weights(self, module):
        """
        Initialize weights for all module types.
        Called by self.apply() which recursively applies this to all submodules.
        """
        if isinstance(module, nn.Linear):
            # Linear layer weights: small random normal
            # std=0.02 is the standard GPT-2 initialization
            nn.init.normal_(module.weight, mean=0.0, std=0.02)
            if module.bias is not None:
                # Biases start at zero
                nn.init.zeros_(module.bias)
        elif isinstance(module, nn.Embedding):
            # Embedding weights: same small random normal
            nn.init.normal_(module.weight, mean=0.0, std=0.02)
    
    def forward(self, token_ids, targets=None):
        """
        Forward pass: compute logits and optionally the loss.
        
        token_ids: [batch, seq_len]  — integer token IDs
        targets:   [batch, seq_len]  — optional, for computing training loss
                   targets[b, t] = the correct next token at position t
        
        Returns:
          logits: [batch, seq_len, vocab_size]  — raw scores for next token
          loss:   scalar or None  — cross-entropy loss if targets provided
        """
        batch, seq_len = token_ids.shape
        
        # Check we are within the supported sequence length
        if seq_len > self.max_seq_len:
            raise ValueError(
                f"Input has {seq_len} tokens but model supports max {self.max_seq_len}. "
                f"Crop the input or increase max_seq_len."
            )
        
        # Step 1: Embed tokens
        # token_ids [batch, seq_len] → x [batch, seq_len, d_model]
        x = self.embedding(token_ids)
        
        # Step 2: Build causal mask
        # This prevents each token from attending to future tokens
        # We build it once and reuse it for all blocks
        # device=token_ids.device ensures it is on the same device (CPU/GPU)
        mask = make_causal_mask(seq_len, device=token_ids.device)
        
        # Step 3: Pass through transformer blocks
        # Each block transforms x in place (with residuals, shape is preserved)
        for block in self.blocks:
            x = block(x, mask)
        
        # Step 4: Final layer normalization
        x = self.ln_final(x)
        
        # Step 5: LM head — project to vocabulary scores
        # [batch, seq_len, d_model] → [batch, seq_len, vocab_size]
        logits = self.lm_head(x)
        
        # Step 6: Compute loss if targets are provided
        loss = None
        if targets is not None:
            # F.cross_entropy expects:
            #   input:  [N, C] where C is number of classes
            #   target: [N]    where each value is in [0, C)
            #
            # Our logits are [batch, seq_len, vocab_size].
            # We flatten batch and seq_len into one dimension:
            # [batch × seq_len, vocab_size]
            # This treats each position as an independent prediction.
            #
            # Similarly, targets [batch, seq_len] → [batch × seq_len]
            loss = F.cross_entropy(
                logits.view(-1, self.vocab_size),   # [batch*seq_len, vocab_size]
                targets.view(-1)                    # [batch*seq_len]
            )
        
        return logits, loss
    
    @torch.no_grad()
    def generate(self, prompt_ids, max_new_tokens, temperature=1.0, top_k=None):
        """
        Generate text autoregressively.
        
        prompt_ids:     [1, prompt_len]  — the starting tokens
        max_new_tokens: how many new tokens to generate
        temperature:    > 1 = more random, < 1 = more predictable
        top_k:          if set, only sample from top k most likely tokens
        
        Returns: [1, prompt_len + max_new_tokens]  — all tokens including prompt
        
        @torch.no_grad(): this decorator disables gradient tracking
        We do not need gradients during generation — only during training.
        This saves memory and speeds up generation.
        """
        # Switch to eval mode: disables dropout, which is training-only
        self.eval()
        
        # Start with the prompt
        idx = prompt_ids.clone()   # [1, prompt_len]
        
        for _ in range(max_new_tokens):
            # Step A: Crop if sequence is too long
            # The model can only handle max_seq_len tokens at once
            # We keep the most recent tokens if we exceed the limit
            if idx.shape[1] > self.max_seq_len:
                idx_input = idx[:, -self.max_seq_len:]
            else:
                idx_input = idx
            
            # Step B: Forward pass
            # We get logits for every position, but only care about the last one
            # (predicting what comes after the current sequence)
            logits, _ = self(idx_input)
            # logits: [1, seq_len, vocab_size]
            
            # Step C: Get logits for the last position only
            last_logits = logits[:, -1, :]   # [1, vocab_size]
            
            # Step D: Apply temperature scaling
            # Dividing by temperature BEFORE softmax is mathematically correct
            # Low temperature → sharper distribution (more confident)
            # High temperature → flatter distribution (more random)
            last_logits = last_logits / temperature
            
            # Step E: Optional top-K filtering
            # Keep only the top K logits, set all others to -infinity
            # After softmax, -infinity → probability 0
            if top_k is not None:
                # Get the k-th largest logit value
                k_clamped  = min(top_k, last_logits.shape[-1])
                top_values, _ = torch.topk(last_logits, k_clamped)
                threshold   = top_values[:, -1:]  # the smallest of the top-k values
                # Set all logits below threshold to -infinity
                last_logits = last_logits.masked_fill(
                    last_logits < threshold,
                    float('-inf')
                )
            
            # Step F: Convert logits to probabilities
            probs = F.softmax(last_logits, dim=-1)   # [1, vocab_size]
            
            # Step G: Sample one token from the distribution
            # torch.multinomial: sample from a distribution
            # num_samples=1: sample one token
            next_token = torch.multinomial(probs, num_samples=1)   # [1, 1]
            
            # Step H: Append to sequence
            idx = torch.cat([idx, next_token], dim=1)
            # idx grows by one token each iteration
        
        return idx   # [1, prompt_len + max_new_tokens]
    
    def count_parameters(self):
        """Return total number of trainable parameters."""
        return sum(p.numel() for p in self.parameters() if p.requires_grad)
    
    def parameter_breakdown(self):
        """Print a breakdown of parameters by component."""
        print(f"\nParameter breakdown:")
        print(f"{'Component':45s}  {'Shape':20s}  {'Count':>10}")
        print("-" * 80)
        total = 0
        for name, param in self.named_parameters():
            count = param.numel()
            total += count
            print(f"  {name:43s}  {str(tuple(param.shape)):20s}  {count:>10,}")
        print("-" * 80)
        print(f"  {'TOTAL':43s}  {'':20s}  {total:>10,}")
        return total
```

```python
# -------------------------------------------------------
# BUILD AND TEST THE MODEL
# -------------------------------------------------------

# Load tokenizer
with open('tokenizer.pkl', 'rb') as f:
    tok_data   = pickle.load(f)

vocab_size  = tok_data['vocab_size']
char_to_id  = tok_data['char_to_id']
id_to_char  = tok_data['id_to_char']

encode = lambda text: [char_to_id[c] for c in text if c in char_to_id]
decode = lambda ids:  ''.join(id_to_char[i] for i in ids)

# Model configuration
# This is a "small" model for learning. GPT-2 uses n_layers=12, d_model=768.
model_config = {
    'vocab_size':   vocab_size,
    'd_model':      128,
    'n_heads':      4,
    'n_layers':     4,
    'max_seq_len':  256,
    'dropout':      0.1,
}

torch.manual_seed(42)
model = GPT(**model_config)

print("=== MODEL BUILT ===")
print()
print(f"Architecture:")
print(f"  vocab_size:   {model_config['vocab_size']}")
print(f"  d_model:      {model_config['d_model']}")
print(f"  n_heads:      {model_config['n_heads']}")
print(f"  n_layers:     {model_config['n_layers']}")
print(f"  max_seq_len:  {model_config['max_seq_len']}")
print()

total_params = model.parameter_breakdown()
print()
print(f"Compare to famous models:")
print(f"  Your model:  {total_params:>12,}")
print(f"  GPT-2 small: {117_000_000:>12,}  (117M)")
print(f"  GPT-3:       {175_000_000_000:>12,}  (175B)")
print()
print(f"Your model is small but the architecture is IDENTICAL to GPT-3.")
print(f"Only scale differs.")
```

```python
# -------------------------------------------------------
# TEST THE FORWARD PASS
# -------------------------------------------------------

# Create a batch of fake inputs
batch_size = 4
seq_len    = 32

dummy_ids     = torch.randint(0, vocab_size, (batch_size, seq_len))
dummy_targets = torch.randint(0, vocab_size, (batch_size, seq_len))

logits, loss = model(dummy_ids, targets=dummy_targets)

print("=== FORWARD PASS TEST ===")
print()
print(f"Input token IDs:  {dummy_ids.shape}")
print(f"Logits:           {logits.shape}")
print(f"  (one score per vocabulary token per position)")
print()
print(f"Loss: {loss.item():.4f}")
print(f"Expected baseline loss: {math.log(vocab_size):.4f}  (= log(vocab_size))")
print(f"Expected baseline perplexity: {vocab_size:.0f}  (= vocab_size)")
print()
print(f"Loss is close to baseline — model is random, as expected.")
print(f"After training, loss will drop to ~1.5-2.5.")

# Verify weight tying
print()
print("=== WEIGHT TYING VERIFICATION ===")
emb_weight  = model.embedding.token_embedding.weight
head_weight = model.lm_head.weight
same_object = emb_weight is head_weight   # Python identity check
print(f"Embedding and LM head share the same weight tensor: {same_object}")
print(f"Embedding weight data_ptr: {emb_weight.data_ptr()}")
print(f"LM head weight data_ptr:   {head_weight.data_ptr()}")
print(f"(Same memory address → same tensor)")
```

```python
# -------------------------------------------------------
# TEST GENERATION (BEFORE TRAINING — WILL BE RANDOM)
# -------------------------------------------------------

print("\n=== GENERATION TEST (UNTRAINED) ===")
print("Output will be random — the model has not learned anything yet.")
print("After training, this will be recognizable text.")
print()

prompts = [
    "HAMLET:\n",
    "\ndef ",
    "To be or",
    "\nclass ",
]

for prompt in prompts:
    # Encode the prompt
    prompt_ids = torch.tensor([encode(prompt)], dtype=torch.long)
    
    # Generate 80 new tokens
    generated_ids = model.generate(
        prompt_ids,
        max_new_tokens = 80,
        temperature    = 0.8,
        top_k          = 40,
    )
    
    # Decode the full sequence (prompt + generated)
    generated_text = decode(generated_ids[0].tolist())
    
    print(f"--- Prompt: {repr(prompt)} ---")
    print(generated_text)
    print()
```

```python
# -------------------------------------------------------
# VISUALIZE HOW THE MODEL GROWS WITH SCALE
# -------------------------------------------------------

# Show how parameters scale with d_model and n_layers
configs = [
    ("Tiny (yours, learning)",     64,  2, 2, 128),
    ("Small (yours, training)",   128,  4, 4, 256),
    ("Medium (good quality)",     256,  8, 6, 512),
    ("GPT-2 small (117M)",        768, 12, 12, 1024),
    ("GPT-2 large (774M)",       1280, 20, 36, 1024),
]

print("\n=== MODEL SIZE COMPARISON ===")
print()
print(f"{'Configuration':30s}  {'d_model':>8}  {'heads':>6}  {'layers':>7}  {'Parameters':>14}")
print("-" * 75)

for name, dm, nh, nl, msl in configs:
    # Approximate parameter count without building the full model
    # Embedding: vocab_size × d_model (one matrix)
    # Per block: 4 attention matrices (4 × d_model²) + 2 FFN matrices (2 × 4 × d_model²)
    # = 12 × d_model²
    # LM head: shared with embedding (0 extra params)
    embed_params  = vocab_size * dm
    block_params  = 12 * dm * dm
    total_params  = embed_params + nl * block_params
    
    print(f"  {name:28s}  {dm:>8}  {nh:>6}  {nl:>7}  {total_params:>14,}")

print()
print("Each doubling of d_model × 4× the parameters (it appears quadratically).")
print("This is why large models are expensive — but your architecture is the same.")
```

```python
# -------------------------------------------------------
# SAVE THE MODEL STRUCTURE FOR LATER MODULES
# -------------------------------------------------------

# We save the config so we can rebuild the model in training/generation modules
import json

model_config_with_vocab = dict(model_config)
model_config_with_vocab['vocab_size'] = vocab_size

with open('model_config.json', 'w') as f:
    json.dump(model_config_with_vocab, f, indent=2)

print("\n=== SAVED ===")
print("model_config.json  — architecture hyperparameters")
print()
print("To rebuild the model:")
print("  import json")
print("  with open('model_config.json') as f:")
print("      config = json.load(f)")
print("  model = GPT(**config)")
```

---

## PART 3 — Understanding What the Model Has Learned (Before and After Training)

---

### 3.1 The Untrained Model

Right now, your model:
- Has random weights (Gaussian, std=0.02)
- Produces nearly uniform probability distributions
- Assigns roughly equal probability to every token as the next one
- Has loss ≈ log(vocab_size) and perplexity ≈ vocab_size

If you run generation now, you get random-looking character sequences.
The model has no idea what text looks like.

---

### 3.2 What Training Will Change

During training (module 08), gradient descent will adjust every weight.
The model will learn, in order:

**Early training (loss drops from 4.2 to ~3.0):**
- Character frequency: the model learns which characters are common
- It will start generating spaces and 'e' and 't' more than 'z' and 'q'

**Mid training (loss drops from ~3.0 to ~2.0):**
- Common character sequences: "th", "he", "in", "er", "an"
- Word boundaries: spaces appear in reasonable places
- The model starts generating recognizable English words

**Late training (loss drops from ~2.0 to ~1.5):**
- Word patterns: common words appear correctly
- Sentence structure: full stops at reasonable intervals
- Style: Shakespeare section generates dialogue, Python section generates code
- The model knows "HAMLET:" is followed by speech, not code

**What limits quality:**
- Model size: our model has ~2M parameters. GPT-2 has 117M. GPT-3 has 175B.
- Data: we have ~1.5M characters. Real models use trillions.
- Training time: we run ~5000 steps. Real models run millions.

---

## ✅ Check Your Understanding

1. Weight tying: the embedding matrix and LM head share weights.
   During the forward pass, the embedding looks up rows.
   During the backward pass, gradients flow back to the embedding.
   But the LM head also computes a matrix multiply using the same weights.
   Do gradients flow back through BOTH uses?
   What does that mean for how the embeddings are trained?

2. The final LayerNorm is applied AFTER all transformer blocks.
   Why is it needed here if each block already has LayerNorm inside it?
   (Hint: what does the last residual addition do to the distribution?)

3. In generate(), we use `@torch.no_grad()`.
   If we removed this, would the model still produce correct output?
   What would be different? (Hint: memory usage.)

4. Temperature = 0.5 makes logits larger before softmax (we divide by 0.5 = multiply by 2).
   Walk through: if the top logit is 3.0 and the second is 2.0,
   what are the softmax probabilities at T=1.0? At T=0.5?
   Which gives a more peaked distribution?

5. Top-K sampling: we set all logits below the K-th highest to -∞.
   What happens when K=1? What is this called?
   What happens when K=vocab_size? How is this different from standard sampling?

---

## 🧪 Experiments

**Experiment 1: Baseline loss verification**
Run the model on 100 random batches of random token IDs.
Compute the average loss. It should be very close to log(vocab_size).
Now run on 100 batches of REAL token IDs from train_data.pt.
Is the loss the same? Should it be?
(For an untrained model, the content of the input should not matter.)

**Experiment 2: Scale your model**
Build three versions:
- Tiny: d_model=32, n_heads=2, n_layers=2
- Small: d_model=128, n_heads=4, n_layers=4
- Medium: d_model=256, n_heads=8, n_layers=6
Count parameters for each.
Run the forward pass. Are the losses similar? Should they be?

**Experiment 3: Temperature exploration**
Generate 10 sequences from the same prompt with temperatures:
0.1, 0.3, 0.5, 0.8, 1.0, 1.5, 2.0.
For each, count how many unique characters appear in 100 generated tokens.
Plot temperature vs character diversity.
The pattern reveals the temperature-diversity relationship.

**Experiment 4: Weight tying effect**
Build two models — one with weight tying, one without.
Count their parameters. How many parameters does tying save?
For our model size (vocab_size ≈ 72, d_model=128):
Embedding matrix: 72 × 128 = how many parameters?
With tying: is that 0 extra for the LM head or something else?

**Experiment 5: Gradient checkpoint**
Check that all parameters get gradients after a backward pass.
For a random batch:
```
logits, loss = model(dummy_ids, dummy_targets)
loss.backward()
for name, param in model.named_parameters():
    has_grad = param.grad is not None
    print(f"{name}: {has_grad}")
```
Are there any parameters with no gradient?
If so, what are they and why?

---

> Move to Module 07 when all experiments are done.
> We build the complete training infrastructure:
> the data loader, learning rate schedule, optimizer,
> gradient clipping, and the training loop.
