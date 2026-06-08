# Module 07 — Tokenization and Real Training

> **The big idea:** Real LLMs don't use character-level tokens. They use **Byte-Pair Encoding (BPE)** — a compression algorithm that balances vocabulary size with token granularity.

---

## 7.1 Why Not Characters?

Character-level models work but have a problem: long sequences. "Hello, World!" is 13 characters but only 4 BPE tokens (`Hello`, `,`, ` World`, `!`). Shorter sequences = faster training and longer effective context.

Too coarse (whole words) → huge vocabulary, rare words unseen at test time.  
Too fine (characters) → very long sequences, slow training.  
BPE → sweet spot: ~50,000 tokens for English.

---

## 7.2 BPE Algorithm

Start with characters. Repeatedly merge the most frequent pair:

```
"aaabdaaabac"
Chars: a a a b d a a a b a c
Step 1: "aa" is most frequent → merge to "Z"
→  Z a b d Z a b a c
Step 2: "Za" is most frequent → merge to "Y"  
→  Y b d Y b a c
...until we reach desired vocab size
```

```python
# Minimal BPE implementation
from collections import Counter

def get_pairs(vocab):
    pairs = Counter()
    for word, freq in vocab.items():
        symbols = word.split()
        for i in range(len(symbols) - 1):
            pairs[symbols[i], symbols[i+1]] += freq
    return pairs

def merge_vocab(pair, vocab):
    new_vocab = {}
    bigram = ' '.join(pair)
    replacement = ''.join(pair)
    for word in vocab:
        new_word = word.replace(bigram, replacement)
        new_vocab[new_word] = vocab[word]
    return new_vocab

# Tiny example
vocab = {'l o w </w>': 5, 'l o w e r </w>': 2, 'n e w e s t </w>': 6, 'w i d e s t </w>': 3}

print("Initial vocab:", vocab)
for i in range(5):
    pairs = get_pairs(vocab)
    best = max(pairs, key=pairs.get)
    vocab = merge_vocab(best, vocab)
    print(f"Merge #{i+1}: {best} → {''.join(best)}")
    print(f"  Vocab: {vocab}")
```

---

## 7.3 Using tiktoken (GPT's Tokenizer)

```python
# pip install tiktoken
import tiktoken

# GPT-4's tokenizer (cl100k_base, 100k vocab)
enc = tiktoken.get_encoding("cl100k_base")

texts = [
    "Hello, world!",
    "The quick brown fox",
    "transformer",                          # common word → 1 token
    "supercalifragilisticexpialidocious",   # rare word → many tokens
    "def function_name(param):",            # code
    "你好世界",                              # Chinese
]

for text in texts:
    tokens = enc.encode(text)
    decoded = [enc.decode([t]) for t in tokens]
    print(f"'{text}'")
    print(f"  Tokens ({len(tokens)}): {tokens}")
    print(f"  Pieces: {decoded}\n")
```

---

## 7.4 The Learning Rate Schedule

Real training doesn't use a constant learning rate. The standard approach:

1. **Warmup**: ramp up from 0 to peak LR over first N steps (model is random, small LR prevents chaos)
2. **Cosine decay**: slowly decrease LR to near-zero

```python
import torch
import numpy as np
import matplotlib.pyplot as plt

def get_lr(step, warmup_steps=100, max_steps=1000, max_lr=3e-4, min_lr=3e-5):
    # Warmup
    if step < warmup_steps:
        return max_lr * step / warmup_steps
    # Cosine decay
    if step > max_steps:
        return min_lr
    decay_ratio = (step - warmup_steps) / (max_steps - warmup_steps)
    coeff = 0.5 * (1.0 + math.cos(math.pi * decay_ratio))
    return min_lr + coeff * (max_lr - min_lr)

import math
steps = range(1100)
lrs   = [get_lr(s) for s in steps]

plt.figure(figsize=(9, 3))
plt.plot(steps, lrs, color='steelblue', lw=2)
plt.axvline(100,  color='orange', linestyle='--', label='End of warmup')
plt.axvline(1000, color='red',    linestyle='--', label='End of training')
plt.xlabel('Step'); plt.ylabel('Learning Rate')
plt.title('Cosine LR Schedule with Warmup')
plt.legend(); plt.grid(True, alpha=0.3)
plt.tight_layout()
plt.savefig("lr_schedule.png", dpi=120)
plt.show()

# Use in training loop:
# for step in range(max_steps):
#     lr = get_lr(step)
#     for param_group in optimizer.param_groups:
#         param_group['lr'] = lr
```

---

## 7.5 Weight Decay and AdamW

**Weight decay** (L2 regularization) adds a penalty for large weights, encouraging the model to find simpler solutions:

```
L_total = L_task + λ Σ w²
```

**AdamW** applies weight decay correctly (vanilla Adam has a bug where it conflates weight decay with gradient descent):

```python
# Only apply weight decay to weight matrices, NOT to biases or LayerNorm params
def configure_optimizer(model, lr, weight_decay):
    decay_params     = []
    no_decay_params  = []
    
    for name, param in model.named_parameters():
        if 'bias' in name or 'ln' in name or 'norm' in name:
            no_decay_params.append(param)
        else:
            decay_params.append(param)
    
    optimizer_groups = [
        {'params': decay_params,    'weight_decay': weight_decay},
        {'params': no_decay_params, 'weight_decay': 0.0},
    ]
    
    return torch.optim.AdamW(optimizer_groups, lr=lr, betas=(0.9, 0.95))

# Use: configure_optimizer(model, lr=3e-4, weight_decay=0.1)
```

---

## ✅ Module 07 Summary

- BPE tokenization: merge frequent pairs until desired vocab size
- Real models use ~50k-100k token vocabularies  
- LR warmup + cosine decay is standard
- AdamW with selective weight decay is the standard optimizer

---
---

# Module 08 — HuggingFace and Fine-Tuning

> **The big idea:** Don't train from scratch. Download a pretrained model (Llama, Mistral, GPT-2) and fine-tune it on your own data. You get a powerful base and only teach it the new stuff.

---

## 8.1 Load a Pretrained Model

```python
# pip install transformers datasets accelerate
from transformers import AutoTokenizer, AutoModelForCausalLM
import torch

# Load GPT-2 (117M params, runs on CPU)
model_name = "gpt2"
tokenizer  = AutoTokenizer.from_pretrained(model_name)
model      = AutoModelForCausalLM.from_pretrained(model_name)

print(f"Model: {model_name}")
print(f"Parameters: {sum(p.numel() for p in model.parameters()):,}")
print(f"Architecture:\n{model}")
```

---

## 8.2 Generate Text with a Pretrained Model

```python
tokenizer.pad_token = tokenizer.eos_token

prompt = "The meaning of life is"
inputs = tokenizer(prompt, return_tensors="pt")

with torch.no_grad():
    output = model.generate(
        **inputs,
        max_new_tokens = 100,
        temperature    = 0.8,
        do_sample      = True,
        top_k          = 40,
    )

generated = tokenizer.decode(output[0], skip_special_tokens=True)
print(generated)
```

---

## 8.3 Fine-Tune on Your Own Data

Fine-tuning = continue training a pretrained model on your specific dataset. The model keeps its general knowledge but adapts to your style/domain.

```python
from transformers import Trainer, TrainingArguments, DataCollatorForLanguageModeling
from datasets import Dataset

# Example: fine-tune on a custom text dataset
your_texts = [
    "Your text goes here.",
    "Each string is one training example.",
    "The model will learn to write in this style.",
    # ... add as many as you have
]

# Tokenize
def tokenize(examples):
    return tokenizer(examples["text"], truncation=True, max_length=512)

dataset = Dataset.from_dict({"text": your_texts})
tokenized = dataset.map(tokenize, batched=True, remove_columns=["text"])

# Training arguments
training_args = TrainingArguments(
    output_dir          = "./finetuned_model",
    num_train_epochs    = 3,
    per_device_train_batch_size = 4,
    gradient_accumulation_steps = 4,
    learning_rate       = 2e-5,         # much lower than training from scratch!
    warmup_steps        = 50,
    save_steps          = 500,
    logging_steps       = 50,
    fp16                = torch.cuda.is_available(),   # use half-precision on GPU
)

trainer = Trainer(
    model         = model,
    args          = training_args,
    train_dataset = tokenized,
    data_collator = DataCollatorForLanguageModeling(tokenizer, mlm=False),
)

trainer.train()
```

---

## 8.4 Load Larger Models (Llama, Mistral)

For larger models, use 4-bit quantization to fit in memory:

```python
# pip install transformers bitsandbytes accelerate
from transformers import AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig

# 4-bit quantization: 13B model in ~7GB VRAM instead of ~26GB
bnb_config = BitsAndBytesConfig(
    load_in_4bit               = True,
    bnb_4bit_use_double_quant  = True,
    bnb_4bit_quant_type        = "nf4",
    bnb_4bit_compute_dtype     = torch.bfloat16
)

# Example: Mistral 7B (requires ~6GB VRAM or ~28GB RAM for CPU)
model_name = "mistralai/Mistral-7B-v0.1"  # or "meta-llama/Llama-2-7b-hf"

# Requires HuggingFace account + accepting model license
# tokenizer = AutoTokenizer.from_pretrained(model_name)
# model = AutoModelForCausalLM.from_pretrained(model_name, quantization_config=bnb_config)
print("(Uncomment above to load Mistral 7B — requires ~6GB VRAM)")
```

---

## 8.5 LoRA — Fine-Tune Efficiently

**LoRA (Low-Rank Adaptation)**: instead of updating all weights (billions of params), we freeze the model and add tiny trainable matrices alongside each weight.

```
W' = W + B A     where A ∈ ℝ^(r×d), B ∈ ℝ^(d×r), rank r << d
```

Only A and B are trained. This reduces trainable params by 100-1000x.

```python
# pip install peft
from peft import get_peft_model, LoraConfig, TaskType

# LoRA configuration
lora_config = LoraConfig(
    task_type = TaskType.CAUSAL_LM,
    r         = 16,          # rank (4-64, higher = more params = more capacity)
    lora_alpha = 32,         # scaling factor
    lora_dropout = 0.1,
    target_modules = ["c_attn", "c_proj"],  # which layers to add LoRA to (GPT-2 names)
)

# Load GPT-2 and add LoRA
base_model = AutoModelForCausalLM.from_pretrained("gpt2")
lora_model = get_peft_model(base_model, lora_config)

# Count trainable parameters
total     = sum(p.numel() for p in lora_model.parameters())
trainable = sum(p.numel() for p in lora_model.parameters() if p.requires_grad)
print(f"Total params:     {total:,}")
print(f"Trainable params: {trainable:,}  ({100*trainable/total:.2f}%)")
# Typically only ~0.1-1% of params are trainable with LoRA!
```

---

## ✅ Module 08 Summary

| Approach | Params Updated | Use Case |
|----------|---------------|----------|
| Training from scratch | All | New domain, lots of data |
| Full fine-tune | All | Moderate data, task shift |
| LoRA | ~1% (tiny adapters) | Limited data, limited GPU |
| Prompting (no training) | None | Quick experiments |

---
---

# Module 09 — Inference and Sampling

> **The big idea:** Generating text is sampling from a probability distribution. How you sample determines whether output is boring, creative, or nonsense.

---

## 9.1 The Sampling Choices

At each step, the model outputs logits for every token in the vocabulary. We convert to probabilities and sample:

```python
import torch
import torch.nn.functional as F
import matplotlib.pyplot as plt

# Simulated logits from a model
torch.manual_seed(0)
logits = torch.randn(100)   # 100 tokens, random scores

# --- Strategy 1: Greedy (always pick highest probability) ---
greedy = logits.argmax().item()
print(f"Greedy choice: token {greedy}")

# --- Strategy 2: Temperature scaling ---
def sample_with_temperature(logits, temperature=1.0):
    scaled = logits / temperature
    probs  = F.softmax(scaled, dim=0)
    return torch.multinomial(probs, num_samples=1).item(), probs

fig, axes = plt.subplots(1, 3, figsize=(14, 3))
for ax, temp in zip(axes, [0.3, 1.0, 2.0]):
    _, probs = sample_with_temperature(logits, temp)
    ax.bar(range(100), probs.detach().numpy(), color='steelblue', alpha=0.7)
    ax.set_title(f"Temperature = {temp}")
    ax.set_xlabel("Token ID"); ax.set_ylabel("Probability")
    ax.set_ylim(0, None)

plt.suptitle("Effect of Temperature on Token Distribution", fontsize=12)
plt.tight_layout()
plt.savefig("temperature_sampling.png", dpi=120)
plt.show()
```

**Temperature:**
- `T < 1`: more peaked (conservative, repetitive)
- `T = 1`: original distribution (default)
- `T > 1`: more flat (creative, unpredictable)

---

## 9.2 Top-K and Top-P Sampling

```python
def top_k_sampling(logits, k=40):
    """Zero out all but top-k tokens, then sample."""
    top_vals, _ = torch.topk(logits, k)
    threshold = top_vals[-1]
    filtered = logits.clone()
    filtered[logits < threshold] = float('-inf')
    probs = F.softmax(filtered, dim=0)
    return torch.multinomial(probs, num_samples=1).item()

def top_p_sampling(logits, p=0.9):
    """Sample from the smallest set of tokens whose cumulative prob ≥ p (nucleus sampling)."""
    sorted_logits, sorted_idx = torch.sort(logits, descending=True)
    cumprobs = torch.cumsum(F.softmax(sorted_logits, dim=0), dim=0)
    
    # Remove tokens that push cumulative prob over threshold
    remove = cumprobs > p
    remove[1:] = remove[:-1].clone()
    remove[0]  = False
    
    sorted_logits[remove] = float('-inf')
    # Restore original ordering
    logits_filtered = sorted_logits[sorted_idx.argsort()]
    probs = F.softmax(logits_filtered, dim=0)
    return torch.multinomial(probs, num_samples=1).item()

# Compare strategies
logits = torch.randn(1000)
print("Greedy:   always the same token")
print(f"Top-40:   {top_k_sampling(logits, k=40)}")
print(f"Top-p=0.9:{top_p_sampling(logits, p=0.9)}")
```

**Top-P (nucleus)** is usually preferred: it adapts the effective pool based on the actual distribution, not a fixed k.

---

## 9.3 KV Cache — How Inference is Fast

Without caching: at each new token, re-run the full forward pass for ALL previous tokens. Slow!

With **KV cache**: store the K and V matrices from past tokens. At each new step, only compute K, V for the new token.

```python
# Conceptual: what KV cache does
# (Real implementation is inside HuggingFace or your model code)

class SimpleCachedAttention:
    def __init__(self):
        self.past_k = None  # cache
        self.past_v = None
    
    def forward(self, q, k, v):
        # Append new k, v to cache
        if self.past_k is not None:
            k = torch.cat([self.past_k, k], dim=1)
            v = torch.cat([self.past_v, v], dim=1)
        self.past_k = k
        self.past_v = v
        
        # Attend: new query attends to ALL past keys
        scores = q @ k.transpose(-1, -2) / math.sqrt(q.shape[-1])
        weights = F.softmax(scores, dim=-1)
        return weights @ v

print("With KV cache: inference scales O(T) instead of O(T²)!")
```

```python
# HuggingFace uses KV cache automatically in generate():
from transformers import AutoModelForCausalLM, AutoTokenizer

tokenizer = AutoTokenizer.from_pretrained("gpt2")
model     = AutoModelForCausalLM.from_pretrained("gpt2")
model.eval()

prompt = tokenizer("The quick brown fox", return_tensors="pt")

with torch.no_grad():
    out = model.generate(
        **prompt,
        max_new_tokens = 50,
        use_cache = True,   # default True — uses KV cache
        do_sample = True,
        temperature = 0.8,
    )

print(tokenizer.decode(out[0]))
```

---

## ✅ Module 09 Summary

| Strategy | How it works | When to use |
|----------|-------------|-------------|
| Greedy | Pick highest-prob token | Deterministic but boring |
| Temperature | Scale logits before softmax | Always — use T=0.7-1.0 |
| Top-K | Sample from top K tokens | Good fallback |
| Top-P | Sample from top-P% mass | Best for creative tasks |
| KV cache | Cache past K,V matrices | Always at inference time |

---
---

# Module 10 — What to Explore Next

> You now understand how LLMs work from first principles. Here's what to dive into next.

---

## 10.1 Techniques to Study

### Rotary Position Embeddings (RoPE)
Modern models (Llama, Mistral) replaced the additive positional embeddings we built with **RoPE** — a rotation-based scheme that generalizes better to longer sequences.

Key idea: rotate Q and K vectors by an angle proportional to position, so the dot product Q·K naturally depends on *relative* position.

```python
# Conceptual RoPE
def rotate_half(x):
    x1, x2 = x[..., ::2], x[..., 1::2]
    return torch.stack([-x2, x1], dim=-1).flatten(-2)

def apply_rope(q, k, cos, sin):
    q_rot = (q * cos) + (rotate_half(q) * sin)
    k_rot = (k * cos) + (rotate_half(k) * sin)
    return q_rot, k_rot
```

### Grouped Query Attention (GQA)
Llama-2+ uses fewer K/V heads than Q heads. Memory efficient — faster inference.

### SwiGLU Activation
Modern FFN uses a gated activation:
```python
# SwiGLU (used in Llama, PaLM, etc.)
class SwiGLU(nn.Module):
    def __init__(self, d_model):
        super().__init__()
        d_ff = int(8/3 * d_model)   # slightly different ratio
        self.w1 = nn.Linear(d_model, d_ff, bias=False)
        self.w2 = nn.Linear(d_ff, d_model, bias=False)
        self.w3 = nn.Linear(d_model, d_ff, bias=False)
    
    def forward(self, x):
        return self.w2(F.silu(self.w1(x)) * self.w3(x))
```

---

## 10.2 Training Techniques

### RLHF (Reinforcement Learning from Human Feedback)
How ChatGPT-style models are aligned:
1. **SFT**: Fine-tune on human demonstrations
2. **Reward Model**: Train a model to predict human preferences
3. **PPO**: Use RL to optimize policy against reward model

### DPO (Direct Preference Optimization)
Simpler alternative to RLHF — no reward model needed. Fine-tune directly on (chosen, rejected) response pairs.

---

## 10.3 Quantization

Run large models with less memory by reducing precision:

```python
# FP32: 32 bits per weight (standard)
# FP16/BF16: 16 bits (2x memory savings, minimal quality loss)
# INT8: 8 bits (4x savings)
# INT4: 4 bits (8x savings, some quality loss)

# Load in 8-bit with HuggingFace:
# model = AutoModelForCausalLM.from_pretrained(name, load_in_8bit=True)
```

---

## 10.4 Recommended Resources

### Must-Watch
- **Andrej Karpathy — "Let's build GPT from scratch"** (YouTube)  
  The definitive video tutorial. 2 hours. Watch after module 06.
  
- **Andrej Karpathy — "Let's build the GPT Tokenizer"** (YouTube)  
  Everything about BPE and tiktoken.

### Must-Read Papers
| Paper | What it introduces |
|-------|-------------------|
| Attention Is All You Need (2017) | Original transformer |
| GPT-2 (2019) | Language modeling at scale |
| Scaling Laws (2020) | How to predict performance from compute |
| LoRA (2021) | Efficient fine-tuning |
| Flash Attention (2022) | Memory-efficient attention |
| LLaMA (2023) | Open-source foundation model |

### Code to Read
- `github.com/karpathy/nanoGPT` — the cleanest GPT implementation
- `github.com/karpathy/llm.c` — GPT in pure C/CUDA
- `github.com/huggingface/transformers` — production implementations

### Tools to Use
- **Ollama** — run Llama/Mistral locally with one command
- **LM Studio** — GUI for running LLMs locally
- **Weights & Biases** — experiment tracking for training runs
- **Google Colab** — free GPU for fine-tuning experiments

---

## 10.5 Your Linear Algebra is the Secret Weapon

Most people using LLMs treat them as black boxes. You understand:

| You know... | So you understand... |
|-------------|---------------------|
| Matrix multiplication | Every forward pass operation |
| Eigendecomposition | SVD of weight matrices, PCA of embeddings |
| Vector spaces | Why cosine similarity works, what embeddings represent |
| Dot products | The attention score formula |
| Projections | What Q, K, V projections are doing geometrically |
| Rank | Why LoRA works (weights are approximately low-rank) |

The next frontier — mechanistic interpretability, understanding *what* specific attention heads compute — is almost entirely linear algebra applied to neural network activations.

---

## 10.6 Suggested Learning Path From Here

```
Week 1-2:  Complete modules 01-06 (you've done this!)
Week 3:    Read nanoGPT source code line by line
Week 4:    Fine-tune GPT-2 on a dataset you care about (module 08)
Week 5:    Implement RoPE and SwiGLU, replace in your transformer
Week 6:    Read "Attention Is All You Need" — you can now understand all of it
Month 2:   Read the LLaMA paper, understand all architectural choices
Month 3:   Implement LoRA from scratch, compare to peft library
Beyond:    Mechanistic interpretability, RLHF, building applications
```

---

## Final Note

The math you've been doing — matrix multiplications, dot products, projections — is **the same math** that runs GPT-4, Claude, Gemini, and every other LLM. The only difference is scale and engineering.

You now have everything you need to keep going. Build things. Break things. Read the source code.

---

> **Congratulations** — you've made it through all 10 modules. Go build something. 🧠
