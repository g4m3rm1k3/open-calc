import { useState, useRef, useEffect, useCallback } from "react";
import {
  X,
  Send,
  Ban,
  Users,
  BookOpen,
  Settings,
  Trash2,
  Sparkles,
  Loader2,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  AtSign,
} from "lucide-react";
import { useChat } from "../../hooks/useChat.js";
import {
  useLovelaceAI,
  isLovelaceMention,
  extractQuestion,
} from "../../hooks/useLovelaceAI.js";
import { motion, AnimatePresence, useDragControls } from "framer-motion";

const PEER_COLORS = [
  "text-blue-500",
  "text-emerald-500",
  "text-rose-500",
  "text-amber-500",
  "text-cyan-500",
  "text-pink-500",
  "text-orange-500",
];
function peerColor(id) {
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) & 0xffff;
  return PEER_COLORS[h % PEER_COLORS.length];
}
function formatTime(ts) {
  return new Date(ts).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ── Mention notification toast ────────────────────────────────────────────────
// Shown when another user @mentions us — even if the chat panel is closed.
function MentionModal() {
  const [notification, setNotification] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      setNotification(e.detail);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setNotification(null), 8000);
    };
    window.addEventListener("oc-mention", handler);
    return () => {
      window.removeEventListener("oc-mention", handler);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <AnimatePresence>
      {notification && (
        <motion.div
          key="mention-toast"
          initial={{ opacity: 0, y: -16, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ type: "spring", damping: 24, stiffness: 380 }}
          className="fixed top-14 right-4 z-[9999] w-80"
        >
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-indigo-500/25 dark:border-indigo-400/20 p-4 flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-500 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/30">
              <AtSign className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
                  You were mentioned
                </span>
                <button
                  onClick={() => setNotification(null)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-snug">
                <span className="text-indigo-500 dark:text-indigo-400">{notification.from}</span>
                {" "}mentioned you
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                {notification.text}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Online users panel ────────────────────────────────────────────────────────
const AVATAR_COLORS = [
  "bg-violet-500", "bg-blue-500", "bg-emerald-500",
  "bg-rose-500", "bg-amber-500", "bg-cyan-500", "bg-pink-500", "bg-orange-500",
];
function avatarColor(name = "?") {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) & 0xffff;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

function UsersPanel({ peers, username, onMention }) {
  const all = [
    { peerId: "local", username, lessonId: null, lessonTitle: null, isMe: true },
    ...peers,
  ];
  return (
    <div className="border-b border-slate-200 dark:border-slate-800 shrink-0">
      <div className="px-3 py-2 flex flex-col gap-1 max-h-[180px] overflow-y-auto">
        {all.map((peer) => (
          <div
            key={peer.peerId}
            className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors group"
          >
            <div
              className={`w-6 h-6 rounded-full ${avatarColor(peer.username)} flex items-center justify-center shrink-0 text-[10px] font-black text-white shadow-sm`}
            >
              {(peer.username || "?")[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate leading-none">
                {peer.isMe ? `${peer.username} (you)` : peer.username}
              </p>
              {peer.lessonTitle ? (
                <div className="flex items-center gap-1 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                    {peer.lessonTitle}
                  </span>
                </div>
              ) : (
                <p className="text-[10px] text-slate-400 dark:text-slate-600 mt-0.5">Browsing</p>
              )}
            </div>
            {!peer.isMe && (
              <button
                onClick={() => onMention(peer.username)}
                title={`Mention ${peer.username}`}
                className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-[10px] font-bold text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 px-1.5 py-0.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/50 shrink-0"
              >
                <AtSign className="w-2.5 h-2.5" />
                mention
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Block confirmation modal ──────────────────────────────────────────────────
function BlockConfirmModal({ target, onConfirm, onCancel }) {
  if (!target) return null;
  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-6 max-w-xs w-full">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center">
            <Ban className="w-4 h-4 text-red-500" />
          </div>
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
            Block user?
          </h3>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-5">
          You won't see any messages from{" "}
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            {target.username}
          </span>
          . You can unblock them anytime in Settings.
        </p>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors"
          >
            Block
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Blocked users settings panel ──────────────────────────────────────────────
function BlockedUsersPanel({ onClose }) {
  const { blockedUsers, unblockPeer } = useChat();
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-200 dark:border-slate-800 shrink-0">
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
        <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
          Blocked Users
        </span>
        <span className="ml-1 text-xs text-slate-400">
          ({blockedUsers.length})
        </span>
      </div>
      {blockedUsers.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-slate-400 dark:text-slate-500 text-sm text-center px-6">
          No blocked users. Hover a message and click the block icon to block
          someone.
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-2">
          {blockedUsers.map(({ peerId, username }) => (
            <div
              key={peerId}
              className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
            >
              <div className="flex items-center gap-2">
                <Ban className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {username}
                </span>
              </div>
              <button
                onClick={() => unblockPeer(peerId)}
                className="text-xs text-brand-600 dark:text-brand-400 font-semibold hover:underline flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                Unblock
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Active lessons section ────────────────────────────────────────────────────
function ActiveLessonsPanel({ activeLessons }) {
  const [expanded, setExpanded] = useState(true);
  if (!activeLessons || activeLessons.size === 0) return null;

  return (
    <div className="border-b border-slate-200 dark:border-slate-800 shrink-0">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-2 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors"
      >
        <div className="flex items-center gap-1.5">
          <BookOpen className="w-3 h-3 text-emerald-500" />
          <span className="text-emerald-600 dark:text-emerald-400">
            {activeLessons.size} Active Lesson{activeLessons.size !== 1 ? "s" : ""}
          </span>
        </div>
        {expanded ? (
          <ChevronUp className="w-3 h-3" />
        ) : (
          <ChevronDown className="w-3 h-3" />
        )}
      </button>
      {expanded && (
        <div className="px-3 pb-2 flex flex-col gap-1 max-h-[4.5rem] overflow-y-auto">
          {[...activeLessons.entries()].map(([lessonId, { title, users }]) => (
            <div
              key={lessonId}
              className="flex items-start gap-2 px-2 py-1.5 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 truncate">
                  {title}
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                  {users.join(", ")}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Individual message ─────────────────────────────────────────────────────────
function ChatMessage({ msg, onBlockRequest }) {
  const [hovered, setHovered] = useState(false);

  if (msg.isLovelace) {
    return (
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex flex-col items-start gap-1 mb-3"
      >
        <div className="flex items-center gap-2 ml-1">
          <div className="relative w-6 h-6 flex items-center justify-center">
            <div className="absolute inset-0 bg-indigo-500 rounded-full animate-pulse blur-[4px] opacity-60" />
            <div className="relative w-5 h-5 rounded-full bg-gradient-to-tr from-indigo-600 via-purple-500 to-indigo-400 flex items-center justify-center shadow-lg border border-white/20">
              <Sparkles className="w-3 h-3 text-white animate-spin-slow" />
            </div>
          </div>
          <span className="text-[11px] font-black text-indigo-700 dark:text-indigo-400 tracking-[0.2em] uppercase">
            LOVELACE
          </span>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">
            {formatTime(msg.timestamp)}
          </span>
        </div>
        <div className="max-w-[95%] bg-white/80 dark:bg-indigo-950/40 border border-indigo-400/30 dark:border-indigo-400/20 text-indigo-950 dark:text-indigo-50 rounded-2xl rounded-tl-[4px] px-4 py-3 text-[14px] leading-relaxed shadow-[0_8px_30px_rgba(79,70,229,0.08)] dark:shadow-[0_0_40px_rgba(79,70,229,0.1)]">
          {msg.text}
        </div>
      </motion.div>
    );
  }

  if (msg.isOwn) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex flex-col items-end gap-1 mb-2"
      >
        <div className="flex items-center gap-1.5 mr-1">
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
            {formatTime(msg.timestamp)}
          </span>
          <span className="text-[11px] font-black text-brand-600 dark:text-brand-400 tracking-wider uppercase">
            Me
          </span>
        </div>
        <div className="max-w-[85%] bg-gradient-to-br from-indigo-500 to-purple-600 shadow-[0_4px_20px_rgba(99,102,241,0.3)] text-white rounded-2xl rounded-tr-[4px] px-4 py-2.5 text-[13.5px] leading-relaxed border border-white/10">
          {msg.text}
        </div>
      </motion.div>
    );
  }

  return (
    <div
      className="flex flex-col items-start gap-0.5"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex items-center gap-2">
        <span className={`text-[10px] font-semibold ${peerColor(msg.peerId)}`}>
          {msg.username}
        </span>
        <span className="text-[10px] text-slate-400 dark:text-slate-500">
          {formatTime(msg.timestamp)}
        </span>
        {hovered && (
          <button
            onClick={() =>
              onBlockRequest({ peerId: msg.peerId, username: msg.username })
            }
            title="Block user"
            className="text-slate-400 hover:text-red-500 transition-colors"
          >
            <Ban className="w-3 h-3" />
          </button>
        )}
      </div>
      <div className="max-w-[80%] bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 rounded-2xl rounded-tl-sm px-4 py-2.5 text-[13.5px] leading-relaxed border border-slate-200/60 dark:border-slate-700/50 shadow-sm backdrop-blur-sm">
        {msg.text}
      </div>
    </div>
  );
}

// ── Message list ───────────────────────────────────────────────────────────────
function MessageList({
  messages,
  blockedPeers,
  historyLoaded,
  onBlockRequest,
  lovelaceStatus,
}) {
  const bottomRef = useRef(null);
  const visible = messages.filter(
    (m) => m.isLovelace || !blockedPeers.has(m.peerId),
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [visible.length, lovelaceStatus]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4">
      {!historyLoaded && (
        <div className="flex items-center gap-2 text-[11px] text-slate-400 dark:text-slate-500 justify-center py-4 bg-slate-50/50 dark:bg-black/20 rounded-2xl border border-slate-100 dark:border-white/5">
          <Loader2 className="w-3 h-3 animate-spin" />
          <span className="font-bold uppercase tracking-widest">
            Accessing Archive
          </span>
        </div>
      )}
      {historyLoaded && visible.length === 0 && !lovelaceStatus && (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 text-sm text-center px-4 py-20 bg-indigo-50/20 dark:bg-black/20 rounded-3xl border border-dashed border-indigo-100 dark:border-white/5">
          <Sparkles className="w-8 h-8 text-indigo-300 dark:text-indigo-900 mb-4 animate-pulse" />
          <p className="max-w-[180px] leading-relaxed">
            Linked to{" "}
            <span className="text-indigo-500 font-black">LOVELACE</span>.<br />{" "}
            Ask a question to begin analysis.
          </p>
        </div>
      )}
      {visible.map((msg) => (
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
            <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-300 uppercase tracking-widest leading-none mb-1">
              Analytical Sync
            </span>
            <span className="text-xs text-indigo-950 dark:text-indigo-100 font-semibold italic">
              {lovelaceStatus}
            </span>
          </div>
        </motion.div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}

// ── Chat input ─────────────────────────────────────────────────────────────────
function ChatInput({ onSend, disabled, lovelaceActive, peers }) {
  const [text, setText] = useState("");
  const inputRef = useRef(null);
  const hasLovelace = isLovelaceMention(text);
  const isAiMode = hasLovelace || lovelaceActive;

  // @mention autocomplete: detect "@partial" at end of current text
  const atMatch = text.match(/@(\w*)$/);
  const atPartial = atMatch ? atMatch[1].toLowerCase() : null;
  const suggestions =
    atPartial !== null && peers.length > 0
      ? peers
          .filter((p) => p.username.toLowerCase().startsWith(atPartial))
          .slice(0, 5)
      : [];

  const handleSelectSuggestion = (uname) => {
    setText((prev) => prev.replace(/@\w*$/, `@${uname} `));
    inputRef.current?.focus();
  };

  // Listen for external mention inserts (from the UsersPanel @mention button)
  useEffect(() => {
    const handler = (e) => {
      setText((prev) => `${prev.trimEnd()} @${e.detail} `.trimStart());
      inputRef.current?.focus();
    };
    window.addEventListener("oc-insert-mention", handler);
    return () => window.removeEventListener("oc-insert-mention", handler);
  }, []);

  const submit = () => {
    const t = text.trim();
    if (!t || disabled) return;
    onSend(t);
    setText("");
    inputRef.current?.focus();
  };

  return (
    <div className="relative flex flex-col gap-2 p-4 pt-3 bg-gradient-to-t from-white/80 to-white/40 dark:from-[#1c1c1e]/90 dark:to-[#1c1c1e]/50 backdrop-blur-xl border-t border-indigo-500/10 dark:border-indigo-500/20 shrink-0">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-500/20 dark:via-indigo-400/20 to-transparent" />

      {/* @mention autocomplete dropdown */}
      {suggestions.length > 0 && (
        <div className="absolute bottom-full left-4 right-4 mb-1.5 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200/80 dark:border-slate-700/80 overflow-hidden z-20">
          <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-800">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Mention a user</span>
          </div>
          {suggestions.map((peer) => (
            <button
              key={peer.peerId}
              onMouseDown={(e) => { e.preventDefault(); handleSelectSuggestion(peer.username); }}
              className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors text-left"
            >
              <div className={`w-5 h-5 rounded-full ${avatarColor(peer.username)} flex items-center justify-center shrink-0 text-[9px] font-black text-white`}>
                {peer.username[0].toUpperCase()}
              </div>
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">@{peer.username}</span>
              {peer.lessonTitle && (
                <span className="text-xs text-slate-400 dark:text-slate-500 truncate ml-auto">{peer.lessonTitle}</span>
              )}
            </button>
          ))}
        </div>
      )}

      {isAiMode && (
        <div className="flex items-center gap-2 text-[10px] text-indigo-600 dark:text-indigo-400 px-2 py-1 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-lg border border-indigo-200/30 dark:border-indigo-400/10">
          <Sparkles className="w-3 h-3 animate-pulse" />
          <span className="font-bold uppercase tracking-wider">
            AI TUTOR MODE
          </span>
        </div>
      )}
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape" && suggestions.length > 0) {
              setText((prev) => prev.replace(/@\w*$/, ""));
              return;
            }
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              if (suggestions.length > 0) {
                handleSelectSuggestion(suggestions[0].username);
              } else {
                submit();
              }
            }
          }}
          placeholder={
            disabled
              ? "Synchronizing…"
              : lovelaceActive
                ? "Reply to Lovelace…"
                : "Message or @username…"
          }
          disabled={disabled}
          maxLength={500}
          className="flex-1 text-[13.5px] font-medium bg-white/60 dark:bg-slate-900/60 border border-slate-200/60 dark:border-white/10 rounded-2xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all shadow-inner backdrop-blur-sm"
        />
        <button
          onClick={submit}
          disabled={!text.trim() || disabled}
          className={`p-3 rounded-2xl text-white shadow-lg transition-all duration-300 ${isAiMode ? "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/20" : "bg-brand-600 hover:bg-brand-500 shadow-brand-500/20"} hover:scale-105 active:scale-95`}
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

const CHAT_WIDTH_KEY = 'oc-chat-width'
const MIN_W = 280
const MAX_W = 780
const DEFAULT_W = 380

// ── Main panel ────────────────────────────────────────────────────────────────
export default function ChatPanel({ isOpen, onClose }) {
  const {
    username,
    setUsername,
    blockedPeers,
    blockedUsers,
    blockPeer,
    globalMessages,
    globalPeers,
    peers,
    currentLessonId,
    currentLessonTitle,
    activeLessons,
    connected,
    sendMessage,
    sendLovelaceResponse,
    markAllRead,
    globalHistoryLoaded,
    isLovelaceHost,
    pendingLovelaceQueries,
    sendLovelaceQuery,
    resolveLovelaceQuery,
    reconnect,
  } = useChat();

  const [width, setWidth] = useState(() => {
    const saved = parseInt(localStorage.getItem(CHAT_WIDTH_KEY), 10)
    return saved && saved >= MIN_W && saved <= MAX_W ? saved : DEFAULT_W
  })

  // Keep CSS variable in sync so AppShell can use it for content padding
  useEffect(() => {
    document.documentElement.style.setProperty('--chat-width', `${width}px`)
    localStorage.setItem(CHAT_WIDTH_KEY, String(width))
  }, [width])

  const onResizeMouseDown = useCallback((e) => {
    e.preventDefault()
    const startX = e.clientX
    const startW = width
    const onMove = (e) => {
      const delta = startX - e.clientX
      setWidth(Math.max(MIN_W, Math.min(MAX_W, startW + delta)))
    }
    const onUp = () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [width])

  const { ask, isThinking, isDownloading, downloadProgress } = useLovelaceAI();

  useEffect(() => {
    if (isOpen) markAllRead();
  }, [isOpen]);

  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(username);
  const [showSettings, setShowSettings] = useState(false);
  const [showUsers, setShowUsers] = useState(false);
  const [blockTarget, setBlockTarget] = useState(null);
  const [lovelaceActive, setLovelaceActive] = useState(false);
  const lovelaceTimeoutRef = useRef(null);
  const nameRef = useRef(null);

  // Insert @mention into the input from the UsersPanel
  const handleMentionInsert = useCallback((uname) => {
    setShowUsers(false);
    window.dispatchEvent(new CustomEvent("oc-insert-mention", { detail: uname }));
  }, []);

  useEffect(() => {
    if (editingName) nameRef.current?.focus();
  }, [editingName]);

  // Auto-dismiss conversation mode after 5 minutes of silence
  const activateLovelace = useCallback(() => {
    setLovelaceActive(true);
    if (lovelaceTimeoutRef.current) clearTimeout(lovelaceTimeoutRef.current);
    lovelaceTimeoutRef.current = setTimeout(() => {
      setLovelaceActive(false);
    }, 5 * 60 * 1000);
  }, []);

  const dismissLovelace = useCallback(() => {
    setLovelaceActive(false);
    if (lovelaceTimeoutRef.current) clearTimeout(lovelaceTimeoutRef.current);
  }, []);

  useEffect(() => () => {
    if (lovelaceTimeoutRef.current) clearTimeout(lovelaceTimeoutRef.current);
  }, []);

  // Process incoming queries when we are the elected Lovelace host
  const processingRef = useRef(new Set());
  useEffect(() => {
    if (!isLovelaceHost || pendingLovelaceQueries.length === 0) return;
    for (const query of pendingLovelaceQueries) {
      if (processingRef.current.has(query.queryId)) continue;
      processingRef.current.add(query.queryId);
      ask(query.text, query.recentMessages, query.lessonContext ?? null)
        .then((answer) => {
          if (answer) sendLovelaceResponse(answer);
        })
        .catch(() => {
          sendLovelaceResponse("Sorry, I ran into an error processing that.");
        })
        .finally(() => {
          processingRef.current.delete(query.queryId);
          resolveLovelaceQuery(query.queryId);
        });
    }
  }, [
    pendingLovelaceQueries,
    isLovelaceHost,
    ask,
    sendLovelaceResponse,
    resolveLovelaceQuery,
  ]);

  const lovelaceStatus = isDownloading
    ? downloadProgress || "Downloading Lovelace…"
    : isThinking
      ? "Lovelace is thinking…"
      : null;

  const lessonContext = currentLessonId
    ? { id: currentLessonId, title: currentLessonTitle }
    : null;

  const handleSend = useCallback(
    async (text) => {
      sendMessage(text);

      const explicitMention = isLovelaceMention(text);
      if (!explicitMention && !lovelaceActive) return;

      const question = explicitMention ? (extractQuestion(text) || text) : text;

      if (isLovelaceHost || globalPeers === 0) {
        try {
          const answer = await ask(question, globalMessages, lessonContext);
          if (answer) {
            sendLovelaceResponse(answer);
            activateLovelace();
          }
        } catch (err) {
          console.error("[Lovelace] ask failed:", err);
          sendLovelaceResponse(
            "Sorry, I ran into an error. Make sure your browser supports WebGPU (Chrome 113+).",
          );
        }
      } else {
        const queryId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
        sendLovelaceQuery(queryId, question, globalMessages, lessonContext);
        activateLovelace();
      }
    },
    [
      sendMessage,
      sendLovelaceResponse,
      ask,
      globalMessages,
      globalPeers,
      isLovelaceHost,
      sendLovelaceQuery,
      lessonContext,
      lovelaceActive,
      activateLovelace,
    ],
  );

  const saveName = () => {
    setUsername(nameInput);
    setEditingName(false);
  };
  const [isMini, setIsMini] = useState(false);
  const dragControls = useDragControls();

  return (
    <>
      <MentionModal />
      <BlockConfirmModal
        target={blockTarget}
        onConfirm={() => {
          blockPeer(blockTarget.peerId, blockTarget.username);
          setBlockTarget(null);
        }}
        onCancel={() => setBlockTarget(null)}
      />
      <AnimatePresence>
        {isOpen && (
          <motion.div
            drag
            dragControls={dragControls}
            dragListener={false}
            dragMomentum={false}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0, height: isMini ? 'auto' : 600 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 28, stiffness: 400 }}
            style={{ width, right: 24, bottom: 90 }}
            className={`fixed z-[1500] flex flex-col bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-black/[0.08] dark:border-white/[0.1] rounded-2xl shadow-2xl overflow-hidden max-h-[calc(100vh-140px)]`}
          >
            {/* Header / Drag Handle */}
            <div 
              onPointerDown={(e) => dragControls.start(e)}
              className="relative flex items-center justify-between px-4 py-3 border-b border-indigo-500/10 dark:border-indigo-500/20 shrink-0 bg-gradient-to-br from-indigo-50/80 to-purple-50/80 dark:from-indigo-900/20 dark:to-purple-900/20 cursor-move"
            >
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-500/20 dark:via-indigo-400/20 to-transparent" />
              <div className="relative z-10 flex items-center gap-3">
                <div className="relative flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-[0_0_15px_rgba(79,70,229,0.9)] animate-pulse" />
                </div>
                <div className="flex flex-col select-none">
                  <span className="font-black text-slate-900 dark:text-white text-[11px] uppercase tracking-[0.2em] leading-none mb-0.5">

                    Study Chat
                  </span>
                  <span className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 tracking-[0.1em] uppercase opacity-80">
                    Peer Discovery Enabled
                  </span>
                </div>
              </div>
              <div className="relative z-10 flex items-center gap-1">
                {!connected && (
                  <button
                    onClick={reconnect}
                    title="Reconnect"
                    className="p-1.5 rounded-lg text-amber-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                )}
                {!isMini && (
                  <button
                    onClick={() => setShowSettings((v) => !v)}
                    title="Blocked users"
                    className={`relative p-1.5 rounded-lg transition-colors ${showSettings ? "text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/40" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"}`}
                  >
                    <Settings className="w-4 h-4" />
                    {blockedUsers.length > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full" />
                    )}
                  </button>
                )}
                <button
                  onClick={() => setIsMini(m => !m)}
                  title={isMini ? "Expand" : "Quick Reply Mode"}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  {isMini ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {isMini ? (
              <ChatInput
                onSend={handleSend}
                disabled={!connected}
                lovelaceActive={lovelaceActive}
                peers={peers}
              />
            ) : showSettings ? (
              <BlockedUsersPanel onClose={() => setShowSettings(false)} />
            ) : (
              <>
                {/* Username row */}
                <div className="flex items-center gap-2 px-4 py-2 border-b border-slate-100 dark:border-slate-800/60 shrink-0 bg-slate-50 dark:bg-slate-900/50">
                  {editingName ? (
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        ref={nameRef}
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveName();
                          if (e.key === "Escape") setEditingName(false);
                        }}
                        maxLength={20}
                        className="flex-1 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-brand-500/50"
                      />
                      <button
                        onClick={saveName}
                        className="text-xs text-brand-600 dark:text-brand-400 font-semibold hover:underline"
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setNameInput(username);
                        setEditingName(true);
                      }}
                      className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                    >
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {username}
                      </span>
                      <span className="text-[10px] underline underline-offset-2">
                        edit
                      </span>
                    </button>
                  )}
                  <button
                    onClick={() => setShowUsers((v) => !v)}
                    title="Online users"
                    className={`ml-auto flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-lg transition-colors ${
                      showUsers
                        ? "text-indigo-500 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40"
                        : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    <Users className="w-3 h-3" />
                    <span className="font-semibold">{globalPeers + 1}</span>
                  </button>
                </div>

                {/* Online users panel */}
                {showUsers && (
                  <UsersPanel
                    peers={peers}
                    username={username}
                    onMention={handleMentionInsert}
                  />
                )}

                {/* Disconnected banner */}
                {!connected && (
                  <div className="flex items-center justify-between px-3 py-2 bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200/60 dark:border-amber-800/40 shrink-0">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                      <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wide">
                        Room disconnected
                      </span>
                    </div>
                    <button
                      onClick={reconnect}
                      className="flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 hover:underline"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Reconnect
                    </button>
                  </div>
                )}

                {/* Active lessons */}
                <ActiveLessonsPanel activeLessons={activeLessons} />

                {/* Lovelace hint */}
                {!lovelaceActive && (
                  <div className="flex flex-col gap-0.5 px-3 py-1.5 bg-violet-50 dark:bg-violet-950/30 border-b border-violet-100 dark:border-violet-900/40 shrink-0">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-violet-500 shrink-0" />
                      <span className="text-[10px] text-violet-600 dark:text-violet-400">
                        Tag <span className="font-bold">@Lovelace</span>,{" "}
                        <span className="font-bold">@Love</span>, or{" "}
                        <span className="font-bold">@Lovely</span> to ask the AI
                        tutor
                      </span>
                    </div>
                    {currentLessonTitle && (
                      <div className="flex items-center gap-1.5 ml-4.5">
                        <BookOpen className="w-3 h-3 text-emerald-500 shrink-0" />
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 truncate">
                          Context: <span className="font-semibold">{currentLessonTitle}</span>
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Lovelace conversation mode banner */}
                {lovelaceActive && (
                  <div className="flex items-center justify-between px-3 py-2 bg-indigo-50 dark:bg-indigo-950/50 border-b border-indigo-200/60 dark:border-indigo-800/40 shrink-0">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse shrink-0" />
                      <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
                        Lovelace is listening
                      </span>
                      {currentLessonTitle && (
                        <span className="text-[10px] text-indigo-400 dark:text-indigo-500 truncate max-w-[120px]">
                          · {currentLessonTitle}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={dismissLovelace}
                      title="End conversation"
                      className="text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-200 transition-colors p-0.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                <MessageList
                  messages={globalMessages}
                  blockedPeers={blockedPeers}
                  historyLoaded={globalHistoryLoaded}
                  onBlockRequest={setBlockTarget}
                  lovelaceStatus={lovelaceStatus}
                />
                <ChatInput
                  onSend={handleSend}
                  disabled={!connected}
                  lovelaceActive={lovelaceActive}
                  peers={peers}
                />
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
