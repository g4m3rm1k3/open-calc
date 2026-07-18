import type { PracticeChallenge } from './loader'

export const title = 'Binary Tree'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `preorder(node, result = [])`, where `node` is `{ value, left, right }` (or `null`). Return an array of values visited in preorder: the node\'s own value, then its left subtree, then its right subtree.',
        starter: '',
        tests: `
const tree = { value:1, left: { value:2, left: { value:4, left:null, right:null }, right:null }, right: { value:3, left:null, right:null } }
assert JSON.stringify(preorder(tree)) === JSON.stringify([1,2,4,3])
`,
        solution: `function preorder(node, result = []) {
  if (!node) return result
  result.push(node.value)
  preorder(node.left, result)
  preorder(node.right, result)
  return result
}`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Finish `postorder(node, result = [])`: visit the left subtree, then the right subtree, THEN the node\'s own value LAST — the order used for safely deleting a tree bottom-up.',
        starter: 'function postorder(node, result = []) {\n  // TODO: visit left subtree, then right subtree, THEN the node\'s own value last\n  if (!node) return result\n  result.push(node.value)\n  postorder(node.left, result)\n  postorder(node.right, result)\n  return result\n}',
        tests: `
const tree = { value:1, left: { value:2, left: { value:4, left:null, right:null }, right:null }, right: { value:3, left:null, right:null } }
assert JSON.stringify(postorder(tree)) === JSON.stringify([4,2,3,1])
`,
        solution: `function postorder(node, result = []) {
  if (!node) return result
  postorder(node.left, result)
  postorder(node.right, result)
  result.push(node.value)
  return result
}`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `treeHeight(node)` returning the number of nodes on the longest path from `node` down to a leaf (an empty tree has height `0`).',
        starter: '',
        tests: `
const tree = { value:1, left: { value:2, left: { value:4, left:null, right:null }, right:null }, right: { value:3, left:null, right:null } }
assert treeHeight(tree) === 3
assert treeHeight(null) === 0
`,
        solution: `function treeHeight(node) {
  if (!node) return 0
  return 1 + Math.max(treeHeight(node.left), treeHeight(node.right))
}`,
      },
    ],
  },
]

export default challenges
