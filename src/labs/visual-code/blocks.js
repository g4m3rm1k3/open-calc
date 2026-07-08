export const BLOCK_COLORS = {
  oop: "#2563eb",
  state: "#7c3aed",
  flow: "#0891b2",
  output: "#dc2626",
  html: "#ea580c",
};

export const BLOCK_GROUPS = [
  { id: "oop", label: "OOP" },
  { id: "state", label: "State" },
  { id: "flow", label: "Flow" },
  { id: "output", label: "Output" },
  { id: "html", label: "HTML" },
];

export const BLOCK_LIBRARY = [
  defineBlock("class", "Class", "oop", "Define an object blueprint.", {
    defaults: { name: "Player", extendsName: "" },
    childTypes: ["constructor", "field", "method", "getter", "setter", "staticMethod"],
    fields: [
      field("name", "Class name"),
      field("extendsName", "Extends"),
    ],
  }),
  defineBlock("constructor", "Constructor", "oop", "Set up object state when an instance is created.", {
    defaults: { params: "name", body: "this.name = name;\nthis.score = 0;" },
    fields: [field("params", "Parameters"), field("body", "Body", "code")],
  }),
  defineBlock("method", "Method", "oop", "Add behavior to a class.", {
    defaults: { name: "greet", params: "", async: "false", body: "return `Hello, ${this.name}!`;" },
    fields: [
      field("name", "Method name"),
      field("params", "Parameters"),
      choice("async", "Async", ["false", "true"]),
      field("body", "Body", "code"),
    ],
  }),
  defineBlock("staticMethod", "Static Method", "oop", "Add behavior called on the class itself.", {
    defaults: { name: "create", params: "name", async: "false", body: "return new this(name);" },
    fields: [
      field("name", "Method name"),
      field("params", "Parameters"),
      choice("async", "Async", ["false", "true"]),
      field("body", "Body", "code"),
    ],
  }),
  defineBlock("getter", "Getter", "oop", "Expose a computed property.", {
    defaults: { name: "displayName", body: "return this.name.toUpperCase();" },
    fields: [field("name", "Property name"), field("body", "Body", "code")],
  }),
  defineBlock("setter", "Setter", "oop", "Validate or transform property assignment.", {
    defaults: { name: "displayName", param: "value", body: "this.name = value.trim();" },
    fields: [field("name", "Property name"), field("param", "Parameter"), field("body", "Body", "code")],
  }),
  defineBlock("field", "Field", "state", "Create a class field.", {
    defaults: { name: "level", value: "1", static: "false" },
    fields: [field("name", "Field name"), field("value", "Value"), choice("static", "Static", ["false", "true"])],
  }),
  defineBlock("function", "Function", "oop", "Define reusable behavior outside a class.", {
    defaults: { name: "makePlayer", params: "name", async: "false" },
    childTypes: ["variable", "assign", "call", "log", "if", "loop", "return", "htmlText"],
    fields: [field("name", "Function name"), field("params", "Parameters"), choice("async", "Async", ["false", "true"])],
  }),
  defineBlock("variable", "Variable", "state", "Store a value in the program.", {
    defaults: { kind: "const", name: "player", value: 'new Player("Ada")' },
    fields: [choice("kind", "Kind", ["const", "let", "var"]), field("name", "Name"), field("value", "Value")],
  }),
  defineBlock("assign", "Assign", "state", "Change a value.", {
    defaults: { target: "player.score", value: "10" },
    fields: [field("target", "Target"), field("value", "Value")],
  }),
  defineBlock("call", "Call", "oop", "Call a function or method.", {
    defaults: { expression: "player.greet()" },
    fields: [field("expression", "Expression")],
  }),
  defineBlock("return", "Return", "flow", "Return a value from a method or function.", {
    defaults: { expression: "player" },
    fields: [field("expression", "Expression")],
  }),
  defineBlock("if", "If", "flow", "Run code when a condition is true.", {
    defaults: { condition: "player.score > 5", body: "" },
    childTypes: ["variable", "assign", "call", "log", "loop", "return", "htmlText"],
    fields: [field("condition", "Condition"), field("body", "Raw body fallback", "code")],
  }),
  defineBlock("loop", "Repeat", "flow", "Run code several times.", {
    defaults: { count: "3", iterator: "i", body: "" },
    childTypes: ["variable", "assign", "call", "log", "if", "return", "htmlText"],
    fields: [field("count", "Count"), field("iterator", "Iterator"), field("body", "Raw body fallback", "code")],
  }),
  defineBlock("log", "Log", "output", "Print a value to the output window.", {
    defaults: { expression: "player.greet()" },
    fields: [field("expression", "Expression")],
  }),
  defineBlock("event", "Event Listener", "html", "React to DOM events in the preview.", {
    defaults: { selector: "#app", event: "click" },
    childTypes: ["variable", "assign", "call", "log", "if", "loop", "htmlText"],
    fields: [field("selector", "Selector"), field("event", "Event")],
  }),
  defineBlock("htmlText", "HTML Text", "html", "Write text into a preview element.", {
    defaults: { selector: "#app", text: "player.greet()" },
    fields: [field("selector", "Selector"), field("text", "Text expression")],
  }),
];

export function createBlock(type) {
  const definition = blockDefinition(type);
  if (!definition) throw new Error(`Unknown block type: ${type}`);
  return {
    id: `block_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
    type,
    category: definition.category,
    fields: { ...definition.defaults },
    children: [],
  };
}

export function blockDefinition(type) {
  return BLOCK_LIBRARY.find((block) => block.type === type) ?? null;
}

export function childOptionsFor(type) {
  const definition = blockDefinition(type);
  if (!definition?.childTypes?.length) return [];
  return definition.childTypes.map(blockDefinition).filter(Boolean);
}

export function canContainChildren(type) {
  return childOptionsFor(type).length > 0;
}

function defineBlock(type, label, category, description, options) {
  return {
    type,
    label,
    category,
    description,
    defaults: options.defaults ?? {},
    fields: options.fields ?? [],
    childTypes: options.childTypes ?? [],
  };
}

function field(name, label, kind = "text") {
  return { name, label, kind };
}

function choice(name, label, options) {
  return { name, label, kind: "select", options };
}
