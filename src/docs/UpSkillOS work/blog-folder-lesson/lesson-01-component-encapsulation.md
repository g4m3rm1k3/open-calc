# Lesson 3: Component Encapsulation for Local State

**What you will build** — You will take a large, monolithic list renderer and extract a piece of it into a sub-component so it can independently manage its own open/closed state. This will make the series folders on the blog list collapsible and scrollable, preventing them from eating up all the screen space.

**What you need to know first** — You should understand `useState` and how React passes data down as props.

## Concept Unit: State Encapsulation

### The Problem

In `BlogListPage.jsx`, we map over an object of folders and render them inline:
```jsx
{Object.entries(series).map(([folderName, posts]) => (
  <div key={folderName}>
    {/* Header */}
    {/* List of posts */}
  </div>
))}
```
If we want to make these folders collapsible, we need state. If we add `const [isOpen, setIsOpen] = useState(false)` to `BlogListPage`, opening *one* folder will open *all* of them (since they all share that one variable). We *could* use a complex dictionary (`{ "Folder A": true, "Folder B": false }`), but the much cleaner React pattern is **Component Encapsulation**: we turn the inner block into its own Component, so each folder gets its own private `useState`.

### Introduce the concept in isolation

```javascript
// Throwaway Example: Extracting to isolate state
function ParentList() {
  const items = ["Apple", "Banana", "Cherry"];
  return (
    <div>
      {items.map(item => <ToggleableItem key={item} name={item} />)}
    </div>
  );
}

function ToggleableItem({ name }) {
  // Because this is a separate component, each item gets its own distinct `isOpen` memory slot.
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div>
      <button onClick={() => setIsOpen(!isOpen)}>{name}</button>
      {isOpen && <p>Details about {name}</p>}
    </div>
  );
}
```

*What this proves:* Breaking UI into smaller components isn't just about reusing code; it's also about giving repeating elements their own private memory space.

### Discard the throwaway example
The throwaway example is discarded.

### Project Change

- **Reference Source** — `src/pages/BlogListPage.jsx`
- **Change type** — Refactor / UI Enhancement.
- **Location** — We will create a new component `SeriesFolder` in the same file, and replace the inline `.map` block with it.

### The New Code — type it yourself

First, we need to import a couple of icons at the very top of `BlogListPage.jsx` to show whether the folder is open or closed:

```jsx
import { ChevronDown, ChevronRight } from 'lucide-react'
```

Next, place this new component anywhere outside of `BlogListPage` (e.g., right above the `export default function BlogListPage() {` line). This component is the exact UI that used to be inline, but with state added:

```jsx
function SeriesFolder({ folderName, posts, readSet, navigate }) {
  // Private state for this specific folder instance
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      
      {/* 1. We added cursor-pointer and an onClick handler to the header */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="px-5 py-3 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/40 transition-colors"
      >
        <div className="flex items-center gap-2">
          {/* 2. We render a Chevron icon based on the state */}
          {isOpen ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
          
          <span className="text-base">📚</span>
          <span className="font-semibold text-slate-900 dark:text-white text-sm">{folderName}</span>
        </div>
        <span className="text-xs text-slate-400 dark:text-slate-500">{posts.length} {posts.length === 1 ? 'post' : 'posts'}</span>
      </div>
      
      {/* 3. We conditionally render the list, and wrap it in a scrollable div */}
      {isOpen && (
        <div className="max-h-[300px] overflow-y-auto">
          {posts.map((post, i) => (
            
            <button
              key={post.slug}
              onClick={() => navigate(`/blog/${post.slug}`)}
              className="w-full text-left flex items-center gap-4 px-5 py-3.5 border-b last:border-b-0 border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group"
            >
              <span className="text-xs text-slate-400 dark:text-slate-500 w-5 text-right shrink-0">{i + 1}.</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors whitespace-normal break-words leading-snug">
                  {post.title}
                </p>
                {post.excerpt && (
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 truncate">{post.excerpt}</p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {readSet.has(post.slug) && (
                  <span title="Read" className="text-emerald-600 dark:text-emerald-400 text-xs">✓</span>
                )}
                <span className="text-xs text-slate-400 dark:text-slate-500">{post.readMin} min</span>
              </div>
            </button>
            
          ))}
        </div>
      )}
    </div>
  )
}
```

### The Updated Project — return, immediately, before any explanation

Now, scroll down inside `BlogListPage` to around line 100 where `Object.entries(series).map` happens. Replace that entire block with this clean implementation:

```jsx
          {/* Series groups */}
          {Object.entries(series).map(([folderName, posts]) => (
            <SeriesFolder 
              key={folderName} 
              folderName={folderName} 
              posts={posts} 
              readSet={readSet} 
              navigate={navigate} 
            />
          ))}
```

### Mechanical walkthrough — how it works in isolation

1. `const [isOpen, setIsOpen] = useState(false)` — **Genuinely basic**. Defaults the folder to being collapsed so the page starts clean.
2. `onClick={() => setIsOpen(!isOpen)}` — **Genuinely basic**. Toggles the boolean state whenever the user clicks anywhere on the header div.
3. `max-h-[300px] overflow-y-auto` — **First appearance**. Tailwind classes that enforce a maximum height of 300 pixels. If the content exceeds this height, a vertical scrollbar (`overflow-y-auto`) will automatically appear. 
4. `<SeriesFolder key={folderName} ... />` — **Genuinely basic**. React spins up a distinct, independent instance of `SeriesFolder` for every folder in the array. Since the state lives *inside* `SeriesFolder`, each one operates completely independently.

### SE lens — why it's engineered this way

**Encapsulation:** 
When a component grows past ~150 lines, it becomes difficult to track which variables affect which UI elements. By pulling `SeriesFolder` out into its own function, we accomplish two things:
1. We give it isolated local state.
2. We dramatically clean up `BlogListPage`, abstracting away the *implementation details* of a folder (how it renders items, how it scrolls, how it opens) and leaving behind only the *business logic* (mapping over the series data). The parent shouldn't care *how* a folder renders, it should just tell a folder *what* to render.

### Commands needed to make this unit real, if any

None.

### Run it. Show the real output.

When loading the Blog page, all folders will be collapsed into a neat list of headers. Clicking a header expands it to reveal the posts. If the folder has dozens of posts, it stops expanding at 300px and smoothly scrolls internally, preserving the user's overall page position!

---

## Closing

- **Definition of done**
  - [ ] Create `SeriesFolder` component outside of `BlogListPage`.
  - [ ] Add `isOpen` state to the new component.
  - [ ] Add click handler and chevron toggling.
  - [ ] Wrap the inner map in a scrollable div (`max-h-[300px] overflow-y-auto`).
  - [ ] Replace the inline map inside `BlogListPage` with the new component, passing all necessary props (`folderName`, `posts`, `readSet`, `navigate`).
  - [ ] Git commit: `"feat(blog): extract SeriesFolder and make blog groups collapsible/scrollable"`
