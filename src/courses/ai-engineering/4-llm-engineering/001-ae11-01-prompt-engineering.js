export default {
  id: 'ae-p11-01-prompt-engineering',
  slug: 'prompt-engineering',
  chapter: 'ae-p11',
  order: 0,
  title: 'Prompt Engineering',
  subtitle: 'Most people write prompts like they are texting a friend. This lesson closes the gap.',
  tags: ['prompts', 'system message', 'temperature', 'few-shot', 'chain-of-thought', 'output format', 'role prompting', 'anti-patterns'],

  hook: {
    question: 'Why does the same model give mediocre results for one person and expert-quality results for another?',
    realWorldContext:
      'You open an LLM chat interface. You type: "Write me a marketing email." You get something generic and unusable. A colleague sends the same model a 150-word prompt specifying role, audience, tone, length, one required metric, and a CTA format — and gets something they can actually ship. Same model. Same parameters. Wildly different outputs. The gap is not the model. It is the instruction quality. Prompt engineering is the primary interface between human intent and machine capability. This lesson teaches you the 10 structural patterns that professional AI engineers use every day.',
    previewVisualizationId: 'PythonNotebook',
  },

  intuition: {
    prose: [
      'LLMs are trained on billions of documents covering every quality level — from Reddit posts to peer-reviewed papers. When you write a prompt, you are biasing the model\'s sampling distribution toward a particular slice of its training data. A vague prompt activates a broad, median-quality distribution. A specific, role-anchored prompt with clear constraints activates a narrow, high-quality slice.',
      'Every LLM API call has three components: the system message (sets identity and rules, highest priority), the user message (the task), and the optional assistant prefill (first tokens of the response, steers format). Understanding what each one does changes how you write prompts.',
      'The cardinal rule: every ambiguity in your prompt is a branch point where the model guesses. Sometimes it guesses right. Most of the time it does not. Reduce ambiguity, increase output quality.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Role prompting activates expert distributions',
        body: '"You are a senior backend engineer at Stripe" biases sampling toward the expert end of relevant training data. The more specific the role, the narrower (and higher quality) the activated distribution. Generic roles like "helpful assistant" activate median-quality responses.',
      },
      {
        type: 'insight',
        title: 'Assistant prefill is Anthropic\'s secret weapon',
        body: 'Anthropic\'s API lets you start the assistant\'s response: set `{"role": "assistant", "content": "{"}` and Claude continues from there producing JSON without preamble. This is more reliable than asking for JSON in the prompt.',
      },
      {
        type: 'warning',
        title: 'Anti-pattern: over-constraining',
        body: 'If your system prompt is 2,000 words of rules, the model spends capacity following instructions instead of doing the task. Keep system prompts under 500 tokens. Internal contradictions ("Be concise. Also cover every edge case.") cause arbitrary behavior.',
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'Prompt Engineering',
        mathBridge: 'A prompt is an instruction to a probabilistic text completion engine. Temperature controls the sharpness of the probability distribution: temp=0 is argmax (deterministic), temp=1 is the full distribution (maximum entropy).',
        caption: 'Build a reusable prompt template library, a multi-model testing harness, and a scoring system. The full code is production-ready with real API calls.',
        props: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Anatomy of a prompt: system + user + prefill',
              prose: [
                '## The three components every API call has',
                '- **System message** — sets identity, rules, output constraints. Highest priority. Model treats this as ground truth for the session.\n- **User message** — the actual task or question. Changes every turn.\n- **Assistant prefill** (Anthropic only) — first tokens of the response. Forces format without preamble.',
                '## The vague vs. engineered prompt comparison',
                'Vague: `"Write a marketing email for our new product."`',
                'Engineered: `"You are a senior copywriter at a B2B SaaS company. Write a product launch email for DevFlow, a CI/CD pipeline debugger. Target: engineering managers at Series B startups. Tone: confident, technical, not salesy. Length: 150 words. Include metric: 3.2x faster pipeline debugging. End with one CTA linking to demo page. Output email only, no subject line."`',
                'Same model. Same parameters. The difference is instruction specificity.',
              ],
              code: `# The anatomy of a well-structured prompt

def build_message_structure(system, user, prefill=None):
    """Build an LLM API message structure."""
    messages = [{"role": "user", "content": user}]
    if prefill:
        # Anthropic-style assistant prefill
        messages.append({"role": "assistant", "content": prefill})

    return {
        "system": system,
        "messages": messages,
        "prefill_active": prefill is not None,
    }

# Example: vague prompt
vague = build_message_structure(
    system="You are a helpful assistant.",
    user="Write a marketing email.",
)

# Example: engineered prompt
engineered = build_message_structure(
    system=(
        "You are a senior copywriter at a B2B SaaS company. "
        "Your writing is confident, technical, and never salesy. "
        "You always include specific metrics and clear CTAs."
    ),
    user=(
        "Write a product launch email for DevFlow, a CI/CD pipeline debugger. "
        "Target: engineering managers at Series B startups. "
        "Length: 150 words. Include metric: 3.2x faster debugging. "
        "End with one CTA linking to demo page. Output the email only."
    ),
)

# Example: Anthropic prefill to force JSON output
json_extraction = build_message_structure(
    system="You are a data extraction engine. Output valid JSON only, no explanation.",
    user="Extract: John Smith, age 34, works at Google as a senior engineer since 2019.",
    prefill="{",  # forces Claude to continue with JSON, no preamble
)

for name, msg in [("Vague", vague), ("Engineered", engineered), ("JSON+Prefill", json_extraction)]:
    print(f"[{name}]")
    print(f"  System: {msg['system'][:80]}...")
    print(f"  User:   {msg['messages'][0]['content'][:80]}...")
    if msg["prefill_active"]:
        print(f"  Prefill: {msg['messages'][-1]['content']!r}")
    print()`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 2,
              cellTitle: 'The 10 prompt patterns — a complete library',
              prose: [
                '## Pattern 1: Persona — activate an expert distribution',
                '```\nYou are {role} with {experience}. Your style is {adjectives}. You prioritize {X} over {Y}.\n```',
                '## Pattern 2: Few-Shot — anchor format with examples',
                '```\nHere are examples:\nInput: "terrible service" → {"sentiment": "negative"}\nInput: "amazing food" → {"sentiment": "positive"}\nNow process: {input}\n```',
                '## Pattern 3: Chain-of-Thought — force reasoning steps',
                '```\nThink step by step: 1. Identify X. 2. Analyze Y. 3. Conclude Z. Show reasoning before answer.\n```',
                '## Pattern 4: Template Fill — constrain to a structure',
                '## Pattern 5: Critique — self-refine',
                '## Pattern 6: Guardrail — scope constraints',
                '## Pattern 7: Decomposition — break complex problems',
                '## Pattern 8: Meta-Prompt — LLM writes prompts',
                '## Pattern 9: Audience Adaptation — match vocabulary to reader',
                '## Pattern 10: Boundary — hard scope enforcement',
              ],
              code: `PROMPT_PATTERNS = {
    "persona": {
        "name": "Persona Pattern",
        "template": (
            "You are {role} with {experience}.\\n"
            "Your communication style is {style}.\\n"
            "You prioritize {priority}.\\n\\n"
            "{task}"
        ),
        "variables": ["role", "experience", "style", "priority", "task"],
        "temperature": 0.7,
        "description": "Activates a specific expert distribution in training data",
    },
    "few_shot": {
        "name": "Few-Shot Pattern",
        "template": (
            "Here are examples of the expected format:\\n\\n"
            "{examples}\\n\\n"
            "Now process this input:\\n{input}"
        ),
        "variables": ["examples", "input"],
        "temperature": 0.0,
        "description": "Provides concrete examples to anchor output format and style",
    },
    "chain_of_thought": {
        "name": "Chain-of-Thought Pattern",
        "template": (
            "Think through this step by step.\\n\\n"
            "Problem: {problem}\\n\\n"
            "Steps:\\n"
            "1. Identify the key components\\n"
            "2. Analyze each component\\n"
            "3. Synthesize your findings\\n"
            "4. State your conclusion\\n\\n"
            "Show your reasoning before giving the final answer."
        ),
        "variables": ["problem"],
        "temperature": 0.3,
        "description": "Forces explicit reasoning steps before final answer",
    },
    "template_fill": {
        "name": "Template Fill Pattern",
        "template": (
            "Extract information from the text and fill in the template.\\n\\n"
            "Text: {text}\\n\\n"
            "Template:\\n{template_structure}\\n\\n"
            "Fill every field. Write N/A if information is unavailable."
        ),
        "variables": ["text", "template_structure"],
        "temperature": 0.0,
        "description": "Constrains output to a specific structure with named fields",
    },
    "critique": {
        "name": "Critique Pattern",
        "template": (
            "Task: {task}\\n\\n"
            "Step 1: Generate an initial response.\\n"
            "Step 2: Critique for accuracy, completeness, clarity.\\n"
            "Step 3: Produce an improved final version.\\n\\n"
            "Label each step clearly."
        ),
        "variables": ["task"],
        "temperature": 0.5,
        "description": "Self-refinement through explicit critique",
    },
    "guardrail": {
        "name": "Guardrail Pattern",
        "template": (
            "You are a {role}.\\n\\n"
            "Rules:\\n"
            "- ONLY answer questions about {domain}\\n"
            "- If outside {domain}, say: 'This is outside my scope.'\\n"
            "- NEVER make up information. Say 'I don't know' if unsure.\\n"
            "- {additional_rules}\\n\\n"
            "User question: {question}"
        ),
        "variables": ["role", "domain", "additional_rules", "question"],
        "temperature": 0.3,
        "description": "Hard boundary on what topics the model responds to",
    },
    "meta_prompt": {
        "name": "Meta-Prompt Pattern",
        "template": (
            "Write a prompt for an LLM that will {objective}.\\n\\n"
            "Include: specific role/persona, constraints, output format, 2-3 examples, edge case handling.\\n\\n"
            "Optimize for {metric}. Target model: {model}."
        ),
        "variables": ["objective", "metric", "model"],
        "temperature": 0.7,
        "description": "Uses LLM to generate optimized prompts for other tasks",
    },
    "decomposition": {
        "name": "Decomposition Pattern",
        "template": (
            "Problem: {problem}\\n\\n"
            "Break into sub-problems:\\n"
            "1. List each sub-problem\\n"
            "2. Solve each independently\\n"
            "3. Combine sub-solutions\\n"
            "4. Verify against original problem"
        ),
        "variables": ["problem"],
        "temperature": 0.3,
        "description": "Breaks complex problems into manageable pieces",
    },
    "audience_adapt": {
        "name": "Audience Adaptation Pattern",
        "template": (
            "Explain {concept} for: {audience}.\\n\\n"
            "Constraints:\\n"
            "- Vocabulary appropriate for {audience}\\n"
            "- Length: {length}\\n"
            "- Include: {include}\\n"
            "- Exclude: {exclude}"
        ),
        "variables": ["concept", "audience", "length", "include", "exclude"],
        "temperature": 0.5,
        "description": "Adapts explanation complexity to the target audience",
    },
    "boundary": {
        "name": "Boundary Pattern",
        "template": (
            "You ONLY handle {scope}.\\n\\n"
            "If within scope: help fully.\\n"
            "If outside scope, respond exactly: '{refusal_message}'\\n\\n"
            "User: {user_input}"
        ),
        "variables": ["scope", "refusal_message", "user_input"],
        "temperature": 0.0,
        "description": "Hard scope restriction with exact refusal message",
    },
}

# Print the catalog
for name, p in PROMPT_PATTERNS.items():
    print(f"[{name}] {p['name']}")
    print(f"  {p['description']}")
    print(f"  Variables: {', '.join(p['variables'])}")
    print(f"  Temp: {p['temperature']}")
    print()`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 3,
              cellTitle: 'Prompt builder: fill in a pattern',
              prose: 'The `build_prompt` function takes a pattern name and a variables dict, fills in the template, and returns a structured message object ready to send to any LLM API. Missing variables raise `ValueError` immediately — no silent failures.',
              code: `def build_prompt(pattern_name, variables, system_override=None):
    """Build a prompt from a named pattern and variable values."""
    pattern = PROMPT_PATTERNS.get(pattern_name)
    if not pattern:
        raise ValueError(f"Unknown pattern: {pattern_name}. Available: {list(PROMPT_PATTERNS.keys())}")

    missing = [v for v in pattern["variables"] if v not in variables]
    if missing:
        raise ValueError(f"Missing variables for '{pattern_name}': {missing}")

    rendered = pattern["template"].format(**variables)
    system = system_override or f"You are an AI assistant using the {pattern['name']}."

    return {
        "system": system,
        "user": rendered,
        "temperature": pattern["temperature"],
        "pattern": pattern_name,
        "description": pattern["description"],
    }


# Example: persona pattern
prompt = build_prompt("persona", {
    "role": "a senior DevOps engineer at Netflix",
    "experience": "8 years of infrastructure automation and on-call experience",
    "style": "direct, practical, and concise",
    "priority": "reliability and operational clarity over theoretical elegance",
    "task": "Explain why container orchestration matters for microservices.",
})

print("Built prompt:")
print(f"  Pattern: {prompt['pattern']} ({prompt['description']})")
print(f"  System:  {prompt['system']}")
print(f"  User:    {prompt['user'][:200]}...")
print(f"  Temp:    {prompt['temperature']}")

# Example: few-shot pattern
few_shot_prompt = build_prompt("few_shot", {
    "examples": (
        'Input: "The food was amazing but service was slow"\\n'
        'Output: {"sentiment": "mixed", "food": "positive", "service": "negative"}\\n\\n'
        'Input: "Terrible experience, never coming back"\\n'
        'Output: {"sentiment": "negative", "food": null, "service": "negative"}'
    ),
    "input": "Great ambiance and perfect pasta, though a bit pricey",
})

print("\\nFew-shot prompt user message:")
print(few_shot_prompt["user"])`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 4,
              cellTitle: 'Temperature: the probability distribution knob',
              prose: [
                '## What temperature actually does',
                'Temperature T scales the logits (pre-softmax scores) before sampling: `scaled_logit = logit / T`. At T=0, the highest-scoring token is always chosen (deterministic). At T=1, you sample from the original distribution. At T>1, you flatten the distribution (more random).',
                '## Temperature guide by task type',
                '| Setting | Temp | Use case |\n|---|---|---|\n| Deterministic | 0.0 | Data extraction, code generation, classification |\n| Conservative | 0.3 | Analysis, summarization, technical writing |\n| Balanced | 0.7 | General Q&A, explanations |\n| Creative | 1.0 | Brainstorming, creative writing |\n| Chaotic | 1.5+ | Never in production |',
                '## Top-p (nucleus sampling)',
                'Top-p=0.9 limits sampling to the smallest set of tokens whose cumulative probability exceeds 0.9. This cuts off the long tail of unlikely tokens. Use temperature OR top-p, not both — they interact unpredictably.',
              ],
              code: `import math

def softmax(logits, temperature=1.0):
    """Compute softmax with temperature scaling."""
    if temperature == 0:
        # Argmax: all probability goes to the max logit
        max_idx = logits.index(max(logits))
        return [1.0 if i == max_idx else 0.0 for i in range(len(logits))]

    # Scale by temperature
    scaled = [l / temperature for l in logits]
    # Subtract max for numerical stability
    max_scaled = max(scaled)
    exp_scaled = [math.exp(l - max_scaled) for l in scaled]
    total = sum(exp_scaled)
    return [e / total for e in exp_scaled]

# Simulate token selection with different temperatures
# These could be logit scores for tokens ["Python", "Java", "Rust", "C++", "Go"]
sample_logits = [5.2, 3.1, 4.8, 2.9, 3.5]
tokens = ["Python", "Java", "Rust", "C++", "Go"]

print(f"{'Token':<10}", end="")
for temp in [0.0, 0.3, 0.7, 1.0, 1.5]:
    print(f"  T={temp}", end="")
print()
print("-" * 60)

for i, token in enumerate(tokens):
    print(f"{token:<10}", end="")
    for temp in [0.0, 0.3, 0.7, 1.0, 1.5]:
        probs = softmax(sample_logits, temp)
        print(f"  {probs[i]:.3f}", end="")
    print()

print()
print("At T=0: Python always selected (argmax, deterministic)")
print("At T=1: sample from original distribution")
print("At T=1.5: distribution flattened, less-likely tokens picked more often")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 5,
              cellTitle: 'Output format control: JSON, XML, delimiters',
              prose: [
                '## Forcing structured output without structured output APIs',
                '**JSON:** "Respond with a JSON object: `{"name": string, "score": 0-100, "reasoning": string under 50 words}`"',
                '**XML delimiters:** Claude is particularly strong at XML — Anthropic used it in training. Works cross-model.',
                '```xml\n<analysis>Your analysis here</analysis>\n<recommendation>Your recommendation</recommendation>\n<confidence>high|medium|low</confidence>\n```',
                '**Assistant prefill for JSON (Anthropic):** Add `{"role": "assistant", "content": "{"}` to your messages — Claude continues from there, producing JSON without preamble.',
                '## Reliability ranking',
                '1. Native structured outputs (OpenAI) or tool use (Anthropic) — most reliable\n2. Assistant prefill with `{"` (Anthropic only) — very reliable\n3. XML delimiters — reliable across models\n4. Prompt-only JSON request — less reliable, needs retry logic',
              ],
              code: `import json
import re

def extract_json_from_response(text):
    """Extract JSON from an LLM response that might have preamble/postamble."""
    # Try 1: direct parse (clean JSON)
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    # Try 2: find JSON object with regex
    match = re.search(r'\\{[^{}]*(?:\\{[^{}]*\\}[^{}]*)*\\}', text, re.DOTALL)
    if match:
        try:
            return json.loads(match.group())
        except json.JSONDecodeError:
            pass

    return None

def extract_xml_field(text, field):
    """Extract content between <field>...</field> XML tags."""
    pattern = f"<{field}>(.*?)</{field}>"
    match = re.search(pattern, text, re.DOTALL)
    return match.group(1).strip() if match else None

# Test with various LLM response styles

# Response 1: clean JSON (best case)
clean_json = '{"name": "John Smith", "score": 85, "reasoning": "Strong technical background"}'
print("Clean JSON:", extract_json_from_response(clean_json))

# Response 2: JSON with preamble (common)
with_preamble = 'Here is the extracted information:\\n{"name": "Jane Doe", "score": 92, "reasoning": "Excellent fit"}'
print("With preamble:", extract_json_from_response(with_preamble))

# Response 3: XML delimiters
xml_response = """
<analysis>The candidate has 8 years of relevant experience</analysis>
<recommendation>Proceed to technical interview</recommendation>
<confidence>high</confidence>
"""
print("\\nXML extraction:")
for field in ["analysis", "recommendation", "confidence"]:
    print(f"  {field}: {extract_xml_field(xml_response, field)}")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 6,
              cellTitle: 'Response scoring: measure prompt quality',
              prose: 'To compare prompt versions, you need a scoring function. This one measures length compliance, keyword coverage, forbidden phrase violations, and format validity — returning a composite score 0–1.',
              code: `import json
import re

def score_response(response_text, criteria):
    """Score an LLM response against evaluation criteria."""
    scores = {}

    if "max_words" in criteria:
        word_count = len(response_text.split())
        scores["word_count"] = word_count
        scores["length_compliant"] = word_count <= criteria["max_words"]

    if "required_keywords" in criteria:
        found = [kw for kw in criteria["required_keywords"]
                 if kw.lower() in response_text.lower()]
        scores["keywords_found"] = found
        total = len(criteria["required_keywords"])
        scores["keyword_coverage"] = len(found) / total if total > 0 else 1.0

    if "forbidden_phrases" in criteria:
        violations = [fp for fp in criteria["forbidden_phrases"]
                      if fp.lower() in response_text.lower()]
        scores["forbidden_violations"] = violations
        scores["no_violations"] = len(violations) == 0

    if "expected_format" in criteria:
        fmt = criteria["expected_format"]
        if fmt == "json":
            try:
                json.loads(response_text)
                scores["format_valid"] = True
            except (json.JSONDecodeError, TypeError):
                scores["format_valid"] = False
        elif fmt == "numbered_list":
            numbered = re.findall(r"^\\d+\\.", response_text, re.MULTILINE)
            scores["format_valid"] = len(numbered) >= 2

    # Composite score: average of all boolean and 0-1 float scores
    valid_scores = [v for v in scores.values()
                    if isinstance(v, bool) or (isinstance(v, float) and 0 <= v <= 1)]
    scores["composite"] = round(sum(float(s) for s in valid_scores) / len(valid_scores), 3) if valid_scores else 0.0
    return scores

# Test scoring
test_responses = {
    "good": "The API rate limit restricts how many requests per second a client can make to protect server resources and ensure fair usage across all clients.",
    "too_long": "The API rate limit is a feature that restricts requests. " * 20,
    "missing_keywords": "This thing controls how fast you can call things.",
    "forbidden": "In conclusion, it is important to note that rate limits exist.",
}

criteria = {
    "max_words": 50,
    "required_keywords": ["rate limit", "API", "requests"],
    "forbidden_phrases": ["in conclusion", "it is important to note"],
}

for name, response in test_responses.items():
    score = score_response(response, criteria)
    print(f"[{name}] composite={score['composite']:.3f}")
    print(f"  length_ok={score.get('length_compliant')}, "
          f"keywords={score.get('keyword_coverage', 0):.1%}, "
          f"clean={score.get('no_violations')}")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 7,
              cellTitle: 'Multi-model testing harness',
              prose: [
                '## Why test across models',
                'The best prompts are model-agnostic. They work on Claude, GPT, and open-weight models with minimal tuning. A prompt that only works on one model is brittle and expensive when that model is deprecated.',
                '## The pattern',
                '1. Write one prompt\n2. Run against 2-3 providers with `temperature=0` (isolate prompt quality from sampling noise)\n3. Score each response\n4. Compare and identify which criteria each model fails',
                'This harness simulates the calls. Swap `simulate_llm_call` for real API calls using the authenticated clients from Lesson 04.',
              ],
              code: `import hashlib
import time
import json

MODEL_CONFIGS = {
    "claude-sonnet-4-6":     {"provider": "anthropic", "context_window": 200_000},
    "gpt-4o":                {"provider": "openai",    "context_window": 128_000},
    "gemini-1.5-pro":        {"provider": "google",    "context_window": 2_000_000},
}

def simulate_llm_call(model_name, prompt):
    """Simulate an LLM response. Replace with real API calls."""
    time.sleep(0.01)
    h = hashlib.md5(f"{model_name}{prompt['user']}".encode()).hexdigest()[:6]
    responses = {
        "claude-sonnet-4-6":  f"[Claude] API rate limits cap requests/second. They protect server resources and ensure fair usage across all API clients. Limits vary by tier: free (3 req/min), pro (60 req/min), enterprise (custom). — [{h}]",
        "gpt-4o":             f"[GPT-4o] An API rate limit restricts request frequency. This prevents server overload and ensures equitable access for all clients making API requests. — [{h}]",
        "gemini-1.5-pro":     f"[Gemini] Rate limits control how many API requests a client can make per unit time. They maintain system stability, prevent abuse, and ensure fair resource distribution. — [{h}]",
    }
    text = responses.get(model_name, f"[Unknown model] Response. — [{h}]")
    tokens_in = len(prompt.get("system", "").split()) + len(prompt["user"].split())
    return {"text": text, "tokens_in": tokens_in, "tokens_out": len(text.split()), "latency_ms": 200 + hash(h) % 400}

def run_multi_model_test(prompt, criteria, models=None):
    """Run prompt against multiple models and return scored results."""
    if models is None:
        models = list(MODEL_CONFIGS.keys())

    results = {}
    for model in models:
        response = simulate_llm_call(model, prompt)
        score = score_response(response["text"], criteria)
        results[model] = {
            "text": response["text"],
            "score": score,
            "tokens": {"in": response["tokens_in"], "out": response["tokens_out"]},
            "latency_ms": response["latency_ms"],
        }
    return results

# Test the persona pattern across models
prompt = build_prompt("persona", {
    "role": "a senior technical writer at Stripe",
    "experience": "10 years of API documentation",
    "style": "precise, concise, example-driven",
    "priority": "clarity over comprehensiveness",
    "task": "Explain what an API rate limit is and why it exists.",
})

criteria = {
    "max_words": 60,
    "required_keywords": ["rate limit", "API", "requests"],
    "forbidden_phrases": ["in conclusion", "it is important to note"],
}

results = run_multi_model_test(prompt, criteria)

print(f"{'Model':<25} {'Score':>7} {'Words':>6} {'Latency':>10}")
print("-" * 52)
for model, data in sorted(results.items(), key=lambda x: x[1]["score"]["composite"], reverse=True):
    words = data["tokens"]["out"]
    score = data["score"]["composite"]
    latency = data["latency_ms"]
    print(f"{model:<25} {score:>7.3f} {words:>6} {latency:>8}ms")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 8,
              cellTitle: 'Context windows and cross-model guidelines',
              prose: [
                '## 2025 context window sizes',
                '| Model | Context | Output limit |\n|---|---|---|\n| GPT-5 | 400K | 128K |\n| Claude Opus 4.7 | 200K (1M beta) | 64K |\n| Claude Sonnet 4.6 | 200K (1M beta) | 64K |\n| Gemini 3 Pro | 2M | 64K |\n| Llama 4 | 10M | 8K |\n| DeepSeek-V3.1 | 128K | 32K |',
                '## Cross-model prompt design rules',
                '1. Use plain English, not model-specific syntax\n2. Be explicit about format — never rely on default behaviors\n3. Use XML delimiters for structure — all major models handle XML well\n4. Put instructions at the start AND end of the context (lost-in-the-middle affects all models)\n5. Test at temperature=0 first to isolate prompt quality from sampling noise\n6. Include 2-3 few-shot examples — they transfer across models better than instructions alone',
              ],
              code: `# Context window planning tool

CONTEXT_WINDOWS = {
    "claude-sonnet-4-6": {"max_tokens": 200_000, "output_limit": 64_000},
    "gpt-4o":            {"max_tokens": 128_000, "output_limit": 32_000},
    "gemini-1.5-pro":    {"max_tokens": 2_000_000, "output_limit": 64_000},
    "gpt-4o-mini":       {"max_tokens": 128_000, "output_limit": 16_000},
}

def count_tokens_approx(text):
    """Approximate token count: ~0.75 words per token on average."""
    return int(len(text.split()) / 0.75)

def fits_in_context(system_prompt, user_message, model, desired_output_tokens=1000):
    """Check if a prompt fits in the model's context window with room for output."""
    model_config = CONTEXT_WINDOWS.get(model, {"max_tokens": 8000, "output_limit": 4000})
    input_tokens = count_tokens_approx(system_prompt) + count_tokens_approx(user_message)
    total_needed = input_tokens + desired_output_tokens
    fits = total_needed <= model_config["max_tokens"]
    return {
        "model": model,
        "input_tokens_approx": input_tokens,
        "output_budget": desired_output_tokens,
        "total_needed": total_needed,
        "context_window": model_config["max_tokens"],
        "fits": fits,
        "headroom_tokens": model_config["max_tokens"] - total_needed,
    }

# Example: large document analysis
system = "You are an expert document analyst. Extract all action items and owners."
user = "Annual report content: " + " ".join([f"Section {i}: content here." for i in range(500)])

for model in CONTEXT_WINDOWS:
    result = fits_in_context(system, user, model, desired_output_tokens=2000)
    status = "✓" if result["fits"] else "✗"
    print(f"{status} {model:<25}: {result['total_needed']:>7} / {result['context_window']:>9} tokens")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 'c1',
              challengeType: 'write',
              challengeNumber: 1,
              challengeTitle: 'Build and test a guardrail prompt',
              difficulty: 'medium',
              prompt: 'Use `build_prompt` with the `"guardrail"` pattern to create a Python tutor assistant that stays in scope. Then write `test_guardrail(prompt, question)` that simulates what a model would return: `"in_scope"` or `"out_of_scope"` based on whether the question contains Python-related keywords.',
              code: `# Build the guardrail prompt
python_tutor_prompt = build_prompt("guardrail", {
    "role": "Python programming tutor",
    "domain": "Python programming",
    "additional_rules": "Give hints, not complete solutions. Ask the student to try first.",
    "question": "{user_question}",  # placeholder, replaced at runtime
})

print("Guardrail prompt built:")
print(f"  System: {python_tutor_prompt['system']}")
print(f"  User template: {python_tutor_prompt['user'][:200]}")

PYTHON_KEYWORDS = ["python", "function", "list", "dict", "loop", "class",
                   "import", "variable", "error", "syntax", "code", "print"]

def test_guardrail(prompt_template, question):
    """
    Simulate guardrail behavior.
    Return 'in_scope' if question contains Python keywords, else 'out_of_scope'.
    """
    pass  # your implementation

# Tests
print("\\nGuardrail tests:")
print(test_guardrail(python_tutor_prompt, "How do I sort a list in Python?"))      # in_scope
print(test_guardrail(python_tutor_prompt, "What is the capital of France?"))        # out_of_scope
print(test_guardrail(python_tutor_prompt, "I have a syntax error in my function"))  # in_scope
print(test_guardrail(python_tutor_prompt, "Write me a poem about dogs"))            # out_of_scope
`,
              output: '', status: 'idle', figureJson: null,
              testCode: `
if 'test_guardrail' not in dir():
    res = "ERROR: test_guardrail not defined."
elif 'build_prompt' not in dir():
    res = "ERROR: build_prompt not defined."
else:
    prompt = build_prompt("guardrail", {
        "role": "Python tutor", "domain": "Python",
        "additional_rules": "hints only", "question": "test",
    })
    r1 = test_guardrail(prompt, "How do I sort a list in Python?")
    r2 = test_guardrail(prompt, "What is the capital of France?")
    r3 = test_guardrail(prompt, "I have a syntax error in my code")
    if r1 != "in_scope":
        res = f"ERROR: Python list question should be in_scope, got {r1!r}"
    elif r2 != "out_of_scope":
        res = f"ERROR: Geography question should be out_of_scope, got {r2!r}"
    elif r3 != "in_scope":
        res = f"ERROR: syntax error question should be in_scope, got {r3!r}"
    else:
        res = "SUCCESS: Guardrail correctly classifies in-scope vs out-of-scope questions."
res
`,
              hint: 'Check if any PYTHON_KEYWORDS appears in question.lower(). Return "in_scope" if yes, "out_of_scope" if no.',
            },
            {
              id: 'c2',
              challengeType: 'write',
              challengeNumber: 2,
              challengeTitle: 'Prompt quality analyzer',
              difficulty: 'medium',
              prompt: 'Write `analyze_prompt_quality(user_message)` that returns a dict with keys: `has_role` (bool), `has_format_spec` (bool), `has_length_spec` (bool), `has_negative_constraint` (bool), and `quality_score` (0–4 count of True values). Check for: role words in message, format words ("json", "bullet", "numbered", "xml"), length words ("words", "sentences", "characters"), negative constraints ("do not", "never", "avoid", "don\'t").',
              code: `def analyze_prompt_quality(user_message):
    """Analyze prompt quality signals. Return dict with quality indicators."""
    pass

# Tests
vague = "Write a marketing email."
good = """You are a senior copywriter. Write a product launch email for DevFlow.
Target: engineering managers. Length: 150 words. Format: plain text paragraphs.
Do not use buzzwords. Include one metric. End with a CTA."""

vague_analysis = analyze_prompt_quality(vague)
good_analysis = analyze_prompt_quality(good)

print(f"Vague prompt quality: {vague_analysis}")
print(f"Good prompt quality:  {good_analysis}")
print(f"\\nVague score: {vague_analysis['quality_score']}/4")
print(f"Good score:  {good_analysis['quality_score']}/4")
`,
              output: '', status: 'idle', figureJson: null,
              testCode: `
if 'analyze_prompt_quality' not in dir():
    res = "ERROR: analyze_prompt_quality not defined."
else:
    vague = "Write a marketing email."
    good = "You are a senior copywriter. Write 150 words in bullet points. Do not use jargon."
    v = analyze_prompt_quality(vague)
    g = analyze_prompt_quality(good)
    if 'quality_score' not in v or 'quality_score' not in g:
        res = "ERROR: return dict must contain 'quality_score'"
    elif v['quality_score'] >= g['quality_score']:
        res = f"ERROR: good prompt ({g['quality_score']}) should score higher than vague ({v['quality_score']})"
    elif not isinstance(v.get('has_role'), bool):
        res = "ERROR: 'has_role' must be a bool"
    else:
        res = f"SUCCESS: vague={v['quality_score']}/4, good={g['quality_score']}/4. Quality analyzer works."
res
`,
              hint: 'Check msg.lower() for: role words like "you are"/"as a"; format words like "json","bullet","numbered","xml"; length words like "words","sentences"; negatives like "do not","never","avoid". Count the True values for quality_score.',
            },
            {
              id: 'c3',
              challengeType: 'write',
              challengeNumber: 3,
              challengeTitle: 'Temperature selector',
              difficulty: 'easy',
              prompt: 'Write `recommend_temperature(task_type)` that returns the recommended temperature for a given task type: `"extraction"` → 0.0, `"analysis"` → 0.3, `"qa"` → 0.7, `"creative"` → 1.0. For unknown types, return 0.7 as default.',
              code: `TASK_TEMPERATURES = {
    "extraction": 0.0,    # deterministic: always want same answer
    "classification": 0.0,
    "code_generation": 0.0,
    "summarization": 0.3,
    "analysis": 0.3,
    "technical_writing": 0.3,
    "qa": 0.7,
    "explanation": 0.7,
    "brainstorming": 1.0,
    "creative": 1.0,
}

def recommend_temperature(task_type):
    """Return recommended temperature for the given task type."""
    pass

# Tests
print(recommend_temperature("extraction"))     # 0.0
print(recommend_temperature("analysis"))       # 0.3
print(recommend_temperature("qa"))             # 0.7
print(recommend_temperature("creative"))       # 1.0
print(recommend_temperature("unknown_task"))   # 0.7 (default)
`,
              output: '', status: 'idle', figureJson: null,
              testCode: `
if 'recommend_temperature' not in dir():
    res = "ERROR: recommend_temperature not defined."
else:
    tests = [
        ("extraction", 0.0), ("analysis", 0.3), ("qa", 0.7),
        ("creative", 1.0), ("unknown_xyz", 0.7),
    ]
    failures = []
    for task, expected in tests:
        got = recommend_temperature(task)
        if got != expected:
            failures.append(f"recommend_temperature({task!r}) → {got}, expected {expected}")
    if failures:
        res = "ERROR: " + "; ".join(failures)
    else:
        res = "SUCCESS: Temperature recommendations match task types correctly."
res
`,
              hint: 'return TASK_TEMPERATURES.get(task_type, 0.7)',
            },
          ],
        },
      },
    ],
  },

  quiz: [
    {
      id: 'q1',
      question: 'What is the most common prompt engineering mistake?',
      options: [
        'Using too low a temperature',
        'Being vague — every ambiguity is a branch point where the model guesses',
        'Using too many examples in the system prompt',
        'Not using the OpenAI API',
      ],
      correct: 1,
      explanation: 'Vagueness is the root cause of most bad LLM outputs. Every ambiguity in your prompt is a place where the model picks arbitrarily from many valid interpretations. Specificity — format, length, audience, inclusions, exclusions — constrains the output space and dramatically improves results.',
    },
    {
      id: 'q2',
      question: 'What are the four core components of an effective prompt?',
      options: [
        'Model, temperature, max_tokens, stop_sequences',
        'Role/persona, context/constraints, output format, examples',
        'System message, user message, assistant reply, tool call',
        'Task, deadline, audience, budget',
      ],
      correct: 1,
      explanation: 'Role/persona (activates expert distribution), context/constraints (defines the task space), output format (specifies structure and length), and examples (anchors the expected pattern). These four cover the main axes of prompt quality.',
    },
    {
      id: 'q3',
      question: 'Why include output format instructions in a prompt?',
      options: [
        'LLMs cannot produce structured output without explicit instructions',
        'The format instructions increase token count, improving quality',
        'Without format instructions, the model chooses arbitrarily — explicit format produces consistent, parseable outputs',
        'Output format only matters for JSON, not other formats',
      ],
      correct: 2,
      explanation: 'Without format instructions, the model defaults to whatever format appears most common in training data for that context. For consistent, machine-parseable outputs (JSON, bullet lists, specific templates), explicit format instructions dramatically reduce variance.',
    },
    {
      id: 'q4',
      question: 'What is the purpose of a system prompt?',
      options: [
        'It compresses the user message for faster processing',
        'It sets the model\'s identity, behavioral rules, and output constraints — processed with highest priority and persisting across all turns',
        'It is equivalent to the first user message',
        'It is only used by OpenAI, not Anthropic or Google',
      ],
      correct: 1,
      explanation: 'The system prompt establishes the model\'s persistent identity and rules for the entire conversation. It is processed with higher attention weight than user messages. Anthropic gives system prompts the strongest adherence among major providers.',
    },
    {
      id: 'q5',
      question: 'How should you test whether a prompt change improved output quality?',
      options: [
        'Ask a colleague if the output looks better',
        'Count the words in each response',
        'Run both prompt versions at temperature=0, score outputs against explicit criteria, compare composite scores',
        'Change one thing at a time and check the response subjectively',
      ],
      correct: 2,
      explanation: 'Subjective evaluation is unreliable. The correct method: define explicit criteria (keyword coverage, format compliance, length), run at temp=0 to eliminate sampling noise, score responses against criteria, compare composite scores. This isolates prompt quality from randomness.',
    },
  ],
}
