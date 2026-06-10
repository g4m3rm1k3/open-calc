# Module 10 — What You Built, What Comes Next, and Where to Go
### The honest map from here to the frontier.

---

## This Is the Last Module

You do not need to type code in this one.
Read it. Think about it. Use it as a reference as you keep going.

---

## PART 1 — What You Actually Built

---

### 1.1 Taking Stock

Work through this list honestly. You should be able to answer every item.

**From modules 01-02:**
- Why integers are wrong for representing words
- What a vector is and why geometry encodes meaning
- Dot product: what it computes, what it means, how to code it from scratch
- Cosine similarity: derived from the law of cosines, implemented from scratch
- Matrix multiplication: the row picture and the column picture
- The shapes rule: [m,k] @ [k,n] → [m,n], why it must be this way

**From modules 03-04:**
- What surprise is, why it is measured with -log(p)
- Where cross-entropy comes from: derived from information theory
- Softmax: the formula, why exp(), why we subtract the max
- The gradient ∂L/∂zᵢ = pᵢ - 1{i=k}: derived by hand, verified numerically
- The chain rule: what it is, why backprop is just the chain rule
- Why PyTorch's `.backward()` does the same thing we derived

**From modules 05-07:**
- BPE tokenization: the algorithm, why it is the right balance
- The embedding matrix: a lookup table, why it needs to be a tensor
- Why positional embeddings are necessary (attention has no order sense)
- Scaled dot-product attention: derived from "tokens need to communicate"
- Why we scale by 1/√d_k: variance calculation
- The causal mask: why it exists, how -∞ implements it
- Multi-head attention: what each head is doing, the reshape trick
- GELU: what it is, why it is smoother than ReLU, the approximation
- The feed-forward network: expand-activate-contract, independence per position
- Layer normalization: derived from the covariate shift problem
- Residual connections: the +1 gradient term, why 12+ layer models are trainable

**From modules 08-09:**
- The transformer block: assembly, pre-norm style, information flow
- The full GPT model: stacking, weight tying, the LM head
- The generation algorithm: autoregressive sampling, temperature, top-k
- The training loop: four steps, why each one, what breaks without it
- AdamW: momentum, adaptive learning rates, why W is different from Adam
- The learning rate schedule: warmup rationale, cosine decay shape
- Gradient clipping: what norm it clips, what it preserves

**From modules 10-11:**
- Quantization: the math, scale and zero_point, the accuracy/memory tradeoff
- LoRA: the low-rank hypothesis, B=0 initialization, why it works
- The merge operation: W_new = W + (α/r) × B × A

If any of those feel shaky, go back. The rest of this module assumes them.

---

### 1.2 What You Can Do Now

**You can read model source code.**
When you open Llama's implementation on GitHub, nothing is mysterious.
Every function maps to something you built.
`LlamaAttention` is your `MultiHeadAttention` with RoPE added.
`LlamaMLP` is your `FeedForward` with SwiGLU instead of GELU.
`LlamaDecoderLayer` is your `TransformerBlock`.

**You can debug training.**
When loss does not decrease: you know the four steps, you know which one to check.
When loss spikes: you know gradient clipping, you know learning rate.
When val loss diverges: you know overfitting, you know what to try.

**You can make informed trade-offs.**
d_model=256 vs d_model=128: you know the parameter count difference.
n_layers=6 vs n_layers=4: you know the depth-gradient relationship.
LoRA r=8 vs r=16: you know what rank buys you.
INT8 vs INT4: you know the accuracy-memory curve.

**You can learn the next thing.**
Every improvement in modern LLMs is built on what you built.
Flash Attention is just your attention function with smarter memory access.
RoPE is just your positional encoding with a different mathematical form.
SwiGLU is just your GELU with a gate multiplied in.

The foundation is solid.

---

## PART 2 — Modern Architecture Improvements

---

### 2.1 RoPE — Rotary Position Embeddings

**What you built:** learned position embeddings added to token embeddings.

**The problem:** attention scores between token i and token j depend on their
absolute positions, not their relative distance. Token at position 100 and
token at position 101 have very different position vectors, even though
they are adjacent. This makes it hard to generalize to longer sequences
than seen during training.

**What RoPE does:**
Instead of adding a position vector, RoPE ROTATES the query and key vectors
by an angle proportional to position.

For a 2D vector [x, y] at position p and frequency θ:
```
Rotated: [x cos(pθ) - y sin(pθ),  x sin(pθ) + y cos(pθ)]
```

For higher dimensions: apply this rotation to each consecutive pair of dimensions,
each pair with a different frequency (like the sinusoidal encoding you built).

**Why this is better:**
When you compute Q_i · K_j (the attention score), the rotation angles depend on
(i - j) — the relative distance. The attention score becomes a function of
relative position, not absolute position.

This means: a model trained on sequences of length 512 can generalize to
length 2048, because it learned relationships between positions 3 apart,
not between "position 200" and "position 203" specifically.

**In code (conceptual):**
```python
def rotate_half(x):
    # Split x into two halves and rotate
    x1 = x[..., :x.shape[-1] // 2]
    x2 = x[..., x.shape[-1] // 2:]
    return torch.cat([-x2, x1], dim=-1)

def apply_rope(q, k, cos, sin):
    # cos, sin have shape [seq_len, d_head]
    # Apply rotation: q_rot = q*cos + rotate_half(q)*sin
    q_rot = (q * cos) + (rotate_half(q) * sin)
    k_rot = (k * cos) + (rotate_half(k) * sin)
    return q_rot, k_rot
```

Llama, Mistral, Gemma, Phi — all use RoPE.
To upgrade your model: remove the position embedding matrix,
add cos/sin precomputation, apply rotate in the attention forward.

---

### 2.2 SwiGLU — Gated Feed-Forward Network

**What you built:**
```
FFN(x) = W₂ × GELU(W₁ × x)
```

**SwiGLU:**
```
FFN(x) = W₂ × (SiLU(W₁ × x) ⊙ W₃ × x)
```

Where ⊙ is element-wise multiplication and SiLU(x) = x × σ(x)
(σ is the sigmoid function).

**The intuition:**
The first term `SiLU(W₁x)` is the "gate" — it learns WHICH features to activate.
The second term `W₃x` is the "content" — the actual values to pass through.
Multiplying them: the gate controls how much of each feature to allow.

This is called a "gated" activation. The model can learn to suppress
entire feature dimensions by making the gate output close to zero.
More expressive than a single activation applied to one projection.

**One subtlety:** SwiGLU has 3 weight matrices instead of 2.
To keep total parameter count similar, the hidden dimension changes:
```
Standard FFN:  d_model → 4×d_model → d_model      (2 matrices)
SwiGLU FFN:    d_model → (8/3)×d_model → d_model  (3 matrices)
               (8/3 × d_model ≈ 2.67 × d_model)
```

**In code:**
```python
class SwiGLU(nn.Module):
    def __init__(self, d_model):
        super().__init__()
        d_ff = int(8/3 * d_model)   # 2.67× instead of 4×
        # Round to nearest multiple of 64 for hardware efficiency
        d_ff = ((d_ff + 63) // 64) * 64
        
        self.W1 = nn.Linear(d_model, d_ff, bias=False)
        self.W2 = nn.Linear(d_ff, d_model, bias=False)
        self.W3 = nn.Linear(d_model, d_ff, bias=False)
    
    def forward(self, x):
        # Gate: SiLU(W1 x) — learned which features to activate
        gate    = F.silu(self.W1(x))
        # Content: W3 x — the values to conditionally pass through
        content = self.W3(x)
        # Combine: gate controls content
        return self.W2(gate * content)
```

---

### 2.3 Grouped Query Attention (GQA)

**What you built:** every attention head has its own Q, K, V projections.
With 8 heads and d_model=512: 8 separate K matrices, 8 separate V matrices.

**The problem:** during generation, we cache K and V for all previous tokens
(KV cache). With 8 heads, 32 layers, 2048 context length, d_head=64:
```
KV cache size = 2 (K+V) × 32 (layers) × 8 (heads) × 2048 (tokens) × 64 (dim) × 2 bytes
             = 268 MB   just for one inference request
```
Scale to 32 heads, 96 layers (like GPT-4 approximately): gigabytes per request.

**GQA's fix:** multiple Q heads share one K head and one V head.

```
Standard:   8 Q heads, 8 K heads, 8 V heads
GQA (4):    8 Q heads, 4 K heads, 4 V heads  (2 Q share each K,V)
GQA (1):    8 Q heads, 1 K head,  1 V head   (Multi-Query Attention — extreme)
```

Memory reduction is proportional to the reduction in K,V heads.
Quality loss is minimal because most of the "learning" is in Q.

**In practice:** Llama-2 uses GQA with n_kv_heads = n_heads / 4.
A 34B model with 64 Q heads uses only 8 K,V heads — 8× less KV cache.

To implement: reshape K and V to have fewer heads, expand before attention:
```python
# n_heads=8, n_kv_heads=2: each K,V head serves 4 Q heads
K = K.repeat_interleave(n_heads // n_kv_heads, dim=1)  # [B, 8, T, d_head]
V = V.repeat_interleave(n_heads // n_kv_heads, dim=1)
```

---

### 2.4 RMSNorm

**What you built:**
```
LayerNorm(x) = γ × (x - mean(x)) / std(x) + β
```

**RMSNorm** (Root Mean Square Norm) removes the mean subtraction:
```
RMSNorm(x) = γ × x / RMS(x)     where RMS(x) = sqrt(mean(x²))
```

Why simpler is better here:
- The mean subtraction in LayerNorm is the expensive part (two passes through data)
- Empirically, subtracting the mean does not help much for transformers
- RMSNorm is 10-20% faster and uses less memory
- Quality is the same or better in practice

Llama, Mistral, Gemma all use RMSNorm.

```python
class RMSNorm(nn.Module):
    def __init__(self, d_model, eps=1e-5):
        super().__init__()
        self.gamma = nn.Parameter(torch.ones(d_model))
        self.eps   = eps
    
    def forward(self, x):
        # RMS: sqrt(mean of squares)
        rms    = torch.sqrt(x.pow(2).mean(dim=-1, keepdim=True) + self.eps)
        x_norm = x / rms
        return self.gamma * x_norm
        # No beta (shift) — empirically not needed
```

---

### 2.5 Flash Attention

**The memory problem with your attention:**
Your `scaled_dot_product_attention` computes the full attention matrix:
```python
scores  = Q @ K.transpose(-2, -1)   # [B, H, T, T]
weights = softmax(scores)            # [B, H, T, T]
output  = weights @ V                # [B, H, T, d_v]
```

For T=2048, H=32, B=1: the scores matrix is 32 × 2048 × 2048 × 4 bytes = 512 MB.
Just for one forward pass. This does not scale.

**Flash Attention's insight:**
You do not need to store the full T×T matrix.
You can compute the output in tiles, processing one chunk of Q and one chunk of K,V at a time.

The online softmax trick: you can compute `softmax(scores) @ V` without
ever materializing the full scores matrix, by keeping a running maximum
and normalizer.

Result: memory usage is O(T) instead of O(T²).
Speed: 2-4× faster due to better GPU memory access patterns.

You do not need to implement Flash Attention — PyTorch has it:
```python
# Your attention function, but faster:
from torch.nn.functional import scaled_dot_product_attention

output = scaled_dot_product_attention(
    Q, K, V,
    is_causal=True   # applies causal mask automatically
)
```

PyTorch automatically uses Flash Attention if available on your hardware.
This one line replaces your entire `scaled_dot_product_attention` function.

---

## PART 3 — Where to Go From Here

---

### 3.1 The Honest Path

Here is a realistic sequence of what to learn and when.

**Right now (you are here):**
You have a working character-level LLM.
You understand every component.
You can read model source code.

**Next 2-4 weeks:**
Upgrade your model one piece at a time.
Do not touch a Hugging Face model yet. Keep building.

Changes to make, in order:
1. Replace LayerNorm with RMSNorm. Compare training curves.
2. Replace GELU FFN with SwiGLU. Does quality improve?
3. Replace learned position embeddings with RoPE. Test longer sequences.
4. Replace your attention function with `F.scaled_dot_product_attention`. Same output, faster.
5. Add KV caching to generation. Measure the speedup.

Each of these is 20-50 lines of code.
Each teaches you something specific.
By the end, your model is close to Llama architecture.

**Month 2:**
Load Gemma-2B or Phi-3-mini from Hugging Face.
Open the model source code. Map every class to what you built.
Nothing should be unfamiliar — just larger and with the improvements above.

Fine-tune it with LoRA on something you care about.
Python code you have written. Notes from a domain you know.
Evaluate quality.

**Month 3:**
Read papers. In this order:

| Paper | Year | Why |
|-------|------|-----|
| Attention Is All You Need | 2017 | You built this |
| GPT-2 | 2019 | Language modeling at scale, same architecture |
| Scaling Laws | 2020 | How to predict performance from compute |
| LoRA | 2021 | You implemented this |
| Flash Attention | 2022 | The memory breakthrough |
| LLaMA | 2023 | Open model, RoPE + SwiGLU + RMSNorm |
| Gemma | 2024 | Modern lightweight model |

You can read all of these now. The math will not be opaque.

**Month 4+:**
Pick a direction:

**Efficiency** (your instinct):
- Speculative decoding: draft with small model, verify with large
- Mixture of Experts: sparse activation, not all parameters used per token
- Quantization-Aware Training: simulate quantization during training
- Knowledge distillation: small model learns to mimic large model

**Mechanistic interpretability:**
What do specific attention heads actually compute?
Which neurons encode which concepts?
Can you find where a fact is stored in the weights?
Anthropic publishes actively in this area.

**Alignment and fine-tuning:**
RLHF: train a reward model, use PPO to optimize the language model against it.
DPO: direct preference optimization — simpler than RLHF, often better.
Constitutional AI: using the model to critique and revise its own outputs.

---

### 3.2 Your Hardware Path

**At home (gaming GPU):**

Run models:
```bash
# Install Ollama (runs LLMs locally, one command)
curl -fsSL https://ollama.com/install.sh | sh
ollama run llama3.2:1b      # 1B model, tiny, very fast
ollama run gemma2:2b        # 2B model, good quality
ollama run phi3:mini        # 3.8B model, excellent for its size
```

Fine-tune models:
```python
# Gemma-2B with LoRA: fits in 6GB VRAM with 4-bit quantization
from transformers import AutoModelForCausalLM, BitsAndBytesConfig
from peft import get_peft_model, LoraConfig

bnb_config = BitsAndBytesConfig(
    load_in_4bit              = True,
    bnb_4bit_compute_dtype    = torch.bfloat16,
    bnb_4bit_use_double_quant = True,
)

model = AutoModelForCausalLM.from_pretrained(
    "google/gemma-2-2b",
    quantization_config = bnb_config,
)
# Then apply LoRA as you built in module 09
```

**At work (Intel Max NPU):**

Intel's NPU uses Intel Extension for PyTorch (IPEX):
```bash
pip install intel-extension-for-pytorch
pip install optimum-intel  # HuggingFace integration for Intel hardware
```

```python
import intel_extension_for_pytorch as ipex

# Optimize your model for Intel NPU
model = ipex.optimize(model, dtype=torch.bfloat16)

# Or use Optimum-Intel for HuggingFace models
from optimum.intel import OVModelForCausalLM

model = OVModelForCausalLM.from_pretrained(
    "google/gemma-2-9b",
    export=True   # converts to OpenVINO format for NPU
)
```

Intel Max NPU supports:
- BF16 inference (2× faster than FP32)
- INT8 quantization via Intel Neural Compressor
- Full PyTorch training (your training code works unchanged)
- Gemma 9B, Llama 8B fully in NPU memory

The transition from your home GPU experiments to the NPU
is mostly just changing the device string and optimization call.

---

### 3.3 The Efficiency Frontier (Your Core Instinct)

You said early on: "I think efficiency is where the future is."

You were right, and here is why it keeps being true:

**The trend:**
Every 2-3 years, compute doubles (Moore-like scaling).
But model quality improves faster than compute — through efficiency.

GPT-2 (2019): 1.5B parameters, required expensive hardware.
Phi-3-mini (2024): 3.8B parameters, runs on a phone. Better than GPT-2 at many tasks.

The improvement is not just more compute. It is:
- Better architectures (RoPE, SwiGLU, GQA)
- Better training procedures (better data curation, better schedules)
- Better inference (quantization, speculative decoding, Flash Attention)
- Better fine-tuning (LoRA, DPO, instruction tuning)

**The key insight:**
A model that runs locally is worth more than a model 10× better
that requires a data center.

Privacy, latency, cost, customization — all favor small, efficient models.
The person who can take a 7B model and make it as useful as a 70B model
for a specific domain is extremely valuable.

That person is who you are trying to become.

---

### 3.4 What Makes the Difference

Two kinds of people work on LLMs.

**Kind 1:** loads a model, calls `.generate()`, adjusts the prompt.
No idea what is happening inside. Completely dependent on others' work.
Interchangeable.

**Kind 2:** understands the architecture, can read the source code,
can modify the model, knows what to change when something does not work.
Can look at a new technique and understand it in an hour.
Can implement it in a day. Not interchangeable.

You are building toward Kind 2.

The path there is exactly what you have been doing:
derive first, then implement, then experiment, then read the literature.
In that order. Never in reverse.

The math matters because it tells you why.
The implementation matters because it builds the intuition.
The experiments matter because they show you what actually happens
versus what the theory predicts (they often disagree).
The literature matters because it shows you the frontier.

---

## PART 4 — Final Experiments

These are open-ended projects, not exercises with right answers.
Pick one and spend a week on it.

---

### Final Project 1: Upgrade Your Model to Llama Architecture

Replace four things in your GPT:
1. `LayerNorm` → `RMSNorm`
2. GELU `FeedForward` → `SwiGLU`
3. Learned position embeddings → RoPE
4. `scaled_dot_product_attention` → `F.scaled_dot_product_attention`

Train both versions (original and upgraded) with the same config.
Compare: training curves, final perplexity, generation quality.
The upgraded version should be slightly better and slightly faster.

Write a short report (for yourself):
- What changed in parameter count?
- Which upgrade had the most impact on quality?
- Which upgrade had the most impact on speed?

---

### Final Project 2: KV Cache

Right now, your `generate()` function runs the full forward pass
at every new token. This is O(T²) total computation for T tokens.

With KV caching:
- Store the K and V matrices from previous tokens
- For each new token, only compute K and V for the new token
- Reuse all previous K, V from the cache

This reduces generation to O(T) total computation — linear instead of quadratic.

Implement it. Measure the speedup on sequences of length 50, 200, 500.
The speedup should grow with sequence length.

---

### Final Project 3: Train on Your Own Data

Pick something you know well:
- Code you have written (Python files from your projects)
- Notes from a domain you know (your field, a hobby, a subject)
- Books or papers in a specific area

Train your model on this data.
What does it generate? Where does it capture the style well?
Where does it fail?

This teaches you more about what models actually learn
than any number of Shakespeare samples.

---

### Final Project 4: Implement Speculative Decoding

**The idea:**
Use a small fast model (draft model) to propose several tokens at once.
Verify them with the large model (target model) in one forward pass.
If the large model agrees: accept all proposed tokens.
If it disagrees at position k: accept tokens 0..k-1, reject the rest.

This gives you the quality of the large model at near the speed of the small model.
Typical speedup: 2-3×.

**How to implement:**
1. Keep both a small model (your 2-layer model) and a large model (your 4-layer model)
2. Use the small model to draft 5 tokens
3. Run the large model on the full sequence (prompt + 5 drafted tokens) in one pass
4. Compare large model's predictions to the draft at each position
5. Use the acceptance criterion from the paper (to maintain the large model's distribution)

This is a real production technique used in inference systems.

---

### Final Project 5: Mechanistic Interpretability

**The question:** what does attention head (layer 2, head 1) actually compute?

Pick a trained model. Pick one attention head.
Feed it many different sequences.
Look at the attention weight matrix for each.

What patterns do you see?
- Does it always attend to the previous character?
- Does it attend to matching characters (all 'e's attend to other 'e's)?
- Does it attend to the start of the current "word" (sequence between spaces)?

Try to write a short description: "Head (2,1) appears to detect ___."

Then test your hypothesis: design sequences where your predicted behavior
should appear, and sequences where it should not.
Does the head behave as you predicted?

This is research-level work. You are doing what Anthropic's interpretability
team does at a small scale. The skills transfer directly.

---

## The Final Word

You started with linear algebra and a question: "can I learn LLMs?"

You now have:
- The mathematical foundation
- Every component built from scratch
- A working model you trained yourself
- Two efficiency techniques implemented from first principles
- The vocabulary to read real papers
- The framework to understand any model you encounter

The gap between where you are and the frontier is not mysterious anymore.
It is specific techniques, each buildable, each learnable.

The instinct you had — do more with less, be efficient, be clever —
is the right one. The field rewards it.

Keep building.

---

> End of tutorial series.
> The code you wrote in modules 04-09 is a complete LLM.
> Everything after this is making it bigger, faster, or smarter.
> You know how to do that now.
