# Lesson 10: Visual Audit — Reading Your Own App Like a Designer

**What you will build**
A completed visual audit of all three screens (login, inventory, notifications) in both light and dark modes, correcting the specific flaws identified. You will apply deliberate heuristics and professional tooling to verify the contrast, touch metrics, and structure of your finished layouts. The transferable problem: developers finish adding features and stop — a deliberate visual audit catches the accessibility regressions and competing visual signals that accumulate unconsciously during construction.

**What you need to know first**
You need the completed Java InventoryApp from all prior lessons in this series (Lessons 1-9), including your customized `themes.xml`, `colors.xml`, type scale, and Material Design Components. You also need a functional understanding of Android Studio's Layout Inspector. 

**Terms introduced in this lesson**
* **Contrast ratio** — a mathematical comparison of the luminance of a text color against the luminance of its background, expressed as a ratio (e.g., 4.5:1). *Why it exists: It provides an objective, measurable standard for legibility, ensuring text is readable by users with varying degrees of visual impairment rather than relying on a developer's subjective opinion.*
* **Tap target** — the physical area on a screen that responds to touch input for a specific interactive element. *Why it exists: Fingers are imprecise pointing devices; mandating a minimum physical area ensures users can reliably trigger actions without accidentally activating adjacent controls.*
* **Visual hierarchy** — the organization and prioritization of visual elements on a screen based on their size, contrast, and weight. *Why it exists: It directs the user's eye to the most important information first and establishes a clear path through the interface, preventing cognitive overload.*

**Objects and methods used**
* `android:minWidth` and `android:minHeight`
  * *What it is:* XML attributes that specify the absolute minimum dimensions a View is allowed to take on screen.
  * *Implementation:* `<Button android:minWidth="48dp" android:minHeight="48dp" ... />`
  * *Its use:* Guarantees that interactive elements meet the accessibility threshold for minimum tap target sizes, regardless of their internal content.
* `android:contentDescription`
  * *What it is:* An XML attribute that assigns a localized text description to a non-text View.
  * *Implementation:* `<ImageView android:contentDescription="@string/desc_add_item" ... />`
  * *Its use:* Provides screen readers (like TalkBack) with spoken text to read aloud when a user focuses on an image or icon button.

---

## Concept Unit: Contrast Audit with Layout Inspector

### The Problem
You have assigned colors to your text and backgrounds using theme attributes, but you do not know if those combinations are mathematically legible. A gray subtitle on a white background might look fine on your high-brightness developer monitor, but be invisible on a phone in sunlight. We need an objective measurement.

### The New Code
```xml
<!-- No new code yet; this is an inspection step -->
```

### The Updated Project
```xml
<!-- No new code yet; this is an inspection step -->
```

### Mechanical Walkthrough
* **Open Layout Inspector:** Run your app on an emulator or device. In Android Studio, select View > Tool Windows > Layout Inspector. This captures a live 3D snapshot of the running View hierarchy.
* **Inspect the Title:** Click the `TextView` representing the login screen title. In the Attributes pane, observe the computed `textColor` and the `background` color of its container. 
* **Compute Ratio:** Use a contrast calculator (like material.io/color/roles). The WCAG thresholds require a 4.5:1 ratio for normal text (under 18sp or 14sp bold) and 3:1 for large text (18sp+ or 14sp bold).
* **Verify all text:** Repeat this for the username label, the password label, and the button text.

### CS Lens
This is static analysis applied to user interfaces. Just as a compiler checks types before a program runs, an accessibility audit checks structural invariants (like luminance ratios) before the UI is deployed to users.

### SE Lens
The design principle here is "Objective over Subjective". When designers and developers argue over whether a color is "too light", they are wasting time. Establishing a firm mathematical threshold (WCAG AA or AAA) eliminates the debate and focuses the team on finding a compliant solution.

### Run It Yourself
Open your app, run Layout Inspector, and explicitly record the contrast ratio for the login title, username label, password label, and button text in both light and dark mode. 

## Concept Unit: Tap Target Audit

### The Problem
Icon buttons often look elegant when they are small (e.g., 24dp), but a 24dp icon is physically too small for a human thumb to tap reliably. You need the visual icon to remain small, but the interactive tap area to be large enough to meet the 48dp × 48dp minimum.

### The New Code
```xml
<FrameLayout
    android:layout_width="48dp"
    android:layout_height="48dp">

    <ImageButton
        android:id="@+id/btn_settings"
        android:layout_width="24dp"
        android:layout_height="24dp"
        android:layout_gravity="center"
        android:background="?attr/selectableItemBackgroundBorderless"
        android:src="@drawable/ic_settings" />
</FrameLayout>
```

### The Updated Project
```xml
<!-- activity_inventory.xml -->
<LinearLayout
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:orientation="horizontal">

    <TextView
        android:layout_width="0dp"
        android:layout_height="wrap_content"
        android:layout_weight="1"
        android:text="Inventory" />

    <!-- ← new -->
    <FrameLayout
        android:layout_width="48dp"
        android:layout_height="48dp">

        <ImageButton
            android:id="@+id/btn_settings"
            android:layout_width="24dp"
            android:layout_height="24dp"
            android:layout_gravity="center"
            android:background="?attr/selectableItemBackgroundBorderless"
            android:src="@drawable/ic_settings" />
    </FrameLayout>
    <!-- ← new -->
</LinearLayout>
```

### Mechanical Walkthrough
* `android:layout_width="48dp"` on `FrameLayout`: Sets the total physical area reserved in the layout. Because the `FrameLayout` is what we might wrap a click listener on, or because it expands the boundary of the `selectableItemBackgroundBorderless` ripple, it establishes the minimum tap area. Without this, the tap target shrinks to the child's size.
* `android:layout_width="24dp"` on `ImageButton`: Keeps the actual drawable asset rendered at a crisp, visually appropriate size. Without this, a 48dp icon might look comically large or blurry.
* `android:layout_gravity="center"`: Centers the 24dp icon within the 48dp frame. Without this, the icon aligns to the top-left, making the tap area physically asymmetrical relative to the visual icon.

### CS Lens
This is the principle of separating interface from implementation, applied to geometry. The visual representation of the button (the 24dp icon) is decoupled from its functional interaction boundary (the 48dp tap target).

### SE Lens
The tradeoff here is layout complexity vs. usability. Wrapping elements in `FrameLayout`s adds depth to the View hierarchy, which has a negligible performance cost, but vastly improves the user experience by preventing missed taps and user frustration.

### Run It Yourself
Apply this fix to the settings icon on the inventory screen. Run Layout Inspector, select the `FrameLayout`, and verify in the Attributes pane that its dimensions resolve to at least 48dp.

## Concept Unit: Accessibility Scanner

### The Problem
Manually auditing every View for contrast and tap targets is error-prone. We need an automated pass to catch missing metadata, such as descriptions for screen readers, and to flag geometric violations we missed.

### The New Code
```xml
<ImageView
    android:id="@+id/img_profile"
    android:layout_width="48dp"
    android:layout_height="48dp"
    android:src="@drawable/avatar_placeholder"
    android:contentDescription="@string/desc_user_profile" />
```

### The Updated Project
```xml
<!-- activity_inventory.xml -->
<androidx.constraintlayout.widget.ConstraintLayout
    android:layout_width="match_parent"
    android:layout_height="match_parent">

    <ImageView
        android:id="@+id/img_profile"
        android:layout_width="48dp"
        android:layout_height="48dp"
        android:src="@drawable/avatar_placeholder"
        android:contentDescription="@string/desc_user_profile" /> 
        <!-- // ← new -->
        
</androidx.constraintlayout.widget.ConstraintLayout>
```

### Mechanical Walkthrough
* `android:contentDescription="@string/desc_user_profile"`: Assigns semantic meaning to the pixels in the `ImageView`. When TalkBack (the Android screen reader) encounters this View, it will read the resolved string aloud. Without this, the screen reader either ignores the image or reads "unlabeled button", breaking navigation for visually impaired users.

### CS Lens
Adding `contentDescription` is a form of semantic annotation. We are providing out-of-band metadata that transforms unstructured visual data (a bitmap) into structured, queryable information for accessibility services.

### SE Lens
Automated tooling (Accessibility Scanner) is the first line of defense, but it is not a silver bullet. The tool will flag a missing description, but it cannot evaluate whether the description you provide actually makes sense in context. The engineer must still apply judgment.

### Run It Yourself
Install Accessibility Scanner from the Play Store on your device/emulator. Activate it, navigate to all three screens of your app, and capture snapshots. Resolve every issue it flags (usually missing `contentDescription` or small tap targets) by updating your XML files.

## Concept Unit: Visual Hierarchy Audit

### The Problem
When too many elements on a screen are large, high-contrast, or bold, they compete for the user's attention. A well-designed screen has exactly one primary focal point. We use the five-second heuristic: squint at the screen and identify the largest, boldest, and highest-contrast element. If they are different elements, the hierarchy is broken.

### The New Code
```xml
<TextView
    android:id="@+id/tv_notification_title"
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:textAppearance="?attr/textAppearanceHeadline6" />

<TextView
    android:id="@+id/tv_notification_date"
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:textAppearance="?attr/textAppearanceCaption" />
```

### The Updated Project
```xml
<!-- item_notification.xml -->
<LinearLayout
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:orientation="vertical"
    android:padding="16dp">

    <TextView
        android:id="@+id/tv_notification_title"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="System Update"
        android:textAppearance="?attr/textAppearanceHeadline6" /> 
        <!-- // ← new -->

    <TextView
        android:id="@+id/tv_notification_date"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="2 mins ago"
        android:textAppearance="?attr/textAppearanceCaption" /> 
        <!-- // ← new -->
</LinearLayout>
```

### Mechanical Walkthrough
* `android:textAppearance="?attr/textAppearanceHeadline6"`: Applies a specific Material type scale configuration (typically large and medium weight). This establishes the element as the primary textual focus of the list item. Without this, it defaults to `Body1`, blending in with surrounding text.
* `android:textAppearance="?attr/textAppearanceCaption"`: Applies a small, lower-contrast type style. This intentionally de-emphasizes the date, preventing it from competing with the title. Without this, the date would carry the same visual weight as the title, flattening the hierarchy.

### CS Lens
This is information theory applied to design. You have a limited "bandwidth" of user attention. By modulating size and contrast, you are encoding the relative priority of the data, ensuring the most critical bits are transmitted first.

### SE Lens
We rely on semantic theme attributes (`?attr/textAppearance...`) rather than hardcoding `android:textSize` and `android:textStyle`. If the design language changes, the hierarchy remains structurally intact because it is governed by the centralized type scale, not local overrides.

### Run It Yourself
Navigate to the Notifications screen. Identify if the timestamp competes with the notification title. Apply `textAppearanceCaption` to the timestamp and `textAppearanceHeadline6` to the title. Observe the immediate improvement in scannability.

## Connect the Pieces
In this lesson, you applied a three-step professional audit to your finished app. First, you used Layout Inspector to mathematically prove your text contrast passes WCAG standards. Second, you used structural XML (`FrameLayout`) to solve the geometric problem of tap targets without compromising visual sizing. Finally, you used semantic type scaling to enforce a strict visual hierarchy. Together, these steps transform a raw, functional app into a polished, accessible, and user-ready product.

## What Breaks Without This
Remove the `android:contentDescription` from your profile image. Run Accessibility Scanner again.
**Result:** The scanner immediately flags the element as an accessibility failure. A visually impaired user relying on TalkBack would hear nothing or "unlabeled button", rendering that part of the UI completely unusable.
Restore the attribute.

## Exercises
1. Run Layout Inspector on the Inventory screen in Dark Mode. Verify that the empty state text has a 4.5:1 contrast ratio against the dark background.
2. Intentionally set a button's `minWidth` to `24dp` and run Accessibility Scanner. Observe the specific failure message.
3. On the Login screen, apply `?attr/textAppearanceHeadline3` to the "Forgot Password" link. Squint at the screen. Notice how it now competes wildly with the main "Login" button. Revert it to `?attr/textAppearanceBody2`.

## Definition of Done
- [ ] You have manually verified the contrast ratios for text on the login screen.
- [ ] You have wrapped icon buttons in 48dp minimum tap targets.
- [ ] You have run Accessibility Scanner on all three screens and resolved all flagged issues.
- [ ] You have enforced a clear visual hierarchy using `textAppearance` attributes.
- [ ] You have committed your changes with the message: "Fix: Resolve visual and accessibility audit failures across all screens" because the app must be accessible and usable by all users before release.
