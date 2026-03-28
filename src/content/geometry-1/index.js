import introgeometry from './intro-geometry.js';
import pointslinesplanes from './points-lines-planes.js';
import anglessegments from './angles-segments.js';
import parallellines from './parallel-lines.js';
import trianglesum from './triangle-angle-sum.js';
import congruence from './congruence.js';
import pythagoras from './pythagorean-theorem.js';

export default {
  id: 'geometry-1',
  number: 'geometry-1',
  title: 'Geometry: 1',
  slug: 'geometry-1',
  color: 'indigo',
  lessons: [
    introgeometry,
    pointslinesplanes,
    anglessegments,
    parallellines,
    trianglesum,
    congruence,
    pythagoras
  ]
};