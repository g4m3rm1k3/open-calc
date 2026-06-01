import fs from "fs";
import path from "path";

const root = process.cwd();
const dir = path.join(root, "src/content/applied-statistics");
const files = fs
  .readdirSync(dir)
  .filter((f) => f.endsWith(".js") && f !== "index.js")
  .sort();

const requiredKeys = [
  "id:",
  "slug:",
  "chapter:",
  "title:",
  "coreConcept:",
  "intuition:",
  "math:",
  "rigor:",
  "python:",
  "examples:",
  "challenges:",
  "semantics:",
  "checkpoints:",
  "assessment:",
  "quiz:",
  "misconceptions:",
  "transferPrompts:",
  "debugging:",
  "mastery:",
];

let failures = 0;

for (const file of files) {
  const full = path.join(dir, file);
  const text = fs.readFileSync(full, "utf8");

  const missing = requiredKeys.filter((k) => !text.includes(k));
  const challengeCount = (text.match(/id:\s*'stat\d-\d{3}-ch\d+'/g) || [])
    .length;
  const quizCount = (text.match(/id:\s*'stat\d-\d{3}-quiz-\d+'/g) || []).length;
  const predictionMoment = /predict|prediction moment/i.test(text);

  const localIssues = [];
  if (missing.length > 0)
    localIssues.push(`missing keys: ${missing.join(", ")}`);
  if (challengeCount < 3)
    localIssues.push(`needs >=3 challenges (found ${challengeCount})`);
  if (quizCount < 6)
    localIssues.push(`needs >=6 quiz items (found ${quizCount})`);
  if (!predictionMoment) localIssues.push("missing explicit prediction prompt");

  if (localIssues.length > 0) {
    failures += 1;
    console.log(`\n[FAIL] ${file}`);
    for (const issue of localIssues) {
      console.log(`  - ${issue}`);
    }
  } else {
    console.log(`[PASS] ${file}`);
  }
}

console.log(`\nChecked ${files.length} lessons.`);
if (failures > 0) {
  console.log(`Gold-standard check failed for ${failures} lesson(s).`);
  process.exitCode = 1;
} else {
  console.log("Gold-standard check passed.");
}
