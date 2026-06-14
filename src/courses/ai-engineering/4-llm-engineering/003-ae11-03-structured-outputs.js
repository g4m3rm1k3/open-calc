export default {
  id: 'ae-p11-03-structured-outputs',
  slug: 'structured-outputs',
  chapter: 'ae-p11',
  order: 2,
  title: 'Structured Outputs',
  subtitle: 'From free-form text to machine-parseable JSON — reliably, every time.',
  tags: ['json', 'pydantic', 'structured outputs', 'json schema', 'function calling', 'tool use', 'validation', 'constrained decoding'],

  hook: {
    question: 'What breaks first when you ask an LLM to return JSON without using a structured output API?',
    realWorldContext:
      'The answer: the JSON. Models hallucinate extra fields, use string where you need number, return `null` where you need an empty list, and wrap the JSON in markdown code fences. If your production code calls `json.loads(response)` without retry logic, it crashes approximately 15% of the time on real workloads. Structured output APIs (OpenAI\'s response_format, Anthropic\'s tool use) eliminate these failures by constraining the token distribution during generation. This lesson teaches the full spectrum: from prompt-only JSON to constrained decoding.',
    previewVisualizationId: 'PythonNotebook',
  },

  intuition: {
    prose: [
      'There are four levels of structured output reliability, from least to most reliable: (1) prompt-only JSON request — ask nicely, get JSON sometimes; (2) JSON mode — model commits to valid JSON, but schema is not enforced; (3) schema mode — native structured outputs, guarantees schema compliance; (4) constrained decoding — token-level grammar enforcement, impossible to violate the schema.',
      'Pydantic is the Python layer that validates LLM-generated JSON against a typed schema. Define a Pydantic model, generate JSON from the LLM, parse with `Model.model_validate(json_data)` — you get type-checked, validated Python objects or a clear `ValidationError`.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Tool use = structured output (Anthropic)',
        body: 'Anthropic\'s structured output mechanism is tool use. Define a "tool" with a JSON Schema input_schema, ask the model to call it — the response is guaranteed to match the schema. The Instructor library wraps this in a Pydantic interface.',
      },
      {
        type: 'warning',
        title: 'Always add retry logic for prompt-only JSON',
        body: 'If you cannot use native structured outputs, add: try `json.loads()` → on failure, retry with "Your response was not valid JSON. Return ONLY a JSON object with no other text." Three retries covers >99% of failures.',
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'Structured Outputs',
        mathBridge: 'Constrained decoding: after each token is generated, the valid next tokens are filtered by the current grammar state. Invalid tokens get probability 0. The sampling distribution is renormalized over only the valid tokens.',
        caption: 'Build a JSON validator, Pydantic extractor, and retry pipeline for structured LLM outputs.',
        props: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'The four levels of structured output reliability',
              prose: [
                '## Level 1: Prompt-only (unreliable)',
                '```python\n# Prompt: "Return a JSON object with keys: name, score, reasoning"\n# Model might return: markdown-wrapped JSON, extra fields, wrong types\n```',
                '## Level 2: JSON mode (valid JSON, no schema)',
                '```python\n# OpenAI: response_format={"type": "json_object"}\n# Guarantees valid JSON, but fields can be anything\n```',
                '## Level 3: Schema mode (guarantees schema compliance)',
                '```python\n# OpenAI: response_format={"type": "json_schema", "json_schema": {...}}\n# Anthropic: tools=[{"input_schema": json_schema}]\n# Returns exactly the fields and types you specified\n```',
                '## Level 4: Constrained decoding (token-level enforcement)',
                '```python\n# Outlines, LMQL, vLLM with guided decoding\n# Filters valid next tokens using a grammar — cannot produce invalid output\n```',
              ],
              code: `import json

# Simulate what happens at each level

def level1_prompt_only():
    """Simulate unreliable prompt-only JSON request."""
    # LLM might return any of these formats
    possible_responses = [
        '{"name": "John", "score": 85, "reasoning": "Strong"}',  # clean JSON ✓
        '\`\`\`json\\n{"name": "Jane", "score": 92}\\n\`\`\`',           # markdown-wrapped ✗
        'Here is the JSON:\\n{"name": "Bob", "score": 78}',       # with preamble ✗
        '{"name": "Alice", "score": "high", "extra": true}',     # wrong types ✗
    ]
    return possible_responses  # 1 in 4 is clean

def parse_json_robust(text):
    """Try to extract valid JSON from any LLM response."""
    import re
    # Try direct parse first
    try:
        return json.loads(text), "clean"
    except json.JSONDecodeError:
        pass

    # Strip markdown code fences
    stripped = re.sub(r'\`\`\`(?:json)?\\s*', '', text).strip('\` \\n')
    try:
        return json.loads(stripped), "stripped_markdown"
    except json.JSONDecodeError:
        pass

    # Find JSON object with regex
    match = re.search(r'\\{[^{}]*\\}', text, re.DOTALL)
    if match:
        try:
            return json.loads(match.group()), "extracted_regex"
        except json.JSONDecodeError:
            pass

    return None, "failed"

# Test robustness
for response in level1_prompt_only():
    data, method = parse_json_robust(response)
    status = "✓" if data else "✗"
    print(f"{status} [{method}] {str(response)[:60]}...")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 2,
              cellTitle: 'JSON Schema: defining the contract',
              prose: [
                '## JSON Schema basics',
                'JSON Schema is the industry standard for defining the structure of a JSON document. Every major structured output API uses it.',
                '```json\n{\n  "type": "object",\n  "properties": {\n    "name":      {"type": "string"},\n    "score":     {"type": "number", "minimum": 0, "maximum": 100},\n    "tags":      {"type": "array", "items": {"type": "string"}},\n    "sentiment": {"type": "string", "enum": ["positive", "negative", "mixed"]}\n  },\n  "required": ["name", "score"],\n  "additionalProperties": false\n}\n```',
                '## Key rules',
                '- `"required"` — fields the model MUST include\n- `"additionalProperties": false` — forbids extra fields\n- `"enum"` — restricts to specific string values\n- `"minimum"/"maximum"` — numeric bounds',
              ],
              code: `import json

def validate_against_schema(data, schema):
    """Manually validate JSON data against a simple schema (no jsonschema library needed)."""
    errors = []

    if schema.get("type") == "object":
        if not isinstance(data, dict):
            return [f"Expected object, got {type(data).__name__}"]

        # Check required fields
        for field in schema.get("required", []):
            if field not in data:
                errors.append(f"Missing required field: '{field}'")

        # Check additional properties
        if not schema.get("additionalProperties", True):
            extra = set(data.keys()) - set(schema.get("properties", {}).keys())
            if extra:
                errors.append(f"Unexpected fields: {extra}")

        # Validate each property
        for key, value in data.items():
            prop_schema = schema.get("properties", {}).get(key)
            if not prop_schema:
                continue
            # Type check
            expected_type = prop_schema.get("type")
            type_map = {"string": str, "number": (int, float), "boolean": bool, "array": list}
            if expected_type and not isinstance(value, type_map.get(expected_type, object)):
                errors.append(f"Field '{key}': expected {expected_type}, got {type(value).__name__}")
            # Enum check
            if "enum" in prop_schema and value not in prop_schema["enum"]:
                errors.append(f"Field '{key}': '{value}' not in enum {prop_schema['enum']}")
            # Range check
            if isinstance(value, (int, float)):
                if "minimum" in prop_schema and value < prop_schema["minimum"]:
                    errors.append(f"Field '{key}': {value} < minimum {prop_schema['minimum']}")
                if "maximum" in prop_schema and value > prop_schema["maximum"]:
                    errors.append(f"Field '{key}': {value} > maximum {prop_schema['maximum']}")

    return errors

# Define a schema for candidate evaluation
CANDIDATE_SCHEMA = {
    "type": "object",
    "properties": {
        "name":      {"type": "string"},
        "score":     {"type": "number", "minimum": 0, "maximum": 100},
        "decision":  {"type": "string", "enum": ["accept", "reject", "maybe"]},
        "strengths": {"type": "array", "items": {"type": "string"}},
    },
    "required": ["name", "score", "decision"],
    "additionalProperties": False,
}

# Test cases
test_responses = [
    {"name": "Alice", "score": 87, "decision": "accept", "strengths": ["Python", "ML"]},  # valid
    {"name": "Bob", "score": 150, "decision": "accept"},    # score too high
    {"name": "Carol", "decision": "yes"},                   # wrong enum, missing score
    {"name": "Dave", "score": 72, "decision": "maybe", "extra_field": True},  # extra field
]

for data in test_responses:
    errors = validate_against_schema(data, CANDIDATE_SCHEMA)
    status = "✓ valid" if not errors else f"✗ {errors}"
    print(f"{data.get('name', '?')}: {status}")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 3,
              cellTitle: 'Pydantic: typed Python objects from LLM output',
              prose: [
                '## Why Pydantic',
                'Pydantic converts raw JSON dicts into typed Python objects with validation. If the LLM returns the wrong type, you get a `ValidationError` with a clear message instead of a silent bug 100 lines later.',
                '## The pattern',
                '```python\nfrom pydantic import BaseModel, Field\nfrom typing import List, Optional\n\nclass CandidateEval(BaseModel):\n    name: str\n    score: int = Field(ge=0, le=100)\n    decision: Literal["accept", "reject", "maybe"]\n    strengths: List[str] = []\n    notes: Optional[str] = None\n\n# Parse LLM output\ndata = json.loads(llm_response)\ncandidate = CandidateEval.model_validate(data)  # raises ValidationError if invalid\nprint(candidate.score)  # type-checked int\n```',
              ],
              code: `# Pure-Python Pydantic-style validation (without requiring the pydantic package)
from typing import get_type_hints, get_origin, get_args, Union, List, Optional, Literal
from dataclasses import dataclass, field

class ValidationError(Exception):
    pass

def coerce_and_validate(data: dict, field_specs: dict) -> dict:
    """Validate and coerce a dict against field specifications."""
    result = {}
    errors = []

    for fname, spec in field_specs.items():
        expected_type = spec.get("type")
        required = spec.get("required", True)
        default = spec.get("default")
        min_val = spec.get("min")
        max_val = spec.get("max")
        choices = spec.get("choices")

        value = data.get(fname, default)

        if value is None and required:
            errors.append(f"Required field '{fname}' is missing")
            continue

        if value is not None and expected_type:
            if not isinstance(value, expected_type):
                try:
                    value = expected_type(value)  # attempt coercion
                except (TypeError, ValueError):
                    errors.append(f"Field '{fname}': cannot coerce {type(value).__name__} to {expected_type.__name__}")
                    continue

        if choices and value not in choices:
            errors.append(f"Field '{fname}': '{value}' not in {choices}")

        if min_val is not None and isinstance(value, (int, float)) and value < min_val:
            errors.append(f"Field '{fname}': {value} < min {min_val}")

        if max_val is not None and isinstance(value, (int, float)) and value > max_val:
            errors.append(f"Field '{fname}': {value} > max {max_val}")

        result[fname] = value

    if errors:
        raise ValidationError("Validation failed:\\n" + "\\n".join(f"  - {e}" for e in errors))
    return result

# Define the schema in our format
CANDIDATE_FIELDS = {
    "name":     {"type": str, "required": True},
    "score":    {"type": int, "required": True, "min": 0, "max": 100},
    "decision": {"type": str, "required": True, "choices": ["accept", "reject", "maybe"]},
    "notes":    {"type": str, "required": False, "default": None},
}

# Test with valid and invalid data
test_cases = [
    {"name": "Alice Chen", "score": 87, "decision": "accept"},
    {"name": "Bob Kim", "score": "92", "decision": "accept"},  # score as string — coerce
    {"name": "Carol", "score": 110, "decision": "accept"},     # score out of range
    {"score": 75, "decision": "maybe"},                        # missing name
]

for raw in test_cases:
    try:
        validated = coerce_and_validate(raw, CANDIDATE_FIELDS)
        print(f"✓ {validated}")
    except ValidationError as e:
        print(f"✗ {e}")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 4,
              cellTitle: 'Retry pipeline: handling JSON failures',
              prose: 'Production-ready structured output pipeline: try direct JSON parse, on failure strip markdown and retry, on second failure send an explicit repair request to the LLM, on third failure raise with full context.',
              code: `import json
import re
import time

class StructuredOutputError(Exception):
    pass

def extract_json(text: str):
    """Try multiple strategies to extract JSON from LLM response."""
    # Strategy 1: direct parse
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    # Strategy 2: strip markdown fences
    stripped = re.sub(r'\`\`\`(?:json)?\\s*', '', text).strip('\` \\n')
    try:
        return json.loads(stripped)
    except json.JSONDecodeError:
        pass

    # Strategy 3: find JSON object in text
    match = re.search(r'\\{[\\s\\S]*?\\}(?=[^{}]*$)', text)
    if match:
        try:
            return json.loads(match.group())
        except json.JSONDecodeError:
            pass

    return None

def structured_output_pipeline(prompt, schema, simulate_llm_fn, max_retries=3):
    """
    Retry pipeline for structured LLM output.
    On failure, sends repair prompt asking model to fix its output.
    """
    last_response = None
    for attempt in range(max_retries):
        if attempt == 0:
            current_prompt = prompt
        else:
            # Repair prompt: show the invalid response, ask to fix
            current_prompt = {
                **prompt,
                "user": (
                    f"Your previous response was not valid JSON.\\n"
                    f"Invalid response: {last_response[:200]}\\n\\n"
                    f"Return ONLY a valid JSON object matching this schema: {json.dumps(schema)}\\n"
                    f"No markdown, no explanation, just the JSON object."
                )
            }

        response_text = simulate_llm_fn(current_prompt, attempt)
        last_response = response_text

        data = extract_json(response_text)
        if data is not None:
            return data, attempt + 1  # success, number of attempts

        time.sleep(0.1 * attempt)  # brief backoff

    raise StructuredOutputError(
        f"Failed to get valid JSON after {max_retries} attempts.\\n"
        f"Last response: {last_response[:200]}"
    )

# Simulate LLM with improving compliance across attempts
def flaky_llm(prompt, attempt):
    responses = [
        "Here's the information you requested:\\n\`\`\`json\\n{\"name\": \"Alice\", \"score\": 87}\\n\`\`\`",  # markdown-wrapped
        "The candidate data: {\"name\": \"Alice\", \"score\": 87}",  # text prefix
        '{"name": "Alice", "score": 87}',  # clean JSON (attempt 2)
    ]
    return responses[min(attempt, len(responses)-1)]

prompt = {"system": "Extract candidate info", "user": "Evaluate: Alice Chen, 87/100"}
schema = {"type": "object", "properties": {"name": {"type": "string"}, "score": {"type": "number"}}}

data, attempts = structured_output_pipeline(prompt, schema, flaky_llm)
print(f"✓ Got valid JSON after {attempts} attempt(s): {data}")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 'c1',
              challengeType: 'write',
              challengeNumber: 1,
              challengeTitle: 'JSON Schema generator from a Python dict',
              difficulty: 'medium',
              prompt: 'Write `infer_schema(example)` that takes an example dict and returns a JSON Schema dict. It should detect string, number (int/float), boolean, and list types for each field, and mark all fields as required.',
              code: `def infer_schema(example: dict) -> dict:
    """Generate a JSON Schema from an example dict."""
    pass

# Tests
example = {
    "name": "Alice",
    "score": 87,
    "active": True,
    "tags": ["python", "ml"],
}

schema = infer_schema(example)
print(import_json := __import__('json'))
print(__import__('json').dumps(schema, indent=2))
# Expected: type=object, all fields required, correct types
`,
              output: '', status: 'idle', figureJson: null,
              testCode: `
if 'infer_schema' not in dir():
    res = "ERROR: infer_schema not defined."
else:
    example = {"name": "Alice", "score": 87, "active": True, "tags": ["a"]}
    schema = infer_schema(example)
    props = schema.get("properties", {})
    req = schema.get("required", [])
    if schema.get("type") != "object":
        res = f"ERROR: top-level type should be 'object', got {schema.get('type')}"
    elif props.get("name", {}).get("type") != "string":
        res = "ERROR: 'name' should have type 'string'"
    elif props.get("score", {}).get("type") != "number":
        res = "ERROR: 'score' should have type 'number'"
    elif props.get("active", {}).get("type") != "boolean":
        res = "ERROR: 'active' should have type 'boolean'"
    elif sorted(req) != sorted(list(example.keys())):
        res = f"ERROR: all fields should be required, got {req}"
    else:
        res = "SUCCESS: Schema correctly inferred from example dict."
res
`,
              hint: 'Map Python types: str → "string", int/float → "number", bool → "boolean", list → "array". Build properties dict, set required = list of all keys, type = "object".',
            },
          ],
        },
      },
    ],
  },

  quiz: [
    {
      id: 'q1',
      question: 'What is the most reliable way to get structured JSON from an LLM?',
      options: [
        'Ask nicely with "please return JSON"',
        'Use JSON mode (response_format: json_object)',
        'Use native schema mode (OpenAI response_format: json_schema, or Anthropic tool use with input_schema)',
        'Use a regex to extract JSON from the response',
      ],
      correct: 2,
      explanation: 'Native schema mode (Level 3) constrains token generation to match the specified JSON Schema. This is fundamentally more reliable than prompt instructions or JSON mode because it operates at the token probability level, not the text level.',
    },
    {
      id: 'q2',
      question: 'Why should you use `"additionalProperties": false` in your JSON Schema?',
      options: [
        'It speeds up LLM generation',
        'It prevents the model from hallucinating extra fields not in your schema',
        'It is required for valid JSON Schema',
        'It reduces token usage',
      ],
      correct: 1,
      explanation: 'Without `additionalProperties: false`, LLMs frequently add extra fields ("confidence", "explanation", "notes") that are not in your schema. These cause downstream parsing failures if your code expects an exact structure. Setting it to false forbids any field not explicitly defined.',
    },
    {
      id: 'q3',
      question: 'What is the advantage of using Pydantic to parse LLM JSON output?',
      options: [
        'Pydantic automatically calls the LLM API',
        'Pydantic is faster than json.loads()',
        'Pydantic validates types and raises clear ValidationError on failure, preventing silent type bugs',
        'Pydantic compresses the JSON for lower token count',
      ],
      correct: 2,
      explanation: 'json.loads() turns JSON into Python dicts — no type checking. Pydantic\'s model_validate() enforces your type annotations: if score should be int but the LLM returned "87" (string), Pydantic either coerces it or raises a clear ValidationError. This prevents silent type bugs that surface much later.',
    },
  ],
}
