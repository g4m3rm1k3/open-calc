# Module 02 — Probability, Loss, and Gradients
### Where does the loss function come from? How does the model learn? Derived from scratch.

---

## How to Use This Module

Same as module 01. Read the explanation. Then open `02_probability_gradients.py`
and type every line, including every comment.

This module covers two big ideas:
1. Where the loss function comes from (information theory → cross-entropy)
2. How the model learns (derivatives → gradients → gradient descent)

Both are derived from first principles. No formulas handed to you without explanation.

---

## PART 1 — Probability and the Loss Function

---

### 1.1 What the Model Needs to Output

A language model predicts the next token.

At every position in a sequence, the model looks at everything that came before
and produces a guess about what comes next. But it does not just pick one answer —
it produces a PROBABILITY DISTRIBUTION over all possible next tokens.

A probability distribution is a list of numbers where:
- Every number is between 0 and 1
- All numbers add up to exactly 1.0
- Each number represents how likely that token is to be next

For example, if our vocabulary is just 5 words:
```
["the", "a", "cat", "dog", "sat"]

P("the") = 0.40   ← most likely next word
P("a")   = 0.25
P("cat") = 0.15
P("dog") = 0.12
P("sat") = 0.08
Total    = 1.00   ← must always sum to 1
```

The model is saying: "given what I have seen so far, I think 'the' is most likely."

---

### 1.2 What Is a Good Prediction?

If the actual next word was "cat" and the model gave it probability 0.15,
is that good or bad?

We need a single number that measures this — the LOSS.

What should the loss function do?
- If the model gives probability 1.0 to the correct word: loss = 0 (perfect)
- If the model gives probability 0.0 to the correct word: loss = ∞ (catastrophically wrong)
- The higher the probability given to the correct word: the lower the loss
- The loss must be smooth — it needs to have gradients everywhere so we can train with it

---

### 1.3 Surprise — The Foundation of the Loss Function

Claude Shannon asked this question in 1948:
**How do you measure the "information content" of a message?**

His insight: information is related to surprise.
- "The sun rose this morning" contains almost no information — you already knew that.
- "It snowed in the Sahara Desert" contains a lot of information — that is surprising.

More formally: if something has probability p of happening,
and it happens, how surprised are you?

Shannon derived that the right way to measure surprise is:

```
I(p) = -log(p)
```

(We use natural log, written "log" or "ln", with base e ≈ 2.718)

Let's check this makes sense:
- p = 1.0 (certain to happen): I(1.0) = -log(1.0) = -0 = 0. Not surprised at all. ✓
- p = 0.5 (coin flip): I(0.5) = -log(0.5) ≈ 0.693. Moderately surprised. ✓
- p = 0.01 (1 in 100): I(0.01) = -log(0.01) ≈ 4.605. Very surprised. ✓
- p → 0 (essentially impossible): I(p) → ∞. Infinitely surprised. ✓

**Why logarithm specifically?**

Two reasons:
1. It has the right behavior (above)
2. It has a special property: log(a × b) = log(a) + log(b)

That second property means: if two independent events both happen,
the total surprise equals the sum of individual surprises.
This is the only function with this property — Shannon proved it.

---

### 1.4 Cross-Entropy — Deriving the Loss Function

We have a "true" distribution P (what actually happened)
and a "predicted" distribution Q (what the model guessed).

We want to measure how well Q describes P.

The **cross-entropy** of P and Q is:

```
H(P, Q) = -Σ P(x) × log(Q(x))
            x
```

In English: for each possible outcome x, multiply:
- P(x): how often x actually happens (in the true distribution)
- log(Q(x)): how surprised we are when x happens according to Q

Sum this over all possible outcomes.

**For language modeling, P is simple:**
When the correct next token is "cat" (index 2 in our vocabulary):
```
P("the") = 0     P("a") = 0     P("cat") = 1     P("dog") = 0     P("sat") = 0
```

This is called a **one-hot** distribution: all probability at one outcome.

When we substitute this P into the cross-entropy formula, almost everything cancels:
```
H(P, Q) = -[0 × log(Q("the"))
          + 0 × log(Q("a"))
          + 1 × log(Q("cat"))    ← only this term survives
          + 0 × log(Q("dog"))
          + 0 × log(Q("sat"))]

        = -log(Q("cat"))
```

**The loss function is simply: the negative log of the probability
the model assigned to the correct next token.**

Nothing more. That is cross-entropy for language modeling.

---

### 1.5 Softmax — Converting Scores to Probabilities

The model does not directly output probabilities.
It outputs raw numbers called **logits** — one for each vocabulary token.
Logits can be any real number: positive, negative, large, small.

We need to convert these to probabilities (all positive, sum to 1).

The function that does this is **softmax**:

```
softmax(z)ᵢ = exp(zᵢ) / Σⱼ exp(zⱼ)
```

In English:
- exp(zᵢ) makes every value positive (exp is always > 0, for any input)
- Dividing by the sum of all exp values makes them sum to 1

**Why exp?**
- Makes all values positive: exp(anything) > 0 always
- Amplifies differences: exp(3) / exp(2) = e ≈ 2.718, so logit differences get magnified
- exp is its own derivative — this matters a lot for training (module 04)

**Numerical stability issue:**
If logits are large (like 1000), exp(1000) overflows to infinity.
Solution: subtract the maximum logit before exponentiating.

```
softmax(z)ᵢ = exp(zᵢ - max(z)) / Σⱼ exp(zⱼ - max(z))
```

This gives the exact same result (max cancels in numerator and denominator)
but avoids overflow. We always do this in code.

**Proof that subtracting max gives the same result:**
Let c = max(z). Then:
```
exp(zᵢ - c) / Σⱼ exp(zⱼ - c)
= [exp(zᵢ) × exp(-c)] / [Σⱼ exp(zⱼ) × exp(-c)]
= exp(zᵢ) / Σⱼ exp(zⱼ)          ← exp(-c) cancels
```
Identical to the original formula.

---

## PART 2 — Derivatives and Gradients

---

### 2.1 What a Derivative Is — From Scratch

If you have not worked with derivatives much, here is what they are.

A function f(x) takes a number x and produces a number f(x).
The **derivative** f'(x) answers this question:

**"If I increase x by a tiny amount, how much does f(x) change?"**

More precisely: if I change x by a tiny amount h, f changes by approximately f'(x) × h.

The formal definition:
```
f'(x) = lim[h→0] (f(x+h) - f(x)) / h
```

In plain English: take the change in f, divide by the change in x,
take the limit as the change gets infinitely small. That ratio is the derivative.

**Geometric meaning:**
The derivative is the slope of the function at that point.
If f(x) = x², the graph is a parabola. At x=2, the slope is 4 (going up steeply).
At x=0, the slope is 0 (flat — that is the bottom of the parabola).

**Key derivatives you need:**

1. Power rule: if f(x) = xⁿ, then f'(x) = n × xⁿ⁻¹
   - f(x) = x²: f'(x) = 2x
   - f(x) = x³: f'(x) = 3x²
   - f(x) = x:  f'(x) = 1

2. Exponential: if f(x) = exp(x), then f'(x) = exp(x)
   The exponential function is its own derivative. This is special.
   It is why we use exp in softmax — the math works out beautifully.

3. Logarithm: if f(x) = log(x), then f'(x) = 1/x
   This is why log in the loss function gives such clean gradients.

4. Constant: if f(x) = c (any constant), then f'(x) = 0
   Constants do not change, so their derivative is zero.

---

### 2.2 The Chain Rule — How Gradients Flow Backwards

Neural networks are functions composed of functions.
The loss L is a function of the output, which is a function of layer N,
which is a function of layer N-1, and so on back to the input.

The **chain rule** tells us how to differentiate a composition of functions.

If h(x) = f(g(x)), then:
```
h'(x) = f'(g(x)) × g'(x)
```

In English: "the derivative of the outside function evaluated at the inside,
times the derivative of the inside function."

**Worked example:**
h(x) = (x² + 1)³

We can write this as f(g(x)) where:
- g(x) = x² + 1    (the inside function)
- f(u) = u³         (the outside function)

Derivatives:
- g'(x) = 2x
- f'(u) = 3u²

Chain rule:
```
h'(x) = f'(g(x)) × g'(x)
       = 3(x² + 1)² × 2x
       = 6x(x² + 1)²
```

**Why this matters for LLMs:**
The loss function is:
```
L = cross_entropy(softmax(W_final × ... × W₁ × embedding(token)))
```

That is a massive composition of functions. The chain rule lets us compute
∂L/∂W₁ (how the loss changes with respect to the first weight matrix)
by multiplying together a chain of derivatives, starting from the output
and working backwards. This is called **backpropagation**.

---

### 2.3 From Derivatives to Gradients

A derivative is for functions of ONE variable: f'(x) = how does f change when x changes?

A **gradient** is for functions of MANY variables: ∇f(x) = how does f change when ANY xᵢ changes?

The gradient is a VECTOR of partial derivatives:
```
∇f(x) = [∂f/∂x₁, ∂f/∂x₂, ..., ∂f/∂xₙ]
```

Each component ∂f/∂xᵢ is a partial derivative: how does f change when
only xᵢ changes (while all other variables are held fixed)?

**For a weight matrix W in a neural network:**
The gradient ∇W L is a matrix of the same shape as W.
Each element [∇W L]ᵢⱼ = ∂L/∂Wᵢⱼ = "if I increase weight Wᵢⱼ by a tiny amount,
how much does the loss change?"

If ∂L/∂Wᵢⱼ is positive: increasing Wᵢⱼ increases the loss (bad).
If ∂L/∂Wᵢⱼ is negative: increasing Wᵢⱼ decreases the loss (good).

---

### 2.4 Gradient Descent — How the Model Learns

We have:
- A model with parameters W (all the weight matrices and biases)
- A loss function L(W) that measures how wrong the model is
- The gradient ∇W L that tells us which direction increases the loss

To decrease the loss: move W in the OPPOSITE direction of the gradient.

```
W ← W - η × ∇W L
```

η (eta) is the **learning rate** — how big a step to take.

This is **gradient descent**. Take a small step downhill on the loss landscape.
Repeat thousands of times. The model gets better at every step.

**Intuition:**
Imagine you are on a hilly landscape and you are trying to find the lowest point.
The gradient tells you which direction is "uphill" from where you stand.
Move opposite to that direction. Take small steps. Repeat.

**Why small steps?**
The gradient is only accurate locally — it describes the slope at your current point.
If you take a giant step, the landscape might curve and you could step past the valley
into a high point on the other side. Small steps keep you in the region where
the local gradient is a reliable guide.

---

### 2.5 Deriving the Gradient of Cross-Entropy Loss

This is the calculation that happens at the output of the model every training step.

We have:
- Logits z ∈ ℝᵛ (one number per vocabulary token)
- Probabilities p = softmax(z)
- Loss L = -log(pₖ) where k is the correct token index

We want: ∂L/∂zᵢ for each logit zᵢ

**Step 1: Derivative of log**
```
∂L/∂pₖ = ∂/∂pₖ [-log(pₖ)] = -1/pₖ
```

**Step 2: Derivative of softmax** (the tricky part)

Recall: pᵢ = exp(zᵢ) / S  where  S = Σⱼ exp(zⱼ)

We need ∂pₖ/∂zᵢ. There are two cases:

**Case 1: i = k** (differentiating the correct token's logit w.r.t. itself)
```
pₖ = exp(zₖ) / S

Using the quotient rule (d/dx [f/g] = (f'g - fg') / g²):
∂pₖ/∂zₖ = (exp(zₖ) × S - exp(zₖ) × exp(zₖ)) / S²
          = exp(zₖ)/S × (S - exp(zₖ)) / S
          = pₖ × (1 - pₖ)
```

**Case 2: i ≠ k** (differentiating the correct token's probability w.r.t. a different logit)
```
pₖ = exp(zₖ) / S

zᵢ only appears in S = Σⱼ exp(zⱼ), so:
∂S/∂zᵢ = exp(zᵢ)

∂pₖ/∂zᵢ = exp(zₖ) × (-1/S²) × exp(zᵢ)
          = -(exp(zₖ)/S) × (exp(zᵢ)/S)
          = -pₖ × pᵢ
```

**Step 3: Chain rule — putting it together**

∂L/∂zᵢ = (∂L/∂pₖ) × (∂pₖ/∂zᵢ)

**Case i = k:**
```
∂L/∂zₖ = (-1/pₖ) × pₖ(1 - pₖ) = -(1 - pₖ) = pₖ - 1
```

**Case i ≠ k:**
```
∂L/∂zᵢ = (-1/pₖ) × (-pₖ × pᵢ) = pᵢ
```

**The beautiful result:**
```
∂L/∂zᵢ = pᵢ - 1{i=k}
```

Where 1{i=k} means 1 if i equals k, otherwise 0. This is called the "one-hot target".

**In English:** the gradient is just (predicted probability - target).
- For the correct token: gradient = pₖ - 1 (negative if pₖ < 1, which pushes logit up)
- For wrong tokens: gradient = pᵢ (positive, which pushes those logits down)

This is why softmax + cross-entropy is the standard combination.
The gradient could not be simpler. They were designed for each other.

---

## PART 3 — Writing the Code

Create a new file called `02_probability_gradients.py`.
Type everything below including all comments.

---

### 3.1 Setup and Building the Loss Function

```python
# 02_probability_gradients.py
#
# In this file we build:
# 1. Softmax — converts logits to probabilities
# 2. Cross-entropy loss — measures how wrong the model is
# 3. Numerical gradient verification — confirm our math is right
# 4. Gradient descent — the core learning algorithm
# 5. PyTorch autograd — how PyTorch does all this automatically

import math
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
```

```python
# -------------------------------------------------------
# SOFTMAX — CONVERTING LOGITS TO PROBABILITIES
#
# Plain English: take any list of numbers (the logits),
# and convert them to a probability distribution
# (all positive, summing to 1).
#
# Formula: softmax(z)ᵢ = exp(zᵢ) / Σⱼ exp(zⱼ)
#
# We subtract the maximum for numerical stability —
# derived in section 1.5 above.
# -------------------------------------------------------

def softmax(logits):
    # logits: a list or array of real numbers (any range)
    # returns: a list of probabilities (positive, sum to 1)
    
    # Step 1: find the maximum logit
    # We subtract this from all logits before exponentiating.
    # This prevents overflow when logits are very large.
    # The mathematical result is identical — we proved this above.
    max_logit = max(logits)
    
    # Step 2: compute exp(zᵢ - max) for each logit
    # After subtraction, the largest value is 0, so exp(0)=1 is the max.
    # All values are ≤ 0, so all exp values are ≤ 1. No overflow.
    shifted_exps = [math.exp(z - max_logit) for z in logits]
    
    # Step 3: sum all the exp values
    # We need this to normalize (make them sum to 1)
    total = sum(shifted_exps)
    
    # Step 4: divide each exp by the total
    # Now each value is positive and they sum to 1 — a valid probability distribution
    probabilities = [e / total for e in shifted_exps]
    
    return probabilities


# Test it
print("=== SOFTMAX TESTS ===")
print()

# Basic test — we can verify the math by hand
logits_simple = [1.0, 2.0, 3.0]
probs_simple  = softmax(logits_simple)
print(f"Logits: {logits_simple}")
print(f"Probs:  {[round(p, 4) for p in probs_simple]}")
print(f"Sum:    {sum(probs_simple):.6f}  ← must be exactly 1.0")
print()

# What happens with very large logits?
# Without stability fix: exp(1000) = overflow
# With stability fix: works fine
logits_large = [1000.0, 999.0, 998.0]
probs_large  = softmax(logits_large)
print(f"Large logits: {logits_large}")
print(f"Probs:  {[round(p, 4) for p in probs_large]}")
print(f"Notice: the model becomes very confident (peaked distribution)")
print()

# Temperature scaling: dividing logits by T before softmax
# T < 1: makes distribution more peaked (more confident)
# T > 1: makes distribution more flat (more uncertain)
# We use this during text generation
logits_temp = [3.0, 2.0, 1.0, 0.0, -1.0]
for T in [0.5, 1.0, 2.0]:
    scaled = [z / T for z in logits_temp]
    probs  = softmax(scaled)
    print(f"T={T}: {[round(p, 3) for p in probs]}")
print("Lower T = more peaked = model sounds more confident")
print()
```

```python
# -------------------------------------------------------
# CROSS-ENTROPY LOSS — MEASURING HOW WRONG THE MODEL IS
#
# Plain English: take the negative log of the probability
# the model assigned to the correct next token.
#
# Loss = -log(P(correct token))
#
# This comes directly from: the loss is the surprise
# that the model experiences when the correct answer is revealed.
# -------------------------------------------------------

def cross_entropy_loss(logits, correct_index):
    # logits: raw scores from the model, one per vocabulary token
    # correct_index: which token was actually the correct next token
    # returns: the loss (a single number, always >= 0)
    
    # Step 1: convert logits to probabilities
    probs = softmax(logits)
    
    # Step 2: get the probability assigned to the correct token
    p_correct = probs[correct_index]
    
    # Step 3: compute -log(p_correct)
    # Guard against log(0) which is undefined (-infinity)
    # In practice, softmax never gives exactly 0, but we clip to be safe
    p_correct = max(p_correct, 1e-12)
    
    loss = -math.log(p_correct)
    
    return loss, probs  # return probs too so we can inspect them


# Test with a vocabulary of 5 words: ["the", "a", "cat", "dog", "sat"]
# Correct answer is index 2 ("cat")
vocab = ["the", "a", "cat", "dog", "sat"]

print("=== CROSS-ENTROPY LOSS EXAMPLES ===")
print()

scenarios = [
    ("Model is confident and right",  [0.1, 0.1, 3.0, 0.1, 0.1]),   # high logit for cat
    ("Model is uncertain",            [1.0, 1.0, 1.0, 1.0, 1.0]),   # all equal
    ("Model is confident and wrong",  [3.0, 0.1, 0.1, 0.1, 0.1]),   # high logit for "the"
]

for description, logits in scenarios:
    loss, probs = cross_entropy_loss(logits, correct_index=2)
    p_correct   = probs[2]
    perplexity  = math.exp(loss)   # exp(loss) — explained below
    
    print(f"Scenario: {description}")
    print(f"  Logits: {logits}")
    print(f"  Probabilities:")
    for word, p in zip(vocab, probs):
        bar     = "█" * int(p * 40)
        correct = " ← CORRECT" if word == "cat" else ""
        print(f"    {word:5s}: {p:.4f}  {bar}{correct}")
    print(f"  Loss:       {loss:.4f}")
    print(f"  Perplexity: {perplexity:.2f}")
    print()
```

```python
# -------------------------------------------------------
# PERPLEXITY — THE HUMAN-READABLE VERSION OF LOSS
#
# Plain English: loss numbers like 2.3 or 0.5 are hard to interpret.
# Perplexity = exp(loss) and has a nice interpretation:
#
# "The model was as uncertain as if it were choosing uniformly
#  among this many options."
#
# Random guessing over V vocabulary items: loss = log(V), perplexity = V
# Perfect model: loss = 0, perplexity = 1
# Good language model: perplexity ≈ 10-50 (depending on domain)
#
# When you train your model, watch perplexity drop from ~vocab_size
# toward single or double digits. Each drop means the model is learning.
# -------------------------------------------------------

vocab_sizes = [70, 1000, 50000]   # our char vocab, medium, GPT-size

print("=== PERPLEXITY BASELINES ===")
print()
print("What a random model achieves (no learning):")
for v in vocab_sizes:
    random_loss = math.log(v)
    print(f"  vocab_size={v:6d}:  loss={random_loss:.3f}  perplexity={v}")
print()
print("Our char model will start at perplexity ≈ 70 (vocab size)")
print("After training we expect perplexity ≈ 5-15")
print("That means: on average, the model chooses between 5-15 chars, not 70")
print()
```

```python
# -------------------------------------------------------
# VISUALIZING THE LOSS FUNCTION
# -------------------------------------------------------

fig, axes = plt.subplots(1, 2, figsize=(12, 4.5))

# Left plot: Loss as a function of P(correct)
p_values    = np.linspace(0.001, 0.999, 500)
loss_values = -np.log(p_values)

axes[0].plot(p_values, loss_values, color='steelblue', lw=2.5)

# Annotate key points
key_points = [(0.01, -math.log(0.01)), (0.1, -math.log(0.1)),
              (0.5, -math.log(0.5)),   (0.9, -math.log(0.9))]
for p, l in key_points:
    axes[0].scatter([p], [l], color='tomato', zorder=5, s=60)
    axes[0].annotate(
        f"p={p} → loss={l:.2f}",
        xy=(p, l),
        xytext=(p + 0.05, l + 0.3),
        fontsize=8,
        color='tomato'
    )

axes[0].set_xlabel("P(correct token)", fontsize=11)
axes[0].set_ylabel("Cross-Entropy Loss  [-log(p)]", fontsize=11)
axes[0].set_title(
    "Loss vs. Probability of Correct Token\n"
    "Higher confidence in the right answer = lower loss",
    fontsize=10
)
axes[0].set_ylim(0, 7)
axes[0].grid(True, alpha=0.3)

# Right plot: The gradient of the loss (-1/p)
# This shows why the gradient is largest when the model is most wrong
gradient_magnitudes = 1.0 / p_values   # magnitude of ∂L/∂p = -1/p

axes[1].plot(p_values, gradient_magnitudes, color='tomato', lw=2.5)
axes[1].set_xlabel("P(correct token)", fontsize=11)
axes[1].set_ylabel("|∂L/∂p| = 1/p", fontsize=11)
axes[1].set_title(
    "Gradient Magnitude\n"
    "Model gets the strongest learning signal when most wrong",
    fontsize=10
)
axes[1].set_ylim(0, 20)
axes[1].grid(True, alpha=0.3)
axes[1].annotate(
    "Large gradient\n(model is very wrong)",
    xy=(0.05, 20),
    xytext=(0.2, 17),
    fontsize=8,
    color='tomato',
    arrowprops=dict(arrowstyle="->", color='tomato')
)

plt.suptitle("Cross-Entropy Loss: What We Minimize During Training", fontsize=12)
plt.tight_layout()
plt.savefig("02a_loss_function.png", dpi=130)
print("Saved: 02a_loss_function.png")
print()
print("Key insight from the right plot:")
print("The gradient is largest when the model is most wrong (p close to 0).")
print("This means training automatically focuses effort on hard mistakes.")
```

```python
# -------------------------------------------------------
# NUMERICAL GRADIENT VERIFICATION
#
# Before we trust any analytical gradient formula, we verify it
# using the "finite difference" method.
#
# The definition of derivative:
#   f'(x) ≈ (f(x+h) - f(x-h)) / (2h)   for small h
#
# This is always correct (it is the definition of derivative).
# It is slow but never lies.
#
# We use this to VERIFY our derived gradients.
# If they match, our derivation was correct.
# -------------------------------------------------------

def numerical_gradient(loss_fn, params, h=1e-5):
    # loss_fn: a function that takes params and returns a scalar loss
    # params: a numpy array of parameters
    # h: step size (small)
    # returns: gradient array (same shape as params)
    
    grad = np.zeros_like(params)
    
    for i in range(len(params)):
        # Compute f(params with params[i] increased by h)
        params_plus = params.copy()
        params_plus[i] += h
        
        # Compute f(params with params[i] decreased by h)
        params_minus = params.copy()
        params_minus[i] -= h
        
        # Central difference approximation
        # (more accurate than one-sided: (f(x+h) - f(x)) / h)
        grad[i] = (loss_fn(params_plus) - loss_fn(params_minus)) / (2 * h)
    
    return grad


# Verify our derived gradient: ∂L/∂zᵢ = pᵢ - 1{i=correct}
def softmax_np(z):
    z = z - z.max()           # numerical stability
    e = np.exp(z)
    return e / e.sum()

def cross_entropy_np(logits, correct_idx):
    probs = softmax_np(logits)
    return -np.log(probs[correct_idx] + 1e-12)

def analytical_grad(logits, correct_idx):
    # Our derived formula: gradient = predicted_probs - one_hot_target
    probs = softmax_np(logits)
    grad  = probs.copy()       # start with predicted probs
    grad[correct_idx] -= 1.0   # subtract 1 from the correct token
    return grad
    # For correct token:   pₖ - 1  (negative if pₖ < 1, meaning: increase this logit)
    # For other tokens:    pᵢ      (positive, meaning: decrease these logits)


# Compare analytical gradient to numerical gradient
np.random.seed(0)
logits_test = np.array([2.0, 0.5, 1.5, -1.0, 0.2])
correct_idx = 2

grad_analytical = analytical_grad(logits_test, correct_idx)
grad_numerical  = numerical_gradient(
    lambda z: cross_entropy_np(z, correct_idx),
    logits_test
)

print("=== GRADIENT VERIFICATION ===")
print()
print(f"Logits:       {logits_test}")
print(f"Correct idx:  {correct_idx}")
print()
probs = softmax_np(logits_test)
print(f"Probabilities:    {probs.round(4)}")
print(f"Target (one-hot): {[1 if i==correct_idx else 0 for i in range(5)]}")
print()
print(f"{'Dim':>4}  {'Analytical':>12}  {'Numerical':>12}  {'Match':>6}")
for i, (a, n) in enumerate(zip(grad_analytical, grad_numerical)):
    match = abs(a - n) < 1e-6
    print(f"{i:>4}  {a:>12.8f}  {n:>12.8f}  {'✓' if match else '✗  ← MISMATCH':>6}")
print()
print(f"All match: {np.allclose(grad_analytical, grad_numerical, atol=1e-6)}")
print()
print("The gradient is simply: predicted_prob - target")
print(f"  Token 2 (correct): {probs[2]:.4f} - 1 = {probs[2]-1:.4f}  ← negative = increase logit")
print(f"  Token 0 (wrong):   {probs[0]:.4f} - 0 = {probs[0]:.4f}   ← positive = decrease logit")
```

```python
# -------------------------------------------------------
# GRADIENT DESCENT — THE LEARNING ALGORITHM
#
# We have the gradient. Now we use it to update parameters.
#
# Update rule: θ ← θ - η × ∇L(θ)
#   θ (theta): the parameters we are updating
#   η (eta):   learning rate — how big a step to take
#   ∇L(θ):    the gradient — which direction increases the loss
#   We go OPPOSITE to the gradient to DECREASE the loss
# -------------------------------------------------------

print("=== GRADIENT DESCENT DEMO ===")
print()
print("Finding the minimum of f(w) = (w - 3)²")
print("True minimum is at w = 3  (where f(w) = 0)")
print()

# The function we want to minimize
def f(w):
    # f(w) = (w - 3)²
    # This is a simple parabola with minimum at w = 3
    return (w - 3.0) ** 2

# Its exact derivative (gradient for 1D)
def df(w):
    # f'(w) = 2(w - 3)
    # Positive when w > 3: gradient says "go left" (decrease w)
    # Negative when w < 3: gradient says "go right" (increase w)
    # Zero when w = 3: we are at the minimum
    return 2.0 * (w - 3.0)

w              = 0.0   # start at w=0, far from the minimum
learning_rate  = 0.1   # step size
history_w      = [w]
history_loss   = [f(w)]
history_grad   = []

print(f"{'Step':>5}  {'w':>8}  {'f(w)':>10}  {'gradient':>10}  {'direction'}")
print("-" * 60)

for step in range(1, 26):
    grad     = df(w)                    # compute gradient
    w        = w - learning_rate * grad # step opposite to gradient
    loss_val = f(w)
    
    history_w.append(w)
    history_loss.append(loss_val)
    history_grad.append(grad)
    
    direction = "→ increase w" if grad < 0 else "← decrease w"
    
    if step <= 10 or step == 25:
        print(f"{step:>5}  {w:>8.4f}  {loss_val:>10.6f}  {grad:>10.4f}  {direction}")

print()
print(f"Final w = {w:.6f}  (should be close to 3.0)")
print(f"Final loss = {f(w):.8f}  (should be close to 0)")
```

```python
# -------------------------------------------------------
# VISUALIZING GRADIENT DESCENT
# -------------------------------------------------------

fig, axes = plt.subplots(1, 2, figsize=(13, 4.5))

# Left: The parabola with the gradient descent path
w_range = np.linspace(-0.5, 6.5, 300)
f_range = (w_range - 3) ** 2

axes[0].plot(w_range, f_range, color='steelblue', lw=2.5, label='f(w) = (w-3)²')
axes[0].scatter(
    history_w, [f(w_val) for w_val in history_w],
    c=range(len(history_w)),  # color by step number (dark=early, light=late)
    cmap='autumn',
    s=50,
    zorder=5,
    label='Gradient descent steps'
)

# Connect the dots to show the path
axes[0].plot(
    history_w, [f(w_val) for w_val in history_w],
    color='gray', lw=0.8, alpha=0.5
)

axes[0].axvline(3.0, color='green', linestyle='--', alpha=0.7, label='True minimum (w=3)')
axes[0].set_xlabel("w (parameter value)", fontsize=11)
axes[0].set_ylabel("Loss f(w)", fontsize=11)
axes[0].set_title("Gradient Descent on a Simple Function\n(dots go from red=early to yellow=late)")
axes[0].legend(fontsize=8)
axes[0].grid(True, alpha=0.3)

# Right: Loss over training steps
axes[1].plot(history_loss, color='tomato', lw=2.5)
axes[1].set_xlabel("Training Step", fontsize=11)
axes[1].set_ylabel("Loss", fontsize=11)
axes[1].set_title("Loss Decreasing During Training\n(this is what you will see for the LLM too)")
axes[1].grid(True, alpha=0.3)
axes[1].set_yscale('log')   # log scale shows the decrease more clearly

plt.suptitle("Gradient Descent: Moving Downhill on the Loss Landscape", fontsize=12)
plt.tight_layout()
plt.savefig("02b_gradient_descent.png", dpi=130)
print("Saved: 02b_gradient_descent.png")
print()
```

```python
# -------------------------------------------------------
# PYTORCH AUTOGRAD — THE SAME THING, AUTOMATICALLY
#
# Everything above is what PyTorch does internally.
# When you call loss.backward(), PyTorch:
#   1. Looks at the computation graph built during the forward pass
#   2. Walks it backwards from the loss
#   3. Applies the chain rule at each operation
#   4. Stores gradients in each tensor's .grad attribute
#
# We use PyTorch for this because doing it manually for millions
# of parameters is impractical.
# But now you know WHAT it is doing — it is just the chain rule.
# -------------------------------------------------------

import torch

print("=== PYTORCH AUTOGRAD VERIFICATION ===")
print()
print("Verifying that PyTorch's gradient matches our analytical formula")
print()

# Create logits as a PyTorch tensor
# requires_grad=True tells PyTorch to track this tensor for gradients
logits_torch = torch.tensor(
    [2.0, 0.5, 1.5, -1.0, 0.2],
    requires_grad=True    # ← this is the key flag
)
correct_idx_torch = 2

# Forward pass: compute loss
# torch.nn.functional.cross_entropy combines softmax + cross_entropy
# It takes logits (NOT probabilities) as input — it does softmax internally
import torch.nn.functional as F

loss_torch = F.cross_entropy(
    logits_torch.unsqueeze(0),          # [1, 5] — F.cross_entropy expects a batch
    torch.tensor([correct_idx_torch])   # [1]    — the correct class
)

print(f"Loss (PyTorch):     {loss_torch.item():.6f}")
print(f"Loss (our formula): {cross_entropy_np(logits_test, correct_idx):.6f}")
print()

# Backward pass: compute gradients
# This applies the chain rule backwards through the computation graph
loss_torch.backward()

# The gradient is now stored in logits_torch.grad
pytorch_grad    = logits_torch.grad.numpy()
analytical_grad_result = analytical_grad(logits_test, correct_idx)

print(f"{'Dim':>4}  {'PyTorch grad':>14}  {'Our formula':>14}  {'Match':>6}")
for i, (p, a) in enumerate(zip(pytorch_grad, analytical_grad_result)):
    match = abs(p - a) < 1e-5
    print(f"{i:>4}  {p:>14.8f}  {a:>14.8f}  {'✓' if match else '✗':>6}")
print()
print(f"All match: {np.allclose(pytorch_grad, analytical_grad_result, atol=1e-5)}")
print()
print("PyTorch computed the SAME gradient we derived by hand.")
print("It does this automatically for any computation graph.")
print("That is why we use it — not for magic, but for convenience.")
```

```python
# -------------------------------------------------------
# THE FULL TRAINING LOOP — A PREVIEW
#
# Everything we have built in this module comes together
# in four lines that repeat for every training step:
#
#   1. logits, loss = model(input, target)   ← forward pass
#   2. optimizer.zero_grad()                  ← clear old gradients
#   3. loss.backward()                        ← compute new gradients
#   4. optimizer.step()                       ← update parameters
#
# Let us see this on a tiny toy problem to make it concrete.
# We will build the real training loop in module 08.
# -------------------------------------------------------

import torch
import torch.nn as nn

torch.manual_seed(42)

# Toy problem: learn y = 2x + 1
# The model has one weight and one bias.
# We will watch gradient descent find the true values.

# Data
x_data = torch.linspace(-3, 3, 100).unsqueeze(1)      # [100, 1]
y_data = 2.0 * x_data + 1.0 + 0.2 * torch.randn_like(x_data)  # y=2x+1 with noise

# Model: one linear layer (one weight w, one bias b)
# Initially w and b are random
model_toy = nn.Linear(1, 1)
print(f"Initial weight: {model_toy.weight.item():.4f}  (true value: 2.0)")
print(f"Initial bias:   {model_toy.bias.item():.4f}   (true value: 1.0)")
print()

optimizer = torch.optim.SGD(model_toy.parameters(), lr=0.01)  # vanilla gradient descent
loss_fn   = nn.MSELoss()  # mean squared error (not cross entropy — this is regression)

losses = []
for step in range(200):
    # Step 1: Forward pass — compute prediction and loss
    y_pred = model_toy(x_data)
    loss   = loss_fn(y_pred, y_data)
    losses.append(loss.item())
    
    # Step 2: Clear gradients from previous step
    # Gradients ACCUMULATE in PyTorch — you must zero them each step
    # If you skip this, gradients add up incorrectly
    optimizer.zero_grad()
    
    # Step 3: Backward pass — compute gradients via chain rule
    loss.backward()
    
    # Step 4: Update parameters — move opposite to gradient
    optimizer.step()

print(f"After 200 steps:")
print(f"  Learned weight: {model_toy.weight.item():.4f}  (true: 2.0)")
print(f"  Learned bias:   {model_toy.bias.item():.4f}   (true: 1.0)")
print()
print("Gradient descent found the true parameters from noisy data.")
print("The same algorithm will train your language model.")

# Save the loss curve
plt.figure(figsize=(8, 4))
plt.plot(losses, color='steelblue', lw=2)
plt.xlabel("Training Step")
plt.ylabel("MSE Loss")
plt.title("Training Loss for Toy Problem (y = 2x + 1)\nSame pattern you will see for the LLM")
plt.grid(True, alpha=0.3)
plt.yscale('log')
plt.tight_layout()
plt.savefig("02c_toy_training.png", dpi=130)
print("Saved: 02c_toy_training.png")
```

---

## PART 4 — The Gradient of a Linear Layer

---

### 4.1 Why We Need This

The most common operation in the model is a linear layer: `y = Wx + b`.
When training, we need:
- ∂L/∂W (how to update the weight matrix)
- ∂L/∂x (how to pass gradient to the layer before this one)
- ∂L/∂b (how to update the bias)

We derive these now because you will type this in the forward/backward
passes of the transformer blocks.

---

### 4.2 Derivation

Forward: `y = Wx + b`

Given: ∂L/∂y (the gradient flowing back from the layer above)

**Gradient w.r.t. b:**
```
yᵢ = Σⱼ Wᵢⱼ xⱼ + bᵢ
∂yᵢ/∂bᵢ = 1
∂L/∂bᵢ = ∂L/∂yᵢ × 1 = ∂L/∂yᵢ
```
The gradient of b equals the gradient coming from above. Direct copy.

**Gradient w.r.t. Wᵢⱼ:**
```
yᵢ = Σⱼ Wᵢⱼ xⱼ + bᵢ
∂yᵢ/∂Wᵢⱼ = xⱼ
∂L/∂Wᵢⱼ = ∂L/∂yᵢ × xⱼ
```
The gradient for each weight is: (gradient at its output row) × (its input).
In matrix form: ∂L/∂W = (∂L/∂y) ⊗ x  (outer product)

**Gradient w.r.t. x:**
```
yᵢ = Σⱼ Wᵢⱼ xⱼ + bᵢ
∂yᵢ/∂xⱼ = Wᵢⱼ
∂L/∂xⱼ = Σᵢ ∂L/∂yᵢ × Wᵢⱼ
```
Summing over all output dimensions i that depend on xⱼ.
In matrix form: ∂L/∂x = W^T × (∂L/∂y)

---

```python
# -------------------------------------------------------
# VERIFY LINEAR LAYER GRADIENTS
# -------------------------------------------------------

print("=== LINEAR LAYER GRADIENT VERIFICATION ===")
print()

def linear_forward(W, x, b):
    # y = Wx + b
    # W: [m, n], x: [n], b: [m]
    # output y: [m]
    return W @ x + b

def linear_backward(dL_dy, W, x):
    # Given: gradient flowing back from next layer (dL/dy)
    # Compute: gradients for W, x, b
    
    # Gradient for bias: same as incoming gradient
    dL_db = dL_dy.copy()
    
    # Gradient for x: W^T times incoming gradient
    # Each input xⱼ contributed to all outputs through column j of W
    dL_dx = W.T @ dL_dy
    
    # Gradient for W: outer product of incoming gradient and input
    # Weight Wᵢⱼ contributed to output yᵢ via xⱼ
    # So ∂L/∂Wᵢⱼ = (∂L/∂yᵢ) × xⱼ
    dL_dW = np.outer(dL_dy, x)
    
    return dL_dW, dL_dx, dL_db

# Set up test values
np.random.seed(42)
W_test    = np.random.randn(5, 4)    # [5, 4] weight matrix
x_test_ln = np.random.randn(4)       # [4] input vector
b_test    = np.random.randn(5)       # [5] bias
dL_dy     = np.ones(5)               # fake gradient (all ones, simple loss = sum)

# Compute analytical gradients
dL_dW_analytical, dL_dx_analytical, dL_db_analytical = linear_backward(
    dL_dy, W_test, x_test_ln
)

# Verify with numerical gradients
def loss_from_W(W_flat):
    W_shaped = W_flat.reshape(5, 4)
    y        = linear_forward(W_shaped, x_test_ln, b_test)
    return y.sum()   # our fake loss

def loss_from_x(x):
    y = linear_forward(W_test, x, b_test)
    return y.sum()

dL_dW_numerical = numerical_gradient(loss_from_W, W_test.flatten()).reshape(5, 4)
dL_dx_numerical = numerical_gradient(loss_from_x, x_test_ln)

print(f"dL/dW analytical vs numerical match: {np.allclose(dL_dW_analytical, dL_dW_numerical, atol=1e-6)}")
print(f"dL/dx analytical vs numerical match: {np.allclose(dL_dx_analytical, dL_dx_numerical, atol=1e-6)}")
print()
print("These three equations are what PyTorch computes automatically")
print("when you call loss.backward() on a linear layer.")
print("Every linear layer in the model — and there are many — uses these.")
```

---

## ✅ Check Your Understanding

Answer these before moving on:

1. Softmax always produces probabilities that sum to 1.
   Walk through the formula and prove this algebraically.
   (Hint: sum exp(zᵢ)/Σexp(zⱼ) over all i.)

2. Cross-entropy loss is -log(p_correct).
   If p_correct = 0.5, what is the loss?
   If p_correct = 0.1, what is the loss?
   If p_correct goes from 0.5 to 0.1, does the loss double, triple, or something else?
   What does this tell you about how strongly the model is penalized?

3. The gradient ∂L/∂zᵢ = pᵢ for wrong tokens.
   This is positive. When we do gradient descent: z ← z - η × gradient.
   So we subtract a positive number from zᵢ.
   In English: we decrease the logit for wrong tokens.
   Does that make sense? Why?

4. We always call `optimizer.zero_grad()` before `loss.backward()`.
   What happens if we call it AFTER instead? What happens if we never call it?
   (Hint: try it in the toy training loop and look at what happens to the loss.)

5. The linear layer gradient: ∂L/∂W = outer_product(∂L/∂y, x).
   The outer product of a [m] vector and a [n] vector gives a [m, n] matrix.
   The weight matrix W is also [m, n]. Is it a coincidence that the gradient
   has the same shape as the parameter? Why must this always be true?

---

## 🧪 Experiments — Do All of These

**Experiment 1: Temperature and sampling**
Implement a function that takes logits and a temperature, applies softmax,
and samples one token using the probabilities.
Try temperatures 0.1, 0.5, 1.0, 2.0 with the same logits.
Run each 100 times. Does lower temperature give more consistent results?

**Experiment 2: Verify the cross-entropy loss baseline**
Create a vocabulary of 70 characters (our model's vocab size).
Create logits that are all 0.0 (which gives uniform probability).
Compute the cross-entropy loss. What is it?
Compare to log(70). What do you notice?
This is the starting loss when your model is completely random.

**Experiment 3: Break the softmax**
What happens if you feed softmax very large logits like [1000, 999, 998]
WITHOUT the max-subtraction stability fix?
Implement the unstable version, test it, see the overflow.
Then implement the stable version. Confirm identical results.

**Experiment 4: Gradient descent with different learning rates**
Take the toy training loop (y = 2x + 1).
Try learning rates: 0.001, 0.01, 0.1, 0.5, 1.0.
Plot all five loss curves on the same graph.
What happens at 0.001 (too small)? At 1.0 (too large)?
Where is the "sweet spot"?

**Experiment 5: Verify the linear layer gradients by hand**
Create a tiny [2,2] weight matrix and [2] input vector.
Compute the forward pass by hand (with pencil and paper).
Compute ∂L/∂W by hand using the outer product formula.
Verify against the numerical gradient function.

---

> When you can answer all five understanding questions and have done the experiments,
> move to Module 03: Building the Tokenizer.
> We turn text into numbers using BPE — built completely from scratch.
