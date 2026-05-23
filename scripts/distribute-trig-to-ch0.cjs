const fs = require('fs');
const path = require('path');

const scriptContent = fs.readFileSync(path.join(__dirname, 'src', 'scripts', 'generatePrecalcTrig.cjs'), 'utf8');

// Extract videos array from the script
const startIdx = scriptContent.indexOf('const videos = [');
const endIdx = scriptContent.indexOf('];', startIdx) + 1;
const videosStr = scriptContent.substring(startIdx + 'const videos = '.length, endIdx);
const videos = eval(videosStr); // we can safely eval since it's just JSON data in the script

const ch0Dir = path.join(__dirname, 'src', 'content', 'chapter-0');
const allFiles = [];

const files = fs.readdirSync(ch0Dir).filter(f => f.endsWith('.js') && f !== 'index.js');
for (const file of files) {
    allFiles.push({
        file: file,
        path: path.join(ch0Dir, file),
        content: fs.readFileSync(path.join(ch0Dir, file), 'utf8')
    });
}

function getKeywords(title) {
    return title.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(' ').filter(w => w.length > 3);
}

function scoreMatch(videoTitle, fileInfo) {
    let score = 0;
    const vKeywords = getKeywords(videoTitle);
    const textLower = fileInfo.content.toLowerCase();
    
    for (const kw of vKeywords) {
        if (textLower.includes(kw)) score += 2;
        if (fileInfo.content.includes(kw)) score += 1; // case sensitive match boost
    }
    
    return score;
}

videos.forEach(video => {
    let bestMatch = null;
    let bestScore = -1;
    
    const titleLower = video.title.toLowerCase();
    
    allFiles.forEach(f => {
        let score = scoreMatch(video.title, f);
        
        // Manual boost for certain files in chapter-0
        if (titleLower.includes('trig') && f.file.includes('trig')) score += 30;
        if (titleLower.includes('angle') && f.file.includes('trig')) score += 15;
        if (titleLower.includes('function') && f.file.includes('function')) score += 10;
        if (titleLower.includes('inequalities') && f.file.includes('inequalit')) score += 20;
        if (titleLower.includes('geometry') && f.file.includes('geometry')) score += 20;
        if (titleLower.includes('real number') && f.file.includes('real-number')) score += 20;
        if (titleLower.includes('polynomial') && f.file.includes('evaluat')) score += 10;
        if (titleLower.includes('fraction') && f.file.includes('fraction')) score += 15;
        if (titleLower.includes('absolute') && f.file.includes('absolute')) score += 20;
        if (titleLower.includes('exponential') && f.file.includes('exponential')) score += 20;
        
        if (score > bestScore) {
            bestScore = score;
            bestMatch = f;
        }
    });

    if (bestMatch && bestScore > 10) { 
        const srcMatch = video.embedCode.match(/src="([^"]+)"/) || video.embedCode.match(/src='([^']+)'/);
        const url = srcMatch ? srcMatch[1] : '';
        
        const vizBlock = `
    {
      type: "react",
      component: "VideoEmbed",
      params: {
        title: ${JSON.stringify(video.title)},
        url: ${JSON.stringify(url)}
      }
    },`;
        
        if (bestMatch.content.includes('visualizations: [')) {
            const hasExisting = bestMatch.content.match(/visualizations:\s*\[\s*\{/);
            if (hasExisting) {
                 bestMatch.content = bestMatch.content.replace(/visualizations:\s*\[/, 'visualizations: [' + vizBlock);
            } else {
                 bestMatch.content = bestMatch.content.replace(/visualizations:\s*\[\s*\]/, 'visualizations: [' + vizBlock + '\n  ]');
            }
        }
    } else {
        console.log("No good match for:", video.title);
    }
});

allFiles.forEach(f => {
    fs.writeFileSync(f.path, f.content);
});
console.log('Done mapping Trig videos to Chapter 0!');