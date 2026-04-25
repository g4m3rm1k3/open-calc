import { useState, useRef, useEffect, useCallback } from 'react'
import { X, Send, Ban, Users, Globe, BookOpen } from 'lucide-react'
import { useChat } from '../../context/ChatContext.jsx'
import { motion, AnimatePresence } from 'framer-motion'

const PEER_COLORS = [
  'text-blue-500', 'text-emerald-500', 'text-violet-500',
  'text-rose-500', 'text-amber-500', 'text-cyan-500', 'text-pink-500',
]

function peerColor(id) {
  let h = 0
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) & 0xffff
  return PEER_COLORS[h % PEER_COLORS.length]
}

function formatTime(ts) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function ChatMessage({ msg, onBlock }) {
  const [hovered, setHovered] = useState(false)
  if (msg.isOwn) {
    return (
      <div className="flex flex-col items-end gap-0.5">
        <span className="text-[10px] text-slate-400 dark:text-slate-500 mr-1">{formatTime(msg.timestamp)}</span>
        <div className="max-w-[80%] bg-brand-600 text-white rounded-2xl rounded-tr-sm px-3 py-2 text-sm leading-relaxed">
          {msg.text}
        </div>
      </div>
    )
  }
  return (
    <div
      className="flex flex-col items-start gap-0.5 group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex items-center gap-2">
        <span className={`text-[10px] font-semibold ${peerColor(msg.peerId)}`}>{msg.username}</span>
        <span className="text-[10px] text-slate-400 dark:text-slate-500">{formatTime(msg.timestamp)}</span>
        {hovered && (
          <button
            onClick={() => onBlock(msg.peerId)}
            title="Block this user"
            className="text-slate-400 hover:text-red-500 transition-colors"
          >
            <Ban className="w-3 h-3" />
          </button>
        )}
      </div>
      <div className="max-w-[80%] bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-2xl rounded-tl-sm px-3 py-2 text-sm leading-relaxed">
        {msg.text}
      </div>
    </div>
  )
}

function MessageList({ messages, blockedPeers, onBlock }) {
  const bottomRef = useRef(null)
  const visible = messages.filter(m => !blockedPeers.has(m.peerId))

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [visible.length])

  if (visible.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-400 dark:text-slate-500 text-sm text-center px-4">
        No messages yet. Be the first to say hello!
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-3">
      {visible.map(msg => (
        <ChatMessage key={msg.id} msg={msg} onBlock={onBlock} />
      ))}
      <div ref={bottomRef} />
    </div>
  )
}

function ChatInput({ onSend, disabled }) {
  const [text, setText] = useState('')
  const inputRef = useRef(null)

  const submit = () => {
    const t = text.trim()
    if (!t || disabled) return
    onSend(t)
    setText('')
    inputRef.current?.focus()
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit() }
  }

  return (
    <div className="flex items-center gap-2 p-3 border-t border-slate-200 dark:border-slate-800">
      <input
        ref={inputRef}
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={handleKey}
        placeholder={disabled ? 'Connecting…' : 'Message…'}
        disabled={disabled}
        maxLength={500}
        className="flex-1 text-sm bg-slate-100 dark:bg-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:ring-2 focus:ring-brand-500/50 disabled:opacity-50"
      />
      <button
        onClick={submit}
        disabled={!text.trim() || disabled}
        className="p-2 rounded-xl bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <Send className="w-4 h-4" />
      </button>
    </div>
  )
}

export default function ChatPanel({ isOpen, onClose }) {
  const {
    username, setUsername,
    blockedPeers, blockPeer,
    globalMessages, lessonMessages,
    globalPeers, lessonPeers,
    currentLessonId, connected,
    sendMessage,
  } = useChat()

  const [tab, setTab] = useState('global')
  const [editingName, setEditingName] = useState(false)
  const [nameInput, setNameInput] = useState(username)
  const nameRef = useRef(null)

  // Switch to lesson tab automatically when entering a lesson
  useEffect(() => {
    if (currentLessonId && isOpen) setTab('lesson')
  }, [currentLessonId])

  useEffect(() => {
    if (editingName) nameRef.current?.focus()
  }, [editingName])

  const handleBlock = useCallback((peerId) => {
    blockPeer(peerId)
  }, [blockPeer])

  const handleSend = useCallback((text) => {
    sendMessage(text, tab)
  }, [sendMessage, tab])

  const saveName = () => {
    setUsername(nameInput)
    setEditingName(false)
  }

  const messages = tab === 'global' ? globalMessages : lessonMessages
  const peers = tab === 'global' ? globalPeers : lessonPeers

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          className="fixed right-0 top-[60px] bottom-0 w-[320px] z-[150] flex flex-col bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800 shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-base">💬</span>
              <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">Study Chat</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${connected ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                {connected ? 'live' : 'connecting…'}
              </span>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Username row */}
          <div className="flex items-center gap-2 px-4 py-2 border-b border-slate-100 dark:border-slate-800/60 shrink-0 bg-slate-50 dark:bg-slate-900/50">
            {editingName ? (
              <div className="flex items-center gap-2 flex-1">
                <input
                  ref={nameRef}
                  value={nameInput}
                  onChange={e => setNameInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') setEditingName(false) }}
                  maxLength={20}
                  className="flex-1 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-brand-500/50"
                />
                <button onClick={saveName} className="text-xs text-brand-600 dark:text-brand-400 font-semibold hover:underline">Save</button>
              </div>
            ) : (
              <button
                onClick={() => { setNameInput(username); setEditingName(true) }}
                className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
              >
                <span className="font-semibold text-slate-700 dark:text-slate-300">{username}</span>
                <span className="text-[10px] underline underline-offset-2">edit</span>
              </button>
            )}
            <div className="ml-auto flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500">
              <Users className="w-3 h-3" />
              <span>{peers + 1}</span>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-slate-200 dark:border-slate-800 shrink-0">
            <button
              onClick={() => setTab('global')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold transition-colors ${tab === 'global' ? 'text-brand-600 dark:text-brand-400 border-b-2 border-brand-600 dark:border-brand-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
              <Globe className="w-3.5 h-3.5" />
              Global
              {globalMessages.length > 0 && <span className="ml-0.5 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full px-1.5 text-[10px]">{globalMessages.filter(m => !blockedPeers.has(m.peerId)).length}</span>}
            </button>
            <button
              onClick={() => currentLessonId && setTab('lesson')}
              disabled={!currentLessonId}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold transition-colors ${!currentLessonId ? 'opacity-40 cursor-not-allowed text-slate-400' : tab === 'lesson' ? 'text-brand-600 dark:text-brand-400 border-b-2 border-brand-600 dark:border-brand-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              This Lesson
              {lessonMessages.length > 0 && <span className="ml-0.5 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full px-1.5 text-[10px]">{lessonMessages.filter(m => !blockedPeers.has(m.peerId)).length}</span>}
            </button>
          </div>

          {/* Room label */}
          {tab === 'lesson' && currentLessonId && (
            <div className="px-3 py-1.5 text-[10px] text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-900/30 border-b border-slate-100 dark:border-slate-800/60 shrink-0">
              Room: {currentLessonId}
            </div>
          )}

          {/* Messages */}
          <MessageList messages={messages} blockedPeers={blockedPeers} onBlock={handleBlock} />

          {/* Input */}
          <ChatInput onSend={handleSend} disabled={!connected} />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
