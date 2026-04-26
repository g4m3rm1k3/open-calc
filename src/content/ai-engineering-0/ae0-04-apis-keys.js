export default {
  id: 'ae-p0-04-apis-keys',
  slug: 'apis-and-keys',
  chapter: 'ae-p0',
  order: 3,
  title: 'APIs & Keys',
  subtitle: 'Authenticate securely with LLM providers — the right way, not the dangerous way.',
  tags: ['api keys', 'environment variables', '.env', 'anthropic', 'openai', 'authentication', 'security'],

  hook: {
    question: 'What happens to your billing account when you commit an API key to a public GitHub repo?',
    realWorldContext:
      'In 2023, researchers scanned public GitHub repositories and found over 4,500 valid API keys committed in code — including keys that had already generated thousands of dollars in unauthorized charges. API key exposure is the most common and most expensive beginner mistake in AI engineering. This lesson teaches the correct patterns: environment variables, .env files, and the python-dotenv library. After this lesson, you will never hardcode a key again.',
    previewVisualizationId: 'PythonNotebook',
  },

  intuition: {
    prose: [
      'An API key is a secret password. Treat it exactly like a password: never write it in code, never commit it to git, never paste it in a chat message.',
      'The correct pattern: store keys in environment variables. Read them with `os.environ.get("KEY_NAME")`. For local development, use a `.env` file loaded by `python-dotenv`. In production, use your platform\'s secrets manager.',
    ],
    callouts: [
      {
        type: 'warning',
        title: 'Never hardcode API keys',
        body: '`anthropic.Anthropic(api_key="sk-ant-...")` in your source code is a critical security vulnerability. If this code reaches GitHub (even briefly), bots scrape it within seconds. Add `.env` to `.gitignore` before creating the file.',
      },
      {
        type: 'insight',
        title: 'Keys rotate, code does not',
        body: 'Environment variables decouple secrets from code. When you rotate an API key (which you should do regularly), you update one environment variable — not every file where you hardcoded the key.',
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'APIs & Keys',
        mathBridge: 'Security through separation: API keys live in the environment layer (OS), not the application layer (code). The application reads from the environment at runtime.',
        caption: 'Learn the secure API key management pattern used in production AI systems.',
        props: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'The wrong way and the right way',
              prose: [
                '## WRONG: hardcoded key',
                '```python\n# This goes into git and gets scraped within seconds\nclient = anthropic.Anthropic(api_key="sk-ant-api03-ACTUAL_KEY_HERE")\n```',
                '## RIGHT: environment variable',
                '```python\nimport os\nimport anthropic\n\nclient = anthropic.Anthropic()  # reads ANTHROPIC_API_KEY from environment automatically\n# or explicitly:\nclient = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])\n```',
                '## The Anthropic and OpenAI SDKs auto-read env vars',
                '- `anthropic.Anthropic()` reads `ANTHROPIC_API_KEY` automatically\n- `openai.OpenAI()` reads `OPENAI_API_KEY` automatically\n- Set the env var before running your code and the SDK finds it',
              ],
              code: `import os

# Simulate checking for API keys
REQUIRED_KEYS = {
    "ANTHROPIC_API_KEY": "claude-3.5-sonnet calls",
    "OPENAI_API_KEY": "gpt-4o calls",
}

print("API Key Status Check")
print("=" * 40)
for key_name, purpose in REQUIRED_KEYS.items():
    value = os.environ.get(key_name)
    if value:
        # Show only first/last 4 chars for security
        masked = value[:8] + "..." + value[-4:] if len(value) > 12 else "***"
        print(f"✓ {key_name}: {masked} (used for: {purpose})")
    else:
        print(f"✗ {key_name}: NOT SET")
        print(f"  Set with: export {key_name}=your-key-here")

print("\\nNote: Running these API calls without keys set will fail with AuthenticationError")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 2,
              cellTitle: 'The .env file pattern with python-dotenv',
              prose: [
                '## Setup for local development',
                '**Step 1:** Add `.env` to `.gitignore` FIRST',
                '```bash\necho ".env" >> .gitignore\ngit add .gitignore && git commit -m "chore: ignore .env files"\n```',
                '**Step 2:** Create `.env` file',
                '```bash\n# .env file — NEVER commit this\nANTHROPIC_API_KEY=sk-ant-api03-your-key-here\nOPENAI_API_KEY=sk-proj-your-key-here\nCOHERE_API_KEY=your-key-here\n```',
                '**Step 3:** Load in Python',
                '```python\nfrom dotenv import load_dotenv\nload_dotenv()  # reads .env file and sets environment variables\n```',
                '**Step 4:** Access keys',
                '```python\nimport os\nkey = os.environ.get("ANTHROPIC_API_KEY")  # None if not set\nkey = os.environ["ANTHROPIC_API_KEY"]       # KeyError if not set\n```',
              ],
              code: `# Simulate dotenv loading behavior
import os

def simulate_dotenv_load(env_content: str) -> dict:
    """Parse .env file content and return key-value pairs."""
    env_vars = {}
    for line in env_content.strip().split('\\n'):
        line = line.strip()
        if not line or line.startswith('#'):
            continue  # skip comments and blank lines
        if '=' in line:
            key, _, value = line.partition('=')
            # Strip quotes if present
            value = value.strip().strip('"').strip("'")
            env_vars[key.strip()] = value
    return env_vars

sample_env = """
# LLM API Keys
ANTHROPIC_API_KEY=sk-ant-api03-abc123
OPENAI_API_KEY=sk-proj-xyz789

# Vector DB
PINECONE_API_KEY=pcsk-def456
PINECONE_ENV=us-east-1-aws

# Model settings
DEFAULT_MODEL=claude-sonnet-4-6
MAX_TOKENS=4096
"""

parsed = simulate_dotenv_load(sample_env)
print(f"Loaded {len(parsed)} environment variables:")
for key, value in parsed.items():
    masked = value[:4] + "..." if len(value) > 4 else value
    print(f"  {key} = {masked}")

# Demonstrate os.environ.get with fallback
print(f"\\nSafe access with default: {os.environ.get('MISSING_KEY', 'default-value')}")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 3,
              cellTitle: 'First API call: Anthropic hello world',
              prose: [
                '## Making your first Anthropic API call',
                '```python\nimport anthropic\n\nclient = anthropic.Anthropic()  # reads ANTHROPIC_API_KEY from env\n\nmessage = client.messages.create(\n    model="claude-sonnet-4-6",\n    max_tokens=1024,\n    messages=[\n        {"role": "user", "content": "Say hello in exactly 3 words."}\n    ]\n)\n\nprint(message.content[0].text)\nprint(f"Tokens used: {message.usage.input_tokens} in, {message.usage.output_tokens} out")\n```',
                '## Making your first OpenAI API call',
                '```python\nimport openai\n\nclient = openai.OpenAI()  # reads OPENAI_API_KEY from env\n\nresponse = client.chat.completions.create(\n    model="gpt-4o-mini",\n    messages=[{"role": "user", "content": "Say hello in exactly 3 words."}]\n)\n\nprint(response.choices[0].message.content)\nprint(f"Tokens used: {response.usage.total_tokens}")\n```',
                '## The cells below simulate these calls — swap in real calls once your keys are set.',
              ],
              code: `# Simulated API response (replace with real client.messages.create when keys are ready)
import time

def simulate_anthropic_call(model, messages, max_tokens=1024):
    """Simulate an Anthropic API response."""
    user_message = messages[-1]["content"] if messages else ""
    time.sleep(0.05)  # simulate network latency
    return {
        "id": "msg_sim_001",
        "type": "message",
        "role": "assistant",
        "model": model,
        "content": [{"type": "text", "text": "Hello, world! ✓"}],
        "stop_reason": "end_turn",
        "usage": {
            "input_tokens": len(user_message.split()) * 2,
            "output_tokens": 5,
        }
    }

# Simulate a call
response = simulate_anthropic_call(
    model="claude-sonnet-4-6",
    messages=[{"role": "user", "content": "Say hello in exactly 3 words."}],
)

print(f"Model: {response['model']}")
print(f"Response: {response['content'][0]['text']}")
print(f"Tokens: {response['usage']['input_tokens']} in, {response['usage']['output_tokens']} out")
print()
print("When your ANTHROPIC_API_KEY is set, replace simulate_anthropic_call with:")
print("  import anthropic")
print("  client = anthropic.Anthropic()")
print("  response = client.messages.create(model='claude-sonnet-4-6', messages=[...])")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 'c1',
              challengeType: 'write',
              challengeNumber: 1,
              challengeTitle: 'Secure config loader',
              difficulty: 'easy',
              prompt: 'Write `load_api_config()` that reads API keys from environment variables and returns a dict. For each key in `REQUIRED_KEYS`, include its value or `None` if missing. Also include a `"all_present"` field that is `True` only if all required keys are set.',
              code: `import os

REQUIRED_KEYS = ["ANTHROPIC_API_KEY", "OPENAI_API_KEY"]

def load_api_config():
    """Load API keys from environment, return config dict."""
    pass

config = load_api_config()
print(f"Config keys: {list(config.keys())}")
print(f"all_present: {config['all_present']}")
print(f"ANTHROPIC_API_KEY present: {config.get('ANTHROPIC_API_KEY') is not None}")
`,
              output: '', status: 'idle', figureJson: null,
              testCode: `
import os
if 'load_api_config' not in dir():
    res = "ERROR: load_api_config not defined."
else:
    config = load_api_config()
    if 'all_present' not in config:
        res = "ERROR: config must contain 'all_present' key"
    elif not all(k in config for k in REQUIRED_KEYS):
        res = f"ERROR: config must contain all REQUIRED_KEYS: {REQUIRED_KEYS}"
    elif not isinstance(config['all_present'], bool):
        res = "ERROR: 'all_present' must be a bool"
    else:
        # Verify all_present logic
        expected = all(os.environ.get(k) for k in REQUIRED_KEYS)
        if config['all_present'] != expected:
            res = f"ERROR: all_present should be {expected} given current env"
        else:
            res = "SUCCESS: load_api_config correctly reads env vars and computes all_present."
res
`,
              hint: 'result = {key: os.environ.get(key) for key in REQUIRED_KEYS}. Then add result["all_present"] = all(v is not None for v in result.values()). Return result.',
            },
          ],
        },
      },
    ],
  },

  quiz: [
    {
      id: 'q1',
      question: 'What is the correct way to use an Anthropic API key in Python code?',
      options: [
        'Hardcode it as a string: `api_key="sk-ant-..."`',
        'Store it in a variable at the top of the file',
        'Store it in an environment variable and use `anthropic.Anthropic()` (SDK reads it automatically)',
        'Store it in a config.json file in the project root',
      ],
      correct: 2,
      explanation: 'The Anthropic SDK automatically reads `ANTHROPIC_API_KEY` from environment variables. Store the key in your environment (via .env file + python-dotenv, or shell export), never in source code. config.json is still a file that could be committed to git.',
    },
  ],
}
