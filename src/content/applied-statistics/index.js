import stat1_001 from './stat1-001-what-is-statistics.js';
import stat1_002 from './stat1-002-sampling-methods.js';
import stat1_003 from './stat1-003-study-design-and-bias.js';
import stat2_001 from './stat2-001-what-is-data-visualization.js';
import stat2_002 from './stat2-002-python-for-data-visualization.js';
import stat2_003 from './stat2-003-data-frames-with-pandas.js';
import stat2_004 from './stat2-004-bar-charts-and-pie-charts.js';
import stat2_005 from './stat2-005-scatter-plots-and-line-charts.js';
import stat2_006 from './stat2-006-data-visualization-example.js';

// Chapter 1: Foundations of Statistical Thinking
const STAT1 = {
  title: 'Foundations of Statistical Thinking',
  number: 'stat1',
  slug: 'foundations-of-statistical-thinking',
  lessons: [
    stat1_001,
    stat1_002,
    stat1_003,
  ],
};

// Chapter 2: Data Visualization
const STAT2 = {
  title: 'Data Visualization',
  number: 'stat2',
  slug: 'data-visualization',
  lessons: [
    stat2_001,
    stat2_002,
    stat2_003,
    stat2_004,
    stat2_005,
    stat2_006,
  ],
};

export default [STAT1, STAT2];
