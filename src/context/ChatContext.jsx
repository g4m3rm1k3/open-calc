import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { ChatContext } from "./chatContext.js";
import { useLocation } from "react-router-dom";
import { LESSON_MAP } from "../courses/index.js";
import { getGpuScore } from "../utils/gpuScore.js";

// ChatProvider wraps the whole app (see App.jsx), so anything imported at
// module scope here ends up in the main entry bundle every page pays for
// before it can render. nostr-tools (relay delivery) and trystero (P2P room)
// are both sizable — dynamic-imported instead so they load as their own
// chunk. Both are also *prefetched* during browser idle time (see
// scheduleIdle below) rather than the instant they're needed — fetching them
// eagerly on mount / on chat-open made their fetch+parse compete with the
// user's first keystrokes and with Lovelace's P2P channel coming up, which
// read as "typing lag" and "Lovelace lag" respectively. Idle-time prefetch
// means both are already warm in cache by the time they're actually used, in
// virtually every real session. Delivery to all users is unaffected — the
// relay module load is still kicked off unconditionally, just scheduled for
// idle time instead of blocking the main thread immediately.
function scheduleIdle(fn) {
  if (typeof window !== "undefined" && typeof window.requestIdleCallback === "function") {
    const id = window.requestIdleCallback(fn, { timeout: 2000 });
    return () => window.cancelIdleCallback(id);
  }
  const id = setTimeout(fn, 200);
  return () => clearTimeout(id);
}

let nostrChatModulePromise = null;
function loadNostrChat() {
  if (!nostrChatModulePromise) nostrChatModulePromise = import("./nostrChat.js");
  return nostrChatModulePromise;
}

let trysteroModulePromise = null;
function loadTrystero() {
  if (!trysteroModulePromise) trysteroModulePromise = import("@trystero-p2p/nostr");
  return trysteroModulePromise;
}

const APP_CONFIG = { appId: "open-calc-v1" };
const MAX_MESSAGES = 200;
const HISTORY_HOURS = 24;

const ADJ = [
  "Curious", "Infinite", "Prime", "Acute", "Tangent",
  "Integral", "Limit", "Vector", "Complex", "Rational",
];
const NAMES = [
  "Euler", "Newton", "Gauss", "Cantor", "Riemann",
  "Leibniz", "Fermat", "Hilbert", "Cauchy", "Fourier",
];

function makeUsername() {
  return ADJ[Math.floor(Math.random() * ADJ.length)] +
         NAMES[Math.floor(Math.random() * NAMES.length)];
}

const BAD_PATTERNS = [/f+u+c+k+/gi, /s+h+i+t+/gi, /a+s+s+h+o+l+e/gi, /b+i+t+c+h/gi];
function filterText(text) {
  let t = text;
  BAD_PATTERNS.forEach(p => { t = t.replace(p, "***"); });
  return t;
}

function lessonInfoFromPath(pathname) {
  const m = pathname.match(/^\/chapter\/([^/]+)(?:\/([^/]+))?/);
  if (!m || !m[2]) return null;
  const lesson = LESSON_MAP[`${m[1]}/${m[2]}`];
  if (!lesson) return null;
  return { id: lesson.id, title: lesson.title || lesson.id };
}

function mergeMessages(existing, incoming) {
  const seen = new Set(existing.map(m => m.id));
  const merged = [...existing];
  for (const msg of incoming) {
    if (!seen.has(msg.id)) { merged.push(msg); seen.add(msg.id); }
  }
  return merged.sort((a, b) => a.timestamp - b.timestamp).slice(-MAX_MESSAGES);
}

export function ChatProvider({ children }) {
  const location = useLocation();

  const [username, setUsernameState] = useState(
    () => localStorage.getItem("oc-chat-username") || makeUsername(),
  );
  const [blockedUsers, setBlockedUsers] = useState(() => {
    try { return JSON.parse(localStorage.getItem("oc-blocked-peers") || "[]"); }
    catch { return []; }
  });
  const blockedPeers = useMemo(
    () => new Set(blockedUsers.map(u => u.peerId)),
    [blockedUsers],
  );

  const [globalMessages, setGlobalMessages] = useState([]);
  const [globalPeers, setGlobalPeers] = useState(0);
  const [currentLessonId, setCurrentLessonId] = useState(null);
  const [currentLessonTitle, setCurrentLessonTitle] = useState(null);
  // activeLessons: Map<lessonId, { title: string, users: string[] }>
  const [activeLessons, setActiveLessons] = useState(new Map());
  const [connected, setConnected] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [globalHistoryLoaded, setGlobalHistoryLoaded] = useState(false);
  const [roomKey, setRoomKey] = useState(0);
  // Flips true once the dynamically-imported nostrChat module has resolved
  // and the keypair/pool are set up — gates the relay-subscription effect.
  const [nostrLoaded, setNostrLoaded] = useState(false);
  // Whether the chat panel is open — gates the WebRTC P2P room (and the GPU/
  // host-election machinery it carries for Lovelace). The Nostr relay layer
  // below is NOT gated by this — it alone delivers messages/history to
  // everyone, regardless of whether any given user has chat open.
  const [chatOpen, setChatOpen] = useState(false);

  const sendGlobalRef = useRef(null);
  const usernameRef = useRef(username);
  usernameRef.current = username;
  const nostrPool = useRef(null);
  const keypair = useRef(null);

  // Lovelace P2P host election
  const myGpuScoreRef = useRef(0);
  const peerScoresRef = useRef(new Map());
  const [lovelaceHostId, setLovelaceHostId] = useState("local");
  const lovelaceHostIdRef = useRef("local");
  const [pendingLovelaceQueries, setPendingLovelaceQueries] = useState([]);
  const sendLovelaceChannelRef = useRef(null);

  // Lesson presence: peerId -> { lessonId, title, username } | null
  const peerLessonsRef = useRef(new Map());
  // My own current lesson (kept in a ref so callbacks always see current value)
  const currentLessonRef = useRef(null);

  function reelectHost() {
    const myPk = keypair.current?.pk ?? "";
    let bestId = "local";
    let bestScore = myGpuScoreRef.current;
    let bestPk = myPk;
    for (const [pid, { score, pk }] of peerScoresRef.current) {
      // Higher score wins; equal score → lower pk wins (deterministic across both clients)
      if (score > bestScore || (score === bestScore && pk < bestPk)) {
        bestScore = score; bestId = pid; bestPk = pk;
      }
    }
    lovelaceHostIdRef.current = bestId;
    setLovelaceHostId(bestId);
  }

  function rebuildActiveLessons() {
    const map = new Map();
    // Include peers
    for (const [, info] of peerLessonsRef.current) {
      if (!info?.lessonId) continue;
      if (!map.has(info.lessonId)) map.set(info.lessonId, { title: info.title || info.lessonId, users: [] });
      map.get(info.lessonId).users.push(info.username);
    }
    // Include self
    const myLesson = currentLessonRef.current;
    if (myLesson) {
      if (!map.has(myLesson.id)) map.set(myLesson.id, { title: myLesson.title || myLesson.id, users: [] });
      map.get(myLesson.id).users.unshift("You");
    }
    setActiveLessons(new Map(map));
  }

  const markAllRead = useCallback(() => setUnreadCount(0), []);

  const setUsername = useCallback(name => {
    const clean = name.trim().slice(0, 20);
    if (!clean) return;
    localStorage.setItem("oc-chat-username", clean);
    setUsernameState(clean);
  }, []);

  const blockPeer = useCallback((peerId, uname) => {
    setBlockedUsers(prev => {
      if (prev.some(u => u.peerId === peerId)) return prev;
      const next = [...prev, { peerId, username: uname || peerId.slice(0, 8) }];
      localStorage.setItem("oc-blocked-peers", JSON.stringify(next));
      return next;
    });
  }, []);

  const unblockPeer = useCallback(peerId => {
    setBlockedUsers(prev => {
      const next = prev.filter(u => u.peerId !== peerId);
      localStorage.setItem("oc-blocked-peers", JSON.stringify(next));
      return next;
    });
  }, []);

  // Init Nostr keypair + pool once — nostrChat.js is dynamic-imported (see
  // loadNostrChat above), scheduled for idle time so the fetch+parse doesn't
  // compete with the user's first interactions right after page load. Also
  // prefetches trystero here (idle, not gated on chatOpen) so that when chat
  // is actually opened, its P2P room — and Lovelace's channel over it —
  // comes up from a warm cache instead of a fresh network fetch.
  useEffect(() => {
    let cancelled = false;
    const cancelIdle = scheduleIdle(() => {
      loadTrystero();
      loadNostrChat().then(mod => {
        if (cancelled) return;
        keypair.current = mod.getOrCreateKeypair();
        nostrPool.current = mod.createPool();
        setNostrLoaded(true);
      });
    });
    return () => {
      cancelled = true;
      cancelIdle();
      try { nostrPool.current?.close?.([], {}); } catch {}
    };
  }, []);

  // Track chat-panel open/closed state, via the same window event Taskbar.jsx
  // dispatches and AppShell.jsx already listens to for the panel's own
  // visibility — kept independent here so this provider can gate the P2P
  // room without any prop plumbing.
  useEffect(() => {
    const handler = () => setChatOpen(o => !o);
    window.addEventListener("oc-toggle-chat", handler);
    return () => window.removeEventListener("oc-toggle-chat", handler);
  }, []);

  function makeIncomingMsg(data, peerId) {
    return {
      id: `${peerId}-${data.ts}`,
      peerId,
      username: String(data.username).slice(0, 20),
      text: filterText(String(data.text).slice(0, 500)),
      timestamp: data.ts,
      isOwn: false,
      isLovelace: !!data.isLovelace,
    };
  }

  // Nostr relay layer — ALWAYS active, regardless of chatOpen. This alone
  // delivers live messages and history to everyone (see nostrChat.js); the
  // WebRTC room below is additional, not required for basic chat delivery.
  // Re-runs when roomKey increments (manual reconnect) or once nostrLoaded
  // flips true after the dynamic import resolves.
  useEffect(() => {
    if (!nostrLoaded || !nostrPool.current) return;

    let cancelled = false;
    const nostrLiveSub = { current: null };
    const liveFrom = Math.floor(Date.now() / 1000);
    const myPeerId = keypair.current?.pk?.slice(0, 16);

    loadNostrChat().then(({ subscribeHistory, subscribeLive }) => {
      if (cancelled) return;
      subscribeHistory(
        nostrPool.current, "global", HISTORY_HOURS,
        // parseNostrEvent (nostrChat.js) hardcodes isOwn: false since it has
        // no notion of "me" — correct it here for messages we sent in a past
        // session, so they render as "Me" (no Block button) after a reload.
        // _canonKey lets mergeMessages deduplicate against P2P-first deliveries.
        msg => {
          const withKey = { ...msg, _canonKey: `${msg.username}-${msg.timestamp}` };
          setGlobalMessages(prev =>
            mergeMessages(prev, [msg.peerId === myPeerId ? { ...withKey, isOwn: true } : withKey]),
          );
        },
        () => {
          if (cancelled) return;
          setGlobalHistoryLoaded(true);
          // Keep listening for new Nostr events after history is loaded
          nostrLiveSub.current = subscribeLive(
            nostrPool.current, "global", liveFrom,
            msg => {
              // Drop relay echoes of our own messages and all Lovelace responses.
              // Our own: peerId matches our pubkey slice.
              // Lovelace: the host that ran the AI already added it locally via
              //   sendLovelaceResponse() → sendMessage(text, true), which sets
              //   id "lovelace-ai-{ts}". The Nostr echo comes back as
              //   "nostr-{eventId}" — a different id — so mergeMessages misses
              //   it; _canonKey also races the local state commit. Simplest
              //   correct fix: every client drops Lovelace Nostr echoes because
              //   all clients receive the canonical copy via the P2P channel or
              //   their own local sendMessage call.
              if (msg.peerId === myPeerId || msg.peerId === "lovelace-ai") return;
              // Attach canonical key for cross-transport deduplication
              const withKey = { ...msg, _canonKey: `${msg.username}-${msg.timestamp}` };
              setGlobalMessages(prev => {
                // Drop if already delivered via P2P (same canonKey)
                if (prev.some(m => m._canonKey === withKey._canonKey && m._canonKey)) return prev;
                return mergeMessages(prev, [withKey]);
              });
              setUnreadCount(n => n + 1);
            },
          );
        },
      );
    });

    return () => {
      cancelled = true;
      try { nostrLiveSub.current?.close(); } catch {}
    };
  }, [roomKey, nostrLoaded]);

  // WebRTC P2P room — transport for redundant/low-latency message delivery
  // AND for Lovelace's GPU host-election + AI query routing. Connects as soon
  // as nostr is loaded (so peers are discovered and visible before you even
  // open the chat panel). Re-runs when roomKey increments (manual reconnect).
  useEffect(() => {
    if (!nostrLoaded) return;

    // Reset peer state on each (re)connect
    setGlobalPeers(0);
    peerScoresRef.current.clear();
    peerLessonsRef.current.clear();
    lovelaceHostIdRef.current = "local";
    setLovelaceHostId("local");

    let room;
    let cancelled = false;

    // trystero is dynamic-imported (and idle-prefetched on mount above) so
    // it isn't part of the bundle every page pays for, and is already warm
    // by the time chat actually opens.
    loadTrystero().then(({ joinRoom }) => {
      if (cancelled) return;

      try {
        room = joinRoom(APP_CONFIG, "open-calc-global");
        const [send, receive] = room.makeAction("msg");
        sendGlobalRef.current = send;

        receive((data, peerId) => {
          if (!data?.text || !data?.username) return;
          const msg = makeIncomingMsg(data, peerId);
          // Only add if not already present from Nostr delivery (same content,
          // similar timestamp). Nostr uses "nostr-{eventId}"; P2P uses
          // "{peerId}-{ts}". To deduplicate across transports we store a
          // canonical key on each message and check that too.
          setGlobalMessages(prev => {
            const canonKey = `${data.username}-${data.ts}`;
            if (prev.some(m => m._canonKey === canonKey)) return prev;
            return mergeMessages(prev, [{ ...msg, _canonKey: canonKey }]);
          });
          setUnreadCount(n => n + 1);
        });

        let sendLv = null;
        try {
          const [lv, receiveLv] = room.makeAction("lovelace");
          sendLv = lv;
          sendLovelaceChannelRef.current = lv;

          receiveLv((data, peerId) => {
            if (data?.type === "announce") {
              peerScoresRef.current.set(peerId, { score: data.score ?? 0, pk: data.pk ?? peerId });
              reelectHost();
            } else if (data?.type === "lesson-presence") {
              peerLessonsRef.current.set(
                peerId,
                data.lessonId
                  ? { lessonId: data.lessonId, title: data.title, username: data.username }
                  : null,
              );
              rebuildActiveLessons();
            } else if (data?.type === "query" && lovelaceHostIdRef.current === "local") {
              setPendingLovelaceQueries(q =>
                q.some(p => p.queryId === data.queryId)
                  ? q
                  : [...q, {
                      queryId: data.queryId,
                      text: data.text,
                      recentMessages: data.recentMessages ?? [],
                      lessonContext: data.lessonContext ?? null,
                    }],
              );
            }
          });
        } catch (lvErr) {
          console.warn("[Chat] Lovelace P2P channel setup failed:", lvErr);
        }

        room.onPeerJoin(() => {
          setGlobalPeers(n => n + 1);
          sendLv?.({ type: "announce", score: myGpuScoreRef.current, pk: keypair.current?.pk ?? "" });
          const myLesson = currentLessonRef.current;
          if (myLesson) {
            sendLv?.({
              type: "lesson-presence",
              lessonId: myLesson.id,
              title: myLesson.title,
              username: usernameRef.current,
            });
          }
        });

        room.onPeerLeave(peerId => {
          setGlobalPeers(n => Math.max(0, n - 1));
          peerScoresRef.current.delete(peerId);
          reelectHost();
          peerLessonsRef.current.delete(peerId);
          rebuildActiveLessons();
        });

        setConnected(true);

        // Compute + announce GPU score once per connection (i.e. once each time
        // chat opens) — so the host election is already resolved by the time
        // anyone actually needs it, without running continuously in the
        // background while chat is closed.
        getGpuScore().then(score => {
          myGpuScoreRef.current = score;
          reelectHost();
          sendLv?.({ type: "announce", score, pk: keypair.current?.pk ?? "" });
        });
      } catch (e) {
        console.warn("[Chat] Global room failed:", e);
        setConnected(false);
      }
    });

    return () => {
      cancelled = true;
      try { room?.leave(); } catch {}
      sendGlobalRef.current = null;
      sendLovelaceChannelRef.current = null;
      setConnected(false);
      setGlobalPeers(0);
    };
  }, [roomKey, nostrLoaded]);

  // Track lesson from URL + broadcast presence on change
  useEffect(() => {
    const info = lessonInfoFromPath(location.pathname);
    currentLessonRef.current = info;
    setCurrentLessonId(info?.id ?? null);
    setCurrentLessonTitle(info?.title ?? null);

    // Broadcast lesson change to all connected peers
    if (sendLovelaceChannelRef.current) {
      sendLovelaceChannelRef.current({
        type: "lesson-presence",
        lessonId: info?.id ?? null,
        title: info?.title ?? null,
        username: usernameRef.current,
      });
    }

    rebuildActiveLessons();
  }, [location.pathname]);

  const sendMessage = useCallback((text, isLovelace = false) => {
    const filtered = filterText(text.trim().slice(0, 500));
    if (!filtered) return;
    const ts = Date.now();
    const uname = isLovelace ? "Lovelace" : usernameRef.current;
    const peerId = isLovelace ? "lovelace-ai" : "local";
    const payload = { text: filtered, username: uname, ts, isLovelace };
    // Canonical dedup key matches what the P2P receive handler checks
    const canonKey = `${uname}-${ts}`;
    const msg = {
      id: `${peerId}-${ts}`,
      peerId, username: uname, text: filtered,
      timestamp: ts, isOwn: !isLovelace, isLovelace,
      _canonKey: canonKey,
    };

    try { sendGlobalRef.current?.(payload); } catch {}
    setGlobalMessages(prev => mergeMessages(prev, [msg]));

    // Publish ALL messages (including Lovelace AI responses) to Nostr so every
    // user in the room sees them, regardless of whether they're in the P2P room.
    // The live-subscription handler already drops our own echoes (peerId match),
    // so Lovelace echoes won't duplicate — they use a fixed "lovelace-ai" peerId
    // which is never equal to any user's real pubkey slice.
    if (keypair.current && nostrPool.current) {
      const publishPeerId = isLovelace ? "lovelace-ai" : keypair.current.pk.slice(0, 16);
      loadNostrChat().then(({ publishMessage }) =>
        publishMessage(nostrPool.current, keypair.current.sk, "global", {
          ...payload,
          peerId: publishPeerId,
        }),
      ).catch(() => {});
    }
  }, []);

  const sendLovelaceResponse = useCallback(
    text => sendMessage(text, true),
    [sendMessage],
  );

  const sendLovelaceQuery = useCallback((queryId, text, recentMessages, lessonContext) => {
    sendLovelaceChannelRef.current?.({
      type: "query",
      queryId,
      text,
      recentMessages: recentMessages.slice(-6).map(m => ({
        username: m.username,
        text: m.text,
        isLovelace: m.isLovelace,
      })),
      lessonContext: lessonContext || null,
    });
  }, []);

  const resolveLovelaceQuery = useCallback(queryId => {
    setPendingLovelaceQueries(q => q.filter(p => p.queryId !== queryId));
  }, []);

  const reconnect = useCallback(() => {
    setConnected(false);
    setRoomKey(k => k + 1);
  }, []);

  const value = useMemo(() => ({
    username,
    setUsername,
    blockedPeers,
    blockedUsers,
    blockPeer,
    unblockPeer,
    globalMessages,
    globalPeers,
    currentLessonId,
    currentLessonTitle,
    activeLessons,
    connected,
    chatOpen,
    sendMessage,
    sendLovelaceResponse,
    unreadCount,
    markAllRead,
    globalHistoryLoaded,
    isLovelaceHost: lovelaceHostId === "local",
    lovelaceHostId,
    pendingLovelaceQueries,
    sendLovelaceQuery,
    resolveLovelaceQuery,
    reconnect,
  }), [
    username, setUsername, blockedPeers, blockedUsers, blockPeer, unblockPeer,
    globalMessages, globalPeers, currentLessonId, currentLessonTitle, activeLessons,
    connected, chatOpen, sendMessage, sendLovelaceResponse, unreadCount, markAllRead,
    globalHistoryLoaded, lovelaceHostId, pendingLovelaceQueries, sendLovelaceQuery,
    resolveLovelaceQuery, reconnect,
  ]);

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}
