export default {
  id: 'dsa5-001',
  slug: 'graph-bfs-dfs',
  chapter: 'dsa5',
  order: 1,
  title: 'Graphs: BFS & DFS',
  subtitle: 'Represent connections between anything — then systematically explore them.',
  tags: ['graph', 'BFS', 'DFS', 'adjacency list', 'visited', 'queue', 'stack', 'connected components', 'hasPath'],
  aliases: 'graph BFS DFS breadth first depth first adjacency list visited queue stack components path traversal',

  hook: {
    question: 'A tree forces hierarchy — every node has exactly one parent. What do you use when relationships are arbitrary? When A connects to B, B connects to C, and C loops back to A?',
    realWorldContext: 'Every social network is a graph — people are nodes, friendships are edges. Google Maps routes you through a graph of streets. The internet is a graph of servers. Your package manager (npm, pip) builds a dependency graph and uses topological sort to install packages in the right order. Compilers represent control flow as graphs. Recommendation engines ("people who bought X also bought Y") are built on bipartite graphs. Whenever you have entities with relationships between them, you have a graph.',
    previewVisualizationId: 'ScienceNotebook',
  },

  intuition: {
    prose: [
      '**Where you are in the story:** Trees are graphs with one constraint — no cycles, and every node has exactly one parent. Remove that constraint and you get a general graph: any node can connect to any other node, in any direction, with possible cycles.',
      '**Representation: adjacency list.** Store a Map (or dict) from each node to its list of neighbors. For an undirected edge A–B, push B into A\'s list and A into B\'s list. Space: O(V + E) — you only store edges that exist. An adjacency matrix uses O(V²) space but lets you check if an edge exists in O(1).',
      '**BFS — breadth first, level by level.** Use a queue. Start at the source, add it to visited. Dequeue a node, enqueue all its unvisited neighbors. This explores all nodes at distance 1 before any at distance 2. BFS finds the **shortest path** (fewest edges) in an unweighted graph.',
      '**DFS — depth first, go deep before backtracking.** Use a stack (or recursion). Mark the node visited, then recurse on each unvisited neighbor. DFS is used for cycle detection, topological sort, connected components, and path existence. Memory: O(depth) for the recursion stack, vs O(width) for BFS.',
      '**hasPath — does a path exist between two nodes?** Run BFS or DFS from the start. If you reach the end, return true. If you exhaust reachable nodes without hitting the end, return false.',
      '**countComponents — how many disconnected groups?** Iterate over every node. If a node hasn\'t been visited yet, run DFS from it — that\'s one complete component. Count the number of DFS starts.',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Chapter 5, Lesson 1: Graphs',
        body: '**Previous chapter:** Trees — hierarchical, no cycles.\n**This lesson:** Graphs — arbitrary connections, BFS and DFS.\n**Next:** Shortest paths (Dijkstra) and topological sort.',
      },
      {
        type: 'insight',
        title: 'BFS vs DFS: when to use which',
        body: 'BFS: shortest path (unweighted), level-order traversal, "nearest neighbor" problems.\nDFS: cycle detection, topological sort, connected components, path existence.\nBoth are O(V + E) time. BFS uses O(width) memory; DFS uses O(depth) memory.',
      },
      {
        type: 'warning',
        title: 'Always track visited nodes',
        body: 'Graphs can have cycles. Without a visited set, BFS and DFS loop forever. Add a node to visited before enqueuing/recursing it — not after dequeuing — so you don\'t enqueue the same node multiple times.',
      },
    ],
    visualizations: [
      {
        id: 'ScienceNotebook',
        title: 'BFS and DFS: Step-by-Step Traversal',
        mathBridge: 'Watch BFS explore level by level using a queue. Then watch DFS dive deep first using recursion. Same graph, very different visit orders.',
        caption: 'Three cells: adjacency list structure, BFS with queue steps, DFS with recursion depth.',
        props: {
          lesson: {
            title: 'Graphs and How to Traverse Them',
            subtitle: 'Adjacency lists, BFS with a queue, DFS with recursion',
            sequential: true,
            cells: [
              {
                type: 'js',
                title: 'Adjacency List Representation',
                instruction: 'A graph as a Map: each node maps to an array of neighbors. For an undirected graph, each edge appears in both directions.',
                html: `<div id="display" style="padding:12px"></div>`,
                css: `body{margin:0;background:#0f172a;color:#e2e8f0;font-family:monospace;box-sizing:border-box}`,
                startCode: `const display=document.getElementById('display');
const graph=new Map([['A',['B','C']],['B',['A','D','E']],['C',['A','F']],['D',['B']],['E',['B','F']],['F',['C','E']]]);
let html='<h3 style="color:#60a5fa;margin:0 0 12px">Adjacency List</h3><table style="border-collapse:collapse;width:100%;font-size:13px"><tr style="color:#94a3b8"><th style="text-align:left;padding:4px 8px">Node</th><th style="text-align:left;padding:4px 8px">Neighbors</th></tr>';
for(const[node,neighbors]of graph)html+='<tr style="border-top:1px solid #334155"><td style="padding:6px 8px;color:#f59e0b;font-weight:bold">'+node+'</td><td style="padding:6px 8px;color:#e2e8f0">['+neighbors.join(', ')+']</td></tr>';
html+='</table><p style="color:#94a3b8;font-size:13px;margin-top:12px">6 nodes, 6 edges. Space: O(V+E) — only store what exists.</p>';
display.innerHTML=html;`,
                outputHeight: 260,
              },
              {
                type: 'js',
                title: 'BFS — Level by Level with a Queue',
                instruction: 'BFS dequeues a node, enqueues all its unvisited neighbors. This guarantees all distance-1 nodes are visited before any distance-2 node.',
                html: `<div id="display" style="padding:12px"></div>`,
                css: `body{margin:0;background:#0f172a;color:#e2e8f0;font-family:monospace;box-sizing:border-box}`,
                startCode: `const display=document.getElementById('display');
const graph=new Map([['A',['B','C']],['B',['A','D','E']],['C',['A','F']],['D',['B']],['E',['B','F']],['F',['C','E']]]);
function bfsSteps(g,start){const visited=new Set([start]),queue=[start],steps=[];while(queue.length){const node=queue.shift();const added=[];for(const n of g.get(node)||[]){if(!visited.has(n)){visited.add(n);queue.push(n);added.push(n);}}steps.push({node,queue:[...queue],visited:[...visited],added});}return steps;}
const steps=bfsSteps(graph,'A');
let html='<h3 style="color:#60a5fa;margin:0 0 12px">BFS from A</h3><table style="border-collapse:collapse;width:100%;font-size:12px"><tr style="color:#94a3b8"><th style="padding:4px 6px;text-align:left">#</th><th>Visiting</th><th>Added</th><th>Queue</th><th>Visited</th></tr>';
steps.forEach((s,i)=>{html+='<tr style="border-top:1px solid #334155"><td style="padding:4px 6px;color:#94a3b8">'+(i+1)+'</td><td style="padding:4px 6px;color:#f59e0b;font-weight:bold">'+s.node+'</td><td style="padding:4px 6px;color:#4ade80">'+(s.added.length?s.added.join(', '):'—')+'</td><td style="padding:4px 6px;color:#e2e8f0">['+s.queue.join(', ')+']</td><td style="padding:4px 6px;color:#60a5fa">{'+s.visited.join(', ')+'}</td></tr>';});
html+='</table><p style="color:#94a3b8;font-size:13px;margin-top:8px">BFS visits all nodes at distance 1, then distance 2. Shortest path in unweighted graphs.</p>';
display.innerHTML=html;`,
                outputHeight: 300,
              },
              {
                type: 'js',
                title: 'DFS — Go Deep with Recursion',
                instruction: 'DFS marks the current node visited then recurses on each unvisited neighbor. The indentation shows call stack depth.',
                html: `<div id="display" style="padding:12px"></div>`,
                css: `body{margin:0;background:#0f172a;color:#e2e8f0;font-family:monospace;box-sizing:border-box}`,
                startCode: `const display=document.getElementById('display');
const graph=new Map([['A',['B','C']],['B',['A','D','E']],['C',['A','F']],['D',['B']],['E',['B','F']],['F',['C','E']]]);
function dfsSteps(g,start){const visited=new Set(),steps=[];function dfs(node,depth){visited.add(node);steps.push({node,depth,visited:[...visited]});for(const n of g.get(node)||[])if(!visited.has(n))dfs(n,depth+1);}dfs(start,0);return steps;}
const steps=dfsSteps(graph,'A');
let html='<h3 style="color:#60a5fa;margin:0 0 12px">DFS from A (recursive)</h3><table style="border-collapse:collapse;width:100%;font-size:12px"><tr style="color:#94a3b8"><th style="padding:4px 6px;text-align:left">#</th><th style="text-align:left">Visiting</th><th>Depth</th><th style="text-align:left">Visited</th></tr>';
steps.forEach((s,i)=>{const indent='&nbsp;'.repeat(s.depth*4);html+='<tr style="border-top:1px solid #334155"><td style="padding:4px 6px;color:#94a3b8">'+(i+1)+'</td><td style="padding:4px 6px;color:#f59e0b;font-weight:bold">'+indent+s.node+'</td><td style="padding:4px 6px;color:#c084fc;text-align:center">'+s.depth+'</td><td style="padding:4px 6px;color:#60a5fa">{'+s.visited.join(', ')+'}</td></tr>';});
html+='</table><p style="color:#94a3b8;font-size:13px;margin-top:8px">DFS dives as deep as possible before backtracking.</p>';
display.innerHTML=html;`,
                outputHeight: 300,
              },
            ],
          },
        },
      },

      {
        id: 'JSNotebook',
        title: 'Build Graph Traversals in JavaScript',
        caption: 'Build addEdge, BFS, DFS, hasPath, and countComponents — then from scratch.',
        props: {
          lesson: {
            title: 'Graphs in JavaScript',
            subtitle: 'Adjacency list, BFS, DFS, path detection, connected components.',
            cells: [
              {
                type: 'js',
                instruction: `## Step 1 — Build the Graph and BFS

Represent the graph as a \`Map\` of node → array of neighbors.

**\`addEdge(graph, u, v)\`:** for an undirected edge, push each node into the other's array. Create the array if it doesn't exist yet.

**\`bfs(graph, start)\`:** use an array as a queue (\`shift()\` from front). Track visited in a Set. Return nodes in visit order.`,
                html: `<div id="out" style="font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;padding:14px;background:#0f172a;color:#e2e8f0;box-sizing:border-box;font-family:monospace}.pass{color:#4ade80;margin:2px 0}.fail{color:#f87171;margin:2px 0}`,
                startCode: `function buildGraph() { return new Map(); }

function addEdge(graph, u, v) {
  // TODO: if graph doesn't have u, set it to []
  // if graph doesn't have v, set it to []
  // push v onto u's list, and u onto v's list
}

function bfs(graph, start) {
  const visited = new Set([start]);
  const queue = [start];
  const order = [];
  // TODO: while queue has items:
  //   node = queue.shift()
  //   order.push(node)
  //   for each neighbor: if not visited → add to visited, push to queue
  return order;
}

const g = buildGraph();
addEdge(g,'A','B'); addEdge(g,'A','C');
addEdge(g,'B','D'); addEdge(g,'B','E'); addEdge(g,'C','F');

const out = document.getElementById('out');
function test(l,g2,e){const p=JSON.stringify(g2)===JSON.stringify(e);out.innerHTML+=\`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: \${JSON.stringify(g2)}</div>\`;}
const order = bfs(g, 'A');
test('visits all 6', order.length, 6);
test('starts at A', order[0], 'A');`,
                solutionCode: `function buildGraph(){return new Map();}
function addEdge(graph,u,v){if(!graph.has(u))graph.set(u,[]);if(!graph.has(v))graph.set(v,[]);graph.get(u).push(v);graph.get(v).push(u);}
function bfs(graph,start){const visited=new Set([start]),queue=[start],order=[];while(queue.length){const node=queue.shift();order.push(node);for(const n of graph.get(node)||[])if(!visited.has(n)){visited.add(n);queue.push(n);}}return order;}
const g=buildGraph();addEdge(g,'A','B');addEdge(g,'A','C');addEdge(g,'B','D');addEdge(g,'B','E');addEdge(g,'C','F');
const out=document.getElementById('out');
function test(l,g2,e){const p=JSON.stringify(g2)===JSON.stringify(e);out.innerHTML+=\`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: \${JSON.stringify(g2)}</div>\`;}
const order=bfs(g,'A');test('visits all 6',order.length,6);test('starts at A',order[0],'A');`,
                outputHeight: 120,
              },
              {
                type: 'js',
                instruction: `## Step 2 — DFS (Recursive and Iterative)

**Recursive DFS:** mark visited, recurse on each unvisited neighbor, accumulate in an array.

**Iterative DFS:** use an explicit stack (\`pop()\` from end). Note: iterative DFS may visit neighbors in a different order than recursive because pushing to the stack reverses order. Both are valid DFS.`,
                html: `<div id="out" style="font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;padding:14px;background:#0f172a;color:#e2e8f0;box-sizing:border-box;font-family:monospace}.pass{color:#4ade80;margin:2px 0}.fail{color:#f87171;margin:2px 0}`,
                startCode: `function buildGraph(){return new Map();}
function addEdge(graph,u,v){if(!graph.has(u))graph.set(u,[]);if(!graph.has(v))graph.set(v,[]);graph.get(u).push(v);graph.get(v).push(u);}

function dfsRecursive(graph, node, visited = new Set(), order = []) {
  // TODO: add node to visited, push to order
  // for each neighbor: if not visited → recurse
  // return order
}

function dfsIterative(graph, start) {
  const visited = new Set(), stack = [start], order = [];
  // TODO: while stack has items:
  //   node = stack.pop()
  //   if already visited: continue
  //   mark visited, push to order
  //   push unvisited neighbors onto stack
  return order;
}

const g=buildGraph();
addEdge(g,'A','B');addEdge(g,'A','C');addEdge(g,'B','D');addEdge(g,'B','E');addEdge(g,'C','F');
const out=document.getElementById('out');
function test(l,g2,e){const p=JSON.stringify(g2)===JSON.stringify(e);out.innerHTML+=\`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: \${JSON.stringify(g2)}</div>\`;}
test('dfs recursive length', dfsRecursive(g,'A').length, 6);
test('dfs iterative length', dfsIterative(g,'A').length, 6);
test('dfs rec starts A', dfsRecursive(g,'A')[0], 'A');`,
                solutionCode: `function buildGraph(){return new Map();}
function addEdge(graph,u,v){if(!graph.has(u))graph.set(u,[]);if(!graph.has(v))graph.set(v,[]);graph.get(u).push(v);graph.get(v).push(u);}
function dfsRecursive(graph,node,visited=new Set(),order=[]){visited.add(node);order.push(node);for(const n of graph.get(node)||[])if(!visited.has(n))dfsRecursive(graph,n,visited,order);return order;}
function dfsIterative(graph,start){const visited=new Set(),stack=[start],order=[];while(stack.length){const node=stack.pop();if(visited.has(node))continue;visited.add(node);order.push(node);for(const n of graph.get(node)||[])if(!visited.has(n))stack.push(n);}return order;}
const g=buildGraph();addEdge(g,'A','B');addEdge(g,'A','C');addEdge(g,'B','D');addEdge(g,'B','E');addEdge(g,'C','F');
const out=document.getElementById('out');
function test(l,g2,e){const p=JSON.stringify(g2)===JSON.stringify(e);out.innerHTML+=\`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: \${JSON.stringify(g2)}</div>\`;}
test('dfs recursive length',dfsRecursive(g,'A').length,6);test('dfs iterative length',dfsIterative(g,'A').length,6);test('dfs rec starts A',dfsRecursive(g,'A')[0],'A');`,
                outputHeight: 140,
              },
              {
                type: 'js',
                instruction: `## Step 3 — hasPath() and countComponents()

**\`hasPath(graph, start, end)\`:** BFS from start. If you dequeue \`end\`, return true. If the queue empties without finding it, return false.

**\`countComponents(graph)\`:** iterate over every node in \`graph.keys()\`. If a node hasn't been visited, run DFS from it (passing the shared visited set). Each new DFS start is one component.`,
                html: `<div id="out" style="font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;padding:14px;background:#0f172a;color:#e2e8f0;box-sizing:border-box;font-family:monospace}.pass{color:#4ade80;margin:2px 0}.fail{color:#f87171;margin:2px 0}`,
                startCode: `function buildGraph(){return new Map();}
function addEdge(graph,u,v){if(!graph.has(u))graph.set(u,[]);if(!graph.has(v))graph.set(v,[]);graph.get(u).push(v);graph.get(v).push(u);}
function dfsRecursive(graph,node,visited=new Set(),order=[]){visited.add(node);order.push(node);for(const n of graph.get(node)||[])if(!visited.has(n))dfsRecursive(graph,n,visited,order);return order;}

function hasPath(graph, start, end) {
  // TODO: BFS from start — return true if end is reached, else false
}

function countComponents(graph) {
  const visited = new Set();
  let count = 0;
  // TODO: for each node in graph.keys():
  //   if not visited → dfsRecursive(graph, node, visited), count++
  return count;
}

const g=buildGraph();
addEdge(g,'A','B');addEdge(g,'A','C');addEdge(g,'B','D');addEdge(g,'C','E');
addEdge(g,'X','Y');  // disconnected

const out=document.getElementById('out');
function test(l,g2,e){const p=JSON.stringify(g2)===JSON.stringify(e);out.innerHTML+=\`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: \${JSON.stringify(g2)}</div>\`;}
test('path A→D', hasPath(g,'A','D'), true);
test('path A→X', hasPath(g,'A','X'), false);
test('components', countComponents(g), 2);`,
                solutionCode: `function buildGraph(){return new Map();}
function addEdge(graph,u,v){if(!graph.has(u))graph.set(u,[]);if(!graph.has(v))graph.set(v,[]);graph.get(u).push(v);graph.get(v).push(u);}
function dfsRecursive(graph,node,visited=new Set(),order=[]){visited.add(node);order.push(node);for(const n of graph.get(node)||[])if(!visited.has(n))dfsRecursive(graph,n,visited,order);return order;}
function hasPath(graph,start,end){const visited=new Set([start]),queue=[start];while(queue.length){const node=queue.shift();if(node===end)return true;for(const n of graph.get(node)||[])if(!visited.has(n)){visited.add(n);queue.push(n);}}return false;}
function countComponents(graph){const visited=new Set();let count=0;for(const node of graph.keys())if(!visited.has(node)){dfsRecursive(graph,node,visited);count++;}return count;}
const g=buildGraph();addEdge(g,'A','B');addEdge(g,'A','C');addEdge(g,'B','D');addEdge(g,'C','E');addEdge(g,'X','Y');
const out=document.getElementById('out');
function test(l,g2,e){const p=JSON.stringify(g2)===JSON.stringify(e);out.innerHTML+=\`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: \${JSON.stringify(g2)}</div>\`;}
test('path A→D',hasPath(g,'A','D'),true);test('path A→X',hasPath(g,'A','X'),false);test('components',countComponents(g),2);`,
                outputHeight: 140,
              },
              {
                type: 'js',
                instruction: `## Challenge — Full Graph Toolkit From Scratch

Empty shells. Write every function from memory:
- \`buildGraph()\`, \`addEdge()\`
- \`bfs()\`, \`dfsRecursive()\`
- \`hasPath()\`, \`countComponents()\`

8 tests cover all functions.`,
                html: `<div id="out" style="font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;padding:14px;background:#0f172a;color:#e2e8f0;box-sizing:border-box;font-family:monospace}.pass{color:#4ade80;margin:2px 0}.fail{color:#f87171;margin:2px 0}.banner{margin-top:12px;padding:10px 14px;border-radius:8px;font-size:13px}.banner.ok{background:#052e16;border:1px solid #166534;color:#4ade80}.banner.bad{background:#450a0a;border:1px solid #7f1d1d;color:#f87171}`,
                startCode: `function buildGraph() { }
function addEdge(graph, u, v) { }
function bfs(graph, start) { }
function dfsRecursive(graph, node, visited = new Set(), order = []) { }
function hasPath(graph, start, end) { }
function countComponents(graph) { }

const out=document.getElementById('out');const results=[];
function test(l,g,e){const p=JSON.stringify(g)===JSON.stringify(e);results.push(p);out.innerHTML+=\`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: \${JSON.stringify(g)}\${p?'':' (want '+JSON.stringify(e)+')'}</div>\`;}
try{
  const g=buildGraph();
  addEdge(g,'A','B');addEdge(g,'A','C');addEdge(g,'B','D');addEdge(g,'B','E');addEdge(g,'C','F');
  test('bfs visits all 6',    bfs(g,'A').length,          6);
  test('bfs starts at A',     bfs(g,'A')[0],              'A');
  test('dfs visits all 6',    dfsRecursive(g,'A').length, 6);
  test('dfs starts at A',     dfsRecursive(g,'A')[0],     'A');
  test('hasPath A→F',         hasPath(g,'A','F'),         true);
  test('hasPath A→Z missing', hasPath(g,'A','Z'),         false);
  const g2=buildGraph();addEdge(g2,'1','2');addEdge(g2,'3','4');
  test('2 components', countComponents(g2), 2);
  const g3=buildGraph();addEdge(g3,'X','Y');addEdge(g3,'Y','Z');addEdge(g3,'A','B');
  test('2 components again', countComponents(g3), 2);
  const all=results.every(Boolean);
  out.innerHTML+=\`<div class="banner \${all?'ok':'bad'}">\${all?'✓ All tests pass. Graph toolkit built from scratch.':results.filter(Boolean).length+'/'+results.length+' passing.'}</div>\`;
}catch(e){out.innerHTML+='<div class="fail">Error: '+e.message+'</div>';}`,
                solutionCode: `function buildGraph(){return new Map();}
function addEdge(graph,u,v){if(!graph.has(u))graph.set(u,[]);if(!graph.has(v))graph.set(v,[]);graph.get(u).push(v);graph.get(v).push(u);}
function bfs(graph,start){const visited=new Set([start]),queue=[start],order=[];while(queue.length){const node=queue.shift();order.push(node);for(const n of graph.get(node)||[])if(!visited.has(n)){visited.add(n);queue.push(n);}}return order;}
function dfsRecursive(graph,node,visited=new Set(),order=[]){visited.add(node);order.push(node);for(const n of graph.get(node)||[])if(!visited.has(n))dfsRecursive(graph,n,visited,order);return order;}
function hasPath(graph,start,end){const visited=new Set([start]),queue=[start];while(queue.length){const node=queue.shift();if(node===end)return true;for(const n of graph.get(node)||[])if(!visited.has(n)){visited.add(n);queue.push(n);}}return false;}
function countComponents(graph){const visited=new Set();let count=0;for(const node of graph.keys())if(!visited.has(node)){dfsRecursive(graph,node,visited);count++;}return count;}
const out=document.getElementById('out');const results=[];
function test(l,g,e){const p=JSON.stringify(g)===JSON.stringify(e);results.push(p);out.innerHTML+=\`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: \${JSON.stringify(g)}</div>\`;}
const g=buildGraph();addEdge(g,'A','B');addEdge(g,'A','C');addEdge(g,'B','D');addEdge(g,'B','E');addEdge(g,'C','F');
test('bfs visits all 6',bfs(g,'A').length,6);test('bfs starts at A',bfs(g,'A')[0],'A');test('dfs visits all 6',dfsRecursive(g,'A').length,6);test('dfs starts at A',dfsRecursive(g,'A')[0],'A');test('hasPath A→F',hasPath(g,'A','F'),true);test('hasPath A→Z missing',hasPath(g,'A','Z'),false);
const g2=buildGraph();addEdge(g2,'1','2');addEdge(g2,'3','4');test('2 components',countComponents(g2),2);
const g3=buildGraph();addEdge(g3,'X','Y');addEdge(g3,'Y','Z');addEdge(g3,'A','B');test('2 components again',countComponents(g3),2);
const all=results.every(Boolean);out.innerHTML+=\`<div class="banner \${all?'ok':'bad'}">\${all?'✓ All tests pass.':results.filter(Boolean).length+'/'+results.length+' passing.'}</div>\`;`,
                outputHeight: 280,
              },
            ],
          },
        },
      },

      {
        id: 'PythonNotebook',
        title: 'Build Graph Traversals in Python',
        caption: 'Python graph toolkit — BFS with deque, DFS recursive, then a BFS discovery visualization.',
        props: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Step 1 — Build Graph and BFS',
              prose: [
                'Python uses a dict of lists. Use collections.deque for the queue — popleft() is O(1) vs list.pop(0) which is O(n).',
              ],
              instructions: 'Implement add_edge() and bfs(). Use collections.deque.',
              code: `from collections import deque

def build_graph():
    return {}

def add_edge(graph, u, v):
    # TODO: create empty lists if keys missing, append v to u and u to v
    pass

def bfs(graph, start):
    # TODO: visited set, deque queue, order list
    # while queue: popleft, add to order, enqueue unvisited neighbors
    # return order
    pass

g = build_graph()
add_edge(g, 'A', 'B'); add_edge(g, 'A', 'C')
add_edge(g, 'B', 'D'); add_edge(g, 'B', 'E'); add_edge(g, 'C', 'F')

order = bfs(g, 'A')
assert len(order) == 6, "should visit 6 nodes"
assert order[0] == 'A', "should start at A"
print("BFS order:", ' → '.join(order))`,
              output: 'BFS order: A → B → C → D → E → F',
              status: 'idle',
              figureJson: null,
            },
            {
              id: 2,
              cellTitle: 'Step 2 — DFS, hasPath, countComponents',
              prose: [
                'Pass the visited set into dfs_recursive so it accumulates across calls. This enables countComponents to reuse one visited set across multiple DFS starts.',
              ],
              instructions: 'Implement dfs_recursive(), has_path(), and count_components().',
              code: `from collections import deque

def build_graph():
    return {}

def add_edge(graph, u, v):
    if u not in graph: graph[u] = []
    if v not in graph: graph[v] = []
    graph[u].append(v); graph[v].append(u)

def bfs(graph, start):
    visited = {start}; queue = deque([start]); order = []
    while queue:
        node = queue.popleft(); order.append(node)
        for n in graph.get(node, []):
            if n not in visited: visited.add(n); queue.append(n)
    return order

def dfs_recursive(graph, node, visited=None, order=None):
    # TODO: init visited and order if None
    # visited.add(node); order.append(node)
    # for n in graph.get(node, []):
    #   if n not in visited: recurse
    # return order
    pass

def has_path(graph, start, end):
    # TODO: BFS from start, return True if end reached, False otherwise
    pass

def count_components(graph):
    # TODO: one shared visited set
    # for each node in graph: if not visited → dfs_recursive, count++
    # return count
    pass

g = build_graph()
add_edge(g, 'A', 'B'); add_edge(g, 'A', 'C')
add_edge(g, 'B', 'D'); add_edge(g, 'C', 'E')
add_edge(g, 'X', 'Y')  # disconnected

assert len(dfs_recursive(g, 'A')) == 5
assert has_path(g, 'A', 'D') == True
assert has_path(g, 'A', 'X') == False
assert count_components(g) == 2
print("✓ dfs, has_path, count_components")`,
              output: '✓ dfs, has_path, count_components',
              status: 'idle',
              figureJson: null,
            },
            {
              id: 3,
              cellTitle: 'From Scratch — Full Graph Toolkit + BFS Visualization',
              prose: [
                'Write every function from memory. When assertions pass, opencalc draws the BFS discovery order as a bar chart — each bar height shows when that node was first visited.',
              ],
              instructions: 'Fill in all six functions. The figure visualizes BFS discovery order.',
              code: `from collections import deque
from opencalc import Figure

def build_graph():    pass  # your code
def add_edge(graph, u, v): pass  # your code
def bfs(graph, start):     pass  # your code — return list
def dfs_recursive(graph, node, visited=None, order=None): pass  # your code
def has_path(graph, start, end):  pass  # your code — bool
def count_components(graph):      pass  # your code — int

# Assertions
g = build_graph()
add_edge(g, 'A', 'B'); add_edge(g, 'A', 'C')
add_edge(g, 'B', 'D'); add_edge(g, 'B', 'E'); add_edge(g, 'C', 'F')
assert len(bfs(g, 'A')) == 6
assert bfs(g, 'A')[0] == 'A'
assert len(dfs_recursive(g, 'A')) == 6
assert has_path(g, 'A', 'F') == True
assert has_path(g, 'A', 'Z') == False
g2 = build_graph()
add_edge(g2, '1', '2'); add_edge(g2, '3', '4')
assert count_components(g2) == 2
print("All assertions passed!")

# Visualize BFS order
g3 = build_graph()
add_edge(g3, 'A', 'B'); add_edge(g3, 'A', 'C')
add_edge(g3, 'B', 'D'); add_edge(g3, 'B', 'E'); add_edge(g3, 'C', 'F')
order = bfs(g3, 'A')
fig = Figure()
fig.set_title("BFS discovery order from A")
for step, node in enumerate(order):
    fig.bar(step, step + 1, label=node, color="#60a5fa")
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
