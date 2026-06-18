export default {
  id: 'ae11-09',
  slug: 'function-calling',
  chapter: 'ae-p11',
  order: 8,
  title: 'Function Calling',
  subtitle: 'Give your LLM hands: define tools, let the model call them, handle results.',
  tags: ['function-calling', 'tools', 'tool-use', 'llm', 'agents'],
  hook: {
    question: 'How do you give an LLM the ability to actually *do* things — search the web, query a database, run code?',
    realWorldContext: 'Every AI assistant that books flights, reads your calendar, or fetches live prices is using function calling. The model decides *which* tool to invoke and with *what* arguments — your code executes it and feeds the result back.',
    previewVisualizationId: 'PythonNotebook',
  },
  intuition: {
    prose: [
      'Function calling (also called "tool use") is the mechanism that turns a language model from a text predictor into an agent that can interact with the real world.',
      'You register a set of tools by describing them in JSON schema. The model reads the descriptions and, when answering a user message, can choose to call one or more tools instead of — or before — producing a final reply.',
      'The loop has three steps: (1) send the user message plus tool definitions to the model, (2) the model returns a tool_call object instead of text, (3) your code runs the real function and sends the result back as a tool_result message. Repeat until the model produces a plain text reply.',
      'Parallel tool calls let the model fan out multiple calls in one response — useful when the answer requires data from several independent sources at once.',
    ],
    callouts: [
      { type: 'key-insight', text: 'The model never executes code. It only produces a JSON blob saying "call function X with args Y". Your application code does the actual execution.' },
      { type: 'warning', text: 'Always validate tool arguments before executing them. The model can hallucinate argument values — treat them like untrusted user input.' },
      { type: 'tip', text: 'Write tool descriptions like doc-strings for a human colleague. Vague descriptions lead to wrong tool selection.' },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        initialCells: [
          {
            id: 1,
            cellTitle: 'Tool Definition Schema',
            prose: 'A tool is described with a name, a plain-English description, and a JSON Schema for its parameters. This is the contract between you and the model.',
            code: `import json

calculator_tool = {
    "name": "calculator",
    "description": "Evaluate a safe arithmetic expression and return the numeric result.",
    "input_schema": {
        "type": "object",
        "properties": {
            "expression": {
                "type": "string",
                "description": "A Python-evaluable arithmetic expression, e.g. '(12 * 4) / 3'"
            }
        },
        "required": ["expression"]
    }
}

print(json.dumps(calculator_tool, indent=2))`,
            output: '',
            status: 'idle',
            figureJson: null,
          },
          {
            id: 2,
            cellTitle: 'The Request → Tool Call → Result Loop',
            prose: 'Simulate the three-step tool-use loop. In production the first two steps call the Anthropic or OpenAI API; here we mock the model response.',
            code: `import json, math

# --- Step 1: your app sends user message + tool defs to the model ---
user_message = "What is the square root of 1764 plus 42?"

# --- Step 2: model returns a tool_call (simulated here) ---
mock_tool_call = {
    "id": "call_abc123",
    "name": "calculator",
    "input": {"expression": "math.sqrt(1764) + 42"}
}
print("Model requested tool call:")
print(json.dumps(mock_tool_call, indent=2))

# --- Step 3: your code executes the function ---
def calculator(expression: str) -> float:
    allowed = {k: v for k, v in math.__dict__.items() if not k.startswith("_")}
    return eval(expression, {"__builtins__": {}}, allowed)

result = calculator(mock_tool_call["input"]["expression"])
tool_result = {"tool_use_id": mock_tool_call["id"], "content": str(result)}

print(f"\nTool result sent back: {tool_result}")
print(f"Model would now reply: 'The answer is {result}.'")`,
            output: '',
            status: 'idle',
            figureJson: null,
          },
          {
            id: 3,
            cellTitle: 'Parallel Tool Calls',
            prose: 'A model can return multiple tool calls in one response when the sub-questions are independent. Process them concurrently for best latency.',
            code: `import json, time, random

# Simulate model returning two parallel calls
parallel_calls = [
    {"id": "call_1", "name": "get_weather", "input": {"city": "Tokyo"}},
    {"id": "call_2", "name": "get_weather", "input": {"city": "London"}},
]

def get_weather(city: str) -> dict:
    # Simulate network latency
    time.sleep(random.uniform(0.05, 0.1))
    temps = {"Tokyo": 22, "London": 14, "New York": 18}
    return {"city": city, "temp_c": temps.get(city, 20), "condition": "cloudy"}

start = time.time()
results = [get_weather(c["input"]["city"]) for c in parallel_calls]
elapsed = time.time() - start

for call, res in zip(parallel_calls, results):
    print(f"{call['id']} → {res}")
print(f"\nTotal time (sequential sim): {elapsed:.2f}s")`,
            output: '',
            status: 'idle',
            figureJson: null,
          },
          {
            id: 'c1',
            challengeType: 'write',
            challengeNumber: 1,
            challengeTitle: 'Tool Registry and Dispatcher',
            difficulty: 'intermediate',
            prompt: `Build a \`ToolRegistry\` class that:
1. Accepts tool functions registered with \`register(name, fn, description)\`
2. Has a \`dispatch(tool_call)\` method that looks up the function by name, calls it with the provided \`input\` dict, and returns a \`tool_result\` dict \`{"tool_use_id": ..., "content": ...}\`
3. Has a \`schemas()\` method that returns a list of tool definition dicts

Register a \`multiply\` tool that multiplies two numbers \`a\` and \`b\`.
Call \`dispatch({"id": "t1", "name": "multiply", "input": {"a": 6, "b": 7}})\` and store the result in \`res\`.`,
            code: `class ToolRegistry:
    def __init__(self):
        self._tools = {}
        self._descriptions = {}

    def register(self, name, fn, description):
        # YOUR CODE HERE
        pass

    def dispatch(self, tool_call):
        # YOUR CODE HERE
        pass

    def schemas(self):
        # YOUR CODE HERE
        pass

registry = ToolRegistry()
registry.register("multiply", lambda a, b: a * b, "Multiply two numbers a and b.")

res = registry.dispatch({"id": "t1", "name": "multiply", "input": {"a": 6, "b": 7}})
print(res)`,
            output: '',
            status: 'idle',
            figureJson: null,
            testCode: `expected = {"tool_use_id": "t1", "content": "42"}
res = res == expected or (isinstance(res, dict) and res.get("tool_use_id") == "t1" and str(res.get("content")) == "42")
res`,
            hint: 'Store registered functions in a dict keyed by name. In dispatch, call self._tools[tool_call["name"]](**tool_call["input"]) and wrap the result as a string in the content field.',
          },
        ],
      },
    ],
  },
  quiz: [
    {
      id: 1,
      question: 'When a model returns a tool_call, what should your application do next?',
      options: [
        'Display the tool_call JSON to the user and wait for approval',
        'Execute the named function with the provided arguments and send the result back as a tool_result message',
        'Retry the same request without the tool definitions',
        'Parse the tool_call as the final answer',
      ],
      correct: 1,
      explanation: 'The application executes the real function and appends a tool_result message to the conversation, then re-sends to the model for a final reply.',
    },
    {
      id: 2,
      question: 'Why should tool argument values be treated like untrusted user input?',
      options: [
        'Because the model always sends malicious arguments',
        'Because JSON Schema validation is too slow for production',
        'Because the model can hallucinate argument values that were never mentioned by the user',
        'Because tool arguments are sent over an unencrypted channel',
      ],
      correct: 2,
      explanation: 'Models can confidently generate plausible-but-wrong argument values. Always validate before executing, especially for destructive operations.',
    },
    {
      id: 3,
      question: 'What is the main advantage of parallel tool calls?',
      options: [
        'They allow the model to skip writing a final reply',
        'They reduce latency by letting independent lookups run concurrently',
        'They bypass the token limit for tool definitions',
        'They allow one tool to call another tool directly',
      ],
      correct: 1,
      explanation: 'When sub-questions are independent (e.g., weather in two cities), the model can request both in one response and your code can run them concurrently, cutting latency.',
    },
  ],
};
