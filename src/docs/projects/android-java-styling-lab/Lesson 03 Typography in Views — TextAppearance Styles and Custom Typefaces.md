# Lesson 03: Typography in Views — TextAppearance Styles and Custom Typefaces

**What you will build**
You will build a complete typography system using Material Design Components (MDC) `textAppearance` theme attributes, overriding them with a custom typeface (Nunito) loaded via a downloadable fonts XML file. The transferable problem is managing font styling centrally across an entire application without manually specifying `android:fontFamily` or `android:textSize` on every single view, establishing a scalable, maintainable design system layer for typography.

**What you need to know first**
* From the `android-ui-foundations` series: Lesson 09 (`TextView` and string resources) and Lesson 34 (`themes.xml` and style inheritance via `parent=`).
* From this `android-java-styling-lab` series: Lessons 01–02 covering basic MDC component usage and theming structure.

**Terms introduced in this lesson**
* **Downloadable Font** — An XML definition that tells Android to fetch a font file dynamically from a provider (like Google Play Services) rather than bundling the raw font file inside the APK. *Why it exists:* It significantly reduces the physical size of the app install by sharing common font files across many apps on the same device.
* **TextAppearance** — A specific type of Android style resource dedicated purely to text styling properties (family, size, weight, letter spacing) without carrying layout properties like margins or padding. *Why it exists:* It separates the styling of *what* text looks like from *where* the text is placed, allowing the same typography rules to be applied to a `Button` or a `TextView` equally.

**Objects and methods used**
* `app:fontProviderAuthority`
  * *What it is:* An XML attribute in a font family resource that identifies the system provider capable of fetching the font.
  * *Implementation:* `<font-family app:fontProviderAuthority="com.google.android.gms.fonts" ...>`
  * *Its use:* Directs Android to ask Google Play Services for the font over the network rather than looking for a local binary file.
* `android:textAppearance`
  * *What it is:* An XML attribute on `TextView` and its subclasses that applies a specific set of text styling rules to the view.
  * *Implementation:* `android:textAppearance="?attr/textAppearanceBodyLarge"`
  * *Its use:* Links a specific text element in a layout to a semantic typography role defined in the current theme, decoupling the view from hardcoded font properties.
* `textAppearanceLabelLarge` (and related MDC attributes)
  * *What it is:* A theme attribute defined by the MDC library representing the standard text style for buttons and short labels.
  * *Implementation:* `<item name="textAppearanceLabelLarge">@style/TextAppearance.InventoryApp.LabelLarge</item>` inside `themes.xml`.
  * *Its use:* Allows you to globally override the typography of every `MaterialButton` in the app by changing a single line in the theme.

---

## Concept Unit: How MDC textAppearance theme attributes work

### The Problem
When you place a `MaterialButton` or a `TextInputLayout` in your layout, they automatically render with specific font sizes, weights, and letter spacings. They do not just use generic default system text sizes. You need to know how they get these specific sizes so you can change them app-wide without manually editing every single layout file.

### The New Code
```xml
<!-- In res/values/themes.xml (Conceptual observation only) -->
<style name="Theme.InventoryApp" parent="Theme.Material3.DayNight.NoActionBar">
    <!-- MDC components look for these attributes by default -->
    <!-- textAppearanceLabelLarge controls Button text -->
    <!-- textAppearanceBodySmall controls TextInputLayout hints -->
</style>
```

### The Updated Project
No project changes are required yet, but the mechanism relies on your existing `themes.xml` definition.
```xml
<resources>
    <style name="Theme.InventoryApp" parent="Theme.Material3.DayNight.NoActionBar">
        <!-- Existing color primary and secondary mappings are here -->
        <!-- ← typography attribute mappings will go here -->
    </style>
</resources>
```

### Mechanical Walkthrough
* `Theme.Material3` inheritance: This parent theme pre-defines a mapping for every typography attribute (like `textAppearanceLabelLarge` or `textAppearanceBodySmall`) to a default Material style. Without this inheritance, MDC widgets would crash attempting to resolve missing attributes.
* Automatic attribute resolution: A `MaterialButton` internally requests the style mapped to `?attr/textAppearanceLabelLarge`. It does not hardcode a specific size or font. If you override this mapping in your theme, the button instantly reflects the new style.

### CS Lens
This is an implementation of *Indirection*. The widget does not know what font to use; it only holds a pointer (`textAppearanceLabelLarge`). The theme holds the pointer's destination. Indirection allows global state and style changes without modifying the consuming components.

### SE Lens
The alternative is inline styling: putting `android:textSize="14sp"` directly on every button in your XML layouts. We explicitly avoid this because a future design requirement to "make all buttons 16sp" would require a fragile, error-prone global search-and-replace across potentially hundreds of files. Theme attributes localize the styling change to a single, authoritative file.

### Run It Yourself
Open `themes.xml` and temporarily add `<item name="textAppearanceLabelLarge">@style/TextAppearance.Material3.DisplayLarge</item>`. Run the app. Every button's text is now massive. Remove the line to revert to normal.

## Concept Unit: Downloadable fonts XML

### The Problem
You want the app to use the "Nunito" typeface. Bundling the `.ttf` font files directly in the `res/font/` folder inflates your APK size, which slows down downloads and increases update costs for users on metered connections. You need a way to use the custom font without shipping it inside the application binary.

### The New Code
```xml
<?xml version="1.0" encoding="utf-8"?>
<font-family xmlns:app="http://schemas.android.com/apk/res-auto"
    app:fontProviderAuthority="com.google.android.gms.fonts"
    app:fontProviderPackage="com.google.android.gms"
    app:fontProviderQuery="name=Nunito&amp;weight=400"
    app:fontProviderCerts="@array/com_google_android_gms_fonts_certs">
</font-family>
```

### The Updated Project
Create `res/font/nunito.xml`. You must also ensure the certificate array exists so Android trusts the font provider.
```xml
<!-- In res/values/preloaded_fonts.xml -->
<resources>
    <!-- ← new -->
    <array name="com_google_android_gms_fonts_certs">
        <item>@array/com_google_android_gms_fonts_certs_dev</item>
        <item>@array/com_google_android_gms_fonts_certs_prod</item>
    </array>
    <string-array name="com_google_android_gms_fonts_certs_dev">
        <!-- Base64 cert string generated by Android Studio -->
        <item>MIIEqDCCA5CgAwIBAgIJANWFuGx90071MA0GCSqGSIb3DQEB...</item>
    </string-array>
    <string-array name="com_google_android_gms_fonts_certs_prod">
        <item>MIIEQzCCAyugAwIBAgIJAMLgh0ZkSjCNMA0GCSqGSIb3DQEB...</item>
    </string-array>
</resources>
```

### Mechanical Walkthrough
* `app:fontProviderAuthority="com.google.android.gms.fonts"`: Instructs the Android OS to route the font request to Google Play Services. Without this, Android attempts to parse the XML file as a raw binary font, which fails and falls back to default.
* `app:fontProviderQuery="name=Nunito&amp;weight=400"`: The actual search string sent to the provider. The exact syntax is dictated by the provider API. Without this, the provider does not know which typeface family or weight to download.
* `app:fontProviderCerts`: Provides the public key certificates to verify the identity of the font provider. Without this, Android blocks the download entirely to prevent a malicious app from spoofing Play Services and injecting executable code disguised as a font file.

### CS Lens
This is *Lazy Loading* paired with a *Remote Cache*. The heavy asset (the font) is only fetched over the network when absolutely needed (first render), and then cached locally by the OS. Subsequent requests, even from other apps on the device, hit the local cache, optimizing bandwidth and storage.

### SE Lens
The tradeoff here is offline availability on first run. If the user installs the app via a third-party store without Play Services, or runs it entirely offline the very first time, the font download fails. Android handles this gracefully by falling back to the default system font. We accept this tradeoff because a non-custom font is a cosmetic degradation, not a functional failure, making the massive APK size reduction worth the minimal risk.

### Run It Yourself
Disconnect your emulator from the internet completely, uninstall the app, and reinstall it from Android Studio. Run it. The app will not crash; it will simply display the default system font (Roboto). Reconnect the internet, kill the app process, and restart it. The Nunito font will appear.

## Concept Unit: TextAppearance style overrides

### The Problem
You have configured the Nunito font, but MDC widgets still default to the system font. You need to create custom `TextAppearance` styles that explicitly specify Nunito, and then map the MDC theme attributes to point to your newly created styles.

### The New Code
```xml
<style name="TextAppearance.InventoryApp.HeadlineLarge" parent="TextAppearance.Material3.HeadlineLarge">
    <item name="fontFamily">@font/nunito</item>
</style>
```

### The Updated Project
Create `res/values/type.xml` to hold the custom text appearances, then wire them into `themes.xml`.
```xml
<!-- In res/values/type.xml -->
<resources>
    <!-- ← new -->
    <style name="TextAppearance.InventoryApp.HeadlineLarge" parent="TextAppearance.Material3.HeadlineLarge">
        <item name="fontFamily">@font/nunito</item>
    </style>
    <style name="TextAppearance.InventoryApp.BodyLarge" parent="TextAppearance.Material3.BodyLarge">
        <item name="fontFamily">@font/nunito</item>
    </style>
    <style name="TextAppearance.InventoryApp.LabelLarge" parent="TextAppearance.Material3.LabelLarge">
        <item name="fontFamily">@font/nunito</item>
        <item name="android:textSize">15sp</item>
    </style>
</resources>
```

```xml
<!-- In res/values/themes.xml -->
<resources>
    <style name="Theme.InventoryApp" parent="Theme.Material3.DayNight.NoActionBar">
        <item name="colorPrimary">@color/md_theme_light_primary</item>
        <!-- ← new -->
        <item name="textAppearanceHeadlineLarge">@style/TextAppearance.InventoryApp.HeadlineLarge</item>
        <item name="textAppearanceBodyLarge">@style/TextAppearance.InventoryApp.BodyLarge</item>
        <item name="textAppearanceLabelLarge">@style/TextAppearance.InventoryApp.LabelLarge</item>
    </style>
</resources>
```

### Mechanical Walkthrough
* `parent="TextAppearance.Material3.HeadlineLarge"`: Inherits the precise line height, letter spacing, and text size specifications from the Material Design baseline. Without this parent inheritance, your style would default to a tiny system size and lack proper kerning, requiring you to specify every typographic measurement manually.
* `<item name="fontFamily">@font/nunito</item>`: Overrides only the typeface. The widget using this style will keep the inherited size and weight but draw the characters using Nunito.
* `<item name="textAppearanceLabelLarge">...` in `themes.xml`: Re-routes the MDC theme pointer. Now, when a `MaterialButton` asks the theme for `textAppearanceLabelLarge`, it receives your custom style containing Nunito instead of the Material default.

### CS Lens
This is the *Decorator Pattern* applied to data structures. We take an existing robust structure (`TextAppearance.Material3.LabelLarge`), wrap it in a new definition (`TextAppearance.InventoryApp.LabelLarge`), and selectively override specific properties (`fontFamily`) while passing all other properties through untouched.

### SE Lens
We use a separate `type.xml` file rather than stuffing these style declarations into `styles.xml`. This enforces a clean separation of concerns. `styles.xml` handles structural widget modifications (like custom button shapes or card elevations), while `type.xml` purely handles the typography taxonomy. This makes the project architecture much easier to navigate and maintain as the design system scales.

### Run It Yourself
Run the app. Observe that all `MaterialButton` instances globally now use the Nunito font, because they inherently read `textAppearanceLabelLarge` from the theme. Observe that standard text fields or hints also update automatically if they rely on the overridden attributes.

## Concept Unit: Applying textAppearance to plain TextViews

### The Problem
MDC components automatically look up specific `textAppearance` attributes. Plain `TextView` elements do not; they default to standard system styles. You need to explicitly tell your `TextView` elements which semantic typography role they fulfill in your layout.

### The New Code
```xml
<TextView
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:text="@string/login_header"
    android:textAppearance="?attr/textAppearanceHeadlineLarge" />
```

### The Updated Project
Update a standard layout file, such as `res/layout/activity_login.xml`.
```xml
<!-- In res/layout/activity_login.xml -->
<LinearLayout
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical"
    android:padding="16dp">

    <TextView
        android:id="@+id/headerText"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="@string/login_header"
        android:textAppearance="?attr/textAppearanceHeadlineLarge" /> <!-- ← new -->

    <TextView
        android:id="@+id/subtext"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="@string/login_instructions"
        android:textAppearance="?attr/textAppearanceBodyLarge" /> <!-- ← new -->
        
</LinearLayout>
```

### Mechanical Walkthrough
* `android:textAppearance="..."`: An attribute specific to text-displaying views that applies a bundled set of text styling rules. Without this, the `TextView` ignores your custom typography system entirely and renders with the default system font and size.
* `?attr/textAppearanceHeadlineLarge`: The `?attr/` syntax tells Android to query the *current active theme*, find the attribute named `textAppearanceHeadlineLarge`, and use whatever style it points to. Without `?attr/`, if you hardcoded `@style/TextAppearance.InventoryApp.HeadlineLarge`, the view would be tightly coupled to that exact style and would not adapt if you ever swapped themes dynamically (e.g., to a compact or high-contrast theme).

### CS Lens
This code differentiates between *Static Binding* (`@style/`) and *Dynamic Binding* (`?attr/`). Static binding resolves at compile time and cannot change. Dynamic binding resolves at runtime based on the context (the Activity's theme). We use dynamic binding so the layout remains purely structural and defers rendering decisions to the context.

### SE Lens
We explicitly avoid setting `android:fontFamily="@font/nunito"` and `android:textSize="32sp"` directly on the `TextView`. Applying visual properties directly to a widget mixes content structure with presentation. By tagging it with a semantic role (`textAppearanceHeadlineLarge`), the layout file declares *what* the text represents (a large headline), leaving the theme completely in control of defining exactly what a headline should look like.

### Run It Yourself
Change the `themes.xml` mapping for `textAppearanceHeadlineLarge` to temporarily point to a tiny style like `TextAppearance.Material3.LabelSmall`. Run the app. Notice the `TextView` header shrinks immediately. Revert the change.

## Connect the Pieces
1. Android inflates the layout and finds a `TextView` requesting `?attr/textAppearanceHeadlineLarge`.
2. It asks the Activity's theme (`Theme.InventoryApp` inside `themes.xml`) what that specific attribute means.
3. The theme points the request to `@style/TextAppearance.InventoryApp.HeadlineLarge` (inside `type.xml`).
4. That custom style inherits Material sizing specifications but explicitly overrides the typeface with `android:fontFamily="@font/nunito"`.
5. The `TextView` asks the OS for the Nunito font.
6. The OS reads `res/font/nunito.xml`, identifies the Google Play Services provider authority, and requests the font file remotely.
7. Play Services delivers the font file, and the text correctly renders on screen.

## What Breaks Without This
Remove `parent="TextAppearance.Material3.HeadlineLarge"` from your custom style in `type.xml` so that it only contains the `fontFamily` item. Run the app. 
The `TextView` using this style will instantly shrink to a tiny default size, and its letter spacing will look heavily cramped. By omitting the parent declaration, you severed the link to the Material Design baseline specifications. This forces the view to fall back to bare-minimum system defaults for all undefined properties (size, weight, line height). Restore the `parent` attribute to fix it.

## Exercises
1. Create a new style in `type.xml` for `TextAppearance.InventoryApp.TitleLarge` and map it to `textAppearanceTitleLarge` in `themes.xml`. Apply it to a standard `TextView` in another layout file.
2. In `type.xml`, override `android:letterSpacing` in your `HeadlineLarge` style to `0.1` and run the app to observe the visual result on the text layout.

## Definition of Done
* You have a `res/font/nunito.xml` downloadable font descriptor.
* You have a `res/values/type.xml` defining custom text appearances inheriting from Material3 defaults.
* Your `themes.xml` successfully maps MDC attributes (like `textAppearanceHeadlineLarge`) to your custom styles.
* Plain `TextView` elements are assigned semantic roles using `android:textAppearance="?attr/..."`.
* **Commit:** "Implement dynamic typography system using downloadable fonts and theme attributes" *Why: To establish a scalable, centralized font styling mechanism that reduces APK size and eliminates hardcoded layout typography.*
