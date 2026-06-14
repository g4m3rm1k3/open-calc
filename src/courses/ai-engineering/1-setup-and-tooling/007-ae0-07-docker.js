export default {
  id: 'ae-p0-07-docker',
  slug: 'docker-for-ai',
  chapter: 'ae-p0',
  order: 6,
  title: 'Docker for AI',
  subtitle: 'Containers make "works on my machine" a thing of the past.',
  tags: ['docker', 'containers', 'dockerfile', 'nvidia', 'cuda', 'docker-compose', 'gpu', 'volumes'],

  hook: {
    question: 'How do you ship a model that needs exact CUDA, Python, and PyTorch versions to any machine?',
    realWorldContext:
      'You trained a model on your laptop with PyTorch 2.3, CUDA 12.4, and Python 3.12. Your colleague has PyTorch 2.1, CUDA 11.8, and Python 3.10. Your model crashes on their machine. Your Dockerfile works on both. AI projects are dependency nightmares. A typical stack includes Python, PyTorch, CUDA drivers, cuDNN, system-level C libraries, and specialized packages like flash-attn that need exact compiler versions. Docker packages all of this into a single image that runs identically everywhere.',
    previewVisualizationId: 'PythonNotebook',
  },

  intuition: {
    prose: [
      'Docker wraps your code, runtime, libraries, and system tools into an isolated unit called a container. Think of it as a lightweight virtual machine, except it shares the host OS kernel instead of running its own, so it starts in seconds instead of minutes.',
      'AI projects need Docker more than most because GPU drivers are fragile (CUDA 12.4 code does not run on CUDA 11.8), model weights are large (14 GB for a 7B model — volumes let you mount a models directory from the host), and real AI applications involve multiple services (inference server + vector database + frontend) that Docker Compose orchestrates with one command.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Image vs. Container',
        body: 'An **image** is the recipe (Dockerfile → built artifact). A **container** is a running instance of that image. One image can run as many containers as you want.',
      },
      {
        type: 'warning',
        title: 'Volume mounts are critical for AI',
        body: 'Without volumes, your 14 GB model downloads vanish when the container stops. Always mount `~/models:/models` and `$(pwd):/workspace` so data persists across rebuilds.',
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'Docker for AI',
        mathBridge: 'Container = isolated process sharing the host kernel. Image layer cache = each Dockerfile instruction is cached; unchanged layers are reused on rebuild.',
        caption: 'Work through these cells to understand the Docker workflow for AI development.',
        props: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Key vocabulary and container patterns',
              prose: [
                '## Key vocabulary',
                '| Term | What it means |\n|------|---------------|\n| Image | A read-only template. Your recipe. Built from a Dockerfile. |\n| Container | A running instance of an image. |\n| Dockerfile | Instructions to build an image, layer by layer. |\n| Volume | Persistent storage that survives container restarts. |\n| docker-compose | A tool for defining multi-container applications in YAML. |',
                '## Common container patterns in AI',
                '**Dev Container** — Full toolkit. Editor support. Jupyter. Debugging tools. Used during development.\n\n**Training Container** — Minimal. Just the training script and dependencies. Runs on GPU clusters.\n\n**Inference Container** — Optimized for serving. Small image. Fast cold start. Runs behind a load balancer.',
              ],
              code: `# Demonstrate what Docker does conceptually
# (actual Docker commands run in the terminal, not Python)

environments = {
    "Without Docker": {
        "Your machine": "Python 3.12 / CUDA 12.4 / PyTorch 2.3",
        "Colleague's machine": "Python 3.10 / CUDA 11.8 / PyTorch 2.1",
        "Server": "Python 3.11 / CUDA 12.1 / PyTorch 2.2",
        "Result": "Each machine fails differently",
    },
    "With Docker (same image everywhere)": {
        "Your machine": "Python 3.12 / CUDA 12.4 / PyTorch 2.3 / Your code",
        "Colleague's machine": "Python 3.12 / CUDA 12.4 / PyTorch 2.3 / Your code",
        "Server": "Python 3.12 / CUDA 12.4 / PyTorch 2.3 / Your code",
        "Result": "Identical behavior everywhere",
    },
}

for scenario, machines in environments.items():
    print(f"\\n{scenario}:")
    for machine, config in machines.items():
        print(f"  {machine}: {config}")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 2,
              cellTitle: 'The Dockerfile for AI development',
              prose: [
                '## Choosing a base image',
                '```\nnvidia/cuda:12.4.1-devel-ubuntu22.04  # Full CUDA toolkit + compilers (~4 GB)\nnvidia/cuda:12.4.1-runtime-ubuntu22.04 # CUDA runtime only (~1.5 GB)\npytorch/pytorch:2.3.1-cuda12.4-cudnn9-runtime # PyTorch pre-installed (~6 GB)\npython:3.12-slim                       # CPU only, lightweight (~150 MB)\n```',
                '## The AI dev Dockerfile',
                '```dockerfile\nFROM nvidia/cuda:12.4.1-devel-ubuntu22.04\n\nENV DEBIAN_FRONTEND=noninteractive\nENV PYTHONUNBUFFERED=1\n\nRUN apt-get update && apt-get install -y --no-install-recommends \\\\\n    python3.12 python3.12-venv python3.12-dev python3-pip \\\\\n    git curl build-essential \\\\\n    && rm -rf /var/lib/apt/lists/*\n\nRUN python -m pip install --no-cache-dir torch==2.3.1 \\\\\n    --index-url https://download.pytorch.org/whl/cu124\n\nRUN python -m pip install --no-cache-dir \\\\\n    numpy pandas scikit-learn matplotlib jupyter \\\\\n    transformers datasets accelerate safetensors\n\nWORKDIR /workspace\nVOLUME ["/workspace", "/models"]\nEXPOSE 8888\nCMD ["python"]\n```',
              ],
              code: `# Simulate building and running the Docker image
# (These commands run in your terminal, not Python)

docker_commands = {
    "Build the image": "docker build -t ai-dev -f phases/00-setup-and-tooling/07-docker-for-ai/code/Dockerfile .",
    "Run with GPU + volumes": (
        "docker run --rm -it --gpus all \\\\\\n"
        "    -v $(pwd):/workspace \\\\\\n"
        "    -v ~/models:/models \\\\\\n"
        "    ai-dev python -c \\"import torch; print(f'PyTorch {torch.__version__}, CUDA: {torch.cuda.is_available()}')\\""
    ),
    "Run Jupyter inside container": (
        "docker run --rm -it --gpus all \\\\\\n"
        "    -v $(pwd):/workspace \\\\\\n"
        "    -v ~/models:/models \\\\\\n"
        "    -p 8888:8888 \\\\\\n"
        "    ai-dev jupyter notebook --ip=0.0.0.0 --port=8888 --no-browser --allow-root"
    ),
    "List images and sizes": "docker images",
    "Remove unused images (reclaim disk)": "docker system prune -a",
}

print("Docker commands for AI development:")
print("=" * 50)
for desc, cmd in docker_commands.items():
    print(f"\\n# {desc}")
    print(cmd)`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 3,
              cellTitle: 'Volume mounts for models and data',
              prose: [
                '## Why volumes are critical for AI',
                'Without volumes, everything inside a container is lost when it stops. A 7B parameter model is 14 GB in fp16. You do not want to re-download it every time you rebuild.',
                '## Mount patterns',
                '```bash\n# Mount your code\n-v $(pwd):/workspace\n\n# Mount a shared models directory\n-v ~/models:/models\n\n# Mount datasets\n-v ~/datasets:/data\n```',
                '## Load from mounted path inside your script',
                '```python\nfrom transformers import AutoModel\n\nmodel = AutoModel.from_pretrained("/models/llama-7b")\n# The model lives on your host filesystem.\n# Rebuild the container without re-downloading.\n```',
              ],
              code: `# Simulate the volume mount concept
import os

class ContainerMount:
    """Simulate Docker volume mount behavior."""

    def __init__(self):
        self.mounts = {}       # host_path -> container_path
        self.container_files = {}  # container_path -> content

    def add_volume(self, host_path, container_path):
        self.mounts[host_path] = container_path
        return self

    def write_host_file(self, host_path, content):
        """Write a file on the host — visible inside container via mount."""
        for hpath, cpath in self.mounts.items():
            if host_path.startswith(hpath):
                relative = host_path[len(hpath):]
                container_full = cpath + relative
                self.container_files[container_full] = content
                return
        raise FileNotFoundError(f"No mount covers {host_path}")

    def read_container_file(self, container_path):
        if container_path in self.container_files:
            return self.container_files[container_path]
        raise FileNotFoundError(f"File not found in container: {container_path}")

# Simulate: model on host, accessible inside container
c = ContainerMount()
c.add_volume("/home/user/models", "/models")
c.add_volume(os.getcwd(), "/workspace")

# Write a "model" to host filesystem
c.write_host_file("/home/user/models/llama-7b/config.json", '{"model_type": "llama"}')

# Read it from inside the container
config = c.read_container_file("/models/llama-7b/config.json")
print(f"Model config accessible inside container: {config}")
print("Container rebuilt → model still available (it's on the host, not in the image)")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 4,
              cellTitle: 'Docker Compose for multi-service AI apps',
              prose: [
                '## Why Compose for AI',
                'A real RAG application is not just a Python script. It is an inference server, a vector database, maybe a web frontend. Docker Compose runs all of these with one command.',
                '## docker-compose.yml',
                '```yaml\nservices:\n  ai-dev:\n    build:\n      context: .\n      dockerfile: Dockerfile\n    deploy:\n      resources:\n        reservations:\n          devices:\n            - driver: nvidia\n              count: all\n              capabilities: [gpu]\n    volumes:\n      - ../../../:/workspace\n      - ~/models:/models\n    ports:\n      - "8888:8888"\n    command: jupyter notebook --ip=0.0.0.0 --port=8888 --no-browser --allow-root\n\n  qdrant:\n    image: qdrant/qdrant:v1.12.5\n    ports:\n      - "6333:6333"\n    volumes:\n      - qdrant_data:/qdrant/storage\n\nvolumes:\n  qdrant_data:\n```',
                '## Commands',
                '```bash\ndocker compose up -d      # start everything in background\ndocker compose down       # stop everything\ndocker compose down -v    # stop + delete volumes\n```',
                'Inside the AI container, reach Qdrant at `http://qdrant:6333` — Compose creates a shared network automatically.',
              ],
              code: `# Simulate multi-service communication via Docker Compose network
# In reality, services communicate by service name (Docker DNS)

services = {
    "ai-dev": {
        "image": "ai-dev:latest",
        "ports": {"host": 8888, "container": 8888},
        "volumes": ["/workspace", "/models"],
        "gpu": True,
    },
    "qdrant": {
        "image": "qdrant/qdrant:v1.12.5",
        "ports": {"host": 6333, "container": 6333},
        "volumes": ["qdrant_data:/qdrant/storage"],
        "gpu": False,
    },
}

print("Docker Compose services:")
for name, config in services.items():
    print(f"\\n  {name}:")
    print(f"    image: {config['image']}")
    print(f"    ports: {config['ports']['host']}:{config['ports']['container']}")
    print(f"    gpu: {config['gpu']}")

print("\\nService-to-service communication:")
print("  From ai-dev container:")
print("  client = QdrantClient(host='qdrant', port=6333)")
print("  ↑ 'qdrant' resolves via Docker Compose internal DNS")
print("  No IP addresses needed. Service names are hostnames.")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 'c1',
              challengeType: 'write',
              challengeNumber: 1,
              challengeTitle: 'Dockerfile layer analyzer',
              difficulty: 'easy',
              prompt: 'Write `analyze_dockerfile(dockerfile_text)` that parses a Dockerfile string and returns a dict with `"layers"` (list of instruction strings like "FROM", "RUN", "COPY"), `"base_image"` (the FROM value), and `"exposed_ports"` (list of ints from EXPOSE instructions).',
              code: `def analyze_dockerfile(dockerfile_text):
    """
    Parse a Dockerfile and return layer info.
    Returns: {"layers": [...], "base_image": str, "exposed_ports": [...]}
    """
    pass

dockerfile = """
FROM nvidia/cuda:12.4.1-devel-ubuntu22.04

ENV DEBIAN_FRONTEND=noninteractive
ENV PYTHONUNBUFFERED=1

RUN apt-get update && apt-get install -y python3.12 git curl

RUN pip install torch numpy transformers

WORKDIR /workspace

VOLUME ["/workspace", "/models"]

EXPOSE 8888

CMD ["python"]
"""

result = analyze_dockerfile(dockerfile)
print(f"Total layers: {len(result['layers'])}")
print(f"Instructions used: {set(result['layers'])}")
print(f"Base image: {result['base_image']}")
print(f"Exposed ports: {result['exposed_ports']}")
`,
              output: '', status: 'idle', figureJson: null,
              testCode: `
if 'analyze_dockerfile' not in dir():
    res = "ERROR: analyze_dockerfile not defined."
else:
    df = "FROM python:3.12-slim\\nRUN pip install numpy\\nEXPOSE 8888\\nEXPOSE 5000\\nCMD ['python']"
    r = analyze_dockerfile(df)
    if not isinstance(r, dict):
        res = "ERROR: Must return a dict."
    elif r.get('base_image') != 'python:3.12-slim':
        res = f"ERROR: base_image should be 'python:3.12-slim', got {r.get('base_image')}"
    elif set(r.get('exposed_ports', [])) != {8888, 5000}:
        res = f"ERROR: exposed_ports should be {{8888, 5000}}, got {r.get('exposed_ports')}"
    elif 'FROM' not in r.get('layers', []):
        res = f"ERROR: 'FROM' should be in layers, got {r.get('layers')}"
    else:
        res = "SUCCESS: analyze_dockerfile correctly parses layers, base image, and ports."
res
`,
              hint: 'Split by newlines, strip each line, skip blanks and comments. Each non-blank line starts with an instruction keyword — split on the first space to get instruction and value.',
            },
            {
              id: 'c2',
              challengeType: 'write',
              challengeNumber: 2,
              challengeTitle: 'Volume mount resolver',
              difficulty: 'medium',
              prompt: 'Write `resolve_path(container_path, mounts)` where `mounts` is a list of `"host_path:container_path"` strings (like Docker -v flags). Return the host path that the container path maps to, or `None` if no mount covers it. Use the longest matching mount prefix (most specific mount wins).',
              code: `def resolve_path(container_path, mounts):
    """
    Find which host path a container path maps to.
    mounts: list of "host:container" strings
    Returns host path string or None.
    """
    pass

mounts = [
    "/home/user/projects:/workspace",
    "/home/user/models:/models",
    "/home/user/models/llama:/models/llama",  # more specific
]

tests = [
    "/workspace/train.py",
    "/models/bert/config.json",
    "/models/llama/weights.pt",   # should use the more specific mount
    "/tmp/scratch.txt",           # not mounted
]

for path in tests:
    host = resolve_path(path, mounts)
    print(f"  {path}")
    print(f"    → {host}")
`,
              output: '', status: 'idle', figureJson: null,
              testCode: `
if 'resolve_path' not in dir():
    res = "ERROR: resolve_path not defined."
else:
    mounts = [
        "/home/user:/workspace",
        "/home/user/models:/workspace/models",
    ]
    r1 = resolve_path("/workspace/train.py", mounts)
    r2 = resolve_path("/workspace/models/bert.pt", mounts)
    r3 = resolve_path("/tmp/scratch", mounts)
    if r1 != "/home/user/train.py":
        res = f"ERROR: /workspace/train.py should map to /home/user/train.py, got {r1}"
    elif r2 != "/home/user/models/bert.pt":
        res = f"ERROR: /workspace/models/bert.pt should use more specific mount, got {r2}"
    elif r3 is not None:
        res = f"ERROR: /tmp/scratch has no mount, should return None, got {r3}"
    else:
        res = "SUCCESS: resolve_path correctly finds the most specific matching mount."
res
`,
              hint: 'Parse each mount into (host, container). Filter mounts where container_path starts with the container prefix. Among matches, pick the one with the longest container prefix (most specific). Replace the prefix with the host path to construct the result.',
            },
          ],
        },
      },
    ],
  },

  quiz: [
    {
      id: 'q1',
      question: 'What is the primary difference between a Docker container and a virtual machine?',
      options: [
        'Containers are slower but more secure than VMs',
        'Containers share the host OS kernel while VMs run their own full OS',
        'Containers can only run Linux while VMs support any OS',
        'There is no practical difference',
      ],
      correct: 1,
      explanation: 'Containers share the host kernel and isolate at the process level, making them start in seconds. VMs run a complete guest OS with its own kernel, requiring more resources and slower startup.',
    },
    {
      id: 'q2',
      question: 'What is a Dockerfile?',
      options: [
        'A configuration file for the Docker daemon',
        'A set of instructions for building a Docker image layer by layer',
        'A log file that records container activity',
        'A file that lists running containers',
      ],
      correct: 1,
      explanation: 'A Dockerfile contains sequential instructions (FROM, RUN, COPY, etc.) that Docker executes to build an image. Each instruction creates a cached layer.',
    },
    {
      id: 'q3',
      question: 'Why are volume mounts critical for AI development with Docker?',
      options: [
        'Volumes make containers run faster by using host disk speed',
        'Volumes persist data (models, datasets, code) across container rebuilds so you don\'t re-download gigabytes each time',
        'Volumes are required for Python packages to install correctly',
        'Volumes allow multiple containers to share the same GPU',
      ],
      correct: 1,
      explanation: 'Without volumes, everything inside a container is lost when it stops. Volume mounts map host directories into the container, so model weights (14+ GB) and datasets survive rebuilds.',
    },
    {
      id: 'q4',
      question: 'What does the NVIDIA Container Toolkit enable?',
      options: [
        'Installing CUDA drivers inside the container',
        'Exposing host GPUs to Docker containers via the --gpus flag',
        'Running NVIDIA GPU containers on AMD hardware',
        'Compiling CUDA code during the Docker build process',
      ],
      correct: 1,
      explanation: 'The NVIDIA Container Toolkit is a runtime hook that exposes host GPUs to containers. The CUDA toolkit lives inside the container, but the GPU driver is shared from the host.',
    },
    {
      id: 'q5',
      question: "In a Docker Compose file for AI, how does the 'ai-dev' service reach the 'qdrant' vector database?",
      options: [
        "By using the host machine's IP address and port",
        "By using the service name 'qdrant' as the hostname, since Compose creates a shared network",
        'By mounting a shared volume between the two containers',
        'By configuring a VPN between the containers',
      ],
      correct: 1,
      explanation: "Docker Compose automatically creates a shared network where services can reach each other by name. The ai-dev container connects to 'http://qdrant:6333' using the service name as hostname.",
    },
  ],
}
