import logicPuzzles from './00-logic-puzzles.js'
import propositionsAndProofTechniques from './01-propositions-and-proof-techniques.js'
import logicAndProofs from './01b-logic-and-proofs.js'
import predicateLogicAndQuantifiers from './01a-predicate-logic-and-quantifiers.js'
import setsAndFunctionsForDiscrete from './02a-sets-and-functions-for-discrete.js'
import relationsAndStructures from './02-relations-and-structures.js'
import inductionAndRecursion from './02-induction-and-recursion.js'
import countingAndCombinatorics from './03-counting-and-combinatorics.js'
import numberTheoryAndModularArithmetic from './05-number-theory-and-modular-arithmetic.js'
import recurrenceRelations from './07-recurrence-relations.js'
import graphTheory from './04-graph-theory.js'
import graphTheoryIntro from './04a-graph-theory-intro.js'
import treesAndHierarchies from './09-trees-and-hierarchies.js'
import booleanAlgebraAndCircuits from './10-boolean-algebra-and-circuits.js'
import automataTheory from './11-automata-theory.js'
import formalLanguagesAndGrammars from './12-formal-languages-and-grammars.js'
import discreteProbability from './05-discrete-probability.js'
import algorithmsAndComplexity from './06-algorithms-and-complexity.js'

export default {
  id: 'discrete-1',
  number: 'discrete-1',
  title: 'Discrete Mathematics Foundations',
  slug: 'logic-and-proofs',
  description: 'Dependency-ordered discrete math pathway: logic, proof, structures, number theory, combinatorics, graphs, automata, languages, and complexity.',
  color: 'indigo',
  lessons: [
    logicPuzzles,
    logicAndProofs,
    propositionsAndProofTechniques,
    predicateLogicAndQuantifiers,
    setsAndFunctionsForDiscrete,
    relationsAndStructures,
    inductionAndRecursion,
    countingAndCombinatorics,
    numberTheoryAndModularArithmetic,
    discreteProbability,
    recurrenceRelations,
    graphTheory,
    graphTheoryIntro,
    treesAndHierarchies,
    booleanAlgebraAndCircuits,
    automataTheory,
    formalLanguagesAndGrammars,
    algorithmsAndComplexity,
  ],
}
