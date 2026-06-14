export default {
  id: 'ae11-16',
  slug: 'langgraph-state-machines',
  chapter: 'ae-p11',
  order: 15,
  title: 'LangGraph & State Machines',
  subtitle: 'Build reliable, inspectable agents as stateful graphs — not spaghetti code.',
  tags: ['langgraph', 'state-machine', 'agents', 'graph', 'conditional-routing', 'human-in-loop'],
  hook: {
    question: 'Your ReAct agent works great for 3-step tasks but goes off the rails on 10-step ones. What if the agent\'s control flow was a first-class, inspectable data structure?',
    realWorldContext: 'LangGraph powers the agents at many companies running multi-step workflows in production. When something goes wrong, you can replay the exact graph execution, inspect every node\'s state, and resume from any checkpoint.',
    previewVisualizationId: 'PythonNotebook',
  },
  intuition: {
    prose: [
      'LangGraph models an agent as a directed graph of nodes and edges. Each node is a Python function that takes state and returns updated state. Edges control flow — either unconditional (always go to node B after node A) or conditional (go to B or C depending on the state).',
      'State is a typed dictionary (TypedDict in Python) shared across all nodes. Every node reads from and writes to this shared state. The graph engine merges the updates automatically.',
      'The agent loop becomes explicit: a node calls the LLM, a conditional edge checks whether the model requested a tool call, a "tools" node executes the tool and writes the result back to state, then the edge loops back to the LLM node.',
      'Human-in-the-loop checkpoints let you pause the graph at any edge and wait for a human to approve before continuing. This is invaluable for high-stakes tool calls like "delete all records".',
      'LangGraph\'s streaming lets you observe each node\'s output as the graph runs — you see intermediate reasoning steps, not just the final answer.',
    ],
    callouts: [
      { type: 'key-insight', text: 'The graph IS the architecture diagram. When you open the LangGraph Studio visualization, you see exactly what your code does — no mental translation needed.' },
      { type: 'tip', text: 'Name your nodes after their role: "call_llm", "execute_tools", "check_quality", "format_output". The graph becomes self-documenting.' },
      { type: 'warning', text: 'Cycles in a graph can loop forever. Always include a "max_steps" field in state and a conditional edge that routes to END when max_steps is exceeded.' },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        initialCells: [
          {
            id: 1,
            cellTitle: 'State Schema and Node Definition',
            prose: 'Define the graph state and implement a node. A node is just a function: state in, updated state out.',
            code: `from typing import TypedDict, List, Optional

class AgentState(TypedDict):
    messages: List[dict]
    tool_calls: Optional[List[dict]]
    tool_results: Optional[List[dict]]
    final_answer: Optional[str]
    steps: int

def call_llm_node(state: AgentState) -> AgentState:
    """Simulate the LLM node — in production this calls the API."""
    last_user_msg = state["messages"][-1]["content"]
    # Simulate: model decides to call a tool on the first step
    if state["steps"] == 0:
        return {
            **state,
            "tool_calls": [{"name": "search", "input": {"query": last_user_msg}}],
            "steps": state["steps"] + 1,
        }
    # Simulate: model produces final answer on subsequent steps
    return {
        **state,
        "tool_calls": None,
        "final_answer": f"Based on the search results, here is the answer to: {last_user_msg}",
        "steps": state["steps"] + 1,
    }

initial_state: AgentState = {
    "messages": [{"role": "user", "content": "What is the population of Tokyo?"}],
    "tool_calls": None, "tool_results": None, "final_answer": None, "steps": 0
}
state_after_llm = call_llm_node(initial_state)
print(f"Tool calls requested: {state_after_llm['tool_calls']}")
print(f"Steps so far:         {state_after_llm['steps']}")`,
            output: '',
            status: 'idle',
            figureJson: null,
          },
          {
            id: 2,
            cellTitle: 'Conditional Routing Edge',
            prose: 'A router function inspects state and returns the name of the next node. This is how "if tool_calls → execute tools, else → end" works.',
            code: `def router(state: AgentState) -> str:
    """Route: if tool calls pending → tools node; if answer ready → end."""
    if state.get("final_answer"):
        return "END"
    if state.get("tool_calls"):
        return "execute_tools"
    return "call_llm"

def execute_tools_node(state: AgentState) -> AgentState:
    """Execute each pending tool call and append results."""
    results = []
    for call in (state["tool_calls"] or []):
        # Simulate tool execution
        results.append({"name": call["name"], "result": f"Mock result for query: {call['input']}"})
    return {**state, "tool_calls": None, "tool_results": results}

# Run the graph manually (in LangGraph this is graph.invoke(state))
state = initial_state.copy()
MAX_STEPS = 10

while state["steps"] < MAX_STEPS:
    next_node = router(state)
    print(f"Step {state['steps']}: routing to '{next_node}'")
    if next_node == "END":
        break
    elif next_node == "execute_tools":
        state = execute_tools_node(state)
    else:
        state = call_llm_node(state)

print(f"\nFinal answer: {state['final_answer']}")`,
            output: '',
            status: 'idle',
            figureJson: null,
          },
          {
            id: 3,
            cellTitle: 'Graph Topology as Data',
            prose: 'Represent the graph structure as a plain dict — edges, conditional routes, and the entry point. This mirrors how LangGraph stores graphs internally.',
            code: `import json

graph_definition = {
    "entry_point": "call_llm",
    "nodes": ["call_llm", "execute_tools"],
    "edges": [
        {"from": "execute_tools", "to": "call_llm"}  # unconditional: after tools → back to LLM
    ],
    "conditional_edges": [
        {
            "from": "call_llm",
            "router": "router_fn",
            "routes": {
                "execute_tools": "execute_tools node",
                "END": "terminal — graph stops"
            }
        }
    ]
}

print(json.dumps(graph_definition, indent=2))
print("\nThis graph implements the classic ReAct agent loop.")
print("The router decides whether to loop or terminate on each LLM call.")`,
            output: '',
            status: 'idle',
            figureJson: null,
          },
          {
            id: 'c1',
            challengeType: 'write',
            challengeNumber: 1,
            challengeTitle: 'State Machine with Conditional Routing',
            difficulty: 'intermediate',
            prompt: `Implement a minimal state machine runner:
- \`run_graph(initial_state, nodes, router, max_steps=10)\`
  - \`nodes\` is a dict mapping node name → function
  - \`router\` is a function that takes state and returns the next node name or \`"END"\`
  - Run until router returns \`"END"\` or max_steps is hit
  - Return the final state

Create a state \`{"value": 0, "steps": 0}\` with one node \`"increment"\` that adds 1 to \`value\` and \`steps\`.
Use a router that returns \`"END"\` when \`value >= 3\`, else \`"increment"\`.
Store the final state in \`res\`.`,
            code: `def run_graph(initial_state, nodes, router, max_steps=10):
    # YOUR CODE HERE
    pass

def increment_node(state):
    return {**state, "value": state["value"] + 1, "steps": state["steps"] + 1}

def my_router(state):
    return "END" if state["value"] >= 3 else "increment"

res = run_graph({"value": 0, "steps": 0}, {"increment": increment_node}, my_router)
print(res)`,
            output: '',
            status: 'idle',
            figureJson: null,
            testCode: `res = isinstance(res, dict) and res["value"] == 3 and res["steps"] == 3
res`,
            hint: 'Copy the initial state, then loop: call router(state) to get next_node, if "END" break, else state = nodes[next_node](state). Return state after the loop.',
          },
        ],
      },
    ],
  },
  quiz: [
    {
      id: 1,
      question: 'In LangGraph, what does a "node" represent?',
      options: [
        'A message in the conversation history',
        'A Python function that reads agent state and returns updated state',
        'A connection between the LLM and a tool',
        'A checkpoint where human approval is required',
      ],
      correct: 1,
      explanation: 'Each node is a plain Python function: (state) → updated_state. Nodes implement the actual logic — calling the LLM, executing tools, formatting output.',
    },
    {
      id: 2,
      question: 'What is a conditional edge in LangGraph?',
      options: [
        'An edge that only exists if the model has been fine-tuned',
        'A connection that routes to different nodes based on a function that inspects the current state',
        'An edge that introduces a random delay for rate limiting',
        'A connection that sends the state to a human reviewer',
      ],
      correct: 1,
      explanation: 'A conditional edge calls a router function on the current state and uses the return value (a node name or END) to decide where to go next. This enables branching logic.',
    },
    {
      id: 3,
      question: 'Why should you include a max_steps counter in your graph state?',
      options: [
        'LangGraph requires it to allocate memory for the graph',
        'To prevent infinite loops when the router never returns END',
        'To ensure the graph runs in parallel across multiple threads',
        'To limit the number of tool definitions the model can see',
      ],
      correct: 1,
      explanation: 'Cycles in a graph can loop forever if a bug prevents the terminal condition from being reached. A max_steps guard ensures the graph always terminates.',
    },
  ],
};
