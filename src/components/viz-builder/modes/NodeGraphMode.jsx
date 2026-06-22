import { useState, useEffect } from 'react'
import NodeCanvas from '../nodegraph/NodeCanvas.jsx'
import GraphPreview from '../nodegraph/GraphPreview.jsx'
import { evaluateGraph, NODE_TYPES } from '../nodegraph/nodeTypes.js'

const DEFAULT_NODES = [
  { id: 'n1', type: 'numberRange', x: 40, y: 80, data: { min: -5, max: 5, steps: 41 } },
  { id: 'n2', type: 'formula', x: 260, y: 80, data: { expr: 'x * x' } },
  { id: 'n3', type: 'linePlot', x: 480, y: 80, data: { color: '#6366f1', label: 'f(x) = x²' } },
]
const DEFAULT_EDGES = [
  { id: 'e1', from: { nodeId: 'n1', port: 'values' }, to: { nodeId: 'n2', port: 'x' } },
  { id: 'e2', from: { nodeId: 'n1', port: 'values' }, to: { nodeId: 'n3', port: 'x' } },
  { id: 'e3', from: { nodeId: 'n2', port: 'y' }, to: { nodeId: 'n3', port: 'y' } },
]

export default function NodeGraphMode({ onGraphOutput }) {
  const [nodes, setNodes] = useState(DEFAULT_NODES)
  const [edges, setEdges] = useState(DEFAULT_EDGES)
  const [outputs, setOutputs] = useState([])

  useEffect(() => {
    try {
      const out = evaluateGraph(nodes, edges)
      setOutputs(out)
      onGraphOutput?.(out)
    } catch (e) {
      console.warn('Graph eval error:', e)
    }
  }, [nodes, edges])

  return (
    <div className="flex h-full">
      {/* Left: canvas */}
      <div className="flex-1 min-w-0 border-r border-slate-200 dark:border-slate-700" style={{ height: '100%' }}>
        <NodeCanvas
          nodes={nodes}
          edges={edges}
          onNodesChange={setNodes}
          onEdgesChange={setEdges}
        />
      </div>

      {/* Right: preview */}
      <div className="w-80 shrink-0 overflow-y-auto bg-slate-50 dark:bg-slate-900/50">
        <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Preview</p>
        </div>
        <GraphPreview outputs={outputs} />

        {outputs.length > 0 && (
          <div className="px-4 pb-4 space-y-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 pt-2">Output nodes</p>
            {outputs.map((out, i) => (
              <div key={i} className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs font-mono text-slate-500">
                <span className="font-bold text-brand-500">{NODE_TYPES[out.type]?.label}</span>
                <span className="ml-2 text-slate-400">
                  {out.type === 'linePlot' && `${(out.inputs?.x?.values ?? out.inputs?.x?.y ?? []).length} points`}
                  {out.type === 'barChart' && `${(out.inputs?.values?.values ?? out.inputs?.values?.y ?? []).length} bars`}
                  {out.type === 'scatterPlot' && `${(out.inputs?.x?.values ?? out.inputs?.x?.y ?? []).length} points`}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
