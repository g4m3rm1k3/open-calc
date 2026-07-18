import type { PracticeChallenge } from './loader'

export const title = 'Linked List'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `arrayToLinkedList(arr)` building a linked list of `{ value, next }` nodes from `arr`, and `linkedListToArray(head)` converting it back.',
        starter: '',
        tests: `
const list = arrayToLinkedList([1,2,3])
assert list.value === 1
assert list.next.value === 2
assert JSON.stringify(linkedListToArray(list)) === JSON.stringify([1,2,3])
`,
        solution: `function arrayToLinkedList(arr) {
  let head = null
  for (let i = arr.length - 1; i >= 0; i--) {
    head = { value: arr[i], next: head }
  }
  return head
}
function linkedListToArray(head) {
  const result = []
  let node = head
  while (node) { result.push(node.value); node = node.next }
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
        prompt: 'Finish `reverseLinkedList(head)` so it reverses a linked list of `{ value, next }` nodes IN PLACE, returning the new head.',
        starter: 'function reverseLinkedList(head) {\n  // TODO: reverse the linked list, returning the new head\n}\nfunction linkedListToArray(head) {\n  const result = []\n  let node = head\n  while (node) { result.push(node.value); node = node.next }\n  return result\n}',
        tests: `
const n3 = { value: 3, next: null }
const n2 = { value: 2, next: n3 }
const n1 = { value: 1, next: n2 }
const reversed = reverseLinkedList(n1)
assert JSON.stringify(linkedListToArray(reversed)) === JSON.stringify([3,2,1])
`,
        solution: `function reverseLinkedList(head) {
  let prev = null
  let curr = head
  while (curr) {
    const next = curr.next
    curr.next = prev
    prev = curr
    curr = next
  }
  return prev
}
function linkedListToArray(head) {
  const result = []
  let node = head
  while (node) { result.push(node.value); node = node.next }
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
        prompt: 'Write `findMiddle(head)` returning the VALUE of the middle node of a linked list, using the slow/fast pointer technique (one traversal, no length count first).',
        starter: '',
        tests: `
function build(arr) { let head = null; for (let i = arr.length - 1; i >= 0; i--) { head = { value: arr[i], next: head } } return head }
assert findMiddle(build([1,2,3,4,5])) === 3
assert findMiddle(build([1,2,3,4])) === 3
`,
        solution: `function findMiddle(head) {
  let slow = head
  let fast = head
  while (fast && fast.next) {
    slow = slow.next
    fast = fast.next.next
  }
  return slow.value
}`,
      },
    ],
  },
]

export default challenges
