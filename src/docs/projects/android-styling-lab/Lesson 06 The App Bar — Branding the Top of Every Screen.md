# Lesson 06: The App Bar — Branding the Top of Every Screen

**What you will build**
All three screens wrapped in `Scaffold` with a `topBar` slot wired to a `CenterAlignedTopAppBar` showing the screen title, the app's primary color as the container color, and a back arrow `NavigationIcon` on the inventory and notifications screens. The transferable problem: without a top app bar, an app looks like a prototype; the app bar is one of the strongest native-feel signals on Android.

**What you need to know first**
- *android-kotlin-foundations* Lesson 14, 25 (`NavController` for the back navigation lambda)
- *android-styling-lab* Lessons 01–05

**Terms introduced in this lesson**
- **Scaffold** — a slot-based layout that implements the basic Material Design visual layout structure — *It exists to enforce consistent placement of standard UI chrome like app bars and floating action buttons without manual positioning.*
- **Slot API** — a pattern where a composable accepts other composables in named parameters (slots) to place them in specific locations — *It exists to separate the layout structure (where things go) from the content (what they are).*

**Objects and methods used**
- `Scaffold`
  - *What it is:* A composable that provides a framework for building Material Design screens.
  - *Implementation:* `androidx.compose.material3.Scaffold`
  - *Its use:* Used as the root composable for a screen to handle top bars, bottom bars, and FABs.
- `CenterAlignedTopAppBar`
  - *What it is:* A top app bar that centers its title horizontally.
  - *Implementation:* `androidx.compose.material3.CenterAlignedTopAppBar`
  - *Its use:* Used to display a title, navigation icon, and actions at the top of a screen.
- `TopAppBarDefaults.centerAlignedTopAppBarColors`
  - *What it is:* A factory function that creates a `TopAppBarColors` instance with default values.
  - *Implementation:* `androidx.compose.material3.TopAppBarDefaults.centerAlignedTopAppBarColors`
  - *Its use:* Used to override the default colors of a `CenterAlignedTopAppBar`.
- `PaddingValues`
  - *What it is:* A class that represents padding to be applied to a composable.
  - *Implementation:* `androidx.compose.foundation.layout.PaddingValues`
  - *Its use:* Passed from `Scaffold` to its content lambda to ensure content is not obscured by the UI chrome.

---
## Concept Unit: Scaffold

### The Problem
If you want to add a standard top app bar or a floating action button to a screen, you could manually position them using a `Column` and `Box`. However, handling the overlapping states, scrolling behavior, and exact Material Design spacing rules manually is tedious and error-prone.

### The New Code
```kotlin
Scaffold(
    topBar = { /* Top app bar goes here */ },
    bottomBar = { /* Bottom app bar goes here */ },
    floatingActionButton = { /* FAB goes here */ }
) { innerPadding ->
    // Main content goes here
}
```

### The Updated Project
```kotlin
@Composable
fun InventoryScreen(onNavigateBack: () -> Unit) {
    Scaffold( // ← new
        topBar = { /* We will add the app bar next */ } // ← new
    ) { innerPadding -> // ← new
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding) // ← new
        ) {
            // Existing inventory screen content
            Text("Inventory")
        }
    } // ← new
}
```

### Mechanical Walkthrough
- `Scaffold` — Creates the Material Design layout structure. Without it, you would have to manually build the layout framework for the app's standard chrome.
- `topBar = {}` — The named slot for the top app bar. This ensures whatever composable you pass here is placed exactly at the top of the screen according to Material specifications.
- `innerPadding` — The padding calculated by `Scaffold` to account for the height of the top bar (and bottom bar, if any). Without this, your main content would draw underneath the `topBar`.
- `Modifier.padding(innerPadding)` — Applies the calculated padding to the root composable of the main content. This is how the content "respects" the space taken up by the `Scaffold`'s chrome.

### CS Lens
The **Slot API** pattern. Instead of exposing dozens of configuration parameters (like `topBarTitle`, `topBarColor`, `topBarIcon`), the parent component (`Scaffold`) simply provides a "slot" (a lambda) where the caller can insert any composable they want. This is a form of inversion of control or dependency injection for UI trees. You see this in React's `children` prop, or Vue's `<slot>`.

### SE Lens
**Composition over inheritance.** `Scaffold` doesn't subclass a `Screen` class and override a `drawTopBar()` method. Instead, it takes the top bar as a parameter. The tradeoff is slightly more boilerplate for simple screens, but immense flexibility — you can put anything in that slot, not just a standard app bar.

### Run It Yourself
Run the app. At this stage, you won't see a visible change because the `topBar` slot is empty, but the structural foundation is in place.

## Concept Unit: TopAppBar variants in M3

### The Problem
Material 3 offers different types of top app bars depending on the screen's needs. A standard short title needs one style, while a screen with a large, scroll-collapsible title needs another.

### The New Code
```kotlin
CenterAlignedTopAppBar(
    title = { Text("InventoryApp") }
)
```

### The Updated Project
```kotlin
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun InventoryScreen(onNavigateBack: () -> Unit) {
    Scaffold(
        topBar = { 
            CenterAlignedTopAppBar( // ← new
                title = { Text("Inventory") } // ← new
            ) // ← new
        }
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
        ) {
            // Existing inventory screen content
            Text("Inventory List")
        }
    }
}
```

### Mechanical Walkthrough
- `@OptIn(ExperimentalMaterial3Api::class)` — Required because Material 3's top app bars are currently marked as experimental in the Compose API. Without this, the compiler will throw an error.
- `CenterAlignedTopAppBar` — The specific variant of `TopAppBar` we are choosing. Material 3 provides `TopAppBar` (left-aligned), `CenterAlignedTopAppBar`, `MediumTopAppBar` (two lines, collapsable), and `LargeTopAppBar` (prominent two lines, collapsable). We use the center-aligned version here because it fits our short screen titles and we don't need scrolling collapse behavior.
- `title = { Text("Inventory") }` — The slot for the title content. Without this, the app bar would be empty.

### CS Lens
**API Evolution and Experimental Flags.** Libraries often introduce new APIs under an experimental flag to gather feedback while reserving the right to make breaking changes. It's a standard practice in software lifecycle management to prevent locking in suboptimal designs prematurely.

### SE Lens
**Choosing the right component variant.** The alternative is using a generic `TopAppBar` and manually centering the title with `Modifier.align()`. We chose the specific `CenterAlignedTopAppBar` because it enforces the exact Material 3 specification for center alignment, including how it interacts with navigation icons and action buttons. The tradeoff is having to know about multiple variants instead of one highly configurable component.

### Run It Yourself
Run the app and navigate to the Inventory screen. You should see a center-aligned title "Inventory" at the top of the screen.

## Concept Unit: CenterAlignedTopAppBar parameters

### The Problem
The default `CenterAlignedTopAppBar` is functionally correct but lacks the app's branding and the ability to navigate back to the previous screen.

### The New Code
```kotlin
CenterAlignedTopAppBar(
    title = { Text("Inventory") },
    colors = TopAppBarDefaults.centerAlignedTopAppBarColors(
        containerColor = MaterialTheme.colorScheme.primary,
        titleContentColor = MaterialTheme.colorScheme.onPrimary,
        navigationIconContentColor = MaterialTheme.colorScheme.onPrimary
    ),
    navigationIcon = {
        IconButton(onClick = onNavigateBack) {
            Icon(
                imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                contentDescription = "Back"
            )
        }
    }
)
```

### The Updated Project
```kotlin
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun InventoryScreen(onNavigateBack: () -> Unit) {
    Scaffold(
        topBar = { 
            CenterAlignedTopAppBar(
                title = { Text("Inventory") },
                colors = TopAppBarDefaults.centerAlignedTopAppBarColors( // ← new
                    containerColor = MaterialTheme.colorScheme.primary, // ← new
                    titleContentColor = MaterialTheme.colorScheme.onPrimary, // ← new
                    navigationIconContentColor = MaterialTheme.colorScheme.onPrimary // ← new
                ), // ← new
                navigationIcon = { // ← new
                    IconButton(onClick = onNavigateBack) { // ← new
                        Icon( // ← new
                            imageVector = Icons.AutoMirrored.Filled.ArrowBack, // ← new
                            contentDescription = "Navigate back" // ← new
                        ) // ← new
                    } // ← new
                } // ← new
            )
        }
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
        ) {
            // Existing inventory screen content
            Text("Inventory List")
        }
    }
}
```

### Mechanical Walkthrough
- `colors = TopAppBarDefaults.centerAlignedTopAppBarColors(...)` — Overrides the default colors. Without this, the app bar would use the default surface color, blending in rather than standing out as branded chrome.
- `containerColor = MaterialTheme.colorScheme.primary` — Sets the background color of the app bar.
- `titleContentColor = MaterialTheme.colorScheme.onPrimary` — Ensures the text color contrasts correctly against the primary background color. Without this, you might end up with dark text on a dark primary color, making it unreadable.
- `navigationIcon = { ... }` — The slot for the navigation icon on the left side of the app bar.
- `IconButton(onClick = onNavigateBack)` — A clickable container that handles the ripple effect and delegates the click to the provided lambda. Without this, the icon wouldn't be clickable or give visual feedback.
- `Icons.AutoMirrored.Filled.ArrowBack` — The standard Material back arrow. Using the `AutoMirrored` version ensures it points the correct way in right-to-left (RTL) languages.

### CS Lens
**Theming and Design Tokens.** By mapping the app bar colors to `MaterialTheme.colorScheme.primary` instead of hardcoding a hex value, the app bar automatically adapts to theme changes (like Dark Mode) and maintains consistency with the rest of the application.

### SE Lens
**Separation of Navigation Logic and UI.** The `InventoryScreen` doesn't know *how* to navigate back (e.g., calling `navController.popBackStack()`). It simply executes the `onNavigateBack` lambda. This alternative (hardcoding the navController) would couple the UI tightly to the navigation framework, making the screen harder to preview in isolation or reuse in different navigation graphs.

### Run It Yourself
Run the app. The app bar on the Inventory screen should now be prominently colored in the primary theme color, and tapping the back arrow should return you to the home screen.

## Connect the Pieces

Let's trace how the padding flows through the layout.
1. The `Scaffold` component measures its chrome elements. It measures the `CenterAlignedTopAppBar` and determines its height (e.g., 64dp).
2. It constructs a `PaddingValues` object containing this measurement (`top = 64.dp`, `bottom = 0.dp`, etc.).
3. It passes this `PaddingValues` object to the `content` lambda as `innerPadding`.
4. In the `InventoryScreen`, the root `Column` applies `Modifier.padding(innerPadding)`.
5. The Compose layout engine pushes the `Column` down by 64dp from the top.
6. The `Text("Inventory List")` inside the `Column` is drawn starting exactly below the app bar, ensuring no overlap.

## What Breaks Without This

Let's intentionally break the `PaddingValues` contract.

1. Open `InventoryScreen.kt`.
2. Remove `.padding(innerPadding)` from the `Column` modifier.
3. Run the app.

**What goes wrong:** The text "Inventory List" renders starting at the very top-left corner of the screen, underneath the colored `CenterAlignedTopAppBar`. The top portion of your content is completely hidden by the app bar. `Scaffold` provides the padding, but it's up to you to consume it.
4. Restore `.padding(innerPadding)`.

## Exercises
1. Apply the exact same `Scaffold` and `CenterAlignedTopAppBar` setup to the Notifications screen, using the title "Notifications".
2. Apply the setup to the Home screen, but omit the `navigationIcon` slot entirely, since the Home screen is the top of the back stack and shouldn't have a back button.
3. Change the `containerColor` of the `CenterAlignedTopAppBar` to `MaterialTheme.colorScheme.tertiary` and update the content colors to `onTertiary`. Observe how the branding changes.

## Definition of Done
- `Scaffold` is applied to the Home, Inventory, and Notifications screens.
- `CenterAlignedTopAppBar` is configured with the primary theme colors on all three screens.
- Back navigation works from the Inventory and Notifications screens via the `NavigationIcon`.
- `Modifier.padding(innerPadding)` is applied to the root content of all three screens.
- Commit the changes with the message: `Add Scaffold and CenterAlignedTopAppBar to all screens to establish consistent app branding and navigation chrome`. This explains *why* we added the bars, not just that we added them.
