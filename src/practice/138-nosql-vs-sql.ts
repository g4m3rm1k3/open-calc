import type { PracticeChallenge } from './loader'

export const title = 'NoSQL vs SQL'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `migrateAddPhoneField(relationalUsers)`, mutating every user in the array to add a `phone: null` field — modeling a relational schema migration, which must touch every existing row uniformly.',
        starter: '',
        tests: `
const users = [{id:1,name:'Alice'},{id:2,name:'Bob'}]
assert (migrateAddPhoneField(users), true)
assert users.every(u => 'phone' in u)
`,
        solution: `function migrateAddPhoneField(relationalUsers) {
  relationalUsers.forEach(u => { u.phone = null })
}`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Finish `embedComments(post, comments)` returning a self-contained DOCUMENT: the post\'s own fields, plus a `comments` array embedding every comment whose `postId` matches `post.id` — the NoSQL document model, avoiding a join at read time.',
        starter: 'function embedComments(post, comments) {\n  // TODO: return a document combining the post\'s own fields with a\n  // "comments" array embedding every comment whose postId matches this post\n  return { ...post }\n}',
        tests: `
const post = { id: 1, title: 'Hello' }
const comments = [{postId:1, text:'Nice!'},{postId:1, text:'Great post'},{postId:2, text:'unrelated'}]
const doc = embedComments(post, comments)
assert doc.title === 'Hello'
assert doc.comments.length === 2
assert doc.comments[0].text === 'Nice!'
`,
        solution: `function embedComments(post, comments) {
  return {
    ...post,
    comments: comments.filter(c => c.postId === post.id),
  }
}`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `chooseDatabase(needsStrongConsistency, hasComplexRelationalQueries)` returning `\'SQL\'` if either is `true` (strict ACID needs like a financial ledger, or complex multi-table queries), otherwise `\'NoSQL\'`.',
        starter: '',
        tests: `
assert chooseDatabase(true, false) === 'SQL'
assert chooseDatabase(false, true) === 'SQL'
assert chooseDatabase(false, false) === 'NoSQL'
`,
        solution: `function chooseDatabase(needsStrongConsistency, hasComplexRelationalQueries) {
  if (needsStrongConsistency || hasComplexRelationalQueries) return 'SQL'
  return 'NoSQL'
}`,
      },
    ],
  },
]

export default challenges
