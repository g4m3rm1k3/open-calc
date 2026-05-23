const fs = require('fs');
const path = require('path');

const videos = require('./new_calc_videos.json');
const contentDir = path.join(__dirname, 'src', 'content');

// Helper to extract keywords from title
function getKeywords(title) {
    return title.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(' ').filter(w => w.length > 3);
}

const chapters = ['chapter-1', 'chapter-2', 'chapter-3', 'chapter-4', 'chapter-5', 'chapter-6'];
const allFiles = [];

for (const chap of chapters) {
    const chapDir = path.join(contentDir, chap);
    if (!fs.existsSync(chapDir)) continue;
    const files = fs.readdirSync(chapDir).filter(f => f.endsWith('.js') && f !== 'index.js');
    for (const file of files) {
        allFiles.push({
            chapter: chap,
            file: file,
            path: path.join(chapDir, file),
            content: fs.readFileSync(path.join(chapDir, file), 'utf8')
        });
    }
}

function scoreMatch(videoTitle, fileInfo) {
    let score = 0;
    const vKeywords = getKeywords(videoTitle);
    const textLower = fileInfo.content.toLowerCase();
    
    // Check term presence in file content
    for (const kw of vKeywords) {
        if (textLower.includes(kw)) score += 2;
        if (fileInfo.content.includes(kw)) score += 1;
    }
    
    return score;
}

videos.forEach(video => {
    let bestMatch = null;
    let bestScore = -1;
    
    const titleLower = video.title.toLowerCase();
    
    allFiles.forEach(f => {
        let score = scoreMatch(video.title, f);
        
        // boost if filename matches words
        if (titleLower.includes('limit') && f.file.includes('limit')) score += 10;
        if (titleLower.includes('epsilon') && f.file.includes('epsilon')) score += 20;
        if (titleLower.includes('continuity') && f.file.includes('continuity')) score += 20;
        if (titleLower.includes('tangent') && f.file.includes('tangent')) score += 15;
        if (titleLower.includes('chain rule') && f.file.includes('chain')) score += 20;
        if (titleLower.includes('implicit') && f.file.includes('implicit')) score += 20;
        if (titleLower.includes('related rate') && f.file.includes('related')) score += 20;
        if (titleLower.includes('mean value') && f.file.includes('mean-value')) score += 20;
        if (titleLower.includes('optimization') && f.file.includes('optimization')) score += 20;
        if (titleLower.includes('riemann') && f.file.includes('riemann')) score += 20;
        if (titleLower.includes('volume') && f.file.includes('volume')) score += 20;
        if (titleLower.includes('differential') && f.file.includes('differential')) score += 20;
        if (titleLower.includes('integration') && f.file.includes('integr')) score += 10;
        if (titleLower.includes('substitution') && f.file.includes('sub')) score += 10;
        if (titleLower.includes('cross section') && f.file.includes('cross-section')) score += 20;
        
        if (score > bestScore) {
            bestScore = score;
            bestMatch = f;
        }
    });

    if (bestMatch && bestScore > 5) { // Threshold
        // Parse out src
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
console.log('Done!');
