# Lesson 05 — Navigation From First Principles

## What You Will Build

Add three screens — Home, Lessons, and Profile — with a tab bar at the bottom that
switches between them. Tapping a tab animates to the corresponding screen. The navigation
works identically in the browser (URL-based) and on the phone (native tab bar). By the
end, the app has the skeleton structure that all subsequent lessons will fill with content.

---

## What You Need to Know First

- Lesson 03: Component structure, props, how React renders a component tree
- Lesson 04: Styling, Flexbox, design tokens

---

## The Lesson

### Step 1 — The Stack Data Structure

Before any code, understand the data structure that navigation uses.

A **stack** is a linear data structure that follows **LIFO** order — Last In, First Out.
Operations:
- **Push** — add an item to the top
- **Pop** — remove the item from the top
- **Peek** — read the top item without removing it

The call stack from Lesson 02 is a stack: the most recent function call is on top, and
returning removes it.

**Navigation history is literally a stack.** When you navigate from screen A to screen B:
- Screen A was on top
- Screen B is pushed on top of A
- The back button pops B, revealing A beneath it

```
After navigating Home → Lessons → LessonDetail:
Stack (top to bottom):
  LessonDetail ← top (current screen)
  Lessons
  Home
```

Pressing back pops `LessonDetail` and reveals `Lessons`. The stack is the navigation
history. This is why "going back" always returns to the previous screen in the correct
order, regardless of how you got there.

### Step 2 — State Machines for Navigation

A navigation system is a **finite state machine (FSM)**:
- A **finite set of states** — the screens: `Home`, `Lessons`, `Profile`
- **Transitions** — how to move between states: tapping a tab, pressing back
- **Exactly one active state** — only one screen is shown at a time

A finite state machine is a model where the system is always in one of a finite number
of states, and events (user actions, API responses) cause transitions between states.
The current navigation state (which screen is visible) is determined entirely by the
history of transitions.

Why is a state machine the right model for navigation? Because it is impossible for the
app to be in two screens simultaneously, and every transition is explicit and predictable.
This is the same formal model used in hardware controllers, protocol parsers, and
traffic lights.

**CS lens:** State machines are one of the most fundamental abstractions in computer
science. They appear in every domain: regex engines (parsing), TCP (connection states),
UI flows (authentication: unauthenticated → logging-in → authenticated), game logic.
Recognising navigation as an FSM lets you reason about every possible screen combination
and which transitions are valid.

### Step 3 — Installing React Navigation

**What React Navigation is:** Expo does not include navigation. React Navigation is the
standard navigation library for React Native — it provides navigators (components that
manage navigation state) and hooks for interacting with navigation.

```bash
$ npm install @react-navigation/native
$ npm install @react-navigation/bottom-tabs
$ npx expo install react-native-screens react-native-safe-area-context
```

Each command:
- `npm install @react-navigation/native` — the core navigation library. Provides the
  `NavigationContainer` and navigation context.
- `npm install @react-navigation/bottom-tabs` — the tab bar navigator. Provides
  `createBottomTabNavigator` for a bottom tab UI.
- `npx expo install react-native-screens react-native-safe-area-context` — two native
  modules that React Navigation depends on. `npx expo install` (rather than
  `npm install`) uses Expo's version registry to install versions that are compatible
  with your Expo SDK version — it avoids version mismatch errors.

**`react-native-screens`** replaces React's default screen rendering with native
OS-level screen components. On iOS, this means screens are native `UIViewController`
instances, not React Views — transitions use iOS's native animation system, which is
hardware-accelerated and matches system behaviour.

**`react-native-safe-area-context`** provides layout information about the device's
"safe area" — the region of the screen not covered by hardware notches, status bars,
or home indicators. Content placed outside the safe area is partially obscured by
device hardware.

### Step 4 — Creating the Screens

Create three screen files:

**`src/screens/HomeScreen.tsx`:**
```typescript
import { StyleSheet, Text, View } from 'react-native'
import { colors, spacing, typography } from '../theme'

export function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Welcome</Text>
      <Text style={styles.subtitle}>Start your learning journey</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  heading: {
    fontSize: typography.sizeXxl,
    fontWeight: typography.weightBold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.sizeMd,
    color: colors.textSecondary,
    textAlign: 'center',
  },
})
```

**`src/screens/LessonsScreen.tsx`:**
```typescript
import { StyleSheet, Text, View } from 'react-native'
import { colors, spacing, typography } from '../theme'

export function LessonsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Lessons</Text>
      <Text style={styles.placeholder}>Lessons will appear here</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  heading: {
    fontSize: typography.sizeXl,
    fontWeight: typography.weightBold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  placeholder: {
    color: colors.textSecondary,
    fontSize: typography.sizeMd,
  },
})
```

**`src/screens/ProfileScreen.tsx`:**
```typescript
import { StyleSheet, Text, View } from 'react-native'
import { colors, spacing, typography } from '../theme'

export function ProfileScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Profile</Text>
      <Text style={styles.placeholder}>User profile will appear here</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  heading: {
    fontSize: typography.sizeXl,
    fontWeight: typography.weightBold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  placeholder: {
    color: colors.textSecondary,
    fontSize: typography.sizeMd,
  },
})
```

These screens are placeholders — vertical slices of nothing but layout. Lessons 11–26
will fill each screen with real content. The value of creating them now is that the
navigation shell exists and every subsequent lesson can add to it.

### Step 5 — The Tab Navigator

Create `src/navigation/TabNavigator.tsx`:

```typescript
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { HomeScreen } from '../screens/HomeScreen'
import { LessonsScreen } from '../screens/LessonsScreen'
import { ProfileScreen } from '../screens/ProfileScreen'
import { colors } from '../theme'

const Tab = createBottomTabNavigator()

export function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Lessons" component={LessonsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  )
}
```

**`createBottomTabNavigator()` explained:**
This function creates a **navigator** — a component that manages a set of screens and
their transitions. It returns an object with two sub-components:
- `Tab.Navigator` — the container that holds and manages the screens
- `Tab.Screen` — declares one screen in the navigator, binding a name to a component

**`screenOptions` explained:**
The `screenOptions` object configures every screen in this navigator. Each field:
- `headerShown: false` — hides the default header bar. We will add our own `Header`
  component from Lesson 03 to each screen.
- `tabBarActiveTintColor` — the colour of the active tab icon and label
- `tabBarInactiveTintColor` — the colour of inactive tab icons and labels
- `tabBarStyle` — styles applied to the tab bar itself (the container)

**Declarative vs imperative:**
```typescript
// Imperative: code that manually swaps components
if (selectedTab === 'Home') showHome()
else if (selectedTab === 'Lessons') showLessons()
// ...

// Declarative: describe what screens exist and how they connect
<Tab.Navigator>
  <Tab.Screen name="Home" component={HomeScreen} />
  <Tab.Screen name="Lessons" component={LessonsScreen} />
</Tab.Navigator>
```

The declarative approach says what the navigation structure is; the framework handles
the how. No manual component swapping, no state to track, no transition animation code.
This is the same philosophy as JSX itself: describe the desired result, not the steps
to achieve it.

### Step 6 — Wiring Up `App.tsx`

```typescript
import { NavigationContainer } from '@react-navigation/native'
import { TabNavigator } from './src/navigation/TabNavigator'

export default function App() {
  return (
    <NavigationContainer>
      <TabNavigator />
    </NavigationContainer>
  )
}
```

**`NavigationContainer` explained:**
`NavigationContainer` is a required wrapper component that holds the navigation state
for the entire app. It manages the navigation history stack, handles deep links
(URLs that open the app at a specific screen), and provides the navigation context
that all navigators and the `useNavigation` hook read from.

Every app must have exactly one `NavigationContainer`. It is always the outermost
navigation component.

### Step 7 — Routing and Screen Parameters

**What a route is:** A route is a mapping from a name (or URL) to a screen. In
`Tab.Screen name="Lessons"`, `"Lessons"` is the route name. Navigating to a screen
means pushing a route onto the navigation stack.

**Screen parameters:** Screens can receive data via parameters — extra information
passed when navigating:

```typescript
// Type the parameters for the lessons stack
type LessonsStackParamList = {
  LessonsList: undefined        // no parameters
  LessonDetail: { lessonId: string }  // requires lessonId
}
```

**Why type parameters?** Without typed parameters, `navigation.navigate('LessonDetail', { id: '123' })`
would be valid TypeScript even though the screen expects `lessonId`, not `id`. Typing
parameters makes navigation calls type-safe — a mismatched parameter name is a compile error.

**The `useNavigation` hook:**
```typescript
import { useNavigation } from '@react-navigation/native'

function LessonsScreen() {
  const navigation = useNavigation()

  function handleLessonPress(lessonId: string) {
    navigation.navigate('LessonDetail', { lessonId })
  }
  // ...
}
```

`useNavigation()` is a **hook** — a function that gives a component access to React
features or external systems. In this case, it gives the component access to the
navigation stack: the ability to navigate, go back, and read the current route.

**Loose coupling:** `LessonsScreen` does not import `LessonDetailScreen`. It only calls
`navigation.navigate('LessonDetail', ...)`. The navigator connects the name to the
component. If you rename the component file, only the navigator needs to change — not
every screen that navigates to it.

**SE lens — loose coupling and the routing layer:**
Screens are coupled to route names (strings), not to each other's components. This is
**loose coupling** — changing a screen's implementation does not require changing the
screens that navigate to it. The navigator is the single point of truth for what screens
exist and how they connect.

---

## Connect the Pieces

The tab navigator is the skeleton that all future lessons hang features on. Lesson 08
will add state that needs to be shared between `LessonsScreen` and `LessonDetailScreen`.
Lesson 17 (authentication) will add an auth flow that replaces the tab navigator until
the user logs in. Lesson 22 (progress) will update the tab bar badge on the `Profile` tab.

The routing pattern — declaring routes as data, navigating by name — is the same pattern
used in web frameworks. React Router, Next.js, and Remix all separate route declarations
from the components they render. The implementation differs (URL vs stack vs tab), but
the principle is identical.

In production apps, routing complexity grows: deep links that open specific lessons from
push notifications (Lesson 28), web URLs that correspond to specific screens (Lesson 31),
authenticated vs unauthenticated route trees. All of this builds on the `NavigationContainer`
+ named screens foundation established here.

---

## What Breaks Without This

Without `NavigationContainer`, every navigator throws an error at startup:
`Couldn't find a navigation object. Is your component inside a NavigationContainer?`
The `NavigationContainer` is not optional — it is the provider of the navigation context
that every navigator reads.

Without typed `ParamList`, `navigation.navigate('LessonDetail', { wrongParam: '123' })` is
valid TypeScript, but the screen crashes at runtime when it tries to read `route.params.lessonId`
and finds `undefined`. Typed parameters move this crash from runtime (when a user taps a lesson)
to compile time (when you run `tsc`).

---

## Definition of Done

- [ ] Three tabs appear at the bottom of the app: Home, Lessons, Profile
- [ ] Tapping each tab switches screens with animation
- [ ] The app works in both the web browser and Expo Go on mobile
- [ ] You can answer: what is the call stack metaphor for navigation history?
- [ ] You can answer: why is navigation a finite state machine?
- [ ] You can answer: what does `NavigationContainer` do and why is exactly one required?
- [ ] You can answer: what is the difference between `navigation.navigate('X')` and importing `XScreen` directly?
- [ ] `git commit` with a message explaining why — "Add bottom tab navigation with Home, Lessons, Profile screens"
