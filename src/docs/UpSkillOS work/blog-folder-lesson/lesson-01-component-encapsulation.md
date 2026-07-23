# Lesson 3: Component Encapsulation for Local State

**What you will build** — You will take a large, monolithic list renderer and extract a piece of it into a sub-component so it can independently manage its own open/closed state. This will make the series folders on the blog list collapsible and scrollable, preventing them from eating up all the screen space.

**What you need to know first** — You should understand `useState` and how React passes data down as props.

---

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
If we want to make these folders collapsible, we need a boolean state to track whether it is open or closed. If we add `const [isOpen, setIsOpen] = useState(false)` to `BlogListPage`, opening *one* folder will open *all* of them simultaneously because they all share that exact same variable. 

The cleaner React pattern is **Component Encapsulation**: we turn the inner block into its own Component, giving each folder its own private, isolated `useState`.

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
- **Location** — We will create a new component `SeriesFolder` piece by piece.

---

## Step 1: The Component Shell & State

First, we will set up the skeleton of our new component. You can place this function anywhere outside of `BlogListPage` (for example, right above `export default function BlogListPage() {`).

### The New Code — type it yourself

```jsx
import { ChevronDown, ChevronRight } from 'lucide-react'

function SeriesFolder({ folderName, posts, readSet, navigate }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      {/* Header will go here */}
      
      {/* Posts list will go here */}
    </div>
  )
}
```

### Mechanical walkthrough — how it works in isolation

1. `navigate` — **First appearance**. This is a function passed down from React Router in the parent component. When called with a URL (like `navigate('/blog/post-name')`), it tells the browser to swap to the new page instantly without reloading the entire website.
2. `const [isOpen, setIsOpen] = useState(false)` — **Genuinely basic**. Defaults the folder to being collapsed so the page starts clean.
3. `rounded-2xl border overflow-hidden` — **First appearance**. 
   - **Why these styles?** In UI design, drawing a subtle border with rounded corners creates a "card." This visual grouping tells the user that everything inside this box belongs together. `overflow-hidden` ensures that if children inside the box try to render outside the rounded corners, they are clipped.

---

## Step 2: The Clickable Header

Now we will add the header that the user actually clicks to open the folder. Add this inside the empty `div` from Step 1.

### The New Code — type it yourself

```jsx
      {/* 1. Interactive Header */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="px-5 py-3 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/40 transition-colors"
      >
        <div className="flex items-center gap-2">
          {isOpen ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
          
          <span className="text-base">📚</span>
          <span className="font-semibold text-slate-900 dark:text-white text-sm">{folderName}</span>
        </div>
        
        <span className="text-xs text-slate-400 dark:text-slate-500">
          {posts.length} {posts.length === 1 ? 'post' : 'posts'}
        </span>
      </div>
```

### Mechanical walkthrough — how it works in isolation

1. `onClick={() => setIsOpen(!isOpen)}` — **Genuinely basic**. Toggles the boolean state whenever the user clicks anywhere on the header div.
2. `ChevronDown` vs `ChevronRight` — **First appearance**. We use a ternary operator (`isOpen ? down : right`) to immediately show the user whether clicking will expand or collapse the list.
3. `cursor-pointer hover:bg-... transition-colors` — **First appearance**. 
   - **Why these styles?** Affordance. A user won't click something unless it looks clickable. Changing the mouse cursor to a pointer and slightly darkening the background on hover provides immediate, satisfying feedback that this is an interactive button.
4. `flex items-center justify-between` — **First appearance**. 
   - **Why these styles?** This pushes the title to the far left, and the post count to the far right. This creates a clean "scannable" line for the user's eyes, preventing clutter.

---

## Step 3: The Scrollable Container

Finally, we conditionally render the posts, wrapping them in a specific container that prevents them from taking over the screen.

### The New Code — type it yourself

Add this directly beneath the header you just typed:

```jsx
      {/* 2. Conditionally rendered, scrollable body */}
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
            </button>
            
          ))}
        </div>
      )}
```
*(Note: I omitted the "Read" checkmarks to keep the typing block smaller, but the concept is exactly the same!).*

### Mechanical walkthrough — how it works in isolation

1. `isOpen && (...)` — **Genuinely basic**. If `isOpen` is false, React simply renders nothing here.
2. `max-h-[300px] overflow-y-auto` — **First appearance**. 
   - **Why these styles?** If a folder has 50 posts, expanding it would push every other folder completely off the screen, destroying the user's context of the page. By enforcing a `max-height` of 300 pixels and setting `overflow-y-auto`, a vertical scrollbar automatically appears *inside* the folder if the content gets too long, preserving the overall page layout.

---

## Step 4: Integration

### The Updated Project — return, immediately, before any explanation

Now, scroll down inside `BlogListPage` to around line 100 where `Object.entries(series).map` happens. Replace that entire inline block with our new component:

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

### SE lens — why it's engineered this way

**Abstraction:** 
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
  - [ ] Replace the inline map inside `BlogListPage` with the new component, passing all necessary props.
  - [ ] Git commit: `"feat(blog): extract SeriesFolder and make blog groups collapsible/scrollable"`
