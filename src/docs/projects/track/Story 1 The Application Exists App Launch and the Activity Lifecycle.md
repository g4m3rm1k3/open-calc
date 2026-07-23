## Story 1: The Application Exists (App Launch and the Activity Lifecycle)

**What you will build:** You will create the foundational entry point for Pocket Inventory. When you tap the app icon, the Android OS will allocate memory and launch a blank screen that says "Hello Inventory."

**What you need to know first:** Basic Java class inheritance (using the `extends` keyword) and method overriding (`@Override`).

### 1. The Problem: The OS is in Control

In standard Java, C++, or Python, you are used to having a single entry point—like `public static void main()`. Your code starts, executes in order, and ends. You are in complete control of the timeline.

Mobile operating systems do not work this way. A phone call might interrupt your app, or the user might swipe it away to save battery. Because resources are incredibly tight on a mobile device, the Android OS is the master controller. It tells your app when to start, when to pause, and when to die.

To understand this, let's look at a throwaway simulation of standard Java versus the Android approach.

```java
// throwaway_standard.java
class StandardJavaApp {
    public static void main(String[] args) {
        System.out.println("App started. I am in control.");
    }
}

```

If you run this, it prints the statement and exits immediately. Now look at how an operating system manages an app's lifecycle.

```java
// throwaway_android_sim.java
class FakeAndroidOS {
    public void userTappedAppIcon(FakeActivity activity) {
        System.out.println("OS: Allocating memory...");
        activity.onCreate(); // The OS calls YOUR method
    }
}

class FakeActivity {
    public void onCreate() {
        System.out.println("App: The OS told me to wake up and draw my UI.");
    }
}

new FakeAndroidOS().userTappedAppIcon(new FakeActivity());

```

When we execute this simulation, we see the relationship change:

```text
OS: Allocating memory...
App: The OS told me to wake up and draw my UI.

```

We can discard this throwaway code. In Android, your application is a collection of components waiting for the OS to pull their triggers. The primary component for a screen is called an `Activity`.

**Project Change:** We are going to create our first screen and tell the OS it exists.

* **Reference Source:** None (New Files)
* **Files affected:** `MainActivity.java` and `AndroidManifest.xml`
* **Change type:** Creation
* **Location:** `app/src/main/java/` and `app/src/main/`

Here is the absolute minimum Java code required to create an Android screen.

```java
// MainActivity.java
package com.example.pocketinventory;

import android.os.Bundle;
import androidx.appcompat.app.AppCompatActivity;

public class MainActivity extends AppCompatActivity {  // ← new

    @Override                                        // ← new
    protected void onCreate(Bundle savedInstanceState) { // ← new
        super.onCreate(savedInstanceState);          // ← new
        setContentView(R.layout.activity_main);      // ← new
    }
}

```

Writing this file isn't enough. The Android OS doesn't scan your Java files; it reads a configuration file called the Manifest to know what your app is capable of. We must register this Activity.

```xml
<!-- AndroidManifest.xml -->
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.example.pocketinventory">

    <application
        android:label="Pocket Inventory"
        android:theme="@style/Theme.PocketInventory">
        
        <activity android:name=".MainActivity" android:exported="true"> <!-- new -->
            <intent-filter>                                             <!-- new -->
                <action android:name="android.intent.action.MAIN" />    <!-- new -->
                <category android:name="android.intent.category.LAUNCHER" /> <!-- new -->
            </intent-filter>                                            <!-- new -->
        </activity>                                                     <!-- new -->
        
    </application>
</manifest>

```

**Mechanical walkthrough:**

1. **`extends AppCompatActivity`** (First appearance). We inherit thousands of lines of UI and lifecycle logic from the Android framework.
2. **`@Override protected void onCreate(...)`** (First appearance). We are intercepting the exact moment the OS allocates memory for this screen.
3. **`super.onCreate(savedInstanceState);`** (Hard concept). You *must* call the parent class's `onCreate` first, or the app will instantly crash. The OS needs to do its internal setup before you do yours.
4. **`setContentView(R.layout.activity_main);`** (First appearance). We tell the Java class to load a specific XML file to draw the UI (we will build this XML in Story 2).
5. **`<intent-filter>`** (First appearance). This XML block is how we tell the OS: "Put an icon on the home screen (`LAUNCHER`), and when the user taps it, start here (`MAIN`)."

**CS lens:** This is **Inversion of Control (IoC)**. In a library, you call the library's code. In a framework (like Android), the framework calls *your* code.

**SE lens:** Why force developers to use `onCreate` instead of a constructor? Because Android needs to be able to destroy and recreate your Activity silently in the background (like when you rotate your phone). If you used a standard Java constructor, you'd break the OS's ability to manage memory efficiently. The tradeoff is that state management becomes slightly more complex.

**Commands needed:** Click the green "Run" arrow in Android Studio (or run `./gradlew installDebug` from the terminal).

The app installs on the emulator. You will see a blank screen with a title bar.

### Closing

**Connect the pieces:**
When you tap the app icon, the OS reads the `AndroidManifest.xml`. It sees that `.MainActivity` is marked as the launcher. The OS instantiates `MainActivity` in memory and calls its `onCreate()` method. Inside `onCreate`, your code calls `setContentView`, which parses the XML layout and paints the pixels on the screen.

**What breaks without this:**
If you delete the `<intent-filter>` block from the Manifest and hit run, Android Studio will throw an error: `Error running 'app': Default Activity not found`. The app installs, but there is no icon on the phone's home screen because the OS doesn't know how to launch it.

**Definition of done:**

* [x] `MainActivity.java` created.
* [x] Manifest updated with Launcher intent.
* [x] App compiles and launches on an emulator/device.

---

### Context Snapshot (Pocket Inventory)

**1. File Tree:**

```text
.
├── app/src/main/AndroidManifest.xml
└── app/src/main/java/com/example/pocketinventory/MainActivity.java

```

**2. Layout State:**

* Requires `activity_main.xml` (To be built in Story 2).

**3. Activity Manifest:**

* `MainActivity` registered as MAIN/LAUNCHER.

**4. Dependencies:**

* Standard AndroidX libraries.

**5. Test State:**

* Tests: None yet.

**6. Sprint Completion State:**

* Completed: Story 1
* Implemented: App Launch, Activity Lifecycle mapping.
* Next: Story 2 - Professional home screen (Layouts).

**7. Current Architecture State:**

* UI Layer: Pointing to non-existent XML.
* Activity Logic: `MainActivity` initialized.

---

Here is the extracted concept for your folder:

```markdown
# Concept: Inversion of Control & The Android Activity

**What you'll understand by the end:** how mobile frameworks manage execution flow and why standard programmatic entry points (like `main()`) are abandoned in favor of lifecycle callbacks.

**Prerequisites:** basic class inheritance.

## Setup
No install needed. The isolated example uses standard Java to simulate an OS.

## The Problem
In standard desktop software, the developer's code dictates the execution timeline from a single `main()` entry point. On a mobile device, resources (memory, battery, screen space) are highly constrained and heavily policed. The operating system must be able to pause, background, or destroy an application at any moment (e.g., during an incoming phone call) without relying on the developer's code to "exit cleanly."

## The Isolated Example
A standard Java program where the developer is in control:
```java
class StandardApp {
    public static void main(String[] args) {
        System.out.println("App started. I am in control.");
    }
}

```

An Inversion of Control model where the OS acts as the main controller:

```java
class FakeAndroidOS {
    public void userTappedAppIcon(FakeActivity activity) {
        // The OS does its internal routing and memory allocation first
        System.out.println("OS: Allocating memory...");
        // The OS triggers the developer's code
        activity.onCreate(); 
    }
}

class FakeActivity {
    // The developer "hooks" into the OS's timeline
    public void onCreate() {
        System.out.println("App: The OS told me to wake up and draw my UI.");
    }
}

new FakeAndroidOS().userTappedAppIcon(new FakeActivity());

```

**Real output:**

```text
OS: Allocating memory...
App: The OS told me to wake up and draw my UI.

```

**What this proves:** The `FakeActivity` never initiates its own startup. It passively waits for `FakeAndroidOS` to call `onCreate()`. The developer's job shifts from "writing a script that runs" to "writing responses to events triggered by the system."

## Mechanical Walkthrough

* The **Framework** (Android) provides base classes (like `AppCompatActivity`) that contain thousands of lines of hidden logic for talking to the phone's hardware.
* The **Developer** creates a subclass and `@Override`s specific lifecycle methods (`onCreate`, `onPause`, `onDestroy`).
* When a user interacts with the device (tapping an icon), the OS checks a registry (the `AndroidManifest.xml`), finds the correct class, instantiates it, and invokes the overridden method.
* The developer *must* call `super.onCreate()` before running their own logic, acknowledging that the parent framework must configure itself before the child class operates.

## CS Lens

This is **Inversion of Control (IoC)**, famously summarized by the "Hollywood Principle": *Don't call us, we'll call you.* It is the defining architectural difference between a **Library** and a **Framework**. You call a library's code to do a job; a framework calls *your* code to fill in the blanks of its own execution loop.

## SE Lens

The real, deliberate tradeoff: forcing developers to use lifecycle hooks instead of standard constructors makes state management significantly more difficult. If a user rotates their screen, Android will aggressively destroy the Activity and call `onCreate()` again on a brand new instance to load a landscape layout. This guarantees memory efficiency for the OS, but forces the developer to manually save and restore their UI state constantly.

## Connection

This introduces the foundation of Event-Driven programming. Instead of a linear script, the app is a state machine reacting to external OS interrupts.

## Try It Yourself

1. Open an Android project and attempt to override the standard Java constructor `public MainActivity() { ... }` instead of using `onCreate()`. Note that attempting to manipulate UI elements here will crash the app because the OS hasn't actually attached the window to the device screen yet.

```

<FollowUp label="Ready for Story 2?" query="Start Story 2: Professional home screen with ConstraintLayout."/>

```