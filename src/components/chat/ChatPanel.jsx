import { useState, useRef, useEffect, useCallback } from 'react'
import { X, Send, Ban, Users, Globe, BookOpen, Settings, Trash2, Sparkles, Loader2 } from 'lucide-react'
import { useChat } from '../../context/ChatContext.jsx'
import { useLovelaceAI, isLovelaceMention, extractQuestion } from '../../hooks/useLovelaceAI.js'
import { motion, AnimatePresence } from 'framer-motion'

const PEER_COLORS = [
  'text-blue-500', 'text-emerald-500', 'text-rose-500',
  'text-amber-500', 'text-cyan-500', 'text-pink-500', 'text-orange-500',
]
function peerColor(id) {
  let h = 0
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) & 0xffff
  return PEER_COLORS[h % PEER_COLORS.length]
}
function formatTime(ts) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

// ── Block confirmation modal ──────────────────────────────────────────────────
function BlockConfirmModal({ target, onConfirm, onCancel }) {
  if (!target) return null
  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-6 max-w-xs w-full">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center">
            <Ban className="w-4 h-4 text-red-500" />
          </div>
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Block user?</h3>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-5">
          You won't see any messages from <span className="font-semibold text-slate-800 dark:text-slate-200">{target.username}</span>. You can unblock them anytime in Settings.
        </p>
        <div className="flex gap-2">
          <button onClick={onCancel} className="flex-1 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Cancel</button>
          <button onClick={onConfirm} className="flex-1 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors">Block</button>
        </div>
      </div>
    </div>
  )
}

// ── Blocked users settings panel ──────────────────────────────────────────────
function BlockedUsersPanel({ onClose }) {
  const { blockedUsers, unblockPeer } = useChat()
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-200 dark:border-slate-800 shrink-0">
        <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <X className="w-4 h-4" />
        </button>
        <span className="text-sm font-bold text-slate-800 dark:text-slate-100">Blocked Users</span>
        <span className="ml-1 text-xs text-slate-400">({blockedUsers.length})</span>
      </div>
      {blockedUsers.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-slate-400 dark:text-slate-500 text-sm text-center px-6">
          No blocked users. Hover a message and click the block icon to block someone.
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-2">
          {blockedUsers.map(({ peerId, username }) => (
            <div key={peerId} className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Ban className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{username}</span>
              </div>
              <button onClick={() => unblockPeer(peerId)} className="text-xs text-brand-600 dark:text-brand-400 font-semibold hover:underline flex items-center gap-1">
                <Trash2 className="w-3 h-3" />Unblock
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Individual message ─────────────────────────────────────────────────────────
function ChatMessage({ msg, onBlockRequest }) {
  const [hovered, setHovered] = useState(false)

  if (msg.isLovelace) {
    return (
      <motion.div 
        initial={{ opacity: 0, x: -10 }} 
        animate={{ opacity: 1, x: 0 }}
        className="flex flex-col items-start gap-1 mb-3"
      >
        <div className="flex items-center gap-2 ml-1">
          {/* Luminous AI Spark Avatar */}
          <div className="relative w-6 h-6 flex items-center justify-center">
            <div className="absolute inset-0 bg-indigo-500 rounded-full animate-pulse blur-[4px] opacity-60" />
            <div className="relative w-5 h-5 rounded-full bg-gradient-to-tr from-indigo-600 via-purple-500 to-indigo-400 flex items-center justify-center shadow-lg border border-white/20">
               <Sparkles className="w-3 h-3 text-white animate-spin-slow" />
            </div>
          </div>
          <span className="text-[11px] font-black text-indigo-700 dark:text-indigo-400 tracking-[0.2em] uppercase">LOVELACE</span>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">{formatTime(msg.timestamp)}</span>
        </div>
        <div className="max-w-[95%] bg-white/80 dark:bg-indigo-950/40 border border-indigo-400/30 dark:border-indigo-400/20 text-indigo-950 dark:text-indigo-50 rounded-2xl rounded-tl-[4px] px-4 py-3 text-[14px] leading-relaxed shadow-[0_8px_30px_rgba(79,70,229,0.08)] dark:shadow-[0_0_40px_rgba(79,70,229,0.1)]">
          {msg.text}
        </div>
      </motion.div>
    )
  }

  if (msg.isOwn) {
    return (
      <motion.div 
        initial={{ opacity: 0, x: 10 }} 
        animate={{ opacity: 1, x: 0 }}
        className="flex flex-col items-end gap-1 mb-2"
      >
        <div className="flex items-center gap-1.5 mr-1">
           <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">{formatTime(msg.timestamp)}</span>
           <span className="text-[11px] font-black text-brand-600 dark:text-brand-400 tracking-wider uppercase">Me</span>
        </div>
        <div className="max-w-[85%] bg-brand-600 dark:bg-brand-500 shadow-[0_4px_15px_rgba(79,70,229,0.3)] text-white rounded-2xl rounded-tr-[4px] px-4 py-2.5 text-[13.5px] leading-relaxed">
          {msg.text}
        </div>
      </motion.div>
    )
  }

  return (
    <div className="flex flex-col items-start gap-0.5" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <div className="flex items-center gap-2">
        <span className={`text-[10px] font-semibold ${peerColor(msg.peerId)}`}>{msg.username}</span>
        <span className="text-[10px] text-slate-400 dark:text-slate-500">{formatTime(msg.timestamp)}</span>
        {hovered && (
          <button onClick={() => onBlockRequest({ peerId: msg.peerId, username: msg.username })} title="Block user" className="text-slate-400 hover:text-red-500 transition-colors">
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

// ── Message list ───────────────────────────────────────────────────────────────
function MessageList({ messages, blockedPeers, historyLoaded, onBlockRequest, lovelaceStatus }) {
  const bottomRef = useRef(null)
  const visible = messages.filter(m => m.isLovelace || !blockedPeers.has(m.peerId))

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [visible.length, lovelaceStatus])

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4">
      {!historyLoaded && (
        <div className="flex items-center gap-2 text-[11px] text-slate-400 dark:text-slate-500 justify-center py-4 bg-slate-50/50 dark:bg-black/20 rounded-2xl border border-slate-100 dark:border-white/5">
          <Loader2 className="w-3 h-3 animate-spin" />
          <span className="font-bold uppercase tracking-widest">Accessing Archive</span>
        </div>
      )}
      {historyLoaded && visible.length === 0 && !lovelaceStatus && (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 text-sm text-center px-4 py-20 bg-indigo-50/20 dark:bg-black/20 rounded-3xl border border-dashed border-indigo-100 dark:border-white/5">
          <Sparkles className="w-8 h-8 text-indigo-300 dark:text-indigo-900 mb-4 animate-pulse" />
          <p className="max-w-[180px] leading-relaxed">
            Linked to <span className="text-indigo-500 font-black">LOVELACE</span>.<br /> Ask a question to begin analysis.
          </p>
        </div>
      )}
      {visible.map(msg => (
        <ChatMessage key={msg.id} msg={msg} onBlockRequest={onBlockRequest} />
      ))}
      {lovelaceStatus && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-3 bg-indigo-500/10 dark:bg-indigo-400/10 border border-indigo-500/20 rounded-2xl shadow-[0_0_20px_rgba(79,70,229,0.1)] shrink-0"
        >
          <div className="w-8 h-8 rounded-full bg-indigo-500 shadow-[0_0_15px_rgba(79,70,229,0.5)] flex items-center justify-center shrink-0">
             <div className="w-full h-full rounded-full animate-ping absolute bg-indigo-400 opacity-20" />
             <Sparkles className="w-4 h-4 text-white animate-spin-slow" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-300 uppercase tracking-widest leading-none mb-1">Analytical Sync</span>
            <span className="text-xs text-indigo-950 dark:text-indigo-100 font-semibold italic">{lovelaceStatus}</span>
          </div>
        </motion.div>
      )}
      <div ref={bottomRef} />
    </div>
  )
}

// ── Chat input ─────────────────────────────────────────────────────────────────
function ChatInput({ onSend, disabled }) {
  const [text, setText] = useState('')
  const inputRef = useRef(null)
  const hasLovelace = isLovelaceMention(text)

  const submit = () => {
    const t = text.trim()
    if (!t || disabled) return
    onSend(t)
    setText('')
    inputRef.current?.focus()
  }

  return (
    <div className="flex flex-col gap-2 p-4 pt-1 bg-white/20 dark:bg-black/20 border-t border-white/10 shrink-0">
      {hasLovelace && (
        <div className="flex items-center gap-2 text-[10px] text-indigo-600 dark:text-indigo-400 px-2 py-1 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-lg border border-indigo-200/30 dark:border-indigo-400/10">
          <Sparkles className="w-3 h-3 animate-pulse" />
          <span className="font-bold uppercase tracking-wider">AI TUTOR MODE</span>
        </div>
      )}
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit() } }}
          placeholder={disabled ? 'Synchronizing…' : 'Message @Lovelace…'}
          disabled={disabled}
          maxLength={500}
          className="flex-1 text-[13.5px] font-semibold bg-white/80 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all shadow-inner"
        />
        <button
          onClick={submit}
          disabled={!text.trim() || disabled}
          className={`p-3 rounded-2xl text-white shadow-lg transition-all duration-300 ${hasLovelace ? 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/20' : 'bg-brand-600 hover:bg-brand-500 shadow-brand-500/20'} hover:scale-105 active:scale-95`}
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}

// ── Main panel ────────────────────────────────────────────────────────────────
export default function ChatPanel({ isOpen, onClose }) {
  const {
    username, setUsername,
    blockedPeers, blockedUsers,
    blockPeer,
    globalMessages, lessonMessages,
    globalPeers, lessonPeers,
    currentLessonId, connected,
    sendMessage, sendLovelaceResponse,
    markAllRead,
    globalHistoryLoaded, lessonHistoryLoaded,
  } = useChat()

  const { ask, isThinking, isDownloading, downloadProgress } = useLovelaceAI()

  useEffect(() => { if (isOpen) markAllRead() }, [isOpen])

  const [tab, setTab] = useState('global')
  const [editingName, setEditingName] = useState(false)
  const [nameInput, setNameInput] = useState(username)
  const [showSettings, setShowSettings] = useState(false)
  const [blockTarget, setBlockTarget] = useState(null)
  const nameRef = useRef(null)

  useEffect(() => { if (currentLessonId && isOpen) setTab('lesson') }, [currentLessonId])
  useEffect(() => { if (editingName) nameRef.current?.focus() }, [editingName])

  const lovelaceStatus = isDownloading
    ? downloadProgress || 'Downloading Lovelace…'
    : isThinking ? 'Lovelace is thinking…' : null

  const handleSend = useCallback(async (text) => {
    sendMessage(text, tab)

    if (isLovelaceMention(text)) {
      const question = extractQuestion(text) || text
      const recentMsgs = tab === 'global' ? globalMessages : lessonMessages
      try {
        const answer = await ask(question, recentMsgs)
        if (answer) sendLovelaceResponse(answer, tab)
      } catch (err) {
        console.error('[Lovelace] ask failed:', err)
        sendLovelaceResponse("Sorry, I ran into an error. Make sure your browser supports WebGPU (Chrome 113+).", tab)
      }
    }
  }, [sendMessage, sendLovelaceResponse, ask, tab, globalMessages, lessonMessages])

  const saveName = () => { setUsername(nameInput); setEditingName(false) }

  const messages = tab === 'global' ? globalMessages : lessonMessages
  const historyLoaded = tab === 'global' ? globalHistoryLoaded : lessonHistoryLoaded
  const peers = tab === 'global' ? globalPeers : lessonPeers

  return (
    <>
      <BlockConfirmModal
        target={blockTarget}
        onConfirm={() => { blockPeer(blockTarget.peerId, blockTarget.username); setBlockTarget(null) }}
        onCancel={() => setBlockTarget(null)}
      />
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 400 }}
            className="fixed right-0 top-[90px] bottom-0 w-[400px] z-[9999] flex flex-col bg-white/80 dark:bg-slate-950/80 backdrop-blur-3xl border-l border-white/20 dark:border-white/10 shadow-[-10px_0_40px_rgba(0,0,0,0.05)] dark:shadow-[-20px_0_100px_rgba(0,0,0,0.4)]"
          >
            {/* Header - Holographic Prism */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 shrink-0">
               <div className="flex items-center gap-4">
                 <div className="relative flex items-center justify-center">
                   <div className="w-3.5 h-3.5 rounded-full bg-indigo-500 shadow-[0_0_15px_rgba(79,70,229,0.9)] animate-pulse" />
                   <div className="absolute inset-0 bg-indigo-400/20 blur-md rounded-full animate-ping" />
                 </div>
                 <div className="flex flex-col">
                   <span className="font-black text-slate-900 dark:text-white text-[12px] uppercase tracking-[0.3em] leading-none mb-1">Study Chat</span>
                   <span className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 tracking-[0.1em] uppercase opacity-80">Peer Discovery Enabled</span>
                 </div>
               </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setShowSettings(v => !v)}
                  title="Blocked users"
                  className={`relative p-1.5 rounded-lg transition-colors ${showSettings ? 'text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/40' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                >
                  <Settings className="w-4 h-4" />
                  {blockedUsers.length > 0 && <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full" />}
                </button>
                <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {showSettings ? <BlockedUsersPanel onClose={() => setShowSettings(false)} /> : (
              <>
                {/* Username row */}
                <div className="flex items-center gap-2 px-4 py-2 border-b border-slate-100 dark:border-slate-800/60 shrink-0 bg-slate-50 dark:bg-slate-900/50">
                  {editingName ? (
                    <div className="flex items-center gap-2 flex-1">
                      <input ref={nameRef} value={nameInput} onChange={e => setNameInput(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') setEditingName(false) }}
                        maxLength={20}
                        className="flex-1 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-brand-500/50" />
                      <button onClick={saveName} className="text-xs text-brand-600 dark:text-brand-400 font-semibold hover:underline">Save</button>
                    </div>
                  ) : (
                    <button onClick={() => { setNameInput(username); setEditingName(true) }}
                      className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{username}</span>
                      <span className="text-[10px] underline underline-offset-2">edit</span>
                    </button>
                  )}
                  <div className="ml-auto flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500">
                    <Users className="w-3 h-3" /><span>{peers + 1}</span>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-200 dark:border-slate-800 shrink-0">
                  {[
                    { id: 'global', label: 'Global', icon: <Globe className="w-3.5 h-3.5" />, count: globalMessages.filter(m => m.isLovelace || !blockedPeers.has(m.peerId)).length, disabled: false },
                    { id: 'lesson', label: 'This Lesson', icon: <BookOpen className="w-3.5 h-3.5" />, count: lessonMessages.filter(m => m.isLovelace || !blockedPeers.has(m.peerId)).length, disabled: !currentLessonId },
                  ].map(({ id, label, icon, count, disabled }) => (
                    <button key={id} onClick={() => !disabled && setTab(id)} disabled={disabled}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold transition-colors ${disabled ? 'opacity-40 cursor-not-allowed text-slate-400' : tab === id ? 'text-brand-600 dark:text-brand-400 border-b-2 border-brand-600 dark:border-brand-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}>
                      {icon}{label}
                      {count > 0 && <span className="ml-0.5 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full px-1.5 text-[10px]">{count}</span>}
                    </button>
                  ))}
                </div>

                {/* Lovelace hint */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-50 dark:bg-violet-950/30 border-b border-violet-100 dark:border-violet-900/40 shrink-0">
                  <Sparkles className="w-3 h-3 text-violet-500 shrink-0" />
                  <span className="text-[10px] text-violet-600 dark:text-violet-400">Tag <span className="font-bold">@Lovelace</span>, <span className="font-bold">@Love</span>, or <span className="font-bold">@Lovely</span> to ask the AI tutor</span>
                </div>

                <MessageList
                  messages={messages}
                  blockedPeers={blockedPeers}
                  historyLoaded={historyLoaded}
                  onBlockRequest={setBlockTarget}
                  lovelaceStatus={lovelaceStatus}
                />
                <ChatInput onSend={handleSend} disabled={!connected} />
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
