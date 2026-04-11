export default {
  id: 'dsa5-002',
  slug: 'shortest-paths-topo',
  chapter: 'dsa5',
  order: 2,
  title: 'Shortest Paths & Topological Sort',
  subtitle: "Dijkstra finds the cheapest route. Kahn's algorithm orders tasks that depend on each other.",
  tags: ['Dijkstra', 'shortest path', 'topological sort', 'DAG', 'Kahn', 'in-degree', 'weighted graph', 'cycle detection'],
  aliases: "Dijkstra shortest path topological sort DAG Kahn in-degree weighted directed acyclic cycle",

  hook: {
    question: 'BFS finds the shortest path by number of edges. But what if edges have different weights — some roads are shorter than others, some links are faster? And how do you order tasks when some must complete before others can start?',
    realWorldContext: "Google Maps uses Dijkstra's (or A*) to route you through a weighted graph of roads. npm's install order is a topological sort — it resolves which packages depend on which and installs them in valid order. Build systems (make, Gradle, Bazel) topologically sort source files so dependencies compile first. Airlines compute fastest-connection itineraries with Dijkstra. Circuit simulation tools sort components topologically before running.",
    previewVisualizationId: 'ScienceNotebook',
  },

  intuition: {
    prose: [
      "**Dijkstra's algorithm: greedy shortest paths.** Maintain a distance table — the best known distance from source to every node (start all at Infinity, source at 0). Always process the unvisited node with the smallest known distance. For each of its neighbors, check if we found a shorter path (dist[u] + weight < dist[neighbor]) — if so, update.",
      "**Why greedy works.** When you finalize a node (mark it visited), its distance is guaranteed to be the shortest. Any other path to it would have to go through a node with a larger tentative distance — so it can't be shorter. This is why Dijkstra fails with negative weights: the greedy assumption breaks.",
      "**Topological sort: ordering a DAG.** A Directed Acyclic Graph (DAG) is a graph with no cycles. A topological order lists every node such that for every edge A→B, A appears before B in the list. Think: course prerequisites. You must complete Math before Algorithms.",
      "**Kahn's algorithm (BFS-based).** Count in-degrees (how many edges point INTO each node). Nodes with in-degree 0 have no prerequisites — they can go first. Process each zero-in-degree node: decrement its neighbors' in-degrees. When a neighbor hits 0, it's ready. If the output has fewer nodes than the graph, a cycle exists.",
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Chapter 5, Lesson 2: Weighted Graphs',
        body: '**Previous:** BFS and DFS — unweighted traversal.\n**This lesson:** Dijkstra (weighted shortest path) and topological sort (DAG ordering).\n**Next chapter:** Sorting and Searching.',
      },
      {
        type: 'insight',
        title: 'Cycle detection for free',
        body: "If Kahn's topological sort produces an order with fewer nodes than the graph, some nodes were stuck with in-degree > 0 forever — that means there's a cycle. Topological sort fails exactly when a cycle exists, so it doubles as a cycle detector.",
      },
      {
        type: 'warning',
        title: "Dijkstra fails with negative weights",
        body: "Dijkstra's greedy assumption — that finalizing a node means its distance is optimal — breaks when a future negative-weight edge could create a shorter path. Use Bellman-Ford for negative weights. For most real-world routing problems (distances, times, costs), weights are non-negative and Dijkstra is correct.",
      },
    ],
    visualizations: [
      {
        id: 'ScienceNotebook',
        title: "Dijkstra's and Kahn's — Step by Step",
        mathBridge: "Watch Dijkstra update the distance table one node at a time. Then watch Kahn's algorithm drain nodes as their in-degrees hit zero.",
        caption: "Two cells: Dijkstra's distance updates, Kahn's topological ordering.",
        props: {
          lesson: {
            title: 'Weighted Graphs and Dependency Ordering',
            subtitle: "Dijkstra's shortest paths and Kahn's topological sort",
            sequential: true,
            cells: [
              {
                type: 'js',
                title: "Dijkstra's — Update the Distance Table",
                instruction: "At each step, we pick the unvisited node with the smallest known distance, then update its neighbors. Watch how dist[B] starts at Infinity and gets updated to 3 (via A→C→B: 2+1).",
                html: `<div id="display" style="padding:12px"></div>`,
                css: `body{margin:0;background:#0f172a;color:#e2e8f0;font-family:monospace;box-sizing:border-box}`,
                startCode: `const display=document.getElementById('display');
const graph={A:[{to:'B',w:4},{to:'C',w:2}],B:[{to:'D',w:5},{to:'C',w:1}],C:[{to:'B',w:1},{to:'D',w:8},{to:'E',w:10}],D:[{to:'E',w:2}],E:[]};
function dijkstra(graph,start){const dist={};for(const n of Object.keys(graph))dist[n]=Infinity;dist[start]=0;const visited=new Set();const steps=[];while(true){let u=null;for(const n of Object.keys(dist))if(!visited.has(n)&&(u===null||dist[n]<dist[u]))u=n;if(u===null||dist[u]===Infinity)break;visited.add(u);for(const{to,w}of graph[u]||[])if(dist[u]+w<dist[to])dist[to]=dist[u]+w;steps.push({visiting:u,dist:{...dist}});}return{dist,steps};}
const{dist,steps}=dijkstra(graph,'A');const nodes=Object.keys(graph);
let html='<h3 style="color:#60a5fa;margin:0 0 12px">Dijkstra from A</h3><table style="border-collapse:collapse;width:100%;font-size:12px"><tr style="color:#94a3b8"><th style="padding:4px 6px;text-align:left">Step</th><th style="text-align:left;padding:4px 6px">Visiting</th>';
nodes.forEach(n=>{html+='<th style="padding:4px 6px;text-align:center">dist['+n+']</th>';});html+='</tr>';
steps.forEach((s,i)=>{html+='<tr style="border-top:1px solid #334155"><td style="padding:4px 6px;color:#94a3b8">'+(i+1)+'</td><td style="padding:4px 6px;color:#f59e0b;font-weight:bold">'+s.visiting+'</td>';nodes.forEach(n=>{const v=s.dist[n]===Infinity?'∞':s.dist[n];const c=n===s.visiting?'#4ade80':'#e2e8f0';html+='<td style="padding:4px 6px;text-align:center;color:'+c+'">'+v+'</td>';});html+='</tr>';});
html+='</table><p style="color:#94a3b8;font-size:13px;margin-top:8px">Final: '+nodes.map(n=>n+'='+dist[n]).join(', ')+'</p>';
display.innerHTML=html;`,
                outputHeight: 280,
              },
              {
                type: 'js',
                title: "Kahn's Topological Sort — Drain Zero In-Degree Nodes",
                instruction: "Count how many edges point INTO each node (in-degree). Nodes with in-degree 0 have no prerequisites. Process them: decrement their neighbors' in-degrees. When a neighbor hits 0, it's ready.",
                html: `<div id="display" style="padding:12px"></div>`,
                css: `body{margin:0;background:#0f172a;color:#e2e8f0;font-family:monospace;box-sizing:border-box}`,
                startCode: `const display=document.getElementById('display');
const graph={'Math':['Algorithms'],'CS101':['Data Structures','Algorithms'],'Data Structures':['Algorithms'],'Algorithms':['Systems'],'Systems':[]};
function topoSort(graph){const nodes=Object.keys(graph);const inDeg={};for(const n of nodes)inDeg[n]=0;for(const n of nodes)for(const dep of graph[n])inDeg[dep]=(inDeg[dep]||0)+1;const queue=nodes.filter(n=>inDeg[n]===0);const order=[];const steps=[];while(queue.length){const node=queue.shift();order.push(node);steps.push({processing:node,queue:[...queue]});for(const dep of graph[node]||[]){inDeg[dep]--;if(inDeg[dep]===0)queue.push(dep);}}return{order,steps,hasCycle:order.length!==nodes.length};}
const{order,steps}=topoSort(graph);
let html='<h3 style="color:#60a5fa;margin:0 0 12px">Kahn\\'s Topological Sort</h3>';
steps.forEach((s,i)=>{html+='<div style="margin-bottom:5px;padding:6px 10px;background:#1e293b;border-radius:4px;font-size:13px">Step '+(i+1)+': <b style="color:#f59e0b">'+s.processing+'</b>'+(s.queue.length?' <span style="color:#64748b">→ queue: ['+s.queue.join(', ')+']</span>':'')+'</div>';});
html+='<p style="color:#4ade80;margin-top:8px">Order: '+order.join(' → ')+'</p>';
display.innerHTML=html;`,
                outputHeight: 280,
              },
            ],
          },
        },
      },

      {
        id: 'JSNotebook',
        title: "Dijkstra & Topological Sort — JavaScript",
        caption: 'Build both algorithms step by step, then from scratch with a 9-test challenge.',
        props: {
          lesson: {
            title: "Dijkstra's and Kahn's in JavaScript",
            subtitle: 'Weighted shortest paths and dependency ordering.',
            cells: [
              {
                type: 'js',
                instruction: `## Step 1 — Dijkstra's Shortest Path

**Algorithm:**
1. Initialize dist: every node → Infinity, source → 0
2. While unvisited nodes remain:
   - Pick unvisited node \`u\` with smallest dist
   - Mark u visited
   - For each neighbor \`{to, w}\` of u: if \`dist[u] + w < dist[to]\`, update \`dist[to]\`
3. Return dist

This demo uses a simple O(V²) scan to find the next node. A heap makes it O((V+E) log V).`,
                html: `<div id="out" style="font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;padding:14px;background:#0f172a;color:#e2e8f0;box-sizing:border-box;font-family:monospace}.pass{color:#4ade80;margin:2px 0}.fail{color:#f87171;margin:2px 0}`,
                startCode: `const graph={A:[{to:'B',w:4},{to:'C',w:2}],B:[{to:'D',w:5},{to:'C',w:1}],C:[{to:'B',w:1},{to:'D',w:8},{to:'E',w:10}],D:[{to:'E',w:2}],E:[]};

function dijkstra(graph, start) {
  const dist = {};
  // TODO: initialize all nodes to Infinity, start to 0
  const visited = new Set();
  while (true) {
    // TODO: find unvisited node u with smallest dist[u]
    // if none found or dist[u] is Infinity: break
    // mark u visited
    // for each {to, w} in graph[u]:
    //   if dist[u] + w < dist[to]: update dist[to]
  }
  return dist;
}

const out=document.getElementById('out');
function test(l,g,e){const p=JSON.stringify(g)===JSON.stringify(e);out.innerHTML+=\`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: \${JSON.stringify(g)}</div>\`;}
const dist=dijkstra(graph,'A');
test('A→A',dist['A'],0); test('A→B',dist['B'],3); test('A→C',dist['C'],2);
test('A→D',dist['D'],8); test('A→E',dist['E'],10);`,
                solutionCode: `const graph={A:[{to:'B',w:4},{to:'C',w:2}],B:[{to:'D',w:5},{to:'C',w:1}],C:[{to:'B',w:1},{to:'D',w:8},{to:'E',w:10}],D:[{to:'E',w:2}],E:[]};
function dijkstra(graph,start){const dist={};for(const n of Object.keys(graph))dist[n]=Infinity;dist[start]=0;const visited=new Set();while(true){let u=null;for(const n of Object.keys(dist))if(!visited.has(n)&&(u===null||dist[n]<dist[u]))u=n;if(u===null||dist[u]===Infinity)break;visited.add(u);for(const{to,w}of graph[u]||[])if(dist[u]+w<dist[to])dist[to]=dist[u]+w;}return dist;}
const out=document.getElementById('out');
function test(l,g,e){const p=JSON.stringify(g)===JSON.stringify(e);out.innerHTML+=\`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: \${JSON.stringify(g)}</div>\`;}
const dist=dijkstra(graph,'A');test('A→A',dist['A'],0);test('A→B',dist['B'],3);test('A→C',dist['C'],2);test('A→D',dist['D'],8);test('A→E',dist['E'],10);`,
                outputHeight: 160,
              },
              {
                type: 'js',
                instruction: `## Step 2 — Topological Sort (Kahn's)

**Algorithm:**
1. Count in-degrees: for every edge A→B, increment inDegree[B]
2. Seed the queue with all nodes where inDegree === 0
3. While queue is non-empty: dequeue node, push to order, decrement each neighbor's in-degree, enqueue any that hit 0
4. If \`order.length !== graph node count\` → cycle exists (return hasCycle: true)`,
                html: `<div id="out" style="font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;padding:14px;background:#0f172a;color:#e2e8f0;box-sizing:border-box;font-family:monospace}.pass{color:#4ade80;margin:2px 0}.fail{color:#f87171;margin:2px 0}`,
                startCode: `const prereqs={'Math':['Algorithms'],'CS101':['Data Structures','Algorithms'],'Data Structures':['Algorithms'],'Algorithms':['Systems'],'Systems':[]};

function topoSort(graph) {
  const nodes = Object.keys(graph);
  const inDegree = {};
  // TODO: initialize inDegree to 0 for all nodes
  // for each node, for each neighbor: inDegree[neighbor]++

  // TODO: queue = nodes where inDegree === 0
  const queue = [];
  const order = [];

  // TODO: while queue has items:
  //   node = queue.shift(); order.push(node)
  //   for each dep in graph[node]: inDegree[dep]--; if 0 → push to queue

  return { order, hasCycle: order.length !== nodes.length };
}

const out=document.getElementById('out');
function test(l,g,e){const p=JSON.stringify(g)===JSON.stringify(e);out.innerHTML+=\`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: \${JSON.stringify(g)}</div>\`;}
const{order,hasCycle}=topoSort(prereqs);
test('no cycle',    hasCycle, false);
test('Systems last', order[order.length-1], 'Systems');
const cyclic={A:['B'],B:['C'],C:['A']};
test('cycle detected', topoSort(cyclic).hasCycle, true);`,
                solutionCode: `const prereqs={'Math':['Algorithms'],'CS101':['Data Structures','Algorithms'],'Data Structures':['Algorithms'],'Algorithms':['Systems'],'Systems':[]};
function topoSort(graph){const nodes=Object.keys(graph);const inDegree={};for(const n of nodes)inDegree[n]=0;for(const n of nodes)for(const dep of graph[n])inDegree[dep]=(inDegree[dep]||0)+1;const queue=nodes.filter(n=>inDegree[n]===0);const order=[];while(queue.length){const node=queue.shift();order.push(node);for(const dep of graph[node]||[]){inDegree[dep]--;if(inDegree[dep]===0)queue.push(dep);}}return{order,hasCycle:order.length!==nodes.length};}
const out=document.getElementById('out');
function test(l,g,e){const p=JSON.stringify(g)===JSON.stringify(e);out.innerHTML+=\`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: \${JSON.stringify(g)}</div>\`;}
const{order,hasCycle}=topoSort(prereqs);test('no cycle',hasCycle,false);test('Systems last',order[order.length-1],'Systems');const cyclic={A:['B'],B:['C'],C:['A']};test('cycle detected',topoSort(cyclic).hasCycle,true);`,
                outputHeight: 140,
              },
              {
                type: 'js',
                instruction: `## Challenge — Both Algorithms From Scratch

Write \`dijkstra(graph, start)\` and \`topoSort(graph)\` from memory. 9 tests verify both.`,
                html: `<div id="out" style="font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;padding:14px;background:#0f172a;color:#e2e8f0;box-sizing:border-box;font-family:monospace}.pass{color:#4ade80;margin:2px 0}.fail{color:#f87171;margin:2px 0}.banner{margin-top:12px;padding:10px 14px;border-radius:8px;font-size:13px}.banner.ok{background:#052e16;border:1px solid #166534;color:#4ade80}.banner.bad{background:#450a0a;border:1px solid #7f1d1d;color:#f87171}`,
                startCode: `function dijkstra(graph, start) { }
function topoSort(graph) { }

const out=document.getElementById('out');const results=[];
function test(l,g,e){const p=JSON.stringify(g)===JSON.stringify(e);results.push(p);out.innerHTML+=\`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: \${JSON.stringify(g)}\${p?'':' (want '+JSON.stringify(e)+')'}</div>\`;}
try{
  const wg={A:[{to:'B',w:4},{to:'C',w:2}],B:[{to:'D',w:5},{to:'C',w:1}],C:[{to:'B',w:1},{to:'D',w:8},{to:'E',w:10}],D:[{to:'E',w:2}],E:[]};
  const dist=dijkstra(wg,'A');
  test('dijkstra A→A',dist['A'],0);test('dijkstra A→B',dist['B'],3);test('dijkstra A→C',dist['C'],2);
  test('dijkstra A→D',dist['D'],8);test('dijkstra A→E',dist['E'],10);
  const dag={A:['C'],B:['C'],C:['D'],D:[]};
  const{order,hasCycle}=topoSort(dag);
  test('topo no cycle', hasCycle, false);
  test('topo C before D', order.indexOf('C')<order.indexOf('D'), true);
  test('topo A,B before C', order.indexOf('A')<order.indexOf('C')&&order.indexOf('B')<order.indexOf('C'), true);
  test('cycle detected', topoSort({X:['Y'],Y:['Z'],Z:['X']}).hasCycle, true);
  const all=results.every(Boolean);
  out.innerHTML+=\`<div class="banner \${all?'ok':'bad'}">\${all?'✓ All tests pass.':results.filter(Boolean).length+'/'+results.length+' passing.'}</div>\`;
}catch(e){out.innerHTML+='<div class="fail">Error: '+e.message+'</div>';}`,
                solutionCode: `function dijkstra(graph,start){const dist={};for(const n of Object.keys(graph))dist[n]=Infinity;dist[start]=0;const visited=new Set();while(true){let u=null;for(const n of Object.keys(dist))if(!visited.has(n)&&(u===null||dist[n]<dist[u]))u=n;if(u===null||dist[u]===Infinity)break;visited.add(u);for(const{to,w}of graph[u]||[])if(dist[u]+w<dist[to])dist[to]=dist[u]+w;}return dist;}
function topoSort(graph){const nodes=Object.keys(graph);const inDegree={};for(const n of nodes)inDegree[n]=0;for(const n of nodes)for(const dep of graph[n])inDegree[dep]=(inDegree[dep]||0)+1;const queue=nodes.filter(n=>inDegree[n]===0);const order=[];while(queue.length){const node=queue.shift();order.push(node);for(const dep of graph[node]||[]){inDegree[dep]--;if(inDegree[dep]===0)queue.push(dep);}}return{order,hasCycle:order.length!==nodes.length};}
const out=document.getElementById('out');const results=[];
function test(l,g,e){const p=JSON.stringify(g)===JSON.stringify(e);results.push(p);out.innerHTML+=\`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: \${JSON.stringify(g)}</div>\`;}
const wg={A:[{to:'B',w:4},{to:'C',w:2}],B:[{to:'D',w:5},{to:'C',w:1}],C:[{to:'B',w:1},{to:'D',w:8},{to:'E',w:10}],D:[{to:'E',w:2}],E:[]};const dist=dijkstra(wg,'A');
test('dijkstra A→A',dist['A'],0);test('dijkstra A→B',dist['B'],3);test('dijkstra A→C',dist['C'],2);test('dijkstra A→D',dist['D'],8);test('dijkstra A→E',dist['E'],10);
const dag={A:['C'],B:['C'],C:['D'],D:[]};const{order,hasCycle}=topoSort(dag);test('topo no cycle',hasCycle,false);test('topo C before D',order.indexOf('C')<order.indexOf('D'),true);test('topo A,B before C',order.indexOf('A')<order.indexOf('C')&&order.indexOf('B')<order.indexOf('C'),true);test('cycle detected',topoSort({X:['Y'],Y:['Z'],Z:['X']}).hasCycle,true);
const all=results.every(Boolean);out.innerHTML+=\`<div class="banner \${all?'ok':'bad'}">\${all?'✓ All tests pass.':results.filter(Boolean).length+'/'+results.length+' passing.'}</div>\`;`,
                outputHeight: 300,
              },
            ],
          },
        },
      },

      {
        id: 'PythonNotebook',
        title: "Dijkstra & Topological Sort — Python",
        caption: "heapq-powered Dijkstra and Kahn's sort in Python, with Dijkstra distance visualization.",
        props: {
          initialCells: [
            {
              id: 1,
              cellTitle: "Step 1 — Dijkstra with heapq",
              prose: [
                "Python's heapq gives a proper priority queue: heappush(heap, (dist, node)), heappop returns the smallest pair. This makes Dijkstra O((V+E) log V).",
              ],
              instructions: "Fill in dijkstra() using heapq. Return the dist dict.",
              code: `import heapq

graph = {
    'A': [('B', 4), ('C', 2)],
    'B': [('D', 5), ('C', 1)],
    'C': [('B', 1), ('D', 8), ('E', 10)],
    'D': [('E', 2)],
    'E': [],
}

def dijkstra(graph, start):
    dist = {node: float('inf') for node in graph}
    dist[start] = 0
    heap = [(0, start)]
    visited = set()
    # TODO: while heap:
    #   d, u = heapq.heappop(heap)
    #   if u in visited: continue
    #   visited.add(u)
    #   for v, w in graph.get(u, []):
    #     if d + w < dist[v]: dist[v] = d+w; heapq.heappush(heap, (dist[v], v))
    # return dist
    pass

dist = dijkstra(graph, 'A')
assert dist['A'] == 0
assert dist['B'] == 3
assert dist['C'] == 2
assert dist['D'] == 8
assert dist['E'] == 10
print("✓ dijkstra:", dist)`,
              output: "✓ dijkstra: {'A': 0, 'B': 3, 'C': 2, 'D': 8, 'E': 10}",
              status: 'idle',
              figureJson: null,
            },
            {
              id: 2,
              cellTitle: "Step 2 — Topological Sort (Kahn's)",
              prose: [
                "Same Kahn's algorithm as JavaScript. Use collections.deque for the queue. Return (order, has_cycle).",
              ],
              instructions: "Implement topo_sort(). Test both a valid DAG and a cyclic graph.",
              code: `from collections import deque

def topo_sort(graph):
    nodes = list(graph.keys())
    in_degree = {n: 0 for n in nodes}
    # TODO: count in-degrees
    # TODO: queue = deque of nodes with in_degree 0
    # TODO: drain queue, decrement neighbors, enqueue when they hit 0
    # has_cycle = len(order) != len(nodes)
    # return order, has_cycle
    pass

prereqs = {
    'Math': ['Algorithms'],
    'CS101': ['Data Structures', 'Algorithms'],
    'Data Structures': ['Algorithms'],
    'Algorithms': ['Systems'],
    'Systems': [],
}
order, has_cycle = topo_sort(prereqs)
assert has_cycle == False
assert order[-1] == 'Systems'

cyclic = {'A': ['B'], 'B': ['C'], 'C': ['A']}
_, has_cycle2 = topo_sort(cyclic)
assert has_cycle2 == True
print("✓ order:", ' → '.join(order))
print("✓ cycle detected:", has_cycle2)`,
              output: '✓ order: Math → CS101 → Data Structures → Algorithms → Systems\n✓ cycle detected: True',
              status: 'idle',
              figureJson: null,
            },
            {
              id: 3,
              cellTitle: 'From Scratch — Both Algorithms + Dijkstra Visualization',
              prose: [
                'Write dijkstra() and topo_sort() from memory. When assertions pass, opencalc draws the shortest distances from A as a bar chart.',
              ],
              instructions: 'Fill in both functions. The figure shows Dijkstra distances.',
              code: `import heapq
from collections import deque
from opencalc import Figure

def dijkstra(graph, start):
    pass  # your code — return dist dict

def topo_sort(graph):
    pass  # your code — return (order, has_cycle)

# Assertions
graph = {'A':[('B',4),('C',2)],'B':[('D',5),('C',1)],'C':[('B',1),('D',8),('E',10)],'D':[('E',2)],'E':[]}
dist = dijkstra(graph, 'A')
assert dist['A'] == 0
assert dist['B'] == 3
assert dist['C'] == 2
assert dist['D'] == 8
assert dist['E'] == 10

dag = {'A':['C'],'B':['C'],'C':['D'],'D':[]}
order, has_cycle = topo_sort(dag)
assert has_cycle == False
assert order.index('C') < order.index('D')
_, has_cycle2 = topo_sort({'X':['Y'],'Y':['Z'],'Z':['X']})
assert has_cycle2 == True
print("All assertions passed!")

# Visualize Dijkstra distances
fig = Figure()
fig.set_title("Shortest distances from A (Dijkstra)")
for i, node in enumerate(['A','B','C','D','E']):
    d = dist[node]
    fig.bar(i, d, label=f"{node}={d}", color="#60a5fa")
fig.show()`,
              output: 'All assertions passed!',
              status: 'idle',
              figureJson: null,
            },
          ],
        },
      },
    ],
  },
};
