import React, { useState, useEffect, useRef } from 'react';
import { useRoute, Link } from 'wouter';
import { usePlayData, useSimilar } from '@/hooks/use-movies';
import { useWatchHistory } from '@/hooks/use-watch-history';
import { useWatchlist } from '@/hooks/use-watchlist';
import type { StreamData } from '@/lib/api';
import { Layout } from '@/components/layout';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Play, X, Loader2, Info, Share2, Check, RefreshCw, Wifi, WifiOff, Bookmark, BookmarkCheck, Film, Star, Eye, Download, Maximize, Minimize, HardDrive } from 'lucide-react';
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
type DlState = 'idle' | 'queued' | 'downloading' | 'ready' | 'done' | 'error';

const API = 'https://movieapi.jchege.tech';

function DownloadPanel({
  detailPath,
  season = 0,
  ep = 1,
  compact = false,
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
  const [state, setState]     = useState<DlState>('idle');
  const [msg, setMsg]         = useState('');
  const [progress, setProgress] = useState(0);
  const [busyQ, setBusyQ]     = useState<number | null>(null);
  const [jobId, setJobId]     = useState<string | null>(null);
  const [dlUrl, setDlUrl]     = useState<string | null>(null);
  const panelRef              = useRef<HTMLDivElement>(null);
  const pollRef               = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  // Reset state when episode changes
  useEffect(() => {
    if (pollRef.current) clearTimeout(pollRef.current);
    setState('idle'); setMsg(''); setBusyQ(null); setProgress(0); setJobId(null); setDlUrl(null);
  }, [ep, season]);

  // Cleanup poll on unmount
  useEffect(() => () => { if (pollRef.current) clearTimeout(pollRef.current); }, []);

  const reset = (delay = 8000) => setTimeout(() => {
    setState('idle'); setMsg(''); setBusyQ(null); setProgress(0); setJobId(null); setDlUrl(null);
  }, delay);

  const poll = (jid: string) => {
    pollRef.current = setTimeout(async () => {
      try {
        const r    = await fetch(`${API}/download-job/${jid}`);
        const data = await r.json();

        if (data.status === 'ready') {
          const url = `${API}/download-file/${jid}`;
          setDlUrl(url);
          setProgress(100);
          setState('ready');
          setMsg(`Ready — ${data.size_mb ?? '?'} MB. Tap below to save.`);
        } else if (data.status === 'error') {
          setState('error');
          setMsg(data.error || 'Download failed on server.');
          reset(6000);
        } else {
          const pct = data.progress ?? 0;
          setProgress(pct);
          setState('downloading');
          setMsg(`Saving to server… ${pct.toFixed(0)}%`);
          poll(jid);
        }
      } catch {
        setState('error');
        setMsg('Lost connection to server.');
        reset(5000);
      }
    }, 1800);
  };

  const startDownload = async (resolution: number) => {
    if (busyQ !== null) return;
    setBusyQ(resolution);
    setState('queued');
    setProgress(0);
    setMsg('Starting…');

    const qs = new URLSearchParams({
      resolution: String(resolution),
      ep:         String(ep),
      season:     String(season),
    });

    try {
      const res  = await fetch(`${API}/prepare-download/${detailPath}?${qs}`, { method: 'POST' });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `Server error ${res.status}`);
      }
      const data = await res.json();
      const jid  = data.job_id as string;
      setJobId(jid);

      if (data.status === 'ready') {
        // Already on disk — serve immediately
        const url = `${API}/download-file/${jid}`;
        setDlUrl(url);
        setProgress(100);
        setState('ready');
        setMsg('Already cached. Tap below to save.');
      } else {
        setState('queued');
        setMsg('Queued — downloading to server…');
        poll(jid);
      }
    } catch (e: unknown) {
      setState('error');
      setMsg(e instanceof Error ? e.message : 'Failed to start download.');
      reset(5000);
    }
  };

  const saveToDevice = () => {
    if (!dlUrl) return;
    window.open(dlUrl, '_blank');
    setState('done');
    setMsg('Saving to your Downloads folder…');
    reset(7000);
  };

  const isErr  = state === 'error';
  const isBusy = busyQ !== null && state !== 'ready' && state !== 'done' && state !== 'error';
  const isActive = state === 'queued' || state === 'downloading';

  const btnClass = compact
    ? 'px-3 py-1.5 text-xs bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors flex items-center gap-1.5'
    : 'flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors backdrop-blur-sm text-sm font-medium border border-white/10';

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => { setOpen(v => !v); }}
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
            <span className="text-xs font-bold text-white/80 uppercase tracking-wider">Download</span>
          </div>

          {/* Quality buttons — shown when idle or error */}
          {(state === 'idle' || isErr) && (
            <div className="p-2 flex flex-col gap-1">
              {([1080, 720, 480] as const).map(q => (
                <button
                  key={q}
                  onClick={() => startDownload(q)}
                  disabled={isBusy}
                  className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors bg-white/5 hover:bg-white/12 text-white disabled:opacity-40"
                >
                  <div className="text-left">
                    <span className="font-semibold">{q}p</span>
                    <span className="text-white/35 text-[10px] ml-2">
                      {q === 1080 ? 'Full HD' : q === 720 ? 'HD' : 'SD'}
                    </span>
                  </div>
                  <Download className="w-3.5 h-3.5 text-white/25 shrink-0" />
                </button>
              ))}
            </div>
          )}

          {/* Progress section — while downloading */}
          {isActive && (
            <div className="p-3 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-primary shrink-0" />
                <span className="text-[11px] text-white/70">{msg}</span>
              </div>
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-700"
                  style={{ width: `${Math.max(progress, state === 'queued' ? 3 : 5)}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-white/30">
                <span>Server is downloading…</span>
                <span>{progress.toFixed(0)}%</span>
              </div>
            </div>
          )}

          {/* Ready — user must tap to save (direct gesture avoids popup blockers) */}
          {state === 'ready' && (
            <div className="p-3 flex flex-col gap-2">
              <p className="text-[11px] text-white/60 px-1">{msg}</p>
              <button
                onClick={saveToDevice}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-primary text-black font-semibold text-sm hover:bg-primary/90 transition-colors"
              >
                <Download className="w-4 h-4" />
                Save to Device
              </button>
            </div>
          )}

          {/* Status message for done / error */}
          {(state === 'done' || isErr) && msg && (
            <div className={`mx-2 mb-2 px-3 py-2 rounded-lg text-[11px] leading-snug flex items-start gap-1.5 ${
              isErr ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'
            }`}>
              {state === 'done' && <Check className="w-3 h-3 shrink-0 mt-0.5" />}
              <span>{msg}</span>
            </div>
          )}

          <p className="px-4 pb-3 text-[10px] text-white/20">Downloads via server — always works</p>
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

/* ─── Watch Modal ─────────────────────────────────────────────────────────
   VPS-only player. Polls /download-info every 8 s until file is ready,
   then auto-plays from disk. No external servers, no ads.
──────────────────────────────────────────────────────────────────────── */
interface WatchConfig {
  streamData: StreamData;
  detailPath: string;
  ep: number;
  season: number;
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
  const { streamData, detailPath, ep, season } = config;
  const API = 'https://movieapi.jchege.tech';

  const [localStreamUrl, setLocalStreamUrl] = useState<string | null>(null);
  const [dlStatus, setDlStatus]             = useState('Checking server…');
  const [loaded, setLoaded]                 = useState(false);
  const [isFullscreen, setIsFullscreen]     = useState(false);
  const { copied, copy }                    = useCopyLink(shareUrl);
  const { isOnline, justReconnected }       = useNetworkStatus();
  const videoRef  = React.useRef<HTMLVideoElement>(null);
  const modalRef  = React.useRef<HTMLDivElement>(null);

  /* Poll /download-info every 8 s until local file is ready, then auto-play */
  useEffect(() => {
    let cancelled = false;
    let attempt   = 0;
    let timer: ReturnType<typeof setTimeout>;

    const check = async () => {
      if (cancelled) return;
      attempt++;
      try {
        const res  = await fetch(
          `${API}/download-info/${encodeURIComponent(detailPath)}?ep=${ep}&season=${season}`
        );
        if (!res.ok || cancelled) return;
        const json = await res.json();
        if (json.local === true && !cancelled) {
          setLocalStreamUrl(`${API}/stream-video/${encodeURIComponent(detailPath)}?ep=${ep}&season=${season}`);
          return;
        }
        if (!cancelled) {
          if (attempt === 1) setDlStatus('Queuing download to your server…');
          else if (attempt <= 4) setDlStatus('Downloading HD copy to your server…');
          else setDlStatus(`Downloading… (${Math.round(attempt * 8 / 60)} min so far)`);
        }
      } catch {
        if (!cancelled) setDlStatus('Connecting to server…');
      }
      if (!cancelled) timer = setTimeout(check, 8000);
    };

    check();
    return () => { cancelled = true; clearTimeout(timer); };
  }, [detailPath, ep, season]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      (modalRef.current ?? document.documentElement).requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  };

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  /* Keyboard shortcuts: Esc = close, F = fullscreen */
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !document.fullscreenElement) onClose();
      if (e.key === 'f' || e.key === 'F') toggleFullscreen();
    };
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = 'unset'; window.removeEventListener('keydown', onKey); };
  }, [onClose]);

  const poster = streamData.cover_url ?? '';

  return (
    <div ref={modalRef} className="fixed inset-0 z-[100] bg-black flex flex-col">

      {/* ── Topbar ── */}
      <div className="flex items-center px-4 py-2 bg-black/95 shrink-0 z-20 border-b border-white/10 gap-3">
        <span className="text-sm font-black text-primary tracking-widest shrink-0">CHEGEMOVIES</span>

        {/* Status / title */}
        <div className="flex-1 flex items-center gap-2 min-w-0 overflow-hidden">
          {localStreamUrl ? (
            <span className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md bg-green-600 text-white shrink-0">
              <HardDrive className="w-3 h-3" />
              Your Server · ad-free
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-xs text-white/50 shrink-0">
              <Loader2 className="w-3 h-3 animate-spin text-primary" />
              {dlStatus}
            </span>
          )}
          <span className="text-white/25 text-xs truncate hidden md:block">{streamData.title}</span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          {localStreamUrl && (
            <button
              onClick={() => { setLoaded(false); const u = localStreamUrl; setLocalStreamUrl(null); setTimeout(() => setLocalStreamUrl(u), 60); }}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white/60 hover:text-white transition-colors"
              title="Reload"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={copy}
            className="px-3 py-1.5 text-xs bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors flex items-center gap-1.5"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Share2 className="w-3.5 h-3.5" />}
            <span className="hidden md:inline">{copied ? 'Copied!' : 'Share'}</span>
          </button>
          <DownloadPanel
            detailPath={detailPath}
            isSeries={streamData.is_series}
            season={season}
            ep={ep}
            title={streamData.title}
            embedUrl=""
            compact
          />
          <button
            onClick={toggleFullscreen}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white/60 hover:text-white transition-colors"
            title={isFullscreen ? 'Exit fullscreen (Esc)' : 'Fullscreen (F)'}
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
          <button onClick={onClose} className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors" title="Close (Esc)">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ── Player area ── */}
      <div className="relative flex-1 overflow-hidden bg-black">

        {/* Offline overlay */}
        {!isOnline && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-4 bg-black/92 backdrop-blur-sm">
            <WifiOff className="w-12 h-12 text-red-400" />
            <div className="text-center">
              <p className="text-white font-bold text-lg">No Internet Connection</p>
              <p className="text-white/40 text-sm mt-1 max-w-xs">Video will resume automatically when you reconnect.</p>
            </div>
          </div>
        )}

        {/* Back-online toast */}
        {justReconnected && isOnline && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2.5 bg-green-500/90 backdrop-blur-sm text-white text-sm font-semibold px-5 py-2.5 rounded-full shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-300">
            <Wifi className="w-4 h-4" />
            Back online — resuming…
          </div>
        )}

        {/* Preparing screen — shown while file is being downloaded to VPS */}
        {!localStreamUrl && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 z-10">
            {poster && (
              <div
                className="absolute inset-0 bg-cover bg-center opacity-[0.07] blur-2xl scale-110 pointer-events-none"
                style={{ backgroundImage: `url(${poster})` }}
              />
            )}
            <div className="relative z-10 flex flex-col items-center gap-5 px-8 text-center max-w-sm">
              <div className="relative w-20 h-20">
                <div className="absolute inset-0 rounded-full border-2 border-white/10" />
                <div className="absolute inset-0 rounded-full border-2 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <HardDrive className="w-7 h-7 text-white/50" />
                </div>
              </div>
              <div>
                <p className="text-white font-bold text-lg leading-tight mb-2">{streamData.title}</p>
                <p className="text-primary text-sm font-medium">{dlStatus}</p>
                <p className="text-white/30 text-xs mt-3 leading-relaxed">
                  Your server is fetching a full HD copy.<br />
                  This page will auto-play the moment it's ready.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Buffering spinner while video element initialises */}
        {localStreamUrl && !loaded && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <Loader2 className="w-10 h-10 animate-spin text-primary opacity-70" />
          </div>
        )}

        {/* Native video — streamed directly from VPS disk */}
        {localStreamUrl && (
          <video
            ref={videoRef}
            key={localStreamUrl}
            src={localStreamUrl}
            className="absolute inset-0 w-full h-full bg-black"
            controls
            autoPlay
            playsInline
            onCanPlay={() => setLoaded(true)}
            style={{ outline: 'none' }}
          />
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
    addToHistory({
      detail_path: detailPath,
      title: streamData.title,
      poster_url: streamData.cover_url,
      type: streamData.is_series ? 'series' : 'movie',
      ep: epNum,
      season: seasonNum || 1,
    });
    setDlEp(epNum);
    setDlSeason(Number(seasonNum || streamData.seasons?.[0]?.season || 0));
    setWatchConfig({ streamData, detailPath, ep: epNum, season: seasonNum });
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
        {streamData.is_series && (streamData.seasons?.length ?? 0) > 0 && (
          <div className="mb-14">
            <h2 className="text-xl font-bold mb-5 text-white">Episodes</h2>
            <Tabs defaultValue={streamData.seasons![0].season.toString()}>
              <ScrollArea className="w-full mb-5">
                <TabsList className="bg-transparent border-b border-white/10 rounded-none h-auto p-0 w-max space-x-6">
                  {streamData.seasons!.map((season: { season: number; episode_count: number }) => (
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

              {streamData.seasons!.map((season: { season: number; episode_count: number }) => (
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
