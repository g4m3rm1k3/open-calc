import type { PracticeChallenge } from './loader'

export const title = 'Balanced Trees'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `leftRotate(node)`. Given a straight right-leaning line (`node → node.right → node.right.right`), restructure it so `node.right` becomes the new root, with the old `node` as its left child and the old `node.right.right` as its right child. Return the new root.',
        starter: '',
        tests: `
let root = { value:1, left:null, right: { value:2, left:null, right: { value:3, left:null, right:null } } }
root = leftRotate(root)
assert root.value === 2
assert root.left.value === 1
assert root.right.value === 3
`,
        solution: `function leftRotate(node) {
  const newRoot = node.right
  node.right = newRoot.left
  newRoot.left = node
  return newRoot
}`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Finish `rightRotate(node)` — the mirror image of `leftRotate`, fixing a straight LEFT-leaning line instead. `node.left` becomes the new root, with the old `node` as its right child.',
        starter: 'function rightRotate(node) {\n  // TODO: the mirror image of leftRotate — node.left becomes the new root,\n  // its right child moves under the old root\'s left, and the old root\n  // becomes the new root\'s right child\n  return node\n}',
        tests: `
let root = { value:3, left: { value:2, left: { value:1, left:null, right:null }, right:null }, right:null }
root = rightRotate(root)
assert root.value === 2
assert root.left.value === 1
assert root.right.value === 3
`,
        solution: `function rightRotate(node) {
  const newRoot = node.left
  node.left = newRoot.right
  newRoot.right = node
  return newRoot
}`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `insertBalanced(node, value)`: insert like a plain BST, then — if the result is a straight right-leaning line (no left child, a right child with no left child of its OWN, and a right-right grandchild) — apply `leftRotate` to rebalance it. Inserting `1, 2, 3` in order must produce a tree of height `2`, not `3`.',
        starter: '',
        tests: `
let root = null
for (const v of [1,2,3]) root = insertBalanced(root, v)
assert treeHeight(root) === 2
assert root.value === 2
`,
        solution: `function leftRotate(node) {
  const newRoot = node.right
  node.right = newRoot.left
  newRoot.left = node
  return newRoot
}
function treeHeight(node) {
  if (!node) return 0
  return 1 + Math.max(treeHeight(node.left), treeHeight(node.right))
}
function insertBalanced(node, value) {
  if (!node) return { value, left: null, right: null }
  if (value < node.value) node.left = insertBalanced(node.left, value)
  else node.right = insertBalanced(node.right, value)
  if (!node.left && node.right && !node.right.left && node.right.right) {
    node = leftRotate(node)
  }
  return node
}`,
      },
    ],
  },
]

export default challenges
