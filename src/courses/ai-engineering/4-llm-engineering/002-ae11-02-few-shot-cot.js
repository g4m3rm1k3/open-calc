export default {
  id: 'ae-p11-02-few-shot-cot',
  slug: 'few-shot-and-cot',
  chapter: 'ae-p11',
  order: 1,
  title: 'Few-Shot & Chain-of-Thought',
  subtitle: 'Zero-shot to 78%. Few-shot to 85%. Chain-of-thought to 96%. The data is in.',
  tags: ['few-shot', 'chain-of-thought', 'CoT', 'self-consistency', 'tree-of-thoughts', 'ReAct', 'reasoning', 'GSM8K'],

  hook: {
    question: 'Why does "think step by step" improve LLM accuracy by up to 40% on math problems?',
    realWorldContext:
      'In 2022, Google researchers published "Chain-of-Thought Prompting Elicits Reasoning in Large Language Models" showing that adding "Let\'s think step by step" to math problems improved PaLM\'s GSM8K score from 17.9% to 74.4% — a 4x improvement with a 5-word change. This was not magic. When a model generates intermediate reasoning tokens, those tokens become context for the next prediction, creating a working-memory effect. Understanding why this works, and when it fails, is the foundation of modern prompting for complex tasks.',
    previewVisualizationId: 'PythonNotebook',
  },

  intuition: {
    prose: [
      'Zero-shot prompting gives the model a task with no examples. Few-shot prompting adds 2–10 input/output examples that define the task pattern. Chain-of-thought adds intermediate reasoning steps. Self-consistency runs CoT multiple times and takes a majority vote. Tree-of-Thoughts branches and evaluates multiple reasoning paths.',
      'The mechanical reason CoT works: language models predict the next token. When a model writes out "First, convert 20% to 0.20..." that token sequence is part of the context for predicting the subsequent tokens. Generating the reasoning steps is equivalent to showing your work — it constrains the output to follow from the logic.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Example quality beats example quantity',
        body: 'For few-shot prompting, 3 high-quality, diverse examples outperform 10 mediocre ones. Select examples by: semantic similarity to the target input, diversity in the label/output space, and difficulty coverage (include edge cases).',
      },
      {
        type: 'warning',
        title: 'CoT fails on simple tasks and small models',
        body: 'Chain-of-thought hurts performance on simple classification tasks where step-by-step reasoning is unnecessary. It also fails on models smaller than ~100B parameters — the model lacks capacity to generate useful intermediate steps. For small models, use few-shot instead.',
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'Few-Shot & Chain-of-Thought',
        mathBridge: 'Self-consistency is majority voting over stochastic samples: run the same prompt N times at temperature>0, extract the final answer from each, return the most frequent answer. This is a form of ensemble prediction.',
        caption: 'Implement zero-shot, few-shot CoT, self-consistency, and a basic ReAct loop.',
        props: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Zero-shot vs. few-shot: the GSM8K performance gap',
              prose: [
                '## The benchmark that changed prompting',
                'GSM8K (Grade School Math 8K) is a dataset of 8,500 elementary math word problems. It became the standard benchmark for reasoning.',
                '| Prompting strategy | GSM8K accuracy |\n|---|---|\n| Zero-shot | ~17% (GPT-3 era) |\n| Few-shot (8 examples) | ~46% |\n| Zero-shot CoT ("think step by step") | ~48% |\n| Few-shot CoT (8 examples with reasoning) | ~74% |\n| Self-consistency (40 samples) | ~87% |',
                '## Why few-shot works',
                'Examples collapse the task ambiguity. The model no longer needs to infer what format you want, what vocabulary to use, or how detailed the answer should be — the examples show all of this.',
              ],
              code: `# Simulate the prompting strategies with a toy arithmetic problem
# Problem: "If a train travels 60mph for 2.5 hours, how far does it go?"

def zero_shot_prompt(problem):
    return {
        "system": "You are a math tutor.",
        "user": problem
    }

def few_shot_prompt(problem, examples):
    example_text = "\\n\\n".join([
        f"Problem: {ex['problem']}\\nAnswer: {ex['answer']}"
        for ex in examples
    ])
    return {
        "system": "You are a math tutor. Answer math problems based on the examples.",
        "user": f"{example_text}\\n\\nProblem: {problem}\\nAnswer:"
    }

def cot_prompt(problem, examples=None):
    if examples:
        example_text = "\\n\\n".join([
            f"Problem: {ex['problem']}\\nReasoning: {ex['reasoning']}\\nAnswer: {ex['answer']}"
            for ex in examples
        ])
        return {
            "system": "You are a math tutor. Think step by step.",
            "user": f"{example_text}\\n\\nProblem: {problem}\\nReasoning:"
        }
    return {
        "system": "You are a math tutor.",
        "user": f"{problem}\\n\\nLet's think step by step."
    }

# Example few-shot demonstrations with reasoning
examples = [
    {
        "problem": "A car goes 50mph for 3 hours. How far?",
        "reasoning": "Distance = speed × time. 50mph × 3h = 150 miles.",
        "answer": "150 miles"
    },
    {
        "problem": "If 5 workers build a wall in 12 days, how many days for 3 workers?",
        "reasoning": "Total work = 5 × 12 = 60 worker-days. 3 workers need 60 / 3 = 20 days.",
        "answer": "20 days"
    }
]

problem = "A train travels 60mph for 2.5 hours. How far does it go?"

for strategy, prompt in [
    ("Zero-shot", zero_shot_prompt(problem)),
    ("Few-shot (no reasoning)", few_shot_prompt(problem, [{"problem": e["problem"], "answer": e["answer"]} for e in examples])),
    ("CoT (few-shot + reasoning)", cot_prompt(problem, examples)),
]:
    print(f"[{strategy}]")
    print(f"  User: {prompt['user'][:150]}...")
    print()`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 2,
              cellTitle: 'Self-consistency: majority vote over multiple samples',
              prose: [
                '## The idea',
                'Run the same CoT prompt N times with temperature > 0 (so each run takes a different reasoning path). Extract the final answer from each run. Return the most common answer.',
                '## Why it works',
                'Different reasoning chains can lead to the same correct answer. But different errors rarely converge — incorrect answers are more diverse. Majority voting amplifies signal over noise.',
                '## Cost',
                'N times the token cost of a single call. N=5 is usually sufficient. N=40 is overkill for most applications. Use self-consistency when accuracy matters more than cost — e.g., medical triage, financial calculations.',
              ],
              code: `import re
from collections import Counter

def extract_final_answer(reasoning_text):
    """Extract the final answer from a CoT response."""
    # Look for the last number mentioned (common in math problems)
    numbers = re.findall(r'\\b(\\d+(?:\\.\\d+)?)\\s*(?:miles?|hours?|days?|dollars?|%)?\\b', reasoning_text.lower())
    return numbers[-1] if numbers else "unclear"

def simulate_cot_sample(problem, sample_id):
    """Simulate one CoT reasoning chain (different path each time)."""
    # Simulated reasoning paths with deliberate variation
    paths = [
        f"Speed × time = 60 × 2.5 = 150 miles. Answer: 150 miles.",
        f"In 1 hour: 60 miles. In 2 hours: 120 miles. Half hour: 30 miles. Total: 150 miles.",
        f"60 miles per hour. 2.5 hours. 60 × 2.5: 60 × 2 = 120, 60 × 0.5 = 30. 120 + 30 = 150.",
        f"Rate × time = distance. Rate = 60 mph, time = 2.5 h. 60 × 2.5 = 150 miles.",
        f"2.5 hours at 60mph. That's 2 hours (120 miles) + 0.5 hours (30 miles) = 150 miles.",
    ]
    return paths[sample_id % len(paths)]

def self_consistency(problem, n_samples=5):
    """Run self-consistency: N samples, majority vote."""
    samples = [simulate_cot_sample(problem, i) for i in range(n_samples)]
    answers = [extract_final_answer(s) for s in samples]

    vote_counts = Counter(answers)
    winner = vote_counts.most_common(1)[0]

    return {
        "answer": winner[0],
        "votes": winner[1],
        "total_samples": n_samples,
        "confidence": winner[1] / n_samples,
        "all_answers": answers,
        "vote_distribution": dict(vote_counts),
    }

problem = "A train travels 60mph for 2.5 hours. How far does it go?"
result = self_consistency(problem, n_samples=5)

print(f"Problem: {problem}")
print(f"\\nSelf-consistency result (5 samples):")
print(f"  Final answer: {result['answer']} miles")
print(f"  Vote count:   {result['votes']}/{result['total_samples']}")
print(f"  Confidence:   {result['confidence']:.1%}")
print(f"  Distribution: {result['vote_distribution']}")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 3,
              cellTitle: 'Tree-of-Thoughts: branch, evaluate, backtrack',
              prose: [
                '## When CoT is not enough',
                'CoT generates one linear reasoning chain. For combinatorial problems (Game of 24, planning, proofs), one chain often goes down a dead end. Tree-of-Thoughts (ToT) branches at each step, evaluates each branch, and backtracks from dead ends.',
                '## The Game of 24 result',
                'GPT-4 with standard prompting: 7.3% success. GPT-4 with ToT: 74% success. The task: use arithmetic operations to combine four numbers into 24.',
                '## Implementation',
                '1. Generate k candidate "thoughts" (next steps) from the current state\n2. Evaluate each thought: "sure", "likely", "unlikely"\n3. Prune unlikely branches, expand promising ones\n4. Continue until solution found or depth limit reached',
              ],
              code: `from typing import List, Tuple
import itertools

def can_make_24_two_numbers(a, b):
    """Check if two numbers can combine with basic ops to make 24."""
    targets = [a + b, a - b, b - a, a * b]
    if b != 0:
        targets.append(a / b)
    if a != 0:
        targets.append(b / a)
    return any(abs(t - 24) < 1e-9 for t in targets)

def evaluate_thought(numbers: List[float], target=24) -> str:
    """Evaluate if current state can reach 24. Returns 'sure', 'maybe', 'unlikely'."""
    if len(numbers) == 1:
        return "sure" if abs(numbers[0] - target) < 1e-9 else "unlikely"

    # Check if any pair can reduce to target
    for a, b in itertools.combinations(numbers, 2):
        remaining = [n for n in numbers if n not in [a, b]]
        for result in [a+b, a-b, b-a, a*b] + ([a/b] if b != 0 else []) + ([b/a] if a != 0 else []):
            new_numbers = remaining + [result]
            if len(new_numbers) == 1 and abs(new_numbers[0] - target) < 1e-9:
                return "sure"
            if len(new_numbers) >= 2:
                # Recurse one level
                sub = evaluate_thought(new_numbers)
                if sub in ("sure", "maybe"):
                    return "maybe"
    return "unlikely"

def tree_of_thoughts_game24(numbers: List[int], depth=0, max_depth=3) -> Tuple[bool, str]:
    """Simple ToT for Game of 24."""
    if abs(numbers[0] - 24) < 1e-9 and len(numbers) == 1:
        return True, f"Reached 24!"
    if len(numbers) <= 1 or depth >= max_depth:
        return False, "Dead end"

    candidates = []
    for i, a in enumerate(numbers):
        for j, b in enumerate(numbers):
            if i >= j:
                continue
            rest = [numbers[k] for k in range(len(numbers)) if k != i and k != j]
            for result, op_str in [
                (a+b, f"{a}+{b}={a+b}"),
                (a-b, f"{a}-{b}={a-b}"),
                (b-a, f"{b}-{a}={b-a}"),
                (a*b, f"{a}×{b}={a*b}"),
            ] + ([(a/b, f"{a}÷{b}={a/b:.1f}")] if b != 0 else []):
                new_numbers = rest + [result]
                evaluation = evaluate_thought(new_numbers)
                candidates.append((evaluation, new_numbers, op_str))

    # Prune: only try "sure" and "maybe" branches
    candidates.sort(key=lambda x: {"sure": 0, "maybe": 1, "unlikely": 2}[x[0]])

    for eval_score, new_nums, op in candidates[:3]:  # explore top 3 branches
        if eval_score == "unlikely":
            break
        success, path = tree_of_thoughts_game24(new_nums, depth+1, max_depth)
        if success:
            return True, f"{op} → {path}"

    return False, "No solution found"

# Test cases
test_cases = [
    [4, 6, 8, 2],  # → 4×6=24 (easy)
    [1, 3, 4, 6],  # classic: 6/(1-3/4)=24
    [5, 5, 5, 1],  # 5×(5-1/5)? harder
]

for nums in test_cases:
    success, path = tree_of_thoughts_game24(nums)
    print(f"{nums}: {'✓ ' + path if success else '✗ No solution'}")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 4,
              cellTitle: 'ReAct: reasoning + acting with tool use',
              prose: [
                '## ReAct (Reasoning + Acting)',
                'ReAct interleaves reasoning traces with tool calls: the model thinks, takes an action (calls a tool), observes the result, then thinks again. This is the foundation of modern AI agents.',
                '## The ReAct loop',
                '```\nThought: I need to find the current price of GPT-4o\nAction: search("GPT-4o API price per million tokens")\nObservation: $5.00 input, $15.00 output per million tokens\nThought: Now I can calculate cost for 10M tokens\nAction: calculator("10 * 5.00 + 10 * 15.00")\nObservation: 200.0\nThought: Total cost would be $200 for 10M tokens each way\nAnswer: $200\n```',
                '## Why ReAct beats CoT for factual tasks',
                'CoT uses only information in the model\'s weights (training data). ReAct can call tools to get current, accurate information. For anything involving recent events or precise calculations, ReAct outperforms pure CoT.',
              ],
              code: `# Minimal ReAct implementation

TOOL_REGISTRY = {}

def tool(name):
    """Decorator to register a tool."""
    def decorator(fn):
        TOOL_REGISTRY[name] = fn
        return fn
    return decorator

@tool("calculator")
def calculator(expression: str) -> str:
    """Evaluate a math expression safely."""
    try:
        result = eval(expression, {"__builtins__": {}}, {
            "abs": abs, "round": round, "max": max, "min": min,
        })
        return str(round(result, 4))
    except Exception as e:
        return f"Error: {e}"

@tool("search")
def search(query: str) -> str:
    """Simulate a web search (returns canned results for demo)."""
    KNOWLEDGE_BASE = {
        "claude sonnet price": "Claude Sonnet 4.6: $3/M input tokens, $15/M output tokens",
        "gpt-4o price": "GPT-4o: $5/M input tokens, $15/M output tokens",
        "embedding cost": "text-embedding-3-small: $0.02/M tokens",
    }
    for key, value in KNOWLEDGE_BASE.items():
        if key in query.lower():
            return value
    return f"No results found for: {query}"

def react_loop(problem: str, max_steps: int = 6):
    """Execute a simple ReAct reasoning loop."""
    # Simulate the Thought → Action → Observation sequence
    steps = []

    # Pre-planned trace for demonstration
    trace = [
        ("Thought", f"I need to calculate the cost of {problem}. First, I'll look up the price."),
        ("Action", "search('claude sonnet price')"),
        ("Observation", search("claude sonnet price")),
        ("Thought", "Claude Sonnet is $3/M input and $15/M output. Now I can calculate."),
        ("Action", "calculator('1000000 * 0.003 + 1000000 * 0.015')"),
        ("Observation", calculator("1000000 * 0.003 + 1000000 * 0.015")),
        ("Thought", "Total cost for 1M tokens in + 1M out is $18."),
        ("Answer", "$18 for 1M input + 1M output tokens with Claude Sonnet 4.6"),
    ]

    print(f"Problem: {problem}\\n")
    for step_type, content in trace:
        emoji = {"Thought": "💭", "Action": "🔧", "Observation": "👁️", "Answer": "✅"}.get(step_type, "")
        print(f"{emoji} {step_type}: {content}")
        steps.append({"type": step_type, "content": content})
        if step_type == "Answer":
            break

    return steps

# Run a ReAct trace
steps = react_loop("1 million input tokens + 1 million output tokens with Claude Sonnet 4.6")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 'c1',
              challengeType: 'write',
              challengeNumber: 1,
              challengeTitle: 'Build the few-shot prompt constructor',
              difficulty: 'easy',
              prompt: 'Write `build_few_shot_prompt(examples, test_input, task_description)` that constructs a few-shot prompt string. Each example is a `{"input": str, "output": str}` dict. Format as "Input: {input}\\nOutput: {output}" separated by blank lines, followed by the test input.',
              code: `def build_few_shot_prompt(examples, test_input, task_description=""):
    """Build a few-shot prompt from examples and a test input."""
    pass

examples = [
    {"input": "The food was great but service was slow", "output": '{"sentiment": "mixed"}'},
    {"input": "Terrible experience, never going back",   "output": '{"sentiment": "negative"}'},
    {"input": "Absolutely loved everything",              "output": '{"sentiment": "positive"}'},
]

prompt = build_few_shot_prompt(
    examples,
    test_input="Good coffee, a bit overpriced",
    task_description="Classify the sentiment as positive, negative, or mixed."
)
print(prompt)
`,
              output: '', status: 'idle', figureJson: null,
              testCode: `
if 'build_few_shot_prompt' not in dir():
    res = "ERROR: build_few_shot_prompt not defined."
else:
    ex = [{"input": "good", "output": "positive"}, {"input": "bad", "output": "negative"}]
    p = build_few_shot_prompt(ex, "okay", "classify sentiment")
    if "good" not in p:
        res = "ERROR: prompt should contain example inputs"
    elif "positive" not in p:
        res = "ERROR: prompt should contain example outputs"
    elif "okay" not in p:
        res = "ERROR: prompt should contain the test input"
    elif p.index("okay") < p.index("good"):
        res = "ERROR: test input should come after examples"
    else:
        res = "SUCCESS: Few-shot prompt correctly places examples before test input."
res
`,
              hint: 'Join the formatted examples with "\\n\\n". Then append "\\n\\nInput: {test_input}\\nOutput:" to signal the model where to respond.',
            },
            {
              id: 'c2',
              challengeType: 'write',
              challengeNumber: 2,
              challengeTitle: 'Self-consistency vote counter',
              difficulty: 'medium',
              prompt: 'Write `majority_vote(answers)` that takes a list of answer strings, counts occurrences of each, and returns `{"answer": most_common, "confidence": count/total, "distribution": {answer: count}}`. Normalize answers to lowercase and strip whitespace before counting.',
              code: `from collections import Counter

def majority_vote(answers):
    """Return majority vote result from a list of answer strings."""
    pass

samples = [
    "150 miles",
    "150 Miles",
    "150 miles",
    "120 miles",   # wrong answer from one path
    "150 miles",
]

result = majority_vote(samples)
print(f"Answer: {result['answer']}")
print(f"Confidence: {result['confidence']:.1%}")
print(f"Distribution: {result['distribution']}")
`,
              output: '', status: 'idle', figureJson: null,
              testCode: `
if 'majority_vote' not in dir():
    res = "ERROR: majority_vote not defined."
else:
    r = majority_vote(["yes", "YES", "Yes", "no", "yes"])
    if r['answer'] != "yes":
        res = f"ERROR: majority should be 'yes', got {r['answer']!r}"
    elif abs(r['confidence'] - 0.8) > 0.01:
        res = f"ERROR: confidence should be 0.8 (4/5), got {r['confidence']}"
    elif r['distribution'].get('yes', 0) != 4:
        res = f"ERROR: 'yes' should appear 4 times (case-normalized), got {r['distribution']}"
    else:
        res = "SUCCESS: majority_vote correctly normalizes and counts answers."
res
`,
              hint: 'Normalize: [a.lower().strip() for a in answers]. Then Counter(normalized). Find most_common(1)[0]. Confidence = count / len(answers).',
            },
          ],
        },
      },
    ],
  },

  quiz: [
    {
      id: 'q1',
      question: 'What is the mechanical reason Chain-of-Thought prompting improves accuracy?',
      options: [
        'It adds more tokens, which gives the model more time to "think"',
        'Generated reasoning tokens become part of the context, constraining subsequent predictions to follow from the logic',
        'It forces the model to use longer responses',
        'CoT only works because it uses a special keyword that activates reasoning circuits',
      ],
      correct: 1,
      explanation: 'LLMs predict the next token based on all preceding context. When reasoning steps are generated as tokens, they become part of the context for predicting the answer. This working-memory effect is why "let\'s think step by step" improves accuracy — it externalizes intermediate computation.',
    },
    {
      id: 'q2',
      question: 'When should you use self-consistency instead of a single CoT call?',
      options: [
        'Always — self-consistency is always better',
        'When accuracy is critical and cost is secondary — self-consistency uses N× the tokens but reduces errors significantly',
        'Only for creative tasks',
        'When you have less than 100K context window',
      ],
      correct: 1,
      explanation: 'Self-consistency samples the same prompt N times and takes a majority vote. This is N× more expensive but significantly reduces error rate. Use it when: accuracy matters more than cost, the task has a deterministic correct answer, and budget allows N=5–10 samples.',
    },
    {
      id: 'q3',
      question: 'What is the key advantage of ReAct over pure Chain-of-Thought?',
      options: [
        'ReAct is faster than CoT',
        'ReAct can call external tools to get current information, while CoT is limited to knowledge in the model\'s weights',
        'ReAct produces shorter responses',
        'ReAct only works with OpenAI models',
      ],
      correct: 1,
      explanation: 'CoT uses only the model\'s parametric knowledge (training data). ReAct can interleave reasoning with tool calls (search, calculator, database queries) to get current, accurate information. For anything involving recent events, real-time data, or precise computation, ReAct dramatically outperforms pure CoT.',
    },
  ],
}
