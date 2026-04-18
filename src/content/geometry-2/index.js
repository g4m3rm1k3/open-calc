import logicStatements from './geo-2-1-logic-statements.js';
import circleTheorems from './geo-2-1-circle-theorems.js';
import constructions from './geo-2-2-constructions.js';
import introProofs from './geo-2-3-intro-to-proofs.js';
import { GEO_2_PARALLEL_DEFAULT as parallelDeeps, GEO_2_SIMILARITY_DEFAULT as similarity } from './geo-2-parallel-and-similarity.js';
import areasArcs from './geo-2-4-areas-arcs.js';

export default {
  id: 'geometry-2',
  number: 'geometry-2',
  title: 'Geometry: Chapter 2',
  slug: 'geometry-2',
  color: 'indigo',
  lessons: [
    logicStatements,
    circleTheorems,
    constructions,
    introProofs,
    parallelDeeps,
    similarity,
    areasArcs
  ]
};