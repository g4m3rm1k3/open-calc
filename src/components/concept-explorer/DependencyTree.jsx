// Pure precompute: walk the DAG once and decide, per node, whether its
// subtree gets drawn out or just referenced ("see above"). This has to be a
// plain function rather than mutating state inside the recursive render —
// React can invoke component functions more than once per commit (e.g. dev
// StrictMode), and a Set shared across those invocations via props would get
// double-mutated, marking even first-time nodes as already seen.
function buildTree(topicId, topicMap) {
  const expanded = new Set([topicId]);

  function build(id) {
    const topic = topicMap[id];
    if (!topic) return [];
    return topic.prereqs.map(prereqId => {
      const alreadyShown = expanded.has(prereqId);
      if (!alreadyShown) expanded.add(prereqId);
      const prereqTopic = topicMap[prereqId];
      return {
        id: prereqId,
        title: prereqTopic?.title ?? prereqId,
        alreadyShown: alreadyShown && (prereqTopic?.prereqs.length ?? 0) > 0,
        children: alreadyShown ? [] : build(prereqId),
      };
    });
  }

  return build(topicId);
}

function TreeLines({ nodes, prefix }) {
  return nodes.map((node, i) => {
    const isLast = i === nodes.length - 1;
    const connector = isLast ? '└── ' : '├── ';
    const childPrefix = prefix + (isLast ? '    ' : '│   ');
    return (
      <div key={node.id}>
        <div className="text-gray-300">
          <span className="text-gray-600">{prefix}{connector}</span>
          {node.title}
          {node.alreadyShown && <span className="text-gray-600 italic"> (see above)</span>}
        </div>
        <TreeLines nodes={node.children} prefix={childPrefix} />
      </div>
    );
  });
}

// Static, read-only diagram of the full transitive dependency tree for a topic.
// Intentionally not interactive — this is a reference map, not another set of
// nested expandable cards.
export default function DependencyTree({ topicId, topicMap }) {
  const topic = topicMap[topicId];
  if (!topic) return null;
  const tree = buildTree(topicId, topicMap);

  return (
    <div className="rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 font-mono text-xs leading-6 overflow-x-auto">
      <div className="text-white font-semibold mb-1">{topic.title}</div>
      {tree.length === 0 ? (
        <div className="text-gray-500 italic">(no prerequisites — foundational concept)</div>
      ) : (
        <TreeLines nodes={tree} prefix="" />
      )}
    </div>
  );
}
