export default {
  id: 'ae11-14',
  slug: 'model-context-protocol',
  chapter: 'ae-p11',
  order: 13,
  title: 'Model Context Protocol (MCP)',
  subtitle: 'The USB-C of AI tool integrations — one protocol, every tool.',
  tags: ['mcp', 'model-context-protocol', 'tools', 'resources', 'agents', 'integrations'],
  hook: {
    question: 'If every AI assistant needs its own custom connector to every tool, the integration matrix explodes. Is there a standard protocol that solves this once?',
    realWorldContext: 'Anthropic released MCP in late 2024 and it became the de-facto standard almost immediately. Claude Desktop, Cursor, Zed, and dozens of other hosts now speak MCP, meaning a single MCP server for your database works everywhere.',
    previewVisualizationId: 'PythonNotebook',
  },
  intuition: {
    prose: [
      'MCP defines three roles: the Host (Claude Desktop, your app), the Client (a per-server connection manager inside the host), and the Server (a process you write that exposes capabilities).',
      'MCP servers expose three capability types: Resources (read-only data like files or DB rows, addressed by URI), Tools (callable functions, like function calling), and Prompts (reusable message templates).',
      'Transports connect client to server. Stdio transport runs the server as a child process — perfect for local tools. SSE transport runs the server as an HTTP server — needed for remote/shared tools.',
      'The host discovers what a server offers via an initialize handshake. The server responds with its capabilities list. From then on the host calls tools, reads resources, and fetches prompts using JSON-RPC 2.0 messages.',
      'Building an MCP server in Python uses the `mcp` SDK (pip install mcp). You decorate functions with @server.call_tool() and @server.list_tools() and run server.run().',
    ],
    callouts: [
      { type: 'key-insight', text: 'MCP separates the AI host from the tool implementation. Your MCP server works with Claude, GPT-4o, Gemini, or any future model that speaks the protocol.' },
      { type: 'tip', text: 'Start with stdio transport for local development — it requires zero network configuration and the server process is managed by the host automatically.' },
      { type: 'warning', text: 'MCP servers run with the permissions of the process that starts them. A filesystem MCP server with write access is a powerful attack surface — scope permissions carefully.' },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        initialCells: [
          {
            id: 1,
            cellTitle: 'MCP Architecture Overview',
            prose: 'Model the MCP component roles as Python dataclasses to make the architecture concrete.',
            code: `from dataclasses import dataclass, field
from typing import List

@dataclass
class MCPTool:
    name: str
    description: str
    input_schema: dict

@dataclass
class MCPResource:
    uri: str
    name: str
    mime_type: str

@dataclass
class MCPServerCapabilities:
    tools: List[MCPTool] = field(default_factory=list)
    resources: List[MCPResource] = field(default_factory=list)

# A hypothetical filesystem MCP server
fs_server = MCPServerCapabilities(
    tools=[
        MCPTool("read_file",  "Read a file by path", {"type": "object", "properties": {"path": {"type": "string"}}}),
        MCPTool("write_file", "Write content to a file", {"type": "object", "properties": {"path": {"type": "string"}, "content": {"type": "string"}}}),
    ],
    resources=[
        MCPResource("file:///home/user/notes.txt", "notes.txt", "text/plain"),
    ]
)

print(f"Tools available: {[t.name for t in fs_server.tools]}")
print(f"Resources:       {[r.uri for r in fs_server.resources]}")`,
            output: '',
            status: 'idle',
            figureJson: null,
          },
          {
            id: 2,
            cellTitle: 'JSON-RPC Message Format',
            prose: 'MCP uses JSON-RPC 2.0 for all messages. Here are the initialize handshake and a tool call, formatted as they would appear on the wire.',
            code: `import json

# Host → Server: initialize
init_request = {
    "jsonrpc": "2.0",
    "id": 1,
    "method": "initialize",
    "params": {
        "protocolVersion": "2024-11-05",
        "capabilities": {"roots": {"listChanged": True}},
        "clientInfo": {"name": "my-host", "version": "1.0.0"}
    }
}

# Server → Host: initialized response
init_response = {
    "jsonrpc": "2.0",
    "id": 1,
    "result": {
        "protocolVersion": "2024-11-05",
        "capabilities": {"tools": {}, "resources": {}},
        "serverInfo": {"name": "my-mcp-server", "version": "0.1.0"}
    }
}

# Host → Server: call a tool
tool_call = {
    "jsonrpc": "2.0",
    "id": 2,
    "method": "tools/call",
    "params": {"name": "read_file", "arguments": {"path": "/home/user/notes.txt"}}
}

for label, msg in [("INIT REQUEST", init_request), ("INIT RESPONSE", init_response), ("TOOL CALL", tool_call)]:
    print(f"--- {label} ---")
    print(json.dumps(msg, indent=2))
    print()`,
            output: '',
            status: 'idle',
            figureJson: null,
          },
          {
            id: 3,
            cellTitle: 'Minimal MCP Server Structure (Python)',
            prose: 'This is the skeleton of a real MCP server using the official Python SDK. It exposes a single `echo` tool.',
            code: `# In production you would:  pip install mcp
# and run this as a standalone script.
# Here we just print the structure.

server_code = """
from mcp.server import Server
from mcp.server.models import InitializationOptions
from mcp.types import Tool, TextContent
import mcp.server.stdio

server = Server("echo-server")

@server.list_tools()
async def list_tools():
    return [
        Tool(
            name="echo",
            description="Echo the input message back.",
            inputSchema={
                "type": "object",
                "properties": {"message": {"type": "string"}},
                "required": ["message"]
            }
        )
    ]

@server.call_tool()
async def call_tool(name: str, arguments: dict):
    if name == "echo":
        return [TextContent(type="text", text=arguments["message"])]
    raise ValueError(f"Unknown tool: {name}")

async def main():
    async with mcp.server.stdio.stdio_server() as (r, w):
        await server.run(r, w, InitializationOptions(
            server_name="echo-server", server_version="0.1.0"
        ))

import asyncio
asyncio.run(main())
"""

print(server_code)
print("\\nRun with: python server.py")
print("Configure in claude_desktop_config.json under 'mcpServers'.")`,
            output: '',
            status: 'idle',
            figureJson: null,
          },
          {
            id: 'c1',
            challengeType: 'write',
            challengeNumber: 1,
            challengeTitle: 'MCP Server Manifest',
            difficulty: 'beginner',
            prompt: `Build a function \`build_manifest(server_name, version, tools)\` that returns a dict representing an MCP server's initialize response.
The result must have keys: \`"jsonrpc"\` (= \`"2.0"\`), \`"id"\` (= 1), and \`"result"\` containing:
- \`"serverInfo": {"name": server_name, "version": version}\`
- \`"protocolVersion": "2024-11-05"\`
- \`"capabilities": {"tools": {tool["name"]: tool for tool in tools}}\`

Store the result of calling it with \`server_name="calc-server"\`, \`version="1.0.0"\`, and one tool \`{"name": "add", "description": "Add two numbers"}\` in \`res\`.`,
            code: `def build_manifest(server_name, version, tools):
    # YOUR CODE HERE
    pass

res = build_manifest(
    server_name="calc-server",
    version="1.0.0",
    tools=[{"name": "add", "description": "Add two numbers"}]
)
print(res)`,
            output: '',
            status: 'idle',
            figureJson: null,
            testCode: `res = (
    isinstance(res, dict)
    and res.get("jsonrpc") == "2.0"
    and res["result"]["serverInfo"]["name"] == "calc-server"
    and "add" in res["result"]["capabilities"]["tools"]
)
res`,
            hint: 'Build the result dict with the nested structure shown in the spec. Use a dict comprehension {tool["name"]: tool for tool in tools} for the capabilities.tools value.',
          },
        ],
      },
    ],
  },
  quiz: [
    {
      id: 1,
      question: 'In MCP terminology, what is the "Host"?',
      options: [
        'The MCP server that exposes tools and resources',
        'The application (like Claude Desktop) that manages MCP client connections and routes requests',
        'The transport layer (stdio or SSE)',
        'The JSON-RPC message broker',
      ],
      correct: 1,
      explanation: 'The Host is the top-level application (Claude Desktop, your custom app) that orchestrates one or more MCP Clients, each of which connects to one MCP Server.',
    },
    {
      id: 2,
      question: 'What is the difference between MCP Tools and MCP Resources?',
      options: [
        'Tools are for text data; Resources are for binary data',
        'Tools are callable functions that can have side effects; Resources are read-only data addressed by URI',
        'Resources use stdio transport; Tools use SSE transport',
        'Tools require authentication; Resources are always public',
      ],
      correct: 1,
      explanation: 'Tools are invocable (like function calling) and can perform actions. Resources are addressable data sources the model can read but not modify through MCP.',
    },
    {
      id: 3,
      question: 'Which transport is recommended for local development MCP servers?',
      options: [
        'WebSocket, because it supports bidirectional streaming',
        'SSE (Server-Sent Events), because it is HTTP-based',
        'gRPC, because it is the most performant',
        'Stdio, because the host manages the server process with zero network configuration',
      ],
      correct: 3,
      explanation: 'Stdio transport runs the MCP server as a child process of the host. No ports, no networking — the host starts and stops it automatically. Perfect for local tools.',
    },
  ],
};
