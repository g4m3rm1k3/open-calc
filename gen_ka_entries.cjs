const fs = require('fs');
const videos = JSON.parse(fs.readFileSync('incomplete ideas/calc videos.json', 'utf8'));
let output = '';
videos.forEach(v => {
  const match = v.embedCode.match(/src="([^"]+)"/);
  if (match) {
    const url = match[1];
    const ytid = url.split('/').pop().split('?')[0];
    const slug = 'ka-' + ytid;
    const title = v.title.replace(/'/g, "\\'");
    output += `    '${slug}': { title: '${title}', url: '${url}', source: 'Khan Academy' },\n`;
  }
});
fs.writeFileSync('tmp_ka_entries.txt', output);
