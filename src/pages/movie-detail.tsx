import React, { useState, useEffect, useRef } from 'react';
import { useRoute, Link } from 'wouter';
import { usePlayData, useSimilar } from '@/hooks/use-movies';
import { useWatchHistory } from '@/hooks/use-watch-history';
import { useWatchlist } from '@/hooks/use-watchlist';
import type { StreamData, ServerResult } from '@/lib/api';
import { fetchPlay } from '@/lib/api';
import { Layout } from '@/components/layout';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Play, X, Loader2, Info, Share2, Check, RefreshCw, Wifi, WifiOff, Zap, Bookmark, BookmarkCheck, Film, Star, Eye, Download } from 'lucide-react';
import { useRatings } from '@/hooks/use-ratings';
import { MovieCard, MovieCardSkeleton } from '@/components/movie-card';

/* ─── Network status hook ────────────────────────────────────────────────
   Returns { isOnline, justReconnected }.
   justReconnected is true for 2.5 s after coming back online.
──────────────────────────────────────────────────────────────────────── */
function useNetworkStatus() {
  const [isOnline, setIsOnline]           = useState(navigator.onLine);
  const [justReconnected, setJustReconn] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    const onOnline  = () => {
      setIsOnline(true);
      setJustReconn(true);
      timer = setTimeout(() => setJustReconn(false), 2500);
    };
    const onOffline = () => {
      setIsOnline(false);
      setJustReconn(false);
    };

    window.addEventListener('online',  onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online',  onOnline);
      window.removeEventListener('offline', onOffline);
      clearTimeout(timer);
    };
  }, []);

  return { isOnline, justReconnected };
}

/* ─── Download panel ─────────────────────────────────────────────────────
   1. On open: silently pre-fetches download-info.
      - If BWM sources returned → show quality buttons with instant direct links.
      - Otherwise → show fallback 1080/720/480 buttons (never show pre-fetch errors).
   2. On quality click (fallback path):
      - If server already has a cached HLS URL → starts download immediately.
      - If watch_first: silently loads the proxy player in a hidden iframe for
        8 s to capture the HLS URL, then auto-retries → starts download.
──────────────────────────────────────────────────────────────────────── */
type DlState = 'idle' | 'priming' | 'checking' | 'converting' | 'downloading' | 'done' | 'error';
type BwmSource = { quality: string; url: string; filename: string };

function DownloadPanel({
  detailPath,
  isSeries,
  season = 0,
  ep = 1,
  title = '',
  compact = false,
  embedUrl = '',
}: {
  detailPath: string;
  isSeries: boolean;
  season?: number;
  ep?: number;
  title?: string;
  compact?: boolean;
  embedUrl?: string;
}) {
  const [open, setOpen]       = useState(false);
  const [loading, setLoading] = useState(false);
  const [sources, setSources] = useState<BwmSource[] | null>(null);
  const [busyQ, setBusyQ]     = useState<number | null>(null);
  const [state, setState]     = useState<DlState>('idle');
  const [msg, setMsg]         = useState('');
  const panelRef              = useRef<HTMLDivElement>(null);
  const iframeRef             = useRef<HTMLIFrameElement>(null);
  const loadedFor             = useRef('');

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);

  // Pre-fetch on open to check for BWM direct sources
  useEffect(() => {
    if (!open) return;
    const key = `${detailPath}:${ep}:${season}`;
    if (loadedFor.current === key) return;
    loadedFor.current = key;
    setSources(null);
    setState('idle');
    setMsg('');
    setLoading(true);
    const qs = new URLSearchParams({ resolution: '1080', ep: String(ep), season: String(season) });
    fetch(`https://movieapi.jchege.tech/download-info/${detailPath}?${qs}`,
      { signal: AbortSignal.timeout(12_000) })
      .then(r => r.json())
      .then(data => {
        if (data.available && Array.isArray(data.sources) && data.sources.length) {
          setSources(data.sources);
        }
        // Any other result (watch_first, unavailable, HLS fallback) → just show
        // the regular quality buttons silently; errors only surface on click.
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [open, detailPath, ep, season]);

  useEffect(() => { loadedFor.current = ''; }, [ep, season]);

  // Direct download for BWM sources (instant, no server)
  const downloadDirect = (src: BwmSource) => {
    const a = document.createElement('a');
    a.href = src.url;
    a.download = src.filename;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setState('done');
    setMsg('Download started!');
    setTimeout(() => { setState('idle'); setMsg(''); setBusyQ(null); }, 3000);
  };

  // Prime proxy player in hidden iframe so it reports its HLS URL to /report-video
  const primePlayer = (resolution: number) => {
    if (!embedUrl || !iframeRef.current) return;
    let url = embedUrl;
    try {
      const u = new URL(url.startsWith('http') ? url : `${window.location.origin}${url}`);
      u.searchParams.set('ep', String(ep));
      u.searchParams.set('resolution', String(resolution));
      if (season) u.searchParams.set('se', String(season));
      else u.searchParams.delete('se');
      url = u.toString();
    } catch { /* use original */ }
    iframeRef.current.src = url;
  };

  // Fallback: probe server, prime if needed, retry, then download
  const trigger = async (resolution: number) => {
    setBusyQ(resolution);
    setState('checking');
    setMsg('');

    const qs = new URLSearchParams({ resolution: String(resolution), ep: String(ep), season: String(season) });
    const infoUrl = `https://movieapi.jchege.tech/download-info/${detailPath}?${qs}`;
    const dlUrl   = `https://movieapi.jchege.tech/download/${detailPath}?${qs}`;

    const attemptDownload = async (): Promise<boolean> => {
      try {
        const res  = await fetch(infoUrl, { signal: AbortSignal.timeout(12_000) });
        const data = await res.json();
        if (!res.ok || !data.available) return false;
        if (data.watch_first) return false; // still not ready
        if (data.needs_conversion) {
          setState('converting');
          setMsg('Converting HLS → MP4…');
        } else {
          setState('downloading');
          setMsg('');
        }
        if (data.is_trailer && !isSeries) setMsg('Full movie unavailable — trailer instead.');
        const a = document.createElement('a');
        a.href = dlUrl;
        a.download = data.filename || `${title || 'movie'}_${resolution}p.mp4`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        return true;
      } catch { return false; }
    };

    try {
      // First attempt — works instantly if server already has the URL cached
      const ok = await attemptDownload();
      if (ok) {
        setState('done');
        setMsg(state === 'converting' ? 'Download started — may take a moment.' : 'Download started!');
        setBusyQ(null);
        setTimeout(() => { setState('idle'); setMsg(''); }, 4000);
        return;
      }

      // Server doesn't have the URL yet — prime the proxy player silently
      setState('priming');
      setMsg('Loading stream…');
      primePlayer(resolution);

      // Poll every 2 s for up to 10 s
      let found = false;
      for (let i = 0; i < 5; i++) {
        await new Promise(r => setTimeout(r, 2000));
        setMsg(`Loading stream… ${(i + 1) * 2}s`);
        const ok2 = await attemptDownload();
        if (ok2) { found = true; break; }
      }

      if (found) {
        setState('done');
        setMsg('Download started!');
        setBusyQ(null);
        setTimeout(() => { setState('idle'); setMsg(''); }, 4000);
      } else {
        setState('error');
        setMsg('Could not fetch stream. Try playing the episode first.');
        setBusyQ(null);
      }
    } catch {
      setState('error');
      setMsg('Connection error — please try again.');
      setBusyQ(null);
    }
  };

  const isErr  = state === 'error';
  const isBusy = busyQ !== null;

  const btnClass = compact
    ? 'px-3 py-1.5 text-xs bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors flex items-center gap-1.5'
    : 'flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors backdrop-blur-sm text-sm font-medium border border-white/10';

  const qualityLabel = (q: string) => {
    if (q === '1080p') return 'Full HD';
    if (q === '720p')  return 'HD';
    if (q === '480p')  return 'SD';
    if (q === '360p')  return 'Low';
    return '';
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Hidden iframe for priming the proxy player */}
      <iframe
        ref={iframeRef}
        className="absolute w-0 h-0 opacity-0 pointer-events-none"
        allow="autoplay"
        title="dl-prime"
        sandbox="allow-scripts allow-same-origin allow-forms"
      />

      <button
        onClick={() => { setOpen(v => !v); setState('idle'); setMsg(''); }}
        className={btnClass}
        title="Download MP4"
      >
        <Download className={compact ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
        {!compact && 'Download'}
      </button>

      {open && (
        <div className="absolute z-50 bottom-full mb-2 right-0 bg-[#1c1c1c] border border-white/10 rounded-xl shadow-2xl overflow-hidden w-56">
          {/* Header */}
          <div className="px-4 py-3 border-b border-white/[0.07] flex items-center gap-2">
            <Download className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-bold text-white/80 uppercase tracking-wider">Download MP4</span>
            {loading && <Loader2 className="w-3 h-3 animate-spin text-white/40 ml-auto" />}
          </div>

          {/* Loading skeleton while pre-fetching */}
          {loading && (
            <div className="px-4 py-3 text-[11px] text-white/40 flex items-center gap-2">
              <Loader2 className="w-3 h-3 animate-spin shrink-0" />
              Finding sources…
            </div>
          )}

          {/* BWM direct sources — instant download */}
          {!loading && sources && sources.length > 0 && (
            <div className="p-2 flex flex-col gap-1">
              {sources.map(src => (
                <button
                  key={src.quality}
                  onClick={() => downloadDirect(src)}
                  disabled={isBusy}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors disabled:opacity-50
                    bg-white/5 hover:bg-white/12 text-white`}
                >
                  <div className="text-left">
                    <span className="font-semibold">{src.quality}</span>
                    <span className="text-white/35 text-[10px] ml-2">{qualityLabel(src.quality)}</span>
                  </div>
                  <Download className="w-3.5 h-3.5 text-white/25 shrink-0" />
                </button>
              ))}
            </div>
          )}

          {/* Fallback quality buttons (works for all titles — primes if needed) */}
          {!loading && !sources && (
            <div className="p-2 flex flex-col gap-1">
              {([1080, 720, 480] as const).map(q => (
                <button
                  key={q}
                  onClick={() => trigger(q)}
                  disabled={isBusy}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors disabled:opacity-50 ${
                    busyQ === q
                      ? 'bg-primary/20 text-primary'
                      : 'bg-white/5 hover:bg-white/12 text-white'
                  }`}
                >
                  <div className="text-left">
                    <span className="font-semibold">{q}p</span>
                    <span className="text-white/35 text-[10px] ml-2">
                      {q === 1080 ? 'Full HD' : q === 720 ? 'HD' : 'SD'}
                    </span>
                  </div>
                  {busyQ === q
                    ? <Loader2 className="w-3.5 h-3.5 animate-spin text-primary shrink-0" />
                    : <Download className="w-3.5 h-3.5 text-white/25 shrink-0" />}
                </button>
              ))}
            </div>
          )}

          {/* Status / error message */}
          {(msg || state === 'converting') && (
            <div className={`mx-2 mb-2 px-3 py-2 rounded-lg text-[11px] leading-snug flex items-start gap-1.5 ${
              isErr
                ? 'bg-red-500/10 text-red-400'
                : state === 'done'
                  ? 'bg-green-500/10 text-green-400'
                  : 'bg-primary/10 text-primary/80'
            }`}>
              {(state === 'converting' || state === 'priming' || state === 'checking') &&
                <Loader2 className="w-3 h-3 animate-spin shrink-0 mt-0.5" />}
              {state === 'done' && <Check className="w-3 h-3 shrink-0 mt-0.5" />}
              <span>{msg || 'Converting HLS → MP4…'}</span>
            </div>
          )}

          <p className="px-4 pb-3 text-[10px] text-white/20 leading-snug">
            {sources ? 'Direct MP4 · No conversion needed' : 'Always delivered as .mp4'}
          </p>
        </div>
      )}
    </div>
  );
}

function useCopyLink(text: string) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return { copied, copy };
}

/* ─── Player sources ──────────────────────────────────────────────────── */
interface PlayerSource {
  label: string;
  url: string;
  hasCoverStrips: boolean;
  isProxy?: boolean;   /* true = our ad-free proxy player */
  ok?: boolean;        /* undefined = unchecked, true = working, false = failed */
  latency_ms?: number;
}

/* Build the proxy source URL (our clean ad-blocked player — always first) */
function buildProxySource(streamData: StreamData, ep = 1, season = 0): PlayerSource | null {
  const base = streamData.player?.embed_url ?? '';
  if (!base) return null;
  const u = new URL(base.startsWith('http') ? base : `${window.location.origin}${base}`);
  u.searchParams.set('ep', String(ep));
  if (season) u.searchParams.set('se', String(season)); else u.searchParams.delete('se');
  return { label: 'Server 2', url: u.toString(), hasCoverStrips: true, isProxy: true };
}

/* Fallback static sources (used while API check is in-flight or if no IMDB ID) */
function buildStaticSources(streamData: StreamData, ep = 1, season = 0): PlayerSource[] {
  const sources: PlayerSource[] = [];
  const imdb = streamData.imdb_id;
  const se = season > 0 ? season : 1;

  // Our proxy is ALWAYS first — it's ad-blocked and we control it
  const proxy = buildProxySource(streamData, ep, season);
  if (proxy) sources.push(proxy);

  if (imdb) {
    if (streamData.is_series) {
      sources.push({ label: 'Server 1', url: `https://vidsrc.to/embed/tv/${imdb}/${se}/${ep}`, hasCoverStrips: false });
      sources.push({ label: 'Server 3', url: `https://vidsrc.me/embed/tv?imdb=${imdb}&season=${se}&episode=${ep}`, hasCoverStrips: false });
      sources.push({ label: 'Server 4', url: `https://player.autoembed.cc/embed/tv/${imdb}/${se}/${ep}`, hasCoverStrips: false });
    } else {
      sources.push({ label: 'Server 1', url: `https://vidsrc.to/embed/movie/${imdb}`, hasCoverStrips: false });
      sources.push({ label: 'Server 3', url: `https://vidsrc.me/embed/movie?imdb=${imdb}`, hasCoverStrips: false });
      sources.push({ label: 'Server 4', url: `https://player.autoembed.cc/embed/movie/${imdb}`, hasCoverStrips: false });
    }
  }

  return sources;
}

/* Merge API-ranked results back into PlayerSource shape */
function rankedToSources(ranked: ServerResult[]): PlayerSource[] {
  return ranked.map(s => ({ label: s.label, url: s.url, hasCoverStrips: false, ok: s.ok, latency_ms: s.latency_ms }));
}

/* ─── Star Rating Widget ─────────────────────────────────────────────── */
function StarRatingWidget({ detailPath }: { detailPath: string }) {
  const { getRating, rate } = useRatings();
  const myRating = getRating(detailPath);
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex items-center gap-3 mb-5">
      <span className="text-xs text-white/40 font-medium">Your Rating:</span>
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map(s => (
          <button
            key={s}
            onClick={() => rate(detailPath, s === myRating ? 0 : s)}
            onMouseEnter={() => setHovered(s)}
            onMouseLeave={() => setHovered(0)}
            className="p-0.5 hover:scale-110 transition-transform"
            title={`Rate ${s} star${s !== 1 ? 's' : ''}`}
          >
            <Star className={`w-5 h-5 transition-colors ${
              s <= (hovered || myRating)
                ? 'fill-yellow-400 text-yellow-400'
                : 'fill-transparent text-white/20 hover:text-yellow-300'
            }`} />
          </button>
        ))}
      </div>
      {myRating > 0 && (
        <span className="text-xs text-yellow-400 font-bold">{myRating}/5</span>
      )}
    </div>
  );
}

/* ─── Mark as Watched Button ─────────────────────────────────────────── */
function MarkWatchedButton({ detailPath, streamData }: { detailPath: string; streamData: StreamData }) {
  const { addToHistory } = useWatchHistory();
  const [done, setDone] = useState(false);

  const markWatched = () => {
    addToHistory({
      detail_path: detailPath,
      title: streamData.title,
      poster_url: streamData.cover_url,
      type: streamData.is_series ? 'series' : 'movie',
      ep: 1,
      season: 1,
    });
    setDone(true);
    setTimeout(() => setDone(false), 2500);
  };

  return (
    <button
      onClick={markWatched}
      className={`flex items-center gap-2 px-5 py-3 font-semibold rounded-lg transition-all backdrop-blur-sm text-sm border ${
        done
          ? 'bg-green-500/20 text-green-400 border-green-500/30'
          : 'bg-white/15 text-white border-white/10 hover:bg-white/25'
      }`}
      title="Mark as watched without playing"
    >
      {done ? <Check className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      {done ? 'Marked!' : 'Watched'}
    </button>
  );
}

/* ─── Watch Modal ────────────────────────────────────────────────────────
   Full-screen player with a source switcher toolbar.
──────────────────────────────────────────────────────────────────────── */
function injectPlayerCleanup(iframe: HTMLIFrameElement) {
  try {
    const doc = iframe.contentDocument ?? iframe.contentWindow?.document;
    if (!doc || !doc.body) return false;
    const video = doc.querySelector('video');
    if (!video) return false;
    let container: HTMLElement = video as HTMLElement;
    while (
      container.parentElement &&
      container.parentElement.id !== 'app' &&
      container.parentElement !== doc.body
    ) {
      container = container.parentElement;
    }
    container.style.cssText =
      'position:fixed!important;top:0!important;left:0!important;' +
      'width:100%!important;height:100%!important;z-index:50!important;' +
      'overflow:hidden!important;background:#000!important;';
    if (container.parentElement) {
      for (const child of container.parentElement.children) {
        if (child !== container) {
          (child as HTMLElement).style.setProperty('display', 'none', 'important');
        }
      }
    }
    doc.querySelectorAll('iframe').forEach(f => {
      f.style.setProperty('display', 'none', 'important');
    });
    return true;
  } catch {
    return false;
  }
}

/* How long to wait for the iframe to fire onLoad before giving up and switching servers */
const LOAD_TIMEOUT_SECS = 18;

interface WatchConfig {
  streamData: StreamData;
  detailPath: string;
  ep: number;
  season: number;
  /** Pre-ranked sources from the combined /play/ endpoint (instant if cached). null = needs fetching. */
  preRanked: PlayerSource[] | null;
}

function WatchModal({
  config,
  shareUrl,
  onClose,
}: {
  config: WatchConfig;
  shareUrl: string;
  onClose: () => void;
}) {
  const { streamData, detailPath, ep, season, preRanked } = config;

  const [sources, setSources]     = useState<PlayerSource[]>(
    preRanked ?? buildStaticSources(streamData, ep, season),
  );
  /* checking = we need to fetch ranked servers (no preRanked, and IMDB ID exists) */
  const [checking, setChecking]   = useState(!preRanked && !!streamData.imdb_id);
  const [srcIdx, setSrcIdx]       = useState(0);
  const [loaded, setLoaded]       = useState(false);
  const [countdown, setCountdown] = useState(LOAD_TIMEOUT_SECS);
  const [reloadKey, setReloadKey]           = useState(0);
  const [stuckAfterReconnect, setStuck]     = useState(false);
  const { copied, copy }                    = useCopyLink(shareUrl);
  const iframeRef                           = React.useRef<HTMLIFrameElement>(null);
  const manualRef                           = React.useRef(false);
  const current                             = sources[srcIdx];
  const hasMore                             = srcIdx < sources.length - 1;
  const wasPreRanked                        = !!preRanked;
  const { isOnline, justReconnected }       = useNetworkStatus();

  /*
   * On network reconnect — do NOT remount the iframe.
   * Remounting destroys the browser's video buffer (everything pre-downloaded).
   * Instead, just hide the offline overlay and let the embed player's HLS buffer
   * resume naturally. After 8 s, if the user is still stuck, offer a reload.
   */
  const wasOnlineRef = useRef(isOnline);
  useEffect(() => {
    if (!wasOnlineRef.current && isOnline) {
      setStuck(false);
      const stuckTimer = setTimeout(() => setStuck(true), 8000);
      return () => clearTimeout(stuckTimer);
    }
    if (wasOnlineRef.current && !isOnline) {
      setStuck(false);          /* clear stuck state when going offline */
    }
    wasOnlineRef.current = isOnline;
  }, [isOnline]);

  /* Clear stuck flag as soon as the iframe signals it loaded successfully */
  useEffect(() => {
    if (loaded) setStuck(false);
  }, [loaded]);

  const forceReload = () => {
    setStuck(false);
    setLoaded(false);
    setCountdown(LOAD_TIMEOUT_SECS);
    manualRef.current = true;
    setReloadKey(k => k + 1);
  };

  /* Keyboard close */
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = 'unset'; window.removeEventListener('keydown', onKey); };
  }, [onClose]);

  /* ── Parent-page ad blocker ─────────────────────────────────────────────
   * Kills all ad pop-ups at the parent level while the player is open.
   * Covers: window.open, click, mousedown (fires before click — the main
   * "on-first-click popunder" vector), pointerdown, auxclick (middle-click
   * → new tab), and touchstart.
   */
  useEffect(() => {
    const AD_HOSTS = [
      'voluum','adcash','chatmate','popads','popcash','adsterra',
      'propellerads','hilltopads','exoclick','trafficjunky','juicyads',
      'plugrush','v2006','adex','afu.php','mgid','revcontent',
      'outbrain','taboola','bidvertiser','zedo',
      'phiglerdail','phigler','clickadu','monetag','richpush',
      'pushground','evadav','adoperator','trafficker','trafficshop',
    ];
    const isAd = (u: string) => AD_HOSTS.some(d => u.includes(d));

    // Kill ALL window.open — player has no reason to open new tabs
    const origOpen = window.open;
    (window as Window).open = () => null;

    // Walk up the DOM looking for ad-href ancestors
    const findAdHref = (el: HTMLElement | null): string | null => {
      for (let i = 0; i < 8 && el; i++, el = el.parentElement as HTMLElement | null) {
        const href = (el as HTMLAnchorElement).href ?? el.getAttribute?.('href') ?? '';
        if (href && isAd(href)) return href;
        // Also block _blank anchors to unknown external domains
        if (el.tagName === 'A') {
          const tgt = (el as HTMLAnchorElement).target;
          if (tgt && tgt !== '_self' && tgt !== '') return href || 'blank';
        }
      }
      return null;
    };

    const blockEv = (e: MouseEvent | TouchEvent) => {
      if (findAdHref(e.target as HTMLElement)) {
        e.stopImmediatePropagation();
        e.preventDefault();
      }
    };

    document.addEventListener('click',       blockEv as EventListener, true);
    document.addEventListener('mousedown',   blockEv as EventListener, true);
    document.addEventListener('pointerdown', blockEv as EventListener, true);
    document.addEventListener('auxclick',    blockEv as EventListener, true);
    document.addEventListener('touchstart',  blockEv as EventListener, { capture: true, passive: false });

    return () => {
      (window as Window).open = origOpen;
      (['click','mousedown','pointerdown','auxclick'] as const).forEach(ev =>
        document.removeEventListener(ev, blockEv as EventListener, true),
      );
      document.removeEventListener('touchstart', blockEv as EventListener, true);
    };
  }, []);

  /* ── Fetch ranked servers when not pre-loaded ── */
  useEffect(() => {
    if (!checking) return;
    fetchPlay(detailPath, ep, season)
      .then(res => {
        const ranked = res.servers?.servers;
        if (ranked && ranked.length > 0) {
          // Always keep our proxy first, then append external ranked servers
          const proxy = buildProxySource(streamData, ep, season);
          const external = rankedToSources(ranked).filter(s => s.label !== 'Server 4');
          setSources(proxy ? [proxy, ...external] : rankedToSources(ranked));
          setSrcIdx(0);
        }
      })
      .catch(() => { /* keep static fallback on error */ })
      .finally(() => setChecking(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* Reset iframe state when source index changes */
  useEffect(() => {
    setLoaded(false);
    setCountdown(LOAD_TIMEOUT_SECS);
    manualRef.current = false;
  }, [srcIdx]);

  /*
   * Countdown: only while iframe hasn't loaded yet.
   * onLoad fires → loaded=true → effect re-runs, returns early → no switch.
   * Never fires within LOAD_TIMEOUT_SECS → auto-switch to next server.
   */
  useEffect(() => {
    if (checking || loaded) return;
    let remaining = LOAD_TIMEOUT_SECS;
    const tick = setInterval(() => {
      remaining -= 1;
      setCountdown(remaining);
      if (remaining <= 0) {
        clearInterval(tick);
        if (!manualRef.current && hasMore) setSrcIdx(i => i + 1);
      }
    }, 1000);
    return () => clearInterval(tick);
  }, [srcIdx, loaded, hasMore, checking]);

  /* For proxy sources: poll + inject cleanup CSS after load */
  useEffect(() => {
    if (!current?.hasCoverStrips || !loaded) return;
    let attempts = 0;
    const id = setInterval(() => {
      const iframe = iframeRef.current;
      if (iframe && injectPlayerCleanup(iframe)) { clearInterval(id); return; }
      if (++attempts >= 60) clearInterval(id);
    }, 300);
    return () => clearInterval(id);
  }, [srcIdx, current?.hasCoverStrips, loaded]);

  if (!current) return null;

  const handleManualSwitch = (i: number) => {
    manualRef.current = true;
    setSrcIdx(i);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col">
      {/* ── Topbar ── */}
      <div className="flex flex-col md:flex-row md:items-center px-4 py-2 bg-black shrink-0 z-20 border-b border-white/10 gap-0 md:gap-3">

        {/* Row 1 (mobile) / left chunk (desktop): logo + close */}
        <div className="flex items-center justify-between w-full md:w-auto md:shrink-0 mb-1.5 md:mb-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-black text-primary tracking-widest">CHEGEMOVIES</span>
            {wasPreRanked && (
              <span className="flex items-center gap-0.5 text-[10px] text-green-400/80 font-semibold" title="Servers pre-ranked at page load">
                <Zap className="w-2.5 h-2.5" /> instant
              </span>
            )}
          </div>
          {/* Mobile-only quick controls */}
          <div className="flex items-center gap-1.5 md:hidden">
            <button
              onClick={forceReload}
              className="p-2 bg-white/10 rounded-full text-white/60 hover:text-white transition-colors"
              title="Reload player"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button onClick={onClose} className="p-2 bg-white/10 rounded-full text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Row 2 (mobile) / middle (desktop): server buttons */}
        <div className="flex-1 flex items-center gap-1.5 overflow-x-auto min-w-0">
          {checking ? (
            <span className="flex items-center gap-1.5 text-xs text-white/50">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
              Ranking servers…
            </span>
          ) : (
            sources.map((s, i) => (
              <button
                key={i}
                onClick={() => handleManualSwitch(i)}
                title={
                  s.isProxy ? `${s.label} — Ad-free (our server)`
                  : s.ok === false ? `${s.label} — unavailable`
                  : s.ok === true ? `${s.label} — ${s.latency_ms}ms · may contain ads`
                  : `${s.label} · may contain ads`
                }
                className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md shrink-0 transition-colors ${
                  i === srcIdx
                    ? s.isProxy ? 'bg-green-600 text-white' : 'bg-primary text-white'
                    : s.ok === false
                      ? 'bg-white/5 text-white/30 hover:bg-white/10 line-through'
                      : 'bg-white/10 text-white/60 hover:bg-white/20 hover:text-white'
                }`}
              >
                {s.isProxy && <Zap className="w-2.5 h-2.5" />}
                {!s.isProxy && s.ok === true  && i !== srcIdx && <Wifi    className="w-2.5 h-2.5 text-green-400" />}
                {!s.isProxy && s.ok === false                  && <WifiOff className="w-2.5 h-2.5 text-red-400/60" />}
                {s.label}
                {s.isProxy && <span className="text-[9px] font-normal opacity-80">ad-free</span>}
              </button>
            ))
          )}
        </div>

        {/* Desktop-only right controls */}
        <div className="hidden md:flex items-center gap-2 shrink-0">
          <button
            onClick={forceReload}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white/60 hover:text-white transition-colors"
            title="Reload player"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={copy}
            className="px-3 py-1.5 text-xs bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors flex items-center gap-1.5"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Share2 className="w-3.5 h-3.5" />}
            {copied ? 'Copied!' : 'Share'}
          </button>
          <DownloadPanel
            detailPath={detailPath}
            isSeries={streamData.is_series}
            season={season}
            ep={ep}
            title={streamData.title}
            embedUrl={streamData.player?.embed_url ?? ''}
            compact
          />
          <button onClick={onClose} className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ── Player ── */}
      <div className="relative flex-1 overflow-hidden bg-black">

        {/* Fetching ranked servers (only when not pre-loaded) */}
        {checking && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-10">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <div className="text-center">
              <p className="text-white font-semibold text-sm">Finding best server…</p>
              <p className="text-white/40 text-xs mt-1">Checking all servers in parallel</p>
            </div>
          </div>
        )}

        {/* Waiting for iframe to load */}
        {!checking && !loaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10 pointer-events-none">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="text-sm text-white/70">Loading {current.label}…</span>
            {hasMore && (
              <span className="text-xs text-white/35">
                Trying next server in <span className="text-primary font-semibold">{countdown}s</span>
              </span>
            )}
          </div>
        )}

        {/* Offline overlay — iframe stays mounted to preserve its video buffer */}
        {!isOnline && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-4 bg-black/92 backdrop-blur-sm">
            <WifiOff className="w-12 h-12 text-red-400" />
            <div className="text-center">
              <p className="text-white font-bold text-lg">No Internet Connection</p>
              <p className="text-white/40 text-sm mt-1 max-w-xs">
                Pre-buffered content may still be playing. Playback will resume automatically when you reconnect.
              </p>
            </div>
          </div>
        )}

        {/* Reconnected — player recovering from buffer */}
        {justReconnected && isOnline && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2.5 bg-green-500/90 backdrop-blur-sm text-white text-sm font-semibold px-5 py-2.5 rounded-full shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-300">
            <Wifi className="w-4 h-4" />
            Back online — resuming from buffer…
          </div>
        )}

        {/* Stuck after reconnect — offer manual reload */}
        {stuckAfterReconnect && isOnline && !justReconnected && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 bg-black/90 border border-white/15 backdrop-blur-sm text-white text-sm px-5 py-3 rounded-2xl shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-300">
            <Loader2 className="w-4 h-4 animate-spin text-primary shrink-0" />
            <span className="text-white/70">Player seems stuck</span>
            <button
              onClick={forceReload}
              className="bg-primary hover:bg-red-700 text-white font-semibold px-4 py-1.5 rounded-lg text-xs transition-colors"
            >
              Reload Player
            </button>
          </div>
        )}

        {/* Iframe — stays mounted through network drops to preserve video buffer */}
        {!checking && (
          <iframe
            ref={iframeRef}
            key={`${srcIdx}-${reloadKey}-${current.url}`}
            src={current.url}
            className={`absolute inset-0 w-full h-full border-0 transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
            allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
            allowFullScreen
            referrerPolicy="no-referrer"
            title="Movie Player"
            data-testid="iframe-player"
            onLoad={() => setLoaded(true)}
          />
        )}

        {/* Cover strips for proxy sources */}
        {current.hasCoverStrips && loaded && (
          <>
            <div className="absolute top-0 left-0 right-0 h-10 bg-black pointer-events-none z-20" />
            <div className="absolute top-0 right-0 bottom-0 w-[30%] bg-black pointer-events-none z-20" />
            <div className="absolute bottom-0 left-0 right-[30%] h-[52%] bg-black pointer-events-none z-20" />
          </>
        )}
      </div>
    </div>
  );
}

/* ─── Movie Detail Page ───────────────────────────────────────────────── */
export default function MovieDetail() {
  const [, params] = useRoute('/movie/:detailPath');
  const detailPath = params?.detailPath ? decodeURIComponent(params.detailPath) : '';

  /* usePlayData = stream metadata + pre-ranked servers in one request */
  const { data: playData, isLoading, error } = usePlayData(detailPath);
  const streamData = playData?.stream ?? null;
  const { data: similarData, isLoading: similarLoading } = useSimilar(detailPath, 14);
  const { addToHistory } = useWatchHistory();
  const { toggleWatchlist, isInWatchlist } = useWatchlist();

  const [watchConfig,    setWatchConfig]    = useState<WatchConfig | null>(null);
  const [trailerOpen,    setTrailerOpen]    = useState(false);
  const [dlEp,           setDlEp]           = useState(1);
  const [dlSeason,       setDlSeason]       = useState(0);
  const pageUrl = typeof window !== 'undefined' ? window.location.href : '';
  const { copied: pageCopied, copy: copyPageLink } = useCopyLink(pageUrl);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex-1 flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (error || !streamData) {
    return (
      <Layout>
        <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
          <Info className="w-12 h-12 text-destructive mb-4" />
          <h1 className="text-2xl font-bold mb-2">Title Not Found</h1>
          <p className="text-muted-foreground">We couldn't load the details for this title.</p>
        </div>
      </Layout>
    );
  }

  const handleWatch = (epNum = 1, seasonNum = 0) => {
    if (!streamData) return;
    const isDefault = epNum === 1 && (seasonNum === 0 || seasonNum === 1);
    const preRanked = isDefault && playData?.servers?.servers
      ? rankedToSources(playData.servers.servers)
      : null;
    addToHistory({
      detail_path: detailPath,
      title: streamData.title,
      poster_url: streamData.cover_url,
      type: streamData.is_series ? 'series' : 'movie',
      ep: epNum,
      season: seasonNum || 1,
    });
    // Track which episode is being watched so download uses correct ep/season
    setDlEp(epNum);
    setDlSeason(seasonNum || (streamData.seasons?.[0]?.season ?? 0));
    setWatchConfig({ streamData, detailPath, ep: epNum, season: seasonNum, preRanked });
  };

  const backdrop = streamData.stills_url || streamData.cover_url || streamData.trailer?.thumbnail;
  const genres = streamData.genre
    ? streamData.genre.split(',').map((g: string) => g.trim()).filter(Boolean)
    : [];
  const year = streamData.release_date ? streamData.release_date.slice(0, 4) : null;

  return (
    <Layout>
      {watchConfig && (
        <WatchModal
          config={watchConfig}
          shareUrl={pageUrl}
          onClose={() => setWatchConfig(null)}
        />
      )}

      {/* ── Hero — zone.bwmxmd.co.ke style ── */}
      <div className="relative w-full h-screen min-h-[600px] flex items-end">
        {/* Backdrop */}
        {backdrop ? (
          <img
            src={backdrop}
            alt={streamData.title}
            className="absolute inset-0 w-full h-full object-cover object-top"
          />
        ) : (
          <div className="absolute inset-0 bg-[#111]" />
        )}

        {/* Cinematic gradients */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/60 to-black/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

        {/* ── Bottom content — two-column on desktop, stacked on mobile ── */}
        <div className="relative z-10 w-full px-5 md:px-14 pb-20 md:pb-14 flex items-end justify-between gap-6">

          {/* Left: metadata + title */}
          <div className="max-w-xl">
            {/* Badges row */}
            <div className="flex items-center gap-2.5 mb-3">
              <span className={`text-[11px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                streamData.is_series ? 'bg-violet-600 text-white' : 'bg-red-600 text-white'
              }`}>
                {streamData.is_series ? 'SERIES' : 'MOVIE'}
              </span>
              {year && (
                <span className="text-sm font-semibold text-white/70">{year}</span>
              )}
              {streamData.imdb_rating && (
                <span className="flex items-center gap-1 text-sm font-bold text-yellow-400">
                  <Star className="w-3.5 h-3.5 fill-yellow-400" />
                  {streamData.imdb_rating}
                </span>
              )}
              {streamData.country && (
                <span className="text-xs text-white/40 font-medium">{streamData.country}</span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-[3.25rem] font-black text-white leading-tight mb-2.5 drop-shadow-lg">
              {streamData.title}
            </h1>

            {/* Genres — dot separated like zone */}
            {genres.length > 0 && (
              <p className="text-[13px] text-white/50 font-medium mb-4 tracking-wide">
                {genres.slice(0, 4).map((g, i) => (
                  <React.Fragment key={g}>
                    <Link href={`/browse/all?genre=${encodeURIComponent(g)}`}>
                      <span className="hover:text-white transition-colors cursor-pointer">{g}</span>
                    </Link>
                    {i < Math.min(genres.length, 4) - 1 && (
                      <span className="mx-1.5 text-white/25">•</span>
                    )}
                  </React.Fragment>
                ))}
              </p>
            )}

            {/* Description */}
            {streamData.description && (
              <p className="text-sm text-white/60 line-clamp-3 leading-relaxed max-w-md mb-6">
                {streamData.description}
              </p>
            )}

            {/* Star rating */}
            <StarRatingWidget detailPath={detailPath} />
          </div>

          {/* Right: action buttons — zone style — hidden on mobile (mobile uses sticky CTA) */}
          <div className="hidden md:flex flex-col items-end gap-3 shrink-0">
            {/* Primary Watch Now — big red zone-style */}
            <button
              onClick={() => handleWatch()}
              data-testid="button-watch-now"
              className="flex items-center gap-3 px-8 py-4 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition-all text-base shadow-2xl shadow-red-900/50 hover:scale-[1.03] active:scale-100"
            >
              <Play className="w-5 h-5 fill-white" />
              {streamData.is_series ? 'Watch Series' : 'Watch Now'}
            </button>

            {/* Secondary actions row */}
            <div className="flex items-center gap-2">
              {/* Trailer */}
              <button
                onClick={() => {
                  if (streamData.trailer?.url) {
                    setTrailerOpen(true);
                  } else {
                    const q = encodeURIComponent(`${streamData.title}${year ? ` ${year}` : ''} official trailer`);
                    window.open(`https://www.youtube.com/results?search_query=${q}`, '_blank', 'noopener');
                  }
                }}
                title="Trailer"
                className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors backdrop-blur-sm text-sm font-medium border border-white/10"
              >
                <Film className="w-4 h-4" /> Trailer
              </button>

              {/* Watchlist */}
              <button
                onClick={() => toggleWatchlist({
                  detail_path: detailPath,
                  title:       streamData.title,
                  poster_url:  streamData.cover_url,
                  type:        streamData.is_series ? 'series' : 'movie',
                  imdb_rating: streamData.imdb_rating,
                  year:        streamData.release_date?.slice(0, 4),
                })}
                title={isInWatchlist(detailPath) ? 'Remove from watchlist' : 'Add to watchlist'}
                className={`p-2.5 rounded-lg transition-colors backdrop-blur-sm border ${
                  isInWatchlist(detailPath)
                    ? 'bg-primary/20 text-primary border-primary/40 hover:bg-primary/30'
                    : 'bg-white/10 text-white border-white/10 hover:bg-white/20'
                }`}
              >
                {isInWatchlist(detailPath) ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
              </button>

              {/* Mark Watched */}
              <MarkWatchedButton detailPath={detailPath} streamData={streamData} />

              {/* Share */}
              <button
                onClick={copyPageLink}
                data-testid="button-share"
                title="Copy link"
                className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors backdrop-blur-sm border border-white/10"
              >
                {pageCopied ? <Check className="w-4 h-4 text-green-400" /> : <Share2 className="w-4 h-4" />}
              </button>

              {/* Download */}
              <DownloadPanel
                detailPath={detailPath}
                isSeries={streamData.is_series}
                season={dlSeason}
                ep={dlEp}
                title={streamData.title}
                embedUrl={streamData.player?.embed_url ?? ''}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile sticky action bar ── */}
      <div className="md:hidden fixed bottom-[56px] left-0 right-0 px-4 pb-2 pt-2 bg-gradient-to-t from-[#0a0a0a] to-transparent z-30">
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleWatch()}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary text-white font-bold rounded-xl text-sm shadow-lg shadow-primary/30"
          >
            <Play className="w-4 h-4 fill-white" />
            {streamData.is_series ? 'Watch Series' : 'Watch Now'}
          </button>
          <button
            onClick={() => {
              if (streamData.trailer?.url) setTrailerOpen(true);
              else {
                const q = encodeURIComponent(`${streamData.title}${year ? ` ${year}` : ''} official trailer`);
                window.open(`https://www.youtube.com/results?search_query=${q}`, '_blank', 'noopener');
              }
            }}
            className="flex items-center gap-1.5 px-4 py-3 bg-white/10 text-white rounded-xl text-sm font-medium border border-white/10"
          >
            <Film className="w-4 h-4" />
          </button>
          <button
            onClick={() => toggleWatchlist({
              detail_path: detailPath,
              title: streamData.title,
              poster_url: streamData.cover_url,
              type: streamData.is_series ? 'series' : 'movie',
              imdb_rating: streamData.imdb_rating,
              year: streamData.release_date?.slice(0, 4),
            })}
            className={`p-3 rounded-xl border text-sm transition-colors ${
              isInWatchlist(detailPath)
                ? 'bg-primary/20 text-primary border-primary/40'
                : 'bg-white/10 text-white border-white/10'
            }`}
          >
            {isInWatchlist(detailPath) ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* ── Trailer modal ── */}
      {trailerOpen && streamData.trailer?.url && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm px-4">
          <div className="relative w-full max-w-3xl rounded-xl overflow-hidden shadow-2xl">
            <div className="aspect-video w-full bg-black">
              <iframe
                src={streamData.trailer.url}
                className="w-full h-full"
                allow="autoplay; fullscreen"
                allowFullScreen
                title={`${streamData.title} — Trailer`}
              />
            </div>
            <button
              onClick={() => setTrailerOpen(false)}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── Body ── */}
      <div className="px-6 md:px-14 pb-24 -mt-4 relative z-10">

        {/* ── Episodes ── */}
        {streamData.is_series && streamData.seasons?.length > 0 && (
          <div className="mb-14">
            <h2 className="text-xl font-bold mb-5 text-white">Episodes</h2>
            <Tabs defaultValue={streamData.seasons[0].season.toString()}>
              <ScrollArea className="w-full mb-5">
                <TabsList className="bg-transparent border-b border-white/10 rounded-none h-auto p-0 w-max space-x-6">
                  {streamData.seasons.map((season: { season: number; episode_count: number }) => (
                    <TabsTrigger
                      key={season.season}
                      value={season.season.toString()}
                      className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 py-3 text-sm text-white/60 data-[state=active]:text-white"
                    >
                      Season {season.season}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </ScrollArea>

              {streamData.seasons.map((season: { season: number; episode_count: number }) => (
                <TabsContent key={season.season} value={season.season.toString()} className="mt-0">
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-2.5">
                    {Array.from({ length: season.episode_count }).map((_, i) => {
                      const epNum = i + 1;
                      return (
                        <button
                          key={epNum}
                          onClick={() => handleWatch(epNum, season.season)}
                          className="flex items-center justify-between p-3.5 rounded-xl bg-white/5 border border-white/10 hover:border-primary/50 hover:bg-primary/10 transition-colors group text-left"
                          data-testid={`button-watch-ep-${epNum}`}
                        >
                          <span className="font-medium text-white/70 group-hover:text-white text-xs">
                            Ep {epNum}
                          </span>
                          <Play className="w-3 h-3 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      );
                    })}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        )}

        {/* ── Similar Titles ── */}
        <div>
          <div className="flex items-center gap-2 mb-5">
            <h2 className="text-lg font-bold text-white/90">More Like This</h2>
            {similarData?.based_on && similarData.based_on.length > 0 && (
              <span className="text-xs text-white/35 font-medium">
                based on {similarData.based_on.slice(0, 2).join(', ')}
              </span>
            )}
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-3">
            {similarLoading
              ? Array.from({ length: 7 }).map((_, i) => <MovieCardSkeleton key={i} />)
              : similarData?.similar?.length
                ? similarData.similar.map((movie: any, i: number) => (
                    <MovieCard key={movie.id} movie={movie} index={i} />
                  ))
                : <p className="text-muted-foreground col-span-full text-sm">No similar titles found.</p>
            }
          </div>
        </div>
      </div>
    </Layout>
  );
}
