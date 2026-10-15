"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { UnreadCounts } from "@/lib/admin/data";
import type { LiveItem, LiveUpdate } from "@/lib/admin/live";
import { useAdminT } from "./AdminLang";
import s from "./admin.module.css";

// Live dashboard: new contact messages and quote requests arrive over
// Server-Sent Events (app/api/admin/events), or by polling every 15 s while
// the stream is down. Each one plays a sound, shows a toast (and a desktop
// notification when the tab isn't focused and permission was given), updates
// the sidebar badges and the tab title, and is highlighted in its list until
// opened. Browsers only allow sound after a click on the page, so sound is
// opted into from LiveControls and the choice is kept in localStorage.

const POLL_MS = 15_000;
/** Before trying the stream again after the browser gave up on it. */
const RECONNECT_MS = 30_000;
const TOAST_MS = 10_000;
const MAX_TOASTS = 4;
const SOUND_KEY = "idvet_admin_sound";
/** Recently alerted ids, so two open dashboard tabs don't both ring. */
const ALERTED_KEY = "idvet_admin_alerted";
const SOUNDS = { quote: "/assets/sounds/quote.mp3", message: "/assets/sounds/message.mp3" } as const;

type SoundPref = "on" | "muted" | null;
type Mode = "connecting" | "live" | "polling";
type Desktop = NotificationPermission | "unsupported";
type Toast = { key: string; item: LiveItem };

interface LiveValue {
  counts: UnreadCounts;
  mode: Mode;
  /** Ids that arrived while the page was open and haven't been opened yet. */
  fresh: ReadonlySet<string>;
  markOpened: (id: string) => void;
  soundPref: SoundPref;
  soundUnlocked: boolean;
  /** Turns sound on (unlocking audio, inside the click) or mutes it. */
  toggleSound: () => void;
  desktop: Desktop;
  enableDesktop: () => void;
}

const LiveContext = createContext<LiveValue | null>(null);

export function useLive(): LiveValue {
  const value = useContext(LiveContext);
  if (!value) throw new Error("useLive outside AdminLiveProvider");
  return value;
}

export const itemHref = (item: Pick<LiveItem, "kind" | "id">) =>
  `/admin/${item.kind === "quote" ? "quotes" : "messages"}/${item.id}`;

function readStorage(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Private mode / blocked storage: the choice just isn't remembered.
  }
}

/** True the first time any tab asks about `id` (best effort, via localStorage). */
function claimAlert(id: string): boolean {
  let recent: string[] = [];
  try {
    recent = JSON.parse(readStorage(ALERTED_KEY) ?? "[]");
  } catch {}
  if (!Array.isArray(recent)) recent = [];
  if (recent.includes(id)) return false;
  writeStorage(ALERTED_KEY, JSON.stringify([...recent, id].slice(-50)));
  return true;
}

export function AdminLiveProvider({
  counts: serverCounts,
  since,
  children,
}: {
  /** From the panel layout; re-sent whenever the layout re-renders. */
  counts: UnreadCounts;
  /** When the page was rendered: anything older is already on it. */
  since: string;
  children: React.ReactNode;
}) {
  const t = useAdminT();
  const router = useRouter();
  const pathname = usePathname();

  // Server-rendered counts win whenever they change (e.g. after opening an item).
  const [counts, setCounts] = useState(serverCounts);
  const [prevServerCounts, setPrevServerCounts] = useState(serverCounts);
  if (serverCounts.messages !== prevServerCounts.messages || serverCounts.quotes !== prevServerCounts.quotes) {
    setPrevServerCounts(serverCounts);
    setCounts(serverCounts);
  }

  const [mode, setMode] = useState<Mode>("connecting");
  const [fresh, setFresh] = useState<ReadonlySet<string>>(() => new Set());
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [soundPref, setSoundPref] = useState<SoundPref>(null);
  const [soundUnlocked, setSoundUnlocked] = useState(false);
  const [desktop, setDesktop] = useState<Desktop>("unsupported");

  const audio = useRef<{
    ctx: AudioContext;
    buffers: Record<LiveItem["kind"], Promise<AudioBuffer | null>>;
  } | null>(null);
  // Read by the stream callbacks, which are set up once.
  const latest = useRef({ t, router, pathname, soundPref });
  useEffect(() => {
    latest.current = { t, router, pathname, soundPref };
  });

  // Saved choices are only readable in the browser, after hydration.
  useEffect(() => {
    const saved = readStorage(SOUND_KEY);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- browser-only state, read once after hydration
    setSoundPref(saved === "on" || saved === "muted" ? saved : null);
    setDesktop("Notification" in window ? Notification.permission : "unsupported");
  }, []);

  /**
   * Web Audio rather than <audio>: once resumed inside a click, the context
   * keeps playing in a background tab, and its state says when the browser
   * suspends it again (shown as "blocked").
   */
  const audioEngine = useCallback(() => {
    if (!audio.current) {
      const Context = window.AudioContext ?? (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Context) return null;
      const ctx = new Context();
      ctx.onstatechange = () => setSoundUnlocked(ctx.state === "running");
      const load = (src: string) =>
        fetch(src)
          .then((r) => r.arrayBuffer())
          .then((data) => ctx.decodeAudioData(data))
          .catch(() => null);
      audio.current = { ctx, buffers: { quote: load(SOUNDS.quote), message: load(SOUNDS.message) } };
    }
    return audio.current;
  }, []);

  const playSound = useCallback(
    async (kind: LiveItem["kind"]) => {
      const engine = audioEngine();
      if (!engine || engine.ctx.state !== "running") return setSoundUnlocked(false);
      const buffer = await engine.buffers[kind];
      if (!buffer) return;
      const source = engine.ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(engine.ctx.destination);
      source.start();
    },
    [audioEngine],
  );

  /** Must run inside a click/keypress: browsers only start audio from one. */
  const unlock = useCallback(async () => {
    const engine = audioEngine();
    if (!engine) return false;
    await engine.ctx.resume().catch(() => {});
    const ok = engine.ctx.state === "running";
    setSoundUnlocked(ok);
    return ok;
  }, [audioEngine]);

  // Sound was turned on in an earlier visit: unlock on the first interaction with the page.
  useEffect(() => {
    if (soundPref !== "on" || soundUnlocked) return;
    const onInteract = () => void unlock();
    const events = ["pointerdown", "keydown"] as const;
    for (const e of events) document.addEventListener(e, onInteract, { once: true, capture: true });
    return () => {
      for (const e of events) document.removeEventListener(e, onInteract, { capture: true });
    };
  }, [soundPref, soundUnlocked, unlock]);

  const toggleSound = useCallback(() => {
    if (soundPref === "on" && soundUnlocked) {
      setSoundPref("muted");
      writeStorage(SOUND_KEY, "muted");
      return;
    }
    setSoundPref("on");
    writeStorage(SOUND_KEY, "on");
    void unlock().then((ok) => {
      if (ok) void playSound("message"); // A sample, so the choice is audible.
    });
  }, [soundPref, soundUnlocked, unlock, playSound]);

  const enableDesktop = useCallback(() => {
    if (!("Notification" in window)) return;
    void Notification.requestPermission().then(setDesktop);
  }, []);

  const dismiss = useCallback((key: string) => setToasts((list) => list.filter((x) => x.key !== key)), []);

  const markOpened = useCallback((id: string) => {
    setFresh((set) => {
      if (!set.has(id)) return set;
      const next = new Set(set);
      next.delete(id);
      return next;
    });
  }, []);

  // The first render's time: later layout renders (router.refresh) mustn't reconnect.
  const [floor] = useState(since);

  // ------------------------------------------------------------ connection
  useEffect(() => {
    let cursor = floor;
    let stopped = false;
    let source: EventSource | null = null;
    let pollTimer: ReturnType<typeof setInterval> | undefined;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    const seen = new Set<string>();

    const announce = (item: LiveItem) => {
      const { t, router, soundPref } = latest.current;
      const text = item.kind === "quote" ? t.live.quoteToast(item.product, item.name) : t.live.messageToast(item.name);
      const key = `${item.id}-${Date.now()}`;
      setToasts((list) => [...list, { key, item }].slice(-MAX_TOASTS));
      setTimeout(() => setToasts((list) => list.filter((x) => x.key !== key)), TOAST_MS);

      if (!claimAlert(item.id)) return; // Another open tab already rang for it.
      if (soundPref === "on") void playSound(item.kind);
      const unfocused = document.visibilityState !== "visible" || !document.hasFocus();
      if (unfocused && "Notification" in window && Notification.permission === "granted") {
        try {
          const n = new Notification(item.kind === "quote" ? t.live.newQuote : t.live.newMessage, {
            body: text,
            tag: item.id,
            icon: "/icon.svg",
          });
          n.onclick = () => {
            window.focus();
            router.push(itemHref(item));
            n.close();
          };
        } catch {
          // Some mobile browsers only allow notifications from a service worker.
        }
      }
    };

    const apply = (update: LiveUpdate) => {
      cursor = update.cursor;
      setCounts(update.counts);
      const added = update.items.filter((item) => !seen.has(item.id));
      if (!added.length) return;
      for (const item of added) seen.add(item.id);
      setFresh((set) => new Set([...set, ...added.map((i) => i.id)]));
      for (const item of added) announce(item);
      // Show the new rows on the pages that list them.
      const { pathname, router } = latest.current;
      if (pathname === "/admin" || pathname === "/admin/quotes" || pathname === "/admin/messages") router.refresh();
    };

    const query = () => `since=${encodeURIComponent(cursor)}&floor=${encodeURIComponent(floor)}`;

    const stop = () => {
      stopped = true;
      source?.close();
      clearInterval(pollTimer);
      clearTimeout(retryTimer);
    };

    const poll = async () => {
      try {
        const response = await fetch(`/api/admin/events/poll?${query()}`, { cache: "no-store" });
        if (response.status === 401) return stop(); // Signed out: the next navigation goes to the login page.
        if (response.ok && !stopped) apply(await response.json());
      } catch {
        // Offline: try again on the next tick.
      }
    };

    const startPolling = () => {
      if (pollTimer || stopped) return;
      setMode("polling");
      void poll();
      pollTimer = setInterval(poll, POLL_MS);
    };

    const connect = () => {
      if (stopped || typeof EventSource === "undefined") return startPolling();
      const es = new EventSource(`/api/admin/events?${query()}`);
      source = es;
      es.addEventListener("update", (e) => apply(JSON.parse((e as MessageEvent<string>).data)));
      es.addEventListener("logout", stop);
      es.onopen = () => {
        clearInterval(pollTimer);
        pollTimer = undefined;
        setMode("live");
      };
      es.onerror = () => {
        startPolling();
        // CONNECTING: the browser retries by itself. CLOSED: it gave up, so retry later.
        if (es.readyState === EventSource.CLOSED) {
          es.close();
          retryTimer = setTimeout(connect, RECONNECT_MS);
        }
      };
    };

    connect();
    return stop;
  }, [floor, playSound]);

  // ------------------------------------------------------------ tab title: "(3) …"
  const total = counts.messages + counts.quotes;
  useEffect(() => {
    const update = () => {
      const base = document.title.replace(/^\(\d+\+?\) /, "");
      const next = total ? `(${total > 99 ? "99+" : total}) ${base}` : base;
      if (document.title !== next) document.title = next;
    };
    update();
    // Next.js sets the title again on every navigation.
    const observer = new MutationObserver(update);
    observer.observe(document.head, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, [total]);

  const value: LiveValue = {
    counts,
    mode,
    fresh,
    markOpened,
    soundPref,
    soundUnlocked,
    toggleSound,
    desktop,
    enableDesktop,
  };

  return (
    <LiveContext.Provider value={value}>
      {children}
      <div className={s.toasts} aria-live="polite">
        {toasts.map(({ key, item }) => (
          <div key={key} className={`${s.toast} ${item.kind === "quote" ? s.toastQuote : ""}`}>
            <button
              type="button"
              className={s.toastBody}
              onClick={() => {
                dismiss(key);
                router.push(itemHref(item));
              }}
            >
              {item.kind === "quote" && (
                <span className={s.toastImg}>
                  {item.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.image} alt="" />
                  ) : (
                    "📦"
                  )}
                </span>
              )}
              {item.kind === "message" && <span className={s.toastImg}>✉️</span>}
              <span>
                <b>{item.kind === "quote" ? t.live.newQuote : t.live.newMessage}</b>
                <bdi>
                  {item.kind === "quote" ? `${item.product} — ${item.name}` : item.subject ? `${item.name} · ${item.subject}` : item.name}
                </bdi>
              </span>
            </button>
            <button type="button" className={s.toastX} aria-label={t.live.dismiss} onClick={() => dismiss(key)}>
              ×
            </button>
          </div>
        ))}
      </div>
    </LiveContext.Provider>
  );
}

/** Sound / desktop-notification switches and the connection state. `compact`: icon only (mobile bar). */
export function LiveControls({ compact = false }: { compact?: boolean }) {
  const t = useAdminT();
  const { mode, soundPref, soundUnlocked, toggleSound, desktop, enableDesktop } = useLive();
  const blocked = soundPref === "on" && !soundUnlocked;
  const on = soundPref === "on" && soundUnlocked;
  const soundLabel = blocked ? t.live.soundBlocked : on ? t.live.soundOn : soundPref === "muted" ? t.live.soundOff : t.live.enableSound;

  if (compact) {
    return (
      <button
        type="button"
        className={`${s.liveIcon} ${blocked || soundPref === null ? s.liveAttn : ""}`}
        onClick={toggleSound}
        aria-label={soundLabel}
        title={soundLabel}
      >
        {on ? "🔊" : soundPref === "muted" ? "🔇" : "🔔"}
      </button>
    );
  }

  return (
    <div className={s.live}>
      <button
        type="button"
        className={`${s.liveBtn} ${blocked || soundPref === null ? s.liveAttn : ""}`}
        onClick={toggleSound}
        aria-pressed={on}
      >
        {on ? `🔊 ${t.live.soundOn}` : soundPref === "muted" ? `🔇 ${t.live.soundOff}` : soundLabel}
      </button>
      {desktop === "default" && (
        <button type="button" className={s.liveBtn} onClick={enableDesktop}>
          {t.live.enableDesktop}
        </button>
      )}
      <span className={s.liveState} data-mode={mode}>
        <span aria-hidden="true" />
        {mode === "polling" ? t.live.polling : t.live.live}
      </span>
    </div>
  );
}

/** A list row that is highlighted while its item arrived live and hasn't been opened. */
export function FreshRow({ id, children }: { id: string; children: React.ReactNode }) {
  const { fresh } = useLive();
  return <li className={fresh.has(id) ? s.fresh : undefined}>{children}</li>;
}
