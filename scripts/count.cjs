const fs = require('fs');
const content = fs.readFileSync('inject-calc-series.cjs', 'utf8');

const match = content.match(/const newVideos = (\[[\s\S]*?\]);/);
const arr = eval(match[1]);

console.log("Total in array:", arr.length);

const mappingsMatch = content.match(/const mappings = (\{[\s\S]*?\});/);
const mappings = eval('(' + mappingsMatch[1] + ')');

console.log("Total in mappings:", Object.keys(mappings).length);

const unmapped = arr.filter(v => !mappings[v.title]);
if (unmapped.length > 0) {
  console.log("Unmapped videos:", unmapped.length);
  unmapped.forEach(u => console.log(u.title));
}
