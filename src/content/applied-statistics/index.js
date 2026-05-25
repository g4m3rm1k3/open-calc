import stat1_001 from './stat1-001-what-is-statistics.js';
import stat1_002 from './stat1-002-sampling-methods.js';
import stat1_003 from './stat1-003-study-design-and-bias.js';
import stat2_001 from './stat2-001-what-is-data-visualization.js';
import stat2_002 from './stat2-002-python-for-data-visualization.js';
import stat2_003 from './stat2-003-data-frames-with-pandas.js';
import stat2_004 from './stat2-004-bar-charts-and-pie-charts.js';
import stat2_005 from './stat2-005-scatter-plots-and-line-charts.js';
import stat2_006 from './stat2-006-data-visualization-example.js';
import stat3_001 from './stat3-001-measures-of-center.js';
import stat3_002 from './stat3-002-measures-of-spread.js';
import stat3_003 from './stat3-003-percentiles-and-quartiles.js';
import stat3_004 from './stat3-004-boxplots.js';
import stat3_005 from './stat3-005-frequency-tables-and-distributions.js';
import stat3_006 from './stat3-006-shape-of-a-distribution.js';

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

// Chapter 3: Descriptive Statistics
const STAT3 = {
  title: 'Descriptive Statistics',
  number: 'stat3',
  slug: 'descriptive-statistics',
  lessons: [
    stat3_001,
    stat3_002,
    stat3_003,
    stat3_004,
    stat3_005,
    stat3_006,
  ],
};

export default [STAT1, STAT2, STAT3];
