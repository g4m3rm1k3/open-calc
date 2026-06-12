# Lesson 30 — App Store Deployment

## What You Will Build

Submit the app to the Apple App Store and Google Play Store. Configure the production
build pipeline, create app store metadata (screenshots, descriptions, icons), sign the
app with production certificates, and navigate the review process.

---

## What You Need to Know First

- Lesson 06: Expo, compilation targets, Expo Go vs standalone
- Lesson 17: Environment variables, secrets

---

## The Lesson

### Step 1 — The Build Pipeline

**Development build vs production build:**
During development, Expo Go loads your JavaScript bundle from a dev server. This is fast
but not how the App Store works. A production build:
1. Bundles all JavaScript into a single minified file
2. Compiles any native modules
3. Signs the binary with your certificate
4. Produces an `.ipa` (iOS) or `.aab` (Android) file for submission

**EAS Build:** Expo Application Services Build runs the production build in the cloud.
You do not need a Mac to build an iOS app. EAS connects to Apple's servers using your
credentials and produces a signed `.ipa`.

```bash
$ npm install -g eas-cli
$ eas login
$ eas build:configure
# Produces eas.json
```

`eas.json` defines build profiles:
```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {
      "autoIncrement": true
    }
  }
}
```

**Profile purposes:**
- `development`: Expo Dev Client build — runs like Expo Go but with native modules
- `preview`: Internal distribution build — distribute to testers via TestFlight/Play testing
- `production`: App Store/Play Store submission build

**`autoIncrement: true` explained:**
Each build submitted to the App Store must have a unique build number (iOS) or version
code (Android). `autoIncrement` automatically increments the build number on each EAS Build
run, preventing "This build number has already been used" submission errors.

### Step 2 — App Signing

**Why apps must be signed:**
A cryptographic signature on the app binary proves it was built by a trusted party (you).
The OS verifies the signature before running the app. An unsigned or incorrectly signed app
refuses to install. The signature binds the app to a specific developer identity.

**iOS signing — three components:**
1. **Certificate:** Proves your identity as an Apple developer. Two types:
   - Development: for running on test devices
   - Distribution: for App Store and TestFlight

2. **App Identifier (Bundle ID):** A unique string for your app, e.g.,
   `com.yourcompany.codex`. Registered in Apple's Developer portal. Immutable once set.

3. **Provisioning Profile:** Links a certificate to specific app IDs and, for development,
   specific device UDIDs. The `.mobileprovision` file tells iOS: "an app with this bundle
   ID, signed by this certificate, may run on these devices (or any device for distribution)."

**EAS manages signing:**
```bash
$ eas credentials
```
EAS can generate and manage all three components automatically via the Apple Developer API.
For team development, EAS stores credentials in the cloud so any team member can build.

**Android signing:**
Android uses a keystore — a JKS or PKCS12 file containing a key pair. The keystore is used
for every update to the same app. If you lose the keystore and need to update the app,
you must publish a new app with a new package name. **Back up your keystore.**

```bash
$ eas build --platform android --profile production
```

**CS lens — PKI (Public Key Infrastructure):**
App signing uses asymmetric cryptography: a private key signs the binary; the OS
verifies with the corresponding public key. The trust chain: Apple's CA → your developer
certificate → your app. This is the same PKI that secures HTTPS certificates (Lesson 17).
The OS trusts Apple's CA; Apple vouches for developer certificates; developer certificates
vouch for app binaries.

### Step 3 — App Store Metadata

Apple and Google require metadata before review. Required for iOS:
- **App name:** Max 30 characters
- **Subtitle:** Max 30 characters
- **Description:** Max 4,000 characters
- **Keywords:** Max 100 characters, comma-separated (used for search ranking)
- **Privacy Policy URL:** Required if the app collects any user data
- **Screenshots:** At least one per required device size (iPhone 6.5", 6.1", iPad 12.9")
- **App icon:** 1024×1024 PNG, no rounded corners (the App Store adds them)

**Privacy details:**
Apple requires disclosure of data collection in the App Store listing (Privacy Nutrition
Label). For this app, you collect:
- Email address (Account Registration)
- Name (Account Registration)
- Identifiers (Device ID for push notifications)

Each category requires disclosing the purpose and whether data is linked to identity.

**EAS Submit — automates submission:**
```bash
$ eas submit --platform ios --profile production
# Prompts for Apple ID credentials
# Uploads the .ipa to App Store Connect
# Triggers review automatically
```

### Step 4 — Review Guidelines

Apple's App Store Review Guidelines (the "rules" for App Store apps) are non-negotiable.
Common rejection reasons:
- **Guideline 2.1:** App crashes, obvious bugs (test thoroughly)
- **Guideline 4.0:** Copycat or placeholder app — your app must have genuine value
- **Guideline 5.1.1:** Privacy — collect only what you need; explain data use
- **Guideline 5.1.2:** Data use consent — user must agree before data is collected

**Guideline 3.1.1:** In-app purchases for digital goods (subscriptions, lesson packs)
must use Apple's in-app purchase system (IAP). Linking to a web checkout for digital
goods violates guidelines. IAP gives Apple 15–30% of revenue.

**Review timeline:** First submissions take 24–48 hours. Updates after the first approval
often take 1–2 days. Expedited review (for critical bug fixes) is available via the
Resolution Centre.

### Step 5 — Environment Variables in Production

The app uses environment variables (`EXPO_PUBLIC_API_URL`). In production, this points
to the live API server, not `localhost`.

In `app.json`:
```json
{
  "expo": {
    "extra": {
      "apiUrl": "https://api.codexapp.io"
    },
    "eas": {
      "projectId": "your-project-id"
    }
  }
}
```

In code:
```typescript
import Constants from 'expo-constants'

const API_URL = Constants.expoConfig?.extra?.apiUrl ?? 'http://localhost:3000'
```

**Why `EXPO_PUBLIC_*` vars are embedded at build time:**
Expo bundles the app JavaScript. `EXPO_PUBLIC_API_URL` is replaced with its value
at bundle time — the resulting bundle has the literal string `https://api.codexapp.io`
not the variable name. This means:
1. The value is visible in the bundle (use for public endpoints only)
2. Changing the value requires a new build
3. Secrets (API keys) must NEVER use `EXPO_PUBLIC_` prefix — they would be visible

EAS secrets are encrypted environment variables that are injected only during the EAS
Build process and never sent to the client:
```bash
$ eas secret:create --name DATABASE_URL --value "postgresql://..."
```

---

## Connect the Pieces

The signing certificate chain (Apple CA → developer certificate → app binary) is the same
PKI model as HTTPS (Let's Encrypt → domain certificate → HTTPS connection). In both cases,
a trusted authority vouches for identity, and the recipient verifies the chain.

The `autoIncrement` build number is the same problem as database schema migrations: each
version must be uniquely identified in sequence. `autoIncrement` solves this automatically
for builds, just as `@@id` solves it for database rows (Lesson 12).

`EXPO_PUBLIC_*` variables being embedded at build time is a fundamental constraint of
mobile apps: unlike web servers that run server-side code, the mobile app is a static
bundle. This is why secrets cannot be in the bundle — the bundle is shipped to every
user's device.

---

## What Breaks Without This

Without backing up the Android keystore, an app update is impossible after the original
keystore is lost. The Google Play Store ties the app identity to the keystore signature.
Publishing with a different key creates a new, separate app — users of the original app
cannot update to the new version. They must uninstall and reinstall. Data in the app's
private storage is lost.

Without a privacy policy URL, Apple rejects the app during review with guideline 5.1.1.
The review process adds 1–2 days. For time-sensitive launches (ahead of an event or
announcement), a missing privacy policy URL causes a material delay.

---

## Definition of Done

- [ ] `eas.json` is configured with `development`, `preview`, and `production` profiles
- [ ] A production build completes on EAS without errors
- [ ] App Store Connect (iOS) or Google Play Console (Android) shows the uploaded build
- [ ] App icon (1024×1024 PNG) and at least one screenshot per required device size are uploaded
- [ ] Privacy Nutrition Label is completed for email, name, and push token
- [ ] `EXPO_PUBLIC_API_URL` points to the production API in the EAS production build
- [ ] You can answer: what are the three components of iOS code signing?
- [ ] You can answer: why is the Android keystore impossible to recover if lost?
- [ ] You can answer: why cannot `EXPO_PUBLIC_*` variables hold secrets?
- [ ] You can answer: what does `autoIncrement` prevent?
- [ ] `git commit` with a message explaining why — "Configure EAS Build profiles and production environment for App Store submission"
