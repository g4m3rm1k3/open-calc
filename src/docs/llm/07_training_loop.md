# Module 07 — The Training Loop
### Every line explained. Nothing skipped.

---

## How to Use This Module

Create `07_training_loop.py`.
Type all code from module 06 at the top first.
Then type everything here.

This module builds the complete training infrastructure.
By the end you have everything needed to actually train your model.

---

## PART 1 — What Training Actually Is

---

### 1.1 The Four Steps, Explained

Every single training step does exactly four things, in this order:

**Step 1: Forward pass**
Run the model on a batch of input sequences.
Compute the loss — how wrong the model is right now.

**Step 2: Zero gradients**
Clear the gradients from the previous step.
Gradients accumulate in PyTorch by default.
If you do not zero them, you add this step's gradient to last step's gradient.
That is almost never what you want.

**Step 3: Backward pass**
Call `loss.backward()`.
PyTorch walks backward through the computation graph, applying the chain rule.
Every parameter gets a `.grad` attribute filled with `∂L/∂param`.

**Step 4: Update**
Call `optimizer.step()`.
The optimizer uses each parameter's `.grad` to compute an update
and adjusts the parameter value.

Repeat 5,000 to 5,000,000 times. That is training.

---

### 1.2 The Data Loader — What the Model Sees

At each training step, we feed the model a **batch** of sequences.
A batch is multiple sequences processed simultaneously.

Why batches instead of one sequence at a time?
- GPU efficiency: GPUs are parallel processors — they work best on large matrices
- Gradient stability: averaging gradients over many sequences gives a less noisy estimate
- Speed: processing 32 sequences at once is much faster than 32 separate passes

Each sequence in the batch is a random chunk of the training data:
- `input[t]`  = the token at position t
- `target[t]` = the token at position t+1 (what comes next)

We pick random starting positions each time, so the model sees
different chunks at every step.

---

### 1.3 The Optimizer — AdamW

We use **AdamW** rather than plain gradient descent.

**Plain gradient descent:** `w = w - lr × gradient`
Simple but has problems: the learning rate is the same for every weight.
Rarely-updated weights need larger steps. Frequently-updated weights need smaller.

**Adam** (Adaptive Moment Estimation) fixes this:
It keeps a running average of gradients (momentum) and a running average
of squared gradients (adaptive learning rate). Each weight gets its own
effective learning rate based on its history.

**The AdamW update rule for one weight w:**

```
m = β₁ × m + (1 - β₁) × g           ← momentum: running average of gradients
v = β₂ × v + (1 - β₂) × g²          ← velocity: running average of squared gradients
m̂ = m / (1 - β₁ᵗ)                    ← bias correction (adjusts for start-up)
v̂ = v / (1 - β₂ᵗ)
w = w × (1 - lr × λ) - lr × m̂ / (√v̂ + ε)    ← update
```

In English:
- `m` is a smoothed gradient — recent gradients matter more than old ones
- `v` is a smoothed squared gradient — how much has this weight been varying?
- Weights that vary a lot (large v) get smaller steps
- Weights that are consistent (small v) get larger steps
- `λ` is the weight decay — gently pulls weights toward zero each step

The **W** in AdamW refers to the weight decay being applied directly to the weights,
not through the gradient. This is a correction over the original Adam
that makes weight decay behave correctly with adaptive learning rates.

**Standard settings for language models:**
- β₁ = 0.9 (momentum factor)
- β₂ = 0.95 (velocity factor, slightly lower than the 0.999 default)
- weight_decay = 0.1
- eps = 1e-8 (prevents division by zero in the denominator)

**Which parameters get weight decay?**
Weight matrices: yes (we want to regularize the learned transformations)
Bias vectors: no (biases are small scalars, regularizing them hurts)
LayerNorm gamma and beta: no (these are scale/shift parameters, not weights)

---

### 1.4 The Learning Rate Schedule

A fixed learning rate works but a schedule works better.

**Problem with fixed LR:**
- Too large: training diverges or oscillates near the minimum
- Too small: training crawls

**The cosine schedule with warmup:**

Phase 1 — Warmup (first N steps):
The model starts with completely random weights. The gradient can be huge.
We ramp the learning rate from 0 to max_lr linearly over the first N steps.
This prevents chaotic early updates that could send the model in a bad direction.

Phase 2 — Cosine decay (remaining steps):
We decrease the learning rate following a cosine curve from max_lr to min_lr.
The cosine shape means: fast descent early (large LR), slow descent late (small LR).
This allows large improvements at first and fine-tuning at the end.

```
LR at step t:

t < warmup: LR = max_lr × (t / warmup_steps)

t >= warmup: progress = (t - warmup) / (max_steps - warmup)
             LR = min_lr + (max_lr - min_lr) × 0.5 × (1 + cos(π × progress))
```

**Intuition for cosine decay:**
When progress=0 (just after warmup): cos(0) = 1, LR = max_lr
When progress=0.5 (halfway through): cos(π/2) = 0, LR = midpoint
When progress=1.0 (end of training): cos(π) = -1, LR = min_lr

---

### 1.5 Gradient Clipping

Sometimes during training, a batch has an unusually large gradient.
This can happen when the model encounters a surprising pattern.
An unchecked large gradient update can send the model to a bad region.

**Gradient clipping** prevents this by capping the total gradient magnitude.

We compute the **gradient norm** — the magnitude of the gradient vector
treating all parameters as one large flat vector:

```
gradient_norm = √(Σ_param Σ_element (∂L/∂param_element)²)
```

If `gradient_norm > max_norm`, we scale every gradient by `max_norm / gradient_norm`.
This preserves the direction of the gradient but limits the step size.

Standard value: `max_norm = 1.0`

---

## PART 2 — Writing the Code

```python
# 07_training_loop.py
#
# Complete training infrastructure.
# Type ALL code from module 06 first, then this.

import torch
import torch.nn as nn
import torch.nn.functional as F
import math
import time
import pickle
import json
import os
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

# [Type all previous module code here]
```

```python
# -------------------------------------------------------
# DATA LOADER
#
# Plain English:
#   - Hold the full tokenized dataset in memory
#   - At each call, sample random starting positions
#   - Return (input, target) pairs where target = input shifted by 1
#   - Move tensors to the right device (CPU or GPU)
# -------------------------------------------------------

class DataLoader:
    """
    Samples random batches from tokenized text data.
    
    Each batch contains:
      x (inputs):  token sequences of length block_size
      y (targets): same sequences shifted by 1 (the next token at each position)
    
    The model learns: given x, predict y.
    """
    
    def __init__(self, token_ids, block_size, batch_size, device):
        """
        token_ids:  list or tensor of all token IDs in the dataset
        block_size: length of each sequence in the batch
        batch_size: number of sequences per batch
        device:     'cpu' or 'cuda' — where to put the tensors
        """
        # Store as a LongTensor (integers) for embedding lookup
        if isinstance(token_ids, list):
            self.data = torch.tensor(token_ids, dtype=torch.long)
        else:
            self.data = token_ids.long()
        
        self.block_size = block_size
        self.batch_size = batch_size
        self.device     = device
        
        # Maximum valid starting position:
        # We need block_size tokens for input and one more for the last target
        # So we cannot start within the last block_size positions
        self.max_start = len(self.data) - block_size - 1
        
        print(f"DataLoader ready:")
        print(f"  Dataset size:  {len(self.data):,} tokens")
        print(f"  Block size:    {block_size}")
        print(f"  Batch size:    {batch_size}")
        print(f"  Max start pos: {self.max_start:,}")
    
    def get_batch(self):
        """
        Sample one random batch.
        
        Returns:
          x: [batch_size, block_size]  — input sequences
          y: [batch_size, block_size]  — target sequences (next tokens)
        
        For each sequence at position i:
          x[i] = data[start : start + block_size]
          y[i] = data[start+1 : start + block_size + 1]
        
        x[i][t] is the input at position t.
        y[i][t] is what the model should predict at position t.
        y[i][t] = x[i][t+1] (the very next token).
        """
        # Sample random starting positions for each sequence in the batch
        # torch.randint(low, high, size): sample batch_size integers in [0, max_start)
        start_positions = torch.randint(
            low  = 0,
            high = self.max_start,
            size = (self.batch_size,)
        )
        
        # Collect input and target sequences
        # For each starting position, grab block_size tokens
        inputs  = torch.stack([
            self.data[s : s + self.block_size]
            for s in start_positions
        ])
        # inputs shape: [batch_size, block_size]
        
        targets = torch.stack([
            self.data[s + 1 : s + self.block_size + 1]
            for s in start_positions
        ])
        # targets shape: [batch_size, block_size]
        # targets[b, t] = inputs[b, t+1]  (the next token)
        
        # Move to the correct device (CPU or GPU)
        return inputs.to(self.device), targets.to(self.device)


# Test the data loader
print("=== DATA LOADER TEST ===")
train_data = torch.load('train_data.pt')
val_data   = torch.load('val_data.pt')

with open('tokenizer.pkl', 'rb') as f:
    tok_data = pickle.load(f)
id_to_char = tok_data['id_to_char']
decode = lambda ids: ''.join(id_to_char[i] for i in ids)

loader = DataLoader(train_data, block_size=32, batch_size=4, device='cpu')
x_batch, y_batch = loader.get_batch()

print()
print(f"Batch shapes: x={x_batch.shape}, y={y_batch.shape}")
print()
print("First sequence in batch:")
print(f"  Input:  {repr(decode(x_batch[0].tolist()))}")
print(f"  Target: {repr(decode(y_batch[0].tolist()))}")
print()
print("Position-by-position (first 6 positions):")
for t in range(6):
    in_char  = decode([x_batch[0][t].item()])
    out_char = decode([y_batch[0][t].item()])
    print(f"  Position {t}: input={repr(in_char)}  target={repr(out_char)}")
print()
print("Target is always the next character after the input.")
```

```python
# -------------------------------------------------------
# LEARNING RATE SCHEDULE
#
# Plain English:
#   - Start at 0, ramp up to max_lr over warmup_steps
#   - Then decrease following a cosine curve to min_lr
#   - Stay at min_lr after max_steps
# -------------------------------------------------------

def get_learning_rate(step, warmup_steps, max_steps, max_lr, min_lr):
    """
    Compute the learning rate for a given training step.
    
    step:          current training step (0, 1, 2, ...)
    warmup_steps:  number of steps to ramp up
    max_steps:     total number of training steps
    max_lr:        peak learning rate (at end of warmup)
    min_lr:        minimum learning rate (at end of training)
    
    Returns: a float, the learning rate to use at this step
    """
    # Phase 1: Linear warmup
    # During warmup, LR increases linearly from 0 to max_lr
    if step < warmup_steps:
        # At step 0: LR = 0
        # At step warmup_steps-1: LR ≈ max_lr
        return max_lr * (step / warmup_steps)
    
    # Phase 3: After training is done
    # Keep at min_lr (this handles the case where we keep evaluating)
    if step >= max_steps:
        return min_lr
    
    # Phase 2: Cosine decay
    # progress goes from 0 (just after warmup) to 1 (at max_steps)
    progress = (step - warmup_steps) / (max_steps - warmup_steps)
    
    # Cosine curve: cos(0) = 1, cos(π) = -1
    # We map this to [0, 1] → [max_lr, min_lr]
    cosine_coefficient = 0.5 * (1.0 + math.cos(math.pi * progress))
    # At progress=0:   cosine_coefficient = 0.5 × (1 + 1)  = 1.0 → LR = max_lr
    # At progress=0.5: cosine_coefficient = 0.5 × (1 + 0)  = 0.5 → LR = midpoint
    # At progress=1.0: cosine_coefficient = 0.5 × (1 + -1) = 0.0 → LR = min_lr
    
    return min_lr + (max_lr - min_lr) * cosine_coefficient


# Visualize the schedule
max_steps_vis   = 5000
warmup_steps_vis = 200
max_lr_vis       = 3e-4
min_lr_vis       = 3e-5

steps_vis = range(max_steps_vis + 100)
lrs_vis   = [
    get_learning_rate(s, warmup_steps_vis, max_steps_vis, max_lr_vis, min_lr_vis)
    for s in steps_vis
]

fig, ax = plt.subplots(figsize=(10, 4))
ax.plot(steps_vis, lrs_vis, color='steelblue', lw=2.5)
ax.axvline(warmup_steps_vis, color='orange', linestyle='--', lw=1.5,
           label=f'End of warmup (step {warmup_steps_vis})')
ax.axvline(max_steps_vis, color='red', linestyle='--', lw=1.5,
           label=f'End of training (step {max_steps_vis})')
ax.axhline(max_lr_vis, color='gray', linestyle=':', alpha=0.5, label=f'max_lr = {max_lr_vis}')
ax.axhline(min_lr_vis, color='gray', linestyle=':', alpha=0.5, label=f'min_lr = {min_lr_vis}')
ax.set_xlabel("Training Step", fontsize=11)
ax.set_ylabel("Learning Rate", fontsize=11)
ax.set_title("Cosine LR Schedule With Linear Warmup\n"
             "Warmup prevents chaotic early updates. Cosine decay enables fine-tuning.",
             fontsize=11)
ax.legend(fontsize=9)
ax.grid(True, alpha=0.3)
plt.tight_layout()
plt.savefig("07a_lr_schedule.png", dpi=130)
print("Saved: 07a_lr_schedule.png")
print()

# Print a few key values
print("Learning rate at key steps:")
for step_check in [0, 1, 50, 100, 200, 500, 1000, 2500, 5000]:
    lr = get_learning_rate(step_check, warmup_steps_vis, max_steps_vis, max_lr_vis, min_lr_vis)
    print(f"  Step {step_check:5d}: {lr:.2e}")
```

```python
# -------------------------------------------------------
# GRADIENT CLIPPING
#
# Plain English:
#   1. Compute the total norm of all gradients
#   2. If it exceeds max_norm, scale all gradients down proportionally
#   3. Return the (pre-clipping) gradient norm for logging
# -------------------------------------------------------

def clip_gradients(model, max_norm):
    """
    Clip gradients to prevent exploding gradient updates.
    
    model:    the model whose parameters to clip
    max_norm: maximum allowed gradient norm (typically 1.0)
    
    Returns: the gradient norm BEFORE clipping (for logging)
    
    How it works:
    1. Collect all gradient tensors
    2. Compute total norm: sqrt(sum of all squared gradient elements)
    3. If total_norm > max_norm: scale all gradients by max_norm/total_norm
       This scales the gradient DIRECTION but not the magnitude beyond max_norm
    """
    # Collect all gradient tensors from all parameters
    # Some parameters may not have gradients (e.g., frozen parameters)
    all_grads = [
        param.grad
        for param in model.parameters()
        if param.grad is not None
    ]
    
    if not all_grads:
        return 0.0   # no gradients means no clipping needed
    
    # Compute total gradient norm
    # Equivalent to: treat all gradients as one big flat vector, compute its length
    # torch.stack creates a tensor of individual gradient norms
    # .pow(2) squares them, .sum() sums, sqrt gives total norm
    total_norm = torch.sqrt(
        torch.stack([g.norm().pow(2) for g in all_grads]).sum()
    ).item()
    
    # Clip if gradient norm exceeds the threshold
    if total_norm > max_norm:
        # Scale factor: how much to shrink all gradients
        # If total_norm = 5.0 and max_norm = 1.0, scale = 0.2
        scale = max_norm / (total_norm + 1e-6)   # +1e-6 prevents division by zero
        
        for g in all_grads:
            g.mul_(scale)   # in-place multiply by scale factor
    
    return total_norm   # return pre-clipping norm for logging


# Demonstrate gradient clipping
print("\n=== GRADIENT CLIPPING DEMO ===")
print()

# Create a tiny model for demonstration
demo_model = nn.Linear(10, 5)
demo_x     = torch.randn(4, 10)
demo_y     = torch.randn(4, 5)

loss_demo = ((demo_model(demo_x) - demo_y) ** 2).mean()
loss_demo.backward()

# Check gradient norm before clipping
norm_before = torch.sqrt(
    sum(p.grad.norm().pow(2) for p in demo_model.parameters())
).item()

# Clip
norm_returned = clip_gradients(demo_model, max_norm=0.1)

# Check norm after clipping
norm_after = torch.sqrt(
    sum(p.grad.norm().pow(2) for p in demo_model.parameters())
).item()

print(f"Gradient norm before clipping: {norm_before:.4f}")
print(f"clip_gradients() returned:     {norm_returned:.4f}  (pre-clipping norm)")
print(f"Gradient norm after clipping:  {norm_after:.4f}  (should be ≤ 0.1)")
print()
print("All gradients scaled down proportionally. Direction preserved.")
```

```python
# -------------------------------------------------------
# CONFIGURE THE OPTIMIZER
#
# We use AdamW with different weight decay for different parameter types.
#
# Parameters that get weight decay:
#   - Weight matrices (nn.Linear weights, embedding weights)
#   - These are the "real" learned transformations
#
# Parameters that do NOT get weight decay:
#   - Biases (small vectors, regularizing them hurts more than helps)
#   - LayerNorm gamma and beta (scale/shift, not weights)
# -------------------------------------------------------

def configure_optimizer(model, lr, weight_decay):
    """
    Build AdamW optimizer with separate weight decay groups.
    
    model:        the GPT model
    lr:           initial learning rate (will be overridden by schedule)
    weight_decay: L2 regularization strength for weight matrices
    
    Returns: configured AdamW optimizer
    """
    # Separate parameters into two groups
    decay_params    = []   # weight matrices: apply weight decay
    no_decay_params = []   # biases and norms: no weight decay
    
    for param_name, param in model.named_parameters():
        if not param.requires_grad:
            continue   # skip frozen parameters
        
        # Check if this parameter should have weight decay
        # Biases have 'bias' in their name
        # LayerNorm parameters are 'gamma' and 'beta' in our implementation
        if 'bias' in param_name or 'gamma' in param_name or 'beta' in param_name:
            no_decay_params.append(param)
        else:
            decay_params.append(param)
    
    # Print a breakdown so we can verify
    decay_count    = sum(p.numel() for p in decay_params)
    no_decay_count = sum(p.numel() for p in no_decay_params)
    print(f"Optimizer parameter groups:")
    print(f"  Weight decay (λ={weight_decay}):  {decay_count:>10,} parameters")
    print(f"  No weight decay:         {no_decay_count:>10,} parameters")
    print(f"  Total:                   {decay_count + no_decay_count:>10,} parameters")
    
    # Create AdamW with two parameter groups
    optimizer = torch.optim.AdamW(
        params=[
            {'params': decay_params,    'weight_decay': weight_decay},
            {'params': no_decay_params, 'weight_decay': 0.0},
        ],
        lr    = lr,
        betas = (0.9, 0.95),   # standard for LLMs (slightly lower β₂ than default 0.999)
        eps   = 1e-8,          # numerical stability in the denominator
    )
    
    return optimizer
```

```python
# -------------------------------------------------------
# THE COMPLETE TRAINING FUNCTION
#
# Ties everything together:
#   - Data loading
#   - Learning rate scheduling
#   - Forward pass
#   - Loss computation
#   - Backward pass (gradient computation)
#   - Gradient clipping
#   - Parameter update
#   - Periodic evaluation
#   - Logging
#   - Saving the best model
# -------------------------------------------------------

def train(model, train_loader, val_loader, config, device):
    """
    Train the model for config['max_steps'] steps.
    
    model:        the GPT model (already on device)
    train_loader: DataLoader for training data
    val_loader:   DataLoader for validation data
    config:       dict with training hyperparameters
    device:       'cpu' or 'cuda'
    
    Returns: (train_losses, val_losses, grad_norms)
    """
    # Build optimizer with our configuration
    optimizer = configure_optimizer(
        model,
        lr           = config['max_lr'],
        weight_decay = config['weight_decay']
    )
    
    # Storage for metrics we want to plot later
    train_losses = []   # loss at every training step
    val_losses   = []   # loss at every evaluation step
    grad_norms   = []   # gradient norm at every training step
    
    # Track the best validation loss so we save the best model
    best_val_loss = float('inf')
    
    # Put model in training mode (enables dropout)
    model.train()
    
    # Timer to show steps/second
    t0 = time.time()
    
    # Print header for the training log
    print()
    print(f"{'Step':>6}  {'Train Loss':>10}  {'Val Loss':>10}  "
          f"{'Perplexity':>10}  {'Grad Norm':>9}  {'LR':>10}  {'Time':>7}")
    print("-" * 75)
    
    for step in range(config['max_steps'] + 1):
        
        # ---- PERIODIC EVALUATION ----
        # Every eval_interval steps, compute validation loss
        if step % config['eval_interval'] == 0:
            model.eval()   # disable dropout for evaluation
            
            # Average loss over several validation batches
            # (one batch is too noisy, more batches = more stable estimate)
            val_loss_sum = 0.0
            with torch.no_grad():   # no gradients needed during evaluation
                for _ in range(config['eval_steps']):
                    x_val, y_val = val_loader.get_batch()
                    _, loss_val  = model(x_val, y_val)
                    val_loss_sum += loss_val.item()
            
            val_loss = val_loss_sum / config['eval_steps']
            val_losses.append(val_loss)
            
            # Compute metrics for display
            elapsed    = time.time() - t0
            perplexity = math.exp(val_loss)
            current_lr = get_learning_rate(
                step,
                config['warmup_steps'],
                config['max_steps'],
                config['max_lr'],
                config['min_lr']
            )
            t_loss = train_losses[-1] if train_losses else float('nan')
            g_norm = grad_norms[-1]   if grad_norms   else float('nan')
            
            print(f"{step:>6}  {t_loss:>10.4f}  {val_loss:>10.4f}  "
                  f"{perplexity:>10.2f}  {g_norm:>9.4f}  {current_lr:>10.2e}  "
                  f"{elapsed:>6.1f}s")
            
            # Save the best model
            if val_loss < best_val_loss:
                best_val_loss = val_loss
                torch.save(model.state_dict(), 'best_model.pt')
            
            model.train()   # re-enable dropout for training
            t0 = time.time()
        
        # Stop after the last step (we evaluate at the final step but don't train)
        if step == config['max_steps']:
            break
        
        # ---- UPDATE LEARNING RATE ----
        current_lr = get_learning_rate(
            step,
            config['warmup_steps'],
            config['max_steps'],
            config['max_lr'],
            config['min_lr']
        )
        # Update learning rate in optimizer
        for param_group in optimizer.param_groups:
            param_group['lr'] = current_lr
        
        # ---- FORWARD PASS ----
        x_train, y_train = train_loader.get_batch()
        _, loss_train    = model(x_train, y_train)
        train_losses.append(loss_train.item())
        
        # ---- BACKWARD PASS ----
        # Must zero gradients BEFORE backward()
        # If we don't, gradients accumulate from previous steps
        optimizer.zero_grad()
        
        # Compute gradients for all parameters
        # PyTorch walks the computation graph backwards, applying chain rule
        loss_train.backward()
        
        # ---- GRADIENT CLIPPING ----
        g_norm = clip_gradients(model, config['grad_clip'])
        grad_norms.append(g_norm)
        
        # ---- UPDATE PARAMETERS ----
        # AdamW uses the gradients (and momentum history) to update parameters
        optimizer.step()
    
    print()
    print(f"Training complete. Best val loss: {best_val_loss:.4f}  "
          f"(perplexity: {math.exp(best_val_loss):.2f})")
    
    return train_losses, val_losses, grad_norms


# -------------------------------------------------------
# TRAINING DIAGNOSTIC PLOTS
# -------------------------------------------------------

def plot_training_curves(train_losses, val_losses, grad_norms, config,
                         save_path="07b_training_curves.png"):
    """Plot training diagnostics."""
    eval_steps = list(range(0, len(val_losses) * config['eval_interval'],
                            config['eval_interval']))
    
    fig, axes = plt.subplots(1, 3, figsize=(16, 4.5))
    
    # Loss curves
    axes[0].plot(train_losses, color='steelblue', lw=1.0, alpha=0.6,
                 label='Train (every step)')
    if val_losses:
        axes[0].plot(eval_steps[:len(val_losses)], val_losses,
                     color='tomato', lw=2.5, label='Val (every eval_interval steps)')
    axes[0].set_xlabel("Step"); axes[0].set_ylabel("Cross-Entropy Loss")
    axes[0].set_title("Training Loss", fontsize=11)
    axes[0].legend(fontsize=8); axes[0].grid(True, alpha=0.3)
    
    # Perplexity
    train_ppls = [math.exp(min(l, 10)) for l in train_losses]  # cap for display
    val_ppls   = [math.exp(l) for l in val_losses]
    
    axes[1].plot(train_ppls, color='steelblue', lw=1.0, alpha=0.6, label='Train')
    if val_ppls:
        axes[1].plot(eval_steps[:len(val_ppls)], val_ppls,
                     color='tomato', lw=2.5, label='Val')
    axes[1].set_xlabel("Step"); axes[1].set_ylabel("Perplexity")
    axes[1].set_title("Perplexity (lower = better)", fontsize=11)
    axes[1].legend(fontsize=8); axes[1].grid(True, alpha=0.3)
    
    # Gradient norms
    axes[2].plot(grad_norms, color='purple', lw=1.0, alpha=0.7)
    axes[2].axhline(1.0, color='red', linestyle='--', alpha=0.7,
                    label='Clip threshold (1.0)')
    axes[2].set_xlabel("Step"); axes[2].set_ylabel("Gradient Norm")
    axes[2].set_title("Gradient Norm\n(spikes show difficult batches)", fontsize=11)
    axes[2].legend(fontsize=8); axes[2].grid(True, alpha=0.3)
    axes[2].set_ylim(0, min(max(grad_norms) * 1.2, 3.0))
    
    plt.suptitle("Training Diagnostics — Watch These During Training", fontsize=12)
    plt.tight_layout()
    plt.savefig(save_path, dpi=130)
    print(f"Saved: {save_path}")
```

```python
# -------------------------------------------------------
# VERIFY THE TRAINING STEP WORKS (ONE STEP TEST)
#
# Before running the full training loop, test that
# one step works correctly on a small batch.
# -------------------------------------------------------

print("\n=== ONE-STEP TRAINING TEST ===")
print("Verifying the training loop works before running full training.")
print()

# Load data
train_data_full = torch.load('train_data.pt')
val_data_full   = torch.load('val_data.pt')

device = 'cuda' if torch.cuda.is_available() else 'cpu'
print(f"Device: {device}")

# Tiny model for the test
with open('tokenizer.pkl', 'rb') as f:
    tok_data = pickle.load(f)
vocab_size_tok = tok_data['vocab_size']

test_model = GPT(
    vocab_size  = vocab_size_tok,
    d_model     = 32,
    n_heads     = 2,
    n_layers    = 2,
    max_seq_len = 64,
).to(device)

test_loader = DataLoader(train_data_full, block_size=32, batch_size=8, device=device)
test_optimizer = torch.optim.AdamW(test_model.parameters(), lr=1e-3)

# One step
x_test_step, y_test_step = test_loader.get_batch()
_, loss_before = test_model(x_test_step, y_test_step)

test_optimizer.zero_grad()
loss_before.backward()
clip_gradients(test_model, max_norm=1.0)
test_optimizer.step()

_, loss_after = test_model(x_test_step, y_test_step)

print(f"Loss before step: {loss_before.item():.4f}")
print(f"Loss after step:  {loss_after.item():.4f}")
print()
if loss_after.item() < loss_before.item():
    print("✓ Loss decreased — training step works correctly.")
else:
    print("△ Loss did not decrease on this batch (normal — one step on one batch")
    print("  is noisy. Run more steps and check the trend.)")
print()
print("If you see no errors above, your training loop is working.")
print("Move to module 08 to run the full training.")
```

---

## PART 3 — What to Watch During Training

---

### 3.1 Reading the Training Log

Every `eval_interval` steps, you will see a row like this:

```
  Step  Train Loss    Val Loss  Perplexity  Grad Norm          LR    Time
------------------------------------------------------------------------
     0      4.2764      4.2801      72.47     0.0000    0.00e+00    0.0s
   500      2.9341      3.0112      20.32     0.4821    3.00e-04   47.2s
  1000      2.5103      2.6244      13.79     0.3912    2.87e-04   46.8s
```

**Train Loss**: cross-entropy on training batches. Should decrease steadily.
- Not decreasing: learning rate too small, bug in the model, wrong data format
- Oscillating wildly: learning rate too large

**Val Loss**: cross-entropy on validation data. Should follow train loss.
- Val loss > train loss: normal (validation is harder)
- Val loss stops decreasing while train loss keeps dropping: overfitting

**Perplexity**: exp(val_loss). More interpretable than loss.
- Starts at ~72 (= vocab_size, random model)
- Should reach single digits by end of training for our model size

**Grad Norm**: total gradient magnitude. Should be roughly stable.
- Spikes are normal (some batches are harder)
- After clipping, never exceeds 1.0
- Consistently near 0: learning rate too small, gradients not flowing
- Consistently at 1.0 (always clipped): learning rate too large

**LR**: current learning rate. Starts at 0, peaks at max_lr, decays to min_lr.

---

### 3.2 When to Stop

Stop when validation loss stops improving.
With our small model and 5000 steps, expect:
- Steps 0-200: rapid initial drop (model learns basic character frequencies)
- Steps 200-2000: steady improvement (model learns words and patterns)
- Steps 2000-5000: slower improvement (fine-tuning the style)
- After 5000: diminishing returns for this model size

To get better: increase d_model, n_layers, or train for more steps.

---

## ✅ Check Your Understanding

1. The data loader samples RANDOM starting positions each batch.
   Why random instead of sequential (going through the data in order)?
   What could go wrong with sequential batching?
   (Hint: what if the first 10% of the data is all Shakespeare and
   the last 10% is all Python?)

2. Weight decay: `w = w × (1 - lr × λ) - lr × m̂/(√v̂ + ε)`
   The first term `w × (1 - lr × λ)` shrinks the weight slightly every step.
   If lr=3e-4 and λ=0.1, by what fraction is each weight shrunk per step?
   After 5000 steps with no gradient updates, what would weight decay do?

3. Gradient clipping preserves direction but limits magnitude.
   If the gradient vector is (3, 4) and max_norm=1:
   What is the original norm? What is the scale factor?
   What is the clipped gradient?

4. We evaluate on validation data every eval_interval steps.
   Why not evaluate every step? Why not once at the end?

5. The optimizer has two parameter groups with different weight decay.
   Biases get no weight decay. Why would applying weight decay to biases
   hurt more than help?
   (Hint: biases are added to all activations at that layer — what does
   regularizing them toward zero do to those activations?)

---

## 🧪 Experiments

**Experiment 1: Prove gradients accumulate**
Run two backward passes WITHOUT zeroing gradients between them.
Print the gradient of the first parameter after each.
Show that the second pass's gradient is ADDED to the first.
Now do it correctly (zero between passes) and show they are independent.

**Experiment 2: Learning rate sensitivity**
Run 200 training steps with learning rates: 1e-5, 1e-4, 3e-4, 1e-3, 1e-2.
Plot all five loss curves.
Which converges fastest? Which diverges? Where is the sweet spot?

**Experiment 3: Batch size effect**
Run 500 steps with batch sizes: 4, 8, 16, 32, 64.
Compare train loss curves. Do larger batches give smoother curves?
Do they converge to better or worse final loss?
How does training time change?

**Experiment 4: Weight decay comparison**
Train two models: weight_decay=0.0 and weight_decay=0.1.
Plot both validation losses.
After training, compute the mean absolute weight value for each.
Does weight decay produce smaller weights as expected?

**Experiment 5: Gradient norm tracking**
During 500 steps of training, plot the gradient norm at every step.
Do you see any spikes? After clipping, does it ever exceed 1.0?
Is there a correlation between gradient norm spikes and loss spikes?

---

> Move to Module 08 when all experiments are done.
> We run the actual full training and watch the model learn.
