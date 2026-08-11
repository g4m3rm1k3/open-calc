# Lesson 10: Visual Audit — Reading Your Own App Like a Designer

**What you will build**
A completed visual audit of all three screens of the InventoryApp, documented as a pass/fail checklist. Any items that fail will be fixed in this lesson. The transferable problem: developers often finish adding features and immediately stop. A deliberate visual audit is the necessary check that catches the small visual and accessibility regressions that accumulate during construction.

**What you need to know first**
You need to have completed all prior lessons in the `android-styling-lab` series. You should understand contrast ratios (Lesson 02), Material 3 typography and color roles, and Compose Modifiers for sizing and alignment.

**Terms introduced in this lesson**
- **Visual Audit** — A systematic review of a user interface against a predefined set of design and accessibility heuristics. *Why it exists: It forces developers to look at the UI as a finished product rather than a collection of working parts, catching regressions and polish issues before they reach users.*
- **Tap Target** — The physical area on the screen that responds to touch events for a specific interactive element. *Why it exists: Human fingers are imprecise; tap targets must be large enough to prevent accidental clicks on adjacent elements, regardless of how small the visual representation (like an icon) might be.*
- **Five-Second Test** — A heuristic evaluation where a user views a screen for five seconds and reports the most important element. *Why it exists: It rapidly verifies if the visual hierarchy successfully guides the user's eye to the primary action or information.*

**Objects and methods used**
- `Layout Inspector` (Android Studio Tool)
  - *What it is:* A diagnostic tool built into Android Studio that displays the real-time View or Composable hierarchy of a running application.
  - *Implementation:* Accessed via `Tools > Layout Inspector` or the side panel in Android Studio while the app is running on an emulator or device.
  - *Its use:* Used to inspect the actual rendered dimensions (dp), applied colors, and modifier chains of composables in real-time.
- `Modifier.semantics`
  - *What it is:* A Compose modifier that adds accessibility information to a UI element's semantics node.
  - *Implementation:* `Modifier.semantics { contentDescription = "Description of action" }`
  - *Its use:* Used by screen readers (like TalkBack) and testing tools (like Accessibility Scanner) to understand the purpose of non-text interactive elements.
- `Accessibility Scanner`
  - *What it is:* A standalone Android app by Google that scans the current screen and provides suggestions to improve accessibility.
  - *Implementation:* Installed from the Play Store on the emulator/device, enabled in Accessibility settings, and triggered via an on-screen floating button.
  - *Its use:* Automatically detects insufficient tap targets, poor contrast, and missing content descriptions across the entire visible UI.

---

## Concept Unit: Contrast Audit with Layout Inspector

### The Problem
During development, colors are often overridden, or themes change. You might have calculated correct contrast ratios in Figma or in your head during Lesson 02, but the *actual* rendered pixels might differ due to alpha values, nested surfaces, or dark mode overrides. We need a way to verify the true colors as rendered on the device.

### The New Code
This isn't code; it's a tool workflow. In Android Studio:
1. Run your app on an emulator.
2. Open **Layout Inspector** (View > Tool Windows > Layout Inspector).
3. Enable "Live Updates".
4. Click on the subtle secondary text on the Login screen in the inspector.
5. In the Attributes panel, note the `color` (foreground) and the `background` color of its container.

### The Updated Project
```kotlin
// LoginScreen.kt
// ← new (The fix applied after inspecting)
Text(
    text = "Forgot Password?",
    color = MaterialTheme.colorScheme.onSurface, // Was previously a low-contrast gray
    style = MaterialTheme.typography.labelLarge
)
```

### Mechanical Walkthrough
- **Layout Inspector Selection:** Selecting a node in Layout Inspector isolates the exact Composable. *Without this, you are guessing which text element in your code maps to the visual element on screen.*
- **Attributes Panel `color`:** Shows the resolved hex value of the text. *Without this, you might not realize that a dynamic theme or an alpha modifier is dropping the contrast ratio below the required 4.5:1 for normal text.*
- **Applying `onSurface`:** Updating the hardcoded gray to the semantic `onSurface` color. *Without this fix, users with visual impairments would struggle to read the secondary actions.*

### CS Lens
This is dynamic analysis versus static analysis. Statically reading the code doesn't tell you the final pixel color because the UI state is a function of the OS theme, dynamic colors, and composition tree. Layout Inspector is a dynamic analysis tool that observes the runtime state of the UI.

### SE Lens
Trust, but verify. You wrote the code assuming it was accessible, but the Layout Inspector provides the objective truth. Relying on tooling for verification prevents human error and drift over time.

### Run It Yourself
Run the app, open Layout Inspector, and click the "Forgot Password" text. Find its color. Use a contrast checker to verify the ratio between that color and the background. Change the color in code if it falls below 4.5:1, rebuild, and re-inspect to verify the fix.

## Concept Unit: Tap Target Audit

### The Problem
Material 3 guidelines and Android accessibility standards mandate that every interactive element must be at least 48x48dp. Often, developers use an `Icon` that is visually 24x24dp and add a `clickable` modifier directly to it. This creates a tap target that is far too small, frustrating users and failing accessibility audits.

### The New Code
```kotlin
Box(
    modifier = Modifier
        .size(48.dp)
        .clickable { onIconClick() },
    contentAlignment = Alignment.Center
) {
    Icon(
        imageVector = Icons.Default.Settings,
        contentDescription = "Settings",
        modifier = Modifier.size(24.dp)
    )
}
```

### The Updated Project
```kotlin
// InventoryListScreen.kt
@Composable
fun InventoryListItem(item: InventoryItem, onDelete: () -> Unit) {
    Row(
        modifier = Modifier.fillMaxWidth().padding(16.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(item.name, modifier = Modifier.weight(1f))
        // ← new
        Box(
            modifier = Modifier
                .size(48.dp)
                .clickable { onDelete() },
            contentAlignment = Alignment.Center
        ) {
            Icon(
                imageVector = Icons.Default.Delete,
                contentDescription = "Delete item",
                modifier = Modifier.size(24.dp) // Visual size remains 24dp
            )
        }
    }
}
```

### Mechanical Walkthrough
- **`Box` container:** Creates a layout space independent of the visual icon. *Without this, the tap target is constrained to the visual bounds of the icon itself.*
- **`Modifier.size(48.dp)` on the Box:** Enforces the minimum accessible touch target size. *Without this, the OS will flag the button as a touch target violation, and users will mis-click.*
- **`contentAlignment = Alignment.Center`:** Ensures the visual icon sits in the middle of the invisible 48dp touch area. *Without this, the icon would default to the top-left of the Box, making the touch area asymmetrical relative to the visual indicator.*

### CS Lens
Separation of concerns between input and rendering. The visual representation (the 24dp icon) is distinct from the hit box (the 48dp Box). In game development, this is standard: a character's "hitbox" is often different from its sprite.

### SE Lens
Designing for constraints. The human finger has a physical width. We constrain the software to match physical human ergonomics rather than forcing the human to be overly precise to use the software.

### Run It Yourself
Open Layout Inspector, enable the "Show Borders" option. Look at the delete icon in your list items. Before the change, the blue border hugs the 24dp icon. After wrapping it in the Box, the blue border expands to a 48x48dp square, confirming the tap target is fixed.

## Concept Unit: Accessibility Scanner Automation

### The Problem
Manually checking every color and every tap target on every screen is tedious and prone to human error. We need an automated tool to sweep the screen for common accessibility violations.

### The New Code
```kotlin
Icon(
    imageVector = Icons.Default.Add,
    contentDescription = "Add new inventory item", // Replacing a null or empty description
    modifier = Modifier.size(24.dp)
)
```

### The Updated Project
```kotlin
// InventoryListScreen.kt
@Composable
fun InventoryListScreen(navigateToAdd: () -> Unit) {
    Scaffold(
        floatingActionButton = {
            FloatingActionButton(onClick = navigateToAdd) {
                // ← new
                Icon(
                    imageVector = Icons.Default.Add,
                    contentDescription = "Add new inventory item" 
                )
            }
        }
    ) { padding ->
        // ... list content ...
    }
}
```

### Mechanical Walkthrough
- **`contentDescription` argument:** Provides a string describing the action the icon represents. *Without this, screen readers will announce "Button, unlabelled," making it impossible for visually impaired users to know what the FAB does.*

### CS Lens
Static analysis applied at runtime. The Accessibility Scanner navigates the semantic tree of the running UI, evaluating rule sets (contrast formulas, size assertions, null checks on descriptions) against the live nodes.

### SE Lens
Automated testing catches low-hanging fruit. Just as linters catch syntax errors, tools like Accessibility Scanner catch basic UI violations, freeing the developer to focus on complex UX problems rather than manually measuring dp.

### Run It Yourself
Install "Accessibility Scanner" from the Google Play Store on your emulator. Open it and grant the required permissions. Open InventoryApp, tap the floating Scanner button. It will take a screenshot and draw orange boxes around violations. Fix the missing `contentDescription` on the FAB, recompile, and run the scanner again to see the violation disappear.

## Concept Unit: Visual Hierarchy Audit

### The Problem
A screen can have perfect contrast and tap targets, but still be unusable if the user doesn't know where to look. If every element is large and bold, everything is yelling, and nothing is important. 

### The New Code
There is no isolated code fragment. The fix is adjusting typographical hierarchy in existing code based on a heuristic review.

### The Updated Project
```kotlin
// ItemDetailScreen.kt
@Composable
fun ItemDetailScreen(item: InventoryItem) {
    Column(modifier = Modifier.padding(16.dp)) {
        // ← new (Adjusted typography for hierarchy)
        Text(
            text = item.name, 
            style = MaterialTheme.typography.displaySmall // Was previously bodyLarge
        )
        Text(
            text = "Quantity: ${item.quantity}",
            style = MaterialTheme.typography.bodyLarge,
            color = MaterialTheme.colorScheme.onSurfaceVariant // Dimmed to secondary importance
        )
    }
}
```

### Mechanical Walkthrough
- **`displaySmall` for the item name:** Makes the primary data the largest element on the screen. *Without this, the item name blends in with the metadata, destroying the visual hierarchy.*
- **`onSurfaceVariant` for the quantity:** Lowers the contrast of secondary information relative to the primary information (while keeping it above 4.5:1). *Without this, the quantity fights for attention with the item name.*

### CS Lens
Information Retrieval. In a search engine, results are ranked by relevance. In UI, information is ranked by visual weight. You are designing the algorithm for where the user's eye goes first.

### SE Lens
The Five-Second Test. If you show a screen to a user for five seconds and they can't tell you the most important thing, your hierarchy failed. The tradeoff here is space: making the title `displaySmall` takes up more vertical real estate, but it clarifies the purpose of the screen immediately.

### Run It Yourself
Take a screenshot of the `ItemDetailScreen`. Look away, then look back quickly. What do you read first? If it isn't the item name, adjust the `style` and `color` parameters until it is. 

## Connect the Pieces
Consider the journey of a user opening the InventoryApp to delete an item. 
1. They arrive at the List Screen. Because of the **Visual Hierarchy Audit**, the list items are legible and the Add FAB stands out, but isn't overpowering. 
2. They locate the item they want to delete. Because of the **Contrast Audit**, the text of the item is clearly legible against the background. 
3. They tap the delete icon. Because of the **Tap Target Audit**, they successfully trigger the action on the first try without needing pixel-perfect precision. 
4. If the user relies on a screen reader, they hear "Delete item" because the **Accessibility Scanner** caught the missing content description. The visual audit ensures the entire interaction loop is resilient and accessible.

## What Breaks Without This
Remove the `Box` wrapper from the delete icon in `InventoryListItem`, leaving only the 24dp `Icon` with a `clickable` modifier. 
Run the app on a physical device. Try to tap the delete icon rapidly using your thumb while holding the phone with one hand. You will likely miss the tap target several times, either doing nothing or accidentally triggering the row click (if it has one). 
Restore the `Box` wrapper with `Modifier.size(48.dp)`. Try again. The action is now effortless and reliable.

## Exercises
1. Run the Accessibility Scanner on the Login Screen. It will likely flag the text fields if they lack proper semantic labeling. Use `Modifier.semantics` to fix any issues it finds.
2. Perform a "Five-Second Test" on the Add Item screen. Does the "Save" button draw the eye more than the "Cancel" button? If not, adjust their visual weights (e.g., make Save a filled `Button` and Cancel an `OutlinedButton` or `TextButton`).
3. Open Layout Inspector and verify that the FAB has a minimum dimension of 56x56dp (M3 standard).

## Definition of Done
- Layout Inspector has been used to verify that all text has a minimum contrast ratio of 4.5:1.
- All interactive icons are wrapped in a 48x48dp minimum tap target.
- Accessibility Scanner returns zero violations on all three screens.
- A visual hierarchy review has been completed, prioritizing the most important information on each screen.
- You have committed your changes with the message: `chore: complete visual audit, fix tap targets and contrast to meet accessibility standards`.
