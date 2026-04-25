import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react'
import { joinRoom } from '@trystero-p2p/nostr'
import { useLocation } from 'react-router-dom'
import { LESSON_MAP } from '../content/index.js'

const ChatContext = createContext(null)

const APP_CONFIG = { appId: 'open-calc-v1' }
const MAX_MESSAGES = 150

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

export function ChatProvider({ children }) {
  const location = useLocation()
  const [username, setUsernameState] = useState(
    () => localStorage.getItem('oc-chat-username') || makeUsername()
  )
  const [blockedPeers, setBlockedPeers] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem('oc-blocked-peers') || '[]')) }
    catch { return new Set() }
  })
  const [globalMessages, setGlobalMessages] = useState([])
  const [lessonMessages, setLessonMessages] = useState([])
  const [globalPeers, setGlobalPeers] = useState(0)
  const [lessonPeers, setLessonPeers] = useState(0)
  const [currentLessonId, setCurrentLessonId] = useState(null)
  const [connected, setConnected] = useState(false)

  const sendGlobalRef = useRef(null)
  const sendLessonRef = useRef(null)
  const lessonRoomRef = useRef(null)
  const usernameRef = useRef(username)
  usernameRef.current = username

  const setUsername = useCallback((name) => {
    const clean = name.trim().slice(0, 20)
    if (!clean) return
    localStorage.setItem('oc-chat-username', clean)
    setUsernameState(clean)
  }, [])

  const blockPeer = useCallback((peerId) => {
    setBlockedPeers(prev => {
      const next = new Set(prev)
      next.add(peerId)
      localStorage.setItem('oc-blocked-peers', JSON.stringify([...next]))
      return next
    })
  }, [])

  const unblockPeer = useCallback((peerId) => {
    setBlockedPeers(prev => {
      const next = new Set(prev)
      next.delete(peerId)
      localStorage.setItem('oc-blocked-peers', JSON.stringify([...next]))
      return next
    })
  }, [])

  // Global room — joined once for the lifetime of the app
  useEffect(() => {
    let room
    try {
      room = joinRoom(APP_CONFIG, 'open-calc-global')
      const [send, receive] = room.makeAction('msg')
      sendGlobalRef.current = send

      receive((data, peerId) => {
        if (!data?.text || !data?.username) return
        const msg = {
          id: `${peerId}-${data.ts}`,
          peerId,
          username: String(data.username).slice(0, 20),
          text: filterText(String(data.text).slice(0, 500)),
          timestamp: data.ts,
          isOwn: false,
        }
        setGlobalMessages(prev => [...prev.slice(-(MAX_MESSAGES - 1)), msg])
      })

      room.onPeerJoin(() => setGlobalPeers(n => n + 1))
      room.onPeerLeave(() => setGlobalPeers(n => Math.max(0, n - 1)))
      setConnected(true)
    } catch (e) {
      console.warn('[Chat] Global room failed:', e)
    }
    return () => { try { room?.leave() } catch {} }
  }, [])

  // Lesson room — rejoined whenever the lesson changes
  useEffect(() => {
    const lessonId = lessonIdFromPath(location.pathname)
    setCurrentLessonId(lessonId)
    setLessonMessages([])
    setLessonPeers(0)

    if (lessonRoomRef.current) {
      try { lessonRoomRef.current.leave() } catch {}
      lessonRoomRef.current = null
      sendLessonRef.current = null
    }

    if (!lessonId) return

    let room
    try {
      room = joinRoom(APP_CONFIG, `open-calc-lesson-${lessonId}`)
      lessonRoomRef.current = room
      const [send, receive] = room.makeAction('msg')
      sendLessonRef.current = send

      receive((data, peerId) => {
        if (!data?.text || !data?.username) return
        const msg = {
          id: `${peerId}-${data.ts}`,
          peerId,
          username: String(data.username).slice(0, 20),
          text: filterText(String(data.text).slice(0, 500)),
          timestamp: data.ts,
          isOwn: false,
        }
        setLessonMessages(prev => [...prev.slice(-(MAX_MESSAGES - 1)), msg])
      })

      room.onPeerJoin(() => setLessonPeers(n => n + 1))
      room.onPeerLeave(() => setLessonPeers(n => Math.max(0, n - 1)))
    } catch (e) {
      console.warn('[Chat] Lesson room failed:', e)
    }

    return () => {
      try { room?.leave() } catch {}
      lessonRoomRef.current = null
      sendLessonRef.current = null
    }
  }, [location.pathname])

  const sendMessage = useCallback((text, roomType) => {
    const filtered = filterText(text.trim().slice(0, 500))
    if (!filtered) return
    const ts = Date.now()
    const uname = usernameRef.current
    const msg = { id: `local-${ts}`, peerId: 'local', username: uname, text: filtered, timestamp: ts, isOwn: true }

    if (roomType === 'global') {
      try { sendGlobalRef.current?.({ text: filtered, username: uname, ts }) } catch {}
      setGlobalMessages(prev => [...prev.slice(-(MAX_MESSAGES - 1)), msg])
    } else {
      try { sendLessonRef.current?.({ text: filtered, username: uname, ts }) } catch {}
      setLessonMessages(prev => [...prev.slice(-(MAX_MESSAGES - 1)), msg])
    }
  }, [])

  return (
    <ChatContext.Provider value={{
      username, setUsername,
      blockedPeers, blockPeer, unblockPeer,
      globalMessages, lessonMessages,
      globalPeers, lessonPeers,
      currentLessonId, connected,
      sendMessage,
    }}>
      {children}
    </ChatContext.Provider>
  )
}

export function useChat() {
  return useContext(ChatContext)
}
