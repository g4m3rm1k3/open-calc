# Module 03 — Backpropagation and Gradients

> **The big idea:** Training a neural network = adjusting weights to minimize loss. Backprop is just the **chain rule** applied to a composition of matrix operations. PyTorch computes it automatically.

---

## 3.1 What "Learning" Means

A model has parameters θ (all its weight matrices and bias vectors). We want to find θ that minimizes a **loss function** L(θ) — a scalar measuring how wrong the model is.

The process:
1. Forward pass: compute L(θ) given current θ
2. Backward pass: compute ∂L/∂θ (gradient — which direction increases loss)
3. Update: θ ← θ - η · ∂L/∂θ (step *opposite* to gradient)

Repeat thousands of times. This is **gradient descent**.

---

## 3.2 Gradients — A Quick Refresher

For a scalar function f(x₁, x₂, ..., xₙ), the gradient ∇f is the vector of partial derivatives:

```
∇f = [∂f/∂x₁, ∂f/∂x₂, ..., ∂f/∂xₙ]
```

It points in the direction of **steepest ascent**. We go opposite to decrease f.

```python
import torch
import matplotlib.pyplot as plt
import numpy as np

# Simple example: f(x) = x^2, df/dx = 2x
x = torch.tensor(3.0, requires_grad=True)   # tell PyTorch to track this
f = x ** 2                                   # f = 9

f.backward()   # compute gradient
print(f"x = {x.item()}")
print(f"f(x) = x² = {f.item()}")
print(f"df/dx = 2x = {x.grad.item()}")   # should be 6.0

# Visualize gradient descent on f(x) = x^2
x_val = 3.0
learning_rate = 0.1
history = [x_val]

for _ in range(20):
    grad = 2 * x_val         # df/dx = 2x (manual here)
    x_val = x_val - learning_rate * grad
    history.append(x_val)

xs = np.linspace(-3.5, 3.5, 200)
plt.figure(figsize=(8, 4))
plt.plot(xs, xs**2, 'steelblue', lw=2, label='f(x) = x²')
plt.scatter(history, [h**2 for h in history], c=range(len(history)),
            cmap='autumn', zorder=5, s=60)
plt.xlabel('x'); plt.ylabel('f(x)')
plt.title('Gradient Descent on f(x) = x²')
plt.legend(); plt.grid(True, alpha=0.3)
plt.tight_layout()
plt.savefig("gradient_descent.png", dpi=120)
plt.show()
print(f"Final x: {history[-1]:.6f}")   # converges to 0 (the minimum)
```

---

## 3.3 The Chain Rule — Why Backprop Works

For a composition of functions h(g(f(x))):

```
d/dx [h(g(f(x)))] = h'(g(f(x))) · g'(f(x)) · f'(x)
```

A neural network IS a composition of functions. Backprop is just the chain rule applied efficiently, working backwards from the loss.

```python
# Let's trace through a manual 2-layer network
# y = W2 @ relu(W1 @ x + b1) + b2
# Loss L = MSE(y, target)

torch.manual_seed(42)

# Parameters
W1 = torch.randn(4, 3, requires_grad=True)
b1 = torch.zeros(4,    requires_grad=True)
W2 = torch.randn(2, 4, requires_grad=True)
b2 = torch.zeros(2,    requires_grad=True)

# Input and target
x      = torch.randn(3)
target = torch.tensor([1.0, 0.0])

# --- FORWARD PASS ---
h     = torch.relu(W1 @ x + b1)   # [4]  — hidden layer
y_hat = W2 @ h + b2               # [2]  — output
loss  = ((y_hat - target) ** 2).mean()  # MSE loss

print(f"Loss: {loss.item():.4f}")

# --- BACKWARD PASS (PyTorch does this automatically!) ---
loss.backward()

print(f"∂L/∂W1 shape: {W1.grad.shape}")   # [4, 3] — same as W1
print(f"∂L/∂W2 shape: {W2.grad.shape}")   # [2, 4] — same as W2
print(f"∂L/∂b2: {b2.grad}")               # [2]
```

---

## 3.4 Autograd — PyTorch's Gradient Engine

PyTorch builds a **computation graph** during the forward pass. Every operation records what inputs it used. During `.backward()`, it walks this graph in reverse, applying the chain rule at each step.

```python
# You can inspect the graph
x = torch.tensor(2.0, requires_grad=True)
y = x * x + 3 * x + 1   # y = x² + 3x + 1

print(f"y = {y.item()}")
print(f"y.grad_fn = {y.grad_fn}")         # AddBackward0 — last op was addition

y.backward()
print(f"dy/dx = 2x + 3 = {x.grad}")      # should be 7.0

# --- Gradient accumulation gotcha ---
# Gradients ACCUMULATE in PyTorch — must zero them between steps!
x = torch.tensor(2.0, requires_grad=True)
for i in range(3):
    loss = x ** 2
    loss.backward()
    print(f"Step {i}: x.grad = {x.grad}")   # 4, 8, 12 — accumulating!

# Fix: zero the gradient each step
x.grad = None   # or optimizer.zero_grad()
```

---

## 3.5 A Full Training Loop

Here's the complete pattern you'll use for every model:

```python
import torch.optim as optim

# --- Model ---
class TinyNet(torch.nn.Module):
    def __init__(self):
        super().__init__()
        self.fc1 = torch.nn.Linear(2, 16)
        self.fc2 = torch.nn.Linear(16, 1)
    
    def forward(self, x):
        return self.fc2(torch.relu(self.fc1(x)))

model = TinyNet()

# --- Fake dataset: learn y = x1 + x2 ---
torch.manual_seed(0)
X = torch.randn(200, 2)
y = (X[:, 0] + X[:, 1]).unsqueeze(1)   # [200, 1]

# --- Optimizer ---
optimizer = optim.Adam(model.parameters(), lr=1e-3)
loss_fn   = torch.nn.MSELoss()

# --- Training loop ---
losses = []
for epoch in range(500):
    # 1. Forward pass
    y_hat = model(X)
    loss  = loss_fn(y_hat, y)
    
    # 2. Zero gradients (ALWAYS before backward)
    optimizer.zero_grad()
    
    # 3. Backward pass
    loss.backward()
    
    # 4. Update weights
    optimizer.step()
    
    losses.append(loss.item())
    if epoch % 100 == 0:
        print(f"Epoch {epoch:4d}  Loss: {loss.item():.6f}")

plt.figure(figsize=(8, 4))
plt.plot(losses, color='steelblue')
plt.xlabel('Epoch'); plt.ylabel('MSE Loss')
plt.title('Training Loss Curve'); plt.grid(True, alpha=0.3)
plt.yscale('log')
plt.tight_layout()
plt.savefig("loss_curve.png", dpi=120)
plt.show()
```

---

## 3.6 Cross-Entropy Loss — What LLMs Minimize

Language models predict the next token. The loss is **cross-entropy**:

```
L = -log P(correct_token)
```

If the model assigns probability 0.9 to the correct next word: L = -log(0.9) ≈ 0.1 (good)
If it assigns probability 0.01: L = -log(0.01) ≈ 4.6 (bad)

```python
# Cross entropy for a toy vocabulary of 5 tokens
vocab_size = 5

# Model produces "logits" (raw scores before softmax)
logits = torch.tensor([1.5, 0.3, -0.8, 2.1, 0.0])   # [vocab_size]

# Correct next token is index 3
target = torch.tensor(3)

# Cross-entropy loss:
loss = torch.nn.functional.cross_entropy(logits.unsqueeze(0), target.unsqueeze(0))
print(f"Loss: {loss.item():.4f}")

# What this is doing:
probs = torch.softmax(logits, dim=0)
print(f"Probabilities: {probs.detach().numpy().round(3)}")
print(f"P(correct=3): {probs[3].item():.4f}")
print(f"-log(P(3)): {-torch.log(probs[3]).item():.4f}")   # same as loss

# "Perplexity" — common LLM metric
# Lower is better. Random guessing gives perplexity = vocab_size
perplexity = torch.exp(loss)
print(f"Perplexity: {perplexity.item():.4f}")
```

---

## 3.7 Gradient Clipping

During LLM training, gradients can become very large (exploding gradients), causing unstable training. **Gradient clipping** caps the gradient norm:

```python
model = TinyNet()
optimizer = optim.Adam(model.parameters(), lr=1e-3)

X = torch.randn(32, 2)
y = X.sum(dim=1, keepdim=True)

optimizer.zero_grad()
loss = loss_fn(model(X), y)
loss.backward()

# Check gradient norm before clipping
total_norm_before = torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=float('inf'))
print(f"Gradient norm before clipping: {total_norm_before:.4f}")

# Clip to max norm of 1.0
total_norm_after = torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
print(f"Gradient norm after clipping:  {total_norm_after:.4f}")   # ≤ 1.0

optimizer.step()
```

GPT-style models typically use `max_norm=1.0`.

---

## 3.8 What the Gradients Tell You

```python
# You can inspect gradients to understand what the model is learning
model = TinyNet()
optimizer = optim.Adam(model.parameters(), lr=1e-3)

X = torch.randn(64, 2)
y = (X[:, 0] * 2 - X[:, 1]).unsqueeze(1)  # y depends more on x1 than x2

optimizer.zero_grad()
loss = loss_fn(model(X), y)
loss.backward()

print("Gradient statistics:")
for name, param in model.named_parameters():
    if param.grad is not None:
        g = param.grad
        print(f"  {name:12s}  shape={str(param.shape):15s}  "
              f"mean={g.mean().item():+.4f}  std={g.std().item():.4f}")
```

---

## ✅ Module 03 Summary

| Step | What happens |
|------|-------------|
| Forward pass | Compute loss from input through model |
| `.backward()` | Chain rule through computation graph |
| `optimizer.step()` | Nudge weights opposite to gradient |
| `optimizer.zero_grad()` | Reset gradients for next step |
| Cross-entropy | The loss LLMs minimize: `-log P(correct)` |
| Gradient clipping | Cap gradient norm to stabilize training |

---

## 🧪 Experiments to Try

1. Change the learning rate to 0.1 and then 0.00001. What happens to the loss curve?
2. Try `optim.SGD` vs `optim.Adam`. Adam is almost always better for LLMs — why?
3. Print `loss.item()` every step. What's perplexity when the model is random vs. trained?

---

> **Next:** `04_attention_mechanism.md` — the heart of every transformer, built from matrix operations →
