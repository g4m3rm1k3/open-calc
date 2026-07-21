import { generateSecretKey, getPublicKey, finalizeEvent, SimplePool } from 'nostr-tools'

export const RELAYS = [
  'wss://relay.damus.io',
  'wss://nos.lol',
  'wss://relay.nostr.place',
  'wss://purplerelay.com',
  'wss://relay.snort.social',
]

// Each user gets a persistent Nostr identity stored locally.
// This is not linked to any external Nostr account — purely internal to opencalc.
function toHex(bytes) {
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
}
function fromHex(hex) {
  return new Uint8Array(hex.match(/.{2}/g).map(b => parseInt(b, 16)))
}

export function getOrCreateKeypair() {
  const stored = localStorage.getItem('oc-nostr-sk')
  let skBytes
  if (stored) {
    skBytes = fromHex(stored)
  } else {
    skBytes = generateSecretKey()
    localStorage.setItem('oc-nostr-sk', toHex(skBytes))
  }
  return { sk: skBytes, pk: getPublicKey(skBytes) }
}

export function createPool() {
  return new SimplePool()
}

// Tag format: "opencalc-v1-{roomId}" — specific enough to avoid Nostr namespace collisions
export function roomTag(roomId) {
  return `opencalc-v1-${roomId}`
}

export async function publishMessage(pool, sk, roomId, payload) {
  const event = finalizeEvent({
    kind: 1,
    created_at: Math.floor(Date.now() / 1000),
    tags: [['t', roomTag(roomId)]],
    content: JSON.stringify(payload),
  }, sk)
  try {
    await Promise.any(pool.publish(RELAYS, event))
  } catch {
    // At least one relay rejected — not fatal, P2P still delivered it
  }
  return event
}

function parseNostrEvent(event) {
  const payload = JSON.parse(event.content)
  if (!payload?.text || !payload?.username) return null
  return {
    id: `nostr-${event.id}`,
    peerId: payload.peerId || event.pubkey.slice(0, 16),
    username: String(payload.username).slice(0, 20),
    text: String(payload.text).slice(0, 500),
    timestamp: event.created_at * 1000,
    isOwn: false,
    isLovelace: !!payload.isLovelace,
    mentions: Array.isArray(payload.mentions) ? payload.mentions : [],
    fromNostr: true,
  }
}

// Fetch the last `hours` of messages for a room.
// Calls onEvent for each valid message, onDone when the relay signals end-of-stored-events.
export function subscribeHistory(pool, roomId, hours, onEvent, onDone) {
  const since = Math.floor(Date.now() / 1000) - hours * 3600
  const sub = pool.subscribeMany(
    RELAYS,
    { kinds: [1], '#t': [roomTag(roomId)], since, limit: 200 },
    {
      onevent(event) {
        try {
          const msg = parseNostrEvent(event)
          if (msg) onEvent(msg)
        } catch { /* malformed event */ }
      },
      oneose() {
        onDone?.()
        sub.close()
      },
    }
  )
  return sub
}

// Stay subscribed from `since` (Unix seconds) — never closes, delivers live events.
// Returns the sub so the caller can close it on unmount.
export function subscribeLive(pool, roomId, since, onEvent) {
  return pool.subscribeMany(
    RELAYS,
    { kinds: [1], '#t': [roomTag(roomId)], since },
    {
      onevent(event) {
        try {
          const msg = parseNostrEvent(event)
          if (msg) onEvent(msg)
        } catch { /* malformed event */ }
      },
    }
  )
}
