import fs from 'fs';
import obj from './src/content/discrete-math/01-propositions-and-proof-techniques.js';
fs.writeFileSync('out.txt', JSON.stringify(obj, null, 2), 'utf8');
