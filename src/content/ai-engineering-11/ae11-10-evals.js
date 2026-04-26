export default {
  id: 'ae11-10',
  slug: 'llm-evals',
  chapter: 'ae-p11',
  order: 9,
  title: 'LLM Evals',
  subtitle: 'You cannot improve what you cannot measure — build the eval harness first.',
  tags: ['evals', 'evaluation', 'llm-as-judge', 'ragas', 'g-eval', 'metrics'],
  hook: {
    question: 'How do you know if your new prompt is actually better than the old one — without reading every response by hand?',
    realWorldContext: 'Teams at OpenAI, Anthropic, and Google run thousands of automated eval cases before shipping any model or prompt change. Without evals you are flying blind — every deploy is a prayer.',
    previewVisualizationId: 'PythonNotebook',
  },
  intuition: {
    prose: [
      'An eval is simply: given an input, run your LLM pipeline, compare the output to a gold standard, produce a score.',
      'Exact-match evals are cheapest — compare the output string to a known correct answer. They work well for classification, extraction, and structured output tasks.',
      'LLM-as-judge evals use a second model to score the first model\'s output on criteria like factuality, helpfulness, or tone. This scales to open-ended generation where exact match is impossible.',
      'G-Eval (from the paper by Liu et al.) chains-of-thought the judge: it generates evaluation steps from a rubric, then scores 1–5 on each step. RAGAS provides similar structured metrics for RAG pipelines: faithfulness, answer relevancy, context precision.',
      'Eval-driven development means writing evals *before* you tune your prompts — the same discipline as test-driven development.',
    ],
    callouts: [
      { type: 'key-insight', text: 'A regression suite of 50–100 representative inputs is worth more than any single clever prompt tweak.' },
      { type: 'warning', text: 'LLM judges have their own biases (verbosity, position). Calibrate them against human labels before trusting scores.' },
      { type: 'tip', text: 'Store eval results with timestamps and prompt versions so you can plot score trends over time.' },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        initialCells: [
          {
            id: 1,
            cellTitle: 'Exact-Match Eval Harness',
            prose: 'The simplest eval: compare predicted output to a ground-truth label. Compute pass rate across a dataset.',
            code: `import json

dataset = [
    {"input": "What is the capital of France?", "expected": "Paris"},
    {"input": "What is 7 * 8?",                 "expected": "56"},
    {"input": "Name the largest planet.",        "expected": "Jupiter"},
    {"input": "What color is the sky?",          "expected": "Blue"},
]

def mock_llm(prompt: str) -> str:
    answers = {"France": "Paris", "7 * 8": "56", "largest planet": "Jupiter", "sky": "blue"}
    for key, val in answers.items():
        if key.lower() in prompt.lower():
            return val
    return "I don't know"

results = []
for item in dataset:
    prediction = mock_llm(item["input"])
    passed = prediction.strip().lower() == item["expected"].strip().lower()
    results.append({"input": item["input"], "prediction": prediction, "passed": passed})

pass_rate = sum(r["passed"] for r in results) / len(results)
print(json.dumps(results, indent=2))
print(f"\nPass rate: {pass_rate:.0%}")`,
            output: '',
            status: 'idle',
            figureJson: null,
          },
          {
            id: 2,
            cellTitle: 'LLM-as-Judge Scorer',
            prose: 'Ask a model to rate another model\'s answer. Here we simulate the judge response with a rubric-based scoring function.',
            code: `import random, json

def llm_judge(question: str, answer: str, criteria: str) -> dict:
    """
    In production: call Claude/GPT with a judge prompt.
    Here we simulate a score between 1 and 5 with reasoning.
    """
    # Simulate: longer answers tend to score slightly higher (a known judge bias)
    base = 3.0
    length_bonus = min(len(answer.split()) / 20, 1.0)
    score = round(min(5, max(1, base + length_bonus + random.uniform(-0.5, 0.5))))
    return {
        "score": score,
        "reasoning": f"The answer {'adequately' if score >= 3 else 'poorly'} addresses the question.",
        "criteria": criteria,
    }

cases = [
    {"q": "Explain gravity.", "a": "Gravity is a force that attracts objects with mass toward each other."},
    {"q": "Explain gravity.", "a": "It makes things fall."},
]

for case in cases:
    result = llm_judge(case["q"], case["a"], "factuality and completeness")
    print(f"Answer: '{case['a'][:50]}...'")
    print(f"  Score: {result['score']}/5 — {result['reasoning']}\n")`,
            output: '',
            status: 'idle',
            figureJson: null,
          },
          {
            id: 3,
            cellTitle: 'RAGAS-Style RAG Metrics',
            prose: 'For RAG systems, measure faithfulness (does the answer stick to the context?) and answer relevancy (does it address the question?).',
            code: `def faithfulness_score(answer: str, context: str) -> float:
    """Fraction of answer sentences that are grounded in the context."""
    sentences = [s.strip() for s in answer.split(".") if s.strip()]
    grounded = sum(1 for s in sentences if any(w in context.lower() for w in s.lower().split()))
    return grounded / len(sentences) if sentences else 0.0

def answer_relevancy(question: str, answer: str) -> float:
    """Overlap of key question words in the answer."""
    q_words = set(question.lower().split()) - {"what", "is", "the", "a", "an"}
    a_words = set(answer.lower().split())
    return len(q_words & a_words) / len(q_words) if q_words else 0.0

context = "The Eiffel Tower is located in Paris. It was built in 1889 by Gustave Eiffel."
question = "Where is the Eiffel Tower?"
answer = "The Eiffel Tower is in Paris, France."

f = faithfulness_score(answer, context)
r = answer_relevancy(question, answer)
print(f"Faithfulness:      {f:.2f}")
print(f"Answer Relevancy:  {r:.2f}")
print(f"RAGAS score (avg): {(f + r) / 2:.2f}")`,
            output: '',
            status: 'idle',
            figureJson: null,
          },
          {
            id: 'c1',
            challengeType: 'write',
            challengeNumber: 1,
            challengeTitle: 'LLM-as-Judge Scorer',
            difficulty: 'intermediate',
            prompt: `Implement \`judge_batch(cases, criteria)\` where \`cases\` is a list of \`{"question": ..., "answer": ...}\` dicts.
For each case, compute a score using this heuristic: start at 3, add 1 if the answer contains any word from the question (case-insensitive), subtract 1 if the answer is fewer than 5 words.
Return a list of \`{"question": ..., "score": ...}\` dicts.

Store the result of calling \`judge_batch\` on the provided test cases in \`res\`.`,
            code: `def judge_batch(cases, criteria="helpfulness"):
    # YOUR CODE HERE
    pass

test_cases = [
    {"question": "What is Python?", "answer": "Python is a high-level programming language."},
    {"question": "Explain loops.", "answer": "Yes."},
]

res = judge_batch(test_cases)
print(res)`,
            output: '',
            status: 'idle',
            figureJson: null,
            testCode: `scores = [r["score"] for r in res]
res = len(res) == 2 and scores[0] >= 3 and scores[1] <= 3
res`,
            hint: 'Split the answer into words to check length. Use set intersection between lowercased question words and answer words to check overlap.',
          },
        ],
      },
    ],
  },
  quiz: [
    {
      id: 1,
      question: 'Which eval type is best suited for open-ended generation tasks like summarization?',
      options: [
        'Exact-match eval',
        'Regular expression eval',
        'LLM-as-judge eval',
        'Unit test eval',
      ],
      correct: 2,
      explanation: 'Exact match fails for open-ended tasks because many valid paraphrases exist. An LLM judge can assess quality on rubric dimensions like coherence and factuality.',
    },
    {
      id: 2,
      question: 'In RAGAS, what does "faithfulness" measure?',
      options: [
        'Whether the retrieved documents are relevant to the question',
        'Whether the generated answer is grounded in the retrieved context',
        'Whether the model used the correct retrieval strategy',
        'Whether the answer matches the ground-truth label exactly',
      ],
      correct: 1,
      explanation: 'Faithfulness measures hallucination: does every claim in the answer appear in the retrieved context, or did the model invent facts?',
    },
    {
      id: 3,
      question: 'What is the key principle of eval-driven development?',
      options: [
        'Write evals only after you have a working v1 prompt',
        'Rely on user feedback instead of automated evals',
        'Write evals before tuning prompts so improvements are measurable',
        'Use human eval for every iteration to ensure quality',
      ],
      correct: 2,
      explanation: 'Like TDD, you write the test (eval) first. This makes "better" objectively measurable and catches regressions automatically.',
    },
  ],
};
