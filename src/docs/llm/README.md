# 🧠 LLMs From Scratch — A Linear Algebra First Tutorial

> **Who this is for:** Someone who knows linear algebra and wants to understand how LLMs *actually* work, then build and modify them.

---

## How to Use This Tutorial

Each module is a standalone markdown file with:
- 📖 Concept explanation
- 🔢 The math (using your LA knowledge)
- 💻 Code you run and modify
- 🧪 Experiments to deepen understanding

**Work through them in order.** Each builds on the last.

---

## Modules

| # | File | What You'll Learn |
|---|------|-------------------|
| 01 | `01_vectors_and_embeddings.md` | How words become vectors; vector spaces; cosine similarity |
| 02 | `02_matrix_ops_in_neural_nets.md` | How matrix math powers neural net layers; dot products as learned functions |
| 03 | `03_backprop_and_gradients.md` | How models learn; gradients; chain rule in matrix form |
| 04 | `04_attention_mechanism.md` | The core of transformers; Q, K, V matrices; self-attention from scratch |
| 05 | `05_transformer_architecture.md` | Full transformer block; layer norm; feed-forward layers; residual streams |
| 06 | `06_build_nanogpt.md` | Build a working GPT in ~200 lines of PyTorch, train it on real text |
| 07 | `07_tokenization_and_training.md` | BPE tokenization; training loops; loss curves; what's actually happening |
| 08 | `08_huggingface_and_finetuning.md` | Load real LLMs (Llama, Mistral); fine-tune on your own data |
| 09 | `09_inference_and_sampling.md` | Temperature; top-k/top-p; beam search; how text is generated |
| 10 | `10_what_to_explore_next.md` | LoRA, RLHF, quantization, and where to go from here |

---

## Setup (Do This First)

```bash
# Create a virtual environment
python -m venv llm-env
source llm-env/bin/activate   # Windows: llm-env\Scripts\activate

# Install everything you'll need
pip install torch numpy matplotlib jupyter transformers datasets tokenizers
```

You'll also want:
- **Python 3.10+**
- A GPU helps but is NOT required for modules 01–06 (small models)
- For module 08, a free Google Colab account works great (free GPU)

---

## Quick Sanity Check

Run this to confirm your setup:

```python
import torch
import numpy as np

print(f"PyTorch: {torch.__version__}")
print(f"NumPy: {np.__version__}")
print(f"GPU available: {torch.cuda.is_available()}")

# The single most important operation in all of deep learning:
A = torch.randn(4, 8)   # a matrix
x = torch.randn(8)      # a vector
print(f"\nA @ x = {A @ x}")  # matrix-vector multiply — you'll see this EVERYWHERE
```

---

> **Start with** `01_vectors_and_embeddings.md` →
