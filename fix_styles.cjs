const fs = require('fs');
const path = require('path');

const files = [
  'src/components/viz/git/GitLab.jsx',
  'src/components/viz/git/GitWorkspace.jsx',
  'src/components/viz/react/CalculusFoundationsLab.jsx',
  'src/components/viz/react/CardDiceLab.jsx',
  'src/components/viz/react/ComplementaryCountingViz.jsx',
  'src/components/viz/react/DeMorganViz.jsx',
  'src/components/viz/react/DivisibilityExplorer.jsx',
  'src/components/viz/react/EuclideanAlgorithmViz.jsx',
  'src/components/viz/react/FactorialExplorer.jsx',
  'src/components/viz/react/FermatTheoremViz.jsx',
  'src/components/viz/react/ImplicationExplorer.jsx',
  'src/components/viz/react/InclusionExclusionAnimator.jsx',
  'src/components/viz/react/InductionFailureViz.jsx',
  'src/components/viz/react/LogicConnectiveBuilder.jsx',
  'src/components/viz/react/ModularArithmeticGrid.jsx',
  'src/components/viz/react/MultiplicationRuleTree.jsx',
  'src/components/viz/react/PermutationVsCombinationAnimator.jsx',
  'src/components/viz/react/ProofStrategyChooser.jsx',
  'src/components/viz/react/QuantifierExplorer.jsx',
  'src/components/viz/react/RecursionStackViz.jsx',
  'src/components/viz/react/RecursionTreeViz.jsx',
  'src/components/viz/react/RSAMiniDemo.jsx',
  'src/components/viz/react/SlotMachineCounter.jsx',
  'src/components/viz/react/StateExplosionViz.jsx',
  'src/components/viz/react/StrongInductionPuzzle.jsx',
  'src/components/viz/react/TruthTableViz.jsx'
];

let changedCount = 0;

for (const file of files) {
  const fullPath = path.join(__dirname, file);
  if (!fs.existsSync(fullPath)) {
    console.log("File not found: " + fullPath);
    continue;
  }
  let content = fs.readFileSync(fullPath, 'utf8');
  let originalContent = content;

  // Backgrounds
  content = content.replace(/(?<!dark:)\bbg-white(?![\/\-]| dark:bg)/g, 'bg-white dark:bg-slate-900');
  content = content.replace(/(?<!dark:)\bbg-gray-50(?![\/\-]| dark:bg)/g, 'bg-gray-50 dark:bg-slate-800');
  content = content.replace(/(?<!dark:)\bbg-gray-100(?![\/\-]| dark:bg)/g, 'bg-gray-100 dark:bg-slate-800');
  content = content.replace(/(?<!dark:)\bbg-gray-200(?![\/\-]| dark:bg)/g, 'bg-gray-200 dark:bg-slate-700');

  // Texts
  content = content.replace(/(?<!dark:)\btext-gray-400(?![\/\-]| dark:text)/g, 'text-gray-400 dark:text-gray-500');
  content = content.replace(/(?<!dark:)\btext-gray-500(?![\/\-]| dark:text)/g, 'text-gray-500 dark:text-gray-400');
  content = content.replace(/(?<!dark:)\btext-gray-600(?![\/\-]| dark:text)/g, 'text-gray-600 dark:text-gray-300');
  content = content.replace(/(?<!dark:)\btext-gray-700(?![\/\-]| dark:text)/g, 'text-gray-700 dark:text-gray-200');
  content = content.replace(/(?<!dark:)\btext-slate-900(?![\/\-]| dark:text)/g, 'text-slate-900 dark:text-slate-100');
  
  // Borders
  content = content.replace(/(?<!dark:)\bborder-slate-300(?![\/\-]| dark:border)/g, 'border-slate-300 dark:border-slate-700');

  if (content !== originalContent) {
    fs.writeFileSync(fullPath, content, 'utf8');
    changedCount++;
    console.log("Updated: " + file);
  }
}

console.log(`\nUpdated ${changedCount} files.`);
