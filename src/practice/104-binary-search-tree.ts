import type { PracticeChallenge } from './loader'

export const title = 'Binary Search Tree'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `insert(node, value)` returning the tree with `value` inserted at the correct position (smaller goes left, larger goes right), and `search(node, target)` returning whether `target` exists in the tree, using the ordering invariant to skip whichever subtree can\'t contain it.',
        starter: '',
        tests: `
let root = null
for (const v of [5,3,8,1,4]) root = insert(root, v)
assert search(root, 4) === true
assert search(root, 6) === false
`,
        solution: `function insert(node, value) {
  if (!node) return { value, left: null, right: null }
  if (value < node.value) node.left = insert(node.left, value)
  else node.right = insert(node.right, value)
  return node
}
function search(node, target) {
  if (!node) return false
  if (node.value === target) return true
  return target < node.value ? search(node.left, target) : search(node.right, target)
}`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Finish `findMin(node)` returning the smallest value in a non-empty BST — the smallest value is always the LEFTMOST node, so no comparisons are needed, just follow `.left` until there isn\'t one.',
        starter: 'function insert(node, value) {\n  if (!node) return { value, left: null, right: null }\n  if (value < node.value) node.left = insert(node.left, value)\n  else node.right = insert(node.right, value)\n  return node\n}\nfunction findMin(node) {\n  // TODO: the smallest value in a BST is always the LEFTMOST node — follow\n  // .left until there\'s no more left child, then return that node\'s value\n  return node.value\n}',
        tests: `
let root = null
for (const v of [5,3,8,1,4]) root = insert(root, v)
assert findMin(root) === 1
`,
        solution: `function insert(node, value) {
  if (!node) return { value, left: null, right: null }
  if (value < node.value) node.left = insert(node.left, value)
  else node.right = insert(node.right, value)
  return node
}
function findMin(node) {
  while (node.left) node = node.left
  return node.value
}`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `isValidBST(node, min = -Infinity, max = Infinity)` returning whether the ordering invariant holds at EVERY node, not just the root — a node deep in a left subtree can still violate the invariant relative to an ancestor several levels up, not just its immediate parent.',
        starter: '',
        tests: `
const validTree = { value:5, left: { value:3, left:null, right:null }, right: { value:8, left:null, right:null } }
assert isValidBST(validTree) === true
const invalidTree = { value:5, left: { value:3, left:null, right: { value:8, left:null, right:null } }, right: { value:10, left:null, right:null } }
assert isValidBST(invalidTree) === false
`,
        solution: `function isValidBST(node, min = -Infinity, max = Infinity) {
  if (!node) return true
  if (node.value <= min || node.value >= max) return false
  return isValidBST(node.left, min, node.value) && isValidBST(node.right, node.value, max)
}`,
      },
    ],
  },
]

export default challenges
