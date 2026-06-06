import elec1_001 from './elec1-001-kirchhoffs-voltage-law.js';
import elec1_002 from './elec1-002-kirchhoffs-current-law.js';
import elec1_003 from './elec1-003-network-analysis.js';
import elec1_004 from './elec1-004-thevenin-norton.js';
import elec1_005 from './elec1-005-capacitors.js';
import elec1_006 from './elec1-006-rc-circuits.js';
import elec1_007 from './elec1-007-inductors.js';
import elec1_008 from './elec1-008-rl-circuits.js';
import elec1_009 from './elec1-009-magnetism.js';
import elec1_010 from './elec1-010-dc-power-sources.js';

const ELEC1 = {
  title: 'DC Electricity',
  number: 'elec1',
  slug: 'dc-electricity',
  course: 'elec-1',
  lessons: [
    elec1_001,
    elec1_002,
    elec1_003,
    elec1_004,
    elec1_005,
    elec1_006,
    elec1_007,
    elec1_008,
    elec1_009,
    elec1_010,
  ],
};

export default [ELEC1];
