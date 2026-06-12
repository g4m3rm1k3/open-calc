# Lesson 28 — Push Notifications

## What You Will Build

Daily streak reminder notifications: if the user has not completed a lesson by 8pm,
a push notification fires reminding them. Users can enable or disable notifications in
the app's settings. The notification taps deep-link to the lesson list.

---

## What You Need to Know First

- Lesson 17: JWT, auth middleware
- Lesson 22: Streak tracking, user model
- Lesson 25: Async event handling

---

## The Lesson

### Step 1 — How Push Notifications Work

**The push notification infrastructure:**
Push notifications require a relay service between your server and the device. You cannot
send a notification directly to a phone — you must send it to a platform notification
service, which delivers it to the device.

```
Your server → APNs (Apple Push Notification service) → iPhone
Your server → FCM (Firebase Cloud Messaging) → Android
```

**Why a relay is required:**
The phone's OS maintains a persistent connection to APNs (iOS) or FCM (Android). This
connection exists even when your app is not running. When you send a notification to APNs,
APNs forwards it to the device over this persistent connection. Your server cannot maintain
its own persistent connection to millions of devices.

**Expo Notifications abstracts this:**
Expo wraps APNs and FCM behind a single API. You send notifications to Expo's service
(EAS — Expo Application Services), which forwards to the correct platform. For production,
you can configure your own APNs/FCM credentials.

**CS lens — two-phase delivery:**
This is an example of **store-and-forward messaging** — a pattern where messages are
stored at an intermediary and forwarded when the destination is available. If the device
is offline, APNs holds the notification and delivers it when the device reconnects.
Message queues (RabbitMQ, SQS) use the same pattern for server-to-server communication.

### Step 2 — Requesting Notification Permission

On iOS, notification permission is a user grant. On Android 13+, it also requires
a runtime permission. Never request permission on app launch — request it at a moment
when the user understands why (e.g., after they turn on "Daily Reminders" in Settings).

```typescript
import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import Constants from 'expo-constants'
import { Platform } from 'react-native'

export async function requestNotificationPermission(): Promise<string | null> {
  if (!Device.isDevice) {
    // Push notifications don't work in the simulator/emulator
    return null
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync()
  let finalStatus = existingStatus

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync()
    finalStatus = status
  }

  if (finalStatus !== 'granted') {
    return null   // User denied
  }

  const projectId = Constants.expoConfig?.extra?.eas?.projectId
  if (typeof projectId !== 'string') {
    throw new Error('EAS projectId not configured in app.json')
  }

  const token = await Notifications.getExpoPushTokenAsync({ projectId })
  return token.data   // e.g. "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]"
}
```

**`Notifications.getExpoPushTokenAsync({ projectId })` explained:**
This calls Expo's service to obtain a **push token** for this specific device and Expo
project. The push token identifies this device+app combination. Your server stores it
and uses it to address notifications. The push token is analogous to an email address:
it routes to one specific recipient.

**`Device.isDevice` explained:**
`Device.isDevice` is `false` in the iOS Simulator or Android Emulator. Simulators cannot
register for push notifications (they have no APNs registration). Attempting to get a
push token on a simulator throws an error.

**`Constants.expoConfig?.extra?.eas?.projectId` explained:**
The EAS project ID is configured in `app.json` under `expo.extra.eas.projectId`. `Constants.expoConfig`
reads the active Expo configuration at runtime. The `?.` optional chaining handles the
case where `app.json` is not yet configured.

### Step 3 — Saving Tokens to the Database

Add `pushToken` to the `User` model:
```prisma
model User {
  // ...
  pushToken   String?  @map("push_token")
  notificationsEnabled Boolean @default(false) @map("notifications_enabled")
}
```

Register the token after the user enables notifications:
```typescript
// Client
async function enableNotifications() {
  const token = await requestNotificationPermission()
  if (token === null) {
    Alert.alert('Notifications Denied', 'Enable notifications in your device settings.')
    return
  }

  await fetch(`${API_URL}/api/users/push-token`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ pushToken: token, notificationsEnabled: true }),
  })
}
```

```typescript
// Server route
router.put('/push-token', authenticate, async (req, res, next) => {
  try {
    const { pushToken, notificationsEnabled } = z.object({
      pushToken: z.string().min(1),
      notificationsEnabled: z.boolean(),
    }).parse(req.body)

    await prisma.user.update({
      where: { id: req.userId! },
      data: { pushToken, notificationsEnabled },
    })

    res.json({ success: true })
  } catch (error) {
    next(error)
  }
})
```

### Step 4 — Sending Notifications from the Server

**The scheduled notification job:**
Check at 8pm each day which users have `notificationsEnabled = true` and have not completed
a lesson today. Send them a reminder.

```typescript
import Expo, { type ExpoPushMessage } from 'expo-server-sdk'
import { CronJob } from 'cron'

const expo = new Expo()

async function sendStreakReminders() {
  const todayUTC = new Date().toISOString().slice(0, 10)

  // Find users who want notifications and have not been active today
  const users = await prisma.user.findMany({
    where: {
      notificationsEnabled: true,
      pushToken: { not: null },
      NOT: {
        lastActivityDate: todayUTC,
      },
    },
    select: { id: true, pushToken: true, currentStreak: true },
  })

  const messages: ExpoPushMessage[] = users
    .filter(user => Expo.isExpoPushToken(user.pushToken!))
    .map(user => ({
      to: user.pushToken!,
      sound: 'default',
      title: 'Keep your streak going! 🔥',
      body: user.currentStreak > 0
        ? `You have a ${user.currentStreak}-day streak. Complete a lesson before midnight!`
        : 'Complete your first lesson today!',
      data: { screen: 'Lessons' },
    }))

  // Send in batches of 100
  const chunks = expo.chunkPushNotifications(messages)
  for (const chunk of chunks) {
    await expo.sendPushNotificationsAsync(chunk)
  }
}

// Schedule to run at 8pm UTC every day
const job = new CronJob('0 20 * * *', sendStreakReminders)
job.start()
```

**`expo.chunkPushNotifications(messages)` explained:**
Expo's push API accepts at most 100 messages per request. `chunkPushNotifications` splits
an array of messages into arrays of up to 100. Each chunk is sent in a separate API call.
This prevents exceeding the rate limit for large user bases.

**`Expo.isExpoPushToken(token)` explained:**
Validates that the stored token has the correct format before sending. Push tokens can
become stale (user reinstalls the app, permissions are revoked). An invalid token causes
a delivery error but not an exception; valid format checking prevents unnecessary API calls.

**Cron job syntax `'0 20 * * *'` explained:**
Cron schedule syntax has five fields: `minute hour day month weekday`.
- `0` — at minute 0
- `20` — at hour 20 (8pm UTC)
- `*` — every day
- `*` — every month
- `*` — every weekday

This means: "at 8:00pm UTC, every day, every month, every weekday."

**What the `data` field is:**
The notification payload's `data` object is delivered to the app when the user taps the
notification. The app reads `notification.request.content.data.screen` and navigates to
the correct screen — this is **deep linking** from a notification.

### Step 5 — Handling Notification Taps

```typescript
import { useEffect } from 'react'
import * as Notifications from 'expo-notifications'
import { useNavigation } from '@react-navigation/native'

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
})

export function NotificationHandler() {
  const navigation = useNavigation()

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      const screen = response.notification.request.content.data?.screen
      if (screen === 'Lessons') {
        navigation.navigate('Lessons' as never)
      }
    })

    return () => subscription.remove()
  }, [navigation])

  return null
}
```

**`addNotificationResponseReceivedListener` explained:**
This fires when the user taps a notification — whether the app was foreground, background,
or fully killed. The `response` contains the notification payload, including the `data`
object your server sent. This is the entry point for deep linking from notifications.

**`Notifications.setNotificationHandler` explained:**
Controls how notifications are displayed when the app is in the **foreground**. Without
it, notifications are silently dropped when the app is open. The handler's return value
determines whether to show the alert, play sound, and set the badge.

---

## Connect the Pieces

The push token is an address — the same concept as a WebSocket socket ID (Lesson 25).
Both identify a specific client connection. The difference: a WebSocket ID is ephemeral
(lost when the connection closes); a push token persists across app restarts and offline
periods.

The cron job sending streak reminders is the server-side event loop's counterpart to the
client-side `useEffect` with `setInterval`. Both execute code on a schedule. The cron
job uses the operating system's scheduler; `setInterval` uses the JavaScript event loop.

The two-tier delivery (your server → Expo → APNs → device) is the same store-and-forward
messaging as a CDN (Lesson 24): content is pushed to an intermediary (CDN edge nodes /
APNs), and the intermediary delivers to the final destination on demand.

---

## What Breaks Without This

Without `Device.isDevice` check, trying to get a push token in the simulator throws:
`Error: Push notifications do not work in an iOS simulator or Android Emulator`. The
error appears at token registration time, not at send time — confusing if you
do not know this limitation.

Without chunking large notification batches, sending to 10,000 users in one API call
returns a `400 Too many messages` error. The entire batch fails. With chunking, the
first 9,900 succeed even if the last batch hits an error.

---

## Definition of Done

- [ ] Toggling "Daily Reminders" on saves the push token to the database
- [ ] A test notification is sent and received on a real device
- [ ] Tapping the notification navigates to the Lessons screen
- [ ] Users who completed a lesson today are excluded from the reminder batch
- [ ] The cron job is configured with the correct timezone for 8pm
- [ ] You can answer: why is a relay service (APNs/FCM) required for push notifications?
- [ ] You can answer: what is a push token and why is it stored in the database?
- [ ] You can answer: why does `Expo.chunkPushNotifications` exist?
- [ ] You can answer: what is deep linking from a notification?
- [ ] `git commit` with a message explaining why — "Add push notifications with Expo, streak reminders, and notification deep linking"
