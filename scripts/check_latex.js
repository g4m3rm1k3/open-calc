import fs from 'fs';
import path from 'path';

import obj from './src/content/discrete-math/01-propositions-and-proof-techniques.js';

function crawl(o, pathName) {
  if (typeof o === 'string') {
    if (o.includes('\\')) console.log(`${pathName} has backslashes:`, JSON.stringify(o));
    if (o.includes('$')) console.log(`${pathName} has dollars:`, JSON.stringify(o));
  } else if (Array.isArray(o)) {
    o.forEach((item, index) => crawl(item, `${pathName}[${index}]`));
  } else if (typeof o === 'object' && o !== null) {
    for (let key in o) {
      crawl(o[key], `${pathName}.${key}`);
    }
  }
}

crawl(obj, 'root');
