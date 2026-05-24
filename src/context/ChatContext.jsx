import { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { joinRoom } from '@trystero-p2p/nostr'
import { useLocation } from 'react-router-dom'
import { LESSON_MAP } from '../content/index.js'
import { getOrCreateKeypair, createPool, publishMessage, subscribeHistory } from '../lib/nostrChat.js'
import { getGpuScore } from '../utils/gpuScore.js'

const ChatContext = createContext(null)

const APP_CONFIG = { appId: 'open-calc-v1' }
const MAX_MESSAGES = 200
const HISTORY_HOURS = 24

const ADJ = ['Curious', 'Infinite', 'Prime', 'Acute', 'Tangent', 'Integral', 'Limit', 'Vector', 'Complex', 'Rational']
const NAMES = ['Euler', 'Newton', 'Gauss', 'Cantor', 'Riemann', 'Leibniz', 'Fermat', 'Hilbert', 'Cauchy', 'Fourier']

function makeUsername() {
  return ADJ[Math.floor(Math.random() * ADJ.length)] + NAMES[Math.floor(Math.random() * NAMES.length)]
}

const BAD_PATTERNS = [/f+u+c+k+/gi, /s+h+i+t+/gi, /a+s+s+h+o+l+e/gi, /b+i+t+c+h/gi]
function filterText(text) {
  let t = text
  BAD_PATTERNS.forEach(p => { t = t.replace(p, '***') })
  return t
}

function lessonIdFromPath(pathname) {
  const m = pathname.match(/^\/chapter\/([^/]+)(?:\/([^/]+))?/)
  if (!m || !m[2]) return null
  return LESSON_MAP[`${m[1]}/${m[2]}`]?.id ?? null
}

function mergeMessages(existing, incoming) {
  const seen = new Set(existing.map(m => m.id))
  const merged = [...existing]
  for (const msg of incoming) {
    if (!seen.has(msg.id)) { merged.push(msg); seen.add(msg.id) }
  }
  return merged.sort((a, b) => a.timestamp - b.timestamp).slice(-MAX_MESSAGES)
}

export function ChatProvider({ children }) {
  const location = useLocation()

  const [username, setUsernameState] = useState(
    () => localStorage.getItem('oc-chat-username') || makeUsername()
  )
  const [blockedUsers, setBlockedUsers] = useState(() => {
    try { return JSON.parse(localStorage.getItem('oc-blocked-peers') || '[]') }
    catch { return [] }
  })
  const blockedPeers = useMemo(() => new Set(blockedUsers.map(u => u.peerId)), [blockedUsers])

  const [globalMessages, setGlobalMessages] = useState([])
  const [lessonMessages, setLessonMessages] = useState([])
  const [globalPeers, setGlobalPeers] = useState(0)
  const [lessonPeers, setLessonPeers] = useState(0)
  const [currentLessonId, setCurrentLessonId] = useState(null)
  const [connected, setConnected] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [globalHistoryLoaded, setGlobalHistoryLoaded] = useState(false)
  const [lessonHistoryLoaded, setLessonHistoryLoaded] = useState(false)

  const sendGlobalRef = useRef(null)
  const sendLessonRef = useRef(null)
  const lessonRoomRef = useRef(null)
  const usernameRef = useRef(username)
  usernameRef.current = username
  const nostrPool = useRef(null)
  const keypair = useRef(null)

  // Lovelace P2P host election
  const myGpuScoreRef = useRef(0)
  const peerScoresRef = useRef(new Map()) // peerId → score
  const [lovelaceHostId, setLovelaceHostId] = useState('local')
  const [pendingLovelaceQueries, setPendingLovelaceQueries] = useState([])
  const sendLovelaceChannelRef = useRef(null)

  function reelectHost() {
    let bestId = 'local'
    let bestScore = myGpuScoreRef.current
    for (const [pid, score] of peerScoresRef.current) {
      if (score > bestScore) { bestScore = score; bestId = pid }
    }
    setLovelaceHostId(bestId)
  }

  const markAllRead = useCallback(() => setUnreadCount(0), [])

  const setUsername = useCallback((name) => {
    const clean = name.trim().slice(0, 20)
    if (!clean) return
    localStorage.setItem('oc-chat-username', clean)
    setUsernameState(clean)
  }, [])

  const blockPeer = useCallback((peerId, username) => {
    setBlockedUsers(prev => {
      if (prev.some(u => u.peerId === peerId)) return prev
      const next = [...prev, { peerId, username: username || peerId.slice(0, 8) }]
      localStorage.setItem('oc-blocked-peers', JSON.stringify(next))
      return next
    })
  }, [])

  const unblockPeer = useCallback((peerId) => {
    setBlockedUsers(prev => {
      const next = prev.filter(u => u.peerId !== peerId)
      localStorage.setItem('oc-blocked-peers', JSON.stringify(next))
      return next
    })
  }, [])

  // Init Nostr keypair + pool once
  useEffect(() => {
    keypair.current = getOrCreateKeypair()
    nostrPool.current = createPool()
    return () => {
      try { nostrPool.current?.close?.([], {}) } catch {}
    }
  }, [])

  // Compute GPU score once on mount
  useEffect(() => {
    getGpuScore().then(score => {
      myGpuScoreRef.current = score
      reelectHost()
    })
  }, [])

  function makeIncomingMsg(data, peerId) {
    return {
      id: `${peerId}-${data.ts}`,
      peerId,
      username: String(data.username).slice(0, 20),
      text: filterText(String(data.text).slice(0, 500)),
      timestamp: data.ts,
      isOwn: false,
      isLovelace: !!data.isLovelace,
    }
  }

  // Global room — joined once, history loaded from Nostr on mount
  useEffect(() => {
    let room
    try {
      room = joinRoom(APP_CONFIG, 'open-calc-global')
      const [send, receive] = room.makeAction('msg')
      sendGlobalRef.current = send

      receive((data, peerId) => {
        if (!data?.text || !data?.username) return
        const msg = makeIncomingMsg(data, peerId)
        setGlobalMessages(prev => mergeMessages(prev, [msg]))
        setUnreadCount(n => n + 1)
      })

      // Lovelace P2P channel — GPU announcements + query routing
      const [sendLv, receiveLv] = room.makeAction('lovelace')
      sendLovelaceChannelRef.current = sendLv

      receiveLv((data, peerId) => {
        if (data?.type === 'announce') {
          peerScoresRef.current.set(peerId, data.score ?? 0)
          reelectHost()
        } else if (data?.type === 'query') {
          // Only handle if we are the elected host
          setLovelaceHostId(prev => {
            if (prev === 'local') {
              setPendingLovelaceQueries(q => [
                ...q,
                { queryId: data.queryId, text: data.text, recentMessages: data.recentMessages ?? [], room: data.room ?? 'global' },
              ])
            }
            return prev
          })
        }
      })

      room.onPeerJoin(() => {
        setGlobalPeers(n => n + 1)
        // Announce our GPU score to the new peer
        sendLv({ type: 'announce', score: myGpuScoreRef.current })
      })
      room.onPeerLeave((peerId) => {
        setGlobalPeers(n => Math.max(0, n - 1))
        peerScoresRef.current.delete(peerId)
        reelectHost()
      })
      setConnected(true)
    } catch (e) {
      console.warn('[Chat] Global room failed:', e)
    }

    // Load 24h of history from Nostr relays
    if (nostrPool.current) {
      subscribeHistory(nostrPool.current, 'global', HISTORY_HOURS, (msg) => {
        setGlobalMessages(prev => mergeMessages(prev, [msg]))
      }, () => setGlobalHistoryLoaded(true))
    } else {
      setGlobalHistoryLoaded(true)
    }

    return () => { try { room?.leave() } catch {} }
  }, [])

  // Lesson room — rejoined + history reloaded when lesson changes
  useEffect(() => {
    const lessonId = lessonIdFromPath(location.pathname)
    setCurrentLessonId(lessonId)
    setLessonMessages([])
    setLessonPeers(0)
    setLessonHistoryLoaded(false)

    if (lessonRoomRef.current) {
      try { lessonRoomRef.current.leave() } catch {}
      lessonRoomRef.current = null
      sendLessonRef.current = null
    }

    if (!lessonId) { setLessonHistoryLoaded(true); return }

    let room
    try {
      room = joinRoom(APP_CONFIG, `open-calc-lesson-${lessonId}`)
      lessonRoomRef.current = room
      const [send, receive] = room.makeAction('msg')
      sendLessonRef.current = send

      receive((data, peerId) => {
        if (!data?.text || !data?.username) return
        const msg = makeIncomingMsg(data, peerId)
        setLessonMessages(prev => mergeMessages(prev, [msg]))
        setUnreadCount(n => n + 1)
      })

      room.onPeerJoin(() => setLessonPeers(n => n + 1))
      room.onPeerLeave(() => setLessonPeers(n => Math.max(0, n - 1)))
    } catch (e) {
      console.warn('[Chat] Lesson room failed:', e)
    }

    // Load lesson history from Nostr
    if (nostrPool.current) {
      subscribeHistory(nostrPool.current, `lesson-${lessonId}`, HISTORY_HOURS, (msg) => {
        setLessonMessages(prev => mergeMessages(prev, [msg]))
      }, () => setLessonHistoryLoaded(true))
    } else {
      setLessonHistoryLoaded(true)
    }

    return () => {
      try { room?.leave() } catch {}
      lessonRoomRef.current = null
      sendLessonRef.current = null
    }
  }, [location.pathname])

  const sendMessage = useCallback((text, roomType, isLovelace = false) => {
    const filtered = filterText(text.trim().slice(0, 500))
    if (!filtered) return
    const ts = Date.now()
    const uname = isLovelace ? 'Lovelace' : usernameRef.current
    const peerId = isLovelace ? 'lovelace-ai' : 'local'
    const payload = { text: filtered, username: uname, ts, isLovelace }
    const msg = { id: `${peerId}-${ts}`, peerId, username: uname, text: filtered, timestamp: ts, isOwn: !isLovelace, isLovelace }

    const roomId = roomType === 'global' ? 'global' : `lesson-${lessonIdFromPath(location.pathname) ?? 'unknown'}`

    if (roomType === 'global') {
      try { sendGlobalRef.current?.(payload) } catch {}
      setGlobalMessages(prev => mergeMessages(prev, [msg]))
    } else {
      try { sendLessonRef.current?.(payload) } catch {}
      setLessonMessages(prev => mergeMessages(prev, [msg]))
    }

    // Persist to Nostr in background
    if (keypair.current && nostrPool.current) {
      publishMessage(nostrPool.current, keypair.current.sk, roomId, {
        ...payload,
        peerId: keypair.current.pk.slice(0, 16),
      }).catch(() => {})
    }
  }, [location.pathname])

  const sendLovelaceResponse = useCallback((text, roomType) => {
    sendMessage(text, roomType, true)
  }, [sendMessage])

  // Route a Lovelace query to the elected host (or run locally if we are the host)
  const sendLovelaceQuery = useCallback((queryId, text, recentMessages, roomType) => {
    sendLovelaceChannelRef.current?.({
      type: 'query',
      queryId,
      text,
      recentMessages: recentMessages.slice(-6).map(m => ({ username: m.username, text: m.text, isLovelace: m.isLovelace })),
      room: roomType,
    })
  }, [])

  // Called by ChatPanel (host) once it has finished inference for a pending query
  const resolveLovelaceQuery = useCallback((queryId) => {
    setPendingLovelaceQueries(q => q.filter(p => p.queryId !== queryId))
  }, [])

  return (
    <ChatContext.Provider value={{
      username, setUsername,
      blockedPeers, blockedUsers, blockPeer, unblockPeer,
      globalMessages, lessonMessages,
      globalPeers, lessonPeers,
      currentLessonId, connected,
      sendMessage, sendLovelaceResponse,
      unreadCount, markAllRead,
      globalHistoryLoaded, lessonHistoryLoaded,
      isLovelaceHost: lovelaceHostId === 'local',
      lovelaceHostId,
      pendingLovelaceQueries,
      sendLovelaceQuery,
      resolveLovelaceQuery,
    }}>
      {children}
    </ChatContext.Provider>
  )
}

export function useChat() {
  return useContext(ChatContext)
}
