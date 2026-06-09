# TikTok Clone — Complete Lesson Series
## From Zero to a Real Mobile App

> **How to use this:** Work through one lesson at a time. Do not skip ahead. Each lesson takes 45–60 minutes. The challenges at the end of each lesson are not optional — they are where the learning happens. Come back to the conversation when you hit the flagged points in Lessons 9–12.

---

# Lesson 1 — What React Native Is and Your First Screen

**What you will have at the end:** A running app on your phone showing a black fullscreen screen — the foundation every TikTok video sits on.

---

## Part 1 — The Idea

### What problem does React Native solve?

Phones run two completely different operating systems — iOS and Android. Normally to build an app for both you would need to write it twice: once in Swift for iOS, once in Kotlin for Android. Two codebases, two sets of skills, twice the work.

React Native lets you write your app once in JavaScript and run it on both platforms. One codebase, two apps.

### What is React?

React is a way of thinking about user interfaces. The core idea:

**Your UI is a function of your data.**

Given some data, your interface always looks the same. Change the data, the interface updates automatically. You never manually reach in and move things around — you just describe what the screen should look like for a given state, and React handles the updates.

### What is Expo?

Building React Native from scratch involves configuring Xcode, Android Studio, and build pipelines. Expo wraps all of that so you can skip it and just write your app. It also gives you the **Expo Go** phone app — scan a QR code and your app appears on your real device instantly. No cable, no build step.

### The mental model

A React Native app is made of **components**. A component is a chunk of UI with its own logic. The entire screen is a component. The video player inside it is a component. The like button inside that is a component. Components nest inside each other like boxes inside boxes.

---

## Part 2 — The Smallest Example

**Install Expo Go on your phone first** — search "Expo Go" in the App Store or Play Store.

Then in your terminal:

```bash
npx create-expo-app tiktok-clone --template blank
cd tiktok-clone
npx expo start
```

A QR code appears. Scan it with Expo Go. You see a white screen. That is your app running on your phone. Leave this terminal running — every save triggers an instant update.

Open `App.js` in your editor. Read it without changing anything:

```javascript
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text>Open up App.js to start working on your app!</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
```

---

## Part 3 — Pull It Apart

### JSX

The `<View>` and `<Text>` tags inside the JavaScript are **JSX** — a syntax that looks like HTML but is not. It gets converted to regular JavaScript at build time. Anything with a capital letter (`<View>`, `<Text>`) is a React component. You cannot put raw text outside a `<Text>` tag.

### Try these changes one at a time

**Change 1** — Change the background to black:
```javascript
backgroundColor: '#000',
```
The text disappears. The screen is black.

**Change 2** — Make the text visible:
```javascript
<Text style={{ color: '#fff', fontSize: 24 }}>Hello</Text>
```
The double curly braces: outer `{}` means "here comes JavaScript inside JSX", inner `{}` is a JavaScript object. This is an inline style.

**Change 3** — Add a second line of text below:
```javascript
<View style={styles.container}>
  <Text style={{ color: '#fff', fontSize: 24 }}>Hello</Text>
  <Text style={{ color: '#aaa', fontSize: 16 }}>Building TikTok</Text>
</View>
```

**Change 4 (intentional crash)** — Put text outside a `<Text>` tag:
```javascript
<View style={styles.container}>
  This will crash
</View>
```
Read the error. Then undo it. React Native errors are readable — learn to use them.

---

## Part 4 — Build It Real

Replace everything in `App.js`. Type it, don't copy-paste:

```javascript
import { StyleSheet, View, Text, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar hidden={true} />
      <View style={styles.feed}>
        <Text style={styles.placeholder}>Feed goes here</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  feed: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: {
    color: '#333',
    fontSize: 16,
  },
});
```

A black fullscreen screen. `SafeAreaView` keeps content out of the phone notch. `flex: 1` means "fill all available space" — we use this constantly.

---

## Challenges

**Challenge 1:** Add a `<Text>` at the very bottom of the screen that says "For You" in white, centred. Think about how to push it to the bottom before looking anything up.

**Challenge 2:** Make the placeholder text show your `@username` in white at a larger size.

---

# Lesson 2 — Components: Building With Blocks

**What you will have at the end:** A `VideoCard` component that fills the screen — username, description, music info, and the like/comment/share buttons on the right side. No video yet, just the layout.

---

## Part 1 — The Idea

### What a component actually is

A component is a function that returns JSX. That is the complete definition. What makes components powerful is that they are **reusable** and **composable**.

Reusable: you define a `LikeButton` once and use it in a hundred places. Change the definition once and every instance updates.

Composable: you build complex UIs by combining simple components. A `VideoCard` is made of a `LikeButton`, a `CommentButton`, a `UserInfo`, and a `MusicInfo`. Each of those could be broken down further.

### Props — how components receive data

A component with hardcoded data is not very useful. Props are how you pass data into a component from its parent. They work exactly like function arguments — because that is what they are.

```javascript
// Parent passes data in as attributes
<VideoCard username="@maya" likes={1200} />

// Child receives it as a "props" object
function VideoCard(props) {
  return <Text>{props.username}</Text>
}

// Or with destructuring — much cleaner
function VideoCard({ username, likes }) {
  return <Text>{username}</Text>
}
```

Whatever you put in the JSX tag becomes a key in the props object. Numbers go in `{}`. Strings can go in `""`. Booleans, arrays, objects, functions — all in `{}`.

### The file structure we are building toward

```
tiktok-clone/
  App.js
  components/
    VideoCard.js
    ActionButtons.js
    VideoInfo.js
  screens/
    FeedScreen.js
    ProfileScreen.js
```

Every component gets its own file. This keeps things findable and focused.

---

## Part 2 — The Smallest Example

Create a `components` folder inside your project. Create `components/VideoCard.js`:

```javascript
import { View, Text, StyleSheet } from 'react-native';

// Props are destructured directly in the function signature.
// This is cleaner than writing function VideoCard(props) and then props.username.
function VideoCard({ username, description }) {
  return (
    <View style={styles.card}>
      <Text style={styles.username}>{username}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#111',
    justifyContent: 'flex-end',
    padding: 16,
  },
  username: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 8,
  },
  description: {
    color: '#fff',
    fontSize: 14,
  },
});

export default VideoCard;
```

Now use it in `App.js`:

```javascript
import { SafeAreaView, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import VideoCard from './components/VideoCard';

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar hidden={true} />
      <VideoCard
        username="@maya"
        description="When the beat drops just right 🎵"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
});
```

Your screen shows a dark card with the username and description in the bottom-left. This is exactly where TikTok puts that information.

---

## Part 3 — Pull It Apart

**Try 1:** Change the props passed from `App.js`. Notice the component updates without touching `VideoCard.js`. That is reusability.

**Try 2:** Pass a number as a prop:
```javascript
<VideoCard username="@maya" description="hello" likes={1204} />
```
Now display `likes` inside `VideoCard`. What happens if you forget the `{}` and write `likes="1204"` instead? It still works — but the value is now a string, not a number. This matters when you do maths with it later.

**Try 3:** What happens if you use `VideoCard` twice in `App.js`?
```javascript
<VideoCard username="@maya" description="First video" />
<VideoCard username="@john" description="Second video" />
```
They stack. Both share the same styles. That is composition.

---

## Part 4 — Build It Real

Now build the full `VideoCard` with all the TikTok UI elements. This is the most important layout in the entire app.

First, the action buttons component. Create `components/ActionButtons.js`:

```javascript
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

// A single action button — icon + count
function ActionButton({ icon, count, onPress }) {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.count}>{count}</Text>
    </TouchableOpacity>
  );
}

// The column of buttons on the right side
function ActionButtons({ likes, comments, shares, onLike }) {
  return (
    <View style={styles.container}>
      <ActionButton icon="❤️" count={likes}    onPress={onLike} />
      <ActionButton icon="💬" count={comments} onPress={() => {}} />
      <ActionButton icon="↗️" count={shares}   onPress={() => {}} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 16,
    bottom: 120,
    alignItems: 'center',
    gap: 24,
  },
  button: {
    alignItems: 'center',
  },
  icon: {
    fontSize: 32,
  },
  count: {
    color: '#fff',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '600',
  },
});

export default ActionButtons;
```

Then the video info at the bottom. Create `components/VideoInfo.js`:

```javascript
import { View, Text, StyleSheet } from 'react-native';

function VideoInfo({ username, description, song }) {
  return (
    <View style={styles.container}>
      <Text style={styles.username}>{username}</Text>
      <Text style={styles.description}>{description}</Text>
      <Text style={styles.song}>♫ {song}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 80,
    left: 16,
    right: 80,   // leave space for the action buttons on the right
  },
  username: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 6,
  },
  description: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  song: {
    color: '#fff',
    fontSize: 13,
  },
});

export default VideoInfo;
```

Now update `VideoCard.js` to use both:

```javascript
import { View, StyleSheet, Dimensions } from 'react-native';
import VideoInfo from './VideoInfo';
import ActionButtons from './ActionButtons';

// Dimensions gives us the real screen size.
// We use this to make the card exactly fullscreen.
const { width, height } = Dimensions.get('window');

function VideoCard({ video }) {
  return (
    <View style={styles.card}>
      {/* The dark background — video will go here in Lesson 6 */}
      <View style={styles.videoPlaceholder} />

      {/* Info overlay at the bottom left */}
      <VideoInfo
        username={video.username}
        description={video.description}
        song={video.song}
      />

      {/* Action buttons on the right */}
      <ActionButtons
        likes={video.likes}
        comments={video.comments}
        shares={video.shares}
        onLike={() => {}}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: width,
    height: height,
    backgroundColor: '#1a1a2e',
  },
  videoPlaceholder: {
    flex: 1,
    backgroundColor: '#16213e',
  },
});

export default VideoCard;
```

Update `App.js` to pass a video object:

```javascript
import { SafeAreaView, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import VideoCard from './components/VideoCard';

// This is mock data. In Lesson 11 this will come from a real API.
const MOCK_VIDEO = {
  id: '1',
  username: '@maya',
  description: 'When the beat drops just right and everything feels perfect 🎵✨',
  song: 'Original Sound — maya',
  likes: 12400,
  comments: 843,
  shares: 221,
  uri: null,
};

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar hidden={true} />
      <VideoCard video={MOCK_VIDEO} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
});
```

---

## What You Learned

| Concept | What it means |
|---|---|
| Component | A function that returns JSX |
| Props | Data passed into a component like function arguments |
| Destructuring | `{ username, likes }` extracts props cleanly |
| `position: 'absolute'` | Removes an element from the layout flow, positioned relative to its parent |
| `Dimensions` | Gets the real screen width and height |
| Component files | One component per file, in a `components/` folder |

---

## Challenges

**Challenge 1:** Add a circular avatar placeholder (a grey circle) to the top of the action buttons column in `ActionButtons.js`.

**Challenge 2:** Format the like/comment/share counts — `12400` should display as `12.4K`. Write a `formatCount(n)` function in a new file `utils/format.js` and import it.

---

# Lesson 3 — Layout: Flexbox on Mobile

**What you will have at the end:** Deep understanding of how everything positions itself on screen. You will be able to put any element exactly where you want it.

---

## Part 1 — The Idea

### Why Flexbox?

CSS on the web has many layout systems — floats, grid, flexbox, positioning. React Native has one: **Flexbox**. Everything is Flexbox. Understanding it completely is the most important layout skill you can have in React Native.

### The two axes

Flexbox has a **main axis** and a **cross axis**. By default:
- Main axis: vertical (top to bottom)
- Cross axis: horizontal (left to right)

This is the opposite of the web, where the default main axis is horizontal. React Native chose vertical because phone screens are tall.

`flexDirection: 'column'` — main axis is vertical (default)
`flexDirection: 'row'` — main axis is horizontal

`justifyContent` controls spacing along the **main axis**.
`alignItems` controls alignment along the **cross axis**.

### The values

```
justifyContent:
  flex-start    — pack items at the start (top for column)
  flex-end      — pack items at the end (bottom for column)
  center        — centre items
  space-between — first at start, last at end, equal gaps between
  space-around  — equal space around each item
  space-evenly  — equal space between all items including edges

alignItems:
  flex-start    — align to the start of the cross axis (left for column)
  flex-end      — align to the end (right for column)
  center        — centre on the cross axis
  stretch       — stretch to fill the cross axis (default)
```

---

## Part 2 — The Smallest Example

Create a new file `LayoutPlayground.js` — this is just for experimenting, you will delete it later:

```javascript
import { View, Text, StyleSheet } from 'react-native';

export default function LayoutPlayground() {
  return (
    <View style={styles.container}>
      <View style={[styles.box, { backgroundColor: '#e74c3c' }]}>
        <Text style={styles.label}>1</Text>
      </View>
      <View style={[styles.box, { backgroundColor: '#3498db' }]}>
        <Text style={styles.label}>2</Text>
      </View>
      <View style={[styles.box, { backgroundColor: '#2ecc71' }]}>
        <Text style={styles.label}>3</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
    // Change these values and watch the boxes move
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  box: {
    width: 80,
    height: 80,
    margin: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
});
```

Use it temporarily in `App.js`:
```javascript
import LayoutPlayground from './LayoutPlayground';
export default function App() {
  return <LayoutPlayground />;
}
```

---

## Part 3 — Pull It Apart

Work through every one of these. Each teaches something you will use constantly:

**Experiment 1:** Change `flexDirection` to `'row'`. The boxes go horizontal.

**Experiment 2:** With `flexDirection: 'row'`, what do `justifyContent` and `alignItems` control now? The axes have swapped. `justifyContent` is now horizontal. `alignItems` is now vertical.

**Experiment 3:** Give the boxes different `flex` values:
```javascript
// Box 1: flex: 1
// Box 2: flex: 2
// Box 3: flex: 1
```
Remove the fixed `width` and `height` first. The boxes divide the available space proportionally — 1/4, 2/4, 1/4.

**Experiment 4:** Add `gap: 16` to the container. This is the spacing between children — much cleaner than adding margin to each child.

**Experiment 5:** `position: 'absolute'` removes an element from the layout flow entirely. Add a fourth box:
```javascript
<View style={[styles.box, {
  backgroundColor: '#f39c12',
  position: 'absolute',
  top: 20,
  right: 20,
}]}>
  <Text style={styles.label}>4</Text>
</View>
```
Box 4 sits in the top-right corner, overlapping everything. The other three boxes don't know it exists — it is outside the flow.

**Experiment 6:** `zIndex` controls which absolute element appears on top:
```javascript
// Higher zIndex = on top
zIndex: 10,
```

---

## Part 4 — Build It Real

The bottom navigation bar. Every TikTok screen has it. Create `components/BottomNav.js`:

```javascript
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const TABS = [
  { key: 'home',     icon: '🏠', label: 'Home' },
  { key: 'discover', icon: '🔍', label: 'Discover' },
  { key: 'create',   icon: '➕', label: '' },
  { key: 'inbox',    icon: '💬', label: 'Inbox' },
  { key: 'profile',  icon: '👤', label: 'Profile' },
];

function BottomNav({ activeTab, onTabPress }) {
  return (
    <View style={styles.container}>
      {TABS.map(tab => (
        <TouchableOpacity
          key={tab.key}
          style={styles.tab}
          onPress={() => onTabPress(tab.key)}
        >
          {/* The create button is styled differently */}
          {tab.key === 'create' ? (
            <View style={styles.createButton}>
              <Text style={styles.createIcon}>➕</Text>
            </View>
          ) : (
            <>
              <Text style={styles.icon}>{tab.icon}</Text>
              <Text style={[
                styles.label,
                activeTab === tab.key && styles.activeLabel
              ]}>
                {tab.label}
              </Text>
            </>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',        // horizontal row of tabs
    backgroundColor: '#000',
    paddingBottom: 20,           // space above home indicator on iPhone
    paddingTop: 10,
    borderTopWidth: 0.5,
    borderTopColor: '#333',
  },
  tab: {
    flex: 1,                     // each tab gets equal width
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  icon: {
    fontSize: 24,
  },
  label: {
    color: '#888',
    fontSize: 10,
  },
  activeLabel: {
    color: '#fff',
  },
  createButton: {
    backgroundColor: '#fe2c55',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  createIcon: {
    fontSize: 20,
    color: '#fff',
  },
});

export default BottomNav;
```

Add it to `App.js`:

```javascript
import { SafeAreaView, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import VideoCard from './components/VideoCard';
import BottomNav from './components/BottomNav';

const MOCK_VIDEO = {
  id: '1',
  username: '@maya',
  description: 'When the beat drops just right 🎵',
  song: 'Original Sound — maya',
  likes: 12400, comments: 843, shares: 221, uri: null,
};

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar hidden={true} />
      <View style={styles.feed}>
        <VideoCard video={MOCK_VIDEO} />
      </View>
      <BottomNav activeTab="home" onTabPress={(tab) => console.log(tab)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  feed: { flex: 1 },
});
```

---

## What You Learned

| Concept | What it means |
|---|---|
| Flexbox | The only layout system in React Native |
| `flexDirection` | Which axis children are arranged along |
| `justifyContent` | Spacing along the main axis |
| `alignItems` | Alignment along the cross axis |
| `flex: n` | Proportional space distribution |
| `position: 'absolute'` | Out of flow, positioned relative to parent |
| `gap` | Space between flex children |

---

## Challenges

**Challenge 1:** Make the active tab icon slightly larger than the inactive ones.

**Challenge 2:** Add a red notification dot to the inbox tab icon when there are unread messages. Add a prop `inboxCount` to `BottomNav` and show the dot when it is greater than zero.

---

# Lesson 4 — State: Making Things Change

**What you will have at the end:** The like button actually works — tap it, the count increases, the heart fills red. This is your first piece of real interactivity.

---

## Part 1 — The Idea

### The problem with plain variables

If you store data in a regular JavaScript variable, changing it does not update the screen. React does not know you changed it. The UI is frozen.

```javascript
// This does NOT work
let likes = 100;
function handleLike() {
  likes = likes + 1;  // screen does not update
}
```

### useState — the solution

`useState` is a React hook — a special function that connects your data to React's update system. When you change state through the setter function, React re-renders the component with the new value.

```javascript
const [likes, setLikes] = useState(100);
// likes     — the current value (read this)
// setLikes  — the function to change it (call this to update)
```

Calling `setLikes(101)` does two things:
1. Updates the value of `likes` to 101
2. Tells React to re-render this component

### The render cycle

Every time state changes, React calls your component function again with the new values and figures out the minimum DOM changes needed. This is why your UI is always in sync with your data — React re-runs the function, gets the new JSX, and updates only what changed.

### The rule

**Never mutate state directly.** Always use the setter.

```javascript
// Wrong — React does not see this change
likes = likes + 1;

// Right — React re-renders with the new value
setLikes(likes + 1);

// Also right — functional update (use when new state depends on old)
setLikes(prev => prev + 1);
```

---

## Part 2 — The Smallest Example

Create a new file `Counter.js` just for practice:

```javascript
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useState } from 'react';

export default function Counter() {
  // useState(0) means: start at 0
  const [count, setCount] = useState(0);

  return (
    <View style={styles.container}>
      <Text style={styles.count}>{count}</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => setCount(count + 1)}
      >
        <Text style={styles.buttonText}>+1</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
  count: { color: '#fff', fontSize: 64, marginBottom: 24 },
  button: { backgroundColor: '#fe2c55', padding: 16, borderRadius: 8 },
  buttonText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
});
```

---

## Part 3 — Pull It Apart

**Experiment 1:** Add a minus button. What happens if count goes below zero? Can you prevent it?
```javascript
onPress={() => setCount(Math.max(0, count - 1))}
```

**Experiment 2:** Try the direct mutation approach and confirm it does not work:
```javascript
// Replace the button's onPress with this
onPress={() => { count = count + 1; console.log(count); }}
```
The console shows the value increasing. The screen does not change. React never knew.

**Experiment 3:** Multiple state values — add a boolean for whether the count is "liked":
```javascript
const [count, setCount] = useState(0);
const [isLiked, setIsLiked] = useState(false);
```
Each call to `useState` manages one independent piece of state.

**Experiment 4:** What happens when you hold multiple pieces of related state?
```javascript
// Instead of two separate states, use an object
const [likeState, setLikeState] = useState({ count: 0, isLiked: false });

// To update, you must spread the old state and override the changed field
setLikeState(prev => ({ ...prev, count: prev.count + 1, isLiked: true }));
```
The `...prev` spread keeps all the other fields — without it you would lose them.

---

## Part 4 — Build It Real

Make the like button actually work. Update `ActionButtons.js`:

```javascript
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useState, useRef } from 'react';

function LikeButton({ initialLikes }) {
  const [likes, setLikes]   = useState(initialLikes);
  const [liked, setLiked]   = useState(false);
  const scaleAnim           = useRef(new Animated.Value(1)).current;

  function handleLike() {
    // Toggle like state
    const nowLiked = !liked;
    setLiked(nowLiked);
    setLikes(prev => nowLiked ? prev + 1 : prev - 1);

    // Bounce animation — we will explain Animated properly in Lesson 12
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.4, duration: 100, useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1.0, duration: 100, useNativeDriver: true,
      }),
    ]).start();
  }

  return (
    <TouchableOpacity style={styles.button} onPress={handleLike}>
      <Animated.Text
        style={[styles.icon, { transform: [{ scale: scaleAnim }] }]}
      >
        {liked ? '❤️' : '🤍'}
      </Animated.Text>
      <Text style={styles.count}>{formatCount(likes)}</Text>
    </TouchableOpacity>
  );
}

function formatCount(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000)    return (n / 1000).toFixed(1) + 'K';
  return String(n);
}

function ActionButton({ icon, count, onPress }) {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.count}>{formatCount(count)}</Text>
    </TouchableOpacity>
  );
}

function ActionButtons({ likes, comments, shares }) {
  return (
    <View style={styles.container}>
      <LikeButton initialLikes={likes} />
      <ActionButton icon="💬" count={comments} onPress={() => {}} />
      <ActionButton icon="↗️" count={shares}   onPress={() => {}} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 16,
    bottom: 120,
    alignItems: 'center',
    gap: 24,
  },
  button: { alignItems: 'center' },
  icon:  { fontSize: 32 },
  count: { color: '#fff', fontSize: 12, marginTop: 4, fontWeight: '600' },
});

export default ActionButtons;
```

---

## What You Learned

| Concept | What it means |
|---|---|
| `useState` | Connects data to React's render cycle |
| Setter function | The only correct way to update state |
| Re-render | React calls your component function again when state changes |
| Functional updates | `setLikes(prev => prev + 1)` — safe when new state depends on old |
| State isolation | Each component instance has its own state |

---

## Challenges

**Challenge 1:** Add a follow button to the `VideoInfo` component. It should toggle between "Follow" and "Following" and change colour when active.

**Challenge 2:** Track how many times the like button has been double-tapped quickly (within 300ms of the last tap). Show a ❤️ burst animation when the user double-taps.

---

# Lesson 5 — Lists: The FlatList and Why It Matters

**What you will have at the end:** A working feed of multiple video cards that you can scroll through vertically — the core mechanic of TikTok.

---

## Part 1 — The Idea

### The naive approach and why it breaks

The obvious way to show a list is to map over an array and render a component for each item:

```javascript
{videos.map(video => <VideoCard key={video.id} video={video} />)}
```

This works for small lists. For a feed of 100 videos it is a disaster — React Native renders all 100 at once, even the ones off screen. Memory fills up. The app slows to a crawl. On mobile this causes crashes.

### FlatList — the right tool

`FlatList` is React Native's optimised list component. It only renders the items currently visible on screen plus a small buffer. As you scroll, it recycles off-screen components and fills them with new data — like a conveyor belt. This is called **virtualisation**.

```javascript
<FlatList
  data={videos}
  keyExtractor={item => item.id}
  renderItem={({ item }) => <VideoCard video={item} />}
/>
```

Three required props:
- `data` — the array of items
- `keyExtractor` — a function that returns a unique string key for each item
- `renderItem` — a function that returns the JSX for each item

### Why keys matter

React uses keys to track which item is which when the list updates. Without keys, React has to guess — and it often guesses wrong, causing the wrong item to update or animations to glitch. Keys must be unique and stable — do not use the array index as a key if items can be reordered or deleted.

### `pagingEnabled` — the TikTok scroll

Setting `pagingEnabled={true}` on a FlatList makes it snap to the nearest item boundary when you lift your finger. Combined with each item being exactly the screen height, this creates the full-screen snap scroll that defines TikTok's UI.

---

## Part 2 — The Smallest Example

```javascript
import { FlatList, Text, View, StyleSheet } from 'react-native';

const DATA = [
  { id: '1', title: 'First item' },
  { id: '2', title: 'Second item' },
  { id: '3', title: 'Third item' },
];

export default function SimpleList() {
  return (
    <FlatList
      data={DATA}
      keyExtractor={item => item.id}
      renderItem={({ item }) => (
        <View style={styles.item}>
          <Text style={styles.text}>{item.title}</Text>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  item: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#333', backgroundColor: '#111' },
  text: { color: '#fff', fontSize: 18 },
});
```

---

## Part 3 — Pull It Apart

**Experiment 1:** Remove `keyExtractor` and see the warning. Add it back.

**Experiment 2:** Log inside `renderItem`:
```javascript
renderItem={({ item, index }) => {
  console.log('Rendering item', index);
  return <YourComponent />;
}}
```
Scroll the list and watch which indices get logged. Notice FlatList only renders what is visible — not the entire list.

**Experiment 3:** Add `horizontal={true}`. The list scrolls sideways. Now you see why TikTok's main feed uses `pagingEnabled` with vertical — and the Discover page uses horizontal.

**Experiment 4:** `showsVerticalScrollIndicator={false}` removes the scroll bar. TikTok does not show scroll bars.

---

## Part 4 — Build It Real

Create a `data/mockVideos.js` file with multiple fake videos:

```javascript
// data/mockVideos.js
export const MOCK_VIDEOS = [
  {
    id: '1',
    username: '@maya',
    description: 'When the beat drops just right 🎵✨ #music #vibes',
    song: 'Original Sound — maya',
    likes: 12400,
    comments: 843,
    shares: 221,
    uri: null,
    color: '#1a1a2e',
  },
  {
    id: '2',
    username: '@alex_codes',
    description: 'Built this in a weekend 💻 #coding #buildinpublic',
    song: 'Lo-fi Hip Hop Radio — Chillhop',
    likes: 8900,
    comments: 412,
    shares: 156,
    uri: null,
    color: '#0f3460',
  },
  {
    id: '3',
    username: '@chef_sara',
    description: 'Secret pasta recipe my nonna taught me 🍝 #cooking #recipe',
    song: 'Mambo Italiano — Rosemary Clooney',
    likes: 34200,
    comments: 2100,
    shares: 4300,
    uri: null,
    color: '#2d6a4f',
  },
  {
    id: '4',
    username: '@travel_kai',
    description: 'Found this hidden waterfall after 4 hours hiking 🏔️ #travel',
    song: 'Adventure Awaits — NCS',
    likes: 67000,
    comments: 1890,
    shares: 8400,
    uri: null,
    color: '#4a1942',
  },
  {
    id: '5',
    username: '@fitness_jo',
    description: '30 day transformation — consistency is everything 💪 #fitness',
    song: 'Eye of the Tiger — Survivor',
    likes: 91000,
    comments: 3400,
    shares: 12000,
    uri: null,
    color: '#7b2d00',
  },
];
```

Create `screens/FeedScreen.js`:

```javascript
import { FlatList, StyleSheet, Dimensions, View } from 'react-native';
import { useRef, useState, useCallback } from 'react';
import VideoCard from '../components/VideoCard';

const { height } = Dimensions.get('window');

function FeedScreen({ videos }) {
  // Track which video is currently visible so we can play/pause
  const [activeIndex, setActiveIndex] = useState(0);

  // useRef stores a value that persists between renders but does NOT
  // trigger a re-render when changed — unlike useState.
  // We use it here for the viewability config because it must be stable.
  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  });

  // useCallback memoises this function — prevents it being recreated
  // every render, which would break FlatList's optimisation.
  const onViewableItemsChanged = useCallback(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index);
    }
  }, []);

  return (
    <FlatList
      data={videos}
      keyExtractor={item => item.id}
      renderItem={({ item, index }) => (
        <VideoCard
          video={item}
          isActive={index === activeIndex}
        />
      )}
      // These props create the fullscreen snap scroll
      pagingEnabled={true}
      snapToInterval={height}
      snapToAlignment="start"
      decelerationRate="fast"
      // Performance props
      showsVerticalScrollIndicator={false}
      removeClippedSubviews={true}
      maxToRenderPerBatch={3}
      windowSize={5}
      // Viewability tracking — tells us which item is visible
      onViewableItemsChanged={onViewableItemsChanged}
      viewabilityConfig={viewabilityConfig.current}
    />
  );
}

export default FeedScreen;
```

Update `App.js`:

```javascript
import { SafeAreaView, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import FeedScreen from './screens/FeedScreen';
import BottomNav from './components/BottomNav';
import { MOCK_VIDEOS } from './data/mockVideos';
import { useState } from 'react';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar hidden={true} />
      <FeedScreen videos={MOCK_VIDEOS} />
      <BottomNav activeTab={activeTab} onTabPress={setActiveTab} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
});
```

Also update `VideoCard.js` to use the colour from mock data and respond to `isActive`:

```javascript
import { View, StyleSheet, Dimensions } from 'react-native';
import VideoInfo from './VideoInfo';
import ActionButtons from './ActionButtons';

const { width, height } = Dimensions.get('window');

function VideoCard({ video, isActive }) {
  return (
    <View style={[styles.card, { height }]}>
      <View style={[styles.background, { backgroundColor: video.color }]} />
      <VideoInfo
        username={video.username}
        description={video.description}
        song={video.song}
      />
      <ActionButtons
        likes={video.likes}
        comments={video.comments}
        shares={video.shares}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { width, overflow: 'hidden' },
  background: { flex: 1 },
});

export default VideoCard;
```

You now have a scrollable feed. Swipe up — it snaps to the next video. Swipe down — it goes back. The like button on each card has its own independent state.

---

## What You Learned

| Concept | What it means |
|---|---|
| `FlatList` | Virtualised list — only renders visible items |
| `keyExtractor` | Gives React a stable identity for each item |
| `pagingEnabled` | Snap scroll — the TikTok mechanic |
| `useRef` | Persist a value without triggering re-renders |
| `useCallback` | Memoise a function — prevent unnecessary recreation |
| `onViewableItemsChanged` | Know which item is currently visible |

---

## Challenges

**Challenge 1:** Add a `ScrollToTop` button that appears after the user has scrolled past 3 videos. Tapping it jumps back to the first video. Hint: `FlatList` has a `scrollToIndex` method you can call via a ref.

**Challenge 2:** Show a subtle progress indicator at the bottom — a row of dots where the active one is white and the rest are grey.

---

# Lesson 6 — Video: Playing Media in React Native

**What you will have at the end:** Real videos playing in the feed — full screen, looping, automatically playing when scrolled to and pausing when scrolled away.

---

## Part 1 — The Idea

### expo-av

React Native does not include video playback in its core library. Expo provides `expo-av` — a package for audio and video. Install it:

```bash
npx expo install expo-av
```

`npx expo install` (not `npm install`) — Expo's version ensures the package is compatible with your Expo version.

### How video works in a feed

Three rules for a TikTok-style video feed:

1. **Only the active video plays.** Everything else is paused. This saves battery and bandwidth.
2. **Videos loop** — when they reach the end they start again.
3. **The transition is instant** — the new video is already loaded before the user finishes swiping.

The `isActive` prop we added in Lesson 5 already tracks which video is active. Now we use it to control playback.

### The Video component

```javascript
<Video
  source={{ uri: 'https://...' }}
  style={styles.video}
  shouldPlay={isActive}      // play only when active
  isLooping={true}
  resizeMode="cover"         // fill the screen, crop if needed
  isMuted={isMuted}
/>
```

`resizeMode="cover"` is important — it fills the container and crops, like `object-fit: cover` in CSS. This ensures the video always fills the screen regardless of its dimensions.

---

## Part 2 — The Smallest Example

```javascript
import { Video } from 'expo-av';
import { View, StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

const TEST_VIDEO = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

export default function VideoTest() {
  return (
    <View style={styles.container}>
      <Video
        source={{ uri: TEST_VIDEO }}
        style={styles.video}
        shouldPlay={true}
        isLooping={true}
        resizeMode="cover"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  video: { width, height },
});
```

A video plays fullscreen. Notice it starts immediately because `shouldPlay={true}`.

---

## Part 3 — Pull It Apart

**Experiment 1:** Change `shouldPlay` to `false`. The video does not play. Change it to `true`. It plays. This is how we control playback with `isActive`.

**Experiment 2:** Change `resizeMode` to `"contain"`. The video fits inside the container with black bars. Change to `"cover"`. It fills the screen. `"cover"` is correct for TikTok.

**Experiment 3:** Add `isMuted={true}`. No audio. Add a state variable and a button to toggle it:
```javascript
const [muted, setMuted] = useState(false);
<Video isMuted={muted} ... />
<Button onPress={() => setMuted(m => !m)} title="Toggle Mute" />
```

**Experiment 4:** Use `useRef` to get a reference to the Video component and control it programmatically:
```javascript
const videoRef = useRef(null);
<Video ref={videoRef} ... />

// Seek to 10 seconds
videoRef.current.setPositionAsync(10000);  // milliseconds
```

---

## Part 4 — Build It Real

Update `VideoCard.js` to play real video:

```javascript
import { View, StyleSheet, Dimensions, TouchableWithoutFeedback } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { useRef, useState } from 'react';
import VideoInfo from './VideoInfo';
import ActionButtons from './ActionButtons';

const { width, height } = Dimensions.get('window');

function VideoCard({ video, isActive }) {
  const videoRef           = useRef(null);
  const [muted, setMuted]  = useState(false);
  const [paused, setPaused] = useState(false);

  function handleTap() {
    setPaused(p => !p);
  }

  const shouldPlay = isActive && !paused;

  return (
    <TouchableWithoutFeedback onPress={handleTap}>
      <View style={[styles.card, { height }]}>

        {video.uri ? (
          <Video
            ref={videoRef}
            source={{ uri: video.uri }}
            style={styles.video}
            shouldPlay={shouldPlay}
            isLooping={true}
            isMuted={muted}
            resizeMode={ResizeMode.COVER}
          />
        ) : (
          // Placeholder colour when no video is available
          <View style={[styles.placeholder, { backgroundColor: video.color }]} />
        )}

        <VideoInfo
          username={video.username}
          description={video.description}
          song={video.song}
          muted={muted}
          onMuteToggle={() => setMuted(m => !m)}
        />

        <ActionButtons
          likes={video.likes}
          comments={video.comments}
          shares={video.shares}
        />

      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  card:        { width, overflow: 'hidden' },
  video:       { position: 'absolute', top: 0, left: 0, width, height },
  placeholder: { flex: 1 },
});

export default VideoCard;
```

Update your mock data to include real video URIs. These are free sample videos:

```javascript
// data/mockVideos.js
export const MOCK_VIDEOS = [
  {
    id: '1',
    username: '@maya',
    description: 'When the beat drops just right 🎵',
    song: 'Original Sound — maya',
    likes: 12400, comments: 843, shares: 221,
    uri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    color: '#1a1a2e',
  },
  {
    id: '2',
    username: '@alex_codes',
    description: 'Built this in a weekend 💻',
    song: 'Lo-fi Hip Hop',
    likes: 8900, comments: 412, shares: 156,
    uri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    color: '#0f3460',
  },
  {
    id: '3',
    username: '@chef_sara',
    description: 'Secret pasta recipe 🍝',
    song: 'Mambo Italiano',
    likes: 34200, comments: 2100, shares: 4300,
    uri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    color: '#2d6a4f',
  },
];
```

---

## What You Learned

| Concept | What it means |
|---|---|
| `expo-av` | Expo's audio/video package |
| `shouldPlay` | Declarative playback control |
| `isLooping` | Auto-restart when video ends |
| `ResizeMode.COVER` | Fill and crop to fit container |
| `useRef` on a component | Direct access to component methods |
| Active video tracking | Only play the visible item |

---

## Challenges

**Challenge 1:** Show a pause icon briefly in the centre of the screen when the user taps to pause, then fade it out after 800ms.

**Challenge 2:** Show a loading spinner while the video is buffering. `expo-av` fires a status callback — use `onPlaybackStatusUpdate` to track `isBuffering`.

---

# Lesson 7 — Navigation: Tabs and Screens

**What you will have at the end:** Real tab navigation — tapping Home, Discover, Profile takes you to different screens.

---

## Part 1 — The Idea

### What navigation is

So far everything lives in one screen. A real app has multiple screens and a way to move between them. This is navigation.

React Navigation is the standard library for this in React Native. Install it:

```bash
npm install @react-navigation/native @react-navigation/bottom-tabs
npx expo install react-native-screens react-native-safe-area-context
```

### The navigator mental model

React Navigation works with **navigators** and **screens**. A navigator defines a structure (tabs, stack, drawer). Screens are the components that fill each slot.

```javascript
<Tab.Navigator>
  <Tab.Screen name="Home"    component={HomeScreen} />
  <Tab.Screen name="Profile" component={ProfileScreen} />
</Tab.Navigator>
```

React Navigation handles the back button, the transitions, the active tab tracking, and the history. You just define the structure.

### Stack vs Tab navigation

**Tab navigation:** multiple screens visible at once as tabs. Switching does not destroy the previous screen — it hides it.

**Stack navigation:** screens stacked on top of each other. Going back pops the top screen. Used for drill-down flows like Feed → Comments → Reply.

TikTok uses both: tabs at the bottom for the main sections, a stack inside each tab for sub-screens.

---

## Part 2 — The Smallest Example

Wrap your app in a NavigationContainer and add a simple tab navigator:

```javascript
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View } from 'react-native';

const Tab = createBottomTabNavigator();

function HomeScreen()    { return <View style={{flex:1,backgroundColor:'#000',justifyContent:'center',alignItems:'center'}}><Text style={{color:'#fff'}}>Home</Text></View>; }
function ProfileScreen() { return <View style={{flex:1,backgroundColor:'#000',justifyContent:'center',alignItems:'center'}}><Text style={{color:'#fff'}}>Profile</Text></View>; }

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Home"    component={HomeScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
```

Tabs appear at the bottom. Tapping switches screens. The default styling is plain — we will replace it.

---

## Part 3 — Pull It Apart

**Experiment 1:** Add a `screenOptions` prop to hide the header bar that appears above each screen:
```javascript
<Tab.Navigator screenOptions={{ headerShown: false }}>
```

**Experiment 2:** Customise the tab bar appearance:
```javascript
screenOptions={{
  headerShown: false,
  tabBarStyle: { backgroundColor: '#000', borderTopColor: '#333' },
  tabBarActiveTintColor: '#fff',
  tabBarInactiveTintColor: '#666',
}}
```

**Experiment 3:** Each screen receives a `navigation` prop automatically. Use it to navigate programmatically:
```javascript
function HomeScreen({ navigation }) {
  return (
    <Button
      title="Go to Profile"
      onPress={() => navigation.navigate('Profile')}
    />
  );
}
```

---

## Part 4 — Build It Real

Create the full navigation structure. First create placeholder screens:

`screens/DiscoverScreen.js`, `screens/InboxScreen.js`, `screens/ProfileScreen.js` — each just a black screen with centred text for now. We will build `ProfileScreen` fully in Lesson 10.

Then build `navigation/AppNavigator.js`:

```javascript
import { NavigationContainer }            from '@react-navigation/native';
import { createBottomTabNavigator }       from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import FeedScreen    from '../screens/FeedScreen';
import DiscoverScreen from '../screens/DiscoverScreen';
import InboxScreen   from '../screens/InboxScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { MOCK_VIDEOS } from '../data/mockVideos';

const Tab = createBottomTabNavigator();

// Custom tab bar — replaces the default one entirely
function CustomTabBar({ state, descriptors, navigation }) {
  const ICONS = {
    Home:     { active: '🏠', inactive: '🏠' },
    Discover: { active: '🔍', inactive: '🔍' },
    Create:   { active: '➕', inactive: '➕' },
    Inbox:    { active: '💬', inactive: '💬' },
    Profile:  { active: '👤', inactive: '👤' },
  };

  return (
    <View style={styles.tabBar}>
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        const isCreate  = route.name === 'Create';

        function onPress() {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        }

        return (
          <TouchableOpacity
            key={route.key}
            style={styles.tab}
            onPress={onPress}
          >
            {isCreate ? (
              <View style={styles.createBtn}>
                <Text style={styles.createIcon}>＋</Text>
              </View>
            ) : (
              <>
                <Text style={styles.tabIcon}>{ICONS[route.name]?.inactive}</Text>
                <Text style={[styles.tabLabel, isFocused && styles.activeLabel]}>
                  {route.name}
                </Text>
              </>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        tabBar={props => <CustomTabBar {...props} />}
        screenOptions={{ headerShown: false }}
      >
        <Tab.Screen name="Home"     component={() => <FeedScreen videos={MOCK_VIDEOS} />} />
        <Tab.Screen name="Discover" component={DiscoverScreen} />
        <Tab.Screen name="Create"   component={DiscoverScreen} />
        <Tab.Screen name="Inbox"    component={InboxScreen} />
        <Tab.Screen name="Profile"  component={ProfileScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#000',
    paddingBottom: 24,
    paddingTop: 10,
    borderTopWidth: 0.5,
    borderTopColor: '#222',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  tabIcon:    { fontSize: 22 },
  tabLabel:   { color: '#888', fontSize: 10 },
  activeLabel:{ color: '#fff' },
  createBtn: {
    backgroundColor: '#fe2c55',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  createIcon: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
});
```

Update `App.js` to use the navigator:

```javascript
import AppNavigator from './navigation/AppNavigator';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  return (
    <>
      <StatusBar hidden={true} />
      <AppNavigator />
    </>
  );
}
```

---

## What You Learned

| Concept | What it means |
|---|---|
| React Navigation | The standard navigation library |
| `NavigationContainer` | Wraps the whole app — required |
| Tab navigator | Multiple screens as tabs |
| Stack navigator | Screens stacked, with back button |
| `navigation` prop | Passed to every screen — use to navigate |
| Custom tab bar | Replace the default tab bar entirely |

---

## Challenges

**Challenge 1:** Add a red badge number to the Inbox tab when there are unread messages. Pass a count as a prop and show it as an overlay on the icon.

**Challenge 2:** Build a simple stack navigator inside the Home tab so that tapping a username in the feed navigates to a user profile screen, with a back button.

---

# Lesson 8 — The Comment Sheet

**What you will have at the end:** A slide-up comments panel when you tap the comment button — with a list of comments, a text input, and keyboard-aware layout.

---

## Part 1 — The Idea

### Bottom sheets

A bottom sheet is a panel that slides up from the bottom of the screen. It partially covers the content behind it. TikTok uses this for comments, share options, and the create menu.

We will build this ourselves first to understand it, then you will see why a library like `@gorhom/bottom-sheet` exists.

### Keyboard avoiding

When the user taps the text input to type a comment, the keyboard slides up. Without keyboard handling, the keyboard covers the input and the user cannot see what they are typing. `KeyboardAvoidingView` fixes this.

### Modal

React Native's `Modal` component renders content in a layer on top of everything else. We use it for the comment sheet so it overlays the video.

---

## Part 2 — The Smallest Example

```javascript
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useState } from 'react';

export default function ModalExample() {
  const [visible, setVisible] = useState(false);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
      <TouchableOpacity onPress={() => setVisible(true)}>
        <Text style={{ color: '#fff', fontSize: 20 }}>Open sheet</Text>
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent={true}          // content below is still visible
        animationType="slide"       // slides up from the bottom
        onRequestClose={() => setVisible(false)}
      >
        <View style={styles.overlay}>
          <TouchableOpacity style={styles.backdrop} onPress={() => setVisible(false)} />
          <View style={styles.sheet}>
            <Text style={{ color: '#fff', fontSize: 18 }}>I am a bottom sheet</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay:  { flex: 1, justifyContent: 'flex-end' },
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)' },
  sheet:    { backgroundColor: '#1a1a1a', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, height: '60%' },
});
```

---

## Part 3 — Pull It Apart

**Experiment 1:** Change `animationType` to `"fade"`, then `"none"`. See the difference.

**Experiment 2:** Remove `transparent={true}`. The background goes black — the modal covers everything. Add it back.

**Experiment 3:** Add a `TextInput` to the sheet and watch it get covered by the keyboard:
```javascript
import { TextInput } from 'react-native';
<TextInput style={{ color: '#fff', borderWidth: 1, borderColor: '#333', padding: 8 }} placeholder="Type here" placeholderTextColor="#666" />
```
Now wrap the sheet content in `KeyboardAvoidingView`:
```javascript
import { KeyboardAvoidingView, Platform } from 'react-native';
<KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
  {/* content */}
</KeyboardAvoidingView>
```
The input stays above the keyboard.

---

## Part 4 — Build It Real

Create `components/CommentSheet.js`:

```javascript
import {
  Modal, View, Text, TextInput, FlatList, TouchableOpacity,
  KeyboardAvoidingView, Platform, StyleSheet, Dimensions,
} from 'react-native';
import { useState } from 'react';

const MOCK_COMMENTS = [
  { id: '1', username: '@user1', text: 'This is amazing! 🔥', likes: 234 },
  { id: '2', username: '@user2', text: 'How did you do that?',  likes: 89 },
  { id: '3', username: '@user3', text: 'Love your content ❤️',  likes: 456 },
  { id: '4', username: '@user4', text: 'Following for more!',   likes: 12 },
  { id: '5', username: '@user5', text: 'This made my day 😂',    likes: 678 },
];

function Comment({ item }) {
  const [liked, setLiked] = useState(false);
  return (
    <View style={styles.comment}>
      <View style={styles.commentBody}>
        <Text style={styles.commentUsername}>{item.username}</Text>
        <Text style={styles.commentText}>{item.text}</Text>
      </View>
      <TouchableOpacity onPress={() => setLiked(l => !l)} style={styles.commentLike}>
        <Text style={styles.commentLikeIcon}>{liked ? '❤️' : '🤍'}</Text>
        <Text style={styles.commentLikeCount}>{item.likes + (liked ? 1 : 0)}</Text>
      </TouchableOpacity>
    </View>
  );
}

function CommentSheet({ visible, onClose, commentCount }) {
  const [comments, setComments] = useState(MOCK_COMMENTS);
  const [text, setText]         = useState('');

  function submitComment() {
    if (!text.trim()) return;
    const newComment = {
      id:       String(Date.now()),
      username: '@you',
      text:     text.trim(),
      likes:    0,
    };
    setComments(prev => [newComment, ...prev]);
    setText('');
  }

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} onPress={onClose} />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.sheet}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{commentCount} comments</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeBtn}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Drag handle */}
          <View style={styles.handle} />

          {/* Comment list */}
          <FlatList
            data={comments}
            keyExtractor={item => item.id}
            renderItem={({ item }) => <Comment item={item} />}
            showsVerticalScrollIndicator={false}
          />

          {/* Input */}
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={text}
              onChangeText={setText}
              placeholder="Add a comment..."
              placeholderTextColor="#666"
              returnKeyType="send"
              onSubmitEditing={submitComment}
            />
            <TouchableOpacity onPress={submitComment} style={styles.sendBtn}>
              <Text style={styles.sendIcon}>↑</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay:  { flex: 1, justifyContent: 'flex-end' },
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)' },
  sheet:    { backgroundColor: '#1a1a1a', borderTopLeftRadius: 16, borderTopRightRadius: 16, height: '70%', paddingHorizontal: 16 },
  handle:   { width: 40, height: 4, backgroundColor: '#444', borderRadius: 2, alignSelf: 'center', marginVertical: 12 },
  header:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 12 },
  headerTitle: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  closeBtn: { color: '#888', fontSize: 18 },
  comment:  { flexDirection: 'row', paddingVertical: 12, alignItems: 'flex-start' },
  commentBody: { flex: 1 },
  commentUsername: { color: '#888', fontSize: 13, marginBottom: 4 },
  commentText:     { color: '#fff', fontSize: 14, lineHeight: 20 },
  commentLike: { alignItems: 'center', paddingLeft: 12 },
  commentLikeIcon:  { fontSize: 18 },
  commentLikeCount: { color: '#888', fontSize: 11, marginTop: 2 },
  inputRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 8 },
  input:    { flex: 1, backgroundColor: '#2a2a2a', color: '#fff', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14 },
  sendBtn:  { backgroundColor: '#fe2c55', width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  sendIcon: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});

export default CommentSheet;
```

Now wire it into `ActionButtons.js` — add state for sheet visibility and pass the comment button an `onPress` that opens it.

---

## What You Learned

| Concept | What it means |
|---|---|
| `Modal` | Renders over everything else |
| `transparent` | Content below stays visible |
| `animationType` | How the modal appears |
| `KeyboardAvoidingView` | Moves content above the keyboard |
| `Platform.OS` | Check if running on iOS or Android |
| Bottom sheet pattern | Modal + `justifyContent: 'flex-end'` |

---

## Challenges

**Challenge 1:** Add a reply feature — tapping Reply on a comment pre-fills the input with `@username`.

**Challenge 2:** Add comment sorting — a row of chips at the top (Top, Recent) that re-orders the comment list.

---

# Lesson 9 — The Camera

> ⚠️ **Stop here before continuing.** Camera setup is highly dependent on your physical device, OS version, and Expo configuration. Work through Lessons 1–8 fully first. When you are ready for Lesson 9, come back to the conversation and we will work through the camera setup together in real time — there are too many device-specific issues to handle in a static document.

**What this lesson covers:** Using `expo-camera` to record video, the permissions model on iOS and Android, the create screen, and picking videos from the camera roll.

**What you need before starting:**
- A physical device (camera does not work reliably on simulators)
- Lessons 1–8 complete and working
- Come back to the conversation

---

# Lesson 10 — The Profile Screen

**What you will have at the end:** A profile screen with a header, stats (followers/following/likes), a tab bar for Videos and Liked, and a grid of video thumbnails.

---

## Part 1 — The Idea

### The profile layout

TikTok's profile has three visual sections:

1. **Header** — avatar, username, bio, follow button
2. **Stats row** — following count, followers count, likes count
3. **Content tabs** — Videos grid and Liked grid

The grid of videos is a three-column layout. We build this with `FlatList` using `numColumns={3}`.

### useWindowDimensions

Instead of `Dimensions.get('window')` (which does not update on rotation), we use the `useWindowDimensions` hook — it returns the current dimensions and re-renders the component if they change.

---

## Part 2 — The Smallest Example

A three-column grid:

```javascript
import { FlatList, View, Text, StyleSheet, useWindowDimensions } from 'react-native';

const ITEMS = Array.from({ length: 12 }, (_, i) => ({ id: String(i) }));

export default function GridExample() {
  const { width } = useWindowDimensions();
  const itemSize  = width / 3 - 2;   // 3 columns with 1px gaps

  return (
    <FlatList
      data={ITEMS}
      numColumns={3}
      keyExtractor={item => item.id}
      renderItem={({ item }) => (
        <View style={[styles.item, { width: itemSize, height: itemSize }]}>
          <Text style={styles.text}>{item.id}</Text>
        </View>
      )}
      ItemSeparatorComponent={() => <View style={{ height: 2 }} />}
    />
  );
}

const styles = StyleSheet.create({
  item: { backgroundColor: '#1a1a1a', margin: 1, justifyContent: 'center', alignItems: 'center' },
  text: { color: '#fff' },
});
```

---

## Part 3 — Pull It Apart

**Experiment 1:** Change `numColumns` to 2, then 4. Notice how `itemSize` must change to match.

**Experiment 2:** `ItemSeparatorComponent` renders between items but not after the last one. Try adding `ListHeaderComponent` and `ListFooterComponent`.

**Experiment 3:** A `FlatList` with `numColumns` requires that when you change `numColumns`, you also change `key` on the FlatList itself — otherwise React Native crashes. Try it and see.

---

## Part 4 — Build It Real

Create `screens/ProfileScreen.js`:

```javascript
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  useWindowDimensions, Image, ScrollView,
} from 'react-native';
import { useState } from 'react';
import { MOCK_VIDEOS } from '../data/mockVideos';

function StatItem({ value, label }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function VideoThumbnail({ video, size }) {
  return (
    <TouchableOpacity style={[styles.thumbnail, { width: size, height: size * 1.3 }]}>
      <View style={[styles.thumbnailBg, { backgroundColor: video.color }]} />
      <Text style={styles.thumbnailLikes}>▶ {(video.likes/1000).toFixed(1)}K</Text>
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const { width }        = useWindowDimensions();
  const [tab, setTab]    = useState('videos');
  const [following, setFollowing] = useState(false);
  const thumbSize        = width / 3 - 1;

  return (
    <View style={styles.container}>
      <FlatList
        data={tab === 'videos' ? MOCK_VIDEOS : []}
        numColumns={3}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <VideoThumbnail video={item} size={thumbSize} />
        )}
        ItemSeparatorComponent={() => <View style={{ height: 1 }} />}
        ListHeaderComponent={(
          <View>
            {/* Avatar */}
            <View style={styles.avatarSection}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>M</Text>
              </View>
              <Text style={styles.username}>@maya</Text>
              <Text style={styles.bio}>Creating things that make people smile 😊{'\n'}New video every day</Text>

              {/* Follow button */}
              <TouchableOpacity
                style={[styles.followBtn, following && styles.followingBtn]}
                onPress={() => setFollowing(f => !f)}
              >
                <Text style={[styles.followBtnText, following && styles.followingBtnText]}>
                  {following ? 'Following' : 'Follow'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Stats */}
            <View style={styles.statsRow}>
              <StatItem value="234"  label="Following" />
              <StatItem value="1.2M" label="Followers" />
              <StatItem value="8.4M" label="Likes" />
            </View>

            {/* Tab bar */}
            <View style={styles.tabBar}>
              {['videos', 'liked'].map(t => (
                <TouchableOpacity
                  key={t}
                  style={[styles.tabItem, tab === t && styles.activeTab]}
                  onPress={() => setTab(t)}
                >
                  <Text style={styles.tabIcon}>{t === 'videos' ? '⊞' : '❤️'}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: '#000' },
  avatarSection: { alignItems: 'center', paddingTop: 20, paddingBottom: 16 },
  avatar:        { width: 90, height: 90, borderRadius: 45, backgroundColor: '#fe2c55', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarText:    { color: '#fff', fontSize: 36, fontWeight: 'bold' },
  username:      { color: '#fff', fontWeight: 'bold', fontSize: 18, marginBottom: 8 },
  bio:           { color: '#aaa', fontSize: 14, textAlign: 'center', paddingHorizontal: 32, lineHeight: 20, marginBottom: 16 },
  followBtn:     { backgroundColor: '#fe2c55', paddingHorizontal: 40, paddingVertical: 10, borderRadius: 4 },
  followingBtn:  { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#666' },
  followBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  followingBtnText: { color: '#888' },
  statsRow:      { flexDirection: 'row', justifyContent: 'center', gap: 40, paddingVertical: 16, borderBottomWidth: 0.5, borderBottomColor: '#222' },
  stat:          { alignItems: 'center' },
  statValue:     { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  statLabel:     { color: '#888', fontSize: 12, marginTop: 2 },
  tabBar:        { flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: '#222' },
  tabItem:       { flex: 1, alignItems: 'center', paddingVertical: 12 },
  activeTab:     { borderBottomWidth: 2, borderBottomColor: '#fff' },
  tabIcon:       { fontSize: 20, color: '#fff' },
  thumbnail:     { margin: 0.5, overflow: 'hidden' },
  thumbnailBg:   { flex: 1 },
  thumbnailLikes:{ position: 'absolute', bottom: 6, left: 6, color: '#fff', fontSize: 11, fontWeight: '600' },
});
```

---

## What You Learned

| Concept | What it means |
|---|---|
| `numColumns` | Multi-column FlatList |
| `ListHeaderComponent` | Content rendered above the list items |
| `useWindowDimensions` | Responsive dimensions that update on rotation |
| Profile architecture | Header + stats + tabs + grid, all as one FlatList |

---

## Challenges

**Challenge 1:** Add an edit profile mode. When the user taps "Edit Profile" (replacing the Follow button on your own profile), the bio becomes an editable `TextInput`.

**Challenge 2:** Make the profile header collapse as the user scrolls down — the avatar shrinks and the username moves into the nav bar. This uses `Animated` values driven by scroll position.

---

# Lesson 11 — Connecting a Backend

> ⚠️ **Come back to the conversation before starting this lesson.** Your backend choices depend on what you already have set up. We will walk through connecting to a real API together. The concepts below teach you everything you need to understand what is happening.

**What this lesson covers:** `fetch()` in React Native, the `useEffect` hook for data fetching, loading and error states, and how to replace mock data with real API calls.

---

## Part 1 — The Idea (read this now)

### useEffect

`useEffect` is a hook that runs side effects — things that happen *outside* the render cycle. Fetching data, setting up a timer, subscribing to an event.

```javascript
useEffect(() => {
  // This runs after the component renders
  fetchVideos().then(setVideos);
}, []);  // [] means "run once on mount"
```

The second argument is the **dependency array**. If empty, the effect runs once when the component first appears. If it contains values, the effect re-runs whenever those values change.

### The three states of a fetch

Every data fetch has three states you must handle:

```javascript
const [videos,  setVideos]  = useState([]);
const [loading, setLoading] = useState(true);
const [error,   setError]   = useState(null);

useEffect(() => {
  fetch('/api/videos')
    .then(res => res.json())
    .then(data => {
      setVideos(data);
      setLoading(false);
    })
    .catch(err => {
      setError(err.message);
      setLoading(false);
    });
}, []);

if (loading) return <LoadingSpinner />;
if (error)   return <ErrorMessage message={error} />;
return <FeedScreen videos={videos} />;
```

Never skip the loading and error states. Your app will look broken without them.

### Come back to the conversation

When you are ready to connect a real backend, come back. We will set up a simple Express or FastAPI server together, add the real fetch calls, handle authentication, and wire it all up. Doing this without being able to answer questions in real time leads to frustration.

---

# Lesson 12 — Polish: Animations and the Real Feel

**What you will have at the end:** The app feels like a real app — smooth animations, haptic feedback, loading skeletons, and the small details that make the difference.

---

## Part 1 — The Idea

### What makes an app feel good

The difference between an app that works and an app that feels good is almost entirely in the transitions and feedback:

- Buttons give a slight scale down when pressed
- New content fades in instead of appearing instantly
- The like button bounces when tapped
- The phone vibrates when you follow someone
- Content shows a skeleton while loading instead of a blank space

None of these are functional. All of them matter.

### Animated API

React Native's `Animated` library provides values that drive smooth animations without re-rendering the component on every frame.

```javascript
const scale = useRef(new Animated.Value(1)).current;

function animatePress() {
  Animated.sequence([
    Animated.timing(scale, { toValue: 0.95, duration: 80, useNativeDriver: true }),
    Animated.timing(scale, { toValue: 1.0,  duration: 80, useNativeDriver: true }),
  ]).start();
}

<Animated.View style={{ transform: [{ scale }] }}>
  <Button onPress={animatePress} />
</Animated.View>
```

`useNativeDriver: true` runs the animation on the native thread — it is smooth even if JavaScript is busy. Always use it when you can (for transform and opacity animations).

---

## Part 2 — Haptic Feedback

```bash
npx expo install expo-haptics
```

```javascript
import * as Haptics from 'expo-haptics';

// When the user likes a video
async function handleLike() {
  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  setLiked(true);
}

// When the user follows someone
async function handleFollow() {
  await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  setFollowing(true);
}
```

Three feedback styles: `Light`, `Medium`, `Heavy`.
Three notification types: `Success`, `Warning`, `Error`.

Use haptics sparingly — every tap should not vibrate. Like, follow, and share are good candidates.

---

## Part 3 — Skeleton Loading

A skeleton is a placeholder that matches the shape of the real content. It shows while data is loading so the screen never looks empty.

```javascript
import { View, StyleSheet } from 'react-native';
import { useRef, useEffect } from 'react';
import { Animated } from 'react-native';

function Skeleton({ width, height, borderRadius = 4, style }) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.8, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={[{ width, height, borderRadius, backgroundColor: '#333', opacity }, style]}
    />
  );
}

// Use it like this while content is loading:
function VideoCardSkeleton() {
  return (
    <View style={{ flex: 1, backgroundColor: '#000', padding: 16, justifyContent: 'flex-end', gap: 8 }}>
      <Skeleton width={120} height={16} />
      <Skeleton width={220} height={12} />
      <Skeleton width={180} height={12} />
    </View>
  );
}
```

---

## Part 4 — The Pressable Scale Effect

Make every button feel responsive:

```javascript
import { Pressable } from 'react-native';

// Pressable gives you access to the pressed state directly
<Pressable
  style={({ pressed }) => [
    styles.button,
    pressed && { transform: [{ scale: 0.92 }], opacity: 0.8 },
  ]}
  onPress={handlePress}
>
  {children}
</Pressable>
```

`Pressable` is the modern replacement for `TouchableOpacity` — it gives you full control over the pressed state via a style function.

---

## Part 5 — Build It Real: Polish Pass

Work through every interactive element in your app and add:

1. **Scale feedback** on all buttons using `Pressable`
2. **Haptic feedback** on like and follow
3. **Fade in** on VideoCard when it becomes active:

```javascript
// In VideoCard, animate opacity when isActive changes
const opacity = useRef(new Animated.Value(0)).current;

useEffect(() => {
  if (isActive) {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }
}, [isActive]);

<Animated.View style={[styles.card, { opacity }]}>
  {/* card content */}
</Animated.View>
```

4. **Number counter animation** when like count changes:

```javascript
// Animate a number changing using Animated.Value
// and interpolate it to a text display
```

5. **Loading skeleton** in FeedScreen while videos are fetching

---

## What You Learned Across All 12 Lessons

| Lesson | Core concept |
|---|---|
| 1 | React Native, Expo, components, JSX |
| 2 | Props, composition, component files |
| 3 | Flexbox layout system |
| 4 | State, useState, re-rendering |
| 5 | FlatList, virtualisation, pagingEnabled |
| 6 | Video playback, expo-av, active tracking |
| 7 | React Navigation, tab and stack navigators |
| 8 | Modal, bottom sheets, keyboard handling |
| 9 | Camera, permissions (continue in conversation) |
| 10 | Profile screen, grid layout, ListHeaderComponent |
| 11 | useEffect, data fetching, loading/error states (continue in conversation) |
| 12 | Animated, haptics, skeleton loading, Pressable |

---

## What Comes Next

You have built a real TikTok clone. The things that would turn this into a shippable app:

- **Authentication** — sign up, log in, JWT tokens
- **Real backend** — storing videos, users, likes in a database
- **Video upload** — sending recorded video to a server
- **Push notifications** — when someone likes your video
- **App store deployment** — building and submitting to Apple and Google

Each of these is its own series. Come back to the conversation and we will pick whichever one matters most to you next.
