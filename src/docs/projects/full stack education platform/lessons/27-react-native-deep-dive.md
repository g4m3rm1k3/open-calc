# Lesson 27 — React Native Deep Dive

## What You Will Build

Platform-specific features: swipe gestures on iOS and Android, native haptic feedback,
safe area handling for notched/dynamic-island devices, a bottom sheet, and Expo image
optimizations. The app feels native — not like a website wrapped in a container.

---

## What You Need to Know First

- Lesson 03: React components, props
- Lesson 04: StyleSheet, layout
- Lesson 06: Expo Go, compilation targets

---

## The Lesson

### Step 1 — How React Native Works

**The bridge (legacy) and JSI (new architecture):**
React Native compiles JavaScript components into native views — not HTML. A `<View>` in
React Native becomes a `UIView` on iOS and an `android.view.View` on Android.

The legacy architecture used a **bridge**: JavaScript ran on a separate thread; messages
were serialized to JSON and sent across the bridge to the native UI thread. This worked,
but JSON serialization added latency and limited throughput.

The **new architecture (JSI — JavaScript Interface)** removes the bridge. JavaScript can
call native functions directly via C++ bindings — no JSON serialization, no batching,
synchronous calls possible. By 2024, most Expo projects default to JSI.

**The two threads:**
- **JS thread:** Where React, your component code, and state live.
- **UI thread (main thread):** Where native views are rendered and touch events arrive.

Animations that run on the JS thread can drop frames if the JS thread is busy (a long
computation blocks it). Animations that run on the UI thread are smooth regardless of JS
thread load. This is why `react-native-reanimated` uses "worklets" — small JS functions
that execute on the UI thread.

**CS lens — inter-process communication:**
The legacy bridge is an example of inter-process communication (IPC) via message passing
— the same model as `postMessage` in the lesson sandbox (Lesson 09). JSI is a direct
function call — the same model as calling a function in a foreign function interface (FFI).
IPC adds latency; direct calls do not.

### Step 2 — Gesture Handling

Install Gesture Handler (required for Expo):
```bash
$ npx expo install react-native-gesture-handler react-native-reanimated
```

**Swipe to dismiss a lesson card:**
```typescript
import { GestureDetector, Gesture } from 'react-native-gesture-handler'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated'

interface SwipeableCardProps {
  readonly onSwipeLeft: () => void
  readonly children: React.ReactNode
}

export function SwipeableCard({ onSwipeLeft, children }: SwipeableCardProps) {
  const translateX = useSharedValue(0)

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX
    })
    .onEnd((event) => {
      if (event.translationX < -100) {
        translateX.value = withSpring(-500)
        runOnJS(onSwipeLeft)()
      } else {
        translateX.value = withSpring(0)
      }
    })

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }))

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.card, animatedStyle]}>
        {children}
      </Animated.View>
    </GestureDetector>
  )
}
```

**`useSharedValue(0)` explained:**
A `SharedValue` is a value that lives on the UI thread and is accessible from both the
JS thread and UI thread. Regular React state (`useState`) lives on the JS thread — reading
it during an animation requires a bridge cross. `SharedValue` eliminates this.

**`useAnimatedStyle(() => ...)` explained:**
An animated style is a style object derived from shared values. The callback runs on the
UI thread on every frame — it reads `translateX.value` and returns a `transform`. This
executes independently of React's render cycle; the JS thread is never involved during
the animation itself.

**`runOnJS(onSwipeLeft)()` explained:**
`runOnJS` schedules a JS thread callback from the UI thread. Worklets run on the UI
thread; calling a regular JavaScript function (`onSwipeLeft`) requires switching back to
the JS thread. `runOnJS` is the safe way to do this.

**`withSpring(0)` explained:**
A spring animation that interpolates from the current value to `0` using a spring physics
model (mass, stiffness, damping). The result feels physical — it decelerates naturally
rather than linearly.

### Step 3 — Haptic Feedback

**What haptics are:** Haptic feedback is the phone's vibration motor producing tactile
sensations. iOS has three distinct haptic patterns (impact, notification, selection);
Android has a vibration API. Well-timed haptics make actions feel real — button presses,
swipe confirmations, success/error feedback.

```typescript
import * as Haptics from 'expo-haptics'

async function handleLessonComplete() {
  await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
}

async function handleError() {
  await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
}

async function handleButtonPress() {
  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
}
```

**`Haptics.NotificationFeedbackType.Success` explained:**
Expo Haptics wraps the platform APIs: `Haptics.notificationAsync` maps to iOS
`UINotificationFeedbackGenerator` and Android's `VibrationEffect`. The three notification
types (`Success`, `Warning`, `Error`) produce distinct patterns — success is a light tap,
error is a heavier double-tap.

**When NOT to use haptics:**
Haptics should accompany user-initiated actions, not background events. A background
refresh vibrating the phone is annoying. Haptics on every scroll event are overwhelming.
The rule: haptics are for confirmations of discrete actions.

### Step 4 — Safe Areas

**The problem:** Modern phones have notches, home indicators, Dynamic Islands, camera
cutouts. Content positioned at the top or bottom of the screen may be hidden behind
these hardware elements.

**Safe areas:** The region of the screen that is guaranteed to be visible and not covered
by system UI. React Native provides `SafeAreaProvider` and `useSafeAreaInsets()` to read
the safe area dimensions at runtime.

```typescript
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context'

// Wrap the app once
function App() {
  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  )
}

// Use in screens
function LessonScreen() {
  const insets = useSafeAreaInsets()

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {/* Content is never hidden behind notch or home indicator */}
    </View>
  )
}
```

**`useSafeAreaInsets()` returns:** `{ top, bottom, left, right }` in pixels. On an iPhone
with a Dynamic Island, `top` is 59. On an older flat-screen device, `top` is 0.

**CS lens — adaptive layout:**
Safe area handling is a form of adaptive layout: the UI responds to runtime constraints
(device geometry) rather than assuming fixed dimensions. The same principle governs
responsive web design (CSS media queries) and accessibility layout adjustments. The
pattern: query constraints at runtime, apply them to layout.

### Step 5 — Image Optimization

```typescript
import { Image } from 'expo-image'

// Replace React Native's <Image> with Expo's
<Image
  source={{ uri: user.avatarUrl }}
  style={styles.avatar}
  placeholder={blurhash}          // show a blurred placeholder while loading
  contentFit="cover"
  transition={200}                // fade in over 200ms
  cachePolicy="memory-disk"       // cache in memory and on disk
/>
```

**`expo-image` vs `react-native`'s `Image`:**
React Native's built-in `Image` has no memory management, no disk cache, no placeholder
support, and poor GIF/WebP support. `expo-image` uses:
- `SDWebImage` on iOS for memory-aware caching
- `Glide` on Android for memory-aware caching
- Blurhash placeholders (a compact representation of a blurred preview)
- Progressive loading with fade-in transitions

**Blurhash explained:**
A blurhash is a compact string (e.g., `"LEHV6nWB2yk8pyo0adR*.7kCMdnj"`) that encodes a
blurred version of an image using DCT (Discrete Cosine Transform). The server generates
it during upload (using the `sharp` library from Lesson 24). The client shows it
immediately while the full image loads — no blank square, no layout shift.

---

## Connect the Pieces

The UI thread / JS thread separation in React Native is the same concurrency model as
the browser's main thread / Web Worker split. In both cases, long-running JS computation
can block the UI thread (the main thread in a browser), causing animation jank.
`react-native-reanimated`'s worklets are the equivalent of Web Workers: computation that
runs off the main thread.

Safe area handling is an instance of the same principle as Lesson 04's design tokens:
encode environment constraints in one place, apply them consistently. The constraint is
the hardware boundary; the tokens are `insets.top`, `insets.bottom`.

Blurhash and progressive loading (show something immediately, replace with full quality)
is the same user experience pattern as skeleton loaders in Lesson 16 — defer waiting to
the background, give the user something to look at in the foreground.

---

## What Breaks Without This

Without `runOnJS`, calling a React state setter from a worklet crashes at runtime:
`Worklet cannot call React setState — it runs on the UI thread`. The error message is
clear but appears only at runtime (the type system cannot detect thread boundary violations).

Without `SafeAreaProvider`, the navigation bar on Android and the notch on iOS overlap
the app's content. On an iPhone 15 Pro, the tab bar sits partially under the home
indicator. On Android, the status bar overlaps the top navigation. The app looks
broken on real devices even though the simulator (which simulates a safe-area-aware
device) shows it correctly.

---

## Definition of Done

- [ ] Swipe-left on a lesson card dismisses it with a spring animation
- [ ] Completing a lesson triggers `Haptics.notificationAsync(Success)`
- [ ] The app renders correctly on an iPhone with a Dynamic Island (no content under the notch)
- [ ] Profile pictures use `expo-image` with a blurhash placeholder
- [ ] Animations run at 60fps (verified in React Native DevTools Profiler)
- [ ] You can answer: what is the difference between the JS thread and UI thread?
- [ ] You can answer: what is a SharedValue and why does it exist?
- [ ] You can answer: what are safe areas and why do they vary per device?
- [ ] You can answer: what is a blurhash and how is it generated?
- [ ] `git commit` with a message explaining why — "Add React Native gestures, haptics, safe area handling, and expo-image optimization"
