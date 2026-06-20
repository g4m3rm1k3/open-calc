import { useMemo } from 'react'
import type { Plan } from '../types'
import { METHODS } from '../methods'

interface GoalMapProps {
  plans: Plan[]
  onNodeClick?: (planId: string, actionId?: string) => void
}

interface MapNode {
  id: string
  label: string
  sublabel?: string
  status: 'done' | 'active' | 'pending' | 'start' | 'goal'
  x: number
  y: number
  methodId?: string
}

interface MapEdge {
  from: string
  to: string
  label?: string
}

const STATUS_COLORS = {
  done: { fill: '#10b981', stroke: '#059669', text: '#fff' },
  active: { fill: '#0ea5e9', stroke: '#0284c7', text: '#fff' },
  pending: { fill: '#1e293b', stroke: '#334155', text: '#94a3b8' },
  start: { fill: '#6366f1', stroke: '#4f46e5', text: '#fff' },
  goal: { fill: '#f59e0b', stroke: '#d97706', text: '#fff' },
}

function buildMapForPlan(plan: Plan, offsetY: number): { nodes: MapNode[]; edges: MapEdge[] } {
  const nodes: MapNode[] = []
  const edges: MapEdge[] = []
  const today = new Date().toISOString().split('T')[0]

  // Start node
  const startId = `${plan.id}-start`
  nodes.push({
    id: startId,
    label: 'Start',
    sublabel: new Date(plan.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    status: 'start',
    x: 60,
    y: offsetY + 80,
  })

  // Action nodes
  const doneOnce = plan.actions.filter(a => a.cadence === 'once' && a.status === 'done')
  const activeActions = plan.actions.filter(a => a.cadence !== 'once' || a.status !== 'done')
  
  // Order: done first, then active/pending
  const ordered = [...doneOnce, ...activeActions]
  const spacing = Math.max(140, Math.min(200, 800 / (ordered.length + 1)))

  let prevId = startId
  ordered.forEach((action, i) => {
    const todayLog = action.log.find(l => l.date === today)
    let status: MapNode['status'] = 'pending'
    if (action.status === 'done') status = 'done'
    else if (todayLog?.outcome === 'done') status = 'done'
    else if (action.status === 'active') status = 'active'

    const nodeId = `${plan.id}-action-${action.id}`
    const method = action.methodIds?.[0] ? METHODS[action.methodIds[0] as keyof typeof METHODS] : null
    
    nodes.push({
      id: nodeId,
      label: action.label.length > 22 ? action.label.slice(0, 22) + '…' : action.label,
      sublabel: action.cadence === 'once' ? 'once' : `${action.cadence}${action.time ? ' @ ' + action.time : ''}`,
      status,
      x: 60 + spacing * (i + 1),
      y: offsetY + (i % 2 === 0 ? 60 : 110), // stagger vertically for readability
      methodId: action.methodIds?.[0],
    })

    edges.push({
      from: prevId,
      to: nodeId,
      label: method?.title,
    })
    prevId = nodeId
  })

  // Goal node (transformation)
  const goalId = `${plan.id}-goal`
  const allDone = plan.status === 'completed'
  nodes.push({
    id: goalId,
    label: plan.status === 'completed' ? '🏆 Complete' : plan.focus ?? plan.title,
    sublabel: plan.reward ? `Reward: ${plan.reward.slice(0, 20)}` : undefined,
    status: allDone ? 'done' : 'goal',
    x: 60 + spacing * (ordered.length + 1),
    y: offsetY + 80,
  })
  edges.push({ from: prevId, to: goalId })

  return { nodes, edges }
}

export default function GoalMap({ plans, onNodeClick }: GoalMapProps) {
  const activePlans = plans.filter(p => p.status === 'active' || p.status === 'completed').slice(0, 3)

  const { nodes, edges, totalHeight } = useMemo(() => {
    const allNodes: MapNode[] = []
    const allEdges: MapEdge[] = []
    let offsetY = 0
    for (const plan of activePlans) {
      const { nodes: n, edges: e } = buildMapForPlan(plan, offsetY)
      allNodes.push(...n)
      allEdges.push(...e)
      offsetY += 180
    }
    return { nodes: allNodes, edges: allEdges, totalHeight: Math.max(160, offsetY) }
  }, [plans])

  if (activePlans.length === 0) return null

  const totalWidth = Math.max(...nodes.map(n => n.x)) + 80

  return (
    <div className="w-full overflow-x-auto rounded-xl bg-slate-950 border border-slate-800 p-3">
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Goal Map</p>
      <svg
        width="100%"
        viewBox={`0 0 ${totalWidth} ${totalHeight}`}
        style={{ minWidth: Math.min(totalWidth, 600), maxHeight: 360 }}
      >
        <defs>
          <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="#334155" />
          </marker>
        </defs>

        {/* Edges */}
        {edges.map((edge, i) => {
          const from = nodes.find(n => n.id === edge.from)
          const to = nodes.find(n => n.id === edge.to)
          if (!from || !to) return null
          const mx = (from.x + to.x) / 2
          const my = (from.y + to.y) / 2 - 15
          return (
            <g key={i}>
              <path
                d={`M ${from.x} ${from.y} Q ${mx} ${my} ${to.x} ${to.y}`}
                fill="none"
                stroke="#334155"
                strokeWidth="1.5"
                markerEnd="url(#arrowhead)"
              />
              {edge.label && (
                <text x={mx} y={my - 4} textAnchor="middle" fill="#475569" fontSize="8" fontWeight="600">
                  {edge.label.slice(0, 16)}
                </text>
              )}
            </g>
          )
        })}

        {/* Nodes */}
        {nodes.map(node => {
          const colors = STATUS_COLORS[node.status]
          const r = 28
          return (
            <g
              key={node.id}
              transform={`translate(${node.x}, ${node.y})`}
              onClick={() => {
                const [planId, , actionId] = node.id.split('-action-')
                onNodeClick?.(planId.replace('-start', '').replace('-goal', ''), actionId)
              }}
              style={{ cursor: 'pointer' }}
            >
              <circle
                r={r}
                fill={colors.fill}
                stroke={colors.stroke}
                strokeWidth="2"
                opacity={node.status === 'pending' ? 0.6 : 1}
              />
              {/* Pulse ring for active nodes */}
              {node.status === 'active' && (
                <circle r={r + 4} fill="none" stroke={colors.stroke} strokeWidth="1" opacity="0.4">
                  <animate attributeName="r" values={`${r + 2};${r + 8};${r + 2}`} dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.4;0;0.4" dur="2s" repeatCount="indefinite" />
                </circle>
              )}
              <text y="-8" textAnchor="middle" fill={colors.text} fontSize="8.5" fontWeight="700">
                {node.label.split(' ').slice(0, 2).join(' ')}
              </text>
              <text y="3" textAnchor="middle" fill={colors.text} fontSize="7.5" fontWeight="500">
                {node.label.split(' ').slice(2).join(' ')}
              </text>
              {node.sublabel && (
                <text y="14" textAnchor="middle" fill={colors.text} fontSize="6.5" opacity="0.75">
                  {node.sublabel}
                </text>
              )}
            </g>
          )
        })}
      </svg>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-3 px-1">
        {Object.entries(STATUS_COLORS).map(([status, colors]) => (
          <div key={status} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: colors.fill }} />
            <span className="text-[10px] text-slate-500 capitalize">{status}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
