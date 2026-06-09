# TikTok Clone — Lesson 1
## What React Native Is and Your First Screen

**Time:** 45–60 minutes  
**What you will have at the end:** A running app on your phone or simulator showing a screen you built yourself.

---

## Part 1 — The Idea

### What problem does React Native solve?

Phones run two completely different operating systems — iOS and Android. Normally, to build an app for both you would need to write it twice: once in Swift for iOS, once in Kotlin for Android. Two codebases. Two sets of skills. Twice the work.

React Native solves this by letting you write your app once in JavaScript, and then compiling it to native code for both platforms. One codebase, two apps.

### What is React?

React is a way of thinking about user interfaces. The core idea is simple:

**Your UI is a function of your data.**

That sentence is worth sitting with. It means: given some data, your interface always looks the same. Change the data, the interface updates automatically. You never manually reach into the screen and move things around. You just describe what the screen should look like for a given state of data, and React handles the rest.

This is very different from the old way, where you would do things like:

```
find the button
change its colour
find the counter
update its text
```

In React you just say: "when likes = 42, the screen looks like this." React figures out what changed and updates only those parts.

### What is Expo?

Building a React Native app from scratch involves a lot of configuration — setting up Xcode, Android Studio, build pipelines. Expo wraps all of that complexity so you can skip it entirely and just write your app.

Expo also gives you a phone app called **Expo Go** that lets you run your app on a real device instantly by scanning a QR code. No cable, no build step, no waiting.

### The mental model before we write anything

A React Native app is made of **components**. A component is a building block — a chunk of UI with its own logic. The entire screen is a component. The video player inside it is a component. The like button inside that is a component.

Components nest inside each other like boxes inside boxes. The whole app is one big component made of smaller components made of even smaller components.

Right now that might sound abstract. It will become concrete in about ten minutes.

---

## Part 2 — The Smallest Example

### Step 1: Install Expo on your phone

Before we write any code, install **Expo Go** on your phone:
- iPhone: search "Expo Go" in the App Store
- Android: search "Expo Go" in the Play Store

You will use this to see your app in seconds.

### Step 2: Create the project

Open your terminal and run these commands one at a time:

```bash
npx create-expo-app tiktok-clone
```

When it asks about a template, choose **Blank**.

```bash
cd tiktok-clone
```

```bash
npx expo start
```

Your terminal will show a QR code. Open Expo Go on your phone and scan it. You should see a white screen that says "Open up App.js to start working on your app!"

That is your app running on your phone. Leave this terminal running — every time you save a file, the app updates automatically.

### Step 3: Open the project

Open the `tiktok-clone` folder in your code editor. Find `App.js` and open it. It looks like this:

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

Don't change anything yet. Just read it. We are going to look at every single piece.

---

## Part 3 — Pull It Apart

### What is this syntax?

The first thing that looks strange is this:

```javascript
return (
  <View style={styles.container}>
    <Text>Open up App.js to start working on your app!</Text>
  </View>
);
```

That looks like HTML inside JavaScript. It is not HTML — it is **JSX**. JSX is a syntax extension that lets you write what looks like HTML tags inside JavaScript. When your app builds, JSX gets converted to regular JavaScript function calls. It exists purely to make your code readable.

The rule: anything that looks like `<SomeName>` with a capital letter is a **React component**. Anything lowercase would be a raw HTML element (in web React) but in React Native we only use components.

`<View>` is like a `<div>` on the web — a container box.  
`<Text>` is for displaying text — you cannot put raw text outside a `<Text>` component.

### What is `export default function App()`?

This defines a function called `App` and makes it the default export of this file. React Native looks for the default export of `App.js` as the root of your application. Every other component you build will be imported and used inside this one eventually.

A component is just a function that returns JSX. That is the entire definition.

### What is `StyleSheet.create`?

This is how you style things in React Native. Instead of CSS files, styles are JavaScript objects. `StyleSheet.create` takes an object of style definitions and returns them — it also does some optimisation under the hood.

```javascript
const styles = StyleSheet.create({
  container: {        // a style called "container"
    flex: 1,          // take up all available space
    backgroundColor: '#fff',
    alignItems: 'center',      // centre children horizontally
    justifyContent: 'center',  // centre children vertically
  },
});
```

You apply a style with `style={styles.container}` — that `{}` means "here comes JavaScript inside JSX".

### Now break it

Try each of these changes one at a time. Save after each one. Watch your phone update.

**Change 1:** Change the text inside `<Text>` to your name.

```javascript
<Text>Hello, I'm building TikTok</Text>
```

**Change 2:** Change the background colour:

```javascript
backgroundColor: '#000',
```

Your screen goes black. The text disappears. Why?

**Change 3:** Make the text white so you can see it again:

```javascript
<Text style={{ color: '#fff', fontSize: 24 }}>Hello</Text>
```

Notice `style={{ color: '#fff' }}` — double curly braces. The outer `{}` means "here comes JavaScript". The inner `{}` is a JavaScript object. This is an inline style — defined directly on the element instead of in `StyleSheet.create`.

**Change 4:** Add a second `<Text>` underneath the first:

```javascript
<View style={styles.container}>
  <Text style={{ color: '#fff', fontSize: 24 }}>Hello</Text>
  <Text style={{ color: '#aaa', fontSize: 16 }}>Building TikTok from scratch</Text>
</View>
```

Notice both `<Text>` elements sit inside the same `<View>`. The `<View>` is their parent. This nesting is how all React Native layouts work.

**Change 5:** Try putting text outside a `<Text>` tag:

```javascript
<View style={styles.container}>
  This will crash
</View>
```

It throws an error. React Native requires text to live inside `<Text>`. This is stricter than HTML but it prevents an entire class of bugs.

Undo that last change.

---

## Part 4 — Build It Real

Now we build the first real piece of the TikTok app: the black fullscreen background that every video sits on. This is the foundation everything else will rest on.

Replace everything in `App.js` with this. Type it — don't copy-paste:

```javascript
import { StyleSheet, View, Text, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  return (
    // SafeAreaView respects the phone's notch and home indicator.
    // Without it, content can appear behind the notch on iPhones.
    <SafeAreaView style={styles.container}>

      {/* StatusBar hidden="true" hides the clock and battery indicator */}
      <StatusBar hidden={true} />

      {/* This will become our video feed */}
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
    // We will fill this with videos in Lesson 6.
    // For now it is just a black fullscreen area.
    alignItems: 'center',
    justifyContent: 'center',
  },

  placeholder: {
    color: '#333',
    fontSize: 16,
  },
});
```

Save it. Your phone should show a completely black screen with "Feed goes here" in dark grey in the centre.

That is not impressive yet. But you just built:
- A fullscreen black container
- A status bar hidden so the UI is truly fullscreen
- A SafeAreaView that will keep content out of the notch
- The exact same starting point as every real TikTok screen

### What `flex: 1` means

This is worth understanding now because it is everywhere in React Native.

`flex: 1` means "take up all available space in the direction of the parent's main axis." When you give a container `flex: 1`, it fills all the space its parent gives it.

When two siblings both have `flex: 1`, they split the space equally. When one has `flex: 2` and another `flex: 1`, the first gets twice as much space. This is how you build proportional layouts without hardcoding pixel values — which would break on different screen sizes.

```javascript
// Example: a screen split 2/3 and 1/3
<View style={{ flex: 1 }}>
  <View style={{ flex: 2, backgroundColor: 'red' }} />
  <View style={{ flex: 1, backgroundColor: 'blue' }} />
</View>
```

We will use this constantly. The layout system in React Native is called **Flexbox** and we cover it properly in Lesson 3.

---

## What You Learned

| Concept | What it means |
|---|---|
| React Native | Write once in JavaScript, runs on iOS and Android |
| Component | A function that returns JSX — a reusable UI building block |
| JSX | HTML-like syntax inside JavaScript — gets converted at build time |
| `<View>` | A container box — the equivalent of `<div>` |
| `<Text>` | Required wrapper for all text |
| `StyleSheet` | JavaScript objects instead of CSS |
| `flex: 1` | Fill all available space |
| `SafeAreaView` | Respects the phone's notch and system UI |
| Expo Go | Instant preview on your real phone — no build step |

---

## Before Lesson 2

Two things to try on your own before the next lesson:

**Challenge 1:** Add a `<Text>` at the bottom of the screen that says "For You" — like the tab label in TikTok. Make it white, centred, 12px. You will need to think about how to position it at the bottom. Try it before looking anything up.

**Challenge 2:** Make the placeholder text in the middle say your username with an `@` in front of it, in white, larger than the current text.

These are small but they will force you to look at `justifyContent`, `alignItems`, and positioning — which is exactly what Lesson 2 is about.

---

## Coming Up in Lesson 2

We build the `VideoCard` component — the thing that takes up the whole screen and shows one video's worth of UI: the username, description, music name, and the like/comment/share buttons on the right side. No actual video yet — just the layout. Getting that layout right is its own lesson.
