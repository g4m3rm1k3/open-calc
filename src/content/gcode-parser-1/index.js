import coordinateFrames from './01-coordinate-frames.js'
import vectorsAndPoints from './02-vectors-and-points.js'
import transformations from './03-transformations.js'
import boundingBoxes from './04-bounding-boxes.js'
import linesAndArcs from './05-lines-and-arcs.js'

export default [
  {
    number: 'gcp-1',
    title: 'Math & Geometry Foundations for Toolpaths',
    course: 'gcode-parser-1',
    lessons: [coordinateFrames, vectorsAndPoints, transformations, boundingBoxes, linesAndArcs],
  },
]
