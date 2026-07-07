export default {
  id: 'l1-fetch',
  title: 'Your first fetch',
  phase: 1,
  phaseLabel: 'Phase 1 — Connect to data',
  tags: ['fetch', 'async/await', 'JSON'],
  starter: `// OpenSocial — Lesson 1
// Your job: fetch 5 posts and show each title on screen

const app = document.getElementById('app')

// 1. Make the request
const response = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=5')

// 2. Parse the JSON body — returns an array of posts
const posts = await response.json()

// 3. Look at what came back
console.log(posts[0])

// TODO: loop through posts and display each title in #app
`,
  content: [
    { type: 'p', text: 'You\'re going to build OpenSocial — a social platform where users post and read content. All the data comes from a real API over the network.' },
    { type: 'p', text: 'Your first job: connect to the API and get some posts onto the screen.' },
    { type: 'divider' },
    { type: 'h2', text: 'What is fetch?' },
    { type: 'p', text: 'fetch is the browser\'s built-in way to make an HTTP request. You give it a URL, it reaches out over the network and returns whatever the server sends.' },
    { type: 'code', lang: 'typescript', text: `const response = await fetch('https://example.com/posts')` },
    { type: 'p', text: 'The await keyword pauses your code until the server replies. Without it you\'d get a Promise object — not the actual data. Network requests take time, so they\'re always asynchronous.' },
    { type: 'divider' },
    { type: 'h2', text: 'Parsing the response' },
    { type: 'p', text: 'The server sends data as text. Calling .json() parses that text into a real JavaScript object (or array) you can work with:' },
    { type: 'code', lang: 'typescript', text: `const response = await fetch('https://example.com/posts')
const posts = await response.json()  // now posts is a JS array

console.log(posts[0].title)  // access any property` },
    { type: 'note', text: 'Two awaits — one to wait for the response headers, one to wait for the body to finish downloading and parse.' },
    { type: 'divider' },
    { type: 'h2', text: 'The API you\'re working with' },
    { type: 'p', text: 'JSONPlaceholder is a free public API that returns fake-but-realistic data. The posts endpoint:' },
    { type: 'code', lang: 'text', text: `https://jsonplaceholder.typicode.com/posts?_limit=5` },
    { type: 'p', text: 'Each post looks like this:' },
    { type: 'code', lang: 'json', text: `{
  "id": 1,
  "userId": 1,
  "title": "sunt aut facere repellat provident",
  "body": "quia et suscipit suscipit recusandae..."
}` },
    { type: 'divider' },
    { type: 'h2', text: 'Your task' },
    { type: 'task', steps: [
      'Press ▶ Run — the starter code fetches 5 posts and logs the first one to the Console tab below',
      'Open the Console tab and look at the logged object — find the title and body fields',
      'Replace the TODO comment: loop through posts and put each title into #app',
    ]},
    { type: 'tip', text: 'Quick way to build a list from an array:\napp.innerHTML = posts.map(p => `<p>${p.title}</p>`).join(\'\')' },
    { type: 'callout', text: 'Done when: 5 post titles appear in the Preview pane.' },
  ],
}
