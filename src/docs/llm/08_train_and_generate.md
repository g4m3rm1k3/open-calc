# Module 08 — Train Your Model and Generate Text
### The full run. Watch it learn. Understand what comes out.

---

## How to Use This Module

Create two files:
- `08_train.py` — the complete training script, run once
- `08_generate.py` — generation and analysis, run after training

Type all model and training code from modules 04-07 into `08_train.py` first.
This is the final time you type all of it. After this you will modify it.

---

## PART 1 — Before You Run

---

### 1.1 How Long Will This Take?

With the default config below:
- CPU only, no GPU: 45-90 minutes for 5000 steps
- A basic gaming GPU: 5-15 minutes

You can reduce training time by using a smaller config:
- d_model=64, n_heads=2, n_layers=2: runs in ~10 minutes on CPU
- Results will be weaker but you will see learning happen

The model learns in stages:
- First 200 steps: character frequencies (common chars become common)
- Steps 200-1000: common sequences ("th", "the", "def")
- Steps 1000-3000: words and word boundaries
- Steps 3000-5000: style and structure

---

### 1.2 What "Good" Looks Like

After 5000 steps with d_model=128, n_layers=4:

```
Training log (expected):
     0   4.2764   4.2801    72.47   0.0000   0.00e+00    0.0s
   500   2.9341   3.0112    20.32   0.4821   3.00e-04   47.2s
  1000   2.5103   2.6244    13.79   0.3912   2.87e-04   46.8s
  2000   2.1892   2.3117    10.09   0.3201   2.51e-04   46.5s
  3000   1.9831   2.1743     8.79   0.2987   1.98e-04   46.9s
  5000   1.7923   2.0218     7.55   0.2654   3.00e-05   47.1s
```

Perplexity dropping from 72 → 7.5 means: the model went from
"equally likely to pick any of 72 characters" to "effectively choosing
between about 7-8 plausible next characters." That is real learning.

---

## PART 2 — The Training Script

```python
# 08_train.py
#
# Complete training script.
# Run this once to train your model.
#
# Type ALL code from modules 04-07 at the top first:
#   - gelu(), scaled_dot_product_attention(), make_causal_mask()
#   - LayerNorm, EmbeddingLayer, MultiHeadAttention, FeedForward
#   - TransformerBlock, GPT
#   - DataLoader, get_learning_rate(), clip_gradients()
#   - configure_optimizer(), train(), plot_training_curves()
#
# Then type the configuration and main script below.

import torch
import math
import json
import pickle
import time
import os

# [Paste all model and training code here]

# ============================================================
# CONFIGURATION
# ============================================================
#
# Choose based on your hardware:
#
# OPTION A — Fast test (CPU, ~10 min):
#   d_model=64, n_heads=2, n_layers=2, max_steps=2000
#   Perplexity will reach ~12-15
#   Good for verifying everything works
#
# OPTION B — Default (CPU, ~60 min or GPU ~10 min):
#   d_model=128, n_heads=4, n_layers=4, max_steps=5000
#   Perplexity will reach ~7-10
#   Good quality output
#
# OPTION C — Better quality (GPU recommended, ~30 min):
#   d_model=256, n_heads=8, n_layers=6, max_steps=10000
#   Perplexity will reach ~5-7
#   Noticeably better text quality

TRAINING_CONFIG = {
    # Model architecture
    'd_model':     128,      # embedding/hidden dimension
    'n_heads':     4,        # attention heads (d_model must be divisible by n_heads)
    'n_layers':    4,        # number of transformer blocks
    'max_seq_len': 256,      # maximum tokens per sequence
    'dropout':     0.1,      # dropout rate (set to 0.0 if overfitting is not an issue)

    # Training
    'batch_size':   32,      # sequences per gradient step
    'block_size':   128,     # tokens per sequence (must be <= max_seq_len)
    'max_steps':    5000,    # total gradient steps
    'eval_interval':500,     # evaluate on validation set every N steps
    'eval_steps':   50,      # batches to average for evaluation

    # Learning rate schedule
    'max_lr':       3e-4,    # peak learning rate (after warmup)
    'min_lr':       3e-5,    # final learning rate (at end of training)
    'warmup_steps': 200,     # steps to linearly warm up to max_lr

    # Regularization
    'weight_decay': 0.1,     # L2 regularization for weight matrices
    'grad_clip':    1.0,     # maximum gradient norm
}


# ============================================================
# SETUP
# ============================================================

# Reproducibility: same seed → same random weights → same starting point
# Remove this line if you want to explore different starting points
torch.manual_seed(42)

# Device selection
# 'cuda' = NVIDIA GPU (fastest)
# 'mps'  = Apple Silicon GPU (fast on Mac)
# 'cpu'  = CPU (slower but works everywhere)
if torch.cuda.is_available():
    device = 'cuda'
elif hasattr(torch.backends, 'mps') and torch.backends.mps.is_available():
    device = 'mps'
else:
    device = 'cpu'

print(f"Training on: {device}")
if device == 'cuda':
    print(f"GPU: {torch.cuda.get_device_name(0)}")
    print(f"GPU Memory: {torch.cuda.get_device_properties(0).total_memory / 1e9:.1f} GB")
print()


# ============================================================
# LOAD DATA AND TOKENIZER
# ============================================================

print("Loading data...")
with open('tokenizer.pkl', 'rb') as f:
    tok_data = pickle.load(f)

vocab_size = tok_data['vocab_size']
id_to_char = tok_data['id_to_char']
char_to_id = tok_data['char_to_id']
decode     = lambda ids:  ''.join(id_to_char[i] for i in ids)
encode     = lambda text: [char_to_id[c] for c in text if c in char_to_id]

train_data_raw = torch.load('train_data.pt')
val_data_raw   = torch.load('val_data.pt')

print(f"Vocabulary size: {vocab_size}")
print(f"Train tokens:    {len(train_data_raw):,}")
print(f"Val tokens:      {len(val_data_raw):,}")
print()


# ============================================================
# BUILD MODEL
# ============================================================

print("Building model...")
model = GPT(
    vocab_size  = vocab_size,
    d_model     = TRAINING_CONFIG['d_model'],
    n_heads     = TRAINING_CONFIG['n_heads'],
    n_layers    = TRAINING_CONFIG['n_layers'],
    max_seq_len = TRAINING_CONFIG['max_seq_len'],
    dropout     = TRAINING_CONFIG['dropout'],
).to(device)

n_params = model.count_parameters()
print(f"Parameters: {n_params:,}")
print()

# Save config for later use (generation, fine-tuning)
save_config = dict(TRAINING_CONFIG)
save_config['vocab_size']  = vocab_size
save_config['n_params']    = n_params
with open('model_config.json', 'w') as f:
    json.dump(save_config, f, indent=2)


# ============================================================
# BUILD DATA LOADERS
# ============================================================

train_loader = DataLoader(
    train_data_raw,
    block_size = TRAINING_CONFIG['block_size'],
    batch_size = TRAINING_CONFIG['batch_size'],
    device     = device,
)

val_loader = DataLoader(
    val_data_raw,
    block_size = TRAINING_CONFIG['block_size'],
    batch_size = TRAINING_CONFIG['batch_size'],
    device     = device,
)
print()


# ============================================================
# TRAIN
# ============================================================

print("Starting training...")
print("(Loss should decrease from ~4.2 toward ~2.0 over 5000 steps)")
print()

start_time = time.time()

train_losses, val_losses, grad_norms = train(
    model        = model,
    train_loader = train_loader,
    val_loader   = val_loader,
    config       = TRAINING_CONFIG,
    device       = device,
)

total_time = time.time() - start_time
print(f"\nTotal training time: {total_time/60:.1f} minutes")


# ============================================================
# SAVE FINAL MODEL
# ============================================================

torch.save({
    'model_state_dict': model.state_dict(),
    'config':           save_config,
    'char_to_id':       char_to_id,
    'id_to_char':       id_to_char,
    'train_losses':     train_losses,
    'val_losses':       val_losses,
    'grad_norms':       grad_norms,
}, 'trained_model.pt')

print("Saved: trained_model.pt")
print()


# ============================================================
# PLOT TRAINING CURVES
# ============================================================

plot_training_curves(train_losses, val_losses, grad_norms, TRAINING_CONFIG)
print()


# ============================================================
# GENERATE SOME SAMPLES TO SEE WHERE WE ARE
# ============================================================

print("=== SAMPLE GENERATIONS (after training) ===")
print()

sample_prompts = [
    ("\nHAMLET:\n",            "Shakespeare"),
    ("\nFIRST CITIZEN:\n",     "Shakespeare"),
    ("\ndef ",                  "Python"),
    ("\nclass ",                "Python"),
]

model.eval()
for prompt_text, label in sample_prompts:
    prompt_ids = torch.tensor([encode(prompt_text)], dtype=torch.long, device=device)
    
    generated  = model.generate(
        prompt_ids,
        max_new_tokens = 200,
        temperature    = 0.8,
        top_k          = 40,
    )
    
    text = decode(generated[0].tolist())
    print(f"--- {label} prompt: {repr(prompt_text)} ---")
    print(text[:400])
    print()
```

---

## PART 3 — Generation and Analysis

After training, create `08_generate.py` and type this.

```python
# 08_generate.py
#
# Analysis of what the trained model learned.
# Run this after 08_train.py has completed.

import torch
import torch.nn.functional as F
import math
import pickle
import json
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np

# [Type all model code from modules 04-06 here]
# (Same code as in 08_train.py)


# ============================================================
# LOAD THE TRAINED MODEL
# ============================================================

print("Loading trained model...")

checkpoint  = torch.load('trained_model.pt', map_location='cpu')
config      = checkpoint['config']
char_to_id  = checkpoint['char_to_id']
id_to_char  = checkpoint['id_to_char']

vocab_size = config['vocab_size']
encode     = lambda text: [char_to_id[c] for c in text if c in char_to_id]
decode     = lambda ids:  ''.join(id_to_char[i] for i in ids)

model = GPT(
    vocab_size  = vocab_size,
    d_model     = config['d_model'],
    n_heads     = config['n_heads'],
    n_layers    = config['n_layers'],
    max_seq_len = config['max_seq_len'],
)
model.load_state_dict(checkpoint['model_state_dict'])
model.eval()

print(f"Model loaded: {config['d_model']}d, {config['n_layers']} layers, "
      f"{config['vocab_size']} vocab")
print()
```

```python
# -------------------------------------------------------
# GENERATION WITH FULL CONTROL
# -------------------------------------------------------

def generate(model, prompt, max_tokens=200, temperature=1.0, top_k=None):
    """Generate text given a string prompt."""
    prompt_ids = torch.tensor([encode(prompt)], dtype=torch.long)
    with torch.no_grad():
        generated = model.generate(prompt_ids, max_tokens, temperature, top_k)
    return decode(generated[0].tolist())


# -------------------------------------------------------
# EXPERIMENT 1: TEMPERATURE EFFECT
#
# Same model, same prompt, different temperatures.
# Shows how temperature controls randomness.
# -------------------------------------------------------

print("=== EXPERIMENT 1: TEMPERATURE EFFECT ===")
print()
print("Same prompt, different temperatures. Watch how randomness changes.")
print()

prompt = "\nHAMLET:\nTo be, or not to be"

for temp in [0.3, 0.7, 1.0, 1.5]:
    torch.manual_seed(42)   # same seed so we can compare fairly
    text = generate(model, prompt, max_tokens=150, temperature=temp, top_k=40)
    print(f"--- Temperature = {temp} ---")
    print(text[:350])
    print()
```

```python
# -------------------------------------------------------
# EXPERIMENT 2: STYLE SWITCHING
#
# The model learned two styles: Shakespeare and Python.
# Show that it switches appropriately based on context.
# -------------------------------------------------------

print("=== EXPERIMENT 2: STYLE SWITCHING ===")
print()

style_prompts = [
    ("\nHAMLET:\n",         "Shakespeare starts here"),
    ("\ndef factorial(",    "Python function starts here"),
    ("\nFIRST CITIZEN:\n", "Shakespeare dialogue"),
    ("\nclass Node:\n",     "Python class"),
    ("\nACT III\n",         "Shakespeare act"),
    ("\nfor i in range(",   "Python loop"),
]

for prompt_text, description in style_prompts:
    torch.manual_seed(0)
    text = generate(model, prompt_text, max_tokens=120, temperature=0.7, top_k=30)
    print(f"--- {description} ---")
    print(text[:250])
    print()
```

```python
# -------------------------------------------------------
# EXPERIMENT 3: NEXT-TOKEN PROBABILITY DISTRIBUTION
#
# Show what the model "thinks" should come next.
# This reveals what the model has learned about context.
# -------------------------------------------------------

print("=== EXPERIMENT 3: NEXT TOKEN PROBABILITIES ===")
print()

def show_next_token_probs(model, context, top_n=15):
    """Show the probability distribution over next tokens."""
    ids     = torch.tensor([encode(context)], dtype=torch.long)
    
    with torch.no_grad():
        logits, _ = model(ids)
    
    # Get logits for the last position (what comes after the context)
    last_logits = logits[0, -1, :]   # [vocab_size]
    probs       = F.softmax(last_logits, dim=0)
    
    # Get top-n most likely next tokens
    top_probs, top_ids = probs.topk(top_n)
    
    print(f"Context: {repr(context[-40:])}")
    print(f"Top {top_n} next tokens:")
    print(f"  {'Token':12s}  {'Prob':>8}  {'Bar':}")
    
    for prob, idx in zip(top_probs, top_ids):
        token = decode([idx.item()])
        bar   = "█" * int(prob.item() * 50)
        print(f"  {repr(token):12s}  {prob.item():.4f}  {bar}")
    
    print()

# Shakespeare contexts
show_next_token_probs(model, "\nHAMLET:\nTo be, or not to ")
show_next_token_probs(model, "\nTo be, or not to be,")

# Python contexts
show_next_token_probs(model, "\ndef factorial(n):\n    if n <= 1:\n        return ")
show_next_token_probs(model, "\nfor i in range(")
show_next_token_probs(model, "\nclass ")
```

```python
# -------------------------------------------------------
# EXPERIMENT 4: ATTENTION PATTERNS
#
# Visualize what the model has learned to attend to.
# Each head should show a different pattern.
# -------------------------------------------------------

print("=== EXPERIMENT 4: ATTENTION PATTERNS ===")
print()

def get_attention_weights(model, text):
    """Run a forward pass and collect attention weights from all layers and heads."""
    ids = torch.tensor([encode(text)], dtype=torch.long)
    
    all_weights = []
    
    # We need to hook into the attention layers to collect weights
    # The cleanest way: temporarily modify the block's forward pass
    original_forwards = []
    
    def make_hook(layer_idx):
        def hook(self, x, mask=None):
            normed = self.ln1(x)
            attn_out, weights = self.attn(normed, mask)
            all_weights.append(weights.detach())   # save the weights
            x = x + attn_out
            x = x + self.ff(self.ln2(x))
            return x
        return hook
    
    # Register hooks
    hooks = []
    for i, block in enumerate(model.blocks):
        hook = block.register_forward_hook(make_hook(i))
        hooks.append(hook)
    
    # Forward pass
    with torch.no_grad():
        model(ids)
    
    # Remove hooks
    for hook in hooks:
        hook.remove()
    
    return all_weights, list(text)

# Analyze a short Shakespeare sentence
text_sample = "The cat sat on the mat"
try:
    weights_list, chars = get_attention_weights(model, text_sample)
    
    n_layers = len(weights_list)
    n_heads  = weights_list[0].shape[1]
    
    fig, axes = plt.subplots(n_layers, n_heads, figsize=(4 * n_heads, 4 * n_layers))
    if n_layers == 1:
        axes = [axes]
    if n_heads == 1:
        axes = [[ax] for ax in axes]
    
    for layer_idx, (layer_weights, layer_axes) in enumerate(zip(weights_list, axes)):
        for head_idx, ax in enumerate(layer_axes):
            w = layer_weights[0, head_idx].numpy()
            im = ax.imshow(w, cmap='Blues', vmin=0, vmax=w.max() + 1e-8)
            ax.set_title(f"Layer {layer_idx}, Head {head_idx}", fontsize=9)
            
            tick_positions = range(len(chars))
            ax.set_xticks(tick_positions)
            ax.set_xticklabels(chars, fontsize=6, rotation=90)
            ax.set_yticks(tick_positions)
            ax.set_yticklabels(chars, fontsize=6)
    
    plt.suptitle(
        f"Attention Patterns for: '{text_sample}'\n"
        "Each head has learned to attend to different relationships",
        fontsize=12
    )
    plt.tight_layout()
    plt.savefig("08a_attention_patterns.png", dpi=130)
    print(f"Saved: 08a_attention_patterns.png")
    print("Look for:")
    print("  - Diagonal patterns: attending to nearby characters (local)")
    print("  - Column patterns: all tokens attending to a specific token")
    print("  - Sparse patterns: attending to one or two specific positions")
    print()
except Exception as e:
    print(f"Attention visualization: {e}")
    print("(This requires the model hooks to work — skip if there are errors)")
```

```python
# -------------------------------------------------------
# EXPERIMENT 5: EMBEDDING SIMILARITY
#
# After training, similar characters should have similar embeddings.
# Check if the model learned meaningful character representations.
# -------------------------------------------------------

print("=== EXPERIMENT 5: EMBEDDING SIMILARITY ===")
print()

# Get the embedding weights (these are the learned character representations)
emb_weights = model.embedding.token_embedding.weight.detach()   # [vocab_size, d_model]

def cosine_sim(a, b):
    return (a @ b) / (a.norm() * b.norm() + 1e-8)

# Check similarity between character groups
print("Expected: similar characters (uppercase/lowercase) should be similar")
print("Expected: numbers should cluster together")
print("Expected: letters vs punctuation should be less similar")
print()

char_groups = [
    ("Uppercase letters", "ABCDEFGHIJKLMNOPQRSTUVWXYZ"),
    ("Lowercase letters", "abcdefghijklmnopqrstuvwxyz"),
    ("Digits",            "0123456789"),
    ("Punctuation",       ".,!?;:"),
    ("Python operators",  "()[]{}=+*-/"),
]

for group_name, chars_in_group in char_groups:
    # Get IDs for characters that exist in our vocabulary
    valid_chars = [c for c in chars_in_group if c in char_to_id]
    if len(valid_chars) < 2:
        continue
    valid_ids = [char_to_id[c] for c in valid_chars]
    
    # Compute average pairwise cosine similarity within the group
    group_vecs  = emb_weights[valid_ids]   # [n, d_model]
    similarities = []
    for i in range(len(valid_ids)):
        for j in range(i+1, len(valid_ids)):
            sim = cosine_sim(group_vecs[i], group_vecs[j]).item()
            similarities.append(sim)
    
    avg_sim = sum(similarities) / len(similarities)
    print(f"  {group_name:22s}: avg within-group cosine similarity = {avg_sim:.4f}")

print()
print("Higher values mean the model learned that these characters are similar.")
print("If all values are near 0, the model may need more training.")
```

```python
# -------------------------------------------------------
# EXPERIMENT 6: LOSS OVER TRAINING
#
# Analyze the training and validation loss curves.
# Diagnose what happened during training.
# -------------------------------------------------------

print("=== EXPERIMENT 6: TRAINING ANALYSIS ===")
print()

train_losses = checkpoint['train_losses']
val_losses   = checkpoint['val_losses']
grad_norms   = checkpoint['grad_norms']

eval_interval = config['eval_interval']
eval_steps    = [i * eval_interval for i in range(len(val_losses))]

# Statistics
final_train_loss = train_losses[-1]
final_val_loss   = val_losses[-1]
best_val_loss    = min(val_losses)
best_val_step    = val_losses.index(best_val_loss) * eval_interval
initial_loss     = train_losses[0]

print(f"Training summary:")
print(f"  Initial loss:       {initial_loss:.4f}  (perplexity: {math.exp(initial_loss):.1f})")
print(f"  Final train loss:   {final_train_loss:.4f}  (perplexity: {math.exp(final_train_loss):.1f})")
print(f"  Final val loss:     {final_val_loss:.4f}  (perplexity: {math.exp(final_val_loss):.1f})")
print(f"  Best val loss:      {best_val_loss:.4f}  (perplexity: {math.exp(best_val_loss):.1f})")
print(f"  Best val at step:   {best_val_step}")
print()

# Check for overfitting
gap = final_val_loss - final_train_loss
if gap > 0.5:
    print(f"  WARNING: Large train/val gap ({gap:.3f}) suggests overfitting.")
    print(f"  Try: higher dropout, more training data, or smaller model.")
elif gap > 0.2:
    print(f"  Note: Moderate train/val gap ({gap:.3f}) — some overfitting, normal for small models.")
else:
    print(f"  Good: Small train/val gap ({gap:.3f}) — model generalizes well.")

print()

# Check if training was stable
max_grad = max(grad_norms)
avg_grad = sum(grad_norms) / len(grad_norms)
print(f"  Gradient norm statistics:")
print(f"    Average: {avg_grad:.4f}")
print(f"    Maximum: {max_grad:.4f}  {'← large spike detected' if max_grad > 5 else ''}")
print(f"    Fraction clipped: {sum(1 for g in grad_norms if g > 0.99) / len(grad_norms):.1%}")

# Detailed plot
fig, axes = plt.subplots(2, 2, figsize=(13, 9))

# Loss
axes[0,0].plot(train_losses, color='steelblue', lw=1.0, alpha=0.5, label='Train')
axes[0,0].plot(eval_steps, val_losses, color='tomato', lw=2.5, label='Val')
axes[0,0].set_xlabel("Step"); axes[0,0].set_ylabel("Loss")
axes[0,0].set_title("Training and Validation Loss")
axes[0,0].legend(); axes[0,0].grid(True, alpha=0.3)

# Loss (log scale — shows early vs late learning clearly)
axes[0,1].semilogy(train_losses, color='steelblue', lw=1.0, alpha=0.5, label='Train')
axes[0,1].semilogy(eval_steps, val_losses, color='tomato', lw=2.5, label='Val')
axes[0,1].set_xlabel("Step"); axes[0,1].set_ylabel("Loss (log scale)")
axes[0,1].set_title("Loss (Log Scale)")
axes[0,1].legend(); axes[0,1].grid(True, alpha=0.3)

# Perplexity
axes[1,0].plot([math.exp(l) for l in val_losses], color='tomato', lw=2.5)
axes[1,0].axhline(vocab_size, color='gray', linestyle='--', alpha=0.5,
                   label=f'Random baseline ({vocab_size})')
axes[1,0].set_xlabel(f"Evaluation (every {eval_interval} steps)")
axes[1,0].set_ylabel("Perplexity")
axes[1,0].set_title("Validation Perplexity")
axes[1,0].legend(); axes[1,0].grid(True, alpha=0.3)

# Gradient norms
axes[1,1].plot(grad_norms, color='purple', lw=1.0, alpha=0.7)
axes[1,1].axhline(1.0, color='red', linestyle='--', alpha=0.7, label='Clip threshold')
axes[1,1].set_xlabel("Step"); axes[1,1].set_ylabel("Gradient Norm")
axes[1,1].set_title("Gradient Norm Over Training")
axes[1,1].legend(); axes[1,1].grid(True, alpha=0.3)
axes[1,1].set_ylim(0, min(max(grad_norms) * 1.2, 4.0))

plt.suptitle(f"Training Analysis — {config['d_model']}d, {config['n_layers']} layers, "
             f"{config['max_steps']} steps", fontsize=12)
plt.tight_layout()
plt.savefig("08b_training_analysis.png", dpi=130)
print(f"\nSaved: 08b_training_analysis.png")
```

```python
# -------------------------------------------------------
# EXPERIMENT 7: GENERATE LONGER TEXT
#
# See what the model can produce when given room to run.
# -------------------------------------------------------

print("\n=== EXPERIMENT 7: LONG-FORM GENERATION ===")
print()

print("--- SHAKESPEARE (600 tokens) ---")
shak_text = generate(model, "\nHAMLET:\n", max_tokens=600,
                     temperature=0.8, top_k=40)
print(shak_text)

print()
print("--- PYTHON CODE (600 tokens) ---")
code_text = generate(model, "\ndef ", max_tokens=600,
                     temperature=0.7, top_k=30)
print(code_text)
```

---

## PART 4 — Understanding What the Model Learned

---

### 4.1 Interpreting the Training Curves

**Loss drops quickly then slowly:**
Normal. Early training captures easy patterns (character frequencies, common pairs).
Later training captures harder patterns (long-range dependencies, style).

**Val loss slightly above train loss:**
Normal. Training data is seen many times; validation data is unseen.
The gap should be small (< 0.3) for our model size.

**Gradient norm spikes:**
Normal. Some batches have surprising sequences — the model has to make a
larger update. After clipping, the actual update is bounded.

**Perplexity stopped improving:**
The model has learned everything it can from its current size and data.
To improve: scale up d_model/n_layers, add more data, or train longer.

---

### 4.2 What the Model Cannot Do (Yet)

After training, your model will:
- Generate recognizable Shakespeare dialogue structure
- Generate syntactically plausible Python code
- Switch styles based on context

Your model will NOT:
- Generate semantically correct Python (variables will be inconsistent)
- Generate long coherent Shakespeare speeches
- Follow any kind of instruction
- Answer questions

Why not? Size and data.
GPT-4 has ~1 trillion parameters and was trained on essentially the entire internet.
Your model has ~2 million parameters and ~1.5 million characters.

The architecture is the same. Only scale differs.

---

## ✅ Check Your Understanding

1. The training loss is always lower than the validation loss.
   If you saw validation loss LOWER than training loss, what would that indicate?
   Is that possible? Under what circumstances?

2. After training, you generate with temperature=0.7 and top_k=40.
   Describe in terms of the probability distribution what these do:
   - Temperature 0.7 makes the distribution: ___
   - Top-k 40 means we only sample from: ___

3. Perplexity went from 72 (random) to 7.5 (trained).
   In concrete terms: for a random model, the model was equally uncertain
   between all 72 characters. After training, what does perplexity=7.5 mean?

4. You notice that after 3000 steps, validation loss stops decreasing
   but training loss keeps going down.
   Name two possible causes.
   Name one thing you could change in TRAINING_CONFIG to address each.

5. The model generates Python code that has correct indentation
   but incorrect logic (uses undefined variables, nonsensical conditions).
   Is this a training failure? Or is it a fundamental limitation?
   What would need to change to get logically correct code?

---

## 🧪 Experiments

**Experiment 1: Unconditional generation**
Generate with no prompt — just a single newline character.
What style does the model default to? Shakespeare or Python?
Look at the proportions in the training data (module 03).
Does the model's default reflect the data proportions?

**Experiment 2: Greedy vs sampled**
Generate 10 sequences with temperature=0.01 (nearly greedy).
Generate 10 sequences with temperature=1.0.
Count the unique characters in each set of 100-token generations.
Plot: temperature vs diversity. At what temperature does diversity collapse?

**Experiment 3: Context length effect**
Generate text with prompts of length 5, 20, 50, 100 characters.
Does longer context help the model stay on style?
Try prompting with Python code then adding one Shakespeare line.
Does the model switch styles?

**Experiment 4: What did the model memorize?**
Take 20 exact phrases from the training text (copy them exactly).
Feed them as prompts. Does the model continue them accurately?
Take 20 phrases from the VALIDATION text (not seen during training).
Is the continuation quality different?

**Experiment 5: Scaling experiment**
If you have time, train two more models:
- Tiny: d_model=32, n_layers=2, n_heads=2
- Large: d_model=256, n_layers=6, n_heads=8
Compare final perplexity.
Generate text from each. Is the quality difference visible?

---

> Move to Module 09 when you have trained your model and run the analysis.
> We cover quantization and LoRA — making models efficient.
> These are the techniques that let you run and fine-tune large models
> on the hardware you actually have.
