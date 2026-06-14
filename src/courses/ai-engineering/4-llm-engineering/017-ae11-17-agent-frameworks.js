export default {
  id: 'ae11-17',
  slug: 'agent-framework-tradeoffs',
  chapter: 'ae-p11',
  order: 16,
  title: 'Agent Framework Tradeoffs',
  subtitle: 'LangChain vs LangGraph vs AutoGen vs Claude SDK vs writing your own — when to use each.',
  tags: ['frameworks', 'langchain', 'langgraph', 'autogen', 'crewai', 'agent-sdk', 'make-or-buy'],
  hook: {
    question: 'There are 6+ popular agent frameworks. Using the wrong one means rewriting your app in 3 months. How do you choose?',
    realWorldContext: 'Every week a new framework claims to make agents easy. The dirty secret: most production AI engineering teams eventually simplify back to minimal abstractions or write their own thin wrapper. Knowing why helps you start in the right place.',
    previewVisualizationId: 'PythonNotebook',
  },
  intuition: {
    prose: [
      'LangChain is the most widely used framework — extensive integrations, large community, LCEL chain composition. Its weakness: heavy abstraction makes debugging hard; small changes in framework internals break your code.',
      'LangGraph extends LangChain with stateful graph execution. Best choice when you need inspectable multi-step agents, human-in-the-loop, or complex branching. The graph model makes control flow explicit.',
      'AutoGen and CrewAI focus on multi-agent coordination — multiple LLMs playing different roles, passing messages between them. Good for simulations and research; production reliability is still maturing.',
      'The Claude Agent SDK (Anthropic) and OpenAI Agents SDK are provider-specific but thin — close to the raw API with just enough scaffolding for tool loops and handoffs. Easy to debug, easy to reason about.',
      'Writing your own means a tool registry, a message loop, and a retry handler — about 100 lines of Python. Wins on debuggability and no dependency drift. Loses on integrations and community.',
    ],
    callouts: [
      { type: 'key-insight', text: 'Abstraction cost is real. Every layer of framework code is code you cannot step through when production breaks at 2 AM.' },
      { type: 'tip', text: 'Start with the provider SDK or your own loop. Reach for a framework only when you hit a concrete problem it solves (e.g., "I need persistent checkpoints" → LangGraph).' },
      { type: 'warning', text: 'Framework lock-in is subtle. LangChain\'s LCEL chains are not portable to non-LangChain code. Evaluate portability before committing to any framework for a long-lived project.' },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        initialCells: [
          {
            id: 1,
            cellTitle: 'Framework Comparison Table',
            prose: 'A structured comparison of the major agent frameworks across the dimensions that matter most for production decisions.',
            code: `import json

frameworks = [
    {
        "name": "LangChain",
        "abstraction": "High",
        "debuggability": "Low",
        "integrations": "Excellent (800+)",
        "multi_agent": "Limited",
        "best_for": "Rapid prototyping, rich integration needs",
        "avoid_when": "Debugging is critical, framework version churn is a problem",
    },
    {
        "name": "LangGraph",
        "abstraction": "Medium",
        "debuggability": "High (visual graph)",
        "integrations": "Via LangChain",
        "multi_agent": "Good",
        "best_for": "Stateful agents, human-in-loop, complex branching",
        "avoid_when": "Simple single-step tasks that don't need a graph",
    },
    {
        "name": "AutoGen / CrewAI",
        "abstraction": "High",
        "debuggability": "Low-Medium",
        "integrations": "Moderate",
        "multi_agent": "Excellent",
        "best_for": "Multi-agent coordination, research, simulations",
        "avoid_when": "Production reliability is the primary concern",
    },
    {
        "name": "Claude / OpenAI Agent SDK",
        "abstraction": "Low",
        "debuggability": "Excellent",
        "integrations": "Provider-specific",
        "multi_agent": "Via handoffs",
        "best_for": "Production apps, when you want control",
        "avoid_when": "You need 3rd-party integrations out of the box",
    },
    {
        "name": "Roll Your Own",
        "abstraction": "None",
        "debuggability": "Excellent",
        "integrations": "Whatever you build",
        "multi_agent": "Whatever you build",
        "best_for": "Simple agents, maximum control, no dependency risk",
        "avoid_when": "You need integrations fast, small team",
    },
]

for fw in frameworks:
    print(f"{'='*55}")
    print(f"  {fw['name']}")
    print(f"  Abstraction: {fw['abstraction']}  |  Debug: {fw['debuggability']}")
    print(f"  Best for: {fw['best_for']}")
    print(f"  Avoid when: {fw['avoid_when']}")`,
            output: '',
            status: 'idle',
            figureJson: null,
          },
          {
            id: 2,
            cellTitle: 'Make-or-Buy Decision Framework',
            prose: 'A scoring model to guide the build-vs-framework decision based on your project\'s specific requirements.',
            code: `def framework_score(requirements: dict) -> dict:
    """
    Score each framework option based on weighted requirements.
    requirements keys: needs_integrations, needs_multi_agent,
                       needs_debuggability, needs_speed_to_prototype,
                       production_reliability_critical
    All values 0.0-1.0 (importance weight).
    """
    scores = {
        "LangChain":       {"integrations": 1.0, "multi_agent": 0.3, "debug": 0.2, "speed": 0.9, "reliability": 0.5},
        "LangGraph":       {"integrations": 0.7, "multi_agent": 0.7, "debug": 0.8, "speed": 0.6, "reliability": 0.8},
        "AutoGen/CrewAI":  {"integrations": 0.5, "multi_agent": 1.0, "debug": 0.4, "speed": 0.7, "reliability": 0.5},
        "Provider SDK":    {"integrations": 0.4, "multi_agent": 0.5, "debug": 1.0, "speed": 0.7, "reliability": 0.9},
        "Roll Your Own":   {"integrations": 0.2, "multi_agent": 0.3, "debug": 1.0, "speed": 0.3, "reliability": 1.0},
    }
    weights = [
        (requirements.get("needs_integrations", 0),              "integrations"),
        (requirements.get("needs_multi_agent", 0),               "multi_agent"),
        (requirements.get("needs_debuggability", 0),             "debug"),
        (requirements.get("needs_speed_to_prototype", 0),        "speed"),
        (requirements.get("production_reliability_critical", 0), "reliability"),
    ]
    total_weight = sum(w for w, _ in weights) or 1
    results = {}
    for fw, fw_scores in scores.items():
        results[fw] = round(sum(w * fw_scores[dim] for w, dim in weights) / total_weight, 2)
    return dict(sorted(results.items(), key=lambda x: -x[1]))

reqs = {"needs_debuggability": 0.9, "production_reliability_critical": 0.9, "needs_integrations": 0.3}
ranking = framework_score(reqs)
print("Framework ranking for production-critical, debuggable app:")
for fw, score in ranking.items():
    bar = "█" * int(score * 20)
    print(f"  {fw:20} {score:.2f}  {bar}")`,
            output: '',
            status: 'idle',
            figureJson: null,
          },
          {
            id: 3,
            cellTitle: 'Minimal Agent Loop (No Framework)',
            prose: 'A complete, working agent loop in under 40 lines. This is what every framework wraps — knowing it makes you a better framework user.',
            code: `import json

TOOLS = {
    "calculator": lambda expr: str(eval(expr, {"__builtins__": {}}, {"__builtins__": {}})),
    "upper":      lambda text: text.upper(),
}

def mock_llm_with_tools(messages, tools):
    """Simulate: on first call use a tool; on second return final answer."""
    if len(messages) == 1:
        return {"type": "tool_call", "name": "upper", "input": {"text": "hello world"}}
    last_result = [m for m in messages if m.get("role") == "tool"][-1]["content"]
    return {"type": "text", "content": f"The result is: {last_result}"}

def run_agent(user_message: str, max_steps: int = 10) -> str:
    messages = [{"role": "user", "content": user_message}]
    for step in range(max_steps):
        response = mock_llm_with_tools(messages, list(TOOLS.keys()))
        if response["type"] == "text":
            return response["content"]
        # Execute the tool
        tool_name = response["name"]
        tool_result = TOOLS[tool_name](**response["input"])
        messages.append({"role": "assistant", "content": json.dumps(response)})
        messages.append({"role": "tool", "content": tool_result})
        print(f"  Step {step + 1}: called {tool_name} → {tool_result}")
    return "Max steps reached."

answer = run_agent("Transform the greeting for me.")
print(f"Final: {answer}")`,
            output: '',
            status: 'idle',
            figureJson: null,
          },
          {
            id: 'c1',
            challengeType: 'write',
            challengeNumber: 1,
            challengeTitle: 'Framework Selection Function',
            difficulty: 'beginner',
            prompt: `Implement \`select_framework(needs_integrations, multi_agent, needs_debug)\` where each argument is a boolean.
Return the recommended framework name as a string using this decision tree:
- If \`multi_agent\` is True → return \`"AutoGen"\`
- Else if \`needs_integrations\` is True and not \`needs_debug\` → return \`"LangChain"\`
- Else if \`needs_debug\` is True → return \`"Provider SDK"\`
- Otherwise → return \`"Roll Your Own"\`

Store the result of \`select_framework(needs_integrations=False, multi_agent=False, needs_debug=True)\` in \`res\`.`,
            code: `def select_framework(needs_integrations, multi_agent, needs_debug):
    # YOUR CODE HERE
    pass

res = select_framework(needs_integrations=False, multi_agent=False, needs_debug=True)
print(res)`,
            output: '',
            status: 'idle',
            figureJson: null,
            testCode: `res = res == "Provider SDK"
res`,
            hint: 'Implement the decision tree with if/elif/else. Check multi_agent first, then needs_integrations, then needs_debug.',
          },
        ],
      },
    ],
  },
  quiz: [
    {
      id: 1,
      question: 'What is the main drawback of high-abstraction frameworks like LangChain?',
      options: [
        'They require a paid subscription to use in production',
        'They only work with OpenAI models',
        'Heavy abstraction makes debugging difficult and framework version churn breaks code',
        'They cannot handle streaming responses',
      ],
      correct: 2,
      explanation: 'When something breaks in production, you need to trace through the framework\'s internals. High abstraction makes this hard. Version upgrades in frameworks also frequently introduce breaking changes.',
    },
    {
      id: 2,
      question: 'When is LangGraph the best choice over a vanilla ReAct loop?',
      options: [
        'When you want the simplest possible agent implementation',
        'When you need stateful multi-step agents with inspectable control flow, checkpoints, or human-in-the-loop',
        'When you need to integrate with more than 5 external APIs',
        'When you are building a single-turn question-answering app',
      ],
      correct: 1,
      explanation: 'LangGraph\'s graph model shines for complex, stateful workflows where you need to replay execution, pause for human review, or handle many branching conditions explicitly.',
    },
    {
      id: 3,
      question: 'What does "abstraction cost" mean in the context of agent frameworks?',
      options: [
        'The licensing fees charged by framework vendors',
        'The additional API tokens consumed by framework overhead',
        'The debugging and reasoning difficulty introduced by framework layers you cannot easily inspect',
        'The time spent learning a new framework\'s API',
      ],
      correct: 2,
      explanation: 'Every framework layer is code that runs between your intent and the model call. When bugs occur, you must understand that code to diagnose them — and it wasn\'t written for your specific use case.',
    },
  ],
};
