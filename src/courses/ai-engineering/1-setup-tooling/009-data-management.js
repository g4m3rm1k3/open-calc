export default {
  id: 'ae-p0-09-data-management',
  slug: 'data-management',
  chapter: 'ae-p0',
  order: 8,
  title: 'Data Management',
  subtitle: 'Data is the fuel. How you manage it determines how fast you go.',
  tags: ['datasets', 'huggingface', 'parquet', 'arrow', 'csv', 'dvc', 'git-lfs', 'streaming', 'splits'],

  hook: {
    question: 'How do you load, version, and split datasets in a way that makes experiments reproducible?',
    realWorldContext:
      'Every AI project starts with data. You need to find datasets, download them, convert between formats, split them for training and evaluation, and version them so experiments are reproducible. Doing this manually every time is slow and error-prone. You need a repeatable workflow.',
    previewVisualizationId: 'PythonNotebook',
  },

  intuition: {
    prose: [
      'The Hugging Face `datasets` library is the standard way to load data for AI work. It handles downloading, caching, format conversion, and streaming out of the box. After the first download, datasets load from cache at `~/.cache/huggingface/datasets/`.',
      'Every ML project needs three splits: train (model learns from this, ~80%), validation (check progress during training, ~10%), test (final evaluation after training, ~10%). Always set a fixed random seed when splitting — the same seed produces the same split every time, guaranteeing reproducibility.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Parquet is the right storage format for ML',
        body: 'Parquet uses columnar compression — much smaller than CSV and far faster to read. For ML datasets, always store as Parquet. Use CSV/JSON only for human-readable interchange.',
      },
      {
        type: 'warning',
        title: 'Never put model weights or large datasets in git',
        body: 'A 7B model is 14 GB. Add `*.safetensors`, `*.bin`, `*.pt`, and `data/` to `.gitignore`. Use .gitignore for personal projects, Git LFS for team-shared weights, or DVC for fully reproducible experiment tracking.',
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'Data Management',
        mathBridge: 'Reproducibility requires fixed seeds for splits and exact version pins for datasets. The same seed + same dataset version = the same split, every time.',
        caption: 'Work through these cells to build the data management workflow used throughout this course.',
        props: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Loading and caching datasets',
              prose: [
                '## Load a dataset',
                '```python\nfrom datasets import load_dataset\n\ndataset = load_dataset("imdb")\nprint(dataset)\nprint(dataset["train"][0])\n```',
                'After the first download, loads from `~/.cache/huggingface/datasets/`.',
                '## Stream large datasets',
                'Some datasets are too large to fit on disk. Streaming loads them row by row without downloading the full thing:',
                '```python\ndataset = load_dataset("wikipedia", "20220301.en", split="train", streaming=True)\n\nfor i, example in enumerate(dataset):\n    print(example["title"])\n    if i >= 4:\n        break\n```',
                'Streaming gives you an `IterableDataset`. Memory usage stays constant regardless of dataset size.',
              ],
              code: `# Simulate the datasets library workflow
# (requires 'pip install datasets' to run with real data)

import json
from pathlib import Path

# Simulated dataset entry (same structure as HuggingFace datasets)
mock_imdb_train = [
    {"text": "This film was a complete waste of time.", "label": 0},
    {"text": "One of the best movies I have ever seen!", "label": 1},
    {"text": "Absolutely terrible acting and plot.", "label": 0},
    {"text": "A masterpiece of modern cinema.", "label": 1},
    {"text": "I fell asleep halfway through.", "label": 0},
]

class MockDataset:
    """Simulate the HuggingFace Dataset interface."""
    def __init__(self, data, name="train"):
        self.data = data
        self.name = name
        self.features = list(data[0].keys()) if data else []

    def __len__(self):
        return len(self.data)

    def __getitem__(self, idx):
        return self.data[idx]

    def __repr__(self):
        return f"Dataset({{features: {self.features}, num_rows: {len(self.data)}}})"

dataset = MockDataset(mock_imdb_train)
print(f"Dataset: {dataset}")
print(f"\\nFirst example: {dataset[0]}")
print(f"Total examples: {len(dataset)}")
print(f"\\nLabel distribution:")
labels = [ex['label'] for ex in dataset.data]
for label, name in [(0, 'negative'), (1, 'positive')]:
    count = labels.count(label)
    print(f"  {name}: {count} ({count/len(labels)*100:.0f}%)")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 2,
              cellTitle: 'Dataset formats: CSV, JSON, Parquet, Arrow',
              prose: [
                '## Convert between formats',
                '```python\ndataset = load_dataset("imdb", split="train")\n\ndataset.to_csv("imdb_train.csv")\ndataset.to_json("imdb_train.json")\ndataset.to_parquet("imdb_train.parquet")\n```',
                '## Format comparison',
                '| Format | Size | Read Speed | Best For |\n|--------|------|-----------|----------|\n| CSV | Large | Slow | Human readability, spreadsheets |\n| JSON | Large | Slow | APIs, nested data |\n| Parquet | Small | Fast | Analytics, columnar queries |\n| Arrow | Small | Fastest | In-memory processing (what `datasets` uses internally) |',
                'For AI work, Parquet is the best storage format. Arrow is what you work with in memory. CSV and JSON are for interchange.',
              ],
              code: `# Compare format sizes and characteristics

import sys

# Simulate a small dataset to compare formats
sample_data = [{"text": "sample text " * 10, "label": i % 2} for i in range(100)]

# Estimate sizes in different formats
import json

def estimate_csv_size(data):
    lines = ["text,label"]
    for row in data:
        lines.append(f'"{row["text"]}",{row["label"]}')
    return len("\\n".join(lines).encode())

def estimate_json_size(data):
    return len(json.dumps(data).encode())

def estimate_parquet_size(data):
    # Parquet is roughly 3-5x smaller than CSV for text data
    csv_size = estimate_csv_size(data)
    return int(csv_size * 0.3)  # approximate

formats = {
    "CSV": estimate_csv_size(sample_data),
    "JSON": estimate_json_size(sample_data),
    "Parquet (estimated)": estimate_parquet_size(sample_data),
}

print("Format size comparison (100 examples):")
csv_size = formats["CSV"]
for fmt, size in formats.items():
    ratio = size / csv_size
    bar = "█" * int(ratio * 20)
    print(f"  {fmt:<25} {size:>6} bytes  {bar}")

print("\\nFor AI work:")
print("  Store: Parquet (smallest, fastest reads)")
print("  Exchange: JSON or CSV (human-readable)")
print("  In-memory: Arrow (what HuggingFace datasets uses internally)")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 3,
              cellTitle: 'Reproducible train/val/test splits',
              prose: [
                '## Three-way split with fixed seed',
                '```python\ndataset = load_dataset("imdb", split="train")\n\nsplit = dataset.train_test_split(test_size=0.2, seed=42)\ntrain_val = split["train"].train_test_split(test_size=0.125, seed=42)\n\ntrain_ds = train_val["train"]  # 80%\nval_ds   = train_val["test"]   # 10%\ntest_ds  = split["test"]       # 20% → but we want 10%\n\nprint(f"Train: {len(train_ds)}, Val: {len(val_ds)}, Test: {len(test_ds)}")\n```',
                'Always set a seed for reproducibility. The same seed produces the same split every time.',
                '## Why you must not touch the test set until the end',
                'The test set is for final evaluation only. If you peek at it while tuning hyperparameters, your final number is optimistic — you\'ve indirectly trained on the test set.',
              ],
              code: `import random

def train_val_test_split(data, val_frac=0.1, test_frac=0.1, seed=42):
    """
    Split a list into train/val/test with a fixed seed.
    Returns: (train, val, test)
    """
    rng = random.Random(seed)
    data = list(data)
    rng.shuffle(data)

    n = len(data)
    n_test = int(n * test_frac)
    n_val = int(n * val_frac)
    n_train = n - n_test - n_val

    train = data[:n_train]
    val = data[n_train:n_train + n_val]
    test = data[n_train + n_val:]

    return train, val, test

# Simulate splitting an IMDB-style dataset
dataset = [{"id": i, "label": i % 2} for i in range(1000)]

train, val, test = train_val_test_split(dataset, seed=42)
print(f"Split sizes (seed=42):")
print(f"  Train: {len(train)} ({len(train)/len(dataset)*100:.0f}%)")
print(f"  Val:   {len(val)} ({len(val)/len(dataset)*100:.0f}%)")
print(f"  Test:  {len(test)} ({len(test)/len(dataset)*100:.0f}%)")

# Verify reproducibility
train2, val2, test2 = train_val_test_split(dataset, seed=42)
print(f"\\nReproducibility check (same seed=42):")
print(f"  Same train set: {[x['id'] for x in train[:5]] == [x['id'] for x in train2[:5]]}")

# Different seed gives different split
train3, val3, test3 = train_val_test_split(dataset, seed=99)
print(f"  Different seed=99 gives different split: {train[0]['id'] != train3[0]['id']}")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 4,
              cellTitle: 'Handling large files: .gitignore, Git LFS, DVC',
              prose: [
                '## Option A: .gitignore (simplest)',
                '```\n*.bin\n*.safetensors\n*.pt\n*.onnx\ndata/*.parquet\ndata/*.csv\nmodels/\n```',
                '## Option B: Git LFS (track large files in git)',
                '```bash\ngit lfs install\ngit lfs track "*.bin"\ngit lfs track "*.safetensors"\ngit add .gitattributes\n```\nGit LFS stores pointers in your repo; actual files on a separate server. GitHub gives you 1 GB free.',
                '## Option C: DVC (data version control)',
                '```bash\npip install dvc\ndvc init\ndvc add data/training_set.parquet\ngit add data/training_set.parquet.dvc data/.gitignore\n```\nDVC creates small `.dvc` pointer files. The data lives in S3, GCS, or another backend.',
                '| Approach | Complexity | Best For |\n|----------|-----------|----------|\n| .gitignore | Low | Personal projects, downloaded data |\n| Git LFS | Medium | Teams sharing model weights via git |\n| DVC | High | Reproducible experiments, large datasets |',
              ],
              code: `from pathlib import Path
import os

def suggest_gitignore_entries(file_list):
    """
    Given a list of files, suggest appropriate .gitignore patterns
    and handling strategy for AI projects.
    """
    AI_LARGE_EXTENSIONS = {'.bin', '.safetensors', '.pt', '.onnx', '.h5', '.pkl'}
    DATA_EXTENSIONS = {'.parquet', '.csv', '.json', '.arrow', '.feather'}
    ENV_DIRS = {'.venv', '__pycache__', '.mypy_cache', '.pytest_cache'}

    suggestions = {
        "model_weights": [],
        "datasets": [],
        "environments": [],
        "other_large": [],
    }
    strategies = {}

    for f in file_list:
        p = Path(f)
        if p.suffix in AI_LARGE_EXTENSIONS:
            suggestions["model_weights"].append(f"*{p.suffix}")
            strategies[f] = "Use Git LFS or keep outside repo"
        elif p.suffix in DATA_EXTENSIONS and p.stat().st_size > 1_000_000 if os.path.exists(f) else True:
            suggestions["datasets"].append(str(p.parent / f"*{p.suffix}"))
            strategies[f] = "Use DVC or .gitignore"
        elif p.parts[0] in ENV_DIRS or p.name in ENV_DIRS:
            suggestions["environments"].append(str(p.parts[0]) + "/")
            strategies[f] = "Always .gitignore — never commit"

    print("Recommended .gitignore patterns for AI projects:")
    all_patterns = set()
    for category, patterns in suggestions.items():
        if patterns:
            print(f"\\n  # {category}")
            for p in set(patterns):
                print(f"  {p}")
                all_patterns.add(p)

    print("\\nRule of thumb:")
    print("  Personal project → .gitignore")
    print("  Team sharing models → Git LFS")
    print("  Reproducible experiments → DVC + cloud storage")

sample_files = [
    "models/llama-7b/weights.safetensors",
    "data/train.parquet",
    ".venv/lib/python3.12/site-packages/torch/__init__.py",
    "src/train.py",
    "outputs/model.bin",
]
suggest_gitignore_entries(sample_files)`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 'c1',
              challengeType: 'write',
              challengeNumber: 1,
              challengeTitle: 'Dataset split validator',
              difficulty: 'easy',
              prompt: 'Write `validate_splits(train, val, test)` that checks three dataset splits (each a list of dicts with an `"id"` key) and returns a dict with: `"total"` (total examples across all splits), `"fractions"` (dict of approximate percentages), `"has_overlap"` (True if any id appears in more than one split), and `"overlap_ids"` (list of ids that appear in multiple splits).',
              code: `def validate_splits(train, val, test):
    """
    Validate dataset splits for size and contamination.
    Returns: {total, fractions, has_overlap, overlap_ids}
    """
    pass

# Create a clean split
import random
random.seed(42)
all_data = [{"id": i, "text": f"example {i}"} for i in range(1000)]
random.shuffle(all_data)
train_data = all_data[:800]
val_data = all_data[800:900]
test_data = all_data[900:]

result = validate_splits(train_data, val_data, test_data)
print(f"Total: {result['total']}")
print(f"Fractions: {result['fractions']}")
print(f"Has overlap: {result['has_overlap']}")
print(f"Overlap ids: {result['overlap_ids']}")

print()

# Leaky split (test example appears in train)
leaky_test = [{"id": 5, "text": "example 5"}]  # id 5 is in train
result2 = validate_splits(train_data[:10], [], leaky_test)
print(f"Leaky split — has_overlap: {result2['has_overlap']}")
print(f"Overlap ids: {result2['overlap_ids']}")
`,
              output: '', status: 'idle', figureJson: null,
              testCode: `
if 'validate_splits' not in dir():
    res = "ERROR: validate_splits not defined."
else:
    train = [{"id": i} for i in range(8)]
    val = [{"id": i} for i in range(8, 9)]
    test = [{"id": i} for i in range(9, 10)]
    r = validate_splits(train, val, test)
    if r.get('total') != 10:
        res = f"ERROR: total should be 10, got {r.get('total')}"
    elif r.get('has_overlap') != False:
        res = f"ERROR: has_overlap should be False, got {r.get('has_overlap')}"
    else:
        # Leaky split
        leaky_test = [{"id": 0}]
        r2 = validate_splits(train, [], leaky_test)
        if not r2.get('has_overlap'):
            res = f"ERROR: has_overlap should be True for leaky split, got {r2}"
        elif 0 not in r2.get('overlap_ids', []):
            res = f"ERROR: id 0 should be in overlap_ids, got {r2.get('overlap_ids')}"
        else:
            res = "SUCCESS: validate_splits correctly detects split sizes and data leakage."
res
`,
              hint: 'Collect all ids from each split into sets. total = len(train) + len(val) + len(test). Check pairwise set intersections for overlap.',
            },
            {
              id: 'c2',
              challengeType: 'write',
              challengeNumber: 2,
              challengeTitle: 'Dataset cache manager',
              difficulty: 'medium',
              prompt: 'Write a `DatasetCache` class with `add(name, version, size_mb)`, `get(name, version)`, `list_cached()`, and `total_size_mb()` methods. `get` returns the cached entry or `None`. `list_cached()` returns a list of `"name@version (X MB)"` strings sorted by size descending.',
              code: `class DatasetCache:
    """Simulate the HuggingFace dataset cache at ~/.cache/huggingface/datasets/"""

    def __init__(self):
        self._cache = {}  # (name, version) -> size_mb

    def add(self, name, version, size_mb):
        """Record a dataset download in the cache."""
        pass

    def get(self, name, version):
        """Return cached entry dict or None if not cached."""
        pass

    def list_cached(self):
        """Return list of 'name@version (X MB)' strings, sorted by size descending."""
        pass

    def total_size_mb(self):
        """Return total cache size in MB."""
        pass

cache = DatasetCache()
cache.add("imdb", "plain_text", 84)
cache.add("wikipedia", "20220301.en", 21_000)
cache.add("squad", "plain_text", 35)
cache.add("mnist", "mnist", 21)

print(f"Cached datasets:")
for entry in cache.list_cached():
    print(f"  {entry}")

print(f"\\nTotal cache size: {cache.total_size_mb():,} MB")

print(f"\\nGet imdb: {cache.get('imdb', 'plain_text')}")
print(f"Get missing: {cache.get('coco', 'plain_text')}")
`,
              output: '', status: 'idle', figureJson: null,
              testCode: `
if 'DatasetCache' not in dir():
    res = "ERROR: DatasetCache not defined."
else:
    c = DatasetCache()
    c.add("imdb", "v1", 84)
    c.add("wikipedia", "v1", 21000)
    c.add("squad", "v1", 35)
    if c.total_size_mb() != 21119:
        res = f"ERROR: total_size_mb should be 21119, got {c.total_size_mb()}"
    elif c.get("imdb", "v1") is None:
        res = "ERROR: get('imdb', 'v1') should return an entry, got None"
    elif c.get("coco", "v1") is not None:
        res = f"ERROR: get('coco', 'v1') should return None, got {c.get('coco', 'v1')}"
    else:
        listed = c.list_cached()
        if not listed or 'wikipedia' not in listed[0]:
            res = f"ERROR: list_cached() should be sorted by size desc with wikipedia first, got {listed}"
        else:
            res = "SUCCESS: DatasetCache correctly tracks, retrieves, and sorts cached datasets."
res
`,
              hint: 'Store entries in self._cache as (name, version) -> size_mb. get returns {"name": ..., "version": ..., "size_mb": ...} or None. list_cached sorts by size_mb descending.',
            },
          ],
        },
      },
    ],
  },

  quiz: [
    {
      id: 'q1',
      question: 'Why is it important to have separate train, validation, and test splits in machine learning?',
      options: [
        'To make the dataset smaller so training is faster',
        'To evaluate model performance on unseen data and prevent overfitting',
        'To ensure each split uses a different file format',
        'To distribute data across multiple GPUs',
      ],
      correct: 1,
      explanation: 'The training set teaches the model, the validation set tunes hyperparameters during training, and the test set provides a final unbiased evaluation on data the model has never seen.',
    },
    {
      id: 'q2',
      question: 'What is the Hugging Face Hub primarily used for in AI/ML workflows?',
      options: [
        'Hosting and sharing datasets, models, and ML artifacts',
        'Running GPU training jobs in the cloud',
        'Managing Python virtual environments',
        'Version controlling source code like GitHub',
      ],
      correct: 0,
      explanation: "Hugging Face Hub is a platform for hosting and sharing pre-trained models, datasets, and ML demos. The 'datasets' library provides a standard way to load data from it.",
    },
    {
      id: 'q3',
      question: 'What advantage does the Parquet format have over CSV for storing ML datasets?',
      options: [
        'Parquet files are human-readable in any text editor',
        'Parquet uses columnar storage for smaller file sizes and faster read speeds',
        'Parquet supports more data types than CSV',
        'Parquet files can be edited in spreadsheet applications',
      ],
      correct: 1,
      explanation: 'Parquet is a columnar binary format that compresses better than CSV and enables fast column-level reads. It is the preferred storage format for ML datasets.',
    },
    {
      id: 'q4',
      question: "What does 'streaming=True' do when loading a dataset with the Hugging Face datasets library?",
      options: [
        'Downloads the dataset faster using parallel connections',
        'Loads data row by row without downloading the full dataset to disk',
        'Converts the dataset to a streaming video format',
        'Enables real-time updates as new data is added to the Hub',
      ],
      correct: 1,
      explanation: 'Streaming mode creates an IterableDataset that fetches rows on demand. Memory usage stays constant regardless of dataset size, which is essential for datasets too large to fit on disk.',
    },
    {
      id: 'q5',
      question: 'When should you use DVC (Data Version Control) instead of just .gitignore for large files?',
      options: [
        'When your dataset is smaller than 1 MB',
        'When you need to reproduce exact experiments across machines with versioned data',
        'When you are working alone on a personal project',
        'When you only have CSV files in your project',
      ],
      correct: 1,
      explanation: 'DVC tracks data versions with small pointer files in git while storing the actual data in remote storage (S3, GCS). It ensures anyone can reproduce your exact experiment with the same data.',
    },
  ],
}
