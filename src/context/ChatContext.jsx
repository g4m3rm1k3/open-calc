import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { ChatContext } from "./chatContext.js";
import { joinRoom } from "@trystero-p2p/nostr";
import { useLocation } from "react-router-dom";
import { LESSON_MAP } from "../content/index.js";
import {
  getOrCreateKeypair,
  createPool,
  publishMessage,
  subscribeHistory,
} from "../lib/nostrChat.js";
import { getGpuScore } from "../utils/gpuScore.js";

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
    let bestId = "local";
    let bestScore = myGpuScoreRef.current;
    for (const [pid, score] of peerScoresRef.current) {
      if (score > bestScore) { bestScore = score; bestId = pid; }
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

  // Init Nostr keypair + pool once
  useEffect(() => {
    keypair.current = getOrCreateKeypair();
    nostrPool.current = createPool();
    return () => { try { nostrPool.current?.close?.([], {}); } catch {} };
  }, []);

  // Compute GPU score once on mount
  useEffect(() => {
    getGpuScore().then(score => { myGpuScoreRef.current = score; reelectHost(); });
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

  // Global room — joined once, no lesson sub-rooms
  useEffect(() => {
    let room;
    try {
      room = joinRoom(APP_CONFIG, "open-calc-global");
      const [send, receive] = room.makeAction("msg");
      sendGlobalRef.current = send;

      receive((data, peerId) => {
        if (!data?.text || !data?.username) return;
        const msg = makeIncomingMsg(data, peerId);
        setGlobalMessages(prev => mergeMessages(prev, [msg]));
        setUnreadCount(n => n + 1);
      });

      let sendLv = null;
      try {
        const [lv, receiveLv] = room.makeAction("lovelace");
        sendLv = lv;
        sendLovelaceChannelRef.current = lv;

        receiveLv((data, peerId) => {
          if (data?.type === "announce") {
            peerScoresRef.current.set(peerId, data.score ?? 0);
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
        sendLv?.({ type: "announce", score: myGpuScoreRef.current });
        // Share current lesson with the new peer
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
    } catch (e) {
      console.warn("[Chat] Global room failed:", e);
    }

    if (nostrPool.current) {
      subscribeHistory(
        nostrPool.current, "global", HISTORY_HOURS,
        msg => setGlobalMessages(prev => mergeMessages(prev, [msg])),
        () => setGlobalHistoryLoaded(true),
      );
    } else {
      setGlobalHistoryLoaded(true);
    }

    return () => { try { room?.leave(); } catch {} };
  }, []);

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
    const msg = {
      id: `${peerId}-${ts}`,
      peerId, username: uname, text: filtered,
      timestamp: ts, isOwn: !isLovelace, isLovelace,
    };

    try { sendGlobalRef.current?.(payload); } catch {}
    setGlobalMessages(prev => mergeMessages(prev, [msg]));

    // Don't publish AI responses to Nostr — relay echo would create duplicates
    if (!isLovelace && keypair.current && nostrPool.current) {
      publishMessage(nostrPool.current, keypair.current.sk, "global", {
        ...payload,
        peerId: keypair.current.pk.slice(0, 16),
      }).catch(() => {});
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

  return (
    <ChatContext.Provider
      value={{
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
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}
