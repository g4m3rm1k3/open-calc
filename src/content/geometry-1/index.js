import foundations from './geo-1-1-foundations.js';
import pointslinesplanes from './points-lines-planes.js';
import anglessegments from './geo-1-3-angles-segments.js';
import parallellines from './geo-1-4-parallel-lines.js';
import trianglesum from './geo-1-5-triangle-angle-sum.js';
import congruence from './geo-1-6-congruence.js';
import pythagoras from './geo-1-7-pythagorean-theorem.js';

export default {
  id: 'geometry-1',
  number: 'geometry-1',
  title: 'Geometry: 1',
  slug: 'geometry-1',
  color: 'indigo',
  lessons: [
    foundations,
    pointslinesplanes,
    anglessegments,
    parallellines,
    trianglesum,
    congruence,
    pythagoras
  ]
};