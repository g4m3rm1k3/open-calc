# Lesson 09: Dark Mode with Resource Qualifiers — One App, Both Appearances

**What you will build**
You will build a complete dark mode appearance for your application by implementing a `res/values-night/colors.xml` file that supplies dark-mode-specific hex values for every color name already defined in the app. This creates a transferable problem solution: adapting an entire app's visual theme dynamically based on user OS settings without writing conditional logic in your layouts or theme files, relying entirely on the Android resource qualifier system. You will also enforce system-following behavior in a custom `Application` class.

**What you need to know first**
- You understand how `themes.xml` references colors defined in `colors.xml` (from android-ui-foundations Lesson 34).
- You are familiar with Material Design color roles like `colorPrimary` and `colorOnPrimary` applied in this series.

**Terms introduced in this lesson**
- **Resource Qualifier** — a suffix appended to a resource directory name (like `-night` or `-land`) that specifies the configuration under which those resources should be used — *exists so the operating system can automatically select the appropriate UI assets without the developer writing conditional "if-else" boilerplate code in Java.*
- **Desaturation** — the process of reducing the intensity, purity, or vividness of a color — *exists because fully saturated bright colors vibrate visually against dark backgrounds and cause severe eye strain in dark mode interfaces.*

**Objects and methods used**
- `AppCompatDelegate`
  - *What it is:* A helper class provided by the AndroidX AppCompat library that acts as a bridge between modern Material Design features and older Android OS versions.
  - *Implementation:* `import androidx.appcompat.app.AppCompatDelegate;`
  - *Its use:* Used to globally enforce or override the night mode behavior for the entire application.
- `setDefaultNightMode(int mode)`
  - *What it is:* A static method on `AppCompatDelegate` that dictates how the app responds to dark mode requests.
  - *Implementation:* `AppCompatDelegate.setDefaultNightMode(AppCompatDelegate.MODE_NIGHT_FOLLOW_SYSTEM);`
  - *Its use:* Ensures that the application consistently respects the user's system-wide dark mode toggle, preventing bugs where the app gets stuck in the wrong appearance.
- `Application`
  - *What it is:* The base class representing the entire Android application, which exists before any Activities or Services are created.
  - *Implementation:* `public class InventoryApp extends Application { ... }`
  - *Its use:* Used as the absolute earliest entry point in the app's lifecycle to apply global configurations like crash reporting, dependency injection, or global theming defaults.
- `android:name` (Manifest attribute)
  - *What it is:* An XML attribute used inside the `<application>` tag of the `AndroidManifest.xml`.
  - *Implementation:* `android:name=".InventoryApp"`
  - *Its use:* Tells the Android OS to instantiate your custom `Application` subclass instead of the default `android.app.Application` class when the app launches.

---

## Concept Unit: How Resource Qualifiers Work

### The Problem
When the user toggles their device into "Dark Theme", they expect your app to instantly flip to a dark background with light text. If you only have one `colors.xml` file in `res/values/`, your app will stubbornly remain light. We need a way to tell the OS, "If the device is in dark mode, use these colors instead," without writing brittle `if (isDarkMode()) { ... }` statements everywhere.

### The New Code
```xml
<!-- res/values-night/strings.xml (conceptual example) -->
<resources>
    <!-- The system automatically loads files from -night directories in dark mode -->
</resources>
```

We don't need code yet; we need a directory. The Android build system handles this. 

### The Updated Project
```text
app/src/main/res/
    values/
        colors.xml       // ← default (light mode)
        strings.xml
        themes.xml
    values-night/        // ← new: triggered only in dark mode
        colors.xml       // ← new: overrides values/colors.xml
```

### Mechanical Walkthrough
- `values-night` directory: The `-night` suffix is a configuration qualifier. It instructs the Android resource manager to intercept any requests for resources inside this folder when the device reports that night mode is active. Without this exact suffix, the OS would not know to perform the swap.
- The `values/` directory: This remains the fallback. If a specific configuration qualifier directory does not exist, or if a resource is missing from the specific directory, the system falls back to `values/`. If you delete the default `values/` directory, your app will crash on light mode devices.

### CS Lens
This is an implementation of **Inversion of Control (IoC)** via file-system routing. Instead of the application code actively querying the system state and deciding which data to load, the runtime environment (Android OS) takes control and injects the correct data into the application based on the context. This pattern is common in localization (e.g., `-es` for Spanish) and web frameworks (request routing).

### SE Lens
The design principle here is **Separation of Concerns**. We separate the *declaration* of the UI structure (`themes.xml`, layouts) from the *definition* of the actual values (`colors.xml`). The alternative would be programmatically swapping colors in every Java Activity, which is unmaintainable and highly prone to memory leaks and UI lag. The tradeoff is that you now have to maintain two parallel files, increasing the risk of adding a color to one and forgetting it in the other.

### Run It Yourself
We have not added our colors yet, so there is nothing to run. We will test this after creating the file.

---

## Concept Unit: Dark Mode Color Derivation

### The Problem
You cannot simply invert light mode colors to create dark mode colors. A pure white `#FFFFFF` inverted to pure black `#000000` causes aggressive screen smearing on OLED displays. More critically, a vibrant, saturated brand color (like a bright blue `colorPrimary`) looks great on white, but against dark gray, it visually vibrates and strains the user's eyes, while simultaneously failing WCAG accessibility contrast ratios for legibility.

### The New Code
```xml
<!-- Light mode values -->
<color name="md_theme_light_primary">#0061A4</color>
<color name="md_theme_light_onPrimary">#FFFFFF</color>

<!-- Dark mode values (desaturated) -->
<color name="md_theme_dark_primary">#9ECAFF</color>
<color name="md_theme_dark_onPrimary">#003258</color>
```

Notice that `md_theme_dark_primary` is much lighter and less saturated than its light mode counterpart.

### The Updated Project
*(Conceptual design phase, no project files updated yet)*

### Mechanical Walkthrough
- `md_theme_dark_primary`: This hex value is significantly lighter than the light mode primary. In dark mode, primary colors must be lighter (closer to white) to maintain a minimum 4.5:1 contrast ratio against dark surface backgrounds. If you use the light mode primary color here, text placed on it or near it will be illegible.
- `md_theme_dark_onPrimary`: Because the primary color is now light, text placed *on* the primary color must be dark. If you left this as white, you would have white text on a light blue button, which is completely unreadable.

### CS Lens
This reflects the physics of **Human-Computer Interaction (HCI)** and perceptual color spaces (like HSL or LAB). In additive color models (screens), adjacent pixels of highly saturated colors and deep blacks cause visual artifacts (chromatic aberration in the lens of the human eye). We adjust the computational representation (hex values) to compensate for biological hardware limitations.

### SE Lens
We choose to manually define specific, hand-tuned dark mode colors rather than relying on an automated algorithm to invert colors at runtime. The alternative—runtime inversion—is cheaper to implement but produces unpredictable, muddy, and inaccessible results. The tradeoff is the upfront design cost of picking specific hex codes.

### Run It Yourself
There is nothing to run for this design theory step.

---

## Concept Unit: Building values-night/colors.xml

### The Problem
We have our theoretical desaturated colors, and we have our `values-night` directory. We must now bridge them by creating the actual XML file that the Android OS will load when night mode engages.

### The New Code
```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="colorPrimary">#9ECAFF</color>
    <color name="colorOnPrimary">#003258</color>
    <color name="colorSecondary">#BBC7DB</color>
    <color name="colorOnSecondary">#253140</color>
    <color name="colorError">#FFB4AB</color>
    <color name="colorOnError">#690005</color>
    <color name="colorBackground">#1A1C1E</color>
    <color name="colorOnBackground">#E2E2E6</color>
    <color name="colorSurface">#1A1C1E</color>
    <color name="colorOnSurface">#E2E2E6</color>
</resources>
```

Note that the `name` attributes precisely match the light mode file.

### The Updated Project
```xml
<!-- res/values-night/colors.xml -->
<!-- ← new file -->
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="colorPrimary">#9ECAFF</color>
    <color name="colorOnPrimary">#003258</color>
    <color name="colorBackground">#121212</color>
    <!-- ... other colors ... -->
</resources>
```

### Mechanical Walkthrough
- `name="colorPrimary"`: This string must be character-for-character identical to the entry in `res/values/colors.xml`. When `themes.xml` asks for `@color/colorPrimary`, the OS looks up this key. If the key is missing in `-night`, it falls back to the light value, breaking the dark theme.
- `colorBackground="#121212"`: We use a very dark gray instead of `#000000`. OLED screens turn off pixels for pure black, which causes a trailing "smear" effect when the user scrolls, as the pixels take a fraction of a second to wake back up. Using `#121212` keeps the pixels active but very dim, preventing smearing.

### CS Lens
This is a **Key-Value Dictionary** implementation split across the file system. The key (`colorPrimary`) remains constant, but the value returned depends on the environment context (the directory). It is analogous to environment variables in server-side development, where `DATABASE_URL` resolves differently in production versus staging.

### SE Lens
We do not touch `themes.xml` at all. The design principle is **Open/Closed Principle**: our theme is open for extension (we can add new appearances) but closed for modification (we don't have to edit the theme file itself). We achieved a massive visual overhaul entirely by adding a new data file, not by altering existing logic.

### Run It Yourself
1. Build and install the app on your emulator.
2. Swipe down the quick settings shade and toggle "Dark theme".
3. Return to the app. You will see the background instantly turn dark gray, and buttons turn light blue.

---

## Concept Unit: AppCompatDelegate.setDefaultNightMode

### The Problem
Sometimes the Android OS and the app get out of sync, especially on older devices or if the user minimizes the app, changes the system setting, and restores the app. Furthermore, you might eventually want to offer an in-app setting that lets the user override the system (e.g., "Always Dark"). We need to programmatically anchor the app's behavior at the earliest possible moment in its lifecycle.

### The New Code
```java
package com.example.inventoryapp;

import android.app.Application;
import androidx.appcompat.app.AppCompatDelegate;

public class InventoryApp extends Application {
    @Override
    public void onCreate() {
        super.onCreate();
        AppCompatDelegate.setDefaultNightMode(AppCompatDelegate.MODE_NIGHT_FOLLOW_SYSTEM);
    }
}
```

This class extends `Application`, not `AppCompatActivity`.

### The Updated Project
```xml
<!-- AndroidManifest.xml -->
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.example.inventoryapp">

    <application
        android:name=".InventoryApp" <!-- ← new -->
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.InventoryApp">
        <!-- ... activities ... -->
    </application>
</manifest>
```

### Mechanical Walkthrough
- `extends Application`: By subclassing `Application`, we hook into the very first class the Android OS instantiates when the app process starts. If we put this in `MainActivity`, the app might flash light colors for a split second before turning dark, because the Activity renders before the delegate takes effect.
- `setDefaultNightMode(...)`: This global static method intercepts the resource inflation process for all subsequent Activities. If omitted, the app relies purely on the OS, which is usually fine, but specifying it guarantees consistent behavior across all Android OS versions (especially Android 9 and older).
- `MODE_NIGHT_FOLLOW_SYSTEM`: This constant instructs the app to mirror the OS setting. Other options include `MODE_NIGHT_YES` (force dark) and `MODE_NIGHT_NO` (force light).
- `android:name=".InventoryApp"`: This manifest attribute registers our custom class. Without this, the OS simply boots the default `android.app.Application` class, and our `onCreate` code is never executed.

### CS Lens
This is the **Singleton Pattern** in action. The `Application` class is a singleton managed by the OS. It represents the global state of the process. By placing our initialization code here, we ensure it runs exactly once per process lifecycle, preventing redundant executions and race conditions.

### SE Lens
The principle here is **Fail-Safe Defaults**. We explicitly define the expected behavior rather than implicitly trusting the environment. The alternative is omitting this code, which works 95% of the time on modern devices but causes hard-to-reproduce bug reports on older manufacturer skins (like older Samsung or Xiaomi devices). The tradeoff is adding a tiny bit of boilerplate application logic.

### Run It Yourself
1. Ensure the manifest is updated and the `InventoryApp` class exists.
2. Run the app. Toggle the system dark mode. 
3. The app responds instantly and reliably.

---

## Connect the Pieces
When the user taps the app icon, the OS reads `AndroidManifest.xml` and instantiates `InventoryApp`. Inside `onCreate()`, `AppCompatDelegate` explicitly commands the app to follow the system dark mode state. As `MainActivity` launches, it loads `themes.xml`. The theme requests `@color/colorBackground`. The Android resource manager checks the device's current state. Seeing that night mode is active, it routes the request to `res/values-night/colors.xml`, pulling `#121212` instead of the white hex value from `res/values/colors.xml`. The entire screen renders in dark mode without a single `if` statement in your UI code.

## What Breaks Without This
If you misspell a color name in `values-night/colors.xml`:
1. Open `res/values-night/colors.xml` and change `<color name="colorBackground">` to `<color name="colorBg">`.
2. Run the app in dark mode.
3. **Result:** The background will instantly turn stark white, because the system couldn't find `colorBackground` in the `-night` folder and fell back to the light mode file.
4. **Fix:** Restore the name to exactly `colorBackground`.

## Exercises
1. **Force Dark:** Change `MODE_NIGHT_FOLLOW_SYSTEM` to `MODE_NIGHT_YES` in your Application class. Run the app while the device is in Light Mode. Verify the app stays dark. (Change it back afterward).
2. **The Red Theme:** Change `colorPrimary` in `values-night/colors.xml` to a bright red (`#FF0000`). Run the app in dark mode and observe how jarring and eye-straining a fully saturated color is against a dark background.
3. **Missing Resource:** Delete the `colorOnPrimary` entry entirely from your `values-night/colors.xml`. Run the app and observe the button text color fallback behavior.

## Definition of Done
- `res/values-night/colors.xml` is fully populated with desaturated hex values.
- `InventoryApp.java` is created and configured.
- `AndroidManifest.xml` correctly points to `.InventoryApp`.
- The application smoothly transitions between light and dark appearances based on the OS toggle.
- **Commit:** `git commit -m "Add values-night colors and Application class for dark mode support to ensure consistent system-following behavior"`
