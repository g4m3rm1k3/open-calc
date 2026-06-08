# Module 06 — Build and Train nanoGPT

> **The big idea:** Train the GPT we built in module 05 on Shakespeare. Watch it learn spelling → words → sentences → style. This is the most satisfying part.

---

## 6.1 Get the Data

We'll train a **character-level** language model on Shakespeare. The model predicts the next character given the previous N characters.

```python
import os
import requests

# Download Shakespeare
url  = "https://raw.githubusercontent.com/karpathy/char-rnn/master/data/tinyshakespeare/input.txt"
path = "shakespeare.txt"

if not os.path.exists(path):
    print("Downloading Shakespeare...")
    text = requests.get(url).text
    with open(path, 'w') as f:
        f.write(text)
    print(f"Downloaded {len(text):,} characters")
else:
    with open(path) as f:
        text = f.read()
    print(f"Loaded {len(text):,} characters")

print(f"\nSample:\n{text[:300]}")
```

---

## 6.2 Build a Character-Level Tokenizer

```python
# Character-level: every unique character is one token
chars = sorted(set(text))
vocab_size = len(chars)
print(f"Vocabulary size: {vocab_size} characters")
print(f"Characters: {''.join(chars)}")

# Encode/decode functions
char_to_id = {c: i for i, c in enumerate(chars)}
id_to_char = {i: c for i, c in enumerate(chars)}

encode = lambda s: [char_to_id[c] for c in s]
decode = lambda ids: ''.join(id_to_char[i] for i in ids)

# Test roundtrip
sample = "Hello, World!"
encoded = encode(sample)
decoded = decode(encoded)
print(f"\nOriginal:  {sample}")
print(f"Encoded:   {encoded}")
print(f"Decoded:   {decoded}")
assert sample == decoded, "Roundtrip failed!"
```

---

## 6.3 Prepare the Dataset

```python
import torch
import numpy as np

# Encode the entire text
data = torch.tensor(encode(text), dtype=torch.long)
print(f"Total tokens: {len(data):,}")

# Train / validation split (90% / 10%)
n_train = int(0.9 * len(data))
train_data = data[:n_train]
val_data   = data[n_train:]
print(f"Train: {len(train_data):,}  |  Val: {len(val_data):,}")

# Data loading: sample random chunks
def get_batch(split, block_size=128, batch_size=32, device='cpu'):
    data = train_data if split == 'train' else val_data
    
    # Random starting positions
    ix = torch.randint(len(data) - block_size, (batch_size,))
    
    # x = input sequence, y = x shifted by 1 (next token)
    x = torch.stack([data[i    : i + block_size    ] for i in ix])
    y = torch.stack([data[i + 1: i + block_size + 1] for i in ix])
    
    return x.to(device), y.to(device)

# Inspect a batch
x, y = get_batch('train')
print(f"\nBatch x shape: {x.shape}")   # [32, 128]
print(f"Batch y shape: {y.shape}")     # [32, 128]
print(f"\nFirst sequence (chars):  {''.join(decode(x[0].tolist()[:40]))}")
print(f"Target  (next chars):    {''.join(decode(y[0].tolist()[:40]))}")
```

---

## 6.4 The Full Training Script

```python
import torch
import torch.nn as nn
import torch.nn.functional as F
import math
import time

# ---- Model (from module 05 — copy paste it here) ----
# [Include all classes: scaled_dot_product_attention, MultiHeadAttention,
#  FeedForward, TransformerBlock, GPT]
# For brevity, assuming they're defined above.

# ---- Hyperparameters ----
config = {
    'vocab_size':   vocab_size,   # number of unique characters
    'd_model':      128,          # embedding dimension
    'n_heads':      4,            # attention heads
    'n_layers':     4,            # transformer blocks
    'max_seq_len':  128,          # context length
    'dropout':      0.1,
    'batch_size':   32,
    'block_size':   128,
    'lr':           3e-4,
    'max_iters':    5000,
    'eval_interval':500,
    'eval_iters':   100,
    'grad_clip':    1.0,
}

device = 'cuda' if torch.cuda.is_available() else 'cpu'
print(f"Training on: {device}")

# ---- Build model ----
model = GPT(
    vocab_size  = config['vocab_size'],
    d_model     = config['d_model'],
    n_heads     = config['n_heads'],
    n_layers    = config['n_layers'],
    max_seq_len = config['max_seq_len'],
    dropout     = config['dropout'],
).to(device)

n_params = sum(p.numel() for p in model.parameters())
print(f"Model parameters: {n_params:,}")

optimizer = torch.optim.AdamW(model.parameters(), lr=config['lr'])

# ---- Loss estimation ----
@torch.no_grad()
def estimate_loss():
    model.eval()
    losses = {}
    for split in ['train', 'val']:
        split_losses = []
        for _ in range(config['eval_iters']):
            x, y = get_batch(split, config['block_size'], config['batch_size'], device)
            _, loss = model(x, y)
            split_losses.append(loss.item())
        losses[split] = sum(split_losses) / len(split_losses)
    model.train()
    return losses

# ---- Training loop ----
train_losses = []
val_losses   = []

print("\nStarting training...")
print(f"{'Iter':>6}  {'Train Loss':>10}  {'Val Loss':>10}  {'Perplexity':>10}  {'Time':>8}")
print("-" * 55)

t0 = time.time()
for step in range(config['max_iters'] + 1):
    
    # Evaluate periodically
    if step % config['eval_interval'] == 0:
        losses = estimate_loss()
        train_losses.append(losses['train'])
        val_losses.append(losses['val'])
        elapsed = time.time() - t0
        ppl = math.exp(losses['val'])
        print(f"{step:>6}  {losses['train']:>10.4f}  {losses['val']:>10.4f}  {ppl:>10.2f}  {elapsed:>7.1f}s")
        t0 = time.time()
    
    if step == config['max_iters']:
        break
    
    # Get batch
    x, y = get_batch('train', config['block_size'], config['batch_size'], device)
    
    # Forward + loss
    _, loss = model(x, y)
    
    # Backward
    optimizer.zero_grad()
    loss.backward()
    torch.nn.utils.clip_grad_norm_(model.parameters(), config['grad_clip'])
    optimizer.step()

print("\nTraining complete!")
```

---

## 6.5 Plotting the Loss Curve

```python
import matplotlib.pyplot as plt

iters = [i * config['eval_interval'] for i in range(len(train_losses))]

fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(13, 4))

# Loss
ax1.plot(iters, train_losses, label='Train', color='steelblue', lw=2)
ax1.plot(iters, val_losses,   label='Val',   color='tomato',    lw=2)
ax1.set_xlabel('Iteration'); ax1.set_ylabel('Cross-Entropy Loss')
ax1.set_title('Training Loss'); ax1.legend(); ax1.grid(True, alpha=0.3)

# Perplexity (exp of loss — interpretable as "branching factor")
ax2.plot(iters, [math.exp(l) for l in train_losses], label='Train', color='steelblue', lw=2)
ax2.plot(iters, [math.exp(l) for l in val_losses],   label='Val',   color='tomato',    lw=2)
ax2.axhline(vocab_size, color='gray', linestyle='--', label=f'Random ({vocab_size})')
ax2.set_xlabel('Iteration'); ax2.set_ylabel('Perplexity')
ax2.set_title('Perplexity (lower = better)')
ax2.legend(); ax2.grid(True, alpha=0.3)

plt.tight_layout()
plt.savefig("training_curves.png", dpi=120)
plt.show()
```

---

## 6.6 Generate Text!

```python
@torch.no_grad()
def generate_text(model, prompt="", max_new_tokens=500, temperature=0.8, top_k=40):
    model.eval()
    
    # Encode prompt (or start from newline)
    if prompt:
        idx = torch.tensor([encode(prompt)], dtype=torch.long, device=device)
    else:
        idx = torch.zeros((1, 1), dtype=torch.long, device=device)
    
    generated_ids = model.generate(idx, max_new_tokens, temperature, top_k)
    generated_text = decode(generated_ids[0].tolist())
    return generated_text

# Generate with different prompts
print("=" * 60)
print("GENERATED TEXT (temperature=0.8):")
print("=" * 60)
print(generate_text(model, prompt="\n", max_new_tokens=400))

print("\n" + "=" * 60)
print("GENERATED TEXT (temperature=0.3 — more conservative):")
print("=" * 60)
print(generate_text(model, prompt="HAMLET:", max_new_tokens=300, temperature=0.3))

print("\n" + "=" * 60)
print("GENERATED TEXT (temperature=1.5 — more random/creative):")
print("=" * 60)
print(generate_text(model, prompt="HAMLET:", max_new_tokens=300, temperature=1.5))
```

---

## 6.7 What to Expect

At different stages of training, your model will generate:

| Iter | What you'll see |
|------|----------------|
| 0 | Random characters: `xKqmzLLf9pQw...` |
| 100 | English-ish: common letters, some spaces |
| 500 | Words start appearing: "the", "and", "I" |
| 1000 | Sentences forming, some grammar |
| 3000 | Recognizable Shakespearean structure |
| 5000 | Character names, blank verse, dialogue |

The model has never seen grammar rules. It learns them purely from patterns.

---

## 6.8 Understanding What the Model Learned

```python
# What tokens does the model assign high probability to?
model.eval()

def next_token_probs(model, context_str, top_k=10):
    context_ids = torch.tensor([encode(context_str[-128:])], device=device)
    logits, _ = model(context_ids)
    probs = F.softmax(logits[0, -1], dim=0)   # last position
    top_probs, top_ids = probs.topk(top_k)
    
    print(f"Context: '...{context_str[-20:]}'")
    print(f"Top {top_k} next tokens:")
    for p, idx in zip(top_probs, top_ids):
        char = decode([idx.item()])
        char_display = repr(char)
        print(f"  {char_display:10s}  {p.item():.4f}  {'█' * int(p.item() * 40)}")

next_token_probs(model, "HAMLET:\nTo be, or not to ")
print()
next_token_probs(model, "Good morrow, ")
```

---

## 6.9 Save and Load the Model

```python
# Save
torch.save({
    'model_state_dict': model.state_dict(),
    'config': config,
    'vocab': {'char_to_id': char_to_id, 'id_to_char': id_to_char},
    'train_losses': train_losses,
    'val_losses': val_losses,
}, 'shakespeare_gpt.pt')

print("Model saved to shakespeare_gpt.pt")

# Load
checkpoint = torch.load('shakespeare_gpt.pt', map_location=device)
loaded_config = checkpoint['config']
loaded_model  = GPT(
    vocab_size  = loaded_config['vocab_size'],
    d_model     = loaded_config['d_model'],
    n_heads     = loaded_config['n_heads'],
    n_layers    = loaded_config['n_layers'],
    max_seq_len = loaded_config['max_seq_len'],
).to(device)
loaded_model.load_state_dict(checkpoint['model_state_dict'])
print("Model loaded successfully!")

# Verify it works
print(generate_text(loaded_model, "ROMEO:", max_new_tokens=100))
```

---

## ✅ Module 06 Summary

You just trained a real language model from scratch! Here's what happened:

1. **Tokenization**: text → integer IDs (character-level)
2. **Batching**: sample random chunks for training
3. **Forward pass**: token IDs → logits via transformer
4. **Loss**: cross-entropy between predictions and actual next tokens
5. **Backward pass**: gradients tell us how to improve
6. **Generation**: sample from the probability distribution autoregressively

The model has ~1M parameters. GPT-3 has 175 *billion*. The architecture is identical — just bigger.

---

## 🧪 Experiments to Try

1. **Scale up**: double `d_model` to 256 and `n_layers` to 6. Does quality improve?
2. **Different data**: replace `shakespeare.txt` with any text you want (code, recipes, poetry)
3. **Context length**: change `block_size` from 128 to 32. What happens?
4. **Temperature**: generate with temperature 0.1 vs 2.0. What's the difference?
5. **Read Karpathy's nanoGPT**: github.com/karpathy/nanoGPT — compare his implementation to yours

---

> **Next:** `07_tokenization_and_training.md` — how real LLMs tokenize text with BPE, and how to scale training →
