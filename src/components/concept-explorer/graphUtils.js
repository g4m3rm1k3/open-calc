// Pure helpers over the concept DAG (topics keyed by id, each with a `prereqs: string[]`).

export function getUsedBy(topicId, topics) {
  return topics.filter(t => t.prereqs.includes(topicId)).map(t => t.id);
}

// DFS pre-order over prereqs, deduped, excluding the root. Lists each concept
// immediately followed by what *it* depends on — higher level first, lower level after.
export function flattenPrereqsTopDown(topicId, topicMap) {
  const seen = new Set([topicId]);
  const order = [];

  function visit(id) {
    const topic = topicMap[id];
    if (!topic) return;
    for (const prereqId of topic.prereqs) {
      if (seen.has(prereqId)) continue;
      seen.add(prereqId);
      order.push(prereqId);
      visit(prereqId);
    }
  }

  visit(topicId);
  return order;
}

function transitivePrereqCount(topicId, topicMap) {
  const seen = new Set([topicId]);
  let count = 0;

  function visit(id) {
    const topic = topicMap[id];
    if (!topic) return;
    for (const prereqId of topic.prereqs) {
      if (seen.has(prereqId)) continue;
      seen.add(prereqId);
      count += 1;
      visit(prereqId);
    }
  }

  visit(topicId);
  return count;
}

function longestPrereqChain(topicId, topicMap) {
  const topic = topicMap[topicId];
  if (!topic || topic.prereqs.length === 0) return 0;
  return 1 + Math.max(...topic.prereqs.map(p => longestPrereqChain(p, topicMap)));
}

// Heuristic, not authored data: deeper dependency chains and foundations-adjacent
// categories skew easier; long chains through spectral/decompositions skew harder.
export function computeDifficulty(topicId, topicMap) {
  const topic = topicMap[topicId];
  if (!topic) return 'Beginner';
  const depth = longestPrereqChain(topicId, topicMap);
  if (topic.category === 'foundations' && depth <= 2) return 'Beginner';
  if (depth <= 2) return 'Beginner';
  if (depth <= 5) return 'Intermediate';
  return 'Advanced';
}

// Heuristic estimate in minutes, derived from the size of the transitive
// prereq closure — not an authored value.
export function computeEstimatedTime(topicId, topicMap) {
  const count = transitivePrereqCount(topicId, topicMap);
  const low = 10 + count * 3;
  const high = low + 10;
  return `${low}–${high} min`;
}
