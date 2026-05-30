const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const COURSES_FILE = path.join(ROOT, 'src/content/courses.js');
const README_FILE = path.join(ROOT, 'README.md');
const ARCHITECTURE_FILE = path.join(ROOT, 'ARCHITECTURE.md');

let hasWarnings = false;

function warn(msg) {
  console.warn(`[WARNING] ${msg}`);
  hasWarnings = true;
}

function extractCourses() {
  const content = fs.readFileSync(COURSES_FILE, 'utf8');
  const courseKeys = [];
  const regex = /key:\s*["']([^"']+)["']/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    courseKeys.push(match[1]);
  }
  return courseKeys;
}

function checkReadmeCount(courseKeys) {
  const readmeContent = fs.readFileSync(README_FILE, 'utf8');
  const countRegex = /\*\*(\d+) courses\*\*/;
  const countMatch = countRegex.exec(readmeContent);
  
  if (countMatch) {
    const readmeCount = parseInt(countMatch[1], 10);
    if (readmeCount !== courseKeys.length) {
      warn(`README.md says **${readmeCount} courses**, but courses.js has ${courseKeys.length}.`);
    }
  } else {
    warn('Could not find "**X courses**" string in README.md.');
  }

  const tableRows = (readmeContent.match(/\|.*\|.*\|/g) || []).length - 2; // Rough estimate, subtract header
  if (tableRows > 0 && Math.abs(tableRows - courseKeys.length) > 5) {
      warn(`README.md table seems to have ${tableRows} rows, but there are ${courseKeys.length} courses.`);
  }
}

function checkArchitectureInventory(courseKeys) {
  const archContent = fs.readFileSync(ARCHITECTURE_FILE, 'utf8');
  // Look for the course inventory table
  const tableMatch = archContent.match(/\| Course folder \| Curriculum subject \| Chapter format \| Lesson schema \|[\s\S]+?(?=\n\n)/);
  
  if (!tableMatch) {
    warn('Could not find Course inventory table in ARCHITECTURE.md.');
    return;
  }
  
  const tableText = tableMatch[0];
  
  // Just do a basic check for some of the newer courses to ensure they are mentioned
  const newerCourses = ['sql-0', 'sql-1', 'nosql-1', 'applied-statistics', 'cli-0', 'cpp', 'design-1', 'dsa-1', 'dp-1'];
  for (const course of newerCourses) {
    if (courseKeys.includes(course) && !tableText.includes(course)) {
      warn(`Course '${course}' exists in courses.js but is not mentioned in ARCHITECTURE.md inventory table.`);
    }
  }
}

function runChecks() {
  console.log('Running doc drift checks...');
  
  if (!fs.existsSync(COURSES_FILE) || !fs.existsSync(README_FILE) || !fs.existsSync(ARCHITECTURE_FILE)) {
    console.error('Error: Could not find required files (courses.js, README.md, ARCHITECTURE.md). Run from project root.');
    process.exit(1);
  }

  const courses = extractCourses();
  console.log(`Found ${courses.length} courses in courses.js.`);
  
  checkReadmeCount(courses);
  checkArchitectureInventory(courses);
  
  if (hasWarnings) {
    console.log('\n❌ Doc drift detected. Please update the documentation to match the codebase.');
    process.exit(1); // Fail in CI
  } else {
    console.log('\n✅ No doc drift detected.');
  }
}

runChecks();
