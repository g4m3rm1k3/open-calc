import { useState, useRef, useCallback, useEffect } from 'react'
import { NODE_TYPES } from './nodeTypes.js'

let _nodeId = 0
export const newNodeId = () => `node-${Date.now()}-${_nodeId++}`

const PORT_RADIUS = 6
const NODE_WIDTH = 180

function portCenter(nodeEl, portKey, side) {
  if (!nodeEl) return null
  const port = nodeEl.querySelector(`[data-port="${side}-${portKey}"]`)
  if (!port) return null
  const nr = nodeEl.getBoundingClientRect()
  const pr = port.getBoundingClientRect()
  return {
    x: pr.left - nr.left + pr.width / 2,
    y: pr.top - nr.top + pr.height / 2,
  }
}

function EdgeSVG({ nodes, edges, nodeRefs, pending, mousePos }) {
  const allEdges = pending ? [...edges, pending] : edges

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible" style={{ zIndex: 0 }}>
      {allEdges.map((edge, i) => {
        let x1, y1, x2, y2

        if (edge._pending) {
          const fromNode = nodes.find(n => n.id === edge.from.nodeId)
          if (!fromNode || !mousePos) return null
          const ref = nodeRefs.current[fromNode.id]
          const p = ref ? portCenter(ref, edge.from.port, 'output') : null
          if (!p) return null
          x1 = fromNode.x + p.x; y1 = fromNode.y + p.y
          x2 = mousePos.x; y2 = mousePos.y
        } else {
          const fromNode = nodes.find(n => n.id === edge.from.nodeId)
          const toNode = nodes.find(n => n.id === edge.to.nodeId)
          if (!fromNode || !toNode) return null
          const fromRef = nodeRefs.current[fromNode.id]
          const toRef = nodeRefs.current[toNode.id]
          const fromP = fromRef ? portCenter(fromRef, edge.from.port, 'output') : null
          const toP = toRef ? portCenter(toRef, edge.to.port, 'input') : null
          if (!fromP || !toP) return null
          x1 = fromNode.x + fromP.x; y1 = fromNode.y + fromP.y
          x2 = toNode.x + toP.x; y2 = toNode.y + toP.y
        }

        const dx = Math.abs(x2 - x1) * 0.5
        const d = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`
        return (
          <path
            key={i}
            d={d}
            fill="none"
            stroke={edge._pending ? '#94a3b8' : '#6366f1'}
            strokeWidth={edge._pending ? 1.5 : 2}
            strokeDasharray={edge._pending ? '4 3' : undefined}
            opacity={edge._pending ? 0.6 : 1}
          />
        )
      })}
    </svg>
  )
}

function GraphNode({ node, onUpdate, onStartEdge, onCompleteEdge, onDelete, onStartDrag, nodeRef }) {
  const def = NODE_TYPES[node.type]
  if (!def) return null

  const CATEGORY_COLORS = {
    source: 'border-emerald-400 dark:border-emerald-600',
    transform: 'border-amber-400 dark:border-amber-600',
    output: 'border-brand-400 dark:border-brand-600',
  }

  return (
    <div
      ref={nodeRef}
      data-nodeid={node.id}
      className={`absolute rounded-xl border-2 bg-white dark:bg-slate-800 shadow-lg select-none ${CATEGORY_COLORS[def.category] ?? 'border-slate-300'}`}
      style={{ left: node.x, top: node.y, width: NODE_WIDTH, zIndex: 10 }}
      onMouseDown={e => e.stopPropagation()}
    >
      {/* Header — drag handle. Calls onStartDrag directly instead of relying
          on the event bubbling up to the canvas (it used to stopPropagation
          AND dispatch a custom event nothing listened for — dragging could
          never start at all). */}
      <div
        className="flex items-center gap-2 px-3 py-2 cursor-grab active:cursor-grabbing rounded-t-xl bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-700"
        onMouseDown={e => {
          e.stopPropagation()
          onStartDrag(node.id, e)
        }}
        data-drag-handle
      >
        <span className="text-xs font-bold">{def.icon}</span>
        <span className="text-[11px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 truncate flex-1">{def.label}</span>
        <button
          onMouseDown={e => e.stopPropagation()}
          onClick={() => onDelete(node.id)}
          className="text-[10px] text-slate-300 hover:text-red-400 transition-colors"
        >✕</button>
      </div>

      <div className="px-3 py-2 space-y-1.5">
        {/* Input ports */}
        {def.inputs.map(port => (
          <div key={port} className="flex items-center gap-2 h-6">
            <button
              data-port={`input-${port}`}
              onMouseDown={e => { e.stopPropagation(); onCompleteEdge({ nodeId: node.id, port }) }}
              className={`w-3 h-3 rounded-full border-2 border-slate-400 dark:border-slate-500 bg-white dark:bg-slate-900 hover:border-brand-500 hover:bg-brand-100 transition-colors -ml-4 shrink-0`}
              title={`Input: ${port}`}
            />
            <span className="text-[10px] text-slate-400 font-mono">{port}</span>
          </div>
        ))}

        {/* Fields */}
        {def.fields?.map(field => (
          <label key={field.key} className="flex flex-col gap-0.5">
            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">{field.label}</span>
            {field.type === 'color' ? (
              <input
                type="color"
                value={node.data[field.key] ?? '#6366f1'}
                onChange={e => onUpdate(node.id, { [field.key]: e.target.value })}
                className="w-8 h-5 rounded cursor-pointer border-0 bg-transparent"
              />
            ) : (
              <input
                type={field.type === 'number' ? 'number' : 'text'}
                value={node.data[field.key] ?? ''}
                onChange={e => onUpdate(node.id, { [field.key]: field.type === 'number' ? Number(e.target.value) : e.target.value })}
                className="w-full rounded bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 px-1.5 py-0.5 text-[11px] font-mono text-slate-700 dark:text-slate-200 outline-none focus:border-brand-400"
                onMouseDown={e => e.stopPropagation()}
              />
            )}
          </label>
        ))}

        {/* Output ports */}
        {def.outputs.map(port => (
          <div key={port} className="flex items-center justify-end gap-2 h-6">
            <span className="text-[10px] text-slate-400 font-mono">{port}</span>
            <button
              data-port={`output-${port}`}
              onClick={e => { e.stopPropagation(); onStartEdge({ nodeId: node.id, port }) }}
              className="w-3 h-3 rounded-full border-2 border-brand-400 dark:border-brand-500 bg-white dark:bg-slate-900 hover:bg-brand-200 transition-colors -mr-4 shrink-0 cursor-crosshair"
              title={`Output: ${port}`}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

const PALETTE = Object.entries(NODE_TYPES)

export default function NodeCanvas({ nodes, edges, onNodesChange, onEdgesChange }) {
  const canvasRef = useRef(null)
  const nodeRefs = useRef({})
  const [pendingEdge, setPendingEdge] = useState(null)
  const [mousePos, setMousePos] = useState(null)
  const dragging = useRef(null)

  const updateNode = useCallback((id, data) => {
    onNodesChange(nodes.map(n => n.id === id ? { ...n, data: { ...n.data, ...data } } : n))
  }, [nodes, onNodesChange])

  const deleteNode = useCallback((id) => {
    onNodesChange(nodes.filter(n => n.id !== id))
    onEdgesChange(edges.filter(e => e.from.nodeId !== id && e.to.nodeId !== id))
  }, [nodes, edges, onNodesChange, onEdgesChange])

  const addNode = useCallback((type) => {
    const def = NODE_TYPES[type]
    onNodesChange([...nodes, {
      id: newNodeId(),
      type,
      x: 80 + Math.random() * 120,
      y: 60 + Math.random() * 100,
      data: { ...def.defaults },
    }])
  }, [nodes, onNodesChange])

  // Mouse drag to move nodes — called directly from the node header's
  // onMouseDown (see GraphNode) with the real nodeId already known, instead
  // of the old approach of guessing which node was clicked by matching
  // bounding-rect positions within 5px (fragile, and unreachable anyway
  // since the header stopped propagation before this could ever run).
  const startDrag = useCallback((nodeId, e) => {
    const nodeEl = nodeRefs.current[nodeId]
    const canvasEl = canvasRef.current
    if (!nodeEl || !canvasEl) return
    const rect = nodeEl.getBoundingClientRect()
    dragging.current = {
      nodeId,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
    }
    e.preventDefault()
  }, [])

  const onMouseMove = useCallback((e) => {
    if (pendingEdge) {
      const rect = canvasRef.current.getBoundingClientRect()
      setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
    }
    if (dragging.current) {
      const rect = canvasRef.current.getBoundingClientRect()
      const { nodeId, offsetX, offsetY } = dragging.current
      onNodesChange(nodes.map(n => n.id === nodeId
        ? { ...n, x: e.clientX - rect.left - offsetX, y: e.clientY - rect.top - offsetY }
        : n,
      ))
    }
  }, [pendingEdge, nodes, onNodesChange])

  const onMouseUp = useCallback(() => {
    dragging.current = null
    if (pendingEdge) { setPendingEdge(null); setMousePos(null) }
  }, [pendingEdge])

  return (
    <div className="flex h-full">
      {/* Palette sidebar */}
      <div className="w-36 shrink-0 border-r border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 p-2 space-y-1 overflow-y-auto">
        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 px-1 pb-1">Nodes</p>
        {PALETTE.map(([type, def]) => (
          <button
            key={type}
            onClick={() => addNode(type)}
            className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors group"
          >
            <span className="text-xs mr-1.5">{def.icon}</span>
            <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 group-hover:text-brand-600">{def.label}</span>
          </button>
        ))}
      </div>

      {/* Canvas */}
      <div
        ref={canvasRef}
        className="flex-1 relative overflow-hidden bg-[radial-gradient(circle,_#e2e8f0_1px,_transparent_1px)] dark:bg-[radial-gradient(circle,_#1e293b_1px,_transparent_1px)] bg-[size:24px_24px]"
        style={{ cursor: pendingEdge ? 'crosshair' : 'default' }}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onClick={() => { if (pendingEdge) { setPendingEdge(null); setMousePos(null) } }}
      >
        <EdgeSVG nodes={nodes} edges={edges} nodeRefs={nodeRefs} pending={pendingEdge ? { ...pendingEdge, _pending: true } : null} mousePos={mousePos} />

        {nodes.map(node => (
          // GraphNode is the only absolutely-positioned element per node —
          // it used to be wrapped in a SECOND div that ALSO set
          // position:absolute + the same left/top, doubling the offset
          // (and throwing off EdgeSVG's port math, which assumes a node's
          // rendered position matches its data-model x/y exactly).
          <GraphNode
            key={node.id}
            node={node}
            onUpdate={updateNode}
            onDelete={deleteNode}
            onStartEdge={port => setPendingEdge({ from: port })}
            onStartDrag={startDrag}
            onCompleteEdge={toPort => {
              if (pendingEdge?.from) {
                const newEdge = { id: `e-${Date.now()}`, from: pendingEdge.from, to: toPort }
                onEdgesChange([...edges.filter(e => !(e.to.nodeId === toPort.nodeId && e.to.port === toPort.port)), newEdge])
                setPendingEdge(null); setMousePos(null)
              }
            }}
            nodeRef={el => { nodeRefs.current[node.id] = el }}
          />
        ))}

        {nodes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-slate-300 dark:text-slate-700 text-sm">Click a node in the palette to add it</p>
          </div>
        )}
      </div>
    </div>
  )
}
