// Node type definitions and graph evaluator for the viz builder node graph

export const NODE_TYPES = {
  numberRange: {
    label: 'Number Range',
    icon: '⇢',
    category: 'source',
    inputs: [],
    outputs: ['values'],
    defaults: { min: -5, max: 5, steps: 41 },
    fields: [
      { key: 'min', type: 'number', label: 'Min' },
      { key: 'max', type: 'number', label: 'Max' },
      { key: 'steps', type: 'number', label: 'Steps' },
    ],
    evaluate: ({ min, max, steps }) => ({
      values: Array.from({ length: Number(steps) }, (_, i) =>
        Number(min) + (i * (Number(max) - Number(min))) / (Number(steps) - 1),
      ),
    }),
  },

  formula: {
    label: 'Formula f(x)',
    icon: '∫',
    category: 'transform',
    inputs: ['x'],
    outputs: ['y'],
    defaults: { expr: 'x * x' },
    fields: [{ key: 'expr', type: 'text', label: 'f(x) =' }],
    evaluate: ({ expr }, inputs) => {
      const xs = inputs?.x?.values ?? []
      // eslint-disable-next-line no-new-func
      const fn = new Function('x', `try { return (${expr}) } catch(e) { return 0 }`)
      return { y: xs.map(x => { try { return fn(x) } catch { return 0 } }) }
    },
  },

  constant: {
    label: 'Constant',
    icon: '#',
    category: 'source',
    inputs: [],
    outputs: ['value'],
    defaults: { value: 1 },
    fields: [{ key: 'value', type: 'number', label: 'Value' }],
    evaluate: ({ value }) => ({ value: Number(value) }),
  },

  textLabel: {
    label: 'Label',
    icon: 'T',
    category: 'source',
    inputs: [],
    outputs: ['text'],
    defaults: { text: 'f(x)' },
    fields: [{ key: 'text', type: 'text', label: 'Text' }],
    evaluate: ({ text }) => ({ text }),
  },

  scale: {
    label: 'Scale',
    icon: '×',
    category: 'transform',
    inputs: ['values', 'factor'],
    outputs: ['values'],
    defaults: { factor: 1 },
    fields: [{ key: 'factor', type: 'number', label: 'Factor (if no input)' }],
    evaluate: ({ factor }, inputs) => {
      const vals = inputs?.values?.values ?? inputs?.values?.y ?? []
      const k = inputs?.factor?.value ?? Number(factor)
      return { values: vals.map(v => v * k) }
    },
  },

  linePlot: {
    label: 'Line Plot',
    icon: '📈',
    category: 'output',
    inputs: ['x', 'y'],
    outputs: [],
    defaults: { color: '#6366f1', label: '' },
    fields: [
      { key: 'color', type: 'color', label: 'Color' },
      { key: 'label', type: 'text', label: 'Label' },
    ],
    isOutput: true,
  },

  barChart: {
    label: 'Bar Chart',
    icon: '📊',
    category: 'output',
    inputs: ['values'],
    outputs: [],
    defaults: { color: '#10b981', title: '' },
    fields: [
      { key: 'color', type: 'color', label: 'Bar color' },
      { key: 'title', type: 'text', label: 'Title' },
    ],
    isOutput: true,
  },

  scatterPlot: {
    label: 'Scatter Plot',
    icon: '⬤',
    category: 'output',
    inputs: ['x', 'y'],
    outputs: [],
    defaults: { color: '#f59e0b', radius: 3 },
    fields: [
      { key: 'color', type: 'color', label: 'Dot color' },
      { key: 'radius', type: 'number', label: 'Dot radius' },
    ],
    isOutput: true,
  },
}

// Topological sort — returns node IDs in evaluation order
function topoSort(nodes, edges) {
  const idMap = Object.fromEntries(nodes.map(n => [n.id, n]))
  const visited = new Set()
  const order = []

  function visit(id) {
    if (visited.has(id)) return
    visited.add(id)
    // visit all nodes that feed into this one
    edges
      .filter(e => e.to.nodeId === id)
      .forEach(e => visit(e.from.nodeId))
    order.push(id)
  }

  nodes.forEach(n => visit(n.id))
  return order.map(id => idMap[id]).filter(Boolean)
}

// Evaluate the entire graph; returns { type, data } for each output node
export function evaluateGraph(nodes, edges) {
  const results = {} // nodeId → evaluated output

  const sorted = topoSort(nodes, edges)

  for (const node of sorted) {
    const def = NODE_TYPES[node.type]
    if (!def) continue

    if (def.isOutput) {
      // Collect inputs
      const inputs = {}
      for (const port of def.inputs) {
        const edge = edges.find(e => e.to.nodeId === node.id && e.to.port === port)
        if (edge) inputs[port] = results[edge.from.nodeId]
      }
      results[node.id] = { _output: true, type: node.type, data: node.data, inputs }
    } else if (def.evaluate) {
      const inputs = {}
      for (const port of def.inputs) {
        const edge = edges.find(e => e.to.nodeId === node.id && e.to.port === port)
        if (edge) inputs[port] = results[edge.from.nodeId]
      }
      results[node.id] = def.evaluate(node.data, inputs)
    }
  }

  return Object.values(results).filter(r => r?._output)
}
